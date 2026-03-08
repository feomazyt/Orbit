import {
  Collection,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { User } from './User';
import { BoardMember } from './BoardMember';

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

  /** Board type, e.g. 'kanban', 'scrum', 'personal' */
  @Property({ type: 'string', default: 'kanban' })
  type = 'kanban';

  /** Priority level (higher = more important), e.g. 0–3 */
  @Property({ type: 'smallint', default: 0 })
  priorityLevel = 0;

  /** Optional webhook URL – POST called when card moves (and optionally create/update). */
  @Property({ type: 'string', nullable: true })
  webhookUrl?: string | null;

  @OneToMany(() => BoardMember, (bm: BoardMember) => bm.board)
  members = new Collection<BoardMember>(this);

  @Property({ type: 'Date' })
  createdAt = new Date();

  @Property({ type: 'Date', onUpdate: () => new Date() })
  updatedAt = new Date();
}
