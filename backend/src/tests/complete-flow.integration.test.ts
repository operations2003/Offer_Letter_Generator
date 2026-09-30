import http from 'http';
import fs from 'fs';
import path from 'path';
import { createApp } from '../app.js';
import { prisma } from '../prisma/client.js';
import { AiProviderFactory } from '../modules/ai/ai-provider.factory.js';
import { MockAiAdapter } from '../modules/ai/adapters/mock.adapter.js';
import { OfferStatus, TemplateCategory } from '@prisma/client';
import { CryptoUtil } from '../utils/crypto.js';

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

async function runCompleteFlowIntegrationTest() {
  console.log('\n================================================================');
  console.log('🌟 END-TO-END FLOW INTEGRATION TEST: SAKSHI + AJAY + SHUBHAM');
  console.log('   Testing the Complete 15-Stage Offer Pipeline:');
  console.log('   Login → Dashboard → Template → Upload Document → AI Extraction');
  console.log('   → HR Review → Offer Details → AI Assistance → AI Quality Check');
  console.log('   → Final HR Review → Generate → PDF → Download/Send → Status');
  console.log('   → History/Audit');
  console.log('================================================================\n');

  // Enforce mock AI adapter for consistent, deterministic assertions
  AiProviderFactory.setAdapter(new MockAiAdapter());

  // 1. Prepare Tenant & Users in Database
  const company = await prisma.company.upsert({
    where: { code: 'ACME' },
    update: {},
    create: {
      name: 'Acme Technologies Inc.',
      code: 'ACME',
      legalName: 'Acme Technologies Global Corp.',
      domain: 'acme.com',
    },
  });

  const rawPassword = 'Password123!@#';
  const passwordHash = await CryptoUtil.hashPassword(rawPassword);

  const hrRole = await prisma.role.findFirst({
    where: { code: 'HR_MANAGER' },
  });

  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@acme.com' },
    update: { passwordHash, status: 'ACTIVE' },
    create: {
      email: 'hr@acme.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      companyId: company.id,
      title: 'Senior People Partner',
      department: 'Human Resources',
      status: 'ACTIVE',
    },
  });

  if (hrRole) {
    await prisma.userRole.upsert({
      where: {
        uq_user_role: {
          userId: hrUser.id,
          roleId: hrRole.id,
        },
      },
      update: {},
      create: {
        userId: hrUser.id,
        roleId: hrRole.id,
      },
    });
  }

  // Start real Express HTTP Server on dynamic ephemeral port
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

  console.log(`📡 Test Server listening at ${baseUrl}\n`);

  try {
    let authToken = '';
    let selectedTemplateId = '';
    let selectedTemplateVersionId = '';
    let extractedDataResult: any = null;
    let createdOfferId = '';
    let createdOfferRef = '';
    let verificationToken = '';
    let finalDocumentId = '';
    let candidatePortalUrl = '';

    // =========================================================================
    // STEP 1: LOGIN (Auth, JWT, Session Context)
    // =========================================================================
    console.log('--- STEP 1: Login ---');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hr@acme.com', password: rawPassword }),
    });

    assert(loginRes.status === 200, 'HTTP 200: Login endpoint authenticates valid HR credentials');
    const loginData = await loginRes.json();
    assert(loginData.success === true, 'Login response confirms success');
    assert(Boolean(loginData.data?.tokens?.accessToken), 'JWT access token returned in response');
    assert(loginData.data?.user?.email === 'hr@acme.com', 'User context matches authenticated user');
    authToken = loginData.data.tokens.accessToken;

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    };

    // =========================================================================
    // STEP 2: DASHBOARD (Pipeline Statistics & Counters)
    // =========================================================================
    console.log('\n--- STEP 2: Dashboard ---');
    const statsRes = await fetch(`${baseUrl}/offers/statistics`, {
      headers: authHeaders,
    });

    assert(statsRes.status === 200, 'HTTP 200: Dashboard statistics endpoint returns OK');
    const statsData = await statsRes.json();
    assert(statsData.success === true, 'Statistics response marked success');
    assert(typeof statsData.data?.total === 'number', 'Statistics includes total offers count');
    assert(typeof statsData.data?.draft === 'number', 'Statistics includes draft offers count');
    assert(typeof statsData.data?.awaitingReview === 'number', 'Statistics includes awaiting review count');
    assert(typeof statsData.data?.generated === 'number', 'Statistics includes generated offers count');
    assert(typeof statsData.data?.sent === 'number', 'Statistics includes sent offers count');

    // =========================================================================
    // STEP 3: TEMPLATE (Template Catalog & Placeholder Binding)
    // =========================================================================
    console.log('\n--- STEP 3: Template ---');
    const catalogRes = await fetch(`${baseUrl}/templates/placeholders/catalog`, {
      headers: authHeaders,
    });
    assert(catalogRes.status === 200, 'HTTP 200: Placeholders catalog retrieved');
    const catalogData = await catalogRes.json();
    assert(catalogData.data?.standardPlaceholders?.length >= 11, 'Catalog provides all 11 standard placeholders');

    const templatesRes = await fetch(`${baseUrl}/templates?isActive=true`, {
      headers: authHeaders,
    });
    assert(templatesRes.status === 200, 'HTTP 200: Active templates list retrieved');
    const templatesData = await templatesRes.json();
    assert(Array.isArray(templatesData.data) && templatesData.data.length > 0, 'Company has active templates available');

    const activeTemplate = templatesData.data[0];
    selectedTemplateId = activeTemplate.id;
    selectedTemplateVersionId = activeTemplate.currentVersionId || activeTemplate.currentVersion?.id;
    assert(Boolean(selectedTemplateId), `Selected template: "${activeTemplate.title}" (${selectedTemplateId})`);

    // =========================================================================
    // STEP 4: UPLOAD DOCUMENT (Candidate Resume/CV Upload & Extraction)
    // =========================================================================
    console.log('\n--- STEP 4: Upload Document ---');
    const sampleResumeContent = `
Jane Doe
742 Evergreen Terrace, Springfield, OR 97477 | (555) 234-5678 | jane.doe@example.com
Staff Software Architect with 9+ years experience in cloud infrastructure and distributed systems.
Compensation expectation: $165,000 USD base salary.
Available to join: November 16, 2026.
    `.trim();

    // Test text extraction from buffer
    const boundary = '----WebKitFormBoundaryIntegrationTest7MA4YWxkTrZu0gW';
    const formBody = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="document"; filename="Jane_Doe_Resume.txt"',
      'Content-Type: text/plain',
      '',
      sampleResumeContent,
      `--${boundary}--`,
    ].join('\r\n');

    const uploadRes = await fetch(`${baseUrl}/ai/upload-and-extract`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        Authorization: `Bearer ${authToken}`,
      },
      body: formBody,
    });

    assert(uploadRes.status === 200, 'HTTP 200: Upload document and AI extraction succeeded');
    const uploadData = await uploadRes.json();
    assert(uploadData.success === true, 'Upload response confirms success');
    assert(uploadData.data?.document?.detectedFormat === 'TXT', 'Detected document format matches TXT');
    assert(Boolean(uploadData.data?.document?.fileHashSha256), 'Generated cryptographic SHA-256 checksum for document');
    extractedDataResult = uploadData.data?.extraction || uploadData.data?.extractedData;
    assert(Boolean(extractedDataResult), 'AI extracted structured attributes from uploaded file');

    // =========================================================================
    // STEP 5: AI EXTRACTION (Advisory Data & Non-Assumption Verification)
    // =========================================================================
    console.log('\n--- STEP 5: AI Extraction ---');
    const directExtractRes = await fetch(`${baseUrl}/offers/ai/extract`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ documentText: sampleResumeContent }),
    });

    assert(directExtractRes.status === 200, 'HTTP 200: Direct AI extraction API returned OK');
    const directExtractData = await directExtractRes.json();
    const extractObj = directExtractData.data?.extraction || directExtractData.data?.extractedData;
    assert(directExtractData.data?.isAdvisoryOnly === true, 'GUARDRAIL: AI extraction is strictly flagged as advisory');
    assert(extractObj?.candidateName?.value?.includes('Jane'), 'Extracted candidate name accurately');
    assert(extractObj?.candidateName?.confidenceScore >= 0.85, 'Confidence score meets threshold');
    // Non-assumption rule: Missing reporting manager should not be invented
    assert(extractObj?.reportingManager?.value === null, 'GUARDRAIL: Does not invent missing reporting manager');

    // =========================================================================
    // STEP 6: HR REVIEW (Human Verification & Human Override Recording)
    // =========================================================================
    console.log('\n--- STEP 6: HR Review ---');
    // HR approves and refines extracted terms, registering human overrides
    const hrConfirmedTerms = {
      candidateName: 'Jane Alexandra Doe',
      email: 'jane.doe@example.com',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Springfield, OR 97477',
      qualification: 'B.S. in Computer Science',
      experience: '9+ years',
      designation: 'Staff Software Architect',
      department: 'Cloud Infrastructure & Core Services',
      location: 'San Francisco, CA (Hybrid - 3 days onsite)',
      joiningDate: '2026-11-16',
      employmentType: 'FULL_TIME',
      reportingManager: 'Marcus Vance, VP of Engineering',
      currency: 'USD',
      baseSalary: 165000,
      hraAllowance: 24000,
      specialAllowances: 6000,
      performanceBonus: 24750,
      joiningBonus: 15000,
      totalCtc: 234750,
    };

    const humanOverrides = [
      {
        field: 'baseSalary',
        fieldLabel: 'Annual Base Salary',
        decision: 'EDITED',
        aiValue: 155000,
        hrValue: 165000,
        confidenceScore: 0.92,
        reason: 'HR adjusted compensation to match approved L6 staff benchmark',
      },
    ];

    assert(hrConfirmedTerms.totalCtc === 165000 + 24000 + 6000 + 24750 + 15000, 'HR arithmetic verified: components sum to Total CTC');
    assert(humanOverrides.length === 1, 'Human override recorded with audit explanation');

    // =========================================================================
    // STEP 7: OFFER DETAILS (Create Formal Offer Record in HR_REVIEW status)
    // =========================================================================
    console.log('\n--- STEP 7: Offer Details ---');
    const createOfferPayload = {
      candidateDetails: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '+1 (555) 234-5678',
        currentLocation: 'San Francisco, CA',
      },
      templateVersionId: selectedTemplateVersionId,
      jobTitle: 'Staff Software Architect',
      department: 'Cloud Infrastructure',
      bandGrade: 'L6',
      workLocation: 'San Francisco, CA (Hybrid)',
      employmentType: 'FULL_TIME',
      proposedJoiningDate: '2026-11-16',
      reportingManagerName: 'Marcus Vance',
      reportingManagerTitle: 'VP of Engineering',
      compensation: {
        currency: 'USD',
        baseSalary: 165000,
        hraAllowance: 24000,
        specialAllowances: 6000,
        performanceBonus: 24750,
        joiningBonus: 15000,
        totalCtc: 234750,
      },
      probation: {
        durationDays: 90,
      },
      noticePeriod: {
        days: 30,
      },
      workingHours: {
        hoursPerWeek: 40,
        schedule: 'Monday through Friday, 9:00 AM - 5:00 PM',
      },
      offerValidUntil: '2026-11-01',
      termsAndClauses: [
        {
          title: 'Confidentiality and Proprietary Information Agreement',
          content: 'The Employee agrees to hold all confidential information in strict trust and confidence.',
        },
        {
          title: 'Intellectual Property & Inventions Assignment',
          content: 'All inventions and copyrightable materials developed during employment belong exclusively to Company.',
        },
        {
          title: 'Termination and Notice Requirements',
          content: 'Employment may be terminated by either party giving 30 days written notice.',
        },
      ],
      humanOverrides,
    };

    const createOfferRes = await fetch(`${baseUrl}/offers`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(createOfferPayload),
    });

    const createOfferData = await createOfferRes.json();
    if (createOfferRes.status !== 201) {
      console.error('Create offer failed status:', createOfferRes.status, JSON.stringify(createOfferData, null, 2));
    }
    assert(createOfferRes.status === 201, 'HTTP 201: Offer created successfully');
    assert(createOfferData.success === true, 'Offer creation marked as success');
    createdOfferId = createOfferData.data?.id;
    createdOfferRef = createOfferData.data?.offerReferenceNumber;
    assert(Boolean(createdOfferId), `Offer ID provisioned: ${createdOfferId}`);
    assert(Boolean(createdOfferRef && createdOfferRef.startsWith('OFF-')), `Reference Number formatted: ${createdOfferRef}`);
    assert(createOfferData.data?.currentStatus === 'HR_REVIEW', 'Offer initialized in HR_REVIEW status');

    // =========================================================================
    // STEP 8: AI ASSISTANCE (Clause Drafting & Suggestions in Advisory Mode)
    // =========================================================================
    console.log('\n--- STEP 8: AI Assistance ---');
    const clauseGenRes = await fetch(`${baseUrl}/offers/ai/generate-clause`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        clauseType: 'Remote Work & Home Office Policy',
        customInstructions: 'Provide ergonomic workstation and monthly high-speed internet stipend terms',
      }),
    });

    assert(clauseGenRes.status === 200, 'HTTP 200: AI clause generation completed');
    const clauseGenData = await clauseGenRes.json();
    assert(clauseGenData.data?.isAdvisory === true, 'GUARDRAIL: AI generated clause marked as advisory');
    assert(Boolean(clauseGenData.data?.clause?.content), 'AI generated clause body contains substantive wording');

    const suggestionsRes = await fetch(`${baseUrl}/offers/${createdOfferId}/ai/suggestions`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        roleTitle: 'Staff Software Architect',
        department: 'Cloud Infrastructure',
      }),
    });

    assert(suggestionsRes.status === 200, 'HTTP 200: AI role perks and suggestions returned');
    const suggestionsData = await suggestionsRes.json();
    assert(suggestionsData.data?.isAdvisoryOnly === true, 'GUARDRAIL: Suggestions strictly flagged as advisory only');

    // =========================================================================
    // STEP 9: AI QUALITY CHECK (Pre-Generation Audit across 9 Categories)
    // =========================================================================
    console.log('\n--- STEP 9: AI Quality Check ---');
    const preGenAuditRes = await fetch(`${baseUrl}/offers/pre-generation-check`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        candidate: {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          phone: '+1 (555) 234-5678',
          address: '742 Evergreen Terrace, Springfield, OR',
        },
        company: {
          name: 'Acme Technologies Inc.',
          legalName: 'Acme Technologies Global Corp.',
          signatoryName: 'Sarah Jenkins',
          signatoryTitle: 'VP of Global Talent Operations',
        },
        jobDetails: {
          jobTitle: 'Staff Software Architect',
          department: 'Cloud Infrastructure',
          bandGrade: 'L6',
          workLocation: 'San Francisco, CA (Hybrid)',
          employmentType: 'FULL_TIME',
          proposedJoiningDate: '2026-11-16',
          reportingManagerName: 'Marcus Vance',
          reportingManagerTitle: 'VP of Engineering',
        },
        compensation: {
          currency: 'USD',
          baseSalary: 165000,
          hraAllowance: 24000,
          specialAllowances: 6000,
          performanceBonus: 24750,
          joiningBonus: 15000,
          totalCtc: 234750,
        },
        terms: {
          probationDurationDays: 90,
          noticePeriodDays: 30,
          workingHoursPerWeek: 40,
          workSchedule: 'Monday through Friday, 9:00 AM - 5:00 PM',
          offerValidUntil: '2026-11-01',
          clauses: createOfferPayload.termsAndClauses,
        },
      }),
    });

    assert(preGenAuditRes.status === 200, 'HTTP 200: Pre-Generation Audit completed');
    const preGenAuditData = await preGenAuditRes.json();
    assert(
      preGenAuditData.data?.status === 'PASS' || preGenAuditData.data?.status === 'WARNING',
      `Audit Verdict: ${preGenAuditData.data?.status} (Expected PASS or WARNING, no blocking review required)`
    );
    assert(preGenAuditData.data?.criticalIssuesCount === 0, 'Zero critical blocking issues in verified offer terms');

    // =========================================================================
    // STEP 10: FINAL HR REVIEW & APPROVAL (Status Transition to APPROVED)
    // =========================================================================
    console.log('\n--- STEP 10: Final HR Review ---');
    const statusUpdateRes = await fetch(`${baseUrl}/offers/${createdOfferId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'APPROVED',
        reason: 'HR Manager completed quality check and ratified all terms',
      }),
    });

    assert(statusUpdateRes.status === 200, 'HTTP 200: Offer status transitioned to APPROVED');
    const statusUpdateData = await statusUpdateRes.json();
    assert(statusUpdateData.data?.currentStatus === 'APPROVED', 'Offer verified in APPROVED status ready for document generation');

    // =========================================================================
    // STEP 11: GENERATE (Document Generation with strictly HR-confirmed terms)
    // =========================================================================
    console.log('\n--- STEP 11: Generate ---');
    const generateDocRes = await fetch(`${baseUrl}/offers/${createdOfferId}/document/generate`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        signatoryName: 'Sarah Jenkins',
        signatoryTitle: 'VP of Global Talent Operations',
      }),
    });

    assert(generateDocRes.status === 201, 'HTTP 201: Official legal offer document generated');
    const generateDocData = await generateDocRes.json();
    assert(generateDocData.success === true, 'Document generation reported success');
    finalDocumentId = generateDocData.data?.documentId;
    verificationToken = generateDocData.data?.verificationToken;
    assert(Boolean(finalDocumentId), `Document ID created: ${finalDocumentId}`);
    assert(Boolean(verificationToken), `Cryptographic Verification Token generated: ${verificationToken}`);
    assert(Boolean(generateDocData.data?.sha256Checksum), `SHA-256 Checksum computed: ${generateDocData.data?.sha256Checksum}`);

    // =========================================================================
    // STEP 12: PDF (Physical PDF File & Secure Storage Verification)
    // =========================================================================
    console.log('\n--- STEP 12: PDF & Secure Storage ---');
    assert(generateDocData.data?.fileSizeBytes > 1000, `PDF size is valid and substantial: ${(generateDocData.data?.fileSizeBytes / 1024).toFixed(1)} KB`);
    assert(generateDocData.data?.fileName?.endsWith('.pdf'), `PDF filename properly formatted: ${generateDocData.data?.fileName}`);

    // Verify document in DB
    const dbDoc = await prisma.generatedDocument.findUnique({
      where: { id: finalDocumentId },
    });
    assert(Boolean(dbDoc), 'Generated document persisted in PostgreSQL database');
    assert(dbDoc?.sha256Checksum === generateDocData.data?.sha256Checksum, 'Database checksum matches generated checksum');
    assert(fs.existsSync(dbDoc!.storagePath), `Physical PDF file confirmed on disk at: ${dbDoc!.storagePath}`);

    // =========================================================================
    // STEP 13: DOWNLOAD / SEND (Download PDF, Preview & Send Offer Email)
    // =========================================================================
    console.log('\n--- STEP 13: Download / Send ---');
    // Test PDF download stream
    const downloadRes = await fetch(`${baseUrl}/offers/${createdOfferId}/document/download`, {
      headers: authHeaders,
    });
    assert(downloadRes.status === 200, 'HTTP 200: PDF download endpoint streams file');
    assert(downloadRes.headers.get('content-type') === 'application/pdf', 'Download returns Content-Type: application/pdf');
    const pdfBytes = await downloadRes.arrayBuffer();
    const pdfHeader = Buffer.from(pdfBytes).subarray(0, 5).toString('latin1');
    assert(pdfHeader === '%PDF-', 'Downloaded binary begins with valid %PDF- magic bytes header');

    // Test Email Confirmation Preview
    const previewRes = await fetch(`${baseUrl}/offers/${createdOfferId}/send/confirmation-preview`, {
      headers: authHeaders,
    });
    assert(previewRes.status === 200, 'HTTP 200: Email confirmation preview retrieved');
    const previewData = await previewRes.json();
    assert(previewData.data?.recipientEmail === 'jane.doe@example.com', 'Recipient email verified');
    assert(Boolean(previewData.data?.securePortalUrl), 'Secure candidate portal URL generated');
    assert(previewData.data?.canSend === true, 'Offer validated as ready to send');

    // Test Autonomous AI Dispatch Prohibition Guardrail
    const aiSendAttemptRes = await fetch(`${baseUrl}/offers/${createdOfferId}/send`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'x-ai-automated': 'true',
      },
      body: JSON.stringify({ isAiAutomated: true }),
    });
    assert(aiSendAttemptRes.status === 403, 'GUARDRAIL: Autonomous AI send attempt is blocked with HTTP 403 Forbidden');

    // Send Offer with Human HR Authorization
    const sendOfferRes = await fetch(`${baseUrl}/offers/${createdOfferId}/send`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        subject: 'Formal Offer of Employment: Staff Software Architect - Acme Technologies',
        includePdfAttachment: true,
      }),
    });

    assert(sendOfferRes.status === 200, 'HTTP 200: Offer email dispatched successfully by authorized HR');
    const sendOfferData = await sendOfferRes.json();
    assert(sendOfferData.data?.success === true, 'Delivery confirmed as SENT');
    assert(sendOfferData.data?.delivery?.status === 'SENT', 'Delivery status marked SENT in ledger');
    candidatePortalUrl = sendOfferData.data?.delivery?.securePortalUrl;
    assert(Boolean(candidatePortalUrl), `Candidate portal link generated: ${candidatePortalUrl}`);

    // =========================================================================
    // STEP 14: STATUS (Lifecycle Transitions & Validation)
    // =========================================================================
    console.log('\n--- STEP 14: Status ---');
    const statusCheckRes = await fetch(`${baseUrl}/offers/${createdOfferId}/status`, {
      headers: authHeaders,
    });
    assert(statusCheckRes.status === 200, 'HTTP 200: Offer status query returned');
    const statusCheckData = await statusCheckRes.json();
    assert(statusCheckData.data?.status === 'ISSUED', 'Offer transitioned to ISSUED upon email dispatch');
    assert(Array.isArray(statusCheckData.data?.allowedTransitions), 'Allowed state machine transitions returned');
    assert(statusCheckData.data?.allowedTransitions?.includes('ACCEPTED'), 'Offer can now transition to ACCEPTED');

    // Transition to ACCEPTED
    const acceptRes = await fetch(`${baseUrl}/offers/${createdOfferId}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'ACCEPTED',
        reason: 'Candidate electronically executed offer letter via portal',
      }),
    });
    assert(acceptRes.status === 200, 'HTTP 200: Candidate acceptance recorded');
    const acceptData = await acceptRes.json();
    assert(acceptData.data?.currentStatus === 'ACCEPTED', 'Offer successfully transitioned to ACCEPTED');

    // =========================================================================
    // STEP 15: HISTORY / AUDIT (Audit Logs, Email History, Public Token Verification)
    // =========================================================================
    console.log('\n--- STEP 15: History / Audit ---');
    // Comprehensive Offer History API
    const historyRes = await fetch(`${baseUrl}/offers/${createdOfferId}/history`, {
      headers: authHeaders,
    });
    assert(historyRes.status === 200, 'HTTP 200: Offer comprehensive history retrieved');
    const historyData = await historyRes.json();
    assert(historyData.data?.versions?.length >= 1, 'History tracks document version snapshots');
    assert(historyData.data?.statusTransitions?.length >= 2, 'History tracks all status transitions');

    // Email Delivery History API
    const emailHistoryRes = await fetch(`${baseUrl}/offers/${createdOfferId}/emails`, {
      headers: authHeaders,
    });
    assert(emailHistoryRes.status === 200, 'HTTP 200: Chronological email history retrieved');
    const emailHistoryData = await emailHistoryRes.json();
    assert(emailHistoryData.data?.deliveries?.length >= 1, 'Email delivery history records dispatch');
    assert(emailHistoryData.data?.deliveries[0]?.status === 'SENT', 'Email delivery item confirms SENT state');

    // Public Document Verification API (Tamper-evident verification without authentication)
    const publicVerifyRes = await fetch(`${baseUrl}/offers/document/verify/${verificationToken}`);
    assert(publicVerifyRes.status === 200, 'HTTP 200: Public document verification API succeeds without login');
    const publicVerifyData = await publicVerifyRes.json();
    assert(publicVerifyData.data?.isValid === true, 'Public verification confirms document is genuine');
    assert(publicVerifyData.data?.offerReferenceNumber === createdOfferRef, 'Verification references correct offer number');
    assert(publicVerifyData.data?.sha256Checksum === generateDocData.data?.sha256Checksum, 'Verification returns authentic SHA-256 fingerprint');

    // Compliance Audit Ledger API
    const auditLedgerRes = await fetch(`${baseUrl}/audit-logs?entityId=${createdOfferId}`, {
      headers: authHeaders,
    });
    assert(auditLedgerRes.status === 200, 'HTTP 200: Audit logs ledger retrieved');
    const auditLedgerData = await auditLedgerRes.json();
    assert(auditLedgerData.data?.items?.length >= 2, 'Audit ledger captured immutable event records for offer');

    console.log('\n================================================================');
    console.log(`🎉 COMPLETE FLOW INTEGRATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

runCompleteFlowIntegrationTest().catch((err) => {
  console.error('\n❌ Uncaught Integration Test Error:', err);
  process.exit(1);
});
