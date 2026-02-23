/**
 * Stałe kody błędów API — ułatwiają obsługę po stronie frontendu.
 */
export const ErrorCode = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface ApiErrorPayload {
  code: ErrorCodeType;
  message: string;
  details?: unknown;
}

/**
 * Błąd aplikacji z kodem HTTP i kodem błędów API.
 * Przekazywany do next(err) i obsługiwany przez centralny error handler.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCodeType;
  readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCodeType,
    details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): ApiErrorPayload {
    const payload: ApiErrorPayload = { code: this.code, message: this.message };
    if (this.details !== undefined) payload.details = this.details;
    return payload;
  }
}

export function unauthorized(message = 'Missing or invalid token'): AppError {
  return new AppError(message, 401, ErrorCode.UNAUTHORIZED);
}

export function forbidden(message = 'Forbidden'): AppError {
  return new AppError(message, 403, ErrorCode.FORBIDDEN);
}

export function notFound(message = 'Not found'): AppError {
  return new AppError(message, 404, ErrorCode.NOT_FOUND);
}

export function validationError(details: unknown, message = 'Validation failed'): AppError {
  return new AppError(message, 400, ErrorCode.VALIDATION_ERROR, details);
}

export function conflict(message: string): AppError {
  return new AppError(message, 409, ErrorCode.CONFLICT);
}

export function badRequest(message: string, details?: unknown): AppError {
  return new AppError(message, 400, ErrorCode.BAD_REQUEST, details);
}

export function internalError(message = 'Internal server error'): AppError {
  return new AppError(message, 500, ErrorCode.INTERNAL_ERROR);
}
