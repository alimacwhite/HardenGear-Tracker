
import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { runWithRLS } from '../db/transactionWrapper';

const router = express.Router();

/**
 * GET /api/products/:code
 * Lookup a product or part by its unique code.
 */
router.get('/:code', authMiddleware, async (req: ExpressRequest, res: ExpressResponse) => {
  const authReq = req as AuthRequest;
  const { code } = (req as any).params;
  const user = authReq.user!;

  try {
    const product = await runWithRLS(user, async (client) => {
      const queryText = `
        SELECT 
          code, 
          make, 
          model, 
          type, 
          price::float, 
          warranty_years as "warrantyYears"
        FROM products
        WHERE code = $1
      `;
      
      const result = await client.query(queryText, [code]);
      return result.rows[0];
    });

    if (!product) {
      return (res as any).status(404).json({ error: 'Product not found' });
    }

    (res as any).json(product);
  } catch (err) {
    console.error('Product lookup error:', err);
    (res as any).status(500).json({ error: 'Internal server error' });
  }
});

export default router;
