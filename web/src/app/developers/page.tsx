'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Terminal,
  Activity,
  Zap,
  Code2,
  FileCode,
  ShieldCheck,
  Clock,
  Coins,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  BookOpen
} from 'lucide-react';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  maskedKey: string;
  rateLimitPerMin: number;
  status: 'active' | 'revoked';
  lastUsedAt?: string;
  createdAt: string;
}

interface ApiUsageStats {
  totalRequests: number;
  totalCreditsCharged: number;
  avgLatencyMs: number;
  successRate: number;
}

interface ApiUsageLogItem {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  creditsDeducted: number;
  responseTimeMs: number;
  createdAt: string;
}

export default function DeveloperPortalPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [stats, setStats] = useState<ApiUsageStats>({
    totalRequests: 0,
    totalCreditsCharged: 0,
    avgLatencyMs: 0,
    successRate: 100,
  });
  const [logs, setLogs] = useState<ApiUsageLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'docs' | 'logs'>('overview');
  const [activeSnippetLang, setActiveSnippetLang] = useState<'curl' | 'python' | 'javascript'>('curl');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isTestKey, setIsTestKey] = useState(false);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);

  // Copy tracking
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [keysRes, usageRes] = await Promise.all([
        fetch('/api/developer/keys'),
        fetch('/api/developer/usage'),
      ]);

      if (keysRes.ok) {
        const keysData = await keysRes.json();
        if (keysData.success) setKeys(keysData.keys || []);
      }

      if (usageRes.ok) {
        const usageData = await usageRes.json();
        if (usageData.success) {
          setStats(usageData.stats || { totalRequests: 0, totalCreditsCharged: 0, avgLatencyMs: 0, successRate: 100 });
          setLogs(usageData.logs || []);
        }
      }
    } catch (err) {
      console.error('Failed to load developer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setIsCreatingKey(true);
    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          isTest: isTestKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.rawKey) {
        setCreatedRawKey(data.rawKey);
        setNewKeyName('');
        fetchData();
        setSuccessBanner('New API key generated successfully!');
      }
    } catch (err) {
      console.error('Error generating key:', err);
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Applications using this key will immediately lose access.')) {
      return;
    }

    try {
      const res = await fetch(`/api/developer/keys?id=${keyId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setKeys(prev => prev.map(k => (k.id === keyId ? { ...k, status: 'revoked' } : k)));
        setSuccessBanner('API key revoked successfully.');
        setTimeout(() => setSuccessBanner(null), 4000);
      }
    } catch (err) {
      console.error('Failed to revoke key:', err);
    }
  };

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    if (identifier === 'snippet') {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } else {
      setCopiedKey(identifier);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const sampleKey = keys.find(k => k.status === 'active')?.maskedKey || 'ct_live_your_api_key_here';

  const snippets = {
    curl: `curl -X POST https://codethesis.ai/api/v1/thesis/chapter \\
  -H "Authorization: Bearer ${sampleKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "Design and Implementation of an Automated Hostel Allocation System",
    "chapter_number": 1,
    "department": "Computer Science",
    "institution": "Federal University of Technology, Akure"
  }'`,
    python: `import requests

url = "https://codethesis.ai/api/v1/thesis/chapter"
headers = {
    "Authorization": "Bearer ${sampleKey}",
    "Content-Type": "application/json"
}
payload = {
    "topic": "Design and Implementation of an Automated Hostel Allocation System",
    "chapter_number": 1,
    "department": "Computer Science",
    "institution": "Federal University of Technology, Akure"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()
print("Synthesized Chapter Content:")
print(data.get("content"))`,
    javascript: `const res = await fetch("https://codethesis.ai/api/v1/thesis/chapter", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${sampleKey}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    topic: "Design and Implementation of an Automated Hostel Allocation System",
    chapter_number: 1,
    department: "Computer Science",
    institution: "Federal University of Technology, Akure"
  })
});

const data = await res.json();
console.log(data.content);`,
  };

  return (
    <AppLayout
      activeItem="developers"
      title="Developer Platform & Public API"
      subtitle="Build custom university applications, defense bots, and coursework engines powered by CodeThesis AI APIs"
    >
      {/* Top Banner */}
      {successBanner && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-500 hover:text-emerald-700 text-xs">
            &times;
          </button>
        </div>
      )}

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total API Requests</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalRequests.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Across all registered keys</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Credits Consumed</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.totalCreditsCharged}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">1 Credit / generation call</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average Latency</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.avgLatencyMs} ms</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">High availability cluster</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">API Success Rate</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.successRate}%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">SLA 99.9% uptime target</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Hub */}
      <div className="flex items-center gap-2 mb-6 bg-slate-200/80 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Quickstart & Keys
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'docs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          API Reference
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'logs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Request Logs
        </button>
      </div>

      {/* Tab 1: Overview & API Keys */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* API Keys Table Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-sky-600" />
                  <span>Secret API Keys</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authenticate your requests by passing keys in the <code>Authorization: Bearer &lt;key&gt;</code> header.
                </p>
              </div>
              <button
                onClick={() => {
                  setCreatedRawKey(null);
                  setShowCreateModal(true);
                }}
                className="bg-gradient-to-r from-sky-600 to-cyan-600 hover:brightness-105 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Secret Key</span>
              </button>
            </div>

            {keys.length === 0 ? (
              <div className="py-12 text-center">
                <Key className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No API Keys Generated Yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                  Generate a secret key to authenticate your server-side scripts, campus bots, and applications.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Token Prefix</th>
                      <th className="py-2.5 px-3">Key Token</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Last Used</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {keys.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">{k.name}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              k.keyPrefix === 'ct_test_'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {k.keyPrefix === 'ct_test_' ? 'TEST MODE' : 'LIVE PRODUCTION'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">{k.maskedKey}</td>
                        <td className="py-3 px-3">
                          {k.status === 'active' ? (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-semibold">Revoked</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {k.status === 'active' && (
                            <button
                              onClick={() => handleRevokeKey(k.id)}
                              className="text-rose-500 hover:text-rose-700 font-medium text-[11px] cursor-pointer hover:underline"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quickstart Code Example Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  <span>Integration Quickstart</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Make your first authenticated API call to generate an NUC-compliant thesis chapter.
                </p>
              </div>

              {/* Language Selector */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setActiveSnippetLang('curl')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeSnippetLang === 'curl' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveSnippetLang('python')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeSnippetLang === 'python' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => setActiveSnippetLang('javascript')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activeSnippetLang === 'javascript' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Node.js
                </button>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 p-4">
              <button
                onClick={() => copyToClipboard(snippets[activeSnippetLang], 'snippet')}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
              </button>
              <pre className="overflow-x-auto pr-16">{snippets[activeSnippetLang]}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive API Reference */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">CodeThesis Public API v1 Reference</h3>
              <p className="text-xs text-slate-500 mt-1">
                Base URL: <code>https://codethesis.ai/api/v1</code> • All endpoints return JSON and accept Bearer token authentication.
              </p>
            </div>

            {/* Endpoints List */}
            <div className="space-y-4">
              {/* Endpoint 1: Thesis Chapter */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-mono font-bold text-[11px]">POST</span>
                  <span className="font-mono text-xs font-bold text-slate-900">/api/v1/thesis/chapter</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Billed: 1 Credit
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Synthesizes complete academic dissertation chapters compliant with Nigerian university guidelines and APA 7th referencing.
                </p>
                <div className="bg-slate-950 rounded-lg p-3 text-[11px] font-mono text-slate-300">
                  <div className="text-slate-500">// Request Payload:</div>
                  <pre>{`{
  "topic": "Automated Student Hostel Allocation System",
  "chapter_number": 1,
  "department": "Computer Science",
  "institution": "Federal University of Technology, Akure",
  "prompt": "Focus on background and problem formulation" // optional
}`}</pre>
                </div>
              </div>

              {/* Endpoint 2: UML Generator */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-purple-600 text-white font-mono font-bold text-[11px]">POST</span>
                  <span className="font-mono text-xs font-bold text-slate-900">/api/v1/uml/generate</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Billed: 1 Credit
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Generates production-grade Mermaid.js syntax for Use Case, Sequence, Class, Activity, and ER diagrams with academic placement notes.
                </p>
                <div className="bg-slate-950 rounded-lg p-3 text-[11px] font-mono text-slate-300">
                  <div className="text-slate-500">// Request Payload:</div>
                  <pre>{`{
  "topic": "Online Course Registration & Result Processing Engine",
  "diagram_type": "sequence", // "usecase" | "sequence" | "class" | "activity" | "er"
  "department": "Software Engineering"
}`}</pre>
                </div>
              </div>

              {/* Endpoint 3: Assignment Solver */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-sky-600 text-white font-mono font-bold text-[11px]">POST</span>
                  <span className="font-mono text-xs font-bold text-slate-900">/api/v1/assignment/solve</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Billed: 1 Credit
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Produces rigorous step-by-step mathematical proofs, complexity analysis, and algorithmic derivations.
                </p>
              </div>

              {/* Endpoint 4: Viva Voce Examiner */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-amber-600 text-white font-mono font-bold text-[11px]">POST</span>
                  <span className="font-mono text-xs font-bold text-slate-900">/api/v1/viva/simulate</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Billed: 1 Credit
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Simulates a rigorous external examiner oral examination turn with rating (1-10), constructive critique, and follow-up probing questions.
                </p>
              </div>

              {/* Endpoint 5: Account Balance */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-mono font-bold text-[11px]">GET</span>
                  <span className="font-mono text-xs font-bold text-slate-900">/api/v1/account/balance</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Free (0 Credits)
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Returns the developer account credit balance, active subscription plan, and rate limit quotas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Request Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Recent API Activity</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit log of all requests executed with your secret keys.
              </p>
            </div>
            <button
              onClick={fetchData}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No Request Logs Recorded Yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Activity will appear here once your application starts calling <code>/api/v1/...</code> endpoints.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Endpoint</th>
                    <th className="py-2.5 px-3">Credits Billed</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            log.statusCode >= 200 && log.statusCode < 300
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.statusCode}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[11px] text-slate-700">{log.method}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{log.endpoint}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{log.creditsDeducted}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{log.responseTimeMs}ms</td>
                      <td className="py-2.5 px-3 text-right text-slate-400 text-[10px]">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create API Key */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/90 space-y-4">
            {!createdRawKey ? (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Key className="w-4 h-4 text-sky-600" />
                    <span>Generate Developer Secret Key</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    &times;
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Campus Mobile Bot / Production Backend"
                    required
                    className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-xs text-slate-800 font-medium outline-none transition-all shadow-xs"
                  />
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <input
                    type="checkbox"
                    id="isTestMode"
                    checked={isTestKey}
                    onChange={(e) => setIsTestKey(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <label htmlFor="isTestMode" className="text-xs text-slate-700 cursor-pointer">
                    <span className="font-bold block">Sandbox Test Mode</span>
                    <span className="text-[11px] text-slate-500 block">Prefixes with <code>ct_test_</code> and bypasses credit deduction for integration testing.</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingKey || !newKeyName.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-xl text-xs font-bold shadow-xs hover:brightness-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isCreatingKey ? 'Generating...' : 'Create Key'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <Check className="w-5 h-5" />
                  <span>Key Generated Successfully!</span>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Important:</strong> Copy your secret API key now. For your security, you will not be able to see this token again!
                  </span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 break-all select-all">
                  {createdRawKey}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => copyToClipboard(createdRawKey, 'created')}
                    className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-sky-700 cursor-pointer"
                  >
                    {copiedKey === 'created' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'created' ? 'Copied to Clipboard' : 'Copy Secret Key'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreatedRawKey(null);
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
