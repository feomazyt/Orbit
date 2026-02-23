import type { EntityManager } from '@mikro-orm/core';
import { Board } from '../entities/Board';
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
    });
  }

  findById(id: string): Promise<Board | null> {
    return this.em.findOne(Board, { id }, { populate: ['owner'] });
  }

  async create(data: { ownerId: string; title: string; description?: string }): Promise<Board> {
    const board = this.em.create(Board, {
      owner: this.em.getReference(User, data.ownerId),
      title: data.title,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persistAndFlush(board);
    return board;
  }

  async update(
    id: string,
    data: Partial<{ title: string; description: string }>
  ): Promise<Board> {
    const board = await this.em.findOneOrFail(Board, { id });
    if (data.title !== undefined) board.title = data.title;
    if (data.description !== undefined) board.description = data.description;
    await this.em.flush();
    return board;
  }

  async delete(id: string): Promise<void> {
    await this.em.nativeDelete(Board, { id });
  }
}
