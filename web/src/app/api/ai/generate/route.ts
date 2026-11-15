import { NextRequest, NextResponse } from 'next/server';
import { authorizeAndDeductCredits, ToolKey } from '@/lib/credits';
import { generateAcademicAI } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const rawBody: any = await req.json();
    const type = rawBody.type || (rawBody.toolId === 'thesis' ? 'thesis_chapter' : rawBody.toolId === 'assignment' ? 'assignment' : 'freeform');
    const topic = rawBody.topic || rawBody.context?.topic || rawBody.projectName || '';
    const course = rawBody.course || rawBody.context?.course || rawBody.department || 'Computer Science / Engineering';
    const institution = rawBody.institution || rawBody.context?.institution || 'Nigerian Tertiary Institution';
    const chapterNumber = rawBody.chapterNumber;
    const prompt = rawBody.prompt || rawBody.userQuery || '';
    const deductCredits = rawBody.deductCredits === true;

    if (!topic && !prompt) {
      return NextResponse.json({ error: 'Topic or prompt is required' }, { status: 400 });
    }

    // Optional Credit Deduction
    let creditInfo: { remainingCredits?: number; cost?: number } = {};
    if (deductCredits) {
      let toolKey: ToolKey = 'thesis';
      if (type === 'siwes_entry') toolKey = 'siwesLogbook';
      else if (type === 'itf_chapter') toolKey = 'itfReport';
      else if (type === 'assignment') toolKey = 'assignmentSolver';
      else if (type === 'viva_qa') toolKey = 'vivaSimulator';

      const creditResult = await authorizeAndDeductCredits(toolKey);
      if (!creditResult.allowed) {
        return NextResponse.json(
          { error: creditResult.errorMessage, cost: creditResult.cost, remainingCredits: creditResult.remainingCredits },
          { status: 402 }
        );
      }
      creditInfo = { remainingCredits: creditResult.remainingCredits, cost: creditResult.cost };
    }

    const systemPrompt = `You are CodeThesis AI, the authoritative academic engineering and scientific copilot for tertiary university dissertations, technical defenses, and coursework in Nigeria.
Topic: "${topic || prompt}"
Department / Course: "${course}"
Institution: "${institution}"
Adhere strictly to formal academic English, APA 7th referencing with Crossref DOIs, clean mathematical derivations with LaTeX, and NUC benchmark criteria.`;

    const userQuery = prompt || `Generate an exhaustive academic section for Chapter ${chapterNumber || 1} on the topic: "${topic}". Include introduction, theoretical framework, methodology/implementation analysis, and references.`;

    const aiRes = await generateAcademicAI({
      prompt: userQuery,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 4000,
    });

    return NextResponse.json({
      success: true,
      provider: `${aiRes.provider} (${aiRes.model})`,
      content: aiRes.content,
      topic,
      course,
      institution,
      ...creditInfo,
    });
  } catch (error: any) {
    console.error('AI Generation API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
