'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { ShieldCheck, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <AppLayout
      activeItem="dashboard"
      title="Terms of Academic Service & Ethics Declaration"
      subtitle="Governing the ethical use of AI research tools, plagiarism compliance, and student accountability"
    >
      <div className="max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-10 shadow-xs space-y-6 text-slate-800 leading-relaxed text-xs lg:text-sm">
        <div className="border-b border-slate-200 pb-4">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
            Last Updated: November 14, 2026
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            CodeThesis AI Academic Service Agreement
          </h2>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">1. Nature of the Service & Academic Assistance</h3>
          <p className="text-slate-600 leading-relaxed">
            CodeThesis AI is an advanced research and engineering acceleration suite designed to assist undergraduate, postgraduate, and independent scholars in synthesizing academic structure, technical methodology, zero-dependency software architectures, and defense presentations. All generated material is intended as a defensible foundation that students must review, understand, and intellectually defend before their designated university defense panel.
          </p>

          <h3 className="font-bold text-slate-900 text-sm">2. Ethical Usage & Defense Integrity</h3>
          <p className="text-slate-600 leading-relaxed">
            Students agree to thoroughly comprehend every line of generated code, mathematical derivation, and architectural diagram. CodeThesis expressly prohibits presenting work that the candidate cannot articulate or defend under questioning by an academic panel. Our Viva Simulator tool is provided specifically to build this deep technical understanding.
          </p>

          <h3 className="font-bold text-slate-900 text-sm">3. Plagiarism & Turnitin Compatibility</h3>
          <p className="text-slate-600 leading-relaxed">
            CodeThesis compiles original prose and citations grounded in peer-reviewed Crossref DOIs. While outputs are calibrated to remain under the 15% institutional Turnitin similarity threshold, students are responsible for verifying compliance with their specific departmental guidelines and supervisor instructions.
          </p>

          <h3 className="font-bold text-slate-900 text-sm">4. Credit Policy & Transactions</h3>
          <p className="text-slate-600 leading-relaxed">
            Credits allocated via first-time registration or purchased through Paystack remain valid indefinitely and do not expire. Credit deductions occur deterministically upon the initiation of generation tasks in accordance with platform schedules.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Federal Republic of Nigeria • NUC Aligned Guidelines</span>
          <span>CodeThesis AI Ethics Board</span>
        </div>
      </div>
    </AppLayout>
  );
}
