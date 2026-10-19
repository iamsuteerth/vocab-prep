"use client";

import { useMemo, useState } from "react";
import { WordCard } from "@/components/WordCard";
import { useProgress } from "@/lib/useProgress";
import { WORDS, shuffle } from "@/lib/words";

/**
 * Learning mode: cycles through the live pile of "Didn't know" words.
 * No sessions, no reveal — the full card is shown and Sure / Not sure moves
 * the word out of (or keeps it in) the don't-know pile.
 */
export default function LearningPage() {
  const { progress, hydrated } = useProgress();
  const [pos, setPos] = useState(0);

  // Pile order: shuffled once per visit (client-side only — Math.random is
  // banned during prerender), then filtered by live statuses so graduating a
  // word shrinks the pile without reshuffling the rest.
  const pile = useMemo(
    () =>
      hydrated
        ? getVisitOrder().filter((id) => progress.statuses[id] === "dontKnow")
        : [],
    [hydrated, progress.statuses],
  );

  const currentId = pile.length > 0 ? pile[pos % pile.length] : undefined;
  const word = currentId ? WORDS.find((w) => w.id === currentId) : undefined;

  if (!hydrated) {
    return (
      <div className="flex h-64 items-center justify-center text-text-muted">
        Loading…
      </div>
    );
  }

  if (!word) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center animate-fade-up">
        <div className="animate-pop text-5xl">🌱</div>
        <h2 className="word-display">All clear</h2>
        <p className="font-reading max-w-xs text-text-muted">
          Nothing to review. Mark words as &ldquo;Don&apos;t know&rdquo; and
          they&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up" key={word.id}>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-ui text-text-muted">
          <span className="font-semibold text-text">
            {(pos % pile.length) + 1}
          </span>
          <span className="opacity-70"> / {pile.length}</span>
        </p>
      </div>

      <WordCard
        word={word}
        gradeVariant="sureUnsure"
        onGraded={() => setPos((p) => p + 1)}
      />
    </div>
  );
}

// One shuffle per module lifetime — pile order stays stable as words
// graduate (only client-side: Math.random must not run during prerender).
let visitOrder: string[] | null = null;
function getVisitOrder(): string[] {
  if (visitOrder === null) visitOrder = shuffle(WORDS.map((w) => w.id));
  return visitOrder;
}
