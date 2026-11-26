import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { updateUser } from '@/lib/db';

export async function GET() {
  try {
    let user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }
    if (!user.referralCode) {
      const generatedCode = `CT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const updated = await updateUser(user.id, {
        referralCode: generatedCode,
        referralEarnings: user.referralEarnings || 0,
        referralCount: user.referralCount || 0,
      }).catch(() => null);
      if (updated) user = updated;
    }
    const { passwordHash, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error: any) {
    return NextResponse.json(
      { user: null, error: error.message || 'Failed to authenticate session' },
      { status: 500 }
    );
  }
}
