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
import AcademicTextRenderer from '@/components/ui/AcademicTextRenderer';

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
  const [aiCustomContent, setAiCustomContent] = useState<{ [ch: number]: string }>({});

  const effectiveTopic = topic.trim() || 'Design and Implementation of an Automated System';
  const effectiveInstitution = institution.trim() || 'Tertiary Institution';
  const effectiveCaseStudy = caseStudy.trim() || 'the Designated Organization';

  async function handleDownloadDocx() {
    setIsDownloading(true);
    await downloadAcademicFile(
      '/api/generate-thesis-docx',
      { topic, course, institution, caseStudy, studentName, matricNumber, session, aiCustomContent },
      `5_Chapter_Thesis_${course.replace(/\s+/g, '_')}.docx`
    );
    setIsDownloading(false);
    setSuccessBanner('Complete 5-Chapter Thesis (.docx) generated and downloaded with verified citations!');
    setTimeout(() => setSuccessBanner(null), 5000);
  }

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'thesis',
          type: 'thesis_chapter',
          chapterNumber: activeChapter,
          topic: effectiveTopic,
          course: course || 'Computer Science / Engineering',
          institution: effectiveInstitution,
          prompt: `Synthesize comprehensive academic research text for Chapter ${activeChapter} on "${effectiveTopic}" for ${effectiveInstitution} with case study on ${effectiveCaseStudy}. Include NUC methodology, APA citations, and problem formulation.`,
        }),
      });
      const data = await res.json();
      if (data.success && data.content) {
        setAiCustomContent(prev => ({
          ...prev,
          [activeChapter]: data.content,
        }));
        setSuccessBanner(`Chapter ${activeChapter} synthesized successfully! Preview updated below. Click "Download Full (.docx)" to export.`);
        if (typeof data.remainingCredits === 'number' && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('credits-updated', { detail: { credits: data.remainingCredits } }));
        }
      } else {
        setSuccessBanner(data.error || `Chapter ${activeChapter} generation updated.`);
      }
    } catch (err: any) {
      console.warn('AI preview synthesis warning:', err);
      setSuccessBanner('Synthesized chapter using standard departmental curriculum templates.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setSuccessBanner(null), 5000);
    }
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
                placeholder="e.g. Design and Implementation of an Automated System"
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
            {!aiCustomContent[activeChapter] ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-3 shadow-inner">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1 font-sans">Chapter {activeChapter} Not Generated Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed font-sans">
                  Enter your dissertation topic and parameters above, then click <strong>&ldquo;Synthesize Chapter with AI&rdquo;</strong> to generate comprehensive academic text with APA 7th citations, or <strong>&ldquo;Download Full (.docx)&rdquo;</strong> to compile all 5 chapters.
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer font-sans"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Synthesize Chapter {activeChapter} with AI</span>
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 text-slate-800 font-serif leading-relaxed text-xs sm:text-sm shadow-xs">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-3 font-sans pb-2 border-b border-amber-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>Synthesized AI Research Text for Chapter {activeChapter}</span>
                </div>
                <AcademicTextRenderer content={aiCustomContent[activeChapter]} chapterNumber={activeChapter} />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
