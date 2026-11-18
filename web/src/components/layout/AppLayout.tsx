'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Search,
  Bell,
  PanelLeftClose,
  PanelLeft,
  ShieldAlert,
  Coins,
  LogOut,
  Menu,
  Terminal,
  X
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  activeItem?: string;
  title?: string;
  subtitle?: string;
  hideHeader?: boolean;
  hideSidebar?: boolean;
  fullWidth?: boolean;
  hideFooter?: boolean;
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


export default function AppLayout({
  children,
  activeItem = 'dashboard',
  title,
  subtitle,
  hideHeader = false,
  hideSidebar = false,
  fullWidth = false,
  hideFooter = false,
}: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const userCredits = user?.credits ?? 15;
  const studentName = user?.fullName || 'Student Scholar';

  const primaryNavItems: NavItem[] = [
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
    { id: 'developers', label: 'Developer API', href: '/developers', icon: Terminal },
    { id: 'pricing', label: 'Billing & Credits', href: '/pricing', icon: CreditCard },
    { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
    { id: 'support', label: 'Help & Support', href: '/support', icon: Headphones },
    ...(user?.role === 'admin'
      ? [{ id: 'admin', label: 'Admin Controls', href: '/admin', icon: ShieldAlert, highlight: true }]
      : []),
  ];

  return (
    <div className="h-screen bg-[#F1F5F9] text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-cyan-500 selection:text-white overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          1. LEFT FIXED SIDEBAR (Midnight Navy #070F2B) - Desktop
      ─────────────────────────────────────────────────────────────── */}
      {!hideSidebar && (
        <aside
          className={`bg-[#070F2B] text-slate-300 flex-shrink-0 hidden lg:flex flex-col justify-between p-3.5 h-full border-r border-slate-800/80 relative overflow-hidden z-20 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-[270px]'
          }`}
        >
        {/* Subtle Ambient Cyan Glow Orb at Bottom Left */}
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

        {/* Top Brand Section & Collapse Button */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'
            } px-1 py-2.5 mb-2`}
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

          {/* Primary Tool Navigation */}
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeItem === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  prefetch={false}
                  title={item.label}
                  className={`flex items-center rounded-xl text-xs font-medium transition-all active:scale-95 group ${
                    isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2'
                  } ${
                    isActive
                      ? 'bg-[#0091FF] text-white font-semibold shadow-md shadow-blue-500/25'
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
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/60 flex-shrink-0 bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                {user?.fullName ? (
                  <span>{user.fullName.trim()[0].toUpperCase()}</span>
                ) : (
                  <Image
                    src="/assets/avatar_adebayo.jpg"
                    alt="Student Avatar"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              {!isSidebarCollapsed && (
                <div className="leading-tight overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{studentName}</p>
                  <p className="text-[10px] text-cyan-300/80 truncate">
                    {user?.institution || 'Student'}
                  </p>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            )}
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
      )}

      {/* ─────────────────────────────────────────────────────────────
          MOBILE SLIDE-OVER DRAWER (Midnight Navy #070F2B)
      ─────────────────────────────────────────────────────────────── */}
      {!hideSidebar && isMobileMenuOpen && (
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

              {/* Mobile Primary Nav */}
              <nav className="space-y-1">
                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#0091FF] text-white font-semibold shadow-md'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-slate-800/80 my-3 mx-1" />

              {/* Mobile Secondary Nav */}
              <div className="space-y-1">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white'
                          : item.highlight
                          ? 'text-amber-300 hover:text-white hover:bg-white/5 font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile User Profile Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] text-slate-400 font-medium truncate max-w-[160px]">{studentName}</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  {userCredits} Credits
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
          2. MAIN CONTENT AREA (Academic Slate #F1F5F9)
      ─────────────────────────────────────────────────────────────── */}
      <main className={`flex-1 flex flex-col min-w-0 h-full ${fullWidth ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {!hideHeader && (
          <header className="sticky top-0 z-30 bg-[#F1F5F9]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200/80 gap-3 transition-colors duration-200">
            {/* Left Search Cluster & Mobile Hamburger or Brand */}
            <div className="flex items-center gap-3 w-full max-w-lg">
              {!hideSidebar ? (
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900 shadow-xs flex items-center justify-center flex-shrink-0 cursor-pointer"
                  aria-label="Open Navigation Menu"
                >
                  <Menu className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 mr-2 text-slate-800 hover:text-indigo-600 font-bold text-sm transition-colors flex-shrink-0 group"
                  title="Return to Dashboard"
                >
                  <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-cyan-400/30 shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Image
                      src="/assets/logo_codethesis_3d.jpg"
                      alt="CodeThesis AI"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="hidden sm:inline font-black tracking-tight text-slate-900 group-hover:text-indigo-600">
                    CodeThesis <span className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs">AI</span>
                  </span>
                </Link>
              )}
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/projects?search=${encodeURIComponent(searchQuery.trim())}`;
                    }
                  }}
                  placeholder="Search tools, projects, or features... (Ctrl + K)"
                  className="w-full bg-white border border-slate-200/90 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 relative">
              <NotificationBell align="right" />

              {/* Live Academic Credit Badge */}
              <Link
                href="/pricing"
                prefetch={false}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 font-bold text-xs hover:bg-amber-500/20 transition-all shadow-2xs"
                title="Academic Generation Credits — Click to Manage or Recharge"
              >
                <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                <span>{userCredits} Credits</span>
              </Link>

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
        {fullWidth ? (
          <div className="flex-1 w-full min-h-0 flex flex-col overflow-hidden">
            {children}
          </div>
        ) : (
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
            {!hideFooter && (
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
            )}
          </div>
        )}
      </main>
    </div>
  );
}
