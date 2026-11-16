import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateDeveloperRequest,
  finalizeDeveloperResponse,
} from '@/lib/apiKeyAuth';
import { getApiJobById } from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const auth = await authenticateDeveloperRequest(req);
  if (!auth.authorized) {
    return auth.response;
  }

  const { user, apiKey, requestId } = auth;
  const { id } = await context.params;

  const job = await getApiJobById(id);
  if (!job) {
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'not_found',
          message: `Job with ID "${id}" was not found.`,
          request_id: requestId,
        },
      },
      { status: 404 }
    );
    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: `/api/v1/jobs/${id}`,
      method: 'GET',
      statusCode: 404,
      creditsCharged: 0,
      startTime,
      requestId,
    });
  }

  // Ensure caller owns the job
  if (job.userId !== user.id) {
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'forbidden',
          message: 'You do not have permission to view this job.',
          request_id: requestId,
        },
      },
      { status: 403 }
    );
    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: `/api/v1/jobs/${id}`,
      method: 'GET',
      statusCode: 403,
      creditsCharged: 0,
      startTime,
      requestId,
    });
  }

  const response = NextResponse.json({
    object: 'job',
    job_id: job.id,
    job_type: job.jobType,
    status: job.status,
    progress: job.status === 'completed' ? 100 : job.progress,
    result: job.resultPayload || null,
    error: job.errorMessage || null,
    webhook_url: job.webhookUrl || null,
    credits_billed: job.creditsBilled,
    created_at: job.createdAt,
    completed_at: job.completedAt || null,
    request_id: requestId,
  });

  return await finalizeDeveloperResponse({
    response,
    apiKey,
    userId: user.id,
    endpoint: `/api/v1/jobs/${id}`,
    method: 'GET',
    statusCode: 200,
    creditsCharged: 0,
    startTime,
    requestId,
  });
}
