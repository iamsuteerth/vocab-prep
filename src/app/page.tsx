"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { WordCard } from "@/components/WordCard";
import { ProgressRing } from "@/components/ProgressRing";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useProgress } from "@/lib/useProgress";
import { useDeck } from "@/lib/deck";
import { WORDS, seededShuffle } from "@/lib/words";

export default function ShufflePage() {
  const { markSeen, resetSeen, stats, hydrated } = useProgress();
  const { deck, setIndex, reshuffle, ensureDeck } = useDeck("all");
  const [revealed, setRevealed] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Create this scope's deck on first visit (external-store update in an
  // effect — the sanctioned pattern, no setState-in-render).
  useEffect(() => {
    ensureDeck();
  }, [ensureDeck]);

  const deckOrder = useMemo(
    () => (deck.seed ? seededShuffle(WORDS, deck.seed) : []),
    [deck.seed],
  );

  const current = deckOrder[deck.index];

  const restart = useCallback(() => {
    resetSeen();
    reshuffle();
    setRevealed(false);
  }, [resetSeen, reshuffle]);

  useEffect(() => {
    if (current) markSeen(current.id);
  }, [current, markSeen]);

  if (!hydrated || !current) {
    return (
      <div className="flex h-64 items-center justify-center text-text-muted">
        Shuffling…
      </div>
    );
  }

  const finished = deck.index >= deckOrder.length;

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-20 text-center animate-fade-up">
        <div className="animate-pop text-5xl">🎉</div>
        <h2 className="word-display">Deck complete</h2>
        <p className="font-reading text-text-muted">
          You went through all {deckOrder.length} words.
        </p>
        <div className="mt-1 flex gap-6">
          <div>
            <p className="text-2xl font-bold text-know">{stats.know}</p>
            <p className="label-caps mt-0.5">Know</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-dontknow">{stats.dontKnow}</p>
            <p className="label-caps mt-0.5">Review</p>
          </div>
        </div>
        <button
          onClick={restart}
          className="pressable mt-2 rounded-2xl bg-accent px-8 py-3.5 text-[0.9375rem] font-semibold text-white"
        >
          Shuffle again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-up" key={current.id}>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-ui text-text-muted">
            <span className="font-semibold text-text">{deck.index + 1}</span>
            <span className="opacity-70"> / {deckOrder.length}</span>
          </p>
          <div className="flex items-center gap-3">
            <ProgressRing done={stats.seen} total={stats.total} />
            <button
              onClick={() => setConfirmReset(true)}
              className="pressable font-ui rounded-full border border-border px-3.5 py-1.5 text-text-muted"
            >
              Reset
            </button>
          </div>
        </div>

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
      </div>

      {/* Outside the animate-fade-up wrapper: its `animation-fill-mode: both`
          keeps a transform applied, which would become the containing block
          for this dialog's position:fixed backdrop (backdrop stops covering
          the viewport). */}
      {confirmReset && (
        <ConfirmDialog
          title="Reset shuffle progress?"
          body={"This marks all 550 words as unseen and starts a new shuffle from word 1.\n\nYour Know / Don't-know markings and bookmarks are kept."}
          confirmLabel="Reset"
          onConfirm={() => {
            resetSeen();
            reshuffle();
            setRevealed(false);
          }}
          onClose={() => setConfirmReset(false)}
        />
      )}
    </>
  );
}
