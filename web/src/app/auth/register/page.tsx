'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CourseSelect from '@/components/ui/CourseSelect';
import { useAuth } from '@/context/AuthContext';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  User,
  Building,
  Hash,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Gift,
  AlertCircle
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [institution, setInstitution] = useState('Federal University of Technology, Akure');
  const [course, setCourse] = useState('Computer Science');

  const [isSubmitting, setIsSubmitting] = useState(false);
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

  return (
    <div className="min-h-screen bg-[#070F2B] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl relative z-10">
        {/* Left Side: Brand & Visuals */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0c1844] to-[#070F2B] p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2.5">
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
                <p className="text-[10px] text-cyan-300 font-medium">Build • Document • Defend</p>
              </div>
            </Link>

            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Create Student Account</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Join thousands of final-year engineering and academic scholars preparing thesis dissertations, software, and viva defense slides.
              </p>
            </div>

            {/* Free Starter Credits Callout */}
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <Gift className="w-4 h-4 text-cyan-400" />
                <span>15 Free Starter Credits Included</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Immediately compile your 5-chapter thesis draft, software code ZIP, and defense cheatsheet upon registration with zero initial fee.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {[
                'NUC Standard 5-Chapter Thesis Compilers',
                'Zero-pip offline runnable software repositories',
                'Interactive Viva oral examiner simulator',
                'Custom course & university degree calibration',
              ].map(feat => (
                <div key={feat} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-cyan-400 font-bold hover:underline">
              Sign In &rarr;
            </Link>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-8 bg-slate-900/50 flex flex-col justify-center">
          <form onSubmit={handleRegister} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Adebayo Tunde"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Matric / Reg Number</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={matricNumber}
                    onChange={e => setMatricNumber(e.target.value)}
                    placeholder="e.g. FUTA/CSC/20/4182"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Student University Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@futa.edu.ng"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tertiary Institution</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Universal Course Select with Preset & 'Other' */}
              <div className="text-slate-200">
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
              disabled={isSubmitting}
              className="w-full mt-3 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
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
