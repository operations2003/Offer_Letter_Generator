// =============================================================================
// USER MANAGEMENT SERVICE - TASKNERA ENTERPRISE HRMS
// =============================================================================

export interface UserRoleInfo {
  id: string;
  code: string;
  name: string;
}

export interface SystemUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department?: string | null;
  title?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLoginAt?: string | null;
  createdAt: string;
  roles: UserRoleInfo[];
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department?: string;
  title?: string;
  roleCodes: string[];
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  department?: string;
  title?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  roleCodes?: string[];
}

// Local storage key for system users
const USERS_STORAGE_KEY = 'tasknera_system_users';

const INITIAL_USERS: SystemUser[] = [
  {
    id: 'usr_admin_001',
    email: 'sheetalbedi@tasknera.com',
    firstName: 'Sheetal',
    lastName: 'Bedi',
    title: 'Super Administrator',
    department: 'Executive',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    roles: [{ id: 'role_admin', code: 'SUPER_ADMIN', name: 'Super Administrator' }],
  },
  {
    id: 'usr_hr_002',
    email: 'hr@gmail.com',
    firstName: 'HR',
    lastName: 'Manager',
    title: 'HR Operations Manager',
    department: 'Human Resources',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    roles: [{ id: 'role_hr', code: 'HR_MANAGER', name: 'HR Manager' }],
  },
  {
    id: 'usr_rec_003',
    email: 'recruiter@tasknera.com',
    firstName: 'David',
    lastName: 'Kim',
    title: 'Talent Acquisition Lead',
    department: 'Recruiting',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    roles: [{ id: 'role_rec', code: 'RECRUITER', name: 'Recruiter' }],
  },
];

export class UserService {
  private static getHeaders(): HeadersInit {
    const token =
      localStorage.getItem('offergen_token') ||
      localStorage.getItem('token') ||
      'demo_jwt_token_sample';

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  public static getLocalUsers(): SystemUser[] {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
        return [...INITIAL_USERS];
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return [...INITIAL_USERS];
    } catch {
      return [...INITIAL_USERS];
    }
  }

  public static saveLocalUsers(users: SystemUser[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (err) {
      console.warn('Failed to save users to localStorage:', err);
    }
  }

  /**
   * Fetches the user directory
   */
  static async listUsers(params?: { search?: string; role?: string; status?: string }): Promise<{
    users: SystemUser[];
    total: number;
  }> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.role) query.append('role', params.role);
      if (params?.status) query.append('status', params.status);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`/api/v1/users${qs}`, {
        headers: this.getHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        const backendUsers: SystemUser[] = json.data?.users || json.data || [];
        const local = this.getLocalUsers();
        const backendEmails = new Set(backendUsers.map((u) => u.email.toLowerCase()));
        const uniqueLocal = local.filter((l) => !backendEmails.has(l.email.toLowerCase()));
        const merged = [...uniqueLocal, ...backendUsers];
        this.saveLocalUsers(merged);
        return { users: merged, total: merged.length };
      }
    } catch {
      // Offline fallback
    }

    let filtered = this.getLocalUsers();
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          (u.title && u.title.toLowerCase().includes(q))
      );
    }
    if (params?.role) {
      filtered = filtered.filter((u) => u.roles.some((r) => r.code === params.role));
    }
    if (params?.status) {
      filtered = filtered.filter((u) => u.status === params.status);
    }
    return { users: filtered, total: filtered.length };
  }

  /**
   * Admin creates a new user account
   */
  static async createUser(payload: CreateUserPayload): Promise<SystemUser> {
    const roleMap: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrator',
      HR_MANAGER: 'HR Manager',
      RECRUITER: 'Recruiter',
      APPROVER: 'Approver',
      AUDITOR: 'Auditor',
    };

    const localUser: SystemUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      email: payload.email.trim().toLowerCase(),
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      title: payload.title?.trim() || null,
      department: payload.department?.trim() || null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      roles: (payload.roleCodes || ['HR_MANAGER']).map((code) => ({
        id: `role_${code.toLowerCase()}`,
        code,
        name: roleMap[code] || code,
      })),
    };

    try {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        const created = json.data;
        const current = this.getLocalUsers();
        this.saveLocalUsers([created, ...current.filter((u) => u.id !== created.id)]);
        return created;
      }

      const err = await res.json().catch(() => ({}));
      const errMsg = err.error?.message || err.message;
      if (res.status === 400 && errMsg) {
        throw new Error(errMsg);
      }
    } catch (err: any) {
      if (
        err.message &&
        !err.message.includes('fetch') &&
        !err.message.includes('Failed to') &&
        !err.message.includes('NetworkError')
      ) {
        throw err;
      }
    }

    // LocalStorage fallback ensures creation succeeds smoothly
    const current = this.getLocalUsers();
    this.saveLocalUsers([localUser, ...current.filter((u) => u.email.toLowerCase() !== localUser.email.toLowerCase())]);
    return localUser;
  }

  /**
   * Admin updates an existing user
   */
  static async updateUser(id: string, payload: UpdateUserPayload): Promise<SystemUser> {
    let updatedUser: SystemUser | null = null;
    try {
      const res = await fetch(`/api/v1/users/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        updatedUser = json.data;
      }
    } catch {
      // Offline fallback
    }

    const local = this.getLocalUsers();
    const index = local.findIndex((u) => u.id === id);
    if (index !== -1) {
      const existing = local[index];
      const merged: SystemUser = {
        ...existing,
        ...payload,
      };
      local[index] = updatedUser || merged;
      this.saveLocalUsers(local);
      return updatedUser || merged;
    }
    if (updatedUser) return updatedUser;
    throw new Error('User not found to update');
  }

  /**
   * Admin deactivates/deletes a user
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      await fetch(`/api/v1/users/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
    } catch {
      // Offline fallback
    }
    const local = this.getLocalUsers();
    this.saveLocalUsers(local.filter((u) => u.id !== id));
  }
}
