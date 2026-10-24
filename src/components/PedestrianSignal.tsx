import { Hand, PersonStanding } from "lucide-react";
import type { PedestrianSignal } from "@/types/traffic";

type Props = {
  signal: PedestrianSignal;
};

export function PedestrianSignal({ signal }: Props) {
  const walk = signal === "walk";
  const color = walk ? "#22c55e" : "#ef4444";
  const label = walk ? "WALK" : "WAIT";

  return (
    <div className="flex items-center gap-4">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-xl border transition-all duration-300"
        style={{
          backgroundColor: `${color}1a`,
          borderColor: color,
          boxShadow: walk ? "0 0 24px 4px rgba(34,197,94,0.5)" : "0 0 12px 0 rgba(239,68,68,0.3)",
        }}
        aria-label={`Pedestrian signal ${signal}`}
      >
        {walk ? (
          <PersonStanding className="h-8 w-8" style={{ color }} aria-hidden="true" />
        ) : (
          <Hand className="h-8 w-8" style={{ color }} aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-col">
        <span
          className="text-sm font-semibold tracking-widest transition-colors"
          style={{ color: walk ? "#86efac" : "#fca5a5" }}
        >
          {label}
        </span>
        <span className="text-xs text-slate-500">Pedestrian phase</span>
      </div>
    </div>
  );
}
