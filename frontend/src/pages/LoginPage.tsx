import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/common/Button.js';
import { useToast } from '../context/ToastContext.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
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
                placeholder="name@company.com"
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
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            🔑 Enterprise Authorized Accounts:
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0' }}>
            <span><strong>Admin</strong>: sheetalbedi@tasknera.com</span>
            <button
              type="button"
              onClick={() => {
                setEmail('sheetalbedi@tasknera.com');
                setPassword('Tasknera@9312506515');
              }}
              style={{ border: 'none', background: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Fill
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0' }}>
            <span><strong>HR Operations</strong>: rashmi@gmail.com</span>
            <button
              type="button"
              onClick={() => {
                setEmail('rashmi@gmail.com');
                setPassword('Rashmi@1234');
              }}
              style={{ border: 'none', background: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Fill
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
