import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users, refreshTokens } from '../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.middleware.js';
import { createOTP, verifyOTP } from '../services/otp.service.js';
import sendEmail, { emailTemplates } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const generateRefreshToken = () => {
  return uuidv4();
};

const queueEmail = ({ to, subject, html }) => {
  sendEmail({ to, subject, html }).catch((emailErr) => {
    console.error(`Background email failed for ${to}:`, emailErr?.message || emailErr);
  });
};

const queueVerificationOtpEmail = (userId, email) => {
  (async () => {
    const otp = await createOTP(userId, 'email_verify', 10);
    queueEmail({ to: email, ...emailTemplates.sendOTP(otp) });
  })().catch((otpErr) => {
    console.error(`Background OTP generation failed for ${email}:`, otpErr?.message || otpErr);
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone, preferredCity } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));

    const [user] = await db.insert(users).values({
      email,
      passwordHash,
      fullName,
      phone: phone || null,
      preferredCity: preferredCity || null,
      role: 'student',
    }).returning();

    // Auto generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(refreshTokens).values({ userId: user.id, token: refreshToken, expiresAt });

    // Do not block registration response on OTP generation or SMTP delivery.
    queueVerificationOtpEmail(user.id, email);

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: false,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // BLOCK login if email not verified
    if (!user.isEmailVerified) {
      // Send a new OTP automatically so the user can verify
      const otp = await createOTP(user.id, 'email_verify', 10);
      await sendEmail({ to: user.email, ...emailTemplates.sendOTP(otp) });

      return res.status(403).json({
        error: 'Email not verified',
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before logging in.',
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(refreshTokens).values({ userId: user.id, token: refreshToken, expiresAt });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const [stored] = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.token, refreshToken), gt(refreshTokens.expiresAt, new Date())));

    if (!stored) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, stored.userId));
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user);

    // Rotate refresh token
    await db.delete(refreshTokens).where(eq(refreshTokens.id, stored.id));
    const newRefreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(refreshTokens).values({ userId: user.id, token: newRefreshToken, expiresAt });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify Email
router.post('/verify-email', authenticate, async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;

    const verified = await verifyOTP(userId, otp, 'email_verify');
    if (!verified) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await db.update(users).set({ isEmailVerified: true, updatedAt: new Date() }).where(eq(users.id, userId));

    const [user] = await db.select({ fullName: users.fullName, email: users.email }).from(users).where(eq(users.id, userId));
    await sendEmail({ to: user.email, ...emailTemplates.welcomeEmail(user.fullName) });

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send verification OTP
router.post('/send-verification', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
    const otp = await createOTP(userId, 'email_verify', 10);
    await sendEmail({ to: user.email, ...emailTemplates.sendOTP(otp) });
    res.json({ message: 'Verification OTP sent' });
  } catch (err) {
    console.error('Send verification error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.json({ message: 'If email exists, a reset code has been sent' });
    }

    const otp = await createOTP(user.id, 'password_reset', 10);
    await sendEmail({ to: email, ...emailTemplates.passwordReset(otp) });

    res.json({ message: 'If email exists, a reset code has been sent' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    if (!userId || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const verified = await verifyOTP(userId, otp, 'password_reset');
    if (!verified) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS));
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));

    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
    await sendEmail({ to: user.email, ...emailTemplates.passwordChanged() });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
