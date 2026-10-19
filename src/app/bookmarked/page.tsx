"use client";

import { useMemo, useState } from "react";
import { WordCard } from "@/components/WordCard";
import { useProgress } from "@/lib/useProgress";
import { WORDS } from "@/lib/words";

export default function BookmarkedPage() {
  const { progress, hydrated } = useProgress();
  const [index, setIndex] = useState(0);

  const bookmarked = useMemo(
    () =>
      hydrated
        ? progress.bookmarks
            .map((id) => WORDS.find((w) => w.id === id))
            .filter((w): w is NonNullable<typeof w> => Boolean(w))
        : [],
    [hydrated, progress.bookmarks],
  );

  if (!hydrated) {
    return (
      <div className="flex h-64 items-center justify-center text-text-muted">
        Loading…
      </div>
    );
  }

  if (bookmarked.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center animate-fade-up">
        <div className="animate-pop text-5xl text-bookmark">★</div>
        <h2 className="word-display">No bookmarks</h2>
        <p className="font-reading max-w-xs text-text-muted">
          Tap the bookmark on any word to keep it here for quick access.
        </p>
      </div>
    );
  }

  // Derive a safe index so removing a bookmark never shows a stale slot.
  const clampedIndex = Math.min(index, bookmarked.length - 1);
  const word = bookmarked[clampedIndex];

  return (
    <div className="animate-fade-up" key={word.id}>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-ui text-text-muted">
          <span className="font-semibold text-text">{clampedIndex + 1}</span>
          <span className="opacity-70"> / {bookmarked.length}</span>
        </p>
        <span className="label-caps text-bookmark">Bookmarked</span>
      </div>

      <WordCard word={word} />

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={clampedIndex === 0}
          className="pressable rounded-2xl border border-border bg-surface py-3.5 text-[0.9375rem] font-semibold text-text-muted"
        >
          ← Prev
        </button>
        <button
          onClick={() =>
            setIndex((i) => Math.min(bookmarked.length - 1, i + 1))
          }
          disabled={clampedIndex === bookmarked.length - 1}
          className="pressable rounded-2xl bg-accent py-3.5 text-[0.9375rem] font-semibold text-white"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
