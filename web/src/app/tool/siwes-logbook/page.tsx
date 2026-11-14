"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ClipboardCheck,
  Calendar,
  Building2,
  GraduationCap,
  Sparkles,
  Download,
  Copy,
  Check,
  FileCheck,
  Pencil,
} from "lucide-react";

const COURSES = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Cybersecurity",
  "Electrical & Electronic Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Microbiology",
  "Biochemistry",
  "Accounting",
  "Business Administration",
  "Mass Communication",
];

interface DayLog {
  day: string;
  date: string;
  task: string;
  details: string;
}

interface WeekLog {
  weekNumber: number;
  theme: string;
  days: DayLog[];
  weeklySummary: string;
  sketchTitle: string;
  sketchDescription: string;
}

const DEFAULT_WEEKS: WeekLog[] = [
  {
    weekNumber: 1,
    theme: "Orientation, Safety Protocols & Infrastructure Familiarization",
    days: [
      {
        day: "Monday",
        date: "Day 1",
        task: "Workplace Orientation & IT Policy Briefing",
        details: "Attended safety induction; briefed on corporate IT security policies, confidentiality agreements, and designated workstation access privileges.",
      },
      {
        day: "Tuesday",
        date: "Day 2",
        task: "Facility Tour & Data Centre Inspection",
        details: "Conducted guided facility tour of the network operations center (NOC) and server room enclosures; observed server rack layouts and precision cooling units.",
      },
      {
        day: "Wednesday",
        date: "Day 3",
        task: "Workstation Setup & Dev Environment Deployment",
        details: "Configured developer workstation with enterprise Linux OS; installed PuTTY, Wireshark, VS Code, and configured SSH key pairs for remote server access.",
      },
      {
        day: "Thursday",
        date: "Day 4",
        task: "Inventory Audit & Equipment Verification",
        details: "Assisted senior technical officer in auditing departmental inventory of Cisco 2960 Catalyst switches, patch panels, and unmanaged PoE hubs.",
      },
      {
        day: "Friday",
        date: "Day 5",
        task: "Weekly Review & Departmental Debrief",
        details: "Attended departmental retrospective meeting; submitted weekly logbook for supervisor signature and clarified next week's cabling assignment objectives.",
      },
    ],
    weeklySummary: "Acquired fundamental understanding of enterprise data center regulations, workstation security configurations, and operational workflows within the infrastructure department.",
    sketchTitle: "Server Rack Enclosure & Patch Panel Elevation",
    sketchDescription: "Schematic showing 42U rack cabinet layout: Top-of-Rack Cisco switch (1U), 24-port Cat6 patch panel (1U), power distribution unit (PDU), and cable management trays.",
  },
  {
    weekNumber: 2,
    theme: "Structured Cabling & Local Area Network (LAN) Termination",
    days: [
      {
        day: "Monday",
        date: "Day 6",
        task: "Cat6 Twisted-Pair Cable Preparation",
        details: "Measured and pulled 50 meters of UTP Cat6 network cabling through cable trays across the accounting wing; labeled cable ends with heat-shrink tags.",
      },
      {
        day: "Tuesday",
        date: "Day 7",
        task: "RJ45 Connector Crimping (T568B Standard)",
        details: "Terminated Cat6 Ethernet cables using standard T568B color pinout; utilized modular ratcheting crimping tool to seat gold-plated RJ45 connectors securely.",
      },
      {
        day: "Wednesday",
        date: "Day 8",
        task: "Cable Continuity & Pinout Verification",
        details: "Tested terminated patch cables using digital LAN cable tester; verified all 8 conductors passed continuity and pinout tests with zero open or split pairs.",
      },
      {
        day: "Thursday",
        date: "Day 9",
        task: "Keystone Jack Punch-Down on Patch Panels",
        details: "Terminated incoming network drops into 110-type punch-down keystone jacks on patch panel ports 1-12 using an impact punch-down tool.",
      },
      {
        day: "Friday",
        date: "Day 10",
        task: "Workstation Wall Plate Installation",
        details: "Installed dual-port RJ45 faceplates on workstation cubicle walls; tested end-to-end link speed connecting workstation to switch at 1000 Mbps full duplex.",
      },
    ],
    weeklySummary: "Mastered structured network cabling standards according to ANSI/TIA-568-C.2, including punch-down termination, crimping precision, and digital wire-mapping verification.",
    sketchTitle: "T568B RJ45 Connector Color Code Diagram",
    sketchDescription: "Pin 1: White/Orange, Pin 2: Orange, Pin 3: White/Green, Pin 4: Blue, Pin 5: White/Blue, Pin 6: Green, Pin 7: White/Brown, Pin 8: Brown.",
  },
  {
    weekNumber: 3,
    theme: "Switch Configuration, VLANs & DHCP Troubleshooting",
    days: [
      {
        day: "Monday",
        date: "Day 11",
        task: "Cisco Catalyst 2960 Switch Initialization",
        details: "Connected to Cisco 2960 switch via RS-232 rollover console cable; performed factory reset and configured hostname, enable secret password, and console banner.",
      },
      {
        day: "Tuesday",
        date: "Day 12",
        task: "Virtual LAN (VLAN) Segmentation",
        details: "Created VLAN 10 (Management), VLAN 20 (Staff), and VLAN 30 (Guest); assigned FastEthernet ports 0/1-0/12 to VLAN 20 in access mode.",
      },
      {
        day: "Wednesday",
        date: "Day 13",
        task: "802.1Q Trunk Port Configuration",
        details: "Configured GigabitEthernet 0/1 as an 802.1Q trunk port connecting switch to core router; verified allowed VLAN traffic passing through the trunk link.",
      },
      {
        day: "Thursday",
        date: "Day 14",
        task: "DHCP Pool Diagnostics & IP Resolution",
        details: "Investigated workstation unable to access the intranet; identified exhausted DHCP pool lease, expanded subnet mask from /24 to /23 to double address space.",
      },
      {
        day: "Friday",
        date: "Day 15",
        task: "Configuration Archiving & Supervisor Sign-Off",
        details: "Saved running-config to startup-config; exported backup configurations to TFTP server; reviewed weekly tasks with industry supervisor Engr. T. Balogun.",
      },
    ],
    weeklySummary: "Gained practical experience with Cisco IOS command-line interface, VLAN isolation, 802.1Q trunking protocols, and subnet address pool troubleshooting.",
    sketchTitle: "VLAN Network Segmentation Topology",
    sketchDescription: "Diagram showing Core Router connected via 802.1Q trunk to Layer 2 Switch, segregating traffic into VLAN 10 (Admin), VLAN 20 (Staff), and VLAN 30 (Guests).",
  },
  {
    weekNumber: 4,
    theme: "Routing Protocols, Gateway Redundancy & Preventive Maintenance",
    days: [
      {
        day: "Monday",
        date: "Day 16",
        task: "Static Routing & Default Gateway Setup",
        details: "Configured IPv4 static default routes (0.0.0.0/0) pointing to ISP edge gateway; verified ICMP ping reachability across all subnet gateways.",
      },
      {
        day: "Tuesday",
        date: "Day 17",
        task: "OSPF Dynamic Routing Area 0 Deployment",
        details: "Configured Single-Area OSPF (Open Shortest Path First) on perimeter routers; advertised local subnets and inspected OSPF neighbor adjacency states.",
      },
      {
        day: "Wednesday",
        date: "Day 18",
        task: "Access Control List (ACL) Security Implementation",
        details: "Wrote standard access-list 10 to restrict unauthorized guest VLAN traffic from accessing internal server subnet IP range (192.168.10.0/24).",
      },
      {
        day: "Thursday",
        date: "Day 19",
        task: "Access Point Installation & Wi-Fi Survey",
        details: "Mounted UniFi AC-Pro wireless access points in executive boardroom; surveyed RF signal strength and channel interference using NetSpot analyzer.",
      },
      {
        day: "Friday",
        date: "Day 20",
        task: "Server Dusting & Monthly Preventive Maintenance",
        details: "Powered down redundant standby server for scheduled preventive maintenance; used high-pressure electric air blower to clean chassis fan dust.",
      },
    ],
    weeklySummary: "Acquired hands-on proficiency in OSPF neighbor negotiation, packet filtering using Cisco ACLs, and enterprise Wi-Fi deployment protocols.",
    sketchTitle: "OSPF Area 0 Core Network Architecture",
    sketchDescription: "Illustration of 3 multi-homed routers establishing OSPF neighbor adjacencies across Gigabit fiber links with designated router (DR) election.",
  },
];

export default function SiwesLogbookPage() {
  const [course, setCourse] = useState("Computer Science");
  const [isCustomCourse, setIsCustomCourse] = useState(false);
  const [company, setCompany] = useState("MTN Nigeria Infrastructure Unit");
  const [duration, setDuration] = useState<12 | 24>(24);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLogs, setGeneratedLogs] = useState<WeekLog[]>(DEFAULT_WEEKS);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [copiedDay, setCopiedDay] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedLogs(DEFAULT_WEEKS);
      setIsGenerating(false);
    }, 1200);
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadDocx = async () => {
    if (!generatedLogs) return;
    setIsDownloading(true);
    try {
      // Auto-save to student dashboard
      fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "siwes-logbook",
          title: `${duration}-Week SIWES Industrial Training Logbook`,
          course: course || "Engineering",
          institution: "Tertiary Institution",
          fileType: "docx",
          summary: `${duration}-week daily entries at ${company || "Host Firm"} with technical sketch guides.`,
        }),
      }).catch(e => console.warn("Auto-save note:", e));

      const res = await fetch("/api/generate-siwes-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course,
          company,
          duration,
          weeks: generatedLogs,
        }),
      });
      if (!res.ok) throw new Error("Failed to download document");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `SIWES_Logbook_${course.replace(/\s+/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Could not download document. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const currentWeek = generatedLogs?.find((w) => w.weekNumber === selectedWeek) || generatedLogs?.[0];

  const handleCopyDay = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDay(id);
    setTimeout(() => setCopiedDay(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Tools</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200">
              <Image src="/logo.jpg" alt="Logo" width={28} height={28} className="object-cover" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">CodeThesis</span>
          </div>

          <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
            SIWES Suite
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-10 w-full flex-1">
        {/* Tool Header Box (iLovePDF Style) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            SIWES Logbook Generator
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Generate 12 to 24 weeks of authentic daily technical records, weekly summaries, and diagram sketch guides in seconds.
          </p>

          {/* Input Form */}
          <div className="mt-8 space-y-5 text-left">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  Course of Study
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCourse(!isCustomCourse);
                    if (!isCustomCourse) setCourse("");
                  }}
                  className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 underline"
                >
                  {isCustomCourse ? "Choose from list" : "Can't find your course? Type it"}
                </button>
              </div>

              {isCustomCourse ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Enter your exact course (e.g. Mechatronics, Pharmacy, Marine Science)"
                    className="w-full bg-slate-50 border-2 border-cyan-400 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all shadow-xs"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-500">You can enter any academic discipline or department.</p>
                </div>
              ) : (
                <select
                  value={course}
                  onChange={(e) => {
                    if (e.target.value === "OTHER") {
                      setIsCustomCourse(true);
                      setCourse("");
                    } else {
                      setCourse(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
                >
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="OTHER">✍️ Other (Type custom course...)</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                Placement Organization / Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., MTN Nigeria, Central Bank IT, Shell, General Hospital"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Internship Duration
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDuration(12)}
                  className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                    duration === 12
                      ? "bg-cyan-50 border-cyan-500 text-cyan-800 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  12 Weeks (3 Months)
                </button>
                <button
                  type="button"
                  onClick={() => setDuration(24)}
                  className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                    duration === 24
                      ? "bg-cyan-50 border-cyan-500 text-cyan-800 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  24 Weeks (6 Months)
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Authentic {duration}-Week Logbook...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Complete Logbook</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Logbook Output Preview (iLovePDF Style Result Card) */}
        {generatedLogs && (
          <div className="mt-12 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Generated Successfully
                  </span>
                  <span className="text-xs text-slate-400">
                    {duration} Weeks • {course}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {company}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadDocx}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 text-sm font-bold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Compiling Word Document...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Word (.docx)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Week Pills Selector */}
            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {generatedLogs.map((w) => (
                <button
                  key={w.weekNumber}
                  onClick={() => setSelectedWeek(w.weekNumber)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedWeek === w.weekNumber
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Week {w.weekNumber}
                </button>
              ))}
            </div>

            {/* Selected Week View */}
            {currentWeek && (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Monday to Friday Cards (2 columns on large screens) */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-4">
                    <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
                      Week {currentWeek.weekNumber} Focus Theme:
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {currentWeek.theme}
                    </h3>
                  </div>

                  {currentWeek.days.map((day) => (
                    <div
                      key={day.day}
                      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {day.day}
                        </span>
                        <button
                          onClick={() => handleCopyDay(`${day.task}: ${day.details}`, day.day)}
                          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium"
                          title="Copy entry"
                        >
                          {copiedDay === day.day ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-2">
                        {day.task}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {day.details}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Right: Weekly Summary & Sketch Box */}
                <div className="space-y-4">
                  {/* Sketch Box */}
                  <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                      <Pencil className="w-4 h-4 text-amber-700" />
                      <span>Weekly Sketch to Draw</span>
                    </div>
                    <div className="bg-white border border-amber-200 rounded-xl p-4 text-center">
                      <h5 className="text-xs font-bold text-slate-900 mb-1">
                        {currentWeek.sketchTitle}
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed text-left bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {currentWeek.sketchDescription}
                      </p>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-2 font-medium">
                      💡 Draw this schematic into the blank sketch box on your physical logbook sheet for Week {currentWeek.weekNumber}.
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      <FileCheck className="w-4 h-4 text-slate-500" />
                      <span>Weekly Summary of Work Done</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                      {currentWeek.weeklySummary}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>© 2026 CodeThesis AI. Fast, accurate SIWES logbook and report automation.</p>
      </footer>
    </div>
  );
}
