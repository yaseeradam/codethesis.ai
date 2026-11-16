'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Code2,
  GitFork,
  Presentation,
  Mic,
  BookOpen,
  FileCheck,
  Calculator,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Crown,
  Play,
  Star,
  Layers,
  GraduationCap
} from 'lucide-react';

const ACADEMIC_TOOLS = [
  {
    id: 'thesis',
    name: '5-Chapter Thesis Generator',
    description: 'Generates ~18,000+ words target, APA 7th citations with verified DOIs, and 1.5-inch hardcover margins.',
    href: '/tool/thesis',
    icon: FileText,
    badge: 'NUC Standard',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'software-builder',
    name: 'Software Builder',
    description: 'Builds turnkey Python/SQLite apps with zero pip errors. Includes complete code ZIP downloads.',
    href: '/tool/software-builder',
    icon: Code2,
    badge: 'Zero-Pip',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'viva-simulator',
    name: 'Viva Defense Simulator',
    description: 'Practice your oral project defense with simulated strict external examiners, real-time voice, and grading.',
    href: '/tool/viva-simulator',
    icon: Mic,
    badge: 'Oral Exam',
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 'uml-engine',
    name: 'UML & Architecture Engine',
    description: 'Generates Data Flow Diagrams (DFD Level 0/1), Entity-Relationship Diagrams (ERD), and System Flowcharts.',
    href: '/tool/uml-diagrams',
    icon: GitFork,
    badge: 'SSADM Specs',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'viva-presentation',
    name: '15-Slide Viva Deck',
    description: 'Pre-formatted PowerPoint slides with high-contrast diagrams, methodology breakdowns, and speaker notes.',
    href: '/tool/viva-presentation',
    icon: Presentation,
    badge: 'PowerPoint',
    color: 'from-blue-500 to-sky-600',
  },
  {
    id: 'siwes-logbook',
    name: 'SIWES Industrial Logbook',
    description: 'Weekly entries, industrial diagrams, and technical summaries compliant with ITF requirements.',
    href: '/tool/siwes-logbook',
    icon: BookOpen,
    badge: 'ITF Aligned',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    id: 'itf-report',
    name: 'ITF Technical Report',
    description: 'Comprehensive 40+ page industrial training defense report with equipment diagrams and log analysis.',
    href: '/tool/itf-report',
    icon: FileCheck,
    badge: 'Technical',
    color: 'from-fuchsia-500 to-purple-600',
  },
  {
    id: 'assignment-solver',
    name: 'Assignment & Lab Solver',
    description: 'Step-by-step mathematical proofs, network schematics, circuit analyses, and algorithms.',
    href: '/tool/assignment-solver',
    icon: Calculator,
    badge: 'STEM Ready',
    color: 'from-sky-500 to-cyan-600',
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-sky-300 shadow-xs flex-shrink-0">
              <Image
                src="/assets/logo_codethesis_3d.jpg"
                alt="CodeThesis AI Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-slate-950 text-xl tracking-tight">CodeThesis</span>
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs">
                AI
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#tools" className="hover:text-sky-600 transition-colors">Academic Tools</a>
            <a href="#integrity" className="hover:text-sky-600 transition-colors">Plagiarism Safe</a>
            <a href="#testimonials" className="hover:text-sky-600 transition-colors">Testimonials</a>
            <Link href="/pricing" className="hover:text-sky-600 transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <Link
                href="/dashboard"
                className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="h-9 px-3.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="h-9 px-4 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-medium text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Get 15 Free Credits</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold shadow-2xs">
                <span>🇳🇬</span>
                <span>Calibrated for Nigerian Universities & NUC Academic Standards</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
                Build, Document & Defend Your Final Year Project with Confidence.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Generate complete 18,000-word 5-chapter thesis dissertations with verified citations, launch runnable turnkey Python repositories, and master your oral viva defense before external examiners.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <span>Start Your Project (15 Free Credits)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#tools"
                  className="w-full sm:w-auto h-12 px-5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Explore 9 Academic Tools</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Turnitin Safe &lt;8%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>APA 7th Verified DOIs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-sky-600" />
                  <span>FUTA, UNILAG, ABU, UNN &amp; 80+ Schools</span>
                </div>
              </div>
            </div>

            {/* Right 3D Visual Showcase */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-[420px] aspect-square">
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse-glow" />
                <div className="relative w-full h-full animate-float">
                  <Image
                    src="/assets/header.png"
                    alt="CodeThesis Academic 3D Centerpiece"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Tools Grid */}
      <section id="tools" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">The Academic Suite</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Everything Needed for an A-Grade Project
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every tool is calibrated to the strict standards enforced by departmental project supervisors and external examiners across Nigerian tertiary institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {ACADEMIC_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group bg-slate-50/60 hover:bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center shadow-xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                        {tool.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-sky-600">
                    <span>Launch Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Academic Integrity & Turnitin Standards */}
      <section id="integrity" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Rigorous Academic Integrity Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Zero Fake References. Verified Real DOIs. Turnitin Similarity Guarantee.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              CodeThesis AI does not synthesize fake bibliographies or hallucinate authors. Every single academic citation in your 5-chapter thesis is validated against Crossref and IEEE databases, formatted in exact APA 7th style with working DOIs that your supervisor can verify.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-2xl font-black text-emerald-400">&lt; 8%</div>
              <h4 className="text-sm font-bold text-white">Turnitin Similarity Index</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Synthesized from foundational principles without wholesale passage plagiarism.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-2xl font-black text-sky-400">100% Verified</div>
              <h4 className="text-sm font-bold text-white">Crossref &amp; Scopus DOIs</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Every cited paper, journal volume, and year exists and can be clicked and checked.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-2xl font-black text-amber-400">1.5&quot; Margin</div>
              <h4 className="text-sm font-bold text-white">Hardcover Binding Format</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                Left margins calibrated for standard Nigerian university library hardcover binding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Social Proof</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Trusted by Scholars Nationwide
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Hear from graduates who defended their projects successfully with CodeThesis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                &ldquo;My external examiner at FUTA was known for tearing projects apart. The Viva simulator gave me the exact questions he asked during my oral defense. I bagged an A!&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs">
                <p className="font-bold text-slate-900">Adebayo Tunde</p>
                <p className="text-slate-500 text-[11px]">Computer Science, FUTA (First Class Honours)</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                &ldquo;I spent weeks stressing over Chapter 3 DFDs and database schemas for my final year software project. CodeThesis compiled the whole 5 chapters in standard NUC format without a glitch.&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs">
                <p className="font-bold text-slate-900">Bello Abubakar</p>
                <p className="text-slate-500 text-[11px]">Computer Science, ABU Zaria</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                &ldquo;The Turnitin similarity score on my 18,000-word draft came out at 5.2%. My supervisor approved it immediately without requesting a re-write. Best academic tool in Nigeria.&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs">
                <p className="font-bold text-slate-900">Chioma Okeke</p>
                <p className="text-slate-500 text-[11px]">Information Technology, UNILAG</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-gradient-to-r from-sky-600 to-blue-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            Ready to Complete Your Final Year Project?
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 max-w-xl mx-auto leading-relaxed">
            Create your account today and receive 15 free starter credits immediately. No credit card required.
          </p>
          <div>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 h-12 px-7 bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm rounded-xl shadow-lg transition-transform active:scale-95"
            >
              <span>Claim 15 Free Credits &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-white text-base">CodeThesis AI</span>
            <span>&bull;</span>
            <span>&copy; 2026 CodeThesis AI. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Support &amp; Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
