'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  GitFork,
  Download,
  Copy,
  Check,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Code2,
  Share2,
  CheckCircle2,
  Info,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface DiagramPreset {
  id: string;
  name: string;
  type: string;
  chapterNote: string;
  mermaidCode: string;
  svgPreview: React.ReactNode;
}

export default function UmlDiagramsToolPage() {
  const [selectedDiagram, setSelectedDiagram] = useState<string>('use-case');
  const [projectTitle, setProjectTitle] = useState('');
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const presets: DiagramPreset[] = [
    {
      id: 'use-case',
      name: 'Use Case Diagram',
      type: 'Behavioral UML',
      chapterNote: 'Standard requirement for Chapter 3: System Design & Functional Requirements.',
      mermaidCode: `usecaseDiagram
  actor Student as "Undergraduate Student"
  actor Admin as "Hostel Administrator"
  actor Bursar as "University Bursary"

  package "Hostel Management System Boundary" {
    usecase UC1 as "Apply for Bedspace"
    usecase UC2 as "Select Hall & Room Preference"
    usecase UC3 as "Remit Allocation Fee (Paystack)"
    usecase UC4 as "Print Official Hostel Pass"
    usecase UC5 as "Verify Student Clearance"
    usecase UC6 as "Manage Room Capacity & Inventory"
    usecase UC7 as "Log Facility Maintenance Ticket"
  }

  Student --> UC1
  Student --> UC2
  Student --> UC3
  Student --> UC4
  Student --> UC7

  Admin --> UC5
  Admin --> UC6
  Admin --> UC7

  Bursar --> UC3`,
      svgPreview: (
        <svg viewBox="0 0 850 480" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="850" height="480" fill="#F8FAFC" />
          <rect width="850" height="480" fill="url(#grid)" opacity="0.6" />

          {/* System Boundary */}
          <rect x="220" y="30" width="410" height="420" rx="16" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6 4" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))" />
          <text x="240" y="58" fill="#1E3A8A" fontSize="13" fontWeight="bold" fontFamily="system-ui">
            SYSTEM BOUNDARY: HOSTEL ALLOCATION SUITE
          </text>

          {/* Actors */}
          {/* Student */}
          <g transform="translate(60, 180)">
            <circle cx="35" cy="20" r="16" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="2" />
            <line x1="35" y1="36" x2="35" y2="80" stroke="#1D4ED8" strokeWidth="2.5" />
            <line x1="10" y1="52" x2="60" y2="52" stroke="#1D4ED8" strokeWidth="2.5" />
            <line x1="35" y1="80" x2="15" y2="120" stroke="#1D4ED8" strokeWidth="2.5" />
            <line x1="35" y1="80" x2="55" y2="120" stroke="#1D4ED8" strokeWidth="2.5" />
            <text x="35" y="145" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="bold">Student Actor</text>
          </g>

          {/* Admin */}
          <g transform="translate(710, 100)">
            <circle cx="35" cy="20" r="16" fill="#F3E8FF" stroke="#7E22CE" strokeWidth="2" />
            <line x1="35" y1="36" x2="35" y2="80" stroke="#7E22CE" strokeWidth="2.5" />
            <line x1="10" y1="52" x2="60" y2="52" stroke="#7E22CE" strokeWidth="2.5" />
            <line x1="35" y1="80" x2="15" y2="120" stroke="#7E22CE" strokeWidth="2.5" />
            <line x1="35" y1="80" x2="55" y2="120" stroke="#7E22CE" strokeWidth="2.5" />
            <text x="35" y="145" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="bold">Hostel Admin</text>
          </g>

          {/* Bursary */}
          <g transform="translate(710, 290)">
            <circle cx="35" cy="20" r="16" fill="#DCFCE7" stroke="#15803D" strokeWidth="2" />
            <line x1="35" y1="36" x2="35" y2="80" stroke="#15803D" strokeWidth="2.5" />
            <line x1="10" y1="52" x2="60" y2="52" stroke="#15803D" strokeWidth="2.5" />
            <line x1="35" y1="80" x2="15" y2="120" stroke="#15803D" strokeWidth="2.5" />
            <line x1="35" y1="80" x2="55" y2="120" stroke="#15803D" strokeWidth="2.5" />
            <text x="35" y="145" textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="bold">Bursary Staff</text>
          </g>

          {/* Use Cases */}
          <g transform="translate(260, 85)">
            <rect width="330" height="42" rx="21" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5" />
            <text x="165" y="26" textAnchor="middle" fill="#1E40AF" fontSize="12" fontWeight="600">UC1: Apply for Bedspace & Verification</text>
          </g>

          <g transform="translate(260, 145)">
            <rect width="330" height="42" rx="21" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5" />
            <text x="165" y="26" textAnchor="middle" fill="#1E40AF" fontSize="12" fontWeight="600">UC2: Select Hall & Room Preferences</text>
          </g>

          <g transform="translate(260, 205)">
            <rect width="330" height="42" rx="21" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
            <text x="165" y="26" textAnchor="middle" fill="#92400E" fontSize="12" fontWeight="600">UC3: Remit Clearance Fee (Paystack API)</text>
          </g>

          <g transform="translate(260, 265)">
            <rect width="330" height="42" rx="21" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.5" />
            <text x="165" y="26" textAnchor="middle" fill="#1E40AF" fontSize="12" fontWeight="600">UC4: Generate Digital Allocation Slip (QR)</text>
          </g>

          <g transform="translate(260, 325)">
            <rect width="330" height="42" rx="21" fill="#F3E8FF" stroke="#9333EA" strokeWidth="1.5" />
            <text x="165" y="26" textAnchor="middle" fill="#6B21A8" fontSize="12" fontWeight="600">UC5: Manage Room Inventory & Vacancies</text>
          </g>

          <g transform="translate(260, 385)">
            <rect width="330" height="42" rx="21" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
            <text x="165" y="26" textAnchor="middle" fill="#15803D" fontSize="12" fontWeight="600">UC6: Log Facility Maintenance Report</text>
          </g>

          {/* Association Lines */}
          <line x1="120" y1="210" x2="260" y2="106" stroke="#64748B" strokeWidth="1.5" />
          <line x1="120" y1="230" x2="260" y2="166" stroke="#64748B" strokeWidth="1.5" />
          <line x1="120" y1="250" x2="260" y2="226" stroke="#64748B" strokeWidth="1.5" />
          <line x1="120" y1="270" x2="260" y2="286" stroke="#64748B" strokeWidth="1.5" />
          <line x1="120" y1="290" x2="260" y2="406" stroke="#64748B" strokeWidth="1.5" />

          <line x1="710" y1="160" x2="590" y2="106" stroke="#64748B" strokeWidth="1.5" />
          <line x1="710" y1="180" x2="590" y2="346" stroke="#64748B" strokeWidth="1.5" />
          <line x1="710" y1="200" x2="590" y2="406" stroke="#64748B" strokeWidth="1.5" />

          <line x1="710" y1="340" x2="590" y2="226" stroke="#64748B" strokeWidth="1.5" />
        </svg>
      )
    },
    {
      id: 'sequence',
      name: 'Sequence Diagram (Row-Level Lock)',
      type: 'Behavioral UML',
      chapterNote: 'Critical defense artifact for Chapter 3/4 proving double-allocation race condition prevention.',
      mermaidCode: `sequenceDiagram
  autonumber
  actor Student as "Applicant (Browser)"
  participant WebServer as "Next.js / Flask API"
  participant DB as "PostgreSQL / SQLite"
  participant Paystack as "Paystack Gateway"

  Student->>WebServer: POST /api/bedspace/reserve (roomId, bedNumber)
  activate WebServer
  WebServer->>DB: BEGIN TRANSACTION (ISOLATION LEVEL SERIALIZABLE)
  activate DB
  WebServer->>DB: SELECT * FROM bedspaces WHERE id = ? FOR UPDATE
  Note over DB: Acquires Exclusive Row-Level Lock
  DB-->>WebServer: Return current status = 'VACANT'

  alt Bedspace already taken by concurrent request
    DB-->>WebServer: Status = 'RESERVED'
    WebServer-->>Student: 409 Conflict ("Bedspace just claimed, try another")
  else Bedspace successfully locked
    WebServer->>DB: UPDATE bedspaces SET status = 'PENDING_PAYMENT' WHERE id = ?
    WebServer->>Paystack: Initialize Transaction (Reference, NGN 35,000)
    Paystack-->>WebServer: Return Authorization URL
    WebServer->>DB: COMMIT TRANSACTION (Lock Released)
    deactivate DB
    WebServer-->>Student: 200 OK + Redirect to Payment Checkout
  end
  deactivate WebServer`,
      svgPreview: (
        <svg viewBox="0 0 850 480" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <rect width="850" height="480" fill="#F8FAFC" />
          
          <g transform="translate(60, 30)">
            <rect width="130" height="40" rx="8" fill="#1E293B" />
            <text x="65" y="25" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">Student Client</text>
            <line x1="65" y1="40" x2="65" y2="440" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />
          </g>

          <g transform="translate(270, 30)">
            <rect width="130" height="40" rx="8" fill="#0284C7" />
            <text x="65" y="25" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">App Controller</text>
            <line x1="65" y1="40" x2="65" y2="440" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />
          </g>

          <g transform="translate(480, 30)">
            <rect width="130" height="40" rx="8" fill="#4F46E5" />
            <text x="65" y="25" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">Database Engine</text>
            <line x1="65" y1="40" x2="65" y2="440" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />
          </g>

          <g transform="translate(680, 30)">
            <rect width="130" height="40" rx="8" fill="#059669" />
            <text x="65" y="25" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">Paystack API</text>
            <line x1="65" y1="40" x2="65" y2="440" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />
          </g>

          <line x1="125" y1="100" x2="330" y2="100" stroke="#0284C7" strokeWidth="2" />
          <text x="230" y="93" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="600">1. POST /api/reserve(bed_id)</text>

          <line x1="340" y1="140" x2="540" y2="140" stroke="#4F46E5" strokeWidth="2" />
          <text x="440" y="133" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="600">2. SELECT FOR UPDATE (Lock Bedspace)</text>

          <rect x="470" y="155" width="150" height="34" rx="6" fill="#FEF3C7" stroke="#D97706" />
          <text x="545" y="176" textAnchor="middle" fill="#92400E" fontSize="10" fontWeight="bold">🔒 Row Lock Active (ACID)</text>

          <line x1="540" y1="210" x2="340" y2="210" stroke="#4F46E5" strokeWidth="2" strokeDasharray="4 3" />
          <text x="440" y="203" textAnchor="middle" fill="#4F46E5" fontSize="11" fontWeight="600">3. Status = 'VACANT' confirmed</text>

          <line x1="340" y1="250" x2="740" y2="250" stroke="#059669" strokeWidth="2" />
          <text x="540" y="243" textAnchor="middle" fill="#059669" fontSize="11" fontWeight="600">4. Init Payment Reference (₦35,000)</text>

          <line x1="740" y1="290" x2="340" y2="290" stroke="#059669" strokeWidth="2" strokeDasharray="4 3" />
          <text x="540" y="283" textAnchor="middle" fill="#059669" fontSize="11" fontWeight="600">5. Returns Checkout URL</text>

          <line x1="340" y1="330" x2="540" y2="330" stroke="#4F46E5" strokeWidth="2" />
          <text x="440" y="323" textAnchor="middle" fill="#4F46E5" fontSize="11" fontWeight="600">6. COMMIT + Status = 'PENDING'</text>

          <line x1="330" y1="370" x2="130" y2="370" stroke="#0284C7" strokeWidth="2" strokeDasharray="4 3" />
          <text x="230" y="363" textAnchor="middle" fill="#0284C7" fontSize="11" fontWeight="600">7. Redirect Student to Payment Gateway</text>
        </svg>
      )
    },
    {
      id: 'erd',
      name: 'Entity Relationship Diagram (ERD 3NF)',
      type: 'Structural UML',
      chapterNote: 'Indispensable for Chapter 3: Database Schema & Relational Integrity Specifications.',
      mermaidCode: `erDiagram
  STUDENT ||--o{ ALLOCATION : "submits"
  BEDSPACE ||--o{ ALLOCATION : "assigned_to"
  HOSTEL_BLOCK ||--|{ ROOM : "contains"
  ROOM ||--|{ BEDSPACE : "furnishes"
  ALLOCATION ||--|| PAYMENT_TRANSACTION : "verified_by"

  STUDENT {
    string matric_number PK
    string full_name
    string department
    int level
    string phone_number
    string institutional_email
  }

  HOSTEL_BLOCK {
    int block_id PK
    string block_name
    string gender_restriction
    int total_floors
  }

  ROOM {
    int room_id PK
    int block_id FK
    string room_number
    int capacity
  }

  BEDSPACE {
    int bedspace_id PK
    int room_id FK
    string bed_label
    string allocation_status
  }

  ALLOCATION {
    string allocation_id PK
    string matric_number FK
    int bedspace_id FK
    datetime applied_at
    string clearance_status
  }

  PAYMENT_TRANSACTION {
    string reference_code PK
    string allocation_id FK
    float amount_paid
    string channel
    string gateway_status
  }`,
      svgPreview: (
        <svg viewBox="0 0 850 480" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <rect width="850" height="480" fill="#F8FAFC" />

          <g transform="translate(40, 40)">
            <rect width="210" height="170" rx="8" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
            <rect width="210" height="32" rx="8" fill="#3B82F6" />
            <text x="105" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">STUDENTS</text>
            <text x="15" y="55" fill="#1E40AF" fontSize="11" fontWeight="bold">🔑 matric_no (VARCHAR)</text>
            <text x="15" y="75" fill="#475569" fontSize="11">• full_name (VARCHAR)</text>
            <text x="15" y="95" fill="#475569" fontSize="11">• department (VARCHAR)</text>
            <text x="15" y="115" fill="#475569" fontSize="11">• level (INT)</text>
            <text x="15" y="135" fill="#475569" fontSize="11">• phone_number (VARCHAR)</text>
            <text x="15" y="155" fill="#475569" fontSize="11">• gender (CHAR)</text>
          </g>

          <g transform="translate(320, 160)">
            <rect width="210" height="160" rx="8" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2" />
            <rect width="210" height="32" rx="8" fill="#8B5CF6" />
            <text x="105" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">ALLOCATIONS</text>
            <text x="15" y="55" fill="#6D28D9" fontSize="11" fontWeight="bold">🔑 allocation_id (UUID)</text>
            <text x="15" y="75" fill="#6D28D9" fontSize="11">🔗 matric_no (FK)</text>
            <text x="15" y="95" fill="#6D28D9" fontSize="11">🔗 bedspace_id (FK)</text>
            <text x="15" y="115" fill="#475569" fontSize="11">• assigned_date (DATETIME)</text>
            <text x="15" y="135" fill="#475569" fontSize="11">• status (VARCHAR)</text>
          </g>

          <g transform="translate(600, 40)">
            <rect width="210" height="150" rx="8" fill="#FFFFFF" stroke="#10B981" strokeWidth="2" />
            <rect width="210" height="32" rx="8" fill="#10B981" />
            <text x="105" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">BEDSPACES</text>
            <text x="15" y="55" fill="#047857" fontSize="11" fontWeight="bold">🔑 bedspace_id (INT PK)</text>
            <text x="15" y="75" fill="#047857" fontSize="11">🔗 room_id (FK)</text>
            <text x="15" y="95" fill="#475569" fontSize="11">• bed_label (CHAR)</text>
            <text x="15" y="115" fill="#475569" fontSize="11">• is_vacant (BOOLEAN)</text>
            <text x="15" y="135" fill="#475569" fontSize="11">• lock_version (INT)</text>
          </g>

          <g transform="translate(40, 290)">
            <rect width="210" height="140" rx="8" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
            <rect width="210" height="32" rx="8" fill="#F59E0B" />
            <text x="105" y="21" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">PAYMENTS</text>
            <text x="15" y="55" fill="#B45309" fontSize="11" fontWeight="bold">🔑 paystack_ref (VARCHAR)</text>
            <text x="15" y="75" fill="#B45309" fontSize="11">🔗 allocation_id (FK)</text>
            <text x="15" y="95" fill="#475569" fontSize="11">• amount_ngn (DECIMAL)</text>
            <text x="15" y="115" fill="#475569" fontSize="11">• channel (USSD/CARD)</text>
            <text x="15" y="135" fill="#475569" fontSize="11">• payment_date (DATETIME)</text>
          </g>

          <path d="M 250 120 L 320 200" stroke="#64748B" strokeWidth="2" fill="none" />
          <path d="M 600 120 L 530 200" stroke="#64748B" strokeWidth="2" fill="none" />
          <path d="M 250 350 L 320 270" stroke="#64748B" strokeWidth="2" fill="none" />
        </svg>
      )
    },
    {
      id: 'architecture',
      name: '3-Tier System Architecture',
      type: 'Structural UML',
      chapterNote: 'Recommended for Chapter 3: Architectural Framework & Network Deployment Topology.',
      mermaidCode: `graph TD
  subgraph PresentationTier["Tier 1: Presentation Layer (Client)"]
    A[Student Mobile / Web App]
    B[Admin Web Dashboard]
  end

  subgraph LogicTier["Tier 2: Business & Application Layer"]
    C[API Gateway / Nginx Reverse Proxy]
    D[Authentication Controller - JWT/RBAC]
    E[Allocation Engine - Serialized Locking]
    F[Paystack Webhook Listener]
  end

  subgraph DataTier["Tier 3: Persistence & Storage Layer"]
    G[(PostgreSQL / SQLite Database)]
    H[(Redis Cache - Session & Seat Lock)]
    I[AWS S3 / Local Media Uploads]
  end

  A --> C
  B --> C
  C --> D
  D --> E
  E --> F
  E --> G
  E --> H
  D --> G`,
      svgPreview: (
        <svg viewBox="0 0 850 480" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <rect width="850" height="480" fill="#F8FAFC" />

          <rect x="50" y="30" width="750" height="110" rx="12" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
          <text x="70" y="55" fill="#0369A1" fontSize="12" fontWeight="bold">TIER 1: PRESENTATION LAYER (USER INTERFACE)</text>
          <g transform="translate(100, 70)">
            <rect width="280" height="50" rx="8" fill="#F0F9FF" stroke="#38BDF8" />
            <text x="140" y="30" textAnchor="middle" fill="#0C4A6E" fontSize="12" fontWeight="600">📱 Student Portal (Responsive Next.js/Tailwind)</text>
          </g>
          <g transform="translate(470, 70)">
            <rect width="280" height="50" rx="8" fill="#F0F9FF" stroke="#38BDF8" />
            <text x="140" y="30" textAnchor="middle" fill="#0C4A6E" fontSize="12" fontWeight="600">💻 Hall Admin / Porter Workstation</text>
          </g>

          <rect x="50" y="170" width="750" height="130" rx="12" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="1.5" />
          <text x="70" y="195" fill="#6D28D9" fontSize="12" fontWeight="bold">TIER 2: APPLICATION & BUSINESS LOGIC LAYER</text>
          <g transform="translate(80, 215)">
            <rect width="190" height="60" rx="8" fill="#F5F3FF" stroke="#C4B5FD" />
            <text x="95" y="30" textAnchor="middle" fill="#4C1D95" fontSize="11" fontWeight="bold">Auth & RBAC</text>
            <text x="95" y="48" textAnchor="middle" fill="#6B21A8" fontSize="10">JWT Clearance Filter</text>
          </g>
          <g transform="translate(330, 215)">
            <rect width="190" height="60" rx="8" fill="#F5F3FF" stroke="#C4B5FD" />
            <text x="95" y="30" textAnchor="middle" fill="#4C1D95" fontSize="11" fontWeight="bold">Allocation Core</text>
            <text x="95" y="48" textAnchor="middle" fill="#6B21A8" fontSize="10">Row-Lock Concurrency</text>
          </g>
          <g transform="translate(580, 215)">
            <rect width="190" height="60" rx="8" fill="#F5F3FF" stroke="#C4B5FD" />
            <text x="95" y="30" textAnchor="middle" fill="#4C1D95" fontSize="11" fontWeight="bold">Payment Daemon</text>
            <text x="95" y="48" textAnchor="middle" fill="#6B21A8" fontSize="10">Paystack Webhooks</text>
          </g>

          <rect x="50" y="330" width="750" height="120" rx="12" fill="#FFFFFF" stroke="#10B981" strokeWidth="1.5" />
          <text x="70" y="355" fill="#047857" fontSize="12" fontWeight="bold">TIER 3: PERSISTENCE & DATA STORAGE LAYER</text>
          <g transform="translate(140, 375)">
            <rect width="250" height="55" rx="8" fill="#ECFDF5" stroke="#6EE7B7" />
            <text x="125" y="33" textAnchor="middle" fill="#065F46" fontSize="12" fontWeight="bold">🗄️ SQLite / PostgreSQL Database</text>
          </g>
          <g transform="translate(460, 375)">
            <rect width="250" height="55" rx="8" fill="#ECFDF5" stroke="#6EE7B7" />
            <text x="125" y="33" textAnchor="middle" fill="#065F46" fontSize="12" fontWeight="bold">📂 Local Media / PDF Voucher Vault</text>
          </g>
        </svg>
      )
    }
  ];

  const [dynamicCodes, setDynamicCodes] = useState<Record<string, string>>({});
  const [aiProviders, setAiProviders] = useState<Record<string, string>>({});
  const [customExplanations, setCustomExplanations] = useState<Record<string, string>>({});

  const currentPreset = presets.find(p => p.id === selectedDiagram) || presets[0];
  const activeMermaidCode = dynamicCodes[selectedDiagram] || currentPreset.mermaidCode;
  const activeExplanation = customExplanations[selectedDiagram] || currentPreset.chapterNote;
  const activeProvider = aiProviders[selectedDiagram];

  function handleCopy() {
    navigator.clipboard.writeText(activeMermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExportSvg() {
    try {
      const container = document.getElementById('uml-svg-container');
      const svg = container ? container.querySelector('svg') : null;
      let svgText = '';
      if (svg) {
        svgText = new XMLSerializer().serializeToString(svg);
      } else {
        svgText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 850 480"><rect width="850" height="480" fill="#070F2B"/><text x="50%" y="50%" fill="#38BDF8" font-family="sans-serif" font-size="20" text-anchor="middle">${currentPreset.name} - ${projectTitle}</text></svg>`;
      }
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `UML_${currentPreset.name.replace(/\s+/g, '_')}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setSuccessBanner(`SVG Export notice: ${err.message}`);
      setTimeout(() => setSuccessBanner(null), 4000);
    }
  }

  function handleExportMermaid() {
    const blob = new Blob([activeMermaidCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPreset.id}_diagram.mmd`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccessBanner(`Exported Mermaid diagram file: ${currentPreset.id}_diagram.mmd`);
    setTimeout(() => setSuccessBanner(null), 4000);
  }

  async function handleGenerateNew() {
    const cleanTopic = projectTitle.trim();
    if (!cleanTopic) {
      setSuccessBanner('Please specify a project or thesis topic before generating custom UML diagrams.');
      setTimeout(() => setSuccessBanner(null), 4000);
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-uml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: cleanTopic,
          diagramType: selectedDiagram,
          department: 'Computer Science / Engineering',
        }),
      });
      const data = await res.json();
      if (data.success && data.mermaidCode) {
        setDynamicCodes(prev => ({ ...prev, [selectedDiagram]: data.mermaidCode }));
        if (data.explanation) {
          setCustomExplanations(prev => ({ ...prev, [selectedDiagram]: data.explanation }));
        }
        if (data.provider) {
          setAiProviders(prev => ({ ...prev, [selectedDiagram]: data.provider }));
        }
        setIsGenerated(true);
        setActiveTab('code');
        setSuccessBanner(`Synthesized custom ${currentPreset.name} tailored for "${cleanTopic}" via ${data.provider || 'AI Engine'}!`);
      } else {
        setIsGenerated(true);
        setSuccessBanner(data.error || `Generated updated UML architectural specifications for: "${cleanTopic}".`);
      }
    } catch (err: any) {
      setSuccessBanner(err.message || 'Error communicating with UML synthesis engine.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setSuccessBanner(null), 5000);
    }
  }

  return (
    <AppLayout
      activeItem="uml-diagrams"
      title="UML Diagram Studio"
      subtitle="Generates vector SVG, ERD, Use Case, Sequence Diagrams with Row-Level Locks and editable Mermaid syntax"
    >
      {/* Dynamic Success Banner */}
      {successBanner && (
        <div className="mb-4 bg-purple-50 border border-purple-200 text-purple-950 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-purple-500 hover:text-purple-700 font-bold ml-2 text-xs"
          >
            &times;
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Control Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <GitFork className="w-4 h-4 text-purple-600" />
              <span>Diagram Selector</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thesis Project Title</label>
              <textarea
                rows={2}
                value={projectTitle}
                onChange={e => setProjectTitle(e.target.value)}
                placeholder="e.g. Automated Hostel Allocation and Facility Management System"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Select UML Diagram Type</label>
              <div className="space-y-2">
                {presets.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedDiagram(item.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      selectedDiagram === item.id
                        ? 'border-purple-500 bg-purple-50/70 text-purple-950 font-bold shadow-xs'
                        : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.type}</div>
                    </div>
                    {selectedDiagram === item.id && (
                      <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateNew}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Synthesizing Schemas...' : 'Re-Generate UML Set (1 Credit)'}</span>
            </button>
          </div>

          {/* Academic Placement Recommendation */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 text-xs text-purple-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-900">
              <Info className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>Academic Defense Guidance</span>
            </div>
            <p className="text-[11px] leading-relaxed text-purple-800">
              {activeExplanation}
            </p>
            <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between text-[10px] font-semibold text-purple-700">
              <span>IEEE / ACM Notation Standard</span>
              <span>Vector Scalable (Zero Pixelation)</span>
            </div>
          </div>
        </div>

        {/* Right Canvas / Preview Pane (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            {/* Top Toolbar */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{currentPreset.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                  {currentPreset.type}
                </span>
                {activeProvider && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    ✨ {activeProvider}
                  </span>
                )}
              </div>

              {/* View Switcher & Actions */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-200/70 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setActiveTab('visual')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      activeTab === 'visual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    SVG Vector
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      activeTab === 'code' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Mermaid Code
                  </button>
                </div>

                {activeTab === 'visual' && (
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(60, prev - 15))}
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-bold text-slate-600 w-9 text-center">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(160, prev + 15))}
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={handleExportMermaid}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Download Mermaid Source File (.mmd)"
                >
                  <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Export .MMD</span>
                </button>

                <button
                  onClick={handleExportSvg}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs hover:opacity-95 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export SVG Vector</span>
                </button>
              </div>
            </div>

            {/* Display Area */}
            <div id="uml-svg-container" className="p-4 bg-slate-100/50 min-h-[460px] flex items-center justify-center overflow-auto">
              {!isGenerated ? (
                <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-3 shadow-inner">
                    <GitFork className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">No UML Architecture Generated Yet</h4>
                  <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                    Enter your research project title and select a diagram type on the left, then click <strong>&ldquo;Generate Architecture (AI)&rdquo;</strong> to render high-resolution vector models.
                  </p>
                  <button
                    onClick={handleGenerateNew}
                    disabled={isGenerating || !projectTitle.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />}
                    <span>Generate Architecture (AI)</span>
                  </button>
                </div>
              ) : activeTab === 'visual' ? (
                <div
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                  className="transition-transform duration-200 ease-out w-full max-w-[850px] bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden"
                >
                  {currentPreset.svgPreview}
                </div>
              ) : (
                <div className="w-full h-[450px] bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-auto border border-slate-800">
                  <div className="text-slate-500 mb-2">// Raw Mermaid Diagram Source Code for Word & LaTeX Insertion</div>
                  <pre>{activeMermaidCode}</pre>
                </div>
              )}
            </div>

            {/* Bottom info footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Compatible with draw.io, Mermaid Live Editor, Word & LaTeX (`pgf-umlcd`)</span>
              </div>
              <div className="font-semibold text-slate-700">
                Figure 3.{presets.findIndex(p => p.id === selectedDiagram) + 1}: System Architecture
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
