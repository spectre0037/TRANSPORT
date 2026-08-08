import nodemailer from 'nodemailer';

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const SENDER_NAME = 'TaleemXpress';
const SENDER_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || 'xpresstaleem@gmail.com';

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}: ${subject} (msgId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
    console.error(err);
    return { success: false, error: err.message };
  }
};

// ─── Templates ─────────────────────────────────

const wrap = (content) => `
<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#fef7f4;border-radius:16px;">
  <div style="text-align:center;margin-bottom:16px;">
    <span style="font-size:20px;font-weight:bold;color:#7C1648;">🚌 TaleemXpress</span>
  </div>
  ${content}
  <p style="color:#999;font-size:11px;text-align:center;margin-top:24px;">This is an automated message from TaleemXpress.</p>
</div>`;

export const emailTemplates = {
  sendOTP: (otp) => ({
    subject: `Your TaleemXpress Verification Code: ${otp}`,
    html: wrap(`
      <p style="color:#333;font-size:14px;">Your email verification code is:</p>
      <div style="text-align:center;padding:24px;background:white;border-radius:12px;margin:20px 0;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
        <span style="font-size:42px;font-weight:bold;letter-spacing:10px;color:#7C1648;">${otp}</span>
      </div>
      <p style="color:#666;font-size:12px;">This code expires in <strong>10 minutes</strong>. Do not share it.</p>
    `),
  }),

  passwordReset: (otp) => ({
    subject: `TaleemXpress Password Reset Code: ${otp}`,
    html: wrap(`
      <p style="color:#333;font-size:14px;">Your password reset code is:</p>
      <div style="text-align:center;padding:24px;background:white;border-radius:12px;margin:20px 0;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
        <span style="font-size:42px;font-weight:bold;letter-spacing:10px;color:#7C1648;">${otp}</span>
      </div>
      <p style="color:#666;font-size:12px;">Expires in 10 minutes.</p>
    `),
  }),

  bookingPending: (bookingRef, route) => ({
    subject: `Booking Registered - ${bookingRef} (Under Review)`,
    html: wrap(`<p><strong>Reference:</strong> ${bookingRef}</p><p><strong>Route:</strong> ${route}</p><p>Your booking has been registered. Your payment screenshot is now <strong>under review</strong> by the admin.</p><p>You will receive an email once your seat is confirmed or if more information is needed.</p>`),
  }),

  bookingApproved: (bookingRef, route) => ({
    subject: `✅ Booking Confirmed - ${bookingRef}`,
    html: wrap(`<p><strong>Reference:</strong> ${bookingRef}</p><p><strong>Route:</strong> ${route}</p><p>Your seat is confirmed! Safe travels.</p>`),
  }),

  bookingRejected: (bookingRef, reason) => ({
    subject: `❌ Booking Rejected - ${bookingRef}`,
    html: wrap(`<p><strong>Reference:</strong> ${bookingRef}</p><p><strong>Reason:</strong> ${reason || 'Payment not verified'}</p>`),
  }),

  newBookingAdminNotification: (studentName, bookingRef, route, seatNum) => ({
    subject: `📋 New Booking Pending - ${bookingRef}`,
    html: wrap(`<p><strong>Student:</strong> ${studentName}</p><p><strong>Reference:</strong> ${bookingRef}</p><p><strong>Route:</strong> ${route}</p><p><strong>Seat:</strong> ${seatNum}</p><p>Review in admin portal.</p>`),
  }),

  departureStatusChanged: (route, oldStatus, newStatus, departureTime) => ({
    subject: `🚌 Route Update - ${route} → ${newStatus}`,
    html: wrap(`<p><strong>Route:</strong> ${route}</p><p><strong>Status:</strong> ${oldStatus} → <strong>${newStatus}</strong></p><p><strong>Departure:</strong> ${departureTime}</p>`),
  }),

  welcomeEmail: (name) => ({
    subject: 'Welcome to TaleemXpress!',
    html: wrap(`<h2>Welcome, ${name}! 🎉</h2><p>Your email is verified. Book your transport now!</p>`),
  }),

  refundApproved: (bookingRef, amount) => ({
    subject: `💰 Refund Approved - ${bookingRef}`,
    html: wrap(`<p><strong>Booking:</strong> ${bookingRef}</p><p><strong>Amount:</strong> PKR ${amount}</p><p>Credited to your wallet.</p>`),
  }),

  refundRejected: (bookingRef, reason) => ({
    subject: `Refund Update - ${bookingRef}`,
    html: wrap(`<p><strong>Reason:</strong> ${reason || 'Not approved'}</p>`),
  }),

  walletCredit: (amount, description) => ({
    subject: 'Wallet Credited - TaleemXpress',
    html: wrap(`<p><strong>Amount:</strong> PKR ${amount}</p><p><strong>Reason:</strong> ${description}</p>`),
  }),

  walletDebit: (amount, description) => ({
    subject: 'Wallet Updated - TaleemXpress',
    html: wrap(`<p><strong>Amount:</strong> PKR ${amount}</p><p><strong>Reason:</strong> ${description}</p>`),
  }),

  cancellationConfirmation: (bookingRef, refundAmount) => ({
    subject: `Booking Cancelled - ${bookingRef}`,
    html: wrap(`<p><strong>Reference:</strong> ${bookingRef}</p><p><strong>Refund:</strong> PKR ${refundAmount}</p>`),
  }),

  passwordChanged: () => ({
    subject: 'Password Changed - TaleemXpress',
    html: wrap('<p>Your password was successfully changed.</p>'),
  }),

  walletTopupSubmitted: (amount) => ({
    subject: `Top-up Request Submitted - PKR ${amount}`,
    html: wrap(`<p><strong>Amount:</strong> PKR ${amount}</p><p>Your top-up request has been submitted. Admin will review your payment screenshot and process it shortly.</p>`),
  }),

  walletTopupRequest: (studentName, amount) => ({
    subject: `💰 New Top-up Request - PKR ${amount}`,
    html: wrap(`<p><strong>Student:</strong> ${studentName}</p><p><strong>Amount:</strong> PKR ${amount}</p><p>Review the payment screenshot in admin portal.</p>`),
  }),

  walletTopupApproved: (amount) => ({
    subject: `✅ Top-up Approved - PKR ${amount}`,
    html: wrap(`<p><strong>Amount:</strong> PKR ${amount}</p><p>Your top-up has been approved and your wallet has been credited.</p>`),
  }),

  walletTopupRejected: (reason) => ({
    subject: `❌ Top-up Rejected - TaleemXpress`,
    html: wrap(`<p><strong>Reason:</strong> ${reason || 'Payment screenshot could not be verified'}</p><p>Please contact support or try again.</p>`),
  }),

  notificationAnnouncement: (title, message) => ({
    subject: `📢 ${title} — TaleemXpress`,
    html: wrap(`
      <h2 style="color:#7C1648;margin-bottom:12px;">📢 ${title}</h2>
      <div style="background:white;padding:20px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
        <p style="color:#333;line-height:1.6;white-space:pre-wrap;margin:0;">${message}</p>
      </div>
      <p style="color:#666;font-size:12px;margin-top:16px;">This notification was sent by the TaleemXpress admin team.</p>
    `),
  }),

  privateBookingRequest: (data) => ({
    subject: `📋 Private Booking Request - ${data.name}`,
    html: wrap(`
      <h2 style="color:#7C1648;margin-bottom:16px;">📋 New Private Booking Request</h2>
      <table style="width:100%;border-collapse:collapse;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
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
            <td style="padding:10px 16px;border-bottom:1px solid #E8DDD5;font-size:13px;color:#8A7A82;font-weight:600;width:120px;">${label}</td>
            <td style="padding:10px 16px;border-bottom:1px solid #E8DDD5;font-size:13px;color:#2D1B27;">${value}</td>
          </tr>
        `).join('')}
      </table>
      <p style="color:#999;font-size:11px;text-align:center;margin-top:20px;">Review this request in the admin panel.</p>
    `),
  }),
};

export default sendEmail;