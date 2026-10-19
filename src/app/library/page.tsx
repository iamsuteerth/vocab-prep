"use client";

import { useMemo, useState } from "react";
import { useProgress } from "@/lib/useProgress";
import type { Word, WordStatus } from "@/lib/types";
import { CATEGORIES, WORDS } from "@/lib/words";

const BATCH = 40;

function StatusDot({ id }: { id: string }) {
  const { progress } = useProgress();
  const s = progress.statuses[id];
  return (
    <span
      aria-hidden
      className={`h-2 w-2 shrink-0 rounded-full ${
        s === "know" ? "bg-know" : s === "dontKnow" ? "bg-dontknow" : "bg-border"
      }`}
    />
  );
}

function RowActions({ word }: { word: Word }) {
  const { progress, setStatus, toggleBookmark } = useProgress();
  const status = progress.statuses[word.id] ?? "new";
  const bookmarked = progress.bookmarks.includes(word.id);

  const cycle = () => {
    const next: WordStatus =
      status === "new" ? "know" : status === "know" ? "dontKnow" : "new";
    setStatus(word.id, next);
  };

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <button
        onClick={(e) => {
          e.stopPropagation();
          cycle();
        }}
        title="Tap to cycle: New → Know → Didn't know"
        className={`pressable font-ui rounded-full px-2.5 py-1 font-semibold ${
          status === "know"
            ? "bg-know-soft text-know"
            : status === "dontKnow"
              ? "bg-dontknow-soft text-dontknow"
              : "bg-surface-2 text-text-muted"
        }`}
      >
        {status === "know" ? "Know" : status === "dontKnow" ? "Nope" : "New"}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleBookmark(word.id);
        }}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark this word"}
        className={`pressable rounded-full p-1 ${
          bookmarked ? "text-bookmark" : "text-text-muted/50"
        }`}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
          <path
            d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-3.8L5.5 20V5.5a1 1 0 0 1 1-1z"
            fill={bookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </span>
  );
}

function ExpandedDetail({ word }: { word: Word }) {
  return (
    <div className="border-t border-border bg-surface-2/50 px-4 py-4">
      <p className="font-ui text-text-muted">{word.type}</p>
      <p className="font-reading mt-2">{word.definition}</p>
      <p className="font-reading mt-2 text-[0.9375rem] text-text-muted italic">
        {word.usage}
      </p>
      <p className="font-reading mt-2 text-[0.9375rem]">
        <span className="font-ui mr-1.5 font-semibold text-bookmark">Cue</span>
        {word.memoryCue}
      </p>
    </div>
  );
}

function WordRow({
  word,
  open,
  onToggle,
}: {
  word: Word;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="border-t border-border first:border-t-0"
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 57px" }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
      >
        <StatusDot id={word.id} />
        <span className="font-reading min-w-0 flex-1 truncate font-semibold">
          {word.word}
        </span>
        <span className="font-reading hidden max-w-[220px] truncate text-[0.8125rem] text-text-muted sm:block">
          {word.definition}
        </span>
        <RowActions word={word} />
      </div>
      {open && <ExpandedDetail word={word} />}
    </div>
  );
}

export default function LibraryPage() {
  const { hydrated } = useProgress();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [limit, setLimit] = useState(BATCH);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORDS.filter((w) => {
      if (category !== "all" && w.category !== category) return false;
      if (!q) return true;
      return (
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  // Reset the lazy window whenever the filter changes.
  const filterKey = `${category}|${query.trim().toLowerCase()}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setLimit(BATCH);
    setExpanded(null);
  }

  const visible = filtered.slice(0, limit);
  const groupLabel =
    category === "all" ? "All words" : category;

  if (!hydrated) {
    return (
      <div className="flex h-64 items-center justify-center text-text-muted">
        Loading…
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div
        className="sticky z-30 -mx-4 -mt-6 bg-surface px-4 pb-2 pt-1"
        style={{
          // Overlap the header's bottom border by 1px so no content can
          // peek through the seam (header-h can be fractional).
          top: "calc(var(--header-h, 104px) - 1px)",
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search words or definitions…"
          className="font-reading w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-[0.9375rem] outline-none transition-colors focus:border-accent"
        />
        <div className="scroll-x mt-2 flex gap-1.5 pb-1">
          <button
            onClick={() => setCategory("all")}
            className={`pressable font-ui whitespace-nowrap rounded-full px-3 py-1.5 font-medium ${
              category === "all"
                ? "bg-accent text-white"
                : "border border-border bg-surface text-text-muted"
            }`}
          >
            All · {WORDS.length}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`pressable font-ui whitespace-nowrap rounded-full px-3 py-1.5 font-medium ${
                category === cat
                  ? "bg-accent text-white"
                  : "border border-border bg-surface text-text-muted"
              }`}
            >
              {cat.split(",")[0].split(" & ")[0]}
            </button>
          ))}
        </div>
      </div>

      <h3 className="label-caps mb-2 mt-3">
        {groupLabel}
        <span className="ml-2 opacity-60">{filtered.length}</span>
      </h3>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {visible.map((w) => (
          <WordRow
            key={w.id}
            word={w}
            open={expanded === w.id}
            onToggle={() => setExpanded(expanded === w.id ? null : w.id)}
          />
        ))}
      </div>

      {limit < filtered.length && (
        <button
          onClick={() => setLimit((l) => l + BATCH * 2)}
          className="pressable font-ui mt-3 w-full rounded-2xl border border-border bg-surface py-3 font-semibold text-text-muted"
        >
          Show more ({filtered.length - limit} remaining)
        </button>
      )}

      {filtered.length === 0 && (
        <p className="font-reading py-16 text-center text-text-muted">
          No words match “{query}”.
        </p>
      )}
    </div>
  );
}
