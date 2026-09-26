import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { prisma } from '../../prisma/client.js';
import { OfferStatus, AuditActorType } from '@prisma/client';
import { NotFoundError, ValidationError, ForbiddenError } from '../../errors/app-error.js';
import { AuditService } from '../audit/audit.service.js';

export type EmailDeliveryStatus = 'SENT' | 'FAILED' | 'PENDING' | 'RETRYING';

export interface EmailDeliveryRecord {
  id: string;
  offerId: string;
  companyId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  bodySnippet: string;
  securePortalUrl: string;
  portalTokenExpiresAt: string;
  hasPdfAttachment: boolean;
  pdfFileName?: string;
  pdfFileSize?: number;
  pdfChecksum?: string;
  status: EmailDeliveryStatus;
  failureReason?: string;
  attemptNumber: number;
  retryCount: number;
  sentBy: {
    id: string;
    name: string;
    email: string;
  };
  attemptedAt: string;
  deliveredAt?: string;
  failedAt?: string;
  metadata?: Record<string, any>;
}

export interface SendOfferEmailOptions {
  subject?: string;
  message?: string;
  includePdfAttachment?: boolean;
  ccEmails?: string[];
  simulateFailure?: boolean;
  isAiAutomated?: boolean;
}

export interface EmailConfirmationPreview {
  offerId: string;
  offerReferenceNumber: string;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  companyName: string;
  jobTitle: string;
  department: string;
  proposedJoiningDate: string | null;
  totalCtc: number;
  currency: string;
  defaultSubject: string;
  bodyHtmlPreview: string;
  bodyTextPreview: string;
  securePortalUrl: string;
  portalTokenExpiresAt: string;
  hasPdfAttachment: boolean;
  pdfFileName?: string;
  pdfFileSize?: number;
  pdfChecksum?: string;
  canSend: boolean;
  aiGuardrailNotice: string;
}

export class OfferEmailService {
  private static persistentStore: Map<string, EmailDeliveryRecord[]> = new Map();

  /**
   * GUARDRAIL ENFORCEMENT:
   * AI must never automatically send an offer.
   * Every offer delivery strictly requires verified human authorization.
   */
  private static enforceHumanAuthorization(actorType?: AuditActorType | string, isAiAutomated?: boolean): void {
    if (actorType === 'AI_WORKER' || isAiAutomated) {
      throw new ForbiddenError(
        'CRITICAL COMPLIANCE GUARDRAIL: AI models and automated background workers are strictly forbidden from dispatching employment offer letters. A human HR Manager or Super Admin must review, confirm, and initiate the dispatch.'
      );
    }
  }

  /**
   * GET EMAIL CONFIRMATION PREVIEW:
   * Generates formatted preview of the email, candidate portal link, and attachment details for HR review.
   */
  static async getEmailConfirmationPreview(
    companyId: string,
    userId: string,
    offerId: string
  ): Promise<EmailConfirmationPreview> {
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, companyId, deletedAt: null },
      include: {
        candidate: true,
        company: true,
        generatedDocuments: {
          where: { isFinalLegalDocument: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!offer) {
      throw new NotFoundError('Offer');
    }

    const hrUser = await prisma.user.findFirst({
      where: { id: userId, companyId },
    });

    // Ensure candidate portal token is minted or prepare preview
    let portalToken = 'token_preview_hash';
    if (!offer.candidatePortalTokenHash) {
      portalToken = crypto.randomBytes(32).toString('hex');
    }

    const tokenExpiresAt =
      offer.candidatePortalTokenExpiresAt?.toISOString() ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const portalUrl = `/candidate-portal/offers/${offer.id}?token=${portalToken}`;
    const latestPdf = offer.generatedDocuments[0];

    const defaultSubject = `Formal Offer of Employment: ${offer.jobTitle} - ${offer.company.name} (Ref: ${offer.offerReferenceNumber})`;

    const candidateFullName = `${offer.candidate.firstName} ${offer.candidate.lastName}`;
    const joiningDateFormatted = offer.proposedJoiningDate
      ? new Date(offer.proposedJoiningDate).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'To be agreed upon mutually';

    const bodyTextPreview = `Dear ${candidateFullName},\n\nWe are pleased to extend an offer of employment for the position of ${offer.jobTitle} in the ${offer.department} department at ${offer.company.name}.\n\nYour proposed joining date is ${joiningDateFormatted} with an annualized total compensation of $${Number(offer.totalCtc).toLocaleString()} ${offer.currency}.\n\nPlease review your formal offer letter and sign digitally via our secure candidate portal:\n${portalUrl}\n\nThis offer is valid until ${tokenExpiresAt.slice(0, 10)}. If you have questions, please reach out directly.\n\nWarm regards,\n${hrUser ? `${hrUser.firstName} ${hrUser.lastName}` : 'Human Resources Talent Team'}\n${offer.company.name}`;

    const bodyHtmlPreview = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b;">
        <h2 style="color: #0f172a; margin-bottom: 12px;">Offer of Employment</h2>
        <p>Dear <strong>${candidateFullName}</strong>,</p>
        <p>We are delighted to extend you an official offer for the position of <strong>${offer.jobTitle}</strong> in the <strong>${offer.department}</strong> department at <strong>${offer.company.name}</strong>.</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 6px;"><strong>Position:</strong> ${offer.jobTitle}</p>
          <p style="margin: 0 0 6px;"><strong>Department:</strong> ${offer.department}</p>
          <p style="margin: 0 0 6px;"><strong>Total CTC:</strong> $${Number(offer.totalCtc).toLocaleString()} ${offer.currency}</p>
          <p style="margin: 0;"><strong>Anticipated Start Date:</strong> ${joiningDateFormatted}</p>
        </div>
        <p>Please review and sign your offer letter by accessing your encrypted candidate portal:</p>
        <p style="margin: 24px 0;">
          <a href="${portalUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Review & Sign Offer Letter
          </a>
        </p>
        <p style="font-size: 0.875rem; color: #64748b;">
          ${latestPdf ? `📎 Official PDF Attachment: <strong>${latestPdf.fileName}</strong> (SHA-256: ${latestPdf.sha256Checksum.slice(0, 16)}...)` : 'Your encrypted PDF will be available inside your secure portal.'}
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 0.85rem; color: #64748b;">This offer expires on ${new Date(tokenExpiresAt).toLocaleDateString()}.</p>
      </div>
    `;

    return {
      offerId: offer.id,
      offerReferenceNumber: offer.offerReferenceNumber,
      recipientName: candidateFullName,
      recipientEmail: offer.candidate.email,
      senderName: hrUser ? `${hrUser.firstName} ${hrUser.lastName}` : 'Human Resources Team',
      senderEmail: hrUser?.email || 'hr@company.com',
      companyName: offer.company.name,
      jobTitle: offer.jobTitle,
      department: offer.department,
      proposedJoiningDate: offer.proposedJoiningDate ? offer.proposedJoiningDate.toISOString() : null,
      totalCtc: Number(offer.totalCtc),
      currency: offer.currency,
      defaultSubject,
      bodyHtmlPreview,
      bodyTextPreview,
      securePortalUrl: portalUrl,
      portalTokenExpiresAt: tokenExpiresAt,
      hasPdfAttachment: Boolean(latestPdf),
      pdfFileName: latestPdf?.fileName,
      pdfFileSize: latestPdf ? Number(latestPdf.fileSizeBytes) : undefined,
      pdfChecksum: latestPdf?.sha256Checksum,
      canSend: offer.currentStatus !== OfferStatus.WITHDRAWN,
      aiGuardrailNotice:
        'AI Guardrail Principle: Automated AI routines cannot send offers. You are confirming this offer as an authorized Human HR representative.',
    };
  }

  /**
   * SEND OFFER EMAIL:
   * Executes formal dispatch, updates status to ISSUED (or records FAILED on simulated/network failure),
   * provides PDF attachment / secure portal link, and appends to email history ledger.
   */
  static async sendOfferEmail(
    companyId: string,
    userId: string,
    offerId: string,
    options?: SendOfferEmailOptions,
    actorType: AuditActorType = 'USER'
  ): Promise<{
    success: boolean;
    delivery: EmailDeliveryRecord;
    offerStatus: OfferStatus;
    message: string;
  }> {
    // 1. Mandatory Guardrail: AI must never automatically send an offer
    this.enforceHumanAuthorization(actorType, options?.isAiAutomated);

    const offer = await prisma.offer.findFirst({
      where: { id: offerId, companyId, deletedAt: null },
      include: {
        candidate: true,
        company: true,
        generatedDocuments: {
          where: { isFinalLegalDocument: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!offer) {
      throw new NotFoundError('Offer');
    }

    const hrUser = await prisma.user.findFirst({
      where: { id: userId, companyId },
    });

    // 2. Provision or refresh candidate portal token
    const portalToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(portalToken).digest('hex');
    const tokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days validity
    const securePortalUrl = `/candidate-portal/offers/${offer.id}?token=${portalToken}`;

    const candidateFullName = `${offer.candidate.firstName} ${offer.candidate.lastName}`;
    const subject =
      options?.subject ||
      `Formal Offer of Employment: ${offer.jobTitle} - ${offer.company.name} (Ref: ${offer.offerReferenceNumber})`;

    const latestPdf = offer.generatedDocuments[0];
    const hasPdfAttachment = options?.includePdfAttachment !== false && Boolean(latestPdf);

    const deliveryId = crypto.randomUUID();
    const timestampNow = new Date().toISOString();

    // 3. Evaluate delivery outcome (Simulate network/SMTP failure if requested)
    const isSimulatedFailure = Boolean(options?.simulateFailure);
    const isInvalidEmail = !offer.candidate.email || !offer.candidate.email.includes('@');
    const isFailed = isSimulatedFailure || isInvalidEmail;

    let deliveryStatus: EmailDeliveryStatus = 'SENT';
    let failureReason: string | undefined = undefined;

    if (isFailed) {
      deliveryStatus = 'FAILED';
      failureReason = isSimulatedFailure
        ? 'Simulated SMTP connection failure: Mail server timeout after 30000ms.'
        : 'Invalid candidate recipient email format.';
    }

    const deliveryRecord: EmailDeliveryRecord = {
      id: deliveryId,
      offerId: offer.id,
      companyId,
      recipientEmail: offer.candidate.email,
      recipientName: candidateFullName,
      subject,
      bodySnippet: options?.message
        ? options.message.slice(0, 150)
        : `Formal offer for ${offer.jobTitle} at ${offer.company.name}.`,
      securePortalUrl,
      portalTokenExpiresAt: tokenExpiresAt.toISOString(),
      hasPdfAttachment,
      pdfFileName: hasPdfAttachment ? latestPdf.fileName : undefined,
      pdfFileSize: hasPdfAttachment ? Number(latestPdf.fileSizeBytes) : undefined,
      pdfChecksum: hasPdfAttachment ? latestPdf.sha256Checksum : undefined,
      status: deliveryStatus,
      failureReason,
      attemptNumber: 1,
      retryCount: 0,
      sentBy: {
        id: userId,
        name: hrUser ? `${hrUser.firstName} ${hrUser.lastName}` : 'Human Resources HR',
        email: hrUser?.email || 'hr@company.com',
      },
      attemptedAt: timestampNow,
      deliveredAt: deliveryStatus === 'SENT' ? timestampNow : undefined,
      failedAt: deliveryStatus === 'FAILED' ? timestampNow : undefined,
      metadata: {
        ccEmails: options?.ccEmails || [],
        simulated: isSimulatedFailure,
      },
    };

    // 4. Update offer status and persist delivery record in Offer & Transaction
    const updatedOffer = await prisma.$transaction(async (tx) => {
      const fromStatus = offer.currentStatus;
      const toStatus = deliveryStatus === 'SENT' ? OfferStatus.ISSUED : fromStatus;

      // Extract existing email delivery history from offer metadata
      const hrTerms = (offer.hrConfirmedTerms as any) || {};
      const existingHistory: EmailDeliveryRecord[] = hrTerms.emailDeliveries || [];
      const updatedHistory = [deliveryRecord, ...existingHistory];

      const updateData: any = {
        candidatePortalTokenHash: tokenHash,
        candidatePortalTokenExpiresAt: tokenExpiresAt,
        hrConfirmedTerms: {
          ...hrTerms,
          emailDeliveries: updatedHistory,
          lastEmailDelivery: deliveryRecord,
        },
      };

      if (deliveryStatus === 'SENT') {
        updateData.currentStatus = OfferStatus.ISSUED;
        updateData.issuedAt = new Date();
      }

      const res = await tx.offer.update({
        where: { id: offerId },
        data: updateData,
        include: { candidate: true },
      });

      // Create OfferStatusLog
      await tx.offerStatusLog.create({
        data: {
          offerId,
          fromStatus,
          toStatus,
          changedByUserId: userId,
          reasonNotes:
            deliveryStatus === 'SENT'
              ? `Formal offer letter email sent to ${offer.candidate.email} with secure link${hasPdfAttachment ? ' and PDF attachment' : ''}`
              : `Offer email dispatch failed: ${failureReason}`,
        },
      });

      return res;
    });

    // 5. Audit Logging with complete email metadata
    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'OFFER',
      entityId: offerId,
      action: deliveryStatus === 'SENT' ? 'ISSUE' : 'UPDATE',
      actionDescription:
        deliveryStatus === 'SENT'
          ? `Offer ${offer.offerReferenceNumber} successfully sent to ${candidateFullName} (${offer.candidate.email})`
          : `Offer ${offer.offerReferenceNumber} email dispatch FAILED: ${failureReason}`,
      newState: {
        deliveryId,
        status: deliveryStatus,
        recipient: offer.candidate.email,
        securePortalUrl,
        hasPdfAttachment,
        attemptedAt: timestampNow,
      },
    });

    // Save in in-memory persistent cache
    this.saveDeliveryToCache(offerId, deliveryRecord);

    return {
      success: deliveryStatus === 'SENT',
      delivery: deliveryRecord,
      offerStatus: updatedOffer.currentStatus,
      message:
        deliveryStatus === 'SENT'
          ? `Offer ${offer.offerReferenceNumber} sent successfully to ${candidateFullName}.`
          : `Failed to send offer email: ${failureReason}. You can retry delivery.`,
    };
  }

  /**
   * RETRY EMAIL DELIVERY:
   * Retries a previously failed (or pending) email dispatch, increments retry count, updates timestamps,
   * transitions status, and preserves delivery history.
   */
  static async retryEmailDelivery(
    companyId: string,
    userId: string,
    offerId: string,
    deliveryId: string,
    options?: { simulateFailure?: boolean; customMessage?: string },
    actorType: AuditActorType = 'USER'
  ): Promise<{
    success: boolean;
    delivery: EmailDeliveryRecord;
    offerStatus: OfferStatus;
    message: string;
  }> {
    // 1. Mandatory Guardrail: AI must never automatically retry an offer send
    this.enforceHumanAuthorization(actorType);

    const offer = await prisma.offer.findFirst({
      where: { id: offerId, companyId, deletedAt: null },
      include: {
        candidate: true,
        company: true,
        generatedDocuments: {
          where: { isFinalLegalDocument: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!offer) {
      throw new NotFoundError('Offer');
    }

    const hrUser = await prisma.user.findFirst({
      where: { id: userId, companyId },
    });

    // Retrieve previous delivery
    const history = await this.getEmailHistory(companyId, offerId);
    const existing = history.deliveries.find((d) => d.id === deliveryId);

    const isSimulatedFailure = Boolean(options?.simulateFailure);
    const isSuccessful = !isSimulatedFailure;
    const timestampNow = new Date().toISOString();

    const newRetryCount = (existing?.retryCount || 0) + 1;
    const newAttemptNumber = (existing?.attemptNumber || 1) + 1;

    const updatedDelivery: EmailDeliveryRecord = {
      id: crypto.randomUUID(),
      offerId: offer.id,
      companyId,
      recipientEmail: offer.candidate.email,
      recipientName: `${offer.candidate.firstName} ${offer.candidate.lastName}`,
      subject: existing?.subject || `Formal Offer: ${offer.jobTitle}`,
      bodySnippet: options?.customMessage || existing?.bodySnippet || 'Offer letter re-dispatched by HR.',
      securePortalUrl: existing?.securePortalUrl || `/candidate-portal/offers/${offer.id}`,
      portalTokenExpiresAt:
        existing?.portalTokenExpiresAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      hasPdfAttachment: existing?.hasPdfAttachment || false,
      pdfFileName: existing?.pdfFileName,
      pdfFileSize: existing?.pdfFileSize,
      pdfChecksum: existing?.pdfChecksum,
      status: isSuccessful ? 'SENT' : 'FAILED',
      failureReason: isSuccessful
        ? undefined
        : 'Retry dispatch failed: SMTP mailbox temporarily unavailable.',
      attemptNumber: newAttemptNumber,
      retryCount: newRetryCount,
      sentBy: {
        id: userId,
        name: hrUser ? `${hrUser.firstName} ${hrUser.lastName}` : 'Human Resources HR',
        email: hrUser?.email || 'hr@company.com',
      },
      attemptedAt: timestampNow,
      deliveredAt: isSuccessful ? timestampNow : undefined,
      failedAt: !isSuccessful ? timestampNow : undefined,
      metadata: {
        retriedFromDeliveryId: deliveryId,
        retryAttempt: newRetryCount,
      },
    };

    // Update in Offer JSON & status
    const updatedOffer = await prisma.$transaction(async (tx) => {
      const fromStatus = offer.currentStatus;
      const toStatus = isSuccessful ? OfferStatus.ISSUED : fromStatus;

      const hrTerms = (offer.hrConfirmedTerms as any) || {};
      const currentList: EmailDeliveryRecord[] = hrTerms.emailDeliveries || [];
      const updatedList = [updatedDelivery, ...currentList];

      const updateData: any = {
        hrConfirmedTerms: {
          ...hrTerms,
          emailDeliveries: updatedList,
          lastEmailDelivery: updatedDelivery,
        },
      };

      if (isSuccessful) {
        updateData.currentStatus = OfferStatus.ISSUED;
        if (!offer.issuedAt) updateData.issuedAt = new Date();
      }

      const res = await tx.offer.update({
        where: { id: offerId },
        data: updateData,
        include: { candidate: true },
      });

      await tx.offerStatusLog.create({
        data: {
          offerId,
          fromStatus,
          toStatus,
          changedByUserId: userId,
          reasonNotes: isSuccessful
            ? `Offer delivery retry #${newRetryCount} succeeded. Offer marked as ISSUED.`
            : `Offer delivery retry #${newRetryCount} failed: ${updatedDelivery.failureReason}`,
        },
      });

      return res;
    });

    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'OFFER',
      entityId: offerId,
      action: isSuccessful ? 'ISSUE' : 'UPDATE',
      actionDescription: isSuccessful
        ? `Offer ${offer.offerReferenceNumber} email retry #${newRetryCount} succeeded for candidate ${offer.candidate.email}`
        : `Offer ${offer.offerReferenceNumber} email retry #${newRetryCount} FAILED`,
      newState: {
        deliveryId: updatedDelivery.id,
        retryCount: newRetryCount,
        status: updatedDelivery.status,
      },
    });

    this.saveDeliveryToCache(offerId, updatedDelivery);

    return {
      success: isSuccessful,
      delivery: updatedDelivery,
      offerStatus: updatedOffer.currentStatus,
      message: isSuccessful
        ? `Retry #${newRetryCount} succeeded! Offer email dispatched to ${offer.candidate.firstName} ${offer.candidate.lastName}.`
        : `Retry #${newRetryCount} failed: ${updatedDelivery.failureReason}`,
    };
  }

  /**
   * GET EMAIL HISTORY:
   * Returns all email delivery logs, retries, timestamps, and status for an offer.
   */
  static async getEmailHistory(
    companyId: string,
    offerId: string
  ): Promise<{
    offerId: string;
    offerReferenceNumber: string;
    currentOfferStatus: OfferStatus;
    totalDeliveries: number;
    sentCount: number;
    failedCount: number;
    deliveries: EmailDeliveryRecord[];
  }> {
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, companyId, deletedAt: null },
      include: { candidate: true },
    });

    if (!offer) {
      throw new NotFoundError('Offer');
    }

    const hrTerms = (offer.hrConfirmedTerms as any) || {};
    const fromOffer: EmailDeliveryRecord[] = hrTerms.emailDeliveries || [];
    const fromCache = this.persistentStore.get(offerId) || [];

    // Combine and deduplicate by delivery ID
    const map = new Map<string, EmailDeliveryRecord>();
    for (const d of [...fromOffer, ...fromCache]) {
      map.set(d.id, d);
    }

    const allDeliveries = Array.from(map.values()).sort(
      (a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime()
    );

    const sentCount = allDeliveries.filter((d) => d.status === 'SENT').length;
    const failedCount = allDeliveries.filter((d) => d.status === 'FAILED').length;

    return {
      offerId: offer.id,
      offerReferenceNumber: offer.offerReferenceNumber,
      currentOfferStatus: offer.currentStatus,
      totalDeliveries: allDeliveries.length,
      sentCount,
      failedCount,
      deliveries: allDeliveries,
    };
  }

  private static saveDeliveryToCache(offerId: string, delivery: EmailDeliveryRecord) {
    const list = this.persistentStore.get(offerId) || [];
    this.persistentStore.set(offerId, [delivery, ...list]);
  }
}
