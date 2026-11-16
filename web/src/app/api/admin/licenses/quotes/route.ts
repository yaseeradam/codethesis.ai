import { NextRequest, NextResponse } from 'next/server';
import {
  getInstitutionalQuotes,
  updateInstitutionalQuote,
  createInstitutionalLicense,
  InstitutionalQuote,
} from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const quotes = await getInstitutionalQuotes();
    return NextResponse.json({ success: true, quotes });
  } catch (error: any) {
    console.error('Error fetching institutional quotes:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { quoteId, action } = body as { quoteId: string; action: 'approve' | 'reject' };

    if (!quoteId || !action) {
      return NextResponse.json({ success: false, error: 'Quote ID and action are required.' }, { status: 400 });
    }

    if (action === 'reject') {
      const updated = await updateInstitutionalQuote(quoteId, { status: 'rejected' });
      return NextResponse.json({ success: true, message: 'Quote inquiry rejected.', quote: updated });
    }

    if (action === 'approve') {
      const quotes = await getInstitutionalQuotes();
      const targetQuote = quotes.find(q => q.id === quoteId);
      if (!targetQuote) {
        return NextResponse.json({ success: false, error: 'Quote inquiry not found.' }, { status: 404 });
      }

      // Provision new license from quote
      const license = await createInstitutionalLicense({
        institutionName: targetQuote.institutionName,
        facultyName: targetQuote.facultyName,
        departmentName: targetQuote.departmentName,
        coordinatorName: targetQuote.contactName,
        coordinatorEmail: targetQuote.contactEmail,
        coordinatorPhone: targetQuote.contactPhone,
        planTier: targetQuote.tier === 'faculty' ? 'faculty' : 'departmental',
        totalSeats: targetQuote.estimatedStudents || 150,
        creditsPerStudent: 50,
        pooledCredits: (targetQuote.estimatedStudents || 150) * 50,
        academicSession: '2025/2026',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Mark quote as approved
      const updatedQuote = await updateInstitutionalQuote(quoteId, { status: 'approved' });

      return NextResponse.json({
        success: true,
        message: `Quote approved! Generated new Departmental License: ${license.licenseCode}`,
        license,
        quote: updatedQuote,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling quote approval:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to process quote action' }, { status: 500 });
  }
}
