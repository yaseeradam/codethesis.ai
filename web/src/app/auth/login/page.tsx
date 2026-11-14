'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  AlertCircle,
  UserCheck
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('from') || '/dashboard';

  const { login, loginDemo, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  async function handleStandardLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const res = await login(email, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid credentials. Please try again.');
      setIsSubmitting(false);
      return;
    }

    router.push(returnTo);
  }

  async function handleQuickDemo(role: 'adebayo' | 'ibrahim' | 'chioma') {
    setActiveDemo(role);
    setErrorMessage('');

    const res = await loginDemo(role);
    if (!res.success) {
      setErrorMessage(res.error || 'Demo login failed. Please try again.');
      setActiveDemo(null);
      return;
    }

    router.push(returnTo);
  }

  return (
    <div className="min-h-screen bg-[#070F2B] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl relative z-10">
        {/* Left Side: Brand & Visuals (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0c1844] to-[#070F2B] p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/40 shadow-md">
                <Image
                  src="/assets/logo_codethesis_3d.jpg"
                  alt="CodeThesis 3D Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white text-lg tracking-tight">CodeThesis</span>
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-cyan-300/80 uppercase font-semibold">
                  Build • Document • Defend
                </p>
              </div>
            </div>

            {/* Value Points */}
            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Target ~18,000+ words 5-Chapter dissertation drafts</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Zero-pip Python & SQLite software repo generation</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Vector UML Diagrams & 15-Slide defense presentations</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Speech-to-Text Mock External Examiner Viva Simulator</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Tag */}
          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Trusted across FUTA, UNILAG, UNN, ABU, UI & Covenant</span>
          </div>
        </div>

        {/* Right Side: Login Form & Instant Demo Bypass (7 Cols) */}
        <div className="lg:col-span-7 p-8 flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Sign in to CodeThesis AI
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Authenticate with your institutional account or select a student demo profile.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1-CLICK INSTANT DEMO STUDENT PROFILES */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              <span>Instant Demo Profiles (1-Click)</span>
              <span className="text-cyan-400 font-bold">No Password Needed</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('adebayo')}
                disabled={Boolean(activeDemo) || isSubmitting}
                className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                  activeDemo === 'adebayo'
                    ? 'border-cyan-400 bg-cyan-500/20 text-white'
                    : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate">Adebayo</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  <span>FUTA • 15cr</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('ibrahim')}
                disabled={Boolean(activeDemo) || isSubmitting}
                className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                  activeDemo === 'ibrahim'
                    ? 'border-amber-400 bg-amber-500/20 text-white'
                    : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate">Ibrahim</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  <span>FUTA • 40cr</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('chioma')}
                disabled={Boolean(activeDemo) || isSubmitting}
                className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                  activeDemo === 'chioma'
                    ? 'border-emerald-400 bg-emerald-500/20 text-white'
                    : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">Chioma</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  <span>UNILAG • 8cr</span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600 text-xs">
            <div className="flex-1 h-px bg-slate-800" />
            <span>or sign in with password</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Standard Form */}
          <form onSubmit={handleStandardLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@futa.edu.ng"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Demo password for pre-seeded accounts is: password123')}
                  className="text-cyan-400 hover:underline text-[11px]"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || Boolean(activeDemo)}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In with Password'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Footer note */}
          <div className="text-center text-[11px] text-slate-500">
            Don't have an account yet?{' '}
            <Link href="/auth/register" className="text-cyan-400 font-bold hover:underline">
              Register with 15 Free Credits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070F2B] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
