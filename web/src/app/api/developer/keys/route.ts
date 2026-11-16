import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { generateApiKey, getApiKeysByUserId, revokeApiKey } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keys = await getApiKeysByUserId(user.id);
    return NextResponse.json({
      success: true,
      keys,
    });
  } catch (error: any) {
    console.error('Failed to list API keys:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list API keys' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const name = (body.name || 'Default Secret Key').trim();
    const isTest = Boolean(body.isTest);
    const isAllowedInstitutional = user.role === 'admin' || user.plan === 'faculty';
    const isInstitutional = isAllowedInstitutional && Boolean(body.isInstitutional);
    const institutionName = isInstitutional ? (body.institutionName || user.institution || '').trim() : undefined;
    const allowedDomains = (body.allowedDomains || '*').trim();

    const maxRateLimit = user.role === 'admin' ? 1000 : user.plan === 'faculty' ? 300 : user.plan === 'complete' ? 120 : 60;
    const requestedLimit = body.rateLimitPerMin ? Number(body.rateLimitPerMin) : (isInstitutional ? 300 : 60);
    const rateLimitPerMin = Math.min(Math.max(10, requestedLimit), maxRateLimit);

    const { rawKey, keyRecord } = await generateApiKey(user.id, name, isTest, {
      isInstitutional,
      institutionName: institutionName || undefined,
      allowedDomains,
      rateLimitPerMin,
    });

    return NextResponse.json({
      success: true,
      message: 'API Key generated successfully. Please copy this secret key now as you will not be able to see it again.',
      rawKey,
      key: keyRecord,
    });
  } catch (error: any) {
    console.error('Failed to generate API key:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 });
    }

    const success = await revokeApiKey(id, user.id);
    return NextResponse.json({
      success,
      message: success ? 'API key revoked successfully' : 'Failed to revoke API key',
    });
  } catch (error: any) {
    console.error('Failed to revoke API key:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to revoke API key' },
      { status: 500 }
    );
  }
}
