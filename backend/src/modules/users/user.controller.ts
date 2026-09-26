import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service.js';
import { UserStatus } from '@prisma/client';

export class UserController {
  static async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const { search, status, role, limit, offset } = req.query;

      const result = await UserService.listUsers(companyId, {
        search: search ? String(search) : undefined,
        status: status ? (String(status) as UserStatus) : undefined,
        role: role ? String(role) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
        offset: offset ? parseInt(String(offset), 10) : undefined,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const { id } = req.params;

      const user = await UserService.getUserById(id, companyId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const actorUserId = req.user!.userId;
      const { email, password, firstName, lastName, department, title, roleCodes } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const newUser = await UserService.createUser({
        companyId,
        email,
        passwordPlain: password,
        firstName,
        lastName,
        department,
        title,
        roleCodes,
        actorUserId,
        ipAddress,
        userAgent,
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const actorUserId = req.user!.userId;
      const { id } = req.params;
      const { firstName, lastName, department, title, status, roleCodes } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const updated = await UserService.updateUser(id, companyId, {
        firstName,
        lastName,
        department,
        title,
        status,
        roleCodes,
        actorUserId,
        ipAddress,
        userAgent,
      });

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const actorUserId = req.user!.userId;
      const { id } = req.params;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const result = await UserService.deleteUser(id, companyId, actorUserId, ipAddress, userAgent);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const result = await UserService.changePassword(
        userId,
        currentPassword,
        newPassword,
        ipAddress,
        userAgent
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
