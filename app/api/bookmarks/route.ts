import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface BookmarkRequest {
  question_id: string;
}

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

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    let body: BookmarkRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { question_id } = body;
    if (!question_id) {
      return NextResponse.json(
        { error: "Missing question_id" },
        { status: 400 }
      );
    }

    // Ensure the question exists before creating a bookmark
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("id")
      .eq("id", question_id)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const { data: bookmark, error: upsertError } = await supabase
      .from("bookmarks")
      .upsert(
        {
          user_id: user.id,
          question_id,
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id,question_id" }
      )
      .select()
      .single();

    if (upsertError) {
      console.error("Error creating bookmark:", upsertError);
      return NextResponse.json(
        { error: "Failed to create bookmark" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Bookmark saved",
        data: bookmark,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in /api/bookmarks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    let body: BookmarkRequest;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { question_id } = body;
    if (!question_id) {
      return NextResponse.json(
        { error: "Missing question_id" },
        { status: 400 }
      );
    }

    // Ensure bookmark exists for this user/question
    const { data: existing, error: fetchError } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user.id)
      .eq("question_id", question_id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("question_id", question_id);

    if (deleteError) {
      console.error("Error deleting bookmark:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete bookmark" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Bookmark removed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in /api/bookmarks DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
