import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  BookOpen,
  Sparkles,
  RefreshCw,
  FolderKanban,
} from 'lucide-react';
import { OfferTemplate, TemplateVersion } from '../types/template.js';
import { templateService } from '../services/templateService.js';
import { TemplateList } from '../components/templates/TemplateList.js';
import { TemplateEditor } from '../components/templates/TemplateEditor.js';
import { TemplatePreviewModal } from '../components/templates/TemplatePreviewModal.js';
import { TemplateDuplicateModal } from '../components/templates/TemplateDuplicateModal.js';
import { TemplateVersionHistoryModal } from '../components/templates/TemplateVersionHistoryModal.js';
import { PlaceholderManagerModal } from '../components/templates/PlaceholderManagerModal.js';
import { useToast } from '../context/ToastContext.js';

export const TemplatesPage: React.FC = () => {
  const { success, error, info } = useToast();

  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // View state: 'list' | 'create' | 'edit'
  const [currentView, setCurrentView] = useState<'list' | 'editor'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<OfferTemplate | null>(null);

  // Modal states
  const [previewTemplate, setPreviewTemplate] = useState<OfferTemplate | null>(null);
  const [duplicateTemplate, setDuplicateTemplate] = useState<OfferTemplate | null>(null);
  const [historyTemplate, setHistoryTemplate] = useState<OfferTemplate | null>(null);
  const [showCatalogModal, setShowCatalogModal] = useState<boolean>(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch {
      error('Unable to sync templates with backend server. Loaded local templates.', 'Network Error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setCurrentView('editor');
  };

  const handleEdit = (tpl: OfferTemplate) => {
    setSelectedTemplate(tpl);
    setCurrentView('editor');
  };

  const handleSaveSuccess = (saved: OfferTemplate) => {
    success(`"${saved.title}" (v${saved.currentVersion?.versionNumber || 1}) was successfully recorded.`, 'Template Saved');
    setCurrentView('list');
    setSelectedTemplate(null);
    loadTemplates();
  };

  const handleToggleActive = async (tpl: OfferTemplate) => {
    try {
      const nextState = !tpl.isActive;
      const updated = await templateService.toggleActive(tpl.id, nextState);
      setTemplates((prev) => prev.map((t) => (t.id === tpl.id ? updated : t)));
      info(`Template is now ${nextState ? 'Active' : 'Disabled'}.`, 'Status Updated');
    } catch (err: any) {
      error(err?.message || 'Failed to update template status', 'Error');
    }
  };

  const handleDuplicateSuccess = (duplicated: OfferTemplate) => {
    setTemplates((prev) => [duplicated, ...prev]);
    success(`Cloned as "${duplicated.title}" (v1).`, 'Template Duplicated');
  };

  const handleRollbackSuccess = (updated: OfferTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    success(`Active version set to v${updated.currentVersion?.versionNumber} for "${updated.title}".`, 'Version Rolled Back');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header (when on list view) */}
      {currentView === 'list' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--ai-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px var(--ai-glow)',
                }}
              >
                <FileText size={20} color="#fff" />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Offer Letter Templates</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
              Design, version, tokenize, and elevate legal employment templates with integrated AI assistance.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCatalogModal(true)}
              style={{ fontSize: '0.8125rem' }}
            >
              <BookOpen size={15} style={{ color: '#818cf8' }} />
              <span>Placeholder Registry</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={loadTemplates}
              disabled={loading}
              title="Refresh templates"
              style={{ padding: '9px 12px' }}
            >
              <RefreshCw size={15} className={loading ? 'spinner' : ''} />
            </button>

            <button type="button" className="btn btn-primary" onClick={handleCreateNew}>
              <Plus size={16} />
              <span>New Template</span>
            </button>
          </div>
        </div>
      )}

      {/* Main View Router */}
      {currentView === 'editor' ? (
        <TemplateEditor
          template={selectedTemplate}
          onSave={handleSaveSuccess}
          onCancel={() => {
            setCurrentView('list');
            setSelectedTemplate(null);
          }}
        />
      ) : (
        <TemplateList
          templates={templates}
          onSelectEdit={handleEdit}
          onSelectPreview={(tpl) => setPreviewTemplate(tpl)}
          onSelectDuplicate={(tpl) => setDuplicateTemplate(tpl)}
          onSelectHistory={(tpl) => setHistoryTemplate(tpl)}
          onToggleActive={handleToggleActive}
          onCreateNew={handleCreateNew}
        />
      )}

      {/* Global Modals */}
      <TemplatePreviewModal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
      />

      <TemplateDuplicateModal
        isOpen={!!duplicateTemplate}
        onClose={() => setDuplicateTemplate(null)}
        template={duplicateTemplate}
        onSuccess={handleDuplicateSuccess}
      />

      <TemplateVersionHistoryModal
        isOpen={!!historyTemplate}
        onClose={() => setHistoryTemplate(null)}
        template={historyTemplate}
        onRollbackSuccess={handleRollbackSuccess}
        onPreviewVersion={(ver) => {
          if (historyTemplate) {
            setPreviewTemplate({
              ...historyTemplate,
              currentVersion: ver,
            });
          }
        }}
      />

      <PlaceholderManagerModal
        isOpen={showCatalogModal}
        onClose={() => setShowCatalogModal(false)}
      />
    </div>
  );
};
