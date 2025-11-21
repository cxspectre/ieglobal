-- Add address and VAT fields to clients table for EU invoice compliance
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS address_street TEXT,
ADD COLUMN IF NOT EXISTS address_city TEXT,
ADD COLUMN IF NOT EXISTS address_postal_code TEXT,
ADD COLUMN IF NOT EXISTS address_country TEXT DEFAULT 'Netherlands',
ADD COLUMN IF NOT EXISTS vat_number TEXT,
ADD COLUMN IF NOT EXISTS kvk_number TEXT;

-- Add VAT rate and breakdown to invoices table
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 21.00,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);

-- Update existing invoices to calculate VAT if missing
UPDATE invoices
SET 
  subtotal = ROUND(amount / (1 + COALESCE(vat_rate, 21.00) / 100), 2),
  vat_amount = ROUND(amount - (amount / (1 + COALESCE(vat_rate, 21.00) / 100)), 2),
  total_amount = amount,
  vat_rate = COALESCE(vat_rate, 21.00)
WHERE subtotal IS NULL;

