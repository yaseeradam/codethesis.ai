'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AppLayout from '@/components/layout/AppLayout';
import CourseSelect from '@/components/ui/CourseSelect';
import LiveTestingSimulator from '@/components/software/LiveTestingSimulator';
import LiveAppSandbox from '@/components/software/LiveAppSandbox';
import ProjectDocumentUploader from '@/components/software/ProjectDocumentUploader';
import RequirementClarificationModal from '@/components/software/RequirementClarificationModal';
import { ClarificationQuestion } from '@/app/api/ai/clarify-requirements/route';
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
  Ban,
  FileText
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

/* ─────────────────────────────────────────────────────────────
   CUSTOM VECTOR SVG TECH & DATABASE ICONS (Zero Emojis)
─────────────────────────────────────────────────────────────── */
function PythonIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.91 2C6.73 2 7.05 4.25 7.05 4.25L7.06 6.59H12.02V7.37H5.16C5.16 7.37 2 7.01 2 12.16C2 17.31 4.77 17.06 4.77 17.06H6.42V14.74C6.42 14.74 6.33 11.95 9.17 11.95H14.07C14.07 11.95 16.79 12.04 16.79 9.39V4.53C16.79 4.53 17.18 2 11.91 2ZM9.49 3.51C10.02 3.51 10.45 3.94 10.45 4.47C10.45 5 10.02 5.43 9.49 5.43C8.96 5.43 8.53 5 8.53 4.47C8.53 3.94 8.96 3.51 9.49 3.51Z"
        fill="#3776AB"
      />
      <path
        d="M12.09 22C17.27 22 16.95 19.75 16.95 19.75L16.94 17.41H11.98V16.63H18.84C18.84 16.63 22 16.99 22 11.84C22 6.69 19.23 6.94 19.23 6.94H17.58V9.26C17.58 9.26 17.67 12.05 14.83 12.05H9.93C9.93 12.05 7.21 11.96 7.21 14.61V19.47C7.21 19.47 6.82 22 12.09 22ZM14.51 20.49C13.98 20.49 13.55 20.06 13.55 19.53C13.55 19 13.98 18.57 14.51 18.57C15.04 18.57 15.47 19 15.47 19.53C15.47 20.06 15.04 20.49 14.51 20.49Z"
        fill="#FFD438"
      />
    </svg>
  );
}

function PhpIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="16" rx="15" ry="10" fill="#777BB4" />
      <path
        d="M8.5 13H11C12.5 13 13.2 13.8 13 15C12.8 16.2 11.8 17 10.3 17H9.2L8.5 20H7L8.5 13ZM9.6 15.8H10.4C11.1 15.8 11.6 15.5 11.7 15C11.8 14.5 11.4 14.2 10.8 14.2H10L9.6 15.8Z"
        fill="white"
      />
      <path
        d="M13.8 13H15.3L14.7 15.5H16.2C17.7 15.5 18.5 16.3 18.3 17.5C18.1 18.7 17.1 20 15.6 20H12.3L13.8 13ZM14.5 16.7L14 18.8H15.1C15.8 18.8 16.5 18.3 16.7 17.7C16.8 17.2 16.5 16.7 15.8 16.7H14.5Z"
        fill="white"
      />
      <path
        d="M19.5 13H22C23.5 13 24.2 13.8 24 15C23.8 16.2 22.8 17 21.3 17H20.2L19.5 20H18L19.5 13ZM20.6 15.8H21.4C22.1 15.8 22.6 15.5 22.7 15C22.8 14.5 22.4 14.2 21.8 14.2H21L20.6 15.8Z"
        fill="white"
      />
    </svg>
  );
}

function JavaScriptIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4" fill="#F7DF1E" />
      <path
        d="M7.5 18.5C6.5 18.5 5.8 18 5.4 17.2L6.8 16.3C7.1 16.8 7.5 17.1 8 17.1C8.6 17.1 9 16.7 9 15.8V11H10.8V15.8C10.8 17.5 9.8 18.5 7.5 18.5ZM13.8 18.5C12.3 18.5 11.3 17.6 11.3 16.3C11.3 15 12.2 14.4 13.6 13.8L14.2 13.5C14.8 13.2 15.2 12.9 15.2 12.4C15.2 11.9 14.8 11.6 14.1 11.6C13.4 11.6 12.9 11.9 12.6 12.5L11.2 11.6C11.7 10.6 12.8 10 14.2 10C15.8 10 17 10.9 17 12.3C17 13.6 16.1 14.3 14.7 14.9L14.1 15.1C13.5 15.4 13.2 15.7 13.2 16.2C13.2 16.7 13.6 17 14.3 17C15 17 15.5 16.6 15.8 16L17.1 17C16.4 18 15.3 18.5 13.8 18.5Z"
        fill="#000000"
      />
    </svg>
  );
}

function MySqlIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21.5 12C20.8 9.5 18.5 8 16.2 8C14.5 8 13.2 8.7 12.3 9.6C11.5 8.7 10.2 8 8.5 8C5.5 8 3 10.5 3 13.5C3 17.5 7.5 20.5 12 21C16.5 20.5 21 17.5 21 13.5C21 13 21.2 12.5 21.5 12Z"
        fill="#00758F"
      />
      <circle cx="9" cy="13" r="1.5" fill="white" />
      <path
        d="M12.5 10C14 10 15.5 11 16 12.5C16.5 14 16 15.5 15 16.5C14 17.5 12.5 17.5 11.5 17C10.5 16.5 10 15 10.5 13.5C11 12 11.5 10 12.5 10Z"
        fill="#F29111"
      />
    </svg>
  );
}

function PostgreSqlIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
        fill="#336791"
      />
      <path
        d="M17.2 16.5C16.5 17.2 15.2 17.8 13.8 17.8C11.5 17.8 9.8 16.5 9.2 15C8.8 14 8.8 12.5 9.5 11.5C10.2 10.5 11.5 10 13 10C14.2 10 15.2 10.4 16 11.1L15 12.3C14.5 11.8 13.8 11.5 13 11.5C12 11.5 11.2 11.9 10.8 12.5C10.4 13.2 10.4 14.1 10.7 14.8C11.1 15.7 12.2 16.3 13.5 16.3C14.3 16.3 15.1 16 15.6 15.5L17.2 16.5Z"
        fill="white"
      />
    </svg>
  );
}

function SqliteIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 6C4 4.34 7.58 3 12 3C16.42 3 20 4.34 20 6C20 7.66 16.42 9 12 9C7.58 9 4 7.66 4 6Z"
        fill="#003B57"
      />
      <path
        d="M4 10C4 11.66 7.58 13 12 13C16.42 13 20 11.66 20 10V8.2C18.2 9.3 15.2 10 12 10C8.8 10 5.8 9.3 4 8.2V10Z"
        fill="#005B82"
      />
      <path
        d="M4 14C4 15.66 7.58 17 12 17C16.42 17 20 15.66 20 14V12.2C18.2 13.3 15.2 14 12 14C8.8 14 5.8 13.3 4 12.2V14Z"
        fill="#007DAF"
      />
      <path
        d="M4 18C4 19.66 7.58 21 12 21C16.42 21 20 19.66 20 18V16.2C18.2 17.3 15.2 18 12 18C8.8 18 5.8 17.3 4 16.2V18Z"
        fill="#00A2E0"
      />
    </svg>
  );
}

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

  // Requirement Clarification & Pre-flight Analysis state
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [isAnalyzingRequirements, setIsAnalyzingRequirements] = useState(false);
  const [clarificationData, setClarificationData] = useState<{
    summary: string;
    questions: ClarificationQuestion[];
  }>({ summary: '', questions: [] });
  const [confirmedArchitectureAnswers, setConfirmedArchitectureAnswers] = useState<Record<string, string>>({});

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

  async function handleInitiateGeneration() {
    if (!applicationName.trim()) {
      setSuccessBanner('Please enter an Application Name to begin generation.');
      setTimeout(() => setSuccessBanner(null), 3500);
      return;
    }

    setIsAnalyzingRequirements(true);
    try {
      const res = await fetch('/api/ai/clarify-requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: applicationName.trim(),
          description: applicationDescription.trim(),
          techStack: effectiveTechStack,
          course: course || 'Computer Science',
          features,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        setClarificationData({
          summary: data.summary || '',
          questions: data.questions,
        });
        setShowClarificationModal(true);
      } else {
        // Fallback directly to build
        executeBuildSoftware({});
      }
    } catch (err) {
      console.warn('Clarification check failed, proceeding directly to software build:', err);
      executeBuildSoftware({});
    } finally {
      setIsAnalyzingRequirements(false);
    }
  }

  async function executeBuildSoftware(architectureAnswers: Record<string, string> = {}) {
    setConfirmedArchitectureAnswers(architectureAnswers);
    setShowClarificationModal(false);
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
          architectureAnswers,
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
        setSuccessBanner(`Software architecture & turnkey codebase successfully compiled for "${applicationName.trim()}"!`);
        setTimeout(() => setSuccessBanner(null), 6000);
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
    <AppLayout hideHeader={false} hideSidebar={true} fullWidth={true} hideFooter={true} activeItem="software-builder">
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 h-auto lg:h-[calc(100vh-65px)] overflow-y-auto lg:overflow-hidden">

        {/* ─────────────────────────────────────────────────────────────
            1. LEFT SIDEBAR: PROJECT PARAMETERS
        ─────────────────────────────────────────────────────────────── */}
        <aside className="w-full lg:w-[380px] xl:w-[420px] 2xl:w-[450px] flex-shrink-0 bg-white border-r border-slate-200/90 flex flex-col h-auto lg:h-full overflow-hidden z-20 shadow-xs">
          
          {/* Header: Project Parameters + Reset All */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
            <div className="flex items-center gap-2.5 text-sm font-black text-slate-900 tracking-tight">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Sliders className="w-4 h-4 text-indigo-600" />
              </div>
              <span>Project Parameters</span>
            </div>
            <button
              type="button"
              onClick={handleResetAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Reset parameters to defaults"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-5">
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
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tech Stack</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'Python', icon: PythonIcon },
                  { name: 'PHP', icon: PhpIcon },
                  { name: 'JavaScript', icon: JavaScriptIcon },
                  { name: 'More', isMore: true, icon: ChevronDown }
                ].map((item) => {
                  const isSelected = selectedTechStack === item.name || (item.isMore && !['Python', 'PHP', 'JavaScript'].includes(selectedTechStack));
                  const IconComp = item.icon;
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
                      <IconComp className="w-3.5 h-3.5 flex-shrink-0" />
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
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>Database</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'MySQL', icon: MySqlIcon },
                  { name: 'PostgreSQL', icon: PostgreSqlIcon },
                  { name: 'SQLite', icon: SqliteIcon },
                  { name: 'None', icon: Ban }
                ].map((db) => {
                  const isSelected = selectedDatabase === db.name;
                  const IconComp = db.icon;
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
                      <IconComp className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{db.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Academic Department */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
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
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
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

            {/* Proposal / Chapter 3 Extraction Link */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => setShowUploader(!showUploader)}
                className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {showUploader ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Hide Chapter 3 Extractor</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Have a Thesis Proposal or Chapter 3? Auto-extract fields</span>
                  </>
                )}
              </button>
            </div>

            {showUploader && (
              <div className="p-4 border border-indigo-100 rounded-2xl bg-[#FAFBFD] animate-in fade-in">
                <ProjectDocumentUploader onAnalysisComplete={handleAnalysisComplete} />
              </div>
            )}
          </div>

          {/* Sticky Sidebar Footer: Generate Button */}
          <div className="p-4 sm:p-5 bg-white border-t border-slate-150 flex-shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
            <button
              type="button"
              onClick={handleInitiateGeneration}
              disabled={!applicationName.trim() || isBuilding || isAnalyzingRequirements}
              className="w-full bg-gradient-to-r from-[#4F46E5] via-[#4338CA] to-[#3B82F6] hover:from-[#4338CA] hover:to-[#2563EB] text-white font-black py-3.5 px-5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isBuilding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Architecture...</span>
                </>
              ) : isAnalyzingRequirements ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Reviewing Parameters & Scope...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200 fill-indigo-200" />
                  <span>Generate Software &rarr;</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* ─────────────────────────────────────────────────────────────
            2. RIGHT MAIN WORKSPACE CANVAS
        ─────────────────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 h-auto lg:h-full overflow-y-auto bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 space-y-6">

          {/* Top Banner Notice */}
          {successBanner && (
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
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
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EEF0FD] hover:bg-[#E3E7FC] text-[#4F46E5] text-xs font-bold transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Hero Header Banner */}
          <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-[#F0F2FE] via-[#F4F3FF] to-[#ECEBFE] border border-[#E0E4FC] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
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

            {/* Right 3D Laptop & Rocket Illustration (Futuristic Coding Launchpad) */}
            <div className="relative w-full md:w-80 lg:w-96 h-36 sm:h-40 flex items-center justify-center md:justify-end pr-2 select-none pointer-events-none">
              <div className="relative w-full h-full flex items-center justify-center md:justify-end">
                <Image
                  src="/assets/software_builder_hero_3d.png"
                  alt="Futuristic Coding Launchpad"
                  width={400}
                  height={225}
                  priority
                  className="object-contain max-h-full drop-shadow-xl"
                />
              </div>
            </div>
          </div>

          {/* Main Output Workspace Wrapper */}
          <div className={`space-y-4 ${isFullscreen ? 'fixed inset-4 z-50 bg-[#F8F9FE] p-6 overflow-y-auto rounded-3xl shadow-2xl' : ''}`}>
          
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
                
                {/* 3D Browser & Play Button Floating Graphic (Live Preview Across Devices) */}
                <div className="relative w-64 sm:w-80 h-44 sm:h-52 mb-6 mx-auto flex items-center justify-center select-none">
                  <Image
                    src="/assets/software_builder_preview_3d.png"
                    alt="Live Preview Across Devices"
                    width={400}
                    height={240}
                    priority
                    className="object-contain max-h-full drop-shadow-xl"
                  />
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
        </main>
      </div>

      {/* AI Architectural Clarification Modal */}
      <RequirementClarificationModal
        isOpen={showClarificationModal}
        topic={applicationName.trim()}
        department={course}
        summary={clarificationData.summary}
        questions={clarificationData.questions}
        onConfirm={(answers) => executeBuildSoftware(answers)}
        onSkip={() => executeBuildSoftware({})}
        onClose={() => setShowClarificationModal(false)}
        isBuilding={isBuilding}
      />

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
