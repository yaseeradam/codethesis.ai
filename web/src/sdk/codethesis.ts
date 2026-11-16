/**
 * CodeThesis AI — Official TypeScript / Node.js SDK
 * Enterprise Academic Engineering & Research Copilot Client
 * 
 * Works in Node.js 18+, Bun, Deno, Next.js, Cloudflare Workers, and Browsers.
 */

export interface CodeThesisOptions {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export class CodeThesisError extends Error {
  code: string;
  statusCode: number;
  requestId?: string;

  constructor(message: string, code: string, statusCode: number, requestId?: string) {
    super(message);
    this.name = 'CodeThesisError';
    this.code = code;
    this.statusCode = statusCode;
    this.requestId = requestId;
  }
}

export class CodeThesis {
  private apiKey: string;
  private baseUrl: string;
  private timeoutMs: number;

  constructor(options: CodeThesisOptions) {
    if (!options.apiKey) {
      throw new Error('CodeThesis: "apiKey" is required to instantiate the SDK client.');
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl || 'https://codethesis.ai').replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs || 45000;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'CodeThesis-Node-SDK/1.0.0',
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = data.error || {};
      throw new CodeThesisError(
        err.message || `CodeThesis API request failed with status ${res.status}`,
        err.code || 'api_error',
        res.status,
        res.headers.get('x-codethesis-request-id') || err.request_id
      );
    }

    return data as T;
  }

  /**
   * Account & Balance
   */
  async getBalance() {
    return this.request<{
      object: string;
      user_id: string;
      email: string;
      plan: string;
      credits: number;
      mode: 'live' | 'test';
      rate_limit: number;
    }>('/api/v1/account/balance', { method: 'GET' });
  }

  /**
   * Thesis & Dissertation APIs
   */
  thesis = {
    generateChapter: (params: {
      topic: string;
      chapterNumber?: number;
      department?: string;
      institution?: string;
      methodology?: string;
    }) =>
      this.request<{
        object: string;
        topic: string;
        chapter_number: number;
        content: string;
        word_count: number;
        credits_billed: number;
        credits_remaining: number;
      }>('/api/v1/thesis/chapter', {
        method: 'POST',
        body: JSON.stringify({
          topic: params.topic,
          chapter_number: params.chapterNumber || 1,
          department: params.department,
          institution: params.institution,
          methodology: params.methodology,
        }),
      }),

    checkSimilarity: (params: {
      text: string;
      topic?: string;
      department?: string;
    }) =>
      this.request<{
        object: string;
        similarity_score: number;
        verdict: 'ACCEPTABLE' | 'MODERATE_OVERLAP' | 'HIGH_RISK';
        ai_generated_probability: number;
        citation_quality_score: number;
        flagged_passages: Array<{
          text_snippet: string;
          source_match: string;
          match_percentage: number;
        }>;
        recommendations: string[];
        credits_billed: number;
        credits_remaining: number;
      }>('/api/v1/thesis/similarity-check', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
  };

  /**
   * Architectural UML Diagram Generation
   */
  uml = {
    generate: (params: {
      topic: string;
      diagramType?: 'sequence' | 'use-case' | 'class' | 'erd';
      department?: string;
    }) =>
      this.request<{
        object: string;
        topic: string;
        diagram_type: string;
        mermaid_code: string;
        explanation: string;
        credits_billed: number;
        credits_remaining: number;
      }>('/api/v1/uml/generate', {
        method: 'POST',
        body: JSON.stringify({
          topic: params.topic,
          diagram_type: params.diagramType || 'sequence',
          department: params.department,
        }),
      }),
  };

  /**
   * Analytical Assignment & Proof Solver
   */
  assignment = {
    solve: (params: {
      problem: string;
      department?: string;
      institution?: string;
    }) =>
      this.request<{
        object: string;
        title: string;
        steps: Array<{
          stepNumber: number;
          stepTitle: string;
          explanation: string;
          mathSnippet: string;
        }>;
        final_answer: string;
        credits_billed: number;
        credits_remaining: number;
      }>('/api/v1/assignment/solve', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
  };

  /**
   * Viva Voce Oral Defense Simulator
   */
  viva = {
    simulate: (params: {
      topic: string;
      course?: string;
      studentAnswer: string;
      examinerPersona?: 'strict' | 'methodological' | 'industry';
      turnCount?: number;
      history?: Array<{ role: string; content: string }>;
    }) =>
      this.request<{
        object: string;
        turn: number;
        rating: number;
        feedback: string;
        next_question: string;
        credits_billed: number;
        credits_remaining: number;
      }>('/api/v1/viva/simulate', {
        method: 'POST',
        body: JSON.stringify({
          topic: params.topic,
          course: params.course,
          student_answer: params.studentAnswer,
          examiner_persona: params.examinerPersona || 'strict',
          turn_count: params.turnCount || 1,
          history: params.history,
        }),
      }),
  };

  /**
   * Industrial SIWES / ITF Daily Logbook Synthesis
   */
  siwes = {
    generateLogbook: (params: {
      industryName: string;
      role: string;
      department?: string;
      weeks?: number;
    }) =>
      this.request<{
        object: string;
        industry_name: string;
        weeks_generated: number;
        entries: Array<{
          weekNumber: number;
          departmentSection: string;
          dailyActivities: Array<{
            day: string;
            taskDescription: string;
            toolsUsed: string;
            skillsAcquired: string;
          }>;
          weeklySummary: string;
        }>;
        credits_billed: number;
        credits_remaining: number;
      }>('/api/v1/siwes/logbook', {
        method: 'POST',
        body: JSON.stringify({
          industry_name: params.industryName,
          role: params.role,
          department: params.department,
          weeks: params.weeks || 4,
        }),
      }),
  };

  /**
   * Enterprise Campus / Institutional Operations
   */
  institution = {
    verifyStudent: (params: {
      matricNumber: string;
      studentEmail?: string;
      studentName?: string;
      department?: string;
      allocatedCredits?: number;
    }) =>
      this.request<{
        object: string;
        institution: string;
        matric_number: string;
        student_name: string;
        account_linked: boolean;
        allocated_credits: number;
        status: string;
        verified_at: string;
      }>('/api/v1/institution/verify-student', {
        method: 'POST',
        body: JSON.stringify({
          matric_number: params.matricNumber,
          student_email: params.studentEmail,
          student_name: params.studentName,
          department: params.department,
          allocated_credits: params.allocatedCredits || 25,
        }),
      }),
  };

  /**
   * Asynchronous Background Jobs & Polling
   */
  jobs = {
    createThesisJob: (params: {
      topic: string;
      chapterNumber?: number;
      department?: string;
      institution?: string;
      methodology?: string;
      webhookUrl?: string;
    }) =>
      this.request<{
        object: string;
        job_id: string;
        job_type: string;
        status: 'processing' | 'completed' | 'failed';
        check_status_url: string;
        webhook_url: string | null;
        credits_billed: number;
      }>('/api/v1/jobs/thesis', {
        method: 'POST',
        body: JSON.stringify({
          topic: params.topic,
          chapter_number: params.chapterNumber || 1,
          department: params.department,
          institution: params.institution,
          methodology: params.methodology,
          webhook_url: params.webhookUrl,
        }),
      }),

    get: (jobId: string) =>
      this.request<{
        object: string;
        job_id: string;
        job_type: string;
        status: 'pending' | 'processing' | 'completed' | 'failed';
        progress: number;
        result: any;
        error: string | null;
        completed_at: string | null;
      }>(`/api/v1/jobs/${jobId}`, { method: 'GET' }),

    waitForCompletion: async (
      jobId: string,
      options: { pollIntervalMs?: number; maxWaitMs?: number } = {}
    ) => {
      const pollInterval = options.pollIntervalMs || 2500;
      const maxWait = options.maxWaitMs || 120000;
      const startTime = Date.now();

      while (Date.now() - startTime < maxWait) {
        const job = await this.jobs.get(jobId);
        if (job.status === 'completed') return job;
        if (job.status === 'failed') {
          throw new CodeThesisError(job.error || 'Job failed', 'job_failed', 500);
        }
        await new Promise((r) => setTimeout(r, pollInterval));
      }

      throw new CodeThesisError('Timed out waiting for job completion', 'job_timeout', 408);
    },
  };
}

export default CodeThesis;
