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
    <Link to={`/ipo/${ipo.id}`} className="glass block p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="font-semibold text-white">{ipo.name}</div>
        <StatusBadge status={ipo.status} />
      </div>
      <div className="mt-1 text-xs text-slate-400">{ipo.lotsApplied} Lot{ipo.lotsApplied > 1 ? 's' : ''} · {inr(ipo.investment ?? null)} invested</div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="card-label">GMP</div>
          <div className={`num font-bold ${pos ? 'text-emerald-300' : 'text-red-300'}`}>{g != null ? money(g) : '---'}</div>
          <div className={`num text-xs ${pos ? 'text-emerald-300/80' : 'text-red-300/80'}`}>{pct(ipo.gmpPct)}</div>
        </div>
        <div>
          <div className="card-label">EST. LISTING</div>
          <div className="num font-bold">{ipo.estListing != null ? inr(ipo.estListing) : '---'}</div>
        </div>
        <div>
          <div className="card-label">EST. PROFIT</div>
          <div className={`num font-bold ${pos ? 'text-emerald-300' : 'text-red-300'}`}>{ipo.estProfit != null ? money(ipo.estProfit) : '---'}</div>
        </div>
        <div>
          <div className="card-label">SUBSCRIPTION</div>
          <div className="num font-bold">{ipo.subscription?.total != null ? `${ipo.subscription.total}x` : '---'}</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-500">Updated {timeAgo(ipo.lastGmpAt)}</div>
    </Link>
  );
}
