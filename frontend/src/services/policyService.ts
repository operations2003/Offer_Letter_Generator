import {
  HrPolicy,
  PolicyTypeCode,
  PolicySection,
  PolicyStatus,
  EmployeeAcknowledgment,
  PolicyVersionSnapshot,
} from '../../../shared/types/policy-engine.js';

export interface PolicyTypeDefinition {
  code: PolicyTypeCode;
  name: string;
  category: string;
  description: string;
  defaultSections: Array<{
    sectionNumber: string;
    title: string;
    content: string;
    orderIndex: number;
    isMandatory?: boolean;
  }>;
}

export interface CreatePolicyPayload {
  policyTypeCode: PolicyTypeCode;
  title: string;
  description?: string;
  department: string;
  policyOwner: string;
  applicability: string;
  effectiveDate: string;
  reviewDate?: string;
  initialSections?: PolicySection[];
}

class PolicyServiceClass {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('offergen_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getPolicyTypes(): Promise<PolicyTypeDefinition[]> {
    try {
      const res = await fetch('/api/v1/policies/types', {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (err) {
      console.warn('Failed to fetch policy types from API', err);
    }
    return [];
  }

  async listPolicies(filters?: {
    status?: PolicyStatus;
    typeCode?: PolicyTypeCode;
    department?: string;
  }): Promise<HrPolicy[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.typeCode) params.set('typeCode', filters.typeCode);
    if (filters?.department) params.set('department', filters.department);

    try {
      const res = await fetch(`/api/v1/policies?${params.toString()}`, {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (err) {
      console.warn('Failed to list policies from API', err);
    }
    return [];
  }

  async getPolicyById(id: string): Promise<HrPolicy | null> {
    const res = await fetch(`/api/v1/policies/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  }

  async createPolicy(payload: CreatePolicyPayload): Promise<HrPolicy> {
    const res = await fetch('/api/v1/policies', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create policy');
    }
    const json = await res.json();
    return json.data;
  }

  async updateSections(
    policyId: string,
    sections: PolicySection[],
    changeSummary?: string
  ): Promise<HrPolicy> {
    const res = await fetch(`/api/v1/policies/${policyId}/sections`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ sections, changeSummary }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update policy sections');
    }
    const json = await res.json();
    return json.data;
  }

  async submitForReview(policyId: string): Promise<HrPolicy> {
    const res = await fetch(`/api/v1/policies/${policyId}/review`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to submit policy for review');
    }
    const json = await res.json();
    return json.data;
  }

  async recordApproval(
    policyId: string,
    decision: 'APPROVED' | 'REJECTED' | 'REQUESTED_CHANGES',
    notes?: string
  ): Promise<HrPolicy> {
    const res = await fetch(`/api/v1/policies/${policyId}/approve`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ decision, notes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to record approval');
    }
    const json = await res.json();
    return json.data;
  }

  async publishPolicy(policyId: string, changeSummary?: string): Promise<HrPolicy> {
    const res = await fetch(`/api/v1/policies/${policyId}/publish`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ changeSummary }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to publish policy');
    }
    const json = await res.json();
    return json.data;
  }

  async recordAcknowledgment(policyId: string): Promise<EmployeeAcknowledgment> {
    const res = await fetch(`/api/v1/policies/${policyId}/acknowledge`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to record acknowledgment');
    }
    const json = await res.json();
    return json.data;
  }

  async getAcknowledgments(policyId: string): Promise<{
    policyId: string;
    totalCount: number;
    acknowledgments: EmployeeAcknowledgment[];
  }> {
    const res = await fetch(`/api/v1/policies/${policyId}/acknowledgments`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) {
      return { policyId, totalCount: 0, acknowledgments: [] };
    }
    const json = await res.json();
    return json.data;
  }

  async getVersionHistory(policyId: string): Promise<PolicyVersionSnapshot[]> {
    const res = await fetch(`/api/v1/policies/${policyId}/versions`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.versionHistory || [];
  }
}

export const policyService = new PolicyServiceClass();
