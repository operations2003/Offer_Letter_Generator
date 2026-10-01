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
  Calendar,
  Layers,
  FileCode,
  FileQuestion,
  HelpCircle,
  Info,
} from 'lucide-react';
import { offerService } from '../../../services/offerService.js';
import {
  JobEmploymentDetails,
  CompensationData,
  TermsAndPolicies,
  CandidateDetails,
  AiQualityCheckResult,
  PreGenerationCheckResult,
  PreGenerationCheckCategory,
  PreGenerationStatus,
} from '../../../types/offer.js';

interface Step9AiQualityCheckProps {
  candidate: CandidateDetails;
  jobDetails: JobEmploymentDetails;
  compensation: CompensationData;
  terms: TermsAndPolicies;
  qualityCheckResult: AiQualityCheckResult | null;
  onUpdateQualityResult: (result: AiQualityCheckResult) => void;
  preGenAuditResult?: PreGenerationCheckResult | null;
  onUpdatePreGenAuditResult?: (result: PreGenerationCheckResult) => void;
  onJumpToStep: (stepNumber: number) => void;
}

export const Step9AiQualityCheck: React.FC<Step9AiQualityCheckProps> = ({
  candidate,
  jobDetails,
  compensation,
  terms,
  qualityCheckResult,
  onUpdateQualityResult,
  preGenAuditResult,
  onUpdatePreGenAuditResult,
  onJumpToStep,
}) => {
  const [running, setRunning] = useState(false);
  const [auditData, setAuditData] = useState<PreGenerationCheckResult | null>(preGenAuditResult || null);
  const [selectedCategory, setSelectedCategory] = useState<PreGenerationCheckCategory | 'all'>('all');

  useEffect(() => {
    if (!auditData) {
      runCheck();
    }
  }, []);

  const runCheck = async () => {
    setRunning(true);
    try {
      // 1. Run traditional quality check
      const qRes = await offerService.performQualityCheck({
        candidate,
        jobDetails,
        compensation,
        terms,
      });
      onUpdateQualityResult(qRes);

      // 2. Run comprehensive 9-category Pre-Generation Audit
      const auditRes = await offerService.performPreGenerationCheck({
        candidate,
        jobDetails,
        compensation,
        terms,
        company: {
          name: 'Acme Technologies Global Corp.',
          legalName: 'Acme Technologies Global Corp.',
          signatoryName: 'Sarah Jenkins',
          signatoryTitle: 'VP of Global Talent Operations',
        },
      });

      setAuditData(auditRes);
      if (onUpdatePreGenAuditResult) {
        onUpdatePreGenAuditResult(auditRes);
      }
    } finally {
      setRunning(false);
    }
  };

  const status: PreGenerationStatus = auditData?.status || 'PASS';
  const isPass = status === 'PASS';
  const isWarning = status === 'WARNING';
  const isReviewRequired = status === 'REVIEW_REQUIRED';

  const categoryIcons: Record<PreGenerationCheckCategory, React.ReactNode> = {
    missing_required_fields: <FileCheck2 size={16} color="var(--primary)" />,
    missing_candidate_company_info: <ShieldCheck size={16} color="var(--primary)" />,
    date_inconsistencies: <Calendar size={16} color="#38bdf8" />,
    designation_inconsistencies: <Layers size={16} color="#a855f7" />,
    salary_inconsistencies: <Calculator size={16} color="#22c55e" />,
    missing_clauses: <FileCode size={16} color="#eab308" />,
    unreplaced_placeholders: <FileQuestion size={16} color="#ec4899" />,
    content_formatting_issues: <HelpCircle size={16} color="#f97316" />,
    contradictions: <AlertCircle size={16} color="#ef4444" />,
  };

  const categoryStepMap: Record<PreGenerationCheckCategory, number> = {
    missing_required_fields: 5,
    missing_candidate_company_info: 4,
    date_inconsistencies: 5,
    designation_inconsistencies: 5,
    salary_inconsistencies: 6,
    missing_clauses: 7,
    unreplaced_placeholders: 7,
    content_formatting_issues: 7,
    contradictions: 7,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>AI Pre-Generation Quality & Consistency Audit</h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4, marginLeft: 38 }}>
            Rigorous pre-flight check across 9 required categories before final offer letter generation.
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
          <span>Re-Run Complete Audit</span>
        </button>
      </div>

      {/* Non-Negotiable AI Guardrail Notice */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px',
          background: '#eff6ff',
          borderRadius: 8,
          border: '1px solid #bfdbfe',
          fontSize: '0.8125rem',
          color: '#1e40af',
        }}
      >
        <Info size={18} style={{ flexShrink: 0, color: '#2563eb' }} />
        <span>
          <strong>AI Safety Principle:</strong> AI flags issues, data inconsistencies, and legal contradictions for human HR review. AI never silently modifies or alters the offer.
        </span>
      </div>

      {running ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div
            className="spinner"
            style={{
              width: 38,
              height: 38,
              border: '3px solid var(--border-subtle)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              margin: '0 auto 16px',
            }}
          />
          <h4 style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>Running 9-Category Pre-Generation Audit...</h4>
          <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: 4 }}>
            Verifying required fields, date coherence, compensation math, missing clauses, placeholders, and term contradictions.
          </p>
        </div>
      ) : auditData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Main Verdict Card */}
          <div
            style={{
              padding: 24,
              borderRadius: 12,
              display: 'grid',
              gridTemplateColumns: '170px 1fr',
              gap: 24,
              alignItems: 'center',
              background: isPass
                ? '#ecfdf5'
                : isWarning
                ? '#fffbeb'
                : '#fef2f2',
              border: `2px solid ${
                isPass ? '#10b981' : isWarning ? '#f59e0b' : '#ef4444'
              }`,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Status Emblem */}
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: isPass
                  ? '#d1fae5'
                  : isWarning
                  ? '#fef3c7'
                  : '#fee2e2',
                border: `4px solid ${
                  isPass ? '#10b981' : isWarning ? '#f59e0b' : '#ef4444'
                }`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: 10,
              }}
            >
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: isPass ? '#047857' : isWarning ? '#b45309' : '#b91c1c',
                  letterSpacing: '0.04em',
                }}
              >
                {status}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 4 }}>
                {isPass
                  ? 'Ready for Final Generation'
                  : isWarning
                  ? 'Advisories Present'
                  : 'Action Required'}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    background: isPass
                      ? '#d1fae5'
                      : isWarning
                      ? '#fef3c7'
                      : '#fee2e2',
                    color: isPass ? '#047857' : isWarning ? '#b45309' : '#b91c1c',
                  }}
                >
                  PRE-GENERATION STATUS: {status}
                </span>

                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  Total Flagged Issues: <strong style={{ color: '#0f172a' }}>{auditData.totalIssuesCount}</strong> ({auditData.criticalIssuesCount} Critical, {auditData.warningsCount} Warnings)
                </span>
              </div>

              <h4 style={{ fontSize: '1.2rem', color: '#0f172a', marginTop: 10, fontWeight: 700 }}>
                {auditData.summary}
              </h4>

              <p style={{ fontSize: '0.8125rem', color: '#475569', marginTop: 4 }}>
                {isPass
                  ? 'All 9 compliance categories verified. No blocking contradictions, missing clauses, or placeholder errors found.'
                  : isWarning
                  ? 'Non-blocking advisories detected. You can proceed to HR review, but reviewing flagged items is strongly recommended.'
                  : 'One or more blocking issues must be resolved by HR before minting the legal document. Jump to the indicated steps below to fix.'}
              </p>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
            <button
              type="button"
              className={`btn ${selectedCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedCategory('all')}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              All 9 Categories ({auditData.totalIssuesCount})
            </button>
            {Object.keys(auditData.checks).map((k) => {
              const catKey = k as PreGenerationCheckCategory;
              const cat = auditData.checks[catKey];
              const isCatSelected = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  className={`btn ${isCatSelected ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedCategory(catKey)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '6px 12px',
                    borderColor:
                      cat.status === 'REVIEW_REQUIRED'
                        ? 'rgba(239, 68, 68, 0.5)'
                        : cat.status === 'WARNING'
                        ? 'rgba(245, 158, 11, 0.5)'
                        : 'var(--border-subtle)',
                  }}
                >
                  <span>{cat.categoryTitle}</span>
                  {cat.issues.length > 0 && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 10,
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        background: cat.status === 'REVIEW_REQUIRED' ? '#ef4444' : '#f59e0b',
                        color: '#fff',
                        marginLeft: 4,
                      }}
                    >
                      {cat.issues.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 9 Category Check Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.keys(auditData.checks)
              .filter((k) => selectedCategory === 'all' || selectedCategory === k)
              .map((k) => {
                const catKey = k as PreGenerationCheckCategory;
                const cat = auditData.checks[catKey];
                const catPass = cat.status === 'PASS';
                const catWarn = cat.status === 'WARNING';
                const catRev = cat.status === 'REVIEW_REQUIRED';

                return (
                  <div
                    key={catKey}
                    style={{
                      padding: 18,
                      borderRadius: 10,
                      background: '#ffffff',
                      boxShadow: 'var(--shadow-sm)',
                      border: `1px solid ${
                        catRev
                          ? '#fca5a5'
                          : catWarn
                          ? '#fde68a'
                          : '#a7f3d0'
                      }`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {categoryIcons[catKey]}
                        <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>
                          {cat.categoryTitle}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            background: catPass
                              ? '#ecfdf5'
                              : catWarn
                              ? '#fef3c7'
                              : '#fef2f2',
                            color: catPass ? '#047857' : catWarn ? '#b45309' : '#b91c1c',
                            border: `1px solid ${
                              catPass
                                ? '#a7f3d0'
                                : catWarn
                                ? '#fde68a'
                                : '#fca5a5'
                            }`,
                          }}
                        >
                          {cat.status}
                        </span>

                        {!catPass && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => onJumpToStep(categoryStepMap[catKey])}
                            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                          >
                            <span>Fix in Step {categoryStepMap[catKey]}</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Passed notice */}
                    {catPass && (
                      <div style={{ marginTop: 10, fontSize: '0.8125rem', color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={15} />
                        <span>All checks in this category verified and compliant.</span>
                      </div>
                    )}

                    {/* Issue items */}
                    {cat.issues.length > 0 && (
                      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {cat.issues.map((iss) => (
                          <div
                            key={iss.id}
                            style={{
                              padding: '10px 14px',
                              background: '#f8fafc',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid #e2e8f0',
                              borderLeft: `3px solid ${
                                iss.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'
                              }`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                              <strong style={{ fontSize: '0.8125rem', color: iss.severity === 'CRITICAL' ? '#b91c1c' : '#b45309' }}>
                                {iss.title}
                              </strong>
                              {iss.fieldOrLocation && (
                                <span style={{ fontSize: '0.6875rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                                  {iss.fieldOrLocation}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: 4 }}>
                              {iss.issue}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#1d4ed8', marginTop: 4 }}>
                              <strong>Recommendation:</strong> {iss.recommendation}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
