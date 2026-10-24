import { useEffect, useRef, useState } from "react";
import type { TrafficState } from "@/types/traffic";

// Estimates seconds remaining in the current vehicle-light phase using the
// timestamps of consecutive stream samples. This is a display convenience —
// the frontend never decides signal logic; it only reflects backend state.
export function useGreenCountdown(state: TrafficState | null): number {
  const [remaining, setRemaining] = useState(0);
  const phaseStartRef = useRef<number | null>(null);
  const lastLightRef = useRef<string | null>(null);
  const targetRef = useRef<number>(0);

  useEffect(() => {
    if (!state) return;
    const lightKey = state.vehicleLight;
    const now = state.timestamp;

    // (Re)start the phase when the light changes.
    if (lastLightRef.current !== lightKey) {
      lastLightRef.current = lightKey;
      phaseStartRef.current = now;
      targetRef.current = lightKey === "green" ? state.recommendedGreenSeconds : lightKey === "yellow" ? 3 : 6;
    }

    const start = phaseStartRef.current ?? now;
    const target = targetRef.current;
    setRemaining(Math.max(0, target - (now - start) / 1000));
  }, [state]);

  // Smoothly tick down between samples for a continuous countdown feel.
  useEffect(() => {
    if (!state || state.vehicleLight !== "green") return;
    const id = window.setInterval(() => {
      if (!phaseStartRef.current) return;
      const elapsed = (Date.now() - phaseStartRef.current) / 1000;
      setRemaining(Math.max(0, targetRef.current - elapsed));
    }, 250);
    return () => window.clearInterval(id);
  }, [state]);

  return remaining;
}
