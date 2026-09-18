import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api.js';
import { fmtDate } from '../utils/format.js';

export function CalendarPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const { data, isLoading } = useQuery({ queryKey: ['calendar', month], queryFn: () => api.calendar(month) });
  const shift = (d: number) => {
    const [y, m] = month.split('-').map(Number);
    const t = new Date(y, m - 1 + d, 1);
    setMonth(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}`);
  };

  const badgeStyle: Record<string, string> = {
    'IPO Opens': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    'IPO Closes': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Allotment: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    Listing: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  };

  return (
    <div className="space-y-5">
      <div className="border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">IPO TIMELINE CALENDAR</h1>
          <span className="rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-300">
            MARKET MILESTONES
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Chronological schedule of IPO openings, closings, allotment finalization, and exchange listings
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => shift(-1)}
          className="rounded-md bg-[#101521] border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5 transition"
        >
          ← Prev
        </button>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="!w-44 text-xs font-semibold bg-[#101521] border border-white/[0.08]"
        />
        <button
          onClick={() => shift(1)}
          className="rounded-md bg-[#101521] border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/5 transition"
        >
          Next →
        </button>
      </div>

      {isLoading ? (
        <div className="terminal-panel p-6"><div className="skeleton h-48 w-full" /></div>
      ) : !data || data.length === 0 ? (
        <div className="terminal-panel p-8 text-center text-xs text-slate-400">
          No market milestones scheduled in {month}.
        </div>
      ) : (
        <div className="terminal-panel divide-y divide-white/[0.06] overflow-hidden">
          {data.map((e, i) => (
            <Link
              key={i}
              to={`/ipo/${e.ipoId}`}
              className="flex items-center justify-between p-3.5 hover:bg-white/[0.025] transition group text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    badgeStyle[e.type] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/30'
                  }`}
                >
                  {e.type}
                </span>
                <span className="font-semibold text-white group-hover:text-blue-400 transition text-sm">
                  {e.ipoName}
                </span>
              </div>
              <span className="num font-semibold text-slate-300">{fmtDate(e.date)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
