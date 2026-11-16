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
  EyeOff,
  Building,
  Copy,
  Trash2,
  ShieldCheck,
  Terminal,
  Shield,
  Award,
  Clock,
  X,
  Send,
  School,
  CheckSquare,
  FileText
} from 'lucide-react';
import { AdminSettings, InstitutionalLicense, InstitutionalQuote } from '@/lib/db';

interface StudentUser {
  id: string;
  email: string;
  fullName: string;
  matricNumber: string;
  institution: string;
  department?: string;
  plan: string;
  credits: number;
  role?: string;
  status: string;
  licenseId?: string;
  createdAt: string;
}

interface TransactionItem {
  id: string;
  reference: string;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  amount: number;
  currency: string;
  status: string;
  planId: string;
  channel?: string;
  paidAt?: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'licenses' | 'credits' | 'ai' | 'students' | 'transactions' | 'developers' | 'security' | 'system'
  >('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  // Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalProjects: 0,
    totalTransactions: 0,
    totalRevenueNgn: 0,
    averageTurnitinScore: '0%',
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
  const [studentSchoolFilter, setStudentSchoolFilter] = useState('all');
  const [txSearch, setTxSearch] = useState('');

  // Institutional License State
  const [licenses, setLicenses] = useState<InstitutionalLicense[]>([]);
  const [licenseStats, setLicenseStats] = useState<any>({
    totalLicenses: 0,
    activeLicenses: 0,
    totalSeats: 0,
    usedSeats: 0,
    totalPooledCredits: 0,
    remainingPooledCredits: 0,
    universitiesCovered: 0,
    departmentsCovered: 0,
  });
  const [quotes, setQuotes] = useState<InstitutionalQuote[]>([]);
  const [activeLicenseSubTab, setActiveLicenseSubTab] = useState<'licenses' | 'quotes'>('licenses');
  const [licenseSearch, setLicenseSearch] = useState('');
  const [showCreateLicenseModal, setShowCreateLicenseModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [newLicenseForm, setNewLicenseForm] = useState({
    institutionName: '',
    facultyName: '',
    departmentName: '',
    coordinatorName: '',
    coordinatorEmail: '',
    coordinatorPhone: '',
    planTier: 'departmental' as 'departmental' | 'faculty' | 'campus_wide',
    totalSeats: 150,
    creditsPerStudent: 50,
    pooledCredits: 7500,
    academicSession: '2025/2026',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Developer API Keys State
  const [developerKeys, setDeveloperKeys] = useState<any[]>([]);
  const [developerKeySearch, setDeveloperKeySearch] = useState('');

  // Security Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLogFilter, setAuditLogFilter] = useState<string>('all');

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
      if (txData.success && Array.isArray(txData.transactions)) {
        setTransactions(txData.transactions);
      }

      // Load licenses, dev keys, and audit logs
      loadLicenses();
      loadDeveloperKeys();
      loadAuditLogs();
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadLicenses() {
    try {
      const res = await fetch('/api/admin/licenses');
      const data = await res.json();
      if (data.success) {
        setLicenses(data.licenses || []);
        if (data.stats) setLicenseStats(data.stats);
      }
      const quotesRes = await fetch('/api/admin/licenses/quotes');
      const quotesData = await quotesRes.json();
      if (quotesData.success) {
        setQuotes(quotesData.quotes || []);
      }
    } catch (err) {
      console.error('Failed to load licenses:', err);
    }
  }

  async function loadDeveloperKeys() {
    try {
      const res = await fetch('/api/admin/developer-keys');
      const data = await res.json();
      if (data.success) {
        setDeveloperKeys(data.keys || []);
      }
    } catch (err) {
      console.error('Failed to load developer keys:', err);
    }
  }

  async function loadAuditLogs() {
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
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

  async function handleUpdateUserRole(userId: string, newRole: string) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setStudents(prev => prev.map(s => (s.id === userId ? { ...s, role: newRole } : s)));
        setSaveSuccess(`User role updated to ${newRole}`);
        setTimeout(() => setSaveSuccess(null), 2500);
      }
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  }

  async function handleUpdateUserPlan(userId: string, newPlan: string) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPlan }),
      });
      const data = await res.json();
      if (data.success) {
        setStudents(prev => prev.map(s => (s.id === userId ? { ...s, plan: newPlan } : s)));
        setSaveSuccess(`User tier updated to ${newPlan}`);
        setTimeout(() => setSaveSuccess(null), 2500);
      }
    } catch (err) {
      console.error('Failed to update user plan:', err);
    }
  }

  async function handleDeleteUser(userId: string, fullName: string) {
    if (!confirm(`Are you sure you want to delete user "${fullName}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStudents(prev => prev.filter(s => s.id !== userId));
        setSaveSuccess('User removed successfully');
        setTimeout(() => setSaveSuccess(null), 2500);
      } else {
        alert(data.error || 'Failed to delete user.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting user.');
    }
  }

  async function handleCreateLicense(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLicenseForm),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(`License ${data.license.licenseCode} issued successfully!`);
        setShowCreateLicenseModal(false);
        setNewLicenseForm({
          institutionName: '',
          facultyName: '',
          departmentName: '',
          coordinatorName: '',
          coordinatorEmail: '',
          coordinatorPhone: '',
          planTier: 'departmental',
          totalSeats: 150,
          creditsPerStudent: 50,
          pooledCredits: 7500,
          academicSession: '2025/2026',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        loadLicenses();
        setTimeout(() => setSaveSuccess(null), 3500);
      } else {
        alert(data.error || 'Failed to issue license.');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating license.');
    }
  }

  async function handleToggleLicenseStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { status: newStatus } }),
      });
      const data = await res.json();
      if (data.success) {
        setLicenses(prev => prev.map(l => (l.id === id ? { ...l, status: newStatus as any } : l)));
      }
    } catch (err) {
      console.error('Failed to toggle license status:', err);
    }
  }

  async function handleAddLicenseSeats(id: string, currentSeats: number, delta: number) {
    const newSeats = Math.max(1, currentSeats + delta);
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { totalSeats: newSeats } }),
      });
      const data = await res.json();
      if (data.success) {
        setLicenses(prev => prev.map(l => (l.id === id ? { ...l, totalSeats: newSeats } : l)));
      }
    } catch (err) {
      console.error('Failed to adjust license seats:', err);
    }
  }

  async function handleRevokeLicense(id: string, code: string) {
    if (!confirm(`Revoke and delete license ${code}? Covered students will lose faculty privileges.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/licenses?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLicenses(prev => prev.filter(l => l.id !== id));
      }
    } catch (err) {
      console.error('Failed to revoke license:', err);
    }
  }

  async function handleApproveQuote(quoteId: string) {
    try {
      const res = await fetch('/api/admin/licenses/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, action: 'approve' }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(`Quote approved! Issued: ${data.license.licenseCode}`);
        loadLicenses();
        setTimeout(() => setSaveSuccess(null), 3500);
      } else {
        alert(data.error || 'Failed to approve quote.');
      }
    } catch (err) {
      console.error('Failed to approve quote:', err);
    }
  }

  async function handleRejectQuote(quoteId: string) {
    try {
      const res = await fetch('/api/admin/licenses/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, action: 'reject' }),
      });
      const data = await res.json();
      if (data.success) {
        setQuotes(prev => prev.map(q => (q.id === quoteId ? { ...q, status: 'rejected' } : q)));
      }
    } catch (err) {
      console.error('Failed to reject quote:', err);
    }
  }

  async function handleToggleDevKey(keyId: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'revoked' : 'active';
    try {
      const res = await fetch('/api/admin/developer-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setDeveloperKeys(prev => prev.map(k => (k.id === keyId ? { ...k, status: newStatus } : k)));
      }
    } catch (err) {
      console.error('Failed to toggle dev key status:', err);
    }
  }

  function handleCopyCode(code: string) {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  }

  // Filtered queries
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.institution && s.institution.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.matricNumber && s.matricNumber.toLowerCase().includes(studentSearch.toLowerCase())) ||
      (s.department && s.department.toLowerCase().includes(studentSearch.toLowerCase()));
    const matchesSchool = studentSchoolFilter === 'all' || s.institution === studentSchoolFilter;
    return matchesSearch && matchesSchool;
  });

  const filteredLicenses = licenses.filter(
    l =>
      l.licenseCode.toLowerCase().includes(licenseSearch.toLowerCase()) ||
      l.institutionName.toLowerCase().includes(licenseSearch.toLowerCase()) ||
      l.departmentName.toLowerCase().includes(licenseSearch.toLowerCase()) ||
      l.coordinatorName.toLowerCase().includes(licenseSearch.toLowerCase()) ||
      l.coordinatorEmail.toLowerCase().includes(licenseSearch.toLowerCase())
  );

  const filteredDevKeys = developerKeys.filter(
    k =>
      k.name.toLowerCase().includes(developerKeySearch.toLowerCase()) ||
      (k.userEmail && k.userEmail.toLowerCase().includes(developerKeySearch.toLowerCase())) ||
      (k.institutionName && k.institutionName.toLowerCase().includes(developerKeySearch.toLowerCase()))
  );

  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditLogFilter === 'all') return true;
    return log.action === auditLogFilter;
  });

  const filteredTransactions = transactions.filter(
    t =>
      t.reference.toLowerCase().includes(txSearch.toLowerCase()) ||
      (t.userEmail && t.userEmail.toLowerCase().includes(txSearch.toLowerCase())) ||
      (t.userFullName && t.userFullName.toLowerCase().includes(txSearch.toLowerCase()))
  );

  const uniqueInstitutions = Array.from(new Set(students.map(s => s.institution).filter(Boolean)));

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
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeft className="w-4 h-4 text-amber-400" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
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

            {/* TAB: Institutional Departmental Licenses */}
            <button
              onClick={() => setActiveTab('licenses')}
              className={`w-full flex items-center justify-between rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3.5 py-2.5'
              } ${
                activeTab === 'licenses'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="Institutional & Departmental Licenses"
            >
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 stroke-[2.2] flex-shrink-0 text-amber-300" />
                {!isSidebarCollapsed && <span>Campus Licenses</span>}
              </div>
              {!isSidebarCollapsed && licenses.length > 0 && (
                <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full">
                  {licenses.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('credits')}
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
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
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
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
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
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
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
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

            {/* TAB: Developer API Keys */}
            <button
              onClick={() => setActiveTab('developers')}
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
              } ${
                activeTab === 'developers'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="Developer API Keys"
            >
              <Key className="w-4 h-4 stroke-[2.2] flex-shrink-0 text-fuchsia-400" />
              {!isSidebarCollapsed && <span>Developer API Keys</span>}
            </button>

            {/* TAB: Security & Audit Logs */}
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
              } ${
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="Security & Audit Trail"
            >
              <ShieldAlert className="w-4 h-4 stroke-[2.2] flex-shrink-0 text-rose-400" />
              {!isSidebarCollapsed && <span>Security & Audit</span>}
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
              } ${
                activeTab === 'system'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-md shadow-sky-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
              title="Platform Status & Killswitch"
            >
              <Server className="w-4 h-4 stroke-[2.2] flex-shrink-0 text-cyan-300" />
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
                v1.2.0
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
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
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
                    <span className="text-xs font-bold uppercase tracking-wider">Institutional Licenses</span>
                    <Building className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{licenses.length} Campus Hubs</div>
                  <p className="text-[11px] text-slate-500 mt-1">{licenseStats.totalSeats || 0} Licensed Student Seats</p>
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
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

          {/* TAB 2: INSTITUTIONAL & DEPARTMENTAL LICENSES */}
          {activeTab === 'licenses' && (
            <div className="space-y-6">
              {/* Top Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Campus Licenses</span>
                    <Building className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{licenses.length}</div>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">Covering {licenseStats.universitiesCovered || 0} Universities</p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Student Seat Utilization</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {licenseStats.usedSeats || 0} / {licenseStats.totalSeats || 0}
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{
                        width: `${licenseStats.totalSeats ? Math.min(100, Math.round(((licenseStats.usedSeats || 0) / licenseStats.totalSeats) * 100)) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Pooled Credits</span>
                    <Coins className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {(licenseStats.totalPooledCredits || 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {(licenseStats.remainingPooledCredits || 0).toLocaleString()} Remaining in Pool
                  </p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Inbound HOD Quotes</span>
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{quotes.filter(q => q.status === 'pending').length} Pending</div>
                  <p className="text-[11px] text-purple-600 font-semibold mt-1">Direct from Pricing Page</p>
                </div>
              </div>

              {/* Sub-Tab Header & Issue License Button */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setActiveLicenseSubTab('licenses')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeLicenseSubTab === 'licenses'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Issued Licenses ({licenses.length})
                    </button>
                    <button
                      onClick={() => setActiveLicenseSubTab('quotes')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeLicenseSubTab === 'quotes'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Inbound Inquiries</span>
                      {quotes.filter(q => q.status === 'pending').length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search institution, code, HOD..."
                        value={licenseSearch}
                        onChange={e => setLicenseSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <button
                      onClick={() => setShowCreateLicenseModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Issue New Department License</span>
                    </button>
                  </div>
                </div>

                {/* SUBTAB 1: ISSUED LICENSES TABLE */}
                {activeLicenseSubTab === 'licenses' && (
                  <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3">License Code</th>
                          <th className="p-3">Institution & Department</th>
                          <th className="p-3">Coordinator / HOD</th>
                          <th className="p-3">Tier</th>
                          <th className="p-3">Seats Claimed</th>
                          <th className="p-3">Pooled Credits</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredLicenses.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-400">
                              No institutional licenses issued yet. Click &ldquo;Issue New Department License&rdquo; above to provision your first campus hub.
                            </td>
                          </tr>
                        ) : (
                          filteredLicenses.map(lic => (
                            <tr key={lic.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                                    {lic.licenseCode}
                                  </span>
                                  <button
                                    onClick={() => handleCopyCode(lic.licenseCode)}
                                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                    title="Copy Code"
                                  >
                                    {copiedCode === lic.licenseCode ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              <td className="p-3">
                                <p className="font-bold text-slate-900">{lic.departmentName}</p>
                                <p className="text-[11px] text-slate-500">{lic.institutionName}</p>
                              </td>

                              <td className="p-3">
                                <p className="font-medium text-slate-800">{lic.coordinatorName}</p>
                                <p className="text-[10px] text-slate-500">{lic.coordinatorEmail}</p>
                              </td>

                              <td className="p-3">
                                <span className="bg-cyan-50 text-cyan-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                                  {lic.planTier}
                                </span>
                              </td>

                              <td className="p-3">
                                <div className="space-y-1">
                                  <span className="font-bold text-slate-900">
                                    {lic.usedSeats} / {lic.totalSeats} seats
                                  </span>
                                  <div className="w-24 bg-slate-200 rounded-full h-1 overflow-hidden">
                                    <div
                                      className="bg-cyan-600 h-1 rounded-full"
                                      style={{
                                        width: `${lic.totalSeats ? Math.min(100, Math.round((lic.usedSeats / lic.totalSeats) * 100)) : 0}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>

                              <td className="p-3">
                                <span className="font-black text-slate-900">{lic.remainingPooledCredits?.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-400 ml-1">/ {lic.pooledCredits?.toLocaleString()}</span>
                              </td>

                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    lic.status === 'active'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {lic.status}
                                </span>
                              </td>

                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleToggleLicenseStatus(lic.id, lic.status)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                      lic.status === 'active'
                                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                                    }`}
                                    title={lic.status === 'active' ? 'Suspend License' : 'Activate License'}
                                  >
                                    {lic.status === 'active' ? 'Suspend' : 'Activate'}
                                  </button>

                                  <button
                                    onClick={() => handleAddLicenseSeats(lic.id, lic.totalSeats, 25)}
                                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold cursor-pointer"
                                    title="Add 25 Student Seats"
                                  >
                                    +25 Seats
                                  </button>

                                  <button
                                    onClick={() => handleRevokeLicense(lic.id, lic.licenseCode)}
                                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                    title="Revoke and Delete License"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SUBTAB 2: INBOUND QUOTES TABLE */}
                {activeLicenseSubTab === 'quotes' && (
                  <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3">Department & University</th>
                          <th className="p-3">HOD / Contact</th>
                          <th className="p-3">Students</th>
                          <th className="p-3">Estimated Investment</th>
                          <th className="p-3">Requirements</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Approval Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {quotes.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-400">
                              No inbound institutional quote requests yet.
                            </td>
                          </tr>
                        ) : (
                          quotes.map(q => (
                            <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-3">
                                <p className="font-bold text-slate-900">{q.departmentName}</p>
                                <p className="text-[11px] text-slate-500">{q.institutionName}</p>
                              </td>
                              <td className="p-3">
                                <p className="font-medium text-slate-800">{q.contactName}</p>
                                <p className="text-[10px] text-slate-500">{q.contactEmail} &bull; {q.contactPhone || 'No phone'}</p>
                              </td>
                              <td className="p-3 font-bold text-slate-900">{q.estimatedStudents}</td>
                              <td className="p-3 font-black text-slate-900">
                                ₦{q.estimatedAmountNgn?.toLocaleString() || '0'}
                              </td>
                              <td className="p-3 text-[11px] text-slate-600 max-w-xs truncate" title={q.customRequirements}>
                                {q.customRequirements || 'Standard thesis and viva setup'}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    q.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : q.status === 'rejected'
                                      ? 'bg-rose-50 text-rose-700'
                                      : 'bg-amber-50 text-amber-800'
                                  }`}
                                >
                                  {q.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {q.status === 'pending' ? (
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleApproveQuote(q.id)}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                                    >
                                      Approve & Issue
                                    </button>
                                    <button
                                      onClick={() => handleRejectQuote(q.id)}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 capitalize">{q.status}</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CREDIT & COST GOVERNOR */}
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
                      className="w-8 h-8 rounded-xl bg-white text-slate-800 font-black shadow-xs flex items-center justify-center hover:bg-slate-100 cursor-pointer"
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
                      className="w-8 h-8 rounded-xl bg-white text-slate-800 font-black shadow-xs flex items-center justify-center hover:bg-slate-100 cursor-pointer"
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

          {/* TAB 4: AI ENGINE & FALLBACK CONTROLLER */}
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

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                  {/* Option 1: Heuristic Fallback */}
                  <div
                    onClick={() =>
                      setSettings(prev => ({
                        ...prev,
                        aiEngine: { ...prev.aiEngine, activeProvider: 'heuristic' },
                      }))
                    }
                    className={`border-2 rounded-2xl p-3.5 cursor-pointer transition-all ${
                      settings.aiEngine.activeProvider === 'heuristic'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">Academic Heuristic</span>
                      {settings.aiEngine.activeProvider === 'heuristic' && (
                        <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Zero-cost, publication-grade academic heuristic. Generates 18k words, real Crossref DOIs.
                    </p>
                  </div>

                  {/* Option 2: Google Gemini */}
                  <div
                    onClick={() =>
                      setSettings(prev => ({
                        ...prev,
                        aiEngine: { ...prev.aiEngine, activeProvider: 'gemini', modelName: 'gemini-2.5-flash' },
                      }))
                    }
                    className={`border-2 rounded-2xl p-3.5 cursor-pointer transition-all ${
                      settings.aiEngine.activeProvider === 'gemini'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">Google Gemini</span>
                      {settings.aiEngine.activeProvider === 'gemini' && (
                        <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      1M+ token context window. Free tier on AI Studio. Best for full 5-chapter dissertations.
                    </p>
                  </div>

                  {/* Option 3: Groq LPU (Ultra-Fast) */}
                  <div
                    onClick={() =>
                      setSettings(prev => ({
                        ...prev,
                        aiEngine: { ...prev.aiEngine, activeProvider: 'groq', modelName: 'llama-3.3-70b-versatile' },
                      }))
                    }
                    className={`border-2 rounded-2xl p-3.5 cursor-pointer transition-all ${
                      settings.aiEngine.activeProvider === 'groq'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">Groq LPU (Fast)</span>
                      {settings.aiEngine.activeProvider === 'groq' && (
                        <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      500-800 tokens/sec. Free dev tier. Instantaneous response for Viva Simulator & Oral defense.
                    </p>
                  </div>

                  {/* Option 4: Qwen (Qwen 2.5 Coder) */}
                  <div
                    onClick={() =>
                      setSettings(prev => ({
                        ...prev,
                        aiEngine: { ...prev.aiEngine, activeProvider: 'qwen', modelName: 'qwen-2.5-coder-32b-instruct' },
                      }))
                    }
                    className={`border-2 rounded-2xl p-3.5 cursor-pointer transition-all ${
                      settings.aiEngine.activeProvider === 'qwen'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">Qwen 2.5 Coder</span>
                      {settings.aiEngine.activeProvider === 'qwen' && (
                        <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      World-class open coding & architecture model. Runs on Groq or DashScope.
                    </p>
                  </div>

                  {/* Option 5: OpenAI GPT-4o */}
                  <div
                    onClick={() =>
                      setSettings(prev => ({
                        ...prev,
                        aiEngine: { ...prev.aiEngine, activeProvider: 'openai', modelName: 'gpt-4o-mini' },
                      }))
                    }
                    className={`border-2 rounded-2xl p-3.5 cursor-pointer transition-all ${
                      settings.aiEngine.activeProvider === 'openai'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">OpenAI GPT-4o-mini</span>
                      {settings.aiEngine.activeProvider === 'openai' && (
                        <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Standard industry benchmark for structured JSON, thesis parsing, and fallback generation.
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
                          className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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
                          className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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

                    {/* Groq LPU Key */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Groq API Key (Fast LPU)</span>
                          {settings.aiEngine.apiKeys?.groq && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Set</span>
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowKeys(prev => ({ ...prev, groq: !prev.groq }))}
                          className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          {showKeys.groq ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <input
                        type={showKeys.groq ? 'text' : 'password'}
                        value={settings.aiEngine.apiKeys?.groq || ''}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            aiEngine: {
                              ...prev.aiEngine,
                              apiKeys: {
                                ...(prev.aiEngine.apiKeys || {}),
                                groq: e.target.value,
                              },
                            },
                          }))
                        }
                        placeholder="gsk_..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Qwen Key */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Qwen API Key (DashScope / OpenRouter)</span>
                          {settings.aiEngine.apiKeys?.qwen && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">Set</span>
                          )}
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowKeys(prev => ({ ...prev, qwen: !prev.qwen }))}
                          className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          {showKeys.qwen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <input
                        type={showKeys.qwen ? 'text' : 'password'}
                        value={settings.aiEngine.apiKeys?.qwen || ''}
                        onChange={e =>
                          setSettings(prev => ({
                            ...prev,
                            aiEngine: {
                              ...prev.aiEngine,
                              apiKeys: {
                                ...(prev.aiEngine.apiKeys || {}),
                                qwen: e.target.value,
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

          {/* TAB 5: STUDENT DIRECTORY */}
          {activeTab === 'students' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Registered Student Directory</h3>
                  <p className="text-xs text-slate-500">
                    Inspect student matriculation numbers, institution distribution, change user roles or plans, and manage manual credit adjustments.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {uniqueInstitutions.length > 0 && (
                    <select
                      value={studentSchoolFilter}
                      onChange={e => setStudentSchoolFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                    >
                      <option value="all">All Institutions ({students.length})</option>
                      {uniqueInstitutions.map(inst => (
                        <option key={inst} value={inst}>
                          {inst}
                        </option>
                      ))}
                    </select>
                  )}

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
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Matric No</th>
                      <th className="p-3">Institution & Dept</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Current Plan</th>
                      <th className="p-3">Credits</th>
                      <th className="p-3 text-right">Quick Credit Adjust</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{student.fullName}</p>
                          <p className="text-[10px] text-slate-400">{student.email}</p>
                        </td>

                        <td className="p-3 font-mono text-slate-600">{student.matricNumber || '—'}</td>

                        <td className="p-3">
                          <p className="text-slate-800 font-medium">{student.institution || '—'}</p>
                          <p className="text-[10px] text-slate-500">{student.department || 'General'}</p>
                        </td>

                        <td className="p-3">
                          <select
                            value={student.role || 'student'}
                            onChange={e => handleUpdateUserRole(student.id, e.target.value)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-md border cursor-pointer ${
                              student.role === 'admin'
                                ? 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        <td className="p-3">
                          <select
                            value={student.plan || 'free'}
                            onChange={e => handleUpdateUserPlan(student.id, e.target.value)}
                            className="bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-md text-[10px] uppercase border border-blue-200 cursor-pointer"
                          >
                            <option value="free">FREE</option>
                            <option value="starter">STARTER</option>
                            <option value="standard">STANDARD</option>
                            <option value="complete">COMPLETE</option>
                            <option value="faculty">FACULTY</option>
                          </select>
                        </td>

                        <td className="p-3 font-black text-slate-900 text-sm">{student.credits}</td>

                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleAdjustCredits(student.id, 5)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                              title="Add 5 Credits"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => handleAdjustCredits(student.id, 15)}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                              title="Add 15 Credits"
                            >
                              +15
                            </button>
                            <button
                              onClick={() => handleAdjustCredits(student.id, -5)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                              title="Deduct 5 Credits"
                            >
                              -5
                            </button>
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(student.id, student.fullName)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: PAYSTACK AUDIT */}
          {activeTab === 'transactions' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Paystack & Stripe Transaction Ledger</h3>
                  <p className="text-xs text-slate-500">
                    Real-time payment audit log with settlement status across African cards, bank transfers, USSD, and OPay.
                  </p>
                </div>

                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search reference or email..."
                    value={txSearch}
                    onChange={e => setTxSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Customer / Student</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3">Tier Plan</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3 font-mono font-bold text-blue-600">{tx.reference}</td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{tx.userFullName || 'Scholar'}</p>
                          <p className="text-[10px] text-slate-400">{tx.userEmail || tx.userId}</p>
                        </td>
                        <td className="p-3 font-black text-slate-900">₦{tx.amount.toLocaleString()}</td>
                        <td className="p-3 text-slate-600 uppercase text-[10px] font-bold">{tx.channel || 'card'}</td>
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

          {/* TAB 7: DEVELOPER API KEYS GOVERNOR */}
          {activeTab === 'developers' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Third-Party Developer API Keys</h3>
                  <p className="text-xs text-slate-500">
                    Inspect external academic software developers and campus IT departments consuming CodeThesis APIs.
                  </p>
                </div>

                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search key, user or campus..."
                    value={developerKeySearch}
                    onChange={e => setDeveloperKeySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Key Name</th>
                      <th className="p-3">Account Owner</th>
                      <th className="p-3">Masked Key</th>
                      <th className="p-3">Tier</th>
                      <th className="p-3">Rate Limit</th>
                      <th className="p-3">Domains</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Governor Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDevKeys.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400">
                          No developer API keys created yet.
                        </td>
                      </tr>
                    ) : (
                      filteredDevKeys.map(k => (
                        <tr key={k.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{k.name}</td>
                          <td className="p-3">
                            <p className="font-medium text-slate-800">{k.userFullName || 'Developer'}</p>
                            <p className="text-[10px] text-slate-400">{k.userEmail}</p>
                          </td>
                          <td className="p-3 font-mono text-slate-600">{k.maskedKey}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                k.isInstitutional
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {k.isInstitutional ? 'Institutional' : 'Standard'}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">{k.rateLimitPerMin} req/min</td>
                          <td className="p-3 font-mono text-[10px] text-slate-500">{k.allowedDomains || '*'}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                k.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {k.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleToggleDevKey(k.id, k.status)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                k.status === 'active'
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {k.status === 'active' ? 'Revoke Key' : 'Reactivate Key'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: SECURITY AUDIT TRAIL */}
          {activeTab === 'security' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Security & Authentication Audit Trail</h3>
                  <p className="text-xs text-slate-500">
                    Immutable security log tracking logins, failed attempts, and password reset activities.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {['all', 'signin_success', 'signin_failed', 'password_reset_success'].map(filterKey => (
                    <button
                      key={filterKey}
                      onClick={() => setAuditLogFilter(filterKey)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                        auditLogFilter === filterKey
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {filterKey.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">User Email</th>
                      <th className="p-3">Security Action</th>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Device / Browser</th>
                      <th className="p-3">Details / Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No audit logs matching this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredAuditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 text-[11px] text-slate-500 font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="p-3 font-bold text-slate-900">{log.email}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.action === 'signin_success'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : log.action === 'signin_failed'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-600">{log.ip || '127.0.0.1'}</td>
                          <td className="p-3 text-[10.5px] text-slate-500 max-w-xs truncate" title={log.userAgent}>
                            {log.userAgent || 'Chrome / macOS / Windows'}
                          </td>
                          <td className="p-3 text-[10.5px] text-slate-400">
                            {log.metadata ? JSON.stringify(log.metadata) : 'Standard flow'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: PLATFORM STATUS & KILLSWITCH */}
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

        {/* ISSUE NEW LICENSE MODAL */}
        {showCreateLicenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowCreateLicenseModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1.5 mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-bold">
                  <Building className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Institutional Licensing Generator</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Issue New Departmental Site License
                </h3>
                <p className="text-xs text-slate-500">
                  Provision an official license code for a university department. Scholars can redeem this key to unlock faculty features.
                </p>
              </div>

              <form onSubmit={handleCreateLicense} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Institution / University *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Federal University of Technology, Akure"
                      value={newLicenseForm.institutionName}
                      onChange={e => setNewLicenseForm(prev => ({ ...prev, institutionName: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Department Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Department of Computer Science"
                      value={newLicenseForm.departmentName}
                      onChange={e => setNewLicenseForm(prev => ({ ...prev, departmentName: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Coordinator / HOD Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prof. B. O. Akindele"
                      value={newLicenseForm.coordinatorName}
                      onChange={e => setNewLicenseForm(prev => ({ ...prev, coordinatorName: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Coordinator Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. hod.csc@futa.edu.ng"
                      value={newLicenseForm.coordinatorEmail}
                      onChange={e => setNewLicenseForm(prev => ({ ...prev, coordinatorEmail: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Plan Tier</label>
                    <select
                      value={newLicenseForm.planTier}
                      onChange={e => setNewLicenseForm(prev => ({ ...prev, planTier: e.target.value as any }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none"
                    >
                      <option value="departmental">Departmental Site</option>
                      <option value="faculty">Faculty Wide</option>
                      <option value="campus_wide">Campus Wide</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Student Seats</label>
                    <input
                      type="number"
                      min="10"
                      max="5000"
                      value={newLicenseForm.totalSeats}
                      onChange={e => setNewLicenseForm(prev => ({ ...prev, totalSeats: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Credits / Student</label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={newLicenseForm.creditsPerStudent}
                      onChange={e => setNewLicenseForm(prev => ({ ...prev, creditsPerStudent: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Academic Session</label>
                    <input
                      type="text"
                      value={newLicenseForm.academicSession}
                      onChange={e => setNewLicenseForm(prev => ({ ...prev, academicSession: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Expiration Date</label>
                    <input
                      type="date"
                      value={newLicenseForm.expiresAt}
                      onChange={e => setNewLicenseForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateLicenseModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                  >
                    Generate & Issue License Code
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
