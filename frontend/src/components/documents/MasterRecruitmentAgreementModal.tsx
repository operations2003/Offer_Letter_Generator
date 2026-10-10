import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Save,
  Plus,
  Trash2,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  ArrowLeft,
  FileCheck2,
  Building2,
  Calendar,
  DollarSign,
  ShieldCheck,
  Scale,
  Copy,
  RotateCcw,
  Highlighter,
  FileText,
  Briefcase,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import {
  MrsaAgreementData,
  MrsaSectionItem,
  MrsaClauseItem,
  MrsaCommercialRow,
  MrsaSecurityItem,
  INITIAL_MRSA_DATA,
  getDeepCloneMrsaData,
} from '../../services/mrsaCatalog.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface MasterRecruitmentAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialClientName?: string;
}

export const MasterRecruitmentAgreementModal: React.FC<MasterRecruitmentAgreementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialClientName,
}) => {
  const { success, error, info } = useToast();

  // Navigation steps: 1 = Editor / Customizer, 2 = Official PDF Preview
  const [step, setStep] = useState<1 | 2>(1);

  // Editor sub-tabs
  const [editorTab, setEditorTab] = useState<'PARTIES' | 'SECTIONS' | 'SCHEDULE_A' | 'EXECUTION' | 'SCHEDULE_B'>('SECTIONS');

  // Main agreement state
  const [data, setData] = useState<MrsaAgreementData>(() => {
    const initial = getDeepCloneMrsaData();
    if (initialClientName) {
      initial.client.legalName = initialClientName.toUpperCase();
      initial.client.tradeName = initialClientName;
    }
    return initial;
  });

  // Section search / filter in editor
  const [sectionSearch, setSectionSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sec_1: true,
    sec_2: false,
    sec_3: false,
    sec_5: false,
    sec_7: false,
  });

  // UI state
  const [highlightPlaceholders, setHighlightPlaceholders] = useState(false);
  const [inlineEditMode, setInlineEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Section Form Modal / Drawer state
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionNumber, setNewSectionNumber] = useState<number>(() => data.sections.length + 1);
  const [newSectionClauseTitle, setNewSectionClauseTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');

  // New Commercial Row State
  const [isAddingCommercial, setIsAddingCommercial] = useState(false);
  const [newCommercialTerm, setNewCommercialTerm] = useState('');
  const [newCommercialTermsValue, setNewCommercialTermsValue] = useState('');

  // Scroll ref
  const previewScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialClientName) {
      setData((prev) => ({
        ...prev,
        client: {
          ...prev.client,
          legalName: initialClientName.toUpperCase(),
          tradeName: initialClientName,
        },
      }));
    }
  }, [isOpen, initialClientName]);

  // Toggle expand / collapse for a section
  const toggleSection = (secId: string) => {
    setExpandedSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    data.sections.forEach((s) => (all[s.id] = true));
    setExpandedSections(all);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  // Section mutation helpers
  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, title } : s)),
    }));
  };

  const handleUpdateSectionNumber = (sectionId: string, number: number) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, number } : s)),
    }));
  };

  const handleMoveSection = (index: number, direction: 'UP' | 'DOWN') => {
    const newSections = [...data.sections];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    // Renumber sequentially
    const renumbered = newSections.map((s, idx) => ({ ...s, number: idx + 1 }));
    setData((prev) => ({ ...prev, sections: renumbered }));
  };

  const handleDeleteSection = (sectionId: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove section "${title}"? You can restore default template anytime.`)) {
      setData((prev) => {
        const filtered = prev.sections.filter((s) => s.id !== sectionId);
        // Renumber
        const renumbered = filtered.map((s, idx) => ({ ...s, number: idx + 1 }));
        return { ...prev, sections: renumbered };
      });
      success(`Section removed: ${title}`);
    }
  };

  const handleAddSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) {
      error('Please enter a section title');
      return;
    }
    const newId = `sec_custom_${Date.now()}`;
    const newNum = newSectionNumber || data.sections.length + 1;
    const newSection: MrsaSectionItem = {
      id: newId,
      number: newNum,
      title: newSectionTitle.trim(),
      clauses: [
        {
          id: `c_${newId}_1`,
          clauseNumber: `${newNum}.1`,
          title: newSectionClauseTitle.trim() || 'General Provision',
          paragraphs: [newSectionContent.trim() || 'The Parties agree to the terms and stipulations outlined herein.'],
        },
      ],
    };

    setData((prev) => {
      const updated = [...prev.sections, newSection];
      // Sort or renumber
      const renumbered = updated.map((s, idx) => ({ ...s, number: idx + 1 }));
      return { ...prev, sections: renumbered };
    });

    setExpandedSections((prev) => ({ ...prev, [newId]: true }));
    setIsAddingSection(false);
    setNewSectionTitle('');
    setNewSectionClauseTitle('');
    setNewSectionContent('');
    success(`Added new section: ${newSectionTitle}`);
  };

  // Clause editing
  const handleUpdateClauseParagraph = (sectionId: string, clauseId: string, pIdx: number, val: string) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          clauses: s.clauses.map((c) => {
            if (c.id !== clauseId) return c;
            const newParas = [...c.paragraphs];
            newParas[pIdx] = val;
            return { ...c, paragraphs: newParas };
          }),
        };
      }),
    }));
  };

  const handleAddClauseToSection = (sectionId: string, secNumber: number) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const nextSubNumber = `${secNumber}.${s.clauses.length + 1}`;
        const newClause: MrsaClauseItem = {
          id: `c_${sectionId}_${Date.now()}`,
          clauseNumber: nextSubNumber,
          title: 'Additional Clause',
          paragraphs: ['Enter specific legal clause or procedural description here.'],
        };
        return { ...s, clauses: [...s.clauses, newClause] };
      }),
    }));
  };

  const handleDeleteClause = (sectionId: string, clauseId: string) => {
    setData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          clauses: s.clauses.filter((c) => c.id !== clauseId),
        };
      }),
    }));
  };

  // Schedule A Commercial terms helpers
  const handleUpdateCommercialRow = (rowId: string, field: 'term' | 'masterTerms', val: string) => {
    setData((prev) => ({
      ...prev,
      scheduleA: prev.scheduleA.map((r) => (r.id === rowId ? { ...r, [field]: val } : r)),
    }));
  };

  const handleDeleteCommercialRow = (rowId: string) => {
    setData((prev) => ({
      ...prev,
      scheduleA: prev.scheduleA.filter((r) => r.id !== rowId),
    }));
  };

  const handleAddCommercialRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommercialTerm.trim()) {
      error('Please enter a term name');
      return;
    }
    const newRow: MrsaCommercialRow = {
      id: `sch_a_${Date.now()}`,
      term: newCommercialTerm.trim(),
      masterTerms: newCommercialTermsValue.trim() || 'As mutually agreed in writing.',
    };
    setData((prev) => ({ ...prev, scheduleA: [...prev.scheduleA, newRow] }));
    setIsAddingCommercial(false);
    setNewCommercialTerm('');
    setNewCommercialTermsValue('');
    success(`Added commercial term: ${newRow.term}`);
  };

  // Schedule B helpers
  const handleUpdateSecurityItem = (itemId: string, field: 'title' | 'content', val: string) => {
    setData((prev) => ({
      ...prev,
      scheduleB: prev.scheduleB.map((item) => (item.id === itemId ? { ...item, [field]: val } : item)),
    }));
  };

  const handleDeleteSecurityItem = (itemId: string) => {
    setData((prev) => ({
      ...prev,
      scheduleB: prev.scheduleB.filter((item) => item.id !== itemId),
    }));
  };

  const handleAddSecurityItem = () => {
    const nextCode = `B.${data.scheduleB.length + 1}`;
    const newItem: MrsaSecurityItem = {
      id: `sch_b_${Date.now()}`,
      code: nextCode,
      title: 'Security Control',
      content: 'Parties agree to follow defined technical and operational safeguards.',
    };
    setData((prev) => ({ ...prev, scheduleB: [...prev.scheduleB, newItem] }));
  };

  // Reset to default template
  const handleResetDefaults = () => {
    if (window.confirm('Reset all agreement clauses and party details to the official 21-page PDF defaults?')) {
      setData(getDeepCloneMrsaData());
      success('MRSA template restored to official 21-page defaults');
    }
  };

  // Filtered sections for search
  const filteredSections = useMemo(() => {
    const q = sectionSearch.toLowerCase().trim();
    if (!q) return data.sections;
    return data.sections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        String(s.number).includes(q) ||
        s.clauses.some(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.clauseNumber.toLowerCase().includes(q) ||
            c.paragraphs.some((p) => p.toLowerCase().includes(q))
        )
    );
  }, [data.sections, sectionSearch]);

  // Download / Print PDF using iframe
  const handleDownloadPdf = () => {
    const printableElement = document.getElementById('printable-mrsa-agreement');
    if (!printableElement) {
      window.print();
      return;
    }

    const docTitle = `TaskNera_MRSA_${data.client.tradeName.replace(/\s+/g, '_')}_${data.agreementNumber.replace(/[\/\\]/g, '_')}`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 14mm 16mm 14mm 16mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #0f172a;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              font-size: 9pt;
              line-height: 1.5;
            }
            .page-break {
              page-break-before: always !important;
              break-before: page !important;
            }
            .avoid-break {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 6px 8px;
              vertical-align: top;
            }
            th {
              background-color: #f1f5f9 !important;
              font-weight: 700;
              color: #0f172a;
            }
          </style>
        </head>
        <body>
          ${printableElement.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed:', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }
    }, 300);
  };

  // Save to system generated documents
  const handleSaveToGeneratedDocuments = async () => {
    setIsSaving(true);
    try {
      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'MSA',
          title: `Master Recruitment Services Agreement — ${data.client.tradeName}`,
          recipientName: data.client.signatoryName,
          recipientEmail: data.client.email,
          signatoryName: data.serviceProvider.signatoryName,
          signatoryTitle: data.serviceProvider.signatoryDesignation,
          effectiveDate: data.effectiveDate,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            agreementNumber: data.agreementNumber,
            client: data.client,
            serviceProvider: data.serviceProvider,
            effectiveDate: data.effectiveDate,
            sectionsCount: data.sections.length,
            scheduleA: data.scheduleA,
            scheduleB: data.scheduleB,
          });
        }
      } catch (backendErr) {
        console.warn('Backend createDocument fallback:', backendErr);
      }

      const localDoc: HrDocument = {
        id: createdDoc?.id || `doc_mrsa_${Date.now()}`,
        companyId: 'company_default',
        documentTypeCode: 'MSA',
        referenceNumber: createdDoc?.referenceNumber || data.agreementNumber,
        title: `Master Recruitment Services Agreement — ${data.client.tradeName}`,
        templateId: 'tmpl_mrsa_official_21p',
        templateVersionId: 'v1.0',
        recipientName: data.client.legalName,
        recipientEmail: data.client.email,
        currentStatus: 'APPROVED',
        aiReviewStatus: 'VERIFIED_BY_HR',
        signatoryName: data.serviceProvider.signatoryName,
        signatoryTitle: data.serviceProvider.signatoryDesignation,
        effectiveDate: data.effectiveDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as HrDocument;

      success(`MRSA Agreement for ${data.client.tradeName} saved successfully!`);
      if (onSuccess) {
        onSuccess(localDoc);
      }
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save agreement');
    } finally {
      setIsSaving(false);
    }
  };

  // Copy agreement text
  const handleCopyText = () => {
    let text = `${data.documentTitle}\n${data.documentSubtitle}\nBetween: ${data.client.legalName} and ${data.serviceProvider.legalName}\nEffective Date: ${data.effectiveDate}\n\n`;
    text += `OPERATIVE CLAUSES:\n\n`;
    data.sections.forEach((s) => {
      text += `SECTION ${s.number}: ${s.title.toUpperCase()}\n`;
      s.clauses.forEach((c) => {
        text += `${c.clauseNumber} ${c.title}\n`;
        c.paragraphs.forEach((p) => {
          text += `${p}\n`;
        });
        if (c.subclauses) {
          c.subclauses.forEach((sc) => {
            text += `  ${sc.clauseId} ${sc.text}\n`;
          });
        }
        text += `\n`;
      });
      text += `\n`;
    });
    navigator.clipboard.writeText(text);
    success('MRSA agreement text copied to clipboard!');
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1320,
          height: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#38bdf8',
              }}
            >
              <FileCheck2 size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '1.18rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                  Master Recruitment Services Agreement (MRSA)
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 10,
                    backgroundColor: '#1e293b',
                    color: '#f59e0b',
                    border: '1px solid #d97706',
                  }}
                >
                  Official 21-Page Template
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 10,
                    backgroundColor: '#1e293b',
                    color: '#38bdf8',
                    border: '1px solid #0284c7',
                  }}
                >
                  {data.sections.length} Operative Sections
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                B2B recruitment mandate & commercial agreement between {data.serviceProvider.tradeName} and {data.client.tradeName}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Step Switcher Buttons */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#1e293b',
                padding: 3,
                borderRadius: 8,
                border: '1px solid #334155',
              }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.8125rem',
                  fontWeight: step === 1 ? 700 : 500,
                  backgroundColor: step === 1 ? '#2563eb' : 'transparent',
                  color: step === 1 ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Edit3 size={14} />
                <span>1. Customize & Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.8125rem',
                  fontWeight: step === 2 ? 700 : 500,
                  backgroundColor: step === 2 ? '#2563eb' : 'transparent',
                  color: step === 2 ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <FileText size={14} />
                <span>2. Official PDF Preview</span>
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {step === 1 ? (
            /* ========================================================================= */
            /* STEP 1: CONFIGURATION & EDITABLE SECTIONS BUILDER                         */
            /* ========================================================================= */
            <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
              {/* Left Sub-Nav Tabs */}
              <div
                style={{
                  width: 240,
                  backgroundColor: '#f8fafc',
                  borderRight: '1px solid #e2e8f0',
                  padding: '16px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '0 8px 6px' }}>
                  Agreement Configuration
                </div>

                {[
                  { id: 'SECTIONS', label: 'Operative Clauses', count: `${data.sections.length} Secs`, icon: <Scale size={16} /> },
                  { id: 'PARTIES', label: 'Party Details & Recitals', count: 'Client & Info', icon: <Building2 size={16} /> },
                  { id: 'SCHEDULE_A', label: 'Schedule A: Commercials', count: `${data.scheduleA.length} Terms`, icon: <DollarSign size={16} /> },
                  { id: 'SCHEDULE_B', label: 'Schedule B: Security & Privacy', count: `${data.scheduleB.length} Rules`, icon: <ShieldCheck size={16} /> },
                  { id: 'EXECUTION', label: 'Execution & Signatures', count: 'Dual Signatures', icon: <FileCheck2 size={16} /> },
                ].map((tab) => {
                  const isActive = editorTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setEditorTab(tab.id as any)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 8,
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? 700 : 500,
                        backgroundColor: isActive ? '#eff6ff' : 'transparent',
                        color: isActive ? '#1d4ed8' : '#475569',
                        border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: isActive ? '#2563eb' : '#64748b' }}>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '1px 6px',
                          borderRadius: 8,
                          backgroundColor: isActive ? '#dbeafe' : '#f1f5f9',
                          color: isActive ? '#1e40af' : '#64748b',
                          fontWeight: 700,
                        }}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}

                <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<RotateCcw size={13} />}
                    onClick={handleResetDefaults}
                    style={{ justifyContent: 'center', fontSize: '0.75rem' }}
                  >
                    Reset PDF Defaults
                  </Button>
                </div>
              </div>

              {/* Right Panel: Active Sub-tab Editor */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
                {/* 1. SECTIONS TAB */}
                {editorTab === 'SECTIONS' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Top Action Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          Operative Clauses & Agreement Sections
                        </h3>
                        <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '3px 0 0 0' }}>
                          Add, edit, remove, or reorder any legal clauses in the Master Recruitment Services Agreement.
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Button
                          variant="primary"
                          icon={<Plus size={15} />}
                          onClick={() => {
                            setNewSectionNumber(data.sections.length + 1);
                            setIsAddingSection(true);
                          }}
                          style={{ fontSize: '0.8125rem' }}
                        >
                          Add New Section
                        </Button>
                        <Button variant="secondary" size="sm" onClick={expandAll} style={{ fontSize: '0.75rem' }}>
                          Expand All
                        </Button>
                        <Button variant="secondary" size="sm" onClick={collapseAll} style={{ fontSize: '0.75rem' }}>
                          Collapse All
                        </Button>
                      </div>
                    </div>

                    {/* Search filter */}
                    <div style={{ position: 'relative' }}>
                      <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                      <input
                        type="text"
                        value={sectionSearch}
                        onChange={(e) => setSectionSearch(e.target.value)}
                        placeholder="Search clauses (e.g. 'Placement Fee', 'Replacement', 'Attribution', 'Confidentiality')..."
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 38px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: '0.875rem',
                          backgroundColor: '#ffffff',
                        }}
                      />
                    </div>

                    {/* Modal / Card for Adding a New Section */}
                    {isAddingSection && (
                      <div
                        style={{
                          backgroundColor: '#eff6ff',
                          border: '1.5px solid #3b82f6',
                          borderRadius: 12,
                          padding: '20px',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e40af', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Plus size={18} /> Add New Agreement Section
                          </h4>
                          <button
                            type="button"
                            onClick={() => setIsAddingSection(false)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <form onSubmit={handleAddSectionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12 }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e3a8a', marginBottom: 4 }}>
                                Section No.
                              </label>
                              <input
                                type="number"
                                value={newSectionNumber}
                                onChange={(e) => setNewSectionNumber(parseInt(e.target.value) || 1)}
                                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #93c5fd' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e3a8a', marginBottom: 4 }}>
                                Section Title *
                              </label>
                              <input
                                type="text"
                                value={newSectionTitle}
                                onChange={(e) => setNewSectionTitle(e.target.value)}
                                placeholder="e.g. Service Level Commitments & Turnaround Time"
                                required
                                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #93c5fd' }}
                              />
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e3a8a', marginBottom: 4 }}>
                              Initial Clause Title
                            </label>
                            <input
                              type="text"
                              value={newSectionClauseTitle}
                              onChange={(e) => setNewSectionClauseTitle(e.target.value)}
                              placeholder="e.g. Turnaround targets and SLA commitments"
                              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #93c5fd' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1e3a8a', marginBottom: 4 }}>
                              Clause Paragraph Content *
                            </label>
                            <textarea
                              rows={3}
                              value={newSectionContent}
                              onChange={(e) => setNewSectionContent(e.target.value)}
                              placeholder="Enter the operative clause text here..."
                              required
                              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #93c5fd', fontSize: '0.85rem' }}
                            />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddingSection(false)}>
                              Cancel
                            </Button>
                            <Button variant="primary" size="sm" type="submit" icon={<Check size={14} />}>
                              Save Section
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Sections List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {filteredSections.map((sec, secIdx) => {
                        const isExpanded = expandedSections[sec.id] ?? false;
                        return (
                          <div
                            key={sec.id}
                            style={{
                              backgroundColor: '#ffffff',
                              border: isExpanded ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                              borderRadius: 10,
                              overflow: 'hidden',
                              boxShadow: isExpanded ? '0 4px 12px rgba(37, 99, 235, 0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {/* Section Header Row */}
                            <div
                              style={{
                                padding: '12px 18px',
                                backgroundColor: isExpanded ? '#f8fafc' : '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                                cursor: 'pointer',
                              }}
                              onClick={() => toggleSection(sec.id)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                <span
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    backgroundColor: '#eff6ff',
                                    color: '#2563eb',
                                    fontWeight: 800,
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #bfdbfe',
                                    flexShrink: 0,
                                  }}
                                >
                                  {sec.number}
                                </span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a' }}>
                                    {sec.title}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {sec.clauses.length} clause{sec.clauses.length === 1 ? '' : 's'} included
                                  </div>
                                </div>
                              </div>

                              {/* Controls */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSection(secIdx, 'UP')}
                                  disabled={secIdx === 0}
                                  style={{
                                    padding: '4px 6px',
                                    borderRadius: 6,
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#ffffff',
                                    cursor: secIdx === 0 ? 'not-allowed' : 'pointer',
                                    color: secIdx === 0 ? '#cbd5e1' : '#475569',
                                  }}
                                  title="Move Up"
                                >
                                  <ChevronUp size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSection(secIdx, 'DOWN')}
                                  disabled={secIdx === data.sections.length - 1}
                                  style={{
                                    padding: '4px 6px',
                                    borderRadius: 6,
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#ffffff',
                                    cursor: secIdx === data.sections.length - 1 ? 'not-allowed' : 'pointer',
                                    color: secIdx === data.sections.length - 1 ? '#cbd5e1' : '#475569',
                                  }}
                                  title="Move Down"
                                >
                                  <ChevronDown size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSection(sec.id, sec.title)}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    border: '1px solid #fecaca',
                                    backgroundColor: '#fff1f2',
                                    color: '#e11d48',
                                    cursor: 'pointer',
                                  }}
                                  title="Delete Section"
                                >
                                  <Trash2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleSection(sec.id)}
                                  style={{
                                    padding: '4px 6px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#64748b',
                                  }}
                                >
                                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                              </div>
                            </div>

                            {/* Section Content (Clauses) */}
                            {isExpanded && (
                              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {/* Title edit */}
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', width: 90 }}>
                                    Section Title:
                                  </label>
                                  <input
                                    type="text"
                                    value={sec.title}
                                    onChange={(e) => handleUpdateSectionTitle(sec.id, e.target.value)}
                                    style={{
                                      flex: 1,
                                      padding: '6px 10px',
                                      borderRadius: 6,
                                      border: '1px solid #cbd5e1',
                                      fontWeight: 600,
                                      fontSize: '0.875rem',
                                    }}
                                  />
                                </div>

                                {/* Clauses inside this section */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                  {sec.clauses.map((clause) => (
                                    <div
                                      key={clause.id}
                                      style={{
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        padding: '12px 14px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 8,
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                          <span style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.85rem' }}>
                                            {clause.clauseNumber}
                                          </span>
                                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                                            {clause.title}
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteClause(sec.id, clause.id)}
                                          style={{
                                            padding: '2px 6px',
                                            borderRadius: 4,
                                            border: '1px solid #fecaca',
                                            backgroundColor: '#ffffff',
                                            color: '#e11d48',
                                            cursor: 'pointer',
                                            fontSize: '0.7rem',
                                          }}
                                          title="Remove Clause"
                                        >
                                          Delete Clause
                                        </button>
                                      </div>

                                      {/* Paragraphs */}
                                      {clause.paragraphs.map((para, pIdx) => (
                                        <textarea
                                          key={pIdx}
                                          rows={Math.max(2, Math.ceil(para.length / 110))}
                                          value={para}
                                          onChange={(e) => handleUpdateClauseParagraph(sec.id, clause.id, pIdx, e.target.value)}
                                          style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            borderRadius: 6,
                                            border: '1px solid #cbd5e1',
                                            fontSize: '0.8125rem',
                                            lineHeight: 1.5,
                                            color: '#1e293b',
                                          }}
                                        />
                                      ))}

                                      {/* Sub-bullets if any */}
                                      {clause.subclauses && clause.subclauses.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 12 }}>
                                          {clause.subclauses.map((sub, sIdx) => (
                                            <div key={sub.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                              <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem', minWidth: 24 }}>
                                                {sub.clauseId}
                                              </span>
                                              <input
                                                type="text"
                                                value={sub.text}
                                                onChange={(e) => {
                                                  const newText = e.target.value;
                                                  setData((prev) => ({
                                                    ...prev,
                                                    sections: prev.sections.map((s) => {
                                                      if (s.id !== sec.id) return s;
                                                      return {
                                                        ...s,
                                                        clauses: s.clauses.map((c) => {
                                                          if (c.id !== clause.id) return c;
                                                          const newSubs = [...(c.subclauses || [])];
                                                          newSubs[sIdx] = { ...newSubs[sIdx], text: newText };
                                                          return { ...c, subclauses: newSubs };
                                                        }),
                                                      };
                                                    }),
                                                  }));
                                                }}
                                                style={{
                                                  flex: 1,
                                                  padding: '4px 8px',
                                                  borderRadius: 4,
                                                  border: '1px solid #cbd5e1',
                                                  fontSize: '0.8rem',
                                                }}
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    icon={<Plus size={13} />}
                                    onClick={() => handleAddClauseToSection(sec.id, sec.number)}
                                    style={{ fontSize: '0.75rem' }}
                                  >
                                    Add Clause to Section {sec.number}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. PARTIES TAB */}
                {editorTab === 'PARTIES' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Party Details & Recitals
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '3px 0 0 0' }}>
                        Configure the Client (Hiring Company) and Service Provider (Tasknera) particulars.
                      </p>
                    </div>

                    {/* Metadata Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                          Agreement Reference No.
                        </label>
                        <input
                          type="text"
                          value={data.agreementNumber}
                          onChange={(e) => setData({ ...data, agreementNumber: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                          Effective Date
                        </label>
                        <input
                          type="text"
                          value={data.effectiveDate}
                          onChange={(e) => setData({ ...data, effectiveDate: e.target.value })}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    </div>

                    {/* Client (Bozzo Cabs) Details Form */}
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1.5px solid #2563eb',
                        borderRadius: 12,
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1d4ed8' }}>
                        <Building2 size={20} />
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Client Particulars (Hiring Company)</h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Full Legal Entity Name
                          </label>
                          <input
                            type="text"
                            value={data.client.legalName}
                            onChange={(e) => setData({ ...data, client: { ...data.client, legalName: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Trade Name
                          </label>
                          <input
                            type="text"
                            value={data.client.tradeName}
                            onChange={(e) => setData({ ...data, client: { ...data.client, tradeName: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Legal Constitution / Entity Type
                          </label>
                          <input
                            type="text"
                            value={data.client.legalForm}
                            onChange={(e) => setData({ ...data, client: { ...data.client, legalForm: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Authorised Signatory Name
                          </label>
                          <input
                            type="text"
                            value={data.client.signatoryName}
                            onChange={(e) => setData({ ...data, client: { ...data.client, signatoryName: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Signatory Designation
                          </label>
                          <input
                            type="text"
                            value={data.client.signatoryDesignation}
                            onChange={(e) => setData({ ...data, client: { ...data.client, signatoryDesignation: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Official Email
                          </label>
                          <input
                            type="email"
                            value={data.client.email}
                            onChange={(e) => setData({ ...data, client: { ...data.client, email: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Phone Number
                          </label>
                          <input
                            type="text"
                            value={data.client.phone}
                            onChange={(e) => setData({ ...data, client: { ...data.client, phone: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            CIN / LLPIN / Reg. No.
                          </label>
                          <input
                            type="text"
                            value={data.client.cinNumber}
                            onChange={(e) => setData({ ...data, client: { ...data.client, cinNumber: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            GSTIN
                          </label>
                          <input
                            type="text"
                            value={data.client.gstin}
                            onChange={(e) => setData({ ...data, client: { ...data.client, gstin: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Registered Office / Business Address
                          </label>
                          <input
                            type="text"
                            value={data.client.registeredAddress}
                            onChange={(e) => setData({ ...data, client: { ...data.client, registeredAddress: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tasknera Particulars Form */}
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
                        <Building2 size={20} />
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Tasknera Particulars (Service Provider)</h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Proprietor / Signatory
                          </label>
                          <input
                            type="text"
                            value={data.serviceProvider.signatoryName}
                            onChange={(e) => setData({ ...data, serviceProvider: { ...data.serviceProvider, signatoryName: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Designation
                          </label>
                          <input
                            type="text"
                            value={data.serviceProvider.signatoryDesignation}
                            onChange={(e) => setData({ ...data, serviceProvider: { ...data.serviceProvider, signatoryDesignation: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Udyam Registration No.
                          </label>
                          <input
                            type="text"
                            value={data.serviceProvider.udyamNumber}
                            onChange={(e) => setData({ ...data, serviceProvider: { ...data.serviceProvider, udyamNumber: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            GSTIN
                          </label>
                          <input
                            type="text"
                            value={data.serviceProvider.gstin}
                            onChange={(e) => setData({ ...data, serviceProvider: { ...data.serviceProvider, gstin: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Email Address
                          </label>
                          <input
                            type="text"
                            value={data.serviceProvider.email}
                            onChange={(e) => setData({ ...data, serviceProvider: { ...data.serviceProvider, email: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Phone Number
                          </label>
                          <input
                            type="text"
                            value={data.serviceProvider.phone}
                            onChange={(e) => setData({ ...data, serviceProvider: { ...data.serviceProvider, phone: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Recitals */}
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                          Agreement Recitals (1 – {data.recitals.length})
                        </h4>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Plus size={13} />}
                          onClick={() => {
                            const newRec = {
                              id: `rec_${Date.now()}`,
                              number: data.recitals.length + 1,
                              content: 'Parties declare mutual commercial and operational intention.',
                            };
                            setData({ ...data, recitals: [...data.recitals, newRec] });
                          }}
                        >
                          Add Recital
                        </Button>
                      </div>

                      {data.recitals.map((rec, rIdx) => (
                        <div key={rec.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 800, color: '#2563eb', paddingTop: 6, minWidth: 28 }}>
                            ({rec.number})
                          </span>
                          <textarea
                            rows={2}
                            value={rec.content}
                            onChange={(e) => {
                              const updated = [...data.recitals];
                              updated[rIdx].content = e.target.value;
                              setData({ ...data, recitals: updated });
                            }}
                            style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const filtered = data.recitals.filter((r) => r.id !== rec.id).map((r, idx) => ({ ...r, number: idx + 1 }));
                              setData({ ...data, recitals: filtered });
                            }}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: '1px solid #fecaca',
                              backgroundColor: '#fff1f2',
                              color: '#e11d48',
                              cursor: 'pointer',
                              marginTop: 4,
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. SCHEDULE A: MASTER COMMERCIAL TERMS */}
                {editorTab === 'SCHEDULE_A' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          Schedule A – Master Commercial Terms
                        </h3>
                        <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '3px 0 0 0' }}>
                          Define default commercial terms, placement fees, payment SLA, and replacement guarantees.
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        icon={<Plus size={15} />}
                        onClick={() => setIsAddingCommercial(true)}
                        style={{ fontSize: '0.8125rem' }}
                      >
                        Add Commercial Term
                      </Button>
                    </div>

                    {isAddingCommercial && (
                      <div
                        style={{
                          backgroundColor: '#f0fdf4',
                          border: '1.5px solid #22c55e',
                          borderRadius: 12,
                          padding: '16px',
                        }}
                      >
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700, color: '#166534' }}>
                          New Commercial Term Row
                        </h4>
                        <form onSubmit={handleAddCommercialRow} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#14532d', marginBottom: 4 }}>
                              Term Name *
                            </label>
                            <input
                              type="text"
                              value={newCommercialTerm}
                              onChange={(e) => setNewCommercialTerm(e.target.value)}
                              placeholder="e.g. Volume Discount / Incentive Tier"
                              required
                              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #86efac' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#14532d', marginBottom: 4 }}>
                              Master Terms Description *
                            </label>
                            <textarea
                              rows={2}
                              value={newCommercialTermsValue}
                              onChange={(e) => setNewCommercialTermsValue(e.target.value)}
                              placeholder="Enter fee terms, percentage or timeline condition..."
                              required
                              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #86efac', fontSize: '0.85rem' }}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddingCommercial(false)}>
                              Cancel
                            </Button>
                            <Button variant="primary" size="sm" type="submit">
                              Add to Schedule A
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Schedule A Table */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: 10, border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1.5px solid #cbd5e1' }}>
                            <th style={{ width: '28%', textAlign: 'left', padding: '10px 14px', fontSize: '0.8125rem', color: '#0f172a' }}>
                              Term
                            </th>
                            <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '0.8125rem', color: '#0f172a' }}>
                              Master Terms & Commercial Provision
                            </th>
                            <th style={{ width: 70, textAlign: 'center', padding: '10px 8px', fontSize: '0.8125rem', color: '#0f172a' }}>
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.scheduleA.map((row) => (
                            <tr key={row.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                                <input
                                  type="text"
                                  value={row.term}
                                  onChange={(e) => handleUpdateCommercialRow(row.id, 'term', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '6px 8px',
                                    borderRadius: 6,
                                    border: '1px solid #cbd5e1',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    color: '#0f172a',
                                  }}
                                />
                              </td>
                              <td style={{ padding: '10px 14px', verticalAlign: 'top' }}>
                                <textarea
                                  rows={Math.max(2, Math.ceil(row.masterTerms.length / 90))}
                                  value={row.masterTerms}
                                  onChange={(e) => handleUpdateCommercialRow(row.id, 'masterTerms', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '6px 8px',
                                    borderRadius: 6,
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.8125rem',
                                    lineHeight: 1.45,
                                    color: '#334155',
                                  }}
                                />
                              </td>
                              <td style={{ padding: '10px 8px', verticalAlign: 'top', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCommercialRow(row.id)}
                                  style={{
                                    padding: '6px',
                                    borderRadius: 6,
                                    border: '1px solid #fecaca',
                                    backgroundColor: '#fff1f2',
                                    color: '#e11d48',
                                    cursor: 'pointer',
                                  }}
                                  title="Delete Term"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. EXECUTION & SIGNATURES */}
                {editorTab === 'EXECUTION' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Execution Page & Bi-Lateral Signatories
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '3px 0 0 0' }}>
                        Configure the execution credentials, dates, locations, seals, and optional witness blocks.
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                      {/* For Bozzo Cabs / Client */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: 12,
                          padding: '18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                        }}
                      >
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e40af' }}>
                          FOR {data.client.tradeName.toUpperCase()}
                        </h4>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Authorised Signatory Name
                          </label>
                          <input
                            type="text"
                            value={data.client.signatoryName}
                            onChange={(e) => setData({ ...data, client: { ...data.client, signatoryName: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Designation
                          </label>
                          <input
                            type="text"
                            value={data.client.signatoryDesignation}
                            onChange={(e) => setData({ ...data, client: { ...data.client, signatoryDesignation: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Place of Execution
                          </label>
                          <input
                            type="text"
                            value={data.clientSignatoryPlace}
                            onChange={(e) => setData({ ...data, clientSignatoryPlace: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Date of Execution
                          </label>
                          <input
                            type="text"
                            value={data.clientSignatoryDate}
                            onChange={(e) => setData({ ...data, clientSignatoryDate: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                      </div>

                      {/* For Tasknera */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: 12,
                          padding: '18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                        }}
                      >
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                          FOR TASKNERA
                        </h4>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Proprietor Name
                          </label>
                          <input
                            type="text"
                            value={data.serviceProvider.signatoryName}
                            onChange={(e) => setData({ ...data, serviceProvider: { ...data.serviceProvider, signatoryName: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Designation
                          </label>
                          <input
                            type="text"
                            value={data.serviceProvider.signatoryDesignation}
                            onChange={(e) => setData({ ...data, serviceProvider: { ...data.serviceProvider, signatoryDesignation: e.target.value } })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Place of Execution
                          </label>
                          <input
                            type="text"
                            value={data.taskneraSignatoryPlace}
                            onChange={(e) => setData({ ...data, taskneraSignatoryPlace: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Date of Execution
                          </label>
                          <input
                            type="text"
                            value={data.taskneraSignatoryDate}
                            onChange={(e) => setData({ ...data, taskneraSignatoryDate: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Witnesses Form */}
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                      }}
                    >
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>
                        Witnesses (Optional)
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: 8 }}>Witness 1</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <input
                              type="text"
                              placeholder="Name"
                              value={data.witness1.name}
                              onChange={(e) => setData({ ...data, witness1: { ...data.witness1, name: e.target.value } })}
                              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                            />
                            <input
                              type="text"
                              placeholder="Address"
                              value={data.witness1.address}
                              onChange={(e) => setData({ ...data, witness1: { ...data.witness1, address: e.target.value } })}
                              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                            />
                          </div>
                        </div>

                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: 8 }}>Witness 2</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <input
                              type="text"
                              placeholder="Name"
                              value={data.witness2.name}
                              onChange={(e) => setData({ ...data, witness2: { ...data.witness2, name: e.target.value } })}
                              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                            />
                            <input
                              type="text"
                              placeholder="Address"
                              value={data.witness2.address}
                              onChange={(e) => setData({ ...data, witness2: { ...data.witness2, address: e.target.value } })}
                              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. SCHEDULE B: DATA PROTECTION & SECURITY */}
                {editorTab === 'SCHEDULE_B' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          Schedule B – Candidate Data Protection & Information Security
                        </h3>
                        <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '3px 0 0 0' }}>
                          DPDP Act, 2023 compliance, candidate privacy safeguards, breach response, and storage policies.
                        </p>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Plus size={14} />}
                        onClick={handleAddSecurityItem}
                        style={{ fontSize: '0.8125rem' }}
                      >
                        Add Security Rule
                      </Button>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Schedule B Preamble / Introduction
                      </label>
                      <textarea
                        rows={3}
                        value={data.scheduleBIntro}
                        onChange={(e) => setData({ ...data, scheduleBIntro: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {data.scheduleB.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            padding: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                              <span style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.9rem' }}>{item.code}</span>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => handleUpdateSecurityItem(item.id, 'title', e.target.value)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  border: '1px solid #cbd5e1',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                  color: '#0f172a',
                                  flex: 0.6,
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteSecurityItem(item.id)}
                              style={{
                                padding: '4px',
                                borderRadius: 4,
                                border: '1px solid #fecaca',
                                backgroundColor: '#fff1f2',
                                color: '#e11d48',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={item.content}
                            onChange={(e) => handleUpdateSecurityItem(item.id, 'content', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.8125rem',
                              lineHeight: 1.45,
                              color: '#334155',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* STEP 2: FAITHFUL MULTI-PAGE OFFICIAL PDF PREVIEW                          */
            /* ========================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              {/* Preview Action Toolbar */}
              <div
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: '0.8125rem' }}
                  >
                    <ArrowLeft size={14} /> Back to Editor
                  </button>

                  <div style={{ height: 20, width: 1, backgroundColor: '#cbd5e1' }} />

                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', cursor: 'pointer', color: '#475569' }}>
                    <input
                      type="checkbox"
                      checked={highlightPlaceholders}
                      onChange={(e) => setHighlightPlaceholders(e.target.checked)}
                    />
                    <Highlighter size={14} />
                    <span>Highlight Custom Data</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', cursor: 'pointer', color: '#475569' }}>
                    <input
                      type="checkbox"
                      checked={inlineEditMode}
                      onChange={(e) => setInlineEditMode(e.target.checked)}
                    />
                    <Edit3 size={14} />
                    <span>Inline Edit Mode</span>
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Button
                    variant="secondary"
                    icon={<Copy size={14} />}
                    onClick={handleCopyText}
                    style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
                  >
                    Copy Text
                  </Button>
                  <Button
                    variant="secondary"
                    icon={<Download size={14} />}
                    onClick={handleDownloadPdf}
                    style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
                  >
                    Print / Export PDF
                  </Button>
                  <Button
                    variant="primary"
                    icon={<Save size={14} />}
                    onClick={handleSaveToGeneratedDocuments}
                    disabled={isSaving}
                    style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
                  >
                    {isSaving ? 'Saving...' : 'Save as Generated Document'}
                  </Button>
                </div>
              </div>

              {/* Scrollable Container with PDF Render */}
              <div
                ref={previewScrollRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  backgroundColor: '#e2e8f0',
                  padding: '28px 16px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {/* Printable Document Box */}
                <div
                  id="printable-mrsa-agreement"
                  style={{
                    width: '100%',
                    maxWidth: 820,
                    backgroundColor: '#ffffff',
                    padding: '48px 56px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    borderRadius: 4,
                    color: '#0f172a',
                    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
                    fontSize: '9.25pt',
                    lineHeight: 1.55,
                  }}
                >
                  {/* =============================================================== */}
                  {/* PAGE 1: COVER PAGE                                              */}
                  {/* =============================================================== */}
                  <div style={{ minHeight: '920px', display: 'flex', flexDirection: 'column', position: 'relative', paddingBottom: 40 }}>
                    {/* Brand Header */}
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
                        <img
                          src="/logo.png"
                          alt="TaskNera Logo"
                          style={{ width: 44, height: 44, objectFit: 'contain' }}
                          onError={(e) => {
                            // fallback if logo missing
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div style={{ fontWeight: 900, fontSize: '26pt', letterSpacing: '0.04em', color: '#1e293b' }}>
                          TASK<span style={{ color: '#ea580c' }}>NERA</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '9pt', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                        Recruitment • Talent Acquisition • Candidate Sourcing
                      </div>
                      <div style={{ height: 2, backgroundColor: '#0f172a', width: '100%', margin: '14px 0' }} />
                    </div>

                    {/* Title */}
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <h1
                        contentEditable={inlineEditMode}
                        suppressContentEditableWarning
                        onBlur={(e) => setData({ ...data, documentTitle: e.currentTarget.textContent || '' })}
                        style={{
                          fontSize: '17pt',
                          fontWeight: 800,
                          color: '#0f172a',
                          letterSpacing: '0.02em',
                          margin: '0 0 6px 0',
                          textTransform: 'uppercase',
                        }}
                      >
                        {data.documentTitle}
                      </h1>
                      <div style={{ fontSize: '10.5pt', color: '#475569', fontWeight: 500 }}>
                        {data.documentSubtitle}
                      </div>
                    </div>

                    {/* BETWEEN */}
                    <div style={{ textAlign: 'center', margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ fontSize: '8.5pt', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                        B E T W E E N
                      </div>
                      <div
                        contentEditable={inlineEditMode}
                        suppressContentEditableWarning
                        onBlur={(e) => setData({ ...data, client: { ...data.client, legalName: e.currentTarget.textContent || '' } })}
                        style={{
                          fontSize: '14pt',
                          fontWeight: 800,
                          color: highlightPlaceholders ? '#1d4ed8' : '#0f172a',
                          backgroundColor: highlightPlaceholders ? '#dbeafe' : 'transparent',
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 4,
                        }}
                      >
                        {data.client.legalName}
                      </div>
                      <div style={{ fontSize: '8.5pt', color: '#64748b' }}>(the Client / Hiring Company)</div>

                      <div style={{ fontSize: '8.5pt', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '8px 0' }}>
                        A N D
                      </div>

                      <div
                        style={{
                          fontSize: '14pt',
                          fontWeight: 800,
                          color: '#0f172a',
                        }}
                      >
                        TASKNERA
                      </div>
                      <div style={{ fontSize: '8.5pt', color: '#64748b' }}>(the Recruitment Services Provider)</div>
                    </div>

                    {/* Effective Date */}
                    <div style={{ margin: '18px 0', fontSize: '9.5pt' }}>
                      <span style={{ fontWeight: 700 }}>Effective Date: </span>
                      <span
                        contentEditable={inlineEditMode}
                        suppressContentEditableWarning
                        onBlur={(e) => setData({ ...data, effectiveDate: e.currentTarget.textContent || '' })}
                        style={{
                          borderBottom: '1px solid #0f172a',
                          padding: '0 8px',
                          fontWeight: 600,
                          backgroundColor: highlightPlaceholders ? '#fef08a' : 'transparent',
                        }}
                      >
                        {data.effectiveDate}
                      </span>
                    </div>

                    {/* Executive Summary Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, fontSize: '9pt' }}>
                      <tbody>
                        {data.executiveSummary.map((row) => (
                          <tr key={row.id}>
                            <td style={{ width: '25%', fontWeight: 700, padding: '8px 10px', border: '1px solid #94a3b8', backgroundColor: '#f8fafc', color: '#0f172a' }}>
                              {row.label}
                            </td>
                            <td
                              contentEditable={inlineEditMode}
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                const newSummary = data.executiveSummary.map((s) => (s.id === row.id ? { ...s, content: e.currentTarget.textContent || '' } : s));
                                setData({ ...data, executiveSummary: newSummary });
                              }}
                              style={{
                                padding: '8px 10px',
                                border: '1px solid #94a3b8',
                                backgroundColor: highlightPlaceholders && row.label === 'Client' ? '#dbeafe' : '#ffffff',
                              }}
                            >
                              {row.content}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ fontSize: '7.8pt', color: '#64748b', fontStyle: 'italic', marginTop: 12 }}>
                      The summary above is for convenience only. In the event of any conflict, the operative clauses of this Agreement and Clause 25.2 prevail.
                    </div>

                    {/* Running Footer Page 1 */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        borderTop: '1px solid #cbd5e1',
                        paddingTop: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '7.5pt',
                        color: '#64748b',
                      }}
                    >
                      <span>Confidential • Recruitment Services • Tasknera & {data.client.tradeName}</span>
                      <span>Page 1 of {data.sections.length + 3}</span>
                    </div>
                  </div>

                  {/* =============================================================== */}
                  {/* PAGE 2: TABLE OF CONTENTS                                       */}
                  {/* =============================================================== */}
                  <div className="page-break" style={{ minHeight: '920px', display: 'flex', flexDirection: 'column', position: 'relative', paddingTop: 20, paddingBottom: 40 }}>
                    {/* Running Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #0f172a', paddingBottom: 4, marginBottom: 24, fontSize: '7.5pt', fontWeight: 700, letterSpacing: '0.06em', color: '#0f172a' }}>
                      <span>TASKNERA | MASTER RECRUITMENT SERVICES AGREEMENT</span>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <h2 style={{ fontSize: '13pt', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                        TABLE OF CONTENTS
                      </h2>
                    </div>

                    {/* Dual Column Table of Contents */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 36, rowGap: 8, fontSize: '8.8pt' }}>
                      {data.sections.map((sec) => (
                        <div key={sec.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #cbd5e1', paddingBottom: 2 }}>
                          <span>
                            {sec.number}. {sec.title}
                          </span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #cbd5e1', paddingBottom: 2, fontWeight: 700 }}>
                        <span>Execution Page</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #cbd5e1', paddingBottom: 2, fontWeight: 700 }}>
                        <span>Schedule A – Master Commercial Terms</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted #cbd5e1', paddingBottom: 2, fontWeight: 700, gridColumn: 'span 2' }}>
                        <span>Schedule B – Candidate Data Protection and Information Security</span>
                      </div>
                    </div>

                    {/* Running Footer Page 2 */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        borderTop: '1px solid #cbd5e1',
                        paddingTop: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '7.5pt',
                        color: '#64748b',
                      }}
                    >
                      <span>Confidential • Recruitment Services • Tasknera & {data.client.tradeName}</span>
                      <span>Page 2 of {data.sections.length + 3}</span>
                    </div>
                  </div>

                  {/* =============================================================== */}
                  {/* PAGE 3: PARTY DETAILS & RECITALS                                */}
                  {/* =============================================================== */}
                  <div className="page-break" style={{ minHeight: '920px', display: 'flex', flexDirection: 'column', position: 'relative', paddingTop: 20, paddingBottom: 40 }}>
                    {/* Running Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #0f172a', paddingBottom: 4, marginBottom: 20, fontSize: '7.5pt', fontWeight: 700, letterSpacing: '0.06em', color: '#0f172a' }}>
                      <span>TASKNERA | MASTER RECRUITMENT SERVICES AGREEMENT</span>
                    </div>

                    <h2 style={{ fontSize: '12pt', fontWeight: 800, textAlign: 'center', margin: '0 0 16px 0', textTransform: 'uppercase' }}>
                      MASTER RECRUITMENT SERVICES AGREEMENT
                    </h2>

                    <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                      This Master Recruitment Services Agreement (the “Agreement”) is made and entered into on the Effective Date stated on the cover page by and between:
                    </p>

                    <div style={{ paddingLeft: 16, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'justify' }}>
                      <div>
                        <strong>(A) {data.client.legalName}</strong>, a {data.client.legalForm}, having its registered / business address at {data.client.registeredAddress}, acting through its duly authorised signatory identified in the Party Details below (hereinafter referred to as “{data.client.tradeName}”, which expression shall, unless repugnant to the context or meaning thereof, include its successors and permitted assigns), being the client and hiring company; and
                      </div>
                      <div>
                        <strong>(B) TASKNERA</strong>, a sole proprietorship concern carried on under the trade name “Tasknera” by its sole proprietor, {data.serviceProvider.signatoryName}, having its business address at {data.serviceProvider.registeredAddress}, and represented by its Proprietor, {data.serviceProvider.signatoryName} (hereinafter referred to as “Tasknera”, which expression shall, unless repugnant to the context or meaning thereof, include its proprietor, legal heirs, successors and permitted assigns), being the independent recruitment services provider.
                      </div>
                    </div>

                    <p style={{ margin: '0 0 12px 0' }}>
                      {data.client.tradeName} and Tasknera are each a “Party” and together the “Parties”.
                    </p>

                    <h3 style={{ fontSize: '10pt', fontWeight: 800, margin: '10px 0 6px 0', textTransform: 'uppercase' }}>
                      PARTY DETAILS
                    </h3>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.2pt', marginBottom: 14 }}>
                      <thead>
                        <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                          <th style={{ width: '28%', padding: '6px 8px', textAlign: 'left', border: '1px solid #0f172a' }}>Particulars</th>
                          <th style={{ width: '36%', padding: '6px 8px', textAlign: 'left', border: '1px solid #0f172a' }}>{data.client.tradeName} (Client)</th>
                          <th style={{ width: '36%', padding: '6px 8px', textAlign: 'left', border: '1px solid #0f172a' }}>Tasknera (Service Provider)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: 'Full legal name / trade name', client: `${data.client.legalName} (trade name: ${data.client.tradeName})`, sp: data.serviceProvider.tradeName },
                          { label: 'Legal form', client: data.client.legalForm, sp: data.serviceProvider.legalForm },
                          { label: 'Proprietor / authorised signatory', client: data.client.signatoryName, sp: data.serviceProvider.signatoryName },
                          { label: 'Designation', client: data.client.signatoryDesignation, sp: data.serviceProvider.signatoryDesignation },
                          { label: 'Registered / business address', client: data.client.registeredAddress, sp: data.serviceProvider.registeredAddress },
                          { label: 'CIN / LLPIN / Registration No.', client: data.client.cinNumber, sp: data.serviceProvider.cinNumber },
                          { label: 'Udyam Registration No.', client: data.client.udyamNumber, sp: data.serviceProvider.udyamNumber },
                          { label: 'GSTIN', client: data.client.gstin, sp: data.serviceProvider.gstin },
                          { label: 'Email', client: data.client.email, sp: data.serviceProvider.email },
                          { label: 'Phone', client: data.client.phone, sp: data.serviceProvider.phone },
                        ].map((row, rIdx) => (
                          <tr key={rIdx} style={{ backgroundColor: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                            <td style={{ fontWeight: 700, padding: '5px 8px', border: '1px solid #94a3b8' }}>{row.label}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #94a3b8', backgroundColor: highlightPlaceholders ? '#eff6ff' : 'transparent' }}>
                              {row.client}
                            </td>
                            <td style={{ padding: '5px 8px', border: '1px solid #94a3b8' }}>{row.sp}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <h3 style={{ fontSize: '10pt', fontWeight: 800, margin: '8px 0 6px 0', textTransform: 'uppercase' }}>
                      RECITALS
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '8.8pt', textAlign: 'justify' }}>
                      {data.recitals.map((rec) => (
                        <div key={rec.id} style={{ display: 'flex', gap: 8 }}>
                          <span style={{ fontWeight: 700 }}>({rec.number})</span>
                          <span>{rec.content}</span>
                        </div>
                      ))}
                    </div>

                    {/* Running Footer Page 3 */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        borderTop: '1px solid #cbd5e1',
                        paddingTop: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '7.5pt',
                        color: '#64748b',
                      }}
                    >
                      <span>Confidential • Recruitment Services • Tasknera & {data.client.tradeName}</span>
                      <span>Page 3 of {data.sections.length + 3}</span>
                    </div>
                  </div>

                  {/* =============================================================== */}
                  {/* PAGES 4+: OPERATIVE CLAUSES                                     */}
                  {/* =============================================================== */}
                  <div style={{ marginTop: 24 }}>
                    <div style={{ textAlign: 'center', margin: '20px 0 16px', fontWeight: 700, fontSize: '9pt' }}>
                      NOW, THEREFORE, in consideration of the mutual covenants contained in this Agreement, the Parties agree as follows:
                    </div>

                    {data.sections.map((sec) => (
                      <div key={sec.id} className="avoid-break" style={{ marginBottom: 20 }}>
                        <div
                          style={{
                            borderBottom: '1.5px solid #0f172a',
                            paddingBottom: 3,
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 6,
                          }}
                        >
                          <h3
                            style={{
                              fontSize: '10.5pt',
                              fontWeight: 800,
                              color: '#0f172a',
                              textTransform: 'uppercase',
                              letterSpacing: '0.03em',
                              margin: 0,
                            }}
                          >
                            {sec.number}. {sec.title}
                          </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'justify' }}>
                          {sec.clauses.map((clause) => (
                            <div key={clause.id} style={{ marginBottom: 4 }}>
                              <div style={{ display: 'inline', fontWeight: 700, color: '#0f172a' }}>
                                {clause.clauseNumber} {clause.title}.{' '}
                              </div>
                              <div style={{ display: 'inline' }}>
                                {clause.paragraphs.map((p, pIdx) => (
                                  <span key={pIdx}>
                                    {p}{' '}
                                  </span>
                                ))}
                              </div>

                              {clause.subclauses && clause.subclauses.length > 0 && (
                                <div style={{ paddingLeft: 18, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                  {clause.subclauses.map((sub) => (
                                    <div key={sub.id} style={{ display: 'flex', gap: 8 }}>
                                      <span style={{ fontWeight: 600 }}>{sub.clauseId}</span>
                                      <span>{sub.text}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* =============================================================== */}
                  {/* EXECUTION PAGE                                                  */}
                  {/* =============================================================== */}
                  <div className="page-break" style={{ minHeight: '920px', display: 'flex', flexDirection: 'column', position: 'relative', paddingTop: 20, paddingBottom: 40 }}>
                    {/* Running Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #0f172a', paddingBottom: 4, marginBottom: 20, fontSize: '7.5pt', fontWeight: 700, letterSpacing: '0.06em', color: '#0f172a' }}>
                      <span>TASKNERA | MASTER RECRUITMENT SERVICES AGREEMENT</span>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                      <h2 style={{ fontSize: '12pt', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
                        EXECUTION PAGE
                      </h2>
                    </div>

                    <p style={{ textAlign: 'justify', marginBottom: 24 }}>
                      IN WITNESS WHEREOF, the Parties have caused this Agreement and, where applicable, the relevant Schedule(s) to be executed by their duly authorised representatives on the dates set out below, to take effect from the Effective Date.
                    </p>

                    {/* Dual Signatory Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 28 }}>
                      <thead>
                        <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                          <th style={{ width: '50%', padding: '8px 12px', textAlign: 'left', border: '1px solid #0f172a' }}>
                            FOR {data.client.tradeName.toUpperCase()}
                          </th>
                          <th style={{ width: '50%', padding: '8px 12px', textAlign: 'left', border: '1px solid #0f172a' }}>
                            FOR TASKNERA
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '16px', border: '1px solid #94a3b8', verticalAlign: 'top' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                              <div>
                                <span style={{ fontWeight: 700 }}>Authorised Signatory Name: </span>
                                <span>{data.client.signatoryName}</span>
                              </div>
                              <div>
                                <span style={{ fontWeight: 700 }}>Designation: </span>
                                <span>{data.client.signatoryDesignation}</span>
                              </div>
                              <div style={{ minHeight: 40, borderBottom: '1px dashed #94a3b8', display: 'flex', alignItems: 'flex-end' }}>
                                <span style={{ fontWeight: 700 }}>Signature: </span>
                              </div>
                              <div>
                                <span style={{ fontWeight: 700 }}>Date: </span>
                                <span>{data.clientSignatoryDate}</span>
                              </div>
                              <div>
                                <span style={{ fontWeight: 700 }}>Place: </span>
                                <span>{data.clientSignatoryPlace}</span>
                              </div>
                              <div>
                                <span style={{ fontWeight: 700 }}>Company Seal, if applicable: </span>
                                <div style={{ width: 64, height: 64, border: '1px dashed #cbd5e1', borderRadius: '50%', marginTop: 6 }} />
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '16px', border: '1px solid #94a3b8', verticalAlign: 'top' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                              <div>
                                <span style={{ fontWeight: 700 }}>Proprietor: </span>
                                <span>{data.serviceProvider.signatoryName}</span>
                              </div>
                              <div>
                                <span style={{ fontWeight: 700 }}>Designation: </span>
                                <span>{data.serviceProvider.signatoryDesignation}</span>
                              </div>
                              <div style={{ minHeight: 40, borderBottom: '1px dashed #94a3b8', display: 'flex', alignItems: 'flex-end' }}>
                                <span style={{ fontWeight: 700 }}>Signature: </span>
                              </div>
                              <div>
                                <span style={{ fontWeight: 700 }}>Date: </span>
                                <span>{data.taskneraSignatoryDate}</span>
                              </div>
                              <div>
                                <span style={{ fontWeight: 700 }}>Place: </span>
                                <span>{data.taskneraSignatoryPlace}</span>
                              </div>
                              <div>
                                <span style={{ fontWeight: 700 }}>Business Stamp / Seal, if applicable: </span>
                                <div style={{ width: 64, height: 64, border: '1px dashed #cbd5e1', borderRadius: '50%', marginTop: 6 }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Witnesses Block */}
                    <div style={{ marginTop: 10 }}>
                      <h4 style={{ fontSize: '9pt', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
                        WITNESSES (OPTIONAL)
                      </h4>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                            <th style={{ width: '50%', padding: '6px 10px', textAlign: 'left', border: '1px solid #0f172a' }}>WITNESS 1</th>
                            <th style={{ width: '50%', padding: '6px 10px', textAlign: 'left', border: '1px solid #0f172a' }}>WITNESS 2</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: '12px', border: '1px solid #94a3b8' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div><span style={{ fontWeight: 700 }}>Name: </span>{data.witness1.name}</div>
                                <div><span style={{ fontWeight: 700 }}>Address: </span>{data.witness1.address}</div>
                                <div><span style={{ fontWeight: 700 }}>Signature: </span>_____________________</div>
                                <div><span style={{ fontWeight: 700 }}>Date: </span>{data.witness1.signatureDate}</div>
                              </div>
                            </td>
                            <td style={{ padding: '12px', border: '1px solid #94a3b8' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div><span style={{ fontWeight: 700 }}>Name: </span>{data.witness2.name}</div>
                                <div><span style={{ fontWeight: 700 }}>Address: </span>{data.witness2.address}</div>
                                <div><span style={{ fontWeight: 700 }}>Signature: </span>_____________________</div>
                                <div><span style={{ fontWeight: 700 }}>Date: </span>{data.witness2.signatureDate}</div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Running Footer Execution */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        borderTop: '1px solid #cbd5e1',
                        paddingTop: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '7.5pt',
                        color: '#64748b',
                      }}
                    >
                      <span>Confidential • Recruitment Services • Tasknera & {data.client.tradeName}</span>
                      <span>Execution Page</span>
                    </div>
                  </div>

                  {/* =============================================================== */}
                  {/* SCHEDULE A: MASTER COMMERCIAL TERMS                             */}
                  {/* =============================================================== */}
                  <div className="page-break" style={{ minHeight: '920px', display: 'flex', flexDirection: 'column', position: 'relative', paddingTop: 20, paddingBottom: 40 }}>
                    {/* Running Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #0f172a', paddingBottom: 4, marginBottom: 20, fontSize: '7.5pt', fontWeight: 700, letterSpacing: '0.06em', color: '#0f172a' }}>
                      <span>TASKNERA | MASTER RECRUITMENT SERVICES AGREEMENT</span>
                    </div>

                    <h2 style={{ fontSize: '12pt', fontWeight: 800, textAlign: 'center', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                      SCHEDULE A – MASTER COMMERCIAL TERMS
                    </h2>

                    <p style={{ fontSize: '8.8pt', textAlign: 'justify', marginBottom: 14 }}>
                      This Schedule sets out the master commercial terms that apply to every Assignment under the Agreement. Terms for an individual project, vacancy or Assignment are to be quoted by Tasknera and agreed by the Parties in writing, by email or on paper, in a Commercial Confirmation before sourcing begins (Clauses 3.3 and 3.7). A Commercial Confirmation varies this Schedule only to the extent it expressly says so, and Clause 25.2 applies in the event of conflict.
                    </p>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                          <th style={{ width: '28%', padding: '8px 10px', textAlign: 'left', border: '1px solid #0f172a' }}>Term</th>
                          <th style={{ padding: '8px 10px', textAlign: 'left', border: '1px solid #0f172a' }}>Master Terms</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.scheduleA.map((row, rIdx) => (
                          <tr key={row.id} style={{ backgroundColor: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                            <td style={{ fontWeight: 700, padding: '7px 10px', border: '1px solid #94a3b8', verticalAlign: 'top' }}>
                              {row.term}
                            </td>
                            <td style={{ padding: '7px 10px', border: '1px solid #94a3b8', verticalAlign: 'top', textAlign: 'justify' }}>
                              {row.masterTerms}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Running Footer Schedule A */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        borderTop: '1px solid #cbd5e1',
                        paddingTop: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '7.5pt',
                        color: '#64748b',
                      }}
                    >
                      <span>Confidential • Recruitment Services • Tasknera & {data.client.tradeName}</span>
                      <span>Schedule A</span>
                    </div>
                  </div>

                  {/* =============================================================== */}
                  {/* SCHEDULE B: CANDIDATE DATA PROTECTION AND SECURITY             */}
                  {/* =============================================================== */}
                  <div className="page-break" style={{ minHeight: '920px', display: 'flex', flexDirection: 'column', position: 'relative', paddingTop: 20, paddingBottom: 40 }}>
                    {/* Running Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #0f172a', paddingBottom: 4, marginBottom: 20, fontSize: '7.5pt', fontWeight: 700, letterSpacing: '0.06em', color: '#0f172a' }}>
                      <span>TASKNERA | MASTER RECRUITMENT SERVICES AGREEMENT</span>
                    </div>

                    <h2 style={{ fontSize: '12pt', fontWeight: 800, textAlign: 'center', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                      SCHEDULE B – CANDIDATE DATA PROTECTION AND INFORMATION SECURITY
                    </h2>

                    <p style={{ fontSize: '8.8pt', textAlign: 'justify', marginBottom: 14 }}>
                      {data.scheduleBIntro}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '8.8pt', textAlign: 'justify' }}>
                      {data.scheduleB.map((secB) => (
                        <div key={secB.id} style={{ display: 'flex', gap: 10 }}>
                          <span style={{ fontWeight: 800, minWidth: 32, color: '#0f172a' }}>{secB.code}</span>
                          <div>
                            <span style={{ fontWeight: 700 }}>{secB.title}: </span>
                            <span>{secB.content}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Running Footer Schedule B */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        borderTop: '1px solid #cbd5e1',
                        paddingTop: 8,
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '7.5pt',
                        color: '#64748b',
                      }}
                    >
                      <span>Confidential • Recruitment Services • Tasknera & {data.client.tradeName}</span>
                      <span>Schedule B (Page 21)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
