import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Board } from './Board';

@Entity({ tableName: 'webhook_logs' })
@Index({ properties: ['board'] })
@Index({ properties: ['createdAt'] })
export class WebhookLog {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => Board, { deleteRule: 'cascade' })
  board!: Board;

  @Property({ type: 'string' })
  webhookUrl!: string;

  @Property({ type: 'string', length: 64 })
  event!: string;

  @Property({ type: 'json' })
  requestPayload!: Record<string, unknown>;

  @Property({ type: 'integer', nullable: true })
  responseStatus?: number | null;

  @Property({ type: 'text', nullable: true })
  responseBody?: string | null;

  @Property({ type: 'Date' })
  createdAt = new Date();
}
