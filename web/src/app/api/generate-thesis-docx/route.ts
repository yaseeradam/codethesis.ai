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
  getContextDiagramSvg,
  getFlowchartSvg,
  getLoginScreenshotSvg,
  getDashboardScreenshotSvg,
  getAdminAuditScreenshotSvg,
  getTestingResultsSvg,
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
  PositionalTab,
  PositionalTabAlignment,
  PositionalTabLeader,
  PositionalTabRelativeTo,
} from "docx";
import {
  extractDomainFromTopic,
  cleanThesisTopicTitle,
  stripTrailingReferences,
  getDomainTailoredCodeAndDdl,
  getDomainReferences,
} from "@/lib/thesisHelpers";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const topic = (body.topic || "Design and Implementation of an Automated System").trim();
    const cleanTopic = cleanThesisTopicTitle(topic) || topic;
    const course = (body.course || body.department || "Computer Science").trim();
    const institution = (body.institution || "Tertiary Educational Institution").trim();
    const caseStudy = (body.caseStudy || "").trim();
    const effectiveCaseStudy = caseStudy || extractDomainFromTopic(topic);
    const studentName = (body.studentName || body.author || "STUDENT CANDIDATE").trim().toUpperCase();
    const matricNumber = (body.matricNumber || body.matricNo || "MATRIC/2026/0001").trim().toUpperCase();
    const supervisor = (body.supervisor && body.supervisor.trim())
      ? body.supervisor.trim()
      : "[Name of Project Supervisor]";
    const session = (body.session || "2025/2026").trim();
    const includeDiagrams = body.includeDiagrams !== false;

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
    const createSignatureTable = (rows: { name: string; title: string; dept?: string; dateLabel?: string }[]) =>
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [6200, 2800],
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        rows: rows.map(r =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 68, type: WidthType.PERCENTAGE },
                margins: { top: 80, bottom: 40, left: 0, right: 60 },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                },
                children: [
                  new Paragraph({
                    spacing: { before: 240, after: 40 },
                    children: [
                      new TextRun({
                        text: "____________________________________",
                        font: "Times New Roman",
                        size: 22,
                        color: "333333",
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { after: 20 },
                    children: [
                      new TextRun({
                        text: r.name,
                        bold: true,
                        font: "Times New Roman",
                        size: 22,
                        color: "000000",
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { after: 20 },
                    children: [
                      new TextRun({
                        text: r.title,
                        font: "Times New Roman",
                        size: 20,
                        italics: true,
                        color: "1F2937",
                      }),
                    ],
                  }),
                  ...(r.dept ? [
                    new Paragraph({
                      spacing: { after: 60 },
                      children: [
                        new TextRun({
                          text: r.dept,
                          font: "Times New Roman",
                          size: 18,
                          color: "4B5563",
                        }),
                      ],
                    }),
                  ] : [
                    new Paragraph({ spacing: { after: 60 }, children: [] }),
                  ]),
                ],
              }),
              new TableCell({
                width: { size: 32, type: WidthType.PERCENTAGE },
                margins: { top: 80, bottom: 40, left: 60, right: 0 },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 240, after: 40 },
                    children: [
                      new TextRun({
                        text: "____________________",
                        font: "Times New Roman",
                        size: 22,
                        color: "333333",
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { after: 20 },
                    children: [
                      new TextRun({
                        text: r.dateLabel || "Date",
                        bold: true,
                        font: "Times New Roman",
                        size: 22,
                        color: "000000",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          })
        ),
      });

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
      createSignatureTable([
        {
          name: `${studentName} (${matricNumber})`,
          title: "Student Researcher",
          dept: `Department of ${course}, ${institution}`,
          dateLabel: "Date of Signature",
        },
      ]),
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
      createSignatureTable([
        {
          name: supervisor,
          title: "Project Supervisor",
        },
        {
          name: "Head of Department",
          title: `Department of ${course}`,
          dept: institution,
        },
        {
          name: "External Examiner",
          title: "Representative, Senate Board of Examiners",
        },
      ]),
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // 4. DEDICATION & ACKNOWLEDGEMENT (Reference: MY PROJECT ORIGINAL.docx)
    // =========================================================================
    const thanksEntity = caseStudy || effectiveCaseStudy;
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
        `Special thanks are extended to the management and administrative officers of ${thanksEntity} who participated in system discovery sessions, user interviews, and provided the operational parameters necessary for testing and evaluating the system.`
      ),
      academicPara(
        "Finally, my heartfelt appreciation goes to my distinguished course colleagues, research collaborators, and lifelong friends for their camaraderie and intellectual stimulation throughout my undergraduate studies."
      ),
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // 5. ABSTRACT (Synthesized uniquely with AI for the specific topic)
    // =========================================================================
    const defaultAbs1 = `This project dissertation presents the design and implementation of an automated, robust technological solution for ${cleanTopic}${caseStudy ? ` with application to ${caseStudy}` : ` (${effectiveCaseStudy})`}, submitted in partial fulfillment of the requirements for the degree of Bachelor of Science in ${course} at ${institution}. In modern operational and enterprise environments, conventional paper-based and legacy manual workflows are inherently susceptible to administrative friction, human transcription errors, operational delays, data redundancy, and a fundamental lack of real-time auditability. These chronic limitations impede decision-making, increase transactional turnaround latency, and compromise data integrity.`;
    const defaultAbs2 = `To resolve these operational bottlenecks, an automated digital framework was developed adopting modern software engineering standards. The system integrates a decoupled presentation interface, a resilient business logic coordinator, and an ACID-compliant relational persistence layer utilizing Python, SQL relational databases, and responsive web technologies. The core engine implements automated constraint satisfaction, structured validation protocols, and comprehensive role-based access control (RBAC) to ensure seamless transaction processing and secure record management.`;
    const defaultAbs3 = `The Software Development Life Cycle (SDLC) methodology was adopted across requirements gathering, system design, architectural modeling, implementation, and empirical testing. Comprehensive multi-tier evaluation was conducted, encompassing unit verification, integration testing, and User Acceptance Testing (UAT). Empirical benchmarking demonstrated a 100% transaction integrity rate under concurrent simulated user requests, with average response latency below 50 milliseconds. The system achieved a System Usability Scale (SUS) score exceeding 88%, representing a significant enhancement in operational efficiency, transparency, and data accessibility compared to legacy procedures.`;

    let abstractParas = [defaultAbs1, defaultAbs2, defaultAbs3];
    try {
      const absRes = await generateAcademicAI({
        prompt: `Write an authoritative, publication-grade 3-paragraph academic dissertation ABSTRACT (300-450 words) for: "${topic}".
Degree-Awarding University: "${institution}"
Course / Department: "${course}"
Operational Case Study: "${effectiveCaseStudy}"

Paragraph 1: Background of the operational domain, specific real-world challenges at ${effectiveCaseStudy}, and the problem statement.
Paragraph 2: The engineering methodology, technical architecture, programming environments, and core features implemented.
Paragraph 3: Empirical evaluation methodology, multi-tier testing results, benchmark latencies, System Usability Scale (SUS) outcome, and institutional impact.
Do NOT use raw markdown symbols (no **, ##). Write 3 clear, distinct scholarly paragraphs.`,
        temperature: 0.78,
        maxTokens: 1200,
        preferredProvider: "gemini",
      });

      if (absRes && absRes.content && absRes.content.length > 400 && !absRes.content.includes("codethesis-academic-heuristic")) {
        const splitParas = absRes.content.split(/\n\s*\n/).map((p: string) => p.replace(/^#+\s*/, "").replace(/[*_#`]/g, "").trim()).filter((p: string) => p.length > 40);
        if (splitParas.length >= 2) {
          abstractParas = splitParas;
        }
      }
    } catch (absErr) {
      console.warn("AI abstract synthesis fallback to domain template:", absErr);
    }

    docChildren.push(
      ...academicHeading1("ABSTRACT"),
      ...abstractParas.map((p: string) => academicPara(p)),
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
            text: `${cleanTopic || topic}, ${effectiveCaseStudy}, Automated System, Relational Database Normalization, Software Architecture, Empirical Evaluation, User Acceptance Testing (UAT).`,
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
    const createListRow = (label: string, page: string) =>
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { before: 80, after: 80, line: 360 },
        children: [
          new TextRun({
            text: label,
            font: "Times New Roman",
            size: 22,
            color: "1F2937",
          }),
          new TextRun({
            children: [
              new PositionalTab({
                alignment: PositionalTabAlignment.RIGHT,
                relativeTo: PositionalTabRelativeTo.MARGIN,
                leader: PositionalTabLeader.DOT,
              }),
            ],
          }),
          new TextRun({
            text: page,
            font: "Times New Roman",
            size: 22,
            bold: true,
            color: "111827",
          }),
        ],
      });

    docChildren.push(
      ...academicHeading1("LIST OF TABLES"),
      createListRow("Table 3.1: Core Primary Data Dictionary Structure", "39"),
      createListRow("Table 3.2: Transaction & Operational Data Dictionary", "40"),
      createListRow("Table 3.3: Hardware Development Environment Specifications", "46"),
      createListRow("Table 3.4: Software Development Environment Specifications", "47"),
      createListRow("Table 4.1: Empirical Test Cases Execution Matrix", "61"),
      createListRow("Table 4.2: System Usability Scale (SUS) Evaluation Metrics", "63")
    );

    if (includeDiagrams) {
      docChildren.push(
        ...academicHeading1("LIST OF FIGURES"),
        createListRow("Figure 3.1: Decoupled 3-Tier System Architecture", "34"),
        createListRow("Figure 3.2: Top-Level Context Analysis Diagram (DFD Level-0)", "36"),
        createListRow("Figure 3.3: UML Use Case Functional Specification", "37"),
        createListRow("Figure 3.4: Third Normal Form (3NF) Relational Database Schema", "38"),
        createListRow("Figure 3.5: Operational Process & Decision Flowchart", "43"),
        createListRow("Figure 4.1: Secure Role-Based Authentication Interface", "55"),
        createListRow("Figure 4.2: Primary Operational Action & Telemetry Dashboard", "56"),
        createListRow("Figure 4.3: Real-Time Event Audit Trail & Telemetry Inspection Interface", "57"),
        createListRow("Figure 4.4: Automated Test Execution Suite & Quality Assurance Pass Matrix", "58")
      );
    }

    docChildren.push(new Paragraph({ children: [new PageBreak()] }));

    // Helper to format an explicit academic screenshot placement guide for students/researchers
    const createScreenshotPlaceholderCallout = (
      figNum: string,
      title: string,
      instructions: string,
      requiredElements: string[]
    ) => {
      return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.DASHED, size: 8, color: "94A3B8" },
          bottom: { style: BorderStyle.DASHED, size: 8, color: "94A3B8" },
          left: { style: BorderStyle.SINGLE, size: 24, color: "2563EB" },
          right: { style: BorderStyle.DASHED, size: 8, color: "94A3B8" },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: "F8FAFC" },
                margins: { top: 140, bottom: 140, left: 180, right: 180 },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                },
                children: [
                  new Paragraph({
                    spacing: { after: 60 },
                    children: [
                      new TextRun({
                        text: `[CANDIDATE IMPLEMENTATION NOTICE: SCREENSHOT INSERTION REQUIRED]`,
                        bold: true,
                        size: 20, // 10pt
                        font: "Times New Roman",
                        color: "1E40AF",
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { after: 60, line: 300 },
                    children: [
                      new TextRun({
                        text: `Figure Target: `,
                        bold: true,
                        size: 22,
                        font: "Times New Roman",
                        color: "0F172A",
                      }),
                      new TextRun({
                        text: `${figNum} — ${title}`,
                        bold: true,
                        size: 22,
                        font: "Times New Roman",
                        color: "2563EB",
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { after: 80, line: 320 },
                    children: [
                      new TextRun({
                        text: `Instructions for Candidate: `,
                        bold: true,
                        size: 20,
                        font: "Times New Roman",
                        color: "334155",
                      }),
                      new TextRun({
                        text: instructions,
                        size: 20,
                        font: "Times New Roman",
                        color: "334155",
                      }),
                    ],
                  }),
                  ...requiredElements.map(
                    (elem) =>
                      new Paragraph({
                        bullet: { level: 0 },
                        spacing: { before: 20, after: 20, line: 280 },
                        children: [
                          new TextRun({
                            text: elem,
                            size: 19,
                            font: "Times New Roman",
                            color: "475569",
                          }),
                        ],
                      })
                  ),
                  new Paragraph({
                    spacing: { before: 80, after: 0 },
                    children: [
                      new TextRun({
                        text: `Notice: The high-resolution vector illustration below acts as your immediate placeholder diagram until your prototype screenshot is pasted.`,
                        italics: true,
                        size: 18,
                        font: "Times New Roman",
                        color: "64748B",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    };

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
      if (!includeDiagrams) return;

      if (chNum === 3) {
        try {
          const archPng = await renderSvgToPngBuffer(getArchitectureSvg(topic, course));
          const contextPng = await renderSvgToPngBuffer(getContextDiagramSvg(topic));
          const useCasePng = await renderSvgToPngBuffer(getUseCaseSvg(topic));
          const erdPng = await renderSvgToPngBuffer(getErdSvg(topic));
          const flowchartPng = await renderSvgToPngBuffer(getFlowchartSvg(topic));

          docChildren.push(
            ...createFigureParagraph(archPng, `Figure 3.1: High-Level Three-Tier Architecture of the Proposed System`),
            ...createFigureParagraph(contextPng, `Figure 3.2: Top-Level Context Analysis Diagram (DFD Level-0)`),
            ...createFigureParagraph(useCasePng, `Figure 3.3: UML Use Case Functional Specification for User and Admin Roles`),
            ...createFigureParagraph(erdPng, `Figure 3.4: Third Normal Form (3NF) Relational Database Schema & Foreign Keys`),
            ...createFigureParagraph(flowchartPng, `Figure 3.5: Operational Process Flowchart & Decision Logic Execution Pipeline`)
          );
        } catch (diagErr) {
          console.warn("Failed to embed Chapter 3 vector diagrams:", diagErr);
        }
      } else if (chNum === 4) {
        try {
          const loginPng = await renderSvgToPngBuffer(getLoginScreenshotSvg(topic));
          const dashPng = await renderSvgToPngBuffer(getDashboardScreenshotSvg(topic));
          const auditPng = await renderSvgToPngBuffer(getAdminAuditScreenshotSvg(topic));
          const testPng = await renderSvgToPngBuffer(getTestingResultsSvg(topic));

          docChildren.push(
            createScreenshotPlaceholderCallout(
              "Figure 4.1",
              "System User Authentication & Access Control Interface",
              "Before your final departmental defense, capture a high-resolution screenshot of your prototype's Login Screen and paste it here in place of or directly above this vector preview:",
              [
                "Ensure username/email and password masked input fields are visible.",
                "Ensure user role selector, authentication submit button, and security status indicator are active.",
                "Capture at 1920x1080 or minimum 300 DPI to avoid blurriness in printed binding.",
              ]
            ),
            ...createFigureParagraph(loginPng, `Figure 4.1: Secure Role-Based Authentication Interface`, "Developed Software Prototype (2026)"),

            createScreenshotPlaceholderCallout(
              "Figure 4.2",
              "Primary Operational Action & Central Telemetry Dashboard",
              "Insert a screenshot of your deployed system's main administrative dashboard or officer command workspace showing active records and telemetry:",
              [
                "Top navigation bar with authenticated officer/operator profile and active database status.",
                "Key performance indicator (KPI) metric cards (e.g. Total Transactions, Active Devices, Security Health).",
                "Primary operational data table with action triggers (Verify, Modify, Approve, Filter).",
              ]
            ),
            ...createFigureParagraph(dashPng, `Figure 4.2: Administrator Central Operational Telemetry & Monitoring Dashboard`, "Developed Software Prototype (2026)"),

            createScreenshotPlaceholderCallout(
              "Figure 4.3",
              "Administrator Telemetry & Event Audit Trail Interface",
              "Capture and paste a screenshot of your prototype's security audit log console demonstrating compliance, event persistence, and tamper-resistance:",
              [
                "Chronological event ledger showing timestamps, operator IDs, event classifications, and station ports.",
                "Security verdict indicators (green for authorized access, red for denied attempts or alarms).",
                "Audit export action controls (e.g. Export CSV / PDF) confirming institutional accountability.",
              ]
            ),
            ...createFigureParagraph(auditPng, `Figure 4.3: Real-Time Event Audit Trail & Telemetry Inspection Interface`, "Developed Software Prototype (2026)"),

            createScreenshotPlaceholderCallout(
              "Figure 4.4",
              "Automated Test Execution Suite & Quality Assurance Pass Matrix",
              "In this verification section, capture an actual screenshot of your IDE, terminal, or test runner (PyTest, Jest, JUnit, Postman, or hardware test bench) confirming test execution:",
              [
                "Terminal prompt executing automated test runner (e.g. 'pytest tests/ -v' or 'npm test').",
                "Complete breakdown of unit and integration test assertions with 100% pass verification.",
                "Response execution benchmarks and latency confirmation (<150ms per test).",
              ]
            ),
            ...createFigureParagraph(testPng, `Figure 4.4: Automated Test Execution Suite & Quality Assurance Pass Matrix`, "Empirical Test Bench Runner (2026)")
          );
        } catch (diagErr) {
          console.warn("Failed to embed Chapter 4 software screenshots:", diagErr);
        }
      }
    };

    // =========================================================================
    // 8. SYNTHESIZE CHAPTERS 1 THROUGH 5 CONCURRENTLY
    // =========================================================================
    const chapterPromises = [1, 2, 3, 4, 5].map(async (ch) => {
      const userChapterText = userChapters[ch];
      if (userChapterText && userChapterText.trim().length >= 800) {
        return { ch, markdown: userChapterText };
      }

      // Synthesize dynamically with Gemini 2.5 Flash
      let chapterMarkdown = "";
      try {
        const aiPrompt = buildChapterUserPrompt({
          topic,
          course,
          institution,
          chapterNumber: ch,
          caseStudy: effectiveCaseStudy,
        });

        const aiRes = await generateAcademicAI({
          prompt: aiPrompt,
          temperature: 0.78,
          maxTokens: 5000,
          preferredProvider: "gemini",
        });

        if (aiRes && aiRes.content && aiRes.content.length > 800 && !aiRes.content.includes("codethesis-academic-heuristic")) {
          chapterMarkdown = aiRes.content;
        }
      } catch (err) {
        console.warn(`AI synthesis for Chapter ${ch} fallback to dynamic generator:`, err);
      }

      // If AI did not return complete text or failed, use our comprehensive domain-adaptive generator
      if (!chapterMarkdown || chapterMarkdown.length < 800) {
        chapterMarkdown = generateDynamicChapterText(topic, course, institution, effectiveCaseStudy, ch);
      }

      return { ch, markdown: chapterMarkdown };
    });

    const chapterResults = await Promise.all(chapterPromises);

    for (const res of chapterResults) {
      const finalChapterMarkdown = res.ch < 5 ? stripTrailingReferences(res.markdown) : res.markdown;
      docChildren.push(...parseMarkdownToDocx(finalChapterMarkdown));
      await appendChapterVisuals(res.ch);
      docChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }

    // =========================================================================
    // 9. REFERENCES (APA 7th Edition - Domain Adapted)
    // =========================================================================
    const domainReferences = getDomainReferences(topic, course);
    docChildren.push(
      ...academicHeading1("REFERENCES"),
      ...domainReferences.map((ref) => academicPara(ref, false)),
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // 10. APPENDICES (Code Listings & Schema - Domain Tailored)
    // =========================================================================
    const { pythonCode, sqlDdl } = getDomainTailoredCodeAndDdl(topic, course, institution, studentName, matricNumber);
    docChildren.push(
      ...academicHeading1("APPENDIX A", "CORE APPLICATION SOURCE CODE"),
      academicPara(`The following Python listing demonstrates the core transactional controller and hardware/software service modules engineered for ${topic}:`, false),
      new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({
            text: pythonCode,
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
            text: sqlDdl,
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
