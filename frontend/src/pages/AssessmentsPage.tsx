import React, { useState, useEffect } from 'react';
import {
  AssessmentQuestion,
  AssessmentTest,
  AssessmentAttemptResult,
  QuestionCategory,
  DifficultyLevel,
  QuestionType,
} from '../../../shared/types/assessment-engine';
import { assessmentService } from '../services/assessmentService';
import { useToast } from '../context/ToastContext';
import {
  BrainCircuit,
  CheckCircle2,
  Clock,
  HelpCircle,
  Layers,
  Plus,
  Search,
  Sparkles,
  Timer,
  X,
  AlertCircle,
  Award,
  ChevronRight,
  ShieldCheck,
  User,
  History,
  FileCheck,
} from 'lucide-react';

export const AssessmentsPage: React.FC = () => {
  const { error, success } = useToast();
  const [activeTab, setActiveTab] = useState<'tests' | 'bank' | 'results'>('tests');
  const [tests, setTests] = useState<AssessmentTest[]>([]);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [attempts, setAttempts] = useState<AssessmentAttemptResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [bankCategory, setBankCategory] = useState<string>('ALL');
  const [bankDifficulty, setBankDifficulty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Test Runner Modal State
  const [activeTest, setActiveTest] = useState<AssessmentTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [testResult, setTestResult] = useState<AssessmentAttemptResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Question Generator Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiForm, setAiForm] = useState({
    category: 'NUMERICAL_REASONING' as QuestionCategory,
    difficulty: 'MEDIUM' as DifficultyLevel,
    count: 2,
    topic: 'Financial Ratios & Invoicing',
  });
  const [aiGenerating, setAiGenerating] = useState(false);

  const currentUser = {
    id: 'usr_sakshi_1048',
    name: 'Sakshi Koparde',
    email: 'sakshi@tasknera.com',
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTests, fetchedQuestions, fetchedAttempts] = await Promise.all([
        assessmentService.listTests(),
        assessmentService.listQuestions(),
        assessmentService.listAttemptResults(),
      ]);
      setTests(fetchedTests);
      setQuestions(fetchedQuestions);
      setAttempts(fetchedAttempts);
    } catch (err) {
      console.error('Failed to load assessment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer for active test
  useEffect(() => {
    if (!activeTest || testResult) return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTest, testResult]);

  const handleStartTest = (test: AssessmentTest) => {
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTestResult(null);
    setTimeRemainingSeconds(test.timeLimitMinutes * 60);
  };

  const handleSelectOption = (questionId: string, optionId: string, isMulti: boolean) => {
    const current = selectedAnswers[questionId] || [];
    if (isMulti) {
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      setSelectedAnswers({ ...selectedAnswers, [questionId]: next });
    } else {
      setSelectedAnswers({ ...selectedAnswers, [questionId]: [optionId] });
    }
  };

  const handleAutoSubmit = () => {
    if (activeTest && !testResult && !isSubmitting) {
      handleSubmitTest();
    }
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;
    try {
      setIsSubmitting(true);
      const answersPayload = (activeTest.questions || []).map((q) => ({
        questionId: q.id,
        selectedOptionIds: selectedAnswers[q.id] || [],
      }));

      const timeSpent = activeTest.timeLimitMinutes * 60 - timeRemainingSeconds;
      const result = await assessmentService.submitAttempt(
        activeTest.id,
        currentUser,
        answersPayload,
        Math.max(15, timeSpent)
      );

      setTestResult(result);
      await loadData();
      success('Assessment submitted and scored successfully!');
    } catch (err: any) {
      error(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewQuestion = async (id: string, decision: 'PUBLISH' | 'REJECT') => {
    try {
      await assessmentService.reviewQuestion(id, decision, currentUser.id);
      await loadData();
      success(`Question successfully ${decision === 'PUBLISH' ? 'published' : 'rejected'}`);
    } catch (err: any) {
      error(err.message || 'Review failed');
    }
  };

  const handleGenerateAiQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAiGenerating(true);
      await assessmentService.generateAiQuestions({
        category: aiForm.category,
        difficulty: aiForm.difficulty,
        count: Number(aiForm.count),
        topic: aiForm.topic,
      });
      await loadData();
      setIsAiModalOpen(false);
      setActiveTab('bank');
      success('AI generated questions successfully added to the item bank!');
    } catch (err: any) {
      error(err.message || 'AI generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (bankCategory !== 'ALL' && q.category !== bankCategory) return false;
    if (bankDifficulty !== 'ALL' && q.difficulty !== bankDifficulty) return false;
    if (searchQuery.trim()) {
      const s = searchQuery.toLowerCase();
      return q.questionText.toLowerCase().includes(s) || q.explanation.toLowerCase().includes(s);
    }
    return true;
  });

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
              Aptitude & Assessments Engine
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Step 10 Integrated
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Aptitude Tests & Cognitive Quizzes
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Numerical, logical, and verbal reasoning screening, technical quizzes, question banks,
            and AI question generation with strict HR/L&D review workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AI Question Generator
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Configured Tests</span>
            <BrainCircuit className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{tests.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Published & Active</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Question Bank</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{questions.length}</p>
          <p className="text-[11px] text-purple-700 mt-0.5 font-medium">
            {questions.filter((q) => q.status === 'DRAFT').length} Awaiting HR Review
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Attempts</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{attempts.length}</p>
          <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
            {attempts.filter((a) => a.passed).length} Cleared Threshold
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average Score</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {attempts.length > 0
              ? Math.round(attempts.reduce((a, b) => a + b.scorePercent, 0) / attempts.length)
              : 85}
            %
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Passing benchmark &gt;= 70%</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('tests')}
          className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'tests'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          Available Tests & Quizzes ({tests.length})
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'bank'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Question Bank & AI Drafts ({questions.length})
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`pb-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'results'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Candidate Results & History ({attempts.length})
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: AVAILABLE TESTS */}
      {/* ===================================================================== */}
      {activeTab === 'tests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                    {test.category}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Pass: {test.passThresholdPercent}%
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{test.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{test.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Questions</span>
                    <span className="font-bold text-slate-800">{test.questionIds.length}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Time Limit</span>
                    <span className="font-bold text-slate-800">{test.timeLimitMinutes} Mins</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block">Max Attempts</span>
                    <span className="font-bold text-slate-800">{test.maxAttempts}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  <span>{test.totalAttempts} Attempts logged</span> &bull;{' '}
                  <span className="font-medium text-slate-700">Avg {test.averageScorePercent}%</span>
                </div>
                <button
                  onClick={() => handleStartTest(test)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-1.5"
                >
                  Start Assessment
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: QUESTION BANK */}
      {/* ===================================================================== */}
      {activeTab === 'bank' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search question bank by keyword or explanation..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={bankCategory}
                onChange={(e) => setBankCategory(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="ALL">All Categories</option>
                <option value="NUMERICAL_REASONING">Numerical Reasoning</option>
                <option value="LOGICAL_REASONING">Logical Reasoning</option>
                <option value="VERBAL_REASONING">Verbal Reasoning</option>
                <option value="BASIC_TECHNICAL">Basic Technical</option>
              </select>

              <select
                value={bankDifficulty}
                onChange={(e) => setBankDifficulty(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          {/* Questions Grid */}
          <div className="space-y-3">
            {filteredQuestions.map((q) => {
              const isDraft = q.status === 'DRAFT';
              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${
                    isDraft
                      ? 'border-purple-300 bg-purple-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {q.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            q.difficulty === 'EASY'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.difficulty === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">({q.type})</span>

                        {q.isAiGenerated && (
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI Draft
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            q.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-relaxed">
                        {q.questionText}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {q.options.map((opt) => {
                          const isCorrect = q.correctOptionIds.includes(opt.id);
                          return (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                                isCorrect
                                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900 font-medium'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              <span>{opt.text}</span>
                              {isCorrect && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-md font-sans">
                        <strong className="text-slate-700">Explanation:</strong> {q.explanation}
                      </p>
                    </div>

                    {/* HR Review Action for AI Generated Drafts */}
                    {isDraft && (
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => handleReviewQuestion(q.id, 'PUBLISH')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          Approve & Publish
                        </button>
                        <button
                          onClick={() => handleReviewQuestion(q.id, 'REJECT')}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: CANDIDATE RESULTS */}
      {/* ===================================================================== */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Candidate & Employee Test Results</h3>
              <p className="text-xs text-slate-500">
                Audited grading logs, pass/fail thresholds, and evaluation scores
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-6 py-3">Candidate</th>
                  <th className="px-6 py-3">Test Title</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Correct / Total</th>
                  <th className="px-6 py-3">Time Spent</th>
                  <th className="px-6 py-3">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-900">{att.candidateName}</div>
                      <div className="text-[11px] text-slate-400">{att.candidateEmail}</div>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-800">{att.testTitle}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-sm font-bold ${
                          att.passed ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {att.scorePercent}%
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                          att.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {att.passed ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {att.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-700">
                      {att.correctAnswersCount} / {att.totalQuestions}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">
                      {Math.round(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {new Date(att.completedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TEST RUNNER MODAL */}
      {/* ===================================================================== */}
      {activeTest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header & Live Timer */}
            <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Active Assessment
                </span>
                <h3 className="text-sm font-bold text-slate-900">{activeTest.title}</h3>
              </div>

              {!testResult && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold">
                  <Timer className="w-4 h-4 text-blue-600" />
                  <span>{formatTimer(timeRemainingSeconds)}</span>
                </div>
              )}

              {testResult && (
                <button
                  onClick={() => setActiveTest(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Test Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {!testResult ? (
                <div>
                  {activeTest.questions && activeTest.questions[currentQuestionIndex] ? (
                    (() => {
                      const q = activeTest.questions[currentQuestionIndex];
                      const isMulti = q.type === 'MULTIPLE_ANSWERS';
                      const userSelected = selectedAnswers[q.id] || [];

                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-500">
                              Question {currentQuestionIndex + 1} of {activeTest.questions.length}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {q.category} &bull; {q.type}
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all"
                              style={{
                                width: `${
                                  ((currentQuestionIndex + 1) / activeTest.questions.length) * 100
                                }%`,
                              }}
                            />
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {q.questionText}
                          </h4>

                          <div className="space-y-2 pt-2">
                            {q.options.map((opt) => {
                              const isChecked = userSelected.includes(opt.id);
                              return (
                                <div
                                  key={opt.id}
                                  onClick={() => handleSelectOption(q.id, opt.id, isMulti)}
                                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                                    isChecked
                                      ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-medium'
                                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                                  }`}
                                >
                                  <span>{opt.text}</span>
                                  <input
                                    type={isMulti ? 'checkbox' : 'radio'}
                                    checked={isChecked}
                                    onChange={() => {}}
                                    className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-xs text-slate-500">No questions found in this assessment.</p>
                  )}
                </div>
              ) : (
                /* Graded Result View */
                <div className="text-center py-4 space-y-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                      testResult.passed
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-rose-100 text-rose-600'
                    }`}
                  >
                    {testResult.passed ? (
                      <CheckCircle2 className="w-8 h-8" />
                    ) : (
                      <AlertCircle className="w-8 h-8" />
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {testResult.passed
                      ? 'Congratulations! Assessment Passed'
                      : 'Assessment Not Passed'}
                  </h3>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-sm mx-auto space-y-2 text-xs text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Your Score:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {testResult.scorePercent}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Required Benchmark:</span>
                      <span className="font-semibold text-slate-700">
                        {testResult.passThresholdPercent}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Correct Answers:</span>
                      <span className="font-semibold text-slate-700">
                        {testResult.correctAnswersCount} / {testResult.totalQuestions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Time Spent:</span>
                      <span className="font-mono text-slate-700">
                        {Math.round(testResult.timeSpentSeconds / 60)}m{' '}
                        {testResult.timeSpentSeconds % 60}s
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTest(null)}
                      className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                    >
                      Return to Assessment Center
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Test Runner Bottom Controls */}
            {!testResult && (
              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                >
                  Previous
                </button>

                {currentQuestionIndex < (activeTest.questions?.length || 0) - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmitTest}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                  >
                    {isSubmitting ? 'Evaluating...' : 'Submit Assessment'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* AI QUESTION GENERATOR MODAL */}
      {/* ===================================================================== */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">AI Question Assistant</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateAiQuestions} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reasoning Category
                </label>
                <select
                  value={aiForm.category}
                  onChange={(e) =>
                    setAiForm({ ...aiForm, category: e.target.value as QuestionCategory })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                >
                  <option value="NUMERICAL_REASONING">Numerical Reasoning</option>
                  <option value="LOGICAL_REASONING">Logical Reasoning</option>
                  <option value="VERBAL_REASONING">Verbal Reasoning</option>
                  <option value="BASIC_TECHNICAL">Basic Technical</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={aiForm.difficulty}
                    onChange={(e) =>
                      setAiForm({ ...aiForm, difficulty: e.target.value as DifficultyLevel })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={aiForm.count}
                    onChange={(e) => setAiForm({ ...aiForm, count: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Specific Topic</label>
                <input
                  type="text"
                  value={aiForm.topic}
                  onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                  placeholder="e.g. Percentage growth, Modus Ponens, REST status codes"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900">
                <span className="font-semibold block mb-0.5">Strict Human Review Policy:</span>
                Generated questions are placed into <strong>DRAFT</strong> status and will NOT appear
                in candidate assessments until reviewed and published by an HR/L&D administrator.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiGenerating}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                >
                  {aiGenerating ? 'Generating Drafts...' : 'Generate Questions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
