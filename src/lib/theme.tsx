"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const COOKIE = "vocab-theme";
const SERVER_SNAPSHOT: Theme = "light";

let currentTheme: Theme | null = null;
const listeners = new Set<() => void>();

/** Cross-tab theme sync (cookies don't fire storage events). */
let channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  if (!channel) {
    channel = new BroadcastChannel("vocab-theme");
    channel.onmessage = (e) => {
      if (e.data === "light" || e.data === "dark")
        setTheme(e.data, { broadcast: false });
    };
  }
  return channel;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Theme {
  if (currentTheme === null) {
    const m =
      typeof document !== "undefined"
        ? document.cookie.match(/(?:^|;\s*)vocab-theme=(light|dark)/)
        : null;
    if (m) currentTheme = m[1] as Theme;
    else
      currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  }
  return currentTheme;
}

const getServerSnapshot = () => SERVER_SNAPSHOT;

function setTheme(theme: Theme, { broadcast = true }: { broadcast?: boolean } = {}) {
  currentTheme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.cookie = `${COOKIE}=${theme};path=/;max-age=31536000;samesite=lax`;
  listeners.forEach((l) => l());
  if (broadcast) getChannel()?.postMessage(theme);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Ensure the receiving side exists even before this tab's first toggle.
  getChannel();
  return { theme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}

/** Apply stored theme on first paint of an already-loaded page. */
if (typeof document !== "undefined") {
  const theme = getSnapshot();
  document.documentElement.classList.toggle("dark", theme === "dark");
}
