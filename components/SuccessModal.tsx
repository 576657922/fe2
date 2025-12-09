import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Zap, X, Trophy, XCircle } from 'lucide-react';

// --- Types ---
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  isCorrect: boolean;
  earnedXp?: number;
  streak?: number;
  correctAnswer?: string;
}

// --- Component: Clean Confetti ---
const CleanConfetti = ({ isCorrect }: { isCorrect: boolean }) => {
  const particles = Array.from({ length: 24 });
  const colors = isCorrect
    ? ['bg-blue-500', 'bg-indigo-500', 'bg-sky-400', 'bg-amber-400']
    : ['bg-gray-400', 'bg-slate-400'];

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

// --- Component: Success Modal ---
const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  onNext,
  isCorrect,
  earnedXp = 10,
  streak = 0,
  correctAnswer
}) => {
  const [show, setShow] = useState(false);
  const [animateIcon, setAnimateIcon] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setTimeout(() => setAnimateIcon(true), 150);
    } else {
      setShow(false);
      setAnimateIcon(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {/* 背景遮罩 */}
      <div
        className={`absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* 弹窗卡片 */}
      <div
        className={`
          relative w-full max-w-sm bg-white rounded-3xl shadow-2xl shadow-blue-900/10
          transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) origin-center
          border border-white/50 ring-1 ring-black/5
          ${show ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8'}
        `}
      >
        {/* 顶部装饰光 */}
        <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${
          isCorrect ? 'from-blue-50/80' : 'from-red-50/80'
        } to-transparent rounded-t-3xl pointer-events-none`} />

        {/* 粒子动画 */}
        {isCorrect && <CleanConfetti isCorrect={isCorrect} />}

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-20"
        >
          <X size={18} />
        </button>

        <div className="relative z-10 flex flex-col items-center p-8 text-center">

          {/* 图标区域 */}
          <div className="relative mb-6">
            {/* 扩散波纹 */}
            {isCorrect && (
              <>
                <div className={`absolute inset-0 bg-blue-500 rounded-full opacity-20 ${animateIcon ? 'animate-ping-slow' : ''}`} />
                <div className={`absolute inset-2 bg-indigo-500 rounded-full opacity-20 delay-100 ${animateIcon ? 'animate-ping-slow' : ''}`} />
              </>
            )}

            {/* 主体图标圆 */}
            <div className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg text-white transform transition-transform duration-500 hover:scale-105 ${
              isCorrect
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-600/30'
                : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-600/30'
            }`}>
              {isCorrect ? (
                <Check
                  className={`w-10 h-10 ${animateIcon ? 'animate-check-draw' : 'opacity-0'}`}
                  strokeWidth={4}
                />
              ) : (
                <XCircle
                  className={`w-10 h-10 ${animateIcon ? 'animate-check-draw' : 'opacity-0'}`}
                  strokeWidth={4}
                />
              )}
            </div>

            {/* 装饰性小元素 */}
            {isCorrect && (
              <div className={`absolute -right-2 top-0 bg-amber-400 text-white p-1 rounded-full shadow-sm transform transition-all delay-300 duration-500 ${animateIcon ? 'scale-100 rotate-12' : 'scale-0'}`}>
                <Trophy size={14} fill="currentColor" />
              </div>
            )}
          </div>

          {/* 文本内容 */}
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">
            {isCorrect ? '回答正确！' : '回答错误'}
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed px-4">
            {isCorrect ? (
              <>解题思路清晰，逻辑严密。<br/>知识点掌握得很好！</>
            ) : (
              <>不要气馁，错误是进步的阶梯。<br/>
              {correctAnswer && <span className="text-gray-700 font-semibold">正确答案：{correctAnswer}</span>}</>
            )}
          </p>

          {/* 数据统计行 */}
          {isCorrect && (
            <div className="flex w-full gap-3 mb-8">
              <div className="flex-1 bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex flex-col items-center justify-center group hover:bg-blue-50 transition-colors">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">经验奖励</span>
                <span className="text-xl font-bold text-blue-700">+{earnedXp} XP</span>
              </div>
              {streak > 0 && (
                <div className="flex-1 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex flex-col items-center justify-center group hover:bg-indigo-50 transition-colors">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">连续答对</span>
                  <div className="flex items-center gap-1 text-xl font-bold text-indigo-700">
                    <Zap size={16} className="fill-indigo-700" />
                    <span>{streak}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 按钮组 */}
          <div className="w-full space-y-3">
            {onNext && (
              <button
                onClick={onNext}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold shadow-lg shadow-gray-200 hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <span>下一题</span>
                <ArrowRight size={18} />
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 px-6 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl font-medium transition-colors text-sm"
            >
              {isCorrect ? '继续查看解析' : '查看解析'}
            </button>
          </div>

        </div>
      </div>

      {/* CSS 动画 */}
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
};

export default SuccessModal;
