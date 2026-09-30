// =============================================================================
// STEP 12 — FINAL COMPLETE PRODUCT TESTING SUITE
// =============================================================================
// Flow:
// Login
//  ↓
// Dashboard
//  ↓
// Create HR Document
//  ↓
// AI Assistance
//  ↓
// HR Review
//  ↓
// Generate PDF
//  ↓
// History/Audit
//  ↓
// Policy
//  ↓
// Onboarding
//  ↓
// L&D Course
//  ↓
// Certificate
//  ↓
// Aptitude Test/Quiz
//
// Responsibilities:
// - Ajay: Database -> Documents -> Templates -> PDF -> Storage -> Certificates
// - Shubham: AI Assistance -> Quality Check -> Suggestions -> Guardrails
// - Sakshi: Frontend UX -> Unified Dashboard -> Forms -> Review -> Download -> Live Flow
// =============================================================================

import { CryptoUtil } from '../utils/crypto.js';
import { DocumentTypeRegistry } from '../modules/documents/document-engine/document-type.registry.js';
import { HrDocumentService } from '../modules/documents/document-engine/hr-document.service.js';
import { DocumentAiEngineService } from '../modules/documents/document-engine/document-ai.service.js';
import { DocumentQualityService } from '../modules/documents/document-engine/document-quality.service.js';
import { ModularDocumentPdfService } from '../modules/documents/document-engine/document-pdf.service.js';
import { DocumentStorageService } from '../modules/documents/document-storage.service.js';
import { PolicyRegistry } from '../modules/policies/policy.registry.js';
import { PolicyService } from '../modules/policies/policy.service.js';
import { OnboardingService } from '../modules/onboarding/onboarding.service.js';
import { LearningService } from '../modules/learning/learning.service.js';
import { CertificateService } from '../modules/learning/certificate.service.js';
import { AssessmentService } from '../modules/assessments/assessment.service.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    failed++;
  }
}

async function runStep12FinalTesting() {
  console.log('\n================================================================================');
  console.log('🚀 STEP 12: FINAL COMPLETE PRODUCT END-TO-END VERIFICATION');
  console.log('================================================================================\n');

  const COMPANY_ID = 'cmp_tasknera_001';
  const ACTOR_HR_ID = 'usr_sakshi_1048';
  const ACTOR_HR_ROLE = 'HR_MANAGER';

  // ---------------------------------------------------------------------------
  // 1. LOGIN & AUTHENTICATION
  // ---------------------------------------------------------------------------
  console.log('--- 1. Login & Identity Token Validation ---');

  const userClaims = {
    userId: ACTOR_HR_ID,
    email: 'sakshi@tasknera.com',
    companyId: COMPANY_ID,
    roles: [ACTOR_HR_ROLE, 'SUPER_ADMIN'],
    permissions: ['*'],
  };

  const jwtToken = CryptoUtil.signAccessToken(userClaims);
  assert(typeof jwtToken === 'string' && jwtToken.split('.').length === 3, 'Generates compliant signed JWT access token');

  const verifiedUser = CryptoUtil.verifyAccessToken(jwtToken);
  assert(verifiedUser.userId === ACTOR_HR_ID, 'Authenticates user identity and claims from token');
  assert(verifiedUser.roles.includes('HR_MANAGER'), 'Verifies HR_MANAGER role entitlement for enterprise console access');

  // ---------------------------------------------------------------------------
  // 2. DASHBOARD OVERVIEW & PILLAR AVAILABILITY
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Dashboard 6-Pillars Master State Verification ---');

  const docService = new HrDocumentService();
  const policyService = new PolicyService();
  const onboardingService = new OnboardingService();
  const learningService = new LearningService();
  const certService = new CertificateService();
  const assessmentService = new AssessmentService();

  const allDocTypes = DocumentTypeRegistry.getCoreTypes();
  assert(allDocTypes.length === 9, 'Pillar 1: 9 Core HR Document Types available');

  const allPolicies = PolicyRegistry.getAll();
  assert(allPolicies.length === 19, 'Pillar 2: 19 Standard Governance Policies ready');

  const allCandidates = await onboardingService.listCandidates({ companyId: COMPANY_ID });
  assert(allCandidates.length >= 1, 'Pillar 3: Active Onboarding Cohorts populated');

  const allCourses = await learningService.listCourses();
  assert(allCourses.length >= 2, 'Pillar 4: L&D Academy Curricula initialized');

  const allAssessments = assessmentService.listTests();
  assert(allAssessments.length >= 2, 'Pillar 5: Aptitude Tests & Cognitive Quizzes initialized');

  const allCertTemplates = certService.listTemplates();
  assert(allCertTemplates.length === 6, 'Pillar 6: 6 Reusable Certificate Templates loaded');

  // ---------------------------------------------------------------------------
  // 3. CREATE HR DOCUMENT (Ajay's Architecture)
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Create HR Document (Offer Letter) ---');

  const newDoc = await HrDocumentService.createDocument({
    companyId: COMPANY_ID,
    documentTypeCode: 'OFFER_LETTER',
    title: 'Senior Distributed Systems Architect Offer Letter',
    recipientName: 'Aditya Sen',
    recipientEmail: 'aditya.sen@tasknera.com',
    signatoryName: 'Sakshi Koparde',
    signatoryTitle: 'Head of People Operations',
    createdByUserId: ACTOR_HR_ID,
  });

  assert(typeof newDoc.id === 'string' && newDoc.id.length > 0, 'Instantiates HR document with unique identifier');
  assert(newDoc.currentStatus === 'DRAFT_AI', 'Initial document status is DRAFT_AI');
  assert(newDoc.recipientName === 'Aditya Sen', 'Records initial candidate profile');
  assert(newDoc.referenceNumber.startsWith('OFF-2026-'), 'Assigns official reference number');

  // ---------------------------------------------------------------------------
  // 4. AI ASSISTANCE & STRICT GUARDRAILS (Shubham's Architecture)
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. AI Assistance & Guardrails Verification ---');

  const suggestions = DocumentAiEngineService.suggestSections('OFFER_LETTER', ['candidate', 'job']);
  assert(Array.isArray(suggestions) && suggestions.length > 0, 'AI generates relevant section suggestions');

  const missingInfo = DocumentAiEngineService.suggestMissingInformation('OFFER_LETTER', { candidateName: 'Aditya Sen' });
  assert(Array.isArray(missingInfo) && missingInfo.length > 0, 'AI identifies missing required fields strictly without fabricating');

  const aiImprovement = await DocumentAiEngineService.improveDocumentWording({
    documentTypeCode: 'OFFER_LETTER',
    currentText: 'Candidate will work as software engineer and get paid accordingly.',
    tone: 'FORMAL',
    targetSectionTitle: 'Scope of Responsibilities',
  });
  assert(aiImprovement.isAiGenerated === true, 'AI output is explicitly stamped with isAiGenerated: true');
  assert(aiImprovement.requiresHrReview === true, 'AI output strictly requires human HR review');

  // Strict Guardrail: AI must NEVER approve document or alter HR confirmed data directly
  assert(newDoc.currentStatus === 'DRAFT_AI', 'AI assistance leaves document in DRAFT_AI (never auto-approves)');

  // ---------------------------------------------------------------------------
  // 5. HR REVIEW & QUALITY CHECK (Ajay + Shubham Architecture)
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. HR Review & Quality Check Audit ---');

  // HR Confirms terms
  const confirmResult = await HrDocumentService.confirmTermsByHr({
    documentId: newDoc.id,
    hrConfirmedData: {
      candidateName: 'Aditya Sen',
      email: 'aditya.sen@tasknera.com',
      jobTitle: 'Senior Distributed Systems Architect',
      department: 'Engineering',
      workLocation: 'Bengaluru / Hybrid',
      proposedJoiningDate: '2026-10-15',
      baseSalary: 185000,
      totalCtc: 210000,
      currency: 'USD',
      signatoryName: 'Sakshi Koparde',
      signatoryTitle: 'Head of People Operations',
    },
    reviewedByUserId: ACTOR_HR_ID,
  });

  assert(confirmResult.document.currentStatus === 'HR_REVIEW', 'Transitions document status to HR_REVIEW');
  assert(confirmResult.validation.isValid === true, 'HR confirmed terms pass schema validation');

  // Quality check audit
  const qualityReport = DocumentQualityService.auditDocument(newDoc.documentTypeCode, confirmResult.document.hrConfirmedData);
  assert(qualityReport.overallScore >= 90, 'Clean HR document achieves high quality score');
  assert(qualityReport.status !== 'REVIEW_REQUIRED', 'No critical blocking discrepancies in confirmed data');

  // ---------------------------------------------------------------------------
  // 6. GENERATE PDF & SECURE STORAGE (Ajay's Architecture)
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. Generate PDF & Storage Management ---');

  const genResult = await HrDocumentService.generateLegalPdf(
    newDoc.id,
    ACTOR_HR_ID,
    {
      name: 'TaskNera Inc.',
      legalName: 'TaskNera Global Technologies Pvt Ltd',
      domain: 'tasknera.com',
      address: 'Indiranagar 100ft Rd, Bengaluru 560038',
    }
  );

  assert(genResult.pdfResult.buffer.length > 500, 'Generates complete PDF document binary buffer');
  assert(genResult.document.referenceNumber.startsWith('OFF-2026-'), 'Assigns official immutable Reference Number (OFF-2026-XXXX)');
  assert(genResult.pdfResult.fileName.includes(genResult.document.referenceNumber), 'Includes reference number in PDF file name');
  assert(genResult.pdfResult.isPreview === false, 'Strict Guarantee: Generated final PDF is not a watermark preview');

  const latestFile = genResult.document.generatedFiles[genResult.document.generatedFiles.length - 1];
  assert(latestFile !== undefined, 'Registers file in document storage records');
  assert(latestFile.sha256Checksum.length === 64, 'Computes cryptographic SHA-256 integrity checksum');
  assert(latestFile.isFinalLegalDocument === true, 'Marks document as official final legal instrument');

  // ---------------------------------------------------------------------------
  // 7. HISTORY / AUDIT LEDGER
  // ---------------------------------------------------------------------------
  console.log('\n--- 7. History & Audit Trail Verification ---');

  const updatedDoc = await HrDocumentService.getById(newDoc.id);
  assert(updatedDoc.statusHistory.length >= 2, 'Maintains complete lifecycle history');
  const statusesLogged = updatedDoc.statusHistory.map((h) => h.toStatus);
  assert(statusesLogged.includes('DRAFT_AI'), 'Audit records document creation status');
  assert(statusesLogged.includes('HR_REVIEW'), 'Audit records human confirmation status');
  assert(updatedDoc.versions.length >= 2, 'Maintains immutable version snapshots');

  // ---------------------------------------------------------------------------
  // 8. POLICY MANAGEMENT ENGINE
  // ---------------------------------------------------------------------------
  console.log('\n--- 8. Policy Management Lifecycle ---');

  const createdPolicy = await PolicyService.createPolicy({
    companyId: COMPANY_ID,
    policyTypeCode: 'WORK_FROM_HOME_POLICY',
    policyOwner: 'Sakshi Koparde',
    policyOwnerUserId: ACTOR_HR_ID,
    department: 'People Operations',
    effectiveDate: '2026-10-01',
  });
  assert(createdPolicy.policyNumber.startsWith('POL-'), 'Creates policy with official number');
  assert(createdPolicy.currentStatus === 'DRAFT', 'Initial policy status is DRAFT');

  // Executive Approval
  const approvedPolicy = await PolicyService.recordApproval({
    policyId: createdPolicy.id,
    approverUserId: ACTOR_HR_ID,
    approverName: 'Sakshi Koparde',
    approverTitle: 'VP People Operations',
    decision: 'APPROVED',
    notes: 'Reviewed and aligned with remote working guidelines 2026',
  });
  assert(approvedPolicy.currentStatus === 'APPROVED', 'Policy approved by Executive Committee');

  // Publish Policy
  const publishedPolicy = await PolicyService.publishPolicy(
    createdPolicy.id,
    ACTOR_HR_ID,
    'Official publication of v1.0 remote work guidelines'
  );
  assert(publishedPolicy.currentStatus === 'PUBLISHED', 'Publishes policy with active governance version');
  assert(publishedPolicy.versionHistory.length === 1, 'Creates immutable version snapshot');

  // ---------------------------------------------------------------------------
  // 9. ONBOARDING ENGINE
  // ---------------------------------------------------------------------------
  console.log('\n--- 9. Onboarding Lifecycle & Verification ---');

  const candidate = await onboardingService.initiateOnboarding({
    companyId: COMPANY_ID,
    candidateName: 'Pooja Hegde',
    email: 'pooja.h@tasknera.com',
    phone: '+91 98765 43210',
    designation: 'Product Operations Lead',
    department: 'Product Experience',
    joiningDate: '2026-10-25',
    creatorId: ACTOR_HR_ID,
  });
  assert(candidate.id.startsWith('onb_'), 'Creates onboarding record');
  assert(candidate.status === 'INVITED', 'Initial onboarding status is INVITED');

  // Save candidate draft details
  await onboardingService.saveDraft(candidate.id, {
    personalInfo: {
      firstName: 'Pooja',
      lastName: 'Hegde',
      dateOfBirth: '1995-04-12',
      gender: 'Female',
      maritalStatus: 'Single',
      nationality: 'Indian',
    },
    contactInfo: {
      personalEmail: 'pooja.h@tasknera.com',
      mobileNumber: '+91 98765 43210',
      currentAddress: 'Indiranagar, Bengaluru, Karnataka, India',
      permanentAddress: 'Indiranagar, Bengaluru, Karnataka, India',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
    },
  }, candidate.id);

  // Upload required documents
  const docPan = await onboardingService.uploadDocument(candidate.id, {
    documentCode: 'PAN_CARD',
    fileName: 'pan_pooja.pdf',
    fileSize: 320000,
    mimeType: 'application/pdf',
  });
  const docAadhaar = await onboardingService.uploadDocument(candidate.id, {
    documentCode: 'AADHAAR_OR_PASSPORT',
    fileName: 'aadhaar_pooja.pdf',
    fileSize: 450000,
    mimeType: 'application/pdf',
  });
  const docDegree = await onboardingService.uploadDocument(candidate.id, {
    documentCode: 'DEGREE_CERTIFICATE',
    fileName: 'degree_pooja.pdf',
    fileSize: 520000,
    mimeType: 'application/pdf',
  });
  const docPhoto = await onboardingService.uploadDocument(candidate.id, {
    documentCode: 'PHOTO',
    fileName: 'photo_pooja.jpg',
    fileSize: 180000,
    mimeType: 'image/jpeg',
  });
  const docCheque = await onboardingService.uploadDocument(candidate.id, {
    documentCode: 'CANCELLED_CHEQUE',
    fileName: 'cheque_pooja.pdf',
    fileSize: 290000,
    mimeType: 'application/pdf',
  });

  // Submit complete onboarding form
  await onboardingService.submitForm(candidate.id, {
    personalInfo: {
      firstName: 'Pooja',
      lastName: 'Hegde',
      dateOfBirth: '1995-04-12',
      gender: 'Female',
      maritalStatus: 'Single',
      nationality: 'Indian',
    },
    contactInfo: {
      personalEmail: 'pooja.h@tasknera.com',
      mobileNumber: '+91 98765 43210',
      currentAddress: 'Indiranagar, Bengaluru, Karnataka, India',
      permanentAddress: 'Indiranagar, Bengaluru, Karnataka, India',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
    },
    emergencyContact: {
      primaryName: 'Ramesh Hegde',
      relationship: 'Parent',
      primaryPhone: '+91 98765 00000',
    },
    bankDetails: {
      accountHolderName: 'POOJA HEGDE',
      bankName: 'HDFC Bank',
      accountNumber: '50100234567890',
      ifscOrRoutingCode: 'HDFC0000123',
    },
    documents: [docPan, docAadhaar, docDegree, docPhoto, docCheque],
    declaration: {
      hasConsentedBgv: true,
      hasConfirmedAccuracy: true,
      agreedToPolicies: true,
      electronicSignature: 'Pooja Hegde',
      signatureDate: '2026-10-01',
    },
  }, candidate.id);

  // HR Document Verification & Clearance
  const verifiedCandidate = await onboardingService.reviewCandidate(candidate.id, 'VERIFY', 'All KYC documents and PAN/Aadhaar verified', ACTOR_HR_ID);
  assert(verifiedCandidate.status === 'VERIFIED', 'HR verification clears candidate');

  // Complete IT and joining checklist tasks
  for (const task of verifiedCandidate.checklist) {
    if (task.isMandatory) {
      await onboardingService.updateChecklistItem(candidate.id, task.id, { isCompleted: true }, ACTOR_HR_ID);
    }
  }
  const readyCandidate = await onboardingService.getCandidateById(candidate.id);
  assert(readyCandidate.status === 'READY_FOR_JOINING', 'Candidate checklist completion advances to READY_FOR_JOINING');

  // ---------------------------------------------------------------------------
  // 10. L&D COURSE & ASSIGNMENT
  // ---------------------------------------------------------------------------
  console.log('\n--- 10. L&D Course Enrollment & Evaluation ---');

  const securityCourse = allCourses.find((c) => c.category === 'SECURITY')!;
  assert(securityCourse !== undefined, 'Locates Mandatory Security & Compliance course');

  const enrollment = await learningService.enrollUser(securityCourse.id, {
    id: candidate.id,
    name: candidate.candidateName,
    email: candidate.email,
    department: candidate.department,
  });
  assert(enrollment.completionStatus === 'IN_PROGRESS', 'Enrollment initiated in IN_PROGRESS state');

  // Progress update and assignment submission
  const completedEnrollment = await learningService.submitAssignment(
    enrollment.id,
    'Completed zero-trust hygiene case study with full incident escalation flowchart.'
  );
  assert(completedEnrollment.completionStatus === 'COMPLETED', 'Course marked COMPLETED upon passing assignment');
  assert(completedEnrollment.progressPercent === 100, 'Learner reaches 100% curriculum progress');

  const eligibility = await learningService.evaluateCertificateEligibility(enrollment.id);
  assert(eligibility.isEligible === true, 'Confirms eligibility for official verifiable certificate');

  // ---------------------------------------------------------------------------
  // 11. STEP 9 — CERTIFICATE GENERATION & VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('\n--- 11. Certificate Generation & Verification Flow ---');

  // Step: Template -> Person/Course Details -> HR Review -> Generate Certificate -> Reference Number -> History
  const certReq = await certService.requestCertificate({
    templateId: 'tmpl_cert_course',
    recipientName: candidate.candidateName,
    recipientEmail: candidate.email,
    recipientDepartment: candidate.department,
    courseId: securityCourse.id,
    courseTitle: securityCourse.title,
    achievementDescription: 'Score 90% on Security Hygiene Assessment & Incident Escalation Simulation',
    requesterId: candidate.id,
    requesterRole: 'EMPLOYEE',
  });
  assert(certReq.status === 'PENDING_REVIEW', 'Certificate request placed in PENDING_REVIEW');

  // HR Review
  const reviewedCert = await certService.reviewCertificate(certReq.id, 'APPROVE', ACTOR_HR_ID, ACTOR_HR_ROLE, 'Coursework and capstone verified');
  assert(reviewedCert.status === 'APPROVED', 'HR approves certificate');

  // Generate Official Certificate
  const issuedCert = await certService.generateCertificate(certReq.id, ACTOR_HR_ID, ACTOR_HR_ROLE);
  assert(issuedCert.status === 'ISSUED', 'Issued official credential');
  assert(issuedCert.referenceNumber.startsWith('CERT-2026-'), 'Allocates official reference number (CERT-2026-XXXX)');
  assert(issuedCert.verificationHash.length === 64, 'Attaches cryptographic SHA-256 verification hash');

  // Public Credential Verification Lookup
  const verification = await certService.verifyCertificate(issuedCert.referenceNumber);
  assert(verification.isValid === true, 'Public lookup validates authentic credential');
  assert(verification.certificate?.recipientName === candidate.candidateName, 'Public registry matches recipient name');

  // ---------------------------------------------------------------------------
  // 12. STEP 10 — APTITUDE TESTS & QUIZZES
  // ---------------------------------------------------------------------------
  console.log('\n--- 12. Aptitude Tests & Cognitive Quizzes Execution ---');

  const aptitudeTest = allAssessments.find((t) => t.id === 'tst_apt_benchmark_01')!;
  assert(aptitudeTest !== undefined, 'Locates General Aptitude Benchmark test');

  // Timed attempt submission with numerical, logical, and verbal reasoning responses
  const attemptResult = await assessmentService.submitAttempt(
    aptitudeTest.id,
    {
      id: candidate.id,
      name: candidate.candidateName,
      email: candidate.email,
    },
    [
      { questionId: 'qst_num_01', selectedOptionIds: ['opt_2'] }, // 75% (Correct)
      { questionId: 'qst_num_02', selectedOptionIds: ['opt_2'] }, // $9,360 (Correct)
      { questionId: 'qst_log_01', selectedOptionIds: ['opt_2'] }, // 127 (Correct)
      { questionId: 'qst_log_02', selectedOptionIds: ['opt_t'] }, // True (Correct)
      { questionId: 'qst_vrb_01', selectedOptionIds: ['opt_2'] }, // Enduring (Correct)
    ],
    380 // 6 mins 20 seconds
  );

  assert(attemptResult.totalQuestions === 5, 'Evaluates all 5 test questions');
  assert(attemptResult.correctAnswersCount === 5, 'Candidate scores 5 out of 5');
  assert(attemptResult.scorePercent === 100, 'Calculates 100% score');
  assert(attemptResult.passed === true, 'Candidate passes assessment');

  const candidateHistory = assessmentService.listAttemptResults({ candidateOrEmployeeId: candidate.id });
  assert(candidateHistory.length === 1, 'Records attempt in candidate assessment history');

  console.log('\n================================================================================');
  console.log(`🎉 STEP 12 FINAL INTEGRATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStep12FinalTesting().catch((err) => {
  console.error('Fatal testing failure:', err);
  process.exit(1);
});
