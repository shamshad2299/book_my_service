import { Router } from 'express';
import { createBooking, myBookings, rateBooking } from '../controllers/booking.controller.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('customer'));
router.route('/').post(createBooking).get(myBookings);
router.patch('/:id/rating', rateBooking);

export default router;
