-- 1. Enable Row Level Security on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Create the Security Policy
-- This policy ensures that for any SELECT, UPDATE, or DELETE operation,
-- the database only returns rows where the organisation_id matches the current session variable.
CREATE POLICY tenant_isolation_policy ON users
    USING (
        -- Cast the session variable to UUID to match the column type
        organisation_id = current_setting('app.current_user_org_id', true)::UUID
    );

-- 3. (Optional) Force RLS even for the table owner
-- By default, the table owner (usually the db admin user) bypasses RLS. 
-- This ensures the logic applies to everyone except superusers.
ALTER TABLE users FORCE ROW LEVEL SECURITY;