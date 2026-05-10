import { BrevoClient } from '@getbrevo/brevo';
import {
  bookingAssignedTemplate,
  bookingCreatedTemplate,
  bookingStatusTemplate,
  otpTemplate
} from './mailTemplates.js';

let clientInstance = null;

/**
 * Validates and returns the Brevo Client
 * Throws error if API key is missing to prevent silent failures
 */
const getBrevoClient = () => {
  if (clientInstance) return clientInstance;

  const apiKey = process.env.BREVO_API_KEY?.trim();
  
  console.log('[Brevo Auth Check] Checking for API key...');
  if (!apiKey) {
    const errorMsg = 'CRITICAL: BREVO_API_KEY is not defined in environment variables.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (!apiKey.startsWith('xkeysib-')) {
    console.warn('[Brevo Auth Check] Warning: BREVO_API_KEY does not start with "xkeysib-".');
  } else {
    console.log('[Brevo Auth Check] API key format looks valid.');
  }

  clientInstance = new BrevoClient({ apiKey });
  return clientInstance;
};

const emailConfig = () => {
  const fromName = process.env.EMAIL_FROM_NAME || 'BookMyService';
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'noreply@bookmyservice.com';
  
  if (!fromAddress || fromAddress === 'noreply@bookmyservice.com') {
    console.warn(`[Brevo Config] Using default sender: ${fromAddress}. Ensure this is verified in Brevo.`);
  }

  return { fromName, fromAddress };
};

/**
 * Production-grade email sender with comprehensive logging
 */
export const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  if (!to) {
    console.error('[Brevo Skip] Recipient email is missing.');
    throw new Error('Email recipient (to) is required.');
  }

  const { fromName, fromAddress } = emailConfig();
  console.log(`[Brevo Attempt] Sending "${subject}" to ${to} from ${fromAddress}`);

  try {
    const client = getBrevoClient();

    const emailPayload = {
      subject,
      htmlContent: html,
      textContent: text || 'Please enable HTML to view this email.',
      sender: { name: fromName, email: fromAddress },
      to: [{ email: to }]
    };
    
    if (replyTo) {
      emailPayload.replyTo = { email: replyTo };
    }

    const response = await client.transactionalEmails.sendTransacEmail(emailPayload);
    
    console.log(`[Brevo Success] Email sent! MessageId: ${response.messageId || 'N/A'}`);
    return response;
  } catch (error) {
    console.error('[Brevo Failure] Error sending email:');
    if (error.response?.body) {
      console.error('Brevo API Error Body:', JSON.stringify(error.response.body, null, 2));
    }
    console.error('Stack Trace:', error.stack);
    
    // Throw error instead of silent failure
    throw new Error(`Failed to send email to ${to}: ${error.message}`);
  }
};

/**
 * Diagnostics tool to verify Brevo connection
 */
export const verifyEmailConnection = async () => {
  console.log('[Brevo Diagnostic] Verifying connection/account...');
  try {
    const client = getBrevoClient();
    const accountInfo = await client.account.getAccount();
    console.log(`[Brevo Diagnostic] Connection Successful. Account: ${accountInfo.email}`);
    return { success: true, email: accountInfo.email };
  } catch (error) {
    console.error('[Brevo Diagnostic] Connection Failed:');
    if (error.response?.body) {
      console.error('Brevo API Error Body:', JSON.stringify(error.response.body, null, 2));
    }
    return { success: false, error: error.message };
  }
};

export const sendOtpMail = async ({ email, otp, name }) => {
  const template = otpTemplate({ otp, name });
  return await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};

export const sendBookingCreatedMail = async ({ booking }) => {
  const template = bookingCreatedTemplate({ booking });
  return await sendEmail({
    to: booking.customer?.email,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};

export const sendBookingAssignedMail = async ({ booking }) => {
  const template = bookingAssignedTemplate({ booking });
  
  // Await both to ensure completion
  return await Promise.all([
    sendEmail({
      to: booking.customer?.email,
      subject: template.customer.subject,
      html: template.customer.html,
      text: template.customer.text
    }),
    sendEmail({
      to: booking.vendor?.email,
      subject: template.vendor.subject,
      html: template.vendor.html,
      text: template.vendor.text
    })
  ]);
};

export const sendBookingStatusMail = async ({ booking }) => {
  const template = bookingStatusTemplate({ booking });
  return await sendEmail({
    to: booking.customer?.email,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};
