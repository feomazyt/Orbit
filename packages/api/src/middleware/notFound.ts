import type { Request, Response } from 'express';

/**
 * 404 handler. Register after all routes, before the global error handler.
 */
export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}
