import type { EntityManager } from '@mikro-orm/core';
import { Board } from '../entities/Board';
import { BoardMember } from '../entities/BoardMember';
import { User } from '../entities/User';

export class BoardRepository {
  constructor(private readonly em: EntityManager) {}

  findByOwnerId(
    ownerId: string,
    options?: { limit?: number; offset?: number; title?: string }
  ): Promise<Board[]> {
    const where: Record<string, unknown> = { owner: ownerId };
    if (options?.title?.trim()) {
      where.title = { $like: `%${options.title.trim()}%` };
    }
    return this.em.find(Board, where, {
      orderBy: { createdAt: 'DESC' },
      limit: options?.limit,
      offset: options?.offset,
      populate: ['owner', 'members', 'members.user'],
    });
  }

  /** Find boards where the user is a member (owner or added member). */
  findBoardsForUser(
    userId: string,
    options?: { limit?: number; offset?: number; title?: string }
  ): Promise<Board[]> {
    const where: Record<string, unknown> = { members: { user: userId } };
    if (options?.title?.trim()) {
      where.title = { $like: `%${options.title.trim()}%` };
    }
    return this.em.find(Board, where, {
      orderBy: { createdAt: 'DESC' },
      limit: options?.limit,
      offset: options?.offset,
      populate: ['owner', 'members', 'members.user'],
    });
  }

  findById(id: string): Promise<Board | null> {
    return this.em.findOne(Board, { id }, { populate: ['owner'] });
  }

  /** Find board by id with owner and members (for single-board view). */
  findByIdWithMembers(id: string): Promise<Board | null> {
    return this.em.findOne(Board, { id }, {
      populate: ['owner', 'members', 'members.user'],
    });
  }

  findBoardMember(boardId: string, userId: string): Promise<BoardMember | null> {
    return this.em.findOne(
      BoardMember,
      { board: boardId, user: userId },
      { populate: ['board', 'user'] }
    );
  }

  /** Find boards that the user has marked as favourite (user must be a member). */
  findFavouriteBoardsByUserId(
    userId: string,
    options?: { limit?: number; offset?: number; title?: string }
  ): Promise<Board[]> {
    const where: Record<string, unknown> = {
      members: { user: userId, isFavourite: true },
    };
    if (options?.title?.trim()) {
      where.title = { $like: `%${options.title.trim()}%` };
    }
    return this.em.find(Board, where, {
      orderBy: { createdAt: 'DESC' },
      limit: options?.limit,
      offset: options?.offset,
      populate: ['owner', 'members', 'members.user'],
    });
  }

  async create(data: {
    ownerId: string;
    title: string;
    description?: string;
    type?: string;
    priorityLevel?: number;
    memberIds?: string[];
  }): Promise<Board> {
    const board = this.em.create(Board, {
      owner: this.em.getReference(User, data.ownerId),
      title: data.title,
      description: data.description,
      type: data.type ?? 'kanban',
      priorityLevel: data.priorityLevel ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persistAndFlush(board);

    const ownerMember = this.em.create(BoardMember, {
      board,
      user: this.em.getReference(User, data.ownerId),
      role: 'owner',
      isFavourite: false,
      createdAt: new Date(),
    });
    await this.em.persistAndFlush(ownerMember);

    const memberIds = data.memberIds ?? [];
    const toAdd = memberIds.filter((id) => id !== data.ownerId);
    for (const userId of toAdd) {
      await this.addMember(board.id, userId, 'member');
    }

    return board;
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      type: string;
      priorityLevel: number;
      webhookUrl: string | null;
    }>
  ): Promise<Board> {
    const board = await this.em.findOneOrFail(Board, { id });
    if (data.title !== undefined) board.title = data.title;
    if (data.description !== undefined) board.description = data.description;
    if (data.type !== undefined) board.type = data.type;
    if (data.priorityLevel !== undefined) board.priorityLevel = data.priorityLevel;
    if (data.webhookUrl !== undefined) board.webhookUrl = data.webhookUrl;
    await this.em.flush();
    return board;
  }

  async addMember(
    boardId: string,
    userId: string,
    role: string = 'member'
  ): Promise<BoardMember> {
    const member = this.em.create(BoardMember, {
      board: this.em.getReference(Board, boardId),
      user: this.em.getReference(User, userId),
      role,
      isFavourite: false,
      createdAt: new Date(),
    });
    await this.em.persistAndFlush(member);
    return member;
  }

  async removeMember(boardId: string, userId: string): Promise<void> {
    await this.em.nativeDelete(BoardMember, { board: boardId, user: userId });
  }

  async setFavourite(boardId: string, userId: string, isFavourite: boolean): Promise<void> {
    await this.em.nativeUpdate(
      BoardMember,
      { board: boardId, user: userId },
      { isFavourite }
    );
  }

  async delete(id: string): Promise<void> {
    await this.em.nativeDelete(Board, { id });
  }
}
