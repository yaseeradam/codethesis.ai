import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, updateUser, deleteUser } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const users = await getAllUsers();
    // Return sanitized users (without password hashes)
    const sanitized = users.map(u => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      matricNumber: u.matricNumber || 'N/A',
      institution: u.institution || 'Nigerian University',
      department: u.department || 'N/A',
      plan: u.plan,
      credits: u.credits,
      role: u.role || 'student',
      status: u.status || 'active',
      licenseId: u.licenseId || null,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ success: true, users: sanitized });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, creditsToAdd, newPlan, newStatus, newRole } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required.' }, { status: 400 });
    }

    const updates: any = {};
    if (typeof creditsToAdd === 'number') {
      const users = await getAllUsers();
      const current = users.find(u => u.id === userId);
      if (current) {
        updates.credits = Math.max(0, current.credits + creditsToAdd);
      }
    }
    if (newPlan) updates.plan = newPlan;
    if (newStatus) updates.status = newStatus;
    if (newRole) updates.role = newRole;

    const updatedUser = await updateUser(userId, updates);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${updatedUser?.fullName} successfully updated.`
    });
  } catch (error: any) {
    console.error('Error updating user from admin:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    if (userId === user.id) {
      return NextResponse.json({ success: false, error: 'Cannot delete your own admin account.' }, { status: 400 });
    }

    const success = await deleteUser(userId);
    return NextResponse.json({
      success,
      message: success ? 'User removed from system.' : 'Failed to delete user.',
    });
  } catch (error: any) {
    console.error('Error deleting user from admin:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
