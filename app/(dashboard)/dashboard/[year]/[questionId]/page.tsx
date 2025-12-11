"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Question } from "@/lib/types";
import { normalizeAnswer } from "@/lib/utils";
import { LevelUpNotification } from "@/components/LevelUpNotification";
import Link from "next/link";
import { BookmarkPlus, BookmarkCheck } from "lucide-react";
import { SuccessModal } from "@/components/SuccessModal";

export default function QuestionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const year = params.year as string;
  const questionId = params.questionId as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [normalizedCorrectAnswer, setNormalizedCorrectAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isWrongQuestion, setIsWrongQuestion] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastXpGained, setLastXpGained] = useState<number>(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [isNextLoading, setIsNextLoading] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch question from Supabase
        const { data, error: fetchError } = await supabase
          .from("questions")
          .select("*")
          .eq("id", questionId)
          .single();

        if (fetchError) {
          throw new Error(`获取题目失败: ${fetchError.message}`);
        }

        if (!data) {
          throw new Error("题目不存在");
        }

        setQuestion(data);
        // 标准化答案格式（支持 ABCD 和日文假名）
        setNormalizedCorrectAnswer(normalizeAnswer(data.correct_answer));
      } catch (err) {
        const message = err instanceof Error ? err.message : "未知错误";
        setError(message);
        console.error("Error fetching question:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  // 检查是否为错题
  useEffect(() => {
    const checkIfWrongQuestion = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user?.id) {
          return;
        }

        const { data, error } = await supabase
          .from("user_progress")
          .select("status")
          .eq("user_id", sessionData.session.user.id)
          .eq("question_id", questionId)
          .eq("status", "wrong_book")
          .single();

        if (!error && data) {
          setIsWrongQuestion(true);
        }
      } catch (err) {
        // 忽略错误，不影响主要功能
        console.log("检查错题状态失败:", err);
      }
    };

    if (questionId) {
      checkIfWrongQuestion();
    }
  }, [questionId]);

  // 检查是否已加入书签
  useEffect(() => {
    const checkBookmark = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        if (!userId) return;

        const { data } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("user_id", userId)
          .eq("question_id", questionId)
          .maybeSingle();

        if (data) {
          setIsBookmarked(true);
        }
      } catch (err) {
        console.log("检查书签状态失败:", err);
      }
    };

    if (questionId) {
      checkBookmark();
    }
  }, [questionId]);

  const handleSelectAnswer = (answer: "A" | "B" | "C" | "D") => {
    if (!isSubmitted) {
      setSelectedAnswer(answer);
    }
  };

  const handleGoNextQuestion = async () => {
    if (!question) return;
    setIsNextLoading(true);
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("id, question_number")
        .eq("year", question.year)
        .gt("question_number", question.question_number)
        .order("question_number", { ascending: true })
        .limit(1)
        .single();

      if (error || !data?.id) {
        router.push("/dashboard/questions");
        return;
      }

      router.push(`/dashboard/${question.year}/${data.id}`);
    } catch (err) {
      console.error("跳转下一题失败", err);
      router.push("/dashboard/questions");
    } finally {
      setShowSuccessModal(false);
      setIsNextLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !question || !normalizedCorrectAnswer) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Get current user session to get auth token
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user?.id || !sessionData?.session?.access_token) {
        throw new Error("用户未登录");
      }

      // Call API to save answer attempt
      const response = await fetch("/api/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          question_id: questionId,
          user_answer: selectedAnswer,
          pomodoro_session_id: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "提交答案失败");
      }

      const result = await response.json();

      // Check if answer is correct (using API response)
      const correct = result.is_correct;
      setIsCorrect(correct);
      setIsSubmitted(true);
      setLastXpGained(result?.xp_gained ?? 0);
      setConsecutiveCorrect(result?.current_streak ?? 0); // 使用全局连胜数

      if (result.level_up && result.new_level) {
        setLevelUpLevel(result.new_level);
      }

      // 如果答案错误，标记为错题
      if (!correct) {
        setIsWrongQuestion(true);
      } else {
        setShowSuccessModal(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "提交失败";
      setError(message);
      console.error("Error submitting answer:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 标记已掌握
  const handleMarkMastered = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.access_token) {
        alert("请先登录");
        return;
      }

      const response = await fetch("/api/mark-mastered", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          question_id: questionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "标记失败");
      }

      // 成功后更新状态
      setIsWrongQuestion(false);
      alert("已标记为掌握！");
    } catch (err) {
      console.error("标记已掌握失败:", err);
      alert(err instanceof Error ? err.message : "操作失败，请重试");
    }
  };

  // 加入/取消书签
  const handleToggleBookmark = async () => {
    try {
      setIsBookmarkLoading(true);
      setBookmarkError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setBookmarkError("请先登录");
        return;
      }

      const response = await fetch("/api/bookmarks", {
        method: isBookmarked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question_id: questionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "操作失败");
      }

      setIsBookmarked((prev) => !prev);
    } catch (err) {
      console.error("书签操作失败:", err);
      setBookmarkError(err instanceof Error ? err.message : "操作失败，请重试");
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载题目中...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">加载失败</h1>
          <p className="text-gray-700 mb-6">{error || "题目不存在"}</p>
          <Link
            href="/dashboard/questions"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            返回题目列表
          </Link>
        </div>
      </div>
    );
  }

  const options = [
    { key: "A", text: question.option_a },
    { key: "B", text: question.option_b },
    { key: "C", text: question.option_c },
    { key: "D", text: question.option_d },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {showSuccessModal && (
          <SuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            score={lastXpGained || 10}
            streak={consecutiveCorrect}
            message="解题思路清晰，继续保持！"
            onNext={handleGoNextQuestion}
          />
        )}
        {levelUpLevel && (
          <LevelUpNotification
            level={levelUpLevel}
            onClose={() => setLevelUpLevel(null)}
          />
        )}
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {question.year} {question.session}
              </span>
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {question.category}
              </span>
              <span
                className={`text-sm px-2 py-1 rounded ${
                  question.difficulty === "easy"
                    ? "bg-green-100 text-green-700"
                    : question.difficulty === "normal"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {question.difficulty === "easy"
                  ? "简单"
                  : question.difficulty === "normal"
                  ? "中等"
                  : "困难"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                题号 #{question.question_number}
              </div>
              <button
                onClick={handleToggleBookmark}
                disabled={isBookmarkLoading}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded border transition ${
                  isBookmarked
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                } ${isBookmarkLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="h-4 w-4" />
                    已加入书签
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-4 w-4" />
                    加入书签
                  </>
                )}
              </button>
            </div>
          </div>

          {bookmarkError && (
            <p className="text-sm text-red-600 mb-3">{bookmarkError}</p>
          )}
        </div>

        {/* Question Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {question.content}
          </h2>

          {/* Answer Status Message */}
          {!isSubmitted && !selectedAnswer && (
            <p className="text-center text-gray-500 mb-6 text-lg">
              请选择答案
            </p>
          )}

          {/* Options */}
          <div className="space-y-3 mb-8">
            {options.map((option) => (
              <button
                key={option.key}
                onClick={() => handleSelectAnswer(option.key as "A" | "B" | "C" | "D")}
                disabled={isSubmitted}
                className={`w-full text-left p-4 border-2 rounded-lg transition ${
                  selectedAnswer === option.key
                    ? "border-blue-500 bg-blue-50"
                    : isSubmitted && option.key === normalizedCorrectAnswer
                    ? "border-green-500 bg-green-50"
                    : isSubmitted && option.key === selectedAnswer && !isCorrect
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                } ${isSubmitted ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`inline-block w-8 h-8 flex items-center justify-center rounded border-2 flex-shrink-0 font-bold ${
                      selectedAnswer === option.key
                        ? "border-blue-500 bg-blue-500 text-white"
                        : isSubmitted && option.key === normalizedCorrectAnswer
                        ? "border-green-500 bg-green-500 text-white"
                        : isSubmitted &&
                          option.key === selectedAnswer &&
                          !isCorrect
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    {option.key}
                  </span>
                  <span className="text-gray-700 flex-1 pt-0.5">
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Result Message */}
          {isSubmitted && (
            <div
              className={`p-4 rounded-lg mb-6 text-center ${
                isCorrect
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <p
                className={`text-lg font-bold ${
                  isCorrect ? "text-green-700" : "text-red-700"
                }`}
              >
                {isCorrect ? "✓ 答案正确！" : "✗ 答案错误"}
              </p>
              {!isCorrect && (
                <p className="text-gray-700 mt-2">
                  正确答案: <span className="font-bold">{normalizedCorrectAnswer}</span>
                </p>
              )}
            </div>
          )}

          {/* Explanation */}
          {isSubmitted && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-blue-900 mb-2">题目解析</h3>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            {!isSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer || isSubmitting}
                className={`px-8 py-3 rounded font-bold transition ${
                  !selectedAnswer || isSubmitting
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isSubmitting ? "提交中..." : "提交答案"}
              </button>
            ) : (
              <div className="space-y-4 w-full">
                <div className="flex gap-4">
                  <Link
                    href="/dashboard/questions"
                    className="flex-1 text-center bg-gray-500 text-white px-6 py-3 rounded font-bold hover:bg-gray-600 transition"
                  >
                    返回题目列表
                  </Link>
                  <button
                    onClick={() => {
                      // Reset for next question (can be enhanced later)
                      setSelectedAnswer(null);
                      setIsSubmitted(false);
                      setIsCorrect(null);
                    }}
                    className="flex-1 bg-blue-500 text-white px-6 py-3 rounded font-bold hover:bg-blue-600 transition"
                  >
                    重新答题
                  </button>
                </div>
                {/* 如果是错题，显示"标记已掌握"按钮 */}
                {isWrongQuestion && (
                  <button
                    onClick={handleMarkMastered}
                    className="w-full bg-green-500 text-white px-6 py-3 rounded font-bold hover:bg-green-600 transition"
                  >
                    ✓ 标记已掌握
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
