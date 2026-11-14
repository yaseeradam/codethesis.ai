"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  HelpCircle, 
  Award, 
  Mic, 
  Send, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  RefreshCw,
  BookOpen,
  ArrowRight
} from "lucide-react";

interface QuestionItem {
  id: number;
  q: string;
  category: string;
  examinerTrap: string;
  modelAnswer: string;
  proTip: string;
  studentAnswer: string;
  score: number | null;
  feedback: string | null;
}

const DEFAULT_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    q: "What specific gap in current literature did you identify, and why can existing enterprise platforms not solve this locally?",
    category: "Problem Formulation & Novelty",
    examinerTrap: "The examiner wants to confirm if you did actual research or simply cloned a generic open-source tutorial.",
    modelAnswer: "Current enterprise systems (such as Epic or Cerner) assume uninterrupted gigabit broadband, high-tier proprietary servers, and steep annual licensing fees exceeding $50,000. In developing public health institutions, local power outages and intermittent connectivity cause complete system failure. Our architecture introduces a lightweight, offline-first SQLite-based distributed sync engine that operates reliably on existing legacy hardware with zero external cloud dependencies, cutting operational costs by over 80%.",
    proTip: "Never speak generically. Always frame your answer around local infrastructural constraints: connectivity, budget, and power resilience.",
    studentAnswer: "",
    score: null,
    feedback: null
  },
  {
    id: 2,
    q: "Justify your choice of database architecture. Why relational over NoSQL, and how does your schema guarantee zero double-allocations under high concurrency?",
    category: "System Architecture & Concurrency",
    examinerTrap: "Testing whether you understand ACID transactions, locking, and race conditions, or if you're just using a database blindly.",
    modelAnswer: "Our workload requires strict ACID transactional guarantees for appointments and prescriptions. Relational schemas with strict foreign key constraints and UNIQUE index composite keys prevent orphan records. To prevent double-allocation during concurrent bookings, we employ optimistic concurrency control with row-versioning tokens and explicit transaction isolation levels, guaranteeing that colliding writes trigger an immediate rollback rather than corrupting state.",
    proTip: "Key terms to hit: 'ACID transactions', 'optimistic concurrency control', 'row-versioning', and 'atomic commits'.",
    studentAnswer: "",
    score: null,
    feedback: null
  },
  {
    id: 3,
    q: "How have you ensured that user data is protected against SQL injection, cross-site scripting (XSS), and unauthorized privilege escalation?",
    category: "Security & Vulnerability Hardening",
    examinerTrap: "Examiners love asking security questions to catch students who concatenate raw SQL queries or hardcode admin passwords.",
    modelAnswer: "Security is enforced at three distinct layers. First, data access strictly uses parameterized prepared statements, rendering SQL injection impossible. Second, all incoming user strings are sanitized with contextual encoding to neutralize XSS payloads. Third, session management utilizes cryptographically signed HTTP-only secure cookies paired with strict Role-Based Access Control (RBAC) middleware verifying token claims on every single privileged API endpoint.",
    proTip: "State 'parameterized prepared statements' in your first sentence. It immediately shuts down SQL injection traps.",
    studentAnswer: "",
    score: null,
    feedback: null
  },
  {
    id: 4,
    q: "What is the computational complexity of your scheduling algorithm, and what happens when the queue scales from 100 to 100,000 requests?",
    category: "Algorithms & Complexity",
    examinerTrap: "Testing theoretical computer science knowledge to separate genuine software engineers from surface-level developers.",
    modelAnswer: "Our priority queue scheduling algorithm is implemented using a binary min-heap with O(log N) insertion and O(log N) extraction times, resulting in an overall queue ordering complexity of O(N log N). In benchmark stress testing with 100,000 synthetic patient records, total re-ranking latency remained under 24 milliseconds on modest 4-core hardware, avoiding the O(N^2) exponential slowdown of naive nested loops.",
    proTip: "State the Big-O notation with pride. Mention empirical stress-test metrics (e.g. 24ms under 100k records).",
    studentAnswer: "",
    score: null,
    feedback: null
  },
  {
    id: 5,
    q: "If an external funding agency gave you 10 million Naira and 6 more months, what core architectural limitation would you redesign first?",
    category: "Critical Self-Assessment & Future Work",
    examinerTrap: "The modesty trap. Students who claim 'My project has zero errors or limitations' are immediately failed by strict panels.",
    modelAnswer: "While our system successfully handles single-hospital deployments, its current limitation is the centralized database server. With additional resources, I would refactor the architecture into a multi-region distributed cluster using the Raft consensus algorithm for automated multi-site master-replica failover, alongside deploying an edge-computing WebAssembly client to enable instantaneous biometric verification directly at rural mobile triage stations.",
    proTip: "Acknowledge a realistic architectural bottleneck and outline an advanced distributed systems roadmap.",
    studentAnswer: "",
    score: null,
    feedback: null
  }
];

export default function VivaSimulatorPage() {
  const [title, setTitle] = useState("Smart Hospital Patient Queue Optimization System");
  const [author, setAuthor] = useState("Fatima Abubakar");
  const [matricNo, setMatricNo] = useState("U/19/CS/1042");
  const [department, setDepartment] = useState("Computer Science");
  const [examinerTone, setExaminerTone] = useState("Strict External Examiner (Technical Griller)");

  const [questions, setQuestions] = useState<QuestionItem[]>(DEFAULT_QUESTIONS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentQ = questions[activeIdx];

  const handleSpeakQuestion = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech audio is not supported in this browser environment.");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQ.q);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleVoiceDictation = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari, or rehearse speaking aloud at 120 WPM while typing your response."
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleEvaluate = () => {
    if (!currentInput.trim()) {
      alert("Please type or speak your defense response first!");
      return;
    }

    setIsEvaluating(true);
    setTimeout(() => {
      // Deterministic heuristic score calculation based on length and academic keywords
      const text = currentInput.toLowerCase();
      let calculatedScore = 6.0;
      const keywords = ["acid", "sqlite", "concurrency", "security", "parameterized", "complexity", "o(n", "scale", "constraint", "architecture", "distributed", "relational", "bandwidth", "offline"];
      
      const foundCount = keywords.filter(kw => text.includes(kw)).length;
      calculatedScore = Math.min(10, Math.round((calculatedScore + foundCount * 0.8 + (text.length > 150 ? 1.0 : 0.2)) * 10) / 10);

      let fb = "";
      if (calculatedScore >= 8.5) {
        fb = "Excellent! You articulated technical depth, architectural trade-offs, and defended against the examiner's trap with rigorous terminology.";
      } else if (calculatedScore >= 7.0) {
        fb = "Good answer. You answered the core question, but consider citing specific metrics (latency, Big-O complexity) and security principles (parameterized queries) to leave no room for follow-up cross-examination.";
      } else {
        fb = "Needs sharpening. Your response sounds conversational rather than academic. Incorporate formal technical mechanisms, architectural justification, and specific quantitative data points.";
      }

      setQuestions(prev => {
        const copy = [...prev];
        copy[activeIdx] = {
          ...copy[activeIdx],
          studentAnswer: currentInput,
          score: calculatedScore,
          feedback: fb
        };
        return copy;
      });

      setIsEvaluating(false);
    }, 800);
  };

  const handleDownloadCheatsheet = async () => {
    setIsDownloading(true);
    try {
      // Auto-save to student dashboard projects history
      fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "viva-simulator",
          title: `Viva Defense Cheatsheet: ${title}`,
          course: department || "Computer Science",
          institution: "University",
          fileType: "docx",
          summary: `Complete viva defense cheatsheet for ${author} (${matricNo}) with ${questions.length} panel questions & model answers.`,
        }),
      }).catch((e) => console.warn("Auto-save note:", e));

      const res = await fetch("/api/generate-viva-cheatsheet-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          matricNo,
          department,
          examinerTone,
          questions
        })
      });

      if (!res.ok) throw new Error("Failed to generate cheatsheet");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Viva_Defense_Cheatsheet_${author.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      alert("Download error: " + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Navbar */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link 
              href="/" 
              className="inline-flex items-center space-x-2 text-slate-500 hover:text-slate-900 font-medium text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tools</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-800 text-sm">Viva Defense Simulator</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadCheatsheet}
              disabled={isDownloading}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? "Generating Doc..." : "Download Full Defense Cheatsheet (.docx)"}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Academic Studio Callout Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 text-white border-b border-red-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-red-400/30">
              Interactive Viva Mode
            </span>
            <span>
              Practicing your thesis slides too? Open the <strong>Academic Studio</strong> for side-by-side slide presentation & defense Q&A.
            </span>
          </div>
          <Link
            href="/studio?tab=viva"
            prefetch={false}
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-bold px-3.5 py-1.5 rounded-xl transition text-xs shadow-sm shrink-0"
          >
            <span>Launch Studio Viva</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Examiner Pressure Testing System</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Interactive AI Viva Defense Simulator
        </h1>
        <p className="mt-2 text-base text-slate-600 max-w-2xl mx-auto">
          Practice answering grueling panel questions, get instant evaluation scores, and study gold-standard model answers before your live defense.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Settings Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Project Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Student & Matric No</label>
              <input 
                type="text" 
                value={`${author} (${matricNo})`} 
                onChange={(e) => {
                  const parts = e.target.value.split("(");
                  setAuthor(parts[0].trim());
                  if (parts[1]) setMatricNo(parts[1].replace(")", "").trim());
                }}
                className="w-full text-sm font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
              <input 
                type="text" 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-sm font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Examiner Profile</label>
              <select 
                value={examinerTone}
                onChange={(e) => setExaminerTone(e.target.value)}
                className="w-full text-sm font-medium border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 text-red-700"
              >
                <option>Strict External Examiner (Technical Griller)</option>
                <option>Methodology & Stats Purist</option>
                <option>Industry Commercialization Critic</option>
                <option>Academic Board Chairman</option>
              </select>
            </div>
          </div>
        </div>

        {/* Question Selector Tabs */}
        <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => {
                setActiveIdx(idx);
                setCurrentInput(questions[idx].studentAnswer || "");
                setShowModelAnswer(false);
              }}
              className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl border text-left transition flex items-center justify-between ${
                activeIdx === idx
                  ? "bg-slate-900 border-slate-900 text-white shadow-md"
                  : q.score !== null
                  ? "bg-white border-emerald-300 text-slate-700 hover:bg-slate-100"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div>
                <p className={`text-xs font-semibold ${activeIdx === idx ? "text-slate-300" : "text-slate-400"}`}>
                  Question {idx + 1}
                </p>
                <p className="text-xs font-bold truncate max-w-[120px]">
                  {q.category}
                </p>
              </div>
              {q.score !== null && (
                <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${
                  activeIdx === idx ? "bg-emerald-500 text-white" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {q.score}/10
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Viva Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Examiner Question & Student Response */}
          <div className="lg:col-span-7 space-y-5">
            {/* Examiner Speech Box */}
            <div className="bg-white border-2 border-red-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-300 flex items-center justify-center text-xl shadow-inner">
                    👨‍🏫
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                      <span>Prof. E. K. Williams</span>
                      <span className="text-xs font-medium px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                        {examinerTone.split("(")[0]}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">External Examiner • Faculty Board of Examiners</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSpeakQuestion}
                  title="Click to hear question spoken aloud"
                  className={`flex items-center space-x-1.5 text-xs px-3 py-1 rounded-full font-semibold transition active:scale-95 ${
                    isSpeaking 
                      ? "bg-red-600 text-white animate-pulse shadow-sm"
                      : "text-red-700 bg-red-100 hover:bg-red-200 border border-red-300"
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      <span>Hear Question</span>
                    </>
                  )}
                </button>
              </div>

              {/* Question Text */}
              <div className="mt-5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Defense Question #{activeIdx + 1} ({currentQ.category})
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  "{currentQ.q}"
                </p>
              </div>

              {/* Examiner's Hidden Trap Alert */}
              <div className="mt-4 flex items-start space-x-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Examiner's Hidden Trap: </span>
                  <span>{currentQ.examinerTrap}</span>
                </div>
              </div>
            </div>

            {/* Student Response Editor */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <span>Your Defense Argument:</span>
                  <span className="text-xs font-normal text-slate-500">(Articulate clearly with technical terminology)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentInput("In addressing the examiner's question, our architecture enforces strict referential integrity through relational SQLite schemas with indexed foreign keys. Rather than relying on naive polling, atomic transactions with optimistic row versioning prevent collision hazards under concurrent load.");
                  }}
                  className="text-xs font-medium text-sky-600 hover:text-sky-800 hover:underline"
                >
                  Insert Sample Response
                </button>
              </div>

              <textarea
                rows={5}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Type your spoken defense response here as you would explain it before the panel..."
                className="w-full text-sm font-normal border border-slate-200 rounded-2xl p-4 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleToggleVoiceDictation}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition active:scale-95 ${
                      isListening
                        ? "bg-red-600 text-white animate-pulse shadow-md"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Mic className={`w-3.5 h-3.5 ${isListening ? "text-white animate-bounce" : "text-slate-600"}`} />
                    <span>{isListening ? "Listening... (Speak Now)" : "Rehearse Voice (Dictate)"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModelAnswer(!showModelAnswer)}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-semibold transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{showModelAnswer ? "Hide Model Answer" : "Reveal Gold-Standard Answer"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isEvaluating}
                  onClick={handleEvaluate}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isEvaluating ? "Panel Reviewing..." : "Evaluate Defense (Score & Feedback)"}</span>
                </button>
              </div>
            </div>

            {/* Pagination between questions */}
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={activeIdx === 0}
                onClick={() => {
                  setActiveIdx(prev => prev - 1);
                  setCurrentInput(questions[activeIdx - 1].studentAnswer || "");
                  setShowModelAnswer(false);
                }}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Question</span>
              </button>
              <span className="text-xs font-bold text-slate-400">
                {activeIdx + 1} of {questions.length}
              </span>
              <button
                disabled={activeIdx === questions.length - 1}
                onClick={() => {
                  setActiveIdx(prev => prev + 1);
                  setCurrentInput(questions[activeIdx + 1].studentAnswer || "");
                  setShowModelAnswer(false);
                }}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: AI Scoring & Model Answer */}
          <div className="lg:col-span-5 space-y-5">
            {/* Score & Verdict Card */}
            {currentQ.score !== null ? (
              <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-sm">Examiner Evaluation</h4>
                  </div>
                  <div className="flex items-baseline space-x-1 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    <span className="text-2xl font-black text-emerald-800">{currentQ.score}</span>
                    <span className="text-xs font-bold text-emerald-600">/ 10</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl p-4 leading-relaxed">
                  <p className="font-semibold text-slate-900 mb-1">Feedback from Panel:</p>
                  {currentQ.feedback}
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-bold text-indigo-700 flex items-center space-x-1.5 mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Examiner Delivery Pro Tip:</span>
                  </p>
                  <p className="text-xs italic text-slate-600">
                    "{currentQ.proTip}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Evaluation Yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Type your defense argument on the left and click "Evaluate Defense" to receive scoring and instant panel critique.
                </p>
              </div>
            )}

            {/* Gold-Standard Model Answer (Collapsible or Revealed) */}
            <div className={`bg-emerald-950 text-white rounded-3xl p-6 shadow-lg space-y-4 transition-all duration-300 ${
              showModelAnswer ? "opacity-100 scale-100" : "opacity-90"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-emerald-200 tracking-wide">
                    Gold-Standard Model Answer (A+)
                  </h4>
                </div>
                <span className="text-xs font-mono bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded">
                  Memorize
                </span>
              </div>

              <div className="text-xs text-emerald-100 leading-relaxed font-sans bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800/60">
                "{currentQ.modelAnswer}"
              </div>

              <div className="text-xs text-emerald-300/80 pt-1 flex items-start space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>Deliver this with calm authority. Pause for 2 seconds after the examiner finishes speaking before responding.</span>
              </div>
            </div>

            {/* Cheatsheet summary box */}
            <div className="bg-slate-100 border border-slate-200 rounded-3xl p-5 text-center space-y-3">
              <p className="text-xs font-bold text-slate-800">Need All 20 Likely Questions for Printout?</p>
              <p className="text-xs text-slate-500">
                Download the complete viva defense dossier formatted in standard Times New Roman Word document ready to review with your project partner.
              </p>
              <button
                type="button"
                onClick={handleDownloadCheatsheet}
                disabled={isDownloading}
                className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Export Defense Cheatsheet (.docx)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
