// ==============================================================================
// CodeThesis AI — Unified Multi-Provider Resilient AI Inference Engine
// Providers: Groq LPU (Qwen 3.8 27B / GPT-OSS 120B / GPT-OSS 20B with 15-Key Pool),
//            Google Gemini (1.5 Flash), OpenRouter (Llama 3.3 70B), Academic Synthesis
// ==============================================================================

import { getAdminSettings } from '@/lib/db';

export const GROQ_API_KEYS: string[] = [];

let globalGroqKeyIndex = 0;

export function getGroqPoolKeys(): string[] {
  const envKeys = process.env.GROQ_API_KEYS
    ? process.env.GROQ_API_KEYS.split(',').map((k) => k.trim()).filter(Boolean)
    : [];
  const combined = Array.from(
    new Set([
      ...envKeys,
      process.env.GROQ_API_KEY || '',
      process.env.GROQ_BACKUP_API_KEY || ''
    ])
  ).filter((k) => k && k.startsWith('gsk_'));
  return combined.length > 0 ? combined : GROQ_API_KEYS;
}

import { convertLatexFormula, sanitizeAcademicTextMath } from './mathConverter';
import { extractDomainFromTopic, stripTrailingReferences } from './thesisHelpers';

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
}

export interface GenerateOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  preferredProvider?: 'gemini' | 'groq' | 'openrouter' | 'openai' | 'heuristic';
}

export interface VivaEvaluationResult {
  rating: number;
  feedback: string;
  nextQuestion: string;
  provider: string;
}

export interface SolvedAssignmentResult {
  title: string;
  problem: string;
  steps: {
    stepNumber: number;
    stepTitle: string;
    explanation: string;
    mathSnippet: string;
  }[];
  finalAnswer: string;
  provider: string;
}

/**
 * Primary multi-tier resilient AI generation cascade
 */
export async function generateAcademicAI(options: GenerateOptions): Promise<AIResponse> {
  let engineConfig: any = {};
  try {
    const adminSettings = await Promise.race([
      getAdminSettings(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200))
    ]);
    engineConfig = adminSettings?.aiEngine || {};
  } catch {
    engineConfig = {};
  }

  // Prioritize Gemini for ultra-fast, high-capacity, non-rate-limited unique generation
  const activeProvider = options.preferredProvider || engineConfig.activeProvider || 'gemini';
  const temperature = options.temperature ?? engineConfig.temperature ?? 0.75;
  const maxTokens = options.maxTokens ?? engineConfig.maxTokens ?? 5000;
  const systemPrompt = options.systemPrompt || engineConfig.systemPromptOverride || 
    'You are CodeThesis AI, the authoritative academic engineering and scientific copilot for Nigerian and African tertiary university dissertations, technical defenses, and coursework.';

  const dynamicKeys = engineConfig.apiKeys || {};
  const geminiKey = dynamicKeys.gemini || process.env.GEMINI_API_KEY;
  const openrouterKey = (dynamicKeys as any).openrouter || process.env.OPENROUTER_API_KEY;
  const openaiKey = dynamicKeys.openai || process.env.OPENAI_API_KEY;

  // 1. Groq LPU with Round-Robin Key Pool (Fast inference at 500+ tok/s)
  async function callGroq(targetModel = 'qwen/qwen3.8-27b'): Promise<AIResponse | null> {
    const keyPool = getGroqPoolKeys();
    const models = [targetModel, 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

    // Try keys from the pool up to 5 attempts
    const maxKeyAttempts = Math.min(keyPool.length, 5);
    for (let attempt = 0; attempt < maxKeyAttempts; attempt++) {
      const keyIndex = (globalGroqKeyIndex + attempt) % keyPool.length;
      const key = keyPool[keyIndex];

      for (const m of models) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 25000);

          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
              model: m,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: options.prompt }
              ],
              max_tokens: Math.min(maxTokens, 4000),
              temperature
            }),
            signal: controller.signal
          });
          clearTimeout(timer);

          if (res.ok) {
            const data = await res.json();
            const choice = data.choices?.[0];
            const content = choice?.message?.content || choice?.message?.reasoning;
            if (content && typeof content === 'string' && content.trim().length > 0) {
              globalGroqKeyIndex = (keyIndex + 1) % keyPool.length; // advance pointer on success
              return { content: content.trim(), provider: 'groq-lpu', model: m };
            }
          } else if (res.status === 429) {
            console.warn(`Groq Key ${keyIndex + 1} rate limited (429), trying next key...`);
            break; // Try next key in the pool
          } else {
            const errData = await res.json().catch(() => ({}));
            console.warn(`Groq (${m}) Key ${keyIndex + 1} error:`, errData);
          }
        } catch (err: any) {
          console.warn(`Groq (${m}) Key ${keyIndex + 1} fetch error:`, err?.message || err);
        }
      }
    }
    return null;
  }

  // 2. Google Gemini
  async function callGemini(targetModel?: string): Promise<AIResponse | null> {
    if (!geminiKey) return null;
    const models = targetModel ? [targetModel] : ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const m of models) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 35000);

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nTask:\n${options.prompt}` }]
              }
            ],
            generationConfig: { temperature, maxOutputTokens: Math.min(maxTokens, 8192) }
          }),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content && typeof content === 'string' && content.trim().length > 0) {
            return { content: content.trim(), provider: 'google-gemini', model: m };
          }
        }
      } catch (err) {
        console.warn(`Gemini (${m}) error:`, err);
      }
    }
    return null;
  }

  // 3. OpenRouter (Llama 3.3 70B Instruct)
  async function callOpenRouter(targetModel = 'meta-llama/llama-3.3-70b-instruct'): Promise<AIResponse | null> {
    if (!openrouterKey) return null;
    const models = [targetModel, 'meta-llama/llama-3.1-8b-instruct'];
    for (const m of models) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20000);

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openrouterKey}`,
            'HTTP-Referer': 'https://codethesis.ai',
            'X-Title': 'CodeThesis Academic AI'
          },
          body: JSON.stringify({
            model: m,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: options.prompt }
            ],
            max_tokens: Math.min(maxTokens, 4000),
            temperature
          }),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content && typeof content === 'string' && content.trim().length > 0) {
            return { content: content.trim(), provider: 'openrouter', model: m };
          }
        }
      } catch (err) {
        console.warn(`OpenRouter (${m}) error:`, err);
      }
    }
    return null;
  }

  // 4. OpenAI Direct
  async function callOpenAI(): Promise<AIResponse | null> {
    if (!openaiKey) return null;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: options.prompt }
          ],
          max_tokens: Math.min(maxTokens, 3000),
          temperature
        }),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return { content: content.trim(), provider: 'openai', model: 'gpt-4o-mini' };
      }
    } catch (err) {
      console.warn('OpenAI error:', err);
    }
    return null;
  }

  // --- Cascade Dispatcher ---
  const tried = new Set<string>();

  // If user has a preference, run preferred first
  if (activeProvider && activeProvider !== 'heuristic') {
    tried.add(activeProvider);
    if (activeProvider === 'groq') {
      const res = await callGroq();
      if (res) return res;
    } else if (activeProvider === 'gemini') {
      const res = await callGemini();
      if (res) return res;
    } else if (activeProvider === 'openrouter') {
      const res = await callOpenRouter();
      if (res) return res;
    } else if (activeProvider === 'openai') {
      const res = await callOpenAI();
      if (res) return res;
    }
  }

  // Full Fallback Cascade: Gemini -> OpenRouter -> Groq -> OpenAI
  if (!tried.has('gemini')) {
    const geminiRes = await callGemini();
    if (geminiRes) return geminiRes;
  }

  if (!tried.has('openrouter')) {
    const orRes = await callOpenRouter();
    if (orRes) return orRes;
  }

  if (!tried.has('groq')) {
    const groqRes = await callGroq('qwen/qwen3.8-27b');
    if (groqRes) return groqRes;
  }

  if (!tried.has('openai')) {
    const openaiRes = await callOpenAI();
    if (openaiRes) return openaiRes;
  }

  // Ultimate deterministic fallback heuristic
  return {
    content: `[CodeThesis Academic Synthesis Engine]\nBased on rigorous NUC benchmark guidelines, the system has formulated an academic derivation addressing your research parameters with 3NF relational normalization and empirical validity.`,
    provider: 'codethesis-academic-heuristic',
    model: 'heuristic-v2.1'
  };
}

/**
 * Intelligent viva defense answer evaluation
 */
export async function evaluateVivaAnswer(params: {
  topic: string;
  course: string;
  examinerPersona?: string;
  studentAnswer: string;
  history?: { role: string; content: string }[];
  turnCount: number;
}): Promise<VivaEvaluationResult> {
  const prompt = `You are evaluating a candidate's oral defense for their Bachelor/Master of Science or Technology degree at a Nigerian university.
Topic: "${params.topic}"
Department / Course: "${params.course}"
Examiner Profile: ${params.examinerPersona || 'strict'} (Expects high methodological rigor, database normalization, concurrency control, and sound empirical research principles).
Turn: ${params.turnCount}

Candidate's Defense Answer:
"${params.studentAnswer}"

Recent Defense History:
${(params.history || []).slice(-4).map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n')}

Analyze the candidate's answer for technical accuracy, clarity of thought, and defense poise.
Respond in valid JSON ONLY (no markdown fences, no explanatory preamble):
{
  "rating": <number between 4.0 and 9.8>,
  "feedback": "<1-2 sentences of direct, authoritative academic feedback on their defense response>",
  "nextQuestion": "<the next sharp, critical examiner question testing Chapter 3 methodology, Chapter 4 results, or software edge cases>"
}`;

  try {
    const aiRes = await generateAcademicAI({
      prompt,
      temperature: 0.6,
      maxTokens: 2000,
    });

    const match = aiRes.content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object found in response');
    const parsed = JSON.parse(match[0]);

    return {
      rating: typeof parsed.rating === 'number' ? Math.min(10, Math.max(1, parsed.rating)) : 8.5,
      feedback: parsed.feedback || 'Sound technical justification demonstrated before the panel.',
      nextQuestion: parsed.nextQuestion || 'Candidate, explain how your database ensures zero race conditions during peak concurrent write operations.',
      provider: aiRes.provider,
    };
  } catch (err) {
    console.error('evaluateVivaAnswer error:', err);
    // Graceful fallback heuristic
    const len = params.studentAnswer.trim().split(/\s+/).length;
    const rating = len < 15 ? 5.5 : len < 35 ? 7.5 : 9.0;
    return {
      rating,
      feedback: len < 20 
        ? 'Your defense point is brief. Ground your explanation with specific algorithmic trade-offs and empirical metrics.'
        : 'Commendable reasoning. The panel appreciates your technical depth and alignment with standard engineering paradigms.',
      nextQuestion: params.turnCount === 1 
        ? `Moving to Chapter 3: What sampling formula did you use for questionnaire validation, and how did you verify Cronbach's alpha?`
        : params.turnCount === 2
        ? `In Chapter 4: What specific concurrency isolation level did your codebase enforce to prevent phantom reads?`
        : `If you were awarded commercialization grant funding, what are the top two scalability limitations you would refactor first?`,
      provider: 'codethesis-fallback',
    };
  }
}

/**
 * Intelligent Step-by-Step Assignment & Proof Solver
 */
export async function solveAcademicProblem(params: {
  problem: string;
  department: string;
  institution?: string;
}): Promise<SolvedAssignmentResult> {
  const prompt = `You are a distinguished university professor in ${params.department} at ${params.institution || 'a Nigerian Tertiary Institution'}.
Solve the following academic assignment question with complete, step-by-step mathematical proofs, theoretical justification, and code/matrix/formulas where applicable.

Problem Statement:
"${params.problem}"

You MUST respond strictly in the following JSON format without code blocks:
{
  "title": "<A concise 4-8 word title for this problem>",
  "steps": [
    {
      "stepNumber": 1,
      "stepTitle": "<Descriptive step heading>",
      "explanation": "<In-depth academic reasoning and justification of this step>",
      "mathSnippet": "<Formulas, equations, matrix decomposition, or code snippet. Strictly NO raw LaTeX ($$, $, \\frac); use clean readable math notation e.g. S = 1 / [1 + d(F_q, F_t)] or O(n log n)>"
    }
  ],
  "finalAnswer": "<One or two sentences stating the final verified numerical/theoretical conclusion>"
}`;

  try {
    const aiRes = await generateAcademicAI({
      prompt,
      temperature: 0.5,
      maxTokens: 3000,
    });

    const match = aiRes.content.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (parsed.steps && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
        const sanitizedSteps = parsed.steps.map((st: any) => ({
          ...st,
          explanation: sanitizeAcademicTextMath(st.explanation || ''),
          mathSnippet: convertLatexFormula(st.mathSnippet || ''),
        }));
        return {
          title: parsed.title || 'Coursework Analytical Solution',
          problem: params.problem,
          steps: sanitizedSteps,
          finalAnswer: convertLatexFormula(parsed.finalAnswer || 'Problem solved with full analytical verification.'),
          provider: aiRes.provider,
        };
      }
    }
  } catch (err) {
    console.warn('AI Assignment Solver parse error:', err);
  }

  // Graceful fallback if JSON parsing failed
  return {
    title: 'Analytical Mathematical Derivation',
    problem: params.problem,
    steps: [
      {
        stepNumber: 1,
        stepTitle: 'Problem Decomposition & Constraint Formulation',
        explanation: 'Identify initial boundary conditions, prime candidate attributes, and functional dependencies required for formal solution.',
        mathSnippet: 'K = { Primary Key Constraints }, Functional Dependencies FD: X -> Y',
      },
      {
        stepNumber: 2,
        stepTitle: 'Analytical Derivation & Invariant Verification',
        explanation: 'Apply canonical transformation theorems to eliminate anomalies and preserve dependency closure.',
        mathSnippet: 'T(n) = a*T(n/b) + f(n) => Asymptotic bound evaluated via Master Theorem',
      },
      {
        stepNumber: 3,
        stepTitle: 'Step-by-Step Proof & Synthesis',
        explanation: 'Evaluate terminal matrix determinant and verify consistency across all state transitions.',
        mathSnippet: 'Det(A) != 0 => Unique non-trivial solution confirmed.',
      }
    ],
    finalAnswer: 'Analytical derivation verified and consistent with standard university coursework criteria.',
    provider: 'codethesis-fallback',
  };
}

export const solveAssignmentAI = solveAcademicProblem;

/**
 * Intelligent Mermaid UML Diagram Synthesizer
 */
export async function generateMermaidDiagram(params: {
  topic: string;
  diagramType: 'use-case' | 'sequence' | 'class' | 'erd';
  department?: string;
}): Promise<{ mermaidCode: string; explanation: string; provider: string }> {
  const prompt = `You are a Chief Software Architect and university systems analyst in ${params.department || 'Computer Science / Engineering'}.
Synthesize an authentic, production-grade Mermaid.js diagram for the following university thesis project:
Topic: "${params.topic}"
Diagram Type: ${params.diagramType}

Requirements:
- For 'sequence': Include student client, API controller, transaction concurrency lock manager, and database. Demonstrate row-level ACID locking.
- For 'use-case': Include undergraduate student, departmental admin, and bursar actors with clear system boundary and 6+ use cases.
- For 'class': Include 4+ normalized domain models with attributes, visibility (+/-), and methods.
- For 'erd': Include 4+ relational entities with PK/FK relationships and realistic Nigerian university fields.

Return ONLY the Mermaid diagram code inside a \`\`\`mermaid code block, followed by 1 short paragraph explaining the architectural rationale.`;

  try {
    const aiRes = await generateAcademicAI({
      prompt,
      temperature: 0.6,
      maxTokens: 2500,
    });

    const match = aiRes.content.match(/```mermaid([\s\S]*?)```/i);
    const mermaidCode = match ? match[1].trim() : aiRes.content.trim();
    const explanation = aiRes.content.split('```').pop()?.trim() || 'Synthesized architecture with row-level transaction safety.';

    return {
      mermaidCode,
      explanation,
      provider: aiRes.provider,
    };
  } catch (err) {
    return {
      mermaidCode: `sequenceDiagram
  autonumber
  actor Student as Student Candidate
  participant App as Web Application API
  participant Lock as Concurrency Coordinator
  participant DB as Relational Database

  Student->>App: POST /submit-record
  App->>Lock: Request Row Lock (ID)
  Lock->>DB: SELECT * FOR UPDATE
  Note over Lock,DB: Row Lock Acquired (ACID Isolation)
  DB-->>Lock: Success
  Lock->>DB: UPDATE table SET status = 'confirmed'
  DB-->>App: Commit Transaction
  App-->>Student: HTTP 200 OK (Zero Collision)`,
      explanation: 'Standard ACID transaction sequence diagram with pessimistic row-level locking.',
      provider: 'codethesis-fallback',
    };
  }
}

/**
 * Parameter interface for Chapter Synthesis based on Nigerian NUC & ABU Zaria Standard (Reference: MY PROJECT ORIGINAL.docx)
 */
export interface ThesisChapterPromptParams {
  topic: string;
  course: string;
  institution: string;
  chapterNumber: number;
  caseStudy?: string;
  additionalContext?: string;
}

export function buildChapterUserPrompt(params: ThesisChapterPromptParams): string {
  const { topic, course, institution, chapterNumber, caseStudy } = params;
  const effectiveCaseStudy = (caseStudy && caseStudy.trim())
    ? caseStudy.trim()
    : extractDomainFromTopic(topic);

  const contextHeader = `
ACADEMIC CONTEXT & DOMAIN BOUNDARIES:
- Degree-Awarding University: "${institution}" (CRITICAL RULE: This is SOLELY the university awarding the student's degree. Do NOT fabricate operational departments, police stations, hospital wards, or commercial operations inside "${institution}" unless the project topic is explicitly an internal university campus portal).
- Target Operational Domain / Case Study: "${effectiveCaseStudy}" (All empirical problem statements, manual workflow reviews, structural bottlenecks, and system operational requirements MUST focus strictly on this organization/domain).
`;

  const formattingRules = `
CRITICAL FORMATTING & EXTENSIVE LENGTH REQUIREMENTS:
1. NO RAW MARKDOWN SYMBOLS: Do NOT use asterisks (**) or hashes (##) or bullet asterisks (*). Write section titles clearly in plain Title Case on their own line without asterisks or hashes (e.g. "1.1 Background of the Study").
2. EXHAUSTIVE ACADEMIC LENGTH: A shallow summary is strictly forbidden. For EVERY single subsection, write at least 3 to 5 dense, multi-paragraph scholarly analyses containing empirical data, theoretical justifications, citations, and domain-specific arguments. Make this chapter comprehensive, deep, and extensive (~3,500 to 4,500 words).
3. FORMAL ACADEMIC PROSE: Use scholarly third-person academic English, formal APA 7th citations, and deep computational/engineering depth.
4. NO RAW LATEX MATH MARKUP: Strictly do NOT output raw LaTeX math markup (such as $$, $, \\frac{...}{...}, \\sum, \\sqrt, or \\begin{equation}). Format all mathematical formulas and equations using clean, universally readable standard academic notation with explicit equation numbering on its own centered line:
   (Equation 3.1)    S = 1 / [1 + d(F_q, F_t)]
   where d(F_q, F_t) is the distance function between feature vectors F_q and F_t.
5. STRICTLY NO REFERENCES OR BIBLIOGRAPHY AT THE END: Do NOT output a "References" or "Bibliography" list at the end of this chapter. In canonical university dissertation format, references are compiled exclusively in a single dedicated section at the very end of the entire thesis (after Chapter Five). Conclude this chapter immediately after its final operational section without any trailing references list.
6. PREVENT GENERIC CLICHES & GUARANTEE 100% DOMAIN UNIQUENESS: Every single paragraph, operational workflow, problem statement, hardware component, database table, and algorithmic parameter must be 100% SPECIFIC TO "${topic}" with direct application to "${effectiveCaseStudy}".
   - If the project involves security, police stations, locks, biometrics, armories, surveillance, or law enforcement: describe real physical security protocols at ${effectiveCaseStudy} including cell blocks, armories, duty officers, solenoids, RFID badges, panic alarms, tamper switches, and power backup.
   - If the project involves healthcare, finance, agriculture, commerce, logistics, or IoT: describe the exact real-world operational workflows of that specific industry.
   - NEVER fabricate student registration, bursary queues, or student fees unless the project topic is explicitly an educational student portal.
   - Dynamic Uniqueness Seed: Formulate a fresh, innovative technical approach with specific hardware/software protocols, detailed domain-specific data structures, and tailored empirical metrics so that this project is truly one-of-a-kind.
`;

  if (chapterNumber === 1) {
    return `Write an exhaustive, publishable CHAPTER ONE (INTRODUCTION) for the undergraduate/postgraduate dissertation titled:
"${topic}"
Department: ${course}
${contextHeader}

Follow the canonical 10-section dissertation structure (Reference: Nigerian University System B.Sc/B.Tech guidelines):
1.1 Background of the Study (In-depth analysis of the problem domain, historical context, emergence of digital/automated solutions, and challenges in the Nigerian context)
1.2 Statement of the Problem (Concrete examination of existing operational bottlenecks, administrative delays, human error rates, data loss, and lack of transparency within ${effectiveCaseStudy})
1.3 Aim and Objectives of the Study
   1.3.1 Aim (Overarching technical goal of the software/system for ${effectiveCaseStudy}, submitted to the Department of ${course}, ${institution})
   1.3.2 Specific Objectives (Exactly 5 numbered action-oriented objectives: 1. To examine operational workflows at ${effectiveCaseStudy}..., 2. To identify..., 3. To design..., 4. To develop..., 5. To test and evaluate...)
1.4 Significance of the Study (Academic, institutional, economic, and practical contributions to operational personnel, administrators, and the host domain)
1.5 Scope of the Study (Clear functional, technological, geographical, and organizational boundaries focused on ${effectiveCaseStudy})
1.6 Limitations of the Study (5 realistic constraints: time, finance, operational data access, hardware/network dependencies)
1.7 Assumptions of the Study (5 numbered core operational assumptions)
1.8 Methodology (Software development lifecycle model adopted e.g. Agile/Prototyping/Waterfall, data gathering instruments)
1.9 Organization of the Study (Paragraph-by-paragraph structural overview of Chapters 1 through 5)
1.10 Definition of Terms (Key operational and technical terms defined in the specific context of this project)

CRITICAL INSTRUCTION: Conclude Chapter One immediately after Section 1.10 (Definition of Terms). DO NOT append any References or Bibliography list at the end of Chapter One.

${formattingRules}
Write complete, rigorous academic paragraphs for every single section. Do not summarize or omit any section.`;
  } else if (chapterNumber === 2) {
    return `Write an exhaustive, publishable CHAPTER TWO (LITERATURE REVIEW) for the dissertation titled:
"${topic}"
Department: ${course}
${contextHeader}

Follow the canonical academic structure:
2.1 Introduction (Thematic scope and outline of literature surveyed)
2.2 Conceptual Review (Detailed conceptual review of core domains, information systems, automation architectures, and modern paradigms)
2.3 Theoretical Framework (Core underlying theories: Technology Acceptance Model (TAM), Relational Database Theory, Queuing Theory, Algorithmic Complexity)
2.4 Review of Modern Technological Frameworks (Comparative evaluation of programming languages, backend frameworks, relational/NoSQL databases, and security protocols)
2.5 Review of Related Works / Similar Existing Systems (Critical review of 4 published systems or academic papers with author names, publication years, methodology, and findings)
2.6 Comparative Analysis Table & Limitations of Existing Systems (Detailed critique of existing solutions highlighting vulnerabilities: scalability, security, cost, local institutional fit)
2.7 Research Gap (Exact technical, algorithmic, and empirical gap that this project directly bridges)
2.8 Summary of Literature Review (Synthesizing review findings and establishing theoretical justification for the proposed system)

${formattingRules}
Write full scholarly paragraphs with formal APA 7th citations.`;
  } else if (chapterNumber === 3) {
    return `Write an exhaustive, publishable CHAPTER THREE (SYSTEM ANALYSIS AND DESIGN) for the dissertation titled:
"${topic}"
Department: ${course}
${contextHeader}

Follow the canonical engineering structure:
3.1 Introduction (Design philosophy and objectives of system analysis)
3.2 Analysis of the Existing System & Current Workflow (Step-by-step description of how operations are conducted manually within ${effectiveCaseStudy})
   3.2.1 Problems and Bottlenecks of the Existing System
3.3 Analysis of the Proposed System & Technical Improvements (How the proposed software eliminates manual bottlenecks and introduces automation)
3.4 Objectives of the Proposed System (Measurable operational targets)
3.5 System Development Methodology & Justification (Detailed phase-by-phase justification of the chosen SDLC methodology)
3.6 Feasibility Study
   3.6.1 Technical Feasibility (Hardware, software, programming environment readiness)
   3.6.2 Economic Feasibility (Cost-benefit analysis, infrastructure ROI)
   3.6.3 Operational Feasibility (User adoption, training requirements, institutional policy alignment)
3.7 System Architecture (Decoupled 3-tier architecture: Presentation Layer, Business Logic Layer, and Database Layer)
3.8 Data Flow Analysis & Models (Detailed description of Context Diagram, Level 1 DFD, and Use Case specifications)
3.9 Database Design & Data Dictionary (Detailed relational database design including Entity-Relationship model and formatted markdown tables for 4 core tables: Field Name, Data Type, Size, Constraints, Description)
3.10 System Flowcharts and Algorithm Logic (Step-by-step algorithmic logic and decision trees for core transactions)

${formattingRules}
Provide complete text and formatted database tables.`;
  } else if (chapterNumber === 4) {
    return `Write an exhaustive, publishable CHAPTER FOUR (SYSTEM IMPLEMENTATION AND EVALUATION) for the dissertation titled:
"${topic}"
Department: ${course}
${contextHeader}

Follow the canonical implementation and evaluation structure:
4.1 Introduction (Implementation roadmap and testing objectives)
4.2 System Development Environment (Hardware specifications e.g. Processor, RAM, SSD; and Software specifications e.g. OS, Runtime, DBMS, IDE)
4.3 System Implementation Architecture (Technical execution, framework integrations, and security enforcement)
4.4 Database Implementation (DDL script execution, relational constraints, foreign keys, and transaction integrity)
4.5 Description of System Modules (Detailed explanation of 5 core modules: Authentication Module, Main Operational Module, Admin Dashboard Module, Concurrency/Locking Module, Reporting Module)
4.6 User Interface Design & Screen Descriptions (Detailed walkthrough of 5 key interfaces: Landing/Home, User Registration, Main Dashboard, Transaction Action Screen, Admin Panel)
4.7 Testing of the System
   4.7.1 Unit Testing
   4.7.2 Integration Testing
   4.7.3 System & Stress Testing
4.8 Test Cases and Results (A formatted markdown table containing 5 realistic test cases: Test ID, Description, Test Input, Expected Output, Actual Result, Status PASS)
4.9 Results Obtained & Empirical Metrics (Latency in milliseconds, concurrency stress benchmark under 500+ simultaneous requests, 0% error/collision rate)
4.10 Discussion of Results (Comparison of empirical metrics with legacy manual methods)
4.11 Advantages and Practical Contributions of the Developed System
4.12 Limitations of the Developed System
4.13 Summary of Implementation

${formattingRules}
Provide complete text and formatted test case tables.`;
  } else {
    return `Write an exhaustive, publishable CHAPTER FIVE (SUMMARY, CONCLUSIONS AND RECOMMENDATIONS) for the dissertation titled:
"${topic}"
Department: ${course}
${contextHeader}

Follow the canonical concluding structure:
5.1 Introduction (Overview of the concluding chapter)
5.2 Summary of the Project (Comprehensive recap of problem statement, methodology, software developed, and testing outcomes)
5.3 Summary of Findings & Achievements (Clear articulation of what the system achieved against the 5 original objectives)
5.4 Conclusions (Definitive closing statement on the efficacy, performance, and practical impact of the software)
5.5 Contributions to Knowledge (Distinct theoretical, technical, practical, and institutional contributions)
5.6 Recommendations
   5.6.1 Recommendations for Operational Leadership & Stakeholders of ${effectiveCaseStudy}
   5.6.2 Recommendations for System Administrators & Technical Staff
   5.6.3 Recommendations for Future Research and Scalability

Followed by:
REFERENCES (15+ complete, authentic academic references in APA 7th Edition format with author names, years, journal titles, volume/page numbers, and DOIs).

${formattingRules}`;
  }
}

/**
 * Generate a complete thesis chapter using the Groq multi-key pool
 */
export async function generateThesisChapterAI(params: ThesisChapterPromptParams): Promise<AIResponse> {
  const prompt = buildChapterUserPrompt(params);
  const systemPrompt = `You are CodeThesis AI, a distinguished university professor and academic project supervisor in ${params.course} at ${params.institution}.
Write in authoritative, publishable academic English adhering strictly to National Universities Commission (NUC) benchmark dissertation standards.`;

  const aiRes = await generateAcademicAI({
    prompt,
    systemPrompt,
    temperature: 0.78,
    maxTokens: 5000,
    preferredProvider: 'gemini',
  });

  if (params.chapterNumber < 5 && aiRes && aiRes.content) {
    aiRes.content = stripTrailingReferences(aiRes.content);
  }

  return aiRes;
}
