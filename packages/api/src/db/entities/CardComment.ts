import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Card } from './Card';
import { User } from './User';

@Entity({ tableName: 'card_comments' })
@Index({ properties: ['card'] })
@Index({ properties: ['user'] }) // opcjonalnie
export class CardComment {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Card, { deleteRule: 'cascade' })
  card!: Card;

  @ManyToOne(() => User, { deleteRule: 'cascade' })
  user!: User;

  @Property({ columnType: 'text' })
  content!: string;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
