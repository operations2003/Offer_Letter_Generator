// =============================================================================
// STEP 10: ASSESSMENT & QUIZZES CONTROLLER
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { AssessmentService } from './assessment.service.js';

export class AssessmentController {
  private service: AssessmentService;

  constructor(service?: AssessmentService) {
    this.service = service || new AssessmentService();
  }

  // 1. Question Bank
  public listQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, difficulty, type, status, search } = req.query;
      const questions = this.service.listQuestions({
        category: category as any,
        difficulty: difficulty as any,
        type: type as any,
        status: status as string,
        search: search as string,
      });

      res.status(200).json({
        success: true,
        data: questions,
        count: questions.length,
      });
    } catch (err) {
      next(err);
    }
  };

  public getQuestionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = this.service.getQuestionById(req.params.id);
      res.status(200).json({ success: true, data: q });
    } catch (err) {
      next(err);
    }
  };

  public createQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = this.service.createQuestion(req.body);
      res.status(201).json({ success: true, data: q, message: 'Question created in bank' });
    } catch (err) {
      next(err);
    }
  };

  public reviewQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewerId =
        (req.headers['x-user-id'] as string) ||
        (req as any).user?.id ||
        req.body.reviewerId ||
        'usr_admin_001';

      const decision = req.body.decision === 'REJECT' ? 'REJECT' : 'PUBLISH';
      const reviewed = await this.service.reviewAndPublishQuestion(
        req.params.id,
        reviewerId,
        decision,
        req.body.editedContent
      );

      res.status(200).json({
        success: true,
        data: reviewed,
        message: `Question ${decision === 'PUBLISH' ? 'approved & published' : 'rejected'}`,
      });
    } catch (err) {
      next(err);
    }
  };

  // 2. AI Question Assistant
  public generateAiQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const questions = this.service.generateAiQuestions(req.body);
      res.status(201).json({
        success: true,
        data: questions,
        message: 'AI generated draft questions queued for HR/L&D review',
      });
    } catch (err) {
      next(err);
    }
  };

  public improveQuestionWithAi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = this.service.improveQuestionWithAi(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  // 3. Tests & Quizzes Management
  public listTests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tests = this.service.listTests(req.query.companyId as string);
      res.status(200).json({ success: true, data: tests, count: tests.length });
    } catch (err) {
      next(err);
    }
  };

  public getTestById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const test = this.service.getTestById(req.params.id);
      res.status(200).json({ success: true, data: test });
    } catch (err) {
      next(err);
    }
  };

  public createTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const test = await this.service.createTest({
        ...req.body,
        companyId: req.body.companyId || 'cmp_tasknera_001',
        createdBy: (req as any).user?.id || req.body.createdBy || 'usr_admin_001',
      });

      res.status(201).json({
        success: true,
        data: test,
        message: 'Assessment test configured and published',
      });
    } catch (err) {
      next(err);
    }
  };

  // 4. Attempts Execution & Results
  public submitAttempt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidate = {
        id: req.body.candidateId || (req as any).user?.id || 'usr_sakshi_1048',
        name: req.body.candidateName || (req as any).user?.name || 'Sakshi Koparde',
        email: req.body.candidateEmail || (req as any).user?.email || 'sakshi@tasknera.com',
      };

      const result = await this.service.submitAttempt(
        req.params.id,
        candidate,
        req.body.answers || [],
        req.body.timeSpentSeconds || 60
      );

      res.status(201).json({
        success: true,
        data: result,
        message: `Assessment completed: ${result.scorePercent}% (${result.passed ? 'PASSED' : 'FAILED'})`,
      });
    } catch (err) {
      next(err);
    }
  };

  public listAttemptResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { testId, candidateId } = req.query;
      const results = this.service.listAttemptResults({
        testId: testId as string,
        candidateOrEmployeeId: candidateId as string,
      });

      res.status(200).json({
        success: true,
        data: results,
        count: results.length,
      });
    } catch (err) {
      next(err);
    }
  };
}
