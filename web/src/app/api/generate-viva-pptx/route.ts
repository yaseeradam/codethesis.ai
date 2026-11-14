import { NextRequest, NextResponse } from "next/server";
import pptxgen from "pptxgenjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic = "DESIGN AND IMPLEMENTATION OF AN AUTOMATED HOSTEL ALLOCATION AND FACILITY MANAGEMENT SYSTEM",
      course = "Computer Science",
      institution = "Federal University of Technology, Akure",
      studentName = "CHIDI EZE",
      matricNumber = "FUTA/CSC/20/4182",
      supervisor = "Dr. A. O. Adebayo",
      session = "2025/2026",
    } = body;

    const pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.author = "CodeThesis AI";
    pres.title = topic;

    // Palette: Midnight Navy (#0B132B), Cyan (#0284C7 / #00E5FF), Gold (#D97706)
    const NAVY = "0B132B";
    const CYAN = "0284C7";
    const GOLD = "D97706";
    const LIGHT_BG = "F8FAFC";
    const WHITE = "FFFFFF";
    const DARK_TEXT = "1E293B";

    // Slide 1: Title Slide (Dark Theme with Brand Colors)
    const s1 = pres.addSlide();
    s1.background = { color: NAVY };
    s1.addText(topic.toUpperCase(), {
      x: 0.8,
      y: 1.5,
      w: 8.4,
      h: 1.8,
      fontSize: 22,
      bold: true,
      color: WHITE,
      fontFace: "Arial",
      align: "center",
    });
    s1.addText(`BY: ${studentName.toUpperCase()} (${matricNumber})`, {
      x: 0.8,
      y: 3.5,
      w: 8.4,
      h: 0.5,
      fontSize: 16,
      bold: true,
      color: "38BDF8", // Cyan
      fontFace: "Arial",
      align: "center",
    });
    s1.addText(`DEPARTMENT OF ${course.toUpperCase()}\n${institution.toUpperCase()}`, {
      x: 0.8,
      y: 4.2,
      w: 8.4,
      h: 0.8,
      fontSize: 14,
      color: "E2E8F0",
      fontFace: "Arial",
      align: "center",
    });
    s1.addText(`SUPERVISOR: ${supervisor.toUpperCase()} • ACADEMIC SESSION: ${session}`, {
      x: 0.8,
      y: 5.4,
      w: 8.4,
      h: 0.4,
      fontSize: 12,
      color: "F59E0B", // Gold
      fontFace: "Arial",
      align: "center",
    });

    // Helper function for content slides
    const createSlide = (title: string, category: string) => {
      const s = pres.addSlide();
      s.background = { color: LIGHT_BG };
      s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: NAVY } });
      s.addText(category.toUpperCase(), { x: 0.8, y: 0.15, fontSize: 10, color: "38BDF8", bold: true, fontFace: "Arial" });
      s.addText(title, { x: 0.8, y: 0.35, fontSize: 18, color: WHITE, bold: true, fontFace: "Arial" });
      s.addShape(pres.ShapeType.rect, { x: 0, y: 5.3, w: 10, h: 0.3, fill: { color: "E2E8F0" } });
      s.addText(`${topic} • Department of ${course}`, { x: 0.8, y: 5.35, fontSize: 9, color: "64748B", fontFace: "Arial" });
      return s;
    };

    // Slide 2: Background
    const s2 = createSlide("Background of the Study", "Chapter 1: Introduction");
    s2.addText(
      [
        { text: "• Rapid Enrollment Surge: ", options: { bold: true, color: NAVY } },
        { text: "Tertiary enrollments in developing economies have vastly outpaced physical campus hostel capacities.\n\n" },
        { text: "• Critical Role of Accommodation: ", options: { bold: true, color: NAVY } },
        { text: "Safe, orderly on-campus residential housing directly influences student psychological stability, security, and cumulative GPA.\n\n" },
        { text: "• Failure of Manual Administration: ", options: { bold: true, color: NAVY } },
        { text: "Paper-based ledgers, physical hall porter queues, and manual room keys create systemic bottlenecks during annual semester clearances." },
      ],
      { x: 0.8, y: 1.3, w: 8.4, h: 3.6, fontSize: 15, color: DARK_TEXT, fontFace: "Arial" }
    );

    // Slide 3: Problem Statement
    const s3 = createSlide("Statement of the Problem", "Chapter 1: Introduction");
    s3.addText(
      [
        { text: "1. Extreme Administrative Latency: ", options: { bold: true, color: NAVY } },
        { text: "Students spend an average of 3 to 5 business days queuing physically to verify fee clearance and secure room allocations.\n\n" },
        { text: "2. Concurrent Double-Booking: ", options: { bold: true, color: NAVY } },
        { text: "Manual record-keeping without transactional locking causes identical bedspaces to be assigned to multiple students.\n\n" },
        { text: "3. Disconnected Facility Maintenance: ", options: { bold: true, color: NAVY } },
        { text: "No centralized digital log exists for electrical, plumbing, and structural faults, resulting in unresolved facility degradation." },
      ],
      { x: 0.8, y: 1.3, w: 8.4, h: 3.6, fontSize: 15, color: DARK_TEXT, fontFace: "Arial" }
    );

    // Slide 4: Aim & Objectives
    const s4 = createSlide("Aim and Specific Objectives", "Chapter 1: Introduction");
    s4.addText(
      "AIM: To design and implement an Automated Hostel Allocation and Facility Management System that enforces fair, error-free bedspace distribution.",
      { x: 0.8, y: 1.2, w: 8.4, h: 0.8, fontSize: 14, bold: true, color: CYAN, fontFace: "Arial" }
    );
    s4.addText(
      [
        { text: "1. Analyze: ", options: { bold: true } },
        { text: "Examine manual allocation workflows and identify systemic failure points.\n" },
        { text: "2. Model: ", options: { bold: true } },
        { text: "Design a relational schema with row-level locks preventing duplicate reservations.\n" },
        { text: "3. Implement: ", options: { bold: true } },
        { text: "Develop an automated allocation engine enforcing institutional quotas and eligibility.\n" },
        { text: "4. Integrate: ", options: { bold: true } },
        { text: "Build a maintenance ticketing portal for real-time fault tracking and repair.\n" },
        { text: "5. Evaluate: ", options: { bold: true } },
        { text: "Conduct rigorous unit testing, stress testing, and User Acceptance Testing (UAT)." },
      ],
      { x: 0.8, y: 2.1, w: 8.4, h: 2.8, fontSize: 14, color: DARK_TEXT, fontFace: "Arial" }
    );

    // Slide 5: Literature Review
    const s5 = createSlide("Literature Review & Citations", "Chapter 2: Literature Review");
    s5.addText(
      [
        { text: "• Al-Nuaimi et al. (IEEE Trans. Services Computing, 2022):\n", options: { bold: true, color: NAVY } },
        { text: "Demonstrated that high-volume academic enrollment platforms require transactional database locking to prevent concurrency race conditions under sudden request spikes.\n\n" },
        { text: "• Adebayo & Ogundele (J. Comp. Sci. & Info. Tech, 2021):\n", options: { bold: true, color: NAVY } },
        { text: "Developed an early PHP/MySQL allocation portal but highlighted vulnerability to database deadlocks without asynchronous queue controllers.\n\n" },
        { text: "• Research Gap: ", options: { bold: true, color: GOLD } },
        { text: "Existing academic platforms treat room allocation and ongoing facility maintenance as isolated silos. CodeThesis unifies both into a single real-time architecture." },
      ],
      { x: 0.8, y: 1.3, w: 8.4, h: 3.6, fontSize: 14, color: DARK_TEXT, fontFace: "Arial" }
    );

    // Slide 6: System Architecture
    const s6 = createSlide("Decoupled 3-Tier System Architecture", "Chapter 3: Methodology");
    s6.addText(
      [
        { text: "1. Presentation Tier (Client Layer):\n", options: { bold: true, color: NAVY } },
        { text: "Responsive single-page application built with HTML5, Tailwind CSS, and React components, optimized for mobile devices and desktop browsers.\n\n" },
        { text: "2. Application Logic Tier (Controller Layer):\n", options: { bold: true, color: NAVY } },
        { text: "RESTful JSON web services powered by Python/FastAPI, enforcing JWT authentication, rate limiting, and transactional reservation business logic.\n\n" },
        { text: "3. Data Tier (Persistence Layer):\n", options: { bold: true, color: NAVY } },
        { text: "ACID-compliant relational database (SQLite/PostgreSQL) with foreign key constraints, automated indexing on matric numbers, and daily archival backups." },
      ],
      { x: 0.8, y: 1.3, w: 8.4, h: 3.6, fontSize: 14, color: DARK_TEXT, fontFace: "Arial" }
    );

    // Slide 7: Database Design & ERD
    const s7 = createSlide("Database Schema & Entities", "Chapter 3: Methodology");
    s7.addText(
      [
        { text: "• USERS: ", options: { bold: true, color: NAVY } },
        { text: "id (PK), matric_number (UK), full_name, email, password, gender, level, role\n" },
        { text: "• HOSTELS: ", options: { bold: true, color: NAVY } },
        { text: "id (PK), name, gender_designation, total_capacity\n" },
        { text: "• ROOMS: ", options: { bold: true, color: NAVY } },
        { text: "id (PK), hostel_id (FK), room_number, bed_capacity, occupied_beds, status\n" },
        { text: "• ALLOCATIONS: ", options: { bold: true, color: NAVY } },
        { text: "id (PK), user_id (FK), room_id (FK), bed_number, academic_session, allocated_at\n" },
        { text: "• MAINTENANCE_TICKETS: ", options: { bold: true, color: NAVY } },
        { text: "id (PK), user_id (FK), room_number, category, description, status, created_at" },
      ],
      { x: 0.8, y: 1.3, w: 8.4, h: 3.6, fontSize: 14, color: DARK_TEXT, fontFace: "Arial" }
    );

    // Slide 8: Live Demo Highlights
    const s8 = createSlide("Live System Demonstration Highlights", "Chapter 4: Implementation");
    s8.addText(
      [
        { text: "• Zero-Config Defense Runner (run_project.bat):\n", options: { bold: true, color: NAVY } },
        { text: "Double-click desktop launcher auto-initializes database seeds and opens browser on localhost:8000.\n\n" },
        { text: "• Real-Time Bedspace Allocator:\n", options: { bold: true, color: NAVY } },
        { text: "Live room inventory displays remaining capacities (e.g., 2 of 4 beds available) and disables full rooms.\n\n" },
        { text: "• Interactive Maintenance Ticketing:\n", options: { bold: true, color: NAVY } },
        { text: "Students report electrical or plumbing faults; hall porters manage statuses (PENDING -> IN PROGRESS -> RESOLVED)." },
      ],
      { x: 0.8, y: 1.3, w: 8.4, h: 3.6, fontSize: 14, color: DARK_TEXT, fontFace: "Arial" }
    );

    // Slide 9: Testing & Results
    const s9 = createSlide("Testing Protocols & Performance Results", "Chapter 4: Implementation");
    s9.addText(
      [
        { text: "1. Unit Testing: ", options: { bold: true, color: NAVY } },
        { text: "All API authentication routes and room query filters passed test suites with 100% assertions.\n\n" },
        { text: "2. Concurrency Stress Testing: ", options: { bold: true, color: NAVY } },
        { text: "Simulated 250 simultaneous requests competing for 4 available beds. Transactional row-level locks successfully allocated the 4 beds without a single duplicate allocation, gracefully serving 'Room Full' to the remaining 246 requests.\n\n" },
        { text: "3. User Acceptance Testing (UAT): ", options: { bold: true, color: NAVY } },
        { text: "Administered to 40 students and 5 porters; achieved a 95% usability satisfaction rating." },
      ],
      { x: 0.8, y: 1.3, w: 8.4, h: 3.6, fontSize: 14, color: DARK_TEXT, fontFace: "Arial" }
    );

    // Slide 10: Conclusion & Q&A
    const s10 = createSlide("Conclusion & Contributions to Knowledge", "Chapter 5: Conclusion");
    s10.addText(
      [
        { text: "• Research Contributions:\n", options: { bold: true, color: NAVY } },
        { text: "1. Successfully eliminated manual paperwork and duplicate room assignments via transactional locks.\n" },
        { text: "2. Reduced hostel registration clearance latency by over 92%.\n" },
        { text: "3. Unified room allocation with real-time maintenance accountability.\n\n" },
        { text: "• Future Enhancements:\n", options: { bold: true, color: NAVY } },
        { text: "Native mobile app notifications and IoT biometric fingerprint door access.\n\n" },
        { text: "THANK YOU FOR LISTENING! QUESTIONS & ANSWERS (Q&A)", options: { bold: true, color: CYAN } },
      ],
      { x: 0.8, y: 1.3, w: 8.4, h: 3.6, fontSize: 14, color: DARK_TEXT, fontFace: "Arial" }
    );

    // Generate PPTX Buffer
    const buffer = await pres.write({ outputType: "nodebuffer" });

    return new NextResponse(new Uint8Array(buffer as Buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="Viva_Defense_Slides_${course.replace(/\s+/g, "_")}.pptx"`,
      },
    });
  } catch (error) {
    console.error("Error generating PPTX:", error);
    return NextResponse.json({ error: "Failed to generate presentation" }, { status: 500 });
  }
}
