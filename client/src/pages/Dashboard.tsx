import { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, CheckCircle2, BookmarkPlus, Sparkles, TrendingUp, TrendingDown, Clock, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { useIpos, useSummary, useIpoMutations } from '../hooks/useIpos.js';
import { useGmpAlerts, pushToast } from '../hooks/useAlerts.js';
import { LiveIndicator } from '../components/LiveIndicator.js';
import { SummaryCard, SkeletonCard } from '../components/SummaryCard.js';
import { IpoTable, MobileIpoCard, MobileAvailableIpoCard } from '../components/IpoTable.js';
import { inr, money, pct, timeAgo } from '../utils/format.js';
import { determineMarketStatus } from '../utils/calculations.js';
import type { Ipo } from '../types/ipo.js';

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="glass mx-auto max-w-xl p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
        <Sparkles size={24} />
      </div>
      <h2 className="text-lg font-bold">No IPOs Applied Yet</h2>
      <p className="mt-1 text-sm text-slate-400">
        Browse the <span className="font-semibold text-slate-200">Available & Upcoming IPOs</span> below and click{' '}
        <span className="text-emerald-400 font-semibold">&quot;+ Mark Applied&quot;</span> to track your bids, capital, and profit.
      </p>
      <button onClick={onAdd} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/20">
        <Plus size={14} /> Add Custom / Unlisted IPO
      </button>
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

export function Dashboard({ onAdd }: { onAdd: () => void }) {
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
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">IPO COMMAND CENTER</h1>
          <p className="mt-1 text-sm text-slate-400">Live Indian IPO Grey Market Premium &amp; Portfolio Tracker</p>
          <div className="mt-2">
            <LiveIndicator lastUpdate={s?.lastUpdate ?? null} nextUpdate={s?.nextUpdate ?? null} demoMode={s?.demoMode} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncLive.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition disabled:opacity-50"
            title="Fetch latest open & upcoming IPOs and GMP now"
          >
            <RefreshCw size={14} className={syncLive.isPending ? 'animate-spin text-blue-400' : ''} />
            {syncLive.isPending ? 'Syncing Market…' : 'Sync Live Market'}
          </button>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition"
          >
            <Plus size={14} /> Add IPO
          </button>
        </div>
      </div>

      {/* Today Alert */}
      {s && (s.today.closingToday > 0 || s.today.awaitingAllotment > 0) && (
        <div className="glass flex flex-wrap gap-x-6 gap-y-1 p-4 text-sm">
          <span className="card-label">TODAY</span>
          <span className="text-slate-300">{s.today.tracked} Applied IPO{s.today.tracked === 1 ? '' : 's'}</span>
          {s.today.closingToday > 0 && <span className="text-amber-300">{s.today.closingToday} closing today</span>}
          {s.today.awaitingAllotment > 0 && <span className="text-sky-300">{s.today.awaitingAllotment} awaiting allotment</span>}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading || !s ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            <SummaryCard label="ACTIVE APPLICATIONS" value={String(s.active)} sub="IPOs you marked as applied" />
            <SummaryCard label="CAPITAL APPLIED" value={inr(s.capital)} sub={`Across ${s.active} application${s.active === 1 ? '' : 's'}`} />
            <SummaryCard label="EST. LISTING PROFIT" value={money(s.estProfit)} sub="Based on current GMP" accent={s.estProfit >= 0 ? 'green' : 'red'} />
            <SummaryCard label="MARKET AVERAGE GMP" value={s.avgGmp != null ? pct(s.avgGmp) : '---'} sub={`Across all live IPOs`} />
          </>
        )}
      </div>

      {/* SECTION 1: MY APPLIED IPOS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold tracking-widest text-slate-200">MY APPLIED IPOs</h2>
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-300">
              {appliedRows.length}
            </span>
          </div>
          {appliedRows.length > 0 && (
            <Link to="/ipos" className="text-xs text-blue-400 hover:text-blue-300">
              Manage in My IPOs →
            </Link>
          )}
        </div>

        {appliedRows.length === 0 && !loading ? (
          <EmptyState onAdd={onAdd} />
        ) : (
          <>
            <div className="hidden md:block">
              <IpoTable ipos={appliedRows} flashes={flashes} />
            </div>
            <div className="grid gap-3 md:hidden">
              {appliedRows.map((r) => (
                <MobileIpoCard key={r.id} ipo={r} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* SECTION 2: LIVE AVAILABLE & UPCOMING IPOS */}
      <div className="space-y-3 pt-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-widest text-emerald-400">AVAILABLE &amp; UPCOMING IPOS</h2>
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Market Scrape
              </span>
            </div>
            <p className="text-xs text-slate-400">All open and upcoming Mainboard issues. Click &quot;+ Mark Applied&quot; to track in your portfolio.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="inline-flex rounded-lg bg-white/5 p-0.5 overflow-x-auto max-w-full">
              {(['All', 'Open', 'Upcoming', 'Closed'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMarket(m)}
                  className={`rounded-md px-2.5 py-1 font-medium whitespace-nowrap transition ${
                    filterMarket === m ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="inline-flex items-center rounded-lg bg-blue-500/20 px-2.5 py-1 font-semibold text-blue-300">
              Mainboard Only
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="glass hidden md:block overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead>
              <tr className="card-label border-b border-white/5 bg-white/[0.02]">
                <th className="px-4 py-3">IPO NAME &amp; CATEGORY</th>
                <th className="px-3 py-3">STATUS</th>
                <th className="px-3 py-3">PRICE BAND</th>
                <th className="px-3 py-3">LOT SIZE</th>
                <th className="px-3 py-3">LIVE GMP</th>
                <th className="px-3 py-3">EST. LISTING</th>
                <th className="px-3 py-3">EST. PROFIT / LOT</th>
                <th className="px-3 py-3">DATES</th>
                <th className="px-4 py-3 text-right">PORTFOLIO</th>
              </tr>
            </thead>
            <tbody>
              {availableRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-sm text-slate-400">
                    No IPOs match the selected filter. Try switching between Open / Upcoming.
                  </td>
                </tr>
              ) : (
                availableRows.map((ipo) => {
                  const isApplied = ipo.isApplied || (ipo.status !== 'Available' && (ipo.lotsApplied ?? 0) > 0);
                  const gmpPos = (ipo.currentGmp ?? 0) >= 0;
                  const currentMarketStatus = determineMarketStatus(null, ipo.notes, ipo.marketStatus);
                  const estimatedLotProfit = ipo.currentGmp != null ? ipo.currentGmp * (ipo.lotSize || 15) : null;
                  return (
                    <tr
                      key={ipo.id}
                      className="border-t border-white/5 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <Link to={`/ipo/${ipo.id}`} className="font-semibold text-white hover:text-blue-400 flex items-center gap-2">
                          {ipo.name}
                          <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-blue-400/20 text-blue-300">
                            Mainboard
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            currentMarketStatus === 'Open'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : currentMarketStatus === 'Closed'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-700/50 text-slate-300'
                          }`}
                        >
                          {currentMarketStatus === 'Open' ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ) : (
                            <Clock size={11} />
                          )}
                          {currentMarketStatus}
                        </span>
                      </td>
                      <td className="num px-3 py-3">{inr(ipo.issuePrice)}</td>
                      <td className="num px-3 py-3 text-slate-300">{ipo.lotSize || 15} sh</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`num flex items-center gap-1 font-bold ${gmpPos ? 'text-emerald-400' : 'text-red-400'}`}>
                            {ipo.currentGmp != null ? money(ipo.currentGmp) : '₹0'}
                            {ipo.gmpPct != null && (
                              <span className="text-[11px] font-normal text-slate-400">({pct(ipo.gmpPct)})</span>
                            )}
                          </span>

                          {/* Green Up Arrow if increased, Red Down Arrow if reduced */}
                          {ipo.gmpTrend === 'up' || (ipo.prevGmp != null && (ipo.currentGmp ?? 0) > ipo.prevGmp) ? (
                            <span
                              className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse"
                              title={`GMP increased by ₹${((ipo.currentGmp ?? 0) - (ipo.prevGmp ?? 0)).toFixed(1)} from previous ₹${ipo.prevGmp}`}
                            >
                              <ArrowUp size={11} className="stroke-[3]" />
                              {ipo.prevGmp != null && <span>+{money((ipo.currentGmp ?? 0) - ipo.prevGmp)}</span>}
                            </span>
                          ) : ipo.gmpTrend === 'down' || (ipo.prevGmp != null && (ipo.currentGmp ?? 0) < ipo.prevGmp) ? (
                            <span
                              className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                              title={`GMP reduced by ₹${((ipo.prevGmp ?? 0) - (ipo.currentGmp ?? 0)).toFixed(1)} from previous ₹${ipo.prevGmp}`}
                            >
                              <ArrowDown size={11} className="stroke-[3]" />
                              {ipo.prevGmp != null && <span>-{money(ipo.prevGmp - (ipo.currentGmp ?? 0))}</span>}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="num px-3 py-3 font-semibold text-slate-200">
                        {ipo.estListing != null ? inr(ipo.estListing) : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`num font-bold px-2 py-0.5 rounded ${
                            (estimatedLotProfit ?? 0) > 0
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : (estimatedLotProfit ?? 0) < 0
                              ? 'bg-red-500/15 text-red-300'
                              : 'text-slate-400'
                          }`}
                          title={`${ipo.lotSize || 15} shares × ₹${ipo.currentGmp ?? 0} GMP`}
                        >
                          {estimatedLotProfit != null ? money(estimatedLotProfit) : '₹---'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-400">
                        {ipo.notes ? ipo.notes.replace(/^Bidding:\s*/i, '') : 'TBA'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isApplied ? (
                          <div className="inline-flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 size={12} /> Applied ({ipo.lotsApplied}L)
                            </span>
                            <button
                              onClick={(e) => handleUnapply(ipo, e)}
                              className="text-[10px] text-slate-400 hover:text-red-400 underline transition"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedIpoToApply(ipo)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500 hover:text-white transition"
                          >
                            <BookmarkPlus size={13} /> Mark Applied
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
