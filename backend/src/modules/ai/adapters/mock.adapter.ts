import { IAiProviderAdapter } from './ai-provider.interface.js';
import { AiCompletionRequest, AiCompletionResponse } from '../types.js';

export class MockAiAdapter implements IAiProviderAdapter {
  public readonly providerId = 'MOCK';
  public readonly displayName = 'Mock AI Engine (Offline Sandbox)';

  async complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    const startTime = Date.now();

    // Simulate minor processing latency (80ms - 250ms)
    await new Promise((r) => setTimeout(r, 120));

    let generatedJson: Record<string, unknown>;

    if (request.systemPrompt.includes('CANDIDATE_DATA_EXTRACTION')) {
      generatedJson = this.simulateCandidateExtraction(request.userPrompt);
    } else if (request.systemPrompt.includes('POLICY_COMPLIANCE_CHECK')) {
      generatedJson = this.simulatePolicyCheck();
    } else if (request.systemPrompt.includes('SALARY_BENCHMARK_CHECK')) {
      generatedJson = this.simulateSalaryBenchmark();
    } else {
      generatedJson = {
        clauseTitle: 'Standard Non-Disclosure & Restrictive Covenants',
        clauseText:
          'The employee agrees that during the term of employment and for a period of twelve (12) months following termination, they shall not directly or indirectly engage in competitive activities or disclose confidential trade secrets.',
        governingConsiderations:
          'Conforms to state and federal restrictive covenant enforceability guidelines.',
      };
    }

    const rawContent = JSON.stringify(generatedJson, null, 2);

    return {
      rawContent,
      modelName: 'mock-llama-3.3-offline',
      providerName: this.providerId,
      promptTokens: 350,
      completionTokens: 280,
      latencyMs: Date.now() - startTime,
    };
  }

  async healthCheck(): Promise<{ ok: boolean; message: string }> {
    return { ok: true, message: 'Mock AI Adapter is ready (Offline mode)' };
  }

  private simulateCandidateExtraction(text: string): Record<string, unknown> {
    // Intelligent heuristic extraction from input text
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const salaryMatch = text.match(/\$?\s*(\d{2,3}(?:,\d{3})+|\d{5,7})/);

    const email = emailMatch ? emailMatch[0] : 'jane.doe@example.com';
    const phone = phoneMatch ? phoneMatch[0] : '+1 (555) 349-2041';
    const baseSalary = salaryMatch ? parseInt(salaryMatch[1].replace(/,/g, ''), 10) : 145000;
    const hra = Math.round(baseSalary * 0.2);
    const bonus = Math.round(baseSalary * 0.15);
    const totalCtc = baseSalary + hra + bonus;

    return {
      candidateName: {
        value: 'Jane Doe',
        confidenceScore: 0.95,
        sourceSnippet: 'Jane Doe - Senior Full Stack Engineer',
      },
      email: {
        value: email,
        confidenceScore: emailMatch ? 0.98 : 0.75,
        sourceSnippet: emailMatch ? emailMatch[0] : 'Inferred contact detail',
      },
      phone: {
        value: phone,
        confidenceScore: phoneMatch ? 0.94 : 0.7,
        sourceSnippet: phoneMatch ? phoneMatch[0] : 'Inferred phone number',
      },
      currentEmployer: {
        value: 'Stripe Technologies Inc.',
        confidenceScore: 0.91,
        sourceSnippet: 'Senior Full Stack Engineer at Stripe Technologies Inc.',
      },
      currentTitle: {
        value: 'Senior Full Stack Engineer',
        confidenceScore: 0.93,
        sourceSnippet: 'Senior Full Stack Engineer (2021 - Present)',
      },
      offeredRole: {
        value: 'Lead Platform Architect',
        confidenceScore: 0.89,
        sourceSnippet: 'Target role: Lead Platform Architect',
      },
      department: {
        value: 'Engineering',
        confidenceScore: 0.92,
        sourceSnippet: 'Core Infrastructure & Engineering',
      },
      experienceYears: {
        value: 7.5,
        confidenceScore: 0.88,
        sourceSnippet: '7+ years of software development experience',
      },
      proposedJoiningDate: {
        value: '2026-11-01',
        confidenceScore: 0.85,
        sourceSnippet: 'Earliest start date: First week of November 2026',
      },
      currency: {
        value: 'USD',
        confidenceScore: 0.99,
        sourceSnippet: 'Compensation figures in USD',
      },
      baseSalary: {
        value: baseSalary,
        confidenceScore: 0.92,
        sourceSnippet: `Base compensation offered: $${baseSalary.toLocaleString()}`,
      },
      hraAllowance: {
        value: hra,
        confidenceScore: 0.88,
        sourceSnippet: 'Standard housing assistance component',
      },
      specialAllowances: {
        value: 12000,
        confidenceScore: 0.85,
        sourceSnippet: 'Work from home and wellness stipend',
      },
      performanceBonus: {
        value: bonus,
        confidenceScore: 0.87,
        sourceSnippet: '15% annual target performance bonus',
      },
      joiningBonus: {
        value: 10000,
        confidenceScore: 0.9,
        sourceSnippet: 'Sign-on bonus payable upon 30 days completed service',
      },
      totalCtc: {
        value: totalCtc + 12000 + 10000,
        confidenceScore: 0.94,
        sourceSnippet: 'Total comprehensive annual package',
      },
      warnings: [],
    };
  }

  private simulatePolicyCheck(): Record<string, unknown> {
    return {
      isCompliant: true,
      overallRiskLevel: 'LOW',
      findings: [
        {
          ruleName: 'Probation Period Alignment',
          isViolated: false,
          severity: 'INFO',
          detail: 'Proposed probation period of 90 days aligns with company standard.',
        },
        {
          ruleName: 'Notice Period Standard',
          isViolated: false,
          severity: 'INFO',
          detail: 'Notice period of 30 days conforms to jurisdictional guidelines.',
        },
      ],
    };
  }

  private simulateSalaryBenchmark(): Record<string, unknown> {
    return {
      marketPercentile: 72,
      recommendedRange: {
        min: 130000,
        median: 145000,
        max: 165000,
        currency: 'USD',
      },
      evaluationSummary: 'Proposed compensation sits at the 72nd percentile for Senior Level in North America.',
      isWithinBudget: true,
    };
  }
}
