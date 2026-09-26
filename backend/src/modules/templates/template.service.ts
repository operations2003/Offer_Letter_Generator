import { prisma } from '../../prisma/client.js';
import { NotFoundError, BadRequestError } from '../../errors/app-error.js';
import { PlaceholderManager, STANDARD_PLACEHOLDERS } from './placeholders.catalog.js';
import { AuditService } from '../audit/audit.service.js';
import { AiService } from '../ai/ai.service.js';
import { TemplateCategory } from '@prisma/client';

export interface CreateTemplateInput {
  title: string;
  description?: string;
  category?: TemplateCategory;
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

export class TemplateService {
  /**
   * Retrieves the catalog of standard system placeholders
   */
  static getPlaceholdersCatalog() {
    return {
      standardPlaceholders: STANDARD_PLACEHOLDERS,
      total: STANDARD_PLACEHOLDERS.length,
      syntaxGuide: 'Use double curly braces syntax: {{placeholder_name}}',
    };
  }

  /**
   * Creates a new offer template and mints its initial immutable Version 1
   */
  static async createTemplate(companyId: string, userId: string, input: CreateTemplateInput) {
    // 1. Detect placeholders in provided markup
    const detectedPlaceholders = PlaceholderManager.extractPlaceholders(input.contentMarkup);
    const placeholdersToStore = input.placeholdersSchema && input.placeholdersSchema.length > 0
      ? Array.from(new Set([...detectedPlaceholders, ...input.placeholdersSchema]))
      : detectedPlaceholders;

    // 2. Transaction: Create template + version 1
    const result = await prisma.$transaction(async (tx) => {
      const template = await tx.offerTemplate.create({
        data: {
          companyId,
          title: input.title,
          description: input.description,
          category: input.category || 'FULL_TIME',
          isActive: true,
          createdBy: userId,
        },
      });

      const version = await tx.templateVersion.create({
        data: {
          templateId: template.id,
          versionNumber: 1,
          contentMarkup: input.contentMarkup,
          headerMarkup: input.headerMarkup,
          footerMarkup: input.footerMarkup,
          styleCss: input.styleCss,
          placeholdersSchema: placeholdersToStore,
          changeSummary: 'Initial version created',
          isPublished: true,
          createdBy: userId,
        },
      });

      const updatedTemplate = await tx.offerTemplate.update({
        where: { id: template.id },
        data: { currentVersionId: version.id },
        include: {
          currentVersion: true,
        },
      });

      return { template: updatedTemplate, version };
    });

    // 3. Audit trail
    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'OfferTemplate',
      entityId: result.template.id,
      action: 'CREATE',
      actionDescription: `Created offer letter template "${result.template.title}" (v1)`,
      newState: {
        title: result.template.title,
        version: 1,
        placeholdersDetected: detectedPlaceholders,
      },
    });

    return result.template;
  }

  /**
   * Lists templates for a company with filters and pagination
   */
  static async getTemplates(
    companyId: string,
    filters?: { category?: TemplateCategory; isActive?: boolean; search?: string }
  ) {
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (typeof filters?.isActive === 'boolean') {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const templates = await prisma.offerTemplate.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        currentVersion: true,
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: {
          select: { versions: true },
        },
      },
    });

    return templates;
  }

  /**
   * Retrieves single template with active version
   */
  static async getTemplateById(companyId: string, templateId: string) {
    const template = await prisma.offerTemplate.findFirst({
      where: { id: templateId, companyId, deletedAt: null },
      include: {
        currentVersion: true,
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          select: {
            id: true,
            versionNumber: true,
            changeSummary: true,
            isPublished: true,
            createdAt: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundError('Offer Template');
    }

    return template;
  }

  /**
   * Updates an offer template. If content markup is modified, automatically increments immutable version.
   */
  static async updateTemplate(
    companyId: string,
    userId: string,
    templateId: string,
    input: UpdateTemplateInput
  ) {
    const existing = await prisma.offerTemplate.findFirst({
      where: { id: templateId, companyId, deletedAt: null },
      include: { currentVersion: true },
    });

    if (!existing) {
      throw new NotFoundError('Offer Template');
    }

    const isMarkupChanged =
      input.contentMarkup !== undefined ||
      input.headerMarkup !== undefined ||
      input.footerMarkup !== undefined ||
      input.styleCss !== undefined;

    const result = await prisma.$transaction(async (tx) => {
      let newVersionId = existing.currentVersionId;

      if (isMarkupChanged) {
        // Query the highest existing version number
        const latestVersion = await tx.templateVersion.findFirst({
          where: { templateId: existing.id },
          orderBy: { versionNumber: 'desc' },
        });

        const nextVersionNumber = (latestVersion?.versionNumber || 0) + 1;
        const effectiveMarkup = input.contentMarkup ?? existing.currentVersion?.contentMarkup ?? '';
        const detectedPlaceholders = PlaceholderManager.extractPlaceholders(effectiveMarkup);

        const newVersion = await tx.templateVersion.create({
          data: {
            templateId: existing.id,
            versionNumber: nextVersionNumber,
            contentMarkup: effectiveMarkup,
            headerMarkup: input.headerMarkup ?? existing.currentVersion?.headerMarkup,
            footerMarkup: input.footerMarkup ?? existing.currentVersion?.footerMarkup,
            styleCss: input.styleCss ?? existing.currentVersion?.styleCss,
            placeholdersSchema: detectedPlaceholders,
            changeSummary: input.changeSummary || `Version ${nextVersionNumber} revision`,
            isPublished: true,
            createdBy: userId,
          },
        });

        newVersionId = newVersion.id;
      }

      const updated = await tx.offerTemplate.update({
        where: { id: existing.id },
        data: {
          title: input.title ?? existing.title,
          description: input.description !== undefined ? input.description : existing.description,
          category: input.category ?? existing.category,
          currentVersionId: newVersionId,
        },
        include: { currentVersion: true },
      });

      return updated;
    });

    // Audit log
    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'OfferTemplate',
      entityId: templateId,
      action: 'UPDATE',
      actionDescription: isMarkupChanged
        ? `Updated template "${result.title}" and published new version (v${result.currentVersion?.versionNumber})`
        : `Updated template metadata for "${result.title}"`,
      newState: {
        title: result.title,
        version: result.currentVersion?.versionNumber,
        isMarkupChanged,
      },
    });

    return result;
  }

  /**
   * Duplicates an existing template along with its active version content
   */
  static async duplicateTemplate(
    companyId: string,
    userId: string,
    templateId: string,
    newTitle?: string
  ) {
    const original = await prisma.offerTemplate.findFirst({
      where: { id: templateId, companyId, deletedAt: null },
      include: { currentVersion: true },
    });

    if (!original) {
      throw new NotFoundError('Offer Template to duplicate');
    }

    const titleToUse = newTitle?.trim() || `Copy of ${original.title}`;

    const duplicated = await this.createTemplate(companyId, userId, {
      title: titleToUse,
      description: original.description ? `Cloned from ${original.title}. ${original.description}` : undefined,
      category: original.category,
      contentMarkup: original.currentVersion?.contentMarkup || '',
      headerMarkup: original.currentVersion?.headerMarkup || undefined,
      footerMarkup: original.currentVersion?.footerMarkup || undefined,
      styleCss: original.currentVersion?.styleCss || undefined,
      placeholdersSchema: (original.currentVersion?.placeholdersSchema as string[]) || undefined,
    });

    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'OfferTemplate',
      entityId: duplicated.id,
      action: 'CREATE',
      actionDescription: `Duplicated template from "${original.title}" into new template "${duplicated.title}"`,
      newState: { originalTemplateId: templateId, newTemplateId: duplicated.id },
    });

    return duplicated;
  }

  /**
   * Activates or deactivates a template
   */
  static async toggleActive(
    companyId: string,
    userId: string,
    templateId: string,
    isActive: boolean
  ) {
    const existing = await prisma.offerTemplate.findFirst({
      where: { id: templateId, companyId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Offer Template');
    }

    const updated = await prisma.offerTemplate.update({
      where: { id: templateId },
      data: { isActive },
      include: { currentVersion: true },
    });

    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'OfferTemplate',
      entityId: templateId,
      action: 'UPDATE',
      actionDescription: `Template "${updated.title}" ${isActive ? 'activated' : 'deactivated'}`,
      newState: { isActive },
    });

    return updated;
  }

  /**
   * Retrieves version history for a template
   */
  static async getVersionHistory(companyId: string, templateId: string) {
    const template = await prisma.offerTemplate.findFirst({
      where: { id: templateId, companyId, deletedAt: null },
    });

    if (!template) {
      throw new NotFoundError('Offer Template');
    }

    const versions = await prisma.templateVersion.findMany({
      where: { templateId },
      orderBy: { versionNumber: 'desc' },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return {
      templateId,
      currentVersionId: template.currentVersionId,
      versions,
    };
  }

  /**
   * Promotes an older version to current active version
   */
  static async publishVersion(
    companyId: string,
    userId: string,
    templateId: string,
    versionNumber: number
  ) {
    const template = await prisma.offerTemplate.findFirst({
      where: { id: templateId, companyId, deletedAt: null },
    });

    if (!template) {
      throw new NotFoundError('Offer Template');
    }

    const targetVersion = await prisma.templateVersion.findFirst({
      where: { templateId, versionNumber },
    });

    if (!targetVersion) {
      throw new NotFoundError(`Template Version ${versionNumber}`);
    }

    const updated = await prisma.offerTemplate.update({
      where: { id: templateId },
      data: { currentVersionId: targetVersion.id },
      include: { currentVersion: true },
    });

    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'OfferTemplate',
      entityId: templateId,
      action: 'UPDATE',
      actionDescription: `Rollback/Published version ${versionNumber} as active version for template "${updated.title}"`,
      newState: { currentVersionId: targetVersion.id, versionNumber },
    });

    return updated;
  }

  /**
   * AI Placeholder Detection & Template Improvement Suggestions
   * CRITICAL RULE: AI must suggest changes, NOT automatically modify templates.
   */
  static async aiDetectPlaceholders(contentMarkup: string) {
    if (!contentMarkup || contentMarkup.trim().length < 10) {
      throw new BadRequestError('Content markup must be at least 10 characters long.');
    }

    // Identify already present placeholders
    const existingPlaceholders = PlaceholderManager.extractPlaceholders(contentMarkup);

    // AI Prompt specifically instructing suggestions without autonomous modification
    const systemPrompt = `You are an AI Template Drafting Assistant for an HR Offer Letter System.
TASK: DETECT_HARDCODED_VALUES_AND_SUGGEST_PLACEHOLDERS

YOUR NON-NEGOTIABLE RULE:
You MUST SUGGEST changes as advisory items. You MUST NEVER assume authority to automatically modify the template. A human HR professional must review, accept, or reject each suggestion.

Standard System Placeholders supported:
- {{candidate_name}}: Full name of candidate
- {{designation}}: Job Title or Role
- {{department}}: Department name
- {{location}}: Work location/office
- {{joining_date}}: Starting date of employment
- {{employment_type}}: Full-time, contract, part-time
- {{salary}}: Base salary or CTC amount
- {{probation_period}}: Probation length (e.g. 90 days)
- {{notice_period}}: Notice period duration
- {{reporting_manager}}: Immediate supervisor name/title
- {{working_hours}}: Work hours per week

Analysis Objectives:
1. Scan the text for hardcoded names, titles, dollar values, dates, durations, or office locations that should be dynamic placeholders.
2. Check for missing standard placeholders.
3. Provide an advisory preview of the suggested template with placeholders substituted.

Output JSON Format:
{
  "suggestions": [
    {
      "originalSnippet": string,
      "suggestedToken": string,
      "rationale": string,
      "confidenceScore": number
    }
  ],
  "missingStandardPlaceholders": string[],
  "improvedMarkupPreview": string,
  "summary": string
}`;

    const userPrompt = `Analyze the following offer letter template draft and suggest placeholders for any hardcoded or missing values:

<draft_template_content>
${contentMarkup}
</draft_template_content>

Remember: Respond strictly with the valid advisory JSON object.`;

    // Execute via AI Service
    let aiSuggestions: any;
    try {
      const completion = await (AiService as any).executeWithRetry({
        systemPrompt,
        userPrompt,
        jsonMode: true,
        temperature: 0.1,
      });

      aiSuggestions = JSON.parse(completion.rawContent);
    } catch {
      // Heuristic fallback for offline / mock testing
      aiSuggestions = this.simulatePlaceholderSuggestions(contentMarkup);
    }

    return {
      advisoryMode: 'HUMAN_IN_THE_LOOP',
      warning: 'AI suggests changes only; templates are not automatically modified.',
      existingPlaceholders,
      suggestions: aiSuggestions.suggestions || [],
      missingStandardPlaceholders: aiSuggestions.missingStandardPlaceholders || [],
      improvedMarkupPreview: aiSuggestions.improvedMarkupPreview || contentMarkup,
      summary: aiSuggestions.summary || 'AI identified placeholders for candidate dynamic terms.',
    };
  }

  /**
   * Fallback heuristic placeholder detection for offline testing
   */
  private static simulatePlaceholderSuggestions(text: string) {
    const suggestions: Array<{
      originalSnippet: string;
      suggestedToken: string;
      rationale: string;
      confidenceScore: number;
    }> = [];

    let preview = text;

    // Detect hardcoded names
    const nameMatch = text.match(/(?:Dear\s+)?([A-Z][a-z]+\s+[A-Z][a-z]+)/);
    if (nameMatch && !text.includes('{{candidate_name}}')) {
      suggestions.push({
        originalSnippet: nameMatch[1],
        suggestedToken: '{{candidate_name}}',
        rationale: 'Hardcoded candidate name detected. Replace with dynamic candidate name token.',
        confidenceScore: 0.95,
      });
      preview = preview.replace(nameMatch[1], '{{candidate_name}}');
    }

    // Detect hardcoded salaries
    const salaryMatch = text.match(/\$\s*(\d{2,3}(?:,\d{3})+|\d{5,7})(?:\s*USD)?/i);
    if (salaryMatch && !text.includes('{{salary}}')) {
      suggestions.push({
        originalSnippet: salaryMatch[0],
        suggestedToken: '{{salary}}',
        rationale: 'Hardcoded salary amount detected. Replace with dynamic salary token.',
        confidenceScore: 0.94,
      });
      preview = preview.replace(salaryMatch[0], '{{salary}}');
    }

    // Detect hardcoded roles
    const roleMatch = text.match(/(?:role of|position of|as an?)\s+([A-Z][A-Za-z\s]+?)(?:,|\.|\s+in)/i);
    if (roleMatch && !text.includes('{{designation}}')) {
      suggestions.push({
        originalSnippet: roleMatch[1].trim(),
        suggestedToken: '{{designation}}',
        rationale: 'Hardcoded job title detected.',
        confidenceScore: 0.91,
      });
      preview = preview.replace(roleMatch[1].trim(), '{{designation}}');
    }

    // Detect hardcoded probation periods
    const probMatch = text.match(/(?:probation period of|probationary period of)\s+(\d+\s+(?:days|months|weeks))/i);
    if (probMatch && !text.includes('{{probation_period}}')) {
      suggestions.push({
        originalSnippet: probMatch[1],
        suggestedToken: '{{probation_period}}',
        rationale: 'Hardcoded probation duration detected.',
        confidenceScore: 0.92,
      });
      preview = preview.replace(probMatch[1], '{{probation_period}}');
    }

    // Detect hardcoded notice periods
    const noticeMatch = text.match(/(?:notice period of)\s+(\d+\s+(?:days|months|weeks))/i);
    if (noticeMatch && !text.includes('{{notice_period}}')) {
      suggestions.push({
        originalSnippet: noticeMatch[1],
        suggestedToken: '{{notice_period}}',
        rationale: 'Hardcoded notice period detected.',
        confidenceScore: 0.92,
      });
      preview = preview.replace(noticeMatch[1], '{{notice_period}}');
    }

    // Missing standard tokens
    const standardTokens = [
      '{{candidate_name}}',
      '{{designation}}',
      '{{department}}',
      '{{location}}',
      '{{joining_date}}',
      '{{employment_type}}',
      '{{salary}}',
      '{{probation_period}}',
      '{{notice_period}}',
      '{{reporting_manager}}',
      '{{working_hours}}',
    ];

    const missingStandardPlaceholders = standardTokens.filter(
      (token) => !preview.includes(token)
    );

    return {
      suggestions,
      missingStandardPlaceholders,
      improvedMarkupPreview: preview,
      summary: `Found ${suggestions.length} potential hardcoded value(s) to convert into standard placeholders.`,
    };
  }
}
