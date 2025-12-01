import { Pool, PoolClient } from 'pg';
import { UserRole } from '../../types';

// Initialize Pool with the RESTRICTED 'app_user' credentials
const pool = new Pool({
  user: process.env.DB_USER || 'app_user', 
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

interface UserContext {
  userId: string;
  organisationId?: string;
  role: UserRole;
}

/**
 * Executes a callback within a secure transaction context.
 * Sets PostgreSQL session variables for RLS before executing the business logic.
 */
export const runWithRLS = async <T>(
  user: UserContext,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();

  try {
    // 1. Start Transaction
    await client.query('BEGIN');

    // 2. Determine Permissions
    // Map application roles to RLS flags
    const isPlatformAdmin = [UserRole.ADMIN, UserRole.OWNER].includes(user.role);
    const orgId = user.organisationId || null;

    // 3. Set Session Variables (SET LOCAL scopes to transaction only)
    
    // Set the Organisation ID (Tenancy)
    // We use set_config with is_local=true
    await client.query(
      `SELECT set_config('app.current_user_org_id', $1, true)`,
      [orgId]
    );

    // Set the Platform Admin Flag
    await client.query(
      `SELECT set_config('app.is_platform_admin', $1, true)`,
      [isPlatformAdmin ? 'true' : 'false']
    );

    // 4. Execute Business Logic
    const result = await callback(client);

    // 5. Commit
    await client.query('COMMIT');
    return result;

  } catch (e) {
    // 6. Rollback on error
    await client.query('ROLLBACK');
    throw e;
  } finally {
    // 7. Release client to pool
    // Session variables are reset automatically due to transaction end
    client.release();
  }
};
