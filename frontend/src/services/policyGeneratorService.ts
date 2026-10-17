import { PolicyDefinition } from '../components/policies/PolicyViewerModal.js';
import { OFFICIAL_POLICIES } from './policyCatalog.js';

const STORAGE_KEY = 'tasknera_custom_policies';
const DELETED_STORAGE_KEY = 'tasknera_deleted_policy_codes';

/**
 * Retrieve user-generated custom policies from LocalStorage
 */
export function getCustomPolicies(): PolicyDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load custom policies from localStorage:', err);
    return [];
  }
}

/**
 * Retrieve deleted policy codes/numbers from LocalStorage
 */
export function getDeletedPolicyCodes(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

/**
 * Save or update a custom policy in LocalStorage
 */
export function saveCustomPolicy(policy: PolicyDefinition): PolicyDefinition[] {
  try {
    const existing = getCustomPolicies();
    const filtered = existing.filter((p) => p.code !== policy.code && p.policyNumber !== policy.policyNumber);
    const updated = [policy, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // If it was previously marked as deleted, undelete it
    const deleted = getDeletedPolicyCodes().filter((c) => c !== policy.code && c !== policy.policyNumber);
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deleted));

    return updated;
  } catch (err) {
    console.error('Failed to save custom policy:', err);
    return getCustomPolicies();
  }
}

/**
 * Delete any policy (custom or default)
 */
export function deletePolicy(codeOrNumber: string): PolicyDefinition[] {
  try {
    // 1. If in custom policies, remove it
    const existing = getCustomPolicies();
    const filtered = existing.filter((p) => p.code !== codeOrNumber && p.policyNumber !== codeOrNumber);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // 2. Add to deleted tracking list
    const deleted = getDeletedPolicyCodes();
    if (!deleted.includes(codeOrNumber)) {
      deleted.push(codeOrNumber);
      localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deleted));
    }

    return getAllPolicies();
  } catch (err) {
    console.error('Failed to delete policy:', err);
    return getAllPolicies();
  }
}

/**
 * Alias for deletePolicy
 */
export const deleteCustomPolicy = deletePolicy;

/**
 * Restore all deleted built-in policies
 */
export function restoreAllPolicies(): PolicyDefinition[] {
  try {
    localStorage.removeItem(DELETED_STORAGE_KEY);
    return getAllPolicies();
  } catch (err) {
    return getAllPolicies();
  }
}

/**
 * Combine official built-in policies with custom generated policies, filtering out deleted ones
 */
export function getAllPolicies(): PolicyDefinition[] {
  const custom = getCustomPolicies();
  const deletedSet = new Set(getDeletedPolicyCodes());

  // Filter out any duplicates if custom policy overrides an official code
  const customCodes = new Set(custom.map((p) => p.code));
  const officials = OFFICIAL_POLICIES.filter((p) => !customCodes.has(p.code));

  const all = [...custom, ...officials];
  return all.filter((p) => !deletedSet.has(p.code) && !deletedSet.has(p.policyNumber));
}

/**
 * Calls backend AI service or falls back to intelligent high-fidelity synthesis
 */
export async function generatePolicyFromPrompt(
  prompt: string,
  categoryHint?: string
): Promise<PolicyDefinition> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    throw new Error('Please enter a policy description or prompt.');
  }

  // 1. Try backend AI endpoint
  try {
    const res = await fetch('/api/v1/ai/policy/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: trimmed,
        category: categoryHint,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.data && data.data.name && Array.isArray(data.data.sections)) {
        const validated = sanitizePolicyPayload(data.data, trimmed);
        saveCustomPolicy(validated);
        return validated;
      }
    }
  } catch (err) {
    console.warn('Backend policy AI generation failed or unreachable, using client synthesis engine:', err);
  }

  // 2. Intelligent Client Synthesis Fallback
  const synthesized = synthesizePolicyClientSide(trimmed, categoryHint);
  saveCustomPolicy(synthesized);
  return synthesized;
}

/**
 * Increment version string, e.g. "1.0" -> "1.1", "1.9" -> "2.0"
 */
function bumpVersion(ver: string): string {
  const parts = (ver || '1.0').split('.');
  if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
    const major = Number(parts[0]);
    const minor = Number(parts[1]) + 1;
    return `${major}.${minor}`;
  }
  return `${ver}.1`;
}

/**
 * Edit a specific policy section using a natural language prompt
 */
export async function editPolicySectionWithPrompt(
  policy: PolicyDefinition,
  sectionNumber: string,
  editPrompt: string
): Promise<{ updatedPolicy: PolicyDefinition; updatedSection: any; changesSummary: string }> {
  const trimmed = editPrompt.trim();
  if (!trimmed) {
    throw new Error('Please enter instructions for editing the section.');
  }

  const isNew = sectionNumber === 'NEW';
  const targetSec = policy.sections.find((s) => s.number === sectionNumber);

  // 1. Try backend AI endpoint
  try {
    const res = await fetch('/api/v1/ai/policy/edit-section', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        policyName: policy.name,
        sectionNumber: isNew ? `${policy.sections.length + 1}.0` : targetSec?.number || sectionNumber,
        sectionTitle: isNew ? 'Additional Policy Provision' : targetSec?.title || 'Policy Clause',
        currentContent: isNew ? '' : targetSec?.content || '',
        editPrompt: trimmed,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data && json.data.updatedContent) {
        const result = json.data;
        let newSections = [...policy.sections];
        let finalSection: any;

        if (isNew) {
          finalSection = {
            number: result.sectionNumber || `${policy.sections.length + 1}.0`,
            title: result.sectionTitle || 'Additional Provision',
            content: result.updatedContent,
            mandatory: true,
          };
          newSections.push(finalSection);
        } else {
          newSections = newSections.map((s) => {
            if (s.number === sectionNumber) {
              finalSection = {
                ...s,
                title: result.sectionTitle || s.title,
                content: result.updatedContent,
              };
              return finalSection;
            }
            return s;
          });
        }

        const updatedPolicy: PolicyDefinition = {
          ...policy,
          version: bumpVersion(policy.version || '1.0'),
          sections: newSections,
        };

        saveCustomPolicy(updatedPolicy);
        return {
          updatedPolicy,
          updatedSection: finalSection,
          changesSummary: result.changesSummary || 'Section modified per AI prompt instructions.',
        };
      }
    }
  } catch (err) {
    console.warn('Backend policy section edit failed, using client intelligent engine:', err);
  }

  // 2. Client-side intelligent rewriting fallback
  const clientResult = editSectionClientSide(policy, sectionNumber, trimmed);
  saveCustomPolicy(clientResult.updatedPolicy);
  return clientResult;
}

/**
 * Directly updates a policy section manually (without AI prompt)
 */
export function updatePolicySectionManual(
  policy: PolicyDefinition,
  sectionNumber: string,
  newTitle: string,
  newContent: string
): PolicyDefinition {
  const newSections = policy.sections.map((s) => {
    if (s.number === sectionNumber) {
      return {
        ...s,
        title: newTitle.trim() || s.title,
        content: newContent.trim() || s.content,
      };
    }
    return s;
  });

  const updatedPolicy: PolicyDefinition = {
    ...policy,
    version: bumpVersion(policy.version || '1.0'),
    sections: newSections,
  };

  saveCustomPolicy(updatedPolicy);
  return updatedPolicy;
}

/**
 * Adds a new section to an existing policy
 */
export function addNewPolicySection(
  policy: PolicyDefinition,
  title: string,
  content: string
): PolicyDefinition {
  const nextNum = `${policy.sections.length + 1}.0`;
  const newSec = {
    number: nextNum,
    title: title.trim() || `Section ${nextNum}`,
    content: content.trim() || 'Mandatory policy guidelines and operational directives apply.',
    mandatory: true,
  };

  const updatedPolicy: PolicyDefinition = {
    ...policy,
    version: bumpVersion(policy.version || '1.0'),
    sections: [...policy.sections, newSec],
  };

  saveCustomPolicy(updatedPolicy);
  return updatedPolicy;
}

/**
 * Intelligent client-side section editor when offline or backend unreachable
 */
function editSectionClientSide(
  policy: PolicyDefinition,
  sectionNumber: string,
  editPrompt: string
): { updatedPolicy: PolicyDefinition; updatedSection: any; changesSummary: string } {
  const isNew = sectionNumber === 'NEW';
  const targetSec = policy.sections.find((s) => s.number === sectionNumber);
  const promptLower = editPrompt.toLowerCase();

  let newTitle = isNew ? 'Additional Policy Provision' : targetSec?.title || 'Policy Provision';
  let newContent = isNew ? '' : targetSec?.content || '';
  let summary = `Updated ${newTitle} according to prompt instructions.`;

  // Dynamic additions based on prompt directives
  let amendment = '';
  if (promptLower.includes('notice') || promptLower.includes('days') || promptLower.includes('timeline')) {
    const daysMatch = editPrompt.match(/(\d+)\s*(days?|months?)/i);
    const duration = daysMatch ? `${daysMatch[1]} ${daysMatch[2]}` : '60 days';
    amendment = `\n\n• Formal Notice & Transition Mandate: A mandatory notice period of ${duration} is strictly required for any changes, separation, or operational transitions under this clause. Written confirmation from People Operations is prerequisite prior to relieving.`;
    summary = `Updated timeline and notice obligations to ${duration}.`;
  }

  if (
    promptLower.includes('competitor') ||
    promptLower.includes('moonlight') ||
    promptLower.includes('dual employment') ||
    promptLower.includes('side work') ||
    promptLower.includes('non-compete')
  ) {
    amendment += `\n\n[NO_UNFAIR_RESTRICTION]\n• Strict Dual Employment & Non-Compete Restriction: Under no circumstances may a covered person engage in, consult for, or provide advisory services to any direct or indirect competitor during active engagement and for 12 months post-cessation. Material violations incur liquidated damages and immediate contractual termination for cause.`;
    summary = `Reinforced strict non-compete and dual employment restrictions with enforcement provisions.`;
  }

  if (
    promptLower.includes('ai') ||
    promptLower.includes('chatgpt') ||
    promptLower.includes('llm') ||
    promptLower.includes('code') ||
    promptLower.includes('data')
  ) {
    amendment += `\n\n• Generative AI & Data Ingestion Prohibition: Uploading, pasting, or feeding any proprietary source code, internal communications, customer PII, or confidential company deliverables into public, unapproved AI or LLM tools is strictly prohibited without prior written sign-off from IT Security.`;
    summary = `Added strict Generative AI and confidential data ingestion safeguards.`;
  }

  if (
    promptLower.includes('penalty') ||
    promptLower.includes('fine') ||
    promptLower.includes('disciplinary') ||
    promptLower.includes('strict')
  ) {
    amendment += `\n\n• Legal & Disciplinary Consequences: Non-adherence constitutes gross misconduct. TaskNera reserves the full right to initiate disciplinary inquiry, forfeit discretionary incentives, demand indemnification for incurred damages, and pursue statutory legal remedies under Indian jurisdiction.`;
    summary = `Added strict disciplinary sanctions and legal consequence clauses.`;
  }

  if (
    promptLower.includes('remote') ||
    promptLower.includes('wfh') ||
    promptLower.includes('hybrid') ||
    promptLower.includes('location')
  ) {
    amendment += `\n\n• Remote Work Compliance & Security Mandate: Remote operations require dual-factor VPN authentication, dedicated private workspace, and formal written authorization from the department lead renewed semi-annually.`;
    summary = `Added remote work verification and security compliance requirements.`;
  }

  // If no specific keyword triggered, create a comprehensive contextual clause from the prompt
  if (!amendment) {
    amendment = `\n\n• Mandatory Policy Requirement: ${editPrompt.charAt(0).toUpperCase() + editPrompt.slice(1)}. All associated personnel must comply strictly with these provisions, and department managers are tasked with continuous oversight.`;
  }

  newContent = (newContent + amendment).trim();

  let finalSection: any;
  let newSections = [...policy.sections];

  if (isNew) {
    finalSection = {
      number: `${policy.sections.length + 1}.0`,
      title: newTitle,
      content: newContent,
      mandatory: true,
    };
    newSections.push(finalSection);
  } else {
    newSections = newSections.map((s) => {
      if (s.number === sectionNumber) {
        finalSection = {
          ...s,
          title: newTitle,
          content: newContent,
        };
        return finalSection;
      }
      return s;
    });
  }

  const updatedPolicy: PolicyDefinition = {
    ...policy,
    version: bumpVersion(policy.version || '1.0'),
    sections: newSections,
  };

  return {
    updatedPolicy,
    updatedSection: finalSection,
    changesSummary: summary,
  };
}

/**
 * Validate and clean policy data returned by backend
 */
function sanitizePolicyPayload(raw: any, originalPrompt: string): PolicyDefinition {
  const code = (raw.code || `POL_${Date.now()}`).toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  const policyNumber = raw.policyNumber || `POL-GEN-${Math.floor(100 + Math.random() * 900)}`;

  const sections = Array.isArray(raw.sections) && raw.sections.length > 0
    ? raw.sections.map((s: any, idx: number) => ({
        number: s.number || `${idx + 1}.0`,
        title: s.title || `Section ${idx + 1}`,
        content: s.content || '',
        mandatory: s.mandatory !== false,
      }))
    : synthesizeSections(raw.name || originalPrompt, raw.category || 'WORKPLACE_CONDUCT');

  return {
    code,
    name: raw.name || 'Company Policy',
    subtitle: raw.subtitle || 'Internal Governance & Operational Standard',
    category: raw.category || 'WORKPLACE_CONDUCT',
    categoryLabel: raw.categoryLabel || 'Workplace Governance',
    policyNumber,
    version: raw.version || '1.0',
    effectiveDate: raw.effectiveDate || 'Effective from the date of issue',
    reviewCycle: raw.reviewCycle || 'Annual / Internal Governance',
    applicability: raw.applicability || 'All Employees, Contractors, Interns & Associated Personnel',
    description: raw.description || `Organizational policy governing ${originalPrompt.slice(0, 100)}...`,
    summary: raw.summary || `Authoritative company governance standard established to ensure compliance, transparency, and operational excellence.`,
    color: raw.color || '#2563eb',
    sections,
  };
}

/**
 * Client-side domain engine to construct exhaustive, high-standard policy definitions
 */
function synthesizePolicyClientSide(prompt: string, categoryHint?: string): PolicyDefinition {
  const lower = prompt.toLowerCase();

  let category = categoryHint || 'WORKPLACE_CONDUCT';
  let categoryLabel = 'Workplace Conduct';
  let color = '#2563eb';
  let prefix = 'GEN';

  if (lower.includes('remote') || lower.includes('hybrid') || lower.includes('work from home') || lower.includes('wfh') || lower.includes('travel')) {
    category = 'WORK_ARRANGEMENTS';
    categoryLabel = 'Work Arrangements';
    color = '#0d9488';
    prefix = 'WRK';
  } else if (lower.includes('leave') || lower.includes('holiday') || lower.includes('vacation') || lower.includes('sick') || lower.includes('maternity') || lower.includes('attendance') || lower.includes('time off')) {
    category = 'ATTENDANCE_LEAVE';
    categoryLabel = 'Attendance & Leave';
    color = '#059669';
    prefix = 'LEAVE';
  } else if (lower.includes('security') || lower.includes('data') || lower.includes('byod') || lower.includes('ai') || lower.includes('laptop') || lower.includes('device') || lower.includes('software') || lower.includes('cyber') || lower.includes('password') || lower.includes('access')) {
    category = 'IT_DATA_SECURITY';
    categoryLabel = 'IT & Data Security';
    color = '#4f46e5';
    prefix = 'IT';
  } else if (lower.includes('expense') || lower.includes('travel') || lower.includes('reimburse') || lower.includes('allowance') || lower.includes('finance') || lower.includes('budget') || lower.includes('per diem')) {
    category = 'FINANCE_TRAVEL';
    categoryLabel = 'Finance & Travel';
    color = '#ea580c';
    prefix = 'FIN';
  } else if (lower.includes('harassment') || lower.includes('posh') || lower.includes('conduct') || lower.includes('moonlight') || lower.includes('ethics') || lower.includes('conflict of interest') || lower.includes('social media')) {
    category = 'WORKPLACE_CONDUCT';
    categoryLabel = 'Workplace Conduct';
    color = '#2563eb';
    prefix = 'POL';
  }

  // Generate clean name
  let policyName = formatTitleFromPrompt(prompt);
  const code = `CUSTOM_POL_${prefix}_${Date.now()}`;
  const randomNum = Math.floor(100 + Math.random() * 900);
  const policyNumber = `POL-${prefix}-${randomNum}`;

  const sections = synthesizeSections(policyName, category, prompt);

  return {
    code,
    name: policyName,
    subtitle: `${categoryLabel} Governance & Compliance Standard`,
    category,
    categoryLabel,
    policyNumber,
    version: '1.0',
    effectiveDate: 'Effective immediately upon notification',
    reviewCycle: 'Annual Review / As Needed by HR & Legal',
    applicability: 'All Full-Time, Part-Time, Probationary, Contractors & Remote Personnel',
    description: `Defines rigorous governance, ethical expectations, compliance standards, and operating rules for ${policyName.toLowerCase()} across all company operations.`,
    summary: `TaskNera is committed to fostering a secure, compliant, and transparent working environment. This policy establishes binding directives and operational clarity for all personnel regarding ${policyName.toLowerCase()}.`,
    color,
    sections,
  };
}

function formatTitleFromPrompt(prompt: string): string {
  let cleaned = prompt.replace(/^(create|generate|draft|write|make|a|an|the|policy for|policy on|policy regarding)\s+/gi, '').trim();
  cleaned = cleaned.replace(/\s+policy$/i, '');
  if (!cleaned) return 'Enterprise HR Policy';

  // Capitalize words
  const words = cleaned.split(/\s+/).slice(0, 6);
  const title = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return `${title} Policy`;
}

function synthesizeSections(policyName: string, category: string, promptDetails: string = ''): Array<{
  number: string;
  title: string;
  content: string;
  mandatory: boolean;
}> {
  return [
    {
      number: '1.0',
      title: 'Purpose & Policy Statement',
      content: `The purpose of the ${policyName} is to establish clear, objective, and enforceable standards governing organizational operations, personnel conduct, and risk management at TaskNera. 

This policy ensures that all business practices, operational decisions, and employee actions align with applicable labor laws, cybersecurity mandates, client expectations, and ethical benchmarks.

[CORE_STANDARD]
Compliance with this policy is a condition of continued engagement with TaskNera. Every individual covered by this policy is expected to read, understand, and conscientiously adhere to the rules and guidelines set forth herein. Ignorance of policy requirements will not be accepted as a valid defense for non-compliance.`,
      mandatory: true,
    },
    {
      number: '2.0',
      title: 'Scope & Applicability',
      content: `This policy applies comprehensively across all entities, branches, project teams, and delivery centers of TaskNera.

• Personnel Coverage: All full-time employees, part-time staff, fixed-term contractors, interns, trainees, consultants, and third-party vendors working on behalf of TaskNera.
• Operational Scope: Applicable to all activities conducted on company premises, client offices, remote/home work environments, during business travel, or while using company-provided communication networks and hardware.
• Precedence: In the event of a specific conflict between local statutory provisions and this policy, the more stringent standard of compliance shall apply.`,
      mandatory: true,
    },
    {
      number: '3.0',
      title: 'Definitions & Key Terms',
      content: `For the interpretation of this policy, the following authoritative terms and concepts shall apply:

[DEFINITIONS_TABLE]
• Designated Authority: The department head, People Operations Director, or Compliance Officer empowered to authorize exceptions or enforce provisions.
• Company Resources: All physical equipment, software licenses, networks, intellectual property, email accounts, and proprietary data assets.
• Covered Person: Any worker or contractor maintaining an active engagement, direct or indirect, with TaskNera.
• Material Violation: Any intentional or reckless breach that exposes the company, its clients, or personnel to financial loss, legal liability, or reputational damage.`,
      mandatory: true,
    },
    {
      number: '4.0',
      title: 'Core Standards & Operational Directives',
      content: `All covered personnel must uphold the following mandatory operational and professional standards:

1. Duty of Care & Diligence: Execute responsibilities with high integrity, preserving the security, confidentiality, and quality standards demanded by TaskNera.
2. Transparency & Record Keeping: Accurately maintain relevant logs, documentation, approvals, and communication trails associated with ${policyName.toLowerCase()}.
3. Resource Utilization: Company-provided systems, tools, and platforms must be utilized in accordance with authorized scopes and security protocols.
4. Prompt Escalation: Any anomaly, system vulnerability, conflict of interest, or breach must be promptly escalated to the designated supervisor or compliance desk.`,
      mandatory: true,
    },
    {
      number: '5.0',
      title: 'Prohibited Conduct & Non-Compliance',
      content: `The following actions are strictly prohibited and represent immediate grounds for disciplinary intervention:

• Unauthorized Disclosures: Sharing proprietary workflows, sensitive data, internal communications, or client materials with unapproved third parties.
• Policy Circumvention: Attempting to bypass security controls, supervisory approvals, administrative logging, or oversight mechanisms.
• Negligent Handling: Failing to exercise due care when handling client data, proprietary records, or assigned company hardware.
• Retaliation: Taking adverse action or retaliating against any person who reports a good-faith concern or violation under this policy.`,
      mandatory: true,
    },
    {
      number: '6.0',
      title: 'Enforcement, Disciplinary Action & Governance',
      content: `TaskNera maintains a zero-tolerance approach toward intentional misconduct, gross negligence, and deliberate policy violations.

• Investigation Protocol: Suspected violations will be independently investigated by People Operations and the Legal/Compliance team with adherence to due process and principles of natural justice.
• Disciplinary Measures: Depending on severity, disciplinary measures may range from formal written reprimands, mandatory retraining, suspension of privileges, up to summary termination of employment for cause and legal recourse.
• Review Cycle: This policy is reviewed annually or whenever regulatory, technological, or organizational changes necessitate formal revision.`,
      mandatory: true,
    },
  ];
}

