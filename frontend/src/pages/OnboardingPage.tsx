import React, { useState, useEffect } from 'react';
import {
  Users2,
  Plus,
  Sliders,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  Calendar,
  X,
  UserCheck,
} from 'lucide-react';
import {
  OnboardingCandidateRecord,
  OnboardingFormConfig,
  OnboardingStatus,
} from '../../../shared/types/onboarding-engine.js';
import { onboardingService } from '../services/onboardingService.js';
import { Button } from '../components/common/Button.js';
import { OnboardingFormWizard } from '../components/onboarding/OnboardingFormWizard.js';
import { JoiningChecklistWidget } from '../components/onboarding/JoiningChecklistWidget.js';
import { OnboardingConfigModal } from '../components/onboarding/OnboardingConfigModal.js';
import { useToast } from '../context/ToastContext.js';

export const OnboardingPage: React.FC = () => {
  const { success, error } = useToast();
  const [candidates, setCandidates] = useState<OnboardingCandidateRecord[]>([]);
  const [config, setConfig] = useState<OnboardingFormConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCandidate, setSelectedCandidate] = useState<OnboardingCandidateRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'checklist' | 'review'>('form');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState<boolean>(false);

  // New Candidate Initiation State
  const [initiateForm, setInitiateForm] = useState({
    candidateName: '',
    email: '',
    phone: '',
    designation: '',
    department: 'Engineering',
    joiningDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [candidatesList, formConfig] = await Promise.all([
        onboardingService.listCandidates(),
        onboardingService.getFormConfig(),
      ]);
      setCandidates(candidatesList);
      setConfig(formConfig);
      if (candidatesList.length > 0 && !selectedCandidate) {
        setSelectedCandidate(candidatesList[0]);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load onboarding records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await onboardingService.initiateOnboarding(initiateForm);
      success(`Initiated onboarding for ${created.candidateName}!`);
      setIsInitiateModalOpen(false);
      setInitiateForm({
        candidateName: '',
        email: '',
        phone: '',
        designation: '',
        department: 'Engineering',
        joiningDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      });
      await loadData();
      setSelectedCandidate(created);
    } catch (err: any) {
      error(err.message || 'Failed to initiate onboarding');
    }
  };

  const handleReviewDecision = async (
    decision: 'VERIFY' | 'REQUEST_CHANGES' | 'COMPLETE',
    notes: string
  ) => {
    if (!selectedCandidate) return;
    try {
      const updated = await onboardingService.reviewCandidate(selectedCandidate.id, decision, notes);
      success(`Updated candidate status to ${updated.status}`);
      setSelectedCandidate(updated);
      setCandidates(candidates.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err: any) {
      error(err.message || 'Failed to update review status');
    }
  };

  const handleVerifyDocument = async (docId: string, decision: 'VERIFIED' | 'REJECTED') => {
    if (!selectedCandidate) return;
    try {
      const updated = await onboardingService.verifyDocument(selectedCandidate.id, docId, decision);
      success(`Document marked as ${decision}`);
      setSelectedCandidate(updated);
      setCandidates(candidates.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err: any) {
      error(err.message || 'Failed to verify document');
    }
  };

  const filteredCandidates = candidates.filter((cand) => {
    const matchesStatus = statusFilter === 'ALL' || cand.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      cand.candidateName.toLowerCase().includes(q) ||
      cand.email.toLowerCase().includes(q) ||
      cand.designation.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadgeStyle = (status: OnboardingStatus) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
      case 'VERIFIED':
      case 'READY_FOR_JOINING':
        return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
      case 'UNDER_HR_REVIEW':
      case 'SUBMITTED':
        return { bg: '#fefce8', color: '#ca8a04', border: '#fef08a' };
      case 'CHANGES_REQUESTED':
        return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
      case 'IN_PROGRESS':
        return { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
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
              <Users2 size={20} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Employee Onboarding & Lifecycle
            </h1>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
            Configurable candidate registration, identity verification, and multi-department Day-1 checklist.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="secondary"
            onClick={() => setIsConfigModalOpen(true)}
            icon={<Sliders size={15} />}
            style={{ fontSize: '0.8125rem' }}
          >
            Configure Form Schema
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsInitiateModalOpen(true)}
            icon={<Plus size={15} />}
            style={{ fontSize: '0.8125rem' }}
          >
            Initiate Onboarding
          </Button>
        </div>
      </div>

      {/* 2. Top Metrics Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {[
          {
            label: 'Total Pipeline',
            count: candidates.length,
            color: '#2563eb',
            bg: '#eff6ff',
            icon: <Users2 size={18} />,
          },
          {
            label: 'Under HR Review',
            count: candidates.filter((c) => c.status === 'UNDER_HR_REVIEW' || c.status === 'SUBMITTED').length,
            color: '#ca8a04',
            bg: '#fefce8',
            icon: <Clock size={18} />,
          },
          {
            label: 'Ready for Joining',
            count: candidates.filter((c) => c.status === 'VERIFIED' || c.status === 'READY_FOR_JOINING').length,
            color: '#059669',
            bg: '#ecfdf5',
            icon: <CheckCircle2 size={18} />,
          },
          {
            label: 'Completed & Active',
            count: candidates.filter((c) => c.status === 'COMPLETED').length,
            color: '#7c3aed',
            bg: '#f5f3ff',
            icon: <UserCheck size={18} />,
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              padding: '18px 20px',
              borderRadius: 14,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{card.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                {card.count}
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: card.bg,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Workspace: Candidate List & Detailed Inspection Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Candidate List with Search & Status Filter */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Search & Filter Header */}
          <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 34, fontSize: '0.8125rem' }}
              />
              <Search
                size={14}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
            </div>

            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '0.78125rem', padding: '6px 10px' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="INVITED">Invited</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_HR_REVIEW">Under HR Review</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="VERIFIED">Verified</option>
              <option value="READY_FOR_JOINING">Ready for Joining</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Candidate List Items */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredCandidates.map((cand) => {
              const isSelected = selectedCandidate?.id === cand.id;
              const badgeStyle = getStatusBadgeStyle(cand.status);
              const completedTasks = (cand.checklist || []).filter((c) => c.isCompleted).length;

              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidate(cand)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                        {cand.candidateName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {cand.designation} • {cand.department}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 9999,
                        background: badgeStyle.bg,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`,
                      }}
                    >
                      {cand.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} />
                      Joining: {cand.joiningDate}
                    </span>

                    <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>
                      Checklist: {completedTasks}/{cand.checklist?.length || 7}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      marginTop: 8,
                      width: '100%',
                      height: 4,
                      background: '#f1f5f9',
                      borderRadius: 9999,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${cand.progressPercent}%`,
                        height: '100%',
                        background: '#2563eb',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Candidate Inspector */}
        {selectedCandidate && config ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Candidate Header Summary Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                    {selectedCandidate.candidateName}
                  </h2>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 9999,
                      ...getStatusBadgeStyle(selectedCandidate.status),
                    }}
                  >
                    {selectedCandidate.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 3 }}>
                  {selectedCandidate.designation} • {selectedCandidate.department} • Joining: {selectedCandidate.joiningDate}
                </div>
              </div>

              {/* Sub-tabs inside Inspector */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { id: 'form', label: 'Onboarding Form', icon: <FileCheck2 size={14} /> },
                  { id: 'checklist', label: 'Joining Checklist', icon: <CheckCircle2 size={14} /> },
                  { id: 'review', label: 'HR Verification', icon: <AlertCircle size={14} /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 12px',
                      borderRadius: 8,
                      border: '1px solid',
                      borderColor: activeTab === tab.id ? '#2563eb' : '#e2e8f0',
                      background: activeTab === tab.id ? '#eff6ff' : '#ffffff',
                      color: activeTab === tab.id ? '#2563eb' : '#475569',
                      fontWeight: activeTab === tab.id ? 700 : 600,
                      fontSize: '0.78125rem',
                      cursor: 'pointer',
                    }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: FORM WIZARD */}
            {activeTab === 'form' && (
              <OnboardingFormWizard
                key={selectedCandidate.id}
                candidateId={selectedCandidate.id}
                config={config}
                initialData={selectedCandidate.submittedData}
                onSaved={(updated) => {
                  setSelectedCandidate({
                    ...selectedCandidate,
                    submittedData: updated,
                    status: selectedCandidate.status === 'INVITED' ? 'IN_PROGRESS' : selectedCandidate.status,
                  });
                }}
                onSubmitted={(submitted) => {
                  setSelectedCandidate({
                    ...selectedCandidate,
                    submittedData: submitted,
                    status: 'SUBMITTED',
                    progressPercent: 100,
                  });
                }}
              />
            )}

            {/* TAB 2: JOINING CHECKLIST */}
            {activeTab === 'checklist' && (
              <JoiningChecklistWidget
                candidateId={selectedCandidate.id}
                checklist={selectedCandidate.checklist || []}
                onChecklistUpdated={(updatedChecklist) => {
                  setSelectedCandidate({
                    ...selectedCandidate,
                    checklist: updatedChecklist,
                  });
                }}
              />
            )}

            {/* TAB 3: HR VERIFICATION & REVIEWS */}
            {activeTab === 'review' && (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    Document Verification & Audit Review
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    Review submitted proofs of identity, graduation degrees, and background checks.
                  </p>
                </div>

                {/* Uploaded Documents List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(selectedCandidate.submittedData?.documents || []).length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                      No documents uploaded yet by the candidate.
                    </div>
                  ) : (
                    (selectedCandidate.submittedData?.documents || []).map((doc) => (
                      <div
                        key={doc.id}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 10,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                            {doc.documentCode.replace(/_/g, ' ')}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                            File: {doc.fileName} • {Math.round(doc.fileSize / 1024)} KB
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 9999,
                              background: doc.status === 'VERIFIED' ? '#dcfce7' : '#fef9c3',
                              color: doc.status === 'VERIFIED' ? '#15803d' : '#854d0e',
                            }}
                          >
                            {doc.status}
                          </span>

                          <Button
                            variant="secondary"
                            onClick={() => handleVerifyDocument(doc.id, 'VERIFIED')}
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleVerifyDocument(doc.id, 'REJECTED')}
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Final Decision Action Box */}
                <div
                  style={{
                    padding: 18,
                    borderRadius: 12,
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                      Change Candidate Lifecycle Status
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Advance candidate to Verified or trigger Final Employee Activation.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      variant="danger"
                      onClick={() => handleReviewDecision('REQUEST_CHANGES', 'Please update submitted documents')}
                      style={{ fontSize: '0.78125rem' }}
                    >
                      Request Changes
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleReviewDecision('VERIFY', 'All background checks and documents verified')}
                      style={{ fontSize: '0.78125rem' }}
                    >
                      Verify Details
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleReviewDecision('COMPLETE', 'Employee onboarded and active in HRMS')}
                      style={{ fontSize: '0.78125rem', background: '#059669', borderColor: '#059669' }}
                    >
                      Complete Onboarding
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            Select a candidate to inspect their onboarding progress
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {config && (
        <OnboardingConfigModal
          config={config}
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onConfigSaved={(updatedConfig) => setConfig(updatedConfig)}
        />
      )}

      {/* Initiate Onboarding Modal */}
      {isInitiateModalOpen && (
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
              maxWidth: '520px',
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              padding: 28,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Initiate New Candidate Onboarding</h3>
              <button
                onClick={() => setIsInitiateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleInitiate}>
              <div className="form-group">
                <label className="form-label">Candidate Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={initiateForm.candidateName}
                  onChange={(e) => setInitiateForm({ ...initiateForm, candidateName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={initiateForm.email}
                  onChange={(e) => setInitiateForm({ ...initiateForm, email: e.target.value })}
                  placeholder="rahul@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation / Role *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={initiateForm.designation}
                  onChange={(e) => setInitiateForm({ ...initiateForm, designation: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={initiateForm.department}
                  onChange={(e) => setInitiateForm({ ...initiateForm, department: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Joining Date *</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={initiateForm.joiningDate}
                  onChange={(e) => setInitiateForm({ ...initiateForm, joiningDate: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <Button variant="ghost" onClick={() => setIsInitiateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Send Onboarding Invite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
