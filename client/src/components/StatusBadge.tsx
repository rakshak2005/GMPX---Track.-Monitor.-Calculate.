const COLORS: Record<string, string> = {
  Applied: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  'Allotment Pending': 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  Allotted: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  'Not Allotted': 'bg-slate-400/10 text-slate-300 border-slate-400/30',
  'Refund Pending': 'bg-orange-400/10 text-orange-300 border-orange-400/30',
  Listed: 'bg-violet-400/10 text-violet-300 border-violet-400/30',
  Sold: 'bg-zinc-400/10 text-zinc-300 border-zinc-400/30',
};

export function StatusBadge({ status }: { status: string }) {
  const c = COLORS[status] ?? 'bg-slate-400/10 text-slate-300 border-slate-400/30';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${c}`}>
      {status}
    </span>
  );
}
