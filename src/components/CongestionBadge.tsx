import type { CongestionLevel } from "@/types/traffic";

type Props = {
  level: CongestionLevel;
};

const MAP: Record<CongestionLevel, { bg: string; text: string; border: string; label: string }> = {
  low: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/40", label: "Low" },
  medium: { bg: "bg-amber-400/15", text: "text-amber-300", border: "border-amber-400/40", label: "Medium" },
  high: { bg: "bg-red-500/15", text: "text-red-300", border: "border-red-500/40", label: "High" },
};

export function CongestionBadge({ level }: Props) {
  const s = MAP[level];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${s.bg} ${s.text} ${s.border}`}
    >
      {s.label}
    </span>
  );
}
