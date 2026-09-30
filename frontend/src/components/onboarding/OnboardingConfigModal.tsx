import React, { useState } from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
  FileUp,
  Plus,
  Trash2,
  Save,
  Layers,
} from 'lucide-react';
import {
  OnboardingFormConfig,
  ConfigurableSectionDefinition,
  RequiredDocumentDefinition,
  ChecklistItemTemplate,
} from '../../../../shared/types/onboarding-engine.js';
import { Button } from '../common/Button.js';
import { onboardingService } from '../../services/onboardingService.js';
import { useToast } from '../../context/ToastContext.js';

interface OnboardingConfigModalProps {
  config: OnboardingFormConfig;
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: (updatedConfig: OnboardingFormConfig) => void;
}

export const OnboardingConfigModal: React.FC<OnboardingConfigModalProps> = ({
  config,
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'sections' | 'documents' | 'checklist'>('sections');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Local editable copies
  const [sections, setSections] = useState<ConfigurableSectionDefinition[]>(
    JSON.parse(JSON.stringify(config.sections))
  );
  const [requiredDocs, setRequiredDocs] = useState<RequiredDocumentDefinition[]>(
    JSON.parse(JSON.stringify(config.requiredDocuments))
  );
  const [checklist, setChecklist] = useState<ChecklistItemTemplate[]>(
    JSON.parse(JSON.stringify(config.defaultChecklist))
  );

  if (!isOpen) return null;

  const handleToggleSection = (index: number) => {
    const updated = [...sections];
    updated[index].isEnabled = !updated[index].isEnabled;
    setSections(updated);
  };

  const handleToggleRequired = (index: number) => {
    const updated = [...sections];
    updated[index].isRequired = !updated[index].isRequired;
    setSections(updated);
  };

  const handleToggleDocRequired = (index: number) => {
    const updated = [...requiredDocs];
    updated[index].required = !updated[index].required;
    setRequiredDocs(updated);
  };

  const handleAddChecklistItem = () => {
    const newItem: ChecklistItemTemplate = {
      id: `chk_${Date.now()}`,
      title: 'New Onboarding Requirement',
      description: 'Define task deliverables and assigned department',
      assigneeRole: 'HR',
      isMandatory: true,
      dueDateOffsetDays: 0,
    };
    setChecklist([...checklist, newItem]);
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((c) => c.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await onboardingService.updateFormConfig({
        sections,
        requiredDocuments: requiredDocs,
        defaultChecklist: checklist,
      });
      success('Onboarding configuration updated successfully!');
      onConfigSaved(updated);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to update configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: 18,
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                Onboarding Form Schema & Workflow Configurator
              </h3>
              <p style={{ fontSize: '0.78125rem', color: '#64748b' }}>
                Configure form sections, document mandates, and automated joining checklist items
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Config Tabs */}
        <div
          style={{
            display: 'flex',
            padding: '0 24px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            gap: 20,
          }}
        >
          {[
            { id: 'sections', label: 'Form Sections (8)', icon: <Layers size={14} /> },
            { id: 'documents', label: 'Document Collection Rules', icon: <FileUp size={14} /> },
            { id: 'checklist', label: 'Joining Checklist Workflow', icon: <CheckCircle2 size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '12px 4px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: FORM SECTIONS */}
          {activeTab === 'sections' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: 4 }}>
                Toggle sections on/off or change required validation rules for candidates.
              </div>

              {sections.map((sec, idx) => (
                <div
                  key={sec.key}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 12,
                    background: sec.isEnabled ? '#ffffff' : '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: sec.isEnabled ? '#0f172a' : '#94a3b8' }}>
                        {sec.title}
                      </span>
                      {sec.isRequired && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, background: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: 4 }}>
                          MANDATORY
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 3 }}>
                      {sec.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78125rem', cursor: 'pointer', color: '#475569' }}>
                      <input
                        type="checkbox"
                        checked={sec.isRequired}
                        onChange={() => handleToggleRequired(idx)}
                      />
                      <span>Required</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78125rem', cursor: 'pointer', color: '#475569' }}>
                      <input
                        type="checkbox"
                        checked={sec.isEnabled}
                        onChange={() => handleToggleSection(idx)}
                      />
                      <span>Enabled</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: REQUIRED DOCUMENTS */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: 4 }}>
                Configure which verification certificates and ID cards must be submitted.
              </div>

              {requiredDocs.map((doc, idx) => (
                <div
                  key={doc.code}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 12,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                      {doc.name}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                      {doc.description}
                    </p>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 3 }}>
                      Formats: {doc.acceptedFormats.join(', ')} • Max {doc.maxSizeMb} MB
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', cursor: 'pointer', color: '#475569' }}>
                      <input
                        type="checkbox"
                        checked={doc.required}
                        onChange={() => handleToggleDocRequired(idx)}
                      />
                      <span>Mandatory</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: JOINING CHECKLIST */}
          {activeTab === 'checklist' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  Default tasks assigned to IT, HR, Facilities, and Manager upon new candidate onboarding.
                </span>
                <Button
                  variant="secondary"
                  onClick={handleAddChecklistItem}
                  icon={<Plus size={14} />}
                  style={{ fontSize: '0.75rem' }}
                >
                  Add Task
                </Button>
              </div>

              {checklist.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                      {item.title}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                      {item.description}
                    </p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: '0.72rem', color: '#94a3b8' }}>
                      <span>Role: <strong>{item.assigneeRole}</strong></span>
                      <span>Offset: <strong>{item.dueDateOffsetDays >= 0 ? `+${item.dueDateOffsetDays}` : item.dueDateOffsetDays} days</strong></span>
                      <span>{item.isMandatory ? 'Mandatory' : 'Optional'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    title="Delete Task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <Button variant="ghost" onClick={onClose} style={{ fontSize: '0.8125rem' }}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            icon={<Save size={15} />}
            style={{ fontSize: '0.8125rem' }}
          >
            Save Schema Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
