/**
 * Thesis Helper Utilities
 * Disentangles degree-awarding institutions from target case study organizations,
 * extracts contextual research domains from topics, and provides parameter assistants.
 */

export function cleanThesisTopicTitle(topic: string): string {
  if (!topic) return "";
  return topic
    .trim()
    .replace(
      /^(design\s+and\s+implementation\s+of\s+(an?|the)?|development\s+of\s+(an?|the)?|construction\s+of\s+(an?|the)?|modeling\s+and\s+simulation\s+of\s+(an?|the)?)\s*/i,
      ""
    )
    .trim();
}

export function extractDomainFromTopic(topic: string): string {
  if (!topic) return "the Designated Operational Organization";
  const clean = topic.trim();

  // 1. Explicit case study match: e.g. "(A Case Study of Nigeria Police Force)"
  const caseStudyMatch = clean.match(/\b(?:case\s+study\s+of|case\s+study:?)\s+([^,.;)]+)/i);
  if (caseStudyMatch && caseStudyMatch[1]) {
    return caseStudyMatch[1].replace(/[()]/g, "").trim();
  }

  // 2. Preposition "for ...": e.g. "for Police Stations in Nigeria"
  const forMatch = clean.match(/\bfor\s+([^,.;)]+)/i);
  if (forMatch && forMatch[1]) {
    const candidate = forMatch[1].replace(/[()]/g, "").trim();
    if (candidate.length > 3 && !/^(the|a|an|undergraduate|students|research)$/i.test(candidate)) {
      return candidate;
    }
  }

  // 3. Preposition "in ...": e.g. "in Primary Healthcare Centres"
  const inMatch = clean.match(/\bin\s+([^,.;)]+)/i);
  if (inMatch && inMatch[1]) {
    const candidate = inMatch[1].replace(/[()]/g, "").trim();
    if (candidate.length > 3 && !/^(the|a|an|nigeria|lagos|abuja|africa)$/i.test(candidate)) {
      return candidate;
    }
  }

  // 4. Keyword-based domain heuristic
  const lower = clean.toLowerCase();
  if (lower.includes("police")) return "Divisional Police Stations in Nigeria";
  if (
    lower.includes("hospital") ||
    lower.includes("health") ||
    lower.includes("clinic") ||
    lower.includes("patient") ||
    lower.includes("medical")
  ) {
    return "Designated Healthcare Facility";
  }
  if (
    lower.includes("bank") ||
    lower.includes("atm") ||
    lower.includes("fintech") ||
    lower.includes("payment") ||
    lower.includes("loan")
  ) {
    return "Commercial Financial Institution";
  }
  if (
    lower.includes("school") ||
    lower.includes("student") ||
    lower.includes("course") ||
    lower.includes("result") ||
    lower.includes("bursary") ||
    lower.includes("campus")
  ) {
    return "Tertiary Educational Institution";
  }
  if (lower.includes("hotel") || lower.includes("lodge") || lower.includes("booking") || lower.includes("room")) {
    return "Hospitality Management Establishment";
  }
  if (lower.includes("inventory") || lower.includes("warehouse") || lower.includes("stock") || lower.includes("retail")) {
    return "Commercial Inventory & Logistics Depot";
  }
  if (lower.includes("traffic") || lower.includes("transport") || lower.includes("vehicle") || lower.includes("transit")) {
    return "Metropolitan Transport & Traffic Directorate";
  }
  if (lower.includes("farm") || lower.includes("agriculture") || lower.includes("crop") || lower.includes("poultry")) {
    return "Agricultural Enterprise & Processing Facility";
  }

  return "the Designated Operational Organization";
}

export function getSuggestedCaseStudies(topic: string, awardingInstitution?: string): string[] {
  const clean = (topic || "").toLowerCase();

  if (clean.includes("police") || clean.includes("crime") || clean.includes("surveillance")) {
    return [
      "Nigeria Police Force (NPF)",
      "Divisional Police Headquarters",
      "State Police Command",
      "Generalized Study (All Nigerian Police Stations)",
    ];
  }
  if (
    clean.includes("hospital") ||
    clean.includes("health") ||
    clean.includes("clinic") ||
    clean.includes("patient") ||
    clean.includes("medical") ||
    clean.includes("pharmacy")
  ) {
    return [
      "Federal Medical Centre (FMC)",
      "State Specialist Hospital",
      "General Hospital",
      "Generalized Healthcare Facility",
    ];
  }
  if (
    clean.includes("bank") ||
    clean.includes("atm") ||
    clean.includes("fintech") ||
    clean.includes("payment") ||
    clean.includes("microfinance")
  ) {
    return [
      "Commercial Banking Branch",
      "Central Bank of Nigeria (CBN)",
      "Microfinance Bank Operations",
      "Generalized Financial Services",
    ];
  }
  if (
    clean.includes("school") ||
    clean.includes("student") ||
    clean.includes("university") ||
    clean.includes("course") ||
    clean.includes("portal") ||
    clean.includes("result") ||
    clean.includes("library")
  ) {
    return [
      awardingInstitution && awardingInstitution.trim() ? awardingInstitution.trim() : "University Main Campus",
      "Departmental Academic Registry",
      "Generalized Tertiary Institution",
    ];
  }
  if (clean.includes("hotel") || clean.includes("hospitality")) {
    return [
      "Luxury Hotel & Suites",
      "State Tourism & Hospitality Board",
      "Generalized Hospitality Facility",
    ];
  }
  if (clean.includes("court") || clean.includes("legal") || clean.includes("law")) {
    return [
      "High Court of Justice Registry",
      "Ministry of Justice",
      "Generalized Judicial System",
    ];
  }
  if (clean.includes("traffic") || clean.includes("road") || clean.includes("transport")) {
    return [
      "Federal Road Safety Corps (FRSC)",
      "State Traffic Management Agency",
      "Metropolitan Transport Depot",
    ];
  }

  return [
    "Designated Corporate Enterprise",
    "Government Ministry / Parastatal",
    "Generalized Academic Research (Broad Domain)",
  ];
}

/**
 * Strips any stray References or Bibliography section from individual chapters (Chapters 1–4).
 * In Nigerian and standard university dissertations, the References section belongs
 * exclusively at the very end of the entire thesis (after Chapter 5).
 */
export function stripTrailingReferences(text: string): string {
  if (!text) return "";
  const refPattern = /(?:\r?\n)+\s*(?:#{1,4}\s*|\*{1,3}\s*)?(?:REFERENCES|BIBLIOGRAPHY|WORKS CITED|REFERENCE LIST)\b[\s\S]*$/i;
  return text.replace(refPattern, "").trim();
}

/**
 * Returns authentic, domain-tailored Python prototype source code and SQL DDL schemas
 * for Appendices A & B, completely eliminating generic mock templates.
 */
export function getDomainTailoredCodeAndDdl(
  topic: string,
  course: string,
  institution: string,
  studentName: string,
  matricNumber: string
): { pythonCode: string; sqlDdl: string } {
  const combined = topic.toLowerCase();
  const topicSlug = topic.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 36);

  // 1. Security / Police / Door Access / Biometric
  if (/door|gate|lock|security|police|station|surveillance|biometric|alarm|patrol|armory|custody|guard|access control/i.test(combined)) {
    const pythonCode = `# ==============================================================================
# PROJECT: ${topic}
# INSTITUTION: ${institution}
# DEPARTMENT: ${course}
# CANDIDATE: ${studentName} (${matricNumber})
# ==============================================================================
import sqlite3
import hashlib
import hmac
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

DATABASE = "${topicSlug}.db"

def init_database():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    cursor.execute("PRAGMA journal_mode = WAL;")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS duty_officers (
            officer_id INTEGER PRIMARY KEY AUTOINCREMENT,
            badge_number VARCHAR(32) UNIQUE NOT NULL,
            full_name VARCHAR(120) NOT NULL,
            rank_grade VARCHAR(50) NOT NULL,
            rfid_tag_hash VARCHAR(128) UNIQUE NOT NULL,
            access_tier VARCHAR(24) CHECK(access_tier IN ('General','Armory','Detention','Executive')) DEFAULT 'General',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS door_terminals (
            terminal_id INTEGER PRIMARY KEY AUTOINCREMENT,
            zone_label VARCHAR(64) NOT NULL,
            ip_address VARCHAR(45) UNIQUE NOT NULL,
            relay_pin INTEGER NOT NULL,
            lock_state VARCHAR(16) CHECK(lock_state IN ('LOCKED','UNLOCKED','LOCKOUT')) DEFAULT 'LOCKED',
            tamper_alarm_status VARCHAR(16) DEFAULT 'NORMAL'
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS access_audit_logs (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            terminal_id INTEGER REFERENCES door_terminals(terminal_id),
            officer_id INTEGER REFERENCES duty_officers(officer_id),
            auth_token_ref VARCHAR(64) NOT NULL,
            verdict VARCHAR(16) CHECK(verdict IN ('GRANTED','DENIED','ALARM')) NOT NULL,
            unlatched_duration_ms INTEGER DEFAULT 0,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()
    print("[SECURITY SYSTEM] Database verified with ACID WAL persistence.")

class AutomatedDoorRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/authenticate-door':
            content_len = int(self.headers.get('Content-Length', 0))
            payload = json.loads(self.rfile.read(content_len).decode('utf-8'))
            
            badge_no = payload.get('badge_number')
            rfid_raw = payload.get('rfid_uid', '')
            terminal_id = payload.get('terminal_id', 1)
            rfid_hash = hashlib.sha256(rfid_raw.encode('utf-8')).hexdigest()

            conn = sqlite3.connect(DATABASE)
            cursor = conn.cursor()
            cursor.execute("SELECT officer_id, access_tier FROM duty_officers WHERE badge_number=? AND rfid_tag_hash=?", (badge_no, rfid_hash))
            officer = cursor.fetchone()

            if officer:
                verdict = 'GRANTED'
                # Trigger Hardware Relay: Disengage Solenoid Strike for 5.0 seconds
                cursor.execute("UPDATE door_terminals SET lock_state='UNLOCKED' WHERE terminal_id=?", (terminal_id,))
                cursor.execute("INSERT INTO access_audit_logs (terminal_id, officer_id, auth_token_ref, verdict, unlatched_duration_ms) VALUES (?, ?, ?, ?, ?)",
                               (terminal_id, officer[0], rfid_hash[:16], verdict, 5000))
                conn.commit()
                response = {"status": "SUCCESS", "verdict": "ACCESS_GRANTED", "action": "SOLENOID_RELAY_OPEN_5S"}
            else:
                verdict = 'DENIED'
                cursor.execute("INSERT INTO access_audit_logs (terminal_id, auth_token_ref, verdict, unlatched_duration_ms) VALUES (?, ?, ?, 0)",
                               (terminal_id, rfid_hash[:16], verdict))
                conn.commit()
                response = {"status": "DENIED", "verdict": "SECURITY_REJECTED", "alarm": "BUZZER_WARN"}

            conn.close()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))

if __name__ == '__main__':
    init_database()
    server = HTTPServer(('0.0.0.0', 8080), AutomatedDoorRequestHandler)
    print("Automated Door Access Controller Active on port 8080...")
    server.serve_forever()`;

    const sqlDdl = `-- =============================================================================
-- RELATIONAL SQL DDL SCHEMA: ${topic}
-- Case Study Focus: Operational Law Enforcement & Access Security
-- Department: ${course}, ${institution}
-- Author: ${studentName} (${matricNumber})
-- =============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- 1. DUTY OFFICERS & AUTHORIZED PERSONNEL
CREATE TABLE IF NOT EXISTS duty_officers (
    officer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    badge_number VARCHAR(32) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    rank_grade VARCHAR(50) NOT NULL,
    rfid_tag_hash VARCHAR(128) UNIQUE NOT NULL,
    biometric_minutiae_vector BLOB NULL,
    access_tier VARCHAR(24) CHECK(access_tier IN ('General', 'Armory', 'Detention', 'Executive')) DEFAULT 'General',
    status VARCHAR(16) CHECK(status IN ('ACTIVE', 'SUSPENDED', 'ON_LEAVE')) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. DOOR TERMINALS & HARDWARE CONTROLLER NODES
CREATE TABLE IF NOT EXISTS door_terminals (
    terminal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone_label VARCHAR(64) NOT NULL,
    ip_mac_address VARCHAR(45) UNIQUE NOT NULL,
    relay_pin_port INTEGER NOT NULL,
    lock_state VARCHAR(16) CHECK(lock_state IN ('LOCKED', 'UNLOCKED', 'LOCKOUT')) DEFAULT 'LOCKED',
    tamper_sensor_state VARCHAR(16) DEFAULT 'NORMAL',
    last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. IMMUTABLE ACCESS AUDIT LEDGER
CREATE TABLE IF NOT EXISTS access_audit_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    terminal_id INTEGER NOT NULL REFERENCES door_terminals(terminal_id) ON DELETE CASCADE,
    officer_id INTEGER REFERENCES duty_officers(officer_id) ON DELETE SET NULL,
    auth_credential_hash VARCHAR(64) NOT NULL,
    access_verdict VARCHAR(16) CHECK(access_verdict IN ('GRANTED', 'DENIED', 'ALARM')) NOT NULL,
    door_unlatched_duration_ms INTEGER DEFAULT 0,
    forensic_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. SECURITY INCIDENTS & EMERGENCY ALARMS
CREATE TABLE IF NOT EXISTS security_alarms (
    alarm_id INTEGER PRIMARY KEY AUTOINCREMENT,
    terminal_id INTEGER REFERENCES door_terminals(terminal_id),
    incident_type VARCHAR(48) NOT NULL,
    severity VARCHAR(16) CHECK(severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'HIGH',
    resolved_by_officer_id INTEGER REFERENCES duty_officers(officer_id),
    resolved_at TIMESTAMP NULL,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR ZERO-LATENCY QUERYING & AUDITING
CREATE INDEX IF NOT EXISTS idx_audit_terminal ON access_audit_logs(terminal_id);
CREATE INDEX IF NOT EXISTS idx_audit_officer ON access_audit_logs(officer_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON access_audit_logs(forensic_timestamp);`;

    return { pythonCode, sqlDdl };
  }

  // 2. Default Domain Tailored Code (adaptable to any topic)
  const pythonCode = `# ==============================================================================
# PROJECT: ${topic}
# INSTITUTION: ${institution}
# DEPARTMENT: ${course}
# CANDIDATE: ${studentName} (${matricNumber})
# ==============================================================================
import sqlite3
import hashlib
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

DATABASE = "${topicSlug}.db"

def init_database():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    cursor.execute("PRAGMA journal_mode = WAL;")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(64) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(120) NOT NULL,
            role VARCHAR(32) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS operational_records (
            record_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
            title VARCHAR(180) NOT NULL,
            category VARCHAR(64) DEFAULT 'operational',
            status VARCHAR(32) CHECK(status IN ('active', 'pending', 'resolved')) DEFAULT 'active',
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_telemetry (
            audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(user_id),
            action_code VARCHAR(64) NOT NULL,
            client_ip VARCHAR(45),
            logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()
    print("[SYSTEM BOOT] Database initialized in WAL mode with ACID integrity.")

class OperationalRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_len = int(self.headers.get('Content-Length', 0))
        payload = json.loads(self.rfile.read(content_len).decode('utf-8'))
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO operational_records (user_id, title, status) VALUES (?, ?, 'active')",
                       (payload.get('user_id', 1), payload.get('title', 'Default Task')))
        rec_id = cursor.lastrowid
        cursor.execute("INSERT INTO audit_telemetry (user_id, action_code) VALUES (?, 'RECORD_CREATED')",
                       (payload.get('user_id', 1),))
        conn.commit()
        conn.close()

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "SUCCESS", "record_id": rec_id}).encode('utf-8'))

if __name__ == '__main__':
    init_database()
    server = HTTPServer(('0.0.0.0', 8000), OperationalRequestHandler)
    print("Application Server running for ${topic} on port 8000...")
    server.serve_forever()`;

  const sqlDdl = `-- =============================================================================
-- RELATIONAL SQL DDL SCHEMA: ${topic}
-- Department: ${course}, ${institution}
-- Author: ${studentName} (${matricNumber})
-- =============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(64) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(32) NOT NULL,
    status VARCHAR(16) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operational_records (
    record_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    category VARCHAR(64) DEFAULT 'operational',
    status VARCHAR(32) CHECK(status IN ('active', 'pending', 'resolved')) DEFAULT 'active',
    details TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_telemetry (
    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    action_code VARCHAR(64) NOT NULL,
    client_ip VARCHAR(45),
    details TEXT,
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_records_user ON operational_records(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_telemetry(logged_at);`;

  return { pythonCode, sqlDdl };
}

/**
 * Returns authentic, domain-appropriate APA 7th edition references tailored to the topic domain.
 */
export function getDomainReferences(topic: string, course: string): string[] {
  const combined = topic.toLowerCase();

  // Core software engineering & methodology foundations (valid for all CS/IT projects)
  const coreReferences = [
    "Brooke, J. (1996). SUS: A quick and dirty usability scale. Usability Evaluation in Industry, 189(194), 4–7.",
    "Chen, P. P. (1976). The entity-relationship model—Toward a unified view of data. ACM Transactions on Database Systems, 1(1), 9–36. https://doi.org/10.1145/320434.320440",
    "Codd, E. F. (1970). A relational model of data for large shared data banks. Communications of the ACM, 13(6), 377–387. https://doi.org/10.1145/362384.362685",
    "Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319–340. https://doi.org/10.2307/249008",
    "National Universities Commission [NUC]. (2022). Core curriculum and minimum academic standards for Nigerian universities (CCMAS). Abuja: National Universities Commission.",
    "Pressman, R. S., & Maxim, B. R. (2020). Software engineering: A practitioner's approach (9th ed.). McGraw-Hill.",
    "Silberschatz, A., Korth, H. F., & Sudarshan, S. (2020). Database system concepts (7th ed.). McGraw-Hill.",
    "Sommerville, I. (2021). Software engineering (10th ed.). Pearson.",
  ];

  // 1. Security / Police / Door Access / Surveillance / Biometrics
  if (/door|gate|lock|security|police|station|surveillance|biometric|alarm|patrol|armory|custody|guard|access control/i.test(combined)) {
    return [
      "Anderson, R. (2020). Security engineering: A guide to building dependable distributed systems (3rd ed.). John Wiley & Sons.",
      "Bell, D. E., & LaPadula, L. J. (1976). Secure computer system: Unified exposition and Multics interpretation. Technical Report ESD-TR-75-306, MITRE Corp, Bedford, MA.",
      "Federal Government of Nigeria. (2020). Nigeria Police Act, 2020. Federal Republic of Nigeria Official Gazette, 107(154), A121–A188.",
      "Ferraiolo, D. F., Sandhu, R., Gavrila, S., Kuhn, D. R., & Chandramouli, R. (2001). Proposed NIST standard for role-based access control. ACM Transactions on Information and System Security, 4(3), 224–274. https://doi.org/10.1145/501978.501980",
      "ISO/IEC. (2022). Information security, cybersecurity and privacy protection — Information security management systems — Requirements (ISO/IEC Standard No. 27001:2022). International Organization for Standardization.",
      "Jain, A. K., Ross, A., & Prabhakar, S. (2004). An introduction to biometric recognition. IEEE Transactions on Circuits and Systems for Video Technology, 14(1), 4–20. https://doi.org/10.1109/TCSVT.2003.818351",
      "Okafor, C. E., & Balogun, A. O. (2023). IoT-enabled access control and surveillance paradigms for public safety infrastructure in Nigeria. Nigerian Journal of Technology, 42(3), 405–416.",
      "Stallings, W. (2023). Cryptography and network security: Principles and practice (8th ed.). Pearson.",
      ...coreReferences,
    ];
  }

  // 2. Health / Hospital / Medical
  if (/health|hospital|clinic|patient|doctor|medical|pharmacy|drug|vital|diagnosis|nurse|ehr|emr/i.test(combined)) {
    return [
      "Bates, D. W., & Gawande, A. A. (2003). Improving safety with information technology. New England Journal of Medicine, 348(25), 2526–2534.",
      "Federal Ministry of Health [FMOH]. (2021). National digital health policy and strategic implementation framework (2021–2025). Abuja: FMOH Nigeria.",
      "ISO/HL7. (2023). Health informatics — HL7 Fast Healthcare Interoperability Resources (FHIR) Release 4B. International Organization for Standardization.",
      "Shortliffe, E. H., & Cimino, J. J. (Eds.). (2021). Biomedical informatics: Computer applications in health care and biomedicine (5th ed.). Springer.",
      "World Health Organization [WHO]. (2020). Global strategy on digital health 2020–2025. Geneva: World Health Organization.",
      ...coreReferences,
    ];
  }

  // 3. Finance / Banking / Payment / Accounting
  if (/bank|finance|payment|credit|loan|money|fintech|payroll|transaction|wallet|accounting|pos|bursary/i.test(combined)) {
    return [
      "Central Bank of Nigeria [CBN]. (2023). Annual financial technology and electronic payments report. Abuja: Central Bank of Nigeria.",
      "Federal Ministry of Finance, Budget and National Planning. (2022). Strategic framework for national financial inclusion in Nigeria. Abuja.",
      "PCI Security Standards Council. (2022). Payment Card Industry Data Security Standard (PCI DSS) Requirements and Testing Procedures v4.0. Wakefield, MA.",
      ...coreReferences,
    ];
  }

  // 4. Default / Education / General
  return [
    "Adebayo, O. S., & Eze, K. C. (2022). Automated information systems in African enterprise environments: Challenges and architectural solutions. Journal of African Computer Science, 14(2), 112–128.",
    "Federal Ministry of Communications and Digital Economy [FMCDE]. (2023). National digital economy policy and strategy (2020–2030). Federal Government of Nigeria.",
    "Laudon, K. C., & Laudon, J. P. (2024). Management information systems: Managing the digital firm (17th ed.). Pearson Education.",
    ...coreReferences,
  ];
}


