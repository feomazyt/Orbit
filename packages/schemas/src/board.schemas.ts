import { z } from 'zod';

const titleSchema = z.string().min(1, 'Title is required').max(255);

export const BOARD_TYPES = ['Marketing', 'Roadmap', 'Błędy', 'Design', 'Analityka', 'Development'] as const;
export type BoardType = (typeof BOARD_TYPES)[number];

export const PRIORITY_LEVELS = [
  { value: 1, label: 'Bardzo niski' },
  { value: 2, label: 'Niski' },
  { value: 3, label: 'Normalny' },
  { value: 4, label: 'Wysoki' },
  { value: 5, label: 'Bardzo wysoki' },
] as const;

export const CreateBoardBodySchema = z.object({
  title: titleSchema,
  description: z.string().max(2000).optional(),
  type: z.enum(BOARD_TYPES),
  priorityLevel: z.number().int().min(1).max(5),
  memberIds: z.array(z.string().uuid()).optional().default([]),
});

export const UpdateBoardBodySchema = z.object({
  title: titleSchema.optional(),
  description: z.string().max(2000).optional(),
  type: z.enum(BOARD_TYPES).optional(),
  priorityLevel: z.number().int().min(1).max(5).optional(),
  webhookUrl: z.string().url().nullable().optional(),
});

export const ListBoardsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  title: z.string().min(1).max(255).optional(),
});

export const AddBoardMemberBodySchema = z.object({
  userId: z.string().uuid(),
});

export type CreateBoardBody = z.infer<typeof CreateBoardBodySchema>;
export type UpdateBoardBody = z.infer<typeof UpdateBoardBodySchema>;
export type ListBoardsQuery = z.infer<typeof ListBoardsQuerySchema>;
export type AddBoardMemberBody = z.infer<typeof AddBoardMemberBodySchema>;
