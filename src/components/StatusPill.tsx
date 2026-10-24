import { Activity, Wifi, WifiOff } from "lucide-react";
import type { StreamStatus } from "@/types/traffic";

export type PillKind = "live" | "offline" | "mock" | "connecting";

type Props = {
  kind: PillKind;
  label?: string;
};

const STYLES: Record<PillKind, { dot: string; text: string; ring: string; icon: JSX.Element }> = {
  live: {
    dot: "bg-emerald-500",
    text: "text-emerald-300",
    ring: "ring-emerald-500/30",
    icon: <Activity className="h-3.5 w-3.5" />,
  },
  mock: {
    dot: "bg-amber-400",
    text: "text-amber-300",
    ring: "ring-amber-400/30",
    icon: <Activity className="h-3.5 w-3.5" />,
  },
  connecting: {
    dot: "bg-sky-500",
    text: "text-sky-300",
    ring: "ring-sky-500/30",
    icon: <Wifi className="h-3.5 w-3.5" />,
  },
  offline: {
    dot: "bg-red-500",
    text: "text-red-300",
    ring: "ring-red-500/30",
    icon: <WifiOff className="h-3.5 w-3.5" />,
  },
};

const LABELS: Record<PillKind, string> = {
  live: "Live",
  offline: "Offline",
  mock: "Mock",
  connecting: "Connecting",
};

export function StatusPill({ kind, label }: Props) {
  const s = STYLES[kind];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-1 text-xs font-medium ring-1 ${s.ring} ${s.text}`}
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        {kind !== "offline" && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.dot} opacity-60`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`} />
      </span>
      {s.icon}
      {label ?? LABELS[kind]}
    </span>
  );
}

export function statusToPill(status: StreamStatus, isMock: boolean): PillKind {
  if (isMock) return "mock";
  if (status === "live") return "live";
  if (status === "connecting") return "connecting";
  return "offline";
}
