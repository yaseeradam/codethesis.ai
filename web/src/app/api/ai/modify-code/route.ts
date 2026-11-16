import { NextRequest, NextResponse } from 'next/server';
import { generateAcademicAI } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      fileName = 'server.py',
      currentCode = '',
      prompt = '',
      topic = 'Academic Software Application',
      techStack = 'Python (Zero-Pip) + SQLite',
      allFiles = {},
    } = body;

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Please provide a clear code modification prompt or instruction.' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are CodeThesis AI Senior Software Engineer and Code Refactoring Specialist.
The user wants you to modify a specific source code file or create code based on their prompt.
Topic: "${topic}"
Tech Stack: "${techStack}"
Active File: "${fileName}"

CRITICAL RULES:
1. Adhere strictly to the requested Tech Stack: ${techStack}.
2. Retain all existing functionality unless explicitly asked to remove or change it.
3. Write clean, robust, production-quality, syntax-valid code with proper comments and error handling.
4. If modifying the active file, output the COMPLETE updated file content (do not use lazy ellipsis like "... rest of code here").
5. Return your response as a valid JSON object matching the requested schema.`;

    // Provide context of other files if available (e.g. schema.sql if modifying server.py)
    let relatedContext = '';
    if (allFiles && typeof allFiles === 'object') {
      const otherFileNames = Object.keys(allFiles).filter((k) => k !== fileName).slice(0, 3);
      if (otherFileNames.length > 0) {
        relatedContext = '\n\nRELATED PROJECT FILES CONTEXT:\n' + otherFileNames.map((name) => `--- File: ${name} ---\n${(allFiles[name] || '').slice(0, 1000)}`).join('\n\n');
      }
    }

    const userPrompt = `MODIFICATION REQUEST:
"${prompt.trim()}"

ACTIVE FILE TO MODIFY (${fileName}):
\`\`\`
${currentCode || '# (Empty or New File)'}
\`\`\`
${relatedContext}

Respond strictly in valid JSON format with this exact structure:
{
  "fileName": "${fileName}",
  "explanation": "Concise summary of what was added, changed, or improved in the code",
  "modifiedCode": "The full, complete, production-ready source code of the file"
}`;

    const aiRes = await generateAcademicAI({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.3,
      maxTokens: 4000,
    });

    let jsonStr = aiRes.content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsedResult: any = null;
    try {
      parsedResult = JSON.parse(jsonStr);
    } catch {
      // Regex extraction fallback
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        parsedResult = JSON.parse(match[0]);
      } else {
        // Fallback: use raw content as code if it's pure code
        parsedResult = {
          fileName,
          explanation: 'Applied requested modifications to ' + fileName,
          modifiedCode: aiRes.content.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/i, '').trim(),
        };
      }
    }

    if (!parsedResult.modifiedCode || typeof parsedResult.modifiedCode !== 'string') {
      throw new Error('AI did not return valid modified code.');
    }

    return NextResponse.json({
      success: true,
      fileName: parsedResult.fileName || fileName,
      explanation: parsedResult.explanation || 'Code successfully modified according to prompt.',
      modifiedCode: parsedResult.modifiedCode,
    });
  } catch (error: any) {
    console.error('Code modification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to modify code through prompt' },
      { status: 500 }
    );
  }
}
