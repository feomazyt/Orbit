import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  AppError,
  validationError,
  internalError,
  type ApiErrorPayload,
} from '../lib/errors.js';

function formatZodErrors(error: ZodError): Array<{ path: string[]; message: string }> {
  return error.errors.map((e) => ({
    path: e.path.map(String),
    message: e.message,
  }));
}

/**
 * Centralny error handler. Rejestrowany na końcu, po wszystkich trasach.
 * Format odpowiedzi błędu: { error: { code, message, details? } }.
 *
 * Mapowanie:
 * - Zod (walidacja) → 400, VALIDATION_ERROR
 * - AppError → statusCode + code z błędu
 * - Błędy DB / nieznane → 500, INTERNAL_ERROR (szczegóły tylko w dev)
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) return;

  let statusCode: number;
  let payload: ApiErrorPayload;

  if (err instanceof ZodError) {
    statusCode = 400;
    const ve = validationError(formatZodErrors(err), 'Validation failed');
    payload = ve.toJSON();
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    payload = err.toJSON();
  } else {
    statusCode = 500;
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    const ie = internalError(
      process.env.NODE_ENV === 'production' ? 'Internal server error' : message
    );
    payload = ie.toJSON();
    if (process.env.NODE_ENV !== 'production' && err instanceof Error) {
      payload.details = { stack: err.stack };
    }
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({ error: payload });
}
