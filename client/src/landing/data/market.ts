export type Range = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

export const RANGES: Range[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

export type Region = 'US' | 'Asia' | 'Europe' | 'Commodities' | 'Digital' | 'FX';

export interface MarketRow {
  asset: string;
  code: string;
  price: number;
  change: number;
  pct: number;
  status: 'BULLISH' | 'BEARISH';
  region: Region;
  points: number[];
  decimals?: number;
}

function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function walk(seed: number, points: number, start: number, drift: number, vol: number) {
  const rnd = seeded(seed);
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < points; i += 1) {
    v += drift + (rnd() - 0.46) * vol;
    out.push(Number(v.toFixed(2)));
  }
  return out;
}

const spark = (seed: number, up: boolean) =>
  walk(seed, 12, 40, up ? 1.1 : -0.9, 9).map((n) => Math.max(4, n));

export const marketRows: MarketRow[] = [
  {
    asset: 'NASDAQ',
    code: 'IXIC',
    price: 18245.3,
    change: 124.8,
    pct: 0.69,
    status: 'BULLISH',
    region: 'US',
    points: spark(11, true),
  },
  {
    asset: 'S&P 500',
    code: 'SPX',
    price: 5842.47,
    change: 32.15,
    pct: 0.55,
    status: 'BULLISH',
    region: 'US',
    points: spark(22, true),
  },
  {
    asset: 'DOW JONES',
    code: 'DJI',
    price: 42115.8,
    change: -85.2,
    pct: -0.2,
    status: 'BEARISH',
    region: 'US',
    points: spark(33, false),
  },
  {
    asset: 'NIFTY 50',
    code: 'NIFTY',
    price: 24862.4,
    change: 186.2,
    pct: 0.75,
    status: 'BULLISH',
    region: 'Asia',
    points: spark(44, true),
  },
  {
    asset: 'SENSEX',
    code: 'BSESN',
    price: 81765.4,
    change: 412.6,
    pct: 0.51,
    status: 'BULLISH',
    region: 'Asia',
    points: spark(55, true),
  },
  {
    asset: 'GOLD',
    code: 'XAU',
    price: 2685.2,
    change: 14.6,
    pct: 0.55,
    status: 'BULLISH',
    region: 'Commodities',
    points: spark(66, true),
  },
  {
    asset: 'FTSE 100',
    code: 'UKX',
    price: 8312.7,
    change: -12.4,
    pct: -0.15,
    status: 'BEARISH',
    region: 'Europe',
    points: spark(77, false),
  },
  {
    asset: 'DAX',
    code: 'DAX',
    price: 19426.1,
    change: 96.3,
    pct: 0.5,
    status: 'BULLISH',
    region: 'Europe',
    points: spark(88, true),
  },
  {
    asset: 'NIKKEI 225',
    code: 'N225',
    price: 39102.6,
    change: 218.4,
    pct: 0.56,
    status: 'BULLISH',
    region: 'Asia',
    points: spark(99, true),
  },
  {
    asset: 'HANG SENG',
    code: 'HSI',
    price: 19846.9,
    change: -74.6,
    pct: -0.37,
    status: 'BEARISH',
    region: 'Asia',
    points: spark(111, false),
  },
  {
    asset: 'CRUDE OIL',
    code: 'WTI',
    price: 71.84,
    change: -0.62,
    pct: -0.86,
    status: 'BEARISH',
    region: 'Commodities',
    points: spark(122, false),
  },
  {
    asset: 'BITCOIN',
    code: 'BTC',
    price: 96420,
    change: 1820,
    pct: 1.92,
    status: 'BULLISH',
    region: 'Digital',
    points: spark(133, true),
  },
];

export interface SeriesPoint {
  label: string;
  value: number;
}

const RANGE_META: Record<
  Range,
  { points: number; seed: number; startOffset: number; vol: number; changePct: number; high: number; low: number; volume: string }
> = {
  '1D': { points: 42, seed: 20260101, startOffset: 0.018, vol: 34, changePct: 2.64, high: 24918.2, low: 24196.4, volume: '2.41B' },
  '1W': { points: 46, seed: 20260102, startOffset: 0.042, vol: 48, changePct: 4.12, high: 25042.7, low: 23780.1, volume: '11.86B' },
  '1M': { points: 48, seed: 20260103, startOffset: 0.075, vol: 62, changePct: 6.38, high: 25108.4, low: 23194.6, volume: '48.2B' },
  '3M': { points: 52, seed: 20260104, startOffset: 0.132, vol: 78, changePct: 11.24, high: 25260.8, low: 21842.3, volume: '142.7B' },
  '1Y': { points: 56, seed: 20260105, startOffset: 0.286, vol: 92, changePct: 24.86, high: 25518.6, low: 18724.9, volume: '604.3B' },
  ALL: { points: 60, seed: 20260106, startOffset: 1.82, vol: 108, changePct: 182.4, high: 25980.2, low: 12418.5, volume: '2.84T' },
};

const END_DATE = new Date(Date.UTC(2026, 10, 26, 16, 0, 0));
const DAY = 86_400_000;

function labelFor(range: Range, i: number, total: number) {
  const t = i / (total - 1);

  if (range === '1D') {
    const minutes = 9 * 60 + 30 + t * 390;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  if (range === 'ALL') {
    return String(2019 + Math.round(t * 7));
  }

  const span = range === '1W' ? 7 : range === '1M' ? 30 : range === '3M' ? 90 : 365;
  const date = new Date(END_DATE.getTime() - (1 - t) * span * DAY);
  if (range === '1W') {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
    return `${weekday} ${String(date.getUTCHours()).padStart(2, '0')}:00`;
  }
  if (range === '1Y') {
    return date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' });
}

const seriesCache = new Map<Range, SeriesPoint[]>();

export function seriesForRange(range: Range): SeriesPoint[] {
  const cached = seriesCache.get(range);
  if (cached) return cached;

  const meta = RANGE_META[range];
  const target = 24862.4;
  const start = target * (1 - meta.startOffset);
  const raw = walk(meta.seed, meta.points, start, (target - start) / meta.points, meta.vol);
  const diff = target - raw[raw.length - 1];
  const series = raw.map((value, i) => ({
    label: labelFor(range, i, raw.length),
    value: Number((value + diff * (i / (raw.length - 1))).toFixed(2)),
  }));
  series[series.length - 1] = { label: 'NOW', value: target };
  seriesCache.set(range, series);
  return series;
}

export function rangeMeta(range: Range) {
  const m = RANGE_META[range];
  return {
    changePct: m.changePct,
    high: m.high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    low: m.low.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    volume: m.volume,
  };
}

/* ----------------------------- candlesticks ----------------------------- */

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function buildCandles(): Candle[] {
  const rnd = seeded(7741);
  const out: Candle[] = [];
  let price = 118;
  for (let i = 0; i < 38; i += 1) {
    const drift = 0.72 + Math.sin(i / 4) * 0.5;
    const open = price;
    const close = Math.max(40, open + drift + (rnd() - 0.44) * 4.6);
    const high = Math.max(open, close) + rnd() * 2.2;
    const low = Math.min(open, close) - rnd() * 2.2;
    const volume = 24 + rnd() * 68 + Math.sin(i / 3) * 12;
    out.push({ open, high, low, close, volume });
    price = close;
  }
  return out;
}

export const candles = buildCandles();

export const candleMA = candles.map((_, i) => {
  const window = candles.slice(Math.max(0, i - 5), i + 1);
  return window.reduce((sum, c) => sum + c.close, 0) / window.length;
});

/* ----------------------------- globe / ticker ----------------------------- */

export const globePins = [
  { id: 'NASDAQ', value: '+2.48%', up: true, points: spark(201, true) },
  { id: 'S&P 500', value: '+0.84%', up: true, points: spark(202, true) },
  { id: 'DOW JONES', value: '-0.12%', up: false, points: spark(203, false) },
  { id: 'NIFTY 50', value: '+1.26%', up: true, points: spark(204, true) },
  { id: 'SENSEX', value: '+0.51%', up: true, points: spark(205, true) },
  { id: 'FTSE 100', value: '-0.34%', up: false, points: spark(206, false) },
];

export const tickerItems = [
  { id: 'NASDAQ', value: '18,245.30', pct: '+0.69%', up: true },
  { id: 'S&P 500', value: '5,842.47', pct: '+0.55%', up: true },
  { id: 'DOW', value: '42,115.80', pct: '-0.20%', up: false },
  { id: 'NIFTY', value: '24,862.40', pct: '+0.75%', up: true },
  { id: 'SENSEX', value: '81,765.40', pct: '+0.51%', up: true },
  { id: 'GOLD', value: '2,685.20', pct: '+0.55%', up: true },
  { id: 'FTSE', value: '8,312.70', pct: '-0.15%', up: false },
  { id: 'DAX', value: '19,426.10', pct: '+0.50%', up: true },
  { id: 'NIKKEI', value: '39,102.60', pct: '+0.56%', up: true },
  { id: 'BTC', value: '96,420.00', pct: '+1.92%', up: true },
];

/* ----------------------------- features / insights ----------------------------- */

export const platformFeatures = [
  { n: '01', title: 'Real-time market intelligence', detail: 'Global indices, sectors and instruments in one continuously updated field of view.' },
  { n: '02', title: 'Advanced technical analysis', detail: 'Professional charting, indicators and multi-timeframe context built for clarity.' },
  { n: '03', title: 'AI-powered market insights', detail: 'Signals and narrative context that explain what changed and why it matters.' },
  { n: '04', title: 'Smart portfolio monitoring', detail: 'Exposure, attribution and risk across every position you hold.' },
  { n: '05', title: 'Global financial coverage', detail: '50+ markets and 100K+ instruments, from New York to Mumbai.' },
];

export const insights = [
  {
    tag: 'MOMENTUM',
    title: 'Breadth is improving beneath the index.',
    confidence: 87,
    body: 'Advancing issues are outpacing decliners across US large caps while volatility compresses. Historically, this combination has preceded a broader participation phase rather than a narrow melt-up.',
    factors: ['Market breadth +18.4%', 'VIX 14.2 (-1.8)', 'Tech leadership intact'],
  },
  {
    tag: 'ROTATION',
    title: 'Capital is rotating toward quality cyclicals.',
    confidence: 74,
    body: 'Flows into industrials and financials have accelerated for three consecutive sessions while high-multiple growth names consolidate. The move looks orderly, not defensive.',
    factors: ['Industrials +1.9%', 'Financials +1.4%', 'Growth / value spread -0.8%'],
  },
  {
    tag: 'RISK',
    title: 'Concentration risk remains the key variable.',
    confidence: 81,
    body: 'The top five constituents now represent a meaningful share of index performance. A single earnings miss could create index-level noise even if the median stock is healthy.',
    factors: ['Top-5 weight 27.6%', 'Correlation 0.71', 'Earnings window opens in 6 days'],
  },
];

/* ----------------------------- pricing ----------------------------- */

export interface Plan {
  name: string;
  tagline: string;
  monthly: number | null;
  annual: number | null;
  cta: string;
  featured?: boolean;
  features: string[];
}

export const plans: Plan[] = [
  {
    name: 'Explorer',
    tagline: 'For the curious investor building a market habit.',
    monthly: 0,
    annual: 0,
    cta: 'Start exploring',
    features: [
      'Global market overview',
      '3 watchlists',
      'Delayed index data',
      'Daily market brief',
      'Community access',
    ],
  },
  {
    name: 'Pro',
    tagline: 'For active investors who need the full picture.',
    monthly: 29,
    annual: 23,
    cta: 'Start 14-day trial',
    featured: true,
    features: [
      'Everything in Explorer',
      'Real-time global indices',
      'Advanced charting & indicators',
      'AI market insights',
      'Unlimited watchlists',
      'Portfolio analytics',
      'Priority support',
    ],
  },
  {
    name: 'Institutional',
    tagline: 'For teams that allocate, research and advise.',
    monthly: null,
    annual: null,
    cta: 'Talk to sales',
    features: [
      'Everything in Pro',
      'Team workspaces',
      'API & data exports',
      'Custom coverage universes',
      'SSO & audit trails',
      'Dedicated success manager',
    ],
  },
];
