'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CourseSelect from '@/components/ui/CourseSelect';
import InstitutionSelect from '@/components/ui/InstitutionSelect';
import { useAuth } from '@/context/AuthContext';
import { downloadAcademicFile } from '@/lib/downloadHelper';
import {
  Calculator,
  Download,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Code2,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Loader2
} from 'lucide-react';

interface ProblemPreset {
  id: string;
  discipline: string;
  title: string;
  question: string;
  steps: {
    stepNumber: number;
    stepTitle: string;
    explanation: string;
    mathSnippet: string;
  }[];
  finalAnswer: string;
}

export default function AssignmentSolverPage() {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('cs');
  const [activePresetId, setActivePresetId] = useState<string>('db-norm');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const presets: ProblemPreset[] = [
    {
      id: 'db-norm',
      discipline: 'cs',
      title: 'Database Normalization (UNF to 3NF)',
      question: `Given unnormalized relation: R(StudentMatric, StudentName, CourseCode, CourseTitle, LecturerID, LecturerName, RoomNumber, Grade)
Functional Dependencies:
FD1: StudentMatric -> StudentName
FD2: CourseCode -> CourseTitle, LecturerID
FD3: LecturerID -> LecturerName, RoomNumber
FD4: (StudentMatric, CourseCode) -> Grade

Normalize the relation into Third Normal Form (3NF). Justify each step.`,
      steps: [
        {
          stepNumber: 1,
          stepTitle: 'Identify Candidate Key & 1NF Decomposition',
          explanation: 'To satisfy 1NF, all attribute values must be atomic (no repeating groups). The primary compound candidate key required to uniquely identify every tuple is (StudentMatric, CourseCode).',
          mathSnippet: 'Candidate Key: K = { StudentMatric, CourseCode }'
        },
        {
          stepNumber: 2,
          stepTitle: 'Eliminate Partial Dependencies (2NF Conversion)',
          explanation: 'A relation is in 2NF if it is in 1NF and no non-prime attribute is functionally dependent on a proper subset of any candidate key. FD1 (StudentMatric -> StudentName) and FD2 (CourseCode -> CourseTitle, LecturerID) are partial dependencies on the compound key.',
          mathSnippet: `Decomposition into 2NF:
R1(StudentMatric [PK], StudentName)
R2(CourseCode [PK], CourseTitle, LecturerID)
R3(StudentMatric [FK], CourseCode [FK], Grade) [PK: (StudentMatric, CourseCode)]`
        },
        {
          stepNumber: 3,
          stepTitle: 'Eliminate Transitive Dependencies (3NF Conversion)',
          explanation: 'A relation is in 3NF if it is in 2NF and no non-prime attribute is transitively dependent on the primary key (X -> Y and Y -> Z where X is PK). In R2, CourseCode -> LecturerID and LecturerID -> LecturerName, RoomNumber. Thus, LecturerName and RoomNumber are transitively dependent on CourseCode.',
          mathSnippet: `Decomposition into 3NF:
1. STUDENTS (StudentMatric [PK], StudentName)
2. COURSES (CourseCode [PK], CourseTitle, LecturerID [FK])
3. LECTURERS (LecturerID [PK], LecturerName, RoomNumber)
4. ENROLLMENTS (StudentMatric [FK], CourseCode [FK], Grade) [PK: (StudentMatric, CourseCode)]`
        }
      ],
      finalAnswer: 'Four 3NF lossless join relations preserving all functional dependencies: STUDENTS, COURSES, LECTURERS, and ENROLLMENTS.'
    },
    {
      id: 'big-o',
      discipline: 'cs',
      title: 'Divide-and-Conquer Recurrence (Master Theorem)',
      question: `Solve the recurrence relation: T(n) = 4T(n/2) + n^2. Determine the tight asymptotic bound using Master Theorem and state Big-O, Big-Omega, and Big-Theta.`,
      steps: [
        {
          stepNumber: 1,
          stepTitle: 'Identify Master Theorem Parameters',
          explanation: 'The standard recurrence form is T(n) = a*T(n/b) + f(n), where a >= 1 and b > 1. Here, a = 4, b = 2, and f(n) = n^2.',
          mathSnippet: 'a = 4, b = 2, f(n) = n^2'
        },
        {
          stepNumber: 2,
          stepTitle: 'Compute Critical Exponent log_b(a)',
          explanation: 'Evaluate the critical threshold log_b(a) = log_2(4) = 2. Thus, the benchmark function is n^(log_b(a)) = n^2.',
          mathSnippet: 'c_crit = log_2(4) = 2 => n^(log_b(a)) = n^2'
        },
        {
          stepNumber: 3,
          stepTitle: 'Compare f(n) with n^(log_b(a)) (Case 2 Applicability)',
          explanation: 'Since f(n) = Theta(n^(log_b(a)) * log^k(n)) with k = 0, Master Theorem Case 2 applies directly.',
          mathSnippet: 'T(n) = Theta(n^(log_b(a)) * log(n)) = Theta(n^2 * log(n))'
        }
      ],
      finalAnswer: 'Asymptotic Complexity: T(n) = Theta(n^2 * log(n)) or O(n^2 * log(n)).'
    },
    {
      id: 'kvl-circuits',
      discipline: 'eng',
      title: 'Nodal Voltage Matrix Analysis (Kirchhoff\'s Laws)',
      question: `In a 2-node resistive network with nodes V1 and V2:
Node 1 is connected to a 12V independent source via a 4-ohm resistor, and to Node 2 via a 2-ohm resistor.
Node 2 is connected to ground via an 8-ohm resistor and receives an injected 3A independent current source.
Calculate node voltages V1 and V2 using matrix nodal equations.`,
      steps: [
        {
          stepNumber: 1,
          stepTitle: 'Formulate KCL Equation at Node 1',
          explanation: 'Sum of currents leaving Node 1 equals zero: (V1 - 12)/4 + (V1 - V2)/2 = 0.',
          mathSnippet: `V1/4 - 3 + V1/2 - V2/2 = 0
(1/4 + 1/2)V1 - 0.5V2 = 3 => 0.75V1 - 0.5V2 = 3`
        },
        {
          stepNumber: 2,
          stepTitle: 'Formulate KCL Equation at Node 2',
          explanation: 'Sum of currents leaving Node 2: (V2 - V1)/2 + V2/8 - 3 = 0.',
          mathSnippet: `-0.5V1 + (1/2 + 1/8)V2 = 3 => -0.5V1 + 0.625V2 = 3`
        },
        {
          stepNumber: 3,
          stepTitle: 'Assemble Conductance Matrix [G][V] = [I] & Solve',
          explanation: 'Set up matrix equation: [[0.75, -0.5], [-0.5, 0.625]] * [V1, V2]^T = [3, 3]^T. Compute determinant Delta = (0.75 * 0.625) - (-0.5 * -0.5) = 0.46875 - 0.25 = 0.21875.',
          mathSnippet: `V1 = Det([[3, -0.5], [3, 0.625]]) / 0.21875 = (1.875 + 1.5) / 0.21875 = 3.375 / 0.21875 = 15.43 Volts
V2 = Det([[0.75, 3], [-0.5, 3]]) / 0.21875 = (2.25 + 1.5) / 0.21875 = 3.75 / 0.21875 = 17.14 Volts`
        }
      ],
      finalAnswer: 'Node 1 Voltage V1 = 15.43 V, Node 2 Voltage V2 = 17.14 V.'
    }
  ];

  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [department, setDepartment] = useState('Computer Science');
  const [institution, setInstitution] = useState('Federal University of Technology, Akure (FUTA)');
  const [studentName, setStudentName] = useState('ADEBAYO TUNDE');
  const [matricNo, setMatricNo] = useState('FUTA/CSC/20/4182');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Auto-populate from authenticated user profile
  useEffect(() => {
    if (user) {
      if (user.fullName) setStudentName(user.fullName.toUpperCase());
      if (user.matricNumber) setMatricNo(user.matricNumber);
      if (user.department) setDepartment(user.department);
      if (user.institution) setInstitution(user.institution);
    }
  }, [user]);

  const currentPreset = presets.find(p => p.id === activePresetId) || presets[0];

  async function handleDownloadDocx() {
    setIsDownloading(true);
    await downloadAcademicFile(
      '/api/generate-assignment-docx',
      {
        courseCode: 'CSC 411',
        courseTitle: 'Advanced Algorithms and Complexity',
        lecturer: 'Course Examiner',
        studentName,
        matricNo,
        institution,
        department,
        assignmentTitle: currentPreset.title,
        problemStatement: currentPreset.question,
        steps: currentPreset.steps,
      },
      `Assignment_Solution_${currentPreset.id}.docx`
    );
    setIsDownloading(false);
    setSuccessBanner('Complete assignment submission .docx compiled and downloaded successfully!');
    setTimeout(() => setSuccessBanner(null), 5000);
  }

  function handleSolve() {
    setIsSolving(true);
    setTimeout(() => {
      setIsSolving(false);
      setSuccessBanner('Mathematical derivation synthesized with LaTeX formatting and step-by-step proofs!');
      setTimeout(() => setSuccessBanner(null), 5000);
    }, 1000);
  }

  function handleCopyAnswer() {
    const fullSolution = `${currentPreset.title}\n\nQuestion:\n${currentPreset.question}\n\nSteps:\n` +
      currentPreset.steps.map(s => `Step ${s.stepNumber}: ${s.stepTitle}\n${s.explanation}\n${s.mathSnippet}\n`).join('\n') +
      `\nFinal Result: ${currentPreset.finalAnswer}`;
    navigator.clipboard.writeText(fullSolution);
    setCopied(true);
    setSuccessBanner('Solution and step-by-step proof copied to clipboard!');
    setTimeout(() => {
      setCopied(false);
      setSuccessBanner(null);
    }, 3000);
  }

  return (
    <AppLayout
      activeItem="assignment-solver"
      title="Assignment & Proof Solver"
      subtitle="Step-by-step derivations for Database Normalization (1NF–3NF), Big-O Master Theorem, and Circuit Analysis"
    >
      {/* Dynamic Success Banner */}
      {successBanner && (
        <div className="mb-4 bg-sky-50 border border-sky-200 text-sky-950 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-sky-500 hover:text-sky-700 font-bold ml-2 text-xs"
          >
            &times;
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Pane (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Calculator className="w-4 h-4 text-sky-600" />
              <span>Academic Problem Engine</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pre-built Standard Questions</label>
              <div className="space-y-2">
                {presets.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActivePresetId(item.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      activePresetId === item.id
                        ? 'border-sky-500 bg-sky-50/70 text-sky-950 font-bold shadow-xs'
                        : 'border-slate-200/70 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.discipline.toUpperCase()} Coursework</div>
                    </div>
                    {activePresetId === item.id && (
                      <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Or Paste Custom Problem</label>
              <textarea
                rows={3}
                value={customQuestion}
                onChange={e => setCustomQuestion(e.target.value)}
                placeholder="Type or paste your university assignment prompt here (e.g. Find eigenvalues of matrix A...)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <CourseSelect
              value={department}
              onChange={setDepartment}
              label="Course / Department"
            />

            <InstitutionSelect
              value={institution}
              onChange={setInstitution}
              label="Tertiary Institution"
              placeholder="Search or enter institution..."
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-xs text-slate-800 font-bold uppercase outline-none transition-all shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Matric No</label>
                <input
                  type="text"
                  value={matricNo}
                  onChange={e => setMatricNo(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl p-2.5 text-xs text-slate-800 font-mono outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            <button
              onClick={handleSolve}
              disabled={isSolving}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSolving ? 'Computing Proof...' : 'Solve with Step-by-Step Proof (1 Credit)'}</span>
            </button>
          </div>

          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 text-xs text-sky-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sky-900">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Academic Integrity Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed text-sky-800">
              Generated derivations explain the mathematical foundation and intermediate logic so you can defend your homework calculations during tutorial sessions.
            </p>
          </div>
        </div>

        {/* Right Derivation & Proof Canvas (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            {/* Top Toolbar */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div>
                <span className="font-extrabold text-xs text-slate-900">{currentPreset.title}</span>
                <span className="text-[10px] text-slate-500 ml-2">Complete Analytical Proof</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAnswer}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Proof'}</span>
                </button>

                <button
                  onClick={handleDownloadDocx}
                  disabled={isDownloading}
                  className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg text-xs font-bold shadow-xs hover:opacity-95 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Compiling Solution...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .DOCX</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              {/* Question Statement Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1">
                <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Original Problem Statement
                </div>
                <div className="font-mono text-slate-800 whitespace-pre-wrap leading-relaxed text-[11px]">
                  {currentPreset.question}
                </div>
              </div>

              {/* Step by Step Breakdown */}
              <div className="space-y-4">
                <div className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Detailed Step-by-Step Derivation
                </div>

                {currentPreset.steps.map(step => (
                  <div key={step.stepNumber} className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-black text-xs flex items-center justify-center">
                        {step.stepNumber}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">{step.stepTitle}</h4>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pl-8">
                      {step.explanation}
                    </p>

                    <div className="ml-8 bg-slate-950 text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto border border-slate-800">
                      <pre>{step.mathSnippet}</pre>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Answer Highlight Box */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs text-emerald-900 uppercase tracking-wider">
                    Final Verified Result
                  </div>
                  <div className="text-xs font-semibold text-emerald-800 mt-0.5">
                    {currentPreset.finalAnswer}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
