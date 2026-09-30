import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DocumentList } from '../components/documents/DocumentList.js';
import { DocumentCreationWizard } from '../components/documents/DocumentCreationWizard.js';
import { DocumentPreview } from '../components/documents/DocumentPreview.js';
import { DocumentSendModal } from '../components/documents/DocumentSendModal.js';
import { HrDocument, DocumentTypeDefinition } from '../types/document-engine.js';
import { DocumentEngineService } from '../services/documentEngineService.js';
import { useToast } from '../context/ToastContext.js';

interface DocumentsPageProps {
  createMode?: boolean;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ createMode = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { error } = useToast();

  const [isCreating, setIsCreating] = useState<boolean>(
    createMode || searchParams.get('create') === 'true'
  );
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<HrDocument | null>(null);
  const [previewTypeDef, setPreviewTypeDef] = useState<DocumentTypeDefinition | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreating(true);
    }
  }, [searchParams]);

  const handleStartCreate = () => {
    setIsCreating(true);
    setSelectedDocForPreview(null);
    setSearchParams({ create: 'true' });
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setSelectedDocForPreview(null);
    setSearchParams({});
  };

  const handleViewDocument = async (doc: HrDocument) => {
    try {
      const typeDef = await DocumentEngineService.getDocumentTypeByCode(doc.documentTypeCode);
      if (typeDef) {
        setPreviewTypeDef(typeDef);
        setSelectedDocForPreview(doc);
        setIsCreating(false);
      }
    } catch {
      error(`Could not load specifications for ${doc.documentTypeCode}`);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      {isCreating ? (
        <DocumentCreationWizard
          onCancel={handleCancelCreate}
          onSuccess={(doc) => {
            // Document created
          }}
        />
      ) : selectedDocForPreview && previewTypeDef ? (
        <>
          <DocumentPreview
            document={selectedDocForPreview}
            typeDef={previewTypeDef}
            onSendClick={() => setIsSendModalOpen(true)}
            onBackToList={() => setSelectedDocForPreview(null)}
          />

          <DocumentSendModal
            document={selectedDocForPreview}
            typeDef={previewTypeDef}
            isOpen={isSendModalOpen}
            onClose={() => setIsSendModalOpen(false)}
            onSent={() => {
              setSelectedDocForPreview({
                ...selectedDocForPreview,
                currentStatus: 'ISSUED',
              });
            }}
          />
        </>
      ) : (
        <DocumentList
          onCreateClick={handleStartCreate}
          onViewDocument={handleViewDocument}
        />
      )}
    </div>
  );
};
