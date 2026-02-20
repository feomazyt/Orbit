import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Board } from './Board';

@Entity({ tableName: 'lists' })
@Index({ properties: ['board'] })
export class List {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Board, { deleteRule: 'cascade' })
  board!: Board;

  @Property()
  title!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 }) // lub type: 'integer'
  position!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
