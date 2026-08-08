import { db } from '../db/index.js';
import { walletTransactions, wallets, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import sendEmail, { emailTemplates } from './email.service.js';

export const getWalletBalance = async (userId) => {
  const [user] = await db.select({ walletBalance: users.walletBalance }).from(users).where(eq(users.id, userId));
  return user ? parseFloat(user.walletBalance) : 0;
};

export const creditWallet = async (userId, amount, description, referenceId = null) => {
  // Ensure wallet record exists
  const [existing] = await db.select().from(wallets).where(eq(wallets.userId, userId));
  if (!existing) {
    await db.insert(wallets).values({ userId, balance: '0.00' });
  }

  await db.update(users)
    .set({ walletBalance: sql`${users.walletBalance} + ${amount}`, updatedAt: new Date() })
    .where(eq(users.id, userId));

  await db.update(wallets)
    .set({ balance: sql`${wallets.balance} + ${amount}`, updatedAt: new Date() })
    .where(eq(wallets.userId, userId));

  await db.insert(walletTransactions).values({
    userId,
    type: 'credit',
    amount: amount.toString(),
    description,
    referenceId,
  });

  try {
    const [user] = await db.select({ email: users.email, fullName: users.fullName })
      .from(users).where(eq(users.id, userId));
    if (user) {
      await sendEmail({
        to: user.email,
        ...emailTemplates.walletCredit(amount, description),
      });
    }
  } catch (emailErr) {
    console.error('Email send failed:', emailErr);
  }
};

export const debitWallet = async (userId, amount, description, referenceId = null) => {
  await db.update(users)
    .set({ walletBalance: sql`${users.walletBalance} - ${amount}`, updatedAt: new Date() })
    .where(eq(users.id, userId));

  await db.update(wallets)
    .set({ balance: sql`${wallets.balance} - ${amount}`, updatedAt: new Date() })
    .where(eq(wallets.userId, userId));

  await db.insert(walletTransactions).values({
    userId,
    type: 'debit',
    amount: amount.toString(),
    description,
    referenceId,
  });

  try {
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
    if (user) {
      await sendEmail({
        to: user.email,
        ...emailTemplates.walletDebit(amount, description),
      });
    }
  } catch (emailErr) {
    console.error('Email send failed:', emailErr);
  }
};

export const getTransactions = async (userId, limit = 50) => {
  return db.select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId))
    .orderBy(walletTransactions.createdAt)
    .limit(limit);
};
