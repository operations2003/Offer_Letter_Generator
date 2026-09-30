// =============================================================================
// STEP 10: APTITUDE TESTS & QUIZZES ASSESSMENT SERVICE
// =============================================================================

import crypto from 'crypto';
import {
  AssessmentQuestion,
  AssessmentTest,
  AssessmentAttemptResult,
  QuestionCategory,
  QuestionType,
  DifficultyLevel,
  CandidateQuestionAnswer,
  AiGenerateQuestionsRequest,
  AiImproveQuestionRequest,
} from '../../../../shared/types/assessment-engine.js';
import { DEFAULT_QUESTION_BANK } from './assessment-bank.catalog.js';
import { AuditService } from '../audit/audit.service.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../../errors/app-error.js';

export class AssessmentService {
  private questions: Map<string, AssessmentQuestion> = new Map();
  private tests: Map<string, AssessmentTest> = new Map();
  private attempts: Map<string, AssessmentAttemptResult> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // 1. Seed Question Bank
    DEFAULT_QUESTION_BANK.forEach((q) => {
      this.questions.set(q.id, { ...q });
    });

    // 2. Seed Default Tests
    const test1: AssessmentTest = {
      id: 'tst_apt_benchmark_01',
      companyId: 'cmp_tasknera_001',
      title: 'TaskNera General Aptitude Benchmark 2026',
      description:
        'Standardized cognitive assessment evaluating numerical interpretation, logical deduction, and verbal precision for new onboarding cohorts.',
      category: 'COMPREHENSIVE',
      questionIds: ['qst_num_01', 'qst_num_02', 'qst_log_01', 'qst_log_02', 'qst_vrb_01'],
      timeLimitMinutes: 20,
      maxAttempts: 2,
      passThresholdPercent: 70,
      status: 'PUBLISHED',
      totalAttempts: 12,
      averageScorePercent: 82,
      createdBy: 'usr_admin_001',
      createdAt: '2026-09-01T10:00:00Z',
      updatedAt: '2026-09-01T10:00:00Z',
    };

    const test2: AssessmentTest = {
      id: 'tst_tech_core_02',
      companyId: 'cmp_tasknera_001',
      title: 'Engineering Core Competency & Cloud Fundamentals Quiz',
      description:
        'Technical screening covering HTTP protocols, relational database transactions (ACID), and basic systems design.',
      category: 'BASIC_TECHNICAL',
      questionIds: ['qst_tch_01', 'qst_tch_02'],
      timeLimitMinutes: 15,
      maxAttempts: 3,
      passThresholdPercent: 75,
      status: 'PUBLISHED',
      totalAttempts: 9,
      averageScorePercent: 88,
      createdBy: 'usr_admin_001',
      createdAt: '2026-09-10T10:00:00Z',
      updatedAt: '2026-09-10T10:00:00Z',
    };

    this.tests.set(test1.id, test1);
    this.tests.set(test2.id, test2);

    // 3. Seed an initial attempt result
    const sampleAttempt: AssessmentAttemptResult = {
      id: 'att_seed_001',
      testId: test1.id,
      testTitle: test1.title,
      candidateOrEmployeeId: 'usr_sakshi_1048',
      candidateName: 'Sakshi Koparde',
      candidateEmail: 'sakshi@tasknera.com',
      answers: [
        { questionId: 'qst_num_01', selectedOptionIds: ['opt_2'], isCorrect: true },
        { questionId: 'qst_num_02', selectedOptionIds: ['opt_2'], isCorrect: true },
        { questionId: 'qst_log_01', selectedOptionIds: ['opt_2'], isCorrect: true },
        { questionId: 'qst_log_02', selectedOptionIds: ['opt_t'], isCorrect: true },
        { questionId: 'qst_vrb_01', selectedOptionIds: ['opt_2'], isCorrect: true },
      ],
      totalQuestions: 5,
      correctAnswersCount: 5,
      scorePercent: 100,
      passed: true,
      passThresholdPercent: 70,
      attemptNumber: 1,
      timeSpentSeconds: 420,
      startedAt: '2026-09-12T11:00:00Z',
      completedAt: '2026-09-12T11:07:00Z',
    };

    this.attempts.set(sampleAttempt.id, sampleAttempt);
  }

  // ---------------------------------------------------------------------------
  // 1. Question Bank Management
  // ---------------------------------------------------------------------------

  public listQuestions(filters?: {
    category?: QuestionCategory;
    difficulty?: DifficultyLevel;
    type?: QuestionType;
    status?: string;
    search?: string;
  }): AssessmentQuestion[] {
    let list = Array.from(this.questions.values());

    if (filters?.category) {
      list = list.filter((q) => q.category === filters.category);
    }
    if (filters?.difficulty) {
      list = list.filter((q) => q.difficulty === filters.difficulty);
    }
    if (filters?.type) {
      list = list.filter((q) => q.type === filters.type);
    }
    if (filters?.status) {
      list = list.filter((q) => q.status === filters.status);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(
        (q) => q.questionText.toLowerCase().includes(s) || q.explanation.toLowerCase().includes(s)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getQuestionById(id: string): AssessmentQuestion {
    const q = this.questions.get(id);
    if (!q) {
      throw new NotFoundError(`Question not found: ${id}`);
    }
    return JSON.parse(JSON.stringify(q));
  }

  public createQuestion(
    data: Omit<AssessmentQuestion, 'id' | 'createdAt' | 'updatedAt'>
  ): AssessmentQuestion {
    const id = `qst_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const question: AssessmentQuestion = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.questions.set(id, question);
    return question;
  }

  /**
   * HR / L&D Review Rule: AI-generated questions must be reviewed and approved by HR/L&D before publishing.
   */
  public async reviewAndPublishQuestion(
    id: string,
    reviewerId: string,
    decision: 'PUBLISH' | 'REJECT',
    editedContent?: Partial<AssessmentQuestion>
  ): Promise<AssessmentQuestion> {
    const question = this.getQuestionById(id);
    const now = new Date().toISOString();

    if (decision === 'PUBLISH') {
      question.status = 'PUBLISHED';
      question.reviewedBy = reviewerId;
      question.reviewedAt = now;
      if (editedContent) {
        Object.assign(question, editedContent);
      }
    } else {
      question.status = 'DRAFT';
    }

    question.updatedAt = now;
    this.questions.set(id, question);

    await AuditService.record({
      companyId: 'cmp_tasknera_001',
      actorType: 'USER',
      actorId: reviewerId,
      entityType: 'TEST',
      entityId: id,
      action: 'APPROVE',
      actionDescription: `${decision === 'PUBLISH' ? 'Approved & published' : 'Rejected'} assessment question: "${question.questionText.slice(0, 50)}..."`,
      newState: question as any,
    });

    return question;
  }

  // ---------------------------------------------------------------------------
  // 2. Test Catalog & Administration
  // ---------------------------------------------------------------------------

  public listTests(companyId?: string): AssessmentTest[] {
    let list = Array.from(this.tests.values());
    if (companyId) {
      list = list.filter((t) => t.companyId === companyId);
    }
    return list.map((t) => ({
      ...t,
      questions: t.questionIds.map((qid) => this.questions.get(qid)!).filter(Boolean),
    }));
  }

  public getTestById(id: string): AssessmentTest {
    const test = this.tests.get(id);
    if (!test) {
      throw new NotFoundError(`Assessment Test not found: ${id}`);
    }
    const populated = {
      ...test,
      questions: test.questionIds.map((qid) => this.questions.get(qid)!).filter(Boolean),
    };
    return JSON.parse(JSON.stringify(populated));
  }

  public async createTest(
    data: Omit<AssessmentTest, 'id' | 'totalAttempts' | 'averageScorePercent' | 'createdAt' | 'updatedAt'>
  ): Promise<AssessmentTest> {
    if (!data.title || !data.questionIds || data.questionIds.length === 0) {
      throw new ValidationError('Test Title and at least one Question ID are required');
    }

    const id = `tst_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const test: AssessmentTest = {
      ...data,
      id,
      totalAttempts: 0,
      averageScorePercent: 0,
      status: data.status || 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
    };

    this.tests.set(id, test);

    await AuditService.record({
      companyId: test.companyId,
      actorType: 'USER',
      actorId: test.createdBy,
      entityType: 'TEST',
      entityId: test.id,
      action: 'CREATE',
      actionDescription: `Created assessment test: "${test.title}" with ${test.questionIds.length} questions`,
      newState: test as any,
    });

    return test;
  }

  // ---------------------------------------------------------------------------
  // 3. Test Attempt Execution & Automatic Grading
  // ---------------------------------------------------------------------------

  public async submitAttempt(
    testId: string,
    candidate: { id: string; name: string; email: string },
    answers: { questionId: string; selectedOptionIds: string[] }[],
    timeSpentSeconds: number
  ): Promise<AssessmentAttemptResult> {
    const test = this.getTestById(testId);

    // Enforce max attempts
    const existingAttempts = Array.from(this.attempts.values()).filter(
      (a) => a.testId === testId && a.candidateOrEmployeeId === candidate.id
    );

    if (existingAttempts.length >= test.maxAttempts) {
      throw new ForbiddenError(
        `Maximum attempts exceeded for this assessment (Max allowed: ${test.maxAttempts}).`
      );
    }

    let correctCount = 0;
    const evaluatedAnswers: CandidateQuestionAnswer[] = [];

    for (const qid of test.questionIds) {
      const question = this.questions.get(qid);
      if (!question) continue;

      const userAns = answers.find((a) => a.questionId === qid);
      const selected = userAns?.selectedOptionIds || [];

      // Evaluation Logic
      const correctSet = new Set(question.correctOptionIds);
      const selectedSet = new Set(selected);

      let isCorrect = false;
      if (correctSet.size === selectedSet.size) {
        isCorrect = Array.from(correctSet).every((id) => selectedSet.has(id));
      }

      if (isCorrect) {
        correctCount += 1;
      }

      evaluatedAnswers.push({
        questionId: qid,
        selectedOptionIds: selected,
        isCorrect,
      });
    }

    const totalQuestions = test.questionIds.length;
    const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = scorePercent >= test.passThresholdPercent;

    const attemptId = `att_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const result: AssessmentAttemptResult = {
      id: attemptId,
      testId,
      testTitle: test.title,
      candidateOrEmployeeId: candidate.id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      answers: evaluatedAnswers,
      totalQuestions,
      correctAnswersCount: correctCount,
      scorePercent,
      passed,
      passThresholdPercent: test.passThresholdPercent,
      attemptNumber: existingAttempts.length + 1,
      timeSpentSeconds,
      startedAt: new Date(Date.now() - timeSpentSeconds * 1000).toISOString(),
      completedAt: now,
    };

    this.attempts.set(attemptId, result);

    // Update Test Aggregated Stats
    test.totalAttempts += 1;
    const allTestAttempts = Array.from(this.attempts.values()).filter((a) => a.testId === testId);
    const sumScores = allTestAttempts.reduce((acc, curr) => acc + curr.scorePercent, 0);
    test.averageScorePercent = Math.round(sumScores / allTestAttempts.length);
    this.tests.set(test.id, test);

    await AuditService.record({
      companyId: test.companyId,
      actorType: 'USER',
      actorId: candidate.id,
      entityType: 'TEST',
      entityId: test.id,
      action: 'CREATE',
      actionDescription: `${candidate.name} submitted test attempt for "${test.title}" — Score: ${scorePercent}% (${passed ? 'PASSED' : 'FAILED'})`,
      newState: result as any,
    });

    return result;
  }

  public listAttemptResults(filters?: {
    testId?: string;
    candidateOrEmployeeId?: string;
  }): AssessmentAttemptResult[] {
    let list = Array.from(this.attempts.values());

    if (filters?.testId) {
      list = list.filter((a) => a.testId === filters.testId);
    }
    if (filters?.candidateOrEmployeeId) {
      list = list.filter((a) => a.candidateOrEmployeeId === filters.candidateOrEmployeeId);
    }

    return list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }

  // ---------------------------------------------------------------------------
  // 4. AI Assistance for HR & L&D
  // ---------------------------------------------------------------------------

  /**
   * Generates questions for review based on topic and difficulty.
   * STRICT: Always saved with status 'DRAFT' and isAiGenerated: true,
   * requiring HR/L&D review before publishing.
   */
  public generateAiQuestions(dto: AiGenerateQuestionsRequest): AssessmentQuestion[] {
    const generated: AssessmentQuestion[] = [];
    const count = Math.min(10, Math.max(1, dto.count || 2));

    for (let i = 0; i < count; i++) {
      const qId = `qst_ai_${crypto.randomUUID().slice(0, 8)}`;
      let qText = '';
      let options = [];
      let correctOptionIds = [];
      let explanation = '';

      if (dto.category === 'NUMERICAL_REASONING') {
        const base = (i + 2) * 50;
        const discount = (i + 1) * 10;
        const discounted = base * (1 - discount / 100);
        qText = `A software subscription costs $${base}/year. A promotional deal offers ${discount}% off. What is the net invoice amount?`;
        options = [
          { id: 'opt_1', text: `$${discounted + 15}` },
          { id: 'opt_2', text: `$${discounted}` },
          { id: 'opt_3', text: `$${discounted - 10}` },
          { id: 'opt_4', text: `$${base - discount}` },
        ];
        correctOptionIds = ['opt_2'];
        explanation = `Calculate discount: $${base} * (${discount}/100) = $${base * (discount / 100)}. Net = $${base} - $${base * (discount / 100)} = $${discounted}.`;
      } else if (dto.category === 'LOGICAL_REASONING') {
        qText = `Statement: If a microservice exceeds 99.9% uptime, it meets SLA. Service Alpha had an uptime of 99.95%. Does Service Alpha meet SLA?`;
        options = [
          { id: 'opt_1', text: 'Yes, definitively' },
          { id: 'opt_2', text: 'No' },
          { id: 'opt_3', text: 'Cannot be determined without latency logs' },
        ];
        correctOptionIds = ['opt_1'];
        explanation = `Since 99.95% > 99.9%, the conditional criterion is satisfied.`;
      } else if (dto.category === 'VERBAL_REASONING') {
        qText = `Identify the word that means "having mixed feelings or contradictory ideas about something or someone":`;
        options = [
          { id: 'opt_1', text: 'Ambivalent' },
          { id: 'opt_2', text: 'Ambiguous' },
          { id: 'opt_3', text: 'Apathetic' },
          { id: 'opt_4', text: 'Audacious' },
        ];
        correctOptionIds = ['opt_1'];
        explanation = `Ambivalent describes simultaneous conflicting emotions. Ambiguous means open to more than one interpretation.`;
      } else {
        qText = `In RESTful HTTP architecture, which method is typically idempotent and used to completely replace an existing resource representation?`;
        options = [
          { id: 'opt_1', text: 'POST' },
          { id: 'opt_2', text: 'PUT' },
          { id: 'opt_3', text: 'PATCH' },
          { id: 'opt_4', text: 'CONNECT' },
        ];
        correctOptionIds = ['opt_2'];
        explanation = `HTTP PUT replaces the target resource with request payload and is idempotent according to RFC 9110.`;
      }

      const question: AssessmentQuestion = {
        id: qId,
        category: dto.category,
        type: dto.type || 'MULTIPLE_CHOICE',
        difficulty: dto.difficulty,
        questionText: qText,
        options,
        correctOptionIds,
        explanation,
        status: 'DRAFT', // Stored in DRAFT for mandatory HR review
        isAiGenerated: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.questions.set(question.id, question);
      generated.push(question);
    }

    return generated;
  }

  public improveQuestionWithAi(dto: AiImproveQuestionRequest): {
    improvedQuestionText: string;
    improvedExplanation: string;
    suggestedDifficulty: DifficultyLevel;
  } {
    return {
      improvedQuestionText: `[Refined for clarity]: ${dto.questionText.trim()} Ensure all prerequisites are specified unambiguously.`,
      improvedExplanation: dto.explanation
        ? `Educational Analysis: ${dto.explanation} Provides direct conceptual rationale.`
        : 'Detailed reasoning step-by-step: Eliminates distractor options with formal logic.',
      suggestedDifficulty: dto.questionText.length > 100 ? 'MEDIUM' : 'EASY',
    };
  }
}
