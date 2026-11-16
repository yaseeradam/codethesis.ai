'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/ui/NotificationBell';
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
  ShieldAlert,
  Download,
  X
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

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: any;
  color: string;
  badge?: string;
  desc?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-sky-400' },
      { id: 'studio', label: 'Academic Studio', href: '/studio', icon: GraduationCap, color: 'text-cyan-400', badge: 'All-in-One' },
    ],
  },
  {
    title: 'Capstone Generators',
    items: [
      { id: 'thesis', label: 'Thesis Generator', href: '/tool/thesis', icon: FileText, color: 'text-amber-400', desc: 'Chapters 1-5' },
      { id: 'software-builder', label: 'Software Builder', href: '/tool/software-builder', icon: Code2, color: 'text-emerald-400', desc: 'Code & DB' },
      { id: 'uml-diagrams', label: 'UML Diagrams', href: '/tool/uml-diagrams', icon: GitFork, color: 'text-purple-400', desc: 'Architecture' },
    ],
  },
  {
    title: 'Defense & SIWES',
    items: [
      { id: 'viva-presentation', label: 'Viva Slide Deck', href: '/tool/viva-presentation', icon: Presentation, color: 'text-blue-400', desc: '15 Slides' },
      { id: 'viva-simulator', label: 'Viva Oral Simulator', href: '/tool/viva-simulator', icon: Mic, color: 'text-yellow-400', desc: 'Mock Q&A' },
      { id: 'siwes-logbook', label: 'SIWES Logbook', href: '/tool/siwes-logbook', icon: BookOpen, color: 'text-teal-400', desc: 'Weekly Logs' },
      { id: 'itf-report', label: 'ITF Technical Report', href: '/tool/itf-report', icon: FileCheck, color: 'text-fuchsia-400', desc: 'Defense Report' },
    ],
  },
  {
    title: 'Coursework',
    items: [
      { id: 'assignment-solver', label: 'Assignment Solver', href: '/tool/assignment-solver', icon: Calculator, color: 'text-sky-400', desc: 'Step-by-step' },
    ],
  },
];

interface AcademicToolItem {
  id: string;
  name: string;
  category: 'capstone' | 'defense-siwes' | 'coursework';
  categoryLabel: string;
  description: string;
  badge: string;
  href: string;
  icon: any;
  gradient: string;
}

const ACADEMIC_TOOLS: AcademicToolItem[] = [
  {
    id: 'thesis',
    name: 'Thesis Generator',
    category: 'capstone',
    categoryLabel: 'Capstone',
    description: 'Chapters 1–5 APA/IEEE formatted with Turnitin <8% defense.',
    badge: 'Docx & PDF',
    href: '/tool/thesis',
    icon: FileText,
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 'software-builder',
    name: 'Software Builder',
    category: 'capstone',
    categoryLabel: 'Capstone',
    description: 'Full codebases, interactive frontend & SQLite/Postgres schemas.',
    badge: 'Code & DB',
    href: '/tool/software-builder',
    icon: Code2,
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'uml-engine',
    name: 'UML Diagrams',
    category: 'capstone',
    categoryLabel: 'Capstone',
    description: 'Use Case, Class, Sequence & ERD system architecture models.',
    badge: 'Visual AST',
    href: '/tool/uml-diagrams',
    icon: GitFork,
    gradient: 'from-purple-400 to-indigo-500',
  },
  {
    id: 'viva-presentation',
    name: 'Viva Slide Deck',
    category: 'defense-siwes',
    categoryLabel: 'Defense',
    description: '15-slide defense deck with speaker notes and timings (.pptx).',
    badge: 'PPTX Deck',
    href: '/tool/viva-presentation',
    icon: Presentation,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'viva-simulator',
    name: 'Viva Oral Simulator',
    category: 'defense-siwes',
    categoryLabel: 'Defense',
    description: 'Practice your oral defense live with AI supervisor examiners.',
    badge: 'Oral Practice',
    href: '/tool/viva-simulator',
    icon: Mic,
    gradient: 'from-amber-400 to-yellow-500',
  },
  {
    id: 'siwes-logbook',
    name: 'SIWES Weekly Logbook',
    category: 'defense-siwes',
    categoryLabel: 'SIWES / IT',
    description: '12–24 weeks of Monday–Friday daily logs, schematics & remarks.',
    badge: 'Weekly Logs',
    href: '/tool/siwes-logbook',
    icon: BookOpen,
    gradient: 'from-teal-400 to-emerald-500',
  },
  {
    id: 'itf-report',
    name: 'ITF Technical Report',
    category: 'defense-siwes',
    categoryLabel: 'SIWES / IT',
    description: 'Comprehensive 5-chapter industrial training defense document.',
    badge: 'Final Defense',
    href: '/tool/itf-report',
    icon: FileCheck,
    gradient: 'from-fuchsia-500 to-purple-600',
  },
  {
    id: 'assignment-solver',
    name: 'Assignment Solver',
    category: 'coursework',
    categoryLabel: 'Coursework',
    description: 'Step-by-step solutions for advanced engineering, math & proofs.',
    badge: 'Step-by-Step',
    href: '/tool/assignment-solver',
    icon: Calculator,
    gradient: 'from-sky-400 to-cyan-600',
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
  const { user, logout, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const paymentRef = searchParams.get('ref');
  const paymentStatus = searchParams.get('payment');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentCredits = user?.credits ?? 15;
  const [animatedCredits, setAnimatedCredits] = useState(currentCredits);
  const [progressWidth, setProgressWidth] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [demoBanner, setDemoBanner] = useState<string | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'capstone' | 'defense-siwes' | 'coursework'>('all');

  // Live Neon DB projects state
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);

  // Fetch live projects from Neon PostgreSQL and sync user credits
  useEffect(() => {
    let isMounted = true;

    if (refreshUser) {
      refreshUser().catch(() => {});
    }

    async function loadNeonProjects() {
      setIsLoadingProjects(true);
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.projects)) {
          if (data.projects.length > 0) {
            const mapped: Project[] = data.projects.slice(0, 5).map((p: any) => {
              let tag = 'DOCX';
              let tagColor = 'bg-blue-600 text-white';
              let href = '/studio';
              let size = p.metadata?.size || '2.4 MB';

              if (p.toolId === 'software-builder' || p.toolId === 'softwareBuilder' || p.fileType === 'zip') {
                tag = 'ZIP';
                tagColor = 'bg-emerald-600 text-white';
                href = '/tool/software-builder';
                size = p.metadata?.size || '4.2 MB';
              } else if (p.toolId === 'viva-presentation' || p.toolId === 'vivaPresentation' || p.fileType === 'pptx') {
                tag = 'PPT';
                tagColor = 'bg-purple-600 text-white';
                href = '/tool/viva-presentation';
                size = p.metadata?.size || '1.8 MB';
              } else if (p.toolId === 'siwes-logbook' || p.toolId === 'siwesLogbook') {
                tag = 'SIWES';
                tagColor = 'bg-amber-600 text-white';
                href = '/tool/siwes-logbook';
                size = p.metadata?.size || '1.5 MB';
              } else if (p.toolId === 'itf-report' || p.toolId === 'itfReport') {
                tag = 'ITF';
                tagColor = 'bg-amber-700 text-white';
                href = '/tool/itf-report';
                size = p.metadata?.size || '1.3 MB';
              } else if (p.toolId === 'viva-simulator' || p.toolId === 'vivaSimulator') {
                tag = 'VIVA';
                tagColor = 'bg-rose-600 text-white';
                href = '/tool/viva-simulator';
                size = 'Session';
              } else if (p.toolId === 'assignment-solver') {
                tag = 'SOLVER';
                tagColor = 'bg-cyan-600 text-white';
                href = '/tool/assignment-solver';
                size = p.metadata?.size || '1.1 MB';
              } else {
                tag = 'FYP';
                tagColor = 'bg-blue-600 text-white';
                href = '/studio';
              }

              const date = p.createdAt
                ? new Date(p.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recently';

              return {
                id: p.id,
                toolId: p.toolId || 'thesis',
                title: p.title,
                fileType: (p.fileType as any) || 'docx',
                date,
                size,
                tag,
                tagColor,
                href,
              };
            });
            setRecentProjects(mapped);
          } else {
            setRecentProjects([]);
          }
        }
      } catch (err) {
        console.error('Failed to load live Neon projects:', err);
      } finally {
        if (isMounted) setIsLoadingProjects(false);
      }
    }

    loadNeonProjects();

    return () => {
      isMounted = false;
    };
  }, [user?.id, refreshUser]);

  // Animate credits counter on mount or user credit change
  useEffect(() => {
    let start = 0;
    const duration = 800;
    const stepTime = 40;
    const steps = Math.max(1, duration / stepTime);
    const target = currentCredits;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setAnimatedCredits(target);
        clearInterval(timer);
      } else {
        setAnimatedCredits(Math.floor(start));
      }
    }, stepTime);

    // Animate progress bar fill proportional to 50 max baseline
    const progressTimer = setTimeout(() => {
      setProgressWidth(Math.min(100, Math.max(15, Math.round((target / 50) * 100))));
    }, 200);

    return () => {
      clearInterval(timer);
      clearTimeout(progressTimer);
    };
  }, [currentCredits]);

  const authError = searchParams.get('error');

  useEffect(() => {
    if (authError === 'unauthorized') {
      setDemoBanner('Access Denied: Administrative privileges required to access the admin portal.');
    } else if (paymentRef) {
      setDemoBanner('Verifying your payment with Paystack secure gateway...');
      fetch(`/api/payments/paystack/verify?reference=${encodeURIComponent(paymentRef)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setDemoBanner(`Payment confirmed! ${data.creditsAdded || 15} academic generation credits added to your account.`);
            if (refreshUser) refreshUser();
          } else {
            setDemoBanner(`Payment status: ${data.message || 'Payment reference processed.'}`);
          }
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('ref');
            url.searchParams.delete('payment');
            url.searchParams.delete('reference');
            window.history.replaceState({}, '', url.pathname);
          }
        })
        .catch((err) => {
          console.error('Error verifying Paystack reference:', err);
          setDemoBanner('Could not finalize automatic payment verification. Please check your billing tab.');
        });
    }
  }, [authError, paymentRef, refreshUser]);

  return (
    <div className="h-screen bg-[#F1F5F9] text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-cyan-500 selection:text-white overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          1. LEFT FIXED SIDEBAR (Midnight Navy #070F2B)
      ─────────────────────────────────────────────────────────────── */}
      <aside
        className={`bg-[#070F2B] text-slate-300 flex-shrink-0 hidden lg:flex flex-col justify-between p-3.5 h-full border-r border-slate-800/80 relative overflow-hidden z-20 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-[270px]'
        }`}
      >
        {/* Subtle Ambient Cyan Glow Orb at Bottom Left */}
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

        {/* Top Brand Section & Nav */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'} px-1 py-2.5 mb-2`}>
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
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
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

          {/* Primary Tool Navigation by Categorized Sections */}
          <nav className="space-y-3">
            {navSections.map((section, idx) => (
              <div key={section.title} className="space-y-1">
                {!isSidebarCollapsed && (
                  <div className={`text-[10px] font-bold text-slate-400/80 uppercase tracking-wider px-3.5 ${idx > 0 ? 'pt-2' : 'pt-0.5'} pb-1`}>
                    {section.title}
                  </div>
                )}
                {section.items.map((item) => {
                  const IconComp = item.icon;
                  const isActive = item.id === 'dashboard';
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      prefetch={false}
                      title={`${item.label}${item.desc ? ` (${item.desc})` : ''}`}
                      className={`flex items-center rounded-xl text-sm font-medium transition-all active:scale-95 group ${
                        isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white font-semibold shadow-md shadow-sky-600/20'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <IconComp
                          className={`w-4 h-4 flex-shrink-0 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:' + item.color
                          } transition-colors`}
                        />
                        {!isSidebarCollapsed && <span className="truncate text-xs">{item.label}</span>}
                      </div>
                      {!isSidebarCollapsed && item.badge && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-400/15 border border-cyan-400/30 text-cyan-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
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
          <Link
            href="/settings"
            title="Student Profile & Settings"
            className={`flex items-center rounded-xl hover:bg-white/5 transition-colors cursor-pointer ${
              isSidebarCollapsed ? 'justify-center p-1.5' : 'justify-between px-2 py-1.5'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/60 flex-shrink-0">
                <Image
                  src={
                    user?.email === 'imusa@futa.edu.ng'
                      ? '/assets/avatar_ibrahim.jpg'
                      : '/assets/avatar_adebayo.jpg'
                  }
                  alt="Student Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              {!isSidebarCollapsed && (
                <div className="leading-tight overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.fullName || 'Student Scholar'}
                  </p>
                  <p className="text-[10px] text-cyan-300/80 truncate">
                    {user?.institution
                      ? user.institution.includes('FUTA')
                        ? 'FUTA Student'
                        : user.institution.includes('UNILAG')
                        ? 'UNILAG Student'
                        : user.institution
                      : 'Active Student'}
                  </p>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
          </Link>

          {!isSidebarCollapsed && (
            <div className="mt-1 px-2 flex items-center justify-between">
              <button
                onClick={() => logout()}
                className="text-[11px] text-slate-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors py-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3 text-slate-400" />
                <span>Logout &rarr;</span>
              </button>
              <Link
                href="/auth/login?switch=true"
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Switch Account
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE SLIDE-OVER DRAWER (Midnight Navy #070F2B)
      ─────────────────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[280px] bg-[#070F2B] text-slate-300 flex flex-col justify-between p-4 shadow-2xl z-10 overflow-y-auto animate-fadeIn">
            <div>
              {/* Header with Brand & Close Button */}
              <div className="flex items-center justify-between px-1 py-2 mb-4 border-b border-slate-800/80 pb-3">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-cyan-400/30 flex-shrink-0">
                    <Image
                      src="/assets/logo_codethesis_3d.jpg"
                      alt="CodeThesis AI 3D Logo"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm">CodeThesis</span>
                      <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">AI</span>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Primary Nav by Categorized Sections */}
              <nav className="space-y-3">
                {navSections.map((section, idx) => (
                  <div key={section.title} className="space-y-1">
                    <div className={`text-[10px] font-bold text-slate-400/80 uppercase tracking-wider px-3 ${idx > 0 ? 'pt-2' : 'pt-0.5'} pb-1`}>
                      {section.title}
                    </div>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.id === 'dashboard';
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white shadow-md'
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>

              <div className="border-t border-slate-800/80 my-3 mx-1" />

              {/* Mobile Secondary Nav */}
              <div className="space-y-1">
                <Link
                  href="/projects"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5"
                >
                  <FolderGit2 className="w-4 h-4 text-slate-400" />
                  <span>My Projects</span>
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5"
                >
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span>Billing & Credits</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/support"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5"
                >
                  <Headphones className="w-4 h-4 text-slate-400" />
                  <span>Help & Support</span>
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-white hover:bg-white/5"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Admin Controls</span>
                </Link>
              </div>
            </div>

            {/* Mobile User Profile Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[160px]">{user?.fullName || 'Scholar'}</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  {currentCredits} Credits
                </span>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-[11px] text-slate-400 hover:text-rose-300 flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA (Clean Academic Slate #F1F5F9)
      ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#F1F5F9]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200/80 gap-3">
          {/* Left Search Cluster & Mobile Menu Toggle */}
          <div className="flex items-center gap-3 w-full max-w-lg">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 shadow-xs flex items-center justify-center flex-shrink-0 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
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
          <div className="flex items-center gap-3 relative">
            <NotificationBell align="right" />

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
                  Welcome back, <span className="text-[#38BDF8]">{user?.fullName ? user.fullName.trim().split(/\s+/)[0] : 'Scholar'}</span>! 👋
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
                    onClick={() => setShowDemoModal(true)}
                    className="border border-white/40 hover:bg-white/10 text-white font-semibold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center">
                      <Play className="w-2 h-2 fill-white text-white ml-0.5" />
                    </div>
                    <span>Watch Demo</span>
                  </button>
                </div>
              </div>

              {/* Center-Right 3D Visual Centerpiece (Increased Size) */}
              <div className="lg:col-span-5 relative flex items-end justify-center lg:justify-end">
                <div className="relative w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[500px] h-[210px] sm:h-[240px] lg:h-[270px] -my-2 lg:-my-4 animate-float drop-shadow-[0_20px_35px_rgba(2,132,199,0.45)] scale-105 sm:scale-110 lg:scale-115 origin-bottom-right">
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
            {/* Left Tool Suite (Flagship Studio + 8 Specialized Tools) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Flagship All-In-One Studio Hero Card */}
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Flagship All-In-One Workspace</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      Academic Studio: Build Your Entire Project In One Place
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Synchronize your 5-chapter thesis document, full-stack runnable software, UML architectural diagrams, and viva defense slides in a single integrated project session.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-cyan-200/90 font-medium">
                      <span className="bg-white/10 px-2 py-0.5 rounded-md">Chapters 1–5 Writer</span>
                      <span className="bg-white/10 px-2 py-0.5 rounded-md">Full-Stack Code Builder</span>
                      <span className="bg-white/10 px-2 py-0.5 rounded-md">4 UML Architecture Diagrams</span>
                      <span className="bg-white/10 px-2 py-0.5 rounded-md">15 Defense Slides</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link
                      href="/studio"
                      prefetch={false}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-95 group-hover:shadow-cyan-500/40 cursor-pointer"
                    >
                      <span>Launch Academic Studio</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Specialized Tools Header & Category Tabs */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        Specialized Project Generators
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Dedicated standalone tools for each academic deliverable and defense milestone.
                      </p>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { id: 'all', label: `All Tools (${ACADEMIC_TOOLS.length})` },
                      { id: 'capstone', label: 'Capstone (3)' },
                      { id: 'defense-siwes', label: 'Defense & SIWES (4)' },
                      { id: 'coursework', label: 'Coursework (1)' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedCategory(tab.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                          selectedCategory === tab.id
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtered Tool Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {ACADEMIC_TOOLS.filter((tool) => {
                    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
                    const matchesSearch =
                      !searchQuery.trim() ||
                      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesCategory && matchesSearch;
                  }).map((tool) => {
                    const IconComp = tool.icon;
                    return (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        prefetch={false}
                        className="group bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5 transition-all flex flex-col justify-between active:scale-98"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            {/* Custom Tool Squircle Badge */}
                            <div
                              className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${tool.gradient} text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                            >
                              <IconComp className="w-5.5 h-5.5 stroke-[2.2]" />
                            </div>

                            {/* Output Badge */}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              {tool.badge}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded">
                                {tool.categoryLabel}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {tool.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                              {tool.description}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Action Row */}
                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-blue-600">
                          <span>Open Tool &rarr;</span>
                          <div className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
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
                <div className="w-full bg-black/25 rounded-full h-2 mb-4 overflow-hidden">
                  <div
                    className="bg-[#00E5FF] h-2 rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(0,229,255,0.8)]"
                    style={{ width: `${Math.max(progressWidth, 68)}%` }}
                  />
                </div>

                <Link
                  href="/pricing"
                  prefetch={false}
                  className="w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-2.5 px-4 rounded-full text-xs shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <span>Buy More Credits</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* "Recent Projects" Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Recent Projects</h3>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      Neon DB
                    </span>
                  </div>
                  <Link
                    href="/projects"
                    prefetch={false}
                    className="text-[11px] sm:text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View All &rarr;
                  </Link>
                </div>

                <div className="space-y-3">
                  {isLoadingProjects ? (
                    <div className="space-y-2.5 py-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex items-center justify-between p-2 rounded-xl bg-slate-50">
                          <div className="flex items-center gap-2.5 flex-1 pr-2">
                            <div className="w-8 h-5 rounded bg-slate-200" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3 bg-slate-200 rounded w-3/4" />
                              <div className="h-2 bg-slate-100 rounded w-1/2" />
                            </div>
                          </div>
                          <div className="w-12 h-6 rounded-full bg-slate-200" />
                        </div>
                      ))}
                    </div>
                  ) : recentProjects.length === 0 ? (
                    <div className="py-6 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">No projects yet</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 mb-2.5">Generate your thesis, SIWES, or defense deck</p>
                      <Link
                        href="/studio"
                        prefetch={false}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 transition"
                      >
                        <span>Start Project</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ) : (
                    recentProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span
                            className={`text-[9px] font-black px-2 py-1 rounded-md flex-shrink-0 ${proj.tagColor}`}
                          >
                            {proj.tag}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors" title={proj.title}>
                              {proj.title}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {proj.date} &bull; {proj.size}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {proj.id && !proj.id.startsWith('proj-1') && !proj.id.startsWith('proj-2') && !proj.id.startsWith('proj-3') && (
                            <a
                              href={`/api/projects/${proj.id}/download`}
                              download
                              title="Direct Download"
                              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <Link
                            href={proj.href}
                            prefetch={false}
                            className="text-[11px] font-semibold text-blue-600 hover:bg-blue-100 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/80 transition-colors"
                          >
                            Open
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Card 1: Why Choose CodeThesis AI? (5 Cols) */}
            <div className="md:col-span-5 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#060D24] via-[#07133A] to-[#0A1A4A] border border-blue-900/60 p-5 sm:p-6 text-white flex flex-col justify-between shadow-sm min-h-[235px] h-full group">
              {/* 3D Growth Chart with Floating Graduation Cap on Right */}
              <div className="absolute right-0 top-0 bottom-0 w-[44%] pointer-events-none z-0 overflow-hidden">
                <Image
                  src="/assets/growth_chart_3d.jpg"
                  alt="3D Growth Chart and Graduation Cap"
                  fill
                  className="object-cover object-center scale-105"
                  priority
                />
                {/* Seamless gradient fade on the left edge into the card background */}
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#060D24] via-[#07133A]/80 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#060D24]/60 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#0A1A4A]/60 to-transparent pointer-events-none" />
              </div>

              {/* Left Content Column */}
              <div className="relative z-10 max-w-[58%] flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white mb-3 tracking-tight">
                    Why Choose CodeThesis AI?
                  </h3>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-[10px] sm:text-[11px] text-slate-200 mb-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 stroke-[3]" />
                        <span className="truncate">AI-Powered Gen</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 stroke-[3]" />
                        <span className="truncate">100% Academic</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 stroke-[3]" />
                        <span className="truncate">Instant Download</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 stroke-[3]" />
                        <span className="truncate">Secure & Reliable</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 stroke-[3]" />
                        <span className="truncate">Paystack & Stripe</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 stroke-[3]" />
                        <span className="truncate">24/7 Support</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/studio"
                    prefetch={false}
                    className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-full text-xs shadow-md gold-shimmer inline-flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2: What Our Students Say (4 Cols) */}
            <div className="md:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between min-h-[235px] h-full">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-2">What Our Students Say</h3>

                <div className="flex items-start gap-1 mb-3">
                  <span className="text-2xl font-serif text-blue-500 font-black leading-none select-none">“</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {TESTIMONIALS[activeTestimonial].quote}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {/* Left: Student Profile */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 flex-shrink-0">
                    <Image
                      src={TESTIMONIALS[activeTestimonial].avatar}
                      alt={TESTIMONIALS[activeTestimonial].author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate">
                      {TESTIMONIALS[activeTestimonial].author}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight truncate">
                      {TESTIMONIALS[activeTestimonial].dept}
                    </p>
                  </div>
                </div>

                {/* Center: Carousel Pagination Dots */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {TESTIMONIALS.map((t, idx) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTestimonial(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        activeTestimonial === idx ? 'w-4 bg-blue-600' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                      }`}
                      aria-label={`View testimonial ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Right: 5 Stars */}
                <div className="flex text-amber-400 flex-shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>

            {/* Card 3: Need Help? Support Card (3 Cols) */}
            <div className="md:col-span-3 bg-gradient-to-br from-[#EBF3FC] via-[#E2EEFB] to-[#D5E5F9] border border-blue-200/70 rounded-3xl p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between shadow-xs min-h-[235px] h-full">
              <div className="relative z-10 max-w-[140px] sm:max-w-[150px] flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-2 text-slate-900 mb-1">
                    <Headphones className="w-4 h-4 text-slate-800" />
                    <h3 className="text-xs sm:text-sm font-bold tracking-tight">Need Help?</h3>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug mt-1 mb-4">
                    Our support team is always ready to help you.
                  </p>
                </div>

                <div>
                  <Link
                    href="/support"
                    prefetch={false}
                    className="inline-flex items-center gap-1.5 bg-[#070F2B] hover:bg-[#0E1A3D] text-white font-semibold px-4 py-2 rounded-full text-xs shadow-sm transition-transform active:scale-95 whitespace-nowrap"
                  >
                    <span>Contact Support</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 3D Female Support Specialist Avatar with Thumbs Up - Anchored flush to bottom right */}
              <div className="absolute -bottom-1 -right-1 w-[140px] sm:w-[155px] lg:w-[165px] h-[170px] sm:h-[185px] lg:h-[200px] flex-shrink-0 pointer-events-none z-0 drop-shadow-md">
                <Image
                  src="/assets/women.png"
                  alt="3D Support Specialist in Blue Hijab"
                  fill
                  className="object-contain object-bottom-right"
                  priority
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

        {/* Interactive Walkthrough Demo Modal */}
        {showDemoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                    <Play className="w-4 h-4 fill-sky-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">CodeThesis AI Walkthrough</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Quick 2-minute architectural overview</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 space-y-1">
                  <h4 className="font-bold text-sky-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>1. 5-Chapter Thesis Generator</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Compiles ~18,000-word NUC standard dissertations with APA 7th citations, empirical literature reviews, and 1.5-inch hardcover margins.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                  <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>2. Software Builder</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Builds zero-pip turnkey Python + SQLite desktop & web applications with instant code ZIP downloads.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 space-y-1">
                  <h4 className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Presentation className="w-3.5 h-3.5 text-purple-600" />
                    <span>3. Viva Defense Oral Simulator</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Practice defending your project against simulated strict external examiners with scoring and feedback.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href="/studio"
                  onClick={() => setShowDemoModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                >
                  Launch Workspace &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
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
