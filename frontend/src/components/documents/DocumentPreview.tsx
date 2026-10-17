import React, { useState, useMemo } from 'react';
import {
  Download,
  Send,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Lock,
  ArrowLeft,
  Copy,
  ExternalLink,
  Printer,
  Building2,
  Calendar,
  Briefcase,
  Trash2,
} from 'lucide-react';
import { DocumentTypeDefinition, HrDocument } from '../../types/document-engine.js';
import { Button } from '../common/Button.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { useToast } from '../../context/ToastContext.js';
import {
  MrsaAgreementData,
  INITIAL_MRSA_DATA,
  getDeepCloneMrsaData,
} from '../../services/mrsaCatalog.js';
import {
  DEFAULT_OFFER_SECTIONS,
  DEFAULT_ANNEXURE_ROWS,
  MANDATORY_DOCS,
} from '../offers/QuickTemplateOfferModal.js';

interface DocumentPreviewProps {
  document: HrDocument;
  typeDef: DocumentTypeDefinition;
  onSendClick: () => void;
  onBackToList: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  typeDef,
  onSendClick,
  onBackToList,
}) => {
  const { success, error, info } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteCurrentDocument = async () => {
    const docName = document.title || document.referenceNumber || 'this document';
    if (!window.confirm(`Are you sure you want to delete "${docName}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      if (document.id && !document.id.startsWith('doc_mrsa_') && !document.id.startsWith('doc_rlv_')) {
        await DocumentEngineService.deleteDocument(document.id);
      }

      try {
        const saved: HrDocument[] = JSON.parse(localStorage.getItem('tasknera_saved_documents') || '[]');
        const updated = saved.filter((d) => d.id !== document.id && d.referenceNumber !== document.referenceNumber);
        localStorage.setItem('tasknera_saved_documents', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage remove failed:', err);
      }

      try {
        const mockSaved: HrDocument[] = JSON.parse(localStorage.getItem('tasknera_mock_hr_documents') || '[]');
        const updatedMock = mockSaved.filter((d) => d.id !== document.id && d.referenceNumber !== document.referenceNumber);
        localStorage.setItem('tasknera_mock_hr_documents', JSON.stringify(updatedMock));
      } catch (err) {
        console.warn('LocalStorage mock remove failed:', err);
      }

      success(`Document "${docName}" deleted successfully.`);
      onBackToList();
    } catch (err: any) {
      error(err?.message || 'Failed to delete document.');
    } finally {
      setIsDeleting(false);
    }
  };

  const terms = (document.hrConfirmedData || {}) as Record<string, any>;
  const latestFile = document.generatedFiles?.[document.generatedFiles.length - 1];
  const verificationToken =
    latestFile?.verificationToken ||
    `VERIFY-${typeDef.code.substring(0, 3)}-${document.id.substring(0, 8).toUpperCase()}`;
  const checksum =
    latestFile?.sha256Checksum ||
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const isSalarySlip =
    (document.documentTypeCode as string) === 'SALARY_SLIP' ||
    document.templateId?.includes('salary') ||
    document.templateId?.includes('slip') ||
    document.templateId?.includes('payslip') ||
    document.title?.toLowerCase().includes('salary slip') ||
    document.title?.toLowerCase().includes('payslip') ||
    Boolean(terms.payPeriod && (terms.netPay !== undefined || terms.basicSalary !== undefined));

  const isInternshipConcluding =
    document.templateId?.includes('internship_concluding') ||
    document.title?.toLowerCase().includes('internship concluding') ||
    document.title?.toLowerCase().includes('concluding letter') ||
    Boolean(terms.offerLetterRef && terms.concludedDate);

  const isCharacterCertificate =
    !isSalarySlip &&
    !isInternshipConcluding &&
    (document.documentTypeCode === 'CERTIFICATE' ||
      document.templateId?.includes('character') ||
      document.title?.toLowerCase().includes('character'));

  const isExperienceLetter =
    !isSalarySlip &&
    !isInternshipConcluding &&
    (document.documentTypeCode === 'EXPERIENCE_LETTER' ||
      document.templateId?.includes('experience') ||
      document.title?.toLowerCase().includes('experience'));

  const isMrsa =
    !isSalarySlip &&
    !isInternshipConcluding &&
    (document.documentTypeCode === 'MSA' ||
      document.templateId?.includes('mrsa') ||
      document.templateId?.includes('msa') ||
      document.title?.toLowerCase().includes('master recruitment') ||
      document.title?.toLowerCase().includes('master service') ||
      Boolean(terms.agreementNumber && (terms.agreementNumber.includes('MRSA') || terms.agreementNumber.includes('TASK/MRSA'))) ||
      Boolean(terms.sectionsCount) ||
      Boolean(terms.scheduleA));

  const isOfferLetter =
    !isSalarySlip &&
    !isInternshipConcluding &&
    !isMrsa &&
    !isCharacterCertificate &&
    !isExperienceLetter &&
    (document.documentTypeCode === 'OFFER_LETTER' ||
      document.templateId?.includes('offer') ||
      document.title?.toLowerCase().includes('offer') ||
      Boolean(terms.annualCtc || terms.annual_ctc || terms.basic_salary || terms.totalCtc));

  // Payslip Variables
  const payslipFullName = terms.fullName || terms.candidateName || document.recipientName || 'Employee';
  const payslipEmployeeId = terms.employeeId || 'TN-EMP-001';
  const payslipDesignation = terms.designation || terms.jobTitle || 'Staff Member';
  const payslipDepartment = terms.department || 'Operations';
  const payslipDateOfJoining = terms.dateOfJoining || '10/01/2026';
  const payslipPayPeriod = terms.payPeriod || document.effectiveDate || 'October 2026';
  const payslipBankName = terms.bankName || 'HDFC Bank';
  const payslipBankAccountNumber = terms.bankAccountNumber || '••••••••1234';
  const payslipPanNumber = terms.panNumber || 'ABCDE1234F';
  const payslipPfUanNumber = terms.pfUanNumber || '100123456789';
  const payslipPayableDays = terms.payableDays ?? 30;
  const payslipLopDays = terms.lopDays ?? 0;
  const payslipBasicSalary = terms.basicSalary ?? 25000;
  const payslipHra = terms.hra ?? 10000;
  const payslipConveyanceAllowance = terms.conveyanceAllowance ?? 1600;
  const payslipMedicalAllowance = terms.medicalAllowance ?? 1250;
  const payslipSpecialAllowance = terms.specialAllowance ?? 5000;
  const payslipPerformanceBonus = terms.performanceBonus ?? 0;
  const payslipProvidentFund = terms.providentFund ?? 1800;
  const payslipProfessionalTax = terms.professionalTax ?? 200;
  const payslipIncomeTax = terms.incomeTax ?? 0;
  const payslipLoanAdvanceRecovery = terms.loanAdvanceRecovery ?? 0;
  const payslipOtherDeductions = terms.otherDeductions ?? 0;
  const payslipGrossEarnings =
    terms.grossEarnings ??
    (Number(payslipBasicSalary) +
      Number(payslipHra) +
      Number(payslipConveyanceAllowance) +
      Number(payslipMedicalAllowance) +
      Number(payslipSpecialAllowance) +
      Number(payslipPerformanceBonus));
  const payslipTotalDeductions =
    terms.totalDeductions ??
    (Number(payslipProvidentFund) +
      Number(payslipProfessionalTax) +
      Number(payslipIncomeTax) +
      Number(payslipLoanAdvanceRecovery) +
      Number(payslipOtherDeductions));
  const payslipNetPay = terms.netPay ?? (Number(payslipGrossEarnings) - Number(payslipTotalDeductions));
  const payslipAmountInWords = terms.amountInWords || 'Rupees Only';

  const formatSlipAmount = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) || 0 : Number(val) || 0;
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Internship Concluding Variables
  const internSalutation = terms.salutation || 'Mr.';
  const internName = terms.internName || terms.candidateName || document.recipientName || 'Intern';
  const internshipRole = terms.internshipRole || terms.designation || 'Management Trainee';
  const internDepartment = terms.department || 'Operations';
  const internCommencedDate = terms.commencedDate || '01/07/2026';
  const internConcludedDate = terms.concludedDate || document.effectiveDate || '30/09/2026';
  const internOfferLetterRef = terms.offerLetterRef || 'TASK/2026/OFF-0101';
  const internReferenceNumber = terms.referenceNumber || document.referenceNumber || 'TASK/2026/INT-0101';
  const internIssueDate = terms.issueDate || document.effectiveDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const internSignatoryName = terms.signatoryName || document.signatoryName || 'Sheetal Bedi';
  const internSignatoryTitle = terms.signatoryTitle || document.signatoryTitle || 'Lead HR Partner';

  // Shared / Certificate / Experience Variables
  const salutation = terms.salutation || 'Mr.';
  const fullName = terms.fullName || terms.candidateName || document.recipientName || 'Employee';
  const designation = terms.designation || terms.jobTitle || 'Staff Member';
  const department = terms.department || 'Operations';
  const associationType = terms.associationType || 'employment';
  const startDate = terms.startDate || 'October 2, 2026';
  const endDate = terms.endDate || 'September 30, 2026';
  const statusMode = terms.statusMode || 'ended';
  const areaOfWork = terms.areaOfWork || 'talent acquisition, process automation, and HR operations';
  const responsibilityLevel = terms.responsibilityLevel || 'was responsible for';
  const keyResponsibilities =
    terms.keyResponsibilities ||
    'candidate sourcing, technical screening coordination, employee lifecycle maintenance, and compliance documentation';
  const demonstratedQualities =
    terms.demonstratedQualities ||
    'professionalism, sincerity, adaptability, willingness to learn, teamwork, and responsibility';
  const conductEvaluation = terms.conductEvaluation || 'satisfactory and professional';
  const characterTraits = terms.characterTraits || 'cooperative, respectful, and committed';
  const includeDisciplinaryClause = terms.includeDisciplinaryClause !== false;
  const futureEndeavours = terms.futureEndeavours || 'academic and professional';
  const issuanceReason =
    terms.issuanceReason ||
    (associationType === 'internship' ? 'completion/conclusion of his/her internship' : 'separation from employment');
  const referenceNumber = terms.referenceNumber || document.referenceNumber;
  const issueDate =
    terms.issueDate ||
    document.effectiveDate ||
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const place = terms.place || 'Delhi';
  const signatoryName = terms.signatoryName || document.signatoryName || 'Sheetal Bedi';
  const signatoryTitle =
    terms.signatoryTitle ||
    document.signatoryTitle ||
    (isExperienceLetter ? 'Chief Executive Officer' : 'CEO');

  const pronounHeShe = salutation === 'Ms.' || salutation === 'Mrs.' ? 'she' : 'he';
  const pronounHisHer = salutation === 'Ms.' || salutation === 'Mrs.' ? 'her' : 'his';
  const pronounHisHerCap = pronounHisHer.charAt(0).toUpperCase() + pronounHisHer.slice(1);
  const pronounHimHer = salutation === 'Ms.' || salutation === 'Mrs.' ? 'her' : 'him';
  const designationArticle = /^[aeiou]/i.test(designation.trim()) ? 'an' : 'a';

  // =========================================================================
  // MRSA (Master Recruitment Services Agreement) Data Merging
  // =========================================================================
  const mrsaData = useMemo<MrsaAgreementData>(() => {
    const base = getDeepCloneMrsaData();
    if (!isMrsa) return base;

    const savedClient = terms.client || {};
    const savedServiceProvider = terms.serviceProvider || {};

    return {
      ...base,
      documentTitle: terms.documentTitle || base.documentTitle,
      documentSubtitle: terms.documentSubtitle || base.documentSubtitle,
      agreementNumber: terms.agreementNumber || document.referenceNumber || base.agreementNumber,
      effectiveDate: terms.effectiveDate || document.effectiveDate || base.effectiveDate,
      client: {
        ...base.client,
        ...savedClient,
        legalName: savedClient.legalName || document.recipientName || base.client.legalName,
        tradeName: savedClient.tradeName || savedClient.legalName || document.recipientName || base.client.tradeName,
        email: savedClient.email || document.recipientEmail || base.client.email,
        signatoryName: savedClient.signatoryName || terms.recipientName || base.client.signatoryName,
      },
      serviceProvider: {
        ...base.serviceProvider,
        ...savedServiceProvider,
        signatoryName: savedServiceProvider.signatoryName || terms.signatoryName || document.signatoryName || base.serviceProvider.signatoryName,
        signatoryDesignation: savedServiceProvider.signatoryDesignation || terms.signatoryTitle || document.signatoryTitle || base.serviceProvider.signatoryDesignation,
      },
      executiveSummary: Array.isArray(terms.executiveSummary) && terms.executiveSummary.length > 0 ? terms.executiveSummary : base.executiveSummary,
      recitals: Array.isArray(terms.recitals) && terms.recitals.length > 0 ? terms.recitals : base.recitals,
      sections: Array.isArray(terms.sections) && terms.sections.length > 0 ? terms.sections : base.sections,
      scheduleA: Array.isArray(terms.scheduleA) && terms.scheduleA.length > 0 ? terms.scheduleA : base.scheduleA,
      scheduleB: Array.isArray(terms.scheduleB) && terms.scheduleB.length > 0 ? terms.scheduleB : base.scheduleB,
      witness1: terms.witness1 || base.witness1,
      witness2: terms.witness2 || base.witness2,
      clientSignatoryDate: terms.clientSignatoryDate || base.clientSignatoryDate,
      taskneraSignatoryDate: terms.taskneraSignatoryDate || base.taskneraSignatoryDate,
    };
  }, [isMrsa, terms, document]);

  // =========================================================================
  // Offer Letter Data Merging & Interpolation
  // =========================================================================
  const offerValues = useMemo(() => {
    const rawAll = (terms.allValues || {}) as Record<string, string>;
    const empName =
      terms.candidateName ||
      terms.employee_name ||
      rawAll.employee_name ||
      rawAll.candidate_name ||
      document.recipientName ||
      'Candidate';
    const salutationVal = terms.salutation || rawAll.salutation || 'Mr.';
    const designationVal = terms.jobTitle || terms.designation || rawAll.designation || 'Staff Member';
    const departmentVal = terms.department || rawAll.department || 'Platform Engineering';
    const refNum = terms.referenceNumber || rawAll.reference_number || document.referenceNumber || 'TASK/2026/001';
    const dateVal =
      terms.issueDate ||
      rawAll.date ||
      document.effectiveDate ||
      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const joiningVal = terms.joiningDate || rawAll.joining_date || '15/10/2026';
    const annualCtcVal =
      terms.annualCtc ||
      terms.annual_ctc ||
      rawAll.annual_ctc ||
      (typeof terms.totalCtc === 'number' ? terms.totalCtc.toLocaleString('en-IN') : terms.totalCtc) ||
      '18,00,000';
    const basicVal = terms.baseSalary || terms.basic_salary || rawAll.basic_salary || '60,000';
    const hraVal = terms.hra || rawAll.hra || '30,000';
    const specialVal = terms.specialAllowance || terms.special_allowance || rawAll.special_allowance || '60,000';
    const monthlyVal = terms.monthlySalary || terms.gross_monthly || rawAll.gross_monthly || '1,50,000';
    const locationVal = terms.workLocation || terms.work_location || rawAll.work_location || 'Remote / On-site / Hybrid';
    const probationVal = terms.probationPeriod || rawAll.probation_period || '6 Months';
    const noticeVal = terms.noticePeriod || rawAll.notice_period || '45 days';
    const reportingVal = terms.reportingManager || rawAll.reporting_manager || 'Sheetal Bedi (CEO & Founder)';

    return {
      salutation: salutationVal,
      employee_name: empName,
      candidate_name: empName,
      designation: designationVal,
      department: departmentVal,
      annual_ctc: annualCtcVal,
      salary: annualCtcVal,
      ctc_per_month: monthlyVal,
      basic_salary: basicVal,
      hra: hraVal,
      special_allowance: specialVal,
      gross_monthly: monthlyVal,
      employer_contributions: rawAll.employer_contributions || 'NA',
      total_ctc_per_annum: annualCtcVal,
      work_location: locationVal,
      probation_period: probationVal,
      notice_period: noticeVal,
      reporting_manager: reportingVal,
      employment_type: rawAll.employment_type || 'Full-Time',
      working_days_shift: rawAll.working_days_shift || '6 working days and a 9-hour shift (may vary depending on business requirements)',
      date: dateVal,
      joining_date: joiningVal,
      offer_validity_date: rawAll.offer_validity_date || '14 days from issue date',
      reference_number: refNum,
      ...rawAll,
    };
  }, [terms, document]);

  const interpolateOfferText = (text: string) => {
    return text.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
      return (offerValues as any)[key] ?? '';
    });
  };

  // High-fidelity Isolated iframe print
  const printIframe = (elementId: string, docTitle: string) => {
    const el = window.document.getElementById(elementId);
    if (!el) {
      window.print();
      return;
    }

    const iframe = window.document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    window.document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const styles = Array.from(window.document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((s) => s.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle}</title>
          <meta charset="utf-8" />
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 12mm 12mm 12mm !important;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #1e293b;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            #printable-character-certificate,
            .printable-character-sheet,
            #printable-experience-letter,
            .printable-experience-sheet,
            #printable-mrsa-agreement,
            #printable-offer-document,
            #printable-salary-slip,
            #printable-internship-concluding-letter {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              min-height: auto !important;
              height: auto !important;
            }
            .document-page-sheet {
              page-break-after: always;
              break-after: page;
              min-height: auto !important;
              padding: 0 !important;
              margin-bottom: 20px !important;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 6px 8px;
              vertical-align: top;
            }
            th {
              background-color: #f1f5f9 !important;
              font-weight: 700;
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          ${el.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      } finally {
        setTimeout(() => {
          if (window.document.body.contains(iframe)) {
            window.document.body.removeChild(iframe);
          }
        }, 2000);
      }
    }, 250);
  };

  const handleDownload = async () => {
    if (isOfferLetter) {
      printIframe(
        'printable-offer-document',
        `TaskNera_Offer_Letter_${(offerValues.employee_name || 'Candidate').replace(/\s+/g, '_')}_${offerValues.reference_number.replace(/[\/\\]/g, '_')}`
      );
      return;
    }

    if (isMrsa) {
      printIframe(
        'printable-mrsa-agreement',
        `TaskNera_MRSA_${(mrsaData.client.tradeName || 'Client').replace(/\s+/g, '_')}_${mrsaData.agreementNumber.replace(/[\/\\]/g, '_')}`
      );
      return;
    }

    if (isSalarySlip) {
      printIframe(
        'printable-salary-slip',
        `TaskNera_Payslip_${payslipFullName.replace(/\s+/g, '_')}_${payslipPayPeriod.replace(/\s+/g, '_')}`
      );
      return;
    }

    if (isInternshipConcluding) {
      printIframe(
        'printable-internship-concluding-letter',
        `TaskNera_Internship_Concluding_${internName.replace(/\s+/g, '_')}_${internReferenceNumber.replace(/[\/\\]/g, '_')}`
      );
      return;
    }

    if (isCharacterCertificate) {
      printIframe(
        'printable-character-certificate',
        `TaskNera_Character_Certificate_${fullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`
      );
      return;
    }

    if (isExperienceLetter) {
      printIframe(
        'printable-experience-letter',
        `TaskNera_Experience_Letter_${fullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`
      );
      return;
    }

    setIsDownloading(true);
    try {
      await DocumentEngineService.downloadPdf(document.id, `${document.referenceNumber}_${typeDef.code}.pdf`);
      success('Downloaded official PDF!');
    } catch {
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (isOfferLetter) {
      printIframe(
        'printable-offer-document',
        `TaskNera_Offer_Letter_${(offerValues.employee_name || 'Candidate').replace(/\s+/g, '_')}_${offerValues.reference_number.replace(/[\/\\]/g, '_')}`
      );
      return;
    }

    if (isMrsa) {
      printIframe(
        'printable-mrsa-agreement',
        `TaskNera_MRSA_${(mrsaData.client.tradeName || 'Client').replace(/\s+/g, '_')}_${mrsaData.agreementNumber.replace(/[\/\\]/g, '_')}`
      );
      return;
    }

    if (isSalarySlip) {
      printIframe(
        'printable-salary-slip',
        `TaskNera_Payslip_${payslipFullName.replace(/\s+/g, '_')}_${payslipPayPeriod.replace(/\s+/g, '_')}`
      );
      return;
    }

    if (isInternshipConcluding) {
      printIframe(
        'printable-internship-concluding-letter',
        `TaskNera_Internship_Concluding_${internName.replace(/\s+/g, '_')}_${internReferenceNumber.replace(/[\/\\]/g, '_')}`
      );
      return;
    }

    if (isCharacterCertificate) {
      printIframe(
        'printable-character-certificate',
        `TaskNera_Character_Certificate_${fullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`
      );
      return;
    }

    if (isExperienceLetter) {
      printIframe(
        'printable-experience-letter',
        `TaskNera_Experience_Letter_${fullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`
      );
      return;
    }

    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Action Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 20px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onBackToList}
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}
        >
          <ArrowLeft size={16} /> Back to Documents
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button variant="secondary" onClick={handlePrint} icon={<Printer size={15} />}>
            Print
          </Button>
          <Button
            variant="secondary"
            onClick={handleDownload}
            isLoading={isDownloading}
            icon={<Download size={15} />}
          >
            Download PDF
          </Button>
          <Button variant="primary" onClick={onSendClick} icon={<Send size={15} />}>
            Send Document
          </Button>
          <button
            type="button"
            title="Delete Document"
            onClick={handleDeleteCurrentDocument}
            disabled={isDeleting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 6,
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#dc2626',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.borderColor = '#fca5a5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fef2f2';
              e.currentTarget.style.borderColor = '#fecaca';
            }}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. OFFICIAL OFFER LETTER CANVAS (From Offer Pipeline)                     */}
      {/* ========================================================================= */}
      {isOfferLetter ? (
        terms.renderedHtml ? (
          <div
            id="printable-offer-document"
            style={{
              maxWidth: 820,
              margin: '0 auto',
              width: '100%',
              backgroundColor: '#ffffff',
              color: '#1f2937',
              padding: '44px 52px',
              borderRadius: 4,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              lineHeight: 1.65,
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: terms.renderedHtml }} />
          </div>
        ) : (
          <div
            id="printable-offer-document"
            style={{
              maxWidth: 840,
              margin: '0 auto',
              width: '100%',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              padding: '44px 52px',
              borderRadius: 4,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontSize: '12.8px',
              lineHeight: 1.6,
            }}
          >
            {/* Page 1: Official Header Banner */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ width: 280, height: 16, background: '#fae1c3', borderRadius: '0 0 14px 0' }}></div>
                <div style={{ width: 220, height: 7, background: '#9c7a82' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src="/logo.png" alt="TaskNera" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                      <span style={{ color: '#252c38' }}>Task</span>
                      <span style={{ color: '#f56637' }}>Nera</span>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: '#475569', letterSpacing: '0.02em', marginTop: 2 }}>
                      People. Processes. Performance.
                    </div>
                  </div>
                </div>
                <div style={{ borderLeft: '2px solid #0f172a', paddingLeft: 14, fontSize: '11px', lineHeight: 1.5, color: '#1e293b' }}>
                  <div><strong>Phone:</strong> +91 7065278229</div>
                  <div><strong>Email:</strong> careers@tasknera.com</div>
                  <div><strong>ADD:</strong> D-57 Dilshad Colony, Delhi, 110095</div>
                </div>
              </div>
              <div style={{ height: 2.5, background: '#1e293b', width: '100%' }}></div>
            </div>

            {/* Top Metadata */}
            <div style={{ fontSize: '12.8px', lineHeight: 1.6, marginBottom: 14, color: '#1e293b' }}>
              <p style={{ margin: '2px 0' }}>
                <strong>Reference:</strong> {offerValues.reference_number}
              </p>
              <p style={{ margin: '2px 0' }}>
                <strong>Date:</strong> {offerValues.date}
              </p>
              <p style={{ margin: '8px 0 2px' }}>
                <strong>Employee Name:</strong> {offerValues.employee_name}
              </p>
              <p style={{ margin: '2px 0' }}>
                <strong>Designation:</strong> {offerValues.designation}
              </p>
            </div>

            {/* Centered Document Title */}
            <h2
              style={{
                textAlign: 'center',
                fontSize: '21px',
                fontWeight: 700,
                color: '#a35d39',
                margin: '16px 0 12px',
                fontFamily: "'Georgia', serif",
                letterSpacing: '0.02em',
              }}
            >
              Offer of Employment
            </h2>

            {/* Salutation & Subject */}
            <p style={{ marginBottom: 8, fontSize: '12.8px', color: '#1e293b' }}>
              Dear {offerValues.salutation} {(offerValues.employee_name || '').replace(/^(?:Mr\.|Ms\.|Mrs\.|Dr\.)\s+/i, '')},
            </p>
            <p style={{ marginBottom: 10, fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
              Subject: Offer of Employment with TaskNera
            </p>
            <p style={{ marginBottom: 16, fontSize: '12.8px', lineHeight: 1.65, textAlign: 'justify', color: '#334155' }}>
              Further to our discussions and subject to satisfactory completion of the Company&apos;s joining and verification requirements, TaskNera (the “Company”) is pleased to offer you employment for the position of <strong>{offerValues.designation}</strong>, on the terms and conditions set out in this Offer Letter, its Annexures, and the Company&apos;s applicable policies as amended from time to time.
            </p>

            {/* Operative Sections */}
            {DEFAULT_OFFER_SECTIONS.map((sec) => (
              <div key={sec.id} style={{ marginBottom: 14 }}>
                <h3
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#a35d39',
                    borderBottom: '1px solid #e2d3ca',
                    paddingBottom: 3,
                    marginBottom: 6,
                    fontFamily: "'Georgia', serif",
                  }}
                >
                  {sec.number}. {sec.title}
                </h3>
                {sec.paragraphs.map((p, pIdx) => (
                  <p
                    key={pIdx}
                    style={{
                      fontSize: '12.8px',
                      lineHeight: 1.65,
                      color: '#334155',
                      marginBottom: pIdx === sec.paragraphs.length - 1 ? 0 : 6,
                      textAlign: 'justify',
                    }}
                  >
                    {interpolateOfferText(p)}
                  </p>
                ))}
                {sec.bullets && (
                  <ul style={{ margin: '6px 0 0 18px', padding: 0, fontSize: '12.5px', color: '#334155', lineHeight: 1.6 }}>
                    {sec.bullets.map((b, bIdx) => (
                      <li key={bIdx} style={{ marginBottom: 4 }}>
                        {interpolateOfferText(b)}
                      </li>
                    ))}
                  </ul>
                )}
                {sec.footnote && (
                  <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', marginTop: 4 }}>
                    {sec.footnote}
                  </div>
                )}
              </div>
            ))}

            {/* Annexure I: Terms of Employment */}
            <div style={{ marginTop: 28, marginBottom: 20 }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#a35d39', textAlign: 'center', marginBottom: 10 }}>
                ANNEXURE I – TERMS OF EMPLOYMENT
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                <tbody>
                  {DEFAULT_ANNEXURE_ROWS.map((row) => (
                    <tr key={row.key} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ width: '38%', padding: '7px 12px', fontWeight: 700, color: '#1e293b', backgroundColor: '#f8fafc' }}>
                        {row.label}
                      </td>
                      <td style={{ padding: '7px 12px', color: '#0f172a' }}>
                        {(offerValues as any)[row.key] || row.defaultValue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Annexure II: Mandatory Documents */}
            <div style={{ marginTop: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#a35d39', textAlign: 'center', marginBottom: 10 }}>
                ANNEXURE II – MANDATORY DOCUMENTS FOR JOINING
              </h3>
              <ul style={{ margin: '0 0 0 20px', padding: 0, fontSize: '12.5px', color: '#334155', lineHeight: 1.65 }}>
                {MANDATORY_DOCS.map((docItem, dIdx) => (
                  <li key={dIdx} style={{ marginBottom: 4 }}>
                    {docItem}
                  </li>
                ))}
              </ul>
            </div>

            {/* Annexure III: Detailed Compensation Structure */}
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#a35d39', textAlign: 'center', marginBottom: 10 }}>
                ANNEXURE III – COMPENSATION STRUCTURE (CTC)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Salary Component</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>Monthly (INR)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>Annual (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1' }}>Basic Salary</td>
                    <td style={{ padding: '7px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>{offerValues.basic_salary}</td>
                    <td style={{ padding: '7px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>
                      {typeof offerValues.basic_salary === 'string' && !isNaN(Number(offerValues.basic_salary.replace(/,/g, '')))
                        ? (Number(offerValues.basic_salary.replace(/,/g, '')) * 12).toLocaleString('en-IN')
                        : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1' }}>House Rent Allowance (HRA)</td>
                    <td style={{ padding: '7px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>{offerValues.hra}</td>
                    <td style={{ padding: '7px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>
                      {typeof offerValues.hra === 'string' && !isNaN(Number(offerValues.hra.replace(/,/g, '')))
                        ? (Number(offerValues.hra.replace(/,/g, '')) * 12).toLocaleString('en-IN')
                        : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1' }}>Special Allowance</td>
                    <td style={{ padding: '7px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>{offerValues.special_allowance}</td>
                    <td style={{ padding: '7px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>
                      {typeof offerValues.special_allowance === 'string' && !isNaN(Number(offerValues.special_allowance.replace(/,/g, '')))
                        ? (Number(offerValues.special_allowance.replace(/,/g, '')) * 12).toLocaleString('en-IN')
                        : '—'}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#faf5ff', fontWeight: 700 }}>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>Gross Monthly Total</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>{offerValues.ctc_per_month}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>—</td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc', fontWeight: 800 }}>
                    <td style={{ padding: '9px 12px', border: '1px solid #cbd5e1', color: '#0f172a' }}>Total Cost to Company (CTC)</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', border: '1px solid #cbd5e1' }}>—</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', border: '1px solid #cbd5e1', color: '#0f172a' }}>
                      INR {offerValues.annual_ctc}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Execution Page / Sign-offs */}
            <div style={{ marginTop: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: 28 }}>
                  For TaskNera
                </div>
                <div style={{ borderBottom: '1px solid #475569', width: 200, marginBottom: 6 }} />
                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <div style={{ fontWeight: 600 }}>Authorized Signatory</div>
                  <div>Name: Sheetal Bedi</div>
                  <div>Designation: CEO & Founder</div>
                  <div>Date: {offerValues.date}</div>
                  <div>Place: Delhi, India</div>
                </div>
              </div>

              <div style={{ textAlign: 'left', minWidth: 220 }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', marginBottom: 28 }}>
                  Candidate Acceptance
                </div>
                <div style={{ borderBottom: '1px solid #475569', width: 200, marginBottom: 6 }} />
                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <div style={{ fontWeight: 600 }}>I accept the offer on the terms stated</div>
                  <div>Name: {offerValues.employee_name}</div>
                  <div>Signature: ____________________</div>
                  <div>Date: ____________________</div>
                  <div>Place: ____________________</div>
                </div>
              </div>
            </div>

            {/* Digital Security Footer */}
            <div
              style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: 12,
                marginTop: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#64748b',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={12} color="#10b981" />
                <span>Digital Token: <strong>{verificationToken}</strong></span>
              </div>
              <div>SHA-256: {checksum.substring(0, 16)}...{checksum.substring(48)}</div>
            </div>
          </div>
        )
      ) : isMrsa ? (
        /* ========================================================================= */
        /* 2. OFFICIAL MASTER RECRUITMENT AGREEMENT (MRSA / MSA)                     */
        /* ========================================================================= */
        <div
          id="printable-mrsa-agreement"
          style={{
            maxWidth: 840,
            margin: '0 auto',
            width: '100%',
            backgroundColor: '#ffffff',
            padding: '44px 52px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            borderRadius: 4,
            color: '#0f172a',
            fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
            fontSize: '8.85pt',
            lineHeight: 1.55,
          }}
        >
          {/* Top Brand Logo & Header */}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <img
              src="/logo.png"
              alt="TaskNera"
              style={{
                width: 76,
                height: 76,
                objectFit: 'contain',
                margin: '0 auto 10px auto',
                display: 'block',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div
              style={{
                fontWeight: 900,
                fontSize: '15pt',
                letterSpacing: '0.04em',
                color: '#111827',
                textTransform: 'uppercase',
                lineHeight: 1.2,
              }}
            >
              TASKNERA
            </div>
            <div style={{ fontSize: '8.5pt', color: '#475569', fontWeight: 500, letterSpacing: '0.03em', marginTop: 3 }}>
              Recruitment &nbsp;•&nbsp; Talent Acquisition &nbsp;•&nbsp; Candidate Sourcing
            </div>
          </div>

          {/* Document Title & Subtitle */}
          <div style={{ textAlign: 'center', margin: '18px 0 14px 0' }}>
            <h1
              style={{
                fontSize: '13pt',
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '0.02em',
                margin: '0 0 4px 0',
                textTransform: 'uppercase',
                lineHeight: 1.3,
              }}
            >
              {mrsaData.documentTitle}
            </h1>
            <div style={{ fontSize: '9.2pt', color: '#475569', fontWeight: 500 }}>
              {mrsaData.documentSubtitle}
            </div>
          </div>

          {/* BETWEEN */}
          <div style={{ textAlign: 'center', margin: '14px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: '8pt', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
              BETWEEN
            </div>
            <div style={{ fontSize: '12pt', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
              {mrsaData.client.tradeName || mrsaData.client.legalName || 'CLIENT'}
            </div>
            <div style={{ fontSize: '8.2pt', color: '#64748b' }}>(the Client / Hiring Company)</div>

            <div style={{ fontSize: '8pt', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '6px 0 2px 0' }}>
              AND
            </div>
            <div style={{ fontSize: '12pt', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
              TASKNERA
            </div>
            <div style={{ fontSize: '8.2pt', color: '#64748b' }}>(the Recruitment Services Provider)</div>
          </div>

          {/* Effective Date & Agreement Number */}
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '14px 0 10px 0', fontSize: '8.8pt' }}>
            <div>
              <span style={{ fontWeight: 700 }}>Ref: </span>
              <span>{mrsaData.agreementNumber}</span>
            </div>
            <div>
              <span style={{ fontWeight: 700 }}>Effective Date: </span>
              <span>{mrsaData.effectiveDate}</span>
            </div>
          </div>

          {/* Executive Summary Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #1e293b', fontSize: '8.5pt', marginBottom: 6 }}>
            <tbody>
              {mrsaData.executiveSummary.map((row) => (
                <tr key={row.id}>
                  <td style={{ width: '22%', fontWeight: 700, padding: '6px 10px', border: '1px solid #1e293b', backgroundColor: '#fafafa', color: '#0f172a', verticalAlign: 'top' }}>
                    {row.label}
                  </td>
                  <td style={{ padding: '6px 10px', border: '1px solid #1e293b', textAlign: 'justify' }}>
                    {row.content}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ fontSize: '7.8pt', color: '#64748b', fontStyle: 'italic', marginBottom: 18 }}>
            The summary above is for convenience only. In the event of any conflict, the operative clauses of this Agreement and Clause 25.2 prevail.
          </div>

          {/* Table of Contents */}
          <div style={{ textAlign: 'center', margin: '18px 0 8px 0' }}>
            <div style={{ fontSize: '10.5pt', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              TABLE OF CONTENTS
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #1e293b', fontSize: '8.2pt', marginBottom: 22 }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', padding: '5px 8px', border: '1px solid #1e293b' }}>1. Definitions and Interpretation</td>
                <td style={{ width: '50%', padding: '5px 8px', border: '1px solid #1e293b' }}>15. Indemnity</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>2. Appointment and Nature of Relationship</td>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>16. Limitation of Liability</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>3. Scope of Recruitment Services</td>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>17. Compliance, Ethics and Anti-Bribery</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>4. Candidate Submission and Attribution</td>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>18. Term, Suspension and Termination</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>5. Candidate Fee Protection</td>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>19. Force Majeure</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>6. Non-Circumvention and Commercial Protection</td>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>20. Dispute Resolution</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>7. Fees, Taxes, Invoicing and Payment</td>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>21. Governing Law and Jurisdiction</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>8. Replacement of Placed Candidates</td>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>22. Notices and Communications</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>9. Responsibilities of {mrsaData.client.tradeName || 'Client'}</td>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>23. Assignment and Subcontracting</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>10. Responsibilities of Tasknera</td>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>24. Electronic Execution and Records</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>11. Confidentiality</td>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>25. General</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>12. Data Protection and Candidate Privacy</td>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>Execution Page</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>13. Intellectual Property</td>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>Schedule A – Master Commercial Terms</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>14. Representations, Warranties and Disclaimers</td>
                <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>Schedule B – Candidate Data Protection and Security</td>
              </tr>
            </tbody>
          </table>

          {/* Party Details Table */}
          <div style={{ margin: '14px 0 6px 0', fontSize: '9.2pt', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
            PARTY DETAILS
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #1e293b', fontSize: '8.2pt', marginBottom: 16 }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ width: '28%', padding: '6px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>Particulars</th>
                <th style={{ width: '36%', padding: '6px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>{mrsaData.client.tradeName} (Client)</th>
                <th style={{ width: '36%', padding: '6px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>Tasknera (Service Provider)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Full legal name / trade name', client: `${mrsaData.client.legalName} (${mrsaData.client.tradeName})`, sp: mrsaData.serviceProvider.tradeName },
                { label: 'Legal form', client: mrsaData.client.legalForm, sp: mrsaData.serviceProvider.legalForm },
                { label: 'Signatory', client: mrsaData.client.signatoryName, sp: mrsaData.serviceProvider.signatoryName },
                { label: 'Designation', client: mrsaData.client.signatoryDesignation, sp: mrsaData.serviceProvider.signatoryDesignation },
                { label: 'Address', client: mrsaData.client.registeredAddress, sp: mrsaData.serviceProvider.registeredAddress },
                { label: 'CIN / Registration No.', client: mrsaData.client.cinNumber, sp: mrsaData.serviceProvider.cinNumber },
                { label: 'GSTIN', client: mrsaData.client.gstin, sp: mrsaData.serviceProvider.gstin },
                { label: 'Email', client: mrsaData.client.email, sp: mrsaData.serviceProvider.email },
                { label: 'Phone', client: mrsaData.client.phone, sp: mrsaData.serviceProvider.phone },
              ].map((row, rIdx) => (
                <tr key={rIdx}>
                  <td style={{ fontWeight: 700, padding: '5px 8px', border: '1px solid #1e293b', backgroundColor: '#fafafa' }}>{row.label}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>{row.client}</td>
                  <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>{row.sp}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Recitals */}
          <div style={{ margin: '14px 0 6px 0', fontSize: '9.2pt', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
            RECITALS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '8.8pt', textAlign: 'justify', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 700 }}>(1)</span>
              <span>{mrsaData.client.tradeName} is engaged in business and, from time to time, requires to hire employees, consultants or other personnel directly.</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 700 }}>(2)</span>
              <span>Tasknera is an independent recruitment services provider offering candidate sourcing, talent acquisition, screening, coordination and related recruitment support services.</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 700 }}>(3)</span>
              <span>{mrsaData.client.tradeName} wishes to engage Tasknera as a non-exclusive recruitment services provider on the terms of this Agreement, and Tasknera agrees to provide such services on an assignment-by-assignment basis.</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 700 }}>(4)</span>
              <span>The Parties intend this Agreement to provide a consistent legal and commercial framework for future recruitment assignments.</span>
            </div>
          </div>

          <p style={{ fontSize: '8.8pt', margin: '14px 0 16px 0', lineHeight: 1.6 }}>
            NOW, THEREFORE, in consideration of the mutual covenants contained in this Agreement, the Parties agree as follows:
          </p>

          {/* Operative Clauses 1 to 25 */}
          {mrsaData.sections.map((sec) => (
            <div key={sec.id} style={{ marginBottom: 16 }}>
              <div style={{ marginTop: 16, marginBottom: 8 }}>
                <span style={{ fontWeight: 800, fontSize: '9.5pt', textTransform: 'uppercase', color: '#111827' }}>
                  {sec.number}.&nbsp;&nbsp;{sec.title}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sec.clauses.map((clause) => {
                  const isDefinitionSection = sec.number === 1;
                  const showTitle = !isDefinitionSection && clause.title && !clause.paragraphs[0]?.startsWith(clause.title);

                  return (
                    <div key={clause.id} style={{ fontSize: '8.8pt', textAlign: 'justify', lineHeight: 1.6 }}>
                      <span style={{ fontWeight: 700 }}>{clause.clauseNumber}&nbsp;&nbsp;</span>
                      {showTitle && <span style={{ fontWeight: 700 }}>{clause.title}.&nbsp;</span>}
                      <span>{clause.paragraphs.join(' ')}</span>
                      {clause.subclauses && clause.subclauses.length > 0 && (
                        <div style={{ paddingLeft: 18, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {clause.subclauses.map((sub) => (
                            <div key={sub.id} style={{ display: 'flex', gap: 8 }}>
                              <span style={{ fontWeight: 600 }}>{sub.clauseId}</span>
                              <span>{sub.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Execution Page */}
          <div style={{ marginTop: 24, marginBottom: 8, textAlign: 'left' }}>
            <span style={{ fontWeight: 800, fontSize: '9.5pt', textTransform: 'uppercase', color: '#111827' }}>
              EXECUTION PAGE
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #1e293b', fontSize: '8.2pt', marginBottom: 16 }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ width: '50%', padding: '6px 10px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>
                  FOR {mrsaData.client.tradeName.toUpperCase()}
                </th>
                <th style={{ width: '50%', padding: '6px 10px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>
                  FOR TASKNERA
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px 12px', border: '1px solid #1e293b', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div><span style={{ fontWeight: 700 }}>Authorised Signatory: </span>{mrsaData.client.signatoryName}</div>
                    <div><span style={{ fontWeight: 700 }}>Designation: </span>{mrsaData.client.signatoryDesignation}</div>
                    <div><span style={{ fontWeight: 700 }}>Signature: </span>____________________</div>
                    <div><span style={{ fontWeight: 700 }}>Date: </span>{mrsaData.clientSignatoryDate || mrsaData.effectiveDate}</div>
                    <div><span style={{ fontWeight: 700 }}>Place: </span>{mrsaData.client.registeredAddress?.split(',')?.[0] || 'Hyderabad'}</div>
                  </div>
                </td>
                <td style={{ padding: '10px 12px', border: '1px solid #1e293b', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div><span style={{ fontWeight: 700 }}>Proprietor: </span>{mrsaData.serviceProvider.signatoryName}</div>
                    <div><span style={{ fontWeight: 700 }}>Designation: </span>{mrsaData.serviceProvider.signatoryDesignation}</div>
                    <div><span style={{ fontWeight: 700 }}>Signature: </span>____________________</div>
                    <div><span style={{ fontWeight: 700 }}>Date: </span>{mrsaData.taskneraSignatoryDate || mrsaData.effectiveDate}</div>
                    <div><span style={{ fontWeight: 700 }}>Place: </span>Delhi, India</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Schedule A – Master Commercial Terms */}
          <div style={{ marginTop: 22, marginBottom: 8, textAlign: 'left' }}>
            <span style={{ fontWeight: 800, fontSize: '9.5pt', textTransform: 'uppercase', color: '#111827' }}>
              SCHEDULE A – MASTER COMMERCIAL TERMS
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #1e293b', fontSize: '8.2pt', marginBottom: 22 }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ width: '28%', padding: '6px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>Term</th>
                <th style={{ padding: '6px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>Master Terms</th>
              </tr>
            </thead>
            <tbody>
              {mrsaData.scheduleA.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 700, padding: '5px 8px', border: '1px solid #1e293b', verticalAlign: 'top', backgroundColor: '#fafafa' }}>
                    {row.term}
                  </td>
                  <td style={{ padding: '5px 8px', border: '1px solid #1e293b', verticalAlign: 'top', textAlign: 'justify', lineHeight: 1.5 }}>
                    {row.masterTerms}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Schedule B – Data Protection */}
          <div style={{ marginTop: 22, marginBottom: 8, textAlign: 'left' }}>
            <span style={{ fontWeight: 800, fontSize: '9.5pt', textTransform: 'uppercase', color: '#111827' }}>
              SCHEDULE B – CANDIDATE DATA PROTECTION AND SECURITY
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '8.5pt', textAlign: 'justify', lineHeight: 1.5 }}>
            {mrsaData.scheduleB.map((secB) => (
              <div key={secB.id}>
                <span style={{ fontWeight: 800 }}>{secB.code}&nbsp;&nbsp;</span>
                <span style={{ fontWeight: 700 }}>{secB.title}:&nbsp;</span>
                <span>{secB.content}</span>
              </div>
            ))}
          </div>

          {/* Digital Security Footer */}
          <div
            style={{
              borderTop: '1px solid #cbd5e1',
              paddingTop: 12,
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '8pt',
              color: '#64748b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={12} color="#10b981" />
              <span>Digital Security Token: <strong>{verificationToken}</strong></span>
            </div>
            <div>SHA-256: {checksum.substring(0, 16)}...{checksum.substring(48)}</div>
          </div>
        </div>
      ) : isSalarySlip ? (
        /* ========================================================================= */
        /* 2B. HIGH-FIDELITY OFFICIAL TASKNERA PAYSLIP CANVAS (A4)                   */
        /* ========================================================================= */
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            id="printable-salary-slip"
            style={{
              width: '100%',
              maxWidth: '780px',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              padding: '40px 48px',
              color: '#0f172a',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              boxSizing: 'border-box',
            }}
          >
            {/* 1. Header Banner */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src="/logo.png"
                  alt="TaskNera"
                  style={{ width: 44, height: 44, objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: '26px',
                      fontWeight: 800,
                      color: '#0f172a',
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    TaskNera
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontStyle: 'italic',
                      color: '#64748b',
                      marginTop: 3,
                    }}
                  >
                    Payslip for the month of {payslipPayPeriod}
                  </div>
                </div>
              </div>

              {/* Top Terracotta Accent Divider Line */}
              <div
                style={{
                  height: 2,
                  backgroundColor: '#c26d4d',
                  width: '100%',
                  marginTop: 14,
                  borderRadius: 1,
                }}
              />
            </div>

            {/* 2. Employee Details Grid Table */}
            <div style={{ marginBottom: 20 }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '11px',
                  border: '1px solid #cbd5e1',
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ width: '22%', padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                      Employee Name
                    </td>
                    <td style={{ width: '28%', padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                      {payslipFullName}
                    </td>
                    <td style={{ width: '22%', padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                      Employee ID
                    </td>
                    <td style={{ width: '28%', padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                      {payslipEmployeeId}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                      Designation
                    </td>
                    <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                      {payslipDesignation}
                    </td>
                    <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                      Department
                    </td>
                    <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                      {payslipDepartment}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                      Date of Joining
                    </td>
                    <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                      {payslipDateOfJoining}
                    </td>
                    <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                      Pay Period
                    </td>
                    <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                      {payslipPayPeriod}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                      Bank Name
                    </td>
                    <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                      {payslipBankName}
                    </td>
                    <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                      Bank A/C No.
                    </td>
                    <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                      {payslipBankAccountNumber}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                      PAN
                    </td>
                    <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                      {payslipPanNumber}
                    </td>
                    <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                      PF/UAN No.
                    </td>
                    <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                      {payslipPfUanNumber}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                      Payable Days
                    </td>
                    <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                      {payslipPayableDays}
                    </td>
                    <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                      LOP Days
                    </td>
                    <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                      {payslipLopDays}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. Earnings & Deductions Breakdown Table */}
            <div style={{ marginBottom: 16 }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '11px',
                  border: '1px solid #cbd5e1',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#c26d4d', color: '#ffffff' }}>
                    <th style={{ width: '28%', padding: '9px 12px', textAlign: 'left', fontWeight: 800, letterSpacing: '0.03em', border: '1px solid #c26d4d' }}>
                      EARNINGS
                    </th>
                    <th style={{ width: '22%', padding: '9px 12px', textAlign: 'right', fontWeight: 800, letterSpacing: '0.03em', border: '1px solid #c26d4d' }}>
                      AMOUNT (₹)
                    </th>
                    <th style={{ width: '28%', padding: '9px 12px', textAlign: 'left', fontWeight: 800, letterSpacing: '0.03em', border: '1px solid #c26d4d' }}>
                      DEDUCTIONS
                    </th>
                    <th style={{ width: '22%', padding: '9px 12px', textAlign: 'right', fontWeight: 800, letterSpacing: '0.03em', border: '1px solid #c26d4d' }}>
                      AMOUNT (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Basic Salary</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{formatSlipAmount(payslipBasicSalary)}</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Provident Fund (PF)</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{formatSlipAmount(payslipProvidentFund)}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#fcfaf8' }}>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>House Rent Allowance (HRA)</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{formatSlipAmount(payslipHra)}</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Professional Tax</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{formatSlipAmount(payslipProfessionalTax)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Conveyance Allowance</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{formatSlipAmount(payslipConveyanceAllowance)}</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Income Tax (TDS)</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{formatSlipAmount(payslipIncomeTax)}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#fcfaf8' }}>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Medical Allowance</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{formatSlipAmount(payslipMedicalAllowance)}</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Loan/Advance Recovery</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{formatSlipAmount(payslipLoanAdvanceRecovery)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Special Allowance</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{formatSlipAmount(payslipSpecialAllowance)}</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Other Deductions</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{formatSlipAmount(payslipOtherDeductions)}</td>
                  </tr>
                  <tr style={{ backgroundColor: '#fcfaf8' }}>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Performance Bonus</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{formatSlipAmount(payslipPerformanceBonus)}</td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}></td>
                    <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}></td>
                  </tr>
                  {/* Subtotals Row */}
                  <tr style={{ borderTop: '2px solid #cbd5e1', backgroundColor: '#f1f5f9' }}>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>
                      Gross Earnings
                    </td>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                      ₹ {formatSlipAmount(payslipGrossEarnings)}
                    </td>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>
                      Total Deductions
                    </td>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                      ₹ {formatSlipAmount(payslipTotalDeductions)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. NET PAY Callout Banner */}
            <div
              style={{
                backgroundColor: '#262626',
                color: '#ffffff',
                padding: '11px 16px',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                NET PAY (Gross Earnings − Total Deductions)
              </span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#e07a5f' }}>
                ₹ {formatSlipAmount(payslipNetPay)}
              </span>
            </div>

            {/* 5. Amount in Words */}
            <div
              style={{
                fontSize: '11.5px',
                color: '#1e293b',
                marginBottom: 28,
              }}
            >
              <strong>Amount in Words:</strong> {payslipAmountInWords}
            </div>

            {/* 6. Footer Disclaimers */}
            <div
              style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: 12,
                fontSize: '9.5px',
                color: '#64748b',
                lineHeight: 1.5,
                fontStyle: 'italic',
              }}
            >
              <div>This is a system-generated payslip and does not require a signature.</div>
              <div>TaskNera • Compensation & Benefits Policy applies to all salary computations.</div>
            </div>
          </div>
        </div>
      ) : isInternshipConcluding ? (
        /* ========================================================================= */
        /* 2C. HIGH-FIDELITY OFFICIAL TASKNERA INTERNSHIP CONCLUDING LETTER (A4)     */
        /* ========================================================================= */
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 30px' }}>
          <div
            id="printable-internship-concluding-letter"
            style={{
              width: '100%',
              maxWidth: '780px',
              backgroundColor: '#ffffff',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              padding: '42px 48px',
              color: '#0f172a',
              fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
              fontSize: '13.5px',
              lineHeight: '1.6',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '1020px',
            }}
          >
            <div>
              {/* Top Header: TaskNera Logo Left + Contact Right */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: 24,
                }}
              >
                <div>
                  <img
                    src="/logo.png"
                    alt="TaskNera"
                    style={{ width: 48, height: 48, objectFit: 'contain' }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#334155', lineHeight: 1.45 }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                    TaskNera
                  </div>
                  <div>D-57 F1 Dilshad Colony, Shahdara, Delhi – 110095</div>
                  <div>Email: careers@tasknera.com</div>
                </div>
              </div>

              {/* Metadata Block (Left) */}
              <div
                style={{
                  marginBottom: 24,
                  fontSize: '13px',
                  color: '#0f172a',
                  lineHeight: 1.6,
                }}
              >
                <div>
                  <strong>Reference:</strong> {internReferenceNumber}
                </div>
                <div>
                  <strong>Date:</strong> {internIssueDate}
                </div>
                <div>
                  <strong>Intern Name:</strong> {internName}
                </div>
                <div>
                  <strong>Designation / Role:</strong> {internshipRole}
                </div>
              </div>

              {/* Centered Document Title */}
              <div style={{ textAlign: 'center', margin: '28px 0 24px 0' }}>
                <h1
                  className="terracotta-title"
                  style={{
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#8f422b',
                    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Internship Concluding Letter
                </h1>
              </div>

              {/* Salutation */}
              <div style={{ marginBottom: 14, fontWeight: 600 }}>
                Dear {internSalutation} {internName},
              </div>

              {/* Subject Line */}
              <div style={{ marginBottom: 16, fontWeight: 700 }}>
                Subject: Conclusion of Internship with TaskNera
              </div>

              {/* Body Paragraph 1: Reference to Offer Letter */}
              <p style={{ margin: '0 0 14px 0', textAlign: 'justify', lineHeight: 1.6 }}>
                With reference to the Offer Letter bearing reference number {internOfferLetterRef}, issued to you by
                TaskNera, this letter formally confirms the conclusion of your internship engagement with the Company.
              </p>

              {/* Body Paragraph 2: Commencement and Role */}
              <p style={{ margin: '0 0 18px 0', textAlign: 'justify', lineHeight: 1.6 }}>
                As per the terms communicated in your Offer Letter, your internship commenced on {internCommencedDate} and
                concluded on {internConcludedDate}. Your internship was undertaken in the role of {internshipRole} with{' '}
                {internDepartment}.
              </p>

              {/* Section 1: Internship Completion */}
              <div style={{ marginBottom: 16 }}>
                <h3
                  className="terracotta-title"
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#8f422b',
                    margin: '0 0 6px 0',
                    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                  }}
                >
                  Internship Completion
                </h3>
                <p style={{ margin: 0, textAlign: 'justify', lineHeight: 1.6 }}>
                  This letter is issued to formally acknowledge that the above internship period has been completed and the
                  engagement stands concluded with effect from {internConcludedDate}. Any applicable completion
                  formalities, including the return of Company property and closure of access to Company systems and
                  information, shall be completed in accordance with Company policy.
                </p>
              </div>

              {/* Section 2: Continuing Obligations */}
              <div style={{ marginBottom: 16 }}>
                <h3
                  className="terracotta-title"
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#8f422b',
                    margin: '0 0 6px 0',
                    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                  }}
                >
                  Continuing Obligations
                </h3>
                <p style={{ margin: 0, textAlign: 'justify', lineHeight: 1.6 }}>
                  The confidentiality, intellectual property, data protection, information security and other
                  obligations that are expressly stated to survive the end of the engagement shall continue to apply in
                  accordance with the Offer Letter, its annexures and applicable Company policies.
                </p>
              </div>

              {/* Section 3: Acknowledgement */}
              <div style={{ marginBottom: 28 }}>
                <h3
                  className="terracotta-title"
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#8f422b',
                    margin: '0 0 6px 0',
                    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                  }}
                >
                  Acknowledgement
                </h3>
                <p style={{ margin: 0, textAlign: 'justify', lineHeight: 1.6 }}>
                  We appreciate your time, efforts and contributions during your internship with TaskNera and thank you
                  for your association with the Company. We wish you continued learning, growth and success in your
                  future endeavours.
                </p>
              </div>

              {/* Signatory Block */}
              <div style={{ marginTop: 24, fontSize: '13px', lineHeight: 1.55 }}>
                <div style={{ fontWeight: 600, marginBottom: 20 }}>For TaskNera</div>
                <div style={{ width: 220, borderBottom: '1px solid #64748b', marginBottom: 8 }} />
                <div>
                  <strong>Name:</strong> {internSignatoryName}
                </div>
                <div>
                  <strong>Designation:</strong> {internSignatoryTitle}
                </div>
                <div>
                  <strong>Date:</strong> {internIssueDate}
                </div>
              </div>
            </div>

            {/* Footer: TaskNera | Page 1 of 1 */}
            <div
              style={{
                marginTop: 36,
                paddingTop: 12,
                textAlign: 'center',
                fontSize: '11px',
                color: '#64748b',
                letterSpacing: '0.02em',
              }}
            >
              TaskNera | Page 1 of 1
            </div>
          </div>
        </div>
      ) : isCharacterCertificate ? (
        /* ========================================================================= */
        /* 3. CHARACTER CERTIFICATE CANVAS                                           */
        /* ========================================================================= */
        <div
          id="printable-character-certificate"
          className="printable-character-sheet"
          style={{
            maxWidth: 780,
            margin: '0 auto',
            width: '100%',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            padding: '44px 50px',
            borderRadius: 4,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            fontFamily: '"Times New Roman", Times, Georgia, serif',
            fontSize: '11pt',
            lineHeight: 1.6,
          }}
        >
          {/* Official Letterhead Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 16 }}>
            <img
              src="/logo.png"
              alt="TaskNera"
              style={{ width: 52, height: 52, objectFit: 'contain', margin: '0 auto 6px', display: 'block' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              TaskNera HR Solutions
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', marginTop: 2 }}>
              People • Processes • Performance
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
              D-57 Dilshad Colony, Shahdara, Delhi &ndash; 110095 • Email: careers@tasknera.com • Phone: +91 7065278229
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#334155', marginBottom: 18 }}>
            <div><strong>Ref:</strong> {referenceNumber}</div>
            <div><strong>Date:</strong> {issueDate}</div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
              Character Certificate
            </h1>
            <div style={{ fontSize: '1rem', fontStyle: 'italic', color: '#334155', fontWeight: 600 }}>
              To Whomsoever It May Concern
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'justify' }}>
            <p style={{ margin: 0 }}>
              This is to certify that {salutation} {fullName} was associated with TaskNera HR Solutions as {designationArticle} {designation} in the {department} Department from {startDate} to {endDate}.
            </p>
            <p style={{ margin: 0 }}>
              During {pronounHisHer} tenure with our organization, {pronounHeShe} was found to be honest, sincere, diligent, and of good moral character. {pronounHisHerCap} conduct and behaviour towards colleagues, superiors, and clients were exemplary and professional.
            </p>
            <p style={{ margin: 0 }}>
              To the best of our knowledge and belief, {pronounHeShe} bears a good reputation and has not come to adverse notice during {pronounHisHer} period of service.
            </p>
            <p style={{ margin: 0 }}>
              We wish {pronounHimHer} all success in {pronounHisHer} future endeavours.
            </p>
          </div>

          <div style={{ marginTop: 28, display: 'inline-block' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 24 }}>
              For TaskNera HR Solutions
            </div>
            <div style={{ borderBottom: '1px solid #475569', width: 200, marginBottom: 6 }} />
            <div style={{ fontSize: '0.85rem', color: '#334155' }}>
              <div style={{ fontWeight: 600 }}>Authorized Signatory</div>
              <div>Name: {signatoryName}</div>
              <div>Designation: {signatoryTitle}</div>
              <div>Date: {issueDate}</div>
              <div>Place: {place}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10, marginTop: 20, textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
            TaskNera | Page 1 of 1
          </div>
        </div>
      ) : isExperienceLetter ? (
        /* ========================================================================= */
        /* 4. EXPERIENCE LETTER CANVAS                                               */
        /* ========================================================================= */
        <div
          id="printable-experience-letter"
          className="printable-experience-sheet"
          style={{
            maxWidth: 780,
            margin: '0 auto',
            width: '100%',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            padding: '44px 50px',
            borderRadius: 4,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            fontFamily: '"Times New Roman", Times, Georgia, serif',
            fontSize: '11pt',
            lineHeight: 1.6,
          }}
        >
          {/* Official Letterhead Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 16 }}>
            <img
              src="/logo.png"
              alt="TaskNera"
              style={{ width: 52, height: 52, objectFit: 'contain', margin: '0 auto 6px', display: 'block' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              TaskNera HR Solutions
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', marginTop: 2 }}>
              People • Processes • Performance
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
              D-57 Dilshad Colony, Shahdara, Delhi &ndash; 110095 • Email: careers@tasknera.com • Phone: +91 7065278229
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#334155', marginBottom: 18 }}>
            <div><strong>Ref:</strong> {referenceNumber}</div>
            <div><strong>Date:</strong> {issueDate}</div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <h1 style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
              Experience Letter
            </h1>
            <div style={{ fontSize: '1rem', fontStyle: 'italic', color: '#334155', fontWeight: 600 }}>
              To Whomsoever It May Concern
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, textAlign: 'justify' }}>
            <p style={{ margin: 0 }}>
              This is to certify that {salutation} {fullName} was associated with TaskNera HR Solutions as {designationArticle} {designation} from {startDate} to {endDate}.
            </p>
            <p style={{ margin: 0 }}>
              During {pronounHisHer} {associationType}, {pronounHeShe} was part of the {department} and contributed to {areaOfWork}-related activities throughout {pronounHisHer} association with the organization.
            </p>
            <p style={{ margin: 0 }}>
              As part of the {department}, {pronounHeShe} {responsibilityLevel} {keyResponsibilities}, and supported other {department} activities as assigned.
            </p>
            <p style={{ margin: 0 }}>
              Throughout {pronounHisHer} association with TaskNera HR Solutions, {pronounHeShe} demonstrated {demonstratedQualities} in carrying out {pronounHisHer} responsibilities.
            </p>
            <p style={{ margin: 0 }}>
              {pronounHisHerCap} association with TaskNera HR Solutions {statusMode === 'ended' ? `ended on ${endDate}` : 'is continuing as on the date of this letter'}.
            </p>
            <p style={{ margin: 0 }}>
              We appreciate {pronounHisHer} contribution to the organization and wish {pronounHimHer} continued success and growth in all {pronounHisHer} future endeavours.
            </p>
          </div>

          <div style={{ marginTop: 24, display: 'inline-block' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 22 }}>
              For TaskNera HR Solutions
            </div>
            <div style={{ borderBottom: '1px solid #475569', width: 200, marginBottom: 6 }} />
            <div style={{ fontSize: '0.85rem', color: '#334155' }}>
              <div style={{ fontWeight: 600 }}>Authorized Signatory</div>
              <div>Name: {signatoryName}</div>
              <div>Designation: {signatoryTitle || 'Chief Executive Officer'}</div>
              <div>Date: {issueDate}</div>
              <div>Place: {place}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10, marginTop: 20, textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
            TaskNera | Page 1 of 1
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 5. STANDARD OR CUSTOM DOCUMENT CANVAS                                    */
        /* ========================================================================= */
        <div
          style={{
            maxWidth: 820,
            margin: '0 auto',
            width: '100%',
            backgroundColor: '#ffffff',
            color: '#111827',
            padding: '48px 56px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.45)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {/* Top Corporate Accent Bar */}
          <div style={{ height: 4, backgroundColor: '#4f46e5', marginBottom: 24 }} />

          {/* Corporate Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                TASKNERA ENTERPRISE
              </h1>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                People & HR Operations Division • Enterprise Portal
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>https://hrms-portal-nu.vercel.app</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#4f46e5', textTransform: 'uppercase' }}>
                {typeDef.name}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#374151' }}>
                REF: {document.referenceNumber}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Date: {document.effectiveDate || new Date().toISOString().split('T')[0]}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Version: v{document.currentVersionNumber}.0 (Authorized)
              </div>
            </div>
          </div>

          <div style={{ height: 1, backgroundColor: '#e5e7eb', marginBottom: 20 }} />

          {/* Recipient Information Block */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
              ISSUED TO:
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginTop: 2 }}>
              {document.recipientName}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#4b5563' }}>{document.recipientEmail}</div>
            {terms.address && typeof terms.address === 'string' ? (
              <div style={{ fontSize: '0.8125rem', color: '#4b5563' }}>{terms.address}</div>
            ) : null}
          </div>

          {/* Custom Compiled Document Text (if present) */}
          {terms.documentText || terms.templateContent ? (
            <div
              style={{
                fontSize: '0.875rem',
                lineHeight: 1.7,
                color: '#1e293b',
                whiteSpace: 'pre-wrap',
                marginBottom: 28,
                padding: '16px 20px',
                backgroundColor: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            >
              {terms.documentText || terms.templateContent}
            </div>
          ) : (
            /* Structured Terms Key-Value Grid without [object Object] */
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb',
                  paddingBottom: 6,
                  marginBottom: 12,
                }}
              >
                Authorized Document Terms & Specifications
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <tbody>
                  {Object.entries(terms)
                    .filter(
                      ([k, v]) =>
                        !['signatoryName', 'signatoryTitle', 'parsedSections', 'client', 'serviceProvider', 'scheduleA', 'scheduleB', 'sections', 'recitals', 'executiveSummary', 'mrsaData', 'allValues'].includes(k) &&
                        typeof v !== 'object'
                    )
                    .slice(0, 14)
                    .map(([key, val]) => (
                      <tr key={key} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td
                          style={{
                            padding: '6px 0',
                            fontWeight: 600,
                            color: '#4b5563',
                            width: '40%',
                            textTransform: 'capitalize',
                          }}
                        >
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        <td style={{ padding: '6px 0', color: '#111827', fontWeight: 700 }}>
                          {typeof val === 'number'
                            ? terms.currency
                              ? `${val.toLocaleString()} ${String(terms.currency)}`
                              : val.toLocaleString()
                            : String(val ?? '')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Legal Text / Governance Declaration */}
          <div style={{ marginBottom: 32, fontSize: '0.8125rem', color: '#4b5563', lineHeight: 1.6 }}>
            <p style={{ marginBottom: 10 }}>
              This {typeDef.name} is issued in full accordance with corporate governance protocols and applicable laws.
              All contractual obligations, compensation commitments, and covenants agreed upon by authorized parties
              are binding pursuant to executed terms.
            </p>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 40, marginBottom: 28 }}>
            <div>
              <div style={{ width: 180, borderBottom: '1px solid #9ca3af', marginBottom: 6 }} />
              <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#111827' }}>
                {String(terms.signatoryName || document.signatoryName || 'Authorized Signatory')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {String(terms.signatoryTitle || document.signatoryTitle || 'CEO & Founder')}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>TaskNera Enterprise</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ width: 180, borderBottom: '1px solid #9ca3af', marginBottom: 6 }} />
              <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#111827' }}>
                {document.recipientName}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Recipient Acknowledgment</div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Signature & Date</div>
            </div>
          </div>

          {/* Tamper-Evident Digital Security Footer */}
          <div
            style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: 12,
              marginTop: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              color: '#6b7280',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={12} color="#10b981" />
              <span>Digital Security Token: <strong>{verificationToken}</strong></span>
            </div>
            <div>SHA-256: {checksum.substring(0, 16)}...{checksum.substring(48)}</div>
          </div>
        </div>
      )}
    </div>
  );
};
