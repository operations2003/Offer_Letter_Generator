import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/common/Button.js';
import { useToast } from '../context/ToastContext.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginAsDemo } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (role: 'SUPER_ADMIN' | 'HR_MANAGER' | 'RECRUITER') => {
    loginAsDemo(role);
    success(`Signed in as ${role === 'HR_MANAGER' ? 'Sakshi Koparde (HR Partner)' : role.replace('_', ' ')}!`);
    navigate('/dashboard');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#f8fafc',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 36px',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', marginBottom: 12 }}>
            <img
              src="/logo.png"
              alt="Logo"
              style={{
                width: 48,
                height: 48,
                objectFit: 'contain',
                borderRadius: 8,
              }}
            />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>
            TaskNera HRMS
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Enterprise HR Documents & Workforce Platform
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: '0.6875rem',
              color: '#64748b',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Quick 1-Click Access:
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('HR_MANAGER')}
              style={{
                flex: 1,
                padding: '7px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Sakshi (HR)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('SUPER_ADMIN')}
              style={{
                flex: 1,
                padding: '7px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('RECRUITER')}
              style={{
                flex: 1,
                padding: '7px 10px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Recruiter
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#334155', fontSize: '0.8125rem', fontWeight: 600 }}>
              Work Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="sakshi@tasknera.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 38 }}
                required
              />
              <Mail
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

          <div className="form-group">
            <label className="form-label" style={{ color: '#334155', fontSize: '0.8125rem', fontWeight: 600 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 38, paddingRight: 38 }}
                required
              />
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
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
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            icon={<ArrowRight size={16} />}
            style={{ width: '100%', marginTop: 8 }}
          >
            Sign In to TaskNera Console
          </Button>
        </form>

        {/* Security Notice */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <ShieldCheck size={14} style={{ color: '#10b981' }} />
          <span>Role-Based Access Control • Full Audit Ledger</span>
        </div>
      </div>
    </div>
  );
};
