import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './User';

@Entity({ tableName: 'notifications' })
@Index({ properties: ['user'] })
@Index({ properties: ['createdAt'] })
export class Notification {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => User, { deleteRule: 'cascade' })
  user!: User;

  @Property({ type: 'string', length: 64 })
  type!: string;

  @Property({ type: 'json' })
  payload!: Record<string, unknown>;

  @Property({ type: 'Date', nullable: true })
  readAt: Date | null = null;

  @Property({ type: 'Date' })
  createdAt = new Date();
}
