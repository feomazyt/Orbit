import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';

type Source = 'body' | 'query' | 'params';

function validate(schema: z.ZodType, source: Source) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const raw = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    const result = schema.safeParse(raw);

    if (result.success) {
      (req as Request & { validated: z.infer<typeof schema> }).validated = result.data;
      next();
      return;
    }

    next(result.error);
  };
}

export function validateBody<T extends z.ZodType>(schema: T) {
  return validate(schema, 'body');
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return validate(schema, 'query');
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return validate(schema, 'params');
}
