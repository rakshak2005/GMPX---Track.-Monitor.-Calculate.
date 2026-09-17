import { fmtTime } from '../utils/format.js';

export function LiveIndicator({ lastUpdate, nextUpdate, demoMode }: { lastUpdate: string | null; nextUpdate: string | null; demoMode?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {demoMode ? (
        <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold tracking-widest text-amber-300">
          DEMO DATA
        </span>
      ) : (
        <span className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold tracking-widest text-emerald-300">
          <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-emerald-400" /> LIVE
        </span>
      )}
      <span className="text-slate-400">
        Last GMP update: <span className="num text-slate-200">{fmtTime(lastUpdate)}</span>
      </span>
      <span className="text-slate-500">·</span>
      <span className="text-slate-400">
        Next update: <span className="num text-slate-200">{fmtTime(nextUpdate)}</span>
      </span>
    </div>
  );
}
