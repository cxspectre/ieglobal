-- Add 'partner' role to profiles
-- Partners: dashboard access (clients, projects, etc), NO financial data (invoices, revenue, finance)
-- Employees: same - no financial data per user request
-- Admin: full access including financial data

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'employee', 'partner', 'client'));

-- Invoices: admin only (employees/partners cannot see)
DROP POLICY IF EXISTS "Employees can view all invoices" ON invoices;
CREATE POLICY "Admins can view all invoices" ON invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Employees can manage invoices" ON invoices;
CREATE POLICY "Admins can manage invoices" ON invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Clients: admin, employee, partner (dashboard team)
DROP POLICY IF EXISTS "Employees can view all clients" ON clients;
CREATE POLICY "Team can view all clients" ON clients FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee', 'partner'))
);

DROP POLICY IF EXISTS "Employees can manage clients" ON clients;
CREATE POLICY "Team can manage clients" ON clients FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee', 'partner'))
);

-- Projects: team (admin, employee, partner)
DROP POLICY IF EXISTS "Employees can view all projects" ON projects;
CREATE POLICY "Team can view all projects" ON projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee', 'partner'))
);

DROP POLICY IF EXISTS "Employees can manage projects" ON projects;
CREATE POLICY "Team can manage projects" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee', 'partner'))
);

-- Milestones: team
DROP POLICY IF EXISTS "Employees can view all milestones" ON milestones;
CREATE POLICY "Team can view all milestones" ON milestones FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'employee', 'partner'))
  OR
  EXISTS (
    SELECT 1 FROM projects pr
    JOIN profiles p ON p.client_id = pr.client_id
    WHERE pr.id = milestones.project_id AND p.id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Employees can manage milestones" ON milestones;
CREATE POLICY "Team can manage milestones" ON milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee', 'partner'))
);

-- Activities: team can view
DROP POLICY IF EXISTS "Employees can view all activities" ON activities;
CREATE POLICY "Team can view all activities" ON activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee', 'partner'))
);

-- Files: team
DROP POLICY IF EXISTS "Employees can view all files" ON files;
CREATE POLICY "Team can view all files" ON files FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee', 'partner'))
);

DROP POLICY IF EXISTS "Employees can manage files" ON files;
CREATE POLICY "Team can manage files" ON files FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee', 'partner'))
);

-- Messages: team (employees/partners see all, clients see their project messages)
DROP POLICY IF EXISTS "Employees can view all messages" ON messages;
CREATE POLICY "Team can view all messages" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee', 'partner'))
);

DROP POLICY IF EXISTS "Employees can send messages" ON messages;
CREATE POLICY "Team can send messages" ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'employee', 'partner'))
);
