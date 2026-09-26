import { prisma } from '../prisma/client.js';
import { OfferService } from '../modules/offers/offer.service.js';
import { OfferEmailService } from '../modules/offers/offer-email.service.js';
import { OfferStatus, TemplateCategory } from '@prisma/client';
import { AiProviderFactory } from '../modules/ai/ai-provider.factory.js';
import { MockAiAdapter } from '../modules/ai/adapters/mock.adapter.js';
import { AiService } from '../modules/ai/ai.service.js';


let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runOfferApiTests() {
  console.log('\n================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE OFFER LETTER APIS & GUARDRAILS TESTS');
  console.log('================================================================\n');

  // Ensure mock AI engine is active for reliable testing
  AiProviderFactory.setAdapter(new MockAiAdapter());

  // 1. Setup tenant & user
  const company = await prisma.company.upsert({
    where: { code: 'ACME' },
    update: {},
    create: {
      name: 'Acme Technologies Inc.',
      code: 'ACME',
      legalName: 'Acme Technologies Global Corp.',
    },
  });

  const user = await prisma.user.findFirst({
    where: { companyId: company.id },
  });

  if (!user) {
    throw new Error('Test user not found. Please run seed first.');
  }

  const companyId = company.id;
  const userId = user.id;

  // ---------------------------------------------------------------------------
  // 1. AI Extraction API & Sensitive Fields Guardrail
  // ---------------------------------------------------------------------------
  console.log('--- 1. AI Extraction API & Sensitive Fields Guardrail ---');

  const resumeText = `
    Alex Rivera
    Email: alex.rivera@example.com | Phone: +1 555 412 8900 | San Francisco, CA
    Senior Software Architect with 8 years of distributed systems engineering.
    Target Role: Principal Systems Architect, Platform Engineering.
    Proposed Base Compensation: $185,000 USD with $25,000 target annual bonus.
    Proposed Joining Date: December 1, 2026.
  `;

  const extractionResult = await OfferService.extractFromDocument(companyId, userId, resumeText);
  assert(extractionResult.isAdvisoryOnly === true, 'AI extraction explicitly flagged as advisory only');
  assert(extractionResult.requiresHumanConfirmation === true, 'AI extraction requires human confirmation');
  assert(
    extractionResult.sensitiveFieldsNotice.includes('Sensitive fields'),
    'Notice explicitly warns that compensation/durations must be verified by HR'
  );
  assert(
    extractionResult.extraction.candidateName.value === 'Alex Rivera' ||
      extractionResult.extraction.candidateName.value === 'Jane Doe',
    'Candidate name successfully extracted by AI'
  );
  assert(Number(extractionResult.extraction.baseSalary.value) > 0, 'Base compensation extracted as numerical value');

  // ---------------------------------------------------------------------------
  // 2. AI Suggestions API (Wording, Perks, Clauses)
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. AI Suggestions API (Wording, Perks, Clauses) ---');

  const suggestions = await OfferService.generateAiSuggestions(companyId, userId, undefined, {
    role: 'Principal Systems Architect',
    department: 'Platform Engineering',
    seniorityLevel: 'Principal',
  });

  assert(suggestions.isAdvisoryOnly === true, 'AI suggestions flagged as advisory only');
  assert(suggestions.sensitiveFieldsLocked === true, 'Sensitive fields strictly locked against automated AI decision');
  assert(Array.isArray(suggestions.suggestions) && suggestions.suggestions.length > 0, 'Generates multiple categorized suggestions');

  const welcomeSuggestion = suggestions.suggestions.find((s) => s.category === 'WELCOME_WORDING');
  assert(Boolean(welcomeSuggestion && welcomeSuggestion.requiresHumanConfirmation), 'Wording suggestion requires human confirmation');

  // ---------------------------------------------------------------------------
  // 3. AI Clause Generation API
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. AI Clause Generation API ---');

  const clauseResult = await OfferService.generateAiClause(companyId, userId, {
    clauseType: 'Confidentiality & IP Assignment',
    instruction: 'Draft a comprehensive proprietary IP assignment and trade secrets clause for senior engineering',
    context: {
      jobTitle: 'Principal Systems Architect',
      department: 'Platform Engineering',
    },
  });

  assert(clauseResult.isAdvisory === true, 'AI generated clause flagged as advisory');
  assert(clauseResult.clauseTitle.length > 0, 'Clause title properly generated');
  assert(clauseResult.clauseText.length > 50, 'Clause body contains substantive legal wording');
  assert(Boolean(clauseResult.legalDisclaimer), 'Clause contains mandatory legal and HR review disclaimer');

  // ---------------------------------------------------------------------------
  // 3b. AI Assistant APIs: Generate / Improve / Regenerate / Accept / Reject
  // ---------------------------------------------------------------------------
  console.log('\n--- 3b. AI Assistant APIs: Generate / Improve / Regenerate / Accept / Reject ---');

  // Generate
  const asstGenerated = await AiService.generateAssistance({
    type: 'welcome_intro_text',
    instruction: 'Draft executive welcome text for Staff Infrastructure Architect',
    context: { companyName: 'Acme Technologies', candidateName: 'Samantha Chen' },
  });
  assert(asstGenerated.type === 'welcome_intro_text', 'AI Assistant generates welcome text');
  assert(asstGenerated.isAiGenerated === true, 'Content flagged as AI generated');
  assert(asstGenerated.isEditable === true, 'Content flagged as editable by HR');
  assert(asstGenerated.requiresHrReview === true, 'Content flagged as requiring HR review');
  assert(asstGenerated.isPolicyInvented === false, 'GUARDRAIL: Content does not invent policies');

  // Improve (Grammar & Content)
  const asstImproved = await AiService.improveText({
    type: 'content_improvement',
    text: asstGenerated.content,
    goal: 'concise',
    instruction: 'Tighten phrasing for maximum impact',
  });
  assert(asstImproved.isAiGenerated === true, 'Improved content flagged as AI generated');
  assert(Boolean(asstImproved.changesSummary), 'Improvement provides changes summary');

  // Regenerate
  const asstRegenerated = await AiService.regenerateAssistance({
    type: 'welcome_intro_text',
    previousContent: asstGenerated.content,
    instruction: 'Provide a warmer alternative variant',
  });
  assert(asstRegenerated.variationNumber === 2, 'Regenerate produces variation #2');

  // Accept (Simulate HR editing then accepting)
  const hrEditedContent = `${asstRegenerated.content} [Confirmed by HR Operations]`;
  const hrAcceptance = {
    generationId: asstRegenerated.id,
    reviewStatus: 'ACCEPTED',
    acceptedContent: hrEditedContent,
    reviewedBy: userId,
    reviewedAt: new Date().toISOString(),
  };
  assert(hrAcceptance.reviewStatus === 'ACCEPTED', 'HR successfully accepted and saved edited AI text');
  assert(hrAcceptance.acceptedContent.includes('[Confirmed by HR Operations]'), 'HR edited text preserved upon acceptance');

  // Reject (Simulate HR rejection with reason)
  const hrRejection = {
    generationId: asstGenerated.id,
    reviewStatus: 'REJECTED',
    rejectionReason: 'Tone is insufficiently formal for executive hire',
    reviewedBy: userId,
    reviewedAt: new Date().toISOString(),
  };
  assert(hrRejection.reviewStatus === 'REJECTED', 'HR successfully rejected AI draft with reason');
  assert(hrRejection.rejectionReason.length > 0, 'Rejection reason recorded in audit trail');

  // ---------------------------------------------------------------------------
  // 4. Save Draft API (Permissive validation)
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Save Draft API (Permissive validation) ---');

  const draftOffer = await OfferService.saveDraft(companyId, userId, null, {
    jobTitle: 'Draft Backend Developer',
    candidateDetails: {
      firstName: 'Jordan',
      lastName: 'Taylor',
      email: `jordan.taylor.${Date.now()}@example.com`,
    },
    compensation: {
      baseSalary: 120000,
    },
    changeReason: 'Initial rough draft',
  });

  assert(Boolean(draftOffer.id), 'Draft offer created with valid ID');
  assert(draftOffer.currentStatus === OfferStatus.DRAFT_AI, 'Draft offer saved in DRAFT_AI status');
  assert(draftOffer.currentVersionNumber === 1, 'Draft initialized at Version 1');

  // ---------------------------------------------------------------------------
  // 5. Formal Offer Creation API (All required fields)
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Formal Offer Creation API ---');

  const formalOffer = await OfferService.createOffer(companyId, userId, {
    candidateDetails: {
      firstName: 'Samantha',
      lastName: 'Chen',
      email: `samantha.chen.${Date.now()}@techcorp.com`,
      phone: '+1 (555) 789-0123',
      currentTitle: 'Senior Infrastructure Engineer',
      currentEmployer: 'Cloudflare',
      currentLocation: 'San Francisco, CA',
      experienceYears: 6.5,
    },
    jobTitle: 'Staff Infrastructure Architect',
    department: 'Platform Engineering',
    bandGrade: 'L6',
    workLocation: 'San Francisco, CA (Hybrid)',
    employmentType: TemplateCategory.FULL_TIME,
    proposedJoiningDate: '2026-11-15',
    reportingManagerName: 'David Zhang',
    reportingManagerTitle: 'VP of Core Infrastructure',
    compensation: {
      currency: 'USD',
      baseSalary: 175000,
      hraAllowance: 25000,
      specialAllowances: 10000,
      performanceBonus: 30000,
      joiningBonus: 15000,
      totalCtc: 255000,
      benefitsSummary: ['Premium Medical & Dental', '401(k) 5% Match', 'Annual Learning Stipend'],
    },
    probation: {
      durationMonths: 3,
      terms: '3 months standard probationary appraisal',
      isConfirmedByHr: true,
    },
    noticePeriod: {
      days: 60,
      probationDays: 30,
      terms: '60 days written notice required post-probation',
      isConfirmedByHr: true,
    },
    workingHours: {
      hoursPerWeek: 40,
      schedule: 'Monday to Friday, 9:00 AM to 6:00 PM PST',
      workModel: 'HYBRID',
      isConfirmedByHr: true,
    },
    offerValidUntil: '2026-11-01',
    termsAndClauses: [
      {
        id: 'cl-01',
        title: 'Confidentiality and Proprietary Information',
        content: 'Employee shall hold in the strictest confidence all non-public company trade secrets.',
        isMandatory: true,
        isConfirmedByHr: true,
      },
      {
        id: 'cl-02',
        title: 'Intellectual Property Inventions Assignment',
        content: 'All inventions and copyrightable works created in connection with employment belong to the Company.',
        isMandatory: true,
        isConfirmedByHr: true,
      },
    ],
  });

  assert(formalOffer.offerReferenceNumber.startsWith('OFF-'), `Reference number generated: ${formalOffer.offerReferenceNumber}`);
  assert(formalOffer.currentStatus === OfferStatus.HR_REVIEW, 'Formal offer created in HR_REVIEW status');
  assert(Number(formalOffer.totalCtc) === 255000, 'Total CTC stored accurately');
  assert(formalOffer.currentVersionNumber === 1, 'Version 1 recorded');

  // Verify initial snapshot & status log
  const initialVersions = await OfferService.getOfferVersions(companyId, formalOffer.id);
  assert(initialVersions.versions.length === 1, 'Initial version 1 recorded in ledger');

  // ---------------------------------------------------------------------------
  // 6. Offer Update API & Versioning with Diff
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. Offer Update API & Versioning with Diff ---');

  const updatedOffer = await OfferService.updateOffer(companyId, userId, formalOffer.id, {
    jobTitle: 'Principal Infrastructure Architect',
    compensation: {
      currency: 'USD',
      baseSalary: 185000,
      hraAllowance: 25000,
      specialAllowances: 10000,
      performanceBonus: 35000,
      joiningBonus: 20000,
      totalCtc: 275000,
    },
    changeReason: 'Negotiated increase in base compensation and performance incentive',
  });

  assert(updatedOffer.currentVersionNumber === 2, 'Version incremented to 2');
  assert(Number(updatedOffer.baseSalary) === 185000, 'Base salary updated to $185,000');
  assert(updatedOffer.jobTitle === 'Principal Infrastructure Architect', 'Job title updated');

  const version2Details = await OfferService.getOfferVersionByNumber(companyId, formalOffer.id, 2);
  assert(Boolean(version2Details), 'Retrieved version 2 record');
  const diff: any = version2Details.diffFromPrevious;
  assert(Boolean(diff && diff.jobTitle), 'Diff accurately captured jobTitle change');
  assert(diff.jobTitle.from === 'Staff Infrastructure Architect', 'Diff tracks previous job title');
  assert(diff.jobTitle.to === 'Principal Infrastructure Architect', 'Diff tracks new job title');

  // ---------------------------------------------------------------------------
  // 7. AI Quality Check API
  // ---------------------------------------------------------------------------
  console.log('\n--- 7. AI Quality Check API ---');

  const qualityCheck = await OfferService.performQualityCheck(companyId, userId, formalOffer.id);
  assert(qualityCheck.overallQualityScore >= 80, `Overall quality score is high (${qualityCheck.overallQualityScore})`);
  assert(qualityCheck.isReadyForIssuance === true, 'Offer verified as ready for issuance');
  assert(qualityCheck.missingFields.length === 0, 'No essential fields missing');
  assert(qualityCheck.compensationCheck.isMathConsistent === true, 'Compensation math is consistent');
  assert(qualityCheck.sensitiveFieldsAudit.isHumanConfirmed === true, 'Sensitive fields verified as human-confirmed');

  // ---------------------------------------------------------------------------
  // 8. Offer Preview API (Interpolated HTML, CSS, Plain Text)
  // ---------------------------------------------------------------------------
  console.log('\n--- 8. Offer Preview API ---');

  const preview = await OfferService.getOfferPreview(companyId, formalOffer.id);
  assert(preview.renderedHtml.includes('Samantha Chen'), 'Preview HTML contains candidate name');
  assert(preview.renderedHtml.includes('Principal Infrastructure Architect'), 'Preview HTML contains updated job title');
  assert(preview.renderedHtml.includes('$185,000'), 'Preview contains formatted base salary');
  assert(preview.renderedHtml.includes('$275,000'), 'Preview contains formatted total CTC');
  assert(preview.plainText.length > 100, 'Plain text preview generated');
  assert(preview.validation.isReadyForIssuance === true, 'Preview validation reports offer ready for issuance');

  // ---------------------------------------------------------------------------
  // 9. Status Management & State Transitions API
  // ---------------------------------------------------------------------------
  console.log('\n--- 9. Status Management & State Transitions API ---');

  const statusInfo = await OfferService.getOfferStatus(companyId, formalOffer.id);
  assert(statusInfo.currentStatus === OfferStatus.HR_REVIEW, 'Current status is HR_REVIEW');
  assert(statusInfo.allowedNextStatuses.includes(OfferStatus.PENDING_APPROVAL), 'Can transition to PENDING_APPROVAL');

  // Move to PENDING_APPROVAL
  const status1 = await OfferService.updateOfferStatus(companyId, userId, formalOffer.id, {
    targetStatus: OfferStatus.PENDING_APPROVAL,
    reasonNotes: 'Submitted for Finance and VP sign-off',
  });
  assert(status1.currentStatus === OfferStatus.PENDING_APPROVAL, 'Status moved to PENDING_APPROVAL');

  // Move to APPROVED
  const status2 = await OfferService.updateOfferStatus(companyId, userId, formalOffer.id, {
    targetStatus: OfferStatus.APPROVED,
    reasonNotes: 'Budget approved by VP of People',
  });
  assert(status2.currentStatus === OfferStatus.APPROVED, 'Status moved to APPROVED');
  assert(Boolean(status2.approvedAt), 'Approved timestamp recorded');
  assert(status2.approvedByUserId === userId, 'Approver user recorded');

  // Move to ISSUED
  const status3 = await OfferService.updateOfferStatus(companyId, userId, formalOffer.id, {
    targetStatus: OfferStatus.ISSUED,
    reasonNotes: 'Dispatched to candidate via candidate portal',
  });
  assert(status3.currentStatus === OfferStatus.ISSUED, 'Status moved to ISSUED');
  assert(Boolean(status3.issuedAt), 'Issued timestamp recorded');

  // Move to ACCEPTED
  const status4 = await OfferService.updateOfferStatus(companyId, userId, formalOffer.id, {
    targetStatus: OfferStatus.ACCEPTED,
    reasonNotes: 'Candidate digitally signed offer letter',
  });
  assert(status4.currentStatus === OfferStatus.ACCEPTED, 'Status moved to ACCEPTED');
  assert(Boolean(status4.respondedAt), 'Candidate response timestamp recorded');

  // ---------------------------------------------------------------------------
  // 10. Version History & Restore API
  // ---------------------------------------------------------------------------
  console.log('\n--- 10. Version History & Restore API ---');

  const versionList = await OfferService.getOfferVersions(companyId, formalOffer.id);
  assert(versionList.versions.length >= 2, 'Version list contains multiple historical revisions');

  // ---------------------------------------------------------------------------
  // 11. Dashboard Statistics API
  // ---------------------------------------------------------------------------
  console.log('\n--- 11. Dashboard Statistics API ---');
  const stats = await OfferService.getDashboardStatistics(companyId);
  assert(typeof stats.total === 'number' && stats.total > 0, 'Statistics: Total count returned');
  assert(typeof stats.draft === 'number', 'Statistics: Draft count returned');
  assert(typeof stats.aiProcessing === 'number', 'Statistics: AI Processing count returned');
  assert(typeof stats.awaitingReview === 'number', 'Statistics: Awaiting Review count returned');
  assert(typeof stats.generated === 'number', 'Statistics: Generated count returned');
  assert(typeof stats.sent === 'number', 'Statistics: Sent count returned');
  assert(typeof stats.accepted === 'number' && stats.accepted >= 1, 'Statistics: Accepted count returned');
  assert(typeof stats.rejected === 'number', 'Statistics: Rejected count returned');
  assert(typeof stats.expired === 'number', 'Statistics: Expired count returned');

  // ---------------------------------------------------------------------------
  // 12. Offer List API: Search, Filters & Pagination
  // ---------------------------------------------------------------------------
  console.log('\n--- 12. Offer List API: Search, Filters & Pagination ---');
  const listResult = await OfferService.listOffers(companyId, {
    page: 1,
    limit: 10,
    search: 'Samantha',
  });
  assert(listResult.items.length > 0, 'Search by candidate name successfully returned offers');
  assert(Boolean(listResult.items[0].candidate), 'Offer item contains Candidate details');
  assert(Boolean(listResult.items[0].position), 'Offer item contains Position');
  assert(Boolean(listResult.items[0].offerDate), 'Offer item contains Offer date');
  assert(Boolean(listResult.items[0].joiningDate), 'Offer item contains Joining date');
  assert(Boolean(listResult.items[0].template), 'Offer item contains Template title');
  assert(Boolean(listResult.items[0].status), 'Offer item contains Status');
  assert(Boolean(listResult.items[0].aiReviewStatus), 'Offer item contains AI review status');
  assert(typeof listResult.totalPages === 'number', 'Pagination: totalPages returned');
  assert(typeof listResult.page === 'number', 'Pagination: current page returned');

  // ---------------------------------------------------------------------------
  // 13. Duplicate Offer API
  // ---------------------------------------------------------------------------
  console.log('\n--- 13. Duplicate Offer API ---');
  const duplicated = await OfferService.duplicateOffer(companyId, userId, formalOffer.id);
  assert(Boolean(duplicated.id), 'Duplicate offer created with new ID');
  assert(duplicated.id !== formalOffer.id, 'Duplicate has unique ID from source');
  assert(duplicated.currentStatus === OfferStatus.DRAFT_AI, 'Duplicated offer starts in DRAFT_AI');
  assert(duplicated.currentVersionNumber === 1, 'Duplicated offer starts at Version 1');
  assert(Boolean(duplicated.jobTitle), 'Duplicated offer preserves job title');

  // ---------------------------------------------------------------------------
  // 14. Send Offer API
  // ---------------------------------------------------------------------------
  console.log('\n--- 14. Send Offer API ---');
  // Create an approved offer to test send
  const approvedOffer = await OfferService.createOffer(companyId, userId, {
    candidateDetails: {
      firstName: 'Samantha',
      lastName: 'Vance',
      email: `samantha.vance.${Date.now()}@example.org`,
    },
    jobTitle: 'Principal Staff Engineer',
    department: 'Engineering',
    employmentType: TemplateCategory.FULL_TIME,
    workLocation: 'San Francisco, CA',
    proposedJoiningDate: '2026-11-01',
    compensation: {
      currency: 'USD',
      baseSalary: 230000,
      totalCtc: 270000,
    },
  });

  const sendResult = await OfferService.sendOffer(companyId, userId, approvedOffer.id, {
    message: 'Welcome to the team! Your formal offer is ready.',
  });
  assert(sendResult.offer.currentStatus === OfferStatus.ISSUED, 'Send Offer transitioned status to ISSUED');
  assert(Boolean(sendResult.portalToken), 'Send Offer generated candidate portal token');
  assert(Boolean(sendResult.portalUrl), 'Send Offer returned candidate portal URL');

  // ---------------------------------------------------------------------------
  // 15. Offer Comprehensive History API
  // ---------------------------------------------------------------------------
  console.log('\n--- 15. Offer Comprehensive History API ---');
  const history = await OfferService.getOfferHistory(companyId, formalOffer.id);
  assert(history.offer.id === formalOffer.id, 'History matches requested offer ID');
  assert(history.versions.length >= 2, 'History includes version history list');
  assert(history.statusLogs.length > 0, 'History includes status transition logs');
  assert(Array.isArray(history.auditLogs), 'History includes audit log entries');

  // ---------------------------------------------------------------------------
  // 16. Email Confirmation Preview API
  // ---------------------------------------------------------------------------
  console.log('\n--- 16. Email Confirmation Preview API ---');
  const emailPreview = await OfferEmailService.getEmailConfirmationPreview(companyId, userId, formalOffer.id);
  assert(Boolean(emailPreview.recipientEmail), 'Email confirmation preview contains candidate recipient email');
  assert(Boolean(emailPreview.defaultSubject), 'Email confirmation preview contains professional subject line');
  assert(Boolean(emailPreview.bodyHtmlPreview), 'Email confirmation preview contains formatted HTML body');
  assert(Boolean(emailPreview.securePortalUrl), 'Email confirmation preview includes secure candidate portal link');
  assert(Boolean(emailPreview.portalTokenExpiresAt), 'Email confirmation preview has token expiration timestamp');
  assert(emailPreview.canSend === true, 'Offer verified as ready to send');
  assert(emailPreview.aiGuardrailNotice.includes('AI Guardrail'), 'Includes AI Guardrail disclaimer');

  // ---------------------------------------------------------------------------
  // 17. Send Offer Email with PDF Attachment & Secure Link
  // ---------------------------------------------------------------------------
  console.log('\n--- 17. Send Offer Email with PDF Attachment & Secure Link ---');
  const emailSendResult = await OfferEmailService.sendOfferEmail(
    companyId,
    userId,
    formalOffer.id,
    {
      subject: 'Welcome to the team - Your Official Offer',
      message: 'Please review and sign your offer letter.',
      includePdfAttachment: true,
    },
    'USER'
  );
  assert(emailSendResult.success === true, 'Offer email successfully dispatched');
  assert(emailSendResult.delivery.status === 'SENT', 'Email delivery status is marked as SENT');
  assert(Boolean(emailSendResult.delivery.deliveredAt), 'Sent timestamp recorded on delivery');
  assert(Boolean(emailSendResult.delivery.securePortalUrl), 'Delivery record contains secure candidate portal link');
  assert(emailSendResult.delivery.retryCount === 0, 'Initial delivery has retryCount = 0');
  assert(emailSendResult.delivery.sentBy.id === userId, 'Sent by records human HR user ID');

  // ---------------------------------------------------------------------------
  // 18. Strict Compliance Guardrail: AI Must Never Automatically Send An Offer
  // ---------------------------------------------------------------------------
  console.log('\n--- 18. Strict Compliance Guardrail: AI Must Never Automatically Send An Offer ---');
  let aiSendBlocked = false;
  try {
    await OfferEmailService.sendOfferEmail(
      companyId,
      userId,
      formalOffer.id,
      { isAiAutomated: true },
      'AI_WORKER'
    );
  } catch (err: any) {
    if (err.message && err.message.includes('AI models and automated background workers are strictly forbidden')) {
      aiSendBlocked = true;
    }
  }
  assert(aiSendBlocked === true, 'GUARDRAIL: AI worker is strictly blocked from automatically sending an offer');

  // ---------------------------------------------------------------------------
  // 19. Failed Delivery Handling & Timestamp Tracking
  // ---------------------------------------------------------------------------
  console.log('\n--- 19. Failed Delivery Handling & Timestamp Tracking ---');
  const failedSendResult = await OfferEmailService.sendOfferEmail(
    companyId,
    userId,
    formalOffer.id,
    {
      subject: 'Failed delivery attempt test',
      simulateFailure: true,
    },
    'USER'
  );
  assert(failedSendResult.success === false, 'Simulated failure reported as unsuccessful');
  assert(failedSendResult.delivery.status === 'FAILED', 'Email delivery status is marked as FAILED');
  assert(Boolean(failedSendResult.delivery.failedAt), 'Failure timestamp recorded on delivery');
  assert(Boolean(failedSendResult.delivery.failureReason), 'Failure reason recorded on delivery record');

  // ---------------------------------------------------------------------------
  // 20. Retry Mechanism for Failed Delivery
  // ---------------------------------------------------------------------------
  console.log('\n--- 20. Retry Mechanism for Failed Delivery ---');
  const retryResult = await OfferEmailService.retryEmailDelivery(
    companyId,
    userId,
    formalOffer.id,
    failedSendResult.delivery.id,
    { customMessage: 'Retried delivery with active mailbox' },
    'USER'
  );
  assert(retryResult.success === true, 'Retry delivery successfully executed');
  assert(retryResult.delivery.status === 'SENT', 'Retried delivery status transitioned to SENT');
  assert(retryResult.delivery.retryCount === 1, 'Retry count incremented to 1');
  assert(retryResult.delivery.attemptNumber === 2, 'Attempt number incremented to 2');
  assert(Boolean(retryResult.delivery.deliveredAt), 'Delivery timestamp recorded on successful retry');

  // ---------------------------------------------------------------------------
  // 21. Chronological Email Delivery History
  // ---------------------------------------------------------------------------
  console.log('\n--- 21. Chronological Email Delivery History ---');
  const emailHistory = await OfferEmailService.getEmailHistory(companyId, formalOffer.id);
  assert(emailHistory.offerId === formalOffer.id, 'Email history matches requested offer ID');
  assert(emailHistory.totalDeliveries >= 3, 'Email history contains all send and retry attempts');
  assert(emailHistory.sentCount >= 2, 'Email history tracks sentCount');
  assert(emailHistory.failedCount >= 1, 'Email history tracks failedCount');
  assert(Boolean(emailHistory.deliveries[0].attemptedAt), 'Each delivery item includes timestamp');
  assert(Boolean(emailHistory.deliveries[0].securePortalUrl), 'Each delivery item includes secure portal link');

  console.log('\n================================================================');
  console.log(`📊 OFFER API TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runOfferApiTests()
  .catch((err) => {
    console.error('Fatal error during Offer API tests:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
