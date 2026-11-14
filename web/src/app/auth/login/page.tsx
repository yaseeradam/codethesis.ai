'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Zap
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  function handleStandardLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/dashboard');
    }, 800);
  }

  function handleInstantDemoLogin() {
    setIsDemoLoading(true);
    setTimeout(() => {
      setIsDemoLoading(false);
      router.push('/dashboard');
    }, 500);
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
              Enter your student credentials or use the 1-click demo bypass.
            </p>
          </div>

          {/* 1-CLICK INSTANT DEMO STUDENT BYPASS */}
          <button
            onClick={handleInstantDemoLogin}
            disabled={isDemoLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{isDemoLoading ? 'Entering Command Center...' : '1-Click Instant Demo Student Bypass'}</span>
          </button>

          <div className="flex items-center gap-3 text-slate-600 text-xs">
            <div className="flex-1 h-px bg-slate-800" />
            <span>or sign in with password</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Standard Form */}
          <form onSubmit={handleStandardLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Institutional Email / Matric No.</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@futa.edu.ng or FUTA/CSC/20/4182"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-300">Password</label>
                <a href="#" className="text-cyan-400 hover:underline text-[11px]">Forgot password?</a>
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
              disabled={isSubmitting}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Sign In with Password'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Footer note */}
          <div className="text-center text-[11px] text-slate-500">
            Don't have an account yet?{' '}
            <Link href="/auth/login" className="text-cyan-400 font-bold hover:underline">
              Register with 15 Free Credits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
