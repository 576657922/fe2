"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Trophy, X, Zap } from "lucide-react";

type SuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  score?: number;
  streak?: number;
  message?: string;
};

// 粒子层：克制的品牌色圆点
const CleanConfetti = () => {
  const particles = useMemo(() => Array.from({ length: 24 }), []);
  const colors = ["bg-blue-500", "bg-indigo-500", "bg-sky-400", "bg-amber-400"];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
      {particles.map((_, i) => {
        const left = Math.random() * 100;
        const animationDelay = Math.random() * 0.4;
        const duration = 1.5 + Math.random();
        const colorClass = colors[i % colors.length];
        return (
          <div
            key={i}
            className={`absolute -top-2 w-1.5 h-1.5 rounded-full ${colorClass} opacity-0 animate-clean-fall`}
            style={{
              left: `${left}%`,
              animationDelay: `${animationDelay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
};

export function SuccessModal({
  isOpen,
  onClose,
  onNext,
  score = 10,
  streak = 0,
  message = "该知识点掌握得很好！继续保持。",
}: SuccessModalProps) {
  const [show, setShow] = useState(false);
  const [animateIcon, setAnimateIcon] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      const timer = setTimeout(() => setAnimateIcon(true), 120);
      return () => clearTimeout(timer);
    }
    setShow(false);
    setAnimateIcon(false);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <div
        className={`absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`
          relative w-full max-w-sm bg-white rounded-3xl shadow-2xl shadow-blue-900/10
          transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) origin-center
          border border-white/50 ring-1 ring-black/5
          ${show ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-8"}
        `}
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-50/80 to-transparent rounded-t-3xl pointer-events-none" />
        <CleanConfetti />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-20"
          aria-label="关闭"
        >
          <X size={18} />
        </button>

        <div className="relative z-10 flex flex-col items-center p-8 text-center">
          <div className="relative mb-6">
            <div className={`absolute inset-0 bg-blue-500 rounded-full opacity-20 ${animateIcon ? "animate-ping-slow" : ""}`} />
            <div className={`absolute inset-2 bg-indigo-500 rounded-full opacity-20 delay-100 ${animateIcon ? "animate-ping-slow" : ""}`} />
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 text-white">
              <Check className={`w-10 h-10 ${animateIcon ? "animate-check-draw" : "opacity-0"}`} strokeWidth={4} />
            </div>
            <div
              className={`absolute -right-2 top-0 bg-amber-400 text-white p-1 rounded-full shadow-sm transform transition-all delay-300 duration-500 ${
                animateIcon ? "scale-100 rotate-12" : "scale-0"
              }`}
            >
              <Trophy size={14} fill="currentColor" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">回答正确！</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed px-4">{message}</p>

          <div className="flex w-full gap-3 mb-8">
            <div className="flex-1 bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">积分奖励</span>
              <span className="text-xl font-bold text-blue-700">+{score}</span>
            </div>
            <div className="flex-1 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">当前连胜</span>
              <div className="flex items-center gap-1 text-xl font-bold text-indigo-700">
                <Zap size={16} className="fill-indigo-700" />
                <span>{streak}</span>
              </div>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={onNext || onClose}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold shadow-lg shadow-gray-200 hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <span>{onNext ? "下一题" : "继续"}</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-6 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl font-medium transition-colors text-sm"
            >
              查看解析
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes clean-fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
        }
        .animate-clean-fall {
          animation: clean-fall ease-in forwards;
        }

        @keyframes check-draw {
          0% { stroke-dasharray: 0 100; opacity: 0; transform: scale(0.5); }
          100% { stroke-dasharray: 100 100; opacity: 1; transform: scale(1); }
        }
        .animate-check-draw {
          animation: check-draw 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes ping-slow {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
