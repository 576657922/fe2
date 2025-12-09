"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();

        if (!session?.session?.user?.id) {
          setError("未找到用户信息");
          setIsLoading(false);
          return;
        }

        const { data, error: dbError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.session.user.id)
          .single();

        if (dbError) {
          console.error("Database error:", dbError);
          setError("加载个人信息失败");
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("加载数据出错");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>欢迎！</CardTitle>
            <CardDescription>您的学习数据</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile ? (
              <>
                <div>
                  <p className="text-sm text-gray-500">用户名</p>
                  <p className="text-2xl font-bold">{profile.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">等级</p>
                  <p className="text-2xl font-bold text-blue-600">
                    Lv. {profile.level}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">经验值</p>
                  <p className="text-2xl font-bold">{profile.xp} XP</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">连续打卡天数</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {profile.streak_days}天
                  </p>
                </div>
              </>
            ) : (
              <p>正在加载个人信息...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快速开始</CardTitle>
            <CardDescription>选择一个活动开始</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/questions" className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition">
                <p className="font-semibold text-blue-900">开始刷题</p>
                <p className="text-sm text-blue-700">浏览题库并做题</p>
            </Link>
            <Link href="/dashboard/wrong-review" className="block p-3 bg-red-50 hover:bg-red-100 rounded-lg text-left transition">
                <p className="font-semibold text-red-900">错题复习</p>
                <p className="text-sm text-red-700">专注复习错题，逐题攻克</p>
            </Link>
            <Link href="/dashboard/wrong-book" className="block p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition">
                <p className="font-semibold text-orange-900">查看错题本</p>
                <p className="text-sm text-orange-700">浏览所有错题列表</p>
            </Link>
            <Link href="/dashboard/pomodoro" className="block p-3 bg-green-50 hover:bg-green-100 rounded-lg text-left transition">
                <p className="font-semibold text-green-900">开始番茄钟</p>
                <p className="text-sm text-green-700">专注学习25分钟</p>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>今日学习概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-gray-500 text-sm">今日做题</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">今日正确率</p>
              <p className="text-3xl font-bold">-</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">完成番茄</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">当前错题</p>
              <p className="text-3xl font-bold">0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
