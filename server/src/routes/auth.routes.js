import { Router } from 'express';
import {
  adminLogin,
  customerLoginOtp,
  me,
  requestCustomerOtp,
  vendorLogin,
  vendorSignup,
  verifyCustomerOtp
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/customer/request-otp', requestCustomerOtp);
router.post('/customer/login-otp', customerLoginOtp);
router.post('/customer/verify-otp', verifyCustomerOtp);
router.post('/vendor/signup', vendorSignup);
router.post('/vendor/login', vendorLogin);
router.post('/admin/login', adminLogin);
router.get('/me', protect, me);

export default router;
