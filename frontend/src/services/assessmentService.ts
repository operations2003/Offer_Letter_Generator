// =============================================================================
// STEP 10: ASSESSMENT & QUIZZES API SERVICE
// =============================================================================

import {
  AssessmentQuestion,
  AssessmentTest,
  AssessmentAttemptResult,
  QuestionCategory,
  DifficultyLevel,
  QuestionType,
  AiGenerateQuestionsRequest,
  AiImproveQuestionRequest,
} from '../../../shared/types/assessment-engine';

const API_BASE_URL = '/api/v1/assessments';

export const assessmentService = {
  // 1. Question Bank
  async listQuestions(filters?: {
    category?: QuestionCategory;
    difficulty?: DifficultyLevel;
    type?: QuestionType;
    status?: string;
    search?: string;
  }): Promise<AssessmentQuestion[]> {
    const query = new URLSearchParams();
    if (filters?.category) query.append('category', filters.category);
    if (filters?.difficulty) query.append('difficulty', filters.difficulty);
    if (filters?.type) query.append('type', filters.type);
    if (filters?.status) query.append('status', filters.status);
    if (filters?.search) query.append('search', filters.search);

    const res = await fetch(`${API_BASE_URL}/questions?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load questions from bank');
    const json = await res.json();
    return json.data;
  },

  async createQuestion(data: Partial<AssessmentQuestion>): Promise<AssessmentQuestion> {
    const res = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create question');
    const json = await res.json();
    return json.data;
  },

  async reviewQuestion(
    id: string,
    decision: 'PUBLISH' | 'REJECT',
    reviewerId: string = 'usr_admin_001',
    editedContent?: Partial<AssessmentQuestion>
  ): Promise<AssessmentQuestion> {
    const res = await fetch(`${API_BASE_URL}/questions/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, reviewerId, editedContent }),
    });
    if (!res.ok) throw new Error('Failed to review question');
    const json = await res.json();
    return json.data;
  },

  // 2. AI Question Assistant
  async generateAiQuestions(payload: AiGenerateQuestionsRequest): Promise<AssessmentQuestion[]> {
    const res = await fetch(`${API_BASE_URL}/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate AI questions');
    const json = await res.json();
    return json.data;
  },

  async improveQuestionWithAi(payload: AiImproveQuestionRequest): Promise<{
    improvedQuestionText: string;
    improvedExplanation: string;
    suggestedDifficulty: DifficultyLevel;
  }> {
    const res = await fetch(`${API_BASE_URL}/ai/improve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to improve question');
    const json = await res.json();
    return json.data;
  },

  // 3. Tests & Quizzes Management
  async listTests(companyId?: string): Promise<AssessmentTest[]> {
    const url = companyId ? `${API_BASE_URL}/tests?companyId=${companyId}` : `${API_BASE_URL}/tests`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load tests');
    const json = await res.json();
    return json.data;
  },

  async getTestById(id: string): Promise<AssessmentTest> {
    const res = await fetch(`${API_BASE_URL}/tests/${id}`);
    if (!res.ok) throw new Error(`Failed to load test: ${id}`);
    const json = await res.json();
    return json.data;
  },

  async createTest(data: Partial<AssessmentTest>): Promise<AssessmentTest> {
    const res = await fetch(`${API_BASE_URL}/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create test');
    const json = await res.json();
    return json.data;
  },

  // 4. Attempts Execution & Results
  async submitAttempt(
    testId: string,
    candidate: { id: string; name: string; email: string },
    answers: { questionId: string; selectedOptionIds: string[] }[],
    timeSpentSeconds: number
  ): Promise<AssessmentAttemptResult> {
    const res = await fetch(`${API_BASE_URL}/tests/${testId}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        answers,
        timeSpentSeconds,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to submit test attempt');
    }
    const json = await res.json();
    return json.data;
  },

  async listAttemptResults(filters?: { testId?: string; candidateId?: string }): Promise<AssessmentAttemptResult[]> {
    const query = new URLSearchParams();
    if (filters?.testId) query.append('testId', filters.testId);
    if (filters?.candidateId) query.append('candidateId', filters.candidateId);

    const res = await fetch(`${API_BASE_URL}/attempts?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load attempt results');
    const json = await res.json();
    return json.data;
  },
};
