import { lazy, Suspense } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import type { GmpPoint, GmpStats } from '../types/ipo.js';

const RANGES = ['6H', '12H', '1D', '3D', 'ALL'] as const;

export function GmpChart({
  data, stats, range, onRange, loading,
}: { data: GmpPoint[]; stats: GmpStats | null; range: string; onRange: (r: string) => void; loading?: boolean }) {
  const chartData = data.map((d) => ({
    ...d,
    t: new Date(d.timestamp).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
  }));
  return (
    <div className="glass p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="card-label">GMP MOVEMENT</div>
          {stats && (
            <div className="num mt-1 flex flex-wrap gap-4 text-xs text-slate-400">
              <span>High <strong className="text-emerald-300">₹{stats.high}</strong></span>
              <span>Low <strong className="text-red-300">₹{stats.low}</strong></span>
              <span>Open <strong className="text-slate-200">₹{stats.open}</strong></span>
              <span>Change <strong className={(stats.change ?? 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                {(stats.change ?? 0) >= 0 ? '+' : ''}₹{stats.change}
              </strong></span>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => onRange(r)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${range === r ? 'bg-blue-500/30 text-blue-200' : 'text-slate-400 hover:text-white'}`}
            >
              {r === 'ALL' ? 'IPO PERIOD' : r}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-64">
        {loading ? (
          <div className="skeleton h-full w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No GMP history yet — values appear after the first refresh.
          </div>
        ) : (
          <Suspense fallback={<div className="skeleton h-full w-full" />}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="t" tick={{ fill: '#8b94a7', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={40} />
                <YAxis tick={{ fill: '#8b94a7', fontSize: 11 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <RTooltip
                  contentStyle={{ background: '#0b1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }}
                  labelStyle={{ color: '#8b94a7' }}
                  formatter={(v) => [`₹${v}`, 'GMP']}
                />
                <Line type="monotone" dataKey="gmp" stroke="#60a5fa" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Suspense>
        )}
      </div>
    </div>
  );
}

export function lazyGmpChart() {
  return lazy(() => Promise.resolve({ default: GmpChart }));
}
