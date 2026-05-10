import nodemailer from 'nodemailer';
import {
  bookingAssignedTemplate,
  bookingCreatedTemplate,
  bookingStatusTemplate,
  otpTemplate
} from './mailTemplates.js';

let transporter;

const emailConfig = () => {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
  const secure = (process.env.EMAIL_SECURE || process.env.SMTP_SECURE || 'false') === 'true';
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const fromName = process.env.EMAIL_FROM_NAME || 'BookMyService';
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || process.env.MAIL_FROM || user;

  return { host, port, secure, user, pass, fromName, fromAddress };
};

const isEmailConfigured = () => {
  const { host, user, pass } = emailConfig();
  return Boolean(host && user && pass);
};

const getTransporter = () => {
  if (transporter) return transporter;

  const { host, port, secure, user, pass } = emailConfig();
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  return transporter;
};

const formatFrom = () => {
  const { fromName, fromAddress } = emailConfig();
  if (!fromAddress) return undefined;
  return fromAddress.includes('<') ? fromAddress : `"${fromName}" <${fromAddress}>`;
};

export const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  if (!to) return null;

  if (!isEmailConfigured()) {
    console.log(`[email skipped] ${subject} -> ${to}`);
    return null;
  }

  return getTransporter().sendMail({
    from: formatFrom(),
    to,
    subject,
    html,
    text,
    replyTo
  });
};

export const verifyEmailConnection = async () => {
  if (!isEmailConfigured()) return false;
  await getTransporter().verify();
  return true;
};

export const sendOtpMail = async ({ email, otp, name }) => {
  const template = otpTemplate({ otp, name });
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};

export const sendBookingCreatedMail = async ({ booking }) => {
  const template = bookingCreatedTemplate({ booking });
  return sendEmail({
    to: booking.customer?.email,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};

export const sendBookingAssignedMail = async ({ booking }) => {
  const template = bookingAssignedTemplate({ booking });
  return Promise.all([
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
  return sendEmail({
    to: booking.customer?.email,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};
