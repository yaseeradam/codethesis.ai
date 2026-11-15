'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Check,
  X
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

  // Automatic countdown and redirect on success
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

  // Validation rules
  const hasMinLength = newPassword.length >= 6;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = Boolean(token.trim()) && hasMinLength && passwordsMatch;

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Subtle Academic Ambient Accents */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card with Bold 2px Border */}
      <div className="w-full max-w-xl bg-white border-2 border-slate-300/90 shadow-2xl rounded-3xl overflow-hidden relative z-10 p-6 sm:p-10">
        
        {/* Header / Brand */}
        <div className="flex items-center justify-between pb-6 border-b-2 border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-sky-300 shadow-sm flex-shrink-0">
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

          <Link
            href="/auth/login"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>

        {/* Title Section */}
        <div className="mt-6 mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-bold mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Password Update</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Your New Password
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Set a new secure password for your student research account to access your dissertations, defense simulators, and software repos.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Screen */}
        {isSuccess ? (
          <div className="p-6 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-emerald-950">
                Password Updated Successfully!
              </h2>
              <p className="text-xs text-emerald-800 max-w-sm mx-auto leading-relaxed">
                Your academic credentials have been securely refreshed. You can now authenticate with your new password.
              </p>
            </div>

            <div className="inline-block py-1.5 px-3 bg-white border border-emerald-200 rounded-full text-[11px] text-emerald-900 font-semibold shadow-2xs">
              Redirecting to sign in within <span className="font-extrabold text-emerald-600">{countdown}s</span>...
            </div>

            <div className="pt-2">
              <Link
                href="/auth/login"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <span>Sign In With New Password</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Password Reset Form */
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            {/* Token Input Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-bold text-slate-700">Recovery Token</label>
                {tokenParam ? (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Prefilled from link
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">
                    From your reset link
                  </span>
                )}
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste or enter reset token"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 font-mono text-xs outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* New Password Input */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl pl-10 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 font-medium outline-none transition-all shadow-xs text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl pl-10 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 font-medium outline-none transition-all shadow-xs text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Live Password Validation Indicators */}
            <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-1.5">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Password Requirements
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                {hasMinLength ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className={hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                  At least 6 characters
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                {passwordsMatch ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className={passwordsMatch ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                  Passwords match
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 active:scale-95 cursor-pointer disabled:opacity-60 text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 pt-5 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>

          <Link
            href="/auth/forgot-password"
            className="text-sky-600 hover:underline font-semibold"
          >
            Need a new recovery link? &rarr;
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
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
