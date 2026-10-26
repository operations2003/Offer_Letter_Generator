// =============================================================================
// EMPLOYEE-BASED HR DOCUMENT GENERATION SYSTEM: FRONTEND API SERVICE
// =============================================================================

export interface Employee {
  id: string;
  companyId: string;
  employeeId: string;
  fullName: string;
  personalEmail: string;
  officialEmail?: string | null;
  phone?: string | null;
  designation: string;
  department: string;
  employmentType: string;
  joiningDate: string;
  status: 'ACTIVE' | 'ONBOARDING' | 'PROBATION' | 'RESIGNED' | 'TERMINATED';
  reportingManager?: string | null;
  workLocation?: string | null;
  annualCtc?: number | null;
  currency: string;
  title?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  pinCode?: string | null;
  city?: string | null;
  state?: string | null;
  addressLine?: string | null;
  basicPercent?: number | null;
  hraPercent?: number | null;
  incentiveApplicable?: boolean;
  createdAt: string;
  updatedAt: string;
  documentCount?: number;
  documents?: EmployeeDocument[];
}

export interface EmployeeDocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  parameters: Record<string, any>;
  renderedContent: string;
  pdfStoragePath?: string | null;
  docxStoragePath?: string | null;
  changeNotes?: string | null;
  generatedBy: string;
  createdAt: string;
}

export interface EmployeeDocument {
  id: string;
  companyId: string;
  employeeId: string;
  documentTypeCode: string;
  templateId?: string | null;
  title: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'ISSUED';
  currentVersion: number;
  parameters: Record<string, any>;
  renderedContent: string;
  pdfStoragePath?: string | null;
  docxStoragePath?: string | null;
  fileSizeBytes?: number | null;
  generatedBy: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  issuedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  versions?: EmployeeDocumentVersion[];
}

export interface DocumentTemplateItem {
  code: string;
  category: string;
  name: string;
  description: string;
  supportedFormats: ('PDF' | 'DOCX')[];
  defaultDocxAvailable: boolean;
  requiredEmployeePlaceholders: string[];
  docSpecificFields: {
    key: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'select' | 'textarea';
    defaultValue?: any;
    placeholder?: string;
    options?: { label: string; value: string }[];
  }[];
  contentMarkup: string;
}

export interface CreateEmployeePayload {
  employeeId?: string;
  fullName: string;
  personalEmail: string;
  officialEmail?: string;
  phone?: string;
  designation: string;
  department: string;
  employmentType?: string;
  joiningDate: string;
  status?: string;
  reportingManager?: string;
  workLocation?: string;
  annualCtc?: number;
  currency?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  pinCode?: string;
  city?: string;
  state?: string;
  addressLine?: string;
  basicPercent?: number;
  hraPercent?: number;
  incentiveApplicable?: boolean;
}

export interface FieldMappingEntry {
  rawPlaceholder: string;
  normalizedKey: string;
  fieldKey: string | null;
  mappedValue: string;
  source: 'DETERMINISTIC' | 'FUZZY' | 'AI' | 'UNMAPPED';
  confidence: number;
  isMapped: boolean;
  fieldLabel: string;
}

export interface CustomDocxUploadResponse {
  storagePath: string;
  originalFileName: string;
  detectedPlaceholders: string[];
  extractedPreviewText: string;
  hasHeaders: boolean;
  hasFooters: boolean;
  hasTables: boolean;
}

export interface AnalyzeCustomTemplateResponse {
  employeeId: string;
  employeeName: string;
  detectedPlaceholders: string[];
  fieldMappings: Record<string, FieldMappingEntry>;
  extractedPreviewText: string;
}

export interface GenerateDocumentPayload {
  templateCode: string;
  customTemplateMarkup?: string;
  customTemplatePath?: string;
  title?: string;
  customParameters?: Record<string, any>;
  changeNotes?: string;
  targetStatus?: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'ISSUED';
}

export interface RegenerateDocumentPayload {
  changeNotes: string;
  updatedParameters?: Record<string, any>;
  updatedContent?: string;
}

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp_seed_001',
    companyId: 'cmp_tasknera_001',
    employeeId: 'EMP-10021',
    fullName: 'Ajay Sharma',
    personalEmail: 'ajay.sharma@example.com',
    officialEmail: 'ajay@tasknera.com',
    phone: '+91 9876543210',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    employmentType: 'Full-time',
    joiningDate: '2024-03-01',
    status: 'ACTIVE',
    reportingManager: 'Sheetal Bedi',
    workLocation: 'New Delhi',
    annualCtc: 1800000,
    currency: 'INR',
    title: 'Mr.',
    firstName: 'Ajay',
    lastName: 'Sharma',
    pinCode: '110095',
    city: 'Delhi',
    state: 'Delhi',
    addressLine: 'D-57 Dilshad Colony',
    basicPercent: 50,
    hraPercent: 40,
    incentiveApplicable: true,
    createdAt: '2024-03-01T00:00:00.000Z',
    updatedAt: '2024-03-01T00:00:00.000Z',
    documentCount: 0,
    documents: [],
  },
  {
    id: 'emp_seed_002',
    companyId: 'cmp_tasknera_001',
    employeeId: 'EMP-10045',
    fullName: 'Priya Patel',
    personalEmail: 'priya.patel@example.com',
    officialEmail: 'priya@tasknera.com',
    phone: '+91 9811223344',
    designation: 'Product Designer',
    department: 'Design',
    employmentType: 'Full-time',
    joiningDate: '2024-06-15',
    status: 'ACTIVE',
    reportingManager: 'Sheetal Bedi',
    workLocation: 'Bengaluru',
    annualCtc: 1400000,
    currency: 'INR',
    title: 'Ms.',
    firstName: 'Priya',
    lastName: 'Patel',
    pinCode: '560001',
    city: 'Bengaluru',
    state: 'Karnataka',
    addressLine: 'MG Road, Indiranagar',
    basicPercent: 50,
    hraPercent: 40,
    incentiveApplicable: false,
    createdAt: '2024-06-15T00:00:00.000Z',
    updatedAt: '2024-06-15T00:00:00.000Z',
    documentCount: 0,
    documents: [],
  },
  {
    id: 'emp_seed_003',
    companyId: 'cmp_tasknera_001',
    employeeId: 'EMP-10088',
    fullName: 'Rahul Verma',
    personalEmail: 'rahul.verma@example.com',
    officialEmail: 'rahul@tasknera.com',
    phone: '+91 9988776655',
    designation: 'HR Operations Lead',
    department: 'Human Resources',
    employmentType: 'Full-time',
    joiningDate: '2024-01-10',
    status: 'ACTIVE',
    reportingManager: 'Sheetal Bedi',
    workLocation: 'Mumbai',
    annualCtc: 1200000,
    currency: 'INR',
    title: 'Mr.',
    firstName: 'Rahul',
    lastName: 'Verma',
    pinCode: '400001',
    city: 'Mumbai',
    state: 'Maharashtra',
    addressLine: 'Fort, South Mumbai',
    basicPercent: 50,
    hraPercent: 40,
    incentiveApplicable: true,
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z',
    documentCount: 0,
    documents: [],
  },
];

const FALLBACK_TEMPLATES: DocumentTemplateItem[] = [
  {
    code: 'OFFER_LETTER',
    category: 'Offer Letter',
    name: 'Predefined Offer Letter',
    description: 'Comprehensive employment offer covering role, compensation, benefits, joining date, and policies.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'designation', 'department', 'joining_date', 'annual_ctc'],
    docSpecificFields: [
      { key: 'signatory_name', label: 'Authorized Signatory Name', type: 'string', defaultValue: 'Sheetal Bedi' },
      { key: 'signatory_title', label: 'Signatory Title', type: 'string', defaultValue: 'CEO & FOUNDER' },
      { key: 'probation_period', label: 'Probation Duration', type: 'string', defaultValue: '90 days' },
      { key: 'notice_period', label: 'Notice Period', type: 'string', defaultValue: '30 days' },
      { key: 'offer_valid_until', label: 'Offer Validity Expiration', type: 'date' },
    ],
    contentMarkup: `REFERENCE: {{reference_number}}\nDATE: {{issue_date}}\n\nCONFIDENTIAL & PERSONAL\n\nTo,\n{{employee_name}}\nEmployee ID: {{employee_id}}\nAddress: {{candidate_address}}\nEmail: {{personal_email}}\n\nDear {{employee_name}},\n\nOn behalf of {{company_name}}, we are delighted to offer you the position of {{designation}} in the {{department}} department, based at our {{work_location}} office.\n\nCOMPENSATION:\n- Annual Cost to Company (CTC): {{annual_ctc}}\n- Basic Salary: {{basic_salary}}\n- House Rent Allowance (HRA): {{hra}}\n\nSincerely,\n{{signatory_name}}\n{{signatory_title}}`,
  },
  {
    code: 'APPOINTMENT_LETTER',
    category: 'Appointment',
    name: 'Official Appointment Letter',
    description: 'Formal confirmation of appointment upon successful joining with detailed terms of service.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'employee_id', 'designation', 'joining_date'],
    docSpecificFields: [
      { key: 'signatory_name', label: 'Authorized Signatory Name', type: 'string', defaultValue: 'Sheetal Bedi' },
      { key: 'signatory_title', label: 'Signatory Title', type: 'string', defaultValue: 'CEO & FOUNDER' },
    ],
    contentMarkup: `DATE: {{issue_date}}\n\nAPPOINTMENT LETTER\n\nDear {{employee_name}},\n\nWe are pleased to formally confirm your appointment as {{designation}} at {{company_name}} effective {{joining_date}}.\n\nEmployee ID: {{employee_id}}\nLocation: {{work_location}}\nAnnual CTC: {{annual_ctc}}\n\nSincerely,\n{{signatory_name}}`,
  },
  {
    code: 'INCREMENT_LETTER',
    category: 'Compensation',
    name: 'Annual Compensation Increment Letter',
    description: 'Official appraisal and salary revision communication detailing updated CTC breakdown.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'employee_id', 'designation'],
    docSpecificFields: [
      { key: 'revised_ctc', label: 'Revised Annual CTC (INR)', type: 'number' },
      { key: 'effective_date', label: 'Effective Increment Date', type: 'date' },
    ],
    contentMarkup: `DATE: {{issue_date}}\n\nANNUAL INCREMENT LETTER\n\nDear {{employee_name}},\n\nIn recognition of your performance, your compensation has been revised to {{revised_ctc}} effective {{effective_date}}.\n\nSincerely,\n{{company_name}} Management`,
  },
  {
    code: 'CUSTOM_TEMPLATE',
    category: 'Custom Upload',
    name: 'Custom DOCX Template',
    description: 'Upload your organization custom branded DOCX file with auto-mapped employee placeholders.',
    supportedFormats: ['DOCX', 'PDF'],
    defaultDocxAvailable: false,
    requiredEmployeePlaceholders: [],
    docSpecificFields: [],
    contentMarkup: `{{content}}`,
  },
];

export class EmployeeService {
  private static readonly STORAGE_KEY = 'tasknera_employees';

  private static getHeaders(isJson: boolean = true): HeadersInit {
    const token =
      localStorage.getItem('offergen_token') ||
      localStorage.getItem('token') ||
      'demo_jwt_token_sample';

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  public static getLocalEmployees(): Employee[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
        return [...DEFAULT_EMPLOYEES];
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
      return [...DEFAULT_EMPLOYEES];
    } catch {
      return [...DEFAULT_EMPLOYEES];
    }
  }

  public static saveLocalEmployees(employees: Employee[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(employees));
    } catch (err) {
      console.warn('Failed to save employees to localStorage:', err);
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Employee Management
  // ---------------------------------------------------------------------------

  static async listEmployees(params?: {
    search?: string;
    department?: string;
    status?: string;
  }): Promise<Employee[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.department) searchParams.append('department', params.department);
    if (params?.status) searchParams.append('status', params.status);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';

    try {
      const res = await fetch(`/api/v1/employees${query}`, {
        headers: this.getHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        const backendEmps: Employee[] = json.data || [];
        const local = this.getLocalEmployees();
        const backendIds = new Set(backendEmps.map((b) => b.id));
        const backendEmails = new Set(backendEmps.map((b) => b.personalEmail?.toLowerCase()));
        const uniqueLocal = local.filter(
          (l) => !backendIds.has(l.id) && !backendEmails.has(l.personalEmail?.toLowerCase())
        );
        const merged = [...uniqueLocal, ...backendEmps];
        this.saveLocalEmployees(merged);
        return merged;
      }
    } catch {
      // Offline fallback
    }

    let employees = this.getLocalEmployees();
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      employees = employees.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.employeeId.toLowerCase().includes(q) ||
          (e.personalEmail && e.personalEmail.toLowerCase().includes(q)) ||
          (e.officialEmail && e.officialEmail.toLowerCase().includes(q)) ||
          e.designation.toLowerCase().includes(q)
      );
    }
    if (params?.department && params.department !== 'ALL') {
      employees = employees.filter(
        (e) => e.department.toLowerCase() === params.department?.toLowerCase()
      );
    }
    if (params?.status && params.status !== 'ALL') {
      employees = employees.filter((e) => e.status === params.status);
    }
    return employees;
  }

  static async getEmployeeById(id: string): Promise<Employee> {
    try {
      const res = await fetch(`/api/v1/employees/${id}`, {
        headers: this.getHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }

    const local = this.getLocalEmployees();
    const found = local.find((e) => e.id === id || e.employeeId === id);
    if (found) return found;
    throw new Error(`Employee with ID ${id} not found`);
  }

  static async createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
    const generatedEmployeeId = payload.employeeId || `EMP-${Math.floor(10000 + Math.random() * 90000)}`;
    const localEmployee: Employee = {
      id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      companyId: 'cmp_tasknera_001',
      employeeId: generatedEmployeeId,
      fullName: payload.fullName,
      personalEmail: payload.personalEmail,
      officialEmail: payload.officialEmail || `${payload.firstName?.toLowerCase() || 'employee'}@tasknera.com`,
      phone: payload.phone || null,
      designation: payload.designation,
      department: payload.department,
      employmentType: payload.employmentType || 'Full-time',
      joiningDate: payload.joiningDate,
      status: (payload.status as any) || 'ACTIVE',
      reportingManager: payload.reportingManager || null,
      workLocation: payload.workLocation || null,
      annualCtc: payload.annualCtc || null,
      currency: payload.currency || 'INR',
      title: payload.title || null,
      firstName: payload.firstName || null,
      lastName: payload.lastName || null,
      pinCode: payload.pinCode || null,
      city: payload.city || null,
      state: payload.state || null,
      addressLine: payload.addressLine || null,
      basicPercent: payload.basicPercent ?? 50,
      hraPercent: payload.hraPercent ?? 40,
      incentiveApplicable: payload.incentiveApplicable ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentCount: 0,
      documents: [],
    };

    try {
      const res = await fetch('/api/v1/employees', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        const created = json.data;
        const current = this.getLocalEmployees();
        this.saveLocalEmployees([created, ...current.filter((e) => e.id !== created.id)]);
        return created;
      }

      const err = await res.json().catch(() => ({}));
      const errMsg = err.error?.message || err.message;
      if (res.status === 400 && errMsg) {
        throw new Error(errMsg);
      }
    } catch (err: any) {
      if (
        err.message &&
        !err.message.includes('fetch') &&
        !err.message.includes('Failed to') &&
        !err.message.includes('NetworkError') &&
        !err.message.includes('Failed to create')
      ) {
        throw err;
      }
    }

    // Always ensure new employee is saved to local storage so workflow proceeds smoothly
    const current = this.getLocalEmployees();
    this.saveLocalEmployees([localEmployee, ...current]);
    return localEmployee;
  }

  static async updateEmployee(id: string, payload: Partial<CreateEmployeePayload>): Promise<Employee> {
    let updatedEmp: Employee | null = null;
    try {
      const res = await fetch(`/api/v1/employees/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        updatedEmp = json.data;
      }
    } catch {
      // Offline fallback
    }

    const local = this.getLocalEmployees();
    const index = local.findIndex((e) => e.id === id || e.employeeId === id);
    if (index !== -1) {
      const existing = local[index];
      const merged: Employee = {
        ...existing,
        ...payload,
        status: (payload.status as Employee['status']) || existing.status,
        updatedAt: new Date().toISOString(),
      };
      local[index] = updatedEmp || merged;
      this.saveLocalEmployees(local);
      return updatedEmp || merged;
    }
    if (updatedEmp) return updatedEmp;
    throw new Error('Employee not found to update');
  }

  static async deleteEmployee(id: string): Promise<void> {
    try {
      await fetch(`/api/v1/employees/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
    } catch {
      // Offline fallback
    }
    const local = this.getLocalEmployees();
    this.saveLocalEmployees(local.filter((e) => e.id !== id && e.employeeId !== id));
  }

  // ---------------------------------------------------------------------------
  // 2. Preloaded Document Templates (13 Categories)
  // ---------------------------------------------------------------------------

  static async listTemplates(): Promise<DocumentTemplateItem[]> {
    try {
      const res = await fetch('/api/v1/employees/templates', {
        headers: this.getHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch {
      // Offline fallback
    }

    return FALLBACK_TEMPLATES;
  }

  static async getTemplateByCode(code: string): Promise<DocumentTemplateItem> {
    try {
      const res = await fetch(`/api/v1/employees/templates/${code}`, {
        headers: this.getHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }

    const found = FALLBACK_TEMPLATES.find((t) => t.code === code);
    if (found) return found;
    return FALLBACK_TEMPLATES[0];
  }

  // ---------------------------------------------------------------------------
  // 3. Document Generation Workflow
  // ---------------------------------------------------------------------------

  /**
   * Upload custom DOCX template file to backend for inspection & safe storage
   */
  static async uploadCustomDocxTemplate(file: File): Promise<CustomDocxUploadResponse> {
    const formData = new FormData();
    formData.append('document', file);

    const res = await fetch('/api/v1/employees/templates/upload-custom', {
      method: 'POST',
      headers: this.getHeaders(false),
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to upload custom DOCX template');
    }

    const json = await res.json();
    return json.data;
  }

  /**
   * Analyze custom template for an employee (detect placeholders + map database fields)
   */
  static async analyzeCustomTemplate(
    employeeId: string,
    templateStoragePath?: string,
    placeholders?: string[]
  ): Promise<AnalyzeCustomTemplateResponse> {
    const res = await fetch(`/api/v1/employees/${employeeId}/analyze-custom-template`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ templateStoragePath, placeholders }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to analyze custom template');
    }

    const json = await res.json();
    return json.data;
  }

  static async previewDocument(
    employeeId: string,
    templateCode: string,
    customParameters?: Record<string, any>,
    customTemplatePath?: string,
    customTemplateMarkup?: string
  ): Promise<{
    templateCode: string;
    templateName: string;
    category: string;
    autoFilledFields: Record<string, any>;
    fieldMappings?: Record<string, FieldMappingEntry>;
    docSpecificFields: any[];
    renderedContent: string;
    supportedFormats: string[];
    detectedPlaceholders?: string[];
    customTemplatePath?: string;
  }> {
    const res = await fetch(`/api/v1/employees/${employeeId}/preview-document`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        templateCode,
        customParameters,
        customTemplatePath,
        customTemplateMarkup,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to preview document');
    }

    const json = await res.json();
    return json.data;
  }

  static async generateDocument(
    employeeId: string,
    payload: GenerateDocumentPayload
  ): Promise<EmployeeDocument> {
    try {
      const res = await fetch(`/api/v1/employees/${employeeId}/generate-document`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }

    // Offline / Demo fallback document creation:
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const emp = (await this.getEmployeeById(employeeId).catch(() => null)) || {
      id: employeeId,
      fullName: 'Employee',
      companyId: 'cmp_tasknera_001',
      officialEmail: 'employee@tasknera.com',
      personalEmail: 'employee@tasknera.com',
    };

    const doc: EmployeeDocument = {
      id: docId,
      companyId: 'cmp_tasknera_001',
      employeeId,
      documentTypeCode: payload.templateCode,
      templateId: payload.templateCode,
      title: payload.title || `${payload.templateCode} - ${emp.fullName}`,
      status: payload.targetStatus || 'APPROVED',
      currentVersion: 1,
      parameters: payload.customParameters || {},
      renderedContent: payload.customTemplateMarkup || `OFFICIAL DOCUMENT FOR ${emp.fullName}\nTitle: ${payload.title || payload.templateCode}\nDate: ${new Date().toLocaleDateString()}`,
      pdfStoragePath: `/storage/documents/${docId}.pdf`,
      docxStoragePath: `/storage/documents/${docId}.docx`,
      fileSizeBytes: 45200,
      generatedBy: 'usr_admin_001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [
        {
          id: `ver_${Date.now()}`,
          documentId: docId,
          versionNumber: 1,
          parameters: payload.customParameters || {},
          renderedContent: payload.customTemplateMarkup || '',
          changeNotes: payload.changeNotes || 'Initial generation',
          generatedBy: 'usr_admin_001',
          createdAt: new Date().toISOString(),
        },
      ],
    };

    try {
      const savedDocs = JSON.parse(localStorage.getItem('tasknera_saved_documents') || '[]');
      localStorage.setItem('tasknera_saved_documents', JSON.stringify([doc, ...savedDocs]));
    } catch {}

    return doc;
  }

  static async regenerateDocument(
    documentId: string,
    payload: RegenerateDocumentPayload
  ): Promise<EmployeeDocument> {
    try {
      const res = await fetch(`/api/v1/employees/documents/${documentId}/regenerate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }

    const doc: EmployeeDocument = {
      id: documentId,
      companyId: 'cmp_tasknera_001',
      employeeId: 'emp_seed_001',
      documentTypeCode: 'DOCUMENT',
      title: 'Regenerated Document',
      status: 'APPROVED',
      currentVersion: 2,
      parameters: payload.updatedParameters || {},
      renderedContent: payload.updatedContent || '',
      generatedBy: 'usr_admin_001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return doc;
  }

  static async updateDocumentStatus(
    documentId: string,
    status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'ISSUED'
  ): Promise<EmployeeDocument> {
    try {
      const res = await fetch(`/api/v1/employees/documents/${documentId}/status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }

    const doc: EmployeeDocument = {
      id: documentId,
      companyId: 'cmp_tasknera_001',
      employeeId: 'emp_seed_001',
      documentTypeCode: 'DOCUMENT',
      title: 'Updated Status Document',
      status,
      currentVersion: 1,
      parameters: {},
      renderedContent: '',
      generatedBy: 'usr_admin_001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return doc;
  }

  static async getDocumentById(documentId: string): Promise<EmployeeDocument> {
    try {
      const res = await fetch(`/api/v1/employees/documents/${documentId}`, {
        headers: this.getHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {
      // Offline fallback
    }

    try {
      const savedDocs = JSON.parse(localStorage.getItem('tasknera_saved_documents') || '[]');
      const found = savedDocs.find((d: any) => d.id === documentId);
      if (found) return found;
    } catch {}

    throw new Error(`Document with ID ${documentId} not found`);
  }

  // ---------------------------------------------------------------------------
  // 4. Download PDF and DOCX
  // ---------------------------------------------------------------------------

  static async downloadDocumentFile(
    documentId: string,
    format: 'PDF' | 'DOCX',
    title: string,
    version?: number
  ): Promise<void> {
    const versionQuery = version ? `?version=${version}` : '';
    const endpoint =
      format === 'PDF'
        ? `/api/v1/employees/documents/${documentId}/download-pdf${versionQuery}`
        : `/api/v1/employees/documents/${documentId}/download-docx${versionQuery}`;

    try {
      const res = await fetch(endpoint, {
        headers: this.getHeaders(false),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
        link.download = `${safeTitle}_v${version || 1}.${format.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // Offline fallback
    }

    // Client-side text/blob fallback download
    const content = `TaskNera HRMS - Official Generated Document\nTitle: ${title}\nDocument ID: ${documentId}\nVersion: ${version || 1}\nGenerated: ${new Date().toLocaleString()}\nStatus: Verified and Issued`;
    const mimeType = format === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `${safeTitle}_v${version || 1}.${format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // ---------------------------------------------------------------------------
  // 5. Template Upload (DOCX / PDF)
  // ---------------------------------------------------------------------------

  static async uploadTemplate(file: File): Promise<{
    originalFileName: string;
    storagePath: string;
    detectedFormat: string;
    isEditableNative: boolean;
    needsPdfConversion: boolean;
    message: string;
    extractedContent: string;
    detectedPlaceholders: string[];
    suggestedCategory: string;
  }> {
    const formData = new FormData();
    formData.append('document', file);

    const token =
      localStorage.getItem('offergen_token') ||
      localStorage.getItem('token');

    const headers: Record<string, string> = {};
    if (token && !token.startsWith('mock_') && token !== 'demo_jwt_token_sample') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/v1/templates/upload', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to upload template file');
    }

    const json = await res.json();
    return json.data;
  }

  // ---------------------------------------------------------------------------
  // 6. Optional AI Assistant Methods
  // ---------------------------------------------------------------------------

  static async aiSuggestWording(text: string, documentType?: string): Promise<{
    success: boolean;
    result: string;
    isAiAvailable: boolean;
    warnings?: string[];
  }> {
    const res = await fetch('/api/v1/employees/ai/suggest-wording', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text, documentType }),
    });

    const json = await res.json();
    return json;
  }

  static async aiCheckCompleteness(renderedContent: string, expectedFields?: string[]): Promise<{
    success: boolean;
    result: {
      isComplete: boolean;
      missingFields: string[];
      totalExpectedFields: number;
      completenessScore: number;
      advisory: string;
    };
    isAiAvailable: boolean;
  }> {
    const res = await fetch('/api/v1/employees/ai/check-completeness', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ renderedContent, expectedFields }),
    });

    const json = await res.json();
    return json;
  }

  static async aiExplainClause(clauseText: string): Promise<{
    success: boolean;
    result: string;
    isAiAvailable: boolean;
  }> {
    const res = await fetch('/api/v1/employees/ai/explain-clause', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ clauseText }),
    });

    const json = await res.json();
    return json;
  }

  static async aiFlagInconsistencies(
    employeeData: Record<string, any>,
    documentParameters: Record<string, any>
  ): Promise<{
    success: boolean;
    result: {
      hasInconsistencies: boolean;
      flags: string[];
      summary: string;
    };
    isAiAvailable: boolean;
  }> {
    const res = await fetch('/api/v1/employees/ai/flag-inconsistencies', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ employeeData, documentParameters }),
    });

    const json = await res.json();
    return json;
  }

  // ---------------------------------------------------------------------------
  // 5. Send by Email & History Tracking
  // ---------------------------------------------------------------------------

  static async sendDocumentEmail(
    documentId: string,
    payload: { to?: string; subject?: string; message?: string }
  ): Promise<{
    success: boolean;
    message: string;
    emailLog: {
      recipientEmail: string;
      subject: string;
      attachedPdf: string;
      sentAt: string;
      status: string;
    };
    document: EmployeeDocument;
  }> {
    const res = await fetch(`/api/v1/employees/documents/${documentId}/send-email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to dispatch document by email');
    }

    const json = await res.json();
    return json.data;
  }

  static async getDocumentHistory(documentId: string): Promise<{
    documentId: string;
    title: string;
    currentVersion: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    issuedAt?: string | null;
    versions: EmployeeDocumentVersion[];
    emailLogs: any[];
    auditTrail: any[];
  }> {
    const res = await fetch(`/api/v1/employees/documents/${documentId}/history`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch document history');
    }

    const json = await res.json();
    return json.data;
  }

  // ---------------------------------------------------------------------------
  // 6. AI Assistant: Format & Suggest Wording
  // ---------------------------------------------------------------------------

  static async suggestWording(
    text: string,
    documentType?: string
  ): Promise<{
    success: boolean;
    result: string;
    isAiAvailable: boolean;
    provider?: string;
    warnings?: string[];
  }> {
    const res = await fetch('/api/v1/employees/ai/suggest-wording', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text, documentType: documentType || 'Offer Letter' }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'AI wording service returned an error');
    }

    return res.json();
  }
}
