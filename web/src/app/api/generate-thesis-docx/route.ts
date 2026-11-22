import { NextRequest, NextResponse } from "next/server";
import { authorizeAndDeductCredits, autoArchiveProject } from "@/lib/credits";
import { generateAcademicAI, buildChapterUserPrompt } from "@/lib/ai";
import { generateDynamicChapterText } from "@/lib/academic-chapters";
import {
  convertLatexFormula,
  sanitizeAcademicTextMath,
  isMathEquation,
  extractCleanEquation,
} from "@/lib/mathConverter";
import {
  getArchitectureSvg,
  getUseCaseSvg,
  getErdSvg,
  getLoginScreenshotSvg,
  getDashboardScreenshotSvg,
  renderSvgToPngBuffer,
} from "@/lib/academic-diagrams";
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
  ImageRun,
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
      const status = !creditCheck.userId ? 401 : 402;
      return NextResponse.json(
        { error: creditCheck.errorMessage, cost: creditCheck.cost, remainingCredits: creditCheck.remainingCredits },
        { status }
      );
    }

    const docChildren: (Paragraph | Table)[] = [];

    // --- Helper Functions for Academic Typography (NUC / APA Format) ---
    const parseInlineMarkdownToRuns = (text: string): TextRun[] => {
      // First convert any inline LaTeX equations into clean academic math notation
      const cleanMathText = sanitizeAcademicTextMath(text);
      // Clean leading markdown hashes or stray backticks
      const cleanText = cleanMathText.replace(/^#+\s*/, "").trim();
      const runs: TextRun[] = [];

      // Tokenize by inline markdown markers: ***bold italic***, **bold**, *italic*, `code`
      const tokenRegex = /(\*\*\*[^*]+?\*\*\*|___[^_]+?___|\*\*[^*]+?\*\*|__[^_]+?__|\*[^*]+?\*|_[^_]+?_|`[^`]+?`)/g;
      const parts = cleanText.split(tokenRegex);

      for (const part of parts) {
        if (!part) continue;

        if ((part.startsWith("***") && part.endsWith("***")) || (part.startsWith("___") && part.endsWith("___"))) {
          const content = part.slice(3, -3).replace(/[*_#`]/g, "").trim();
          runs.push(
            new TextRun({
              text: content,
              bold: true,
              italics: true,
              size: 24, // 12pt
              font: "Times New Roman",
              color: "111827",
            })
          );
        } else if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
          const content = part.slice(2, -2).replace(/[*_#`]/g, "").trim();
          runs.push(
            new TextRun({
              text: content,
              bold: true,
              size: 24, // 12pt
              font: "Times New Roman",
              color: "000000",
            })
          );
        } else if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
          const content = part.slice(1, -1).replace(/[*_#`]/g, "").trim();
          runs.push(
            new TextRun({
              text: content,
              italics: true,
              size: 24, // 12pt
              font: "Times New Roman",
              color: "111827",
            })
          );
        } else if (part.startsWith("`") && part.endsWith("`")) {
          const content = part.slice(1, -1).trim();
          runs.push(
            new TextRun({
              text: content,
              font: "Courier New",
              size: 20, // 10pt
              color: "1E40AF",
            })
          );
        } else {
          // Normal prose: strip any stray unclosed asterisks, hashes, or underscores
          const sanitized = part.replace(/[*#_`]/g, "");
          if (sanitized) {
            runs.push(
              new TextRun({
                text: sanitized,
                size: 24, // 12pt
                font: "Times New Roman",
                color: "111827",
              })
            );
          }
        }
      }

      if (runs.length === 0) {
        runs.push(
          new TextRun({
            text: cleanText.replace(/[*#_`]/g, ""),
            size: 24,
            font: "Times New Roman",
            color: "111827",
          })
        );
      }

      return runs;
    };

    const academicPara = (text: string, indent = true, lineSpacing = 360) =>
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: indent ? { firstLine: 720 } : undefined, // 0.5 inch first line indent
        spacing: { before: 100, after: 120, line: lineSpacing }, // 1.5 line spacing
        children: parseInlineMarkdownToRuns(text),
      });

    let equationCounter = 1;
    const academicEquation = (rawMath: string, chapterNum = 3) => {
      const { formula, label } = extractCleanEquation(rawMath, `(Eq. ${chapterNum}.${equationCounter++})`);
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200, line: 360 },
        children: [
          new TextRun({
            text: `        ${formula}        `,
            italics: true,
            bold: true,
            size: 26, // 13pt
            font: "Times New Roman",
            color: "0B132B",
          }),
          new TextRun({
            text: `    ${label}`,
            bold: true,
            size: 22, // 11pt
            font: "Times New Roman",
            color: "475569",
          }),
        ],
      });
    };

    const academicHeading1 = (title: string, subtitle?: string) => {
      const cleanTitle = title.replace(/^#+\s*/, "").replace(/[*_#`]/g, "").trim();
      const cleanSubtitle = subtitle ? subtitle.replace(/^#+\s*/, "").replace(/[*_#`]/g, "").trim() : undefined;
      return [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 150 },
          children: [
            new TextRun({
              text: cleanTitle.toUpperCase(),
              bold: true,
              size: 28, // 14pt
              font: "Times New Roman",
              color: "000000",
            }),
          ],
        }),
        ...(cleanSubtitle
          ? [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
                children: [
                  new TextRun({
                    text: cleanSubtitle.toUpperCase(),
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
    };

    const academicHeading2 = (title: string) => {
      const cleanTitle = title.replace(/^#+\s*/, "").replace(/[*_#`]/g, "").trim();
      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 120 },
        children: [
          new TextRun({
            text: cleanTitle,
            bold: true,
            size: 26, // 13pt
            font: "Times New Roman",
            color: "000000",
          }),
        ],
      });
    };

    const academicHeading3 = (title: string) => {
      const cleanTitle = title.replace(/^#+\s*/, "").replace(/[*_#`]/g, "").trim();
      return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: cleanTitle,
            bold: true,
            italics: true,
            size: 24, // 12pt
            font: "Times New Roman",
            color: "1F2937",
          }),
        ],
      });
    };

    const academicBullet = (title: string, bodyText: string) => {
      const cleanTitle = title.replace(/^#+\s*/, "").replace(/[*_#`]/g, "").trim();
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        bullet: { level: 0 },
        spacing: { before: 60, after: 80, line: 360 },
        children: [
          new TextRun({
            text: `${cleanTitle}: `,
            bold: true,
            size: 24,
            font: "Times New Roman",
            color: "000000",
          }),
          ...parseInlineMarkdownToRuns(bodyText),
        ],
      });
    };

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
                          text: cellText.replace(/[*_#`]/g, "").trim(),
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

        const cleanNoMd = line.replace(/^#+\s*/, "").replace(/[*_#`]/g, "").trim();

        // 1. Heading 1: starts with "# " (H1) or CHAPTER 1/ONE..FIVE (with optional colon/dash)
        // or major preliminary/postliminary division titles
        const isChapterRegex = /^(CHAPTER\s+(ONE|TWO|THREE|FOUR|FIVE|[1-5]))\b/i;
        const isPrelimH1Regex = /^(DEDICATION|CERTIFICATION|DECLARATION|ACKNOWLEDGEMENT|ACKNOWLEDGEMENTS|ABSTRACT|TABLE OF CONTENTS|LIST OF TABLES|LIST OF FIGURES|REFERENCES|BIBLIOGRAPHY|APPENDIX\s+[A-Z0-9])\b/i;
        const isMarkdownH1 = /^#\s+/.test(line) && !/^###?/.test(line);

        if (isChapterRegex.test(cleanNoMd) || isPrelimH1Regex.test(cleanNoMd) || isMarkdownH1) {
          let fullTitle = cleanNoMd;
          // If the line is just "CHAPTER 1" or "CHAPTER ONE" without a subtitle, check if next line is the subtitle
          if (isChapterRegex.test(cleanNoMd) && !cleanNoMd.includes(":") && !cleanNoMd.includes("-") && i + 1 < lines.length) {
            const nextCandidate = lines[i + 1].replace(/^#+\s*/, "").replace(/[*_#`]/g, "").trim();
            if (nextCandidate && !/^\d+\.\d+/.test(nextCandidate) && !/^[-*+]/.test(nextCandidate) && nextCandidate.length < 80) {
              fullTitle = `${cleanNoMd}: ${nextCandidate}`;
              i++; // consume next line
            }
          }
          elements.push(...academicHeading1(fullTitle));
          continue;
        }

        // 2. Heading 3: starts with "### " or numbered like "1.3.1 Aim" (checked before H2 so 1.3.1 is not caught by 1.3)
        const isH3Markdown = /^###\s+/.test(line);
        const isH3Number = /^(\d+\.\d+\.\d+)[\s:.\-–—]/.test(cleanNoMd) || /^(\d+\.\d+\.\d+)$/.test(cleanNoMd);
        if (isH3Markdown || (isH3Number && cleanNoMd.length < 130)) {
          elements.push(academicHeading3(cleanNoMd));
          continue;
        }

        // 3. Heading 2: starts with "## " or numbered like "1.1 Background" or "1.10 Definition"
        const isH2Markdown = /^##\s+/.test(line);
        const isH2Number = /^(\d+\.\d+)[\s:.\-–—]/.test(cleanNoMd) || /^(\d+\.\d+)$/.test(cleanNoMd);
        if (isH2Markdown || (isH2Number && cleanNoMd.length < 130)) {
          elements.push(academicHeading2(cleanNoMd));
          continue;
        }

        // 4. Bullet lists: starts with "- ", "* ", "+ "
        if (/^[-*+]\s+/.test(line)) {
          const bulletRaw = line.replace(/^[-*+]\s+/, "").trim();
          const colonMatch = bulletRaw.match(/^(\*{0,2}[A-Za-z0-9\s/&-]{2,50}\*{0,2}):\s*(.*)$/);
          if (colonMatch) {
            elements.push(academicBullet(colonMatch[1], colonMatch[2]));
          } else {
            elements.push(
              new Paragraph({
                bullet: { level: 0 },
                alignment: AlignmentType.JUSTIFIED,
                spacing: { before: 60, after: 80, line: 360 },
                children: parseInlineMarkdownToRuns(bulletRaw),
              })
            );
          }
          continue;
        }

        // 5. Numbered list: starts with "1. ", "2. "
        if (/^\d+\.\s+/.test(line)) {
          const numMatch = line.match(/^(\d+\.)\s+(.*)$/);
          if (numMatch) {
            elements.push(
              new Paragraph({
                alignment: AlignmentType.JUSTIFIED,
                indent: { left: 720, hanging: 360 },
                spacing: { before: 60, after: 80, line: 360 },
                children: [
                  new TextRun({ text: `${numMatch[1]} `, bold: true, size: 24, font: "Times New Roman" }),
                  ...parseInlineMarkdownToRuns(numMatch[2]),
                ],
              })
            );
            continue;
          }
        }

        // 5b. Mathematical Equation: starts with "$$", "\[", or "[EQUATION:" or is a math equation
        if (isMathEquation(line)) {
          elements.push(academicEquation(line, 3));
          continue;
        }

        // 6. Normal paragraph with inline markdown parsed into TextRuns and stripped of asterisks/hashes
        elements.push(academicPara(line));
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

    // Helper to format an academic figure with centered image and APA caption
    const createFigureParagraph = (pngBuffer: Buffer, caption: string, source: string = "Field Study (2026)") => {
      return [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: pngBuffer,
              type: "png",
              transformation: {
                width: 580,
                height: 330,
              },
            }),
          ],
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: caption,
              bold: true,
              size: 20, // 10pt
              font: "Times New Roman",
              color: "1e293b",
            }),
          ],
          spacing: { before: 60, after: 40 },
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `Source: ${source}`,
              italics: true,
              size: 18, // 9pt
              font: "Times New Roman",
              color: "64748b",
            }),
          ],
          spacing: { before: 0, after: 240 },
        }),
      ];
    };

    // Helper to append Chapter 3 and Chapter 4 diagrams & screenshots
    const appendChapterVisuals = async (chNum: number) => {
      if (chNum === 3) {
        try {
          const archPng = await renderSvgToPngBuffer(getArchitectureSvg(topic, course));
          const useCasePng = await renderSvgToPngBuffer(getUseCaseSvg(topic));
          const erdPng = await renderSvgToPngBuffer(getErdSvg(topic));

          docChildren.push(
            ...createFigureParagraph(archPng, `Figure 3.1: High-Level Three-Tier Architecture of the Proposed System`),
            ...createFigureParagraph(useCasePng, `Figure 3.2: UML Use Case Diagram for User and Administrative Roles`),
            ...createFigureParagraph(erdPng, `Figure 3.3: Third Normal Form (3NF) Relational Database Schema`)
          );
        } catch (diagErr) {
          console.warn("Failed to embed Chapter 3 vector diagrams:", diagErr);
        }
      } else if (chNum === 4) {
        try {
          const loginPng = await renderSvgToPngBuffer(getLoginScreenshotSvg(topic));
          const dashPng = await renderSvgToPngBuffer(getDashboardScreenshotSvg(topic));

          docChildren.push(
            ...createFigureParagraph(loginPng, `Figure 4.1: Secure Role-Based Authentication Interface`),
            ...createFigureParagraph(dashPng, `Figure 4.2: Administrator Central Operational Telemetry Dashboard`)
          );
        } catch (diagErr) {
          console.warn("Failed to embed Chapter 4 software screenshots:", diagErr);
        }
      }
    };

    // =========================================================================
    // 8. SYNTHESIZE CHAPTERS 1 THROUGH 5
    // =========================================================================
    for (let ch = 1; ch <= 5; ch++) {
      // Check if user already generated this chapter on frontend
      // If it exists AND is sufficiently long (not a 2-sentence stub!), use it
      const userChapterText = userChapters[ch];
      if (userChapterText && userChapterText.trim().length >= 800) {
        docChildren.push(...parseMarkdownToDocx(userChapterText));
        await appendChapterVisuals(ch);
        docChildren.push(new Paragraph({ children: [new PageBreak()] }));
        continue;
      }

      // If not generated or if userText is too short, synthesize dynamically with Groq AI Pool or dynamic generator
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
          maxTokens: 4000,
          preferredProvider: "groq",
        });

        if (aiRes && aiRes.content && aiRes.content.length > 800 && !aiRes.content.includes("codethesis-academic-heuristic")) {
          chapterMarkdown = aiRes.content;
        }
      } catch (err) {
        console.warn(`AI synthesis for Chapter ${ch} fallback to dynamic generator:`, err);
      }

      // If AI did not return complete text or failed, use our comprehensive topic-tailored generator
      if (!chapterMarkdown || chapterMarkdown.length < 800) {
        chapterMarkdown = generateDynamicChapterText(topic, course, institution, caseStudy, ch);
      }

      docChildren.push(...parseMarkdownToDocx(chapterMarkdown));
      await appendChapterVisuals(ch);
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

    // Build Word Document with Standard Page Setup and Native Word Heading Styles
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Times New Roman",
              size: 24, // 12pt default body
              color: "111827",
            },
            paragraph: {
              spacing: { line: 360 }, // 1.5 line spacing
            },
          },
          heading1: {
            run: {
              font: "Times New Roman",
              size: 28, // 14pt
              bold: true,
              color: "000000",
            },
            paragraph: {
              spacing: { before: 400, after: 200 },
              alignment: AlignmentType.CENTER,
            },
          },
          heading2: {
            run: {
              font: "Times New Roman",
              size: 26, // 13pt
              bold: true,
              color: "000000",
            },
            paragraph: {
              spacing: { before: 280, after: 120 },
              alignment: AlignmentType.LEFT,
            },
          },
          heading3: {
            run: {
              font: "Times New Roman",
              size: 24, // 12pt
              bold: true,
              italics: true,
              color: "111827",
            },
            paragraph: {
              spacing: { before: 200, after: 80 },
              alignment: AlignmentType.LEFT,
            },
          },
        },
        paragraphStyles: [
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              font: "Times New Roman",
              size: 28, // 14pt
              bold: true,
              color: "000000",
            },
            paragraph: {
              spacing: { before: 400, after: 200 },
              alignment: AlignmentType.CENTER,
            },
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              font: "Times New Roman",
              size: 26, // 13pt
              bold: true,
              color: "000000",
            },
            paragraph: {
              spacing: { before: 280, after: 120 },
              alignment: AlignmentType.LEFT,
            },
          },
          {
            id: "Heading3",
            name: "Heading 3",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              font: "Times New Roman",
              size: 24, // 12pt
              bold: true,
              italics: true,
              color: "111827",
            },
            paragraph: {
              spacing: { before: 200, after: 80 },
              alignment: AlignmentType.LEFT,
            },
          },
        ],
      },
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
