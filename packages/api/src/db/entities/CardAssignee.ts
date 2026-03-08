import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Unique,
} from '@mikro-orm/core';
import { Card } from './Card';
import { User } from './User';

@Entity({ tableName: 'card_assignees' })
@Unique({ properties: ['card', 'user'] })
@Index({ properties: ['card'] })
@Index({ properties: ['user'] })
export class CardAssignee {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Card, { deleteRule: 'cascade' })
  card!: Card;

  @ManyToOne(() => User, { deleteRule: 'cascade' })
  user!: User;
}
