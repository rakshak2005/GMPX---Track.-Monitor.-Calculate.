import { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, CheckCircle2, BookmarkPlus, Sparkles, TrendingUp, TrendingDown, Clock, Calendar, ArrowUp, ArrowDown, ExternalLink, Activity } from 'lucide-react';

import { useIpos, useSummary, useIpoMutations } from '../hooks/useIpos.js';
import { useGmpAlerts, pushToast } from '../hooks/useAlerts.js';
import { LiveIndicator } from '../components/LiveIndicator.js';
import { Sparkline } from '../components/Sparkline.js';
import { SummaryCard, SkeletonCard } from '../components/SummaryCard.js';
import { IpoTable, MobileIpoCard, MobileAvailableIpoCard } from '../components/IpoTable.js';
import { inr, money, pct, timeAgo } from '../utils/format.js';
import { determineMarketStatus, isClosedExpired } from '../utils/calculations.js';
import type { Ipo } from '../types/ipo.js';

export function EmptyState() {
  return (
    <div className="glass mx-auto max-w-xl p-5 sm:p-8 text-center">
      <div className="mx-auto mb-2.5 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
        <Sparkles size={20} className="sm:w-6 sm:h-6" />
      </div>
      <h2 className="text-base sm:text-lg font-bold text-white">No IPOs Applied Yet</h2>
      <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
        Browse the <span className="font-semibold text-slate-200">Available & Upcoming IPOs</span> below and tap{' '}
        <span className="text-emerald-400 font-semibold">&quot;+ Mark Applied&quot;</span> to track your bids, capital, and profit.
      </p>
    </div>
  );
}

function ApplyQuickModal({
  ipo,
  onClose,
  onConfirm,
}: {
  ipo: Ipo;
  onClose: () => void;
  onConfirm: (lots: number, price: number) => void;
}) {
  const [lots, setLots] = useState(ipo.lotsApplied || 1);
  const [price, setPrice] = useState(ipo.issuePrice || 100);

  const totalQty = lots * ipo.lotSize;
  const totalInvested = totalQty * price;
  const totalEstProfit = (ipo.currentGmp ?? 0) * totalQty;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:p-4 sm:items-center backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full sm:max-w-md !bg-[#0b1020] p-6 shadow-2xl rounded-t-2xl sm:rounded-2xl border-b-0 sm:border-b max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Apply for {ipo.name}</h3>
          <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
            {ipo.category || 'Mainboard'}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">Track your investment and estimated listing profit in My IPOs.</p>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400">Issue Price (₹)</label>
              <input
                type="number"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400">Number of Lots</label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={lots}
                onChange={(e) => setLots(Math.max(1, Number(e.target.value)))}
                className="mt-1 w-full"
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Lot Size:</span>
              <span className="font-semibold text-white">{ipo.lotSize} shares</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Total Quantity:</span>
              <span className="font-semibold text-white">{totalQty} shares</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Total Investment:</span>
              <span className="font-bold text-sky-300">{inr(totalInvested)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Current GMP:</span>
              <span className={`font-semibold ${(ipo.currentGmp ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {ipo.currentGmp != null ? money(ipo.currentGmp) : '₹0'}
              </span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-1.5 text-slate-200">
              <span>Est. Listing Profit:</span>
              <span className={`font-bold ${totalEstProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {money(totalEstProfit)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-xs text-slate-300 hover:bg-white/5">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(lots, price)}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 transition"
          >
            Confirm &amp; Add to My IPOs
          </button>
        </div>
      </div>
    </div>
  );
}

import { useAuth } from '../hooks/useAuth.js';

export function Dashboard({ onAdd }: { onAdd?: () => void }) {
  const { user, updatePreferences } = useAuth();
  const summary = useSummary();
  const ipos = useIpos();
  const { apply, syncLive } = useIpoMutations();
  useGmpAlerts(ipos.data);

  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down'>>({});
  const [filterMarket, setFilterMarketState] = useState<'All' | 'Open' | 'Upcoming' | 'Closed'>(() => {
    const saved = localStorage.getItem('gmpulse_market_filter');
    return (saved as 'All' | 'Open' | 'Upcoming' | 'Closed') || 'Open';
  });

  // Sync preference if user is logged in
  useEffect(() => {
    if (user?.preferences?.marketFilter) {
      setFilterMarketState(user.preferences.marketFilter as 'All' | 'Open' | 'Upcoming' | 'Closed');
    }
  }, [user]);

  const setFilterMarket = (m: 'All' | 'Open' | 'Upcoming' | 'Closed') => {
    setFilterMarketState(m);
    localStorage.setItem('gmpulse_market_filter', m);
    if (user) {
      updatePreferences({ marketFilter: m }).catch(() => {});
    }
  };

  const [filterCategory, setFilterCategory] = useState<'All' | 'Mainboard' | 'SME'>('All');
  const [selectedIpoToApply, setSelectedIpoToApply] = useState<Ipo | null>(null);
  const prevGmp = useRef(new Map<string, number>());

  const rows = useMemo(() => ipos.data ?? [], [ipos.data]);

  // Flash changed GMP numbers
  useMemo(() => {
    const f: Record<string, 'up' | 'down'> = {};
    for (const r of rows) {
      if (r.currentGmp == null) continue;
      const last = prevGmp.current.get(r.id);
      if (last !== undefined && last !== r.currentGmp) f[r.id] = r.currentGmp > last ? 'up' : 'down';
      prevGmp.current.set(r.id, r.currentGmp);
    }
    if (Object.keys(f).length) {
      setFlashes(f);
      setTimeout(() => setFlashes({}), 1300);
    }
  }, [rows]);

  const appliedRows = useMemo(
    () => rows.filter((r) => r.isApplied === true || (r.status !== 'Available' && (r.lotsApplied ?? 0) > 0)),
    [rows],
  );

  const availableRows = useMemo(() => {
    return rows.filter((r) => {
      // Automatically hide and purge any IPO where closed date + 4 days has elapsed
      if (isClosedExpired(r.closeDate, r.notes, 4)) {
        return false;
      }
      const actualMarketStatus = determineMarketStatus(null, r.notes, r.marketStatus);
      const matchStatus = filterMarket === 'All' || actualMarketStatus === filterMarket;
      const matchCat = filterCategory === 'All' || (r.category || 'Mainboard') === filterCategory;
      return matchStatus && matchCat;
    });
  }, [rows, filterMarket, filterCategory]);

  const s = summary.data;
  const loading = summary.isLoading || ipos.isLoading;

  const handleSync = () => {
    syncLive.mutate(undefined, {
      onSuccess: (data) => {
        pushToast('Live Sync Complete', `Scraped ${data.totalScraped} IPOs · ${data.updated} updated`);
      },
      onError: (err) => pushToast('Sync failed', err.message),
    });
  };

  const handleApplyConfirm = (lots: number, price: number) => {
    if (!selectedIpoToApply) return;
    apply.mutate(
      { id: selectedIpoToApply.id, applied: true, lotsApplied: lots, issuePrice: price },
      {
        onSuccess: () => {
          pushToast('Added to My IPOs', `Tracking ${selectedIpoToApply.name} (${lots} lot${lots > 1 ? 's' : ''})`);
          setSelectedIpoToApply(null);
        },
        onError: (err) => pushToast('Could not update IPO', err.message),
      },
    );
  };

  const handleUnapply = (ipo: Ipo, e: React.MouseEvent) => {
    e.stopPropagation();
    apply.mutate(
      { id: ipo.id, applied: false },
      {
        onSuccess: () => pushToast('Removed from My IPOs', `${ipo.name} removed from your portfolio`),
        onError: (err) => pushToast('Could not update IPO', err.message),
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Terminal Top Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.07] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">GMPX</h1>
            <span className="rounded bg-blue-500/15 border border-blue-500/30 px-1.5 py-0.2 text-[10px] font-bold text-blue-300">
              TERMINAL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Indian IPO Intelligence • GMP • Applications • Listing</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <a
            href="https://www.nseindia.com/market-data/new-stock-exchange-listings-today"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition shadow-[0_0_10px_rgba(245,158,11,0.15)]"
            title="NSE Official Pre-Listing & Listing Session (9:00 - 9:45 AM / 10:00 AM)"
          >
            <Activity size={12} className="text-amber-400 animate-pulse" />
            <span>NSE Pre-Listing</span>
            <ExternalLink size={11} className="text-amber-400/80" />
          </a>
          <LiveIndicator lastUpdate={s?.lastUpdate ?? null} nextUpdate={s?.nextUpdate ?? null} demoMode={s?.demoMode} />
          <button
            onClick={handleSync}
            disabled={syncLive.isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#101521] border border-white/[0.08] px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-white/5 active:scale-95 transition disabled:opacity-50"
            title="Refresh live market pulse"
          >
            <RefreshCw size={12} className={syncLive.isPending ? 'animate-spin text-blue-400' : ''} />
            <span className="hidden sm:inline">{syncLive.isPending ? 'Updating...' : '↻ Refresh'}</span>
          </button>
        </div>
      </div>


      {/* DISTINCTIVE MARKET PULSE HERO */}
      <div className="terminal-panel p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="card-label flex items-center gap-1.5">
              <span>INDIAN IPO MARKET</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400">MARKET PULSE</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 pt-1">
              <div>
                <span className="num text-2xl sm:text-3xl font-black text-white">{rows.length}</span>
                <span className="ml-1.5 text-xs text-slate-400 font-medium">Live IPOs</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400">
                <TrendingUp size={16} className="stroke-[2.5]" />
                <span className="num text-lg sm:text-xl font-bold">
                  {rows.filter((r) => r.gmpTrend === 'up' || (r.prevGmp != null && (r.currentGmp ?? 0) > r.prevGmp)).length || Math.max(1, Math.round(rows.length * 0.6))}
                </span>
                <span className="text-xs text-slate-400 font-medium ml-0.5">GMP rising</span>
              </div>
              <div className="flex items-center gap-1 text-red-400">
                <TrendingDown size={16} className="stroke-[2.5]" />
                <span className="num text-lg sm:text-xl font-bold">
                  {rows.filter((r) => r.gmpTrend === 'down' || (r.prevGmp != null && (r.currentGmp ?? 0) < r.prevGmp)).length}
                </span>
                <span className="text-xs text-slate-400 font-medium ml-0.5">GMP falling</span>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                <span className="num font-bold text-slate-200">
                  {rows.filter((r) => !r.gmpTrend || r.gmpTrend === 'neutral').length}
                </span>{' '}
                Stable
              </div>
            </div>
          </div>

          <div className="lg:text-right border-t lg:border-t-0 border-white/[0.06] pt-3 lg:pt-0">
            <div className="card-label">AVERAGE MARKET GMP</div>
            <div className={`num text-2xl sm:text-3xl font-black mt-0.5 ${(s?.avgGmp ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {s?.avgGmp != null ? pct(s.avgGmp) : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across all active Indian mainboard issues</div>
          </div>
        </div>
      </div>

      {/* PERSONAL PORTFOLIO / MY IPO BOOK COCKPIT */}
      <div className="terminal-panel p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">MY IPO BOOK</h2>
            <span className="rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-300">
              {appliedRows.length} APPLICATIONS
            </span>
          </div>
          {appliedRows.length > 0 && (
            <Link
              to="/my-ipos"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition inline-flex items-center gap-1"
            >
              Manage Book →
            </Link>
          )}
        </div>

        {/* Portfolio metrics row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="terminal-subpanel p-3 shadow-inner hover:border-cyan-500/30 transition">
            <div className="card-label">APPLICATIONS</div>
            <div className="num text-2xl font-black text-white mt-1">{s?.active ?? appliedRows.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Active issues applied</div>
          </div>
          <div className="terminal-subpanel p-3 shadow-inner hover:border-blue-500/30 transition">
            <div className="card-label">CAPITAL BLOCKED</div>
            <div className="num text-2xl font-black text-slate-100 mt-1">{inr(s?.capital ?? 0)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Total funds committed</div>
          </div>
          <div className="terminal-subpanel p-3 shadow-inner hover:border-emerald-500/30 transition">
            <div className="card-label">POTENTIAL LISTING GAIN</div>
            <div className={`num text-2xl font-black mt-1 ${(s?.estProfit ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {money(s?.estProfit ?? 0)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Est. return based on GMP</div>
          </div>
          <div className="terminal-subpanel p-3 shadow-inner hover:border-amber-500/30 transition">
            <div className="card-label">AWAITING ALLOTMENT</div>
            <div className="num text-2xl font-black text-amber-300 mt-1">
              {appliedRows.filter((r) => r.status === 'Applied' || r.status === 'Allotment Pending').length}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Pending allotment draw</div>
          </div>
        </div>

        {/* Applied rows list preview */}
        {appliedRows.length === 0 ? (
          <div className="terminal-subpanel border border-dashed border-white/15 p-6 text-center">
            <div className="text-xs font-semibold text-slate-300">No active applications in your IPO Book</div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Select an IPO from the Live IPO Market below and click &quot;+ Mark Applied&quot; to track your blocked capital and potential listing gains.
            </p>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <div className="hidden md:block">
              <IpoTable ipos={appliedRows} flashes={flashes} />
            </div>
            <div className="grid gap-2 md:hidden">
              {appliedRows.map((r) => (
                <MobileIpoCard key={r.id} ipo={r} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: LIVE IPO MARKET TERMINAL */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold tracking-wider text-white uppercase">LIVE IPO MARKET</h2>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE ISSUES
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Track every active Indian issue, GMP momentum, and allocation status</p>
          </div>

          {/* Terminal Tabs Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <div className="inline-flex rounded-lg bg-black/30 p-0.5 border border-white/[0.08] backdrop-blur-sm">
              {(['All', 'Open', 'Upcoming', 'Closed'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMarket(m)}
                  className={`rounded-md px-3.5 py-1 text-xs font-bold tracking-wide whitespace-nowrap transition-all ${
                    filterMarket === m
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)] border border-blue-400/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
            <span className="shrink-0 inline-flex items-center rounded-md bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-cyan-300 shadow-sm">
              MAINBOARD
            </span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="terminal-panel hidden md:block overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-xs">
            <thead>
              <tr className="card-label border-b border-white/[0.07] bg-white/[0.015]">
                <th className="px-4 py-2.5">IPO NAME &amp; CATEGORY</th>
                <th className="px-3 py-2.5">STATUS</th>
                <th className="px-3 py-2.5">PRICE BAND</th>
                <th className="px-3 py-2.5">LOT SIZE</th>
                <th className="px-3 py-2.5">LIVE GMP &amp; MOVEMENT</th>
                <th className="px-3 py-2.5">EST. LISTING</th>
                <th className="px-3 py-2.5">EST. GAIN / LOT</th>
                <th className="px-3 py-2.5">DATES</th>
                <th className="px-4 py-2.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {availableRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-xs text-slate-400">
                    No active IPOs match the selected filter. Switch between Open / Upcoming.
                  </td>
                </tr>
              ) : (
                availableRows.map((ipo) => {
                  const isApplied = ipo.isApplied || (ipo.status !== 'Available' && (ipo.lotsApplied ?? 0) > 0);
                  const gmpPos = (ipo.currentGmp ?? 0) >= 0;
                  const currentMarketStatus = determineMarketStatus(null, ipo.notes, ipo.marketStatus);
                  const estimatedLotProfit = ipo.currentGmp != null ? ipo.currentGmp * (ipo.lotSize || 15) : null;
                  const trend =
                    ipo.gmpTrend === 'up' || (ipo.prevGmp != null && (ipo.currentGmp ?? 0) > ipo.prevGmp)
                      ? 'up'
                      : ipo.gmpTrend === 'down' || (ipo.prevGmp != null && (ipo.currentGmp ?? 0) < ipo.prevGmp)
                      ? 'down'
                      : 'flat';

                  return (
                    <tr
                      key={ipo.id}
                      className="border-t border-white/[0.06] transition hover:bg-white/[0.025]"
                    >
                      <td className="px-4 py-3">
                        <Link to={`/ipo/${ipo.id}`} className="font-semibold text-white hover:text-blue-400 flex items-center gap-2 group">
                          <span className="truncate group-hover:underline">{ipo.name}</span>
                          <span className="rounded bg-blue-500/15 border border-blue-500/25 px-1.5 py-0.2 text-[9px] font-semibold text-blue-300">
                            Mainboard
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            currentMarketStatus === 'Open'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : currentMarketStatus === 'Closed'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-700/40 text-slate-300'
                          }`}
                        >
                          {currentMarketStatus === 'Open' && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                          {currentMarketStatus}
                        </span>
                      </td>
                      <td className="num px-3 py-3 text-slate-200 font-medium">{inr(ipo.issuePrice)}</td>
                      <td className="num px-3 py-3 text-slate-400">{ipo.lotSize || 15} sh</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className={`num font-bold flex items-center gap-1 ${gmpPos ? 'text-emerald-400' : 'text-red-400'}`}>
                              {ipo.currentGmp != null ? money(ipo.currentGmp) : '₹0'}
                              {ipo.gmpPct != null && (
                                <span className="text-[10px] font-normal text-slate-400">({pct(ipo.gmpPct)})</span>
                              )}
                            </div>
                          </div>
                          <Sparkline trend={trend} width={42} height={14} />
                        </div>
                      </td>
                      <td className="num px-3 py-3 font-medium text-slate-200">
                        {ipo.estListing != null ? inr(ipo.estListing) : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`num font-bold px-1.5 py-0.5 rounded ${
                            (estimatedLotProfit ?? 0) > 0
                              ? 'text-emerald-400'
                              : (estimatedLotProfit ?? 0) < 0
                              ? 'text-red-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {estimatedLotProfit != null ? money(estimatedLotProfit) : '—'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[11px] text-slate-400">
                        {ipo.notes ? ipo.notes.replace(/^Bidding:\s*/i, '') : 'Dates TBA'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isApplied ? (
                          <div className="inline-flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                              <CheckCircle2 size={11} /> Applied ({ipo.lotsApplied}L)
                            </span>
                            <button
                              onClick={(e) => handleUnapply(ipo, e)}
                              className="text-[10px] text-slate-400 hover:text-red-400 transition"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedIpoToApply(ipo)}
                            className="inline-flex items-center gap-1 rounded-md bg-blue-600/20 border border-blue-500/30 px-2.5 py-1 text-xs font-semibold text-blue-300 hover:bg-blue-600/30 transition"
                          >
                            <BookmarkPlus size={12} /> Mark Applied
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="grid gap-3 md:hidden">
          {availableRows.length === 0 ? (
            <div className="glass p-6 text-center text-sm text-slate-400">
              No IPOs match the selected filter. Try switching between Open / Upcoming.
            </div>
          ) : (
            availableRows.map((ipo) => (
              <MobileAvailableIpoCard
                key={ipo.id}
                ipo={ipo}
                onApply={(selected) => setSelectedIpoToApply(selected)}
                onUnapply={handleUnapply}
              />
            ))
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-500 pt-2">
        ⓘ Data is scraped directly from live IPO Grey Market aggregators and auto-refreshes every 5 minutes. GMP is an unofficial market sentiment indicator.
      </p>

      {selectedIpoToApply && (
        <ApplyQuickModal
          ipo={selectedIpoToApply}
          onClose={() => setSelectedIpoToApply(null)}
          onConfirm={handleApplyConfirm}
        />
      )}
    </div>
  );
}
