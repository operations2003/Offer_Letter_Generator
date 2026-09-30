import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Laptop,
  ShieldCheck,
  Building2,
  Users2,
  GraduationCap,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { JoiningChecklistItemInstance } from '../../../../shared/types/onboarding-engine.js';
import { onboardingService } from '../../services/onboardingService.js';
import { useToast } from '../../context/ToastContext.js';

interface JoiningChecklistWidgetProps {
  candidateId: string;
  checklist: JoiningChecklistItemInstance[];
  onChecklistUpdated: (updatedList: JoiningChecklistItemInstance[]) => void;
  canEdit?: boolean;
}

export const JoiningChecklistWidget: React.FC<JoiningChecklistWidgetProps> = ({
  candidateId,
  checklist,
  onChecklistUpdated,
  canEdit = true,
}) => {
  const { success, error } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const completedCount = checklist.filter((c) => c.isCompleted).length;
  const mandatoryCount = checklist.filter((c) => c.isMandatory).length;
  const mandatoryCompletedCount = checklist.filter((c) => c.isMandatory && c.isCompleted).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const filteredItems = checklist.filter(
    (item) => selectedRole === 'ALL' || item.assigneeRole === selectedRole
  );

  const handleToggle = async (item: JoiningChecklistItemInstance) => {
    if (!canEdit) return;
    setUpdatingId(item.id);
    try {
      const candidate = await onboardingService.updateChecklistItem(candidateId, item.id, {
        isCompleted: !item.isCompleted,
      });
      onChecklistUpdated(candidate.checklist);
      success(
        !item.isCompleted
          ? `Marked "${item.title}" as completed`
          : `Re-opened "${item.title}"`
      );
    } catch (err: any) {
      error(err.message || 'Failed to update checklist task');
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'IT':
        return <Laptop size={14} />;
      case 'HR':
        return <ShieldCheck size={14} />;
      case 'FACILITIES':
        return <Building2 size={14} />;
      case 'MANAGER':
        return <Users2 size={14} />;
      case 'EMPLOYEE':
        return <GraduationCap size={14} />;
      default:
        return <CheckCircle2 size={14} />;
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'IT':
        return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
      case 'HR':
        return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
      case 'FACILITIES':
        return { bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
      case 'MANAGER':
        return { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' };
      case 'EMPLOYEE':
        return { bg: '#fdf2f8', color: '#db2777', border: '#fbcfe8' };
      default:
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 16,
        border: '1px solid #e2e8f0',
        padding: 24,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Header & Overall Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Joining Checklist</h3>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 9999,
                background: progressPercent === 100 ? '#ecfdf5' : '#eff6ff',
                color: progressPercent === 100 ? '#059669' : '#2563eb',
                border: `1px solid ${progressPercent === 100 ? '#a7f3d0' : '#bfdbfe'}`,
              }}
            >
              {completedCount} / {checklist.length} Completed
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 4 }}>
            Mandatory Day-1 readiness tasks across IT, Facilities, HR, and Manager
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            {progressPercent}%
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            {mandatoryCompletedCount}/{mandatoryCount} Mandatory
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: 7,
          background: '#f1f5f9',
          borderRadius: 9999,
          overflow: 'hidden',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: progressPercent === 100 ? '#10b981' : 'linear-gradient(90deg, #2563eb, #3b82f6)',
            borderRadius: 9999,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Role Filter Chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
        {['ALL', 'IT', 'HR', 'FACILITIES', 'MANAGER', 'EMPLOYEE'].map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            style={{
              padding: '5px 12px',
              borderRadius: 9999,
              fontSize: '0.75rem',
              fontWeight: 600,
              background: selectedRole === role ? '#0f172a' : '#f8fafc',
              color: selectedRole === role ? '#ffffff' : '#64748b',
              border: selectedRole === role ? '1px solid #0f172a' : '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Checklist Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredItems.map((item) => {
          const badgeStyle = getRoleBadgeStyle(item.assigneeRole);
          const isPending = updatingId === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '12px 14px',
                borderRadius: 10,
                background: item.isCompleted ? '#f8fafc' : '#ffffff',
                border: item.isCompleted ? '1px solid #e2e8f0' : '1px solid #cbd5e1',
                cursor: canEdit ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                opacity: isPending ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (canEdit && !item.isCompleted) {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.background = '#f0f7ff';
                }
              }}
              onMouseLeave={(e) => {
                if (canEdit && !item.isCompleted) {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.background = '#ffffff';
                }
              }}
            >
              {/* Checkbox Icon */}
              <div style={{ marginTop: 2, color: item.isCompleted ? '#10b981' : '#94a3b8' }}>
                {item.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </div>

              {/* Task Details */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: item.isCompleted ? '#64748b' : '#0f172a',
                      textDecoration: item.isCompleted ? 'line-through' : 'none',
                    }}
                  >
                    {item.title}
                  </span>

                  {/* Assignee Role Pill */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 7px',
                      borderRadius: 9999,
                      background: badgeStyle.bg,
                      color: badgeStyle.color,
                      border: `1px solid ${badgeStyle.border}`,
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                    }}
                  >
                    {getRoleIcon(item.assigneeRole)}
                    <span>{item.assigneeRole}</span>
                  </span>

                  {item.isMandatory && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: '#ef4444',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '1px 6px',
                        borderRadius: 4,
                      }}
                    >
                      MANDATORY
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.78125rem', color: '#64748b', marginTop: 3 }}>
                  {item.description}
                </p>

                {/* Sub-footer: Due date & completion details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, fontSize: '0.72rem', color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} />
                    <span>Target Due: {item.dueDate}</span>
                  </span>

                  {item.isCompleted && item.completedAt && (
                    <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      <span>Completed on {new Date(item.completedAt).toLocaleDateString()}</span>
                    </span>
                  )}

                  {item.notes && (
                    <span style={{ color: '#475569', fontStyle: 'italic' }}>
                      Note: {item.notes}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
