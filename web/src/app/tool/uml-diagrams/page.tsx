"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Workflow,
  Sparkles,
  Download,
  Copy,
  Check,
  Code2,
  Layers,
  FileCode,
  Eye,
  BookOpen,
  ArrowRight,
  Database,
  Server,
  Monitor,
  User,
  ShieldCheck,
  ArrowUpDown
} from "lucide-react";

const COURSES = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Cybersecurity",
  "Computer Engineering",
  "Electrical & Electronic Engineering",
  "Data Science & AI",
  "Information Systems",
];

interface DiagramTemplate {
  title: string;
  type: string;
  chapterSection: string;
  mermaidCode: string;
  explanation: string;
}

const DIAGRAM_TEMPLATES: Record<string, DiagramTemplate> = {
  usecase: {
    title: "Use Case Diagram",
    type: "UML Behavioral Model",
    chapterSection: "Section 3.2.1 (System Functional Boundary)",
    mermaidCode: `flowchart LR
    Student((Student))
    Admin((System Admin))
    Staff((Faculty Staff))

    subgraph System Boundary: Institutional Web Portal
        UC1[Register & Authenticate]
        UC2[Submit Clearance Request]
        UC3[Process Fee Payment]
        UC4[View Academic Status]
        UC5[Upload Verified Credentials]
        UC6[Manage User Accounts & Roles]
        UC7[Review & Approve Applications]
        UC8[Generate Certified Transcripts]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5

    Admin --> UC1
    Admin --> UC6
    Admin --> UC7

    Staff --> UC1
    Staff --> UC7
    Staff --> UC8`,
    explanation:
      "This Use Case diagram illustrates the primary actors (Student, Administrator, and Staff) interacting with the core functional boundaries of the automated system. It documents actor authorizations and functional boundaries for Section 3.2.1 of Chapter 3.",
  },
  sequence: {
    title: "Sequence Diagram: Transaction & Resource Allocation",
    type: "UML Dynamic Interaction",
    chapterSection: "Section 3.2.3 (Dynamic Behavioral Protocol)",
    mermaidCode: `sequenceDiagram
    autonumber
    actor Student
    participant UI as Frontend Client (React)
    participant API as Backend Controller (FastAPI)
    participant Service as Business Engine
    participant DB as Relational Database (PostgreSQL)

    Student->>UI: Selects Resource & Submits Request
    UI->>API: POST /api/v1/allocate (JWT Bearer Auth)
    API->>Service: processAllocation(studentId, resourceId)
    Service->>DB: BEGIN TRANSACTION (SELECT FOR UPDATE)
    Note over DB: Row-level lock prevents double allocation race conditions
    DB-->>Service: resourceRecord (status == 'AVAILABLE')
    Service->>DB: INSERT INTO allocations (student_id, resource_id, status='ACTIVE')
    Service->>DB: UPDATE resources SET status = 'ALLOCATED', count = count + 1
    Service->>DB: COMMIT TRANSACTION
    DB-->>Service: Transaction Committed (Success)
    Service-->>API: 201 Created (allocationPayload)
    API-->>UI: JSON {status: 'SUCCESS', allocationId: 'REC-2026-9041'}
    UI-->>Student: Displays Confirmation Slip & Download Receipt`,
    explanation:
      "This Sequence diagram traces the chronological message exchange for concurrent transaction processing, emphasizing transactional row-level database locking to prevent race conditions. Crucial for defending concurrency and reliability before the viva panel.",
  },
  architecture: {
    title: "3-Tier System Architecture Diagram",
    type: "Structural / Component",
    chapterSection: "Section 3.3 (Architectural Decomposition)",
    mermaidCode: `flowchart TD
    subgraph Presentation Tier: Client Layer
        A[Mobile Web Browser / PWA]
        B[Desktop Web Portal (Next.js)]
        C[Administrative Management Dashboard]
    end

    subgraph Application Tier: Logic & Microservices
        D[API Gateway & Rate Limiter]
        E[JWT Authentication & RBAC Filter]
        F[Core Business Transaction Engine]
        G[Background Queue & Notification Worker]
    end

    subgraph Data Tier: Persistence & Caching
        H[(Primary PostgreSQL Database)]
        I[(Redis In-Memory Cache & Distributed Lock)]
        J[S3 Compatible Object Storage]
    end

    A & B & C -->|HTTPS / TLS 1.3 / JSON REST| D
    D --> E
    E --> F & G
    F -->|Prisma ORM / Connection Pool| H
    F -->|Key-Value Store| I
    G -->|Signed URLs| J`,
    explanation:
      "This 3-Tier Architectural diagram shows the physical and logical decoupling between the Presentation Tier (Next.js/React), Application Logic Tier (FastAPI/Node), and Data Tier (PostgreSQL + Redis). Use in Section 3.3 of Chapter 3.",
  },
  erd: {
    title: "Entity-Relationship Diagram (ERD)",
    type: "Data Architecture",
    chapterSection: "Section 3.4 (Relational Schema & Data Dictionary)",
    mermaidCode: `erDiagram
    STUDENT ||--o{ ALLOCATION : receives
    DEPARTMENT ||--|{ STUDENT : enrolls
    DEPARTMENT ||--|{ FACILITY : manages
    FACILITY ||--o{ ALLOCATION : assigns
    STUDENT ||--o{ AUDIT_LOG : triggers

    STUDENT {
        uuid id PK
        string matric_number UK
        string full_name
        string email UK
        int academic_level
        uuid department_id FK
    }

    DEPARTMENT {
        uuid id PK
        string code UK
        string faculty_name
        string head_of_department
    }

    FACILITY {
        uuid id PK
        string facility_code
        int capacity
        int occupied_count
        string status
        uuid department_id FK
    }

    ALLOCATION {
        uuid id PK
        uuid student_id FK
        uuid facility_id FK
        timestamp allocated_at
        string verification_token
        string status
    }

    AUDIT_LOG {
        uuid id PK
        uuid student_id FK
        string action_type
        string ip_address
        timestamp created_at
    }`,
    explanation:
      "This Entity-Relationship Diagram defines the relational cardinality (1-to-many) between Students, Departments, Facilities, Allocations, and Audit Logs. Use in Section 3.4 of Chapter 3 alongside your Data Dictionary.",
  },
};

export default function UmlDiagramsPage() {
  const [topic, setTopic] = useState("Automated Allocation and Clearance Management System");
  const [course, setCourse] = useState("Computer Science");
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("usecase");
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const activeDiagram = DIAGRAM_TEMPLATES[selectedType] || DIAGRAM_TEMPLATES.usecase;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeDiagram.mermaidCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadMermaid = async () => {
    setIsDownloading(true);
    try {
      // Auto-save to student dashboard projects history
      fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "uml-diagrams",
          title: `UML Diagram: ${activeDiagram.title} (${topic})`,
          course: course || "Computer Science",
          institution: "University",
          fileType: "mermaid",
          summary: `${activeDiagram.type} generated for ${topic}. Ready for Chapter 3 academic write-up.`,
        }),
      }).catch((e) => console.warn("Auto-save note:", e));

      const blob = new Blob([activeDiagram.mermaidCode], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedType}_diagram_${(course || "UML").replace(/\s+/g, "_")}.mmd`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Download failed. Please copy the code directly.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">All Tools</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200">
              <Image src="/logo.jpg" alt="Logo" width={28} height={28} className="object-cover" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">CodeThesis</span>
          </div>

          <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            FYP Suite • Tool #5
          </div>
        </div>
      </header>

      {/* Academic Studio Callout Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white border-b border-purple-800">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-purple-400/30">
              Interactive IDE
            </span>
            <span>
              Need the full 5-chapter dissertation with embedded diagrams? Open the <strong>Academic Studio</strong>.
            </span>
          </div>
          <Link
            href="/studio?tab=uml"
            prefetch={false}
            className="inline-flex items-center gap-1.5 bg-purple-500 hover:bg-purple-400 text-white font-bold px-3 py-1.5 rounded-xl transition text-xs shadow-sm shrink-0"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-10 w-full flex-1 space-y-8">
        {/* Tool Config Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Workflow className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  UML & System Architecture Generator
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Generate formal, supervisor-compliant software modeling artifacts for Chapter 3.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2.5 py-1 rounded-full">
                ✓ Chapter 3 Standard
              </span>
            </div>
          </div>

          {/* Form Controls */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Project / Thesis Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Design and Implementation of an Automated Hostel Allocation..."
                className="w-full text-xs sm:text-sm font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Course of Study
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCourse(!isCustomCourse)}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 underline transition"
                >
                  {isCustomCourse ? "Select from list" : "Course not in list? Type here"}
                </button>
              </div>

              {isCustomCourse ? (
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Type your exact course (e.g. Mechatronics Engineering)"
                  className="w-full text-xs sm:text-sm font-medium border border-purple-300 rounded-xl px-3.5 py-2.5 bg-purple-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              ) : (
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                >
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Diagram Type Selector Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Select Architectural Artifact
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => setSelectedType("usecase")}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 ${
                  selectedType === "usecase"
                    ? "bg-purple-50 border-purple-500 text-purple-900 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <User className="w-4 h-4 text-purple-600" />
                <span>Use Case Diagram</span>
              </button>

              <button
                onClick={() => setSelectedType("sequence")}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 ${
                  selectedType === "sequence"
                    ? "bg-purple-50 border-purple-500 text-purple-900 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <ArrowUpDown className="w-4 h-4 text-purple-600" />
                <span>Sequence Diagram</span>
              </button>

              <button
                onClick={() => setSelectedType("architecture")}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 ${
                  selectedType === "architecture"
                    ? "bg-purple-50 border-purple-500 text-purple-900 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Layers className="w-4 h-4 text-purple-600" />
                <span>3-Tier Architecture</span>
              </button>

              <button
                onClick={() => setSelectedType("erd")}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1.5 ${
                  selectedType === "erd"
                    ? "bg-purple-50 border-purple-500 text-purple-900 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Database className="w-4 h-4 text-purple-600" />
                <span>Database ERD</span>
              </button>
            </div>
          </div>
        </div>

        {/* Output Diagram Preview */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {activeDiagram.type}
                </span>
                <span className="text-xs text-slate-400 font-medium">{activeDiagram.chapterSection}</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                {activeDiagram.title}
              </h2>
            </div>

            {/* Toggle Modes and Download */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode("visual")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === "visual"
                      ? "bg-white text-purple-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visual Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("code")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === "code"
                      ? "bg-white text-purple-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Mermaid Code</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl transition-all"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isDownloading}
                onClick={handleDownloadMermaid}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? "Saving..." : "Download (.mmd)"}</span>
              </button>
            </div>
          </div>

          {/* Supervisor Defense Guide Box */}
          <div className="mt-5 bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 text-xs text-purple-950 leading-relaxed font-medium">
            💡 <strong>Supervisor & Panel Defense Guide:</strong> {activeDiagram.explanation}
          </div>

          {/* Diagram Content Area */}
          <div className="mt-6">
            {viewMode === "visual" ? (
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-inner min-h-[380px] flex flex-col justify-center">
                {selectedType === "usecase" && (
                  <div className="space-y-6">
                    <div className="text-center text-xs font-mono text-purple-400 font-bold uppercase tracking-wider mb-2">
                      System Boundary: {topic || "Institutional Portal"}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      {/* Left Actors */}
                      <div className="md:col-span-3 space-y-4 text-center">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2 text-base">
                            👤
                          </div>
                          <p className="font-bold text-xs text-white">Student Actor</p>
                          <p className="text-[11px] text-slate-400">Primary Initiator</p>
                        </div>
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 text-base">
                            👔
                          </div>
                          <p className="font-bold text-xs text-white">Faculty Staff</p>
                          <p className="text-[11px] text-slate-400">Reviewer / Verifier</p>
                        </div>
                      </div>

                      {/* Center Boundary Box */}
                      <div className="md:col-span-6 bg-slate-950/80 border-2 border-dashed border-purple-500/40 rounded-3xl p-5 space-y-3">
                        <div className="grid grid-cols-2 gap-2.5 text-center">
                          {[
                            "UC1: Register & Login",
                            "UC2: Submit Application",
                            "UC3: Process Payments",
                            "UC4: Status Verification",
                            "UC5: Upload Documents",
                            "UC6: Audit & Logging",
                            "UC7: Approve Allocations",
                            "UC8: Download Transcripts",
                          ].map((uc, i) => (
                            <div
                              key={i}
                              className="bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 rounded-xl py-2 px-3 text-[11px] font-semibold text-purple-200 transition"
                            >
                              {uc}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Actor */}
                      <div className="md:col-span-3 space-y-4 text-center">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 text-base">
                            🛡️
                          </div>
                          <p className="font-bold text-xs text-white">System Administrator</p>
                          <p className="text-[11px] text-slate-400">Privileged Controller</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedType === "sequence" && (
                  <div className="space-y-4">
                    <div className="text-center text-xs font-mono text-purple-400 font-bold uppercase tracking-wider mb-2">
                      Dynamic Message Flow & Concurrency Lock
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold pb-3 border-b border-slate-800">
                      <div className="bg-slate-800 py-2 rounded-xl text-purple-300">1. Student Client</div>
                      <div className="bg-slate-800 py-2 rounded-xl text-sky-300">2. API Gateway</div>
                      <div className="bg-slate-800 py-2 rounded-xl text-amber-300">3. Business Service</div>
                      <div className="bg-slate-800 py-2 rounded-xl text-emerald-300">4. PostgreSQL DB</div>
                    </div>

                    <div className="space-y-2.5 pt-2 text-xs font-mono">
                      {[
                        { step: "01", from: "Student", to: "API", label: "POST /api/v1/allocate (JWT Bearer Token)" },
                        { step: "02", from: "API", to: "Service", label: "processAllocation(studentId, resourceId)" },
                        { step: "03", from: "Service", to: "DB", label: "BEGIN TRANSACTION (SELECT FOR UPDATE)" },
                        { step: "04", from: "DB", to: "Service", label: "Row Locked: Available Bed > 0 Verified" },
                        { step: "05", from: "Service", to: "DB", label: "INSERT INTO allocations & COMMIT" },
                        { step: "06", from: "API", to: "Student", label: "201 Created: JSON { status: 'SUCCESS' }" },
                      ].map((seq, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5"
                        >
                          <span className="text-purple-400 font-bold">{seq.step}</span>
                          <span className="text-slate-300 truncate max-w-[280px] sm:max-w-md">{seq.label}</span>
                          <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full shrink-0">
                            {seq.from} ➔ {seq.to}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedType === "architecture" && (
                  <div className="space-y-5">
                    <div className="text-center text-xs font-mono text-purple-400 font-bold uppercase tracking-wider mb-2">
                      3-Tier Enterprise Architectural Stack
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Presentation */}
                      <div className="bg-slate-800/80 border border-sky-500/30 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase">
                          <Monitor className="w-4 h-4" />
                          <span>Presentation Tier</span>
                        </div>
                        <p className="text-[11px] text-slate-400">Next.js Client, React SPA, Mobile Viewport</p>
                        <div className="space-y-1.5 text-xs">
                          <div className="bg-slate-900 rounded-lg p-2 text-slate-300">Responsive UI Components</div>
                          <div className="bg-slate-900 rounded-lg p-2 text-slate-300">Client State Hydration</div>
                          <div className="bg-slate-900 rounded-lg p-2 text-slate-300">Form Validation Engine</div>
                        </div>
                      </div>

                      {/* Logic */}
                      <div className="bg-slate-800/80 border border-purple-500/30 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase">
                          <Server className="w-4 h-4" />
                          <span>Application Tier</span>
                        </div>
                        <p className="text-[11px] text-slate-400">FastAPI / Node Microservice Controllers</p>
                        <div className="space-y-1.5 text-xs">
                          <div className="bg-slate-900 rounded-lg p-2 text-slate-300">JWT & RBAC Middleware</div>
                          <div className="bg-slate-900 rounded-lg p-2 text-slate-300">Allocation Logic Engine</div>
                          <div className="bg-slate-900 rounded-lg p-2 text-slate-300">Asynchronous Job Workers</div>
                        </div>
                      </div>

                      {/* Data */}
                      <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                          <Database className="w-4 h-4" />
                          <span>Persistence Tier</span>
                        </div>
                        <p className="text-[11px] text-slate-400">PostgreSQL Relational DB & Redis Cache</p>
                        <div className="space-y-1.5 text-xs">
                          <div className="bg-slate-900 rounded-lg p-2 text-slate-300">ACID Transaction Pool</div>
                          <div className="bg-slate-900 rounded-lg p-2 text-slate-300">Distributed Session Cache</div>
                          <div className="bg-slate-900 rounded-lg p-2 text-slate-300">Encrypted Blob Storage</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedType === "erd" && (
                  <div className="space-y-5">
                    <div className="text-center text-xs font-mono text-purple-400 font-bold uppercase tracking-wider mb-2">
                      Entity-Relationship Schema (Cardinality & Foreign Keys)
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Entity 1 */}
                      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3.5 space-y-2">
                        <div className="bg-purple-900/60 text-purple-200 font-bold text-xs p-1.5 rounded-lg text-center">
                          STUDENT (Entity)
                        </div>
                        <div className="space-y-1 text-[11px] font-mono text-slate-300">
                          <div className="flex justify-between text-amber-400 font-bold"><span>id</span><span>UUID [PK]</span></div>
                          <div className="flex justify-between"><span>matric_no</span><span>VARCHAR [UK]</span></div>
                          <div className="flex justify-between"><span>full_name</span><span>VARCHAR</span></div>
                          <div className="flex justify-between text-sky-400"><span>dept_id</span><span>UUID [FK]</span></div>
                        </div>
                      </div>

                      {/* Entity 2 */}
                      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3.5 space-y-2">
                        <div className="bg-emerald-900/60 text-emerald-200 font-bold text-xs p-1.5 rounded-lg text-center">
                          FACILITY (Entity)
                        </div>
                        <div className="space-y-1 text-[11px] font-mono text-slate-300">
                          <div className="flex justify-between text-amber-400 font-bold"><span>id</span><span>UUID [PK]</span></div>
                          <div className="flex justify-between"><span>code</span><span>VARCHAR [UK]</span></div>
                          <div className="flex justify-between"><span>capacity</span><span>INT</span></div>
                          <div className="flex justify-between text-sky-400"><span>dept_id</span><span>UUID [FK]</span></div>
                        </div>
                      </div>

                      {/* Entity 3 */}
                      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3.5 space-y-2">
                        <div className="bg-sky-900/60 text-sky-200 font-bold text-xs p-1.5 rounded-lg text-center">
                          ALLOCATION (Bridge)
                        </div>
                        <div className="space-y-1 text-[11px] font-mono text-slate-300">
                          <div className="flex justify-between text-amber-400 font-bold"><span>id</span><span>UUID [PK]</span></div>
                          <div className="flex justify-between text-sky-400"><span>student_id</span><span>UUID [FK]</span></div>
                          <div className="flex justify-between text-sky-400"><span>facility_id</span><span>UUID [FK]</span></div>
                          <div className="flex justify-between"><span>status</span><span>VARCHAR</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 overflow-x-auto font-mono text-xs leading-relaxed border border-slate-800 shadow-inner">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Code2 className="w-3.5 h-3.5 text-purple-400" />
                    Mermaid UML Source Code
                  </span>
                  <span>Paste into Word Doc or Mermaid.live</span>
                </div>
                <pre>{activeDiagram.mermaidCode}</pre>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>© 2026 CodeThesis AI. Official Academic Architecture & UML Diagram Engine.</p>
      </footer>
    </div>
  );
}
