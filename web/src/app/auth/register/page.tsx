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
  Loader2
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
  const [matricNumber, setMatricNumber] = useState('');
  const [institution, setInstitution] = useState('Federal University of Technology, Akure');
  const [course, setCourse] = useState('Computer Science');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const res = await register({
      fullName,
      email,
      password,
      matricNumber: matricNumber || 'FUTA/CSC/20/4182',
      institution,
      course,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed. Please try again.');
      setIsSubmitting(false);
      return;
    }

    router.push('/dashboard');
  }

  async function handleGoogleSignUp() {
    setIsGoogleSubmitting(true);
    setErrorMsg('');

    try {
      const googleRes = await signInWithGoogle();
      if (!googleRes.success || !googleRes.user) {
        setErrorMsg(googleRes.error || 'Google sign-up was cancelled.');
        setIsGoogleSubmitting(false);
        return;
      }

      const syncRes = await loginWithGoogle(googleRes.user);
      if (!syncRes.success) {
        setErrorMsg(syncRes.error || 'Failed to initialize account with Google.');
        setIsGoogleSubmitting(false);
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during Google sign up.');
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Accents */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card with Bold 2px Border */}
      <div className="w-full max-w-4xl bg-white border-2 border-slate-300/90 shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Brand & Benefits (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 via-sky-50/50 to-blue-50/40 p-8 flex flex-col justify-between border-b-2 lg:border-b-0 lg:border-r-2 border-slate-200 relative">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
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
            <div className="p-4 rounded-2xl bg-sky-50/80 border-2 border-sky-200 space-y-1.5 shadow-xs">
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

          <div className="pt-6 border-t-2 border-slate-200 mt-6 text-xs text-slate-600">
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
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold rounded-xl shadow-xs flex items-center justify-center gap-3 transition-all active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {isGoogleSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
                  <span className="text-xs">Setting up account with Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs">Sign up with Google (1-Click)</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold">
            <div className="flex-1 h-[2px] bg-slate-200" />
            <span className="uppercase text-[10px] tracking-wider text-slate-500">or register with email</span>
            <div className="flex-1 h-[2px] bg-slate-200" />
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Adebayo Tunde"
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 font-medium outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Matric / Reg Number</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={matricNumber}
                    onChange={e => setMatricNumber(e.target.value)}
                    placeholder="e.g. FUTA/CSC/20/4182"
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 font-medium outline-none transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student University Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@futa.edu.ng"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 font-medium outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 font-medium outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tertiary Institution</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 font-medium outline-none transition-all shadow-xs"
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
              className="w-full mt-3 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
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
