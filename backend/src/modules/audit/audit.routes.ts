import { Router } from 'express';
import { AuditController } from './audit.controller.js';
import { authenticate, requireRoles } from '../../middleware/auth.js';

const router = Router();

// Only SUPER_ADMIN, HR_MANAGER, and AUDITOR can access the audit ledger
router.use(authenticate);
router.use(requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'AUDITOR'));

router.get('/', AuditController.listLogs);

export default router;
