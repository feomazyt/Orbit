import { z } from 'zod';

const titleSchema = z.string().min(1, 'Title is required').max(255);
const uuidSchema = z.string().uuid('Invalid ID format');

/** Typ zadania, np. 'task', 'bug', 'feature', 'story'. */
export const CARD_TYPES = ['task', 'bug', 'feature', 'story'] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const CreateCardBodySchema = z.object({
  title: titleSchema,
  listId: uuidSchema,
  description: z.string().max(5000).optional(),
  position: z.number().int().nonnegative().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  type: z.enum(CARD_TYPES).optional(),
  assigneeIds: z.array(uuidSchema).optional().default([]),
});

export const UpdateCardBodySchema = z.object({
  title: titleSchema.optional(),
  description: z.string().max(5000).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  position: z.number().int().nonnegative().optional(),
  type: z.enum(CARD_TYPES).optional(),
  assigneeIds: z.array(uuidSchema).optional(),
});

export const MoveCardBodySchema = z.object({
  listId: uuidSchema,
  position: z.number().int().nonnegative(),
});

export type CreateCardBody = z.infer<typeof CreateCardBodySchema>;
export type UpdateCardBody = z.infer<typeof UpdateCardBodySchema>;
export type MoveCardBody = z.infer<typeof MoveCardBodySchema>;
