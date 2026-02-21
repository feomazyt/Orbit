import { z } from 'zod';

const titleSchema = z.string().min(1, 'Title is required').max(255);
const uuidSchema = z.string().uuid('Invalid ID format');

export const CreateCardBodySchema = z.object({
  title: titleSchema,
  listId: uuidSchema,
  description: z.string().max(5000).optional(),
  position: z.number().int().nonnegative().optional(),
});

export const UpdateCardBodySchema = z.object({
  title: titleSchema.optional(),
  description: z.string().max(5000).optional(),
  position: z.number().int().nonnegative().optional(),
});

export const MoveCardBodySchema = z.object({
  listId: uuidSchema,
  position: z.number().int().nonnegative(),
});

export type CreateCardBody = z.infer<typeof CreateCardBodySchema>;
export type UpdateCardBody = z.infer<typeof UpdateCardBodySchema>;
export type MoveCardBody = z.infer<typeof MoveCardBodySchema>;
