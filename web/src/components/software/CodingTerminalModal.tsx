'use client';

import React, { useState, useEffect } from 'react';
import {
  Terminal,
  CheckCircle2,
  Loader2,
  FileCode,
  ShieldCheck,
  Play,
  Download,
  Check,
  Sparkles,
  Maximize2,
  X,
  Layers
} from 'lucide-react';

export interface StageInfo {
  number: number;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

export interface GeneratedFileInfo {
  name: string;
  lines: number;
  size: string;
  status: 'generating' | 'ready';
}

interface CodingTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  currentStage: number;
  stages: StageInfo[];
  terminalLogs: string[];
  generatedFiles: GeneratedFileInfo[];
  isCompleted: boolean;
  onLaunchTesting: () => void;
  onDownloadZip: () => void;
  isDownloading?: boolean;
}

export default function CodingTerminalModal({
  isOpen,
  onClose,
  topic,
  currentStage,
  stages,
  terminalLogs,
  generatedFiles,
  isCompleted,
  onLaunchTesting,
  onDownloadZip,
  isDownloading = false,
}: CodingTerminalModalProps) {
  const [activeTab, setActiveTab] = useState<'terminal' | 'files'>('terminal');

  useEffect(() => {
    // Auto-scroll terminal to bottom
    const el = document.getElementById('terminal-log-container');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [terminalLogs]);

  if (!isOpen) return null;

  const currentStageObj = stages.find((s) => s.number === currentStage) || stages[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D1117] border border-slate-700/80 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Terminal Titlebar */}
        <div className="bg-[#161B22] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs font-mono text-slate-400 ml-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>codethesis-agent:~/workspace/{topic.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24)}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              {isCompleted ? '✓ Build Complete' : `Stage ${currentStage} of 5 Active`}
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stages Progress Track */}
        <div className="bg-[#11161D] px-4 py-3 border-b border-slate-800/80 grid grid-cols-5 gap-2 text-center text-xs">
          {stages.map((stage) => {
            const isDone = stage.status === 'completed';
            const isActive = stage.status === 'active';
            return (
              <div
                key={stage.number}
                className={`p-2 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-blue-950/60 border-blue-500/80 text-blue-200'
                    : isDone
                    ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-300'
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isActive ? (
                    <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  ) : (
                    <span className="w-3.5 h-3.5 inline-block text-slate-600">●</span>
                  )}
                  <span>Stage {stage.number}</span>
                </div>
                <div className="text-[10px] truncate mt-0.5 font-medium">{stage.name}</div>
              </div>
            );
          })}
        </div>

        {/* Current Active Stage Banner */}
        <div className="bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-slate-900/60 px-5 py-2.5 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-cyan-400 font-bold">ACTIVE TASK:</span>
            <span className="text-slate-200 font-medium">{currentStageObj.description}</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'terminal' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Terminal Logs ({terminalLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'files' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Generated Files ({generatedFiles.length})
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col min-h-[300px]">
          {activeTab === 'terminal' ? (
            <div
              id="terminal-log-container"
              className="flex-1 bg-[#090D13] p-4 rounded-xl font-mono text-xs text-slate-300 overflow-y-auto space-y-1.5 border border-slate-800/60 select-text"
            >
              {terminalLogs.map((log, index) => {
                const isSuccess = log.includes('[SUCCESS]') || log.includes('✓');
                const isWarn = log.includes('[WARN]');
                const isStage = log.includes('STAGE');
                return (
                  <div
                    key={index}
                    className={`leading-relaxed ${
                      isSuccess
                        ? 'text-emerald-400'
                        : isWarn
                        ? 'text-amber-400'
                        : isStage
                        ? 'text-cyan-300 font-bold'
                        : 'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                );
              })}
              {!isCompleted && (
                <div className="flex items-center gap-2 text-cyan-400 pt-1">
                  <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse" />
                  <span className="text-[11px] text-slate-500 italic">CodeThesis AI synthesizing zero-pip architecture...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 bg-[#090D13] p-4 rounded-xl overflow-y-auto border border-slate-800/60 divide-y divide-slate-800/60">
              {generatedFiles.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                  Synthesizing file tree...
                </div>
              ) : (
                generatedFiles.map((file, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      <span className="font-mono text-slate-200 font-medium">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                      <span>{file.lines} lines</span>
                      <span className="text-slate-600">•</span>
                      <span>{file.size}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 text-[10px] font-bold border border-emerald-800/60">
                        VERIFIED
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer & Actions */}
        <div className="bg-[#161B22] px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Target: Zero-Pip Python 3.8+ & SQLite3 (No Docker/MySQL required)</span>
          </div>

          <div className="flex items-center gap-3">
            {isCompleted && (
              <>
                <button
                  onClick={onLaunchTesting}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch AI Test Software Live</span>
                </button>

                <button
                  onClick={onDownloadZip}
                  disabled={isDownloading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Download .ZIP Project</span>
                </button>
              </>
            )}

            {!isCompleted && (
              <div className="text-xs font-mono text-cyan-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Building stage {currentStage} / 5...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
