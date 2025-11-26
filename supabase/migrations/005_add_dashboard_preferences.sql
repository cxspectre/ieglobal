-- Add dashboard_preferences column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS dashboard_preferences JSONB DEFAULT '{
  "showUpcomingMilestones": true,
  "showProjectStatus": true,
  "showRecentInvoices": true,
  "showRecentClients": true,
  "showRecentActivity": true
}'::jsonb;

