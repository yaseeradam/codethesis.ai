import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateUser, getUserById, hashPassword } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    const userId = sessionUser?.id || 'demo-student-001';

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const {
      fullName,
      matricNumber,
      institution,
      plan,
      currentPassword,
      newPassword,
    } = body;

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const updates: any = {};
    if (fullName) updates.fullName = fullName.trim();
    if (matricNumber) updates.matricNumber = matricNumber.trim();
    if (institution) updates.institution = institution.trim();
    if (plan) updates.plan = plan;

    // Password change verification
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password is required to set a new password' },
          { status: 400 }
        );
      }
      const currentHashed = hashPassword(currentPassword);
      if (user.passwordHash !== currentHashed) {
        return NextResponse.json(
          { success: false, error: 'Incorrect current password' },
          { status: 401 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }
      updates.passwordHash = hashPassword(newPassword);
    }

    const updated = await updateUser(userId, updates);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to apply updates' },
        { status: 500 }
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
