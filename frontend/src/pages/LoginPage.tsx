import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
    success(`Signed in with ${role.replace('_', ' ')} demo profile!`);
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
        position: 'relative',
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '30%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.12)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '30%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(168, 85, 247, 0.12)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '40px 36px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--ai-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 24px var(--ai-glow)',
            }}
          >
            <Sparkles size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: 6 }}>
            OfferGen <span style={{ color: 'var(--ai-purple)' }}>AI</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Autonomous Offer Letter Generation & Verification Platform
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div
          style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Quick Demo Sign-in:
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('HR_MANAGER')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '7px', fontSize: '0.75rem' }}
            >
              HR Manager
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('SUPER_ADMIN')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '7px', fontSize: '0.75rem' }}
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('RECRUITER')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '7px', fontSize: '0.75rem' }}
            >
              Recruiter
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
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
                  color: 'var(--text-dim)',
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
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
                  color: 'var(--text-dim)',
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
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="ai"
            isLoading={isSubmitting}
            icon={<ArrowRight size={16} />}
            style={{ width: '100%', marginTop: 8 }}
          >
            Sign In to OfferGen
          </Button>
        </form>

        {/* Standalone Security Notice */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
          }}
        >
          <ShieldCheck size={14} style={{ color: 'var(--hr-emerald)' }} />
          <span>Standalone Architecture • Zero Direct HRMS Coupling</span>
        </div>
      </div>
    </div>
  );
};
