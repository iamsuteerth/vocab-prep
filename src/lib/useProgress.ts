"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import {
  EMPTY_PROGRESS,
  type ProgressData,
  type WordStatus,
} from "@/lib/types";
import { WORDS } from "@/lib/words";
import { noteWrite } from "@/lib/lastWrite";

const STORAGE_KEY = "vocab-prep-progress-v1";

const validIds = new Set(WORDS.map((w) => w.id));

/** Strict validation — anything unknown is rejected wholesale. */
export function isValidProgress(p: unknown): p is ProgressData {
  if (!p || typeof p !== "object") return false;
  const obj = p as Record<string, unknown>;
  if (obj.version !== 1) return false;
  if (typeof obj.statuses !== "object" || obj.statuses === null) return false;
  if (!Array.isArray(obj.bookmarks) || !Array.isArray(obj.seen)) return false;
  for (const [id, s] of Object.entries(obj.statuses as Record<string, unknown>)) {
    if (!validIds.has(id) || (s !== "know" && s !== "dontKnow" && s !== "new"))
      return false;
  }
  const validIdList = (list: unknown[]) =>
    list.every((id) => typeof id === "string" && validIds.has(id));
  return (
    validIdList(obj.bookmarks as unknown[]) && validIdList(obj.seen as unknown[])
  );
}

/**
 * String-level storage adapter. ALL normalization + validation happens here,
 * so zustand's default merge (shallow-spread of the inner state) always
 * receives a clean, valid ProgressData:
 * - pre-zustand bare { version, statuses, ... } → wrapped
 * - hand-edited / corrupt → empty state (never throws, never skips)
 * - identical writes are deduped → no redundant storage events → tab-sync
 *   echo loops are structurally impossible.
 */
function canonicalProgressString(str: string): string | null {
  try {
    const parsed = JSON.parse(str) as Record<string, unknown>;
    const inner = (
      parsed && typeof parsed === "object" && "state" in parsed
        ? parsed.state
        : parsed
    ) as Record<string, unknown>;
    const candidate: ProgressData = {
      version: 1,
      statuses:
        inner.statuses && typeof inner.statuses === "object"
          ? (inner.statuses as ProgressData["statuses"])
          : {},
      bookmarks: Array.isArray(inner.bookmarks)
        ? (inner.bookmarks as string[]).filter(
            (id) => typeof id === "string" && validIds.has(id),
          )
        : [],
      seen: Array.isArray(inner.seen)
        ? (inner.seen as string[]).filter(
            (id) => typeof id === "string" && validIds.has(id),
          )
        : [],
    };
    // Invalid data (unknown ids, wrong statuses) → start empty, by design.
    if (!isValidProgress(candidate)) {
      return JSON.stringify({ state: EMPTY_PROGRESS, version: 1 });
    }
    return JSON.stringify({ state: candidate, version: 1 });
  } catch {
    return JSON.stringify({ state: EMPTY_PROGRESS, version: 1 });
  }
}

const progressStorage = {
  getItem: (name: string): string | null => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    return canonicalProgressString(str);
  },
  setItem: (name: string, value: string) => {
    if (localStorage.getItem(name) === value) return; // dedupe echo writes
    noteWrite(name, value);
    localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    noteWrite(name, "");
    localStorage.removeItem(name);
  },
};

type ProgressState = ProgressData & {
  hasHydrated: boolean;
  setHasHydrated: () => void;
  setStatus: (id: string, status: WordStatus) => void;
  toggleBookmark: (id: string) => void;
  markSeen: (id: string) => void;
  resetSeen: () => void;
  resetAll: () => void;
  importProgress: (json: string) => string | null;
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      ...EMPTY_PROGRESS,
      hasHydrated: false,
      setHasHydrated: () => set({ hasHydrated: true }),

      setStatus: (id, status) =>
        set((p) => {
          const statuses = { ...p.statuses };
          if (status === "new") delete statuses[id];
          else statuses[id] = status;
          return { statuses };
        }),

      toggleBookmark: (id) =>
        set((p) => ({
          bookmarks: p.bookmarks.includes(id)
            ? p.bookmarks.filter((b) => b !== id)
            : [...p.bookmarks, id],
        })),

      markSeen: (id) =>
        set((p) => (p.seen.includes(id) ? p : { seen: [...p.seen, id] })),

      resetSeen: () => set({ seen: [] }),

      /** Destructive: clears statuses + seen. Bookmarks are kept. */
      resetAll: () => set({ statuses: {}, seen: [] }),

      /** Strict: parses, validates, rejects anything unknown. */
      importProgress: (json) => {
        try {
          const parsed: unknown = JSON.parse(json);
          if (!isValidProgress(parsed)) return "Invalid progress file format.";
          set({ ...parsed, hasHydrated: true });
          return null;
        } catch {
          return "Could not parse JSON.";
        }
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => progressStorage),
      // hasHydrated is runtime state, not persisted data
      partialize: (s) => ({
        statuses: s.statuses,
        bookmarks: s.bookmarks,
        seen: s.seen,
      }),
      // Hydration is triggered explicitly (AppShell / tab sync), never during
      // render — avoids SSR mismatch and matches the pages' `hydrated` gate.
      skipHydration: true,
      // No custom merge: the storage adapter guarantees the persisted inner
      // state is a valid ProgressData, so the default shallow spread works.
    },
  ),
);

/** Load persisted state into the store (called on AppShell mount + tab sync). */
export function hydrateProgress() {
  void useProgressStore.persist.rehydrate();
}

/**
 * Same hook API as before the zustand migration — pages don't change.
 */
export function useProgress() {
  const { statuses, bookmarks, seen, hasHydrated } = useProgressStore(
    useShallow((s) => ({
      statuses: s.statuses,
      bookmarks: s.bookmarks,
      seen: s.seen,
      hasHydrated: s.hasHydrated,
    })),
  );

  const progress = useMemo<ProgressData>(
    () => ({ version: 1, statuses, bookmarks, seen }),
    [statuses, bookmarks, seen],
  );

  const stats = useMemo(() => {
    const know = Object.values(statuses).filter((s) => s === "know").length;
    const dontKnow = Object.values(statuses).filter(
      (s) => s === "dontKnow",
    ).length;
    return {
      total: WORDS.length,
      know,
      dontKnow,
      bookmarked: bookmarks.length,
      seen: seen.length,
    };
  }, [statuses, bookmarks, seen]);

  return {
    progress,
    hydrated: hasHydrated,
    setStatus: useProgressStore((s) => s.setStatus),
    toggleBookmark: useProgressStore((s) => s.toggleBookmark),
    markSeen: useProgressStore((s) => s.markSeen),
    resetSeen: useProgressStore((s) => s.resetSeen),
    resetAll: useProgressStore((s) => s.resetAll),
    importProgress: useProgressStore((s) => s.importProgress),
    exportProgress: () =>
      JSON.stringify(
        {
          version: 1 as const,
          statuses: useProgressStore.getState().statuses,
          bookmarks: useProgressStore.getState().bookmarks,
          seen: useProgressStore.getState().seen,
        },
        null,
        2,
      ),
    stats,
  };
}
