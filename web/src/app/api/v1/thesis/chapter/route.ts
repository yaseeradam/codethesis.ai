import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateDeveloperRequest,
  chargeDeveloperCredits,
  finalizeDeveloperResponse,
} from '@/lib/apiKeyAuth';
import { generateAcademicAI } from '@/lib/ai';

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
  const chapterNumber = Number(body.chapter_number) || 1;
  const department = (body.department || 'Computer Science / Engineering').trim();
  const institution = (body.institution || 'Tertiary University').trim();
  const customPrompt = (body.prompt || '').trim();

  if (!topic) {
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'bad_request',
          message: 'The "topic" field is required to generate a dissertation chapter.',
          request_id: requestId,
        },
      },
      { status: 400 }
    );
    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/thesis/chapter',
      method: 'POST',
      statusCode: 400,
      creditsCharged: 0,
      startTime,
      requestId,
    });
  }

  // Deduct 1 credit for thesis chapter synthesis
  const creditCharge = await chargeDeveloperCredits(user, 'thesis', 1, isTest);
  if (!creditCharge.allowed) {
    return await finalizeDeveloperResponse({
      response: creditCharge.response!,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/thesis/chapter',
      method: 'POST',
      statusCode: 402,
      creditsCharged: 0,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  }

  try {
    const systemPrompt = `You are CodeThesis AI Public Engine, an authoritative academic synthesizer generating dissertation chapters compliant with NUC benchmarks and APA 7th style.
Topic: "${topic}"
Department: "${department}"
Institution: "${institution}"
Chapter: ${chapterNumber}`;

    const userPrompt = customPrompt || `Generate a comprehensive, publication-grade academic section for Chapter ${chapterNumber} on the research topic "${topic}". Include formal headings, theoretical analysis, methodology or architecture, and verifiable APA citations.`;

    const aiRes = await generateAcademicAI({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 4000,
    });

    const response = NextResponse.json({
      object: 'thesis.chapter',
      chapter_number: chapterNumber,
      topic,
      department,
      institution,
      content: aiRes.content,
      model_provider: aiRes.provider,
      credits_billed: isTest ? 0 : 1,
      credits_remaining: creditCharge.remainingCredits,
      request_id: requestId,
      created_at: new Date().toISOString(),
    });

    return await finalizeDeveloperResponse({
      response,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/thesis/chapter',
      method: 'POST',
      statusCode: 200,
      creditsCharged: isTest ? 0 : 1,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  } catch (err: any) {
    console.error('Developer thesis API error:', err);
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'ai_synthesis_error',
          message: err.message || 'Failed to synthesize chapter content.',
          request_id: requestId,
        },
      },
      { status: 500 }
    );

    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/thesis/chapter',
      method: 'POST',
      statusCode: 500,
      creditsCharged: 0,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  }
}
