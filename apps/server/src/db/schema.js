import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Enums
export const roleEnum = pgEnum('role', ['student', 'admin']);
export const bookingStatusEnum = pgEnum('booking_status', ['pending_approval', 'approved', 'rejected', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'verified', 'rejected']);
export const transactionTypeEnum = pgEnum('transaction_type', ['credit', 'debit', 'refund', 'adjustment']);
export const refundStatusEnum = pgEnum('refund_status', ['pending', 'approved', 'rejected']);
export const departureStatusEnum = pgEnum('departure_status', ['pending', 'valid', 'confirmed', 'dropped']);
export const genderEnum = pgEnum('gender', ['male', 'female']);

// 1. Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  preferredCity: varchar('preferred_city', { length: 100 }),
  role: roleEnum('role').default('student').notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  avatarUrl: text('avatar_url'),
  walletBalance: decimal('wallet_balance', { precision: 10, scale: 2 }).default('0.00').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. OTP Tokens
export const otpTokens = pgTable('otp_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  otp: varchar('otp', { length: 6 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'email_verify', 'password_reset'
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 3. Refresh Tokens
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Departures
export const departures = pgTable('departures', {
  id: uuid('id').defaultRandom().primaryKey(),
  route: varchar('route', { length: 255 }).notNull(),
  fromCity: varchar('from_city', { length: 100 }).notNull(),
  toCity: varchar('to_city', { length: 100 }).notNull(),
  departureDate: timestamp('departure_date').notNull(),
  departureTime: varchar('departure_time', { length: 10 }).notNull(),
  totalSeats: integer('total_seats').default(45).notNull(),
  pricePerSeat: decimal('price_per_seat', { precision: 10, scale: 2 }).notNull(),
  busType: varchar('bus_type', { length: 50 }).default('standard'),
  status: departureStatusEnum('status').default('pending').notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Seats
export const seats = pgTable('seats', {
  id: uuid('id').defaultRandom().primaryKey(),
  departureId: uuid('departure_id').references(() => departures.id, { onDelete: 'cascade' }).notNull(),
  seatNumber: integer('seat_number').notNull(),
  isBooked: boolean('is_booked').default(false).notNull(),
  bookedBy: uuid('booked_by').references(() => users.id),
  gender: genderEnum('gender'), // null when unbooked, 'male' or 'female' when booked
  row: varchar('row', { length: 5 }).notNull(), // A-L (12 rows)
  column: integer('column').notNull(), // 1-4 (2 left + 2 right, aisle between 2 and 3)
});

// 6. Bookings
export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  departureId: uuid('departure_id').references(() => departures.id).notNull(),
  seatId: uuid('seat_id').references(() => seats.id).notNull(),
  status: bookingStatusEnum('status').default('pending_approval').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('pending').notNull(),
  paymentScreenshotUrl: text('payment_screenshot_url'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  bookingReference: varchar('booking_reference', { length: 20 }).notNull().unique(),
  notes: text('notes'),
  gender: genderEnum('gender').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 7. Wallets
export const wallets = pgTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  balance: decimal('balance', { precision: 10, scale: 2 }).default('0.00').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. Wallet Transactions
export const walletTransactions = pgTable('wallet_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: transactionTypeEnum('type').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  referenceId: uuid('reference_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Refund Requests
export const refundRequests = pgTable('refund_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  bookingId: uuid('booking_id').references(() => bookings.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason'),
  status: refundStatusEnum('status').default('pending').notNull(),
  adminNotes: text('admin_notes'),
  processedBy: uuid('processed_by').references(() => users.id),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 10. Wallet Top-up Requests
export const walletTopupRequests = pgTable('wallet_topup_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  screenshotUrl: text('screenshot_url'),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  adminNotes: text('admin_notes'),
  processedBy: uuid('processed_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 11. Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  sentViaEmail: boolean('sent_via_email').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Private Bookings
export const privateBookings = pgTable('private_bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  vehicleType: varchar('vehicle_type', { length: 50 }).notNull(),
  departureLocation: varchar('departure_location', { length: 255 }).notNull(),
  arrivalLocation: varchar('arrival_location', { length: 255 }).notNull(),
  date: timestamp('date').notNull(),
  time: varchar('time', { length: 10 }).notNull(),
  tripType: varchar('trip_type', { length: 20 }).notNull(), // 'return' or 'one-way'
  duration: varchar('duration', { length: 100 }),
  budget: decimal('budget', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
