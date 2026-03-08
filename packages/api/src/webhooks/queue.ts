import Queue from 'bull';

const QUEUE_NAME = 'webhook-calls';

export interface WebhookJobPayload {
  boardId: string;
  webhookUrl: string;
  event: string;
  payload: Record<string, unknown>;
}

let queue: Queue.Queue<WebhookJobPayload> | null = null;

function getRedisUrl(): string | undefined {
  return process.env.REDIS_URL;
}

/**
 * Returns the webhook queue if REDIS_URL is set, otherwise null.
 * When null, callers should fall back to synchronous delivery (or skip).
 */
export function getWebhookQueue(): Queue.Queue<WebhookJobPayload> | null {
  if (queue) return queue;
  const redisUrl = getRedisUrl();
  if (!redisUrl) return null;
  queue = new Queue<WebhookJobPayload>(QUEUE_NAME, redisUrl, {
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });
  return queue;
}

/**
 * Add a webhook call to the queue. Returns true if queued, false if queue unavailable.
 */
export async function addWebhookJob(data: WebhookJobPayload): Promise<boolean> {
  const q = getWebhookQueue();
  if (!q) return false;
  await q.add(data);
  return true;
}
