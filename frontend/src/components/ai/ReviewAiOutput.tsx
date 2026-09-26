import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Copy,
  AlertCircle,
  HelpCircle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { AiAdvisoryBadge, HrConfirmedBadge } from '../common/Badge.js';
import { AiCandidateExtractionData, HrConfirmedTerms } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

interface ReviewAiOutputProps {
  aiData: AiCandidateExtractionData;
  onConfirmAndSave: (confirmedTerms: HrConfirmedTerms, overrides: any[]) => void;
}

export const ReviewAiOutput: React.FC<ReviewAiOutputProps> = ({
  aiData,
  onConfirmAndSave,
}) => {
  const { success, warning } = useToast();

  // HR confirmed state initialized from AI suggestions
  const [confirmedTerms, setConfirmedTerms] = useState<HrConfirmedTerms>({
    candidateName: aiData.candidateName.value || '',
    email: aiData.email.value || '',
    phone: aiData.phone.value || '',
    offeredRole: aiData.offeredRole.value || '',
    department: aiData.department.value || 'Engineering',
    workLocation: 'San Francisco, CA (Hybrid)',
    employmentType: 'FULL_TIME',
    proposedJoiningDate: aiData.proposedJoiningDate.value || '2026-11-01',
    currency: aiData.currency.value || 'USD',
    baseSalary: aiData.baseSalary.value || 0,
    hraAllowance: aiData.hraAllowance.value || 0,
    specialAllowances: aiData.specialAllowances.value || 0,
    performanceBonus: aiData.performanceBonus.value || 0,
    joiningBonus: aiData.joiningBonus.value || 0,
    totalCtc: aiData.totalCtc.value || 0,
  });

  const [overrideReasons, setOverrideReasons] = useState<Record<string, string>>({});

  const updateField = (field: keyof HrConfirmedTerms, value: any) => {
    setConfirmedTerms((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-recalculate total CTC if compensation components change
      if (['baseSalary', 'hraAllowance', 'specialAllowances', 'performanceBonus', 'joiningBonus'].includes(field)) {
        updated.totalCtc =
          Number(updated.baseSalary || 0) +
          Number(updated.hraAllowance || 0) +
          Number(updated.specialAllowances || 0) +
          Number(updated.performanceBonus || 0) +
          Number(updated.joiningBonus || 0);
      }
      return updated;
    });
  };

  const copyAllFromAi = () => {
    setConfirmedTerms({
      candidateName: aiData.candidateName.value || '',
      email: aiData.email.value || '',
      phone: aiData.phone.value || '',
      offeredRole: aiData.offeredRole.value || '',
      department: aiData.department.value || 'Engineering',
      workLocation: 'San Francisco, CA (Hybrid)',
      employmentType: 'FULL_TIME',
      proposedJoiningDate: aiData.proposedJoiningDate.value || '2026-11-01',
      currency: aiData.currency.value || 'USD',
      baseSalary: aiData.baseSalary.value || 0,
      hraAllowance: aiData.hraAllowance.value || 0,
      specialAllowances: aiData.specialAllowances.value || 0,
      performanceBonus: aiData.performanceBonus.value || 0,
      joiningBonus: aiData.joiningBonus.value || 0,
      totalCtc: aiData.totalCtc.value || 0,
    });
    success('All AI suggested values copied into HR Confirmed fields');
  };

  const handleFinalSubmit = () => {
    if (!confirmedTerms.candidateName || !confirmedTerms.offeredRole || confirmedTerms.baseSalary <= 0) {
      warning('Please ensure Candidate Name, Role, and Base Salary are filled before confirming.');
      return;
    }

    // Calculate human overrides
    const overridesList = [];
    if (aiData.baseSalary.value !== confirmedTerms.baseSalary) {
      overridesList.push({
        field: 'baseSalary',
        aiValue: aiData.baseSalary.value,
        hrValue: confirmedTerms.baseSalary,
        reason: overrideReasons['baseSalary'] || 'HR market band adjustment',
      });
    }

    onConfirmAndSave(confirmedTerms, overridesList);
    success('HR Confirmed terms saved with legal authority!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner explaining Data Segregation */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <AiAdvisoryBadge confidence={aiData.overallConfidenceScore} label="AI Extracted" />
            <ArrowRight size={16} style={{ color: 'var(--text-dim)' }} />
            <HrConfirmedBadge label="HR Legal Review" />
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            AI extracts data to assist HR. Only values in the <strong>HR Confirmed</strong> panel will appear on the final offer letter.
          </span>
        </div>
        <Button variant="secondary" icon={<Copy size={14} />} onClick={copyAllFromAi} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
          Copy All from AI
        </Button>
      </div>

      {/* Side-by-Side Review Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* ========================================================================= */}
        {/* COLUMN 1: AI SUGGESTED TERMS (ADVISORY) */}
        {/* ========================================================================= */}
        <div
          className="glass-panel"
          style={{
            padding: 24,
            border: '1px dashed var(--ai-border)',
            background: 'rgba(139, 92, 246, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} style={{ color: 'var(--ai-purple)' }} />
              <h4 style={{ fontSize: '1.1rem' }}>AI Suggested Terms</h4>
            </div>
            <AiAdvisoryBadge confidence={aiData.overallConfidenceScore} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Candidate Name */}
            <div className="ai-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span className="form-label">Candidate Name:</span>
                <span style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 600 }}>
                  {Math.round(aiData.candidateName.confidenceScore * 100)}% confidence
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                {aiData.candidateName.value || <span style={{ color: 'var(--text-dim)' }}>Not detected</span>}
              </div>
              {aiData.candidateName.sourceSnippet && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4 }}>
                  Quote: <em>"{aiData.candidateName.sourceSnippet}"</em>
                </div>
              )}
            </div>

            {/* Email & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="ai-box">
                <div className="form-label">Email:</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{aiData.email.value || 'N/A'}</div>
              </div>
              <div className="ai-box">
                <div className="form-label">Phone:</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{aiData.phone.value || 'N/A'}</div>
              </div>
            </div>

            {/* Role & Department */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="ai-box">
                <div className="form-label">Offered Role:</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{aiData.offeredRole.value || 'N/A'}</div>
              </div>
              <div className="ai-box">
                <div className="form-label">Department:</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{aiData.department.value || 'N/A'}</div>
              </div>
            </div>

            {/* Suggested Compensation Breakdown */}
            <div className="ai-box" style={{ background: 'rgba(168, 85, 247, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#c084fc' }}>
                  Suggested Compensation ({aiData.currency.value || 'USD'})
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Confidence Weighted</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Base Salary:</span>
                  <span style={{ fontWeight: 600 }}>${(aiData.baseSalary.value || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Housing Allowance:</span>
                  <span style={{ fontWeight: 600 }}>${(aiData.hraAllowance.value || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Special Allowance:</span>
                  <span style={{ fontWeight: 600 }}>${(aiData.specialAllowances.value || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Performance Bonus:</span>
                  <span style={{ fontWeight: 600 }}>${(aiData.performanceBonus.value || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Joining Sign-on:</span>
                  <span style={{ fontWeight: 600 }}>${(aiData.joiningBonus.value || 0).toLocaleString()}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: 8,
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  <span>AI Suggested Total CTC:</span>
                  <span style={{ color: '#c084fc' }}>${(aiData.totalCtc.value || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: HR CONFIRMED TERMS (LEGAL AUTHORITY) */}
        {/* ========================================================================= */}
        <div
          className="glass-panel"
          style={{
            padding: 24,
            border: '1px solid var(--hr-border)',
            background: 'rgba(16, 185, 129, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={20} style={{ color: 'var(--hr-emerald)' }} />
              <h4 style={{ fontSize: '1.1rem' }}>HR Confirmed Terms</h4>
            </div>
            <HrConfirmedBadge label="Binding Authority" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Candidate Name */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Confirmed Candidate Name *</label>
              <input
                type="text"
                className="form-input"
                value={confirmedTerms.candidateName}
                onChange={(e) => updateField('candidateName', e.target.value)}
                style={{ borderColor: 'var(--hr-border)' }}
              />
            </div>

            {/* Email & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Confirmed Email *</label>
                <input
                  type="email"
                  className="form-input"
                  value={confirmedTerms.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Confirmed Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={confirmedTerms.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
            </div>

            {/* Role & Department */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={confirmedTerms.offeredRole}
                  onChange={(e) => updateField('offeredRole', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Department *</label>
                <input
                  type="text"
                  className="form-input"
                  value={confirmedTerms.department}
                  onChange={(e) => updateField('department', e.target.value)}
                />
              </div>
            </div>

            {/* Confirmed Compensation Inputs */}
            <div className="hr-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#34d399' }}>
                  Confirmed Legal Compensation (USD)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Editable with Audit Trail
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Base Salary ($):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={confirmedTerms.baseSalary}
                    onChange={(e) => updateField('baseSalary', Number(e.target.value))}
                  />
                  {aiData.baseSalary.value !== confirmedTerms.baseSalary && (
                    <span style={{ fontSize: '0.68rem', color: '#fbbf24', marginTop: 2 }}>
                      ⚠️ Overridden (AI was ${aiData.baseSalary.value?.toLocaleString()})
                    </span>
                  )}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Housing Allowance ($):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={confirmedTerms.hraAllowance}
                    onChange={(e) => updateField('hraAllowance', Number(e.target.value))}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Special Allowance ($):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={confirmedTerms.specialAllowances}
                    onChange={(e) => updateField('specialAllowances', Number(e.target.value))}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Bonus Target ($):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={confirmedTerms.performanceBonus}
                    onChange={(e) => updateField('performanceBonus', Number(e.target.value))}
                  />
                </div>

                <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Signing / Joining Bonus ($):</label>
                  <input
                    type="number"
                    className="form-input"
                    value={confirmedTerms.joiningBonus}
                    onChange={(e) => updateField('joiningBonus', Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Total Confirmed CTC Banner */}
              <div
                style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--hr-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>
                  Confirmed Annual CTC:
                </span>
                <span style={{ fontWeight: 800, fontSize: '1.125rem', color: '#34d399' }}>
                  ${confirmedTerms.totalCtc.toLocaleString()} USD
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation & Save Action Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={18} style={{ color: 'var(--hr-emerald)' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Human review completed. This record will generate an official offer document snapshot.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="primary" icon={<Save size={16} />} onClick={handleFinalSubmit}>
            Confirm Terms & Save Draft Offer
          </Button>
        </div>
      </div>
    </div>
  );
};
