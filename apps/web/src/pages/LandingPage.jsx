import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BadgeCheck, Bus, CalendarDays, ChevronDown, Check, CreditCard,
  MapPinned, Quote, ShieldCheck, Sparkles, Ticket,
} from 'lucide-react';
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
  ['GIK', 'ISB / RWP', 'Islamabad / Rawalpindi ↔ GIKI', [['Islamabad', 900], ['Rawalpindi (26 No.)', 850]]],
  ['GIK', 'TXL', 'Taxila / Wah Cantt / Hasan Abdal ↔ GIKI', [['Taxila / Wah / Hasan Abdal', 900]]],
  ['GIK', 'PEW', 'Peshawar / Mardan ↔ GIKI', [['Peshawar', 1100], ['Mardan', 1000]]],
  ['GIK', 'ABT', 'Abbottabad / Mansehra ↔ GIKI', [['Abbottabad', 1100], ['Mansehra', 1300]]],
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

const bookingSteps = [
  ['Sign Up / Log In', 'Create your account with your GIKI email in under a minute.'],
  ['Browse & Book', 'Pick your route, date, and seat from live availability.'],
  ['Upload Payment', 'Pay via wallet or upload your transfer screenshot.'],
  ['Get Confirmed', 'Admin verifies, and your digital ticket unlocks.'],
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

// Shared "punched ticket" divider — the visual signature carried through the hero and pricing cards
function TicketPerforation() {
  return (
    <div className="relative my-1">
      <div className="absolute -left-[1.4rem] top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-clay-bg sm:-left-[1.9rem] sm:h-7 sm:w-7" />
      <div className="absolute -right-[1.4rem] top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-clay-bg sm:-right-[1.9rem] sm:h-7 sm:w-7" />
      <div className="border-t-2 border-dashed border-clay-border" />
    </div>
  );
}

function SectionEyebrow({ children }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-clay-accent">
      <span className="h-px w-6 bg-clay-accent" />
      {children}
    </p>
  );
}

function FaqItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className={`clay-card cursor-pointer select-none p-4 transition-colors sm:p-5 ${isOpen ? 'ring-1 ring-clay-primary/20' : ''}`} onClick={onToggle}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-display font-bold text-clay-primary sm:text-base">{question}</h3>
        <ChevronDown size={18} className={`flex-shrink-0 text-clay-accent transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pt-3 text-sm leading-7 text-clay-text-muted">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-clay-bg text-clay-text overflow-x-hidden">
      <Navbar />

      <main className="overflow-hidden pt-20 sm:pt-24">
        {/* HERO */}
        <section id="hero" className="relative px-4 pb-14 pt-8 sm:px-6 md:pb-24">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
              <span className="clay-badge inline-flex items-center gap-1.5 bg-clay-accent text-clay-primary">
                <Sparkles size={13} /> Student-led &amp; Organized Transport
              </span>
              <div className="space-y-1 font-display text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl md:text-7xl">
                <div className="text-clay-primary">TaleemXpress</div>
                <div className="text-clay-primary">Built for <span className="text-clay-accent">GIKI</span></div>
                <div className="text-clay-primary">Students</div>
              </div>
              <p className="max-w-2xl text-base leading-7 text-clay-text-muted sm:text-lg sm:leading-8">
                Comfortable, safe, and reliable travel between GIKI and nearby cities. Book online, pick your seat, pay securely — and get your ticket once confirmed. Maximum 9-10 students per Hiace, fixed transparent pricing, no hidden charges.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link to="/register" className="clay-btn-primary inline-flex items-center justify-center gap-2">
                  Register Now <ArrowRight size={16} />
                </Link>
                <Link to="/how-to-book" className="clay-btn-outline inline-flex items-center justify-center gap-2">
                  How to Book
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="clay-card p-3 sm:p-4">
                    <div className="font-display text-lg font-black text-clay-primary sm:text-2xl">{stat.value}</div>
                    <div className="mt-1 text-[11px] leading-tight text-clay-text-muted sm:text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Signature element: hero digital ticket */}
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }} className="relative">
              <div className="absolute inset-0 -z-10 rounded-full bg-clay-accent/15 blur-3xl" />
              <div className="absolute -right-4 top-8 h-32 w-32 rounded-full bg-clay-primary/10 blur-3xl" />
              <div className="overflow-hidden rounded-clay-lg border border-clay-border bg-clay-surface shadow-clay-lg">
                <div className="bg-gradient-to-br from-clay-primary to-clay-primary-light p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-clay-accent">
                      <BadgeCheck size={16} /> Digital Ticket
                    </div>
                    <Ticket size={20} className="text-white/60" />
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/60">From</p>
                      <p className="font-display text-2xl font-bold">GIKI</p>
                    </div>
                    <ArrowRight size={20} className="mb-1 text-clay-accent" />
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-white/60">To</p>
                      <p className="font-display text-2xl font-bold">ISB / RWP</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/80">Fixed-fare seats, verified payment, confirmed ticket — the whole ride organized in one app.</p>
                </div>

                <TicketPerforation />

                <div className="grid grid-cols-2 gap-3 p-5 sm:p-6">
                  <div className="rounded-clay bg-clay-bg p-3.5"><Bus className="text-clay-primary" size={18} /><p className="mt-2 text-xs font-semibold sm:text-sm">9-10 / Hiace</p></div>
                  <div className="rounded-clay bg-clay-bg p-3.5"><Ticket className="text-clay-primary" size={18} /><p className="mt-2 text-xs font-semibold sm:text-sm">Online Ticketing</p></div>
                  <div className="rounded-clay bg-clay-bg p-3.5"><ShieldCheck className="text-clay-primary" size={18} /><p className="mt-2 text-xs font-semibold sm:text-sm">Transparent Pricing</p></div>
                  <div className="rounded-clay bg-clay-bg p-3.5"><CreditCard className="text-clay-primary" size={18} /><p className="mt-2 text-xs font-semibold sm:text-sm">Secure Payment</p></div>
                  <div className="rounded-clay bg-clay-bg p-3.5"><MapPinned className="text-clay-primary" size={18} /><p className="mt-2 text-xs font-semibold sm:text-sm">Multiple Routes</p></div>
                  <div className="rounded-clay bg-clay-bg p-3.5"><CalendarDays className="text-clay-primary" size={18} /><p className="mt-2 text-xs font-semibold sm:text-sm">Quick Booking</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ANNOUNCEMENT STRIP */}
        <section id="about" className="px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 rounded-clay-lg bg-clay-primary px-6 py-3.5 text-center text-sm text-white shadow-clay-lg">
            <ShieldCheck size={16} className="flex-shrink-0 text-clay-accent" />
            Student-led platform for GIKI riders. No WhatsApp dependency. Clear confirmation flow.
          </div>
        </section>

        {/* ROUTES BANNER */}
        <section className="px-4 py-14 sm:px-6 sm:py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}
            className="mx-auto max-w-7xl rounded-clay-lg border border-clay-border bg-gradient-to-r from-clay-primary to-clay-primary-light p-6 text-white shadow-clay-lg md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl space-y-3">
                <span className="clay-badge bg-clay-accent text-clay-primary">Transparent Route Pricing</span>
                <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">GIKI ↔ Key City Routes</h2>
                <p className="text-white/80">Book your seat online in minutes. Select your seat, upload your payment screenshot, and receive your confirmed ticket once the admin approves. No WhatsApp required.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3 md:w-72 md:grid-cols-1">
                {['9-10 Students per Hiace', 'Fixed Route Pricing', 'Online Ticketing System'].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-clay bg-white/10 px-4 py-3 backdrop-blur">
                    <Check size={15} className="flex-shrink-0 text-clay-accent" /> {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/bookings" className="rounded-full bg-clay-accent px-5 py-3 text-center font-semibold text-clay-primary transition-transform hover:scale-[1.02]">Book a Seat Now</Link>
              <Link to="/how-to-book" className="rounded-full border border-white/20 px-5 py-3 text-center font-semibold text-white transition-colors hover:bg-white/10">See How It Works</Link>
            </div>
          </motion.div>
        </section>

        {/* PROBLEM */}
        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="space-y-3">
              <SectionEyebrow>The Problem</SectionEyebrow>
              <h2 className="font-display text-3xl font-black tracking-tight text-clay-primary sm:text-4xl md:text-6xl">Student Transport<br />Wasn't Working</h2>
              <p className="max-w-3xl text-base leading-7 text-clay-text-muted sm:text-lg sm:leading-8">Overcrowded vans. Unclear pricing. No receipts. No accountability. GIKIans deserved better — so we built it ourselves.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {problemCards.map(([icon, title, body]) => (
                <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4 }}
                  className="clay-card space-y-3 transition-shadow hover:shadow-clay-lg">
                  <div className="flex h-11 w-11 items-center justify-center rounded-clay bg-clay-bg text-2xl">{icon}</div>
                  <h3 className="text-xl font-display font-bold text-clay-primary">{title}</h3>
                  <p className="text-sm leading-7 text-clay-text-muted">{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTION */}
        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="space-y-3">
              <SectionEyebrow>Our Solution</SectionEyebrow>
              <h2 className="font-display text-3xl font-black tracking-tight text-clay-primary sm:text-4xl md:text-6xl">We Built What<br />Students Needed</h2>
              <p className="max-w-3xl text-base leading-7 text-clay-text-muted sm:text-lg sm:leading-8">A fully digital, student-led platform. Book online, select your seat, upload payment, and receive a confirmed digital ticket — all through taleemxpress.app. Transparency, fairness, and comfort. That's our promise.</p>
            </div>
            <div className="flex flex-wrap gap-2.5 text-xs font-semibold text-clay-primary sm:gap-3 sm:text-sm">
              {['Built by GIKIans', '100% Transparent', 'Book Online 24/7'].map((tag) => (
                <span key={tag} className="rounded-full bg-clay-surface px-4 py-2 shadow-clay">{tag}</span>
              ))}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {solutionCards.map(([icon, title, body]) => (
                <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4 }}
                  className="clay-card space-y-3 transition-shadow hover:shadow-clay-lg">
                  <div className="flex h-11 w-11 items-center justify-center rounded-clay bg-clay-bg text-2xl">{icon}</div>
                  <h3 className="text-xl font-display font-bold text-clay-primary">{title}</h3>
                  <p className="text-sm leading-7 text-clay-text-muted">{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING — ticket-stub cards, the signature motif reused */}
        <section id="pricing" className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="space-y-3 text-center">
              <SectionEyebrow>
                <span className="mx-auto">Fixed &amp; Transparent Pricing</span>
              </SectionEyebrow>
              <h2 className="font-display text-3xl font-black tracking-tight text-clay-primary sm:text-4xl md:text-6xl">Pricing</h2>
              <p className="mx-auto max-w-3xl text-base text-clay-text-muted">Final route fares — no hidden charges, no variable pricing. Book your seat online.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {pricingCards.map(([fromCode, toCode, title, items]) => (
                <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4 }}
                  className="overflow-hidden rounded-clay-lg border border-clay-border bg-clay-surface shadow-clay transition-shadow hover:shadow-clay-lg">
                  <div className="flex items-center justify-between bg-clay-primary/5 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg font-black text-clay-primary">{fromCode}</span>
                      <ArrowRight size={14} className="text-clay-accent" />
                      <span className="font-display text-lg font-black text-clay-primary">{toCode}</span>
                    </div>
                    <Ticket size={18} className="text-clay-primary/40" />
                  </div>
                  <div className="px-6 pt-4">
                    <h3 className="text-lg font-display font-bold text-clay-primary sm:text-xl">{title}</h3>
                  </div>
                  <div className="px-6">
                    <TicketPerforation />
                  </div>
                  <div className="space-y-2.5 px-6 py-4">
                    {items.map(([label, price]) => (
                      <div key={label} className="flex items-center justify-between text-sm">
                        <span className="text-clay-text-muted">{label}</span>
                        <span className="font-display font-bold text-clay-primary">Rs {price} <span className="font-sans text-xs font-normal text-clay-text-muted">/ seat</span></span>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 pb-6">
                    <Link to="/bookings" className="clay-btn-primary flex w-full items-center justify-center gap-2">Book This Route <ArrowRight size={15} /></Link>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-sm text-clay-text-muted">Fixed route pricing per seat • Online ticket issued after payment approval • Luggage: 1 medium bag + 1 small backpack</p>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="space-y-3 text-center">
              <SectionEyebrow><span className="mx-auto">Travel Options</span></SectionEyebrow>
              <h2 className="font-display text-3xl font-black tracking-tight text-clay-primary sm:text-4xl md:text-6xl">Our Services</h2>
              <p className="mx-auto max-w-3xl text-base text-clay-text-muted">Choose your route and book online. Organized travel built for GIKI students.</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {serviceCards.map(([title, description, price, items]) => (
                <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4 }}
                  className="clay-card flex flex-col gap-4 transition-shadow hover:shadow-clay-lg">
                  <div>
                    <h3 className="text-xl font-display font-bold text-clay-primary sm:text-2xl">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-clay-text-muted">{description}</p>
                  </div>
                  <div className="rounded-clay bg-clay-bg p-4 text-sm text-clay-text-muted">
                    <div className="font-semibold text-clay-primary">Price: {price}</div>
                    <div className="mt-2 space-y-1.5">
                      {items.map((item) => (
                        <div key={item} className="flex items-start gap-2">
                          <Check size={13} className="mt-0.5 flex-shrink-0 text-clay-accent" /> <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Link to="/bookings" className="clay-btn-primary mt-auto inline-flex w-fit items-center gap-2">Book Now <ArrowRight size={14} /></Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="space-y-3 text-center">
              <SectionEyebrow><span className="mx-auto">Features You'll Love</span></SectionEyebrow>
              <h2 className="font-display text-3xl font-black tracking-tight text-clay-primary sm:text-4xl md:text-6xl">Why Choose Us</h2>
              <p className="mx-auto max-w-3xl text-base text-clay-text-muted">Everything you need for a comfortable, hassle-free journey.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {featureCards.map(([icon, title, body]) => (
                <motion.div key={title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4 }}
                  className="clay-card space-y-2.5 p-4 text-center transition-shadow hover:shadow-clay-lg sm:space-y-3 sm:p-6">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-clay-primary/10 text-xl sm:h-14 sm:w-14 sm:text-2xl">{icon}</div>
                  <h3 className="text-sm font-display font-bold text-clay-primary sm:text-lg">{title}</h3>
                  <p className="text-[11px] leading-5 text-clay-text-muted sm:text-sm sm:leading-7">{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW TO BOOK — real sequence, numbering is earned here */}
        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl rounded-clay-lg border border-clay-border bg-clay-surface p-6 shadow-clay-lg md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl space-y-3">
                <SectionEyebrow>Simple. Fast. Online.</SectionEyebrow>
                <h2 className="font-display text-3xl font-black tracking-tight text-clay-primary md:text-5xl">How to Book</h2>
                <p className="text-base leading-7 text-clay-text-muted">Booking your seat on TaleemXpress takes less than 5 minutes. From signup to confirmed ticket — here's the quick version.</p>
              </div>
              <Link to="/how-to-book" className="clay-btn-primary inline-flex w-fit items-center gap-2 whitespace-nowrap">See Complete Guide <ArrowRight size={15} /></Link>
            </div>
            <div className="relative mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="absolute left-0 right-0 top-[26px] hidden h-px bg-clay-border md:block" />
              {bookingSteps.map(([step, body], index) => (
                <div key={step} className="relative rounded-clay bg-clay-bg p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clay-primary text-xs font-bold text-white">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="mt-3 font-semibold text-clay-primary">{step}</div>
                  <p className="mt-1 text-xs leading-5 text-clay-text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl space-y-4 text-center">
            <SectionEyebrow><span className="mx-auto">What Students Say</span></SectionEyebrow>
            <h2 className="font-display text-4xl font-black tracking-tight text-clay-primary md:text-6xl">Testimonials</h2>
            <p className="text-base text-clay-text-muted">Don't just take our word for it — hear from fellow GIKIans.</p>
            <div className="clay-card mx-auto max-w-2xl space-y-3 text-center">
              <Quote className="mx-auto text-clay-accent" size={28} />
              <p className="text-clay-text-muted">Reviews coming soon! Be one of the first to share your experience.</p>
            </div>
          </div>
        </section>

        {/* FAQ — accordion for scannability */}
        <section id="faq" className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="space-y-3 text-center">
              <SectionEyebrow><span className="mx-auto">Frequently Asked Questions</span></SectionEyebrow>
              <h2 className="font-display text-4xl font-black tracking-tight text-clay-primary md:text-6xl">FAQ</h2>
              <p className="text-base text-clay-text-muted">Got questions? We've got answers.</p>
            </div>
            <div className="mx-auto grid max-w-4xl gap-3">
              {faqs.map(([question, answer], index) => (
                <FaqItem
                  key={question}
                  question={question}
                  answer={answer}
                  isOpen={openFaq === index}
                  onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
                />
              ))}
            </div>
            <div className="clay-card mx-auto max-w-2xl space-y-3 text-center">
              <h3 className="text-2xl font-display font-bold text-clay-primary">Still have questions?</h3>
              <p className="text-sm text-clay-text-muted">Feel free to reach out to us directly.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <a href="mailto:xpresstaleem@gmail.com" className="clay-btn-primary inline-flex items-center gap-2">Contact Support</a>
                <a href="https://chat.whatsapp.com/Hu5vK2qABoa78lNY1KrniJ" target="_blank" rel="noreferrer" className="clay-btn-outline inline-flex items-center gap-2">Join WhatsApp Community</a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}