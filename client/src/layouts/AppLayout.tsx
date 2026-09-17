import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Briefcase, Activity, BarChart3, Wallet, CalendarDays, Settings as SettingsIcon, Plus,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { AuthModal } from '../components/AuthModal.js';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/ipos', label: 'My IPOs', icon: Briefcase },
  { to: '/gmp', label: 'GMP Tracker', icon: Activity },
  { to: '/subscription', label: 'Subscription', icon: BarChart3 },
  { to: '/profit', label: 'Profit Tracker', icon: Wallet },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function Toasts() {
  const [toasts, setToasts] = useState<{ id: number; title: string; body: string }[]>([]);
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail as { title: string; body: string };
      const id = Date.now() + Math.random();
      setToasts((t) => [...t.slice(-2), { id, ...d }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
    };
    window.addEventListener('gmpulse-toast', h);
    return () => window.removeEventListener('gmpulse-toast', h);
  }, []);
  return (
    <div className="fixed bottom-20 right-4 z-50 space-y-2 md:bottom-6">
      {toasts.map((t) => (
        <div key={t.id} className="glass w-72 !bg-[#0b1020]/95 p-3">
          <div className="text-sm font-bold text-emerald-300">{t.title}</div>
          <div className="whitespace-pre-line text-xs text-slate-300">{t.body}</div>
        </div>
      ))}
    </div>
  );
}

export function AppLayout({ onAdd }: { onAdd: () => void }) {
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-white/5 bg-[#070b18]/90 p-5 md:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 font-black">G</span>
          <div>
            <div className="text-sm font-bold">IPO Command Center</div>
            <div className="text-[11px] text-slate-500">GMPulse · Personal</div>
          </div>
        </div>
        <button onClick={onAdd} className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-blue-500/90 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
          <Plus size={16} /> Add IPO
        </button>
        <nav className="mt-6 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
              }
            >
              <n.icon size={17} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs text-slate-400">
          {user ? (
            <div>
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-200 truncate">{user.name || user.email.split('@')[0]}</div>
                <button onClick={logout} className="text-[11px] text-slate-500 hover:text-red-400 transition">
                  Logout
                </button>
              </div>
              <div className="mt-0.5 text-[11px] text-emerald-400">● Neon Cloud Connected</div>
            </div>
          ) : (
            <div>
              <div className="font-semibold text-slate-200">Guest Mode</div>
              <div className="mt-1 flex gap-1.5">
                <button
                  onClick={() => setAuthOpen(true)}
                  className="w-full rounded-lg bg-blue-500/20 border border-blue-500/30 px-2.5 py-1.5 text-center text-xs font-semibold text-blue-300 hover:bg-blue-500/30 transition"
                >
                  Sign In / Register
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="md:pl-60">
        <main className="mx-auto max-w-6xl p-4 pb-24 md:p-8 md:pb-12">
          <Outlet />
        </main>
        <footer className="mx-auto max-w-6xl px-4 pb-24 text-[11px] leading-relaxed text-slate-500 md:px-8 md:pb-8">
          GMP and estimated listing prices are unofficial indicators and are not guaranteed. Actual listing prices may
          differ significantly. This dashboard is for personal tracking and informational purposes only.
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/10 bg-[#070b18]/95 px-2 py-2 backdrop-blur md:hidden">
        {NAV.slice(0, 5).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] ${isActive ? 'text-blue-300' : 'text-slate-500'}`}>
            <n.icon size={19} /> {n.label.split(' ')[0]}
          </NavLink>
        ))}
        <button onClick={onAdd} aria-label="Add IPO" className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 text-white">
          <Plus size={20} />
        </button>
      </nav>
      <Toasts />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
