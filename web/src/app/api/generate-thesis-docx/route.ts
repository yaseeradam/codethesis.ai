import { NextRequest, NextResponse } from "next/server";
import { authorizeAndDeductCredits, autoArchiveProject } from "@/lib/credits";
import { generateAcademicAI, buildChapterUserPrompt } from "@/lib/ai";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  PageBreak,
  BorderStyle,
} from "docx";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const topic = (body.topic || "Design and Implementation of an Automated System").trim();
    const course = (body.course || body.department || "Computer Science").trim();
    const institution = (body.institution || "Tertiary Educational Institution").trim();
    const caseStudy = (body.caseStudy || institution).trim();
    const studentName = (body.studentName || body.author || "STUDENT CANDIDATE").trim().toUpperCase();
    const matricNumber = (body.matricNumber || body.matricNo || "MATRIC/2026/0001").trim().toUpperCase();
    const supervisor = (body.supervisor || "Dr. Abdulrazak Abdulrahim (Ph.D, MNCS, MCPN)").trim();
    const session = (body.session || "2025/2026").trim();

    // Check custom chapters passed from frontend
    const userChapters: Record<number, string> = {};
    if (body.aiCustomContent && typeof body.aiCustomContent === "object") {
      Object.entries(body.aiCustomContent).forEach(([k, v]) => {
        const num = parseInt(k, 10);
        if (!isNaN(num) && typeof v === "string" && v.trim()) {
          userChapters[num] = v.trim();
        }
      });
    }
    if (body.chapters && typeof body.chapters === "object") {
      if (Array.isArray(body.chapters)) {
        body.chapters.forEach((text: any, idx: number) => {
          if (typeof text === "string" && text.trim()) userChapters[idx + 1] = text.trim();
        });
      } else {
        Object.entries(body.chapters).forEach(([k, v]) => {
          const num = k.startsWith("ch") ? parseInt(k.replace("ch", ""), 10) : parseInt(k, 10);
          if (!isNaN(num) && typeof v === "string" && v.trim()) {
            userChapters[num] = v.trim();
          }
        });
      }
    }

    // Check and deduct credits (allow free re-downloads of archived projects)
    const isRedownload = req.headers.get("x-codethesis-redownload") === "true" || body.isRedownload === true;
    const creditCheck = await authorizeAndDeductCredits("thesis", { skipDeduction: isRedownload });
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: creditCheck.errorMessage, cost: creditCheck.cost, remainingCredits: creditCheck.remainingCredits },
        { status: 402 }
      );
    }

    const docChildren: (Paragraph | Table)[] = [];

    // --- Helper Functions for Academic Typography (NUC / APA Format) ---
    const academicPara = (text: string, indent = true, lineSpacing = 360) =>
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: indent ? { firstLine: 720 } : undefined, // 0.5 inch first line indent
        spacing: { before: 100, after: 120, line: lineSpacing }, // 1.5 line spacing
        children: [
          new TextRun({
            text,
            size: 24, // 12pt
            font: "Times New Roman",
            color: "111827",
          }),
        ],
      });

    const academicHeading1 = (title: string, subtitle?: string) => [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 150 },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 28, // 14pt
            font: "Times New Roman",
            color: "000000",
          }),
        ],
      }),
      ...(subtitle
        ? [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
              children: [
                new TextRun({
                  text: subtitle.toUpperCase(),
                  bold: true,
                  size: 26, // 13pt
                  font: "Times New Roman",
                  color: "000000",
                }),
              ],
            }),
          ]
        : []),
    ];

    const academicHeading2 = (title: string) =>
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 120 },
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 26, // 13pt
            font: "Times New Roman",
            color: "000000",
          }),
        ],
      });

    const academicHeading3 = (title: string) =>
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: title,
            bold: true,
            italics: true,
            size: 24, // 12pt
            font: "Times New Roman",
            color: "1F2937",
          }),
        ],
      });

    const academicBullet = (title: string, bodyText: string) =>
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        bullet: { level: 0 },
        spacing: { before: 60, after: 80, line: 360 },
        children: [
          new TextRun({
            text: `${title}: `,
            bold: true,
            size: 24,
            font: "Times New Roman",
            color: "000000",
          }),
          new TextRun({
            text: bodyText,
            size: 24,
            font: "Times New Roman",
            color: "111827",
          }),
        ],
      });

    // Helper to parse markdown text generated by AI into structured docx elements
    const parseMarkdownToDocx = (mdText: string): (Paragraph | Table)[] => {
      const elements: (Paragraph | Table)[] = [];
      const lines = mdText.split("\n");
      let currentTableRows: string[][] = [];

      const flushTable = () => {
        if (currentTableRows.length > 0) {
          const tableRows = currentTableRows.map((row, rIdx) => {
            const isHeader = rIdx === 0;
            return new TableRow({
              children: row.map((cellText) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      spacing: { before: 40, after: 40 },
                      children: [
                        new TextRun({
                          text: cellText.trim(),
                          bold: isHeader,
                          size: 20, // 10pt
                          font: "Times New Roman",
                        }),
                      ],
                    }),
                  ],
                  shading: isHeader ? { fill: "F3F4F6" } : undefined,
                })
              ),
            });
          });
          elements.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
            })
          );
          currentTableRows = [];
        }
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Check for markdown table
        if (line.startsWith("|") && line.endsWith("|")) {
          const cells = line.split("|").slice(1, -1).map((c) => c.trim());
          if (cells.every((c) => /^[-:]+$/.test(c))) {
            continue; // Skip markdown separator row
          }
          currentTableRows.push(cells);
          continue;
        } else {
          flushTable();
        }

        if (line.startsWith("# ")) {
          elements.push(...academicHeading1(line.replace(/^#\s*/, "")));
        } else if (line.startsWith("## ")) {
          elements.push(academicHeading2(line.replace(/^##\s*/, "")));
        } else if (line.startsWith("### ")) {
          elements.push(academicHeading3(line.replace(/^###\s*/, "")));
        } else if (line.startsWith("- ") || line.startsWith("* ")) {
          const bulletText = line.replace(/^[-*]\s*/, "");
          const colonIdx = bulletText.indexOf(":");
          if (colonIdx > 0 && colonIdx < 40) {
            elements.push(academicBullet(bulletText.slice(0, colonIdx), bulletText.slice(colonIdx + 1).trim()));
          } else {
            elements.push(
              new Paragraph({
                bullet: { level: 0 },
                alignment: AlignmentType.JUSTIFIED,
                spacing: { before: 60, after: 80, line: 360 },
                children: [new TextRun({ text: bulletText, size: 24, font: "Times New Roman" })],
              })
            );
          }
        } else {
          elements.push(academicPara(line));
        }
      }
      flushTable();
      return elements;
    };

    // =========================================================================
    // 1. TITLE PAGE (Reference: MY PROJECT ORIGINAL.docx)
    // =========================================================================
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1200, after: 400 },
        children: [
          new TextRun({
            text: topic.toUpperCase(),
            bold: true,
            size: 32, // 16pt
            font: "Times New Roman",
            color: "000000",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 150 },
        children: [
          new TextRun({
            text: "BY\n" + studentName,
            bold: true,
            size: 26,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 700 },
        children: [
          new TextRun({
            text: `MATRICULATION NUMBER: ${matricNumber}`,
            bold: true,
            size: 24,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 700, after: 300 },
        children: [
          new TextRun({
            text: `A FINAL YEAR RESEARCH PROJECT DISSERTATION SUBMITTED TO THE DEPARTMENT OF ${course.toUpperCase()}, FACULTY OF PHYSICAL & COMPUTING SCIENCES, ${institution.toUpperCase()}, IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF THE DEGREE OF BACHELOR OF SCIENCE (B.SC. HONS) IN ${course.toUpperCase()}.`,
            size: 22,
            italics: true,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 100 },
        children: [
          new TextRun({
            text: `PROJECT SUPERVISOR: ${supervisor}`,
            bold: true,
            size: 24,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 500 },
        children: [
          new TextRun({
            text: `ACADEMIC SESSION: ${session}`,
            bold: true,
            size: 24,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // 2. DECLARATION (Reference: MY PROJECT ORIGINAL.docx)
    // =========================================================================
    docChildren.push(
      ...academicHeading1("DECLARATION"),
      academicPara(
        `I, ${studentName} (${matricNumber}), hereby declare that this project dissertation titled "${topic}" has been carried out by me under the academic supervision of ${supervisor}, Department of ${course}, ${institution}.`
      ),
      academicPara(
        "I solemnly confirm that no part of this academic write-up, software architecture, or empirical findings has been presented previously or concurrently for the award of any degree, diploma, fellowship, or professional qualification in this or any other tertiary educational institution."
      ),
      academicPara(
        "All sources of empirical data, scholarly literature, software libraries, and academic citations utilized within this dissertation have been specifically acknowledged by means of comprehensive references in strict accordance with the American Psychological Association (APA 7th Edition) standard."
      ),
      new Paragraph({
        spacing: { before: 1200 },
        children: [
          new TextRun({
            text: "_______________________________\t\t\t\t________________________\n" +
                  `${studentName} (${matricNumber})\t\t\t\tDate of Signature\n` +
                  `Student Researcher`,
            bold: true,
            size: 22,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // 3. CERTIFICATION (Reference: MY PROJECT ORIGINAL.docx)
    // =========================================================================
    docChildren.push(
      ...academicHeading1("CERTIFICATION"),
      academicPara(
        `This project dissertation entitled "${topic.toUpperCase()}" by ${studentName} (${matricNumber}) meets the statutory academic regulations governing the award of the degree of Bachelor of Science (B.Sc. Hons.) in ${course} in the Department of ${course}, ${institution}, and is hereby approved for its intellectual contribution to knowledge and literary presentation.`
      ),
      new Paragraph({
        spacing: { before: 1000 },
        children: [
          new TextRun({
            text: "_____________________________________\t\t\t\t_____________________\n" +
                  `${supervisor}\t\t\t\tDate\n` +
                  "Project Supervisor\n\n\n" +
                  "_____________________________________\t\t\t\t_____________________\n" +
                  `Head of Department\t\t\t\t\t\tDate\n` +
                  `Department of ${course}, ${institution}\n\n\n` +
                  "_____________________________________\t\t\t\t_____________________\n" +
                  "External Examiner\t\t\t\t\t\tDate\n" +
                  "Senate Board of Examiners Representative",
            bold: true,
            size: 22,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // 4. DEDICATION & ACKNOWLEDGEMENT (Reference: MY PROJECT ORIGINAL.docx)
    // =========================================================================
    docChildren.push(
      ...academicHeading1("DEDICATION"),
      academicPara(
        "This research dissertation is dedicated first and foremost to the Almighty God, whose infinite mercy, wisdom, protection, and divine guidance provided the fortitude to successfully conclude this academic journey."
      ),
      academicPara(
        "This work is also dedicated with deepest love and enduring gratitude to my beloved parents, siblings, family members, lecturers, and trusted companions whose unyielding moral encouragement, financial sacrifices, and persistent prayers laid the foundation for my educational achievement."
      ),
      ...academicHeading1("ACKNOWLEDGEMENT"),
      academicPara(
        `I wish to express my profound gratitude to Almighty God for granting me good health, intellectual clarity, and the opportunity to successfully complete this research dissertation.`
      ),
      academicPara(
        `My sincere and utmost appreciation goes to my supervisor, ${supervisor}, for his invaluable technical guidance, incisive critiques, patience, and professional mentorship throughout the lifecycle of this study.`
      ),
      academicPara(
        `I am equally indebted to the Head of Department, academic lecturers, and technical staff of the Department of ${course}, ${institution}, for imparting the computational paradigms, theoretical rigour, and engineering principles that made this project possible.`
      ),
      academicPara(
        `Special thanks are extended to the management and administrative officers of ${caseStudy} who participated in system discovery sessions, user interviews, and provided the operational parameters necessary for testing and evaluating the system.`
      ),
      academicPara(
        "Finally, my heartfelt appreciation goes to my distinguished course colleagues, research collaborators, and lifelong friends for their camaraderie and intellectual stimulation throughout my undergraduate studies."
      ),
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // 5. ABSTRACT (Dynamically crafted for the specific topic)
    // =========================================================================
    const abstractText1 = `This project presents the design and implementation of an automated, robust software solution for ${topic} at ${caseStudy}, ${institution}. In modern organizational and academic environments, conventional paper-based and legacy manual workflows are inherently susceptible to administrative friction, human transcription errors, operational delays, data redundancy, and a fundamental lack of real-time auditability. These chronic limitations impede decision-making, increase transactional turnaround latency, and compromise data integrity.`;
    const abstractText2 = `To resolve these operational bottlenecks, an automated digital framework was developed adopting modern software engineering standards. The system integrates a decoupled presentation interface, a resilient business logic coordinator, and an ACID-compliant relational persistence layer utilizing Python, SQL relational databases, and responsive web technologies. The core engine implements automated constraint satisfaction, structured validation protocols, and comprehensive role-based access control (RBAC) to ensure seamless transaction processing and secure record management.`;
    const abstractText3 = `The Software Development Life Cycle (SDLC) methodology was adopted across requirements gathering, system design, architectural modeling, implementation, and empirical testing. Comprehensive multi-tier evaluation was conducted, encompassing unit verification, integration testing, and User Acceptance Testing (UAT). Empirical benchmarking demonstrated a 100% transaction integrity rate under concurrent simulated user requests, with average response latency below 50 milliseconds. The system achieved a System Usability Scale (SUS) score exceeding 88%, representing a significant enhancement in operational efficiency, transparency, and data accessibility compared to legacy procedures.`;

    docChildren.push(
      ...academicHeading1("ABSTRACT"),
      academicPara(abstractText1),
      academicPara(abstractText2),
      academicPara(abstractText3),
      new Paragraph({
        spacing: { before: 240 },
        children: [
          new TextRun({
            text: "Keywords: ",
            bold: true,
            size: 22,
            font: "Times New Roman",
          }),
          new TextRun({
            text: `${topic}, Automated Information System, Relational Database Normalization, Software Architecture, Empirical Evaluation, User Acceptance Testing (UAT).`,
            italics: true,
            size: 22,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // 6. TABLE OF CONTENTS (Reference: MY PROJECT ORIGINAL.docx)
    // =========================================================================
    const createTocRow = (title: string, page: string, isBold: boolean, isSub: boolean) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 88, type: WidthType.PERCENTAGE },
            margins: { top: 40, bottom: 40, left: isSub ? 360 : 80, right: 80 },
            children: [
              new Paragraph({
                spacing: { before: isBold ? 120 : 40, after: 40 },
                children: [
                  new TextRun({
                    text: title,
                    bold: isBold,
                    size: isBold ? 22 : 20,
                    font: "Times New Roman",
                    color: isBold ? "000000" : "1F2937",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 12, type: WidthType.PERCENTAGE },
            margins: { top: 40, bottom: 40, left: 80, right: 80 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: isBold ? 120 : 40, after: 40 },
                children: [
                  new TextRun({
                    text: page,
                    bold: isBold,
                    size: isBold ? 22 : 20,
                    font: "Times New Roman",
                    color: isBold ? "000000" : "1F2937",
                  }),
                ],
              }),
            ],
          }),
        ],
      });

    const thesisTocTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      },
      rows: [
        createTocRow("Title Page", "i", false, false),
        createTocRow("Declaration", "ii", false, false),
        createTocRow("Certification", "iii", false, false),
        createTocRow("Dedication", "iv", false, false),
        createTocRow("Acknowledgement", "v", false, false),
        createTocRow("Abstract", "vi", false, false),
        createTocRow("Table of Contents", "vii", false, false),
        createTocRow("List of Tables", "viii", false, false),
        createTocRow("List of Figures", "ix", false, false),
        createTocRow("CHAPTER ONE: INTRODUCTION", "1", true, false),
        createTocRow("1.1 Background of the Study", "1", false, true),
        createTocRow("1.2 Statement of the Problem", "3", false, true),
        createTocRow("1.3 Aim and Objectives of the Study", "4", false, true),
        createTocRow("1.4 Significance of the Study", "5", false, true),
        createTocRow("1.5 Scope of the Study", "6", false, true),
        createTocRow("1.6 Limitations of the Study", "6", false, true),
        createTocRow("1.7 Assumptions of the Study", "7", false, true),
        createTocRow("1.8 Methodology", "7", false, true),
        createTocRow("1.9 Organization of the Study", "8", false, true),
        createTocRow("1.10 Definition of Terms", "9", false, true),
        createTocRow("CHAPTER TWO: LITERATURE REVIEW", "10", true, false),
        createTocRow("2.1 Introduction", "10", false, true),
        createTocRow("2.2 Conceptual Review", "10", false, true),
        createTocRow("2.3 Theoretical Framework", "13", false, true),
        createTocRow("2.4 Review of Modern Technological Frameworks", "16", false, true),
        createTocRow("2.5 Review of Related Works / Similar Existing Systems", "19", false, true),
        createTocRow("2.6 Comparative Analysis & Limitations of Existing Systems", "22", false, true),
        createTocRow("2.7 Research Gap", "23", false, true),
        createTocRow("2.8 Summary of Literature Review", "24", false, true),
        createTocRow("CHAPTER THREE: SYSTEM ANALYSIS AND DESIGN", "25", true, false),
        createTocRow("3.1 Introduction", "25", false, true),
        createTocRow("3.2 Analysis of the Existing System", "25", false, true),
        createTocRow("3.3 Analysis of the Proposed System", "27", false, true),
        createTocRow("3.4 Objectives of the Proposed System", "28", false, true),
        createTocRow("3.5 System Development Methodology", "29", false, true),
        createTocRow("3.6 Feasibility Study", "31", false, true),
        createTocRow("3.7 System Architecture", "33", false, true),
        createTocRow("3.8 Data Flow Analysis & Models", "35", false, true),
        createTocRow("3.9 Database Design & Data Dictionary", "38", false, true),
        createTocRow("3.10 System Flowchart & Algorithm Logic", "42", false, true),
        createTocRow("CHAPTER FOUR: SYSTEM IMPLEMENTATION AND EVALUATION", "45", true, false),
        createTocRow("4.1 Introduction", "45", false, true),
        createTocRow("4.2 System Development Environment", "45", false, true),
        createTocRow("4.3 System Implementation Architecture", "47", false, true),
        createTocRow("4.4 Database Implementation", "49", false, true),
        createTocRow("4.5 Description of System Modules", "51", false, true),
        createTocRow("4.6 User Interface Design & Screen Descriptions", "55", false, true),
        createTocRow("4.7 Testing of the System", "58", false, true),
        createTocRow("4.8 Test Cases and Results", "60", false, true),
        createTocRow("4.9 Results Obtained & Empirical Metrics", "62", false, true),
        createTocRow("4.10 Discussion of Results", "63", false, true),
        createTocRow("4.11 Advantages of the Proposed System", "64", false, true),
        createTocRow("4.12 Limitations of the Developed System", "64", false, true),
        createTocRow("4.13 Summary of Implementation", "64", false, true),
        createTocRow("CHAPTER FIVE: SUMMARY, CONCLUSIONS AND RECOMMENDATIONS", "65", true, false),
        createTocRow("5.1 Introduction", "65", false, true),
        createTocRow("5.2 Summary of the Project", "65", false, true),
        createTocRow("5.3 Summary of Findings", "66", false, true),
        createTocRow("5.4 Conclusions", "67", false, true),
        createTocRow("5.5 Contributions to Knowledge", "68", false, true),
        createTocRow("5.6 Recommendations", "69", false, true),
        createTocRow("REFERENCES (APA 7th Edition)", "71", true, false),
        createTocRow("APPENDIX A: SYSTEM SOURCE CODE", "75", true, false),
        createTocRow("APPENDIX B: DATABASE DDL SCHEMA", "78", true, false),
      ],
    });

    docChildren.push(
      ...academicHeading1("TABLE OF CONTENTS"),
      thesisTocTable,
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // 7. LIST OF TABLES & LIST OF FIGURES (Reference: MY PROJECT ORIGINAL.docx)
    // =========================================================================
    docChildren.push(
      ...academicHeading1("LIST OF TABLES"),
      academicPara("Table 3.1: Core Primary Data Dictionary Structure\t...................................................................... 39", false),
      academicPara("Table 3.2: Transaction & Operational Data Dictionary\t...................................................................... 40", false),
      academicPara("Table 3.3: Hardware Development Environment Specifications\t...................................................................... 46", false),
      academicPara("Table 3.4: Software Development Environment Specifications\t...................................................................... 47", false),
      academicPara("Table 4.1: Empirical Test Cases Execution Matrix\t...................................................................... 61", false),
      academicPara("Table 4.2: System Usability Scale (SUS) Evaluation Metrics\t...................................................................... 63", false),
      ...academicHeading1("LIST OF FIGURES"),
      academicPara("Figure 3.1: Decoupled 3-Tier System Architecture\t...................................................................... 34", false),
      academicPara("Figure 3.2: Context Analysis Diagram of the Proposed System\t...................................................................... 36", false),
      academicPara("Figure 3.3: Level-1 Data Flow Diagram (DFD)\t...................................................................... 37", false),
      academicPara("Figure 3.4: Entity-Relationship Model (ERD)\t...................................................................... 38", false),
      academicPara("Figure 3.5: Operational Process Flowchart\t...................................................................... 43", false),
      academicPara("Figure 4.1: System User Authentication Interface\t...................................................................... 55", false),
      academicPara("Figure 4.2: Primary User Action Dashboard Interface\t...................................................................... 56", false),
      academicPara("Figure 4.3: Administrator Telemetry & Reports Dashboard\t...................................................................... 57", false),
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // 8. SYNTHESIZE CHAPTERS 1 THROUGH 5
    // =========================================================================
    for (let ch = 1; ch <= 5; ch++) {
      // Check if user already generated this chapter on frontend
      if (userChapters[ch]) {
        docChildren.push(...parseMarkdownToDocx(userChapters[ch]));
        docChildren.push(new Paragraph({ children: [new PageBreak()] }));
        continue;
      }

      // If not generated, synthesize dynamically with Groq AI Pool or dynamic generator
      let chapterMarkdown = "";
      try {
        const aiPrompt = buildChapterUserPrompt({
          topic,
          course,
          institution,
          chapterNumber: ch,
          caseStudy,
        });

        const aiRes = await generateAcademicAI({
          prompt: aiPrompt,
          temperature: 0.65,
          maxTokens: 3500,
          preferredProvider: "groq",
        });

        if (aiRes && aiRes.content && !aiRes.content.includes("codethesis-academic-heuristic")) {
          chapterMarkdown = aiRes.content;
        }
      } catch (err) {
        console.warn(`AI synthesis for Chapter ${ch} fallback to dynamic generator:`, err);
      }

      // If AI did not return complete text or failed, use our comprehensive topic-tailored generator
      if (!chapterMarkdown || chapterMarkdown.length < 500) {
        chapterMarkdown = generateDynamicChapterText(topic, course, institution, caseStudy, ch);
      }

      docChildren.push(...parseMarkdownToDocx(chapterMarkdown));
      docChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }

    // =========================================================================
    // 9. REFERENCES (APA 7th Edition)
    // =========================================================================
    docChildren.push(
      ...academicHeading1("REFERENCES"),
      academicPara("Adebayo, O. S., & Eze, K. C. (2022). Automated information systems in African tertiary institutions: Challenges and architectural solutions. Journal of African Computer Science, 14(2), 112–128. https://doi.org/10.1016/j.jacs.2022.04.012", false),
      academicPara("Ahmadu, B., & Ibrahim, M. (2023). Empirical evaluation of database normalization and transaction concurrency in enterprise software. Nigerian Journal of Technology, 42(1), 89–101. https://doi.org/10.4314/njt.v42i1.11", false),
      academicPara("Brooke, J. (1996). SUS: A quick and dirty usability scale. Usability Evaluation in Industry, 189(194), 4–7.", false),
      academicPara("Central Bank of Nigeria [CBN]. (2023). Annual financial technology and electronic payments report. Abuja: Central Bank of Nigeria.", false),
      academicPara("Chen, P. P. (1976). The entity-relationship model—Toward a unified view of data. ACM Transactions on Database Systems, 1(1), 9–36. https://doi.org/10.1145/320434.320440", false),
      academicPara("Codd, E. F. (1970). A relational model of data for large shared data banks. Communications of the ACM, 13(6), 377–387. https://doi.org/10.1145/362384.362685", false),
      academicPara("Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319–340. https://doi.org/10.2307/249008", false),
      academicPara("Federal Ministry of Communications and Digital Economy [FMCDE]. (2023). National digital economy policy and strategy (2020–2030). Federal Government of Nigeria.", false),
      academicPara("Laudon, K. C., & Laudon, J. P. (2024). Management information systems: Managing the digital firm (17th ed.). Pearson Education.", false),
      academicPara("Mohammed, Y., Aliyu, A., & Garba, S. (2023). Web-based management portals in Nigerian universities: A review of usability and security paradigms. African Journal of Computing & ICT, 16(3), 45–58.", false),
      academicPara("National Universities Commission [NUC]. (2022). Core curriculum and minimum academic standards for Nigerian universities (CCMAS). Abuja: National Universities Commission.", false),
      academicPara("Pressman, R. S., & Maxim, B. R. (2020). Software engineering: A practitioner's approach (9th ed.). McGraw-Hill.", false),
      academicPara("Silberschatz, A., Korth, H. F., & Sudarshan, S. (2020). Database system concepts (7th ed.). McGraw-Hill.", false),
      academicPara("Sommerville, I. (2021). Software engineering (10th ed.). Pearson.", false),
      academicPara("Williams, T., & Bello, U. (2024). Real-time transactional architectures for higher education administration. Journal of Systems and Software, 198, 111589. https://doi.org/10.1016/j.jss.2024.111589", false),
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // 10. APPENDICES (Code Listings & Schema)
    // =========================================================================
    const topicSlug = topic.toLowerCase().replace(/[^a-z0-9]/g, "_");
    docChildren.push(
      ...academicHeading1("APPENDIX A", "CORE APPLICATION SOURCE CODE"),
      academicPara(`The following Python listing demonstrates the core transactional controller and database initialization module engineered for ${topic}:`, false),
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({
            text: `# ==============================================================================\n` +
                  `# Project: ${topic}\n` +
                  `# Department: ${course}, ${institution}\n` +
                  `# Author: ${studentName} (${matricNumber})\n` +
                  `# ==============================================================================\n` +
                  `import sqlite3\n` +
                  `from http.server import HTTPServer, BaseHTTPRequestHandler\n` +
                  `import json\n\n` +
                  `DATABASE = "${topicSlug}.db"\n\n` +
                  `def init_database():\n` +
                  `    conn = sqlite3.connect(DATABASE)\n` +
                  `    cursor = conn.cursor()\n` +
                  `    cursor.execute("""\n` +
                  `        CREATE TABLE IF NOT EXISTS records (\n` +
                  `            id INTEGER PRIMARY KEY AUTOINCREMENT,\n` +
                  `            title TEXT NOT NULL,\n` +
                  `            category TEXT DEFAULT 'general',\n` +
                  `            status TEXT CHECK(status IN ('active', 'pending', 'resolved')) DEFAULT 'active',\n` +
                  `            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n` +
                  `        )\n` +
                  `    """)\n` +
                  `    conn.commit()\n` +
                  `    conn.close()\n` +
                  `    print("Database schema successfully verified.")\n\n` +
                  `if __name__ == '__main__':\n` +
                  `    init_database()\n` +
                  `    print("Application Server running for ${topic}...")\n`,
            font: "Courier New",
            size: 18,
          }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] }),
      ...academicHeading1("APPENDIX B", "DATABASE DDL SCHEMA SCRIPT"),
      academicPara(`The relational SQL schema definitions enforcing ACID transaction constraints for ${topic}:`, false),
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({
            text: `-- =============================================================================\n` +
                  `-- Relational SQL DDL Definition for: ${topic}\n` +
                  `-- Department of ${course}, ${institution}\n` +
                  `-- =============================================================================\n\n` +
                  `CREATE TABLE IF NOT EXISTS users (\n` +
                  `    user_id INTEGER PRIMARY KEY AUTOINCREMENT,\n` +
                  `    username VARCHAR(100) UNIQUE NOT NULL,\n` +
                  `    password_hash VARCHAR(255) NOT NULL,\n` +
                  `    full_name VARCHAR(150) NOT NULL,\n` +
                  `    role VARCHAR(50) CHECK(role IN ('admin', 'staff', 'student')) DEFAULT 'student',\n` +
                  `    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n` +
                  `);\n\n` +
                  `CREATE TABLE IF NOT EXISTS records (\n` +
                  `    record_id INTEGER PRIMARY KEY AUTOINCREMENT,\n` +
                  `    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,\n` +
                  `    title VARCHAR(255) NOT NULL,\n` +
                  `    description TEXT,\n` +
                  `    status VARCHAR(50) DEFAULT 'active',\n` +
                  `    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n` +
                  `);\n\n` +
                  `CREATE INDEX IF NOT EXISTS idx_records_user ON records(user_id);\n`,
            font: "Courier New",
            size: 18,
          }),
        ],
      })
    );

    // Build Word Document with Standard Page Setup
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                bottom: 1440, // 1 inch
                left: 2160, // 1.5 inches (binding margin for African university dissertations)
                right: 1440, // 1 inch
              },
            },
          },
          children: docChildren,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    // Auto-archive the project record
    try {
      if (creditCheck.userId) {
        await autoArchiveProject({
          userId: creditCheck.userId,
          toolId: "thesis",
          title: topic,
          course,
          institution,
          summary: `5-Chapter Academic Dissertation for ${topic}`,
          fileType: "docx",
        });
      }
    } catch (e) {
      console.warn("Auto archive error:", e);
    }

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Thesis_${topic.replace(/[^a-zA-Z0-9]/g, "_")}.docx"`,
      },
    });
  } catch (error: any) {
    console.error("Generate thesis docx error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate thesis document" }, { status: 500 });
  }
}

// Fallback topic-adaptive academic chapter generator
function generateDynamicChapterText(topic: string, course: string, institution: string, caseStudy: string, ch: number): string {
  if (ch === 1) {
    return `# CHAPTER ONE: INTRODUCTION

## 1.1 Background of the Study
The evolution and rapid adoption of Information and Communication Technology (ICT) has fundamentally reshaped contemporary administrative, operational, and scholastic frameworks within tertiary educational institutions worldwide. In the Nigerian context, universities such as ${institution} are tasked with managing complex organizational workflows spanning student records, service logistics, and decision support under increasing operational scale. Historically, these processes were mediated through manual, paper-based workflows that imposed severe operational friction, high error rates, data loss, and administrative delays.

This research dissertation focuses on the Design and Implementation of ${topic} for ${caseStudy}. By integrating modern software engineering paradigms—including decoupled client-server architectures, relational database management systems, and automated validation logic—the research delivers an efficient, secure, and verifiable platform capable of overcoming the structural limitations of legacy procedures.

## 1.2 Statement of the Problem
Operational procedures at ${caseStudy} confront significant bottlenecks when managed through traditional manual or fragmented spreadsheet methods. The primary challenges identified include:
- Administrative Latency: High turnaround times for processing student and organizational transactions, creating substantial operational backlog.
- Human Error and Inconsistency: Manual transcription errors, misplaced files, and data entry discrepancies that undermine institutional record integrity.
- Data Redundancy and Concurrency Collisions: Disconnected records maintained across disparate physical offices leading to conflicting entries.
- Lack of Real-Time Auditability and Transparency: The absence of automated audit logging makes tracking operational history difficult and breeds administrative opacity.

## 1.3 Aim and Objectives of the Study
### 1.3.1 Aim
The overarching aim of this study is to design, develop, test, and empirically evaluate a turnkey, automated software system for ${topic} at ${caseStudy}, ${institution}.

### 1.3.2 Objectives
To accomplish this aim, the study pursues the following five specific objectives:
1. To examine and evaluate the operational workflows and limitations of the existing manual system at ${caseStudy}.
2. To identify the structural bottlenecks, error frequencies, and security vulnerabilities inherent in current procedures.
3. To design a decoupled 3-tier software architecture and normalized relational database schema for ${topic}.
4. To implement the software modules using modern development environments, ensuring ACID transaction guarantees.
5. To test, evaluate, and benchmark the developed platform through empirical unit tests, stress analysis, and User Acceptance Testing (UAT).

## 1.4 Significance of the Study
This study contributes significantly across several institutional and academic domains:
- For Students and Users: Provides 24/7 self-service accessibility, immediate feedback on requests, and eliminates physical queues.
- For Administrators: Automates record generation, minimizes clerical burden, and delivers real-time analytical dashboards.
- For Management: Enhances institutional transparency, prevents fraud, and supports data-driven policy planning.
- For Academic Research: Establishes a reproducible engineering reference model for tertiary institution software systems.

## 1.5 Scope of the Study
The scope of this project encompasses requirements engineering, architectural design, database modeling, software implementation, and empirical evaluation for ${topic} within ${caseStudy} at ${institution}. The system provides user authentication, operational data entry, automated validation, administrative reporting, and audit trail tracking.

## 1.6 Limitations of the Study
1. Time constraints associated with completing development within the academic session calendar.
2. Financial constraints limiting large-scale enterprise server infrastructure deployment.
3. Access constraints regarding sensitive historical institutional data.
4. Technical dependencies on network connectivity and power infrastructure during testing.

## 1.7 Assumptions of the Study
1. End-users possess basic digital literacy and access to standard computing devices.
2. System administrators will maintain role-based access permissions and security protocols.
3. The host institution will provide the server infrastructure required for deployment.
4. Input data supplied by candidates during registration is accurate and authentic.
5. The relational database will operate without catastrophic hardware storage failure.

## 1.8 Methodology
This project adopts the Agile Prototyping methodology within the Software Development Life Cycle (SDLC). Requirements were gathered through structured interviews with administrative personnel and surveys administered to prospective end-users. The development proceeded through iterative sprints: architectural design, database modeling, module coding, and continuous testing.

## 1.9 Organization of the Study
This dissertation is organized into five structured chapters:
- Chapter One introduces the background, statement of the problem, aim, objectives, and scope.
- Chapter Two presents the theoretical framework, conceptual review, and related literature.
- Chapter Three details the system analysis, design methodology, UML diagrams, and database schema.
- Chapter Four documents the implementation walkthrough, development environment, and testing results.
- Chapter Five concludes with a summary of findings, contributions to knowledge, and recommendations.

## 1.10 Definition of Terms
- ACID Properties: Atomicity, Consistency, Isolation, and Durability guarantees in relational databases.
- Concurrency Control: Coordination of simultaneous transactions to prevent data collisions.
- Role-Based Access Control (RBAC): Restricting system access based on authenticated user roles.
- Software Development Life Cycle (SDLC): The systematic framework for engineering software systems.`;
  } else if (ch === 2) {
    return `# CHAPTER TWO: LITERATURE REVIEW

## 2.1 Introduction
This chapter provides an exhaustive review of literature relevant to ${topic}. It establishes the conceptual foundation, evaluates underpinning theoretical frameworks, critiques existing empirical systems, and articulates the research gap addressed by this study.

## 2.2 Conceptual Review
Automated information systems represent the intersection of computational hardware, software engineering, and human processes designed to capture, store, manipulate, and disseminate data to support operational execution and strategic decision-making (Laudon & Laudon, 2024). Within higher education in developing nations, transitioning from physical ledgers to centralized digital architectures has consistently demonstrated reductions in operational overhead, elimination of data loss, and enhanced service delivery.

## 2.3 Theoretical Framework
This research is anchored upon three foundational theories:
1. Technology Acceptance Model (TAM): Formulated by Davis (1989), TAM posits that perceived usefulness (PU) and perceived ease of use (PEOU) are primary determinants of whether end-users embrace new digital software.
2. Relational Database Theory: Formulated by Edgar F. Codd (1970), establishing mathematical normalization (1NF through 3NF) to eliminate insertion, update, and deletion anomalies.
3. Queuing and Concurrency Theory: Mathematical analysis of concurrent user transactions to ensure zero race conditions under peak operational load.

## 2.4 Review of Modern Technological Frameworks
The technical realization of ${topic} requires evaluating suitable development stacks:
- Programming Languages: Python was selected for its high expressive power, rich standard library, and robust web server frameworks.
- Database Engines: SQLite and PostgreSQL provide ACID compliance, foreign key integrity, and sub-millisecond query execution.
- Web Architectures: Decoupled 3-tier architectures separate presentation from business logic, ensuring horizontal maintainability.

## 2.5 Review of Related Works
1. Adebayo and Eze (2022) developed an automated portal for Nigerian universities, achieving an 82% reduction in registration latency, but noted vulnerabilities in concurrency handling during enrollment peaks.
2. Mohammed et al. (2023) designed a campus administration framework utilizing PHP and MySQL, highlighting usability gains but identifying weaknesses in offline execution capability.
3. Williams and Bello (2024) investigated transactional integrity in higher education portals, establishing that row-level locking eliminates multi-user record collisions.
4. Ahmadu and Ibrahim (2023) evaluated normalized database schemas for student services, reporting a 99.8% reduction in data redundancy.

## 2.6 Limitations of Existing Systems
- Vulnerability to race conditions during simultaneous user access.
- Excessive dependence on complex external software dependencies.
- Inadequate role-based security and audit trail logging.
- Poor ergonomic design leading to low user satisfaction scores.

## 2.7 Research Gap
While existing literature explores general institutional automation, few systems combine zero-configuration offline execution, strict row-level transaction safety, and comprehensive audit telemetry tailored for Nigerian tertiary institutions. This project directly addresses this gap.

## 2.8 Summary of Literature Review
The review of literature confirms that computerized information systems provide superior efficiency, data integrity, and user satisfaction compared to manual workflows. Grounded in TAM and Relational Database Theory, this research implements an optimized architecture for ${topic}.`;
  } else if (ch === 3) {
    return `# CHAPTER THREE: SYSTEM ANALYSIS AND DESIGN

## 3.1 Introduction
This chapter details the analysis of the current operational procedures, system requirements, architectural modeling, database design, and algorithmic workflows for ${topic}.

## 3.2 Analysis of the Existing System
The existing system at ${caseStudy} relies upon manual paperwork, physical verification queues, and decentralized spreadsheet logs. When a user initiates a transaction, staff must cross-examine physical ledgers, manually issue receipts, and physically file documents.
### 3.2.1 Problems of the Existing System
- High transactional latency requiring several business days to conclude basic requests.
- Susceptibility to human errors, lost application dockets, and transcription mistakes.
- Complete absence of real-time concurrency control during peak registration rushes.

## 3.3 Analysis of the Proposed System
The proposed system automates the entire lifecycle of ${topic}. Users authenticate digitally, submit parameters, receive immediate algorithmic validation, and generate verifiable electronic dockets.

## 3.4 Objectives of the Proposed System
- Reduce transactional processing latency from multiple business days to under two minutes.
- Maintain 100% data integrity with zero duplicate record collisions.
- Provide administrative dashboards with real-time operational telemetry.

## 3.5 System Development Methodology
The study adopted the Agile Scrum methodology, organizing development into 2-week sprints comprising requirements refinement, database schema design, UI implementation, and continuous testing.

## 3.6 Feasibility Study
- Technical Feasibility: The Python runtime, SQLite engine, and HTML5 interfaces operate seamlessly across existing institutional hardware.
- Economic Feasibility: Developed using open-source tools with zero commercial licensing costs, ensuring high return on investment.
- Operational Feasibility: Intuitive user interfaces require minimal onboarding, ensuring enthusiastic user adoption.

## 3.7 System Architecture
The system adopts a decoupled 3-tier architecture:
1. Presentation Layer: Responsive HTML5, Tailwind CSS, and client-side JavaScript.
2. Business Logic Layer: Python HTTP API coordinating transaction validation, security checks, and routing.
3. Database Layer: Relational DBMS enforcing primary/foreign key constraints and ACID isolation.

## 3.8 Data Flow Analysis & Models
- Context Diagram: Illustrates the high-level boundary between external actors (Students, Staff, Administrators) and the centralized core system.
- Level-1 Data Flow Diagram: Traces data flows across Authentication, Application Processing, Record Validation, and Report Generation.

## 3.9 Database Design & Data Dictionary
### Table 3.1: Users Entity Structure
| Field Name | Data Type | Size | Constraint | Description |
|---|---|---|---|---|
| user_id | INTEGER | - | PRIMARY KEY | Unique user identifier |
| username | VARCHAR | 50 | UNIQUE, NOT NULL | Authentication username |
| password_hash | VARCHAR | 255 | NOT NULL | BCrypt hashed password |
| full_name | VARCHAR | 100 | NOT NULL | Full name of user |
| role | VARCHAR | 20 | NOT NULL | User role (admin/user) |
| created_at | TIMESTAMP | - | DEFAULT CURRENT | Registration timestamp |

### Table 3.2: Primary Operational Records Structure
| Field Name | Data Type | Size | Constraint | Description |
|---|---|---|---|---|
| record_id | INTEGER | - | PRIMARY KEY | Unique record identifier |
| user_id | INTEGER | - | FOREIGN KEY | Associated user ID |
| title | VARCHAR | 150 | NOT NULL | Operational request title |
| category | VARCHAR | 50 | DEFAULT 'general' | Categorical classification |
| status | VARCHAR | 25 | DEFAULT 'active' | Transactional status |
| updated_at | TIMESTAMP | - | DEFAULT CURRENT | Last modification date |

## 3.10 System Flowchart & Algorithm Logic
The core algorithm executes input validation, queries the relational database for conflict detection, acquires row-level locks, commits the transactional update, and issues digital confirmation.`;
  } else if (ch === 4) {
    return `# CHAPTER FOUR: SYSTEM IMPLEMENTATION AND EVALUATION

## 4.1 Introduction
This chapter presents the implementation walkthrough, development environment specifications, testing protocols, and empirical evaluation metrics for ${topic}.

## 4.2 System Development Environment
### Hardware Specifications:
- Processor: Intel Core i5 / AMD Ryzen 5 (2.5 GHz or higher)
- Memory: 8 GB DDR4 RAM
- Storage: 256 GB Solid State Drive (SSD)
### Software Specifications:
- Operating System: Microsoft Windows 10/11 / Ubuntu Linux 22.04 LTS
- Programming Language: Python 3.9+
- Database Engine: SQLite 3 / PostgreSQL 15
- Development Tools: Visual Studio Code, Git

## 4.3 System Implementation Architecture
The platform was implemented using modular design patterns. Core subsystems include the cryptographic authentication handler, the transactional operational engine, the administrative management console, and the automated reporting module.

## 4.4 Database Implementation
The database schema was generated using structured SQL DDL scripts. Relational integrity constraints, unique indexes, and foreign key cascades were verified to ensure zero orphaned records.

## 4.5 Description of System Modules
1. Authentication Module: Enforces secure credential validation, session handling, and role-based permissions.
2. Operational Core Module: Handles user submissions, validation checks, and automatic record generation.
3. Administrative Control Console: Allows authorized personnel to oversee system activities, approve requests, and monitor logs.
4. Reporting & Analytics Module: Compiles operational metrics into printable rosters and summary tables.

## 4.6 User Interface Design
- Home / Authentication Screen: Clean login portal with credential inputs and validation feedback.
- Dashboard Interface: Presents active records, status indicators, and one-click action buttons.
- Administrative Telemetry Portal: Interactive charts and management tables summarizing organizational metrics.

## 4.7 Testing of the System
System quality assurance encompassed Unit Testing, Integration Testing, and System Stress Testing.

## 4.8 Test Cases and Results
### Table 4.1: Test Execution Matrix
| Test ID | Module Tested | Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-01 | User Authentication | Valid credentials | Grant access to dashboard | Access granted | PASS |
| TC-02 | User Authentication | Invalid password | Display error notification | Error displayed | PASS |
| TC-03 | Record Submission | Complete valid form | Insert row, return 200 OK | Row inserted | PASS |
| TC-04 | Duplicate Prevention | Existing unique key | Reject duplicate with 409 | Duplicate rejected | PASS |
| TC-05 | Report Generation | Date range filter | Output filtered dataset | Dataset generated | PASS |

## 4.9 Results Obtained & Empirical Metrics
Stress benchmarking simulating 500 simultaneous user requests recorded an average transaction latency of 38.4 ms with 0.00% data collision errors. User Acceptance Testing (UAT) conducted with 50 participants yielded an average System Usability Scale (SUS) score of 88.5 out of 100.

## 4.10 Discussion of Results
Empirical findings confirm that the automated system significantly outperforms legacy manual methods, reducing request clearance times by over 92% and eliminating human transcription errors.

## 4.11 Advantages of the Developed System
- Sub-second transaction response times.
- Zero duplicate record errors under concurrent usage.
- High usability requiring minimal user training.

## 4.12 Limitations of the Developed System
- Requires computing devices with modern web browsers.
- Dependent on stable institutional electrical power supply.

## 4.13 Summary of Implementation
The implementation and testing verified that the developed software fulfills all functional and non-functional requirements specified in Chapter Three.`;
  } else {
    return `# CHAPTER FIVE: SUMMARY, CONCLUSIONS AND RECOMMENDATIONS

## 5.1 Introduction
This concluding chapter summarizes the achievements of the research, states definitive conclusions, highlights contributions to knowledge, and offers actionable recommendations.

## 5.2 Summary of the Project
This research dissertation designed, developed, tested, and empirically evaluated an automated system for ${topic} at ${caseStudy}, ${institution}. Grounded in Agile methodology and Relational Database Theory, the platform replaces prone manual paperwork with a decoupled 3-tier architecture ensuring ACID transactional safety.

## 5.3 Summary of Findings
1. The automated platform reduces request processing time from multiple days to under two minutes.
2. Relational database constraints and automated validation completely eliminate duplicate records.
3. Centralized digital persistence enables instant generation of administrative reports and audit logs.
4. User Acceptance Testing confirmed high satisfaction with a System Usability Scale (SUS) score of 88.5/100.

## 5.4 Conclusions
The research successfully accomplished all stated aim and specific objectives. The developed software provides an efficient, reliable, and transparent platform that overcomes the operational bottlenecks of manual methods. It is concluded that automating ${topic} substantially enhances institutional productivity and service delivery.

## 5.5 Contributions to Knowledge
- Theoretical Contribution: Demonstrates the practical integration of Relational Database Theory and TAM in Nigerian tertiary institutional workflows.
- Technical Contribution: Engineered a turnkey, zero-dependency Python + SQLite architecture ensuring high-performance transactional execution.
- Institutional Contribution: Delivered a ready-to-deploy operational platform for ${caseStudy} that eliminates registration queues and transcription errors.

## 5.6 Recommendations
### 5.6.1 Recommendations for the Tertiary Institution
- Fully integrate the developed software into the central university information technology infrastructure.
- Provide modern computing terminals and continuous electrical power backup in administrative offices.
### 5.6.2 Recommendations for System Administrators
- Enforce strict database backup schedules to safeguard institutional data against storage failures.
- Conduct regular user access reviews to maintain role-based security integrity.
### 5.6.3 Recommendations for Future Research
- Future researchers can extend the architecture to include native mobile applications with biometric multi-factor authentication.
- Machine learning models can be incorporated for predictive resource allocation and anomaly detection.`;
  }
}
