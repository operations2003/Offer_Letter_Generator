export interface PlaceholderDefinition {
  key: string;               // e.g. "candidate_name"
  token: string;             // e.g. "{{candidate_name}}"
  label: string;             // e.g. "Candidate Full Name"
  category: 'candidate' | 'role' | 'compensation' | 'terms' | 'company';
  description: string;
  exampleValue: string;
  required?: boolean;
}

export const STANDARD_PLACEHOLDERS: PlaceholderDefinition[] = [
  {
    key: 'employee_name',
    token: '{{employee_name}}',
    label: 'Employee Full Name',
    category: 'candidate',
    description: 'The full legal name of the employee or recipient.',
    exampleValue: 'Rahul Sharma',
    required: true,
  },
  {
    key: 'employee_id',
    token: '{{employee_id}}',
    label: 'Employee ID',
    category: 'candidate',
    description: 'Official corporate employee ID.',
    exampleValue: 'EMP-10492',
    required: true,
  },
  {
    key: 'annual_ctc',
    token: '{{annual_ctc}}',
    label: 'Annual CTC / Salary',
    category: 'compensation',
    description: 'Annual Cost-to-Company compensation figure.',
    exampleValue: '$155,000 USD',
  },
  {
    key: 'issue_date',
    token: '{{issue_date}}',
    label: 'Document Issue Date',
    category: 'terms',
    description: 'Date on which document is officially issued.',
    exampleValue: 'October 1, 2026',
  },
  {
    key: 'work_location',
    token: '{{work_location}}',
    label: 'Work Location / Base Office',
    category: 'role',
    description: 'Assigned office city or remote status.',
    exampleValue: 'San Francisco, CA (Hybrid)',
  },
  {
    key: 'candidate_name',
    token: '{{candidate_name}}',
    label: 'Candidate Full Name',
    category: 'candidate',
    description: 'The full legal name of the candidate receiving the offer.',
    exampleValue: 'Jane Doe',
  },
  {
    key: 'designation',
    token: '{{designation}}',
    label: 'Designation / Job Title',
    category: 'role',
    description: 'The formal job title or designation offered to the candidate.',
    exampleValue: 'Lead Platform Architect',
    required: true,
  },
  {
    key: 'department',
    token: '{{department}}',
    label: 'Department',
    category: 'role',
    description: 'The corporate business unit or department for this position.',
    exampleValue: 'Engineering',
    required: true,
  },
  {
    key: 'location',
    token: '{{location}}',
    label: 'Work Location / Arrangement',
    category: 'role',
    description: 'Physical office address or remote/hybrid work arrangement.',
    exampleValue: 'San Francisco, CA (Hybrid)',
    required: true,
  },
  {
    key: 'joining_date',
    token: '{{joining_date}}',
    label: 'Proposed Joining Date',
    category: 'terms',
    description: 'The starting date of employment.',
    exampleValue: 'November 1, 2026',
    required: true,
  },
  {
    key: 'employment_type',
    token: '{{employment_type}}',
    label: 'Employment Type',
    category: 'terms',
    description: 'Nature of contract (e.g. Full-time, Part-time, Contract, Internship).',
    exampleValue: 'Full-time',
    required: true,
  },
  {
    key: 'salary',
    token: '{{salary}}',
    label: 'Salary / Compensation',
    category: 'compensation',
    description: 'Annual base salary or total compensation package with currency.',
    exampleValue: '$155,000 USD',
    required: true,
  },
  {
    key: 'probation_period',
    token: '{{probation_period}}',
    label: 'Probation Period',
    category: 'terms',
    description: 'The duration of the initial probation evaluation period.',
    exampleValue: '90 days',
  },
  {
    key: 'notice_period',
    token: '{{notice_period}}',
    label: 'Notice Period',
    category: 'terms',
    description: 'The required notice duration for termination or resignation.',
    exampleValue: '30 days',
  },
  {
    key: 'reporting_manager',
    token: '{{reporting_manager}}',
    label: 'Reporting Manager',
    category: 'role',
    description: 'The name or title of the immediate supervisor.',
    exampleValue: 'Marcus Vance, VP of Engineering',
  },
  {
    key: 'working_hours',
    token: '{{working_hours}}',
    label: 'Working Hours',
    category: 'terms',
    description: 'Standard working schedule or expected weekly hours.',
    exampleValue: 'Monday to Friday, 9:00 AM to 5:00 PM (40 hours/week)',
  },
  // Additional helpful standard placeholders
  {
    key: 'company_name',
    token: '{{company_name}}',
    label: 'Company Legal Name',
    category: 'company',
    description: 'The legal name of the hiring entity.',
    exampleValue: 'Acme Technologies Inc.',
  },
  {
    key: 'offer_validity_date',
    token: '{{offer_validity_date}}',
    label: 'Offer Validity Expiration Date',
    category: 'terms',
    description: 'Date by which the candidate must accept the offer.',
    exampleValue: 'October 15, 2026',
  },
];

export class PlaceholderManager {
  /**
   * Extracts all {{variable_name}} tokens from a markup string
   */
  static extractPlaceholders(markup: string): string[] {
    if (!markup) return [];
    const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
    const matches = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = regex.exec(markup)) !== null) {
      matches.add(match[1]); // e.g. "candidate_name"
    }

    return Array.from(matches);
  }

  /**
   * Validates placeholders in markup against standard catalog and custom placeholders
   */
  static validatePlaceholders(
    markup: string,
    allowedCustomKeys: string[] = []
  ): {
    found: string[];
    valid: string[];
    unknown: string[];
    missingRequired: string[];
  } {
    const found = this.extractPlaceholders(markup);
    const standardKeys = new Set(STANDARD_PLACEHOLDERS.map((p) => p.key));
    const allowedKeys = new Set([...standardKeys, ...allowedCustomKeys]);

    const valid: string[] = [];
    const unknown: string[] = [];

    for (const key of found) {
      if (allowedKeys.has(key)) {
        valid.push(key);
      } else {
        unknown.push(key);
      }
    }

    // Check required standard placeholders
    const foundSet = new Set(found);
    const missingRequired = STANDARD_PLACEHOLDERS
      .filter((p) => p.required && !foundSet.has(p.key))
      .map((p) => p.token);

    return {
      found,
      valid,
      unknown,
      missingRequired,
    };
  }

  /**
   * Formats key as a token: "candidate_name" -> "{{candidate_name}}"
   */
  static formatToken(key: string): string {
    const clean = key.replace(/^\{\{|\}\}$/g, '').trim();
    return `{{${clean}}}`;
  }
}
