import { NextRequest, NextResponse } from 'next/server';
import { authorizeAndDeductCredits, ToolKey } from '@/lib/credits';
import { generateAcademicAI, buildChapterUserPrompt } from '@/lib/ai';
import { stripTrailingReferences } from '@/lib/thesisHelpers';
import { checkRateLimit } from '@/lib/rateLimiter';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to generate academic research content.' },
        { status: 401 }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anon';
    const rateCheck = await checkRateLimit({
      keyId: `ai_generate_${clientIp}`,
      limitPerMinute: 25,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'High traffic rate limit exceeded. Please wait a few seconds before generating again.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter || 15) } }
      );
    }

    const rawBody: any = await req.json();
    const type = rawBody.type || (rawBody.toolId === 'thesis' ? 'thesis_chapter' : rawBody.toolId === 'assignment' ? 'assignment' : 'freeform');
    const topic = rawBody.topic || rawBody.context?.topic || rawBody.projectName || '';
    const course = rawBody.course || rawBody.context?.course || rawBody.department || 'Computer Science / Engineering';
    const institution = rawBody.institution || rawBody.context?.institution || 'Nigerian Tertiary Institution';
    const caseStudy = rawBody.caseStudy ? rawBody.caseStudy.trim() : '';
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
Awarding Institution: "${institution}"
${caseStudy ? `Target Case Study: "${caseStudy}"` : ''}
Adhere strictly to formal academic English, APA 7th referencing with Crossref DOIs, clean standard academic mathematical notation without raw LaTeX markup (such as $$ or \\frac), and NUC benchmark criteria. Write comprehensive, deep, multi-paragraph scholarly analyses without raw Markdown syntax (no asterisks or hashes in headings or prose).`;

    // Multi-Chapter Batch Generation for Academic Studio
    if (rawBody.generateAllChapters === true || rawBody.toolId === 'thesis-all') {
      const chapters: Record<string, string> = {};
      const chapterPromises = [1, 2, 3, 4, 5].map(async (chNum) => {
        try {
          const chPrompt = buildChapterUserPrompt({
            topic,
            course,
            institution,
            chapterNumber: chNum,
            caseStudy,
          });
          const res = await generateAcademicAI({
            prompt: chPrompt,
            systemPrompt,
            temperature: 0.78,
            maxTokens: 5000,
            preferredProvider: 'gemini',
          });
          const cleanedContent = (chNum < 5 && res.content) ? stripTrailingReferences(res.content) : res.content;
          return { ch: `ch${chNum}`, content: cleanedContent };
        } catch {
          return { ch: `ch${chNum}`, content: '' };
        }
      });

      const results = await Promise.all(chapterPromises);
      results.forEach(r => {
        if (r.content) chapters[r.ch] = r.content;
      });

      return NextResponse.json({
        success: true,
        chapters,
        topic,
        course,
        institution,
        ...creditInfo,
      });
    }

    let userQuery = prompt;
    if (chapterNumber) {
      userQuery = buildChapterUserPrompt({
        topic,
        course,
        institution,
        chapterNumber: Number(chapterNumber),
        caseStudy,
      });
    } else if (!userQuery) {
      userQuery = `Generate an exhaustive academic section on the topic: "${topic}". Include introduction, theoretical framework, methodology/implementation analysis. Do NOT append references at the end.`;
    }

    const aiRes = await generateAcademicAI({
      prompt: userQuery,
      systemPrompt,
      temperature: 0.78,
      maxTokens: 5000,
      preferredProvider: 'gemini',
    });

    const finalContent = (chapterNumber && Number(chapterNumber) < 5 && aiRes.content)
      ? stripTrailingReferences(aiRes.content)
      : aiRes.content;

    return NextResponse.json({
      success: true,
      provider: `${aiRes.provider} (${aiRes.model})`,
      content: finalContent,
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
