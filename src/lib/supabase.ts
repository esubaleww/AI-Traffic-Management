import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export type Violation = {
  id: string;
  plate: string;
  occurred_at: string;
  signal_state: string;
  vehicle_count: number | null;
  reviewed: boolean;
  reviewed_at: string | null;
  created_at: string;
};
