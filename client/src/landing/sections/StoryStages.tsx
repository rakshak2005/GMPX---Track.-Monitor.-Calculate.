import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Chip } from '../components/Brand';
import { Button } from '../components/Button';
import { Globe } from '../components/Globe';
import { MiniChart } from '../components/MiniChart';
import { MarketChart, RangeSwitcher } from '../components/MarketChart';
import { platformFeatures, rangeMeta, seriesForRange, type Range } from '../data/market';
import { useMediaQuery } from '../hooks/useEnvironment';

/* ------------------------------------------------------------------ */
/* Stage 1 — The Global Market                                         */
/* ------------------------------------------------------------------ */

export function HeroStage() {
  const reduce = useReducedMotion();
  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 22, filter: 'blur(6px)' },
          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
          transition: { duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] as const },
        };

  return (
    <section className="stage stage-hero grain" aria-label="GMPX — See beyond the market">
      <div className="stage-bg" aria-hidden="true" />
      <div className="hero-grid fin-grid" aria-hidden="true" />
      <div className="hero-floor" aria-hidden="true" />
      <div className="hero-watermark" aria-hidden="true">
        GMPX
      </div>

      <Globe />

      <div className="hero-copy">
        <motion.div className="hero-status" {...enter(0.02)}>
          <span className="hero-status-dot" aria-hidden="true" />
          Global desk active
          <i aria-hidden="true" />
          6 exchanges monitored
          <i aria-hidden="true" />
          Demo environment
        </motion.div>

        <motion.div {...enter(0.05)}>
          <Chip>Global Market Intelligence</Chip>
        </motion.div>

        <motion.h1 className="hero-title" {...enter(0.14)}>
          <span className="line">See Beyond</span>
          <span className="line">
            <span className="hero-highlight">the Market.</span>
          </span>
        </motion.h1>

        <motion.p className="hero-sub" {...enter(0.26)}>
          Everything happening in the markets. One intelligent platform to understand what matters.
        </motion.p>

        <motion.div className="hero-ctas" {...enter(0.34)}>
          <Button to="/markets" variant="lime" arrow>
            Explore Markets
          </Button>
          <Button to="/products" variant="ghost">
            Discover GMPX
          </Button>
        </motion.div>
      </div>

      <div className="hero-foot">
        <div className="hero-caption">
          <strong>Real-time market intelligence.</strong>
          <br />
          Built for the next generation of investors.
        </div>
        <button
          type="button"
          className="scroll-cue"
          onClick={() => window.scrollTo({ top: window.innerHeight * 0.98, behavior: 'smooth' })}
          aria-label="Scroll to explore the GMPX experience"
        >
          <span>Scroll to explore</span>
          <span className="scroll-cue-track" aria-hidden="true" />
        </button>
      </div>

      <div className="hero-coords" aria-hidden="true">
        40.7128° N · 74.0060° W · GLOBAL MARKET LAYER 01
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stage 2 — Market Fly-In / Vision                                    */
/* ------------------------------------------------------------------ */

const VISION_PANELS = [
  {
    id: 'NASDAQ',
    value: '+2.48%',
    change: '+124.80',
    points: [30, 34, 31, 38, 36, 44, 42, 49, 55, 52, 61],
    className: 'p1',
    up: true,
  },
  {
    id: 'NIFTY 50',
    value: '+1.26%',
    change: '+186.20',
    points: [28, 30, 27, 33, 36, 34, 40, 43, 41, 47, 52],
    className: 'p2',
    up: true,
  },
  {
    id: 'S&P 500',
    value: '+0.84%',
    change: '+32.15',
    points: [34, 32, 36, 35, 38, 42, 40, 45, 44, 48, 51],
    className: 'p3',
    up: true,
  },
];

const VISION_WORDS: { text: string; muted?: boolean; break?: boolean }[] = [
  { text: 'From', muted: true },
  { text: 'Market', muted: true },
  { text: 'Noise', muted: true },
  { text: 'to', muted: true, break: true },
  { text: 'Clear' },
  { text: 'Intelligence.' },
];

export function VisionStage() {
  return (
    <section className="stage stage-vision grain" aria-label="Our vision">
      <div className="stage-bg" aria-hidden="true" />
      <div className="vision-grid fin-grid" aria-hidden="true" />

      <div className="vision-panels" aria-hidden="true">
        {VISION_PANELS.map((panel) => (
          <div key={panel.id} className={`vision-panel ${panel.className}`}>
            <div className="vision-panel-head">
              <span>{panel.id}</span>
              <span style={{ color: panel.up ? '#4C7A1E' : '#B93C43' }}>{panel.value}</span>
            </div>
            <div className="vision-panel-val">
              {panel.change}
              <small>{panel.up ? '▲' : '▼'}</small>
            </div>
            <MiniChart
              points={panel.points}
              width={220}
              height={48}
              color={panel.up ? '#4C7A1E' : '#B93C43'}
              fill
              showEndDot
              className="vision-panel-chart"
            />
          </div>
        ))}
      </div>

      <div className="vision-wrap">
        <div className="vision-copy">
          <Chip>Our Vision</Chip>
          <h2 className="vision-title">
            {VISION_WORDS.map((word, index) => (
              <span key={`${word.text}-${index}`}>
                <span className={`vision-word ${word.muted ? 'muted' : ''}`}>{word.text}</span>
                {word.break ? <br /> : ' '}
              </span>
            ))}
          </h2>
          <p className="vision-sub">
            Understand market movements, identify opportunities, and make informed decisions with powerful financial
            intelligence.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stage 3 — Market Intelligence                                       */
/* ------------------------------------------------------------------ */

const INTEL_PARAGRAPH =
  'Markets move every second. GMPX brings together global financial data, advanced analytics, and intelligent insights to help you understand the forces shaping every investment decision.';

const HOTSPOTS = [
  { id: 'momentum', label: 'Market momentum', value: '+3.82%', position: 'pos-momentum', negative: false },
  { id: 'volume', label: 'Trading volume', value: '24.8M', position: 'pos-volume', negative: false },
  { id: 'sentiment', label: 'Market sentiment', value: 'BULLISH', position: 'pos-sentiment', negative: false },
  { id: 'volatility', label: 'Volatility index', value: '14.2', position: 'pos-volatility', negative: true },
];

function buildIntelPath() {
  const data = seriesForRange('1M');
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 1000;
  const h = 360;
  const pad = 14;
  const coords = data.map((point, index) => ({
    x: (index / (data.length - 1)) * w,
    y: h - pad - ((point.value - min) / range) * (h - pad * 2),
  }));
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(' ');
  return { line, area: `${line} L ${w} ${h} L 0 ${h} Z`, end: coords[coords.length - 1] };
}

const INTEL_CHART = buildIntelPath();

export function IntelStage() {
  const [active, setActive] = useState<string | null>('momentum');

  return (
    <section className="stage stage-intel grain" aria-label="Market intelligence">
      <div className="stage-bg" aria-hidden="true" />

      <div className="intel-wrap">
        <div className="intel-head">
          <div>
            <Chip>Every Move Matters</Chip>
            <h2 className="intel-title">The market is a system. Read it clearly.</h2>
          </div>
          <div>
            <p className="intel-para">
              {INTEL_PARAGRAPH.split(' ').map((word, index) => (
                <span key={`${word}-${index}`} className="intel-word">
                  {word}{' '}
                </span>
              ))}
            </p>
            <div className="intel-meta">
              <span className="live-dot" aria-hidden="true" />
              <span>Signal engine · demo data</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>Global composite</span>
            </div>
          </div>
        </div>

        <div className="intel-visual">
          <div className="intel-card">
            <div className="intel-card-head">
              <div>
                <div className="intel-card-title">Global Market Pulse</div>
                <div className="intel-card-sub">Composite index · 1M</div>
              </div>
              <div className="intel-card-val">
                24,862.40
                <span>+2.64%</span>
              </div>
            </div>

            <div className="intel-chart">
              <svg
                viewBox="0 0 1000 360"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="intelArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8FD83C" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#8FD83C" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.2, 0.4, 0.6, 0.8].map((p) => (
                  <line
                    key={p}
                    x1="0"
                    y1={360 * p}
                    x2="1000"
                    y2={360 * p}
                    stroke="rgba(11,21,18,.06)"
                    strokeDasharray="3 6"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {[0.2, 0.4, 0.6, 0.8].map((p) => (
                  <line
                    key={`v-${p}`}
                    x1={1000 * p}
                    y1="0"
                    x2={1000 * p}
                    y2="360"
                    stroke="rgba(11,21,18,.035)"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                <path d={INTEL_CHART.area} fill="url(#intelArea)" className="intel-area" />
                <path
                  d={INTEL_CHART.line}
                  stroke="#4C7A1E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  vectorEffect="non-scaling-stroke"
                  className="intel-line"
                />
                <line
                  x1="0"
                  y1={INTEL_CHART.end.y}
                  x2="1000"
                  y2={INTEL_CHART.end.y}
                  stroke="rgba(76,122,30,.32)"
                  strokeDasharray="4 6"
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx={INTEL_CHART.end.x - 2}
                  cy={INTEL_CHART.end.y}
                  r="4"
                  fill="#8FD83C"
                  stroke="#FBFAF6"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="intel-axis">
              <span>09:30</span>
              <span>11:00</span>
              <span>12:30</span>
              <span>14:00</span>
              <span>15:30</span>
            </div>

            <div className="intel-card-foot">
              <span>
                Open <strong>24,196.40</strong>
              </span>
              <span>
                High <strong>24,918.20</strong>
              </span>
              <span>
                Low <strong>24,182.60</strong>
              </span>
              <span>
                Vol <strong>2.41B</strong>
              </span>
              <span style={{ marginLeft: 'auto', color: '#4C7A1E' }}>● Drawing live view</span>
            </div>
          </div>

          <div className="intel-hotspots">
            {HOTSPOTS.map((spot) => {
              const isActive = active === spot.id;
              return (
                <button
                  key={spot.id}
                  type="button"
                  className={`hotspot ${spot.position} ${spot.negative ? 'neg' : ''} ${
                    isActive ? 'is-active' : ''
                  }`}
                  aria-expanded={isActive}
                  aria-label={`${spot.label}: ${spot.value}`}
                  onMouseEnter={() => setActive(spot.id)}
                  onFocus={() => setActive(spot.id)}
                  onClick={() => setActive(isActive ? null : spot.id)}
                >
                  <span className="hotspot-dot" aria-hidden="true" />
                  <span className="hotspot-line" aria-hidden="true" />
                  <span>
                    <span className="hotspot-label">{spot.label}</span>
                    <span className="hotspot-value">{spot.value}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stage 4 — GMPX Intelligence dashboard                               */
/* ------------------------------------------------------------------ */

export function DashboardStage({ standalone = false }: { standalone?: boolean }) {
  const [range, setRange] = useState<Range>('1D');
  const [activeFeature, setActiveFeature] = useState(0);
  const mobile = useMediaQuery('(max-width: 820px)');
  const tablet = useMediaQuery('(max-width: 1100px)');
  const meta = rangeMeta(range);
  const chartHeight = mobile ? 190 : tablet ? 210 : 246;

  return (
    <section
      className={standalone ? 'dash-mobile-section grain' : 'stage stage-dashboard grain'}
      aria-label="GMPX intelligence dashboard"
    >
      <div className="stage-bg" aria-hidden="true" />
      <div className="dash-grid-bg fin-grid-dark" aria-hidden="true" />

      <div className="dash-wrap">
        <div className="dash-head">
          <div>
            <Chip dark>✕ GMPX Intelligence</Chip>
            <h2 className="dash-title">Everything You Need to Understand the Markets.</h2>
          </div>
          <p className="dash-sub">Powerful financial intelligence, simplified into one connected experience.</p>
        </div>

        <div className="dash-grid">
          <div className="dash-card">
            <div className="dash-card-top">
              <div>
                <div className="dash-card-title">Global Market Performance</div>
                <div className="dash-card-sub">Market overview · Today</div>
              </div>
              <span className="live-pill">
                <i aria-hidden="true" />
                Demo data
              </span>
            </div>

            <div className="dash-value-row">
              <div className="dash-value">24,862.40</div>
              <span className="dash-change">▲ +{meta.changePct.toFixed(2)}%</span>
              <span className="dash-status">Market moving up</span>
            </div>

            <div className="dash-chart">
              <MarketChart range={range} dark height={chartHeight} />
            </div>

            <div className="dash-range">
              <RangeSwitcher range={range} onChange={setRange} dark />
              <div className="dash-stats">
                <span>
                  H <b>{meta.high}</b>
                </span>
                <span>
                  L <b>{meta.low}</b>
                </span>
                <span>
                  VOL <b>{meta.volume}</b>
                </span>
              </div>
            </div>
          </div>

          <div className="feature-panel">
            <div className="feature-head">
              <span>The platform</span>
              <span>05 capabilities</span>
            </div>
            {platformFeatures.map((feature, index) => (
              <button
                key={feature.n}
                type="button"
                className={`feature-row ${activeFeature === index ? 'is-active' : ''}`}
                onClick={() => setActiveFeature(index)}
                aria-pressed={activeFeature === index}
              >
                <span className="feature-index">{feature.n}</span>
                <span className="feature-title">{feature.title}</span>
                <ArrowUpRight size={13} className="feature-arrow" aria-hidden="true" />
              </button>
            ))}
            <div className="feature-note" aria-live="polite">
              {platformFeatures[activeFeature].detail}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
