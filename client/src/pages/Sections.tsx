import { Link } from 'react-router-dom';
import { useIpos, useSummary } from '../hooks/useIpos.js';
import { inr, money } from '../utils/format.js';

export function GmpTracker() {
  const { data, isLoading } = useIpos();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black">GMP Tracker</h1>
      <p className="text-xs text-slate-500">ⓘ GMP is an unofficial market indicator and may change before listing.</p>
      {isLoading ? <div className="glass p-6"><div className="skeleton h-48 w-full" /></div> : (
        <div className="grid gap-3 md:grid-cols-2">
          {(data ?? []).map((i) => (
            <Link key={i.id} to={`/ipo/${i.id}`} className="glass p-4 hover:border-blue-400/30">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{i.name}</span>
                <span className={`num font-bold ${(i.currentGmp ?? 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {i.currentGmp != null ? money(i.currentGmp) : 'GMP unavailable'}
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-500">Source: {i.gmpSource ?? '—'} · Est. listing {i.estListing != null ? inr(i.estListing) : '—'}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function SubscriptionPage() {
  const { data, isLoading } = useIpos();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Subscription</h1>
        <p className="text-xs text-slate-400 mt-1">Live subscription demand across Retail, NII, and QIB categories.</p>
      </div>
      {isLoading ? <div className="glass p-6"><div className="skeleton h-48 w-full" /></div> : (
        <>
          {/* Desktop Table */}
          <div className="glass hidden md:block overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead><tr className="card-label">{['IPO', 'RETAIL', 'NII/HNI', 'QIB', 'EMPLOYEE', 'TOTAL'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
              <tbody>
                {(data ?? []).map((i) => (
                  <tr key={i.id} className="border-t border-white/5">
                    <td className="px-4 py-3"><Link to={`/ipo/${i.id}`} className="font-semibold text-white hover:text-blue-300">{i.name}</Link></td>
                    {['retail', 'nii', 'qib', 'employee', 'total'].map((k) => (
                      <td key={k} className="num px-4 py-3">{(i.subscription as Record<string, number | null> | undefined)?.[k] != null ? `${(i.subscription as Record<string, number>)[k]}x` : '---'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid gap-3 md:hidden">
            {(data ?? []).map((i) => {
              const sub = i.subscription ?? {};
              return (
                <Link key={i.id} to={`/ipo/${i.id}`} className="glass block p-4 hover:border-white/20 transition active:scale-[0.99]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base truncate">{i.name}</span>
                    <span className="num font-extrabold text-blue-400 text-sm">{sub.total != null ? `${sub.total}x Total` : '---'}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-white/[0.03] border border-white/5 p-2.5 text-xs text-center">
                    <div>
                      <div className="card-label text-[10px]">RETAIL</div>
                      <div className="num font-bold text-slate-200 mt-0.5">{sub.retail != null ? `${sub.retail}x` : '—'}</div>
                    </div>
                    <div>
                      <div className="card-label text-[10px]">NII / HNI</div>
                      <div className="num font-bold text-amber-300 mt-0.5">{sub.nii != null ? `${sub.nii}x` : '—'}</div>
                    </div>
                    <div>
                      <div className="card-label text-[10px]">QIB</div>
                      <div className="num font-bold text-emerald-300 mt-0.5">{sub.qib != null ? `${sub.qib}x` : '—'}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function ProfitTracker() {
  const { data: s, isLoading } = useSummary();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Profit Overview</h1>
        <p className="text-xs text-slate-400 mt-1">Summary of invested capital and expected listing gain.</p>
      </div>
      {isLoading || !s ? <div className="glass p-6"><div className="skeleton h-32 w-full" /></div> : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="glass p-4 sm:p-5"><div className="card-label">TOTAL INVESTED</div><div className="num mt-2 text-2xl font-bold">{inr(s.capital)}</div></div>
            <div className="glass p-4 sm:p-5"><div className="card-label">ESTIMATED PROFIT</div><div className={`num mt-2 text-2xl font-bold ${s.estProfit >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{money(s.estProfit)}</div><div className="mt-1 text-[11px] text-slate-500">Estimate — not guaranteed</div></div>
            <div className="glass p-4 sm:p-5"><div className="card-label">EST. PORTFOLIO VALUE</div><div className="num mt-2 text-2xl font-bold">{inr(s.estValue)}</div></div>
          </div>

          {/* Desktop Table */}
          <div className="glass hidden md:block overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead><tr className="card-label">{['IPO', 'INVESTED', 'EST. PROFIT'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
              <tbody>
                {s.perIpo.map((p) => (
                  <tr key={p.id} className="border-t border-white/5">
                    <td className="px-4 py-3"><Link to={`/ipo/${p.id}`} className="font-semibold hover:text-blue-300">{p.name}</Link></td>
                    <td className="num px-4 py-3">{inr(p.invested)}</td>
                    <td className={`num px-4 py-3 ${(p.estProfit ?? 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{p.estProfit != null ? money(p.estProfit) : '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid gap-3 md:hidden">
            {s.perIpo.map((p) => (
              <Link key={p.id} to={`/ipo/${p.id}`} className="glass block p-4 hover:border-white/20 transition active:scale-[0.99]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-base truncate">{p.name}</span>
                  <span className={`num font-bold text-sm ${(p.estProfit ?? 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                    {p.estProfit != null ? money(p.estProfit) : '—'}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Invested: <strong className="text-slate-200 num">{inr(p.invested)}</strong></span>
                  <span className="text-blue-400">View details →</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
