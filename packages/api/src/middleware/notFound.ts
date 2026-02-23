import type { Request, Response } from 'express';
import { ErrorCode } from '../lib/errors.js';

/**
 * 404 handler. Register after all routes, before the global error handler.
 * Format: { error: { code, message } }.
 */
export function notFound(_req: Request, res: Response): void {
  res.status(404).json({
    error: { code: ErrorCode.NOT_FOUND, message: 'Not found' },
  });
}
