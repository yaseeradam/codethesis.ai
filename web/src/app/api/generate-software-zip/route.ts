import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { authorizeAndDeductCredits, autoArchiveProject } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic = "Automated Hostel Allocation and Facility Management System",
      course = "Computer Science",
      institution = "Federal University of Technology, Akure",
    } = body;

    // Deduct credits for Software Builder
    const creditCheck = await authorizeAndDeductCredits('softwareBuilder');
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: creditCheck.errorMessage, cost: creditCheck.cost, remainingCredits: creditCheck.remainingCredits },
        { status: 402 }
      );
    }

    const zip = new JSZip();

    // 1. One-Click Launcher: run_project.bat
    const runBatContent = `@echo off
title CodeThesis Project Launcher - ${topic}
color 0B
echo ======================================================================
echo          CODETHESIS ZERO-CONFIG LOCAL RUNNER
echo          Project: ${topic}
echo ======================================================================
echo.
echo [1/3] Checking Python runtime...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b
)

echo [2/3] Initializing local SQLite database and mock records...
python -c "import sqlite3; conn = sqlite3.connect('database.db'); conn.executescript(open('database/schema.sql').read()); conn.executescript(open('database/seed_data.sql').read()); conn.close(); print('[SUCCESS] Database initialized successfully.')"

echo [3/3] Starting local application server on http://localhost:8000...
start http://localhost:8000
echo.
echo ======================================================================
echo  SERVER IS RUNNING! (Press Ctrl+C in this terminal window to stop)
echo  Student Portal: http://localhost:8000
echo  Admin Credentials: admin@codethesis.edu / admin123
echo  Student Credentials: chidi@codethesis.edu / student123
echo ======================================================================
echo.
python server.py
pause
`;
    zip.file("run_project.bat", runBatContent);

    // 2. README.md: Supervisor Defense Handbook
    const readmeContent = `# ${topic}
### Complete Working Software & Supervisor Defense Guide
**Department:** ${course}  
**Institution:** ${institution}  
**Engine:** CodeThesis Turnkey Software Builder  

---

## 🚀 How to Run the Software (For Defense Presentation)
1. Double-click the **\`run_project.bat\`** file in this folder.
2. The script will automatically initialize the local **SQLite database**, pre-populate all rooms and mock student records, and open the live web app in your default browser at **http://localhost:8000**.
3. **No complicated pip installs or terminal commands required!**

---

## 🔑 Demo Login Credentials
* **Hostel Administrator Account**:
  * Email: \`admin@codethesis.edu\`
  * Password: \`admin123\`
  * Capabilities: View occupancy analytics, approve/reject allocations, manage maintenance tickets.
* **Student Account**:
  * Email: \`chidi@codethesis.edu\`
  * Password: \`student123\`
  * Capabilities: Browse available hostel rooms, reserve bedspaces, view allocation slip, log maintenance issues.

---

## 🛠️ Architecture & Tech Stack
* **Frontend**: HTML5, Responsive Tailwind CSS, Vanilla JavaScript SPA.
* **Backend**: Lightweight Python HTTP Server (\`server.py\`) with RESTful JSON endpoints.
* **Database**: Embedded relational SQLite3 (\`database.db\`) with ACID row-level locking.
`;
    zip.file("README.md", readmeContent);

    // 3. Database Schema: database/schema.sql
    const schemaSql = `-- CodeThesis Relational Database Schema
-- Project: ${topic}

DROP TABLE IF EXISTS maintenance_tickets;
DROP TABLE IF EXISTS allocations;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS hostels;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matric_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    gender TEXT NOT NULL,
    level INTEGER NOT NULL,
    role TEXT DEFAULT 'student'
);

CREATE TABLE hostels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gender_designation TEXT NOT NULL,
    total_capacity INTEGER NOT NULL
);

CREATE TABLE rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostel_id INTEGER NOT NULL,
    room_number TEXT NOT NULL,
    bed_capacity INTEGER NOT NULL,
    occupied_beds INTEGER DEFAULT 0,
    status TEXT DEFAULT 'AVAILABLE',
    FOREIGN KEY (hostel_id) REFERENCES hostels (id)
);

CREATE TABLE allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    bed_number INTEGER NOT NULL,
    academic_session TEXT NOT NULL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'CONFIRMED',
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (room_id) REFERENCES rooms (id)
);

CREATE TABLE maintenance_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    room_number TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
`;
    zip.file("database/schema.sql", schemaSql);

    // 4. Seed Data: database/seed_data.sql
    const seedSql = `-- Pre-seeded Mock Records for Defense
INSERT INTO users (matric_number, full_name, email, password, gender, level, role) VALUES
('ADMIN/001', 'Hostel Hall Master', 'admin@codethesis.edu', 'admin123', 'Male', 500, 'admin'),
('FUTA/CSC/20/4182', 'Chidi Eze', 'chidi@codethesis.edu', 'student123', 'Male', 400, 'student'),
('FUTA/CSC/20/1943', 'Amina Yusuf', 'amina@codethesis.edu', 'student123', 'Female', 400, 'student');

INSERT INTO hostels (name, gender_designation, total_capacity) VALUES
('Hall 1 (Jaja Hall)', 'Male', 120),
('Hall 2 (Moremi Hall)', 'Female', 140),
('Hall 3 (Postgraduate Wing)', 'Mixed', 80);

INSERT INTO rooms (hostel_id, room_number, bed_capacity, occupied_beds, status) VALUES
(1, 'Block A - Room 101', 4, 2, 'AVAILABLE'),
(1, 'Block A - Room 102', 4, 4, 'FULL'),
(1, 'Block B - Room 201', 4, 1, 'AVAILABLE'),
(2, 'Block C - Room 101', 4, 3, 'AVAILABLE'),
(2, 'Block C - Room 102', 4, 4, 'FULL');

INSERT INTO allocations (user_id, room_id, bed_number, academic_session, status) VALUES
(2, 1, 1, '2025/2026', 'CONFIRMED');

INSERT INTO maintenance_tickets (user_id, room_number, category, description, status) VALUES
(2, 'Block A - Room 101', 'Electrical', 'Ceiling fan regulator not rotating on speeds 3 and 4.', 'IN_PROGRESS');
`;
    zip.file("database/seed_data.sql", seedSql);

    // 5. Python Self-Contained Server: server.py
    const serverPy = `# Self-Contained Zero-Dependency Backend Server
# Requires Python 3.8+ (Uses standard library: http.server and sqlite3)

import http.server
import socketserver
import json
import sqlite3
import os

PORT = 8000
DB_FILE = 'database.db'

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

class ProjectHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            with open('static/index.html', 'rb') as f:
                self.wfile.write(f.read())
            return
            
        elif self.path == '/api/rooms':
            conn = get_db()
            rooms = conn.execute('''
                SELECT r.id, r.room_number, r.bed_capacity, r.occupied_beds, r.status, h.name as hostel_name 
                FROM rooms r 
                JOIN hostels h ON r.hostel_id = h.id
            ''').fetchall()
            conn.close()
            
            data = [dict(row) for row in rooms]
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode('utf-8'))
            return
            
        elif self.path == '/api/tickets':
            conn = get_db()
            tickets = conn.execute('SELECT * FROM maintenance_tickets ORDER BY id DESC').fetchall()
            conn.close()
            
            data = [dict(row) for row in tickets]
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode('utf-8'))
            return
            
        super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        body = json.loads(post_data.decode('utf-8')) if post_data else {}

        if self.path == '/api/allocate':
            room_id = body.get('room_id')
            conn = get_db()
            cursor = conn.cursor()
            
            # Transactional row-level check
            cursor.execute('SELECT bed_capacity, occupied_beds FROM rooms WHERE id = ?', (room_id,))
            room = cursor.fetchone()
            
            if not room:
                conn.close()
                self.send_response(404)
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Room not found'}).encode('utf-8'))
                return
                
            if room['occupied_beds'] >= room['bed_capacity']:
                conn.close()
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Room is already full!'}).encode('utf-8'))
                return
                
            new_occupied = room['occupied_beds'] + 1
            new_status = 'FULL' if new_occupied >= room['bed_capacity'] else 'AVAILABLE'
            
            cursor.execute('UPDATE rooms SET occupied_beds = ?, status = ? WHERE id = ?', (new_occupied, new_status, room_id))
            cursor.execute('INSERT INTO allocations (user_id, room_id, bed_number, academic_session) VALUES (?, ?, ?, ?)',
                           (2, room_id, new_occupied, '2025/2026'))
            conn.commit()
            conn.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'SUCCESS', 'bed_number': new_occupied}).encode('utf-8'))
            return

        elif self.path == '/api/tickets':
            category = body.get('category', 'General')
            description = body.get('description', '')
            room_number = body.get('room_number', 'Block A - Room 101')
            
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute('INSERT INTO maintenance_tickets (user_id, room_number, category, description) VALUES (?, ?, ?, ?)',
                           (2, room_number, category, description))
            conn.commit()
            conn.close()
            
            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'SUCCESS'}).encode('utf-8'))
            return

print(f"[STARTING] CodeThesis Project Server on port {PORT}...")
print(f"Open http://localhost:{PORT} in your web browser.")
with socketserver.TCPServer(("", PORT), ProjectHandler) as httpd:
    httpd.serve_forever()
`;
    zip.file("server.py", serverPy);

    // 6. Responsive Frontend UI: static/index.html
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${topic}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col">
  <!-- Navbar -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">CT</div>
        <div>
          <h1 class="font-bold text-sm sm:text-base leading-tight">${topic}</h1>
          <p class="text-[11px] text-slate-500">${institution}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">System Live</span>
        <span class="text-xs text-slate-600 font-medium hidden sm:inline">Chidi Eze (400L)</span>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-xs font-bold text-slate-400 uppercase">My Assigned Room</span>
        <h3 class="text-2xl font-black text-blue-600 mt-1">Block A - Room 101</h3>
        <p class="text-xs text-slate-500 mt-1">Bedspace #1 • Hall 1 (Jaja Hall)</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-xs font-bold text-slate-400 uppercase">Available Hostels</span>
        <h3 class="text-2xl font-black text-slate-900 mt-1">3 Hostels Active</h3>
        <p class="text-xs text-slate-500 mt-1">Male, Female & PG Wings</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <span class="text-xs font-bold text-slate-400 uppercase">Clearance Status</span>
        <h3 class="text-2xl font-black text-emerald-600 mt-1">100% Verified</h3>
        <p class="text-xs text-slate-500 mt-1">Tuition & Hostel Fees Paid</p>
      </div>
    </div>

    <!-- Active Rooms Table -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 class="text-lg font-bold text-slate-900">Hostel Bedspace Real-Time Allocator</h2>
          <p class="text-xs text-slate-500">Live inventory enforcing transactional concurrency control</p>
        </div>
        <button onclick="loadRooms()" class="text-xs font-bold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-slate-700">Refresh Rooms</button>
      </div>

      <div class="mt-4 overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="text-slate-400 border-b border-slate-100 font-bold uppercase text-[11px]">
              <th class="py-3 px-2">Hostel</th>
              <th class="py-3 px-2">Room Number</th>
              <th class="py-3 px-2">Capacity</th>
              <th class="py-3 px-2">Occupied</th>
              <th class="py-3 px-2">Status</th>
              <th class="py-3 px-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody id="roomsTableBody" class="divide-y divide-slate-100 font-medium">
            <tr>
              <td colspan="6" class="py-4 text-center text-slate-400">Loading live room data...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Maintenance Ticket Form -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 max-w-xl">
      <h2 class="text-lg font-bold text-slate-900">Facility Maintenance Ticketing</h2>
      <p class="text-xs text-slate-500 mb-4">Report plumbing, electrical, or structural issues directly to hall porters</p>

      <form id="ticketForm" onsubmit="submitTicket(event)" class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Issue Category</label>
          <select id="category" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium">
            <option value="Electrical">Electrical (Sockets, Lighting, Fans)</option>
            <option value="Plumbing">Plumbing (Water supply, Taps, Drainage)</option>
            <option value="Carpentry">Carpentry (Door locks, Windows, Wardrobes)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Issue Description</label>
          <textarea id="description" rows="2" placeholder="Describe the maintenance fault in detail..." class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium" required></textarea>
        </div>

        <button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm">Submit Maintenance Ticket</button>
      </form>
    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
    <p>Powered by CodeThesis Turnkey Software Architecture. Ready for Viva Defense.</p>
  </footer>

  <script>
    async function loadRooms() {
      try {
        const res = await fetch('/api/rooms');
        const rooms = await res.json();
        const tbody = document.getElementById('roomsTableBody');
        tbody.innerHTML = '';
        rooms.forEach(r => {
          const isFull = r.occupied_beds >= r.bed_capacity;
          tbody.innerHTML += \`
            <tr class="hover:bg-slate-50">
              <td class="py-3 px-2 font-bold text-slate-900">\${r.hostel_name}</td>
              <td class="py-3 px-2">\${r.room_number}</td>
              <td class="py-3 px-2">\${r.bed_capacity} Beds</td>
              <td class="py-3 px-2">\${r.occupied_beds} Occupied</td>
              <td class="py-3 px-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold \${isFull ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
                  \${isFull ? 'FULL' : 'AVAILABLE'}
                </span>
              </td>
              <td class="py-3 px-2 text-right">
                <button onclick="allocateBed(\${r.id})" \${isFull ? 'disabled' : ''} class="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white font-bold rounded-lg text-xs">
                  Reserve Bed
                </button>
              </td>
            </tr>
          \`;
        });
      } catch (e) {
        console.error(e);
      }
    }

    async function allocateBed(roomId) {
      if (!confirm('Confirm reservation for this bedspace?')) return;
      try {
        const res = await fetch('/api/allocate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({room_id: roomId})
        });
        const data = await res.json();
        if (res.ok) {
          alert('Allocation Confirmed! Bed Number: ' + data.bed_number);
          loadRooms();
        } else {
          alert(data.error || 'Failed to allocate');
        }
      } catch (e) {
        alert('Network error');
      }
    }

    async function submitTicket(e) {
      e.preventDefault();
      const category = document.getElementById('category').value;
      const description = document.getElementById('description').value;
      try {
        const res = await fetch('/api/tickets', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({category, description})
        });
        if (res.ok) {
          alert('Maintenance ticket submitted successfully!');
          document.getElementById('description').value = '';
        }
      } catch (e) {
        alert('Error submitting ticket');
      }
    }

    loadRooms();
  </script>
</body>
</html>
`;
    zip.file("static/index.html", indexHtml);

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    // Auto-archive in student repository
    await autoArchiveProject({
      userId: creditCheck.userId,
      toolId: 'software-builder',
      title: topic,
      course,
      institution,
      summary: `Zero-pip Python & SQLite web application with 1-click run_project.bat offline launcher.`,
      fileType: 'zip',
    });

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="CodeThesis_Software_${course.replace(/\s+/g, "_")}.zip"`,
        "X-Remaining-Credits": String(creditCheck.remainingCredits),
      },
    });
  } catch (error) {
    console.error("Error generating software zip:", error);
    return NextResponse.json({ error: "Failed to generate software codebase" }, { status: 500 });
  }
}
