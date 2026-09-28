import { prisma } from '../../prisma/client.js';

export type AuditActorType = 'USER' | 'SYSTEM' | 'AI_WORKER' | 'CANDIDATE';
export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'OVERRIDE'
  | 'APPROVE'
  | 'REJECT'
  | 'ISSUE'
  | 'DOWNLOAD'
  | 'ACCEPT'
  | 'DECLINE'
  | 'REVOKE'
  | 'DELETE';


export interface AuditLogEntry {
  companyId: string;
  actorType: AuditActorType;
  actorId?: string | null;
  entityType: string;
  entityId: string;
  action: AuditAction;
  actionDescription: string;
  previousState?: Record<string, unknown> | null;
  newState?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuditFilterQuery {
  companyId: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  action?: AuditAction;
  limit?: number;
  offset?: number;
}

export class AuditService {
  /**
   * Deeply sanitizes sensitive data fields (passwords, tokens, API keys, secrets)
   * before persisting to the immutable audit log ledger.
   */
  private static redactSensitiveData(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.redactSensitiveData(item));
    }

    const SENSITIVE_KEYS = new Set([
      'password',
      'passwordplain',
      'passwordhash',
      'token',
      'accesstoken',
      'refreshtoken',
      'jwt',
      'secret',
      'apikey',
      'authorization',
      'credentials',
    ]);

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.redactSensitiveData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Records an immutable entry to the audit log ledger.
   * Runs asynchronously and catches failures to ensure core operations are not blocked.
   */
  static async record(entry: AuditLogEntry): Promise<void> {
    try {
      const sanitizedPreviousState = entry.previousState ? this.redactSensitiveData(entry.previousState) : undefined;
      const sanitizedNewState = entry.newState ? this.redactSensitiveData(entry.newState) : undefined;

      await prisma.auditLog.create({
        data: {
          companyId: entry.companyId,
          actorType: entry.actorType,
          actorId: entry.actorId || null,
          entityType: entry.entityType,
          entityId: entry.entityId,
          action: entry.action,
          actionDescription: entry.actionDescription,
          previousState: (sanitizedPreviousState as any) || undefined,
          newState: (sanitizedNewState as any) || undefined,
          ipAddress: entry.ipAddress || null,
          userAgent: entry.userAgent || null,
        },
      });
    } catch (err) {
      console.error('[AUDIT_LOG_ERROR] Failed to record audit log:', err);
    }
  }

  /**
   * Queries audit logs with filtering and pagination
   */
  static async query(filter: AuditFilterQuery) {
    const where: any = {
      companyId: filter.companyId,
    };

    if (filter.entityType) where.entityType = filter.entityType;
    if (filter.entityId) where.entityId = filter.entityId;
    if (filter.actorId) where.actorId = filter.actorId;
    if (filter.action) where.action = filter.action;

    const limit = Math.min(filter.limit || 50, 100);
    const offset = filter.offset || 0;

    const [total, items] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
    ]);

    return {
      total,
      limit,
      offset,
      items,
    };
  }
}
