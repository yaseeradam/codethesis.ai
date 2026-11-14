import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCreditLogsByUserId, getUserById } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    const userId = sessionUser?.id || 'demo-student-001';

    const user = await getUserById(userId);
    const logs = await getCreditLogsByUserId(userId);

    return NextResponse.json({
      success: true,
      userId,
      currentBalance: user?.credits ?? 0,
      totalTransactions: logs.length,
      logs,
    });
  } catch (error: any) {
    console.error('Credit history fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch credit history' },
      { status: 500 }
    );
  }
}
