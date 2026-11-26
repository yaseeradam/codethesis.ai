// web/src/lib/plans.ts
// Unified Academic and Developer Plan & Credit Definitions for CodeThesis AI

export interface PlanConfig {
  id: string;
  name: string;
  priceNGN: number;
  credits: number;
  category: 'academic' | 'developer';
}

export const PLATFORM_PLANS: Record<string, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Student Starter',
    priceNGN: 3500,
    credits: 25,
    category: 'academic',
  },
  scholar: {
    id: 'scholar',
    name: 'Final Year Scholar',
    priceNGN: 8500,
    credits: 100,
    category: 'academic',
  },
  postgrad: {
    id: 'postgrad',
    name: 'Postgraduate & Pro',
    priceNGN: 18000,
    credits: 300,
    category: 'academic',
  },
  // Legacy aliases for backward compatibility
  standard: {
    id: 'standard',
    name: 'Student Starter',
    priceNGN: 3500,
    credits: 25,
    category: 'academic',
  },
  complete: {
    id: 'complete',
    name: 'Final Year Scholar',
    priceNGN: 8500,
    credits: 100,
    category: 'academic',
  },
  'fyp-complete': {
    id: 'fyp-complete',
    name: 'Final Year Scholar',
    priceNGN: 8500,
    credits: 100,
    category: 'academic',
  },
  faculty: {
    id: 'faculty',
    name: 'Postgraduate & Pro',
    priceNGN: 18000,
    credits: 300,
    category: 'academic',
  },
  // Developer wholesale packages
  'dev-hacker': {
    id: 'dev-hacker',
    name: 'Hacker API Pack',
    priceNGN: 5000,
    credits: 100,
    category: 'developer',
  },
  'dev-growth': {
    id: 'dev-growth',
    name: 'Growth API Pack',
    priceNGN: 25000,
    credits: 750,
    category: 'developer',
  },
  'dev-startup': {
    id: 'dev-startup',
    name: 'Startup API Pack',
    priceNGN: 80000,
    credits: 3000,
    category: 'developer',
  },
  'dev-enterprise': {
    id: 'dev-enterprise',
    name: 'Enterprise API Pack',
    priceNGN: 250000,
    credits: 12000,
    category: 'developer',
  },
  // High-converting Defense & Reseller Bundles
  'defense-bundle': {
    id: 'defense-bundle',
    name: 'Full Defense Bundle',
    priceNGN: 12000,
    credits: 20,
    category: 'academic',
  },
  'bulk-10': {
    id: 'bulk-10',
    name: 'Cyber Café Bulk Pack (10x)',
    priceNGN: 50000,
    credits: 200,
    category: 'academic',
  },
};

export const PRICE_PER_CUSTOM_CREDIT = 95; // ₦95 per credit

export function resolvePlanCreditsAndPrice(planId: string, requestedCredits?: number) {
  if (planId === 'custom' || planId === 'custom-topup') {
    const credits = Math.max(10, Math.min(10000, Number(requestedCredits) || 50));
    const priceNGN = credits * PRICE_PER_CUSTOM_CREDIT;
    return { planId: 'custom', credits, priceNGN, name: `Custom Topup (${credits} Credits)` };
  }

  const plan = PLATFORM_PLANS[planId] || PLATFORM_PLANS.starter;
  return {
    planId: plan.id,
    credits: plan.credits,
    priceNGN: plan.priceNGN,
    name: plan.name,
  };
}
