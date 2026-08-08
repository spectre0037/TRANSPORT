import { Router } from 'express';
import { db } from '../db/index.js';
import { bookings, seats, departures, users } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import sendEmail, { emailTemplates } from '../services/email.service.js';
import { creditWallet, debitWallet, getWalletBalance } from '../services/wallet.service.js';

const router = Router();

const generateBookingRef = () => {
  return `TXP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
};

// Get my UPCOMING bookings (excludes past departures)
router.get('/my', authenticate, async (req, res) => {
  try {
    const now = new Date();

    const myBookings = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        paymentScreenshotUrl: bookings.paymentScreenshotUrl,
        totalAmount: bookings.totalAmount,
        bookingReference: bookings.bookingReference,
        notes: bookings.notes,
        gender: bookings.gender,
        createdAt: bookings.createdAt,
        departure: {
          id: departures.id,
          route: departures.route,
          departureDate: departures.departureDate,
          departureTime: departures.departureTime,
          fromCity: departures.fromCity,
          toCity: departures.toCity,
          status: departures.status,
        },
        seat: {
          id: seats.id,
          seatNumber: seats.seatNumber,
          row: seats.row,
          column: seats.column,
        },
      })
      .from(bookings)
      .innerJoin(departures, eq(bookings.departureId, departures.id))
      .innerJoin(seats, eq(bookings.seatId, seats.id))
      .where(eq(bookings.userId, req.user.id))
      .orderBy(desc(bookings.createdAt));

    // Filter out bookings for past departures
    const upcomingBookings = myBookings.filter(booking => {
      const depDate = new Date(booking.departure.departureDate);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const depDay = new Date(depDate.getFullYear(), depDate.getMonth(), depDate.getDate());

      // Future date = include
      if (depDay > today) return true;

      // Today = check time
      if (depDay.getTime() === today.getTime()) {
        const [hours, minutes] = booking.departure.departureTime.split(':').map(Number);
        const depDateTime = new Date(depDate);
        depDateTime.setHours(hours, minutes, 0, 0);
        return depDateTime > now;
      }

      return false;
    });

    res.json(upcomingBookings);
  } catch (err) {
    console.error('Get my bookings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get my booking HISTORY (past departures only)
router.get('/my/history', authenticate, async (req, res) => {
  try {
    const now = new Date();

    const allBookings = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        totalAmount: bookings.totalAmount,
        bookingReference: bookings.bookingReference,
        notes: bookings.notes,
        gender: bookings.gender,
        createdAt: bookings.createdAt,
        departure: {
          id: departures.id,
          route: departures.route,
          departureDate: departures.departureDate,
          departureTime: departures.departureTime,
          fromCity: departures.fromCity,
          toCity: departures.toCity,
          status: departures.status,
        },
        seat: {
          id: seats.id,
          seatNumber: seats.seatNumber,
          row: seats.row,
          column: seats.column,
        },
      })
      .from(bookings)
      .innerJoin(departures, eq(bookings.departureId, departures.id))
      .innerJoin(seats, eq(bookings.seatId, seats.id))
      .where(eq(bookings.userId, req.user.id))
      .orderBy(desc(bookings.createdAt));

    // Filter to only past departures
    const pastBookings = allBookings.filter(booking => {
      const depDate = new Date(booking.departure.departureDate);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const depDay = new Date(depDate.getFullYear(), depDate.getMonth(), depDate.getDate());

      // Past date = include in history
      if (depDay < today) return true;

      // Today = check if time has passed
      if (depDay.getTime() === today.getTime()) {
        const [hours, minutes] = booking.departure.departureTime.split(':').map(Number);
        const depDateTime = new Date(depDate);
        depDateTime.setHours(hours, minutes, 0, 0);
        return depDateTime <= now;
      }

      return false;
    });

    res.json(pastBookings);
  } catch (err) {
    console.error('Get booking history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bookings (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const allBookings = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        paymentStatus: bookings.paymentStatus,
        totalAmount: bookings.totalAmount,
        bookingReference: bookings.bookingReference,
        gender: bookings.gender,
        paymentScreenshotUrl: bookings.paymentScreenshotUrl,
        createdAt: bookings.createdAt,
        user: { id: users.id, email: users.email, fullName: users.fullName, phone: users.phone },
        departure: { id: departures.id, route: departures.route, departureDate: departures.departureDate },
        seat: { id: seats.id, seatNumber: seats.seatNumber, row: seats.row },
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .innerJoin(departures, eq(bookings.departureId, departures.id))
      .innerJoin(seats, eq(bookings.seatId, seats.id))
      .orderBy(desc(bookings.createdAt));

    res.json(allBookings);
  } catch (err) {
    console.error('Get all bookings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════
// CREATE BOOKING — with payment method choice
// ═══════════════════════════════════════════════
router.post('/', authenticate, async (req, res) => {
  try {
    const { departureId, seatId, gender, paymentMethod } = req.body;
    if (!departureId || !seatId || !gender) {
      return res.status(400).json({ error: 'departureId, seatId, and gender are required' });
    }
    if (!['male', 'female'].includes(gender)) {
      return res.status(400).json({ error: 'Gender must be male or female' });
    }
    if (!paymentMethod || !['wallet', 'upload'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'paymentMethod must be "wallet" or "upload"' });
    }

    const [departure] = await db.select().from(departures).where(eq(departures.id, departureId));
    if (!departure) return res.status(404).json({ error: 'Departure not found' });

    const [seat] = await db.select().from(seats).where(eq(seats.id, seatId));
    if (!seat) return res.status(404).json({ error: 'Seat not found' });
    if (seat.isBooked) return res.status(400).json({ error: 'Seat is already booked' });

    const bookingRef = generateBookingRef();
    const price = parseFloat(departure.pricePerSeat);

    // -------------------------------------------
    // WALLET PAYMENT
    // -------------------------------------------
    if (paymentMethod === 'wallet') {
      const balance = await getWalletBalance(req.user.id);
      if (balance < price) {
        return res.status(400).json({
          error: `Insufficient wallet balance. You have PKR ${balance}, but the seat costs PKR ${price}.`,
          code: 'INSUFFICIENT_BALANCE',
          balance,
          required: price,
        });
      }

      // Mark seat as booked
      await db.update(seats).set({ isBooked: true, bookedBy: req.user.id, gender }).where(eq(seats.id, seatId));

      // Create booking — auto-approved
      const [booking] = await db.insert(bookings).values({
        userId: req.user.id,
        departureId,
        seatId,
        gender,
        status: 'approved',
        paymentStatus: 'verified',
        totalAmount: price.toString(),
        bookingReference: bookingRef,
      }).returning();

      // Deduct wallet
      await debitWallet(req.user.id, price, `Payment for booking ${bookingRef}`, booking.id);

      // Email confirmation to student
      try {
        const [user] = await db.select({ email: users.email, fullName: users.fullName }).from(users).where(eq(users.id, req.user.id));
        await sendEmail({
          to: user.email,
          ...emailTemplates.bookingApproved(bookingRef, departure.route),
        });
      } catch (emailErr) { console.error('Email error:', emailErr); }

      return res.status(201).json({
        ...booking,
        paymentMethod: 'wallet',
        message: 'Booking confirmed! Amount deducted from wallet.',
      });
    }

    // -------------------------------------------
    // UPLOAD SCREENSHOT
    // -------------------------------------------
    if (paymentMethod === 'upload') {
      // Mark seat as booked
      await db.update(seats).set({ isBooked: true, bookedBy: req.user.id, gender }).where(eq(seats.id, seatId));

      // Create booking — pending approval
      const [booking] = await db.insert(bookings).values({
        userId: req.user.id,
        departureId,
        seatId,
        gender,
        status: 'pending_approval',
        paymentStatus: 'pending',
        totalAmount: price.toString(),
        bookingReference: bookingRef,
      }).returning();

      // Email to student: booking registered, waiting for screenshot
      try {
        const [user] = await db.select({ email: users.email, fullName: users.fullName }).from(users).where(eq(users.id, req.user.id));
        await sendEmail({
          to: user.email,
          ...emailTemplates.bookingPending(bookingRef, departure.route),
        });
      } catch (emailErr) { console.error('Email error:', emailErr); }

      // Email to admin: new booking needs review
      try {
        const [admin] = await db.select({ email: users.email }).from(users).where(eq(users.role, 'admin'));
        const [student] = await db.select({ fullName: users.fullName }).from(users).where(eq(users.id, req.user.id));
        if (admin) {
          await sendEmail({
            to: admin.email,
            ...emailTemplates.newBookingAdminNotification(student?.fullName || req.user.fullName, bookingRef, departure.route, seat.seatNumber),
          });
        }
      } catch (emailErr) { console.error('Admin email error:', emailErr); }

      return res.status(201).json({
        ...booking,
        paymentMethod: 'upload',
        message: 'Booking registered! Please upload your payment screenshot for admin verification.',
      });
    }
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload payment screenshot
router.post('/:id/payment', authenticate, async (req, res) => {
  try {
    const { paymentScreenshotUrl } = req.body;
    if (!paymentScreenshotUrl) return res.status(400).json({ error: 'paymentScreenshotUrl required' });

    await db.update(bookings)
      .set({ paymentScreenshotUrl, paymentStatus: 'pending', updatedAt: new Date() })
      .where(and(eq(bookings.id, req.params.id), eq(bookings.userId, req.user.id)));

    const [booking] = await db.select({
      bookingReference: bookings.bookingReference,
      departureId: bookings.departureId,
      userId: bookings.userId,
    }).from(bookings).where(eq(bookings.id, req.params.id));

    // Notify admin about the screenshot
    if (booking) {
      try {
        const [dep] = await db.select({ route: departures.route }).from(departures).where(eq(departures.id, booking.departureId));
        const [student] = await db.select({ fullName: users.fullName }).from(users).where(eq(users.id, booking.userId));
        const [admin] = await db.select({ email: users.email }).from(users).where(eq(users.role, 'admin'));
        if (admin && dep) {
          await sendEmail({
            to: admin.email,
            ...emailTemplates.newBookingAdminNotification(student?.fullName || 'Student', booking.bookingReference, dep.route, ''),
          });
        }
      } catch (emailErr) { console.error('Admin notification error:', emailErr); }
    }

    res.json({ message: 'Payment screenshot uploaded! Admin will review it shortly.' });
  } catch (err) {
    console.error('Upload payment error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Approve/Reject booking
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, paymentStatus, notes } = req.body;

    const [booking] = await db.select({
      bookingRef: bookings.bookingReference,
      userId: bookings.userId,
      departureId: bookings.departureId,
      seatId: bookings.seatId,
    }).from(bookings).where(eq(bookings.id, req.params.id));

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    await db.update(bookings)
      .set({ status, ...(paymentStatus && { paymentStatus }), ...(notes && { notes }), updatedAt: new Date() })
      .where(eq(bookings.id, req.params.id));

    // If rejected, release the seat
    if (status === 'rejected') {
      await db.update(seats).set({ isBooked: false, bookedBy: null, gender: null }).where(eq(seats.id, booking.seatId));
    }

    // Notify student
    try {
      const [user] = await db.select({ email: users.email, fullName: users.fullName })
        .from(users).where(eq(users.id, booking.userId));
      const [dep] = await db.select({ route: departures.route }).from(departures).where(eq(departures.id, booking.departureId));

      if (status === 'approved') {
        await sendEmail({
          to: user.email,
          ...emailTemplates.bookingApproved(booking.bookingRef, dep.route),
        });
      } else if (status === 'rejected') {
        await sendEmail({
          to: user.email,
          ...emailTemplates.bookingRejected(booking.bookingRef, notes || 'Payment screenshot was not clear or invalid'),
        });
      }
    } catch (emailErr) { console.error('Status notification email failed:', emailErr); }

    res.json({ message: 'Booking status updated' });
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel booking
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const [booking] = await db.select().from(bookings)
      .where(and(eq(bookings.id, req.params.id), eq(bookings.userId, req.user.id)));

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ error: 'Already cancelled' });

    await db.update(bookings).set({ status: 'cancelled', updatedAt: new Date() }).where(eq(bookings.id, req.params.id));
    await db.update(seats).set({ isBooked: false, bookedBy: null, gender: null }).where(eq(seats.id, booking.seatId));
    await creditWallet(req.user.id, parseFloat(booking.totalAmount), `Refund for booking ${booking.bookingReference}`, booking.id);

    try {
      const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, req.user.id));
      await sendEmail({
        to: user.email,
        ...emailTemplates.cancellationConfirmation(booking.bookingReference, booking.totalAmount),
      });
    } catch (emailErr) { console.error('Email send failed:', emailErr); }

    res.json({ message: 'Booking cancelled, refund credited to wallet' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;