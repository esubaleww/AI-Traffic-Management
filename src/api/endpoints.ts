// Central place for every backend endpoint the frontend talks to.
// TODO: confirm with backend. Endpoints are NOT confirmed — change them here only.

const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

// REST endpoints (relative to apiBase). Keep as functions so they read clearly.
export const endpoints = {
  health: `${apiBase}/health`,
  uploadVideo: `${apiBase}/videos`, // POST multipart/form-data, field "file"
  report: `${apiBase}/report`, // POST JSON { state: TrafficState }
} as const;

// WebSocket endpoint for the live stream.
export const wsUrl = import.meta.env.VITE_WS_URL ?? "";
