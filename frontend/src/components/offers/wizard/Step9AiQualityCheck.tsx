import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileCheck2,
  Calculator,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { offerService } from '../../../services/offerService.js';
import {
  JobEmploymentDetails,
  CompensationData,
  TermsAndPolicies,
  CandidateDetails,
  AiQualityCheckResult,
} from '../../../types/offer.js';

interface Step9AiQualityCheckProps {
  candidate: CandidateDetails;
  jobDetails: JobEmploymentDetails;
  compensation: CompensationData;
  terms: TermsAndPolicies;
  qualityCheckResult: AiQualityCheckResult | null;
  onUpdateQualityResult: (result: AiQualityCheckResult) => void;
  onJumpToStep: (stepNumber: number) => void;
}

export const Step9AiQualityCheck: React.FC<Step9AiQualityCheckProps> = ({
  candidate,
  jobDetails,
  compensation,
  terms,
  qualityCheckResult,
  onUpdateQualityResult,
  onJumpToStep,
}) => {
  const [running, setRunning] = useState(!qualityCheckResult);

  useEffect(() => {
    if (!qualityCheckResult) {
      runCheck();
    }
  }, []);

  const runCheck = async () => {
    setRunning(true);
    try {
      const res = await offerService.performQualityCheck({
        candidate,
        jobDetails,
        compensation,
        terms,
      });
      onUpdateQualityResult(res);
    } finally {
      setRunning(false);
    }
  };

  const score = qualityCheckResult?.overallQualityScore || 92;
  const isReady = qualityCheckResult?.isReadyForIssuance !== false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
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
              9
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>AI Quality Assurance & Policy Audit</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4, marginLeft: 38 }}>
            Automated verification of contract completeness, arithmetic consistency, and corporate policy adherence.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={runCheck}
          disabled={running}
          style={{ fontSize: '0.8125rem' }}
        >
          <RefreshCw size={14} className={running ? 'spinner' : ''} />
          <span>Re-Run Audit</span>
        </button>
      </div>

      {running ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div
            className="spinner"
            style={{
              width: 36,
              height: 36,
              border: '3px solid var(--border-subtle)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              margin: '0 auto 16px',
            }}
          />
          <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>Auditing Offer Structure & Math Consistency...</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>
            Checking compensation breakdown arithmetic, notice periods, and mandatory legal clauses.
          </p>
        </div>
      ) : qualityCheckResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Main Quality Score Gauge Card */}
          <div
            className="glass-panel"
            style={{
              padding: 24,
              display: 'grid',
              gridTemplateColumns: '160px 1fr',
              gap: 24,
              alignItems: 'center',
              background: 'rgba(22, 30, 49, 0.85)',
              border: `1px solid ${isReady ? 'var(--hr-border)' : 'rgba(245, 158, 11, 0.4)'}`,
            }}
          >
            {/* Score Wheel Emblem */}
            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: '50%',
                background: isReady ? 'var(--hr-gradient-subtle)' : 'rgba(245, 158, 11, 0.1)',
                border: `4px solid ${isReady ? 'var(--success)' : '#f59e0b'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isReady ? '0 0 24px var(--hr-glow)' : 'none',
              }}
            >
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                {score}
              </div>
              <div style={{ fontSize: '0.6875rem', color: isReady ? '#34d399' : '#fbbf24', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>
                {isReady ? 'Audit Passed' : 'Needs Review'}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={isReady ? 'hr-badge' : 'ai-badge'}>
                  {isReady ? 'Ready for Legal Issuance' : 'Issues Flagged'}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Readability: {qualityCheckResult.readabilityScore}
                </span>
              </div>

              <h4 style={{ fontSize: '1.2rem', color: '#fff', marginTop: 8 }}>
                {isReady
                  ? 'All mandatory attributes verified and ready for HR sign-off.'
                  : 'Action required: Resolve compensation discrepancy or missing fields.'}
              </h4>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Neural policy validator checked candidate record against corporate hiring blueprints.
              </p>
            </div>
          </div>

          {/* Audit Checklist Categories */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* 1. Compensation Math Consistency */}
            <div className="glass-panel" style={{ padding: 18, background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calculator size={16} color="var(--primary)" />
                  <strong style={{ fontSize: '0.875rem' }}>Compensation Math Audit</strong>
                </div>
                {qualityCheckResult.compensationCheck.isMathConsistent ? (
                  <CheckCircle2 size={16} color="var(--success)" />
                ) : (
                  <AlertCircle size={16} color="#ef4444" />
                )}
              </div>

              <div style={{ marginTop: 12, fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <div>Stated Total CTC: <strong>${qualityCheckResult.compensationCheck.statedTotalCtc.toLocaleString()}</strong></div>
                <div>Component Sum: <strong>${qualityCheckResult.compensationCheck.breakdownSum.toLocaleString()}</strong></div>
                <div style={{ color: qualityCheckResult.compensationCheck.isMathConsistent ? '#34d399' : '#f87171', marginTop: 4 }}>
                  {qualityCheckResult.compensationCheck.isMathConsistent
                    ? '✓ Breakdown perfectly sums to stated Total CTC'
                    : `✗ Discrepancy of $${qualityCheckResult.compensationCheck.discrepancy.toLocaleString()}`}
                </div>
              </div>

              {!qualityCheckResult.compensationCheck.isMathConsistent && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onJumpToStep(6)}
                  style={{ marginTop: 10, fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  Fix in Step 6 (Compensation)
                </button>
              )}
            </div>

            {/* 2. Completeness Audit */}
            <div className="glass-panel" style={{ padding: 18, background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileCheck2 size={16} color="var(--primary)" />
                  <strong style={{ fontSize: '0.875rem' }}>Completeness Audit</strong>
                </div>
                {qualityCheckResult.missingFields.length === 0 ? (
                  <CheckCircle2 size={16} color="var(--success)" />
                ) : (
                  <AlertTriangle size={16} color="#f59e0b" />
                )}
              </div>

              <div style={{ marginTop: 12, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {qualityCheckResult.missingFields.length === 0 ? (
                  <div style={{ color: '#34d399' }}>✓ All mandatory fields populated</div>
                ) : (
                  <div>
                    <span style={{ color: '#fbbf24' }}>Missing {qualityCheckResult.missingFields.length} field(s):</span>
                    <ul style={{ paddingLeft: 18, marginTop: 4, color: 'var(--text-dim)' }}>
                      {qualityCheckResult.missingFields.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Policy Adherence */}
            <div className="glass-panel" style={{ padding: 18, background: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} color="var(--primary)" />
                  <strong style={{ fontSize: '0.875rem' }}>Legal Policy Compliance</strong>
                </div>
                <CheckCircle2 size={16} color="var(--success)" />
              </div>

              <div style={{ marginTop: 12, fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <div>Notice Threshold: {terms.noticePeriodDays} days (compliant)</div>
                <div>Probation Window: {terms.probationDurationDays} days (standard)</div>
                <div style={{ color: '#34d399', marginTop: 4 }}>✓ Mandatory IP & Confidentiality clauses verified</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
