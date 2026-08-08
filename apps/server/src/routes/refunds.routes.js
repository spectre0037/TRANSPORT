import { Router } from 'express';
import { db } from '../db/index.js';
import { refundRequests, bookings, departures, seats, users } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { creditWallet } from '../services/wallet.service.js';
import sendEmail, { emailTemplates } from '../services/email.service.js';

const router = Router();

// Get my refund requests
router.get('/my', authenticate, async (req, res) => {
  try {
    const requests = await db.select({
      id: refundRequests.id,
      amount: refundRequests.amount,
      reason: refundRequests.reason,
      status: refundRequests.status,
      createdAt: refundRequests.createdAt,
      booking: {
        bookingReference: bookings.bookingReference,
        departure: { route: departures.route },
      },
    })
    .from(refundRequests)
    .innerJoin(bookings, eq(refundRequests.bookingId, bookings.id))
    .innerJoin(departures, eq(bookings.departureId, departures.id))
    .where(eq(refundRequests.userId, req.user.id))
    .orderBy(desc(refundRequests.createdAt));

    res.json(requests);
  } catch (err) {
    console.error('Get my refunds error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all refund requests (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const requests = await db.select({
      id: refundRequests.id,
      amount: refundRequests.amount,
      reason: refundRequests.reason,
      status: refundRequests.status,
      adminNotes: refundRequests.adminNotes,
      createdAt: refundRequests.createdAt,
      user: { id: users.id, email: users.email, fullName: users.fullName },
      booking: {
        bookingReference: bookings.bookingReference,
        totalAmount: bookings.totalAmount,
        departure: { route: departures.route },
      },
    })
    .from(refundRequests)
    .innerJoin(users, eq(refundRequests.userId, users.id))
    .innerJoin(bookings, eq(refundRequests.bookingId, bookings.id))
    .innerJoin(departures, eq(bookings.departureId, departures.id))
    .orderBy(desc(refundRequests.createdAt));

    res.json(requests);
  } catch (err) {
    console.error('Get all refunds error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request refund
router.post('/', authenticate, async (req, res) => {
  try {
    const { bookingId, reason } = req.body;
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));

    if (!booking || booking.userId !== req.user.id) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.status !== 'approved') {
      return res.status(400).json({ error: 'Can only request refund for approved bookings' });
    }

    const [request] = await db.insert(refundRequests).values({
      userId: req.user.id,
      bookingId,
      amount: booking.totalAmount,
      reason,
    }).returning();

    res.status(201).json(request);
  } catch (err) {
    console.error('Request refund error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Process refund
router.put('/:id/process', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const [request] = await db.select().from(refundRequests).where(eq(refundRequests.id, req.params.id));
    if (!request) return res.status(404).json({ error: 'Refund request not found' });

    await db.update(refundRequests)
      .set({ status, adminNotes, processedBy: req.user.id, processedAt: new Date(), updatedAt: new Date() })
      .where(eq(refundRequests.id, req.params.id));

    if (status === 'approved') {
      await creditWallet(request.userId, parseFloat(request.amount), `Refund approved for booking`);
    }

    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, request.userId));
    const [booking] = await db.select({ bookingReference: bookings.bookingReference }).from(bookings)
      .where(eq(bookings.id, request.bookingId));

    if (status === 'approved') {
      await sendEmail({ to: user.email, ...emailTemplates.refundApproved(booking.bookingReference, request.amount) });
    } else {
      await sendEmail({ to: user.email, ...emailTemplates.refundRejected(booking.bookingReference, adminNotes) });
    }

    res.json({ message: 'Refund processed' });
  } catch (err) {
    console.error('Process refund error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
