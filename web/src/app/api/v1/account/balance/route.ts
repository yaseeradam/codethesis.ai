import { NextRequest, NextResponse } from 'next/server';
import { authenticateDeveloperRequest, finalizeDeveloperResponse } from '@/lib/apiKeyAuth';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let authResult: any = null;

  try {
    authResult = await authenticateDeveloperRequest(req);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { user, apiKey, isTest, requestId } = authResult;

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
  } catch (err: any) {
    const requestId = authResult?.requestId || `req_${Date.now()}`;
    return NextResponse.json(
      {
        error: {
          code: 'internal_server_error',
          message: 'An unexpected error occurred while fetching account balance.',
          request_id: requestId,
        },
      },
      { status: 500, headers: { 'X-CodeThesis-Request-Id': requestId } }
    );
  }
}
