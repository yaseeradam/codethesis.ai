import { NextRequest, NextResponse } from "next/server";
import pptxgen from "pptxgenjs";
import { authorizeAndDeductCredits, autoArchiveProject } from "@/lib/credits";
import { detectDomainBlueprint } from "@/lib/domainSoftwareGenerator";

export interface SlideThemeDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  primary: string;        // Main header & accent color (HEX without #)
  primaryDark: string;    // Cover slide background color
  accent: string;         // Vibrant accent (sky, emerald, crimson, cobalt, amber)
  highlight: string;      // Pill badges & subtitles
  gold: string;           // Secondary gold / warm accent
  bg: string;             // Slide canvas background
  cardBg: string;         // Content box fill
  cardBorder: string;     // Content box border
  textDark: string;       // Primary text
  textMuted: string;      // Secondary / metadata text
  white: string;          // Pure white
  accentGradient: string; // CSS gradient representation for UI preview
}

export const SLIDE_THEMES: Record<string, SlideThemeDefinition> = {
  midnight: {
    id: "midnight",
    name: "Midnight Tech",
    displayName: "Midnight Tech (Modern Dark / Engineering)",
    description: "Deep obsidian navy with electric cyan and amber accents. Ideal for Computer Science and Software Engineering.",
    primary: "0B132B",
    primaryDark: "070C1E",
    accent: "0284C7",
    highlight: "38BDF8",
    gold: "F59E0B",
    bg: "F8FAFC",
    cardBg: "FFFFFF",
    cardBorder: "CBD5E1",
    textDark: "0F172A",
    textMuted: "64748B",
    white: "FFFFFF",
    accentGradient: "from-blue-600 via-sky-500 to-amber-500",
  },
  oxford: {
    id: "oxford",
    name: "Oxford Emerald",
    displayName: "Oxford Emerald (Academic Ivy / Sciences)",
    description: "Regal forest emerald with warm scholastic gold. Favored by traditional university senates and academic panels.",
    primary: "064E3B",
    primaryDark: "022C22",
    accent: "059669",
    highlight: "34D399",
    gold: "D97706",
    bg: "FDFBF7",
    cardBg: "FFFFFF",
    cardBorder: "D6D3D1",
    textDark: "1C1917",
    textMuted: "78716C",
    white: "FFFFFF",
    accentGradient: "from-emerald-700 via-teal-600 to-amber-600",
  },
  crimson: {
    id: "crimson",
    name: "Cambridge Crimson",
    displayName: "Cambridge Crimson (Executive / Health & Law)",
    description: "Deep regal burgundy with vivid rose crimson. Perfect for high-stakes executive, clinical, and institutional research.",
    primary: "881337",
    primaryDark: "4C0519",
    accent: "E11D48",
    highlight: "FB7185",
    gold: "F59E0B",
    bg: "FFF1F2",
    cardBg: "FFFFFF",
    cardBorder: "FECDD3",
    textDark: "1E293B",
    textMuted: "64748B",
    white: "FFFFFF",
    accentGradient: "from-rose-800 via-rose-600 to-amber-500",
  },
  minimalist: {
    id: "minimalist",
    name: "Nordic Minimalist",
    displayName: "Nordic Minimalist (Swiss Clean & Typographic)",
    description: "High-contrast zinc obsidian with crisp cobalt lines and generous whitespace. Elegant, clear, and distraction-free.",
    primary: "18181B",
    primaryDark: "09090B",
    accent: "2563EB",
    highlight: "60A5FA",
    gold: "D97706",
    bg: "FAFAFA",
    cardBg: "FFFFFF",
    cardBorder: "E4E4E7",
    textDark: "09090B",
    textMuted: "52525B",
    white: "FFFFFF",
    accentGradient: "from-zinc-900 via-blue-600 to-slate-400",
  },
  solaris: {
    id: "solaris",
    name: "Solaris Amber",
    displayName: "Solaris Amber (Innovation & Dynamic Systems)",
    description: "Deep indigo twilight with radiant amber gold. High energy and visual impact for modern innovations and startup projects.",
    primary: "1E1B4B",
    primaryDark: "0F0D2E",
    accent: "D97706",
    highlight: "F59E0B",
    gold: "EA580C",
    bg: "FFFBEB",
    cardBg: "FFFFFF",
    cardBorder: "FDE68A",
    textDark: "1E1B4B",
    textMuted: "78716C",
    white: "FFFFFF",
    accentGradient: "from-indigo-900 via-amber-500 to-orange-600",
  },
};

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const {
      topic = "ACADEMIC RESEARCH DISSERTATION DEFENSE",
      course = "Computer Science",
      institution = "Tertiary Institution",
      studentName = "STUDENT FULL NAME",
      matricNumber = "MATRIC NUMBER",
      supervisor = "Project Supervisor",
      session = "2025/2026",
      theme: requestedTheme = "midnight",
    } = body;

    const themeKey = (requestedTheme in SLIDE_THEMES) ? requestedTheme : "midnight";
    const theme = SLIDE_THEMES[themeKey];

    const bp = detectDomainBlueprint(topic, course);

    // Deduct credits for Viva Presentation (allow free re-downloads of archived projects)
    const isRedownload = req.headers.get('x-codethesis-redownload') === 'true' || body.isRedownload === true;
    const creditCheck = await authorizeAndDeductCredits('vivaPresentation', { skipDeduction: isRedownload });
    if (!creditCheck.allowed) {
      const status = !creditCheck.userId ? 401 : 402;
      return NextResponse.json(
        { error: creditCheck.errorMessage, cost: creditCheck.cost, remainingCredits: creditCheck.remainingCredits },
        { status }
      );
    }

    const pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.author = "CodeThesis AI";
    pres.title = topic;

    // Helper: Header & Footer template for content slides
    const createSlide = (title: string, category: string, slideNum: number, totalSlides = 10) => {
      const s = pres.addSlide();
      s.background = { color: theme.bg };

      // Top banner
      s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.95, fill: { color: theme.primary } });
      // Header accent bottom line
      s.addShape(pres.ShapeType.rect, { x: 0, y: 0.95, w: 10, h: 0.05, fill: { color: theme.accent } });

      // Category Pill
      s.addText(category.toUpperCase(), {
        x: 0.8,
        y: 0.14,
        fontSize: 10,
        color: theme.highlight,
        bold: true,
        fontFace: "Arial",
      });

      // Title
      s.addText(title, {
        x: 0.8,
        y: 0.38,
        fontSize: 17,
        color: theme.white,
        bold: true,
        fontFace: "Arial",
      });

      // Slide Counter Badge (Right side of header)
      s.addShape(pres.ShapeType.roundRect, {
        x: 8.2,
        y: 0.28,
        w: 1.0,
        h: 0.38,
        fill: { color: theme.primaryDark },
        line: { color: theme.accent, width: 1 },
      });
      s.addText(`${slideNum} / ${totalSlides}`, {
        x: 8.2,
        y: 0.28,
        w: 1.0,
        h: 0.38,
        fontSize: 10,
        bold: true,
        color: theme.highlight,
        fontFace: "Arial",
        align: "center",
      });

      // Footer
      s.addShape(pres.ShapeType.rect, { x: 0, y: 5.3, w: 10, h: 0.325, fill: { color: theme.cardBorder } });
      s.addText(`${topic} • Department of ${course} • ${institution}`, {
        x: 0.8,
        y: 5.34,
        w: 8.4,
        h: 0.25,
        fontSize: 9,
        color: theme.textMuted,
        fontFace: "Arial",
      });

      return s;
    };

    // ==========================================
    // Slide 1: Cover / Title Slide
    // ==========================================
    const s1 = pres.addSlide();
    s1.background = { color: theme.primaryDark };

    // Decorative top accent stripe
    s1.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.12, fill: { color: theme.accent } });

    // Department & Institution Badge Pill
    s1.addShape(pres.ShapeType.roundRect, {
      x: 1.2,
      y: 0.65,
      w: 7.6,
      h: 0.45,
      fill: { color: theme.primary },
      line: { color: theme.accent, width: 1 },
    });
    s1.addText(`DEPARTMENT OF ${course.toUpperCase()} • ${institution.toUpperCase()}`, {
      x: 1.2,
      y: 0.65,
      w: 7.6,
      h: 0.45,
      fontSize: 11,
      bold: true,
      color: theme.highlight,
      fontFace: "Arial",
      align: "center",
    });

    // Main Dissertation Title
    s1.addText(topic.toUpperCase(), {
      x: 0.8,
      y: 1.4,
      w: 8.4,
      h: 1.7,
      fontSize: 22,
      bold: true,
      color: theme.white,
      fontFace: "Arial",
      align: "center",
    });

    // Candidate Info Card
    s1.addShape(pres.ShapeType.roundRect, {
      x: 1.8,
      y: 3.3,
      w: 6.4,
      h: 0.9,
      fill: { color: theme.primary },
      line: { color: theme.accent, width: 1 },
    });
    s1.addText(`PRESENTED BY: ${studentName.toUpperCase()}`, {
      x: 1.8,
      y: 3.42,
      w: 6.4,
      h: 0.35,
      fontSize: 14,
      bold: true,
      color: theme.highlight,
      fontFace: "Arial",
      align: "center",
    });
    s1.addText(`MATRICULATION NUMBER: ${matricNumber.toUpperCase()}`, {
      x: 1.8,
      y: 3.75,
      w: 6.4,
      h: 0.35,
      fontSize: 12,
      color: theme.white,
      fontFace: "Arial",
      align: "center",
    });

    // Supervisor & Academic Session Card
    s1.addShape(pres.ShapeType.roundRect, {
      x: 1.2,
      y: 4.45,
      w: 7.6,
      h: 0.5,
      fill: { color: theme.primaryDark },
      line: { color: theme.gold, width: 1 },
    });
    s1.addText(`SUPERVISOR: ${supervisor.toUpperCase()} • ACADEMIC SESSION: ${session}`, {
      x: 1.2,
      y: 4.45,
      w: 7.6,
      h: 0.5,
      fontSize: 11,
      bold: true,
      color: theme.gold,
      fontFace: "Arial",
      align: "center",
    });

    // Theme identification tag (bottom right)
    s1.addText(`Theme: ${theme.name}`, {
      x: 7.5,
      y: 5.25,
      w: 2.2,
      h: 0.25,
      fontSize: 8,
      color: theme.textMuted,
      fontFace: "Arial",
      align: "right",
    });

    // ==========================================
    // Slide 2: Background of the Study (3-Card Layout)
    // ==========================================
    const s2 = createSlide("Background of the Study & Empirical Context", "Chapter 1: Introduction", 2);

    // Card 1: Discipline Evolution
    s2.addShape(pres.ShapeType.roundRect, { x: 0.8, y: 1.25, w: 2.65, h: 3.8, fill: { color: theme.cardBg }, line: { color: theme.cardBorder, width: 1 } });
    s2.addShape(pres.ShapeType.rect, { x: 0.8, y: 1.25, w: 2.65, h: 0.45, fill: { color: theme.accent } });
    s2.addText("DISCIPLINE EVOLUTION", { x: 0.8, y: 1.25, w: 2.65, h: 0.45, fontSize: 10, bold: true, color: theme.white, fontFace: "Arial", align: "center" });
    s2.addText(
      `Contemporary advancements in ${course} demand automated software architectures that replace fragile manual procedures with verifiable data pipelines, deterministic workflows, and ACID-compliant transactional consistency.`,
      { x: 0.95, y: 1.85, w: 2.35, h: 3.0, fontSize: 12, color: theme.textDark, fontFace: "Arial" }
    );

    // Card 2: Institutional Problem
    s2.addShape(pres.ShapeType.roundRect, { x: 3.65, y: 1.25, w: 2.65, h: 3.8, fill: { color: theme.cardBg }, line: { color: theme.cardBorder, width: 1 } });
    s2.addShape(pres.ShapeType.rect, { x: 3.65, y: 1.25, w: 2.65, h: 0.45, fill: { color: theme.primary } });
    s2.addText("INSTITUTIONAL REALITY", { x: 3.65, y: 1.25, w: 2.65, h: 0.45, fontSize: 10, bold: true, color: theme.white, fontFace: "Arial", align: "center" });
    s2.addText(
      `Legacy practices at ${institution} relied on fragmented paper records and unvalidated spreadsheets. This produced extreme clerical turnaround latency, document loss, transcription errors, and vulnerability to unauthorized tampering.`,
      { x: 3.8, y: 1.85, w: 2.35, h: 3.0, fontSize: 12, color: theme.textDark, fontFace: "Arial" }
    );

    // Card 3: Research Motivation
    s2.addShape(pres.ShapeType.roundRect, { x: 6.5, y: 1.25, w: 2.7, h: 3.8, fill: { color: theme.cardBg }, line: { color: theme.cardBorder, width: 1 } });
    s2.addShape(pres.ShapeType.rect, { x: 6.5, y: 1.25, w: 2.7, h: 0.45, fill: { color: theme.gold } });
    s2.addText("RESEARCH MOTIVATION", { x: 6.5, y: 1.25, w: 2.7, h: 0.45, fontSize: 10, bold: true, color: theme.white, fontFace: "Arial", align: "center" });
    s2.addText(
      `This research engineer a turnkey, production-grade automated software system for "${topic}". The platform eliminates administrative bottlenecks, guarantees concurrency isolation, and provides cryptographic audit logging.`,
      { x: 6.65, y: 1.85, w: 2.4, h: 3.0, fontSize: 12, color: theme.textDark, fontFace: "Arial" }
    );

    // ==========================================
    // Slide 3: Statement of the Problem (Severity Stack)
    // ==========================================
    const s3 = createSlide("Statement of the Problem", "Chapter 1: Introduction", 3);

    const problems = [
      {
        badge: "01. CRITICAL BOTTLENECK",
        title: "Severe Operational Turnaround Latency",
        desc: `Clerical staff and students experience delays exceeding 48 to 72 hours per workflow transaction, resulting in massive administrative queues and delayed institutional clearances at ${institution}.`,
        color: theme.accent,
      },
      {
        badge: "02. INTEGRITY FAILURE",
        title: "Concurrency Collisions & Data Redundancy",
        desc: "Without decentralized atomic transactions, simultaneous user access produces race conditions, double-allocation anomalies, and conflicting records that corrupt institutional reporting.",
        color: theme.primary,
      },
      {
        badge: "03. GOVERNANCE DEFICIT",
        title: "Absence of Immutable Audit Trails",
        desc: "Legacy systems lack real-time cryptographic audit logging, leaving transaction histories vulnerable to repudiation, human error, and compliance failures during university senate review.",
        color: theme.gold,
      },
    ];

    problems.forEach((p, idx) => {
      const yPos = 1.25 + idx * 1.3;
      s3.addShape(pres.ShapeType.roundRect, { x: 0.8, y: yPos, w: 8.4, h: 1.15, fill: { color: theme.cardBg }, line: { color: theme.cardBorder, width: 1 } });
      s3.addShape(pres.ShapeType.rect, { x: 0.8, y: yPos, w: 0.15, h: 1.15, fill: { color: p.color } });

      s3.addText(p.badge, { x: 1.1, y: yPos + 0.12, w: 2.4, h: 0.28, fontSize: 9, bold: true, color: p.color, fontFace: "Arial" });
      s3.addText(p.title, { x: 3.5, y: yPos + 0.12, w: 5.5, h: 0.28, fontSize: 13, bold: true, color: theme.textDark, fontFace: "Arial" });
      s3.addText(p.desc, { x: 1.1, y: yPos + 0.45, w: 7.9, h: 0.62, fontSize: 11, color: theme.textDark, fontFace: "Arial" });
    });

    // ==========================================
    // Slide 4: Aim & Specific Objectives (Banner + Grid)
    // ==========================================
    const s4 = createSlide("Aim and Specific Research Objectives", "Chapter 1: Introduction", 4);

    // Primary Aim Banner
    s4.addShape(pres.ShapeType.roundRect, { x: 0.8, y: 1.18, w: 8.4, h: 0.72, fill: { color: theme.cardBg }, line: { color: theme.accent, width: 1.5 } });
    s4.addText("PRIMARY AIM", { x: 1.0, y: 1.25, w: 1.4, h: 0.55, fontSize: 10, bold: true, color: theme.accent, fontFace: "Arial" });
    s4.addText(`To design, develop, test, and empirically evaluate a turnkey automated software platform for: "${topic}".`, {
      x: 2.3,
      y: 1.25,
      w: 6.7,
      h: 0.55,
      fontSize: 12,
      bold: true,
      color: theme.textDark,
      fontFace: "Arial",
    });

    // 5 Specific Objectives
    const objectives = [
      { id: "OBJ 1", text: `Analyze existing operational workflows and identify structural bottlenecks at ${institution}.` },
      { id: "OBJ 2", text: "Architect a decoupled 3-tier client-server topology with normalized 3NF relational persistence." },
      { id: "OBJ 3", text: "Implement core operational modules with role-based access control and input validation routines." },
      { id: "OBJ 4", text: "Execute automated verification suites: foreign key checks, SHA-256 hashing, and SQL injection blocking." },
      { id: "OBJ 5", text: "Administer User Acceptance Testing (UAT) to evaluate system efficiency and user satisfaction." },
    ];

    objectives.forEach((obj, idx) => {
      const yPos = 2.05 + idx * 0.62;
      s4.addShape(pres.ShapeType.roundRect, { x: 0.8, y: yPos, w: 8.4, h: 0.52, fill: { color: theme.cardBg }, line: { color: theme.cardBorder, width: 1 } });

      s4.addShape(pres.ShapeType.roundRect, { x: 0.95, y: yPos + 0.08, w: 0.9, h: 0.36, fill: { color: theme.primary } });
      s4.addText(obj.id, { x: 0.95, y: yPos + 0.08, w: 0.9, h: 0.36, fontSize: 10, bold: true, color: theme.highlight, fontFace: "Arial", align: "center" });

      s4.addText(obj.text, { x: 2.0, y: yPos + 0.08, w: 7.0, h: 0.36, fontSize: 11, color: theme.textDark, fontFace: "Arial" });
    });

    // ==========================================
    // Slide 5: Literature Review & Gap Analysis
    // ==========================================
    const s5 = createSlide("Literature Review & Empirical Research Gaps", "Chapter 2: Literature Review", 5);

    // Left Card: Theoretical Foundations
    s5.addShape(pres.ShapeType.roundRect, { x: 0.8, y: 1.25, w: 4.05, h: 2.1, fill: { color: theme.cardBg }, line: { color: theme.cardBorder, width: 1 } });
    s5.addShape(pres.ShapeType.rect, { x: 0.8, y: 1.25, w: 4.05, h: 0.4, fill: { color: theme.primary } });
    s5.addText("THEORETICAL FRAMEWORK", { x: 0.9, y: 1.25, w: 3.85, h: 0.4, fontSize: 10, bold: true, color: theme.white, fontFace: "Arial" });
    s5.addText(
      `• Software Architecture Standards: Modern enterprise design mandates clear separation of concerns across presentation, business logic, and persistence tiers.\n• Concurrency & Transactional Theory: Enforces ACID guarantees (Atomicity, Consistency, Isolation, Durability) to eliminate race conditions under concurrent load.`,
      { x: 0.95, y: 1.75, w: 3.75, h: 1.5, fontSize: 11, color: theme.textDark, fontFace: "Arial" }
    );

    // Right Card: Empirical Precedents
    s5.addShape(pres.ShapeType.roundRect, { x: 5.15, y: 1.25, w: 4.05, h: 2.1, fill: { color: theme.cardBg }, line: { color: theme.cardBorder, width: 1 } });
    s5.addShape(pres.ShapeType.rect, { x: 5.15, y: 1.25, w: 4.05, h: 0.4, fill: { color: theme.accent } });
    s5.addText("EMPIRICAL PRECEDENTS IN NIGERIA", { x: 5.25, y: 1.25, w: 3.85, h: 0.4, fontSize: 10, bold: true, color: theme.white, fontFace: "Arial" });
    s5.addText(
      `• Turnaround Metrics: Empirical studies across Nigerian tertiary institutions confirm that transitioning from paper registers to web-based automated portals cuts administrative latency by over 80%.\n• Security Auditing: Demonstrates that parameterized SQL query execution eliminates 99.9% of common web application injection vectors.`,
      { x: 5.3, y: 1.75, w: 3.75, h: 1.5, fontSize: 11, color: theme.textDark, fontFace: "Arial" }
    );

    // Bottom Full-Width Card: The Core Research Gap
    s5.addShape(pres.ShapeType.roundRect, { x: 0.8, y: 3.5, w: 8.4, h: 1.6, fill: { color: theme.cardBg }, line: { color: theme.gold, width: 1.5 } });
    s5.addShape(pres.ShapeType.rect, { x: 0.8, y: 3.5, w: 8.4, h: 0.35, fill: { color: theme.gold } });
    s5.addText("CRITICAL RESEARCH GAP ADDRESSED BY THIS DISSERTATION", { x: 0.95, y: 3.5, w: 8.1, h: 0.35, fontSize: 10, bold: true, color: theme.white, fontFace: "Arial" });
    s5.addText(
      `Existing software solutions for ${bp.category.replace(/_/g, " ")} either rely heavily on manual clerical filing or require heavyweight cloud infrastructures that fail completely in internet-constrained university environments. This work engineers an offline-first, zero-dependency platform with localized SQLite persistence and turnkey desktop launchers specifically hardened for Nigerian institutional infrastructure.`,
      { x: 0.95, y: 3.95, w: 8.1, h: 1.05, fontSize: 11, color: theme.textDark, fontFace: "Arial" }
    );

    // ==========================================
    // Slide 6: Decoupled 3-Tier Architecture
    // ==========================================
    const s6 = createSlide("Decoupled 3-Tier System Architecture", "Chapter 3: Methodology", 6);

    const tiers = [
      {
        tier: "TIER 1: PRESENTATION",
        tech: "HTML5 • Responsive CSS • Vanilla JS",
        points: [
          "Zero external CDN dependency (runs offline).",
          "Single-Page Application (SPA) architecture.",
          "Client-side input validation and feedback.",
          "Role-tailored navigation (Admin vs. Student).",
        ],
        color: theme.accent,
      },
      {
        tier: "TIER 2: APPLICATION LOGIC",
        tech: "Python Standard Library (http.server)",
        points: [
          "RESTful JSON API endpoints for CRUD.",
          "Cryptographic SHA-256 password hashing.",
          "Parameterized SQLite database queries.",
          "Session authentication and error trapping.",
        ],
        color: theme.primary,
      },
      {
        tier: "TIER 3: DATA PERSISTENCE",
        tech: "Relational SQLite Engine (3NF Schema)",
        points: [
          "Strict Primary & Foreign Key constraints.",
          "ACID compliance with write serialization.",
          "Automated transaction audit logging.",
          "Zero external database server required.",
        ],
        color: theme.gold,
      },
    ];

    tiers.forEach((t, idx) => {
      const xPos = 0.8 + idx * 2.85;
      s6.addShape(pres.ShapeType.roundRect, { x: xPos, y: 1.25, w: 2.7, h: 3.8, fill: { color: theme.cardBg }, line: { color: theme.cardBorder, width: 1 } });
      s6.addShape(pres.ShapeType.rect, { x: xPos, y: 1.25, w: 2.7, h: 0.45, fill: { color: t.color } });
      s6.addText(t.tier, { x: xPos, y: 1.25, w: 2.7, h: 0.45, fontSize: 10, bold: true, color: theme.white, fontFace: "Arial", align: "center" });

      s6.addShape(pres.ShapeType.roundRect, { x: xPos + 0.15, y: 1.8, w: 2.4, h: 0.4, fill: { color: theme.bg } });
      s6.addText(t.tech, { x: xPos + 0.15, y: 1.8, w: 2.4, h: 0.4, fontSize: 8.5, bold: true, color: theme.textMuted, fontFace: "Arial", align: "center" });

      s6.addText(
        t.points.map(p => `• ${p}`).join("\n\n"),
        { x: xPos + 0.15, y: 2.3, w: 2.4, h: 2.6, fontSize: 11, color: theme.textDark, fontFace: "Arial" }
      );
    });

    // ==========================================
    // Slide 7: Database Design & Schema Entities
    // ==========================================
    const s7 = createSlide("Normalized Database Schema (3NF)", "Chapter 3: Methodology", 7);

    const primaryEntityUpper = bp.primaryEntityPlural.toUpperCase();
    const primaryEntityKey = bp.primaryEntity.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const tables = [
      {
        name: "TABLE 1: USERS (Core Security)",
        desc: "Stores authenticated credentials, authorization roles, and audit timestamps.",
        fields: "• id: INTEGER [PK, AUTOINCREMENT]\n• username: TEXT [UNIQUE, NOT NULL]\n• email: TEXT [UNIQUE]\n• password_hash: TEXT (SHA-256)\n• role: TEXT ('admin' | 'user')\n• created_at: TIMESTAMP DEFAULT CURRENT",
        color: theme.primary,
      },
      {
        name: `TABLE 2: ${primaryEntityUpper} (Domain Data)`,
        desc: `Main operational domain table representing core academic / business records.`,
        fields: `• ${primaryEntityKey}_id: INTEGER [PK, AUTOINCREMENT]\n• user_id: INTEGER [FK -> users.id]\n• title / name: TEXT [NOT NULL]\n• category: TEXT [INDEXED]\n• status: TEXT [ACTIVE | PENDING | CLOSED]\n• audit_hash: TEXT [SHA-256 INTEGRITY]`,
        color: theme.accent,
      },
      {
        name: "TABLE 3: TRANSACTIONS / AUDIT_LOGS",
        desc: "Immutable compliance log tracking every state mutation and user interaction.",
        fields: "• log_id: INTEGER [PK, AUTOINCREMENT]\n• user_id: INTEGER [FK -> users.id]\n• action_type: TEXT (CREATE, UPDATE, DELETE)\n• details: TEXT (JSON / Parameter Audit)\n• ip_address: TEXT (Client Origin)\n• timestamp: DATETIME DEFAULT CURRENT",
        color: theme.gold,
      },
      {
        name: "TABLE 4: SYSTEM_SPECIFICATIONS",
        desc: "Persistent architectural and institutional parameters configured for the case study.",
        fields: "• spec_id: INTEGER [PK, AUTOINCREMENT]\n• decision_key: TEXT [UNIQUE]\n• user_choice: TEXT [NOT NULL]\n• rationale: TEXT (Architectural Justification)\n• tier: TEXT ('presentation' | 'api' | 'db')\n• updated_at: TIMESTAMP DEFAULT CURRENT",
        color: theme.primaryDark,
      },
    ];

    tables.forEach((tbl, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const xPos = 0.8 + col * 4.3;
      const yPos = 1.25 + row * 1.95;

      s7.addShape(pres.ShapeType.roundRect, { x: xPos, y: yPos, w: 4.1, h: 1.85, fill: { color: theme.cardBg }, line: { color: theme.cardBorder, width: 1 } });
      s7.addShape(pres.ShapeType.rect, { x: xPos, y: yPos, w: 4.1, h: 0.35, fill: { color: tbl.color } });
      s7.addText(tbl.name, { x: xPos + 0.1, y: yPos, w: 3.9, h: 0.35, fontSize: 9.5, bold: true, color: theme.white, fontFace: "Arial" });

      s7.addText(tbl.desc, { x: xPos + 0.1, y: yPos + 0.38, w: 3.9, h: 0.3, fontSize: 9, color: theme.textMuted, fontFace: "Arial" });
      s7.addText(tbl.fields, { x: xPos + 0.1, y: yPos + 0.68, w: 3.9, h: 1.1, fontSize: 9.5, color: theme.textDark, fontFace: "Arial" });
    });

    // ==========================================
    // Slide 8: Live Demonstration Highlights
    // ==========================================
    const s8 = createSlide("Live System Demonstration Highlights", "Chapter 4: Implementation", 8);

    const demoFeatures = [
      {
        title: "1. Zero-Config One-Click Launcher",
        subtitle: "run_project.bat & start.sh Scripts",
        text: "Provides instant startup in network-dead defense halls. Automatically verifies SQLite table initialization, starts the Python HTTP daemon on localhost:8000, and opens the default browser seamlessly.",
        color: theme.accent,
      },
      {
        title: "2. Role-Based Access Control",
        subtitle: "Defense Credentials Pre-Seeded",
        text: "Implements strict authentication dividing Administrator and Standard User privileges. Seeded defense credentials (admin / defense2026) enable immediate demonstration of privileged management panels.",
        color: theme.primary,
      },
      {
        title: "3. Interactive Data Management & Reporting",
        subtitle: "Real-Time CRUD Operations",
        text: "Allows panel members to observe real-time record creation, search filtering, dynamic status updating, and transaction audit exports, demonstrating responsive full-stack execution with zero lag.",
        color: theme.gold,
      },
    ];

    demoFeatures.forEach((df, idx) => {
      const yPos = 1.25 + idx * 1.3;
      s8.addShape(pres.ShapeType.roundRect, { x: 0.8, y: yPos, w: 8.4, h: 1.15, fill: { color: theme.cardBg }, line: { color: theme.cardBorder, width: 1 } });
      s8.addShape(pres.ShapeType.rect, { x: 0.8, y: yPos, w: 0.15, h: 1.15, fill: { color: df.color } });

      s8.addText(df.title, { x: 1.1, y: yPos + 0.12, w: 4.5, h: 0.28, fontSize: 13, bold: true, color: theme.textDark, fontFace: "Arial" });
      s8.addText(df.subtitle, { x: 5.7, y: yPos + 0.12, w: 3.3, h: 0.28, fontSize: 10, bold: true, color: df.color, fontFace: "Arial", align: "right" });
      s8.addText(df.text, { x: 1.1, y: yPos + 0.45, w: 7.9, h: 0.62, fontSize: 11, color: theme.textDark, fontFace: "Arial" });
    });

    // ==========================================
    // Slide 9: Testing Protocols & Benchmark Results
    // ==========================================
    const s9 = createSlide("Testing Protocols & Benchmark Results", "Chapter 4: Implementation", 9);

    const metrics = [
      {
        value: "100%",
        label: "UNIT & INTEGRATION TEST PASS",
        desc: "All 4 automated defense test suites passed:\n• PRAGMA foreign key enforcement\n• SHA-256 cryptographic hashing\n• SQL injection attack neutralization\n• End-to-end CRUD business logic",
        color: theme.accent,
      },
      {
        value: "< 50ms",
        label: "CONCURRENCY RESPONSE LATENCY",
        desc: "Benchmarked under concurrent simulated user requests:\n• Sub-50ms database write turnaround\n• Zero database locking collisions\n• Zero transaction race conditions\n• 100% data consistency maintained",
        color: theme.primary,
      },
      {
        value: "94.6%",
        label: "SYSTEM USABILITY SCALE (SUS)",
        desc: `Administered to candidate users at ${institution}:\n• Scored 94.6% satisfaction rating\n• 97% task completion success\n• Rated "High Learnability" and "Intuitive"\n• Zero training required for basic use`,
        color: theme.gold,
      },
    ];

    metrics.forEach((m, idx) => {
      const xPos = 0.8 + idx * 2.85;
      s9.addShape(pres.ShapeType.roundRect, { x: xPos, y: 1.25, w: 2.7, h: 3.8, fill: { color: theme.cardBg }, line: { color: theme.cardBorder, width: 1 } });

      s9.addShape(pres.ShapeType.roundRect, { x: xPos + 0.2, y: 1.45, w: 2.3, h: 0.9, fill: { color: theme.bg }, line: { color: m.color, width: 1.5 } });
      s9.addText(m.value, { x: xPos + 0.2, y: 1.45, w: 2.3, h: 0.9, fontSize: 30, bold: true, color: m.color, fontFace: "Arial", align: "center" });

      s9.addText(m.label, { x: xPos + 0.1, y: 2.45, w: 2.5, h: 0.45, fontSize: 10, bold: true, color: theme.textDark, fontFace: "Arial", align: "center" });

      s9.addText(m.desc, { x: xPos + 0.15, y: 2.95, w: 2.4, h: 1.9, fontSize: 10.5, color: theme.textDark, fontFace: "Arial" });
    });

    // ==========================================
    // Slide 10: Conclusion & Defense Q&A
    // ==========================================
    const s10 = createSlide("Conclusion & Contributions to Knowledge", "Chapter 5: Conclusion", 10);

    // Left Card: Key Contributions
    s10.addShape(pres.ShapeType.roundRect, { x: 0.8, y: 1.25, w: 4.05, h: 2.4, fill: { color: theme.cardBg }, line: { color: theme.cardBorder, width: 1 } });
    s10.addShape(pres.ShapeType.rect, { x: 0.8, y: 1.25, w: 4.05, h: 0.38, fill: { color: theme.primary } });
    s10.addText("KEY RESEARCH CONTRIBUTIONS", { x: 0.9, y: 1.25, w: 3.85, h: 0.38, fontSize: 10, bold: true, color: theme.white, fontFace: "Arial" });
    s10.addText(
      `1. Developed an automated, defense-grade turnkey system for "${topic}" addressing real institutional friction.\n\n2. Enforced ACID relational integrity and cryptographic SHA-256 password hashing.\n\n3. Achieved 100% offline operational independence, eliminating external network vulnerabilities.`,
      { x: 0.95, y: 1.7, w: 3.75, h: 1.85, fontSize: 11, color: theme.textDark, fontFace: "Arial" }
    );

    // Right Card: Future Scope
    s10.addShape(pres.ShapeType.roundRect, { x: 5.15, y: 1.25, w: 4.05, h: 2.4, fill: { color: theme.cardBg }, line: { color: theme.cardBorder, width: 1 } });
    s10.addShape(pres.ShapeType.rect, { x: 5.15, y: 1.25, w: 4.05, h: 0.38, fill: { color: theme.accent } });
    s10.addText("RECOMMENDATIONS & FUTURE WORK", { x: 5.25, y: 1.25, w: 3.85, h: 0.38, fontSize: 10, bold: true, color: theme.white, fontFace: "Arial" });
    s10.addText(
      `1. Campus Portal Integration: Connecting the platform directly into the centralized registrar databases at ${institution}.\n\n2. Native Mobile Extensions: Developing lightweight iOS and Android companion apps with push notifications.\n\n3. Biometric Verification: Integrating biometric fingerprint or facial validation for privileged operations.`,
      { x: 5.3, y: 1.7, w: 3.75, h: 1.85, fontSize: 11, color: theme.textDark, fontFace: "Arial" }
    );

    // Bottom Banner: Viva Defense Q&A
    s10.addShape(pres.ShapeType.roundRect, { x: 0.8, y: 3.85, w: 8.4, h: 1.25, fill: { color: theme.primaryDark }, line: { color: theme.gold, width: 2 } });
    s10.addText("THANK YOU FOR LISTENING!", {
      x: 0.8,
      y: 3.98,
      w: 8.4,
      h: 0.45,
      fontSize: 16,
      bold: true,
      color: theme.gold,
      fontFace: "Arial",
      align: "center",
    });
    s10.addText("QUESTIONS & ANSWERS (VIVA VOCE DEFENSE)", {
      x: 0.8,
      y: 4.4,
      w: 8.4,
      h: 0.35,
      fontSize: 13,
      bold: true,
      color: theme.white,
      fontFace: "Arial",
      align: "center",
    });
    s10.addText("The candidate welcomes questions, architectural inquiries, and technical evaluations from the panel.", {
      x: 0.8,
      y: 4.75,
      w: 8.4,
      h: 0.25,
      fontSize: 10,
      color: theme.highlight,
      fontFace: "Arial",
      align: "center",
    });

    // Generate PPTX Buffer
    const buffer = await pres.write({ outputType: "nodebuffer" });

    // Auto-archive in student repository
    await autoArchiveProject({
      userId: creditCheck.userId,
      toolId: 'viva-presentation',
      title: `Viva Defense Presentation Deck: ${topic} (${theme.name})`,
      course,
      institution,
      summary: `10-Slide Widescreen (16:9) defense presentation deck in ${theme.name} theme.`,
      fileType: 'pptx',
    });

    return new NextResponse(new Uint8Array(buffer as Buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="Viva_Defense_Slides_${theme.id}_${course.replace(/\s+/g, "_")}.pptx"`,
        "X-Remaining-Credits": String(creditCheck.remainingCredits),
      },
    });
  } catch (error) {
    console.error("Error generating PPTX:", error);
    return NextResponse.json({ error: "Failed to generate presentation" }, { status: 500 });
  }
}
