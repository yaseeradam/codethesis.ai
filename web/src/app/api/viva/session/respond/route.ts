import { NextRequest, NextResponse } from 'next/server';
import { getVivaSession, saveVivaSession, VivaTurn } from '@/lib/db';
import { evaluateVivaAnswer } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { sessionId, studentAnswer, studentResponse } = body as any;
    const answer = studentAnswer || studentResponse;

    if (!sessionId || !answer) {
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

    // Evaluate answer with Live AI Engine (Gemini / Groq / OpenRouter)
    const aiResult = await evaluateVivaAnswer({
      topic: session.topic,
      course: session.course,
      examinerPersona: session.examinerPersona,
      studentAnswer: answer,
      history: session.turns,
      turnCount,
    });

    const rating = aiResult.rating;
    const feedback = aiResult.feedback;
    const nextQuestion = aiResult.nextQuestion;

    const studentTurn: VivaTurn = {
      id: `turn-student-${turnCount}`,
      role: 'student',
      content: answer,
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
      provider: aiResult.provider,
      totalTurns: session.turns.length,
      isFinished: turnCount >= 3,
      session,
    });
  } catch (error: any) {
    console.error('Viva respond error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process student answer' },
      { status: 500 }
    );
  }
}
