-- Enhance potential_clients with lightweight pipeline fields
-- This keeps it simple but makes the dashboard far more actionable.

ALTER TABLE potential_clients
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'contacted',
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS importance text,
  ADD COLUMN IF NOT EXISTS last_contacted_date date,
  ADD COLUMN IF NOT EXISTS next_follow_up_date date;

-- Optional: simple check to keep status values reasonable (no need for an enum type)
ALTER TABLE potential_clients
  ADD CONSTRAINT potential_clients_status_check
  CHECK (status IN ('new', 'contacted', 'call_booked', 'proposal_sent', 'waiting', 'won', 'lost'))
  NOT VALID;

-- We can validate later once existing rows (if any) are cleaned up

CREATE INDEX IF NOT EXISTS idx_potential_clients_next_follow_up_date
  ON potential_clients (next_follow_up_date);

