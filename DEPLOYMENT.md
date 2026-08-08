# TaleemXpress Deployment Guide

## What gets deployed where
- Frontend: Vercel
- Backend API: Render
- Database: Neon PostgreSQL

## 1) Deploy the backend on Render
Use the Render blueprint in `render.yaml` or create a new Web Service manually.

Service settings:
- Root directory: `apps/server`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

Environment variables to set on Render:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `BCRYPT_ROUNDS`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `PORT=3001`
- `FRONTEND_URL=https://YOUR-VERCEL-DOMAIN`

After deploy, copy the Render service URL. It will look like `https://your-service.onrender.com`.

## 2) Deploy the frontend on Vercel
Create a new Vercel project from the repo and set the project root to `apps/web`.

Vercel settings:
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrite: already covered by `apps/web/vercel.json`

Environment variables to set on Vercel:
- `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com`

After setting the env var, redeploy the frontend so the API URL is baked into the build.

## 3) Update the backend CORS origin if needed
The backend already allows `FRONTEND_URL`. If you use a custom domain on Vercel, make sure the Render env var matches it exactly.

If you later change the frontend domain, update `FRONTEND_URL` on Render and redeploy the API.

## 4) Final smoke test
Open the deployed frontend and verify:
- `/` loads the landing page
- `/login` and `/register` show the navbar
- `/how-to-book` loads the public guide
- `/maps` loads the route maps
- `/bookings` works for guests and logged-in users
- login, register, and dashboard flows still work

## Suggested order
1. Deploy Render backend first.
2. Copy the Render URL into `VITE_API_URL` on Vercel.
3. Deploy Vercel frontend.
4. Test auth and booking flows end-to-end.