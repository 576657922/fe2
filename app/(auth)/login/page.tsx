"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate input
      if (!email || !password) {
        setError("邮箱和密码不能为空");
        setIsLoading(false);
        return;
      }

      // Sign in with email and password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message || "邮箱或密码错误");
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Redirect to dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      setError("登录失败，请重试");
      console.error("Login error:", err);
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signInError) {
        setError(signInError.message || "GitHub 登录失败");
        setIsLoading(false);
      }
    } catch (err) {
      setError("GitHub 登录失败，请重试");
      console.error("GitHub login error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">登录</CardTitle>
          <CardDescription>
            输入您的邮箱和密码以登录您的账户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="grid gap-4">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  {error}
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
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "登录中..." : "邮箱登录"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full bg-gray-800 text-white hover:bg-gray-700"
              onClick={handleGitHubLogin}
              disabled={isLoading}
            >
              {isLoading ? "处理中..." : "GitHub 登录"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            还没有账户?{" "}
            <Link href="/register" className="underline">
              注册
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
