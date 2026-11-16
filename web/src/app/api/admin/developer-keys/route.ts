import { NextRequest, NextResponse } from 'next/server';
import { getAllApiKeys, adminToggleApiKeyStatus } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const keys = await getAllApiKeys();
    return NextResponse.json({ success: true, keys });
  } catch (error: any) {
    console.error('Error fetching admin developer keys:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch developer keys' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { keyId, status } = body as { keyId: string; status: 'active' | 'revoked' };

    if (!keyId || !status) {
      return NextResponse.json({ success: false, error: 'Key ID and status are required.' }, { status: 400 });
    }

    const success = await adminToggleApiKeyStatus(keyId, status);
    return NextResponse.json({
      success,
      message: success ? `API Key status changed to ${status}.` : 'Failed to update key status.',
    });
  } catch (error: any) {
    console.error('Error updating developer key status:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update developer key' }, { status: 500 });
  }
}
