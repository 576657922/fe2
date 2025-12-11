import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    // 初始化 Supabase 客户端
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

    // 获取认证用户信息
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

    const userId = user.id;
    const today = new Date().toISOString().split('T')[0]; // 获取今天的日期 (YYYY-MM-DD)

    // 1. 查询今日做题数和正确数（从 question_attempts 表）
    const { data: todayAttempts, error: attemptsError } = await supabase
      .from("question_attempts")
      .select("is_correct")
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`);

    let todayQuestionsCount = 0;
    let todayCorrectCount = 0;
    let todayAccuracy = "-";

    if (!attemptsError && todayAttempts) {
      todayQuestionsCount = todayAttempts.length;
      todayCorrectCount = todayAttempts.filter(a => a.is_correct).length;

      if (todayQuestionsCount > 0) {
        todayAccuracy = `${Math.round((todayCorrectCount / todayQuestionsCount) * 100)}%`;
      }
    }

    // 2. 查询今日完成的番茄钟数（从 focus_sessions 表）
    const { data: todayPomodoros, error: pomodorosError } = await supabase
      .from("focus_sessions")
      .select("id", { count: 'exact' })
      .eq("user_id", userId)
      .gte("ended_at", `${today}T00:00:00`)
      .lte("ended_at", `${today}T23:59:59`)
      .not("ended_at", "is", null); // 确保番茄钟已完成

    let todayPomodorosCount = 0;
    if (!pomodorosError && todayPomodoros) {
      todayPomodorosCount = todayPomodoros.length;
    }

    // 3. 查询当前错题总数（从 user_progress 表）
    const { data: wrongQuestions, error: wrongError } = await supabase
      .from("user_progress")
      .select("id", { count: 'exact' })
      .eq("user_id", userId)
      .eq("status", "wrong_book");

    let wrongQuestionsCount = 0;
    if (!wrongError && wrongQuestions) {
      wrongQuestionsCount = wrongQuestions.length;
    }

    // 返回统计数据
    return NextResponse.json({
      success: true,
      data: {
        today_questions: todayQuestionsCount,
        today_accuracy: todayAccuracy,
        today_pomodoros: todayPomodorosCount,
        wrong_questions: wrongQuestionsCount,
      },
    });
  } catch (error) {
    console.error("Error in /api/daily-stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
