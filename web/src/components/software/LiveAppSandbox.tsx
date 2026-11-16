'use client';

import React, { useState, useRef } from 'react';
import {
  Globe,
  RotateCw,
  Smartphone,
  Tablet,
  Monitor,
  ExternalLink,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface LiveAppSandboxProps {
  htmlCode: string;
  topic: string;
  techStack?: string;
  onRunAutomatedTests?: () => void;
}

export default function LiveAppSandbox({
  htmlCode,
  topic,
  techStack = 'Python + SQLite',
  onRunAutomatedTests,
}: LiveAppSandboxProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    setKey((prev) => prev + 1);
  };

  const handleOpenNewWindow = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const getContainerWidth = () => {
    if (viewport === 'mobile') return 'max-w-[375px]';
    if (viewport === 'tablet') return 'max-w-[768px]';
    return 'w-full';
  };

  return (
    <div className={`bg-[#0D1117] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col ${isFullscreen ? 'fixed inset-4 z-50 shadow-[0_0_80px_rgba(0,0,0,0.9)] border-cyan-500/50' : 'h-[720px]'}`}>
      
      {/* Browser Chrome Header */}
      <div className="bg-[#161B22] border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
        
        {/* Window Controls & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="flex items-center gap-1 text-slate-400 pl-2">
            <button
              onClick={handleReload}
              title="Reload App"
              className="p-1 rounded hover:bg-slate-700/60 hover:text-white transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-lg min-w-[200px] flex items-center gap-2 bg-[#0D1117] border border-slate-700/80 rounded-lg px-3 py-1 text-xs text-slate-300">
          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-500 font-mono text-[11px]">http://localhost:8000/</span>
          <span className="text-cyan-300 font-mono text-[11px] truncate">dashboard</span>
          <span className="ml-auto text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
            Interactive Live Sandbox
          </span>
        </div>

        {/* Viewport & Action Controls */}
        <div className="flex items-center gap-2">
          {/* Responsive Switchers */}
          <div className="flex items-center bg-[#0D1117] border border-slate-700/80 rounded-lg p-0.5">
            <button
              onClick={() => setViewport('desktop')}
              title="Desktop View (100%)"
              className={`p-1.5 rounded text-xs transition ${viewport === 'desktop' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              title="Tablet View (768px)"
              className={`p-1.5 rounded text-xs transition ${viewport === 'tablet' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              title="Mobile View (375px)"
              className={`p-1.5 rounded text-xs transition ${viewport === 'mobile' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Automated Test Trigger */}
          {onRunAutomatedTests && (
            <button
              onClick={onRunAutomatedTests}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-700/60 text-xs font-semibold transition"
              title="Run Automated DOM & Button Verification"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Run QA Tests</span>
            </button>
          )}

          {/* Popout */}
          <button
            onClick={handleOpenNewWindow}
            title="Open in Full Browser Window"
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen inside app */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Sandbox'}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Live Viewport Area */}
      <div className="flex-1 bg-slate-950 flex items-center justify-center p-2 sm:p-4 overflow-auto">
        <div className={`h-full transition-all duration-300 shadow-2xl rounded-xl overflow-hidden border border-slate-800 ${getContainerWidth()} w-full bg-[#090D16]`}>
          <iframe
            key={key}
            ref={iframeRef}
            srcDoc={htmlCode}
            title={`Live Interactive Sandbox — ${topic}`}
            className="w-full h-full border-0 bg-[#090D16]"
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
          />
        </div>
      </div>

      {/* Interactive Helper Footer */}
      <div className="bg-[#161B22] border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real interactive browser DOM. Click buttons, enter text, and test live data persistence.</span>
        </div>
        <div className="font-mono text-cyan-400 hidden sm:block">
          Viewport: {viewport === 'desktop' ? 'Responsive 100%' : viewport === 'tablet' ? '768px (iPad)' : '375px (iPhone)'}
        </div>
      </div>
    </div>
  );
}
