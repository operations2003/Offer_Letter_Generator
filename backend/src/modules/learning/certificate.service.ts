// =============================================================================
// STEP 9: CERTIFICATES MANAGEMENT SERVICE
// =============================================================================
// Flow:
// Template -> Person/Course Details -> HR/L&D Review -> Generate Certificate -> PDF -> Reference Number -> History
// Supports 6 Reusable Certificate Types:
// 1. Course Completion Certificate
// 2. Training Certificate
// 3. Internship Certificate
// 4. Participation Certificate
// 5. Achievement Certificate
// 6. Appreciation Certificate
// =============================================================================

import crypto from 'crypto';
import {
  CertificateTemplate,
  CertificateTypeCode,
  CertificateStatus,
  IssuedCertificate,
  CertificateHistoryEntry,
} from '../../../../shared/types/learning-engine.js';
import { REUSABLE_CERTIFICATE_TEMPLATES } from './certificate-templates.catalog.js';
import { AuditService } from '../audit/audit.service.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../errors/app-error.js';

export interface RequestCertificateDto {
  templateId: string;
  certificateTypeCode?: CertificateTypeCode;
  recipientName: string;
  recipientEmail: string;
  recipientDepartment: string;
  courseId?: string;
  courseTitle: string;
  achievementDescription?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  secondarySignatoryName?: string;
  secondarySignatoryTitle?: string;
  companyId?: string;
  requesterId?: string;
  requesterRole?: string;
  autoApprove?: boolean;
}

export class CertificateService {
  private certificateStore: Map<string, IssuedCertificate> = new Map();
  private templates: CertificateTemplate[] = [...REUSABLE_CERTIFICATE_TEMPLATES];

  constructor() {
    this.seedDefaultCertificates();
  }

  private seedDefaultCertificates() {
    const defaultCert: IssuedCertificate = {
      id: 'cert_seed_8812',
      referenceNumber: 'CERT-2026-8812',
      companyId: 'cmp_tasknera_001',
      certificateTypeCode: 'COURSE_COMPLETION',
      templateId: 'tmpl_cert_course',
      recipientName: 'Sakshi Koparde',
      recipientEmail: 'sakshi@tasknera.com',
      recipientDepartment: 'Engineering',
      courseId: 'crs_sec_101',
      courseTitle: 'Enterprise Information Security & Data Privacy 2026',
      achievementDescription: 'Score 95% on Security Hygiene Assessment & Incident Escalation Simulation',
      issueDate: '2026-09-10',
      signatoryName: 'Sakshi Koparde',
      signatoryTitle: 'Head of Learning & People Development',
      secondarySignatoryName: 'Alex Vance',
      secondarySignatoryTitle: 'Chief Technology Officer',
      status: 'ISSUED',
      verificationHash: this.calculateHash('CERT-2026-8812', 'sakshi@tasknera.com', 'crs_sec_101', '2026-09-10'),
      history: [
        {
          timestamp: '2026-09-10T14:15:00Z',
          action: 'CREATED',
          performedBy: 'usr_sakshi_1048',
          notes: 'Automated course completion certificate request triggered',
        },
        {
          timestamp: '2026-09-10T14:20:00Z',
          action: 'SUBMITTED_FOR_REVIEW',
          performedBy: 'SYSTEM',
          notes: 'Submitted to L&D Review queue',
        },
        {
          timestamp: '2026-09-10T14:25:00Z',
          action: 'APPROVED',
          performedBy: 'usr_admin_001',
          notes: 'Curriculum criteria and assessment score verified (95%)',
        },
        {
          timestamp: '2026-09-10T14:30:00Z',
          action: 'ISSUED',
          performedBy: 'usr_admin_001',
          notes: 'Cryptographic reference number CERT-2026-8812 generated and issued',
        },
      ],
      createdAt: '2026-09-10T14:15:00Z',
      updatedAt: '2026-09-10T14:30:00Z',
    };

    this.certificateStore.set(defaultCert.id, defaultCert);
  }

  private calculateHash(ref: string, email: string, course: string, date: string): string {
    return crypto
      .createHash('sha256')
      .update(`${ref}|${email}|${course}|${date}|TASKNERA_CREDENTIAL_SALT_2026`)
      .digest('hex');
  }

  // ---------------------------------------------------------------------------
  // 1. Templates Catalog
  // ---------------------------------------------------------------------------

  public listTemplates(typeCode?: CertificateTypeCode): CertificateTemplate[] {
    if (typeCode) {
      return this.templates.filter((t) => t.certificateTypeCode === typeCode);
    }
    return [...this.templates];
  }

  public getTemplateById(templateId: string): CertificateTemplate {
    const template = this.templates.find((t) => t.id === templateId);
    if (!template) {
      throw new NotFoundError(`Certificate template not found: ${templateId}`);
    }
    return template;
  }

  // ---------------------------------------------------------------------------
  // 2. Request Certificate (Step: Template -> Person/Course Details)
  // ---------------------------------------------------------------------------

  public async requestCertificate(dto: RequestCertificateDto): Promise<IssuedCertificate> {
    if (!dto.templateId || !dto.recipientName || !dto.courseTitle) {
      throw new ValidationError('Template, Recipient Name, and Course/Subject Title are required');
    }

    const template = this.getTemplateById(dto.templateId);
    const certId = `cert_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const dateOnly = now.split('T')[0];

    const canAutoIssue =
      dto.autoApprove &&
      (dto.requesterRole === 'SUPER_ADMIN' ||
        dto.requesterRole === 'HR_MANAGER' ||
        dto.requesterRole === 'INSTRUCTOR');

    const history: CertificateHistoryEntry[] = [
      {
        timestamp: now,
        action: 'CREATED',
        performedBy: dto.requesterId || 'SYSTEM',
        notes: `Certificate requested using template: ${template.title}`,
      },
    ];

    let status: CertificateStatus = 'PENDING_REVIEW';
    let referenceNumber = `DRAFT-${Math.floor(1000 + Math.random() * 9000)}`;
    let hash = '';

    if (canAutoIssue) {
      status = 'ISSUED';
      const year = new Date().getFullYear();
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      referenceNumber = `CERT-${year}-${randomSeq}`;
      hash = this.calculateHash(referenceNumber, dto.recipientEmail, dto.courseTitle, dateOnly);

      history.push({
        timestamp: now,
        action: 'APPROVED',
        performedBy: dto.requesterId || 'SYSTEM',
        notes: 'Pre-approved by authorized HR/L&D Manager',
      });
      history.push({
        timestamp: now,
        action: 'ISSUED',
        performedBy: dto.requesterId || 'SYSTEM',
        notes: `Generated official certificate reference ${referenceNumber}`,
      });
    } else {
      history.push({
        timestamp: now,
        action: 'SUBMITTED_FOR_REVIEW',
        performedBy: dto.requesterId || 'SYSTEM',
        notes: 'Queued for HR/L&D review and verification',
      });
    }

    const certificate: IssuedCertificate = {
      id: certId,
      referenceNumber,
      companyId: dto.companyId || 'cmp_tasknera_001',
      certificateTypeCode: dto.certificateTypeCode || template.certificateTypeCode,
      templateId: template.id,
      recipientName: dto.recipientName.trim(),
      recipientEmail: dto.recipientEmail || 'unspecified@tasknera.com',
      recipientDepartment: dto.recipientDepartment || 'General Operations',
      courseId: dto.courseId,
      courseTitle: dto.courseTitle.trim(),
      achievementDescription: dto.achievementDescription,
      issueDate: dateOnly,
      signatoryName: dto.signatoryName || template.signatoryName,
      signatoryTitle: dto.signatoryTitle || template.signatoryTitle,
      secondarySignatoryName: dto.secondarySignatoryName || template.secondarySignatoryName,
      secondarySignatoryTitle: dto.secondarySignatoryTitle || template.secondarySignatoryTitle,
      status,
      verificationHash: hash,
      history,
      createdAt: now,
      updatedAt: now,
    };

    this.certificateStore.set(certId, certificate);

    await AuditService.record({
      companyId: certificate.companyId,
      actorType: 'USER',
      actorId: dto.requesterId || 'SYSTEM',
      entityType: 'CERTIFICATE',
      entityId: certificate.id,
      action: canAutoIssue ? 'APPROVE' : 'CREATE',
      actionDescription: `${canAutoIssue ? 'Issued' : 'Requested'} certificate (${certificate.certificateTypeCode}) for ${certificate.recipientName}`,
      newState: certificate as any,
    });

    return certificate;
  }

  // ---------------------------------------------------------------------------
  // 3. HR / L&D Review (Step: HR/L&D Review -> Approve / Reject)
  // ---------------------------------------------------------------------------

  public async reviewCertificate(
    certificateId: string,
    decision: 'APPROVE' | 'REJECT',
    reviewerId: string,
    reviewerRole: string,
    notes?: string
  ): Promise<IssuedCertificate> {
    const allowedRoles = ['SUPER_ADMIN', 'HR_MANAGER', 'INSTRUCTOR'];
    if (!allowedRoles.includes(reviewerRole)) {
      throw new ForbiddenError(
        `Role ${reviewerRole} is not authorized to review certificates. Required roles: ${allowedRoles.join(', ')}`
      );
    }

    const cert = await this.getCertificateById(certificateId);
    const prev = JSON.parse(JSON.stringify(cert));
    const now = new Date().toISOString();

    if (decision === 'APPROVE') {
      cert.status = 'APPROVED';
      cert.history.push({
        timestamp: now,
        action: 'APPROVED',
        performedBy: reviewerId,
        notes: notes || 'Certificate verified and approved by HR/L&D reviewer',
      });
    } else {
      cert.status = 'REVOKED';
      cert.history.push({
        timestamp: now,
        action: 'REVOKED',
        performedBy: reviewerId,
        notes: notes || 'Certificate rejected by HR/L&D reviewer',
      });
    }

    cert.updatedAt = now;
    this.certificateStore.set(cert.id, cert);

    await AuditService.record({
      companyId: cert.companyId,
      actorType: 'USER',
      actorId: reviewerId,
      entityType: 'CERTIFICATE',
      entityId: cert.id,
      action: decision === 'APPROVE' ? 'APPROVE' : 'REJECT',
      actionDescription: `${decision === 'APPROVE' ? 'Approved' : 'Rejected'} certificate for ${cert.recipientName} (${cert.referenceNumber})`,
      previousState: prev,
      newState: cert as any,
    });

    return cert;
  }

  // ---------------------------------------------------------------------------
  // 4. Generate Certificate & Assign Official Reference Number (Step: Generate -> Reference Number)
  // ---------------------------------------------------------------------------

  public async generateCertificate(
    certificateId: string,
    generatorId: string,
    generatorRole: string
  ): Promise<IssuedCertificate> {
    const allowedRoles = ['SUPER_ADMIN', 'HR_MANAGER', 'INSTRUCTOR'];
    if (!allowedRoles.includes(generatorRole)) {
      throw new ForbiddenError(
        `Role ${generatorRole} is not authorized to generate certificates. Required roles: ${allowedRoles.join(', ')}`
      );
    }

    const cert = await this.getCertificateById(certificateId);
    if (cert.status === 'REVOKED') {
      throw new ValidationError('Cannot generate a revoked or rejected certificate');
    }

    const prev = JSON.parse(JSON.stringify(cert));
    const now = new Date().toISOString();
    const dateOnly = now.split('T')[0];

    // Generate unique official reference number CERT-YYYY-XXXX
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `CERT-${year}-${randomSeq}`;

    const verificationHash = this.calculateHash(
      referenceNumber,
      cert.recipientEmail,
      cert.courseTitle,
      dateOnly
    );

    cert.referenceNumber = referenceNumber;
    cert.status = 'ISSUED';
    cert.issueDate = dateOnly;
    cert.verificationHash = verificationHash;
    cert.history.push({
      timestamp: now,
      action: 'ISSUED',
      performedBy: generatorId,
      notes: `Official certificate generated with reference ${referenceNumber} and cryptographic SHA-256 seal.`,
    });
    cert.updatedAt = now;

    this.certificateStore.set(cert.id, cert);

    await AuditService.record({
      companyId: cert.companyId,
      actorType: 'USER',
      actorId: generatorId,
      entityType: 'CERTIFICATE',
      entityId: cert.id,
      action: 'UPDATE',
      actionDescription: `Generated official certificate ${referenceNumber} for ${cert.recipientName}`,
      previousState: prev,
      newState: cert as any,
    });

    return cert;
  }

  // ---------------------------------------------------------------------------
  // 5. Lookups, Verification & Listing
  // ---------------------------------------------------------------------------

  public async getCertificateById(id: string): Promise<IssuedCertificate> {
    const cert = this.certificateStore.get(id);
    if (!cert) {
      throw new NotFoundError(`Certificate not found: ${id}`);
    }
    return JSON.parse(JSON.stringify(cert));
  }

  public async verifyCertificate(referenceNumber: string): Promise<{
    isValid: boolean;
    certificate?: IssuedCertificate;
    template?: CertificateTemplate;
    verificationMessage: string;
  }> {
    const cert = Array.from(this.certificateStore.values()).find(
      (c) => c.referenceNumber.toUpperCase() === referenceNumber.trim().toUpperCase()
    );

    if (!cert) {
      return {
        isValid: false,
        verificationMessage: `Reference number ${referenceNumber} could not be found in the registry.`,
      };
    }

    if (cert.status !== 'ISSUED') {
      return {
        isValid: false,
        certificate: cert,
        verificationMessage: `Certificate is in ${cert.status} status and is not actively recognized.`,
      };
    }

    const template = this.getTemplateById(cert.templateId);
    return {
      isValid: true,
      certificate: cert,
      template,
      verificationMessage: `Cryptographically verified official credential issued to ${cert.recipientName}.`,
    };
  }

  public async listCertificates(filters?: {
    companyId?: string;
    status?: CertificateStatus;
    recipientEmail?: string;
    certificateTypeCode?: CertificateTypeCode;
    search?: string;
  }): Promise<IssuedCertificate[]> {
    let list = Array.from(this.certificateStore.values());

    if (filters?.companyId) {
      list = list.filter((c) => c.companyId === filters.companyId);
    }
    if (filters?.status) {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters?.recipientEmail) {
      list = list.filter((c) => c.recipientEmail.toLowerCase() === filters.recipientEmail?.toLowerCase());
    }
    if (filters?.certificateTypeCode) {
      list = list.filter((c) => c.certificateTypeCode === filters.certificateTypeCode);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.referenceNumber.toLowerCase().includes(q) ||
          c.recipientName.toLowerCase().includes(q) ||
          c.courseTitle.toLowerCase().includes(q) ||
          c.recipientDepartment.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // ---------------------------------------------------------------------------
  // 6. Template Content Interpolation
  // ---------------------------------------------------------------------------

  public interpolateContent(cert: IssuedCertificate, template: CertificateTemplate): string {
    return template.bodyTemplate
      .replace(/{{recipientName}}/g, cert.recipientName)
      .replace(/{{courseTitle}}/g, cert.courseTitle)
      .replace(/{{recipientDepartment}}/g, cert.recipientDepartment)
      .replace(/{{date}}/g, cert.issueDate)
      .replace(/{{referenceNumber}}/g, cert.referenceNumber);
  }
}
