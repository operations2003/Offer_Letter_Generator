// =============================================================================
// HR POLICY ENGINE: POLICY MANAGEMENT SERVICE
// =============================================================================
// Orchestrates complete Policy lifecycle:
// Draft → AI Assistance → HR Review → Edit → Approval → Publish →
// Employee Acknowledgement → Version History & Archival.
//
// Invariant: Completely separated from individual employee document workflows.
// =============================================================================

import crypto from 'crypto';
import {
  HrPolicy,
  PolicyTypeCode,
  PolicyStatus,
  PolicyApplicability,
  PolicySection,
  PolicyApprovalRecord,
  EmployeeAcknowledgment,
  PolicyVersionSnapshot,
} from '../../../../shared/types/policy-engine.js';
import { POLICY_TYPE_REGISTRY, PolicyRegistry } from './policy.registry.js';
import { AuditService } from '../audit/audit.service.js';
import { AppError, NotFoundError, ValidationError } from '../../errors/app-error.js';

export interface CreatePolicyDto {
  companyId: string;
  policyTypeCode: PolicyTypeCode;
  title: string;
  description?: string;
  department: string;
  policyOwner: string;
  policyOwnerUserId?: string;
  applicability: PolicyApplicability;
  applicabilityScope?: string;
  effectiveDate: string;
  reviewDate?: string;
  initialSections?: PolicySection[];
  createdByUserId: string;
}

export interface UpdatePolicySectionsDto {
  policyId: string;
  sections: PolicySection[];
  updatedByUserId: string;
  changeSummary?: string;
}

export interface RecordPolicyApprovalDto {
  policyId: string;
  approverUserId: string;
  approverName: string;
  approverTitle: string;
  decision: 'APPROVED' | 'REJECTED' | 'REQUESTED_CHANGES';
  notes?: string;
}

export interface RecordAcknowledgmentDto {
  policyId: string;
  employeeUserId: string;
  employeeName: string;
  employeeEmail: string;
  department?: string;
  ipAddress?: string;
}

export class PolicyService {
  private static policiesStore: Map<string, HrPolicy> = new Map();
  private static policyCounters: Map<string, number> = new Map();

  /**
   * Reset store for clean testing environments
   */
  static clearStore(): void {
    this.policiesStore.clear();
    this.policyCounters.clear();
  }

  /**
   * Generates a policy reference number, e.g. POL-LVE-0001, POL-SEC-0001
   */
  private static generatePolicyNumber(typeCode: PolicyTypeCode): string {
    const codeKey = typeCode.replace('_POLICY', '').substring(0, 3).toUpperCase();
    const count = (this.policyCounters.get(typeCode) || 0) + 1;
    this.policyCounters.set(typeCode, count);
    const padded = String(count).padStart(4, '0');
    return `POL-${codeKey}-${padded}`;
  }

  /**
   * 1. CREATE POLICY DRAFT
   */
  static async createPolicy(dto: CreatePolicyDto): Promise<HrPolicy> {
    const typeDef = PolicyRegistry.getByCode(dto.policyTypeCode);
    if (!typeDef) {
      throw new ValidationError(`Unsupported policy type: ${dto.policyTypeCode}`);
    }

    const policyId = crypto.randomUUID();
    const policyNumber = this.generatePolicyNumber(dto.policyTypeCode);
    const now = new Date().toISOString();

    // Compute review date: defaults to 12 months after effective date
    const effDate = new Date(dto.effectiveDate);
    const defaultReview = new Date(effDate);
    defaultReview.setMonth(defaultReview.getMonth() + (typeDef.recommendedReviewFrequencyMonths || 12));
    const reviewDate = dto.reviewDate || defaultReview.toISOString().split('T')[0];

    // Default sections from registry if not provided
    const initialSections = dto.initialSections && dto.initialSections.length > 0
      ? dto.initialSections
      : typeDef.standardSections.map((s, idx) => ({
          id: `sec_${crypto.randomUUID().substring(0, 8)}`,
          sectionNumber: s.sectionNumber,
          title: s.title,
          content: s.sampleGuidance,
          orderIndex: idx + 1,
          isMandatory: s.isMandatory,
        }));

    const newPolicy: HrPolicy = {
      id: policyId,
      companyId: dto.companyId,
      policyTypeCode: dto.policyTypeCode,
      policyNumber,
      title: dto.title || typeDef.name,
      description: dto.description || typeDef.description,
      department: dto.department,
      policyOwner: dto.policyOwner,
      policyOwnerUserId: dto.policyOwnerUserId,
      applicability: dto.applicability || typeDef.defaultApplicability,
      applicabilityScope: dto.applicabilityScope || 'All eligible personnel',
      currentStatus: 'DRAFT',
      currentVersionNumber: 'v1.0',
      effectiveDate: dto.effectiveDate,
      reviewDate,
      sections: initialSections,
      approvalHistory: [],
      acknowledgments: [],
      versionHistory: [],
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.policiesStore.set(policyId, newPolicy);

    await AuditService.record({
      companyId: dto.companyId,
      actorType: 'USER',
      actorId: dto.createdByUserId,
      entityType: 'DOCUMENT',
      entityId: policyId,
      action: 'CREATE',
      actionDescription: `Created draft for policy ${newPolicy.title} (${policyNumber})`,
      newState: { status: 'DRAFT', version: 'v1.0', sectionsCount: initialSections.length },
    });

    return newPolicy;
  }

  /**
   * 2. UPDATE SECTIONS & CONTENT
   */
  static async updateSections(dto: UpdatePolicySectionsDto): Promise<HrPolicy> {
    const policy = this.policiesStore.get(dto.policyId);
    if (!policy || policy.deletedAt) {
      throw new NotFoundError(`Policy with ID ${dto.policyId} not found`);
    }

    if (policy.currentStatus === 'ARCHIVED') {
      throw new ValidationError('Cannot modify an archived policy. Create a new draft revision instead.');
    }

    const now = new Date().toISOString();
    policy.sections = dto.sections;
    policy.updatedAt = now;

    // If currently PUBLISHED, moving to edit triggers IN_REVIEW for revision
    if (policy.currentStatus === 'PUBLISHED') {
      policy.currentStatus = 'IN_REVIEW';
    }

    await AuditService.record({
      companyId: policy.companyId,
      actorType: 'USER',
      actorId: dto.updatedByUserId,
      entityType: 'DOCUMENT',
      entityId: policy.id,
      action: 'UPDATE',
      actionDescription: `Updated sections for ${policy.policyNumber} (${dto.changeSummary || 'Content edit'})`,
      newState: { sectionsCount: dto.sections.length },
    });

    return policy;
  }

  /**
   * 3. SUBMIT FOR HR REVIEW
   */
  static async submitForReview(policyId: string, userId: string, notes?: string): Promise<HrPolicy> {
    const policy = this.policiesStore.get(policyId);
    if (!policy || policy.deletedAt) {
      throw new NotFoundError(`Policy with ID ${policyId} not found`);
    }

    if (policy.sections.length === 0) {
      throw new ValidationError('A policy must contain at least one section before being submitted for review.');
    }

    policy.currentStatus = 'IN_REVIEW';
    policy.updatedAt = new Date().toISOString();

    await AuditService.record({
      companyId: policy.companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'DOCUMENT',
      entityId: policy.id,
      action: 'UPDATE',
      actionDescription: `Submitted policy ${policy.policyNumber} for HR Review: ${notes || 'Ready for review'}`,
      newState: { status: 'IN_REVIEW' },
    });

    return policy;
  }

  /**
   * 4. RECORD APPROVAL DECISION
   */
  static async recordApproval(dto: RecordPolicyApprovalDto): Promise<HrPolicy> {
    const policy = this.policiesStore.get(dto.policyId);
    if (!policy || policy.deletedAt) {
      throw new NotFoundError(`Policy with ID ${dto.policyId} not found`);
    }

    const now = new Date().toISOString();
    const record: PolicyApprovalRecord = {
      id: `appr_${crypto.randomUUID()}`,
      approverUserId: dto.approverUserId,
      approverName: dto.approverName,
      approverTitle: dto.approverTitle,
      decision: dto.decision,
      notes: dto.notes,
      approvedAt: now,
    };

    policy.approvalHistory.push(record);
    policy.updatedAt = now;

    if (dto.decision === 'APPROVED') {
      policy.currentStatus = 'APPROVED';
    } else if (dto.decision === 'REQUESTED_CHANGES') {
      policy.currentStatus = 'DRAFT';
    }

    await AuditService.record({
      companyId: policy.companyId,
      actorType: 'USER',
      actorId: dto.approverUserId,
      entityType: 'DOCUMENT',
      entityId: policy.id,
      action: 'APPROVE',
      actionDescription: `Recorded approval decision "${dto.decision}" for policy ${policy.policyNumber}`,
      newState: { status: policy.currentStatus, decision: dto.decision },
    });

    return policy;
  }

  /**
   * 5. PUBLISH POLICY
   * Makes the policy live, creates an immutable version snapshot, and opens employee acknowledgment.
   */
  static async publishPolicy(policyId: string, publishedByUserId: string, changeSummary?: string): Promise<HrPolicy> {
    const policy = this.policiesStore.get(policyId);
    if (!policy || policy.deletedAt) {
      throw new NotFoundError(`Policy with ID ${policyId} not found`);
    }

    if (policy.currentStatus !== 'APPROVED') {
      throw new ValidationError(`Policy cannot be published from "${policy.currentStatus}" state. Executive approval is mandatory.`);
    }

    const now = new Date().toISOString();

    // Create immutable version snapshot of the current state
    const snapshot: PolicyVersionSnapshot = {
      versionNumber: policy.currentVersionNumber,
      effectiveDate: policy.effectiveDate,
      reviewDate: policy.reviewDate,
      sections: JSON.parse(JSON.stringify(policy.sections)),
      changeSummary: changeSummary || `Official publication of ${policy.currentVersionNumber}`,
      publishedByUserId,
      publishedAt: now,
      approvalHistory: [...policy.approvalHistory],
    };

    policy.versionHistory.push(snapshot);
    policy.currentStatus = 'PUBLISHED';
    policy.publishedAt = now;
    policy.updatedAt = now;

    await AuditService.record({
      companyId: policy.companyId,
      actorType: 'USER',
      actorId: publishedByUserId,
      entityType: 'DOCUMENT',
      entityId: policy.id,
      action: 'ISSUE',
      actionDescription: `Published official policy ${policy.policyNumber} (${policy.currentVersionNumber})`,
      newState: { status: 'PUBLISHED', version: policy.currentVersionNumber },
    });

    return policy;
  }

  /**
   * 6. CREATE NEW REVISION DRAFT (Bumping version e.g. v1.0 -> v2.0)
   */
  static async createNewRevision(policyId: string, userId: string, reason: string): Promise<HrPolicy> {
    const policy = this.policiesStore.get(policyId);
    if (!policy || policy.deletedAt) {
      throw new NotFoundError(`Policy with ID ${policyId} not found`);
    }

    const currentMajor = parseInt(policy.currentVersionNumber.replace('v', '').split('.')[0], 10) || 1;
    const nextVersion = `v${currentMajor + 1}.0`;
    const now = new Date().toISOString();

    policy.currentVersionNumber = nextVersion;
    policy.currentStatus = 'DRAFT';
    policy.updatedAt = now;

    await AuditService.record({
      companyId: policy.companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'DOCUMENT',
      entityId: policy.id,
      action: 'UPDATE',
      actionDescription: `Initiated revision ${nextVersion} for ${policy.policyNumber} (${reason})`,
      newState: { status: 'DRAFT', version: nextVersion },
    });

    return policy;
  }

  /**
   * 7. RECORD EMPLOYEE ACKNOWLEDGMENT
   */
  static async recordAcknowledgment(dto: RecordAcknowledgmentDto): Promise<EmployeeAcknowledgment> {
    const policy = this.policiesStore.get(dto.policyId);
    if (!policy || policy.deletedAt) {
      throw new NotFoundError(`Policy with ID ${dto.policyId} not found`);
    }

    if (policy.currentStatus !== 'PUBLISHED') {
      throw new ValidationError(`Cannot acknowledge policy in "${policy.currentStatus}" status. Policy must be published.`);
    }

    // Check if already acknowledged for current version
    const existing = policy.acknowledgments.find(
      (a) => a.employeeUserId === dto.employeeUserId && a.acknowledgedVersionNumber === policy.currentVersionNumber
    );
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const ack: EmployeeAcknowledgment = {
      id: `ack_${crypto.randomUUID()}`,
      employeeUserId: dto.employeeUserId,
      employeeName: dto.employeeName,
      employeeEmail: dto.employeeEmail,
      department: dto.department,
      acknowledgedVersionNumber: policy.currentVersionNumber,
      acknowledgedAt: now,
      ipAddress: dto.ipAddress,
    };

    policy.acknowledgments.push(ack);
    policy.updatedAt = now;

    await AuditService.record({
      companyId: policy.companyId,
      actorType: 'USER',
      actorId: dto.employeeUserId,
      entityType: 'DOCUMENT',
      entityId: policy.id,
      action: 'APPROVE',
      actionDescription: `Employee ${dto.employeeName} acknowledged policy ${policy.policyNumber} (${policy.currentVersionNumber})`,
      newState: { acknowledgedVersion: policy.currentVersionNumber },
    });

    return ack;
  }

  /**
   * 8. ARCHIVE POLICY
   */
  static async archivePolicy(policyId: string, userId: string, reason?: string): Promise<HrPolicy> {
    const policy = this.policiesStore.get(policyId);
    if (!policy || policy.deletedAt) {
      throw new NotFoundError(`Policy with ID ${policyId} not found`);
    }

    const now = new Date().toISOString();
    policy.currentStatus = 'ARCHIVED';
    policy.isArchived = true;
    policy.updatedAt = now;

    await AuditService.record({
      companyId: policy.companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'DOCUMENT',
      entityId: policy.id,
      action: 'DELETE',
      actionDescription: `Archived policy ${policy.policyNumber}: ${reason || 'Retired from active handbook'}`,
      newState: { status: 'ARCHIVED', isArchived: true },
    });

    return policy;
  }

  /**
   * 9. GET BY ID & QUERIES
   */
  static async getById(policyId: string): Promise<HrPolicy> {
    const policy = this.policiesStore.get(policyId);
    if (!policy || policy.deletedAt) {
      throw new NotFoundError(`Policy with ID ${policyId} not found`);
    }
    return policy;
  }

  static async listPolicies(params?: {
    policyTypeCode?: PolicyTypeCode;
    status?: PolicyStatus;
    department?: string;
    search?: string;
    includeArchived?: boolean;
  }): Promise<HrPolicy[]> {
    let list = Array.from(this.policiesStore.values()).filter((p) => !p.deletedAt);

    if (!params?.includeArchived) {
      list = list.filter((p) => !p.isArchived);
    }
    if (params?.policyTypeCode) {
      list = list.filter((p) => p.policyTypeCode === params.policyTypeCode);
    }
    if (params?.status) {
      list = list.filter((p) => p.currentStatus === params.status);
    }
    if (params?.department) {
      list = list.filter((p) => p.department.toLowerCase() === params.department!.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.policyNumber.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * 10. RETRIEVE VERSION HISTORY
   */
  static async getVersionHistory(policyId: string): Promise<{
    currentVersionNumber: string;
    currentStatus: PolicyStatus;
    versionSnapshots: PolicyVersionSnapshot[];
  }> {
    const policy = this.policiesStore.get(policyId);
    if (!policy || policy.deletedAt) {
      throw new NotFoundError(`Policy with ID ${policyId} not found`);
    }

    return {
      currentVersionNumber: policy.currentVersionNumber,
      currentStatus: policy.currentStatus,
      versionSnapshots: policy.versionHistory,
    };
  }

  /**
   * 11. RETRIEVE ACKNOWLEDGMENT METRICS
   */
  static async getAcknowledgmentMetrics(policyId: string): Promise<{
    totalAcknowledged: number;
    acknowledgedByVersion: Record<string, number>;
    recentAcknowledgments: EmployeeAcknowledgment[];
  }> {
    const policy = this.policiesStore.get(policyId);
    if (!policy || policy.deletedAt) {
      throw new NotFoundError(`Policy with ID ${policyId} not found`);
    }

    const byVersion: Record<string, number> = {};
    for (const ack of policy.acknowledgments) {
      byVersion[ack.acknowledgedVersionNumber] = (byVersion[ack.acknowledgedVersionNumber] || 0) + 1;
    }

    return {
      totalAcknowledged: policy.acknowledgments.length,
      acknowledgedByVersion: byVersion,
      recentAcknowledgments: policy.acknowledgments.slice(-20).reverse(),
    };
  }
}
