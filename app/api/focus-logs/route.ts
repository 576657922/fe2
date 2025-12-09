import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateLevel } from "@/lib/utils";

type FocusLogRequest = {
  duration: number;
  questions_completed?: number;
  correct_count?: number;
  pomodoro_session_id?: string;
};

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as FocusLogRequest;
    const { duration, questions_completed, correct_count, pomodoro_session_id } = body;

    if (!duration || duration <= 0) {
      return NextResponse.json(
        { error: "Invalid duration" },
        { status: 400 }
      );
    }

    let questionsCompleted = questions_completed ?? 0;
    let correctCount = correct_count ?? 0;

    // 如果有 session id，后端查询 question_attempts 计算实际的完成/正确数量
    if (pomodoro_session_id) {
      const { count: totalCount, error: totalError } = await supabase
        .from("question_attempts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("pomodoro_session_id", pomodoro_session_id);

      const { count: correctTotal, error: correctError } = await supabase
        .from("question_attempts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("pomodoro_session_id", pomodoro_session_id)
        .eq("is_correct", true);

      if (totalError) {
        console.warn("Failed to count question_attempts for session", totalError);
      } else if (typeof totalCount === "number") {
        questionsCompleted = totalCount;
      }

      if (correctError) {
        console.warn("Failed to count correct attempts for session", correctError);
      } else if (typeof correctTotal === "number") {
        correctCount = correctTotal;
      }
    }

    // 计算本次 XP：基础 25 + 每道答对 5
    const xpGained = 25 + correctCount * 5;

    const { error: insertError } = await supabase.from("focus_logs").insert({
      user_id: user.id,
      duration,
      questions_completed: questionsCompleted,
      correct_count: correctCount,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Failed to insert focus log", insertError);
      return NextResponse.json(
        { error: "Failed to save focus log" },
        { status: 500 }
      );
    }

    // 更新用户 XP/等级
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("xp, level")
      .eq("id", user.id)
      .single();

    let responseLevelUp = false;
    let responseLevel = undefined;
    let responseXp = undefined;

    if (!profileError && profile) {
      const newXp = (profile.xp || 0) + xpGained;
      const newLevel = calculateLevel(newXp);
      responseLevelUp = newLevel > (profile.level || 1);
      responseLevel = newLevel;
      responseXp = newXp;

      const { error: xpUpdateError } = await supabase
        .from("profiles")
        .update({ xp: newXp, level: newLevel })
        .eq("id", user.id);

      if (xpUpdateError) {
        console.error("Failed to update XP/level for focus log", xpUpdateError);
      }
    }

    return NextResponse.json({
      success: true,
      xp_gained: xpGained,
      questions_completed: questionsCompleted,
      correct_count: correctCount,
      level_up: responseLevelUp,
      new_level: responseLevel,
      new_xp: responseXp,
    });
  } catch (error) {
    console.error("Error in /api/focus-logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
