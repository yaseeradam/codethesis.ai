'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signInWithGoogle } from '@/lib/firebase';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('from') || '/dashboard';

  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

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

  async function handleGoogleLogin() {
    setIsGoogleSubmitting(true);
    setErrorMessage('');

    try {
      const googleRes = await signInWithGoogle();
      if (!googleRes.success || !googleRes.user) {
        setErrorMessage(googleRes.error || 'Google sign-in was cancelled.');
        return;
      }

      const syncRes = await loginWithGoogle(googleRes.user);
      if (!syncRes.success) {
        setErrorMessage(syncRes.error || 'Failed to initialize session with Google.');
        return;
      }

      router.push(returnTo);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during Google sign in.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Subtle Academic Ambient Accents */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card with Refined 1px Border and Soft Shadow */}
      <div className="w-full max-w-4xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/60 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Brand Showcase (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 via-sky-50/40 to-blue-50/30 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 relative">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-sky-300 shadow-sm flex-shrink-0">
                <Image
                  src="/assets/logo_codethesis_3d.jpg"
                  alt="CodeThesis 3D Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-950 text-xl tracking-tight">CodeThesis</span>
                  <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-sky-700 font-bold uppercase tracking-wider">
                  Build • Document • Defend
                </p>
              </div>
            </div>

            {/* Tagline */}
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-snug">
                The All-in-One Academic AI Engineering Platform
              </h1>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Engineered for Nigerian university academic standards, final year thesis research, and defense readiness.
              </p>
            </div>

            {/* Academic Value Points */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>~18,000+ words 5-Chapter APA 7th thesis drafts</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Zero-pip Turnkey Python/SQLite software repositories</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Vector UML Architecture & 15-Slide defense decks</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Mock External Examiner Viva Voice Simulator with grading</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="pt-6 border-t border-slate-200/80 mt-6 text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">Trusted across FUTA, UNILAG, UNN, ABU, UI & Covenant</span>
          </div>
        </div>

        {/* Right Side: Authentication Panel (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-5 bg-white">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign in to CodeThesis AI
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Authenticate via Google or your institutional student email.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. FIREBASE GOOGLE SIGN-IN BUTTON */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleSubmitting || isSubmitting}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-semibold rounded-xl shadow-xs hover:shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              {isGoogleSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                  <span className="text-xs font-medium">Connecting with Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-semibold">Continue with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="uppercase text-[10px] tracking-wider text-slate-400 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* 2. STANDARD CREDENTIALS FORM */}
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Institutional Email
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 group-hover:text-slate-600 transition-colors pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@futa.edu.ng"
                  required
                  className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-normal outline-none transition-all shadow-xs focus:ring-4 focus:ring-sky-500/10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sky-600 hover:text-sky-700 hover:underline text-[11px] font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 group-hover:text-slate-600 transition-colors pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-normal outline-none transition-all shadow-xs focus:ring-4 focus:ring-sky-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:text-sky-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/30 active:scale-[0.99] cursor-pointer disabled:opacity-60 text-xs sm:text-sm"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In with Password'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer note */}
          <div className="text-center text-xs text-slate-500 pt-1">
            Don't have an account yet?{' '}
            <Link href="/auth/register" className="text-sky-600 font-bold hover:underline">
              Register with 15 Free Credits &rarr;
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
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
