export function SummaryCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: 'green' | 'red';
}) {
  const color =
    accent === 'green'
      ? 'text-emerald-400'
      : accent === 'red'
      ? 'text-red-400'
      : 'text-slate-100';

  return (
    <div className="terminal-panel p-3 sm:p-4 flex flex-col justify-between">
      <div>
        <div className="card-label truncate">{label}</div>
        <div className={`num mt-1.5 text-2xl sm:text-3xl font-extrabold tracking-tight ${color} truncate`}>
          {value}
        </div>
      </div>
      {sub && (
        <div className="mt-2 text-[11px] text-slate-400 truncate">
          {sub}
        </div>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="terminal-panel p-4">
      <div className="skeleton h-3 w-20" />
      <div className="skeleton mt-3 h-7 w-28" />
      <div className="skeleton mt-2 h-2.5 w-36" />
    </div>
  );
}
