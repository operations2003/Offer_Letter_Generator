import PDFDocument from 'pdfkit';
import { AppError } from '../../errors/app-error.js';

export interface PdfCompanyData {
  name: string;
  legalName: string;
  domain?: string | null;
  address?: string | null;
  signatoryName: string;
  signatoryTitle: string;
}

export interface PdfCandidateData {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
}

export interface PdfJobData {
  referenceNumber: string;
  jobTitle: string;
  department: string;
  bandGrade?: string | null;
  workLocation: string;
  employmentType: string;
  proposedJoiningDate: string;
  reportingManagerName?: string | null;
  reportingManagerTitle?: string | null;
}

export interface PdfCompensationData {
  currency: string;
  baseSalary: number;
  hraAllowance: number;
  specialAllowances: number;
  performanceBonus: number;
  joiningBonus: number;
  totalCtc: number;
}

export interface PdfClauseItem {
  title: string;
  content: string;
}

export interface PdfTermsData {
  probationSummary: string;
  noticePeriodSummary: string;
  workingHoursSummary: string;
  offerValidUntil?: string | null;
  clauses: PdfClauseItem[];
}

export interface GenerateOfferPdfOptions {
  company: PdfCompanyData;
  candidate: PdfCandidateData;
  job: PdfJobData;
  compensation: PdfCompensationData;
  terms: PdfTermsData;
  verificationToken: string;
  versionNumber: number;
}

export class PdfGeneratorService {
  /**
   * Generates an official, print-ready, professionally formatted Offer Letter PDF
   * strictly from HR-confirmed data.
   */
  static async generateOfferPdf(options: GenerateOfferPdfOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 45,
          info: {
            Title: `Employment Offer - ${options.candidate.name} - ${options.job.referenceNumber}`,
            Author: options.company.name,
            Subject: 'Official Employment Agreement',
            Keywords: 'Offer Letter, Employment Contract, HR',
            CreationDate: new Date(),
          },
          bufferPages: true, // Enables two-pass page numbering
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(new AppError(`PDF generation error: ${err.message}`, 500)));

        const currency = options.compensation.currency || 'USD';
        const formatMoney = (amount: number) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
          }).format(amount);
        };

        // ---------------------------------------------------------------------
        // 1. TOP CORPORATE BANNER & HEADER
        // ---------------------------------------------------------------------
        // Accent Bar
        doc.rect(0, 0, doc.page.width, 6).fill('#1e3a8a');

        // Company Details (Left)
        doc
          .fillColor('#0f172a')
          .fontSize(18)
          .font('Helvetica-Bold')
          .text(options.company.legalName || options.company.name, 45, 30);

        doc
          .fontSize(8.5)
          .font('Helvetica')
          .fillColor('#64748b')
          .text(options.company.domain ? `Corporate Portal: ${options.company.domain}` : 'Official Corporate Office', 45, 52);

        // Document Reference & Date (Right)
        doc
          .fontSize(9)
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text(`Ref: ${options.job.referenceNumber}`, 340, 30, { align: 'right', width: 210 });

        doc
          .fontSize(8.5)
          .font('Helvetica')
          .fillColor('#64748b')
          .text(`Date of Issuance: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 340, 44, { align: 'right', width: 210 })
          .text(`Version: ${options.versionNumber}.0 (Official HR Confirmed)`, 340, 56, { align: 'right', width: 210 });

        // Divider
        doc
          .strokeColor('#cbd5e1')
          .lineWidth(1)
          .moveTo(45, 74)
          .lineTo(550, 74)
          .stroke();

        let y = 90;

        // ---------------------------------------------------------------------
        // 2. CANDIDATE APPOINTMENT SALUTATION
        // ---------------------------------------------------------------------
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text('PRIVATE & CONFIDENTIAL', 45, y)
          .font('Helvetica')
          .fillColor('#334155')
          .text(`To: ${options.candidate.name}`, 45, y + 14)
          .text(`Email: ${options.candidate.email}`, 45, y + 26)
          .text(options.candidate.address ? `Address: ${options.candidate.address}` : '', 45, y + 38);

        y += 56;

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#1e3a8a')
          .text(`SUBJECT: FORMAL OFFER OF EMPLOYMENT — ${options.job.jobTitle.toUpperCase()}`, 45, y);

        y += 20;

        doc
          .fontSize(9.5)
          .font('Helvetica')
          .fillColor('#334155')
          .lineGap(3)
          .text(
            `Dear ${options.candidate.name},\n\nOn behalf of ${options.company.name}, we are pleased to extend this formal offer of employment for the position of ${options.job.jobTitle} within our ${options.job.department} organization. This agreement outlines the approved contractual terms, responsibilities, compensation structure, and employment covenants governing your appointment.`,
            45,
            y,
            { width: 505, align: 'justify' }
          );

        y = doc.y + 14;

        // ---------------------------------------------------------------------
        // 3. SECTION 1: APPOINTMENT & POSITION SPECIFICATIONS (Table)
        // ---------------------------------------------------------------------
        doc
          .fontSize(10.5)
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text('1. POSITION & EMPLOYMENT SPECIFICATIONS', 45, y);

        y += 16;

        const jobRows = [
          ['Job Title / Designation', options.job.jobTitle],
          ['Department / Business Unit', options.job.department],
          ['Band / Career Grade', options.job.bandGrade || 'Standard Professional'],
          ['Work Location & Model', options.job.workLocation],
          ['Employment Classification', options.job.employmentType.replace(/_/g, ' ')],
          ['Commencement / Joining Date', options.job.proposedJoiningDate],
          ['Reporting Relationship', options.job.reportingManagerName ? `${options.job.reportingManagerName} (${options.job.reportingManagerTitle || 'Manager'})` : 'Executive Committee'],
        ];

        const rowHeight = 18;
        const colWidth1 = 180;
        const colWidth2 = 325;

        for (const [label, val] of jobRows) {
          // Row background
          doc.rect(45, y, 505, rowHeight).fill('#f8fafc');
          doc.rect(45, y, colWidth1, rowHeight).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
          doc.rect(45 + colWidth1, y, colWidth2, rowHeight).strokeColor('#e2e8f0').lineWidth(0.5).stroke();

          doc
            .fontSize(8.5)
            .font('Helvetica-Bold')
            .fillColor('#334155')
            .text(label, 52, y + 4, { width: colWidth1 - 14 });

          doc
            .fontSize(8.5)
            .font('Helvetica')
            .fillColor('#0f172a')
            .text(String(val), 45 + colWidth1 + 8, y + 4, { width: colWidth2 - 16 });

          y += rowHeight;
        }

        y += 14;

        // ---------------------------------------------------------------------
        // 4. SECTION 2: COMPENSATION & FINANCIAL SCHEDULE (Table)
        // ---------------------------------------------------------------------
        doc
          .fontSize(10.5)
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text('2. COMPENSATION & ANNUAL REWARD SCHEDULE', 45, y);

        y += 16;

        // Table Header
        doc.rect(45, y, 505, 20).fill('#0f172a');
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#ffffff').text('Compensation Component', 55, y + 5);
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#ffffff').text(`Annual Amount (${currency})`, 410, y + 5, { align: 'right', width: 130 });
        y += 20;

        const compItems = [
          ['Basic Annual Salary', options.compensation.baseSalary],
          ['House Rent Allowance (HRA)', options.compensation.hraAllowance],
          ['Special / Flexible Benefit Allowances', options.compensation.specialAllowances],
          ['Annual Performance Variable Bonus (Target)', options.compensation.performanceBonus],
          ['Sign-on / Joining Incentive', options.compensation.joiningBonus],
        ].filter(([, amt]) => Number(amt) > 0);

        for (let i = 0; i < compItems.length; i++) {
          const [label, amt] = compItems[i];
          const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
          doc.rect(45, y, 505, rowHeight).fill(bg);
          doc.rect(45, y, 505, rowHeight).strokeColor('#e2e8f0').lineWidth(0.5).stroke();

          doc.fontSize(8.5).font('Helvetica').fillColor('#334155').text(String(label), 55, y + 5);
          doc.fontSize(8.5).font('Helvetica').fillColor('#0f172a').text(formatMoney(Number(amt)), 410, y + 5, { align: 'right', width: 130 });

          y += rowHeight;
        }

        // Total CTC Row (Bold Accent)
        doc.rect(45, y, 505, 22).fill('#f1f5f9');
        doc.rect(45, y, 505, 22).strokeColor('#cbd5e1').lineWidth(1).stroke();
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#0f172a').text('Total Cost to Company (Annual CTC)', 55, y + 6);
        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#1e3a8a').text(formatMoney(options.compensation.totalCtc), 410, y + 6, { align: 'right', width: 130 });

        y += 32;

        // Check if we need to add a page for clauses
        if (y > 660) {
          doc.addPage();
          y = 50;
        }

        // ---------------------------------------------------------------------
        // 5. SECTION 3: KEY TERMS & LEGAL COVENANTS
        // ---------------------------------------------------------------------
        doc
          .fontSize(10.5)
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text('3. STATUTORY COVENANTS & EMPLOYMENT POLICIES', 45, y);

        y += 14;

        // Terms Summary Box
        doc.rect(45, y, 505, 34).fill('#f8fafc').strokeColor('#cbd5e1').lineWidth(0.5).stroke();
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#475569')
          .text(`• Probation Evaluation Period: ${options.terms.probationSummary}`, 55, y + 6)
          .text(`• Resignation / Separation Notice: ${options.terms.noticePeriodSummary}`, 55, y + 16)
          .text(`• Standard Work Schedule: ${options.terms.workingHoursSummary}`, 300, y + 6)
          .text(options.terms.offerValidUntil ? `• Offer Acceptance Deadline: ${options.terms.offerValidUntil}` : '• Standard Corporate Policies Apply', 300, y + 16);

        y += 44;

        // Render Individual Legal Clauses
        const clauses = options.terms.clauses || [];
        for (let i = 0; i < clauses.length; i++) {
          const cls = clauses[i];

          // Check page break headroom
          if (y > 700) {
            doc.addPage();
            y = 50;
          }

          doc
            .fontSize(9)
            .font('Helvetica-Bold')
            .fillColor('#0f172a')
            .text(`${3}.${i + 1} ${cls.title}`, 45, y);

          y += 12;

          const plainContent = cls.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          doc
            .fontSize(8)
            .font('Helvetica')
            .fillColor('#475569')
            .lineGap(2)
            .text(plainContent, 45, y, { width: 505, align: 'justify' });

          y = doc.y + 10;
        }

        // ---------------------------------------------------------------------
        // 6. SECTION 4: EXECUTION & DUAL SIGNATURE BLOCKS
        // ---------------------------------------------------------------------
        if (y > 640) {
          doc.addPage();
          y = 50;
        } else {
          y += 16;
        }

        doc
          .fontSize(10.5)
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text('4. AUTHORIZATION & FORMAL ACCEPTANCE', 45, y);

        y += 16;

        // Employer Side Box (Left)
        doc.rect(45, y, 240, 110).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text(`For ${options.company.name}`, 55, y + 10);
        doc.fontSize(8).font('Helvetica-Oblique').fillColor('#64748b').text('Authorized Signature (Corporate Signatory)', 55, y + 48);
        doc.strokeColor('#94a3b8').lineWidth(0.5).moveTo(55, y + 68).lineTo(265, y + 68).stroke();
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text(options.company.signatoryName, 55, y + 74);
        doc.fontSize(8).font('Helvetica').fillColor('#64748b').text(options.company.signatoryTitle, 55, y + 86);

        // Candidate Acceptance Box (Right)
        doc.rect(310, y, 240, 110).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text('Candidate Formal Acceptance', 320, y + 10);
        doc.fontSize(8).font('Helvetica-Oblique').fillColor('#64748b').text('Candidate Signature & Date of Signing', 320, y + 48);
        doc.strokeColor('#94a3b8').lineWidth(0.5).moveTo(320, y + 68).lineTo(530, y + 68).stroke();
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text(options.candidate.name, 320, y + 74);
        doc.fontSize(8).font('Helvetica').fillColor('#64748b').text('Signature indicates full acceptance of all terms', 320, y + 86);

        y += 125;

        // ---------------------------------------------------------------------
        // 7. FOOTERS ACROSS ALL PAGES (Two-Pass Pagination & Verification Token)
        // ---------------------------------------------------------------------
        const totalPages = doc.bufferedPageRange().count;
        for (let i = 0; i < totalPages; i++) {
          doc.switchToPage(i);

          // Bottom border line
          doc
            .strokeColor('#e2e8f0')
            .lineWidth(0.5)
            .moveTo(45, 800)
            .lineTo(550, 800)
            .stroke();

          // Left Footer: Cryptographic verification token
          doc
            .fontSize(7)
            .font('Helvetica')
            .fillColor('#64748b')
            .text(`CRYPTOGRAPHIC INTEGRITY TOKEN: ${options.verificationToken} • VERIFIED HR APPOINTMENT`, 45, 806);

          // Right Footer: Pagination
          doc
            .fontSize(7)
            .font('Helvetica-Bold')
            .fillColor('#475569')
            .text(`Page ${i + 1} of ${totalPages}`, 450, 806, { align: 'right', width: 100 });
        }

        // Finalize document stream
        doc.end();
      } catch (err: any) {
        reject(new AppError(`Failed to build offer letter PDF: ${err.message}`, 500));
      }
    });
  }
}
