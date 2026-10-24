import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  Car,
  Footprints,
  Gauge,
  ListChecks,
  Radio,
  Timer,
} from "lucide-react";

import { Header } from "@/components/Header";
import { VideoPanel } from "@/components/VideoPanel";
import { StatCard } from "@/components/StatCard";
import { CountdownRing } from "@/components/CountdownRing";
import { CongestionBadge } from "@/components/CongestionBadge";
import { TrafficLight } from "@/components/TrafficLight";
import { PedestrianSignal } from "@/components/PedestrianSignal";
import { AlertList } from "@/components/AlertList";
import { TrendChart } from "@/components/TrendChart";
import { SpeedAlertsTable } from "@/components/SpeedAlertsTable";
import { ReportCard } from "@/components/ReportCard";
import { Card } from "@/components/Card";
import { Skeleton } from "@/components/Skeleton";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ToastProvider, useToast } from "@/components/Toast";
import { statusToPill } from "@/components/StatusPill";

import { useTrafficStream } from "@/hooks/useTrafficStream";
import { useGreenCountdown } from "@/hooks/useGreenCountdown";
import { uploadVideo } from "@/api/client";
import type { SpeedAlert } from "@/types/traffic";

const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "false").toLowerCase() === "true";
const ENABLE_REPORT = (import.meta.env.VITE_ENABLE_REPORT ?? "false").toLowerCase() === "true";
const ENABLE_SPEED = (import.meta.env.VITE_ENABLE_SPEED ?? "false").toLowerCase() === "true";
const ENABLE_PLATES = (import.meta.env.VITE_ENABLE_PLATES ?? "false").toLowerCase() === "true";

function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function Dashboard() {
  const { state, history, status } = useTrafficStream();
  const toast = useToast();
  const countdown = useGreenCountdown(state);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // In mock mode with no real backend, synthesise a few speed rows from the
  // stream so the optional Speed Alerts table has something to show.
  const mockSpeedAlerts: SpeedAlert[] = useMemo(() => {
    if (!ENABLE_SPEED) return [];
    return history
      .filter((s) => s.vehicleCount > 0)
      .slice(-8)
      .map((s, i) => ({
        time: s.timestamp,
        estimatedSpeed: 30 + ((s.vehicleCount + i) % 35) + Math.random() * 4,
        limit: 50,
        status: 30 + ((s.vehicleCount + i) % 35) + 4 > 50 ? "over" : "ok",
      }));
  }, [history]);

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setProgress(0);
      setUploadError(null);
      try {
        if (USE_MOCK) {
          // No backend in mock mode — simulate an upload and play the file locally
          // so the drag-and-drop flow and video panel can be exercised end to end.
          await new Promise<void>((resolve) => {
            let pct = 0;
            const step = () => {
              pct = Math.min(100, pct + Math.floor(Math.random() * 18) + 6);
              setProgress(pct);
              if (pct < 100) window.setTimeout(step, 220);
              else resolve();
            };
            step();
          });
          setVideoUrl(URL.createObjectURL(file));
          toast.push("success", "Video loaded locally (mock mode) — analysis is simulated.");
        } else {
          const res = await uploadVideo(file, setProgress);
          setVideoUrl(res.url || URL.createObjectURL(file));
          toast.push("success", "Video uploaded — analysis started.");
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Upload failed";
        setUploadError(msg);
        toast.push("error", msg);
      } finally {
        setUploading(false);
      }
    },
    [toast],
  );

  const connecting = status === "connecting" && !state && USE_MOCK === false;
  const pill = statusToPill(status, USE_MOCK);

  // Safety: conflicting signal state.
  const conflicting = !!state && state.vehicleLight === "green" && state.pedestrianSignal === "walk";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Header pill={pill} />

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        {connecting && (
          <div className="grid gap-5 lg:grid-cols-3">
            <Skeleton className="h-[420px] lg:col-span-2" />
            <Skeleton className="h-[420px]" />
          </div>
        )}

        {!connecting && (
          <>
            {conflicting && (
              <div className="mb-5">
                <ErrorBanner message="Conflicting signal state — vehicle green and pedestrian walk are both active. Refusing to render signal display." />
              </div>
            )}

            {/* Row 1: video + signal panel */}
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <VideoPanel
                  videoUrl={videoUrl}
                  uploading={uploading}
                  progress={progress}
                  error={uploadError}
                  onFile={handleFile}
                />
              </div>

              <Card title="Signal Control" icon={<Radio className="h-4 w-4 text-sky-400" />}>
                {state ? (
                  conflicting ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 py-8 text-center">
                      <AlertTriangle className="h-10 w-10 text-red-400" />
                      <p className="text-sm text-red-200">
                        Signal display hidden due to a conflicting state from the backend.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      <TrafficLight light={state.vehicleLight} />
                      <div className="h-px w-full bg-slate-800" />
                      <PedestrianSignal signal={state.pedestrianSignal} />
                      <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                        <p className="text-xs text-slate-500">Last update</p>
                        <p className="text-sm tabular-nums text-slate-300">{formatClock(state.timestamp)}</p>
                      </div>
                    </div>
                  )
                ) : (
                  <Skeleton className="h-64 w-full" />
                )}
              </Card>
            </div>

            {/* Row 2: stat cards */}
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {state ? (
                <>
                  <StatCard label="Vehicle count" value={state.vehicleCount} icon={<Car className="h-5 w-5" />} accent="sky">
                    <span className="text-xs text-slate-500">detected</span>
                  </StatCard>
                  <StatCard label="Pedestrian count" value={state.pedestrianCount} icon={<Footprints className="h-5 w-5" />} accent="emerald">
                    <span className="text-xs text-slate-500">waiting</span>
                  </StatCard>
                  <StatCard label="Congestion level" value={null} icon={<Gauge className="h-5 w-5" />} accent="amber">
                    <CongestionBadge level={state.congestion} />
                  </StatCard>
                  <StatCard
                    label="Recommended green"
                    value={`${state.recommendedGreenSeconds}s`}
                    icon={<Timer className="h-5 w-5" />}
                    accent="sky"
                  >
                    <CountdownRing
                      seconds={countdown}
                      total={state.recommendedGreenSeconds}
                      active={state.vehicleLight === "green"}
                    />
                  </StatCard>
                </>
              ) : (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
              )}
            </div>

            {/* Row 3: trend + alerts */}
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TrendChart history={history} />
              </div>
              <Card title="Alerts & Event Log" icon={<ListChecks className="h-4 w-4 text-sky-400" />}>
                {state ? <AlertList alerts={state.alerts} /> : <Skeleton className="h-72 w-full" />}
              </Card>
            </div>

            {/* Row 4: optional feature-flag cards */}
            {(ENABLE_SPEED || ENABLE_REPORT || ENABLE_PLATES) && (
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {ENABLE_SPEED && <SpeedAlertsTable alerts={mockSpeedAlerts} />}
                {ENABLE_PLATES && (
                  <Card title="Plate Readings" icon={<Car className="h-4 w-4 text-amber-400" />}>
                    <p className="py-6 text-center text-sm text-slate-500">
                      Plate recognition data will appear here when the backend provides it.
                    </p>
                  </Card>
                )}
                {ENABLE_REPORT && <ReportCard state={state} />}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-600 sm:px-6">
        Bahir Dar AI Traffic Management — hackathon demo. {USE_MOCK ? "Running on mock data." : ""}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}
