// =============================================================================
// REUSABLE HR DOCUMENT ENGINE: FRONTEND API CLIENT SERVICE
// =============================================================================

import {
  DocumentTypeDefinition,
  DocumentTypeCode,
  DocumentLifecycleStatus,
  HrDocument,
  AiExtractedFieldInfo,
} from '../types/document-engine.js';

export interface CreateDocumentPayload {
  documentTypeCode: DocumentTypeCode;
  title: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientExternalId?: string;
  templateId?: string;
  templateVersionId?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  effectiveDate?: string;
  validUntil?: string;
}

export class DocumentEngineService {
  private static getAuthHeaders(): HeadersInit {
    const token =
      localStorage.getItem('offergen_token') ||
      localStorage.getItem('token') ||
      'demo_jwt_token_sample';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Fetch all registered document types (Core 9 + Future 6)
   */
  static async getDocumentTypes(): Promise<DocumentTypeDefinition[]> {
    try {
      const res = await fetch('/api/v1/document-types', {
        headers: this.getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load document types');
      const json = await res.json();
      return json.data;
    } catch {
      // Fallback to locally embedded registry if offline or server initializing
      const { DOCUMENT_TYPE_REGISTRY } = await import(
        '../../../backend/src/modules/documents/document-engine/document-type.registry.js'
      );
      return Object.values(DOCUMENT_TYPE_REGISTRY);
    }
  }

  /**
   * Fetch specification for a specific document type
   */
  static async getDocumentTypeByCode(code: DocumentTypeCode): Promise<DocumentTypeDefinition | null> {
    try {
      const res = await fetch(`/api/v1/document-types/${code}`, {
        headers: this.getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to load document type ${code}`);
      const json = await res.json();
      return json.data;
    } catch {
      const { DOCUMENT_TYPE_REGISTRY } = await import(
        '../../../backend/src/modules/documents/document-engine/document-type.registry.js'
      );
      return (DOCUMENT_TYPE_REGISTRY as any)[code] || null;
    }
  }

  /**
   * Create a new document of any type
   */
  static async createDocument(payload: CreateDocumentPayload): Promise<HrDocument> {
    const res = await fetch('/api/v1/hr-documents', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to create document' }));
      throw new Error(err.message || 'Failed to create document');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * List documents with optional filters
   */
  static async listDocuments(params?: {
    type?: DocumentTypeCode;
    status?: DocumentLifecycleStatus;
    search?: string;
  }): Promise<HrDocument[]> {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/v1/hr-documents?${query.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list documents');
    const json = await res.json();
    return json.data;
  }

  /**
   * Get single document
   */
  static async getDocumentById(id: string): Promise<HrDocument> {
    const res = await fetch(`/api/v1/hr-documents/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Document ${id} not found`);
    const json = await res.json();
    return json.data;
  }

  /**
   * Ingest AI advisory extractions
   */
  static async ingestAiData(
    id: string,
    extractedFields: Record<string, AiExtractedFieldInfo>,
    overallConfidence = 0.9,
    warnings: string[] = []
  ): Promise<HrDocument> {
    const res = await fetch(`/api/v1/hr-documents/${id}/ai-ingest`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ extractedFields, overallConfidence, warnings }),
    });
    if (!res.ok) throw new Error('Failed to ingest AI extraction');
    const json = await res.json();
    return json.data;
  }

  /**
   * Confirm HR terms (Enforcing legal authority & human overrides)
   */
  static async confirmTerms(
    id: string,
    hrConfirmedData: Record<string, unknown>,
    humanOverrides?: Array<{ fieldKey: string; overrideReason?: string }>
  ): Promise<{ document: HrDocument; validation: any }> {
    const res = await fetch(`/api/v1/hr-documents/${id}/confirm-terms`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ hrConfirmedData, humanOverrides }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to confirm terms' }));
      throw new Error(err.message || 'Failed to confirm terms');
    }
    const json = await res.json();
    return { document: json.data, validation: json.validation };
  }

  /**
   * Generate official PDF document
   */
  static async generatePdf(id: string): Promise<{
    document: HrDocument;
    sha256Checksum: string;
    verificationToken: string;
    fileSizeBytes: number;
  }> {
    const res = await fetch(`/api/v1/hr-documents/${id}/generate-pdf`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to generate PDF' }));
      throw new Error(err.message || 'Failed to generate PDF');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Download generated PDF file
   */
  static async downloadPdf(id: string, filename = 'document.pdf'): Promise<void> {
    const res = await fetch(`/api/v1/hr-documents/${id}/download-pdf`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token') || 'demo_token'}` },
    });
    if (!res.ok) throw new Error('Failed to download PDF');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // ===========================================================================
  // MULTI-DOCUMENT AI SUITE & HRMS INTEGRATION API METHODS
  // ===========================================================================

  /**
   * Extract parameters from unstructured text or structured HRMS JSON
   */
  static async extractWithAi(
    documentTypeCode: DocumentTypeCode,
    sourceText: string
  ): Promise<{
    extractedFields: Record<string, any>;
    missingFields: string[];
    overallConfidenceScore: number;
    warnings: string[];
  }> {
    const res = await fetch('/api/v1/document-ai/extract', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ documentTypeCode, sourceText }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'AI Extraction failed' }));
      throw new Error(err.message || 'AI Extraction failed');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Generate wording proposal for a task
   */
  static async generateWordingWithAi(
    documentTypeCode: DocumentTypeCode,
    taskCode: string,
    instruction?: string,
    context?: Record<string, any>
  ): Promise<{
    title: string;
    content: string;
    keyPoints?: string[];
    guardrailNotice: string;
  }> {
    const res = await fetch('/api/v1/document-ai/generate-wording', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ documentTypeCode, taskCode, instruction, context }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'AI Generation failed' }));
      throw new Error(err.message || 'AI Generation failed');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Improve phrasing, formal tone, and grammar
   */
  static async improveWordingWithAi(
    documentTypeCode: DocumentTypeCode,
    text: string,
    goal: 'formal' | 'concise' | 'legal' | 'grammar',
    instruction?: string
  ): Promise<{
    originalText: string;
    improvedText: string;
    goal: string;
    guardrailNotice: string;
  }> {
    const res = await fetch('/api/v1/document-ai/improve-wording', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ documentTypeCode, text, goal, instruction }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'AI Improvement failed' }));
      throw new Error(err.message || 'AI Improvement failed');
    }
    const json = await res.json();
    return json.data;
  }

  /**
   * Suggest missing information and clarification prompts
   */
  static async suggestMissingInfoWithAi(
    documentTypeCode: DocumentTypeCode,
    currentData: Record<string, any>
  ): Promise<any[]> {
    const res = await fetch('/api/v1/document-ai/suggest-missing-info', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ documentTypeCode, currentData }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  }

  /**
   * Run 7-category quality check
   */
  static async runQualityCheckWithAi(
    documentTypeCode: DocumentTypeCode,
    data: Record<string, any>
  ): Promise<any> {
    const res = await fetch('/api/v1/document-ai/quality-check', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ documentTypeCode, data }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Quality check failed' }));
      throw new Error(err.message || 'Quality check failed');
    }
    const json = await res.json();
    return json.data;
  }
}
