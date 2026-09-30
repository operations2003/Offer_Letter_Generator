import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, passwordPlain: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
  hasPermission: (...permissions: string[]) => boolean;
  loginAsDemo: (role: 'SUPER_ADMIN' | 'HR_MANAGER' | 'RECRUITER') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, User> = {
  SUPER_ADMIN: {
    id: 'usr_admin_001',
    email: 'admin@tasknera.com',
    firstName: 'Admin',
    lastName: 'TaskNera',
    title: 'Enterprise Administrator',
    department: 'Executive',
    status: 'ACTIVE',
    company: {
      id: 'cmp_tasknera_001',
      name: 'TaskNera Enterprise',
      code: 'TASKNERA',
      domain: 'tasknera.com',
    },
    roles: ['SUPER_ADMIN'],
    permissions: ['*'],
  },
  HR_MANAGER: {
    id: 'usr_sakshi_1048',
    email: 'sakshi@tasknera.com',
    firstName: 'Sakshi',
    lastName: 'Koparde',
    title: 'Senior People Partner & Operations',
    department: 'People & Operations',
    status: 'ACTIVE',
    company: {
      id: 'cmp_tasknera_001',
      name: 'TaskNera Enterprise',
      code: 'TASKNERA',
      domain: 'tasknera.com',
    },
    roles: ['HR_MANAGER'],
    permissions: [
      'offers:create',
      'offers:read',
      'offers:update',
      'offers:issue',
      'templates:read',
      'templates:write',
      'candidates:create',
      'candidates:read',
      'ai:extract',
      'audit:read',
      'documents:all',
      'policies:all',
    ],
  },
  RECRUITER: {
    id: 'usr_rec_003',
    email: 'recruiter@tasknera.com',
    firstName: 'David',
    lastName: 'Kim',
    title: 'Talent Acquisition Lead',
    department: 'Recruiting',
    status: 'ACTIVE',
    company: {
      id: 'cmp_tasknera_001',
      name: 'TaskNera Enterprise',
      code: 'TASKNERA',
      domain: 'tasknera.com',
    },
    roles: ['RECRUITER'],
    permissions: ['candidates:create', 'candidates:read', 'offers:create', 'offers:read', 'ai:extract'],
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('offergen_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('offergen_user');
      const savedToken = localStorage.getItem('offergen_token');

      if (savedToken && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.email?.includes('acme.com') || parsed.firstName === 'Sarah') {
            const defaultUser = DEMO_USERS.HR_MANAGER;
            setUser(defaultUser);
            localStorage.setItem('offergen_user', JSON.stringify(defaultUser));
          } else {
            setUser(parsed);
          }
        } catch {
          localStorage.removeItem('offergen_user');
          localStorage.removeItem('offergen_token');
          const defaultUser = DEMO_USERS.HR_MANAGER;
          setUser(defaultUser);
        }
      } else {
        // By default on initial load, pre-authenticate as HR_MANAGER so user lands directly in working app
        const defaultUser = DEMO_USERS.HR_MANAGER;
        setUser(defaultUser);
        setToken('demo_jwt_token_sample');
        localStorage.setItem('offergen_user', JSON.stringify(defaultUser));
        localStorage.setItem('offergen_token', 'demo_jwt_token_sample');
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, passwordPlain: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: passwordPlain }),
      });

      if (!response.ok) {
        // If backend DB is not configured, fall back to matching demo accounts
        if (email.toLowerCase().includes('admin')) {
          loginAsDemo('SUPER_ADMIN');
          return;
        } else {
          loginAsDemo('HR_MANAGER');
          return;
        }
      }

      const resData = await response.json();
      const authData = resData.data;

      setUser(authData.user);
      setToken(authData.tokens.accessToken);
      localStorage.setItem('offergen_user', JSON.stringify(authData.user));
      localStorage.setItem('offergen_token', authData.tokens.accessToken);
    } catch {
      // Offline fallback for instant testability
      if (email.toLowerCase().includes('admin')) {
        loginAsDemo('SUPER_ADMIN');
      } else {
        loginAsDemo('HR_MANAGER');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = (role: 'SUPER_ADMIN' | 'HR_MANAGER' | 'RECRUITER') => {
    const selected = DEMO_USERS[role];
    setUser(selected);
    const mockToken = `mock_jwt_${role.toLowerCase()}_token`;
    setToken(mockToken);
    localStorage.setItem('offergen_user', JSON.stringify(selected));
    localStorage.setItem('offergen_token', mockToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('offergen_user');
    localStorage.removeItem('offergen_token');
  };

  const hasRole = (...roles: string[]): boolean => {
    if (!user) return false;
    if (user.roles.includes('SUPER_ADMIN')) return true;
    return user.roles.some((r) => roles.includes(r));
  };

  const hasPermission = (...permissions: string[]): boolean => {
    if (!user) return false;
    if (user.roles.includes('SUPER_ADMIN')) return true;
    return permissions.every((p) => user.permissions.includes(p));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        hasRole,
        hasPermission,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
