import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getWebhooksByUserId, createWebhook, deleteWebhook } from '@/lib/db';
import { validateWebhookUrl } from '@/lib/ssrfValidator';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const webhooks = await getWebhooksByUserId(user.id);
  return NextResponse.json({ webhooks });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const url = (body.url || '').trim();
  const description = (body.description || '').trim();
  const events = Array.isArray(body.events) && body.events.length > 0 ? body.events : ['*'];

  const urlValidation = validateWebhookUrl(url);
  if (!urlValidation.valid) {
    return NextResponse.json(
      { error: urlValidation.error || 'Invalid webhook destination URL' },
      { status: 400 }
    );
  }

  const webhook = await createWebhook({
    userId: user.id,
    url,
    description: description || undefined,
    events,
  });

  return NextResponse.json({ webhook, message: 'Webhook endpoint registered successfully.' });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const webhookId = searchParams.get('id');

  if (!webhookId) {
    return NextResponse.json({ error: 'Webhook id is required' }, { status: 400 });
  }

  const deleted = await deleteWebhook(webhookId, user.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Webhook not found or not owned by user' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Webhook deleted successfully.' });
}
