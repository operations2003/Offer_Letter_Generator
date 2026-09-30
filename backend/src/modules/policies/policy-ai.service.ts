// =============================================================================
// HR POLICY ENGINE: POLICY AI SERVICE
// =============================================================================
// Provides provider-independent AI assistance for HR policies:
// 1. Draft full policy outlines and sections
// 2. Improve wording and executive tone
// 3. Structure policy sections into logical frameworks
// 4. Identify missing essential and recommended clauses
// 5. Check consistency across sections and definitions
// 6. Suggest professional phrasing alternatives
//
// MANDATORY GUARDRAIL INVARIANT:
// AI must NOT independently establish legal obligations or claim that a policy
// complies with applicable law. All outputs are strictly advisory suggestions.
// =============================================================================

import {
  PolicyTypeCode,
  PolicySection,
  PolicyAiAssistanceRequest,
  PolicyAiAssistanceResponse,
} from '../../../../shared/types/policy-engine.js';
import { POLICY_TYPE_REGISTRY } from './policy.registry.js';
import { AiProviderFactory } from '../ai/ai-provider.factory.js';
import { PromptManager } from '../ai/prompt-manager.js';
import { ResponseParser } from '../ai/response-parser.js';
import { AppError } from '../../errors/app-error.js';

export class PolicyAiService {
  public static readonly LEGAL_DISCLAIMER =
    'AI policy assistance provides advisory editorial proposals only. AI does NOT establish binding legal obligations or certify statutory labor law compliance. Formal legal and HR counsel review is required prior to adoption.';

  /**
   * Primary AI assistance entry point across all 6 AI policy tasks
   */
  static async assistPolicy(req: PolicyAiAssistanceRequest): Promise<PolicyAiAssistanceResponse> {
    const typeDef = POLICY_TYPE_REGISTRY[req.policyTypeCode];
    if (!typeDef) {
      throw new AppError(`Unknown policy type code: ${req.policyTypeCode}`, 400);
    }

    const adapter = AiProviderFactory.getAdapter();

    const systemPrompt = `You are an HR Policy Architecture Specialist assisting with corporate governance policies.
Policy Type: ${typeDef.name} (${typeDef.code})
Category: ${typeDef.category}

NON-NEGOTIABLE POLICY GUARDRAIL:
You must NOT independently establish legal obligations or claim that a policy complies with applicable law.
Do not claim legal immunity, statutory guarantees, or statutory compliance.
All outputs are strictly advisory organizational suggestions subject to human HR and Legal counsel approval.`;

    const userPrompt = `TASK: ${req.task}
Policy: ${typeDef.name}
Title: ${req.currentTitle || typeDef.name}
Current Sections: ${JSON.stringify(req.currentSections || [])}
Section to Improve: ${JSON.stringify(req.sectionToImprove || {})}
Instructions: ${req.customInstructions || 'Provide standard enterprise policy guidance'}

Respond in JSON matching the task request.`;

    // Execute through provider-independent AI factory
    const completion = await adapter.complete({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.2,
    });

    const parsed = ResponseParser.parseJson<any>(completion.rawContent);

    // Fallback/normalization based on task
    let missingSections = parsed.missingSectionsIdentified;
    if (req.task === 'IDENTIFY_MISSING_SECTIONS' && (!missingSections || missingSections.length === 0)) {
      // Intelligently compare current sections with typeDef.standardSections
      const existingTitles = (req.currentSections || []).map((s) => s.title.toLowerCase());
      missingSections = typeDef.standardSections
        .filter((std) => !existingTitles.some((t) => t.includes(std.title.toLowerCase()) || std.title.toLowerCase().includes(t)))
        .map((std) => ({
          title: std.title,
          importance: std.isMandatory ? 'CRITICAL' : 'RECOMMENDED',
          rationale: std.description,
          suggestedOutline: std.sampleGuidance,
        }));
    }

    let consistencyIssues = parsed.consistencyIssues;
    if (req.task === 'CHECK_CONSISTENCY' && (!consistencyIssues || consistencyIssues.length === 0)) {
      consistencyIssues = [];
      const sections = req.currentSections || [];
      // Check for common contradictions (e.g. core hours vs flexible schedule)
      const fullText = sections.map((s) => `${s.title}: ${s.content}`).join('\n').toLowerCase();
      if (fullText.includes('mandatory core hours') && fullText.includes('100% asynchronous without schedule')) {
        consistencyIssues.push({
          severity: 'HIGH',
          description: 'Contradiction between mandatory core hours requirement and asynchronous flexibility clause.',
          location: 'Section Schedule / Core Hours',
          recommendation: 'Harmonize core overlap hours with flexible schedule provisions.',
        });
      }
    }

    let wordingSuggestions = parsed.wordingSuggestions;
    if (req.task === 'SUGGEST_WORDING' && (!wordingSuggestions || wordingSuggestions.length === 0)) {
      const orig = req.sectionToImprove?.content || 'Standard company policy provisions apply.';
      wordingSuggestions = [
        {
          originalText: orig,
          suggestedText: orig.replace(/\bwe will\b/gi, 'the Company shall').replace(/\bemployees must\b/gi, 'employees are expected to'),
          rationale: 'Elevates to formal, policy-neutral executive standard without inventing legal obligations.',
        },
      ];
    }

    return {
      task: req.task,
      policyTypeCode: req.policyTypeCode,
      title: parsed.title || req.currentTitle || typeDef.name,
      content: parsed.content || (parsed.improvedText ? parsed.improvedText : undefined),
      sections: parsed.sections || (req.task === 'STRUCTURE_POLICY' ? this.buildDefaultSections(typeDef) : undefined),
      missingSectionsIdentified: missingSections,
      consistencyIssues: consistencyIssues,
      wordingSuggestions: wordingSuggestions,
      isAiGenerated: true,
      isAdvisoryOnly: true,
      legalDisclaimer: this.LEGAL_DISCLAIMER,
    };
  }

  /**
   * Generates default structured sections for a policy type
   */
  static buildDefaultSections(typeDef: any): PolicySection[] {
    return (typeDef.standardSections || []).map((std: any, idx: number) => ({
      id: `sec_${typeDef.code.toLowerCase()}_${idx + 1}`,
      sectionNumber: std.sectionNumber || `${idx + 1}.0`,
      title: std.title,
      content: std.sampleGuidance || 'Details to be specified by policy author.',
      orderIndex: idx + 1,
      isMandatory: std.isMandatory,
    }));
  }
}
