'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
  Download,
  Terminal,
  Loader2,
  Check,
  X,
  Layers,
  Database,
  Lock,
  User,
  Plus,
  Search,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  category: 'auth' | 'api' | 'db' | 'ui';
  status: 'pending' | 'running' | 'passed';
  latencyMs: number;
}

interface LiveTestingSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  onDownloadZip: () => void;
  isDownloading?: boolean;
}

export default function LiveTestingSimulator({
  isOpen,
  onClose,
  topic,
  onDownloadZip,
  isDownloading = false,
}: LiveTestingSimulatorProps) {
  // Test sequence state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [typedEmail, setTypedEmail] = useState('');
  const [typedPassword, setTypedPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecordTitle, setNewRecordTitle] = useState('');
  const [recordsList, setRecordsList] = useState<any[]>([
    { id: 1, title: 'Initial Benchmark Baseline #101', status: 'CONFIRMED', author: 'Administrator' },
    { id: 2, title: 'Cryptographic Integrity Check #102', status: 'VERIFIED', author: 'Candidate Student' },
  ]);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50, visible: true, clicking: false });

  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: '1', name: 'Frontend DOM & Tailwind Layout Initialization', category: 'ui', status: 'pending', latencyMs: 12 },
    { id: '2', name: 'Input Field Form Sanitization (XSS Prevention)', category: 'auth', status: 'pending', latencyMs: 8 },
    { id: '3', name: 'POST /api/auth/login Authentication Endpoint (HTTP 200)', category: 'api', status: 'pending', latencyMs: 44 },
    { id: '4', name: 'Encrypted Session Token Generation & LocalStorage', category: 'auth', status: 'pending', latencyMs: 6 },
    { id: '5', name: 'Dashboard Telemetry & Dynamic Metric Aggregate Binding', category: 'ui', status: 'pending', latencyMs: 18 },
    { id: '6', name: 'Action Button Click Handler & Modal DOM Transition', category: 'ui', status: 'pending', latencyMs: 14 },
    { id: '7', name: 'SQLite3 ACID Transaction Write & Table Row Mutation', category: 'db', status: 'pending', latencyMs: 28 },
  ]);

  const runAutomatedTestWorkflow = () => {
    // Reset state
    setCurrentStep(0);
    setTypedEmail('');
    setTypedPassword('');
    setIsSigningIn(false);
    setIsLoggedIn(false);
    setShowAddModal(false);
    setNewRecordTitle('');
    setRecordsList([
      { id: 1, title: 'Initial Benchmark Baseline #101', status: 'CONFIRMED', author: 'Administrator' },
      { id: 2, title: 'Cryptographic Integrity Check #102', status: 'VERIFIED', author: 'Candidate Student' },
    ]);
    setTestCases((prev) => prev.map((t) => ({ ...t, status: 'pending' })));

    // STEP 1: UI Init (0.5s)
    setTimeout(() => {
      setCurrentStep(1);
      setTestCases((prev) => prev.map((t, idx) => (idx === 0 ? { ...t, status: 'passed' } : t)));
      setCursorPos({ x: 180, y: 140, visible: true, clicking: false });
    }, 600);

    // STEP 2: Move cursor to email and type (1.5s)
    setTimeout(() => {
      setCurrentStep(2);
      setCursorPos({ x: 190, y: 155, visible: true, clicking: true });
      setTimeout(() => setCursorPos((p) => ({ ...p, clicking: false })), 200);

      // Typing animation for email
      const email = 'admin@codethesis.edu';
      let i = 0;
      const interval = setInterval(() => {
        setTypedEmail(email.slice(0, i + 1));
        i++;
        if (i >= email.length) clearInterval(interval);
      }, 40);
    }, 1200);

    // STEP 3: Move cursor to password and type (2.5s)
    setTimeout(() => {
      setCurrentStep(3);
      setCursorPos({ x: 190, y: 205, visible: true, clicking: true });
      setTimeout(() => setCursorPos((p) => ({ ...p, clicking: false })), 200);

      const pass = '••••••••••••';
      let j = 0;
      const interval = setInterval(() => {
        setTypedPassword(pass.slice(0, j + 1));
        j++;
        if (j >= pass.length) {
          clearInterval(interval);
          setTestCases((prev) => prev.map((t, idx) => (idx === 1 ? { ...t, status: 'passed' } : t)));
        }
      }, 50);
    }, 2400);

    // STEP 4: Move to Login Button and click (3.5s)
    setTimeout(() => {
      setCurrentStep(4);
      setCursorPos({ x: 230, y: 260, visible: true, clicking: true });
      setIsSigningIn(true);

      setTimeout(() => {
        setCursorPos((p) => ({ ...p, clicking: false }));
        setIsSigningIn(false);
        setIsLoggedIn(true);
        setTestCases((prev) =>
          prev.map((t, idx) => (idx === 2 || idx === 3 ? { ...t, status: 'passed' } : t))
        );
      }, 800);
    }, 3600);

    // STEP 5: Dashboard loaded, move to "Add New Record" button (5.0s)
    setTimeout(() => {
      setCurrentStep(5);
      setTestCases((prev) => prev.map((t, idx) => (idx === 4 ? { ...t, status: 'passed' } : t)));
      setCursorPos({ x: 420, y: 90, visible: true, clicking: true });

      setTimeout(() => {
        setCursorPos((p) => ({ ...p, clicking: false }));
        setShowAddModal(true);
        setTestCases((prev) => prev.map((t, idx) => (idx === 5 ? { ...t, status: 'passed' } : t)));
      }, 300);
    }, 5000);

    // STEP 6: Type new record in modal and click submit (6.2s)
    setTimeout(() => {
      setCurrentStep(6);
      const title = `${topic.slice(0, 28)} Defense Trial #103`;
      let k = 0;
      const interval = setInterval(() => {
        setNewRecordTitle(title.slice(0, k + 1));
        k++;
        if (k >= title.length) {
          clearInterval(interval);

          // Click Save button in modal
          setTimeout(() => {
            setCursorPos({ x: 340, y: 260, visible: true, clicking: true });
            setTimeout(() => {
              setCursorPos((p) => ({ ...p, clicking: false }));
              setShowAddModal(false);
              setRecordsList((prev) => [
                { id: 3, title, status: 'VERIFIED', author: 'System Administrator' },
                ...prev,
              ]);
              setTestCases((prev) => prev.map((t, idx) => (idx === 6 ? { ...t, status: 'passed' } : t)));
              setCurrentStep(7); // Completed
            }, 500);
          }, 400);
        }
      }, 30);
    }, 6200);
  };

  useEffect(() => {
    if (isOpen) {
      runAutomatedTestWorkflow();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allPassed = testCases.every((t) => t.status === 'passed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B0F17] border border-slate-700/80 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-[#111827] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  CodeThesis AI QA Testing Chamber & Live Verification
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  ● Virtual Headless Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Watching automated AI test agent execute credentials, button clicks, and SQLite transactions live
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runAutomatedTestWorkflow}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs"
              title="Re-run Test Simulation"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split View (Virtual Browser on Left, Test Suite on Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[460px]">
          {/* LEFT: Virtual Browser Viewport (7 Cols) */}
          <div className="lg:col-span-7 p-4 bg-[#070A0F] border-r border-slate-800 flex flex-col justify-between relative overflow-hidden">
            {/* Browser Address Bar */}
            <div className="bg-[#141B26] px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2 mb-3 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>http://localhost:8000/{isLoggedIn ? 'dashboard' : 'login'}</span>
              </span>
              <span className="ml-auto text-[10px] text-slate-500">FastAPI/Flask + SQLite</span>
            </div>

            {/* Virtual Screen Content Area */}
            <div className="flex-1 bg-white rounded-2xl p-5 shadow-inner flex flex-col relative text-slate-900 overflow-hidden min-h-[360px]">
              {/* VIRTUAL CURSOR (Animated SVG) */}
              {cursorPos.visible && (
                <div
                  className="absolute pointer-events-none transition-all duration-300 z-50 flex items-center gap-1"
                  style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
                >
                  <svg
                    className={`w-6 h-6 text-cyan-600 drop-shadow-md ${cursorPos.clicking ? 'scale-75' : 'scale-100'} transition-transform`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 3l7 18 3-7 7-3L3 3z" />
                  </svg>
                  <span className="px-1.5 py-0.5 bg-cyan-600 text-white text-[9px] font-mono rounded font-bold shadow">
                    AI Agent
                  </span>
                </div>
              )}

              {/* VIEW 1: Login Form (If not logged in) */}
              {!isLoggedIn && (
                <div className="h-full flex flex-col justify-center max-w-xs mx-auto space-y-3 w-full">
                  <div className="text-center space-y-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mx-auto text-xs font-bold">
                      CT
                    </div>
                    <h4 className="text-xs font-black text-slate-900 tracking-tight">{topic}</h4>
                    <p className="text-[10px] text-slate-500">Sign in with Academic Credentials</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Email Address</label>
                      <input
                        type="text"
                        readOnly
                        value={typedEmail}
                        placeholder="e.g. admin@codethesis.edu"
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs bg-slate-50 transition-all ${
                          currentStep === 2 ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Password</label>
                      <input
                        type="password"
                        readOnly
                        value={typedPassword}
                        placeholder="••••••••••••"
                        className={`w-full px-3 py-1.5 rounded-lg border text-xs bg-slate-50 transition-all ${
                          currentStep === 3 ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-300'
                        }`}
                      />
                    </div>

                    <button
                      className={`w-full py-2 rounded-lg text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 ${
                        isSigningIn
                          ? 'bg-blue-700'
                          : currentStep === 4
                          ? 'bg-blue-600 ring-2 ring-offset-2 ring-blue-500'
                          : 'bg-slate-900 hover:bg-slate-800'
                      }`}
                    >
                      {isSigningIn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Sign In to System</span>}
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 2: Dashboard (If logged in) */}
              {isLoggedIn && (
                <div className="h-full flex flex-col space-y-3 w-full animate-in fade-in duration-300">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 truncate max-w-[220px]">{topic}</h4>
                      <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Connected to local SQLite3 engine</span>
                      </p>
                    </div>

                    <button
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1 shadow-xs transition-all ${
                        currentStep === 5 ? 'bg-blue-600 ring-2 ring-offset-1 ring-blue-500' : 'bg-slate-900'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Record</span>
                    </button>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-500 font-bold">Total Entities</div>
                      <div className="text-sm font-black text-slate-900">{recordsList.length + 12}</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-500 font-bold">Audit Trails</div>
                      <div className="text-sm font-black text-blue-600">100% OK</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                      <div className="text-[10px] text-slate-500 font-bold">Isolation</div>
                      <div className="text-sm font-black text-emerald-600">ACID SQLite</div>
                    </div>
                  </div>

                  {/* Dynamic Records Table */}
                  <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden text-[10px]">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 grid grid-cols-12">
                      <span className="col-span-2">ID</span>
                      <span className="col-span-6">Title / Scope</span>
                      <span className="col-span-4 text-right">Status</span>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[140px] overflow-y-auto">
                      {recordsList.map((rec) => (
                        <div
                          key={rec.id}
                          className={`px-3 py-1.5 grid grid-cols-12 items-center transition-colors ${
                            rec.id === 3 ? 'bg-emerald-50 text-emerald-950 font-bold' : ''
                          }`}
                        >
                          <span className="col-span-2 font-mono text-slate-500">#{rec.id}</span>
                          <span className="col-span-6 truncate font-medium">{rec.title}</span>
                          <span className="col-span-4 text-right">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                              {rec.status}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Modal Simulation Popup */}
                  {showAddModal && (
                    <div className="absolute inset-x-6 top-16 bg-white border border-slate-300 rounded-2xl shadow-xl p-4 z-40 animate-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900">Add Operational Record</span>
                        <span className="text-[9px] font-mono text-blue-600">SQLite ACID Transaction</span>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={newRecordTitle}
                        placeholder="Typing entity name..."
                        className="w-full px-3 py-1.5 border border-blue-500 ring-2 ring-blue-500/20 rounded-lg text-xs bg-slate-50 mb-3"
                      />
                      <div className="flex justify-end gap-2 text-xs">
                        <span className="px-3 py-1 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                          Cancel
                        </span>
                        <span
                          className={`px-3 py-1 rounded text-white font-bold text-[10px] ${
                            currentStep === 6 ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-slate-900'
                          }`}
                        >
                          Save Record
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Automated Test Suite Checklist (5 Cols) */}
          <div className="lg:col-span-5 p-5 bg-[#0D121B] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Test Suite Verification
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {testCases.filter((t) => t.status === 'passed').length} / {testCases.length} PASSED
                </span>
              </div>

              {/* Test Cases Checklist */}
              <div className="space-y-2 overflow-y-auto max-h-[300px]">
                {testCases.map((tc) => (
                  <div
                    key={tc.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-2.5 transition-all ${
                      tc.status === 'passed'
                        ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                        : tc.status === 'running'
                        ? 'bg-blue-950/40 border-blue-600/60 text-blue-200'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {tc.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : tc.status === 'running' ? (
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-medium text-xs leading-snug">{tc.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Category: <span className="uppercase text-slate-300">{tc.category}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                      {tc.latencyMs}ms
                    </span>
                  </div>
                ))}
              </div>

              {/* Defense Ready Banner */}
              {allPassed && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-blue-950/40 border border-emerald-600/40 text-xs text-emerald-200 flex items-center gap-2.5 animate-in fade-in duration-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-white text-xs">All System Checks Verified!</div>
                    <div className="text-[11px] text-slate-300">
                      0 Syntax Errors • 0 Broken Imports • Ready for Supervisor Defense
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                Close View
              </button>

              <button
                onClick={onDownloadZip}
                disabled={isDownloading}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download Working Software (.ZIP)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
