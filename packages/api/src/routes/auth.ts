import { Router } from 'express';
import type { RegisterBody, LoginBody } from '@orbit/schemas';
import { RegisterBodySchema, LoginBodySchema } from '@orbit/schemas';
import { getEntityManager, getRepositories } from '../db/index.js';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { hashPassword, verifyPassword, signToken } from '../lib/auth.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(RegisterBodySchema), asyncHandler(async (req, res) => {
  const body = req.validated as RegisterBody;
  const em = getEntityManager();
  const { userRepository } = getRepositories(em);

  const existing = await userRepository.findByEmail(body.email);
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
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
}));

authRouter.post('/login', validateBody(LoginBodySchema), asyncHandler(async (req, res) => {
  const body = req.validated as LoginBody;
  const em = getEntityManager();
  const { userRepository } = getRepositories(em);

  const user = await userRepository.findByEmail(body.email);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = signToken({ sub: user.id, email: user.email });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}));
