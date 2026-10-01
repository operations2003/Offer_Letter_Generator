import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Check,
  Edit2,
  X,
  AlertTriangle,
  ArrowRight,
  Save,
  CheckCheck,
  RotateCcw,
  Info,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { AiAdvisoryBadge, HrConfirmedBadge } from '../common/Badge.js';
import {
  AiCandidateExtractionData,
  HrConfirmedTerms,
  FieldDecision,
  HumanOverrideItem,
} from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

interface ReviewAiOutputProps {
  aiData: AiCandidateExtractionData;
  onConfirmAndSave: (confirmedTerms: HrConfirmedTerms, overrides: HumanOverrideItem[]) => void;
}

interface FieldConfig {
  key: keyof HrConfirmedTerms;
  label: string;
  category: 'profile' | 'qualifications' | 'role' | 'compensation';
  type: 'text' | 'number' | 'date';
  required?: boolean;
}

const FIELDS_LIST: FieldConfig[] = [
  // 1. Candidate Personal & Contact
  { key: 'candidateName', label: 'Candidate Name', category: 'profile', type: 'text', required: true },
  { key: 'email', label: 'Email Address', category: 'profile', type: 'text', required: true },
  { key: 'phone', label: 'Phone Number', category: 'profile', type: 'text' },
  { key: 'address', label: 'Residential Address', category: 'profile', type: 'text' },

  // 2. Qualifications & Experience
  { key: 'qualification', label: 'Qualification / Education', category: 'qualifications', type: 'text' },
  { key: 'experience', label: 'Work Experience', category: 'qualifications', type: 'text' },

  // 3. Proposed Role & Organization
  { key: 'designation', label: 'Designation / Job Title', category: 'role', type: 'text', required: true },
  { key: 'department', label: 'Department', category: 'role', type: 'text', required: true },
  { key: 'location', label: 'Work Location / Arrangement', category: 'role', type: 'text' },
  { key: 'joiningDate', label: 'Proposed Joining Date', category: 'role', type: 'text' },
  { key: 'employmentType', label: 'Employment Type', category: 'role', type: 'text' },
  { key: 'reportingManager', label: 'Reporting Manager', category: 'role', type: 'text' },
  { key: 'otherDetails', label: 'Other Relevant Details', category: 'role', type: 'text' },

  // 4. Compensation Terms
  { key: 'baseSalary', label: 'Annual Base Salary', category: 'compensation', type: 'number', required: true },
  { key: 'hraAllowance', label: 'Housing Allowance (HRA)', category: 'compensation', type: 'number' },
  { key: 'specialAllowances', label: 'Special / Remote Allowances', category: 'compensation', type: 'number' },
  { key: 'performanceBonus', label: 'Performance Bonus Target', category: 'compensation', type: 'number' },
  { key: 'joiningBonus', label: 'Sign-on / Joining Bonus', category: 'compensation', type: 'number' },
  { key: 'totalCtc', label: 'Total Annual CTC', category: 'compensation', type: 'number', required: true },
];

export const ReviewAiOutput: React.FC<ReviewAiOutputProps> = ({
  aiData,
  onConfirmAndSave,
}) => {
  const { success, warning, info } = useToast();

  // Helper to extract initial value from AI data
  const getAiFieldValue = (key: keyof HrConfirmedTerms): any => {
    switch (key) {
      case 'candidateName': return aiData.candidateName?.value || '';
      case 'email': return aiData.email?.value || '';
      case 'phone': return aiData.phone?.value || '';
      case 'address': return aiData.address?.value || '';
      case 'qualification': return aiData.qualification?.value || '';
      case 'experience': return aiData.experience?.value || '';
      case 'designation': return aiData.designation?.value || '';
      case 'department': return aiData.department?.value || '';
      case 'location': return aiData.location?.value || '';
      case 'joiningDate': return aiData.joiningDate?.value || '';
      case 'employmentType': return aiData.employmentType?.value || '';
      case 'reportingManager': return aiData.reportingManager?.value || '';
      case 'otherDetails': return aiData.otherDetails?.value || '';
      case 'currency': return aiData.currency?.value || 'USD';
      case 'baseSalary': return aiData.baseSalary?.value || 0;
      case 'hraAllowance': return aiData.hraAllowance?.value || 0;
      case 'specialAllowances': return aiData.specialAllowances?.value || 0;
      case 'performanceBonus': return aiData.performanceBonus?.value || 0;
      case 'joiningBonus': return aiData.joiningBonus?.value || 0;
      case 'totalCtc': return aiData.totalCtc?.value || 0;
      default: return '';
    }
  };

  const getAiFieldMeta = (key: keyof HrConfirmedTerms) => {
    switch (key) {
      case 'candidateName': return aiData.candidateName;
      case 'email': return aiData.email;
      case 'phone': return aiData.phone;
      case 'address': return aiData.address;
      case 'qualification': return aiData.qualification;
      case 'experience': return aiData.experience;
      case 'designation': return aiData.designation;
      case 'department': return aiData.department;
      case 'location': return aiData.location;
      case 'joiningDate': return aiData.joiningDate;
      case 'employmentType': return aiData.employmentType;
      case 'reportingManager': return aiData.reportingManager;
      case 'otherDetails': return aiData.otherDetails;
      case 'baseSalary': return aiData.baseSalary;
      case 'hraAllowance': return aiData.hraAllowance;
      case 'specialAllowances': return aiData.specialAllowances;
      case 'performanceBonus': return aiData.performanceBonus;
      case 'joiningBonus': return aiData.joiningBonus;
      case 'totalCtc': return aiData.totalCtc;
      default: return null;
    }
  };

  // State: HR Confirmed Values
  const [confirmedTerms, setConfirmedTerms] = useState<HrConfirmedTerms>(() => {
    const init: any = { currency: aiData.currency?.value || 'USD' };
    for (const f of FIELDS_LIST) {
      init[f.key] = getAiFieldValue(f.key);
    }
    return init;
  });

  // State: Per-field decision: 'PENDING' | 'ACCEPTED' | 'EDITED' | 'REJECTED'
  const [decisions, setDecisions] = useState<Record<string, FieldDecision>>(() => {
    const initialDecisions: Record<string, FieldDecision> = {};
    for (const f of FIELDS_LIST) {
      const meta = getAiFieldMeta(f.key);
      if (meta && meta.isDetected && meta.confidenceScore >= 0.85) {
        initialDecisions[f.key] = 'ACCEPTED';
      } else {
        initialDecisions[f.key] = 'PENDING';
      }
    }
    return initialDecisions;
  });

  // State: Override reasons
  const [overrideReasons, setOverrideReasons] = useState<Record<string, string>>({});

  // Decision Handlers
  const handleAccept = (fieldKey: keyof HrConfirmedTerms) => {
    const aiVal = getAiFieldValue(fieldKey);
    setConfirmedTerms((prev) => ({ ...prev, [fieldKey]: aiVal }));
    setDecisions((prev) => ({ ...prev, [fieldKey]: 'ACCEPTED' }));
  };

  const handleReject = (fieldKey: keyof HrConfirmedTerms) => {
    setConfirmedTerms((prev) => ({
      ...prev,
      [fieldKey]: typeof prev[fieldKey] === 'number' ? 0 : '',
    }));
    setDecisions((prev) => ({ ...prev, [fieldKey]: 'REJECTED' }));
  };

  const handleEditChange = (fieldKey: keyof HrConfirmedTerms, value: any) => {
    setConfirmedTerms((prev) => {
      const updated = { ...prev, [fieldKey]: value };
      // Auto-recalculate total CTC
      if (['baseSalary', 'hraAllowance', 'specialAllowances', 'performanceBonus', 'joiningBonus'].includes(fieldKey)) {
        updated.totalCtc =
          Number(updated.baseSalary || 0) +
          Number(updated.hraAllowance || 0) +
          Number(updated.specialAllowances || 0) +
          Number(updated.performanceBonus || 0) +
          Number(updated.joiningBonus || 0);
      }
      return updated;
    });

    setDecisions((prev) => ({ ...prev, [fieldKey]: 'EDITED' }));
  };

  // Bulk Actions
  const handleAcceptAllHighConfidence = () => {
    const updatedDecisions = { ...decisions };
    const updatedTerms: any = { ...confirmedTerms };

    for (const f of FIELDS_LIST) {
      const meta = getAiFieldMeta(f.key);
      if (meta && meta.isDetected && meta.confidenceScore >= 0.8) {
        updatedDecisions[f.key] = 'ACCEPTED';
        updatedTerms[f.key] = getAiFieldValue(f.key);
      }
    }

    setDecisions(updatedDecisions);
    setConfirmedTerms(updatedTerms);
    success('Accepted all AI suggestions with confidence score ≥ 80%');
  };

  const handleAcceptAllDetected = () => {
    const updatedDecisions = { ...decisions };
    const updatedTerms: any = { ...confirmedTerms };

    for (const f of FIELDS_LIST) {
      const meta = getAiFieldMeta(f.key);
      if (meta && meta.isDetected) {
        updatedDecisions[f.key] = 'ACCEPTED';
        updatedTerms[f.key] = getAiFieldValue(f.key);
      }
    }

    setDecisions(updatedDecisions);
    setConfirmedTerms(updatedTerms);
    success('Accepted all detected AI fields into HR confirmed data');
  };

  const handleResetDecisions = () => {
    const reset: Record<string, FieldDecision> = {};
    for (const f of FIELDS_LIST) {
      reset[f.key] = 'PENDING';
    }
    setDecisions(reset);
    info('Decisions reset to pending');
  };

  // Summary counts
  const acceptedCount = Object.values(decisions).filter((d) => d === 'ACCEPTED').length;
  const editedCount = Object.values(decisions).filter((d) => d === 'EDITED').length;
  const rejectedCount = Object.values(decisions).filter((d) => d === 'REJECTED').length;
  const pendingCount = Object.values(decisions).filter((d) => d === 'PENDING').length;
  const missingCount = aiData.missingFields?.length || 0;

  // Final submission
  const handleConfirmAndSave = () => {
    if (!confirmedTerms.candidateName || !confirmedTerms.designation || confirmedTerms.baseSalary <= 0) {
      warning('Please ensure Candidate Name, Designation, and Base Salary are valid before saving.');
      return;
    }

    // Build human overrides audit list
    const overrides: HumanOverrideItem[] = [];

    for (const f of FIELDS_LIST) {
      const decision = decisions[f.key];
      const aiVal = getAiFieldValue(f.key);
      const hrVal = confirmedTerms[f.key];
      const meta = getAiFieldMeta(f.key);

      if (decision === 'EDITED' || decision === 'REJECTED') {
        overrides.push({
          field: f.key,
          fieldLabel: f.label,
          decision,
          aiValue: aiVal,
          hrValue: hrVal,
          confidenceScore: meta?.confidenceScore || 0,
          reason: overrideReasons[f.key] || (decision === 'REJECTED' ? 'Rejected by HR' : 'Adjusted by HR'),
        });
      }
    }

    onConfirmAndSave(confirmedTerms, overrides);
    success('HR Confirmed Terms saved with full legal audit trail!');
  };

  const renderFieldCard = (field: FieldConfig) => {
    const meta = getAiFieldMeta(field.key);
    const decision = decisions[field.key] || 'PENDING';
    const hrVal = confirmedTerms[field.key];
    const isDetected = meta?.isDetected ?? false;
    const confidencePct = meta ? Math.round(meta.confidenceScore * 100) : 0;

    let badgeColor = '#94a3b8';
    let badgeText = '0% (Not Detected)';
    if (isDetected) {
      if (confidencePct >= 85) {
        badgeColor = '#34d399';
        badgeText = `${confidencePct}% High Confidence`;
      } else if (confidencePct >= 60) {
        badgeColor = '#d97706';
        badgeText = `${confidencePct}% Medium`;
      } else {
        badgeColor = '#dc2626';
        badgeText = `${confidencePct}% Low Confidence`;
      }
    }

    return (
      <div
        key={field.key}
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 16,
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor:
            decision === 'ACCEPTED'
              ? '#f0fdf4'
              : decision === 'EDITED'
              ? '#fffbeb'
              : decision === 'REJECTED'
              ? '#fef2f2'
              : '#ffffff',
          border:
            decision === 'ACCEPTED'
              ? '1px solid #a7f3d0'
              : decision === 'EDITED'
              ? '1px solid #fde68a'
              : decision === 'REJECTED'
              ? '1px solid #fecaca'
              : '1px solid var(--border-subtle)',
          alignItems: 'center',
          transition: 'all 0.15s ease',
        }}
      >
        {/* Left: AI Extracted Suggestion */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>
              {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: badgeColor,
                padding: '2px 8px',
                borderRadius: 9999,
                background: `${badgeColor}15`,
                border: `1px solid ${badgeColor}33`,
              }}
            >
              {badgeText}
            </span>
          </div>

          {/* AI value or Not Detected note */}
          <div style={{ fontSize: '0.85rem', color: isDetected ? '#7c3aed' : '#94a3b8', fontWeight: 600 }}>
            {isDetected ? (
              field.type === 'number'
                ? `$${Number(meta?.value || 0).toLocaleString()} USD`
                : String(meta?.value || '—')
            ) : (
              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 400 }}>
                Not detected in document — AI did not assume this value
              </span>
            )}
          </div>

          {/* Source quote */}
          {meta?.sourceSnippet && meta.sourceSnippet !== 'Not mentioned in document' && (
            <div
              style={{
                fontSize: '0.7rem',
                color: '#64748b',
                marginTop: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Snippet: <em>"{meta.sourceSnippet}"</em>
            </div>
          )}
        </div>

        {/* Right: HR Confirmed Action & Editable Field */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            {/* Input */}
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              className="form-input"
              style={{
                padding: '6px 10px',
                fontSize: '0.8125rem',
                flex: 1,
                backgroundColor: '#ffffff',
                borderColor:
                  decision === 'ACCEPTED'
                    ? '#059669'
                    : decision === 'EDITED'
                    ? '#d97706'
                    : decision === 'REJECTED'
                    ? '#dc2626'
                    : 'var(--border-medium)',
              }}
              value={hrVal === null || hrVal === undefined ? '' : hrVal}
              placeholder={field.required ? 'Enter confirmed value...' : 'Optional / empty'}
              onChange={(e) =>
                handleEditChange(
                  field.key,
                  field.type === 'number' ? Number(e.target.value) : e.target.value
                )
              }
            />

            {/* Accept Button */}
            <button
              type="button"
              title="Accept AI suggestion"
              onClick={() => handleAccept(field.key)}
              style={{
                background: decision === 'ACCEPTED' ? '#059669' : '#f1f5f9',
                border: decision === 'ACCEPTED' ? '1px solid #059669' : '1px solid var(--border-medium)',
                color: decision === 'ACCEPTED' ? '#ffffff' : '#475569',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <Check size={14} />
              <span>Accept</span>
            </button>

            {/* Reject Button */}
            <button
              type="button"
              title="Reject AI suggestion"
              onClick={() => handleReject(field.key)}
              style={{
                background: decision === 'REJECTED' ? '#dc2626' : '#f1f5f9',
                border: decision === 'REJECTED' ? '1px solid #dc2626' : '1px solid var(--border-medium)',
                color: decision === 'REJECTED' ? '#ffffff' : '#475569',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <X size={14} />
              <span>Reject</span>
            </button>
          </div>

          {/* Decision Status Label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 600 }}>
              {decision === 'ACCEPTED' && (
                <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={11} /> Accepted from AI
                </span>
              )}
              {decision === 'EDITED' && (
                <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Edit2 size={11} /> Edited by HR (Override)
                </span>
              )}
              {decision === 'REJECTED' && (
                <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <X size={11} /> Rejected by HR
                </span>
              )}
              {decision === 'PENDING' && (
                <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Info size={11} /> Pending HR review
                </span>
              )}
            </span>

            {decision === 'EDITED' && (
              <input
                type="text"
                placeholder="Reason for edit..."
                value={overrideReasons[field.key] || ''}
                onChange={(e) =>
                  setOverrideReasons((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                style={{
                  fontSize: '0.68rem',
                  padding: '3px 8px',
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#0f172a',
                  width: '140px',
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner: Data Segregation & Stats Bar */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          background: 'linear-gradient(90deg, #f5f3ff 0%, #ecfdf5 100%)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AiAdvisoryBadge confidence={aiData.overallConfidenceScore} label="AI Extracted" />
            <ArrowRight size={16} color="#64748b" />
            <HrConfirmedBadge label="HR Review & Confirmed Data" />
          </div>

          {/* Quick Bulk Action Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="secondary"
              icon={<CheckCheck size={14} />}
              onClick={handleAcceptAllHighConfidence}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              Accept High Confidence (≥80%)
            </Button>
            <Button
              variant="secondary"
              icon={<Check size={14} />}
              onClick={handleAcceptAllDetected}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              Accept All Detected
            </Button>
            <Button
              variant="secondary"
              icon={<RotateCcw size={14} />}
              onClick={handleResetDecisions}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Counter Pills */}
        <div style={{ display: 'flex', gap: 10, fontSize: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ padding: '3px 10px', borderRadius: 9999, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontWeight: 600 }}>
            ✓ Accepted: {acceptedCount}
          </span>
          <span style={{ padding: '3px 10px', borderRadius: 9999, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontWeight: 600 }}>
            ✎ Edited: {editedCount}
          </span>
          <span style={{ padding: '3px 10px', borderRadius: 9999, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 600 }}>
            ✗ Rejected: {rejectedCount}
          </span>
          <span style={{ padding: '3px 10px', borderRadius: 9999, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 600 }}>
            ⏳ Pending: {pendingCount}
          </span>
          {missingCount > 0 && (
            <span style={{ padding: '3px 10px', borderRadius: 9999, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontWeight: 600 }}>
              ⚠️ Missing from Doc: {missingCount}
            </span>
          )}
        </div>
      </div>

      {/* Missing Information Notice */}
      {missingCount > 0 && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            fontSize: '0.8rem',
            color: '#475569',
          }}
        >
          <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ color: '#92400e' }}>AI Non-Assumption Rule Active:</strong> The following fields were
            not explicitly found in the uploaded document and have <strong>not</strong> been guessed by the AI:{' '}
            <span style={{ color: '#0f172a', fontWeight: 600 }}>{aiData.missingFields.join(', ')}</span>.
            Please manually provide them if required for the final offer letter.
          </div>
        </div>
      )}

      {/* Field Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* 1. Candidate Personal & Contact */}
        <div className="card" style={{ padding: 22 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14, color: '#7c3aed' }}>
            1. Candidate Profile & Contact Information
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FIELDS_LIST.filter((f) => f.category === 'profile').map(renderFieldCard)}
          </div>
        </div>

        {/* 2. Qualification & Experience */}
        <div className="card" style={{ padding: 22 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14, color: '#7c3aed' }}>
            2. Qualifications & Professional Background
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FIELDS_LIST.filter((f) => f.category === 'qualifications').map(renderFieldCard)}
          </div>
        </div>

        {/* 3. Proposed Role & Organization */}
        <div className="card" style={{ padding: 22 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 14, color: '#7c3aed' }}>
            3. Proposed Role & Organizational Details
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FIELDS_LIST.filter((f) => f.category === 'role').map(renderFieldCard)}
          </div>
        </div>

        {/* 4. Compensation Terms */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', margin: 0 }}>
              4. Confirmed Compensation Breakdown (USD)
            </h4>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Auto-calculates Total Annual CTC
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FIELDS_LIST.filter((f) => f.category === 'compensation').map(renderFieldCard)}
          </div>
        </div>
      </div>

      {/* Confirmation & Save Bar */}
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
          <ShieldCheck size={20} color="#10b981" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            HR review complete: {acceptedCount} accepted, {editedCount} edited, {rejectedCount} rejected.
          </span>
        </div>

        <Button
          variant="primary"
          icon={<Save size={16} />}
          onClick={handleConfirmAndSave}
          style={{ fontSize: '0.875rem', padding: '10px 20px' }}
        >
          Confirm & Save Final HR Data
        </Button>
      </div>
    </div>
  );
};
