import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';

const KEY = 'gmpulse-settings';
const PAN_KEY = 'gmpx_investor_pan';

interface Settings { refreshInterval: number; currency: string; theme: string; notifications: boolean; gmpAbove: string; gmpMove: string; subAbove: string; demoMode: boolean }

const DEFAULTS: Settings = { refreshInterval: 3, currency: 'INR', theme: 'Dark', notifications: true, gmpAbove: '', gmpMove: '', subAbove: '', demoMode: false };

function load(): Settings {
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }; } catch { /* ignore */ }
  return DEFAULTS;
}

export function SettingsPage() {
  const { user, updatePreferences } = useAuth();
  const [s, setS] = useState<Settings>(load);
  const [msg, setMsg] = useState('');
  const [panInput, setPanInput] = useState(() => user?.preferences?.pan || localStorage.getItem(PAN_KEY) || '');
  const [panSaved, setPanSaved] = useState(false);

  useEffect(() => {
    if (user?.preferences?.pan) {
      setPanInput(user.preferences.pan);
    }
  }, [user]);

  const handleSavePan = async () => {
    const p = panInput.trim().toUpperCase();
    localStorage.setItem(PAN_KEY, p);
    if (user) {
      await updatePreferences({ pan: p });
    }
    setPanSaved(true);
    setTimeout(() => setPanSaved(false), 3500);
  };

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
    <div className="max-w-3xl space-y-5">
      <div className="border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">TERMINAL SETTINGS</h1>
          <span className="rounded bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-300">
            PREFERENCES
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure telemetry refresh intervals, local currency, threshold alerts, and cloud backup
        </p>
      </div>

      {/* INVESTOR PAN & ALLOTMENT SETTINGS */}
      <div className="terminal-panel p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="card-label">INVESTOR ALLOTMENT CREDENTIALS</div>
          <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
            AUTO ALLOTMENT VERIFICATION
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Save your 10-character Income Tax Permanent Account Number (PAN). On IPO allotment dates, GMPX automatically checks registrar portals (KFintech, Link Intime, Bigshare) starting from 7:00 PM every 1 minute.
        </p>
        <div className="max-w-xs">
          <label className="block text-xs text-slate-400 font-semibold mb-1">
            Permanent Account Number (PAN)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={10}
              placeholder="e.g. HGOPR5743G"
              value={panInput}
              onChange={(e) => {
                const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                setPanInput(v);
              }}
              className="text-xs uppercase font-mono tracking-wider bg-[#090D17] border border-white/[0.08]"
            />
            <button
              onClick={handleSavePan}
              className="shrink-0 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition"
            >
              {panSaved ? 'Saved ✓' : 'Save PAN'}
            </button>
          </div>
          {panSaved && (
            <span className="mt-1 block text-[10px] text-emerald-400 font-medium">
              ✓ PAN saved securely for automated 7:00 PM allotment checks
            </span>
          )}
        </div>
      </div>

      {/* MARKET DATA & REFRESH */}
      <div className="terminal-panel p-4 sm:p-5 space-y-4">
        <div className="card-label">MARKET DATA &amp; REFRESH</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              GMP Polling Interval (minutes)
            </label>
            <input
              type="number"
              min={1}
              value={s.refreshInterval}
              onChange={(e) => set('refreshInterval', Math.max(1, Number(e.target.value)))}
              className="w-full text-xs bg-[#090D17] border border-white/[0.08]"
            />
            <span className="mt-1 block text-[10px] text-slate-500">
              Frontend polls every 3 min by default. Backend rate-limits at 60s.
            </span>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Market Currency</label>
            <select
              value={s.currency}
              onChange={(e) => set('currency', e.target.value)}
              className="w-full text-xs bg-[#090D17] border border-white/[0.08]"
            >
              <option>INR (₹)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs">
          <div className="text-slate-400">
            Feed Provider: <strong className="text-slate-200">{health.data?.provider ?? 'GMP Aggregator'}</strong>{' '}
            {health.data?.demoMode ? '(DEMO MODE)' : ''}
          </div>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={s.notifications}
              onChange={(e) => set('notifications', e.target.checked)}
              className="!w-auto rounded"
            />
            In-app pulse alerts
          </label>
        </div>
      </div>

      {/* ALERT RULES */}
      <div className="terminal-panel p-4 sm:p-5 space-y-3">
        <div className="card-label">GMP MOVEMENT ALERT THRESHOLDS</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block text-xs text-slate-400">
            GMP crosses (₹)
            <input
              value={s.gmpAbove}
              onChange={(e) => set('gmpAbove', e.target.value)}
              type="number"
              className="mt-1 text-xs bg-[#090D17] border border-white/[0.08]"
              placeholder="100"
            />
          </label>
          <label className="block text-xs text-slate-400">
            GMP swings by (₹)
            <input
              value={s.gmpMove}
              onChange={(e) => set('gmpMove', e.target.value)}
              type="number"
              className="mt-1 text-xs bg-[#090D17] border border-white/[0.08]"
              placeholder="20"
            />
          </label>
          <label className="block text-xs text-slate-400">
            Subscription crosses (x)
            <input
              value={s.subAbove}
              onChange={(e) => set('subAbove', e.target.value)}
              type="number"
              step="0.1"
              className="mt-1 text-xs bg-[#090D17] border border-white/[0.08]"
              placeholder="10x"
            />
          </label>
        </div>
        <p className="text-[10px] text-slate-500">
          Threshold alerts fire notifications whenever scraped grey market feeds exceed limits.
        </p>
      </div>

      {/* DATA EXPORT / BACKUP */}
      <div className="terminal-panel p-4 sm:p-5 space-y-3">
        <div className="card-label">DATA PORTABILITY &amp; BACKUP</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportJson}
            className="rounded-md bg-blue-600/20 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-600/30 transition"
          >
            Export JSON
          </button>
          <button
            onClick={exportCsv}
            className="rounded-md bg-white/[0.06] border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
          >
            Export CSV
          </button>
          <label className="cursor-pointer rounded-md bg-white/[0.06] border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition">
            Import Backup
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importFile(f);
              }}
            />
          </label>
        </div>
        {msg && <div className="text-xs text-emerald-400 font-medium">{msg}</div>}
      </div>
    </div>
  );
}
