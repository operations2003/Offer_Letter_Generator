import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  UserCheck,
  FileText,
  Clock,
  Edit2,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  CandidateDetails,
  JobEmploymentDetails,
  CompensationData,
  TermsAndPolicies,
  PreGenerationCheckResult,
} from '../../../types/offer.js';
import { HumanOverrideItem, AiCandidateExtractionData } from '../../../types/index.js';

interface Step10FinalHrReviewProps {
  candidate: CandidateDetails;
  jobDetails: JobEmploymentDetails;
  compensation: CompensationData;
  terms: TermsAndPolicies;
  aiData: AiCandidateExtractionData | null;
  overrides: HumanOverrideItem[];
  recruiterId: string;
  approverId: string;
  approvalNotes: string;
  isConfirmed: boolean;
  preGenAuditResult?: PreGenerationCheckResult | null;
  onJumpToStep?: (stepNumber: number) => void;
  onUpdateSignOff: (signOff: {
    recruiterId: string;
    approverId: string;
    approvalNotes: string;
    isConfirmed: boolean;
  }) => void;
}

export const Step10FinalHrReview: React.FC<Step10FinalHrReviewProps> = ({
  candidate,
  jobDetails,
  compensation,
  terms,
  aiData,
  overrides,
  recruiterId,
  approverId,
  approvalNotes,
  isConfirmed,
  preGenAuditResult,
  onJumpToStep,
  onUpdateSignOff,
}) => {
  const comparisonItems = [
    {
      label: 'Candidate Name',
      ai: aiData?.candidateName?.value || 'Jane Alexandra Doe',
      hr: `${candidate.firstName} ${candidate.lastName}`,
    },
    {
      label: 'Email Address',
      ai: aiData?.email?.value || 'jane.doe@example.com',
      hr: candidate.email,
    },
    {
      label: 'Designation / Job Title',
      ai: aiData?.designation?.value || 'Staff Software Architect',
      hr: jobDetails.jobTitle,
    },
    {
      label: 'Department',
      ai: aiData?.department?.value || 'Cloud Infrastructure',
      hr: jobDetails.department,
    },
    {
      label: 'Work Location',
      ai: aiData?.location?.value || 'San Francisco, CA (Hybrid)',
      hr: jobDetails.workLocation,
    },
    {
      label: 'Proposed Joining Date',
      ai: aiData?.joiningDate?.value || '2026-11-16',
      hr: jobDetails.proposedJoiningDate,
    },
    {
      label: 'Annual Base Salary',
      ai: `$${Number(aiData?.baseSalary?.value || 165000).toLocaleString()}`,
      hr: `$${compensation.baseSalary.toLocaleString()} ${compensation.currency}`,
    },
    {
      label: 'Total Package (CTC)',
      ai: `$${Number(aiData?.totalCtc?.value || 215000).toLocaleString()}`,
      hr: `$${compensation.totalCtc.toLocaleString()} ${compensation.currency}`,
    },
    {
      label: 'Notice Period',
      ai: '30 days standard',
      hr: `${terms.noticePeriodDays} calendar days`,
    },
    {
      label: 'Probation Period',
      ai: '90 days standard',
      hr: `${terms.probationDurationDays} calendar days`,
    },
  ];

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
            10
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Final HR Review & Authority Authorization</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4, marginLeft: 38 }}>
          Comprehensive legal reconciliation: Review side-by-side data, audit human overrides, and sign off for binding offer issuance.
        </p>
      </div>

      {/* Pre-Generation Audit Status Banner */}
      {preGenAuditResult && (
        <div
          className="glass-panel"
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background:
              preGenAuditResult.status === 'PASS'
                ? 'rgba(16, 185, 129, 0.08)'
                : preGenAuditResult.status === 'WARNING'
                ? 'rgba(245, 158, 11, 0.08)'
                : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${
              preGenAuditResult.status === 'PASS'
                ? 'rgba(16, 185, 129, 0.4)'
                : preGenAuditResult.status === 'WARNING'
                ? 'rgba(245, 158, 11, 0.4)'
                : 'rgba(239, 68, 68, 0.4)'
            }`,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {preGenAuditResult.status === 'PASS' ? (
                <CheckCircle2 size={20} color="#10b981" />
              ) : preGenAuditResult.status === 'WARNING' ? (
                <AlertTriangle size={20} color="#f59e0b" />
              ) : (
                <AlertCircle size={20} color="#ef4444" />
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: '0.9375rem', color: '#fff' }}>
                    Pre-Generation Compliance Audit:
                  </strong>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      background:
                        preGenAuditResult.status === 'PASS'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : preGenAuditResult.status === 'WARNING'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                      color:
                        preGenAuditResult.status === 'PASS'
                          ? '#34d399'
                          : preGenAuditResult.status === 'WARNING'
                          ? '#fbbf24'
                          : '#f87171',
                    }}
                  >
                    {preGenAuditResult.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {preGenAuditResult.summary}
                </div>
              </div>
            </div>

            {onJumpToStep && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onJumpToStep(9)}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                <span>View Full Audit in Step 9</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>

          {/* If REVIEW_REQUIRED, display the critical blockers */}
          {preGenAuditResult.criticalIssuesCount > 0 && (
            <div
              style={{
                marginTop: 6,
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '3px solid #ef4444',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ color: '#fca5a5', fontWeight: 700, marginBottom: 4 }}>
                {preGenAuditResult.criticalIssuesCount} Blocking Issue(s) Detected (AI Flags Issues, Silently Modifies Nothing):
              </div>
              <ul style={{ paddingLeft: 18, color: 'var(--text-main)', margin: 0 }}>
                {preGenAuditResult.allIssues
                  .filter((i) => i.severity === 'CRITICAL')
                  .map((iss) => (
                    <li key={iss.id} style={{ marginBottom: 4 }}>
                      <strong>{iss.title}:</strong> {iss.issue} — <em>{iss.recommendation}</em>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Side-by-Side Reconciliation Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="var(--primary)" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Contractual Data Reconciliation Ledger</h4>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            10 Key Legal Terms Reconciled
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>Offer Parameter</th>
              <th style={{ padding: '10px 14px', color: '#c084fc' }}>
                <span className="ai-badge" style={{ fontSize: '0.6875rem' }}>AI Suggested (Advisory)</span>
              </th>
              <th style={{ padding: '10px 14px', color: '#34d399' }}>
                <span className="hr-badge" style={{ fontSize: '0.6875rem' }}>HR Confirmed (Legal Contract)</span>
              </th>
              <th style={{ padding: '10px 14px', color: 'var(--text-muted)', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {comparisonItems.map((item, idx) => {
              const isMatch = String(item.ai).replace(/[\$,\s]/g, '') === String(item.hr).replace(/[\$,\s]/g, '');

              return (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {item.label}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                    {item.ai}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#fff', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {item.hr}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    {isMatch ? (
                      <span style={{ color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={13} />
                        <span>Accepted</span>
                      </span>
                    ) : (
                      <span style={{ color: '#fbbf24', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Edit2 size={13} />
                        <span>HR Modified</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Human Override Audit Trail */}
      {overrides.length > 0 && (
        <div
          className="glass-panel"
          style={{
            padding: 20,
            background: 'rgba(245, 158, 11, 0.04)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Clock size={16} color="#f59e0b" />
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f59e0b' }}>
              Immutable Human Override Audit Ledger ({overrides.length})
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {overrides.map((ov, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                }}
              >
                <div>
                  <strong style={{ color: '#fff' }}>{ov.fieldLabel}</strong>: Changed from{' '}
                  <span style={{ textDecoration: 'line-through', color: '#f87171' }}>"{String(ov.aiValue)}"</span> to{' '}
                  <span style={{ color: '#34d399', fontWeight: 700 }}>"{String(ov.hrValue)}"</span>
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                  Reason: {ov.reason || 'Manual HR adjustment'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sign-off & Authority Commitment Card */}
      <div
        className="glass-panel"
        style={{
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          background: 'var(--bg-tertiary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={20} color="var(--success)" />
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>HR Authority Sign-Off & Approvers</h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="form-label">Assigned Talent Partner / Recruiter</label>
            <select
              className="form-select"
              value={recruiterId}
              onChange={(e) => onUpdateSignOff({ recruiterId: e.target.value, approverId, approvalNotes, isConfirmed })}
            >
              <option value="usr_hr_002">Sarah Jenkins (Lead HR Partner)</option>
              <option value="usr_rec_003">David Kim (Talent Acquisition Lead)</option>
              <option value="usr_admin_001">Alex Vance (Head of People)</option>
            </select>
          </div>

          <div>
            <label className="form-label">Department Executive Approver</label>
            <select
              className="form-select"
              value={approverId}
              onChange={(e) => onUpdateSignOff({ recruiterId, approverId: e.target.value, approvalNotes, isConfirmed })}
            >
              <option value="usr_eng_vp">Marcus Vance (VP of Engineering)</option>
              <option value="usr_fin_cfo">Rachel Sterling (Chief Financial Officer)</option>
              <option value="usr_ceo">Elena Rostova (Chief Executive Officer)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Approval & Governance Notes (Internal Ledger)</label>
          <textarea
            className="form-textarea"
            rows={2}
            value={approvalNotes}
            onChange={(e) => onUpdateSignOff({ recruiterId, approverId, approvalNotes: e.target.value, isConfirmed })}
            placeholder="e.g. Compensation approved per Q4 headcount budget. Candidate background check completed."
          />
        </div>

        {/* Legal Sign-Off Checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '14px 16px',
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--hr-border)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={(e) => onUpdateSignOff({ recruiterId, approverId, approvalNotes, isConfirmed: e.target.checked })}
            style={{ marginTop: 3, cursor: 'pointer', accentColor: 'var(--success)' }}
          />
          <div style={{ fontSize: '0.8125rem', color: '#f8fafc', lineHeight: 1.5 }}>
            <strong>I hereby ratify and authorize this employment offer:</strong> I certify that all AI extracted items have been verified, compensation adheres to approved pay bands, and this document represents the authoritative legal offer of Acme Technologies Inc.
          </div>
        </label>
      </div>
    </div>
  );
};
