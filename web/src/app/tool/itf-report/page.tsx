"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  FileText,
  Building2,
  GraduationCap,
  Sparkles,
  Download,
  BookOpen,
  Calendar,
  School,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Check,
  ArrowRight
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
  "Mass Communication",
];

export default function ItfReportPage() {
  const [studentName, setStudentName] = useState("CHIDI EZE");
  const [matricNumber, setMatricNumber] = useState("FUTA/CSC/20/4182");
  const [institution, setInstitution] = useState("Federal University of Technology, Akure");
  const [course, setCourse] = useState("Computer Science");
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [company, setCompany] = useState("MTN Nigeria Communications Plc");
  const [department, setDepartment] = useState("Network Infrastructure & Systems Unit");
  const [duration, setDuration] = useState("24 Weeks (6 Months)");
  const [session, setSession] = useState("2025/2026");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(true);
  const [activeChapter, setActiveChapter] = useState(1);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
      setActiveChapter(1);
    }, 1200);
  };

  const handleDownloadDocx = async () => {
    setIsDownloading(true);
    try {
      // Auto-save to student dashboard projects history
      fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "itf-report",
          title: `ITF Technical Report: ${company}`,
          course: course || "General Studies",
          institution: institution || "University",
          fileType: "docx",
          summary: `Comprehensive ITF SIWES Technical Defense Report for ${studentName} (${matricNumber}) at ${company}.`,
        }),
      }).catch((e) => console.warn("Auto-save note:", e));

      const res = await fetch("/api/generate-itf-report-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          matricNumber,
          institution,
          course: course || "General Studies",
          company,
          department,
          duration,
          session,
        }),
      });
      if (!res.ok) throw new Error("Failed to download report");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ITF_Technical_Report_${(course || "Report").replace(/\s+/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Could not download document. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const CHAPTERS = [
    { id: 0, title: "Cover & Prelims", wordCount: "850 words", desc: "Title, Certification, Dedication, Acknowledgments" },
    { id: 1, title: "Chapter 1: Background & Org", wordCount: "2,400 words", desc: "ITF background, establishment history, organogram" },
    { id: 2, title: "Chapter 2: Rotations & Safety", wordCount: "1,950 words", desc: "Departmental SOPs, HSE rules & safety gears" },
    { id: 3, title: "Chapter 3: Technical Projects", wordCount: "3,800 words", desc: "Structured cabling, VLANs, routing, server maintenance" },
    { id: 4, title: "Chapter 4: Problems & Solutions", wordCount: "1,750 words", desc: "DHCP pool exhaustion, duplex fixes, troubleshooting" },
    { id: 5, title: "Chapter 5: Conclusions & Recs", wordCount: "1,600 words", desc: "Summary, ITF recommendations & company suggestions" },
    { id: 6, title: "Table of Contents (Aligned)", wordCount: "Index", desc: "2-Column borderless aligned page index" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
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

          <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            SIWES Suite • Tool #2
          </div>
        </div>
      </header>

      {/* Academic Studio Callout Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border-b border-blue-900/40">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-400/30">
              Complete Final Year Suite
            </span>
            <span>
              Writing your final year project write-up or coding the software? Open the <strong>Academic Studio</strong>.
            </span>
          </div>
          <Link
            href="/studio"
            prefetch={false}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-1.5 rounded-xl transition text-xs shadow-sm shrink-0"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Tool Content */}
      <main className="max-w-6xl mx-auto px-4 py-10 w-full flex-1">
        {/* Tool Header Box */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ITF Technical Report Generator
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
            Generate an authentic 30–50 page comprehensive industrial training report with 1.5-inch left binding margins, official preliminary pages, and 5 chapters.
          </p>

          {/* Form */}
          <div className="mt-8 space-y-5 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Student Full Name (All Caps)
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-slate-400" />
                  Institution / University
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    Course of Study
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCourse(!isCustomCourse);
                      if (!isCustomCourse) setCourse("");
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                  >
                    {isCustomCourse ? "Choose from list" : "Can't find course? Type it"}
                  </button>
                </div>

                {isCustomCourse ? (
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Enter course (e.g. Mechatronics, Pharmacy, Civil Eng)"
                    className="w-full bg-slate-50 border-2 border-blue-400 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white shadow-xs"
                    autoFocus
                  />
                ) : (
                  <select
                    value={course}
                    onChange={(e) => {
                      if (e.target.value === "OTHER") {
                        setIsCustomCourse(true);
                        setCourse("");
                      } else {
                        setCourse(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="OTHER">✍️ Other (Type custom course...)</option>
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  Company / Establishment
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Department / Unit
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  SIWES Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="24 Weeks (6 Months)">24 Weeks (6 Months - 400 Level)</option>
                  <option value="12 Weeks (3 Months)">12 Weeks (3 Months - 300 Level)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Academic Session
                </label>
                <input
                  type="text"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing 5 Deep Chapters & Technical Logs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Full Technical Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Report Result Preview with Clickable Chapters */}
        {isGenerated && (
          <div className="mt-12 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Report Compiled Successfully</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    5 Detailed Chapters • ~13,000+ Words • 1.5" Binding Margins
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  SIWES Technical Report: {company}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadDocx}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all active:scale-95"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Compiling Word Document...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Word (.docx)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Interactive Chapters Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Clickable Chapter Buttons */}
              <div className="md:col-span-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2">
                <div className="px-2 py-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Click Any Chapter to Read Full Content:
                  </h4>
                </div>
                {CHAPTERS.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setActiveChapter(ch.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      activeChapter === ch.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-md scale-[1.01]"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${activeChapter === ch.id ? "text-white" : "text-slate-900"}`}>
                        {ch.title}
                      </p>
                      <p className={`text-[11px] truncate max-w-[200px] mt-0.5 ${activeChapter === ch.id ? "text-blue-100" : "text-slate-500"}`}>
                        {ch.desc}
                      </p>
                      <span className={`inline-block text-[10px] font-semibold mt-1 px-1.5 py-0.2 rounded ${
                        activeChapter === ch.id ? "bg-blue-700 text-blue-100" : "bg-slate-100 text-slate-600"
                      }`}>
                        {ch.wordCount}
                      </span>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${activeChapter === ch.id ? "text-white" : "text-slate-400"}`} />
                  </button>
                ))}
              </div>

              {/* Right Column: Active Chapter Dynamic Excerpt View */}
              <div className="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs font-serif text-slate-800 text-sm sm:text-base leading-relaxed space-y-6 max-h-[620px] overflow-y-auto">
                {activeChapter === 0 && (
                  <div className="space-y-6">
                    <div className="text-center border-b border-slate-200 pb-6 font-sans">
                      <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 uppercase">
                        {institution}
                      </h3>
                      <p className="text-sm font-semibold text-slate-600 mt-1">
                        DEPARTMENT OF {course.toUpperCase()}
                      </p>
                      <p className="text-sm font-bold text-blue-700 mt-2">
                        A TECHNICAL REPORT ON THE STUDENTS INDUSTRIAL WORK EXPERIENCE SCHEME (SIWES)
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        UNDERTAKEN AT {company.toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        BY {studentName} ({matricNumber}) • DURATION: {duration} • SESSION: {session}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="font-sans font-bold text-sm uppercase text-slate-900 text-center mb-2">Certification</h4>
                      <p className="text-sm text-slate-700 italic">
                        This is to certify that this technical report was written and compiled by {studentName} ({matricNumber}) in the Department of {course}, {institution}, based on the practical training undertaken at {company} under the supervision of the undersigned.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="font-sans font-bold text-sm uppercase text-slate-900 text-center mb-2">Dedication</h4>
                      <p className="text-sm text-slate-700 italic">
                        This report is dedicated to the Almighty God for His boundless grace, wisdom, and protection throughout the period of this industrial training, and to my parents for their moral and financial support.
                      </p>
                    </div>
                  </div>
                )}

                {activeChapter === 1 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 pb-3">
                      <span className="text-xs font-bold text-blue-600 font-sans uppercase tracking-wider">Chapter One</span>
                      <h3 className="text-xl font-bold text-slate-900 font-sans">
                        Introduction & Organizational Background
                      </h3>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-sm uppercase text-slate-900">
                        1.1 Background of SIWES & Industrial Training Fund (ITF)
                      </h4>
                      <p className="text-sm text-slate-700 mt-2">
                        The Students Industrial Work Experience Scheme (SIWES) was established by the Industrial Training Fund (ITF) under Decree No. 47 of 1973. It serves as an essential bridge connecting the theoretical foundations taught within tertiary institutions to practical engineering, technical, and industrial operations in commercial corporations.
                      </p>
                      <p className="text-sm text-slate-700 mt-2">
                        Administered collaboratively by the ITF, National Universities Commission (NUC), and the National Board for Technical Education (NBTE), the program aims to minimize skills mismatch and impart high-value competencies to students before graduation.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-sm uppercase text-slate-900">
                        1.3 Profile & Historical Background of {company}
                      </h4>
                      <p className="text-sm text-slate-700 mt-2">
                        {company} operates as a tier-1 industry leader with nationwide infrastructure networks. The organization's mission centers on delivering high-reliability services, robust digital transformations, and standardized operational excellence across the sub-region.
                      </p>
                      <p className="text-sm text-slate-700 mt-2">
                        The corporate facility houses Tier-3 data centers, regional operations hubs, automated testing labs, and high-density fiber-optic termination rooms supporting millions of subscribers.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-sm uppercase text-slate-900">
                        1.5 Organizational Structure & Organogram
                      </h4>
                      <p className="text-sm text-slate-700 mt-2">
                        The organizational hierarchy flows from Executive Leadership through Regional Engineering Directors, Departmental Heads, Senior Field Specialists, and Industrial Attachés within the {department}.
                      </p>
                    </div>
                  </div>
                )}

                {activeChapter === 2 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 pb-3">
                      <span className="text-xs font-bold text-blue-600 font-sans uppercase tracking-wider">Chapter Two</span>
                      <h3 className="text-xl font-bold text-slate-900 font-sans">
                        Departmental Rotations & Health and Safety Protocols
                      </h3>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-sm uppercase text-slate-900">
                        2.1 Department Overview & Core Responsibilities
                      </h4>
                      <p className="text-sm text-slate-700 mt-2">
                        The {department} is responsible for 99.98% operational uptime, preventative maintenance of telecommunications and computing infrastructure, structured physical cabling, and swift fault ticket resolution.
                      </p>
                      <p className="text-sm text-slate-700 mt-2">
                        Engineers in this unit interface with core routing infrastructure, redundant uninterruptible power supply (UPS) systems, automated environmental monitoring, and firewall security appliances.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-sm uppercase text-slate-900">
                        2.3 Occupational Health, Safety & Environmental (HSE) Regulations
                      </h4>
                      <p className="text-sm text-slate-700 mt-2">
                        Strict compliance with corporate HSE guidelines was maintained: mandatory safety boots with dielectric resistance, anti-static wristbands when handling circuit boards, and adherence to lockout/tagout (LOTO) protocols during power distribution maintenance.
                      </p>
                    </div>
                  </div>
                )}

                {activeChapter === 3 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 pb-3">
                      <span className="text-xs font-bold text-blue-600 font-sans uppercase tracking-wider">Chapter Three</span>
                      <h3 className="text-xl font-bold text-slate-900 font-sans">
                        Technical Projects & Hands-On Engineering Experience
                      </h3>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-sm uppercase text-slate-900">
                        3.1 Structured Network Cabling & Patching Architecture
                      </h4>
                      <p className="text-sm text-slate-700 mt-2">
                        Executed complete Cat6 UTP copper termination adhering to TIA/EIA-568-B specifications. Terminated 48-port patch panels with 110 punch-down tools and conducted continuity, attenuation, and wire-map verification using digital cable certifiers.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-sm uppercase text-slate-900">
                        3.2 Layer 2 Switching, VLAN Segmentation & 802.1Q Trunking
                      </h4>
                      <p className="text-sm text-slate-700 mt-2">
                        Configured enterprise Cisco Catalyst switches into isolated broadcast domains: Management VLAN 10, Corporate Staff VLAN 20, and Guest VLAN 30, interconnecting via Gigabit 802.1Q trunk links with access control lists.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-sm uppercase text-slate-900">
                        3.4 Server Maintenance & Preventive Care
                      </h4>
                      <p className="text-sm text-slate-700 mt-2">
                        Performed bi-weekly server chassis dusting using high-pressure air blowers, hot-swap drive replacements on RAID 5 storage arrays, and firmware patch deployments on enterprise rack servers.
                      </p>
                    </div>
                  </div>
                )}

                {activeChapter === 4 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 pb-3">
                      <span className="text-xs font-bold text-blue-600 font-sans uppercase tracking-wider">Chapter Four</span>
                      <h3 className="text-xl font-bold text-slate-900 font-sans">
                        Technical Challenges Encountered & Troubleshooting
                      </h3>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-sm uppercase text-slate-900">
                        4.1 Departmental IP Address Pool Exhaustion
                      </h4>
                      <p className="text-sm text-slate-700 mt-2">
                        During mid-attachment expansion, the internal DHCP server pool (/24 subnet, 254 addresses) became completely depleted, causing intermittent connection drops for newly deployed workstations.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-sm uppercase text-slate-900">
                        4.2 Diagnostic Methodology & Solution
                      </h4>
                      <p className="text-sm text-slate-700 mt-2">
                        Re-engineered the local subnet using Variable Length Subnet Masking (VLSM), expanding the subnet mask from 255.255.255.0 to 255.255.254.0 (/23). This doubled the address capacity to 510 usable hosts with zero downtime.
                      </p>
                    </div>
                  </div>
                )}

                {activeChapter === 5 && (
                  <div className="space-y-6">
                    <div className="border-b border-slate-200 pb-3">
                      <span className="text-xs font-bold text-blue-600 font-sans uppercase tracking-wider">Chapter Five</span>
                      <h3 className="text-xl font-bold text-slate-900 font-sans">
                        Summary, Conclusions & Recommendations
                      </h3>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-sm uppercase text-slate-900">
                        5.1 Summary of Training Experience
                      </h4>
                      <p className="text-sm text-slate-700 mt-2">
                        The 24-week SIWES attachment at {company} provided hands-on mastery in enterprise infrastructure, structured cabling, fault diagnosis, and professional engineering ethics that could never be obtained from textbooks alone.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-sans font-bold text-sm uppercase text-slate-900">
                        5.3 Recommendations to the Industrial Training Fund (ITF)
                      </h4>
                      <p className="text-sm text-slate-700 mt-2">
                        The ITF should increase supervisory inspection cadence and adjust student maintenance allowances to align with modern economic realities, ensuring students can sustain themselves during attachment.
                      </p>
                    </div>
                  </div>
                )}

                {activeChapter === 6 && (
                  <div className="space-y-4 font-sans">
                    <div className="border-b border-slate-200 pb-3">
                      <span className="text-xs font-bold text-emerald-600 uppercase">Document Alignment</span>
                      <h3 className="text-lg font-bold text-slate-900">
                        Official Table of Contents (2-Column Borderless Table)
                      </h3>
                      <p className="text-xs text-slate-500">
                        In the downloaded .docx file, this table is compiled using a borderless 2-column layout so page numbers are strictly right-aligned with zero scatter:
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 font-mono">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Title Page</span><span>i</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Certification</span><span>ii</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Dedication & Acknowledgments</span><span>iii</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                        <span>CHAPTER 1: INTRODUCTION & COMPANY PROFILE</span><span>1</span>
                      </div>
                      <div className="flex justify-between text-slate-600 pl-4">
                        <span>1.1 Background of SIWES & ITF</span><span>1</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                        <span>CHAPTER 2: ROTATIONS & SAFETY PROTOCOLS</span><span>8</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                        <span>CHAPTER 3: TECHNICAL PROJECTS & WORK EXPERIENCE</span><span>14</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                        <span>CHAPTER 4: PROBLEMS ENCOUNTERED & SOLUTIONS</span><span>30</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200">
                        <span>CHAPTER 5: SUMMARY & ITF RECOMMENDATIONS</span><span>35</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>© 2026 CodeThesis AI. Official ITF SIWES Technical Report Generator.</p>
      </footer>
    </div>
  );
}
