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
  Sparkles,
  RefreshCw,
  Undo2,
  Wand2,
  BookOpen,
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
import {
  generateMrsaFromPrompt,
  refineSingleSectionWithAi,
  MrsaAiParsedPromptTerms,
} from '../../services/mrsaAiService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

const AI_PROMPT_PRESETS = [
  {
    label: 'Standard Bozzo Cabs',
    icon: '⚡',
    prompt:
      'Generate Master Recruitment Agreement for Bozzo Cabs with standard 8.33% Placement Fee on annual CTC, 45-day payment credit period, 60-day candidate exit replacement guarantee, 12 months candidate fee protection period, non-circumvention of 12 months, arbitration seated in New Delhi, and standard DPDP Act compliance.',
  },
  {
    label: 'Enterprise BFSI & Strict SLA',
    icon: '🏢',
    prompt:
      'Draft recruitment agreement for Bozzo Cabs with 12.5% placement fee on annual CTC, 30 days invoice payment terms, 90 days candidate replacement warranty, 18 months fee attribution protection, 24 months non-solicitation, 48 hours profile feedback SLA, arbitration in Hyderabad, and strict DPDP Act candidate privacy safeguards.',
  },
  {
    label: 'High-Growth Tech Startup',
    icon: '🚀',
    prompt:
      'Create tech recruitment agreement for Bozzo Cabs with 10% placement fee, 15 calendar days payment term, 120 days replacement warranty with credit note option, 12 months candidate attribution, arbitration in Bengaluru, and hybrid-remote work onboarding terms.',
  },
  {
    label: 'Executive Leadership Retainer',
    icon: '👑',
    prompt:
      'Draft an executive leadership search agreement for Bozzo Cabs with 15% placement fee, 30 days payment window, 180 days replacement warranty, 24 months candidate protection period, dispute resolution in Mumbai, and strict non-disclosure obligations.',
  },
];

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

  // AI Prompt Studio State for Sections
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGenerationProgress, setAiGenerationProgress] = useState('');
  const [aiGeneratedSuccessSummary, setAiGeneratedSuccessSummary] = useState<string | null>(null);
  const [aiParsedTerms, setAiParsedTerms] = useState<MrsaAiParsedPromptTerms | null>(null);
  const [previousDataState, setPreviousDataState] = useState<MrsaAgreementData | null>(null);
  const [showStaticTocMap, setShowStaticTocMap] = useState(false);

  // Single Section AI Prompt State
  const [singleSectionPromptText, setSingleSectionPromptText] = useState<Record<string, string>>({});
  const [isRefiningSingleSection, setIsRefiningSingleSection] = useState<string | null>(null);

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

  // AI Prompt Driven Generation for All Sections
  const handleGenerateWithAi = async (overridePrompt?: string) => {
    const promptToUse = (overridePrompt || aiPrompt).trim();
    if (!promptToUse) {
      error('Please enter a prompt describing the agreement terms or requirements.');
      return;
    }

    setIsAiGenerating(true);
    setAiGenerationProgress('Analyzing agreement prompt & extracting business terms...');

    try {
      // Save snapshot for 1-click undo
      setPreviousDataState(JSON.parse(JSON.stringify(data)));

      await new Promise((r) => setTimeout(r, 350));
      setAiGenerationProgress('Synthesizing definitions, commercial structures & liability terms...');
      await new Promise((r) => setTimeout(r, 400));
      setAiGenerationProgress('Customizing clauses across all 25 sections while preserving static Table of Contents...');

      const result = await generateMrsaFromPrompt(promptToUse, data);

      setData(result.updatedData);
      setAiParsedTerms(result.parsedTerms);
      setAiGeneratedSuccessSummary(result.summary);
      success('AI successfully generated and updated all 25 agreement sections!');
    } catch (err: any) {
      error(`AI generation failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsAiGenerating(false);
      setAiGenerationProgress('');
    }
  };

  const handleRevertAiGeneration = () => {
    if (previousDataState) {
      setData(previousDataState);
      setPreviousDataState(null);
      setAiGeneratedSuccessSummary(null);
      setAiParsedTerms(null);
      info('Reverted to previous agreement state.');
    }
  };

  const handleRefineSingleSection = async (sectionId: string) => {
    const prompt = (singleSectionPromptText[sectionId] || '').trim();
    if (!prompt) {
      error('Please enter instructions for this section');
      return;
    }
    const targetSection = data.sections.find((s) => s.id === sectionId);
    if (!targetSection) return;

    setIsRefiningSingleSection(sectionId);
    try {
      await new Promise((r) => setTimeout(r, 450));
      const updatedSection = refineSingleSectionWithAi(targetSection, prompt, data.client.tradeName);
      setData((prev) => ({
        ...prev,
        sections: prev.sections.map((s) => (s.id === sectionId ? updatedSection : s)),
      }));
      success(`Updated Section ${targetSection.number} with AI`);
      setSingleSectionPromptText((prev) => ({ ...prev, [sectionId]: '' }));
    } catch (err: any) {
      error(`Failed to refine section: ${err.message}`);
    } finally {
      setIsRefiningSingleSection(null);
    }
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
          <title></title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 0 !important;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 12mm 16mm !important;
              background: #ffffff;
              color: #0f172a;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              font-size: 8.85pt;
              line-height: 1.5;
            }
            #printable-mrsa-agreement {
              box-shadow: none !important;
              border-radius: 0 !important;
              max-width: 100% !important;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
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

                    {/* ================================================================= */}
                    {/* AI AGREEMENT PROMPT STUDIO (OPERATIVE SECTIONS)                  */}
                    {/* Preserves canonical static 25-section Table of Contents while     */}
                    {/* dynamically generating & tailoring clauses from user prompts     */}
                    {/* ================================================================= */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f8faff 0%, #f5f3ff 100%)',
                        border: '1.5px solid #c7d2fe',
                        borderRadius: 14,
                        padding: '22px 24px',
                        boxShadow: '0 4px 20px -2px rgba(99, 102, 241, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                      }}
                    >
                      {/* Studio Top Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 12,
                              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
                              flexShrink: 0,
                            }}
                          >
                            <Sparkles size={22} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e1b4b', margin: 0, letterSpacing: '-0.01em' }}>
                                AI Agreement Prompt Studio
                              </h4>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  backgroundColor: '#dbeafe',
                                  color: '#1d4ed8',
                                  padding: '2px 8px',
                                  borderRadius: 12,
                                  border: '1px solid #bfdbfe',
                                }}
                              >
                                Static Table of Contents (25 Sections)
                              </span>
                            </div>
                            <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '3px 0 0 0' }}>
                              Enter your commercial prompt or client terms. AI will synthesize and fill all 25 sections while keeping the Table of Contents strictly standard for everyone.
                            </p>
                          </div>
                        </div>

                        {/* Top Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {previousDataState && (
                            <button
                              type="button"
                              onClick={handleRevertAiGeneration}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                fontSize: '0.75rem',
                                padding: '6px 12px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#ffffff',
                                color: '#475569',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                              title="Revert to state before last AI generation"
                            >
                              <Undo2 size={13} /> Undo AI Changes
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowStaticTocMap(!showStaticTocMap)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: '0.75rem',
                              padding: '6px 12px',
                              borderRadius: 6,
                              border: '1px solid #c7d2fe',
                              backgroundColor: showStaticTocMap ? '#e0e7ff' : '#ffffff',
                              color: '#4338ca',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            <BookOpen size={13} /> {showStaticTocMap ? 'Hide TOC Map' : 'View Static TOC Map'}
                          </button>
                        </div>
                      </div>

                      {/* Static TOC Quick Map Drawer */}
                      {showStaticTocMap && (
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #c7d2fe',
                            borderRadius: 10,
                            padding: '14px 18px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3730a3', textTransform: 'uppercase' }}>
                              Canonical Static Table of Contents (Fixed for all documents)
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                              All 25 sections below are populated with AI content
                            </span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                            {data.sections.map((s) => (
                              <div
                                key={s.id}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  backgroundColor: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  color: '#334155',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                }}
                              >
                                <span style={{ fontWeight: 700, color: '#2563eb' }}>{s.number}.</span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Main Prompt Text Box */}
                      <div style={{ position: 'relative' }}>
                        <textarea
                          rows={3}
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder='E.g.: "Generate a Master Recruitment Agreement for Bozzo Cabs with a 10% placement fee on annual CTC, 45-day payment terms, 90-day replacement warranty for candidate exits, 18-month candidate fee protection period, non-solicitation of 2 years, arbitration seated in Hyderabad, and strict data privacy compliance under India DPDP Act 2023..."'
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: 10,
                            border: '1.5px solid #cbd5e1',
                            fontSize: '0.875rem',
                            lineHeight: 1.55,
                            color: '#0f172a',
                            backgroundColor: '#ffffff',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            minHeight: 90,
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
                            transition: 'border-color 0.15s ease',
                          }}
                        />
                      </div>

                      {/* Prompt Presets / Inspiration Pills */}
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                          Quick Prompt Templates (Click to fill)
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {AI_PROMPT_PRESETS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setAiPrompt(preset.prompt)}
                              style={{
                                fontSize: '0.75rem',
                                padding: '5px 10px',
                                borderRadius: 6,
                                border: '1px solid #c7d2fe',
                                backgroundColor: '#ffffff',
                                color: '#3730a3',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5,
                                fontWeight: 500,
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e0e7ff';
                                e.currentTarget.style.borderColor = '#818cf8';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.borderColor = '#c7d2fe';
                              }}
                            >
                              <span>{preset.icon}</span>
                              <span>{preset.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 2 }}>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {aiPrompt.length > 0 ? `${aiPrompt.length} characters entered` : 'Ready for custom instructions'}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {aiPrompt && (
                            <button
                              type="button"
                              onClick={() => setAiPrompt('')}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#9ca3af',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                              }}
                            >
                              Clear Prompt
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleGenerateWithAi()}
                            disabled={isAiGenerating || !aiPrompt.trim()}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '10px 20px',
                              borderRadius: 8,
                              border: 'none',
                              background: isAiGenerating || !aiPrompt.trim()
                                ? '#94a3b8'
                                : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.86rem',
                              cursor: isAiGenerating || !aiPrompt.trim() ? 'not-allowed' : 'pointer',
                              boxShadow: isAiGenerating || !aiPrompt.trim() ? 'none' : '0 4px 14px rgba(79, 70, 229, 0.3)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {isAiGenerating ? (
                              <>
                                <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                                <span>Generating 25 Sections...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={16} />
                                <span>Generate All Sections with AI</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Loading Progress State */}
                      {isAiGenerating && (
                        <div
                          style={{
                            padding: '11px 16px',
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            fontSize: '0.8125rem',
                            color: '#1e40af',
                          }}
                        >
                          <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                          <span>{aiGenerationProgress || 'Synthesizing agreement clauses...'}</span>
                        </div>
                      )}

                      {/* Success / Applied Terms Summary Card */}
                      {aiGeneratedSuccessSummary && !isAiGenerating && (
                        <div
                          style={{
                            padding: '14px 18px',
                            backgroundColor: '#f0fdf4',
                            border: '1.5px solid #86efac',
                            borderRadius: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#166534', fontSize: '0.88rem' }}>
                              <CheckCircle2 size={18} color="#16a34a" />
                              <span>25 Agreement Sections Customized Successfully</span>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600, backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: 4 }}>
                              Table of Contents: Static & Preserved
                            </span>
                          </div>

                          <div style={{ fontSize: '0.8125rem', color: '#14532d', lineHeight: 1.5 }}>
                            {aiGeneratedSuccessSummary}
                          </div>

                          {/* Quick Chips of extracted terms */}
                          {aiParsedTerms && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                              {aiParsedTerms.clientName && (
                                <span style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                                  Client: {aiParsedTerms.clientName}
                                </span>
                              )}
                              {(aiParsedTerms.placementFee || aiParsedTerms.feePercentage) && (
                                <span style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                                  Fee: {aiParsedTerms.placementFee || `${aiParsedTerms.feePercentage}% CTC`}
                                </span>
                              )}
                              {aiParsedTerms.paymentDays && (
                                <span style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                                  Payment: {aiParsedTerms.paymentDays} Days
                                </span>
                              )}
                              {aiParsedTerms.replacementDays && (
                                <span style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                                  Warranty: {aiParsedTerms.replacementDays} Days
                                </span>
                              )}
                              {aiParsedTerms.protectionMonths && (
                                <span style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                                  Protection: {aiParsedTerms.protectionMonths} Months
                                </span>
                              )}
                              {aiParsedTerms.jurisdictionCity && (
                                <span style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                                  Seat: {aiParsedTerms.jurisdictionCity}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isExpanded) toggleSection(sec.id);
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: 6,
                                    border: '1px solid #c7d2fe',
                                    backgroundColor: '#eff6ff',
                                    color: '#4338ca',
                                    cursor: 'pointer',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                  }}
                                  title="AI Prompt for this section"
                                >
                                  <Sparkles size={12} /> AI Prompt
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
                                {/* Inline AI Prompt Bar for this Section */}
                                <div
                                  style={{
                                    backgroundColor: '#f5f3ff',
                                    border: '1px solid #ddd6fe',
                                    borderRadius: 8,
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                  }}
                                >
                                  <Sparkles size={16} color="#7c3aed" style={{ flexShrink: 0 }} />
                                  <input
                                    type="text"
                                    value={singleSectionPromptText[sec.id] || ''}
                                    onChange={(e) =>
                                      setSingleSectionPromptText({ ...singleSectionPromptText, [sec.id]: e.target.value })
                                    }
                                    placeholder={`AI Prompt for Section ${sec.number} (e.g. 'Set late payment interest to 24%', 'Require 24hr feedback SLA')...`}
                                    style={{
                                      flex: 1,
                                      padding: '6px 10px',
                                      fontSize: '0.8125rem',
                                      borderRadius: 6,
                                      border: '1px solid #c4b5fd',
                                      backgroundColor: '#ffffff',
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleRefineSingleSection(sec.id);
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRefineSingleSection(sec.id)}
                                    disabled={isRefiningSingleSection === sec.id || !(singleSectionPromptText[sec.id] || '').trim()}
                                    style={{
                                      padding: '6px 12px',
                                      borderRadius: 6,
                                      backgroundColor: isRefiningSingleSection === sec.id || !(singleSectionPromptText[sec.id] || '').trim() ? '#c4b5fd' : '#7c3aed',
                                      color: '#ffffff',
                                      border: 'none',
                                      fontSize: '0.78rem',
                                      fontWeight: 600,
                                      cursor: isRefiningSingleSection === sec.id || !(singleSectionPromptText[sec.id] || '').trim() ? 'not-allowed' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 5,
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {isRefiningSingleSection === sec.id ? (
                                      <>
                                        <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                                        Refining...
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles size={12} />
                                        AI Refine Section
                                      </>
                                    )}
                                  </button>
                                </div>
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
                    padding: '44px 52px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                    borderRadius: 4,
                    color: '#0f172a',
                    fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontSize: '8.85pt',
                    lineHeight: 1.55,
                  }}
                >
                  {/* =============================================================== */}
                  {/* 1. TOP BRAND LOGO & HEADER                                      */}
                  {/* =============================================================== */}
                  <div style={{ textAlign: 'center', marginBottom: 18 }}>
                    <img
                      src="/logo.png"
                      alt="TaskNera"
                      style={{
                        width: 76,
                        height: 76,
                        objectFit: 'contain',
                        margin: '0 auto 10px auto',
                        display: 'block',
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: '15pt',
                        letterSpacing: '0.04em',
                        color: '#111827',
                        textTransform: 'uppercase',
                        lineHeight: 1.2,
                      }}
                    >
                      TASKNERA
                    </div>
                    <div
                      style={{
                        fontSize: '8.5pt',
                        color: '#475569',
                        fontWeight: 500,
                        letterSpacing: '0.03em',
                        marginTop: 3,
                      }}
                    >
                      Recruitment &nbsp;•&nbsp; Talent Acquisition &nbsp;•&nbsp; Candidate Sourcing
                    </div>
                  </div>

                  {/* =============================================================== */}
                  {/* 2. DOCUMENT TITLE & PARTIES                                     */}
                  {/* =============================================================== */}
                  <div style={{ textAlign: 'center', margin: '18px 0 14px 0' }}>
                    <h1
                      contentEditable={inlineEditMode}
                      suppressContentEditableWarning
                      onBlur={(e) => setData({ ...data, documentTitle: e.currentTarget.textContent || '' })}
                      style={{
                        fontSize: '13pt',
                        fontWeight: 800,
                        color: '#111827',
                        letterSpacing: '0.02em',
                        margin: '0 0 4px 0',
                        textTransform: 'uppercase',
                        lineHeight: 1.3,
                      }}
                    >
                      {data.documentTitle}
                    </h1>
                    <div style={{ fontSize: '9.2pt', color: '#475569', fontWeight: 500 }}>
                      {data.documentSubtitle}
                    </div>
                  </div>

                  {/* BETWEEN */}
                  <div style={{ textAlign: 'center', margin: '14px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div style={{ fontSize: '8pt', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                      BETWEEN
                    </div>
                    <div
                      contentEditable={inlineEditMode}
                      suppressContentEditableWarning
                      onBlur={(e) => setData({ ...data, client: { ...data.client, legalName: e.currentTarget.textContent || '' } })}
                      style={{
                        fontSize: '12pt',
                        fontWeight: 800,
                        color: highlightPlaceholders ? '#1d4ed8' : '#111827',
                        backgroundColor: highlightPlaceholders ? '#dbeafe' : 'transparent',
                        textTransform: 'uppercase',
                        padding: '1px 6px',
                        borderRadius: 3,
                        display: 'inline-block',
                      }}
                    >
                      {data.client.tradeName || 'BOZZO CABS'}
                    </div>
                    <div style={{ fontSize: '8.2pt', color: '#64748b' }}>
                      (the Client / Hiring Company)
                    </div>

                    <div style={{ fontSize: '8pt', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '6px 0 2px 0' }}>
                      AND
                    </div>

                    <div
                      style={{
                        fontSize: '12pt',
                        fontWeight: 800,
                        color: '#111827',
                        textTransform: 'uppercase',
                      }}
                    >
                      TASKNERA
                    </div>
                    <div style={{ fontSize: '8.2pt', color: '#64748b' }}>
                      (the Recruitment Services Provider)
                    </div>
                  </div>

                  {/* Effective Date */}
                  <div style={{ margin: '14px 0 10px 0', fontSize: '8.8pt' }}>
                    <span style={{ fontWeight: 700 }}>Effective Date: </span>
                    <span
                      contentEditable={inlineEditMode}
                      suppressContentEditableWarning
                      onBlur={(e) => setData({ ...data, effectiveDate: e.currentTarget.textContent || '' })}
                      style={{
                        borderBottom: '1px solid #111827',
                        padding: '0 8px 1px 8px',
                        fontWeight: 600,
                        backgroundColor: highlightPlaceholders ? '#fef08a' : 'transparent',
                        minWidth: 140,
                        display: 'inline-block',
                      }}
                    >
                      {data.effectiveDate || '______________________'}
                    </span>
                  </div>

                  {/* =============================================================== */}
                  {/* 3. EXECUTIVE SUMMARY TABLE                                      */}
                  {/* =============================================================== */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #1e293b', fontSize: '8.5pt', marginBottom: 6 }}>
                    <tbody>
                      {data.executiveSummary.map((row) => (
                        <tr key={row.id}>
                          <td style={{ width: '22%', fontWeight: 700, padding: '6px 10px', border: '1px solid #1e293b', backgroundColor: '#fafafa', color: '#0f172a', verticalAlign: 'top' }}>
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
                              padding: '6px 10px',
                              border: '1px solid #1e293b',
                              textAlign: 'justify',
                              backgroundColor: highlightPlaceholders && row.label === 'Client' ? '#dbeafe' : '#ffffff',
                            }}
                          >
                            {row.content}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ fontSize: '7.8pt', color: '#64748b', fontStyle: 'italic', marginBottom: 18 }}>
                    The summary above is for convenience only. In the event of any conflict, the operative clauses of this Agreement and Clause 25.2 prevail.
                  </div>

                  {/* =============================================================== */}
                  {/* 4. TABLE OF CONTENTS (2-COLUMN BORDERED TABLE)                   */}
                  {/* =============================================================== */}
                  <div style={{ textAlign: 'center', margin: '18px 0 8px 0' }}>
                    <div style={{ fontSize: '10.5pt', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      TABLE OF CONTENTS
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #1e293b', fontSize: '8.2pt', marginBottom: 22 }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '50%', padding: '5px 8px', border: '1px solid #1e293b' }}>1. Definitions and Interpretation</td>
                        <td style={{ width: '50%', padding: '5px 8px', border: '1px solid #1e293b' }}>15. Indemnity</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>2. Appointment and Nature of Relationship</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>16. Limitation of Liability</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>3. Scope of Recruitment Services</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>17. Compliance, Ethics and Anti-Bribery</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>4. Candidate Submission and Attribution</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>18. Term, Suspension and Termination</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>5. Candidate Fee Protection</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>19. Force Majeure</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>6. Non-Circumvention and Commercial Protection</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>20. Dispute Resolution</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>7. Fees, Taxes, Invoicing and Payment</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>21. Governing Law and Jurisdiction</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>8. Replacement of Placed Candidates</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>22. Notices and Communications</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>9. Responsibilities of {data.client.tradeName || 'Client'}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>23. Assignment and Subcontracting</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>10. Responsibilities of Tasknera</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>24. Electronic Execution and Records</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>11. Confidentiality</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>25. General</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>12. Data Protection and Candidate Privacy</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>Execution Page</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>13. Intellectual Property</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>Schedule A – Master Commercial Terms</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>14. Representations, Warranties and Disclaimers</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>Schedule B – Candidate Data Protection and Information Security</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* =============================================================== */}
                  {/* 5. MASTER RECRUITMENT SERVICES AGREEMENT PREAMBLE               */}
                  {/* =============================================================== */}
                  <div style={{ textAlign: 'center', margin: '22px 0 12px 0' }}>
                    <div style={{ fontSize: '11pt', fontWeight: 800, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      MASTER RECRUITMENT SERVICES AGREEMENT
                    </div>
                  </div>

                  <p style={{ textAlign: 'justify', fontSize: '8.8pt', margin: '0 0 10px 0', lineHeight: 1.6 }}>
                    This Master Recruitment Services Agreement (the “Agreement”) is made and entered into on the Effective Date stated on the cover page by and between:
                  </p>

                  <div style={{ paddingLeft: 12, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '8.8pt', textAlign: 'justify', lineHeight: 1.6 }}>
                    <div>
                      <strong>(A)&nbsp;&nbsp;{data.client.legalName}</strong>, a {data.client.legalForm}, having its registered / business address at {data.client.registeredAddress}, acting through its duly authorised signatory identified in the Party Details below (hereinafter referred to as “{data.client.tradeName}”, which expression shall, unless repugnant to the context or meaning thereof, include its successors and permitted assigns), being the client and hiring company; and
                    </div>
                    <div>
                      <strong>(B)&nbsp;&nbsp;TASKNERA</strong>, a sole proprietorship concern carried on under the trade name “Tasknera” by its sole proprietor, {data.serviceProvider.signatoryName}, having its business address at {data.serviceProvider.registeredAddress}, and represented by its Proprietor, {data.serviceProvider.signatoryName} (hereinafter referred to as “Tasknera”, which expression shall, unless repugnant to the context or meaning thereof, include its proprietor, legal heirs, successors and permitted assigns), being the independent recruitment services provider.
                    </div>
                  </div>

                  <p style={{ fontSize: '8.8pt', margin: '0 0 14px 0' }}>
                    {data.client.tradeName} and Tasknera are each a “Party” and together the “Parties”.
                  </p>

                  {/* =============================================================== */}
                  {/* 6. PARTY DETAILS TABLE                                          */}
                  {/* =============================================================== */}
                  <div style={{ margin: '14px 0 6px 0', fontSize: '9.2pt', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
                    PARTY DETAILS
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #1e293b', fontSize: '8.2pt', marginBottom: 16 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <th style={{ width: '28%', padding: '6px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>Particulars</th>
                        <th style={{ width: '36%', padding: '6px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>{data.client.tradeName} (Client)</th>
                        <th style={{ width: '36%', padding: '6px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>Tasknera (Service Provider)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Full legal name / trade name', client: `${data.client.legalName} (trade name: ${data.client.tradeName}, if different)`, sp: `${data.serviceProvider.tradeName} (trade name)` },
                        { label: 'Legal form', client: data.client.legalForm, sp: data.serviceProvider.legalForm },
                        { label: 'Proprietor / authorised signatory', client: data.client.signatoryName, sp: `${data.serviceProvider.signatoryName} (Proprietor)` },
                        { label: 'Designation', client: data.client.signatoryDesignation, sp: data.serviceProvider.signatoryDesignation },
                        { label: 'Registered / business address', client: data.client.registeredAddress, sp: data.serviceProvider.registeredAddress },
                        { label: 'CIN / LLPIN / Registration No. (if applicable)', client: data.client.cinNumber, sp: data.serviceProvider.cinNumber },
                        { label: 'Udyam Registration No.', client: data.client.udyamNumber, sp: data.serviceProvider.udyamNumber },
                        { label: 'GSTIN', client: data.client.gstin, sp: data.serviceProvider.gstin },
                        { label: 'Email', client: data.client.email, sp: data.serviceProvider.email },
                        { label: 'Phone', client: data.client.phone, sp: data.serviceProvider.phone },
                      ].map((row, rIdx) => (
                        <tr key={rIdx}>
                          <td style={{ fontWeight: 700, padding: '5px 8px', border: '1px solid #1e293b', backgroundColor: '#fafafa' }}>{row.label}</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #1e293b', backgroundColor: highlightPlaceholders ? '#eff6ff' : 'transparent' }}>
                            {row.client}
                          </td>
                          <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>{row.sp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* =============================================================== */}
                  {/* 7. RECITALS                                                     */}
                  {/* =============================================================== */}
                  <div style={{ margin: '14px 0 6px 0', fontSize: '9.2pt', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
                    RECITALS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '8.8pt', textAlign: 'justify', lineHeight: 1.6 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>(1)</span>
                      <span>{data.client.tradeName} is engaged in business and, from time to time, requires to hire employees, consultants or other personnel directly.</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>(2)</span>
                      <span>Tasknera is an independent recruitment services provider offering candidate sourcing, talent acquisition, screening, coordination and related recruitment support services.</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>(3)</span>
                      <span>{data.client.tradeName} wishes to engage Tasknera as a non-exclusive recruitment services provider on the terms of this Agreement, and Tasknera agrees to provide such services on an assignment-by-assignment basis. {data.client.tradeName} will directly employ or engage any Candidate it selects.</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>(4)</span>
                      <span>The Parties intend this Agreement to provide a consistent legal and commercial framework for future recruitment assignments, with the commercial terms for each assignment quoted and agreed in a written Commercial Confirmation, by email or on paper, under the master commercial terms in Schedule A.</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '8.8pt', margin: '14px 0 16px 0', lineHeight: 1.6 }}>
                    NOW, THEREFORE, in consideration of the mutual covenants contained in this Agreement, the Parties agree as follows:
                  </p>

                  {/* =============================================================== */}
                  {/* 8. OPERATIVE CLAUSES 1 TO 25                                    */}
                  {/* =============================================================== */}
                  {data.sections.map((sec) => (
                    <div key={sec.id} style={{ marginBottom: 16 }}>
                      <div style={{ marginTop: 16, marginBottom: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: '9.5pt', textTransform: 'uppercase', color: '#111827' }}>
                          {sec.number}.&nbsp;&nbsp;{sec.title}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {sec.clauses.map((clause) => {
                          const isDefinitionSection = sec.number === 1;
                          const showTitle = !isDefinitionSection && clause.title && !clause.paragraphs[0]?.startsWith(clause.title);

                          return (
                            <div key={clause.id} style={{ fontSize: '8.8pt', textAlign: 'justify', lineHeight: 1.6 }}>
                              <span style={{ fontWeight: 700 }}>{clause.clauseNumber}&nbsp;&nbsp;</span>
                              {showTitle && <span style={{ fontWeight: 700 }}>{clause.title}.&nbsp;</span>}
                              <span>{clause.paragraphs.join(' ')}</span>

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

                              {/* Special Clause 22.3 Notice details table */}
                              {clause.clauseNumber === '22.3' && (
                                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #1e293b', fontSize: '8.2pt', margin: '10px 0' }}>
                                  <thead>
                                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                                      <th style={{ width: '28%', padding: '6px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>Notice details</th>
                                      <th style={{ width: '36%', padding: '6px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>{data.client.tradeName}</th>
                                      <th style={{ width: '36%', padding: '6px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>Tasknera</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td style={{ fontWeight: 700, padding: '5px 8px', border: '1px solid #1e293b', backgroundColor: '#fafafa' }}>Address</td>
                                      <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>{data.client.registeredAddress}</td>
                                      <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>{data.serviceProvider.registeredAddress}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ fontWeight: 700, padding: '5px 8px', border: '1px solid #1e293b', backgroundColor: '#fafafa' }}>Email</td>
                                      <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>{data.client.email}</td>
                                      <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>{data.serviceProvider.email}</td>
                                    </tr>
                                    <tr>
                                      <td style={{ fontWeight: 700, padding: '5px 8px', border: '1px solid #1e293b', backgroundColor: '#fafafa' }}>Attention</td>
                                      <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>{data.client.signatoryName} / {data.client.signatoryDesignation}</td>
                                      <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>{data.serviceProvider.signatoryName}, Proprietor</td>
                                    </tr>
                                    <tr>
                                      <td style={{ fontWeight: 700, padding: '5px 8px', border: '1px solid #1e293b', backgroundColor: '#fafafa' }}>Phone</td>
                                      <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>{data.client.phone}</td>
                                      <td style={{ padding: '5px 8px', border: '1px solid #1e293b' }}>{data.serviceProvider.phone}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* =============================================================== */}
                  {/* 9. EXECUTION PAGE                                               */}
                  {/* =============================================================== */}
                  <div style={{ marginTop: 24, marginBottom: 8, textAlign: 'left' }}>
                    <span style={{ fontWeight: 800, fontSize: '9.5pt', textTransform: 'uppercase', color: '#111827' }}>
                      EXECUTION PAGE
                    </span>
                  </div>

                  <p style={{ textAlign: 'justify', fontSize: '8.8pt', margin: '0 0 12px 0', lineHeight: 1.6 }}>
                    IN WITNESS WHEREOF, the Parties have caused this Agreement and, where applicable, the relevant Schedule(s) to be executed by their duly authorised representatives on the dates set out below, to take effect from the Effective Date.
                  </p>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #1e293b', fontSize: '8.2pt', marginBottom: 16 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <th style={{ width: '50%', padding: '6px 10px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>
                          FOR {data.client.tradeName.toUpperCase()}
                        </th>
                        <th style={{ width: '50%', padding: '6px 10px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>
                          FOR TASKNERA
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '10px 12px', border: '1px solid #1e293b', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div><span style={{ fontWeight: 700 }}>Authorised Signatory Name: </span>{data.client.signatoryName || '____________________'}</div>
                            <div><span style={{ fontWeight: 700 }}>Designation: </span>{data.client.signatoryDesignation || '____________________'}</div>
                            <div><span style={{ fontWeight: 700 }}>Signature: </span>____________________</div>
                            <div><span style={{ fontWeight: 700 }}>Date: </span>{data.clientSignatoryDate || '____________________'}</div>
                            <div><span style={{ fontWeight: 700 }}>Place: </span>{data.clientSignatoryPlace || '____________________'}</div>
                            <div>
                              <span style={{ fontWeight: 700 }}>Company Seal, if applicable: </span>
                              <div style={{ width: 50, height: 50, border: '1px dashed #94a3b8', borderRadius: '50%', marginTop: 4 }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', border: '1px solid #1e293b', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div><span style={{ fontWeight: 700 }}>Proprietor: </span>{data.serviceProvider.signatoryName}</div>
                            <div><span style={{ fontWeight: 700 }}>Designation: </span>{data.serviceProvider.signatoryDesignation}</div>
                            <div><span style={{ fontWeight: 700 }}>Signature: </span>____________________</div>
                            <div><span style={{ fontWeight: 700 }}>Date: </span>{data.taskneraSignatoryDate || '____________________'}</div>
                            <div><span style={{ fontWeight: 700 }}>Place: </span>{data.taskneraSignatoryPlace || 'Delhi, India'}</div>
                            <div>
                              <span style={{ fontWeight: 700 }}>Business Stamp / Seal, if applicable: </span>
                              <div style={{ width: 50, height: 50, border: '1px dashed #94a3b8', borderRadius: '50%', marginTop: 4 }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ margin: '10px 0 6px 0', fontSize: '9pt', fontWeight: 800, textTransform: 'uppercase' }}>
                    WITNESSES (OPTIONAL)
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #1e293b', fontSize: '8.2pt', marginBottom: 22 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <th style={{ width: '50%', padding: '5px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>WITNESS 1</th>
                        <th style={{ width: '50%', padding: '5px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>WITNESS 2</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 10px', border: '1px solid #1e293b' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div><span style={{ fontWeight: 700 }}>Name: </span>{data.witness1.name || '____________________'}</div>
                            <div><span style={{ fontWeight: 700 }}>Address: </span>{data.witness1.address || '____________________'}</div>
                            <div><span style={{ fontWeight: 700 }}>Signature: </span>____________________</div>
                            <div><span style={{ fontWeight: 700 }}>Date: </span>{data.witness1.signatureDate || '____________________'}</div>
                          </div>
                        </td>
                        <td style={{ padding: '8px 10px', border: '1px solid #1e293b' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div><span style={{ fontWeight: 700 }}>Name: </span>{data.witness2.name || '____________________'}</div>
                            <div><span style={{ fontWeight: 700 }}>Address: </span>{data.witness2.address || '____________________'}</div>
                            <div><span style={{ fontWeight: 700 }}>Signature: </span>____________________</div>
                            <div><span style={{ fontWeight: 700 }}>Date: </span>{data.witness2.signatureDate || '____________________'}</div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* =============================================================== */}
                  {/* 10. SCHEDULE A – MASTER COMMERCIAL TERMS                        */}
                  {/* =============================================================== */}
                  <div style={{ marginTop: 22, marginBottom: 8, textAlign: 'left' }}>
                    <span style={{ fontWeight: 800, fontSize: '9.5pt', textTransform: 'uppercase', color: '#111827' }}>
                      SCHEDULE A – MASTER COMMERCIAL TERMS
                    </span>
                  </div>

                  <p style={{ textAlign: 'justify', fontSize: '8.5pt', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                    This Schedule sets out the master commercial terms that apply to every Assignment under the Agreement. Terms for an individual project, vacancy or Assignment are to be quoted by Tasknera and agreed by the Parties in writing, by email or on paper, in a Commercial Confirmation before sourcing begins (Clauses 3.3 and 3.7). A Commercial Confirmation varies this Schedule only to the extent it expressly says so, and Clause 25.2 applies in the event of conflict.
                  </p>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #1e293b', fontSize: '8.2pt', marginBottom: 22 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <th style={{ width: '28%', padding: '6px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>Term</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', border: '1px solid #1e293b', fontWeight: 700 }}>Master Terms</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.scheduleA.map((row) => (
                        <tr key={row.id}>
                          <td style={{ fontWeight: 700, padding: '5px 8px', border: '1px solid #1e293b', verticalAlign: 'top', backgroundColor: '#fafafa' }}>
                            {row.term}
                          </td>
                          <td style={{ padding: '5px 8px', border: '1px solid #1e293b', verticalAlign: 'top', textAlign: 'justify', lineHeight: 1.5 }}>
                            {row.masterTerms}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* =============================================================== */}
                  {/* 11. SCHEDULE B – DATA PROTECTION AND SECURITY                   */}
                  {/* =============================================================== */}
                  <div style={{ marginTop: 22, marginBottom: 8, textAlign: 'left' }}>
                    <span style={{ fontWeight: 800, fontSize: '9.5pt', textTransform: 'uppercase', color: '#111827' }}>
                      SCHEDULE B – CANDIDATE DATA PROTECTION AND INFORMATION SECURITY
                    </span>
                  </div>

                  <p style={{ textAlign: 'justify', fontSize: '8.5pt', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                    {data.scheduleBIntro || 'The following controls apply to Candidate Personal Data exchanged for recruitment purposes, to the extent applicable to the Parties and the relevant processing activity, and are intended to be proportionate to the size and nature of each Party’s business.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '8.5pt', textAlign: 'justify', lineHeight: 1.5 }}>
                    {data.scheduleB.map((secB) => (
                      <div key={secB.id}>
                        <span style={{ fontWeight: 800 }}>{secB.code}&nbsp;&nbsp;</span>
                        <span style={{ fontWeight: 700 }}>{secB.title}:&nbsp;</span>
                        <span>{secB.content}</span>
                      </div>
                    ))}
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
