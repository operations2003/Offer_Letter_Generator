import { Request, Response, NextFunction } from 'express';
import { OnboardingService } from './onboarding.service.js';

export class OnboardingController {
  private onboardingService: OnboardingService;

  constructor() {
    this.onboardingService = new OnboardingService();
  }

  // GET /api/v1/onboarding/config
  public getFormConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req.query.companyId as string) || (req as any).user?.companyId || 'cmp_tasknera_001';
      const config = await this.onboardingService.getFormConfig(companyId);
      res.status(200).json({ success: true, data: config });
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/v1/onboarding/config
  public updateFormConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req.query.companyId as string) || (req as any).user?.companyId || 'cmp_tasknera_001';
      const userId = (req as any).user?.id || 'usr_sakshi_1048';
      const updated = await this.onboardingService.updateFormConfig(companyId, req.body, userId);
      res.status(200).json({ success: true, data: updated, message: 'Onboarding form configuration updated' });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/v1/onboarding/candidates
  public initiateOnboarding = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const creatorId = (req as any).user?.id || 'usr_sakshi_1048';
      const companyId = (req as any).user?.companyId || req.body.companyId || 'cmp_tasknera_001';
      const candidate = await this.onboardingService.initiateOnboarding({
        ...req.body,
        companyId,
        creatorId,
      });
      res.status(201).json({ success: true, data: candidate, message: 'Onboarding initiated successfully' });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/v1/onboarding/candidates
  public listCandidates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req.query.companyId as string) || (req as any).user?.companyId;
      const status = req.query.status as any;
      const search = req.query.search as string;

      const list = await this.onboardingService.listCandidates({ companyId, status, search });
      res.status(200).json({ success: true, data: list, count: list.length });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/v1/onboarding/candidates/:id
  public getCandidateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidate = await this.onboardingService.getCandidateById(req.params.id);
      res.status(200).json({ success: true, data: candidate });
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/v1/onboarding/candidates/:id/draft
  public saveDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || 'candidate_self';
      const candidate = await this.onboardingService.saveDraft(req.params.id, req.body, userId);
      res.status(200).json({ success: true, data: candidate, message: 'Draft saved successfully' });
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/v1/onboarding/candidates/:id/submit
  public submitForm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || 'candidate_self';
      const candidate = await this.onboardingService.submitForm(req.params.id, req.body, userId);
      res.status(200).json({ success: true, data: candidate, message: 'Onboarding form submitted successfully' });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/v1/onboarding/candidates/:id/documents
  public uploadDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await this.onboardingService.uploadDocument(req.params.id, req.body);
      res.status(201).json({ success: true, data: doc, message: 'Document uploaded' });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/v1/onboarding/candidates/:id/documents/:docId/verify
  public verifyDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reviewerId = (req as any).user?.id || 'usr_sakshi_1048';
      const { decision, reason } = req.body;
      const candidate = await this.onboardingService.verifyDocument(
        req.params.id,
        req.params.docId,
        decision,
        reason,
        reviewerId
      );
      res.status(200).json({ success: true, data: candidate, message: `Document marked as ${decision}` });
    } catch (err) {
      next(err);
    }
  };

  // PUT /api/v1/onboarding/candidates/:id/checklist/:itemId
  public updateChecklistItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorId = (req as any).user?.id || 'usr_sakshi_1048';
      const candidate = await this.onboardingService.updateChecklistItem(
        req.params.id,
        req.params.itemId,
        req.body,
        actorId
      );
      res.status(200).json({ success: true, data: candidate, message: 'Checklist updated' });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/v1/onboarding/candidates/:id/review
  public reviewCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reviewerId = (req as any).user?.id || 'usr_sakshi_1048';
      const { decision, notes } = req.body;
      const candidate = await this.onboardingService.reviewCandidate(req.params.id, decision, notes, reviewerId);
      res.status(200).json({ success: true, data: candidate, message: `Candidate status updated to ${candidate.status}` });
    } catch (err) {
      next(err);
    }
  };
}
