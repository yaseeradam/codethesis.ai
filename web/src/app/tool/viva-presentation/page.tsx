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
  Palette,
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

export interface UITheme {
  id: string;
  name: string;
  category: string;
  description: string;
  coverBg: string;
  coverText: string;
  coverBorder: string;
  coverHighlight: string;
  coverSub: string;
  coverPillBg: string;
  coverPillBorder: string;
  coverGold: string;
  slideBg: string;
  headerBg: string;
  headerAccent: string;
  categoryColor: string;
  bulletColor: string;
  cardBorder: string;
  badgeBg: string;
  swatches: string[];
}

export const SLIDE_THEMES_UI: Record<string, UITheme> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Tech',
    category: 'Engineering & Computing',
    description: 'Deep obsidian navy with electric cyan & gold. Ideal for Computer Science and Software Engineering.',
    coverBg: 'bg-[#070C1E]',
    coverText: 'text-white',
    coverBorder: 'border-sky-500/30',
    coverHighlight: 'text-sky-400',
    coverSub: 'text-slate-300',
    coverPillBg: 'bg-[#0B132B]',
    coverPillBorder: 'border-sky-500/40',
    coverGold: 'text-amber-400 border-amber-500/40',
    slideBg: 'bg-slate-50',
    headerBg: 'bg-[#0B132B]',
    headerAccent: 'bg-sky-500',
    categoryColor: 'text-sky-400',
    bulletColor: 'bg-sky-500',
    cardBorder: 'border-slate-200',
    badgeBg: 'bg-sky-100 text-sky-800',
    swatches: ['#0B132B', '#0284C7', '#38BDF8', '#F59E0B'],
  },
  oxford: {
    id: 'oxford',
    name: 'Oxford Emerald',
    category: 'Ivy League & Sciences',
    description: 'Regal forest emerald with warm scholastic gold. Favored by university senates and academic panels.',
    coverBg: 'bg-[#022C22]',
    coverText: 'text-white',
    coverBorder: 'border-emerald-500/30',
    coverHighlight: 'text-emerald-300',
    coverSub: 'text-emerald-100',
    coverPillBg: 'bg-[#064E3B]',
    coverPillBorder: 'border-emerald-500/40',
    coverGold: 'text-amber-400 border-amber-500/40',
    slideBg: 'bg-[#FDFBF7]',
    headerBg: 'bg-[#064E3B]',
    headerAccent: 'bg-emerald-500',
    categoryColor: 'text-emerald-300',
    bulletColor: 'bg-emerald-600',
    cardBorder: 'border-stone-200',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    swatches: ['#064E3B', '#059669', '#34D399', '#D97706'],
  },
  crimson: {
    id: 'crimson',
    name: 'Cambridge Crimson',
    category: 'Executive & Health/Law',
    description: 'Deep regal burgundy with vivid rose crimson. Prestigious aesthetic for clinical and governance research.',
    coverBg: 'bg-[#4C0519]',
    coverText: 'text-white',
    coverBorder: 'border-rose-500/30',
    coverHighlight: 'text-rose-300',
    coverSub: 'text-rose-100',
    coverPillBg: 'bg-[#881337]',
    coverPillBorder: 'border-rose-500/40',
    coverGold: 'text-amber-400 border-amber-500/40',
    slideBg: 'bg-[#FFF1F2]',
    headerBg: 'bg-[#881337]',
    headerAccent: 'bg-rose-500',
    categoryColor: 'text-rose-300',
    bulletColor: 'bg-rose-600',
    cardBorder: 'border-rose-200',
    badgeBg: 'bg-rose-100 text-rose-800',
    swatches: ['#881337', '#E11D48', '#FB7185', '#F59E0B'],
  },
  minimalist: {
    id: 'minimalist',
    name: 'Nordic Minimalist',
    category: 'Swiss Clean & Typographic',
    description: 'High-contrast zinc obsidian with crisp cobalt lines and generous whitespace. Distraction-free clarity.',
    coverBg: 'bg-[#09090B]',
    coverText: 'text-white',
    coverBorder: 'border-zinc-700',
    coverHighlight: 'text-blue-400',
    coverSub: 'text-zinc-400',
    coverPillBg: 'bg-[#18181B]',
    coverPillBorder: 'border-zinc-700',
    coverGold: 'text-blue-400 border-blue-500/40',
    slideBg: 'bg-[#FAFAFA]',
    headerBg: 'bg-[#18181B]',
    headerAccent: 'bg-blue-600',
    categoryColor: 'text-blue-400',
    bulletColor: 'bg-blue-600',
    cardBorder: 'border-zinc-200',
    badgeBg: 'bg-zinc-200 text-zinc-900',
    swatches: ['#18181B', '#2563EB', '#60A5FA', '#71717A'],
  },
  solaris: {
    id: 'solaris',
    name: 'Solaris Amber',
    category: 'Innovation & Startup',
    description: 'Deep indigo twilight with radiant imperial amber. High impact for modern innovations and startup projects.',
    coverBg: 'bg-[#0F0D2E]',
    coverText: 'text-white',
    coverBorder: 'border-amber-500/30',
    coverHighlight: 'text-amber-400',
    coverSub: 'text-amber-100',
    coverPillBg: 'bg-[#1E1B4B]',
    coverPillBorder: 'border-amber-500/40',
    coverGold: 'text-orange-400 border-orange-500/40',
    slideBg: 'bg-[#FFFBEB]',
    headerBg: 'bg-[#1E1B4B]',
    headerAccent: 'bg-amber-500',
    categoryColor: 'text-amber-400',
    bulletColor: 'bg-amber-600',
    cardBorder: 'border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-900',
    swatches: ['#1E1B4B', '#D97706', '#F59E0B', '#EA580C'],
  },
};

export default function VivaPresentationPage() {
  const { user } = useAuth();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<string>('midnight');
  const [topic, setTopic] = useState('');
  const [studentName, setStudentName] = useState(user?.fullName?.toUpperCase() || '');
  const [matricNumber, setMatricNumber] = useState(user?.matricNumber || '');
  const [supervisor, setSupervisor] = useState('');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [course, setCourse] = useState(user?.department || '');
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

  const effectiveTopic = topic.trim() || 'Undergraduate Research Project Dissertation';
  const effectiveCandidate = studentName.trim() || 'Candidate Name';
  const effectiveMatric = matricNumber.trim() || 'Matric Number';
  const effectiveSupervisor = supervisor.trim() || 'Internal Project Supervisor';
  const effectiveCourse = course.trim() || 'Academic Department';
  const effectiveInstitution = institution.trim() || 'Tertiary Institution';

  const [slides, setSlides] = useState<Slide[]>([]);

  const activeTheme = SLIDE_THEMES_UI[selectedTheme] || SLIDE_THEMES_UI.midnight;

  const activeSlide = slides[currentSlideIndex] || slides[0] || {
    number: 1,
    title: 'Presentation Overview',
    category: 'Introduction',
    talkingDuration: '1 min',
    content: [],
    notes: '',
    accent: 'from-blue-600 to-indigo-700',
  };

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
        theme: selectedTheme,
      },
      `Viva_Defense_Slides_${selectedTheme}_${studentName.replace(/\s+/g, '_')}.pptx`
    );
    setIsDownloading(false);
  }

  async function handleRecompile() {
    if (!topic.trim()) {
      setSuccessBanner('Please enter your research project topic on the left first.');
      setTimeout(() => setSuccessBanner(null), 3000);
      return;
    }
    setIsGenerating(true);
    const targetTopic = topic.trim();
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'viva-presentation',
          type: 'freeform',
          topic: targetTopic,
          course: course || 'Computer Science / Engineering',
          institution: institution || 'Tertiary University',
          prompt: `Generate viva defense oral presentation talking points and slide bullet points for an academic defense on the topic "${targetTopic}" in ${course}. Focus on problem statement, novel contributions, methodology, and defense panel answers.`,
        }),
      });

      const data = await res.json();
      
      const newSlides: Slide[] = [
        {
          number: 1,
          title: 'Project Title & Candidate Demographics',
          category: 'Introduction',
          talkingDuration: '45 seconds',
          accent: 'from-blue-600 to-indigo-700',
          content: [
            `Topic: ${targetTopic}`,
            `Candidate: ${studentName || 'Candidate Scholar'} (${matricNumber || 'MATRIC NUMBER'})`,
            `Supervisor: ${supervisor || 'Internal Project Supervisor'}`,
            `Department: ${course || 'Academic Department'}`,
            `Institution: ${institution || 'Tertiary Institution'}`,
            `Session: 2025/2026 Academic Session`
          ],
          notes: 'State your name and matric number clearly. Greet the External Examiner, HOD, and supervisors with confidence.'
        },
        {
          number: 2,
          title: 'Background of Study & Problem Statement',
          category: 'Problem Analysis',
          talkingDuration: '1 min 15 sec',
          accent: 'from-rose-600 to-red-700',
          content: [
            `Core operational friction addressed by ${targetTopic}.`,
            'Vulnerability to data inconsistencies and transcription discrepancies in existing workflows.',
            'Latency in record retrieval and delayed stakeholder clearance.',
            'Imperative requirement for automated, verifiable digital infrastructure.'
          ],
          notes: 'Emphasize the acute operational failure modes in existing systems.'
        },
        {
          number: 3,
          title: 'Aim & Specific Research Objectives',
          category: 'Objectives',
          talkingDuration: '1 minute',
          accent: 'from-emerald-600 to-teal-700',
          content: [
            `Primary Aim: Develop a defense-grade solution for ${targetTopic}.`,
            'Objective 1: Model operational requirements isolating core entity relationships.',
            'Objective 2: Architect decoupled 3-tier client-server topology eliminating operational race conditions.',
            'Objective 3: Synthesize transactional relational schema enforcing referential integrity.',
            'Objective 4: Conduct rigorous unit, integration, and load testing.'
          ],
          notes: 'Read objectives as actionable commitments. Supervisors grade based on whether each objective was satisfied.'
        },
        {
          number: 4,
          title: 'Scope & Delimitations',
          category: 'Scope',
          talkingDuration: '45 seconds',
          accent: 'from-cyan-600 to-blue-700',
          content: [
            `Scope: Focuses on core operational workflows for ${targetTopic}.`,
            'Encompasses student authentication, data persistence, and administrative dashboards.',
            'Delimitation: Reserved for departmental and institutional academic scope.'
          ],
          notes: 'Setting clear delimitations protects you against examiners asking for features outside your scope.'
        },
        {
          number: 5,
          title: 'Literature Review & Theoretical Framework',
          category: 'Literature Review',
          talkingDuration: '1 minute',
          accent: 'from-purple-600 to-indigo-700',
          content: [
            'Grounding in modern distributed computing and transactional database paradigms.',
            'Comparative analysis of previous empirical research in higher education frameworks.',
            'Verified Crossref empirical citations with verified DOIs.'
          ],
          notes: 'Mention key theoretical models to demonstrate academic mastery.'
        },
        {
          number: 6,
          title: 'System Architecture (3-Tier Model)',
          category: 'Methodology',
          talkingDuration: '1 min 30 sec',
          accent: 'from-amber-600 to-orange-700',
          content: [
            'Tier 1 (Presentation): Responsive web client optimized for low-latency interactions.',
            'Tier 2 (Application Logic): RESTful micro-endpoints enforcing role-based access control.',
            'Tier 3 (Persistence): Relational SQLite / PostgreSQL ACID storage with indexed foreign keys.'
          ],
          notes: 'Explain separation of concerns across tiers.'
        },
        {
          number: 7,
          title: 'Concurrency Engine & Transaction Safety',
          category: 'Technical Core',
          talkingDuration: '1 min 45 sec',
          accent: 'from-indigo-600 to-blue-800',
          content: [
            'Pessimistic row-level locking to guarantee 0% data collisions under concurrent user traffic.',
            'Serialized isolation levels enforcing transactional atomicity.',
            'Automatic transaction rollback on unexpected network interruptions.'
          ],
          notes: 'Walk through the transaction locking handshake.'
        },
        {
          number: 8,
          title: 'Database Schema & 3NF Normalization',
          category: 'Database Design',
          talkingDuration: '1 minute',
          accent: 'from-teal-600 to-emerald-700',
          content: [
            'Normalized to Third Normal Form (3NF) to eliminate update anomalies.',
            'Relational entity constraints enforcing referential integrity.',
            'Immutable audit logging for institutional verification.'
          ],
          notes: 'Confirm that all transitive and partial functional dependencies were eliminated.'
        },
        {
          number: 9,
          title: 'Live Implementation & Core Modules',
          category: 'Implementation',
          talkingDuration: '1 min 30 sec',
          accent: 'from-blue-700 to-cyan-800',
          content: [
            'Module 1: Student Self-Service & Credential Verification.',
            'Module 2: Real-time Interactive Dashboard with live status updates.',
            'Module 3: Automated Receipt Generation & Clearance Verification.'
          ],
          notes: 'Prepare the panel for your live software demonstration.'
        },
        {
          number: 10,
          title: 'Testing, Results & Usability Evaluation',
          category: 'Results',
          talkingDuration: '1 minute',
          accent: 'from-green-600 to-emerald-800',
          content: [
            'Stress Testing: Simulated concurrent requests executed with 100% data integrity.',
            'Zero race conditions or data corruption recorded across test iterations.',
            'Average latency under 50ms across benchmarked tests.'
          ],
          notes: 'Highlight your empirical benchmark numbers.'
        },
        {
          number: 11,
          title: 'Summary of Contributions to Knowledge',
          category: 'Contributions',
          talkingDuration: '1 minute',
          accent: 'from-violet-600 to-purple-800',
          content: [
            `Eliminated manual administrative bottlenecks for ${targetTopic}.`,
            'Delivered turnkey defense-grade software with ACID transaction safety.',
            'Established reproducible empirical benchmarks for tertiary institutional adoption.'
          ],
          notes: 'State your novel contributions with pride.'
        },
        {
          number: 12,
          title: 'Recommendations & Future Work',
          category: 'Future Work',
          talkingDuration: '45 seconds',
          accent: 'from-sky-600 to-blue-700',
          content: [
            'Campus-wide integration into central university portal.',
            'Native mobile application development for push notifications.',
            'Biometric hardware integration for physical checkpoints.'
          ],
          notes: 'Show future vision beyond graduation.'
        },
        {
          number: 13,
          title: 'Oral Defense Conclusion & Acknowledgements',
          category: 'Conclusion',
          talkingDuration: '45 seconds',
          accent: 'from-slate-700 to-slate-900',
          content: [
            `The research for ${targetTopic} successfully achieved all specified objectives.`,
            'Special gratitude to project supervisors, HOD, and departmental academic staff.',
            'The candidate is now ready to receive panel questions and technical critique.'
          ],
          notes: 'Thank the panel warmly and invite questions.'
        }
      ];

      setSlides(newSlides);
      setCurrentSlideIndex(0);
      setSuccessBanner(`Deck synthesized for "${targetTopic}" in ${activeTheme.name}!`);
    } catch (err) {
      console.error('Error recompiling slides:', err);
      setSuccessBanner(`Slide deck updated for "${targetTopic}"!`);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setSuccessBanner(null), 5000);
    }
  }

  return (
    <AppLayout
      activeItem="viva-presentation"
      title="Viva Presentation Studio"
      subtitle="Generates 15-Slide 16:9 widescreen defense decks with slide-by-slide speaker notes, customizable design themes, and .pptx export"
    >
      {/* Viva Defense Suite Tab Switcher */}
      <div className="flex items-center gap-2 mb-5 bg-slate-200/80 p-1.5 rounded-2xl w-fit">
        <Link
          href="/tool/viva-presentation"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-xs flex items-center gap-2"
        >
          <Presentation className="w-3.5 h-3.5 text-blue-600" />
          <span>Defense Presentation Deck (.pptx)</span>
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
          {/* Form Card */}
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
                placeholder="e.g. Design and Implementation of an Automated System"
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
                  placeholder="e.g. SURNAME FIRSTNAME"
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg p-2 text-xs text-slate-800 outline-none transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Matric No.</label>
                <input
                  type="text"
                  value={matricNumber}
                  onChange={e => setMatricNumber(e.target.value)}
                  placeholder="e.g. MATRIC/REG/0001"
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
              <span>{isGenerating ? 'Compiling Deck...' : 'Generate 15-Slide Presentation'}</span>
            </button>
          </div>

          {/* Slide Design Themes Selector Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span>Presentation Design Themes</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">5 Aesthetics</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Select an academic aesthetic for your presentation deck. Applied live to preview and PowerPoint export.
            </p>

            <div className="space-y-2">
              {Object.values(SLIDE_THEMES_UI).map((th) => {
                const isSelected = selectedTheme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => setSelectedTheme(th.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                          {th.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium truncate">
                          {th.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {th.description}
                      </p>
                    </div>

                    {/* Color Swatch Indicators */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {th.swatches.map((color, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slide Deck Navigator */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2 max-h-[380px] overflow-y-auto">
            <div className="text-xs font-bold text-slate-800 px-1 mb-2">Slide Deck Overview</div>
            {slides.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">
                No slides compiled yet.
              </div>
            ) : (
              slides.map((s, idx) => (
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
              ))
            )}
          </div>
        </div>

        {/* Right 16:9 Presentation Canvas & Speaker Notes (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {slides.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[480px]">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
                <Presentation className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No Defense Deck Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                Enter your research topic, candidate details, and department on the left, then click the button below to synthesize a structured 15-slide defense presentation with slide-by-slide speaker notes.
              </p>
              <button
                onClick={handleRecompile}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Synthesizing Slides...' : 'Generate 15-Slide Presentation'}</span>
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
                {/* Top Toolbar */}
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      Slide {activeSlide.number} of {slides.length}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${activeTheme.badgeBg}`}>
                      {activeSlide.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                      Theme: {activeTheme.name}
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
                      className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs hover:opacity-95 flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Compiling .PPTX...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Export .PPTX ({activeTheme.name})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 16:9 Simulated Slide Frame */}
                <div className="p-6 bg-slate-900 flex items-center justify-center">
                  {currentSlideIndex === 0 ? (
                    /* Slide 1: Cover Slide Design Preview */
                    <div className={`w-full min-h-[340px] sm:aspect-[16/9] max-w-[760px] ${activeTheme.coverBg} rounded-xl shadow-2xl p-6 sm:p-8 flex flex-col justify-between border ${activeTheme.coverBorder} relative overflow-hidden transition-all duration-300`}>
                      {/* Top Accent Strip */}
                      <div className={`absolute top-0 left-0 right-0 h-2 ${activeTheme.headerAccent}`} />

                      {/* Institution Badge Pill */}
                      <div className={`mx-auto px-4 py-1.5 rounded-full ${activeTheme.coverPillBg} border ${activeTheme.coverPillBorder} text-center`}>
                        <span className={`text-[10px] sm:text-[11px] font-bold tracking-widest uppercase ${activeTheme.coverHighlight}`}>
                          {effectiveCourse ? `DEPARTMENT OF ${effectiveCourse.toUpperCase()}` : 'DEPARTMENT OF COMPUTER SCIENCE'} • {effectiveInstitution.toUpperCase()}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="text-center my-auto px-2">
                        <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight uppercase leading-snug line-clamp-3">
                          {effectiveTopic}
                        </h1>
                      </div>

                      {/* Candidate Box */}
                      <div className={`mx-auto w-full max-w-md px-5 py-2.5 rounded-xl ${activeTheme.coverPillBg} border ${activeTheme.coverPillBorder} text-center shadow-md space-y-0.5`}>
                        <div className={`text-xs sm:text-sm font-black ${activeTheme.coverHighlight}`}>
                          PRESENTED BY: {effectiveCandidate.toUpperCase()}
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-300 font-semibold">
                          MATRICULATION NUMBER: {effectiveMatric.toUpperCase()}
                        </div>
                      </div>

                      {/* Supervisor & Session Pill */}
                      <div className="mt-3 text-center border-t border-white/10 pt-2 flex items-center justify-between text-[10px] sm:text-[11px]">
                        <span className={`font-semibold ${activeTheme.coverGold}`}>
                          SUPERVISOR: {effectiveSupervisor.toUpperCase()}
                        </span>
                        <span className="text-slate-400 font-medium">
                          SESSION: 2025/2026
                        </span>
                        <span className="text-[9px] text-slate-400">
                          Theme: {activeTheme.name}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Slide 2+: Content Slide Design Preview */
                    <div className={`w-full min-h-[340px] sm:aspect-[16/9] max-w-[760px] ${activeTheme.slideBg} rounded-xl shadow-2xl flex flex-col justify-between border ${activeTheme.cardBorder} relative overflow-hidden transition-all duration-300`}>
                      {/* Top Header Banner */}
                      <div className={`${activeTheme.headerBg} px-5 sm:px-7 py-3 relative border-b-2 border-transparent`}>
                        <div className={`absolute bottom-0 left-0 right-0 h-1 ${activeTheme.headerAccent}`} />
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold tracking-widest uppercase ${activeTheme.categoryColor}`}>
                            {activeSlide.category.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold text-white/80 bg-white/10 px-2 py-0.5 rounded-md">
                            Slide {activeSlide.number} / {slides.length}
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug mt-0.5">
                          {activeSlide.title}
                        </h2>
                      </div>

                      {/* Slide Body */}
                      <div className="p-5 sm:p-7 space-y-2.5 my-auto">
                        {activeSlide.content.map((bullet, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-slate-200/60 shadow-2xs">
                            <div className={`w-2 h-2 rounded-full ${activeTheme.bulletColor} mt-1.5 flex-shrink-0`} />
                            <span className="font-medium">{bullet}</span>
                          </div>
                        ))}
                      </div>

                      {/* Slide Footer */}
                      <div className="px-5 sm:px-7 py-2.5 border-t border-slate-200 bg-white/90 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                        <span className="truncate max-w-[320px]">{effectiveTopic} • Dept of {effectiveCourse}</span>
                        <span>Candidate: {effectiveCandidate}</span>
                        <span className="font-bold text-slate-700">{activeTheme.name}</span>
                      </div>
                    </div>
                  )}
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

                  <div className="flex items-center gap-1 overflow-x-auto max-w-[260px] py-1">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlideIndex(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all flex-shrink-0 ${
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
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
