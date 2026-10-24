/*
# Red-light violations table

1. Purpose
   Stores vehicles that crossed the intersection while the vehicle signal was RED.
   In this hackathon demo, violations are detected by the backend (or simulated
   by the mock data generator) and written here. The dashboard reads this table
   to show an admin a live list of red-light runners with their plate (targa)
   numbers. An admin can mark a violation as reviewed.

2. New Table: `violations`
   - `id`           uuid, primary key
   - `plate`        text, not null — the captured vehicle plate / targa number
   - `occurred_at`  timestamptz, not null, default now() — when the violation happened
   - `signal_state` text, not null — the vehicle signal at the time (always "red")
   - `vehicle_count` integer — vehicle count at the moment of detection
   - `reviewed`     boolean, not null, default false — admin acknowledgement flag
   - `reviewed_at`  timestamptz, nullable — when the admin marked it reviewed
   - `created_at`   timestamptz, default now()

3. Security
   - This is a single-tenant, no-auth demo dashboard. There is no sign-in screen,
     so the frontend operates as the `anon` role for its entire lifetime.
   - RLS enabled. CRUD granted to `anon, authenticated` (public/shared data).
   - Four per-verb policies using `USING (true)` / `WITH CHECK (true)` because the
     data is intentionally shared in this demo dashboard.

4. Notes
   - No `user_id` column — no auth in this app.
   - Index on `occurred_at` descending for the dashboard's newest-first query.
*/

CREATE TABLE IF NOT EXISTS violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  signal_state text NOT NULL,
  vehicle_count integer,
  reviewed boolean NOT NULL DEFAULT false,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE violations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON violations TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_violations_occurred_at_desc
  ON violations (occurred_at DESC);

DROP POLICY IF EXISTS "anon_select_violations" ON violations;
CREATE POLICY "anon_select_violations"
  ON violations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_violations" ON violations;
CREATE POLICY "anon_insert_violations"
  ON violations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_violations" ON violations;
CREATE POLICY "anon_update_violations"
  ON violations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_violations" ON violations;
CREATE POLICY "anon_delete_violations"
  ON violations FOR DELETE
  TO anon, authenticated USING (true);
