import { fmtTime } from '../utils/format.js';

export function LiveIndicator({ lastUpdate, nextUpdate, demoMode }: { lastUpdate: string | null; nextUpdate: string | null; demoMode?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
      {demoMode ? (
        <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-300">
          DEMO DATA
        </span>
      ) : (
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-300">
          <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" /> LIVE
        </span>
      )}
      <span className="text-slate-400 text-[11px] sm:text-xs">
        Last GMP: <span className="num text-slate-200">{fmtTime(lastUpdate)}</span>
      </span>
      <span className="text-slate-600 hidden xs:inline">·</span>
      <span className="text-slate-400 text-[11px] sm:text-xs">
        Next: <span className="num text-slate-200">{fmtTime(nextUpdate)}</span>
      </span>
    </div>
  );
}
