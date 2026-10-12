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

// Local in-memory mock fallback in case of disconnected network or offline test
const FALLBACK_USERS: SystemUser[] = [
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

      if (!res.ok) {
        throw new Error(`Failed to fetch users: HTTP ${res.status}`);
      }

      const json = await res.json();
      return json.data;
    } catch {
      // Fallback filter
      let filtered = [...FALLBACK_USERS];
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.email.toLowerCase().includes(q) ||
            u.firstName.toLowerCase().includes(q) ||
            u.lastName.toLowerCase().includes(q)
        );
      }
      if (params?.role) {
        filtered = filtered.filter((u) => u.roles.some((r) => r.code === params.role));
      }
      return { users: filtered, total: filtered.length };
    }
  }

  /**
   * Admin creates a new user account
   */
  static async createUser(payload: CreateUserPayload): Promise<SystemUser> {
    const res = await fetch('/api/v1/users', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create user account');
    }

    const json = await res.json();
    const created = json.data;

    // Cache locally
    FALLBACK_USERS.unshift(created);
    return created;
  }

  /**
   * Admin updates an existing user
   */
  static async updateUser(id: string, payload: UpdateUserPayload): Promise<SystemUser> {
    const res = await fetch(`/api/v1/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update user');
    }

    const json = await res.json();
    return json.data;
  }

  /**
   * Admin deactivates/deletes a user
   */
  static async deleteUser(id: string): Promise<void> {
    const res = await fetch(`/api/v1/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to delete user');
    }
  }
}
