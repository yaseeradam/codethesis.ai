'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CourseSelect from '@/components/ui/CourseSelect';
import InstitutionSelect from '@/components/ui/InstitutionSelect';
import { useAuth } from '@/context/AuthContext';
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
  Lock,
  AlertCircle,
  Building,
  CheckCircle2,
  Award
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
  const { user, updateProfile, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'license' | 'security' | 'formatting' | 'ai-keys' | 'appearance'>('profile');

  // Departmental License Redemption State
  const [licenseCode, setLicenseCode] = useState('');
  const [redeemingLicense, setRedeemingLicense] = useState(false);
  const [licenseMessage, setLicenseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleRedeemLicense(e: React.FormEvent) {
    e.preventDefault();
    if (!licenseCode.trim()) {
      setLicenseMessage({ type: 'error', text: 'Please enter your departmental license code.' });
      return;
    }
    setRedeemingLicense(true);
    setLicenseMessage(null);
    try {
      const res = await fetch('/api/institutional/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: licenseCode.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setLicenseMessage({ type: 'success', text: data.message });
        setLicenseCode('');
        if (refreshUser) refreshUser().catch(() => {});
      } else {
        setLicenseMessage({ type: 'error', text: data.error || 'Failed to redeem license.' });
      }
    } catch (err: any) {
      setLicenseMessage({ type: 'error', text: err.message || 'Error redeeming license.' });
    } finally {
      setRedeemingLicense(false);
    }
  }

  // Profile state initialized with current session user
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [matricNumber, setMatricNumber] = useState(user?.matricNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [degreeLevel, setDegreeLevel] = useState(user?.degreeLevel || 'B.Sc');
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear || '2026');

  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // AI BYOK Keys
  const [geminiKey, setGeminiKey] = useState(user?.preferences?.geminiKey || '');
  const [openAiKey, setOpenAiKey] = useState(user?.preferences?.openAiKey || '');
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);

  // Formatting preferences
  const [citationFormat, setCitationFormat] = useState<'apa7' | 'harvard' | 'ieee'>(user?.preferences?.citationFormat || 'apa7');
  const [lineSpacing, setLineSpacing] = useState<'1.5' | '2.0'>(user?.preferences?.lineSpacing || '1.5');
  const [pythonGui, setPythonGui] = useState<'tkinter' | 'flask'>(user?.preferences?.pythonGui || 'tkinter');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.matricNumber) setMatricNumber(user.matricNumber);
      if (user.email) setEmail(user.email);
      if (user.institution) setInstitution(user.institution);
      if (user.department) setDepartment(user.department);
      if (user.phone) setPhone(user.phone);
      if (user.degreeLevel) setDegreeLevel(user.degreeLevel);
      if (user.graduationYear) setGraduationYear(user.graduationYear);
      if (user.preferences?.citationFormat) setCitationFormat(user.preferences.citationFormat);
      if (user.preferences?.lineSpacing) setLineSpacing(user.preferences.lineSpacing);
      if (user.preferences?.pythonGui) setPythonGui(user.preferences.pythonGui);
      if (user.preferences?.geminiKey !== undefined) setGeminiKey(user.preferences.geminiKey);
      if (user.preferences?.openAiKey !== undefined) setOpenAiKey(user.preferences.openAiKey);
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setIsSaving(true);

    const payload: any = {
      fullName,
      matricNumber,
      institution,
      department,
      phone,
      degreeLevel,
      graduationYear,
      preferences: {
        citationFormat,
        lineSpacing,
        pythonGui,
        geminiKey,
        openAiKey,
      },
    };

    if (newPassword) {
      if (!currentPassword) {
        setPasswordError('Current password is required to change password.');
        setIsSaving(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setPasswordError('New password and confirmation do not match.');
        setIsSaving(false);
        return;
      }
      if (newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters long.');
        setIsSaving(false);
        return;
      }
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    const res = await updateProfile(payload);
    setIsSaving(false);

    if (!res.success) {
      setPasswordError(res.error || 'Failed to update profile settings.');
      return;
    }

    if (refreshUser) {
      await refreshUser();
    }

    setSavedSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSavedSuccess(false), 4000);
  }

  return (
    <AppLayout
      activeItem="settings"
      title="Account & System Settings"
      subtitle="Customize student academic demographics, passwords, custom AI API keys (BYOK), and thesis format preferences"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-6xl">
        {/* Left Tab Navigator (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-1">
            {[
              { id: 'profile', label: 'Student Profile', icon: User, desc: 'Name, Matric No. & Contact' },
              { id: 'academic', label: 'Institutional Standards', icon: GraduationCap, desc: 'University, Degree & Department' },
              { id: 'license', label: 'Departmental License', icon: Building, desc: 'HOD Code & Campus Verification' },
              { id: 'security', label: 'Security & Password', icon: Lock, desc: 'Password & Authentication' },
              { id: 'formatting', label: 'Format & Citation Rules', icon: BookOpen, desc: 'APA 7th, Margins & Python Stack' },
              { id: 'ai-keys', label: 'Custom AI Keys (BYOK)', icon: Key, desc: 'Bring Your Own API Keys' },
              { id: 'appearance', label: 'Appearance & Standards', icon: Sun, desc: 'High-Contrast Academic Slate' }
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
              <span>Encrypted Session Vault</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Active Session: <strong className="text-white">{user?.email || 'student@institution.edu.ng'}</strong>. All profile and thesis metadata are securely persisted.
            </p>
          </div>
        </div>

        {/* Right Settings Form (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <form onSubmit={handleSave} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* TAB 1: Profile */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900">Student Profile Demographics</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Used automatically across all Chapter cover pages and defense slides.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Babatunde Segun"
                      required
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-slate-900 font-medium shadow-xs outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Matriculation Number</label>
                    <input
                      type="text"
                      value={matricNumber}
                      onChange={e => setMatricNumber(e.target.value)}
                      placeholder="e.g. MATRIC/REG/0001"
                      required
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-slate-900 font-medium shadow-xs outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Institutional Email (Read Only)</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-500 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp / Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+234 814 000 0000"
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-slate-900 font-medium shadow-xs outline-none transition-all"
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
                    <InstitutionSelect
                      value={institution}
                      onChange={setInstitution}
                      label="Tertiary Institution"
                      placeholder="Search list or type your university..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <CourseSelect
                      value={department}
                      onChange={setDepartment}
                      label="Department / Course"
                    />

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Degree Level</label>
                      <select
                        value={degreeLevel}
                        onChange={e => setDegreeLevel(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-slate-900 font-medium shadow-xs outline-none transition-all"
                      >
                        <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                        <option value="B.Eng">B.Eng (Bachelor of Engineering)</option>
                        <option value="HND">HND (Higher National Diploma)</option>
                        <option value="M.Sc">M.Sc (Master of Science)</option>
                        <option value="Ph.D">Ph.D (Doctor of Philosophy)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Expected Graduation Year</label>
                      <input
                        type="text"
                        value={graduationYear}
                        onChange={e => setGraduationYear(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-slate-900 font-medium shadow-xs outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Institutional Departmental License */}
            {activeTab === 'license' && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-3 flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <Building className="w-4 h-4 text-cyan-600" />
                      <span>Institutional Departmental License Verification</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify your tertiary department to unlock faculty tier tools, Turnitin pre-screening, and pooled research credits.
                    </p>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    user?.plan === 'faculty'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {user?.plan === 'faculty' ? 'Faculty License Active' : 'Individual Account'}
                  </span>
                </div>

                {/* Active License Badge Banner */}
                {user?.plan === 'faculty' ? (
                  <div className="rounded-2xl p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-500/40 text-white shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Verified Departmental Scholar</span>
                    </div>
                    <h4 className="text-base font-black text-white">
                      {user.department || 'Department of Computer Science'} &bull; {user.institution || 'Accredited Tertiary Institution'}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Your scholar profile is linked to an authorized departmental site license. You have elevated access to the 18,000-word Capstone Studio, Supervisor Logbook sign-offs, and Developer API keys.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-emerald-300 font-medium">
                      <div className="bg-white/5 rounded-lg p-2 border border-white/10 text-center">
                        <span className="block text-slate-400 text-[10px]">Tier</span>
                        <strong className="text-white">Faculty / Campus</strong>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 border border-white/10 text-center">
                        <span className="block text-slate-400 text-[10px]">Turnitin Pre-check</span>
                        <strong className="text-emerald-400">Included (Free)</strong>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 border border-white/10 text-center">
                        <span className="block text-slate-400 text-[10px]">API Rate Limit</span>
                        <strong className="text-cyan-400">300 req/min</strong>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 border border-white/10 text-center">
                        <span className="block text-slate-400 text-[10px]">Credits Remaining</span>
                        <strong className="text-amber-300">{user.credits} pts</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl p-5 bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-900">Have a Departmental License Code?</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          If your department coordinator, HOD, or dean purchased a CodeThesis campus license, enter the license key below to claim your complimentary faculty-tier research credits.
                        </p>
                      </div>
                    </div>

                    {licenseMessage && (
                      <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                        licenseMessage.type === 'success'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border border-rose-200 text-rose-800'
                      }`}>
                        {licenseMessage.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        )}
                        <span className="font-semibold">{licenseMessage.text}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Departmental License Code
                      </label>
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <input
                          type="text"
                          placeholder="e.g. INST-FUTA-CSC-2026-X89K"
                          value={licenseCode}
                          onChange={e => setLicenseCode(e.target.value.toUpperCase())}
                          className="w-full sm:flex-1 bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 uppercase placeholder:normal-case placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        />
                        <button
                          type="button"
                          onClick={handleRedeemLicense}
                          disabled={redeemingLicense}
                          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 flex-shrink-0 disabled:opacity-50 active:scale-95"
                        >
                          <Building className="w-3.5 h-3.5" />
                          <span>{redeemingLicense ? 'Validating...' : 'Activate License'}</span>
                        </button>
                      </div>
                      <p className="text-[10.5px] text-slate-400">
                        License keys are issued per university department by CodeThesis AI Academic Partnerships.
                      </p>
                    </div>
                  </div>
                )}

                {/* HOD & Faculty Quote Guidance Box */}
                <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200/80 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                  <div>
                    <h5 className="text-xs font-bold text-cyan-950">Are you a Lecturer, HOD or SIWES Director?</h5>
                    <p className="text-[11px] text-cyan-800 mt-0.5">
                      Request a departmental site license for your 2025/2026 graduating class or SIWES cohort.
                    </p>
                  </div>
                  <a
                    href="/pricing"
                    className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl text-xs transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    View Institutional Pricing &rarr;
                  </a>
                </div>
              </div>
            )}

            {/* TAB 3: Security & Password */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900">Security & Password Credentials</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Update your student portal password and protect your research assets.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-slate-900 font-medium shadow-xs outline-none transition-all"
                    />
                  </div>

                  <div className="flex items-end pb-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-slate-900 font-medium shadow-xs outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-slate-900 font-medium shadow-xs outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Passwords are hashed using salted SHA-256 before disk storage.</span>
                </div>
              </div>
            )}

            {/* TAB 4: Formatting */}
            {activeTab === 'formatting' && (
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
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-slate-900 shadow-xs outline-none transition-all"
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
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-slate-900 shadow-xs outline-none transition-all"
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
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-slate-900 shadow-xs outline-none transition-all"
                    >
                      <option value="tkinter">Zero-Pip Tkinter Desktop GUI</option>
                      <option value="flask">Flask / SQLite Local Web App</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: AI BYOK Keys */}
            {activeTab === 'ai-keys' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900">Custom AI Engine API Keys (BYOK)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Connect your own Gemini or OpenAI API keys for unmetered high-throughput thesis builds.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Google Gemini API Key (Optional)</label>
                    <div className="relative">
                      <input
                        type={showGemini ? 'text' : 'password'}
                        value={geminiKey}
                        onChange={e => setGeminiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 pr-10 text-slate-900 font-mono shadow-xs outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGemini(!showGemini)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 pr-10 text-slate-900 font-mono shadow-xs outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenAi(!showOpenAi)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
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

            {/* TAB 6: Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900">Interface Theme & Display Standards</h3>
                  <p className="text-xs text-slate-500 mt-0.5">CodeThesis AI is calibrated to standardized Academic Slate (#F1F5F9).</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                      <Sun className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Standard Academic Slate Theme</h4>
                      <p className="text-[11px] text-slate-500">Optimized for dissertation reading, printing, and panel presentation review.</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                    Active & Enforced
                  </span>
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
                disabled={isSaving}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
