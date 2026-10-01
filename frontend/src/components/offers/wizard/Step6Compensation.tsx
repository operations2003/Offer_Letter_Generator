import React, { useEffect } from 'react';
import {
  DollarSign,
  Calculator,
  PieChart,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Award,
} from 'lucide-react';
import { CompensationData } from '../../../types/offer.js';
import { AiCandidateExtractionData } from '../../../types/index.js';

interface Step6CompensationProps {
  compensation: CompensationData;
  aiData: AiCandidateExtractionData | null;
  onUpdateCompensation: (updated: CompensationData) => void;
}

export const Step6Compensation: React.FC<Step6CompensationProps> = ({
  compensation,
  aiData,
  onUpdateCompensation,
}) => {
  // Re-calculate Total CTC dynamically whenever components change
  const handleChange = (field: keyof CompensationData, value: any) => {
    const updated = {
      ...compensation,
      [field]: value,
    };

    if (
      field === 'baseSalary' ||
      field === 'hraAllowance' ||
      field === 'specialAllowances' ||
      field === 'performanceBonus' ||
      field === 'joiningBonus'
    ) {
      updated.totalCtc =
        Number(updated.baseSalary || 0) +
        Number(updated.hraAllowance || 0) +
        Number(updated.specialAllowances || 0) +
        Number(updated.performanceBonus || 0) +
        Number(updated.joiningBonus || 0);
    }

    onUpdateCompensation(updated);
  };

  const handleEquityChange = (equityField: string, val: any) => {
    onUpdateCompensation({
      ...compensation,
      equityDetails: {
        ...(compensation.equityDetails || {}),
        [equityField]: val,
      },
    });
  };

  const aiExpectedSalary = Number(aiData?.baseSalary?.value || 165000);
  const aiExpectedCtc = Number(aiData?.totalCtc?.value || 215000);
  const currentTotal = compensation.totalCtc;

  const variancePercent = Math.round(
    ((compensation.baseSalary - aiExpectedSalary) / (aiExpectedSalary || 1)) * 100
  );

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
            6
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Compensation Structure & Total CTC</h3>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4, marginLeft: 38 }}>
          Configure base remuneration, guaranteed allowances, performance variables, and equity incentives.
        </p>
      </div>

      {/* Comparison & Market Benchmark Card */}
      <div
        style={{
          padding: 18,
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.2fr 1fr',
          gap: 16,
          background: '#f8fafc',
          borderRadius: 10,
          border: '1px solid var(--border-medium)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6d28d9', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Sparkles size={13} />
            AI Extracted Expectation
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
            ${aiExpectedSalary.toLocaleString()} {compensation.currency} Base
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
            Total expectation ~${aiExpectedCtc.toLocaleString()}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#047857', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <ShieldCheck size={13} />
            HR Approved Total CTC
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', marginTop: 4 }}>
            ${currentTotal.toLocaleString()} {compensation.currency}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
            Sum of all 5 guaranteed & variable components
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4338ca', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <TrendingUp size={13} />
            Variance to Expectation
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: variancePercent >= 0 ? '#059669' : '#b45309', marginTop: 4 }}>
            {variancePercent >= 0 ? `+${variancePercent}%` : `${variancePercent}%`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
            Within Staff Architect pay band (75th percentile)
          </div>
        </div>
      </div>

      {/* Compensation Components Form */}
      <div
        style={{
          padding: 24,
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
        }}
      >
        {/* Currency */}
        <div>
          <label className="form-label">Currency</label>
          <select
            className="form-select"
            value={compensation.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            <option value="USD">USD ($) - US Dollar</option>
            <option value="EUR">EUR (€) - Euro</option>
            <option value="GBP">GBP (£) - British Pound</option>
            <option value="INR">INR (₹) - Indian Rupee</option>
            <option value="CAD">CAD ($) - Canadian Dollar</option>
            <option value="AUD">AUD ($) - Australian Dollar</option>
            <option value="SGD">SGD ($) - Singapore Dollar</option>
          </select>
        </div>

        {/* Base Salary */}
        <div>
          <label className="form-label">Annual Base Salary *</label>
          <input
            type="number"
            className="form-input"
            value={compensation.baseSalary}
            onChange={(e) => handleChange('baseSalary', Number(e.target.value))}
            placeholder="e.g. 165000"
            required
          />
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', marginTop: 2, display: 'block' }}>
            Paid semi-monthly subject to payroll deductions
          </span>
        </div>

        {/* HRA Allowance */}
        <div>
          <label className="form-label">Housing Allowance (HRA)</label>
          <input
            type="number"
            className="form-input"
            value={compensation.hraAllowance}
            onChange={(e) => handleChange('hraAllowance', Number(e.target.value))}
            placeholder="e.g. 24000"
          />
        </div>

        {/* Special Allowances */}
        <div>
          <label className="form-label">Special / Remote Allowances</label>
          <input
            type="number"
            className="form-input"
            value={compensation.specialAllowances}
            onChange={(e) => handleChange('specialAllowances', Number(e.target.value))}
            placeholder="e.g. 6000"
          />
        </div>

        {/* Performance Bonus */}
        <div>
          <label className="form-label">Annual Performance Bonus (Target)</label>
          <input
            type="number"
            className="form-input"
            value={compensation.performanceBonus}
            onChange={(e) => handleChange('performanceBonus', Number(e.target.value))}
            placeholder="e.g. 24750"
          />
        </div>

        {/* Sign-on Bonus */}
        <div>
          <label className="form-label">Sign-On / Joining Bonus</label>
          <input
            type="number"
            className="form-input"
            value={compensation.joiningBonus}
            onChange={(e) => handleChange('joiningBonus', Number(e.target.value))}
            placeholder="e.g. 15000"
          />
        </div>
      </div>

      {/* Equity Incentive Section */}
      <div
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Award size={18} color="var(--primary)" />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Long-Term Incentive & Stock Option Grant</h4>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div>
            <label className="form-label">Total Stock Options / RSUs</label>
            <input
              type="number"
              className="form-input"
              value={compensation.equityDetails?.sharesCount || 0}
              onChange={(e) => handleEquityChange('sharesCount', Number(e.target.value))}
              placeholder="e.g. 25000"
            />
          </div>

          <div>
            <label className="form-label">Vesting Period (Months)</label>
            <input
              type="number"
              className="form-input"
              value={compensation.equityDetails?.vestingPeriodMonths || 48}
              onChange={(e) => handleEquityChange('vestingPeriodMonths', Number(e.target.value))}
              placeholder="e.g. 48"
            />
          </div>

          <div>
            <label className="form-label">Cliff Duration (Months)</label>
            <input
              type="number"
              className="form-input"
              value={compensation.equityDetails?.cliffMonths || 12}
              onChange={(e) => handleEquityChange('cliffMonths', Number(e.target.value))}
              placeholder="e.g. 12"
            />
          </div>

          <div>
            <label className="form-label">Incentive Plan Scheme</label>
            <select
              className="form-select"
              value={compensation.equityDetails?.schemeType || 'ISO'}
              onChange={(e) => handleEquityChange('schemeType', e.target.value)}
            >
              <option value="ISO">Incentive Stock Options (ISO)</option>
              <option value="NSO">Non-Qualified Stock Options (NSO)</option>
              <option value="RSU">Restricted Stock Units (RSU)</option>
              <option value="SAR">Stock Appreciation Rights (SAR)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
