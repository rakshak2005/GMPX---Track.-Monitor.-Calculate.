import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useIpos } from '../hooks/useIpos.js';
import { IpoTable, MobileIpoCard } from '../components/IpoTable.js';
import { Search } from 'lucide-react';

const STATUSES = ['All', 'Applied', 'Allotment Pending', 'Allotted', 'Not Allotted', 'Refund Pending', 'Listed', 'Sold'];
const SORTS = [
  { v: '', l: 'Default' },
  { v: 'gmp', l: 'GMP' },
  { v: 'gmpPct', l: 'GMP %' },
  { v: 'profit', l: 'Est. Profit' },
  { v: 'subscription', l: 'Subscription' },
  { v: 'listingDate', l: 'Listing Date' },
  { v: 'investment', l: 'Capital' },
];

export function MyIpos() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [sort, setSort] = useState('');

  const params = useMemo(() => {
    const q = new URLSearchParams();
    q.set('appliedOnly', 'true');
    if (debounced) q.set('search', debounced);
    if (status !== 'All') q.set('status', status);
    if (sort) q.set('sort', sort);
    const s = q.toString();
    return s ? `?${s}` : '';
  }, [debounced, status, sort]);

  const { data, isLoading } = useIpos(params);

  return (
    <div className="space-y-5">
      <div className="border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">MY IPO BOOK</h1>
          <span className="rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-300">
            PORTFOLIO BOOK
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Monitor your personal applications, allotment draws, capital exposure, and listing days
        </p>
      </div>

      <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
        <div className="relative md:max-w-xs w-full">
          <input
            placeholder="Filter applied issues…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              clearTimeout((setSearch as unknown as { t?: number }).t);
              (setSearch as unknown as { t?: number }).t = window.setTimeout(() => setDebounced(e.target.value), 300);
            }}
            className="w-full pl-8 text-xs bg-[#101521] border border-white/[0.08]"
          />
          <Search size={13} className="absolute left-2.5 top-3 text-slate-500" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                status === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[#101521] border border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full md:ml-auto md:max-w-44 text-xs bg-[#101521] border border-white/[0.08]"
        >
          {SORTS.map((s) => (
            <option key={s.v} value={s.v}>
              Sort: {s.l}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="terminal-panel p-6"><div className="skeleton h-48 w-full" /></div>
      ) : !data || data.length === 0 ? (
        <div className="terminal-panel p-8 text-center text-xs text-slate-400 space-y-2">
          <div className="font-bold text-slate-200 text-sm">No Active Applications in My IPO Book</div>
          <p className="text-slate-400 max-w-md mx-auto">
            Your applied IPOs will appear here with live GMP tracking and listing day notifications.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-md bg-blue-600/20 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-600/30 transition"
            >
              Browse Live IPO Market →
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden md:block"><IpoTable ipos={data} flashes={{}} /></div>
          <div className="grid gap-2.5 md:hidden">{data.map((r) => <MobileIpoCard key={r.id} ipo={r} />)}</div>
        </>
      )}
    </div>
  );
}
