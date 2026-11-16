import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getApiUsageLogsByUserId, getApiUsageStats } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const rawLimit = parseInt(url.searchParams.get('limit') || '50', 10);
    const limit = isNaN(rawLimit) ? 50 : Math.min(Math.max(rawLimit, 1), 100);

    const [stats, logs] = await Promise.all([
      getApiUsageStats(user.id),
      getApiUsageLogsByUserId(user.id, limit),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      logs,
    });
  } catch (error: any) {
    console.error('Failed to get API usage stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch API usage' },
      { status: 500 }
    );
  }
}
