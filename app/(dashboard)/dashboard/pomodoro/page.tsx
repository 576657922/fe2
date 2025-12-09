"use client";

import { Pomodoro } from "@/components/Pomodoro";

export default function PomodoroPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">番茄钟</h1>
        <p className="text-muted-foreground">开启一个 25 分钟的专注时段，完成你的学习目标。</p>
      </div>
      <Pomodoro goalDescription="刷题 20 题 / 复习错题 10 道" />
    </div>
  );
}
