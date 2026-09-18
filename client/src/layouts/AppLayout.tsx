import { NavLink, Outlet, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Briefcase, Activity, BarChart3, Wallet, CalendarDays, Settings as SettingsIcon, Plus, Menu, X, User, LogIn, LogOut
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
    <div className="fixed bottom-24 right-4 z-50 space-y-2 md:bottom-6">
      {toasts.map((t) => (
        <div key={t.id} className="glass w-72 !bg-[#0b1020]/95 p-3 border-emerald-500/30 shadow-2xl">
          <div className="text-sm font-bold text-emerald-300">{t.title}</div>
          <div className="whitespace-pre-line text-xs text-slate-300">{t.body}</div>
        </div>
      ))}
    </div>
  );
}

export function AppLayout({ onAdd }: { onAdd?: () => void }) {
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip">
      {/* Mobile top header bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#070b18]/90 px-3.5 py-2.5 sm:px-4 sm:py-3 backdrop-blur md:hidden w-full">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 font-black text-sm text-white shadow-lg shadow-blue-500/20">
            G
          </span>
          <div>
            <span className="text-base font-black tracking-tight text-white">GMPulse</span>
            <span className="ml-1 text-[10px] text-blue-400 font-medium">LIVE</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300"
            >
              <User size={13} />
              <span className="max-w-[70px] truncate">{user.name || user.email.split('@')[0]}</span>
            </button>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-300"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="rounded-lg border border-white/10 p-1.5 text-slate-300 hover:bg-white/5 active:scale-95"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-white/5 bg-[#070b18]/90 p-5 md:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 font-black">G</span>
          <div>
            <div className="text-sm font-bold">IPO Command Center</div>
            <div className="text-[11px] text-slate-500">GMPulse · Automated Tracker</div>
          </div>
        </div>
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

      {/* Main Content Area */}
      <div className="md:pl-60 w-full max-w-full">
        <main className="mx-auto max-w-6xl w-full px-3.5 py-3 pb-28 sm:p-5 md:p-8 md:pb-12">
          <Outlet />
        </main>
        <footer className="mx-auto max-w-6xl w-full px-3.5 pb-28 text-[11px] leading-relaxed text-slate-500 sm:px-5 md:px-8 md:pb-8">
          GMP and estimated listing prices are unofficial indicators and are not guaranteed. Actual listing prices may
          differ significantly. This dashboard is for personal tracking and informational purposes only.
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/10 bg-[#070b18]/95 px-2 py-1.5 backdrop-blur md:hidden safe-area-pb">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] min-w-[50px] transition ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/ipos"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] min-w-[50px] transition ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Briefcase size={20} />
          <span>My IPOs</span>
        </NavLink>

        <NavLink
          to="/gmp"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] min-w-[50px] transition ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Activity size={20} />
          <span>GMP</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] min-w-[50px] transition ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <CalendarDays size={20} />
          <span>Calendar</span>
        </NavLink>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] min-w-[50px] transition ${
            mobileMenuOpen ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu size={20} />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" />
          <div
            className="relative ml-auto flex h-full w-4/5 max-w-xs flex-col bg-[#0b1020] border-l border-white/10 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 font-bold text-white text-xs">
                  G
                </span>
                <span className="font-bold text-white">GMPulse Menu</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                      isActive ? 'bg-blue-500/20 text-blue-300 font-semibold' : 'text-slate-300 hover:bg-white/5'
                    }`
                  }
                >
                  <n.icon size={18} />
                  <span>{n.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-4">
              {user ? (
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[140px]">
                        {user.name || user.email}
                      </div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">● Neon Connected</div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 p-1"
                    >
                      <LogOut size={13} /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500 py-2.5 text-xs font-semibold text-white hover:bg-blue-600 transition"
                >
                  <LogIn size={15} /> Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Toasts />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
