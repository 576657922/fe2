"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    return <div>加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="font-bold text-lg">
                FE 刷题平台
              </Link>
              <div className="hidden md:flex gap-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900"
                >
                  首页
                </Link>
                <Link
                  href="/dashboard/questions"
                  className="text-gray-600 hover:text-gray-900"
                >
                  刷题
                </Link>
                <Link
                  href="/dashboard/wrong-book"
                  className="text-gray-600 hover:text-gray-900"
                >
                  错题本
                </Link>
                <Link
                  href="/dashboard/stats"
                  className="text-gray-600 hover:text-gray-900"
                >
                  数据统计
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{email}</span>
              <Button variant="outline" onClick={handleLogout}>
                登出
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
