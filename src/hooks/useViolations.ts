import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, type Violation } from "@/lib/supabase";
import type { TrafficState } from "@/types/traffic";

const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK ?? "false").toLowerCase() === "true";
const MAX_PANEL = 50;

// Chance that a car runs a freshly-red light in mock mode.
// 1 = every red phase (for testing). Set to 0.4 before the demo.
const VIOLATION_CHANCE = 1;

// Simulated plate generator for demo purposes only: "AA 12345" style.
function randomPlate(): string {
  const regions = ["AA", "BA", "DD", "OR"];
  const region = regions[Math.floor(Math.random() * regions.length)];
  const num = Math.floor(10000 + Math.random() * 89999);
  return `${region} ${num}`;
}

export function useViolations(state: TrafficState | null) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track the last vehicle-light phase we evaluated so we only fire a violation
  // once per red phase, not on every tick while red persists.
  const lastLightRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("violations")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(MAX_PANEL);
    if (err) {
      console.error("[violations] fetch failed:", err);
      setError(err.message);
    } else {
      setViolations((data as Violation[]) ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  // Initial load, a light 3-second poll as a safety net, and realtime updates.
  useEffect(() => {
    refresh();
    const poll = setInterval(refresh, 3000);

    const channel = supabase
      .channel("violations-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "violations" },
        (payload) => {
          const row = payload.new as Violation;
          setViolations((prev) =>
            prev.some((v) => v.id === row.id)
              ? prev
              : [row, ...prev].slice(0, MAX_PANEL),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "violations" },
        (payload) => {
          const updated = payload.new as Violation;
          setViolations((prev) =>
            prev.map((v) => (v.id === updated.id ? updated : v)),
          );
        },
      )
      .subscribe((status) => {
        console.log("[violations] realtime status:", status);
      });

    return () => {
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [refresh]);

  // Mock mode: simulate a red-light violation when a vehicle "crosses" on red.
  // In real operation, the backend writes the violation row; the frontend only
  // displays it.
  useEffect(() => {
    if (!USE_MOCK || !state) return;

    const light = state.vehicleLight;
    const prev = lastLightRef.current;
    lastLightRef.current = light;

    // Detect a transition INTO red, then maybe a vehicle runs it.
    if (light === "red" && prev !== "red" && Math.random() < VIOLATION_CHANCE) {
      const plate = randomPlate();
      console.log("[violations] inserting mock violation:", plate);
      supabase
        .from("violations")
        .insert({
          plate,
          signal_state: "red",
          vehicle_count: state.vehicleCount,
        })
        .then(({ error: err }) => {
          if (err) {
            console.error("[violations] insert failed:", err);
            setError(err.message);
          } else {
            refresh(); // show it right away, even if realtime is off
          }
        });
    }
  }, [state, refresh]);

  const markReviewed = useCallback(
    async (id: string) => {
      const { error: err } = await supabase
        .from("violations")
        .update({ reviewed: true, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (err) {
        console.error("[violations] update failed:", err);
        setError(err.message);
      } else {
        refresh();
      }
    },
    [refresh],
  );

  return { violations, loading, error, markReviewed, refresh };
}
