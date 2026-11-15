'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CourseSelect from '@/components/ui/CourseSelect';
import { useAuth } from '@/context/AuthContext';
import { signInWithGoogle } from '@/lib/firebase';
import {
  Lock,
  Mail,
  User,
  Building,
  Hash,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Gift,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles
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

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [matricNumber, setMatricNumber] = useState('');
  const [institution, setInstitution] = useState('Federal University of Technology, Akure');
  const [course, setCourse] = useState('Computer Science');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState('Securing credentials & registering account...');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    setRegistrationSuccess(false);
    setLoaderStatus('Hashing credentials & creating scholar profile...');

    try {
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        matricNumber: matricNumber.trim() || 'FUTA/CSC/20/4182',
        institution: institution.trim(),
        course,
      });

      if (!res.success) {
        setIsSubmitting(false);
        setErrorMsg(res.error || 'Registration failed. Please check details and try again.');
        return;
      }

      setRegistrationSuccess(true);
      setLoaderStatus('Allocating 15 free starter credits in Neon DB...');

      // Guaranteed hard redirect via window.location to pass cookie and trigger dashboard
      setTimeout(() => {
        setLoaderStatus('Launching your academic workspace...');
        window.location.href = '/dashboard';
      }, 700);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'An unexpected error occurred during registration.');
    }
  }

  async function handleGoogleSignUp() {
    setErrorMsg('');
    setIsGoogleSubmitting(true);
    setRegistrationSuccess(false);
    setLoaderStatus('Connecting with Google authentication...');

    try {
      const googleRes = await signInWithGoogle();
      if (!googleRes.success || !googleRes.user) {
        setErrorMsg(googleRes.error || 'Google sign-up was cancelled.');
        setIsGoogleSubmitting(false);
        return;
      }

      setLoaderStatus('Provisioning scholar account in Neon DB...');
      const syncRes = await loginWithGoogle(googleRes.user);
      if (!syncRes.success) {
        setErrorMsg(syncRes.error || 'Failed to initialize account with Google.');
        setIsGoogleSubmitting(false);
        return;
      }

      setRegistrationSuccess(true);
      setLoaderStatus('Account created! Launching dashboard...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during Google sign up.');
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Centered Modal Loader at the Middle of the Page */}
      {(isSubmitting || isGoogleSubmitting) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-4 animate-scaleUp">
            {/* Animated Glowing Ring & Icon */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-sky-100 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/30">
                {registrationSuccess ? (
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Sparkles className="w-5 h-5 animate-pulse" />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {registrationSuccess ? 'Account Created Successfully!' : 'Creating Your Account...'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {loaderStatus}
              </p>
            </div>

            {/* Progress Bar Animation */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-500 ${
                  registrationSuccess ? 'w-full' : 'w-3/4 animate-pulse'
                }`}
              />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Neon PostgreSQL Cloud Synced</span>
            </div>
          </div>
        </div>
      )}

      {/* Background Ambient Accents */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card with Refined 1px Border and Soft Shadow */}
      <div className="w-full max-w-4xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/60 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Brand & Benefits (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 via-sky-50/40 to-blue-50/30 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 relative">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
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
                <p className="text-[10px] text-sky-700 font-bold uppercase tracking-wider">Build • Document • Defend</p>
              </div>
            </Link>

            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Create Student Account</h1>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Join thousands of final-year scholars generating thesis dissertations, software packages, and viva defense slides.
              </p>
            </div>

            {/* Free Starter Credits Callout */}
            <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-sky-800 font-black text-xs">
                <Gift className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>15 Free Starter Credits Granted</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Immediately compile your 5-chapter thesis draft, software code ZIP, and defense cheatsheet upon sign-up.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {[
                'NUC Standard 5-Chapter Thesis Compilers',
                'Zero-pip runnable Python software repos',
                'Interactive Viva oral examiner simulator',
                'Custom course & university degree calibration',
              ].map(feat => (
                <div key={feat} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/80 mt-6 text-xs text-slate-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-sky-600 font-bold hover:underline">
              Sign In &rarr;
            </Link>
          </div>
        </div>

        {/* Right Side: Form (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 bg-white flex flex-col justify-center space-y-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Registration</h2>
            <p className="text-xs text-slate-500 mt-0.5">Quick 1-step registration with 15 free starter credits.</p>
          </div>

          {/* Google 1-Click Sign Up */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isGoogleSubmitting || isSubmitting}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-semibold rounded-xl shadow-xs hover:shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              {isGoogleSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                  <span className="text-xs font-medium">Setting up account with Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs font-semibold">Sign up with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="uppercase text-[10px] tracking-wider text-slate-400 font-medium">or register with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 group-hover:text-slate-600 transition-colors pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Adebayo Tunde"
                    className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-normal outline-none transition-all shadow-xs focus:ring-4 focus:ring-sky-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Matric / Reg Number</label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 group-hover:text-slate-600 transition-colors pointer-events-none">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={matricNumber}
                    onChange={e => setMatricNumber(e.target.value)}
                    placeholder="e.g. FUTA/CSC/20/4182"
                    className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-normal outline-none transition-all shadow-xs focus:ring-4 focus:ring-sky-500/10"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Student University Email</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 group-hover:text-slate-600 transition-colors pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@futa.edu.ng"
                  className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-normal outline-none transition-all shadow-xs focus:ring-4 focus:ring-sky-500/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 group-hover:text-slate-600 transition-colors pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-0.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tertiary Institution</label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 group-hover:text-slate-600 transition-colors pointer-events-none">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    placeholder="Federal University of Technology, Akure"
                    className="w-full bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-normal outline-none transition-all shadow-xs focus:ring-4 focus:ring-sky-500/10"
                  />
                </div>
              </div>

              <div>
                <CourseSelect
                  value={course}
                  onChange={setCourse}
                  label="Course / Department"
                  placeholder="e.g. Mechatronics, Cyber Forensics..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full mt-2 py-3 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Creating Account & Loading Credits...' : 'Create Account & Claim 15 Free Credits'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
