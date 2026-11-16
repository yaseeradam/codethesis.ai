import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateDeveloperRequest,
  chargeDeveloperCredits,
  finalizeDeveloperResponse,
} from '@/lib/apiKeyAuth';
import { solveAcademicProblem } from '@/lib/ai';

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

  const problem = (body.problem || body.question || '').trim();
  const department = (body.department || 'Computer Science / Engineering').trim();
  const institution = (body.institution || 'Tertiary University').trim();

  if (!problem) {
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'bad_request',
          message: 'The "problem" field is required to solve an engineering or mathematical problem.',
          request_id: requestId,
        },
      },
      { status: 400 }
    );
    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/assignment/solve',
      method: 'POST',
      statusCode: 400,
      creditsCharged: 0,
      startTime,
      requestId,
    });
  }

  const creditCharge = await chargeDeveloperCredits(user, 'assignmentSolver', 1, isTest);
  if (!creditCharge.allowed) {
    return await finalizeDeveloperResponse({
      response: creditCharge.response!,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/assignment/solve',
      method: 'POST',
      statusCode: 402,
      creditsCharged: 0,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  }

  try {
    const solution = await solveAcademicProblem({
      problem,
      department,
      institution,
    });

    const response = NextResponse.json({
      object: 'assignment.solution',
      problem,
      title: solution.title,
      steps: solution.steps,
      final_answer: solution.finalAnswer,
      model_provider: solution.provider,
      credits_billed: isTest ? 0 : 1,
      credits_remaining: creditCharge.remainingCredits,
      request_id: requestId,
      created_at: new Date().toISOString(),
    });

    return await finalizeDeveloperResponse({
      response,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/assignment/solve',
      method: 'POST',
      statusCode: 200,
      creditsCharged: isTest ? 0 : 1,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  } catch (err: any) {
    console.error('Developer assignment API error:', err);
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'solver_error',
          message: err.message || 'Failed to solve assignment problem.',
          request_id: requestId,
        },
      },
      { status: 500 }
    );

    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/assignment/solve',
      method: 'POST',
      statusCode: 500,
      creditsCharged: 0,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  }
}
