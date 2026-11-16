import crypto from 'crypto';
import { getWebhooksByUserId, updateWebhookLastTriggered, ApiWebhook } from './db';

export interface WebhookEventPayload {
  id: string;
  event: string;
  created_at: string;
  data: Record<string, any>;
}

/**
 * Dispatches a webhook notification to registered endpoints or a specific target URL
 */
export async function dispatchWebhookEvent(params: {
  userId: string;
  event: string;
  data: Record<string, any>;
  targetUrl?: string;
  targetSecret?: string;
}): Promise<void> {
  const { userId, event, data, targetUrl, targetSecret } = params;

  const eventPayload: WebhookEventPayload = {
    id: `evt_${crypto.randomUUID().slice(0, 12)}`,
    event,
    created_at: new Date().toISOString(),
    data,
  };

  const payloadString = JSON.stringify(eventPayload);

  // If a direct target URL is passed (e.g. from an async job request)
  if (targetUrl) {
    const secret = targetSecret || 'ct_default_whsec';
    const signature = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');

    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CodeThesis-Event': event,
          'X-CodeThesis-Signature': `sha256=${signature}`,
          'X-CodeThesis-Delivery': eventPayload.id,
          'User-Agent': 'CodeThesis-Webhooks/1.0',
        },
        body: payloadString,
        signal: AbortSignal.timeout(10000),
      });
    } catch (err: any) {
      console.warn(`Direct webhook delivery to ${targetUrl} failed:`, err.message);
    }
  }

  // Deliver to user's registered webhooks
  try {
    const userWebhooks = await getWebhooksByUserId(userId);
    const activeHooks = userWebhooks.filter(
      (w) => w.status === 'active' && (w.events.includes('*') || w.events.includes(event))
    );

    for (const hook of activeHooks) {
      const signature = crypto.createHmac('sha256', hook.secret).update(payloadString).digest('hex');

      fetch(hook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CodeThesis-Event': event,
          'X-CodeThesis-Signature': `sha256=${signature}`,
          'X-CodeThesis-Delivery': eventPayload.id,
          'User-Agent': 'CodeThesis-Webhooks/1.0',
        },
        body: payloadString,
        signal: AbortSignal.timeout(10000),
      })
        .then(() => updateWebhookLastTriggered(hook.id))
        .catch((err) => console.warn(`Webhook ${hook.id} delivery to ${hook.url} failed:`, err.message));
    }
  } catch (err: any) {
    console.warn('User webhook dispatch error:', err.message);
  }
}
