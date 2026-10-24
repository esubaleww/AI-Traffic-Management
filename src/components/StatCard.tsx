import type { ReactNode } from "react";

type Props = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accent?: "sky" | "emerald" | "amber" | "red";
  children?: ReactNode;
};

const ACCENT: Record<NonNullable<Props["accent"]>, string> = {
  sky: "text-sky-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  red: "text-red-400",
};

export function StatCard({ label, value, icon, accent = "sky", children }: Props) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-black/20">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
        <span className={ACCENT[accent]}>{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-4xl font-semibold tabular-nums leading-none text-slate-50">{value}</span>
        {children}
      </div>
    </div>
  );
}
