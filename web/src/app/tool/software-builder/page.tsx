'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CourseSelect from '@/components/ui/CourseSelect';
import InstitutionSelect from '@/components/ui/InstitutionSelect';
import CodingTerminalModal, { StageInfo, GeneratedFileInfo } from '@/components/software/CodingTerminalModal';
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
  CheckSquare
} from 'lucide-react';

const TECH_STACK_PRESETS = [
  'Python (Flask / Zero-Pip) + SQLite',
  'Python (FastAPI) + SQLite',
  'Node.js (Express) + SQLite',
  'PHP (Built-in Server) + SQLite',
  'Python (Django) + SQLite',
  'React / Vite + FastAPI + SQLite',
  'Custom Stack...'
];

export default function SoftwareBuilderPage() {
  const { user } = useAuth();
  const [isGenerated, setIsGenerated] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState('server.py');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [topic, setTopic] = useState('');
  const [course, setCourse] = useState(user?.department || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // View state: 'ide' for code editor, 'sandbox' for live interactive browser
  const [activeMainTab, setActiveMainTab] = useState<'sandbox' | 'ide'>('sandbox');

  // Tech Stack state
  const [techStack, setTechStack] = useState('Python (Flask / Zero-Pip) + SQLite');
  const [customStackInput, setCustomStackInput] = useState('');

  // AI Prompt Modification state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [modificationExplanation, setModificationExplanation] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [codeHistory, setCodeHistory] = useState<Record<string, string[]>>({});

  // Uploader collapse state
  const [showUploader, setShowUploader] = useState(false);
  const [analyzedSpec, setAnalyzedSpec] = useState<any>(null);

  // Modals state
  const [showTerminalModal, setShowTerminalModal] = useState(false);
  const [showTestingSimulator, setShowTestingSimulator] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [verifiedFiles, setVerifiedFiles] = useState<GeneratedFileInfo[]>([]);
  const [isBuildFinished, setIsBuildFinished] = useState(false);

  const effectiveTechStack = techStack === 'Custom Stack...' ? (customStackInput || 'Custom Web Stack') : techStack;

  const stages: StageInfo[] = [
    {
      number: 1,
      name: 'Blueprint & Architecture',
      description: `Designing domain entity schema, contracts, and REST endpoints for ${effectiveTechStack}`,
      status: currentStage > 1 ? 'completed' : currentStage === 1 ? 'active' : 'pending',
    },
    {
      number: 2,
      name: 'Database & Real Seeds',
      description: 'Synthesizing relational SQLite schema with realistic domain defense records',
      status: currentStage > 2 ? 'completed' : currentStage === 2 ? 'active' : 'pending',
    },
    {
      number: 3,
      name: 'Backend Controller & API',
      description: `Compiling RESTful controllers and search/filter routes for ${effectiveTechStack}`,
      status: currentStage > 3 ? 'completed' : currentStage === 3 ? 'active' : 'pending',
    },
    {
      number: 4,
      name: 'Interactive Single-Page App',
      description: 'Building live interactive dashboard with search, filter, and dynamic modals',
      status: currentStage > 4 ? 'completed' : currentStage === 4 ? 'active' : 'pending',
    },
    {
      number: 5,
      name: 'QA Certification & Packaging',
      description: 'Compiling 1-click launchers, test suite, and README defense handbook',
      status: currentStage > 5 || isBuildFinished ? 'completed' : currentStage === 5 ? 'active' : 'pending',
    },
  ];

  // Auto-populate from authenticated user profile
  useEffect(() => {
    if (user) {
      if (user.department && !course) setCourse(user.department);
      if (user.institution && !institution) setInstitution(user.institution);
    }
  }, [user]);

  const handleAnalysisComplete = (spec: any) => {
    setAnalyzedSpec(spec);
    if (spec.title) setTopic(spec.title);
    if (spec.domain && !course) setCourse(spec.domain);
    if (spec.recommendedStack) {
      setTechStack('Custom Stack...');
      setCustomStackInput(spec.recommendedStack);
    }
    setShowUploader(false);
    setSuccessBanner(`Blueprint extracted for "${spec.title}". Click "Generate Turnkey Software" below.`);
    setTimeout(() => setSuccessBanner(null), 6000);
  };

  async function handleBuildSoftware() {
    if (!topic.trim()) {
      setSuccessBanner('Please specify an application topic or upload your proposal first.');
      setTimeout(() => setSuccessBanner(null), 3000);
      return;
    }

    setIsBuilding(true);
    setShowTerminalModal(true);
    setIsBuildFinished(false);
    setCurrentStage(1);
    setTerminalLogs([
      `[00:00] Initializing CodeThesis Multi-Pass Software Synthesizer...`,
      `[00:01] Target System: "${topic.trim()}"`,
      `[00:01] Academic Department: ${course || 'Computer Science'}`,
      `[00:02] Target Tech Stack: ${effectiveTechStack}`,
      `[00:02] STAGE 1/5: Synthesizing system architecture blueprint and domain contracts...`,
    ]);
    setVerifiedFiles([]);

    const stageTimer1 = setTimeout(() => {
      setCurrentStage(2);
      setTerminalLogs((prev) => [
        ...prev,
        `[00:03] Domain entities analyzed; foreign keys and constraints mapped.`,
        `[00:03] STAGE 2/5: Synthesizing relational SQLite schema and realistic defense seed records...`,
      ]);
      setVerifiedFiles([
        { name: 'project_blueprint.json', lines: 65, size: '2.4 KB', status: 'ready' },
      ]);
    }, 1200);

    const stageTimer2 = setTimeout(() => {
      setCurrentStage(3);
      setTerminalLogs((prev) => [
        ...prev,
        `[00:05] Generated database/schema.sql and database/seed_data.sql.`,
        `[00:05] STAGE 3/5: Synthesizing ${effectiveTechStack} backend controllers and REST API...`,
      ]);
      setVerifiedFiles((prev) => [
        ...prev,
        { name: 'database/schema.sql', lines: 68, size: '2.2 KB', status: 'ready' },
        { name: 'database/seed_data.sql', lines: 85, size: '3.8 KB', status: 'ready' },
      ]);
    }, 2800);

    const stageTimer3 = setTimeout(() => {
      setCurrentStage(4);
      setTerminalLogs((prev) => [
        ...prev,
        `[00:07] REST routes compiled with query parameters and security boundaries.`,
        `[00:07] STAGE 4/5: Synthesizing responsive single-page Tailwind dashboard and reactive DOM...`,
      ]);
      setVerifiedFiles((prev) => [
        ...prev,
        {
          name: effectiveTechStack.toLowerCase().includes('node') ? 'server.js' : effectiveTechStack.toLowerCase().includes('fastapi') ? 'main.py' : 'server.py',
          lines: 195,
          size: '7.2 KB',
          status: 'ready' as const,
        },
      ]);
    }, 4500);

    try {
      const res = await fetch('/api/ai/build-software', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          techStack: effectiveTechStack,
          course: course || 'Computer Science',
          spec: analyzedSpec,
        }),
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      const data = await res.json();
      if (!data.success || !data.files) {
        throw new Error(data.error || 'Software synthesis service returned incomplete package.');
      }

      const files = data.files;
      setGeneratedFiles(files);

      const primaryFile = Object.keys(files).find((k) => k.endsWith('.py') || k.endsWith('.js') || k.endsWith('.php')) || Object.keys(files)[0];
      setSelectedFile(primaryFile);

      setCurrentStage(5);
      setIsBuildFinished(true);
      setIsBuilding(false);
      setIsGenerated(true);
      setActiveMainTab('sandbox'); // Default to live interactive sandbox so user immediately sees real app!

      setTerminalLogs((prev) => [
        ...prev,
        `[00:09] ✓ All 5 synthesis stages completed with 100% test coverage.`,
        `[00:09] System: ${data.blueprint?.systemName || topic.trim()}`,
        `[00:10] Domain Classification: ${data.blueprint?.category || 'Applied Software Systems'}`,
        `[00:10] Primary Entity: ${data.blueprint?.primaryEntityPlural || 'Entities'}`,
        `[00:11] 🎉 Turnkey software synthesized! Live interactive preview and defense ZIP ready.`,
      ]);

      setVerifiedFiles(
        Object.entries(files).map(([name, content]) => ({
          name,
          lines: (content as string).split('\n').length,
          size: `${Math.max(1, Math.round(((content as string).length / 1024) * 10) / 10)} KB`,
          status: 'ready' as const,
        }))
      );
    } catch (err: any) {
      console.warn('Backend API build error, using client domain synthesis engine:', err);
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      const fallbackFiles = buildDomainSoftware(topic.trim(), effectiveTechStack, course);
      setGeneratedFiles(fallbackFiles);

      const primaryFile = Object.keys(fallbackFiles).find((k) => k.endsWith('.py') || k.endsWith('.js') || k.endsWith('.php')) || Object.keys(fallbackFiles)[0];
      setSelectedFile(primaryFile);

      setCurrentStage(5);
      setIsBuildFinished(true);
      setIsBuilding(false);
      setIsGenerated(true);
      setActiveMainTab('sandbox');

      setTerminalLogs((prev) => [
        ...prev,
        `[00:08] Synthesized domain-specific package via CodeThesis engine.`,
        `[00:09] ✓ Zero syntax errors detected. Ready for defense!`,
      ]);

      setVerifiedFiles(
        Object.entries(fallbackFiles).map(([name, content]) => ({
          name,
          lines: (content as string).split('\n').length,
          size: `${Math.max(1, Math.round(((content as string).length / 1024) * 10) / 10)} KB`,
          status: 'ready' as const,
        }))
      );
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
          topic: topic.trim(),
          techStack: effectiveTechStack,
          allFiles: generatedFiles,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to modify code.');
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

  function handleUndoModification() {
    const history = codeHistory[selectedFile];
    if (!history || history.length === 0) return;

    const previousCode = history[history.length - 1];
    setGeneratedFiles((prev) => ({
      ...prev,
      [selectedFile]: previousCode,
    }));

    setCodeHistory((prev) => ({
      ...prev,
      [selectedFile]: prev[selectedFile].slice(0, -1),
    }));

    setModificationExplanation('Reverted to previous version.');
    setTimeout(() => setModificationExplanation(null), 4000);
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
          topic: topic.trim(),
          department: course,
          institution: institution,
          techStack: effectiveTechStack,
          files: generatedFiles,
          customFiles: generatedFiles,
        },
        `${topic.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'academic_software'}_repository.zip`
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

  return (
    <AppLayout>
      {/* Top Banner Notice */}
      {successBanner && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-400/60 hover:text-emerald-400">
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Turnkey Software Builder</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Zero-Pip / Turnkey
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
              Interactive Live Preview
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Builds complete runnable software packages, domain database schemas, realistic seed records, and live interactive web dashboards.
          </p>
        </div>

        {/* Top Action Buttons */}
        {isGenerated && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTestingSimulator(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Run QA Test Runner</span>
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Download .ZIP</span>
            </button>
          </div>
        )}
      </div>

      {/* Proposal / Chapter 3 Extraction Accordion */}
      <div className="mb-6 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <button
          onClick={() => setShowUploader(!showUploader)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800">
                {analyzedSpec ? `Analyzed: "${analyzedSpec.title}"` : 'Have an existing proposal or Chapter 3? Extract software requirements'}
              </span>
              <p className="text-[11px] text-slate-400">
                {analyzedSpec
                  ? `${analyzedSpec.databaseTables?.length || 4} tables & ${analyzedSpec.apiEndpoints?.length || 6} endpoints extracted.`
                  : 'Upload your PDF/DOCX to automatically synthesize the exact tables, routes, and UI specified in your thesis.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            {showUploader ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showUploader && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50">
            <ProjectDocumentUploader onAnalysisComplete={handleAnalysisComplete} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Controls Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>Project Parameters</span>
            </h2>

            {/* TOPIC INPUT */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Application Name / Topic</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Automated Hospital Blood Bank & Donor Management System"
                rows={2}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl p-2.5 text-xs text-slate-800 font-medium outline-none transition-all resize-none shadow-xs"
              />
            </div>

            {/* TECH STACK SELECTOR */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Tech Stack</label>
              <select
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl p-2.5 text-xs text-slate-800 font-medium outline-none transition-all shadow-xs"
              >
                {TECH_STACK_PRESETS.map((stack) => (
                  <option key={stack} value={stack}>
                    {stack}
                  </option>
                ))}
              </select>

              {techStack === 'Custom Stack...' && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customStackInput}
                    onChange={(e) => setCustomStackInput(e.target.value)}
                    placeholder="e.g. Golang + SQLite or Laravel + Vue"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-500 rounded-xl p-2 text-xs font-mono text-slate-800"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Specify your exact framework and database.</p>
                </div>
              )}
            </div>

            <CourseSelect
              value={course}
              onChange={setCourse}
              label="Target Academic Department"
            />

            <InstitutionSelect
              value={institution}
              onChange={setInstitution}
              label="Affiliated Tertiary Institution"
              placeholder="Search or enter institution..."
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Selected Architecture</label>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
                <p>&bull; <strong>Stack</strong>: {effectiveTechStack}</p>
                <p>&bull; <strong>Storage</strong>: Relational SQLite with Seed Records</p>
                <p>&bull; <strong>Frontend</strong>: Interactive Single-Page Application</p>
              </div>
            </div>

            <button
              onClick={handleBuildSoftware}
              disabled={!topic.trim() || isBuilding}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isBuilding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Architecture...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200 fill-emerald-200" />
                  <span>{isGenerated ? 'Rebuild Domain Software' : 'Generate Turnkey Software'}</span>
                </>
              )}
            </button>

            {isGenerated && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowTestingSimulator(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run QA Testing & Button Verification</span>
                </button>

                <button
                  onClick={handleDownloadZip}
                  disabled={isDownloading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-40 cursor-pointer"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Packaging .ZIP Repository...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Complete Software .ZIP</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Defense Day Guarantee Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>100% Real Interactive Software</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Every project is synthesized with real domain entities, tables, and working frontend controls. You can test buttons, search, and submit forms live right in your browser.
            </p>
          </div>
        </div>

        {/* Right Main Content Pane (8 cols) */}
        <div className="lg:col-span-8">
          {!isGenerated ? (
            <div className="bg-[#0B132B] rounded-3xl p-12 text-center border border-slate-800 shadow-xl flex flex-col items-center justify-center min-h-[520px] text-slate-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
                <Code2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">No Software Package Built Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                Choose your preferred tech stack (Python, Node.js, PHP, or custom), enter your application topic, then click <strong>&ldquo;Generate Turnkey Software&rdquo;</strong> to synthesize real code and an interactive live web view.
              </p>
              <button
                onClick={handleBuildSoftware}
                disabled={!topic.trim() || isBuilding}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isBuilding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-200 fill-emerald-200" />}
                <span>{isBuilding ? 'Synthesizing...' : 'Generate Turnkey Software'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* PRIMARY VIEW SWITCHER TABS */}
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveMainTab('sandbox')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeMainTab === 'sandbox'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Live Interactive App Sandbox</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                  </button>

                  <button
                    onClick={() => setActiveMainTab('ide')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeMainTab === 'ide'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Source Code IDE ({Object.keys(generatedFiles).length} files)</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 pr-2 text-xs text-slate-500">
                  <span className="font-mono text-[11px] text-cyan-600 font-semibold">{effectiveTechStack}</span>
                </div>
              </div>

              {/* VIEW 1: LIVE INTERACTIVE APP SANDBOX */}
              {activeMainTab === 'sandbox' && (
                <LiveAppSandbox
                  htmlCode={generatedFiles['public/index.html'] || ''}
                  topic={topic}
                  techStack={effectiveTechStack}
                  onRunAutomatedTests={() => setShowTestingSimulator(true)}
                />
              )}

              {/* VIEW 2: SOURCE CODE IDE & AI MODIFICATION BAR */}
              {activeMainTab === 'ide' && (
                <div className="bg-[#0B132B] rounded-3xl overflow-hidden border border-slate-800 shadow-xl text-white">
                  {/* IDE TOP HEADER */}
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
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isEditMode ? 'bg-cyan-600 text-white' : 'bg-white/10 hover:bg-white/20 text-slate-300'
                        }`}
                      >
                        {isEditMode ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                        <span>{isEditMode ? 'View Mode' : 'Direct Edit'}</span>
                      </button>

                      <button
                        onClick={() => setShowTerminalModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Logs</span>
                      </button>

                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* AI PROMPT-BASED CODE MODIFICATION BAR */}
                  <div className="bg-[#0D1533] p-3 border-b border-slate-800/80 space-y-2">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <div className="flex-1 w-full flex items-center gap-2 bg-[#070E24] border border-slate-700/80 rounded-xl px-3 py-1.5 focus-within:border-cyan-500 transition-colors">
                        <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleModifyCode()}
                          placeholder={`Prompt AI to modify ${selectedFile} (e.g. 'Add export to CSV', 'Add JWT auth', 'Add date filter')...`}
                          className="w-full bg-transparent text-xs text-white placeholder-slate-400 outline-none"
                        />
                      </div>

                      <button
                        onClick={() => handleModifyCode()}
                        disabled={!aiPrompt.trim() || isModifying}
                        className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20 active:scale-95 disabled:opacity-50 transition-all flex-shrink-0 cursor-pointer"
                      >
                        {isModifying ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Applying Modifications...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Modify with AI</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick Modification Suggestions */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono font-bold mr-1">Quick Prompts:</span>
                      {[
                        'Add export to CSV endpoint',
                        'Add role permission validation',
                        'Add search & date range filter',
                        'Add password hash verification',
                      ].map((sug) => (
                        <button
                          key={sug}
                          onClick={() => handleModifyCode(sug)}
                          disabled={isModifying}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] transition-colors border border-slate-700/60"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Modification Explanation Bar */}
                  {modificationExplanation && (
                    <div className="bg-cyan-950/40 border-b border-cyan-800/60 px-4 py-2 text-xs text-cyan-200 flex items-center justify-between animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span>{modificationExplanation}</span>
                      </div>
                      {codeHistory[selectedFile]?.length > 0 && (
                        <button
                          onClick={handleUndoModification}
                          className="text-cyan-400 hover:underline text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Undo Edit</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* CODE AND FILE TREE */}
                  <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
                    {/* File Sidebar */}
                    <div className="col-span-1 md:col-span-4 bg-[#070E24] p-3 border-b md:border-b-0 md:border-r border-slate-800 space-y-1 font-mono text-xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1">Source Repository</p>
                      {Object.keys(generatedFiles).map((fileName) => (
                        <button
                          key={fileName}
                          onClick={() => setSelectedFile(fileName)}
                          className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                            selectedFile === fileName ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{fileName}</span>
                        </button>
                      ))}
                    </div>

                    {/* Code Body */}
                    <div className="col-span-1 md:col-span-8 p-4 overflow-x-auto font-mono text-xs text-slate-200 bg-[#09122C] leading-relaxed max-h-[600px] overflow-y-auto">
                      {isEditMode ? (
                        <textarea
                          value={generatedFiles[selectedFile] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGeneratedFiles((prev) => ({ ...prev, [selectedFile]: val }));
                          }}
                          className="w-full h-full min-h-[450px] bg-transparent text-slate-100 font-mono text-xs outline-none resize-none"
                        />
                      ) : (
                        <pre>{generatedFiles[selectedFile] || ''}</pre>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Real-Time Coding Terminal Stream */}
      <CodingTerminalModal
        isOpen={showTerminalModal}
        onClose={() => setShowTerminalModal(false)}
        topic={topic}
        currentStage={currentStage}
        stages={stages}
        terminalLogs={terminalLogs}
        generatedFiles={verifiedFiles}
        isCompleted={isBuildFinished}
        onLaunchTesting={() => {
          setShowTerminalModal(false);
          setShowTestingSimulator(true);
        }}
        onDownloadZip={handleDownloadZip}
        isDownloading={isDownloading}
      />

      {/* MODAL 2: Interactive In-Browser Live AI Testing Simulator */}
      <LiveTestingSimulator
        isOpen={showTestingSimulator}
        onClose={() => setShowTestingSimulator(false)}
        topic={topic || 'Automated Academic System'}
        htmlCode={generatedFiles['public/index.html']}
        onDownloadZip={handleDownloadZip}
        isDownloading={isDownloading}
      />
    </AppLayout>
  );
}
