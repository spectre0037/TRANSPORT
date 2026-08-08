import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Bus, CalendarDays, CreditCard, MapPinned, ShieldCheck, Ticket } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const stats = [
  { value: '9-10', label: 'Students per Hiace' },
  { value: 'Online', label: 'Secure Booking' },
  { value: 'Fixed', label: 'Transparent Pricing' },
];

const problemCards = [
  ['🚐', 'Overcrowded Vans', '17+ students crammed into HiAces meant for fewer passengers.'],
  ['💸', 'Unclear Pricing', 'Variable fares with no transparency or fixed route pricing.'],
  ['📋', 'No System', 'WhatsApp chaos, no ticketing, no confirmation, no accountability.'],
];

const solutionCards = [
  ['🎯', 'Limited Seats', 'Maximum 9-10 students per Hiace — guaranteed comfort every trip.'],
  ['💼', 'Clear Luggage Policy', '1 medium bag + 1 small backpack. Extra luggage charged fairly.'],
  ['🚐', 'Modern Vans', '2018+ model HiAce vehicles, well-maintained and clean.'],
  ['💻', 'Online Platform', 'Book, pay, and track your seat entirely online at taleemxpress.app.'],
];

const pricingCards = [
  ['Islamabad / Rawalpindi ↔ GIKI', ['Islamabad: Rs 900 per seat', 'Rawalpindi (26 No.): Rs 850 per seat']],
  ['Taxila / Wah Cantt / Hasan Abdal ↔ GIKI', ['Rs 900 per seat']],
  ['Peshawar / Mardan ↔ GIKI', ['Peshawar: Rs 1100 per seat', 'Mardan: Rs 1000 per seat']],
  ['Abbottabad / Mansehra ↔ GIKI', ['Abbottabad: Rs 1100 per seat', 'Mansehra: Rs 1300 per seat']],
];

const serviceCards = [
  ['Islamabad / Rawalpindi Routes', 'Organized city routes with fixed pricing and clear boarding coordination.', 'Rs 850 – Rs 900', ['Rawalpindi (26 No.): Rs 850', 'Islamabad: Rs 900', 'Maximum 9-10 students per Hiace', 'Online booking with seat selection']],
  ['Custom Travel Plan', 'Plan your full semester schedule with dependable, recurring trips.', 'Custom', ['Comfortable recurring ride', 'Organized pickup & dropoff', 'Digital ticket issued after confirmation']],
  ['Full Hiace Booking', 'Book the entire van for your group or special occasions.', 'Custom', ['Private group booking', 'Ideal for friend groups or events', 'Luggage policy applies per student']],
];

const featureCards = [
  ['📅', 'Online Seat Booking', 'Browse available departures, select your seat and gender preference, all from your phone or laptop.'],
  ['💳', 'Secure Payment', 'Upload your payment screenshot through the platform. Admin verifies and confirms your booking digitally.'],
  ['🎫', 'Digital Tickets', 'Once your payment is approved, your seat is confirmed. Download your ticket once the departure is finalized.'],
  ['🔍', 'Real-time Status', 'Track your booking status live — Pending, Confirmed, or Cancelled — no more WhatsApp chasing.'],
];

const faqs = [
  ['What is the luggage policy?', 'Each student can carry 1 medium bag and 1 small backpack. Extra luggage is charged accordingly.'],
  ['How many passengers per van?', 'We strictly limit capacity to a maximum of 9-10 students per Hiace for comfort and safety.'],
  ['How do I book a seat?', 'Go to taleemxpress.app, sign up or log in, browse available departures, select your seat, choose your gender preference, upload your payment screenshot, and submit. Your seat will be confirmed once admin verifies your payment.'],
  ['Are the vehicles new?', 'Yes! We only use 2018 or newer model HiAces that are well-maintained, clean, and comfortable.'],
  ['What routes do you cover?', 'We cover Islamabad/Rawalpindi, Taxila/Wah Cantt/Hasan Abdal, Peshawar/Mardan, and Abbottabad/Mansehra routes to and from GIKI.'],
  ['What are the fixed fares?', 'Taxila/Wah Cantt/Hasan Abdal: Rs 900. Islamabad: Rs 900. Rawalpindi (26 No.): Rs 850. Peshawar: Rs 1100. Mardan: Rs 1000. Abbottabad: Rs 1100. Mansehra: Rs 1300.'],
  ['How do I pay?', 'After selecting your seat on the platform, you can pay via your TaleemXpress wallet or upload a screenshot of your bank/EasyPaisa/JazzCash transfer. Admin will verify and confirm your booking.'],
  ['How does the ticketing system work?', 'Once your payment is approved by admin on the platform, your booking status changes to Confirmed. You can then download your digital ticket from your bookings page once the departure is finalized.'],
  ['What if I need to cancel?', 'You can request a cancellation through your bookings page on the platform. Refund requests must be submitted at least 12 hours before departure. A 30% service fee applies; 70% is returned to your wallet.'],
  ['Do I need WhatsApp to book?', 'No. The entire booking process — seat selection, payment, and confirmation — happens online at taleemxpress.app. You can optionally join our WhatsApp community for updates and announcements.'],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-clay-bg text-clay-text overflow-x-hidden">
      <Navbar />

      <main className="overflow-hidden pt-20 sm:pt-24">
        <section id="hero" className="relative px-4 pb-14 pt-8 sm:px-6 md:pb-24">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
              <span className="clay-badge bg-clay-accent text-clay-primary">Student-led &amp; Organized Transport</span>
              <div className="space-y-2 font-display text-4xl font-black leading-none sm:text-5xl md:text-7xl">
                <div className="font-black text-clay-primary">TaleemXpress</div>
                <div className="font-black text-clay-primary">Built for <span className="text-clay-accent">GIKI</span></div>
                <div className="font-black text-clay-primary">Students</div>
              </div>
              <p className="max-w-2xl text-base leading-7 text-clay-text-muted sm:text-lg sm:leading-8">Comfortable, safe, and reliable travel between GIKI and nearby cities. Book online, pick your seat, pay securely — and get your ticket once confirmed. Maximum 9-10 students per Hiace. Fixed transparent pricing. No hidden charges. Routes: ISB/RWP, Taxila/Wah/Hasan Abdal, Peshawar/Mardan, Abbottabad/Mansehra.</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link to="/bookings" className="clay-btn-primary inline-flex items-center gap-2">Book a Seat <ArrowRight size={16} /></Link>
                <Link to="/how-to-book" className="clay-btn-outline inline-flex items-center gap-2">How to Book</Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="clay-card p-4">
                    <div className="text-2xl font-display font-black text-clay-primary">{stat.value}</div>
                    <div className="mt-1 text-sm text-clay-text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="clay-card max-w-xl bg-clay-primary text-white">
                <p className="font-semibold text-clay-accent">Book online at taleemxpress.app</p>
                <p className="mt-2 text-sm text-white/85">Select seat → Pay → Get ticket once confirmed</p>
                <p className="mt-2 text-sm text-white/85">ISB: Rs 900 | RWP (26 No.): Rs 850</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }} className="relative">
              <div className="absolute inset-0 -z-10 rounded-full bg-clay-accent/15 blur-3xl" />
              <div className="absolute -right-4 top-8 h-32 w-32 rounded-full bg-clay-primary/10 blur-3xl" />
              <div className="overflow-hidden rounded-clay-lg border border-clay-border bg-clay-surface shadow-clay-lg">
                <div className="bg-gradient-to-br from-clay-primary to-clay-primary-light p-6 text-white">
                  <div className="flex items-center gap-3 text-sm font-semibold text-clay-accent"><BadgeCheck size={16} /> Fixed Route Pricing</div>
                  <h2 className="mt-4 font-display text-3xl font-bold">GIKI travel made organized.</h2>
                  <p className="mt-3 text-sm leading-7 text-white/80">Book seats with confidence, keep pricing transparent, and travel in smaller vans with a clear digital ticketing flow.</p>
                </div>
                <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                  <div className="rounded-clay bg-clay-bg p-4"><Bus className="text-clay-primary" /><p className="mt-2 text-sm font-semibold">9-10 / Hiace</p></div>
                  <div className="rounded-clay bg-clay-bg p-4"><Ticket className="text-clay-primary" /><p className="mt-2 text-sm font-semibold">Online Ticketing</p></div>
                  <div className="rounded-clay bg-clay-bg p-4"><ShieldCheck className="text-clay-primary" /><p className="mt-2 text-sm font-semibold">Transparent Pricing</p></div>
                  <div className="rounded-clay bg-clay-bg p-4"><CreditCard className="text-clay-primary" /><p className="mt-2 text-sm font-semibold">Secure Payment</p></div>
                  <div className="rounded-clay bg-clay-bg p-4"><MapPinned className="text-clay-primary" /><p className="mt-2 text-sm font-semibold">Multiple Routes</p></div>
                  <div className="rounded-clay bg-clay-bg p-4"><CalendarDays className="text-clay-primary" /><p className="mt-2 text-sm font-semibold">Quick Booking</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="about" className="px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-7xl rounded-clay-lg bg-clay-primary px-6 py-4 text-sm text-white shadow-clay-lg">
            Student-led platform for GIKI riders. No WhatsApp dependency. Clear confirmation flow.
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-7xl rounded-clay-lg border border-clay-border bg-gradient-to-r from-clay-primary to-clay-primary-light p-6 text-white shadow-clay-lg md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl space-y-3">
                <span className="clay-badge bg-clay-accent text-clay-primary">Transparent Route Pricing</span>
                <h2 className="font-display text-3xl font-bold md:text-5xl">GIKI ↔ Key City Routes</h2>
                <p className="text-white/80">Book your seat online in minutes. Select your seat, upload your payment screenshot, and receive your confirmed ticket once the admin approves. No WhatsApp required.</p>
              </div>
              <div className="grid gap-3 text-sm md:w-72">
                {['9-10 / Students per Hiace', 'Fixed / Route Pricing', 'Online / Ticketing System'].map((item) => <div key={item} className="rounded-clay bg-white/10 px-4 py-3 backdrop-blur">{item}</div>)}
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/bookings" className="rounded-full bg-clay-accent px-5 py-3 font-semibold text-clay-primary">Book a Seat Now</Link>
              <Link to="/how-to-book" className="rounded-full border border-white/20 px-5 py-3 font-semibold text-white">See How It Works</Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/85">
              <span>✓ Student-Led</span>
              <span>✓ Fixed Route Pricing</span>
              <span>✓ Ticket Issued After Confirmation</span>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-clay-accent">The Problem</p>
              <h2 className="font-display text-3xl font-black text-clay-primary sm:text-4xl md:text-6xl">Student Transport<br />Wasn't Working</h2>
              <p className="max-w-3xl text-base leading-7 text-clay-text-muted sm:text-lg sm:leading-8">Overcrowded vans. Unclear pricing. No receipts. No accountability. GIKIans deserved better — so we built it ourselves.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {problemCards.map(([icon, title, body]) => (
                <div key={title} className="clay-card space-y-3">
                  <div className="text-3xl">{icon}</div>
                  <h3 className="text-xl font-display font-bold text-clay-primary">{title}</h3>
                  <p className="text-sm leading-7 text-clay-text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-clay-accent">Our Solution</p>
              <h2 className="font-display text-3xl font-black text-clay-primary sm:text-4xl md:text-6xl">We Built What<br />Students Needed</h2>
              <p className="max-w-3xl text-base leading-7 text-clay-text-muted sm:text-lg sm:leading-8">A fully digital, student-led platform. Book online, select your seat, upload payment, and receive a confirmed digital ticket — all through taleemxpress.app. Transparency, fairness, and comfort. That's our promise.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-clay-primary">
              <span className="rounded-full bg-clay-surface px-4 py-2 shadow-clay">Built by GIKIans</span>
              <span className="rounded-full bg-clay-surface px-4 py-2 shadow-clay">100% Transparent</span>
              <span className="rounded-full bg-clay-surface px-4 py-2 shadow-clay">Book Online 24/7</span>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {solutionCards.map(([icon, title, body]) => (
                <div key={title} className="clay-card space-y-3">
                  <div className="text-3xl">{icon}</div>
                  <h3 className="text-xl font-display font-bold text-clay-primary">{title}</h3>
                  <p className="text-sm leading-7 text-clay-text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="font-display text-3xl font-black text-clay-primary sm:text-4xl md:text-6xl">Pricing</h2>
              <p className="text-xl text-clay-text-muted">Fixed &amp; Transparent Pricing</p>
              <p className="mx-auto max-w-3xl text-base text-clay-text-muted">Final route fares — no hidden charges, no variable pricing. Book your seat online.</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {pricingCards.map(([title, items]) => (
                <div key={title} className="clay-card flex flex-col justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-clay-primary">{title}</h3>
                    <div className="mt-4 space-y-2 text-sm text-clay-text-muted">
                      {items.map((item) => <p key={item}>• {item}</p>)}
                    </div>
                  </div>
                  <Link to="/bookings" className="clay-btn-primary inline-flex w-fit">Book This Route</Link>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-clay-text-muted">Fixed route pricing per seat • Online ticket issued after payment approval • Luggage: 1 medium bag + 1 small backpack</p>
          </div>
        </section>

        <section id="services" className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="font-display text-3xl font-black text-clay-primary sm:text-4xl md:text-6xl">Our Services</h2>
              <p className="text-xl text-clay-text-muted">Travel Options</p>
              <p className="mx-auto max-w-3xl text-base text-clay-text-muted">Choose your route and book online. Organized travel built for GIKI students.</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {serviceCards.map(([title, description, price, items]) => (
                <div key={title} className="clay-card flex flex-col gap-4">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-clay-primary">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-clay-text-muted">{description}</p>
                  </div>
                  <div className="rounded-clay bg-clay-bg p-4 text-sm text-clay-text-muted">
                    <div className="font-semibold text-clay-primary">Price: {price}</div>
                    <div className="mt-2 space-y-2">
                      {items.map((item) => <p key={item}>• {item}</p>)}
                    </div>
                  </div>
                  <Link to="/bookings" className="clay-btn-primary inline-flex w-fit">Book Now</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="font-display text-3xl font-black text-clay-primary sm:text-4xl md:text-6xl">Why Choose Us</h2>
              <p className="text-xl text-clay-text-muted">Features You'll Love</p>
              <p className="mx-auto max-w-3xl text-base text-clay-text-muted">Everything you need for a comfortable, hassle-free journey.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {featureCards.map(([icon, title, body]) => (
                <div key={title} className="clay-card space-y-3 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-clay-primary/10 text-2xl">{icon}</div>
                  <h3 className="text-lg font-display font-bold text-clay-primary">{title}</h3>
                  <p className="text-sm leading-7 text-clay-text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl rounded-clay-lg border border-clay-border bg-clay-surface p-6 shadow-clay-lg md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl space-y-3">
                <h2 className="font-display text-3xl font-black text-clay-primary md:text-5xl">How to Book</h2>
                <p className="text-xl text-clay-text-muted">Simple. Fast. Online.</p>
                <p className="text-base leading-7 text-clay-text-muted">Booking your seat on TaleemXpress takes less than 5 minutes. From signup to confirmed ticket — here's the quick version.</p>
              </div>
              <Link to="/how-to-book" className="clay-btn-primary inline-flex w-fit">See Complete Booking Guide</Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {['Sign Up / Log In', 'Browse & Book', 'Upload Payment', 'Get Confirmed'].map((step, index) => (
                <div key={step} className="rounded-clay bg-clay-bg p-4">
                  <div className="text-sm font-semibold text-clay-accent">0{index + 1}</div>
                  <div className="mt-2 font-semibold text-clay-primary">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl space-y-4 text-center">
            <h2 className="font-display text-4xl font-black text-clay-primary md:text-6xl">Testimonials</h2>
            <p className="text-xl text-clay-text-muted">What Students Say</p>
            <p className="text-base text-clay-text-muted">Don't just take our word for it — hear from fellow GIKIans.</p>
            <div className="clay-card mx-auto max-w-2xl text-center text-clay-text-muted">Reviews coming soon! Be one of the first to share your experience.</div>
          </div>
        </section>

        <section id="faq" className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="space-y-3 text-center">
              <h2 className="font-display text-4xl font-black text-clay-primary md:text-6xl">FAQ</h2>
              <p className="text-xl text-clay-text-muted">Frequently Asked Questions</p>
              <p className="text-base text-clay-text-muted">Got questions? We've got answers.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {faqs.map(([question, answer]) => (
                <div key={question} className="clay-card space-y-2">
                  <h3 className="text-lg font-display font-bold text-clay-primary">{question}</h3>
                  <p className="text-sm leading-7 text-clay-text-muted">{answer}</p>
                </div>
              ))}
            </div>
            <div className="clay-card space-y-3 text-center">
              <h3 className="text-2xl font-display font-bold text-clay-primary">Still have questions?</h3>
              <p className="text-sm text-clay-text-muted">Feel free to reach out to us directly.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <a href="mailto:xpresstaleem@gmail.com" className="clay-btn-primary inline-flex">Contact Support</a>
                <a href="https://chat.whatsapp.com/Hu5vK2qABoa78lNY1KrniJ" target="_blank" rel="noreferrer" className="clay-btn-outline inline-flex">Join WhatsApp Community</a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
