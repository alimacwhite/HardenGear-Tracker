import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../types'; // Shared types

// Extend Express Request to include our User payload
export interface AuthRequest extends ExpressRequest {
  user?: {
    userId: string;
    organisationId?: string;
    role: UserRole;
  };
}

export const authMiddleware = (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
  const authHeader = (req as any).headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return (res as any).status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify token (Secret should be in env vars)
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    // Attach decoded user to request
    // We expect the JWT to contain: { sub: 'user_id', org: 'org_id', role: 'admin' }
    // Cast req to AuthRequest to assign the user property
    (req as AuthRequest).user = {
      userId: decoded.sub,
      organisationId: decoded.org, // This might be undefined for Platform Staff
      role: decoded.role,
    };

    next();
  } catch (err) {
    return (res as any).status(403).json({ error: 'Invalid or expired token' });
  }
};