import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Code2,
  Gauge,
  Layers3,
  LayoutDashboard,
  LockKeyhole,
  PieChart,
  Sparkles,
  Users,
  Wifi,
} from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { Button } from '../components/Button';
import { MiniChart } from '../components/MiniChart';
import { MarketChart } from '../components/MarketChart';
import { CandleChart } from '../components/CandleChart';
import { PortfolioVisual } from '../components/PortfolioVisual';
import { FinalCTA } from '../sections/FinalCTA';
import { seriesForRange } from '../data/market';

const PILLARS = [
  {
    icon: LayoutDashboard,
    title: 'The Terminal',
    copy: 'A single market workspace for indices, instruments, watchlists and the context behind every move.',
    to: '/dashboard',
    label: 'Open the terminal',
  },
  {
    icon: Sparkles,
    title: 'Intelligence',
    copy: 'AI-assisted signal detection that explains what changed, why it matters and what to watch next.',
    to: '/intelligence',
    label: 'Explore intelligence',
  },
  {
    icon: PieChart,
    title: 'Portfolio',
    copy: 'Exposure, attribution and performance in one unified view — built around how you actually invest.',
    to: '/products#portfolio',
    label: 'See portfolio tools',
  },
  {
    icon: Code2,
    title: 'Data & API',
    copy: 'Institutional-grade market data and clean endpoints for teams building their own intelligence layer.',
    to: '/products#docs',
    label: 'View documentation',
  },
];

const TABS = [
  {
    id: 'markets',
    label: 'Markets',
    kicker: '01 · Market workspace',
    title: 'The whole board, without the noise.',
    copy: 'A connected view of global indices, sectors and instruments. Compare, filter and move from a headline to the underlying chart in a single motion.',
    bullets: ['Global index monitor', 'Region and sector filters', 'Context-rich instrument pages'],
    visual: 'markets',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    kicker: '02 · Technical layer',
    title: 'Charts that reward attention.',
    copy: 'Professional candlesticks, volume, moving averages and multi-timeframe context. Everything is designed to make the next decision clearer.',
    bullets: ['Candlestick & volume engine', 'Technical indicators', 'Multi-timeframe comparison'],
    visual: 'analytics',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    kicker: '03 · Wealth view',
    title: 'Your exposure, in one picture.',
    copy: 'See allocation, performance and concentration across every account. Understand what is driving returns — and what is quietly adding risk.',
    bullets: ['Allocation rings', 'Performance attribution', 'Concentration & risk flags'],
    visual: 'portfolio',
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    kicker: '04 · Signal engine',
    title: 'A narrative behind the number.',
    copy: 'GMPX turns market movement into a readable signal: what changed, the factors behind it, and the confidence level attached to the view.',
    bullets: ['AI-assisted signals', 'Confidence scoring', 'Risk-aware narratives'],
    visual: 'intelligence',
  },
];

const CAPABILITIES = [
  { icon: Gauge, title: 'Low-latency data layer', copy: 'A fast, normalized market feed designed for dense financial interfaces.' },
  { icon: Layers3, title: 'Unified asset model', copy: 'Indices, equities, commodities and FX in one consistent schema.' },
  { icon: Wifi, title: 'Always-on monitoring', copy: 'Global session coverage with clear status and stale-data handling.' },
  { icon: LockKeyhole, title: 'Security by default', copy: 'Role-based access, audit trails and encrypted transport.' },
  { icon: Users, title: 'Built for teams', copy: 'Shared watchlists, notes and research context across desks.' },
  { icon: Code2, title: 'Open by design', copy: 'Clean APIs and exports that fit into your existing workflow.' },
];

const CODE = `// Illustrative GMPX API preview
const gmp = new GMPX({ apiKey: process.env.GMPX_KEY });

const snapshot = await gmp.markets.snapshot({
  symbols: ["NASDAQ", "NIFTY", "S&P500"],
  range: "1D",
});

// → normalized market objects
{
  symbol: "NIFTY",
  price: 24862.40,
  change: +2.64,
  status: "BULLISH",
  source: "demo"
}`;

function PreviewVisual({ visual }: { visual: string }) {
  if (visual === 'markets') {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div style={{ color: '#F4F8F5', fontSize: 12 }}>Global Market Performance</div>
            <div className="eyebrow" style={{ color: 'rgba(244,248,245,.35)', fontSize: 7, marginTop: 3 }}>
              Market overview · demo
            </div>
          </div>
          <span className="live-pill">
            <i aria-hidden="true" />
            Demo
          </span>
        </div>
        <div className="mt-4 flex items-end gap-3">
          <span style={{ color: '#F4F8F5', fontSize: 30, letterSpacing: '-.05em', lineHeight: 1 }}>24,862.40</span>
          <span className="dash-change">▲ +2.64%</span>
        </div>
        <div className="mt-2">
          <MarketChart range="1M" dark height={250} />
        </div>
      </div>
    );
  }

  if (visual === 'analytics') {
    return <CandleChart />;
  }

  if (visual === 'portfolio') {
    return <PortfolioVisual />;
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow" style={{ color: 'rgba(244,248,245,.4)', fontSize: 7.5 }}>
          GMPX signal · demo
        </span>
        <span className="live-pill">
          <i aria-hidden="true" />
          87% confidence
        </span>
      </div>
      <div className="mt-8">
        <span
          className="inline-flex items-center rounded-[3px] px-2 py-1 font-mono text-[7.5px] uppercase tracking-[.14em]"
          style={{ background: 'rgba(199,244,100,.12)', color: '#D3FA8C', border: '1px solid rgba(199,244,100,.2)' }}
        >
          Momentum
        </span>
        <h3 style={{ color: '#F4F8F5', fontSize: 24, lineHeight: 1.05, letterSpacing: '-.04em', marginTop: 14, maxWidth: 340 }}>
          Breadth is improving beneath the index.
        </h3>
        <p style={{ color: 'rgba(244,248,245,.55)', fontSize: 12, lineHeight: 1.6, marginTop: 12, maxWidth: 360 }}>
          Advancing issues are outpacing decliners while volatility compresses. Historically, this combination has
          preceded broader participation.
        </p>
      </div>
      <div className="mt-6 space-y-2">
        {['Market breadth +18.4%', 'VIX 14.2 (-1.8)', 'Tech leadership intact'].map((factor) => (
          <div
            key={factor}
            className="flex items-center justify-between rounded-[4px] border px-3 py-2"
            style={{ borderColor: 'rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)' }}
          >
            <span className="num-mono" style={{ fontSize: 9, color: 'rgba(244,248,245,.6)' }}>
              {factor}
            </span>
            <span style={{ color: '#B4EA45', fontSize: 9 }}>●</span>
          </div>
        ))}
      </div>
      <p className="mt-5" style={{ color: 'rgba(244,248,245,.28)', fontSize: 8, lineHeight: 1.6 }}>
        Illustrative AI output. Not investment advice.
      </p>
    </div>
  );
}

export function ProductsPage() {
  const [active, setActive] = useState('markets');
  const current = TABS.find((tab) => tab.id === active) ?? TABS[0];
  const composite = seriesForRange('1M').map((point) => point.value);

  return (
    <>
      <PageHero
        eyebrow="Products · The GMPX Platform"
        title={
          <>
            Built for the way
            <br />
            markets actually move.
          </>
        }
        description="A connected market workspace, an intelligence layer and a portfolio view that share one source of truth. Every product is designed to reduce the distance between data and decision."
        actions={
          <>
            <Button to="/dashboard" variant="ink" arrow>
              Open Terminal
            </Button>
            <Button to="/pricing" variant="ghost">
              See Pricing
            </Button>
          </>
        }
        aside={
          <div className="dark-card p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="eyebrow" style={{ color: 'rgba(244,248,245,.45)', fontSize: 8 }}>
                Terminal preview
              </span>
              <span className="live-pill">
                <i aria-hidden="true" />
                Demo
              </span>
            </div>
            <div className="mt-4 flex items-end gap-3">
              <span style={{ color: '#F4F8F5', fontSize: 30, letterSpacing: '-.05em', lineHeight: 1 }}>24,862.40</span>
              <span className="dash-change">▲ +2.64%</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <MiniChart points={composite} width={380} height={80} color="#C7F464" fill showEndDot className="w-full" />
            </div>
            <div className="mt-4 space-y-0">
              {[
                ['NIFTY 50', '24,862.40', '+0.75%'],
                ['NASDAQ', '18,245.30', '+0.69%'],
                ['S&P 500', '5,842.47', '+0.55%'],
              ].map(([name, value, pct]) => (
                <div
                  key={name}
                  className="flex items-center justify-between border-b py-2.5 last:border-b-0"
                  style={{ borderColor: 'rgba(255,255,255,.07)' }}
                >
                  <span style={{ color: 'rgba(244,248,245,.65)', fontSize: 10 }}>{name}</span>
                  <span className="num-mono" style={{ color: '#F4F8F5', fontSize: 10 }}>
                    {value}
                  </span>
                  <span className="num-mono" style={{ color: '#B4EA45', fontSize: 9 }}>
                    {pct}
                  </span>
                </div>
              ))}
            </div>
          </div>
        }
      />

      <section className="page-section" aria-label="Platform products">
        <div className="gmp-container">
          <SectionHeading
            kicker="Four connected surfaces"
            title="One platform. No seams."
            sub="Each product is useful on its own. Together they form a continuous loop from market observation to portfolio action."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {PILLARS.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 0.05} className="light-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border"
                      style={{ borderColor: 'rgba(76,122,30,.18)', background: 'rgba(199,244,100,.18)' }}
                    >
                      <pillar.icon size={16} style={{ color: '#3F6B13' }} aria-hidden="true" />
                    </span>
                    <div>
                      <div className="eyebrow" style={{ fontSize: 7.5 }}>
                        Product 0{index + 1}
                      </div>
                      <h3 className="mt-1 text-[18px] font-medium tracking-[-.03em]">{pillar.title}</h3>
                    </div>
                  </div>
                  <Link to={pillar.to} aria-label={pillar.label} className="solution-arrow" style={{ borderColor: 'rgba(11,21,18,.16)', color: '#0B1512' }}>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
                <p className="mt-5 max-w-[420px] text-[12.5px] leading-relaxed" style={{ color: '#6E7A73' }}>
                  {pillar.copy}
                </p>
                <Link to={pillar.to} className="link-arrow mt-5">
                  {pillar.label}
                  <ArrowUpRight size={13} />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section-alt" id="portfolio" aria-label="Inside the platform">
        <div className="gmp-container">
          <SectionHeading
            kicker="Inside the platform"
            title="Move between views without losing context."
            sub="Switch the surface. The market state stays with you."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
            <Reveal className="light-card p-2">
              <div className="flex flex-col">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActive(tab.id)}
                    aria-pressed={active === tab.id}
                    className={`flex items-center justify-between gap-3 rounded-[5px] px-4 py-4 text-left transition ${
                      active === tab.id ? 'bg-ink text-white' : 'hover:bg-white/70'
                    }`}
                  >
                    <span>
                      <span className="eyebrow block" style={{ fontSize: 7, color: active === tab.id ? 'rgba(255,255,255,.45)' : '#82909D' }}>
                        {tab.kicker}
                      </span>
                      <span className="mt-1.5 block text-[15px] font-medium tracking-[-.02em]">{tab.label}</span>
                    </span>
                    <ArrowUpRight
                      size={14}
                      style={{ color: active === tab.id ? '#C7F464' : '#82909D', transform: active === tab.id ? 'rotate(0deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                ))}
              </div>
              <div className="border-t p-4" style={{ borderColor: 'rgba(11,21,18,.08)' }}>
                <div className="eyebrow" style={{ fontSize: 7 }}>
                  {current.kicker}
                </div>
                <h3 className="mt-2 text-[20px] font-medium leading-[1.05] tracking-[-.04em]">{current.title}</h3>
                <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: '#6E7A73' }}>
                  {current.copy}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {current.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-[11px]" style={{ color: '#4A5750' }}>
                      <span style={{ color: '#4C7A1E', marginTop: 1 }}>—</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div
                className="dark-card relative overflow-hidden"
                style={{ minHeight: 430, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <div className="absolute right-4 top-4 z-10">
                  <span className="eyebrow" style={{ color: 'rgba(244,248,245,.3)', fontSize: 7 }}>
                    Interface preview · demo
                  </span>
                </div>
                <PreviewVisual visual={current.visual} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="page-section" aria-label="Platform capabilities">
        <div className="gmp-container">
          <SectionHeading
            kicker="Platform foundation"
            title="The details you only notice when they are missing."
            sub="Reliability, coverage and clarity are product features. GMPX treats them that way."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((capability, index) => (
              <Reveal key={capability.title} delay={index * 0.04} className="light-card p-5">
                <capability.icon size={18} style={{ color: '#4C7A1E' }} aria-hidden="true" />
                <h3 className="mt-5 text-[15px] font-medium tracking-[-.02em]">{capability.title}</h3>
                <p className="mt-2 text-[12px] leading-relaxed" style={{ color: '#6E7A73' }}>
                  {capability.copy}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-section-alt" id="docs" aria-label="API documentation preview">
        <div className="gmp-container">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:items-center">
            <div>
              <SectionHeading
                kicker="Data & API"
                title="Your workflow. Our market layer."
                sub="A clean, normalized market API for teams that want to build on top of GMPX. The snippet is an illustrative preview, not a live endpoint."
              />
              <div className="mt-6 flex flex-wrap gap-2">
                {['Markets', 'Analytics', 'Portfolio', 'Webhooks'].map((tag) => (
                  <span key={tag} className="chip" style={{ fontSize: 8 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <Reveal delay={0.1}>
              <div className="dark-card overflow-hidden">
                <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
                  <span className="num-mono" style={{ fontSize: 8, color: 'rgba(244,248,245,.4)', letterSpacing: '.1em' }}>
                    quickstart.ts
                  </span>
                  <span className="eyebrow" style={{ fontSize: 7, color: 'rgba(199,244,100,.65)' }}>
                    Illustrative
                  </span>
                </div>
                <pre
                  className="overflow-x-auto p-4 gmp-scrollbar"
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, lineHeight: 1.8, color: 'rgba(244,248,245,.72)', margin: 0 }}
                >
                  <code>{CODE}</code>
                </pre>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <FinalCTA
        eyebrow="One connected platform"
        title="See the market. Then see the decision."
        description="Open the terminal, explore the intelligence layer, or bring your team onto the same market picture."
        primaryLabel="Get Started"
        primaryTo="/pricing"
        secondaryLabel="Explore Intelligence"
        secondaryTo="/intelligence"
      />
    </>
  );
}
