import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Globe2, TrendingDown, TrendingUp } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { Button } from '../components/Button';
import { MiniChart } from '../components/MiniChart';
import { MarketChart, RangeSwitcher } from '../components/MarketChart';
import { FinalCTA } from '../sections/FinalCTA';
import { marketRows, seriesForRange, type Range, type Region } from '../data/market';

const REGIONS = ['All', 'US', 'Asia', 'Europe', 'Commodities'] as const;
type Filter = (typeof REGIONS)[number];

const SECTORS = [
  { name: 'Technology', pct: 1.84 },
  { name: 'Financials', pct: 1.12 },
  { name: 'Industrials', pct: 0.92 },
  { name: 'Healthcare', pct: 0.31 },
  { name: 'Consumer', pct: -0.22 },
  { name: 'Energy', pct: -0.48 },
];

const MOVERS = [
  { ticker: 'NVDA', name: 'NVIDIA Corp.', pct: 3.82, points: [30, 33, 31, 38, 42, 40, 47, 52] },
  { ticker: 'RELIANCE', name: 'Reliance Industries', pct: 2.64, points: [28, 30, 29, 34, 37, 41, 40, 46] },
  { ticker: 'AAPL', name: 'Apple Inc.', pct: 1.48, points: [33, 32, 35, 34, 38, 37, 41, 44] },
  { ticker: 'TSLA', name: 'Tesla Inc.', pct: -2.18, points: [48, 45, 47, 41, 43, 38, 36, 33] },
  { ticker: 'HDFCBANK', name: 'HDFC Bank', pct: -1.24, points: [40, 42, 39, 37, 38, 34, 35, 31] },
  { ticker: 'BP', name: 'BP plc', pct: -0.86, points: [36, 35, 37, 34, 33, 31, 32, 29] },
];

const SESSIONS = [
  { city: 'New York', exchange: 'NYSE · NASDAQ', time: '09:30 — 16:00', status: 'OPEN' },
  { city: 'London', exchange: 'LSE', time: '08:00 — 16:30', status: 'OPEN' },
  { city: 'Mumbai', exchange: 'NSE · BSE', time: '09:15 — 15:30', status: 'CLOSED' },
  { city: 'Tokyo', exchange: 'TSE', time: '09:00 — 15:00', status: 'CLOSED' },
];

const price = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function MarketsPage() {
  const [region, setRegion] = useState<Filter>('All');
  const [selected, setSelected] = useState('NIFTY 50');
  const [range, setRange] = useState<Range>('1M');

  const rows = useMemo(
    () => (region === 'All' ? marketRows : marketRows.filter((row) => row.region === (region as Region))),
    [region],
  );

  const selectedRow = marketRows.find((row) => row.asset === selected) ?? marketRows[3];
  const scale = selectedRow.price / 24862.4;
  const composite = seriesForRange('1M').map((point) => point.value);

  return (
    <>
      <PageHero
        eyebrow="Markets · Global Coverage"
        title={
          <>
            Every market,
            <br />
            in one field of view.
          </>
        }
        description="Track global indices, commodities and currencies through a single, coherent market layer. Built for investors who need context, not noise."
        actions={
          <>
            <Button to="/dashboard" variant="ink" arrow>
              Open Terminal
            </Button>
            <Button to="/intelligence" variant="ghost">
              See Intelligence
            </Button>
          </>
        }
        aside={
          <div className="dark-card p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="eyebrow" style={{ color: 'rgba(244,248,245,.45)', fontSize: 8 }}>
                Global composite
              </span>
              <span className="live-pill">
                <i aria-hidden="true" />
                Demo data
              </span>
            </div>
            <div className="mt-4 flex items-end gap-3 flex-wrap">
              <div style={{ fontSize: 34, letterSpacing: '-.05em', lineHeight: 1, color: '#F4F8F5' }}>
                24,862.40
              </div>
              <span className="dash-change" style={{ marginBottom: 3 }}>
                ▲ +2.64%
              </span>
            </div>
            <div style={{ marginTop: 18 }}>
              <MiniChart points={composite} width={380} height={86} color="#C7F464" fill showEndDot className="w-full" />
            </div>
            <div
              className="mt-4 grid grid-cols-3 gap-3 border-t pt-3"
              style={{ borderColor: 'rgba(255,255,255,.1)' }}
            >
              {[
                ['OPEN', '24,196.40'],
                ['HIGH', '24,918.20'],
                ['LOW', '24,182.60'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="eyebrow" style={{ color: 'rgba(244,248,245,.35)', fontSize: 7 }}>
                    {label}
                  </div>
                  <div className="num-mono" style={{ color: 'rgba(244,248,245,.8)', fontSize: 10, marginTop: 4 }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4" style={{ fontSize: 9, lineHeight: 1.6, color: 'rgba(244,248,245,.35)' }}>
              Illustrative snapshot. No live market-data provider is configured.
            </p>
          </div>
        }
      />

      <section className="page-section" aria-label="Global market monitor">
        <div className="gmp-container">
          <SectionHeading
            kicker="Market monitor"
            title="The world, quoted."
            sub="Filter the global board by region. Every figure on this page is deterministic sample data for demonstration."
            actions={
              <span className="demo-badge" style={{ color: '#4C7A1E', borderColor: 'rgba(76,122,30,.25)', background: 'rgba(199,244,100,.14)' }}>
                <span className="chip-dot" aria-hidden="true" />
                Demo data
              </span>
            }
          />

          <Reveal className="mt-8">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="group" aria-label="Filter markets by region">
              {REGIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRegion(item)}
                  aria-pressed={region === item}
                  className={`rounded-[4px] border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.12em] transition ${
                    region === item
                      ? 'border-ink bg-ink text-white'
                      : 'border-[rgba(11,21,18,.12)] bg-white/50 text-[#4A5750] hover:bg-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="light-card mt-4 overflow-x-auto gmp-scrollbar">
              <table className="data-table" style={{ minWidth: 760 }}>
                <caption className="sr-only">Illustrative market overview, filterable by region</caption>
                <thead>
                  <tr>
                    <th scope="col">Asset</th>
                    <th scope="col">Price</th>
                    <th scope="col">Change</th>
                    <th scope="col">Change %</th>
                    <th scope="col">Market status</th>
                    <th scope="col">7D trend</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.asset}>
                      <td>
                        <div className="mkt-asset">
                          <span
                            className="mkt-asset-mark"
                            aria-hidden="true"
                            style={{ borderColor: 'rgba(11,21,18,.1)', background: 'rgba(11,21,18,.04)', color: '#4A5750' }}
                          >
                            {row.code.slice(0, 3)}
                          </span>
                          <div>
                            <div style={{ color: '#0B1512', fontWeight: 500, fontSize: 12.5 }}>{row.asset}</div>
                            <div className="num-mono" style={{ color: '#82909D', fontSize: 7.5, marginTop: 2, letterSpacing: '.1em' }}>
                              {row.code} · {row.region.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="num-mono" style={{ color: '#0B1512' }}>
                        {price(row.price)}
                      </td>
                      <td className="num-mono" style={{ color: row.change >= 0 ? '#3F6B13' : '#B93C43' }}>
                        {row.change >= 0 ? '+' : ''}
                        {row.change.toFixed(2)}
                      </td>
                      <td className="num-mono" style={{ color: row.pct >= 0 ? '#3F6B13' : '#B93C43' }}>
                        {row.pct >= 0 ? '+' : ''}
                        {row.pct.toFixed(2)}%
                      </td>
                      <td>
                        <span className={`light-status ${row.status === 'BEARISH' ? 'bear' : ''}`}>
                          <i aria-hidden="true" />
                          {row.status}
                        </span>
                      </td>
                      <td>
                        <MiniChart
                          points={row.points}
                          width={72}
                          height={18}
                          color={row.pct >= 0 ? '#4C7A1E' : '#C23B41'}
                          strokeWidth={1.2}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="page-section page-section-alt" aria-label="Index explorer">
        <div className="gmp-container">
          <SectionHeading
            kicker="Index explorer"
            title="Open the chart. Read the context."
            sub="Switch indices and time horizons. The chart updates instantly with a deterministic sample series."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
            <Reveal className="light-card p-3">
              <div className="eyebrow px-2 py-2" style={{ fontSize: 8 }}>
                Watchlist
              </div>
              <div className="flex flex-col">
                {marketRows.slice(0, 6).map((row) => (
                  <button
                    key={row.asset}
                    type="button"
                    onClick={() => setSelected(row.asset)}
                    aria-pressed={selected === row.asset}
                    className={`flex items-center justify-between gap-3 rounded-[5px] px-2.5 py-3 text-left transition ${
                      selected === row.asset ? 'bg-ink text-white' : 'hover:bg-white/70'
                    }`}
                  >
                    <span>
                      <span className="block text-[12.5px] font-medium">{row.asset}</span>
                      <span
                        className="num-mono block"
                        style={{ fontSize: 7.5, letterSpacing: '.1em', opacity: 0.5, marginTop: 2 }}
                      >
                        {row.code}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="num-mono block" style={{ fontSize: 10.5 }}>
                        {price(row.price)}
                      </span>
                      <span
                        className="num-mono block"
                        style={{ fontSize: 8.5, color: row.pct >= 0 ? (selected === row.asset ? '#C7F464' : '#3F6B13') : '#FF8B90' }}
                      >
                        {row.pct >= 0 ? '+' : ''}
                        {row.pct.toFixed(2)}%
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.08} className="light-card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[16px] font-medium tracking-[-.02em]">{selectedRow.asset}</h3>
                    <span className={`light-status ${selectedRow.status === 'BEARISH' ? 'bear' : ''}`}>
                      <i aria-hidden="true" />
                      {selectedRow.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="num-mono text-[26px] tracking-[-.04em]" style={{ color: '#0B1512' }}>
                      {price(selectedRow.price)}
                    </span>
                    <span
                      className="num-mono text-[11px]"
                      style={{ color: selectedRow.pct >= 0 ? '#3F6B13' : '#B93C43', marginBottom: 3 }}
                    >
                      {selectedRow.change >= 0 ? '+' : ''}
                      {selectedRow.change.toFixed(2)} ({selectedRow.pct >= 0 ? '+' : ''}
                      {selectedRow.pct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <RangeSwitcher range={range} onChange={setRange} />
              </div>
              <div className="mt-4">
                <MarketChart range={range} height={300} scale={scale} />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3" style={{ borderColor: 'rgba(11,21,18,.08)' }}>
                <span className="eyebrow" style={{ fontSize: 7.5 }}>
                  {selectedRow.asset} · {range} · illustrative sample
                </span>
                <span className="eyebrow" style={{ fontSize: 7.5, color: '#4C7A1E' }}>
                  Range change +2.64%
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="page-section" aria-label="Sector performance and movers">
        <div className="gmp-container">
          <div className="grid gap-4 lg:grid-cols-2">
            <Reveal className="light-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="section-kicker">Sector pulse</div>
                  <h3 className="mt-3 text-[24px] font-medium tracking-[-.04em]">Where capital is moving.</h3>
                </div>
                <Globe2 size={20} style={{ color: '#4C7A1E' }} aria-hidden="true" />
              </div>
              <div className="mt-6 space-y-4">
                {SECTORS.map((sector) => {
                  const positive = sector.pct >= 0;
                  const width = `${Math.min(100, 24 + Math.abs(sector.pct) * 28)}%`;
                  return (
                    <div key={sector.name}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[12px] font-medium">{sector.name}</span>
                        <span className="num-mono text-[10px]" style={{ color: positive ? '#3F6B13' : '#B93C43' }}>
                          {positive ? '+' : ''}
                          {sector.pct.toFixed(2)}%
                        </span>
                      </div>
                      <div className="mt-2 h-[3px] w-full rounded-full" style={{ background: 'rgba(11,21,18,.08)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width, background: positive ? '#8FD83C' : '#DE4C52' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="stats-note" style={{ marginTop: 22 }}>
                Illustrative sector data. Not live.
              </p>
            </Reveal>

            <Reveal delay={0.08} className="light-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="section-kicker">Movers</div>
                  <h3 className="mt-3 text-[24px] font-medium tracking-[-.04em]">The names in motion.</h3>
                </div>
                <span className="eyebrow" style={{ fontSize: 7.5 }}>
                  Demo watchlist
                </span>
              </div>
              <div className="mt-4">
                {MOVERS.map((mover) => (
                  <div
                    key={mover.ticker}
                    className="flex items-center justify-between gap-3 border-b py-3 last:border-b-0"
                    style={{ borderColor: 'rgba(11,21,18,.07)' }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-[5px] border text-[8px] font-mono"
                        style={{ borderColor: 'rgba(11,21,18,.1)', background: 'rgba(11,21,18,.03)' }}
                        aria-hidden="true"
                      >
                        {mover.ticker.slice(0, 2)}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-medium">{mover.name}</div>
                        <div className="num-mono" style={{ fontSize: 7.5, color: '#82909D', letterSpacing: '.1em' }}>
                          {mover.ticker}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MiniChart
                        points={mover.points}
                        width={60}
                        height={18}
                        color={mover.pct >= 0 ? '#4C7A1E' : '#C23B41'}
                        strokeWidth={1.2}
                      />
                      <span
                        className="num-mono flex items-center gap-1 text-[10px]"
                        style={{ color: mover.pct >= 0 ? '#3F6B13' : '#B93C43', minWidth: 52, justifyContent: 'flex-end' }}
                      >
                        {mover.pct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {mover.pct >= 0 ? '+' : ''}
                        {mover.pct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="page-section page-section-alt" aria-label="Global market sessions">
        <div className="gmp-container">
          <SectionHeading
            kicker="Follow the sun"
            title="A market desk that never closes."
            sub="Four sessions, one continuous conversation. GMPX keeps the global picture connected while you sleep."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SESSIONS.map((session, index) => (
              <Reveal key={session.city} delay={index * 0.05} className="light-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="eyebrow" style={{ fontSize: 7.5 }}>
                    Session 0{index + 1}
                  </span>
                  <span className={`light-status ${session.status === 'CLOSED' ? 'bear' : ''}`}>
                    <i aria-hidden="true" />
                    {session.status}
                  </span>
                </div>
                <div className="mt-5 text-[20px] font-medium tracking-[-.03em]">{session.city}</div>
                <div className="eyebrow mt-1" style={{ fontSize: 7.5 }}>
                  {session.exchange}
                </div>
                <div className="mt-4 flex items-center gap-1.5 border-t pt-3" style={{ borderColor: 'rgba(11,21,18,.08)' }}>
                  <Clock size={11} style={{ color: '#6E7A73' }} aria-hidden="true" />
                  <span className="num-mono" style={{ fontSize: 9, color: '#4A5750' }}>
                    {session.time}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="stats-note" style={{ marginTop: 20 }}>
            Session states are illustrative. Times shown are local exchange hours, not live status.
          </p>
        </div>
      </section>

      <section className="page-section" aria-label="Continue exploring">
        <div className="gmp-container">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { to: '/intelligence', label: 'Intelligence', title: 'Turn market noise into a clear signal.', copy: 'Read the forces behind every move with AI-assisted context and risk framing.' },
              { to: '/products', label: 'Products', title: 'One terminal. Every workflow.', copy: 'Explore the connected tools behind the GMPX market experience.' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="light-card group p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="eyebrow" style={{ fontSize: 8 }}>
                    {item.label}
                  </span>
                  <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: '#4C7A1E' }} />
                </div>
                <h3 className="mt-8 max-w-[420px] text-[26px] font-medium leading-[1.02] tracking-[-.045em]">{item.title}</h3>
                <p className="mt-3 max-w-[420px] text-[12.5px] leading-relaxed" style={{ color: '#6E7A73' }}>
                  {item.copy}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA
        eyebrow="Global coverage · one standard"
        title="Every market. One standard of clarity."
        description="Move from index to insight without losing the thread. GMPX connects the global market picture into one coherent experience."
        primaryLabel="Open Terminal"
        primaryTo="/dashboard"
        secondaryLabel="Explore Intelligence"
        secondaryTo="/intelligence"
      />
    </>
  );
}
