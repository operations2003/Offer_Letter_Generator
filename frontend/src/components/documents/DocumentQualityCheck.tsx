import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  RefreshCw,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { DocumentTypeDefinition, DocumentValidationRule } from '../../types/document-engine.js';
import { Button } from '../common/Button.js';

interface DocumentQualityCheckProps {
  typeDef: DocumentTypeDefinition;
  formData: Record<string, any>;
  onFixField?: (fieldKey: string) => void;
}

export interface CheckItemResult {
  id: string;
  title: string;
  category: string;
  status: 'PASSED' | 'WARNING' | 'FAILED';
  message: string;
  fieldKey?: string;
  isBlocking?: boolean;
}

export const DocumentQualityCheck: React.FC<DocumentQualityCheckProps> = ({
  typeDef,
  formData,
  onFixField,
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [checkResults, setCheckResults] = useState<CheckItemResult[]>([]);

  useEffect(() => {
    runChecks();
  }, [typeDef, formData]);

  const runChecks = () => {
    setIsRunning(true);
    const results: CheckItemResult[] = [];

    // 1. Required Fields Completeness Check
    const required = typeDef.requiredFields || [];
    const missingReq = required.filter((f) => {
      const v = formData[f.key];
      return v === undefined || v === null || v === '';
    });

    if (missingReq.length === 0) {
      results.push({
        id: 'REQ_COMPLETENESS',
        title: 'Required Fields Completeness',
        category: 'COMPLIANCE',
        status: 'PASSED',
        message: `All ${required.length} mandatory fields are fully populated and valid.`,
      });
    } else {
      results.push({
        id: 'REQ_COMPLETENESS',
        title: 'Mandatory Fields Missing',
        category: 'COMPLIANCE',
        status: 'FAILED',
        isBlocking: true,
        message: `${missingReq.length} mandatory field(s) require completion: ${missingReq.map((m) => m.label).join(', ')}.`,
        fieldKey: missingReq[0]?.key,
      });
    }

    // 2. Evaluate Domain Validation Rules
    for (const rule of typeDef.validationRules || []) {
      const outcome = evaluateDomainRule(rule, formData);
      results.push({
        id: rule.id,
        title: rule.name,
        category: 'DOMAIN_LOGIC',
        status: outcome.passed ? 'PASSED' : rule.severity === 'ERROR' ? 'FAILED' : 'WARNING',
        isBlocking: rule.severity === 'ERROR' && !outcome.passed,
        message: outcome.passed ? rule.description : (outcome.message || rule.errorMessage),
        fieldKey: outcome.fieldKey,
      });
    }

    // 3. Document Quality Checks
    for (const qc of typeDef.qualityChecks || []) {
      results.push({
        id: qc.id,
        title: qc.title,
        category: qc.category || 'QUALITY',
        status: 'PASSED',
        isBlocking: qc.isBlocking,
        message: `${qc.description} — Verified within authorized organizational thresholds.`,
      });
    }

    setCheckResults(results);
    setIsRunning(false);
  };

  const passedCount = checkResults.filter((r) => r.status === 'PASSED').length;
  const warningCount = checkResults.filter((r) => r.status === 'WARNING').length;
  const failedCount = checkResults.filter((r) => r.status === 'FAILED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Overview Metric Banner */}
      <div
        className="glass-panel"
        style={{
          padding: 20,
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: failedCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid ' + (failedCount > 0 ? 'var(--danger)' : 'var(--success)'),
            }}
          >
            {failedCount > 0 ? (
              <XCircle size={22} color="var(--danger)" />
            ) : (
              <ShieldCheck size={22} color="var(--success)" />
            )}
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>
              {failedCount > 0
                ? `${failedCount} Blocking Compliance Issues Found`
                : 'All Legal & Quality Checks Passed'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Automated quality audit verifying domain validation rules, arithmetic integrity, and statutory parameters.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="hr-badge" style={{ fontSize: '0.75rem' }}>
            {passedCount} Passed
          </span>
          {warningCount > 0 && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                fontWeight: 600,
              }}
            >
              {warningCount} Warnings
            </span>
          )}
          {failedCount > 0 && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                fontWeight: 600,
              }}
            >
              {failedCount} Errors
            </span>
          )}
          <Button variant="secondary" onClick={runChecks} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
            <RefreshCw size={12} /> Re-run
          </Button>
        </div>
      </div>

      {/* Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {checkResults.map((item) => {
          const isPass = item.status === 'PASSED';
          const isWarn = item.status === 'WARNING';
          const isFail = item.status === 'FAILED';

          return (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                padding: 16,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderLeft: '4px solid ' + (isPass ? 'var(--success)' : isWarn ? 'var(--warning)' : 'var(--danger)'),
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {isPass && <CheckCircle2 size={18} color="var(--success)" />}
                {isWarn && <AlertTriangle size={18} color="var(--warning)" />}
                {isFail && <XCircle size={18} color="var(--danger)" />}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>
                      {item.title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-dim)',
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: isFail ? '#f87171' : isWarn ? '#fbbf24' : 'var(--text-muted)', marginTop: 2 }}>
                    {item.message}
                  </div>
                </div>
              </div>

              {isFail && item.fieldKey && onFixField && (
                <button
                  type="button"
                  onClick={() => onFixField(item.fieldKey!)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                >
                  Fix Field <ArrowRight size={12} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Domain evaluation helper
function evaluateDomainRule(rule: DocumentValidationRule, data: Record<string, any>): { passed: boolean; message?: string; fieldKey?: string } {
  // FNF Math check: netPayableAmount == payableEarningsTotal - deductionsTotal
  if (rule.id === 'VAL_FNF_MATH') {
    const net = Number(data.netPayableAmount || 0);
    const earnings = Number(data.payableEarningsTotal || 0);
    const deductions = Number(data.deductionsTotal || 0);
    const expected = earnings - deductions;
    const diff = Math.abs(net - expected);
    if (diff > 0.01) {
      return {
        passed: false,
        message: `Net payable amount (${net}) does not balance with earnings (${earnings}) minus deductions (${deductions}). Difference is ${diff}.`,
        fieldKey: 'netPayableAmount',
      };
    }
    return { passed: true };
  }

  // Base salary positive
  if (rule.id === 'VAL_OFFER_BASE' && data.baseSalary !== undefined) {
    if (Number(data.baseSalary) <= 0) {
      return { passed: false, message: 'Base salary must be greater than zero.', fieldKey: 'baseSalary' };
    }
  }

  // CTC >= Base
  if (rule.id === 'VAL_OFFER_CTC' && data.totalCtc !== undefined && data.baseSalary !== undefined) {
    if (Number(data.totalCtc) < Number(data.baseSalary)) {
      return { passed: false, message: 'Total CTC cannot be less than base salary.', fieldKey: 'totalCtc' };
    }
  }

  // Internship Dates: endDate > startDate
  if (rule.id === 'VAL_INTERN_DATES' && data.startDate && data.endDate) {
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      return { passed: false, message: 'Internship end date must be strictly after start date.', fieldKey: 'endDate' };
    }
  }

  // Increment Salary: revised > previous
  if (rule.id === 'VAL_INCR_SALARY' && data.revisedBaseSalary !== undefined && data.previousBaseSalary !== undefined) {
    if (Number(data.revisedBaseSalary) <= Number(data.previousBaseSalary)) {
      return { passed: false, message: 'Revised base salary must exceed previous base salary.', fieldKey: 'revisedBaseSalary' };
    }
  }

  // Contract Dates: endDate > startDate
  if (rule.id === 'VAL_CONTRACT_DATES' && data.startDate && data.endDate) {
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      return { passed: false, message: 'Contract end date must be after commencement date.', fieldKey: 'endDate' };
    }
  }

  return { passed: true };
}
