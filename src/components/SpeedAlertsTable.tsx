import { Gauge } from "lucide-react";
import { Card } from "./Card";
import type { SpeedAlert } from "@/types/traffic";

type Props = {
  alerts: SpeedAlert[];
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function SpeedAlertsTable({ alerts }: Props) {
  return (
    <Card title="Speed Alerts (estimated)" icon={<Gauge className="h-4 w-4 text-amber-400" />}>
      {alerts.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">No speed readings yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4 font-medium">Time</th>
                <th className="py-2 pr-4 font-medium">Est. speed</th>
                <th className="py-2 pr-4 font-medium">Limit</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a, i) => {
                const over = a.status === "over";
                return (
                  <tr key={i} className="border-b border-slate-800/60 last:border-0">
                    <td className="py-2 pr-4 tabular-nums text-slate-400">{formatTime(a.time)}</td>
                    <td className="py-2 pr-4 tabular-nums text-slate-200">
                      {a.estimatedSpeed.toFixed(1)} <span className="text-slate-500">km/h</span>
                    </td>
                    <td className="py-2 pr-4 tabular-nums text-slate-400">{a.limit} km/h</td>
                    <td className="py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          over ? "bg-red-500/15 text-red-300" : "bg-emerald-500/15 text-emerald-300"
                        }`}
                      >
                        {over ? "Over limit" : "Within limit"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-500">Speeds are estimates from the backend, not measurements.</p>
        </div>
      )}
    </Card>
  );
}
