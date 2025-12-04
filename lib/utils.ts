import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 将日文假名答案转换为 ABCD 格式
 * 支持的映射：
 * ア (a) → A
 * イ (i) → B
 * ウ (u) → C
 * エ (e) → D
 *
 * 如果已经是 ABCD 格式，直接返回
 */
export function normalizeAnswer(answer: string): "A" | "B" | "C" | "D" {
  const upperAnswer = answer.toUpperCase().trim();

  // 如果已经是 ABCD，直接返回
  if (["A", "B", "C", "D"].includes(upperAnswer)) {
    return upperAnswer as "A" | "B" | "C" | "D";
  }

  // 日文假名映射到 ABCD
  const japaneseToAbcd: { [key: string]: "A" | "B" | "C" | "D" } = {
    "ア": "A",
    "イ": "B",
    "ウ": "C",
    "エ": "D",
  };

  const normalized = japaneseToAbcd[upperAnswer];
  if (normalized) {
    return normalized;
  }

  // 如果无法识别，返回 A 作为默认值（不应该发生）
  console.warn(`Unknown answer format: ${answer}, defaulting to A`);
  return "A";
}
