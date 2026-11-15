import { neon, NeonQueryFunction } from '@neondatabase/serverless';

export const NEON_DEFAULT_URL =
  "postgresql://neondb_owner:npg_FwMARV67PnQh@ep-morning-grass-bbw4zu2z-pooler.c-15.us-east-1.aws.neon.tech/neondb?sslmode=require";

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || NEON_DEFAULT_URL;
}

// Reusable serverless SQL query function
export const sql: NeonQueryFunction<false, false> = neon(getDatabaseUrl());

export function isNeonConfigured(): boolean {
  const url = getDatabaseUrl();
  return Boolean(
    url &&
    url.startsWith('postgresql://') &&
    !url.includes('placeholder')
  );
}
