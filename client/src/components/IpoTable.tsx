import { Link } from 'react-router-dom';
import { TrendingDown, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import type { Ipo } from '../types/ipo.js';
import { inr, money, pct, timeAgo } from '../utils/format.js';
import { StatusBadge } from './StatusBadge.js';
import { Tooltip } from './Tooltip.js';
import { Countdown } from './Countdown.js';

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function IpoRow({ ipo, flash }: { ipo: Ipo; flash?: 'up' | 'down' | null }) {
  const g = ipo.currentGmp;
  const pos = (g ?? 0) >= 0;
  return (
    <tr className={`border-t border-white/5 transition hover:bg-white/[0.03] ${flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''}`}>
      <td className="px-4 py-3">
        <Link to={`/ipo/${ipo.id}`} className="flex items-center gap-3">
          {ipo.logoUrl ? (
            <img src={ipo.logoUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/40 to-violet-500/40 text-xs font-bold">
              {initials(ipo.name)}
            </span>
          )}
          <span>
            <span className="block font-semibold text-white">{ipo.name}</span>
            <span className="block text-xs text-slate-400">
              <StatusBadge status={ipo.status} /> <Countdown target={ipo.closeDate} prefix="closes in" />
            </span>
          </span>
        </Link>
      </td>
      <td className="num px-3 py-3">{inr(ipo.issuePrice)}</td>
      <td className="num px-3 py-3">{ipo.lotSize}</td>
      <td className="num px-3 py-3">{ipo.lotsApplied}</td>
      <td className="num px-3 py-3">{inr(ipo.investment ?? null)}</td>
      <td className="px-3 py-3">
        {g === null || g === undefined ? (
          <span className="text-xs text-slate-500">GMP unavailable</span>
        ) : (
          <Tooltip label="Grey Market Premium. An unofficial indicator of potential listing sentiment.">
            <div className="flex items-center gap-1.5">
              <span className={`num flex items-center gap-1 font-semibold ${pos ? 'text-emerald-300' : 'text-red-300'}`}>
                {pos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{money(g)}
              </span>

              {/* Green Up Arrow if increased, Red Down Arrow if reduced */}
              {ipo.gmpTrend === 'up' || (ipo.prevGmp != null && (ipo.currentGmp ?? 0) > ipo.prevGmp) ? (
                <span
                  className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  title={`GMP increased by ₹${((ipo.currentGmp ?? 0) - (ipo.prevGmp ?? 0)).toFixed(1)} from previous ₹${ipo.prevGmp}`}
                >
                  <ArrowUp size={11} className="stroke-[3]" />
                  {ipo.prevGmp != null && <span>+{money((ipo.currentGmp ?? 0) - ipo.prevGmp)}</span>}
                </span>
              ) : ipo.gmpTrend === 'down' || (ipo.prevGmp != null && (ipo.currentGmp ?? 0) < ipo.prevGmp) ? (
                <span
                  className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30"
                  title={`GMP reduced by ₹${((ipo.prevGmp ?? 0) - (ipo.currentGmp ?? 0)).toFixed(1)} from previous ₹${ipo.prevGmp}`}
                >
                  <ArrowDown size={11} className="stroke-[3]" />
                  {ipo.prevGmp != null && <span>-{money(ipo.prevGmp - (ipo.currentGmp ?? 0))}</span>}
                </span>
              ) : null}
            </div>
          </Tooltip>
        )}
      </td>
      <td className={`num px-3 py-3 ${pos ? 'text-emerald-300' : 'text-red-300'}`}>{pct(ipo.gmpPct)}</td>
      <td className="num px-3 py-3">{ipo.estListing != null ? inr(ipo.estListing) : '₹---'}</td>
      <td className={`num px-3 py-3 font-semibold ${pos ? 'text-emerald-300' : 'text-red-300'}`}>
        <Tooltip label="Estimated gross profit based on the current GMP and your expected allotted quantity. Estimate only — not guaranteed.">
          <span>{ipo.estProfit != null ? money(ipo.estProfit) : '₹---'}</span>
        </Tooltip>
      </td>
      <td className="px-3 py-3">
        <Tooltip label="Demand received relative to shares offered.">
          <span className="num">{ipo.subscription?.total != null ? `${ipo.subscription.total}x` : '---'}</span>
        </Tooltip>
      </td>
      <td className="px-4 py-3 text-right text-xs text-slate-500">Updated {timeAgo(ipo.lastGmpAt)}</td>
    </tr>
  );
}

export function IpoTable({ ipos, flashes }: { ipos: Ipo[]; flashes: Record<string, 'up' | 'down'> }) {
  return (
    <div className="glass overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="card-label">
            {['IPO', 'PRICE', 'LOT', 'LOTS', 'INVESTED', 'GMP', 'GMP %', 'EST. LISTING', 'EST. PROFIT', 'SUBSCRIPTION', ''].map((h) => (
              <th key={h} className="px-3 py-3 font-semibold first:pl-4 last:pr-4">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ipos.map((i) => <IpoRow key={i.id} ipo={i} flash={flashes[i.id]} />)}
        </tbody>
      </table>
    </div>
  );
}

export function MobileIpoCard({ ipo }: { ipo: Ipo }) {
  const g = ipo.currentGmp;
  const pos = (g ?? 0) >= 0;
  return (
    <Link to={`/ipo/${ipo.id}`} className="glass block p-4 transition active:scale-[0.99] hover:border-white/20">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {ipo.logoUrl ? (
            <img src={ipo.logoUrl} alt="" className="h-9 w-9 rounded-xl object-cover shrink-0 border border-white/10" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-500/30 text-xs font-bold border border-white/10">
              {initials(ipo.name)}
            </span>
          )}
          <div className="min-w-0">
            <div className="font-bold text-white text-base truncate">{ipo.name}</div>
            <div className="text-xs text-slate-400 truncate">
              {ipo.lotsApplied} Lot{ipo.lotsApplied > 1 ? 's' : ''} ({ipo.lotsApplied * (ipo.lotSize || 15)} sh) · {inr(ipo.investment ?? null)}
            </div>
          </div>
        </div>
        <StatusBadge status={ipo.status} />
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-2.5 rounded-xl bg-white/[0.03] border border-white/5 p-3 text-xs">
        <div>
          <div className="card-label">CURRENT GMP</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`num font-extrabold text-base ${pos ? 'text-emerald-300' : 'text-red-300'}`}>
              {g != null ? money(g) : '—'}
            </span>
            {ipo.gmpPct != null && (
              <span className={`num text-xs ${pos ? 'text-emerald-400/80' : 'text-red-400/80'}`}>({pct(ipo.gmpPct)})</span>
            )}
          </div>
        </div>
        <div>
          <div className="card-label">EST. LISTING</div>
          <div className="num font-bold text-slate-200 text-sm mt-1">
            {ipo.estListing != null ? inr(ipo.estListing) : '—'}
          </div>
        </div>
        <div>
          <div className="card-label">EST. PROFIT</div>
          <div className={`num font-bold text-sm mt-0.5 ${(ipo.estProfit ?? 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
            {ipo.estProfit != null ? money(ipo.estProfit) : '—'}
          </div>
        </div>
        <div>
          <div className="card-label">SUBSCRIPTION</div>
          <div className="num font-bold text-slate-200 text-sm mt-0.5">
            {ipo.subscription?.total != null ? `${ipo.subscription.total}x` : '—'}
          </div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
        <span>Updated {timeAgo(ipo.lastGmpAt)}</span>
        <span className="text-blue-400 font-medium flex items-center gap-0.5">Details →</span>
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

  return (
    <div className="glass p-4 transition hover:border-white/20 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/ipo/${ipo.id}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base hover:text-blue-400 truncate">{ipo.name}</span>
            <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-blue-400/20 text-blue-300 shrink-0">
              {ipo.category || 'Mainboard'}
            </span>
          </div>
          <div className="mt-0.5 text-xs text-slate-400">
            Price: <strong className="text-slate-200 num">{inr(ipo.issuePrice)}</strong> · Lot: <strong className="text-slate-200 num">{ipo.lotSize || 15}</strong> shares
          </div>
        </Link>
        <span
          className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            currentMarketStatus === 'Open'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : currentMarketStatus === 'Closed'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'bg-slate-700/50 text-slate-300 border border-white/5'
          }`}
        >
          {currentMarketStatus === 'Open' ? (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ) : null}
          {currentMarketStatus}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-white/[0.03] border border-white/5 p-2.5 text-xs">
        <div>
          <div className="card-label text-[10px]">LIVE GMP</div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`num font-bold text-sm ${gmpPos ? 'text-emerald-400' : 'text-red-400'}`}>
              {ipo.currentGmp != null ? money(ipo.currentGmp) : '₹0'}
            </span>
            {ipo.gmpTrend === 'up' || (ipo.prevGmp != null && (ipo.currentGmp ?? 0) > ipo.prevGmp) ? (
              <span className="inline-flex items-center text-[10px] font-extrabold text-emerald-400">
                <ArrowUp size={10} className="stroke-[3]" />
              </span>
            ) : ipo.gmpTrend === 'down' || (ipo.prevGmp != null && (ipo.currentGmp ?? 0) < ipo.prevGmp) ? (
              <span className="inline-flex items-center text-[10px] font-extrabold text-red-400">
                <ArrowDown size={10} className="stroke-[3]" />
              </span>
            ) : null}
          </div>
          {ipo.gmpPct != null && (
            <div className="text-[10px] text-slate-400 num">{pct(ipo.gmpPct)}</div>
          )}
        </div>

        <div>
          <div className="card-label text-[10px]">EST. LISTING</div>
          <div className="num font-semibold text-slate-200 text-sm mt-0.5">
            {ipo.estListing != null ? inr(ipo.estListing) : '—'}
          </div>
        </div>

        <div>
          <div className="card-label text-[10px]">PROFIT / LOT</div>
          <div
            className={`num font-bold text-sm mt-0.5 ${
              (estimatedLotProfit ?? 0) > 0
                ? 'text-emerald-300'
                : (estimatedLotProfit ?? 0) < 0
                ? 'text-red-300'
                : 'text-slate-400'
            }`}
          >
            {estimatedLotProfit != null ? money(estimatedLotProfit) : '—'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="text-[11px] text-slate-400 truncate max-w-[50%]">
          {ipo.notes ? ipo.notes.replace(/^Bidding:\s*/i, '') : 'Dates TBA'}
        </div>
        <div>
          {isApplied ? (
            <div className="inline-flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                Applied ({ipo.lotsApplied}L)
              </span>
              <button
                onClick={(e) => onUnapply(ipo, e)}
                className="text-[11px] text-slate-400 hover:text-red-400 underline transition p-1"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => onApply(ipo)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500 hover:text-white active:scale-95 transition"
            >
              + Mark Applied
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
