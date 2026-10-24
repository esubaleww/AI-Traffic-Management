import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Card } from "./Card";
import { Skeleton } from "./Skeleton";
import { ErrorBanner } from "./ErrorBanner";
import type { Violation } from "@/lib/supabase";

type Props = {
  violations: Violation[];
  loading: boolean;
  error: string | null;
  onMarkReviewed: (id: string) => void;
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function ViolationsPanel({ violations, loading, error, onMarkReviewed }: Props) {
  return (
    <Card
      title="Red-Light Violations"
      icon={<ShieldAlert className="h-4 w-4 text-red-400" />}
      actions={
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs tabular-nums text-slate-300">
          {violations.length}
        </span>
      }
    >
      <div className="space-y-3">
        {error && <ErrorBanner message={error} onDismiss={() => undefined} />}

        {loading && <Skeleton className="h-40 w-full" />}

        {!loading && violations.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-500">
            <ShieldCheck className="h-8 w-8" />
            <p className="text-sm">No violations recorded.</p>
            <p className="text-xs">Vehicles that cross on red will appear here.</p>
          </div>
        )}

        {!loading && violations.length > 0 && (
          <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
            {violations.map((v) => (
              <li
                key={v.id}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${
                  v.reviewed ? "border-slate-800 bg-slate-950/40" : "border-red-500/30 bg-red-500/5"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-sm font-semibold tracking-wider text-slate-100">
                      {v.plate}
                    </span>
                    {!v.reviewed && (
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-300">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span>{formatTime(v.occurred_at)}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                      Signal: {v.signal_state}
                    </span>
                    {v.vehicle_count != null && (
                      <span className="text-slate-600">Vehicles: {v.vehicle_count}</span>
                    )}
                  </p>
                </div>
                {v.reviewed ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Reviewed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onMarkReviewed(v.id)}
                    className="flex-shrink-0 rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-sky-500 hover:bg-sky-500/10 hover:text-sky-300"
                  >
                    Mark reviewed
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
