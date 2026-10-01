import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  AlertCircle,
  Eye,
  Check,
  Send,
  Users2,
  History,
  X,
  Layers,
} from 'lucide-react';
import {
  HrPolicy,
  PolicyTypeCode,
  PolicySection,
  PolicyStatus,
} from '../../../shared/types/policy-engine.js';
import { policyService, PolicyTypeDefinition } from '../services/policyService.js';
import { Button } from '../components/common/Button.js';
import { Modal } from '../components/common/Modal.js';
import { useToast } from '../context/ToastContext.js';
import { useAuth } from '../context/AuthContext.js';

export const PoliciesPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const [policies, setPolicies] = useState<HrPolicy[]>([]);
  const [policyTypes, setPolicyTypes] = useState<PolicyTypeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal & Drawer State
  const [selectedPolicy, setSelectedPolicy] = useState<HrPolicy | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Policy Form State
  const [newPolicyType, setNewPolicyType] = useState<PolicyTypeCode>('LEAVE_POLICY');
  const [newPolicyTitle, setNewPolicyTitle] = useState('Annual Leave & Vacation Policy 2026');
  const [newPolicyDept, setNewPolicyDept] = useState('Human Resources');
  const [newPolicyOwner, setNewPolicyOwner] = useState('Sakshi Koparde (VP People)');
  const [newPolicyApplicability, setNewPolicyApplicability] = useState('ALL_EMPLOYEES');

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedPolicies, fetchedTypes] = await Promise.all([
        policyService.listPolicies(),
        policyService.getPolicyTypes(),
      ]);
      setPolicies(fetchedPolicies);
      setPolicyTypes(fetchedTypes);
    } catch (err: any) {
      error(err.message || 'Failed to load corporate policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const typeDef = policyTypes.find((t) => t.code === newPolicyType);
      const initialSections: PolicySection[] = (typeDef?.defaultSections || []).map((s, idx) => ({
        id: `sec_${idx + 1}`,
        sectionNumber: s.sectionNumber,
        title: s.title,
        content: s.content,
        orderIndex: s.orderIndex,
        isMandatory: s.isMandatory,
      }));

      const created = await policyService.createPolicy({
        policyTypeCode: newPolicyType,
        title: newPolicyTitle,
        department: newPolicyDept,
        policyOwner: newPolicyOwner,
        applicability: newPolicyApplicability,
        effectiveDate: new Date().toISOString().split('T')[0],
        initialSections,
      });

      success(`Created corporate policy: ${created.title} (${created.policyNumber})`);
      setIsCreateModalOpen(false);
      await loadData();
      setSelectedPolicy(created);
    } catch (err: any) {
      error(err.message || 'Failed to create policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishPolicy = async (policy: HrPolicy) => {
    try {
      const updated = await policyService.publishPolicy(policy.id, 'Formal executive ratification');
      success(`Policy ${updated.policyNumber} is now published and active!`);
      setSelectedPolicy(updated);
      await loadData();
    } catch (err: any) {
      error(err.message || 'Failed to publish policy');
    }
  };

  const handleAcknowledge = async (policy: HrPolicy) => {
    try {
      await policyService.recordAcknowledgment(policy.id);
      success(`You have formally acknowledged ${policy.title} (${policy.currentVersionNumber})`);
      await loadData();
    } catch (err: any) {
      error(err.message || 'Failed to acknowledge policy');
    }
  };

  const filteredPolicies = policies.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase());
    const typeDef = policyTypes.find((t) => t.code === p.policyTypeCode);
    const matchesCategory =
      selectedCategory === 'ALL' || (typeDef && typeDef.category === selectedCategory);
    const matchesStatus =
      selectedStatus === 'ALL' || p.currentStatus === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* 1. Executive Master Header */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 16,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <BookOpen size={22} style={{ color: '#059669' }} />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Governance Policies Engine
            </h1>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 9999,
                background: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0',
              }}
            >
              19 Core Organizational Policies
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Structured workplace regulations, mandatory disclosures, approval workflows, version control, and employee acknowledgments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
            style={{ padding: '9px 18px', fontSize: '0.85rem' }}
          >
            Create New Policy
          </Button>
        </div>
      </div>

      {/* 2. Top Metrics Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div
          className="glass-panel"
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
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>TOTAL POLICIES</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              {policies.length}
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={18} />
          </div>
        </div>

        <div
          className="glass-panel"
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
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>PUBLISHED & ACTIVE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: 4 }}>
              {policies.filter((p) => p.currentStatus === 'PUBLISHED').length}
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div
          className="glass-panel"
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
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>UNDER REVIEW</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706', marginTop: 4 }}>
              {policies.filter((p) => p.currentStatus === 'IN_REVIEW' || p.currentStatus === 'DRAFT').length}
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={18} />
          </div>
        </div>

        <div
          className="glass-panel"
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
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>TOTAL ACKNOWLEDGMENTS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>
              {policies.reduce((sum, p) => sum + (p.acknowledgments?.length || 0), 0)}
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users2 size={18} />
          </div>
        </div>
      </div>

      {/* 3. Search and Category Filter Strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by title, policy number, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 36, fontSize: '0.85rem' }}
            />
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ fontSize: '0.8125rem', padding: '7px 12px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="APPROVED">Approved</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* 4. Policy Cards Grid */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading corporate governance policies...</p>
        </div>
      ) : filteredPolicies.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: 48,
            textAlign: 'center',
            borderRadius: 16,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          <BookOpen size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            No Corporate Policies Found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: 420, margin: '0 auto 16px' }}>
            {searchQuery
              ? 'No policies matched your current search filters.'
              : 'Create your first governance policy to establish standard operational guidelines.'}
          </p>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsCreateModalOpen(true)}>
            Create New Policy
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
          {filteredPolicies.map((policy) => {
            const isPublished = policy.currentStatus === 'PUBLISHED';
            const isApproved = policy.currentStatus === 'APPROVED';

            return (
              <div
                key={policy.id}
                className="glass-panel"
                style={{
                  padding: '20px 22px',
                  borderRadius: 16,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#2563eb',
                        background: '#eff6ff',
                        padding: '2px 8px',
                        borderRadius: 4,
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      {policy.policyNumber}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 9999,
                          background: isPublished ? '#ecfdf5' : isApproved ? '#eff6ff' : '#fffbeb',
                          color: isPublished ? '#059669' : isApproved ? '#2563eb' : '#d97706',
                          border: isPublished
                            ? '1px solid #a7f3d0'
                            : isApproved
                            ? '1px solid #bfdbfe'
                            : '1px solid #fde68a',
                        }}
                      >
                        {policy.currentStatus}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          color: '#64748b',
                          background: '#f1f5f9',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {policy.currentVersionNumber}
                      </span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 6, lineHeight: 1.4 }}>
                    {policy.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: '#64748b',
                      lineHeight: 1.5,
                      marginBottom: 12,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {policy.description || 'Organizational governance guidelines, scope of applicability, and compliance standards.'}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: '0.75rem', color: '#64748b' }}>
                    <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                      Dept: <strong>{policy.department}</strong>
                    </span>
                    <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                      Scope: <strong>{policy.applicability.replace(/_/g, ' ')}</strong>
                    </span>
                    <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                      Sections: <strong>{policy.sections.length}</strong>
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 14,
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {(policy.acknowledgments || []).length} Acknowledged
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      variant="secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      icon={<Eye size={13} />}
                      onClick={() => setSelectedPolicy(policy)}
                    >
                      Inspect Sections
                    </Button>

                    {isPublished ? (
                      <Button
                        variant="success"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        icon={<Check size={13} />}
                        onClick={() => handleAcknowledge(policy)}
                      >
                        Acknowledge
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        icon={<Send size={13} />}
                        onClick={() => handlePublishPolicy(policy)}
                      >
                        Publish v1.0
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Inspection & Reading Modal */}
      {selectedPolicy && (
        <Modal
          isOpen={!!selectedPolicy}
          onClose={() => setSelectedPolicy(null)}
          title={selectedPolicy.title}
          subtitle={`${selectedPolicy.policyNumber} • Version ${selectedPolicy.currentVersionNumber} • ${selectedPolicy.department}`}
          maxWidth="840px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Effective Date: {selectedPolicy.effectiveDate || '2026-10-01'}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" onClick={() => setSelectedPolicy(null)}>
                  Close
                </Button>
                {selectedPolicy.currentStatus === 'PUBLISHED' ? (
                  <Button
                    variant="success"
                    icon={<Check size={16} />}
                    onClick={() => {
                      handleAcknowledge(selectedPolicy);
                      setSelectedPolicy(null);
                    }}
                  >
                    Confirm Employee Acknowledgment
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    icon={<Send size={16} />}
                    onClick={() => {
                      handlePublishPolicy(selectedPolicy);
                      setSelectedPolicy(null);
                    }}
                  >
                    Publish Policy
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Metadata Bar */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 12,
                fontSize: '0.8125rem',
              }}
            >
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>POLICY OWNER</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedPolicy.policyOwner}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>APPLICABILITY</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedPolicy.applicability.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>STATUS</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>{selectedPolicy.currentStatus}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.7rem' }}>ACKNOWLEDGMENTS</span>
                <span style={{ fontWeight: 600, color: '#2563eb' }}>{(selectedPolicy.acknowledgments || []).length} Employees</span>
              </div>
            </div>

            {/* Sections Accordion */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Policy Sections ({selectedPolicy.sections.length})
              </h4>

              {selectedPolicy.sections.map((sec) => (
                <div
                  key={sec.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 12,
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#2563eb',
                        background: '#eff6ff',
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {sec.sectionNumber}
                    </span>
                    <h5 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {sec.title}
                    </h5>
                  </div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                      color: '#334155',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {sec.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Policy Creation Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
          title="Create New Corporate Policy"
          subtitle="Select from 19 standard corporate policy definitions or author a custom regulation."
          maxWidth="640px"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="primary" isLoading={isSubmitting} onClick={handleCreatePolicy}>
                Instantiate Policy
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreatePolicy} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">
                Policy Definition Type: <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={newPolicyType}
                onChange={(e) => {
                  const typeCode = e.target.value as PolicyTypeCode;
                  setNewPolicyType(typeCode);
                  const typeDef = policyTypes.find((t) => t.code === typeCode);
                  if (typeDef) {
                    setNewPolicyTitle(typeDef.name);
                  }
                }}
              >
                {policyTypes.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Policy Title: <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={newPolicyTitle}
                onChange={(e) => setNewPolicyTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Department / Governance Domain:</label>
                <input
                  type="text"
                  className="form-input"
                  value={newPolicyDept}
                  onChange={(e) => setNewPolicyDept(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Policy Owner (Executive Signatory):</label>
                <input
                  type="text"
                  className="form-input"
                  value={newPolicyOwner}
                  onChange={(e) => setNewPolicyOwner(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Employee Applicability Scope:</label>
              <select
                className="form-select"
                value={newPolicyApplicability}
                onChange={(e) => setNewPolicyApplicability(e.target.value)}
              >
                <option value="ALL_EMPLOYEES">All Company Employees</option>
                <option value="FULL_TIME_ONLY">Full-Time Personnel Only</option>
                <option value="REMOTE_WORKERS">Remote & Hybrid Workers Only</option>
                <option value="MANAGEMENT_ONLY">Supervisory / Management Only</option>
                <option value="CONTRACTORS_VENDORS">Contractors & Vendors</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
