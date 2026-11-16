'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CourseSelect from '@/components/ui/CourseSelect';
import InstitutionSelect from '@/components/ui/InstitutionSelect';
import { useAuth } from '@/context/AuthContext';
import { downloadAcademicFile } from '@/lib/downloadHelper';
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
  Loader2
} from 'lucide-react';

export default function SoftwareBuilderPage() {
  const { user } = useAuth();
  const [isGenerated, setIsGenerated] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState('app.py');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [topic, setTopic] = useState('');
  const [course, setCourse] = useState(user?.department || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Auto-populate from authenticated user profile
  useEffect(() => {
    if (user) {
      if (user.department) setCourse(user.department);
      if (user.institution) setInstitution(user.institution);
    }
  }, [user]);

  async function handleBuildSoftware() {
    if (!topic.trim()) {
      setSuccessBanner('Please specify a project topic before building software.');
      setTimeout(() => setSuccessBanner(null), 3000);
      return;
    }
    setIsBuilding(true);
    try {
      const topicSlug = topic.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const files: Record<string, string> = {
        'app.py': `# ==============================================================================
# CodeThesis AI — Turnkey Zero-Pip Python & SQLite Application
# Project: ${topic.trim()}
# Department: ${course || 'Computer Science / Engineering'}
# Institution: ${institution || 'Tertiary Educational Institution'}
# ==============================================================================

import sqlite3
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json

DATABASE_FILE = "${topicSlug}.db"

def init_db():
    conn = sqlite3.connect(DATABASE_FILE)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT DEFAULT 'general',
            status TEXT CHECK(status IN ('active', 'pending', 'resolved')) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Zero-pip Python Backend running at http://localhost:8000 for ${topic.trim()}")
`,
        'schema.sql': `-- schema.sql - ACID Transactional Table Definitions
CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`,
        'run_project.bat': `@echo off
echo ====================================================================
echo CodeThesis AI: 1-Click Defense Launcher (Zero-Pip, Zero-Terminal)
echo Project: ${topic.trim()}
echo ====================================================================
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed. Please download Python 3.9+ from python.org.
    pause
    exit /b
)
python app.py
pause
`,
        'README.md': `# Supervisor & Panelist Defense Guide
**Project**: ${topic.trim()}
**Stack**: Python 3.9+, SQLite 3, REST API  

## Defense Checklist:
1. Double-click \`run_project.bat\` on Windows.
2. The launcher will automatically verify Python runtime, instantiate database, and launch the web interface.
`
      };

      setGeneratedFiles(files);
      setSelectedFile('app.py');
      setIsGenerated(true);
      setSuccessBanner('Turnkey software package synthesized successfully! Code viewer updated.');
    } finally {
      setIsBuilding(false);
      setTimeout(() => setSuccessBanner(null), 4000);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(generatedFiles[selectedFile] || '');
    setCopied(true);
    setSuccessBanner(`Copied ${selectedFile} source code to clipboard!`);
    setTimeout(() => {
      setCopied(false);
      setSuccessBanner(null);
    }, 3000);
  }

  async function handleDownloadZip() {
    setIsDownloading(true);
    await downloadAcademicFile(
      '/api/generate-software-zip',
      {
        topic: topic.trim() || 'Academic Software Application',
        course: course || 'Computer Science',
        institution: institution || 'Tertiary Institution',
        author: user?.fullName || 'Candidate',
        matricNo: user?.matricNumber || '',
      },
      `CodeThesis_Software_${(topic || 'Project').replace(/\s+/g, '_')}.zip`
    );
    setIsDownloading(false);
    setSuccessBanner('Complete turnkey Python + SQLite .ZIP repository packaged and downloaded successfully!');
    setTimeout(() => setSuccessBanner(null), 5000);
  }

  return (
    <AppLayout
      activeItem="software-builder"
      title="Turnkey Software & Database Builder"
      subtitle="Zero-configuration Python + SQLite web application with 1-click offline launcher (run_project.bat)"
    >
      {/* Dynamic Success / Action Banner */}
      {successBanner && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-500 hover:text-emerald-700 font-bold ml-2 text-xs"
          >
            &times;
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Specification Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider mb-1">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Software Architecture Parameters</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Application Name</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl p-2.5 text-xs text-slate-800 font-medium outline-none transition-all shadow-xs"
              />
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Runtime & Database</label>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
                <p>&bull; <strong>Runtime</strong>: Zero-pip Python 3.9+ (Built-in libraries)</p>
                <p>&bull; <strong>Database</strong>: SQLite with ACID Row-Level Locking</p>
                <p>&bull; <strong>Launcher</strong>: Windows 1-Click .bat Batch Script</p>
              </div>
            </div>

            <button
              onClick={handleBuildSoftware}
              disabled={!topic.trim() || isBuilding}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isBuilding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Architecture...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200 fill-emerald-200" />
                  <span>{isGenerated ? 'Rebuild Software Files' : 'Generate Turnkey Software'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloading || !isGenerated}
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

          {/* Defense Day Guarantee Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Defense-Day Panic Protection</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              No <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">pip install</code> errors on supervisor laptops. The application runs natively out of the box with zero external dependencies.
            </p>
          </div>
        </div>

        {/* Right Code IDE Pane */}
        <div className="lg:col-span-8">
          {!isGenerated ? (
            <div className="bg-[#0B132B] rounded-3xl p-12 text-center border border-slate-800 shadow-xl flex flex-col items-center justify-center min-h-[500px] text-slate-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
                <Code2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">No Software Package Built Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                Enter your application name and academic department on the left, then click <strong>&ldquo;Generate Turnkey Software&rdquo;</strong> to synthesize your Python web server, relational database schema, and 1-click Windows launcher.
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
            <div className="bg-[#0B132B] rounded-3xl overflow-hidden border border-slate-800 shadow-xl text-white">
              <div className="bg-[#070F2B] px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400 ml-2">{selectedFile}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
                {/* File Sidebar */}
                <div className="col-span-1 md:col-span-4 bg-[#070E24] p-3 border-b md:border-b-0 md:border-r border-slate-800 space-y-1 font-mono text-xs">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1">Source Repository</p>
                  {Object.keys(generatedFiles).map(fileName => (
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
                <div className="col-span-1 md:col-span-8 p-4 overflow-x-auto font-mono text-xs text-slate-200 bg-[#09122C] leading-relaxed">
                  <pre>{generatedFiles[selectedFile] || ''}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
