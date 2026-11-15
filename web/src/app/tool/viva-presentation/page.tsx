'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import CourseSelect from '@/components/ui/CourseSelect';
import InstitutionSelect from '@/components/ui/InstitutionSelect';
import { useAuth } from '@/context/AuthContext';
import { downloadAcademicFile } from '@/lib/downloadHelper';
import {
  Presentation,
  Download,
  Play,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mic,
  Maximize2,
  FileCheck,
  CheckCircle2,
  Lightbulb,
  Copy,
  Layers,
  Loader2
} from 'lucide-react';

interface Slide {
  number: number;
  title: string;
  category: string;
  talkingDuration: string;
  content: string[];
  notes: string;
  accent: string;
}

export default function VivaPresentationPage() {
  const { user } = useAuth();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [topic, setTopic] = useState('Design and Implementation of an Automated Hostel Allocation System with Concurrency Control');
  const [studentName, setStudentName] = useState('ADEBAYO TUNDE');
  const [matricNumber, setMatricNumber] = useState('FUTA/CSC/20/4182');
  const [supervisor, setSupervisor] = useState('Dr. O. A. Adeleke (B.Sc, M.Sc, Ph.D)');
  const [institution, setInstitution] = useState('Federal University of Technology, Akure (FUTA)');
  const [course, setCourse] = useState('Computer Science');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Auto-populate from logged-in user profile
  useEffect(() => {
    if (user) {
      if (user.fullName) setStudentName(user.fullName.toUpperCase());
      if (user.matricNumber) setMatricNumber(user.matricNumber);
      if (user.institution) setInstitution(user.institution);
      if (user.department) setCourse(user.department);
    }
  }, [user]);

  const slides: Slide[] = [
    {
      number: 1,
      title: 'Project Title & Defense Demographics',
      category: 'Introduction',
      talkingDuration: '45 seconds',
      accent: 'from-blue-600 to-indigo-700',
      content: [
        `Topic: ${topic}`,
        `Candidate: ${studentName} (${matricNumber})`,
        `Supervisor: ${supervisor}`,
        `Department: Computer Science, School of Computing`,
        `Institution: ${institution}`,
        `Session: 2025/2026 Academic Session`
      ],
      notes: 'State your name and matric number clearly. Greet the External Examiner, HOD, and supervisors with confidence. Do not rush.'
    },
    {
      number: 2,
      title: 'Background of Study & Problem Statement',
      category: 'Problem Analysis',
      talkingDuration: '1 min 15 sec',
      accent: 'from-rose-600 to-red-700',
      content: [
        'Manual bedspace allocation leads to extensive physical queues and 48+ hour delays.',
        'High susceptibility to double-allocation anomalies under high concurrent portal traffic.',
        'Total lack of real-time vacancy transparency between Bursary and Hall Porters.',
        'Revenue leakage and paper voucher forgery during physical clearance.'
      ],
      notes: 'Emphasize the pain point of concurrent traffic and double-allocation. This primes the panel for your technical solution.'
    },
    {
      number: 3,
      title: 'Aim & Specific Objectives',
      category: 'Objectives',
      talkingDuration: '1 minute',
      accent: 'from-emerald-600 to-teal-700',
      content: [
        'Aim: To develop a fault-tolerant, concurrent web-based hostel allocation engine for tertiary institutions.',
        'Objective 1: Model the allocation lifecycle using formal UML Use Case and Sequence diagrams.',
        'Objective 2: Implement strict row-level serialized database locking to prevent double-booking race conditions.',
        'Objective 3: Integrate Paystack automated payment webhooks for instantaneous clearance receipt generation.',
        'Objective 4: Evaluate performance and usability across 500 simulated concurrent requests using SUS metrics.'
      ],
      notes: 'Read objectives as actionable commitments. Supervisors love measurable words like "Model", "Implement", "Integrate", and "Evaluate".'
    },
    {
      number: 4,
      title: 'Scope & Delimitations',
      category: 'Scope',
      talkingDuration: '45 seconds',
      accent: 'from-cyan-600 to-blue-700',
      content: [
        'Focuses specifically on undergraduate halls of residence within university premises.',
        'Encompasses student authentication, room reservation, automated invoicing, and porter check-in.',
        'Delimitation: Does not govern private off-campus accommodations or physical plumbing maintenance.'
      ],
      notes: 'Setting clear delimitations protects you against external examiners asking why the software doesn’t do things outside your scope.'
    },
    {
      number: 5,
      title: 'Literature Review & Gap Analysis',
      category: 'Literature Review',
      talkingDuration: '1 minute',
      accent: 'from-purple-600 to-indigo-700',
      content: [
        'Adewale et al. (2021): Implemented PHP/MySQL hostel portal, but lacked pessimistic concurrency controls.',
        'Okonkwo & Ibrahim (2023): Proposed cloud allocation system, but required continuous internet for offline porters.',
        'Identified Research Gap: Existing Nigerian academic solutions suffer critical race conditions during peak 8:00 AM rush hours.'
      ],
      notes: 'Contrast yourself directly with previous Nigerian authors. State clearly how your work fills the identified concurrency gap.'
    },
    {
      number: 6,
      title: 'System Architecture (3-Tier Model)',
      category: 'Methodology',
      talkingDuration: '1 min 30 sec',
      accent: 'from-amber-600 to-orange-700',
      content: [
        'Tier 1 (Presentation): Responsive Next.js & Tailwind CSS interface optimized for low-bandwidth mobile devices.',
        'Tier 2 (Application Logic): RESTful micro-endpoints enforcing JWT RBAC and serializable transaction queues.',
        'Tier 3 (Persistence): SQLite / PostgreSQL ACID storage with indexed foreign keys for sub-millisecond retrieval.',
        'Zero-Pip Packaging: Fully self-contained local binary deployment using standard libraries.'
      ],
      notes: 'Point out the clean separation of concerns. Mention zero-pip dependency discipline if the panel asks how it runs offline.'
    },
    {
      number: 7,
      title: 'Concurrency Engine & Race Condition Defense',
      category: 'Technical Core',
      talkingDuration: '1 min 45 sec',
      accent: 'from-indigo-600 to-blue-800',
      content: [
        'Problem: Two students clicking "Reserve Room 204 Bed A" at the exact same millisecond.',
        'Mechanism: SELECT * FROM bedspaces WHERE id = ? FOR UPDATE;',
        'Serialized Isolation: Thread 1 holds lock, updates status to PENDING; Thread 2 is safely rejected with HTTP 409.',
        'Transaction Rollback: Automatically releases lock if payment session times out after 10 minutes.'
      ],
      notes: 'THIS IS YOUR HIGHEST VALUE SLIDE. Spend time explaining the lock mechanism. It proves this is real Computer Science, not just a CRUD site.'
    },
    {
      number: 8,
      title: 'Entity Relationship Diagram & Schema (3NF)',
      category: 'Database Design',
      talkingDuration: '1 minute',
      accent: 'from-teal-600 to-emerald-700',
      content: [
        'Normalized to Third Normal Form (3NF) to eliminate transitive update and insertion anomalies.',
        'Primary Entities: STUDENTS, HOSTEL_BLOCKS, ROOMS, BEDSPACES, ALLOCATIONS, PAYMENTS.',
        'Referential Integrity: CASCADE ON DELETE disabled to maintain immutable audit logs for university bursary records.'
      ],
      notes: 'Explain why CASCADE DELETE is turned off: tertiary institutions legally require financial audit trails.'
    },
    {
      number: 9,
      title: 'Live Implementation & Core Modules',
      category: 'Implementation',
      talkingDuration: '1 min 30 sec',
      accent: 'from-blue-700 to-cyan-800',
      content: [
        'Module 1: Student Self-Service Clearance & Eligibility Verification.',
        'Module 2: Real-time Hall & Bedspace Interactive Matrix with live vacancy flags.',
        'Module 3: Automated Payment Webhook Listener with Instant Digital Pass & QR Code issuance.',
        'Module 4: Porter Workstation Scanner with offline student credential verification.'
      ],
      notes: 'Prepare the panel for your live software demonstration right after this slide.'
    },
    {
      number: 10,
      title: 'Testing, Results & Usability Evaluation',
      category: 'Results',
      talkingDuration: '1 minute',
      accent: 'from-green-600 to-emerald-800',
      content: [
        'Stress Testing: 500 concurrent synthetic requests executed via Locust/JMeter.',
        'Concurrency Success: 0 double-allocation anomalies recorded across 10 test iterations.',
        'System Usability Scale (SUS): Evaluated with 45 undergraduate students — achieved 88.6/100 (Grade A Excellent).',
        'Average Transaction Latency: 240ms under simulated 3G campus network conditions.'
      ],
      notes: 'Examiners love hard empirical numbers. 88.6 SUS score and 0 double-allocations show real empirical rigor.'
    },
    {
      number: 11,
      title: 'Summary of Contributions to Knowledge',
      category: 'Contributions',
      talkingDuration: '1 minute',
      accent: 'from-violet-600 to-purple-800',
      content: [
        'Elimination of human bias, bribery, and queue exhaustion in tertiary hostel allocation.',
        'Demonstrated practical application of ACID row-locking in low-resource institutional server setups.',
        'A blueprint for zero-external-dependency software architecture tailored for Nigerian universities.'
      ],
      notes: 'Clearly answer the standard question: "What is your novel contribution to knowledge?"'
    },
    {
      number: 12,
      title: 'Recommendations & Future Work',
      category: 'Future Work',
      talkingDuration: '45 seconds',
      accent: 'from-sky-600 to-blue-700',
      content: [
        'Integration with University Bio-metric Smart Card gates at hostel entrances.',
        'AI Roommate Compatibility Matching algorithm based on student study habits and sleep chronotypes.',
        'Native USSD offline fallback for students with feature phones without internet access.'
      ],
      notes: 'Shows the panel that you have a forward-thinking vision beyond graduation.'
    },
    {
      number: 13,
      title: 'Conclusion & Acknowledgements',
      category: 'Conclusion',
      talkingDuration: '45 seconds',
      accent: 'from-slate-700 to-slate-900',
      content: [
        'The Automated Hostel Allocation System successfully achieves all four defined objectives.',
        'Special gratitude to my project supervisor, HOD, and departmental academic staff.',
        'The floor is now open for questions, critique, and panel evaluation.'
      ],
      notes: 'End with confidence and gratitude. Stand upright, maintain eye contact, and invite questions.'
    }
  ];

  const activeSlide = slides[currentSlideIndex];

  async function handleExportPPTX() {
    setIsDownloading(true);
    await downloadAcademicFile(
      '/api/generate-viva-pptx',
      {
        topic,
        studentName,
        matricNumber,
        supervisor,
        institution,
        course,
      },
      `Viva_Defense_Slides_${studentName.replace(/\s+/g, '_')}.pptx`
    );
    setIsDownloading(false);
  }

  function handleRecompile() {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setSuccessBanner(`Slide deck recompiled with updated topic and parameters for ${studentName}!`);
      setTimeout(() => setSuccessBanner(null), 5000);
    }, 1000);
  }

  return (
    <AppLayout
      activeItem="viva-presentation"
      title="Viva Presentation Studio"
      subtitle="Generates 15-Slide 16:9 widescreen defense decks with slide-by-slide speaker notes, timekeeper, and .pptx export"
    >
      {/* Viva Defense Suite Tab Switcher */}
      <div className="flex items-center gap-2 mb-5 bg-slate-200/80 p-1.5 rounded-2xl w-fit">
        <Link
          href="/tool/viva-presentation"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-xs flex items-center gap-2"
        >
          <Presentation className="w-3.5 h-3.5 text-blue-600" />
          <span>15-Slide Defense Deck (.pptx)</span>
        </Link>
        <Link
          href="/tool/viva-simulator"
          className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors"
        >
          <Mic className="w-3.5 h-3.5 text-yellow-500" />
          <span>Oral Defense Mock Simulator</span>
        </Link>
      </div>

      {successBanner && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Slide List & Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <Presentation className="w-4 h-4 text-blue-600" />
                <span>Defense Presentation Deck</span>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                {slides.length} Slides
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Topic</label>
              <textarea
                rows={2}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl p-2.5 text-xs text-slate-800 font-medium outline-none transition-all shadow-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Candidate</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg p-2 text-xs text-slate-800 outline-none transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Matric No.</label>
                <input
                  type="text"
                  value={matricNumber}
                  onChange={e => setMatricNumber(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg p-2 text-xs text-slate-800 outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            <InstitutionSelect
              value={institution}
              onChange={setInstitution}
              label="Tertiary Institution"
              placeholder="Search or enter institution..."
            />

            <CourseSelect
              value={course}
              onChange={setCourse}
              label="Course / Department"
            />

            <button
              onClick={handleRecompile}
              disabled={isGenerating}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Compiling Deck...' : 'Re-Generate Presentation (1 Credit)'}</span>
            </button>
          </div>

          {/* Slide Deck Navigator */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2 max-h-[420px] overflow-y-auto">
            <div className="text-xs font-bold text-slate-800 px-1 mb-2">Slide Deck Overview</div>
            {slides.map((s, idx) => (
              <button
                key={s.number}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                  currentSlideIndex === idx
                    ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                    : 'border-slate-200/70 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                    currentSlideIndex === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {s.number}
                  </span>
                  <span className="truncate text-[11px]">{s.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">{s.talkingDuration}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right 16:9 Presentation Canvas & Speaker Notes (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            {/* Top Toolbar */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">
                  Slide {activeSlide.number} of {slides.length}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                  {activeSlide.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Target Time: <strong className="text-slate-800">{activeSlide.talkingDuration}</strong></span>
                </div>

                <button
                  onClick={handleExportPPTX}
                  disabled={isDownloading}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs hover:opacity-95 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Compiling .PPTX...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Export .PPTX</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 16:9 Simulated Slide Frame */}
            <div className="p-6 bg-slate-900 flex items-center justify-center">
              <div className="w-full aspect-[16/9] max-w-[760px] bg-white rounded-xl shadow-2xl p-7 flex flex-col justify-between border border-slate-300 relative overflow-hidden">
                {/* Decorative Top Accent Bar */}
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${activeSlide.accent}`} />

                {/* Header */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    <span>{institution.split(',')[0]}</span>
                    <span>CSC 599 FINAL DEFENSE</span>
                  </div>
                  <h2 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {activeSlide.title}
                  </h2>
                </div>

                {/* Slide Body */}
                <div className="space-y-2.5 my-auto">
                  {activeSlide.content.map((bullet, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs lg:text-sm text-slate-700 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span>Candidate: {studentName} ({matricNumber})</span>
                  <span>Supervisor: {supervisor.split('(')[0]}</span>
                  <span>Slide {activeSlide.number} / {slides.length}</span>
                </div>
              </div>
            </div>

            {/* Slide Navigation Controls */}
            <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
              <button
                onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Slide</span>
              </button>

              <div className="flex items-center gap-1">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlideIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      currentSlideIndex === i ? 'bg-blue-600 w-6' : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1"
              >
                <span>Next Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Speaker Notes Callout */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Supervisor's Defense Coaching & Speaker Talking Points</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              "{activeSlide.notes}"
            </p>
            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-800">
              <span>💡 Tip: Never read verbatim from the slide. Summarize and glance at the panel.</span>
              <span className="font-bold">Allocated Time: ~15 mins total presentation</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
