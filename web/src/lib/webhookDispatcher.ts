import crypto from 'crypto';
import { getWebhooksByUserId, updateWebhookLastTriggered, ApiWebhook } from './db';
import { validateWebhookUrl } from './ssrfValidator';

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
    const urlCheck = validateWebhookUrl(targetUrl);
    if (!urlCheck.valid) {
      console.warn(`Direct webhook delivery aborted: SSRF check failed for ${targetUrl} (${urlCheck.error})`);
    } else {
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
          redirect: 'error', // Prevent redirect-based SSRF into private networks
          signal: AbortSignal.timeout(10000),
        });
      } catch (err: any) {
        console.warn(`Direct webhook delivery to ${targetUrl} failed:`, err.message);
      }
    }
  }

  // Deliver to user's registered webhooks
  try {
    const userWebhooks = await getWebhooksByUserId(userId);
    const activeHooks = userWebhooks.filter(
      (w) => w.status === 'active' && (w.events.includes('*') || w.events.includes(event))
    );

    const deliveryPromises = activeHooks.map(async (hook) => {
      const hookCheck = validateWebhookUrl(hook.url);
      if (!hookCheck.valid) {
        console.warn(`Skipping webhook ${hook.id}: SSRF check failed for ${hook.url}`);
        return;
      }

      const signature = crypto.createHmac('sha256', hook.secret).update(payloadString).digest('hex');

      try {
        const res = await fetch(hook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CodeThesis-Event': event,
            'X-CodeThesis-Signature': `sha256=${signature}`,
            'X-CodeThesis-Delivery': eventPayload.id,
            'User-Agent': 'CodeThesis-Webhooks/1.0',
          },
          body: payloadString,
          redirect: 'error', // Block redirect SSRF
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          await updateWebhookLastTriggered(hook.id);
        }
      } catch (err: any) {
        console.warn(`Webhook ${hook.id} delivery to ${hook.url} failed:`, err.message);
      }
    });

    await Promise.allSettled(deliveryPromises);
  } catch (err: any) {
    console.warn('User webhook dispatch error:', err.message);
  }
}
