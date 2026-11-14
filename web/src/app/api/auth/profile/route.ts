import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateUser } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    const userId = sessionUser?.id || 'demo-student-001';

    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { fullName, matricNumber, institution, plan } = body as any;

    const updated = await updateUser(userId, {
      ...(fullName ? { fullName } : {}),
      ...(matricNumber ? { matricNumber } : {}),
      ...(institution ? { institution } : {}),
      ...(plan ? { plan } : {}),
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        matricNumber: updated.matricNumber,
        institution: updated.institution,
        plan: updated.plan,
        credits: updated.credits,
      },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
