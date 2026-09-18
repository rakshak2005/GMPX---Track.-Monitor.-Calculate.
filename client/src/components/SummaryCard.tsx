export function SummaryCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: 'green' | 'red' }) {
  const color = accent === 'green' ? 'text-emerald-300' : accent === 'red' ? 'text-red-300' : 'text-white';
  return (
    <div className="glass p-3 sm:p-5 flex flex-col justify-between">
      <div>
        <div className="card-label text-[9px] sm:text-xs truncate">{label}</div>
        <div className={`num mt-1 sm:mt-2 text-xl sm:text-3xl font-black ${color} truncate`}>{value}</div>
      </div>
      <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-slate-400 line-clamp-1">{sub}</div>
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
