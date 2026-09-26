import React, { useState } from 'react';
import { AlertCircle, Plus, Check } from 'lucide-react';
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

  // Check explicit missingFields array or low confidence fields
  const missingItems: Array<{ fieldKey: string; label: string; issue: string }> = [];

  if (aiData.missingFields && aiData.missingFields.length > 0) {
    for (const field of aiData.missingFields) {
      missingItems.push({
        fieldKey: field.toLowerCase().replace(/\s+/g, ''),
        label: field,
        issue: 'Absent in source document — AI did not assume this value',
      });
    }
  } else {
    // Fallback checks
    if (!aiData.phone?.value || aiData.phone?.confidenceScore < 0.75) {
      missingItems.push({
        fieldKey: 'phone',
        label: 'Candidate Phone Number',
        issue: 'Not clearly specified in source document',
      });
    }
    if (!aiData.joiningDate?.value || aiData.joiningDate?.confidenceScore < 0.7) {
      missingItems.push({
        fieldKey: 'joiningDate',
        label: 'Proposed Joining Date',
        issue: 'Joining timeline omitted or ambiguous',
      });
    }
    if (!aiData.address?.value) {
      missingItems.push({
        fieldKey: 'address',
        label: 'Residential Address',
        issue: 'Address omitted from uploaded document',
      });
    }
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
        <h4 style={{ fontSize: '0.9375rem', color: '#fbbf24' }}>
          Unassumed Missing Information ({missingItems.length} fields)
        </h4>
      </div>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 14 }}>
        In compliance with the <strong>Strict Non-Assumption Rule</strong>, the AI did not fabricate or estimate these missing values.
        You may provide them manually below or directly in the HR review table:
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
        {missingItems.map((item) => (
          <div
            key={item.fieldKey}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#fff' }}>{item.label}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{item.issue}</div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="form-input"
                placeholder={`Enter ${item.label}...`}
                style={{ padding: '6px 10px', fontSize: '0.8125rem', flex: 1 }}
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
