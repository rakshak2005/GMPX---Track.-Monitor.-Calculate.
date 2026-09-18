import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIpos } from '../hooks/useIpos.js';
import { IpoTable, MobileIpoCard } from '../components/IpoTable.js';

const STATUSES = ['All', 'Applied', 'Allotment Pending', 'Allotted', 'Not Allotted', 'Refund Pending', 'Listed', 'Sold'];
const SORTS = [
  { v: '', l: 'Default' },
  { v: 'gmp', l: 'GMP' },
  { v: 'gmpPct', l: 'GMP %' },
  { v: 'profit', l: 'Est. Profit' },
  { v: 'subscription', l: 'Subscription' },
  { v: 'listingDate', l: 'Listing Date' },
  { v: 'investment', l: 'Investment' },
];

export function MyIpos() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('All');
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
      <h1 className="text-2xl font-black">My IPOs</h1>
      <div className="flex flex-col gap-2 md:flex-row">
        <input
          placeholder="Search IPO…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); clearTimeout((setSearch as unknown as { t?: number }).t); (setSearch as unknown as { t?: number }).t = window.setTimeout(() => setDebounced(e.target.value), 300); }}
          className="md:max-w-xs"
        />
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                status === s ? 'bg-blue-500 text-white shadow-md' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full md:ml-auto md:max-w-44">
          {SORTS.map((s) => <option key={s.v} value={s.v}>Sort: {s.l}</option>)}
        </select>
      </div>
      {isLoading ? (
        <div className="glass p-6"><div className="skeleton h-48 w-full" /></div>
      ) : !data || data.length === 0 ? (
        <div className="glass p-8 text-center text-sm text-slate-400">
          You haven&apos;t marked any IPOs as applied yet.{' '}
          <Link to="/" className="text-emerald-400 underline font-medium">Browse Available IPOs on Dashboard</Link> to mark your applications.
        </div>
      ) : (
        <>
          <div className="hidden md:block"><IpoTable ipos={data} flashes={{}} /></div>
          <div className="grid gap-3 md:hidden">{data.map((r) => <MobileIpoCard key={r.id} ipo={r} />)}</div>
        </>
      )}
    </div>
  );
}
