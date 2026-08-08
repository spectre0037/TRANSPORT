import { Router } from 'express';
import { db } from '../db/index.js';
import { privateBookings, users } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import sendEmail, { emailTemplates } from '../services/email.service.js';

const router = Router();

// GET all private bookings (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const bookings = await db
      .select()
      .from(privateBookings)
      .orderBy(desc(privateBookings.createdAt));
    res.json(bookings);
  } catch (err) {
    console.error('Get private bookings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create private booking (authenticated user)
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, phone, vehicleType, departureLocation, arrivalLocation, date, time, tripType, duration, budget } = req.body;

    if (!name || !vehicleType || !departureLocation || !arrivalLocation || !date || !time || !tripType || !budget) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    const validVehicles = ['car', 'hiace', 'coaster', 'bus'];
    if (!validVehicles.includes(vehicleType)) {
      return res.status(400).json({ error: 'Invalid vehicle type' });
    }

    if (!['return', 'one-way'].includes(tripType)) {
      return res.status(400).json({ error: 'Trip type must be return or one-way' });
    }

    const [booking] = await db
      .insert(privateBookings)
      .values({
        userId: req.user.id,
        name,
        phone: phone || null,
        vehicleType,
        departureLocation,
        arrivalLocation,
        date: new Date(date),
        time,
        tripType,
        duration: tripType === 'return' ? (duration || null) : null,
        budget: parseFloat(budget).toString(),
      })
      .returning();

    // Notify admin via email
    try {
      const [admin] = await db.select({ email: users.email }).from(users).where(eq(users.role, 'admin'));
      if (admin) {
        await sendEmail({
          to: admin.email,
          ...emailTemplates.privateBookingRequest({
            name,
            phone: phone || '—',
            vehicleType: { car: '🚗 Car (5-seater)', hiace: '🚐 Hiace (17-seater)', coaster: '🚌 Coaster (32-seater)', bus: '🚌 Bus (45-seater)' }[vehicleType] || vehicleType,
            departureLocation,
            arrivalLocation,
            date: new Date(date).toLocaleDateString('en-GB'),
            time,
            tripType: tripType === 'return' ? '🔄 Return' : '➡️ One-way',
            duration: duration || null,
            budget: parseFloat(budget).toLocaleString(),
          }),
        });
      }
    } catch (emailErr) {
      console.error('Admin notification email failed:', emailErr);
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error('Create private booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET my private bookings (authenticated user)
router.get('/my', authenticate, async (req, res) => {
  try {
    const myBookings = await db
      .select()
      .from(privateBookings)
      .where(eq(privateBookings.userId, req.user.id))
      .orderBy(desc(privateBookings.createdAt));
    res.json(myBookings);
  } catch (err) {
    console.error('Get my private bookings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update status (admin only)
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.update(privateBookings)
      .set({ status, ...(adminNotes !== undefined && { adminNotes }) })
      .where(eq(privateBookings.id, req.params.id));

    const [updated] = await db.select().from(privateBookings).where(eq(privateBookings.id, req.params.id));
    res.json(updated);
  } catch (err) {
    console.error('Update private booking status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE private booking (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await db.delete(privateBookings).where(eq(privateBookings.id, req.params.id));
    res.json({ message: 'Private booking deleted' });
  } catch (err) {
    console.error('Delete private booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
