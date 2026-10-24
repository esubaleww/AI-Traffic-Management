type Props = {
  /** Seconds remaining in the current green phase. */
  seconds: number;
  /** Total recommended green seconds (ring full scale). */
  total: number;
  active: boolean;
};

export function CountdownRing({ seconds, total, active }: Props) {
  const safeTotal = Math.max(1, total);
  const remaining = Math.max(0, Math.min(seconds, safeTotal));
  const fraction = remaining / safeTotal;

  const size = 56;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * fraction;

  const color = !active ? "#475569" : remaining <= 5 ? "#f59e0b" : "#10b981";

  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-all duration-500 ease-linear"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums"
        style={{ color }}
      >
        {active ? Math.ceil(remaining) : "—"}
      </span>
    </div>
  );
}
