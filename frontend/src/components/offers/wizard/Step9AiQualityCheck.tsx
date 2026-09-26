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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>AI Pre-Generation Quality & Consistency Audit</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4, marginLeft: 38 }}>
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
          background: 'rgba(59, 130, 246, 0.08)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          fontSize: '0.8125rem',
          color: '#93c5fd',
        }}
      >
        <Info size={18} style={{ flexShrink: 0 }} />
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
          <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>Running 9-Category Pre-Generation Audit...</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>
            Verifying required fields, date coherence, compensation math, missing clauses, placeholders, and term contradictions.
          </p>
        </div>
      ) : auditData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Main Verdict Card */}
          <div
            className="glass-panel"
            style={{
              padding: 24,
              display: 'grid',
              gridTemplateColumns: '170px 1fr',
              gap: 24,
              alignItems: 'center',
              background: isPass
                ? 'rgba(16, 185, 129, 0.08)'
                : isWarning
                ? 'rgba(245, 158, 11, 0.08)'
                : 'rgba(239, 68, 68, 0.08)',
              border: `2px solid ${
                isPass ? '#10b981' : isWarning ? '#f59e0b' : '#ef4444'
              }`,
            }}
          >
            {/* Status Emblem */}
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: isPass
                  ? 'rgba(16, 185, 129, 0.15)'
                  : isWarning
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
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
                  color: isPass ? '#34d399' : isWarning ? '#fbbf24' : '#f87171',
                  letterSpacing: '0.04em',
                }}
              >
                {status}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 4 }}>
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
                      ? 'rgba(16, 185, 129, 0.2)'
                      : isWarning
                      ? 'rgba(245, 158, 11, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)',
                    color: isPass ? '#34d399' : isWarning ? '#fbbf24' : '#f87171',
                  }}
                >
                  PRE-GENERATION STATUS: {status}
                </span>

                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Total Flagged Issues: <strong>{auditData.totalIssuesCount}</strong> ({auditData.criticalIssuesCount} Critical, {auditData.warningsCount} Warnings)
                </span>
              </div>

              <h4 style={{ fontSize: '1.2rem', color: '#fff', marginTop: 10, fontWeight: 700 }}>
                {auditData.summary}
              </h4>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
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
                    className="glass-panel"
                    style={{
                      padding: 18,
                      background: 'var(--bg-tertiary)',
                      border: `1px solid ${
                        catRev
                          ? 'rgba(239, 68, 68, 0.4)'
                          : catWarn
                          ? 'rgba(245, 158, 11, 0.4)'
                          : 'rgba(16, 185, 129, 0.3)'
                      }`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {categoryIcons[catKey]}
                        <strong style={{ fontSize: '0.9375rem', color: '#fff' }}>
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
                              ? 'rgba(16, 185, 129, 0.15)'
                              : catWarn
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                            color: catPass ? '#34d399' : catWarn ? '#fbbf24' : '#f87171',
                            border: `1px solid ${
                              catPass
                                ? 'rgba(16, 185, 129, 0.3)'
                                : catWarn
                                ? 'rgba(245, 158, 11, 0.3)'
                                : 'rgba(239, 68, 68, 0.3)'
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
                      <div style={{ marginTop: 10, fontSize: '0.8125rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: 6 }}>
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
                              background: 'var(--bg-primary)',
                              borderRadius: 'var(--radius-sm)',
                              borderLeft: `3px solid ${
                                iss.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'
                              }`,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                              <strong style={{ fontSize: '0.8125rem', color: iss.severity === 'CRITICAL' ? '#fca5a5' : '#fde047' }}>
                                {iss.title}
                              </strong>
                              {iss.fieldOrLocation && (
                                <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                                  {iss.fieldOrLocation}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                              {iss.issue}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#93c5fd', marginTop: 4 }}>
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
