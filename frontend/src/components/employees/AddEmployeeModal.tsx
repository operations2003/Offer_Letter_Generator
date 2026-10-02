// =============================================================================
// ADD / EDIT EMPLOYEE MODAL
// =============================================================================
// Collects ONLY essential employee master details.
// Short, straightforward, and zero document-specific clutter.
// =============================================================================

import React, { useState } from 'react';
import { X, UserPlus, RefreshCw, AlertCircle, Check } from 'lucide-react';
import { CreateEmployeePayload, EmployeeService } from '../../services/employeeService.js';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onEmployeeAdded,
}) => {
  const [employeeId, setEmployeeId] = useState(`EMP-${Math.floor(10000 + Math.random() * 90000)}`);
  const [fullName, setFullName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('ACTIVE');
  const [reportingManager, setReportingManager] = useState('');
  const [workLocation, setWorkLocation] = useState('San Francisco, CA (Hybrid)');
  const [annualCtc, setAnnualCtc] = useState<number | undefined>(145000);
  const [currency, setCurrency] = useState('USD');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRerollId = () => {
    setEmployeeId(`EMP-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !personalEmail.trim() || !designation.trim() || !department.trim()) {
      setError('Please fill in all mandatory fields (Name, Email, Designation, Department).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: CreateEmployeePayload = {
        employeeId: employeeId.trim(),
        fullName: fullName.trim(),
        personalEmail: personalEmail.trim(),
        officialEmail: officialEmail.trim() || undefined,
        phone: phone.trim() || undefined,
        designation: designation.trim(),
        department: department.trim(),
        employmentType,
        joiningDate,
        status,
        reportingManager: reportingManager.trim() || undefined,
        workLocation: workLocation.trim() || undefined,
        annualCtc: annualCtc ? Number(annualCtc) : undefined,
        currency,
      };

      await EmployeeService.createEmployee(payload);
      onEmployeeAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          width: '100%',
          maxWidth: 700,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Add New Employee
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Essential employee profile details for document generation
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: '1px solid #fee2e2',
            }}
          >
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Employee ID */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                  Employee ID <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={handleRerollId}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.7rem',
                    color: '#2563eb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <RefreshCw size={11} /> Auto-generate
                </button>
              </div>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontWeight: 600,
                  backgroundColor: '#f8fafc',
                }}
              />
            </div>

            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                }}
              />
            </div>

            {/* Personal Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Personal Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. rahul.sharma@example.com"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                }}
              />
            </div>

            {/* Official Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Official Email (optional)
              </label>
              <input
                type="email"
                placeholder="e.g. rahul.s@acme.com"
                value={officialEmail}
                onChange={(e) => setOfficialEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. +1 (555) 234-8901"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                }}
              />
            </div>

            {/* Designation */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Designation / Job Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                }}
              />
            </div>

            {/* Department */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Department <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Data & AI">Data & AI</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="People / HR">People / HR</option>
                <option value="Finance & Legal">Finance & Legal</option>
                <option value="Customer Success">Customer Success</option>
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="Full-time">Full-time</option>
                <option value="Intern">Intern</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
                <option value="Executive">Executive</option>
                <option value="Consultant">Consultant</option>
              </select>
            </div>

            {/* Date of Joining */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Date of Joining <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                }}
              />
            </div>

            {/* Employment Status */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Employment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="ACTIVE">Active</option>
                <option value="ONBOARDING">Onboarding</option>
                <option value="PROBATION">Probation</option>
                <option value="RESIGNED">Resigned</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>

            {/* Reporting Manager */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Reporting Manager
              </label>
              <input
                type="text"
                placeholder="e.g. Marcus Vance (VP Engineering)"
                value={reportingManager}
                onChange={(e) => setReportingManager(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                }}
              />
            </div>

            {/* Work Location */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Work Location
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco, CA (Hybrid)"
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                }}
              />
            </div>

            {/* Annual CTC / Salary */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Annual CTC / Salary
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    width: 80,
                    padding: '8px 8px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
                <input
                  type="number"
                  placeholder="e.g. 145000"
                  value={annualCtc || ''}
                  onChange={(e) => setAnnualCtc(e.target.value ? Number(e.target.value) : undefined)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                backgroundColor: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 18px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <Check size={16} />
              <span>{loading ? 'Saving...' : 'Add Employee'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
