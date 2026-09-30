// =============================================================================
// LEARNING & CERTIFICATES API SERVICE
// =============================================================================

import {
  CourseItem,
  CourseCategory,
  CourseEnrollment,
  CertificateTemplate,
  CertificateTypeCode,
  IssuedCertificate,
} from '../../../shared/types/learning-engine';

const API_BASE_URL = '/api/v1/learning';

export interface CreateCoursePayload {
  title: string;
  category: CourseCategory;
  description: string;
  instructorName: string;
  instructorEmail?: string;
  materialUrl: string;
  duration: string;
  startDate: string;
  endDate: string;
  isMandatory: boolean;
  isCertificateEligible: boolean;
  assignment?: {
    title: string;
    description: string;
    passingScorePercent: number;
    submissionCriteria?: string;
  };
  creatorRole?: string;
  creatorId?: string;
}

export interface RequestCertificatePayload {
  templateId: string;
  certificateTypeCode?: CertificateTypeCode;
  recipientName: string;
  recipientEmail: string;
  recipientDepartment: string;
  courseId?: string;
  courseTitle: string;
  achievementDescription?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  secondarySignatoryName?: string;
  secondarySignatoryTitle?: string;
  requesterRole?: string;
  requesterId?: string;
  autoApprove?: boolean;
}

export const learningService = {
  // ---------------------------------------------------------------------------
  // Courses API
  // ---------------------------------------------------------------------------
  async listCourses(params?: {
    category?: CourseCategory;
    status?: string;
    isMandatory?: boolean;
    search?: string;
  }): Promise<CourseItem[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.isMandatory !== undefined) query.append('isMandatory', String(params.isMandatory));
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE_URL}/courses?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load courses');
    const json = await res.json();
    return json.data;
  },

  async getCourseById(id: string): Promise<CourseItem> {
    const res = await fetch(`${API_BASE_URL}/courses/${id}`);
    if (!res.ok) throw new Error(`Failed to load course: ${id}`);
    const json = await res.json();
    return json.data;
  },

  async createCourse(payload: CreateCoursePayload): Promise<CourseItem> {
    const res = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': payload.creatorRole || 'HR_MANAGER',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create course');
    }
    const json = await res.json();
    return json.data;
  },

  async enrollUser(courseId: string, user: { id: string; name: string; email: string; department?: string }): Promise<CourseEnrollment> {
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to enroll user');
    const json = await res.json();
    return json.data;
  },

  async listUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
    const res = await fetch(`${API_BASE_URL}/enrollments?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to load user enrollments');
    const json = await res.json();
    return json.data;
  },

  async updateProgress(enrollmentId: string, progressPercent: number): Promise<CourseEnrollment> {
    const res = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progressPercent }),
    });
    if (!res.ok) throw new Error('Failed to update progress');
    const json = await res.json();
    return json.data;
  },

  async submitAssignment(enrollmentId: string, submissionTextOrUrl: string): Promise<CourseEnrollment> {
    const res = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/assignment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionTextOrUrl }),
    });
    if (!res.ok) throw new Error('Failed to submit assignment');
    const json = await res.json();
    return json.data;
  },

  async checkEligibility(enrollmentId: string): Promise<{
    isEligible: boolean;
    reason: string;
    course: CourseItem;
    enrollment: CourseEnrollment;
  }> {
    const res = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/eligibility`);
    if (!res.ok) throw new Error('Failed to check eligibility');
    const json = await res.json();
    return json.data;
  },

  // ---------------------------------------------------------------------------
  // Certificates API (Step 9)
  // ---------------------------------------------------------------------------
  async listCertificateTemplates(typeCode?: CertificateTypeCode): Promise<CertificateTemplate[]> {
    const url = typeCode ? `${API_BASE_URL}/certificate-templates?typeCode=${typeCode}` : `${API_BASE_URL}/certificate-templates`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load certificate templates');
    const json = await res.json();
    return json.data;
  },

  async listCertificates(params?: {
    status?: string;
    recipientEmail?: string;
    certificateTypeCode?: string;
    search?: string;
  }): Promise<IssuedCertificate[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.recipientEmail) query.append('recipientEmail', params.recipientEmail);
    if (params?.certificateTypeCode) query.append('certificateTypeCode', params.certificateTypeCode);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE_URL}/certificates?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load certificates registry');
    const json = await res.json();
    return json.data;
  },

  async getCertificateById(id: string): Promise<IssuedCertificate> {
    const res = await fetch(`${API_BASE_URL}/certificates/${id}`);
    if (!res.ok) throw new Error(`Failed to load certificate: ${id}`);
    const json = await res.json();
    return json.data;
  },

  async requestCertificate(payload: RequestCertificatePayload): Promise<IssuedCertificate> {
    const res = await fetch(`${API_BASE_URL}/certificates/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': payload.requesterRole || 'HR_MANAGER',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to request certificate');
    }
    const json = await res.json();
    return json.data;
  },

  async reviewCertificate(id: string, decision: 'APPROVE' | 'REJECT', notes?: string, role: string = 'HR_MANAGER'): Promise<IssuedCertificate> {
    const res = await fetch(`${API_BASE_URL}/certificates/${id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
      },
      body: JSON.stringify({ decision, notes }),
    });
    if (!res.ok) throw new Error('Failed to review certificate');
    const json = await res.json();
    return json.data;
  },

  async generateCertificate(id: string, role: string = 'HR_MANAGER'): Promise<IssuedCertificate> {
    const res = await fetch(`${API_BASE_URL}/certificates/${id}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
      },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error('Failed to generate certificate');
    const json = await res.json();
    return json.data;
  },

  async verifyCertificate(refNumber: string): Promise<{
    isValid: boolean;
    certificate?: IssuedCertificate;
    template?: CertificateTemplate;
    verificationMessage: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/certificates/verify/${encodeURIComponent(refNumber)}`);
    if (!res.ok) throw new Error('Failed to verify certificate');
    const json = await res.json();
    return json.data;
  },
};
