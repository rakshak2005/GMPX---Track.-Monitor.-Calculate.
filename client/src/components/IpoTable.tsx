import { Link } from 'react-router-dom';
import { TrendingDown, TrendingUp, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { Ipo } from '../types/ipo.js';
import { inr, money, pct, timeAgo } from '../utils/format.js';
import { StatusBadge } from './StatusBadge.js';
import { Tooltip } from './Tooltip.js';
import { Countdown } from './Countdown.js';
import { Sparkline } from './Sparkline.js';

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function IpoRow({ ipo, flash }: { ipo: Ipo; flash?: 'up' | 'down' | null }) {
  const g = ipo.currentGmp;
  const pos = (g ?? 0) >= 0;
  const trend =
    ipo.gmpTrend === 'up' || (ipo.prevGmp != null && (g ?? 0) > ipo.prevGmp)
      ? 'up'
      : ipo.gmpTrend === 'down' || (ipo.prevGmp != null && (g ?? 0) < ipo.prevGmp)
      ? 'down'
      : 'flat';

  return (
    <tr
      className={`border-t border-white/[0.06] transition hover:bg-white/[0.025] ${
        flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
      }`}
    >
      {/* Primary IPO Identity */}
      <td className="px-4 py-3">
        <Link to={`/ipo/${ipo.id}`} className="flex items-center gap-3 group">
          {ipo.logoUrl ? (
            <img src={ipo.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover border border-white/10" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-300">
              {initials(ipo.name)}
            </span>
          )}
          <div className="min-w-0">
            <span className="block font-semibold text-white group-hover:text-blue-400 transition truncate">
              {ipo.name}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              <StatusBadge status={ipo.status} />
              <span className="text-slate-600">•</span>
              <Countdown target={ipo.closeDate} prefix="closes in" />
            </div>
          </div>
        </Link>
      </td>

      {/* Price & Lots */}
      <td className="num px-3 py-3 text-slate-200 font-medium">{inr(ipo.issuePrice)}</td>
      <td className="num px-3 py-3 text-slate-400">{ipo.lotSize} sh</td>
      <td className="num px-3 py-3 font-semibold text-slate-200">{ipo.lotsApplied}</td>
      <td className="num px-3 py-3 font-semibold text-slate-200">{inr(ipo.investment ?? null)}</td>

      {/* Live GMP + Movement + Sparkline */}
      <td className="px-3 py-3">
        {g === null || g === undefined ? (
          <span className="text-xs text-slate-500">Unavailable</span>
        ) : (
          <Tooltip label="Grey Market Premium with recent trend direction">
            <div className="flex items-center gap-2">
              <div>
                <div className={`num font-bold flex items-center gap-1 ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
                  {money(g)}
                  {trend === 'up' ? (
                    <ArrowUpRight size={13} className="stroke-[2.5]" />
                  ) : trend === 'down' ? (
                    <ArrowDownRight size={13} className="stroke-[2.5]" />
                  ) : (
                    <Minus size={11} className="text-slate-500" />
                  )}
                </div>
                <div className="num text-[11px] text-slate-400">{pct(ipo.gmpPct)}</div>
              </div>
              <Sparkline trend={trend} width={44} height={16} />
            </div>
          </Tooltip>
        )}
      </td>

      {/* Estimated Listing */}
      <td className="num px-3 py-3 font-medium text-slate-200">
        {ipo.estListing != null ? inr(ipo.estListing) : '—'}
      </td>

      {/* Potential Listing Gain */}
      <td className={`num px-3 py-3 font-bold ${(ipo.estProfit ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        <Tooltip label="Potential listing gain based on current GMP and applied quantity.">
          <span>{ipo.estProfit != null ? money(ipo.estProfit) : '—'}</span>
        </Tooltip>
      </td>

      {/* Demand / Subscription */}
      <td className="px-3 py-3">
        <span className="num font-medium text-slate-300">
          {ipo.subscription?.total != null ? `${ipo.subscription.total}x` : '—'}
        </span>
      </td>

      {/* Updated Timestamp */}
      <td className="px-4 py-3 text-right text-[11px] text-slate-500 whitespace-nowrap">
        {timeAgo(ipo.lastGmpAt)}
      </td>
    </tr>
  );
}

export function IpoTable({ ipos, flashes }: { ipos: Ipo[]; flashes: Record<string, 'up' | 'down'> }) {
  return (
    <div className="terminal-panel overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-xs">
        <thead>
          <tr className="card-label border-b border-white/[0.07] bg-white/[0.015]">
            <th className="px-4 py-2.5">IPO ISSUE</th>
            <th className="px-3 py-2.5">PRICE</th>
            <th className="px-3 py-2.5">LOT SIZE</th>
            <th className="px-3 py-2.5">LOTS</th>
            <th className="px-3 py-2.5">CAPITAL BLOCKED</th>
            <th className="px-3 py-2.5">GMP MOVEMENT</th>
            <th className="px-3 py-2.5">EST. LISTING</th>
            <th className="px-3 py-2.5">POTENTIAL GAIN</th>
            <th className="px-3 py-2.5">SUBSCRIPTION</th>
            <th className="px-4 py-2.5 text-right">LAST PULSE</th>
          </tr>
        </thead>
        <tbody>
          {ipos.map((i) => (
            <IpoRow key={i.id} ipo={i} flash={flashes[i.id]} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MobileIpoCard({ ipo }: { ipo: Ipo }) {
  const g = ipo.currentGmp;
  const pos = (g ?? 0) >= 0;
  const trend =
    ipo.gmpTrend === 'up' || (ipo.prevGmp != null && (g ?? 0) > ipo.prevGmp)
      ? 'up'
      : ipo.gmpTrend === 'down' || (ipo.prevGmp != null && (g ?? 0) < ipo.prevGmp)
      ? 'down'
      : 'flat';

  return (
    <Link
      to={`/ipo/${ipo.id}`}
      className="terminal-panel block p-3.5 sm:p-4 transition active:scale-[0.99] hover:border-white/20"
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {ipo.logoUrl ? (
            <img src={ipo.logoUrl} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0 border border-white/10" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] font-bold text-blue-300">
              {initials(ipo.name)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-bold text-white text-sm sm:text-base leading-tight break-words">{ipo.name}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-1">
              <span>{ipo.lotsApplied} Lot{ipo.lotsApplied > 1 ? 's' : ''} ({ipo.lotsApplied * (ipo.lotSize || 15)} sh)</span>
              <span className="text-slate-600">•</span>
              <span className="num font-semibold text-slate-200">{inr(ipo.investment ?? null)}</span>
            </div>
          </div>
        </div>
        <StatusBadge status={ipo.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-[#090D17] border border-white/[0.06] p-2.5 sm:p-3 text-xs">
        <div className="min-w-0">
          <div className="card-label">GMP MOVEMENT</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`num font-extrabold text-sm sm:text-base ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
              {g != null ? money(g) : '—'}
            </span>
            <Sparkline trend={trend} width={38} height={14} className="shrink-0" />
          </div>
          {ipo.gmpPct != null && (
            <div className="text-[10px] text-slate-400 num mt-0.5">{pct(ipo.gmpPct)}</div>
          )}
        </div>
        <div className="min-w-0">
          <div className="card-label">POTENTIAL GAIN</div>
          <div className={`num font-extrabold text-sm sm:text-base mt-1 ${(ipo.estProfit ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {ipo.estProfit != null ? money(ipo.estProfit) : '—'}
          </div>
          <div className="text-[10px] text-slate-400 num mt-0.5">
            Est. {ipo.estListing != null ? inr(ipo.estListing) : '—'}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
        <span>Pulse {timeAgo(ipo.lastGmpAt)}</span>
        <span className="text-cyan-400 font-semibold flex items-center gap-0.5">Terminal Details →</span>
      </div>
    </Link>
  );
}

export function MobileAvailableIpoCard({
  ipo,
  onApply,
  onUnapply,
}: {
  ipo: Ipo;
  onApply: (ipo: Ipo) => void;
  onUnapply: (ipo: Ipo, e: React.MouseEvent) => void;
}) {
  const isApplied = ipo.isApplied || (ipo.status !== 'Available' && (ipo.lotsApplied ?? 0) > 0);
  const gmpPos = (ipo.currentGmp ?? 0) >= 0;
  const currentMarketStatus = ipo.marketStatus || 'Upcoming';
  const estimatedLotProfit = ipo.currentGmp != null ? ipo.currentGmp * (ipo.lotSize || 15) : null;
  const trend =
    ipo.gmpTrend === 'up' || (ipo.prevGmp != null && (ipo.currentGmp ?? 0) > ipo.prevGmp)
      ? 'up'
      : ipo.gmpTrend === 'down' || (ipo.prevGmp != null && (ipo.currentGmp ?? 0) < ipo.prevGmp)
      ? 'down'
      : 'flat';

  return (
    <div className="terminal-panel p-3.5 sm:p-4 space-y-3">
      {/* Header Row: Title, Tag, and Status */}
      <div className="flex items-start justify-between gap-2.5">
        <Link to={`/ipo/${ipo.id}`} className="min-w-0 flex-1 group">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-white text-sm sm:text-base group-hover:text-cyan-400 transition leading-snug break-words">
              {ipo.name}
            </span>
            <span className="rounded bg-blue-500/15 border border-blue-500/25 px-1.5 py-0.5 text-[9px] font-bold text-blue-300 shrink-0">
              {ipo.category || 'Mainboard'}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400 flex flex-wrap items-center gap-1.5">
            <span>Price: <strong className="text-slate-200 num font-medium">{inr(ipo.issuePrice)}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Lot: <strong className="text-slate-200 num font-medium">{ipo.lotSize || 15}</strong> sh</span>
          </div>
        </Link>
        <span
          className={`shrink-0 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            currentMarketStatus === 'Open'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : currentMarketStatus === 'Closed'
              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              : 'bg-slate-700/40 text-slate-300 border border-white/[0.06]'
          }`}
        >
          {currentMarketStatus === 'Open' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          {currentMarketStatus}
        </span>
      </div>

      {/* Key Metrics 3-Col Grid */}
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#090D17] border border-white/[0.06] p-2.5 text-xs">
        <div className="min-w-0">
          <div className="card-label">GMP</div>
          <div className="flex items-center gap-1 mt-1">
            <span className={`num font-extrabold text-xs sm:text-sm ${gmpPos ? 'text-emerald-400' : 'text-red-400'}`}>
              {ipo.currentGmp != null ? money(ipo.currentGmp) : '₹0'}
            </span>
            <Sparkline trend={trend} width={28} height={12} className="shrink-0" />
          </div>
          {ipo.gmpPct != null && (
            <div className="text-[10px] text-slate-400 num mt-0.5">{pct(ipo.gmpPct)}</div>
          )}
        </div>

        <div className="min-w-0">
          <div className="card-label">EST. LISTING</div>
          <div className="num font-bold text-slate-200 text-xs sm:text-sm mt-1">
            {ipo.estListing != null ? inr(ipo.estListing) : '—'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Est. Price</div>
        </div>

        <div className="min-w-0">
          <div className="card-label">GAIN / LOT</div>
          <div
            className={`num font-extrabold text-xs sm:text-sm mt-1 ${
              (estimatedLotProfit ?? 0) > 0
                ? 'text-emerald-400'
                : (estimatedLotProfit ?? 0) < 0
                ? 'text-red-400'
                : 'text-slate-400'
            }`}
          >
            {estimatedLotProfit != null ? money(estimatedLotProfit) : '—'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Per Lot</div>
        </div>
      </div>

      {/* Footer Row: Bidding Dates & Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
        <div className="text-[11px] text-slate-400 min-w-0 flex-1">
          {ipo.notes ? ipo.notes.replace(/^Bidding:\s*/i, '') : 'Dates TBA'}
        </div>
        <div className="shrink-0">
          {isApplied ? (
            <div className="inline-flex items-center gap-2">
              <span className="rounded bg-blue-500/20 border border-blue-500/35 px-2.5 py-1 text-[11px] font-bold text-blue-300">
                Applied ({ipo.lotsApplied}L)
              </span>
              <button
                onClick={(e) => onUnapply(ipo, e)}
                className="text-xs text-slate-400 hover:text-red-400 active:scale-95 transition px-1 py-0.5"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => onApply(ipo)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/25 border border-blue-500/40 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-600/35 active:scale-95 transition shadow-sm"
            >
              + Mark Applied
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
