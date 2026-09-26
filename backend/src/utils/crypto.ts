import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

const BCRYPT_SALT_ROUNDS = 12;

export interface TokenPayload {
  userId: string;
  email: string;
  companyId: string;
  roles: string[];
  permissions: string[];
}

export class CryptoUtil {
  /**
   * Hashes a plain-text password using bcrypt with 12 salt rounds.
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  /**
   * Verifies plain-text password against bcrypt hash.
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validates password strength:
   * - Min 8 characters
   * - At least 1 uppercase letter
   * - At least 1 lowercase letter
   * - At least 1 digit
   * - At least 1 special character
   */
  static validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special symbol' };
    }
    return { isValid: true };
  }

  /**
   * Signs an access JWT token.
   */
  static signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'offer-letter-generator',
    } as jwt.SignOptions);
  }

  /**
   * Signs a refresh JWT token.
   */
  static signRefreshToken(userId: string): string {
    return jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'offer-letter-generator',
    } as jwt.SignOptions);
  }

  /**
   * Verifies access JWT token.
   */
  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  }

  /**
   * Verifies refresh JWT token.
   */
  static verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
  }
}
