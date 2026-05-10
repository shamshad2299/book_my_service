import { Router } from 'express';
import {
  adminOverview,
  assignVendor,
  listBookings,
  listUsers,
  listVendors,
  updateBookingStatus
} from '../controllers/admin.controller.js';
import { authorize, protect } from '../middleware/auth.js';
import { createService } from '../controllers/service.controller.js';

const router = Router();

router.use(protect, authorize('admin'));
router.get('/overview', adminOverview);
router.get('/users', listUsers);
router.get('/vendors', listVendors);
router.get('/bookings', listBookings);
router.patch('/bookings/:id/assign', assignVendor);
router.patch('/bookings/:id/status', updateBookingStatus);
router.post('/services', createService);

export default router;
