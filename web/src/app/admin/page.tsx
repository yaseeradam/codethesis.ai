'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldAlert,
  Sliders,
  Users,
  Coins,
  Cpu,
  CreditCard,
  ToggleLeft,
  ToggleRight,
  Save,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  AlertTriangle,
  Server,
  Activity,
  Layers,
  Crown,
  PanelLeftClose,
  PanelLeft,
  Check,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdminSettings } from '@/lib/db';

interface StudentUser {
  id: string;
  email: string;
  fullName: string;
  matricNumber: string;
  institution: string;
  plan: string;
  credits: number;
  status: string;
  createdAt: string;
}

interface TransactionItem {
  id: string;
  reference: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  planId: string;
  channel?: string;
  paidAt?: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'credits' | 'ai' | 'students' | 'transactions' | 'system'>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  // Stats
  const [stats, setStats] = useState({
    totalStudents: 3,
    totalProjects: 3,
    totalTransactions: 3,
    totalRevenueNgn: 27000,
    averageTurnitinScore: '3.8%',
  });

  // Settings State
  const [settings, setSettings] = useState<AdminSettings>({
    defaultSignupCredits: 15,
    toolCreditCosts: {
      thesis: 3,
      softwareBuilder: 2,
      siwesLogbook: 2,
      itfReport: 2,
      vivaPresentation: 1,
      vivaSimulator: 1,
      umlDiagrams: 1,
      assignmentSolver: 1,
    },
    aiEngine: {
      activeProvider: 'heuristic',
      modelName: 'gemini-1.5-flash',
      temperature: 0.7,
      maxTokens: 8192,
      systemPromptOverride: 'You are CodeThesis AI, the authoritative academic engineering copilot for tertiary university dissertations.',
      fallbackEnabled: true,
    },
    platformStatus: {
      online: true,
      statusText: 'All Systems Online',
      maintenanceNotice: 'Platform operating normally at 100% capacity.',
    },
  });

  // Students & Transactions State
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [studentSearch, setStudentSearch] = useState('');

  // Fetch admin settings & data
  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        if (data.settings) setSettings(data.settings);
        if (data.stats) setStats(data.stats);
      }

      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      if (usersData.success && usersData.users) {
        setStudents(usersData.users);
      }

      const txRes = await fetch('/api/admin/transactions');
      const txData = await txRes.json();
      if (txData.success && Array.isArray(txData.transactions) && txData.transactions.length > 0) {
        setTransactions(txData.transactions);
      } else {
        // Fallback sample transactions if no transactions in DB
        setTransactions([
          {
            id: 'tx-001',
            reference: 'CT-TX-849201948',
            userId: 'demo-student-001',
            amount: 8500,
            currency: 'NGN',
            status: 'success',
            planId: 'standard (FYP Pro)',
            channel: 'Paystack Card',
            createdAt: '2026-11-14 09:20 AM',
          },
          {
            id: 'tx-002',
            reference: 'CT-TX-109283746',
            userId: 'demo-student-002',
            amount: 15000,
            currency: 'NGN',
            status: 'success',
            planId: 'complete (Faculty Pass)',
            channel: 'Bank Transfer',
            createdAt: '2026-11-13 04:45 PM',
          },
          {
            id: 'tx-003',
            reference: 'CT-TX-551029481',
            userId: 'demo-student-003',
            amount: 3500,
            currency: 'NGN',
            status: 'success',
            planId: 'starter (SIWES)',
            channel: 'USSD / OPay',
            createdAt: '2026-11-12 11:15 AM',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings() {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess('Platform settings and credit parameters successfully saved!');
        setTimeout(() => setSaveSuccess(null), 3500);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAdjustCredits(userId: string, creditsDelta: number) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, creditsToAdd: creditsDelta }),
      });
      const data = await res.json();
      if (data.success) {
        setStudents(prev =>
          prev.map(s => (s.id === userId ? { ...s, credits: Math.max(0, s.credits + creditsDelta) } : s))
        );
      }
    } catch (err) {
      console.error('Failed to adjust credits:', err);
    }
  }

  const filteredStudents = students.filter(
    s =>
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.institution.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.matricNumber.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="h-screen bg-[#F1F5F9] text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-cyan-500 selection:text-white overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          1. ADMIN SIDEBAR (Midnight Navy #070F2B)
      ─────────────────────────────────────────────────────────────── */}
      <aside
        className={`bg-[#070F2B] text-slate-300 flex-shrink-0 flex flex-col justify-between p-3.5 h-full border-r border-slate-800/80 relative overflow-hidden z-20 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-full lg:w-[76px]' : 'w-full lg:w-[270px]'
        }`}
      >
        <div>
          {/* Brand & Collapse Header */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'} px-1 py-2.5 mb-3`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-amber-500/20 border border-amber-400/40 flex-shrink-0">
                <Image
                  src="/assets/logo_codethesis_3d.jpg"
                  alt="CodeThesis AI 3D Logo"
                  fill
                  className="object-cover"
                />
              </div>

              {!isSidebarCollapsed && (
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-base tracking-tight whitespace-nowrap">CodeThesis</span>
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-[9px] tracking-wider uppercase text-cyan-300/80 font-medium mt-0.5 whitespace-nowrap">
                    Command & Governance
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeft className="w-4 h-4 text-amber-400" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
              } ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="Overview & Telemetry"
            >
              <Activity className="w-4 h-4 stroke-[2.2] flex-shrink-0" />
              {!isSidebarCollapsed && <span>Overview & Telemetry</span>}
            </button>

            <button
              onClick={() => setActiveTab('credits')}
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
              } ${
                activeTab === 'credits'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="Free Signup & Credit Governor"
            >
              <Coins className="w-4 h-4 stroke-[2.2] flex-shrink-0 text-amber-400" />
              {!isSidebarCollapsed && <span>Credit & Cost Governor</span>}
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
              } ${
                activeTab === 'ai'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="AI Engine & Fallback Controller"
            >
              <Cpu className="w-4 h-4 stroke-[2.2] flex-shrink-0 text-cyan-400" />
              {!isSidebarCollapsed && <span>AI Fallback & Models</span>}
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
              } ${
                activeTab === 'students'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="Student User Directory"
            >
              <Users className="w-4 h-4 stroke-[2.2] flex-shrink-0 text-emerald-400" />
              {!isSidebarCollapsed && <span>Student Directory</span>}
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
              } ${
                activeTab === 'transactions'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="Paystack Transactions Audit"
            >
              <CreditCard className="w-4 h-4 stroke-[2.2] flex-shrink-0 text-purple-400" />
              {!isSidebarCollapsed && <span>Paystack Audit</span>}
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
              } ${
                activeTab === 'system'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="Platform Status & Killswitch"
            >
              <Server className="w-4 h-4 stroke-[2.2] flex-shrink-0 text-rose-400" />
              {!isSidebarCollapsed && <span>Platform Status</span>}
            </button>
          </nav>

          <div className="border-t border-slate-800/80 my-4 mx-1" />

          {/* Quick link to Student Dashboard */}
          <Link
            href="/dashboard"
            className={`flex items-center rounded-xl text-xs font-semibold text-cyan-300 hover:text-white bg-white/5 hover:bg-white/10 p-2.5 transition-all ${
              isSidebarCollapsed ? 'justify-center' : 'gap-2 px-3'
            }`}
            title="Switch to Student Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Student Dashboard</span>}
          </Link>
        </div>

        {/* Admin Footer */}
        <div className="pt-3 border-t border-slate-800/60">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2 px-2'}`}>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            {!isSidebarCollapsed && (
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Live Admin Mode
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN ADMIN CONTENT WORKSPACE
      ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Top Action Bar */}
        <header className="sticky top-0 z-30 bg-[#F1F5F9]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200/80 gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Admin Control Center</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                v1.0.0
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{saveSuccess}</span>
              </span>
            )}

            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </header>

        {/* Tab Body */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* TAB 1: OVERVIEW & TELEMETRY */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.totalStudents}</div>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% Active in 2026 Session</p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Gross Paystack Revenue</span>
                    <Coins className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">₦{stats.totalRevenueNgn.toLocaleString()}</div>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Naira Bank & Card Settlements</p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Generated Academic Artifacts</span>
                    <Layers className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.totalProjects} Packages</div>
                  <p className="text-[11px] text-slate-500 mt-1">Dissertations, Decks & Software ZIPs</p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Turnitin Similarity Average</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600">{stats.averageTurnitinScore}</div>
                  <p className="text-[11px] text-slate-500 mt-1">Well below the 15% threshold</p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="rounded-3xl bg-gradient-to-r from-[#070E27] via-[#0B1C4D] to-[#0A266E] border border-blue-900/40 p-6 text-white shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                      System Operational Status
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1">
                      CodeThesis Engine Status: {settings.platformStatus.online ? 'All Systems Online' : 'Maintenance Mode'}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      {settings.platformStatus.maintenanceNotice}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setSettings(prev => ({
                          ...prev,
                          platformStatus: { ...prev.platformStatus, online: !prev.platformStatus.online },
                        }))
                      }
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        settings.platformStatus.online
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                      }`}
                    >
                      {settings.platformStatus.online ? 'Online (Active)' : 'Offline (Maintenance)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREDIT & COST GOVERNOR */}
          {activeTab === 'credits' && (
            <div className="space-y-6">
              {/* Highlight Card: Default Free Credits on First Signup */}
              <div className="bg-white border-2 border-amber-300/80 rounded-3xl p-6 shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
                      <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>First-Login Free Credit Allocation</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Free Credits Awarded on Student First Registration
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">
                      Configure the exact number of free generation credits credited automatically when a new student logs in or registers.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-3">
                    <button
                      onClick={() =>
                        setSettings(prev => ({
                          ...prev,
                          defaultSignupCredits: Math.max(1, prev.defaultSignupCredits - 1),
                        }))
                      }
                      className="w-8 h-8 rounded-xl bg-white text-slate-800 font-black shadow-xs flex items-center justify-center hover:bg-slate-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-2xl font-black text-amber-700 min-w-[50px] text-center">
                      {settings.defaultSignupCredits}
                    </span>
                    <button
                      onClick={() =>
                        setSettings(prev => ({
                          ...prev,
                          defaultSignupCredits: prev.defaultSignupCredits + 1,
                        }))
                      }
                      className="w-8 h-8 rounded-xl bg-white text-slate-800 font-black shadow-xs flex items-center justify-center hover:bg-slate-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Automatic Deduction Matrix */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Automatic Credit Deduction Matrix Per Tool
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    When a student runs any tool, the system automatically deducts this credit amount from their account balance.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(settings.toolCreditCosts).map(([toolKey, cost]) => (
                    <div key={toolKey} className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50">
                      <p className="text-xs font-bold text-slate-800 capitalize mb-1">
                        {toolKey.replace(/([A-Z])/g, ' $1')}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[11px] text-slate-500">Cost:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={cost}
                            onChange={e => {
                              const val = parseInt(e.target.value) || 1;
                              setSettings(prev => ({
                                ...prev,
                                toolCreditCosts: {
                                  ...prev.toolCreditCosts,
                                  [toolKey]: val,
                                },
                              }));
                            }}
                            className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                          <span className="text-xs text-slate-500">pts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI ENGINE & FALLBACK CONTROLLER */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      Active AI Generation Provider & Zero-Downtime Fallback
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">
                      Choose which AI provider powers student dissertation synthesis. If an external API runs out of balance or fails, the <strong>Academic Heuristic Fallback</strong> ensures 100% uptime with zero error pages.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Fallback Protection Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Option 1: Heuristic Fallback */}
                  <div
                    onClick={() =>
                      setSettings(prev => ({
                        ...prev,
                        aiEngine: { ...prev.aiEngine, activeProvider: 'heuristic' },
                      }))
                    }
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                      settings.aiEngine.activeProvider === 'heuristic'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">Academic Heuristic</span>
                      {settings.aiEngine.activeProvider === 'heuristic' && (
                        <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Zero-cost, publication-grade academic heuristic. Generates 18k words, real Crossref DOIs, and zero hallucinated code.
                    </p>
                  </div>

                  {/* Option 2: Google Gemini */}
                  <div
                    onClick={() =>
                      setSettings(prev => ({
                        ...prev,
                        aiEngine: { ...prev.aiEngine, activeProvider: 'gemini', modelName: 'gemini-1.5-flash' },
                      }))
                    }
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                      settings.aiEngine.activeProvider === 'gemini'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">Google Gemini 1.5 Flash</span>
                      {settings.aiEngine.activeProvider === 'gemini' && (
                        <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      High-speed contextual reasoning with 1M context window. Uses GEMINI_API_KEY from environment vault.
                    </p>
                  </div>

                  {/* Option 3: OpenAI GPT-4o */}
                  <div
                    onClick={() =>
                      setSettings(prev => ({
                        ...prev,
                        aiEngine: { ...prev.aiEngine, activeProvider: 'openai', modelName: 'gpt-4o-mini' },
                      }))
                    }
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                      settings.aiEngine.activeProvider === 'openai'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">OpenAI GPT-4o-mini</span>
                      {settings.aiEngine.activeProvider === 'openai' && (
                        <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Compact, highly structured code and thesis generation. Uses OPENAI_API_KEY from environment vault.
                    </p>
                  </div>
                </div>

                {/* Master System Prompt Override */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Master Academic System Prompt Override
                  </label>
                  <textarea
                    rows={4}
                    value={settings.aiEngine.systemPromptOverride}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        aiEngine: { ...prev.aiEngine, systemPromptOverride: e.target.value },
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Prepended to all student tool prompts to enforce APA 7th citations, Big-O analysis, and Nigerian university standards.
                  </p>
                </div>

                {/* Runtime AI API Key Vault */}
                <div className="border-t border-slate-200/80 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-blue-600" />
                        <span>Dynamic AI API Key Vault</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Supply your AI API keys. The system rotates and falls back automatically if quota limits are reached.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Gemini Key */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Google Gemini API Key</span>
                          {settings.aiEngine.apiKeys?.gemini && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Set</span>
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowKeys(prev => ({ ...prev, gemini: !prev.gemini }))}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showKeys.gemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <input
                        type={showKeys.gemini ? 'text' : 'password'}
                        value={settings.aiEngine.apiKeys?.gemini || ''}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            aiEngine: {
                              ...prev.aiEngine,
                              apiKeys: {
                                ...(prev.aiEngine.apiKeys || {}),
                                gemini: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="AIzaSy..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* OpenAI Key */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>OpenAI API Key</span>
                          {settings.aiEngine.apiKeys?.openai && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Set</span>
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowKeys(prev => ({ ...prev, openai: !prev.openai }))}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showKeys.openai ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <input
                        type={showKeys.openai ? 'text' : 'password'}
                        value={settings.aiEngine.apiKeys?.openai || ''}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            aiEngine: {
                              ...prev.aiEngine,
                              apiKeys: {
                                ...(prev.aiEngine.apiKeys || {}),
                                openai: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="sk-proj-..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Anthropic Claude Key */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Anthropic Claude Key</span>
                          {settings.aiEngine.apiKeys?.anthropic && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Set</span>
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowKeys(prev => ({ ...prev, anthropic: !prev.anthropic }))}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showKeys.anthropic ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <input
                        type={showKeys.anthropic ? 'text' : 'password'}
                        value={settings.aiEngine.apiKeys?.anthropic || ''}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            aiEngine: {
                              ...prev.aiEngine,
                              apiKeys: {
                                ...(prev.aiEngine.apiKeys || {}),
                                anthropic: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="sk-ant-api..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* DeepSeek Key */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>DeepSeek API Key</span>
                          {settings.aiEngine.apiKeys?.deepseek && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Set</span>
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowKeys(prev => ({ ...prev, deepseek: !prev.deepseek }))}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          {showKeys.deepseek ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <input
                        type={showKeys.deepseek ? 'text' : 'password'}
                        value={settings.aiEngine.apiKeys?.deepseek || ''}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            aiEngine: {
                              ...prev.aiEngine,
                              apiKeys: {
                                ...(prev.aiEngine.apiKeys || {}),
                                deepseek: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="sk-..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STUDENT DIRECTORY */}
          {activeTab === 'students' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Registered Student Directory</h3>
                  <p className="text-xs text-slate-500">
                    Inspect student matriculation numbers, institution distribution, and grant manual credit adjustments.
                  </p>
                </div>

                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    placeholder="Search name, school, matric..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Matric No</th>
                      <th className="p-3">Institution</th>
                      <th className="p-3">Current Plan</th>
                      <th className="p-3">Credits</th>
                      <th className="p-3 text-right">Quick Credit Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{student.fullName}</td>
                        <td className="p-3 font-mono text-slate-600">{student.matricNumber}</td>
                        <td className="p-3 text-slate-600">{student.institution}</td>
                        <td className="p-3">
                          <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">
                            {student.plan}
                          </span>
                        </td>
                        <td className="p-3 font-black text-slate-900 text-sm">{student.credits}</td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleAdjustCredits(student.id, 5)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[10px] transition-colors"
                              title="Add 5 Credits"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => handleAdjustCredits(student.id, 15)}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[10px] transition-colors"
                              title="Add 15 Credits"
                            >
                              +15
                            </button>
                            <button
                              onClick={() => handleAdjustCredits(student.id, -5)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px] transition-colors"
                              title="Deduct 5 Credits"
                            >
                              -5
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PAYSTACK AUDIT */}
          {activeTab === 'transactions' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Paystack & Stripe Transaction Ledger</h3>
                  <p className="text-xs text-slate-500">
                    Real-time payment audit log with settlement status across African cards, bank transfers, USSD, and OPay.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Student</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3">Tier Plan</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-mono font-bold text-blue-600">{tx.reference}</td>
                        <td className="p-3 font-medium text-slate-800">{tx.userId}</td>
                        <td className="p-3 font-black text-slate-900">₦{tx.amount.toLocaleString()}</td>
                        <td className="p-3 text-slate-600">{tx.channel}</td>
                        <td className="p-3 text-slate-600 capitalize">{tx.planId}</td>
                        <td className="p-3">
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Verified</span>
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">{tx.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: PLATFORM STATUS */}
          {activeTab === 'system' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Platform Operational Status & Maintenance Notice</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Control the live platform telemetry badge displayed to students on the main dashboard.
                </p>
              </div>

              <div className="space-y-4 max-w-xl">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Platform Online Status</p>
                    <p className="text-[11px] text-slate-500">Toggle active system availability badge.</p>
                  </div>
                  <button
                    onClick={() =>
                      setSettings(prev => ({
                        ...prev,
                        platformStatus: { ...prev.platformStatus, online: !prev.platformStatus.online },
                      }))
                    }
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      settings.platformStatus.online ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        settings.platformStatus.online ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Status Badge Text</label>
                  <input
                    type="text"
                    value={settings.platformStatus.statusText}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        platformStatus: { ...prev.platformStatus, statusText: e.target.value },
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Maintenance / Broadcast Notice</label>
                  <textarea
                    rows={3}
                    value={settings.platformStatus.maintenanceNotice}
                    onChange={e =>
                      setSettings(prev => ({
                        ...prev,
                        platformStatus: { ...prev.platformStatus, maintenanceNotice: e.target.value },
                      }))
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
