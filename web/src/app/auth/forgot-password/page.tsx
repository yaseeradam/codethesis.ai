'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  KeyRound,
  ExternalLink,
  Loader2,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
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
      // Fallback if clipboard API fails
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Subtle Academic Ambient Accents */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card with Refined 1px Border and Soft Shadow */}
      <div className="w-full max-w-xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/60 rounded-3xl overflow-hidden relative z-10 p-6 sm:p-10">
        
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
            <KeyRound className="w-3.5 h-3.5" />
            <span>Academic Credential Recovery</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Reset Your Academic Access
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Enter your institutional email address to generate an instant recovery token and regain access to your research theses and defense decks.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success / Recovery Link Card */}
        {resetResult ? (
          <div className="space-y-5 animate-fadeIn">
            {/* Informational Dev Environment Banner */}
            <div className="p-4 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    {resetResult.emailSent ? 'Recovery Email Dispatched to Inbox!' : 'Recovery Link Generated Successfully!'}
                  </h3>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {resetResult.emailSent ? (
                      <>
                        We have dispatched your academic reset link directly to <strong className="font-semibold text-emerald-950">{resetResult.email}</strong> via transactional email. Please check your inbox or spam folder.
                      </>
                    ) : (
                      'Your password recovery link is ready. Use the link below or click proceed to set your new password.'
                    )}
                  </p>
                </div>
              </div>

              {/* Reset Link Display & Copy */}
              <div className="mt-2 bg-white border-2 border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 shadow-xs">
                <input
                  type="text"
                  readOnly
                  value={resetResult.resetUrl}
                  className="w-full bg-transparent text-[11px] text-slate-700 font-mono select-all outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-shrink-0 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all border border-slate-300 cursor-pointer active:scale-95"
                  title="Copy Recovery Link"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <Link
                  href={`/auth/reset-password?token=${encodeURIComponent(resetResult.token)}`}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <span>Proceed to Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setResetResult(null);
                    setErrorMessage('');
                  }}
                  className="py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border-2 border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
                >
                  Reset Another Account
                </button>
              </div>
            </div>

            {/* Direct Token Link for Manual Entry */}
            <div className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <span className="text-[11px]">Already have a recovery token?</span>
              <Link
                href="/auth/reset-password"
                className="text-sky-600 font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
              >
                <span>Enter Token Manually</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ) : (
          /* Form for Entering Institutional Email */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Institutional Email</label>
                <span className="text-[10px] text-slate-400 font-medium">e.g. FUTA, UNILAG, UNN</span>
              </div>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 group-hover:text-slate-600 transition-colors pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@futa.edu.ng"
                  required
                  autoFocus
                  className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-normal outline-none transition-all shadow-xs focus:ring-4 focus:ring-sky-500/10"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="w-full py-3 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/30 active:scale-[0.99] cursor-pointer disabled:opacity-60 text-xs sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating Recovery Link...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer links */}
        <div className="mt-8 pt-5 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>

          <Link
            href="/auth/reset-password"
            className="text-sky-600 hover:underline font-semibold"
          >
            Have a token already? Reset password &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}
