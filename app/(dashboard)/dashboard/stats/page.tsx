"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  BarChart3,
  Target,
  TrendingUp,
  BookX,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

// 统计数据类型
interface Stats {
  totalQuestions: number;
  correctQuestions: number;
  accuracyRate: number;
  wrongBookCount: number;
  masteredCount: number;
}

type TrendPoint = {
  date: string;
  total: number;
  correct: number;
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats>({
    totalQuestions: 0,
    correctQuestions: 0,
    accuracyRate: 0,
    wrongBookCount: 0,
    masteredCount: 0,
  });
  const [statusChart, setStatusChart] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 获取当前用户的 session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error("请先登录");
        }

        const userId = session.user.id;

        // 查询 user_progress 表
        const { data: progressData, error: progressError } = await supabase
          .from("user_progress")
          .select("is_correct,status,last_attempt_at")
          .eq("user_id", userId);

        if (progressError) {
          throw new Error(`查询数据失败: ${progressError.message}`);
        }

        if (!progressData || progressData.length === 0) {
          // 没有数据，初始化为0
          setStats({
            totalQuestions: 0,
            correctQuestions: 0,
            accuracyRate: 0,
            wrongBookCount: 0,
            masteredCount: 0,
          });
          setIsLoading(false);
          return;
        }

        // 计算基础统计数据
        const totalQuestions = progressData.length;
        const correctQuestions = progressData.filter(
          (item) => item.is_correct === true
        ).length;
        const accuracyRate =
          totalQuestions > 0
            ? Math.round((correctQuestions / totalQuestions) * 100)
            : 0;
        const wrongBookCount = progressData.filter(
          (item) => item.status === "wrong_book"
        ).length;
        const masteredCount = progressData.filter(
          (item) => item.status === "mastered"
        ).length;
        const normalCount = Math.max(
          0,
          totalQuestions - wrongBookCount - masteredCount
        );

        const statusRows = [
          { name: "已掌握", value: masteredCount, color: "#10b981" },
          { name: "错题本", value: wrongBookCount, color: "#f97316" },
          { name: "正常", value: normalCount, color: "#3b82f6" },
        ];

        const trendMap: Record<string, TrendPoint> = {};
        progressData.forEach((item) => {
          if (!item.last_attempt_at) return;
          const d = new Date(item.last_attempt_at);
          if (Number.isNaN(d.getTime())) return;
          const key = d.toISOString().slice(0, 10);
          if (!trendMap[key]) {
            trendMap[key] = { date: key, total: 0, correct: 0 };
          }
          trendMap[key].total += 1;
          if (item.is_correct) trendMap[key].correct += 1;
        });

        const trendList = Object.values(trendMap).sort((a, b) =>
          a.date.localeCompare(b.date)
        );

        setStats({
          totalQuestions,
          correctQuestions,
          accuracyRate,
          wrongBookCount,
          masteredCount,
        });
        setStatusChart(statusRows);
        setTrendData(trendList);
      } catch (err) {
        console.error("获取统计数据失败:", err);
        setError(
          err instanceof Error ? err.message : "未知错误，请检查网络连接"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 加载状态
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCcw className="h-12 w-12 text-blue-500 animate-spin" />
            <p className="text-gray-600">加载统计数据中...</p>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          学习统计
        </h1>
        <p className="text-gray-600 mt-2">查看您的做题数据和学习进度</p>
      </div>

      {/* 基础统计卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* 总做题数 */}
        <Card className="border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              总做题数
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalQuestions}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              已做过的题目总数
            </p>
          </CardContent>
        </Card>

        {/* 总正确数 */}
        <Card className="border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              答对题数
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.correctQuestions}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              最后一次答对的题数
            </p>
          </CardContent>
        </Card>

        {/* 整体正确率 */}
        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              整体正确率
            </CardTitle>
            <Target className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {stats.accuracyRate}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.correctQuestions} / {stats.totalQuestions}
            </p>
          </CardContent>
        </Card>

        {/* 错题数 */}
        <Card className="border-red-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              错题本
            </CardTitle>
            <BookX className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats.wrongBookCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              需要重点复习的题目
            </p>
          </CardContent>
        </Card>

        {/* 已掌握数 */}
        <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              已掌握
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {stats.masteredCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              连续答对3次的题目
            </p>
          </CardContent>
        </Card>

        {/* 学习进度 */}
        <Card className="border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              学习进度
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {stats.totalQuestions > 0
                ? Math.round(
                    ((stats.masteredCount + stats.correctQuestions) /
                      (stats.totalQuestions * 2)) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-gray-500 mt-1">
              掌握程度评估
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 空状态提示 */}
      {stats.totalQuestions === 0 && (
        <div className="mt-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  还没有做题记录
                </h3>
                <p className="text-gray-600 mb-4">
                  开始做题后，这里会显示您的学习统计数据
                </p>
                <a
                  href="/dashboard/questions"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-md"
                >
                  开始刷题
                </a>
              </div>
          </CardContent>
        </Card>
      </div>
      )}

      {stats.totalQuestions > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>状态分布</CardTitle>
              <CardDescription>已掌握 / 错题本 / 正常</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" name="数量" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>最近作答趋势</CardTitle>
              <CardDescription>按日期聚合的作答与正确数</CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.length === 0 ? (
                <p className="text-sm text-gray-500">暂无时间戳数据可展示</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#6366f1" name="作答数" />
                      <Line type="monotone" dataKey="correct" stroke="#22c55e" name="正确数" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
