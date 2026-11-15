'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signInWithGoogle } from '@/lib/firebase';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  XCircle,
  ArrowRight
} from 'lucide-react';

function GoogleIcon({ className }: { className?: string }) {
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
  const returnTo = searchParams.get('returnTo') || searchParams.get('from') || '/dashboard';

  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Error and validation state
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState('Verifying credentials...');

  function validateForm() {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setErrorMessage('');

    if (!email.trim()) {
      setEmailError('Please enter your email address');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email format (e.g. name@university.edu.ng)');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password');
      isValid = false;
    }

    return isValid;
  }

  async function handleStandardLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setLoginSuccess(false);
    setLoaderStatus('Verifying credentials with database...');

    try {
      const res = await login(email.trim().toLowerCase(), password);
      if (!res.success) {
        setIsSubmitting(false);
        const serverError = res.error || 'Invalid email address or password. Please verify your details.';
        setErrorMessage(serverError);
        // Highlight inputs if credentials fail
        setEmailError('Check your email address');
        setPasswordError('Check your password');
        return;
      }

      setLoginSuccess(true);
      setLoaderStatus('Authentication successful! Launching workspace...');
      setTimeout(() => {
        window.location.href = returnTo;
      }, 600);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'An unexpected connection error occurred.');
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleSubmitting(true);
    setErrorMessage('');
    setEmailError('');
    setPasswordError('');
    setLoginSuccess(false);
    setLoaderStatus('Connecting with Google authentication...');

    try {
      const googleRes = await signInWithGoogle();
      if (!googleRes.success || !googleRes.user) {
        setErrorMessage(googleRes.error || 'Google sign-in was cancelled.');
        setIsGoogleSubmitting(false);
        return;
      }

      setLoaderStatus('Initializing session...');
      const syncRes = await loginWithGoogle(googleRes.user);
      if (!syncRes.success) {
        setErrorMessage(syncRes.error || 'Failed to initialize session with Google.');
        setIsGoogleSubmitting(false);
        return;
      }

      setLoginSuccess(true);
      setLoaderStatus('Welcome back! Redirecting to workspace...');
      setTimeout(() => {
        window.location.href = returnTo;
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during Google sign in.');
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen relative text-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden">
      {/* Background Image with Cinematic Ambient Tint */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/assets/auth_bg.png"
          alt="CodeThesis Academic Workspace"
          fill
          priority
          className="object-cover object-center scale-105"
        />
        {/* Soft dark vignette & frosted glass atmosphere */}
        <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-slate-950/60" />
      </div>

      {/* Centered Modal Loader at the Middle of the Page */}
      {(isSubmitting || isGoogleSubmitting) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 max-w-sm w-full shadow-2xl border border-white/80 flex flex-col items-center text-center space-y-4 animate-scaleUp">
            {/* Animated Glowing Ring & Icon */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-sky-100 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/30">
                {loginSuccess ? (
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Sparkles className="w-5 h-5 animate-pulse" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {loginSuccess ? 'Authentication Successful!' : 'Signing In...'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {loaderStatus}
              </p>
            </div>

            {/* Progress Bar Animation */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-500 ${
                  loginSuccess ? 'w-full' : 'w-3/4 animate-pulse'
                }`}
              />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secure Session Authorization</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Login Card - Glassmorphism */}
      <div className="w-full max-w-[420px] bg-white/85 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-slate-950/50 rounded-3xl p-6 sm:p-8 relative z-10 space-y-6 ring-1 ring-white/40">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-sky-200 shadow-xs flex-shrink-0">
              <Image
                src="/assets/logo_codethesis_3d.jpg"
                alt="CodeThesis Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-slate-950 text-lg tracking-tight">CodeThesis</span>
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs">
                AI
              </span>
            </div>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-xs text-slate-500 mt-0.5">Sign in to your account to continue</p>
          </div>
        </div>

        {/* High-Visibility Error Alert Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50/95 border-2 border-red-200 text-red-800 text-xs flex items-start gap-2.5 font-medium animate-fadeIn backdrop-blur-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <p className="font-semibold text-red-900">Sign-in Failed</p>
              <p className="text-red-700 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Google 1-Click Sign-In */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full h-11 bg-white/90 hover:bg-white border border-slate-200/90 hover:border-slate-300 text-slate-700 font-medium text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
          >
            <GoogleIcon className="w-4 h-4 flex-shrink-0" />
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Minimal Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300/60" />
          </div>
          <div className="relative bg-white/80 backdrop-blur-xs px-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider rounded-full">
            or
          </div>
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleStandardLogin} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="name@university.edu.ng"
              className={`w-full h-11 bg-white/95 focus:bg-white border ${
                emailError ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10'
              } rounded-xl px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-xs`}
            />
            {emailError && (
              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 animate-fadeIn">
                <XCircle className="w-3 h-3 flex-shrink-0" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-700">Password</label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="••••••••"
                className={`w-full h-11 bg-white/95 focus:bg-white border ${
                  passwordError ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10'
                } rounded-xl pl-3.5 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-xs`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 animate-fadeIn">
                <XCircle className="w-3 h-3 flex-shrink-0" />
                <span>{passwordError}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full h-11 bg-slate-950 hover:bg-slate-900 active:bg-black text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg shadow-slate-950/25 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            <span>Sign in &rarr;</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 pt-1">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="font-semibold text-sky-600 hover:text-sky-700">
            Sign up
          </Link>
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
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
