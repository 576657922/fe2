"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Question } from "@/lib/types";
import { QuestionList } from "./_components/question-list";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [solvedQuestionIds, setSolvedQuestionIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取所有题目
        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .order("year", { ascending: false })
          .order("question_number", { ascending: true });

        if (questionsError) throw questionsError;

        // 获取所有年份
        const { data: yearsData, error: yearsError } = await supabase
          .from("questions")
          .select("year")
          .order("year", { ascending: false });

        if (yearsError) throw yearsError;

        // 获取所有类别
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("questions")
          .select("category");

        if (categoriesError) throw categoriesError;

        // 获取用户的做题记录
        const { data: userProgressData, error: userProgressError } = await supabase
          .from("user_progress")
          .select("question_id");

        if (userProgressError) {
          console.warn("无法加载做题记录:", userProgressError);
        }

        // 处理数据
        setQuestions(questionsData || []);
        const distinctYears = Array.from(
          new Set(yearsData?.map((y) => y.year) || [])
        );
        const distinctCategories = Array.from(
          new Set(categoriesData?.map((c) => c.category) || [])
        );
        setYears(distinctYears);
        setCategories(distinctCategories);

        if (userProgressData) {
          setSolvedQuestionIds(new Set(userProgressData.map((p) => p.question_id)));
        }

        setIsLoading(false);
      } catch (err) {
        console.error("获取题目数据失败:", err);
        setError(err instanceof Error ? err.message : "未知错误");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">加载中...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">错误</h1>
        <p>无法加载题目数据</p>
        <p className="text-sm text-gray-600 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">
        题目浏览
      </h1>
      <QuestionList
        initialQuestions={questions as Question[]}
        years={years}
        categories={categories}
        solvedQuestionIds={solvedQuestionIds}
      />
    </div>
  );
}
