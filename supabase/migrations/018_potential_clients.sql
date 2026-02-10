-- Potential clients table for admin & partners only
-- Used on the internal dashboard to track leads / prospects

CREATE TABLE IF NOT EXISTS potential_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

  company_name text NOT NULL,
  contact_name text,
  phone text,
  proposal_url text,
  notes text
);

ALTER TABLE potential_clients ENABLE ROW LEVEL SECURITY;

-- Admins + partners can view all potential clients
CREATE POLICY "Admins and partners can view potential clients"
  ON potential_clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'partner')
    )
  );

-- Admins + partners can insert/update/delete potential clients
CREATE POLICY "Admins and partners can manage potential clients"
  ON potential_clients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'partner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'partner')
    )
  );

