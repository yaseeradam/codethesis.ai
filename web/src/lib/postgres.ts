import { neon, NeonQueryFunction } from '@neondatabase/serverless';

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || '';
}

// Reusable serverless SQL query function initialized safely from environment
const dbUrl = getDatabaseUrl() || 'postgresql://localhost:5432/neondb';
export const sql: NeonQueryFunction<false, false> = neon(dbUrl);

export function isNeonConfigured(): boolean {
  const url = getDatabaseUrl();
  return Boolean(
    url &&
    url.startsWith('postgresql://') &&
    !url.includes('placeholder') &&
    !url.includes('localhost')
  );
}
