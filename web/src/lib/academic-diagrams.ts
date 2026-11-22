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

// 6. Chapter 3 Context Analysis Diagram (DFD Level-0) (Figure 3.2)
export function getContextDiagramSvg(topic: string): string {
  const safeTopic = (topic || 'Automated Software System').slice(0, 40);
  return `
  <svg width="800" height="480" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="processGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e3a8a" />
        <stop offset="100%" stop-color="#2563eb" />
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.15"/>
      </filter>
    </defs>

    <rect width="800" height="480" fill="#ffffff" rx="16" />
    <rect x="15" y="15" width="770" height="450" fill="none" stroke="#cbd5e1" stroke-width="1.5" rx="12" />

    <!-- Diagram Header -->
    <text x="400" y="42" font-family="'Times New Roman', serif" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">
      FIGURE 3.2: TOP-LEVEL CONTEXT ANALYSIS DIAGRAM (DFD LEVEL-0)
    </text>
    <text x="400" y="62" font-family="Arial, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">
      Context Boundary for: ${safeTopic}
    </text>

    <!-- LEFT EXTERNAL ENTITY: User / Client Personnel -->
    <g transform="translate(40, 160)">
      <rect width="170" height="130" rx="8" fill="#f8fafc" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)" />
      <rect width="170" height="28" rx="8" fill="#3b82f6" />
      <text x="85" y="19" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">
        EXTERNAL ENTITY 1
      </text>
      <text x="85" y="55" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#1e293b" text-anchor="middle">
        End User / Officer
      </text>
      <text x="85" y="75" font-family="Arial, sans-serif" font-size="9" fill="#64748b" text-anchor="middle">
        Operational Personnel
      </text>
      <text x="85" y="95" font-family="Arial, sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">
        Identity Credentials &amp;
      </text>
      <text x="85" y="110" font-family="Arial, sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">
        Service Transaction Inputs
      </text>
    </g>

    <!-- CENTRAL CIRCLE: Primary System Process (0.0) -->
    <g transform="translate(400, 225)">
      <circle cx="0" cy="0" r="105" fill="url(#processGrad)" stroke="#1d4ed8" stroke-width="3" filter="url(#shadow)" />
      <circle cx="0" cy="0" r="95" fill="none" stroke="#93c5fd" stroke-width="1.2" stroke-dasharray="4 2" />
      <text x="0" y="-45" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#93c5fd" text-anchor="middle">
        PROCESS 0.0
      </text>
      <text x="0" y="-20" font-family="Arial, sans-serif" font-size="13" font-weight="black" fill="#ffffff" text-anchor="middle">
        CENTRAL ENGINE
      </text>
      <text x="0" y="5" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">
        ${safeTopic}
      </text>
      <text x="0" y="28" font-family="Arial, sans-serif" font-size="9" fill="#bfdbfe" text-anchor="middle">
        Authentication, Telemetry,
      </text>
      <text x="0" y="44" font-family="Arial, sans-serif" font-size="9" fill="#bfdbfe" text-anchor="middle">
        Control Logic &amp; Logging
      </text>
    </g>

    <!-- RIGHT EXTERNAL ENTITY: System Administrator -->
    <g transform="translate(590, 160)">
      <rect width="170" height="130" rx="8" fill="#f8fafc" stroke="#8b5cf6" stroke-width="2" filter="url(#shadow)" />
      <rect width="170" height="28" rx="8" fill="#8b5cf6" />
      <text x="85" y="19" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">
        EXTERNAL ENTITY 2
      </text>
      <text x="85" y="55" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#1e293b" text-anchor="middle">
        System Administrator
      </text>
      <text x="85" y="75" font-family="Arial, sans-serif" font-size="9" fill="#64748b" text-anchor="middle">
        Supervisor / Command Unit
      </text>
      <text x="85" y="95" font-family="Arial, sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">
        Policy Configuration,
      </text>
      <text x="85" y="110" font-family="Arial, sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">
        User Privileges &amp; Audits
      </text>
    </g>

    <!-- BOTTOM EXTERNAL ENTITY: Hardware Actuators / External Database -->
    <g transform="translate(295, 365)">
      <rect width="210" height="85" rx="8" fill="#f8fafc" stroke="#059669" stroke-width="2" filter="url(#shadow)" />
      <rect width="210" height="24" rx="8" fill="#059669" />
      <text x="105" y="16" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">
        EXTERNAL ENTITY 3 (HARDWARE / IO)
      </text>
      <text x="105" y="45" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="middle">
        Hardware Actuators &amp; Sensors
      </text>
      <text x="105" y="65" font-family="Arial, sans-serif" font-size="8" fill="#64748b" text-anchor="middle">
        Door Relays, Solenoids, Alarm Siren &amp; Telemetry
      </text>
    </g>

    <!-- FLOW ARROWS: Left Entity <-> Process 0.0 -->
    <!-- Forward: User -> Process -->
    <path d="M 210 205 L 295 205" stroke="#2563eb" stroke-width="2" />
    <polygon points="295,200 305,205 295,210" fill="#2563eb" />
    <text x="252" y="195" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#1e40af" text-anchor="middle">
      1: Access Request
    </text>

    <!-- Return: Process -> User -->
    <path d="M 305 235 L 220 235" stroke="#059669" stroke-width="2" stroke-dasharray="3 2" />
    <polygon points="220,230 210,235 220,240" fill="#059669" />
    <text x="258" y="250" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#047857" text-anchor="middle">
      2: Access Status
    </text>

    <!-- FLOW ARROWS: Right Entity <-> Process 0.0 -->
    <!-- Admin -> Process -->
    <path d="M 590 205 L 505 205" stroke="#8b5cf6" stroke-width="2" />
    <polygon points="505,200 495,205 505,210" fill="#8b5cf6" />
    <text x="548" y="195" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#6d28d9" text-anchor="middle">
      3: Security Policy
    </text>

    <!-- Process -> Admin -->
    <path d="M 495 235 L 580 235" stroke="#d97706" stroke-width="2" stroke-dasharray="3 2" />
    <polygon points="580,230 590,235 580,240" fill="#d97706" />
    <text x="542" y="250" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#b45309" text-anchor="middle">
      4: Audit Logs &amp; Alert
    </text>

    <!-- FLOW ARROWS: Process <-> Bottom Entity -->
    <path d="M 385 330 L 385 365" stroke="#059669" stroke-width="2" />
    <polygon points="380,360 385,370 390,360" fill="#059669" />
    <text x="350" y="352" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#047857" text-anchor="middle">
      5: Relay Trigger
    </text>

    <path d="M 415 365 L 415 330" stroke="#0284c7" stroke-width="2" stroke-dasharray="3 2" />
    <polygon points="410,335 415,325 420,335" fill="#0284c7" />
    <text x="450" y="352" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#0369a1" text-anchor="middle">
      6: Sensor Feedback
    </text>

    <!-- Footer Note -->
    <text x="400" y="468" font-family="'Times New Roman', serif" font-size="10" font-style="italic" fill="#64748b" text-anchor="middle">
      Source: Prepared by Author for System Design &amp; Architectural Verification (2026)
    </text>
  </svg>`;
}

// 7. Chapter 3 Operational Process Flowchart (Figure 3.5)
export function getFlowchartSvg(topic: string): string {
  const safeTopic = (topic || 'Automated System').slice(0, 40);
  return `
  <svg width="800" height="520" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="boxShadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.12"/>
      </filter>
    </defs>

    <rect width="800" height="520" fill="#ffffff" rx="16" />
    <rect x="15" y="15" width="770" height="490" fill="none" stroke="#cbd5e1" stroke-width="1.5" rx="12" />

    <!-- Title -->
    <text x="400" y="42" font-family="'Times New Roman', serif" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle">
      FIGURE 3.5: OPERATIONAL PROCESS &amp; DECISION FLOWCHART
    </text>
    <text x="400" y="60" font-family="Arial, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">
      Sequential Execution Pipeline for: ${safeTopic}
    </text>

    <!-- Step 1: START (Capsule) -->
    <g transform="translate(325, 75)">
      <rect width="150" height="38" rx="19" fill="#059669" filter="url(#boxShadow)" />
      <text x="75" y="24" font-family="Arial, sans-serif" font-size="12" font-weight="black" fill="#ffffff" text-anchor="middle">
        START
      </text>
    </g>

    <!-- Arrow 1 -> 2 -->
    <line x1="400" y1="113" x2="400" y2="135" stroke="#334155" stroke-width="2" />
    <polygon points="396,135 400,143 404,135" fill="#334155" />

    <!-- Step 2: Initialize System & Check Sensors -->
    <g transform="translate(290, 143)">
      <rect width="220" height="45" rx="8" fill="#f8fafc" stroke="#0284c7" stroke-width="1.8" filter="url(#boxShadow)" />
      <text x="110" y="20" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">
        Initialize Hardware &amp; Services
      </text>
      <text x="110" y="35" font-family="Arial, sans-serif" font-size="9" fill="#64748b" text-anchor="middle">
        Establish SQLite WAL Mode Connection
      </text>
    </g>

    <!-- Arrow 2 -> 3 -->
    <line x1="400" y1="188" x2="400" y2="208" stroke="#334155" stroke-width="2" />
    <polygon points="396,208 400,216 404,208" fill="#334155" />

    <!-- Step 3: Input Capture (Parallelogram) -->
    <g transform="translate(270, 216)">
      <polygon points="20,0 260,0 240,45 0,45" fill="#eff6ff" stroke="#2563eb" stroke-width="1.8" filter="url(#boxShadow)" />
      <text x="130" y="20" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#1e40af" text-anchor="middle">
        Read Input / Credentials
      </text>
      <text x="130" y="35" font-family="Arial, sans-serif" font-size="9" fill="#3b82f6" text-anchor="middle">
        PIN, RFID Badge, Biometric, or Token
      </text>
    </g>

    <!-- Arrow 3 -> 4 -->
    <line x1="400" y1="261" x2="400" y2="283" stroke="#334155" stroke-width="2" />
    <polygon points="396,283 400,291 404,283" fill="#334155" />

    <!-- Step 4: Decision Diamond -->
    <g transform="translate(400, 335)">
      <polygon points="0,-44 110,0 0,44 -110,0" fill="#fef3c7" stroke="#d97706" stroke-width="2" filter="url(#boxShadow)" />
      <text x="0" y="-8" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#92400e" text-anchor="middle">
        Credentials Valid
      </text>
      <text x="0" y="8" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#92400e" text-anchor="middle">
        &amp; Authorized?
      </text>
    </g>

    <!-- Decision NO (Branch Left) -->
    <line x1="290" y1="335" x2="160" y2="335" stroke="#ef4444" stroke-width="2" />
    <polygon points="160,331 152,335 160,339" fill="#ef4444" />
    <text x="215" y="325" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#dc2626" text-anchor="middle">
      [NO / ACCESS DENIED]
    </text>

    <!-- Denied Handler -->
    <g transform="translate(40, 312)">
      <rect width="112" height="48" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="1.8" filter="url(#boxShadow)" />
      <text x="56" y="20" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#991b1b" text-anchor="middle">
        Log Security Alert
      </text>
      <text x="56" y="35" font-family="Arial, sans-serif" font-size="8" fill="#b91c1c" text-anchor="middle">
        Trigger Buzzer / Lock
      </text>
    </g>

    <!-- Denied loops back to Standby -->
    <path d="M 96 312 L 96 238 L 260 238" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3 3" />
    <polygon points="260,234 268,238 260,242" fill="#ef4444" />
    <text x="175" y="230" font-family="Arial, sans-serif" font-size="8" fill="#dc2626" text-anchor="middle">
      Return to Idle
    </text>

    <!-- Decision YES (Branch Down) -->
    <line x1="400" y1="379" x2="400" y2="405" stroke="#059669" stroke-width="2" />
    <polygon points="396,405 400,413 404,405" fill="#059669" />
    <text x="430" y="398" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#059669" text-anchor="start">
      [YES / GRANTED]
    </text>

    <!-- Step 5: Execute Actuation & Record in DB -->
    <g transform="translate(270, 413)">
      <rect width="260" height="44" rx="8" fill="#ecfdf5" stroke="#059669" stroke-width="1.8" filter="url(#boxShadow)" />
      <text x="130" y="18" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#065f46" text-anchor="middle">
        Trigger Actuator &amp; Commit ACID Audit
      </text>
      <text x="130" y="33" font-family="Arial, sans-serif" font-size="8" fill="#047857" text-anchor="middle">
        Disengage Solenoid Lock (5s) + Insert Audit Row
      </text>
    </g>

    <!-- Arrow 5 -> END -->
    <line x1="530" y1="435" x2="630" y2="435" stroke="#334155" stroke-width="2" />
    <polygon points="630,431 638,435 630,439" fill="#334155" />

    <!-- Step 6: END (Capsule) -->
    <g transform="translate(638, 416)">
      <rect width="110" height="38" rx="19" fill="#1e293b" filter="url(#boxShadow)" />
      <text x="55" y="24" font-family="Arial, sans-serif" font-size="11" font-weight="black" fill="#ffffff" text-anchor="middle">
        STANDBY
      </text>
    </g>

    <text x="400" y="495" font-family="'Times New Roman', serif" font-size="10" font-style="italic" fill="#64748b" text-anchor="middle">
      Source: Prepared by Candidate Researcher for Formal Algorithmic Verification (2026)
    </text>
  </svg>`;
}

// 8. Chapter 4 Software UI Screenshot: Administrator Audit Log & Telemetry (Figure 4.3)
export function getAdminAuditScreenshotSvg(topic: string): string {
  const safeTopic = (topic || 'Automated Software System').slice(0, 42);
  return `
  <svg width="800" height="480" xmlns="http://www.w3.org/2000/svg">
    <!-- Window Frame -->
    <rect width="800" height="480" rx="14" fill="#0f172a" />
    
    <!-- Title Bar -->
    <rect width="800" height="40" rx="14" fill="#1e293b" />
    <rect y="26" width="800" height="14" fill="#1e293b" />
    <circle cx="22" cy="20" r="5.5" fill="#ef4444" />
    <circle cx="38" cy="20" r="5.5" fill="#f59e0b" />
    <circle cx="54" cy="20" r="5.5" fill="#10b981" />
    
    <!-- Address Bar -->
    <rect x="180" y="8" width="440" height="24" rx="6" fill="#0f172a" />
    <text x="400" y="24" font-family="monospace" font-size="10" fill="#38bdf8" text-anchor="middle">
      🔒 http://localhost:8000/admin/audit-logs
    </text>

    <!-- Main Viewport -->
    <rect x="0" y="40" width="800" height="440" fill="#f8fafc" />

    <!-- Top Sub-Header -->
    <g transform="translate(25, 55)">
      <rect width="750" height="52" rx="10" fill="#ffffff" stroke="#e2e8f0" />
      <text x="20" y="24" font-family="Arial, sans-serif" font-size="13" font-weight="black" fill="#0f172a">
        ${safeTopic} — Security &amp; Event Audit Trail
      </text>
      <text x="20" y="41" font-family="Arial, sans-serif" font-size="9" fill="#64748b">
        Cryptographic Proof of Access • Immutable SQLite Log • 24/7 Monitoring
      </text>

      <rect x="580" y="11" width="150" height="30" rx="6" fill="#059669" />
      <text x="655" y="30" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">
        Export Audit (.CSV)
      </text>
    </g>

    <!-- Security KPI Tiles -->
    <g transform="translate(25, 118)">
      <rect x="0" y="0" width="235" height="55" rx="8" fill="#ffffff" stroke="#e2e8f0" />
      <text x="15" y="22" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#64748b">LOGGED EVENTS (24H)</text>
      <text x="15" y="44" font-family="Arial, sans-serif" font-size="18" font-weight="black" fill="#0f172a">1,489 Entries</text>

      <rect x="257" y="0" width="235" height="55" rx="8" fill="#ffffff" stroke="#e2e8f0" />
      <text x="272" y="22" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#64748b">UNAUTHORIZED ATTEMPTS</text>
      <text x="272" y="44" font-family="Arial, sans-serif" font-size="18" font-weight="black" fill="#dc2626">2 Denied (0 Breach)</text>

      <rect x="515" y="0" width="235" height="55" rx="8" fill="#ffffff" stroke="#e2e8f0" />
      <text x="530" y="22" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#64748b">SYSTEM INTEGRITY</text>
      <text x="530" y="44" font-family="Arial, sans-serif" font-size="18" font-weight="black" fill="#059669">100% OPERATIONAL</text>
    </g>

    <!-- Audit Log Table -->
    <g transform="translate(25, 185)">
      <rect width="750" height="280" rx="10" fill="#ffffff" stroke="#e2e8f0" />
      
      <!-- Header Row -->
      <rect width="750" height="34" rx="10" fill="#f1f5f9" />
      <text x="15" y="22" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#475569">TIMESTAMP</text>
      <text x="150" y="22" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#475569">ACTOR / OPERATOR</text>
      <text x="310" y="22" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#475569">EVENT CLASSIFICATION</text>
      <text x="490" y="22" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#475569">STATION / PORT</text>
      <text x="630" y="22" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#475569">SECURITY VERDICT</text>

      <!-- Row 1 -->
      <line x1="0" y1="75" x2="750" y2="75" stroke="#f1f5f9" />
      <text x="15" y="58" font-family="monospace" font-size="10" fill="#0f172a">2026-11-22 10:14:02</text>
      <text x="150" y="58" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0f172a">Officer K. Adamu (#0812)</text>
      <text x="310" y="58" font-family="Arial, sans-serif" font-size="10" fill="#334155">Secure Biometric Entry</text>
      <text x="490" y="58" font-family="monospace" font-size="10" fill="#64748b">Door_Relay_01</text>
      <rect x="625" y="44" width="75" height="18" rx="4" fill="#dcfce7" />
      <text x="662" y="57" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#166534" text-anchor="middle">GRANTED</text>

      <!-- Row 2 -->
      <line x1="0" y1="120" x2="750" y2="120" stroke="#f1f5f9" />
      <text x="15" y="103" font-family="monospace" font-size="10" fill="#0f172a">2026-11-22 10:18:45</text>
      <text x="150" y="103" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0f172a">Supervisory Terminal</text>
      <text x="310" y="103" font-family="Arial, sans-serif" font-size="10" fill="#334155">Door Override Lockout</text>
      <text x="490" y="103" font-family="monospace" font-size="10" fill="#64748b">Armory_Lock_03</text>
      <rect x="625" y="89" width="75" height="18" rx="4" fill="#dcfce7" />
      <text x="662" y="102" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#166534" text-anchor="middle">SUCCESS</text>

      <!-- Row 3 -->
      <line x1="0" y1="165" x2="750" y2="165" stroke="#f1f5f9" />
      <text x="15" y="148" font-family="monospace" font-size="10" fill="#dc2626">2026-11-22 10:22:19</text>
      <text x="150" y="148" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#dc2626">Unknown Card (UID: 7F2A)</text>
      <text x="310" y="148" font-family="Arial, sans-serif" font-size="10" fill="#dc2626">Unregistered Access Attempt</text>
      <text x="490" y="148" font-family="monospace" font-size="10" fill="#64748b">Door_Relay_02</text>
      <rect x="625" y="134" width="75" height="18" rx="4" fill="#fee2e2" />
      <text x="662" y="147" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#991b1b" text-anchor="middle">DENIED</text>

      <!-- Row 4 -->
      <line x1="0" y1="210" x2="750" y2="210" stroke="#f1f5f9" />
      <text x="15" y="193" font-family="monospace" font-size="10" fill="#0f172a">2026-11-22 10:25:30</text>
      <text x="150" y="193" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0f172a">System Daemon</text>
      <text x="310" y="193" font-family="Arial, sans-serif" font-size="10" fill="#334155">Telemetry Health Benchmark</text>
      <text x="490" y="193" font-family="monospace" font-size="10" fill="#64748b">Master_Controller</text>
      <rect x="625" y="179" width="75" height="18" rx="4" fill="#e0f2fe" />
      <text x="662" y="192" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#0369a1" text-anchor="middle">VERIFIED</text>
    </g>
  </svg>`;
}

// 9. Chapter 4 Automated Test Execution Runner & Pass Matrix (Figure 4.4)
export function getTestingResultsSvg(topic: string): string {
  const safeTopic = (topic || 'Automated Software System').slice(0, 42);
  return `
  <svg width="800" height="480" xmlns="http://www.w3.org/2000/svg">
    <!-- Dark Terminal Console Frame -->
    <rect width="800" height="480" rx="14" fill="#090d16" />
    
    <!-- Window Bar -->
    <rect width="800" height="38" rx="14" fill="#131b2e" />
    <rect y="24" width="800" height="14" fill="#131b2e" />
    <circle cx="20" cy="19" r="5" fill="#ef4444" />
    <circle cx="36" cy="19" r="5" fill="#f59e0b" />
    <circle cx="52" cy="19" r="5" fill="#10b981" />
    <text x="400" y="24" font-family="monospace" font-size="11" font-weight="bold" fill="#94a3b8" text-anchor="middle">
      Terminal — Automated Test Bench Execution Runner (PyTest / Unit Verification)
    </text>

    <!-- Terminal Output Body -->
    <g transform="translate(30, 65)">
      <!-- Command Invocation -->
      <text x="0" y="20" font-family="monospace" font-size="11" fill="#38bdf8">
        developer@codethesis-bench:~$ python -m pytest tests/ -v --tb=short
      </text>

      <!-- Suite Header -->
      <text x="0" y="45" font-family="monospace" font-size="10" fill="#64748b">
        ============================= test session starts ==============================
      </text>
      <text x="0" y="65" font-family="monospace" font-size="10" fill="#94a3b8">
        platform linux -- Python 3.11.8, pytest-8.1.1, pluggy-1.4.0 -- /usr/bin/python3
      </text>
      <text x="0" y="85" font-family="monospace" font-size="10" fill="#94a3b8">
        rootdir: /opt/codethesis/prototype/${safeTopic.replace(/\s+/g, '_').toLowerCase()}
      </text>
      <text x="0" y="105" font-family="monospace" font-size="10" fill="#94a3b8">
        collected 8 items
      </text>

      <!-- Test Cases -->
      <text x="0" y="135" font-family="monospace" font-size="11" fill="#e2e8f0">
        tests/test_auth.py::test_pbkdf2_password_hashing
      </text>
      <text x="560" y="135" font-family="monospace" font-size="11" font-weight="bold" fill="#4ade80">PASSED [ 12% ]</text>

      <text x="0" y="160" font-family="monospace" font-size="11" fill="#e2e8f0">
        tests/test_auth.py::test_role_based_access_control_matrix
      </text>
      <text x="560" y="160" font-family="monospace" font-size="11" font-weight="bold" fill="#4ade80">PASSED [ 25% ]</text>

      <text x="0" y="185" font-family="monospace" font-size="11" fill="#e2e8f0">
        tests/test_security.py::test_door_lock_actuator_response_time
      </text>
      <text x="560" y="185" font-family="monospace" font-size="11" font-weight="bold" fill="#4ade80">PASSED [ 37% ]</text>

      <text x="0" y="210" font-family="monospace" font-size="11" fill="#e2e8f0">
        tests/test_security.py::test_tamper_sensor_emergency_trigger
      </text>
      <text x="560" y="210" font-family="monospace" font-size="11" font-weight="bold" fill="#4ade80">PASSED [ 50% ]</text>

      <text x="0" y="235" font-family="monospace" font-size="11" fill="#e2e8f0">
        tests/test_db.py::test_sqlite_wal_acid_transaction_locking
      </text>
      <text x="560" y="235" font-family="monospace" font-size="11" font-weight="bold" fill="#4ade80">PASSED [ 62% ]</text>

      <text x="0" y="260" font-family="monospace" font-size="11" fill="#e2e8f0">
        tests/test_db.py::test_foreign_key_referential_integrity
      </text>
      <text x="560" y="260" font-family="monospace" font-size="11" font-weight="bold" fill="#4ade80">PASSED [ 75% ]</text>

      <text x="0" y="285" font-family="monospace" font-size="11" fill="#e2e8f0">
        tests/test_audit.py::test_immutable_audit_log_persisted
      </text>
      <text x="560" y="285" font-family="monospace" font-size="11" font-weight="bold" fill="#4ade80">PASSED [ 87% ]</text>

      <text x="0" y="310" font-family="monospace" font-size="11" fill="#e2e8f0">
        tests/test_load.py::test_50_concurrent_requests_latency
      </text>
      <text x="560" y="310" font-family="monospace" font-size="11" font-weight="bold" fill="#4ade80">PASSED [ 100% ]</text>

      <!-- Summary Banner Box -->
      <g transform="translate(0, 335)">
        <rect width="740" height="42" rx="6" fill="#14532d" stroke="#22c55e" stroke-width="1.5" />
        <text x="370" y="26" font-family="monospace" font-size="12" font-weight="bold" fill="#f0fdf4" text-anchor="middle">
          ====== 8 passed, 0 failed, 0 warnings in 0.318s (100% PASS RATE) ======
        </text>
      </g>
    </g>
  </svg>`;
}

// Convert SVG strings to high-resolution PNG buffers via Sharp
export async function renderSvgToPngBuffer(svgString: string): Promise<Buffer> {
  return await sharp(Buffer.from(svgString)).png().toBuffer();
}
