import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Percent, 
  Layers, 
  Calculator, 
  TrendingUp,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

import { useIpos } from '../hooks/useIpos.js';
import { inr, pct } from '../utils/format.js';
import { 
  calculateRetailAllotmentProbability, 
  calculateMultiAccountProbability, 
  calculateMaxRetailLots,
  isClosedExpired,
  determineMarketStatus
} from '../utils/calculations.js';
import type { Ipo } from '../types/ipo.js';

export function RetailAllotmentPage() {
  const { data: ipos, isLoading } = useIpos();

  // Interactive Simulator State
  const [selectedIpoId, setSelectedIpoId] = useState<string>('custom');
  const [simSubMultiple, setSimSubMultiple] = useState<number>(8.5);
  const [simPrice, setSimPrice] = useState<number>(500);
  const [simLotSize, setSimLotSize] = useState<number>(30);
  const [simAccounts, setSimAccounts] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'open' | 'high_demand'>('all');

  // Filter IPOs
  const activeIpos = useMemo(() => {
    if (!ipos) return [];
    return ipos
      .filter((i) => !isClosedExpired(i.closeDate, i.notes, 5))
      .filter((i) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return i.name.toLowerCase().includes(q) || (i.companyName || '').toLowerCase().includes(q);
      })
      .filter((i) => {
        const mStatus = determineMarketStatus(null, i.notes, i.marketStatus);
        if (filterMode === 'open') return mStatus === 'Open';
        if (filterMode === 'high_demand') return (i.subscription?.retail ?? 0) >= 5;
        return true;
      });
  }, [ipos, searchQuery, filterMode]);

  // Handle IPO selection in Simulator
  const handleSelectIpo = (ipo: Ipo | null) => {
    if (!ipo) {
      setSelectedIpoId('custom');
      return;
    }
    setSelectedIpoId(ipo.id);
    if (ipo.subscription?.retail) {
      setSimSubMultiple(ipo.subscription.retail);
    } else {
      setSimSubMultiple(1.5);
    }
    setSimPrice(ipo.issuePrice || 100);
    setSimLotSize(ipo.lotSize || 15);
  };

  // Simulator calculations
  const simOdds = useMemo(() => {
    return calculateRetailAllotmentProbability(simSubMultiple);
  }, [simSubMultiple]);

  const simMultiChance = useMemo(() => {
    return calculateMultiAccountProbability(simOdds.probPct, simAccounts);
  }, [simOdds.probPct, simAccounts]);

  const simLotLimits = useMemo(() => {
    return calculateMaxRetailLots(simPrice, simLotSize);
  }, [simPrice, simLotSize]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  Retail Allotment Desk
                </h1>
                <span className="rounded bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                  SEBI LOTTERY ODDS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact probability of securing 1 lot, lottery ratios, and multi-PAN family allotment sizing
              </p>
            </div>
          </div>
        </div>

        {/* Quick SEBI Rule Pill */}
        <div className="flex items-center gap-2 rounded-lg bg-[#0e1628] border border-blue-500/25 px-3 py-2 text-xs text-slate-300">
          <Info size={15} className="text-cyan-400 shrink-0" />
          <span className="text-[11px] leading-tight">
            <strong>SEBI Rule:</strong> Oversubscribed retail IPOs allocate <strong>maximum 1 lot</strong> per applicant via computerized lottery.
          </span>
        </div>
      </div>

      {/* Top Interactive Simulator */}
      <div className="terminal-panel p-5 border border-cyan-500/30 bg-gradient-to-b from-[#0c1527]/90 via-[#0a101f]/90 to-[#070b16] shadow-xl shadow-cyan-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/[0.08] pb-3 mb-5">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Retail Probability & Lot Sizing Simulator
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Preset:</span>
            <select
              value={selectedIpoId}
              onChange={(e) => {
                const id = e.target.value;
                if (id === 'custom') {
                  setSelectedIpoId('custom');
                } else {
                  const found = ipos?.find((i) => i.id === id);
                  if (found) handleSelectIpo(found);
                }
              }}
              className="bg-[#121c32] border border-white/10 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="custom">⚙️ Custom Parameters</option>
              {ipos
                ?.filter((i) => !isClosedExpired(i.closeDate, i.notes, 5))
                .map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (Sub: {i.subscription?.retail ? `${i.subscription.retail}x` : 'N/A'})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Controls & Inputs */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Retail Category Subscription (Times)</span>
                <span className="num font-black text-cyan-400 text-sm">
                  {simSubMultiple.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="100"
                step="0.1"
                value={simSubMultiple}
                onChange={(e) => setSimSubMultiple(parseFloat(e.target.value) || 1)}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.5x (Guaranteed)</span>
                <span>10x (1 in 10)</span>
                <span>50x (1 in 50)</span>
                <span>100x (Extreme)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Issue Price (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  value={simPrice}
                  onChange={(e) => setSimPrice(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full bg-[#101726] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white num"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Lot Size (Shares)
                </label>
                <input
                  type="number"
                  min="1"
                  value={simLotSize}
                  onChange={(e) => setSimLotSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-[#101726] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white num"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-300">
                  Family PAN Accounts Applied ({simAccounts} {simAccounts === 1 ? 'Account' : 'Accounts'})
                </span>
                <span className="num font-bold text-emerald-400">{simAccounts} PANs</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 8, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSimAccounts(n)}
                    className={`flex-1 py-1 text-xs rounded border transition ${
                      simAccounts === n
                        ? 'bg-blue-600/30 border-cyan-400/60 text-cyan-300 font-bold'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-xl bg-[#090f1d] border border-white/[0.08] p-4.5">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Calculated Retail Allotment Chance
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    simOdds.isLottery
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {simOdds.isLottery ? 'Lottery Draw' : '100% Firm Allotment'}
                </span>
              </div>

              {/* Big Highlight Ratios */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-3 text-center">
                  <div className="text-[11px] text-slate-400">Single PAN Odds</div>
                  <div className="num text-2xl sm:text-3xl font-black text-cyan-300 mt-0.5">
                    1 in {simOdds.oneInX}
                  </div>
                  <div className="text-[10px] text-cyan-400/80 mt-1 font-semibold">
                    {simOdds.probPct}% probability
                  </div>
                </div>

                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                  <div className="text-[11px] text-slate-400">
                    With {simAccounts} Family PANs
                  </div>
                  <div className="num text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">
                    {simMultiChance}%
                  </div>
                  <div className="text-[10px] text-emerald-300/80 mt-1 font-semibold">
                    Chance of ≥ 1 lot
                  </div>
                </div>
              </div>

              {/* Real World Pool Benchmark (As user specifically requested: 1000 ppl in retail) */}
              <div className="rounded-lg bg-blue-950/40 border border-blue-500/25 p-3">
                <div className="flex items-start gap-2">
                  <Users size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-white">1,000 Retail Applicants Benchmark:</span>
                    <p className="mt-0.5 text-slate-400 text-[11px] leading-relaxed">
                      In a random pool of <strong>1,000 retail applicants</strong>, approximately{' '}
                      <strong className="text-cyan-300">{simOdds.perThousand} applicants</strong> will be allotted 1 lot (
                      {simLotSize} shares). The remaining {1000 - simOdds.perThousand} applicants will receive zero lots.
                    </p>
                  </div>
                </div>
              </div>

              {/* Retail Category Sizing Constraints */}
              <div className="grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3 text-[11px]">
                <div>
                  <div className="text-slate-400">1 Lot Investment</div>
                  <div className="num font-bold text-slate-200 mt-0.5">
                    {inr(simPrice * simLotSize)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Max Retail Lots</div>
                  <div className="num font-bold text-slate-200 mt-0.5">
                    {simLotLimits.maxLots} lots ({simLotLimits.maxShares} sh)
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Max Bid Amount</div>
                  <div className="num font-bold text-slate-200 mt-0.5">
                    {inr(simLotLimits.maxInvestment)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Market IPOs Retail Allotment Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <span>Live IPOs Allotment Odds Matrix</span>
              <span className="text-xs rounded-full bg-slate-800 px-2.5 py-0.5 text-slate-300 font-mono">
                {activeIpos.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Computed directly from live exchange bidding subscription data
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter buttons */}
            <div className="flex rounded-lg border border-white/10 bg-[#0d1424] p-0.5 text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterMode === 'all'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Active
              </button>
              <button
                onClick={() => setFilterMode('open')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterMode === 'open'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Open Only
              </button>
              <button
                onClick={() => setFilterMode('high_demand')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterMode === 'high_demand'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                High Demand (&gt;5x)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search IPO name..."
                className="bg-[#0f172a] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 w-40 sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* IPO Cards Grid */}
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="terminal-panel p-5 h-56 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-2/3 mb-3" />
                <div className="h-3 bg-white/5 rounded w-1/2 mb-6" />
                <div className="h-10 bg-white/5 rounded w-full mb-3" />
                <div className="h-4 bg-white/5 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : activeIpos.length === 0 ? (
          <div className="terminal-panel p-10 text-center text-xs text-slate-400">
            No IPOs matching your filter criteria right now. Check back during active trading hours.
          </div>
        ) : (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {activeIpos.map((ipo) => {
              const retailSub = ipo.subscription?.retail;
              const odds = calculateRetailAllotmentProbability(retailSub);
              const mStatus = determineMarketStatus(null, ipo.notes, ipo.marketStatus);
              const lotCost = (ipo.issuePrice || 0) * (ipo.lotSize || 1);
              const limits = calculateMaxRetailLots(ipo.issuePrice, ipo.lotSize);
              const chance2Pan = calculateMultiAccountProbability(odds.probPct, 2);
              const chance3Pan = calculateMultiAccountProbability(odds.probPct, 3);
              const chance5Pan = calculateMultiAccountProbability(odds.probPct, 5);

              return (
                <div
                  key={ipo.id}
                  className="terminal-panel p-4.5 border border-white/[0.08] hover:border-cyan-500/40 transition group flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={`/ipo/${ipo.id}`}
                          className="font-bold text-white text-sm group-hover:text-cyan-400 transition block truncate"
                        >
                          {ipo.name}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Issue {inr(ipo.issuePrice)} • Lot: {ipo.lotSize || 15} sh ({inr(lotCost)})
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          mStatus === 'Open'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : mStatus === 'Closed'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-700/50 text-slate-300 border border-white/10'
                        }`}
                      >
                        {mStatus}
                      </span>
                    </div>

                    {/* Subscription & Ratio Highlight */}
                    <div className="mt-3.5 rounded-lg bg-[#0a101d] border border-white/[0.06] p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">Retail Demand</span>
                        <span className="num font-black text-sm text-cyan-400">
                          {retailSub != null ? `${retailSub}x` : 'Bidding Awaited'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between border-t border-white/[0.05] pt-2">
                        <span className="text-[11px] text-slate-400">Retail Odds:</span>
                        <div className="text-right">
                          <span className="num font-bold text-white text-sm">
                            1 in {odds.oneInX}
                          </span>
                          <span className="text-[11px] text-cyan-400 ml-1.5 font-semibold">
                            ({odds.probPct}%)
                          </span>
                        </div>
                      </div>

                      {/* 1000 Applicant Real-world breakdown */}
                      <div className="text-[10px] text-slate-400 bg-white/[0.02] rounded px-2 py-1.5 border border-white/[0.04]">
                        🎯 <strong>Per 1,000 applicants:</strong> ~
                        <span className="text-cyan-300 font-bold">{odds.perThousand}</span> get 1 lot (
                        {1000 - odds.perThousand} get 0)
                      </div>
                    </div>

                    {/* Multi-PAN Chances Grid */}
                    <div className="mt-3">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        Chances with Multiple Family PANs
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                        <div className="bg-white/[0.03] border border-white/[0.05] rounded py-1 px-1">
                          <div className="text-slate-400 text-[9px]">2 PANs</div>
                          <div className="num font-bold text-slate-200 mt-0.5">{chance2Pan}%</div>
                        </div>
                        <div className="bg-white/[0.03] border border-white/[0.05] rounded py-1 px-1">
                          <div className="text-slate-400 text-[9px]">3 PANs</div>
                          <div className="num font-bold text-emerald-300 mt-0.5">{chance3Pan}%</div>
                        </div>
                        <div className="bg-white/[0.03] border border-white/[0.05] rounded py-1 px-1">
                          <div className="text-slate-400 text-[9px]">5 PANs</div>
                          <div className="num font-bold text-cyan-300 mt-0.5">{chance5Pan}%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-4 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">
                      Max Retail: {limits.maxLots} lots ({inr(limits.maxInvestment)})
                    </span>
                    <button
                      onClick={() => handleSelectIpo(ipo)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold text-[11px] group/btn"
                    >
                      <span>Simulate</span>
                      <ChevronRight size={13} className="group-hover/btn:translate-x-0.5 transition" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Educational Guide: SEBI Retail Allotment Mechanics */}
      <div className="terminal-panel p-5 border border-white/[0.08] bg-[#0a101f] space-y-4">
        <div className="flex items-center gap-2 border-b border-white/[0.07] pb-2.5">
          <ShieldCheck size={18} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Important SEBI Retail Allotment Rules Every Investor Must Know
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3 text-xs leading-relaxed">
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3.5 space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <span>1. Max 1 Lot in Retail Oversubscription</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              If the retail category is oversubscribed (&gt;1.0x), applying for <strong>maximum lots (e.g. 13 lots) does NOT increase your chances</strong> of allotment over applying for 1 single lot. Every applicant enters the computerized lottery draw for 1 lot only.
            </p>
          </div>

          <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3.5 space-y-1.5">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>2. Family PAN Strategy (Multi-Account)</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              To legitimately multiply your chances, apply for <strong>1 lot each across different unique PAN cards</strong> (e.g., family members: spouse, parents, siblings). Each valid PAN gets an independent entry ticket into SEBI’s computerized draw.
            </p>
          </div>

          <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3.5 space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>3. ₹2,00,000 Retail Limit</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Bids under or equal to ₹2,00,000 belong to the Retail Individual Investor (RII) quota. Any bid exceeding ₹2,00,000 automatically gets classified into Non-Institutional / HNI (sHNI: ₹2L to ₹10L), where allotment follows a different proportional lottery draw.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
