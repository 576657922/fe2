"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown } from "lucide-react";
import { getLevelTitle } from "@/lib/utils";

type LevelUpNotificationProps = {
  level: number;
  onClose: () => void;
  durationMs?: number;
};

export function LevelUpNotification({ level, onClose, durationMs = 3000 }: LevelUpNotificationProps) {
  const title = getLevelTitle(level);

  useEffect(() => {
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
      >
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl px-4 py-3">
          <Crown className="h-6 w-6" />
          <div>
            <p className="text-sm font-semibold">升级了！</p>
            <p className="text-lg font-bold">Lv{level} · {title.title}</p>
            {title.subtitle && (
              <p className="text-xs opacity-90">{title.subtitle}</p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
