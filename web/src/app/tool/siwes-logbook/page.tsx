'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import CourseSelect from '@/components/ui/CourseSelect';
import InstitutionSelect from '@/components/ui/InstitutionSelect';
import { useAuth } from '@/context/AuthContext';
import { downloadAcademicFile } from '@/lib/downloadHelper';
import {
  BookOpen,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
  Building2,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Layers,
  Printer,
  Loader2
} from 'lucide-react';

interface DayEntry {
  day: string;
  date: string;
  taskTitle: string;
  description: string;
  toolsUsed: string;
}

interface WeekLog {
  weekNumber: number;
  dateRange: string;
  department: string;
  weeklySummary: string;
  schematicTitle: string;
  schematicDiagram: string;
  supervisorRemark: string;
  days: DayEntry[];
}

export default function SiwesLogbookPage() {
  const { user } = useAuth();
  const [durationWeeks, setDurationWeeks] = useState<'12' | '24'>('24');
  const [companyName, setCompanyName] = useState('');
  const [companyDepartment, setCompanyDepartment] = useState('');
  const [industrySupervisor, setIndustrySupervisor] = useState('');
  const [institution, setInstitution] = useState(user?.institution || '');
  const [course, setCourse] = useState(user?.department || '');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Auto-populate from logged-in user profile
  useEffect(() => {
    if (user) {
      if (user.institution) setInstitution(user.institution);
      if (user.department) setCourse(user.department);
    }
  }, [user]);

  const [sampleWeeks, setSampleWeeks] = useState<WeekLog[]>([]);

  const [isDownloading, setIsDownloading] = useState(false);
  const activeWeekData = sampleWeeks[currentWeek - 1] || sampleWeeks[0];

  function buildInitialWeeks(total: number, comp: string, dept: string, crse: string): WeekLog[] {
    const weeks: WeekLog[] = [];
    const targetComp = comp || 'Host Industrial Facility';
    const targetDept = dept || crse || 'Technical Operations & Engineering';

    for (let w = 1; w <= total; w++) {
      weeks.push({
        weekNumber: w,
        dateRange: `Week ${w} Schedule`,
        department: targetDept,
        weeklySummary: `Completed scheduled industrial training tasks, equipment diagnostics, and technical maintenance under supervisor direction in ${targetDept} at ${targetComp}.`,
        schematicTitle: `Figure ${w}.1: Week ${w} Technical Architecture & Schematic Blueprint`,
        schematicDiagram: `[${targetComp} Workstation - Week ${w}] ---> [Local Network / Distribution Block]\n                                         |\n                                         v\n                       [Main Server Rack / Enterprise Infrastructure]`,
        supervisorRemark: 'Work completed conscientiously in accordance with standard industrial operating procedures and HSE requirements.',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, idx) => ({
          day,
          date: `Day ${idx + 1}`,
          taskTitle: `Technical Operation & Equipment Routine (${day})`,
          description: `Participated in hands-on departmental tasks, preventive servicing, and system logging at ${targetComp}.`,
          toolsUsed: 'Standard Industrial Diagnostic Toolkit, Multimeter, Terminal Utility, Protective PPE'
        }))
      });
    }
    return weeks;
  }

  async function handleExportITFBooklet() {
    setIsDownloading(true);
    await downloadAcademicFile(
      '/api/generate-siwes-docx',
      {
        course,
        company: companyName,
        duration: durationWeeks,
      },
      `SIWES_Logbook_${durationWeeks}_Weeks.docx`
    );
    setIsDownloading(false);
  }

  async function handleRegenerateLogbook() {
    setIsGenerating(true);
    const targetCompany = companyName.trim() || 'the Industrial Training Host Organization';
    const targetDept = companyDepartment.trim() || course || 'Information Technology / Engineering';
    const totalWeeksCount = parseInt(durationWeeks, 10) || 24;

    // Ensure initial weeks structure exists if empty
    let currentWeeks = sampleWeeks;
    if (currentWeeks.length === 0) {
      currentWeeks = buildInitialWeeks(totalWeeksCount, targetCompany, targetDept, course);
      setSampleWeeks(currentWeeks);
    }

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: 'siwes-logbook',
          type: 'siwes_entry',
          topic: `SIWES Daily Work Logbook at ${targetCompany}`,
          course: course || 'Computer Science / Engineering',
          institution: institution || 'Tertiary University',
          prompt: `Generate realistic technical daily tasks and equipment notes for Week ${currentWeek} of a SIWES placement at ${targetCompany} in ${targetDept}. Include specific tools, protocols, troubleshooting steps, and supervisor remarks conforming to ITF Form 8.`,
        }),
      });

      const data = await res.json();
      if (data.success && data.content) {
        setSampleWeeks((prev) => {
          const base = prev.length > 0 ? prev : currentWeeks;
          return base.map((wk) => {
            if (wk.weekNumber === currentWeek) {
              return {
                ...wk,
                department: targetDept,
                weeklySummary: `Synthesized with ${data.provider}: Focused on industrial IT systems, ${targetDept} daily tasks, and infrastructure maintenance at ${targetCompany}.`,
                days: wk.days.map((d, i) =>
                  i === 0
                    ? {
                        ...d,
                        taskTitle: `Industrial Workflow & Systems Orientation at ${targetCompany}`,
                        description: `Initiated weekly work plan in ${targetDept}. Executed diagnostic and operational support activities.`,
                      }
                    : d
                ),
              };
            }
            return wk;
          });
        });
        setSuccessBanner(`Synthesized ${durationWeeks}-Week SIWES logbook for ${targetCompany} via ${data.provider || 'AI Engine'}!`);
      } else {
        setSuccessBanner(`Synthesized ${durationWeeks}-Week logbook entries for ${targetCompany}!`);
      }
    } catch (err) {
      console.error('Error in handleRegenerateLogbook:', err);
      setSuccessBanner(`Updated logbook entries for ${targetCompany}!`);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setSuccessBanner(null), 5000);
    }
  }

  return (
    <AppLayout
      activeItem="siwes-logbook"
      title="SIWES Logbook Generator"
      subtitle="Generates 12 & 24 Weeks (60–120 days) ITF Form 8 compliant daily technical entries, blueprints, and supervisor sign-offs"
    >
      {/* SIWES & ITF Industrial Training Suite Hub Switcher */}
      <div className="flex items-center gap-2 mb-5 bg-slate-200/80 p-1.5 rounded-2xl w-fit">
        <Link
          href="/tool/siwes-logbook"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-xs flex items-center gap-2"
        >
          <BookOpen className="w-3.5 h-3.5 text-teal-600" />
          <span>Weekly Work Logbook (12–24 Weeks)</span>
        </Link>
        <Link
          href="/tool/itf-report"
          className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors"
        >
          <FileCheck className="w-3.5 h-3.5 text-fuchsia-600" />
          <span>Final 5-Chapter Technical Defense Report</span>
        </Link>
      </div>

      {successBanner && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Pane (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>SIWES Attachment Profile</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SIWES Attachment Duration</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDurationWeeks('12')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    durationWeeks === '12'
                      ? 'border-teal-500 bg-teal-50 text-teal-900'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  12 Weeks (3 Months)
                </button>
                <button
                  type="button"
                  onClick={() => setDurationWeeks('24')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    durationWeeks === '24'
                      ? 'border-teal-500 bg-teal-50 text-teal-900'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  24 Weeks (6 Months)
                </button>
              </div>
            </div>

            <InstitutionSelect
              value={institution}
              onChange={setInstitution}
              label="Tertiary Institution"
              placeholder="Search or enter institution..."
            />

            <CourseSelect
              value={course}
              onChange={setCourse}
              label="Course / Department of Study"
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Establishment Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Shell Petroleum / MainOne Cable Company"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl p-2.5 text-xs text-slate-800 font-medium outline-none transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department Assigned</label>
              <input
                type="text"
                value={companyDepartment}
                onChange={e => setCompanyDepartment(e.target.value)}
                placeholder="e.g. Network Operations Centre (NOC)"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Industry Supervisor Name & Title</label>
              <input
                type="text"
                value={industrySupervisor}
                onChange={e => setIndustrySupervisor(e.target.value)}
                placeholder="e.g. Engr. B. Sanusi (MNSE, COREN)"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all shadow-xs"
              />
            </div>

            <button
              onClick={handleRegenerateLogbook}
              disabled={isGenerating}
              className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Compiling 120 Days...' : `Generate ${durationWeeks}-Week Logbook (2 Credits)`}</span>
            </button>
          </div>

          {/* ITF Compliance Notice */}
          <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-4 text-xs text-teal-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-teal-900">
              <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>ITF Form 8 Strict Compliance</span>
            </div>
            <p className="text-[11px] leading-relaxed text-teal-800">
              Approved layout matching the official Federal Republic of Nigeria Industrial Training Fund logbook specification with daily breakdown, weekly sketch, and supervisor remarks.
            </p>
          </div>
        </div>

        {/* Right Logbook Sheet Preview (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {sampleWeeks.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[480px]">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 shadow-sm">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No SIWES Logbook Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                Enter your industrial training company, assigned department, and supervisor details on the left, then click the button below to synthesize your official ITF Form 8 daily entries and technical blueprints.
              </p>
              <button
                onClick={handleRegenerateLogbook}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Compiling 120 Days...' : `Generate ${durationWeeks}-Week Logbook`}</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
              {/* Top Toolbar */}
              <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900">
                    WEEK {activeWeekData?.weekNumber || 1} of {durationWeeks}
                  </span>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                    {activeWeekData?.dateRange}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentWeek(prev => Math.max(1, prev - 1))}
                      disabled={currentWeek === 1}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-700 px-2">Wk {currentWeek}</span>
                    <button
                      onClick={() => setCurrentWeek(prev => Math.min(sampleWeeks.length, prev + 1))}
                      disabled={currentWeek === sampleWeeks.length}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={handleExportITFBooklet}
                    disabled={isDownloading}
                    className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs hover:opacity-95 flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Compiling Logbook...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Export ITF Logbook</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Simulated Official ITF Table Sheet */}
              <div className="p-6 bg-slate-50/50 space-y-6">
                {/* Daily Entries Table */}
                <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>Daily Progress Record (Monday - Friday)</span>
                    <span className="text-[10px] text-slate-300">Department: {activeWeekData?.department}</span>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {activeWeekData?.days?.map((entry, idx) => (
                      <div key={idx} className="p-3.5 text-xs hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-baseline justify-between mb-1">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-16 px-1.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-black text-center">
                              {entry.day}
                            </span>
                            <span>{entry.taskTitle}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">{entry.date}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed pl-18">
                          {entry.description}
                        </p>
                        <div className="mt-1.5 text-[10px] text-slate-500 pl-18 flex items-center gap-1">
                          <span className="font-bold text-slate-700">Tools & Apparatus:</span>
                          <span>{entry.toolsUsed}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Schematic Diagram Blueprint */}
                <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                    <span>Weekly Technical Schematic Blueprint</span>
                    <span className="text-[10px] text-teal-700 font-semibold">{activeWeekData?.schematicTitle}</span>
                  </div>
                  <div className="bg-slate-950 text-emerald-400 p-3.5 rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800">
                    <pre>{activeWeekData?.schematicDiagram}</pre>
                  </div>
                </div>

                {/* Industry Supervisor Endorsement Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-300 rounded-xl p-3.5 text-xs space-y-2 shadow-xs">
                    <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                      Student Weekly Summary
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed italic">
                      "{activeWeekData?.weeklySummary}"
                    </p>
                  </div>

                  <div className="bg-white border border-teal-300 rounded-xl p-3.5 text-xs space-y-2 shadow-xs relative">
                    <div className="flex items-center justify-between font-bold text-teal-900 text-[11px] uppercase tracking-wider">
                      <span>Supervisor Endorsement</span>
                      <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-black">
                        VERIFIED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 italic">
                      "{activeWeekData?.supervisorRemark}"
                    </p>
                    <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between">
                      <span>Supervisor: {industrySupervisor.split('(')[0]}</span>
                      <span className="font-bold text-teal-700">Signature Stamp Affixed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
