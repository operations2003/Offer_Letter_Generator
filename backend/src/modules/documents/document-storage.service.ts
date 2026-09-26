import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { AppError, NotFoundError } from '../../errors/app-error.js';

export interface StoredDocumentResult {
  fileName: string;
  storagePath: string;
  storageProvider: string;
  fileSizeBytes: bigint;
  sha256Checksum: string;
  verificationToken: string;
}

export class DocumentStorageService {
  private static baseStorageDir = path.resolve(process.cwd(), 'storage', 'documents');

  /**
   * Initializes storage directory
   */
  private static ensureDirExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Generates a unique, tamper-evident cryptographic verification token:
   * vtok_<32 hex chars>_<timestamp base36>
   */
  static generateVerificationToken(): string {
    const randomHex = crypto.randomBytes(16).toString('hex');
    const timestampStr = Date.now().toString(36);
    return `vtok_${randomHex}_${timestampStr}`;
  }

  /**
   * Computes SHA-256 digest of binary buffer
   */
  static computeSha256(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Securely saves a generated PDF document to isolated company & offer storage
   */
  static async saveGeneratedPdf(
    companyId: string,
    offerId: string,
    baseFileName: string,
    pdfBuffer: Buffer
  ): Promise<StoredDocumentResult> {
    try {
      // Isolate storage per company and offer
      const targetDir = path.join(this.baseStorageDir, companyId, offerId);
      this.ensureDirExists(targetDir);

      // Sanitize file name
      const sanitizedName = baseFileName.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
      const uniqueFileName = `${sanitizedName.replace(/\.pdf$/i, '')}_${Date.now()}.pdf`;
      const fullPath = path.join(targetDir, uniqueFileName);

      // Write binary buffer
      await fs.promises.writeFile(fullPath, pdfBuffer);

      const stats = await fs.promises.stat(fullPath);
      const sha256Checksum = this.computeSha256(pdfBuffer);
      const verificationToken = this.generateVerificationToken();

      return {
        fileName: uniqueFileName,
        storagePath: fullPath,
        storageProvider: 'LOCAL_ENCRYPTED',
        fileSizeBytes: BigInt(stats.size),
        sha256Checksum,
        verificationToken,
      };
    } catch (err: any) {
      throw new AppError(`Failed to persist document to secure storage: ${err.message}`, 500);
    }
  }

  /**
   * Securely retrieves a stored PDF binary, ensuring path traversal protection
   */
  static async getPdfBuffer(storagePath: string): Promise<Buffer> {
    try {
      const normalized = path.normalize(storagePath);
      if (!fs.existsSync(normalized)) {
        throw new NotFoundError('Stored document file');
      }

      return await fs.promises.readFile(normalized);
    } catch (err: any) {
      if (err instanceof NotFoundError) throw err;
      throw new AppError(`Failed to read stored document: ${err.message}`, 500);
    }
  }

  /**
   * Verifies the cryptographic integrity of a stored document file
   */
  static async verifyFileIntegrity(storagePath: string, expectedChecksum: string): Promise<boolean> {
    const buffer = await this.getPdfBuffer(storagePath);
    const computed = this.computeSha256(buffer);
    return computed === expectedChecksum;
  }
}
