"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { noteWrite } from "@/lib/lastWrite";

export type Deck = { seed: string; index: number };

const STORAGE_KEY = "vocab-prep-decks-v1";

/**
 * String-level storage adapter — mirrors useProgress's approach:
 * normalizes pre-zustand shapes (including the old "__meta__" extras),
 * drops invalid scopes, dedupes identical writes (no echo storage events).
 */
function canonicalDecksString(str: string): string {
  try {
    const parsed = JSON.parse(str) as Record<string, unknown>;
    const inner = (
      parsed && typeof parsed === "object" && "state" in parsed
        ? parsed.state
        : parsed
    ) as Record<string, unknown>;

    const decks: Record<string, Deck> = {};
    if (inner.decks && typeof inner.decks === "object") {
      for (const [scope, d] of Object.entries(inner.decks as Record<string, unknown>)) {
        const o = d as Record<string, unknown>;
        if (typeof o.seed === "string" && typeof o.index === "number") {
          decks[scope] = { seed: o.seed, index: o.index };
        }
      }
    }

    // Old format kept extras under "__meta__"
    const meta =
      inner.__meta__ && typeof inner.__meta__ === "object"
        ? (inner.__meta__ as Record<string, unknown>)
        : (inner.extras as Record<string, unknown> | undefined);
    const extras: Record<string, string> = {};
    if (meta) {
      for (const [k, v] of Object.entries(meta)) {
        if (typeof v === "string") extras[k] = v;
      }
    }

    return JSON.stringify({ state: { decks, extras }, version: 1 });
  } catch {
    return JSON.stringify({ state: { decks: {}, extras: {} }, version: 1 });
  }
}

const deckStorage = {
  getItem: (name: string): string | null => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    return canonicalDecksString(str);
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

type DeckState = {
  /** Deck position per scope ("all", or a category name). */
  decks: Record<string, Deck>;
  /** Persisted misc state (e.g. selected category on /shuffle-category). */
  extras: Record<string, string>;
  hasHydrated: boolean;
  setIndex: (scope: string, index: number) => void;
  reshuffle: (scope: string) => void;
  /** Create the scope's deck (with a fresh seed) if it doesn't exist yet. */
  ensureDeck: (scope: string) => void;
  setExtra: (key: string, value: string) => void;
  resetDecks: () => void;
  setHasHydrated: () => void;
};

export const useDeckStore = create<DeckState>()(
  persist(
    (set) => ({
      decks: {},
      extras: {},
      hasHydrated: false,
      setHasHydrated: () => set({ hasHydrated: true }),

      setIndex: (scope, index) =>
        set((p) => {
          const d = p.decks[scope] ?? {
            seed: Date.now().toString(36) + scope,
            index: 0,
          };
          return { decks: { ...p.decks, [scope]: { ...d, index } } };
        }),

      reshuffle: (scope) =>
        set((p) => ({
          decks: {
            ...p.decks,
            [scope]: { seed: Date.now().toString(36) + scope, index: 0 },
          },
        })),

      ensureDeck: (scope) =>
        set((p) =>
          p.decks[scope]
            ? p
            : {
                decks: {
                  ...p.decks,
                  [scope]: { seed: Date.now().toString(36) + scope, index: 0 },
                },
              },
        ),

      setExtra: (key, value) =>
        set((p) => ({ extras: { ...p.extras, [key]: value } })),

      /** Destructive: clears all deck positions + extras. */
      resetDecks: () => set({ decks: {}, extras: {} }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => deckStorage),
      // decks + extras are the persisted shape; hasHydrated is runtime-only
      partialize: (s) => ({
        decks: s.decks,
        extras: s.extras,
      }),
      skipHydration: true,
      // No custom merge: the storage adapter guarantees a clean inner state.
    },
  ),
);

/** Load persisted state (called on AppShell mount + tab sync). */
export function hydrateDecks() {
  void useDeckStore.persist.rehydrate();
}

/** Destructive clear used by DataDialog's "Reset all progress". */
export function resetDecks() {
  useDeckStore.getState().resetDecks();
}

const EMPTY_DECK: Deck = { seed: "", index: 0 };

/**
 * Same hook API as before: position snapshot for one scope, with a lazily
 * created seed so the deck order is stable across re-renders and refreshes.
 * The fallback must be a STABLE reference (zustand v5 compares snapshots
 * with Object.is — a fresh object literal here would loop forever).
 */
export function useDeck(scope: string): {
  deck: Deck;
  setIndex: (index: number) => void;
  reshuffle: () => void;
  ensureDeck: () => void;
} {
  const deck = useDeckStore((s) =>
    s.hasHydrated ? s.decks[scope] ?? EMPTY_DECK : EMPTY_DECK,
  );

  return {
    deck,
    setIndex: (index) => useDeckStore.getState().setIndex(scope, index),
    reshuffle: () => useDeckStore.getState().reshuffle(scope),
    ensureDeck: () => useDeckStore.getState().ensureDeck(scope),
  };
}

/** Reactive read of a persisted extra ("" when unset / before hydration). */
export function useExtra(key: string): string {
  return useDeckStore((s) => (s.hasHydrated ? s.extras[key] ?? "" : ""));
}

export function getExtra(key: string): string | null {
  return useDeckStore.getState().extras[key] ?? null;
}

export function setExtra(key: string, value: string) {
  useDeckStore.getState().setExtra(key, value);
}
