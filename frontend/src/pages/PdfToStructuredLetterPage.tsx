import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Download,
  Copy,
  Check,
  Eye,
  RefreshCw,
  Layers,
  ArrowRight,
  Highlighter,
  Table,
  Plus,
  Trash2,
  Edit3,
  User,
  Users,
  RotateCcw,
  CheckCircle2,
  Search,
  X,
} from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { offerService } from '../services/offerService.js';
import { useToast } from '../context/ToastContext.js';
import { QuickTemplateOfferModal } from '../components/offers/QuickTemplateOfferModal.js';

interface MemberProfile {
  id: string;
  name: string;
  values: Record<string, string>;
}

export const PdfToStructuredLetterPage: React.FC = () => {
  const { success, error, info } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload & Extraction states
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<{
    fileName: string;
    totalPages: number;
    totalDetectedTables?: number;
    detectedVariables: string[];
    extractedValues: Record<string, string>;
    pages: Array<{ pageNumber: number; rawText: string; htmlMarkup: string; tableCount?: number }>;
    fullStructuredHtml: string;
    sections: Array<{ number: number; title: string; content: string }>;
  } | null>(null);

  // Custom user-added dynamic fields & deletion/rename states
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [isAddingField, setIsAddingField] = useState(false);
  const [deletedVariables, setDeletedVariables] = useState<string[]>([]);
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [editingFieldNewName, setEditingFieldNewName] = useState<string>('');
  const [activeHighlightField, setActiveHighlightField] = useState<string | null>(null);
  const [fieldModalState, setFieldModalState] = useState<{
    isOpen: boolean;
    fieldKey: string;
    fieldVal: string;
  } | null>(null);

  // Multi-Candidate / Member Profiles
  const [profiles, setProfiles] = useState<MemberProfile[]>([
    { id: 'member_1', name: 'Member 1 (Primary)', values: {} },
  ]);
  const [activeProfileId, setActiveProfileId] = useState<string>('member_1');

  // Search filter for fields
  const [fieldSearch, setFieldSearch] = useState('');

  // View Controls
  const [activePageTab, setActivePageTab] = useState<'all' | number>('all');
  const [highlightPlaceholders, setHighlightPlaceholders] = useState(true);
  const [isDirectEditMode, setIsDirectEditMode] = useState(false);
  const [viewFormat, setViewFormat] = useState<'visual' | 'html' | 'raw_text'>('visual');
  const [copied, setCopied] = useState(false);

  // In-place page HTML overrides (when directly editing text/tables)
  const [pageOverrides, setPageOverrides] = useState<Record<number, string>>({});

  // Generator Modal Integration
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);

  // Current active member values
  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const dynamicValues = currentProfile?.values || {};

  const setDynamicValues = (newVals: Record<string, string>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === activeProfileId ? { ...p, values: newVals } : p))
    );
  };

  const updateFieldValue = (fieldKey: string, val: string) => {
    setDynamicValues({
      ...dynamicValues,
      [fieldKey]: val,
    });
  };

  // Add new candidate profile
  const handleAddMemberProfile = () => {
    const newId = `member_${Date.now()}`;
    const newNum = profiles.length + 1;
    const newProfile: MemberProfile = {
      id: newId,
      name: `Member ${newNum}`,
      values: {},
    };
    setProfiles([...profiles, newProfile]);
    setActiveProfileId(newId);
    info(`Created new profile: Member ${newNum}. Fill fields to generate their letter.`);
  };

  // Autofill realistic sample data
  const handleAutofillSample = () => {
    const sampleData: Record<string, string> = {
      'Employee Full Name': 'Rahul Dev Sharma',
      'Mr./Ms.': 'Mr.',
      'Designation': 'Senior Full Stack Engineer',
      'Department': 'Engineering & Technology',
      'Reporting Manager': 'Sheetal Bedi, Founder & CEO',
      'Date of Joining': '15/10/2026',
      'DD/MM/YYYY': '01/10/2026',
      'Employment Type': 'Full-Time',
      'Work Location': 'Hybrid (Delhi NCR)',
      'Probation Period': '6 Months',
      'Notice Period': '45 days',
      'Working Days / Shift': '5 working days and a 9-hour shift (10:00 AM - 7:00 PM)',
      'Annual CTC': '18,00,000',
      'Basic Salary': '75,000',
      'HRA': '37,500',
      'Special / Other Allowance': '25,000',
      'Gross Monthly Salary': '1,37,500',
      'Employer Contributions': '12,500',
      'Total Fixed CTC (Per Month)': '1,50,000',
      'Total Fixed CTC (Per Annum)': '18,00,000',
      'TASK/YYYY/000': 'TASK/2026/089',
      'NA': 'Included in statutory coverage',
      'Full-Time': 'Full-Time Permanent',
    };

    setDynamicValues({
      ...dynamicValues,
      ...sampleData,
    });
    success('Autofilled sample data for candidate! Preview updated across all pages.');
  };

  // Clear current profile inputs
  const handleClearInputs = () => {
    setDynamicValues({});
    info('Cleared all dynamic field values for this profile.');
  };

  // Handle PDF file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      error('Please upload a valid .pdf document.');
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const data = await offerService.convertPdfToStructuredLetter(file);
      setExtractedData(data);
      setPageOverrides({});
      setActivePageTab('all');
      setDeletedVariables([]);
      if (data.extractedValues && Object.keys(data.extractedValues).length > 0) {
        setDynamicValues(data.extractedValues);
      }
      success(`Successfully extracted ${data.totalPages} pages with recognized tables into TaskNera format!`);
    } catch (err: any) {
      error(err.message || 'Failed to extract text from PDF. Ensure Python or Node parser is available.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add custom dynamic field
  const handleAddCustomField = () => {
    const cleanName = newFieldName.trim().replace(/[\[\]]/g, '');
    if (!cleanName) return;
    if (allVariables.includes(cleanName)) {
      error(`Field [${cleanName}] already exists.`);
      return;
    }
    setCustomFields([...customFields, cleanName]);
    setNewFieldName('');
    setIsAddingField(false);
    success(`Added dynamic field [${cleanName}]! You can now bind it in the document.`);
  };

  // Rename an existing dynamic field across the template and member values
  const handleRenameField = (oldKey: string, newKey: string) => {
    const cleanNew = newKey.trim().replace(/[\[\]]/g, '');
    if (!cleanNew) {
      error('Field name cannot be empty.');
      return;
    }
    if (cleanNew === oldKey) {
      setEditingFieldKey(null);
      return;
    }
    if (allVariables.includes(cleanNew)) {
      error(`Field [${cleanNew}] already exists.`);
      return;
    }

    // Update variable lists
    setDeletedVariables((prev) => [...prev, oldKey]);
    setCustomFields((prev) => [...prev.filter((k) => k !== oldKey), cleanNew]);

    // Migrate values across profiles
    setProfiles((prev) =>
      prev.map((p) => {
        const nextVals = { ...p.values };
        if (nextVals[oldKey] !== undefined) {
          nextVals[cleanNew] = nextVals[oldKey];
          delete nextVals[oldKey];
        }
        return { ...p, values: nextVals };
      })
    );

    // Replace in document template
    if (extractedData) {
      const escapedOld = oldKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const updatedPages = extractedData.pages.map((p) => ({
        ...p,
        htmlMarkup: p.htmlMarkup.replace(new RegExp(`\\[${escapedOld}\\]`, 'g'), `[${cleanNew}]`),
      }));
      setExtractedData({
        ...extractedData,
        pages: updatedPages,
      });
    }

    // Also update any active page overrides
    setPageOverrides((prev) => {
      const updated: Record<number, string> = {};
      const escapedOld = oldKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      for (const [k, v] of Object.entries(prev)) {
        updated[Number(k)] = v.replace(new RegExp(`\\[${escapedOld}\\]`, 'g'), `[${cleanNew}]`);
      }
      return updated;
    });

    setEditingFieldKey(null);
    setEditingFieldNewName('');
    success(`Renamed dynamic field [${oldKey}] to [${cleanNew}] across all pages!`);
  };

  // Delete/remove an unwanted dynamic field
  const handleDeleteField = (fieldKey: string) => {
    setDeletedVariables((prev) => [...prev, fieldKey]);
    setCustomFields((prev) => prev.filter((k) => k !== fieldKey));
    setProfiles((prev) =>
      prev.map((p) => {
        const nextVals = { ...p.values };
        delete nextVals[fieldKey];
        return { ...p, values: nextVals };
      })
    );
    info(`Removed dynamic field [${fieldKey}].`);
  };

  // Scroll to and highlight field in the document
  const handleLocateFieldInDocument = (fieldKey: string) => {
    setActiveHighlightField(fieldKey);
    const targetEl = document.querySelector(`[data-field-key="${CSS.escape(fieldKey)}"]`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetEl.classList.add('pulse-highlight');
      setTimeout(() => targetEl.classList.remove('pulse-highlight'), 2500);
      info(`Located [${fieldKey}] in document.`);
    } else {
      info(`[${fieldKey}] is configured for this template.`);
    }
  };

  // Handle clicking on dynamic fields directly in the document
  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDirectEditMode) return;

    const target = (e.target as HTMLElement).closest('[data-field-key]');
    if (target) {
      e.stopPropagation();
      const fieldKey = target.getAttribute('data-field-key');
      if (fieldKey) {
        setFieldModalState({
          isOpen: true,
          fieldKey,
          fieldVal: dynamicValues[fieldKey] || '',
        });
        setActiveHighlightField(fieldKey);
        const inputId = `field-input-${fieldKey.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const inputEl = document.getElementById(inputId);
        if (inputEl) {
          inputEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          inputEl.focus();
        }
      }
    }
  };

  // All combined variables (detected from PDF + user-added custom fields, excluding deleted)
  const allVariables = React.useMemo(() => {
    const base = extractedData?.detectedVariables || [];
    const combined = Array.from(new Set([...base, ...customFields]));
    // Filter out pure single digits and deleted fields
    return combined.filter(
      (v) => v.length > 0 && !/^\d$/.test(v) && !deletedVariables.includes(v)
    );
  }, [extractedData, customFields, deletedVariables]);

  // Filtered variables based on search
  const filteredVariables = React.useMemo(() => {
    if (!fieldSearch.trim()) return allVariables;
    const query = fieldSearch.toLowerCase();
    return allVariables.filter((v) => v.toLowerCase().includes(query));
  }, [allVariables, fieldSearch]);

  // Interpolate dynamic values into HTML
  const getRenderedHtml = (htmlContent: string, pageNum?: number): string => {
    // If user edited this page directly, use their overridden HTML
    let result = (pageNum && pageOverrides[pageNum]) ? pageOverrides[pageNum] : htmlContent;

    for (const [key, val] of Object.entries(dynamicValues)) {
      if (!val || !val.trim()) continue;

      const displayVal = highlightPlaceholders
        ? `<mark class="interactive-field-pill populated" data-field-key="${key}" title="Click to edit [${key}]" style="background-color:#dcfce7; color:#166534; padding:2px 6px; border-radius:4px; font-weight:700; cursor:pointer; border:1px solid #86efac; display:inline-block; transition:all 0.15s ease;">${val}</mark>`
        : `<strong class="interactive-field-pill" data-field-key="${key}" style="cursor:pointer;" title="Click to edit [${key}]">${val}</strong>`;

      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // 1. Match mark tag containing bracketed placeholder: <mark ...>[Key]</mark>
      const markRegex = new RegExp(`<mark[^>]*>\\[${escapedKey}\\]<\\/mark>`, 'gi');
      result = result.replace(markRegex, displayVal);

      // 2. Match raw bracketed placeholder: [Key]
      const bracketRegex = new RegExp(`\\[${escapedKey}\\]`, 'gi');
      result = result.replace(bracketRegex, displayVal);

      // 3. Match double mustache: {{Key}} and {{key_snake_case}}
      const snakeKey = key.toLowerCase().replace(/\s+/g, '_');
      const mustacheRegex = new RegExp(`\\{\\{(${escapedKey}|${snakeKey})\\}\\}`, 'gi');
      result = result.replace(mustacheRegex, displayVal);
    }

    // Add interactive click attributes to unpopulated bracketed marks
    result = result.replace(
      /<mark style="background-color:#fef08a;([^"]*)">\[([a-zA-Z0-9_\s\-\/\.]+)\]<\/mark>/gi,
      (_match, _styles, varName) => {
        return `<mark class="interactive-field-pill unpopulated" data-field-key="${varName}" title="Click to edit [${varName}]" style="background-color:#fef08a; color:#854d0e; padding:2px 6px; border-radius:4px; font-weight:700; cursor:pointer; border:1px dashed #d97706; display:inline-block; transition:all 0.15s ease;">[${varName}] ✏️</mark>`;
      }
    );

    if (!highlightPlaceholders) {
      // Strip any remaining mark tags to clean text
      result = result.replace(/<mark style="[^"]*">([\s\S]*?)<\/mark>/gi, '$1');
    }

    return result;
  };

  // Download / Print Multi-Page PDF
  const handlePrintPdf = () => {
    const prevTitle = document.title;
    const candidateName =
      dynamicValues['Employee Full Name'] ||
      dynamicValues['employee_name'] ||
      currentProfile.name ||
      'Candidate';
    document.title = `TaskNera_Offer_Letter_${candidateName.replace(/\s+/g, '_')}`;

    // Temporarily turn off yellow/green highlights during print for clean professional finish
    const prevHighlight = highlightPlaceholders;
    setHighlightPlaceholders(false);

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = prevTitle;
        setHighlightPlaceholders(prevHighlight);
      }, 1000);
    }, 150);
  };

  // Copy HTML
  const handleCopyHtml = () => {
    if (!extractedData) return;
    const fullHtmlWithValues = extractedData.pages
      .map((p) => getRenderedHtml(p.htmlMarkup, p.pageNumber))
      .join('\n\n');
    navigator.clipboard.writeText(fullHtmlWithValues);
    setCopied(true);
    success('Structured multi-page HTML with populated values copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle in-place direct editing
  const handleDirectPageEdit = (pageNum: number, newHtml: string) => {
    setPageOverrides((prev) => ({
      ...prev,
      [pageNum]: newHtml,
    }));
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1440, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#fdfbf9',
                border: '2px solid #a35d39',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={24} color="#a35d39" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                AI PDF to Letter &amp; Flexible Generator Studio
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                Accepts any contract or offer PDF, extracts tables &amp; text page-by-page, and adapts the input form dynamically to whatever fields vary from member to member.
              </p>
            </div>
          </div>

          {/* Quick Actions if Document Loaded */}
          {extractedData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Button
                variant="secondary"
                icon={<Upload size={14} />}
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: '0.8125rem' }}
              >
                Change PDF
              </Button>
              <Button
                variant="primary"
                icon={<Download size={15} />}
                onClick={handlePrintPdf}
                style={{ background: '#a35d39', borderColor: '#a35d39', fontSize: '0.8125rem' }}
              >
                Download Letter (PDF)
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
      />

      {/* Upload Zone (Shown prominently when no document is loaded) */}
      {!extractedData && (
        <div
          className="glass-panel"
          style={{
            padding: '48px 32px',
            background: '#ffffff',
            border: '2px dashed #cbd5e1',
            borderRadius: 18,
            marginBottom: 28,
            textAlign: 'center',
            cursor: isProcessing ? 'default' : 'pointer',
          }}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: '#fae1c3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Upload size={32} color="#a35d39" />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Upload Any Contract, Offer Letter or Agreement PDF
          </h3>
          <p style={{ fontSize: '0.9375rem', color: '#64748b', margin: '0 auto 24px', maxWidth: 640, lineHeight: 1.6 }}>
            Upload single or multi-page documents (1 to 11+ pages). The AI engine detects all vector and schedule tables (Annexure I, Annexure III, IP clauses), formats each page into the official TaskNera letterhead, and creates a flexible dynamic form for any fields that change candidate-to-candidate.
          </p>

          <Button
            variant="primary"
            icon={isProcessing ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isProcessing}
            style={{ background: '#a35d39', borderColor: '#a35d39', padding: '12px 28px', fontSize: '1rem' }}
          >
            {isProcessing ? 'Analyzing Document & Tables with Python AI...' : 'Choose PDF Document'}
          </Button>
        </div>
      )}

      {/* Main Studio View (Once Extracted) */}
      {extractedData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 390px', gap: 24, alignItems: 'start' }}>
          {/* Left Column: Multi-Page Document Viewport */}
          <div style={{ minWidth: 0, width: '100%', overflowX: 'auto', paddingBottom: 16 }}>
            {/* Top Toolbar */}
            <div
              className="glass-panel"
              style={{
                padding: '12px 18px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 14,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              {/* Page Navigator Tabs with Table Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginRight: 4 }}>
                  Pages ({extractedData.totalPages}):
                </span>
                <button
                  type="button"
                  onClick={() => setActivePageTab('all')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: '1px solid #cbd5e1',
                    background: activePageTab === 'all' ? '#0f172a' : '#ffffff',
                    color: activePageTab === 'all' ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                  }}
                >
                  All Pages ({extractedData.totalPages})
                </button>
                {extractedData.pages.map((p) => {
                  const hasTable = (p.tableCount && p.tableCount > 0) || p.htmlMarkup.includes('<table');
                  return (
                    <button
                      key={p.pageNumber}
                      type="button"
                      onClick={() => setActivePageTab(p.pageNumber)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid #cbd5e1',
                        background: activePageTab === p.pageNumber ? '#a35d39' : '#ffffff',
                        color: activePageTab === p.pageNumber ? '#ffffff' : '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      Page {p.pageNumber}
                      {hasTable && (
                        <span
                          style={{
                            fontSize: '0.625rem',
                            padding: '1px 5px',
                            borderRadius: 4,
                            background: activePageTab === p.pageNumber ? 'rgba(255,255,255,0.3)' : '#fae1c3',
                            color: activePageTab === p.pageNumber ? '#ffffff' : '#a35d39',
                            fontWeight: 700,
                          }}
                          title="Contains recognized data/schedule table"
                        >
                          Table
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View & Edit Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {/* Direct Editing Mode Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDirectEditMode(!isDirectEditMode);
                    if (!isDirectEditMode) {
                      info('Direct Edit Mode ON: Click any text or table cell in the document to edit it.');
                    }
                  }}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: '1px solid #cbd5e1',
                    background: isDirectEditMode ? '#fef3c7' : '#ffffff',
                    color: isDirectEditMode ? '#92400e' : '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                  title="Enable direct text and cell editing on the page"
                >
                  <Edit3 size={13} color={isDirectEditMode ? '#92400e' : '#64748b'} />
                  {isDirectEditMode ? 'Direct Edit: ON' : 'Edit Text In-Place'}
                </button>

                {/* Highlight Toggle */}
                <button
                  type="button"
                  onClick={() => setHighlightPlaceholders(!highlightPlaceholders)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: '1px solid #cbd5e1',
                    background: highlightPlaceholders ? '#fdfbf9' : '#ffffff',
                    color: highlightPlaceholders ? '#a35d39' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Highlighter size={13} color={highlightPlaceholders ? '#a35d39' : '#64748b'} />
                  {highlightPlaceholders ? 'Highlights ON' : 'Clean View'}
                </button>

                {/* View Format Switcher */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 6, padding: 2 }}>
                  <button
                    type="button"
                    onClick={() => setViewFormat('visual')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: 'none',
                      background: viewFormat === 'visual' ? '#ffffff' : 'transparent',
                      color: viewFormat === 'visual' ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    Visual
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewFormat('html')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: 'none',
                      background: viewFormat === 'html' ? '#ffffff' : 'transparent',
                      color: viewFormat === 'html' ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewFormat('raw_text')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: 'none',
                      background: viewFormat === 'raw_text' ? '#ffffff' : 'transparent',
                      color: viewFormat === 'raw_text' ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    Raw
                  </button>
                </div>

                <Button
                  variant="secondary"
                  icon={copied ? <Check size={14} /> : <Copy size={14} />}
                  onClick={handleCopyHtml}
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                >
                  {copied ? 'Copied' : 'Copy HTML'}
                </Button>
              </div>
            </div>

            {/* Direct Edit Mode Indicator */}
            {isDirectEditMode && (
              <div
                style={{
                  background: '#fefce8',
                  border: '1px solid #fde047',
                  borderRadius: 8,
                  padding: '8px 14px',
                  marginBottom: 14,
                  fontSize: '0.8125rem',
                  color: '#854d0e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>
                  ✍️ <strong>Direct In-Place Editing Active:</strong> You can click anywhere on the page (paragraphs, tables, dates) to edit text directly.
                </span>
                {Object.keys(pageOverrides).length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPageOverrides({});
                      info('Reset all page overrides to original template.');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#b45309',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    Reset Overrides
                  </button>
                )}
              </div>
            )}

            {/* Visual Multi-Page Letterhead View */}
            {viewFormat === 'visual' && (
              <div
                id="printable-offer-document"
                className="printable-letterhead-paper"
                onClick={handleDocumentClick}
                style={{ width: '100%', maxWidth: 794, margin: '0 auto', boxSizing: 'border-box' }}
              >
                {activePageTab === 'all'
                  ? extractedData.pages.map((p) => (
                      <div
                        key={p.pageNumber}
                        data-page-num={p.pageNumber}
                        contentEditable={isDirectEditMode}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                          if (isDirectEditMode) {
                            handleDirectPageEdit(p.pageNumber, e.currentTarget.innerHTML);
                          }
                        }}
                        dangerouslySetInnerHTML={{ __html: getRenderedHtml(p.htmlMarkup, p.pageNumber) }}
                      />
                    ))
                  : extractedData.pages
                      .filter((p) => p.pageNumber === activePageTab)
                      .map((p) => (
                        <div
                          key={p.pageNumber}
                          data-page-num={p.pageNumber}
                          contentEditable={isDirectEditMode}
                          suppressContentEditableWarning={true}
                          onBlur={(e) => {
                            if (isDirectEditMode) {
                              handleDirectPageEdit(p.pageNumber, e.currentTarget.innerHTML);
                            }
                          }}
                          dangerouslySetInnerHTML={{ __html: getRenderedHtml(p.htmlMarkup, p.pageNumber) }}
                        />
                      ))}
              </div>
            )}

            {/* HTML Source View */}
            {viewFormat === 'html' && (
              <div style={{ background: '#0f172a', borderRadius: 12, padding: 20, overflowX: 'auto' }}>
                <pre
                  style={{
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: '0.8125rem',
                    lineHeight: 1.5,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {activePageTab === 'all'
                    ? extractedData.pages.map((p) => getRenderedHtml(p.htmlMarkup, p.pageNumber)).join('\n\n')
                    : getRenderedHtml(
                        extractedData.pages.find((p) => p.pageNumber === activePageTab)?.htmlMarkup || '',
                        activePageTab as number
                      )}
                </pre>
              </div>
            )}

            {/* Raw Text View */}
            {viewFormat === 'raw_text' && (
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, padding: 20 }}>
                {activePageTab === 'all'
                  ? extractedData.pages.map((p) => (
                      <div key={p.pageNumber} style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #e2d3ca' }}>
                        <div style={{ fontWeight: 700, color: '#a35d39', marginBottom: 8, fontSize: '0.875rem' }}>
                          Page {p.pageNumber}:
                        </div>
                        <pre style={{ margin: 0, fontSize: '0.8125rem', whiteSpace: 'pre-wrap', color: '#334155' }}>
                          {p.rawText}
                        </pre>
                      </div>
                    ))
                  : (
                    <div>
                      <div style={{ fontWeight: 700, color: '#a35d39', marginBottom: 8, fontSize: '0.875rem' }}>
                        Page {activePageTab}:
                      </div>
                      <pre style={{ margin: 0, fontSize: '0.8125rem', whiteSpace: 'pre-wrap', color: '#334155' }}>
                        {extractedData.pages.find((p) => p.pageNumber === activePageTab)?.rawText}
                      </pre>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Right Column: Completely Flexible Dynamic Field Form & Member Switcher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Primary Action Card: Download Letter for Member */}
            <div
              className="glass-panel"
              style={{
                padding: '18px 20px',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                borderRadius: 14,
                color: '#ffffff',
                border: '1px solid #312e81',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={18} color="#fae1c3" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                    Generate &amp; Download Letter
                  </h4>
                </div>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', margin: '0 0 14px', lineHeight: 1.4 }}>
                Inserts all values below into the multi-page template and downloads the complete letter for this candidate.
              </p>
              <Button
                variant="primary"
                icon={<Download size={15} />}
                onClick={handlePrintPdf}
                style={{ width: '100%', background: '#a35d39', borderColor: '#a35d39', justifyContent: 'center', fontWeight: 700 }}
              >
                Download Letter (PDF)
              </Button>
            </div>

            {/* Candidate / Member Profile Switcher (For Multiple Members) */}
            <div
              className="glass-panel"
              style={{
                padding: '16px 18px',
                background: '#ffffff',
                border: '1px solid #e2d3ca',
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a35d39', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={14} />
                  Candidate / Member Profile
                </span>
                <button
                  type="button"
                  onClick={handleAddMemberProfile}
                  style={{
                    border: 'none',
                    background: '#fae1c3',
                    color: '#a35d39',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                  title="Add another candidate to generate for next"
                >
                  <Plus size={12} /> Add Member
                </button>
              </div>

              {/* Profiles Tabs */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {profiles.map((prof) => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => setActiveProfileId(prof.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: activeProfileId === prof.id ? '#a35d39' : '#e2e8f0',
                      background: activeProfileId === prof.id ? '#fdfbf9' : '#ffffff',
                      color: activeProfileId === prof.id ? '#a35d39' : '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    {prof.name}
                  </button>
                ))}
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleAutofillSample}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: '1px solid #fae1c3',
                    background: '#fdfbf9',
                    color: '#a35d39',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <Sparkles size={12} /> Fill Sample Data
                </button>
                <button
                  type="button"
                  onClick={handleClearInputs}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  title="Clear inputs for new member"
                >
                  <RotateCcw size={12} /> Clear
                </button>
              </div>
            </div>

            {/* Flexible Dynamic Fields List */}
            <div
              className="glass-panel"
              style={{
                padding: '18px 20px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>
                  Dynamic Fields ({allVariables.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingField(!isAddingField)}
                  style={{
                    border: 'none',
                    background: '#fae1c3',
                    color: '#a35d39',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Plus size={13} /> Add Field
                </button>
              </div>

              {/* Add Custom Field Inline Box */}
              {isAddingField && (
                <div
                  style={{
                    background: '#fdfbf9',
                    border: '1px solid #dfcfc7',
                    borderRadius: 8,
                    padding: '10px 12px',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    New Dynamic Field Name:
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Variable Bonus or Target"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomField()}
                      style={{ fontSize: '0.8125rem', padding: '5px 8px', flex: 1 }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      style={{
                        padding: '5px 10px',
                        background: '#a35d39',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Search Bar for Fields */}
              {allVariables.length > 6 && (
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 9, top: 9 }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search dynamic fields..."
                    value={fieldSearch}
                    onChange={(e) => setFieldSearch(e.target.value)}
                    style={{ fontSize: '0.75rem', padding: '6px 8px 6px 28px' }}
                  />
                </div>
              )}

              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 12px' }}>
                Fill details for each dynamic placeholder. All changes update across all 11 pages and tables in real time:
              </p>

              {/* Fields Inputs Scrollable List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, maxHeight: 440, overflowY: 'auto', paddingRight: 4 }}>
                {filteredVariables.map((v) => {
                  const currentVal = dynamicValues[v] || '';
                  const isPopulated = currentVal.trim().length > 0;
                  const isRenaming = editingFieldKey === v;
                  const isHighlighted = activeHighlightField === v;

                  return (
                    <div
                      key={v}
                      id={`field-card-${v.replace(/[^a-zA-Z0-9]/g, '_')}`}
                      style={{
                        background: isHighlighted ? '#fefce8' : isPopulated ? '#f0fdf4' : '#f8fafc',
                        border: '1px solid',
                        borderColor: isHighlighted ? '#f59e0b' : isPopulated ? '#86efac' : '#e2e8f0',
                        boxShadow: isHighlighted ? '0 0 0 2px rgba(245, 158, 11, 0.25)' : 'none',
                        borderRadius: 8,
                        padding: '8px 10px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Field Header / Rename Mode */}
                      {isRenaming ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <input
                            type="text"
                            className="form-input"
                            value={editingFieldNewName}
                            onChange={(e) => setEditingFieldNewName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameField(v, editingFieldNewName);
                              if (e.key === 'Escape') setEditingFieldKey(null);
                            }}
                            style={{ fontSize: '0.75rem', padding: '3px 6px', flex: 1 }}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleRenameField(v, editingFieldNewName)}
                            style={{
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 4,
                              padding: '4px 7px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Save Rename"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingFieldKey(null)}
                            style={{
                              background: '#e2e8f0',
                              color: '#475569',
                              border: 'none',
                              borderRadius: 4,
                              padding: '4px 6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isPopulated ? '#166534' : '#334155' }}>
                              [{v}]
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFieldKey(v);
                                setEditingFieldNewName(v);
                              }}
                              style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: '#94a3b8' }}
                              title={`Rename [${v}]`}
                            >
                              <Edit3 size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleLocateFieldInDocument(v)}
                              style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: '#94a3b8' }}
                              title={`Locate [${v}] in letter`}
                            >
                              <Eye size={11} />
                            </button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {isPopulated && (
                              <span style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CheckCircle2 size={11} /> Filled
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteField(v)}
                              style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', color: '#cbd5e1' }}
                              title={`Remove field [${v}]`}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Value Input */}
                      <div style={{ position: 'relative' }}>
                        <input
                          id={`field-input-${v.replace(/[^a-zA-Z0-9]/g, '_')}`}
                          type="text"
                          className="form-input"
                          placeholder={`Enter ${v}...`}
                          value={currentVal}
                          onChange={(e) => updateFieldValue(v, e.target.value)}
                          style={{
                            fontSize: '0.8125rem',
                            padding: isPopulated ? '6px 26px 6px 9px' : '6px 9px',
                            background: '#ffffff',
                            borderColor: isHighlighted ? '#f59e0b' : isPopulated ? '#bbf7d0' : '#cbd5e1',
                          }}
                        />
                        {isPopulated && (
                          <button
                            type="button"
                            onClick={() => updateFieldValue(v, '')}
                            style={{
                              position: 'absolute',
                              right: 6,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              padding: 2,
                              cursor: 'pointer',
                              color: '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Clear value"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredVariables.length === 0 && (
                  <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic', padding: '12px 0', textAlign: 'center' }}>
                    No matching fields found.
                  </div>
                )}
              </div>
            </div>

            {/* Recognized Tables Summary Card */}
            <div
              className="glass-panel"
              style={{
                padding: '16px 18px',
                background: '#ffffff',
                border: '1px solid #dfcfc7',
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Table size={16} color="#a35d39" />
                  Recognized Tables
                </h4>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: '#fae1c3',
                    color: '#a35d39',
                  }}
                >
                  {extractedData.pages.filter((p) => p.htmlMarkup.includes('<table')).length} Pages
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 10px', lineHeight: 1.4 }}>
                Annexure I (Joining Details), Annexure III (Compensation Structure), and IP Disclosure tables detected with TaskNera borders and column highlights.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8125rem' }}>
                {extractedData.pages.map((p) => {
                  const tblCount = (p.htmlMarkup.match(/<table/g) || []).length;
                  if (tblCount === 0) return null;
                  return (
                    <div
                      key={p.pageNumber}
                      onClick={() => setActivePageTab(p.pageNumber)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: '#fdfbf9',
                        borderRadius: 6,
                        border: '1px solid #dfcfc7',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fae1c322')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#fdfbf9')}
                    >
                      <span style={{ fontWeight: 600, color: '#334155' }}>Page {p.pageNumber}</span>
                      <span style={{ fontSize: '0.75rem', color: '#a35d39', fontWeight: 700 }}>
                        {tblCount} {tblCount === 1 ? 'Table' : 'Tables'} Formatted &rarr;
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick-Edit Modal for clicking directly on dynamic fields in the document */}
      {fieldModalState && fieldModalState.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setFieldModalState(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '22px 26px',
              maxWidth: 440,
              width: '92%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
              border: '1px solid #dfcfc7',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Sparkles size={16} color="#a35d39" />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Edit Dynamic Field
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setFieldModalState(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Field Placeholder Tag:</span>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#a35d39', marginTop: 2 }}>
                [{fieldModalState.fieldKey}]
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Value for this Candidate / Member:
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={`Enter value for [${fieldModalState.fieldKey}]...`}
                value={fieldModalState.fieldVal}
                onChange={(e) => setFieldModalState({ ...fieldModalState, fieldVal: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateFieldValue(fieldModalState.fieldKey, fieldModalState.fieldVal);
                    setFieldModalState(null);
                    success(`Updated [${fieldModalState.fieldKey}] in document!`);
                  }
                  if (e.key === 'Escape') {
                    setFieldModalState(null);
                  }
                }}
                style={{ fontSize: '0.9375rem', padding: '8px 12px' }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button
                variant="secondary"
                onClick={() => setFieldModalState(null)}
                style={{ fontSize: '0.8125rem' }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  updateFieldValue(fieldModalState.fieldKey, fieldModalState.fieldVal);
                  setFieldModalState(null);
                  success(`Updated [${fieldModalState.fieldKey}] in document!`);
                }}
                style={{ background: '#a35d39', borderColor: '#a35d39', fontSize: '0.8125rem' }}
              >
                Apply to Document
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Generator Modal Instance */}
      <QuickTemplateOfferModal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
      />
    </div>
  );
};
