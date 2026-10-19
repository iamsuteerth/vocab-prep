"use client";

import { CloseIcon } from "@/components/icons";

export function ConfirmDialog({
  title,
  body,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
}: {
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="animate-fade-up w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-reading text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="pressable rounded-full p-1.5 text-text-muted"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body supports paragraph breaks ("\n\n" → separate paragraphs). */}
        <div className="font-reading mt-2 space-y-3 text-[0.9375rem] leading-relaxed text-text-muted">
          {body.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            onClick={onClose}
            className="pressable font-ui rounded-2xl border border-border py-3 font-semibold text-text-muted"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="pressable font-ui rounded-2xl bg-dontknow py-3 font-semibold text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
