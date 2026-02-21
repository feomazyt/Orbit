import type { EntityManager } from '@mikro-orm/core';
import { List } from '../entities/List';
import { Board } from '../entities/Board';

export class ListRepository {
  constructor(private readonly em: EntityManager) {}

  findById(id: string): Promise<List | null> {
    return this.em.findOne(List, { id }, { populate: ['board', 'board.owner'] });
  }

  findByBoardId(boardId: string): Promise<List[]> {
    return this.em.find(List, { board: boardId }, { orderBy: { position: 'ASC' } });
  }

  async create(data: {
    boardId: string;
    title: string;
    position?: number;
  }): Promise<List> {
    if (data.position !== undefined) {
      const list = this.em.create(List, {
        board: this.em.getReference(Board, data.boardId),
        title: data.title,
        position: data.position,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.em.persistAndFlush(list);
      return list;
    }
    return this.em.transactional(async (em) => {
      const last = await em.find(List, { board: data.boardId }, { orderBy: { position: 'DESC' }, limit: 1 });
      const position = last[0] ? Number(last[0].position) + 1 : 0;
      const list = em.create(List, {
        board: em.getReference(Board, data.boardId),
        title: data.title,
        position,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await em.persistAndFlush(list);
      return list;
    });
  }

  async update(id: string, data: Partial<{ title: string; position: number }>): Promise<List> {
    const list = await this.em.findOneOrFail(List, { id });
    if (data.title !== undefined) list.title = data.title;
    if (data.position !== undefined) list.position = data.position;
    await this.em.flush();
    return list;
  }

  async delete(id: string): Promise<void> {
    await this.em.nativeDelete(List, { id });
  }

  /**
   * Reorder lists by assigning positions 0, 1, 2, ... to the given list IDs.
   * Runs in a transaction (all updates commit or none).
   */
  async reorder(boardId: string, listIds: string[]): Promise<void> {
    return this.em.transactional(async (em) => {
      for (let i = 0; i < listIds.length; i++) {
        await em.nativeUpdate(List, { id: listIds[i], board: boardId }, { position: i });
      }
      await em.flush();
    });
  }
}
