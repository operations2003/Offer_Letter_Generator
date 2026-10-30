import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { UserService, SystemUser } from '../services/userService.js';

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
    email: 'sheetalbedi@tasknera.com',
    firstName: 'Sheetal',
    lastName: 'Bedi',
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
    id: 'usr_hr_002',
    email: 'hr@gmail.com',
    firstName: 'HR',
    lastName: 'Manager',
    title: 'HR Operations Manager',
    department: 'Human Resources',
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
      // If user is currently visiting the login page, do not autofill or restore credentials
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

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
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  
  const loginWithSystemUser = (systemUser: SystemUser) => {
    const roleCodes = (systemUser.roles || []).map((r) => r.code);
    if (roleCodes.length === 0) {
      roleCodes.push('HR_MANAGER');
    }

    const isSuperAdmin = roleCodes.includes('SUPER_ADMIN');
    const isHrManager = roleCodes.includes('HR_MANAGER');
    const isRecruiter = roleCodes.includes('RECRUITER');

    let permissions: string[];
    if (isSuperAdmin) {
      permissions = ['*'];
    } else if (isHrManager) {
      permissions = [
        'candidates:create',
        'candidates:read',
        'candidates:update',
        'candidates:delete',
        'offers:create',
        'offers:read',
        'offers:update',
        'offers:delete',
        'offers:generate_pdf',
        'offers:send',
        'templates:read',
        'ai:extract',
        'audit:read',
        'users:read',
        'users:create',
        'users:update',
        'users:delete',
        'roles:read',
        'analytics:read',
        'exports:read',
      ];
    } else if (isRecruiter) {
      permissions = [
        'candidates:create',
        'candidates:read',
        'offers:create',
        'offers:read',
        'ai:extract',
        'templates:read',
      ];
    } else {
      permissions = ['candidates:read', 'offers:read', 'templates:read'];
    }

    const authUser: User = {
      id: systemUser.id,
      email: systemUser.email,
      firstName: systemUser.firstName,
      lastName: systemUser.lastName,
      title: systemUser.title || undefined,
      department: systemUser.department || undefined,
      status: systemUser.status,
      company: {
        id: 'cmp_tasknera_001',
        name: 'TaskNera Enterprise',
        code: 'TASKNERA',
        domain: 'tasknera.com',
      },
      roles: roleCodes,
      permissions,
      lastLoginAt: new Date().toISOString(),
    };

    const userToken = `jwt_user_${systemUser.id}_${Date.now()}`;
    setUser(authUser);
    setToken(userToken);
    localStorage.setItem('offergen_user', JSON.stringify(authUser));
    localStorage.setItem('offergen_token', userToken);
  };

  const login = async (email: string, passwordPlain: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: passwordPlain }),
      });

      if (!response.ok) {
        // Direct credential verification fallback if backend DB returns 401/network issue
        if (cleanEmail === 'sheetalbedi@tasknera.com' && passwordPlain === 'Tasknera@9312506515') {
          loginAsDemo('SUPER_ADMIN');
          return;
        } else if (cleanEmail === 'hr@gmail.com' && passwordPlain === 'hr@123') {
          loginAsDemo('HR_MANAGER');
          return;
        }

        // Check if this is a created system user (e.g. shubham@gmail.com)
        const localUser = UserService.verifyCredentials(cleanEmail, passwordPlain);
        if (localUser) {
          loginWithSystemUser(localUser);
          return;
        }

        const resData = await response.json().catch(() => ({}));
        throw new Error(resData?.message || 'Invalid email or password');
      }

      const resData = await response.json();
      const authData = resData.data;

      setUser(authData.user);
      setToken(authData.tokens.accessToken);
      localStorage.setItem('offergen_user', JSON.stringify(authData.user));
      localStorage.setItem('offergen_token', authData.tokens.accessToken);
    } catch (err: any) {
      // Offline fallback strictly for designated credentials or created system users
      if (cleanEmail === 'sheetalbedi@tasknera.com' && passwordPlain === 'Tasknera@9312506515') {
        loginAsDemo('SUPER_ADMIN');
        return;
      } else if (cleanEmail === 'hr@gmail.com' && passwordPlain === 'hr@123') {
        loginAsDemo('HR_MANAGER');
        return;
      }

      const localUser = UserService.verifyCredentials(cleanEmail, passwordPlain);
      if (localUser) {
        loginWithSystemUser(localUser);
        return;
      }

      throw new Error(err?.message || 'Invalid email or password');
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
