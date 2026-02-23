import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from './User';

@Entity({ tableName: 'boards' })
@Index({ properties: ['owner'] })
export class Board {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => User, { deleteRule: 'cascade' })
  owner!: User;

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'string', nullable: true })
  description?: string;

  @Property({ type: 'Date' })
  createdAt = new Date();

  @Property({ type: 'Date', onUpdate: () => new Date() })
  updatedAt = new Date();
}
