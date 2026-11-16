import { NextRequest, NextResponse } from 'next/server';
import { getAdminSettings, updateAdminSettings, getAllUsers, getAllProjects, getAllTransactions } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const settings = await getAdminSettings();
    const users = await getAllUsers();
    const projects = await getAllProjects();
    const transactions = await getAllTransactions();

    const totalRevenueNgn = transactions
      .filter(t => t.status === 'success')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return NextResponse.json({
      success: true,
      settings,
      stats: {
        totalStudents: users.length,
        totalProjects: projects.length,
        totalTransactions: transactions.length,
        totalRevenueNgn,
        averageTurnitinScore: '3.8%',
      }
    });
  } catch (error: any) {
    console.error('Error fetching admin settings:', error);
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
    const updated = await updateAdminSettings(body);
    return NextResponse.json({
      success: true,
      settings: updated,
      message: 'Admin platform settings successfully saved.'
    });
  } catch (error: any) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
