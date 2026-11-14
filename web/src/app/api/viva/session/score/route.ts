import { NextRequest, NextResponse } from 'next/server';
import { getVivaSession, saveVivaSession } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { sessionId } = body as { sessionId?: string };

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const session = await getVivaSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Viva session not found' },
        { status: 404 }
      );
    }

    const studentTurns = session.turns.filter(t => t.role === 'student');
    const avgRating = studentTurns.length > 0
      ? studentTurns.reduce((sum, t) => sum + (t.rating || 7), 0) / studentTurns.length
      : 7.5;

    const baseScore = Math.round(avgRating * 10);
    const clarity = Math.min(98, Math.max(65, baseScore + Math.floor(Math.random() * 6 - 3)));
    const technicalDepth = Math.min(96, Math.max(60, baseScore + Math.floor(Math.random() * 6 - 2)));
    const methodology = Math.min(95, Math.max(62, baseScore + Math.floor(Math.random() * 6 - 4)));
    const overallScore = Math.round((clarity + technicalDepth + methodology) / 3);

    let verdict: 'Pass with Distinction' | 'Pass with Minor Corrections' | 'Major Revision Needed' = 'Pass with Minor Corrections';
    let recommendation = 'The candidate demonstrated substantial command of the software architecture and problem domain. Minor corrections to Chapter 2 literature review required prior to final hardcover binding.';

    if (overallScore >= 85) {
      verdict = 'Pass with Distinction';
      recommendation = 'Exceptional academic defense! The candidate defended technical choices, database normalization, and methodology with outstanding poise and authority.';
    } else if (overallScore < 65) {
      verdict = 'Major Revision Needed';
      recommendation = 'The candidate struggled to defend empirical sampling methodology and database transaction locking. Significant revisions recommended before final departmental sign-off.';
    }

    session.scorecard = {
      clarity,
      technicalDepth,
      methodology,
      overallScore,
      summary: recommendation,
      verdict,
    };
    session.status = 'completed';

    await saveVivaSession(session);

    return NextResponse.json({
      success: true,
      sessionId,
      scorecard: session.scorecard,
      sessionSummary: {
        topic: session.topic,
        course: session.course,
        examinerPersona: session.examinerPersona,
        turnsCompleted: studentTurns.length,
      },
    });
  } catch (error: any) {
    console.error('Viva score error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to compute viva score' },
      { status: 500 }
    );
  }
}
