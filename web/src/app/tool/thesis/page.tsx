'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { downloadAcademicFile } from '@/lib/downloadHelper';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Download,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  Copy,
  Check,
  RotateCcw,
  Loader2
} from 'lucide-react';
import CourseSelect from '@/components/ui/CourseSelect';
import InstitutionSelect from '@/components/ui/InstitutionSelect';

export default function ThesisToolPage() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [course, setCourse] = useState(user?.department || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [caseStudy, setCaseStudy] = useState('');
  const [studentName, setStudentName] = useState(user?.fullName?.toUpperCase() || '');
  const [matricNumber, setMatricNumber] = useState(user?.matricNumber || '');
  const [session, setSession] = useState('2025/2026');

  // Auto-populate from logged-in user profile
  useEffect(() => {
    if (user) {
      if (user.fullName) setStudentName(user.fullName.toUpperCase());
      if (user.matricNumber) setMatricNumber(user.matricNumber);
      if (user.institution) setInstitution(user.institution);
      if (user.department) setCourse(user.department);
    }
  }, [user]);

  const [activeChapter, setActiveChapter] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const effectiveTopic = topic.trim() || 'Design and Implementation of an Automated System';
  const effectiveInstitution = institution.trim() || 'Tertiary Institution';
  const effectiveCaseStudy = caseStudy.trim() || 'the Designated Organization';

  async function handleDownloadDocx() {
    setIsDownloading(true);
    await downloadAcademicFile(
      '/api/generate-thesis-docx',
      { topic, course, institution, caseStudy, studentName, matricNumber, session },
      `5_Chapter_Thesis_${course.replace(/\s+/g, '_')}.docx`
    );
    setIsDownloading(false);
    setSuccessBanner('Complete 5-Chapter Thesis (.docx) generated and downloaded with verified citations!');
    setTimeout(() => setSuccessBanner(null), 5000);
  }

  async function handleGenerate() {
    setIsGenerating(true);
    // Directly compile and download the full 5-chapter thesis document
    await handleDownloadDocx();
    setIsGenerating(false);
  }

  return (
    <AppLayout
      activeItem="thesis"
      title="5-Chapter Thesis Generator"
      subtitle="Generates ~18,000+ words target, APA 7th citations with verified Crossref DOIs, and 1.5-inch hardcover margins"
    >
      {/* Dynamic Success Banner */}
      {successBanner && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-950 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-amber-500 hover:text-amber-700 font-bold ml-2 text-xs"
          >
            &times;
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Input Pane */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider mb-1">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Dissertation Inputs</span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Research Project Topic</label>
              <textarea
                rows={2}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Design and Implementation of an Automated Hostel Allocation System"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-xs text-slate-800 font-medium outline-none transition-all shadow-xs"
              />
            </div>

            <CourseSelect
              value={course}
              onChange={setCourse}
              label="Course of Study"
            />

            <InstitutionSelect
              value={institution}
              onChange={setInstitution}
              label="Tertiary Institution"
              placeholder="Search or enter institution..."
            />

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Student Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value.toUpperCase())}
                  placeholder="e.g. SURNAME FIRSTNAME"
                  className="w-full h-10 bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl px-2.5 text-xs font-bold uppercase text-slate-800 outline-none transition-all shadow-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Matric No</label>
                <input
                  type="text"
                  value={matricNumber}
                  onChange={e => setMatricNumber(e.target.value)}
                  placeholder="e.g. MATRIC/REG/0001"
                  className="w-full h-10 bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl px-2.5 text-xs font-mono text-slate-800 outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs shadow-md gold-shimmer flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{isGenerating ? 'Synthesizing 18k Words...' : 'Generate 5-Chapter Thesis'}</span>
            </button>
          </div>

          {/* Chapter Selector */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1.5">
            {[1, 2, 3, 4, 5].map(chNum => (
              <button
                key={chNum}
                onClick={() => setActiveChapter(chNum)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeChapter === chNum
                    ? 'bg-amber-50 border border-amber-200 text-amber-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${
                    activeChapter === chNum ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {chNum}
                  </div>
                  <span>
                    {chNum === 1 && 'Chapter 1: Introduction'}
                    {chNum === 2 && 'Chapter 2: Literature Review'}
                    {chNum === 3 && 'Chapter 3: System Analysis & Design'}
                    {chNum === 4 && 'Chapter 4: Implementation & Testing'}
                    {chNum === 5 && 'Chapter 5: Summary & Conclusion'}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Preview Pane */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                NUC Standards Compliant
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {activeChapter === 1 && 'Chapter One: Introduction'}
                {activeChapter === 2 && 'Chapter Two: Literature Review'}
                {activeChapter === 3 && 'Chapter Three: System Analysis and Design'}
                {activeChapter === 4 && 'Chapter Four: Implementation and Testing'}
                {activeChapter === 5 && 'Chapter Five: Summary, Conclusion, Recommendations'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadDocx}
                disabled={isDownloading}
                className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling DOCX...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full (.docx)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Academic Content Preview Area */}
          <div className="font-serif text-slate-800 text-xs sm:text-sm leading-relaxed space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {activeChapter === 1 && (
              <div className="space-y-4">
                <h3 className="font-bold font-sans text-sm text-slate-900 uppercase">1.1 Background of the Study</h3>
                <p className="text-justify indent-8">
                  In modern tertiary educational institutions such as {effectiveInstitution}, the administration of student hostel accommodation represents one of the most critical auxiliary services impacting student welfare, academic focus, and overall campus security. Historically, residential hall administration has relied extensively on manual registration cards, physical queue allocation registries, and manual verification ledgers. These conventional methods are inherently susceptible to human transcription discrepancies, unauthorized room reservations, duplication of allocations, and severe administrative bottlenecks.
                </p>
                <h3 className="font-bold font-sans text-sm text-slate-900 uppercase">1.2 Statement of the Problem</h3>
                <p className="text-justify indent-8">
                  The manual hostel accommodation allocation framework in tertiary universities is plagued by fundamental structural inefficiencies. Students are frequently subjected to arduous physical queues spanning multiple academic departments and administrative offices. The absence of a real-time synchronized repository creates acute challenges: room over-allocation, inaccurate vacancy status tracking, and lack of transparency. This study proposes the design and implementation of an automated allocation system for {effectiveCaseStudy} to completely eliminate manual bottlenecks.
                </p>
                <h3 className="font-bold font-sans text-sm text-slate-900 uppercase">1.3 Aim and Objectives of the Study</h3>
                <p className="text-justify indent-8">
                  The overarching aim of this research is to design and implement an automated hostel allocation system for {effectiveInstitution}. To fulfill this primary aim, the specific objectives are:
                </p>
                <ol className="list-decimal pl-10 space-y-1 font-sans text-xs">
                  <li>To critically examine and analyze the bottlenecks associated with the existing manual hostel allocation workflows.</li>
                  <li>To formulate a secure relational database schema for student profiles, room quotas, and real-time bed-space tracking.</li>
                  <li>To design a multi-tiered web architecture enabling students to submit accommodation requests seamlessly online.</li>
                  <li>To develop an automated conflict-free room assignment engine enforcing institutional eligibility policies.</li>
                  <li>To test, evaluate, and benchmark the developed system against manual operational metrics to ascertain latency reduction and accuracy gains.</li>
                </ol>
              </div>
            )}

            {activeChapter === 2 && (
              <div className="space-y-4">
                <h3 className="font-bold font-sans text-sm text-slate-900 uppercase">2.1 Conceptual Review: Automated Facility Allocation</h3>
                <p className="text-justify indent-8">
                  Management Information Systems (MIS) within higher education environments have transitioned from isolated batch data processing units to integrated, distributed web application architectures. According to Laudon and Laudon (2022), automated resource allocation frameworks in institutional setups substantially reduce operational overhead by decoupling request initiation from manual operator handling.
                </p>
                <h3 className="font-bold font-sans text-sm text-slate-900 uppercase">2.2 Theoretical Framework: Resource Allocation Theory</h3>
                <p className="text-justify indent-8">
                  The theoretical foundation of this study is grounded in Resource Constrained Allocation Optimization and Queueing Theory (Gross et al., 2018). In an academic campus setting, hostel capacity operates as a strictly bounded, non-elastic asset where demand invariably surpasses supply by substantial margins during start-of-session onboarding.
                </p>
              </div>
            )}

            {activeChapter === 3 && (
              <div className="space-y-4">
                <h3 className="font-bold font-sans text-sm text-slate-900 uppercase">3.1 System Architecture and Methodology</h3>
                <p className="text-justify indent-8">
                  The methodology adopted for this project is the Structured System Analysis and Design Methodology (SSADM) coupled with an iterative Agile sprint framework. The system is designed following a robust 3-Tier Architecture comprising: (1) Presentation Layer (Responsive Web Client), (2) Application Logic Layer (RESTful API Services), and (3) Database Layer (Relational PostgreSQL Database).
                </p>
                <h3 className="font-bold font-sans text-sm text-slate-900 uppercase">3.2 Data Flow and Entity-Relationship Architecture</h3>
                <p className="text-justify indent-8">
                  The system enforces strict normalization standards up to Third Normal Form (3NF) across all operational entities: Student Entity, Hostel Block Entity, Room Capacity Entity, Application Ledger, and Allocation Transaction Receipts.
                </p>
              </div>
            )}

            {activeChapter === 4 && (
              <div className="space-y-4">
                <h3 className="font-bold font-sans text-sm text-slate-900 uppercase">4.1 Development Environment & Implementation Details</h3>
                <p className="text-justify indent-8">
                  The automated system implementation leverages modern, production-grade toolchains: TypeScript runtime, Next.js server-side rendering, Tailwind CSS responsive layouts, and PostgreSQL database storage with transaction isolation levels to prevent race conditions during concurrent bed-space booking.
                </p>
                <h3 className="font-bold font-sans text-sm text-slate-900 uppercase">4.2 System Evaluation and Test Results</h3>
                <p className="text-justify indent-8">
                  System evaluation was performed across unit, integration, and load testing matrices. Concurrent simulated allocation transactions confirmed 100% data integrity with zero double-allocation instances across 1,000 synthetic student applications.
                </p>
              </div>
            )}

            {activeChapter === 5 && (
              <div className="space-y-4">
                <h3 className="font-bold font-sans text-sm text-slate-900 uppercase">5.1 Summary of Findings</h3>
                <p className="text-justify indent-8">
                  This research presented the design, implementation, and empirical evaluation of an automated hostel allocation system. The deployed system successfully addressed the documented vulnerabilities of manual allocation: processing latency was diminished by over 85%, transcription errors were eliminated, and student satisfaction metrics showed marked improvements.
                </p>
                <h3 className="font-bold font-sans text-sm text-slate-900 uppercase">5.2 Recommendations & Future Work</h3>
                <p className="text-justify indent-8">
                  It is recommended that institutional authorities at {effectiveInstitution} fully integrate this automated system into the central university portal. Future extensions include mobile application deployment and biometric identity verification at residential hall checkpoints.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
