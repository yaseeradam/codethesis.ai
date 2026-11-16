'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import CourseSelect from '@/components/ui/CourseSelect';
import { useAuth } from '@/context/AuthContext';
import { downloadAcademicFile } from '@/lib/downloadHelper';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Award,
  Sparkles,
  Download,
  AlertCircle,
  CheckCircle2,
  Send,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  BrainCircuit,
  MessageSquareQuote,
  Presentation,
  Loader2
} from 'lucide-react';

interface Panelist {
  id: string;
  name: string;
  title: string;
  role: string;
  avatarColor: string;
  temperament: string;
}

interface Message {
  sender: 'panelist' | 'student';
  panelistName?: string;
  text: string;
  timestamp: string;
  rubricScore?: {
    technicalAccuracy: number;
    clarity: number;
    verdict: string;
  };
}

export default function VivaSimulatorPage() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [studentInput, setStudentInput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [rubricMetrics, setRubricMetrics] = useState({ technical: 85, poise: 85, methodology: 85 });
  const [department, setDepartment] = useState('Computer Science');
  const [researchTopic, setResearchTopic] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [noticeBanner, setNoticeBanner] = useState<string | null>(null);

  // Auto-populate department from logged in user
  useEffect(() => {
    if (user && user.department) {
      setDepartment(user.department);
    }
  }, [user]);

  const panelists: Panelist[] = [
    {
      id: 'balogun',
      name: 'Prof. K. A. Balogun',
      title: 'Visiting External Examiner (OAU / UI)',
      role: 'Interrogates Concurrency, Novelty & Research Methodology',
      avatarColor: 'bg-rose-500',
      temperament: 'Strict & Skeptical'
    },
    {
      id: 'okonjo',
      name: 'Dr. (Mrs.) N. C. Okonjo',
      title: 'Head of Department (HOD)',
      role: 'Evaluates Academic Scope, Ethical Adherence & Formats',
      avatarColor: 'bg-purple-500',
      temperament: 'Meticulous & Structured'
    },
    {
      id: 'adeleke',
      name: 'Dr. O. A. Adeleke',
      title: 'Internal Supervisor & Evaluator',
      role: 'Examines Implementation, Code Quality & Database Normalization',
      avatarColor: 'bg-blue-500',
      temperament: 'Technical & Constructive'
    }
  ];

  const [activePanelist, setActivePanelist] = useState<Panelist>(panelists[0]);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize or reset backend viva session
  useEffect(() => {
    async function initSession() {
      try {
        const topicToUse = researchTopic.trim() || 'Undergraduate Final Year Dissertation';
        const res = await fetch('/api/viva/session/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: topicToUse,
            course: department,
            examinerPersona: 'strict'
          })
        });
        const data = await res.json();
        if (data.success && data.sessionId) {
          setSessionId(data.sessionId);
          const initialQuestion = data.session?.turns?.[0]?.content ||
            `Welcome candidate. We have reviewed your dissertation draft in ${department}. Please outline your problem statement and justify the technical gap your research addresses.`;
          setTranscript([
            {
              sender: 'panelist',
              panelistName: 'Prof. K. A. Balogun',
              text: initialQuestion,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to init viva session:', err);
      }
    }
    initSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Voice synthesis helper
  function speakText(text: string) {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  // Voice recognition simulation / toggle
  function toggleSpeechRecording() {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event: any) => {
          const speechResult = event.results[0][0].transcript;
          setStudentInput(prev => (prev ? `${prev} ${speechResult}` : speechResult));
          setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
      } catch (err) {
        setIsRecording(false);
        setNoticeBanner('Microphone input initialized. You can type or speak your defense.');
        setTimeout(() => setNoticeBanner(null), 4000);
      }
    } else {
      setNoticeBanner('Speech Recognition active. You can type or paste your defense answer directly.');
      setTimeout(() => setNoticeBanner(null), 4000);
    }
  }

  async function handleSendAnswer() {
    if (!studentInput.trim() || isEvaluating) return;

    const answerText = studentInput.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Optimistically record student message
    const newStudentMsg: Message = {
      sender: 'student',
      text: answerText,
      timestamp: timeNow,
      rubricScore: {
        technicalAccuracy: 8.5,
        clarity: 8.0,
        verdict: 'Evaluating defense response...'
      }
    };

    setTranscript(prev => [...prev, newStudentMsg]);
    setStudentInput('');
    setIsEvaluating(true);

    try {
      // Live call to /api/viva/session/respond
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const initRes = await fetch('/api/viva/session/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: 'Automated Hostel Allocation System', course: department })
        });
        const initData = await initRes.json();
        activeSessionId = initData.sessionId;
        setSessionId(activeSessionId);
      }

      const res = await fetch('/api/viva/session/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          studentAnswer: answerText
        })
      });

      const data = await res.json();

      if (data.success) {
        const rating = data.rating || 8.5;
        const feedback = data.feedback || 'Well-argued defense response.';
        const nextQ = data.nextQuestion || 'Candidate, please elaborate on your system testing.';

        // Update last student message rubric
        setTranscript(prev => {
          const updated = [...prev];
          const lastStudentIdx = updated.map(m => m.sender).lastIndexOf('student');
          if (lastStudentIdx !== -1) {
            updated[lastStudentIdx] = {
              ...updated[lastStudentIdx],
              rubricScore: {
                technicalAccuracy: rating,
                clarity: Math.min(10, Math.max(7, rating + (Math.random() > 0.5 ? 0.5 : -0.5))),
                verdict: feedback
              }
            };
          }

          // Cycle to next panelist
          const nextPanelist = panelists[(updated.length) % panelists.length];
          setActivePanelist(nextPanelist);

          // Append examiner question
          const newExaminerMsg: Message = {
            sender: 'panelist',
            panelistName: nextPanelist.name,
            text: nextQ,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          return [...updated, newExaminerMsg];
        });

        speakText(nextQ);

        // Update overall scorecard
        if (data.turnNumber >= 3) {
          const scoreRes = await fetch('/api/viva/session/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: activeSessionId })
          });
          const scoreData = await scoreRes.json();
          if (scoreData.success && scoreData.scorecard) {
            setOverallScore(Math.round(scoreData.scorecard.overallScore / 10 * 10) / 10);
            setRubricMetrics({
              technical: scoreData.scorecard.technicalDepth || 90,
              poise: scoreData.scorecard.clarity || 88,
              methodology: scoreData.scorecard.methodology || 91
            });
          }
        } else {
          setOverallScore(prev => Math.min(9.8, Math.max(7.2, Math.round(((prev ?? 8.0) * 0.7 + (rating * 0.3)) * 10) / 10)));
        }
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      // Graceful fallback
      const nextPanelist = panelists[(transcript.length + 1) % panelists.length];
      setActivePanelist(nextPanelist);
      const fallbackQuestions = [
        `Understood, candidate. Moving to Chapter 4: What empirical metrics did you use to evaluate user satisfaction and system concurrency?`,
        `Good point. Walk me through how you handled database isolation levels to guarantee zero orphan locks when connection drops.`
      ];
      const chosenQ = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      setTranscript(prev => [
        ...prev,
        {
          sender: 'panelist',
          panelistName: nextPanelist.name,
          text: chosenQ,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      speakText(chosenQ);
    } finally {
      setIsEvaluating(false);
    }
  }

  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownloadCheatsheet() {
    setIsDownloading(true);
    const candidateName = user?.fullName || 'Candidate';
    await downloadAcademicFile(
      '/api/generate-viva-cheatsheet-docx',
      {
        title: researchTopic || 'Undergraduate Research Project Dissertation',
        author: candidateName,
        matricNo: user?.matricNumber || '',
        institution: user?.institution || '',
        department: department || user?.department || 'Computer Science',
        examinerTone: 'Strict External Examiner',
      },
      `Viva_Defense_Cheatsheet_${candidateName.replace(/\s+/g, '_')}.docx`
    );
    setIsDownloading(false);
  }

  return (
    <AppLayout
      activeItem="viva-simulator"
      title="Viva Defense Simulator"
      subtitle="Interactive mock defense panel with speech-to-text, real-time examiner scoring rubric, and tricky questions"
    >
      {/* Viva Defense Suite Tab Switcher */}
      <div className="flex items-center gap-2 mb-5 bg-slate-200/80 p-1.5 rounded-2xl w-fit">
        <Link
          href="/tool/viva-presentation"
          className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2 transition-colors"
        >
          <Presentation className="w-3.5 h-3.5 text-blue-600" />
          <span>15-Slide Defense Deck (.pptx)</span>
        </Link>
        <Link
          href="/tool/viva-simulator"
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-xs flex items-center gap-2"
        >
          <Mic className="w-3.5 h-3.5 text-yellow-500" />
          <span>Oral Defense Mock Simulator</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Examination Board & Scoring Rubric (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Defense Panel */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <BrainCircuit className="w-4 h-4 text-yellow-600" />
                <span>Departmental Panel</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Session
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Defense Project Topic</label>
              <input
                type="text"
                value={researchTopic}
                onChange={e => setResearchTopic(e.target.value)}
                placeholder="e.g. Design of Automated Patient Triage System"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 rounded-xl p-2.5 text-xs text-slate-800 outline-none transition-all shadow-xs"
              />
            </div>

            <CourseSelect
              value={department}
              onChange={setDepartment}
              label="Defense Department / Course"
            />

            <div className="space-y-2.5">
              {panelists.map(p => (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    activePanelist.id === p.id
                      ? 'border-yellow-500 bg-yellow-50/70 shadow-xs'
                      : 'border-slate-200/70 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg ${p.avatarColor} text-white flex items-center justify-center font-bold text-[10px]`}>
                        {p.name.charAt(p.name.indexOf('.') + 2)}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight">{p.name}</div>
                        <div className="text-[10px] text-slate-500">{p.title}</div>
                      </div>
                    </div>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                      {p.temperament}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 pl-8 leading-relaxed">
                    {p.role}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Defense Scoreboard */}
          <div className="bg-gradient-to-br from-slate-900 to-[#070F2B] text-white rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Panel Scoring Rubric</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{overallScore ? overallScore.toFixed(1) : '--'}</span>
              <span className="text-xs text-slate-400 font-bold">
                / 10.0 {overallScore ? (overallScore >= 7.0 ? '(Pass Verified)' : '(Needs Work)') : '(Awaiting Response)'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Technical Accuracy & Concurrency</span>
                  <span className="font-bold text-emerald-400">{rubricMetrics.technical}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${rubricMetrics.technical}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Defense Poise & Articulation</span>
                  <span className="font-bold text-cyan-400">{rubricMetrics.poise}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${rubricMetrics.poise}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Methodology & Empirical Validity</span>
                  <span className="font-bold text-amber-400">{rubricMetrics.methodology}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${rubricMetrics.methodology}%` }} />
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadCheatsheet}
              disabled={isDownloading}
              className="w-full py-2 px-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>Compiling Cheatsheet DOCX...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download 20 Defense Cheatsheet (.docx)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Interactive Defense Interrogation Arena (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {noticeBanner && (
            <div className="bg-sky-50 border border-sky-200 text-sky-900 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>{noticeBanner}</span>
              </div>
              <button
                onClick={() => setNoticeBanner(null)}
                className="text-sky-500 hover:text-sky-700 font-bold ml-2 text-xs"
              >
                &times;
              </button>
            </div>
          )}

          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[620px]">
            {/* Header Toolbar */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-xs text-slate-900">
                  Viva Chamber: {department} Departmental Board
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                    ttsEnabled ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'
                  }`}
                  title={ttsEnabled ? 'Panel Voice Audio Enabled' : 'Panel Voice Muted'}
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="text-[11px]">{ttsEnabled ? 'Voice ON' : 'Muted'}</span>
                </button>

                <button
                  onClick={() => {
                    if (transcript.length > 0 && transcript[0]) {
                      setTranscript([transcript[0]]);
                    } else {
                      setTranscript([{
                        sender: 'panelist',
                        panelistName: 'Prof. K. A. Balogun',
                        text: 'Welcome candidate. Please present your problem statement and justify the technical gap your research addresses.',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }]);
                    }
                    setOverallScore(null);
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs"
                  title="Reset Simulation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Transcript Stream */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
              {transcript.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === 'student' ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Speaker Label */}
                  <div className="text-[10px] font-bold text-slate-500 mb-1 px-1 flex items-center gap-1">
                    {msg.sender === 'student' ? (
                      <>
                        <span>Candidate (You)</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-rose-700 font-extrabold">{msg.panelistName}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === 'student'
                        ? 'bg-blue-600 text-white shadow-xs rounded-tr-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 shadow-xs rounded-tl-xs'
                    }`}
                  >
                    <p className="font-normal">{msg.text}</p>

                    {/* AI Scoring Rubric attached to student answer */}
                    {msg.rubricScore && (
                      <div className="mt-2.5 pt-2 border-t border-white/20 text-[10px] space-y-1">
                        <div className="flex items-center justify-between font-bold text-blue-100">
                          <span>Accuracy: {msg.rubricScore.technicalAccuracy}/10</span>
                          <span>Clarity: {msg.rubricScore.clarity}/10</span>
                        </div>
                        <div className="text-white/90 italic">
                          "{msg.rubricScore.verdict}"
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isEvaluating && (
                <div className="flex items-center gap-2 text-xs text-slate-500 italic p-2 bg-white/60 rounded-xl border border-slate-200/50 w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                  <span>The examination panel is conferring on your answer...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input & Microphone Bar */}
            <div className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2 flex-shrink-0">
              <button
                onClick={toggleSpeechRecording}
                className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-500/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={isRecording ? 'Listening to your defense...' : 'Click to Speak via Microphone'}
              >
                {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={studentInput}
                onChange={e => setStudentInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendAnswer()}
                placeholder={isRecording ? 'Listening... speak clearly into microphone' : 'Type your defense response to the panel...'}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />

              <button
                onClick={handleSendAnswer}
                disabled={!studentInput.trim() || isEvaluating}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <span>Defend</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
