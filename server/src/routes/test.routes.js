import express from 'express';
import { verifyEmailConnection, sendEmail } from '../utils/mail.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = express.Router();

/**
 * Diagnostic route to test Brevo integration
 */
router.get('/test-brevo', asyncHandler(async (req, res) => {
  console.log('[Test Route] Starting Brevo diagnostic test...');
  
  const connection = await verifyEmailConnection();
  
  if (!connection.success) {
    return res.status(500).json({
      success: false,
      stage: 'connection_test',
      error: connection.error,
      env_check: {
        has_api_key: !!process.env.BREVO_API_KEY,
        api_key_prefix: process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.substring(0, 8) + '...' : 'none',
        from_email: process.env.EMAIL_FROM_ADDRESS || 'not set'
      }
    });
  }

  // If query param 'send' is present, try sending a real test email
  let sendResult = null;
  const testEmail = req.query.email || connection.email;

  if (req.query.send === 'true') {
    try {
      sendResult = await sendEmail({
        to: testEmail,
        subject: 'Brevo Test Email - BookMyService',
        html: '<h1>Brevo is working!</h1><p>This is a test email from your BookMyService deployment.</p>',
        text: 'Brevo is working! This is a test email from your BookMyService deployment.'
      });
    } catch (error) {
      sendResult = { error: error.message };
    }
  }

  res.json({
    success: true,
    message: 'Brevo configuration is valid.',
    account: connection.email,
    test_send: sendResult,
    recipient: req.query.send === 'true' ? testEmail : 'Pass ?send=true&email=your@email.com to test sending'
  });
}));

export default router;
