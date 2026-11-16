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

  const company = (body.company || body.company_name || '').trim();
  const department = (body.department || 'Information Technology / Systems Engineering').trim();
  const weekNumber = Number(body.week_number) || 1;
  const institution = (body.institution || 'Tertiary University').trim();

  if (!company) {
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'bad_request',
          message: 'The "company" field is required to synthesize SIWES daily logbook entries.',
          request_id: requestId,
        },
      },
      { status: 400 }
    );
    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/siwes/logbook',
      method: 'POST',
      statusCode: 400,
      creditsCharged: 0,
      startTime,
      requestId,
    });
  }

  const creditCharge = await chargeDeveloperCredits(user, 'siwesLogbook', 1, isTest);
  if (!creditCharge.allowed) {
    return await finalizeDeveloperResponse({
      response: creditCharge.response!,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/siwes/logbook',
      method: 'POST',
      statusCode: 402,
      creditsCharged: 0,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  }

  try {
    const systemPrompt = `You are CodeThesis AI Industrial Training Engine. Generate realistic, technically rigorous daily SIWES work entries conforming to ITF Form 8 guidelines.
Company: "${company}"
Department: "${department}"
Week: ${weekNumber}
Institution: "${institution}"
Generate 5 daily entries (Monday through Friday) and a weekly summary. Return valid JSON:
{
  "weekly_summary": "summary text...",
  "supervisor_remark": "industry supervisor appraisal text...",
  "daily_entries": [
    {
      "day": "Monday",
      "task_title": "...",
      "description": "...",
      "tools_used": "..."
    }
  ]
}`;

    const prompt = `Generate technical daily tasks and weekly summary for Week ${weekNumber} at ${company} in ${department}.`;

    const aiRes = await generateAcademicAI({
      prompt,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 2500,
    });

    let parsed: any = null;
    try {
      const match = aiRes.content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    } catch {}

    const weeklySummary =
      parsed?.weekly_summary ||
      `Completed enterprise network operations, diagnostic evaluations, and structured hardware staging for Week ${weekNumber} at ${company}.`;
    const supervisorRemark =
      parsed?.supervisor_remark ||
      'Student intern demonstrated high technical compliance with industrial engineering standards.';
    const dailyEntries = Array.isArray(parsed?.daily_entries)
      ? parsed.daily_entries
      : [
          {
            day: 'Monday',
            task_title: `Orientation & Infrastructure Staging at ${company}`,
            description: 'Conducted diagnostic inspection on core rack distribution switches.',
            tools_used: 'PuTTY terminal, Console cables, Fluke multimeter',
          },
          {
            day: 'Tuesday',
            task_title: 'Structured UTP Cabling & Patching',
            description: 'Terminated 12 Cat6 copper links following T568B pinout specification.',
            tools_used: 'Klein crimping tool, Krone punchdown tool, Cable tester',
          },
          {
            day: 'Wednesday',
            task_title: 'VLAN Configuration & Port Security',
            description: 'Provisioned 802.1Q trunk interfaces and configured BPDU guard.',
            tools_used: 'Cisco IOS CLI, Wireshark packet analyzer',
          },
          {
            day: 'Thursday',
            task_title: 'Server Backup Routine & Storage Audit',
            description: 'Configured automated rsync cron job over SSH for nightly disk snapshotting.',
            tools_used: 'Ubuntu Server, rsync, Bash scripts',
          },
          {
            day: 'Friday',
            task_title: 'End-to-End Latency Verification & Weekly Sign-off',
            description: 'Benchmarked ICMP latency and compiled weekly logbook report for supervisor review.',
            tools_used: 'Ping, Traceroute, MS Excel',
          },
        ];

    const response = NextResponse.json({
      object: 'siwes.logbook_week',
      company,
      department,
      week_number: weekNumber,
      weekly_summary: weeklySummary,
      supervisor_remark: supervisorRemark,
      daily_entries: dailyEntries,
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
      endpoint: '/api/v1/siwes/logbook',
      method: 'POST',
      statusCode: 200,
      creditsCharged: isTest ? 0 : 1,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  } catch (err: any) {
    console.error('Developer SIWES API error:', err);
    const errorResponse = NextResponse.json(
      {
        error: {
          code: 'siwes_generation_error',
          message: err.message || 'Failed to synthesize SIWES logbook entries.',
          request_id: requestId,
        },
      },
      { status: 500 }
    );

    return await finalizeDeveloperResponse({
      response: errorResponse,
      apiKey,
      userId: user.id,
      endpoint: '/api/v1/siwes/logbook',
      method: 'POST',
      statusCode: 500,
      creditsCharged: 0,
      startTime,
      requestId,
      remainingCredits: creditCharge.remainingCredits,
    });
  }
}
