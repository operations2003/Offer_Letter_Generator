import { Request, Response, NextFunction } from 'express';
import { CryptoUtil, TokenPayload } from '../utils/crypto.js';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error.js';
import { prisma } from '../prisma/client.js';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  companyId: string;
  roles: string[];
  permissions: string[];
  firstName: string;
  lastName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Verifies JWT token and attaches authenticated user context to request
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization header missing or format invalid (expected: Bearer <token>)');
    }

    const token = authHeader.split(' ')[1];
    let payload: TokenPayload;

    try {
      payload = CryptoUtil.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }

    // Verify user is still active in the database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.deletedAt !== null) {
      throw new UnauthorizedError('User account not found or deactivated');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError(`User account is currently ${user.status.toLowerCase()}`);
    }

    // Aggregate roles and granular permissions
    const roles: string[] = [];
    const permissionsSet = new Set<string>();

    for (const ur of user.userRoles) {
      roles.push(ur.role.code);
      const rolePerms = ur.role.permissions as string[];
      if (Array.isArray(rolePerms)) {
        rolePerms.forEach((p) => permissionsSet.add(p));
      }
    }

    req.user = {
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      roles,
      permissions: Array.from(permissionsSet),
      firstName: user.firstName,
      lastName: user.lastName,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware enforcing that the user has at least one of the specified roles
 */
export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    // SUPER_ADMIN has omnipotent access
    if (req.user.roles.includes('SUPER_ADMIN')) {
      return next();
    }

    const hasRole = req.user.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      return next(
        new ForbiddenError(
          `Action requires one of the following roles: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
}

/**
 * Middleware enforcing that the user possesses all specified permissions
 */
export function requirePermissions(...requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    // SUPER_ADMIN has omnipotent access
    if (req.user.roles.includes('SUPER_ADMIN')) {
      return next();
    }

    const hasAll = requiredPermissions.every((perm) => req.user!.permissions.includes(perm));
    if (!hasAll) {
      return next(
        new ForbiddenError(
          `Missing required permission(s): [${requiredPermissions.join(', ')}]`
        )
      );
    }

    next();
  };
}
