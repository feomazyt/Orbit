import {
  Collection,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { List } from './List';
import { CardAssignee } from './CardAssignee';

@Entity({ tableName: 'cards' })
@Index({ properties: ['list'] })
export class Card {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => List, { deleteRule: 'cascade' })
  list!: List;

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'string', columnType: 'text', nullable: true })
  description?: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  position!: number;

  /** Task type, e.g. 'task', 'bug', 'feature', 'story'. */
  @Property({ type: 'string', default: 'task' })
  type = 'task';

  @Property({ type: 'Date', nullable: true })
  dueDate?: Date;

  @OneToMany(() => CardAssignee, (ca: CardAssignee) => ca.card)
  assignees = new Collection<CardAssignee>(this);

  @Property({ type: 'Date' })
  createdAt = new Date();

  @Property({ type: 'Date', onUpdate: () => new Date() })
  updatedAt = new Date();
}
