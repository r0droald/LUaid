-- RLS Policies: Public read access for dashboard
-- LUaid serves open relief data — all dashboard tables are publicly readable.
-- Write policies will be added when authenticated forms are implemented.

-- Organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_organizations" ON organizations
  FOR SELECT USING (true);

-- Aid categories
ALTER TABLE aid_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_aid_categories" ON aid_categories
  FOR SELECT USING (true);

-- Barangays
ALTER TABLE barangays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_barangays" ON barangays
  FOR SELECT USING (true);

-- Donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_donations" ON donations
  FOR SELECT USING (true);

-- Deployments
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_read_deployments" ON deployments
  FOR SELECT USING (true);
