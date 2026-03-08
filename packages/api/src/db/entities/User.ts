import { Collection, Entity, OneToMany, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { BoardMember } from './BoardMember';
import { CardAssignee } from './CardAssignee';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ type: 'string' })
  @Unique()
  email!: string;

  @Property({ type: 'string', columnType: 'text' })
  passwordHash!: string;

  @Property({ type: 'string', nullable: true })
  name?: string;

  @OneToMany(() => BoardMember, (bm: BoardMember) => bm.user)
  boardMembers = new Collection<BoardMember>(this);

  @OneToMany(() => CardAssignee, (ca: CardAssignee) => ca.user)
  cardAssignments = new Collection<CardAssignee>(this);

  @Property({ type: 'Date' })
  createdAt = new Date();

  @Property({ type: 'Date', onUpdate: () => new Date() })
  updatedAt = new Date();
}
