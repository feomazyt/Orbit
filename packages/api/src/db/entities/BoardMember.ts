import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Board } from './Board';
import { User } from './User';

@Entity({ tableName: 'board_members' })
@Unique({ properties: ['board', 'user'] })
@Index({ properties: ['board'] })
@Index({ properties: ['user'] })
export class BoardMember {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Board, { deleteRule: 'cascade' })
  board!: Board;

  @ManyToOne(() => User, { deleteRule: 'cascade' })
  user!: User;

  /** Role: 'owner', 'admin', 'member', 'viewer' */
  @Property({ type: 'string', default: 'member' })
  role = 'member';

  @Property({ type: 'boolean', default: false })
  isFavourite = false;

  @Property({ type: 'Date' })
  createdAt = new Date();
}
