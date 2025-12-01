-- ==============================================
-- Row-Level Security Setup for "users" Table
-- ==============================================

-- 1. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Create tenant isolation RLS policy (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_policy'
            AND tablename = 'users'
    ) THEN
        CREATE POLICY tenant_isolation_policy
        ON users
        USING (
            organisation_id = current_setting('app.current_user_org_id', true)::uuid
        );
    END IF;
END $$;

-- 3. Enforce RLS for all non-superusers
ALTER TABLE users FORCE ROW LEVEL SECURITY;

-- 4. Create application role (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles WHERE rolname = 'app_user'
    ) THEN
        CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_password';
    END IF;
END $$;

-- 5. Grant minimum required permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO app_user;

-- 6. (Optional) Provide default org_id for testing
ALTER ROLE app_user SET app.current_user_org_id = '00000000-0000-0000-0000-000000000000';
