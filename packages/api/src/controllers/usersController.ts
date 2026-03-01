import type { Request, Response } from 'express';
import { getEntityManager, getRepositories } from '../db/index.js';

export async function search(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const q = (req.query.q as string) ?? '';
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 20), 50);
  const em = getEntityManager();
  const { userRepository } = getRepositories(em);

  const users = await userRepository.search(q, userId, limit);
  res.json(users.map((u) => ({ id: u.id, email: u.email, name: u.name })));
}
