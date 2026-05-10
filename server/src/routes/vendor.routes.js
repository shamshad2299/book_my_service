import { Router } from 'express';
import { assignedBookings, updateAssignedBooking, vendorStats } from '../controllers/vendor.controller.js';
import { createService, listVendorServices, updateVendorService } from '../controllers/service.controller.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('vendor'));
router.get('/bookings', assignedBookings);
router.patch('/bookings/:id', updateAssignedBooking);
router.get('/stats', vendorStats);
router.route('/services').get(listVendorServices).post(createService);
router.patch('/services/:id', updateVendorService);

export default router;
