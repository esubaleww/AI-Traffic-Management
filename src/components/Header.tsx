import { ShieldAlert, TrafficCone } from "lucide-react";
import { StatusPill, type PillKind } from "./StatusPill";

type Props = {
  pill: PillKind;
};

export function Header({ pill }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/30">
            <TrafficCone className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <h1 className="text-base font-semibold text-slate-100 sm:text-lg">
              Bahir Dar AI Traffic Management
            </h1>
            <p className="text-xs text-slate-500">Computer-vision intersection control — demo dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-md border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
            <ShieldAlert className="h-3.5 w-3.5" />
            Simulation — not a real traffic controller
          </span>
          <StatusPill kind={pill} />
        </div>
      </div>
    </header>
  );
}
