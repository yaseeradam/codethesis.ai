'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const { confirmPasswordReset } = useAuth();

  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [tokenParam]);

  useEffect(() => {
    if (!isSuccess) return;

    if (countdown <= 0) {
      router.push('/auth/login');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, countdown, router]);

  const hasMinLength = newPassword.length >= 6;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!token.trim()) {
      setErrorMessage('Please provide a valid recovery token.');
      return;
    }

    if (!hasMinLength) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await confirmPasswordReset(token.trim(), newPassword);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to update password. Your recovery token may be invalid or expired.');
      setIsSubmitting(false);
      return;
    }

    setIsSuccess(true);
    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4 sm:p-6 relative font-sans">
      <div className="w-full max-w-[440px] bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 rounded-2xl p-6 sm:p-8 relative z-10 space-y-6">
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
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Set new password</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your token and choose a new password
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success State */}
        {isSuccess ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3 animate-fadeIn">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-950">
                Password updated!
              </h2>
              <p className="text-xs text-emerald-700 mt-1">
                You can now sign in with your new password. Redirecting in {countdown}s...
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/auth/login"
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Sign in now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Recovery token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your reset token"
                required
                className="w-full h-11 bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-mono outline-none transition-all shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">New password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full h-11 bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl pl-3.5 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full h-11 bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl pl-3.5 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Updating password...' : 'Update password'}</span>
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 pt-1">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
