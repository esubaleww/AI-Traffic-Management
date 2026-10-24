# Bahir Dar AI Traffic Management

A single-page React + Vite + TypeScript + Tailwind dashboard for a hackathon demo. It **displays** the output of a Python FastAPI backend that analyzes a traffic video (vehicle detection, congestion, signal-timing recommendation, pedestrian crossing simulation). The frontend never computes signal logic — it only renders backend data.

> ⚠️ **Simulation — not a real traffic controller.** This dashboard is for demonstration only and must never be connected to real traffic infrastructure.

## Features

- **Video panel** with drag-and-drop upload to `POST /videos` (multipart field `file`), progress + error states, and in-page playback.
- **Stat cards**: vehicle count, pedestrian count, congestion level (colored badge), recommended green time with a live countdown ring.
- **Signal panel**: vertical traffic light (red/yellow/green, only the active light lit + glowing) and pedestrian signal (WAIT = red hand, WALK = green walker), with text labels next to every light — never color alone.
- **Safety guard**: if the backend ever emits `vehicleLight: "green"` together with `pedestrianSignal: "walk"`, a prominent **Conflicting signal state** banner replaces the signal display.
- **Trend chart** (recharts): vehicle & pedestrian counts over the last 60 stream samples.
- **Alerts / event log**: scrollable, newest first, with time and message. Empty state: "No alerts."
- **AI Traffic Report** card (optional, `VITE_ENABLE_REPORT`): calls `POST /report` with the latest state and renders the returned text. Loading, error, and empty states included.
- **Speed Alerts table** (optional, `VITE_ENABLE_SPEED`): time, estimated speed (clearly labeled "estimated"), limit, status.
- **Mock data**: a realistic cycle (green → yellow → all-red → pedestrian walk → repeat) emitted every second, so the UI works without a backend.

## Environment variables

All variables are read by Vite at build time. Copy `.env.example` to `.env` and adjust:

| Variable | Default | Description |
|---|---|---|
| `VITE_USE_MOCK` | `true` | `"true"` = use the built-in mock generator (no backend needed). `"false"` = connect to the real backend. |
| `VITE_API_URL` | `http://localhost:8000` | REST API base URL (no trailing slash). |
| `VITE_WS_URL` | `ws://localhost:8000/ws` | WebSocket URL for the live traffic stream. |
| `VITE_ENABLE_REPORT` | `false` | Show the "AI Traffic Report" card. |
| `VITE_ENABLE_SPEED` | `false` | Show the Speed Alerts table. |
| `VITE_ENABLE_PLATES` | `false` | Show the Plate Readings card. |

## Switching from mock to the real backend

1. Set `VITE_USE_MOCK=false` in `.env`.
2. Set `VITE_API_URL` and `VITE_WS_URL` to your FastAPI server.
3. Restart the dev server (Vite reads env at startup).

The WebSocket stream auto-reconnects with exponential backoff and falls back to the `offline` pill when unavailable.

## Endpoints (NOT confirmed — TODO confirm with backend)

All endpoints live in one file: `src/api/endpoints.ts`. Change them there only.

| Method | Path | Body / Field | Purpose |
|---|---|---|---|
| `POST` | `/videos` | multipart `file` | Upload a traffic clip for analysis |
| `GET` | `/health` | — | Backend health check |
| `WS` | `/ws` | — | Live traffic-state stream |
| `POST` | `/report` | JSON `{ state: TrafficState }` | Generate an AI traffic report (optional) |

No authentication is used.

## Project structure

```
src/
  api/
    client.ts        REST helpers (upload, report, health) + ApiError
    endpoints.ts     All endpoint URLs in one place (TODO confirm with backend)
    mock.ts          Mock TrafficState generator
  components/        Reusable UI: Card, StatCard, StatusPill, TrafficLight, PedestrianSignal, AlertList, UploadBox, Skeleton, ErrorBanner, Toast, …
  hooks/
    useTrafficStream.ts   WebSocket + mock fallback + auto-reconnect
    useGreenCountdown.ts  Display-only countdown helper
  types/
    traffic.ts       TrafficState and related types
  App.tsx            Dashboard layout
```

## Scripts

- `npm run dev` — start the Vite dev server.
- `npm run build` — type-check and build for production.
- `npm run typecheck` — run TypeScript without emitting.

## Notes

- The frontend only **displays** backend data. Signal timing, congestion classification, and any AI analysis happen server-side.
- The countdown ring is a display convenience based on stream timestamps; it does not control anything.
- Every async action (upload, report) has loading, success, and error feedback via toasts and inline banners.
