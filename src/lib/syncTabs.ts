"use client";

import { hydrateProgress, useProgressStore } from "@/lib/useProgress";
import { hydrateDecks, useDeckStore } from "@/lib/deck";

let installed = false;

/**
 * Cross-tab sync: when another tab writes one of our localStorage keys,
 * rehydrate the matching zustand store so every hook re-renders with fresh
 * state. Echo writes from this tab are deduped in the storage adapters
 * (identical content = no-op), so this listener can't loop.
 */
export function installTabSync() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  // Subscribe BEFORE hydrating: rehydrate() is synchronous (localStorage),
  // so a listener registered afterwards would miss the finish event.
  useProgressStore.persist.onFinishHydration(() => {
    useProgressStore.setState({ hasHydrated: true });
  });
  useDeckStore.persist.onFinishHydration(() => {
    useDeckStore.setState({ hasHydrated: true });
  });

  // Initial load: pull persisted state into both stores.
  hydrateProgress();
  hydrateDecks();

  window.addEventListener("storage", (e) => {
    if (e.key === null || e.key === "vocab-prep-progress-v1") {
      hydrateProgress();
    }
    if (e.key === null || e.key === "vocab-prep-decks-v1") {
      hydrateDecks();
    }
  });
}
