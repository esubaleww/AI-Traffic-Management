import { useEffect, useRef, useState } from "react";
import type { TrafficState } from "@/types/traffic";

const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK ?? "false").toLowerCase() === "true";

export const SPEED_LIMIT = 50; // km/h, change if your team sets a different limit
const MAX_EVENTS = 30;

export type SpeedEvent = {
  id: string;
  time: number;
  vehicleId: string;
  plate: string | null; // captured targa number, null when the camera couldn't read it
  speed: number; // estimated km/h
  limit: number;
  over: boolean;
};

// Simulated plate generator for demo purposes only: "AA 12345" style.
function randomPlate(): string {
  const regions = ["AA", "BA", "DD", "OR"];
  const region = regions[Math.floor(Math.random() * regions.length)];
  const num = Math.floor(10000 + Math.random() * 89999);
  return `${region} ${num}`;
}

// Mock mode: occasionally "measures" a vehicle while traffic is moving.
// In real operation the backend should send speed events with the captured plate;
// the frontend only displays them.
export function useSpeedEvents(state: TrafficState | null) {
  const [events, setEvents] = useState<SpeedEvent[]>([]);
  const lastTs = useRef<number | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (!USE_MOCK || !state) return;
    if (lastTs.current === state.timestamp) return;
    lastTs.current = state.timestamp;

    if (state.vehicleLight === "red") return; // vehicles are stopped
    if (Math.random() > 0.35) return; // not every second

    seq.current += 1;
    const speed = Math.round(30 + Math.random() * 45); // 30 to 75 km/h
    const ev: SpeedEvent = {
      id: `speed-${seq.current}`,
      time: state.timestamp,
      vehicleId: `Vehicle #${100 + seq.current}`,
      // ~15% of plates come out unreadable, as real cameras often fail
      plate: Math.random() < 0.05 ? null : randomPlate(),
      speed,
      limit: SPEED_LIMIT,
      over: speed > SPEED_LIMIT,
    };
    setEvents((prev) => [ev, ...prev].slice(0, MAX_EVENTS));
  }, [state]);

  return { events, simulated: USE_MOCK, limit: SPEED_LIMIT };
}
