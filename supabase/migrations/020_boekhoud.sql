-- Boekhoud (bookkeeping) core tables
-- Focus: boring, reliable schema for VAT and period reporting

-- Categories for grouping expenses/revenue (Hosting, Software, Contractors, etc.)
CREATE TABLE IF NOT EXISTS boekhoud_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE boekhoud_categories ENABLE ROW LEVEL SECURITY;

-- Admins manage categories
CREATE POLICY "Admins can manage boekhoud categories"
  ON boekhoud_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Core bookkeeping document table
-- One row per uploaded invoice/receipt/bank document
CREATE TABLE IF NOT EXISTS boekhoud_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- File storage
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,

  -- Classification
  type TEXT NOT NULL CHECK (type IN ('sales_invoice', 'purchase_invoice', 'receipt', 'bank_statement')),

  -- Parties
  vendor_name TEXT, -- supplier for expenses
  client_name TEXT, -- customer for sales

  -- Document metadata
  invoice_number TEXT,
  invoice_date DATE,
  due_date DATE,
  service_period_start DATE,
  service_period_end DATE,

  -- Amounts
  total_excl_vat NUMERIC(12, 2),
  vat_total NUMERIC(12, 2),
  total_incl_vat NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'EUR',

  -- Detailed VAT breakdown per rate: [{ rate, base, vat }]
  vat_breakdown JSONB,

  -- Workflow
  status TEXT NOT NULL DEFAULT 'needs_review'
    CHECK (status IN ('needs_review', 'approved', 'rejected')),
  booked_date DATE, -- "boekdatum" if different from invoice_date

  -- Categorisation & tagging
  category_id UUID REFERENCES boekhoud_categories(id) ON DELETE SET NULL,
  tags TEXT[],
  notes TEXT,

  -- Audit
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE boekhoud_documents ENABLE ROW LEVEL SECURITY;

-- Admins manage all Boekhoud documents
CREATE POLICY "Admins can manage boekhoud documents"
  ON boekhoud_documents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Helpful indexes for period / VAT queries
CREATE INDEX IF NOT EXISTS idx_boekhoud_documents_invoice_date
  ON boekhoud_documents (invoice_date);

CREATE INDEX IF NOT EXISTS idx_boekhoud_documents_status_type
  ON boekhoud_documents (status, type);

