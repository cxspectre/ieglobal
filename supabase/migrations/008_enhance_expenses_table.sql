-- Enhance expenses table with status, receipts, and reimbursement tracking
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'paid')),
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS receipt_path TEXT,
ADD COLUMN IF NOT EXISTS trip_name TEXT,
ADD COLUMN IF NOT EXISTS reimbursement_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS reimbursement_date DATE,
ADD COLUMN IF NOT EXISTS expected_payment_date DATE,
ADD COLUMN IF NOT EXISTS is_fixed_cost BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cost_type TEXT CHECK (cost_type IN ('fixed', 'variable')),
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual', 'one-time')),
ADD COLUMN IF NOT EXISTS next_charge_date DATE,
ADD COLUMN IF NOT EXISTS is_reimbursed BOOLEAN DEFAULT false;

-- Update RLS policies to allow employees to submit expenses
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Employees can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Employees can view their own expenses" ON expenses;
DROP POLICY IF EXISTS "Employees can update their own expenses" ON expenses;

CREATE POLICY "Employees can insert their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Employees can view their own expenses"
  ON expenses FOR SELECT
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Employees can update their own expenses"
  ON expenses FOR UPDATE
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create financial_documents table
CREATE TABLE IF NOT EXISTS financial_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('tax_return', 'contract', 'financial_agreement', 'bank_statement', 'other')),
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  tags TEXT[],
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE financial_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can manage financial documents" ON financial_documents;

CREATE POLICY "Admins can manage financial documents"
  ON financial_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_cost_type ON expenses(cost_type);
CREATE INDEX IF NOT EXISTS idx_financial_documents_type ON financial_documents(document_type);

