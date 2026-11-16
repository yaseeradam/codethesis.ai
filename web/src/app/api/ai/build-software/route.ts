import { NextRequest, NextResponse } from 'next/server';
import { generateAcademicAI } from '@/lib/ai';
import { detectDomainBlueprint, buildDomainSoftware } from '@/lib/domainSoftwareGenerator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      topic = 'Academic Enterprise System',
      techStack = 'Python (Zero-Pip) + SQLite',
      course = 'Computer Science',
      spec = null,
    } = body;

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid application topic.' },
        { status: 400 }
      );
    }

    const cleanTopic = topic.trim();
    const effectiveStack = techStack || 'Python (Zero-Pip) + SQLite';

    // 1. Detect domain blueprint and generate base domain-specific code
    const blueprint = detectDomainBlueprint(cleanTopic, course);
    let files = buildDomainSoftware(cleanTopic, effectiveStack, course);

    // 2. Optionally enhance with live AI LLM if available and requested
    try {
      const aiPrompt = `You are a Principal Software Architect synthesizing turnkey university degree software.
Topic: "${cleanTopic}"
Department: "${course}"
Tech Stack: "${effectiveStack}"
Domain Classification: "${blueprint.category}"
Primary Entity: "${blueprint.primaryEntityPlural}"

Analyze the project topic and return a JSON object with:
1. "systemOverview": 2-sentence technical summary.
2. "customFeatures": Array of 4 realistic features implemented.
3. "extraSeedRecords": Array of 3 realistic domain records specifically for ${cleanTopic} with realistic Nigerian/international data.

Respond strictly in valid JSON matching this structure:
{
  "systemOverview": "...",
  "customFeatures": ["...", "...", "...", "..."],
  "extraSeedRecords": []
}`;

      const aiRes = await Promise.race([
        generateAcademicAI({
          prompt: aiPrompt,
          temperature: 0.3,
          maxTokens: 1200,
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
      ]);

      if (aiRes && aiRes.content) {
        let jsonStr = aiRes.content.trim();
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        else if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
        
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.systemOverview) {
            blueprint.tagline = parsed.systemOverview;
          }
        } catch {
          // Keep existing blueprint tagline
        }
      }
    } catch {
      // Gracefully continue with deep domain generated files
    }

    return NextResponse.json({
      success: true,
      topic: cleanTopic,
      techStack: effectiveStack,
      blueprint: {
        category: blueprint.category,
        systemName: blueprint.systemName,
        tagline: blueprint.tagline,
        primaryEntity: blueprint.primaryEntity,
        primaryEntityPlural: blueprint.primaryEntityPlural,
        kpis: blueprint.kpis,
      },
      files,
    });
  } catch (error: any) {
    console.error('Software synthesis error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to synthesize software' },
      { status: 500 }
    );
  }
}
