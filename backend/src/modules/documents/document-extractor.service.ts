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

    // Detect format by extension and MIME
    if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
      detectedFormat = 'PDF';
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
   * Sanitizes extracted text by stripping null bytes, excessive whitespace, and non-printable noise
   */
  private static sanitizeText(text: string): string {
    return text
      .replace(/\0/g, '') // Remove null bytes
      .replace(/\r\n/g, '\n') // Normalize Windows newlines
      .replace(/\r/g, '\n') // Normalize Mac newlines
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove unprintable ASCII control codes
      .replace(/\n{3,}/g, '\n\n') // Collapse excessive newlines
      .trim();
  }
}
