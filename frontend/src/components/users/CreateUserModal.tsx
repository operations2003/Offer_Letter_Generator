import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Mail,
  User,
  Briefcase,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { UserService, CreateUserPayload, SystemUser } from '../../services/userService.js';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (newUser: SystemUser) => void;
}

const AVAILABLE_ROLES = [
  {
    code: 'HR_MANAGER',
    name: 'HR Manager',
    badgeColor: '#1d4ed8',
    badgeBg: '#eff6ff',
    badgeBorder: '#bfdbfe',
    description: 'Creates offers, employee letters, and manages templates.',
  },
  {
    code: 'RECRUITER',
    name: 'Recruiter',
    badgeColor: '#7c3aed',
    badgeBg: '#f5f3ff',
    badgeBorder: '#ddd6fe',
    description: 'Drafts offers and manages candidate details.',
  },
  {
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    badgeColor: '#b45309',
    badgeBg: '#fffbeb',
    badgeBorder: '#fde68a',
    description: 'Full access to all settings, roles, and user accounts.',
  },
  {
    code: 'APPROVER',
    name: 'Approver',
    badgeColor: '#047857',
    badgeBg: '#ecfdf5',
    badgeBorder: '#a7f3d0',
    description: 'Reviews and approves salary and offer packages.',
  },
  {
    code: 'AUDITOR',
    name: 'Auditor',
    badgeColor: '#475569',
    badgeBg: '#f8fafc',
    badgeBorder: '#cbd5e1',
    description: 'Read-only access to audit logs and generated records.',
  },
];

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const { success, error } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState('People & Operations');
  const [title, setTitle] = useState('');
  const [selectedRole, setSelectedRole] = useState('HR_MANAGER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const generateStrongPassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const special = '!@#$%&*';
    let pwd = 'TN@';
    const all = uppercase + lowercase + numbers + special;
    for (let i = 0; i < 9; i++) {
      pwd += all.charAt(Math.floor(Math.random() * all.length));
    }
    setPassword(pwd);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      error('Please complete all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      error('Please enter a valid work email address.');
      return;
    }

    if (password.length < 8) {
      error('Password must be at least 8 characters long.');
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      error(
        'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol (or click Auto-Generate).'
      );
      return;
    }

    const existingUser = UserService.getLocalUsers().find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (existingUser) {
      error(`A user account with email "${email.trim()}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateUserPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        department: department.trim() || undefined,
        title: title.trim() || undefined,
        roleCodes: [selectedRole],
      };

      const newUser = await UserService.createUser(payload);
      success(`User account created successfully for ${newUser.firstName} ${newUser.lastName}!`);
      onUserCreated(newUser);
      onClose();
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setTitle('');
    } catch (err: any) {
      error(err?.message || 'Failed to create user account. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: 620,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe',
              }}
            >
              <UserPlus size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Add New User
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Create an account and assign their role.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: 6, color: '#94a3b8' }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Name Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                  First Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rahul"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={{ paddingLeft: 36 }}
                    required
                  />
                  <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                  Last Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={{ paddingLeft: 36 }}
                    required
                  />
                  <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>
            </div>

            {/* Email & Initial Password */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                Official Work Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. rahul.sharma@tasknera.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 36 }}
                  required
                />
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', margin: 0 }}>
                  Temporary / Initial Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={generateStrongPassword}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <Sparkles size={13} />
                  <span>Auto-Generate</span>
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min 8 chars (1 uppercase, 1 number, 1 symbol)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                  required
                />
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                Requires min. 8 chars with uppercase, lowercase, number, and symbol (or click Auto-Generate).
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 8, display: 'block' }}>
                Assign Authority / Primary Role <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {AVAILABLE_ROLES.map((role) => {
                  const isSelected = selectedRole === role.code;
                  return (
                    <div
                      key={role.code}
                      onClick={() => setSelectedRole(role.code)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: `1.5px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                        backgroundColor: isSelected ? '#f0f7ff' : '#ffffff',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name="system_role"
                        value={role.code}
                        checked={isSelected}
                        onChange={() => setSelectedRole(role.code)}
                        style={{ marginTop: 3, accentColor: '#2563eb', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#1e40af' : '#0f172a' }}>
                            {role.name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: role.badgeBg,
                              color: role.badgeColor,
                              border: `1px solid ${role.badgeBorder}`,
                            }}
                          >
                            {role.code}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 3, lineHeight: 1.35 }}>
                          {role.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department & Title */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                  Department
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    className="form-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{ paddingLeft: 36 }}
                  >
                    <option value="People & Operations">People & Operations</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Talent Acquisition">Talent Acquisition</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Finance">Finance</option>
                    <option value="Executive">Executive</option>
                  </select>
                  <Building size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                  Designation / Title
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. HR Operations Lead"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ paddingLeft: 36 }}
                  />
                  <Briefcase size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 12,
              background: '#f8fafc',
            }}
          >
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={<CheckCircle2 size={16} />}
            >
              Create User Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
