# TaleemXpress — Claude Code Agent Directives

## Mission Brief
You are the lead full-stack engineer building **TaleemXpress**, a student transport management platform for GIKI and partner universities in Pakistan.

Build the entire monorepo based on:
1. `TaleemXpress_Master_Document_v2.docx` (PRD, DB Schema, API Spec, Workflows)
2. `TaleemXpress_Prompt_Guide_v2.docx` (10-Phase Step-by-Step Prompt Roadmap)
3. `master.credentials.json` (Credentials Source of Truth)

---

## Strict Technical Stack
- **Frontend**: React 18 + Vite 5 (`apps/web`), JavaScript / JSX ONLY. Zero TypeScript (.ts/.tsx forbidden).
- **Backend**: Express.js REST API (`apps/server`) on Node.js 20+.
- **Database**: NeonDB PostgreSQL via Drizzle ORM.
- **Authentication**: Custom JWT (bcryptjs + jsonwebtoken). NO Clerk, Auth0, Passport, or NextAuth.
- **Styling**: Claymorphism UI theme with Tailwind CSS (`--clay-*` CSS custom properties).

---

## Automated Execution Steps

### Step 1: Environment Setup
1. Read `master.credentials.json`.
2. Generate `apps/web/.env` with:
   - `VITE_API_URL=http://localhost:3001`
   - `VITE_CLOUDINARY_CLOUD_NAME=dddqgvcic`
   - `VITE_CLOUDINARY_UPLOAD_PRESET=taleemxpress_preset`
3. Generate `apps/server/.env` with:
   - `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `BCRYPT_ROUNDS`
   - `RESEND_API_KEY`, `EMAIL_FROM`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `PORT=3001`, `FRONTEND_URL=http://localhost:5173`
4. Run `npm install` at root, `apps/web`, and `apps/server`.

### Step 2: Database Schema & Push
1. Build `apps/server/src/db/schema.js` containing ALL 9 PostgreSQL tables (`users`, `otp_tokens`, `refresh_tokens`, `departures`, `seats`, `bookings`, `wallets`, `wallet_transactions`, `refund_requests`).
2. Run `npx drizzle-kit push` in `apps/server` to sync with NeonDB.

### Step 3: Backend REST API
1. Build Express server (`apps/server/src/index.js`).
2. Build custom auth middleware (`auth.middleware.js`), admin middleware, OTP service (`otp.service.js`), email service (`email.service.js` with 15 Resend templates), wallet service, and Cloudinary signed upload service.
3. Construct all 8 API route/controller pairs (`/auth`, `/users`, `/departures`, `/bookings`, `/wallet`, `/refunds`, `/analytics`, `/uploads`).

### Step 4: Frontend UI Construction
1. Configure Tailwind, CSS custom variables for Claymorphism, theme Store, and Axios client with JWT refresh interceptors.
2. Build marketing landing page components with Framer Motion.
3. Build auth pages (`/login`, `/register`, `/verify-email`, 3-step `/forgot-password`).
4. Build student pages: Dashboard, Departures, Interactive 45-seat bus grid (`SeatMap.jsx`), Checkout/Payment upload, My Bookings, Wallet.
5. Build admin portal: Dashboard with Recharts, Route Creator Modal, Booking Approvals Drawer, User & Wallet Adjustment, Refund Requests Manager.

### Step 5: Verification & Seeding
1. Seed the default Admin (`xpresstaleem@gmail.com`) and Student accounts from `master.credentials.json`.
2. Run `node scripts/e2e-test.js` to perform end-to-end testing across all routes and authentications.