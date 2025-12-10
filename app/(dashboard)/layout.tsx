"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PomodoroFloating } from "@/components/PomodoroFloating";
import { Home, FileQuestion, BookX, BarChart3, BookMarked, Shuffle } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data?.session?.user) {
        router.push("/login");
      } else {
        setUser(data.session.user);
        setEmail(data.session.user.email || "");
        setIsLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        router.push("/login");
      } else {
        setUser(session.user);
        setEmail(session.user.email || "");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-white shadow-md flex-shrink-0">
        <div className="w-full">
          <div className="p-4 border-b">
            <Link href="/dashboard" className="font-bold text-xl">
              FE 刷题平台
            </Link>
          </div>
          <nav className="p-4 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>首页</span>
            </Link>
            <Link
              href="/dashboard/questions"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <FileQuestion className="h-5 w-5" />
              <span>题库</span>
            </Link>
            <Link
              href="/dashboard/year-random"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <Shuffle className="h-5 w-5" />
              <span>年份随机</span>
            </Link>
            <Link
              href="/dashboard/wrong-book"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <BookX className="h-5 w-5" />
              <span>错题本</span>
            </Link>
            <Link
              href="/dashboard/bookmarks"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <BookMarked className="h-5 w-5" />
              <span>书签</span>
            </Link>
            <Link
              href="/dashboard/stats"
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <BarChart3 className="h-5 w-5" />
              <span>数据统计</span>
            </Link>
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="font-bold text-lg md:hidden">
              FE 刷题平台
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 hidden sm:inline">{email}</span>
              <Button variant="outline" onClick={handleLogout}>
                登出
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="md:hidden bg-white border-b shadow-sm px-4 py-3 flex items-center gap-3 overflow-x-auto">
          <Link href="/dashboard" className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
            <Home className="h-5 w-5" />
            <span className="text-sm">首页</span>
          </Link>
          <Link href="/dashboard/questions" className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
            <FileQuestion className="h-5 w-5" />
            <span className="text-sm">题库</span>
          </Link>
          <Link href="/dashboard/year-random" className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
            <Shuffle className="h-5 w-5" />
            <span className="text-sm">年份随机</span>
          </Link>
          <Link href="/dashboard/wrong-book" className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
            <BookX className="h-5 w-5" />
            <span className="text-sm">错题本</span>
          </Link>
          <Link href="/dashboard/bookmarks" className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
            <BookMarked className="h-5 w-5" />
            <span className="text-sm">书签</span>
          </Link>
          <Link href="/dashboard/stats" className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm">数据统计</span>
          </Link>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </div>

      <PomodoroFloating />
    </div>
  );
}
