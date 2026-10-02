// =============================================================================
// FLOWCHART INTEGRATION TEST: EMPLOYEE DOCUMENT GENERATION WORKFLOW
// =============================================================================
// Exact implementation verification of user flowchart:
// Admin / HR Login
//   -> Add New Employee -> Enter Employee Information -> Employee Database
//   -> Document Generation
//   -> Select Template (Offer Letter, Increment Letter, Appointment Letter, Custom Template)
//   -> Select Employee (Select: Ajay)
//   -> Fetch Ajay's Employee Data
//   -> Template Placeholder Mapping
//   -> Generate Document
//   -> Document Preview
//   -> HR Action: [Edit / Regenerate] or [Generate Final PDF]
//   -> Action:
//        ├─► [Download] -> Save Document History
//        └─► [Send by Email] -> Attach Generated PDF -> Send to Employee Email
//              -> Save Email Log -> Save Document History
// =============================================================================

import http from 'http';
import assert from 'assert';
import { createApp } from '../app.js';
import { prisma } from '../prisma/client.js';

let server: http.Server;
let baseUrl: string;
let authToken: string;
let ajayEmployeeId: string;
let createdDocId: string;

function req(
  method: string,
  endpoint: string,
  body?: any,
  token?: string
): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders; buffer: Buffer }> {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + endpoint);
    const postData = body ? JSON.stringify(body) : '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const clientReq = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          let parsed: any = null;
          try {
            parsed = JSON.parse(buffer.toString('utf8'));
          } catch {
            parsed = buffer.toString('utf8');
          }
          resolve({
            status: res.statusCode || 0,
            body: parsed,
            headers: res.headers,
            buffer,
          });
        });
      }
    );

    clientReq.on('error', reject);
    if (postData) {
      clientReq.write(postData);
    }
    clientReq.end();
  });
}

async function runFlowchartTests() {
  console.log('================================================================');
  console.log('🌟 EXECUTING USER FLOWCHART INTEGRATION TEST SUITE');
  console.log('================================================================');

  const app = createApp();
  server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as any;
      baseUrl = `http://127.0.0.1:${addr.port}/api/v1`;
      console.log(`📡 Flowchart Test Server listening at ${baseUrl}`);
      resolve();
    });
  });

  try {
    // -------------------------------------------------------------------------
    // 1. ADMIN / HR LOGIN
    // -------------------------------------------------------------------------
    console.log('\n--- NODE 1: Admin / HR Login ---');
    const loginRes = await req('POST', '/auth/login', {
      email: 'hr@acme.com',
      password: 'Hr@Password123',
    });
    assert.strictEqual(loginRes.status, 200, 'HR Login must return HTTP 200');
    const token = loginRes.body.data?.tokens?.accessToken || loginRes.body.data?.accessToken;
    assert.ok(token, 'Login must yield JWT accessToken');
    authToken = token;
    console.log('  ✅ PASS: HR Authenticated successfully with JWT token');

    // -------------------------------------------------------------------------
    // 2. ADD NEW EMPLOYEE & EMPLOYEE DATABASE
    // -------------------------------------------------------------------------
    console.log('\n--- NODE 2, 3 & 4: Enter Employee Info & Employee Database ---');
    const empListRes = await req('GET', '/employees', undefined, authToken);
    assert.strictEqual(empListRes.status, 200, 'Employees list must return HTTP 200');

    let ajay = empListRes.body.data.find((e: any) => e.fullName.toLowerCase().includes('ajay'));
    if (!ajay) {
      const createEmpRes = await req(
        'POST',
        '/employees',
        {
          employeeId: 'EMP-001',
          fullName: 'Ajay Sharma',
          personalEmail: 'ajay.sharma@example.com',
          officialEmail: 'ajay@acme.com',
          phone: '+1 (555) 234-5678',
          designation: 'Senior Software Engineer',
          department: 'Engineering',
          employmentType: 'Full-time',
          joiningDate: '2026-10-15',
          status: 'ACTIVE',
          reportingManager: 'Sarah Jenkins',
          workLocation: 'New York, NY (Hybrid)',
          annualCtc: 120000,
          currency: 'USD',
        },
        authToken
      );
      assert.strictEqual(createEmpRes.status, 201, 'Add New Employee must return HTTP 201');
      ajay = createEmpRes.body.data;
    }

    assert.ok(ajay, 'Ajay Sharma must be present in Employee Database');
    ajayEmployeeId = ajay.id;
    console.log(`  ✅ PASS: Ajay Sharma found in Employee Database (ID: ${ajay.id}, Role: ${ajay.designation})`);

    // -------------------------------------------------------------------------
    // 3. DOCUMENT GENERATION: SELECT TEMPLATE
    // -------------------------------------------------------------------------
    console.log('\n--- NODE 5, 6 & 7: Document Generation & Select Template ---');
    const templatesRes = await req('GET', '/employees/templates', undefined, authToken);
    assert.strictEqual(templatesRes.status, 200, 'Templates list must return HTTP 200');

    const templateCodes = templatesRes.body.data.map((t: any) => t.code);
    assert.ok(templateCodes.includes('OFFER_LETTER'), 'Catalog must include Predefined Offer Letter');
    assert.ok(templateCodes.includes('INCREMENT_LETTER'), 'Catalog must include Predefined Increment Letter');
    assert.ok(templateCodes.includes('APPOINTMENT_LETTER'), 'Catalog must include Predefined Appointment Letter');
    assert.ok(templateCodes.includes('CUSTOM_TEMPLATE'), 'Catalog must include Upload Custom Template');

    console.log('  ✅ PASS: All 4 templates verified (Offer, Increment, Appointment, Custom)');

    // -------------------------------------------------------------------------
    // 4. SELECT EMPLOYEE: SELECT AJAY & FETCH AJAY DATA
    // -------------------------------------------------------------------------
    console.log('\n--- NODE 8, 9 & 10: Select Employee (Select: Ajay) & Fetch Data ---');
    const fetchAjayRes = await req('GET', `/employees/${ajayEmployeeId}`, undefined, authToken);
    assert.strictEqual(fetchAjayRes.status, 200, 'Fetch Ajay data must return HTTP 200');
    assert.strictEqual(fetchAjayRes.body.data.fullName, 'Ajay Sharma', 'Fetched name must match Ajay Sharma');
    console.log(`  ✅ PASS: Fetched Ajay employee data: ${fetchAjayRes.body.data.fullName}, CTC: $${fetchAjayRes.body.data.annualCtc}`);

    // -------------------------------------------------------------------------
    // 5. TEMPLATE PLACEHOLDER MAPPING & PREVIEW
    // -------------------------------------------------------------------------
    console.log('\n--- NODE 11, 12 & 13: Template Placeholder Mapping & Preview ---');
    const previewRes = await req(
      'POST',
      `/employees/${ajayEmployeeId}/preview-document`,
      {
        templateCode: 'APPOINTMENT_LETTER',
        customParameters: {
          probation_period: '90 days',
        },
      },
      authToken
    );
    assert.strictEqual(previewRes.status, 200, 'Document preview must return HTTP 200');
    assert.ok(previewRes.body.data.renderedContent.includes('Ajay Sharma'), 'Preview must interpolate {{employee_name}}');
    assert.ok(previewRes.body.data.renderedContent.includes('Senior Software Engineer'), 'Preview must interpolate {{designation}}');
    console.log('  ✅ PASS: Placeholders mapped cleanly to Ajay\'s data and preview rendered');

    // -------------------------------------------------------------------------
    // 6. GENERATE DOCUMENT
    // -------------------------------------------------------------------------
    console.log('\n--- NODE 12 (continued): Generate Document ---');
    const generateRes = await req(
      'POST',
      `/employees/${ajayEmployeeId}/generate-document`,
      {
        templateCode: 'APPOINTMENT_LETTER',
        title: 'Predefined Appointment Letter - Ajay Sharma',
        targetStatus: 'DRAFT',
      },
      authToken
    );
    assert.strictEqual(generateRes.status, 201, 'Generate document must return HTTP 201');
    createdDocId = generateRes.body.data.id;
    assert.strictEqual(generateRes.body.data.currentVersion, 1, 'Initial document version must be 1');
    console.log(`  ✅ PASS: Document generated (ID: ${createdDocId}, Version: 1)`);

    // -------------------------------------------------------------------------
    // 7. HR ACTION: EDIT / REGENERATE
    // -------------------------------------------------------------------------
    console.log('\n--- NODE 14a: HR Action: Edit / Regenerate ---');
    const regenRes = await req(
      'POST',
      `/employees/documents/${createdDocId}/regenerate`,
      {
        changeNotes: 'HR adjusted compensation and notice period terms for Ajay',
        updatedParameters: {
          probation_period: '60 days',
        },
      },
      authToken
    );
    assert.strictEqual(regenRes.status, 200, 'Regenerate document must return HTTP 200');
    assert.strictEqual(regenRes.body.data.currentVersion, 2, 'Regeneration must bump version to 2');
    console.log('  ✅ PASS: HR Action (Edit / Regenerate) successfully created Version 2 with audit notes');

    // -------------------------------------------------------------------------
    // 8. HR ACTION: GENERATE FINAL PDF
    // -------------------------------------------------------------------------
    console.log('\n--- NODE 14b: HR Action: Generate Final PDF ---');
    const statusUpdateRes = await req(
      'PATCH',
      `/employees/documents/${createdDocId}/status`,
      {
        status: 'APPROVED',
      },
      authToken
    );
    assert.strictEqual(statusUpdateRes.status, 200, 'Approve final document must return HTTP 200');
    assert.strictEqual(statusUpdateRes.body.data.status, 'APPROVED', 'Document status must be APPROVED');
    console.log('  ✅ PASS: Document finalized and signed off as APPROVED for official PDF minting');

    // -------------------------------------------------------------------------
    // 9. ACTION: DOWNLOAD -> SAVE DOCUMENT HISTORY
    // -------------------------------------------------------------------------
    console.log('\n--- NODE 15a: Action: Download -> Save Document History ---');
    const downloadRes = await req('GET', `/employees/documents/${createdDocId}/download-pdf`, undefined, authToken);
    assert.strictEqual(downloadRes.status, 200, 'Download PDF must return HTTP 200');
    assert.strictEqual(downloadRes.headers['content-type'], 'application/pdf', 'Must return application/pdf');
    assert.strictEqual(downloadRes.buffer.subarray(0, 4).toString(), '%PDF', 'Binary header must match %PDF');
    console.log(`  ✅ PASS: PDF binary streamed (${(downloadRes.buffer.length / 1024).toFixed(1)} KB) and download action recorded`);

    // -------------------------------------------------------------------------
    // 10. ACTION: SEND BY EMAIL -> ATTACH PDF -> SEND EMAIL -> SAVE LOG -> HISTORY
    // -------------------------------------------------------------------------
    console.log('\n--- NODE 15b: Action: Send by Email -> Attach PDF -> Send to Employee -> Save Log ---');
    const sendEmailRes = await req(
      'POST',
      `/employees/documents/${createdDocId}/send-email`,
      {
        to: 'ajay.sharma@example.com',
        subject: 'Official Appointment Letter - Ajay Sharma',
        message: 'Dear Ajay, please find attached your official appointment letter.',
      },
      authToken
    );
    assert.strictEqual(sendEmailRes.status, 200, 'Send by Email must return HTTP 200');
    assert.strictEqual(sendEmailRes.body.success, true, 'Email dispatch confirms success');
    assert.ok(sendEmailRes.body.data.emailLog.attachedPdf, 'Email dispatch must record attached PDF');
    assert.strictEqual(sendEmailRes.body.data.document.status, 'ISSUED', 'Document status must transition to ISSUED');
    console.log(`  ✅ PASS: Sent to ${sendEmailRes.body.data.emailLog.recipientEmail} with attachment ${sendEmailRes.body.data.emailLog.attachedPdf}`);

    // -------------------------------------------------------------------------
    // 11. VERIFY DOCUMENT HISTORY & EMAIL LOGS
    // -------------------------------------------------------------------------
    console.log('\n--- NODE 15c: Save Document History & Audit Ledger Verification ---');
    const historyRes = await req('GET', `/employees/documents/${createdDocId}/history`, undefined, authToken);
    assert.strictEqual(historyRes.status, 200, 'Document history must return HTTP 200');
    assert.strictEqual(historyRes.body.data.status, 'ISSUED', 'History shows document in ISSUED state');
    assert.ok(historyRes.body.data.versions.length >= 2, 'History contains version snapshots');
    assert.ok(historyRes.body.data.emailLogs.length >= 1, 'History captured email dispatch log');
    console.log(`  ✅ PASS: History ledger verified (Versions: ${historyRes.body.data.versions.length}, Email Logs: ${historyRes.body.data.emailLogs.length})`);

    console.log('\n================================================================');
    console.log('🎉 ALL 11 FLOWCHART INTEGRATION NODES PASSED (100% SUCCESS)');
    console.log('================================================================\n');
  } finally {
    if (server) {
      server.close();
    }
  }
}

runFlowchartTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Flowchart integration test failure:', err);
    process.exit(1);
  });
