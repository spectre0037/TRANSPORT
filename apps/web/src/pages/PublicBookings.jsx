import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PublicBookings() {
  const [imageError, setImageError] = useState(false);

  return (
    <main className="min-h-screen bg-clay-bg px-6 py-16 text-clay-text">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="overflow-hidden rounded-clay-lg border border-clay-border bg-clay-surface p-6 shadow-clay-lg md:p-10">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-5">
              <span className="clay-badge bg-clay-accent text-clay-primary">Fixed Pricing · Transparent Booking</span>
              <h1 className="font-display text-4xl font-extrabold leading-tight text-clay-primary md:text-6xl">TaleemXpress — Book Your Seat</h1>
              <p className="text-lg text-clay-text-muted">Organized Student Transport for GIKI.</p>
              <p className="max-w-2xl text-sm leading-7 text-clay-text-muted">Sign in or create a free account to browse available departures, select your seat, and book your ride in minutes.</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/login" className="clay-btn-primary">Sign In to Book</Link>
                <Link to="/register" className="clay-btn-outline">Create Free Account</Link>
              </div>
            </div>

            <div className="rounded-clay-lg bg-gradient-to-br from-clay-primary to-clay-primary-light p-6 text-white shadow-clay-lg">
              {!imageError ? (
                <img src="/hiace.png" alt="TaleemXpress Hiace" className="h-56 w-full rounded-clay-lg object-cover" onError={() => setImageError(true)} />
              ) : (
                <div className="flex h-56 items-center justify-center rounded-clay-lg border border-white/10 bg-white/5 text-2xl font-display font-bold text-white/90">TaleemXpress</div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <article className="clay-card space-y-3">
            <h2 className="font-display text-xl font-bold text-clay-primary">Capacity & Luggage Policy</h2>
            <p className="text-sm leading-6 text-clay-text-muted">Maximum 9-10 students per Hiace. Each student can carry 1 medium bag and 1 small backpack. Extra luggage charged accordingly.</p>
          </article>
          <article className="clay-card space-y-3">
            <h2 className="font-display text-xl font-bold text-clay-primary">Online Ticketing Policy</h2>
            <p className="text-sm leading-6 text-clay-text-muted">After admin verifies your payment screenshot, your booking status updates to Confirmed. Download your ticket from your bookings page once the departure is finalized.</p>
          </article>
        </section>

        <section className="clay-card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-clay-primary">For announcements and updates, join our WhatsApp community.</p>
          </div>
          <a href="https://chat.whatsapp.com/Hu5vK2qABoa78lNY1KrniJ" target="_blank" rel="noreferrer" className="clay-btn-secondary inline-flex">Join Community</a>
        </section>

        <p className="text-center text-sm text-clay-text-muted">© 2026 TaleemXpress. Student-led Transport. | xpresstaleem@gmail.com</p>
      </div>
    </main>
  );
}