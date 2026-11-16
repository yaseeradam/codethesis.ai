import { NextRequest, NextResponse } from 'next/server';
import {
  getInstitutionalLicenses,
  createInstitutionalLicense,
  updateInstitutionalLicense,
  deleteInstitutionalLicense,
  InstitutionalLicense,
} from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const licenses = await getInstitutionalLicenses();

    // Compute live stats
    const totalLicenses = licenses.length;
    const activeLicenses = licenses.filter(l => l.status === 'active').length;
    const totalSeats = licenses.reduce((sum, l) => sum + (l.totalSeats || 0), 0);
    const usedSeats = licenses.reduce((sum, l) => sum + (l.usedSeats || 0), 0);
    const totalPooledCredits = licenses.reduce((sum, l) => sum + (l.pooledCredits || 0), 0);
    const remainingPooledCredits = licenses.reduce((sum, l) => sum + (l.remainingPooledCredits || 0), 0);

    const universitiesCovered = Array.from(new Set(licenses.map(l => l.institutionName))).length;
    const departmentsCovered = Array.from(new Set(licenses.map(l => `${l.institutionName} - ${l.departmentName}`))).length;

    return NextResponse.json({
      success: true,
      licenses,
      stats: {
        totalLicenses,
        activeLicenses,
        totalSeats,
        usedSeats,
        totalPooledCredits,
        remainingPooledCredits,
        universitiesCovered,
        departmentsCovered,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/licenses:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch licenses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      licenseCode,
      institutionName,
      facultyName,
      departmentName,
      coordinatorName,
      coordinatorEmail,
      coordinatorPhone,
      planTier,
      totalSeats,
      creditsPerStudent,
      pooledCredits,
      features,
      academicSession,
      expiresAt,
    } = body;

    if (!institutionName || !departmentName || !coordinatorName || !coordinatorEmail) {
      return NextResponse.json(
        { success: false, error: 'Institution, Department, Coordinator Name, and Email are required.' },
        { status: 400 }
      );
    }

    // Default expiration to 1 year from now if not provided
    const effectiveExpiry = expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const license = await createInstitutionalLicense({
      licenseCode,
      institutionName,
      facultyName,
      departmentName,
      coordinatorName,
      coordinatorEmail,
      coordinatorPhone,
      planTier: planTier || 'departmental',
      totalSeats: totalSeats ? Number(totalSeats) : 150,
      creditsPerStudent: creditsPerStudent ? Number(creditsPerStudent) : 50,
      pooledCredits: pooledCredits ? Number(pooledCredits) : undefined,
      features,
      academicSession: academicSession || '2025/2026',
      expiresAt: effectiveExpiry,
    });

    return NextResponse.json({
      success: true,
      message: `Departmental license ${license.licenseCode} issued successfully for ${license.departmentName}.`,
      license,
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/licenses:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create license' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, updates } = body as { id: string; updates: Partial<InstitutionalLicense> };

    if (!id || !updates) {
      return NextResponse.json({ success: false, error: 'License ID and updates are required.' }, { status: 400 });
    }

    const updated = await updateInstitutionalLicense(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'License not found or could not be updated.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `License ${updated.licenseCode} updated successfully.`,
      license: updated,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/licenses:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update license' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'License ID is required.' }, { status: 400 });
    }

    const success = await deleteInstitutionalLicense(id);
    return NextResponse.json({
      success,
      message: success ? 'Institutional license revoked and deleted successfully.' : 'Failed to delete license.',
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/licenses:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete license' }, { status: 500 });
  }
}
