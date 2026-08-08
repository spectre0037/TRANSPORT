import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { neon } from '@neondatabase/serverless';

const router = Router();

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        phone: users.phone,
        preferredCity: users.preferredCity,
        role: users.role,
        isEmailVerified: users.isEmailVerified,
        avatarUrl: users.avatarUrl,
        walletBalance: users.walletBalance,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const { fullName, phone, preferredCity, avatarUrl } = req.body;
    await db.update(users)
      .set({
        ...(fullName && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(preferredCity !== undefined && { preferredCity }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.user.id));

    const [user] = await db.select({
      id: users.id, email: users.email, fullName: users.fullName,
      phone: users.phone, preferredCity: users.preferredCity,
      role: users.role, isEmailVerified: users.isEmailVerified,
      avatarUrl: users.avatarUrl, walletBalance: users.walletBalance,
    }).from(users).where(eq(users.id, req.user.id));

    res.json(user);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords required' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.user.id));
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS));
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, req.user.id));

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all users
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id, email: users.email, fullName: users.fullName,
      phone: users.phone, preferredCity: users.preferredCity,
      role: users.role, isEmailVerified: users.isEmailVerified,
      walletBalance: users.walletBalance, createdAt: users.createdAt,
    }).from(users);
    res.json(allUsers);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Update user role
router.put('/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, req.params.id));
    res.json({ message: 'Role updated' });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Adjust wallet balance
router.post('/:id/wallet-adjust', authenticate, requireAdmin, async (req, res) => {
  try {
    const { amount, description } = req.body;
    const { creditWallet, debitWallet } = await import('../services/wallet.service.js');
    if (amount > 0) {
      await creditWallet(req.params.id, amount, description || 'Admin adjustment');
    } else if (amount < 0) {
      await debitWallet(req.params.id, Math.abs(amount), description || 'Admin adjustment');
    }
    res.json({ message: 'Wallet adjusted' });
  } catch (err) {
    console.error('Wallet adjust error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Delete user (cascade removes bookings, seats, etc.)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    const userId = req.params.id;
    const sql = neon(process.env.DATABASE_URL);
    await sql`DELETE FROM refund_requests WHERE user_id = ${userId}::uuid`;
    await sql`DELETE FROM wallet_transactions WHERE user_id = ${userId}::uuid`;
    await sql`DELETE FROM wallets WHERE user_id = ${userId}::uuid`;
    await sql`DELETE FROM bookings WHERE user_id = ${userId}::uuid`;
    await sql`UPDATE seats SET is_booked = false, booked_by = NULL, gender = NULL WHERE booked_by = ${userId}::uuid`;
    await sql`DELETE FROM refresh_tokens WHERE user_id = ${userId}::uuid`;
    await sql`DELETE FROM otp_tokens WHERE user_id = ${userId}::uuid`;
    await sql`DELETE FROM users WHERE id = ${userId}::uuid`;
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
