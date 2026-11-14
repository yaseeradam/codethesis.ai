import { NextRequest, NextResponse } from 'next/server';
import { getVivaSession, saveVivaSession, VivaTurn } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { sessionId, studentAnswer } = body as {
      sessionId?: string;
      studentAnswer?: string;
    };

    if (!sessionId || !studentAnswer) {
      return NextResponse.json(
        { success: false, error: 'sessionId and studentAnswer are required' },
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

    const turnCount = session.turns.filter(t => t.role === 'student').length + 1;

    // Evaluate answer depth and calculate score (1-10)
    const answerLength = studentAnswer.trim().split(/\s+/).length;
    let rating = 7;
    let feedback = '';

    if (answerLength < 15) {
      rating = 4;
      feedback = 'Your response is too brief for an academic defense panel. Ground your answer with specific theoretical frameworks, architectural choices, and empirical data.';
    } else if (answerLength < 40) {
      rating = 6;
      feedback = 'Adequate defense point, but you need to elaborate on the engineering trade-offs and justify why your approach is superior to conventional alternatives.';
    } else {
      rating = Math.min(10, 7 + Math.floor(answerLength / 35));
      feedback = 'Strong, articulate defense! You demonstrated firm command of the subject matter, correct terminology, and clear technical justification.';
    }

    // Dynamic progressive examiner questions across turns 1 through 4+
    let nextQuestion = '';
    if (turnCount === 1) {
      nextQuestion = `Thank you. Now, let us turn to Chapter 3 (Research Methodology). In your system for "${session.topic}", what sampling technique or dataset did you utilize for empirical validation, and how do you defend its statistical representation?`;
    } else if (turnCount === 2) {
      nextQuestion = `Fair point. Moving to Chapter 4 (Implementation & Results): What was the most critical performance bottleneck or security vulnerability you encountered during testing, and how did your codebase resolve it?`;
    } else if (turnCount === 3) {
      nextQuestion = `Lastly, as a prospective graduate in ${session.course}, if you were given institutional funding to commercialize this project, what are the top two features you would implement next to achieve production-grade fault tolerance?`;
    } else {
      nextQuestion = `The defense panel is satisfied with this line of questioning. You may now request your official Viva Readiness Scorecard evaluation.`;
    }

    const studentTurn: VivaTurn = {
      id: `turn-student-${turnCount}`,
      role: 'student',
      content: studentAnswer,
      feedback,
      rating,
      timestamp: new Date().toISOString(),
    };

    const examinerTurn: VivaTurn = {
      id: `turn-examiner-${turnCount + 1}`,
      role: 'examiner',
      content: nextQuestion,
      timestamp: new Date().toISOString(),
    };

    session.turns.push(studentTurn, examinerTurn);
    await saveVivaSession(session);

    return NextResponse.json({
      success: true,
      turnNumber: turnCount,
      feedback,
      rating,
      nextQuestion,
      totalTurns: session.turns.length,
      isFinished: turnCount >= 3,
    });
  } catch (error: any) {
    console.error('Viva respond error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process student answer' },
      { status: 500 }
    );
  }
}
