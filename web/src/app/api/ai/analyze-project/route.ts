import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { generateAcademicAI } from '@/lib/ai';

// Helper to extract clean plain text from a .docx file buffer
async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const docXml = await zip.file('word/document.xml')?.async('text');
    if (!docXml) return '';
    // Strip XML tags and unescape common XML entities
    return docXml
      .replace(/<w:p[^>]*>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  } catch (err) {
    console.error('Failed to parse docx XML:', err);
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    let rawText = '';
    let fileName = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const textParam = formData.get('text') as string | null;

      if (file) {
        fileName = file.name;
        const arrayBuffer = await file.arrayBuffer();
        if (file.name.endsWith('.docx')) {
          rawText = await extractTextFromDocx(arrayBuffer);
        } else if (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
          rawText = new TextDecoder('utf-8').decode(arrayBuffer);
        } else {
          // Fallback string conversion
          rawText = new TextDecoder('utf-8').decode(arrayBuffer);
        }
      } else if (textParam) {
        rawText = textParam;
      }
    } else {
      const body = await req.json().catch(() => ({}));
      rawText = body.text || body.content || body.prompt || '';
      fileName = body.fileName || '';
    }

    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide at least a paragraph of project description, proposal, or upload a project document.',
        },
        { status: 400 }
      );
    }

    const excerpt = rawText.slice(0, 15000); // Feed up to 15k characters of the document

    const systemPrompt = `You are a Senior Principal Software Architect and Academic Systems Analyst.
Analyze the user's uploaded project document, thesis draft, or system requirements specification.
Extract the technical architecture, database entities, and requirements needed to construct a complete working software prototype.
Respond strictly in valid JSON format matching the schema without Markdown code fences.`;

    const userPrompt = `Analyze the following academic project document and extract its complete technical blueprint:

DOCUMENT CONTENT:
"""
${excerpt}
"""

Extract and return ONLY a valid JSON object with the following structure:
{
  "title": "Clear concise project title",
  "domain": "e.g. Computer Science / Cybersecurity / Information Systems",
  "problemStatement": "1-2 sentence core problem description",
  "objectives": ["Primary objective", "Secondary objective", "Tertiary objective"],
  "userRoles": ["Administrator", "Regular User / Student", "..."],
  "databaseEntities": [
    {
      "name": "table_name",
      "description": "purpose of entity",
      "fields": ["id", "field1", "field2", "created_at"]
    }
  ],
  "functionalRequirements": ["User authentication with roles", "CRUD operations for...", "Report generation"],
  "coreModules": ["Authentication", "Dashboard & Telemetry", "Records Manager", "Audit & Reporting"],
  "recommendedStack": "Python (Flask/FastAPI) + SQLite + Tailwind HTML5",
  "suggestedFileName": "runnable_system"
}`;

    const aiRes = await generateAcademicAI({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.3,
      maxTokens: 2500,
    });

    let jsonStr = aiRes.content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsedSpec: any = null;
    try {
      parsedSpec = JSON.parse(jsonStr);
    } catch {
      // If direct parse failed, attempt regex extraction of JSON object
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (match) {
        parsedSpec = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse AI architectural analysis into structured JSON');
      }
    }

    return NextResponse.json({
      success: true,
      analysis: parsedSpec,
      fileName,
      rawLength: rawText.length,
    });
  } catch (error: any) {
    console.error('Project document analysis error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to analyze project document' },
      { status: 500 }
    );
  }
}
