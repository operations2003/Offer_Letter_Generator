// =============================================================================
// L&D / COURSES & CERTIFICATES CONTROLLER
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { LearningService } from './learning.service.js';
import { CertificateService } from './certificate.service.js';

export class LearningController {
  private learningService: LearningService;
  private certificateService: CertificateService;

  constructor(learningService?: LearningService, certificateService?: CertificateService) {
    this.learningService = learningService || new LearningService();
    this.certificateService = certificateService || new CertificateService();
  }

  // ---------------------------------------------------------------------------
  // 1. Courses Endpoints
  // ---------------------------------------------------------------------------

  public listCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId, category, status, isMandatory, search } = req.query;
      const courses = await this.learningService.listCourses({
        companyId: companyId as string,
        category: category as any,
        status: status as string,
        isMandatory: isMandatory !== undefined ? isMandatory === 'true' : undefined,
        search: search as string,
      });

      res.status(200).json({
        success: true,
        data: courses,
        count: courses.length,
      });
    } catch (err) {
      next(err);
    }
  };

  public getCourseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await this.learningService.getCourseById(req.params.id);
      res.status(200).json({
        success: true,
        data: course,
      });
    } catch (err) {
      next(err);
    }
  };

  public createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const creatorRole =
        (req.headers['x-user-role'] as string) ||
        (req as any).user?.role ||
        req.body.creatorRole ||
        'HR_MANAGER';

      const creatorId =
        (req.headers['x-user-id'] as string) ||
        (req as any).user?.id ||
        req.body.creatorId ||
        'usr_admin_001';

      const course = await this.learningService.createCourse({
        ...req.body,
        creatorRole,
        creatorId,
      });

      res.status(201).json({
        success: true,
        data: course,
        message: 'Course successfully created and published to academy catalog',
      });
    } catch (err) {
      next(err);
    }
  };

  public updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role =
        (req.headers['x-user-role'] as string) ||
        (req as any).user?.role ||
        req.body.role ||
        'HR_MANAGER';

      const actorId =
        (req.headers['x-user-id'] as string) ||
        (req as any).user?.id ||
        req.body.actorId ||
        'usr_admin_001';

      const updated = await this.learningService.updateCourse(req.params.id, req.body, role, actorId);

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Course updated successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. Enrollments & Assignments
  // ---------------------------------------------------------------------------

  public enrollUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const user = {
        id: req.body.userId || 'usr_employee_default',
        name: req.body.userName || 'Employee Learner',
        email: req.body.userEmail || 'learner@tasknera.com',
        department: req.body.department || 'Engineering',
      };

      const enrollment = await this.learningService.enrollUser(courseId, user);
      res.status(201).json({
        success: true,
        data: enrollment,
        message: 'Successfully enrolled into course',
      });
    } catch (err) {
      next(err);
    }
  };

  public listUserEnrollments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.query.userId as string) || 'usr_sakshi_1048';
      const enrollments = await this.learningService.listUserEnrollments(userId);
      res.status(200).json({
        success: true,
        data: enrollments,
        count: enrollments.length,
      });
    } catch (err) {
      next(err);
    }
  };

  public updateProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const progressPercent = Number(req.body.progressPercent || 0);
      const enrollment = await this.learningService.updateEnrollmentProgress(
        req.params.enrollmentId,
        progressPercent
      );

      res.status(200).json({
        success: true,
        data: enrollment,
        message: `Updated progress to ${enrollment.progressPercent}%`,
      });
    } catch (err) {
      next(err);
    }
  };

  public submitAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const enrollment = await this.learningService.submitAssignment(
        req.params.enrollmentId,
        req.body.submissionTextOrUrl || 'Assignment submission via TaskNera portal'
      );

      res.status(200).json({
        success: true,
        data: enrollment,
        message: 'Assignment submitted and evaluated successfully',
      });
    } catch (err) {
      next(err);
    }
  };

  public checkEligibility = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const evaluation = await this.learningService.evaluateCertificateEligibility(
        req.params.enrollmentId
      );

      res.status(200).json({
        success: true,
        data: evaluation,
      });
    } catch (err) {
      next(err);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. Certificates Flow (Step 9)
  // ---------------------------------------------------------------------------

  public listCertificateTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const typeCode = req.query.typeCode as any;
      const templates = this.certificateService.listTemplates(typeCode);
      res.status(200).json({
        success: true,
        data: templates,
        count: templates.length,
      });
    } catch (err) {
      next(err);
    }
  };

  public getCertificateTemplateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = this.certificateService.getTemplateById(req.params.id);
      res.status(200).json({
        success: true,
        data: template,
      });
    } catch (err) {
      next(err);
    }
  };

  public requestCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requesterRole =
        (req.headers['x-user-role'] as string) ||
        (req as any).user?.role ||
        req.body.requesterRole ||
        'HR_MANAGER';

      const requesterId =
        (req.headers['x-user-id'] as string) ||
        (req as any).user?.id ||
        req.body.requesterId ||
        'usr_admin_001';

      const cert = await this.certificateService.requestCertificate({
        ...req.body,
        requesterRole,
        requesterId,
      });

      res.status(201).json({
        success: true,
        data: cert,
        message:
          cert.status === 'ISSUED'
            ? `Official certificate issued with Reference ${cert.referenceNumber}`
            : 'Certificate request submitted for HR/L&D review',
      });
    } catch (err) {
      next(err);
    }
  };

  public reviewCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewerRole =
        (req.headers['x-user-role'] as string) ||
        (req as any).user?.role ||
        req.body.reviewerRole ||
        'HR_MANAGER';

      const reviewerId =
        (req.headers['x-user-id'] as string) ||
        (req as any).user?.id ||
        req.body.reviewerId ||
        'usr_admin_001';

      const decision = req.body.decision === 'REJECT' ? 'REJECT' : 'APPROVE';
      const cert = await this.certificateService.reviewCertificate(
        req.params.id,
        decision,
        reviewerId,
        reviewerRole,
        req.body.notes
      );

      res.status(200).json({
        success: true,
        data: cert,
        message: `Certificate successfully ${decision === 'APPROVE' ? 'approved' : 'rejected'}`,
      });
    } catch (err) {
      next(err);
    }
  };

  public generateCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const generatorRole =
        (req.headers['x-user-role'] as string) ||
        (req as any).user?.role ||
        req.body.generatorRole ||
        'HR_MANAGER';

      const generatorId =
        (req.headers['x-user-id'] as string) ||
        (req as any).user?.id ||
        req.body.generatorId ||
        'usr_admin_001';

      const cert = await this.certificateService.generateCertificate(
        req.params.id,
        generatorId,
        generatorRole
      );

      res.status(200).json({
        success: true,
        data: cert,
        message: `Certificate issued with official Reference ${cert.referenceNumber}`,
      });
    } catch (err) {
      next(err);
    }
  };

  public listCertificates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId, status, recipientEmail, certificateTypeCode, search } = req.query;
      const certs = await this.certificateService.listCertificates({
        companyId: companyId as string,
        status: status as any,
        recipientEmail: recipientEmail as string,
        certificateTypeCode: certificateTypeCode as any,
        search: search as string,
      });

      res.status(200).json({
        success: true,
        data: certs,
        count: certs.length,
      });
    } catch (err) {
      next(err);
    }
  };

  public getCertificateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cert = await this.certificateService.getCertificateById(req.params.id);
      res.status(200).json({
        success: true,
        data: cert,
      });
    } catch (err) {
      next(err);
    }
  };

  public verifyCertificate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refNumber = req.params.refNumber || (req.query.ref as string);
      const result = await this.certificateService.verifyCertificate(refNumber);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
}
