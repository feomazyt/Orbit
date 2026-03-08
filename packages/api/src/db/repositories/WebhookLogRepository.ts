import type { EntityManager } from '@mikro-orm/core';
import { Board } from '../entities/Board';
import { WebhookLog } from '../entities/WebhookLog';

export class WebhookLogRepository {
  constructor(private readonly em: EntityManager) {}

  async create(data: {
    boardId: string;
    webhookUrl: string;
    event: string;
    requestPayload: Record<string, unknown>;
    responseStatus?: number | null;
    responseBody?: string | null;
  }): Promise<WebhookLog> {
    const log = this.em.create(WebhookLog, {
      board: this.em.getReference(Board, data.boardId),
      webhookUrl: data.webhookUrl,
      event: data.event,
      requestPayload: data.requestPayload,
      responseStatus: data.responseStatus ?? null,
      responseBody: data.responseBody ?? null,
      createdAt: new Date(),
    });
    await this.em.persistAndFlush(log);
    return log;
  }
}
