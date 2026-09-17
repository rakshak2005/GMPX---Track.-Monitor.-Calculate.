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
  const color: Record<string, string> = {
    'IPO Opens': 'bg-sky-400/10 text-sky-300 border-sky-400/30',
    'IPO Closes': 'bg-amber-400/10 text-amber-300 border-amber-400/30',
    Allotment: 'bg-violet-400/10 text-violet-300 border-violet-400/30',
    Listing: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  };
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black">IPO Calendar</h1>
      <div className="flex items-center gap-2">
        <button onClick={() => shift(-1)} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm">←</button>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="!w-44" />
        <button onClick={() => shift(1)} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm">→</button>
      </div>
      {isLoading ? <div className="glass p-6"><div className="skeleton h-48 w-full" /></div> : (
        <div className="space-y-2">
          {(data ?? []).map((e, i) => (
            <Link key={i} to={`/ipo/${e.ipoId}`} className="glass flex items-center justify-between p-4 hover:border-blue-400/30">
              <div>
                <span className={`mr-2 inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${color[e.type] ?? ''}`}>{e.type}</span>
                <span className="font-semibold">{e.ipoName}</span>
              </div>
              <span className="num text-sm text-slate-300">{fmtDate(e.date)}</span>
            </Link>
          ))}
          {(data ?? []).length === 0 && <div className="glass p-8 text-center text-sm text-slate-500">No events in {month}.</div>}
        </div>
      )}
    </div>
  );
}
