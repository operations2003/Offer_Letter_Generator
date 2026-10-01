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
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #1e293b;
        line-height: 1.6;
        padding: 40px;
        background-color: #ffffff;
      }
      .tasknera-header {
        position: relative;
        margin-bottom: 24px;
      }
      .company-title {
        font-size: 24px;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        letter-spacing: 0.02em;
      }
      .offer-meta {
        font-size: 13px;
        color: #64748b;
        margin-top: 5px;
      }
      .candidate-salutation {
        margin-top: 20px;
        font-size: 14px;
        line-height: 1.6;
      }
      .section-heading {
        font-size: 14px;
        font-weight: 700;
        color: #0f172a;
        margin-top: 24px;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 5px;
      }
      .details-table, .compensation-table {
        width: 100%;
        border-collapse: collapse;
        margin: 14px 0;
        font-size: 13px;
      }
      .details-table td {
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
      }
      .details-table td.label {
        font-weight: 600;
        background-color: #f8fafc;
        width: 32%;
        color: #475569;
      }
      .compensation-table th {
        background-color: #0f172a;
        color: #ffffff;
        padding: 9px 12px;
        text-align: left;
        font-size: 13px;
        font-weight: 700;
      }
      .compensation-table td {
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        font-size: 13px;
      }
      .compensation-table tr:nth-child(even) {
        background-color: #f8fafc;
      }
      .compensation-table tr.total-row {
        background-color: #f1f5f9;
        font-weight: 700;
        border-top: 2px solid #cbd5e1;
      }
      .clause-box {
        margin: 12px 0;
        padding: 10px 14px;
        background-color: #f8fafc;
        border-left: 4px solid #9c7a82;
        border-radius: 0 6px 6px 0;
      }
      .clause-title {
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 4px;
        font-size: 13px;
      }
      .clause-content {
        font-size: 12.5px;
        color: #475569;
        line-height: 1.5;
      }
      .signature-grid {
        margin-top: 36px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
      }
      .signature-block {
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 16px;
        background-color: #f8fafc;
      }
    `;

    const headerMarkup = `
      <div style="position:relative; margin-bottom:24px; font-family:'Inter',system-ui,sans-serif;">
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
      </div>
    `;

    const contentMarkup = `
      {{headerMarkup}}

      <div style="font-size:13px; line-height:1.6; margin-bottom:20px; color:#1e293b;">
        <p style="margin:2px 0;"><strong>Reference:</strong> {{offerReferenceNumber}}</p>
        <p style="margin:2px 0;"><strong>Date:</strong> {{currentDate}}</p>
        <p style="margin:12px 0 2px;"><strong>Employee Name:</strong> {{candidateName}}</p>
        <p style="margin:2px 0;"><strong>Designation:</strong> {{jobTitle}}</p>
      </div>

      <h2 style="text-align:center; font-size:22px; font-weight:700; color:#a35d39; margin:28px 0 24px; font-family:'Georgia',serif,sans-serif; letter-spacing:0.02em;">
        Offer of Employment
      </h2>

      <p style="margin-bottom:12px; font-size:13.5px; color:#1e293b;">
        Dear {{candidateName}},
      </p>

      <p style="margin-bottom:14px; font-weight:700; font-size:13.5px; color:#0f172a;">
        Subject: Offer of Employment with TaskNera
      </p>

      <p style="margin-bottom:22px; font-size:13px; line-height:1.65; text-align:justify; color:#334155;">
        Further to our discussions and subject to satisfactory completion of the Company's joining and verification requirements, TaskNera (the &ldquo;Company&rdquo;) is pleased to offer you employment for the position of <strong>{{jobTitle}}</strong>, on the terms and conditions set out in this Offer Letter, its Annexures, and the Company's applicable policies as amended from time to time.
      </p>

      <!-- SECTION 1 -->
      <div style="margin-bottom:22px;">
        <h3 style="font-size:14px; font-weight:700; color:#a35d39; border-bottom:1px solid #e2d3ca; padding-bottom:4px; margin-bottom:10px; font-family:'Georgia',serif,sans-serif;">
          1. Appointment, Acceptance and Joining
        </h3>
        <p style="font-size:13px; line-height:1.65; color:#334155; margin-bottom:10px; text-align:justify;">
          This offer is valid until <strong>{{offerValidUntil}}</strong>. You are required to confirm acceptance in writing and join on or before <strong>{{proposedJoiningDate}}</strong>. If acceptance is not received within the stipulated period, the Company may withdraw this offer.
        </p>
        <p style="font-size:13px; line-height:1.65; color:#334155; margin-bottom:10px; text-align:justify;">
          Your appointment is subject to completion of joining formalities and submission/verification of documents requested by the Company, including identity, education, previous employment and other documents reasonably required for lawful employment and background verification.
        </p>
        <p style="font-size:13px; line-height:1.65; color:#334155; margin-bottom:0; text-align:justify;">
          Any material misrepresentation, concealment, falsification or submission of false/forged documents may result in withdrawal of the offer or termination of employment, subject to applicable law and due process where required.
        </p>
      </div>

      <!-- SECTION 2 -->
      <div style="margin-bottom:22px;">
        <h3 style="font-size:14px; font-weight:700; color:#a35d39; border-bottom:1px solid #e2d3ca; padding-bottom:4px; margin-bottom:10px; font-family:'Georgia',serif,sans-serif;">
          2. Position, Reporting and Duties
        </h3>
        <p style="font-size:13px; line-height:1.65; color:#334155; margin:0; text-align:justify;">
          You will be employed as <strong>{{jobTitle}}</strong> and will report to the person designated by the Company. You shall diligently, professionally and faithfully perform the duties assigned to you and comply with lawful and reasonable directions of your Reporting Manager and authorised representatives of the Company.
        </p>
      </div>

      <!-- SECTION 3 -->
      <div style="margin-bottom:22px;">
        <h3 style="font-size:14px; font-weight:700; color:#a35d39; border-bottom:1px solid #e2d3ca; padding-bottom:4px; margin-bottom:10px; font-family:'Georgia',serif,sans-serif;">
          3. Place of Work and Working Hours
        </h3>
        <p style="font-size:13px; line-height:1.65; color:#334155; margin:0; text-align:justify;">
          Your primary work location will be <strong>{{workLocation}}</strong>. Your working schedule, shift, weekly working days, breaks and any approved remote/hybrid arrangement will be communicated by the Company and may be determined by business/client requirements, subject to applicable law and Company policy.
        </p>
      </div>

      <!-- SECTION 4 -->
      <div style="margin-bottom:22px;">
        <h3 style="font-size:14px; font-weight:700; color:#a35d39; border-bottom:1px solid #e2d3ca; padding-bottom:4px; margin-bottom:10px; font-family:'Georgia',serif,sans-serif;">
          4. Probation and Confirmation
        </h3>
        <p style="font-size:13px; line-height:1.65; color:#334155; margin:0; text-align:justify;">
          You will remain on probation for <strong>{{probationSummary}}</strong> from your date of joining, unless otherwise stated in writing. During probation, the Company will assess performance, productivity, attendance, punctuality, professional behaviour, communication, teamwork, accountability, discipline and compliance with Company policies. Confirmation is not automatic and will be communicated in writing by the Company.
        </p>
      </div>

      <!-- SECTION 5 -->
      <div style="margin-bottom:22px;">
        <h3 style="font-size:14px; font-weight:700; color:#a35d39; border-bottom:1px solid #e2d3ca; padding-bottom:4px; margin-bottom:10px; font-family:'Georgia',serif,sans-serif;">
          5. Compensation and Payroll
        </h3>
        <p style="font-size:13px; line-height:1.65; color:#334155; margin-bottom:10px; text-align:justify;">
          Your compensation will be INR <strong>{{totalCtc}}</strong> per annum (CTC), with the detailed structure set out in Annexure III. Salary and other benefits are subject to applicable statutory deductions and contributions. Salary is payable in accordance with the Company's payroll cycle and applicable law.
        </p>
        <p style="font-size:13px; line-height:1.65; color:#334155; margin:0; text-align:justify;">
          The Company's HR Policy provides that salary is calculated on approved attendance and payable working days recorded in the Company's attendance system, subject to lawful requirements. Unauthorized absence, leave without pay and other non-payable attendance may therefore affect salary for the relevant period.
        </p>
      </div>

      <!-- SECTION 6 -->
      <div style="margin-bottom:22px;">
        <h3 style="font-size:14px; font-weight:700; color:#a35d39; border-bottom:1px solid #e2d3ca; padding-bottom:4px; margin-bottom:10px; font-family:'Georgia',serif,sans-serif;">
          6. Code of Conduct &ndash; Zero Tolerance for Serious Behavioural Misconduct
        </h3>
        <p style="font-size:13px; line-height:1.65; color:#334155; margin-bottom:10px; text-align:justify;">
          TaskNera maintains a strict zero-tolerance standard for serious behavioural misconduct. Every employee is required to maintain professional, respectful, ethical and disciplined conduct. The following are examples of conduct that may constitute misconduct, depending on the facts and circumstances:
        </p>
        <ul style="font-size:12.5px; color:#475569; line-height:1.65; padding-left:20px; margin:0 0 10px;">
          <li style="margin-bottom:4px;">Threatening, abusive, violent, intimidating, disorderly or indecent behaviour toward any employee, manager, client, candidate, vendor or other person connected with the Company.</li>
          <li style="margin-bottom:4px;">Harassment, sexual harassment, bullying, discrimination, retaliation or other prohibited workplace conduct.</li>
          <li style="margin-bottom:4px;">Willful insubordination, refusal to follow lawful and reasonable instructions, or deliberate disruption of workplace operations.</li>
          <li style="margin-bottom:4px;">Dishonesty, fraud, falsification, manipulation of attendance or work records, misrepresentation, theft or misuse of Company/client property.</li>
          <li style="margin-bottom:4px;">Unauthorized disclosure or misuse of confidential, personal, client, candidate, commercial or security information.</li>
          <li style="margin-bottom:4px;">Deliberate work avoidance, repeated refusal to perform assigned duties, or conduct that materially disrupts business operations.</li>
          <li style="margin-bottom:4px;">Sleeping during working hours, repeated unauthorized breaks, habitual unauthorised absence, or other conduct expressly prohibited by Company policy.</li>
          <li style="margin-bottom:4px;">Any other conduct which, after appropriate assessment, is found to constitute serious misconduct or a material breach of the Company's policies, applicable law, or the terms of employment.</li>
        </ul>
        <p style="font-size:12px; color:#64748b; font-style:italic; margin:0;">
          The examples above are illustrative and do not limit the Company's rights under the applicable HR policies, employment terms or law.
        </p>
      </div>

      <!-- SECTION 7 -->
      <div style="margin-bottom:28px;">
        <h3 style="font-size:14px; font-weight:700; color:#a35d39; border-bottom:1px solid #e2d3ca; padding-bottom:4px; margin-bottom:10px; font-family:'Georgia',serif,sans-serif;">
          7. Disciplinary Action and Termination for Misconduct
        </h3>
        <p style="font-size:13px; line-height:1.65; color:#334155; margin-bottom:10px; text-align:justify;">
          Where an allegation of misconduct is raised, the Company may investigate the matter and take proportionate disciplinary action based on the facts, evidence, seriousness of the conduct, prior record and applicable law. Depending on the circumstances, disciplinary action may include counselling, warning, performance/behavioural improvement measures, suspension where legally permissible, recovery of proven losses where legally permissible, or termination.
        </p>
        <p style="font-size:13px; line-height:1.65; color:#334155; margin:0; text-align:justify;">
          In cases of serious misconduct, the Company may terminate employment without notice or payment in lieu where permitted by the employment terms and applicable law. Where a disciplinary enquiry, show-cause opportunity, hearing, statutory approval or other procedural safeguard is required by applicable law, the Company will follow the applicable procedure.
        </p>
      </div>

      <!-- SIGNATURE BLOCKS -->
      <div style="margin-top:36px; margin-bottom:36px;">
        <div style="margin-bottom:32px;">
          <p style="font-weight:700; color:#a35d39; font-size:14px; margin:0 0 24px; font-family:'Georgia',serif,sans-serif;">For TaskNera</p>
          <div style="width:280px; border-bottom:1px solid #475569; margin-bottom:8px;"></div>
          <div style="font-size:12.5px; line-height:1.6; color:#1e293b;">
            <div><strong>Name:</strong> Sheetal Bedi</div>
            <div><strong>Designation:</strong> CEO &amp; Founder</div>
            <div><strong>Date:</strong> {{currentDate}}</div>
          </div>
        </div>

        <div>
          <p style="font-weight:700; color:#a35d39; font-size:14px; margin:0 0 24px; font-family:'Georgia',serif,sans-serif;">Accepted and Agreed by Employee</p>
          <div style="width:280px; border-bottom:1px solid #475569; margin-bottom:8px;"></div>
          <div style="font-size:12.5px; line-height:1.6; color:#1e293b;">
            <div><strong>Name:</strong> {{candidateName}}</div>
            <div><strong>Signature:</strong> ___________________________</div>
            <div><strong>Date:</strong> ___________________________</div>
          </div>
        </div>
      </div>

      <!-- ANNEXURE I -->
      <div style="margin-top:40px; padding-top:24px; border-top:2px dashed #e2e8f0;">
        <h3 style="text-align:center; font-size:17px; font-weight:700; color:#a35d39; margin-bottom:20px; font-family:'Georgia',serif,sans-serif; letter-spacing:0.02em;">
          Annexure I &ndash; Employee Information &amp; Joining Details
        </h3>

        <table style="width:100%; border-collapse:collapse; margin-bottom:24px; font-size:13px; border:1px solid #e2d3ca;">
          <tbody>
            <tr style="border-bottom:1px solid #e2d3ca;">
              <td style="padding:10px 14px; font-weight:700; color:#334155; width:32%; background:#fdfbf9; border-right:1px solid #e2d3ca;">Employee Name</td>
              <td style="padding:10px 14px; font-weight:700; color:#0f172a;">{{candidateName}}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2d3ca;">
              <td style="padding:10px 14px; font-weight:700; color:#334155; background:#fdfbf9; border-right:1px solid #e2d3ca;">Designation</td>
              <td style="padding:10px 14px; color:#0f172a;">{{jobTitle}}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2d3ca;">
              <td style="padding:10px 14px; font-weight:700; color:#334155; background:#fdfbf9; border-right:1px solid #e2d3ca;">Department</td>
              <td style="padding:10px 14px; color:#0f172a;">{{department}}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2d3ca;">
              <td style="padding:10px 14px; font-weight:700; color:#334155; background:#fdfbf9; border-right:1px solid #e2d3ca;">Reporting Manager</td>
              <td style="padding:10px 14px; color:#0f172a;">{{reportingManagerName}}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2d3ca;">
              <td style="padding:10px 14px; font-weight:700; color:#334155; background:#fdfbf9; border-right:1px solid #e2d3ca;">Date of Joining</td>
              <td style="padding:10px 14px; font-weight:700; color:#0f172a;">{{proposedJoiningDate}}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2d3ca;">
              <td style="padding:10px 14px; font-weight:700; color:#334155; background:#fdfbf9; border-right:1px solid #e2d3ca;">Employment Type</td>
              <td style="padding:10px 14px; color:#0f172a;">{{employmentType}}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2d3ca;">
              <td style="padding:10px 14px; font-weight:700; color:#334155; background:#fdfbf9; border-right:1px solid #e2d3ca;">Work Location</td>
              <td style="padding:10px 14px; color:#0f172a;">{{workLocation}}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2d3ca;">
              <td style="padding:10px 14px; font-weight:700; color:#334155; background:#fdfbf9; border-right:1px solid #e2d3ca;">Probation Period</td>
              <td style="padding:10px 14px; color:#0f172a;">{{probationSummary}}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2d3ca;">
              <td style="padding:10px 14px; font-weight:700; color:#334155; background:#fdfbf9; border-right:1px solid #e2d3ca;">Notice Period</td>
              <td style="padding:10px 14px; color:#0f172a;">{{noticePeriodSummary}}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px; font-weight:700; color:#334155; background:#fdfbf9; border-right:1px solid #e2d3ca;">Working Days / Shift</td>
              <td style="padding:10px 14px; color:#0f172a;">{{workingHoursSummary}}</td>
            </tr>
          </tbody>
        </table>

        <h4 style="font-size:13.5px; font-weight:700; color:#a35d39; margin:20px 0 10px; font-family:'Georgia',serif,sans-serif;">
          Mandatory Joining Documents
        </h4>
        <ul style="font-size:12.5px; color:#475569; line-height:1.65; padding-left:20px; margin:0;">
          <li style="margin-bottom:3px;">Government-issued identity/address proof and PAN, as applicable.</li>
          <li style="margin-bottom:3px;">Education/qualification documents relevant to the role.</li>
          <li style="margin-bottom:3px;">Previous employment/relieving or resignation documentation, where applicable.</li>
          <li style="margin-bottom:3px;">Passport-size photograph/soft copy, where required.</li>
          <li>Any additional documents reasonably required for lawful onboarding or background verification.</li>
        </ul>
      </div>
    `;

    const footerMarkup = `
      <div style="margin-top:40px; position:relative; font-family:'Inter',system-ui,sans-serif;">
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
      // CamelCase
      companyName: 'TaskNera',
      offerReferenceNumber: context.offer.referenceNumber,
      currentDate: this.formatDate(new Date()),
      candidateName: context.candidate.name,
      candidateEmail: context.candidate.email,
      candidatePhone: context.candidate.phone || 'N/A',
      candidateLocation: context.candidate.location || 'N/A',
      candidateAddress: context.candidate.location || 'D-57 Dilshad Colony, Delhi, 110095',
      jobTitle: context.offer.jobTitle,
      department: context.offer.department,
      employmentType: context.offer.employmentType.replace(/_/g, ' '),
      workLocation: context.offer.workLocation,
      reportingManagerName: context.offer.reportingManagerName || 'Sheetal Bedi',
      reportingManagerTitle: context.offer.reportingManagerTitle || 'CEO & FOUNDER',
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
      signatoryName: 'Sheetal Bedi',
      signatoryTitle: 'CEO & FOUNDER',

      // Snake_case equivalents
      candidate_name: context.candidate.name,
      candidate_email: context.candidate.email,
      candidate_phone: context.candidate.phone || 'N/A',
      candidate_address: context.candidate.location || 'D-57 Dilshad Colony, Delhi, 110095',
      designation: context.offer.jobTitle,
      location: context.offer.workLocation,
      joining_date: this.formatDate(context.offer.proposedJoiningDate),
      probation_period: context.offer.probationSummary || '90 days',
      notice_period: context.offer.noticePeriodSummary || '30 days',
      working_hours: context.offer.workingHoursSummary || 'Full-time 40 hours/week',
      total_ctc: this.formatCurrency(context.offer.totalCtc, currency),
      salary: this.formatCurrency(context.offer.baseSalary, currency),
      offer_validity_date: this.formatDate(context.offer.offerValidUntil),
      company_name: 'TaskNera',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'CEO & FOUNDER',
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
