// Mock traffic-state generator. Emits a TrafficState roughly every second,
// cycling realistically through:
//   green -> yellow -> all-red -> pedestrian walk -> (back to green)
// Used when VITE_USE_MOCK is true, or as a fallback when the WS is offline.

import type {
  TrafficAlert,
  TrafficState,
  VehicleLight,
  PedestrianSignal,
} from "@/types/traffic";

const MAX_HISTORY_ALERTS = 12;
let alertSeq = 0;

function makeAlert(type: string, message: string, time: number): TrafficAlert {
  alertSeq += 1;
  return { id: `mock-${alertSeq}`, type, message, time };
}

// Phase plan: (light, signal, durationMs). Total cycle ~26s.
type Phase = { light: VehicleLight; signal: PedestrianSignal; ms: number };
const PHASES: Phase[] = [
  { light: "green", signal: "wait", ms: 12000 },
  { light: "yellow", signal: "wait", ms: 3000 },
  { light: "red", signal: "wait", ms: 2000 },
  { light: "red", signal: "walk", ms: 8000 },
  { light: "red", signal: "wait", ms: 1000 },
];

// State held across emits.
const mock = {
  phaseIdx: 0,
  phaseStart: Date.now(),
  vehicleCount: 0,
  pedestrianCount: 0,
  pendingAlerts: [] as TrafficAlert[],
  // gently drifting recommended green to look realistic
  recGreen: 18,
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const CONGESTION_MESSAGES: Record<TrafficState["congestion"], string[]> = {
  low: [
    "Flow nominal on University Blvd",
    "Clear corridor near Lake Front",
    "Light volume downtown",
  ],
  medium: [
    "Building queue at main junction",
    "Medium density on Bridge Rd",
    "Moderate delay near market",
  ],
  high: [
    "Congestion spike at roundabout",
    "Heavy gridlock on Station St",
    "Back-up detected at ferry crossing",
  ],
};

function nextTick(now: number): { phase: Phase; advanced: boolean } {
  const phase = PHASES[mock.phaseIdx];
  const advanced = now - mock.phaseStart >= phase.ms;
  if (advanced) {
    mock.phaseIdx = (mock.phaseIdx + 1) % PHASES.length;
    mock.phaseStart = now;
  }
  return { phase: PHASES[mock.phaseIdx], advanced };
}

function tick(): TrafficState {
  const now = Date.now();
  const { phase, advanced } = nextTick(now);

  // Vehicles accrue during green, trickle during yellow, and clear while stopped.
  if (phase.light === "green") {
    mock.vehicleCount += Math.floor(Math.random() * 3) + 1;
  } else if (phase.light === "yellow") {
    mock.vehicleCount += Math.random() < 0.3 ? 1 : 0;
  } else {
    mock.vehicleCount = Math.max(
      0,
      mock.vehicleCount - (Math.floor(Math.random() * 3) + 1),
    );
  }

  // Pedestrians accrue while waiting, clear during walk.
  if (phase.signal === "wait")
    mock.pedestrianCount += Math.random() < 0.4 ? 1 : 0;
  else
    mock.pedestrianCount = Math.max(
      0,
      mock.pedestrianCount - (Math.floor(Math.random() * 2) + 1),
    );

  // Congestion follows vehicle density with a little noise.
  const density = mock.vehicleCount;
  let congestion: TrafficState["congestion"] = "low";
  if (density > 60) congestion = "high";
  else if (density > 25) congestion = "medium";

  // Occasionally emit an alert when congestion rises.
  if (advanced && phase.light === "green" && Math.random() < 0.5) {
    mock.pendingAlerts.unshift(
      makeAlert("congestion", pick(CONGESTION_MESSAGES[congestion]), now),
    );
  }
  if (advanced && phase.signal === "walk" && Math.random() < 0.35) {
    mock.pendingAlerts.unshift(
      makeAlert("pedestrian", "Pedestrian phase active — vehicles held", now),
    );
  }

  // Recommended green drifts with congestion.
  const target = congestion === "high" ? 32 : congestion === "medium" ? 22 : 14;
  mock.recGreen = Math.round(mock.recGreen + (target - mock.recGreen) * 0.2);

  mock.pendingAlerts = mock.pendingAlerts.slice(0, MAX_HISTORY_ALERTS);

  return {
    timestamp: now,
    vehicleCount: mock.vehicleCount,
    pedestrianCount: mock.pedestrianCount,
    congestion,
    recommendedGreenSeconds: mock.recGreen,
    vehicleLight: phase.light,
    pedestrianSignal: phase.signal,
    alerts: mock.pendingAlerts.slice(),
  };
}

export function createMockTrafficStream(
  onState: (s: TrafficState) => void,
): () => void {
  let stopped = false;

  const emit = () => {
    if (stopped) return;
    onState(tick());
  };

  // Emit immediately so the UI isn't blank, then every second.
  emit();
  const timer = window.setInterval(emit, 1000);

  return () => {
    stopped = true;
    window.clearInterval(timer);
  };
}

// Reset mock state — useful if the hook remounts.
export function resetMockState(): void {
  mock.phaseIdx = 0;
  mock.phaseStart = Date.now();
  mock.vehicleCount = 0;
  mock.pedestrianCount = 0;
  mock.pendingAlerts = [];
  mock.recGreen = 18;
}
