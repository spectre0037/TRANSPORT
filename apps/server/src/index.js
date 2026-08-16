import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import departuresRoutes from './routes/departures.routes.js';
import bookingsRoutes from './routes/bookings.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import walletTopupRoutes from './routes/walletTopup.routes.js';
import refundsRoutes from './routes/refunds.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import privateBookingsRoutes from './routes/privateBookings.routes.js';
import { authenticate, requireVerified } from './middleware/auth.middleware.js';
import compression from 'compression';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://www.taleemxpress.app',
  'https://taleemxpress.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean) : []),
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(compression());
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (no auth)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'TaleemXpress API' });
});

// Auth routes (register, login, refresh — no verification required)
app.use('/api/auth', authRoutes);

// Public/protected routes — require auth + email verification
app.use('/api/users', authenticate, requireVerified, usersRoutes);
app.use('/api/departures', departuresRoutes); // GET is public, POST/PUT/DELETE are protected within the router
app.use('/api/bookings', authenticate, requireVerified, bookingsRoutes);
app.use('/api/wallet', authenticate, requireVerified, walletRoutes);
app.use('/api/wallet/topup', authenticate, requireVerified, walletTopupRoutes);
app.use('/api/refunds', authenticate, requireVerified, refundsRoutes);
app.use('/api/analytics', authenticate, requireVerified, analyticsRoutes);
app.use('/api/uploads', authenticate, requireVerified, uploadsRoutes);
app.use('/api/notifications', authenticate, notificationsRoutes);
app.use('/api/private-bookings', authenticate, privateBookingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 TaleemXpress API running on http://localhost:${PORT}`);
});
