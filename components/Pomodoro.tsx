"use client";

import { useMemo, useState } from "react";
import { usePomodoroStore } from "@/store/pomodoroStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PomodoroProps = {
  goalDescription?: string;
  className?: string;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

export function Pomodoro({ goalDescription, className }: PomodoroProps) {
  const {
    isRunning,
    timeLeft,
    totalTime,
    sessionsCompleted,
    start,
    pause,
    reset,
    setTotalTime,
  } = usePomodoroStore();
  const [minutesInput, setMinutesInput] = useState(() => Math.round(totalTime / 60));

  const progress = useMemo(() => {
    if (totalTime === 0) return 0;
    return Math.max(0, Math.min(100, Math.round(((totalTime - timeLeft) / totalTime) * 100)));
  }, [timeLeft, totalTime]);

  const handleApplyMinutes = () => {
    const minutes = Number.isNaN(minutesInput) ? 0 : minutesInput;
    const clampedMinutes = Math.max(1, Math.min(180, minutes)); // 防止异常值，限定 1~180 分钟
    setMinutesInput(clampedMinutes);
    setTotalTime(clampedMinutes * 60);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">番茄钟</CardTitle>
        <CardDescription>专注学习并跟踪你的番茄记录</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {goalDescription || "设置一个目标，然后开始专注"}
          </p>
          <p className="text-5xl font-bold tracking-tight tabular-nums">{formatTime(timeLeft)}</p>
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span>总时长 {Math.round(totalTime / 60)} 分钟</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
            <span>今日完成 {sessionsCompleted} 个番茄</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Button
            variant={isRunning ? "secondary" : "default"}
            onClick={isRunning ? pause : start}
            className="w-full"
          >
            {isRunning ? "暂停" : "开始"}
          </Button>
          <Button variant="outline" onClick={reset} className="w-full">
            重置
          </Button>
          <div className="w-full">
            <Label htmlFor="pomodoro-minutes" className="text-sm text-muted-foreground">
              自定义时长（分钟）
            </Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="pomodoro-minutes"
                type="number"
                min={1}
                max={180}
                value={minutesInput}
                onChange={(e) => setMinutesInput(Number(e.target.value))}
                className="w-24"
              />
              <Button variant="outline" onClick={handleApplyMinutes}>
                应用
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">范围 1~180 分钟，应用后立即生效</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
