import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

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

        {/* Quick 1-Click Access */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            marginBottom: 20,
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
            ⚡ Quick 1-Click Sign-In:
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('SUPER_ADMIN')}
              style={{
                flex: 1,
                padding: '7px 6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
              title="Sign in as Sheetal Bedi (Super Admin)"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('HR_MANAGER')}
              style={{
                flex: 1,
                padding: '7px 6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                borderRadius: 6,
                cursor: 'pointer',
              }}
              title="Sign in as Sakshi Koparde (HR Manager)"
            >
              👩‍💼 Sakshi (HR)
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('RECRUITER')}
              style={{
                flex: 1,
                padding: '7px 6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                cursor: 'pointer',
              }}
              title="Sign in as David Kim (Recruiter)"
            >
              🔍 Recruiter
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label className="form-label" style={{ color: '#334155', fontSize: '0.8125rem', fontWeight: 600 }}>
              Work Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="form-input"
                placeholder="sheetalbedi@tasknera.com"
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
                name="password"
                autoComplete="new-password"
                spellCheck={false}
                className="form-input"
                placeholder="**********"
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

        {/* Enterprise Credentials Guide */}
        <div
          style={{
            marginTop: 18,
            padding: '12px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: '0.75rem',
            color: '#475569',
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            🔑 Enterprise Login Credentials:
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '3px 0' }}>
            <span><strong>Admin</strong>: sheetalbedi@tasknera.com</span>
            <button
              type="button"
              onClick={() => {
                setEmail('sheetalbedi@tasknera.com');
                setPassword('Tasknera@9312506515');
              }}
              style={{ border: 'none', background: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Auto-fill
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '3px 0' }}>
            <span><strong>HR Partner</strong>: hr@tasknera.com</span>
            <button
              type="button"
              onClick={() => {
                setEmail('hr@tasknera.com');
                setPassword('Tasknera@123');
              }}
              style={{ border: 'none', background: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Auto-fill
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div
          style={{
            marginTop: 18,
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
