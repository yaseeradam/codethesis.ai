'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/context/AuthContext';
import {
  CreditCard,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  Building,
  HelpCircle,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function PricingPage() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [selectedPlan, setSelectedPlan] = useState<string>('scholar');
  const [customCredits, setCustomCredits] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const tiers = [
    {
      id: 'starter',
      name: 'Student Starter',
      badge: 'Single Assignment / Viva',
      priceNGN: 3500,
      priceUSD: 5,
      credits: 25,
      popular: false,
      features: [
        '25 Academic AI Generation Credits',
        '1 Complete SIWES 12-Week Logbook',
        '2 UML Diagrams (Use Case & ERD)',
        '15-Slide Viva Defense Presentation Deck',
        'Standard Turnitin-safe Heuristic Engine',
        'Email Support & DOCX Exports'
      ]
    },
    {
      id: 'scholar',
      name: 'Final Year Scholar',
      badge: 'Most Popular for Finalists',
      priceNGN: 8500,
      priceUSD: 12,
      credits: 100,
      popular: true,
      features: [
        '100 Academic AI Generation Credits',
        'Complete 5-Chapter Thesis (~18,000+ words)',
        'Zero-Pip Python & SQLite Software Repo',
        'Full Vector UML Studio (All 4 Diagrams)',
        'Unlimited Mock Viva Defense Drills',
        '30–50 Pages ITF Defense Report',
        'Priority AI Reasoning Engine'
      ]
    },
    {
      id: 'postgrad',
      name: 'Postgraduate & Pro',
      badge: 'M.Sc & Ph.D Level',
      priceNGN: 18000,
      priceUSD: 25,
      credits: 300,
      popular: false,
      features: [
        '300 Academic AI Generation Credits',
        'M.Sc & Ph.D Dissertation Architecture',
        'Complex Multi-Tier Software Systems',
        'Custom Crossref Academic DOIs Indexing',
        'Unlimited Viva Simulator Voice Interrogations',
        'Full Chapter-by-Chapter Supervisor Revisions',
        'Dedicated VIP WhatsApp Support'
      ]
    }
  ];

  async function handlePay(planName: string, amountNGN: number, credits: number) {
    try {
      setIsProcessing(true);
      const userEmail = user?.email || 'student@futa.edu.ng';
      const res = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          amount: amountNGN,
          planId: planName.toLowerCase().includes('scholar') ? 'complete' : planName.toLowerCase().includes('postgrad') ? 'faculty' : 'standard',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment gateway initialization failed');
      }

      if (data.mode === 'live' && data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }

      // In sandbox/simulation mode: verify immediately
      const verifyRes = await fetch(`/api/payments/paystack/verify?reference=${data.reference}`);
      const verifyData = await verifyRes.json();

      setIsProcessing(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('credits-updated'));
      }
      setBanner({
        type: 'success',
        message: `🎉 Payment Successful! Reference: ${data.reference}. ₦${amountNGN.toLocaleString()} received via Paystack. ${credits} Academic Credits added to your account!`
      });
      setTimeout(() => setBanner(null), 6000);
    } catch (err: any) {
      setIsProcessing(false);
      setBanner({
        type: 'error',
        message: `Payment error: ${err.message}`
      });
      setTimeout(() => setBanner(null), 6000);
    }
  }

  function handleCustomTopup() {
    const costNGN = customCredits * 95;
    handlePay('Custom Topup', costNGN, customCredits);
  }

  return (
    <AppLayout
      activeItem="pricing"
      title="Credits & Transparent Pricing"
      subtitle="Fair student-friendly credit bundles tailored for Nigerian universities and global scholars"
    >
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Currency Switch & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Paystack Automated Instant Activation</span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            Simple, Honest Academic Credit Plans
          </h2>
          <p className="text-slate-600 text-xs lg:text-sm max-w-xl mx-auto leading-relaxed">
            Credits never expire. Top up anytime. First-time registration includes 15 free credits to test all features.
          </p>

          {/* Toggle */}
          <div className="inline-flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setCurrency('NGN')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                currency === 'NGN' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Nigerian Naira (₦ NGN)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                currency === 'USD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              US Dollar ($ USD)
            </button>
          </div>
        </div>

        {/* Dynamic Payment Alert Banner */}
        {banner && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200 ${
              banner.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {banner.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span className="font-semibold">{banner.message}</span>
            </div>
            <button
              onClick={() => setBanner(null)}
              className="text-slate-400 hover:text-slate-700 font-bold ml-2 text-xs"
            >
              &times;
            </button>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {tiers.map(tier => (
            <div
              key={tier.id}
              className={`bg-white rounded-3xl p-6 flex flex-col justify-between transition-all relative ${
                tier.popular
                  ? 'border-2 border-blue-600 shadow-xl shadow-blue-500/10 ring-4 ring-blue-500/10'
                  : 'border border-slate-200 shadow-xs hover:shadow-md'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black px-3.5 py-1 rounded-full shadow-md uppercase tracking-wider">
                  Recommended Choice
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{tier.name}</div>
                  <div className="text-[11px] text-blue-600 font-bold mt-0.5">{tier.badge}</div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl lg:text-4xl font-black text-slate-900">
                    {currency === 'NGN' ? `₦${tier.priceNGN.toLocaleString()}` : `$${tier.priceUSD}`}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ one-time</span>
                </div>

                <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-950">Credits Included:</span>
                  <span className="font-black text-blue-600 bg-white px-2 py-0.5 rounded-lg shadow-2xs">
                    {tier.credits} Credits
                  </span>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-bold text-slate-800">What you can generate:</div>
                  {tier.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => handlePay(tier.name, tier.priceNGN, tier.credits)}
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 ${
                    tier.popular
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{isProcessing ? 'Connecting Paystack...' : `Get ${tier.credits} Credits`}</span>
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  Instant activation • Pay with Card, Transfer, USSD, OPay
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Credit Topup Slider Widget */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 lg:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Custom Credit Top-up</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Need specific extra credits?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Slide to pick the exact number of credits you need. Standard rate is ₦95 per credit with no hidden surcharges.
            </p>
          </div>

          <div className="w-full md:w-auto flex-1 max-w-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Credits: <strong className="text-blue-600">{customCredits}</strong></span>
              <span>Total: <strong className="text-slate-900">₦{(customCredits * 95).toLocaleString()}</strong></span>
            </div>

            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={customCredits}
              onChange={e => setCustomCredits(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />

            <button
              onClick={handleCustomTopup}
              disabled={isProcessing}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Purchase {customCredits} Credits (₦{(customCredits * 95).toLocaleString()})</span>
            </button>
          </div>
        </div>

        {/* Institutional & Departmental Licensing Banner */}
        <div className="bg-gradient-to-r from-[#070F2B] to-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
              Institutional Departmental License
            </span>
            <h3 className="text-xl font-black text-white">
              Are you an HOD, Dean, or Project Coordinator?
            </h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              We offer campus-wide site licenses with custom supervisor portals, batch student logbook management, and Turnitin similarity pre-screening.
            </p>
          </div>

          <a
            href="mailto:partnerships@codethesis.com?subject=CodeThesis%20Institutional%20License%20Inquiry"
            className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-2 flex-shrink-0"
          >
            <Building className="w-4 h-4" />
            <span>Request Institutional Quote</span>
          </a>
        </div>
      </div>
    </AppLayout>
  );
}
