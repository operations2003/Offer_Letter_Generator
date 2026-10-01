import {
  OfferTemplate,
  TemplateVersion,
  CreateTemplateInput,
  UpdateTemplateInput,
  PlaceholderDefinition,
  PlaceholderValidationResult,
  AiPlaceholderResult,
  AiWordingSuggestion,
  AiWordingTone,
} from '../types/template.js';

export const STANDARD_PLACEHOLDERS: PlaceholderDefinition[] = [
  // Candidate
  {
    key: 'candidate_name',
    token: '{{candidate_name}}',
    label: 'Candidate Full Name',
    category: 'candidate',
    description: 'The full legal name of the candidate receiving the offer.',
    exampleValue: 'Jane Alexandra Doe',
    required: true,
  },
  {
    key: 'candidate_email',
    token: '{{candidate_email}}',
    label: 'Candidate Email Address',
    category: 'candidate',
    description: 'The primary contact email address of the candidate.',
    exampleValue: 'jane.doe@example.com',
  },
  {
    key: 'candidate_phone',
    token: '{{candidate_phone}}',
    label: 'Candidate Phone Number',
    category: 'candidate',
    description: 'The contact phone number of the candidate.',
    exampleValue: '+1 (555) 234-5678',
  },
  {
    key: 'candidate_address',
    token: '{{candidate_address}}',
    label: 'Candidate Residential Address',
    category: 'candidate',
    description: 'The permanent or residential address on record.',
    exampleValue: '742 Evergreen Terrace, Springfield, OR',
  },

  // Role
  {
    key: 'designation',
    token: '{{designation}}',
    label: 'Designation / Job Title',
    category: 'role',
    description: 'The formal job title or designation offered to the candidate.',
    exampleValue: 'Staff Software Architect',
    required: true,
  },
  {
    key: 'department',
    token: '{{department}}',
    label: 'Department',
    category: 'role',
    description: 'The corporate business unit or department.',
    exampleValue: 'Cloud Infrastructure & Core Services',
    required: true,
  },
  {
    key: 'location',
    token: '{{location}}',
    label: 'Work Location / Arrangement',
    category: 'role',
    description: 'Physical office address or remote/hybrid work arrangement.',
    exampleValue: 'San Francisco, CA (Hybrid - 3 days onsite)',
    required: true,
  },
  {
    key: 'reporting_manager',
    token: '{{reporting_manager}}',
    label: 'Reporting Manager',
    category: 'role',
    description: 'The full name and title of the direct supervisor.',
    exampleValue: 'Marcus Vance, VP of Engineering',
  },

  // Compensation
  {
    key: 'salary',
    token: '{{salary}}',
    label: 'Salary / Base Compensation',
    category: 'compensation',
    description: 'Annual base salary or total compensation package with currency.',
    exampleValue: '$165,000 USD',
    required: true,
  },
  {
    key: 'hra_allowance',
    token: '{{hra_allowance}}',
    label: 'HRA / Housing Allowance',
    category: 'compensation',
    description: 'Housing rent allowance or monthly living stipend.',
    exampleValue: '$24,000 USD / year',
  },
  {
    key: 'special_allowances',
    token: '{{special_allowances}}',
    label: 'Special Allowances / Perks',
    category: 'compensation',
    description: 'Wellness, remote setup, or executive allowances.',
    exampleValue: '$6,000 USD / year',
  },
  {
    key: 'performance_bonus',
    token: '{{performance_bonus}}',
    label: 'Annual Performance Bonus',
    category: 'compensation',
    description: 'Target annual variable bonus based on OKRs.',
    exampleValue: 'Up to 15% of annual base salary ($24,750 USD)',
  },
  {
    key: 'joining_bonus',
    token: '{{joining_bonus}}',
    label: 'Sign-on / Joining Bonus',
    category: 'compensation',
    description: 'Lump-sum sign-on bonus subject to retention terms.',
    exampleValue: '$15,000 USD (payable with first payroll cycle)',
  },
  {
    key: 'total_ctc',
    token: '{{total_ctc}}',
    label: 'Total CTC / Total Compensation',
    category: 'compensation',
    description: 'Total guaranteed and variable annual compensation figure.',
    exampleValue: '$210,750 USD',
  },

  // Terms
  {
    key: 'joining_date',
    token: '{{joining_date}}',
    label: 'Proposed Joining Date',
    category: 'terms',
    description: 'The starting date of employment.',
    exampleValue: 'November 16, 2026',
    required: true,
  },
  {
    key: 'employment_type',
    token: '{{employment_type}}',
    label: 'Employment Type',
    category: 'terms',
    description: 'Nature of contract (Full-time, Part-time, Contract, Internship).',
    exampleValue: 'Full-Time Regular Exempt',
    required: true,
  },
  {
    key: 'probation_period',
    token: '{{probation_period}}',
    label: 'Probation Period',
    category: 'terms',
    description: 'Initial performance evaluation period.',
    exampleValue: '90 calendar days',
  },
  {
    key: 'notice_period',
    token: '{{notice_period}}',
    label: 'Notice Period',
    category: 'terms',
    description: 'Required notice duration for resignation or termination.',
    exampleValue: '30 calendar days in writing',
  },
  {
    key: 'working_hours',
    token: '{{working_hours}}',
    label: 'Standard Working Hours',
    category: 'terms',
    description: 'Core office hours and expected weekly commitment.',
    exampleValue: 'Monday to Friday, 9:00 AM – 5:30 PM (40 hours/week)',
  },
  {
    key: 'offer_validity_date',
    token: '{{offer_validity_date}}',
    label: 'Offer Expiration Date',
    category: 'terms',
    description: 'Deadline by which this offer must be accepted.',
    exampleValue: 'October 15, 2026 at 5:00 PM PST',
  },

  // Company
  {
    key: 'company_name',
    token: '{{company_name}}',
    label: 'Company Legal Name',
    category: 'company',
    description: 'Legal employer entity name.',
    exampleValue: 'Acme Technologies Global Corp.',
  },
  {
    key: 'signatory_name',
    token: '{{signatory_name}}',
    label: 'Authorized Signatory Name',
    category: 'company',
    description: 'Executive or People Partner authorizing the offer.',
    exampleValue: 'Sarah Jenkins',
  },
  {
    key: 'signatory_title',
    token: '{{signatory_title}}',
    label: 'Authorized Signatory Title',
    category: 'company',
    description: 'Title of the company signatory.',
    exampleValue: 'VP of Global Talent & People Operations',
  },
];

export const SAMPLE_CANDIDATE_DATA: Record<string, string> = {
  candidate_name: 'Jane Alexandra Doe',
  candidate_email: 'jane.doe@example.com',
  candidate_phone: '+1 (555) 234-5678',
  candidate_address: '742 Evergreen Terrace, Springfield, OR 97477',
  designation: 'Staff Software Architect',
  department: 'Cloud Infrastructure & Core Services',
  location: 'San Francisco, CA (Hybrid - 3 days onsite)',
  reporting_manager: 'Marcus Vance, VP of Engineering',
  salary: '$165,000 USD',
  hra_allowance: '$24,000 USD / year',
  special_allowances: '$6,000 USD / year',
  performanceBonus: '$24,750 USD',
  performance_bonus: 'Up to 15% of annual base salary ($24,750 USD)',
  joining_bonus: '$15,000 USD',
  total_ctc: '$210,750 USD',
  joining_date: 'November 16, 2026',
  employment_type: 'Full-Time Regular Exempt',
  probation_period: '90 calendar days',
  notice_period: '30 calendar days in writing',
  working_hours: 'Monday to Friday, 9:00 AM – 5:30 PM (40 hours/week)',
  offer_validity_date: 'October 15, 2026 at 5:00 PM PST',
  company_name: 'TaskNera',
  signatory_name: 'Sheetal Bedi',
  signatory_title: 'CEO & FOUNDER',
};

// In-Memory / LocalStorage Seed Templates
const INITIAL_TEMPLATES: OfferTemplate[] = [
  {
    id: 'tpl_tasknera_official_001',
    companyId: 'cmp_tasknera_001',
    title: 'TaskNera Official Corporate Letterhead Offer',
    description: 'Official TaskNera corporate letterhead template with verified brand styling, contact details, and executive signatory.',
    category: 'FULL_TIME',
    isActive: true,
    currentVersionId: 'ver_tasknera_001',
    createdBy: 'usr_tasknera_admin',
    creator: { firstName: 'Sheetal', lastName: 'Bedi', email: 'careers@tasknera.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    _count: { versions: 1 },
    currentVersion: {
      id: 'ver_tasknera_001',
      templateId: 'tpl_tasknera_official_001',
      versionNumber: 1,
      isPublished: true,
      changeSummary: 'TaskNera official letterhead with corporate header, contact block, and CEO signatory',
      createdAt: new Date().toISOString(),
      creator: { firstName: 'Sheetal', lastName: 'Bedi', email: 'careers@tasknera.com' },
      placeholdersSchema: [
        'candidate_name',
        'candidate_address',
        'designation',
        'department',
        'location',
        'joining_date',
        'salary',
        'total_ctc',
        'probation_period',
        'company_name',
        'signatory_name',
        'signatory_title',
        'offer_validity_date',
      ],
      headerMarkup: `<div style="position:relative; margin-bottom:24px; font-family:'Inter',system-ui,sans-serif;">
  <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
    <div style="width:280px; height:18px; background:#fae1c3; border-bottom-right-radius:14px;"></div>
    <div style="width:220px; height:8px; background:#9c7a82;"></div>
  </div>
  <div style="display:flex; justify-content:space-between; align-items:center; padding:0 12px 14px;">
    <div style="display:flex; align-items:center; gap:12px;">
      <img src="/logo.png" alt="TaskNera" style="width:40px; height:40px; object-fit:contain;" />
      <span style="font-size:24px; font-weight:800; color:#0f172a; letter-spacing:0.02em;">TASKNERA</span>
    </div>
    <div style="border-left:2px solid #0f172a; padding-left:14px; font-size:11px; line-height:1.5; color:#1e293b;">
      <div><strong>Phone:</strong> +91 7065278229</div>
      <div><strong>Email:</strong> careers@tasknera.com</div>
      <div><strong>ADD:</strong> D-57 Dilshad Colony, Delhi, 110095</div>
    </div>
  </div>
  <div style="height:3px; background:#1e293b; width:100%;"></div>
</div>`,
      footerMarkup: `<div style="margin-top:40px; position:relative; font-family:'Inter',system-ui,sans-serif;">
  <div style="display:flex; justify-content:flex-end; margin-bottom:32px; padding-right:12px;">
    <div style="text-align:right;">
      <div style="font-weight:700; font-size:14px; color:#0f172a;">Sheetal Bedi</div>
      <div style="font-size:12px; font-weight:600; color:#475569;">CEO &amp; FOUNDER</div>
      <div style="font-size:11px; color:#94a3b8;">TaskNera</div>
    </div>
  </div>
  <div style="display:flex; justify-content:center;">
    <div style="width:240px; height:16px; background:#9c7a82; border-top-left-radius:12px; border-top-right-radius:12px;"></div>
  </div>
</div>`,
      styleCss: `body { font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; color: #1f2937; }
h1, h2, h3 { color: #111827; }
.highlight-box { background: #f8fafc; border-left: 4px solid #9c7a82; padding: 14px 18px; margin: 18px 0; border-radius: 0 8px 8px 0; }
.terms-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px; }
.terms-table td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; }
.terms-table td.label { font-weight: 600; color: #475569; width: 35%; background: #f8fafc; }`,
      contentMarkup: `<p><strong>Date:</strong> {{offer_validity_date}}</p>
<p><strong>To:</strong><br />
<strong>{{candidate_name}}</strong><br />
{{candidate_address}}</p>

<p>Dear <strong>{{candidate_name}}</strong>,</p>

<p>On behalf of <strong>{{company_name}}</strong>, we are delighted to extend to you this formal offer of employment for the position of <strong>{{designation}}</strong> within our <strong>{{department}}</strong> team. We were thoroughly impressed by your background and are excited about the capabilities and leadership you bring to TaskNera.</p>

<div class="highlight-box">
  <table class="terms-table">
    <tbody>
      <tr>
        <td class="label">Job Title / Designation</td>
        <td><strong>{{designation}}</strong></td>
      </tr>
      <tr>
        <td class="label">Department</td>
        <td>{{department}}</td>
      </tr>
      <tr>
        <td class="label">Work Arrangement &amp; Location</td>
        <td>{{location}}</td>
      </tr>
      <tr>
        <td class="label">Anticipated Joining Date</td>
        <td><strong>{{joining_date}}</strong></td>
      </tr>
      <tr>
        <td class="label">Total Compensation (CTC)</td>
        <td><strong>{{total_ctc}}</strong></td>
      </tr>
      <tr>
        <td class="label">Probation Period</td>
        <td>{{probation_period}}</td>
      </tr>
    </tbody>
  </table>
</div>

<p>Please signify your acceptance of this offer by signing and returning this document. We look forward to an impactful and rewarding journey together at TaskNera.</p>`,
    },
    versions: [
      {
        id: 'ver_tasknera_001',
        templateId: 'tpl_tasknera_official_001',
        versionNumber: 1,
        isPublished: true,
        changeSummary: 'TaskNera official letterhead baseline template',
        createdAt: new Date().toISOString(),
        placeholdersSchema: ['candidate_name', 'designation', 'department', 'total_ctc', 'joining_date'],
        contentMarkup: '',
      },
    ],
  },
];

class TemplateServiceClass {
  private templates: OfferTemplate[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const saved = localStorage.getItem('offergen_templates');
    if (saved) {
      try {
        const parsed: OfferTemplate[] = JSON.parse(saved);
        // Purge dummy / acme templates
        const cleaned = parsed.filter(
          (t) =>
            t.id === 'tpl_tasknera_official_001' ||
            (!t.id.includes('exec_leadership') &&
              !t.id.includes('contract_tech') &&
              !t.id.includes('intern_univ') &&
              !t.companyId?.includes('acme') &&
              !t.title?.toLowerCase().includes('acme') &&
              !t.title?.toLowerCase().includes('dummy'))
        );
        if (cleaned.length > 0) {
          const hasTasknera = cleaned.some((t) => t.id === 'tpl_tasknera_official_001');
          this.templates = hasTasknera ? cleaned : [INITIAL_TEMPLATES[0], ...cleaned];
          this.saveToStorage();
          return;
        }
      } catch {
        // Fall back to seed
      }
    }
    this.templates = [...INITIAL_TEMPLATES];
    this.saveToStorage();
  }

  private saveToStorage() {
    localStorage.setItem('offergen_templates', JSON.stringify(this.templates));
  }

  /**
   * Retrieves the catalog of standard system placeholders
   */
  async getPlaceholdersCatalog(): Promise<PlaceholderDefinition[]> {
    try {
      const res = await fetch('/api/v1/templates/placeholders/catalog', {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.standardPlaceholders) {
          return data.data.standardPlaceholders;
        }
      }
    } catch {
      // Offline fallback
    }
    return STANDARD_PLACEHOLDERS;
  }

  /**
   * Lists templates with optional filtering
   */
  async getTemplates(params?: {
    category?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<OfferTemplate[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'ALL') query.append('category', params.category);
      if (typeof params?.isActive === 'boolean') query.append('isActive', String(params.isActive));
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`/api/v1/templates?${query.toString()}`, {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {
      // Local fallback
    }

    // Local in-memory filter
    return this.templates.filter((tpl) => {
      if (params?.category && params.category !== 'ALL' && tpl.category !== params.category) {
        return false;
      }
      if (typeof params?.isActive === 'boolean' && tpl.isActive !== params.isActive) {
        return false;
      }
      if (params?.search) {
        const term = params.search.toLowerCase();
        return (
          tpl.title.toLowerCase().includes(term) ||
          (tpl.description && tpl.description.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }

  /**
   * Get single template by ID
   */
  async getTemplateById(id: string): Promise<OfferTemplate | null> {
    try {
      const res = await fetch(`/api/v1/templates/${id}`, {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Fallback
    }

    return this.templates.find((t) => t.id === id) || null;
  }

  /**
   * Create template
   */
  async createTemplate(input: CreateTemplateInput): Promise<OfferTemplate> {
    try {
      const res = await fetch('/api/v1/templates', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          this.templates.unshift(json.data);
          this.saveToStorage();
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    const detected = this.extractPlaceholders(input.contentMarkup);
    const newVersion: TemplateVersion = {
      id: `ver_${Date.now()}`,
      templateId: `tpl_${Date.now()}`,
      versionNumber: 1,
      contentMarkup: input.contentMarkup,
      headerMarkup: input.headerMarkup,
      footerMarkup: input.footerMarkup,
      styleCss: input.styleCss,
      placeholdersSchema: detected,
      changeSummary: 'Initial version v1 created',
      isPublished: true,
      createdAt: new Date().toISOString(),
      creator: { firstName: 'Sarah', lastName: 'Jenkins', email: 'hr@acme.com' },
    };

    const newTemplate: OfferTemplate = {
      id: newVersion.templateId,
      companyId: 'cmp_acme_001',
      title: input.title,
      description: input.description,
      category: input.category,
      isActive: true,
      currentVersionId: newVersion.id,
      currentVersion: newVersion,
      versions: [newVersion],
      _count: { versions: 1 },
      createdBy: 'usr_hr_002',
      creator: { firstName: 'Sarah', lastName: 'Jenkins', email: 'hr@acme.com' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.templates.unshift(newTemplate);
    this.saveToStorage();
    return newTemplate;
  }

  /**
   * Update template
   */
  async updateTemplate(id: string, input: UpdateTemplateInput): Promise<OfferTemplate> {
    try {
      const res = await fetch(`/api/v1/templates/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const idx = this.templates.findIndex((t) => t.id === id);
          if (idx !== -1) this.templates[idx] = json.data;
          this.saveToStorage();
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    const tpl = this.templates.find((t) => t.id === id);
    if (!tpl) throw new Error('Template not found');

    const markupChanged =
      input.contentMarkup !== undefined &&
      tpl.currentVersion?.contentMarkup !== input.contentMarkup;

    let updatedVersion = tpl.currentVersion;

    if (markupChanged && input.contentMarkup) {
      const nextVersionNumber = (tpl.currentVersion?.versionNumber || 1) + 1;
      const newVersion: TemplateVersion = {
        id: `ver_${Date.now()}`,
        templateId: tpl.id,
        versionNumber: nextVersionNumber,
        contentMarkup: input.contentMarkup,
        headerMarkup: input.headerMarkup ?? tpl.currentVersion?.headerMarkup,
        footerMarkup: input.footerMarkup ?? tpl.currentVersion?.footerMarkup,
        styleCss: input.styleCss ?? tpl.currentVersion?.styleCss,
        placeholdersSchema: this.extractPlaceholders(input.contentMarkup),
        changeSummary: input.changeSummary || `Version ${nextVersionNumber} revision`,
        isPublished: true,
        createdAt: new Date().toISOString(),
        creator: { firstName: 'Sarah', lastName: 'Jenkins', email: 'hr@acme.com' },
      };

      updatedVersion = newVersion;
      if (!tpl.versions) tpl.versions = [];
      tpl.versions.unshift(newVersion);
      tpl.currentVersionId = newVersion.id;
      tpl.currentVersion = newVersion;
      tpl._count = { versions: tpl.versions.length };
    }

    if (input.title) tpl.title = input.title;
    if (input.description !== undefined) tpl.description = input.description;
    if (input.category) tpl.category = input.category;
    tpl.updatedAt = new Date().toISOString();

    this.saveToStorage();
    return tpl;
  }

  /**
   * Duplicate template
   */
  async duplicateTemplate(id: string, customTitle?: string): Promise<OfferTemplate> {
    try {
      const res = await fetch(`/api/v1/templates/${id}/duplicate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ title: customTitle }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          this.templates.unshift(json.data);
          this.saveToStorage();
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    const source = this.templates.find((t) => t.id === id);
    if (!source) throw new Error('Source template not found');

    const newTitle = customTitle?.trim() || `Copy of ${source.title}`;
    const newVersion: TemplateVersion = {
      id: `ver_${Date.now()}`,
      templateId: `tpl_${Date.now()}`,
      versionNumber: 1,
      contentMarkup: source.currentVersion?.contentMarkup || '',
      headerMarkup: source.currentVersion?.headerMarkup || null,
      footerMarkup: source.currentVersion?.footerMarkup || null,
      styleCss: source.currentVersion?.styleCss || null,
      placeholdersSchema: [...(source.currentVersion?.placeholdersSchema || [])],
      changeSummary: `Cloned from "${source.title}"`,
      isPublished: true,
      createdAt: new Date().toISOString(),
      creator: { firstName: 'Sarah', lastName: 'Jenkins', email: 'hr@acme.com' },
    };

    const duplicated: OfferTemplate = {
      id: newVersion.templateId,
      companyId: source.companyId,
      title: newTitle,
      description: source.description ? `Copy of ${source.description}` : undefined,
      category: source.category,
      isActive: true,
      currentVersionId: newVersion.id,
      currentVersion: newVersion,
      versions: [newVersion],
      _count: { versions: 1 },
      createdBy: 'usr_hr_002',
      creator: { firstName: 'Sarah', lastName: 'Jenkins', email: 'hr@acme.com' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.templates.unshift(duplicated);
    this.saveToStorage();
    return duplicated;
  }

  /**
   * Toggle template active/inactive status
   */
  async toggleActive(id: string, isActive: boolean): Promise<OfferTemplate> {
    try {
      const res = await fetch(`/api/v1/templates/${id}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const idx = this.templates.findIndex((t) => t.id === id);
          if (idx !== -1) this.templates[idx] = json.data;
          this.saveToStorage();
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    const tpl = this.templates.find((t) => t.id === id);
    if (!tpl) throw new Error('Template not found');
    tpl.isActive = isActive;
    tpl.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return tpl;
  }

  /**
   * Get version history for a template
   */
  async getVersionHistory(id: string): Promise<TemplateVersion[]> {
    try {
      const res = await fetch(`/api/v1/templates/${id}/versions`, {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.versions) return json.data.versions;
      }
    } catch {
      // Fallback
    }

    const tpl = this.templates.find((t) => t.id === id);
    return tpl?.versions || (tpl?.currentVersion ? [tpl.currentVersion] : []);
  }

  /**
   * Publish / Rollback to a specific version number
   */
  async publishVersion(id: string, versionNumber: number): Promise<OfferTemplate> {
    try {
      const res = await fetch(`/api/v1/templates/${id}/versions/${versionNumber}/publish`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const idx = this.templates.findIndex((t) => t.id === id);
          if (idx !== -1) this.templates[idx] = json.data;
          this.saveToStorage();
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    const tpl = this.templates.find((t) => t.id === id);
    if (!tpl) throw new Error('Template not found');
    const targetVer = tpl.versions?.find((v) => v.versionNumber === versionNumber);
    if (!targetVer) throw new Error(`Version ${versionNumber} not found`);

    tpl.currentVersionId = targetVer.id;
    tpl.currentVersion = targetVer;
    tpl.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return tpl;
  }

  /**
   * AI Placeholder Detection
   */
  async aiSuggestPlaceholders(contentMarkup: string): Promise<AiPlaceholderResult> {
    try {
      const res = await fetch('/api/v1/templates/ai-suggest-placeholders', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ contentMarkup }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // Fallback to client-side analyzer
    }

    // Client-side regex & heuristic scanner
    const suggestions: any[] = [];
    let preview = contentMarkup;

    // Detect hardcoded names
    const nameMatch = preview.match(/(?:Dear\s+)?([A-Z][a-z]+\s+[A-Z][a-z]+)/);
    if (nameMatch && !preview.includes('{{candidate_name}}') && nameMatch[1] !== 'Acme Technologies') {
      suggestions.push({
        originalSnippet: nameMatch[1],
        suggestedToken: '{{candidate_name}}',
        rationale: 'Hardcoded candidate name detected. Replace with dynamic candidate token.',
        confidenceScore: 0.95,
      });
      preview = preview.replace(nameMatch[1], '{{candidate_name}}');
    }

    // Detect hardcoded salary figures
    const salaryMatch = preview.match(/\$\s*(\d{2,3}(?:,\d{3})+|\d{5,7})(?:\s*USD)?/i);
    if (salaryMatch && !preview.includes('{{salary}}')) {
      suggestions.push({
        originalSnippet: salaryMatch[0],
        suggestedToken: '{{salary}}',
        rationale: 'Hardcoded monetary salary detected. Replace with variable salary token.',
        confidenceScore: 0.94,
      });
      preview = preview.replace(salaryMatch[0], '{{salary}}');
    }

    // Detect job titles
    const roleMatch = preview.match(/(?:role of|position of|as an?)\s+([A-Z][A-Za-z\s]+?)(?:,|\.|\s+in|\s+within)/i);
    if (roleMatch && !preview.includes('{{designation}}')) {
      suggestions.push({
        originalSnippet: roleMatch[1].trim(),
        suggestedToken: '{{designation}}',
        rationale: 'Hardcoded job title or designation identified.',
        confidenceScore: 0.91,
      });
      preview = preview.replace(roleMatch[1].trim(), '{{designation}}');
    }

    // Detect probation periods
    const probMatch = preview.match(/(?:probation period of|probationary period of)\s+(\d+\s+(?:days|months|weeks))/i);
    if (probMatch && !preview.includes('{{probation_period}}')) {
      suggestions.push({
        originalSnippet: probMatch[1],
        suggestedToken: '{{probation_period}}',
        rationale: 'Hardcoded probation duration detected.',
        confidenceScore: 0.92,
      });
      preview = preview.replace(probMatch[1], '{{probation_period}}');
    }

    // Detect notice periods
    const noticeMatch = preview.match(/(?:notice period of)\s+(\d+\s+(?:days|months|weeks))/i);
    if (noticeMatch && !preview.includes('{{notice_period}}')) {
      suggestions.push({
        originalSnippet: noticeMatch[1],
        suggestedToken: '{{notice_period}}',
        rationale: 'Hardcoded notice duration detected.',
        confidenceScore: 0.92,
      });
      preview = preview.replace(noticeMatch[1], '{{notice_period}}');
    }

    const standardTokens = [
      '{{candidate_name}}',
      '{{designation}}',
      '{{department}}',
      '{{location}}',
      '{{joining_date}}',
      '{{employment_type}}',
      '{{salary}}',
      '{{probation_period}}',
      '{{notice_period}}',
      '{{reporting_manager}}',
    ];

    const missingStandardPlaceholders = standardTokens.filter(
      (token) => !preview.includes(token)
    );

    return {
      suggestions,
      missingStandardPlaceholders,
      improvedMarkupPreview: preview,
      summary: `AI detected ${suggestions.length} hardcoded value(s) to replace with standard dynamic tokens.`,
    };
  }

  /**
   * AI Wording Suggestions & Clause Refiner
   */
  async aiDraftClause(
    instruction: string,
    currentClause?: string,
    tone: AiWordingTone = 'formal'
  ): Promise<AiWordingSuggestion[]> {
    try {
      const res = await fetch('/api/v1/ai/draft-clause', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ instruction, context: { currentClause, tone } }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.clause) {
          return [
            {
              originalClause: currentClause,
              suggestedClause: json.data.clause,
              tone,
              rationale: 'Generated with high-compliance offer language standards.',
              complianceNotes: 'Standard enforceable clause adhering to US/Global employment law frameworks.',
            },
          ];
        }
      }
    } catch {
      // Fallback generator
    }

    // Intelligent heuristic clause library based on instructions & tone
    const lowerInst = instruction.toLowerCase();
    const suggestions: AiWordingSuggestion[] = [];

    if (lowerInst.includes('confidential') || lowerInst.includes('ip') || lowerInst.includes('intellectual')) {
      suggestions.push({
        originalClause: currentClause,
        suggestedClause: `<p><strong>Proprietary Information and Inventions Assignment:</strong> During your tenure with {{company_name}} and thereafter, you agree to safeguard all confidential, proprietary, and trade secret information. All inventions, software routines, documentation, and work products conceived by you in the course of employment shall remain the sole and exclusive property of {{company_name}} worldwide.</p>`,
        tone: 'firm_legal',
        rationale: 'Comprehensive IP assignment and non-disclosure language protecting enterprise source code and trade secrets.',
        complianceNotes: 'Compliant with US Defend Trade Secrets Act (DTSA) and standard bilateral non-disclosure provisions.',
      });
    } else if (lowerInst.includes('remote') || lowerInst.includes('hybrid') || lowerInst.includes('work from home')) {
      suggestions.push({
        originalClause: currentClause,
        suggestedClause: `<p><strong>Flexible Work Arrangement:</strong> Your position is designated as {{location}}. You are expected to maintain an ergonomic, secure remote workstation with high-speed internet access. The Company will provide a standard equipment package and a monthly technology reimbursement stipend in accordance with company policy.</p>`,
        tone: 'warm',
        rationale: 'Clear, modern hybrid policy detailing equipment support and workspace expectations.',
        complianceNotes: 'Clarifies work premises liability and expense reimbursement standards.',
      });
    } else if (lowerInst.includes('bonus') || lowerInst.includes('incentive') || lowerInst.includes('commission')) {
      suggestions.push({
        originalClause: currentClause,
        suggestedClause: `<p><strong>Incentive Compensation:</strong> You will be eligible to participate in the Annual Performance Bonus Plan, targeting <strong>{{performance_bonus}}</strong>. Actual payout is contingent upon individual OKR performance and company-wide financial goals, determined at the sole discretion of the Leadership Committee.</p>`,
        tone: 'formal',
        rationale: 'Establishes clear discretionary bonus metrics without creating an irrevocable contractual entitlement.',
        complianceNotes: 'Includes explicit discretion carve-out to mitigate bonus dispute liability.',
      });
    } else if (lowerInst.includes('welcome') || lowerInst.includes('intro') || lowerInst.includes('preamble')) {
      suggestions.push({
        originalClause: currentClause,
        suggestedClause: `<p>Dear <strong>{{candidate_name}}</strong>,</p>\n<p>On behalf of the entire team at <strong>{{company_name}}</strong>, we are thrilled to offer you the position of <strong>{{designation}}</strong> in our <strong>{{department}}</strong> department. We were captivated by your vision and deep domain expertise, and we cannot wait to see the immense impact you will make here.</p>`,
        tone: 'warm',
        rationale: 'High-energy, welcoming tone crafted to elevate candidate excitement and boost offer acceptance rate.',
      });
    } else {
      // General tailored rewrite
      const rewritten = currentClause
        ? `<p>${currentClause.replace(/<[^>]*>/g, '').trim()} All rights, obligations, and terms shall be governed by the standard policies of {{company_name}} in effect as of {{joining_date}}.</p>`
        : `<p><strong>Employment Provision:</strong> In your role as {{designation}}, you will collaborate closely with {{reporting_manager}} to advance core organizational deliverables, adhering strictly to the highest standards of professional integrity and company policies.</p>`;

      suggestions.push({
        originalClause: currentClause,
        suggestedClause: rewritten,
        tone,
        rationale: `Clause refined in ${tone} tone with standardized legal placeholders.`,
        complianceNotes: 'Standard boilerplate review recommended by local legal counsel.',
      });
    }

    return suggestions;
  }

  /**
   * Helper: Extracts all {{placeholder}} tokens from text
   */
  extractPlaceholders(markup: string): string[] {
    if (!markup) return [];
    const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
    const matches = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = regex.exec(markup)) !== null) {
      matches.add(match[1]);
    }
    return Array.from(matches);
  }

  /**
   * Validates placeholders against standard catalog
   */
  validatePlaceholders(markup: string, customKeys: string[] = []): PlaceholderValidationResult {
    const found = this.extractPlaceholders(markup);
    const standardKeys = new Set(STANDARD_PLACEHOLDERS.map((p) => p.key));
    const allowed = new Set([...standardKeys, ...customKeys]);

    const valid: string[] = [];
    const unknown: string[] = [];

    for (const key of found) {
      if (allowed.has(key)) valid.push(key);
      else unknown.push(key);
    }

    const foundSet = new Set(found);
    const missingRequired = STANDARD_PLACEHOLDERS
      .filter((p) => p.required && !foundSet.has(p.key))
      .map((p) => p.token);

    return { found, valid, unknown, missingRequired };
  }

  /**
   * Render markup by substituting placeholders with sample or candidate data
   */
  renderPreview(markup: string, values: Record<string, string> = SAMPLE_CANDIDATE_DATA): string {
    if (!markup) return '';
    return markup.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (match, key) => {
      if (values[key] !== undefined) {
        return values[key];
      }
      return match;
    });
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('offergen_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }
}

export const templateService = new TemplateServiceClass();
