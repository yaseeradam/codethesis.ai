'use client';

import React from 'react';
import { convertLatexFormula, isMathEquation, extractCleanEquation, sanitizeAcademicTextMath } from '@/lib/mathConverter';

interface AcademicTextRendererProps {
  content: string;
  chapterNumber?: number;
}

export default function AcademicTextRenderer({ content, chapterNumber = 1 }: AcademicTextRendererProps) {
  if (!content) return null;

  // Split into paragraphs / lines
  const lines = content.split('\n');
  let equationCount = 1;

  return (
    <div className="space-y-3.5 text-slate-800 font-serif leading-relaxed text-xs sm:text-sm text-justify">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) return null;

        // Mathematical Equation Block
        if (isMathEquation(line)) {
          const { formula, label } = extractCleanEquation(
            line,
            `(Equation ${chapterNumber}.${equationCount++})`
          );

          return (
            <div
              key={idx}
              className="my-4 p-4 rounded-xl bg-slate-50/90 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors hover:border-amber-300"
            >
              <div className="font-serif italic font-bold text-slate-900 text-sm sm:text-base tracking-wide px-2 text-center sm:text-left">
                {formula}
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex-shrink-0 shadow-2xs">
                {label}
              </span>
            </div>
          );
        }

        // Section Heading (e.g. "1.1 Background of the Study" or "### ...")
        const isHeading = /^(\d+\.\d+(\.\d+)?|\bCHAPTER\b)/i.test(line) || /^#+\s+/.test(line);
        if (isHeading && line.length < 120) {
          const cleanHeading = line.replace(/^#+\s*/, '').replace(/[*_#`]/g, '').trim();
          return (
            <h3 key={idx} className="font-sans font-bold text-slate-900 text-sm sm:text-base pt-3 pb-1 border-b border-slate-100">
              {cleanHeading}
            </h3>
          );
        }

        // Bullet points
        if (/^[-*+]\s+/.test(line)) {
          const bulletContent = sanitizeAcademicTextMath(line.replace(/^[-*+]\s+/, '').trim());
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-4 text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
              <span>{bulletContent.replace(/[*_#`]/g, '')}</span>
            </div>
          );
        }

        // Numbered items
        if (/^\d+\.\s+/.test(line)) {
          const numMatch = line.match(/^(\d+\.)\s+(.*)$/);
          if (numMatch) {
            const cleanContent = sanitizeAcademicTextMath(numMatch[2]);
            return (
              <div key={idx} className="flex items-start gap-2 pl-4 text-slate-700">
                <span className="font-bold text-slate-900 min-w-[20px] font-sans">{numMatch[1]}</span>
                <span>{cleanContent.replace(/[*_#`]/g, '')}</span>
              </div>
            );
          }
        }

        // Normal scholarly paragraph (sanitize inline math like $ ... $)
        const sanitizedPara = sanitizeAcademicTextMath(line).replace(/[*_#`]/g, '');

        return (
          <p key={idx} className="indent-6 leading-relaxed">
            {sanitizedPara}
          </p>
        );
      })}
    </div>
  );
}
