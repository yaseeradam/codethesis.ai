'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { downloadAcademicFile } from '@/lib/downloadHelper';
import {
  FileCheck,
  Download,
  Sparkles,
  BookOpen,
  Building,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Copy,
  Printer,
  Layers,
  Loader2
} from 'lucide-react';

interface Chapter {
  number: number;
  title: string;
  wordCount: string;
  summary: string;
  subsections: {
    heading: string;
    content: string;
  }[];
}

export default function ItfReportPage() {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [companyName, setCompanyName] = useState('MainOne Cable Company (An Equinix Company)');
  const [studentName, setStudentName] = useState('ADEBAYO TUNDE');
  const [matricNumber, setMatricNumber] = useState('FUTA/CSC/20/4182');
  const [institution, setInstitution] = useState('Federal University of Technology, Akure');
  const [department, setDepartment] = useState('Computer Science');
  const [duration, setDuration] = useState('6 Months (24 Weeks)');
  const [isGenerating, setIsGenerating] = useState(false);

  const chapters: Chapter[] = [
    {
      number: 1,
      title: 'Introduction & Profile of the Establishment',
      wordCount: '2,840 words',
      summary: 'Organizational background, mission statement, Tier III datacenter infrastructure, and company organogram.',
      subsections: [
        {
          heading: '1.1 Historical Background of MainOne',
          content: 'MainOne, an Equinix Company, was established in 2010 to bridge the West African digital divide by deploying the first privately funded 7,000-kilometer submarine cable connecting Portugal to Nigeria and Ghana. The enterprise operates West Africa’s premier carrier-neutral Tier III certified Data Center (MDX-i), delivering 99.982% enterprise SLA uptime to banks, telecommunications operators, and government institutions.'
        },
        {
          heading: '1.2 Organizational Organogram & Governance',
          content: 'The operational hierarchy is led by the Chief Executive Officer, followed by the Chief Technical Officer (CTO), Director of Network Operations, and Departmental Heads across Network Infrastructure, Cloud Virtualization, Enterprise Security, and Technical Support. Interns were placed under the direct supervision of Senior Systems Engineers in the NOC.'
        },
        {
          heading: '1.3 Objectives of SIWES in Tertiary Technical Education',
          content: 'The Students Industrial Work Experience Scheme (SIWES) was initiated by the Industrial Training Fund (ITF) in 1973 to address the critical discrepancy between theoretical engineering curricula taught in tertiary institutions and real-world industrial practice. It prepares students for post-graduation employability by imparting hands-on competency in industrial setups.'
        }
      ]
    },
    {
      number: 2,
      title: 'Industrial Safety Guidelines, Regulations & HSE Protocols',
      wordCount: '2,420 words',
      summary: 'Occupational health, ISO 27001 physical security, ESD precautions, and Clean Agent fire suppression systems.',
      subsections: [
        {
          heading: '2.1 Health, Safety and Environment (HSE) Directives',
          content: 'Strict compliance with ISO 45001 occupational safety guidelines was enforced daily. Personal Protective Equipment (PPE) including composite toe dielectric safety boots, high-visibility vests, and ear protection gear was mandatory in generator and chiller plants producing ambient noise in excess of 85 dBA.'
        },
        {
          heading: '2.2 Electrostatic Discharge (ESD) Mitigation Protocols',
          content: 'Before opening server chassis or handling RAM DIMMs, technicians must ground themselves using conductive anti-static wrist straps connected to the equipment rack chassis ground. Static-dissipative floor tiles and controlled humidity levels (45%–55% RH) ensure zero semiconductor component destruction.'
        },
        {
          heading: '2.3 FM-200 Clean Agent Total Flooding Fire Suppression',
          content: 'Datacenter server rooms are equipped with Heptafluoropropane (HFC-227ea / FM-200) gas systems. Unlike water sprinklers which irreparably destroy electrical equipment, FM-200 interrupts the chemical combustion chain without depleting oxygen or leaving corrosive chemical residue.'
        }
      ]
    },
    {
      number: 3,
      title: 'Technical Operations, Tasks Executed & Hands-On Experience',
      wordCount: '8,650 words',
      summary: 'Detailed technical report on enterprise structured cabling, Cisco switch configuration, Linux server administration, and VLAN segregation.',
      subsections: [
        {
          heading: '3.1 Structured Fiber Optic & Copper Cabling Standards',
          content: 'Terminated OM4 multimode fiber optic cables utilizing LC-to-LC duplex connectors with fusion splicers. Fusion splice attenuation was rigorously verified to be less than 0.05 dB per splice. Copper infrastructure was standardized on Cat6A 23-AWG 500MHz foil-screened twisted pair cables.'
        },
        {
          heading: '3.2 Cisco IOS Switch Staging & Multi-VLAN Configuration',
          content: 'Provisioned enterprise core switches with IEEE 802.1Q trunking, Rapid Spanning Tree Protocol (RSTP 802.1w) to prevent bridging loops, and BPDU Guard on all edge user ports. Port security was configured with a maximum of 2 sticky MAC addresses per switch interface to thwart unauthorized network taps.'
        },
        {
          heading: '3.3 Linux Server Deployment & Shell Automation',
          content: 'Administered Ubuntu Server 22.04 LTS and Rocky Linux production hosts. Automated nightly backup routines using cron daemons executing rsync over SSH with RSA-4096 bit asymmetric key pairs, storing encrypted dumps into offsite SAN targets.'
        }
      ]
    },
    {
      number: 4,
      title: 'Problems Encountered, Root Causes & Technical Solutions',
      wordCount: '3,100 words',
      summary: 'Real-world industrial engineering bottlenecks and analytical troubleshooting workflows.',
      subsections: [
        {
          heading: '4.1 Intermittent Packet Loss Due to Fiber Bend Radius Violation',
          content: 'Problem: Rack C-12 exhibited 14% intermittent packet drops on optical Uplink 1. Root Cause: Tight cable ties compressed the patch cable below the manufacturer-recommended 30mm minimum dynamic bend radius, causing macro-bending optical losses. Solution: Re-routed fiber through dedicated yellow fiber raceways and swapped zip ties for non-compressive Velcro straps.'
        },
        {
          heading: '4.2 Broadcast Storm Caused by Unmanaged Switch Loop',
          content: 'Problem: Total CPU saturation across distribution switches causing gateway timeouts. Root Cause: An unmanaged 8-port switch connected by a guest worker created an unblocked redundant path. Solution: Enabled Storm Control with broadcast threshold set to 10% on all edge interfaces, immediately discarding excess multicast frames.'
        }
      ]
    },
    {
      number: 5,
      title: 'Conclusion, Appraisal & Institutional Recommendations',
      wordCount: '2,200 words',
      summary: 'Self-appraisal of industrial skills acquired and strategic recommendations to ITF and University Senates.',
      subsections: [
        {
          heading: '5.1 Evaluation of Industrial Skills Acquired',
          content: 'The 24-week SIWES attachment successfully transformed abstract theoretical network concepts into demonstrable industrial competency. Hands-on exposure to high-availability datacenter infrastructure and enterprise routing protocols significantly amplified engineering problem-solving ability.'
        },
        {
          heading: '5.2 Actionable Recommendations to the Institution',
          content: 'The Department of Computer Science should update outdated networking syllabi to incorporate practical cloud deployment, containerization (Docker), and modern DevOps tools, establishing dedicated physical router/switch training laboratories.'
        },
        {
          heading: '5.3 Actionable Recommendations to the Industrial Training Fund (ITF)',
          content: 'ITF should streamline the disbursement of student supervisory allowances through direct electronic bank transfers (NIBSS) and enforce mandatory student placements across accredited tech corporations.'
        }
      ]
    }
  ];

  const [isDownloading, setIsDownloading] = useState(false);
  const activeChapter = chapters[activeChapterIndex];

  async function handleExportWord() {
    setIsDownloading(true);
    await downloadAcademicFile(
      '/api/generate-itf-report-docx',
      {
        studentName,
        matricNumber,
        course: department,
        institution,
        company: companyName,
        duration,
      },
      `ITF_Technical_Report_${studentName.replace(/\s+/g, '_')}.docx`
    );
    setIsDownloading(false);
  }

  function handleRegenerate() {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Regenerated 5-Chapter ITF Technical Report tailored to ${companyName}!`);
    }, 1200);
  }

  return (
    <AppLayout
      activeItem="itf-report"
      title="ITF Technical Defense Report Generator"
      subtitle="Generates comprehensive 30–50 pages 5-Chapter SIWES defense reports formatted to institutional guidelines"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Control Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Building className="w-4 h-4 text-fuchsia-600" />
              <span>Report Metadata</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Establishment / Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Name</label>
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Matric No.</label>
                <input
                  type="text"
                  value={matricNumber}
                  onChange={e => setMatricNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="w-full py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Compiling 5 Chapters...' : 'Generate 5-Chapter Report (2 Credits)'}</span>
            </button>
          </div>

          {/* Chapter Directory */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
            <div className="text-xs font-bold text-slate-800 px-1 mb-2">Chapters Navigation</div>
            {chapters.map((ch, idx) => (
              <button
                key={ch.number}
                onClick={() => setActiveChapterIndex(idx)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                  activeChapterIndex === idx
                    ? 'border-fuchsia-500 bg-fuchsia-50/70 text-fuchsia-950 font-bold shadow-xs'
                    : 'border-slate-200/70 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                    activeChapterIndex === idx ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {ch.number}
                  </span>
                  <span className="truncate text-[11px]">{ch.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0">{ch.wordCount}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Document A4 simulated preview (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            {/* Top Toolbar */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-slate-900">
                  CHAPTER {activeChapter.number}: {activeChapter.title.toUpperCase()}
                </span>
                <span className="text-[10px] bg-fuchsia-100 text-fuchsia-800 font-bold px-2 py-0.5 rounded-full">
                  {activeChapter.wordCount}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportWord}
                  disabled={isDownloading}
                  className="px-3 py-1.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-lg text-xs font-bold shadow-xs hover:opacity-95 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Compiling Report DOCX...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .DOCX</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* A4 Document Reader Body */}
            <div className="p-8 bg-white min-h-[520px] font-serif text-slate-800 leading-relaxed text-sm space-y-6">
              <div className="text-center border-b border-slate-200 pb-4">
                <h1 className="text-base font-bold uppercase tracking-wider text-slate-900">
                  CHAPTER {activeChapter.number}
                </h1>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {activeChapter.title.toUpperCase()}
                </h2>
              </div>

              <div className="space-y-6">
                {activeChapter.subsections.map((sub, i) => (
                  <div key={i} className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm font-sans">
                      {sub.heading}
                    </h3>
                    <p className="text-slate-700 text-justify text-xs lg:text-[13px] leading-relaxed indent-8">
                      {sub.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Document Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-sans">
              <button
                onClick={() => setActiveChapterIndex(prev => Math.max(0, prev - 1))}
                disabled={activeChapterIndex === 0}
                className="px-3 py-1 rounded-md border border-slate-200 hover:bg-white disabled:opacity-40"
              >
                ← Previous Chapter
              </button>

              <span>Page {activeChapterIndex * 7 + 1} of 35 • Institutional Format</span>

              <button
                onClick={() => setActiveChapterIndex(prev => Math.min(chapters.length - 1, prev + 1))}
                disabled={activeChapterIndex === chapters.length - 1}
                className="px-3 py-1 rounded-md border border-slate-200 hover:bg-white disabled:opacity-40"
              >
                Next Chapter →
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
