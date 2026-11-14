'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
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
  Search,
  Bell,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  ShieldAlert
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  activeItem?: string;
  title?: string;
  subtitle?: string;
  hideHeader?: boolean;
}

export default function AppLayout({
  children,
  activeItem = 'dashboard',
  title,
  subtitle,
  hideHeader = false,
}: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-sky-400' },
    { id: 'studio', label: 'Academic Studio', href: '/studio', icon: GraduationCap, color: 'text-cyan-400' },
    { id: 'thesis', label: 'Thesis Generator', href: '/tool/thesis', icon: FileText, color: 'text-amber-400' },
    { id: 'software-builder', label: 'Software Builder', href: '/tool/software-builder', icon: Code2, color: 'text-emerald-400' },
    { id: 'uml-diagrams', label: 'UML Diagrams', href: '/tool/uml-diagrams', icon: GitFork, color: 'text-purple-400' },
    { id: 'viva-presentation', label: 'Viva Presentation', href: '/tool/viva-presentation', icon: Presentation, color: 'text-blue-400' },
    { id: 'viva-simulator', label: 'Viva Simulator', href: '/tool/viva-simulator', icon: Mic, color: 'text-yellow-400' },
    { id: 'siwes-logbook', label: 'SIWES Logbook', href: '/tool/siwes-logbook', icon: BookOpen, color: 'text-teal-400' },
    { id: 'itf-report', label: 'ITF Report', href: '/tool/itf-report', icon: FileCheck, color: 'text-fuchsia-400' },
    { id: 'assignment-solver', label: 'Assignment Solver', href: '/tool/assignment-solver', icon: Calculator, color: 'text-sky-400' },
  ];

  const secondaryItems = [
    { id: 'projects', label: 'My Projects', href: '/projects', icon: FolderGit2 },
    { id: 'pricing', label: 'Billing & Credits', href: '/pricing', icon: CreditCard },
    { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
    { id: 'support', label: 'Help & Support', href: '/support', icon: Headphones },
    { id: 'admin', label: 'Admin Controls', href: '/admin', icon: ShieldAlert, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#070F2B] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-200">
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
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'
            } px-1 py-2.5 mb-3`}
          >
            <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
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
                    <span className="font-bold text-white text-base tracking-tight whitespace-nowrap">
                      CodeThesis
                    </span>
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                      AI
                    </span>
                  </div>
                  <p className="text-[9px] tracking-wider uppercase text-cyan-300/80 font-medium mt-0.5 whitespace-nowrap">
                    Build • Document • Defend
                  </p>
                </div>
              )}
            </Link>

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
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeItem === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  prefetch={false}
                  title={item.label}
                  className={`flex items-center rounded-xl text-sm font-medium transition-all active:scale-95 group ${
                    isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white font-semibold shadow-md shadow-sky-600/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComp
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:' + item.color
                    } transition-colors`}
                  />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Subtle Horizontal Divider */}
          <div className="border-t border-slate-800/80 my-3 mx-1" />

          {/* Secondary Account Links */}
          <div className="space-y-1">
            {secondaryItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeItem === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  prefetch={false}
                  title={item.label}
                  className={`flex items-center rounded-xl text-xs font-medium transition-all active:scale-95 ${
                    isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white font-semibold shadow-xs'
                      : item.highlight
                      ? 'text-amber-300 hover:text-white hover:bg-white/5 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComp
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
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
            {!isSidebarCollapsed && (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            )}
          </Link>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA (Academic Slate #F1F5F9)
      ─────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {!hideHeader && (
          <header className="sticky top-0 z-30 bg-[#F1F5F9]/90 dark:bg-[#070F2B]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 gap-3 transition-colors duration-200">
            {/* Left Search & Toggle */}
            <div className="flex items-center gap-3 w-full max-w-lg">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 rounded-xl bg-white dark:bg-[#0E1738] border border-slate-200/90 dark:border-[#1E2D58] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-transform active:scale-95 flex items-center justify-center flex-shrink-0"
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isSidebarCollapsed ? (
                  <PanelLeft className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>

              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tools, projects, or features... (Ctrl + K)"
                  className="w-full bg-white dark:bg-[#0E1738] border border-slate-200/90 dark:border-[#1E2D58] rounded-full pl-10 pr-4 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  alert('3 Notifications: 1) E-commerce thesis docx compiled, 2) Viva simulator ready, 3) +15 Credits loaded.')
                }
                className="relative p-2 rounded-full bg-white dark:bg-[#0E1738] border border-slate-200/80 dark:border-[#1E2D58] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition-transform active:scale-95"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-white dark:bg-[#0E1738] border border-slate-200/80 dark:border-[#1E2D58] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white shadow-xs transition-transform active:scale-95 flex items-center justify-center"
                aria-label={`Toggle theme (currently ${resolvedTheme})`}
                title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600 hover:text-blue-600" />
                )}
              </button>

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
        )}

        {/* Page Content Viewport */}
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col justify-between">
          <div>
            {title && (
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {title}
                </h1>
                {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
              </div>
            )}
            {children}
          </div>

          {/* Minimal Academic Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">CodeThesis AI</span>
              <span>•</span>
              <span>Commercial Academic SaaS for Nigerian Tertiary Institutions</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-medium">
              <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
              <Link href="/contact" className="hover:text-slate-900 transition-colors">Campus Liaisons</Link>
              <Link href="/auth/login" className="hover:text-slate-900 transition-colors">Student Login</Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
