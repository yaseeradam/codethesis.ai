import { NextRequest, NextResponse } from 'next/server';
import { generateMermaidDiagram } from '@/lib/ai';
import { authorizeAndDeductCredits } from '@/lib/credits';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in to generate UML models.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { topic, diagramType = 'sequence', department = 'Computer Science / Engineering', deductCredits = true } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json({ success: false, error: 'Thesis topic is required' }, { status: 400 });
    }

    let creditInfo: { remainingCredits?: number; cost?: number } = {};
    if (deductCredits) {
      const creditRes = await authorizeAndDeductCredits('umlDiagrams');
      if (!creditRes.allowed) {
        return NextResponse.json(
          { success: false, error: creditRes.errorMessage, cost: creditRes.cost, remainingCredits: creditRes.remainingCredits },
          { status: 402 }
        );
      }
      creditInfo = { remainingCredits: creditRes.remainingCredits, cost: creditRes.cost };
    }

    const diagram = await generateMermaidDiagram({
      topic: topic.trim(),
      diagramType,
      department,
    });

    return NextResponse.json({
      success: true,
      ...diagram,
      ...creditInfo,
    });
  } catch (error: any) {
    console.error('Generate UML API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate UML diagram' },
      { status: 500 }
    );
  }
}
