import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticate, requireRoles } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  listUsersQuerySchema,
} from './user.validation.js';

const router = Router();

router.use(authenticate);

// Password change for authenticated user
router.post(
  '/change-password',
  validateRequest({ body: changePasswordSchema }),
  UserController.changePassword
);

// User Directory
router.get(
  '/',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  validateRequest({ query: listUsersQuerySchema }),
  UserController.listUsers
);

router.post(
  '/',
  requireRoles('SUPER_ADMIN'),
  validateRequest({ body: createUserSchema }),
  UserController.createUser
);

router.get(
  '/:id',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  UserController.getUser
);

router.put(
  '/:id',
  requireRoles('SUPER_ADMIN'),
  validateRequest({ body: updateUserSchema }),
  UserController.updateUser
);

router.delete(
  '/:id',
  requireRoles('SUPER_ADMIN'),
  UserController.deleteUser
);

export default router;
