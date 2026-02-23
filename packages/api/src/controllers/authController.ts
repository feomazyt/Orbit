import type { Request, Response, NextFunction } from 'express';
import type { RegisterBody, LoginBody } from '@orbit/schemas';
import { getEntityManager, getRepositories } from '../db/index.js';
import { hashPassword, verifyPassword, signToken } from '../lib/auth.js';
import { unauthorized, conflict } from '../lib/errors.js';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = req.validated as RegisterBody;
  const em = getEntityManager();
  const { userRepository } = getRepositories(em);

  const existing = await userRepository.findByEmail(body.email);
  if (existing) {
    next(conflict('Email already registered'));
    return;
  }

  const passwordHash = await hashPassword(body.password);
  const user = await userRepository.create({
    email: body.email,
    passwordHash,
    name: body.name,
  });

  const token = signToken({ sub: user.id, email: user.email });
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  const body = req.validated as LoginBody;
  const em = getEntityManager();
  const { userRepository } = getRepositories(em);

  const user = await userRepository.findByEmail(body.email);
  if (!user) {
    next(unauthorized('Invalid email or password'));
    return;
  }

  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) {
    next(unauthorized('Invalid email or password'));
    return;
  }

  const token = signToken({ sub: user.id, email: user.email });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}

/**
 * Logout: with access-only JWT, invalidation is client-side (discard the token).
 * If you add refresh tokens in DB later, invalidate the refresh token here.
 */
export async function logout(req: Request, res: Response, _next: NextFunction): Promise<void> {
  res.status(200).json({
    message: 'Logged out. Discard the access token on the client.',
  });
}
