import crypto from 'crypto';
import { db } from '../db/index.js';
import { otpTokens } from '../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';

export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const createOTP = async (userId, type, expiresInMin = 10) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + expiresInMin * 60 * 1000);

  await db.insert(otpTokens).values({
    userId,
    otp,
    type,
    expiresAt,
  });

  return otp;
};

export const verifyOTP = async (userId, otp, type) => {
  const [token] = await db
    .select()
    .from(otpTokens)
    .where(
      and(
        eq(otpTokens.userId, userId),
        eq(otpTokens.otp, otp),
        eq(otpTokens.type, type),
        eq(otpTokens.used, false),
        gt(otpTokens.expiresAt, new Date())
      )
    )
    .orderBy(otpTokens.createdAt)
    .limit(1);

  if (!token) return false;

  await db.update(otpTokens)
    .set({ used: true })
    .where(eq(otpTokens.id, token.id));

  return true;
};
