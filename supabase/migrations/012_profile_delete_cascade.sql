-- Allow deleting users by nulling profile references when profile is removed.
-- Required for auth.admin.deleteUser to succeed (auth -> profiles cascades, but
-- other tables reference profiles and block the cascade).

-- Allow NULL for columns that reference profiles (needed for ON DELETE SET NULL)
ALTER TABLE messages ALTER COLUMN sender_id DROP NOT NULL;
ALTER TABLE internal_notes ALTER COLUMN created_by DROP NOT NULL;

-- Drop existing FKs and re-add with ON DELETE SET NULL
ALTER TABLE clients DROP CONSTRAINT IF EXISTS fk_clients_assigned_employee;
ALTER TABLE clients ADD CONSTRAINT fk_clients_assigned_employee
  FOREIGN KEY (assigned_employee_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE milestones DROP CONSTRAINT IF EXISTS milestones_created_by_fkey;
ALTER TABLE milestones ADD CONSTRAINT milestones_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_created_by_fkey;
ALTER TABLE invoices ADD CONSTRAINT invoices_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE files DROP CONSTRAINT IF EXISTS files_uploaded_by_fkey;
ALTER TABLE files ADD CONSTRAINT files_uploaded_by_fkey
  FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_user_id_fkey;
ALTER TABLE activities ADD CONSTRAINT activities_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE internal_notes DROP CONSTRAINT IF EXISTS internal_notes_created_by_fkey;
ALTER TABLE internal_notes ADD CONSTRAINT internal_notes_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- client_onboarding_data FKs
ALTER TABLE client_onboarding_data DROP CONSTRAINT IF EXISTS client_onboarding_data_project_lead_id_fkey;
ALTER TABLE client_onboarding_data ADD CONSTRAINT client_onboarding_data_project_lead_id_fkey
  FOREIGN KEY (project_lead_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE client_onboarding_data DROP CONSTRAINT IF EXISTS client_onboarding_data_technical_lead_id_fkey;
ALTER TABLE client_onboarding_data ADD CONSTRAINT client_onboarding_data_technical_lead_id_fkey
  FOREIGN KEY (technical_lead_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE client_onboarding_data DROP CONSTRAINT IF EXISTS client_onboarding_data_created_by_fkey;
ALTER TABLE client_onboarding_data ADD CONSTRAINT client_onboarding_data_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
