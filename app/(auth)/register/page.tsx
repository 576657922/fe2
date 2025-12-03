"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // 验证邮箱格式有效
      if (!email || !password || !confirmPassword) {
        setError("邮箱、密码和确认密码不能为空");
        setIsLoading(false);
        return;
      }

      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("邮箱格式不有效");
        setIsLoading(false);
        return;
      }

      // 验证密码长度 ≥ 6 位
      if (password.length < 6) {
        setError("密码长度必须至少 6 位");
        setIsLoading(false);
        return;
      }

      // 验证两次密码输入一致
      if (password !== confirmPassword) {
        setError("两次输入的密码不一致");
        setIsLoading(false);
        return;
      }

      // 先查询 profiles 表中是否已有该邮箱对应的用户
      // 由于我们在注册时使用 username (邮箱前缀)，需要查询所有 profiles 找匹配的邮箱
      // 但更直接的方法是：尝试注册，然后检查是否创建了新 profile
      
      // 获取当前 profiles 表的用户 ID 数量（用作对比）
      const { count: countBefore } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      console.log("Profiles count before:", countBefore);

      // 调用 Supabase 的 signUp() 方法
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      console.log("SignUp response:", { data, signUpError });

      // 检查错误
      if (signUpError) {
        console.error("SignUp error:", signUpError);
        setError(signUpError.message || "注册失败，请重试");
        setIsLoading(false);
        return;
      }

      // 检查 user 是否创建成功
      if (!data?.user) {
        console.error("No user returned from signUp");
        setError("注册失败，请重试");
        setIsLoading(false);
        return;
      }

      // 等待 Trigger 执行
      await new Promise(resolve => setTimeout(resolve, 800));

      // 检查新 profiles 数量
      const { count: countAfter } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      console.log("Profiles count after:", countAfter);

      // 如果数量没有增加，说明是重复注册（Trigger 的 UNIQUE_VIOLATION 被捕获了）
      if (countBefore !== null && countAfter !== null && countBefore >= countAfter) {
        console.log("Duplicate email detected");
        setError("邮箱已被使用");
        setIsLoading(false);
        return;
      }

      // 用户和 profile 创建成功
      console.log("User and profile created successfully");

      // 注册成功 → 显示提示"注册成功，请检查邮箱验证"
      setSuccess("注册成功！请检查邮箱验证链接。");

      // 清空表单
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // 2 秒后重定向到登录页面
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("注册失败，请重试");
      console.error("Register error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">注册</CardTitle>
          <CardDescription>
            输入您的信息以创建帐户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-4">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">密码</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="confirm-password">确认密码</Label>
              </div>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "注册中..." : "注册"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            已有账户?{" "}
            <Link href="/login" className="underline">
              登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
