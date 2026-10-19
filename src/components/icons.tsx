// Small stroke-icon set (24×24 viewBox) so every control shares one style.
type P = { className?: string; size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export function ShuffleIcon({ className, size = 20 }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M3 6h3.5c1.6 0 3 .8 3.9 2.1l3.2 4.8c.9 1.3 2.3 2.1 3.9 2.1H21" />
      <path d="M3 15h3.5c1 0 2-.4 2.7-1.1M21 15l-3-3m3 3-3 3" />
      <path d="M21 6l-3-3m3 3-3 3m3-3h-3.5c-1.3 0-2.5.6-3.3 1.6" />
    </svg>
  );
}

export function LayersIcon({ className, size = 20 }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 3 3 8l9 5 9-5-9-5z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  );
}

export function GradIcon({ className, size = 20 }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M22 10 12 5 2 10l10 5 10-5z" />
      <path d="M6 12.5V17c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-4.5" />
    </svg>
  );
}

export function BookmarkIcon({
  className,
  size = 20,
  filled = false,
}: P & { filled?: boolean }) {
  return (
    <svg {...base(size)} className={className} fill={filled ? "currentColor" : "none"}>
      <path d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-6.5-3.8L5.5 20V5.5a1 1 0 0 1 1-1z" />
    </svg>
  );
}

export function LibraryIcon({ className, size = 20 }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 4h5v16H4zM11 4h4v16h-4z" />
      <path d="M17.5 5l3 14.5" />
    </svg>
  );
}

export function SunIcon({ className, size = 18 }: P) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      <path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4" />
    </svg>
  );
}

export function MoonIcon({ className, size = 18 }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DownloadIcon({ className, size = 18 }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 4v10m0 0l-4-4m4 4l4-4" />
      <path d="M5 19h14" />
    </svg>
  );
}

export function CloseIcon({ className, size = 16 }: P) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ChevronDownIcon({ className, size = 14 }: P) {
  return (
    <svg {...base(size)} className={className} strokeWidth={2.2}>
      <path d="M5 9l7 7 7-7" />
    </svg>
  );
}

export function CheckIcon({ className, size = 15 }: P) {
  return (
    <svg {...base(size)} className={className} strokeWidth={2.6}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

export function CrossIcon({ className, size = 15 }: P) {
  return (
    <svg {...base(size)} className={className} strokeWidth={2.6}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
