"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { WordCard } from "@/components/WordCard";
import { ProgressRing } from "@/components/ProgressRing";
import { useProgress } from "@/lib/useProgress";
import { useDeck, useExtra, setExtra } from "@/lib/deck";
import { CATEGORIES, seededShuffle, wordsByCategory } from "@/lib/words";

export default function ShuffleCategoryPage() {
  const { markSeen } = useProgress();
  // Selected category lives in the persisted deck store (survives refresh,
  // read reactively — no setState-in-effect).
  const savedCategory = useExtra("category");
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  // "" (explicitly cleared) wins over a saved value; null until user acts.
  const category = picked ?? (savedCategory || null);

  const { deck, setIndex, reshuffle, ensureDeck } = useDeck(
    category ?? "__picker__",
  );
  const active = category;

  // Create the scope's deck when a category is picked (or restored).
  useEffect(() => {
    if (active) ensureDeck();
  }, [active, ensureDeck]);

  const pick = useCallback((cat: string) => {
    setPicked(cat);
    setExtra("category", cat);
    setRevealed(false);
  }, []);

  const backToPicker = useCallback(() => {
    setPicked("");
    setExtra("category", "");
    setRevealed(false);
  }, []);

  const deckOrder = useMemo(
    () =>
      active && deck.seed && deck.seed !== "__picker__"
        ? seededShuffle(wordsByCategory(active), deck.seed)
        : [],
    [active, deck.seed],
  );

  const current = deckOrder[deck.index];

  useEffect(() => {
    if (current) markSeen(current.id);
  }, [current, markSeen]);

  const finished = active !== null && deck.index >= deckOrder.length;

  if (!active) {
    return (
      <div className="animate-fade-up">
        <h2 className="word-display">Categories</h2>
        <p className="font-reading mt-1.5 text-text-muted">
          Pick one — the words inside are shuffled.
        </p>
        <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => pick(cat)}
              className="pressable flex items-baseline justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5 text-left"
            >
              <span className="font-reading font-semibold">{cat}</span>
              <span className="font-ui shrink-0 text-text-muted">
                {wordsByCategory(cat).length}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up" key={current?.id ?? "done"}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          onClick={backToPicker}
          className="pressable font-ui rounded-full border border-border px-3.5 py-1.5 text-text-muted"
        >
          ← Categories
        </button>
        <div className="flex items-center gap-2.5">
          <span className="label-caps">{active}</span>
          <ProgressRing done={deck.index} total={deckOrder.length} size={36} />
        </div>
      </div>

      {finished ? (
        <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
          <div className="animate-pop text-5xl">🎉</div>
          <h2 className="word-display">{active}</h2>
          <p className="font-reading text-text-muted">
            All {deckOrder.length} words done.
          </p>
          <div className="mt-1 flex gap-3">
            <button
              onClick={() => {
                reshuffle();
                setRevealed(false);
              }}
              className="pressable rounded-2xl bg-accent px-6 py-3 text-[0.9375rem] font-semibold text-white"
            >
              Again
            </button>
            <button
              onClick={backToPicker}
              className="pressable rounded-2xl border border-border px-6 py-3 text-[0.9375rem] font-semibold text-text-muted"
            >
              Other categories
            </button>
          </div>
        </div>
      ) : current ? (
        <>
          <p className="font-ui mb-4 text-text-muted">
            <span className="font-semibold text-text">{deck.index + 1}</span>
            <span className="opacity-70"> / {deckOrder.length}</span>
          </p>
          <WordCard
            word={current}
            revealMode
            revealed={revealed}
            onReveal={() => setRevealed(true)}
            onGraded={() => {
              setIndex(deck.index + 1);
              setRevealed(false);
            }}
          />
        </>
      ) : (
        <div className="flex h-64 items-center justify-center text-text-muted">
          Shuffling…
        </div>
      )}
    </div>
  );
}
