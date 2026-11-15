'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resetResult, setResetResult] = useState<{
    token: string;
    resetUrl: string;
    emailSent?: boolean;
    email?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setResetResult(null);

    const targetEmail = email.trim();
    const res = await requestPasswordReset(targetEmail);

    if (!res.success) {
      setErrorMessage(res.error || 'Unable to generate reset link. Please check your email and try again.');
      setIsSubmitting(false);
      return;
    }

    const token = res.resetToken || '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const resetUrl = res.resetUrl || `${origin}/auth/reset-password?token=${encodeURIComponent(token)}`;

    setResetResult({
      token,
      resetUrl,
      emailSent: res.emailSent,
      email: targetEmail,
    });
    setIsSubmitting(false);
  }

  async function handleCopyLink() {
    if (!resetResult?.resetUrl) return;
    try {
      await navigator.clipboard.writeText(resetResult.resetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
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
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reset your password</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your email and we&apos;ll help you reset your password.
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

        {/* Success Card */}
        {resetResult ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-emerald-900">
                    {resetResult.emailSent ? 'Reset Email Sent!' : 'Reset Link Ready'}
                  </h3>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    {resetResult.emailSent
                      ? `We sent password instructions to ${resetResult.email}. Check your inbox or spam.`
                      : 'You can use the link below to set a new password.'}
                  </p>
                </div>
              </div>

              {/* Reset Link Display & Copy */}
              <div className="bg-white border border-emerald-200 rounded-lg p-2 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={resetResult.resetUrl}
                  className="w-full bg-transparent text-[11px] text-slate-700 font-mono select-all outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-shrink-0 py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <Link
                  href={`/auth/reset-password?token=${encodeURIComponent(resetResult.token)}`}
                  className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Reset Password</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setResetResult(null);
                    setErrorMessage('');
                  }}
                  className="h-9 px-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-xs border border-slate-200 transition-colors cursor-pointer"
                >
                  Try Another
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <span className="text-[11px]">Have a token?</span>
              <Link
                href="/auth/reset-password"
                className="text-sky-600 font-semibold hover:underline inline-flex items-center gap-1 text-[11px]"
              >
                <span>Enter manually</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@university.edu.ng"
                className="w-full h-11 bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Sending link...' : 'Send reset link'}</span>
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
