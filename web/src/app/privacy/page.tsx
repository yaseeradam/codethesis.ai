'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { ShieldCheck, Lock, EyeOff, FileCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <AppLayout
      activeItem="dashboard"
      title="Data Privacy Policy & NDPR Compliance"
      subtitle="Ensuring strict non-retention of student thesis drafts, confidential datasets, and encrypted storage"
    >
      <div className="max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-10 shadow-xs space-y-6 text-slate-800 leading-relaxed text-xs lg:text-sm">
        <div className="border-b border-slate-200 pb-4">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
            Nigeria Data Protection Regulation (NDPR) & GDPR Aligned
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Privacy Policy & Data Stewardship
          </h2>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">1. Non-Retention of Academic Drafts</h3>
          <p className="text-slate-600 leading-relaxed">
            Your research project drafts, dataset uploads, and source code are treated with the highest degree of academic confidentiality. CodeThesis does NOT feed student dissertations into public LLM training datasets. Your intellectual property remains exclusively yours.
          </p>

          <h3 className="font-bold text-slate-900 text-sm">2. Personal Demographics & Matriculation Numbers</h3>
          <p className="text-slate-600 leading-relaxed">
            Student names, matriculation numbers, and institutional affiliations provided during account configuration are used solely for the mechanical formatting of title pages, preliminary certification sheets, and ITF logbook stamps. We do not sell or monetize student records.
          </p>

          <h3 className="font-bold text-slate-900 text-sm">3. Payment Information & Security</h3>
          <p className="text-slate-600 leading-relaxed">
            All financial transactions are processed securely via Paystack (PCI-DSS Level 1 certified). CodeThesis never stores, views, or logs full debit card numbers, PINs, or bank account credentials.
          </p>

          <h3 className="font-bold text-slate-900 text-sm">4. Bring Your Own Key (BYOK) Security</h3>
          <p className="text-slate-600 leading-relaxed">
            If you supply custom Gemini or OpenAI API keys in Settings, those keys are retained in your browser's private local state and transmitted directly to the respective model provider over TLS 1.3 encrypted sockets.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>NDPR Certified Compliance</span>
          <span>privacy@codethesis.com</span>
        </div>
      </div>
    </AppLayout>
  );
}
