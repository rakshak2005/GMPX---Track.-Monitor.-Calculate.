export function SummaryCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: 'green' | 'red' }) {
  const color = accent === 'green' ? 'text-emerald-300' : accent === 'red' ? 'text-red-300' : 'text-white';
  return (
    <div className="glass p-5">
      <div className="card-label">{label}</div>
      <div className={`num mt-2 text-3xl font-bold ${color}`}>{value}</div>
      <div className="mt-1 text-xs text-slate-400">{sub}</div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass p-5">
      <div className="skeleton h-3 w-24" />
      <div className="skeleton mt-3 h-8 w-32" />
      <div className="skeleton mt-2 h-3 w-40" />
    </div>
  );
}
