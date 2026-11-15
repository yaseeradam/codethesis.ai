'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signInWithGoogle } from '@/lib/firebase';
import InstitutionSelect from '@/components/ui/InstitutionSelect';
import CourseSelect from '@/components/ui/CourseSelect';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  XCircle,
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

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  
  // Form values
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [matricNumber, setMatricNumber] = useState('');
  const [institution, setInstitution] = useState('Federal University of Technology, Akure (FUTA)');
  const [course, setCourse] = useState('Computer Science');

  // Field-level error states
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [institutionError, setInstitutionError] = useState('');
  const [courseError, setCourseError] = useState('');
  const [globalErrorMsg, setGlobalErrorMsg] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [loaderStatus, setLoaderStatus] = useState('Securing credentials...');

  function validateForm() {
    let isValid = true;
    setFullNameError('');
    setEmailError('');
    setPasswordError('');
    setInstitutionError('');
    setCourseError('');
    setGlobalErrorMsg('');

    if (!fullName.trim()) {
      setFullNameError('Please enter your full name');
      isValid = false;
    } else if (fullName.trim().length < 3) {
      setFullNameError('Full name must be at least 3 characters');
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError('Please enter your email address');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email format (e.g. name@university.edu.ng)');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter a password');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!institution.trim()) {
      setInstitutionError('Please select or type your institution');
      isValid = false;
    }

    if (!course.trim()) {
      setCourseError('Please select or type your department');
      isValid = false;
    }

    if (!isValid) {
      setGlobalErrorMsg('Please fill in all required fields correctly below.');
    }

    return isValid;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setGlobalErrorMsg('');
    setIsSubmitting(true);
    setRegistrationSuccess(false);
    setLoaderStatus('Creating scholar profile...');

    try {
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        matricNumber: matricNumber.trim() || 'FUTA/CSC/20/4182',
        institution: institution.trim(),
        course: course.trim(),
      });

      if (!res.success) {
        setIsSubmitting(false);
        const err = res.error || 'Registration failed. Please check details and try again.';
        setGlobalErrorMsg(err);
        if (err.toLowerCase().includes('email')) {
          setEmailError(err);
        }
        return;
      }

      setRegistrationSuccess(true);
      setLoaderStatus('Allocating 15 starter credits...');

      setTimeout(() => {
        setLoaderStatus('Launching your workspace...');
        window.location.href = '/dashboard';
      }, 700);
    } catch (err: any) {
      setIsSubmitting(false);
      setGlobalErrorMsg(err.message || 'An unexpected error occurred during registration.');
    }
  }

  async function handleGoogleSignUp() {
    setGlobalErrorMsg('');
    setIsGoogleSubmitting(true);
    setRegistrationSuccess(false);
    setLoaderStatus('Connecting with Google authentication...');

    try {
      const googleRes = await signInWithGoogle();
      if (!googleRes.success || !googleRes.user) {
        setGlobalErrorMsg(googleRes.error || 'Google sign-up was cancelled.');
        setIsGoogleSubmitting(false);
        return;
      }

      setLoaderStatus('Provisioning scholar account...');
      const syncRes = await loginWithGoogle(googleRes.user);
      if (!syncRes.success) {
        setGlobalErrorMsg(syncRes.error || 'Failed to initialize account with Google.');
        setIsGoogleSubmitting(false);
        return;
      }

      setRegistrationSuccess(true);
      setLoaderStatus('Account created! Launching workspace...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 700);
    } catch (err: any) {
      setGlobalErrorMsg(err.message || 'An error occurred during Google sign up.');
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4 sm:p-6 relative font-sans">
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
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {registrationSuccess ? 'Account Created!' : 'Setting Up Account...'}
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

      {/* Main Register Card - Clean, Focused, Minimal */}
      <div className="w-full max-w-[500px] bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 rounded-2xl p-6 sm:p-8 relative z-10 space-y-5">
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
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-xs text-slate-500 mt-0.5">Includes 15 free starter credits for your project</p>
          </div>
        </div>

        {/* High-Visibility Error Alert Banner */}
        {globalErrorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-200 text-red-800 text-xs flex items-start gap-2.5 font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <p className="font-semibold text-red-900">Registration Notice</p>
              <p className="text-red-700 leading-relaxed">{globalErrorMsg}</p>
            </div>
          </div>
        )}

        {/* Google 1-Click Sign-Up */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full h-11 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
          >
            <GoogleIcon className="w-4 h-4 flex-shrink-0" />
            <span>Sign up with Google</span>
          </button>
        </div>

        {/* Minimal Divider */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            or
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} noValidate className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Full name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => {
                setFullName(e.target.value);
                if (fullNameError) setFullNameError('');
                if (globalErrorMsg) setGlobalErrorMsg('');
              }}
              placeholder="e.g. Babatunde Segun"
              className={`w-full h-11 bg-white border ${
                fullNameError ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' : 'border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10'
              } rounded-xl px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-xs`}
            />
            {fullNameError && (
              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 animate-fadeIn">
                <XCircle className="w-3 h-3 flex-shrink-0" />
                <span>{fullNameError}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Student university email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
                if (globalErrorMsg) setGlobalErrorMsg('');
              }}
              placeholder="name@university.edu.ng"
              className={`w-full h-11 bg-white border ${
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
            <label className="block text-xs font-medium text-slate-700">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                  if (globalErrorMsg) setGlobalErrorMsg('');
                }}
                placeholder="At least 6 characters"
                className={`w-full h-11 bg-white border ${
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

          {/* Institution Selector: Searchable, Typeable, List of Nigerian Schools, Manual Fallback */}
          <div>
            <InstitutionSelect
              value={institution}
              onChange={val => {
                setInstitution(val);
                if (institutionError) setInstitutionError('');
                if (globalErrorMsg) setGlobalErrorMsg('');
              }}
              label="Tertiary Institution"
              placeholder="Search list or type your university..."
              required
              error={institutionError}
            />
          </div>

          {/* Department Selector: Searchable, Typeable, Popular Courses, Manual Fallback */}
          <div>
            <CourseSelect
              value={course}
              onChange={val => {
                setCourse(val);
                if (courseError) setCourseError('');
                if (globalErrorMsg) setGlobalErrorMsg('');
              }}
              label="Department / Course of Study"
              placeholder="Search list or type your department..."
              required
              error={courseError}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">Matric / Reg number (optional)</label>
            <input
              type="text"
              value={matricNumber}
              onChange={e => setMatricNumber(e.target.value)}
              placeholder="e.g. FUTA/CSC/20/4182"
              className="w-full h-11 bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full mt-2 h-11 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            <span>Create account</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 pt-1">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-sky-600 hover:text-sky-700">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
