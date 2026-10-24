import { useState } from "react";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card } from "./Card";
import { Skeleton } from "./Skeleton";
import { ErrorBanner } from "./ErrorBanner";
import type { Violation } from "@/lib/supabase";

type Props = {
  violations: Violation[];
  loading: boolean;
  error: string | null;
  onMarkReviewed: (id: string) => void;
  simulated?: boolean;
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

function PlateBadge({ plate }: { plate: string | null }) {
  if (!plate) {
    return (
      <span className="inline-block rounded border border-dashed border-slate-600 px-2 py-0.5 text-xs italic text-slate-500">
        Plate unreadable
      </span>
    );
  }
  return (
    <span
      className="inline-block rounded border-2 border-slate-900 bg-slate-100 px-2 py-0.5 font-mono text-sm font-bold tracking-wider text-slate-900"
      aria-label={`Plate number ${plate}`}
    >
      {plate}
    </span>
  );
}

export function ViolationsPanel({
  violations,
  loading,
  error,
  onMarkReviewed,
  simulated = false,
}: Props) {
  const [onlyUnreviewed, setOnlyUnreviewed] = useState(false);
  const [query, setQuery] = useState("");

  const newCount = violations.filter((v) => !v.reviewed).length;
  const q = query.trim().toLowerCase();
  const shown = violations
    .filter((v) => (onlyUnreviewed ? !v.reviewed : true))
    .filter((v) => (q ? (v.plate ?? "").toLowerCase().includes(q) : true));

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
      {/* Same rows as the speed panel so both lists start at the same height */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            Total:{" "}
            <span className="font-semibold text-slate-200">
              {violations.length}
            </span>
          </span>
          <span>
            Unreviewed:{" "}
            <span className="font-semibold text-red-400">{newCount}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOnlyUnreviewed((v) => !v)}
          className={`rounded-md border px-2.5 py-1 text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
            onlyUnreviewed
              ? "border-red-500/60 bg-red-500/15 text-red-300"
              : "border-slate-700 text-slate-300 hover:bg-slate-800"
          }`}
        >
          {onlyUnreviewed ? "Showing unreviewed only" : "Show unreviewed only"}
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search plate number (targa)"
        aria-label="Search by plate number"
        className="mb-3 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      />

      {simulated && (
        <p className="mb-2 text-xs font-medium text-amber-400">
          Simulated data. Violations and plate numbers are generated for demo
          purposes.
        </p>
      )}
      <p className="mb-3 min-h-8 text-xs text-slate-500">
        Plates are machine-read and may be wrong. Review each record before
        acting on it.
      </p>

      {error && (
        <div className="mb-3">
          <ErrorBanner message={error} onDismiss={() => undefined} />
        </div>
      )}

      {/* Fixed height, scrolls inside. Keep this value identical in SpeedViolationsPanel. */}
      <div className="h-[320px] overflow-y-auto pr-1">
        {loading && <Skeleton className="h-full w-full" />}

        {!loading && shown.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
            <ShieldCheck className="h-8 w-8" />
            <p className="text-sm">
              {q || onlyUnreviewed
                ? "No matching records."
                : "No violations recorded."}
            </p>
            {!q && !onlyUnreviewed && (
              <p className="text-xs">
                Vehicles that cross on red will appear here.
              </p>
            )}
          </div>
        )}

        {!loading && shown.length > 0 && (
          <ul className="space-y-2">
            {shown.map((v) => (
              <li
                key={v.id}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                  v.reviewed
                    ? "border-slate-800 bg-slate-950/40"
                    : "border-red-500/50 bg-red-500/10"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {v.reviewed ? (
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700"
                      role="img"
                      aria-label="Reviewed"
                      title="Reviewed"
                    >
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    </span>
                  ) : (
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-red-500 bg-red-500/20"
                      role="img"
                      aria-label="Red-light violation"
                      title="Red-light violation"
                    >
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    </span>
                  )}

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <PlateBadge plate={v.plate} />
                      {!v.reviewed && (
                        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-300">
                          New
                        </span>
                      )}
                    </div>
                    <p className="flex flex-wrap items-center gap-x-2 text-xs tabular-nums text-slate-500">
                      <span>{formatTime(v.occurred_at)}</span>
                      <span className="uppercase tracking-wide text-slate-400">
                        Signal: {v.signal_state}
                      </span>
                      {v.vehicle_count != null && (
                        <span className="text-slate-600">
                          Vehicles: {v.vehicle_count}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {!v.reviewed && (
                  <button
                    type="button"
                    onClick={() => onMarkReviewed(v.id)}
                    className="flex-shrink-0 rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-sky-500 hover:bg-sky-500/10 hover:text-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
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
