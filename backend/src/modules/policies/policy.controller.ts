// =============================================================================
// HR POLICY ENGINE: POLICY CONTROLLER
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { PolicyService } from './policy.service.js';
import { PolicyAiService } from './policy-ai.service.js';
import { PolicyRegistry } from './policy.registry.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { PolicyTypeCode } from '../../../../shared/types/policy-engine.js';

export class PolicyController {
  /**
   * GET /api/v1/policies/types
   */
  static async getPolicyTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const types = PolicyRegistry.getAll();
      res.status(200).json({
        success: true,
        data: types,
        count: types.length,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/policies/types/:code
   */
  static async getPolicyTypeByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const typeDef = PolicyRegistry.getByCode(code as PolicyTypeCode);
      if (!typeDef) {
        res.status(404).json({
          success: false,
          message: `Policy type "${code}" not found`,
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: typeDef,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/policies
   */
  static async createPolicy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || 'usr_policy_creator';
      const companyId = req.user?.companyId || '00000000-0000-0000-0000-000000000001';

      const policy = await PolicyService.createPolicy({
        ...req.body,
        companyId,
        createdByUserId: userId,
      });

      res.status(201).json({
        success: true,
        data: policy,
        message: `Policy draft created successfully (${policy.policyNumber})`,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/policies
   */
  static async listPolicies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { policyTypeCode, status, department, search, includeArchived } = req.query;
      const policies = await PolicyService.listPolicies({
        policyTypeCode: policyTypeCode as any,
        status: status as any,
        department: department ? String(department) : undefined,
        search: search ? String(search) : undefined,
        includeArchived: includeArchived === 'true',
      });

      res.status(200).json({
        success: true,
        data: policies,
        count: policies.length,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/policies/:id
   */
  static async getPolicyById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const policy = await PolicyService.getById(id);
      res.status(200).json({
        success: true,
        data: policy,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/policies/:id/sections
   */
  static async updateSections(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || 'usr_policy_editor';
      const { sections, changeSummary } = req.body;

      const policy = await PolicyService.updateSections({
        policyId: id,
        sections,
        updatedByUserId: userId,
        changeSummary,
      });

      res.status(200).json({
        success: true,
        data: policy,
        message: 'Policy sections updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/policies/:id/review
   */
  static async submitForReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || 'usr_policy_reviewer';
      const { notes } = req.body;

      const policy = await PolicyService.submitForReview(id, userId, notes);

      res.status(200).json({
        success: true,
        data: policy,
        message: 'Policy submitted for HR Review',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/policies/:id/approve
   */
  static async recordApproval(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || 'usr_policy_approver';
      const { approverName, approverTitle, decision, notes } = req.body;

      const policy = await PolicyService.recordApproval({
        policyId: id,
        approverUserId: userId,
        approverName: approverName || 'Authorized Approver',
        approverTitle: approverTitle || 'HR Director',
        decision,
        notes,
      });

      res.status(200).json({
        success: true,
        data: policy,
        message: `Approval decision "${decision}" recorded`,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/policies/:id/publish
   */
  static async publishPolicy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || 'usr_policy_publisher';
      const { changeSummary } = req.body;

      const policy = await PolicyService.publishPolicy(id, userId, changeSummary);

      res.status(200).json({
        success: true,
        data: policy,
        message: `Policy ${policy.policyNumber} published successfully (${policy.currentVersionNumber})`,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/policies/:id/new-revision
   */
  static async createNewRevision(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || 'usr_policy_editor';
      const { reason } = req.body;

      const policy = await PolicyService.createNewRevision(id, userId, reason || 'Scheduled revision');

      res.status(200).json({
        success: true,
        data: policy,
        message: `New draft revision ${policy.currentVersionNumber} initiated`,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/policies/:id/acknowledge
   */
  static async recordAcknowledgment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || 'usr_employee';
      const { employeeName, employeeEmail, department } = req.body;

      const ack = await PolicyService.recordAcknowledgment({
        policyId: id,
        employeeUserId: userId,
        employeeName: employeeName || 'Employee',
        employeeEmail: employeeEmail || 'employee@company.com',
        department,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        data: ack,
        message: `Policy successfully acknowledged for version ${ack.acknowledgedVersionNumber}`,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/policies/:id/acknowledgments
   */
  static async getAcknowledgments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const metrics = await PolicyService.getAcknowledgmentMetrics(id);
      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/policies/:id/versions
   */
  static async getVersionHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const history = await PolicyService.getVersionHistory(id);
      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/policies/:id/archive
   */
  static async archivePolicy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || 'usr_policy_admin';
      const { reason } = req.body;

      const policy = await PolicyService.archivePolicy(id, userId, reason);

      res.status(200).json({
        success: true,
        data: policy,
        message: 'Policy archived successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/policies/ai-assist
   */
  static async aiAssist(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PolicyAiService.assistPolicy(req.body);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
