import { Link } from 'react-router-dom';

const routeLinks = [
  'Islamabad / Rawalpindi',
  'Hasan Abdal / Taxila / Wah Cantt',
  'Peshawar / Mardan',
  'Abbottabad / Mansehra',
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-clay-border bg-clay-surface text-clay-text">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div className="space-y-4 md:col-span-1">
          <div>
            <h3 className="font-display text-2xl font-extrabold text-clay-primary">TaleemXpress</h3>
            <p className="mt-3 text-sm leading-6 text-clay-text-muted">Student-led transport service built by GIKIans for GIKIans. Online booking, organized ticketing, and reliable travel operations.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-clay-primary">
            <span className="rounded-full bg-clay-surface-2 px-3 py-1">Built by Students</span>
            <span className="rounded-full bg-clay-surface-2 px-3 py-1">Online Booking</span>
            <span className="rounded-full bg-clay-surface-2 px-3 py-1">Trusted Service</span>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold text-clay-primary">Quick Links</h4>
          <div className="mt-4 flex flex-col gap-2 text-sm text-clay-text-muted">
            <Link to="/#hero">Home</Link>
            <Link to="/#services">Services</Link>
            <Link to="/#pricing">Pricing</Link>
            <Link to="/how-to-book">How to Book</Link>
            <Link to="/#faq">FAQ</Link>
            <Link to="/maps">Maps</Link>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold text-clay-primary">Our Routes</h4>
          <div className="mt-4 flex flex-col gap-2 text-sm text-clay-text-muted">
            {routeLinks.map((item) => (
              <Link key={item} to="/bookings">{item}</Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold text-clay-primary">Contact</h4>
          <div className="mt-4 flex flex-col gap-2 text-sm text-clay-text-muted">
            <a href="mailto:xpresstaleem@gmail.com">xpresstaleem@gmail.com</a>
            <a href="https://chat.whatsapp.com/Hu5vK2qABoa78lNY1KrniJ" target="_blank" rel="noreferrer">WhatsApp Community</a>
          </div>
        </div>
      </div>

      <div className="border-t border-clay-border px-6 py-5 text-center text-sm text-clay-text-muted">
        © {currentYear} TaleemXpress. All rights reserved. Student-led Transport.
      </div>
    </footer>
  );
}