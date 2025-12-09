"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  BookMarked,
  BookmarkX,
  Calendar,
  Tag,
  ArrowUpDown,
  Loader2,
} from "lucide-react";

type BookmarkItem = {
  id: string;
  question_id: string;
  created_at: string;
  questions: {
    id: string;
    year: string;
    session: string;
    category: string;
    question_number: number;
    difficulty: string;
    content: string;
  } | null;
};

type SortOption = "newest" | "oldest";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error("请先登录");
        }

        const { data, error: bookmarksError } = await supabase
          .from("bookmarks")
          .select(
            `
            id,
            question_id,
            created_at,
            questions (
              id,
              year,
              session,
              category,
              question_number,
              difficulty,
              content
            )
          `
          )
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (bookmarksError) {
          throw new Error(`获取书签失败: ${bookmarksError.message}`);
        }

        setBookmarks(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "未知错误，请重试");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const yearOptions = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((item) => {
      if (item.questions?.year) {
        set.add(item.questions.year);
      }
    });
    return Array.from(set);
  }, [bookmarks]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((item) => {
      if (item.questions?.category) {
        set.add(item.questions.category);
      }
    });
    return Array.from(set);
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    const filtered = bookmarks.filter((item) => {
      const q = item.questions;
      if (!q) return false;
      const yearMatch = selectedYear === "all" || q.year === selectedYear;
      const categoryMatch =
        selectedCategory === "all" || q.category === selectedCategory;
      return yearMatch && categoryMatch;
    });

    return filtered.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [bookmarks, selectedYear, selectedCategory, sortBy]);

  const handleRemove = async (questionId: string) => {
    try {
      setRemovingId(questionId);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      if (!token) {
        setError("请先登录");
        return;
      }

      const response = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question_id: questionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "删除失败");
      }

      setBookmarks((prev) =>
        prev.filter((item) => item.question_id !== questionId)
      );
    } catch (err) {
      console.error("删除书签失败:", err);
      setError(err instanceof Error ? err.message : "删除书签失败");
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          正在加载书签...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 font-semibold mb-2">加载失败</p>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BookMarked className="h-7 w-7 text-blue-600" />
          我的书签
        </h1>
        <p className="text-gray-600 mt-2">
          收藏的题目会保存在这里，便于复习与回顾
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <select
            className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">全部年份</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gray-500" />
          <select
            className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">全部类别</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-500" />
          <select
            className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="newest">按添加时间：最新优先</option>
            <option value="oldest">按添加时间：最早优先</option>
          </select>
        </div>
      </div>

      {/* Empty state */}
      {filteredBookmarks.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-800 mb-2">
            暂无书签
          </p>
          <p className="text-gray-600 mb-4">去刷题页添加你想收藏的题目吧</p>
          <Link
            href="/dashboard/questions"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            前往刷题
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {filteredBookmarks.map((item) => {
          const q = item.questions;
          if (!q) return null;
          return (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {q.year} {q.session}
                  </span>
                  <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {q.category}
                  </span>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      q.difficulty === "easy"
                        ? "bg-green-100 text-green-700"
                        : q.difficulty === "normal"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {q.difficulty === "easy"
                      ? "简单"
                      : q.difficulty === "normal"
                      ? "中等"
                      : "困难"}
                  </span>
                  <span className="text-sm text-gray-500">
                    题号 #{q.question_number}
                  </span>
                  <span className="text-xs text-gray-500">
                    添加于 {formatDate(item.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/dashboard/${q.year}/${q.id}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 transition text-sm"
                  >
                    做一遍
                  </Link>
                  <button
                    onClick={() => handleRemove(q.id)}
                    disabled={removingId === q.id}
                    className="px-4 py-2 border border-gray-200 rounded font-semibold text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-60"
                  >
                    <BookmarkX className="h-4 w-4" />
                    {removingId === q.id ? "删除中..." : "移除书签"}
                  </button>
                </div>
              </div>
              <p className="text-gray-800 leading-relaxed line-clamp-3">
                {q.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
