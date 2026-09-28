import crypto from 'node:crypto';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';
import { BadRequestError } from '../../errors/app-error.js';

export interface ExtractedDocumentResult {
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  fileHashSha256: string;
  extractedText: string;
  detectedFormat: 'PDF' | 'DOCX' | 'TXT';
  pageCount?: number;
}

export class DocumentExtractorService {
  /**
   * Allowed file extensions and corresponding MIME patterns
   */
  private static readonly ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];
  private static readonly MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

  /**
   * Validates and extracts text from an uploaded document buffer (PDF, DOCX, TXT)
   */
  static async extractTextFromBuffer(
    buffer: Buffer,
    originalFileName: string,
    mimeType: string
  ): Promise<ExtractedDocumentResult> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestError('Uploaded file is empty.');
    }

    if (buffer.length > this.MAX_FILE_SIZE) {
      throw new BadRequestError(`File size exceeds 15MB limit (${(buffer.length / (1024 * 1024)).toFixed(1)}MB).`);
    }

    const lowerName = originalFileName.toLowerCase();
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    let detectedFormat: 'PDF' | 'DOCX' | 'TXT';
    let extractedText = '';
    let pageCount: number | undefined;

    // 1. Executable and binary signature screening
    if (buffer.length >= 4) {
      // Windows PE/DOS executable (.exe, .dll, .bat, .sys)
      if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
        throw new BadRequestError(`File "${originalFileName}" is an executable binary and is strictly rejected.`);
      }
      // Linux ELF binary
      if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
        throw new BadRequestError(`File "${originalFileName}" contains an executable ELF binary and is rejected.`);
      }
      // Java class / Mach-O binary
      if (
        (buffer[0] === 0xca && buffer[1] === 0xfe && buffer[2] === 0xba && buffer[3] === 0xbe) ||
        (buffer[0] === 0xcf && buffer[1] === 0xfa && buffer[2] === 0xed && buffer[3] === 0xfe)
      ) {
        throw new BadRequestError(`File "${originalFileName}" contains compiled binary bytecode and is rejected.`);
      }
    }

    // 2. Format validation with magic byte verification
    if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
      detectedFormat = 'PDF';
      // Verify %PDF- header in first 1024 bytes
      const headerSnippet = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('latin1');
      if (!headerSnippet.includes('%PDF-')) {
        throw new BadRequestError(`File "${originalFileName}" lacks a valid PDF header signature.`);
      }

      try {
        const parsed = await (pdf as any)(buffer);
        extractedText = parsed.text || '';
        pageCount = parsed.numpages;
      } catch (err: any) {
        throw new BadRequestError(`Failed to parse PDF document: ${err.message || 'Corrupt or password-protected PDF'}`);
      }
    } else if (
      lowerName.endsWith('.docx') ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/docx'
    ) {
      detectedFormat = 'DOCX';
      // Verify PK\x03\x04 zip container magic bytes
      if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
        throw new BadRequestError(`File "${originalFileName}" is not a valid OpenXML Word document (invalid ZIP container signature).`);
      }

      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
      } catch (err: any) {
        throw new BadRequestError(`Failed to parse DOCX document: ${err.message || 'Corrupt DOCX file'}`);
      }
    } else if (
      lowerName.endsWith('.txt') ||
      mimeType.startsWith('text/') ||
      mimeType === 'application/octet-stream'
    ) {
      detectedFormat = 'TXT';
      extractedText = buffer.toString('utf-8');
    } else {
      throw new BadRequestError(
        `Unsupported document format for "${originalFileName}". Allowed formats are PDF (.pdf), DOCX (.docx), and TXT (.txt).`
      );
    }

    // Sanitize extracted text
    const cleanedText = this.sanitizeText(extractedText);

    if (!cleanedText || cleanedText.length < 5) {
      throw new BadRequestError(
        `Document "${originalFileName}" does not contain readable text. It may be scanned or empty.`
      );
    }

    return {
      fileName: originalFileName,
      fileSizeBytes: buffer.length,
      mimeType,
      fileHashSha256: sha256,
      extractedText: cleanedText,
      detectedFormat,
      pageCount,
    };
  }

  /**
   * Sanitizes extracted text:
   * - Strips null bytes and unprintable ASCII control codes
   * - Neutralizes prompt injection XML tags (e.g. </untrusted_document_content>)
   * - Normalizes newlines and whitespace
   */
  private static sanitizeText(text: string): string {
    return text
      .replace(/\0/g, '') // Remove null bytes
      .replace(/<\/?(untrusted_document_content|system_override|instruction|prompt|system)>/gi, '[SANITIZED_TAG]') // Neutralize prompt injection tags
      .replace(/\r\n/g, '\n') // Normalize Windows newlines
      .replace(/\r/g, '\n') // Normalize Mac newlines
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove unprintable ASCII control codes
      .replace(/\n{3,}/g, '\n\n') // Collapse excessive newlines
      .trim();
  }
}
