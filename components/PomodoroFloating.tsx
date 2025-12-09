"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AlarmClock, Pause, Play } from "lucide-react";
import { usePomodoroStore } from "@/store/pomodoroStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export function PomodoroFloating() {
  const {
    isRunning,
    timeLeft,
    totalTime,
    start,
    pause,
    decrementTime,
    completeSession,
    sessionsCompleted,
  } = usePomodoroStore();
  const prevSessionsRef = useRef<number>(sessionsCompleted);

  const active = isRunning || timeLeft !== totalTime;
  const progress = totalTime === 0 ? 0 : Math.round(((totalTime - timeLeft) / totalTime) * 100);

  // 全局倒计时：浮窗常驻于 Dashboard，负责递减，保证跨页面也在计时
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      if (timeLeft <= 1) {
        completeSession();
        return;
      }
      decrementTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, decrementTime, completeSession]);

  // 番茄完成时写 focus_logs（无 session_id 时仅记录 duration）
  useEffect(() => {
    if (sessionsCompleted === prevSessionsRef.current) return;

    const sendFocusLog = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        prevSessionsRef.current = sessionsCompleted;
        return;
      }

      await fetch("/api/focus-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          duration: totalTime,
          questions_completed: 0,
          correct_count: 0,
          pomodoro_session_id: null,
        }),
      }).catch((err) => {
        console.error("Failed to send focus log", err);
      });

      prevSessionsRef.current = sessionsCompleted;
    };

    sendFocusLog();
  }, [sessionsCompleted, totalTime]);

  if (!active) return null;

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-3 rounded-full bg-white shadow-lg border px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden />
          <AlarmClock className="h-5 w-5 text-emerald-600" aria-hidden />
          <span className="font-semibold tabular-nums text-lg">
            {minutes}:{seconds}
          </span>
        </div>

        <div className="hidden sm:flex h-2 w-24 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={isRunning ? pause : start}
            aria-label={isRunning ? "暂停番茄钟" : "继续番茄钟"}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Link
            href="/dashboard/pomodoro"
            className={cn(
              "text-xs font-medium px-3 py-1 rounded-full border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition"
            )}
          >
            查看
          </Link>
        </div>
      </div>
    </div>
  );
}
