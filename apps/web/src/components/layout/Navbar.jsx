import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import logoImage from '../../assets/hiace (1).png';

const publicLinks = [
  { label: 'Home', href: '/#hero' },
  { label: 'About', href: '/#about' },
  { label: 'Services', href: '/#services' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Maps', to: '/maps' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'How to Book', to: '/how-to-book' },
];

export default function Navbar() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAnchor = (href) => {
    setMobileOpen(false);
    if (href.startsWith('/#')) {
      const id = href.slice(2);
      if (location.pathname !== '/') {
        navigate('/');
        window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
        return;
      }
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRoute = (to) => {
    setMobileOpen(false);
    navigate(to);
  };

  const getCta = () => {
    if (!user) return { label: 'Book a Seat', to: '/bookings' };
    if (user.role === 'admin') return { label: 'Admin Dashboard', to: '/admin' };
    return { label: 'Dashboard', to: '/dashboard' };
  };

  const cta = getCta();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-clay-primary text-white shadow-lg' : 'bg-transparent text-clay-primary'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => handleAnchor('/#hero')} className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-clay-border bg-white shadow-clay">
            <img src={logoImage} alt="TaleemXpress logo" className="h-full w-full object-cover" />
          </span>
          <span className={`font-display text-xl font-extrabold tracking-tight ${scrolled ? 'text-clay-accent' : 'text-clay-primary'}`}>
            TaleemXpress
          </span>
        </button>

        <nav className="hidden items-center gap-6 md:flex">
          {publicLinks.map((item) => (
            item.href ? (
              <button key={item.label} type="button" onClick={() => handleAnchor(item.href)} className={`text-sm font-medium transition-colors ${scrolled ? 'text-white/85 hover:text-white' : 'text-clay-primary/80 hover:text-clay-primary'}`}>
                {item.label}
              </button>
            ) : (
              <button key={item.label} type="button" onClick={() => handleRoute(item.to)} className={`text-sm font-medium transition-colors ${scrolled ? 'text-white/85 hover:text-white' : 'text-clay-primary/80 hover:text-clay-primary'}`}>
                {item.label}
              </button>
            )
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!user ? (
            <>
              <Link to="/login" className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${scrolled ? 'border-white/30 text-white hover:bg-white/10' : 'border-clay-primary text-clay-primary hover:bg-clay-primary/5'}`}>
                Sign In
              </Link>
              <Link to={cta.to} className="rounded-full bg-clay-accent px-4 py-2 text-sm font-semibold text-clay-primary transition-colors hover:bg-clay-accent-dark">
                {cta.label}
              </Link>
            </>
          ) : (
            <Link to={cta.to} className="rounded-full bg-clay-accent px-4 py-2 text-sm font-semibold text-clay-primary transition-colors hover:bg-clay-accent-dark">
              {cta.label}
            </Link>
          )}
        </div>

        <button type="button" onClick={() => setMobileOpen((value) => !value)} className={`rounded-full border p-2 md:hidden ${scrolled ? 'border-white/20 text-white' : 'border-clay-primary/20 text-clay-primary'}`}>
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-clay-primary px-4 py-4 text-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            {publicLinks.map((item) => (
              item.href ? (
                <button key={item.label} type="button" onClick={() => handleAnchor(item.href)} className="text-left text-sm font-medium text-white/85">
                  {item.label}
                </button>
              ) : (
                <button key={item.label} type="button" onClick={() => handleRoute(item.to)} className="text-left text-sm font-medium text-white/85">
                  {item.label}
                </button>
              )
            ))}
            <div className="pt-2">
              <Link to={cta.to} className="inline-flex rounded-full bg-clay-accent px-4 py-2 text-sm font-semibold text-clay-primary">
                {cta.label}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}