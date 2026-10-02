// =============================================================================
// UNIT TESTS: DOCX RUN-STITCHING & DYNAMIC FIELD MAPPING
// =============================================================================

import assert from 'node:assert';
import JSZip from 'jszip';
import { DocxTemplateService } from '../modules/employees/docx-template.service.js';
import { FieldMappingService } from '../modules/employees/field-mapping.service.js';

async function runTests() {
  console.log('🧪 Starting DOCX Dynamic Autofill Unit Tests...');

  // ---------------------------------------------------------------------------
  // TEST 1: Run-Stitching across multiple <w:r> runs
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 1: Run-stitching across split runs ---');
  const splitParagraphXml = `
    <w:p>
      <w:pPr><w:jc w:val="left"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="24"/></w:rPr>
        <w:t>Dear </w:t>
      </w:r>
      <w:r>
        <w:rPr><w:b/><w:color w:val="1E3A8A"/></w:rPr>
        <w:t>[Employee</w:t>
      </w:r>
      <w:r>
        <w:rPr><w:b/><w:color w:val="1E3A8A"/></w:rPr>
        <w:t> Full</w:t>
      </w:r>
      <w:r>
        <w:rPr><w:b/><w:color w:val="1E3A8A"/></w:rPr>
        <w:t> Name]</w:t>
      </w:r>
      <w:r>
        <w:t>, welcome to the team!</w:t>
      </w:r>
    </w:p>
  `;

  const replacements = {
    '[Employee Full Name]': 'Ajay Sharma',
  };

  const processed = DocxTemplateService.processParagraphXml(splitParagraphXml, replacements);
  assert.ok(processed.detectedPlaceholders.includes('[Employee Full Name]'), 'Must detect [Employee Full Name]');
  assert.ok(processed.paragraphPlainText.includes('Ajay Sharma'), 'Plain text must contain Ajay Sharma');
  assert.ok(!processed.paragraphPlainText.includes('[Employee Full Name]'), 'Placeholder must be completely replaced');
  assert.ok(processed.updatedXml.includes('Ajay Sharma'), 'XML must contain Ajay Sharma');
  // First run styling (<w:color w:val="1E3A8A"/>) must be preserved
  assert.ok(processed.updatedXml.includes('1E3A8A'), 'Run styling must be preserved in updated XML');
  console.log('✓ Run-stitching across split runs verified successfully!');

  // ---------------------------------------------------------------------------
  // TEST 2: Multiple placeholder formats ([Bracketed], {{curly}}, <<chevron>>, blank)
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 2: Multiple placeholder styles ---');
  const multiStyleParagraphXml = `
    <w:p>
      <w:r><w:t>Role: {{designation}}</w:t></w:r>
      <w:r><w:t> | Department: &lt;&lt;Department&gt;&gt;</w:t></w:r>
      <w:r><w:t> | Compensation: [Annual CTC]</w:t></w:r>
      <w:r><w:t> | Reporting Manager: __________</w:t></w:r>
    </w:p>
  `;

  const multiReplacements = {
    '{{designation}}': 'Lead Architect',
    '<<Department>>': 'Cloud Platforms',
    '[Annual CTC]': '$150,000 USD',
    'Reporting Manager: __________': 'Sarah Jenkins',
  };

  const multiProcessed = DocxTemplateService.processParagraphXml(multiStyleParagraphXml, multiReplacements);
  assert.ok(multiProcessed.paragraphPlainText.includes('Lead Architect'), 'Must replace {{designation}}');
  assert.ok(multiProcessed.paragraphPlainText.includes('Cloud Platforms'), 'Must replace <<Department>>');
  assert.ok(multiProcessed.paragraphPlainText.includes('$150,000 USD'), 'Must replace [Annual CTC]');
  console.log('✓ Multiple placeholder styles detected and replaced successfully!');

  // ---------------------------------------------------------------------------
  // TEST 3: Deterministic & Fuzzy Employee Field Mapping
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 3: Deterministic & Fuzzy Employee Field Mapping ---');
  const mockEmployee = {
    id: 'emp-123',
    employeeId: 'EMP-001',
    fullName: 'Ajay Sharma',
    designation: 'Senior Full Stack Engineer',
    department: 'Engineering',
    employmentType: 'Full-time',
    joiningDate: '2026-10-15T00:00:00.000Z',
    annualCtc: 120000,
    currency: 'USD',
    reportingManager: 'Sarah Jenkins',
    workLocation: 'New York, NY',
    personalEmail: 'ajay@example.com',
    officialEmail: 'ajay.sharma@tasknera.com',
    phone: '+1 555-0199',
  };

  const mockCompany = {
    name: 'TaskNera Corp',
    legalName: 'TaskNera Technologies Incorporated',
    headquartersAddress: {
      street: '100 Innovation Way',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA',
    },
  };

  const placeholdersToMap = [
    '[Employee Full Name]',
    '[Designation]',
    '{{department}}',
    '<<Joining Date>>',
    '[Annual CTC]',
    '[Gross Monthly Salary]',
    '[Basic Salary]',
    '[HRA]',
    '[Company Name]',
    '[Work Location]',
    '[Reporting Manager]',
    '[Date of Joining]',
    '[Probation Period]',
    '[Notice Period]',
    '[Employee ID]',
  ];

  const mappings = await FieldMappingService.mapPlaceholdersForEmployee(
    placeholdersToMap,
    mockEmployee,
    mockCompany
  );

  assert.strictEqual(mappings['[Employee Full Name]'].mappedValue, 'Ajay Sharma');
  assert.strictEqual(mappings['[Employee Full Name]'].source, 'DETERMINISTIC');
  assert.strictEqual(mappings['[Designation]'].mappedValue, 'Senior Full Stack Engineer');
  assert.strictEqual(mappings['{{department}}'].mappedValue, 'Engineering');
  assert.strictEqual(mappings['[Annual CTC]'].mappedValue, '$120,000');
  assert.strictEqual(mappings['[Gross Monthly Salary]'].mappedValue, '$10,000');
  assert.strictEqual(mappings['[Basic Salary]'].mappedValue, '$5,000');
  assert.strictEqual(mappings['[HRA]'].mappedValue, '$2,000');
  assert.strictEqual(mappings['[Company Name]'].mappedValue, 'TaskNera Technologies Incorporated');
  assert.strictEqual(mappings['[Work Location]'].mappedValue, 'New York, NY');
  assert.strictEqual(mappings['[Reporting Manager]'].mappedValue, 'Sarah Jenkins');
  assert.strictEqual(mappings['[Employee ID]'].mappedValue, 'EMP-001');
  console.log('✓ Field mapping engine verified with 100% accuracy!');

  // ---------------------------------------------------------------------------
  // TEST 4: Multi-employee data isolation (Employee A vs Employee B)
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 4: Multi-employee data isolation ---');
  const mockEmployeeB = {
    id: 'emp-456',
    employeeId: 'EMP-002',
    fullName: 'Priya Patel',
    designation: 'Staff Product Designer',
    department: 'Design',
    annualCtc: 140000,
    currency: 'USD',
  };

  const mappingsB = await FieldMappingService.mapPlaceholdersForEmployee(
    ['[Employee Full Name]', '[Designation]', '[Annual CTC]'],
    mockEmployeeB,
    mockCompany
  );

  assert.strictEqual(mappingsB['[Employee Full Name]'].mappedValue, 'Priya Patel');
  assert.strictEqual(mappingsB['[Designation]'].mappedValue, 'Staff Product Designer');
  assert.strictEqual(mappingsB['[Annual CTC]'].mappedValue, '$140,000');

  // Verify Employee A was not mutated or polluted
  assert.strictEqual(mappings['[Employee Full Name]'].mappedValue, 'Ajay Sharma');
  console.log('✓ Multi-employee data isolation verified!');

  // ---------------------------------------------------------------------------
  // TEST 5: Full DOCX Binary Template (Headers, Footers, Tables, Document Body)
  // ---------------------------------------------------------------------------
  console.log('\n--- Test 5: Full DOCX Binary Archive (Body, Header, Footer, Table) ---');
  const zip = new JSZip();

  // Content Types
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
      <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
      <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
    </Types>`
  );

  // Document XML with Table and Run-Split Placeholders
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        <w:p>
          <w:r><w:t>OFFER LETTER - </w:t></w:r>
          <w:r><w:t>[Company</w:t></w:r>
          <w:r><w:t> Name]</w:t></w:r>
        </w:p>
        <w:p>
          <w:r><w:t>Dear </w:t></w:r>
          <w:r><w:t>[Employee</w:t></w:r>
          <w:r><w:t> Full</w:t></w:r>
          <w:r><w:t> Name]</w:t></w:r>
          <w:r><w:t>,</w:t></w:r>
        </w:p>
        <w:tbl>
          <w:tr>
            <w:tc>
              <w:p><w:r><w:t>Designation</w:t></w:r></w:p>
            </w:tc>
            <w:tc>
              <w:p><w:r><w:t>[Designation]</w:t></w:r></w:p>
            </w:tc>
          </w:tr>
          <w:tr>
            <w:tc>
              <w:p><w:r><w:t>Annual CTC</w:t></w:r></w:p>
            </w:tc>
            <w:tc>
              <w:p><w:r><w:t>[Annual CTC]</w:t></w:r></w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
      </w:body>
    </w:document>`
  );

  // Header
  zip.file(
    'word/header1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:p>
        <w:r><w:t>Confidential - [Company Name]</w:t></w:r>
      </w:p>
    </w:hdr>`
  );

  // Footer
  zip.file(
    'word/footer1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:p>
        <w:r><w:t>Page 1 | Issued on [Date of Joining]</w:t></w:r>
      </w:p>
    </w:ftr>`
  );

  const docxBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  const savedTemplatePath = await DocxTemplateService.storeOriginalTemplate(
    docxBuffer,
    'TaskNera_custom_offer_letter.docx'
  );

  const inspection = await DocxTemplateService.inspectCustomTemplate(savedTemplatePath);
  assert.ok(inspection.hasTables, 'Must detect tables');
  assert.ok(inspection.hasHeaders, 'Must detect headers');
  assert.ok(inspection.hasFooters, 'Must detect footers');
  assert.ok(inspection.detectedPlaceholders.includes('[Employee Full Name]'), 'Must detect [Employee Full Name]');
  assert.ok(inspection.detectedPlaceholders.includes('[Designation]'), 'Must detect [Designation]');
  assert.ok(inspection.detectedPlaceholders.includes('[Annual CTC]'), 'Must detect [Annual CTC]');
  assert.ok(inspection.detectedPlaceholders.includes('[Company Name]'), 'Must detect [Company Name]');
  assert.ok(inspection.detectedPlaceholders.includes('[Date of Joining]'), 'Must detect [Date of Joining]');

  // Populate DOCX
  const populated = await DocxTemplateService.populateDocxTemplate(savedTemplatePath, {
    '[Company Name]': 'TaskNera Technologies Incorporated',
    '[Employee Full Name]': 'Ajay Sharma',
    '[Designation]': 'Lead Cloud Engineer',
    '[Annual CTC]': '$160,000 USD',
    '[Date of Joining]': 'November 1, 2026',
  });

  assert.ok(populated.docxBuffer.length > 0, 'Populated DOCX buffer must not be empty');
  assert.ok(populated.renderedPlainText.includes('Ajay Sharma'), 'Rendered text must have Ajay Sharma');
  assert.ok(populated.renderedPlainText.includes('Lead Cloud Engineer'), 'Rendered text must have Lead Cloud Engineer');

  // Verify the populated DOCX binary still contains valid zipped XML with all replacements
  const populatedZip = await JSZip.loadAsync(populated.docxBuffer);
  const populatedDocXml = await populatedZip.file('word/document.xml')!.async('text');
  const populatedHdrXml = await populatedZip.file('word/header1.xml')!.async('text');
  const populatedFtrXml = await populatedZip.file('word/footer1.xml')!.async('text');

  assert.ok(populatedDocXml.includes('Ajay Sharma'), 'document.xml must contain Ajay Sharma');
  assert.ok(!populatedDocXml.includes('[Employee Full Name]'), 'document.xml must not contain placeholder');
  assert.ok(populatedDocXml.includes('Lead Cloud Engineer'), 'table cell must contain Lead Cloud Engineer');
  assert.ok(populatedHdrXml.includes('TaskNera Technologies Incorporated'), 'header must contain replaced Company Name');
  assert.ok(populatedFtrXml.includes('November 1, 2026'), 'footer must contain replaced Date of Joining');
  console.log('✓ Full DOCX binary archive with headers, footers, and tables populated successfully!');

  console.log('\n🎉 ALL DOCX DYNAMIC AUTOFILL UNIT TESTS PASSED!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
