-- Add customer_number to clients table

ALTER TABLE clients 
ADD COLUMN customer_number TEXT;

-- Create a function to auto-generate customer numbers
CREATE OR REPLACE FUNCTION generate_customer_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  counter INT;
  new_number TEXT;
BEGIN
  year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get the count of clients created this year
  SELECT COUNT(*) + 1 INTO counter
  FROM clients
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Format: YYYY-XXX (e.g., 2024-001)
  new_number := year || '-' || LPAD(counter::TEXT, 3, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Update existing clients with customer numbers
UPDATE clients 
SET customer_number = generate_customer_number()
WHERE customer_number IS NULL;

