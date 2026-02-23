import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { List } from './List';

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

  @Property({ type: 'Date', nullable: true })
  dueDate?: Date;

  @Property({ type: 'Date' })
  createdAt = new Date();

  @Property({ type: 'Date', onUpdate: () => new Date() })
  updatedAt = new Date();
}
