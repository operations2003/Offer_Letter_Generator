import React from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  UserCheck,
  Sparkles,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { JobEmploymentDetails } from '../../../types/offer.js';
import { TemplateCategory } from '../../../types/template.js';
import { AiCandidateExtractionData } from '../../../types/index.js';

interface Step5JobEmploymentDetailsProps {
  jobDetails: JobEmploymentDetails;
  aiData: AiCandidateExtractionData | null;
  onUpdateJobDetails: (updated: JobEmploymentDetails) => void;
}

export const Step5JobEmploymentDetails: React.FC<Step5JobEmploymentDetailsProps> = ({
  jobDetails,
  aiData,
  onUpdateJobDetails,
}) => {
  const handleChange = (field: keyof JobEmploymentDetails, value: any) => {
    onUpdateJobDetails({
      ...jobDetails,
      [field]: value,
    });
  };

  const aiTitle = aiData?.designation?.value || 'Staff Software Architect';
  const aiDept = aiData?.department?.value || 'Cloud Infrastructure';
  const aiLocation = aiData?.location?.value || 'San Francisco, CA (Hybrid)';
  const aiJoining = aiData?.joiningDate?.value || '2026-11-16';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.875rem',
            }}
          >
            5
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Job & Employment Architecture</h3>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4, marginLeft: 38 }}>
          Specify corporate designation, department hierarchy, reporting relationships, and work arrangement.
        </p>
      </div>

      {/* Comparison Insight Callout */}
      <div
        style={{
          padding: 16,
          background: '#f8fafc',
          borderRadius: 10,
          border: '1px solid var(--border-medium)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Sparkles size={16} color="#7c3aed" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6d28d9', fontWeight: 700, textTransform: 'uppercase' }}>
              AI Extracted Target
            </div>
            <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 600, marginTop: 2 }}>
              "{aiTitle}" in {aiDept}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
              Extracted from resume desired seniority & previous roles
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <ShieldCheck size={16} color="#059669" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>
              HR Requisition Match
            </div>
            <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 600, marginTop: 2 }}>
              {jobDetails.jobTitle || 'Unassigned'} • Band {jobDetails.bandGrade || 'L6'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
              Approved headcount requisition within enterprise talent plan
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields Grid */}
      <div
        style={{
          padding: 24,
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
        }}
      >
        {/* Job Title */}
        <div>
          <label className="form-label">
            Official Designation / Job Title *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              value={jobDetails.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              placeholder="e.g. Staff Software Architect"
              required
            />
          </div>
          <span style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 2, display: 'block' }}>
            AI suggested: <span style={{ color: '#6d28d9', fontWeight: 600 }}>{aiTitle}</span>
          </span>
        </div>

        {/* Department */}
        <div>
          <label className="form-label">Department / Business Unit *</label>
          <input
            type="text"
            className="form-input"
            value={jobDetails.department}
            onChange={(e) => handleChange('department', e.target.value)}
            placeholder="e.g. Cloud Infrastructure & Core Services"
            required
          />
          <span style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 2, display: 'block' }}>
            AI suggested: <span style={{ color: '#6d28d9', fontWeight: 600 }}>{aiDept}</span>
          </span>
        </div>

        {/* Band / Grade */}
        <div>
          <label className="form-label">Band / Job Grade</label>
          <select
            className="form-select"
            value={jobDetails.bandGrade}
            onChange={(e) => handleChange('bandGrade', e.target.value)}
          >
            <option value="L4 - Software Engineer II">L4 - Mid Level Engineer</option>
            <option value="L5 - Senior Software Engineer">L5 - Senior Engineer</option>
            <option value="L6 - Staff Software Architect">L6 - Staff Architect</option>
            <option value="L7 - Principal Engineer / Director">L7 - Principal Architect</option>
            <option value="E1 - VP / Executive">E1 - VP / Executive Officer</option>
          </select>
        </div>

        {/* Employment Type */}
        <div>
          <label className="form-label">Employment Type</label>
          <select
            className="form-select"
            value={jobDetails.employmentType}
            onChange={(e) => handleChange('employmentType', e.target.value as TemplateCategory)}
          >
            <option value="FULL_TIME">Full-Time Regular Exempt</option>
            <option value="PART_TIME">Part-Time</option>
            <option value="CONTRACT">Contractor / Consultant</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="EXECUTIVE">Executive Appointment</option>
          </select>
        </div>

        {/* Work Location */}
        <div>
          <label className="form-label">Work Location & Arrangement *</label>
          <input
            type="text"
            className="form-input"
            value={jobDetails.workLocation}
            onChange={(e) => handleChange('workLocation', e.target.value)}
            placeholder="e.g. San Francisco, CA (Hybrid - 3 days onsite)"
            required
          />
          <span style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 2, display: 'block' }}>
            AI suggested: <span style={{ color: '#6d28d9', fontWeight: 600 }}>{aiLocation}</span>
          </span>
        </div>

        {/* Proposed Joining Date */}
        <div>
          <label className="form-label">Proposed Joining Date *</label>
          <input
            type="date"
            className="form-input"
            value={jobDetails.proposedJoiningDate}
            onChange={(e) => handleChange('proposedJoiningDate', e.target.value)}
            required
          />
          <span style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 2, display: 'block' }}>
            Candidate indicated availability: <span style={{ color: '#6d28d9', fontWeight: 600 }}>{aiJoining}</span>
          </span>
        </div>

        {/* Reporting Manager Name */}
        <div>
          <label className="form-label">Reporting Manager Name</label>
          <input
            type="text"
            className="form-input"
            value={jobDetails.reportingManagerName}
            onChange={(e) => handleChange('reportingManagerName', e.target.value)}
            placeholder="e.g. Marcus Vance"
          />
        </div>

        {/* Reporting Manager Title */}
        <div>
          <label className="form-label">Reporting Manager Title</label>
          <input
            type="text"
            className="form-input"
            value={jobDetails.reportingManagerTitle}
            onChange={(e) => handleChange('reportingManagerTitle', e.target.value)}
            placeholder="e.g. VP of Global Infrastructure"
          />
        </div>
      </div>
    </div>
  );
};
