import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { runWithRLS } from '../db/transactionWrapper';

const router = express.Router();

/**
 * DELETE /users/:id
 * Securely delete a user.
 * 
 * Logic:
 * 1. If Requester is Business Admin -> Can only delete users in THEIR organisation.
 * 2. If Requester is Platform Admin -> Can delete any user (via policy override).
 * 3. If Requester is Business Staff -> DB Policy likely prevents DELETE entirely (depending on exact CRUD grants).
 */
router.delete('/:id', authMiddleware, async (req: ExpressRequest, res: ExpressResponse) => {
  const targetUserId = req.params.id;
  const authReq = req as AuthRequest;
  const currentUser = authReq.user!;

  try {
    await runWithRLS(currentUser, async (client) => {
      
      // We do not need to manually add "WHERE organisation_id = ..."
      // The RLS policy on the DB connection handles it automatically.
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [targetUserId]
      );

      // Security Check:
      // If result.rowCount is 0, it means either:
      // A) The user doesn't exist
      // B) The user exists, but belongs to a different organisation (RLS hid it)
      if (result.rowCount === 0) {
        throw new Error('User not found or access denied');
      }

      return result.rows[0];
    });

    res.status(200).json({ message: 'User deleted successfully' });

  } catch (err: any) {
    // In production, log the error but return a generic message to prevent ID enumeration
    console.error(`Failed to delete user ${targetUserId}:`, err);
    
    if (err.message === 'User not found or access denied') {
        res.status(404).json({ error: 'User not found' });
    } else {
        res.status(500).json({ error: 'Internal server error' });
    }
  }
});

export default router;