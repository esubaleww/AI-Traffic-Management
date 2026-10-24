import { useState } from "react";
import { AlertOctagon, FileText, Loader2, Sparkles } from "lucide-react";
import { Card } from "./Card";
import { ErrorBanner } from "./ErrorBanner";
import { generateReport } from "@/api/client";
import type { TrafficState } from "@/types/traffic";

type Props = {
  state: TrafficState | null;
};

export function ReportCard({ state }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);

  const onGenerate = async () => {
    if (!state) return;
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const text = await generateReport(state);
      setReport(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="AI Traffic Report"
      icon={<Sparkles className="h-4 w-4 text-sky-400" />}
      actions={
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading || !state}
          className="inline-flex items-center gap-1.5 rounded-md bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
          {loading ? "Generating…" : "Generate report"}
        </button>
      }
    >
      <div className="space-y-3">
        {!state && (
          <p className="text-sm text-slate-500">Waiting for live traffic data before a report can be generated.</p>
        )}

        {state && !loading && !error && !report && (
          <p className="text-sm text-slate-500">
            No report yet. Click <span className="text-slate-300">Generate report</span> to summarise the current
            traffic state.
          </p>
        )}

        {loading && (
          <div className="space-y-2" aria-live="polite">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800" />
          </div>
        )}

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {report && (
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-300">
              <AlertOctagon className="h-4 w-4" />
              Generated report
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{report}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
