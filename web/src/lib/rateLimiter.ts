import { isNeonConfigured, sql } from './postgres';

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp in seconds
  retryAfter: number; // Seconds to wait
  error?: string;
}

// In-memory sliding fallback for high throughput or non-Neon environments
const inMemoryRateLimits = new Map<string, { windowStart: number; count: number }>();

/**
 * Sliding 1-minute window rate limiter
 */
export async function checkRateLimit(params: {
  keyId: string;
  limitPerMinute: number;
  origin?: string;
  allowedDomains?: string;
}): Promise<RateLimitResult> {
  const { keyId, limitPerMinute, origin, allowedDomains } = params;

  // 1. Origin / Domain Security Check (Institutional Scoping)
  if (allowedDomains && allowedDomains.trim() !== '*' && origin) {
    const cleanOrigin = origin.replace(/^https?:\/\//i, '').split(':')[0].toLowerCase();
    const allowedList = allowedDomains.split(',').map(d => d.trim().toLowerCase());
    const isDomainAllowed = allowedList.some(pattern => {
      if (pattern === '*' || pattern === cleanOrigin) return true;
      if (pattern.startsWith('*.')) {
        const root = pattern.slice(2);
        return cleanOrigin.endsWith(root);
      }
      return false;
    });

    if (!isDomainAllowed) {
      return {
        allowed: false,
        limit: limitPerMinute,
        remaining: 0,
        resetTime: Math.ceil(Date.now() / 1000) + 60,
        retryAfter: 60,
        error: `Origin domain "${origin}" is not authorized for this institutional API key. Allowed: ${allowedDomains}`,
      };
    }
  }

  const nowMs = Date.now();
  const windowMinute = Math.floor(nowMs / 60000);
  const resetEpochSeconds = (windowMinute + 1) * 60;
  const retryAfter = Math.max(1, resetEpochSeconds - Math.floor(nowMs / 1000));

  // 2. Neon PostgreSQL Atomic Rate Limit Increment
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        INSERT INTO api_rate_limits (key_id, window_start, request_count)
        VALUES (${keyId}, ${windowMinute}, 1)
        ON CONFLICT (key_id, window_start)
        DO UPDATE SET request_count = api_rate_limits.request_count + 1
        RETURNING request_count as "requestCount";
      `;

      if (rows && rows.length > 0) {
        const count = Number(rows[0].requestCount);
        const remaining = Math.max(0, limitPerMinute - count);
        const allowed = count <= limitPerMinute;

        return {
          allowed,
          limit: limitPerMinute,
          remaining,
          resetTime: resetEpochSeconds,
          retryAfter,
          error: allowed ? undefined : `Rate limit of ${limitPerMinute} requests per minute exceeded. Please retry in ${retryAfter}s.`,
        };
      }
    } catch (err) {
      console.warn('Neon rate limit check warning:', err);
    }
  }

  // 3. In-memory Fallback
  const existing = inMemoryRateLimits.get(keyId);
  let count = 1;
  if (existing && existing.windowStart === windowMinute) {
    existing.count += 1;
    count = existing.count;
  } else {
    inMemoryRateLimits.set(keyId, { windowStart: windowMinute, count: 1 });
  }

  // Garbage collect old in-memory entries periodically
  if (inMemoryRateLimits.size > 5000) {
    for (const [k, v] of inMemoryRateLimits.entries()) {
      if (v.windowStart < windowMinute - 1) inMemoryRateLimits.delete(k);
    }
  }

  const remaining = Math.max(0, limitPerMinute - count);
  const allowed = count <= limitPerMinute;

  return {
    allowed,
    limit: limitPerMinute,
    remaining,
    resetTime: resetEpochSeconds,
    retryAfter,
    error: allowed ? undefined : `Rate limit of ${limitPerMinute} requests per minute exceeded. Please retry in ${retryAfter}s.`,
  };
}
