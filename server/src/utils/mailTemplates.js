const escapeHtml = (value = '') =>
  value
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatDateTime = (value) => {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: process.env.EMAIL_TIMEZONE || 'Asia/Kolkata'
  }).format(new Date(value));
};

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: process.env.EMAIL_CURRENCY || 'INR',
    maximumFractionDigits: 0
  }).format(Number(amount || 0));

const statusLabel = (status = '') =>
  ({
    pending: 'Pending',
    assigned: 'Assigned',
    accepted: 'Accepted',
    rejected: 'Rejected',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  })[status] || status;

const baseTemplate = ({ title, preview, children }) => {
  const safeTitle = escapeHtml(title);
  const safePreview = escapeHtml(preview);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;background:#f6f7fb;color:#18202f;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;">${safePreview}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e6e9f0;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:22px 24px;background:#111827;color:#ffffff;font-size:20px;font-weight:700;">BookMyService</td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:#111827;">${safeTitle}</h1>
                ${children}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:13px;line-height:1.5;">
                This is an automated email from BookMyService.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const detailRow = (label, value) => `
  <tr>
    <td style="padding:8px 0;color:#6b7280;width:140px;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;color:#111827;font-weight:600;">${escapeHtml(value)}</td>
  </tr>`;

const bookingDetails = (booking) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eef0f4;border-bottom:1px solid #eef0f4;margin:18px 0;padding:8px 0;font-size:14px;line-height:1.5;">
    ${detailRow('Service', booking.service?.title || 'Service')}
    ${detailRow('Schedule', formatDateTime(booking.scheduledAt))}
    ${detailRow('Address', booking.address || 'Not provided')}
    ${detailRow('Amount', formatAmount(booking.amount))}
    ${detailRow('Status', statusLabel(booking.status))}
  </table>`;

export const otpTemplate = ({ otp, name }) => {
  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hi,';
  const html = baseTemplate({
    title: 'Your verification code',
    preview: `Your OTP is ${otp}. It expires in 10 minutes.`,
    children: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${greeting}</p>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.6;">Use this code to verify your BookMyService account. It expires in 10 minutes.</p>
      <div style="letter-spacing:8px;font-size:32px;font-weight:700;color:#111827;background:#f3f4f6;border-radius:8px;padding:16px 18px;text-align:center;">${escapeHtml(otp)}</div>
      <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">If you did not request this, you can ignore this email.</p>`
  });

  return {
    subject: 'Your BookMyService OTP',
    html,
    text: `Your BookMyService OTP is ${otp}. It expires in 10 minutes.`
  };
};

export const bookingCreatedTemplate = ({ booking }) => ({
  subject: 'Booking request received',
  html: baseTemplate({
    title: 'Booking request received',
    preview: 'Your booking request has been received.',
    children: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hi ${escapeHtml(booking.customer?.name || 'there')}, your booking request has been received. We will update you when a vendor is assigned.</p>
      ${bookingDetails(booking)}`
  }),
  text: `Your booking request for ${booking.service?.title || 'service'} has been received. Scheduled: ${formatDateTime(
    booking.scheduledAt
  )}.`
});

export const bookingAssignedTemplate = ({ booking }) => ({
  customer: {
    subject: 'Vendor assigned to your booking',
    html: baseTemplate({
      title: 'Vendor assigned',
      preview: 'A vendor has been assigned to your booking.',
      children: `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hi ${escapeHtml(
          booking.customer?.name || 'there'
        )}, ${escapeHtml(booking.vendor?.businessName || booking.vendor?.name || 'A vendor')} has been assigned to your booking.</p>
        ${bookingDetails(booking)}`
    }),
    text: `Vendor assigned: ${booking.vendor?.businessName || booking.vendor?.name || 'Vendor'}.`
  },
  vendor: {
    subject: 'New booking assigned',
    html: baseTemplate({
      title: 'New booking assigned',
      preview: 'A booking has been assigned to you.',
      children: `
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hi ${escapeHtml(
          booking.vendor?.name || 'there'
        )}, a booking has been assigned to you.</p>
        ${bookingDetails(booking)}
        <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">Customer: ${escapeHtml(
          booking.customer?.name || 'Customer'
        )} ${booking.customer?.phone ? `(${escapeHtml(booking.customer.phone)})` : ''}</p>`
    }),
    text: `New booking assigned for ${booking.service?.title || 'service'} on ${formatDateTime(booking.scheduledAt)}.`
  }
});

export const bookingStatusTemplate = ({ booking }) => ({
  subject: `Booking ${statusLabel(booking.status).toLowerCase()}`,
  html: baseTemplate({
    title: `Booking ${statusLabel(booking.status).toLowerCase()}`,
    preview: `Your booking status is now ${statusLabel(booking.status)}.`,
    children: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hi ${escapeHtml(
        booking.customer?.name || 'there'
      )}, your booking status is now <strong>${escapeHtml(statusLabel(booking.status))}</strong>.</p>
      ${bookingDetails(booking)}`
  }),
  text: `Your booking status is now ${statusLabel(booking.status)}.`
});
