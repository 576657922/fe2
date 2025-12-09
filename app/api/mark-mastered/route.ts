import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface MarkMasteredRequest {
  question_id: string;
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1️⃣ 验证用户身份
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Authentication failed:", authError);
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const userId = user.id;

    // 2️⃣ 获取请求参数
    const body: MarkMasteredRequest = await request.json();
    const { question_id } = body;

    if (!question_id) {
      return NextResponse.json(
        { error: "Missing question_id" },
        { status: 400 }
      );
    }

    // 3️⃣ 查询当前的 user_progress 记录
    const { data: existingProgress, error: fetchError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("question_id", question_id)
      .single();

    if (fetchError || !existingProgress) {
      console.error("Failed to find user_progress record:", fetchError);
      return NextResponse.json(
        { error: "Question not found in user progress" },
        { status: 404 }
      );
    }

    // 4️⃣ 更新 status 为 'mastered'
    const { data: updatedProgress, error: updateError } = await supabase
      .from("user_progress")
      .update({
        status: "mastered",
      })
      .eq("user_id", userId)
      .eq("question_id", question_id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update user_progress:", updateError);
      return NextResponse.json(
        { error: "Failed to mark question as mastered" },
        { status: 500 }
      );
    }

    // 5️⃣ 返回成功响应
    return NextResponse.json(
      {
        success: true,
        message: "Question marked as mastered",
        data: updatedProgress,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in mark-mastered API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
