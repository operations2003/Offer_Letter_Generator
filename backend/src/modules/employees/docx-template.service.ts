// =============================================================================
// DYNAMIC DOCX TEMPLATE PARSER & AUTOFILL ENGINE
// =============================================================================
// Intelligently parses uploaded DOCX templates without corrupting styles,
// layout, fonts, tables, headers, or footers.
//
// Key Capabilities:
// 1. Run-Stitching: Solves the DOCX run-splitting problem across <w:r> runs.
// 2. Multi-Section XML Traversal: document.xml, header*.xml, footer*.xml, footnotes, tables.
// 3. Multi-Syntax Placeholder Detection: [Bracketed], {{curly}}, <<chevrons>>, blank underlines.
// 4. Safe Original Archiving: Original template is NEVER modified; working copies generated.
// 5. Preserves formatting: bold, italic, font, size, alignment, table structure intact.
// =============================================================================

import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { BadRequestError } from '../../errors/app-error.js';
import { FieldMappingService } from './field-mapping.service.js';

export interface DocxTemplateInspectionResult {
  templateStoragePath: string;
  originalFileName: string;
  fileSizeBytes: number;
  detectedPlaceholders: string[];
  extractedPreviewText: string;
  hasHeaders: boolean;
  hasFooters: boolean;
  hasTables: boolean;
}

export interface TextNodeInfo {
  matchStart: number;
  matchEnd: number;
  openTag: string;
  closeTag: string;
  rawContent: string;
  rawText: string;
  textOffset: number;
  textLength: number;
}

export class DocxTemplateService {
  private static readonly ORIGINAL_TEMPLATES_DIR = path.resolve(process.cwd(), 'uploads', 'templates', 'original');
  private static readonly WORKING_DOCS_DIR = path.resolve(process.cwd(), 'uploads', 'employee-documents');

  /**
   * Ensure required storage directories exist
   */
  static ensureDirectories(): void {
    if (!fs.existsSync(this.ORIGINAL_TEMPLATES_DIR)) {
      fs.mkdirSync(this.ORIGINAL_TEMPLATES_DIR, { recursive: true });
    }
    if (!fs.existsSync(this.WORKING_DOCS_DIR)) {
      fs.mkdirSync(this.WORKING_DOCS_DIR, { recursive: true });
    }
  }

  /**
   * XML escape helper
   */
  static xmlEscape(str: string): string {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * XML unescape helper
   */
  static xmlUnescape(str: string): string {
    if (!str) return '';
    return String(str)
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
  }

  /**
   * Validates whether a buffer is a valid DOCX file (ZIP container with word/document.xml)
   */
  static async validateDocxBuffer(buffer: Buffer): Promise<boolean> {
    if (!buffer || buffer.length < 4) return false;
    // Check PK\x03\x04 zip signature
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4b || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
      return false;
    }
    try {
      const zip = await JSZip.loadAsync(buffer);
      return Boolean(zip.file('word/document.xml'));
    } catch {
      return false;
    }
  }

  /**
   * 1. SAFELY STORE ORIGINAL TEMPLATE FILE
   * Saves the original uploaded DOCX safely under uploads/templates/original/.
   * The original file is NEVER modified during document generation.
   */
  static async storeOriginalTemplate(buffer: Buffer, originalFileName: string): Promise<string> {
    this.ensureDirectories();

    const isValid = await this.validateDocxBuffer(buffer);
    if (!isValid) {
      throw new BadRequestError(`File "${originalFileName}" is not a valid OpenXML Word document (.docx).`);
    }

    const timestamp = Date.now();
    const sanitizedName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeFileName = `tpl_orig_${timestamp}_${sanitizedName}`;
    const storagePath = path.join(this.ORIGINAL_TEMPLATES_DIR, safeFileName);

    fs.writeFileSync(storagePath, buffer);
    return storagePath;
  }

  /**
   * Detects placeholders in plain text string across multiple styles:
   * 1. [Placeholder]
   * 2. {{placeholder}}
   * 3. <<placeholder>>
   * 4. Label: _________
   */
  static extractPlaceholdersFromText(text: string): string[] {
    const placeholders = new Set<string>();
    if (!text) return [];

    // 1. Bracket style: [Employee Full Name], [Designation], etc.
    const bracketRegex = /\[([a-zA-Z0-9_\s\.\/\-\(\)\$#@&%]+?)\]/g;
    let match: RegExpExecArray | null;
    while ((match = bracketRegex.exec(text)) !== null) {
      const ph = match[0].trim();
      if (ph.length > 2 && ph.length < 80) {
        placeholders.add(ph);
      }
    }

    // 2. Curly style: {{employee_name}}, {{designation}}, etc.
    const curlyRegex = /\{\{\s*([a-zA-Z0-9_\s\.\/\-\(\)\$#@&%]+?)\s*\}\}/g;
    while ((match = curlyRegex.exec(text)) !== null) {
      const ph = match[0].trim();
      if (ph.length > 4 && ph.length < 80) {
        placeholders.add(ph);
      }
    }

    // 3. Chevron style: <<Employee Name>>, <<Designation>>, etc.
    const chevronRegex = /<<\s*([a-zA-Z0-9_\s\.\/\-\(\)\$#@&%]+?)\s*>>/g;
    while ((match = chevronRegex.exec(text)) !== null) {
      const ph = match[0].trim();
      if (ph.length > 4 && ph.length < 80) {
        placeholders.add(ph);
      }
    }

    // 4. Underline blank style: Employee Name: ____________
    const blankRegex = /(?:Employee(?:\s+Full)?\s+Name|Designation|Department|Joining\s+Date|Date\s+of\s+Joining|Annual\s+CTC|Work\s+Location|Reporting\s+Manager):\s*_{3,}/gi;
    while ((match = blankRegex.exec(text)) !== null) {
      placeholders.add(match[0].trim());
    }

    return Array.from(placeholders);
  }

  /**
   * Extracts all <w:t> text nodes inside a paragraph XML string,
   * calculating their start and end character positions in the concatenated string.
   */
  private static parseTextNodes(paragraphXml: string): {
    nodes: TextNodeInfo[];
    fullText: string;
  } {
    const nodes: TextNodeInfo[] = [];
    const tRegex = /(<w:t(?:\s+[^>]*)?>)([\s\S]*?)(<\/w:t>)/g;
    let match: RegExpExecArray | null;
    let currentOffset = 0;

    while ((match = tRegex.exec(paragraphXml)) !== null) {
      const openTag = match[1];
      const rawContent = match[2];
      const closeTag = match[3];
      const rawText = this.xmlUnescape(rawContent);

      nodes.push({
        matchStart: match.index,
        matchEnd: match.index + match[0].length,
        openTag,
        closeTag,
        rawContent,
        rawText,
        textOffset: currentOffset,
        textLength: rawText.length,
      });

      currentOffset += rawText.length;
    }

    const fullText = nodes.map((n) => n.rawText).join('');
    return { nodes, fullText };
  }

  /**
   * Run-Stitching Placeholder Replacement within a single <w:p> paragraph XML string:
   * Solves the DOCX run-splitting problem across multiple <w:r> runs.
   * Preserves all formatting: bold, italic, fonts, styles, alignment, spacing.
   */
  static processParagraphXml(
    paragraphXml: string,
    replacementMap?: Record<string, string>
  ): {
    updatedXml: string;
    detectedPlaceholders: string[];
    paragraphPlainText: string;
  } {
    const detected: string[] = [];

    // Parse initial text nodes
    let { nodes, fullText } = this.parseTextNodes(paragraphXml);
    if (!nodes || nodes.length === 0 || !fullText.trim()) {
      return {
        updatedXml: paragraphXml,
        detectedPlaceholders: [],
        paragraphPlainText: fullText,
      };
    }

    // Extract all placeholders present in fullText
    const foundPlaceholders = this.extractPlaceholdersFromText(fullText);
    foundPlaceholders.forEach((p) => detected.push(p));

    // If no replacements requested, return detected
    if (!replacementMap || Object.keys(replacementMap).length === 0) {
      return {
        updatedXml: paragraphXml,
        detectedPlaceholders: detected,
        paragraphPlainText: fullText,
      };
    }

    // Build lookup map: support exact placeholder, bracketless, normalized, and lowercase
    const lookup: Record<string, string> = {};
    for (const [key, val] of Object.entries(replacementMap)) {
      if (val !== undefined && val !== null) {
        lookup[key] = String(val);
        const clean = FieldMappingService.normalizeToken(key);
        if (clean) lookup[clean] = String(val);
      }
    }

    // Helper: resolve replacement value for a placeholder string
    const resolveValue = (rawPh: string): string | null => {
      if (lookup[rawPh] !== undefined) return lookup[rawPh];
      const clean = FieldMappingService.normalizeToken(rawPh);
      if (lookup[clean] !== undefined) return lookup[clean];

      // Check alias map to canonical key
      const canonical = FieldMappingService.ALIAS_MAP[clean];
      if (canonical) {
        if (lookup[canonical] !== undefined) return lookup[canonical];
        const cleanCanonical = FieldMappingService.normalizeToken(canonical);
        if (lookup[cleanCanonical] !== undefined) return lookup[cleanCanonical];
      }

      // Check reverse alias
      for (const [alias, targetKey] of Object.entries(FieldMappingService.ALIAS_MAP)) {
        if (clean === alias || clean.includes(alias) || alias.includes(clean)) {
          if (lookup[targetKey] !== undefined) return lookup[targetKey];
          const cleanTarget = FieldMappingService.normalizeToken(targetKey);
          if (lookup[cleanTarget] !== undefined) return lookup[cleanTarget];
        }
      }

      return null;
    };

    // Perform replacements across runs inside paragraphXml
    // We iterate replacing one match at a time and re-parsing nodes
    let currentXml = paragraphXml;
    let hasMoreMatches = true;
    let iterationCount = 0;
    const maxIterations = 50; // Guard against infinite loops

    while (hasMoreMatches && iterationCount < maxIterations) {
      iterationCount++;
      const parsed = this.parseTextNodes(currentXml);
      const text = parsed.fullText;
      const currentNodes = parsed.nodes;

      if (!currentNodes.length) break;

      // Find all placeholder matches in current text
      const matches: Array<{ start: number; end: number; raw: string; value: string }> = [];

      // 1. Bracket style
      const bracketRegex = /\[([a-zA-Z0-9_\s\.\/\-\(\)\$#@&%]+?)\]/g;
      let m: RegExpExecArray | null;
      while ((m = bracketRegex.exec(text)) !== null) {
        const val = resolveValue(m[0]);
        if (val !== null) {
          matches.push({ start: m.index, end: m.index + m[0].length, raw: m[0], value: val });
        }
      }

      // 2. Curly style
      const curlyRegex = /\{\{\s*([a-zA-Z0-9_\s\.\/\-\(\)\$#@&%]+?)\s*\}\}/g;
      while ((m = curlyRegex.exec(text)) !== null) {
        const val = resolveValue(m[0]);
        if (val !== null) {
          matches.push({ start: m.index, end: m.index + m[0].length, raw: m[0], value: val });
        }
      }

      // 3. Chevron style
      const chevronRegex = /<<\s*([a-zA-Z0-9_\s\.\/\-\(\)\$#@&%]+?)\s*>>/g;
      while ((m = chevronRegex.exec(text)) !== null) {
        const val = resolveValue(m[0]);
        if (val !== null) {
          matches.push({ start: m.index, end: m.index + m[0].length, raw: m[0], value: val });
        }
      }

      // 4. Underline blank style
      const blankRegex = /(?:Employee(?:\s+Full)?\s+Name|Designation|Department|Joining\s+Date|Date\s+of\s+Joining|Annual\s+CTC|Work\s+Location|Reporting\s+Manager):\s*_{3,}/gi;
      while ((m = blankRegex.exec(text)) !== null) {
        const val = resolveValue(m[0]);
        if (val !== null) {
          matches.push({ start: m.index, end: m.index + m[0].length, raw: m[0], value: val });
        }
      }

      if (matches.length === 0) {
        hasMoreMatches = false;
        break;
      }

      // Sort matches right-to-left (descending start) so replacing earlier matches doesn't invalidate subsequent index
      matches.sort((a, b) => b.start - a.start);

      // Process the first match (which is rightmost)
      const targetMatch = matches[0];
      const matchStart = targetMatch.start;
      const matchEnd = targetMatch.end;
      const replacementText = targetMatch.value;

      // Find all overlapping nodes for targetMatch
      const overlappingNodes = currentNodes.filter(
        (n) => n.textOffset < matchEnd && n.textOffset + n.textLength > matchStart
      );

      if (overlappingNodes.length === 0) {
        // Should not happen, but safeguard
        break;
      }

      const firstNode = overlappingNodes[0];
      const lastNode = overlappingNodes[overlappingNodes.length - 1];

      // Reconstruct replacement across nodes
      if (firstNode === lastNode) {
        // Case 1: Match is entirely within a single node
        const offsetInNodeStart = Math.max(0, matchStart - firstNode.textOffset);
        const offsetInNodeEnd = Math.min(firstNode.textLength, matchEnd - firstNode.textOffset);

        const before = firstNode.rawText.substring(0, offsetInNodeStart);
        const after = firstNode.rawText.substring(offsetInNodeEnd);
        const newText = before + replacementText + after;

        const openTagWithSpace = firstNode.openTag.includes('xml:space')
          ? firstNode.openTag
          : '<w:t xml:space="preserve">';

        const newTagXml = `${openTagWithSpace}${this.xmlEscape(newText)}</w:t>`;
        currentXml =
          currentXml.substring(0, firstNode.matchStart) +
          newTagXml +
          currentXml.substring(firstNode.matchEnd);
      } else {
        // Case 2: Match is split across multiple runs / text nodes
        // Replace from last node back to first node in currentXml to preserve character index offsets
        for (let i = overlappingNodes.length - 1; i >= 0; i--) {
          const node = overlappingNodes[i];
          let updatedNodeXml = '';

          if (node === firstNode) {
            // First run gets: prefix + full replacement text
            const offsetInNodeStart = Math.max(0, matchStart - node.textOffset);
            const before = node.rawText.substring(0, offsetInNodeStart);
            const newText = before + replacementText;
            const openTagWithSpace = node.openTag.includes('xml:space')
              ? node.openTag
              : '<w:t xml:space="preserve">';
            updatedNodeXml = `${openTagWithSpace}${this.xmlEscape(newText)}</w:t>`;
          } else if (node === lastNode) {
            // Last run gets: suffix
            const offsetInNodeEnd = Math.min(node.textLength, matchEnd - node.textOffset);
            const after = node.rawText.substring(offsetInNodeEnd);
            const openTagWithSpace = node.openTag.includes('xml:space')
              ? node.openTag
              : '<w:t xml:space="preserve">';
            updatedNodeXml = `${openTagWithSpace}${this.xmlEscape(after)}</w:t>`;
          } else {
            // Intermediate runs: absorbed into placeholder, emptied
            updatedNodeXml = '<w:t></w:t>';
          }

          currentXml =
            currentXml.substring(0, node.matchStart) +
            updatedNodeXml +
            currentXml.substring(node.matchEnd);
        }
      }
    }

    const finalParsed = this.parseTextNodes(currentXml);
    return {
      updatedXml: currentXml,
      detectedPlaceholders: detected,
      paragraphPlainText: finalParsed.fullText,
    };
  }

  /**
   * Processes all paragraphs <w:p>...</w:p> in an XML string.
   * Automatically handles normal body paragraphs, table cells, text boxes, headers, footers.
   */
  static processXmlContent(
    xmlContent: string,
    replacementMap?: Record<string, string>
  ): {
    updatedXml: string;
    detectedPlaceholders: string[];
    plainText: string;
  } {
    const allPlaceholders = new Set<string>();
    const plainTextLines: string[] = [];

    // Match all paragraphs <w:p ...>...</w:p>
    const pRegex = /<w:p\b[^>]*>[\s\S]*?<\/w:p>/g;

    const updatedXml = xmlContent.replace(pRegex, (paragraphXml) => {
      const result = this.processParagraphXml(paragraphXml, replacementMap);
      result.detectedPlaceholders.forEach((ph) => allPlaceholders.add(ph));
      if (result.paragraphPlainText.trim()) {
        plainTextLines.push(result.paragraphPlainText.trim());
      }
      return result.updatedXml;
    });

    return {
      updatedXml,
      detectedPlaceholders: Array.from(allPlaceholders),
      plainText: plainTextLines.join('\n\n'),
    };
  }

  /**
   * 2. ANALYZE CUSTOM TEMPLATE FILE
   * Reads template DOCX, scans document.xml, headers, footers, tables,
   * extracts all detected placeholders, and generates a preview of the document.
   */
  static async inspectCustomTemplate(storagePath: string): Promise<DocxTemplateInspectionResult> {
    if (!fs.existsSync(storagePath)) {
      throw new BadRequestError(`Custom template file does not exist at ${storagePath}`);
    }

    const buffer = fs.readFileSync(storagePath);
    const zip = await JSZip.loadAsync(buffer);

    const detectedPlaceholders = new Set<string>();
    const previewTextParts: string[] = [];
    let hasHeaders = false;
    let hasFooters = false;
    let hasTables = false;

    // List of XML files to process
    const xmlFileNames: string[] = [];
    zip.forEach((relativePath) => {
      if (relativePath.startsWith('word/') && relativePath.endsWith('.xml')) {
        xmlFileNames.push(relativePath);
        if (relativePath.includes('header')) hasHeaders = true;
        if (relativePath.includes('footer')) hasFooters = true;
      }
    });

    // Check for tables in document.xml
    const docXmlFile = zip.file('word/document.xml');
    if (docXmlFile) {
      const docXml = await docXmlFile.async('text');
      if (docXml.includes('<w:tbl')) {
        hasTables = true;
      }
    }

    // Process document.xml first, then headers, then footers
    const prioritizedFiles = [
      'word/document.xml',
      ...xmlFileNames.filter((f) => f.includes('header')),
      ...xmlFileNames.filter((f) => f.includes('footer')),
      ...xmlFileNames.filter(
        (f) => f !== 'word/document.xml' && !f.includes('header') && !f.includes('footer')
      ),
    ];

    for (const fileName of prioritizedFiles) {
      const file = zip.file(fileName);
      if (!file) continue;

      const xml = await file.async('text');
      const result = this.processXmlContent(xml);

      result.detectedPlaceholders.forEach((ph) => detectedPlaceholders.add(ph));
      if (fileName === 'word/document.xml') {
        previewTextParts.push(result.plainText);
      }
    }

    return {
      templateStoragePath: storagePath,
      originalFileName: path.basename(storagePath),
      fileSizeBytes: buffer.length,
      detectedPlaceholders: Array.from(detectedPlaceholders),
      extractedPreviewText: previewTextParts.join('\n\n'),
      hasHeaders,
      hasFooters,
      hasTables,
    };
  }

  /**
   * 3. POPULATE DOCX TEMPLATE (DYNAMIC AUTOFILL)
   * Generates a populated working copy of the original DOCX template.
   * - Reads original DOCX into memory
   * - Replaces all mapped placeholders across all XML parts (document, headers, footers, tables)
   * - Preserves all original styles, fonts, tables, margins, layouts
   * - Returns populated DOCX binary buffer and rendered plain text
   */
  static async populateDocxTemplate(
    originalTemplatePath: string,
    replacementMap: Record<string, string>
  ): Promise<{
    docxBuffer: Buffer;
    renderedPlainText: string;
    detectedPlaceholders: string[];
  }> {
    if (!fs.existsSync(originalTemplatePath)) {
      throw new BadRequestError(`Original template not found at ${originalTemplatePath}`);
    }

    const originalBuffer = fs.readFileSync(originalTemplatePath);
    const zip = await JSZip.loadAsync(originalBuffer);

    const allDetected = new Set<string>();
    let mainDocumentText = '';

    // Collect all XML files inside word/
    const xmlFiles: string[] = [];
    zip.forEach((relativePath) => {
      if (relativePath.startsWith('word/') && relativePath.endsWith('.xml')) {
        xmlFiles.push(relativePath);
      }
    });

    for (const relativePath of xmlFiles) {
      const file = zip.file(relativePath);
      if (!file) continue;

      const xmlContent = await file.async('text');
      const processed = this.processXmlContent(xmlContent, replacementMap);

      processed.detectedPlaceholders.forEach((p) => allDetected.add(p));
      if (relativePath === 'word/document.xml') {
        mainDocumentText = processed.plainText;
      }

      // Update the modified XML in the zip archive
      zip.file(relativePath, processed.updatedXml);
    }

    // Generate output DOCX buffer with DEFLATE compression
    const docxBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    return {
      docxBuffer,
      renderedPlainText: mainDocumentText,
      detectedPlaceholders: Array.from(allDetected),
    };
  }
}
