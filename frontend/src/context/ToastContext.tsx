import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../types/index.js';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: Toast['type'], message: string, title?: string) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: Toast['type'], message: string, title?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, message, title };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  const success = useCallback((msg: string, title?: string) => showToast('success', msg, title), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast('error', msg, title), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast('warning', msg, title), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast('info', msg, title), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, warning, info }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => {
          let Icon = Info;
          if (t.type === 'success') Icon = CheckCircle2;
          if (t.type === 'error') Icon = AlertCircle;
          if (t.type === 'warning') Icon = AlertTriangle;

          return (
            <div key={t.id} className={`toast toast-${t.type} glass-panel`}>
              <Icon size={20} className="toast-icon" />
              <div style={{ flex: 1 }}>
                {t.title && <div style={{ fontWeight: 600, marginBottom: 2 }}>{t.title}</div>}
                <div>{t.message}</div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="btn-ghost"
                style={{ padding: 4, borderRadius: 4 }}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
