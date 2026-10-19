"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { DataDialog } from "@/components/DataDialog";
import { installTabSync } from "@/lib/syncTabs";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [dataOpen, setDataOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Cross-tab sync + initial hydration (single listener for the page's life).
  useEffect(() => {
    installTabSync();
  }, []);

  // Also keep the header height in sync from here — the ref-based approach on
  // <header> ran before CSS/layout settled and produced a fractional value.
  useEffect(() => {
    const root = document.documentElement;
    const set = () => {
      const header = document.querySelector("header");
      if (header) root.style.setProperty("--header-h", `${header.offsetHeight}px`);
    };
    // Fonts load async and change header height — re-check after settle.
    set();
    document.fonts?.ready.then(set);
    const ro = new ResizeObserver(set);
    const header = document.querySelector("header");
    if (header) ro.observe(header);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <Header onOpenData={() => setDataOpen(true)} />
      <main ref={mainRef} className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {children}
      </main>
      {dataOpen && <DataDialog onClose={() => setDataOpen(false)} />}
    </>
  );
}
