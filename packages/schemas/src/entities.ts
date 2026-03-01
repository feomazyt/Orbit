import { z } from 'zod';

const dateSchema = z.union([z.string().datetime(), z.date()]).transform((v) => (typeof v === 'string' ? new Date(v) : v));

/** Minimal user as returned in nested owner/user (no passwordHash) */
export const UserEntitySchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});
export type UserEntity = z.infer<typeof UserEntitySchema>;

/** Minimal user as in board members list (id, name, email only) */
export const BoardMemberUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  email: z.string().email(),
});
export type BoardMemberUser = z.infer<typeof BoardMemberUserSchema>;

export const BoardEntitySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  owner: UserEntitySchema.optional(),
  ownerId: z.string().uuid().optional(),
  type: z.string().optional(),
  priorityLevel: z.number().optional(),
  members: z.array(BoardMemberUserSchema).optional(),
  isFavourite: z.boolean().optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});
export type BoardEntity = z.infer<typeof BoardEntitySchema>;

export const ListEntitySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  position: z.number(),
  board: z.string().uuid().optional(),
  boardId: z.string().uuid().optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});
export type ListEntity = z.infer<typeof ListEntitySchema>;

export const CardEntitySchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  position: z.number(),
  list: z.string().uuid().optional(),
  listId: z.string().uuid().optional(),
  dueDate: dateSchema.nullable().optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});
export type CardEntity = z.infer<typeof CardEntitySchema>;

export const CommentEntitySchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  card: z.string().uuid().optional(),
  cardId: z.string().uuid().optional(),
  user: UserEntitySchema.optional(),
  userId: z.string().uuid().optional(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
});
export type CommentEntity = z.infer<typeof CommentEntitySchema>;
