// web/src/lib/academic-diagrams.ts
// Programmatic SVG & High-Resolution Vector Diagram Generator for Chapter 3 & Chapter 4
// Generates publication-quality UML diagrams and realistic software screenshots for Microsoft Word (DOCX)

import sharp from 'sharp';

// 1. High-Level Three-Tier System Architecture (Figure 3.1)
export function getArchitectureSvg(topic: string, course: string): string {
  const safeTopic = (topic || 'Automated System').slice(0, 48);
  return `
  <svg width="800" height="460" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="cardGrad1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
      <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2563eb" />
        <stop offset="100%" stop-color="#1d4ed8" />
      </linearGradient>
      <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#059669" />
        <stop offset="100%" stop-color="#047857" />
      </linearGradient>
      <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7c3aed" />
        <stop offset="100%" stop-color="#6d28d9" />
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.3"/>
      </filter>
    </defs>

    <!-- Canvas Background -->
    <rect width="800" height="460" fill="#f8fafc" rx="16" />
    <rect x="15" y="15" width="770" height="430" fill="none" stroke="#cbd5e1" stroke-width="1.5" rx="12" stroke-dasharray="4 4"/>

    <!-- Diagram Header -->
    <text x="400" y="45" font-family="'Times New Roman', serif" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">
      FIGURE 3.1: SYSTEM ARCHITECTURE &amp; THREE-TIER PIPELINE
    </text>
    <text x="400" y="65" font-family="Arial, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">
      Platform: ${safeTopic}
    </text>

    <!-- TIER 1: CLIENT PRESENTATION TIER -->
    <g transform="translate(40, 90)">
      <rect width="210" height="300" rx="12" fill="#ffffff" stroke="#93c5fd" stroke-width="2" filter="url(#shadow)" />
      <rect width="210" height="38" rx="12" fill="url(#blueGrad)" />
      <text x="105" y="24" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">
        PRESENTATION TIER
      </text>

      <g transform="translate(15, 55)">
        <rect width="180" height="65" rx="8" fill="#eff6ff" stroke="#bfdbfe" />
        <text x="90" y="24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#1e40af" text-anchor="middle">Responsive SPA UI</text>
        <text x="90" y="42" font-family="Arial, sans-serif" font-size="9" fill="#3b82f6" text-anchor="middle">HTML5 / Tailwind CSS</text>
        <text x="90" y="55" font-family="Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">Cross-Platform Viewport</text>
      </g>

      <g transform="translate(15, 135)">
        <rect width="180" height="65" rx="8" fill="#eff6ff" stroke="#bfdbfe" />
        <text x="90" y="24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#1e40af" text-anchor="middle">Client State Controller</text>
        <text x="90" y="42" font-family="Arial, sans-serif" font-size="9" fill="#3b82f6" text-anchor="middle">Vanilla JS Event Loop</text>
        <text x="90" y="55" font-family="Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">Form Sanitization &amp; Crypto</text>
      </g>

      <g transform="translate(15, 215)">
        <rect width="180" height="65" rx="8" fill="#eff6ff" stroke="#bfdbfe" />
        <text x="90" y="24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#1e40af" text-anchor="middle">Async REST Client</text>
        <text x="90" y="42" font-family="Arial, sans-serif" font-size="9" fill="#3b82f6" text-anchor="middle">Fetch API / JSON Payload</text>
        <text x="90" y="55" font-family="Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">Bearer Auth Storage</text>
      </g>
    </g>

    <!-- ARROW 1: Tier 1 to Tier 2 -->
    <path d="M 250 240 L 295 240" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="4 2" />
    <polygon points="295,235 305,240 295,245" fill="#0284c7" />
    <path d="M 305 255 L 260 255" stroke="#64748b" stroke-width="2" stroke-dasharray="3 3" />
    <polygon points="260,250 250,255 260,260" fill="#64748b" />
    <text x="278" y="230" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#0369a1" text-anchor="middle">HTTP POST</text>
    <text x="278" y="270" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle">JSON (200)</text>

    <!-- TIER 2: APPLICATION LOGIC TIER -->
    <g transform="translate(305, 90)">
      <rect width="210" height="300" rx="12" fill="#ffffff" stroke="#c084fc" stroke-width="2" filter="url(#shadow)" />
      <rect width="210" height="38" rx="12" fill="url(#purpleGrad)" />
      <text x="105" y="24" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">
        APPLICATION TIER
      </text>

      <g transform="translate(15, 55)">
        <rect width="180" height="65" rx="8" fill="#faf5ff" stroke="#e9d5ff" />
        <text x="90" y="24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#6b21a8" text-anchor="middle">Python REST Server</text>
        <text x="90" y="42" font-family="Arial, sans-serif" font-size="9" fill="#7e22ce" text-anchor="middle">Native http.server Kernel</text>
        <text x="90" y="55" font-family="Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">Zero External Dependencies</text>
      </g>

      <g transform="translate(15, 135)">
        <rect width="180" height="65" rx="8" fill="#faf5ff" stroke="#e9d5ff" />
        <text x="90" y="24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#6b21a8" text-anchor="middle">Authentication Controller</text>
        <text x="90" y="42" font-family="Arial, sans-serif" font-size="9" fill="#7e22ce" text-anchor="middle">Role-Based Access Control</text>
        <text x="90" y="55" font-family="Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">PBKDF2 Password Hashing</text>
      </g>

      <g transform="translate(15, 215)">
        <rect width="180" height="65" rx="8" fill="#faf5ff" stroke="#e9d5ff" />
        <text x="90" y="24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#6b21a8" text-anchor="middle">Transactional Service</text>
        <text x="90" y="42" font-family="Arial, sans-serif" font-size="9" fill="#7e22ce" text-anchor="middle">Business Logic Engine</text>
        <text x="90" y="55" font-family="Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">Audit Trail Logger (ACID)</text>
      </g>
    </g>

    <!-- ARROW 2: Tier 2 to Tier 3 -->
    <path d="M 515 240 L 560 240" stroke="#059669" stroke-width="2.5" />
    <polygon points="560,235 570,240 560,245" fill="#059669" />
    <path d="M 570 255 L 525 255" stroke="#64748b" stroke-width="2" stroke-dasharray="3 3" />
    <polygon points="525,250 515,255 525,260" fill="#64748b" />
    <text x="542" y="230" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#047857" text-anchor="middle">SQL Query</text>
    <text x="542" y="270" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#64748b" text-anchor="middle">Cursor Set</text>

    <!-- TIER 3: DATA STORAGE TIER -->
    <g transform="translate(570, 90)">
      <rect width="190" height="300" rx="12" fill="#ffffff" stroke="#6ee7b7" stroke-width="2" filter="url(#shadow)" />
      <rect width="190" height="38" rx="12" fill="url(#emeraldGrad)" />
      <text x="95" y="24" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">
        DATABASE TIER
      </text>

      <g transform="translate(15, 55)">
        <rect width="160" height="65" rx="8" fill="#ecfdf5" stroke="#a7f3d0" />
        <text x="80" y="24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#065f46" text-anchor="middle">SQLite 3.x Engine</text>
        <text x="80" y="42" font-family="Arial, sans-serif" font-size="9" fill="#047857" text-anchor="middle">Embedded Serverless DB</text>
        <text x="80" y="55" font-family="Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">Zero-Admin Storage</text>
      </g>

      <g transform="translate(15, 135)">
        <rect width="160" height="65" rx="8" fill="#ecfdf5" stroke="#a7f3d0" />
        <text x="80" y="24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#065f46" text-anchor="middle">ACID Transactions</text>
        <text x="80" y="42" font-family="Arial, sans-serif" font-size="9" fill="#047857" text-anchor="middle">WAL Mode (Write-Ahead)</text>
        <text x="80" y="55" font-family="Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">Row-Level Integrity</text>
      </g>

      <g transform="translate(15, 215)">
        <rect width="160" height="65" rx="8" fill="#ecfdf5" stroke="#a7f3d0" />
        <text x="80" y="24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#065f46" text-anchor="middle">Normalized Schema</text>
        <text x="80" y="42" font-family="Arial, sans-serif" font-size="9" fill="#047857" text-anchor="middle">Users, Records, Logs</text>
        <text x="80" y="55" font-family="Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">3NF Referential Integrity</text>
      </g>
    </g>

    <!-- Footer Caption -->
    <text x="400" y="420" font-family="'Times New Roman', serif" font-size="11" font-style="italic" fill="#475569" text-anchor="middle">
      Source: Designed by Candidate Researcher for Thesis Defense (2026)
    </text>
  </svg>`;
}

// 2. UML Use Case Model (Figure 3.2)
export function getUseCaseSvg(topic: string): string {
  const safeTopic = (topic || 'Automated System').slice(0, 48);
  return `
  <svg width="800" height="480" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="480" fill="#ffffff" rx="16" />
    <rect x="15" y="15" width="770" height="450" fill="none" stroke="#cbd5e1" stroke-width="1.5" rx="12" />

    <text x="400" y="42" font-family="'Times New Roman', serif" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">
      FIGURE 3.2: UML USE CASE DIAGRAM OF PROPOSED SYSTEM
    </text>
    <text x="400" y="62" font-family="Arial, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">
      Application Context: ${safeTopic}
    </text>

    <!-- System Boundary Box -->
    <rect x="220" y="80" width="360" height="350" rx="10" fill="#f8fafc" stroke="#2563eb" stroke-width="2" stroke-dasharray="6 3" />
    <text x="400" y="105" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#1e40af" text-anchor="middle">
      [System Boundary: ${safeTopic.slice(0, 32)}]
    </text>

    <!-- Left Actor: Regular User / Student -->
    <g transform="translate(60, 160)">
      <circle cx="40" cy="30" r="16" fill="#eff6ff" stroke="#2563eb" stroke-width="2" />
      <line x1="40" y1="46" x2="40" y2="90" stroke="#2563eb" stroke-width="2.5" />
      <line x1="15" y1="62" x2="65" y2="62" stroke="#2563eb" stroke-width="2.5" />
      <line x1="40" y1="90" x2="20" y2="135" stroke="#2563eb" stroke-width="2.5" />
      <line x1="40" y1="90" x2="60" y2="135" stroke="#2563eb" stroke-width="2.5" />
      <text x="40" y="155" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="middle">Candidate / User</text>
    </g>

    <!-- Right Actor: Administrator / Supervisor -->
    <g transform="translate(660, 160)">
      <circle cx="40" cy="30" r="16" fill="#fdf2f8" stroke="#db2777" stroke-width="2" />
      <line x1="40" y1="46" x2="40" y2="90" stroke="#db2777" stroke-width="2.5" />
      <line x1="15" y1="62" x2="65" y2="62" stroke="#db2777" stroke-width="2.5" />
      <line x1="40" y1="90" x2="20" y2="135" stroke="#db2777" stroke-width="2.5" />
      <line x1="40" y1="90" x2="60" y2="135" stroke="#db2777" stroke-width="2.5" />
      <text x="40" y="155" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="middle">System Admin</text>
    </g>

    <!-- Use Cases (Ovals) -->
    <!-- UC 1: Login & Authenticate -->
    <g transform="translate(260, 125)">
      <ellipse cx="140" cy="22" rx="120" ry="20" fill="#ffffff" stroke="#0284c7" stroke-width="1.8" />
      <text x="140" y="27" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">
        UC1: Role-Based Authentication
      </text>
    </g>

    <!-- UC 2: Submit Operational Record -->
    <g transform="translate(260, 185)">
      <ellipse cx="140" cy="22" rx="120" ry="20" fill="#ffffff" stroke="#0284c7" stroke-width="1.8" />
      <text x="140" y="27" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">
        UC2: Submit Operational Record
      </text>
    </g>

    <!-- UC 3: Query & Filter Database Records -->
    <g transform="translate(260, 245)">
      <ellipse cx="140" cy="22" rx="120" ry="20" fill="#ffffff" stroke="#0284c7" stroke-width="1.8" />
      <text x="140" y="27" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">
        UC3: Query &amp; Filter Active Data
      </text>
    </g>

    <!-- UC 4: Manage & Approve Records -->
    <g transform="translate(260, 305)">
      <ellipse cx="140" cy="22" rx="120" ry="20" fill="#ffffff" stroke="#db2777" stroke-width="1.8" />
      <text x="140" y="27" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#9d174d" text-anchor="middle">
        UC4: Admin Record Approval &amp; Edit
      </text>
    </g>

    <!-- UC 5: Inspect Audit Logs & Telemetry -->
    <g transform="translate(260, 365)">
      <ellipse cx="140" cy="22" rx="120" ry="20" fill="#ffffff" stroke="#db2777" stroke-width="1.8" />
      <text x="140" y="27" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#9d174d" text-anchor="middle">
        UC5: Telemetry &amp; ACID Audit Trails
      </text>
    </g>

    <!-- Association Lines from Left Actor -->
    <line x1="130" y1="210" x2="260" y2="147" stroke="#2563eb" stroke-width="1.5" />
    <line x1="130" y1="220" x2="260" y2="207" stroke="#2563eb" stroke-width="1.5" />
    <line x1="130" y1="230" x2="260" y2="267" stroke="#2563eb" stroke-width="1.5" />

    <!-- Association Lines from Right Actor -->
    <line x1="670" y1="210" x2="540" y2="147" stroke="#db2777" stroke-width="1.5" />
    <line x1="670" y1="220" x2="540" y2="267" stroke="#db2777" stroke-width="1.5" />
    <line x1="670" y1="230" x2="540" y2="327" stroke="#db2777" stroke-width="1.5" />
    <line x1="670" y1="240" x2="540" y2="387" stroke="#db2777" stroke-width="1.5" />

    <!-- Footer Caption -->
    <text x="400" y="455" font-family="'Times New Roman', serif" font-size="11" font-style="italic" fill="#475569" text-anchor="middle">
      Figure 3.2: UML Actor-Boundary Functional Modeling. Source: Field Study (2026)
    </text>
  </svg>`;
}

// 3. Relational Entity-Relationship Diagram (ERD) (Figure 3.4)
export function getErdSvg(topic: string): string {
  return `
  <svg width="800" height="460" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="460" fill="#ffffff" rx="16" />
    <rect x="15" y="15" width="770" height="430" fill="none" stroke="#cbd5e1" stroke-width="1.5" rx="12" />

    <text x="400" y="42" font-family="'Times New Roman', serif" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">
      FIGURE 3.4: RELATIONAL DATABASE ENTITY-RELATIONSHIP DIAGRAM (3NF)
    </text>

    <!-- ENTITY 1: USERS TABLE -->
    <g transform="translate(45, 90)">
      <rect width="180" height="180" rx="8" fill="#ffffff" stroke="#2563eb" stroke-width="2" />
      <rect width="180" height="30" rx="8" fill="#2563eb" />
      <text x="90" y="20" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">USERS</text>
      <text x="15" y="55" font-family="monospace" font-size="10" fill="#0f172a">PK  id : INTEGER</text>
      <text x="15" y="80" font-family="monospace" font-size="10" fill="#475569">    username : TEXT</text>
      <text x="15" y="105" font-family="monospace" font-size="10" fill="#475569">    email : VARCHAR</text>
      <text x="15" y="130" font-family="monospace" font-size="10" fill="#475569">    password : TEXT</text>
      <text x="15" y="155" font-family="monospace" font-size="10" fill="#475569">    role : TEXT</text>
      <text x="15" y="175" font-family="monospace" font-size="9" fill="#94a3b8">    created_at : DATE</text>
    </g>

    <!-- ENTITY 2: RECORDS TABLE -->
    <g transform="translate(305, 90)">
      <rect width="190" height="195" rx="8" fill="#ffffff" stroke="#059669" stroke-width="2" />
      <rect width="190" height="30" rx="8" fill="#059669" />
      <text x="95" y="20" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">RECORDS</text>
      <text x="15" y="55" font-family="monospace" font-size="10" fill="#0f172a">PK  id : INTEGER</text>
      <text x="15" y="80" font-family="monospace" font-size="10" fill="#059669">FK  user_id : INTEGER</text>
      <text x="15" y="105" font-family="monospace" font-size="10" fill="#475569">    title : VARCHAR</text>
      <text x="15" y="130" font-family="monospace" font-size="10" fill="#475569">    category : TEXT</text>
      <text x="15" y="155" font-family="monospace" font-size="10" fill="#475569">    description : TEXT</text>
      <text x="15" y="175" font-family="monospace" font-size="10" fill="#475569">    status : VARCHAR</text>
      <text x="15" y="190" font-family="monospace" font-size="9" fill="#94a3b8">    created_at : DATE</text>
    </g>

    <!-- ENTITY 3: TRANSACTIONS TABLE -->
    <g transform="translate(570, 90)">
      <rect width="180" height="180" rx="8" fill="#ffffff" stroke="#7c3aed" stroke-width="2" />
      <rect width="180" height="30" rx="8" fill="#7c3aed" />
      <text x="90" y="20" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">TRANSACTIONS</text>
      <text x="15" y="55" font-family="monospace" font-size="10" fill="#0f172a">PK  id : INTEGER</text>
      <text x="15" y="80" font-family="monospace" font-size="10" fill="#7c3aed">FK  record_id : INT</text>
      <text x="15" y="105" font-family="monospace" font-size="10" fill="#475569">    amount : REAL</text>
      <text x="15" y="130" font-family="monospace" font-size="10" fill="#475569">    reference : VARCHAR</text>
      <text x="15" y="155" font-family="monospace" font-size="10" fill="#475569">    channel : TEXT</text>
      <text x="15" y="175" font-family="monospace" font-size="9" fill="#94a3b8">    status : TEXT</text>
    </g>

    <!-- ENTITY 4: AUDIT LOGS TABLE -->
    <g transform="translate(180, 310)">
      <rect width="440" height="100" rx="8" fill="#ffffff" stroke="#d97706" stroke-width="2" />
      <rect width="440" height="28" rx="8" fill="#d97706" />
      <text x="220" y="19" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">AUDIT_LOGS (SECURITY &amp; COMPLIANCE)</text>
      <text x="25" y="52" font-family="monospace" font-size="10" fill="#0f172a">PK  id : INTEGER</text>
      <text x="145" y="52" font-family="monospace" font-size="10" fill="#d97706">FK  user_id : INTEGER</text>
      <text x="275" y="52" font-family="monospace" font-size="10" fill="#475569">action : VARCHAR(64)</text>
      <text x="25" y="80" font-family="monospace" font-size="10" fill="#475569">details : TEXT</text>
      <text x="175" y="80" font-family="monospace" font-size="10" fill="#475569">ip_address : VARCHAR(45)</text>
      <text x="330" y="80" font-family="monospace" font-size="9" fill="#94a3b8">created_at : TIMESTAMP</text>
    </g>

    <!-- CONNECTIONS: Users (1) -> Records (M) -->
    <path d="M 225 170 L 305 170" stroke="#0284c7" stroke-width="2" />
    <circle cx="230" cy="170" r="3" fill="#0284c7" />
    <path d="M 300 165 L 305 170 L 300 175" fill="none" stroke="#0284c7" stroke-width="2" />
    <text x="265" y="160" font-family="Arial" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle">1 : N</text>

    <!-- CONNECTIONS: Records (1) -> Transactions (M) -->
    <path d="M 495 170 L 570 170" stroke="#7c3aed" stroke-width="2" />
    <circle cx="500" cy="170" r="3" fill="#7c3aed" />
    <path d="M 565 165 L 570 170 L 565 175" fill="none" stroke="#7c3aed" stroke-width="2" />
    <text x="532" y="160" font-family="Arial" font-size="9" font-weight="bold" fill="#6d28d9" text-anchor="middle">1 : N</text>

    <!-- CONNECTIONS: Users (1) -> Audit Logs (M) -->
    <path d="M 135 270 L 135 340 L 180 340" stroke="#d97706" stroke-width="2" />
    <circle cx="135" cy="275" r="3" fill="#d97706" />
    <path d="M 175 335 L 180 340 L 175 345" fill="none" stroke="#d97706" stroke-width="2" />
    <text x="145" y="325" font-family="Arial" font-size="9" font-weight="bold" fill="#b45309">1 : N</text>

    <!-- Footer Caption -->
    <text x="400" y="440" font-family="'Times New Roman', serif" font-size="11" font-style="italic" fill="#475569" text-anchor="middle">
      Figure 3.4: Third Normal Form (3NF) Relational Data Model with Foreign Keys
    </text>
  </svg>`;
}

// 4. Chapter 4 Software UI Screenshot: Login Interface (Figure 4.1)
export function getLoginScreenshotSvg(topic: string): string {
  const safeTopic = (topic || 'Automated Software System').slice(0, 42);
  return `
  <svg width="800" height="480" xmlns="http://www.w3.org/2000/svg">
    <!-- Outer Window Frame -->
    <rect width="800" height="480" rx="14" fill="#0f172a" />
    
    <!-- Window Header -->
    <rect width="800" height="40" rx="14" fill="#1e293b" />
    <rect y="26" width="800" height="14" fill="#1e293b" />
    <circle cx="22" cy="20" r="5.5" fill="#ef4444" />
    <circle cx="38" cy="20" r="5.5" fill="#f59e0b" />
    <circle cx="54" cy="20" r="5.5" fill="#10b981" />
    
    <!-- Browser Address Bar -->
    <rect x="180" y="8" width="440" height="24" rx="6" fill="#0f172a" />
    <text x="400" y="24" font-family="monospace" font-size="10" fill="#38bdf8" text-anchor="middle">
      🔒 http://localhost:8000/login
    </text>

    <!-- Viewport Content Area -->
    <rect x="0" y="40" width="800" height="440" fill="#f8fafc" />

    <!-- Centered Login Card -->
    <g transform="translate(240, 75)">
      <rect width="320" height="350" rx="16" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
      
      <!-- Brand Logo / Badge -->
      <circle cx="160" cy="45" r="22" fill="#2563eb" />
      <text x="160" y="52" font-family="Arial, sans-serif" font-size="14" font-weight="black" fill="#ffffff" text-anchor="middle">CT</text>
      
      <text x="160" y="90" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">
        ${safeTopic}
      </text>
      <text x="160" y="108" font-family="Arial, sans-serif" font-size="10" fill="#64748b" text-anchor="middle">
        Institutional Academic Authentication
      </text>

      <!-- Input Field: Email -->
      <text x="25" y="140" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#334155">Institutional Email</text>
      <rect x="25" y="148" width="270" height="36" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
      <text x="38" y="171" font-family="monospace" font-size="11" fill="#0f172a">admin@codethesis.edu</text>

      <!-- Input Field: Password -->
      <text x="25" y="208" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#334155">Password</text>
      <rect x="25" y="216" width="270" height="36" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
      <text x="38" y="239" font-family="monospace" font-size="12" fill="#0f172a">••••••••••••</text>

      <!-- Sign In Button -->
      <rect x="25" y="275" width="270" height="38" rx="8" fill="#2563eb" />
      <text x="160" y="299" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">
        Sign In to Platform
      </text>

      <!-- Footer Info -->
      <text x="160" y="332" font-family="Arial, sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">
        Protected by PBKDF2 Password Hashing &amp; SQLite Row Locking
      </text>
    </g>
  </svg>`;
}

// 5. Chapter 4 Software UI Screenshot: Central Telemetry Dashboard (Figure 4.2)
export function getDashboardScreenshotSvg(topic: string): string {
  const safeTopic = (topic || 'Automated Software System').slice(0, 42);
  return `
  <svg width="800" height="480" xmlns="http://www.w3.org/2000/svg">
    <!-- Outer Window Frame -->
    <rect width="800" height="480" rx="14" fill="#0f172a" />
    
    <!-- Window Header -->
    <rect width="800" height="40" rx="14" fill="#1e293b" />
    <rect y="26" width="800" height="14" fill="#1e293b" />
    <circle cx="22" cy="20" r="5.5" fill="#ef4444" />
    <circle cx="38" cy="20" r="5.5" fill="#f59e0b" />
    <circle cx="54" cy="20" r="5.5" fill="#10b981" />
    
    <!-- Address Bar -->
    <rect x="180" y="8" width="440" height="24" rx="6" fill="#0f172a" />
    <text x="400" y="24" font-family="monospace" font-size="10" fill="#38bdf8" text-anchor="middle">
      🔒 http://localhost:8000/dashboard
    </text>

    <!-- Viewport Content Area -->
    <rect x="0" y="40" width="800" height="440" fill="#f1f5f9" />

    <!-- Dashboard Top Bar -->
    <g transform="translate(30, 55)">
      <rect width="740" height="50" rx="10" fill="#ffffff" stroke="#e2e8f0" />
      <text x="20" y="26" font-family="Arial, sans-serif" font-size="13" font-weight="black" fill="#0f172a">
        ${safeTopic} — Admin Control Center
      </text>
      <text x="20" y="40" font-family="Arial, sans-serif" font-size="9" fill="#059669" font-weight="bold">
        ● SQLite Connection: ACTIVE (Zero-Pip Serverless Local Engine)
      </text>

      <rect x="620" y="10" width="105" height="30" rx="6" fill="#2563eb" />
      <text x="672" y="29" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">
        + Add Record
      </text>
    </g>

    <!-- Summary KPI Cards -->
    <g transform="translate(30, 115)">
      <!-- KPI 1 -->
      <rect x="0" y="0" width="230" height="70" rx="10" fill="#ffffff" stroke="#e2e8f0" />
      <text x="18" y="24" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748b">TOTAL ACTIVE ENTITIES</text>
      <text x="18" y="52" font-family="Arial, sans-serif" font-size="22" font-weight="black" fill="#0f172a">142</text>
      <text x="160" y="52" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#059669">+14% MoM</text>

      <!-- KPI 2 -->
      <rect x="255" y="0" width="230" height="70" rx="10" fill="#ffffff" stroke="#e2e8f0" />
      <text x="273" y="24" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748b">TRANSACTION VOLUME</text>
      <text x="273" y="52" font-family="Arial, sans-serif" font-size="20" font-weight="black" fill="#2563eb">₦4,850,000</text>

      <!-- KPI 3 -->
      <rect x="510" y="0" width="230" height="70" rx="10" fill="#ffffff" stroke="#e2e8f0" />
      <text x="528" y="24" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748b">SECURITY AUDIT HEALTH</text>
      <text x="528" y="52" font-family="Arial, sans-serif" font-size="22" font-weight="black" fill="#059669">100% OK</text>
    </g>

    <!-- Records Data Table -->
    <g transform="translate(30, 200)">
      <rect width="740" height="240" rx="10" fill="#ffffff" stroke="#e2e8f0" />
      
      <!-- Table Header -->
      <rect width="740" height="35" rx="10" fill="#f8fafc" />
      <text x="20" y="22" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#475569">RECORD ID</text>
      <text x="120" y="22" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#475569">ENTITY TITLE &amp; DESCRIPTION</text>
      <text x="420" y="22" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#475569">CATEGORY</text>
      <text x="540" y="22" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#475569">STATUS</text>
      <text x="660" y="22" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#475569">ACTION</text>

      <!-- Row 1 -->
      <line x1="0" y1="75" x2="740" y2="75" stroke="#f1f5f9" />
      <text x="20" y="60" font-family="monospace" font-size="11" fill="#0f172a">#101</text>
      <text x="120" y="60" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">Primary Benchmark Operational Unit</text>
      <text x="420" y="60" font-family="Arial, sans-serif" font-size="10" fill="#64748b">Core Logic</text>
      <rect x="540" y="47" width="60" height="18" rx="4" fill="#dcfce7" />
      <text x="570" y="60" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#166534" text-anchor="middle">ACTIVE</text>
      <text x="660" y="60" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#2563eb">Verify</text>

      <!-- Row 2 -->
      <line x1="0" y1="115" x2="740" y2="115" stroke="#f1f5f9" />
      <text x="20" y="100" font-family="monospace" font-size="11" fill="#0f172a">#102</text>
      <text x="120" y="100" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">Cryptographic Integrity Signature Unit</text>
      <text x="420" y="100" font-family="Arial, sans-serif" font-size="10" fill="#64748b">Security</text>
      <rect x="540" y="87" width="60" height="18" rx="4" fill="#dcfce7" />
      <text x="570" y="100" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#166534" text-anchor="middle">ACTIVE</text>
      <text x="660" y="100" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#2563eb">Verify</text>

      <!-- Row 3 -->
      <line x1="0" y1="155" x2="740" y2="155" stroke="#f1f5f9" />
      <text x="20" y="140" font-family="monospace" font-size="11" fill="#0f172a">#103</text>
      <text x="120" y="140" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#0f172a">Automated Ingestion Queue Batch #4</text>
      <text x="420" y="140" font-family="Arial, sans-serif" font-size="10" fill="#64748b">Ingestion</text>
      <rect x="540" y="127" width="70" height="18" rx="4" fill="#e0f2fe" />
      <text x="575" y="140" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#075985" text-anchor="middle">PENDING</text>
      <text x="660" y="140" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#2563eb">Approve</text>
    </g>
  </svg>`;
}

// Convert SVG strings to high-resolution PNG buffers via Sharp
export async function renderSvgToPngBuffer(svgString: string): Promise<Buffer> {
  return await sharp(Buffer.from(svgString)).png().toBuffer();
}
