import type { VehicleLight } from "@/types/traffic";

type Props = {
  light: VehicleLight;
};

const LIGHTS: { key: VehicleLight; label: string; color: string; glow: string }[] = [
  { key: "red", label: "STOP", color: "#ef4444", glow: "shadow-[0_0_24px_4px_rgba(239,68,68,0.7)]" },
  { key: "yellow", label: "CAUTION", color: "#fbbf24", glow: "shadow-[0_0_24px_4px_rgba(251,191,36,0.7)]" },
  { key: "green", label: "GO", color: "#22c55e", glow: "shadow-[0_0_24px_4px_rgba(34,197,94,0.7)]" },
];

export function TrafficLight({ light }: Props) {
  return (
    <div className="flex items-center gap-5">
      <div
        className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4"
        aria-label={`Vehicle signal ${light}`}
      >
        {LIGHTS.map((l) => {
          const active = light === l.key;
          return (
            <div
              key={l.key}
              className="flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300"
              style={{
                backgroundColor: active ? l.color : "#0f172a",
                borderColor: active ? l.color : "#1e293b",
              }}
              aria-hidden="true"
            >
              {active && <span className={`h-full w-full rounded-full ${l.glow}`} />}
            </div>
          );
        })}
      </div>
      <div className="flex flex-col justify-between self-stretch py-1">
        {LIGHTS.map((l) => (
          <span
            key={l.key}
            className={`text-xs font-semibold tracking-widest transition-colors ${
              light === l.key ? "text-slate-100" : "text-slate-600"
            }`}
          >
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
