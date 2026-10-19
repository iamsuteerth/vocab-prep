"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme";
import {
  ShuffleIcon,
  LayersIcon,
  GradIcon,
  BookmarkIcon,
  LibraryIcon,
  SunIcon,
  MoonIcon,
  DownloadIcon,
} from "@/components/icons";

const TABS = [
  { href: "/", label: "Shuffle", Icon: ShuffleIcon },
  { href: "/shuffle-category", label: "Categories", Icon: LayersIcon },
  { href: "/learning", label: "Learning", Icon: GradIcon },
  { href: "/bookmarked", label: "Saved", Icon: BookmarkIcon },
  { href: "/library", label: "Library", Icon: LibraryIcon },
];

function Tooltip({ text, side = "top" }: { text: string; side?: "top" | "bottom" }) {
  // NOTE: class names must be written literally — Tailwind can't see
  // dynamically constructed ones like `${side}-full`.
  const pos =
    side === "top"
      ? "bottom-full mb-1.5" // tooltip above the trigger
      : "top-full mt-1.5"; // tooltip below the trigger
  return (
    <span
      role="tooltip"
      className={`pointer-events-none absolute ${pos} left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg bg-text px-2 py-1 font-ui text-[0.6875rem] font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100`}
    >
      {text}
    </span>
  );
}

export function Header({ onOpenData }: { onOpenData: () => void }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-surface shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 pb-2 pt-3">
        <Link href="/" className="word-display text-[1.35rem] leading-none">
          Vocab<span className="text-accent">Prep</span>
        </Link>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={onOpenData}
            aria-label="Import or export progress"
            className="group relative pressable rounded-full p-2 text-text-muted hover:bg-surface-2 hover:text-text"
          >
            <DownloadIcon />
            <Tooltip text="Import / export" side="bottom" />
          </button>
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="pressable rounded-full p-2 text-text-muted hover:bg-surface-2 hover:text-text"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      <nav
        aria-label="Modes"
        className="mx-auto flex max-w-3xl items-center justify-between gap-1 px-6 pb-2"
      >
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center justify-center rounded-xl p-2.5 transition-colors ${
                active
                  ? "bg-accent text-white"
                  : "text-text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              <Icon size={21} />
              <Tooltip text={label} side="bottom" />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
