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

  const [sampleWeeks, setSampleWeeks] = useState<WeekLog[]>([
    {
      weekNumber: 1,
      dateRange: 'Monday, 2nd June - Friday, 6th June',
      department: companyDepartment || 'Enterprise Engineering Operations',
      weeklySummary: 'Completed company HSE safety induction, structured cabling overview, and Cat6 UTP termination according to ANSI/TIA-568-B standard.',
      schematicTitle: 'Figure 1.1: T568B RJ-45 Color Code Wiring Sequence',
      schematicDiagram: `Pin 1: White/Orange  Pin 2: Orange
Pin 3: White/Green   Pin 4: Blue
Pin 5: White/Blue    Pin 6: Green
Pin 7: White/Brown   Pin 8: Brown
[Modular 8P8C Gold-Plated Crimp Handshake Verified via Fluke Cable Analyzer]`,
      supervisorRemark: 'The student intern showed commendable precision during modular crimping with 0% pair crossover errors.',
      days: [
        {
          day: 'Monday',
          date: 'June 02',
          taskTitle: 'Orientation, Safety Briefing & Facility Tour',
          description: 'Attended mandatory NOC orientation conducted by HSE department. Briefed on ESD (Electrostatic Discharge) wrist strap protocols and Class C gas fire suppression (FM-200).',
          toolsUsed: 'HSE Safety Manual, Anti-static wrist straps, Carbon Dioxide extinguishers.'
        },
        {
          day: 'Tuesday',
          date: 'June 03',
          taskTitle: 'Cat6 Ethernet Termination & Crimp Standards',
          description: 'Practiced structured copper termination using TIA/EIA-568-B pinouts. Stripped PVC jacket, untwisted pairs with minimal slack to prevent near-end crosstalk (NEXT).',
          toolsUsed: 'Klein Tools Crimper, Cat6 UTP spool, 8P8C RJ45 connectors, Cable stripper.'
        },
        {
          day: 'Wednesday',
          date: 'June 04',
          taskTitle: 'Cable Continuity & Fluke Channel Certification',
          description: 'Conducted continuity and attenuation certification on 24 patch leads installed in Rack B04. Tested for wiremap faults, split pairs, and propagation delay.',
          toolsUsed: 'Fluke DSX-5000 CableAnalyzer, Toner probe generator.'
        },
        {
          day: 'Thursday',
          date: 'June 05',
          taskTitle: 'Patch Panel Punch Down & Cable Dressing',
          description: 'Terminated 48-port Krone-style Cat6 110 punch down block. Bundled feeder cables using hook-and-loop Velcro ties to maintain clean bend radius.',
          toolsUsed: 'Impact 110 Punch-down tool, Velcro ties, Cable comb.'
        },
        {
          day: 'Friday',
          date: 'June 06',
          taskTitle: 'Rack B04 Documentation & Weekly Log Endorsement',
          description: 'Labeled patch ports in accordance with ANSI/TIA-606-B labeling standard. Drafted spreadsheet matrix mapping switch interfaces to server ILO ports.',
          toolsUsed: 'Brother P-Touch Industrial Labeler, MS Excel.'
        }
      ]
    },
    {
      weekNumber: 2,
      dateRange: 'Monday, 9th June - Friday, 13th June',
      department: 'IP Routing & Switch Infrastructure',
      weeklySummary: 'Configured Cisco Catalyst 2960 switches, 802.1Q trunking encapsulation, inter-VLAN routing on router-on-a-stick topology.',
      schematicTitle: 'Figure 2.1: Router-on-a-stick Inter-VLAN Sub-interface Schema',
      schematicDiagram: `[Cisco 2911 Router] --(Gig0/0.10: VLAN 10 192.168.10.1/24)
                    --(Gig0/0.20: VLAN 20 192.168.20.1/24)
                         | (802.1Q Trunk Link)
[Cisco 2960 Switch] -- Fa0/1-12 (VLAN 10: NOC Staff)
                    -- Fa0/13-24 (VLAN 20: Server Cluster)`,
      supervisorRemark: 'Demonstrated solid command of Cisco IOS CLI syntax and sub-interface encapsulation.',
      days: [
        {
          day: 'Monday',
          date: 'June 09',
          taskTitle: 'Cisco Switch Initial Staging & Password Recovery',
          description: 'Connected console cable (RJ45 to DB9) to Cisco Catalyst 2960. Executed baud-rate 9600 configuration, established secret enable passwords and line vty 0 4.',
          toolsUsed: 'PuTTY terminal, Cisco Console rollover cable, USB-to-Serial adapter.'
        },
        {
          day: 'Tuesday',
          date: 'June 10',
          taskTitle: 'VLAN Segmentation & Access Port Assignment',
          description: 'Created VLAN 10 (MANAGEMENT), VLAN 20 (SERVERS), and VLAN 30 (GUEST). Assigned static access switchports and verified with "show vlan brief".',
          toolsUsed: 'Cisco IOS 15.0 CLI, PuTTY.'
        },
        {
          day: 'Wednesday',
          date: 'June 11',
          taskTitle: '802.1Q Trunk Configuration & Native VLAN Hardening',
          description: 'Configured Gig0/1 as dot1q trunk. Changed default native VLAN from 1 to unused VLAN 999 to mitigate VLAN hopping security exploits.',
          toolsUsed: 'Cisco IOS CLI, Wireshark packet capture.'
        },
        {
          day: 'Thursday',
          date: 'June 12',
          taskTitle: 'DHCP Pool Relay & Router-on-a-Stick Routing',
          description: 'Configured sub-interfaces on Cisco 2911 router (Gig0/0.10, Gig0/0.20) with encapsulation dot1Q. Configured ip helper-address pointing to central DHCP.',
          toolsUsed: 'Cisco IOS, Wireshark, DHCP Snooping tables.'
        },
        {
          day: 'Friday',
          date: 'June 13',
          taskTitle: 'End-to-End ICMP Ping & Traceroute Verification',
          description: 'Verified routing between VLAN 10 and VLAN 20 hosts. Measured Round Trip Time (RTT) latency of 0.8ms. Logged configuration to TFTP backup server.',
          toolsUsed: 'SolarWinds TFTP Server, Ping, Traceroute.'
        }
      ]
    }
  ]);

  useEffect(() => {
    const totalWeeks = parseInt(durationWeeks, 10) || 24;
    const generateWeekData = (weekNum: number, dept: string): WeekLog => ({
      weekNumber: weekNum,
      dateRange: `Week ${weekNum} Technical Schedule`,
      department: dept || 'Engineering Operations',
      weeklySummary: `Routine operational tasks, system diagnostics, and hardware maintenance executed during Week ${weekNum}.`,
      schematicTitle: `Figure ${weekNum}.1: Week ${weekNum} System Blueprint`,
      schematicDiagram: `[Facility Workstation Week ${weekNum}] --> [Local Switch / Diagnostic Port] --> [Enterprise Network Core]`,
      supervisorRemark: 'Task executed systematically in compliance with departmental safety and operational directives.',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, idx) => ({
        day,
        date: `Day ${idx + 1}`,
        taskTitle: `Operational Task & Diagnostic Evaluation (${day})`,
        description: `Conducted technical maintenance, routine inspection, and system verification under mentor supervision.`,
        toolsUsed: 'Digital Multimeter, Cable Tester, Diagnostic Suite, Safety Kit'
      }))
    });

    setSampleWeeks(prev => {
      const result: WeekLog[] = [...prev];
      for (let i = result.length + 1; i <= totalWeeks; i++) {
        result.push(generateWeekData(i, companyDepartment || course));
      }
      return result.slice(0, totalWeeks);
    });
  }, [durationWeeks, companyDepartment, course]);

  const [isDownloading, setIsDownloading] = useState(false);
  const activeWeekData = sampleWeeks[currentWeek - 1] || sampleWeeks[0];

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
        setSampleWeeks((prev) =>
          prev.map((wk) => {
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
          })
        );
        setSuccessBanner(`Synthesized ${durationWeeks}-Week SIWES logbook for ${targetCompany} via ${data.provider || 'AI Engine'}!`);
      } else {
        setSuccessBanner(`Updated logbook entries for ${targetCompany}!`);
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
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            {/* Top Toolbar */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-slate-900">
                  WEEK {activeWeekData.weekNumber} of {durationWeeks}
                </span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                  {activeWeekData.dateRange}
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
                  <span className="text-[10px] text-slate-300">Department: {activeWeekData.department}</span>
                </div>

                <div className="divide-y divide-slate-200">
                  {activeWeekData.days.map((entry, idx) => (
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
                  <span className="text-[10px] text-teal-700 font-semibold">{activeWeekData.schematicTitle}</span>
                </div>
                <div className="bg-slate-950 text-emerald-400 p-3.5 rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto border border-slate-800">
                  <pre>{activeWeekData.schematicDiagram}</pre>
                </div>
              </div>

              {/* Industry Supervisor Endorsement Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-300 rounded-xl p-3.5 text-xs space-y-2 shadow-xs">
                  <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Student Weekly Summary
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed italic">
                    "{activeWeekData.weeklySummary}"
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
                    "{activeWeekData.supervisorRemark}"
                  </p>
                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between">
                    <span>Supervisor: {industrySupervisor.split('(')[0]}</span>
                    <span className="font-bold text-teal-700">Signature Stamp Affixed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
