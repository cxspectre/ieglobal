-- Partners: view-only access (no INSERT, UPDATE, DELETE)
-- Admin and Employee: full manage access
-- Migration 011 gave partners the same manage access as employees; this restricts partners to SELECT only.

-- Clients: partners can view, only admin/employee can manage
DROP POLICY IF EXISTS "Team can manage clients" ON clients;
CREATE POLICY "Admins and employees can manage clients" ON clients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
  );

-- Projects: partners can view, only admin/employee can manage
DROP POLICY IF EXISTS "Team can manage projects" ON projects;
CREATE POLICY "Admins and employees can manage projects" ON projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
  );

-- Milestones: partners can view, only admin/employee can manage
DROP POLICY IF EXISTS "Team can manage milestones" ON milestones;
CREATE POLICY "Admins and employees can manage milestones" ON milestones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
  );

-- Files: partners can view, only admin/employee can manage (upload, update, delete)
DROP POLICY IF EXISTS "Team can manage files" ON files;
CREATE POLICY "Admins and employees can manage files" ON files
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
  );

-- Messages: partners can view, only admin/employee can send
DROP POLICY IF EXISTS "Team can send messages" ON messages;
CREATE POLICY "Admins and employees can send messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
  );
