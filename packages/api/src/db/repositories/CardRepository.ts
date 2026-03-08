import type { EntityManager } from '@mikro-orm/core';
import { Card } from '../entities/Card';
import { CardAssignee } from '../entities/CardAssignee';
import { List } from '../entities/List';
import { User } from '../entities/User';

export class CardRepository {
  constructor(private readonly em: EntityManager) {}

  findById(id: string): Promise<Card | null> {
    return this.em.findOne(Card, { id }, {
      populate: ['list', 'list.board', 'list.board.owner', 'assignees', 'assignees.user'],
    });
  }

  findByListId(listId: string): Promise<Card[]> {
    return this.em.find(Card, { list: listId }, {
      orderBy: { position: 'ASC' },
      populate: ['assignees', 'assignees.user'],
    });
  }

  findByBoardId(boardId: string): Promise<Card[]> {
    return this.em.find(
      Card,
      { list: { board: boardId } },
      {
        orderBy: [{ list: { position: 'ASC' } }, { position: 'ASC' }],
        populate: ['list', 'assignees', 'assignees.user'],
      }
    );
  }

  async create(data: {
    listId: string;
    title: string;
    description?: string;
    position?: number;
    dueDate?: Date | null;
    type?: string;
    assigneeIds?: string[];
  }): Promise<Card> {
    const createCard = (em: EntityManager, position: number) => {
      return em.create(Card, {
        list: em.getReference(List, data.listId),
        title: data.title,
        description: data.description,
        position,
        dueDate: data.dueDate ?? undefined,
        type: data.type ?? 'task',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    };

    if (data.position !== undefined) {
      const card = createCard(this.em, data.position);
      await this.em.persistAndFlush(card);
      for (const userId of data.assigneeIds ?? []) {
        const a = this.em.create(CardAssignee, {
          card,
          user: this.em.getReference(User, userId),
        });
        await this.em.persist(a);
      }
      await this.em.flush();
      return this.em.findOneOrFail(Card, card.id, { populate: ['list', 'assignees', 'assignees.user'] });
    }
    return this.em.transactional(async (em) => {
      const last = await em.find(Card, { list: data.listId }, { orderBy: { position: 'DESC' }, limit: 1 });
      const position = last[0] ? Number(last[0].position) + 1 : 0;
      const card = createCard(em, position);
      await em.persistAndFlush(card);
      for (const userId of data.assigneeIds ?? []) {
        const a = em.create(CardAssignee, {
          card,
          user: em.getReference(User, userId),
        });
        await em.persist(a);
      }
      await em.flush();
      return em.findOneOrFail(Card, card.id, { populate: ['list', 'assignees', 'assignees.user'] });
    });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      dueDate: Date | null;
      position: number;
      type: string;
      assigneeIds: string[];
    }>
  ): Promise<Card> {
    const card = await this.em.findOneOrFail(Card, { id }, { populate: ['assignees'] });
    if (data.title !== undefined) card.title = data.title;
    if (data.description !== undefined) card.description = data.description;
    if (data.dueDate !== undefined) card.dueDate = data.dueDate ?? undefined;
    if (data.position !== undefined) card.position = data.position;
    if (data.type !== undefined) card.type = data.type;
    if (data.assigneeIds !== undefined) {
      await this.em.nativeDelete(CardAssignee, { card: id });
      for (const userId of data.assigneeIds) {
        const a = this.em.create(CardAssignee, {
          card: this.em.getReference(Card, id),
          user: this.em.getReference(User, userId),
        });
        await this.em.persist(a);
      }
    }
    await this.em.flush();
    return this.em.findOneOrFail(Card, id, { populate: ['list', 'assignees', 'assignees.user'] });
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
      return em.findOneOrFail(Card, cardId, { populate: ['list', 'assignees', 'assignees.user'] });
    });
  }
}
