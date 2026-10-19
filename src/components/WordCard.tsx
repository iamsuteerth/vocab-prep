"use client";

import { useState } from "react";
import { useProgress } from "@/lib/useProgress";
import type { Word } from "@/lib/types";
import { CheckIcon, CrossIcon, BookmarkIcon, ChevronDownIcon } from "@/components/icons";

/**
 * Flashcard-style word card. `revealMode` turns it into a two-state card:
 * the meaning stays hidden until the user taps "Reveal". Grading is only
 * possible after the reveal, and grading advances the deck via onGraded —
 * no separate Next button.
 */
export function WordCard({
  word,
  onGraded,
  revealMode = false,
  revealed: revealedProp,
  onReveal,
  gradeVariant = "knowDontKnow",
}: {
  word: Word;
  /** Called after a grade is recorded — lets the parent advance the deck. */
  onGraded?: (status: "know" | "dontKnow") => void;
  /** Hide the meaning until reveal; grade buttons appear after reveal. */
  revealMode?: boolean;
  /** Controlled reveal state (used with revealMode). */
  revealed?: boolean;
  onReveal?: () => void;
  /** Learning mode grades with Sure/Not sure instead of Know/Don't know. */
  gradeVariant?: "knowDontKnow" | "sureUnsure";
}) {
  const { progress, setStatus, toggleBookmark } = useProgress();
  const [graded, setGraded] = useState<"know" | "dontKnow" | null>(null);
  const [revealedLocal, setRevealedLocal] = useState(false);
  const revealed = revealMode ? (revealedProp ?? revealedLocal) : true;
  const bookmarked = progress.bookmarks.includes(word.id);

  const grade = (g: "know" | "dontKnow") => {
    if (graded) return;
    setGraded(g);
    setStatus(word.id, g);
    // Let the confirmation state paint, then advance.
    setTimeout(() => {
      onGraded?.(g);
      setGraded(null);
    }, 220);
  };

  return (
    <article className="rounded-3xl border border-border bg-surface px-6 pb-6 pt-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
      <div className="flex items-center gap-2">
        <span className="label-caps">{word.category}</span>
        <span className="font-ui ml-auto text-text-muted/70">{word.id}</span>
        <button
          onClick={() => toggleBookmark(word.id)}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark this word"}
          className={`pressable rounded-full p-1.5 ${
            bookmarked ? "text-bookmark" : "text-text-muted/60 hover:text-text"
          }`}
        >
          <BookmarkIcon filled={bookmarked} />
        </button>
      </div>

      <h2 className="word-display mt-3">{word.word}</h2>
      <p className="font-ui mt-1.5 text-text-muted">{word.type}</p>

      {revealed ? (
        <>
          <div className="my-4 h-px bg-border" />

          <p className="font-reading">{word.definition}</p>

          <blockquote className="mt-4 border-l-2 border-accent/40 pl-3.5">
            <p className="label-caps">Usage</p>
            <p className="font-reading mt-1 text-text-muted italic">
              {word.usage}
            </p>
          </blockquote>

          <p className="font-reading mt-4 rounded-2xl bg-surface-2 px-4 py-3 text-[0.9375rem]">
            <span className="font-ui mr-1.5 font-semibold text-bookmark">Cue</span>
            {word.memoryCue}
          </p>
        </>
      ) : (
        <button
          onClick={onReveal ?? (() => setRevealedLocal(true))}
          className="pressable font-ui mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 font-semibold text-text-muted"
        >
          <ChevronDownIcon />
          Tap to reveal meaning
        </button>
      )}

      {/* Grade buttons: always available in grade mode, after reveal in reveal mode */}
      {(!revealMode || revealed) && gradeVariant === "knowDontKnow" && (
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <button
            onClick={() => grade("dontKnow")}
            className={`pressable flex items-center justify-center gap-2 rounded-2xl py-3.5 ${
              graded === "dontKnow"
                ? "bg-dontknow text-white"
                : "bg-dontknow-soft text-dontknow"
            }`}
          >
            {graded === "dontKnow" ? <CheckIcon /> : <CrossIcon />}
            <span className="text-[0.9375rem] font-semibold">Don&apos;t know</span>
          </button>
          <button
            onClick={() => grade("know")}
            className={`pressable flex items-center justify-center gap-2 rounded-2xl py-3.5 ${
              graded === "know"
                ? "bg-know text-white"
                : "bg-know-soft text-know"
            }`}
          >
            {graded === "know" && <CheckIcon />}
            <span className="text-[0.9375rem] font-semibold">Know</span>
          </button>
        </div>
      )}

      {(!revealMode || revealed) && gradeVariant === "sureUnsure" && (
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <button
            onClick={() => grade("dontKnow")}
            className={`pressable rounded-2xl py-3.5 ${
              graded === "dontKnow"
                ? "bg-dontknow text-white"
                : "bg-dontknow-soft text-dontknow"
            }`}
          >
            <span className="text-[0.9375rem] font-semibold">Not sure</span>
          </button>
          <button
            onClick={() => grade("know")}
            className={`pressable rounded-2xl py-3.5 ${
              graded === "know"
                ? "bg-know text-white"
                : "bg-know-soft text-know"
            }`}
          >
            <span className="text-[0.9375rem] font-semibold">Sure</span>
          </button>
        </div>
      )}
    </article>
  );
}
