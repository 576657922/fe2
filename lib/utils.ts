import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// XP 与等级计算：每 500 XP 升一级，起始等级 1
export function calculateLevel(xp: number): number {
  if (xp <= 0) return 1;
  return Math.floor(xp / 500) + 1;
}

export function getXpForNextLevel(currentLevel: number): number {
  if (currentLevel <= 1) return 500;
  return currentLevel * 500;
}

export function getProgressToNextLevel(currentXp: number, currentLevel: number): number {
  const prevLevelXp = Math.max(0, (currentLevel - 1) * 500);
  const nextLevelXp = getXpForNextLevel(currentLevel);
  const progress = (currentXp - prevLevelXp) / (nextLevelXp - prevLevelXp);
  return Math.max(0, Math.min(100, Math.round(progress * 100)));
}

type LevelTitle = { title: string; subtitle?: string };

const LEVEL_TITLES: LevelTitle[] = [
  { title: "看到题就头皮发麻的人", subtitle: "我是不是点错页面了？" }, // Lv1
  { title: "公式背诵型选手", subtitle: "会背，不一定会用" }, // Lv2
  { title: "选项全都很眼熟的男人", subtitle: "就是想不起来对的是谁" }, // Lv3
  { title: "出题人阴谋论研究员", subtitle: "这题肯定在针对我" }, // Lv4
  { title: "靠感觉对题的勇者", subtitle: "有时候你也不知道为什么对了（快乐分水岭）" }, // Lv5
  { title: "错题收藏家（不退不换）", subtitle: "错一道，爱一辈子" }, // Lv6
  { title: "看题就想关网页的人", subtitle: "但还是点了下一题" }, // Lv7
  { title: "题目看我都害怕型选手" }, // Lv8
  { title: "稳定做对但不敢庆祝的人" }, // Lv9
  { title: "👑 刷题刷到出题人想道歉的男" }, // Lv10
];

export function getLevelTitle(level: number): LevelTitle {
  if (level <= 1) return LEVEL_TITLES[0];
  if (level >= LEVEL_TITLES.length) return LEVEL_TITLES[LEVEL_TITLES.length - 1];
  return LEVEL_TITLES[level - 1];
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
