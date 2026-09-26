import { IAiProviderAdapter } from './ai-provider.interface.js';
import { AiCompletionRequest, AiCompletionResponse } from '../types.js';

export class MockAiAdapter implements IAiProviderAdapter {
  public readonly providerId = 'MOCK';
  public readonly displayName = 'Mock AI Engine (Offline Sandbox)';

  async complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    const startTime = Date.now();

    // Simulate minor processing latency (80ms - 200ms)
    await new Promise((r) => setTimeout(r, 120));

    let generatedJson: Record<string, unknown>;

    if (request.systemPrompt.includes('CANDIDATE_DATA_EXTRACTION')) {
      generatedJson = this.simulateCandidateExtraction(request.userPrompt);
    } else if (request.systemPrompt.includes('POLICY_COMPLIANCE_CHECK')) {
      generatedJson = this.simulatePolicyCheck();
    } else if (request.systemPrompt.includes('SALARY_BENCHMARK_CHECK')) {
      generatedJson = this.simulateSalaryBenchmark();
    } else if (request.systemPrompt.includes('DETECT_HARDCODED_VALUES_AND_SUGGEST_PLACEHOLDERS')) {
      generatedJson = this.simulatePlaceholderSuggestions(request.userPrompt);
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
}
