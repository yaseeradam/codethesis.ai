import { NextRequest, NextResponse } from 'next/server';
import { getAuthAuditLogs } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const logs = await getAuthAuditLogs(limit);

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error: any) {
    console.error('Error fetching auth audit logs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
