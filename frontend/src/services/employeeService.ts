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
}

export interface GenerateDocumentPayload {
  templateCode: string;
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

export class EmployeeService {
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
    const res = await fetch(`/api/v1/employees${query}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch employees');
    }

    const json = await res.json();
    return json.data || [];
  }

  static async getEmployeeById(id: string): Promise<Employee> {
    const res = await fetch(`/api/v1/employees/${id}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch employee profile');
    }

    const json = await res.json();
    return json.data;
  }

  static async createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
    const res = await fetch('/api/v1/employees', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create employee');
    }

    const json = await res.json();
    return json.data;
  }

  static async updateEmployee(id: string, payload: Partial<CreateEmployeePayload>): Promise<Employee> {
    const res = await fetch(`/api/v1/employees/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update employee');
    }

    const json = await res.json();
    return json.data;
  }

  static async deleteEmployee(id: string): Promise<void> {
    const res = await fetch(`/api/v1/employees/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete employee');
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Preloaded Document Templates (13 Categories)
  // ---------------------------------------------------------------------------

  static async listTemplates(): Promise<DocumentTemplateItem[]> {
    const res = await fetch('/api/v1/employees/templates', {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch document templates');
    }

    const json = await res.json();
    return json.data || [];
  }

  static async getTemplateByCode(code: string): Promise<DocumentTemplateItem> {
    const res = await fetch(`/api/v1/employees/templates/${code}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch template');
    }

    const json = await res.json();
    return json.data;
  }

  // ---------------------------------------------------------------------------
  // 3. Document Generation Workflow
  // ---------------------------------------------------------------------------

  static async previewDocument(
    employeeId: string,
    templateCode: string,
    customParameters?: Record<string, any>
  ): Promise<{
    templateCode: string;
    templateName: string;
    category: string;
    autoFilledFields: Record<string, any>;
    docSpecificFields: any[];
    renderedContent: string;
    supportedFormats: string[];
  }> {
    const res = await fetch(`/api/v1/employees/${employeeId}/preview-document`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ templateCode, customParameters }),
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
    const res = await fetch(`/api/v1/employees/${employeeId}/generate-document`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to generate document');
    }

    const json = await res.json();
    return json.data;
  }

  static async regenerateDocument(
    documentId: string,
    payload: RegenerateDocumentPayload
  ): Promise<EmployeeDocument> {
    const res = await fetch(`/api/v1/employees/documents/${documentId}/regenerate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to regenerate document');
    }

    const json = await res.json();
    return json.data;
  }

  static async updateDocumentStatus(
    documentId: string,
    status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'ISSUED'
  ): Promise<EmployeeDocument> {
    const res = await fetch(`/api/v1/employees/documents/${documentId}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update document status');
    }

    const json = await res.json();
    return json.data;
  }

  static async getDocumentById(documentId: string): Promise<EmployeeDocument> {
    const res = await fetch(`/api/v1/employees/documents/${documentId}`, {
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to fetch document');
    }

    const json = await res.json();
    return json.data;
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

    const res = await fetch(endpoint, {
      headers: this.getHeaders(false),
    });

    if (!res.ok) {
      throw new Error(`Failed to download ${format} file`);
    }

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

    const res = await fetch('/api/v1/templates/upload', {
      method: 'POST',
      headers: this.getHeaders(false),
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
}
