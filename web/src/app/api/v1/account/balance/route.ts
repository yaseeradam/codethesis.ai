import { NextRequest, NextResponse } from 'next/server';
import { authenticateDeveloperRequest, finalizeDeveloperResponse } from '@/lib/apiKeyAuth';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const auth = await authenticateDeveloperRequest(req);
  if (!auth.authorized) {
    return auth.response;
  }

  const { user, apiKey, isTest, requestId } = auth;

  const response = NextResponse.json({
    object: 'account.balance',
    user_id: user.id,
    email: user.email,
    plan: user.plan,
    credits: user.credits,
    mode: isTest ? 'test' : 'live',
    key_name: apiKey.name,
    rate_limit: apiKey.rateLimitPerMin,
  });

  return await finalizeDeveloperResponse({
    response,
    apiKey,
    userId: user.id,
    endpoint: '/api/v1/account/balance',
    method: 'GET',
    statusCode: 200,
    creditsCharged: 0,
    startTime,
    requestId,
    remainingCredits: user.credits,
  });
}
