import type { EntityManager } from '@mikro-orm/core';
import { Card } from '../entities/Card';
import { List } from '../entities/List';

export class CardRepository {
  constructor(private readonly em: EntityManager) {}

  findById(id: string): Promise<Card | null> {
    return this.em.findOne(Card, { id }, { populate: ['list', 'list.board', 'list.board.owner'] });
  }

  findByListId(listId: string): Promise<Card[]> {
    return this.em.find(Card, { list: listId }, { orderBy: { position: 'ASC' } });
  }

  findByBoardId(boardId: string): Promise<Card[]> {
    return this.em.find(
      Card,
      { list: { board: boardId } },
      {
        orderBy: [{ list: { position: 'ASC' } }, { position: 'ASC' }],
        populate: ['list'],
      }
    );
  }

  async create(data: {
    listId: string;
    title: string;
    description?: string;
    position?: number;
  }): Promise<Card> {
    if (data.position !== undefined) {
      const card = this.em.create(Card, {
        list: this.em.getReference(List, data.listId),
        title: data.title,
        description: data.description,
        position: data.position,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.em.persistAndFlush(card);
      return card;
    }
    return this.em.transactional(async (em) => {
      const last = await em.find(Card, { list: data.listId }, { orderBy: { position: 'DESC' }, limit: 1 });
      const position = last[0] ? Number(last[0].position) + 1 : 0;
      const card = em.create(Card, {
        list: em.getReference(List, data.listId),
        title: data.title,
        description: data.description,
        position,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await em.persistAndFlush(card);
      return card;
    });
  }

  async update(
    id: string,
    data: Partial<{ title: string; description: string; dueDate: Date | null; position: number }>
  ): Promise<Card> {
    const card = await this.em.findOneOrFail(Card, { id });
    if (data.title !== undefined) card.title = data.title;
    if (data.description !== undefined) card.description = data.description;
    if (data.dueDate !== undefined) card.dueDate = data.dueDate ?? undefined;
    if (data.position !== undefined) card.position = data.position;
    await this.em.flush();
    return card;
  }

  async delete(id: string): Promise<void> {
    await this.em.nativeDelete(Card, { id });
  }

  /**
   * Move card to another list at given position. Updates positions of other cards
   * in source and target list as needed. Runs in a transaction.
   */
  async move(cardId: string, listId: string, position: number): Promise<Card> {
    return this.em.transactional(async (em) => {
      const card = await em.findOneOrFail(Card, cardId, { populate: ['list'] });
      const oldListId = card.list.id;
      const oldPosition = Number(card.position);

      if (oldListId === listId && oldPosition === position) return card;

      if (oldListId !== listId) {
        const inOldList = await em.find(Card, { list: oldListId }, { orderBy: { position: 'ASC' } });
        for (const c of inOldList) {
          const p = Number(c.position);
          if (p > oldPosition) c.position = p - 1;
        }
        const inNewList = await em.find(Card, { list: listId }, { orderBy: { position: 'ASC' } });
        for (const c of inNewList) {
          if (Number(c.position) >= position) c.position = Number(c.position) + 1;
        }
      } else {
        const inList = await em.find(Card, { list: listId }, { orderBy: { position: 'ASC' } });
        if (position > oldPosition) {
          for (const c of inList) {
            const p = Number(c.position);
            if (p > oldPosition && p <= position) c.position = p - 1;
          }
        } else if (position < oldPosition) {
          for (const c of inList) {
            const p = Number(c.position);
            if (p >= position && p < oldPosition) c.position = p + 1;
          }
        }
      }

      card.list = em.getReference(List, listId);
      card.position = position;
      await em.flush();
      return card;
    });
  }
}
