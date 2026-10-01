export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MULTIPLE_ANSWERS';
export type QuestionCategory = 'NUMERICAL_REASONING' | 'LOGICAL_REASONING' | 'VERBAL_REASONING' | 'BASIC_TECHNICAL';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionStatus = 'DRAFT' | 'REVIEWED' | 'PUBLISHED';
export interface QuestionOption {
    id: string;
    text: string;
}
export interface AssessmentQuestion {
    id: string;
    category: QuestionCategory;
    type: QuestionType;
    difficulty: DifficultyLevel;
    questionText: string;
    options: QuestionOption[];
    correctOptionIds: string[];
    explanation: string;
    status: QuestionStatus;
    isAiGenerated: boolean;
    reviewedBy?: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface AssessmentTest {
    id: string;
    companyId: string;
    title: string;
    description: string;
    category: QuestionCategory | 'COMPREHENSIVE';
    questionIds: string[];
    questions?: AssessmentQuestion[];
    timeLimitMinutes: number;
    maxAttempts: number;
    passThresholdPercent: number;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    totalAttempts: number;
    averageScorePercent: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
export interface CandidateQuestionAnswer {
    questionId: string;
    selectedOptionIds: string[];
    isCorrect?: boolean;
}
export interface AssessmentAttemptResult {
    id: string;
    testId: string;
    testTitle: string;
    candidateOrEmployeeId: string;
    candidateName: string;
    candidateEmail: string;
    answers: CandidateQuestionAnswer[];
    totalQuestions: number;
    correctAnswersCount: number;
    scorePercent: number;
    passed: boolean;
    passThresholdPercent: number;
    attemptNumber: number;
    timeSpentSeconds: number;
    startedAt: string;
    completedAt: string;
}
export interface AiGenerateQuestionsRequest {
    category: QuestionCategory;
    type?: QuestionType;
    difficulty: DifficultyLevel;
    count: number;
    topic?: string;
}
export interface AiImproveQuestionRequest {
    questionText: string;
    options: QuestionOption[];
    explanation?: string;
}
//# sourceMappingURL=assessment-engine.d.ts.map