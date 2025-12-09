"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Question } from "@/lib/types";
import {
  ArrowLeft,
  Check,
  AlertCircle,
  Trophy,
  XCircle,
  Loader2,
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

export default function WrongReviewPage() {
  const router = useRouter();
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 答题状态
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取错题列表
  const fetchWrongQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("请先登录");
      }

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
      const questions = result.data || [];

      // 排序：按最近错误时间降序，然后按复习次数升序
      const sorted = questions.sort((a: WrongQuestion, b: WrongQuestion) => {
        // 优先按最近错误时间排序
        const timeA = a.last_attempt_at ? new Date(a.last_attempt_at).getTime() : 0;
        const timeB = b.last_attempt_at ? new Date(b.last_attempt_at).getTime() : 0;
        if (timeB !== timeA) {
          return timeB - timeA; // 最近的在前
        }
        // 时间相同时，按复习次数排序（复习次数少的在前）
        return a.attempt_count - b.attempt_count;
      });

      setWrongQuestions(sorted);
    } catch (err) {
      console.error("获取错题数据失败:", err);
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWrongQuestions();
  }, [fetchWrongQuestions]);

  // 提交答案
  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    try {
      setIsSubmitting(true);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user?.id || !sessionData?.session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch("/api/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          user_answer: selectedAnswer,
          pomodoro_session_id: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "提交答案失败");
      }

      const result = await response.json();
      const correct = result.is_correct;
      setIsCorrect(correct);
      setIsSubmitted(true);

      // 2 秒后自动跳转到下一题
      setTimeout(() => {
        handleNextQuestion();
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "提交失败";
      setError(message);
      console.error("Error submitting answer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 下一题
  const handleNextQuestion = () => {
    if (currentIndex < wrongQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetAnswerState();
    } else {
      // 所有题目完成，返回错题本
      router.push("/dashboard/wrong-book");
    }
  };

  // 重置答题状态
  const resetAnswerState = () => {
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setError(null);
  };

  // 暂停复习
  const handlePauseReview = () => {
    router.push("/dashboard/wrong-book");
  };

  // 当前题目
  const currentQuestion = wrongQuestions[currentIndex]?.questions || null;
  const progress = wrongQuestions.length > 0
    ? Math.round(((currentIndex + 1) / wrongQuestions.length) * 100)
    : 0;

  // --- 加载状态 ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">加载错题中...</p>
        </div>
      </div>
    );
  }

  // --- 错误状态 ---
  if (error && wrongQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-red-600 mb-4">加载失败</h1>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => router.push("/dashboard/wrong-book")}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
            >
              返回错题本
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 空状态 ---
  if (wrongQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <Trophy className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">太棒了！</h1>
          <p className="text-gray-600 mb-6">
            你目前没有错题需要复习。
          </p>
          <button
            onClick={() => router.push("/dashboard/questions")}
            className="bg-blue-500 text-white px-6 py-3 rounded font-semibold hover:bg-blue-600 transition"
          >
            开始刷题
          </button>
        </div>
      </div>
    );
  }

  // --- 题目不存在 ---
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-red-600 mb-4">题目不存在</h1>
          <button
            onClick={handlePauseReview}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
          >
            返回错题本
          </button>
        </div>
      </div>
    );
  }

  const options = [
    { key: "A", text: currentQuestion.option_a },
    { key: "B", text: currentQuestion.option_b },
    { key: "C", text: currentQuestion.option_c },
    { key: "D", text: currentQuestion.option_d },
  ];

  // --- 主界面 ---
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 顶部导航栏 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">
          <button
            onClick={handlePauseReview}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">暂停复习</span>
          </button>
          <div className="text-sm text-gray-500">
            <span className="font-bold text-blue-600">{currentIndex + 1}</span> / {wrongQuestions.length}
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>复习进度</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 题目卡片 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {currentQuestion.year} {currentQuestion.session}
              </span>
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {currentQuestion.category}
              </span>
              <span
                className={`text-sm px-2 py-1 rounded ${
                  currentQuestion.difficulty === "easy"
                    ? "bg-green-100 text-green-700"
                    : currentQuestion.difficulty === "normal"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {currentQuestion.difficulty === "easy"
                  ? "简单"
                  : currentQuestion.difficulty === "normal"
                  ? "中等"
                  : "困难"}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              第 {currentQuestion.question_number} 题
            </span>
          </div>

          {/* 题干 */}
          <div className="mb-6">
            <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
              {currentQuestion.content}
            </p>
          </div>

          {/* 选项 */}
          <div className="space-y-3 mb-6">
            {options.map((option) => (
              <button
                key={option.key}
                onClick={() => !isSubmitted && setSelectedAnswer(option.key as "A" | "B" | "C" | "D")}
                disabled={isSubmitted}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-start gap-3 ${
                  isSubmitted && option.key === currentQuestion.correct_answer
                    ? "border-green-500 bg-green-50"
                    : isSubmitted && option.key === selectedAnswer && !isCorrect
                    ? "border-red-500 bg-red-50"
                    : selectedAnswer === option.key
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                } ${isSubmitted ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    isSubmitted && option.key === currentQuestion.correct_answer
                      ? "bg-green-500 text-white"
                      : isSubmitted && option.key === selectedAnswer && !isCorrect
                      ? "bg-red-500 text-white"
                      : selectedAnswer === option.key
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {option.key}
                </span>
                <span className="text-gray-700 flex-1 pt-0.5">
                  {option.text}
                </span>
              </button>
            ))}
          </div>

          {/* 结果提示 */}
          {isSubmitted && (
            <div
              className={`p-4 rounded-lg mb-6 text-center ${
                isCorrect
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <p
                className={`text-lg font-bold flex items-center justify-center gap-2 ${
                  isCorrect ? "text-green-700" : "text-red-700"
                }`}
              >
                {isCorrect ? (
                  <>
                    <Check size={20} />
                    答案正确！
                  </>
                ) : (
                  <>
                    <XCircle size={20} />
                    答案错误
                  </>
                )}
              </p>
              {!isCorrect && (
                <p className="text-gray-700 mt-2">
                  正确答案: <span className="font-bold">{currentQuestion.correct_answer}</span>
                </p>
              )}
            </div>
          )}

          {/* 解析 */}
          {isSubmitted && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-blue-900 mb-2">题目解析</h3>
              <p className="text-gray-700">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* 提交按钮 */}
          {!isSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || isSubmitting}
              className={`w-full px-8 py-3 rounded font-bold transition ${
                !selectedAnswer || isSubmitting
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isSubmitting ? "提交中..." : "提交答案"}
            </button>
          ) : (
            <div className="text-center text-gray-500 text-sm">
              <Loader2 className="animate-spin inline-block mr-2" size={16} />
              正在加载下一题...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
