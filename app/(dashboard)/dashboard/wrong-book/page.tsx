"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Question } from "@/lib/types";
import {
  BookMarked,
  AlertCircle,
  RefreshCcw,
  Play,
  Calendar,
  Tag,
  XCircle,
  CheckCircle2,
  ArrowUpDown,
  Check
} from "lucide-react";

interface WrongQuestion {
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
  questions: Question | null;
}

type SortOption = "recent" | "attempts";

export default function WrongBookPage() {
  const router = useRouter();
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  // 获取错题数据
  const fetchWrongQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 获取当前用户的 session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("请先登录");
      }

      // 调用 API 获取错题列表
      const response = await fetch("/api/wrong-questions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "获取错题列表失败");
      }

      const result = await response.json();
      setWrongQuestions(result.data || []);
    } catch (err) {
      console.error("获取错题数据失败:", err);
      setError(err instanceof Error ? err.message : "未知错误，请检查网络连接");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchWrongQuestions();
  }, [fetchWrongQuestions]);

  // 排序逻辑
  const sortedQuestions = [...wrongQuestions].sort((a, b) => {
    if (sortBy === "recent") {
      // 按最近错误时间排序（最近的在前）
      const timeA = a.last_attempt_at ? new Date(a.last_attempt_at).getTime() : 0;
      const timeB = b.last_attempt_at ? new Date(b.last_attempt_at).getTime() : 0;
      return timeB - timeA;
    } else {
      // 按错误次数排序（错误次数多的在前）
      return b.attempt_count - a.attempt_count;
    }
  });

  // 格式化时间
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "未知时间";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "今天";
    if (diffDays === 1) return "昨天";
    if (diffDays < 7) return `${diffDays}天前`;

    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  };

  // 跳转到做题页面
  const handleRetry = (question: Question) => {
    router.push(`/dashboard/${question.year}/${question.id}`);
  };

  // 标记已掌握
  const handleMarkMastered = async (questionId: string) => {
    try {
      // 获取当前用户的 session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        alert("请先登录");
        return;
      }

      // 调用 API 标记为已掌握
      const response = await fetch("/api/mark-mastered", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          question_id: questionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "标记失败");
      }

      // 成功后刷新错题列表
      await fetchWrongQuestions();
    } catch (err) {
      console.error("标记已掌握失败:", err);
      alert(err instanceof Error ? err.message : "操作失败，请重试");
    }
  };

  // --- UI 渲染：骨架屏加载状态 ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* 头部骨架 */}
          <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-sm space-y-4">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-64 bg-gray-100 rounded animate-pulse" />
          </div>

          {/* 列表骨架 */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse p-6" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- UI 渲染：错误提示状态 ---
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
        <div className="text-center space-y-4 max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-50/50">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">数据加载失败</h2>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={fetchWrongQuestions}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-gray-200 active:scale-95 text-sm font-medium"
          >
            <RefreshCcw className="w-4 h-4" />
            重试加载
          </button>
        </div>
      </div>
    );
  }

  // --- UI 渲染：空状态 ---
  if (sortedQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50 font-sans">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
          {/* 头部区域 */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl shadow-lg shadow-red-500/20 ring-1 ring-black/5">
                  <BookMarked className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                    错题本
                  </span>
                </h1>
              </div>
              <p className="text-gray-500 text-sm md:text-base pl-1">
                查看和复习答错的题目，巩固薄弱知识点
              </p>
            </div>

            {/* 错题数量统计 */}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 border border-gray-200 rounded-xl shadow-sm px-4 py-2.5">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>错题总数 <strong className="text-red-600">0</strong></span>
            </div>
          </header>

          {/* 空状态提示 */}
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4 max-w-md">
              <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-50/50">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">太棒了！</h2>
              <p className="text-gray-500 text-base">
                你目前还没有错题，继续保持这种状态！
              </p>
              <button
                onClick={() => router.push("/dashboard/questions")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-95 text-sm font-medium"
              >
                <Play className="w-4 h-4" />
                开始刷题
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- UI 渲染：主界面（有错题） ---
  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

        {/* 头部区域 */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm sticky top-4 z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl shadow-lg shadow-red-500/20 ring-1 ring-black/5">
                <BookMarked className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">
                  错题本
                </span>
              </h1>
            </div>
            <p className="text-gray-500 text-sm md:text-base pl-1">
              查看和复习答错的题目，巩固薄弱知识点
            </p>
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-3">
            {/* 错题数量统计 */}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 border border-gray-200 rounded-xl shadow-sm px-4 py-2.5">
              <XCircle className="w-4 h-4 text-red-500" />
              <span>错题总数 <strong className="text-red-600">{sortedQuestions.length}</strong></span>
            </div>

            {/* 开始复习按钮 */}
            {sortedQuestions.length > 0 && (
              <button
                onClick={() => router.push("/dashboard/wrong-review")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all hover:shadow-lg hover:shadow-red-200 active:scale-95 text-sm font-medium whitespace-nowrap"
              >
                <Play className="w-4 h-4" />
                开始复习
              </button>
            )}
          </div>
        </header>

        {/* 排序选择器 */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ArrowUpDown className="w-4 h-4" />
            <span className="font-medium">排序方式：</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("recent")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === "recent"
                  ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md shadow-red-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              最近错误
            </button>
            <button
              onClick={() => setSortBy("attempts")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === "attempts"
                  ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-md shadow-red-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              错误次数
            </button>
          </div>
        </div>

        {/* 错题列表 */}
        <main className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          {sortedQuestions.map((wrongQuestion) => {
            const question = wrongQuestion.questions;
            if (!question) return null;

            return (
              <div
                key={wrongQuestion.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 space-y-4"
              >
                {/* 题目信息头部 */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* 年份标签 */}
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                        <Calendar className="w-3 h-3" />
                        {question.year}
                      </span>

                      {/* 类别标签 */}
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100">
                        <Tag className="w-3 h-3" />
                        {question.category}
                      </span>

                      {/* 难度标签 */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        question.difficulty === "easy"
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : question.difficulty === "hard"
                          ? "bg-red-50 text-red-700 border border-red-100"
                          : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                      }`}>
                        {question.difficulty === "easy" ? "简单" : question.difficulty === "hard" ? "困难" : "普通"}
                      </span>
                    </div>

                    {/* 题号 */}
                    <h3 className="text-lg font-bold text-gray-900">
                      第 {question.question_number} 题
                    </h3>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleRetry(question)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-95 text-sm font-medium whitespace-nowrap"
                    >
                      <Play className="w-4 h-4" />
                      再做一遍
                    </button>
                    <button
                      onClick={() => handleMarkMastered(question.id)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all hover:shadow-lg hover:shadow-green-200 active:scale-95 text-sm font-medium whitespace-nowrap"
                    >
                      <Check className="w-4 h-4" />
                      标记已掌握
                    </button>
                  </div>
                </div>

                {/* 分隔线 */}
                <div className="border-t border-gray-100" />

                {/* 答案对比 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 你的答案 */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">你的答案</p>
                    <p className="text-lg font-bold text-red-600">
                      {wrongQuestion.user_answer || "未作答"}
                    </p>
                  </div>

                  {/* 正确答案 */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">正确答案</p>
                    <p className="text-lg font-bold text-green-600">
                      {question.correct_answer}
                    </p>
                  </div>

                  {/* 错误次数和时间 */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium">答题记录</p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-700">
                        错误 <strong className="text-red-600">{wrongQuestion.attempt_count}</strong> 次
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(wrongQuestion.last_attempt_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}
