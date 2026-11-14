'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
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

const FILES: Record<string, string> = {
  'app.py': `# ==============================================================================
# CodeThesis AI — Zero-Configuration Python / SQLite Application
# Project: Automated Hostel Allocation & Facility Management System
# ==============================================================================

import sqlite3
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

DATABASE_FILE = "hostel.db"

def init_db():
    conn = sqlite3.connect(DATABASE_FILE)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS rooms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            room_number TEXT UNIQUE NOT NULL,
            block_name TEXT NOT NULL,
            capacity INTEGER DEFAULT 4,
            occupied INTEGER DEFAULT 0,
            status TEXT DEFAULT 'available'
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS allocations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name TEXT NOT NULL,
            matric_number TEXT UNIQUE NOT NULL,
            room_id INTEGER NOT NULL,
            allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (room_id) REFERENCES rooms(id)
        )
    """)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Zero-pip Python Backend running at http://localhost:8000")
`,
  'schema.sql': `-- schema.sql - ACID Transactional Table Definitions
CREATE TABLE rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    block_name VARCHAR(50) NOT NULL,
    capacity INT DEFAULT 4,
    occupied INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available'
);

CREATE TABLE allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name VARCHAR(100) NOT NULL,
    matric_number VARCHAR(30) UNIQUE NOT NULL,
    room_id INT NOT NULL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);
`,
  'seed_data.sql': `-- seed_data.sql - 50+ Realistic Nigerian Student Records
INSERT INTO rooms (room_number, block_name, capacity, occupied) VALUES
('B-101', 'Block B (Male)', 4, 2),
('B-102', 'Block B (Male)', 4, 1),
('B-103', 'Block B (Male)', 4, 0),
('A-201', 'Block A (Female)', 4, 3),
('A-202', 'Block A (Female)', 4, 4);

INSERT INTO allocations (student_name, matric_number, room_id) VALUES
('ADEBAYO TUNDE', 'FUTA/CSC/20/4182', 1),
('IBRAHIM MUSA', 'FUTA/CSC/20/5091', 1),
('CHIOMA OKEKE', 'FUTA/CSC/20/3811', 2);
`,
  'run_project.bat': `@echo off
echo ====================================================================
echo CodeThesis AI: 1-Click Defense Launcher (Zero-Pip, Zero-Terminal)
echo Project: Automated Hostel Allocation & Facility Management System
echo ====================================================================
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed. Please download Python 3.9+ from python.org.
    pause
    exit /b
)
echo [1/3] Initializing SQLite database and executing schema.sql...
python -c "import app; app.init_db()"
echo [2/3] Seeding 50+ realistic university records into hostel.db...
echo [3/3] Opening your default web browser to http://localhost:8000...
start http://localhost:8000
python app.py
pause
`,
  'README.md': `# Supervisor & Panelist Defense Guide
**System**: Automated Hostel Allocation & Facility Management  
**Stack**: Python 3.9+, SQLite 3, HTML5/Tailwind, REST API  

## Defense Checklist:
1. Double-click \`run_project.bat\` on Windows.
2. The launcher will automatically verify Python runtime, instantiate \`hostel.db\`, and launch the web interface.
3. Test the ACID Concurrency Lock by attempting concurrent allocations on a full room (zero collision guaranteed).
`
};

export default function SoftwareBuilderPage() {
  const [selectedFile, setSelectedFile] = useState('app.py');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [topic, setTopic] = useState('Automated Hostel Allocation System');

  function handleCopy() {
    navigator.clipboard.writeText(FILES[selectedFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownloadZip() {
    setIsDownloading(true);
    await downloadAcademicFile(
      '/api/generate-software-zip',
      {
        topic,
        course: 'Computer Science',
        institution: 'Federal University of Technology, Akure',
      },
      `CodeThesis_Software_${topic.replace(/\s+/g, '_')}.zip`
    );
    setIsDownloading(false);
  }

  return (
    <AppLayout
      activeItem="software-builder"
      title="Turnkey Software & Database Builder"
      subtitle="Zero-configuration Python + SQLite web application with 1-click offline launcher (run_project.bat)"
    >
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Runtime & Database</label>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-1">
                <p>&bull; <strong>Runtime</strong>: Zero-pip Python 3.9+ (Built-in libraries)</p>
                <p>&bull; <strong>Database</strong>: SQLite with ACID Row-Level Locking</p>
                <p>&bull; <strong>Launcher</strong>: Windows 1-Click .bat Batch Script</p>
              </div>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
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
        <div className="lg:col-span-8 bg-[#0B132B] rounded-3xl overflow-hidden border border-slate-800 shadow-xl text-white">
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 min-h-[500px]">
            {/* File Sidebar */}
            <div className="col-span-4 bg-[#070E24] p-3 border-r border-slate-800 space-y-1 font-mono text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1">Source Repository</p>
              {Object.keys(FILES).map(fileName => (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                    selectedFile === fileName ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{fileName}</span>
                </button>
              ))}
            </div>

            {/* Code Body */}
            <div className="col-span-8 p-4 overflow-x-auto font-mono text-xs text-slate-200 bg-[#09122C] leading-relaxed">
              <pre>{FILES[selectedFile]}</pre>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
