"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Code2,
  Terminal,
  Download,
  Copy,
  Check,
  FolderTree,
  FileCode,
  Sparkles,
  CheckCircle2,
  Play,
  Database,
  Layers,
  ChevronRight,
} from "lucide-react";

const COURSES = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Cybersecurity",
  "Electrical & Electronic Engineering",
  "Data Science & AI",
];

export default function SoftwareBuilderPage() {
  const [topic, setTopic] = useState("Automated Hostel Allocation and Facility Management System");
  const [course, setCourse] = useState("Computer Science");
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [institution, setInstitution] = useState("Federal University of Technology, Akure");
  const [stack, setStack] = useState("python-sqlite");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(true);
  const [selectedFile, setSelectedFile] = useState("run_project.bat");
  const [copiedCode, setCopiedCode] = useState(false);

  const FILE_CONTENTS: Record<string, string> = {
    "run_project.bat": `@echo off
title CodeThesis Project Launcher - ${topic}
color 0B
echo ======================================================================
echo          CODETHESIS ZERO-CONFIG LOCAL RUNNER
echo          Project: ${topic}
echo ======================================================================
echo.
echo [1/3] Checking Python runtime...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    pause
    exit /b
)

echo [2/3] Initializing local SQLite database and mock records...
python -c "import sqlite3; conn = sqlite3.connect('database.db'); conn.executescript(open('database/schema.sql').read()); conn.executescript(open('database/seed_data.sql').read()); conn.close(); print('[SUCCESS] Database initialized successfully.')"

echo [3/3] Starting local application server on http://localhost:8000...
start http://localhost:8000
echo.
echo ======================================================================
echo  SERVER IS RUNNING! (Press Ctrl+C in this terminal window to stop)
echo  Student Portal: http://localhost:8000
echo  Admin Credentials: admin@codethesis.edu / admin123
echo  Student Credentials: chidi@codethesis.edu / student123
echo ======================================================================
echo.
python server.py
pause`,

    "server.py": `# Self-Contained Zero-Dependency Backend Server
# Requires Python 3.8+ (Uses standard library: http.server and sqlite3)

import http.server
import socketserver
import json
import sqlite3

PORT = 8000
DB_FILE = 'database.db'

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

class ProjectHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            with open('static/index.html', 'rb') as f:
                self.wfile.write(f.read())
            return
            
        elif self.path == '/api/rooms':
            conn = get_db()
            rooms = conn.execute('''
                SELECT r.id, r.room_number, r.bed_capacity, r.occupied_beds, r.status, h.name as hostel_name 
                FROM rooms r 
                JOIN hostels h ON r.hostel_id = h.id
            ''').fetchall()
            conn.close()
            data = [dict(row) for row in rooms]
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode('utf-8'))
            return
            
        super().do_GET()`,

    "database/schema.sql": `-- Relational Database Schema with Foreign Key Constraints
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matric_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    gender TEXT NOT NULL,
    level INTEGER NOT NULL,
    role TEXT DEFAULT 'student'
);

CREATE TABLE hostels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gender_designation TEXT NOT NULL,
    total_capacity INTEGER NOT NULL
);

CREATE TABLE rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostel_id INTEGER NOT NULL,
    room_number TEXT NOT NULL,
    bed_capacity INTEGER NOT NULL,
    occupied_beds INTEGER DEFAULT 0,
    status TEXT DEFAULT 'AVAILABLE',
    FOREIGN KEY (hostel_id) REFERENCES hostels (id)
);

CREATE TABLE allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    bed_number INTEGER NOT NULL,
    academic_session TEXT NOT NULL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'CONFIRMED',
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (room_id) REFERENCES rooms (id)
);`,

    "README.md": `# ${topic}
### Complete Working Software & Supervisor Defense Guide
**Department:** ${course}  
**Institution:** ${institution}  

## 🚀 How to Run the Software (For Defense Presentation)
1. Double-click the \`run_project.bat\` file in this folder.
2. The script will automatically initialize the local SQLite database, pre-populate all rooms and mock student records, and open the live web app in your default browser at http://localhost:8000.
3. No complicated pip installs or terminal commands required!

## 🔑 Demo Login Credentials
* **Admin**: admin@codethesis.edu / admin123
* **Student**: chidi@codethesis.edu / student123`,
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 1800);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      // Auto-save to student dashboard history
      fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "software-builder",
          title: topic || "Working Software Codebase",
          course: course || "Computer Science",
          institution: institution || "University of Lagos",
          fileType: "zip",
          summary: `Turnkey software codebase for ${topic} with pre-seeded SQLite database and 1-click batch runner.`,
        }),
      }).catch(e => console.warn("Auto-save note:", e));

      const res = await fetch("/api/generate-software-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          course,
          institution,
        }),
      });
      if (!res.ok) throw new Error("Failed to download software");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CodeThesis_Software_${course.replace(/\s+/g, "_")}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Could not download software codebase. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(FILE_CONTENTS[selectedFile] || "");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Tools</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200">
              <Image src="/logo.jpg" alt="Logo" width={28} height={28} className="object-cover" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">CodeThesis</span>
          </div>

          <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            FYP Suite • Tool #4
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-10 w-full flex-1">
        {/* Academic Studio Callout Banner */}
        <div className="mb-8 max-w-3xl mx-auto bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border border-violet-700/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-violet-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                New: CodeThesis Academic Studio
                <span className="text-[10px] bg-violet-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Live Workspace</span>
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                Edit code live in an interactive IDE alongside your 5-chapter thesis, UML diagrams, and defense slides.
              </p>
            </div>
          </div>
          <Link
            href="/studio?tab=code"
            prefetch={false}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-violet-950 font-bold text-xs shrink-0 transition shadow-sm active:scale-95"
          >
            <span>Open in Studio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tool Box */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Code2 className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Turnkey Software Builder
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
            Generate full working code, database schemas, pre-seeded local data, and a 1-click <code>run_project.bat</code> launcher for your oral defense.
          </p>

          {/* Form */}
          <div className="mt-8 space-y-5 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Project Software Topic
              </label>
              <textarea
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Automated Hostel Allocation and Facility Management System"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Department / Course
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomCourse(!isCustomCourse);
                      if (!isCustomCourse) setCourse("");
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    {isCustomCourse ? "Choose from list" : "Type custom course"}
                  </button>
                </div>
                {isCustomCourse ? (
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Enter your specific course / discipline"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                ) : (
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    {COURSES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Target Tech Stack
                </label>
                <select
                  value={stack}
                  onChange={(e) => setStack(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  <option value="python-sqlite">Python 3 + SQLite + HTML5 (Recommended 1-Click Defense)</option>
                  <option value="react-node">React + Node.js + Express + SQLite</option>
                  <option value="next-fastapi">Next.js 15 + FastAPI + PostgreSQL</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Architecture & Seeding Database...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Turnkey Working Software (.ZIP)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Code Explorer */}
        {isGenerated && (
          <div className="mt-10 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Software Codebase Ready</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    Includes run_project.bat • Zero Pip Installs Required
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1 line-clamp-1">
                  {topic}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadZip}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Packaging ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Codebase (.ZIP)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Explorer */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* File Tree */}
              <div className="md:col-span-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1.5 text-xs font-mono">
                <span className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Project Files
                </span>
                {Object.keys(FILE_CONTENTS).map((fileName) => (
                  <button
                    key={fileName}
                    onClick={() => setSelectedFile(fileName)}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition-all ${
                      selectedFile === fileName
                        ? "bg-slate-900 text-white font-bold shadow-sm"
                        : "text-slate-600 hover:bg-slate-200/60"
                    }`}
                  >
                    {fileName.endsWith(".bat") ? (
                      <Play className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : fileName.endsWith(".sql") ? (
                      <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span className="truncate">{fileName}</span>
                  </button>
                ))}
              </div>

              {/* Code Viewer */}
              <div className="md:col-span-3 bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-inner flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
                  <span className="font-mono text-slate-400 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    {selectedFile}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-slate-200 max-h-[380px] scrollbar-thin">
                  {FILE_CONTENTS[selectedFile]}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>© 2026 CodeThesis AI. Turnkey Software Synthesis & 1-Click Launcher Engine.</p>
      </footer>
    </div>
  );
}
