// =============================================================================
// REUSABLE ONBOARDING SERVICE — FRONTEND API CLIENT
// =============================================================================

import {
  OnboardingFormConfig,
  OnboardingCandidateRecord,
  CandidateOnboardingData,
  OnboardingStatus,
  CollectedDocument,
} from '../../../shared/types/onboarding-engine.js';

class OnboardingService {
  private getHeaders(): HeadersInit {
    const token =
      localStorage.getItem('offergen_token') ||
      localStorage.getItem('auth_token') ||
      'demo_jwt_token_sample';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  // 1. Configuration
  public async getFormConfig(companyId = 'cmp_tasknera_001'): Promise<OnboardingFormConfig> {
    const res = await fetch(`/api/v1/onboarding/config?companyId=${companyId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch onboarding form configuration');
    const json = await res.json();
    return json.data;
  }

  public async updateFormConfig(
    updates: Partial<OnboardingFormConfig>,
    companyId = 'cmp_tasknera_001'
  ): Promise<OnboardingFormConfig> {
    const res = await fetch(`/api/v1/onboarding/config?companyId=${companyId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update onboarding form configuration');
    const json = await res.json();
    return json.data;
  }

  // 2. Candidates
  public async listCandidates(filters?: {
    companyId?: string;
    status?: OnboardingStatus;
    search?: string;
  }): Promise<OnboardingCandidateRecord[]> {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`/api/v1/onboarding/candidates?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch onboarding candidates');
    const json = await res.json();
    return json.data;
  }

  public async getCandidateById(id: string): Promise<OnboardingCandidateRecord> {
    const res = await fetch(`/api/v1/onboarding/candidates/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to fetch onboarding candidate: ${id}`);
    const json = await res.json();
    return json.data;
  }

  public async initiateOnboarding(data: {
    candidateName: string;
    email: string;
    phone: string;
    designation: string;
    department: string;
    joiningDate: string;
    offerId?: string;
    companyId?: string;
  }): Promise<OnboardingCandidateRecord> {
    const res = await fetch('/api/v1/onboarding/candidates', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to initiate onboarding workflow');
    const json = await res.json();
    return json.data;
  }

  // 3. Candidate Data Submission & Drafts
  public async saveDraft(
    candidateId: string,
    partialData: Partial<CandidateOnboardingData>
  ): Promise<OnboardingCandidateRecord> {
    const res = await fetch(`/api/v1/onboarding/candidates/${candidateId}/draft`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(partialData),
    });
    if (!res.ok) throw new Error('Failed to save onboarding draft');
    const json = await res.json();
    return json.data;
  }

  public async submitForm(
    candidateId: string,
    submission: CandidateOnboardingData
  ): Promise<OnboardingCandidateRecord> {
    const res = await fetch(`/api/v1/onboarding/candidates/${candidateId}/submit`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(submission),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to submit onboarding form');
    }
    const json = await res.json();
    return json.data;
  }

  // 4. Document Collection
  public async uploadDocument(
    candidateId: string,
    docData: {
      documentCode: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      fileUrl?: string;
    }
  ): Promise<CollectedDocument> {
    const res = await fetch(`/api/v1/onboarding/candidates/${candidateId}/documents`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(docData),
    });
    if (!res.ok) throw new Error('Failed to upload document');
    const json = await res.json();
    return json.data;
  }

  public async verifyDocument(
    candidateId: string,
    documentId: string,
    decision: 'VERIFIED' | 'REJECTED',
    reason?: string
  ): Promise<OnboardingCandidateRecord> {
    const res = await fetch(`/api/v1/onboarding/candidates/${candidateId}/documents/${documentId}/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ decision, reason }),
    });
    if (!res.ok) throw new Error('Failed to verify document');
    const json = await res.json();
    return json.data;
  }

  // 5. Joining Checklist & HR Review
  public async updateChecklistItem(
    candidateId: string,
    itemId: string,
    updates: { isCompleted: boolean; notes?: string }
  ): Promise<OnboardingCandidateRecord> {
    const res = await fetch(`/api/v1/onboarding/candidates/${candidateId}/checklist/${itemId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update checklist item');
    const json = await res.json();
    return json.data;
  }

  public async reviewCandidate(
    candidateId: string,
    decision: 'VERIFY' | 'REQUEST_CHANGES' | 'COMPLETE',
    notes: string
  ): Promise<OnboardingCandidateRecord> {
    const res = await fetch(`/api/v1/onboarding/candidates/${candidateId}/review`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ decision, notes }),
    });
    if (!res.ok) throw new Error('Failed to review candidate onboarding');
    const json = await res.json();
    return json.data;
  }
}

export const onboardingService = new OnboardingService();
