import { NextRequest, NextResponse } from 'next/server';
import { getAdminSettings, updateAdminApiKeys } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

function maskKey(key?: string): string {
  if (!key || key.trim() === '') return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '••••••••';
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const settings = await getAdminSettings();
    const aiEngine = settings.aiEngine || ({} as any);
    const keys = aiEngine.apiKeys || {};

    return NextResponse.json({
      success: true,
      activeProvider: aiEngine.activeProvider || 'heuristic',
      modelName: aiEngine.modelName || 'gemini-1.5-flash',
      fallbackEnabled: aiEngine.fallbackEnabled ?? true,
      keys: {
        gemini: {
          configured: !!keys.gemini && keys.gemini.trim() !== '',
          masked: maskKey(keys.gemini),
        },
        openai: {
          configured: !!keys.openai && keys.openai.trim() !== '',
          masked: maskKey(keys.openai),
        },
        groq: {
          configured: !!keys.groq && keys.groq.trim() !== '',
          masked: maskKey(keys.groq),
        },
        qwen: {
          configured: !!keys.qwen && keys.qwen.trim() !== '',
          masked: maskKey(keys.qwen),
        },
        anthropic: {
          configured: !!keys.anthropic && keys.anthropic.trim() !== '',
          masked: maskKey(keys.anthropic),
        },
        deepseek: {
          configured: !!keys.deepseek && keys.deepseek.trim() !== '',
          masked: maskKey(keys.deepseek),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch API key configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { activeProvider, gemini, openai, groq, qwen, anthropic, deepseek } = body as any;

    const updatedSettings = await updateAdminApiKeys({
      activeProvider,
      gemini,
      openai,
      groq,
      qwen,
      anthropic,
      deepseek,
    });

    const keys = updatedSettings.aiEngine?.apiKeys || {};

    return NextResponse.json({
      success: true,
      message: 'AI Provider & Key Vault updated successfully',
      activeProvider: updatedSettings.aiEngine?.activeProvider,
      keys: {
        gemini: {
          configured: !!keys.gemini && keys.gemini.trim() !== '',
          masked: maskKey(keys.gemini),
        },
        openai: {
          configured: !!keys.openai && keys.openai.trim() !== '',
          masked: maskKey(keys.openai),
        },
        groq: {
          configured: !!keys.groq && keys.groq.trim() !== '',
          masked: maskKey(keys.groq),
        },
        qwen: {
          configured: !!keys.qwen && keys.qwen.trim() !== '',
          masked: maskKey(keys.qwen),
        },
        anthropic: {
          configured: !!keys.anthropic && keys.anthropic.trim() !== '',
          masked: maskKey(keys.anthropic),
        },
        deepseek: {
          configured: !!keys.deepseek && keys.deepseek.trim() !== '',
          masked: maskKey(keys.deepseek),
        },
      },
    });
  } catch (error: any) {
    console.error('Error saving API keys:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update API keys' },
      { status: 500 }
    );
  }
}
