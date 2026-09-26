import { prisma } from '../../prisma/client.js';
import { CryptoUtil } from '../../utils/crypto.js';
import { NotFoundError, ConflictError, ValidationError, UnauthorizedError } from '../../errors/app-error.js';
import { AuditService } from '../audit/audit.service.js';
import { UserStatus } from '@prisma/client';

export interface CreateUserInput {
  companyId: string;
  email: string;
  passwordPlain: string;
  firstName: string;
  lastName: string;
  department?: string;
  title?: string;
  roleCodes: string[];
  actorUserId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  department?: string | null;
  title?: string | null;
  status?: UserStatus;
  roleCodes?: string[];
  actorUserId: string;
  ipAddress?: string;
  userAgent?: string;
}

export class UserService {
  /**
   * Lists users belonging to the company with search and pagination
   */
  static async listUsers(
    companyId: string,
    options: {
      search?: string;
      status?: UserStatus;
      role?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const limit = Math.min(options.limit || 20, 100);
    const offset = options.offset || 0;

    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (options.status) {
      where.status = options.status;
    }

    if (options.role) {
      where.userRoles = {
        some: {
          role: {
            code: options.role,
          },
        },
      };
    }

    if (options.search) {
      where.OR = [
        { email: { contains: options.search, mode: 'insensitive' } },
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          department: true,
          title: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          userRoles: {
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      department: u.department,
      title: u.title,
      status: u.status,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      roles: u.userRoles.map((ur) => ur.role),
    }));

    return {
      total,
      limit,
      offset,
      users: formattedUsers,
    };
  }

  /**
   * Retrieves single user details by ID
   */
  static async getUserById(userId: string, companyId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
        deletedAt: null,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department,
      title: user.title,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      roles: user.userRoles.map((ur) => ur.role),
    };
  }

  /**
   * Creates a new user account with role assignments and audit record
   */
  static async createUser(input: CreateUserInput) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new ConflictError('A user account with this email address already exists');
    }

    // Verify all specified role codes exist
    const roles = await prisma.role.findMany({
      where: {
        code: { in: input.roleCodes },
      },
    });

    if (roles.length !== input.roleCodes.length) {
      throw new ValidationError('One or more specified role codes are invalid');
    }

    const passwordHash = await CryptoUtil.hashPassword(input.passwordPlain);

    const newUser = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          companyId: input.companyId,
          email: input.email,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          department: input.department,
          title: input.title,
          status: 'ACTIVE',
        },
      });

      // Assign user roles
      for (const role of roles) {
        await tx.userRole.create({
          data: {
            userId: created.id,
            roleId: role.id,
            assignedBy: input.actorUserId,
          },
        });
      }

      return created;
    });

    // Record audit event
    await AuditService.record({
      companyId: input.companyId,
      actorType: 'USER',
      actorId: input.actorUserId,
      entityType: 'User',
      entityId: newUser.id,
      action: 'CREATE',
      actionDescription: `Created user ${newUser.email} with roles: [${input.roleCodes.join(', ')}]`,
      newState: {
        id: newUser.id,
        email: newUser.email,
        roles: input.roleCodes,
      },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return this.getUserById(newUser.id, input.companyId);
  }

  /**
   * Updates user details and/or assigned roles
   */
  static async updateUser(userId: string, companyId: string, input: UpdateUserInput) {
    const existing = await prisma.user.findFirst({
      where: { id: userId, companyId, deletedAt: null },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('User');
    }

    const previousRoles = existing.userRoles.map((ur) => ur.role.code);
    const previousState = {
      firstName: existing.firstName,
      lastName: existing.lastName,
      department: existing.department,
      title: existing.title,
      status: existing.status,
      roles: previousRoles,
    };

    await prisma.$transaction(async (tx) => {
      // Update core profile fields
      await tx.user.update({
        where: { id: userId },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          department: input.department,
          title: input.title,
          status: input.status,
        },
      });

      // Update roles if provided
      if (input.roleCodes && input.roleCodes.length > 0) {
        const targetRoles = await tx.role.findMany({
          where: { code: { in: input.roleCodes } },
        });

        if (targetRoles.length !== input.roleCodes.length) {
          throw new ValidationError('One or more specified role codes are invalid');
        }

        // Remove old role assignments
        await tx.userRole.deleteMany({
          where: { userId },
        });

        // Insert new role assignments
        for (const role of targetRoles) {
          await tx.userRole.create({
            data: {
              userId,
              roleId: role.id,
              assignedBy: input.actorUserId,
            },
          });
        }
      }
    });

    const updated = await this.getUserById(userId, companyId);

    // Audit log
    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: input.actorUserId,
      entityType: 'User',
      entityId: userId,
      action: 'UPDATE',
      actionDescription: `Updated user account for ${existing.email}`,
      previousState,
      newState: {
        firstName: updated.firstName,
        lastName: updated.lastName,
        department: updated.department,
        title: updated.title,
        status: updated.status,
        roles: updated.roles.map((r) => r.code),
      },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return updated;
  }

  /**
   * Soft-deletes a user account
   */
  static async deleteUser(
    userId: string,
    companyId: string,
    actorUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (userId === actorUserId) {
      throw new ValidationError('You cannot delete your own account');
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, companyId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        status: 'INACTIVE',
      },
    });

    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: actorUserId,
      entityType: 'User',
      entityId: userId,
      action: 'DELETE',
      actionDescription: `Soft-deleted user account ${user.email}`,
      previousState: { status: user.status },
      newState: { deletedAt: new Date(), status: 'INACTIVE' },
      ipAddress,
      userAgent,
    });

    return { message: 'User successfully deactivated' };
  }

  /**
   * Allows an authenticated user to change their own password
   */
  static async changePassword(
    userId: string,
    currentPasswordPlain: string,
    newPasswordPlain: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt !== null) {
      throw new NotFoundError('User');
    }

    const isMatch = await CryptoUtil.comparePassword(currentPasswordPlain, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Current password provided is incorrect');
    }

    const newHash = await CryptoUtil.hashPassword(newPasswordPlain);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    await AuditService.record({
      companyId: user.companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'User',
      entityId: userId,
      action: 'UPDATE',
      actionDescription: `Password changed for user ${user.email}`,
      ipAddress,
      userAgent,
    });

    return { message: 'Password updated successfully' };
  }
}
