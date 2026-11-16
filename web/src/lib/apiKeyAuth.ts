import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { validateApiKey, logApiUsage, deductUserCredits, getUserById, ApiKey, User, ToolKey } from './db';
import { checkRateLimit } from './rateLimiter';

export interface ApiAuthSuccess {
  authorized: true;
  user: User;
  apiKey: ApiKey;
  isTest: boolean;
  requestId: string;
  rateLimitInfo: {
    limit: number;
    remaining: number;
    resetTime: number;
  };
}

export interface ApiAuthFailure {
  authorized: false;
  response: NextResponse;
  requestId: string;
}

export type ApiAuthResult = ApiAuthSuccess | ApiAuthFailure;

export async function authenticateDeveloperRequest(req: NextRequest): Promise<ApiAuthResult> {
  const requestId = `req_${crypto.randomUUID().slice(0, 12)}`;

  // Extract key
  let rawKey: string | null = null;
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    rawKey = authHeader.slice(7).trim();
  }

  if (!rawKey) {
    rawKey = req.headers.get('x-api-key')?.trim() || null;
  }

  if (!rawKey) {
    const url = new URL(req.url);
    rawKey = url.searchParams.get('api_key')?.trim() || null;
  }

  if (!rawKey) {
    return {
      authorized: false,
      requestId,
      response: NextResponse.json(
        {
          error: {
            code: 'unauthorized',
            message: 'API key is missing. Pass your key in the "Authorization: Bearer <key>" or "x-api-key" header.',
            request_id: requestId,
          },
        },
        { status: 401, headers: { 'X-CodeThesis-Request-Id': requestId } }
      ),
    };
  }

  const validation = await validateApiKey(rawKey);
  if (!validation.valid || !validation.keyRecord || !validation.user) {
    return {
      authorized: false,
      requestId,
      response: NextResponse.json(
        {
          error: {
            code: 'invalid_api_key',
            message: validation.error || 'The provided API key is invalid, inactive, or revoked.',
            request_id: requestId,
          },
        },
        { status: 401, headers: { 'X-CodeThesis-Request-Id': requestId } }
      ),
    };
  }

  // Rate Limiting & Domain Verification
  const origin = req.headers.get('origin') || req.headers.get('referer') || '';
  const rateLimit = await checkRateLimit({
    keyId: validation.keyRecord.id,
    limitPerMinute: validation.keyRecord.rateLimitPerMin || 60,
    origin,
    allowedDomains: validation.keyRecord.allowedDomains,
  });

  if (!rateLimit.allowed) {
    return {
      authorized: false,
      requestId,
      response: NextResponse.json(
        {
          error: {
            code: 'rate_limit_exceeded',
            message: rateLimit.error || 'Rate limit exceeded.',
            request_id: requestId,
          },
        },
        {
          status: 429,
          headers: {
            'X-CodeThesis-Request-Id': requestId,
            'Retry-After': String(rateLimit.retryAfter),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetTime),
          },
        }
      ),
    };
  }

  return {
    authorized: true,
    user: validation.user,
    apiKey: validation.keyRecord,
    isTest: validation.keyRecord.keyPrefix === 'ct_test_',
    requestId,
    rateLimitInfo: {
      limit: rateLimit.limit,
      remaining: rateLimit.remaining,
      resetTime: rateLimit.resetTime,
    },
  };
}

/**
 * Checks balance and deducts credits for an API call.
 * In test mode (ct_test_), credits are NOT deducted from the real account.
 */
export async function chargeDeveloperCredits(
  user: User,
  toolKey: ToolKey,
  cost: number,
  isTest = false
): Promise<{ allowed: boolean; remainingCredits: number; response?: NextResponse }> {
  if (isTest) {
    return { allowed: true, remainingCredits: user.credits };
  }

  // Check fresh balance
  const freshUser = await getUserById(user.id);
  const currentBalance = freshUser ? freshUser.credits : user.credits;

  if (currentBalance < cost) {
    return {
      allowed: false,
      remainingCredits: currentBalance,
      response: NextResponse.json(
        {
          error: {
            code: 'insufficient_credits',
            message: `Insufficient academic API credits. This operation requires ${cost} credit(s), but your current balance is ${currentBalance}. Please recharge at https://codethesis.ai/pricing.`,
            credits_required: cost,
            credits_available: currentBalance,
          },
        },
        { status: 402 }
      ),
    };
  }

  const result = await deductUserCredits(user.id, toolKey);
  if (!result.success) {
    return {
      allowed: false,
      remainingCredits: currentBalance,
      response: NextResponse.json(
        {
          error: {
            code: 'credit_deduction_failed',
            message: result.message,
          },
        },
        { status: 402 }
      ),
    };
  }

  return { allowed: true, remainingCredits: result.remainingCredits };
}

/**
 * Logs API usage and sets standard developer platform headers.
 */
export async function finalizeDeveloperResponse(params: {
  response: NextResponse;
  apiKey: ApiKey;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  creditsCharged: number;
  startTime: number;
  requestId: string;
  remainingCredits?: number;
  ip?: string;
}): Promise<NextResponse> {
  const durationMs = Date.now() - params.startTime;

  // Set platform headers
  params.response.headers.set('X-CodeThesis-Request-Id', params.requestId);
  params.response.headers.set('X-CodeThesis-Credits-Charged', String(params.creditsCharged));
  params.response.headers.set('X-RateLimit-Limit', String(params.apiKey.rateLimitPerMin || 60));
  if (params.remainingCredits !== undefined) {
    params.response.headers.set('X-CodeThesis-Credits-Remaining', String(params.remainingCredits));
  }
  params.response.headers.set('X-Response-Time', `${durationMs}ms`);

  // Log usage asynchronously
  logApiUsage({
    apiKeyId: params.apiKey.id,
    userId: params.userId,
    endpoint: params.endpoint,
    method: params.method,
    statusCode: params.statusCode,
    creditsDeducted: params.creditsCharged,
    responseTimeMs: durationMs,
    ipAddress: params.ip,
  }).catch((err) => console.error('Failed to log API usage:', err));

  return params.response;
}
