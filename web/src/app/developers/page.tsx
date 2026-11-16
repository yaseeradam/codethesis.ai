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
  BookOpen,
  Webhook,
  Building,
  CreditCard,
  FileCheck,
  CheckCircle2,
  Globe,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  maskedKey: string;
  rateLimitPerMin: number;
  status: 'active' | 'revoked';
  isInstitutional?: boolean;
  institutionName?: string;
  allowedDomains?: string;
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

interface WebhookItem {
  id: string;
  url: string;
  secret: string;
  events: string[];
  status: 'active' | 'inactive';
  description?: string;
  lastTriggeredAt?: string;
  createdAt: string;
}

export default function DeveloperPortalPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [stats, setStats] = useState<ApiUsageStats>({
    totalRequests: 0,
    totalCreditsCharged: 0,
    avgLatencyMs: 0,
    successRate: 100,
  });
  const [logs, setLogs] = useState<ApiUsageLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'webhooks' | 'sdk' | 'docs' | 'billing' | 'logs'>('overview');
  const [activeSnippetLang, setActiveSnippetLang] = useState<'curl' | 'python' | 'javascript'>('curl');
  const [activeSdkLang, setActiveSdkLang] = useState<'typescript' | 'python'>('typescript');

  // Key Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isTestKey, setIsTestKey] = useState(false);
  const [isInstitutional, setIsInstitutional] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [allowedDomains, setAllowedDomains] = useState('*');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);

  // Webhook Modal State
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookDesc, setWebhookDesc] = useState('');
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);

  // Buy Credits Modal State
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState<'dev-hacker' | 'dev-growth' | 'dev-startup' | 'dev-enterprise'>('dev-growth');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Copy tracking
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [keysRes, usageRes, webhooksRes] = await Promise.all([
        fetch('/api/developer/keys'),
        fetch('/api/developer/usage'),
        fetch('/api/developer/webhooks'),
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

      if (webhooksRes.ok) {
        const whData = await webhooksRes.json();
        if (whData.webhooks) setWebhooks(whData.webhooks || []);
      }
    } catch (err) {
      console.error('Failed to load developer portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
        setSuccessBanner('Payment successful! Your API credits have been funded.');
        setTimeout(() => setSuccessBanner(null), 6000);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setIsCreatingKey(true);
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          isTest: isTestKey,
          isInstitutional,
          institutionName: isInstitutional ? institutionName.trim() : undefined,
          allowedDomains: isInstitutional ? allowedDomains.trim() : '*',
          rateLimitPerMin: isInstitutional ? 300 : 60,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedRawKey(data.rawKey);
        setKeys((prev) => [data.key, ...prev]);
        setSuccessBanner('New API secret key generated. Ensure you copy it now!');
        setNewKeyName('');
        setIsInstitutional(false);
        setInstitutionName('');
        setAllowedDomains('*');
      } else {
        alert(data.error || 'Failed to generate API key');
      }
    } catch (err) {
      console.error('Key generation error:', err);
      alert('Network error while generating API key');
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Any applications actively using it will immediately receive 401 Unauthorized.')) {
      return;
    }

    try {
      const res = await fetch(`/api/developer/keys?id=${keyId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, status: 'revoked' } : k)));
        setSuccessBanner('API key revoked successfully.');
        setTimeout(() => setSuccessBanner(null), 4000);
      }
    } catch (err) {
      console.error('Failed to revoke key:', err);
    }
  };

  const handleRegisterWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;

    try {
      setIsCreatingWebhook(true);
      const res = await fetch('/api/developer/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl.trim(),
          description: webhookDesc.trim(),
          events: ['*'],
        }),
      });

      const data = await res.json();
      if (res.ok && data.webhook) {
        setWebhooks((prev) => [data.webhook, ...prev]);
        setShowWebhookModal(false);
        setWebhookUrl('');
        setWebhookDesc('');
        setSuccessBanner('Webhook endpoint registered successfully.');
        setTimeout(() => setSuccessBanner(null), 4000);
      } else {
        alert(data.error || 'Failed to register webhook');
      }
    } catch (err) {
      console.error('Webhook error:', err);
      alert('Network error registering webhook');
    } finally {
      setIsCreatingWebhook(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Delete this webhook endpoint? No further event dispatches will be delivered to this URL.')) {
      return;
    }

    try {
      const res = await fetch(`/api/developer/webhooks?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setWebhooks((prev) => prev.filter((w) => w.id !== id));
        setSuccessBanner('Webhook endpoint deleted.');
        setTimeout(() => setSuccessBanner(null), 3000);
      }
    } catch (err) {
      console.error('Failed to delete webhook:', err);
    }
  };

  const handleBuyCredits = async () => {
    try {
      setIsProcessingPayment(true);
      const res = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPack,
          callbackUrl: `${window.location.origin}/developers?payment=success`,
        }),
      });

      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else if (data.fallbackUrl) {
        window.location.href = data.fallbackUrl;
      } else {
        alert(data.error || 'Payment gateway initialization failed');
      }
    } catch (err) {
      console.error('Credit purchase error:', err);
      alert('Error connecting to payment provider');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const copyToClipboard = (text: string, identifier: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text).catch(() => {});
    if (identifier === 'snippet' || identifier === 'sdk-snippet') {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } else {
      setCopiedKey(identifier);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const sampleKey = keys.find((k) => k.status === 'active')?.maskedKey || 'ct_live_your_api_key_here';

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

  const sdkSnippets = {
    typescript: `// Install: npm install codethesis
import { CodeThesis } from 'codethesis';

const ct = new CodeThesis({
  apiKey: process.env.CODETHESIS_API_KEY || '${sampleKey}'
});

// 1. Generate Academic UML Diagram
const diagram = await ct.uml.generate({
  topic: 'Student Hostel Room Clearance System',
  diagramType: 'sequence',
  department: 'Computer Science'
});
console.log(diagram.mermaid_code);

// 2. Check Thesis Similarity & Plagiarism Risk
const audit = await ct.thesis.checkSimilarity({
  text: 'The primary architecture adopts an asynchronous event loop with ACID row locking...',
  topic: 'Hostel System'
});
console.log(\`Similarity: \${audit.similarity_score}% - Verdict: \${audit.verdict}\`);

// 3. Initiate Long-Running Chapter Generation via Webhook/Job
const job = await ct.jobs.createThesisJob({
  topic: 'Autonomous Cloud Robotics',
  chapterNumber: 3,
  webhookUrl: 'https://my-server.edu.ng/webhooks/thesis'
});
console.log(\`Job dispatched: \${job.job_id}\`);`,
    python: `# Install: pip install codethesis
from codethesis import CodeThesis

ct = CodeThesis(api_key="${sampleKey}")

# 1. Check Developer Account Balance
account = ct.get_balance()
print(f"Credits Remaining: {account['credits']}")

# 2. Solve Engineering & Math Coursework Proof
solution = ct.assignment.solve(
    problem="Normalize relation R(A, B, C, D) with FDs A->B and B->C into 3NF.",
    department="Computer Science"
)
print("Proof Step 1:", solution["steps"][0]["explanation"])

# 3. Simulate Oral Viva Defense Turn
viva = ct.viva.simulate(
    topic="Distributed Consensus in Blockchain",
    student_answer="We adopted Raft consensus to guarantee linearizable leader election."
)
print(f"Examiner Rating: {viva['rating']}/10")
print(f"Next Examiner Question: {viva['next_question']}")`,
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

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 bg-gradient-to-r from-slate-900 to-indigo-950 p-4 sm:p-5 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
              Commercial v1 Release
            </span>
            <span className="text-xs text-slate-300">Metered API Credit Billing</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold mt-1 text-white flex items-center gap-2">
            CodeThesis Developer Platform
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            Integrate university dissertations, UML diagram synthesis, assignment proofs, oral defense simulators, and plagiarism audits directly into your software.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowBuyCreditsModal(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all hover:scale-[1.02]"
          >
            <Coins className="w-4 h-4" />
            Buy API Credits
          </button>
          <button
            onClick={() => {
              setCreatedRawKey(null);
              setShowCreateModal(true);
            }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Create API Key
          </button>
        </div>
      </div>

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
            <p className="text-2xl font-black text-indigo-600 mt-1">{stats.totalCreditsCharged.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Billed per successful call</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average Latency</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {stats.avgLatencyMs > 0 ? `${stats.avgLatencyMs}ms` : '—'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Global edge execution</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Success Rate</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.successRate}%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">HTTP 2xx responses</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Quickstart & Keys
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'webhooks'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Webhook className="w-3.5 h-3.5" />
          Webhooks ({webhooks.length})
        </button>
        <button
          onClick={() => setActiveTab('sdk')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'sdk'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Official SDKs
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'docs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          API Reference
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'billing'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Volume Tiers & Billing
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'logs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Live Request Logs
        </button>
      </div>

      {/* Tab: Overview (Keys & Quickstart) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* API Keys Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Your Developer API Keys</h3>
                <p className="text-xs text-slate-500 mt-0.5">Use live keys in production; test keys operate in sandbox mode.</p>
              </div>
              <button
                onClick={() => {
                  setCreatedRawKey(null);
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Generate Key
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading API keys...</div>
            ) : keys.length === 0 ? (
              <div className="p-8 text-center">
                <Key className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No API keys created yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Generate your first secret key to integrate CodeThesis AI into your application.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Key Name</th>
                      <th className="py-3 px-4">Type & Scope</th>
                      <th className="py-3 px-4">Token Preview</th>
                      <th className="py-3 px-4">Rate Limit</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {keys.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {k.name}
                          {k.isInstitutional && (
                            <span className="block text-[10px] text-indigo-600 font-medium mt-0.5">
                              {k.institutionName || 'Campus Partner'}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {k.isInstitutional ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              Institutional
                            </span>
                          ) : k.keyPrefix === 'ct_test_' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Sandbox Test
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Live Production
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                            <span>{k.maskedKey}</span>
                            <button
                              onClick={() => copyToClipboard(k.maskedKey, k.id)}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy masked token"
                            >
                              {copiedKey === k.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {k.rateLimitPerMin} req/min
                        </td>
                        <td className="py-3.5 px-4">
                          {k.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Revoked
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {new Date(k.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {k.status === 'active' && (
                            <button
                              onClick={() => handleRevokeKey(k.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                              title="Revoke Key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

          {/* Quickstart Integration Code */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quickstart Integration</h3>
              </div>
              <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg text-xs">
                {(['curl', 'python', 'javascript'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveSnippetLang(lang)}
                    className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors ${
                      activeSnippetLang === lang
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'javascript' ? 'Node.js' : lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-slate-950 font-mono text-xs text-slate-300 relative">
              <pre className="overflow-x-auto leading-relaxed scrollbar-thin">
                <code>{snippets[activeSnippetLang]}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(snippets[activeSnippetLang], 'snippet')}
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-sans font-medium transition-colors"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Webhooks */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Configured Webhook Endpoints</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Receive real-time asynchronous HTTP POST notifications when long-running thesis synthesis completes.
                </p>
              </div>
              <button
                onClick={() => setShowWebhookModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Endpoint
              </button>
            </div>

            {webhooks.length === 0 ? (
              <div className="p-8 text-center">
                <Webhook className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No webhooks registered</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Add an HTTPS URL to receive `job.completed` and `job.failed` event dispatches signed with HMAC-SHA256.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {webhooks.map((wh) => (
                  <div key={wh.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{wh.url}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {wh.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{wh.description || 'All event types (*)'}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        <span>Secret: <span className="font-mono text-slate-600">{wh.secret.slice(0, 10)}•••••••</span></span>
                        <span>•</span>
                        <span>Last Triggered: {wh.lastTriggeredAt ? new Date(wh.lastTriggeredAt).toLocaleString() : 'Never'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(wh.secret, wh.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                      >
                        {copiedKey === wh.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        Copy Secret
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(wh.id)}
                        className="text-slate-400 hover:text-rose-600 p-2 rounded-lg transition-colors"
                        title="Delete Webhook"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Official SDKs */}
      {activeTab === 'sdk' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Official CodeThesis Client SDKs</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Production-grade client libraries with full TypeScript types, auto-retry, and polling handlers.
                </p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveSdkLang('typescript')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeSdkLang === 'typescript' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  TypeScript / Node.js
                </button>
                <button
                  onClick={() => setActiveSdkLang('python')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeSdkLang === 'python' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Python (3.8+)
                </button>
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-4 sm:p-5 font-mono text-xs text-slate-300 relative">
              <pre className="overflow-x-auto leading-relaxed scrollbar-thin">
                <code>{sdkSnippets[activeSdkLang]}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(sdkSnippets[activeSdkLang], 'sdk-snippet')}
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-medium transition-colors"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>Copy SDK Code</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: API Docs Reference */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">CodeThesis REST API v1 Reference</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Base URL: <code className="px-2 py-0.5 rounded bg-slate-100 font-mono text-indigo-700">https://codethesis.ai/api/v1</code>.
              Authenticate via header <code className="px-2 py-0.5 rounded bg-slate-100 font-mono text-indigo-700">Authorization: Bearer &lt;key&gt;</code>.
            </p>

            <div className="space-y-4">
              {/* Endpoint 1 */}
              <div className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">GET</span>
                  <code className="text-xs font-mono font-bold text-slate-900">/api/v1/account/balance</code>
                  <span className="ml-auto text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">0 Credits</span>
                </div>
                <p className="text-xs text-slate-600">Retrieve active account credit balance, mode, and rate limits.</p>
              </div>

              {/* Endpoint 2 */}
              <div className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">POST</span>
                  <code className="text-xs font-mono font-bold text-slate-900">/api/v1/thesis/chapter</code>
                  <span className="ml-auto text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">1 Credit</span>
                </div>
                <p className="text-xs text-slate-600">Synthesize NUC benchmark academic chapters with citations.</p>
              </div>

              {/* Endpoint 3 */}
              <div className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">POST</span>
                  <code className="text-xs font-mono font-bold text-slate-900">/api/v1/thesis/similarity-check</code>
                  <span className="ml-auto text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">1 Credit</span>
                </div>
                <p className="text-xs text-slate-600">Turnitin-equivalence plagiarism & similarity analysis against academic repositories.</p>
              </div>

              {/* Endpoint 4 */}
              <div className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">POST</span>
                  <code className="text-xs font-mono font-bold text-slate-900">/api/v1/jobs/thesis</code>
                  <span className="ml-auto text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">1 Credit</span>
                </div>
                <p className="text-xs text-slate-600">Initiate asynchronous background thesis synthesis with optional webhook delivery.</p>
              </div>

              {/* Endpoint 5 */}
              <div className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">GET</span>
                  <code className="text-xs font-mono font-bold text-slate-900">/api/v1/jobs/:id</code>
                  <span className="ml-auto text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">0 Credits</span>
                </div>
                <p className="text-xs text-slate-600">Poll status and retrieve result payload for an asynchronous job.</p>
              </div>

              {/* Endpoint 6 */}
              <div className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">POST</span>
                  <code className="text-xs font-mono font-bold text-slate-900">/api/v1/institution/verify-student</code>
                  <span className="ml-auto text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">Enterprise Key</span>
                </div>
                <p className="text-xs text-slate-600">University campus portal student matric verification & departmental credit allocation.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Volume Tiers & Billing */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="max-w-2xl">
              <h3 className="text-base font-bold text-slate-900">Developer API Volume Tiers</h3>
              <p className="text-xs text-slate-500 mt-1">
                Purchase wholesale API credit packages. Credits never expire and work across all v1 API endpoints.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* Hacker Pack */}
              <div className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-400 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Hacker Pack</span>
                  <p className="text-2xl font-black text-slate-900 mt-3">₦5,000</p>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">100 API Credits</p>
                  <p className="text-[11px] text-slate-400 mt-2">₦50 per call. Ideal for student MVPs and capstone projects.</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPack('dev-hacker');
                    setShowBuyCreditsModal(true);
                  }}
                  className="w-full mt-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Purchase 100 Credits
                </button>
              </div>

              {/* Growth Pack */}
              <div className="border-2 border-indigo-600 rounded-2xl p-5 shadow-sm relative flex flex-col justify-between bg-indigo-50/20">
                <span className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Best Value
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">Growth Pack</span>
                  <p className="text-2xl font-black text-slate-900 mt-3">₦25,000</p>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">750 API Credits</p>
                  <p className="text-[11px] text-slate-500 mt-2">₦33 per call (34% savings). Perfect for student services platforms.</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPack('dev-growth');
                    setShowBuyCreditsModal(true);
                  }}
                  className="w-full mt-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs"
                >
                  Purchase 750 Credits
                </button>
              </div>

              {/* Startup Pack */}
              <div className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-400 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Startup Pack</span>
                  <p className="text-2xl font-black text-slate-900 mt-3">₦80,000</p>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">3,000 API Credits</p>
                  <p className="text-[11px] text-slate-400 mt-2">₦26 per call. Ideal for multi-school edtech applications.</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPack('dev-startup');
                    setShowBuyCreditsModal(true);
                  }}
                  className="w-full mt-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Purchase 3,000 Credits
                </button>
              </div>

              {/* Campus Enterprise */}
              <div className="border border-purple-200 bg-purple-50/30 rounded-2xl p-5 hover:border-purple-400 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">Campus Enterprise</span>
                  <p className="text-2xl font-black text-slate-900 mt-3">₦250,000</p>
                  <p className="text-xs text-purple-700 font-semibold mt-0.5">12,000 API Credits</p>
                  <p className="text-[11px] text-slate-500 mt-2">₦20 per call + 300 req/min rate limit and institutional domain scoping.</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPack('dev-enterprise');
                    setShowBuyCreditsModal(true);
                  }}
                  className="w-full mt-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs"
                >
                  Purchase 12,000 Credits
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent API Request Audit Trail</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time inspection of inbound developer calls and credit debits.</p>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No requests logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Method & Endpoint</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Credits Deducted</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-800">
                        <span className={`mr-2 font-bold ${log.method === 'GET' ? 'text-sky-600' : 'text-indigo-600'}`}>
                          {log.method}
                        </span>
                        {log.endpoint}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.statusCode >= 200 && log.statusCode < 300
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {log.statusCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {log.creditsDeducted > 0 ? `${log.creditsDeducted} credit` : '0 (free)'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {log.responseTimeMs}ms
                      </td>
                      <td className="py-3 px-4 text-slate-400">
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            {createdRawKey ? (
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Your API Secret Key</h3>
                <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  Important: Copy this key now! For security reasons, we do not store the raw key and will never show it again.
                </p>

                <div className="bg-slate-900 p-3 rounded-xl font-mono text-xs text-emerald-400 break-all select-all flex items-center justify-between gap-2">
                  <span>{createdRawKey}</span>
                  <button
                    onClick={() => copyToClipboard(createdRawKey, 'raw-key')}
                    className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                    title="Copy Key"
                  >
                    {copiedKey === 'raw-key' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  I Have Safely Saved My Key
                </button>
              </div>
            ) : (
              <form onSubmit={handleGenerateKey} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Generate Developer API Key</h3>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-lg"
                  >
                    &times;
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Key Name / Client Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Android Mobile App / Department Portal"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Environment Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTestKey(false)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        !isTestKey
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <p className="font-bold">Live Key</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Deducts credits per API call</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTestKey(true)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        isTestKey
                          ? 'border-amber-600 bg-amber-50 text-amber-900'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <p className="font-bold">Test Sandbox</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Free, mock-safe calls</p>
                    </button>
                  </div>
                </div>

                {/* Institutional Toggle */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInstitutional}
                      onChange={(e) => setIsInstitutional(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-800">Campus / Institutional API Key</span>
                  </label>
                  <p className="text-[10px] text-slate-500 mt-1 pl-6">
                    Unlocks student matric verification and 300 req/min rate limit.
                  </p>

                  {isInstitutional && (
                    <div className="mt-3 space-y-2.5 pl-6 border-t border-slate-200 pt-2.5 animate-fadeIn">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">University / College Name</label>
                        <input
                          type="text"
                          required={isInstitutional}
                          placeholder="e.g. FUT Minna / Unilag"
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Allowed Origin Domains</label>
                        <input
                          type="text"
                          placeholder="e.g. *.futminna.edu.ng, localhost"
                          value={allowedDomains}
                          onChange={(e) => setAllowedDomains(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-mono"
                        />
                      </div>
                    </div>
                  )}
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
                    disabled={isCreatingKey}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs disabled:opacity-50"
                  >
                    {isCreatingKey ? 'Generating...' : 'Generate Secret Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Register Webhook */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <form onSubmit={handleRegisterWebhook} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Register Webhook Endpoint</h3>
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg"
                >
                  &times;
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Endpoint URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://your-domain.edu.ng/api/webhooks/codethesis"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Main Backend Thesis Processor"
                  value={webhookDesc}
                  onChange={(e) => setWebhookDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingWebhook}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs disabled:opacity-50"
                >
                  {isCreatingWebhook ? 'Registering...' : 'Register Endpoint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Buy Credits */}
      {showBuyCreditsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Buy API Credits</h3>
                <p className="text-xs text-slate-500 mt-0.5">Choose your package to fund your developer balance</p>
              </div>
              <button
                type="button"
                onClick={() => setShowBuyCreditsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5 mb-5">
              {[
                { id: 'dev-hacker', name: 'Hacker Pack', credits: '100 Credits', price: '₦5,000', note: '₦50/call' },
                { id: 'dev-growth', name: 'Growth Pack', credits: '750 Credits', price: '₦25,000', note: '₦33/call (Best Value)', highlight: true },
                { id: 'dev-startup', name: 'Startup Pack', credits: '3,000 Credits', price: '₦80,000', note: '₦26/call' },
                { id: 'dev-enterprise', name: 'Campus Enterprise', credits: '12,000 Credits', price: '₦250,000', note: '₦20/call + 300 req/min' },
              ].map((pack) => (
                <div
                  key={pack.id}
                  onClick={() => setSelectedPack(pack.id as any)}
                  className={`p-3 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                    selectedPack === pack.id
                      ? 'border-indigo-600 bg-indigo-50/40'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPack === pack.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                      {selectedPack === pack.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{pack.name} — <span className="text-indigo-600 font-extrabold">{pack.credits}</span></p>
                      <p className="text-[10px] text-slate-500">{pack.note}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-slate-900">{pack.price}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBuyCreditsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleBuyCredits}
                disabled={isProcessingPayment}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {isProcessingPayment ? 'Initializing...' : 'Proceed to Checkout (Paystack)'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
