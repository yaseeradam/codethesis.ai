import { NextRequest, NextResponse } from 'next/server';
import { generateAcademicAI } from '@/lib/ai';

// Simple in-memory rate limit: max 3 free previews per IP per 24 hours
const previewRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkPreviewLimit(ip: string): boolean {
  const now = Date.now();
  const entry = previewRateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    previewRateLimit.set(ip, { count: 1, resetAt: now + 24 * 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (!checkPreviewLimit(ip)) {
      return NextResponse.json(
        {
          error: 'Daily free preview limit (3/day) reached. Create a free account to get 15 bonus credits and generate full chapters.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const topic = String(body.topic || '').trim();
    const course = String(body.course || 'Computer Science').trim();
    const institution = String(body.institution || 'Nigerian University').trim();

    if (!topic || topic.length < 8) {
      return NextResponse.json(
        { error: 'Please enter a valid research project topic (at least 8 characters).' },
        { status: 400 }
      );
    }

    const toc = [
      'Title Page & Certification',
      'Abstract & Table of Contents',
      'CHAPTER ONE: INTRODUCTION (1.1 Background, 1.2 Statement of Problem, 1.3 Aim & Objectives, 1.4 Scope)',
      'CHAPTER TWO: LITERATURE REVIEW (2.1 Conceptual Framework, 2.2 Theoretical Review, 2.3 Empirical Studies)',
      'CHAPTER THREE: SYSTEM ANALYSIS & DESIGN (3.1 Methodology, 3.2 Architecture, 3.3 Database Schema & UML)',
      'CHAPTER FOUR: IMPLEMENTATION & TESTING (4.1 Development Environment, 4.2 System Modules, 4.3 Test Results)',
      'CHAPTER FIVE: SUMMARY, CONCLUSION & RECOMMENDATIONS + APA 7th References + Appendices (Python & SQL)',
    ];

    const prompt = `Write a concise, authentic Chapter One preview (~400 words) for a Nigerian university undergraduate thesis.
Topic: "${topic}"
Department: ${course}
Institution: ${institution}

Include:
1.1 Background of the Study (2 paragraphs)
1.2 Statement of the Problem (1 paragraph)
1.3 Aim and Objectives of the Study (1 short paragraph + 4 numbered objectives)

Write in formal Nigerian university academic English (NUC standard). No markdown symbols like ** or ##.`;

    const aiRes = await generateAcademicAI({
      prompt,
      temperature: 0.7,
      maxTokens: 1200,
    });

    return NextResponse.json({
      success: true,
      topic,
      course,
      institution,
      toc,
      chapterOnePreview:
        aiRes.content?.trim() ||
        `1.1 Background of the Study\nThis research investigates "${topic}" within the Department of ${course} at ${institution}. Modern institutional workflows demand automated, verifiable digital architectures to eliminate manual bottlenecks, improve data integrity, and ensure real-time operational accountability.\n\n1.2 Statement of the Problem\nExisting manual and semi-automated processes suffer from latency, record duplication, and weak auditability.\n\n1.3 Aim and Objectives\nThe aim of this study is to design and implement ${topic}.\n1. To analyze existing workflows and identify systemic bottlenecks.\n2. To design a scalable database and software architecture.\n3. To implement the proposed system using modern web and database technologies.\n4. To evaluate system performance, usability, and reliability.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate free preview' },
      { status: 500 }
    );
  }
}
