// =============================================================================
// EMPLOYEE & COMPANY FIELD MAPPING ENGINE (DETERMINISTIC FIRST, AI FALLBACK)
// =============================================================================
// Intelligently maps template placeholders ([Placeholder], {{placeholder}}, <<placeholder>>)
// to existing Employee and Company records in the database.
//
// Rules:
// 1. DETERMINISTIC FIRST: Exact match, then normalized fuzzy match.
// 2. AI FALLBACK SECOND: Only invoked when a placeholder cannot be confidently mapped.
// 3. STRICT GUARDRAIL: AI NEVER generates fake employee data or fictional numbers.
// 4. MULTI-EMPLOYEE ISOLATION: Pure, stateless mapping per request.
// =============================================================================

import { AiService } from '../ai/ai.service.js';
import { config } from '../../config/env.js';

export interface FieldMappingEntry {
  rawPlaceholder: string;
  normalizedKey: string;
  fieldKey: string | null;
  mappedValue: string;
  source: 'DETERMINISTIC' | 'FUZZY' | 'AI' | 'UNMAPPED';
  confidence: number; // 0.0 to 1.0
  isMapped: boolean;
  fieldLabel: string;
}

export interface NormalizedEmployeeDictionary {
  [canonicalKey: string]: {
    value: string;
    label: string;
  };
}

export class FieldMappingService {
  /**
   * Format dates consistently (e.g., "October 2, 2026")
   */
  private static formatDate(dateInput?: string | Date | null): string {
    if (!dateInput) {
      return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * Format currency values nicely
   */
  private static formatCurrency(amount: number, currency: string = 'USD'): string {
    const formattedNum = Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    const currUpper = (currency || 'USD').toUpperCase();
    if (currUpper === 'INR') {
      return `₹${formattedNum}`;
    }
    if (currUpper === 'USD') {
      return `$${formattedNum}`;
    }
    if (currUpper === 'EUR') {
      return `€${formattedNum}`;
    }
    if (currUpper === 'GBP') {
      return `£${formattedNum}`;
    }
    return `${currUpper} ${formattedNum}`;
  }

  /**
   * Build the normalized internal employee and company dictionary.
   * Uses real database records from Employee and Company models.
   */
  static buildEmployeeDataMap(employee: any, company?: any): NormalizedEmployeeDictionary {
    const today = this.formatDate(new Date());
    const curr = employee.currency || 'USD';
    const annualCtcNum = employee.annualCtc ? Number(employee.annualCtc) : 0;
    const annualCtcStr = annualCtcNum > 0 ? this.formatCurrency(annualCtcNum, curr) : 'Competitive';

    // Derived salary components if annual CTC is available
    const monthlyGrossNum = annualCtcNum > 0 ? Math.round(annualCtcNum / 12) : 0;
    const monthlyGrossStr = monthlyGrossNum > 0 ? this.formatCurrency(monthlyGrossNum, curr) : 'Competitive';

    const basicSalaryNum = monthlyGrossNum > 0 ? Math.round(monthlyGrossNum * 0.5) : 0;
    const basicSalaryStr = basicSalaryNum > 0 ? this.formatCurrency(basicSalaryNum, curr) : 'Competitive';

    const hraNum = basicSalaryNum > 0 ? Math.round(basicSalaryNum * 0.4) : 0;
    const hraStr = hraNum > 0 ? this.formatCurrency(hraNum, curr) : 'Competitive';

    const specialAllowanceNum = monthlyGrossNum > 0 ? Math.max(0, monthlyGrossNum - (basicSalaryNum + hraNum)) : 0;
    const specialAllowanceStr = specialAllowanceNum > 0 ? this.formatCurrency(specialAllowanceNum, curr) : 'Competitive';

    // Company attributes
    const compName = company?.legalName || company?.name || 'TaskNera Corp';
    let compAddress = 'Corporate Headquarters';
    if (company?.headquartersAddress) {
      if (typeof company.headquartersAddress === 'string') {
        compAddress = company.headquartersAddress;
      } else if (typeof company.headquartersAddress === 'object') {
        const addr = company.headquartersAddress as any;
        compAddress = [addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(', ') || compAddress;
      }
    }

    return {
      fullName: { value: employee.fullName || '', label: 'Employee Full Name' },
      employeeId: { value: employee.employeeId || '', label: 'Employee ID' },
      designation: { value: employee.designation || '', label: 'Designation / Job Title' },
      department: { value: employee.department || '', label: 'Department' },
      reportingManager: { value: employee.reportingManager || 'Leadership Team', label: 'Reporting Manager' },
      joiningDate: { value: this.formatDate(employee.joiningDate), label: 'Date of Joining' },
      employmentType: { value: employee.employmentType || 'Full-time', label: 'Employment Type' },
      workLocation: { value: employee.workLocation || 'Corporate Headquarters', label: 'Work Location' },
      annualCtc: { value: annualCtcStr, label: 'Annual CTC' },
      grossMonthlySalary: { value: monthlyGrossStr, label: 'Gross Monthly Salary' },
      basicSalary: { value: basicSalaryStr, label: 'Basic Salary' },
      hra: { value: hraStr, label: 'House Rent Allowance (HRA)' },
      specialAllowance: { value: specialAllowanceStr, label: 'Special / Other Allowance' },
      probationPeriod: { value: '90 days', label: 'Probation Period' },
      noticePeriod: { value: '30 days', label: 'Notice Period' },
      personalEmail: { value: employee.personalEmail || '', label: 'Personal Email' },
      officialEmail: { value: employee.officialEmail || employee.personalEmail || '', label: 'Official Email' },
      phone: { value: employee.phone || 'N/A', label: 'Phone Number' },
      currency: { value: curr, label: 'Salary Currency' },
      companyName: { value: compName, label: 'Company Name' },
      companyAddress: { value: compAddress, label: 'Company Address' },
      currentDate: { value: today, label: 'Issue Date / Current Date' },
      signatoryName: { value: 'Sarah Jenkins', label: 'Authorized Signatory Name' },
      signatoryTitle: { value: 'VP of People Operations', label: 'Authorized Signatory Title' },
    };
  }

  /**
   * Comprehensive alias-to-canonical dictionary for deterministic and fuzzy matching
   */
  public static readonly ALIAS_MAP: Record<string, string> = {
    // Full Name
    employeefullname: 'fullName',
    employeename: 'fullName',
    candidatefullname: 'fullName',
    candidatename: 'fullName',
    fullname: 'fullName',
    name: 'fullName',
    candidatefulllegalname: 'fullName',
    employeefulllegalname: 'fullName',
    legalname: 'fullName',
    applicantname: 'fullName',
    candidate: 'fullName',
    employee: 'fullName',

    // Employee ID
    employeeid: 'employeeId',
    employeecode: 'employeeId',
    empid: 'employeeId',
    empcode: 'employeeId',
    staffid: 'employeeId',
    provisionalemployeeid: 'employeeId',
    identificationnumber: 'employeeId',

    // Designation / Role
    designation: 'designation',
    jobtitle: 'designation',
    position: 'designation',
    role: 'designation',
    title: 'designation',
    jobrole: 'designation',
    assignedrole: 'designation',

    // Department
    department: 'department',
    dept: 'department',
    division: 'department',
    businessunit: 'department',
    team: 'department',

    // Reporting Manager
    reportingmanager: 'reportingManager',
    reportingperson: 'reportingManager',
    reportingto: 'reportingManager',
    reportsto: 'reportingManager',
    managername: 'reportingManager',
    manager: 'reportingManager',
    supervisor: 'reportingManager',
    directmanager: 'reportingManager',

    // Joining Date
    dateofjoining: 'joiningDate',
    joiningdate: 'joiningDate',
    startdate: 'joiningDate',
    commencementdate: 'joiningDate',
    effectivedate: 'joiningDate',
    appointmentdate: 'joiningDate',
    doj: 'joiningDate',

    // Employment Type
    employmenttype: 'employmentType',
    jobtype: 'employmentType',
    employmentstatus: 'employmentType',
    natureofemployment: 'employmentType',

    // Work Location
    worklocation: 'workLocation',
    location: 'workLocation',
    officelocation: 'workLocation',
    joblocation: 'workLocation',
    placeofposting: 'workLocation',
    baselocation: 'workLocation',
    city: 'workLocation',

    // Probation Period
    probationperiod: 'probationPeriod',
    probationduration: 'probationPeriod',
    probation: 'probationPeriod',
    probationaryperiod: 'probationPeriod',

    // Notice Period
    noticeperiod: 'noticePeriod',
    noticeduration: 'noticePeriod',
    periodofnotice: 'noticePeriod',

    // CTC & Compensation
    annualctc: 'annualCtc',
    totalctc: 'annualCtc',
    ctc: 'annualCtc',
    totalfixedctc: 'annualCtc',
    annualcompensation: 'annualCtc',
    annualsalary: 'annualCtc',
    compensation: 'annualCtc',
    salary: 'annualCtc',
    costtocompany: 'annualCtc',
    fixedctc: 'annualCtc',
    totalcompensation: 'annualCtc',

    // Monthly Gross
    grossmonthlysalary: 'grossMonthlySalary',
    monthlygross: 'grossMonthlySalary',
    monthlygrosssalary: 'grossMonthlySalary',
    grosssalary: 'grossMonthlySalary',
    grossmonthly: 'grossMonthlySalary',
    monthlysalary: 'grossMonthlySalary',

    // Basic Salary
    basicsalary: 'basicSalary',
    basicpay: 'basicSalary',
    basic: 'basicSalary',
    monthlybasic: 'basicSalary',

    // HRA
    hra: 'hra',
    houserentallowance: 'hra',

    // Special Allowance
    specialallowance: 'specialAllowance',
    otherallowance: 'specialAllowance',
    specialotherallowance: 'specialAllowance',
    allowance: 'specialAllowance',

    // Company Details
    companyname: 'companyName',
    organizationname: 'companyName',
    employername: 'companyName',
    companylegalname: 'companyName',
    company: 'companyName',
    companyaddress: 'companyAddress',
    headquartersaddress: 'companyAddress',
    corporateaddress: 'companyAddress',
    officeaddress: 'companyAddress',

    // Contacts
    personalemail: 'personalEmail',
    officialemail: 'officialEmail',
    email: 'officialEmail',
    emailaddress: 'officialEmail',
    candidateemail: 'personalEmail',
    phone: 'phone',
    phonenumber: 'phone',
    contactnumber: 'phone',
    mobile: 'phone',
    mobilenumber: 'phone',
    contactno: 'phone',

    // Dates
    date: 'currentDate',
    currentdate: 'currentDate',
    issuedate: 'currentDate',
    today: 'currentDate',
    dateofissue: 'currentDate',
    letterdate: 'currentDate',

    // Signatory
    signatoryname: 'signatoryName',
    authorizedsignatory: 'signatoryName',
    authorizedsignatoryname: 'signatoryName',
    signatorytitle: 'signatoryTitle',
    authorizedsignatorytitle: 'signatoryTitle',
    signatorydesignation: 'signatoryTitle',
    currency: 'currency',
  };

  /**
   * Cleans a raw placeholder string into a normalized alphanumeric key
   * e.g. "[Employee Full Name]" -> "employeefullname"
   * "{{employee_name}}" -> "employeename"
   * "<<Designation>>" -> "designation"
   * "Employee Name: _________" -> "employeename"
   */
  static normalizeToken(rawPlaceholder: string): string {
    return rawPlaceholder
      .replace(/^\[+|\]+$/g, '')
      .replace(/^\{+|\}+$/g, '')
      .replace(/^<+|>+$/g, '')
      .replace(/:?\s*_{2,}\s*$/, '') // remove underline blank markers
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase()
      .trim();
  }

  /**
   * Step 1 & 2: Deterministic & Fuzzy Mapping
   */
  static matchDeterministic(
    rawPlaceholder: string,
    dataMap: NormalizedEmployeeDictionary
  ): FieldMappingEntry | null {
    const cleanKey = this.normalizeToken(rawPlaceholder);
    if (!cleanKey) return null;

    const canonicalKey = this.ALIAS_MAP[cleanKey];
    if (canonicalKey && dataMap[canonicalKey]) {
      const field = dataMap[canonicalKey];
      return {
        rawPlaceholder,
        normalizedKey: cleanKey,
        fieldKey: canonicalKey,
        mappedValue: field.value,
        fieldLabel: field.label,
        source: 'DETERMINISTIC',
        confidence: 1.0,
        isMapped: true,
      };
    }

    // Secondary Fuzzy Match: check substring or prefix
    for (const [alias, targetKey] of Object.entries(this.ALIAS_MAP)) {
      if (cleanKey.includes(alias) || alias.includes(cleanKey)) {
        if (dataMap[targetKey]) {
          const field = dataMap[targetKey];
          return {
            rawPlaceholder,
            normalizedKey: cleanKey,
            fieldKey: targetKey,
            mappedValue: field.value,
            fieldLabel: field.label,
            source: 'FUZZY',
            confidence: 0.85,
            isMapped: true,
          };
        }
      }
    }

    return null;
  }

  /**
   * Step 3: AI-Powered Field Mapping (Fallback for non-obvious/novel placeholders)
   * The AI only maps the placeholder name to a canonical employee field key.
   * It DOES NOT generate or alter employee values.
   */
  static async mapWithAiFallback(
    unmappedPlaceholders: string[],
    dataMap: NormalizedEmployeeDictionary
  ): Promise<Record<string, FieldMappingEntry>> {
    const results: Record<string, FieldMappingEntry> = {};

    if (unmappedPlaceholders.length === 0) {
      return results;
    }

    const availableFields = Object.keys(dataMap).map((k) => ({
      key: k,
      label: dataMap[k].label,
    }));

    try {
      const prompt = `You are an HR document field mapping engine.
Match the following unknown template placeholders to the most suitable Employee database field keys.

Available database field keys:
${JSON.stringify(availableFields, null, 2)}

Unknown placeholders to map:
${JSON.stringify(unmappedPlaceholders, null, 2)}

STRICT RULES:
1. Only map if there is a strong semantic equivalence (e.g. "[Monthly Compensation]" -> "grossMonthlySalary", "[Candidate Full Legal Name]" -> "fullName").
2. If a placeholder has no matching concept in the available fields (e.g. "[Passport Number]", "[Prior Employer]"), return null for mappedField.
3. DO NOT invent fake data or new field keys.
4. Output strictly a JSON array with objects in this format:
[
  { "placeholder": "[Candidate Full Legal Name]", "mappedField": "fullName", "confidence": 0.95 },
  { "placeholder": "[Prior Company]", "mappedField": null, "confidence": 0 }
]`;

      const aiResponse = await AiService.executePrompt(prompt, {
        temperature: 0.1,
        maxTokens: 500,
      });

      // Parse JSON from response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const mappings: Array<{ placeholder: string; mappedField: string | null; confidence: number }> =
          JSON.parse(jsonMatch[0]);

        for (const item of mappings) {
          if (item.mappedField && dataMap[item.mappedField] && item.confidence >= 0.6) {
            const canonical = item.mappedField;
            const field = dataMap[canonical];
            results[item.placeholder] = {
              rawPlaceholder: item.placeholder,
              normalizedKey: this.normalizeToken(item.placeholder),
              fieldKey: canonical,
              mappedValue: field.value,
              fieldLabel: field.label,
              source: 'AI',
              confidence: Number(item.confidence) || 0.8,
              isMapped: true,
            };
          }
        }
      }
    } catch (err: any) {
      console.warn(`[FieldMappingService] AI fallback mapping skipped: ${err.message}`);
    }

    // For any placeholder still unmapped, mark as UNMAPPED
    for (const ph of unmappedPlaceholders) {
      if (!results[ph]) {
        results[ph] = {
          rawPlaceholder: ph,
          normalizedKey: this.normalizeToken(ph),
          fieldKey: null,
          mappedValue: '',
          fieldLabel: ph.replace(/[\[\]\{\}<>]/g, '').trim(),
          source: 'UNMAPPED',
          confidence: 0,
          isMapped: false,
        };
      }
    }

    return results;
  }

  /**
   * Main mapping entrypoint:
   * Maps a list of detected placeholders for an employee.
   * Priority:
   * 1. Deterministic
   * 2. Fuzzy
   * 3. AI Fallback (only for unmapped fields)
   */
  static async mapPlaceholdersForEmployee(
    placeholders: string[],
    employee: any,
    company?: any
  ): Promise<Record<string, FieldMappingEntry>> {
    const dataMap = this.buildEmployeeDataMap(employee, company);
    const finalMap: Record<string, FieldMappingEntry> = {};
    const unmappedList: string[] = [];

    // Step 1 & 2: Deterministic & Fuzzy
    for (const ph of placeholders) {
      const match = this.matchDeterministic(ph, dataMap);
      if (match) {
        finalMap[ph] = match;
      } else {
        unmappedList.push(ph);
      }
    }

    // Step 3: AI Fallback for unmapped fields
    if (unmappedList.length > 0) {
      const aiResults = await this.mapWithAiFallback(unmappedList, dataMap);
      for (const [ph, entry] of Object.entries(aiResults)) {
        finalMap[ph] = entry;
      }
    }

    return finalMap;
  }
}
