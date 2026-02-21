import { z } from 'zod';

const uuidSchema = z.string().uuid('Invalid ID format');

export const CreateCommentBodySchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000),
  cardId: uuidSchema,
});

export const UpdateCommentBodySchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000),
});

export type CreateCommentBody = z.infer<typeof CreateCommentBodySchema>;
export type UpdateCommentBody = z.infer<typeof UpdateCommentBodySchema>;
