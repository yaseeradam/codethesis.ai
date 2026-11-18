'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import CourseSelect from '@/components/ui/CourseSelect';
import LiveTestingSimulator from '@/components/software/LiveTestingSimulator';
import LiveAppSandbox from '@/components/software/LiveAppSandbox';
import ProjectDocumentUploader from '@/components/software/ProjectDocumentUploader';
import { useAuth } from '@/context/AuthContext';
import { downloadAcademicFile } from '@/lib/downloadHelper';
import { buildDomainSoftware } from '@/lib/domainSoftwareGenerator';
import {
  Code2,
  Download,
  Copy,
  Check,
  Play,
  Terminal,
  Database,
  FileCode,
  Sparkles,
  Layers,
  CheckCircle2,
  Server,
  Loader2,
  Upload,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Wand2,
  Edit3,
  Eye,
  RotateCcw,
  Plus,
  Monitor,
  CheckSquare,
  Activity,
  Cpu,
  Clock,
  CheckCircle,
  ArrowLeft,
  Sliders,
  RotateCw,
  Box,
  Share2,
  Maximize2,
  Minimize2,
  Zap,
  Shield,
  Headphones,
  GraduationCap,
  Star,
  ExternalLink,
  Ban
} from 'lucide-react';

interface SynthesisStage {
  step: number;
  title: string;
  detail: string;
}

const SYNTHESIS_STAGES: SynthesisStage[] = [
  {
    step: 1,
    title: 'Architecting System Entities & Module Contracts',
    detail: 'Analyzing domain specifications, primary entities, and API route contracts...',
  },
  {
    step: 2,
    title: 'Generating Relational Schema & Realistic Defense Seeds',
    detail: 'Creating normalized SQLite tables, foreign keys, and 15+ authentic demonstration records...',
  },
  {
    step: 3,
    title: 'Synthesizing Backend Server API & Business Controllers',
    detail: 'Writing REST endpoints, authentication handlers, and parameter-safe database queries...',
  },
  {
    step: 4,
    title: 'Compiling Responsive Single-Page Web Application',
    detail: 'Designing live interactive dashboard with search filters, dynamic modals, and CSV export...',
  },
  {
    step: 5,
    title: 'Running Verification Tests & Packaging Repository',
    detail: 'Validating syntax integrity, generating 1-click launchers, and creating supervisor handbook...',
  },
];

export default function SoftwareBuilderPage() {
  const { user } = useAuth();
  const [isGenerated, setIsGenerated] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState('server.py');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Form Inputs (matching new design)
  const [applicationName, setApplicationName] = useState('');
  const [applicationDescription, setApplicationDescription] = useState('');
  const [selectedTechStack, setSelectedTechStack] = useState<'Python' | 'PHP' | 'JavaScript' | string>('Python');
  const [selectedDatabase, setSelectedDatabase] = useState<'MySQL' | 'PostgreSQL' | 'SQLite' | 'None'>('SQLite');
  const [moreTechModal, setMoreTechModal] = useState(false);
  const [customStackInput, setCustomStackInput] = useState('');
  const [course, setCourse] = useState(user?.department || 'Computer Science');
  const [institution, setInstitution] = useState(user?.institution || '');

  // Feature Checkboxes
  const [features, setFeatures] = useState({
    userAuth: true,
    adminDashboard: true,
    paymentIntegration: true,
    reportsAnalytics: true,
  });

  // Right Side Navigation Tabs
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'download' | 'share'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Inline progress state
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(15);

  // AI Prompt Modification state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [modificationExplanation, setModificationExplanation] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [codeHistory, setCodeHistory] = useState<Record<string, string[]>>({});

  // Uploader collapse state
  const [showUploader, setShowUploader] = useState(false);
  const [analyzedSpec, setAnalyzedSpec] = useState<any>(null);

  // Testing Simulator state
  const [showTestingSimulator, setShowTestingSimulator] = useState(false);

  // Computed effective stack string for generator
  const effectiveTechStack = customStackInput
    ? customStackInput
    : selectedDatabase === 'None'
    ? `${selectedTechStack} (Standalone Script)`
    : `${selectedTechStack} + ${selectedDatabase}`;

  // Auto-populate from authenticated user profile
  useEffect(() => {
    if (user) {
      if (user.department && !course) setCourse(user.department);
      if (user.institution && !institution) setInstitution(user.institution);
    }
  }, [user]);

  const handleAnalysisComplete = (spec: any) => {
    setAnalyzedSpec(spec);
    if (spec.title) setApplicationName(spec.title);
    if (spec.domain && !course) setCourse(spec.domain);
    if (spec.recommendedStack) {
      setCustomStackInput(spec.recommendedStack);
    }
    setShowUploader(false);
    setSuccessBanner(`Blueprint extracted for "${spec.title}". Click "Generate Software" below.`);
    setTimeout(() => setSuccessBanner(null), 6000);
  };

  const handleResetAll = () => {
    setApplicationName('');
    setApplicationDescription('');
    setSelectedTechStack('Python');
    setSelectedDatabase('SQLite');
    setCustomStackInput('');
    setFeatures({
      userAuth: true,
      adminDashboard: true,
      paymentIntegration: true,
      reportsAnalytics: true,
    });
    setAnalyzedSpec(null);
    setSuccessBanner('Project parameters reset to default.');
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  async function handleBuildSoftware() {
    if (!applicationName.trim()) {
      setSuccessBanner('Please enter an Application Name to begin generation.');
      setTimeout(() => setSuccessBanner(null), 3500);
      return;
    }

    setIsBuilding(true);
    setCurrentStageIndex(0);
    setProgressPercent(15);

    // Smooth stage progression timers
    const timer1 = setTimeout(() => {
      setCurrentStageIndex(1);
      setProgressPercent(35);
    }, 2000);

    const timer2 = setTimeout(() => {
      setCurrentStageIndex(2);
      setProgressPercent(60);
    }, 5000);

    const timer3 = setTimeout(() => {
      setCurrentStageIndex(3);
      setProgressPercent(82);
    }, 8500);

    const timer4 = setTimeout(() => {
      setCurrentStageIndex(3);
      setProgressPercent(92);
    }, 13000);

    try {
      const res = await fetch('/api/ai/build-software', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: applicationName.trim(),
          description: applicationDescription.trim(),
          techStack: effectiveTechStack,
          course: course || 'Computer Science',
          features,
          spec: analyzedSpec,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);

      const data = await res.json();
      if (!data.success || !data.files) {
        throw new Error(data.error || 'Software synthesis service returned incomplete package.');
      }

      if (typeof data.remainingCredits === 'number' && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('credits-updated', { detail: { credits: data.remainingCredits } }));
      }

      // Final completion stage
      setCurrentStageIndex(4);
      setProgressPercent(100);

      const files = data.files;
      setGeneratedFiles(files);

      const primaryFile = Object.keys(files).find((k) => k.endsWith('.py') || k.endsWith('.js') || k.endsWith('.php')) || Object.keys(files)[0];
      setSelectedFile(primaryFile);

      // Brief smooth transition to app view
      setTimeout(() => {
        setIsBuilding(false);
        setIsGenerated(true);
        setActiveTab('preview');
      }, 900);

    } catch (err: any) {
      console.warn('Backend API build error, utilizing client domain synthesis engine:', err);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);

      const fallbackFiles = buildDomainSoftware(applicationName.trim(), effectiveTechStack, course);
      setGeneratedFiles(fallbackFiles);

      const primaryFile = Object.keys(fallbackFiles).find((k) => k.endsWith('.py') || k.endsWith('.js') || k.endsWith('.php')) || Object.keys(fallbackFiles)[0];
      setSelectedFile(primaryFile);

      setCurrentStageIndex(4);
      setProgressPercent(100);

      setTimeout(() => {
        setIsBuilding(false);
        setIsGenerated(true);
        setActiveTab('preview');
      }, 900);
    }
  }

  // AI Prompt Modification Handler
  async function handleModifyCode(overridePrompt?: string) {
    const promptToSend = overridePrompt || aiPrompt;
    if (!promptToSend.trim()) return;

    try {
      setIsModifying(true);
      setModificationExplanation(null);

      setCodeHistory((prev) => ({
        ...prev,
        [selectedFile]: [...(prev[selectedFile] || []), generatedFiles[selectedFile] || ''],
      }));

      const res = await fetch('/api/ai/modify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: selectedFile,
          currentCode: generatedFiles[selectedFile] || '',
          prompt: promptToSend.trim(),
          topic: applicationName.trim(),
          techStack: effectiveTechStack,
          allFiles: generatedFiles,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to modify code.');
      }

      if (typeof data.remainingCredits === 'number' && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('credits-updated', { detail: { credits: data.remainingCredits } }));
      }

      setGeneratedFiles((prev) => ({
        ...prev,
        [selectedFile]: data.modifiedCode,
      }));

      setModificationExplanation(data.explanation || 'Code successfully modified.');
      setAiPrompt('');
      setSuccessBanner(`Applied changes to ${selectedFile}: "${data.explanation || 'Success'}"`);
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: any) {
      console.error('Modify code error:', err);
      setSuccessBanner(`Modification error: ${err.message}`);
      setTimeout(() => setSuccessBanner(null), 5000);
    } finally {
      setIsModifying(false);
    }
  }

  const handleCopy = () => {
    if (!generatedFiles[selectedFile]) return;
    navigator.clipboard.writeText(generatedFiles[selectedFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function handleDownloadZip() {
    try {
      setIsDownloading(true);
      await downloadAcademicFile(
        '/api/generate-software-zip',
        {
          topic: applicationName.trim() || 'academic_software',
          department: course,
          institution: institution,
          techStack: effectiveTechStack,
          files: generatedFiles,
          customFiles: generatedFiles,
        },
        `${(applicationName || 'academic_software').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_repository.zip`
      );
      setSuccessBanner('Complete turnkey repository and defense launchers packaged successfully!');
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err: any) {
      console.error('Download error:', err);
      setSuccessBanner(`Download failed: ${err.message || 'Please check your connection.'}`);
      setTimeout(() => setSuccessBanner(null), 5000);
    } finally {
      setIsDownloading(false);
    }
  }

  const handleShareClick = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  return (
    <AppLayout hideHeader={false} activeItem="software-builder">
      {/* Top Banner Notice */}
      {successBanner && (
        <div className="mb-4 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-indigo-600/70 hover:text-indigo-900 font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Back to Home Button */}
      <div className="mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EEF0FD] hover:bg-[#E3E7FC] text-[#4F46E5] text-xs font-bold transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. HERO HEADER BANNER (Matching Visual Specification)
      ─────────────────────────────────────────────────────────────── */}
      <div className="relative mb-6 rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-[#F0F2FE] via-[#F4F3FF] to-[#ECEBFE] border border-[#E0E4FC] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Title and Icon */}
        <div className="flex items-center gap-4 sm:gap-5 z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#7C3AED] flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 flex-shrink-0">
            <Code2 className="w-8 h-8 text-white stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Software Builder
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl font-medium leading-relaxed">
              Build complete software packages, domain database schemas, and seed records with ease.
            </p>
          </div>
        </div>

        {/* Right 3D Laptop & Rocket Illustration */}
        <div className="relative w-full md:w-80 h-32 flex items-center justify-center md:justify-end pr-2 select-none pointer-events-none">
          <div className="relative w-64 h-32 flex items-center justify-center">
            {/* Ambient Purple Glow */}
            <div className="absolute w-40 h-28 bg-purple-400/20 rounded-full blur-2xl -top-2 right-4"></div>
            
            {/* 3D Floating Document Cards */}
            <div className="absolute left-2 top-4 w-16 h-20 rounded-xl bg-white/80 backdrop-blur-md border border-white/60 shadow-lg p-2 rotate-[-12deg] flex flex-col justify-between">
              <div className="w-8 h-2 rounded bg-indigo-200"></div>
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded bg-slate-200"></div>
                <div className="w-10 h-1.5 rounded bg-slate-200"></div>
              </div>
              <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                <Code2 className="w-3 h-3 text-indigo-600" />
              </div>
            </div>

            {/* 3D Laptop Base & Screen */}
            <div className="relative z-10 w-44 h-28 flex flex-col items-center">
              {/* Laptop Screen */}
              <div className="w-36 h-22 rounded-t-xl bg-[#0F172A] border-2 border-slate-700/80 shadow-2xl p-2 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 via-slate-900 to-purple-950"></div>
                <div className="relative z-10 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="relative z-10 flex items-center justify-center text-center my-auto">
                  <span className="font-mono text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.8)]">
                    &lt;/&gt;
                  </span>
                </div>
                <div className="relative z-10 w-full h-1 bg-indigo-500/30 rounded-full"></div>
              </div>
              {/* Laptop Base */}
              <div className="w-44 h-2.5 bg-gradient-to-b from-slate-300 to-slate-400 rounded-b-xl shadow-lg border-t border-slate-200"></div>
            </div>

            {/* 3D Rocket Launching */}
            <div className="absolute right-0 -top-2 z-20 animate-bounce duration-1000">
              <div className="relative flex flex-col items-center rotate-45">
                <div className="w-10 h-14 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-t-full shadow-xl flex items-center justify-center border-t border-white/40">
                  <div className="w-4 h-4 rounded-full bg-white/30 border border-white/60"></div>
                </div>
                {/* Rocket Thrust Flame */}
                <div className="w-4 h-6 bg-gradient-to-b from-amber-400 via-orange-500 to-transparent rounded-b-full blur-[1px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TWO-COLUMN WORKSPACE (Left: Form | Right: Preview/Code)
      ─────────────────────────────────────────────────────────────── */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start ${isFullscreen ? 'fixed inset-4 z-50 bg-[#F8F9FE] p-6 overflow-y-auto rounded-3xl shadow-2xl' : ''}`}>
        
        {/* ── LEFT COLUMN: PROJECT PARAMETERS CARD (5 cols) ── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            {/* Header: Project Parameters + Reset All */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900 tracking-tight">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Project Parameters</span>
              </div>
              <button
                type="button"
                onClick={handleResetAll}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
            </div>

            {/* Section 1: Application Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Box className="w-3.5 h-3.5 text-indigo-600" />
                <span>Application Details</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Application Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={applicationName}
                  onChange={(e) => setApplicationName(e.target.value)}
                  placeholder="e.g. School Management System"
                  disabled={isBuilding}
                  className="w-full bg-[#FAFBFD] border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium outline-none transition-all shadow-2xs disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Application Description (Optional)
                </label>
                <div className="relative">
                  <textarea
                    value={applicationDescription}
                    onChange={(e) => setApplicationDescription(e.target.value.slice(0, 500))}
                    placeholder="Briefly describe what your software does..."
                    rows={3}
                    disabled={isBuilding}
                    className="w-full bg-[#FAFBFD] border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium outline-none transition-all resize-none shadow-2xs disabled:opacity-60"
                  />
                  <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-mono">
                    {applicationDescription.length}/500
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Tech Stack */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tech Stack</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'Python', icon: '🐍' },
                  { name: 'PHP', icon: '🐘' },
                  { name: 'JavaScript', icon: '⚡' },
                  { name: 'More ∨', isMore: true }
                ].map((item) => {
                  const isSelected = selectedTechStack === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        if (item.isMore) {
                          setMoreTechModal(!moreTechModal);
                        } else {
                          setSelectedTechStack(item.name);
                        }
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#EEF0FE] border-indigo-400 text-indigo-900 shadow-2xs ring-2 ring-indigo-500/15'
                          : 'bg-[#FAFBFD] border-slate-200/90 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {item.icon && <span className="text-xs">{item.icon}</span>}
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* More Tech Stack Dropdown / Custom input */}
              {moreTechModal && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 animate-in fade-in">
                  <p className="text-[11px] font-bold text-slate-600">Choose Specific Framework:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['FastAPI', 'Flask (Zero-Pip)', 'Express (Node)', 'Django', 'React / Vite'].map((stk) => (
                      <button
                        key={stk}
                        type="button"
                        onClick={() => {
                          setSelectedTechStack(stk);
                          setMoreTechModal(false);
                        }}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          selectedTechStack === stk
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {stk}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Database */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>Database</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'MySQL', icon: '🐬' },
                  { name: 'PostgreSQL', icon: '🐘' },
                  { name: 'SQLite', icon: '🪶' },
                  { name: 'None', icon: '🚫' }
                ].map((db) => {
                  const isSelected = selectedDatabase === db.name;
                  return (
                    <button
                      key={db.name}
                      type="button"
                      onClick={() => setSelectedDatabase(db.name as any)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#EEF0FE] border-indigo-400 text-indigo-900 shadow-2xs ring-2 ring-indigo-500/15'
                          : 'bg-[#FAFBFD] border-slate-200/90 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span>{db.icon}</span>
                      <span className="truncate">{db.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Academic Department */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Academic Department</span>
              </div>

              <CourseSelect
                value={course}
                onChange={setCourse}
                label=""
              />
            </div>

            {/* Section 5: Features (Optional) */}
            <div className="space-y-2.5 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Star className="w-3.5 h-3.5 text-indigo-600" />
                <span>Features (Optional)</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-700 font-medium">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={features.userAuth}
                    onChange={(e) => setFeatures((prev) => ({ ...prev, userAuth: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600"
                  />
                  <span>User Authentication</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={features.adminDashboard}
                    onChange={(e) => setFeatures((prev) => ({ ...prev, adminDashboard: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600"
                  />
                  <span>Admin Dashboard</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={features.paymentIntegration}
                    onChange={(e) => setFeatures((prev) => ({ ...prev, paymentIntegration: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600"
                  />
                  <span>Payment Integration</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={features.reportsAnalytics}
                    onChange={(e) => setFeatures((prev) => ({ ...prev, reportsAnalytics: e.target.checked }))}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 accent-indigo-600"
                  />
                  <span>Reports & Analytics</span>
                </label>
              </div>
            </div>

            {/* Bottom Generate Button */}
            <button
              type="button"
              onClick={handleBuildSoftware}
              disabled={!applicationName.trim() || isBuilding}
              className="w-full bg-gradient-to-r from-[#4F46E5] via-[#4338CA] to-[#3B82F6] hover:from-[#4338CA] hover:to-[#2563EB] text-white font-black py-3.5 px-5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isBuilding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Architecture...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200 fill-indigo-200" />
                  <span>Generate Software &rarr;</span>
                </>
              )}
            </button>

            {/* Proposal / Chapter 3 Extraction Link */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setShowUploader(!showUploader)}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {showUploader ? '▲ Hide Chapter 3 Extractor' : '📄 Have a Thesis Proposal or Chapter 3? Auto-extract fields'}
              </button>
            </div>

            {showUploader && (
              <div className="p-4 border border-indigo-100 rounded-2xl bg-[#FAFBFD] animate-in fade-in">
                <ProjectDocumentUploader onAnalysisComplete={handleAnalysisComplete} />
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: OUTPUT WORKSPACE CARD (7 cols) ── */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Top Tabs Bar (Live Preview | Code Files | Download | Share | Fullscreen) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-2xs flex items-center justify-between gap-2 select-none">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-[#EEF0FE] text-[#4F46E5] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Monitor className="w-4 h-4 text-indigo-600" />
                <span>Live Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-[#EEF0FE] text-[#4F46E5] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span>Code Files</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={!isGenerated || isDownloading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-40"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Download</span>
              </button>

              <button
                type="button"
                onClick={handleShareClick}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">{shareCopied ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              CASE 1: EMPTY STATE (Matching Exact Design Specification)
          ─────────────────────────────────────────────────────────────── */}
          {!isGenerated && !isBuilding && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col justify-between min-h-[580px] text-center">
              <div className="my-auto flex flex-col items-center justify-center py-6">
                
                {/* 3D Browser & Play Button Floating Graphic */}
                <div className="relative mb-6 select-none">
                  {/* Background Soft Glow */}
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl"></div>

                  {/* 3D Browser Card */}
                  <div className="relative w-44 h-32 rounded-2xl bg-gradient-to-b from-[#FAFBFD] to-[#EFF2FE] border border-indigo-200/80 shadow-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    </div>

                    <div className="text-center font-mono font-extrabold text-2xl text-indigo-600/70 tracking-widest">
                      &lt;/&gt;
                    </div>

                    <div className="w-full h-1.5 bg-indigo-200/40 rounded-full"></div>
                  </div>

                  {/* 3D Purple Play Button */}
                  <div className="absolute -bottom-3 -right-3 w-14 h-14 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#7C3AED] shadow-xl shadow-indigo-500/40 flex items-center justify-center text-white border-2 border-white cursor-pointer hover:scale-105 transition-transform">
                    <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                  </div>

                  {/* Floating Cursor Pointer */}
                  <div className="absolute -bottom-2 -left-3 w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-white rotate-[-35deg]"></div>
                  </div>

                  {/* Sparkling Star */}
                  <div className="absolute -top-3 -right-2 text-indigo-500 text-lg">✦</div>
                  <div className="absolute -top-1 -left-4 text-purple-400 text-sm">✦</div>
                </div>

                {/* Headline & Description */}
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                  Your Generated Software Will Appear Here
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                  Fill in the project parameters on the left and click &ldquo;Generate Software&rdquo; to get started.
                </p>
              </div>

              {/* Bottom Feature Highlights Bar */}
              <div className="mt-8 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAFBFD] border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                    <Zap className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Fast Generation</p>
                    <p className="text-[11px] text-slate-400">In seconds</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAFBFD] border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                    <Shield className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">Secure & Reliable</p>
                    <p className="text-[11px] text-slate-400">Your project is safe</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAFBFD] border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                    <Headphones className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800">24/7 Support</p>
                    <p className="text-[11px] text-slate-400">We&apos;re here to help</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              CASE 2: GENERATION IN PROGRESS (Clean Stage Progress)
          ─────────────────────────────────────────────────────────────── */}
          {isBuilding && (
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-md flex flex-col items-center justify-center min-h-[580px] text-center animate-in fade-in duration-300">
              {/* Spinner */}
              <div className="relative mb-6 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-indigo-600" />
                </div>
              </div>

              {/* Title & Topic */}
              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
                Synthesizing Custom Academic Software
              </h3>
              <p className="text-xs text-indigo-700 font-semibold mb-6 max-w-lg truncate">
                &ldquo;{applicationName.trim()}&rdquo; &bull; {effectiveTechStack}
              </p>

              {/* Progress Bar */}
              <div className="w-full max-w-md bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Active Stage Banner */}
              <div className="w-full max-w-md bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 mb-6 text-left shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 mb-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping inline-block" />
                  <span>{SYNTHESIS_STAGES[currentStageIndex]?.title}</span>
                </div>
                <p className="text-[11px] text-indigo-700/80 leading-relaxed pl-4">
                  {SYNTHESIS_STAGES[currentStageIndex]?.detail}
                </p>
              </div>

              {/* Step By Step Checklist */}
              <div className="w-full max-w-md space-y-2 text-left mb-6">
                {SYNTHESIS_STAGES.map((stg, idx) => {
                  const isDone = currentStageIndex > idx;
                  const isCurrent = currentStageIndex === idx;
                  return (
                    <div
                      key={stg.step}
                      className={`flex items-center gap-2.5 text-xs py-1 transition-opacity ${
                        isDone ? 'text-slate-700 font-medium' : isCurrent ? 'text-indigo-700 font-bold' : 'text-slate-300'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-200 text-[10px] flex items-center justify-center shrink-0">
                          {stg.step}
                        </span>
                      )}
                      <span className="truncate">{stg.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              CASE 3: GENERATED STATE (Live Interactive Preview / Code IDE)
          ─────────────────────────────────────────────────────────────── */}
          {isGenerated && !isBuilding && (
            <div className="space-y-4">
              {/* QA Simulator Trigger Bar */}
              <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200/70 rounded-2xl text-xs">
                <div className="flex items-center gap-2 font-bold text-indigo-950">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <span>Software Package Ready for Defense Demo</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTestingSimulator(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Run QA Test Runner
                </button>
              </div>

              {/* VIEW 1: LIVE INTERACTIVE PREVIEW */}
              {activeTab === 'preview' && (
                <LiveAppSandbox
                  htmlCode={generatedFiles['public/index.html'] || ''}
                  topic={applicationName}
                  techStack={effectiveTechStack}
                  onRunAutomatedTests={() => setShowTestingSimulator(true)}
                />
              )}

              {/* VIEW 2: CODE FILES IDE */}
              {activeTab === 'code' && (
                <div className="bg-[#0B132B] rounded-3xl overflow-hidden border border-slate-800 shadow-xl text-white">
                  {/* IDE Top Header */}
                  <div className="bg-[#070F2B] px-4 py-3 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500" />
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs font-mono text-cyan-400 ml-2 font-bold">{selectedFile}</span>
                      <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                        {effectiveTechStack}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isEditMode ? 'bg-cyan-600 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'
                        }`}
                      >
                        {isEditMode ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                        <span>{isEditMode ? 'View Mode' : 'Direct Edit'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Prompt Modification Bar */}
                  <div className="bg-[#0D1533] p-3 border-b border-slate-800/80 space-y-2">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <div className="flex-1 w-full flex items-center gap-2 bg-[#070E24] border border-slate-700/80 rounded-xl px-3 py-1.5 focus-within:border-cyan-500 transition-colors">
                        <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleModifyCode()}
                          placeholder={`Prompt AI to modify ${selectedFile} (e.g. 'Add export to CSV', 'Add password hash verification')...`}
                          className="w-full bg-transparent text-xs text-white placeholder-slate-400 outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleModifyCode()}
                        disabled={!aiPrompt.trim() || isModifying}
                        className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20 active:scale-95 disabled:opacity-50 transition-all flex-shrink-0 cursor-pointer"
                      >
                        {isModifying ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Applying...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Modify with AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* File Selector Tabs */}
                  <div className="bg-[#070E24] px-4 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
                    {Object.keys(generatedFiles).map((fn) => (
                      <button
                        key={fn}
                        type="button"
                        onClick={() => setSelectedFile(fn)}
                        className={`px-3 py-1 rounded-lg font-mono text-[11px] transition-colors cursor-pointer ${
                          selectedFile === fn
                            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {fn}
                      </button>
                    ))}
                  </div>

                  {/* Code Editor Body */}
                  <div className="p-4 overflow-x-auto max-h-[500px]">
                    {isEditMode ? (
                      <textarea
                        value={generatedFiles[selectedFile] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGeneratedFiles((prev) => ({ ...prev, [selectedFile]: val }));
                        }}
                        className="w-full h-[400px] bg-transparent font-mono text-xs text-emerald-300 outline-none resize-none"
                      />
                    ) : (
                      <pre className="font-mono text-xs text-slate-200 leading-relaxed">
                        <code>{generatedFiles[selectedFile] || '// No content'}</code>
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* QA Testing Simulator Modal */}
      {showTestingSimulator && (
        <LiveTestingSimulator
          isOpen={showTestingSimulator}
          onClose={() => setShowTestingSimulator(false)}
          topic={applicationName}
          htmlCode={generatedFiles['public/index.html'] || ''}
          onDownloadZip={handleDownloadZip}
          isDownloading={isDownloading}
        />
      )}
    </AppLayout>
  );
}
