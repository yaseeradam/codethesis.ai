import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sql, isNeonConfigured } from './postgres';
export { sql, isNeonConfigured };

export interface UserPreferences {
  citationFormat?: 'apa7' | 'harvard' | 'ieee';
  lineSpacing?: '1.5' | '2.0';
  pythonGui?: 'tkinter' | 'flask';
  geminiKey?: string;
  openAiKey?: string;
  theme?: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  matricNumber?: string;
  institution?: string;
  department?: string;
  phone?: string;
  degreeLevel?: string;
  graduationYear?: string;
  preferences?: UserPreferences;
  plan: 'free' | 'starter' | 'standard' | 'complete' | 'faculty';
  credits: number;
  status?: 'active' | 'flagged' | 'suspended';
  role?: 'student' | 'admin';
  licenseId?: string;
  referralCode?: string;
  referredBy?: string;
  referralEarnings?: number;
  referralCount?: number;
  resetToken?: { token: string; expiresAt: string };
  createdAt: string;
}

export interface AuthAuditLog {
  id: string;
  userId?: string;
  email: string;
  action: 'signin_success' | 'signin_failed' | 'password_reset_requested' | 'password_reset_success' | 'role_access_denied';
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface Project {
  id: string;
  userId: string;
  toolId: string;
  title: string;
  course: string;
  institution: string;
  summary?: string;
  fileType: 'docx' | 'pptx' | 'zip' | 'pdf';
  fileDownloadUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  reference: string;
  amount: number; // in Naira
  currency: string;
  status: 'pending' | 'success' | 'failed';
  planId: string;
  channel?: string;
  credits?: number;
  paidAt?: string;
  createdAt: string;
}

export interface CreditLog {
  id: string;
  userId: string;
  amount: number; // positive for credit addition, negative for deduction
  type: 'signup_bonus' | 'tool_usage' | 'payment_topup' | 'admin_grant' | 'refund';
  toolId?: string;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'credit' | 'project' | 'payment' | 'security' | 'info' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  maskedKey: string;
  rateLimitPerMin: number;
  status: 'active' | 'revoked';
  isInstitutional?: boolean;
  institutionName?: string;
  allowedDomains?: string;
  lastUsedAt?: string;
  createdAt: string;
}

export interface ApiUsageLog {
  id: string;
  apiKeyId: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  creditsDeducted: number;
  responseTimeMs: number;
  ipAddress?: string;
  createdAt: string;
}

export interface ApiWebhook {
  id: string;
  userId: string;
  url: string;
  secret: string;
  events: string[];
  status: 'active' | 'inactive';
  description?: string;
  createdAt: string;
  lastTriggeredAt?: string;
}

export interface ApiJob {
  id: string;
  userId: string;
  keyId?: string;
  jobType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  inputPayload?: any;
  resultPayload?: any;
  errorMessage?: string;
  webhookUrl?: string;
  creditsBilled: number;
  createdAt: string;
  completedAt?: string;
}

export interface VivaTurn {
  id: string;
  role: 'examiner' | 'student';
  content: string;
  feedback?: string;
  rating?: number; // 1-10
  timestamp: string;
}

export interface VivaSession {
  id: string;
  userId: string;
  topic: string;
  course: string;
  examinerPersona: 'strict' | 'methodological' | 'industry';
  turns: VivaTurn[];
  scorecard?: {
    clarity: number;
    technicalDepth: number;
    methodology: number;
    overallScore: number;
    summary: string;
    verdict: 'Pass with Distinction' | 'Pass with Minor Corrections' | 'Major Revision Needed';
  };
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettings {
  defaultSignupCredits: number;
  toolCreditCosts: {
    thesis: number;
    softwareBuilder: number;
    siwesLogbook: number;
    itfReport: number;
    vivaPresentation: number;
    vivaSimulator: number;
    umlDiagrams: number;
    assignmentSolver: number;
  };
  aiEngine: {
    activeProvider: 'heuristic' | 'gemini' | 'openai' | 'groq' | 'qwen' | 'anthropic' | 'deepseek';
    modelName: string;
    temperature: number;
    maxTokens: number;
    systemPromptOverride: string;
    fallbackEnabled: boolean;
    apiKeys?: {
      gemini?: string;
      openai?: string;
      groq?: string;
      qwen?: string;
      anthropic?: string;
      deepseek?: string;
    };
  };
  platformStatus: {
    online: boolean;
    statusText: string;
    maintenanceNotice: string;
  };
}

export interface InstitutionalLicense {
  id: string;
  licenseCode: string;
  institutionName: string;
  facultyName?: string;
  departmentName: string;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone?: string;
  planTier: 'departmental' | 'faculty' | 'campus_wide';
  totalSeats: number;
  usedSeats: number;
  creditsPerStudent: number;
  pooledCredits: number;
  remainingPooledCredits: number;
  features: string[];
  academicSession: string;
  status: 'active' | 'suspended' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export interface InstitutionalQuote {
  id: string;
  institutionName: string;
  facultyName?: string;
  departmentName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  estimatedStudents: number;
  tier: string;
  customRequirements?: string;
  status: 'pending' | 'approved' | 'rejected';
  estimatedAmountNgn: number;
  createdAt: string;
}

export type ToolKey = keyof AdminSettings['toolCreditCosts'];

interface DatabaseSchema {
  users: User[];
  projects: Project[];
  transactions: Transaction[];
  creditLogs?: CreditLog[];
  notifications?: Notification[];
  apiKeys?: ApiKey[];
  apiUsageLogs?: ApiUsageLog[];
  apiWebhooks?: ApiWebhook[];
  apiJobs?: ApiJob[];
  vivaSessions?: VivaSession[];
  authAuditLogs?: AuthAuditLog[];
  institutionalLicenses?: InstitutionalLicense[];
  institutionalQuotes?: InstitutionalQuote[];
  settings: AdminSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'codethesis_db.json');

const DEFAULT_SETTINGS: AdminSettings = {
  defaultSignupCredits: 15,
  toolCreditCosts: {
    thesis: 3,
    softwareBuilder: 2,
    siwesLogbook: 2,
    itfReport: 2,
    vivaPresentation: 1,
    vivaSimulator: 1,
    umlDiagrams: 1,
    assignmentSolver: 1,
  },
  aiEngine: {
    activeProvider: 'gemini',
    modelName: 'gemini-2.5-flash',
    temperature: 0.7,
    maxTokens: 8192,
    systemPromptOverride: 'You are CodeThesis AI, the authoritative academic engineering copilot for tertiary university dissertations.',
    fallbackEnabled: true,
  },
  platformStatus: {
    online: true,
    statusText: 'All Systems Online',
    maintenanceNotice: 'Platform operating normally at 100% capacity.',
  },
};

// ─────────────────────────────────────────────────────────────
// Password Hashing with Bcrypt (with Legacy SHA-256 fallback)
// ─────────────────────────────────────────────────────────────
export function hashPassword(password: string): string {
  try {
    return bcrypt.hashSync(password, 10);
  } catch {
    return crypto.createHash('sha256').update(password + 'codethesis_academic_salt_2026').digest('hex');
  }
}

export function verifyPassword(password: string, hash: string): boolean {
  if (!password || !hash) return false;
  // If bcrypt hash
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    try {
      return bcrypt.compareSync(password, hash);
    } catch {
      return false;
    }
  }
  // Otherwise sha256
  const sha = crypto.createHash('sha256').update(password + 'codethesis_academic_salt_2026').digest('hex');
  return sha === hash || password === hash;
}

// ─────────────────────────────────────────────────────────────
// Local File-based Fallback Store
// ─────────────────────────────────────────────────────────────
function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      users: [],
      authAuditLogs: [],
      projects: [],
      transactions: [],
      settings: DEFAULT_SETTINGS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export function readDb(): DatabaseSchema {
  ensureDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.settings) data.settings = DEFAULT_SETTINGS;
    if (!data.creditLogs) data.creditLogs = [];
    if (!data.notifications) data.notifications = [];
    if (!data.apiKeys) data.apiKeys = [];
    if (!data.apiUsageLogs) data.apiUsageLogs = [];
    if (!data.vivaSessions) data.vivaSessions = [];
    if (!data.authAuditLogs) data.authAuditLogs = [];
    if (!data.institutionalLicenses) data.institutionalLicenses = [];
    if (!data.institutionalQuotes) data.institutionalQuotes = [];
    return data;
  } catch (err) {
    return {
      users: [],
      projects: [],
      transactions: [],
      creditLogs: [],
      notifications: [],
      apiKeys: [],
      apiUsageLogs: [],
      vivaSessions: [],
      authAuditLogs: [],
      institutionalLicenses: [],
      institutionalQuotes: [],
      settings: DEFAULT_SETTINGS,
    };
  }
}

export function writeDb(data: DatabaseSchema): void {
  ensureDb();
  const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_FILE);
  } catch (err) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
}

// ─────────────────────────────────────────────────────────────
// User Operations (Neon PostgreSQL with Local Fallback)
// ─────────────────────────────────────────────────────────────
export async function getUserByEmail(email: string): Promise<User | null> {
  const cleanEmail = email.toLowerCase().trim();
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, email, password_hash as "passwordHash", full_name as "fullName",
               matric_number as "matricNumber", institution, department, phone,
               degree_level as "degreeLevel", graduation_year as "graduationYear",
               preferences, plan, credits,
               status, role, license_id as "licenseId", reset_token as "resetToken", created_at as "createdAt"
        FROM users
        WHERE LOWER(email) = ${cleanEmail}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        return rows[0] as User;
      }
      return null;
    } catch (err) {
      console.error('Neon getUserByEmail error, falling back to local store:', err);
    }
  }

  const db = readDb();
  return db.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, email, password_hash as "passwordHash", full_name as "fullName",
               matric_number as "matricNumber", institution, department, phone,
               degree_level as "degreeLevel", graduation_year as "graduationYear",
               preferences, plan, credits,
               status, role, license_id as "licenseId", reset_token as "resetToken", created_at as "createdAt"
        FROM users
        WHERE id = ${id}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        return rows[0] as User;
      }
      return null;
    } catch (err) {
      console.error('Neon getUserById error, falling back to local store:', err);
    }
  }

  const db = readDb();
  return db.users.find(u => u.id === id) || null;
}

export async function createUser(userData: {
  email: string;
  password: string;
  fullName: string;
  matricNumber?: string;
  institution?: string;
  department?: string;
  phone?: string;
  degreeLevel?: string;
  graduationYear?: string;
  preferences?: UserPreferences;
  role?: 'student' | 'admin';
  referredBy?: string;
}): Promise<User> {
  const existing = await getUserByEmail(userData.email);
  if (existing) {
    throw new Error('User with this email already exists.');
  }

  const id = `usr-${crypto.randomUUID().slice(0, 8)}`;
  const cleanEmail = userData.email.toLowerCase().trim();
  const passwordHash = hashPassword(userData.password);
  const fullName = userData.fullName.trim();
  const matricNumber = userData.matricNumber?.trim() || '';
  const institution = userData.institution?.trim() || '';
  const department = userData.department?.trim() || '';
  const phone = userData.phone?.trim() || '';
  const degreeLevel = userData.degreeLevel?.trim() || 'B.Sc';
  const graduationYear = userData.graduationYear?.trim() || '';
  const preferences = userData.preferences || {
    citationFormat: 'apa7',
    lineSpacing: '1.5',
    pythonGui: 'tkinter',
  };
  const freeCredits = 15;
  const role = userData.role || 'student';
  const referralCode = `CT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const referredBy = userData.referredBy?.trim().toUpperCase() || undefined;
  const createdAt = new Date().toISOString();

  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        INSERT INTO users (id, email, password_hash, full_name, matric_number, institution, department, phone, degree_level, graduation_year, preferences, plan, credits, role, status, created_at)
        VALUES (${id}, ${cleanEmail}, ${passwordHash}, ${fullName}, ${matricNumber}, ${institution}, ${department}, ${phone}, ${degreeLevel}, ${graduationYear}, ${JSON.stringify(preferences)}, 'free', ${freeCredits}, ${role}, 'active', ${createdAt})
        RETURNING id, email, password_hash as "passwordHash", full_name as "fullName",
                  matric_number as "matricNumber", institution, department, phone,
                  degree_level as "degreeLevel", graduation_year as "graduationYear",
                  preferences, plan, credits,
                  status, role, reset_token as "resetToken", created_at as "createdAt";
      `;
      if (rows && rows.length > 0) {
        return { ...(rows[0] as User), referralCode, referredBy, referralEarnings: 0, referralCount: 0 };
      }
    } catch (err) {
      console.error('Neon createUser error, falling back to local store:', err);
    }
  }

  const db = readDb();
  let validReferrerCode: string | undefined;
  if (referredBy) {
    const referrerIdx = db.users.findIndex(
      (u) => (u.referralCode || '').toUpperCase() === referredBy || u.id === referredBy
    );
    if (referrerIdx !== -1) {
      validReferrerCode = db.users[referrerIdx].referralCode || referredBy;
      db.users[referrerIdx].referralCount = (db.users[referrerIdx].referralCount || 0) + 1;
    }
  }

  const newUser: User = {
    id,
    email: cleanEmail,
    passwordHash,
    fullName,
    matricNumber,
    institution,
    department,
    phone,
    degreeLevel,
    graduationYear,
    preferences,
    plan: 'free',
    credits: freeCredits,
    role,
    status: 'active',
    referralCode,
    referredBy: validReferrerCode,
    referralEarnings: 0,
    referralCount: 0,
    createdAt,
  };
  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

export async function creditReferralCommission(buyerUserId: string, amountNGN: number): Promise<void> {
  if (!amountNGN || amountNGN <= 0) return;
  const db = readDb();
  const buyer = db.users.find((u) => u.id === buyerUserId);
  if (!buyer || !buyer.referredBy) return;

  const referrerIdx = db.users.findIndex(
    (u) => (u.referralCode || '').toUpperCase() === buyer.referredBy!.toUpperCase() || u.id === buyer.referredBy
  );
  if (referrerIdx === -1) return;

  const commissionNGN = Math.round(amountNGN * 0.25); // 25% Campus Ambassador commission
  const bonusCredits = 3;
  const referrer = db.users[referrerIdx];
  referrer.referralEarnings = (referrer.referralEarnings || 0) + commissionNGN;
  referrer.credits = (referrer.credits || 0) + bonusCredits;
  writeDb(db);

  await logCreditEntry({
    userId: referrer.id,
    amount: bonusCredits,
    type: 'admin_grant',
    balanceAfter: referrer.credits,
    description: `Campus Ambassador 25% commission (₦${commissionNGN.toLocaleString()}) + ${bonusCredits} bonus credits from ${buyer.fullName}`,
  });

  await createNotification({
    userId: referrer.id,
    title: `Referral Commission Earned: ₦${commissionNGN.toLocaleString()}!`,
    message: `${buyer.fullName} just upgraded! You earned ₦${commissionNGN.toLocaleString()} (25%) and +${bonusCredits} bonus credits.`,
    type: 'payment',
    link: '/dashboard',
  });
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  if (isNeonConfigured()) {
    try {
      const current = await getUserById(id);
      if (!current) return null;
      const merged = { ...current, ...updates };

      const rows = await sql`
        UPDATE users SET
          email = ${merged.email},
          password_hash = ${merged.passwordHash},
          full_name = ${merged.fullName},
          matric_number = ${merged.matricNumber || null},
          institution = ${merged.institution || null},
          department = ${merged.department || null},
          phone = ${merged.phone || null},
          degree_level = ${merged.degreeLevel || null},
          graduation_year = ${merged.graduationYear || null},
          preferences = ${JSON.stringify(merged.preferences || {})},
          plan = ${merged.plan},
          credits = ${merged.credits},
          status = ${merged.status || 'active'},
          role = ${merged.role || 'student'},
          license_id = ${merged.licenseId || null},
          reset_token = ${merged.resetToken ? JSON.stringify(merged.resetToken) : null}
        WHERE id = ${id}
        RETURNING id, email, password_hash as "passwordHash", full_name as "fullName",
                  matric_number as "matricNumber", institution, department, phone,
                  degree_level as "degreeLevel", graduation_year as "graduationYear",
                  preferences, plan, credits,
                  status, role, license_id as "licenseId", reset_token as "resetToken", created_at as "createdAt";
      `;
      if (rows && rows.length > 0) {
        return rows[0] as User;
      }
    } catch (err) {
      console.error('Neon updateUser error, falling back to local store:', err);
    }
  }

  const db = readDb();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return null;

  db.users[index] = { ...db.users[index], ...updates };
  writeDb(db);
  return db.users[index];
}

export async function deleteUser(id: string): Promise<boolean> {
  if (isNeonConfigured()) {
    try {
      await sql`DELETE FROM users WHERE id = ${id};`;
      return true;
    } catch (err) {
      console.error('Neon deleteUser error:', err);
    }
  }

  const db = readDb();
  const initial = db.users.length;
  db.users = db.users.filter(u => u.id !== id);
  writeDb(db);
  return db.users.length < initial;
}

export async function getAllUsers(): Promise<User[]> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, email, password_hash as "passwordHash", full_name as "fullName",
               matric_number as "matricNumber", institution, department, phone,
               degree_level as "degreeLevel", graduation_year as "graduationYear",
               preferences, plan, credits, status, role, license_id as "licenseId",
               reset_token as "resetToken", created_at as "createdAt"
        FROM users
        ORDER BY created_at DESC;
      `;
      return rows as User[];
    } catch (err) {
      console.error('Neon getAllUsers error, falling back to local store:', err);
    }
  }

  const db = readDb();
  return db.users;
}

// ─────────────────────────────────────────────────────────────
// Credit Operations
// ─────────────────────────────────────────────────────────────
export async function deductUserCredits(
  userId: string,
  toolType: keyof AdminSettings['toolCreditCosts']
): Promise<{ success: boolean; remainingCredits: number; message: string }> {
  const settings = await getAdminSettings();
  const cost = settings.toolCreditCosts?.[toolType] ?? 1;
  let newBalance = 0;

  if (isNeonConfigured()) {
    try {
      // Atomic conditional update prevents race conditions & negative balances
      const rows = await sql`
        UPDATE users
        SET credits = credits - ${cost}
        WHERE id = ${userId} AND credits >= ${cost}
        RETURNING credits;
      `;

      if (!rows || rows.length === 0) {
        const latestUser = await getUserById(userId);
        if (!latestUser) {
          return { success: false, remainingCredits: 0, message: 'User not found' };
        }
        return {
          success: false,
          remainingCredits: latestUser.credits,
          message: `Insufficient credits. This tool requires ${cost} credit(s), but you have ${latestUser.credits}.`
        };
      }

      newBalance = Number(rows[0].credits);
    } catch (err) {
      console.error('Neon atomic deductUserCredits error, falling back to local store:', err);
    }
  }

  if (!isNeonConfigured() || newBalance === 0) {
    const user = await getUserById(userId);
    if (!user) {
      return { success: false, remainingCredits: 0, message: 'User not found' };
    }

    if (user.credits < cost) {
      return {
        success: false,
        remainingCredits: user.credits,
        message: `Insufficient credits. This tool requires ${cost} credit(s), but you have ${user.credits}.`
      };
    }

    newBalance = user.credits - cost;
    await updateUser(userId, { credits: newBalance });
  }

  const logId = `log-${crypto.randomUUID().slice(0, 8)}`;
  const description = `Used ${toolType} tool (${cost} credit${cost > 1 ? 's' : ''})`;
  const createdAt = new Date().toISOString();

  if (isNeonConfigured()) {
    try {
      await sql`
        INSERT INTO credit_logs (id, user_id, amount, type, tool_id, balance_after, description, created_at)
        VALUES (${logId}, ${userId}, ${-cost}, 'tool_usage', ${toolType}, ${newBalance}, ${description}, ${createdAt});
      `;
    } catch (err) {
      console.error('Neon insert credit_log error:', err);
    }
  }

  const db = readDb();
  if (!db.creditLogs) db.creditLogs = [];
  db.creditLogs.unshift({
    id: logId,
    userId,
    amount: -cost,
    type: 'tool_usage',
    toolId: toolType,
    balanceAfter: newBalance,
    description,
    createdAt,
  });
  writeDb(db);

  return {
    success: true,
    remainingCredits: newBalance,
    message: `Deducted ${cost} credit(s). ${newBalance} credits remaining.`
  };
}

export async function addCreditsOnPayment(userId: string, creditsToAdd: number, planId?: string): Promise<User | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  const newBalance = user.credits + creditsToAdd;
  const updates: Partial<User> = { credits: newBalance };
  if (planId) updates.plan = planId as any;

  const updatedUser = await updateUser(userId, updates);

  const logId = `log-${crypto.randomUUID().slice(0, 8)}`;
  const description = `Payment credit top-up (${creditsToAdd} credits added${planId ? ' - ' + planId : ''})`;
  const createdAt = new Date().toISOString();

  if (isNeonConfigured()) {
    try {
      await sql`
        INSERT INTO credit_logs (id, user_id, amount, type, balance_after, description, created_at)
        VALUES (${logId}, ${userId}, ${creditsToAdd}, 'payment_topup', ${newBalance}, ${description}, ${createdAt});
      `;
    } catch (err) {
      console.error('Neon insert payment credit log error:', err);
    }
  }

  const db = readDb();
  if (!db.creditLogs) db.creditLogs = [];
  db.creditLogs.unshift({
    id: logId,
    userId,
    amount: creditsToAdd,
    type: 'payment_topup',
    balanceAfter: newBalance,
    description,
    createdAt,
  });
  writeDb(db);

  return updatedUser;
}

export async function logCreditEntry(entry: {
  userId: string;
  amount: number;
  type: CreditLog['type'];
  balanceAfter: number;
  description: string;
  toolId?: string;
}): Promise<CreditLog> {
  const logId = `log-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  if (isNeonConfigured()) {
    try {
      await sql`
        INSERT INTO credit_logs (id, user_id, amount, type, tool_id, balance_after, description, created_at)
        VALUES (${logId}, ${entry.userId}, ${entry.amount}, ${entry.type}, ${entry.toolId || null}, ${entry.balanceAfter}, ${entry.description}, ${now});
      `;
    } catch (err) {
      console.error('Neon logCreditEntry error:', err);
    }
  }

  const db = readDb();
  if (!db.creditLogs) db.creditLogs = [];
  const newLog: CreditLog = {
    id: logId,
    userId: entry.userId,
    amount: entry.amount,
    type: entry.type,
    toolId: entry.toolId,
    balanceAfter: entry.balanceAfter,
    description: entry.description,
    createdAt: now,
  };
  db.creditLogs.unshift(newLog);
  writeDb(db);
  return newLog;
}

export const updateTransactionByReference = updateTransaction;

export async function getCreditLogsByUserId(userId: string): Promise<CreditLog[]> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, user_id as "userId", amount, type, tool_id as "toolId",
               balance_after as "balanceAfter", description, created_at as "createdAt"
        FROM credit_logs
        WHERE user_id = ${userId}
        ORDER BY created_at DESC;
      `;
      return rows as CreditLog[];
    } catch (err) {
      console.error('Neon getCreditLogsByUserId error:', err);
    }
  }

  const db = readDb();
  return (db.creditLogs || []).filter(l => l.userId === userId);
}

// ─────────────────────────────────────────────────────────────
// Notification Operations
// ─────────────────────────────────────────────────────────────
export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type?: Notification['type'];
  link?: string;
}): Promise<Notification> {
  const id = `notif-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const type = data.type || 'info';

  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        INSERT INTO notifications (id, user_id, title, message, type, read, link, created_at)
        VALUES (${id}, ${data.userId}, ${data.title}, ${data.message}, ${type}, FALSE, ${data.link || null}, ${now})
        RETURNING id, user_id as "userId", title, message, type, read, link, created_at as "createdAt";
      `;
      if (rows && rows.length > 0) return rows[0] as Notification;
    } catch (err) {
      console.error('Neon createNotification error:', err);
    }
  }

  const db = readDb();
  if (!db.notifications) db.notifications = [];
  const notif: Notification = {
    id,
    userId: data.userId,
    title: data.title,
    message: data.message,
    type,
    read: false,
    link: data.link,
    createdAt: now,
  };
  db.notifications.unshift(notif);
  writeDb(db);
  return notif;
}

export async function getNotificationsByUserId(userId: string, limit = 30): Promise<Notification[]> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, user_id as "userId", title, message, type, read, link, created_at as "createdAt"
        FROM notifications
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit};
      `;
      return rows as Notification[];
    } catch (err) {
      console.error('Neon getNotificationsByUserId error:', err);
    }
  }

  const db = readDb();
  return (db.notifications || []).filter(n => n.userId === userId).slice(0, limit);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT COUNT(*)::int as count
        FROM notifications
        WHERE user_id = ${userId} AND read = FALSE;
      `;
      if (rows && rows.length > 0) {
        return Number(rows[0].count) || 0;
      }
    } catch (err) {
      console.error('Neon getUnreadNotificationCount error:', err);
    }
  }

  const db = readDb();
  return (db.notifications || []).filter(n => n.userId === userId && !n.read).length;
}

export async function markNotificationAsRead(id: string, userId: string): Promise<boolean> {
  if (isNeonConfigured()) {
    try {
      await sql`
        UPDATE notifications
        SET read = TRUE
        WHERE id = ${id} AND user_id = ${userId};
      `;
      return true;
    } catch (err) {
      console.error('Neon markNotificationAsRead error:', err);
    }
  }

  const db = readDb();
  if (!db.notifications) return false;
  const item = db.notifications.find(n => n.id === id && n.userId === userId);
  if (item) {
    item.read = true;
    writeDb(db);
    return true;
  }
  return false;
}

export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  if (isNeonConfigured()) {
    try {
      const result = await sql`
        UPDATE notifications
        SET read = TRUE
        WHERE user_id = ${userId} AND read = FALSE
        RETURNING id;
      `;
      return result ? result.length : 0;
    } catch (err) {
      console.error('Neon markAllNotificationsAsRead error:', err);
    }
  }

  const db = readDb();
  if (!db.notifications) return 0;
  let count = 0;
  db.notifications.forEach(n => {
    if (n.userId === userId && !n.read) {
      n.read = true;
      count++;
    }
  });
  if (count > 0) writeDb(db);
  return count;
}

export async function deleteNotification(id: string, userId: string): Promise<boolean> {
  if (isNeonConfigured()) {
    try {
      await sql`
        DELETE FROM notifications
        WHERE id = ${id} AND user_id = ${userId};
      `;
      return true;
    } catch (err) {
      console.error('Neon deleteNotification error:', err);
    }
  }

  const db = readDb();
  if (!db.notifications) return false;
  const initLen = db.notifications.length;
  db.notifications = db.notifications.filter(n => !(n.id === id && n.userId === userId));
  const removed = db.notifications.length < initLen;
  if (removed) writeDb(db);
  return removed;
}

export async function clearAllNotifications(userId: string): Promise<boolean> {
  if (isNeonConfigured()) {
    try {
      await sql`
        DELETE FROM notifications
        WHERE user_id = ${userId};
      `;
      return true;
    } catch (err) {
      console.error('Neon clearAllNotifications error:', err);
    }
  }

  const db = readDb();
  if (!db.notifications) return true;
  db.notifications = db.notifications.filter(n => n.userId !== userId);
  writeDb(db);
  return true;
}

// ─────────────────────────────────────────────────────────────
// Project Operations
// ─────────────────────────────────────────────────────────────
export async function saveProject(projectData: {
  userId: string;
  toolId: string;
  title: string;
  course: string;
  institution: string;
  summary?: string;
  fileType?: 'docx' | 'pptx' | 'zip' | 'pdf';
  fileDownloadUrl?: string;
  metadata?: Record<string, any>;
}): Promise<Project> {
  const id = `proj-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
  const fileType = projectData.fileType || 'docx';

  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        INSERT INTO projects (id, user_id, tool_id, title, course, institution, summary, file_type, file_download_url, metadata, created_at, updated_at)
        VALUES (
          ${id},
          ${projectData.userId},
          ${projectData.toolId},
          ${projectData.title},
          ${projectData.course},
          ${projectData.institution},
          ${projectData.summary || null},
          ${fileType},
          ${projectData.fileDownloadUrl || null},
          ${projectData.metadata ? JSON.stringify(projectData.metadata) : null},
          ${createdAt},
          ${createdAt}
        )
        RETURNING id, user_id as "userId", tool_id as "toolId", title, course,
                  institution, summary, file_type as "fileType",
                  file_download_url as "fileDownloadUrl", metadata,
                  created_at as "createdAt", updated_at as "updatedAt";
      `;
      if (rows && rows.length > 0) return rows[0] as Project;
    } catch (err) {
      console.error('Neon saveProject error:', err);
    }
  }

  const db = readDb();
  const newProject: Project = {
    id,
    userId: projectData.userId,
    toolId: projectData.toolId,
    title: projectData.title,
    course: projectData.course,
    institution: projectData.institution,
    summary: projectData.summary,
    fileType,
    fileDownloadUrl: projectData.fileDownloadUrl,
    metadata: projectData.metadata,
    createdAt,
    updatedAt: createdAt,
  };
  db.projects.unshift(newProject);
  writeDb(db);
  return newProject;
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, user_id as "userId", tool_id as "toolId", title, course,
               institution, summary, file_type as "fileType",
               file_download_url as "fileDownloadUrl", metadata,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM projects
        WHERE id = ${id}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) return rows[0] as Project;
      return null;
    } catch (err) {
      console.error('Neon getProjectById error:', err);
    }
  }

  const db = readDb();
  return db.projects.find(p => p.id === id) || null;
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, user_id as "userId", tool_id as "toolId", title, course,
               institution, summary, file_type as "fileType",
               file_download_url as "fileDownloadUrl", metadata,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM projects
        WHERE user_id = ${userId}
        ORDER BY created_at DESC;
      `;
      return rows as Project[];
    } catch (err) {
      console.error('Neon getProjectsByUserId error:', err);
    }
  }

  const db = readDb();
  return db.projects.filter(p => p.userId === userId);
}

export async function updateProject(id: string, userId: string, updates: Partial<Project>): Promise<Project | null> {
  if (isNeonConfigured()) {
    try {
      const current = await getProjectById(id);
      if (!current || current.userId !== userId) return null;
      const merged = { ...current, ...updates };

      const rows = await sql`
        UPDATE projects SET
          title = ${merged.title},
          course = ${merged.course},
          institution = ${merged.institution},
          summary = ${merged.summary || null},
          file_type = ${merged.fileType},
          metadata = ${merged.metadata ? JSON.stringify(merged.metadata) : null},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING id, user_id as "userId", tool_id as "toolId", title, course,
                  institution, summary, file_type as "fileType",
                  file_download_url as "fileDownloadUrl", metadata,
                  created_at as "createdAt", updated_at as "updatedAt";
      `;
      if (rows && rows.length > 0) return rows[0] as Project;
    } catch (err) {
      console.error('Neon updateProject error:', err);
    }
  }

  const db = readDb();
  const index = db.projects.findIndex(p => p.id === id && p.userId === userId);
  if (index === -1) return null;

  db.projects[index] = {
    ...db.projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return db.projects[index];
}

export async function deleteProject(id: string, userId: string): Promise<boolean> {
  if (isNeonConfigured()) {
    try {
      await sql`DELETE FROM projects WHERE id = ${id} AND user_id = ${userId};`;
      return true;
    } catch (err) {
      console.error('Neon deleteProject error:', err);
    }
  }

  const db = readDb();
  const initialLength = db.projects.length;
  db.projects = db.projects.filter(p => !(p.id === id && p.userId === userId));
  const deleted = db.projects.length < initialLength;
  if (deleted) writeDb(db);
  return deleted;
}

export async function getAllProjects(): Promise<Project[]> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, user_id as "userId", tool_id as "toolId", title, course,
               institution, summary, file_type as "fileType",
               file_download_url as "fileDownloadUrl", metadata,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM projects
        ORDER BY created_at DESC;
      `;
      return rows as Project[];
    } catch (err) {
      console.error('Neon getAllProjects error:', err);
    }
  }

  const db = readDb();
  return db.projects;
}

// ─────────────────────────────────────────────────────────────
// Transaction Operations
// ─────────────────────────────────────────────────────────────
export async function createTransaction(txData: {
  userId: string;
  reference: string;
  amount: number;
  currency?: string;
  status?: 'pending' | 'success' | 'failed';
  planId: string;
  channel?: string;
  credits?: number;
}): Promise<Transaction> {
  const id = `tx-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
  const currency = txData.currency || 'NGN';
  const status = txData.status || 'pending';

  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        INSERT INTO transactions (id, user_id, reference, amount, currency, status, plan_id, channel, created_at)
        VALUES (${id}, ${txData.userId}, ${txData.reference}, ${txData.amount}, ${currency}, ${status}, ${txData.planId}, ${txData.channel || null}, ${createdAt})
        RETURNING id, user_id as "userId", reference, amount, currency, status, plan_id as "planId", channel, paid_at as "paidAt", created_at as "createdAt";
      `;
      if (rows && rows.length > 0) return { ...(rows[0] as Transaction), credits: txData.credits };
    } catch (err) {
      console.error('Neon createTransaction error:', err);
    }
  }

  const db = readDb();
  const newTx: Transaction = {
    id,
    userId: txData.userId,
    reference: txData.reference,
    amount: txData.amount,
    currency,
    status,
    planId: txData.planId,
    channel: txData.channel,
    credits: txData.credits,
    createdAt,
  };
  db.transactions.unshift(newTx);
  writeDb(db);
  return newTx;
}

export async function getTransactionByReference(reference: string): Promise<Transaction | null> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, user_id as "userId", reference, amount, currency, status, plan_id as "planId", channel, paid_at as "paidAt", created_at as "createdAt"
        FROM transactions
        WHERE reference = ${reference}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) return rows[0] as Transaction;
      return null;
    } catch (err) {
      console.error('Neon getTransactionByReference error:', err);
    }
  }

  const db = readDb();
  return db.transactions.find(t => t.reference === reference) || null;
}

export async function updateTransaction(reference: string, updates: Partial<Transaction>): Promise<Transaction | null> {
  if (isNeonConfigured()) {
    try {
      const current = await getTransactionByReference(reference);
      if (!current) return null;
      const merged = { ...current, ...updates };

      const rows = await sql`
        UPDATE transactions SET
          status = ${merged.status},
          channel = ${merged.channel || null},
          paid_at = ${merged.paidAt || null}
        WHERE reference = ${reference}
        RETURNING id, user_id as "userId", reference, amount, currency, status, plan_id as "planId", channel, paid_at as "paidAt", created_at as "createdAt";
      `;
      if (rows && rows.length > 0) return rows[0] as Transaction;
    } catch (err) {
      console.error('Neon updateTransaction error:', err);
    }
  }

  const db = readDb();
  const index = db.transactions.findIndex(t => t.reference === reference);
  if (index === -1) return null;

  db.transactions[index] = { ...db.transactions[index], ...updates };
  writeDb(db);
  return db.transactions[index];
}

export async function getAllTransactions(): Promise<any[]> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT t.id, t.user_id as "userId", t.reference, t.amount, t.currency, t.status, t.plan_id as "planId", t.channel, t.paid_at as "paidAt", t.created_at as "createdAt",
               u.email as "userEmail", u.full_name as "userFullName"
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC;
      `;
      return rows;
    } catch (err) {
      console.error('Neon getAllTransactions error:', err);
    }
  }

  const db = readDb();
  return (db.transactions || []).map(t => {
    const user = (db.users || []).find(u => u.id === t.userId);
    return {
      ...t,
      userEmail: user?.email || 'N/A',
      userFullName: user?.fullName || 'Scholar',
    };
  });
}

// ─────────────────────────────────────────────────────────────
// Viva Simulator Sessions
// ─────────────────────────────────────────────────────────────
export async function getVivaSession(id: string): Promise<VivaSession | null> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, user_id as "userId", topic, course, examiner_persona as "examinerPersona",
               turns, scorecard, status, created_at as "createdAt", updated_at as "updatedAt"
        FROM viva_sessions
        WHERE id = ${id}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        const item = rows[0] as any;
        return {
          id: item.id,
          userId: item.userId,
          topic: item.topic,
          course: item.course,
          examinerPersona: item.examinerPersona,
          turns: typeof item.turns === 'string' ? JSON.parse(item.turns) : item.turns || [],
          scorecard: typeof item.scorecard === 'string' ? JSON.parse(item.scorecard) : item.scorecard,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      }
      return null;
    } catch (err) {
      console.error('Neon getVivaSession error:', err);
    }
  }

  const db = readDb();
  return (db.vivaSessions || []).find(s => s.id === id) || null;
}

export async function saveVivaSession(session: VivaSession): Promise<VivaSession> {
  const turnsJson = JSON.stringify(session.turns || []);
  const scorecardJson = session.scorecard ? JSON.stringify(session.scorecard) : null;
  const now = new Date().toISOString();

  if (isNeonConfigured()) {
    try {
      await sql`
        INSERT INTO viva_sessions (id, user_id, topic, course, examiner_persona, turns, scorecard, status, created_at, updated_at)
        VALUES (
          ${session.id},
          ${session.userId},
          ${session.topic},
          ${session.course},
          ${session.examinerPersona || 'strict'},
          ${turnsJson},
          ${scorecardJson},
          ${session.status || 'active'},
          ${session.createdAt || now},
          ${now}
        )
        ON CONFLICT (id) DO UPDATE SET
          turns = EXCLUDED.turns,
          scorecard = EXCLUDED.scorecard,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at;
      `;
      return session;
    } catch (err) {
      console.error('Neon saveVivaSession error:', err);
    }
  }

  const db = readDb();
  if (!db.vivaSessions) db.vivaSessions = [];
  const index = db.vivaSessions.findIndex(s => s.id === session.id);
  if (index !== -1) {
    db.vivaSessions[index] = { ...session, updatedAt: now };
  } else {
    db.vivaSessions.unshift({ ...session, createdAt: session.createdAt || now, updatedAt: now });
  }
  writeDb(db);
  return session;
}

// ─────────────────────────────────────────────────────────────
// Admin Settings & Audit Logs
// ─────────────────────────────────────────────────────────────
export async function getAdminSettings(): Promise<AdminSettings> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`SELECT * FROM admin_settings WHERE id = 'default' LIMIT 1;`;
      if (rows && rows.length > 0) {
        const item = rows[0] as any;
        return {
          defaultSignupCredits: item.default_signup_credits || 15,
          toolCreditCosts: typeof item.tool_credit_costs === 'string' ? JSON.parse(item.tool_credit_costs) : item.tool_credit_costs || DEFAULT_SETTINGS.toolCreditCosts,
          aiEngine: typeof item.ai_engine === 'string' ? JSON.parse(item.ai_engine) : item.ai_engine || DEFAULT_SETTINGS.aiEngine,
          platformStatus: typeof item.platform_status === 'string' ? JSON.parse(item.platform_status) : item.platform_status || DEFAULT_SETTINGS.platformStatus,
        };
      }
    } catch (err) {
      console.error('Neon getAdminSettings error:', err);
    }
  }

  const db = readDb();
  return db.settings || DEFAULT_SETTINGS;
}

export async function updateAdminSettings(settings: Partial<AdminSettings>): Promise<AdminSettings> {
  const current = await getAdminSettings();
  const merged: AdminSettings = {
    defaultSignupCredits: settings.defaultSignupCredits ?? current.defaultSignupCredits,
    toolCreditCosts: { ...current.toolCreditCosts, ...(settings.toolCreditCosts || {}) },
    aiEngine: { ...current.aiEngine, ...(settings.aiEngine || {}) },
    platformStatus: { ...current.platformStatus, ...(settings.platformStatus || {}) },
  };

  if (isNeonConfigured()) {
    try {
      await sql`
        INSERT INTO admin_settings (id, default_signup_credits, tool_credit_costs, ai_engine, platform_status, updated_at)
        VALUES (
          'default',
          ${merged.defaultSignupCredits},
          ${JSON.stringify(merged.toolCreditCosts)},
          ${JSON.stringify(merged.aiEngine)},
          ${JSON.stringify(merged.platformStatus)},
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO UPDATE SET
          default_signup_credits = EXCLUDED.default_signup_credits,
          tool_credit_costs = EXCLUDED.tool_credit_costs,
          ai_engine = EXCLUDED.ai_engine,
          platform_status = EXCLUDED.platform_status,
          updated_at = CURRENT_TIMESTAMP;
      `;
    } catch (err) {
      console.error('Neon updateAdminSettings error:', err);
    }
  }

  const db = readDb();
  db.settings = merged;
  writeDb(db);
  return merged;
}

export async function updateAdminApiKeys(keys: {
  activeProvider?: any;
  gemini?: string;
  openai?: string;
  groq?: string;
  qwen?: string;
  anthropic?: string;
  deepseek?: string;
}): Promise<AdminSettings> {
  const current = await getAdminSettings();
  const { activeProvider, ...cleanKeys } = keys;
  const updatedEngine = {
    ...current.aiEngine,
    ...(activeProvider ? { activeProvider } : {}),
    apiKeys: {
      ...(current.aiEngine.apiKeys || {}),
      ...cleanKeys,
    },
  };
  return await updateAdminSettings({ aiEngine: updatedEngine });
}

export async function logAuthEvent(event: {
  userId?: string;
  email: string;
  action: AuthAuditLog['action'];
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const logId = `audit-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  if (isNeonConfigured()) {
    try {
      await sql`
        INSERT INTO auth_audit_logs (id, user_id, email, action, ip, user_agent, metadata, timestamp)
        VALUES (
          ${logId},
          ${event.userId || null},
          ${event.email},
          ${event.action},
          ${event.ip || null},
          ${event.userAgent || null},
          ${event.metadata ? JSON.stringify(event.metadata) : null},
          ${now}
        );
      `;
    } catch (err) {
      console.error('Neon logAuthEvent error:', err);
    }
  }

  const db = readDb();
  if (!db.authAuditLogs) db.authAuditLogs = [];
  db.authAuditLogs.unshift({
    id: logId,
    userId: event.userId,
    email: event.email,
    action: event.action,
    ip: event.ip,
    userAgent: event.userAgent,
    metadata: event.metadata,
    timestamp: now,
  });
  if (db.authAuditLogs.length > 1000) db.authAuditLogs = db.authAuditLogs.slice(0, 1000);
  writeDb(db);
}

export async function getAuthAuditLogs(limit = 100): Promise<AuthAuditLog[]> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, user_id as "userId", email, action, ip, user_agent as "userAgent", metadata, timestamp
        FROM auth_audit_logs
        ORDER BY timestamp DESC
        LIMIT ${limit};
      `;
      return rows as AuthAuditLog[];
    } catch (err) {
      console.error('Neon getAuthAuditLogs error:', err);
    }
  }

  const db = readDb();
  return (db.authAuditLogs || []).slice(0, limit);
}

// ─────────────────────────────────────────────────────────────
// Password Recovery Flow
// ─────────────────────────────────────────────────────────────
export async function createPasswordResetToken(email: string): Promise<{ token: string; expiresAt: string; user: User }> {
  const cleanEmail = email.toLowerCase().trim();
  const user = await getUserByEmail(cleanEmail);
  if (!user) {
    throw new Error('No account found with this email address.');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await updateUser(user.id, {
    resetToken: { token, expiresAt },
  });

  await logAuthEvent({
    userId: user.id,
    email: user.email,
    action: 'password_reset_requested',
    metadata: { expiresAt },
  });

  return { token, expiresAt, user: { ...user, resetToken: { token, expiresAt } } };
}

export async function verifyAndConsumeResetToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!token || typeof token !== 'string') {
    return { success: false, error: 'Reset token is required.' };
  }

  const cleanToken = token.trim();
  let user: User | null = null;

  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, email, password_hash as "passwordHash", full_name as "fullName",
               matric_number as "matricNumber", institution, plan, credits,
               status, role, reset_token as "resetToken", created_at as "createdAt"
        FROM users
        WHERE reset_token->>'token' = ${cleanToken}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) user = rows[0] as User;
    } catch (err) {
      console.error('Neon verifyAndConsumeResetToken error:', err);
    }
  }

  if (!user) {
    const db = readDb();
    user = db.users.find(u => u.resetToken && u.resetToken.token === cleanToken) || null;
  }

  if (!user || !user.resetToken) {
    return { success: false, error: 'Invalid or expired password reset token.' };
  }

  const expiresAtTime = new Date(user.resetToken.expiresAt).getTime();
  if (isNaN(expiresAtTime) || expiresAtTime <= Date.now()) {
    await updateUser(user.id, { resetToken: undefined });
    return { success: false, error: 'Password reset token has expired. Please request a new one.' };
  }

  const newHash = hashPassword(newPassword);
  const updatedUser = await updateUser(user.id, {
    passwordHash: newHash,
    resetToken: undefined,
  });

  await logAuthEvent({
    userId: user.id,
    email: user.email,
    action: 'password_reset_success',
  });

  return { success: true, user: updatedUser || user };
}

// ─────────────────────────────────────────────────────────────
// Developer API Key Operations
// ─────────────────────────────────────────────────────────────
export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

export async function generateApiKey(
  userId: string,
  name: string,
  isTest = false,
  options?: {
    isInstitutional?: boolean;
    institutionName?: string;
    allowedDomains?: string;
    rateLimitPerMin?: number;
  }
): Promise<{ rawKey: string; keyRecord: ApiKey }> {
  const prefix = isTest ? 'ct_test_' : 'ct_live_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const rawKey = `${prefix}${randomBytes}`;
  const keyHash = hashApiKey(rawKey);
  const maskedKey = `${prefix}••••••••${rawKey.slice(-4)}`;
  const id = `key-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const rateLimit = options?.rateLimitPerMin || (options?.isInstitutional ? 300 : 60);
  const isInstitutional = options?.isInstitutional || false;
  const institutionName = options?.institutionName || null;
  const allowedDomains = options?.allowedDomains || '*';

  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, masked_key, rate_limit_per_min, status, is_institutional, institution_name, allowed_domains, created_at)
        VALUES (${id}, ${userId}, ${name}, ${keyHash}, ${prefix}, ${maskedKey}, ${rateLimit}, 'active', ${isInstitutional}, ${institutionName}, ${allowedDomains}, ${now})
        RETURNING id, user_id as "userId", name, key_hash as "keyHash", key_prefix as "keyPrefix", masked_key as "maskedKey", rate_limit_per_min as "rateLimitPerMin", status, is_institutional as "isInstitutional", institution_name as "institutionName", allowed_domains as "allowedDomains", last_used_at as "lastUsedAt", created_at as "createdAt";
      `;
      if (rows && rows.length > 0) {
        return { rawKey, keyRecord: rows[0] as ApiKey };
      }
    } catch (err) {
      console.error('Neon generateApiKey error:', err);
    }
  }

  const db = readDb();
  if (!db.apiKeys) db.apiKeys = [];
  const keyRecord: ApiKey = {
    id,
    userId,
    name,
    keyHash,
    keyPrefix: prefix,
    maskedKey,
    rateLimitPerMin: rateLimit,
    status: 'active',
    isInstitutional,
    institutionName: institutionName || undefined,
    allowedDomains,
    createdAt: now,
  };
  db.apiKeys.unshift(keyRecord);
  writeDb(db);
  return { rawKey, keyRecord };
}

export async function getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, user_id as "userId", name, key_hash as "keyHash", key_prefix as "keyPrefix", masked_key as "maskedKey", rate_limit_per_min as "rateLimitPerMin", status, is_institutional as "isInstitutional", institution_name as "institutionName", allowed_domains as "allowedDomains", last_used_at as "lastUsedAt", created_at as "createdAt"
        FROM api_keys
        WHERE user_id = ${userId}
        ORDER BY created_at DESC;
      `;
      return rows as ApiKey[];
    } catch (err) {
      console.error('Neon getApiKeysByUserId error:', err);
    }
  }

  const db = readDb();
  return (db.apiKeys || []).filter(k => k.userId === userId);
}

export async function revokeApiKey(keyId: string, userId: string): Promise<boolean> {
  if (isNeonConfigured()) {
    try {
      await sql`
        UPDATE api_keys
        SET status = 'revoked'
        WHERE id = ${keyId} AND user_id = ${userId};
      `;
      return true;
    } catch (err) {
      console.error('Neon revokeApiKey error:', err);
    }
  }

  const db = readDb();
  if (!db.apiKeys) return false;
  const key = db.apiKeys.find(k => k.id === keyId && k.userId === userId);
  if (key) {
    key.status = 'revoked';
    writeDb(db);
    return true;
  }
  return false;
}

export async function getAllApiKeys(): Promise<any[]> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT k.id, k.user_id as "userId", k.name, k.key_prefix as "keyPrefix", k.masked_key as "maskedKey",
               k.rate_limit_per_min as "rateLimitPerMin", k.status, k.is_institutional as "isInstitutional",
               k.institution_name as "institutionName", k.allowed_domains as "allowedDomains",
               k.last_used_at as "lastUsedAt", k.created_at as "createdAt",
               u.email as "userEmail", u.full_name as "userFullName"
        FROM api_keys k
        LEFT JOIN users u ON k.user_id = u.id
        ORDER BY k.created_at DESC;
      `;
      return rows;
    } catch (err) {
      console.error('Neon getAllApiKeys error:', err);
    }
  }

  const db = readDb();
  return (db.apiKeys || []).map(k => {
    const user = (db.users || []).find(u => u.id === k.userId);
    return {
      ...k,
      userEmail: user?.email || 'N/A',
      userFullName: user?.fullName || 'Scholar',
    };
  });
}

export async function adminToggleApiKeyStatus(keyId: string, status: 'active' | 'revoked'): Promise<boolean> {
  if (isNeonConfigured()) {
    try {
      await sql`
        UPDATE api_keys
        SET status = ${status}
        WHERE id = ${keyId};
      `;
      return true;
    } catch (err) {
      console.error('Neon adminToggleApiKeyStatus error:', err);
    }
  }

  const db = readDb();
  if (!db.apiKeys) return false;
  const key = db.apiKeys.find(k => k.id === keyId);
  if (key) {
    key.status = status;
    writeDb(db);
    return true;
  }
  return false;
}

export async function validateApiKey(rawKey: string): Promise<{
  valid: boolean;
  keyRecord?: ApiKey;
  user?: User;
  error?: string;
}> {
  if (!rawKey || typeof rawKey !== 'string') {
    return { valid: false, error: 'API key is missing or invalid' };
  }

  const cleanKey = rawKey.trim();
  if (!cleanKey.startsWith('ct_live_') && !cleanKey.startsWith('ct_test_')) {
    return { valid: false, error: 'Malformed API key format. Expected prefix "ct_live_" or "ct_test_"' };
  }

  const keyHash = hashApiKey(cleanKey);
  let keyRecord: ApiKey | null = null;

  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, user_id as "userId", name, key_hash as "keyHash", key_prefix as "keyPrefix", masked_key as "maskedKey", rate_limit_per_min as "rateLimitPerMin", status, is_institutional as "isInstitutional", institution_name as "institutionName", allowed_domains as "allowedDomains", last_used_at as "lastUsedAt", created_at as "createdAt"
        FROM api_keys
        WHERE key_hash = ${keyHash}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        keyRecord = rows[0] as ApiKey;
      }
    } catch (err) {
      console.error('Neon validateApiKey error:', err);
    }
  }

  if (!keyRecord) {
    const db = readDb();
    keyRecord = (db.apiKeys || []).find(k => k.keyHash === keyHash) || null;
  }

  if (!keyRecord) {
    return { valid: false, error: 'Invalid API key provided' };
  }

  if (keyRecord.status !== 'active') {
    return { valid: false, error: 'This API key has been revoked' };
  }

  // Update last used timestamp
  const now = new Date().toISOString();
  if (isNeonConfigured()) {
    try {
      await sql`UPDATE api_keys SET last_used_at = ${now} WHERE id = ${keyRecord.id};`;
    } catch {}
  } else {
    const db = readDb();
    const k = (db.apiKeys || []).find(item => item.id === keyRecord!.id);
    if (k) {
      k.lastUsedAt = now;
      writeDb(db);
    }
  }

  const user = await getUserById(keyRecord.userId);
  if (!user) {
    return { valid: false, error: 'Associated user account not found' };
  }
  if (user.status === 'suspended') {
    return { valid: false, error: 'Associated developer account is suspended' };
  }

  return { valid: true, keyRecord, user };
}

// ─────────────────────────────────────────────────────────────
// Developer API Usage Logs & Analytics
// ─────────────────────────────────────────────────────────────
export async function logApiUsage(data: {
  apiKeyId: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  creditsDeducted: number;
  responseTimeMs: number;
  ipAddress?: string;
}): Promise<ApiUsageLog> {
  const id = `use-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        INSERT INTO api_usage_logs (id, api_key_id, user_id, endpoint, method, status_code, credits_deducted, response_time_ms, ip_address, created_at)
        VALUES (${id}, ${data.apiKeyId}, ${data.userId}, ${data.endpoint}, ${data.method}, ${data.statusCode}, ${data.creditsDeducted}, ${data.responseTimeMs}, ${data.ipAddress || null}, ${now})
        RETURNING id, api_key_id as "apiKeyId", user_id as "userId", endpoint, method, status_code as "statusCode", credits_deducted as "creditsDeducted", response_time_ms as "responseTimeMs", ip_address as "ipAddress", created_at as "createdAt";
      `;
      if (rows && rows.length > 0) return rows[0] as ApiUsageLog;
    } catch (err) {
      console.error('Neon logApiUsage error:', err);
    }
  }

  const db = readDb();
  if (!db.apiUsageLogs) db.apiUsageLogs = [];
  const log: ApiUsageLog = {
    id,
    apiKeyId: data.apiKeyId,
    userId: data.userId,
    endpoint: data.endpoint,
    method: data.method,
    statusCode: data.statusCode,
    creditsDeducted: data.creditsDeducted,
    responseTimeMs: data.responseTimeMs,
    ipAddress: data.ipAddress,
    createdAt: now,
  };
  db.apiUsageLogs.unshift(log);
  if (db.apiUsageLogs.length > 2000) db.apiUsageLogs = db.apiUsageLogs.slice(0, 2000);
  writeDb(db);
  return log;
}

export async function getApiUsageLogsByUserId(userId: string, limit = 50): Promise<ApiUsageLog[]> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, api_key_id as "apiKeyId", user_id as "userId", endpoint, method, status_code as "statusCode", credits_deducted as "creditsDeducted", response_time_ms as "responseTimeMs", ip_address as "ipAddress", created_at as "createdAt"
        FROM api_usage_logs
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit};
      `;
      return rows as ApiUsageLog[];
    } catch (err) {
      console.error('Neon getApiUsageLogsByUserId error:', err);
    }
  }

  const db = readDb();
  return (db.apiUsageLogs || []).filter(l => l.userId === userId).slice(0, limit);
}

export async function getApiUsageStats(userId: string): Promise<{
  totalRequests: number;
  totalCreditsCharged: number;
  avgLatencyMs: number;
  successRate: number;
}> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT 
          COUNT(*)::int as "totalRequests",
          COALESCE(SUM(credits_deducted), 0)::int as "totalCreditsCharged",
          COALESCE(AVG(response_time_ms), 0)::int as "avgLatencyMs",
          COALESCE(ROUND((COUNT(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100, 1), 100)::float as "successRate"
        FROM api_usage_logs
        WHERE user_id = ${userId};
      `;
      if (rows && rows.length > 0) {
        return {
          totalRequests: Number(rows[0].totalRequests) || 0,
          totalCreditsCharged: Number(rows[0].totalCreditsCharged) || 0,
          avgLatencyMs: Number(rows[0].avgLatencyMs) || 0,
          successRate: Number(rows[0].successRate) || 100,
        };
      }
    } catch (err) {
      console.error('Neon getApiUsageStats error:', err);
    }
  }

  const db = readDb();
  const logs = (db.apiUsageLogs || []).filter(l => l.userId === userId);
  const total = logs.length;
  if (total === 0) {
    return { totalRequests: 0, totalCreditsCharged: 0, avgLatencyMs: 0, successRate: 100 };
  }
  const credits = logs.reduce((sum, l) => sum + (l.creditsDeducted || 0), 0);
  const latency = Math.round(logs.reduce((sum, l) => sum + (l.responseTimeMs || 0), 0) / total);
  const successful = logs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length;
  const rate = Math.round((successful / total) * 1000) / 10;
  return { totalRequests: total, totalCreditsCharged: credits, avgLatencyMs: latency, successRate: rate };
}

// ─────────────────────────────────────────────────────────────
// Developer Webhooks Management
// ─────────────────────────────────────────────────────────────
export async function getWebhooksByUserId(userId: string): Promise<ApiWebhook[]> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, user_id as "userId", url, secret, events, status, description, created_at as "createdAt", last_triggered_at as "lastTriggeredAt"
        FROM api_webhooks
        WHERE user_id = ${userId}
        ORDER BY created_at DESC;
      `;
      return rows as ApiWebhook[];
    } catch (err) {
      console.error('Neon getWebhooksByUserId error:', err);
    }
  }

  const db = readDb();
  return (db.apiWebhooks || []).filter(w => w.userId === userId);
}

export async function createWebhook(data: {
  userId: string;
  url: string;
  secret?: string;
  events?: string[];
  description?: string;
}): Promise<ApiWebhook> {
  const id = `whk-${crypto.randomUUID().slice(0, 8)}`;
  const secret = data.secret || `whsec_${crypto.randomBytes(24).toString('hex')}`;
  const events = data.events && data.events.length > 0 ? data.events : ['*'];
  const now = new Date().toISOString();

  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        INSERT INTO api_webhooks (id, user_id, url, secret, events, status, description, created_at)
        VALUES (${id}, ${data.userId}, ${data.url}, ${secret}, ${JSON.stringify(events)}::jsonb, 'active', ${data.description || null}, ${now})
        RETURNING id, user_id as "userId", url, secret, events, status, description, created_at as "createdAt", last_triggered_at as "lastTriggeredAt";
      `;
      if (rows && rows.length > 0) {
        return rows[0] as ApiWebhook;
      }
    } catch (err) {
      console.error('Neon createWebhook error:', err);
    }
  }

  const db = readDb();
  if (!db.apiWebhooks) db.apiWebhooks = [];
  const webhook: ApiWebhook = {
    id,
    userId: data.userId,
    url: data.url,
    secret,
    events,
    status: 'active',
    description: data.description,
    createdAt: now,
  };
  db.apiWebhooks.unshift(webhook);
  writeDb(db);
  return webhook;
}

export async function deleteWebhook(id: string, userId: string): Promise<boolean> {
  if (isNeonConfigured()) {
    try {
      await sql`
        DELETE FROM api_webhooks
        WHERE id = ${id} AND user_id = ${userId};
      `;
      return true;
    } catch (err) {
      console.error('Neon deleteWebhook error:', err);
    }
  }

  const db = readDb();
  if (!db.apiWebhooks) return false;
  const initialLen = db.apiWebhooks.length;
  db.apiWebhooks = db.apiWebhooks.filter(w => !(w.id === id && w.userId === userId));
  if (db.apiWebhooks.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

export async function updateWebhookLastTriggered(id: string): Promise<void> {
  const now = new Date().toISOString();
  if (isNeonConfigured()) {
    try {
      await sql`UPDATE api_webhooks SET last_triggered_at = ${now} WHERE id = ${id};`;
      return;
    } catch {}
  }
  const db = readDb();
  const wh = (db.apiWebhooks || []).find(w => w.id === id);
  if (wh) {
    wh.lastTriggeredAt = now;
    writeDb(db);
  }
}

// ─────────────────────────────────────────────────────────────
// Developer Asynchronous Jobs System
// ─────────────────────────────────────────────────────────────
export async function createApiJob(data: {
  userId: string;
  keyId?: string;
  jobType: string;
  inputPayload?: any;
  webhookUrl?: string;
  creditsBilled?: number;
}): Promise<ApiJob> {
  const id = `job_${crypto.randomUUID().slice(0, 12)}`;
  const now = new Date().toISOString();
  const creditsBilled = data.creditsBilled ?? 1;

  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        INSERT INTO api_jobs (id, user_id, key_id, job_type, status, progress, input_payload, webhook_url, credits_billed, created_at)
        VALUES (${id}, ${data.userId}, ${data.keyId || null}, ${data.jobType}, 'processing', 10, ${JSON.stringify(data.inputPayload || {})}::jsonb, ${data.webhookUrl || null}, ${creditsBilled}, ${now})
        RETURNING id, user_id as "userId", key_id as "keyId", job_type as "jobType", status, progress, input_payload as "inputPayload", result_payload as "resultPayload", error_message as "errorMessage", webhook_url as "webhookUrl", credits_billed as "creditsBilled", created_at as "createdAt", completed_at as "completedAt";
      `;
      if (rows && rows.length > 0) {
        return rows[0] as ApiJob;
      }
    } catch (err) {
      console.error('Neon createApiJob error:', err);
    }
  }

  const db = readDb();
  if (!db.apiJobs) db.apiJobs = [];
  const job: ApiJob = {
    id,
    userId: data.userId,
    keyId: data.keyId,
    jobType: data.jobType,
    status: 'processing',
    progress: 10,
    inputPayload: data.inputPayload,
    webhookUrl: data.webhookUrl,
    creditsBilled,
    createdAt: now,
  };
  db.apiJobs.unshift(job);
  writeDb(db);
  return job;
}

export async function getApiJobById(id: string): Promise<ApiJob | null> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, user_id as "userId", key_id as "keyId", job_type as "jobType", status, progress, input_payload as "inputPayload", result_payload as "resultPayload", error_message as "errorMessage", webhook_url as "webhookUrl", credits_billed as "creditsBilled", created_at as "createdAt", completed_at as "completedAt"
        FROM api_jobs
        WHERE id = ${id}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) {
        return rows[0] as ApiJob;
      }
    } catch (err) {
      console.error('Neon getApiJobById error:', err);
    }
  }

  const db = readDb();
  return (db.apiJobs || []).find(j => j.id === id) || null;
}

export async function updateApiJob(id: string, updates: Partial<ApiJob>): Promise<ApiJob | null> {
  const now = new Date().toISOString();
  const completedAt = updates.status === 'completed' || updates.status === 'failed' ? now : null;

  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        UPDATE api_jobs
        SET 
          status = COALESCE(${updates.status || null}, status),
          progress = COALESCE(${updates.progress ?? null}, progress),
          result_payload = CASE WHEN ${updates.resultPayload !== undefined} THEN ${JSON.stringify(updates.resultPayload)}::jsonb ELSE result_payload END,
          error_message = COALESCE(${updates.errorMessage || null}, error_message),
          completed_at = COALESCE(${completedAt}, completed_at)
        WHERE id = ${id}
        RETURNING id, user_id as "userId", key_id as "keyId", job_type as "jobType", status, progress, input_payload as "inputPayload", result_payload as "resultPayload", error_message as "errorMessage", webhook_url as "webhookUrl", credits_billed as "creditsBilled", created_at as "createdAt", completed_at as "completedAt";
      `;
      if (rows && rows.length > 0) {
        return rows[0] as ApiJob;
      }
    } catch (err) {
      console.error('Neon updateApiJob error:', err);
    }
  }

  const db = readDb();
  if (!db.apiJobs) return null;
  const job = db.apiJobs.find(j => j.id === id);
  if (!job) return null;
  Object.assign(job, updates);
  if (completedAt) job.completedAt = completedAt;
  writeDb(db);
  return job;
}

export async function getApiJobsByUserId(userId: string, limit = 50): Promise<ApiJob[]> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, user_id as "userId", key_id as "keyId", job_type as "jobType", status, progress, input_payload as "inputPayload", result_payload as "resultPayload", error_message as "errorMessage", webhook_url as "webhookUrl", credits_billed as "creditsBilled", created_at as "createdAt", completed_at as "completedAt"
        FROM api_jobs
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit};
      `;
      return rows as ApiJob[];
    } catch (err) {
      console.error('Neon getApiJobsByUserId error:', err);
    }
  }

  const db = readDb();
  return (db.apiJobs || []).filter(j => j.userId === userId).slice(0, limit);
}

// ─────────────────────────────────────────────────────────────
// Institutional Departmental License Operations
// ─────────────────────────────────────────────────────────────
export async function getInstitutionalLicenses(): Promise<InstitutionalLicense[]> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, license_code as "licenseCode", institution_name as "institutionName",
               faculty_name as "facultyName", department_name as "departmentName",
               coordinator_name as "coordinatorName", coordinator_email as "coordinatorEmail",
               coordinator_phone as "coordinatorPhone", plan_tier as "planTier",
               total_seats as "totalSeats", used_seats as "usedSeats",
               credits_per_student as "creditsPerStudent", pooled_credits as "pooledCredits",
               remaining_pooled_credits as "remainingPooledCredits", features,
               academic_session as "academicSession", status,
               expires_at as "expiresAt", created_at as "createdAt"
        FROM institutional_licenses
        ORDER BY created_at DESC;
      `;
      return rows as InstitutionalLicense[];
    } catch (err) {
      console.error('Neon getInstitutionalLicenses error:', err);
    }
  }

  const db = readDb();
  return db.institutionalLicenses || [];
}

export async function getInstitutionalLicenseById(id: string): Promise<InstitutionalLicense | null> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, license_code as "licenseCode", institution_name as "institutionName",
               faculty_name as "facultyName", department_name as "departmentName",
               coordinator_name as "coordinatorName", coordinator_email as "coordinatorEmail",
               coordinator_phone as "coordinatorPhone", plan_tier as "planTier",
               total_seats as "totalSeats", used_seats as "usedSeats",
               credits_per_student as "creditsPerStudent", pooled_credits as "pooledCredits",
               remaining_pooled_credits as "remainingPooledCredits", features,
               academic_session as "academicSession", status,
               expires_at as "expiresAt", created_at as "createdAt"
        FROM institutional_licenses
        WHERE id = ${id}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) return rows[0] as InstitutionalLicense;
      return null;
    } catch (err) {
      console.error('Neon getInstitutionalLicenseById error:', err);
    }
  }

  const db = readDb();
  return (db.institutionalLicenses || []).find(l => l.id === id) || null;
}

export async function getInstitutionalLicenseByCode(code: string): Promise<InstitutionalLicense | null> {
  const cleanCode = code.trim().toUpperCase();
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, license_code as "licenseCode", institution_name as "institutionName",
               faculty_name as "facultyName", department_name as "departmentName",
               coordinator_name as "coordinatorName", coordinator_email as "coordinatorEmail",
               coordinator_phone as "coordinatorPhone", plan_tier as "planTier",
               total_seats as "totalSeats", used_seats as "usedSeats",
               credits_per_student as "creditsPerStudent", pooled_credits as "pooledCredits",
               remaining_pooled_credits as "remainingPooledCredits", features,
               academic_session as "academicSession", status,
               expires_at as "expiresAt", created_at as "createdAt"
        FROM institutional_licenses
        WHERE UPPER(license_code) = ${cleanCode}
        LIMIT 1;
      `;
      if (rows && rows.length > 0) return rows[0] as InstitutionalLicense;
      return null;
    } catch (err) {
      console.error('Neon getInstitutionalLicenseByCode error:', err);
    }
  }

  const db = readDb();
  return (db.institutionalLicenses || []).find(l => l.licenseCode.toUpperCase() === cleanCode) || null;
}

export async function createInstitutionalLicense(data: {
  licenseCode?: string;
  institutionName: string;
  facultyName?: string;
  departmentName: string;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone?: string;
  planTier?: 'departmental' | 'faculty' | 'campus_wide';
  totalSeats?: number;
  creditsPerStudent?: number;
  pooledCredits?: number;
  features?: string[];
  academicSession?: string;
  expiresAt: string;
}): Promise<InstitutionalLicense> {
  const id = `lic-${crypto.randomUUID().slice(0, 8)}`;
  
  // Auto-generate code if omitted
  const institutionName = (data.institutionName || 'Unknown Institution').trim();
  const departmentName = (data.departmentName || (data as any).department || 'General Department').trim();
  const coordinatorName = (data.coordinatorName || (data as any).contactName || 'Department Coordinator').trim();
  const coordinatorEmail = (data.coordinatorEmail || (data as any).contactEmail || 'coordinator@institution.edu').trim().toLowerCase();
  const coordinatorPhone = (data.coordinatorPhone || (data as any).contactPhone || '').trim();
  const expiresAt = data.expiresAt || (data as any).validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  let licenseCode = data.licenseCode?.trim().toUpperCase();
  if (!licenseCode) {
    const instAcronym = institutionName
      .replace(/Federal|University|of|Technology|State|Polytechnic|College|Education/gi, '')
      .trim()
      .split(/\s+/)
      .map((w: string) => w[0])
      .join('')
      .toUpperCase() || 'CAMPUS';
    const deptAcronym = departmentName
      .replace(/Department|of|and|&/gi, '')
      .trim()
      .split(/\s+/)
      .map((w: string) => w[0])
      .join('')
      .toUpperCase() || 'DEPT';
    const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
    licenseCode = `INST-${instAcronym}-${deptAcronym}-2026-${rand}`;
  }

  const totalSeats = Number(data.totalSeats) || 150;
  const creditsPerStudent = Number(data.creditsPerStudent) || 50;
  const pooledCredits = Number(data.pooledCredits) || totalSeats * creditsPerStudent;
  const planTier = data.planTier || 'departmental';
  const features = data.features || [
    'turnitin_screening',
    'custom_templates',
    'supervisor_portal',
    'developer_api',
    'unlimited_viva'
  ];
  const academicSession = data.academicSession || '2025/2026';
  const now = new Date().toISOString();

  const newLicense: InstitutionalLicense = {
    id,
    licenseCode,
    institutionName,
    facultyName: data.facultyName?.trim() || '',
    departmentName,
    coordinatorName,
    coordinatorEmail,
    coordinatorPhone,
    planTier,
    totalSeats,
    usedSeats: 0,
    creditsPerStudent,
    pooledCredits,
    remainingPooledCredits: pooledCredits,
    features,
    academicSession,
    status: 'active',
    expiresAt,
    createdAt: now,
  };

  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        INSERT INTO institutional_licenses (
          id, license_code, institution_name, faculty_name, department_name,
          coordinator_name, coordinator_email, coordinator_phone, plan_tier,
          total_seats, used_seats, credits_per_student, pooled_credits,
          remaining_pooled_credits, features, academic_session, status,
          expires_at, created_at
        ) VALUES (
          ${newLicense.id}, ${newLicense.licenseCode}, ${newLicense.institutionName}, ${newLicense.facultyName || null}, ${newLicense.departmentName},
          ${newLicense.coordinatorName}, ${newLicense.coordinatorEmail}, ${newLicense.coordinatorPhone || null}, ${newLicense.planTier},
          ${newLicense.totalSeats}, 0, ${newLicense.creditsPerStudent}, ${newLicense.pooledCredits},
          ${newLicense.remainingPooledCredits}, ${JSON.stringify(newLicense.features)}::jsonb, ${newLicense.academicSession}, 'active',
          ${newLicense.expiresAt}, ${now}
        )
        RETURNING id, license_code as "licenseCode", institution_name as "institutionName",
                  faculty_name as "facultyName", department_name as "departmentName",
                  coordinator_name as "coordinatorName", coordinator_email as "coordinatorEmail",
                  coordinator_phone as "coordinatorPhone", plan_tier as "planTier",
                  total_seats as "totalSeats", used_seats as "usedSeats",
                  credits_per_student as "creditsPerStudent", pooled_credits as "pooledCredits",
                  remaining_pooled_credits as "remainingPooledCredits", features,
                  academic_session as "academicSession", status,
                  expires_at as "expiresAt", created_at as "createdAt";
      `;
      if (rows && rows.length > 0) return rows[0] as InstitutionalLicense;
    } catch (err) {
      console.error('Neon createInstitutionalLicense error:', err);
    }
  }

  const db = readDb();
  if (!db.institutionalLicenses) db.institutionalLicenses = [];
  db.institutionalLicenses.unshift(newLicense);
  writeDb(db);
  return newLicense;
}

export async function updateInstitutionalLicense(id: string, updates: Partial<InstitutionalLicense>): Promise<InstitutionalLicense | null> {
  if (isNeonConfigured()) {
    try {
      const current = await getInstitutionalLicenseById(id);
      if (!current) return null;
      const merged = { ...current, ...updates };

      const rows = await sql`
        UPDATE institutional_licenses
        SET
          institution_name = ${merged.institutionName},
          faculty_name = ${merged.facultyName || null},
          department_name = ${merged.departmentName},
          coordinator_name = ${merged.coordinatorName},
          coordinator_email = ${merged.coordinatorEmail},
          coordinator_phone = ${merged.coordinatorPhone || null},
          plan_tier = ${merged.planTier},
          total_seats = ${merged.totalSeats},
          used_seats = ${merged.usedSeats},
          credits_per_student = ${merged.creditsPerStudent},
          pooled_credits = ${merged.pooledCredits},
          remaining_pooled_credits = ${merged.remainingPooledCredits},
          features = ${JSON.stringify(merged.features)}::jsonb,
          academic_session = ${merged.academicSession},
          status = ${merged.status},
          expires_at = ${merged.expiresAt}
        WHERE id = ${id}
        RETURNING id, license_code as "licenseCode", institution_name as "institutionName",
                  faculty_name as "facultyName", department_name as "departmentName",
                  coordinator_name as "coordinatorName", coordinator_email as "coordinatorEmail",
                  coordinator_phone as "coordinatorPhone", plan_tier as "planTier",
                  total_seats as "totalSeats", used_seats as "usedSeats",
                  credits_per_student as "creditsPerStudent", pooled_credits as "pooledCredits",
                  remaining_pooled_credits as "remainingPooledCredits", features,
                  academic_session as "academicSession", status,
                  expires_at as "expiresAt", created_at as "createdAt";
      `;
      if (rows && rows.length > 0) return rows[0] as InstitutionalLicense;
    } catch (err) {
      console.error('Neon updateInstitutionalLicense error:', err);
    }
  }

  const db = readDb();
  if (!db.institutionalLicenses) return null;
  const index = db.institutionalLicenses.findIndex(l => l.id === id);
  if (index === -1) return null;
  db.institutionalLicenses[index] = { ...db.institutionalLicenses[index], ...updates };
  writeDb(db);
  return db.institutionalLicenses[index];
}

export async function deleteInstitutionalLicense(id: string): Promise<boolean> {
  if (isNeonConfigured()) {
    try {
      await sql`DELETE FROM institutional_licenses WHERE id = ${id};`;
      return true;
    } catch (err) {
      console.error('Neon deleteInstitutionalLicense error:', err);
    }
  }

  const db = readDb();
  if (!db.institutionalLicenses) return false;
  const initial = db.institutionalLicenses.length;
  db.institutionalLicenses = db.institutionalLicenses.filter(l => l.id !== id);
  writeDb(db);
  return db.institutionalLicenses.length < initial;
}

export async function redeemInstitutionalLicense(userId: string, code: string): Promise<{
  success: boolean;
  message: string;
  license?: InstitutionalLicense;
  user?: User;
}> {
  const license = await getInstitutionalLicenseByCode(code);
  if (!license) {
    return { success: false, message: 'Invalid Institutional License Code. Please verify with your HOD or Project Coordinator.' };
  }

  if (license.status !== 'active') {
    return { success: false, message: `This institutional license is currently ${license.status}. Please contact your departmental coordinator.` };
  }

  const expiry = new Date(license.expiresAt).getTime();
  if (Date.now() > expiry) {
    return { success: false, message: 'This departmental license has expired for the selected academic session.' };
  }

  const user = await getUserById(userId);
  if (!user) {
    return { success: false, message: 'Student account not found.' };
  }

  if (user.licenseId === license.id) {
    return { success: true, message: `You are already verified under this ${license.departmentName} departmental license.`, license, user };
  }

  if (license.usedSeats >= license.totalSeats) {
    return { success: false, message: 'All student seats for this departmental license have been claimed. Please ask your HOD to expand seat capacity.' };
  }

  // Increment seats and deduct from pool
  const newUsedSeats = license.usedSeats + 1;
  const newRemainingPool = Math.max(0, license.remainingPooledCredits - license.creditsPerStudent);
  await updateInstitutionalLicense(license.id, {
    usedSeats: newUsedSeats,
    remainingPooledCredits: newRemainingPool,
  });

  // Upgrade student
  const updatedUser = await updateUser(userId, {
    plan: 'faculty',
    licenseId: license.id,
    institution: license.institutionName,
    department: license.departmentName,
    credits: user.credits + license.creditsPerStudent,
  });

  // Log credit addition
  await logCreditEntry({
    userId,
    amount: license.creditsPerStudent,
    type: 'admin_grant',
    balanceAfter: (user.credits || 0) + license.creditsPerStudent,
    description: `Departmental License Activated (${license.licenseCode}) - ${license.departmentName}, ${license.institutionName}`,
  });

  // Create notifications
  await createNotification({
    userId,
    title: 'Departmental License Activated! 🎓',
    message: `You now have full Faculty tier access with ${license.creditsPerStudent} complimentary research credits under ${license.departmentName}.`,
    type: 'system',
    link: '/dashboard',
  });

  return {
    success: true,
    message: `Congratulations! ${license.departmentName} Departmental License activated. ${license.creditsPerStudent} research credits credited to your account.`,
    license,
    user: updatedUser || undefined,
  };
}

// ─────────────────────────────────────────────────────────────
// Institutional Quotes & Inquiries
// ─────────────────────────────────────────────────────────────
export async function getInstitutionalQuotes(): Promise<InstitutionalQuote[]> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        SELECT id, institution_name as "institutionName", faculty_name as "facultyName",
               department_name as "departmentName", contact_name as "contactName",
               contact_email as "contactEmail", contact_phone as "contactPhone",
               estimated_students as "estimatedStudents", tier,
               custom_requirements as "customRequirements", status,
               estimated_amount_ngn as "estimatedAmountNgn", created_at as "createdAt"
        FROM institutional_quotes
        ORDER BY created_at DESC;
      `;
      return rows as InstitutionalQuote[];
    } catch (err) {
      console.error('Neon getInstitutionalQuotes error:', err);
    }
  }

  const db = readDb();
  return db.institutionalQuotes || [];
}

export async function createInstitutionalQuote(data: {
  institutionName: string;
  facultyName?: string;
  departmentName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  estimatedStudents: number;
  tier?: string;
  customRequirements?: string;
  estimatedAmountNgn?: number;
}): Promise<InstitutionalQuote> {
  const id = `quote-${crypto.randomUUID().slice(0, 8)}`;
  const students = Number(data.estimatedStudents) || 100;
  const tier = (data.tier || (data as any).requestedPlan || 'departmental') as any;
  const estimatedAmount = data.estimatedAmountNgn || (tier === 'faculty' ? students * 2500 : students * 2000);
  const now = new Date().toISOString();

  const institutionName = (data.institutionName || 'Unknown Institution').trim();
  const departmentName = (data.departmentName || (data as any).department || 'General Department').trim();
  const contactName = (data.contactName || 'Department Representative').trim();
  const contactEmail = (data.contactEmail || 'contact@institution.edu').trim().toLowerCase();
  const contactPhone = (data.contactPhone || '').trim();
  const customRequirements = (data.customRequirements || (data as any).notes || '').trim();

  const newQuote: InstitutionalQuote = {
    id,
    institutionName,
    facultyName: data.facultyName?.trim() || '',
    departmentName,
    contactName,
    contactEmail,
    contactPhone,
    estimatedStudents: students,
    tier,
    customRequirements,
    status: 'pending',
    estimatedAmountNgn: estimatedAmount,
    createdAt: now,
  };

  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        INSERT INTO institutional_quotes (
          id, institution_name, faculty_name, department_name,
          contact_name, contact_email, contact_phone, estimated_students,
          tier, custom_requirements, status, estimated_amount_ngn, created_at
        ) VALUES (
          ${newQuote.id}, ${newQuote.institutionName}, ${newQuote.facultyName || null}, ${newQuote.departmentName},
          ${newQuote.contactName}, ${newQuote.contactEmail}, ${newQuote.contactPhone || null}, ${newQuote.estimatedStudents},
          ${newQuote.tier}, ${newQuote.customRequirements || null}, 'pending', ${newQuote.estimatedAmountNgn}, ${now}
        )
        RETURNING id, institution_name as "institutionName", faculty_name as "facultyName",
                  department_name as "departmentName", contact_name as "contactName",
                  contact_email as "contactEmail", contact_phone as "contactPhone",
                  estimated_students as "estimatedStudents", tier,
                  custom_requirements as "customRequirements", status,
                  estimated_amount_ngn as "estimatedAmountNgn", created_at as "createdAt";
      `;
      if (rows && rows.length > 0) return rows[0] as InstitutionalQuote;
    } catch (err) {
      console.error('Neon createInstitutionalQuote error:', err);
    }
  }

  const db = readDb();
  if (!db.institutionalQuotes) db.institutionalQuotes = [];
  db.institutionalQuotes.unshift(newQuote);
  writeDb(db);
  return newQuote;
}

export async function updateInstitutionalQuote(id: string, updates: Partial<InstitutionalQuote>): Promise<InstitutionalQuote | null> {
  if (isNeonConfigured()) {
    try {
      const rows = await sql`
        UPDATE institutional_quotes
        SET
          status = COALESCE(${updates.status || null}, status)
        WHERE id = ${id}
        RETURNING id, institution_name as "institutionName", faculty_name as "facultyName",
                  department_name as "departmentName", contact_name as "contactName",
                  contact_email as "contactEmail", contact_phone as "contactPhone",
                  estimated_students as "estimatedStudents", tier,
                  custom_requirements as "customRequirements", status,
                  estimated_amount_ngn as "estimatedAmountNgn", created_at as "createdAt";
      `;
      if (rows && rows.length > 0) return rows[0] as InstitutionalQuote;
    } catch (err) {
      console.error('Neon updateInstitutionalQuote error:', err);
    }
  }

  const db = readDb();
  if (!db.institutionalQuotes) return null;
  const quote = db.institutionalQuotes.find(q => q.id === id);
  if (!quote) return null;
  Object.assign(quote, updates);
  writeDb(db);
  return quote;
}
