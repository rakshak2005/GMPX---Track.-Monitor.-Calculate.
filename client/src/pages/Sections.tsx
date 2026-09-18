import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, Sparkles, Clock, ArrowUpDown } from 'lucide-react';

import { useIpos, useSummary } from '../hooks/useIpos.js';
import { inr, money, pct, timeAgo } from '../utils/format.js';
import { isClosedExpired } from '../utils/calculations.js';
import { Sparkline } from '../components/Sparkline.js';

export function GmpTracker() {
  const { data, isLoading } = useIpos();
  return (
    <div className="space-y-5">
      <div className="border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">GMP PULSE</h1>
          <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            MARKET SENTIMENT
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Where the Indian grey market is moving • Track acceleration, stable, or declining trends</p>
      </div>

      {isLoading ? (
        <div className="terminal-panel p-6"><div className="skeleton h-48 w-full" /></div>
      ) : !data || data.length === 0 ? (
        <div className="terminal-panel p-8 text-center text-xs text-slate-400">
          No live GMP data available right now. Values update continuously during market hours.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data
            .filter((i) => !isClosedExpired(i.closeDate, i.notes, 4))
            .map((i) => {
            const g = i.currentGmp;
            const pos = (g ?? 0) >= 0;
            const trend =
              i.gmpTrend === 'up' || (i.prevGmp != null && (g ?? 0) > i.prevGmp)
                ? 'up'
                : i.gmpTrend === 'down' || (i.prevGmp != null && (g ?? 0) < i.prevGmp)
                ? 'down'
                : 'flat';

            return (
              <Link
                key={i.id}
                to={`/ipo/${i.id}`}
                className="terminal-panel block p-4 hover:border-blue-500/40 transition group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-white text-sm group-hover:text-blue-400 transition block truncate">
                      {i.name}
                    </span>
                    <span className="text-[11px] text-slate-400 num">
                      Issue {inr(i.issuePrice)} • {i.lotSize || 15} sh
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`num font-black text-base flex items-center justify-end gap-1 ${
                        pos ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {g != null ? money(g) : '—'}
                      {trend === 'up' ? (
                        <ArrowUpRight size={14} />
                      ) : trend === 'down' ? (
                        <ArrowDownRight size={14} />
                      ) : (
                        <Minus size={12} className="text-slate-500" />
                      )}
                    </span>
                    <span className="num text-[11px] text-slate-400">{pct(i.gmpPct)}</span>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-white/[0.05] pt-2.5">
                  <div className="text-[11px] text-slate-400">
                    Est. listing <strong className="text-slate-200 num">{i.estListing != null ? inr(i.estListing) : '—'}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkline trend={trend} width={50} height={16} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <div className="text-[11px] text-slate-500">
        ⓘ GMP is an unofficial indicator calculated by active brokers in Indian financial hubs (Rajkot/Ahmedabad/Mumbai).
      </div>
    </div>
  );
}

export function SubscriptionPage() {
  const { data, isLoading } = useIpos();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.07] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">SUBSCRIPTION DESK</h1>
            <span className="rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-300">
              DEMAND MONITOR
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Live institutional (QIB), HNI (NII), and retail demand progression</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold">
            <ArrowUpDown size={12} />
            <span>Sorted: Highest to Lowest</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101521] border border-white/10 text-slate-400 text-[11px]">
            <Clock size={12} className="text-amber-400 animate-pulse" />
            <span>Updates Every 3 Hours</span>
          </div>
        </div>
      </div>


      {isLoading ? (
        <div className="terminal-panel p-6"><div className="skeleton h-48 w-full" /></div>
      ) : !data || data.length === 0 ? (
        <div className="terminal-panel p-8 text-center text-xs text-slate-400">
          No subscription data found for current issues.
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {data
            .filter((i) => !isClosedExpired(i.closeDate, i.notes, 4))
            .slice()
            .sort((a, b) => {
              const aTot = a.subscription?.total ?? -1;
              const bTot = b.subscription?.total ?? -1;
              return bTot - aTot;
            })
            .map((i) => {
            const sub = i.subscription ?? {};
            const total = sub.total ?? 0;
            const hasData = sub.total !== null && sub.total !== undefined;
            const momentum = !hasData
              ? { text: 'Bidding Awaited', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' }
              : total > 20
              ? { text: 'Accelerating', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
              : total > 5
              ? { text: 'High Demand', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' }
              : { text: 'Subscribed', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };

            const categories = [
              { label: 'Retail Individual', val: sub.retail, color: 'from-blue-500 to-indigo-500' },
              { label: 'Non-Institutional (NII / HNI)', val: sub.nii, color: 'from-amber-500 to-orange-500' },
              { label: 'Qualified Institutional (QIB)', val: sub.qib, color: 'from-emerald-500 to-teal-500' },
              { label: 'Employee', val: sub.employee, color: 'from-purple-500 to-violet-500' },
            ];
            const maxVal = Math.max(1, ...categories.map((c) => c.val ?? 0), total);

            return (
              <div key={i.id} className="terminal-panel p-4 space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-white/[0.06] pb-2.5">
                  <div>
                    <Link to={`/ipo/${i.id}`} className="font-bold text-white text-sm hover:text-blue-400 transition">
                      {i.name}
                    </Link>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Issue {inr(i.issuePrice)} • Category: {i.category || 'Mainboard'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="num text-xl font-black text-white">{sub.total != null ? `${sub.total}x` : '—'}</div>
                    <span className={`inline-block mt-0.5 rounded border px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${momentum.color}`}>
                      {momentum.text}
                    </span>
                  </div>
                </div>


                <div className="space-y-2 text-xs">
                  {categories.map((c) => (
                    <div key={c.label}>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{c.label}</span>
                        <span className="num font-semibold text-slate-200">
                          {c.val != null ? `${c.val}x` : '—'}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${c.color} transition-all`}
                          style={{ width: `${Math.min(100, ((c.val ?? 0) / maxVal) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ProfitTracker() {
  const { data: s, isLoading } = useSummary();

  const totalCapital = s?.capital ?? 0;
  const totalEstGain = s?.estProfit ?? 0;
  const totalEstValue = s?.estValue ?? totalCapital + totalEstGain;
  const returnPct = totalCapital > 0 ? (totalEstGain / totalCapital) * 100 : 0;

  return (
    <div className="space-y-5">
      <div className="border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">PROFIT TRACKER</h1>
          <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            CAPITAL EXPOSURE
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">Expected portfolio valuation based on live grey market premiums</p>
      </div>

      {isLoading || !s ? (
        <div className="terminal-panel p-6"><div className="skeleton h-32 w-full" /></div>
      ) : (
        <>
          {/* Hero Potential Listing Cockpit */}
          <div className="terminal-panel p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 border-b border-white/[0.06] pb-3">
              <div>
                <div className="card-label">POTENTIAL LISTING VALUE</div>
                <div className="num text-3xl sm:text-4xl font-black text-white mt-1">
                  {inr(totalEstValue)}
                </div>
              </div>
              <div className="sm:text-right">
                <span className="card-label">POTENTIAL RETURN</span>
                <div className={`num text-xl font-bold mt-0.5 ${returnPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {pct(returnPct)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="terminal-subpanel p-3 shadow-inner hover:border-blue-500/30 transition">
                <div className="card-label">CAPITAL BLOCKED</div>
                <div className="num text-xl font-bold text-slate-100 mt-1">{inr(totalCapital)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Funds in active applications</div>
              </div>
              <div className="terminal-subpanel p-3 shadow-inner hover:border-emerald-500/30 transition">
                <div className="card-label">ESTIMATED GAIN</div>
                <div className={`num text-xl font-bold mt-1 ${totalEstGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {money(totalEstGain)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Based on current GMP</div>
              </div>
              <div className="col-span-2 sm:col-span-1 terminal-subpanel p-3 shadow-inner hover:border-cyan-500/30 transition">
                <div className="card-label">ACTIVE POSITIONS</div>
                <div className="num text-xl font-bold text-white mt-1">{s.active}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">IPOs tracked in portfolio</div>
              </div>
            </div>
          </div>

          {/* IPO Breakdown Table */}
          <div className="terminal-panel overflow-x-auto">
            <div className="p-3.5 border-b border-white/[0.06] font-extrabold text-xs text-white uppercase tracking-wider">
              PORTFOLIO ISSUE BREAKDOWN
            </div>
            {s.perIpo.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No applied IPOs in portfolio yet. Mark an IPO as applied to calculate listing profit.
              </div>
            ) : (
              <table className="w-full min-w-[500px] text-left text-xs">
                <thead>
                  <tr className="card-label border-b border-white/[0.06] bg-white/[0.015]">
                    <th className="px-4 py-2.5">IPO ISSUE</th>
                    <th className="px-3 py-2.5">CAPITAL BLOCKED</th>
                    <th className="px-3 py-2.5">EST. VALUE</th>
                    <th className="px-4 py-2.5 text-right">POTENTIAL GAIN</th>
                  </tr>
                </thead>
                <tbody>
                  {s.perIpo.map((p) => {
                    const estValue = p.invested + (p.estProfit ?? 0);
                    return (
                      <tr key={p.id} className="border-t border-white/[0.06] hover:bg-white/[0.02] transition">
                        <td className="px-4 py-3">
                          <Link to={`/ipo/${p.id}`} className="font-semibold text-white hover:text-blue-400 transition">
                            {p.name}
                          </Link>
                        </td>
                        <td className="num px-3 py-3 text-slate-300 font-medium">{inr(p.invested)}</td>
                        <td className="num px-3 py-3 text-slate-200 font-semibold">{inr(estValue)}</td>
                        <td
                          className={`num px-4 py-3 text-right font-bold ${
                            (p.estProfit ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {p.estProfit != null ? `${p.estProfit >= 0 ? '+' : ''}${money(p.estProfit)}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="text-[11px] text-slate-500">
            ⓘ Estimates are based on unofficial grey market indications. GMP can fluctuate wildly before official NSE/BSE listing.
          </div>
        </>
      )}
    </div>
  );
}
