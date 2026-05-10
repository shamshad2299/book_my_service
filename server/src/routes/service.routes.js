import { Router } from 'express';
import { createService, listServices } from '../controllers/service.controller.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.get('/', listServices);
router.post('/', protect, authorize('admin', 'vendor'), createService);

export default router;
