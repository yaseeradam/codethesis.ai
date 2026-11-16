import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateDeveloperRequest,
  chargeDeveloperCredits,
  finalizeDeveloperResponse,
  refundDeveloperCredits,
} from '@/lib/apiKeyAuth';
import { generateMermaidDiagram } from '@/lib/ai';

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
  const diagramType = (body.diagram_type || body.diagramType || 'sequence').trim();
  const department = (body.department || 'Computer Science / Engineering').trim();

  if (!topic) {
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'bad_request',
          message: 'The "topic" field is required to generate a UML diagram.',
          request_id: requestId,
        },
      },
      { status: 400 }
    );
    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/uml/generate',
      method: 'POST',
      statusCode: 400,
      creditsCharged: 0,
      startTime,
      requestId,
    });
  }

  const creditCharge = await chargeDeveloperCredits(user, 'umlDiagrams', 1, isTest);
  if (!creditCharge.allowed) {
    return await finalizeDeveloperResponse({
      response: creditCharge.response!,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/uml/generate',
      method: 'POST',
      statusCode: 402,
      creditsCharged: 0,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  }

  try {
    const diagram = await generateMermaidDiagram({
      topic,
      diagramType,
      department,
    });

    const response = NextResponse.json({
      object: 'uml.diagram',
      topic,
      diagram_type: diagramType,
      mermaid_code: diagram.mermaidCode,
      explanation: diagram.explanation,
      model_provider: diagram.provider,
      credits_billed: isTest ? 0 : 1,
      credits_remaining: creditCharge.remainingCredits,
      request_id: requestId,
      created_at: new Date().toISOString(),
    });

    return await finalizeDeveloperResponse({
      response,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/uml/generate',
      method: 'POST',
      statusCode: 200,
      creditsCharged: isTest ? 0 : 1,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  } catch (err: any) {
    console.error('Developer UML API error:', err);
    if (!isTest) {
      await refundDeveloperCredits(user.id, 1, isTest);
    }
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'uml_generation_error',
          message: err.message || 'Failed to synthesize UML diagram.',
          request_id: requestId,
        },
      },
      { status: 500 }
    );

    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/uml/generate',
      method: 'POST',
      statusCode: 500,
      creditsCharged: 0,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  }
}
