import type { Request, Response } from 'express';
import { getOrm } from '../db/index.js';

export async function check(_req: Request, res: Response): Promise<void> {
  let orm;
  try {
    orm = getOrm();
  } catch {
    res.status(503).json({ status: 'error', database: 'not initialized' });
    return;
  }

  try {
    await orm.em.getConnection().execute('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
}
