// Shared types for the Bahir Dar AI Traffic Management dashboard.
// These mirror the JSON payloads emitted by the Python FastAPI backend.

export type CongestionLevel = "low" | "medium" | "high";

export type VehicleLight = "green" | "yellow" | "red";

export type PedestrianSignal = "wait" | "walk";

export type TrafficAlert = {
  id: string;
  type: string;
  message: string;
  time: number; // epoch ms
};

export type TrafficState = {
  timestamp: number; // epoch ms
  vehicleCount: number;
  pedestrianCount: number;
  congestion: CongestionLevel;
  recommendedGreenSeconds: number;
  vehicleLight: VehicleLight;
  pedestrianSignal: PedestrianSignal;
  alerts: TrafficAlert[];
};

// Optional extended fields driven by feature flags. The backend may include
// these when the corresponding analysis is enabled.
export type SpeedAlert = {
  time: number; // epoch ms
  estimatedSpeed: number; // km/h — estimate, not a measurement
  limit: number; // km/h
  status: "ok" | "over";
};

export type PlateReading = {
  time: number; // epoch ms
  plate: string;
  confidence: number; // 0..1
};

export type TrafficStateWithExtras = TrafficState & {
  speedAlerts?: SpeedAlert[];
  plates?: PlateReading[];
};

export type ReportResponse = {
  report: string;
};

export type UploadVideoResponse = {
  id: string;
  url: string;
};

export type StreamStatus = "connecting" | "live" | "offline";
