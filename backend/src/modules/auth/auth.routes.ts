import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { loginSchema, refreshTokenSchema } from './auth.validation.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/login', validateRequest({ body: loginSchema }), AuthController.login);
router.post('/refresh', validateRequest({ body: refreshTokenSchema }), AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);

export default router;
