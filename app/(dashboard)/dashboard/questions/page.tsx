"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Question } from "@/lib/types";
import { QuestionList } from "./_components/question-list";
import { 
  BookOpen, 
  AlertCircle, 
  RefreshCcw, 
  CheckCircle2 
} from "lucide-react";

export default function QuestionsPage() {
  // --- 1. 状态管理 (保持原有逻辑) ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [solvedQuestionIds, setSolvedQuestionIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 2. 数据获取 (保持原有逻辑，升级为并行请求以提速) ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 使用 Promise.all 并行请求所有数据，比原来的串行请求更快
      // 分段取数，避免 1000 条上限（每段 1000 条）
      const fetchChunk = async (from: number, to: number) =>
        supabase.from("questions").select("*").range(from, to);

      const [chunk1, chunk2, chunk3, userProgressRes] = await Promise.all([
        fetchChunk(0, 999),
        fetchChunk(1000, 1999),
        fetchChunk(2000, 2999),
        supabase.from("user_progress").select("question_id"),
      ]);

      const mergedQuestions = [chunk1.data, chunk2.data, chunk3.data].flat().filter(Boolean) as Question[];

      const questionsError = chunk1.error || chunk2.error || chunk3.error;
      if (questionsError) throw questionsError;

      // 用户进度获取失败记录警告，但不阻断页面显示
      if (userProgressRes.error) {
        console.warn("无法加载做题记录:", userProgressRes.error);
      }

      // 处理数据
      setQuestions(mergedQuestions);

      // 从已获取的题目中提取年份和分类，确保完全一致
      const distinctYears = Array.from(
        new Set(mergedQuestions.map((q) => q.year))
      ).sort((a, b) => {
        // 提取年份数字部分进行比较（如 "31_haru" -> 31, "07_haru" -> 7）
        const yearA = parseInt(a.split('_')[0]);
        const yearB = parseInt(b.split('_')[0]);

        // 判断是令和年代（01-07）还是平成年代（13-31）
        const isReiwaA = yearA >= 1 && yearA <= 7;
        const isReiwaB = yearB >= 1 && yearB <= 7;

        // 令和年代排在前面
        if (isReiwaA && !isReiwaB) return -1;
        if (!isReiwaA && isReiwaB) return 1;

        // 同一年代内，按年份降序
        if (yearA !== yearB) {
          return yearB - yearA;
        }

        // 年份相同，按季节排序（haru春 > aki秋 > menjo）
        return b.localeCompare(a);
      });

      const distinctCategories = Array.from(
        new Set(mergedQuestions.map((q) => q.category))
      ).sort(); // 升序排列

      setYears(distinctYears);
      setCategories(distinctCategories);

      if (userProgressRes.data) {
        setSolvedQuestionIds(new Set(userProgressRes.data.map((p) => p.question_id)));
      }
    } catch (err) {
      console.error("获取题目数据失败:", err);
      setError(err instanceof Error ? err.message : "未知错误，请检查网络连接");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 3. UI 渲染：骨架屏加载状态 (Skeleton) ---
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse p-6 space-y-4 relative overflow-hidden">
                <div className="flex justify-between">
                    <div className="h-5 w-16 bg-gray-100 rounded-full" />
                    <div className="h-5 w-5 bg-gray-100 rounded-full" />
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded mt-2" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
                <div className="h-px w-full bg-gray-100 mt-8" />
                <div className="flex gap-4 mt-2">
                   <div className="h-4 w-12 bg-gray-100 rounded" />
                   <div className="h-4 w-12 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- 4. UI 渲染：错误提示状态 ---
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
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-gray-200 active:scale-95 text-sm font-medium"
          >
            <RefreshCcw className="w-4 h-4" />
            重试加载
          </button>
        </div>
      </div>
    );
  }

  // --- 5. UI 渲染：主界面 ---
  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* 头部区域：渐变标题 + 统计胶囊 */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-sm sticky top-4 z-10 transition-all duration-300">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 ring-1 ring-black/5">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  题目浏览
                </span>
              </h1>
            </div>
            <p className="text-gray-500 text-sm md:text-base pl-1">
              探索历年真题库，追踪学习进度，提升专业技能
            </p>
          </div>
          
          {/* 数据统计展示 */}
          <div className="flex items-center gap-0 text-sm text-gray-600 bg-white/50 border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-r border-gray-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span>收录 <strong>{questions.length}</strong></span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/50">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span>已完成 <strong>{solvedQuestionIds.size}</strong></span>
            </div>
          </div>
        </header>

        {/* 列表区域：带淡入动画 */}
        <main className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <QuestionList
            initialQuestions={questions}
            years={years}
            categories={categories}
            solvedQuestionIds={solvedQuestionIds}
          />
        </main>
      </div>
    </div>
  );
}
