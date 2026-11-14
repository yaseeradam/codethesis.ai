"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ClipboardCheck,
  FileText,
  GraduationCap,
  Code2,
  Workflow,
  Presentation,
  MessageSquareQuote,
  Calculator,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Download,
  BookOpen,
  Search,
  Sparkles,
  Zap,
  Users,
  Award,
  ChevronRight,
  Star,
  Layers,
  ArrowUpRight
} from "lucide-react";

interface ToolItem {
  id: string;
  name: string;
  category: "siwes" | "fyp" | "viva" | "coursework";
  tag: string;
  tagColor: string;
  description: string;
  features: string[];
  icon: any;
  iconBg: string;
  iconColor: string;
  href: string;
}

const TOOLS: ToolItem[] = [
  {
    id: "siwes-logbook",
    name: "SIWES Daily Logbook",
    category: "siwes",
    tag: "300L / 400L Favorite",
    tagColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
    description: "Generate 12 to 24 weeks of authentic daily technical records, weekly supervisor summaries, and diagram sketch guides.",
    features: ["12 or 24 Weeks Duration", "Mon-Fri Technical Logs", "Engineering Sketch Guides", "Instant .docx Export"],
    icon: ClipboardCheck,
    iconBg: "bg-cyan-50 border-cyan-200/80 group-hover:bg-cyan-600",
    iconColor: "text-cyan-600 group-hover:text-white",
    href: "/tool/siwes-logbook",
  },
  {
    id: "itf-report",
    name: "ITF Technical Report",
    category: "siwes",
    tag: "30–50 Pages",
    tagColor: "bg-blue-50 text-blue-800 border-blue-200",
    description: "Comprehensive 5-chapter industrial training report with company history, organogram, safety protocols, and project logs.",
    features: ["Standard 5-Chapter Layout", "1.5-Inch Hardcover Margins", "Aligned Table of Contents", "Supervisor Sign-Off Pages"],
    icon: FileText,
    iconBg: "bg-blue-50 border-blue-200/80 group-hover:bg-blue-600",
    iconColor: "text-blue-600 group-hover:text-white",
    href: "/tool/itf-report",
  },
  {
    id: "thesis",
    name: "5-Chapter Thesis",
    category: "fyp",
    tag: "Turnitin-Safe (<8%)",
    tagColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
    description: "Full final year dissertation from Chapter 1 Introduction to Chapter 5 Conclusion with 100% verified real DOI citations.",
    features: ["~18,000+ Words Depth", "Active Crossref DOIs", "Agile SDLC & Data Dictionary", "Hardcover Ready .docx"],
    icon: GraduationCap,
    iconBg: "bg-indigo-50 border-indigo-200/80 group-hover:bg-indigo-600",
    iconColor: "text-indigo-600 group-hover:text-white",
    href: "/tool/thesis",
  },
  {
    id: "software-builder",
    name: "Software & 1-Click Runner",
    category: "fyp",
    tag: "Zero-Pip Install",
    tagColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description: "Generate full working software with database seeds and a double-click run_project.bat script for defense day.",
    features: ["Zero Terminal Anxiety", "SQLite Realistic Seeds", "Interactive UI Dashboard", "Full ZIP Package"],
    icon: Code2,
    iconBg: "bg-emerald-50 border-emerald-200/80 group-hover:bg-emerald-600",
    iconColor: "text-emerald-600 group-hover:text-white",
    href: "/tool/software-builder",
  },
  {
    id: "uml-diagrams",
    name: "UML Diagrams Engine",
    category: "fyp",
    tag: "High Resolution SVG",
    tagColor: "bg-purple-50 text-purple-800 border-purple-200",
    description: "Generate crisp Use Case, Sequence (with row-level locking), 3-Tier Architecture, and Entity-Relationship (ERD) diagrams.",
    features: ["Vector Quality SVGs", "Examiner Defense Notes", "Row-Locking Handshake", "Embed in Chapter 3"],
    icon: Workflow,
    iconBg: "bg-purple-50 border-purple-200/80 group-hover:bg-purple-600",
    iconColor: "text-purple-600 group-hover:text-white",
    href: "/tool/uml-diagrams",
  },
  {
    id: "viva-presentation",
    name: "Viva Presentation Deck",
    category: "viva",
    tag: "15 Slides PPTX",
    tagColor: "bg-orange-50 text-orange-800 border-orange-200",
    description: "Download a structured, editable 15-slide PowerPoint deck with problem scope, architecture diagrams, and defense slides.",
    features: ["16:9 Modern Widescreen", "Midnight & Gold Palette", "Editable Bullet Points", "Instant .pptx Download"],
    icon: Presentation,
    iconBg: "bg-orange-50 border-orange-200/80 group-hover:bg-orange-600",
    iconColor: "text-orange-600 group-hover:text-white",
    href: "/tool/viva-presentation",
  },
  {
    id: "viva-simulator",
    name: "Viva Defense Simulator",
    category: "viva",
    tag: "Mock Oral Defense",
    tagColor: "bg-rose-50 text-rose-800 border-rose-200",
    description: "Interactive oral defense with an AI Strict Supervisor that grills your code, database, and system constraints.",
    features: ["Strict Examiner Persona", "Scoring & Critical Feedback", "Gold-Standard A+ Answers", "20-Question Cheatsheet"],
    icon: MessageSquareQuote,
    iconBg: "bg-rose-50 border-rose-200/80 group-hover:bg-rose-600",
    iconColor: "text-rose-600 group-hover:text-white",
    href: "/tool/viva-simulator",
  },
  {
    id: "assignment-solver",
    name: "Assignment & Proofs",
    category: "coursework",
    tag: "Step-by-Step Proofs",
    tagColor: "bg-sky-50 text-sky-800 border-sky-200",
    description: "Step-by-step problem solver for computer science, engineering, mesh analysis, calculus, and normalization.",
    features: ["1NF to 3NF Decompositions", "Master Theorem Big-O", "Kirchhoff KVL Circuits", "Formatted Submission Docx"],
    icon: Calculator,
    iconBg: "bg-sky-50 border-sky-200/80 group-hover:bg-sky-600",
    iconColor: "text-sky-600 group-hover:text-white",
    href: "/tool/assignment-solver",
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "siwes" | "fyp" | "viva" | "coursework">("all");

  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    const matchesSearch = 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span><b>2025/2026 Academic Session:</b> 14,820+ verified thesis dissertations & SIWES logbooks compiled this semester.</span>
        <Link href="/pricing" className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 underline flex items-center gap-0.5">
          <span>Student Plans from ₦1,500</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200 shadow-sm group-hover:border-cyan-400 transition">
              <Image
                src="/logo.jpg"
                alt="CodeThesis Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">Code</span>
              <span className="text-xl font-black text-cyan-600 tracking-tight">Thesis</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <Link href="/studio" prefetch={false} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Academic Studio</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">New</span>
            </Link>
            <Link href="#tools" className="hover:text-cyan-600 transition-colors">
              All 8 Tools
            </Link>
            <Link href="/tool/siwes-logbook" className="hover:text-cyan-600 transition-colors">
              SIWES Suite
            </Link>
            <Link href="/tool/thesis" className="hover:text-cyan-600 transition-colors">
              5-Chapter Thesis
            </Link>
            <Link href="/tool/software-builder" className="hover:text-cyan-600 transition-colors">
              Software Builder
            </Link>
            <Link href="/pricing" className="hover:text-cyan-600 transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 sm:px-3.5 py-2 rounded-xl transition border border-slate-200/80 shrink-0"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden sm:inline">My Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
            <Link
              href="/pricing"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition shrink-0"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Student Pricing</span>
            </Link>
            <Link
              href="/studio"
              prefetch={false}
              className="inline-flex items-center justify-center text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 sm:px-4 py-2 rounded-xl shadow-sm hover:shadow transition active:scale-95 gap-1.5 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Studio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-16 pb-8 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold mb-6 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Turnitin Similarity &lt;5% • 100% Real Crossref DOIs • 1-Click Code Runner</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Every tool you need to ace your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-cyan-600 to-blue-600">
            University Project & SIWES
          </span>{" "}
          in one place.
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          From 24-week industrial logbooks and ITF reports to 5-chapter dissertations and turnkey software, CodeThesis does the heavy lifting for university students.
        </p>

        {/* Primary Studio Launch Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/studio"
            prefetch={false}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/25 transition active:scale-95"
          >
            <Sparkles className="w-5 h-5 text-cyan-300" />
            <span>Launch Academic Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-200 shadow-sm transition"
          >
            <Layers className="w-4 h-4 text-cyan-600" />
            <span>My Projects</span>
          </Link>
        </div>

        {/* Live Search & Filter Bar */}
        <div className="mt-8 max-w-2xl mx-auto space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any tool: 'logbook', 'thesis', 'uml', 'pptx', 'circuits'..."
              className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-cyan-500 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              All 8 Tools
            </button>
            <button
              onClick={() => setSelectedCategory("siwes")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                selectedCategory === "siwes"
                  ? "bg-cyan-600 text-white border-cyan-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              📋 SIWES & ITF (2)
            </button>
            <button
              onClick={() => setSelectedCategory("fyp")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                selectedCategory === "fyp"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              🎓 Final Year Projects (3)
            </button>
            <button
              onClick={() => setSelectedCategory("viva")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                selectedCategory === "viva"
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              🎙️ Viva & Defense (2)
            </button>
            <button
              onClick={() => setSelectedCategory("coursework")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                selectedCategory === "coursework"
                  ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              🧮 Assignments & Proofs (1)
            </button>
          </div>
        </div>
      </section>

      {/* The 8 Big Tool Cards Grid (iLovePDF Style Elevated) */}
      <section id="tools" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 w-full">
        {filteredTools.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
            <Search className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No matching tool found</h3>
            <p className="text-xs text-slate-500">
              Try searching for "logbook", "thesis", "code", or click "All 8 Tools" to see everything.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
              className="text-xs font-bold text-cyan-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative bg-white border border-slate-200/90 hover:border-cyan-400 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-13 h-13 rounded-2xl border flex items-center justify-center transition-colors duration-200 ${tool.iconBg}`}
                      >
                        <Icon className={`w-6 h-6 transition-colors duration-200 ${tool.iconColor}`} />
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${tool.tagColor}`}
                      >
                        {tool.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 group-hover:text-cyan-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed min-h-[48px]">
                      {tool.description}
                    </p>

                    {/* Feature chips list */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                      {tool.features.map((feat, i) => (
                        <div key={i} className="flex items-center text-[11px] text-slate-600 font-medium gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-cyan-600 group-hover:text-cyan-700">
                    <span>Open Generator</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* The 5-Step Academic Workflow Graphic */}
      <section className="py-16 bg-white border-y border-slate-200/80 my-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">Zero Stress Pipeline</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              How CodeThesis Powers Your Entire Session
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Follow the proven 5-stage university workflow to guarantee an A-grade without burnout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2 relative">
              <span className="w-7 h-7 rounded-xl bg-cyan-600 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h4 className="font-bold text-slate-900 text-sm">SIWES & Attachment</h4>
              <p className="text-xs text-slate-500">24-week daily logs with sketch guides and 45-page ITF report ready for defense.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2 relative">
              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h4 className="font-bold text-slate-900 text-sm">Chapters 1–3 Proposal</h4>
              <p className="text-xs text-slate-500">Formulate 5 objectives and literature review with active DOIs to pass proposal defense.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2 relative">
              <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h4 className="font-bold text-slate-900 text-sm">UML & Architecture</h4>
              <p className="text-xs text-slate-500">Use Case, Sequence with row-locking, and ERD diagrams embedded into Chapter 3.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2 relative">
              <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">4</span>
              <h4 className="font-bold text-slate-900 text-sm">Working Codebase</h4>
              <p className="text-xs text-slate-500">Double-click run_project.bat to launch your database and system locally without pip errors.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2 relative">
              <span className="w-7 h-7 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center justify-center">5</span>
              <h4 className="font-bold text-slate-900 text-sm">Viva Voce Mastery</h4>
              <p className="text-xs text-slate-500">15-slide PowerPoint deck and simulated oral defense practice against strict supervisors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-start gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">100% Real Citations</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  All literature references are verified with active DOIs from Crossref and Semantic Scholar. Zero fake papers.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-start gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Instant Word (.docx) Export</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pre-formatted with 1.5-inch hardcover binding margins, Times New Roman, and official university tables.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-start gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Defense-Ready Code</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Working software with database seeds and a double-click run_project.bat script for zero terminal anxiety during defense.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 text-center text-xs text-slate-500 space-y-3">
        <div className="flex items-center justify-center gap-6 font-semibold text-slate-600">
          <Link href="/tool/siwes-logbook" className="hover:text-cyan-600">SIWES Logbook</Link>
          <Link href="/tool/itf-report" className="hover:text-cyan-600">ITF Report</Link>
          <Link href="/tool/thesis" className="hover:text-cyan-600">5-Chapter Thesis</Link>
          <Link href="/tool/software-builder" className="hover:text-cyan-600">Software Builder</Link>
          <Link href="/pricing" className="hover:text-cyan-600">Pricing & Student Plans</Link>
        </div>
        <p>© 2026 CodeThesis AI. Engineered for university and polytechnic students everywhere.</p>
      </footer>
    </div>
  );
}
