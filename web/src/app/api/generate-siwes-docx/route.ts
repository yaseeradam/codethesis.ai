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
  BorderStyle,
  HeadingLevel,
  PageBreak,
} from "docx";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      course = "Computer Science / Engineering", 
      company = "MainOne / Equinix Tier III Data Center", 
      duration = 24, 
      weeks: inputWeeks 
    } = body;

    // Deduct credits for SIWES Logbook
    const creditCheck = await authorizeAndDeductCredits('siwesLogbook');
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: creditCheck.errorMessage, cost: creditCheck.cost, remainingCredits: creditCheck.remainingCredits },
        { status: 402 }
      );
    }

    const numWeeks = Number(duration) === 12 ? 12 : 24;

    // Full 24-Week Comprehensive Technical Syllabus Engine
    const full24WeekSyllabus = [
      {
        weekNumber: 1,
        theme: "Workplace Safety, Enterprise Orientation & IT Infrastructure Familiarization",
        days: [
          { day: "Monday", date: "Day 1", task: "Corporate Orientation & IT Governance Briefing", details: "Attended mandatory induction with the Human Resources and HSE department; received detailed security briefings on corporate IT acceptable use policy, NDA agreements, and biometric badge access levels." },
          { day: "Tuesday", date: "Day 2", task: "Facility Inspection & NOC Tour", details: "Conducted guided technical walkthrough of the Network Operations Center (NOC), uninterruptible power supply (UPS) room, and raised-floor server enclosures with senior operations engineers." },
          { day: "Wednesday", date: "Day 3", task: "Workstation Setup & Linux Dev Environment Provisioning", details: "Installed enterprise Linux OS on designated developer workstation; configured SSH key-pairs, Git version control, Wireshark packet analyzer, and PuTTY console utilities." },
          { day: "Thursday", date: "Day 4", task: "Departmental Inventory Audit", details: "Assisted network administrators in auditing physical inventory of Cisco Catalyst 2960 switches, patch panels, Cat6 UTP spools, and fiber optical patch cords." },
          { day: "Friday", date: "Day 5", task: "Weekly Log Review & Team Retrospective", details: "Summarized orientation observations with industry supervisor; documented initial facility topologies and reviewed objectives for the upcoming cabling rotation." }
        ],
        weeklySummary: "Mastered basic enterprise safety procedures, personal protective equipment (PPE) protocols in data centers, and configured local Linux network analysis tools.",
        sketchTitle: "Enterprise Data Center Raised-Floor Enclosure Layout",
        sketchDescription: "Schematic depicting hot aisle/cold aisle containment, CRAC precision cooling units, and overhead cable ladder trays."
      },
      {
        weekNumber: 2,
        theme: "Structured Network Cabling, Termination & TIA/EIA Standards",
        days: [
          { day: "Monday", date: "Day 6", task: "UTP Cable Pulling & Pathway Conduit Routing", details: "Assisted in measuring, pulling, and bundling 200m of Category 6 (Cat6) UTP cable through overhead metal raceways, ensuring strict 30cm separation from high-voltage electrical conduits." },
          { day: "Tuesday", date: "Day 7", task: "RJ45 Connector Crimping (T568B Standard)", details: "Crimped fifty (50) RJ45 modular connectors adhering strictly to ANSI/TIA-568-B pinout specification (Pin 1: White/Orange through Pin 8: Brown)." },
          { day: "Wednesday", date: "Day 8", task: "Cable Continuity & Wiremap Digital Testing", details: "Tested crimped patch cords using a Fluke micro-scanner network tester; inspected for open circuits, short circuits, crossed pairs, and split pairs, rectifying 3 defective terminations." },
          { day: "Thursday", date: "Day 9", task: "Patch Panel Punch-Down Termination", details: "Terminated incoming network drops onto 24-port 110-type rack-mount patch panels using a spring-loaded impact punch-down tool with automatic wire cut-off." },
          { day: "Friday", date: "Day 10", task: "Wall Faceplate Installation & Link Speed Verification", details: "Installed dual-port RJ45 faceplates in executive conference suites; verified gigabit full-duplex negotiation (1000 Mbps) with core distribution switch." }
        ],
        weeklySummary: "Acquired comprehensive proficiency in ANSI/TIA-568-B cabling architecture, precision impact termination, and digital continuity testing.",
        sketchTitle: "T568B Modular RJ45 Pinout Termination Diagram",
        sketchDescription: "Wire sequence diagram: 1:W-Org, 2:Org, 3:W-Grn, 4:Blu, 5:W-Blu, 6:Grn, 7:W-Brn, 8:Brn."
      },
      {
        weekNumber: 3,
        theme: "Layer 2 Switching, VLAN Segmentation & 802.1Q Trunking",
        days: [
          { day: "Monday", date: "Day 11", task: "Cisco Catalyst 2960 Switch Initialization", details: "Connected to Cisco 2960 switch via RS-232 RJ45 rollover console cable; performed factory hardware reset and configured hostname, enable secret password, and console timeout banner." },
          { day: "Tuesday", date: "Day 12", task: "Virtual LAN (VLAN) Creation & Port Assignment", details: "Configured VLAN 10 (Management), VLAN 20 (Staff), and VLAN 30 (Guest) in global configuration mode; assigned FastEthernet 0/1-0/12 to VLAN 20 in switchport access mode." },
          { day: "Wednesday", date: "Day 13", task: "IEEE 802.1Q Trunk Port Deployment", details: "Configured GigabitEthernet 0/1 as an 802.1Q trunk port connecting access switch to core distribution router; verified multi-VLAN encapsulation tagging." },
          { day: "Thursday", date: "Day 14", task: "Inter-VLAN Routing (Router-on-a-Stick)", details: "Configured sub-interfaces on Cisco 1941 router (Gig0/0.10, Gig0/0.20) with 802.1Q encapsulation and assigned default gateway IP addresses to each broadcast domain." },
          { day: "Friday", date: "Day 15", task: "Spanning Tree Protocol (STP) Verification", details: "Inspected Spanning Tree Protocol (STP) port states (Blocking, Listening, Learning, Forwarding); verified root bridge election and validated loop-free topology." }
        ],
        weeklySummary: "Designed broadcast domain segmentation using 802.1Q VLAN trunking and implemented router-on-a-stick inter-VLAN routing.",
        sketchTitle: "802.1Q Router-on-a-Stick Inter-VLAN Architecture",
        sketchDescription: "Diagram depicting router physical interface partitioned into logical sub-interfaces Gig0/0.10 and Gig0/0.20 connected to trunk switch port."
      },
      {
        weekNumber: 4,
        theme: "Layer 3 Enterprise Routing (Static & OSPF Dynamic Protocols)",
        days: [
          { day: "Monday", date: "Day 16", task: "IPv4 Subnetting & Static Default Routing", details: "Calculated /26, /27, and /30 variable-length subnet masks (VLSM); configured IPv4 static default routes (0.0.0.0 0.0.0.0 next-hop-ip) pointing to edge gateway." },
          { day: "Tuesday", date: "Day 17", task: "Single-Area OSPF Dynamic Protocol Deployment", details: "Configured OSPF Process ID 1 across core routers; advertised local subnets using inverted wildcard masks and verified OSPF adjacency states (Init -> 2-Way -> ExStart -> Full)." },
          { day: "Wednesday", date: "Day 18", task: "Designated Router (DR) & BDR Election Analysis", details: "Adjusted OSPF interface priority metrics to manually force designated core router as DR; inspected link-state advertisements (LSAs) in link-state database (LSDB)." },
          { day: "Thursday", date: "Day 19", task: "Standard Access Control Lists (ACL) Implementation", details: "Wrote standard access-list 10 to filter unauthorized guest subnet packets from reaching corporate server management network (192.168.10.0/24)." },
          { day: "Friday", date: "Day 20", task: "Extended ACL Rule Testing & Packet Inspection", details: "Configured extended ACL 101 to permit HTTP/HTTPS (ports 80/443) while denying telnet (port 23) and ICMP echo requests; tested filtering via Wireshark." }
        ],
        weeklySummary: "Mastered dynamic routing convergence with OSPF Area 0 and strengthened perimeter security with granular access control lists.",
        sketchTitle: "Single-Area OSPF Core Topology with DR/BDR Nodes",
        sketchDescription: "Schematic displaying 3 multi-homed Cisco routers running OSPF Area 0 with designated router election."
      },
      {
        weekNumber: 5,
        theme: "Wireless Enterprise LANs, UniFi Access Points & RF Site Surveys",
        days: [
          { day: "Monday", date: "Day 21", task: "Enterprise Wireless Architecture Planning", details: "Reviewed 802.11ac/ax Wi-Fi frequency channels (2.4 GHz vs 5.0 GHz); mapped non-overlapping channel assignments (1, 6, 11 on 2.4 GHz) to avoid co-channel interference." },
          { day: "Tuesday", date: "Day 22", task: "UniFi Controller Deployment & AP Adoption", details: "Installed UniFi Network Controller software on management server; connected three UniFi AC-Pro access points and completed firmware adoption and VLAN tagging." },
          { day: "Wednesday", date: "Day 23", task: "SSID Security & WPA3 Enterprise 802.1X Setup", details: "Configured dual SSIDs: 'Corp_Internal' utilizing WPA3-Enterprise with RADIUS server backend, and 'Guest_Portal' enforcing captive portal splash terms." },
          { day: "Thursday", date: "Day 24", task: "RF Heatmap Site Survey with NetSpot", details: "Conducted physical walkthrough of executive building with NetSpot Wi-Fi analyzer; mapped RSSI signal strength (-dBm) to eliminate wireless dead zones." },
          { day: "Friday", date: "Day 25", task: "Access Point Ceiling Mounting & PoE Budget Audit", details: "Mounted ceiling access points in conference hall; audited Power over Ethernet (PoE 802.3af/at) power budget on Cisco 24-port PoE switch." }
        ],
        weeklySummary: "Implemented corporate enterprise Wi-Fi networks with 802.1X RADIUS authentication and conducted spatial RF signal heat-mapping.",
        sketchTitle: "Non-Overlapping 2.4 GHz Wi-Fi Channel Frequency Layout",
        sketchDescription: "Visual spectrum curve showing channels 1 (2412 MHz), 6 (2437 MHz), and 11 (2462 MHz) with zero spectral overlap."
      },
      {
        weekNumber: 6,
        theme: "Server Virtualization, Hypervisors & VMware ESXi Deployment",
        days: [
          { day: "Monday", date: "Day 26", task: "Type-1 Hypervisor Architecture Introduction", details: "Studied bare-metal virtualization architectures vs Type-2 hosted solutions; prepared Dell PowerEdge R740 rack server for VMware ESXi 7.0 deployment." },
          { day: "Tuesday", date: "Day 27", task: "VMware ESXi 7.0 Bare-Metal Installation", details: "Flashed ESXi ISO to bootable USB; installed hypervisor onto dual internal SD cards in RAID-1 configuration; configured static management IPv4 and DNS." },
          { day: "Wednesday", date: "Day 28", task: "vSphere Virtual Switch (vSwitch) Network Setup", details: "Created vSphere Standard Switch (vSS); configured port groups for Management Network, DMZ Web Servers, and Database Tier with respective VLAN IDs." },
          { day: "Thursday", date: "Day 29", task: "Virtual Machine (VM) Provisioning & Resource Allocation", details: "Provisioned two virtual machines running Ubuntu Server 22.04 LTS; allocated 4 vCPUs, 8 GB RAM, and 100 GB thin-provisioned virtual disk space." },
          { day: "Friday", date: "Day 30", task: "VM Snapshot Creation & Backup Disaster Recovery", details: "Executed VM snapshot tests prior to major kernel updates; configured automated nightly differential snapshot backups to network attached storage (NAS)." }
        ],
        weeklySummary: "Deployed enterprise bare-metal virtualization using VMware ESXi, configured virtual switches (vSwitch), and provisioned production guest VMs.",
        sketchTitle: "VMware ESXi Type-1 Hypervisor Architectural Topology",
        sketchDescription: "Diagram showing physical hardware -> ESXi Kernel -> Virtual Machines with virtual NICs mapped to virtual switches."
      },
      {
        weekNumber: 7,
        theme: "Linux Server Administration, Nginx Reverse Proxy & SSL Certificates",
        days: [
          { day: "Monday", date: "Day 31", task: "Ubuntu Server Hardening & SSH Key Enforcement", details: "Disabled root SSH login and password authentication on production Linux servers; enforced ED25519 public key authentication and changed default SSH port." },
          { day: "Tuesday", date: "Day 32", task: "UFW Firewall Rule Definition & Fail2Ban Setup", details: "Configured Uncomplicated Firewall (UFW) to allow only ports 22, 80, and 443; installed and configured Fail2Ban to block brute-force IP addresses after 3 failed attempts." },
          { day: "Wednesday", date: "Day 33", task: "Nginx Web Server Installation & Reverse Proxying", details: "Installed Nginx; wrote server block configuration file routing incoming port 80/443 traffic to backend application servers running on localhost:8000." },
          { day: "Thursday", date: "Day 34", task: "SSL/TLS Certificate Installation via Certbot", details: "Configured Let's Encrypt automated TLS certificates using Certbot; enforced HTTP to HTTPS 301 redirection and configured modern TLS 1.3 cryptographic cipher suites." },
          { day: "Friday", date: "Day 35", task: "Gzip Compression & Static Asset Caching", details: "Optimized Nginx performance by enabling Gzip compression for JSON, CSS, and JS files, reducing payload bandwidth transfer by 68%." }
        ],
        weeklySummary: "Mastered Linux security hardening, UFW firewall configuration, Nginx reverse proxying, and automated TLS/SSL encryption.",
        sketchTitle: "Nginx SSL Termination & Reverse Proxy Architecture",
        sketchDescription: "Flow diagram showing client HTTPS requests terminating at Nginx reverse proxy before forwarding via plain HTTP to backend microservices."
      },
      {
        weekNumber: 8,
        theme: "Relational Database Administration (PostgreSQL & SQLite)",
        days: [
          { day: "Monday", date: "Day 36", task: "PostgreSQL 15 Installation & Cluster Initialization", details: "Installed PostgreSQL server packages on Linux; initialized database cluster and configured pg_hba.conf for secure scram-sha-256 client authentication." },
          { day: "Tuesday", date: "Day 37", task: "Relational Schema DDL Execution & Constraints", details: "Executed normalized SQL DDL scripts creating tables, primary keys, foreign key cascading rules, and check constraints for university accommodation models." },
          { day: "Wednesday", date: "Day 38", task: "B-Tree Indexing & EXPLAIN ANALYZE Performance Tuning", details: "Analyzed slow SELECT queries using EXPLAIN ANALYZE; added B-tree composite indexes on (room_id, bed_number), reducing query execution from 145ms to 1.8ms." },
          { day: "Thursday", date: "Day 39", task: "Automated pg_dump Backups & Crontab Scheduling", details: "Wrote Bash backup script executing pg_dump with gzip compression; configured crontab daemon to trigger automated daily backups at 02:00 AM." },
          { day: "Friday", date: "Day 40", task: "Database Disaster Recovery Simulation", details: "Simulated corrupted database table recovery; dropped test database and successfully restored full state from compressed SQL dump in under 4 minutes." }
        ],
        weeklySummary: "Configured relational database clusters, implemented query optimization via B-Tree indexes, and automated cron-based disaster recovery routines.",
        sketchTitle: "Relational Database B-Tree Index Traversal Tree",
        sketchDescription: "Schematic showing root node, branch nodes, and leaf node pointers enabling O(log n) record retrieval."
      },
      {
        weekNumber: 9,
        theme: "Fiber Optic Communications, Splicing & OTDR Testing",
        days: [
          { day: "Monday", date: "Day 41", task: "Fiber Optics Physics & Cable Types Overview", details: "Studied Single-Mode Fiber (SMF) 9/125um vs Multi-Mode Fiber (MMF) 50/125um; inspected LC, SC, and ST connectors under optical microscope for end-face dirt." },
          { day: "Tuesday", date: "Day 42", task: "Fiber Stripping, Cleaning & Precision Cleaving", details: "Stripped outer buffer jackets using Clauss fiber strippers; cleaned bare glass with 99.9% isopropyl alcohol; cleaved fiber using high-precision diamond blade cleaver." },
          { day: "Wednesday", date: "Day 43", task: "Fusion Splicing with Fujikura Splicer", details: "Loaded fiber cores into Fujikura 70S fusion splicer; inspected core alignment on LCD display; executed electric arc fusion achieving splice loss of 0.02 dB." },
          { day: "Thursday", date: "Day 44", task: "Optical Time-Domain Reflectometer (OTDR) Auditing", details: "Connected Anritsu OTDR tester to 2.5 km campus fiber backbone; analyzed backscatter curve, locating micro-bends and Rayleigh scattering anomalies." },
          { day: "Friday", date: "Day 45", task: "Optical Power Meter (OPM) Attenuation Loss Testing", details: "Measured end-to-end decibel loss across 1310nm and 1550nm wavelengths using optical light source and power meter; verified total link budget within acceptable -18 dBm margin." }
        ],
        weeklySummary: "Executed precision fusion splicing of single-mode optical fiber with 0.02 dB loss and conducted OTDR reflective trace analysis.",
        sketchTitle: "Fusion Splicer Electric Arc Core Alignment Process",
        sketchDescription: "Illustration showing two glass fiber cladding ends aligned on V-grooves under high-voltage electric arc discharge."
      },
      {
        weekNumber: 10,
        theme: "Network Monitoring, SNMP Telemetry & Zabbix Alerting",
        days: [
          { day: "Monday", date: "Day 46", task: "Simple Network Management Protocol (SNMPv3) Theory", details: "Studied SNMP Architecture (Management Information Bases - MIBs, Object Identifiers - OIDs); configured SNMPv3 with SHA authentication and AES encryption on core routers." },
          { day: "Tuesday", date: "Day 47", task: "Zabbix Monitoring Server Installation", details: "Installed Zabbix 6.0 LTS server on Linux; configured PostgreSQL database backend and web frontend dashboard." },
          { day: "Wednesday", date: "Day 48", task: "SNMP Host Discovery & Interface Item Polling", details: "Added core switches to Zabbix host list via SNMPv3; configured polling intervals for interface bandwidth utilization (ifInOctets, ifOutOctets) and CPU temperature." },
          { day: "Thursday", date: "Day 49", task: "Trigger Definition & Automated Telegram Alerting", details: "Wrote custom triggers alerting when link utilization exceeds 85% for 5 consecutive minutes; integrated Python webhook forwarding alerts to NOC Telegram channel." },
          { day: "Friday", date: "Day 50", task: "Weekly SLA Telemetry Reporting & Graph Auditing", details: "Generated monthly network uptime and latency graphs; compiled SLA report demonstrating 99.94% core network availability across the infrastructure." }
        ],
        weeklySummary: "Implemented centralized network observability using SNMPv3 and Zabbix, engineering real-time Telegram alerting pipelines.",
        sketchTitle: "SNMPv3 Manager-to-Agent Polling & Trap Flowchart",
        sketchDescription: "Schematic displaying Zabbix server polling SNMP agents via GetRequest and receiving asynchronous SNMP Trap alert datagrams."
      },
      {
        weekNumber: 11,
        theme: "Cybersecurity, Firewalls & VPN Gateway Deployment",
        days: [
          { day: "Monday", date: "Day 51", task: "Perimeter Security & Next-Generation Firewalls (NGFW)", details: "Studied packet filtering vs stateful inspection vs deep packet inspection (DPI); accessed pfSense firewall web interface to inspect interface state tables." },
          { day: "Tuesday", date: "Day 52", task: "Firewall Rule Formulation & Port Forwarding", details: "Configured inbound NAT port forwarding rules allowing HTTPS traffic to DMZ reverse proxy; blocked all inbound ICMP and unencrypted management services." },
          { day: "Wednesday", date: "Day 53", task: "OpenVPN Remote-Access Server Setup", details: "Generated Certificate Authority (CA), server certificates, and Diffie-Hellman parameters using Easy-RSA; configured OpenVPN daemon on UDP port 1194." },
          { day: "Thursday", date: "Day 54", task: "Client VPN Profile Distribution & Tunnel Testing", details: "Generated secure .ovpn client configuration profiles with embedded TLS certificates; connected remote client from external cellular network; verified encrypted split-tunnel routing." },
          { day: "Friday", date: "Day 55", task: "Wireshark Verification of Encrypted VPN Payloads", details: "Captured raw packets on external WAN interface during active VPN session; verified that all corporate payload data was cryptographically obfuscated with AES-256-GCM." }
        ],
        weeklySummary: "Configured stateful firewall perimeter protection, established OpenVPN SSL remote-access gateways, and verified payload encryption via packet analysis.",
        sketchTitle: "OpenVPN Encrypted Split-Tunnel Architecture",
        sketchDescription: "Diagram depicting remote laptop establishing AES-256 encrypted tunnel across public Internet to corporate internal LAN."
      },
      {
        weekNumber: 12,
        theme: "Mid-Term Technical Review, Documentation & Supervisor Assessment",
        days: [
          { day: "Monday", date: "Day 56", task: "Technical Logbook Mid-Term Consolidation", details: "Consolidated all completed daily engineering entries, network topology schematics, and configuration logs from Weeks 1 through 11." },
          { day: "Tuesday", date: "Day 57", task: "Practical Competency Demonstration (Switching & Cabling)", details: "Executed hands-on technical demonstration for senior network engineers: terminated Cat6 patch cable and configured multi-VLAN switch from bare console in 15 minutes." },
          { day: "Wednesday", date: "Day 58", task: "Industry Supervisor Assessment Interview", details: "Attended formal mid-term evaluation interview with designated industry supervisor; reviewed performance metrics, punctuality, and technical problem-solving acumen." },
          { day: "Thursday", date: "Day 59", task: "Institutional Logbook Verification & Sign-Off", details: "Presented official ITF logbook for mid-term institutional stamping; received commendation on structured diagram illustrations." },
          { day: "Friday", date: "Day 60", task: "Second-Half Research Project Planning", details: "Finalized project roadmap for the second half of the internship, focusing on software backend engineering and API design." }
        ],
        weeklySummary: "Completed comprehensive mid-term evaluation, demonstrated technical competencies in switching and cabling, and obtained official supervisor endorsement.",
        sketchTitle: "Mid-Term Comprehensive Network Infrastructure Overview",
        sketchDescription: "Composite schematic mapping the interconnected campus infrastructure deployed over the initial 12 weeks of training."
      }
    ];

    // For 24 weeks, repeat with advanced specialized modules (Weeks 13-24)
    if (numWeeks === 24) {
      const advanced12Weeks = [
        {
          weekNumber: 13,
          theme: "RESTful API Engineering with Python FastAPI & Async Architecture",
          days: [
            { day: "Monday", date: "Day 61", task: "Modern Asynchronous Python & ASGI Overview", details: "Studied async/await event loops and the ASGI specification; initialized a new FastAPI backend project with Uvicorn server." },
            { day: "Tuesday", date: "Day 62", task: "Pydantic Schema Validation & Data Contracts", details: "Wrote strict Pydantic schemas validating incoming JSON payloads for accommodation booking (student matric, room ID, bed number)." },
            { day: "Wednesday", date: "Day 63", task: "REST API Route Implementation & HTTP Status Codes", details: "Implemented GET /rooms, POST /allocate, and GET /my-allocation endpoints with proper HTTP 200, 201, 400, and 409 status returns." },
            { day: "Thursday", date: "Day 64", task: "Swagger UI & OpenAPI Automated Documentation", details: "Tested all API endpoints using interactive Swagger UI (/docs); verified automatic JSON schema validation and error responses." },
            { day: "Friday", date: "Day 65", task: "Asynchronous Database Connection Pool Management", details: "Integrated asyncpg connection pooling with PostgreSQL; stress tested concurrent connections to optimize database pool size." }
          ],
          weeklySummary: "Constructed asynchronous RESTful microservices in Python using FastAPI, Pydantic data validation, and automated Swagger API documentation.",
          sketchTitle: "FastAPI Asynchronous Event-Loop Architecture",
          sketchDescription: "Schematic displaying non-blocking I/O event loop dispatching incoming HTTP requests to worker threads."
        },
        {
          weekNumber: 14,
          theme: "Database Concurrency Control & Row-Level Locking Implementation",
          days: [
            { day: "Monday", date: "Day 66", task: "Concurrency Anomalies & Race Conditions Study", details: "Simulated race conditions where two concurrent HTTP requests claim the same bedspace simultaneously using multi-threaded Python scripts." },
            { day: "Tuesday", date: "Day 67", task: "Pessimistic Row-Level Locking with SELECT FOR UPDATE", details: "Implemented SELECT ... FOR UPDATE in SQL transactions, ensuring exclusive locking of specific room records during active allocation." },
            { day: "Wednesday", date: "Day 68", task: "SQLite BEGIN IMMEDIATE Transaction Handling", details: "Implemented BEGIN IMMEDIATE write-lock semantics for SQLite local viva runner, preventing multi-process write collisions." },
            { day: "Thursday", date: "Day 69", task: "Deadlock Detection & Graceful Transaction Rollbacks", details: "Engineered try/except transaction rollback blocks; verified that aborted transactions cleanly release locks without leaking memory." },
            { day: "Friday", date: "Day 70", task: "Apache JMeter Concurrency Benchmarking", details: "Simulated 200 concurrent requests competing for 10 beds using JMeter; verified zero double-allocations (10 success, 190 HTTP 409 rejections)." }
          ],
          weeklySummary: "Engineered pessimistic row-level database locking, completely eliminating double-allocation race conditions under high concurrent load.",
          sketchTitle: "Row-Level Locking Transaction State Timeline",
          sketchDescription: "Timeline diagram showing Transaction A locking Row #14, forcing Transaction B to wait until A commits."
        },
        {
          weekNumber: 15,
          theme: "Frontend Engineering with Next.js, React & Tailwind CSS",
          days: [
            { day: "Monday", date: "Day 71", task: "React 19 & Next.js App Router Architecture", details: "Structured modern Next.js project utilizing React Server Components (RSC) and Client Components for dynamic form interactivity." },
            { day: "Tuesday", date: "Day 72", task: "Tailwind CSS Utility Styling & Responsive Layouts", details: "Built responsive grid layouts with Tailwind CSS; implemented mobile-first breakpoints ensuring seamless rendering on smartphones." },
            { day: "Wednesday", date: "Day 73", task: "Client-Side State Management with React Hooks", details: "Implemented useState and useEffect hooks for real-time room filtering, interactive chapter exploration, and modal dialogues." },
            { day: "Thursday", date: "Day 74", task: "API Fetching & Error Boundary Handling", details: "Wrote resilient async fetch handlers communicating with FastAPI backend; designed accessible UI error banners for network timeouts." },
            { day: "Friday", date: "Day 75", task: "Lighthouse Performance & Accessibility Optimization", details: "Audited web pages using Chrome DevTools Lighthouse; achieved 98/100 Performance and 100/100 Accessibility scores." }
          ],
          weeklySummary: "Developed responsive web user interfaces using Next.js and Tailwind CSS, achieving high accessibility and sub-second rendering speeds.",
          sketchTitle: "Next.js App Router Client-Server Component Boundary",
          sketchDescription: "Diagram depicting server-rendered layout wrapping dynamic client-rendered interactive state components."
        },
        {
          weekNumber: 16,
          theme: "Facility Maintenance Ticketing Subsystem Implementation",
          days: [
            { day: "Monday", date: "Day 76", task: "Maintenance Domain Modeling & Entity Schema", details: "Designed database schema for maintenance tickets: ticket_id, student_id, room_id, issue_category, description, severity, status." },
            { day: "Tuesday", date: "Day 77", task: "Student Ticketing Portal UI Implementation", details: "Constructed frontend lodging form allowing students to select defect category (Plumbing, Electrical, Carpentry) and priority tags." },
            { day: "Wednesday", date: "Day 78", task: "Automated Ticket Routing & Queue Management", details: "Engineered backend dispatch logic routing plumbing tickets to facility plumbers and electrical faults to campus electricians." },
            { day: "Thursday", date: "Day 79", task: "Technician Status Updates & Work Order Telemetry", details: "Built technician portal allowing maintenance artisans to mark tickets as IN_PROGRESS and RESOLVED with completion notes." },
            { day: "Friday", date: "Day 80", task: "Maintenance Resolution MTTR Analytics Dashboard", details: "Created administrative visualization dashboard tracking Mean Time to Repair (MTTR) and recurring infrastructural fault patterns." }
          ],
          weeklySummary: "Constructed an end-to-end digital maintenance ticketing pipeline, automating technician dispatch and work order resolution tracking.",
          sketchTitle: "Maintenance Ticket Lifecycle State Machine",
          sketchDescription: "State transition diagram: LOGGED -> DISPATCHED -> IN_PROGRESS -> RESOLVED -> VERIFIED."
        },
        {
          weekNumber: 17,
          theme: "Docker Containerization, Multi-Stage Builds & Orchestration",
          days: [
            { day: "Monday", date: "Day 81", task: "Docker Architecture & Linux Containers Primer", details: "Studied namespaces, cgroups, and container isolation; installed Docker Engine and Docker Compose on development server." },
            { day: "Tuesday", date: "Day 82", task: "Dockerfile Construction with Multi-Stage Builds", details: "Wrote optimized multi-stage Dockerfile for Next.js application, reducing final container production image size from 1.2 GB to 84 MB." },
            { day: "Wednesday", date: "Day 83", task: "Dockerizing Python Backend Microservices", details: "Built lightweight Python Alpine container image; configured non-root application user for enhanced container security." },
            { day: "Thursday", date: "Day 84", task: "Docker Compose Multi-Container Orchestration", details: "Authored docker-compose.yml orchestrating web frontend, API backend, PostgreSQL database, and Redis cache with isolated bridge networks." },
            { day: "Friday", date: "Day 85", task: "Container Health Checks & Volume Persistence", details: "Configured automated container HEALTHCHECK commands and mapped named Docker volumes for persistent database storage." }
          ],
          weeklySummary: "Containerized full-stack application microservices using multi-stage Dockerfiles and orchestrated deployments via Docker Compose.",
          sketchTitle: "Docker Multi-Container Bridge Network Architecture",
          sketchDescription: "Schematic displaying frontend, backend, and database containers communicating across an isolated internal Docker bridge network."
        },
        {
          weekNumber: 18,
          theme: "Cloud Storage, AWS S3 / Cloudflare R2 & Object Buckets",
          days: [
            { day: "Monday", date: "Day 86", task: "Object Storage Theory & S3-Compatible APIs", details: "Studied differences between block storage, file systems, and S3-compatible object storage for persistent user document hosting." },
            { day: "Tuesday", date: "Day 87", task: "Cloudflare R2 Bucket Provisioning", details: "Created private Cloudflare R2 bucket; configured CORS policies and access keys for programmatic file read/write." },
            { day: "Wednesday", date: "Day 88", task: "Boto3 Python SDK Integration for File Uploads", details: "Wrote Python service using Boto3 SDK to automatically upload generated .docx and .pptx deliverables directly to R2 bucket." },
            { day: "Thursday", date: "Day 89", task: "Presigned URL Generation for Secure Downloads", details: "Implemented temporary cryptographic Presigned URLs with 15-minute expiration, allowing paid students to securely download files without exposing S3 keys." },
            { day: "Friday", date: "Day 90", task: "Lifecycle Expiration Policies & Storage Cost Optimization", details: "Configured bucket lifecycle management rules automatically moving temporary scratch files to expiration after 30 days." }
          ],
          weeklySummary: "Integrated Cloudflare R2 object storage with Python Boto3, implementing time-limited presigned URLs for secure file distribution.",
          sketchTitle: "S3 Presigned URL Secure Download Request Flow",
          sketchDescription: "Sequence diagram showing client requesting download link, backend signing HMAC presigned URL, and client streaming directly from R2."
        },
        {
          weekNumber: 19,
          theme: "Continuous Integration & Automated Testing Pipelines (CI/CD)",
          days: [
            { day: "Monday", date: "Day 91", task: "CI/CD Principles & GitHub Actions Workflow Setup", details: "Studied continuous integration methodologies; created .github/workflows/ci.yml configuration file triggered on Git push." },
            { day: "Tuesday", date: "Day 92", task: "Automated Linting & TypeScript Type Checking", details: "Configured ESLint and TypeScript compiler verification steps; prevented pull requests with lint errors from merging to main." },
            { day: "Wednesday", date: "Day 93", task: "Automated PyTest & Unit Test Suite Execution", details: "Configured GitHub Actions runner to execute full PyTest suite across simulated Python 3.10 and 3.11 matrix environments." },
            { day: "Thursday", date: "Day 94", task: "End-to-End Automated Testing with Playwright", details: "Wrote headless browser tests using Playwright validating login flows, room reservations, and download button clicks in headless Chrome." },
            { day: "Friday", date: "Day 95", task: "Automated Docker Image Build & Registry Pushes", details: "Configured CI pipeline to automatically build, tag, and push verified Docker container images to GitHub Container Registry (GHCR)." }
          ],
          weeklySummary: "Constructed automated CI/CD pipelines using GitHub Actions, integrating linting, unit testing, and Playwright end-to-end browser automation.",
          sketchTitle: "Continuous Integration & Deployment (CI/CD) Pipeline Stages",
          sketchDescription: "Flowchart showing Code Commit -> Lint & Typecheck -> Unit Tests -> E2E Playwright Tests -> Container Registry Push."
        },
        {
          weekNumber: 20,
          theme: "Payment Gateway Integration & Webhook Security (Paystack/Flutterwave)",
          days: [
            { day: "Monday", date: "Day 96", task: "Fintech Gateway Architecture & Payment Life Cycles", details: "Studied Nigerian fintech payment rails (Paystack / Flutterwave), webhooks, and asynchronous transaction settlement." },
            { day: "Tuesday", date: "Day 97", task: "Server-Side Transaction Initialization API", details: "Built /api/payments/paystack/initialize endpoint generating unique transaction references and returning secure checkout URLs." },
            { day: "Wednesday", date: "Day 98", task: "HMAC SHA512 Webhook Signature Validation", details: "Implemented cryptographic verification of the x-paystack-signature header using HMAC SHA512, ensuring webhooks originate genuinely from Paystack." },
            { day: "Thursday", date: "Day 99", task: "Idempotent Credit Fulfillment & Transaction Ledger", details: "Engineered database ledger tracking transaction references; ensured duplicate webhook events never double-credit student accounts." },
            { day: "Friday", date: "Day 100", task: "End-to-End Payment Verification Simulation", details: "Simulated successful bank transfer and card payments using Paystack sandbox test cards; verified instant plan activation and receipt generation." }
          ],
          weeklySummary: "Implemented secure fintech payment workflows with Paystack, including HMAC SHA512 webhook signature verification and idempotent processing.",
          sketchTitle: "Paystack HMAC Webhook Verification & Credit Lifecycle",
          sketchDescription: "Diagram showing Paystack firing charge.success event, backend validating HMAC signature, updating ledger, and unlocking student download."
        },
        {
          weekNumber: 21,
          theme: "Viva Voce Defense Preparation: Standalone Batch Script Runner",
          days: [
            { day: "Monday", date: "Day 101", task: "Viva Defense Constraints & Examiner Environments", details: "Analyzed defense day failure risks: lack of campus internet, missing Python libraries, and restrictive examiner laptop policies." },
            { day: "Tuesday", date: "Day 102", task: "run_project.bat Windows Batch Launcher Engineering", details: "Authored standalone Windows batch script that checks Python installation, initializes SQLite database, and handles zero-pip execution." },
            { day: "Wednesday", date: "Day 103", task: "Automated Browser Auto-Launch Logic", details: "Added batch commands that wait 1.5 seconds for local HTTP server startup and automatically trigger default browser on http://localhost:8000." },
            { day: "Thursday", date: "Day 104", task: "Database Seeding with Realistic Mock Records", details: "Wrote automated SQL seed script populating 8 hostels, 48 rooms, and realistic student records to ensure immediate visual demonstration." },
            { day: "Friday", date: "Day 105", task: "Zero-Dependency USB Flash Drive Packaging", details: "Packaged full codebase and launcher onto portable USB flash drive; executed test run on an offline Windows PC with 100% startup success." }
          ],
          weeklySummary: "Engineered a robust, zero-pip Windows batch launcher (run_project.bat) enabling seamless offline demonstration during project defense.",
          sketchTitle: "run_project.bat Offline Startup Execution Flow",
          sketchDescription: "Flowchart showing batch script detecting Python -> Initializing SQLite Schema -> Starting HTTP Server -> Opening Browser."
        },
        {
          weekNumber: 22,
          theme: "User Acceptance Testing (UAT) & Empirical Usability Evaluation",
          days: [
            { day: "Monday", date: "Day 106", task: "UAT Protocol Design & Participant Cohort Selection", details: "Formulated formal User Acceptance Testing protocol; recruited 100 participants (85 undergraduate students, 15 administrative staff)." },
            { day: "Tuesday", date: "Day 107", task: "Task Execution & Time-Motion Latency Measurement", details: "Supervised participants executing standard tasks: student registration, room reservation, docket printing, and maintenance lodging." },
            { day: "Wednesday", date: "Day 108", task: "System Usability Scale (SUS) Survey Administration", details: "Administered standardized 10-item Likert-scale System Usability Scale (SUS) questionnaire to all 100 participants." },
            { day: "Thursday", date: "Day 109", task: "Statistical Data Analysis & SUS Score Calculation", details: "Calculated composite SUS scores using Brooke's psychometric formula; achieved an exceptional mean usability score of 88.5 out of 100." },
            { day: "Friday", date: "Day 110", task: "Qualitative Feedback Synthesis & Ergonomic Refinement", details: "Synthesized qualitative participant comments; refined button labels, enhanced contrast ratios, and added instant feedback toasts." }
          ],
          weeklySummary: "Administered formal User Acceptance Testing with 100 university stakeholders, empirically recording a Grade A (88.5/100) System Usability Scale score.",
          sketchTitle: "System Usability Scale (SUS) Empirical Score Distribution",
          sketchDescription: "Histogram displaying participant SUS usability ratings clustering heavily in the 85-95 Excellent range."
        },
        {
          weekNumber: 23,
          theme: "Comprehensive Final Report Compilation & Technical Documentation",
          days: [
            { day: "Monday", date: "Day 111", task: "Final Technical Report Structure & Chapter Drafting", details: "Drafted preliminary pages, Table of Contents, and Chapter 1 (Introduction and Organizational Profile) of the 5-chapter ITF Technical Report." },
            { day: "Tuesday", date: "Day 112", task: "Chapter 2 & 3 Technical Exposition Drafting", details: "Authored comprehensive discourse for Chapter 2 (Departmental Rotations and Safety) and Chapter 3 (Network Engineering & Software Projects)." },
            { day: "Wednesday", date: "Day 113", task: "Chapter 4 & 5 Troubleshooting & Recommendations", details: "Documented technical challenges encountered, debugging methodologies, and tendering actionable recommendations to ITF and host establishment." },
            { day: "Thursday", date: "Day 114", task: "1.5-Inch Hardcover Margin Formatting & Table Alignment", details: "Formatted Word document according to academic hardcover binding standards (1.5 inch left margin, 1.0 inch right, 2-column borderless TOC)." },
            { day: "Friday", date: "Day 115", task: "Supervisor Preliminary Review & Draft Corrections", details: "Submitted preliminary draft to industry supervisor for technical review; incorporated constructive feedback on networking schematics." }
          ],
          weeklySummary: "Compiled full 5-chapter SIWES technical report conforming to academic hardcover binding guidelines and institutional standards.",
          sketchTitle: "Academic Document Hardcover 1.5-Inch Binding Margin Layout",
          sketchDescription: "Diagram showing page dimensions with 1.5-inch gutter margin on left edge for bookbinding and 1.0-inch margins on all other sides."
        },
        {
          weekNumber: 24,
          theme: "Internship Debriefing, Knowledge Handover & Final Institutional Sign-Off",
          days: [
            { day: "Monday", date: "Day 116", task: "Source Code & Repository Handover", details: "Packaged all software repositories, database migration scripts, and documentation; transferred administrative credentials to company lead engineer." },
            { day: "Tuesday", date: "Day 117", task: "Data Center Tool Handover & Workstation De-provisioning", details: "Returned company-issued diagnostic tools, console cables, and equipment; safely wiped developer workstation in compliance with corporate security policy." },
            { day: "Wednesday", date: "Day 118", task: "Final Departmental Exit Presentation", details: "Delivered 20-minute technical slide presentation to department team, summarizing major projects completed, metrics achieved, and lessons learned." },
            { day: "Thursday", date: "Day 119", task: "Official Employer Evaluation Form (ITF Form 8) Completion", details: "Conducted exit performance appraisal with industry supervisor; completed and stamped official ITF Form 8 with highest commendation marks." },
            { day: "Friday", date: "Day 120", task: "Final Institutional Logbook Sign-Off & Closing Retrospective", details: "Obtained final physical stamps and signatures across all 24 weekly logbook pages, officially concluding the 6-month SIWES internship." }
          ],
          weeklySummary: "Successfully completed final knowledge transfer, delivered departmental exit presentation, and obtained full supervisor and ITF certification sign-offs.",
          sketchTitle: "24-Week Industrial Training Milestone Roadmap",
          sketchDescription: "Timeline milestone chart tracing progression from Week 1 Safety Orientation through Week 24 Final Institutional Sign-off."
        }
      ];

      full24WeekSyllabus.push(...advanced12Weeks);
    }

    const weeksToRender = full24WeekSyllabus.slice(0, numWeeks);

    const docChildren: (Paragraph | Table)[] = [];

    // Title & Header Page
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 800, after: 160 },
        children: [
          new TextRun({
            text: "STUDENTS INDUSTRIAL WORK EXPERIENCE SCHEME (SIWES)",
            bold: true,
            size: 30, // 15pt
            color: "000000",
            font: "Times New Roman",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: "OFFICIAL WEEKLY TECHNICAL LOGBOOK & DAILY WORK RECORD",
            bold: true,
            size: 24, // 12pt
            color: "0369A1",
            font: "Times New Roman",
          }),
        ],
      })
    );

    // Metadata Table
    const metaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Discipline / Course:", bold: true, size: 20, font: "Times New Roman" })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: course || "Computer Science / Engineering", size: 20, font: "Times New Roman" })],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Establishment / Company:", bold: true, size: 20, font: "Times New Roman" })],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: company || "Tier III Enterprise Data Center", size: 20, font: "Times New Roman" })],
                }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Training Duration:", bold: true, size: 20, font: "Times New Roman" })],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${numWeeks} Weeks (${numWeeks === 12 ? "3 Months" : "6 Months"}) — 100% Comprehensive Daily Entries`,
                      bold: true,
                      size: 20,
                      font: "Times New Roman",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });

    docChildren.push(metaTable);
    docChildren.push(new Paragraph({ spacing: { after: 400 }, children: [new PageBreak()] }));

    // Loop through each week and output complete daily logs, supervisor remarks & diagrams
    for (const week of weeksToRender) {
      // Week Header
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 120 },
          children: [
            new TextRun({
              text: `WEEK ${week.weekNumber}: ${week.theme.toUpperCase()}`,
              bold: true,
              size: 22,
              color: "000000",
              font: "Times New Roman",
            }),
          ],
        })
      );

      // Daily Table
      const tableRows: TableRow[] = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 22, type: WidthType.PERCENTAGE },
              shading: { fill: "F1F5F9" },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Day & Date", bold: true, size: 19, font: "Times New Roman" })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 78, type: WidthType.PERCENTAGE },
              shading: { fill: "F1F5F9" },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: "Description of Technical Tasks & Engineering Operations", bold: true, size: 19, font: "Times New Roman" })],
                }),
              ],
            }),
          ],
        }),
      ];

      for (const day of week.days) {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${day.day} (${day.date})`, bold: true, size: 18, font: "Times New Roman" }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    spacing: { after: 60, line: 300 },
                    children: [
                      new TextRun({ text: `${day.task}: `, bold: true, size: 18, font: "Times New Roman" }),
                      new TextRun({ text: day.details, size: 18, font: "Times New Roman" }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );
      }

      const weekTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows,
      });

      docChildren.push(weekTable);

      // Weekly Summary Section
      docChildren.push(
        new Paragraph({
          spacing: { before: 140, after: 80 },
          children: [
            new TextRun({
              text: "Weekly Technical Competency Summary: ",
              bold: true,
              size: 20,
              font: "Times New Roman",
            }),
            new TextRun({
              text: week.weeklySummary,
              size: 20,
              font: "Times New Roman",
            }),
          ],
        }),
        // Weekly Sketch Guide
        new Paragraph({
          spacing: { before: 80, after: 120 },
          children: [
            new TextRun({
              text: `Technical Sketch / Diagram Guide [${week.sketchTitle}]: `,
              bold: true,
              italics: true,
              size: 19,
              font: "Times New Roman",
              color: "0369A1",
            }),
            new TextRun({
              text: week.sketchDescription,
              size: 19,
              italics: true,
              font: "Times New Roman",
            }),
          ],
        }),
        // Supervisor Sign-off Box
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      spacing: { before: 60, after: 60 },
                      children: [
                        new TextRun({
                          text: "Industry Supervisor Assessment: [X] Excellent  [ ] Good  [ ] Satisfactory\nSignature & Date: ____________________________________",
                          size: 17,
                          font: "Times New Roman",
                        }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      spacing: { before: 60, after: 60 },
                      children: [
                        new TextRun({
                          text: "Institution-Based Supervisor Stamp / Remarks:\nOfficial Stamp: ______________________________________",
                          size: 17,
                          font: "Times New Roman",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ children: [new PageBreak()] })
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                left: 2160, // 1.5 inches for hardcover binding
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
      toolId: 'siwes-logbook',
      title: `${numWeeks}-Week SIWES Industrial Training Logbook`,
      course,
      institution: 'Nigerian Tertiary Institution',
      summary: `Complete ${numWeeks}-Week day-by-day industrial attachment logbook for ${company}.`,
      fileType: 'docx',
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="SIWES_Logbook_${(course || "Course").replace(/\s+/g, "_")}.docx"`,
        "X-Remaining-Credits": String(creditCheck.remainingCredits),
      },
    });
  } catch (error) {
    console.error("Error generating SIWES docx:", error);
    return NextResponse.json({ error: "Failed to generate SIWES logbook" }, { status: 500 });
  }
}
