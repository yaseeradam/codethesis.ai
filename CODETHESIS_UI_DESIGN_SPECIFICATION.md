# CODETHESIS AI — MASTER UI/UX DESIGN SYSTEM SPECIFICATION
> **Document Version**: 1.0.0 (Production Reference)  
> **Source Reference Image**: `media_1794651655004.jpg` (Full High-Fidelity UI Layout)  
> **Status**: APPROVED PERMANENT SPECIFICATION — NO CODING TO COMMENCE BEFORE EXPLICIT INSTRUCTION  
> **Target Products**: Dashboard (`/dashboard`), Academic Studio (`/studio`), and the 8 Academic Tool Suites.

---

## 1. EXECUTIVE DESIGN PHILOSOPHY & AESTHETIC SIGNATURE
The CodeThesis AI platform design bridges the polished, velvet-smooth ergonomics of **Linear**, **Notion AI**, **Gamma.app**, and **v0.dev** with an authoritative academic visual identity. It completely banishes standard generic AI boilerplate cards, dull tables, and unstyled grey layouts.

### The 4 Pillars of the CodeThesis Visual Language:
1. **Midnight & Electric Atmosphere**: Deep midnight navy foundations paired with energetic cyan-blue neon glows, ambient lighting, and rich cobalt gradients.
2. **Tactile Soft Glass & Deep Elevation**: High-radius surfaces (`rounded-2xl` to `rounded-3xl`), crisp semi-transparent borders (`border-slate-200/90` in light mode, `border-blue-900/40` in dark cards), and subtle multi-layer drop shadows (`shadow-sm` up to `shadow-xl`).
3. **Vibrant Micro-Branding**: Custom 3D academic artwork (floating mortarboard, gold-tasseled cap, layered "Research-Implement-Defend" textbooks, illuminated code screen, friendly support avatar, and glowing bar charts).
4. **Scholarly Precision & Ergonomics**: High information density that remains airy, readable, and joyful. Distinct colored squircle badges for every tool to facilitate instant cognitive recognition.

---

## 2. COLOR PALETTE & DESIGN TOKENS

### A. Primary Brand Spectrum
| Token Name | Hex Code | Tailwind Equivalent | Role & Applied Context |
|---|---|---|---|
| **Midnight Navy Primary** | `#070F2B` / `#0B132B` | `bg-[#070F2B]` / `bg-[#0B132B]` | Left sidebar background, header dark cards, primary authority buttons |
| **Deep Cobalt Blue** | `#0B256B` to `#0A266E` | `bg-[#0B256B]` / `bg-[#0A266E]` | Hero banner gradient, credits widget gradient background |
| **Electric Cyan Primary** | `#0284C7` / `#00A3FF` | `bg-[#0284C7]` / `bg-[#00A3FF]` | Primary CTA buttons, active sidebar pills, glowing neon accents |
| **Vibrant Sky Accent** | `#06B6D4` / `#0EA5E9` | `bg-[#06B6D4]` / `bg-[#0EA5E9]` | Gradients, badges, upgrade plan button |
| **Scholarly Gold / Amber** | `#F59E0B` / `#D97706` | `bg-amber-500` / `bg-amber-600` | "Upgrade to Pro" pill, rating stars, gold crown accents, badges |
| **Academic Base Slate** | `#F8FAFC` to `#EDF2F9` | `bg-slate-50` / `bg-[#F1F5F9]` | Main dashboard canvas background, soft contrast surface |
| **Clean Pure White** | `#FFFFFF` | `bg-white` | Tool cards, recent project cards, search input, active card surfaces |
| **Emerald Verification** | `#10B981` / `#059669` | `text-emerald-500` / `bg-emerald-500`| "All Systems Online" badge, passing checks, green tool badge |

### B. Tool Category Squircle Badge Gradients
Each of the 9 academic tools has an unmistakable, dedicated color identity:
1. **Academic Studio**: Gradient Cyan to Royal Blue (`from-cyan-400 to-blue-500`) with white graduation cap icon.
2. **5-Chapter Thesis**: Gradient Amber to Deep Orange (`from-amber-400 to-orange-500`) with white document icon.
3. **Software Builder**: Gradient Emerald to Teal (`from-emerald-400 to-teal-500`) with white `</>` brackets icon.
4. **UML Engine**: Gradient Purple to Indigo (`from-purple-400 to-indigo-500`) with white hierarchy tree icon.
5. **Viva Presentation**: Gradient Cobalt to Deep Blue (`from-blue-500 to-indigo-600`) with white presentation display icon.
6. **Viva Simulator**: Gradient Goldenrod to Warm Amber (`from-amber-400 to-yellow-500`) with white podcast microphone icon.
7. **SIWES Logbook**: Gradient Mint to Emerald (`from-teal-400 to-emerald-500`) with white spiral notebook icon.
8. **ITF Technical Report**: Gradient Fuchsia to Deep Purple (`from-fuchsia-500 to-purple-600`) with white report clipboard icon.
9. **Assignment Solver**: Gradient Light Sky to Ocean Blue (`from-sky-400 to-cyan-600`) with white calculator icon.

---

## 3. TYPOGRAPHY & TEXT HIERARCHY
- **Primary Font Family**: Clean Humanist Sans-Serif (`Geist Sans` or `Inter`) for UI labels, titles, descriptions, and body text.
- **Monospace Family**: `JetBrains Mono` for matric numbers, Big-O notations, file paths, code snippets, and keyboard shortcuts `(Ctrl + K)`.
- **Text Scale**:
  - Hero Header: `text-3xl font-extrabold tracking-tight text-white`
  - Section Headers: `text-xl font-bold tracking-tight text-slate-900`
  - Card Titles: `text-sm font-bold text-slate-900`
  - Descriptions & Subtitles: `text-xs text-slate-500 leading-relaxed`
  - Micro Badges & Tags: `text-[11px] font-semibold tracking-wide uppercase`

---

## 4. DETAILED COMPONENT-BY-COMPONENT SPECIFICATION

### A. Left Sidebar Navigation (Fixed ~270px)
- **Container**: `bg-[#070F2B] text-slate-300 min-h-screen p-4 flex flex-col justify-between border-r border-slate-800/60 relative overflow-hidden`
- **Bottom Ambient Lighting**: A soft blue/cyan radial glow at the bottom-left corner (`bg-gradient-to-tr from-cyan-600/20 via-blue-600/10 to-transparent blur-2xl pointer-events-none`).
- **Brand Identity Block**:
  - 3D Glossy Mortarboard Icon with gold tassel atop an illuminated book base.
  - "CodeThesis AI" in bold white text (`text-lg font-bold text-white`).
  - "Build • Document • Defend" in muted cyan/slate-400 micro text (`text-[10px] tracking-widest text-cyan-300/80 uppercase font-medium`).
- **Navigation Groups**:
  - **Active State (Dashboard)**: Full pill background in electric cyan-blue (`bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] text-white font-semibold rounded-xl px-3.5 py-2.5 shadow-md flex items-center gap-3`).
  - **Inactive Items**: Slate-300 text with transparent background (`hover:bg-white/5 hover:text-white rounded-xl px-3.5 py-2.25 text-sm transition-all flex items-center gap-3 cursor-pointer`).
  - **Divider**: Subtle border stroke (`border-t border-slate-800/80 my-3`).
  - **Account & Utility Links**: My Projects, Billing & Credits, Settings, Help & Support.
- **Upgrade to Pro In-Sidebar Banner**:
  - Glass card with golden border accent (`bg-gradient-to-b from-[#131D42]/90 to-[#0B132B]/90 border border-amber-500/30 rounded-2xl p-3.5 mb-4 shadow-lg`).
  - Gold crown icon + "Upgrade to Pro" title.
  - Subtext: "Unlock unlimited access to all tools and features." (11px, slate-300).
  - Button: "Go Pro ->" (`bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-1.5 px-4 rounded-xl text-xs shadow-md transition-all`).
- **User Footer Capsule**:
  - Student avatar (round image with clean white border).
  - Name: "Adebayo Tunde" (`font-bold text-xs text-white`).
  - Department: "FUTA Student" (`text-[10px] text-slate-400`).
  - Dropdown caret icon + "Logout ->" action button.

---

### B. Top Header Bar
- **Search Capsule**:
  - Rounded pill input (`rounded-full bg-white border border-slate-200/90 px-4 py-2 text-sm shadow-xs flex items-center gap-3 w-[440px] max-w-full focus-within:ring-2 focus-within:ring-cyan-500/30`).
  - Magnifying glass icon (slate-400).
  - Placeholder: `"Search tools, projects, or features... (Ctrl + K)"`.
- **Status & Control Cluster**:
  - **Notification Bell**: Circular dark pill button with red counter badge `3` at top right.
  - **Theme Switcher**: Pill container showing Sun & Moon toggle icons.
  - **"Upgrade Plan ->" Action Button**: Vibrant electric cyan-blue gradient button (`bg-gradient-to-r from-[#0284C7] to-[#06B6D4] text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center gap-2 hover:brightness-105 active:scale-95`). Includes crown icon.

---

### C. Welcome Hero Banner
- **Container**: `bg-gradient-to-r from-[#070E27] via-[#0B1C4D] to-[#0A266E] border border-blue-900/40 rounded-3xl p-7 relative overflow-hidden shadow-xl mb-6`
- **Atmospheric Background**: Concentric neon cyan glowing energy arcs and particle lighting.
- **Top-Right Pill**:
  - "Platform Status: All Systems Online" with green glowing emerald radar dot (`bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs px-3 py-1.2 rounded-full font-medium flex items-center gap-2`).
- **Typography & Messaging**:
  - Title: "Welcome back, **Adebayo!** 👋" (`text-3xl font-extrabold text-white`).
  - Subtitle: "Your all-in-one academic engineering workspace." (`text-base font-medium text-slate-200`).
  - Tagline: "Turn your ideas into world-class projects with the power of AI." (`text-sm text-slate-400`).
- **Action Buttons**:
  - **Primary**: `"Start a New Project ->"` (`bg-[#00A3FF] hover:bg-[#0092E6] text-white font-bold px-5 py-2.5 rounded-full text-xs shadow-lg shadow-cyan-500/30 flex items-center gap-2`).
  - **Secondary**: `"Watch Demo"` with circular play icon (`border border-white/40 hover:bg-white/10 text-white font-semibold px-5 py-2.5 rounded-full text-xs flex items-center gap-2`).
- **Centerpiece 3D Visual**:
  - Floating 3D Navy & Gold Mortarboard.
  - Stack of 3 labeled academic books: **Research** (Top blue), **Implement** (Middle gold), **Defend** (Bottom blue).
  - Sleek open laptop displaying glowing blue `</>` code on screen.

---

### D. 2-Column Main Workspace Grid

#### 1. Left Column (68% Width): "Our 9 Powerful Academic Tools"
- **Section Header**:
  - 4-squares cyan grid icon + "Our 9 Powerful Academic Tools" (`text-xl font-bold text-slate-900`).
  - Subtitle: "Everything you need for your thesis, projects and academic success."
  - Right Action: "Explore All Tools ->" (`text-xs font-semibold text-blue-600 hover:text-blue-700`).
- **3x3 Card Grid Layout**:
  - Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5`
  - Card Structure:
    - Pure white card background (`bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-blue-300 hover:translate-y-[-2px] transition-all cursor-pointer flex items-center justify-between group`).
    - Left Squircle: Rounded squircle with custom tool gradient and crisp white icon.
    - Content Column: Bold title (13-14px) + descriptive subtitle (11px text-slate-500).
    - Right Action: Circular light blue/gray arrow pill (`w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors text-slate-400 text-xs`).

#### 2. Right Column (32% Width): Telemetry & Activity Panel
- **"Your Credits" Card**:
  - Deep royal cobalt gradient (`bg-gradient-to-br from-[#0B256B] via-[#0E3596] to-[#0284C7] rounded-3xl p-5 text-white shadow-lg relative overflow-hidden`).
  - Header: Gold coins icon + "Your Credits" on left; "Pro Plan Active" badge with green checkmark on right.
  - Big Stat: Number **"15"** in 42px bold font + "Credits Remaining" in soft blue-100.
  - Glowing slider/meter line.
  - Full-width White Action Pill: `"Buy More Credits ->"` (`bg-white hover:bg-slate-50 text-slate-900 font-bold py-2 px-5 rounded-full text-xs shadow-md w-full flex items-center justify-center gap-2 mt-4`).
- **"Recent Projects" Card**:
  - White container (`bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs mt-4`).
  - Header: Clock icon + "Recent Projects" (`text-sm font-bold text-slate-900`) + "View All ->" link.
  - List Items (3 Rows):
    1. `Doc / FYP` (Blue badge): "E-commerce Website Project" (Nov 13, 2025 • 2.5 MB) -> `[Open]` button.
    2. `PPT` (Purple badge): "Viva Presentation Deck" (Nov 12, 2025 • 1.8 MB) -> `[Open]` button.
    3. `ZIP` (Green badge): "Student Forum Software" (Nov 10, 2025 • 4.2 MB) -> `[Open]` button.

---

### E. Bottom 3-Card Ecosystem Row
1. **"Why Choose CodeThesis AI?" Card (Dark Authority Card)**:
   - Deep navy gradient with border stroke (`bg-gradient-to-br from-[#060D24] to-[#0A1A4A] border border-blue-900/50 rounded-3xl p-5 text-white relative overflow-hidden flex flex-col justify-between`).
   - Title: "Why Choose CodeThesis AI?"
   - 2-Column Checklist with bright green checkmark badges:
     - AI-Powered Generation | Secure & Reliable
     - 100% Academic Standards | Paystack & Stripe
     - Instant Downloads | 24/7 Support
   - CTA: `"Get Started Free ->"` in gold/amber pill.
   - Right Graphic: 3D Graduation Cap atop rising yellow 3D growth bars.
2. **"What Our Students Say" Card (Social Proof Testimonial)**:
   - Pure white card (`bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between`).
   - Title: "What Our Students Say"
   - Large light cyan quotation mark: `“`
   - Testimonial Quote: `"CodeThesis AI made my final year project so easy. The viva simulator is a game changer!"`
   - Author: Nigerian student avatar (Ibrahim Musa, FUTA Computer Science).
   - Rating: 5 gold stars `★★★★★` + 3 carousel pagination dots.
3. **"Need Help?" Card (Support Card)**:
   - Ice blue soft gradient card (`bg-gradient-to-br from-[#EBF3FC] to-[#DDEBFA] border border-blue-200/60 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between`).
   - Header: Headphone icon + "Need Help?"
   - Copy: "Our support team is always ready to help you."
   - Action Pill: `"Contact Support ->"` in Midnight Navy (`bg-[#0B132B] hover:bg-[#132047] text-white font-semibold px-4 py-2 rounded-full text-xs`).
   - Visual: 3D friendly female student avatar wearing blue hijab & headset giving thumbs up.

---

### F. Global Footer
- Horizontal bar on soft academic slate base.
- Left: `© 2025 CodeThesis AI. All rights reserved.`
- Center: `Terms of Service | Privacy Policy | Contact Us`
- Right: `Dream it. Build it. Defend it. 👑` (with gold crown emoji).

---

## 5. GLOBAL ERGONOMICS & CLICKABILITY CONTRACT
- **Cursor Rule**: Every interactive element (`button`, `a`, `select`, `input`, `[role="button"]`, and card) must have explicit `cursor: pointer`.
- **Haptic/Visual Feedback**: Every button and clickable card must have smooth hover transitions (`transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`) and active click feedback (`active:scale-95`).
- **Mobile Fluidity**: Responsive adaptation from 320px mobile to 1920px desktop without breaking grid alignments or overflowing text.
- **Zero Raw AI Conversational Boilerplate**: The interface and outputs must remain strictly academic, executive, and production-grade.

---
*This specification is preserved in the repository as the permanent UI design contract.*
