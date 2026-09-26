export type TemplateCategory =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'EXECUTIVE'
  | 'CONSULTANT';

export interface PlaceholderDefinition {
  key: string;
  token: string;
  label: string;
  category: 'candidate' | 'role' | 'compensation' | 'terms' | 'company' | 'custom';
  description: string;
  exampleValue: string;
  required?: boolean;
}

export interface PlaceholderValidationResult {
  found: string[];
  valid: string[];
  unknown: string[];
  missingRequired: string[];
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  versionNumber: number;
  contentMarkup: string;
  headerMarkup?: string | null;
  footerMarkup?: string | null;
  styleCss?: string | null;
  placeholdersSchema: string[];
  changeSummary?: string | null;
  isPublished: boolean;
  createdBy?: string;
  creator?: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

export interface OfferTemplate {
  id: string;
  companyId: string;
  title: string;
  description?: string | null;
  category: TemplateCategory;
  isActive: boolean;
  currentVersionId?: string | null;
  currentVersion?: TemplateVersion | null;
  versions?: TemplateVersion[];
  _count?: {
    versions: number;
  };
  createdBy: string;
  creator?: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  title: string;
  description?: string;
  category: TemplateCategory;
  contentMarkup: string;
  headerMarkup?: string;
  footerMarkup?: string;
  styleCss?: string;
  placeholdersSchema?: string[];
}

export interface UpdateTemplateInput {
  title?: string;
  description?: string;
  category?: TemplateCategory;
  contentMarkup?: string;
  headerMarkup?: string;
  footerMarkup?: string;
  styleCss?: string;
  placeholdersSchema?: string[];
  changeSummary?: string;
}

export interface AiPlaceholderSuggestion {
  originalSnippet: string;
  suggestedToken: string;
  rationale: string;
  confidenceScore: number;
}

export interface AiPlaceholderResult {
  suggestions: AiPlaceholderSuggestion[];
  missingStandardPlaceholders: string[];
  improvedMarkupPreview: string;
  summary: string;
}

export type AiWordingTone = 'formal' | 'warm' | 'firm_legal' | 'concise';

export interface AiWordingSuggestion {
  originalClause?: string;
  suggestedClause: string;
  tone: AiWordingTone;
  rationale: string;
  complianceNotes?: string;
}
