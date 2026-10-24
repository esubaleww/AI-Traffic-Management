import { useState } from "react";
import { AlertTriangle, CheckCircle2, Gauge } from "lucide-react";
import { Card } from "@/components/Card";
import type { SpeedEvent } from "@/hooks/useSpeedEvents";

type Props = {
  events: SpeedEvent[];
  limit: number;
  simulated: boolean;
};

function clock(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
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

export function SpeedViolationsPanel({ events, limit, simulated }: Props) {
  const [onlyViolations, setOnlyViolations] = useState(false);
  const [query, setQuery] = useState("");

  const violations = events.filter((e) => e.over);
  const q = query.trim().toLowerCase();
  const shown = events
    .filter((e) => (onlyViolations ? e.over : true))
    .filter((e) => (q ? (e.plate ?? "").toLowerCase().includes(q) : true));

  return (
    <Card
      title="Speed Violations"
      icon={<Gauge className="h-4 w-4 text-red-400" />}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            Limit:{" "}
            <span className="font-semibold text-slate-200">{limit} km/h</span>
          </span>
          <span>
            Violations:{" "}
            <span className="font-semibold text-red-400">
              {violations.length}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOnlyViolations((v) => !v)}
          className={`rounded-md border px-2.5 py-1 text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
            onlyViolations
              ? "border-red-500/60 bg-red-500/15 text-red-300"
              : "border-slate-700 text-slate-300 hover:bg-slate-800"
          }`}
        >
          {onlyViolations ? "Showing violations only" : "Show violations only"}
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
          Simulated data. Speeds and plate numbers are generated for demo
          purposes.
        </p>
      )}
      <p className="mb-3 min-h-8 text-xs text-slate-500">
        Speeds are estimates and are not calibrated for enforcement. Plates are
        machine-read and may be wrong.
      </p>

      {/* Fixed height, scrolls inside. Keep this value identical in ViolationsPanel. */}
      <div className="h-[320px] overflow-y-auto pr-1">
        {shown.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-500">
              {q || onlyViolations
                ? "No matching records."
                : "No speed readings yet."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {shown.map((e) => (
              <li
                key={e.id}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                  e.over
                    ? "border-red-500/50 bg-red-500/10"
                    : "border-slate-800 bg-slate-950/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  {e.over ? (
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-red-500 bg-red-500/20"
                      role="img"
                      aria-label="Speed violation"
                      title="Speed violation"
                    >
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    </span>
                  ) : (
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700"
                      role="img"
                      aria-label="Within limit"
                      title="Within limit"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </span>
                  )}
                  <div className="space-y-1">
                    <PlateBadge plate={e.plate} />
                    <p className="text-xs tabular-nums text-slate-500">
                      {e.vehicleId} · {clock(e.time)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-lg font-semibold tabular-nums ${
                      e.over ? "text-red-400" : "text-slate-200"
                    }`}
                  >
                    {e.speed}{" "}
                    <span className="text-xs font-normal text-slate-500">
                      km/h
                    </span>
                  </p>
                  {e.over && (
                    <p className="text-xs font-semibold text-red-400">
                      SPEEDING +{e.speed - e.limit}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
