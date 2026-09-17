import { useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import type { Ipo } from '../types/ipo.js';

const CATS = [
  { key: 'retail', label: 'Retail', color: '#60a5fa' },
  { key: 'nii', label: 'NII', color: '#f59e0b' },
  { key: 'qib', label: 'QIB', color: '#34d399' },
  { key: 'total', label: 'Total', color: '#a78bfa' },
] as const;

export function SubscriptionCard({ ipo }: { ipo: Ipo }) {
  const sub = ipo.subscription ?? {};
  const rows = [
    { label: 'Retail', v: sub.retail },
    { label: 'NII / HNI', v: sub.nii },
    { label: 'QIB', v: sub.qib },
    { label: 'Employee', v: sub.employee },
    { label: 'Total', v: sub.total },
  ];
  const max = Math.max(1, ...rows.map((r) => r.v ?? 0));
  return (
    <div className="glass p-5">
      <div className="card-label">SUBSCRIPTION</div>
      <div className="mt-1 text-2xl font-bold num">{sub.total != null ? `${sub.total}x` : '---'}</div>
      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{r.label}</span>
              <span className="num text-slate-200">{r.v != null ? `${r.v}x` : '---'}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                style={{ width: `${Math.min(100, ((r.v ?? 0) / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubscriptionChart({ history }: { history: { retail?: number | null; nii?: number | null; qib?: number | null; total?: number | null; label?: string; timestamp: string }[] }) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const data = history.map((h, i) => ({ ...h, t: h.label || `Pt ${i + 1}` }));
  if (data.length === 0) {
    return (
      <div className="glass p-5">
        <div className="card-label">SUBSCRIPTION PROGRESSION</div>
        <p className="mt-3 text-sm text-slate-500">No subscription snapshots yet. Update subscription values to build Day 1 → Final progression.</p>
      </div>
    );
  }
  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between">
        <div className="card-label">SUBSCRIPTION PROGRESSION</div>
        <div className="flex gap-2">
          {CATS.map((c) => (
            <button
              key={c.key}
              onClick={() => setHidden((s) => { const n = new Set(s); if (n.has(c.key)) n.delete(c.key); else n.add(c.key); return n; })}
              className={`rounded-full border px-2 py-0.5 text-xs ${hidden.has(c.key) ? 'opacity-40' : ''}`}
              style={{ borderColor: c.color, color: c.color }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: '#8b94a7', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#8b94a7', fontSize: 11 }} tickLine={false} axisLine={false} />
            <RTooltip contentStyle={{ background: '#0b1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10 }} />
            <Legend />
            {CATS.filter((c) => !hidden.has(c.key)).map((c) => (
              <Line key={c.key} type="monotone" dataKey={c.key} name={c.label} stroke={c.color} strokeWidth={2} dot={false} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
