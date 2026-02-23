import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/auth.js';
import { unauthorized } from '../lib/errors.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    next(unauthorized('Missing or invalid Authorization header'));
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.sub, email: payload.email };
    next();
  } catch {
    next(unauthorized('Invalid or expired token'));
  }
}
