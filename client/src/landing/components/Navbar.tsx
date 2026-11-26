import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logo } from './Brand';
import { Button } from './Button';
import { usePrefersReducedMotion } from '../hooks/useEnvironment';

const NAV_ITEMS = [
  { label: 'Markets', to: '/markets' },
  { label: 'Products', to: '/products' },
  { label: 'Intelligence', to: '/intelligence' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
];

export function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = usePrefersReducedMotion();
  const onHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <header className={`gmp-nav ${scrolled || !onHome ? 'is-scrolled' : ''}`}>
        <div className="gmp-container gmp-nav-inner">
          <Link to="/" aria-label="GMPX home" className="gmp-logo">
            <Logo />
          </Link>

          <nav className="gmp-nav-links" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `gmp-nav-link ${isActive ? 'is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="gmp-nav-actions">
            <Link to="/dashboard" className="gmp-nav-signin">
              Sign In
            </Link>
            <Button to="/pricing" variant="lime" size="sm" arrow className="gmp-nav-cta">
              Get Started
            </Button>
            <button
              type="button"
              className="nav-burger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            initial={reduce ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <div className="mobile-menu-head">
              <Link to="/" aria-label="GMPX home" onClick={() => setOpen(false)}>
                <Logo />
              </Link>
              <button
                type="button"
                className="nav-burger"
                style={{ display: 'inline-flex' }}
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mobile-menu-links" aria-label="Mobile primary">
              {NAV_ITEMS.map((item, index) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="mobile-menu-link"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                  <span>0{index + 1}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mobile-menu-foot">
              <Button to="/dashboard" variant="ink" onClick={() => setOpen(false)} arrow>
                Open Terminal
              </Button>
              <Button to="/pricing" variant="lime" onClick={() => setOpen(false)} arrow>
                Get Started
              </Button>
              <p className="eyebrow" style={{ marginTop: 8 }}>
                The Market. Without Limits.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
