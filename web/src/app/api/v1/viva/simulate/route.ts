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
  const studentResponse = (body.student_response || body.response || '').trim();
  const course = (body.course || 'Computer Science / Engineering').trim();
  const persona = (body.examiner_persona || 'strict').trim();
  const history = Array.isArray(body.history) ? body.history : [];

  if (!topic) {
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'bad_request',
          message: 'The "topic" field is required to simulate a viva oral defense session.',
          request_id: requestId,
        },
      },
      { status: 400 }
    );
    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/viva/simulate',
      method: 'POST',
      statusCode: 400,
      creditsCharged: 0,
      startTime,
      requestId,
    });
  }

  const creditCharge = await chargeDeveloperCredits(user, 'vivaSimulator', 1, isTest);
  if (!creditCharge.allowed) {
    return await finalizeDeveloperResponse({
      response: creditCharge.response!,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/viva/simulate',
      method: 'POST',
      statusCode: 402,
      creditsCharged: 0,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  }

  try {
    const systemPrompt = `You are a distinguished University External Examiner in Nigeria conducting an oral Viva Voce defense.
Persona: ${persona.toUpperCase()} (rigorous, methodologically scrutinizing, uncompromising on scientific validity).
Research Topic: "${topic}"
Department: "${course}"
Provide an authentic examiner evaluation of the student's defense response, rate their answer from 1 to 10, provide constructive critique, and pose the next follow-up examination question.
Return strictly valid JSON with the format:
{
  "rating": number (1-10),
  "critique": "detailed assessment of student reasoning",
  "examiner_followup": "the next demanding question posed to the candidate",
  "verdict": "Pass with Distinction" | "Pass with Minor Corrections" | "Major Revision Needed"
}`;

    const conversationContext = history
      .map((h: any) => `${h.role === 'examiner' ? 'Examiner' : 'Candidate'}: ${h.content}`)
      .join('\n');

    const prompt = `Candidate Topic: "${topic}"
Previous Examination Exchanges:
${conversationContext || 'First question of the oral defense.'}

Current Candidate Response:
"${studentResponse || 'Candidate stands ready for examination.'}"

Evaluate and respond as the External Examiner in JSON format.`;

    const aiRes = await generateAcademicAI({
      prompt,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 1500,
    });

    let parsed: any = null;
    try {
      const match = aiRes.content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    } catch {}

    const examinerFollowup =
      parsed?.examiner_followup ||
      'How does your architectural paradigm prevent race conditions during high-volume concurrent transactions?';
    const critique =
      parsed?.critique ||
      'The candidate demonstrated foundational knowledge but must substantiate claims with empirical benchmark latency figures.';
    const rating = typeof parsed?.rating === 'number' ? parsed.rating : 7.5;
    const verdict = parsed?.verdict || 'Pass with Minor Corrections';

    const response = NextResponse.json({
      object: 'viva.simulation_turn',
      topic,
      course,
      examiner_persona: persona,
      rating,
      critique,
      examiner_followup: examinerFollowup,
      verdict,
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
      endpoint: '/api/v1/viva/simulate',
      method: 'POST',
      statusCode: 200,
      creditsCharged: isTest ? 0 : 1,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  } catch (err: any) {
    console.error('Developer viva API error:', err);
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'viva_simulation_error',
          message: err.message || 'Failed to simulate viva examiner turn.',
          request_id: requestId,
        },
      },
      { status: 500 }
    );

    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/viva/simulate',
      method: 'POST',
      statusCode: 500,
      creditsCharged: 0,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  }
}
