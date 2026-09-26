import {
  PreGenerationStatus,
  PreGenerationCheckCategory,
  PreGenerationCheckIssue,
  CategoryAuditResult,
  PreGenerationCheckResult,
} from '../ai/types.js';
import { AiService } from '../ai/ai.service.js';
import { OfferTemplateUtil, OfferRenderContext } from './offer-template.util.js';

export interface PreGenerationAuditPayload {
  candidate?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    currentLocation?: string;
    currentTitle?: string;
    currentEmployer?: string;
    qualification?: string;
    experienceYears?: number;
  };
  company?: {
    name?: string;
    legalName?: string;
    domain?: string;
    address?: string;
    signatoryName?: string;
    signatoryTitle?: string;
  };
  jobDetails?: {
    jobTitle?: string;
    department?: string;
    bandGrade?: string;
    workLocation?: string;
    employmentType?: string;
    proposedJoiningDate?: string | Date;
    reportingManagerName?: string;
    reportingManagerTitle?: string;
  };
  compensation?: {
    currency?: string;
    baseSalary?: number;
    hraAllowance?: number;
    specialAllowances?: number;
    performanceBonus?: number;
    joiningBonus?: number;
    totalCtc?: number;
    equityDetails?: Record<string, unknown>;
    benefitsSummary?: string[];
  };
  terms?: {
    probationDurationDays?: number;
    probationDurationMonths?: number;
    noticePeriodDays?: number;
    probationNoticePeriodDays?: number;
    workingHoursPerWeek?: number;
    workSchedule?: string;
    workModel?: string;
    offerValidUntil?: string | Date;
    clauses?: Array<{
      id?: string;
      title: string;
      content: string;
      isMandatory?: boolean;
      category?: string;
    }>;
  };
  templateMarkup?: {
    contentMarkup?: string;
    headerMarkup?: string;
    footerMarkup?: string;
    styleCss?: string;
  };
  renderedHtml?: string;
  plainText?: string;
}

export class PreGenerationAuditService {
  /**
   * Performs the comprehensive pre-generation check across all 9 required categories.
   * STRICT PRINCIPLE: AI flags issues, never silently modifies the offer.
   */
  static async performAudit(
    payload: PreGenerationAuditPayload
  ): Promise<PreGenerationCheckResult> {
    const candidate = payload.candidate || {};
    const company = payload.company || { name: 'Acme Technologies Inc.', legalName: 'Acme Technologies Inc.' };
    const job = payload.jobDetails || {};
    const comp = payload.compensation || { baseSalary: 0, totalCtc: 0, currency: 'USD' };
    const terms = payload.terms || {};
    const clauses = terms.clauses || [];

    const issues: PreGenerationCheckIssue[] = [];

    // Helper for adding issues
    const addIssue = (
      category: PreGenerationCheckCategory,
      severity: 'CRITICAL' | 'WARNING' | 'INFO',
      title: string,
      issue: string,
      recommendation: string,
      fieldOrLocation?: string,
      detectedValue?: unknown,
      expectedCondition?: string
    ) => {
      issues.push({
        id: `chk_${category}_${issues.length + 1}_${Math.random().toString(36).substring(2, 6)}`,
        category,
        severity,
        title,
        issue,
        recommendation,
        fieldOrLocation,
        detectedValue,
        expectedCondition,
      });
    };

    // -------------------------------------------------------------------------
    // 1. MISSING REQUIRED FIELDS
    // -------------------------------------------------------------------------
    const missingFields: string[] = [];
    if (!job.jobTitle || !job.jobTitle.trim()) {
      missingFields.push('Job Title');
      addIssue(
        'missing_required_fields',
        'CRITICAL',
        'Missing Job Title',
        'The job designation/title is not specified.',
        'Enter an official job title in Job Details before generating the offer.',
        'jobDetails.jobTitle',
        job.jobTitle,
        'Non-empty string'
      );
    }

    if (!job.department || !job.department.trim()) {
      missingFields.push('Department');
      addIssue(
        'missing_required_fields',
        'CRITICAL',
        'Missing Department',
        'The operational department or business unit is missing.',
        'Assign a department to ensure proper organizational placement.',
        'jobDetails.department',
        job.department,
        'Non-empty string'
      );
    }

    if (!job.workLocation || !job.workLocation.trim()) {
      missingFields.push('Work Location');
      addIssue(
        'missing_required_fields',
        'CRITICAL',
        'Missing Work Location',
        'The primary work location (city or remote) is missing.',
        'Specify the employment location or declare fully remote.',
        'jobDetails.workLocation',
        job.workLocation,
        'Non-empty string'
      );
    }

    if (!job.employmentType) {
      missingFields.push('Employment Type');
      addIssue(
        'missing_required_fields',
        'CRITICAL',
        'Missing Employment Type',
        'Employment classification (FULL_TIME, CONTRACT, etc.) is missing.',
        'Select the appropriate employment classification.',
        'jobDetails.employmentType',
        job.employmentType,
        'Valid template category'
      );
    }

    if (!job.proposedJoiningDate) {
      missingFields.push('Proposed Joining Date');
      addIssue(
        'missing_required_fields',
        'CRITICAL',
        'Missing Proposed Joining Date',
        'The start date for the candidate is required.',
        'Specify an agreed future starting date.',
        'jobDetails.proposedJoiningDate',
        job.proposedJoiningDate,
        'Valid ISO Date'
      );
    }

    if (comp.baseSalary === undefined || comp.baseSalary === null || comp.baseSalary <= 0) {
      missingFields.push('Base Salary');
      addIssue(
        'missing_required_fields',
        'CRITICAL',
        'Missing or Invalid Base Salary',
        'Annual base compensation is missing or equal to zero.',
        'Input a positive base salary figure approved by HR and finance.',
        'compensation.baseSalary',
        comp.baseSalary,
        'Positive number > 0'
      );
    }

    if (comp.totalCtc === undefined || comp.totalCtc === null || comp.totalCtc <= 0) {
      missingFields.push('Total CTC');
      addIssue(
        'missing_required_fields',
        'CRITICAL',
        'Missing or Invalid Total CTC',
        'Total Cost to Company (CTC) package is missing or zero.',
        'Define total compensation package reflecting all fixed and variable components.',
        'compensation.totalCtc',
        comp.totalCtc,
        'Positive number > 0'
      );
    }

    if (!comp.currency || !comp.currency.trim()) {
      addIssue(
        'missing_required_fields',
        'WARNING',
        'Currency Not Specified',
        'Compensation currency is not explicitly declared.',
        'Verify currency (e.g. USD, EUR, INR) to prevent cross-border confusion.',
        'compensation.currency',
        comp.currency,
        'ISO 4217 Currency Code'
      );
    }

    // -------------------------------------------------------------------------
    // 2. MISSING CANDIDATE / COMPANY INFORMATION
    // -------------------------------------------------------------------------
    if (!candidate.firstName || !candidate.firstName.trim()) {
      addIssue(
        'missing_candidate_company_info',
        'CRITICAL',
        'Missing Candidate First Name',
        'Candidate first name is blank.',
        'Provide the candidate legal first name.',
        'candidate.firstName',
        candidate.firstName,
        'Legal first name'
      );
    }

    if (!candidate.lastName || !candidate.lastName.trim()) {
      addIssue(
        'missing_candidate_company_info',
        'WARNING',
        'Missing Candidate Last Name',
        'Candidate last name is blank or incomplete.',
        'Confirm full legal surname for binding contract execution.',
        'candidate.lastName',
        candidate.lastName,
        'Legal surname'
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!candidate.email || !candidate.email.trim()) {
      addIssue(
        'missing_candidate_company_info',
        'CRITICAL',
        'Missing Candidate Email',
        'Official recipient email is required to deliver the offer.',
        'Input a valid personal or professional email address.',
        'candidate.email',
        candidate.email,
        'Valid email format'
      );
    } else if (!emailRegex.test(candidate.email)) {
      addIssue(
        'missing_candidate_company_info',
        'CRITICAL',
        'Malformed Candidate Email',
        `Email address "${candidate.email}" does not match standard email format.`,
        'Correct email spelling to ensure secure delivery.',
        'candidate.email',
        candidate.email,
        'user@domain.com'
      );
    }

    if (!candidate.phone || !candidate.phone.trim()) {
      addIssue(
        'missing_candidate_company_info',
        'WARNING',
        'Missing Candidate Phone Number',
        'Contact phone number is omitted.',
        'Add candidate phone number for recruiter follow-up.',
        'candidate.phone',
        candidate.phone,
        'E.164 phone string'
      );
    }

    if (!candidate.address && !candidate.currentLocation) {
      addIssue(
        'missing_candidate_company_info',
        'WARNING',
        'Missing Candidate Address',
        'Residential or mailing address is not recorded.',
        'Include postal address for tax and state employment compliance.',
        'candidate.address',
        candidate.address,
        'Residential postal address'
      );
    }

    if (!company.name || !company.name.trim()) {
      addIssue(
        'missing_candidate_company_info',
        'CRITICAL',
        'Missing Company Entity Name',
        'The issuing company corporate entity name is missing.',
        'Select or configure the legal entity issuing this employment agreement.',
        'company.name',
        company.name,
        'Registered company name'
      );
    }

    if (!company.signatoryName || !company.signatoryName.trim()) {
      addIssue(
        'missing_candidate_company_info',
        'WARNING',
        'Missing Authorized Signatory Name',
        'No authorized corporate signatory name has been designated for the signature block.',
        'Designate a VP, HR Director, or CEO signatory before sending.',
        'company.signatoryName',
        company.signatoryName,
        'Full name of signatory'
      );
    }

    // -------------------------------------------------------------------------
    // 3. DATE INCONSISTENCIES
    // -------------------------------------------------------------------------
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    let joiningDateObj: Date | null = null;
    if (job.proposedJoiningDate) {
      joiningDateObj = new Date(job.proposedJoiningDate);
      if (isNaN(joiningDateObj.getTime())) {
        addIssue(
          'date_inconsistencies',
          'CRITICAL',
          'Invalid Joining Date Format',
          `The joining date value "${job.proposedJoiningDate}" cannot be parsed into a date.`,
          'Provide a valid calendar date (YYYY-MM-DD).',
          'jobDetails.proposedJoiningDate',
          job.proposedJoiningDate,
          'Valid calendar date'
        );
      } else if (joiningDateObj.getTime() < todayStart) {
        addIssue(
          'date_inconsistencies',
          'CRITICAL',
          'Joining Date is in the Past',
          `Proposed joining date (${joiningDateObj.toLocaleDateString()}) is earlier than today's date.`,
          'Set a future date allowing adequate time for onboarding and notice handover.',
          'jobDetails.proposedJoiningDate',
          job.proposedJoiningDate,
          'Future date >= today'
        );
      }
    }

    let validityDateObj: Date | null = null;
    if (terms.offerValidUntil) {
      validityDateObj = new Date(terms.offerValidUntil);
      if (isNaN(validityDateObj.getTime())) {
        addIssue(
          'date_inconsistencies',
          'CRITICAL',
          'Invalid Offer Validity Date',
          `Offer expiration date "${terms.offerValidUntil}" is not a valid date.`,
          'Provide a valid calendar date.',
          'terms.offerValidUntil',
          terms.offerValidUntil,
          'Valid calendar date'
        );
      } else {
        if (validityDateObj.getTime() < todayStart) {
          addIssue(
            'date_inconsistencies',
            'CRITICAL',
            'Offer Validity Deadline Has Expired',
            `Offer valid-until date (${validityDateObj.toLocaleDateString()}) has already passed.`,
            'Extend the offer validity deadline so the candidate can legally execute it.',
            'terms.offerValidUntil',
            terms.offerValidUntil,
            'Future date'
          );
        }

        if (joiningDateObj && validityDateObj.getTime() > joiningDateObj.getTime()) {
          addIssue(
            'date_inconsistencies',
            'CRITICAL',
            'Validity Deadline After Joining Date',
            `Offer validity expiration (${validityDateObj.toLocaleDateString()}) occurs AFTER the proposed joining date (${joiningDateObj.toLocaleDateString()}). A candidate cannot execute an offer after their tenure begins.`,
            'Adjust offer validity to expire at least 3-7 business days before the joining date.',
            'terms.offerValidUntil',
            `Valid until ${validityDateObj.toLocaleDateString()} vs Joining ${joiningDateObj.toLocaleDateString()}`,
            'offerValidUntil <= proposedJoiningDate'
          );
        }
      }
    }

    const noticeDays = Number(terms.noticePeriodDays || 0);
    const probationDays = Number(terms.probationDurationDays || (terms.probationDurationMonths ? terms.probationDurationMonths * 30 : 0));

    if (noticeDays <= 0) {
      addIssue(
        'date_inconsistencies',
        'WARNING',
        'Unspecified or Zero Notice Period',
        'Notice period is set to 0 or unassigned.',
        'Declare standard statutory notice (e.g., 30 or 60 days).',
        'terms.noticePeriodDays',
        noticeDays,
        'Days >= 14'
      );
    } else if (noticeDays > 180) {
      addIssue(
        'date_inconsistencies',
        'WARNING',
        'Unusually Long Notice Period',
        `Notice period of ${noticeDays} days exceeds standard corporate guidelines (usually 30 to 90 days).`,
        'Verify if an executive notice period of 6+ months is intended.',
        'terms.noticePeriodDays',
        noticeDays,
        '14 to 90 days'
      );
    }

    if (terms.probationNoticePeriodDays && terms.noticePeriodDays) {
      if (terms.probationNoticePeriodDays > terms.noticePeriodDays) {
        addIssue(
          'date_inconsistencies',
          'CRITICAL',
          'Probation Notice Exceeds Standard Notice',
          `Notice period during probation (${terms.probationNoticePeriodDays} days) is greater than standard post-probation notice (${terms.noticePeriodDays} days), which contradicts employment practice.`,
          'Probation notice should be equal to or shorter than permanent tenure notice.',
          'terms.probationNoticePeriodDays',
          `${terms.probationNoticePeriodDays} > ${terms.noticePeriodDays}`,
          'probationNotice <= standardNotice'
        );
      }
    }

    if (probationDays > 365) {
      addIssue(
        'date_inconsistencies',
        'WARNING',
        'Probation Exceeds 12 Months',
        `Probation duration of ${probationDays} days is exceptionally lengthy.`,
        'Standard probation periods range between 90 and 180 days.',
        'terms.probationDurationDays',
        probationDays,
        '<= 180 days'
      );
    }

    // -------------------------------------------------------------------------
    // 4. DESIGNATION INCONSISTENCIES
    // -------------------------------------------------------------------------
    const titleLower = (job.jobTitle || '').toLowerCase();
    const bandLower = (job.bandGrade || '').toLowerCase();

    // Check senior titles paired with entry grades
    const executiveSeniorKeywords = ['director', 'vp', 'vice president', 'head of', 'chief', 'principal', 'staff architect', 'distinguished'];
    const juniorGradeKeywords = ['l1', 'l2', 'entry', 'junior', 'associate', 'intern', 'trainee', 'grade 1', 'level 1'];

    const hasSeniorTitle = executiveSeniorKeywords.some((kw) => titleLower.includes(kw));
    const hasJuniorGrade = juniorGradeKeywords.some((kw) => bandLower.includes(kw));

    if (hasSeniorTitle && hasJuniorGrade) {
      addIssue(
        'designation_inconsistencies',
        'CRITICAL',
        'Seniority & Band Grade Contradiction',
        `Executive/Staff job title "${job.jobTitle}" is mapped to a junior band grade "${job.bandGrade}".`,
        'Align the compensation band with executive rank or adjust the job title.',
        'jobDetails.bandGrade',
        `${job.jobTitle} @ ${job.bandGrade}`,
        'Compatible seniority tier'
      );
    }

    // Check junior titles with executive grades
    const juniorTitleKeywords = ['intern', 'junior', 'trainee', 'apprentice'];
    const seniorGradeKeywords = ['l6', 'l7', 'l8', 'director', 'executive', 'partner', 'grade 6', 'grade 7'];
    const hasJuniorTitle = juniorTitleKeywords.some((kw) => titleLower.includes(kw));
    const hasSeniorGrade = seniorGradeKeywords.some((kw) => bandLower.includes(kw));

    if (hasJuniorTitle && hasSeniorGrade) {
      addIssue(
        'designation_inconsistencies',
        'CRITICAL',
        'Entry Role Assigned to Executive Band',
        `Junior/Intern title "${job.jobTitle}" is mapped to an executive band grade "${job.bandGrade}".`,
        'Verify proper band grading.',
        'jobDetails.bandGrade',
        `${job.jobTitle} @ ${job.bandGrade}`,
        'Compatible seniority tier'
      );
    }

    // Check Candidate background vs Offered Designation
    if (candidate.currentTitle && job.jobTitle) {
      const curLower = candidate.currentTitle.toLowerCase();
      // If current title is Architect/Director/Lead and offered title is completely divergent without note
      if ((curLower.includes('architect') || curLower.includes('director')) && titleLower.includes('sales')) {
        addIssue(
          'designation_inconsistencies',
          'WARNING',
          'Divergent Professional Designation',
          `Offered title "${job.jobTitle}" represents a cross-discipline divergence from candidate's recorded background "${candidate.currentTitle}".`,
          'Ensure recruiter and hiring committee intended this career track transition.',
          'jobDetails.jobTitle',
          `${candidate.currentTitle} -> ${job.jobTitle}`
        );
      }
    }

    // -------------------------------------------------------------------------
    // 5. SALARY INCONSISTENCIES
    // -------------------------------------------------------------------------
    const base = Number(comp.baseSalary || 0);
    const hra = Number(comp.hraAllowance || 0);
    const special = Number(comp.specialAllowances || 0);
    const bonus = Number(comp.performanceBonus || 0);
    const joining = Number(comp.joiningBonus || 0);
    const statedCtc = Number(comp.totalCtc || 0);

    const computedBreakdownSum = base + hra + special + bonus + joining;
    const mathDiscrepancy = Math.abs(statedCtc - computedBreakdownSum);

    if (statedCtc > 0 && mathDiscrepancy >= 1) {
      addIssue(
        'salary_inconsistencies',
        'CRITICAL',
        'Total CTC Arithmetic Discrepancy',
        `Stated Total CTC (${comp.currency || '$'} ${statedCtc.toLocaleString()}) does not match component sum (${comp.currency || '$'} ${computedBreakdownSum.toLocaleString()}). Discrepancy of ${comp.currency || '$'} ${mathDiscrepancy.toLocaleString()}.`,
        'Recalculate or balance compensation breakdown to match the stated CTC figure.',
        'compensation.totalCtc',
        `Stated: ${statedCtc} vs Sum: ${computedBreakdownSum}`,
        'statedTotalCtc === sumOfComponents'
      );
    }

    if (base < 0 || hra < 0 || special < 0 || bonus < 0 || joining < 0 || statedCtc < 0) {
      addIssue(
        'salary_inconsistencies',
        'CRITICAL',
        'Negative Compensation Values Detected',
        'One or more compensation components have a negative monetary value.',
        'Ensure all salary allowances and bonuses are non-negative.',
        'compensation',
        { base, hra, special, bonus, joining, statedCtc },
        'All numbers >= 0'
      );
    }

    if (base > statedCtc && statedCtc > 0) {
      addIssue(
        'salary_inconsistencies',
        'CRITICAL',
        'Base Salary Exceeds Total CTC',
        `Base salary (${comp.currency || '$'} ${base.toLocaleString()}) cannot be greater than Total CTC (${comp.currency || '$'} ${statedCtc.toLocaleString()}).`,
        'Adjust CTC or base salary parameters.',
        'compensation.baseSalary',
        `${base} > ${statedCtc}`,
        'baseSalary <= totalCtc'
      );
    }

    if (bonus > base && base > 0) {
      addIssue(
        'salary_inconsistencies',
        'WARNING',
        'Performance Bonus Exceeds 100% of Base Salary',
        `Performance bonus target (${comp.currency || '$'} ${bonus.toLocaleString()}) exceeds the entire annual base salary (${comp.currency || '$'} ${base.toLocaleString()}).`,
        'Verify if commission or aggressive sales variable scheme is structured correctly.',
        'compensation.performanceBonus',
        `${bonus} > ${base}`,
        'performanceBonus <= baseSalary for standard salaried staff'
      );
    }

    // -------------------------------------------------------------------------
    // 6. MISSING CLAUSES
    // -------------------------------------------------------------------------
    const clauseTitlesAndContents = clauses
      .map((c) => `${c.title} ${c.content}`.toLowerCase())
      .join(' ');

    const hasNda =
      clauseTitlesAndContents.includes('confidential') ||
      clauseTitlesAndContents.includes('non-disclosure') ||
      clauseTitlesAndContents.includes('proprietary information') ||
      clauseTitlesAndContents.includes('trade secrets') ||
      clauses.some((c) => c.category === 'CONFIDENTIALITY');

    if (!hasNda) {
      addIssue(
        'missing_clauses',
        'CRITICAL',
        'Missing Confidentiality & NDA Clause',
        'Mandatory Non-Disclosure & Proprietary Information clause is not present in contract clauses.',
        'Include standard corporate Confidentiality / NDA clause to protect organizational IP and trade secrets.',
        'terms.clauses',
        'Absent',
        'Mandatory legal requirement'
      );
    }

    const hasIp =
      clauseTitlesAndContents.includes('intellectual property') ||
      clauseTitlesAndContents.includes('inventions') ||
      clauseTitlesAndContents.includes('patents') ||
      clauseTitlesAndContents.includes('works for hire') ||
      clauseTitlesAndContents.includes('copyright') ||
      clauses.some((c) => c.category === 'IP');

    if (!hasIp) {
      addIssue(
        'missing_clauses',
        'CRITICAL',
        'Missing Intellectual Property Assignment Clause',
        'Mandatory Inventions and Intellectual Property Assignment clause is missing.',
        'Ensure company retains ownership of inventions created during candidate tenure.',
        'terms.clauses',
        'Absent',
        'Mandatory legal requirement'
      );
    }

    const hasTermination =
      clauseTitlesAndContents.includes('termination') ||
      clauseTitlesAndContents.includes('at-will') ||
      clauseTitlesAndContents.includes('separation') ||
      clauseTitlesAndContents.includes('resignation') ||
      clauses.some((c) => c.category === 'TERMS');

    if (!hasTermination) {
      addIssue(
        'missing_clauses',
        'CRITICAL',
        'Missing Termination & Notice Clause',
        'Mandatory Termination and Notice Period clause is absent.',
        'Include termination terms defining notice rights for employer and employee.',
        'terms.clauses',
        'Absent',
        'Mandatory legal requirement'
      );
    }

    const hasGoverningLaw =
      clauseTitlesAndContents.includes('governing law') ||
      clauseTitlesAndContents.includes('jurisdiction') ||
      clauseTitlesAndContents.includes('dispute') ||
      clauseTitlesAndContents.includes('arbitration');

    if (!hasGoverningLaw) {
      addIssue(
        'missing_clauses',
        'WARNING',
        'Missing Governing Law & Dispute Resolution Clause',
        'No explicit governing law or jurisdiction clause was found.',
        'Recommend adding governing state/national jurisdiction clause for dispute resolution.',
        'terms.clauses',
        'Absent',
        'Recommended corporate practice'
      );
    }

    // -------------------------------------------------------------------------
    // 7. UNREPLACED PLACEHOLDERS
    // -------------------------------------------------------------------------
    // Scan rendered text, template markup, and clause texts for unpopulated {{tags}}
    const textPoolsToScan: string[] = [
      payload.renderedHtml || '',
      payload.plainText || '',
      payload.templateMarkup?.contentMarkup || '',
      payload.templateMarkup?.headerMarkup || '',
      payload.templateMarkup?.footerMarkup || '',
      ...clauses.map((c) => `${c.title} ${c.content}`),
    ];

    const unreplacedMatches = new Set<string>();
    const placeholderRegex = /\{\{([a-zA-Z0-9_\-\.]+)\}\}/g;

    for (const text of textPoolsToScan) {
      let match;
      while ((match = placeholderRegex.exec(text)) !== null) {
        // Exclude system placeholders that will be injected at render time if text is raw template
        const ph = match[0];
        // If this is in rendered document, it is strictly unreplaced
        if (payload.renderedHtml && payload.renderedHtml.includes(ph)) {
          unreplacedMatches.add(ph);
        } else if (textPoolsToScan[0] === '' && ph) {
          // If no renderedHtml passed, check clauses for literal unresolved tags
          unreplacedMatches.add(ph);
        }
      }
    }

    if (unreplacedMatches.size > 0) {
      const tagList = Array.from(unreplacedMatches).join(', ');
      addIssue(
        'unreplaced_placeholders',
        'CRITICAL',
        'Unreplaced Placeholder Tags Detected',
        `Found ${unreplacedMatches.size} unresolved template tag(s) in document markup: ${tagList}. Issuing a contract with literal {{placeholder}} tags renders the offer defective.`,
        'Populate all candidate, role, and corporate fields so every template tag interpolates correctly.',
        'renderedDocument',
        tagList,
        'Zero {{...}} tags in finalized document'
      );
    }

    // -------------------------------------------------------------------------
    // 8. CONTENT / FORMATTING ISSUES
    // -------------------------------------------------------------------------
    const combinedDocText = [
      payload.plainText || '',
      payload.renderedHtml || '',
      ...clauses.map((c) => c.content),
    ].join(' ');

    // Check for JavaScript artifacts: undefined, null, NaN, [object Object]
    const jsArtifacts = ['undefined', 'null', 'NaN', '[object Object]', '[object]'];
    for (const artifact of jsArtifacts) {
      // Regex with word boundaries
      const re = new RegExp(`\\b${artifact.replace(/\[|\]/g, '\\$&')}\\b`, 'g');
      if (re.test(combinedDocText)) {
        addIssue(
          'content_formatting_issues',
          'CRITICAL',
          `Programmatic Literal "${artifact}" Found in Document Text`,
          `The document contains literal "${artifact}" text, indicating missing data interpolation.`,
          `Review document text and replace "${artifact}" with official terms.`,
          'documentContent',
          artifact,
          'No programmatic artifacts'
        );
      }
    }

    // Check for empty clauses
    for (let i = 0; i < clauses.length; i++) {
      const cls = clauses[i];
      const strippedContent = cls.content.replace(/<[^>]+>/g, '').trim();
      if (strippedContent.length < 15) {
        addIssue(
          'content_formatting_issues',
          'CRITICAL',
          `Clause "${cls.title}" Has Truncated or Empty Content`,
          `Clause ${i + 1} ("${cls.title}") has only ${strippedContent.length} character(s) of body text.`,
          'Provide substantive legal text or remove the empty clause.',
          `terms.clauses[${i}]`,
          cls.content,
          'Substantive clause text > 15 characters'
        );
      }
    }

    // Check for unclosed HTML tags in rendered markup
    if (payload.renderedHtml) {
      const openDivs = (payload.renderedHtml.match(/<div\b/gi) || []).length;
      const closeDivs = (payload.renderedHtml.match(/<\/div>/gi) || []).length;
      if (openDivs !== closeDivs) {
        addIssue(
          'content_formatting_issues',
          'WARNING',
          'Unbalanced HTML <div> Tags',
          `Markup has ${openDivs} opening <div> tags and ${closeDivs} closing </div> tags, which may cause PDF layout corruption.`,
          'Verify template markup structure.',
          'renderedHtml',
          `open: ${openDivs}, close: ${closeDivs}`,
          'openDivs === closeDivs'
        );
      }

      const openTables = (payload.renderedHtml.match(/<table\b/gi) || []).length;
      const closeTables = (payload.renderedHtml.match(/<\/table>/gi) || []).length;
      if (openTables !== closeTables) {
        addIssue(
          'content_formatting_issues',
          'CRITICAL',
          'Unbalanced HTML <table> Tags',
          `Table opening tags (${openTables}) do not match closing tags (${closeTables}).`,
          'Fix table markup before printing or exporting to PDF.',
          'renderedHtml',
          `open: ${openTables}, close: ${closeTables}`,
          'openTables === closeTables'
        );
      }
    }

    // -------------------------------------------------------------------------
    // 9. CONTRADICTIONS
    // -------------------------------------------------------------------------
    const locationLower = (job.workLocation || '').toLowerCase();
    const clausesLower = clauseTitlesAndContents;

    // A. Location contradiction (Remote vs Mandatory Onsite)
    const isRemote = locationLower.includes('remote');
    const demandsMandatoryOnsite =
      clausesLower.includes('mandatory 5 days in office') ||
      clausesLower.includes('must report daily to headquarters') ||
      clausesLower.includes('100% in-office attendance required') ||
      clausesLower.includes('mandatory on-site presence five days a week');

    if (isRemote && demandsMandatoryOnsite) {
      addIssue(
        'contradictions',
        'CRITICAL',
        'Remote Location Contradicted by Mandatory In-Office Clause',
        `Offer designation declares role as Remote (${job.workLocation}), but clause conditions demand mandatory full-time on-site office attendance.`,
        'Reconcile work location and clause text to reflect agreed hybrid/remote policy.',
        'jobDetails.workLocation vs terms.clauses',
        'Remote vs Mandatory 5-day onsite'
      );
    }

    // B. Employment Type contradiction (Part-time vs 40 hours)
    const empType = (job.employmentType || '').toUpperCase();
    const hours = terms.workingHoursPerWeek || 0;
    if (empType === 'PART_TIME' && hours >= 40) {
      addIssue(
        'contradictions',
        'CRITICAL',
        'Part-Time Classification Contradicted by Full-Time Hours',
        `Employment type is designated PART_TIME, but working hours are specified as ${hours} hours per week (standard full-time is 40).`,
        'Adjust employment type to FULL_TIME or reduce hours to part-time schedule (< 30 hrs/wk).',
        'jobDetails.employmentType vs terms.workingHoursPerWeek',
        `PART_TIME with ${hours} hrs/week`
      );
    }

    // C. Notice period contradiction (Summary days vs Clause text)
    // Scan clause text for explicit days mention like "60 days notice" when summary says 30
    if (noticeDays > 0) {
      const noticeMatches = clausesLower.match(/(\d+)\s*(calendar\s*)?days(\s*written)?\s*notice/gi);
      if (noticeMatches) {
        for (const nm of noticeMatches) {
          const numMatch = nm.match(/\d+/);
          if (numMatch) {
            const foundDays = parseInt(numMatch[0], 10);
            if (foundDays !== noticeDays && Math.abs(foundDays - noticeDays) >= 15) {
              addIssue(
                'contradictions',
                'CRITICAL',
                'Notice Period Summary Contradicts Clause Text',
                `Stated notice period is ${noticeDays} days in terms summary, but clause text stipulates "${nm}".`,
                'Reconcile notice period in terms schedule with contract body clause.',
                'terms.noticePeriodDays vs terms.clauses',
                `Summary: ${noticeDays} days vs Clause: ${foundDays} days`
              );
              break;
            }
          }
        }
      }
    }

    // D. Probation period contradiction (Summary vs Clause text)
    if (probationDays > 0) {
      const probationMatches = clausesLower.match(/(\d+)\s*(calendar\s*)?(months|days)\s*probation/gi);
      if (probationMatches) {
        for (const pm of probationMatches) {
          const numMatch = pm.match(/\d+/);
          const isMonths = pm.toLowerCase().includes('month');
          if (numMatch) {
            const foundDays = isMonths ? parseInt(numMatch[0], 10) * 30 : parseInt(numMatch[0], 10);
            if (foundDays !== probationDays && Math.abs(foundDays - probationDays) >= 20) {
              addIssue(
                'contradictions',
                'CRITICAL',
                'Probation Period Summary Contradicts Clause Text',
                `Stated probation period is ${probationDays} days, but clause text specifies "${pm}".`,
                'Update probation duration so summary matches clause text exactly.',
                'terms.probationDurationDays vs terms.clauses',
                `Summary: ${probationDays} days vs Clause: ${pm}`
              );
              break;
            }
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // OPTIONAL: AI Semantic Contradiction / Policy Scan (Enhancement)
    // -------------------------------------------------------------------------
    try {
      const semanticAudit = await AiService.performPreGenerationSemanticAudit({
        candidate,
        job,
        compensation: comp,
        terms: {
          noticeDays,
          probationDays,
          hours,
          clauses: clauses.map((c) => ({ title: c.title, content: c.content })),
        },
      });

      if (semanticAudit.semanticContradictions && semanticAudit.semanticContradictions.length > 0) {
        for (const sc of semanticAudit.semanticContradictions) {
          addIssue(
            'contradictions',
            'CRITICAL',
            'Semantic Legal Contradiction Detected by AI',
            sc,
            'Review conflicting contractual provisions and confirm intended wording with legal counsel.',
            'terms.clauses'
          );
        }
      }

      if (semanticAudit.designationAnomalies && semanticAudit.designationAnomalies.length > 0) {
        for (const da of semanticAudit.designationAnomalies) {
          addIssue(
            'designation_inconsistencies',
            'WARNING',
            'Designation Anomaly Flagged by AI',
            da,
            'Verify designation aligns with corporate organizational chart.',
            'jobDetails.jobTitle'
          );
        }
      }
    } catch {
      // Offline fallback: deterministic checks above already provided comprehensive coverage
    }

    // -------------------------------------------------------------------------
    // AGGREGATE CHECKS INTO 9 STRUCTURED CATEGORIES
    // -------------------------------------------------------------------------
    const categoryTitles: Record<PreGenerationCheckCategory, string> = {
      missing_required_fields: 'Missing Required Fields',
      missing_candidate_company_info: 'Candidate & Company Information',
      date_inconsistencies: 'Date Consistency & Timelines',
      designation_inconsistencies: 'Designation & Seniority Alignment',
      salary_inconsistencies: 'Compensation Arithmetic & Structure',
      missing_clauses: 'Mandatory Legal Clauses',
      unreplaced_placeholders: 'Unreplaced Placeholder Tags',
      content_formatting_issues: 'Content & Formatting Integrity',
      contradictions: 'Contractual Contradictions & Term Conflicts',
    };

    const categories: PreGenerationCheckCategory[] = [
      'missing_required_fields',
      'missing_candidate_company_info',
      'date_inconsistencies',
      'designation_inconsistencies',
      'salary_inconsistencies',
      'missing_clauses',
      'unreplaced_placeholders',
      'content_formatting_issues',
      'contradictions',
    ];

    const checks: Record<PreGenerationCheckCategory, CategoryAuditResult> = {} as any;

    let totalCritical = 0;
    let totalWarnings = 0;

    for (const cat of categories) {
      const catIssues = issues.filter((i) => i.category === cat);
      const catCritical = catIssues.filter((i) => i.severity === 'CRITICAL').length;
      const catWarnings = catIssues.filter((i) => i.severity === 'WARNING').length;

      totalCritical += catCritical;
      totalWarnings += catWarnings;

      let catStatus: PreGenerationStatus = 'PASS';
      if (catCritical > 0) catStatus = 'REVIEW_REQUIRED';
      else if (catWarnings > 0) catStatus = 'WARNING';

      const passedChecks: string[] = [];
      if (cat === 'missing_required_fields' && missingFields.length === 0) {
        passedChecks.push('All 7 mandatory core fields populated');
      }
      if (cat === 'missing_candidate_company_info' && candidate.firstName && candidate.email && company.name) {
        passedChecks.push('Recipient identity and corporate issuing entity verified');
      }
      if (cat === 'date_inconsistencies' && catCritical === 0) {
        passedChecks.push('Timeline sequences valid and future-dated');
      }
      if (cat === 'designation_inconsistencies' && catCritical === 0) {
        passedChecks.push('Job title matches corporate hierarchy and compensation band');
      }
      if (cat === 'salary_inconsistencies' && catCritical === 0) {
        passedChecks.push('Compensation breakdown arithmetic fully balanced');
      }
      if (cat === 'missing_clauses' && catCritical === 0) {
        passedChecks.push('All required statutory protective clauses present');
      }
      if (cat === 'unreplaced_placeholders' && catIssues.length === 0) {
        passedChecks.push('Zero unreplaced template placeholders');
      }
      if (cat === 'content_formatting_issues' && catCritical === 0) {
        passedChecks.push('HTML and typography markup validated');
      }
      if (cat === 'contradictions' && catCritical === 0) {
        passedChecks.push('Zero legal or term contradictions identified');
      }

      checks[cat] = {
        category: cat,
        categoryTitle: categoryTitles[cat],
        status: catStatus,
        issues: catIssues,
        passedChecks,
      };
    }

    // -------------------------------------------------------------------------
    // OVERALL VERDICT: PASS | WARNING | REVIEW_REQUIRED
    // -------------------------------------------------------------------------
    let overallStatus: PreGenerationStatus = 'PASS';
    if (totalCritical > 0) {
      overallStatus = 'REVIEW_REQUIRED';
    } else if (totalWarnings > 0) {
      overallStatus = 'WARNING';
    }

    let summaryMessage = '';
    if (overallStatus === 'PASS') {
      summaryMessage = 'All 9 compliance and quality checks passed. Offer is verified for binding legal issuance.';
    } else if (overallStatus === 'WARNING') {
      summaryMessage = `Passed with ${totalWarnings} non-blocking warning(s). HR review advised before candidate issuance.`;
    } else {
      summaryMessage = `Audit failed with ${totalCritical} critical blocking issue(s). Final offer generation cannot proceed until resolved.`;
    }

    return {
      status: overallStatus,
      canProceed: overallStatus !== 'REVIEW_REQUIRED',
      summary: summaryMessage,
      totalIssuesCount: issues.length,
      criticalIssuesCount: totalCritical,
      warningsCount: totalWarnings,
      checks,
      allIssues: issues,
      aiAssistanceNotice:
        'AI Quality Assurance Principle: AI flags potential compliance risks and data inconsistencies for human HR review. AI never silently modifies or overwrites offer contract terms.',
      checkedAt: new Date().toISOString(),
    };
  }
}
