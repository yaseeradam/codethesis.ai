import { NextRequest, NextResponse } from "next/server";
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, BorderStyle } from "docx";
import { authorizeAndDeductCredits, autoArchiveProject } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      courseCode = "CSC 411",
      courseTitle = "Advanced Algorithms and Complexity",
      lecturer = "Prof. M. B. Sanusi",
      studentName = "Fatima Abubakar",
      matricNo = "U/19/CS/1042",
      institution = "Ahmadu Bello University",
      department = "Department of Computer Science",
      assignmentTitle = "Assignment 1: Database Normalization & Algorithmic Complexity Analysis",
      problemStatement = "",
      steps = [],
      references = []
    } = body;

    // Deduct credits for Assignment Solver
    const creditCheck = await authorizeAndDeductCredits('assignmentSolver');
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: creditCheck.errorMessage, cost: creditCheck.cost, remainingCredits: creditCheck.remainingCredits },
        { status: 402 }
      );
    }

    const sections = [
      // Academic Institution Header
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 60 },
        children: [
          new TextRun({
            text: institution.toUpperCase(),
            bold: true,
            size: 30,
            font: "Times New Roman",
            color: "0B132B",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: department.toUpperCase(),
            bold: true,
            size: 24,
            font: "Times New Roman",
            color: "475569",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: `${courseCode}: ${courseTitle}`,
            bold: true,
            size: 26,
            font: "Times New Roman",
            color: "0284C7",
          }),
        ],
      }),

      // Submission Details Box
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: "ASSIGNMENT TITLE: ", bold: true, size: 24, font: "Times New Roman" }),
          new TextRun({ text: assignmentTitle, size: 24, font: "Times New Roman" }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: "STUDENT NAME: ", bold: true, size: 24, font: "Times New Roman" }),
          new TextRun({ text: studentName, size: 24, font: "Times New Roman" }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: "MATRICULATION NO: ", bold: true, size: 24, font: "Times New Roman" }),
          new TextRun({ text: matricNo, size: 24, font: "Times New Roman" }),
        ],
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun({ text: "LECTURER IN CHARGE: ", bold: true, size: 24, font: "Times New Roman" }),
          new TextRun({ text: lecturer, size: 24, font: "Times New Roman" }),
        ],
      }),

      // Question Statement
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: "PROBLEM STATEMENT / QUESTION:",
            bold: true,
            size: 26,
            font: "Times New Roman",
            color: "0B132B",
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: problemStatement || "Detailed mathematical and computational problem statement.",
            italics: true,
            size: 24,
            font: "Times New Roman",
            color: "334155",
          }),
        ],
      }),

      // Solution Section Header
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
        children: [
          new TextRun({
            text: "STEP-BY-STEP SOLUTION & MATHEMATICAL PROOF:",
            bold: true,
            size: 26,
            font: "Times New Roman",
            color: "0B132B",
          }),
        ],
      }),
    ];

    // Steps rendering
    const defaultSteps = [
      {
        title: "Step 1: Identifying Functional Dependencies and Primary Keys",
        explanation: "Examine the unnormalized relation R(A, B, C, D, E). Given the functional dependencies FD1: {A, B} -> C, FD2: A -> D, and FD3: D -> E, we first determine the candidate key by computing the attribute closure {A, B}+.",
        calculation: "Attribute closure: {A, B}+ = {A, B, C, D, E}. Since {A, B}+ yields all attributes of relation R, {A, B} is the minimal candidate key."
      },
      {
        title: "Step 2: Testing for Second Normal Form (2NF)",
        explanation: "A relation is in 2NF if and only if it is in 1NF and no non-prime attribute is partially dependent on any candidate key. In relation R, non-prime attribute D depends solely on attribute A, which is a proper subset of candidate key {A, B}.",
        calculation: "Partial dependency detected: A -> D violates 2NF. We decompose R into R1(A, D, E) with key {A}, and R2(A, B, C) with key {A, B}."
      },
      {
        title: "Step 3: Testing for Third Normal Form (3NF) and Transitivity Elimination",
        explanation: "A relation is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on the primary key. In sub-relation R1(A, D, E), attribute E is determined by D (D -> E), where D is not a superkey.",
        calculation: "Transitive dependency detected: A -> D and D -> E. We decompose R1 into R1a(A, D) with primary key A, and R1b(D, E) with primary key D. Final 3NF schemas: R1a(A, D), R1b(D, E), and R2(A, B, C)."
      },
      {
        title: "Step 4: Verification of Lossless Join and Dependency Preservation",
        explanation: "We verify that the natural join of decomposed relations yields the original relation R without generating spurious tuples: R1a ⋈ R1b = R1, and R1 ⋈ R2 = R. The intersection R1a ∩ R1b = {D}, which is a superkey for R1b. Thus the decomposition is provably lossless.",
        calculation: "Dependency preservation check: All original FDs (FD1 in R2, FD2 in R1a, FD3 in R1b) are completely preserved without inter-relational joins."
      }
    ];

    const stepsToRender = steps && steps.length > 0 ? steps : defaultSteps;

    stepsToRender.forEach((step: any, idx: number) => {
      sections.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 60 },
          children: [
            new TextRun({
              text: `${step.title}`,
              bold: true,
              size: 24,
              font: "Times New Roman",
              color: "0284C7",
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: step.explanation,
              size: 24,
              font: "Times New Roman",
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: `Derivation / Result: `,
              bold: true,
              size: 22,
              font: "Times New Roman",
              color: "166534",
            }),
            new TextRun({
              text: step.calculation,
              size: 22,
              font: "Times New Roman",
              italics: true,
            }),
          ],
        })
      );
    });

    // References Section
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text: "ACADEMIC REFERENCES & TEXTBOOK CITATIONS:",
            bold: true,
            size: 26,
            font: "Times New Roman",
            color: "0B132B",
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: "1. Silberschatz, A., Korth, H. F., & Sudarshan, S. (2020). Database System Concepts (7th ed.). McGraw-Hill Education.",
            size: 22,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: "2. Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). Introduction to Algorithms (4th ed.). MIT Press.",
            size: 22,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: "3. Elmasri, R., & Navathe, S. B. (2016). Fundamentals of Database Systems (7th ed.). Pearson.",
            size: 22,
            font: "Times New Roman",
          }),
        ],
      })
    );

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
      toolId: 'assignment-solver',
      title: `${courseCode}: ${assignmentTitle}`,
      course: courseTitle,
      institution,
      summary: `Rigorous academic computational and mathematical solution formatted in APA 7th.`,
      fileType: 'docx',
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${courseCode.replace(/\\s+/g, '_')}_Assignment_Submission.docx"`,
        "X-Remaining-Credits": String(creditCheck.remainingCredits),
      },
    });
  } catch (error: any) {
    console.error("Assignment Docx Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate assignment document" }, { status: 500 });
  }
}
