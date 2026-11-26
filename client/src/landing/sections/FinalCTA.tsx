import { Chip } from '../components/Brand';
import { Button } from '../components/Button';
import { Reveal, SplitWords } from '../components/Reveal';

export function FinalCTA({
  eyebrow = 'Your next move starts here',
  title = 'Think Smarter. Invest With Clarity.',
  description = 'Discover a more intelligent way to navigate the financial world. Everything you need to understand the markets starts with GMPX.',
  primaryLabel = 'Get Started',
  primaryTo = '/pricing',
  secondaryLabel = 'Explore the Platform',
  secondaryTo = '/products',
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}) {
  return (
    <section className="final-cta grain" aria-label="Get started with GMPX">
      <div className="final-cta-grid fin-grid" aria-hidden="true" />
      <svg
        className="final-cta-lines"
        viewBox="0 0 1440 620"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ctaLine" x1="0" y1="0" x2="1440" y2="620" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4C7A1E" stopOpacity="0" />
            <stop offset="0.35" stopColor="#4C7A1E" stopOpacity="0.38" />
            <stop offset="0.7" stopColor="#8FD83C" stopOpacity="0.28" />
            <stop offset="1" stopColor="#4C7A1E" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M-40 470 C 250 470, 300 130, 620 170 S 1030 520, 1480 240" stroke="url(#ctaLine)" strokeWidth="1" strokeDasharray="5 8" />
        <path d="M-20 540 C 330 500, 480 330, 720 350 S 1090 470, 1460 330" stroke="url(#ctaLine)" strokeWidth="0.8" strokeDasharray="3 9" />
        <path d="M120 620 C 380 500, 560 430, 780 440 S 1180 380, 1500 120" stroke="url(#ctaLine)" strokeWidth="0.7" />
        <circle cx="620" cy="170" r="3.5" fill="#4C7A1E" fillOpacity="0.55" />
        <circle cx="1030" cy="520" r="3" fill="#4C7A1E" fillOpacity="0.45" />
        <circle cx="720" cy="350" r="2.5" fill="#4C7A1E" fillOpacity="0.5" />
      </svg>

      <Reveal>
        <Chip>{eyebrow}</Chip>
      </Reveal>
      <h2 className="final-title">
        <SplitWords text={title} />
      </h2>
      <Reveal delay={0.12}>
        <p className="final-sub">{description}</p>
      </Reveal>
      <Reveal delay={0.18}>
        <div className="final-ctas">
          <Button to={primaryTo} variant="lime" size="lg" arrow>
            {primaryLabel}
          </Button>
          <Button to={secondaryTo} variant="ghost" size="lg">
            {secondaryLabel}
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
