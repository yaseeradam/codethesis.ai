import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateDeveloperRequest,
  chargeDeveloperCredits,
  finalizeDeveloperResponse,
} from '@/lib/apiKeyAuth';
import { createApiJob, updateApiJob } from '@/lib/db';
import { generateAcademicAI } from '@/lib/ai';
import { dispatchWebhookEvent } from '@/lib/webhookDispatcher';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const auth = await authenticateDeveloperRequest(req);
  if (!auth.authorized) {
    return auth.response;
  }

  const { user, apiKey, isTest, requestId } = auth;

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const topic = (body.topic || '').trim();
  const chapterNumber = Number(body.chapter_number || body.chapterNumber || 1);
  const department = (body.department || 'Computer Science / Engineering').trim();
  const institution = (body.institution || 'Tertiary University').trim();
  const methodology = (body.methodology || 'Object-Oriented Analysis and Design (OOAD)').trim();
  const webhookUrl = (body.webhook_url || body.webhookUrl || '').trim();

  if (!topic) {
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'bad_request',
          message: 'The "topic" field is required to initiate an asynchronous thesis job.',
          request_id: requestId,
        },
      },
      { status: 400 }
    );
    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/jobs/thesis',
      method: 'POST',
      statusCode: 400,
      creditsCharged: 0,
      startTime,
      requestId,
    });
  }

  // Deduct 1 credit for the job
  const creditCharge = await chargeDeveloperCredits(user, 'thesis', 1, isTest);
  if (!creditCharge.allowed) {
    return await finalizeDeveloperResponse({
      response: creditCharge.response!,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/jobs/thesis',
      method: 'POST',
      statusCode: 402,
      creditsCharged: 0,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  }

  // Create job record in DB
  const job = await createApiJob({
    userId: user.id,
    keyId: apiKey.id,
    jobType: 'thesis_chapter',
    inputPayload: { topic, chapterNumber, department, institution, methodology },
    webhookUrl: webhookUrl || undefined,
    creditsBilled: isTest ? 0 : 1,
  });

  // Execute processing asynchronously in background
  (async () => {
    try {
      const chapterPrompt = `Generate a rigorous, publication-grade academic Chapter ${chapterNumber} for a Bachelor of Science / Technology dissertation at ${institution}.
Department: ${department}
Dissertation Topic: "${topic}"
Methodology: ${methodology}

Requirements:
- Structure following the Nigerian National Universities Commission (NUC) benchmark academic standard.
- Minimum 4 detailed sub-sections with deep analytical prose.
- In-text APA 7th edition academic citations (e.g., [Surname, 2024]).
- Zero placeholder text or vague fluff.`;

      const aiResponse = await generateAcademicAI({
        prompt: chapterPrompt,
        temperature: 0.65,
        maxTokens: 3500,
      });

      const resultPayload = {
        topic,
        chapter_number: chapterNumber,
        department,
        institution,
        content: aiResponse.content,
        model_provider: aiResponse.provider,
        word_count: aiResponse.content.split(/\s+/).length,
      };

      await updateApiJob(job.id, {
        status: 'completed',
        progress: 100,
        resultPayload,
      });

      // Dispatch Webhook Event
      await dispatchWebhookEvent({
        userId: user.id,
        event: 'job.completed',
        data: {
          job_id: job.id,
          job_type: 'thesis_chapter',
          status: 'completed',
          result: resultPayload,
        },
        targetUrl: webhookUrl || undefined,
      });
    } catch (err: any) {
      console.error(`Async job ${job.id} failed:`, err);
      await updateApiJob(job.id, {
        status: 'failed',
        errorMessage: err.message || 'Background thesis synthesis failed.',
      });

      await dispatchWebhookEvent({
        userId: user.id,
        event: 'job.failed',
        data: {
          job_id: job.id,
          job_type: 'thesis_chapter',
          status: 'failed',
          error: err.message,
        },
        targetUrl: webhookUrl || undefined,
      });
    }
  })();

  const response = NextResponse.json(
    {
      object: 'job.created',
      job_id: job.id,
      job_type: 'thesis_chapter',
      status: 'processing',
      progress: 10,
      check_status_url: `/api/v1/jobs/${job.id}`,
      webhook_url: webhookUrl || null,
      credits_billed: isTest ? 0 : 1,
      credits_remaining: creditCharge.remainingCredits,
      request_id: requestId,
      created_at: job.createdAt,
    },
    { status: 202 }
  );

  return await finalizeDeveloperResponse({
    response,
    apiKey,
    userId: user.id,
    endpoint: '/api/v1/jobs/thesis',
    method: 'POST',
    statusCode: 202,
    creditsCharged: isTest ? 0 : 1,
    startTime,
    requestId,
    remainingCredits: creditCharge.remainingCredits,
  });
}
