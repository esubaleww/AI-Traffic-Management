import { useEffect, useRef, useState } from "react";
import { wsUrl } from "@/api/endpoints";
import { createMockTrafficStream } from "@/api/mock";
import type { StreamStatus, TrafficState } from "@/types/traffic";

const MAX_HISTORY = 60;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 8000;

export type UseTrafficStream = {
  state: TrafficState | null;
  history: TrafficState[];
  status: StreamStatus;
};

const useMock = (import.meta.env.VITE_USE_MOCK ?? "false").toLowerCase() === "true";

export function useTrafficStream(): UseTrafficStream {
  const [state, setState] = useState<TrafficState | null>(null);
  const [history, setHistory] = useState<TrafficState[]>([]);
  const [status, setStatus] = useState<StreamStatus>("connecting");

  // Keep latest mock-state in a ref for reconnect scheduling without re-running effects.
  const stateRef = useRef<UseTrafficStream["state"]>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    const pushState = (next: TrafficState) => {
      if (cancelled) return;
      stateRef.current = next;
      setState(next);
      setHistory((h) => [...h, next].slice(-MAX_HISTORY));
    };

    if (useMock) {
      // Mock mode: always "live" from the user's perspective, but labelled Mock by the caller.
      setStatus("live");
      cleanup = createMockTrafficStream(pushState);
      return () => {
        cancelled = true;
        cleanup?.();
      };
    }

    // Real WebSocket with auto-reconnect.
    let ws: WebSocket | null = null;
    let reconnectTimer: number | undefined;
    let attempts = 0;

    const clearReconnect = () => {
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      reconnectTimer = undefined;
    };

    const connect = () => {
      if (cancelled || !wsUrl) {
        if (!wsUrl) setStatus("offline");
        return;
      }
      setStatus("connecting");
      try {
        ws = new WebSocket(wsUrl);
      } catch {
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        attempts = 0;
        setStatus("live");
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as TrafficState;
          pushState(data);
        } catch {
          /* ignore malformed frames */
        }
      };

      ws.onerror = () => {
        // let onclose handle reconnect
      };

      ws.onclose = () => {
        setStatus("offline");
        scheduleReconnect();
      };
    };

    const scheduleReconnect = () => {
      clearReconnect();
      if (cancelled) return;
      const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempts, RECONNECT_MAX_MS);
      attempts += 1;
      reconnectTimer = window.setTimeout(connect, delay);
    };

    connect();

    return () => {
      cancelled = true;
      clearReconnect();
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, []);

  return { state, history, status };
}
