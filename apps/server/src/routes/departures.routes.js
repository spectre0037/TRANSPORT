import { Router } from 'express';
import { db } from '../db/index.js';
import { departures, seats, bookings, users } from '../db/schema.js';
import { eq, and, ne, asc, or, lt, desc, sql } from 'drizzle-orm';
import { authenticate, requireAdmin, requireVerified, optionalAuth } from '../middleware/auth.middleware.js';
import sendEmail, { emailTemplates } from '../services/email.service.js';

const router = Router();

// GET all departures — PUBLIC (no auth)
// Only returns UPCOMING departures (departureDate + departureTime hasn't passed yet)
router.get('/', async (req, res) => {
  try {
    const { fromCity, toCity } = req.query;
    const now = new Date();

    // Filter: not dropped AND (departureDate is in future OR departureDate is today and might not have departed yet)
    const conditions = [
      ne(departures.status, 'dropped'),
      sql`(${departures.departureDate} > ${now}::date OR ${departures.departureDate} = ${now}::date)`
    ];

    if (fromCity) conditions.push(eq(departures.fromCity, fromCity));
    if (toCity) conditions.push(eq(departures.toCity, toCity));

    const rows = await db.select().from(departures).where(and(...conditions)).orderBy(asc(departures.departureDate));

    // For today's departures, filter out those where time has passed
    const filtered = rows.filter(dep => {
      const depDate = new Date(dep.departureDate);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const depDay = new Date(depDate.getFullYear(), depDate.getMonth(), depDate.getDate());

      // If departure is in the future, include it
      if (depDay > today) return true;

      // If departure is today, check if time hasn't passed
      if (depDay.getTime() === today.getTime()) {
        const [hours, minutes] = dep.departureTime.split(':').map(Number);
        const depDateTime = new Date(depDate);
        depDateTime.setHours(hours, minutes, 0, 0);
        return depDateTime > now;
      }

      return false;
    });

    res.json(filtered);
  } catch (err) {
    console.error('Get departures error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET departure history (past/completed) — ADMIN
router.get('/history', authenticate, requireVerified, requireAdmin, async (req, res) => {
  try {
    const history = await db
      .select({
        id: departures.id,
        route: departures.route,
        fromCity: departures.fromCity,
        toCity: departures.toCity,
        departureDate: departures.departureDate,
        departureTime: departures.departureTime,
        totalSeats: departures.totalSeats,
        pricePerSeat: departures.pricePerSeat,
        busType: departures.busType,
        status: departures.status,
        createdAt: departures.createdAt,
        passengerCount:
          sql`coalesce(count(*) filter (where ${bookings.status} = 'approved'), 0)`.as('passengerCount'),
        totalRevenue:
          sql`coalesce(sum(${bookings.totalAmount}) filter (where ${bookings.status} = 'approved'), 0)`.as('totalRevenue'),
      })
      .from(departures)
      .leftJoin(bookings, eq(departures.id, bookings.departureId))
      .where(
        or(
          eq(departures.status, 'confirmed'),
          eq(departures.status, 'dropped'),
          and(eq(departures.status, 'valid'), lt(departures.departureDate, new Date()))
        )
      )
      .groupBy(departures.id)
      .orderBy(desc(departures.departureDate));

    res.json(history);
  } catch (err) {
    console.error('Get departure history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all approved passengers for a departure — ADMIN
router.get('/:id/passengers', authenticate, requireVerified, requireAdmin, async (req, res) => {
  try {
    const passengers = await db
      .select({
        bookingId: bookings.id,
        bookingReference: bookings.bookingReference,
        totalAmount: bookings.totalAmount,
        gender: bookings.gender,
        seatNumber: seats.seatNumber,
        seatRow: seats.row,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        preferredCity: users.preferredCity,
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .innerJoin(seats, eq(bookings.seatId, seats.id))
      .where(and(eq(bookings.departureId, req.params.id), eq(bookings.status, 'approved')))
      .orderBy(seats.seatNumber);

    res.json(passengers);
  } catch (err) {
    console.error('Get passengers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single departure with seats — PUBLIC
router.get('/:id', async (req, res) => {
  try {
    const [departure] = await db.select().from(departures).where(eq(departures.id, req.params.id));
    if (!departure) return res.status(404).json({ error: 'Departure not found' });

    const seatList = await db.select().from(seats).where(eq(seats.departureId, req.params.id)).orderBy(seats.row, seats.column);

    // Get booking genders
    const bookingRows = await db.select({ seatId: bookings.seatId, gender: bookings.gender })
      .from(bookings).where(eq(bookings.departureId, req.params.id));
    const genderMap = {};
    bookingRows.forEach(b => { genderMap[b.seatId] = b.gender; });

    const seatsWithGender = seatList.map(s => ({ ...s, gender: s.isBooked ? genderMap[s.id] || null : null }));
    res.json({ ...departure, seats: seatsWithGender });
  } catch (err) {
    console.error('Get departure error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create departure — ADMIN + VERIFIED
router.post('/', authenticate, requireVerified, requireAdmin, async (req, res) => {
  try {
    const { route, fromCity, toCity, departureDate, departureTime, totalSeats, pricePerSeat, busType, vehicleType, seatCount } = req.body;
    if (!route || !fromCity || !toCity || !departureDate || !departureTime || !pricePerSeat) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const vType = vehicleType || 'bus';
    const actualSeatCount = vType === 'bus' ? 45 : (parseInt(seatCount) || 13); // was 15, now 13

    const [departure] = await db.insert(departures).values({
      route, fromCity, toCity,
      departureDate: new Date(departureDate),
      departureTime,
      totalSeats: actualSeatCount,
      pricePerSeat: pricePerSeat.toString(),
      busType: busType || vType,
      status: 'pending',
      createdBy: req.user.id,
    }).returning();

    // Generate seats based on vehicle type
    const seatInserts = [];
    let seatNum = 1;

    if (vType === 'bus') {
      // 45 seats: rows A-K (×4) = 44, Row L (×1) = 45 — 2+2 layout with aisle
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      for (const row of rows) {
        const numCols = row === 'L' ? 1 : 4;
        for (let col = 1; col <= numCols; col++) {
          seatInserts.push({ departureId: departure.id, seatNumber: seatNum, row, column: col, isBooked: false, gender: null });
          seatNum++;
        }
      }
    }else {
    // Hiace: front row = 1 passenger seat (driver sits beside it, not a bookable seat)
    // then 4 rows of 3 seats each = 1 + 12 = 13 total
    seatInserts.push({ departureId: departure.id, seatNumber: seatNum, row: 'A', column: 1, isBooked: false, gender: null });
    seatNum++;

    const bodyRows = ['B', 'C', 'D', 'E'];
    for (const row of bodyRows) {
      for (let col = 1; col <= 3; col++) {
        seatInserts.push({ departureId: departure.id, seatNumber: seatNum, row, column: col, isBooked: false, gender: null });
        seatNum++;
      }
    }
  }

  await db.insert(seats).values(seatInserts);
  res.status(201).json({ ...departure, vehicleType: vType });
} catch (err) {
  console.error('Create departure error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
});

// PUT update departure — ADMIN + VERIFIED
router.put('/:id', authenticate, requireVerified, requireAdmin, async (req, res) => {
  try {
    const { route, fromCity, toCity, departureDate, departureTime, totalSeats, pricePerSeat, busType, status } = req.body;
    const [oldDep] = await db.select({ status: departures.status }).from(departures).where(eq(departures.id, req.params.id));

    await db.update(departures).set({
      ...(route && { route }), ...(fromCity && { fromCity }), ...(toCity && { toCity }),
      ...(departureDate && { departureDate: new Date(departureDate) }),
      ...(departureTime && { departureTime }), ...(totalSeats && { totalSeats }),
      ...(pricePerSeat && { pricePerSeat: pricePerSeat.toString() }),
      ...(busType && { busType }), ...(status && { status }),
      updatedAt: new Date(),
    }).where(eq(departures.id, req.params.id));

    const [departure] = await db.select().from(departures).where(eq(departures.id, req.params.id));

    // Email ALL approved passengers if status changed
    if (status && status !== oldDep.status) {
      try {
        const allBookings = await db.select({ email: users.email, fullName: users.fullName })
          .from(bookings).innerJoin(users, eq(bookings.userId, users.id))
          .where(and(eq(bookings.departureId, req.params.id), eq(bookings.status, 'approved')));
        for (const b of allBookings) {
          await sendEmail({ to: b.email, ...emailTemplates.departureStatusChanged(departure.route, oldDep.status, status, departure.departureTime) });
        }
        console.log(`📧 Emailed ${allBookings.length} passengers about status: ${oldDep.status} → ${status}`);
      } catch (emailErr) { console.error('Status change email error:', emailErr); }
    }

    res.json(departure);
  } catch (err) {
    console.error('Update departure error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE departure — ADMIN + VERIFIED
router.delete('/:id', authenticate, requireVerified, requireAdmin, async (req, res) => {
  try {
    // Check if departure has any bookings
    const existingBookings = await db.select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.departureId, req.params.id))
      .limit(1);

    if (existingBookings.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete route with existing bookings. This route has passenger booking history that must be preserved.',
        code: 'HAS_BOOKINGS'
      });
    }

    // No bookings, safe to delete (will cascade delete seats automatically)
    await db.delete(departures).where(eq(departures.id, req.params.id));
    res.json({ message: 'Departure deleted' });
  } catch (err) {
    console.error('Delete departure error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
