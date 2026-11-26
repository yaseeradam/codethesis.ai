import { NextRequest, NextResponse } from 'next/server';
import { authorizeAndDeductCredits } from '@/lib/credits';
import { generateAcademicAI } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      chapterNumber,
      chapterContent,
      supervisorFeedback,
      topic,
      course,
      institution,
    } = body;

    if (!chapterContent || !supervisorFeedback) {
      return NextResponse.json(
        { error: 'Both chapter content and supervisor feedback are required.' },
        { status: 400 }
      );
    }

    // Deduct 1 credit (assignmentSolver cost = 1)
    const auth = await authorizeAndDeductCredits('assignmentSolver');
    if (!auth.allowed) {
      return NextResponse.json(
        { error: auth.errorMessage || 'Authentication and 1 credit required.' },
        { status: 402 }
      );
    }

    const prompt = `You are revising Chapter ${chapterNumber || 1} of a Nigerian university dissertation.
Topic: "${topic || 'Academic Research Project'}"
Department/Course: ${course || 'Computer Science'}
Institution: ${institution || 'Nigerian University'}

SUPERVISOR'S EXACT CORRECTION / FEEDBACK:
"${supervisorFeedback}"

ORIGINAL CHAPTER TEXT:
${String(chapterContent).slice(0, 12000)}

INSTRUCTIONS:
1. Carefully apply the supervisor's exact correction/feedback to the relevant section(s) of the chapter.
2. Preserve all other valid academic content, structure, APA 7th citations, and technical depth.
3. Do NOT use raw Markdown syntax (no **, no ##, no backticks) or raw LaTeX ($...$). Write clean academic prose with numbered headings (e.g. 1.1 Background of the Study).
4. Return ONLY the revised chapter text.`;

    const aiRes = await generateAcademicAI({
      prompt,
      temperature: 0.55,
      maxTokens: 5000,
    });

    if (!aiRes.content || aiRes.content.trim().length < 100) {
      return NextResponse.json(
        { error: 'AI revision returned empty output. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      revisedContent: aiRes.content.trim(),
      remainingCredits: auth.remainingCredits,
      provider: aiRes.provider,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to revise chapter' },
      { status: 500 }
    );
  }
}
