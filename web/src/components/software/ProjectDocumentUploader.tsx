'use client';

import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
  ArrowRight,
  Layers,
  FileCode,
  X
} from 'lucide-react';

interface AnalyzedProjectSpec {
  title: string;
  domain: string;
  problemStatement: string;
  objectives: string[];
  userRoles: string[];
  databaseEntities: Array<{
    name: string;
    description: string;
    fields: string[];
  }>;
  functionalRequirements: string[];
  coreModules: string[];
  recommendedStack: string;
  suggestedFileName: string;
}

interface ProjectDocumentUploaderProps {
  onAnalysisComplete: (spec: AnalyzedProjectSpec) => void;
}

export default function ProjectDocumentUploader({
  onAnalysisComplete,
}: ProjectDocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [mode, setMode] = useState<'file' | 'paste'>('file');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzedProjectSpec | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleAnalyze = async () => {
    setErrorMsg(null);
    if (mode === 'file' && !file) {
      setErrorMsg('Please select a project document (.docx, .txt, or .md) to analyze.');
      return;
    }
    if (mode === 'paste' && rawText.trim().length < 20) {
      setErrorMsg('Please paste at least a paragraph of project specifications or research objectives.');
      return;
    }

    try {
      setIsAnalyzing(true);
      let res: Response;

      if (mode === 'file' && file) {
        const formData = new FormData();
        formData.append('file', file);
        res = await fetch('/api/ai/analyze-project', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/ai/analyze-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: rawText.trim() }),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract project specifications');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error('Document analysis error:', err);
      setErrorMsg(err.message || 'Analysis failed. Please check file format.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (analysisResult) {
      onAnalysisComplete(analysisResult);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Project Spec Extractor</span>
          </div>
          <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
            Upload Existing Thesis or Project Proposal
          </h3>
          <p className="text-xs text-slate-500">
            Let CodeThesis analyze your thesis draft, seminar paper, or proposal to automatically design the software architecture
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold self-start">
          <button
            onClick={() => setMode('file')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === 'file' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload File (.docx/.txt)
          </button>
          <button
            onClick={() => setMode('paste')}
            className={`px-3 py-1 rounded-lg transition-all ${
              mode === 'paste' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paste Text
          </button>
        </div>
      </div>

      {/* Input Area */}
      {!analysisResult && (
        <div className="space-y-4">
          {mode === 'file' ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
              <input
                type="file"
                id="project-file-input"
                accept=".docx,.txt,.md,.json"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="project-file-input" className="cursor-pointer block space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    {file ? file.name : 'Click to select or drag your project document'}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports Microsoft Word (.docx), plain text (.txt), Markdown (.md)
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Paste Project Proposal / Thesis Chapter Text
              </label>
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the background of study, specific objectives, or system requirement specification here..."
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Architecture & DB Entities...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Project & Extract Blueprint</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Analysis Result Card */}
      {analysisResult && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Project Blueprint Successfully Extracted!</span>
            </div>
            <button
              onClick={() => setAnalysisResult(null)}
              className="text-xs text-emerald-800 hover:underline font-bold"
            >
              Upload Different File
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Identified Project Title
              </div>
              <h4 className="text-sm font-black text-slate-900">{analysisResult.title}</h4>
              <p className="text-xs text-slate-600 mt-1">{analysisResult.problemStatement}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span>Extracted Database Entities ({analysisResult.databaseEntities?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.databaseEntities?.map((entity, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-mono font-medium"
                    >
                      {entity.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Target User Personas</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.userRoles?.map((role, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-medium"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleApply}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
            >
              <span>Build Complete Software from this Blueprint</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
