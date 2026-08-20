import nodemailer from 'nodemailer';

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  pool: true,
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT_MS || '8000'),
  greetingTimeout: parseInt(process.env.SMTP_GREETING_TIMEOUT_MS || '8000'),
  socketTimeout: parseInt(process.env.SMTP_SOCKET_TIMEOUT_MS || '15000'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const SENDER_NAME = 'TaleemXpress';
const SENDER_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || 'xpresstaleem@gmail.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_EMAIL_FROM = process.env.EMAIL_FROM || SENDER_EMAIL;

const delay = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const sendViaSmtp = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
    to,
    subject,
    html,
  });

  return { success: true, provider: 'smtp', messageId: info.messageId };
};

const sendViaResend = async ({ to, subject, html }) => {
  if (!RESEND_API_KEY) {
    return { success: false, provider: 'resend', error: 'RESEND_API_KEY is not configured' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${SENDER_NAME} <${RESEND_EMAIL_FROM}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `Resend API error (${response.status})`;
    return { success: false, provider: 'resend', error: errorMessage };
  }

  return { success: true, provider: 'resend', messageId: data?.id || null };
};

export const sendEmail = async ({ to, subject, html }) => {
  const smtpRetries = Math.max(1, parseInt(process.env.SMTP_RETRIES || '2'));
  const smtpRetryDelayMs = parseInt(process.env.SMTP_RETRY_DELAY_MS || '600');

  for (let attempt = 1; attempt <= smtpRetries; attempt++) {
    try {
      const result = await sendViaSmtp({ to, subject, html });
      console.log(`📧 Email sent via SMTP to ${to}: ${subject} (msgId: ${result.messageId})`);
      return result;
    } catch (err) {
      console.error(`❌ SMTP send failed (attempt ${attempt}/${smtpRetries}) for ${to}:`, err.message);
      if (attempt < smtpRetries) {
        await delay(smtpRetryDelayMs);
      }
    }
  }

  try {
    const fallback = await sendViaResend({ to, subject, html });
    if (fallback.success) {
      console.log(`📧 Email sent via Resend fallback to ${to}: ${subject} (msgId: ${fallback.messageId || 'n/a'})`);
      return fallback;
    }
    console.error(`❌ Resend fallback failed for ${to}:`, fallback.error);
    return fallback;
  } catch (err) {
    console.error(`❌ Failed to send email via all providers to ${to}:`, err.message);
    return { success: false, provider: 'none', error: err.message };
  }
};

// ─── Templates ─────────────────────────────────

const wrap = (content) => `
<div style="margin:0;padding:24px;background:#f0f0f0;">
  <div style="font-family:Poppins,'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(20,33,61,0.08);">
    <div style="padding:20px 24px;background:linear-gradient(135deg,#14213d,#1d2d50);">
      <div style="display:inline-block;background:#fca311;color:#14213d;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:6px 10px;border-radius:999px;">TaleemXpress</div>
      <p style="margin:10px 0 0;color:#ffffff;font-size:19px;font-weight:700;line-height:1.3;">Student Transport Updates</p>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.86);font-size:12px;line-height:1.5;">Fast, safe, and reliable travel for students.</p>
    </div>
    <div style="padding:24px;">
      ${content}
    </div>
    <div style="border-top:1px solid #e5e5e5;padding:14px 24px;background:#fafafa;">
      <p style="margin:0;color:#666666;font-size:11px;text-align:center;line-height:1.5;">This is an automated message from TaleemXpress. For support, reply to this email.</p>
    </div>
  </div>
</div>`;

const infoCard = (content) => `<div style="background:#ffffff;border:1px solid #e5e5e5;border-radius:16px;padding:16px 18px;box-shadow:0 8px 20px rgba(20,33,61,0.06);">${content}</div>`;
const infoRow = (label, value) => `<p style="margin:0 0 10px;color:#000000;font-size:14px;line-height:1.6;"><strong style="color:#14213d;">${label}:</strong> ${value}</p>`;
const bodyText = (text) => `<p style="margin:12px 0 0;color:#666666;font-size:13px;line-height:1.7;">${text}</p>`;

export const emailTemplates = {
  sendOTP: (otp) => ({
    subject: `Your TaleemXpress Verification Code: ${otp}`,
    html: wrap(`
      <p style="margin:0 0 10px;color:#000000;font-size:14px;line-height:1.6;">Your email verification code is:</p>
      <div style="text-align:center;padding:24px;background:#ffffff;border:1px solid #e5e5e5;border-radius:16px;margin:18px 0;box-shadow:0 8px 20px rgba(20,33,61,0.06);">
        <span style="font-size:42px;font-weight:800;letter-spacing:10px;color:#14213d;">${otp}</span>
      </div>
      <p style="margin:0;color:#666666;font-size:12px;line-height:1.6;">This code expires in <strong style="color:#14213d;">10 minutes</strong>. Do not share it.</p>
    `),
  }),

  passwordReset: (otp) => ({
    subject: `TaleemXpress Password Reset Code: ${otp}`,
    html: wrap(`
      <p style="margin:0 0 10px;color:#000000;font-size:14px;line-height:1.6;">Your password reset code is:</p>
      <div style="text-align:center;padding:24px;background:#ffffff;border:1px solid #e5e5e5;border-radius:16px;margin:18px 0;box-shadow:0 8px 20px rgba(20,33,61,0.06);">
        <span style="font-size:42px;font-weight:800;letter-spacing:10px;color:#14213d;">${otp}</span>
      </div>
      <p style="margin:0;color:#666666;font-size:12px;line-height:1.6;">Expires in <strong style="color:#14213d;">10 minutes</strong>.</p>
    `),
  }),

  bookingPending: (bookingRef, route) => ({
    subject: `Booking Registered - ${bookingRef} (Under Review)`,
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">Booking Registered</h2>
      ${infoCard(`${infoRow('Reference', bookingRef)}${infoRow('Route', route)}`)}
      ${bodyText('Your booking has been registered. Your payment screenshot is now under review by the admin.')}
      ${bodyText('You will receive another email once your seat is confirmed or if more information is needed.')}
    `),
  }),

  bookingApproved: (bookingRef, route) => ({
    subject: `✅ Booking Confirmed - ${bookingRef}`,
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">✅ Booking Confirmed</h2>
      ${infoCard(`${infoRow('Reference', bookingRef)}${infoRow('Route', route)}`)}
      ${bodyText('Your seat has been booked')}
    `),
  }),

  bookingRejected: (bookingRef, reason) => ({
    subject: `❌ Booking Rejected - ${bookingRef}`,
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">❌ Booking Rejected</h2>
      ${infoCard(`${infoRow('Reference', bookingRef)}${infoRow('Reason', reason || 'Payment not verified')}`)}
      ${bodyText('Please review your payment details and submit a new request if needed.')}
    `),
  }),

  newBookingAdminNotification: (studentName, bookingRef, route, seatNum) => ({
    subject: `📋 New Booking Pending - ${bookingRef}`,
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">📋 New Booking Pending</h2>
      ${infoCard(`${infoRow('Student', studentName)}${infoRow('Reference', bookingRef)}${infoRow('Route', route)}${infoRow('Seat', seatNum || 'Not selected')}`)}
      ${bodyText('Review this request in the admin portal.')}
    `),
  }),

  departureStatusChanged: (route, oldStatus, newStatus, departureTime) => ({
    subject: `🚌 Route Update - ${route} → ${newStatus}`,
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">🚌 Route Status Update</h2>
      ${infoCard(`${infoRow('Route', route)}${infoRow('Status', `${oldStatus} → ${newStatus}`)}${infoRow('Departure', departureTime)}`)}
    `),
  }),

  welcomeEmail: (name) => ({
    subject: 'Welcome to TaleemXpress!',
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:24px;line-height:1.3;">Welcome, ${name}! 🎉</h2>
      ${infoCard('<p style="margin:0;color:#000000;font-size:14px;line-height:1.7;">Your email is verified and your account is active. You can now start booking your rides.</p>')}
      ${bodyText('Head to your dashboard to browse upcoming departures.')}
    `),
  }),

  refundApproved: (bookingRef, amount) => ({
    subject: `💰 Refund Approved - ${bookingRef}`,
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">💰 Refund Approved</h2>
      ${infoCard(`${infoRow('Booking', bookingRef)}${infoRow('Amount', `PKR ${amount}`)}`)}
      ${bodyText('The approved refund has been credited to your TaleemXpress wallet.')}
    `),
  }),

  refundRejected: (bookingRef, reason) => ({
    subject: `Refund Update - ${bookingRef}`,
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">Refund Update</h2>
      ${infoCard(`${infoRow('Booking', bookingRef)}${infoRow('Reason', reason || 'Not approved')}`)}
    `),
  }),

  walletCredit: (amount, description) => ({
    subject: 'Wallet Credited - TaleemXpress',
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">Wallet Credited</h2>
      ${infoCard(`${infoRow('Amount', `PKR ${amount}`)}${infoRow('Reason', description)}`)}
    `),
  }),

  walletDebit: (amount, description) => ({
    subject: 'Wallet Updated - TaleemXpress',
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">Wallet Updated</h2>
      ${infoCard(`${infoRow('Amount', `PKR ${amount}`)}${infoRow('Reason', description)}`)}
    `),
  }),

  cancellationConfirmation: (bookingRef, refundAmount) => ({
    subject: `Booking Cancelled - ${bookingRef}`,
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">Booking Cancelled</h2>
      ${infoCard(`${infoRow('Reference', bookingRef)}${infoRow('Refund', `PKR ${refundAmount}`)}`)}
    `),
  }),

  passwordChanged: () => ({
    subject: 'Password Changed - TaleemXpress',
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">Password Changed</h2>
      ${infoCard('<p style="margin:0;color:#000000;font-size:14px;line-height:1.7;">Your password was successfully changed.</p>')}
      ${bodyText('If this was not you, please reset your password immediately and contact support.')}
    `),
  }),

  walletTopupSubmitted: (amount) => ({
    subject: `Top-up Request Submitted - PKR ${amount}`,
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">Top-up Request Submitted</h2>
      ${infoCard(infoRow('Amount', `PKR ${amount}`))}
      ${bodyText('Your top-up request has been submitted. Admin will review your payment screenshot and process it shortly.')}
    `),
  }),

  walletTopupRequest: (studentName, amount) => ({
    subject: `💰 New Top-up Request - PKR ${amount}`,
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">💰 New Top-up Request</h2>
      ${infoCard(`${infoRow('Student', studentName)}${infoRow('Amount', `PKR ${amount}`)}`)}
      ${bodyText('Review the payment screenshot in the admin portal.')}
    `),
  }),

  walletTopupApproved: (amount) => ({
    subject: `✅ Top-up Approved - PKR ${amount}`,
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">✅ Top-up Approved</h2>
      ${infoCard(infoRow('Amount', `PKR ${amount}`))}
      ${bodyText('Your top-up has been approved and your wallet has been credited.')}
    `),
  }),

  walletTopupRejected: (reason) => ({
    subject: `❌ Top-up Rejected - TaleemXpress`,
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:22px;line-height:1.3;">❌ Top-up Rejected</h2>
      ${infoCard(infoRow('Reason', reason || 'Payment screenshot could not be verified'))}
      ${bodyText('Please contact support or submit a new request with a clearer screenshot.')}
    `),
  }),

  notificationAnnouncement: (title, message) => ({
    subject: `📢 ${title} — TaleemXpress`,
    html: wrap(`
      <h2 style="margin:0 0 12px;color:#14213d;font-size:24px;line-height:1.3;">📢 ${title}</h2>
      <div style="background:#ffffff;padding:20px;border:1px solid #e5e5e5;border-radius:16px;box-shadow:0 8px 20px rgba(20,33,61,0.06);">
        <p style="color:#000000;line-height:1.7;white-space:pre-wrap;margin:0;">${message}</p>
      </div>
      <p style="margin:14px 0 0;color:#666666;font-size:12px;line-height:1.6;">This notification was sent by the TaleemXpress admin team.</p>
    `),
  }),

  privateBookingRequest: (data) => ({
    subject: `📋 Private Booking Request - ${data.name}`,
    html: wrap(`
      <h2 style="margin:0 0 16px;color:#14213d;font-size:24px;line-height:1.3;">📋 New Private Booking Request</h2>
      <table style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e5e5e5;border-radius:16px;overflow:hidden;box-shadow:0 8px 20px rgba(20,33,61,0.06);">
        ${[
          ['Name', data.name],
          ['Phone', data.phone],
          ['Vehicle Type', data.vehicleType],
          ['From', data.departureLocation],
          ['To', data.arrivalLocation],
          ['Date', data.date],
          ['Time', data.time],
          ['Trip Type', data.tripType],
          ...(data.duration ? [['Stay Duration', data.duration]] : []),
          ['Budget', `PKR ${data.budget}`],
        ].map(([label, value]) => `
          <tr>
            <td style="padding:10px 16px;border-bottom:1px solid #e5e5e5;font-size:13px;color:#666666;font-weight:700;width:140px;">${label}</td>
            <td style="padding:10px 16px;border-bottom:1px solid #e5e5e5;font-size:13px;color:#000000;">${value}</td>
          </tr>
        `).join('')}
      </table>
      <p style="margin:16px 0 0;color:#666666;font-size:12px;text-align:center;line-height:1.6;">Review this request in the admin panel.</p>
    `),
  }),
};

export default sendEmail;