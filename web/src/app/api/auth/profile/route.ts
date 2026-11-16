import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateUser, getUserById, hashPassword, createNotification } from '@/lib/db';

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = sessionUser.id;

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        matricNumber: user.matricNumber || '',
        institution: user.institution || '',
        department: user.department || 'Computer Science',
        phone: user.phone || '',
        degreeLevel: user.degreeLevel || 'B.Sc',
        graduationYear: user.graduationYear || '2026',
        preferences: user.preferences || {
          citationFormat: 'apa7',
          lineSpacing: '1.5',
          pythonGui: 'tkinter',
          geminiKey: '',
          openAiKey: '',
        },
        plan: user.plan,
        credits: user.credits,
        role: user.role || 'student',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const userId = sessionUser.id;

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
      department,
      phone,
      degreeLevel,
      graduationYear,
      preferences,
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
    if (fullName !== undefined) updates.fullName = fullName.trim();
    if (matricNumber !== undefined) updates.matricNumber = matricNumber.trim();
    if (institution !== undefined) updates.institution = institution.trim();
    if (department !== undefined) updates.department = department.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (degreeLevel !== undefined) updates.degreeLevel = degreeLevel.trim();
    if (graduationYear !== undefined) updates.graduationYear = graduationYear.trim();
    if (plan !== undefined) updates.plan = plan;

    if (preferences !== undefined) {
      updates.preferences = {
        ...(user.preferences || {}),
        ...preferences,
      };
    }

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

    if (newPassword) {
      createNotification({
        userId,
        title: 'Security Alert: Password Changed',
        message: 'Your account password was updated successfully. If you did not initiate this change, contact support immediately.',
        type: 'security',
        link: '/settings',
      }).catch(() => {});
    } else {
      createNotification({
        userId,
        title: 'Profile Updated',
        message: 'Your institutional preferences and profile details have been saved.',
        type: 'info',
        link: '/settings',
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'All settings updated and saved to database successfully',
      user: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        matricNumber: updated.matricNumber,
        institution: updated.institution,
        department: updated.department,
        phone: updated.phone,
        degreeLevel: updated.degreeLevel,
        graduationYear: updated.graduationYear,
        preferences: updated.preferences,
        plan: updated.plan,
        credits: updated.credits,
        role: updated.role || 'student',
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
