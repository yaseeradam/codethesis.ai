import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  plan: 'free' | 'starter' | 'standard' | 'complete' | 'faculty';
  credits: number;
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
  paidAt?: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: User[];
  projects: Project[];
  transactions: Transaction[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'codethesis_db.json');

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
          email: 'student@unilag.edu.ng',
          passwordHash: hashPassword('password123'),
          fullName: 'Chinedu Eze',
          plan: 'standard',
          credits: 15,
          createdAt: new Date().toISOString(),
        }
      ],
      projects: [
        {
          id: 'proj-001',
          userId: 'demo-student-001',
          toolId: 'thesis',
          title: 'AI-Driven Healthcare Diagnostic and Referral System',
          course: 'Computer Science',
          institution: 'University of Lagos',
          summary: 'Full 5-chapter undergraduate thesis with UML diagrams and APA 7th citations.',
          fileType: 'docx',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          id: 'proj-002',
          userId: 'demo-student-001',
          toolId: 'siwes-logbook',
          title: '24-Week Industrial Training Logbook at MainOne Data Center',
          course: 'Computer Science',
          institution: 'University of Lagos',
          summary: 'Complete daily activity logs, network topology diagrams, and weekly supervisor summaries.',
          fileType: 'docx',
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        }
      ],
      transactions: [
        {
          id: 'tx-001',
          userId: 'demo-student-001',
          reference: 'CT-TX-INITIAL-DEMO',
          amount: 8500,
          currency: 'NGN',
          status: 'success',
          planId: 'standard',
          paidAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        }
      ]
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
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, resetting to defaults:', err);
    return { users: [], projects: [], transactions: [] };
  }
}

function writeDb(data: DatabaseSchema): void {
  ensureDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// User Operations
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = readDb();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = readDb();
  return db.users.find(u => u.id === id) || null;
}

export async function createUser(userData: { email: string; password: string; fullName: string }): Promise<User> {
  const db = readDb();
  const existing = db.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    throw new Error('User with this email already exists.');
  }

  const newUser: User = {
    id: `usr-${crypto.randomUUID()}`,
    email: userData.email.toLowerCase().trim(),
    passwordHash: hashPassword(userData.password),
    fullName: userData.fullName.trim(),
    plan: 'free',
    credits: 3, // 3 free starter generations
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

// Project Operations
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

// Transaction Operations
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
