import React, { useState } from 'react';
import { AlertCircle, Check, HelpCircle, Plus } from 'lucide-react';
import { Button } from '../common/Button.js';
import { AiCandidateExtractionData } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';

interface MissingInformationProps {
  aiData: AiCandidateExtractionData;
  onFieldFilled?: (fieldName: string, value: string) => void;
}

export const MissingInformation: React.FC<MissingInformationProps> = ({
  aiData,
  onFieldFilled,
}) => {
  const { success } = useToast();
  const [filledValues, setFilledValues] = useState<Record<string, string>>({});

  // Detect fields where confidence < 0.70 or value is null
  const missingItems: Array<{ fieldKey: string; label: string; issue: string }> = [];

  if (!aiData.phone.value || aiData.phone.confidenceScore < 0.75) {
    missingItems.push({
      fieldKey: 'phone',
      label: 'Candidate Phone Number',
      issue: 'Not clearly specified in resume text',
    });
  }

  if (!aiData.proposedJoiningDate.value || aiData.proposedJoiningDate.confidenceScore < 0.7) {
    missingItems.push({
      fieldKey: 'proposedJoiningDate',
      label: 'Proposed Joining Date',
      issue: 'Joining timeline omitted or ambiguous',
    });
  }

  if (!aiData.currentEmployer.value || aiData.currentEmployer.confidenceScore < 0.7) {
    missingItems.push({
      fieldKey: 'currentEmployer',
      label: 'Current Employer',
      issue: 'Previous employment history unclear',
    });
  }

  if (missingItems.length === 0) {
    return null;
  }

  const handleSaveField = (key: string) => {
    const val = filledValues[key];
    if (val && onFieldFilled) {
      onFieldFilled(key, val);
      success(`Added ${key}: ${val}`);
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: 20,
        border: '1px solid rgba(245, 158, 11, 0.3)',
        background: 'rgba(245, 158, 11, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
        <h4 style={{ fontSize: '0.9375rem', color: '#fbbf24' }}>
          Missing or Low-Confidence Information ({missingItems.length})
        </h4>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 16 }}>
        The AI model flagged the following attributes as absent or below the 70% confidence
        threshold. Please provide these manual inputs:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {missingItems.map((item) => (
          <div
            key={item.fieldKey}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ minWidth: 200 }}>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{item.issue}</div>
            </div>

            <div style={{ display: 'flex', gap: 8, flex: 1, maxWidth: 360 }}>
              <input
                type="text"
                className="form-input"
                placeholder={`Enter ${item.label}...`}
                style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
                value={filledValues[item.fieldKey] || ''}
                onChange={(e) =>
                  setFilledValues((prev) => ({ ...prev, [item.fieldKey]: e.target.value }))
                }
              />
              <Button
                variant="primary"
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                onClick={() => handleSaveField(item.fieldKey)}
              >
                Save
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
