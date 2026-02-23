import type { EntityManager } from '@mikro-orm/core';
import { CardComment } from '../entities/CardComment';
import { Card } from '../entities/Card';
import { User } from '../entities/User';

export class CardCommentRepository {
  constructor(private readonly em: EntityManager) {}

  findById(id: string): Promise<CardComment | null> {
    return this.em.findOne(CardComment, { id }, { populate: ['card', 'card.list', 'card.list.board', 'user'] });
  }

  findByCardId(
    cardId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<CardComment[]> {
    return this.em.find(CardComment, { card: cardId }, {
      orderBy: { createdAt: 'ASC' },
      populate: ['user'],
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  async create(data: { cardId: string; userId: string; content: string }): Promise<CardComment> {
    const comment = this.em.create(CardComment, {
      card: this.em.getReference(Card, data.cardId),
      user: this.em.getReference(User, data.userId),
      content: data.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persistAndFlush(comment);
    return comment;
  }

  async update(id: string, content: string): Promise<CardComment> {
    const comment = await this.em.findOneOrFail(CardComment, { id });
    comment.content = content;
    await this.em.flush();
    return comment;
  }

  async delete(id: string): Promise<void> {
    await this.em.nativeDelete(CardComment, { id });
  }
}
