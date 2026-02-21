import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';

type Source = 'body' | 'query';

function formatZodErrors(error: z.ZodError): Array<{ path: string[]; message: string }> {
  return error.errors.map((e: z.ZodIssue) => ({
    path: e.path.map(String),
    message: e.message,
  }));
}

function validate(schema: z.ZodType, source: Source) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const raw = source === 'body' ? req.body : req.query;
    const result = schema.safeParse(raw);

    if (result.success) {
      (req as Request & { validated: z.infer<typeof schema> }).validated = result.data;
      next();
      return;
    }

    res.status(400).json({
      errors: formatZodErrors(result.error),
    });
  };
}

export function validateBody<T extends z.ZodType>(schema: T) {
  return validate(schema, 'body');
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return validate(schema, 'query');
}
