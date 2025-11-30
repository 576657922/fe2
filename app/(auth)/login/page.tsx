
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
import Link from "next/link";

export default function LoginPage() {
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
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">密码</Label>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white"
            >
              邮箱登录
            </Button>
            <Button variant="secondary" className="w-full bg-gray-800 text-white hover:bg-gray-700">
              GitHub 登录
            </Button>
          </div>
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
