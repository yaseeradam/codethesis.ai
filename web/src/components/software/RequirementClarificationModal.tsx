'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Edit3,
  X,
  Layers,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';
import { ClarificationQuestion } from '@/app/api/ai/clarify-requirements/route';

interface RequirementClarificationModalProps {
  isOpen: boolean;
  topic: string;
  department?: string;
  summary: string;
  questions: ClarificationQuestion[];
  onConfirm: (answers: Record<string, string>) => void;
  onSkip: () => void;
  onClose: () => void;
  isBuilding?: boolean;
}

export default function RequirementClarificationModal({
  isOpen,
  topic,
  department,
  summary,
  questions,
  onConfirm,
  onSkip,
  onClose,
  isBuilding = false,
}: RequirementClarificationModalProps) {
  // Track selected option per question: { [qId]: optionString }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    questions.forEach((q) => {
      initial[q.id] = q.options[q.defaultIndex || 0] || q.options[0] || '';
    });
    return initial;
  });

  // Track custom text inputs: { [qId]: customText }
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  
  // Track which question has custom mode active: { [qId]: boolean }
  const [customActive, setCustomActive] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleSelectOption = (qId: string, optionText: string) => {
    setCustomActive((prev) => ({ ...prev, [qId]: false }));
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionText }));
  };

  const handleToggleCustom = (qId: string) => {
    setCustomActive((prev) => ({ ...prev, [qId]: true }));
    const currentCustom = customInputs[qId] || '';
    setSelectedAnswers((prev) => ({ ...prev, [qId]: currentCustom || 'Custom Specification' }));
  };

  const handleCustomChange = (qId: string, value: string) => {
    setCustomInputs((prev) => ({ ...prev, [qId]: value }));
    setSelectedAnswers((prev) => ({ ...prev, [qId]: value.trim() ? value : 'Custom Specification' }));
  };

  const handleConfirm = () => {
    onConfirm(selectedAnswers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-indigo-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#7C3AED] text-white flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0 text-white shadow-inner">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    AI Architectural Refinement
                  </span>
                  {department && (
                    <span className="text-[11px] font-medium text-indigo-100 hidden sm:inline-block">
                      &bull; {department}
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                  Confirm System Architecture &amp; Core Decisions
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isBuilding}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* AI Scope Assessment Callout */}
          <div className="mt-3.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-indigo-50 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-indigo-200 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white font-semibold">AI Architect Assessment:</strong> {summary}
            </p>
          </div>
        </div>

        {/* Scrollable Questions Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="text-xs text-slate-500 font-medium">
            Please review the key domain specifications below. Select the recommended pattern or type your own custom choice to tailor the generated software package:
          </div>

          {questions.map((q, idx) => {
            const isCustom = customActive[q.id];
            const currentVal = selectedAnswers[q.id];

            return (
              <div
                key={q.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#FAFBFD] border border-slate-200/90 space-y-3 transition-all hover:border-indigo-200"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-black flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                        {q.question}
                      </h3>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 pl-7 leading-relaxed font-medium">
                      {q.context}
                    </p>
                  </div>
                </div>

                {/* Selectable Options */}
                <div className="space-y-2 pl-7">
                  {q.options.map((opt, optIdx) => {
                    const isRecommended = opt.startsWith('(Recommended)');
                    const cleanLabel = isRecommended ? opt.replace('(Recommended)', '').trim() : opt;
                    const isSelected = !isCustom && currentVal === opt;

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`group relative p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isSelected
                            ? 'bg-[#EEF0FE] border-indigo-400 text-indigo-950 font-bold shadow-xs ring-2 ring-indigo-500/20'
                            : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Radio Check Indicator */}
                        <div
                          className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-white group-hover:border-slate-400'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>

                        {/* Text and Badge */}
                        <div className="flex-1 flex flex-wrap items-center gap-1.5">
                          {isRecommended && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded-md">
                              Recommended
                            </span>
                          )}
                          <span className="leading-snug">{cleanLabel}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Custom Option Pill / Text Field */}
                  <div
                    onClick={() => handleToggleCustom(q.id)}
                    className={`p-3 rounded-xl border text-xs transition-all cursor-pointer space-y-2 select-none ${
                      isCustom
                        ? 'bg-[#F5F3FF] border-purple-400 text-purple-950 shadow-xs ring-2 ring-purple-500/20'
                        : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                          isCustom
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isCustom && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>

                      <div className="flex items-center gap-1.5 font-bold text-xs text-purple-900">
                        <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Specify Custom Requirement (Type your own choice)</span>
                      </div>
                    </div>

                    {/* Active Input when Custom is selected */}
                    {isCustom && (
                      <div className="pt-1 pl-7">
                        <input
                          type="text"
                          autoFocus
                          value={customInputs[q.id] || ''}
                          onChange={(e) => handleCustomChange(q.id, e.target.value)}
                          placeholder="e.g. Matric OTP verification + Fingerprint biometric match simulation..."
                          className="w-full bg-white border border-purple-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium outline-none transition-all shadow-inner"
                        />
                        <span className="text-[10px] text-purple-600/80 mt-1 block">
                          AI will synthesize database tables and code logic specifically adhering to this instruction.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onSkip}
            disabled={isBuilding}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Skip &amp; Use Recommended Defaults
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isBuilding}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Confirm &amp; Synthesize Full Software</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
