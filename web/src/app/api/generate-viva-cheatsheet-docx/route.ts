import { NextRequest, NextResponse } from "next/server";
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, BorderStyle } from "docx";
import { authorizeAndDeductCredits, autoArchiveProject } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const {
      title = "AI-Driven University Academic System",
      author = "Student Researcher",
      matricNo = "U/20/CS/0000",
      department = "Computer Science",
      examinerTone = "Strict External Examiner",
      questions = []
    } = body;

    // Deduct credits for Viva Simulator (allow free re-downloads of archived projects)
    const isRedownload = req.headers.get('x-codethesis-redownload') === 'true' || body.isRedownload === true;
    const creditCheck = await authorizeAndDeductCredits('vivaSimulator', { skipDeduction: isRedownload });
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: creditCheck.errorMessage, cost: creditCheck.cost, remainingCredits: creditCheck.remainingCredits },
        { status: 402 }
      );
    }

    const defaultQuestions = [
      {
        q: "1. What is the fundamental problem your research solves, and why can existing commercial solutions not suffice?",
        psychology: "The examiner tests if you know the 'Why' or just jumped to coding. They want to see gap identification.",
        modelAnswer: "Most commercial enterprise systems are cost-prohibitive for local institutions, demand persistent high-bandwidth internet connectivity, and lack local data sovereignty compliance. Our proposed architecture introduces an offline-first, low-resource deterministic pipeline tailored precisely to local operational and infrastructural constraints, reducing operational overhead by 73% while retaining complete data governance.",
        proTip: "Never badmouth existing tools generically. Quantify constraints (bandwidth, hardware costs, localized workflows)."
      },
      {
        q: "2. Justify your architectural design pattern and database choice. Why relational over NoSQL for this specific workload?",
        psychology: "Testing architectural maturity. Many students pick MongoDB or MySQL without knowing why.",
        modelAnswer: "Our workload exhibits high relational dependency with strict ACID transaction requirements (e.g., student grading, financial clearances, authentication logs). Using a relational schema with B-Tree indexed primary and foreign keys prevents orphan records and phantom reads under concurrent writes. NoSQL was considered but rejected because eventual consistency would introduce unacceptable data integrity hazards during final mark computation.",
        proTip: "Use keywords like 'ACID compliance', 'referential integrity', and 'write concurrency'."
      },
      {
        q: "3. How did you handle security, SQL injection, and authorization in your implementation?",
        psychology: "Standard defense trap: examiners look for raw string concatenations or hardcoded admin tokens.",
        modelAnswer: "Security was integrated at the architectural layer via defense-in-depth: all database interactions strictly utilize parameterized prepared statements, preventing SQL injection completely. Input validation utilizes regex whitelisting, passwords are hashed with salted Argon2id/bcrypt, and authorization enforces strict Role-Based Access Control (RBAC) with short-lived cryptographic session tokens.",
        proTip: "Mention parameterized queries and salted hashing immediately."
      },
      {
        q: "4. What is the theoretical time complexity of your primary algorithm, and how does it scale as N reaches 100,000?",
        psychology: "Examiners want to see computer science rigor beyond superficial web UI design.",
        modelAnswer: "The core queuing and matching algorithm operates at O(N log N) using a min-heap priority queue structure rather than a naive O(N^2) double-nested traversal. Under benchmark testing with 100,000 synthetic records, lookup and insertion execute in under 18ms on modest 4-core hardware, remaining well within real-time latency thresholds.",
        proTip: "Give the Big-O notation confidently and cite benchmark numbers."
      },
      {
        q: "5. If you were granted an additional 6 months and funding, what fundamental limitation would you address first?",
        psychology: "Testing intellectual honesty and humility. Never say 'The project has no limitations and is 100% complete.'",
        modelAnswer: "While our system achieves 96.4% classification accuracy under normal loads, it currently relies on a centralized coordinator node. In the next iteration, I would implement distributed consensus via Raft and introduce edge caching with WebAssembly micro-workers to provide true fault-tolerant multi-campus active-active failover.",
        proTip: "Admitting a clear architectural next step shows high research maturity."
      }
    ];

    const qaList = questions && questions.length > 0 ? questions : defaultQuestions;

    const sections = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: "FINAL YEAR PROJECT VIVA VOCE DEFENSE CHEATSHEET",
            bold: true,
            size: 32,
            font: "Times New Roman",
            color: "0B132B",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: "Confidential Examiner Preparation & Gold-Standard Model Answers",
            italics: true,
            size: 24,
            font: "Times New Roman",
            color: "64748B",
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: "Project Title: ", bold: true, size: 24, font: "Times New Roman" }),
          new TextRun({ text: title, size: 24, font: "Times New Roman" }),
        ],
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: "Candidate: ", bold: true, size: 24, font: "Times New Roman" }),
          new TextRun({ text: `${author} (${matricNo})`, size: 24, font: "Times New Roman" }),
        ],
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: "Department: ", bold: true, size: 24, font: "Times New Roman" }),
          new TextRun({ text: department, size: 24, font: "Times New Roman" }),
        ],
      }),
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({ text: "Simulated Examiner Profile: ", bold: true, size: 24, font: "Times New Roman" }),
          new TextRun({ text: examinerTone, size: 24, font: "Times New Roman", color: "EF4444" }),
        ],
      }),
      new Paragraph({
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: "--- CORE DEFENSE QUESTIONS & VERIFIED RESPONSES ---",
            bold: true,
            size: 24,
            font: "Times New Roman",
            color: "0284C7",
          }),
        ],
      }),
    ];

    qaList.forEach((item: any, idx: number) => {
      sections.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 100 },
          children: [
            new TextRun({
              text: `Question ${idx + 1}: ${item.q.replace(/^\d+\.\s*/, '')}`,
              bold: true,
              size: 26,
              font: "Times New Roman",
              color: "0B132B",
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Examiner's Hidden Intent / Trap: ", bold: true, size: 22, font: "Times New Roman", color: "B45309" }),
            new TextRun({ text: item.psychology, italics: true, size: 22, font: "Times New Roman" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "Gold-Standard Defense Answer: ", bold: true, size: 24, font: "Times New Roman", color: "047857" }),
            new TextRun({ text: item.modelAnswer, size: 24, font: "Times New Roman" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "Pro Tip / Delivery Advice: ", bold: true, size: 22, font: "Times New Roman", color: "6366F1" }),
            new TextRun({ text: item.proTip, italics: true, size: 22, font: "Times New Roman" }),
          ],
        })
      );
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                bottom: 1440,
                left: 1440,
                right: 1440,
              },
            },
          },
          children: sections,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    // Auto-archive in student repository
    await autoArchiveProject({
      userId: creditCheck.userId,
      toolId: 'viva-simulator',
      title: `Defense Oral Examination Prep Sheet: ${title}`,
      course: department,
      institution: 'Nigerian University',
      summary: `Top 20 Departmental Defense Viva Questions & Model Answers with examiner psychology notes.`,
      fileType: 'docx',
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Viva_Defense_Cheatsheet_${author.replace(/\\s+/g, '_')}.docx"`,
        "X-Remaining-Credits": String(creditCheck.remainingCredits),
      },
    });
  } catch (error: any) {
    console.error("Viva Cheatsheet Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate cheatsheet" }, { status: 500 });
  }
}
