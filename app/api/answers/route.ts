import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateLevel } from "@/lib/utils";

interface AnswerRequest {
  question_id: string;
  user_answer: "A" | "B" | "C" | "D";
  pomodoro_session_id?: string;
}

/**
 * 将日文假名答案转换为 ABCD 格式
 * 支持的映射：
 * ア (a) → A
 * イ (i) → B
 * ウ (u) → C
 * エ (e) → D
 *
 * 如果已经是 ABCD 格式，直接返回
 */
function normalizeAnswer(answer: string): "A" | "B" | "C" | "D" {
  const upperAnswer = answer.toUpperCase().trim();

  // 如果已经是 ABCD，直接返回
  if (["A", "B", "C", "D"].includes(upperAnswer)) {
    return upperAnswer as "A" | "B" | "C" | "D";
  }

  // 日文假名映射到 ABCD
  const japaneseToAbcd: { [key: string]: "A" | "B" | "C" | "D" } = {
    "ア": "A",
    "イ": "B",
    "ウ": "C",
    "エ": "D",
  };

  const normalized = japaneseToAbcd[upperAnswer];
  if (normalized) {
    return normalized;
  }

  // 如果无法识别，返回 A 作为默认值（不应该发生）
  console.warn(`Unknown answer format: ${answer}, defaulting to A`);
  return "A";
}

export async function POST(request: NextRequest) {
  try {
    // 初始化 Supabase 客户端（使用服务角色密钥绕过 RLS）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // 使用服务角色密钥创建客户端（API 层可以绕过 RLS）
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取认证用户信息
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 使用 auth header 获取用户信息
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // 解析请求体
    const body: AnswerRequest = await request.json();
    const { question_id, user_answer, pomodoro_session_id } = body;

    if (!question_id || !user_answer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 第 1 步：从 questions 表获取题目信息（获取正确答案）
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("correct_answer")
      .eq("id", question_id)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Normalize both answers to ABCD format for comparison
    const normalizedCorrectAnswer = normalizeAnswer(question.correct_answer);
    const isCorrect = user_answer === normalizedCorrectAnswer;

    // 第 2 步：在 question_attempts 表中插入新记录（保留答题历史）
    const { error: attemptError } = await supabase
      .from("question_attempts")
      .insert({
        user_id: userId,
        question_id: question_id,
        user_answer: user_answer,
        is_correct: isCorrect,
        pomodoro_session_id: pomodoro_session_id || null,
        created_at: new Date().toISOString(),
      });

    if (attemptError) {
      console.error("Error inserting question attempt:", attemptError);
      return NextResponse.json(
        { error: "Failed to save attempt" },
        { status: 500 }
      );
    }

    // 第 3 步：在 user_progress 表中更新或插入记录
    const { data: existingProgress, error: fetchError } = await supabase
      .from("user_progress")
      .select(
        "id, attempt_count, is_correct, consecutive_correct_count, status"
      )
      .eq("user_id", userId)
      .eq("question_id", question_id)
      .single();

    let consecutiveCorrectCount = 0;
    let newStatus = "normal";
    let xpGained = 0;

    if (!fetchError && existingProgress) {
      // 更新现有记录
      consecutiveCorrectCount = existingProgress.consecutive_correct_count || 0;

      if (isCorrect) {
        consecutiveCorrectCount += 1;
        xpGained = 10; // 答对获得 10 XP

        // 第 4 步：检查连续答对是否达到 3 次，升级为已掌握
        if (consecutiveCorrectCount >= 3 && existingProgress.status === "wrong_book") {
          newStatus = "mastered";
        } else if (existingProgress.status === "wrong_book") {
          // 在 wrong_book 状态下答对，但还没达到 3 次，保持 wrong_book
          newStatus = "wrong_book";
        } else if (existingProgress.status === "normal") {
          // 在 normal 状态下答对，保持 normal
          newStatus = "normal";
        } else if (existingProgress.status === "mastered") {
          // 已经掌握，保持 mastered
          newStatus = "mastered";
        }
      } else {
        // 答错时，重置连续答对计数
        consecutiveCorrectCount = 0;
        // 答错时，无论之前是什么状态，都标记为错题本
        // 即使之前是 mastered，答错了也说明还没真正掌握
        newStatus = "wrong_book";
      }

      const { error: updateError } = await supabase
        .from("user_progress")
        .update({
          user_answer: user_answer,
          attempt_count: (existingProgress.attempt_count || 0) + 1,
          is_correct: isCorrect,
          consecutive_correct_count: consecutiveCorrectCount,
          status: newStatus,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", existingProgress.id);

      if (updateError) {
        console.error("Error updating user progress:", updateError);
        return NextResponse.json(
          { error: "Failed to update progress" },
          { status: 500 }
        );
      }
    } else {
      // 创建新记录
      if (isCorrect) {
        consecutiveCorrectCount = 1;
        xpGained = 10;
        newStatus = "normal";
      } else {
        consecutiveCorrectCount = 0;
        newStatus = "wrong_book";
      }

      const { error: insertError } = await supabase
        .from("user_progress")
        .insert({
          user_id: userId,
          question_id: question_id,
          user_answer: user_answer,
          attempt_count: 1,
          is_correct: isCorrect,
          consecutive_correct_count: consecutiveCorrectCount,
          status: newStatus,
          last_attempt_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error inserting user progress:", insertError);
        return NextResponse.json(
          { error: "Failed to save progress" },
          { status: 500 }
        );
      }
    }

    // 第 5 步：更新 profiles 表的 xp、streak_days 和 current_streak
    let responseLevelUp = false;
    let responseLevel = undefined;
    let responseXp = undefined;
    let responseStreakDays = undefined;
    let responseCurrentStreak = 0;

    // 获取用户的 profile（包含 last_answer_date、streak_days 和 current_streak）
    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("xp, level, streak_days, last_answer_date, current_streak")
      .eq("id", userId)
      .single();

    if (!profileFetchError && profile) {
      // 计算新的 XP 和等级
      const newXp = (profile.xp || 0) + xpGained;
      const newLevel = calculateLevel(newXp);
      responseLevelUp = newLevel > (profile.level || 1);
      responseLevel = newLevel;
      responseXp = newXp;

      // 计算连续打卡天数
      const today = new Date().toISOString().split('T')[0]; // 获取今天的日期 (YYYY-MM-DD)
      const lastAnswerDate = profile.last_answer_date;
      let newStreakDays = profile.streak_days || 0;

      // 如果今天首次答题
      if (lastAnswerDate !== today) {
        if (lastAnswerDate) {
          // 计算日期差
          const lastDate = new Date(lastAnswerDate);
          const todayDate = new Date(today);
          const diffTime = todayDate.getTime() - lastDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // 连续打卡：昨天答题了，今天继续
            newStreakDays += 1;
          } else {
            // 打卡中断：重新开始计数
            newStreakDays = 1;
          }
        } else {
          // 第一次答题
          newStreakDays = 1;
        }

        responseStreakDays = newStreakDays;
      } else {
        // 今天已经答过题了，不更新 streak_days
        responseStreakDays = newStreakDays;
      }

      // 计算全局连胜数（当前连续答对了几道题）
      let newCurrentStreak = profile.current_streak || 0;
      if (isCorrect) {
        // 答对：连胜数 +1
        newCurrentStreak += 1;
      } else {
        // 答错：连胜数重置为 0
        newCurrentStreak = 0;
      }
      responseCurrentStreak = newCurrentStreak;

      // 更新 profiles 表
      const updateData: {
        xp: number;
        level: number;
        current_streak: number;
        streak_days?: number;
        last_answer_date?: string;
      } = {
        xp: newXp,
        level: newLevel,
        current_streak: newCurrentStreak, // 每次答题都更新全局连胜数
      };

      // 如果今天首次答题，更新 streak_days 和 last_answer_date
      if (lastAnswerDate !== today) {
        updateData.streak_days = newStreakDays;
        updateData.last_answer_date = today;
      }

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (profileUpdateError) {
        console.error("Error updating profile:", profileUpdateError);
        // 不返回错误，profile 更新是辅助性的
      }
    }

    // 返回成功响应
    return NextResponse.json({
      success: true,
      is_correct: isCorrect,
      xp_gained: isCorrect ? 10 : 0,
      correct_answer: normalizedCorrectAnswer,
      level_up: responseLevelUp,
      new_level: responseLevel,
      new_xp: responseXp,
      streak_days: responseStreakDays,
      current_streak: responseCurrentStreak, // 全局连胜数（当前连续答对了几道题）
      consecutive_correct_count: consecutiveCorrectCount, // 保留这个字段用于题目掌握度判断
      message: isCorrect ? "Answer is correct!" : "Answer is incorrect.",
    });
  } catch (error) {
    console.error("Error in /api/answers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
