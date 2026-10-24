import { Bell, Clock } from "lucide-react";
import type { TrafficAlert } from "@/types/traffic";

type Props = {
  alerts: TrafficAlert[];
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function AlertList({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-500">
        <Bell className="h-8 w-8" />
        <p className="text-sm">No alerts.</p>
      </div>
    );
  }

  return (
    <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
      {alerts.map((a) => (
        <li
          key={a.id}
          className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
        >
          <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-sky-500" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-200">{a.message}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {formatTime(a.time)}
              <span className="ml-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                {a.type}
              </span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
