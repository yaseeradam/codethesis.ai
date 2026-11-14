import { NextRequest, NextResponse } from "next/server";
import { authorizeAndDeductCredits, autoArchiveProject } from "@/lib/credits";
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
    const body = await req.json();
    const {
      studentName = "CHIDI EZE",
      matricNumber = "FUTA/CSC/20/4182",
      course = "Computer Science",
      institution = "Federal University of Technology, Akure",
      company = "MainOne Cable Company (An Equinix Company)",
      department = "Network Infrastructure, Data Center & Systems Engineering Unit",
      duration = "24 Weeks (6 Months)",
      session = "2025/2026",
    } = body;

    // Deduct credits for ITF Technical Report
    const creditCheck = await authorizeAndDeductCredits('itfReport');
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: creditCheck.errorMessage, cost: creditCheck.cost, remainingCredits: creditCheck.remainingCredits },
        { status: 402 }
      );
    }

    const docChildren: (Paragraph | Table)[] = [];

    // Helper functions
    const p = (text: string, indent = true) =>
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: indent ? { firstLine: 720 } : undefined,
        spacing: { before: 100, after: 120, line: 360 }, // 1.5 line spacing
        children: [
          new TextRun({
            text,
            size: 24, // 12pt
            font: "Times New Roman",
            color: "111827",
          }),
        ],
      });

    const h1 = (title: string, subtitle?: string) => [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 150 },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 28,
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
                  size: 26,
                  font: "Times New Roman",
                  color: "000000",
                }),
              ],
            }),
          ]
        : []),
    ];

    const h2 = (title: string) =>
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 280, after: 120 },
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 26,
            font: "Times New Roman",
            color: "000000",
          }),
        ],
      });

    const h3 = (title: string) =>
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: title,
            bold: true,
            italics: true,
            size: 24,
            font: "Times New Roman",
            color: "1F2937",
          }),
        ],
      });

    const bullet = (title: string, text: string) =>
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        bullet: { level: 0 },
        spacing: { before: 60, after: 80, line: 360 },
        children: [
          new TextRun({ text: `${title}: `, bold: true, size: 24, font: "Times New Roman" }),
          new TextRun({ text, size: 24, font: "Times New Roman" }),
        ],
      });

    // --- TITLE / COVER PAGE ---
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 800, after: 200 },
        children: [
          new TextRun({
            text: institution.toUpperCase(),
            bold: true,
            size: 28,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [
          new TextRun({
            text: `SCHOOL OF COMPUTING / ENGINEERING\nDEPARTMENT OF ${course.toUpperCase()}`,
            bold: true,
            size: 24,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 200 },
        children: [
          new TextRun({
            text: "A TECHNICAL REPORT ON THE STUDENTS INDUSTRIAL WORK EXPERIENCE SCHEME (SIWES II)",
            bold: true,
            size: 28,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [
          new TextRun({
            text: `UNDERTAKEN AT\n${company.toUpperCase()}\n${department.toUpperCase()}`,
            bold: true,
            size: 24,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 200 },
        children: [
          new TextRun({
            text: "BY\n" + studentName.toUpperCase(),
            bold: true,
            size: 26,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
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
        spacing: { before: 600, after: 200 },
        children: [
          new TextRun({
            text: `SUBMITTED IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF THE DEGREE OF BACHELOR OF TECHNOLOGY (B.TECH) / BACHELOR OF SCIENCE (B.SC) IN ${course.toUpperCase()}.`,
            size: 22,
            italics: true,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600 },
        children: [
          new TextRun({
            text: `ACADEMIC SESSION: ${session} | DURATION: ${duration.toUpperCase()}`,
            bold: true,
            size: 22,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // --- CERTIFICATION ---
    docChildren.push(
      ...h1("CERTIFICATION"),
      p(
        `This is to certify that this Students Industrial Work Experience Scheme (SIWES II) technical report is a genuine record of industrial training undertaken by ${studentName} (${matricNumber}) in the Department of ${course}, ${institution}, at ${company}, within the ${department}, during the ${session} academic session.`
      ),
      new Paragraph({
        spacing: { before: 1200 },
        children: [
          new TextRun({
            text: "_____________________________________\t\t\t\t_____________________\n" +
                  "Engr. Babatunde O. Adeleke (FNSE)\t\t\t\tDate\n" +
                  "Industry-Based Supervisor (MainOne)\n\n\n" +
                  "_____________________________________\t\t\t\t_____________________\n" +
                  "Dr. K. C. Nwankwo (Ph.D, MNCS)\t\t\t\tDate\n" +
                  "Institutional SIWES Coordinator\n\n\n" +
                  "_____________________________________\t\t\t\t_____________________\n" +
                  "Head of Department, " + course + "\t\t\t\tDate\n" +
                  institution,
            bold: true,
            size: 22,
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] })
    );

    // --- DEDICATION & ACKNOWLEDGMENTS ---
    docChildren.push(
      ...h1("DEDICATION"),
      p(
        "This technical report is dedicated first to God Almighty for his unceasing grace, divine wisdom, protection, and physical sustenance throughout the 24 weeks of rigorous industrial training."
      ),
      p(
        "It is also wholeheartedly dedicated to my wonderful parents and siblings whose moral, intellectual, and financial encouragement provided the backbone for my academic pursuit and professional development."
      ),
      ...h1("ACKNOWLEDGMENTS"),
      p(
        `My profound gratitude goes to the management and engineering staff of ${company} for granting me the invaluable privilege to complete my 6-month industrial attachment within their world-class facilities. Special thanks to my Industry Supervisor and the senior technical officers in the ${department} for their patient mentorship, technical rigor, and hands-on supervision.`
      ),
      p(
        `I extend sincere appreciation to the Vice Chancellor, the Dean, the Institutional SIWES Director, and all academic lecturers within the Department of ${course} at ${institution} for providing the theoretical knowledge that made practical adaptation seamless.`
      ),
      p(
        "Lastly, I appreciate the Industrial Training Fund (ITF) for establishing and sustaining this vital human capital development bridge between academic institutions and contemporary industry."
      ),
      new Paragraph({ children: [new PageBreak()] })
    );

    // --- ABSTRACT ---
    docChildren.push(
      ...h1("ABSTRACT"),
      p(
        `This technical report provides a detailed, comprehensive account of the six-month (24-week) Students Industrial Work Experience Scheme (SIWES II) undertaken at ${company} within the ${department}. The primary objective of the scheme was to bridge the gap between abstract academic theories acquired in the lecture hall and the practical engineering realities of enterprise telecommunications networks, data center operations, and cloud infrastructure.`
      ),
      p(
        "During the training period, the author participated directly in five major technical engineering domains: (1) Structured cabling infrastructure, Cat6 UTP pulling, rack management, impact punch-down patch panel termination adhering to ANSI/TIA-568-B, and Fluke digital wiremapping; (2) Enterprise Layer 2 switching on Cisco Catalyst 2960 platforms, including multi-VLAN segmentation, 802.1Q trunking, and Spanning Tree Protocol (STP) loop prevention; (3) Layer 3 enterprise routing protocols, configuring static default routes and Single-Area OSPF Area 0 neighbor adjacencies with access control list (ACL) packet filtering; (4) Server virtualization using VMware ESXi 7.0 bare-metal hypervisors, vSphere standard switches (vSS), and Nginx reverse proxying with automated TLS/SSL encryption; and (5) Fiber optic infrastructure, executing precision mechanical cleaving, electric arc fusion splicing with 0.02 dB insertion loss, and Optical Time-Domain Reflectometer (OTDR) backscatter analysis."
      ),
      p(
        "The report further documents critical operational troubleshooting methodologies developed to resolve network broadcast storms, fiber optic micro-bends, and server cooling anomalies. The training concluded with an overall assessment of the scheme's efficacy, tendering actionable policy recommendations to the Industrial Training Fund (ITF), university curriculum committees, and industry hosts to further optimize engineering education in Nigeria."
      ),
      new Paragraph({ children: [new PageBreak()] })
    );

    // --- TABLE OF CONTENTS ---
    const createItfTocRow = (title: string, page: string, isBold: boolean, isSub: boolean) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 88, type: WidthType.PERCENTAGE },
            margins: { top: 40, bottom: 40, left: isSub ? 400 : 80, right: 80 },
            children: [
              new Paragraph({
                spacing: { before: isBold ? 140 : 40, after: 40 },
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
                spacing: { before: isBold ? 140 : 40, after: 40 },
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

    const itfTocTable = new Table({
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
        createItfTocRow("Title Page", "i", false, false),
        createItfTocRow("Certification", "ii", false, false),
        createItfTocRow("Dedication", "iii", false, false),
        createItfTocRow("Acknowledgments", "iv", false, false),
        createItfTocRow("Abstract", "v", false, false),
        createItfTocRow("Table of Contents", "vi", false, false),
        createItfTocRow("CHAPTER ONE: INTRODUCTION AND ORGANIZATIONAL PROFILE", "1", true, false),
        createItfTocRow("1.1 Background of the SIWES Program and the ITF Act", "1", false, true),
        createItfTocRow("1.2 Vision, Mandate and National Objectives of SIWES", "3", false, true),
        createItfTocRow("1.3 Corporate History and Profile of the Establishment", "5", false, true),
        createItfTocRow("1.4 Corporate Vision, Mission, and Core Values", "7", false, true),
        createItfTocRow("1.5 Departmental Functions and Organizational Organogram", "8", false, true),
        createItfTocRow("CHAPTER TWO: DEPARTMENTAL ROTATIONS & SAFETY PROTOCOLS", "11", true, false),
        createItfTocRow("2.1 Department Overview and Operational Mandate", "11", false, true),
        createItfTocRow("2.2 Health, Safety, and Environmental (HSE) Regulations", "13", false, true),
        createItfTocRow("2.3 Electrostatic Discharge (ESD) Protection and Server Room Protocols", "16", false, true),
        createItfTocRow("2.4 Fire Suppression (FM-200) and High-Voltage DC Systems", "18", false, true),
        createItfTocRow("CHAPTER THREE: TECHNICAL PROJECTS & WORK EXPERIENCE", "20", true, false),
        createItfTocRow("3.1 Structured Network Cabling & TIA/EIA-568-B Standards", "20", false, true),
        createItfTocRow("3.2 Layer 2 Switching, VLAN Segmentation & 802.1Q Trunking", "24", false, true),
        createItfTocRow("3.3 Enterprise Routing with OSPF Area 0 & ACL Filtering", "28", false, true),
        createItfTocRow("3.4 Bare-Metal Server Virtualization with VMware ESXi", "32", false, true),
        createItfTocRow("3.5 Optical Fiber Splicing, Cleaving & OTDR Trace Auditing", "36", false, true),
        createItfTocRow("3.6 Linux Server Hardening, Nginx Reverse Proxying & SSL", "40", false, true),
        createItfTocRow("CHAPTER FOUR: PROBLEMS ENCOUNTERED & SOLUTIONS", "44", true, false),
        createItfTocRow("4.1 Technical Engineering Challenges Confronted", "44", false, true),
        createItfTocRow("4.2 Diagnostic Methodologies and Troubleshooting Procedures", "47", false, true),
        createItfTocRow("4.3 Preventive Maintenance and Infrastructure Hardening", "50", false, true),
        createItfTocRow("CHAPTER FIVE: SUMMARY, CONCLUSION & RECOMMENDATIONS", "53", true, false),
        createItfTocRow("5.1 Summary of Training Experience", "53", false, true),
        createItfTocRow("5.2 Conclusion", "55", false, true),
        createItfTocRow("5.3 Actionable Recommendations to the Industrial Training Fund (ITF)", "57", false, true),
        createItfTocRow("5.4 Recommendations to University Academic Institutions", "59", false, true),
        createItfTocRow("5.5 Recommendations to Future SIWES Student Interns", "61", false, true),
      ],
    });

    docChildren.push(
      ...h1("TABLE OF CONTENTS"),
      itfTocTable,
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // CHAPTER ONE: INTRODUCTION AND ORGANIZATIONAL PROFILE
    // =========================================================================
    docChildren.push(
      ...h1("CHAPTER ONE", "INTRODUCTION AND ORGANIZATIONAL PROFILE"),
      h2("1.1 Background of the SIWES Program and the ITF Act"),
      p(
        "The Students Industrial Work Experience Scheme (SIWES) is a mandatory, structured skills acquisition training program designed to expose students of Nigerian tertiary institutions to real-world industrial environments, machinery, operational equipment, and corporate workplace cultures associated with their chosen disciplines. Established by the Federal Military Government of Nigeria in 1973 under Decree No. 47 (subsequently codified as an Act of the National Assembly), SIWES represents one of the nation's most impactful policy interventions aimed at developing indigenous technical manpower."
      ),
      p(
        "Prior to the establishment of the scheme in 1973, industrial employers across Nigeria voiced persistent complaints that graduates emerging from local universities, polytechnics, and colleges of technology lacked adequate practical skills, requiring lengthy and expensive corporate retraining before becoming productive. Academic curricula were heavily anchored in theoretical abstractions with minimal exposure to industrial machinery, enterprise software stacks, and factory processes. Recognizing this dangerous structural deficiency in national human capital development, the Federal Government empowered the Industrial Training Fund (ITF) to fund, administer, and manage an internship training scheme linking academia with commerce and industry."
      ),
      p(
        "Today, the administration of SIWES operates as a tripartite institutional collaboration involving: (1) The Industrial Training Fund (ITF), which formulates operational guidelines, conducts supervisory visits, and disburses student and supervisor allowances; (2) The National Regulatory Bodies, including the National Universities Commission (NUC), National Board for Technical Education (NBTE), and National Commission for Colleges of Education (NCCE); and (3) The Tertiary Educational Institutions, which establish dedicated Institutional SIWES Directorates to coordinate departmental placements, accredit host establishments, and conduct academic grading."
      ),

      h2("1.2 Vision, Mandate and National Objectives of SIWES"),
      p(
        "The overarching national vision of the Students Industrial Work Experience Scheme is to produce a technically proficient, practically agile, and globally competitive cadre of indigenous engineers, technologists, and applied scientists capable of driving Nigeria's industrialization agenda."
      ),
      p("In formal alignment with the ITF policy framework, the specific national objectives of SIWES are:"),
      bullet("Practical Skills Assimilation", "To provide tertiary undergraduates with structured opportunities to apply theoretical classroom formulations directly to real-world engineering, scientific, and commercial workflows."),
      bullet("Industrial Machinery Exposure", "To expose students to sophisticated industrial machinery, diagnostic test equipment, high-voltage substations, and enterprise data center environments that are completely unavailable within academic campus laboratories due to prohibitive capital acquisition costs."),
      bullet("Seamless Workplace Transition", "To ease the psychological and operational transition of graduating students from the sheltered academic lecture environment to the demanding realities of commercial industry, dramatically enhancing graduate employability."),
      bullet("Strengthening Industry-Academia Synergies", "To actively enlist and sustain employer involvement in the continuous modernization of educational curricula, ensuring academic programs reflect evolving technological trends."),
      bullet("Fostering Technopreneurship", "To cultivate entrepreneurial self-reliance by equipping students with the hands-on competencies necessary to establish specialized engineering, technical consultancy, and technological enterprises post-graduation."),

      h2(`1.3 Corporate History and Profile of ${company}`),
      p(
        `${company} is widely recognized as a premier telecommunications infrastructure provider and broadband network operator across the West African sub-region. Established to address the acute deficit of high-capacity international connectivity in West Africa, the company made history in 2010 by completing and landing a 7,000-kilometer private open-access submarine optical fiber cable stretching from Portugal along the West African coastline to Nigeria and Ghana.`
      ),
      p(
        `Following its landmark acquisition by Equinix—the world's largest digital infrastructure company—${company} operates world-class Tier III carrier-neutral data centers, state-of-the-art terrestrial fiber optic rings spanning thousands of kilometers, and an advanced IP/MPLS core transmission backbone. The company provides mission-critical connectivity, colocation, cloud interconnection, and managed IT services to multinational financial banking institutions, global cloud hyperscalers, major mobile network operators (MNOs), government parastatals, and large enterprise conglomerates.`
      ),

      h2("1.4 Corporate Vision, Mission, and Core Values"),
      bullet("Corporate Vision", "To be the leading enabler of digital connectivity and technological transformation across the African continent."),
      bullet("Corporate Mission", "To deliver robust, scalable, and highly available telecommunications infrastructure and data center services that empower businesses, drive digital economies, and connect Africa to the global marketplace."),
      bullet("Core Values", "Operational Excellence, Uncompromising Integrity, Customer Centricity, Technological Innovation, and Workplace Safety."),

      h2(`1.5 Departmental Functions and Organizational Organogram`),
      p(
        `During the 24-week industrial training attachment, the student intern was stationed within the ${department}. This specialized engineering division is charged with ensuring 99.982% uptime across all core terrestrial fiber links, edge routing points of presence (PoPs), and raised-floor enterprise server rack environments.`
      ),
      p(
        "The departmental command hierarchy is structured as follows: Chief Technical Officer (CTO) -> Head of Network Operations & Infrastructure -> Senior Data Center Facility Manager -> Principal Systems & Network Engineers -> Field Support Engineers -> Junior Operations Technicians & SIWES Interns."
      ),
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // CHAPTER TWO: DEPARTMENTAL ROTATIONS & SAFETY PROTOCOLS
    // =========================================================================
    docChildren.push(
      ...h1("CHAPTER TWO", "DEPARTMENTAL ROTATIONS & SAFETY PROTOCOLS"),
      h2("2.1 Department Overview and Operational Mandate"),
      p(
        `The ${department} functions as the technological nerve center of ${company}. The department operates a 24/7/365 Network Operations Center (NOC) tasked with continuous telemetry surveillance, latency monitoring, packet-loss tracking, and incident escalation across nationwide optical networks.`
      ),
      p("Key operational mandates executed by the unit include:"),
      bullet("Tier III Data Center Infrastructure Management", "Continuous supervision of dual-redundant power feeds, diesel generator synchronization, precision computer room air handling (CRAH) units, and environmental temperature/humidity sensors maintaining ASHRAE standards (20°C to 24°C, 45% relative humidity)."),
      bullet("Enterprise Backbone Switching & Routing", "Architecting and provisioning Layer 2 switching fabrics, Virtual Local Area Networks (VLANs), BGP peering sessions, and interior gateway protocols (OSPF) across high-capacity core chassis."),
      bullet("Server Virtualization & Colocation Operations", "Deploying bare-metal hypervisors (VMware vSphere/ESXi), SAN/NAS storage arrays, customer server rack installations, and structured cable cross-connects."),
      bullet("Preventive Maintenance & Disaster Recovery", "Executing scheduled electrical load-bank tests, UPS battery impedance testing, differential database backups, and emergency optical fiber restoration."),

      h2("2.2 Health, Safety, and Environmental (HSE) Regulations"),
      p(
        "Within high-density telecommunications facilities and data centers housing high-voltage electrical switchgear (415V AC / -48V DC battery banks), industrial workplace safety is governed by strict, zero-compromise Health, Safety, and Environmental (HSE) regulations. Prior to receiving facility badge credentials, all interns underwent mandatory occupational safety training."
      ),
      bullet("Personal Protective Equipment (PPE) Protocols", "Mandatory requirement of safety boots with composite non-conductive soles, high-visibility reflective vests, safety goggles during fiber cutting, and protective hard hats in construction zones."),
      bullet("Permit to Work (PTW) System", "No engineering operations involving live electrical circuits, elevated cable ladders, or hot-work cutting may proceed without an authorized, signed Permit to Work docket issued by the HSE Safety Officer."),
      bullet("Physical Ergonomics & Lifting Standards", "Enforcement of OSHA-compliant lifting procedures when racking heavy enterprise equipment (such as 4U rack servers weighing over 35 kg), requiring dual-technician lifting or mechanical server lifts."),

      h2("2.3 Electrostatic Discharge (ESD) Protection and Server Room Protocols"),
      p(
        "Electrostatic Discharge (ESD) represents an invisible, catastrophic hazard to microelectronic components. Static charges as low as 100 volts—completely imperceptible to human touch—can puncture sub-micron semiconductor gates on server motherboards, RAM modules, and network interface cards (NICs)."
      ),
      p(
        "To mitigate ESD risks, all engineering technicians and interns are required to: (1) Wear grounded antistatic wrist straps connected to designated equipment chassis ground points before handling bare circuit boards; (2) Walk exclusively on dissipative raised-floor tiles; (3) Store and transport all electronic components within silver-shielded Faraday antistatic bags; and (4) Prohibit all synthetic wool clothing inside white-space server halls."
      ),

      h2("2.4 Fire Suppression (FM-200) and High-Voltage DC Systems"),
      p(
        "Water-based sprinkler systems are completely prohibited within mission-critical server environments due to catastrophic short-circuit hazards. The facility utilizes clean-agent gas suppression systems (FM-200 / Heptafluoropropane and Inergen). Upon dual-optical smoke detector cross-zoning verification, a 30-second warning siren sounds, providing technicians time to evacuate before the room is flooded with gas that chemically suppresses combustion without depleting breathable oxygen or leaving damaging chemical residues on electronic circuits."
      ),
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // CHAPTER THREE: TECHNICAL PROJECTS & WORK EXPERIENCE (Exhaustive Discourse)
    // =========================================================================
    docChildren.push(
      ...h1("CHAPTER THREE", "TECHNICAL PROJECTS & WORK EXPERIENCE"),
      h2("3.1 Structured Network Cabling & TIA/EIA-568-B Standards"),
      p(
        "During the foundational rotation of the internship, the author actively participated in structured horizontal and backbone cabling deployments across new executive office suites and server rows. Structured cabling provides the foundational physical layer (OSI Layer 1) over which all higher-layer enterprise protocols communicate."
      ),
      p("Key technical operations executed included:"),
      bullet("Pathway Routing & Cable Pulling", "Measuring, unspooling, and pulling over 300 meters of Category 6 (Cat6) 250MHz Unshielded Twisted Pair (UTP) cabling through overhead wire-mesh cable trays, maintaining strict 30 cm perpendicular separation from high-voltage electrical conduits to prevent electromagnetic interference (EMI) and alien crosstalk."),
      bullet("Modular RJ45 Termination (T568B Standard)", "Terminating patch cables adhering strictly to the ANSI/TIA-568-B color sequence: Pin 1: White/Orange, Pin 2: Orange, Pin 3: White/Green, Pin 4: Blue, Pin 5: White/Blue, Pin 6: Green, Pin 7: White/Brown, Pin 8: Brown."),
      bullet("Patch Panel Punch-Down", "Utilizing a 110-style impact punch-down tool with automatic wire cut-off to seat twisted pairs into 24-port rack-mount patch panels, ensuring twist rates were maintained to within 0.5 inches of the termination point to minimize near-end crosstalk (NEXT)."),
      bullet("Digital Wiremap & Continuity Certification", "Employing Fluke micro-scanner network analyzers to test every drop for continuity, shorts, opens, reversed pairs, and split pairs, successfully achieving a 100% pass certification across all 48 terminated workstation drops."),

      h2("3.2 Layer 2 Switching, VLAN Segmentation & 802.1Q Trunking"),
      p(
        "To optimize local area network performance and isolate corporate broadcast domains, the author participated in configuring enterprise Cisco Catalyst 2960-X Series switches."
      ),
      p("The engineering tasks encompassed:"),
      bullet("Virtual Local Area Network (VLAN) Creation", "Creating logical broadcast boundaries in global configuration mode: VLAN 10 (Corporate Management), VLAN 20 (Staff Workstations), VLAN 30 (VoIP Telephony), and VLAN 40 (Guest Wireless). This segmentation prevented broadcast storms from overwhelming workstation network interfaces."),
      bullet("Switchport Access Configuration", "Assigning access ports with port security features enabled (switchport port-security maximum 2, violation restrict) to prevent unauthorized rogue laptops from bridging network interfaces."),
      bullet("IEEE 802.1Q Trunk Port Deployment", "Configuring uplink GigabitEthernet 0/1 interfaces in trunk mode using IEEE 802.1Q encapsulation. This protocol injects a 4-byte VLAN tag into the standard Ethernet frame header, allowing tagged traffic from multiple distinct VLANs to traverse a single physical fiber uplink to core distribution routers."),
      bullet("Spanning Tree Protocol (STP) Tuning", "Enabling Rapid Per-VLAN Spanning Tree (Rapid-PVST+) to eliminate switching loops and ensure deterministic root bridge election, reducing network reconvergence latency from 50 seconds to under 2 seconds during link failure."),

      h2("3.3 Enterprise Routing with OSPF Area 0 & ACL Filtering"),
      p(
        "At the network layer (OSI Layer 3), the author assisted senior network architects in deploying dynamic routing protocols and edge perimeter security filters on Cisco 1941 and 3945 Integrated Services Routers (ISRs)."
      ),
      bullet("IP Subnet Calculation & Variable-Length Subnet Masking (VLSM)", "Designing efficient address allocation schemas using CIDR notation (/24 for user LANs, /28 for server DMZs, and /30 point-to-point serial links), conserving public IPv4 address space."),
      bullet("Single-Area OSPF Protocol Deployment", "Configuring Open Shortest Path First (OSPF Process ID 1) in backbone Area 0. Advertising connected networks using inverted wildcard masks (e.g., network 192.168.10.0 0.0.0.255 area 0). Verifying OSPF adjacency states through the two-way, exstart, and full states."),
      bullet("Designated Router (DR) & BDR Election Coordination", "Configuring interface priority metrics (ip ospf priority 200) to ensure the highest-capacity core router won the Designated Router election on multi-access broadcast segments."),
      bullet("Standard and Extended Access Control Lists (ACLs)", "Writing extended ACL 102 rules permitting HTTP/HTTPS (ports 80/443) and SSH (port 22) traffic from management IP ranges while denying all unauthorized external ICMP ping scans, enhancing perimeter defense."),

      h2("3.4 Bare-Metal Server Virtualization with VMware ESXi"),
      p(
        "To maximize hardware compute density and eliminate the costs of provisioning dedicated physical servers for every departmental application, the author participated in deploying bare-metal virtualization platforms."
      ),
      bullet("Type-1 Hypervisor Installation", "Deploying VMware ESXi 7.0 on enterprise Dell PowerEdge R740 dual-socket servers with 128 GB RAM and redundant hardware RAID-10 disk arrays."),
      bullet("vSphere Virtual Switch (vSS) Architecture", "Creating virtual network switches (vSwitch0, vSwitch1) and binding physical 10-Gigabit optical NICs in NIC teaming mode for load balancing and fault tolerance. Mapping virtual port groups with dedicated 802.1Q VLAN IDs."),
      bullet("Guest Virtual Machine Provisioning", "Provisioning guest virtual machines running Ubuntu Server 22.04 LTS and Windows Server 2022; configuring thin-provisioned virtual disks (VMDK) and allocating dedicated vCPU and RAM reservations."),

      h2("3.5 Optical Fiber Splicing, Cleaving & OTDR Trace Auditing"),
      p(
        "Fiber optic communications form the undisputed physical backbone of modern high-speed metropolitan and international telecommunications. The author completed specialized practical training in optical fiber splicing, termination, and loss auditing."
      ),
      bullet("Fiber Preparation & Precision Cleaving", "Stripping 250um buffer coatings from 9/125um single-mode glass fibers using Clauss precision strippers; cleaning bare glass cores with 99.9% electronic-grade isopropyl alcohol; executing 90-degree perpendicular cleaves using high-precision diamond-wheel cleavers."),
      bullet("Core-Alignment Electric Arc Fusion Splicing", "Loading single-mode fibers into the V-grooves of a Fujikura 70S core-alignment fusion splicer. The instrument executes microscopic camera alignment along X and Y axes, initiates an automated high-voltage electric arc to melt and fuse the glass cores, and applies a protective heat-shrink sleeve, achieving an exceptional splice loss of 0.02 dB."),
      bullet("Optical Time-Domain Reflectometer (OTDR) Testing", "Connecting an Anritsu OTDR instrument to outdoor fiber spans; analyzing backscatter traces (Rayleigh scattering) to verify attenuation rates (less than 0.35 dB/km at 1310nm) and identifying micro-bend anomalies."),

      h2("3.6 Linux Server Hardening, Nginx Reverse Proxying & SSL"),
      p(
        "In the software and web services rotation, the author engineered production server environments hosting internal administrative portals:"
      ),
      bullet("Linux OS Hardening", "Disabling password-based root SSH logins on Ubuntu servers; generating 4096-bit RSA and Ed25519 cryptographic key-pairs; configuring UFW host-based firewalls permitting only essential ports."),
      bullet("Nginx Reverse Proxy Deployment", "Configuring Nginx server blocks to terminate incoming client HTTP/HTTPS requests and asynchronously forward proxy traffic to Python/Node.js backend microservices listening on localhost:8000."),
      bullet("Automated TLS/SSL Encryption", "Installing Certbot and provisioning automated Let's Encrypt TLS certificates with automated cron renewals, enforcing modern HSTS headers and TLS 1.3 cryptographic suites."),
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // CHAPTER FOUR: PROBLEMS ENCOUNTERED & SOLUTIONS
    // =========================================================================
    docChildren.push(
      ...h1("CHAPTER FOUR", "PROBLEMS ENCOUNTERED & SOLUTIONS"),
      h2("4.1 Technical Engineering Challenges Confronted"),
      p(
        "During the course of the 24-week industrial attachment, the author confronted and actively resolved several complex engineering and operational bottlenecks:"
      ),
      bullet("Problem 1: Excessive Optical Fiber Attenuation Loss", "During a critical 10-Gigabit fiber backbone link turn-up, an optical power meter revealed an unacceptable insertion loss of -28 dBm (far exceeding the -18 dBm budget), causing continuous interface flapping."),
      bullet("Problem 2: Catastrophic Layer 2 Broadcast Storm", "An unmanaged network hub was erroneously cross-connected between two access ports in an executive conference room, creating a switching loop that flooded the local broadcast domain, spiking switch CPU utilization to 100% and halting workstation traffic."),
      bullet("Problem 3: Server Thermal Throttle in Cold Aisle", "A thermal alarm sounded on server rack row C when ambient intake temperatures spiked to 31°C, threatening emergency automatic thermal shutdown of mission-critical database servers."),

      h2("4.2 Diagnostic Methodologies and Troubleshooting Procedures"),
      bullet("Resolution 1: OTDR Pinpointing & Re-splicing", "Connected an OTDR tester to the flapping fiber link; the trace revealed a severe localized optical reflection event at exactly 340 meters caused by a crushed fiber buffer tube within a conduit elbow. The author assisted in excavating the damaged section, pulling a 10m slack loop, executing two precision fusion splices with 0.02 dB loss, and restoring the link budget to -14.2 dBm."),
      bullet("Resolution 2: Spanning Tree BPDU Guard Enforcement", "Immediately disconnected the rogue patch cable to quench the broadcast loop; configured 'spanning-tree portfast' and 'spanning-tree bpduguard enable' globally across all access ports. If a bridge protocol data unit (BPDU) is ever detected on an edge user port in the future, the switch automatically transitions the port into err-disabled state, preventing broadcast storm recurrence."),
      bullet("Resolution 3: Cold-Aisle Containment Re-balancing", "Inspected the CRAC (Computer Room Air Conditioning) supply plenum; identified a jammed motorized under-floor damper restricting chilled airflow beneath Row C. Manually unjammed the actuator, replaced blanking panels in empty rack spaces to prevent hot air recirculation, and restored cold aisle intake temperature to a steady 21.4°C."),

      h2("4.3 Preventive Maintenance and Infrastructure Hardening"),
      p(
        "The troubleshooting experiences highlighted that proactive preventive maintenance is far superior to reactive emergency repair. The author assisted in establishing standardized weekly preventive checklists: automated nightly configuration backups (Cisco 'archive' command to TFTP server), quarterly optical patch cord end-face scope cleanings, and monthly UPS battery discharge calibration runs."
      ),
      new Paragraph({ children: [new PageBreak()] })
    );

    // =========================================================================
    // CHAPTER FIVE: SUMMARY, CONCLUSION & RECOMMENDATIONS
    // =========================================================================
    docChildren.push(
      ...h1("CHAPTER FIVE", "SUMMARY, CONCLUSION & RECOMMENDATIONS"),
      h2("5.1 Summary of Training Experience"),
      p(
        `The six-month (24-week) Students Industrial Work Experience Scheme (SIWES II) completed at ${company} within the ${department} proved to be an immensely transformative, intellectually stimulating, and practically grounding professional experience. The internship provided an invaluable real-world proving ground where abstract mathematical and computational concepts—such as OSI layer encapsulation, algorithm time complexity, relational database ACID guarantees, and packet routing metrics—were observed and manipulated within live, mission-critical enterprise systems.`
      ),
      p(
        "The author acquired hands-on mastery in structured cabling standards, Cisco enterprise routing and switching, bare-metal VMware server virtualization, fiber optic fusion splicing, Linux server administration, and structured technical troubleshooting methodologies."
      ),

      h2("5.2 Conclusion"),
      p(
        "In conclusion, the Students Industrial Work Experience Scheme remains an indispensable, irreplaceable catalyst for technical human capital development within the Nigerian higher education ecosystem. The practical competencies, operational discipline, and industrial safety consciousness assimilated during this 24-week attachment have substantially fortified the author's engineering acumen, instilling professional confidence and establishing an exceptional springboard for a rewarding future career in systems engineering and computational technology."
      ),

      h2("5.3 Actionable Recommendations to the Industrial Training Fund (ITF)"),
      bullet("Upward Review of Student Allowances", "In light of prevailing macro-economic realities and inflationary transport costs, the ITF should substantially review student maintenance allowances and disburse funds during the active training period rather than months post-completion to alleviate financial strain."),
      bullet("Digital Placement Matching Portal", "The ITF should deploy a centralized digital portal where vetted engineering establishments can list available internship vacancies and students can apply based on academic merit and geographic proximity, eliminating the grueling physical search for placements."),

      h2("5.4 Recommendations to University Academic Institutions"),
      bullet("Curriculum Modernization", "Academic computer science and engineering curricula should be updated to incorporate modern industry technologies—such as cloud platforms (AWS, Azure), Docker containerization, and modern network protocols—rather than focusing exclusively on legacy theoretical frameworks."),
      bullet("Laboratory Equipment Upgrade", "University authorities should invest capital allocations toward procuring modular training racks containing modern managed switches, routers, and fiber cleaving equipment to ensure students acquire baseline physical familiarity prior to industrial deployment."),

      h2("5.5 Recommendations to Future SIWES Student Interns"),
      bullet("Proactive Technical Inquisitiveness", "Future interns must adopt a proactive learning posture, actively requesting technical assignments, shadowing senior engineers, and demonstrating punctuality, humility, and uncompromising dedication to workplace safety protocols."),
      bullet("Diligent Daily Record Keeping", "Interns should maintain meticulous, daily technical records in their logbooks immediately after concluding tasks, rather than attempting to reconstruct weeks of technical activities from memory at the end of the internship.")
    );

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                left: 2160, // 1.5 inches for hardcover thesis binding
                right: 1440,
                top: 1440,
                bottom: 1440,
              },
            },
          },
          children: docChildren,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    // Auto-archive in student repository
    await autoArchiveProject({
      userId: creditCheck.userId,
      toolId: 'itf-report',
      title: `ITF SIWES Technical Defense Report: ${studentName}`,
      course,
      institution,
      summary: `Comprehensive 5-Chapter SIWES technical defense report for industrial attachment at ${company}.`,
      fileType: 'docx',
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="ITF_Technical_Report_${course.replace(/\s+/g, "_")}.docx"`,
        "X-Remaining-Credits": String(creditCheck.remainingCredits),
      },
    });
  } catch (error) {
    console.error("Error generating ITF Report:", error);
    return NextResponse.json({ error: "Failed to generate ITF Report" }, { status: 500 });
  }
}
