import { fmtTime } from '../utils/format.js';

export function LiveIndicator({
  lastUpdate,
  nextUpdate,
  demoMode,
}: {
  lastUpdate: string | null;
  nextUpdate: string | null;
  demoMode?: boolean;
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-md bg-gradient-to-r from-[#0C1427] to-[#0A0F1E] border border-cyan-500/20 px-2.5 py-1 text-xs shadow-[0_0_12px_rgba(6,182,212,0.08)] backdrop-blur-sm">
      {demoMode ? (
        <span className="rounded bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-amber-300">
          DEMO FEED
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          LIVE
        </span>
      )}
      <span className="text-slate-600 text-[10px]">•</span>
      <span className="text-slate-400 text-[11px]">
        Updated <span className="num font-semibold text-slate-200">{fmtTime(lastUpdate)}</span>
      </span>
      <span className="text-slate-600 text-[10px] hidden sm:inline">•</span>
      <span className="text-slate-400 text-[11px] hidden sm:inline">
        Next pulse <span className="num font-semibold text-slate-300">{fmtTime(nextUpdate)}</span>
      </span>
    </div>
  );
}
