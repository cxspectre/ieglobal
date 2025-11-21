-- Debug and fix client linkage

-- 1. Check what client_id the profile has
SELECT 
  p.id as profile_id,
  p.email,
  p.full_name,
  p.role,
  p.client_id as profile_client_id,
  c.id as actual_client_id,
  c.company_name
FROM profiles p
LEFT JOIN clients c ON c.contact_email = p.email
WHERE p.role = 'client';

-- 2. Fix the linkage (UPDATE the client_id to match)
-- Replace 'max@example.com' with Max Mustermann's actual email
UPDATE profiles
SET client_id = (
  SELECT id FROM clients WHERE contact_email = profiles.email
)
WHERE role = 'client' 
  AND client_id IS NULL;

-- 3. Verify it worked
SELECT 
  p.email,
  p.full_name,
  p.client_id,
  c.company_name
FROM profiles p
LEFT JOIN clients c ON c.id = p.client_id
WHERE p.role = 'client';


