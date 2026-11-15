import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAdminSettings, getUserById, deductUserCredits, AdminSettings } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { toolId, toolType } = body as any;
    const resolvedToolId = (toolId || toolType) as keyof AdminSettings['toolCreditCosts'];

    if (!resolvedToolId) {
      return NextResponse.json(
        { success: false, error: 'toolId or toolType is required (e.g. thesis, softwareBuilder, vivaSimulator)' },
        { status: 400 }
      );
    }

    const sessionUser = await getCurrentUser();
    const userId = sessionUser?.id || 'demo-student-001';

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User account not found' },
        { status: 404 }
      );
    }

    const settings = await getAdminSettings();
    const cost = settings.toolCreditCosts?.[resolvedToolId] ?? 1;

    if (user.credits < cost) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient academic credits. This operation requires ${cost} credit(s), but your current balance is ${user.credits} credit(s). Please top up to proceed.`,
          cost,
          currentBalance: user.credits,
        },
        { status: 402 } // Payment Required
      );
    }

    const deduction = await deductUserCredits(userId, resolvedToolId);

    return NextResponse.json({
      success: deduction.success,
      message: deduction.message,
      cost,
      remainingCredits: deduction.remainingCredits,
      userId,
      toolId: resolvedToolId,
    });
  } catch (error: any) {
    console.error('Credit deduction error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process credit deduction' },
      { status: 500 }
    );
  }
}
