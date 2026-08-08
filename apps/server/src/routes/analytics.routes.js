import { Router } from 'express';
import { db } from '../db/index.js';
import { users, bookings, departures, walletTransactions, refundRequests } from '../db/schema.js';
import { eq, sql, desc } from 'drizzle-orm';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    const [userCount] = await db.select({ count: sql`count(*)`.as('count') }).from(users);
    const [bookingCount] = await db.select({ count: sql`count(*)`.as('count') }).from(bookings);
    const [departureCount] = await db.select({ count: sql`count(*)`.as('count') }).from(departures);
    const [pendingBookings] = await db.select({ count: sql`count(*)`.as('count') }).from(bookings)
      .where(eq(bookings.status, 'pending_approval'));
    const [totalRevenue] = await db.select({ total: sql`coalesce(sum(${bookings.totalAmount}), 0)`.as('total') })
      .from(bookings).where(eq(bookings.status, 'approved'));
    const [pendingRefunds] = await db.select({ count: sql`count(*)`.as('count') }).from(refundRequests)
      .where(eq(refundRequests.status, 'pending'));

    // Recent bookings
    const recentBookings = await db.select({
      id: bookings.id,
      status: bookings.status,
      totalAmount: bookings.totalAmount,
      bookingReference: bookings.bookingReference,
      createdAt: bookings.createdAt,
      user: { fullName: users.fullName, email: users.email },
      departure: { route: departures.route },
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.userId, users.id))
    .innerJoin(departures, eq(bookings.departureId, departures.id))
    .orderBy(desc(bookings.createdAt))
    .limit(10);

    // Departures by route for chart
    const departuresByRoute = await db.select({
      route: departures.route,
      count: sql`count(*)`.as('count'),
      totalSeats: sql`sum(${departures.totalSeats})`.as('totalSeats'),
    })
    .from(departures)
    .groupBy(departures.route);

    // Bookings by status for chart
    const bookingsByStatus = await db.select({
      status: bookings.status,
      count: sql`count(*)`.as('count'),
    })
    .from(bookings)
    .groupBy(bookings.status);

    res.json({
      stats: {
        totalUsers: parseInt(userCount.count),
        totalBookings: parseInt(bookingCount.count),
        totalDepartures: parseInt(departureCount.count),
        pendingBookings: parseInt(pendingBookings.count),
        totalRevenue: parseFloat(totalRevenue.total),
        pendingRefunds: parseInt(pendingRefunds.count),
      },
      recentBookings,
      departuresByRoute,
      bookingsByStatus,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET per-route analytics — ADMIN
router.get('/routes', authenticate, requireAdmin, async (req, res) => {
  try {
    const routeStats = await db
      .select({
        route: departures.route,
        fromCity: departures.fromCity,
        toCity: departures.toCity,
        totalDepartures: sql`count(distinct ${departures.id})`.as('totalDepartures'),
        totalBookings: sql`count(${bookings.id})`.as('totalBookings'),
        approvedBookings:
          sql`coalesce(sum(case when ${bookings.status} = 'approved' then 1 else 0 end), 0)`.as('approvedBookings'),
        totalRevenue:
          sql`coalesce(sum(case when ${bookings.status} = 'approved' then ${bookings.totalAmount} else 0 end), 0)`.as('totalRevenue'),
        totalSeats: sql`coalesce(sum(${departures.totalSeats}), 0)`.as('totalSeats'),
      })
      .from(departures)
      .leftJoin(bookings, eq(departures.id, bookings.departureId))
      .groupBy(departures.route, departures.fromCity, departures.toCity)
      .orderBy(desc(sql`sum(case when ${bookings.status} = 'approved' then cast(${bookings.totalAmount} as numeric) else 0 end)`));

    const result = routeStats.map((r) => ({
      ...r,
      totalDepartures: parseInt(r.totalDepartures),
      totalBookings: parseInt(r.totalBookings),
      approvedBookings: parseInt(r.approvedBookings),
      totalRevenue: parseFloat(r.totalRevenue),
      totalSeats: parseInt(r.totalSeats),
      occupancyRate:
        parseInt(r.totalSeats) > 0
          ? Math.round((parseInt(r.approvedBookings) / parseInt(r.totalSeats)) * 100)
          : 0,
    }));

    res.json(result);
  } catch (err) {
    console.error('Route analytics error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
