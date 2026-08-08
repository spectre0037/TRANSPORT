import { Router } from 'express';
import { db } from '../db/index.js';
import { walletTopupRequests, users } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import sendEmail, { emailTemplates } from '../services/email.service.js';

const router = Router();

// Student: Submit top-up request
router.post('/', authenticate, async (req, res) => {
  try {
    const { amount, screenshotUrl } = req.body;
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Please enter a valid amount' });
    }
    if (!screenshotUrl) {
      return res.status(400).json({ error: 'Please upload a payment screenshot' });
    }

    const [request] = await db.insert(walletTopupRequests).values({
      userId: req.user.id,
      amount: parseFloat(amount).toString(),
      screenshotUrl,
    }).returning();

    // Notify admin
    try {
      const [student] = await db.select({ fullName: users.fullName, email: users.email }).from(users).where(eq(users.id, req.user.id));
      const [admin] = await db.select({ email: users.email }).from(users).where(eq(users.role, 'admin'));
      if (admin) {
        await sendEmail({
          to: admin.email,
          ...emailTemplates.walletTopupRequest(student.fullName, amount),
        });
      }
      // Notify student
      await sendEmail({
        to: student.email,
        ...emailTemplates.walletTopupSubmitted(amount),
      });
    } catch (emailErr) { console.error('Top-up email error:', emailErr); }

    res.status(201).json({ ...request, message: 'Top-up request submitted. Admin will review shortly.' });
  } catch (err) {
    console.error('Top-up request error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student: Get my top-up requests
router.get('/my', authenticate, async (req, res) => {
  try {
    const requests = await db.select().from(walletTopupRequests)
      .where(eq(walletTopupRequests.userId, req.user.id))
      .orderBy(desc(walletTopupRequests.createdAt));
    res.json(requests);
  } catch (err) {
    console.error('Get my top-ups error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all top-up requests
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const requests = await db.select({
      id: walletTopupRequests.id,
      amount: walletTopupRequests.amount,
      screenshotUrl: walletTopupRequests.screenshotUrl,
      status: walletTopupRequests.status,
      adminNotes: walletTopupRequests.adminNotes,
      createdAt: walletTopupRequests.createdAt,
      user: { id: users.id, fullName: users.fullName, email: users.email },
    })
    .from(walletTopupRequests)
    .innerJoin(users, eq(walletTopupRequests.userId, users.id))
    .orderBy(desc(walletTopupRequests.createdAt));
    res.json(requests);
  } catch (err) {
    console.error('Get all top-ups error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Approve or reject top-up
router.put('/:id/process', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, adminNotes, amount } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const [request] = await db.select().from(walletTopupRequests).where(eq(walletTopupRequests.id, req.params.id));
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const approvedAmount = status === 'approved' ? parseFloat(amount || request.amount) : 0;

    await db.update(walletTopupRequests).set({
      status,
      adminNotes: adminNotes || null,
      processedBy: req.user.id,
      updatedAt: new Date(),
    }).where(eq(walletTopupRequests.id, req.params.id));

    // If approved, credit the student's wallet
    if (status === 'approved') {
      const { creditWallet } = await import('../services/wallet.service.js');
      await creditWallet(request.userId, approvedAmount, `Wallet top-up approved (request #${request.id.slice(0, 8)})`);
    }

    // Email student
    try {
      const [student] = await db.select({ email: users.email }).from(users).where(eq(users.id, request.userId));
      if (student) {
        if (status === 'approved') {
          await sendEmail({ to: student.email, ...emailTemplates.walletTopupApproved(approvedAmount) });
        } else {
          await sendEmail({ to: student.email, ...emailTemplates.walletTopupRejected(adminNotes) });
        }
      }
    } catch (emailErr) { console.error('Top-up process email error:', emailErr); }

    res.json({ message: `Top-up ${status}`, approvedAmount });
  } catch (err) {
    console.error('Process top-up error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
