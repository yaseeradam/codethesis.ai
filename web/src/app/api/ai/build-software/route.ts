import { NextRequest, NextResponse } from 'next/server';
import { generateAcademicAI } from '@/lib/ai';
import { getCurrentUser } from '@/lib/auth';
import { deductUserCredits, getUserById } from '@/lib/db';
import {
  detectDomainBlueprint,
  generateSchemaSql,
  generateSeedSql,
  generateBackendCode,
  generateFrontendHtml,
  generateManifestAndLaunchers,
  DomainBlueprint
} from '@/lib/domainSoftwareGenerator';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please sign in to synthesize turnkey software.',
        },
        { status: 401 }
      );
    }

    const dbUser = await getUserById(user.id);
    if (!dbUser || dbUser.credits < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient academic credits. Synthesizing turnkey software requires 2 credits.',
          currentBalance: dbUser?.credits ?? 0,
        },
        { status: 402 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      topic = 'Academic Enterprise System',
      description = '',
      techStack = 'Python (Zero-Pip) + SQLite',
      course = 'Computer Science',
      features = {},
      architectureAnswers = {},
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

    // 1. Prepare AI prompt to architect custom domain specification
    const specContext = spec ? `\nUSER PROPOSAL / SPECIFICATION:\n${typeof spec === 'string' ? spec : JSON.stringify(spec).slice(0, 1000)}` : '';
    const answersContext = architectureAnswers && Object.keys(architectureAnswers).length > 0
      ? `\nUSER-SPECIFIED ARCHITECTURAL & DEFENSE DECISIONS:\n${Object.entries(architectureAnswers)
          .map(([k, v]) => `- ${k.replace(/_/g, ' ').toUpperCase()}: "${v}"`)
          .join('\n')}\nCRITICAL: You MUST strictly incorporate these exact architectural decisions, access models, and features directly into the schemaFields, workflowActions, categories, and entities below!`
      : '';
    
    const aiArchitectPrompt = `You are a Principal Software Architect synthesizing turnkey university degree software.
PROJECT TOPIC: "${cleanTopic}"
TARGET TECH STACK: "${effectiveStack}"
DEPARTMENT: "${course}"
${specContext}
${answersContext}

CRITICAL ARCHITECTURE REQUIREMENT:
Design a REAL, highly specific, authentic software blueprint specifically tailored for "${cleanTopic}".
Strictly NEVER use generic placeholders like "Record", "Item", "Entry", "Data1".
Always use authentic domain-specific entities (e.g., if Poultry Farm: "FlockBatch", "EggIncubation"; if Court/Judiciary: "LegalCase", "CourtHearing"; if Hospital/Blood Bank: "BloodDonor", "TransfusionBatch"; if Transportation: "VehicleUnit", "TransitRoute"; if FinTech/Cooperative: "SavingsAccount", "LoanApplication").

Respond strictly in valid JSON matching this schema:
{
  "systemName": "Formal authoritative system title",
  "tagline": "Clear professional summary of the software purpose and capabilities",
  "category": "Domain classification",
  "primaryEntity": "Singular domain entity name (e.g. Donor, Patient, Vehicle, Case, Scholar)",
  "primaryEntityPlural": "Plural domain entity name (e.g. Donors, Patients, Vehicles, Cases, Scholars)",
  "secondaryEntity": "Secondary entity name (e.g. TransfusionLog, TriageRecord, MaintenanceDocket)",
  "kpis": [
    {"label": "KPI 1 Label", "value": "Metric value", "change": "+14% this month", "icon": "Activity"},
    {"label": "KPI 2 Label", "value": "Metric value", "change": "Operational status", "icon": "CheckCircle"},
    {"label": "KPI 3 Label", "value": "Metric value", "change": "Pending items", "icon": "Clock"},
    {"label": "KPI 4 Label", "value": "Metric value", "change": "Efficiency rating", "icon": "TrendingUp"}
  ],
  "schemaFields": [
    {"name": "field_name_in_snake_case", "type": "TEXT", "label": "Field Label", "sample": "Sample Value", "required": true},
    {"name": "category", "type": "TEXT", "label": "Category / Type", "sample": "Standard", "required": true},
    {"name": "metric_value", "type": "REAL", "label": "Key Numeric Metric", "sample": "75.5"},
    {"name": "assigned_to", "type": "TEXT", "label": "Responsible Person / Officer", "sample": "Officer In Charge"},
    {"name": "status", "type": "TEXT", "label": "Status", "sample": "Active", "required": true}
  ],
  "categories": ["Category A", "Category B", "Category C", "Category D"],
  "statuses": ["Active", "Completed", "Pending", "Flagged"],
  "seedRecords": [
    {"id": 1, "field_name_in_snake_case": "Realistic domain value 1", "category": "Category A", "metric_value": 85.0, "assigned_to": "Engr. A. T. Sulaiman", "status": "Active"},
    {"id": 2, "field_name_in_snake_case": "Realistic domain value 2", "category": "Category B", "metric_value": 92.5, "assigned_to": "Dr. Chidi N. Okoro", "status": "Completed"},
    {"id": 3, "field_name_in_snake_case": "Realistic domain value 3", "category": "Category A", "metric_value": 78.0, "assigned_to": "Hajiya Maryam Sani", "status": "Pending"},
    {"id": 4, "field_name_in_snake_case": "Realistic domain value 4", "category": "Category C", "metric_value": 64.2, "assigned_to": "Mr. Olumide Adeleke", "status": "Active"},
    {"id": 5, "field_name_in_snake_case": "Realistic domain value 5", "category": "Category B", "metric_value": 91.0, "assigned_to": "Barrister Fatima Bello", "status": "Completed"}
  ]
}`;

    let blueprint: DomainBlueprint | null = null;
    let aiProviderUsed: string = 'heuristic';

    try {
      const aiRes = await Promise.race([
        generateAcademicAI({
          prompt: aiArchitectPrompt,
          temperature: 0.35,
          maxTokens: 3500,
          preferredProvider: 'gemini',
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 45000)),
      ]);

      if (aiRes && aiRes.provider !== 'codethesis-academic-heuristic' && aiRes.content) {
        const jsonMatch = aiRes.content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : aiRes.content.trim();
        const parsed = JSON.parse(jsonStr);
        if (parsed.systemName && parsed.primaryEntityPlural && Array.isArray(parsed.schemaFields)) {
          aiProviderUsed = `${aiRes.provider} (${aiRes.model})`;
          blueprint = {
            domainKey: parsed.primaryEntityPlural.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            category: parsed.category || course || 'Applied Software Systems',
            systemName: parsed.systemName,
            tagline: parsed.tagline || `Automated data processing and management for ${cleanTopic}`,
            primaryEntity: parsed.primaryEntity || 'Record',
            primaryEntityPlural: parsed.primaryEntityPlural,
            secondaryEntity: parsed.secondaryEntity || `${parsed.primaryEntity || 'Record'} Audit Log`,
            kpis: Array.isArray(parsed.kpis) && parsed.kpis.length >= 2 ? parsed.kpis : [
              { label: `Total ${parsed.primaryEntityPlural}`, value: '142', change: '+12% this month', icon: 'Folder' },
              { label: 'Completed Workflows', value: '1,029', change: '100% verified', icon: 'CheckCircle' },
              { label: 'Pending Reviews', value: '8 Items', change: 'Action required', icon: 'Clock' },
              { label: 'System Uptime', value: '99.98%', change: 'Continuous operational integrity', icon: 'Activity' }
            ],
            schemaFields: parsed.schemaFields,
            categories: Array.isArray(parsed.categories) ? parsed.categories : ['Standard', 'Priority', 'Audit', 'Special'],
            statuses: Array.isArray(parsed.statuses) ? parsed.statuses : ['Active', 'Completed', 'Pending', 'Flagged'],
            seedRecords: Array.isArray(parsed.seedRecords) && parsed.seedRecords.length > 0 ? parsed.seedRecords : [],
            workflowActions: [`Approve ${parsed.primaryEntity || 'Record'}`, 'Export CSV', 'Generate Audit Report']
          };
        }
      }
    } catch (aiErr) {
      console.warn('AI Architecture synthesis error, utilizing heuristic blueprint:', aiErr);
    }

    // Fallback if AI was unavailable or invalid
    if (!blueprint) {
      blueprint = detectDomainBlueprint(cleanTopic, course);
    }

    // Attach user architectural decisions
    if (architectureAnswers && typeof architectureAnswers === 'object' && Object.keys(architectureAnswers).length > 0) {
      blueprint.userDecisions = architectureAnswers;
    }

    // Ensure seed records exist
    if (!blueprint.seedRecords || blueprint.seedRecords.length === 0) {
      blueprint.seedRecords = [
        { id: 1, [blueprint.schemaFields[0]?.name || 'title']: `${blueprint.primaryEntity} Primary Alpha Unit`, category: blueprint.categories[0] || 'Standard', status: blueprint.statuses[0] || 'Active', date_logged: '2026-11-15' },
        { id: 2, [blueprint.schemaFields[0]?.name || 'title']: `${blueprint.primaryEntity} Verification Cohort`, category: blueprint.categories[1] || 'Priority', status: blueprint.statuses[1] || 'Completed', date_logged: '2026-11-16' },
      ];
    }

    // 2. Synthesize bespoke AI-written Frontend & Backend code tailored to this exact topic
    const stackLower = effectiveStack.toLowerCase();
    const backendFileName = stackLower.includes('node')
      ? 'server.js'
      : stackLower.includes('php')
        ? 'index.php'
        : 'server.py';

    const frontendCodePrompt = `You are a Senior Full-Stack UI Engineer. Build a complete, self-contained, interactive single-file web application (public/index.html) for:
SYSTEM NAME: "${blueprint.systemName}"
TOPIC: "${cleanTopic}"
TAGLINE: "${blueprint.tagline}"
PRIMARY ENTITY: "${blueprint.primaryEntity}" (Plural: "${blueprint.primaryEntityPlural}")
SCHEMA FIELDS: ${JSON.stringify(blueprint.schemaFields)}
CATEGORIES: ${JSON.stringify(blueprint.categories)}
STATUSES: ${JSON.stringify(blueprint.statuses)}
INITIAL RECORDS: ${JSON.stringify(blueprint.seedRecords)}
${answersContext}

REQUIREMENTS:
1. Output ONLY raw HTML starting with <!DOCTYPE html> and ending with </html> (NO markdown code fences, NO explanation).
2. Include <script src="https://cdn.tailwindcss.com"></script> in <head>.
3. Design a bespoke, authentic UI tailored specifically to "${cleanTopic}" — DO NOT use a generic template. Include domain-specific navigation tabs (e.g., Dashboard Overview, ${blueprint.primaryEntityPlural} Management, Analytics & Reports, Audit/Logs, Settings/Auth), interactive KPI cards, live search/filter, a working "Add New ${blueprint.primaryEntity}" modal/form, status transition buttons (Approve/Flag/Delete), and CSV export.
4. Use vanilla JavaScript with localStorage persistence (seeded with the INITIAL RECORDS) AND optional fetch('/api/records') fallback so it works 100% interactively inside a standalone browser iframe preview.
5. Make sure all buttons, tabs, forms, and filters actually work in JavaScript with zero syntax errors.`;

    const backendCodePrompt = `You are a Principal Backend Engineer. Write a complete, clean, runnable ${effectiveStack} backend file (${backendFileName}) for:
SYSTEM NAME: "${blueprint.systemName}"
TOPIC: "${cleanTopic}"
PRIMARY ENTITY: "${blueprint.primaryEntity}"
SCHEMA FIELDS: ${JSON.stringify(blueprint.schemaFields)}
${answersContext}

REQUIREMENTS:
1. Output ONLY raw source code for ${backendFileName} (NO markdown fences, NO explanation).
2. Implement SQLite persistence, serving static files from ./public, and REST endpoints:
   - GET /api/health
   - GET /api/records (list & search)
   - POST /api/records (create with validation)
   - PATCH /api/records/:id (update status/fields)
   - DELETE /api/records/:id
   - GET /api/stats (domain-specific KPIs)
3. Include domain-specific business logic, validation, and authentic comments for "${cleanTopic}".`;

    const [aiFrontendRes, aiBackendRes] = await Promise.all([
      Promise.race([
        generateAcademicAI({
          prompt: frontendCodePrompt,
          temperature: 0.45,
          maxTokens: 7500,
          preferredProvider: 'gemini',
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 50000)),
      ]).catch(() => null),
      Promise.race([
        generateAcademicAI({
          prompt: backendCodePrompt,
          temperature: 0.3,
          maxTokens: 4500,
          preferredProvider: 'gemini',
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 40000)),
      ]).catch(() => null),
    ]);

    const cleanCodeOutput = (raw: string): string => {
      let s = raw.trim();
      s = s.replace(/^```[a-zA-Z]*\s*\n?/, '').replace(/\n?\s*```$/, '').trim();
      return s;
    };

    const files: Record<string, string> = {};
    files['database/schema.sql'] = generateSchemaSql(blueprint, cleanTopic);
    files['database/seed_data.sql'] = generateSeedSql(blueprint, cleanTopic);

    const fallbackBackend = generateBackendCode(blueprint, cleanTopic, effectiveStack);
    let aiCodeUsed = false;

    if (
      aiBackendRes &&
      aiBackendRes.provider !== 'codethesis-academic-heuristic' &&
      aiBackendRes.content &&
      aiBackendRes.content.trim().length > 500
    ) {
      files[backendFileName] = cleanCodeOutput(aiBackendRes.content);
      aiCodeUsed = true;
      aiProviderUsed = `${aiBackendRes.provider} (${aiBackendRes.model})`;
    } else {
      files[fallbackBackend.fileName] = fallbackBackend.code;
    }

    const aiHtml =
      aiFrontendRes &&
      aiFrontendRes.provider !== 'codethesis-academic-heuristic' &&
      aiFrontendRes.content
        ? cleanCodeOutput(aiFrontendRes.content)
        : '';

    if (aiHtml.length > 1200 && /<html/i.test(aiHtml) && /<script/i.test(aiHtml)) {
      files['public/index.html'] = aiHtml;
      aiCodeUsed = true;
      aiProviderUsed = `${aiFrontendRes!.provider} (${aiFrontendRes!.model})`;
    } else {
      files['public/index.html'] = generateFrontendHtml(blueprint, cleanTopic, effectiveStack);
    }

    const extras = generateManifestAndLaunchers(blueprint, cleanTopic, effectiveStack);
    Object.assign(files, extras);

    let remainingCredits: number | undefined;
    if (user) {
      try {
        const deductResult = await deductUserCredits(user.id, 'softwareBuilder');
        if (deductResult.success) {
          remainingCredits = deductResult.remainingCredits;
        }
      } catch (deductErr) {
        console.warn('Credits deduction error on build-software:', deductErr);
      }
    }

    return NextResponse.json({
      success: true,
      topic: cleanTopic,
      techStack: effectiveStack,
      aiGenerated: aiCodeUsed,
      aiProvider: aiProviderUsed,
      remainingCredits,
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
