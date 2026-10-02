// =============================================================================
// EMPLOYEE PROFILE PAGE
// =============================================================================
// Displays personal & employment info, generated documents table, uploaded documents,
// version history modal, and quick document generation trigger.
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  RefreshCw,
  History,
  CheckCircle2,
  Clock,
  Upload,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Shield,
  Layers,
  Sparkles,
  AlertCircle,
  FileCheck,
  X,
} from 'lucide-react';
import { Employee, EmployeeDocument, EmployeeService } from '../services/employeeService.js';
import { GenerateDocumentModal } from '../components/employees/GenerateDocumentModal.js';
import { RegenerateDocumentModal } from '../components/employees/RegenerateDocumentModal.js';

export const EmployeeProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'DOCUMENTS' | 'DETAILS' | 'UPLOADED'>('DOCUMENTS');

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [documentToRegenerate, setDocumentToRegenerate] = useState<EmployeeDocument | null>(null);
  const [documentToPreview, setDocumentToPreview] = useState<EmployeeDocument | null>(null);
  const [documentVersionsModal, setDocumentVersionsModal] = useState<EmployeeDocument | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([
    {
      id: 'upl_sample_1',
      title: 'Academic Degree & Transcripts',
      category: 'EDUCATION',
      fileName: 'degree_certificate.pdf',
      uploadedAt: '2026-09-15',
      sizeBytes: 1024 * 450,
    },
    {
      id: 'upl_sample_2',
      title: 'National Identity Proof (PAN / SSN)',
      category: 'IDENTITY',
      fileName: 'identity_proof.pdf',
      uploadedAt: '2026-09-15',
      sizeBytes: 1024 * 280,
    },
  ]);

  useEffect(() => {
    if (id) {
      loadProfile(id);
    }
  }, [id]);

  const loadProfile = async (empId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await EmployeeService.getEmployeeById(empId);
      setEmployee(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (docId: string, format: 'PDF' | 'DOCX', title: string, version?: number) => {
    try {
      await EmployeeService.downloadDocumentFile(docId, format, title, version);
    } catch (err: any) {
      alert(`Download failed: ${err.message}`);
    }
  };

  const handleStatusAdvance = async (docId: string, newStatus: 'APPROVED' | 'ISSUED') => {
    try {
      await EmployeeService.updateDocumentStatus(docId, newStatus);
      if (id) loadProfile(id);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !id) return;
    setUploading(true);

    try {
      const newUpload = {
        id: `upl_${Date.now()}`,
        title: uploadFile.name.replace(/\.[^/.]+$/, ''),
        category: 'EMPLOYEE_RECORD',
        fileName: uploadFile.name,
        uploadedAt: new Date().toISOString().split('T')[0],
        sizeBytes: uploadFile.size,
      };

      setUploadedFiles([newUpload, ...uploadedFiles]);
      setUploadFile(null);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '60px auto', textAlign: 'center', color: '#64748b' }}>
        Loading employee profile...
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', padding: 24, textAlign: 'center' }}>
        <AlertCircle size={40} style={{ color: '#ef4444', margin: '0 auto 12px auto' }} />
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Employee Not Found</div>
        <div style={{ color: '#64748b', marginTop: 4 }}>{error || 'Unable to retrieve employee.'}</div>
        <button
          onClick={() => navigate('/employees')}
          style={{
            marginTop: 18,
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const documents = employee.documents || [];

  const getDocStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; border: string }> = {
      DRAFT: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
      PENDING_REVIEW: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
      APPROVED: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
      ISSUED: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    };
    const s = map[status] || map.DRAFT;
    return (
      <span
        style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          backgroundColor: s.bg,
          color: s.text,
          border: `1px solid ${s.border}`,
          padding: '2px 8px',
          borderRadius: 12,
        }}
      >
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
      {/* Back Link */}
      <button
        onClick={() => navigate('/employees')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: '#64748b',
          fontSize: '0.8125rem',
          cursor: 'pointer',
          padding: '0 0 16px 0',
          fontWeight: 600,
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Employees</span>
      </button>

      {/* Profile Header Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: '24px 28px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 800,
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
            }}
          >
            {employee.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {employee.fullName}
              </h1>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  padding: '2px 8px',
                  borderRadius: 12,
                  border: '1px solid #bfdbfe',
                }}
              >
                {employee.employeeId}
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#475569', marginTop: 4, fontWeight: 500 }}>
              {employee.designation} • <strong style={{ color: '#0f172a' }}>{employee.department}</strong> ({employee.employmentType})
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
              Joining Date: <strong>{new Date(employee.joiningDate).toLocaleDateString()}</strong> • Location: <strong>{employee.workLocation || 'Corporate HQ'}</strong>
            </div>
          </div>
        </div>

        {/* Primary Action: Generate Document */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '11px 22px',
              fontSize: '0.875rem',
              fontWeight: 700,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
            }}
          >
            <FileText size={17} />
            <span>Generate Document</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          style={{
            padding: '10px 18px',
            fontSize: '0.85rem',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'DOCUMENTS' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'DOCUMENTS' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
          }}
        >
          Generated Documents ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('DETAILS')}
          style={{
            padding: '10px 18px',
            fontSize: '0.85rem',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'DETAILS' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'DETAILS' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
          }}
        >
          Profile Details
        </button>
        <button
          onClick={() => setActiveTab('UPLOADED')}
          style={{
            padding: '10px 18px',
            fontSize: '0.85rem',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'UPLOADED' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'UPLOADED' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
          }}
        >
          Uploaded Documents ({uploadedFiles.length})
        </button>
      </div>

      {/* TAB 1: GENERATED DOCUMENTS */}
      {activeTab === 'DOCUMENTS' && (
        <div>
          {documents.length === 0 ? (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px dashed #cbd5e1',
                borderRadius: 12,
                padding: '50px 20px',
                textAlign: 'center',
              }}
            >
              <FileText size={44} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                No Documents Generated Yet
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 4, maxWidth: 420, margin: '4px auto 0 auto' }}>
                Select from Offer Letter, Increment Letter, Relieving Certificate, or Payslip. All employee details will be auto-filled.
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(true)}
                style={{
                  marginTop: 16,
                  padding: '9px 18px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Generate First Document
              </button>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '12px 18px' }}>Document Title & Category</th>
                    <th style={{ padding: '12px 18px' }}>Version</th>
                    <th style={{ padding: '12px 18px' }}>Status</th>
                    <th style={{ padding: '12px 18px' }}>Generated Date</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Title & Category */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{doc.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, marginTop: 2 }}>
                          {doc.documentTypeCode.replace(/_/g, ' ')}
                        </div>
                      </td>

                      {/* Current Version */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          onClick={() => setDocumentVersionsModal(doc)}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            borderRadius: 12,
                            border: '1px solid #bfdbfe',
                            cursor: 'pointer',
                          }}
                          title="Click to view all version records"
                        >
                          v{doc.currentVersion} ({doc.versions?.length || 1} revs)
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>{getDocStatusBadge(doc.status)}</td>

                      {/* Created At */}
                      <td style={{ padding: '14px 18px', color: '#64748b' }}>
                        {new Date(doc.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button
                            onClick={() => setDocumentToPreview(doc)}
                            style={{
                              padding: '5px 9px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#ffffff',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              borderRadius: 6,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title="Preview rendered document"
                          >
                            <Eye size={13} />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={() => handleDownload(doc.id, 'PDF', doc.title)}
                            style={{
                              padding: '5px 9px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#ffffff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              borderRadius: 6,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title="Download final PDF"
                          >
                            <Download size={13} />
                            <span>PDF</span>
                          </button>

                          <button
                            onClick={() => handleDownload(doc.id, 'DOCX', doc.title)}
                            style={{
                              padding: '5px 9px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#ffffff',
                              color: '#1e40af',
                              border: '1px solid #bfdbfe',
                              borderRadius: 6,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title="Download editable DOCX"
                          >
                            <Download size={13} />
                            <span>DOCX</span>
                          </button>

                          <button
                            onClick={() => setDocumentToRegenerate(doc)}
                            style={{
                              padding: '5px 9px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#f8fafc',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                              borderRadius: 6,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            title="Regenerate creating a new version"
                          >
                            <RefreshCw size={12} />
                            <span>Regenerate</span>
                          </button>

                          {doc.status === 'DRAFT' && (
                            <button
                              onClick={() => handleStatusAdvance(doc.id, 'APPROVED')}
                              style={{
                                padding: '5px 9px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: '#f0fdf4',
                                color: '#16a34a',
                                border: '1px solid #bbf7d0',
                                borderRadius: 6,
                                cursor: 'pointer',
                              }}
                            >
                              Approve
                            </button>
                          )}

                          {doc.status === 'APPROVED' && (
                            <button
                              onClick={() => handleStatusAdvance(doc.id, 'ISSUED')}
                              style={{
                                padding: '5px 9px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: '#f0fdf4',
                                color: '#15803d',
                                border: '1px solid #86efac',
                                borderRadius: 6,
                                cursor: 'pointer',
                              }}
                            >
                              Issue
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROFILE DETAILS */}
      {activeTab === 'DETAILS' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
            Personal & Employment Master Record
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Full Legal Name</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{employee.fullName}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Employee ID</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2563eb', marginTop: 2 }}>{employee.employeeId}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Designation</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{employee.designation}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Department</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{employee.department}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Employment Type</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{employee.employmentType}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date of Joining</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                {new Date(employee.joiningDate).toLocaleDateString()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Reporting Manager</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                {employee.reportingManager || 'Not specified'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Work Location</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                {employee.workLocation || 'Corporate HQ'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Annual Compensation (CTC)</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#16a34a', marginTop: 2 }}>
                ${employee.annualCtc?.toLocaleString() || 'N/A'} {employee.currency}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Personal Email</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{employee.personalEmail}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Official Email</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                {employee.officialEmail || 'Pending creation'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Phone Number</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{employee.phone || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UPLOADED EMPLOYEE DOCUMENTS */}
      {activeTab === 'UPLOADED' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Upload Drop Form */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px dashed #cbd5e1',
              borderRadius: 12,
              padding: 20,
            }}
          >
            <form onSubmit={handleFileUpload} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                style={{ fontSize: '0.8125rem' }}
              />
              <button
                type="submit"
                disabled={!uploadFile || uploading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  opacity: !uploadFile || uploading ? 0.6 : 1,
                }}
              >
                <Upload size={14} />
                <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
              </button>
            </form>
          </div>

          {/* Uploaded Documents List */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '12px 18px' }}>Document Name</th>
                  <th style={{ padding: '12px 18px' }}>File</th>
                  <th style={{ padding: '12px 18px' }}>Upload Date</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {uploadedFiles.map((f) => (
                  <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>{f.title}</td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>{f.fileName}</td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>{f.uploadedAt}</td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => alert(`Opening sample file: ${f.fileName}`)}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: 5,
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {documentToPreview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1100,
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
              maxWidth: 860,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
              }}
            >
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {documentToPreview.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Version v{documentToPreview.currentVersion} • {documentToPreview.documentTypeCode}
                </div>
              </div>
              <button
                onClick={() => setDocumentToPreview(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 30px' }}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '24px',
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: '#1e293b',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {documentToPreview.renderedContent}
              </div>
            </div>

            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
              }}
            >
              <button
                onClick={() => handleDownload(documentToPreview.id, 'DOCX', documentToPreview.title)}
                style={{
                  padding: '8px 14px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  color: '#1e40af',
                  border: '1px solid #bfdbfe',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Download size={14} />
                <span>Download DOCX</span>
              </button>
              <button
                onClick={() => handleDownload(documentToPreview.id, 'PDF', documentToPreview.title)}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERSION HISTORY MODAL */}
      {documentVersionsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1100,
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
              maxWidth: 720,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <History size={18} style={{ color: '#2563eb' }} />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    Document Version History
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {documentVersionsModal.title}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDocumentVersionsModal(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {documentVersionsModal.versions?.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            padding: '2px 8px',
                            borderRadius: 12,
                          }}
                        >
                          Version {v.versionNumber}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {new Date(v.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#334155', marginTop: 6 }}>
                        Reason: <strong>{v.changeNotes || 'Initial creation'}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleDownload(documentVersionsModal.id, 'PDF', documentVersionsModal.title, v.versionNumber)}
                        style={{
                          padding: '5px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => handleDownload(documentVersionsModal.id, 'DOCX', documentVersionsModal.title, v.versionNumber)}
                        style={{
                          padding: '5px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        DOCX
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Document Modal */}
      {isGenerateModalOpen && employee && (
        <GenerateDocumentModal
          employee={employee}
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          onDocumentGenerated={() => loadProfile(employee.id)}
        />
      )}

      {/* Regenerate Document Modal */}
      {documentToRegenerate && (
        <RegenerateDocumentModal
          document={documentToRegenerate}
          isOpen={Boolean(documentToRegenerate)}
          onClose={() => setDocumentToRegenerate(null)}
          onDocumentRegenerated={() => loadProfile(employee.id)}
        />
      )}
    </div>
  );
};
