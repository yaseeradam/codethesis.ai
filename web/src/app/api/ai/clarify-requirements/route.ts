import { NextRequest, NextResponse } from 'next/server';
import { generateAcademicAI } from '@/lib/ai';

export interface ClarificationQuestion {
  id: string;
  question: string;
  context: string;
  options: string[];
  defaultIndex: number;
}

export interface ClarificationResponse {
  success: boolean;
  summary: string;
  questions: ClarificationQuestion[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      topic = 'Academic Enterprise System',
      description = '',
      techStack = 'Python + SQLite',
      course = 'Computer Science',
      features = {},
    } = body;

    const cleanTopic = String(topic).trim();
    if (!cleanTopic || cleanTopic.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid application name first.' },
        { status: 400 }
      );
    }

    const t = cleanTopic.toLowerCase();
    const d = String(description).toLowerCase();

    // 1. Prepare AI Architect Prompt to uncover 2-3 vital architectural decisions
    const prompt = `You are a Principal Software Engineering Architect and Academic Defense Chair evaluating an undergraduate/postgraduate Final Year Software Project in Nigeria.

PROJECT PARAMETERS:
- System Name: "${cleanTopic}"
- Description: "${description || 'No detailed description provided by user'}"
- Academic Department: "${course}"
- Target Tech Stack: "${techStack}"
- Configured Features: User Auth: ${features.userAuth ?? true}, Admin Dashboard: ${features.adminDashboard ?? true}, Payment: ${features.paymentIntegration ?? false}, Reports: ${features.reportsAnalytics ?? true}

TASK:
Examine the parameters above. Identify 2 to 3 critical architectural, security, workflow, or domain decisions that the user DID NOT specify or that are essential for making this software 100% defense-grade, realistic, and fully functional in an academic viva defense.

Each question must be practical and domain-specific (e.g. for e-voting: token authentication vs biometric; for student clearance: debt reconciliation vs multi-office sign-off; for healthcare: patient triage vs NHIS billing; for ML prediction: feature set vs real-time alert trigger).
Provide 3 to 4 distinct selectable options for each question. The first option MUST be prefixed with "(Recommended) ".

Respond strictly in valid JSON matching this schema:
{
  "summary": "1 concise sentence assessing the system scope and why these architectural choices are critical for defense",
  "questions": [
    {
      "id": "short_unique_snake_case_key",
      "question": "Engaging, authoritative question title",
      "context": "1 clear sentence explaining the practical impact of this decision on the codebase",
      "options": [
        "(Recommended) Highly specific and robust implementation approach",
        "Alternative practical approach 1",
        "Alternative practical approach 2",
        "Lightweight standalone approach"
      ],
      "defaultIndex": 0
    }
  ]
}`;

    let summary = `Our AI architect analyzed "${cleanTopic}" and identified key architectural specifications to elevate your system to defense standards.`;
    let questions: ClarificationQuestion[] = [];

    try {
      const aiRes = await Promise.race([
        generateAcademicAI({
          prompt,
          temperature: 0.3,
          maxTokens: 1200,
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000)),
      ]);

      if (aiRes && aiRes.content) {
        let jsonStr = aiRes.content.trim();
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        else if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');

        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed.questions) && parsed.questions.length >= 2) {
          summary = parsed.summary || summary;
          questions = parsed.questions.slice(0, 3).map((q: any, i: number) => ({
            id: q.id || `req_spec_${i + 1}`,
            question: q.question || `System Architecture Decision ${i + 1}`,
            context: q.context || 'Choose the implementation pattern that matches your project requirements.',
            options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : [
              '(Recommended) Standard Multi-Tier Role Architecture',
              'Single Administrative Operator Console',
              'Decentralized Departmental Model'
            ],
            defaultIndex: 0,
          }));
        }
      }
    } catch (aiErr) {
      console.warn('AI clarification synthesis timed out or failed, using heuristic fallback:', aiErr);
    }

    // Heuristic Fallback if AI was unavailable or timed out
    if (questions.length === 0) {
      if (t.includes('voting') || t.includes('election') || t.includes('ballot')) {
        summary = 'For campus election integrity, voter authentication method and tally audit hashing are vital defense parameters.';
        questions = [
          {
            id: 'voter_accreditation',
            question: 'Voter Accreditation & Verification Model',
            context: 'Determines how eligible student voters prove their identity before unlocking their ballot sheet.',
            options: [
              '(Recommended) Matriculation Number + Cryptographic One-Time Token (OTP) delivered to portal',
              'Biometric Fingerprint Match Simulation (Minutiae extraction template)',
              'Student Portal Single Sign-On (SUG Portal Credentials verification)',
              'Barcode / Matric RFID Card Scan Reader Emulation'
            ],
            defaultIndex: 0,
          },
          {
            id: 'ballot_audit_mode',
            question: 'Ballot Sealing & Tamper-Evident Audit Mechanism',
            context: 'Controls how cast votes are locked to prevent electoral fraud during counting and defense verification.',
            options: [
              '(Recommended) SHA-256 Chained Hash Ledger (Every cast vote cryptographically binds to prior vote)',
              'Encrypted Zero-Knowledge Proof Ballot Box (Voter anonymity preserved)',
              'Dual-Signature Broadsheet (Requires both Presiding Officer and SUG Agent sign-off)'
            ],
            defaultIndex: 0,
          },
          {
            id: 'contested_offices',
            question: 'Contested Electoral Scope & Ballot Track',
            context: 'Defines the ballot structure displayed to accredited voters in the election console.',
            options: [
              '(Recommended) Complete SUG Executive Council (President, VP, Gen Sec, PRO, Director of Socials)',
              'Faculty & Departmental Executive Council',
              'Hall of Residence / Hall Warden Representative Track'
            ],
            defaultIndex: 0,
          }
        ];
      } else if (t.includes('clearance') || t.includes('asset') || t.includes('inventory')) {
        summary = 'Final year clearance systems require clear multi-office authorization steps and debt liability checks.';
        questions = [
          {
            id: 'clearance_hierarchy',
            question: 'Multi-Departmental Approval Sequence',
            context: 'Controls the institutional sequence of clearance clearance sign-offs across campus units.',
            options: [
              '(Recommended) Strict Sequential Workflow: Bursary -> Library -> Sports Council -> HOD -> Dean',
              'Parallel Workflow: All designated offices can approve concurrently',
              'Single Administrative Desk with multi-department checklist verification'
            ],
            defaultIndex: 0,
          },
          {
            id: 'certificate_issuance',
            question: 'Digital Clearance Certificate & Security Verification',
            context: 'Specifies how the final release document is generated and authenticated.',
            options: [
              '(Recommended) Tamper-Proof Digital Certificate with unique QR Code & Senate clearance ID',
              'Cryptographically signed PDF broadsheet for registry archive',
              'Instant SMS/Email Clearance Notification with Registrar confirmation token'
            ],
            defaultIndex: 0,
          },
          {
            id: 'debt_reconciliation',
            question: 'Outstanding Liability & Penalty Settlement Engine',
            context: 'Defines how unreturned library books or unpaid departmental dues are resolved.',
            options: [
              '(Recommended) Automated Paystack Live Payment Integration with instant receipt clearance',
              'Bursary manual teller upload and verification docket',
              'Waiver approval channel for special academic dispensations'
            ],
            defaultIndex: 0,
          }
        ];
      } else if (t.includes('predict') || t.includes('risk') || t.includes('machine learning') || t.includes('ai') || t.includes('fraud')) {
        summary = 'Machine learning and analytical projects require clear model feature inputs and automated intervention alerts.';
        questions = [
          {
            id: 'feature_inputs',
            question: 'Primary Feature Vectors & Input Parameters',
            context: 'Determines what historical metrics the predictive algorithm processes for evaluation.',
            options: [
              '(Recommended) Multi-semester CGPA trajectory + Course failure flags + Lecture attendance rate',
              'Real-time transaction velocity spikes + Geographic hop distance + Transaction volume',
              'Continuous assessment test scores (30%) + Examination scores (70%) + Assignment submission punctuality'
            ],
            defaultIndex: 0,
          },
          {
            id: 'model_algorithm',
            question: 'Prediction Algorithm & Classification Architecture',
            context: 'Specifies the computational engine backing your system outputs for viva presentation.',
            options: [
              '(Recommended) Stacking Ensemble Classifier (Random Forest + Logistic Regression meta-model)',
              'Supervised Decision Tree & Gradient Boosting (XGBoost logic)',
              'Deep Multi-Layer Perceptron (MLP) Neural Network scoring',
              'K-Means Unsupervised Anomaly Clustering'
            ],
            defaultIndex: 0,
          },
          {
            id: 'alert_action',
            question: 'Intervention Trigger & Automated Action Workflow',
            context: 'Defines what the system does immediately when an at-risk flag or anomaly is discovered.',
            options: [
              '(Recommended) Auto-generate Dean Advisory Roster & send early warning notification to Level Adviser',
              'Immediate transaction freeze & biometric step-up authentication challenge',
              'Export comprehensive confusion matrix and ROC-AUC performance curves'
            ],
            defaultIndex: 0,
          }
        ];
      } else {
        summary = `Identified key user access roles and data persistence models to make "${cleanTopic}" defense-ready.`;
        questions = [
          {
            id: 'user_roles',
            question: 'System Access Control & Authorization Hierarchy',
            context: 'Defines who can access, modify, and audit data within your system.',
            options: [
              '(Recommended) Multi-Tier Role Model: Student/Client, Supervisor/Staff, and System Administrator',
              'Two-Tier Model: General User and Chief Administrator',
              'Role-Based Access Control (RBAC) with granular permission matrix'
            ],
            defaultIndex: 0,
          },
          {
            id: 'persistence_mode',
            question: 'Data Storage & Viva Demonstration Environment',
            context: 'Ensures the software runs effortlessly in front of external examiners without network failure.',
            options: [
              '(Recommended) Standalone Embedded SQLite Engine with pre-seeded demonstration data (Zero cloud risk)',
              'Client-Server Relational Database (MySQL / PostgreSQL connection pool)',
              'Hybrid Local Cache with Automated Cloud Backup Sync'
            ],
            defaultIndex: 0,
          },
          {
            id: 'reporting_export',
            question: 'Audit Reporting & Document Generation Standards',
            context: 'Specifies what exportable artifacts your software delivers during viva defense.',
            options: [
              '(Recommended) Exportable Formatted CSV / Senate Broadsheet + Printable Audit Log',
              'Real-Time Analytical KPI Dashboard with trendline charts',
              'Automated PDF Report Generator with institutional watermarking'
            ],
            defaultIndex: 0,
          }
        ];
      }
    }

    return NextResponse.json({
      success: true,
      summary,
      questions,
    });
  } catch (error: any) {
    console.error('Clarification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to analyze parameters' },
      { status: 500 }
    );
  }
}
