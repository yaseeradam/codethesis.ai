import { NextRequest, NextResponse } from 'next/server';
import { redeemInstitutionalLicense } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required. Please sign in to activate your departmental license.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { code } = body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ success: false, error: 'Please enter a valid Institutional Departmental License code.' }, { status: 400 });
    }

    const result = await redeemInstitutionalLicense(user.id, code.trim());
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      license: result.license,
      user: result.user,
    });
  } catch (error: any) {
    console.error('Error redeeming institutional license:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to redeem departmental license' }, { status: 500 });
  }
}
