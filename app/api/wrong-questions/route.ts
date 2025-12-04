import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API 端点：获取用户的错题列表
 *
 * GET /api/wrong-questions
 *
 * 功能：
 * - 验证用户身份（未登录返回 401）
 * - 查询 user_progress 表，筛选 status = 'wrong_book'
 * - 联表查询获取完整的题目信息
 * - 按 last_attempt_at 降序排列（最近错的在前）
 * - 返回 JSON 格式的错题列表
 */

interface QuestionDetails {
  id: string;
  year: string;
  session: string;
  category: string;
  question_number: number;
  content: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  difficulty: string;
  created_at: string;
}

interface WrongQuestionWithDetails {
  id: string;
  user_id: string;
  question_id: string;
  user_answer: string | null;
  is_correct: boolean | null;
  attempt_count: number;
  consecutive_correct_count: number;
  status: string;
  last_attempt_at: string | null;
  created_at: string;
  questions: QuestionDetails | null;
}

export async function GET(request: NextRequest) {
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

    // 使用服务角色密钥创建客户端
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取认证用户信息
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized: No authorization header" },
        { status: 401 }
      );
    }

    // 使用 auth header 获取用户信息
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    const userId = user.id;

    // 查询 user_progress 表，筛选错题（status = 'wrong_book'）
    // 联表查询获取完整的题目信息
    const { data: wrongQuestions, error: queryError } = await supabase
      .from("user_progress")
      .select(
        `
        id,
        user_id,
        question_id,
        user_answer,
        is_correct,
        attempt_count,
        consecutive_correct_count,
        status,
        last_attempt_at,
        created_at,
        questions (
          id,
          year,
          session,
          category,
          question_number,
          content,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          explanation,
          difficulty,
          created_at
        )
      `
      )
      .eq("user_id", userId)
      .eq("status", "wrong_book")
      .order("last_attempt_at", { ascending: false });

    if (queryError) {
      console.error("Error querying wrong questions:", queryError);
      return NextResponse.json(
        { error: "Failed to fetch wrong questions" },
        { status: 500 }
      );
    }

    // 返回错题列表
    return NextResponse.json({
      success: true,
      data: wrongQuestions,
      count: wrongQuestions?.length || 0,
    });
  } catch (error) {
    console.error("Error in /api/wrong-questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
