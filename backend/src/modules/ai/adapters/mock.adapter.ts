import { IAiProviderAdapter } from './ai-provider.interface.js';
import { AiCompletionRequest, AiCompletionResponse } from '../types.js';

export class MockAiAdapter implements IAiProviderAdapter {
  public readonly providerId = 'MOCK';
  public readonly displayName = 'Mock AI Engine (Offline Sandbox)';

  async complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    const startTime = Date.now();

    // Simulate minor processing latency (80ms - 250ms)
    await new Promise((r) => setTimeout(r, 100));

    let generatedJson: Record<string, unknown>;

    if (request.systemPrompt.includes('CANDIDATE_DATA_EXTRACTION')) {
      generatedJson = this.simulateCandidateExtraction(request.userPrompt);
    } else if (request.systemPrompt.includes('POLICY_COMPLIANCE_CHECK')) {
      generatedJson = this.simulatePolicyCheck();
    } else if (request.systemPrompt.includes('SALARY_BENCHMARK_CHECK')) {
      generatedJson = this.simulateSalaryBenchmark();
    } else if (request.systemPrompt.includes('OFFER_SUGGESTIONS')) {
      generatedJson = this.simulateOfferSuggestions(request.userPrompt);
    } else if (request.systemPrompt.includes('OFFER_QUALITY_CHECK')) {
      generatedJson = this.simulateOfferQualityCheck(request.userPrompt);
    } else {
      generatedJson = this.simulateClauseDrafting(request.userPrompt);
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

  private simulateOfferSuggestions(userPrompt: string): Record<string, unknown> {
    return {
      summary:
        'AI Advisory Suggestions: Wording enhancements and recommended clauses. Note: Sensitive fields (CTC, probation, notice period) are locked and require human decision.',
      isAdvisoryOnly: true,
      sensitiveFieldsLocked: true,
      suggestions: [
        {
          id: 'sug-welcome-01',
          category: 'WELCOME_WORDING',
          title: 'Executive Welcome & Culture Alignment',
          suggestedWording:
            'We are thrilled to welcome you to our growing engineering leadership team. Your track record of architectural excellence and collaborative leadership will play a vital role in shaping our next-generation cloud infrastructure.',
          rationale: 'Elevates opening paragraph to resonate with senior engineering leadership profile.',
          requiresHumanConfirmation: true,
        },
        {
          id: 'sug-perks-02',
          category: 'ROLE_PERKS',
          title: 'Remote Collaboration & Ergonomic Setup',
          suggestedWording:
            'Employees participating in our hybrid arrangement are eligible for a one-time ergonomic home office allowance and monthly high-speed internet reimbursement in accordance with company policy.',
          rationale: 'Enhances candidate experience and sets clear expectations for hybrid collaboration.',
          requiresHumanConfirmation: true,
        },
        {
          id: 'sug-clause-03',
          category: 'CLAUSE_RECOMMENDATION',
          title: 'Intellectual Property and Inventions Covenant',
          suggestedWording:
            'All discoveries, software routines, architectures, and intellectual assets developed during your employment shall remain the exclusive proprietary property of the company.',
          rationale: 'Standard legal protection clause recommended for all technical and managerial appointments.',
          requiresHumanConfirmation: true,
        },
        {
          id: 'sug-clause-04',
          category: 'CLAUSE_RECOMMENDATION',
          title: 'Confidentiality and Trade Secrets Non-Disclosure',
          suggestedWording:
            'The employee covenants to hold in the strictest confidence all non-public technical blueprints, client rosters, and financial models during and after employment.',
          rationale: 'Ensures confidentiality standards meet enterprise compliance guidelines.',
          requiresHumanConfirmation: true,
        },
      ],
    };
  }

  private simulateOfferQualityCheck(userPrompt: string): Record<string, unknown> {
    let breakdownSum = 0;
    let statedCtc = 0;
    try {
      const data = JSON.parse(userPrompt.replace(/^Offer Data to audit:\s*/, ''));
      const base = Number(data.baseSalary || 0);
      const hra = Number(data.hraAllowance || 0);
      const special = Number(data.specialAllowances || 0);
      const perf = Number(data.performanceBonus || 0);
      const join = Number(data.joiningBonus || 0);
      breakdownSum = base + hra + special + perf + join;
      statedCtc = Number(data.totalCtc || breakdownSum);
    } catch {
      breakdownSum = 167000;
      statedCtc = 167000;
    }

    const discrepancy = Math.abs(breakdownSum - statedCtc);
    const isMathConsistent = discrepancy < 1.0;

    return {
      overallQualityScore: isMathConsistent ? 94 : 76,
      isReadyForIssuance: isMathConsistent,
      readabilityScore: 'HIGH',
      completenessScore: 95,
      compensationCheck: {
        isMathConsistent,
        breakdownSum,
        statedTotalCtc: statedCtc,
        discrepancy,
      },
      criticalIssues: isMathConsistent ? [] : ['Compensation breakdown sum does not match stated Total CTC'],
      warnings: [
        'Ensure candidate has acknowledged receipt of background verification disclosure',
      ],
      recommendations: [
        'Consider reiterating reporting line expectations during verbal pre-close discussion',
        'Verify offer acceptance window leaves candidate at least 7 calendar days to decide',
      ],
      sensitiveFieldsAudit: {
        isHumanConfirmed: true,
        details: 'Compensation, probation duration, and notice period have HR-confirmed status and were not independently decided by AI.',
      },
    };
  }

  private simulateClauseDrafting(userPrompt: string): Record<string, unknown> {
    return {
      clauseTitle: 'Confidentiality, Intellectual Property & Non-Solicitation',
      clauseText:
        'The Employee acknowledges that during their employment they will have access to confidential company intellectual property and business methodologies. The Employee agrees not to disclose such proprietary information to unauthorized third parties and agrees that all inventions created in connection with company duties belong solely to the Employer.',
      keyPoints: [
        'Defines proprietary company information and trade secrets',
        'Assigns ownership of newly created work products to the company',
        'Prohibits unauthorized sharing or post-employment solicitation',
      ],
      governingConsiderations:
        'Strictly drafted for jurisdictional enforceability. HR/Legal should confirm specific state or country restrictive covenant guidelines before issuance.',
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
          detail: 'Proposed probation period conforms to organizational policy.',
        },
        {
          ruleName: 'Notice Period Standard',
          isViolated: false,
          severity: 'INFO',
          detail: 'Notice period conforms to standard employment terms.',
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
