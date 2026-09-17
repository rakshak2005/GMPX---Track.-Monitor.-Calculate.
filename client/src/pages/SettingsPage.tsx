import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api.js';

const KEY = 'gmpulse-settings';

interface Settings { refreshInterval: number; currency: string; theme: string; notifications: boolean; gmpAbove: string; gmpMove: string; subAbove: string; demoMode: boolean }

const DEFAULTS: Settings = { refreshInterval: 3, currency: 'INR', theme: 'Dark', notifications: true, gmpAbove: '', gmpMove: '', subAbove: '', demoMode: false };

function load(): Settings {
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }; } catch { /* ignore */ }
  return DEFAULTS;
}

export function SettingsPage() {
  const [s, setS] = useState<Settings>(load);
  const [msg, setMsg] = useState('');
  const health = useQuery({ queryKey: ['health'], queryFn: api.health });
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(s)); }, [s]);
  const set = (k: keyof Settings, v: string | number | boolean) => setS({ ...s, [k]: v });

  const exportJson = () => { window.open('/api/export?format=json', '_blank'); };
  const exportCsv = () => { window.open('/api/export?format=csv', '_blank'); };
  const importFile = async (f: File) => {
    try {
      const parsed = JSON.parse(await f.text()) as { data?: unknown[] } | unknown[];
      const arr = Array.isArray(parsed) ? parsed : parsed.data;
      if (!Array.isArray(arr)) throw new Error('Invalid backup file.');
      const r = await api.importBackup(arr);
      setMsg(`Imported ${r.imported}. ${r.errors.length ? `Errors: ${r.errors.join('; ')}` : ''}`);
    } catch (e) { setMsg(`Import failed: ${(e as Error).message}`); }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-black">Settings</h1>
      <div className="glass space-y-4 p-5">
        <label className="block text-sm">GMP Refresh Interval (minutes, min 1)
          <input type="number" min={1} value={s.refreshInterval} onChange={(e) => set('refreshInterval', Math.max(1, Number(e.target.value)))} className="mt-1 max-w-32" />
          <span className="mt-1 block text-xs text-slate-500">Frontend polls every 3 min by default. Backend minimum is 60s to prevent API abuse.</span>
        </label>
        <label className="block text-sm">Currency
          <select value={s.currency} onChange={(e) => set('currency', e.target.value)} className="mt-1 max-w-44"><option>INR</option></select>
        </label>
        <label className="block text-sm">Theme
          <select value={s.theme} onChange={(e) => set('theme', e.target.value)} className="mt-1 max-w-44"><option>Dark</option><option>Light</option></select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={s.notifications} onChange={(e) => set('notifications', e.target.checked)} className="!w-auto" /> Notifications on/off
        </label>
      </div>

      <div className="glass space-y-3 p-5">
        <div className="card-label">ALERT RULES (IN-APP / BROWSER)</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block text-xs">GMP crosses ₹<input value={s.gmpAbove} onChange={(e) => set('gmpAbove', e.target.value)} type="number" className="mt-1" placeholder="100" /></label>
          <label className="block text-xs">GMP moves by ₹<input value={s.gmpMove} onChange={(e) => set('gmpMove', e.target.value)} type="number" className="mt-1" placeholder="20" /></label>
          <label className="block text-xs">Subscription crosses<input value={s.subAbove} onChange={(e) => set('subAbove', e.target.value)} type="number" step="0.1" className="mt-1" placeholder="10x" /></label>
        </div>
        <p className="text-[11px] text-slate-500">Email/Telegram/WhatsApp senders can be plugged into this rules structure later.</p>
      </div>

      <div className="glass space-y-2 p-5 text-sm">
        <div className="card-label">GMP PROVIDER</div>
        <div className="text-slate-300">Backend provider: <strong>{health.data?.provider ?? '…'}</strong> · refresh every {health.data?.refreshIntervalSec ?? '…'}s {health.data?.demoMode ? '(DEMO DATA)' : ''}</div>
        <p className="text-[11px] text-slate-500">Configure via server env: GMP_PROVIDER, GMP_API_URL, GMP_API_KEY, GMP_REFRESH_INTERVAL.</p>
      </div>

      <div className="glass space-y-3 p-5">
        <div className="card-label">EXPORT / IMPORT</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportJson} className="rounded-lg bg-white/10 px-4 py-2 text-sm">Export JSON</button>
          <button onClick={exportCsv} className="rounded-lg bg-white/10 px-4 py-2 text-sm">Export CSV</button>
          <label className="cursor-pointer rounded-lg bg-white/10 px-4 py-2 text-sm">Import Backup
            <input type="file" accept=".json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importFile(f); }} />
          </label>
        </div>
        {msg && <div className="text-xs text-slate-300">{msg}</div>}
      </div>
    </div>
  );
}
