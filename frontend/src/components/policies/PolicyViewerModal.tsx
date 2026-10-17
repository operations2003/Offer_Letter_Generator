import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Shield,
  FileText,
  User,
  Search,
  BookOpen,
  Layout,
  List,
  Sparkles,
  ArrowUp,
  Trash2,
  Edit3,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import {
  editPolicySectionWithPrompt,
  updatePolicySectionManual,
  addNewPolicySection,
} from '../../services/policyGeneratorService.js';

export interface PolicyDefinition {
  code: string;
  name: string;
  subtitle?: string;
  category: string;
  categoryLabel: string;
  policyNumber: string;
  version: string;
  effectiveDate: string;
  reviewCycle: string;
  applicability: string;
  description: string;
  summary: string;
  color: string;
  sections: {
    number: string;
    title: string;
    content: string;
    mandatory: boolean;
  }[];
}

interface PolicyViewerModalProps {
  policy: PolicyDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (policy: PolicyDefinition) => void;
  onPolicyUpdate?: (policy: PolicyDefinition) => void;
}

export const PolicyViewerModal: React.FC<PolicyViewerModalProps> = ({
  policy: initialPolicy,
  isOpen,
  onClose,
  onDelete,
  onPolicyUpdate,
}) => {
  const { success, error } = useToast();
  const [policy, setPolicy] = useState<PolicyDefinition | null>(initialPolicy);

  // Sync internal policy state when initialPolicy changes from parent
  useEffect(() => {
    setPolicy(initialPolicy);
  }, [initialPolicy]);

  const [viewMode, setViewMode] = useState<'letterhead' | 'accordion'>('letterhead');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // AI & Manual Policy Section Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedSectionNum, setSelectedSectionNum] = useState<string>('1.0');
  const [editPrompt, setEditPrompt] = useState('');
  const [isApplyingEdit, setIsApplyingEdit] = useState(false);
  const [editorTab, setEditorTab] = useState<'prompt' | 'manual'>('prompt');
  const [manualTitle, setManualTitle] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);
  const [showCurrentSectionPreview, setShowCurrentSectionPreview] = useState(false);

  // Scroll Handling State & Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  // Employee selection for Section 16 Acknowledgement
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [signatureDate, setSignatureDate] = useState<string>(() =>
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset scroll position when modal opens or policy changes
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      setScrollProgress(0);
      setShowScrollTop(false);
      setActiveSection(null);
      setHighlightedSection(null);
    }
  }, [isOpen, policy?.code]);

  useEffect(() => {
    if (isOpen) {
      EmployeeService.listEmployees()
        .then((list) => {
          if (list && list.length > 0) {
            setEmployees(list);
            setSelectedEmployee(list[0]);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen || !policy) return null;

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const total = el.scrollHeight - el.clientHeight;
    if (total > 0) {
      const progress = Math.min(100, Math.max(0, (el.scrollTop / total) * 100));
      setScrollProgress(progress);
    } else {
      setScrollProgress(0);
    }
    setShowScrollTop(el.scrollTop > 240);

    // Active section detection (ScrollSpy)
    if (policy && policy.sections) {
      const containerRect = el.getBoundingClientRect();
      for (let i = policy.sections.length - 1; i >= 0; i--) {
        const sec = policy.sections[i];
        const secId =
          viewMode === 'letterhead' ? `policy-section-${sec.number}` : `policy-section-acc-${sec.number}`;
        const secEl = document.getElementById(secId);
        if (secEl) {
          const rect = secEl.getBoundingClientRect();
          if (rect.top - containerRect.top <= 140) {
            setActiveSection(sec.number);
            break;
          }
        }
      }
    }
  };

  const scrollToSection = (sectionNumber: string) => {
    const targetId =
      viewMode === 'letterhead' ? `policy-section-${sectionNumber}` : `policy-section-acc-${sectionNumber}`;
    const targetEl = document.getElementById(targetId);
    if (targetEl && scrollContainerRef.current) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlightedSection(sectionNumber);
      if (viewMode === 'accordion' && expandedSections[sectionNumber] === false) {
        setExpandedSections((prev) => ({ ...prev, [sectionNumber]: true }));
      }
      setTimeout(() => {
        setHighlightedSection((prev) => (prev === sectionNumber ? null : prev));
      }, 2200);
    }
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleSection = (num: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [num]: prev[num] === undefined ? false : !prev[num],
    }));
  };

  const handleOpenEditor = (secNum?: string) => {
    const numToSelect = secNum || (policy?.sections[0]?.number ?? '1.0');
    setSelectedSectionNum(numToSelect);
    setIsEditorOpen(true);
    setEditSuccessMsg(null);

    const target = policy?.sections.find((s) => s.number === numToSelect);
    if (target) {
      setManualTitle(target.title);
      setManualContent(target.content);
    } else {
      setManualTitle('');
      setManualContent('');
    }
  };

  const handleSectionSelectChange = (num: string) => {
    setSelectedSectionNum(num);
    setEditSuccessMsg(null);
    if (num === 'NEW') {
      setManualTitle('Additional Policy Clause');
      setManualContent('');
    } else {
      const target = policy?.sections.find((s) => s.number === num);
      if (target) {
        setManualTitle(target.title);
        setManualContent(target.content);
      }
    }
  };

  const handleApplyPromptEdit = async (customPrompt?: string) => {
    const promptToUse = (customPrompt || editPrompt).trim();
    if (!promptToUse) {
      error('Please enter instructions for the section edit.');
      return;
    }
    if (!policy) return;

    setIsApplyingEdit(true);
    setEditSuccessMsg(null);
    try {
      const result = await editPolicySectionWithPrompt(policy, selectedSectionNum, promptToUse);
      setPolicy(result.updatedPolicy);
      onPolicyUpdate?.(result.updatedPolicy);
      setEditPrompt('');
      setEditSuccessMsg(result.changesSummary);
      success(`Updated section § ${result.updatedSection.number} (${result.updatedSection.title})!`);

      // Update manual text fields to match
      setManualTitle(result.updatedSection.title);
      setManualContent(result.updatedSection.content);

      // Scroll to that section
      setTimeout(() => {
        scrollToSection(result.updatedSection.number);
      }, 250);
    } catch (err: any) {
      error(err.message || 'Failed to edit section with prompt.');
    } finally {
      setIsApplyingEdit(false);
    }
  };

  const handleApplyManualEdit = () => {
    if (!policy) return;
    if (selectedSectionNum === 'NEW') {
      if (!manualTitle.trim()) {
        error('Please enter a section title.');
        return;
      }
      const updated = addNewPolicySection(policy, manualTitle, manualContent);
      setPolicy(updated);
      onPolicyUpdate?.(updated);
      success('Added new policy section.');
      setIsEditorOpen(false);
    } else {
      const updated = updatePolicySectionManual(policy, selectedSectionNum, manualTitle, manualContent);
      setPolicy(updated);
      onPolicyUpdate?.(updated);
      success(`Updated § ${selectedSectionNum} manually.`);
      setIsEditorOpen(false);
    }
  };

  const employeeName = selectedEmployee?.fullName || '__________________________';
  const employeeId = selectedEmployee?.employeeId || '__________________________';
  const employeeDesignation = selectedEmployee?.designation || '__________________________';

  const handleCopy = () => {
    const fullText = `TASKNERA — GLOBAL HR · RECRUITMENT · WORKFORCE SOLUTIONS
=====================================================
${policy.name.toUpperCase()}
${policy.subtitle || 'Official Organizational Policy'}

Reference ID: ${policy.policyNumber}
Version: ${policy.version} | Effective: ${policy.effectiveDate}
Scope: ${policy.applicability}
Review Cycle: ${policy.reviewCycle}

POLICY INTENT:
${policy.summary}

TABLE OF CONTENTS:
${policy.sections.map((s) => `${s.number} ${s.title}`).join('\n')}

=====================================================
${policy.sections
  .map(
    (s) => `
${s.number} ${s.title}
-----------------------------------------------------
${s.content
  .replace(/\[CORE_STANDARD\]/g, 'CORE STANDARD:\n')
  .replace(/\[REASONABLENESS_PRINCIPLE\]/g, 'REASONABLENESS PRINCIPLE:\n')
  .replace(/\[NO_UNFAIR_RESTRICTION\]/g, 'NO UNFAIR RESTRICTION:\n')
  .replace(/\[IMPLEMENTATION_NOTE\]/g, 'IMPLEMENTATION NOTE:\n')
  .replace(/\[DEFINITIONS_TABLE\]/g, '')
  .replace(/\[DISCLOSURE_TABLE\]/g, '')}
`
  )
  .join('\n')}

ACKNOWLEDGEMENT:
Employee Name: ${employeeName}
Employee ID: ${employeeId}
Designation: ${employeeDesignation}
Signature: __________________________
Date: ${signatureDate}

=====================================================
Sheetal Bedi
CEO & FOUNDER
TaskNera (D-57 Dilshad Colony, Delhi, 110095)
`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    success(`Copied "${policy.name}" text to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${policy.name} — TaskNera Official Policy</title>
          <style>
            @page {
              size: A4;
              margin: 18mm 16mm 18mm 16mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #0f172a;
              line-height: 1.55;
              font-size: 11pt;
              margin: 0;
              padding: 0;
            }
            .template-header {
              position: relative;
              margin-bottom: 24px;
            }
            .banner-bar {
              display: flex;
              height: 22px;
              margin-bottom: 12px;
            }
            .banner-left {
              width: 55%;
              background-color: #eed7b9;
              border-bottom-right-radius: 12px;
            }
            .banner-right {
              width: 45%;
              background-color: #87726b;
            }
            .header-main {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-bottom: 12px;
            }
            .logo-box {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .logo-text {
              font-size: 26px;
              font-weight: 900;
              letter-spacing: 0.04em;
              color: #111827;
            }
            .contact-box {
              border-left: 2px solid #0f172a;
              padding-left: 14px;
              font-size: 9pt;
              line-height: 1.4;
              color: #1e293b;
              text-align: left;
            }
            .header-divider {
              height: 2.5px;
              background-color: #0f172a;
              width: 100%;
              margin-top: 4px;
            }
            .running-header {
              display: flex;
              justify-content: space-between;
              font-size: 9pt;
              color: #64748b;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 4px;
              margin-bottom: 18px;
            }
            .cover-title {
              text-align: center;
              padding: 40px 10px 30px;
              border-bottom: 1px solid #e2e8f0;
              margin-bottom: 24px;
            }
            .cover-title h1 {
              font-size: 24pt;
              font-weight: 800;
              color: #0f172a;
              margin: 12px 0 6px 0;
            }
            .cover-title h3 {
              font-size: 13pt;
              font-weight: 600;
              color: #475569;
              margin: 0 0 20px 0;
            }
            .callout-box {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-left: 4px solid #2563eb;
              padding: 12px 16px;
              border-radius: 6px;
              margin: 14px 0;
              font-size: 10pt;
            }
            .callout-title {
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 4px;
            }
            .section-block {
              margin-bottom: 22px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 12.5pt;
              font-weight: 700;
              color: #0f172a;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
              margin-bottom: 8px;
            }
            .policy-table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
              font-size: 9.5pt;
            }
            .policy-table th, .policy-table td {
              border: 1px solid #cbd5e1;
              padding: 8px 10px;
              text-align: left;
            }
            .policy-table th {
              background-color: #1e293b;
              color: #ffffff;
              font-weight: 700;
            }
            .policy-table tr:nth-child(even) td {
              background-color: #f8fafc;
            }
            .ack-box {
              border: 1.5px solid #0f172a;
              padding: 18px;
              border-radius: 8px;
              background-color: #ffffff;
              margin-top: 20px;
            }
            .template-footer {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              page-break-inside: avoid;
            }
            .footer-accent {
              width: 140px;
              height: 28px;
              background-color: #87726b;
              border-top-right-radius: 18px;
              position: relative;
            }
            .signatory-box {
              text-align: right;
              font-size: 11pt;
            }
            .signatory-name {
              font-weight: 800;
              color: #0f172a;
            }
            .signatory-role {
              font-size: 9.5pt;
              font-weight: 700;
              color: #475569;
              letter-spacing: 0.05em;
            }
          </style>
        </head>
        <body>
          <!-- TaskNera Official Letterhead -->
          <div class="template-header">
            <div class="banner-bar">
              <div class="banner-left"></div>
              <div class="banner-right"></div>
            </div>
            <div class="header-main">
              <div class="logo-box">
                <img src="/logo.png" alt="TaskNera" style="width: 44px; height: 44px; object-fit: contain;" onerror="this.style.display='none'" />
                <div class="logo-text">TASKNERA</div>
              </div>
              <div class="contact-box">
                <div><strong>Phone:</strong> +91 7065278229</div>
                <div><strong>Email:</strong> careers@tasknera.com</div>
                <div><strong>ADD:</strong> D-57 Dilshad Colony, Delhi, 110095</div>
              </div>
            </div>
            <div class="header-divider"></div>
          </div>

          <!-- Document Header -->
          <div class="cover-title">
            <div style="font-size: 11pt; font-weight: 700; color: #2563eb; letter-spacing: 0.08em; text-transform: uppercase;">
              Global HR · Recruitment · Workforce Solutions
            </div>
            <h1>${policy.name}</h1>
            <h3>${policy.subtitle || 'Employee, Contractor & Business Partner Standards'}</h3>
            <div style="display: inline-block; font-size: 9.5pt; color: #475569; background: #f8fafc; padding: 6px 14px; border-radius: 20px; border: 1px solid #cbd5e1;">
              <strong>Reference:</strong> ${policy.policyNumber} &nbsp;|&nbsp;
              <strong>Version:</strong> ${policy.version} &nbsp;|&nbsp;
              <strong>Effective:</strong> ${policy.effectiveDate}
            </div>
          </div>

          <!-- Policy Content -->
          ${policy.sections
            .map((s) => {
              let formatted = s.content
                .replace(
                  /\[CORE_STANDARD\]([\s\S]*?)(?=\n\n|\n[A-Z0-9]|$)/g,
                  '<div class="callout-box"><div class="callout-title">Core Standard</div>$1</div>'
                )
                .replace(
                  /\[REASONABLENESS_PRINCIPLE\]([\s\S]*?)(?=\n\n|\n[A-Z0-9]|$)/g,
                  '<div class="callout-box"><div class="callout-title">Reasonableness Principle</div>$1</div>'
                )
                .replace(
                  /\[NO_UNFAIR_RESTRICTION\]([\s\S]*?)(?=\n\n|\n[A-Z0-9]|$)/g,
                  '<div class="callout-box"><div class="callout-title">No Unfair Restriction</div>$1</div>'
                )
                .replace(
                  /\[IMPLEMENTATION_NOTE\]([\s\S]*?)(?=\n\n|\n[A-Z0-9]|$)/g,
                  '<div class="callout-box"><div class="callout-title">Implementation Note</div>$1</div>'
                )
                .replace(/• (.*?)(?=\n|$)/g, '<li>$1</li>');

              if (s.number === '16.0') {
                formatted = formatted
                  .replace('{{employee_name}}', `<strong>${employeeName}</strong>`)
                  .replace('{{employee_id}}', `<strong>${employeeId}</strong>`)
                  .replace('{{designation}}', `<strong>${employeeDesignation}</strong>`)
                  .replace('{{date}}', `<strong>${signatureDate}</strong>`);
              }

              return `
              <div class="section-block">
                <div class="section-title">${s.number} ${s.title}</div>
                <div style="font-size: 10pt; color: #1e293b; line-height: 1.6;">
                  ${formatted.replace(/\n\n/g, '<br/><br/>')}
                </div>
              </div>
            `;
            })
            .join('')}

          <!-- TaskNera Official Signatory Footer -->
          <div class="template-footer">
            <div class="footer-accent"></div>
            <div class="signatory-box">
              <div class="signatory-name">Sheetal Bedi</div>
              <div class="signatory-role">CEO & FOUNDER</div>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          height: '90vh',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
          position: 'relative',
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
              }}
            >
              <Shield size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 6,
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                  }}
                >
                  {policy.policyNumber}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                  Active • v{policy.version}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                {policy.name}
              </h3>
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* View Mode Switcher */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#f1f5f9',
                padding: 3,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            >
              <button
                onClick={() => setViewMode('letterhead')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 11px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: viewMode === 'letterhead' ? '#ffffff' : 'transparent',
                  color: viewMode === 'letterhead' ? '#0f172a' : '#64748b',
                  boxShadow: viewMode === 'letterhead' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <Layout size={13} />
                Document View
              </button>
              <button
                onClick={() => setViewMode('accordion')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 11px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: viewMode === 'accordion' ? '#ffffff' : 'transparent',
                  color: viewMode === 'accordion' ? '#0f172a' : '#64748b',
                  boxShadow: viewMode === 'accordion' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <List size={13} />
                List View
              </button>
            </div>

            {/* Employee Selector for Section 16 */}
            {employees.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} style={{ color: '#64748b' }} />
                <select
                  value={selectedEmployee?.id || ''}
                  onChange={(e) => {
                    const found = employees.find((emp) => emp.id === e.target.value);
                    if (found) setSelectedEmployee(found);
                  }}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Edit Policy Toolbar Button */}
            <button
              type="button"
              onClick={() => handleOpenEditor()}
              title="Edit policy clauses"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 13px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isEditorOpen ? '#ffffff' : '#2563eb',
                backgroundColor: isEditorOpen ? '#2563eb' : '#eff6ff',
                border: '1px solid',
                borderColor: isEditorOpen ? '#2563eb' : '#bfdbfe',
                borderRadius: 6,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Edit3 size={13} />
              {isEditorOpen ? 'Close Editor' : 'Edit Policy'}
            </button>

            <button
              onClick={handleCopy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: copied ? '#15803d' : '#334155',
                backgroundColor: copied ? '#f0fdf4' : '#f8fafc',
                border: '1px solid',
                borderColor: copied ? '#86efac' : '#cbd5e1',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#2563eb',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <Printer size={13} />
              Print PDF
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(policy)}
                title="Delete this policy"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#dc2626',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                  e.currentTarget.style.color = '#dc2626';
                }}
              >
                <Trash2 size={13} />
                Delete Policy
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                padding: 6,
                borderRadius: 6,
                border: 'none',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* AI POLICY SECTION EDITOR PANEL                                            */}
        {/* ========================================================================= */}
        {isEditorOpen && (
          <div
            style={{
              backgroundColor: '#fbfbfe',
              borderBottom: '2px solid #8b5cf6',
              padding: '16px 20px',
              boxShadow: '0 4px 18px rgba(124, 58, 237, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Editor Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <Sparkles size={16} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      AI Policy Section Editor
                    </h4>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 10,
                        backgroundColor: '#ede9fe',
                        color: '#6d28d9',
                      }}
                    >
                      Natural Language Refinement
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Select any section and enter a prompt to rewrite, add clauses, adjust notice periods, or increase compliance penalties.
                  </p>
                </div>
              </div>

              {/* Mode Tabs (AI Prompt vs Manual Edit) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    backgroundColor: '#e2e8f0',
                    padding: 3,
                    borderRadius: 8,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setEditorTab('prompt')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: editorTab === 'prompt' ? '#ffffff' : 'transparent',
                      color: editorTab === 'prompt' ? '#7c3aed' : '#64748b',
                      boxShadow: editorTab === 'prompt' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Sparkles size={12} />
                    Prompt Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('manual')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: 6,
                      border: 'none',
                      backgroundColor: editorTab === 'manual' ? '#ffffff' : 'transparent',
                      color: editorTab === 'manual' ? '#0f172a' : '#64748b',
                      boxShadow: editorTab === 'manual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Edit3 size={12} />
                    Manual Edit
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  style={{
                    padding: 5,
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                  title="Close Editor"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Section Selector Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155' }}>
                Section to Edit:
              </span>
              <select
                value={selectedSectionNum}
                onChange={(e) => handleSectionSelectChange(e.target.value)}
                disabled={isApplyingEdit}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  borderRadius: 6,
                  border: '1.5px solid #c4b5fd',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  minWidth: '260px',
                  cursor: 'pointer',
                }}
              >
                {policy.sections.map((s) => (
                  <option key={s.number} value={s.number}>
                    § {s.number} — {s.title}
                  </option>
                ))}
                <option value="NEW">+ Add New Section / Provision</option>
              </select>

              {/* Toggle to peek at current section text */}
              {selectedSectionNum !== 'NEW' && (
                <button
                  type="button"
                  onClick={() => setShowCurrentSectionPreview(!showCurrentSectionPreview)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6366f1',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <FileText size={12} />
                  {showCurrentSectionPreview ? 'Hide Current Section Text' : 'View Current Section Text'}
                </button>
              )}
            </div>

            {/* Current Section Preview Collapse */}
            {showCurrentSectionPreview && selectedSectionNum !== 'NEW' && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: '0.78125rem',
                  color: '#475569',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line',
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  Current Section Text (§ {selectedSectionNum} {policy.sections.find((s) => s.number === selectedSectionNum)?.title}):
                </div>
                {policy.sections.find((s) => s.number === selectedSectionNum)?.content}
              </div>
            )}

            {/* TAB 1: AI PROMPT EDIT */}
            {editorTab === 'prompt' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #a855f7',
                    borderRadius: 8,
                    padding: '8px 12px',
                    boxShadow: '0 2px 8px rgba(168, 85, 247, 0.08)',
                  }}
                >
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleApplyPromptEdit();
                      }
                    }}
                    placeholder={`e.g. For § ${selectedSectionNum}, increase the notice period to 60 days, forbid working with competing logistics firms for 12 months, and add liquidated damages penalty of ₹5,00,000 for breach...`}
                    rows={2}
                    disabled={isApplyingEdit}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      fontSize: '0.84rem',
                      color: '#0f172a',
                      fontFamily: 'inherit',
                      lineHeight: 1.45,
                      backgroundColor: 'transparent',
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                      paddingTop: 8,
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Press <strong>Ctrl + Enter</strong> to apply
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {editPrompt && (
                        <button
                          type="button"
                          onClick={() => setEditPrompt('')}
                          disabled={isApplyingEdit}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            padding: '4px 8px',
                          }}
                        >
                          Clear
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleApplyPromptEdit()}
                        disabled={isApplyingEdit || !editPrompt.trim()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 16px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: '#ffffff',
                          background: isApplyingEdit
                            ? '#94a3b8'
                            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          border: 'none',
                          borderRadius: 6,
                          cursor: isApplyingEdit || !editPrompt.trim() ? 'not-allowed' : 'pointer',
                          boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isApplyingEdit ? (
                          <>
                            <RefreshCw size={13} className="spin" />
                            Applying Prompt Changes...
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} />
                            Apply Changes to Section
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick prompt suggestion chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Sparkles size={10} color="#8b5cf6" /> Quick Prompts:
                  </span>
                  {[
                    'Stricter penalties: require 60-day notice and ₹5,00,000 liquidated damages',
                    'Add 12-month non-compete and non-solicitation of clients',
                    'Generative AI prohibition: strictly forbid uploading company source code or PII to LLMs',
                    'Remote work mandate: require VPN, secure dual-factor devices and manager written approval',
                    'Clarify escalation process and zero-tolerance disciplinary consequences',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={isApplyingEdit}
                      onClick={() => {
                        setEditPrompt(preset);
                        handleApplyPromptEdit(preset);
                      }}
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 9px',
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        color: '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f3ff';
                        e.currentTarget.style.borderColor = '#c4b5fd';
                        e.currentTarget.style.color = '#6d28d9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.color = '#475569';
                      }}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* TAB 2: MANUAL TEXT EDIT */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Section Title:
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. Dual Employment, Moonlighting & Restrictive Covenants"
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      fontSize: '0.8125rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Section Content:
                  </label>
                  <textarea
                    value={manualContent}
                    onChange={(e) => setManualContent(e.target.value)}
                    placeholder="Enter or paste formal clauses, bullet points, or operational standards..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '0.8125rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      fontFamily: 'inherit',
                      lineHeight: 1.45,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyManualEdit}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '5px 14px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      backgroundColor: '#2563eb',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <Save size={12} />
                    Save Section Text
                  </button>
                </div>
              </div>
            )}

            {/* Success message banner */}
            {editSuccessMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 6,
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  fontSize: '0.78125rem',
                }}
              >
                <CheckCircle2 size={14} />
                <span>
                  <strong>Success:</strong> {editSuccessMsg} (Version updated to <strong>v{policy.version}</strong>). Changes reflected in the policy below!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Reading Progress Indicator */}
        <div
          style={{
            width: '100%',
            height: 3,
            backgroundColor: '#e2e8f0',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${scrollProgress}%`,
              backgroundColor: policy.color || '#2563eb',
              transition: 'width 0.12s ease-out',
            }}
          />
        </div>

        {/* Modal Scrollable Workspace */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: '#f1f5f9',
            scrollBehavior: 'smooth',
          }}
        >
          {viewMode === 'letterhead' ? (
            /* ================================================================= */
            /* OFFICIAL TASKNERA TEMPLATE LETTERHEAD VIEW (A4 Paper Aesthetic)   */
            /* ================================================================= */
            <div
              style={{
                maxWidth: '820px',
                margin: '0 auto',
                backgroundColor: '#ffffff',
                borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                padding: '36px 44px',
                color: '#0f172a',
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                position: 'relative',
              }}
            >
              {/* Template Top Header Banner (Peach & Taupe) */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', height: 20, marginBottom: 12 }}>
                  <div
                    style={{
                      width: '55%',
                      backgroundColor: '#eed7b9',
                      borderBottomRightRadius: 14,
                    }}
                  />
                  <div
                    style={{
                      width: '45%',
                      backgroundColor: '#87726b',
                    }}
                  />
                </div>

                {/* Logo + Right Contact Box */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img
                      src="/logo.png"
                      alt="TaskNera"
                      style={{ width: 44, height: 44, objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: '26px',
                          fontWeight: 900,
                          letterSpacing: '-0.02em',
                          color: '#111827',
                          lineHeight: 1.1,
                        }}
                      >
                        TASKNERA
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#2563eb',
                          letterSpacing: '0.04em',
                          marginTop: 2,
                        }}
                      >
                        Global HR · Recruitment · Workforce Solutions
                      </div>
                    </div>
                  </div>

                  {/* Contact Box with vertical border */}
                  <div
                    style={{
                      borderLeft: '2.5px solid #0f172a',
                      paddingLeft: 14,
                      fontSize: '11px',
                      lineHeight: 1.5,
                      color: '#1e293b',
                    }}
                  >
                    <div><strong>Phone:</strong> +91 7065278229</div>
                    <div><strong>Email:</strong> careers@tasknera.com</div>
                    <div><strong>ADD:</strong> D-57 Dilshad Colony, Delhi, 110095</div>
                  </div>
                </div>

                {/* Solid Divider */}
                <div style={{ height: 2.5, backgroundColor: '#0f172a', width: '100%' }} />
              </div>

              {/* Running Header Subtitle */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  color: '#64748b',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: 6,
                  marginBottom: 24,
                }}
              >
                <span>TaskNera Corporate Governance</span>
                <span>HR Policy Manual • Ref: {policy.policyNumber}</span>
              </div>

              {/* Policy Hero Header */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px 20px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  marginBottom: 24,
                }}
              >
                <h1
                  style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#0f172a',
                    margin: '0 0 6px 0',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {policy.name}
                </h1>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: 14 }}>
                  {policy.subtitle || 'Employee, Contractor & Business Partner IP Standards'}
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: '11.5px',
                    backgroundColor: '#f8fafc',
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                >
                  <span><strong>Reference:</strong> {policy.policyNumber}</span>
                  <span>•</span>
                  <span><strong>Version:</strong> {policy.version}</span>
                  <span>•</span>
                  <span><strong>Effective:</strong> {policy.effectiveDate}</span>
                </div>
              </div>

              {/* Policy Intent Callout */}
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderLeft: '4px solid #16a34a',
                  padding: '12px 16px',
                  borderRadius: 6,
                  marginBottom: 24,
                  fontSize: '12px',
                  color: '#166534',
                  lineHeight: 1.55,
                }}
              >
                <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '11px', marginBottom: 4 }}>
                  Policy Intent
                </div>
                {policy.summary}
              </div>

              {/* Table of Contents Box */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '16px 20px',
                  borderRadius: 8,
                  marginBottom: 28,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOpen size={15} style={{ color: policy.color || '#2563eb' }} />
                    Table of Contents
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Click section to scroll directly
                  </span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '6px 14px',
                    fontSize: '12px',
                  }}
                >
                  {policy.sections.map((s) => {
                    const isActive = activeSection === s.number;
                    return (
                      <div
                        key={s.number}
                        onClick={() => scrollToSection(s.number)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: isActive ? '#1d4ed8' : '#334155',
                          backgroundColor: isActive ? '#eff6ff' : 'transparent',
                          padding: '4px 8px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                            e.currentTarget.style.color = '#0f172a';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#334155';
                          }
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <strong style={{ color: isActive ? '#2563eb' : '#475569' }}>{s.number}</strong>
                          <span>{s.title}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sections Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {policy.sections.map((s) => {
                  const isHighlighted = highlightedSection === s.number;
                  return (
                    <div
                      id={`policy-section-${s.number}`}
                      key={s.number}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        paddingBottom: 18,
                        paddingTop: 8,
                        scrollMarginTop: '20px',
                        borderRadius: 8,
                        backgroundColor: isHighlighted ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                        paddingLeft: isHighlighted ? 12 : 0,
                        paddingRight: isHighlighted ? 12 : 0,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 10,
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: '15px',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <span style={{ color: '#2563eb' }}>{s.number}</span>
                          {s.title}
                        </h3>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditor(s.number);
                          }}
                          title={`Edit § ${s.number} using AI prompt`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 6,
                            border: '1px solid #ddd6fe',
                            backgroundColor: '#f5f3ff',
                            color: '#7c3aed',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#7c3aed';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f5f3ff';
                            e.currentTarget.style.color = '#7c3aed';
                          }}
                        >
                          <Sparkles size={11} />
                          Edit with Prompt
                        </button>
                      </div>

                      <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.65 }}>
                        {/* Custom Renderers for Callouts and Content */}
                        {s.content.includes('[CORE_STANDARD]') ? (
                          <div>
                            <p style={{ margin: '0 0 10px 0' }}>
                              {s.content.split('[CORE_STANDARD]')[0].trim()}
                            </p>
                            <div
                              style={{
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderLeft: '4px solid #2563eb',
                                padding: '10px 14px',
                                borderRadius: 6,
                                margin: '10px 0',
                                fontSize: '12px',
                                color: '#1e40af',
                              }}
                            >
                              <strong style={{ display: 'block', marginBottom: 3 }}>Core Standard:</strong>
                              {s.content.split('[CORE_STANDARD]')[1].trim()}
                            </div>
                          </div>
                        ) : s.content.includes('[REASONABLENESS_PRINCIPLE]') ? (
                          <div>
                            <p style={{ margin: '0 0 10px 0' }}>
                              {s.content.split('[REASONABLENESS_PRINCIPLE]')[0].trim()}
                            </p>
                            <div
                              style={{
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderLeft: '4px solid #16a34a',
                                padding: '10px 14px',
                                borderRadius: 6,
                                margin: '10px 0',
                                fontSize: '12px',
                                color: '#166534',
                              }}
                            >
                              <strong style={{ display: 'block', marginBottom: 3 }}>Reasonableness Principle:</strong>
                              {s.content.split('[REASONABLENESS_PRINCIPLE]')[1].trim()}
                            </div>
                          </div>
                        ) : s.content.includes('[NO_UNFAIR_RESTRICTION]') ? (
                          <div>
                            <p style={{ margin: '0 0 10px 0' }}>
                              {s.content.split('[NO_UNFAIR_RESTRICTION]')[0].trim()}
                            </p>
                            <div
                              style={{
                                backgroundColor: '#fef3c7',
                                border: '1px solid #fde68a',
                                borderLeft: '4px solid #d97706',
                                padding: '10px 14px',
                                borderRadius: 6,
                                margin: '10px 0',
                                fontSize: '12px',
                                color: '#92400e',
                              }}
                            >
                              <strong style={{ display: 'block', marginBottom: 3 }}>No Unfair Restriction:</strong>
                              {s.content.split('[NO_UNFAIR_RESTRICTION]')[1].trim()}
                            </div>
                          </div>
                        ) : s.content.includes('[IMPLEMENTATION_NOTE]') ? (
                          <div>
                            <p style={{ margin: '0 0 10px 0' }}>
                              {s.content.split('[IMPLEMENTATION_NOTE]')[0].trim()}
                            </p>
                            <div
                              style={{
                                backgroundColor: '#f5f3ff',
                                border: '1px solid #ddd6fe',
                                borderLeft: '4px solid #7c3aed',
                                padding: '10px 14px',
                                borderRadius: 6,
                                margin: '10px 0',
                                fontSize: '12px',
                                color: '#5b21b6',
                              }}
                            >
                              <strong style={{ display: 'block', marginBottom: 3 }}>Implementation Note:</strong>
                              {s.content.split('[IMPLEMENTATION_NOTE]')[1].trim()}
                            </div>
                          </div>
                        ) : s.number === '3.0' ? (
                          /* Section 3: Definitions Table */
                          <div>
                            <p style={{ margin: '0 0 10px 0' }}>
                              The following authoritative terms apply across all TaskNera governance, contracts, and IP management:
                            </p>
                            <table
                              style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '11.5px',
                                margin: '10px 0',
                              }}
                            >
                              <thead>
                                <tr style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '28%', border: '1px solid #cbd5e1' }}>Term</th>
                                  <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Meaning</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  { term: 'Intellectual Property (IP)', meaning: 'Rights and interests in creations and business assets such as copyright, patents, designs, trademarks, trade secrets, confidential know-how, databases, documentation, software, processes, methodologies and other protectable subject matter.' },
                                  { term: 'Company IP', meaning: 'IP owned by, assigned to, licensed to or otherwise lawfully controlled by TaskNera.' },
                                  { term: 'Work Product', meaning: 'Deliverables, documents, reports, templates, training materials, research, processes, software, workflows, designs, content or other outputs created for TaskNera or its clients.' },
                                  { term: 'Pre-Existing IP', meaning: 'IP that was created, acquired or owned by a person before joining TaskNera or independently of their TaskNera duties, subject to any prior contractual obligations.' },
                                  { term: 'Confidential Information', meaning: 'Non-public information relating to TaskNera, its clients, candidates, employees, vendors, operations, technology, commercial terms or strategy, whether or not formally marked confidential.' },
                                  { term: 'Third-Party IP', meaning: 'IP owned by another person or organization, including clients, vendors, software providers, candidates, content owners or other external parties.' },
                                  { term: 'Substantial Company Resources', meaning: 'Material use of Company funding, proprietary tools, confidential information, specialized equipment, paid development time, or other resources beyond ordinary workplace access.' },
                                ].map((row, idx) => (
                                  <tr key={row.term} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                    <td style={{ padding: '8px 10px', fontWeight: 700, border: '1px solid #cbd5e1' }}>{row.term}</td>
                                    <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>{row.meaning}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : s.number === '10.0' ? (
                          /* Section 10: Disclosure Table */
                          <div>
                            <p style={{ margin: '0 0 10px 0' }}>
                              Potentially valuable inventions, software, designs, branded assets, proprietary processes, original content and other IP that may be commercially relevant should be disclosed promptly:
                            </p>
                            <table
                              style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '11.5px',
                                margin: '10px 0',
                              }}
                            >
                              <thead>
                                <tr style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '22%', border: '1px solid #cbd5e1' }}>Activity</th>
                                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '32%', border: '1px solid #cbd5e1' }}>Responsible Party</th>
                                  <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #cbd5e1' }}>Expected Standard</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  { activity: 'Initial disclosure', party: 'Employee / creator', standard: 'Provide a clear description, date, contributors and relevant project context.' },
                                  { activity: 'Ownership review', party: 'Management / HR / designated reviewer', standard: 'Check role, contract, client terms, pre-existing rights and applicable law.' },
                                  { activity: 'Registration / protection', party: 'Authorised Company representative', standard: 'Use appropriate filing, licensing, assignment or confidentiality measures where justified.' },
                                  { activity: 'Records', party: 'Company / relevant function', standard: 'Maintain approvals, assignments, licences and material correspondence in an accessible record.' },
                                ].map((row, idx) => (
                                  <tr key={row.activity} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                    <td style={{ padding: '8px 10px', fontWeight: 700, border: '1px solid #cbd5e1' }}>{row.activity}</td>
                                    <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>{row.party}</td>
                                    <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>{row.standard}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : s.number === '16.0' ? (
                          /* Section 16: Employee Acknowledgement Block */
                          <div
                            style={{
                              border: '1.5px solid #0f172a',
                              borderRadius: 8,
                              padding: '16px 20px',
                              backgroundColor: '#f8fafc',
                              marginTop: 10,
                            }}
                          >
                            <p style={{ margin: '0 0 14px 0', fontSize: '12px', lineHeight: 1.6 }}>
                              I confirm that I have received, read and understood the TaskNera Intellectual Property & Work Product Policy (Reference ID: {policy.policyNumber}). I understand my responsibilities to protect Company and client IP, respect third-party rights, disclose relevant IP issues in good faith, and comply with applicable agreements and law. I also understand that the policy is intended to be applied fairly and that genuine personal work unrelated to my employment is not automatically treated as Company property.
                            </p>

                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: 12,
                                fontSize: '12px',
                                borderTop: '1px solid #cbd5e1',
                                paddingTop: 14,
                              }}
                            >
                              <div>
                                <span style={{ color: '#64748b' }}>Employee Name:</span>
                                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', marginTop: 2 }}>
                                  {employeeName}
                                </div>
                              </div>
                              <div>
                                <span style={{ color: '#64748b' }}>Employee ID:</span>
                                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', marginTop: 2 }}>
                                  {employeeId}
                                </div>
                              </div>
                              <div>
                                <span style={{ color: '#64748b' }}>Designation:</span>
                                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', marginTop: 2 }}>
                                  {employeeDesignation}
                                </div>
                              </div>
                              <div>
                                <span style={{ color: '#64748b' }}>Date:</span>
                                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px', marginTop: 2 }}>
                                  {signatureDate}
                                </div>
                              </div>
                            </div>

                            <div style={{ marginTop: 14, borderTop: '1px dashed #cbd5e1', paddingTop: 10, fontSize: '11px', color: '#64748b' }}>
                              Signature: _________________________________________ (Digitally Recorded on Employee Profile)
                            </div>
                          </div>
                        ) : (
                          /* Standard section with bullet parsing */
                          <div style={{ whiteSpace: 'pre-line' }}>
                            {s.content}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Template Bottom Signatory Footer (Matches Document 2) */}
              <div
                style={{
                  marginTop: 36,
                  paddingTop: 16,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                {/* Bottom left decorative accent from template */}
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <div
                    style={{
                      width: 140,
                      height: 26,
                      backgroundColor: '#87726b',
                      borderTopRightRadius: 18,
                    }}
                  />
                  <div
                    style={{
                      width: 40,
                      height: 12,
                      backgroundColor: '#eed7b9',
                    }}
                  />
                </div>

                {/* Bottom right signatory */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>
                    Sheetal Bedi
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#475569',
                      letterSpacing: '0.04em',
                      marginTop: 2,
                    }}
                  >
                    CEO & FOUNDER
                  </div>
                </div>
              </div>

              {/* Running document footer line */}
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: '#94a3b8',
                }}
              >
                <span>Confidential & Proprietary</span>
                <span>{policy.policyNumber}</span>
                <span>Page 10 of 10</span>
              </div>
            </div>
          ) : (
            /* ================================================================= */
            /* ACCORDION CLAUSE VIEW                                             */
            /* ================================================================= */
            <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {policy.sections.map((section) => {
                const isCollapsed = expandedSections[section.number] === false;

                return (
                  <div
                    id={`policy-section-acc-${section.number}`}
                    key={section.number}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 10,
                      border: highlightedSection === section.number ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                      overflow: 'hidden',
                      boxShadow: highlightedSection === section.number ? '0 4px 14px rgba(37, 99, 235, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
                      scrollMarginTop: '20px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div
                      onClick={() => toggleSection(section.number)}
                      style={{
                        padding: '12px 18px',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: 6,
                            backgroundColor: '#e2e8f0',
                            color: '#1e293b',
                          }}
                        >
                          § {section.number}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                          {section.title}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditor(section.number);
                          }}
                          title={`Edit § ${section.number} with AI prompt`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                            border: '1px solid #ddd6fe',
                            backgroundColor: '#ffffff',
                            color: '#7c3aed',
                            cursor: 'pointer',
                          }}
                        >
                          <Sparkles size={10} />
                          Edit
                        </button>
                        <div style={{ color: '#64748b' }}>
                          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </div>
                      </div>
                    </div>

                    {!isCollapsed && (
                      <div
                        style={{
                          padding: '16px 20px',
                          fontSize: '0.84rem',
                          color: '#334155',
                          lineHeight: 1.65,
                          backgroundColor: '#ffffff',
                          borderTop: '1px solid #f1f5f9',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {section.number === '16.0'
                          ? section.content
                              .replace('{{employee_name}}', employeeName)
                              .replace('{{employee_id}}', employeeId)
                              .replace('{{designation}}', employeeDesignation)
                              .replace('{{date}}', signatureDate)
                          : section.content
                              .replace(/\[CORE_STANDARD\]/g, '\n[Core Standard]\n')
                              .replace(/\[REASONABLENESS_PRINCIPLE\]/g, '\n[Reasonableness Principle]\n')
                              .replace(/\[NO_UNFAIR_RESTRICTION\]/g, '\n[No Unfair Restriction]\n')
                              .replace(/\[IMPLEMENTATION_NOTE\]/g, '\n[Implementation Note]\n')
                              .replace(/\[DEFINITIONS_TABLE\]/g, '')
                              .replace(/\[DISCLOSURE_TABLE\]/g, '')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Scroll-To-Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            title="Scroll back to top"
            style={{
              position: 'absolute',
              bottom: 22,
              right: 26,
              zIndex: 60,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 24,
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.backgroundColor = '#1e293b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = '#0f172a';
            }}
          >
            <ArrowUp size={14} />
            <span>Top ({Math.round(scrollProgress)}%)</span>
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};
