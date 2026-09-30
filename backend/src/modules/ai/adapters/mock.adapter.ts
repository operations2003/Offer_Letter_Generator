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

    if (request.systemPrompt.includes('AI_ASSISTANT_GENERATE')) {
      generatedJson = this.simulateAssistantGenerate(request.userPrompt);
    } else if (request.systemPrompt.includes('AI_ASSISTANT_IMPROVE')) {
      generatedJson = this.simulateAssistantImprove(request.userPrompt);
    } else if (request.systemPrompt.includes('AI_ASSISTANT_REGENERATE')) {
      generatedJson = this.simulateAssistantRegenerate(request.userPrompt);
    } else if (request.systemPrompt.includes('HR Document Extraction Assistant')) {
      generatedJson = this.simulateDocumentExtraction(request.userPrompt);
    } else if (request.systemPrompt.includes('HR Policy Architecture Specialist')) {
      generatedJson = this.simulatePolicyAi(request.userPrompt);
    } else if (request.systemPrompt.includes('HR Executive Drafting Assistant')) {
      generatedJson = this.simulateDocumentDrafting(request.userPrompt);
    } else if (request.systemPrompt.includes('Precision HR Document Editor')) {
      generatedJson = this.simulateDocumentEditing(request.userPrompt);
    } else if (request.systemPrompt.includes('CANDIDATE_DATA_EXTRACTION')) {
      generatedJson = this.simulateCandidateExtraction(request.userPrompt);
    } else if (request.systemPrompt.includes('POLICY_COMPLIANCE_CHECK')) {
      generatedJson = this.simulatePolicyCheck();
    } else if (request.systemPrompt.includes('SALARY_BENCHMARK_CHECK')) {
      generatedJson = this.simulateSalaryBenchmark();
    } else if (request.systemPrompt.includes('OFFER_SUGGESTIONS')) {
      generatedJson = this.simulateOfferSuggestions(request.userPrompt);
    } else if (request.systemPrompt.includes('OFFER_QUALITY_CHECK')) {
      generatedJson = this.simulateOfferQualityCheck(request.userPrompt);
    } else if (request.systemPrompt.includes('DETECT_HARDCODED_VALUES_AND_SUGGEST_PLACEHOLDERS')) {
      generatedJson = this.simulatePlaceholderSuggestions(request.userPrompt);
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
    const missingFields: string[] = [];
    const warnings: string[] = [];

    // Helper for missing fields (ensuring AI does not assume missing info)
    const absent = (fieldName: string) => {
      missingFields.push(fieldName);
      return {
        value: null,
        confidenceScore: 0.0,
        sourceSnippet: 'Not mentioned in document',
        isDetected: false,
        validationWarning: 'Field not detected in source document. AI did not assume this value.',
      };
    };

    // 1. Candidate Name
    let candidateName;
    const nameMatch = text.match(/(?:Jane Doe|Carlos Rivera|John Smith|Alice Johnson|[A-Z][a-z]+ [A-Z][a-z]+)/);
    if (nameMatch) {
      candidateName = {
        value: nameMatch[0],
        confidenceScore: 0.96,
        sourceSnippet: nameMatch[0],
        isDetected: true,
      };
    } else {
      candidateName = absent('Name');
    }

    // 2. Email
    let email;
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      email = {
        value: emailMatch[0],
        confidenceScore: 0.98,
        sourceSnippet: emailMatch[0],
        isDetected: true,
      };
    } else {
      email = absent('Email');
    }

    // 3. Phone
    let phone;
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      phone = {
        value: phoneMatch[0],
        confidenceScore: 0.94,
        sourceSnippet: phoneMatch[0],
        isDetected: true,
      };
    } else {
      phone = absent('Phone');
    }

    // 4. Address
    let address;
    const addressMatch = text.match(/(?:\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Way|Blvd|Lane|Ln|Drive|Dr)|[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5})/i);
    if (addressMatch) {
      address = {
        value: addressMatch[0],
        confidenceScore: 0.88,
        sourceSnippet: addressMatch[0],
        isDetected: true,
      };
    } else {
      address = absent('Address');
    }

    // 5. Qualification
    let qualification;
    const qualMatch = text.match(/(?:B\.?Tech|B\.?S\.?|M\.?S\.?|Bachelor|Master|Ph\.?D|MBA|Computer Science|Engineering degree)[A-Za-z\s,]*/i);
    if (qualMatch) {
      qualification = {
        value: qualMatch[0].trim(),
        confidenceScore: 0.89,
        sourceSnippet: qualMatch[0],
        isDetected: true,
      };
    } else if (text.toLowerCase().includes('degree') || text.toLowerCase().includes('graduate')) {
      qualification = {
        value: 'Bachelor of Science / Engineering',
        confidenceScore: 0.75,
        sourceSnippet: 'Mentioned graduate degree',
        isDetected: true,
      };
    } else {
      qualification = absent('Qualification');
    }

    // 6. Experience
    let experience;
    const expMatch = text.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+exp(?:erience)?)?/i);
    if (expMatch) {
      experience = {
        value: `${expMatch[1]} years`,
        confidenceScore: 0.92,
        sourceSnippet: expMatch[0],
        isDetected: true,
      };
    } else {
      experience = absent('Experience');
    }

    // 7. Designation / Role
    let designation;
    const desigMatch = text.match(/(?:Target Role|Offered Role|Recommended for|Position|Role|Title):\s*([^\n\r,]+)/i) ||
                       text.match(/(?:Lead Platform Architect|Staff Design Systems Engineer|Senior Full Stack Engineer|Senior UI Systems Engineer|Software Engineer|Product Manager)/i);
    if (desigMatch) {
      designation = {
        value: (desigMatch[1] || desigMatch[0]).trim(),
        confidenceScore: 0.91,
        sourceSnippet: desigMatch[0],
        isDetected: true,
      };
    } else {
      designation = absent('Designation');
    }

    // 8. Department
    let department;
    const deptMatch = text.match(/department:\s*([^\n\r,]+)/i) ||
                      text.match(/(?:Engineering|Product Experience|Information Technology|Design|Marketing|Finance|Sales)/i);
    if (deptMatch) {
      department = {
        value: (deptMatch[1] || deptMatch[0]).trim(),
        confidenceScore: 0.9,
        sourceSnippet: deptMatch[0],
        isDetected: true,
      };
    } else {
      department = absent('Department');
    }

    // 9. Location
    let location;
    const locMatch = text.match(/(?:Location|Arrangement|Based in):\s*([^\n\r]+)/i) ||
                     text.match(/(?:San Francisco, CA|Austin, TX|New York, NY|Remote|Hybrid|Seattle, WA)/i);
    if (locMatch) {
      location = {
        value: (locMatch[1] || locMatch[0]).trim(),
        confidenceScore: 0.88,
        sourceSnippet: locMatch[0],
        isDetected: true,
      };
    } else {
      location = absent('Location');
    }

    // 10. Joining Date
    let joiningDate;
    const dateMatch = text.match(/(?:Joining Date|Start Date|Available Start Date):\s*([^\n\r]+)/i) ||
                      text.match(/(?:November \d+, \d{4}|December \d+, \d{4}|\d{4}-\d{2}-\d{2})/i);
    if (dateMatch) {
      joiningDate = {
        value: (dateMatch[1] || dateMatch[0]).trim(),
        confidenceScore: 0.87,
        sourceSnippet: dateMatch[0],
        isDetected: true,
      };
    } else {
      joiningDate = absent('Joining Date');
    }

    // 11. Employment Type
    let employmentType;
    const empTypeMatch = text.match(/(?:Employment Type|Type):\s*([^\n\r]+)/i) ||
                         text.match(/(?:Full-time|Full Time|Permanent|Contract|Part-time|Internship)/i);
    if (empTypeMatch) {
      employmentType = {
        value: (empTypeMatch[1] || empTypeMatch[0]).trim(),
        confidenceScore: 0.92,
        sourceSnippet: empTypeMatch[0],
        isDetected: true,
      };
    } else {
      // Must NOT assume full time if not in document
      employmentType = absent('Employment Type');
    }

    // 12. Reporting Manager
    let reportingManager;
    const managerMatch = text.match(/(?:Reporting Manager|Reports to|Reporting to|Manager):\s*([^\n\r]+)/i);
    if (managerMatch) {
      reportingManager = {
        value: managerMatch[1].trim(),
        confidenceScore: 0.86,
        sourceSnippet: managerMatch[0],
        isDetected: true,
      };
    } else {
      reportingManager = absent('Reporting Manager');
    }

    // 13. Other Relevant Details
    let otherDetails;
    const otherMatch = text.match(/(?:Notes|Notice Period|Certifications|Special Conditions):\s*([^\n\r]+)/i);
    if (otherMatch) {
      otherDetails = {
        value: otherMatch[1].trim(),
        confidenceScore: 0.82,
        sourceSnippet: otherMatch[0],
        isDetected: true,
      };
    } else {
      otherDetails = absent('Other Relevant Details');
    }

    // Compensation fields
    const salaryMatch = text.match(
      /(?:Base Salary|Base compensation(?: proposed)?|Proposed base compensation|Base):\s*\$?\s*(\d{2,3}(?:,\d{3})+|\d{5,7})/i
    );
    const baseSalaryNum = salaryMatch ? parseInt(salaryMatch[1].replace(/,/g, ''), 10) : null;
    const baseSalary = baseSalaryNum
      ? {
          value: baseSalaryNum,
          confidenceScore: 0.94,
          sourceSnippet: salaryMatch![0],
          isDetected: true,
        }
      : absent('Base Salary');

    const hraMatch = text.match(/(?:Housing Allowance|HRA):\s*\$?\s*(\d{2,3}(?:,\d{3})+|\d{4,6})/i);
    const hraNum = hraMatch ? parseInt(hraMatch[1].replace(/,/g, ''), 10) : null;
    const hraAllowance = hraNum
      ? {
          value: hraNum,
          confidenceScore: 0.9,
          sourceSnippet: hraMatch![0],
          isDetected: true,
        }
      : absent('HRA Allowance');

    const bonusMatch = text.match(/(?:Performance Bonus|Incentive):\s*\$?\s*(\d{2,3}(?:,\d{3})+|\d{4,6})/i);
    const bonusNum = bonusMatch ? parseInt(bonusMatch[1].replace(/,/g, ''), 10) : null;
    const performanceBonus = bonusNum
      ? {
          value: bonusNum,
          confidenceScore: 0.89,
          sourceSnippet: bonusMatch![0],
          isDetected: true,
        }
      : absent('Performance Bonus');

    const signonMatch = text.match(/(?:Sign-on|Joining Bonus):\s*\$?\s*(\d{2,3}(?:,\d{3})+|\d{4,6})/i);
    const signonNum = signonMatch ? parseInt(signonMatch[1].replace(/,/g, ''), 10) : null;
    const joiningBonus = signonNum
      ? {
          value: signonNum,
          confidenceScore: 0.91,
          sourceSnippet: signonMatch![0],
          isDetected: true,
        }
      : absent('Joining Bonus');

    const ctcMatch = text.match(/(?:Total CTC|Total Annual CTC):\s*\$?\s*(\d{2,3}(?:,\d{3})+|\d{5,7})/i);
    const ctcNum = ctcMatch ? parseInt(ctcMatch[1].replace(/,/g, ''), 10) : null;
    const totalCtc = ctcNum
      ? {
          value: ctcNum,
          confidenceScore: 0.95,
          sourceSnippet: ctcMatch![0],
          isDetected: true,
        }
      : absent('Total CTC');

    const detectedFieldsCount = [
      candidateName, email, phone, address, qualification, experience,
      designation, department, location, joiningDate, employmentType, reportingManager,
      otherDetails, baseSalary
    ].filter((f) => f.isDetected).length;

    const overallConfidence = detectedFieldsCount > 0 ? +(detectedFieldsCount / 14).toFixed(2) : 0.0;

    if (missingFields.length > 0) {
      warnings.push(`${missingFields.length} field(s) were not present in the document and have not been assumed by AI.`);
    }

    return {
      candidateName,
      email,
      phone,
      address,
      qualification,
      experience,
      designation,
      department,
      location,
      joiningDate,
      employmentType,
      reportingManager,
      otherDetails,
      currency: {
        value: text.includes('USD') || text.includes('$') ? 'USD' : null,
        confidenceScore: 0.95,
        sourceSnippet: '$ or USD found in document',
        isDetected: text.includes('USD') || text.includes('$'),
      },
      baseSalary,
      hraAllowance,
      specialAllowances: absent('Special Allowances'),
      performanceBonus,
      joiningBonus,
      totalCtc,
      overallConfidenceScore: overallConfidence,
      warnings,
      missingFields,
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

  private simulatePlaceholderSuggestions(text: string): Record<string, unknown> {
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

    const missingStandardPlaceholders = standardTokens.filter((token) => !preview.includes(token));

    return {
      suggestions,
      missingStandardPlaceholders,
      improvedMarkupPreview: preview,
      summary: `Found ${suggestions.length} potential hardcoded value(s) to convert into standard placeholders.`,
    };
  }

  private simulateAssistantGenerate(userPrompt: string): Record<string, unknown> {
    const isWelcome = userPrompt.includes('welcome_intro_text') || userPrompt.toLowerCase().includes('welcome');
    const isJobDesc = userPrompt.includes('job_description_wording') || userPrompt.toLowerCase().includes('job description') || userPrompt.toLowerCase().includes('responsibilities');
    const isGeneralClause = userPrompt.includes('general_clauses') || userPrompt.toLowerCase().includes('confidentiality') || userPrompt.toLowerCase().includes('at-will');
    const isCustomClause = userPrompt.includes('custom_hr_clauses') || userPrompt.toLowerCase().includes('relocation') || userPrompt.toLowerCase().includes('clawback') || userPrompt.toLowerCase().includes('stipend');

    if (isWelcome) {
      return {
        title: 'Warm Welcome & Cultural Alignment Introduction',
        content:
          'On behalf of the entire leadership and team at {{company_name}}, we are thrilled to extend this formal offer of employment to you. Your demonstrated technical background, collaborative mindset, and passion for excellence make you an ideal addition to our organization. We are excited about the lasting impact you will create, and we look forward to achieving great milestones together.',
        keyPoints: [
          'Enthusiastic organizational welcome',
          'Candidate cultural fit recognition',
          'Company mission alignment without inventing policies',
        ],
        isPolicyInvented: false,
        requiresHrReview: true,
      };
    }

    if (isJobDesc) {
      return {
        title: 'Core Role Scope & Functional Deliverables',
        content:
          'As {{designation}} within the {{department}} organization, you will lead key software architecture initiatives, mentor team members, and drive execution of critical product milestones. You will collaborate with cross-functional product, infrastructure, and leadership stakeholders to uphold operational reliability and engineering velocity. Detailed operational goals and performance metrics shall be established with your reporting manager during onboarding.',
        keyPoints: [
          'Strategic architectural leadership',
          'Cross-functional team collaboration',
          'Performance goals left to mutual HR/manager onboarding agreement',
        ],
        isPolicyInvented: false,
        requiresHrReview: true,
      };
    }

    if (isGeneralClause) {
      return {
        title: 'Standard Confidentiality & Intellectual Property Covenant',
        content:
          'The Employee acknowledges that in the course of employment, they will have access to confidential proprietary information belonging to {{company_name}}. The Employee agrees to maintain the strict confidentiality of all trade secrets and business strategies both during employment and following separation. All intellectual property, designs, code, and inventions conceived or created within the scope of duties remain the exclusive property of {{company_name}}.',
        keyPoints: [
          'Comprehensive non-disclosure obligations',
          'Assignment of inventions and work products',
          'Standard protective clauses with zero arbitrary policies added',
        ],
        isPolicyInvented: false,
        requiresHrReview: true,
      };
    }

    if (isCustomClause) {
      return {
        title: 'Custom HR Terms & Relocation/Equipment Provisioning',
        content:
          'The Company shall furnish appropriate technical hardware and workstation accessories necessary for the performance of your duties, subject to corporate IT asset security standards. Any additional expense reimbursements, travel allowances, or relocation support requested must comply with {{company_policy_name}} guidelines and require written approval from the Human Resources Department prior to disbursement.',
        keyPoints: [
          'Hardware provisioning standard',
          'Strict requirement for established HR policy compliance',
          'Explicit placeholder requiring HR verification before financial commitment',
        ],
        isPolicyInvented: false,
        requiresHrReview: true,
      };
    }

    // Default: Professional offer wording
    return {
      title: 'Professional Offer Appointment Letter Wording',
      content:
        'We are delighted to formally offer you the position of {{designation}} with {{company_name}}, reporting directly to {{reporting_manager}}. This offer represents our confidence in your talents and your future contributions to our team. Please review the detailed compensation, benefits, and employment terms set forth herein, which are subject to mutual review and approval.',
      keyPoints: [
        'Formal appointment statement',
        'Reporting hierarchy reference',
        'Placeholder integration for company terms',
      ],
      isPolicyInvented: false,
      requiresHrReview: true,
    };
  }

  private simulateAssistantImprove(userPrompt: string): Record<string, unknown> {
    const textMatch = userPrompt.match(/<text_to_improve>([\s\S]*?)<\/text_to_improve>/);
    const originalText = textMatch ? textMatch[1].trim() : 'We offer you the job position.';

    const isGrammar = userPrompt.includes('grammar') || userPrompt.includes('grammar_improvement');
    const isConcise = userPrompt.includes('concise');
    const isWarm = userPrompt.includes('warm_culture');
    const isLegal = userPrompt.includes('professional_legal');

    let improvedText = originalText;
    let changesSummary = 'Improved readability and professional tone while preserving original terms.';

    if (isGrammar) {
      // Fix common typos and polish grammar
      improvedText = originalText
        .replace(/\bteh\b/gi, 'the')
        .replace(/\brecieve\b/gi, 'receive')
        .replace(/\bseperate\b/gi, 'separate')
        .replace(/\bi\b/g, 'I')
        .replace(/\s+/g, ' ')
        .trim();
      if (!improvedText.endsWith('.')) improvedText += '.';
      changesSummary = 'Corrected grammatical syntax, spelling errors, and punctuation while strictly preserving all factual values.';
    } else if (isConcise) {
      improvedText = originalText
        .replace(/shall be entitled to receive/gi, 'receives')
        .replace(/in the event that/gi, 'if')
        .replace(/for the purpose of/gi, 'to')
        .replace(/at this point in time/gi, 'now')
        .trim();
      changesSummary = 'Streamlined phrasing to eliminate wordiness while preserving exact legal and policy meaning.';
    } else if (isWarm) {
      improvedText = `We are genuinely delighted to share this opportunity with you. ${originalText} We are enthusiastic about welcoming you aboard and partnering together for your ongoing success.`;
      changesSummary = 'Elevated warmth and positive tone to enhance candidate engagement, without adding new obligations.';
    } else if (isLegal) {
      improvedText = `${originalText} This provision shall be construed in accordance with applicable governing labor standards and {{company_name}} corporate governance policies.`;
      changesSummary = 'Enhanced contractual precision and clarity; no new company policies invented.';
    } else {
      improvedText = originalText
        .replace(/will do/gi, 'shall perform')
        .replace(/good job/gi, 'exceptional performance')
        .trim();
      changesSummary = 'Refined vocabulary and sentence cadence for professional HR standards.';
    }

    return {
      title: 'Refined & Improved Content',
      improvedText,
      changesSummary,
      isPolicyInvented: false,
      requiresHrReview: true,
    };
  }

  private simulateAssistantRegenerate(userPrompt: string): Record<string, unknown> {
    const isWelcome = userPrompt.includes('welcome_intro_text') || userPrompt.toLowerCase().includes('welcome');
    const isJobDesc = userPrompt.includes('job_description_wording');
    const isGeneralClause = userPrompt.includes('general_clauses');

    let title = 'Alternative Drafting Variation';
    let content = '';

    if (isWelcome) {
      title = 'Alternative Welcome & Culture Introduction';
      content =
        'Welcome to {{company_name}}! It is our distinct pleasure to present this offer for the position of {{designation}}. We were deeply impressed by your achievements and collaborative energy throughout the interview process. Our team is solving pivotal challenges, and we know your unique perspectives will help us reach new heights.';
    } else if (isJobDesc) {
      title = 'Alternative Job Description & Responsibilities Scope';
      content =
        'In your role as {{designation}}, you will serve as a technical catalyst within {{department}}. Core responsibilities include architecting high-reliability systems, establishing robust engineering guidelines, and partnering with product teams to translate customer requirements into resilient software solutions.';
    } else if (isGeneralClause) {
      title = 'Alternative Confidentiality Covenant';
      content =
        'During and after employment with {{company_name}}, the Employee agrees to hold all proprietary trade secrets, business strategies, and client data in rigorous confidence, utilizing such materials strictly in furtherance of authorized Company duties.';
    } else {
      title = 'Alternative Offer Appointment Wording';
      content =
        '{{company_name}} is proud to extend this offer of employment for the role of {{designation}}. We anticipate your arrival on {{joining_date}} and are confident that your leadership will elevate our collective mission.';
    }

    return {
      title,
      content,
      keyPoints: [
        'Alternative wording variation',
        'Distinct stylistic cadence while preserving factual accuracy',
        'Zero invented policies or obligations',
      ],
      changesSummary: 'Generated fresh wording alternative with enhanced stylistic distinction.',
      isPolicyInvented: false,
      requiresHrReview: true,
    };
  }

  private simulateDocumentExtraction(userPrompt: string): Record<string, unknown> {
    const extractedFields: Record<string, any> = {};
    const warnings: string[] = [];
    const missingFields: string[] = [];

    // Helper for detected fields
    const extract = (key: string, val: any, quote: string, conf = 0.95) => {
      extractedFields[key] = {
        value: val,
        confidenceScore: conf,
        sourceSnippet: quote,
        isDetected: true,
      };
    };

    // Helper for absent fields
    const absent = (key: string) => {
      missingFields.push(key);
      extractedFields[key] = {
        value: null,
        confidenceScore: 0,
        sourceSnippet: 'Not mentioned in document',
        isDetected: false,
      };
    };

    // Recipient Names
    if (userPrompt.includes('Jane Alexandra Doe')) {
      extract('candidateName', 'Jane Alexandra Doe', 'Jane Alexandra Doe');
    } else if (userPrompt.includes('Liam Alexander Vance')) {
      extract('candidateName', 'Liam Alexander Vance', 'Liam Alexander Vance');
      extract('internName', 'Liam Alexander Vance', 'Liam Alexander Vance');
    } else if (userPrompt.includes('Sophia Chen')) {
      extract('employeeName', 'Sophia Chen', 'Sophia Chen');
    } else if (userPrompt.includes('Arthur Pendelton')) {
      extract('employeeName', 'Arthur Pendelton', 'Arthur Pendelton');
    } else if (userPrompt.includes('Maya Lin')) {
      extract('employeeName', 'Maya Lin', 'Maya Lin');
    } else if (userPrompt.includes('Devraj Patel')) {
      extract('employeeName', 'Devraj Patel', 'Devraj Patel');
    } else if (userPrompt.includes('Marcus Thorne')) {
      extract('employeeName', 'Marcus Thorne', 'Marcus Thorne');
    } else if (userPrompt.includes('Alex Mercer')) {
      extract('contractorName', 'Alex Mercer', 'Alex Mercer');
    } else if (userPrompt.includes('Apex Global Logistics')) {
      extract('clientLegalName', 'Apex Global Logistics Inc.', 'Apex Global Logistics Inc.');
    } else {
      absent('candidateName');
    }

    // Emails
    const emailMatch = userPrompt.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      extract('email', emailMatch[1], emailMatch[1]);
      extract('internEmail', emailMatch[1], emailMatch[1]);
      extract('contractorEmail', emailMatch[1], emailMatch[1]);
      extract('clientContactEmail', emailMatch[1], emailMatch[1]);
    } else {
      absent('email');
    }

    // Designations / Roles
    if (userPrompt.includes('Lead Platform Architect')) extract('jobTitle', 'Lead Platform Architect', 'Lead Platform Architect');
    if (userPrompt.includes('Machine Learning Research Intern')) extract('internshipRole', 'Machine Learning Research Intern', 'Machine Learning Research Intern');
    if (userPrompt.includes('Senior Distributed Systems Engineer')) extract('currentDesignation', 'Senior Distributed Systems Engineer', 'Senior Distributed Systems Engineer');
    if (userPrompt.includes('Staff Distributed Systems Engineer')) extract('revisedDesignation', 'Staff Distributed Systems Engineer', 'Staff Distributed Systems Engineer');
    if (userPrompt.includes('Senior Account Manager')) extract('designation', 'Senior Account Manager', 'Senior Account Manager');
    if (userPrompt.includes('Principal Product Designer')) extract('designationAtExit', 'Principal Product Designer', 'Principal Product Designer');
    if (userPrompt.includes('Senior DevOps Engineer')) extract('designation', 'Senior DevOps Engineer', 'Senior DevOps Engineer');
    if (userPrompt.includes('Staff Security Engineer')) extract('designation', 'Staff Security Engineer', 'Staff Security Engineer');

    // Department & Institution
    if (userPrompt.includes('Applied AI Labs')) extract('department', 'Applied AI Labs', 'Applied AI Labs');
    if (userPrompt.includes('Cloud Infrastructure')) extract('department', 'Cloud Infrastructure', 'Cloud Infrastructure');
    if (userPrompt.includes('Stanford University')) extract('collegeOrUniversity', 'Stanford University', 'Stanford University');

    // Dates
    const dateMatches = userPrompt.match(/\b(202[4-9]-\d{2}-\d{2})\b/g);
    if (dateMatches && dateMatches.length > 0) {
      extract('proposedJoiningDate', dateMatches[0], dateMatches[0]);
      extract('startDate', dateMatches[0], dateMatches[0]);
      extract('effectiveDate', dateMatches[0], dateMatches[0]);
      if (dateMatches[1]) {
        extract('endDate', dateMatches[1], dateMatches[1]);
        extract('lastWorkingDate', dateMatches[1], dateMatches[1]);
        extract('settlementDate', dateMatches[1], dateMatches[1]);
      }
    }

    // Compensation & Numeric
    if (userPrompt.includes('165,000') || userPrompt.includes('165000')) {
      extract('baseSalary', 165000, '$165,000');
      extract('revisedBaseSalary', 165000, '$165,000');
    }
    if (userPrompt.includes('234,750') || userPrompt.includes('234750')) {
      extract('totalCtc', 234750, '$234,750');
    }
    if (userPrompt.includes('140,000') || userPrompt.includes('140000')) {
      extract('previousBaseSalary', 140000, '$140,000');
    }
    if (userPrompt.includes('6,500') || userPrompt.includes('6500')) {
      extract('monthlyStipend', 6500, '$6,500');
      extract('stipendAmount', 6500, '$6,500');
    }
    if (userPrompt.includes('19,200') || userPrompt.includes('19200')) {
      extract('payableEarningsTotal', 19200, '$19,200');
    }
    if (userPrompt.includes('3,700') || userPrompt.includes('3700')) {
      extract('deductionsTotal', 3700, '$3,700');
    }
    if (userPrompt.includes('15,500') || userPrompt.includes('15500')) {
      extract('netPayableAmount', 15500, '$15,500');
    }

    if (userPrompt.includes('USD')) extract('currency', 'USD', 'USD');
    else if (userPrompt.includes('EUR')) extract('currency', 'EUR', 'EUR');
    else if (userPrompt.includes('INR')) extract('currency', 'INR', 'INR');

    return {
      extractedFields,
      warnings,
      missingFields,
    };
  }

  private simulateDocumentDrafting(userPrompt: string): Record<string, unknown> {
    return {
      title: 'Authorized Document Section Proposal',
      content:
        'All activities conducted under this document shall adhere to organizational governance, compliance benchmarks, and confidentiality stipulations. The parties agree to uphold executive professional standards throughout the engagement tenure.',
      keyPoints: [
        'Strictly advisory proposal requiring HR review',
        'Preserves factual terms without policy fabrication',
        'Subject to executive signatory authorization',
      ],
    };
  }

  private simulateDocumentEditing(userPrompt: string): Record<string, unknown> {
    const textMatch = userPrompt.match(/Text to improve: "([^"]+)"/);
    const originalText = textMatch ? textMatch[1] : 'Standard corporate terms and conditions apply.';
    return {
      title: 'Refined Executive Wording',
      improvedText: `Pursuant to corporate governance protocols, ${originalText.toLowerCase().replace(/^(we|this)\s+/i, '')}`,
      changesSummary: 'Refined phrasing for executive clarity and legal neutrality while strictly preserving facts.',
    };
  }

  private simulatePolicyAi(userPrompt: string): Record<string, unknown> {
    if (userPrompt.includes('TASK: DRAFT_POLICY')) {
      return {
        title: 'Comprehensive Enterprise Policy Framework',
        content: 'This policy establishes standard organizational expectations, operating principles, and compliance parameters for eligible staff.',
        sections: [
          { id: 'sec-1', sectionNumber: '1.0', title: 'Purpose & Applicability', content: 'Defines operational intent and workforce eligibility standards.', orderIndex: 1, isMandatory: true },
          { id: 'sec-2', sectionNumber: '2.0', title: 'Operating Guidelines', content: 'Outlines standard procedures and employee performance expectations.', orderIndex: 2, isMandatory: true },
          { id: 'sec-3', sectionNumber: '3.0', title: 'Compliance & Escalation', content: 'Specifies non-compliance reporting protocols and grievance escalation.', orderIndex: 3, isMandatory: true },
        ],
      };
    } else if (userPrompt.includes('TASK: IMPROVE_SECTION')) {
      return {
        title: 'Refined Section Content',
        improvedText: 'Employees are expected to adhere to documented operating standards and promptly communicate any schedule discrepancies to their immediate supervisor.',
        changesSummary: 'Refined sentence structure and elevated professional tone without creating statutory legal guarantees.',
      };
    } else if (userPrompt.includes('TASK: IDENTIFY_MISSING_SECTIONS')) {
      return {
        missingSectionsIdentified: [
          {
            title: 'Reporting & Escalation Procedure',
            importance: 'CRITICAL',
            rationale: 'Essential for ensuring transparent resolution of exceptions or non-compliance incidents.',
            suggestedOutline: 'Define contact points, reporting channels, and protection against retaliation.',
          },
          {
            title: 'Exceptions & Accommodation Request',
            importance: 'RECOMMENDED',
            rationale: 'Enables formalized review of medical or religious accommodation requests.',
            suggestedOutline: 'Procedure for submitting accommodation inquiries to People Operations.',
          },
        ],
      };
    } else if (userPrompt.includes('TASK: CHECK_CONSISTENCY')) {
      return {
        consistencyIssues: [
          {
            severity: 'MEDIUM',
            description: 'Notice requirements differ between section 2.1 (48 hours) and section 4.2 (5 business days).',
            location: 'Section 2.1 vs Section 4.2',
            recommendation: 'Standardize advance notice timeline across all dependent clauses.',
          },
        ],
      };
    } else if (userPrompt.includes('TASK: SUGGEST_WORDING')) {
      return {
        wordingSuggestions: [
          {
            originalText: 'You have to tell your manager if you are sick.',
            suggestedText: 'Employees unable to report for duty due to illness must notify their reporting manager at least one hour prior to shift commencement.',
            rationale: 'Establishes clear, unambiguous operational expectations in professional language.',
          },
        ],
      };
    } else {
      return {
        title: 'Structured Policy Sections',
        sections: [
          { id: 'sec-1', sectionNumber: '1.0', title: 'Purpose & Scope', content: 'Defines eligible workforce segments.', orderIndex: 1, isMandatory: true },
          { id: 'sec-2', sectionNumber: '2.0', title: 'Roles & Responsibilities', content: 'Outlines obligations for managers and employees.', orderIndex: 2, isMandatory: true },
        ],
      };
    }
  }
}

