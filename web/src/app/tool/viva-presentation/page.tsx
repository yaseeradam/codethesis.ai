"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Presentation,
  Download,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  School,
  User,
  Layers,
  ChevronRight,
} from "lucide-react";

const COURSES = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Cybersecurity",
  "Electrical & Electronic Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Microbiology",
  "Biochemistry",
  "Accounting",
  "Business Administration",
  "Economics",
  "Mass Communication",
];

export default function VivaPresentationPage() {
  const [topic, setTopic] = useState("Design and Implementation of an Automated Hostel Allocation and Facility Management System");
  const [course, setCourse] = useState("Computer Science");
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [institution, setInstitution] = useState("Federal University of Technology, Akure");
  const [studentName, setStudentName] = useState("CHIDI EZE");
  const [matricNumber, setMatricNumber] = useState("FUTA/CSC/20/4182");
  const [supervisor, setSupervisor] = useState("Dr. A. O. Adebayo");
  const [session, setSession] = useState("2025/2026");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(true);
  const [activeSlide, setActiveSlide] = useState(1);

  const SLIDES = [
    {
      num: 1,
      title: "Title & Student Details",
      category: "Cover",
      summary: `${topic.toUpperCase()} — By ${studentName} (${matricNumber}) under the supervision of ${supervisor}, ${institution}.`,
    },
    {
      num: 2,
      title: "Background of the Study",
      category: "Introduction",
      summary: "Surging tertiary enrollments versus static hostel infrastructure; failure of manual paper queues and ledger records.",
    },
    {
      num: 3,
      title: "Statement of the Problem",
      category: "Introduction",
      summary: "3–5 days administrative queuing latency, concurrent double-booking of bedspaces, and disconnected facility maintenance logging.",
    },
    {
      num: 4,
      title: "Aim and 5 Specific Objectives",
      category: "Introduction",
      summary: "Aim: Automated allocation system. Specific Objectives: Analyze manual workflow, model transactional database, implement allocation engine, integrate maintenance ticketing, validate with UAT.",
    },
    {
      num: 5,
      title: "Literature Review & Citations",
      category: "Literature",
      summary: "Al-Nuaimi et al. (IEEE Trans. Services Computing, 2022) on transaction locking; Adebayo & Ogundele (2021); Mensah & Boateng (2024); identified research gap.",
    },
    {
      num: 6,
      title: "Decoupled 3-Tier Architecture",
      category: "Methodology",
      summary: "Presentation Layer (React/Tailwind), Application Logic Layer (FastAPI/Node), and Persistence Data Layer (PostgreSQL/SQLite).",
    },
    {
      num: 7,
      title: "Database Schema & ERD",
      category: "System Design",
      summary: "Primary entity tables: Users, Hostels, Rooms, Allocations, and Maintenance Tickets with foreign key integrity constraints.",
    },
    {
      num: 8,
      title: "Live Demonstration Highlights",
      category: "Implementation",
      summary: "1-Click defense runner (run_project.bat), real-time bedspace inventory allocator, and digital maintenance issue tracking.",
    },
    {
      num: 9,
      title: "Concurrency Testing & Results",
      category: "Testing",
      summary: "Simulated 250 concurrent requests competing for 4 beds; 0 race conditions, 100% allocation accuracy, 95% UAT satisfaction.",
    },
    {
      num: 10,
      title: "Conclusion & Future Work (Q&A)",
      category: "Conclusion",
      summary: "92% reduction in registration latency, zero double-allocations. Future work: Mobile apps and IoT biometric door locks. Thank you & Q&A.",
    },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 1400);
  };

  const handleDownloadPptx = async () => {
    setIsDownloading(true);
    try {
      // Auto-save to student dashboard history
      fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "viva-presentation",
          title: topic || "15-Slide Viva Defense Deck",
          course: course || "Computer Science",
          institution: institution || "Federal University of Technology, Akure",
          fileType: "pptx",
          summary: `15-slide PowerPoint defense presentation for ${topic} with problem formulation, architecture, and examiner Q&A slides.`,
        }),
      }).catch(e => console.warn("Auto-save note:", e));

      const res = await fetch("/api/generate-viva-pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          course,
          institution,
          studentName,
          matricNumber,
          supervisor,
          session,
        }),
      });
      if (!res.ok) throw new Error("Failed to download presentation");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Viva_Defense_Slides_${course.replace(/\s+/g, "_")}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Could not download presentation deck. Please try again.");
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
            <span>All Tools</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200">
              <Image src="/logo.jpg" alt="Logo" width={28} height={28} className="object-cover" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">CodeThesis</span>
          </div>

          <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            Viva Suite • Tool #6
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-10 w-full flex-1">
        {/* Academic Studio Callout Banner */}
        <div className="mb-8 max-w-3xl mx-auto bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border border-amber-700/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                New: CodeThesis Academic Studio
                <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Slide Studio</span>
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                Preview your 15-slide widescreen defense deck with interactive carousel and mock supervisor Q&A simulator.
              </p>
            </div>
          </div>
          <Link
            href="/studio?tab=viva"
            prefetch={false}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-amber-950 font-bold text-xs shrink-0 transition shadow-sm active:scale-95"
          >
            <span>Open in Studio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tool Box */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
            <Presentation className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Viva Defense Presentation Deck Generator
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
            Generate an editable PowerPoint slide deck (.pptx) summarizing Chapters 1 to 5 with project architecture, testing data, and supervisor notes.
          </p>

          {/* Form */}
          <div className="mt-8 space-y-5 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Project Title
              </label>
              <textarea
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Department / Course
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCourse(!isCustomCourse);
                      if (!isCustomCourse) setCourse("");
                    }}
                    className="text-xs font-semibold text-orange-600 hover:underline"
                  >
                    {isCustomCourse ? "Choose from list" : "Type custom course"}
                  </button>
                </div>
                {isCustomCourse ? (
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Enter your course / discipline"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                ) : (
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Institution / University
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Federal University of Technology, Akure"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Matriculation Number
                </label>
                <input
                  type="text"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Project Supervisor
                </label>
                <input
                  type="text"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Academic Session
                </label>
                <input
                  type="text"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-4 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing 15-Slide Presentation Deck...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate PowerPoint Presentation (.PPTX)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Slide Viewer */}
        {isGenerated && (
          <div className="mt-10 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Presentation Ready</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    16:9 Widescreen • 15 Slides • Brand Colors
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1 line-clamp-1">
                  {topic}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadPptx}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 text-sm font-bold bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Compiling Slides...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download PowerPoint (.pptx)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Slide Explorer */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Slide List */}
              <div className="md:col-span-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5 max-h-[420px] overflow-y-auto">
                <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Slide Sequence
                </span>
                {SLIDES.map((s) => (
                  <button
                    key={s.num}
                    onClick={() => setActiveSlide(s.num)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                      activeSlide === s.num
                        ? "bg-slate-900 text-white font-bold shadow-sm"
                        : "bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="truncate">
                      <span className="text-[10px] opacity-70 block">{s.category}</span>
                      <span className="truncate">{s.num}. {s.title}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-50" />
                  </button>
                ))}
              </div>

              {/* Selected Slide Visual Mock */}
              <div className="md:col-span-2 bg-[#0B132B] text-white rounded-2xl p-6 border border-slate-800 shadow-lg flex flex-col justify-between aspect-[16/9]">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                      Slide {activeSlide} of 15 • {SLIDES[activeSlide - 1]?.category}
                    </span>
                    <span className="text-[11px] text-amber-400 font-semibold">
                      Viva Defense Master Deck
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">
                    {SLIDES[activeSlide - 1]?.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    {SLIDES[activeSlide - 1]?.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>CodeThesis AI Slide Generator</span>
                  <span>{course} • {session}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>© 2026 CodeThesis AI. Official 15-Slide PowerPoint Viva Defense Deck Generator.</p>
      </footer>
    </div>
  );
}
