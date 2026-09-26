import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { AuditService } from '../audit/audit.service.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const result = await AuthService.login(email, password, ipAddress, userAgent);

      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await AuditService.record({
          companyId: req.user.companyId,
          actorType: 'USER',
          actorId: req.user.userId,
          entityType: 'User',
          entityId: req.user.userId,
          action: 'READ',
          actionDescription: `User ${req.user.email} logged out`,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.get('user-agent'),
        });
      }

      res.status(200).json({
        success: true,
        message: 'Successfully logged out',
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.getMe(req.user!.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
