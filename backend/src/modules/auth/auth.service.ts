import { prisma } from '../../prisma/client.js';
import { CryptoUtil } from '../../utils/crypto.js';
import { UnauthorizedError, ForbiddenError } from '../../errors/app-error.js';
import { AuditService } from '../audit/audit.service.js';

export class AuthService {
  /**
   * Authenticates user with email and password
   */
  static async login(
    email: string,
    passwordPlain: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.deletedAt !== null) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError(`User account is ${user.status.toLowerCase()}`);
    }

    const isMatch = await CryptoUtil.comparePassword(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Aggregate roles and unique permissions
    const roles: string[] = [];
    const permissionsSet = new Set<string>();

    for (const ur of user.userRoles) {
      roles.push(ur.role.code);
      const perms = ur.role.permissions as string[];
      if (Array.isArray(perms)) {
        perms.forEach((p) => permissionsSet.add(p));
      }
    }

    const permissions = Array.from(permissionsSet);

    // Generate JWT access & refresh tokens
    const accessToken = CryptoUtil.signAccessToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      roles,
      permissions,
    });

    const refreshToken = CryptoUtil.signRefreshToken(user.id);

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Record login in immutable audit trail
    await AuditService.record({
      companyId: user.companyId,
      actorType: 'USER',
      actorId: user.id,
      entityType: 'User',
      entityId: user.id,
      action: 'READ',
      actionDescription: `User ${user.email} logged in successfully`,
      ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        title: user.title,
        department: user.department,
        status: user.status,
        company: {
          id: user.company.id,
          name: user.company.name,
          code: user.company.code,
        },
        roles,
        permissions,
      },
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
      },
    };
  }

  /**
   * Refreshes an expired access token using a valid refresh token
   */
  static async refresh(refreshTokenStr: string) {
    let decoded: { userId: string };
    try {
      decoded = CryptoUtil.verifyRefreshToken(refreshTokenStr);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.deletedAt !== null || user.status !== 'ACTIVE') {
      throw new UnauthorizedError('User session expired or account deactivated');
    }

    const roles: string[] = [];
    const permissionsSet = new Set<string>();

    for (const ur of user.userRoles) {
      roles.push(ur.role.code);
      const perms = ur.role.permissions as string[];
      if (Array.isArray(perms)) {
        perms.forEach((p) => permissionsSet.add(p));
      }
    }

    const permissions = Array.from(permissionsSet);

    const accessToken = CryptoUtil.signAccessToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      roles,
      permissions,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
    };
  }

  /**
   * Retrieves active profile for current authenticated user
   */
  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.deletedAt !== null) {
      throw new UnauthorizedError('User not found');
    }

    const roles: string[] = [];
    const permissionsSet = new Set<string>();

    for (const ur of user.userRoles) {
      roles.push(ur.role.code);
      const perms = ur.role.permissions as string[];
      if (Array.isArray(perms)) {
        perms.forEach((p) => permissionsSet.add(p));
      }
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      department: user.department,
      status: user.status,
      company: {
        id: user.company.id,
        name: user.company.name,
        code: user.company.code,
      },
      roles,
      permissions: Array.from(permissionsSet),
      lastLoginAt: user.lastLoginAt,
    };
  }
}
