"use client";

/**
 * Tracks the last value this tab wrote to each localStorage key. Used by
 * tab sync to distinguish "another tab changed something" from "the write
 * my own rehydrate just echoed back" — without this guard, two tabs
 * ping-pong rehydrate→write→storage-event forever.
 */
const lastWritten = new Map<string, string>();

export function noteWrite(key: string, value: string) {
  lastWritten.set(key, value);
}

export function isForeignWrite(key: string, newValue: string | null): boolean {
  return newValue !== lastWritten.get(key);
}
