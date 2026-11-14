# CODETHESIS AI — MASTER PAGE ARCHITECTURE & MOTION DESIGN SPECIFICATION
> **Document Version**: 1.0.0 (Production Reference)  
> **Status**: APPROVED PERMANENT SPECIFICATION  
> **Core Focus**: Complete Page Directory (19 Pages + API Engines) & Tactile Animation System (Framer Motion / Tailwind Keyframes)

---

# PART 1: COMPLETE PLATFORM PAGE ARCHITECTURE (19 PAGES)

## Tier 1: The 2 Flagship Workspaces (Core Command Centers)
1. **`/dashboard` — Student Command Center (The Flagship Reference UI)**
   - **Visual Anchor**: Matches the reference UI (`media_1794651655004.jpg`) with 100% fidelity.
   - **Components**: Fixed Midnight Navy sidebar, ambient cyan glow, top search pill `(Ctrl + K)`, notification center with counter badge `3`, theme toggle, 3D Hero Banner (`Welcome back, Adebayo! 👋`), 3x3 Academic Tools grid with custom squircle gradient badges, Royal Cobalt `"Your Credits"` telemetry widget, `"Recent Projects"` quick-open list, `"Why Choose CodeThesis AI?"` authority card with 3D growth bars, student testimonial carousel, and the 3D support avatar card.

2. **`/studio` — The Academic Studio (All-in-One Split-Pane Workspace)**
   - **Ergonomics**: Gamma.app + Notion AI split-pane layout with fluid resizing and zero state loss.
   - **Left Control Pane (35%)**:
     - Academic Setup: Course selector (16+ accredited degree programs + custom input toggle), Institution, Topic, Case Study, Academic Session, Student Name (ALL CAPS), Matric Number.
     - Interactive Chapter Tree: Instant jump navigation across Preliminary Pages, Chapters 1–5, and Table of Contents.
     - Academic AI Copilot: In-context chat assistant to refine paragraphs, generate subheadings, and re-cite DOIs.
     - Telemetry Tickers: Live word count (8,926+ words), Turnitin similarity risk gauge (<5%), and APA 7th compliance badge.
   - **Right Canvas Pane (65%)**:
     - **Tab 1: 5-Chapter Thesis**: Simulated A4 paper sheet with 1.5-inch hardcover binding margin guide, borderless 2-column TOC, and verified Crossref citations.
     - **Tab 2: Software & Database**: In-browser Code IDE with file explorer (`app.py`, `database.py`, `schema.sql`, `run_project.bat`, `README.md`) + 1-click ZIP export.
     - **Tab 3: UML Architecture Engine**: Interactive SVG vector diagrams and Mermaid syntax editor for Use Case, Sequence with Row-level Lock handshake, 3-Tier Architecture, and Relational ERD.
     - **Tab 4: Viva Defense Suite**: 15-slide widescreen presentation deck carousel + interactive counter-argument defense simulator.
   - **Export Hub**: Direct downloads for `.docx`, `.pptx`, and `.zip`.

---

## Tier 2: The 8 Standalone Academic Tool Suites (`/tool/*`)
3. **`/tool/thesis` — 5-Chapter Academic Thesis Generator**
   - **Scope**: ~18,000+ words target, spanning 35–45 formatted pages.
   - **Formatting**: Times New Roman 12pt, 1.5 line spacing, 1.5-inch Left binding margin, 1.0-inch Top/Bottom/Right margins.
   - **Sections**: Preliminary (Title, Declaration, Certification, Dedication, Acknowledgements, Abstract), Chapters 1 to 5, 2-column borderless Table of Contents with dot leaders, and real Crossref DOI references.
   - **Export**: Institutional `.docx` download.

4. **`/tool/software-builder` — Turnkey Software & Database Builder**
   - **Technology**: Zero-pip Python (Flask/FastAPI) + SQLite.
   - **1-Click Offline Launcher (`run_project.bat`)**: Checks Python runtime, initializes database with 50+ pre-seeded records, auto-launches web browser to `http://localhost:8000`, and starts the server.
   - **ZIP Packaging**: Complete source repository with templates, static assets, seeds, and supervisor README.

5. **`/tool/uml-diagrams` — UML & Architecture Engine**
   - **Models**: Use Case Diagram, Sequence Diagram (with Database Row-Level Locking transaction handshake), Decoupled 3-Tier Architecture (Presentation -> Application -> Persistence), and Relational ERD Schema (PK, FK, 1:N, M:N).
   - **Dual Display**: Interactive vector SVG diagram viewer + editable Mermaid syntax with 1-click `.mmd` download.

6. **`/tool/viva-presentation` — Viva 15-Slide Presentation Deck**
   - **Format**: 16:9 widescreen presentation deck.
   - **Color Theme**: Midnight Navy background with crisp white typography and metallic gold accents.
   - **Slide Structure**: Title -> Motivation -> Problem Statement -> Objectives -> Theoretical Foundation -> Methodology -> 3-Tier Architecture -> Database Schema -> Concurrency Test Results -> Live Demo Highlights -> Cost-Benefit Analysis -> Recommendations -> Q&A.
   - **Export**: Native editable `.pptx` via `pptxgenjs`.

7. **`/tool/viva-simulator` — Interactive Oral Defense Simulator**
   - **Examiner Persona**: Strict senior university professor grilling architectural design, concurrency traps, and Big-O complexity.
   - **Speech-to-Text**: Live microphone input via Web Speech API (`webkitSpeechRecognition`).
   - **Text-to-Speech**: Audio question playback at academic cadence (0.95x speed) via `window.speechSynthesis`.
   - **Intelligent Scoring**: 1.0 to 10.0 evaluation heuristic based on technical depth, ACID transaction principles, and security.
   - **Export**: 20-Question Defense Cheatsheet `.docx` with panelist traps and model answers.

8. **`/tool/siwes-logbook` — SIWES Daily Logbook Engine (12 & 24 Weeks)**
   - **Scope**: 60 to 120 unique daily technical logs (Monday to Friday) covering workplace safety, Cat6 structured cabling, Cisco switch configuration, VLAN segmentation, subnetting, database backups, and hardware maintenance.
   - **Schematic Blueprint Guides**: Weekly technical diagrams (Server Rack 42U elevation, T568B RJ45 color wiring, VLAN topology, OSPF Area 0 routing).
   - **Supervisor Section**: Progressive weekly remarks, endorsement signatures, and assessment ratings.
   - **Export**: Official ITF table layout `.docx`.

9. **`/tool/itf-report` — 5-Chapter ITF Technical Report**
   - **Scope**: 30–50 page comprehensive industrial training defense report.
   - **Chapters**: Ch 1 (ITF & SIWES Introduction), Ch 2 (Host Organization Profile, Organogram & HSE Rules), Ch 3 (Practical Technical Work Experience), Ch 4 (Industrial Challenges & Solutions), Ch 5 (Conclusion & Recommendations).
   - **Export**: Institutional `.docx` document.

10. **`/tool/assignment-solver` — Assignment & Computational Proof Solver**
    - **Disciplines**: Step-by-step formal mathematical induction proofs, Relational Database Normalization (1NF -> 2NF -> 3NF decompositions with functional dependency graphs), Circuit Theory (KVL/KCL mesh & nodal analysis with matrix equations), and Computer Science (Master Theorem Big-O recurrence relations).
    - **Export**: Formatted `.docx` and raw LaTeX / Markdown.

---

## Tier 3: Student Management & Monetization Pages
11. **`/projects` — My Projects Archive & History**
    - Searchable and filterable archive of all student generation runs.
    - Filter pills: All, Dissertations, Presentations, Software Codebases, SIWES Logbooks.
    - 1-Click *"Resume in Studio"*: Pre-populates all inputs, topic, course, and chapter states without losing context.
    - Direct re-download buttons for `.docx`, `.pptx`, and `.zip`.

12. **`/pricing` / `/billing` — Plans, Credits & Payment Gateway**
    - Live Credit Balance widget with usage telemetry.
    - **Paystack API Integration**: Primary African payment rail (NGN card payments, bank transfer, USSD, OPay).
      - Tier 1: *Coursework Starter* — ₦1,500 ($1.00)
      - Tier 2: *SIWES Defender* — ₦3,500 ($2.50)
      - Tier 3: *Final Year Project Pro* — ₦8,500 ($5.50)
      - Tier 4: *Departmental / Group Pass* — ₦15,000 ($10.00)
    - **Stripe Checkout Integration**: International fallback rail for USD/GBP card payments.
    - Transaction history and downloadable payment receipts.

13. **`/settings` — Student Profile & Academic Preferences**
    - Student Full Name (ALL CAPS formatting guarantee).
    - Matriculation Number (validated against institutional formats e.g. `FUTA/CSC/20/4182`).
    - Institution Selector: 16+ Nigerian/African institutions (FUTA, UNILAG, UNN, ABU, UI, Covenant, LASU) + custom institution toggle.
    - Custom AI API Key input (BYO Gemini / OpenAI key bypass).
    - UI Theme Switcher: Light / Dark Mode preferences.

14. **`/support` — Student Help Center & Defense Advice**
    - 24/7 Academic Support Chat & WhatsApp student concierge.
    - Defense Day Checklist & Panel Preparation Guide.
    - SIWES Logbook submission requirements guide.
    - Interactive FAQ Accordion.

---

## Tier 4: Public Marketing, Auth & Institutional Compliance Pages
15. **`/` — Public Landing Page**
    - High-conversion SaaS presentation featuring 3D floating mortarboard and textbooks.
    - Institutional Trust Badges (FUTA, UNILAG, UNN, ABU, UI, Covenant, LASU).
    - Live Interactive Teasers for the 9 Tools.
    - Student Testimonials & Academic Verification metrics (Turnitin Pass Guarantee).
    - Pricing comparison and final conversion CTA.

16. **`/auth/login` & `/auth/signup` — Student Authentication**
    - Email/password authentication and institutional email verification.
    - 1-Click Instant Demo Student access (`Adebayo Tunde, FUTA`).

17. **`/terms` — Terms of Service & Academic Integrity**
    - Research assistance disclaimer, academic ethics charter, and zero-plagiarism commitment.

18. **`/privacy` — Privacy Policy & Student Data Protection**
    - Student dissertation confidentiality, zero data-resale policy, and secure PCI-compliant transaction processing.

19. **`/contact` — Contact & Departmental Licensing**
    - Inquiries for departmental volume licenses, student union executive partnerships, and technical support.

---

# PART 2: MOTION DESIGN & TACTILE ANIMATION SYSTEM

To achieve the velvet-smooth, tactile feel of **Linear**, **Notion AI**, and **Gamma.app**, the platform employs a unified animation system across micro-interactions, atmospheric physics, page transitions, and data telemetry.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CODETHESIS MOTION DESIGN SYSTEM                      │
│                                                                        │
│   [Ambient / Atmosphere]  ──►  Continuous 3D Floating & Glow Pulses    │
│   [Tactile Interactions]  ──►  Spring Hover Lifts & 95% Active Scale   │
│   [Telemetry / Numbers]   ──►  Smooth Count-Up Tickers & Progress Fill │
│   [Viva Audio Waveform]   ──►  Dynamic Real-Time Frequency Bars        │
│   [Page / View Switch]    ──►  Smooth Slide & Fade Transitions         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Atmospheric & Ambient Animations (CSS & Tailwind Keyframes)

### A. 3D Asset Floating Physics (`animate-float`)
Applied to the floating graduation mortarboard, 3D textbook stack, and 3D avatar assets.
```css
@keyframes float {
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(1deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
}

.animate-float {
  animation: float 5s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 6s ease-in-out 1.5s infinite;
}
```

### B. Ambient Neon Glow Pulse (`animate-pulse-glow`)
Applied to the bottom-left sidebar cyan orb, hero banner cyan light rings, and the credits card orb.
```css
@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.25;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(1.08);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 7s ease-in-out infinite;
}
```

### C. "All Systems Online" Radar Ping
Applied to the green status dot in the top-right hero badge.
- Outer ring: `animate-ping text-emerald-400 opacity-75` (repeating every 2s).
- Inner dot: Solid `bg-emerald-500` with subtle `shadow-emerald-500/50`.

### D. Gold Button Shimmer / Light Sweep (`animate-shimmer`)
Applied across the *"Upgrade to Pro"* sidebar card and *"Go Pro ->"* button.
```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.gold-shimmer {
  background: linear-gradient(
    110deg,
    #f59e0b 0%,
    #fbbf24 25%,
    #ffffff 50%,
    #fbbf24 75%,
    #f59e0b 100%
  );
  background-size: 200% 100%;
  animation: shimmer 4s infinite linear;
}
```

---

## 2. Tactile Hover & Click Micro-Interactions

### A. The Global Clickability Contract
Every clickable element (`button`, `a`, `select`, `[role="button"]`, card) strictly implements:
- `cursor: pointer`
- Active Click Press: `active:scale-[0.97]` or `active:scale-95` with `transition: transform 120ms ease-out`.

### B. 3x3 Tool Card Micro-Interactions
When the user hovers over any of the 9 academic tool cards:
1. **Card Elevation**: `translate-y-[-3px]` with elevation shadow `shadow-lg shadow-blue-500/5` and border transition `border-blue-300`.
2. **Squircle Icon Zoom**: The colored squircle icon badge scales up by 6% (`group-hover:scale-106 duration-200`).
3. **Action Circle Pill**: The right gray arrow circle (`w-6 h-6 bg-slate-100`) transitions smoothly to vibrant electric blue (`group-hover:bg-blue-600 group-hover:text-white`), and the arrow shifts right by 3px (`group-hover:translate-x-0.5`).

---

## 3. Data & Telemetry Animations

### A. Number Count-Up Tickers
When the Dashboard mounts or user receives credits:
- **Credits Remaining Counter**: Number rolls smoothly from `0` to `15` over 900ms using a quadratic ease-out function.
- **Word Count Telemetry (Studio)**: Live word counter increments smoothly (`0 -> 8,926+ words`) with a soft green pulse when new chapters are generated.

### B. Progress Slider Fill Animation
- The credit meter progress bar starts at `width: 0%` and smoothly animates to `width: 60%` (or current ratio) over 800ms (`ease-out`).

### C. Testimonial Carousel Transitions
- Testimonial quotes slide horizontally with a gentle cross-fade (`opacity: 0, x: 20 -> opacity: 1, x: 0`, duration 300ms) when switching between students (Ibrahim Musa, Chioma Okeke, etc.).

---

## 4. Viva Simulator Audio & Voice Animations

### A. Real-Time Dynamic Frequency Waveform
When the student speaks into their microphone during defense practice:
- A 5-bar to 12-bar audio equalizer visualizer dances dynamically:
```css
@keyframes audio-wave {
  0%, 100% { height: 6px; }
  50% { height: 26px; }
}

.wave-bar-1 { animation: audio-wave 0.8s ease-in-out infinite; }
.wave-bar-2 { animation: audio-wave 1.1s ease-in-out 0.15s infinite; }
.wave-bar-3 { animation: audio-wave 0.7s ease-in-out 0.3s infinite; }
.wave-bar-4 { animation: audio-wave 1.3s ease-in-out 0.1s infinite; }
.wave-bar-5 { animation: audio-wave 0.9s ease-in-out 0.25s infinite; }
```
- Bars are rendered in Electric Cyan with soft ambient glow.

### B. Examiner Speech Pulse Ring
When the AI examiner is speaking the question aloud via `window.speechSynthesis`:
- An animated pulsing concentric ring surrounds the professor's avatar, indicating active audio playback.

---

## 5. Academic Studio Canvas & Split-Pane Transitions

### A. Tab Switching (Thesis ↔ Code IDE ↔ UML ↔ Viva Deck)
- Content transitions via a clean spring cross-fade (`opacity: 0, y: 6 -> opacity: 1, y: 0`, duration: 200ms) to ensure instant, zero-lag tab flipping.

### B. A4 Simulated Paper Scroll
- The simulated A4 sheet has a tactile soft page shadow (`shadow-[0_10px_35px_-5px_rgba(0,0,0,0.1)]`) and displays a smooth highlight when jumping between chapters via the Chapter Tree.

---

## 6. Implementation Architecture & Performance Rules
- **Hardware Acceleration**: All transform and opacity animations use `transform: translate3d()` and `will-change: transform, opacity` where necessary to maintain a solid **60 FPS** on both mobile and desktop.
- **Respect User Preferences**: Wrapped with `@media (prefers-reduced-motion: reduce)` to disable heavy transforms for users requesting reduced motion.
- **Zero Layout Shifts (CLS = 0)**: Fixed aspect ratios and dimension bounding boxes ensure animations never cause document reflow or jitter.
