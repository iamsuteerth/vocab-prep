"use client";

import { useState } from "react";
import { useProgress } from "@/lib/useProgress";
import { resetDecks } from "@/lib/deck";
import { CloseIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function DataDialog({ onClose }: { onClose: () => void }) {
  const { exportProgress, importProgress, resetAll } = useProgress();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const download = () => {
    const blob = new Blob([exportProgress()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vocab-prep-progress.json";
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Progress file downloaded.");
    setErr(false);
  };

  const onFile = async (file: File) => {
    const text = await file.text();
    const error = importProgress(text);
    setErr(error !== null);
    setMsg(error ?? "Progress imported.");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Progress data"
        className="animate-fade-up w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-reading text-lg font-bold">Progress data</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="pressable rounded-full p-1.5 text-text-muted"
          >
            <CloseIcon />
          </button>
        </div>

        <p className="font-reading mt-2 text-[0.9375rem] text-text-muted">
          Progress lives in this browser only. Export it as JSON to move it to
          another device.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            onClick={download}
            className="pressable font-ui rounded-2xl bg-accent py-3 font-semibold text-white"
          >
            Export
          </button>
          <label className="pressable font-ui cursor-pointer rounded-2xl border border-border py-3 text-center font-semibold">
            Import
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {msg && (
          <p
            className={`font-ui mt-3 ${
              err ? "text-dontknow" : "text-know"
            }`}
          >
            {msg}
          </p>
        )}

        <button
          onClick={() => setConfirmReset(true)}
          className="pressable font-ui mt-5 w-full rounded-2xl border border-border py-3 font-semibold text-text-muted"
        >
          Reset all progress
        </button>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="Reset all progress?"
          body={
            "This clears every Know / Don't-know marking and the shuffle position on this device.\n\nBookmarks are kept. This cannot be undone."
          }
          confirmLabel="Reset"
          onConfirm={() => {
            resetAll();
            resetDecks();
            setMsg("All progress reset.");
            setErr(false);
          }}
          onClose={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}
