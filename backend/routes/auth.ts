import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/transactionWrapper';
import { UserRole } from '../../types';

const router = express.Router();

// Helper to generate JWT
const generateToken = (user: any) => {
  return jwt.sign(
    { 
      sub: user.id, 
      role: user.role, 
      org: user.organisation_id 
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '8h' }
  );
};

// POST /auth/register
router.post('/register', async (req: ExpressRequest, res: ExpressResponse) => {
  const { name, email, password, role, organisationId } = (req as any).body;

  try {
    // 1. Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return (res as any).status(400).json({ error: 'Email already registered' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insert User
    // Note: In production, ensure 'role' is validated to prevent privilege escalation
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, organisation_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, organisation_id`,
      [name, email, passwordHash, role || UserRole.COUNTER, organisationId || null]
    );

    const user = newUser.rows[0];
    const token = generateToken(user);

    (res as any).status(201).json({ token, user });

  } catch (err) {
    console.error(err);
    (res as any).status(500).json({ error: 'Server error' });
  }
});

// POST /auth/login
router.post('/login', async (req: ExpressRequest, res: ExpressResponse) => {
  const { email, password } = (req as any).body;

  try {
    // 1. Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return (res as any).status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return (res as any).status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Generate Token
    const token = generateToken(user);

    // Return user info (excluding hash)
    const { password_hash, ...userInfo } = user;
    (res as any).json({ token, user: userInfo });

  } catch (err) {
    console.error(err);
    (res as any).status(500).json({ error: 'Server error' });
  }
});

// POST /auth/google (Placeholder for OAuth Code Exchange)
router.post('/google', async (req: ExpressRequest, res: ExpressResponse) => {
  const { token: googleToken } = (req as any).body;
  // Logic: Verify googleToken with Google API -> Find/Create User -> Generate JWT
  (res as any).status(501).json({ message: 'SSO Not implemented in this demo' });
});

export default router;