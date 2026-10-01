import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import pdf from 'pdf-parse';
import { BadRequestError } from '../../errors/app-error.js';

export interface ExtractedPageItem {
  pageNumber: number;
  rawText: string;
  htmlMarkup: string;
  tableCount?: number;
}

export interface PdfToStructuredLetterResult {
  success: boolean;
  fileName: string;
  totalPages: number;
  totalDetectedTables?: number;
  detectedVariables: string[];
  extractedValues: Record<string, string>;
  pages: ExtractedPageItem[];
  fullStructuredHtml: string;
  sections: Array<{
    number: number;
    title: string;
    content: string;
  }>;
}

export class PdfToStructuredLetterService {
  /**
   * Main entry point: Extracts text page-by-page and structures into TaskNera HTML pages
   */
  static async processPdf(
    buffer: Buffer,
    originalFileName: string
  ): Promise<PdfToStructuredLetterResult> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestError('PDF buffer is empty.');
    }

    // Write buffer to temporary file for Python extraction
    const tempDir = os.tmpdir();
    const tempFileName = `tasknera_pdf_${crypto.randomUUID()}.pdf`;
    const tempFilePath = path.join(tempDir, tempFileName);

    let rawPages: Array<{ pageNumber: number; rawText: string }> = [];
    let totalPages = 1;
    let pythonStructuredPages: ExtractedPageItem[] | null = null;
    let totalDetectedTables = 0;

    try {
      await fs.promises.writeFile(tempFilePath, buffer);

      // Attempt extraction via Python script first for maximum accuracy (pdfplumber vector + semantic table extraction)
      try {
        const pythonResult = await this.extractWithPython(tempFilePath);
        if (pythonResult && pythonResult.pages && pythonResult.pages.length > 0) {
          totalPages = pythonResult.total_pages || pythonResult.totalPages || pythonResult.pages.length;
          totalDetectedTables = pythonResult.total_detected_tables || 0;
          rawPages = pythonResult.pages.map((p: any) => ({
            pageNumber: p.page_number || p.pageNumber,
            rawText: p.raw_text || p.rawText || '',
          }));
          pythonStructuredPages = pythonResult.pages.map((p: any) => ({
            pageNumber: p.page_number || p.pageNumber,
            rawText: p.raw_text || p.rawText || '',
            htmlMarkup: p.html_markup || p.htmlMarkup || '',
            tableCount: p.table_count || 0,
          }));
        }
      } catch (pyErr) {
        // Fallback to node pdf-parse if python is unavailable
        rawPages = await this.extractWithNode(buffer);
        totalPages = rawPages.length;
      }
    } finally {
      // Clean up temporary file
      try {
        if (fs.existsSync(tempFilePath)) {
          await fs.promises.unlink(tempFilePath);
        }
      } catch {}
    }

    if (rawPages.length === 0) {
      throw new BadRequestError('Could not extract text from the uploaded PDF.');
    }

    // Extract dynamic variables from combined text
    const combinedRawText = rawPages.map((p) => p.rawText).join('\n\n');
    const detectedVariables = this.detectVariables(combinedRawText);
    const extractedValues = this.extractValues(combinedRawText);

    // Structure each page into official TaskNera HTML format
    const structuredPages: ExtractedPageItem[] = (pythonStructuredPages && pythonStructuredPages.every((p: ExtractedPageItem) => p.htmlMarkup))
      ? pythonStructuredPages
      : rawPages.map((p) => {
          const html = this.buildPageHtml(p.pageNumber, totalPages, p.rawText);
          const tablesInPage = (html.match(/<table/g) || []).length;
          return {
            pageNumber: p.pageNumber,
            rawText: p.rawText,
            htmlMarkup: html,
            tableCount: tablesInPage,
          };
        });

    if (!totalDetectedTables) {
      totalDetectedTables = structuredPages.reduce((acc, p) => acc + (p.tableCount || 0), 0);
    }

    const fullStructuredHtml = structuredPages.map((p) => p.htmlMarkup).join('\n\n');

    // Extract numbered sections from text
    const sections = this.extractNumberedSections(combinedRawText);

    return {
      success: true,
      fileName: originalFileName,
      totalPages,
      totalDetectedTables,
      detectedVariables,
      extractedValues,
      pages: structuredPages,
      fullStructuredHtml,
      sections,
    };
  }

  /**
   * Run Python extraction script
   */
  private static extractWithPython(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.resolve(process.cwd(), 'scripts', 'extract_pdf_to_structured_pages.py');
      const pyProcess = spawn('py', [scriptPath, filePath], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      });

      let stdout = '';
      let stderr = '';

      if (pyProcess.stdout) {
        pyProcess.stdout.setEncoding('utf-8');
        pyProcess.stdout.on('data', (d) => {
          stdout += d.toString();
        });
      }
      if (pyProcess.stderr) {
        pyProcess.stderr.setEncoding('utf-8');
        pyProcess.stderr.on('data', (d) => {
          stderr += d.toString();
        });
      }

      pyProcess.on('close', (code) => {
        if (code === 0 && stdout) {
          try {
            const parsed = JSON.parse(stdout);
            resolve(parsed);
          } catch (e) {
            reject(new Error(`Failed to parse Python JSON output: ${stdout.slice(0, 300)}`));
          }
        } else {
          reject(new Error(`Python process exited with code ${code}: ${stderr}`));
        }
      });

      pyProcess.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Node fallback extraction using pdf-parse
   */
  private static async extractWithNode(buffer: Buffer): Promise<Array<{ pageNumber: number; rawText: string }>> {
    const pages: Array<{ pageNumber: number; rawText: string }> = [];

    try {
      const parseHandler = typeof pdf === 'function' ? pdf : (pdf as any).default;
      const data = await parseHandler(buffer, {
        pagerender: (pageData: any) => {
          return pageData.getTextContent().then((textContent: any) => {
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            pages.push({
              pageNumber: pages.length + 1,
              rawText: pageText.trim(),
            });
            return pageText;
          });
        },
      });

      if (pages.length === 0 && data.text) {
        // Fallback: split by form-feed characters (\f)
        const parts = data.text.split('\f').filter((t: string) => t.trim().length > 0);
        if (parts.length > 1) {
          return parts.map((p: string, idx: number) => ({ pageNumber: idx + 1, rawText: p.trim() }));
        }
        pages.push({ pageNumber: 1, rawText: data.text.trim() });
      }
    } catch {
      pages.push({ pageNumber: 1, rawText: buffer.toString('utf-8') });
    }

    return pages;
  }

  /**
   * Detects bracketed variables like [Employee Full Name], [Designation], [Annual CTC]
   */
  private static detectVariables(text: string): string[] {
    const pattern = /\[([a-zA-Z0-9_\s\-\/]+)\]/g;
    const tokens = new Set<string>();
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const token = match[1]?.trim();
      if (token && token.length > 1) {
        tokens.add(token);
      }
    }
    return Array.from(tokens);
  }

  /**
   * Smart regex-based value detector
   */
  private static extractValues(text: string): Record<string, string> {
    const values: Record<string, string> = {};

    // Match Employee Name
    const nameMatch = text.match(/(?:Employee Name|Candidate Name|Mr\.|Ms\.|Dear)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
    if (nameMatch && nameMatch[1]) values['employee_name'] = nameMatch[1].trim();

    // Match Designation
    const desigMatch = text.match(/(?:Designation|Position|Job Title)\s*[:\-]?\s*([A-Za-z\s]+?)(?:\r?\n|for the position)/i);
    if (desigMatch && desigMatch[1]) values['designation'] = desigMatch[1].trim();

    // Match Annual CTC
    const ctcMatch = text.match(/(?:INR|Rs\.?|CTC)\s*([0-9,]+(?:\.[0-9]+)?)/i);
    if (ctcMatch && ctcMatch[1]) values['annual_ctc'] = ctcMatch[1].trim();

    // Match Reference Number
    const refMatch = text.match(/TASK\/[0-9]{4}\/[0-9]+/i) || text.match(/Reference\s*:\s*([A-Za-z0-9\/-]+)/i);
    if (refMatch) values['reference_number'] = refMatch[0];

    return values;
  }

  /**
   * Extracts numbered sections: e.g. "1. Appointment...", "2. Position..."
   */
  private static extractNumberedSections(text: string): Array<{ number: number; title: string; content: string }> {
    const sections: Array<{ number: number; title: string; content: string }> = [];
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    let currentSec: { number: number; title: string; content: string } | null = null;

    for (const line of lines) {
      const match = line.match(/^(\d+)[\.\)]\s+(.*)/i);
      if (match) {
        if (currentSec) sections.push(currentSec);
        currentSec = {
          number: parseInt(match[1], 10),
          title: match[2].trim(),
          content: '',
        };
      } else if (currentSec) {
        currentSec.content += (currentSec.content ? '\n' : '') + line;
      }
    }

    if (currentSec) sections.push(currentSec);
    return sections;
  }

  /**
   * Renders rows into TaskNera styled table HTML
   */
  private static renderHtmlTable(rows: string[][], isAnnexureKv = false): string {
    if (!rows || rows.length === 0) return '';

    const numCols = Math.max(...rows.map((r) => r.length));
    const firstRowText = rows[0].join(' ').toLowerCase();
    const headerKeywords = ['component', 'particular', 'description', 'details', 'sr no', 'sl no', 'item', 'pre-existing ip', 'evidence of prior', 'approval / notes'];
    const hasHeader = headerKeywords.some((hk) => firstRowText.includes(hk));

    if (numCols === 2 && !hasHeader) {
      isAnnexureKv = true;
    }

    const html: string[] = [
      '<table style="width:100%; border-collapse:collapse; margin:16px 0 24px; font-size:13px; border:1px solid #dfcfc7; font-family:\'Arial\',sans-serif;">',
    ];

    let startIdx = 0;
    if (hasHeader && !isAnnexureKv) {
      html.push('  <thead><tr style="background:#ebd3be; border-bottom:2px solid #dfcfc7;">');
      for (const c of rows[0]) {
        html.push(
          `    <th style="padding:10px 14px; text-align:left; font-weight:700; color:#1e293b; border:1px solid #d5bfab; background:#ebd3be;">${this.highlightTags(c)}</th>`
        );
      }
      html.push('  </tr></thead>');
      startIdx = 1;
    }

    html.push('  <tbody>');
    for (let r = startIdx; r < rows.length; r++) {
      html.push('    <tr style="border-bottom:1px solid #dfcfc7;">');
      for (let i = 0; i < rows[r].length; i++) {
        let cellStr = rows[r][i];
        if (isAnnexureKv && i === 1 && rows[r].length >= 2) {
          const rowLabel = rows[r][0].trim();
          if (/\[0+[,0]*\]/.test(cellStr)) {
            cellStr = cellStr.replace(/\[0+[,0]*\]/g, `[${rowLabel}]`);
          }
        }
        const cellVal = this.highlightTags(cellStr);
        if (i === 0 && isAnnexureKv) {
          html.push(
            `      <td style="padding:10px 14px; font-weight:700; color:#334155; width:34%; background:#fcf8f5; border:1px solid #dfcfc7;">${cellVal}</td>`
          );
        } else {
          html.push(
            `      <td style="padding:10px 14px; color:#0f172a; border:1px solid #dfcfc7;">${cellVal}</td>`
          );
        }
      }
      html.push('    </tr>');
    }
    html.push('  </tbody></table>');

    return html.join('\n');
  }

  /**
   * Scans text lines and groups consecutive table rows:
   * 1. Page 1 Recipient / Reference metadata (Reference, Date, Employee Name, Designation) -> Clean div block
   * 2. Pipe-separated lines (col1 | col2)
   * 3. Key-colon / pipe pairs (Key : Value)
   * 4. Key followed by salary amount (Basic Salary INR [0,000])
   * 5. Key followed by bracketed value (Employee Name [Employee Full Name])
   */
  private static parseSemanticTablesFromLines(
    lines: string[],
    pageNum: number = 1
  ): Array<{ type: 'table' | 'text' | 'recipient_meta'; rows?: string[][]; isKv?: boolean; line?: string; lines?: string[] }> {
    const blocks: Array<{ type: 'table' | 'text' | 'recipient_meta'; rows?: string[][]; isKv?: boolean; line?: string; lines?: string[] }> = [];
    let i = 0;
    const total = lines.length;

    const kvColonRegex = /^([A-Za-z0-9\s\/\(\)\-\_\&]{2,35})\s*[:\|]\s*(.+)$/;
    const salaryRegex = /^([A-Za-z0-9\s\/\(\)\-\_\&]{2,35}?)\s+((?:INR|Rs\.?|\$)\s*\[?[0-9,]+\]?|\[NA\])$/i;
    const kvBracketRegex = /^([A-Za-z0-9\s\/\(\)\-\_\&]{2,35}?)\s+(\[[^\]]+\](?:.*)?)$/;

    // 1. Page 1 Recipient block (Reference:, Date:, Employee Name:, Designation:)
    if (pageNum === 1 && total > 0) {
      const isRecipientLine = (l: string) => /^(Reference:|Date:|Employee Name:|Designation:)/i.test(l);
      while (i < total && !isRecipientLine(lines[i]) && !/^(Offer of Employment|Dear )/i.test(lines[i])) {
        blocks.push({ type: 'text', line: lines[i] });
        i++;
      }
      if (i < total && isRecipientLine(lines[i])) {
        const metaItems: string[] = [];
        while (i < total && (isRecipientLine(lines[i]) || lines[i].startsWith('['))) {
          metaItems.push(lines[i]);
          i++;
        }
        if (metaItems.length > 0) {
          blocks.push({ type: 'recipient_meta', lines: metaItems });
        }
      }
    }

    const matchKvLine = (lineStr: string): [string, string] | null => {
      if (lineStr.startsWith('http') || lineStr.startsWith('Subject:') || lineStr.includes('TaskNera') || lineStr.startsWith('Annexure')) {
        return null;
      }
      const mCol = kvColonRegex.exec(lineStr);
      if (mCol) return [mCol[1].trim(), mCol[2].trim()];
      const mSal = salaryRegex.exec(lineStr);
      if (mSal) return [mSal[1].trim(), mSal[2].trim()];
      const mBr = kvBracketRegex.exec(lineStr);
      if (mBr) return [mBr[1].trim(), mBr[2].trim()];
      return null;
    };

    while (i < total) {
      const line = lines[i];

      // 1. Pipe-separated lines: col1 | col2
      if (line.includes('|') && line.split('|').length >= 2) {
        const tableRows: string[][] = [];
        while (i < total && lines[i].includes('|') && lines[i].split('|').length >= 2) {
          const cells = lines[i].split('|').map((c) => c.trim());
          tableRows.push(cells);
          i++;
        }
        if (tableRows.length >= 2) {
          blocks.push({ type: 'table', rows: tableRows, isKv: false });
          continue;
        }
      }

      // 2. Key-Value Schedule or Salary Tables
      const kvRes = matchKvLine(line);
      if (kvRes) {
        const kvRows: string[][] = [];
        while (i < total) {
          const m = matchKvLine(lines[i]);
          if (m) {
            kvRows.push(m);
            i++;
          } else {
            break;
          }
        }
        if (kvRows.length >= 2) {
          blocks.push({ type: 'table', rows: kvRows, isKv: true });
          continue;
        } else {
          blocks.push({ type: 'text', line });
          i++;
          continue;
        }
      }

      blocks.push({ type: 'text', line });
      i++;
    }

    return blocks;
  }

  private static highlightTags(text: string): string {
    return text.replace(
      /(\[[a-zA-Z0-9_\s\-\/]+\])/g,
      '<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">$1</mark>'
    );
  }

  /**
   * Build TaskNera Multi-Page HTML for a specific page
   */
  private static buildPageHtml(pageNum: number, totalPages: number, rawText: string): string {
    const rawLines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const lines = rawLines.filter((l) => {
      if (l === 'TaskNera' || l.startsWith('TaskNera |') || l.includes('TaskNera | Page') || (l.includes('Page ') && l.includes(' of '))) {
        return false;
      }
      if (l.includes('D-57 F1 Dilshad Colony') || l.includes('Dilshad Colony, Shahdara') || l.includes('Dilshad Colony, Delhi')) {
        return false;
      }
      if (l.startsWith('Email: careers@tasknera.com') || l.startsWith('Phone: +91')) {
        return false;
      }
      return true;
    });

    // Page Header
    let headerHtml = '';
    if (pageNum === 1) {
      headerHtml = `
      <div style="position:relative; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <div style="width:280px; height:18px; background:#fae1c3; border-radius:0 0 14px 0;"></div>
          <div style="width:220px; height:8px; background:#9c7a82;"></div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0 8px 12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="/logo.png" alt="TaskNera" style="width:44px; height:44px; object-fit:contain;" />
            <span style="fontSize:24px; font-weight:800; color:#0f172a; letter-spacing:0.02em;">TASKNERA</span>
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
    } else {
      headerHtml = `
      <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; margin-bottom:20px; border-bottom:1px solid #e2d3ca;">
        <img src="/logo.png" alt="TaskNera" style="width:36px; height:36px; object-fit:contain;" />
        <div style="text-align:right;">
          <div style="font-size:18px; font-weight:800; color:#a35d39; font-family:'Georgia',serif;">TaskNera</div>
          <div style="font-size:11px; color:#64748b;">D-57 F1 Dilshad Colony, Shahdara, Delhi &ndash; 110095</div>
          <div style="font-size:11px; color:#64748b;">Email: careers@tasknera.com</div>
        </div>
      </div>
      `;
    }

    // Body content processing with table detection
    let bodyHtml = '';
    let inBulletList = false;

    const blocks = this.parseSemanticTablesFromLines(lines, pageNum);

    for (const block of blocks) {
      if (block.type === 'recipient_meta' && block.lines) {
        if (inBulletList) {
          bodyHtml += '</ul>\n';
          inBulletList = false;
        }
        bodyHtml += '<div style="margin:10px 0 20px; font-size:13px; line-height:1.8; color:#1e293b;">\n';
        for (const ml of block.lines) {
          if (ml.includes(':')) {
            const [lbl, ...rest] = ml.split(':');
            const val = rest.join(':').trim();
            const isEmp = lbl.trim().toLowerCase() === 'employee name';
            bodyHtml += `  <div style="${isEmp ? 'margin-top:10px;' : ''}"><strong>${lbl.trim()}:</strong> ${this.highlightTags(val)}</div>\n`;
          } else {
            bodyHtml += `  <div>${this.highlightTags(ml)}</div>\n`;
          }
        }
        bodyHtml += '</div>\n';
        continue;
      }

      if (block.type === 'table' && block.rows) {
        if (inBulletList) {
          bodyHtml += '</ul>\n';
          inBulletList = false;
        }
        bodyHtml += this.renderHtmlTable(block.rows, block.isKv) + '\n';
        continue;
      }

      const line = block.line || '';

      if (/^(Offer of Employment|Appointment Letter|Internship Offer|Employment Agreement)/i.test(line)) {
        if (inBulletList) {
          bodyHtml += '</ul>\n';
          inBulletList = false;
        }
        bodyHtml += `<h2 style="text-align:center; font-size:22px; font-weight:700; color:#a35d39; margin:24px 0 20px; font-family:'Georgia',serif;">${line}</h2>\n`;
      } else if (/^(Annexure\s+[IVX]+)/i.test(line)) {
        if (inBulletList) {
          bodyHtml += '</ul>\n';
          inBulletList = false;
        }
        bodyHtml += `<h3 style="text-align:center; font-size:18px; font-weight:700; color:#a35d39; margin:16px 0 20px; font-family:'Georgia',serif;">${line}</h3>\n`;
      } else if (/^\d+[\.\)]\s+/.test(line) || /^(?:Section|Clause)\s+\d+/i.test(line)) {
        if (inBulletList) {
          bodyHtml += '</ul>\n';
          inBulletList = false;
        }
        bodyHtml += `<h3 style="font-size:14px; font-weight:700; color:#a35d39; border-bottom:1px solid #e2d3ca; padding-bottom:4px; margin:18px 0 8px; font-family:'Georgia',serif;">${line}</h3>\n`;
      } else if (line.startsWith('•') || line.startsWith('- ') || line.startsWith('* ')) {
        const bulletItem = line.replace(/^[•\-\*]\s*/, '').trim();
        if (!inBulletList) {
          bodyHtml += '<ul style="font-size:12.5px; color:#475569; line-height:1.65; padding-left:22px; margin:6px 0 10px;">\n';
          inBulletList = true;
        }
        bodyHtml += `<li style="margin-bottom:4px;">${this.highlightTags(bulletItem)}</li>\n`;
      } else if (/^(For TaskNera|Accepted and Agreed by Employee)/i.test(line)) {
        if (inBulletList) {
          bodyHtml += '</ul>\n';
          inBulletList = false;
        }
        bodyHtml += `<div style="margin-top:24px; margin-bottom:16px;"><p style="font-weight:700; color:#a35d39; font-size:14px; margin:0 0 12px; font-family:'Georgia',serif;">${line}</p><div style="width:280px; border-bottom:1px solid #334155; margin-bottom:8px;"></div></div>\n`;
      } else if (line.startsWith('Subject:')) {
        if (inBulletList) {
          bodyHtml += '</ul>\n';
          inBulletList = false;
        }
        bodyHtml += `<p style="margin-bottom:14px; font-weight:700; font-size:13.5px; color:#0f172a;">${line}</p>\n`;
      } else if (line.startsWith('Dear ')) {
        if (inBulletList) {
          bodyHtml += '</ul>\n';
          inBulletList = false;
        }
        bodyHtml += `<p style="margin-bottom:12px; font-size:13.5px; color:#1e293b;">${this.highlightTags(line)}</p>\n`;
      } else if (line.startsWith('Mandatory Joining Documents') || line.startsWith('Joining Formalities')) {
        if (inBulletList) {
          bodyHtml += '</ul>\n';
          inBulletList = false;
        }
        bodyHtml += `<h4 style="font-size:14px; font-weight:700; color:#a35d39; margin:22px 0 10px; font-family:'Georgia',serif;">${line}</h4>\n`;
      } else {
        if (inBulletList) {
          bodyHtml += '</ul>\n';
          inBulletList = false;
        }
        bodyHtml += `<p style="font-size:13px; line-height:1.65; color:#334155; margin-bottom:8px; text-align:justify;">${this.highlightTags(line)}</p>\n`;
      }
    }

    if (inBulletList) {
      bodyHtml += '</ul>\n';
    }

    // Page Footer
    const footerHtml = `
    <div style="margin-top:36px; border-top:1px solid #e2e8f0; padding-top:10px; text-align:center; font-size:11px; color:#94a3b8;">
      TaskNera | Page ${pageNum} of ${totalPages}
    </div>
    `;

    return `
    <div class="document-page-sheet" data-page="${pageNum}">
      ${headerHtml}
      <div class="document-page-body">
        ${bodyHtml}
      </div>
      ${footerHtml}
    </div>
    `.trim();
  }

}
