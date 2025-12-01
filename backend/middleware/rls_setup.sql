-- ==============================================
-- Row-Level Security Setup for "users" Table
-- ==============================================

-- 1. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Create tenant isolation RLS policy
-- Ensures a session may only see rows where organisation_id
-- matches a session variable.
DO $$
BEGIN
    -- Avoid error if policy already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_policy'
    ) THEN
        CREATE POLICY tenant_isolation_policy
        ON users
        USING (
            organisation_id = current_setting('app.current_user_org_id', true)::uuid
        );
    END IF;
END $$;

-- 3. Force RLS for all non-superusers
ALTER TABLE users FORCE ROW LEVEL SECURITY;

-- 4. Create application role
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles WHERE rolname = 'app_user'
    ) THEN
        CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_password';
    END IF;
END $$;

-- 5. Grant only required permissions — NOT ALL PRIVILEGES
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO app_user;

-- Optional: Allow app_user to set the RLS session variable
ALTER ROLE app_user SET app.current_user_org_id TO '00000000-0000-0000-0000-000000000000';
