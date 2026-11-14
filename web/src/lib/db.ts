import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  matricNumber?: string;
  institution?: string;
  plan: 'free' | 'starter' | 'standard' | 'complete' | 'faculty';
  credits: number;
  status?: 'active' | 'flagged' | 'suspended';
  createdAt: string;
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
  paidAt?: string;
  createdAt: string;
}

export interface AdminSettings {
  defaultSignupCredits: number; // The free credits granted on first login/signup (default: 15)
  toolCreditCosts: {
    thesis: number;           // default: 3
    softwareBuilder: number;  // default: 2
    siwesLogbook: number;     // default: 2
    itfReport: number;        // default: 2
    vivaPresentation: number; // default: 1
    vivaSimulator: number;    // default: 1
    umlDiagrams: number;      // default: 1
    assignmentSolver: number; // default: 1
  };
  aiEngine: {
    activeProvider: 'heuristic' | 'gemini' | 'openai';
    modelName: string;
    temperature: number;
    maxTokens: number;
    systemPromptOverride: string;
    fallbackEnabled: boolean;
  };
  platformStatus: {
    online: boolean;
    statusText: string;
    maintenanceNotice: string;
  };
}

interface DatabaseSchema {
  users: User[];
  projects: Project[];
  transactions: Transaction[];
  settings: AdminSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'codethesis_db.json');

const DEFAULT_SETTINGS: AdminSettings = {
  defaultSignupCredits: 15, // Free credits on first login
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
    activeProvider: 'heuristic',
    modelName: 'gemini-1.5-flash',
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

// Ensure data directory exists
function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      users: [
        {
          id: 'demo-student-001',
          email: 'student@futa.edu.ng',
          passwordHash: hashPassword('password123'),
          fullName: 'Adebayo Tunde',
          matricNumber: 'FUTA/CSC/20/4182',
          institution: 'Federal University of Technology, Akure',
          plan: 'standard',
          credits: 15,
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'demo-student-002',
          email: 'imusa@futa.edu.ng',
          passwordHash: hashPassword('password123'),
          fullName: 'Ibrahim Musa',
          matricNumber: 'FUTA/CSC/20/5091',
          institution: 'Federal University of Technology, Akure',
          plan: 'complete',
          credits: 40,
          status: 'active',
          createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        },
        {
          id: 'demo-student-003',
          email: 'cokeke@unilag.edu.ng',
          passwordHash: hashPassword('password123'),
          fullName: 'Chioma Okeke',
          matricNumber: 'UNILAG/ENG/21/0844',
          institution: 'University of Lagos',
          plan: 'starter',
          credits: 8,
          status: 'active',
          createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
        }
      ],
      projects: [
        {
          id: 'proj-001',
          userId: 'demo-student-001',
          toolId: 'thesis',
          title: 'Design and Implementation of an Automated Hostel Allocation and Facility Management System',
          course: 'Computer Science',
          institution: 'Federal University of Technology, Akure',
          summary: 'Full 5-chapter undergraduate thesis with UML diagrams and APA 7th citations.',
          fileType: 'docx',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          id: 'proj-002',
          userId: 'demo-student-001',
          toolId: 'viva-presentation',
          title: 'Viva Presentation Deck for Hostel Allocation System',
          course: 'Computer Science',
          institution: 'Federal University of Technology, Akure',
          summary: '15-slide widescreen presentation deck in Midnight Navy and Gold theme.',
          fileType: 'pptx',
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        },
        {
          id: 'proj-003',
          userId: 'demo-student-001',
          toolId: 'software-builder',
          title: 'Hostel Allocation Python/SQLite Core Codebase',
          course: 'Computer Science',
          institution: 'Federal University of Technology, Akure',
          summary: 'Zero-pip Python web app with 1-click run_project.bat offline launcher.',
          fileType: 'zip',
          createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        }
      ],
      transactions: [
        {
          id: 'tx-001',
          userId: 'demo-student-001',
          reference: 'CT-TX-849201948',
          amount: 8500,
          currency: 'NGN',
          status: 'success',
          planId: 'standard',
          channel: 'card',
          paidAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        },
        {
          id: 'tx-002',
          userId: 'demo-student-002',
          reference: 'CT-TX-109283746',
          amount: 15000,
          currency: 'NGN',
          status: 'success',
          planId: 'complete',
          channel: 'bank_transfer',
          paidAt: new Date(Date.now() - 3600000 * 72).toISOString(),
          createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        },
        {
          id: 'tx-003',
          userId: 'demo-student-003',
          reference: 'CT-TX-551029481',
          amount: 3500,
          currency: 'NGN',
          status: 'success',
          planId: 'starter',
          channel: 'ussd',
          paidAt: new Date(Date.now() - 3600000 * 120).toISOString(),
          createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
        }
      ],
      settings: DEFAULT_SETTINGS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export function hashPassword(password: string): string {
  const salt = 'codethesis_secure_salt_2026';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function readDb(): DatabaseSchema {
  ensureDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.settings) {
      parsed.settings = DEFAULT_SETTINGS;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading DB, resetting to defaults:', err);
    return { users: [], projects: [], transactions: [], settings: DEFAULT_SETTINGS };
  }
}

function writeDb(data: DatabaseSchema): void {
  ensureDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ─────────────────────────────────────────────────────────────
// Admin Settings Operations
// ─────────────────────────────────────────────────────────────
export async function getAdminSettings(): Promise<AdminSettings> {
  const db = readDb();
  return db.settings || DEFAULT_SETTINGS;
}

export async function updateAdminSettings(updates: Partial<AdminSettings>): Promise<AdminSettings> {
  const db = readDb();
  db.settings = {
    ...db.settings,
    ...updates,
    toolCreditCosts: {
      ...db.settings.toolCreditCosts,
      ...(updates.toolCreditCosts || {}),
    },
    aiEngine: {
      ...db.settings.aiEngine,
      ...(updates.aiEngine || {}),
    },
    platformStatus: {
      ...db.settings.platformStatus,
      ...(updates.platformStatus || {}),
    },
  };
  writeDb(db);
  return db.settings;
}

// ─────────────────────────────────────────────────────────────
// User & Automatic Credit Operations
// ─────────────────────────────────────────────────────────────
export async function getAllUsers(): Promise<User[]> {
  const db = readDb();
  return db.users;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = readDb();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = readDb();
  return db.users.find(u => u.id === id) || null;
}

export async function createUser(userData: {
  email: string;
  password: string;
  fullName: string;
  matricNumber?: string;
  institution?: string;
}): Promise<User> {
  const db = readDb();
  const existing = db.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    throw new Error('User with this email already exists.');
  }

  // Grant configured default free credits on first signup
  const freeCredits = db.settings?.defaultSignupCredits ?? 15;

  const newUser: User = {
    id: `usr-${crypto.randomUUID().slice(0, 8)}`,
    email: userData.email.toLowerCase().trim(),
    passwordHash: hashPassword(userData.password),
    fullName: userData.fullName.trim(),
    matricNumber: userData.matricNumber?.trim() || 'FUTA/CSC/20/4182',
    institution: userData.institution?.trim() || 'Federal University of Technology, Akure',
    plan: 'free',
    credits: freeCredits,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const db = readDb();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return null;

  db.users[index] = { ...db.users[index], ...updates };
  writeDb(db);
  return db.users[index];
}

/**
 * Deduct credits automatically when a student runs a tool
 */
export async function deductUserCredits(userId: string, toolType: keyof AdminSettings['toolCreditCosts']): Promise<{ success: boolean; remainingCredits: number; message: string }> {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return { success: false, remainingCredits: 0, message: 'User not found' };
  }

  const cost = db.settings?.toolCreditCosts?.[toolType] ?? 1;

  if (user.credits < cost) {
    return {
      success: false,
      remainingCredits: user.credits,
      message: `Insufficient credits. This tool requires ${cost} credit(s), but you have ${user.credits}.`
    };
  }

  user.credits -= cost;
  writeDb(db);
  return {
    success: true,
    remainingCredits: user.credits,
    message: `Deducted ${cost} credit(s). ${user.credits} credits remaining.`
  };
}

/**
 * Automatically increase credits upon successful Paystack or Stripe payment
 */
export async function addCreditsOnPayment(userId: string, creditsToAdd: number, planId?: string): Promise<User | null> {
  const db = readDb();
  const user = db.users.find(u => u.id === userId);
  if (!user) return null;

  user.credits += creditsToAdd;
  if (planId) {
    user.plan = planId as any;
  }
  writeDb(db);
  return user;
}

// ─────────────────────────────────────────────────────────────
// Project Operations
// ─────────────────────────────────────────────────────────────
export async function getAllProjects(): Promise<Project[]> {
  const db = readDb();
  return db.projects;
}

export async function getProjectsByUserId(userId: string): Promise<Project[]> {
  const db = readDb();
  return db.projects.filter(p => p.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function saveProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const db = readDb();
  const newProject: Project = {
    ...projectData,
    id: `proj-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.projects.unshift(newProject);
  writeDb(db);
  return newProject;
}

export async function deleteProject(projectId: string, userId: string): Promise<boolean> {
  const db = readDb();
  const prevCount = db.projects.length;
  db.projects = db.projects.filter(p => !(p.id === projectId && p.userId === userId));
  if (db.projects.length !== prevCount) {
    writeDb(db);
    return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────
// Transaction Operations
// ─────────────────────────────────────────────────────────────
export async function getAllTransactions(): Promise<Transaction[]> {
  const db = readDb();
  return db.transactions;
}

export async function createTransaction(txData: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
  const db = readDb();
  const newTx: Transaction = {
    ...txData,
    id: `tx-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
  };

  db.transactions.unshift(newTx);
  writeDb(db);
  return newTx;
}

export async function updateTransactionByReference(reference: string, updates: Partial<Transaction>): Promise<Transaction | null> {
  const db = readDb();
  const index = db.transactions.findIndex(t => t.reference === reference);
  if (index === -1) return null;

  db.transactions[index] = { ...db.transactions[index], ...updates };
  writeDb(db);
  return db.transactions[index];
}

export async function getTransactionByReference(reference: string): Promise<Transaction | null> {
  const db = readDb();
  return db.transactions.find(t => t.reference === reference) || null;
}
