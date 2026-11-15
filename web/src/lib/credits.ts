import { getCurrentUser } from './auth';
import { deductUserCredits, saveProject, getAdminSettings, AdminSettings, getUserById } from './db';

export type ToolKey = keyof AdminSettings['toolCreditCosts'];

export interface CreditCheckResult {
  allowed: boolean;
  userId: string;
  remainingCredits: number;
  cost: number;
  errorMessage?: string;
}

/**
 * Validates and deducts credits for a student running an academic generation tool.
 * Falls back to demo student if no active session is present.
 */
export async function authorizeAndDeductCredits(
  toolKey: ToolKey,
  options?: { skipDeduction?: boolean }
): Promise<CreditCheckResult> {
  const sessionUser = await getCurrentUser();
  const userId = sessionUser?.id || 'demo-student-001';

  const settings = await getAdminSettings();
  const cost = settings.toolCreditCosts?.[toolKey] ?? 1;

  // Fetch current user from DB to get fresh credit balance
  const user = await getUserById(userId);
  if (!user) {
    return {
      allowed: false,
      userId,
      remainingCredits: 0,
      cost,
      errorMessage: 'User account not found.',
    };
  }

  // If this is a re-download of an already archived project, permit without double billing
  if (options?.skipDeduction) {
    return {
      allowed: true,
      userId,
      remainingCredits: user.credits,
      cost: 0,
    };
  }

  if (user.credits < cost) {
    return {
      allowed: false,
      userId,
      remainingCredits: user.credits,
      cost,
      errorMessage: `Insufficient academic credits. This operation requires ${cost} credit(s), but your current balance is ${user.credits} credit(s). Please top up to proceed.`,
    };
  }

  const result = await deductUserCredits(userId, toolKey);
  if (!result.success) {
    return {
      allowed: false,
      userId,
      remainingCredits: user.credits,
      cost,
      errorMessage: result.message,
    };
  }

  return {
    allowed: true,
    userId,
    remainingCredits: result.remainingCredits,
    cost,
  };
}

/**
 * Automatically archives generated output into the student's project repository.
 */
export async function autoArchiveProject(params: {
  userId: string;
  toolId: string;
  title: string;
  course: string;
  institution: string;
  summary: string;
  fileType: 'docx' | 'pptx' | 'zip' | 'pdf';
  fileDownloadUrl?: string;
  metadata?: Record<string, any>;
}) {
  try {
    return await saveProject({
      userId: params.userId,
      toolId: params.toolId,
      title: params.title,
      course: params.course,
      institution: params.institution,
      summary: params.summary,
      fileType: params.fileType,
      fileDownloadUrl: params.fileDownloadUrl,
      metadata: params.metadata,
    });
  } catch (err) {
    console.error('Failed to auto-archive project:', err);
    return null;
  }
}
