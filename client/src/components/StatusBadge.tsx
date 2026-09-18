const COLORS: Record<string, string> = {
  Applied: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'Allotment Pending': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Allotted: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Not Allotted': 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  'Refund Pending': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  Listed: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Sold: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
};

export function StatusBadge({ status }: { status: string }) {
  const c = COLORS[status] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${c}`}>
      {status}
    </span>
  );
}
