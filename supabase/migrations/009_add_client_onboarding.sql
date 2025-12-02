-- Add onboarding workflow support to clients table
-- This enables the "Onboard Client" guided workflow

-- Add new columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'not_started' 
  CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed'));
ALTER TABLE clients ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS priority_level TEXT 
  CHECK (priority_level IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE clients ADD COLUMN IF NOT EXISTS expected_timeline TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS service_category TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS estimated_scope TEXT;

-- Create onboarding_data table to store workflow-specific information
CREATE TABLE IF NOT EXISTS client_onboarding_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Step 2: Project Definition
  service_categories TEXT[], -- Array of selected services
  project_scope TEXT,
  estimated_timeline TEXT,
  internal_priority TEXT,
  
  -- Step 3: Required Documents
  documents_requested JSONB DEFAULT '[]'::jsonb, -- List of requested documents
  documents_received JSONB DEFAULT '[]'::jsonb, -- List of received documents
  upload_link_sent BOOLEAN DEFAULT false,
  upload_link_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Step 4: Kickoff Preparation
  project_lead_id UUID REFERENCES profiles(id),
  technical_lead_id UUID REFERENCES profiles(id),
  kickoff_meeting_scheduled BOOLEAN DEFAULT false,
  kickoff_meeting_date TIMESTAMP WITH TIME ZONE,
  project_folder_created BOOLEAN DEFAULT false,
  msa_generated BOOLEAN DEFAULT false,
  proposal_generated BOOLEAN DEFAULT false,
  added_to_roadmap BOOLEAN DEFAULT false,
  
  -- Step 5: Automated Assets
  folder_structure_created BOOLEAN DEFAULT false,
  roadmap_template_created BOOLEAN DEFAULT false,
  notion_page_created BOOLEAN DEFAULT false,
  slack_channel_created BOOLEAN DEFAULT false,
  welcome_email_sent BOOLEAN DEFAULT false,
  welcome_email_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional metadata
  onboarding_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on onboarding_data table
ALTER TABLE client_onboarding_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_data (employees only)
CREATE POLICY "Employees can view onboarding data" ON client_onboarding_data FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

CREATE POLICY "Employees can manage onboarding data" ON client_onboarding_data FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);

-- Add trigger for updated_at
CREATE TRIGGER client_onboarding_data_updated_at 
  BEFORE UPDATE ON client_onboarding_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create index for performance
CREATE INDEX idx_client_onboarding_data_client_id ON client_onboarding_data(client_id);
CREATE INDEX idx_clients_onboarding_status ON clients(onboarding_status);

-- Comments
COMMENT ON TABLE client_onboarding_data IS 'Stores detailed onboarding workflow data for clients';
COMMENT ON COLUMN clients.onboarding_status IS 'Current status of client onboarding workflow';
COMMENT ON COLUMN clients.onboarding_step IS 'Current step in onboarding workflow (1-6)';

