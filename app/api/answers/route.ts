import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface AnswerRequest {
  question_id: string;
  user_answer: "A" | "B" | "C" | "D";
  pomodoro_session_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 初始化 Supabase 客户端（运行时初始化）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    const isCorrect = user_answer === question.correct_answer;

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
      } else {
        consecutiveCorrectCount = 0;
        // 答错时，如果不是已掌握，设为错题本
        newStatus =
          existingProgress.status === "mastered"
            ? "mastered"
            : "wrong_book";
      }

      // 第 4 步：检查连续答对是否达到 3 次，升级为已掌握
      if (
        consecutiveCorrectCount >= 3 &&
        existingProgress.status === "wrong_book"
      ) {
        newStatus = "mastered";
      }

      const { error: updateError } = await supabase
        .from("user_progress")
        .update({
          attempt_count: (existingProgress.attempt_count || 0) + 1,
          is_correct: isCorrect,
          consecutive_correct_count: consecutiveCorrectCount,
          status:
            isCorrect && existingProgress.status !== "normal"
              ? "normal"
              : newStatus,
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

    // 第 5 步：更新 profiles 表的 xp（答对时）
    if (isCorrect) {
      const { data: profile, error: profileFetchError } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", userId)
        .single();

      if (!profileFetchError && profile) {
        const { error: xpUpdateError } = await supabase
          .from("profiles")
          .update({
            xp: (profile.xp || 0) + xpGained,
          })
          .eq("id", userId);

        if (xpUpdateError) {
          console.error("Error updating XP:", xpUpdateError);
          // 不返回错误，XP 更新是辅助性的
        }
      }
    }

    // 返回成功响应
    return NextResponse.json({
      success: true,
      is_correct: isCorrect,
      xp_gained: isCorrect ? 10 : 0,
      correct_answer: question.correct_answer,
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
