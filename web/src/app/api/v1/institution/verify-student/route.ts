import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateDeveloperRequest,
  finalizeDeveloperResponse,
} from '@/lib/apiKeyAuth';
import { getUserByEmail, updateUser, createNotification, logAuthEvent } from '@/lib/db';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const auth = await authenticateDeveloperRequest(req);
  if (!auth.authorized) {
    return auth.response;
  }

  const { user, apiKey, requestId } = auth;

  // Verify institutional privilege
  if (!apiKey.isInstitutional) {
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'forbidden_non_institutional',
          message: 'The "verify-student" API requires an Enterprise Campus / Institutional API Key. Upgrade your tier in the Developer Portal.',
          request_id: requestId,
        },
      },
      { status: 403 }
    );
    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/institution/verify-student',
      method: 'POST',
      statusCode: 403,
      creditsCharged: 0,
      startTime,
      requestId,
    });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const matricNumber = (body.matric_number || body.matricNumber || '').trim();
  const studentEmail = (body.student_email || body.studentEmail || '').trim().toLowerCase();
  const studentName = (body.student_name || body.studentName || 'Student Scholar').trim();
  const department = (body.department || 'Computer Science').trim();
  const rawCredits = parseInt(String(body.allocated_credits || body.allocatedCredits || '25'), 10);
  const allocatedCredits = isNaN(rawCredits) ? 25 : Math.min(Math.max(1, rawCredits), 200);

  if (!matricNumber) {
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'bad_request',
          message: 'The "matric_number" field is required for institutional student verification.',
          request_id: requestId,
        },
      },
      { status: 400 }
    );
    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/institution/verify-student',
      method: 'POST',
      statusCode: 400,
      creditsCharged: 0,
      startTime,
      requestId,
    });
  }

  // Check if student user exists in CodeThesis
  let studentUser = studentEmail ? await getUserByEmail(studentEmail) : null;
  if (studentUser) {
    const newCredits = (studentUser.credits || 0) + allocatedCredits;
    await updateUser(studentUser.id, {
      credits: newCredits,
      institution: apiKey.institutionName || studentUser.institution,
      department: department || studentUser.department,
      matricNumber: matricNumber || studentUser.matricNumber,
    });

    await createNotification({
      userId: studentUser.id,
      title: 'Institutional Grant Credited',
      message: `Your institution (${apiKey.institutionName || 'Campus Administration'}) has credited your account with ${allocatedCredits} academic thesis research credits.`,
      type: 'credit',
      link: '/dashboard',
    });
  }

  await logAuthEvent({
    action: 'signin_success',
    userId: user.id,
    email: user.email,
    metadata: {
      action: 'INSTITUTIONAL_STUDENT_VERIFIED',
      institution: apiKey.institutionName || 'Unknown',
      matric: matricNumber,
      allocatedCredits,
    },
  });

  const response = NextResponse.json({
    object: 'institution.student_verification',
    institution: apiKey.institutionName || 'Academic Enterprise Partner',
    matric_number: matricNumber,
    student_name: studentName,
    student_email: studentEmail || null,
    account_linked: !!studentUser,
    allocated_credits: allocatedCredits,
    status: 'verified_active',
    eligibility: {
      can_submit_dissertation: true,
      can_access_viva_defense: true,
      can_generate_siwes: true,
    },
    verified_at: new Date().toISOString(),
    request_id: requestId,
  });

  return await finalizeDeveloperResponse({
    response,
    apiKey,
    userId: user.id,
    endpoint: '/api/v1/institution/verify-student',
    method: 'POST',
    statusCode: 200,
    creditsCharged: 0,
    startTime,
    requestId,
  });
}
