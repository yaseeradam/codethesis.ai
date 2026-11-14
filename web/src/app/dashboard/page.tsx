'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Home,
  GraduationCap,
  FileText,
  Code2,
  GitFork,
  Presentation,
  Mic,
  BookOpen,
  FileCheck,
  Calculator,
  FolderGit2,
  CreditCard,
  Settings,
  Headphones,
  Crown,
  ChevronDown,
  LogOut,
  Search,
  Bell,
  ArrowRight,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Star,
  ExternalLink,
  ShieldCheck,
  Coins,
  Check,
  PanelLeftClose,
  PanelLeft,
  Menu,
  ShieldAlert
} from 'lucide-react';

interface Project {
  id: string;
  toolId: string;
  title: string;
  fileType: 'docx' | 'pptx' | 'zip';
  date: string;
  size: string;
  tag: string;
  tagColor: string;
  href: string;
}

const ACADEMIC_TOOLS = [
  {
    id: 'studio',
    name: 'Academic Studio',
    description: 'Complete workspace for your academic project.',
    href: '/studio',
    icon: GraduationCap,
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    id: 'thesis',
    name: '5-Chapter Thesis',
    description: 'Generate a full thesis (~18,000+ words).',
    href: '/tool/thesis',
    icon: FileText,
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 'software-builder',
    name: 'Software Builder',
    description: 'Build & run Python apps with 1-click.',
    href: '/tool/software-builder',
    icon: Code2,
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'uml-engine',
    name: 'UML Engine',
    description: 'Create professional UML diagrams.',
    href: '/tool/uml-diagrams',
    icon: GitFork,
    gradient: 'from-purple-400 to-indigo-500',
  },
  {
    id: 'viva-presentation',
    name: 'Viva Presentation',
    description: '15-slide defense deck.',
    href: '/tool/viva-presentation',
    icon: Presentation,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'viva-simulator',
    name: 'Viva Simulator',
    description: 'Practice your oral defense with AI.',
    href: '/tool/viva-simulator',
    icon: Mic,
    gradient: 'from-amber-400 to-yellow-500',
  },
  {
    id: 'siwes-logbook',
    name: 'SIWES Logbook',
    description: '12–24 Weeks logbook.',
    href: '/tool/siwes-logbook',
    icon: BookOpen,
    gradient: 'from-teal-400 to-emerald-500',
  },
  {
    id: 'itf-report',
    name: 'ITF Technical Report',
    description: '5-Chapter industrial report.',
    href: '/tool/itf-report',
    icon: FileCheck,
    gradient: 'from-fuchsia-500 to-purple-600',
  },
  {
    id: 'assignment-solver',
    name: 'Assignment Solver',
    description: 'Math, proofs & circuits.',
    href: '/tool/assignment-solver',
    icon: Calculator,
    gradient: 'from-sky-400 to-cyan-600',
  },
];

const RECENT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    toolId: 'thesis',
    title: 'E-commerce Website Project',
    fileType: 'docx',
    date: 'Nov 13, 2025',
    size: '2.5 MB',
    tag: 'FYP',
    tagColor: 'bg-blue-600 text-white',
    href: '/studio',
  },
  {
    id: 'proj-2',
    toolId: 'viva-presentation',
    title: 'Viva Presentation Deck',
    fileType: 'pptx',
    date: 'Nov 12, 2025',
    size: '1.8 MB',
    tag: 'PPT',
    tagColor: 'bg-purple-600 text-white',
    href: '/tool/viva-presentation',
  },
  {
    id: 'proj-3',
    toolId: 'software-builder',
    title: 'Student Forum Software',
    fileType: 'zip',
    date: 'Nov 10, 2025',
    size: '4.2 MB',
    tag: 'ZIP',
    tagColor: 'bg-emerald-600 text-white',
    href: '/tool/software-builder',
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    quote: 'CodeThesis AI made my final year project so easy. The viva simulator is a game changer!',
    author: 'Ibrahim Musa',
    dept: 'FUTA, Computer Science',
    rating: 5,
    avatar: '/assets/avatar_ibrahim.jpg',
  },
  {
    id: 2,
    quote: 'Generated my 24-week SIWES logbook with detailed Cisco configs. My supervisor signed it off immediately.',
    author: 'Chioma Okeke',
    dept: 'UNILAG, Systems Engineering',
    rating: 5,
    avatar: '/assets/avatar_adebayo.jpg',
  },
  {
    id: 3,
    quote: 'The 3-tier architecture UML diagrams and SQLite software saved me from failing my defense panel.',
    author: 'Emmanuel Adeyemi',
    dept: 'ABU Zaria, Software Engineering',
    rating: 5,
    avatar: '/assets/avatar_ibrahim.jpg',
  },
];

function DashboardMain() {
  const searchParams = useSearchParams();
  const paymentRef = searchParams.get('ref');
  const paymentStatus = searchParams.get('payment');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [credits, setCredits] = useState(15);
  const [animatedCredits, setAnimatedCredits] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [demoBanner, setDemoBanner] = useState<string | null>(null);

  // Animate credits counter on mount
  useEffect(() => {
    let start = 0;
    const duration = 800;
    const stepTime = 40;
    const steps = duration / stepTime;
    const increment = credits / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= credits) {
        setAnimatedCredits(credits);
        clearInterval(timer);
      } else {
        setAnimatedCredits(Math.floor(start));
      }
    }, stepTime);

    // Animate progress bar fill
    const progressTimer = setTimeout(() => {
      setProgressWidth(60);
    }, 200);

    return () => {
      clearInterval(timer);
      clearTimeout(progressTimer);
    };
  }, [credits]);

  useEffect(() => {
    if (paymentRef && (paymentStatus === 'success' || paymentStatus === 'simulation')) {
      setCredits(prev => prev + 15);
      setDemoBanner('Payment verified! 15 new generation credits have been added to your account.');
    }
  }, [paymentRef, paymentStatus]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-cyan-500 selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          1. LEFT COLLAPSIBLE SIDEBAR (Midnight Navy #070F2B)
      ─────────────────────────────────────────────────────────────── */}
      <aside
        className={`bg-[#070F2B] text-slate-300 flex-shrink-0 flex flex-col justify-between p-3.5 lg:min-h-screen border-r border-slate-800/80 relative overflow-hidden z-20 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-full lg:w-[76px]' : 'w-full lg:w-[270px]'
        }`}
      >
        {/* Subtle Ambient Cyan Glow Orb at Bottom Left */}
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

        {/* Top Brand Section & Collapse Button */}
        <div>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'} px-1 py-2.5 mb-3`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-cyan-500/20 border border-cyan-400/30 flex-shrink-0">
                <Image
                  src="/assets/logo_codethesis_3d.jpg"
                  alt="CodeThesis AI 3D Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {!isSidebarCollapsed && (
                <div className="overflow-hidden transition-all duration-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-base tracking-tight whitespace-nowrap">CodeThesis</span>
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                      AI
                    </span>
                  </div>
                  <p className="text-[9px] tracking-wider uppercase text-cyan-300/80 font-medium mt-0.5 whitespace-nowrap">
                    Build • Document • Defend
                  </p>
                </div>
              )}
            </div>

            {/* Collapse / Expand Icon Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="w-4 h-4 text-cyan-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Primary Tool Navigation */}
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              prefetch={false}
              title="Dashboard"
              className={`flex items-center rounded-xl text-sm font-semibold bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-md shadow-sky-600/20 transition-all active:scale-95 ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
              }`}
            >
              <Home className="w-4 h-4 stroke-[2.2] flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Dashboard</span>}
            </Link>

            <Link
              href="/studio"
              prefetch={false}
              title="Academic Studio"
              className={`flex items-center rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 group ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Academic Studio</span>}
            </Link>

            <Link
              href="/tool/thesis"
              prefetch={false}
              title="Thesis Generator"
              className={`flex items-center rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 group ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Thesis Generator</span>}
            </Link>

            <Link
              href="/tool/software-builder"
              prefetch={false}
              title="Software Builder"
              className={`flex items-center rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 group ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <Code2 className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Software Builder</span>}
            </Link>

            <Link
              href="/tool/uml-diagrams"
              prefetch={false}
              title="UML Diagrams"
              className={`flex items-center rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 group ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <GitFork className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">UML Diagrams</span>}
            </Link>

            <Link
              href="/tool/viva-presentation"
              prefetch={false}
              title="Viva Presentation"
              className={`flex items-center rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 group ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <Presentation className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Viva Presentation</span>}
            </Link>

            <Link
              href="/tool/viva-simulator"
              prefetch={false}
              title="Viva Simulator"
              className={`flex items-center rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 group ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <Mic className="w-4 h-4 text-slate-400 group-hover:text-yellow-400 transition-colors flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Viva Simulator</span>}
            </Link>

            <Link
              href="/tool/siwes-logbook"
              prefetch={false}
              title="SIWES Logbook"
              className={`flex items-center rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 group ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-teal-400 transition-colors flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">SIWES Logbook</span>}
            </Link>

            <Link
              href="/tool/itf-report"
              prefetch={false}
              title="ITF Report"
              className={`flex items-center rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 group ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <FileCheck className="w-4 h-4 text-slate-400 group-hover:text-fuchsia-400 transition-colors flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">ITF Report</span>}
            </Link>

            <Link
              href="/tool/assignment-solver"
              prefetch={false}
              title="Assignment Solver"
              className={`flex items-center rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 group ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <Calculator className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Assignment Solver</span>}
            </Link>
          </nav>

          {/* Subtle Horizontal Divider */}
          <div className="border-t border-slate-800/80 my-3 mx-1" />

          {/* Secondary Account Links */}
          <div className="space-y-1">
            <Link
              href="/projects"
              prefetch={false}
              title="My Projects"
              className={`flex items-center rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <FolderGit2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">My Projects</span>}
            </Link>

            <Link
              href="/pricing"
              prefetch={false}
              title="Billing & Credits"
              className={`flex items-center rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Billing & Credits</span>}
            </Link>

            <Link
              href="/settings"
              prefetch={false}
              title="Settings"
              className={`flex items-center rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Settings</span>}
            </Link>

            <Link
              href="/support"
              prefetch={false}
              title="Help & Support"
              className={`flex items-center rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <Headphones className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Help & Support</span>}
            </Link>

            <Link
              href="/admin"
              prefetch={false}
              title="Admin Control Center"
              className={`flex items-center rounded-xl text-xs font-semibold text-amber-300 hover:text-white hover:bg-white/5 transition-all active:scale-95 ${
                isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">Admin Controls</span>}
            </Link>
          </div>
        </div>

        {/* Bottom Section: In-Sidebar Upgrade Card & Student Profile */}
        <div className="mt-4 pt-1">
          {/* Upgrade to Pro Card */}
          {!isSidebarCollapsed ? (
            <div className="relative overflow-hidden rounded-2xl p-3.5 bg-gradient-to-b from-[#131D42]/90 to-[#0B132B]/90 border border-amber-500/30 shadow-lg mb-3">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                <Crown className="w-4 h-4 fill-amber-400" />
                <span>Upgrade to Pro</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight mb-2.5">
                Unlock unlimited access to all tools and features.
              </p>
              <Link
                href="/pricing"
                prefetch={false}
                className="block text-center w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-1.5 px-3 rounded-xl text-xs shadow-md gold-shimmer transition-transform active:scale-95"
              >
                Go Pro &rarr;
              </Link>
            </div>
          ) : (
            <Link
              href="/pricing"
              prefetch={false}
              title="Upgrade to Pro"
              className="flex justify-center p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-colors mb-2.5"
            >
              <Crown className="w-4 h-4 fill-amber-400" />
            </Link>
          )}

          {/* Student Profile Pill */}
          <div
            className={`flex items-center rounded-xl hover:bg-white/5 transition-colors ${
              isSidebarCollapsed ? 'justify-center p-1.5' : 'justify-between px-2 py-1.5'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/60 flex-shrink-0">
                <Image
                  src="/assets/avatar_adebayo.jpg"
                  alt="Adebayo Tunde Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              {!isSidebarCollapsed && (
                <div className="leading-tight overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">Adebayo Tunde</p>
                  <p className="text-[10px] text-cyan-300/80 truncate">FUTA Student</p>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
          </div>

          {!isSidebarCollapsed && (
            <div className="mt-1 px-2">
              <button
                onClick={() => alert('Demo Student Session Active (Adebayo Tunde - FUTA)')}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors py-1"
              >
                <span>Logout &rarr;</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA (Clean Academic Slate #F1F5F9)
      ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#F1F5F9]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200/80 gap-3">
          {/* Left Collapse & Search Cluster */}
          <div className="flex items-center gap-3 w-full max-w-lg">
            {/* Header Sidebar Toggle Icon Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-xl bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs transition-transform active:scale-95 flex items-center justify-center flex-shrink-0"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="w-4 h-4 text-sky-600" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Search Pill */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, projects, or features... (Ctrl + K)"
                className="w-full bg-white border border-slate-200/90 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Notification Bell with Badge 3 */}
            <button
              onClick={() => alert('3 Notifications: 1) E-commerce thesis docx compiled, 2) Viva simulator ready, 3) +15 Credits loaded.')}
              className="relative p-2 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs transition-transform active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                3
              </span>
            </button>

            {/* Upgrade Plan Button */}
            <Link
              href="/pricing"
              prefetch={false}
              className="flex items-center gap-2 bg-gradient-to-r from-[#0284C7] to-[#06B6D4] hover:brightness-105 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition-transform active:scale-95 flex-shrink-0"
            >
              <Crown className="w-3.5 h-3.5 fill-white" />
              <span className="hidden sm:inline">Upgrade Plan &rarr;</span>
            </Link>
          </div>
        </header>

        {/* Page Body Container */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Notification Alert if returned from payment */}
          {demoBanner && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-emerald-800 text-xs shadow-xs animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{demoBanner}</span>
              </div>
              <button
                onClick={() => setDemoBanner(null)}
                className="font-bold text-emerald-700 hover:text-emerald-900 ml-4"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              3. HERO BANNER: "Welcome back, Adebayo! 👋" (Reduced by 30%)
          ─────────────────────────────────────────────────────────────── */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#070E27] via-[#0B1C4D] to-[#0A266E] border border-blue-900/40 p-4 sm:p-5 md:p-6 text-white shadow-lg">
            {/* Background Ambient Ring Lighting */}
            <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />
            <div className="absolute right-1/4 bottom-0 w-44 h-44 rounded-full bg-blue-600/10 blur-xl pointer-events-none" />

            {/* Top-Right Platform Status Badge */}
            <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-[11px] px-2.5 py-1 rounded-full font-medium shadow-xs backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span>Platform Status: <strong className="text-emerald-300 font-semibold">All Systems Online</strong></span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              {/* Left Copy & Buttons */}
              <div className="lg:col-span-7 z-10">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                  Welcome back, <span className="text-[#38BDF8]">Adebayo!</span> 👋
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-200 mt-1.5">
                  Your all-in-one academic engineering workspace.
                </p>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 mb-4">
                  Turn your ideas into world-class projects with the power of AI.
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href="/studio"
                    prefetch={false}
                    className="bg-[#00A3FF] hover:bg-[#0092E6] text-white font-bold px-4 py-2 rounded-full text-xs shadow-md shadow-cyan-500/30 flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <span>Start a New Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => alert('CodeThesis AI Demo: Watch 2-minute walkthrough of the 5-Chapter Thesis generator, Live Viva Oral simulator, and Turnkey Python app launcher.')}
                    className="border border-white/40 hover:bg-white/10 text-white font-semibold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center">
                      <Play className="w-2 h-2 fill-white text-white ml-0.5" />
                    </div>
                    <span>Watch Demo</span>
                  </button>
                </div>
              </div>

              {/* Center-Right 3D Visual Centerpiece (Reduced by 30%) */}
              <div className="lg:col-span-5 relative flex items-end justify-center lg:justify-end">
                <div className="relative w-full max-w-[335px] lg:max-w-[365px] h-[155px] sm:h-[180px] lg:h-[200px] animate-float drop-shadow-[0_15px_30px_rgba(2,132,199,0.4)]">
                  <Image
                    src="/assets/header.png"
                    alt="3D Floating Graduation Cap, Books and Laptop"
                    fill
                    className="object-contain object-center lg:object-right-bottom"
                    priority
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              4. MAIN 2-COLUMN SECTION:
                 Left: Our 9 Powerful Academic Tools (68%)
                 Right: Telemetry & Activity Panel (32%)
          ─────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 9-Tool Grid */}
            <div className="lg:col-span-8 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      Our 9 Powerful Academic Tools
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Everything you need for your thesis, projects and academic success.
                    </p>
                  </div>
                </div>

                <Link
                  href="/studio"
                  prefetch={false}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                >
                  <span>Explore All Tools</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* 3x3 Tool Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {ACADEMIC_TOOLS.map((tool) => {
                  const IconComp = tool.icon;
                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      prefetch={false}
                      className="group bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all flex items-center justify-between active:scale-98"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {/* Custom Tool Squircle Badge */}
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} text-white flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                        >
                          <IconComp className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {tool.name}
                          </h3>
                          <p className="text-[10px] text-slate-500 line-clamp-1 leading-snug">
                            {tool.description}
                          </p>
                        </div>
                      </div>

                      {/* Right Action Circle Pill */}
                      <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-400 flex items-center justify-center flex-shrink-0 transition-colors">
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Credits Telemetry & Recent Projects */}
            <div className="lg:col-span-4 space-y-4">
              {/* "Your Credits" Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B256B] via-[#0E3596] to-[#0284C7] p-5 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                      Your Credits
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-[10px] px-2.5 py-0.5 rounded-full text-white font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" />
                    <span>Pro Plan Active</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-black text-white tracking-tight">
                    {animatedCredits}
                  </span>
                  <span className="text-xs text-blue-100 font-medium">Credits Remaining</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-black/20 rounded-full h-1.5 mb-4 overflow-hidden">
                  <div
                    className="bg-cyan-300 h-1.5 rounded-full transition-all duration-700 ease-out shadow-xs"
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>

                <Link
                  href="/pricing"
                  prefetch={false}
                  className="w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-2 px-4 rounded-full text-xs shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <span>Buy More Credits</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* "Recent Projects" Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight">Recent Projects</h3>
                  </div>
                  <Link
                    href="/projects"
                    prefetch={false}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View All &rarr;
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {RECENT_PROJECTS.map((proj) => (
                    <div
                      key={proj.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0 ${proj.tagColor}`}
                        >
                          {proj.tag}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{proj.title}</p>
                          <p className="text-[10px] text-slate-400">
                            {proj.date} &bull; {proj.size}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={proj.href}
                        prefetch={false}
                        className="text-[11px] font-semibold text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-full border border-slate-200 transition-colors flex-shrink-0"
                      >
                        Open
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              5. BOTTOM 3-CARD ECOSYSTEM ROW:
                 - Why Choose CodeThesis AI?
                 - What Our Students Say (Testimonial)
                 - Need Help? (Support)
          ─────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Card 1: Why Choose CodeThesis AI? (4 Cols) */}
            <div className="md:col-span-5 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#060D24] to-[#0A1A4A] border border-blue-900/50 p-5 text-white flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-white mb-3 tracking-tight">
                  Why Choose CodeThesis AI?
                </h3>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-200 mb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 stroke-[3]" />
                      <span>AI-Powered Generation</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 stroke-[3]" />
                      <span>100% Academic Standards</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 stroke-[3]" />
                      <span>Instant Downloads</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 stroke-[3]" />
                      <span>Secure & Reliable</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 stroke-[3]" />
                      <span>Paystack & Stripe</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 stroke-[3]" />
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/studio"
                  prefetch={false}
                  className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-full text-xs shadow-md gold-shimmer transition-transform active:scale-95"
                >
                  Get Started Free &rarr;
                </Link>

                <div className="relative w-16 h-16 rounded-xl overflow-hidden animate-float-delayed flex-shrink-0 border border-amber-400/20">
                  <Image
                    src="/assets/growth_chart_3d.jpg"
                    alt="Growth Chart 3D Illustration"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: What Our Students Say (4 Cols) */}
            <div className="md:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 mb-2">What Our Students Say</h3>

                <div className="relative mb-3">
                  <span className="text-3xl text-sky-400 font-serif leading-none select-none">“</span>
                  <p className="text-xs text-slate-700 italic -mt-2 leading-relaxed">
                    {TESTIMONIALS[activeTestimonial].quote}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 flex-shrink-0">
                    <Image
                      src={TESTIMONIALS[activeTestimonial].avatar}
                      alt={TESTIMONIALS[activeTestimonial].author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {TESTIMONIALS[activeTestimonial].author}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {TESTIMONIALS[activeTestimonial].dept}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {/* Rating Stars */}
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>

                  {/* Carousel Dots */}
                  <div className="flex items-center gap-1">
                    {TESTIMONIALS.map((t, idx) => (
                      <button
                        key={t.id}
                        onClick={() => setActiveTestimonial(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          activeTestimonial === idx ? 'w-3 bg-blue-600' : 'bg-slate-300'
                        }`}
                        aria-label={`View testimonial ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Need Help? Support Card (3 Cols) */}
            <div className="md:col-span-3 bg-gradient-to-br from-[#EBF3FC] to-[#DDEBFA] dark:from-[#0E1A3D] dark:to-[#0B1530] border border-blue-200/60 dark:border-blue-900/40 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xs min-h-[175px]">
              <div className="relative z-10 max-w-[150px] sm:max-w-[160px]">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-1">
                  <Headphones className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <h3 className="text-xs font-bold tracking-tight">Need Help?</h3>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight mb-4">
                  Our support team is always ready to help you.
                </p>

                <Link
                  href="/support"
                  prefetch={false}
                  className="inline-flex items-center gap-1.5 bg-[#0B132B] dark:bg-cyan-500 hover:bg-[#132047] dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-semibold px-3.5 py-1.5 rounded-full text-xs shadow-xs transition-transform active:scale-95 whitespace-nowrap"
                >
                  <span>Contact Support &rarr;</span>
                </Link>
              </div>

              {/* 3D Female Support Specialist Avatar with Thumbs Up - Anchored flush to bottom right */}
              <div className="absolute bottom-0 right-0 w-[135px] sm:w-[150px] lg:w-[160px] h-[155px] sm:h-[170px] lg:h-[185px] flex-shrink-0 drop-shadow-[0_10px_20px_rgba(2,132,199,0.3)] pointer-events-none z-0">
                <Image
                  src="/assets/women.png"
                  alt="3D Support Specialist in Blue Hijab"
                  fill
                  className="object-contain object-bottom"
                />
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              6. GLOBAL FOOTER BAR
          ─────────────────────────────────────────────────────────────── */}
          <footer className="pt-6 pb-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
            <p>&copy; 2025 CodeThesis AI. All rights reserved.</p>

            <div className="flex items-center gap-3">
              <Link href="/terms" prefetch={false} className="hover:text-slate-800 transition-colors">
                Terms of Service
              </Link>
              <span>&bull;</span>
              <Link href="/privacy" prefetch={false} className="hover:text-slate-800 transition-colors">
                Privacy Policy
              </Link>
              <span>&bull;</span>
              <Link href="/contact" prefetch={false} className="hover:text-slate-800 transition-colors">
                Contact Us
              </Link>
            </div>

            <p className="font-medium text-slate-600 italic flex items-center gap-1">
              <span>Dream it. Build it. Defend it.</span>
              <span className="text-amber-500 font-normal not-italic">👑</span>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardMain />
    </Suspense>
  );
}
