import wordsJson from "@/data/words.json";
import type { Word } from "@/lib/types";

export const WORDS: Word[] = wordsJson as Word[];

export const CATEGORIES: string[] = Array.from(
  new Set(WORDS.map((w) => w.category)),
).sort();

export function wordById(id: string): Word | undefined {
  return WORDS.find((w) => w.id === id);
}

export function wordsByCategory(category: string): Word[] {
  return WORDS.filter((w) => w.category === category);
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Fisher-Yates seeded by a string seed — deterministic order per seed. */
export function seededShuffle<T>(arr: readonly T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
