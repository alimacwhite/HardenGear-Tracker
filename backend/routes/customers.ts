
import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { runWithRLS } from '../db/transactionWrapper';

const router = express.Router();

/**
 * GET /api/customers
 * Search for customers or list all.
 * Query param: ?q=search_term
 */
router.get('/', authMiddleware, async (req: ExpressRequest, res: ExpressResponse) => {
  const authReq = req as AuthRequest;
  const { q } = (req as any).query;
  const user = authReq.user!;

  try {
    const customers = await runWithRLS(user, async (client) => {
      let queryText = `
        SELECT 
          id, 
          account_number as "accountNumber", 
          account_type as "accountType", 
          name, 
          company_name as "companyName", 
          address, 
          postcode, 
          email, 
          phone
        FROM customers
      `;
      
      const params: any[] = [];

      if (q && typeof q === 'string' && q.trim().length > 0) {
        const searchTerm = `%${q.trim()}%`;
        queryText += `
          WHERE 
            name ILIKE $1 OR 
            company_name ILIKE $1 OR 
            email ILIKE $1 OR 
            phone ILIKE $1 OR 
            account_number ILIKE $1 OR
            postcode ILIKE $1
        `;
        params.push(searchTerm);
      }

      queryText += ` ORDER BY name ASC LIMIT 50`;

      const result = await client.query(queryText, params);
      return result.rows;
    });

    (res as any).json(customers);
  } catch (err) {
    console.error('Search customers error:', err);
    (res as any).status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/customers/:id
 * Get a single customer by ID or Account Number
 */
router.get('/:id', authMiddleware, async (req: ExpressRequest, res: ExpressResponse) => {
  const authReq = req as AuthRequest;
  const idOrAccount = (req as any).params.id;
  const user = authReq.user!;

  try {
    const customer = await runWithRLS(user, async (client) => {
      // Check if looking up by UUID or Account Number
      const isUuid = /^[0-9a-fA-F-]{36}$/.test(idOrAccount);
      
      const queryText = `
        SELECT 
          id, 
          account_number as "accountNumber", 
          account_type as "accountType", 
          name, 
          company_name as "companyName", 
          address, 
          postcode, 
          email, 
          phone
        FROM customers
        WHERE ${isUuid ? 'id = $1' : 'account_number = $1'}
      `;

      const result = await client.query(queryText, [idOrAccount]);
      return result.rows[0];
    });

    if (!customer) {
      return (res as any).status(404).json({ error: 'Customer not found' });
    }

    (res as any).json(customer);
  } catch (err) {
    console.error('Get customer error:', err);
    (res as any).status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/customers
 * Create a new customer
 */
router.post('/', authMiddleware, async (req: ExpressRequest, res: ExpressResponse) => {
  const authReq = req as AuthRequest;
  const user = authReq.user!;
  const { 
    accountNumber, accountType, name, companyName, 
    address, postcode, email, phone 
  } = (req as any).body;

  try {
    const newCustomer = await runWithRLS(user, async (client) => {
      const queryText = `
        INSERT INTO customers (
          account_number, account_type, name, company_name, 
          address, postcode, email, phone
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING 
          id, 
          account_number as "accountNumber", 
          account_type as "accountType", 
          name, 
          company_name as "companyName", 
          address, 
          postcode, 
          email, 
          phone
      `;

      const result = await client.query(queryText, [
        accountNumber, accountType, name, companyName,
        address, postcode, email, phone
      ]);
      return result.rows[0];
    });

    (res as any).status(201).json(newCustomer);
  } catch (err: any) {
    console.error('Create customer error:', err);
    if (err.code === '23505') { // Unique violation
        return (res as any).status(409).json({ error: 'Account number already exists' });
    }
    (res as any).status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/customers/:id
 * Update an existing customer
 */
router.put('/:id', authMiddleware, async (req: ExpressRequest, res: ExpressResponse) => {
  const authReq = req as AuthRequest;
  const user = authReq.user!;
  const { id } = (req as any).params;
  const { 
    accountType, name, companyName, 
    address, postcode, email, phone 
  } = (req as any).body;

  try {
    const updatedCustomer = await runWithRLS(user, async (client) => {
      const queryText = `
        UPDATE customers
        SET 
          account_type = $1,
          name = $2,
          company_name = $3,
          address = $4,
          postcode = $5,
          email = $6,
          phone = $7,
          updated_at = NOW()
        WHERE id = $8
        RETURNING 
          id, 
          account_number as "accountNumber", 
          account_type as "accountType", 
          name, 
          company_name as "companyName", 
          address, 
          postcode, 
          email, 
          phone
      `;

      const result = await client.query(queryText, [
        accountType, name, companyName,
        address, postcode, email, phone, id
      ]);
      return result.rows[0];
    });

    if (!updatedCustomer) {
      return (res as any).status(404).json({ error: 'Customer not found or access denied' });
    }

    (res as any).json(updatedCustomer);
  } catch (err) {
    console.error('Update customer error:', err);
    (res as any).status(500).json({ error: 'Internal server error' });
  }
});

export default router;
