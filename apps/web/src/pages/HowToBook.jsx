import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import logoImage from '../assets/hiace (1).png';

const steps = [
  {
    icon: '👤',
    title: 'Sign Up / Log In',
    description: 'Go to taleemxpress.app and create a free account. Fill in your name, email, student reg number (optional), phone, and your home city. Already have an account? Just log in.',
    details: ['A 6-digit verification code will be sent to your email', 'Enter the code to verify and activate your account', 'One-time process — your account stays active'],
  },
  {
    icon: '🗓️',
    title: 'Find Your Route',
    description: 'Once logged in, go to the Departures page. Browse all available departure dates, routes, and vehicle types. Filter by your city, date, or vehicle type (Bus or Hiace).',
    details: ['See departure date, time, route, and price', 'Check available seats in real-time', 'Bus departures show a live seat map'],
  },
  {
    icon: '💺',
    title: 'Choose Your Seat',
    description: 'For Bus departures — click on an available seat on the interactive seat map. For Hiace departures — no seat selection needed, just proceed to payment.',
    details: ['Bus: Interactive 45-seat grid (4 columns)', 'Blue seats = Male booked', 'Pink seats = Female booked', 'White seats = Available', 'Click a seat -> choose your gender (Male / Female)'],
  },
  {
    icon: '⚖️',
    title: 'Select Gender',
    description: 'After clicking your seat, a prompt will ask you to select your gender. This assigns the seat as Male or Female on the seat map for all users to see.',
    details: ['Male selection -> seat turns blue', 'Female selection -> seat turns pink', 'Seat is gender-locked once booked (admin can override)'],
  },
  {
    icon: '💳',
    title: 'Pay for Your Seat',
    description: 'Choose your payment method. You can pay using your TaleemXpress wallet or by uploading a screenshot of your bank, EasyPaisa, or JazzCash transfer.',
    details: ['Option A - Wallet: Balance is deducted instantly', 'Option B - Screenshot: Upload proof of transfer', 'Accepted transfers: bank, EasyPaisa, JazzCash', 'Screenshot is securely uploaded to our platform'],
  },
  {
    icon: '📤',
    title: 'Submit & Wait for Approval',
    description: 'After payment, click Submit. Your booking is created with status Pending Approval. You will receive a confirmation email that your booking is under review.',
    details: ['Email sent: Booking submitted — pending review', 'Admin is also notified instantly', 'Booking status shows Pending in your dashboard', 'Do NOT close or refresh — wait for the submission to complete'],
  },
  {
    icon: '✅',
    title: 'Payment Verification',
    description: 'Our admin reviews your booking and payment screenshot. This typically takes a few hours. Once verified, your seat is officially locked and your booking is marked as Confirmed.',
    details: ['Approved -> Booking status changes to Confirmed', 'You receive a Booking Confirmed email', 'If payment is invalid -> status changes to Declined', 'Declined wallet payments are fully refunded automatically'],
  },
  {
    icon: '🎫',
    title: 'Your Seat is Confirmed',
    description: 'Once your booking is confirmed and the departure is finalized by admin, you can download your digital ticket from your Bookings page. Show it at boarding.',
    details: ['Go to My Bookings -> click your booking', 'Click Download Ticket once departure is confirmed', 'Ticket shows route, date, time, seat number, gender', 'Keep it on your phone for boarding'],
  },
];

const refundPoints = [
  'Refund requests must be submitted at least 12 hours before departure.',
  'Go to My Bookings -> select your booking -> Request Refund.',
  '70% of your ticket price is returned to your TaleemXpress wallet.',
  '30% service fee is non-refundable.',
  'Refund must be approved by admin before it is credited.',
];

const policies = [
  {
    title: 'Luggage Policy',
    body: '1 medium bag + 1 small backpack per student. Extra luggage is charged accordingly. Oversized or excess items may be refused.',
  },
  {
    title: 'Seat Policy',
    body: 'Bus seats are gender-assigned and locked after booking. Hiace trips do not have assigned seats. Maximum 9-10 students per Hiace.',
  },
];

export default function HowToBook() {
  const { user } = useAuthStore();
  const [imageError, setImageError] = useState(false);

  return (
    <main className="min-h-screen bg-clay-bg px-4 py-14 text-clay-text sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="grid gap-8 rounded-clay-lg border border-clay-border bg-clay-surface p-5 shadow-clay-lg md:grid-cols-[0.95fr_1.05fr] md:p-10">
          <div className="space-y-4">
            <span className="clay-badge bg-clay-accent text-clay-primary">Complete Booking Guide</span>
            <h1 className="font-display text-3xl font-extrabold leading-tight text-clay-primary sm:text-4xl md:text-6xl">How to Book Your Seat</h1>
            <p className="text-base text-clay-text-muted sm:text-lg">Everything you need to know about booking your TaleemXpress seat online. From signup to confirmed ticket in minutes.</p>
          </div>
          <div className="overflow-hidden rounded-clay-lg border border-clay-border bg-clay-surface shadow-clay-lg">
            {!imageError ? (
              <img src={logoImage} alt="TaleemXpress logo" className="h-64 w-full object-cover md:h-72" onError={() => setImageError(true)} />
            ) : (
              <div className="flex h-64 items-center justify-center bg-gradient-to-br from-clay-primary to-clay-primary-light text-3xl font-display font-bold text-white md:h-72">TaleemXpress</div>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-clay-accent">Booking Flow</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-clay-primary md:text-4xl">Step-by-step process</h2>
          </div>

          <div className="relative grid gap-6">
            {steps.map((step, index) => (
              <article key={step.title} className="relative grid gap-4 rounded-clay-lg border border-clay-border bg-clay-surface p-5 shadow-clay md:grid-cols-[auto_1fr] md:gap-6 md:p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-clay-primary text-2xl text-white shadow-clay">{step.icon}</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-clay-accent px-3 py-1 text-xs font-bold text-clay-primary">Step {index + 1}</span>
                    <h3 className="font-display text-2xl font-bold text-clay-primary">{step.title}</h3>
                  </div>
                  <p className="text-sm leading-7 text-clay-text-muted">{step.description}</p>
                  <div className="grid gap-2 rounded-clay bg-clay-bg p-4 text-sm text-clay-text-muted md:grid-cols-2">
                    {step.details.map((detail) => (
                      <div key={detail} className="flex gap-2">
                        <span className="mt-1 text-clay-accent">•</span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {index < steps.length - 1 && <div className="absolute left-[31px] top-[84px] hidden h-[calc(100%+1.5rem)] w-px bg-clay-accent/50 md:block" />}
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="clay-card space-y-3">
            <h2 className="font-display text-2xl font-bold text-clay-primary">Refund Policy</h2>
            <div className="space-y-2 text-sm leading-6 text-clay-text-muted">
              {refundPoints.map((point) => <p key={point}>• {point}</p>)}
            </div>
          </div>
          {policies.map((policy) => (
            <article key={policy.title} className="clay-card space-y-3">
              <h2 className="font-display text-2xl font-bold text-clay-primary">{policy.title}</h2>
              <p className="text-sm leading-7 text-clay-text-muted">{policy.body}</p>
            </article>
          ))}
        </section>

        <section className="clay-card flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-clay-primary">Ready to Book Your Seat?</h2>
            <p className="mt-2 text-sm text-clay-text-muted">Sign up free and book in minutes.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="clay-btn-primary">Create Free Account</Link>
            <Link to="/login" className="clay-btn-outline">Sign In</Link>
            {user && <Link to="/departures" className="clay-btn-secondary">Browse Departures</Link>}
          </div>
        </section>
      </div>
    </main>
  );
}