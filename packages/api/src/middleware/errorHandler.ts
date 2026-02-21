import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

function isAppError(err: unknown): err is AppError {
  return err instanceof Error && typeof (err as AppError).statusCode === 'number';
}

/**
 * Global error handler. Must be registered last, after all routes.
 * Sends JSON: { error: string }. Status: err.statusCode or 500.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) return;

  const statusCode = isAppError(err) ? err.statusCode! : 500;
  const message =
    err instanceof Error ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({ error: message });
}
