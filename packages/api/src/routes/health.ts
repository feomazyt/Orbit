import { Router } from 'express';
import { getOrm } from '../db/index.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  let orm;
  try {
    orm = getOrm();
  } catch {
    res.status(503).json({ status: 'error', database: 'not initialized' });
    return;
  }

  orm.em
    .getConnection()
    .execute('SELECT 1')
    .then(() => {
      res.json({ status: 'ok', database: 'connected' });
    })
    .catch(() => {
      res.status(503).json({ status: 'error', database: 'disconnected' });
    });
});
