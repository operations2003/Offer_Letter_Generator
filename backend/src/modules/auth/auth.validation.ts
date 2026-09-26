import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Valid email address is required').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
