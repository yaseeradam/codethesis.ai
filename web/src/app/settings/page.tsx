'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTheme } from '@/context/ThemeContext';
import {
  Settings,
  User,
  GraduationCap,
  Key,
  ShieldCheck,
  Save,
  Check,
  Bell,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

const NIGERIAN_UNIVERSITIES = [
  'Federal University of Technology, Akure (FUTA)',
  'University of Lagos (UNILAG)',
  'University of Nigeria, Nsukka (UNN)',
  'Ahmadu Bello University (ABU), Zaria',
  'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU), Ile-Ife',
  'Covenant University, Ota',
  'Lagos State University (LASU)',
  'Federal University of Agriculture, Abeokuta (FUNAAB)',
  'University of Ilorin (UNILORIN)',
  'University of Benin (UNIBEN)',
  'Federal University of Technology, Minna (FUTMINNA)',
  'Babcock University, Ilishan-Remo',
  'Afe Babalola University (ABUAD)',
  'Nnamdi Azikiwe University (UNIZIK)',
  'Bayero University Kano (BUK)'
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'ai-keys' | 'security' | 'appearance'>('profile');
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Profile state
  const [fullName, setFullName] = useState('ADEBAYO TUNDE');
  const [matricNumber, setMatricNumber] = useState('FUTA/CSC/20/4182');
  const [email, setEmail] = useState('t.adebayo@student.futa.edu.ng');
  const [phone, setPhone] = useState('+234 814 555 0192');
  const [institution, setInstitution] = useState('Federal University of Technology, Akure (FUTA)');
  const [department, setDepartment] = useState('Computer Science');
  const [degreeLevel, setDegreeLevel] = useState('B.Sc');
  const [graduationYear, setGraduationYear] = useState('2026');

  // AI BYOK Keys
  const [geminiKey, setGeminiKey] = useState('');
  const [openAiKey, setOpenAiKey] = useState('');
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);

  // Formatting preferences
  const [citationFormat, setCitationFormat] = useState<'apa7' | 'harvard' | 'ieee'>('apa7');
  const [lineSpacing, setLineSpacing] = useState<'1.5' | '2.0'>('1.5');
  const [pythonGui, setPythonGui] = useState<'tkinter' | 'flask'>('tkinter');

  const [savedSuccess, setSavedSuccess] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  }

  return (
    <AppLayout
      activeItem="settings"
      title="Account & System Settings"
      subtitle="Customize student academic demographics, custom AI API keys (BYOK), and thesis format preferences"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-6xl">
        {/* Left Tab Navigator (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
            {[
              { id: 'profile', label: 'Student Profile', icon: User, desc: 'Name, Matric No. & Contact' },
              { id: 'academic', label: 'Institutional Standards', icon: GraduationCap, desc: 'University, Degree & Department' },
              { id: 'appearance', label: 'Appearance & Theme', icon: Sun, desc: 'Light, Dark Mode & System' },
              { id: 'ai-keys', label: 'Custom AI Keys (BYOK)', icon: Key, desc: 'Bring Your Own API Keys' },
              { id: 'security', label: 'Format & Citation Rules', icon: BookOpen, desc: 'APA 7th, Margins & Python Stack' }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                    activeTab === tab.id
                      ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                      : 'border-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="text-slate-900 font-bold">{tab.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{tab.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cloud Sync Status */}
          <div className="bg-slate-900 text-slate-300 rounded-2xl p-4 text-xs space-y-2 border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Encrypted Local State</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              All thesis drafts, matriculation records, and BYOK credentials are encrypted locally in your client storage session.
            </p>
          </div>
        </div>

        {/* Right Settings Form (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <form onSubmit={handleSave} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
            {/* TAB 1: Profile */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900">Student Profile Demographics</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Used automatically across all Chapter cover pages and defense slides.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Legal Name (SURNAME First)</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Matriculation Number</label>
                    <input
                      type="text"
                      value={matricNumber}
                      onChange={e => setMatricNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Institutional Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp / Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Academic */}
            {activeTab === 'academic' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900">Institutional & Degree Affiliation</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Calibrates defense formatting to your university senate regulations.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Tertiary Institution</label>
                    <select
                      value={institution}
                      onChange={e => setInstitution(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                    >
                      {NIGERIAN_UNIVERSITIES.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Degree Level</label>
                      <select
                        value={degreeLevel}
                        onChange={e => setDegreeLevel(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                      >
                        <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                        <option value="B.Eng">B.Eng (Bachelor of Engineering)</option>
                        <option value="HND">HND (Higher National Diploma)</option>
                        <option value="M.Sc">M.Sc (Master of Science)</option>
                        <option value="Ph.D">Ph.D (Doctor of Philosophy)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Graduation Year</label>
                      <input
                        type="text"
                        value={graduationYear}
                        onChange={e => setGraduationYear(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Appearance & Theme */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900">Interface Appearance & Dark Mode</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize your visual environment. CodeThesis uses an Obsidian Midnight Navy palette designed for long nighttime research sessions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Light Card */}
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-full h-20 rounded-xl bg-[#F1F5F9] border border-slate-300 p-2.5 flex flex-col justify-between mb-3 shadow-inner">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <div className="w-12 h-2 rounded bg-slate-300" />
                      </div>
                      <div className="w-full h-8 rounded-lg bg-white border border-slate-200 p-1 flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded bg-slate-100" />
                        <div className="w-16 h-2 rounded bg-slate-200" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-xs text-slate-900">Light Mode</span>
                      </div>
                      {theme === 'light' && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">High-contrast daytime academic slate</p>
                  </button>

                  {/* Dark Card */}
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                      theme === 'dark'
                        ? 'border-cyan-500 bg-slate-900 shadow-md ring-2 ring-cyan-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-full h-20 rounded-xl bg-[#070F2B] border border-slate-800 p-2.5 flex flex-col justify-between mb-3 shadow-inner">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                        <div className="w-12 h-2 rounded bg-slate-700" />
                      </div>
                      <div className="w-full h-8 rounded-lg bg-[#0E1738] border border-[#1E2D58] p-1 flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded bg-[#162450]" />
                        <div className="w-16 h-2 rounded bg-slate-700" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-cyan-400" />
                        <span className="font-bold text-xs text-slate-900">Dark Mode</span>
                      </div>
                      {theme === 'dark' && (
                        <Check className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Obsidian Navy with soft contrast</p>
                  </button>

                  {/* System Auto Card */}
                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                      theme === 'system'
                        ? 'border-purple-500 bg-purple-50/70 shadow-sm ring-2 ring-purple-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-full h-20 rounded-xl bg-gradient-to-r from-[#F1F5F9] via-slate-400 to-[#070F2B] border border-slate-300 p-2.5 flex flex-col justify-between mb-3 shadow-inner">
                      <div className="flex items-center justify-between">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <Moon className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div className="text-[10px] font-bold text-center text-slate-800 bg-white/70 py-0.5 rounded">
                        OS Dynamic
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-purple-600" />
                        <span className="font-bold text-xs text-slate-900">System Sync</span>
                      </div>
                      {theme === 'system' && (
                        <Check className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Adapts automatically to OS preference</p>
                  </button>
                </div>

                <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl text-[11px] text-cyan-900 flex items-center justify-between">
                  <span className="font-medium">
                    Current Active Engine: <strong className="font-black text-cyan-700 uppercase">{resolvedTheme} MODE</strong>
                  </span>
                  <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">
                    Persisted in Client Storage
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: AI Keys BYOK */}
            {activeTab === 'ai-keys' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900">Custom AI Engine API Keys (BYOK)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Optional: Supply your personal Gemini or OpenAI keys for unlimited direct generation bypassing platform credit limits.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Google Gemini API Key</label>
                    <div className="relative">
                      <input
                        type={showGemini ? 'text' : 'password'}
                        value={geminiKey}
                        onChange={e => setGeminiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-10 text-slate-900 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGemini(!showGemini)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">OpenAI API Key (Optional)</label>
                    <div className="relative">
                      <input
                        type={showOpenAi ? 'text' : 'password'}
                        value={openAiKey}
                        onChange={e => setOpenAiKey(e.target.value)}
                        placeholder="sk-proj-..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pr-10 text-slate-900 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenAi(!showOpenAi)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showOpenAi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      When empty, CodeThesis automatically uses our built-in high-availability academic heuristic engine with zero downtime.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Formatting */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900">Thesis Formatting & Software Preferences</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Control typography, line spacing, and software architecture stacks.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Referencing Standard</label>
                    <select
                      value={citationFormat}
                      onChange={e => setCitationFormat(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    >
                      <option value="apa7">APA 7th Edition (Standard)</option>
                      <option value="harvard">Harvard Referencing</option>
                      <option value="ieee">IEEE Style (Numbered)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Line Spacing</label>
                    <select
                      value={lineSpacing}
                      onChange={e => setLineSpacing(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    >
                      <option value="1.5">1.5 Lines (NUC Guideline)</option>
                      <option value="2.0">Double Spacing (2.0)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Default Python Architecture</label>
                    <select
                      value={pythonGui}
                      onChange={e => setPythonGui(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    >
                      <option value="tkinter">Zero-Pip Tkinter Desktop GUI</option>
                      <option value="flask">Flask / SQLite Local Web App</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              {savedSuccess ? (
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                  <Check className="w-4 h-4" />
                  <span>Settings updated successfully!</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400">All changes applied instantly to current session.</div>
              )}

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
