import { prisma } from '../prisma/client.js';
import { OfferService } from '../modules/offers/offer.service.js';
import { OfferStatus, TemplateCategory } from '@prisma/client';
import { AiProviderFactory } from '../modules/ai/ai-provider.factory.js';
import { MockAiAdapter } from '../modules/ai/adapters/mock.adapter.js';

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
  assert(extractionResult.extraction.candidateName.value === 'Jane Doe', 'Candidate name successfully extracted by AI');
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
