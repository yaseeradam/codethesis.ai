import { NextRequest, NextResponse } from 'next/server';
import { solveAcademicProblem } from '@/lib/ai';
import { authorizeAndDeductCredits } from '@/lib/credits';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { problem, department = 'Computer Science / Engineering', institution, deductCredits = false } = body;

    if (!problem || !problem.trim()) {
      return NextResponse.json({ success: false, error: 'Problem statement is required' }, { status: 400 });
    }

    let creditInfo: { remainingCredits?: number; cost?: number } = {};
    if (deductCredits) {
      const creditRes = await authorizeAndDeductCredits('assignmentSolver');
      if (!creditRes.allowed) {
        return NextResponse.json(
          { success: false, error: creditRes.errorMessage, cost: creditRes.cost, remainingCredits: creditRes.remainingCredits },
          { status: 402 }
        );
      }
      creditInfo = { remainingCredits: creditRes.remainingCredits, cost: creditRes.cost };
    }

    const solution = await solveAcademicProblem({
      problem: problem.trim(),
      department,
      institution,
    });

    return NextResponse.json({
      success: true,
      ...solution,
      ...creditInfo,
    });
  } catch (error: any) {
    console.error('Solve Assignment API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to solve assignment' },
      { status: 500 }
    );
  }
}
