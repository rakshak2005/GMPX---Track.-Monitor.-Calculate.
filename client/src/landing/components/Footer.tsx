import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Logo } from './Brand';

const COLUMNS = [
  {
    title: 'Platform',
    links: [
      { label: 'Markets', to: '/markets' },
      { label: 'Analytics', to: '/intelligence' },
      { label: 'Portfolio', to: '/products#portfolio' },
      { label: 'Intelligence', to: '/intelligence' },
      { label: 'Open Terminal', to: '/dashboard' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About GMPX', to: '/about' },
      { label: 'Our Technology', to: '/about#technology' },
      { label: 'Careers', to: '/about#careers' },
      { label: 'Contact', to: '/about#contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Market Insights', to: '/intelligence#signals' },
      { label: 'Documentation', to: '/products#docs' },
      { label: 'Help Center', to: '/pricing#faq' },
      { label: 'FAQs', to: '/pricing#faq' },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setJoined(true);
    setEmail('');
  };

  return (
    <footer className="gmp-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link to="/" aria-label="GMPX home">
            <Logo />
          </Link>
          <p className="footer-desc">Financial intelligence for a world that never stops moving.</p>

          <form className="footer-brief" onSubmit={onSubmit} aria-label="Subscribe to the GMPX market brief">
            <label htmlFor="footer-email" className="sr-only" style={{ position: 'absolute', left: -9999 }}>
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              className="gmp-input"
              placeholder="The daily market brief"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
              aria-invalid={Boolean(error)}
              aria-describedby="footer-brief-note"
            />
            <button type="submit" aria-label="Subscribe">
              {joined ? <Check size={15} /> : <ArrowRight size={15} />}
            </button>
          </form>
          <p id="footer-brief-note" className="footer-brief-note" role="status">
            {error || (joined ? 'You are on the list. Demo signup, no email sent.' : 'Illustrative demo signup. No email sent.')}
          </p>

          <div className="footer-status" style={{ marginTop: 18 }}>
            <span className="chip-dot" aria-hidden="true" />
            Global desk · Demo environment
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="footer-col-title">{column.title}</h2>
            <nav aria-label={column.title}>
              {column.links.map((link) => (
                <Link key={link.label} to={link.to} className="footer-link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="footer-mid">
        <div className="footer-legal">
          <span>© 2026 GMPX. All rights reserved.</span>
          <Link to="/about#privacy">Privacy Policy</Link>
          <Link to="/about#terms">Terms of Service</Link>
          <Link to="/about#risk">Risk Disclosure</Link>
        </div>
        <span className="eyebrow" style={{ fontSize: 8 }}>
          The Market. Without Limits.
        </span>
      </div>

      <p className="footer-disclaimer">
        All market information shown in this demonstration is illustrative and does not constitute investment advice.
        Market data, performance figures and platform metrics are sample content. Investing involves risk, including
        possible loss of principal.
      </p>

      <div className="footer-wordmark" aria-hidden="true">
        GMPX
      </div>
    </footer>
  );
}
