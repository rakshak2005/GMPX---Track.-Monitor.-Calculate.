import { ArrowUpRight, Check, Globe2, Mail, MapPin } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { Button } from '../components/Button';
import { WorldMap } from '../components/WorldMap';
import { FinalCTA } from '../sections/FinalCTA';

const VALUES = [
  {
    n: '01',
    title: 'Clarity over noise',
    copy: 'More data is not the same as more understanding. We remove everything that does not help a decision.',
  },
  {
    n: '02',
    title: 'Evidence over opinion',
    copy: 'Every signal shows its inputs. Every claim should be inspectable, challengeable and falsifiable.',
  },
  {
    n: '03',
    title: 'Long-term over hype',
    copy: 'We build for investors who think in years, not screenshots. Durability is the feature.',
  },
  {
    n: '04',
    title: 'Access over exclusivity',
    copy: 'Institutional-grade context should not be reserved for institutions. Better tools make better participants.',
  },
];

const TIMELINE = [
  { year: '2024', title: 'The question', copy: 'Why does understanding the market still require stitching together five tools and a dozen tabs?' },
  { year: '2025', title: 'The platform', copy: 'The first GMPX market workspace connects global indices, charts and a readable market state.' },
  { year: '2026', title: 'The intelligence layer', copy: 'Signals, portfolio context and a unified global experience — designed as one continuous surface.' },
];

const ROLES = [
  { title: 'Market Data Engineer', meta: 'Remote · Full-time' },
  { title: 'Product Designer', meta: 'London / Remote · Full-time' },
  { title: 'Quantitative Researcher', meta: 'Mumbai · Full-time' },
  { title: 'Platform Engineer', meta: 'New York / Remote · Full-time' },
];

const OFFICES = [
  { city: 'New York', line: 'Global market desk' },
  { city: 'London', line: 'Product & research' },
  { city: 'Mumbai', line: 'Data & engineering' },
  { city: 'Singapore', line: 'Asia coverage' },
];

export function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About · GMPX"
        title={
          <>
            We build for the space
            <br />
            between data and decision.
          </>
        }
        description="GMPX is a market intelligence company for people who take the market seriously. We believe the advantage is not more information — it is a clearer way to understand it."
        actions={
          <>
            <Button href="#contact" variant="ink" arrow>
              Contact GMPX
            </Button>
            <Button to="/products" variant="ghost">
              See the Platform
            </Button>
          </>
        }
        aside={
          <div className="dark-card overflow-hidden" style={{ height: 360 }}>
            <div className="absolute left-4 top-4 z-10">
              <span className="eyebrow" style={{ color: 'rgba(244,248,245,.45)', fontSize: 7.5 }}>
                Global coverage · demo map
              </span>
            </div>
            <WorldMap />
          </div>
        }
      />

      <section className="page-section" aria-label="Our mission">
        <div className="gmp-container">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
            <div>
              <div className="section-kicker">Our mission</div>
              <h2 className="mt-5 max-w-[760px] text-[clamp(30px,4.2vw,56px)] font-medium leading-[1.02] tracking-[-.05em]">
                Markets are complex.
                <br />
                Understanding them shouldn't be.
              </h2>
            </div>
            <div className="space-y-4 text-[13px] leading-[1.75]" style={{ color: '#4A5750' }}>
              <p>
                GMPX was built from a simple frustration: the modern investor has access to more market information than
                ever, yet the experience of understanding it is still fragmented, noisy and often designed for
                transactions rather than thought.
              </p>
              <p>
                We are building a different kind of financial platform — one that treats clarity as a product feature.
                A place where a global index, a portfolio and an AI-assisted signal share the same language and the
                same source of truth.
              </p>
              <p className="stats-note" style={{ marginTop: 10 }}>
                GMPX is presented here as a product demonstration. Company details, roles and metrics are illustrative.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section page-section-alt" aria-label="Operating principles">
        <div className="gmp-container">
          <SectionHeading
            kicker="Operating principles"
            title="Four things we refuse to compromise."
            sub="These principles shape the product, the data and the way we communicate uncertainty."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, index) => (
              <Reveal key={value.n} delay={index * 0.05} className="light-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="num-mono text-[10px]" style={{ color: '#4C7A1E' }}>
                    {value.n}
                  </span>
                  <Check size={13} style={{ color: '#4C7A1E' }} aria-hidden="true" />
                </div>
                <h3 className="mt-8 text-[18px] font-medium leading-[1.1] tracking-[-.03em]">{value.title}</h3>
                <p className="mt-3 text-[11.5px] leading-relaxed" style={{ color: '#6E7A73' }}>
                  {value.copy}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section" aria-label="Our timeline">
        <div className="gmp-container">
          <SectionHeading kicker="The path" title="Built in public. Shaped by use." />
          <div className="mt-8 grid gap-0 md:grid-cols-3">
            {TIMELINE.map((item, index) => (
              <Reveal key={item.year} delay={index * 0.06} className="border-t pt-5 md:pr-8">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="num-mono text-[11px]" style={{ color: '#4C7A1E' }}>
                    {item.year}
                  </span>
                  <span className="eyebrow" style={{ fontSize: 7 }}>
                    Chapter 0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-[24px] font-medium tracking-[-.04em]">{item.title}</h3>
                <p className="mt-2 max-w-[340px] text-[12px] leading-relaxed" style={{ color: '#6E7A73' }}>
                  {item.copy}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section-alt" id="technology" aria-label="Our technology">
        <div className="gmp-container">
          <SectionHeading
            kicker="Technology"
            title="A market layer built to be trusted."
            sub="Normalized data, transparent signals and a delivery layer designed for dense financial interfaces."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
            <Reveal className="light-card p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="eyebrow" style={{ fontSize: 7.5 }}>
                  Data architecture · simplified
                </span>
                <Globe2 size={15} style={{ color: '#4C7A1E' }} aria-hidden="true" />
              </div>
              <svg
                viewBox="0 0 760 250"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                style={{ width: '100%', height: 'auto', marginTop: 18 }}
              >
                <defs>
                  <linearGradient id="flowLine" x1="0" y1="0" x2="760" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4C7A1E" stopOpacity=".2" />
                    <stop offset=".5" stopColor="#4C7A1E" stopOpacity=".7" />
                    <stop offset="1" stopColor="#4C7A1E" stopOpacity=".2" />
                  </linearGradient>
                </defs>
                {[
                  { x: 16, label: 'INGEST', sub: 'markets · feeds' },
                  { x: 208, label: 'NORMALIZE', sub: 'one schema' },
                  { x: 400, label: 'INTERPRET', sub: 'signal engine' },
                  { x: 592, label: 'ILLUMINATE', sub: 'interface' },
                ].map((node, index) => (
                  <g key={node.label}>
                    <rect x={node.x} y="70" width="152" height="86" rx="5" fill="rgba(11,21,18,.025)" stroke="rgba(11,21,18,.12)" />
                    <text x={node.x + 14} y="98" fill="#0B1512" fontFamily="JetBrains Mono, monospace" fontSize="8" letterSpacing="1.2">
                      {node.label}
                    </text>
                    <text x={node.x + 14} y="120" fill="#6E7A73" fontFamily="JetBrains Mono, monospace" fontSize="7">
                      {node.sub}
                    </text>
                    <circle cx={node.x + 132} cy="142" r="3" fill="#8FD83C" />
                    {index < 3 && (
                      <path
                        d={`M${node.x + 152} 113 L ${node.x + 192} 113`}
                        stroke="url(#flowLine)"
                        strokeWidth="1"
                        strokeDasharray="3 4"
                      />
                    )}
                  </g>
                ))}
                <path d="M16 200 C 200 200, 260 220, 400 200 S 620 180, 744 200" stroke="rgba(76,122,30,.25)" strokeWidth="1" strokeDasharray="4 6" />
                <text x="16" y="230" fill="rgba(11,21,18,.4)" fontFamily="JetBrains Mono, monospace" fontSize="7" letterSpacing=".8">
                  CONTINUOUS · DETERMINISTIC · OBSERVABLE
                </text>
              </svg>
              <p className="mt-4 text-[11px] leading-relaxed" style={{ color: '#6E7A73' }}>
                Illustrative architecture diagram. Production infrastructure is not connected in this demonstration.
              </p>
            </Reveal>

            <div className="grid gap-3">
              {[
                {
                  title: 'Deterministic by default',
                  copy: 'Sample series are stable across renders, so charts, tests and screenshots stay consistent.',
                },
                {
                  title: 'Designed for density',
                  copy: 'Typography, spacing and color are tuned for financial information that needs to be read quickly.',
                },
                {
                  title: 'Transparent uncertainty',
                  copy: 'Data provenance, stale states and confidence levels are surfaced rather than hidden.',
                },
              ].map((item, index) => (
                <Reveal key={item.title} delay={index * 0.05} className="light-card p-5">
                  <h3 className="text-[15px] font-medium tracking-[-.02em]">{item.title}</h3>
                  <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: '#6E7A73' }}>
                    {item.copy}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section" id="careers" aria-label="Careers">
        <div className="gmp-container">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
            <div>
              <SectionHeading
                kicker="Careers"
                title="Build the market layer with us."
                sub="We are a small team of designers, engineers and market obsessives. These roles are illustrative examples of the kinds of people we hire."
              />
              <Button href="mailto:careers@gmpx.example?subject=GMPX%20careers" variant="ink" className="mt-6" arrow>
                Introduce yourself
              </Button>
            </div>
            <Reveal delay={0.06}>
              <div>
                {ROLES.map((role) => (
                  <a
                    key={role.title}
                    href={`mailto:careers@gmpx.example?subject=${encodeURIComponent(`Application: ${role.title}`)}`}
                    className="group flex items-center justify-between gap-4 border-b py-5 transition hover:text-[#3F6B13]"
                    style={{ borderColor: 'rgba(11,21,18,.1)' }}
                  >
                    <div>
                      <div className="text-[16px] font-medium tracking-[-.02em]">{role.title}</div>
                      <div className="num-mono mt-1" style={{ fontSize: 8, color: '#82909D', letterSpacing: '.08em' }}>
                        {role.meta}
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="page-section page-section-alt" id="contact" aria-label="Contact GMPX">
        <div className="gmp-container">
          <SectionHeading
            kicker="Contact"
            title="A real conversation, not a funnel."
            sub="For product questions, institutional coverage or press, reach the team directly."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
            <Reveal className="light-card p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'General', email: 'hello@gmpx.example' },
                  { label: 'Institutional', email: 'institutional@gmpx.example' },
                  { label: 'Press', email: 'press@gmpx.example' },
                  { label: 'Careers', email: 'careers@gmpx.example' },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={`mailto:${item.email}`}
                    className="group rounded-[6px] border p-4 transition hover:bg-white/70"
                    style={{ borderColor: 'rgba(11,21,18,.1)' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="eyebrow" style={{ fontSize: 7.5 }}>
                        {item.label}
                      </span>
                      <Mail size={12} style={{ color: '#4C7A1E' }} aria-hidden="true" />
                    </div>
                    <div className="num-mono mt-3 text-[10.5px]" style={{ color: '#0B1512' }}>
                      {item.email}
                    </div>
                  </a>
                ))}
              </div>
              <p className="stats-note" style={{ marginTop: 16 }}>
                Email addresses are illustrative placeholders for this demonstration.
              </p>
            </Reveal>

            <Reveal delay={0.06} className="light-card p-5">
              <div className="eyebrow" style={{ fontSize: 7.5 }}>
                Offices
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {OFFICES.map((office) => (
                  <div key={office.city}>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} style={{ color: '#4C7A1E' }} aria-hidden="true" />
                      <span className="text-[13px] font-medium">{office.city}</span>
                    </div>
                    <div className="mt-1 text-[10px]" style={{ color: '#82909D' }}>
                      {office.line}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t pt-4" style={{ borderColor: 'rgba(11,21,18,.08)' }}>
                <div className="eyebrow" style={{ fontSize: 7 }}>
                  Response time
                </div>
                <p className="mt-2 text-[12px]" style={{ color: '#4A5750' }}>
                  Usually within two business days. No sales sequence, no automated follow-ups.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="page-section" aria-label="Legal and disclosures">
        <div className="gmp-container">
          <SectionHeading kicker="Legal & disclosures" title="Clear terms for a clear product." />
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              {
                id: 'privacy',
                title: 'Privacy Policy',
                copy: 'This demonstration stores no personal data beyond local browser state. A production privacy policy would describe data collection, retention and user rights.',
              },
              {
                id: 'terms',
                title: 'Terms of Service',
                copy: 'This site is a product demonstration. Content is provided for information only and may change without notice. No service-level agreement applies to this demo.',
              },
              {
                id: 'risk',
                title: 'Risk Disclosure',
                copy: 'Investing involves risk, including loss of principal. Market data shown is illustrative, may be delayed or inaccurate, and is not investment advice.',
              },
            ].map((item) => (
              <Reveal key={item.id} className="light-card p-5" delay={0.04}>
                <div id={item.id} className="scroll-mt-28">
                  <h3 className="text-[16px] font-medium tracking-[-.02em]">{item.title}</h3>
                  <p className="mt-3 text-[11.5px] leading-relaxed" style={{ color: '#6E7A73' }}>
                    {item.copy}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA
        eyebrow="The market, without limits"
        title="A clearer way to meet the market."
        description="GMPX is built for investors who want to understand more, not just trade faster. Explore the platform and see the difference context makes."
        primaryLabel="Get Started"
        primaryTo="/pricing"
        secondaryLabel="Explore Markets"
        secondaryTo="/markets"
      />
    </>
  );
}
