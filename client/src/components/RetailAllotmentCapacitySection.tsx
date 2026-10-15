import { useState, useMemo } from 'react';
import { Users, Info, HelpCircle, ChevronDown, CheckCircle2, AlertTriangle, Layers, Percent, Sparkles } from 'lucide-react';
import { formatIndianNumber, formatLakhCrore, pct } from '../utils/format.js';
import { calculateRetailAllotmentCapacity, parseRetailReservedShares, parseIpoNotesMetadata } from '../utils/calculations.js';
import type { Ipo } from '../types/ipo.js';

interface RetailAllotmentCapacitySectionProps {
  ipo: Ipo;
}

export function RetailAllotmentCapacitySection({ ipo }: RetailAllotmentCapacitySectionProps) {
  // Check if retail reserved shares are explicitly provided on the IPO object, or parsed from notes/DRHP, or benchmarked
  const benchmarkShares = useMemo(() => {
    // 1. Explicit field on IPO
    if (ipo.retailReservedShares && ipo.retailReservedShares > 0) {
      return { shares: ipo.retailReservedShares, source: 'Prospectus (RHP)' };
    }

    // 2. Parsed exact metadata from notes (Issue Size, Retail Quota %, Retail Shares)
    const notesMeta = parseIpoNotesMetadata(ipo.notes);
    if (notesMeta.retailShares && notesMeta.retailShares > 0) {
      return { shares: notesMeta.retailShares, source: 'Prospectus Reservation' };
    }

    const price = ipo.issuePrice > 0 ? ipo.issuePrice : 100;

    if (notesMeta.issueSizeCr && notesMeta.issueSizeCr > 0) {
      const qPct = notesMeta.retailQuotaPct || 35;
      const retailValue = notesMeta.issueSizeCr * 10000000 * (qPct / 100);
      const computedShares = Math.round(retailValue / price);
      return { 
        shares: computedShares, 
        source: `₹${notesMeta.issueSizeCr} Cr Issue (${qPct}% Quota)` 
      };
    }

    // 3. Known specific issues
    if (/tonbo/i.test(ipo.name)) {
      return { shares: 4256016, source: 'Tonbo Prospectus (35% Quota)' };
    }

    // 4. Default: Derive dynamically based on issue price and lot size
    // Under SEBI guidelines, a typical retail lot ticket size is ~₹14,000 - ₹15,000.
    // If issue size is not known, estimate capacity using the IPO's specific lot size & price
    const lotCost = price * (ipo.lotSize || 15);
    // Dynamic estimate: average mainboard retail pool ~1.2 to 2.5 lakh lots
    const estLots = Math.max(50000, Math.round((200 * 10000000) / (lotCost || 14500)));
    const estShares = estLots * (ipo.lotSize || 15);

    return { shares: estShares, source: 'SEBI 35% Quota Est.' };
  }, [ipo.retailReservedShares, ipo.notes, ipo.name, ipo.issuePrice, ipo.lotSize]);

  const [customSharesInput, setCustomSharesInput] = useState<string>('');
  const [selectedMultiple, setSelectedMultiple] = useState<number>(1);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // Active retail reserved shares to use in calculation
  const activeRetailShares = useMemo(() => {
    if (customSharesInput.trim() !== '') {
      const parsed = parseFloat(customSharesInput.replace(/,/g, ''));
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    return benchmarkShares.shares;
  }, [customSharesInput, benchmarkShares.shares]);

  const retailSub = ipo.subscription?.retail ?? null;

  // Compute dynamic capacity results
  const capacityData = useMemo(() => {
    return calculateRetailAllotmentCapacity(
      activeRetailShares,
      ipo.lotSize || 1,
      retailSub
    );
  }, [activeRetailShares, ipo.lotSize, retailSub]);

  const { retailLotCapacity, currentMultiple, currentEstimatedApplicants, currentEstimatedChance, tiers } = capacityData;

  // Selected tier data for interactive selector
  const activeTier = useMemo(() => {
    const estApplicants = retailLotCapacity > 0 ? Math.round(retailLotCapacity * selectedMultiple) : 0;
    const chance = selectedMultiple <= 1 ? 100 : Math.round((1 / selectedMultiple) * 100 * 100) / 100;
    return {
      multiple: selectedMultiple,
      applicants: estApplicants,
      chance,
    };
  }, [retailLotCapacity, selectedMultiple]);

  // Color helper based on probability
  const getProbabilityBadge = (p: number) => {
    if (p >= 70) {
      return {
        bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        bar: 'from-emerald-500 to-teal-400',
        label: 'High Allotment Chance',
      };
    }
    if (p >= 25) {
      return {
        bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
        bar: 'from-amber-500 to-yellow-400',
        label: 'Moderate Lottery Odds',
      };
    }
    return {
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      bar: 'from-rose-500 to-red-400',
      label: 'Intense Competition',
    };
  };

  const currentBadge = getProbabilityBadge(currentEstimatedChance ?? 100);

  return (
    <div className="glass border border-white/[0.08] p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Users size={16} />
            </span>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
              Retail Allotment Capacity
            </h2>
            <span className="rounded bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-400">
              RII ONLY
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Calculates how many retail investors can potentially receive 1 minimum lot based on the IPO's actual retail reservation and lot size.
          </p>
        </div>

        {/* DRHP / Reservation toggle or indicator */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 hover:text-white transition"
        >
          <Layers size={13} className="text-cyan-400" />
          <span>{benchmarkShares.source}</span>
          <ChevronDown size={13} className={`transition-transform ${showConfig ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Quota Input / Inspection Panel (Shown or Collapsible) */}
      {showConfig && (
        <div className="rounded-xl border border-cyan-500/20 bg-[#090e1c] p-4 text-xs space-y-3">
          <div className="flex items-center justify-between text-cyan-300 font-semibold">
            <span>RHP / DRHP Retail Reservation Setup</span>
            <span className="text-[11px] text-slate-400">SEBI RII Quota</span>
          </div>

          {/* Quick preset selector */}
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
            <span className="text-[11px] text-slate-400">Quick Presets:</span>
            <button
              type="button"
              onClick={() => {
                const price = ipo.issuePrice > 0 ? ipo.issuePrice : 100;
                const estRetailVal = 650 * 10000000 * 0.35; // 35% of ₹650 Cr
                const sh = Math.round(estRetailVal / price);
                setCustomSharesInput(String(sh));
              }}
              className="rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[11px] text-blue-300 hover:bg-blue-500/25 transition"
            >
              Standard Mainboard (35% ~₹227 Cr)
            </button>
            <button
              type="button"
              onClick={() => {
                const price = ipo.issuePrice > 0 ? ipo.issuePrice : 100;
                const estRetailVal = 1000 * 10000000 * 0.10; // 10% of ₹1000 Cr
                const sh = Math.round(estRetailVal / price);
                setCustomSharesInput(String(sh));
              }}
              className="rounded bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[11px] text-purple-300 hover:bg-purple-500/25 transition"
            >
              Rule 6(2) Mainboard (10% ~₹100 Cr)
            </button>
            {customSharesInput && (
              <button
                type="button"
                onClick={() => setCustomSharesInput('')}
                className="rounded bg-slate-800 border border-white/10 px-2 py-0.5 text-[11px] text-slate-300 hover:text-white"
              >
                Reset to Auto Benchmark
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="text-slate-400 block mb-1">Retail Reserved Shares</label>
              <input
                type="text"
                placeholder={String(benchmarkShares.shares)}
                value={customSharesInput}
                onChange={(e) => setCustomSharesInput(e.target.value)}
                className="w-full text-xs font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {activeRetailShares ? `${formatLakhCrore(activeRetailShares)} shares (${activeRetailShares ? formatIndianNumber(activeRetailShares) : ''})` : 'Enter exact shares'}
              </span>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Retail Lot Size</label>
              <div className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 font-mono text-slate-200">
                {ipo.lotSize || 1} shares
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">From IPO master specifications</span>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Retail Allotment Formula</label>
              <div className="rounded-lg bg-black/40 border border-white/10 p-2 font-mono text-[11px] text-cyan-300">
                FLOOR(Retail Shares / Lot Size)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CORE DISPLAY HERO CARD */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Main 1-Lot Capacity Hero */}
        <div className="sm:col-span-2 rounded-xl bg-gradient-to-br from-[#0c1322] to-[#11192e] border border-cyan-500/25 p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Retail 1-Lot Capacity
              </span>
              <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
                MAX GUARANTEED WINNERS
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight num">
                {retailLotCapacity > 0 ? formatLakhCrore(retailLotCapacity) : '---'}
              </span>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                Lots
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-300">
              Approximately <strong className="text-cyan-300">{formatIndianNumber(retailLotCapacity)}</strong> retail applicants can potentially receive 1 minimum lot.
            </p>
          </div>

          {/* Basis details */}
          <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <div>
              Retail Reserved: <strong className="text-slate-200 num">{formatLakhCrore(activeRetailShares)}</strong> ({formatIndianNumber(activeRetailShares)} sh)
            </div>
            <div>
              Lot Size: <strong className="text-slate-200 num">{ipo.lotSize} shares</strong>
            </div>
            <div>
              Quota Value: <strong className="text-slate-200 num">{formatLakhCrore(activeRetailShares * (ipo.issuePrice || 1))}</strong>
            </div>
          </div>
        </div>

        {/* Live Current Retail Subscription Status */}
        <div className="rounded-xl bg-[#090d18] border border-white/[0.08] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="card-label">CURRENT RETAIL SUBSCRIPTION</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="mt-2 text-3xl font-black text-white num">
              {retailSub != null ? `${retailSub}×` : '---'}
            </div>

            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Estimated applications:</span>
                <span className="text-slate-200 font-bold num">
                  {currentEstimatedApplicants ? formatLakhCrore(currentEstimatedApplicants) : (retailSub ? `${retailSub}× Capacity` : '---')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated chance:</span>
                <span className={`font-bold num ${currentEstimatedChance != null && currentEstimatedChance >= 50 ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {currentEstimatedChance != null ? pct(currentEstimatedChance) : '---'}
                </span>
              </div>
            </div>
          </div>

          {/* Probability Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Lottery Odds</span>
              <span className="font-semibold text-slate-200">{currentEstimatedChance != null ? `${currentEstimatedChance}%` : '---'}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${currentBadge.bar} transition-all duration-500`}
                style={{ width: `${Math.min(100, Math.max(2, currentEstimatedChance ?? 0))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Explanation Flow Card */}
      <div className="rounded-xl border border-white/[0.06] bg-black/25 p-4.5 text-xs text-slate-300 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Sparkles size={15} className="text-cyan-400" />
          <span>Understanding SEBI Retail Quota Mechanics</span>
        </div>
        
        <p className="leading-relaxed text-slate-400">
          • <strong>Fixed Quota:</strong> Retail quota contains approximately <strong className="text-white">{retailLotCapacity > 0 ? formatLakhCrore(retailLotCapacity) : 'X'} minimum lots</strong>.
          <br />
          • <strong>Oversubscription Dilution:</strong> At <strong>2×</strong> subscription, approximately <strong className="text-white">{retailLotCapacity > 0 ? formatLakhCrore(retailLotCapacity * 2) : '2X'} applications</strong> compete for the same <strong className="text-cyan-300">{retailLotCapacity > 0 ? formatLakhCrore(retailLotCapacity) : 'X'} available minimum lots</strong>.
        </p>

        {/* 3 Step Visual Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/[0.06]">
          <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1. AVAILABLE RETAIL LOTS</div>
            <div className="text-lg font-bold text-cyan-400 mt-1 num">
              {retailLotCapacity > 0 ? formatIndianNumber(retailLotCapacity) : 'X Lots'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Fixed capacity pool</div>
          </div>

          <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">2. RETAIL APPLICATIONS</div>
            <div className="text-lg font-bold text-amber-300 mt-1 num">
              {retailLotCapacity > 0 ? `${formatIndianNumber(activeTier.applicants)}` : 'X × Subscription'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">At {activeTier.multiple}× subscription</div>
          </div>

          <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">3. ESTIMATED CHANCE</div>
            <div className="text-lg font-bold text-emerald-400 mt-1 num">
              {pct(activeTier.chance)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Available Lots ÷ Applications</div>
          </div>
        </div>
      </div>

      {/* SUBSCRIPTION IMPACT TABLE & SELECTOR */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Subscription Impact Matrix
            </h3>
            <p className="text-[11px] text-slate-400">
              Theoretical probability of securing 1 minimum lot as retail bidding demand multiplies
            </p>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Simulate:</span>
            {[1, 2, 3, 5, 10, 20].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMultiple(m)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition num ${
                  selectedMultiple === m
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                {m}×
              </button>
            ))}
          </div>
        </div>

        {/* The Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Subscription Multiple</th>
                <th className="py-3 px-4">Approx. Retail Applications</th>
                <th className="py-3 px-4">1-Lot Allotment Capacity</th>
                <th className="py-3 px-4">Probability Range</th>
                <th className="py-3 px-4 text-right">Estimated Chance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {tiers.map((t) => {
                const isSelected = selectedMultiple === t.multiple;
                const isCurrent = retailSub != null && Math.round(retailSub) === t.multiple;
                const badge = getProbabilityBadge(t.chancePct);

                return (
                  <tr
                    key={t.multiple}
                    onClick={() => setSelectedMultiple(t.multiple)}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-cyan-500/10 font-semibold'
                        : isCurrent
                        ? 'bg-blue-500/5'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white num text-sm">{t.multiple}×</span>
                        {isCurrent && (
                          <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                            CURRENT
                          </span>
                        )}
                        {isSelected && !isCurrent && (
                          <span className="rounded bg-cyan-500/20 border border-cyan-500/30 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">
                            SELECTED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 num font-medium">
                      {retailLotCapacity > 0 ? (
                        <>
                          {formatLakhCrore(t.estimatedApplicants)}{' '}
                          <span className="text-[11px] text-slate-500">
                            ({formatIndianNumber(t.estimatedApplicants)})
                          </span>
                        </>
                      ) : (
                        `${t.multiple}× Capacity`
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 num font-medium">
                      {retailLotCapacity > 0 ? (
                        <>
                          {formatLakhCrore(t.availableLots)}{' '}
                          <span className="text-[11px] text-slate-500">
                            ({formatIndianNumber(t.availableLots)})
                          </span>
                        </>
                      ) : (
                        'Fixed Capacity'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-32 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${badge.bar}`}
                          style={{ width: `${Math.min(100, Math.max(3, t.chancePct))}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold num border ${badge.bg}`}>
                        {pct(t.chancePct)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* REAL-WORLD ALLOTMENT DISCLAIMER */}
      <div className="rounded-xl border border-white/[0.08] bg-[#080d19] p-4 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 text-amber-300/90 font-semibold text-[11px]">
          <AlertTriangle size={14} className="shrink-0" />
          <span>REAL-WORLD ALLOTMENT DISCLAIMER</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Clearly labeled as <strong>Estimated theoretical probability</strong>. Actual IPO allotment is determined by the registrar's final basis of allotment and lottery process. This calculation is an estimate assuming valid applications and approximately one minimum lot per applicant.
        </p>
      </div>
    </div>
  );
}
