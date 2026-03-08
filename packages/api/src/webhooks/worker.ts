import type { Job } from 'bull';
import { getWebhookQueue, type WebhookJobPayload } from './queue.js';
import { getEntityManager, getRepositories } from '../db/index.js';

const MAX_RESPONSE_BODY_LENGTH = 2000;

async function doPost(webhookUrl: string, payload: Record<string, unknown>): Promise<{ status: number; body: string }> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });
  const body = await res.text();
  return { status: res.status, body: body.slice(0, MAX_RESPONSE_BODY_LENGTH) };
}

async function deliverWebhook(job: Job<WebhookJobPayload>): Promise<{ status: number; body: string }> {
  return doPost(job.data.webhookUrl, job.data.payload);
}

/**
 * When Redis is unavailable, deliver webhook synchronously and log the result.
 */
export async function deliverWebhookSync(data: WebhookJobPayload): Promise<void> {
  const { boardId, webhookUrl, event, payload } = data;
  let responseStatus: number | null = null;
  let responseBody: string | null = null;
  try {
    const result = await doPost(webhookUrl, payload);
    responseStatus = result.status;
    responseBody = result.body;
  } catch (err) {
    responseBody = err instanceof Error ? err.message : String(err);
  }
  const em = getEntityManager();
  const { webhookLogRepository } = getRepositories(em);
  await webhookLogRepository.create({
    boardId,
    webhookUrl,
    event,
    requestPayload: payload,
    responseStatus,
    responseBody,
  });
}

export function startWebhookWorker(): void {
  const q = getWebhookQueue();
  if (!q) return;

  q.process(async (job: Job<WebhookJobPayload>) => {
    const { boardId, webhookUrl, event, payload } = job.data;
    let responseStatus: number | null = null;
    let responseBody: string | null = null;
    try {
      const result = await deliverWebhook(job);
      responseStatus = result.status;
      responseBody = result.body;
    } catch (err) {
      responseBody = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      const em = getEntityManager();
      const { webhookLogRepository } = getRepositories(em);
      await webhookLogRepository.create({
        boardId,
        webhookUrl,
        event,
        requestPayload: payload,
        responseStatus,
        responseBody,
      });
    }
  });

}
