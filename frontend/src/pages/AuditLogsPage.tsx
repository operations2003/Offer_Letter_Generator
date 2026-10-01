import React, { useState, useEffect } from 'react';
import { ShieldCheck, History, Search, Filter, Eye, Cpu, User } from 'lucide-react';
import { Modal } from '../components/common/Modal.js';
import { Button } from '../components/common/Button.js';

interface AuditItem {
  id: string;
  actorType: 'USER' | 'AI_WORKER' | 'SYSTEM';
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  actionDescription: string;
  previousState?: any;
  newState?: any;
  timestamp: string;
}

const MOCK_AUDIT_LOGS: AuditItem[] = [
  {
    id: 'aud_001',
    actorType: 'USER',
    actorName: 'Sarah Jenkins (HR Manager)',
    action: 'UPDATE',
    entityType: 'Offer',
    entityId: 'off_001',
    actionDescription: 'HR confirmed terms: Overrode base salary from $145,000 to $155,000',
    previousState: { baseSalary: 145000, totalCtc: 219000, source: 'AI_SUGGESTED' },
    newState: { baseSalary: 155000, totalCtc: 229000, source: 'HR_CONFIRMED' },
    timestamp: '2026-09-26T10:45:12Z',
  },
  {
    id: 'aud_002',
    actorType: 'AI_WORKER',
    actorName: 'AI Extraction Engine (Llama 3.3)',
    action: 'CREATE',
    entityType: 'AiExtractedData',
    entityId: 'ext_092',
    actionDescription: 'Extracted candidate details from resume (Confidence: 94%, Latency: 142ms)',
    newState: { candidate: 'Jane Doe', role: 'Lead Platform Architect', confidenceScore: 0.94 },
    timestamp: '2026-09-26T10:42:01Z',
  },
  {
    id: 'aud_003',
    actorType: 'USER',
    actorName: 'Alex Vance (Super Admin)',
    action: 'CREATE',
    entityType: 'User',
    entityId: 'usr_rec_003',
    actionDescription: 'Created user David Kim with role RECRUITER',
    newState: { email: 'recruiter@acme.com', roles: ['RECRUITER'] },
    timestamp: '2026-09-25T16:10:00Z',
  },
  {
    id: 'aud_004',
    actorType: 'USER',
    actorName: 'Sarah Jenkins (HR Manager)',
    action: 'APPROVE',
    entityType: 'Offer',
    entityId: 'off_004',
    actionDescription: 'Approved offer terms for Liam O’Connor',
    previousState: { status: 'PENDING_APPROVAL' },
    newState: { status: 'APPROVED' },
    timestamp: '2026-09-24T12:00:00Z',
  },
];

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditItem[]>(MOCK_AUDIT_LOGS);
  const [selectedLog, setSelectedLog] = useState<AuditItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('offergen_token');
        const res = await fetch('/api/v1/audit-logs?limit=50', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data.items) && json.data.items.length > 0) {
            const mapped: AuditItem[] = json.data.items.map((item: any) => ({
              id: item.id,
              actorType: item.actorType || 'USER',
              actorName: item.actorType === 'AI_WORKER' ? 'AI Extraction Engine' : (item.actorId || 'HR Operations'),
              action: item.action,
              entityType: item.entityType,
              entityId: item.entityId,
              actionDescription: item.actionDescription,
              previousState: item.previousState,
              newState: item.newState,
              timestamp: item.createdAt || new Date().toISOString(),
            }));
            setLogs(mapped);
          }
        }
      } catch {
        // Fallback to MOCK_AUDIT_LOGS in offline demo mode
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <History size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.4rem' }}>Compliance Audit Ledger</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Strictly append-only compliance log capturing all human overrides, AI extractions, and
            status approvals.
          </p>
        </div>
      </div>

      {/* Audit Table */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '12px 14px' }}>Timestamp</th>
                <th style={{ padding: '12px 14px' }}>Actor</th>
                <th style={{ padding: '12px 14px' }}>Action</th>
                <th style={{ padding: '12px 14px' }}>Target Entity</th>
                <th style={{ padding: '12px 14px' }}>Summary</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Diff</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
                  }}
                >
                  <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {log.actorType === 'AI_WORKER' ? (
                        <Cpu size={14} style={{ color: 'var(--ai-purple, #7c3aed)' }} />
                      ) : (
                        <User size={14} style={{ color: 'var(--primary)' }} />
                      )}
                      <span style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>{log.actorName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor:
                          log.action === 'CREATE'
                            ? '#ecfdf5'
                            : log.action === 'UPDATE'
                            ? '#eff6ff'
                            : '#fffbeb',
                        color:
                          log.action === 'CREATE'
                            ? '#059669'
                            : log.action === 'UPDATE'
                            ? '#2563eb'
                            : '#d97706',
                        border:
                          log.action === 'CREATE'
                            ? '1px solid #a7f3d0'
                            : log.action === 'UPDATE'
                            ? '1px solid #bfdbfe'
                            : '1px solid #fde68a',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    {log.entityType} ({log.entityId})
                  </td>
                  <td style={{ padding: '14px', maxWidth: 360, color: 'var(--text-main)' }}>
                    {log.actionDescription}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <Button
                      variant="ghost"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      icon={<Eye size={14} />}
                      onClick={() => setSelectedLog(log)}
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Ledger Entry #${selectedLog.id}`}
          subtitle={`${selectedLog.action} on ${selectedLog.entityType} by ${selectedLog.actorName}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: '0.875rem' }}>
              <strong>Description:</strong> {selectedLog.actionDescription}
            </div>

            {selectedLog.previousState && (
              <div>
                <label className="form-label">Previous State (Before):</label>
                <pre
                  style={{
                    background: 'var(--bg-primary)',
                    padding: 12,
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    overflowX: 'auto',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {JSON.stringify(selectedLog.previousState, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.newState && (
              <div>
                <label className="form-label">New State (After):</label>
                <pre
                  style={{
                    background: 'var(--bg-primary)',
                    padding: 12,
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    overflowX: 'auto',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {JSON.stringify(selectedLog.newState, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
