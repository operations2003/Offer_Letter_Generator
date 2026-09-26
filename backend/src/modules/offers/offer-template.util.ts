export interface OfferRenderContext {
  company: {
    name: string;
    legalName?: string | null;
    domain?: string | null;
  };
  candidate: {
    name: string;
    email: string;
    phone?: string | null;
    location?: string | null;
  };
  offer: {
    referenceNumber: string;
    jobTitle: string;
    department: string;
    workLocation: string;
    employmentType: string;
    proposedJoiningDate: string;
    reportingManagerName?: string | null;
    reportingManagerTitle?: string | null;
    currency: string;
    baseSalary: number;
    hraAllowance: number;
    specialAllowances: number;
    performanceBonus: number;
    joiningBonus: number;
    totalCtc: number;
    probationSummary: string;
    noticePeriodSummary: string;
    workingHoursSummary: string;
    offerValidUntil?: string | null;
    clauses: Array<{ title: string; content: string }>;
  };
}

export class OfferTemplateUtil {
  /**
   * Formats a numeric currency value
   */
  static formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Formats an ISO date string to a human-readable date
   */
  static formatDate(dateString?: string | Date | null): string {
    if (!dateString) return 'Not Specified';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Generates a default modern HTML template if none is in the database
   */
  static getDefaultTemplateMarkup(): {
    contentMarkup: string;
    headerMarkup: string;
    footerMarkup: string;
    styleCss: string;
  } {
    const styleCss = `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
        line-height: 1.6;
        padding: 40px;
        background-color: #ffffff;
      }
      .offer-header {
        border-bottom: 2px solid #0f172a;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      .company-title {
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
        margin: 0;
      }
      .offer-meta {
        font-size: 13px;
        color: #64748b;
        margin-top: 5px;
      }
      .candidate-salutation {
        margin-top: 25px;
        font-size: 16px;
      }
      .section-heading {
        font-size: 16px;
        font-weight: 600;
        color: #0f172a;
        margin-top: 25px;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 4px;
      }
      .details-table, .compensation-table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
      }
      .details-table td {
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
      }
      .details-table td.label {
        font-weight: 600;
        background-color: #f8fafc;
        width: 30%;
        color: #334155;
      }
      .compensation-table th {
        background-color: #0f172a;
        color: #ffffff;
        padding: 10px 14px;
        text-align: left;
        font-size: 14px;
      }
      .compensation-table td {
        padding: 9px 14px;
        border: 1px solid #cbd5e1;
        font-size: 14px;
      }
      .compensation-table tr.total-row {
        background-color: #f1f5f9;
        font-weight: 700;
      }
      .clause-box {
        margin: 14px 0;
        padding: 12px 16px;
        background-color: #f8fafc;
        border-left: 4px solid #3b82f6;
        border-radius: 4px;
      }
      .clause-title {
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 4px;
      }
      .clause-content {
        font-size: 14px;
        color: #475569;
        line-height: 1.5;
      }
      .signature-grid {
        margin-top: 40px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
      }
      .signature-block {
        border-top: 1px solid #94a3b8;
        padding-top: 10px;
      }
      .disclaimer {
        margin-top: 30px;
        font-size: 12px;
        color: #94a3b8;
        text-align: center;
      }
    `;

    const headerMarkup = `
      <div class="offer-header">
        <h1 class="company-title">{{companyName}}</h1>
        <div class="offer-meta">Ref: {{offerReferenceNumber}} | Date: {{currentDate}}</div>
      </div>
    `;

    const contentMarkup = `
      {{headerMarkup}}

      <div class="candidate-salutation">
        <p>Dear <strong>{{candidateName}}</strong>,</p>
        <p>We are delighted to offer you the position of <strong>{{jobTitle}}</strong> in the <strong>{{department}}</strong> department at <strong>{{companyName}}</strong>. We are impressed with your qualifications and believe your skills and expertise will be an invaluable asset to our team.</p>
      </div>

      <div class="section-heading">Key Terms of Employment</div>
      <table class="details-table">
        <tr>
          <td class="label">Job Title</td>
          <td>{{jobTitle}}</td>
        </tr>
        <tr>
          <td class="label">Department</td>
          <td>{{department}}</td>
        </tr>
        <tr>
          <td class="label">Employment Type</td>
          <td>{{employmentType}}</td>
        </tr>
        <tr>
          <td class="label">Work Location</td>
          <td>{{workLocation}}</td>
        </tr>
        <tr>
          <td class="label">Reporting Manager</td>
          <td>{{reportingManagerName}} ({{reportingManagerTitle}})</td>
        </tr>
        <tr>
          <td class="label">Proposed Joining Date</td>
          <td><strong>{{proposedJoiningDate}}</strong></td>
        </tr>
        <tr>
          <td class="label">Probation Period</td>
          <td>{{probationSummary}}</td>
        </tr>
        <tr>
          <td class="label">Notice Period</td>
          <td>{{noticePeriodSummary}}</td>
        </tr>
        <tr>
          <td class="label">Working Hours & Schedule</td>
          <td>{{workingHoursSummary}}</td>
        </tr>
        <tr>
          <td class="label">Offer Validity</td>
          <td>This offer remains valid until <strong>{{offerValidUntil}}</strong></td>
        </tr>
      </table>

      <div class="section-heading">Compensation Annexure</div>
      {{compensationTableHtml}}

      <div class="section-heading">Terms & Conditions of Employment</div>
      {{clausesHtml}}

      <div class="section-heading">Acceptance of Offer</div>
      <p>Please indicate your acceptance of this offer by signing below and returning a duplicate copy of this letter on or before <strong>{{offerValidUntil}}</strong>.</p>

      <div class="signature-grid">
        <div class="signature-block">
          <p>For and on behalf of <strong>{{companyName}}</strong></p>
          <br /><br />
          <p>Authorized Signatory</p>
          <p>Date: ________________________</p>
        </div>
        <div class="signature-block">
          <p>Accepted and Agreed by <strong>{{candidateName}}</strong></p>
          <br /><br />
          <p>Candidate Signature</p>
          <p>Date: ________________________</p>
        </div>
      </div>

      {{footerMarkup}}
    `;

    const footerMarkup = `
      <div class="disclaimer">
        Confidential Offer Document. Generated securely by {{companyName}} HRMS Offer Letter Engine.
      </div>
    `;

    return { contentMarkup, headerMarkup, footerMarkup, styleCss };
  }

  /**
   * Interpolates context data into HTML and plain-text template
   */
  static render(
    context: OfferRenderContext,
    customMarkup?: { contentMarkup?: string; headerMarkup?: string; footerMarkup?: string; styleCss?: string }
  ): { renderedHtml: string; plainText: string; styleCss: string; placeholders: Record<string, unknown> } {
    const defaults = this.getDefaultTemplateMarkup();
    const styleCss = customMarkup?.styleCss || defaults.styleCss;
    const headerMarkup = customMarkup?.headerMarkup || defaults.headerMarkup;
    const footerMarkup = customMarkup?.footerMarkup || defaults.footerMarkup;
    let template = customMarkup?.contentMarkup || defaults.contentMarkup;

    // Generate Compensation Table HTML
    const currency = context.offer.currency || 'USD';
    const compTable = `
      <table class="compensation-table">
        <thead>
          <tr>
            <th>Component</th>
            <th style="text-align: right;">Annual Amount (${currency})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Base Salary</td>
            <td style="text-align: right;">${this.formatCurrency(context.offer.baseSalary, currency)}</td>
          </tr>
          ${context.offer.hraAllowance > 0 ? `
          <tr>
            <td>Housing Rent Allowance (HRA)</td>
            <td style="text-align: right;">${this.formatCurrency(context.offer.hraAllowance, currency)}</td>
          </tr>` : ''}
          ${context.offer.specialAllowances > 0 ? `
          <tr>
            <td>Special Allowances / Benefits</td>
            <td style="text-align: right;">${this.formatCurrency(context.offer.specialAllowances, currency)}</td>
          </tr>` : ''}
          ${context.offer.performanceBonus > 0 ? `
          <tr>
            <td>Performance Bonus / Variable Pay</td>
            <td style="text-align: right;">${this.formatCurrency(context.offer.performanceBonus, currency)}</td>
          </tr>` : ''}
          ${context.offer.joiningBonus > 0 ? `
          <tr>
            <td>Sign-on / Joining Bonus</td>
            <td style="text-align: right;">${this.formatCurrency(context.offer.joiningBonus, currency)}</td>
          </tr>` : ''}
          <tr class="total-row">
            <td>Total Cost to Company (CTC)</td>
            <td style="text-align: right;">${this.formatCurrency(context.offer.totalCtc, currency)}</td>
          </tr>
        </tbody>
      </table>
    `;

    // Generate Clauses HTML
    const clausesHtml = context.offer.clauses && context.offer.clauses.length > 0
      ? context.offer.clauses
          .map(
            (c, i) => `
        <div class="clause-box">
          <div class="clause-title">${i + 1}. ${c.title}</div>
          <div class="clause-content">${c.content}</div>
        </div>
      `
          )
          .join('\n')
      : '<p>Standard terms and employment conditions apply.</p>';

    const placeholders: Record<string, string> = {
      companyName: context.company.name || 'Company',
      offerReferenceNumber: context.offer.referenceNumber,
      currentDate: this.formatDate(new Date()),
      candidateName: context.candidate.name,
      candidateEmail: context.candidate.email,
      candidatePhone: context.candidate.phone || 'N/A',
      candidateLocation: context.candidate.location || 'N/A',
      jobTitle: context.offer.jobTitle,
      department: context.offer.department,
      employmentType: context.offer.employmentType.replace(/_/g, ' '),
      workLocation: context.offer.workLocation,
      reportingManagerName: context.offer.reportingManagerName || 'Reporting Officer',
      reportingManagerTitle: context.offer.reportingManagerTitle || 'Department Lead',
      proposedJoiningDate: this.formatDate(context.offer.proposedJoiningDate),
      probationSummary: context.offer.probationSummary || 'Standard 90-day probationary evaluation period',
      noticePeriodSummary: context.offer.noticePeriodSummary || '30 days standard written notice',
      workingHoursSummary: context.offer.workingHoursSummary || 'Full-time 40 hours per week',
      offerValidUntil: this.formatDate(context.offer.offerValidUntil),
      currency,
      baseSalary: this.formatCurrency(context.offer.baseSalary, currency),
      totalCtc: this.formatCurrency(context.offer.totalCtc, currency),
      compensationTableHtml: compTable,
      clausesHtml: clausesHtml,
      headerMarkup: headerMarkup,
      footerMarkup: footerMarkup,
    };

    // Sub in placeholders
    for (const [key, value] of Object.entries(placeholders)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, String(value));
    }

    // Strip tags for clean text preview
    const plainText = template
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    const renderedHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Offer Letter - ${context.candidate.name}</title>
        <style>${styleCss}</style>
      </head>
      <body>
        ${template}
      </body>
      </html>
    `;

    return {
      renderedHtml,
      plainText,
      styleCss,
      placeholders,
    };
  }
}
