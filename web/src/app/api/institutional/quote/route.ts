import { NextRequest, NextResponse } from 'next/server';
import { createInstitutionalQuote } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      institutionName,
      facultyName,
      departmentName,
      contactName,
      contactEmail,
      contactPhone,
      estimatedStudents,
      tier,
      customRequirements,
    } = body;

    if (!institutionName || !departmentName || !contactName || !contactEmail) {
      return NextResponse.json(
        { success: false, error: 'University name, Department, Coordinator Name, and official Email are required.' },
        { status: 400 }
      );
    }

    const students = Number(estimatedStudents) || 100;
    const estimatedAmount = tier === 'faculty' ? students * 2500 : students * 2000;

    const quote = await createInstitutionalQuote({
      institutionName,
      facultyName,
      departmentName,
      contactName,
      contactEmail,
      contactPhone,
      estimatedStudents: students,
      tier: tier || 'departmental',
      customRequirements,
      estimatedAmountNgn: estimatedAmount,
    });

    // Send confirmation email asynchronously if email provider is configured
    sendEmail({
      to: contactEmail.trim().toLowerCase(),
      subject: `CodeThesis AI — Institutional Departmental License Quotation (${departmentName})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0284c7;">Institutional License Request Received</h2>
          <p>Dear ${contactName},</p>
          <p>Thank you for requesting an Institutional Departmental License for <strong>${departmentName}</strong> at <strong>${institutionName}</strong>.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Tier:</strong> ${tier === 'faculty' ? 'Faculty Wide' : 'Departmental Site License'}</p>
            <p><strong>Covered Students:</strong> ${students} undergraduate scholars</p>
            <p><strong>Estimated Annual Investment:</strong> ₦${estimatedAmount.toLocaleString()}</p>
            <p><strong>Features Included:</strong> Turnitin Similarity Pre-Screening, 18,000-word Capstone Studio, Custom Institutional Templates, Dedicated HOD Verification Portal, Developer API Access (300 req/min).</p>
          </div>
          <p>An institutional partnerships director has been assigned to your department. You will receive an official invoice and provisioning key within 4 business hours.</p>
          <p style="font-size: 12px; color: #64748b;">CodeThesis AI — Academic Engineering Workspace for Higher Education.</p>
        </div>
      `,
    }).catch(err => console.warn('Institutional quote confirmation email caught:', err));

    return NextResponse.json({
      success: true,
      message: 'Your institutional quote request has been registered. An institutional advisor will activate your department license shortly.',
      quote,
    });
  } catch (error: any) {
    console.error('Error submitting institutional quote:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit quote inquiry.' },
      { status: 500 }
    );
  }
}
