export function ProgressRing({
  done,
  total,
  size = 40,
}: {
  done: number;
  total: number;
  size?: number;
}) {
  const pct = total === 0 ? 0 : done / total;
  const r = (size - 5) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={done}
      aria-valuemax={total}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={3.5}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
    </div>
  );
}
