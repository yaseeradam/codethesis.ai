import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { saveVivaSession, VivaSession } from '@/lib/db';
import crypto from 'crypto';

const EXAMINER_PROFILES = {
  strict: {
    name: 'Dr. (Mrs.) Folashade Adeyemi',
    title: 'Departmental Postgraduate & Undergraduate Defense Chair',
    style: 'Demanding, precision-oriented, scrutinizes methodological rigour and validation validity.',
  },
  methodological: {
    name: 'Prof. Babatunde Bello (FNCS, FBCS)',
    title: 'External Systems Architecture Examiner',
    style: 'Deep theoretical emphasis on algorithmic complexity, concurrency locking, and normalization.',
  },
  industry: {
    name: 'Dr. Chukwudi Eze (MNSE, COREN Reg.)',
    title: 'Enterprise Software & Industrial Training Consultant',
    style: 'Focuses on pragmatic deployment, network resilience, offline caching, and failover economics.',
  },
};

export async function POST(req: NextRequest) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const {
      topic = 'Design and Implementation of an Automated Hostel Allocation and Facility Management System',
      course = 'Computer Science',
      examinerPersona = 'strict',
    } = body as {
      topic?: string;
      course?: string;
      examinerPersona?: 'strict' | 'methodological' | 'industry';
    };

    const sessionUser = await getCurrentUser();
    const userId = sessionUser?.id || 'demo-student-001';

    const persona = EXAMINER_PROFILES[examinerPersona] || EXAMINER_PROFILES.strict;
    const sessionId = `viva-${crypto.randomUUID().slice(0, 8)}`;

    // Generate tailored opening question based on course and persona
    let openingQuestion = `Welcome candidate. We have thoroughly reviewed your dissertation draft titled "${topic}" in ${course}. Let us begin with your problem statement: Why did you decide that existing manual or conventional systems were inadequate, and what is the exact scientific or technical gap your proposed system bridges?`;

    if (examinerPersona === 'methodological') {
      openingQuestion = `Good day, candidate. In your research on "${topic}", describe the exact architectural pattern and concurrency model you designed to prevent race conditions during high-volume transactions. Walk this defense panel through your database schema normalization.`;
    } else if (examinerPersona === 'industry') {
      openingQuestion = `Welcome. Looking at your study on "${topic}", our main concern in the Nigerian tertiary environment is erratic bandwidth and intermittent power. How does your software architecture guarantee zero data corruption when a client connection drops mid-transaction?`;
    }

    const newSession: VivaSession = {
      id: sessionId,
      userId,
      topic,
      course,
      examinerPersona,
      turns: [
        {
          id: `turn-1`,
          role: 'examiner',
          content: openingQuestion,
          timestamp: new Date().toISOString(),
        },
      ],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveVivaSession(newSession);

    return NextResponse.json({
      success: true,
      sessionId,
      examiner: persona,
      topic,
      course,
      openingQuestion,
    });
  } catch (error: any) {
    console.error('Viva start session error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to start viva session' },
      { status: 500 }
    );
  }
}
