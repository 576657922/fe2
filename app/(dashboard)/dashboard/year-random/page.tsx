"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Shuffle } from "lucide-react";
import { SuccessModal } from "@/components/SuccessModal";
import { LevelUpNotification } from "@/components/LevelUpNotification";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";

type QuestionLite = {
  id: string;
  year: string;
  question_number: number;
  content: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  category: string;
  difficulty: string;
  session: string;
};

type YearOption = { year: string };

const shuffleArray = <T,>(arr: T[]) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default function YearRandomPage() {
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionLite[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastXpGained, setLastXpGained] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);

  useEffect(() => {
    const fetchYears = async () => {
      const { data, error } = await supabase.from("questions").select("year").neq("year", "").order("year", { ascending: false });
      if (error) {
        console.error("获取年份失败", error);
        return;
      }
      const distinct = Array.from(new Set((data as YearOption[]).map((y) => y.year)));
      setYears(distinct);
      if (distinct.length > 0) {
        setSelectedYear(distinct[0]);
      }
    };
    fetchYears();
  }, []);

  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);

  const handleStart = async () => {
    if (!selectedYear) return;
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setCorrectCount(0);

    const { data, error } = await supabase
      .from("questions")
      .select(
        "id,year,question_number,content,option_a,option_b,option_c,option_d,correct_answer,explanation,category,difficulty,session"
      )
      .eq("year", selectedYear);

    setIsLoading(false);

    if (error || !data || data.length === 0) {
      setError(error ? error.message : "未找到该年份的题目");
      return;
    }

    const shuffled = shuffleArray(data as QuestionLite[]);
    setQuestions(shuffled);
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !selectedAnswer) return;
    setIsSubmitting(true);
    setIsSubmitted(false);
    setIsCorrect(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error("请先登录");
      }

      const res = await fetch("/api/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          user_answer: selectedAnswer,
          pomodoro_session_id: null,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "提交答案失败");
      }

      const json = await res.json();
      const correct = json.is_correct === true;
      setLastXpGained(json?.xp_gained ?? 0);
      setConsecutiveCorrect(json?.current_streak ?? 0); // 使用全局连胜数
      if (json.level_up && json.new_level) {
        setLevelUpLevel(json.new_level);
      }
      setIsCorrect(correct);
      setIsSubmitted(true);
      if (correct) {
        setCorrectCount((c) => c + 1);
        setShowSuccessModal(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "提交失败";
      setError(msg);
      console.error("提交答案失败", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
      setIsCorrect(null);
      setIsBookmarked(false);
      setBookmarkError(null);
    }
  };

  const handleToggleBookmark = async () => {
    if (!currentQuestion) return;
    try {
      setIsBookmarkLoading(true);
      setBookmarkError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setBookmarkError("请先登录");
        return;
      }

      const res = await fetch("/api/bookmarks", {
        method: isBookmarked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question_id: currentQuestion.id }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "书签操作失败");
      }

      setIsBookmarked((prev) => !prev);
    } catch (err) {
      console.error("书签操作失败", err);
      setBookmarkError(err instanceof Error ? err.message : "书签操作失败");
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  const handleRestart = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setCorrectCount(0);
    setShowSuccessModal(false);
    setIsBookmarked(false);
    setBookmarkError(null);
  };

  const isFinished = questions.length > 0 && currentIndex >= questions.length - 1 && isSubmitted;
  const accuracy =
    questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            按年份随机刷题
          </h1>
          <p className="text-gray-600 mt-2">洗牌并完成该年份的全部题目</p>
        </div>
        <Button variant="outline" onClick={handleStart} disabled={!selectedYear || isLoading}>
          <Shuffle className="h-4 w-4 mr-2" />
          {isLoading ? "加载中..." : "开始洗牌"}
        </Button>
      </div>

      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          score={lastXpGained || 10}
          streak={consecutiveCorrect}
          onNext={() => {
            setShowSuccessModal(false);
            handleNext();
          }}
          message="解题思路清晰，继续保持！"
        />
      )}

      {levelUpLevel && (
        <LevelUpNotification level={levelUpLevel} onClose={() => setLevelUpLevel(null)} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>选择年份</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500">将随机排列所选年份的全部题目，逐题完成。</p>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>正在加载题目...</span>
        </div>
      )}

      {questions.length === 0 && !isLoading && !error && (
        <div className="text-gray-500">请选择年份后点击“开始洗牌”以开始刷题。</div>
      )}

      {currentQuestion && (
        <Card className="shadow-lg">
          <CardHeader className="flex flex-col gap-2">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span>{currentQuestion.year} {currentQuestion.session}</span>
              <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">{currentQuestion.category}</span>
              <span
                className={`px-2 py-1 rounded ${
                  currentQuestion.difficulty === "easy"
                    ? "bg-green-50 text-green-700"
                    : currentQuestion.difficulty === "normal"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {currentQuestion.difficulty === "easy"
                  ? "简单"
                  : currentQuestion.difficulty === "normal"
                  ? "中等"
                  : "困难"}
              </span>
              <button
                onClick={handleToggleBookmark}
                disabled={isBookmarkLoading}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded border transition ${
                  isBookmarked
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                } ${isBookmarkLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="h-4 w-4" />
                    已收藏
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-4 w-4" />
                    加入书签
                  </>
                )}
              </button>
            </div>
            <CardTitle className="text-xl">
              #{currentQuestion.question_number} {currentQuestion.content}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {(["A", "B", "C", "D"] as Array<"A" | "B" | "C" | "D">).map((key) => {
                const text =
                  key === "A"
                    ? currentQuestion.option_a
                    : key === "B"
                    ? currentQuestion.option_b
                    : key === "C"
                    ? currentQuestion.option_c
                    : currentQuestion.option_d;

                const isSelected = selectedAnswer === key;
                const isResultWrong =
                  isSubmitted && isSelected && isCorrect === false;
                const isResultCorrect =
                  isSubmitted &&
                  ((isCorrect && isSelected) ||
                    currentQuestion.correct_answer === key);

                return (
                  <button
                    key={key}
                    disabled={isSubmitted}
                    onClick={() => setSelectedAnswer(key)}
                    className={`w-full text-left border rounded-lg px-4 py-3 transition ${
                      isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    } ${
                      isResultCorrect
                        ? "border-green-500 bg-green-50"
                        : isResultWrong
                        ? "border-red-500 bg-red-50"
                        : ""
                    }`}
                  >
                    <span className="font-semibold mr-2">{key}.</span>
                    <span>{text}</span>
                  </button>
                );
              })}
            </div>

            {!isSubmitted ? (
              <Button
                className="w-full"
                disabled={!selectedAnswer || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "提交中..." : "提交答案"}
              </Button>
            ) : (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-lg ${
                    isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {isCorrect ? "回答正确！" : "回答错误，再接再厉！"}
                </div>
                <div className="p-3 rounded-lg bg-blue-50 text-blue-700">
                  <p className="font-semibold mb-1">答案解析</p>
                  <p className="text-sm whitespace-pre-line">{currentQuestion.explanation}</p>
                </div>
                {currentIndex < questions.length - 1 ? (
                  <Button className="w-full" onClick={handleNext}>
                    下一题
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
                      已完成本年份全部题目！正确率：{accuracy}%（{correctCount}/{questions.length}）
                    </div>
                    <div className="flex gap-3">
                      <Button className="flex-1" onClick={handleRestart}>
                        重新选择年份
                      </Button>
                      <Button className="flex-1" onClick={handleStart} disabled={isLoading}>
                        再来一轮
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {questions.length > 0 && (
        <div className="text-sm text-gray-600">
          进度：{currentIndex + 1} / {questions.length} · 正确 {correctCount} 题
        </div>
      )}
    </div>
  );
}
