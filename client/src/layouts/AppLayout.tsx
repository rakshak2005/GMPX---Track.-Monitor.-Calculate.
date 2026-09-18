import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  Radio, TrendingUp, BarChart3, BriefcaseBusiness, WalletCards, CalendarDays, Settings2, Menu, X, User, LogIn, LogOut, CheckCircle2, ShieldCheck, ExternalLink, Activity, type LucideIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { AuthModal } from '../components/AuthModal.js';

interface NavSection {
  title: string;
  items: { to: string; label: string; icon: LucideIcon; end?: boolean; isExternal?: boolean; badge?: string }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'MARKET',
    items: [
      { to: '/', label: 'Live IPOs', icon: Radio, end: true },
      { to: '/gmp', label: 'GMP Pulse', icon: TrendingUp },
      { to: '/subscription', label: 'Subscription', icon: BarChart3 },
      {
        to: 'https://www.nseindia.com/market-data/new-stock-exchange-listings-today',
        label: 'NSE Pre-Listing',
        icon: Activity,
        isExternal: true,
        badge: 'LIVE',
      },
    ],
  },
  {
    title: 'MY ACTIVITY',
    items: [
      { to: '/ipos', label: 'My IPO Book', icon: BriefcaseBusiness },
      { to: '/profit', label: 'Profit Tracker', icon: WalletCards },
      { to: '/allotment', label: 'Allotment Desk', icon: ShieldCheck },
      { to: '/calendar', label: 'IPO Calendar', icon: CalendarDays },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings2 },
    ],
  },
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
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-cyan-500/15 bg-[#090F1E]/95 px-3.5 py-2.5 backdrop-blur-md md:hidden w-full shadow-lg">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="GMPX"
            className="h-7 w-7 object-contain drop-shadow-[0_2px_10px_rgba(234,179,8,0.4)]"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-white">GMPX</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
              Indian IPO Intelligence
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300"
            >
              <User size={12} />
              <span className="max-w-[70px] truncate">{user.name || user.email.split('@')[0]}</span>
            </button>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/15 px-2 py-1 text-[11px] font-semibold text-blue-300"
            >
              <LogIn size={12} />
              <span>Sign In</span>
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="rounded-md border border-white/[0.08] p-1.5 text-slate-300 hover:bg-white/5 active:scale-95"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Desktop financial terminal sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-cyan-500/10 bg-gradient-to-b from-[#0B1124] via-[#090D1C] to-[#070A16] p-4 md:flex shadow-2xl z-20">
        {/* Brand identity */}
        <Link to="/" className="flex items-center gap-2.5 pb-4 border-b border-white/[0.08]">
          <img
            src="/logo.png"
            alt="GMPX"
            className="h-8 w-8 object-contain drop-shadow-[0_2px_12px_rgba(234,179,8,0.45)]"
          />
          <div>
            <div className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">GMPX</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80">
              Indian IPO Intelligence
            </div>
          </div>
        </Link>

        {/* Financial Terminal Navigation Rail */}
        <nav className="mt-4 flex-1 space-y-4 overflow-y-auto no-scrollbar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="px-2 pb-1.5 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((n) =>

                  n.isExternal ? (
                    <a
                      key={n.to}
                      href={n.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/[0.04] hover:text-cyan-300 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <n.icon
                          size={15}
                          className="shrink-0 text-amber-400 group-hover:text-amber-300 transition-colors animate-pulse"
                        />
                        <span className="truncate">{n.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {n.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                            {n.badge}
                          </span>
                        )}
                        <ExternalLink size={12} className="text-slate-500 group-hover:text-cyan-400 shrink-0" />
                      </div>
                    </a>
                  ) : (
                    <NavLink
                      key={n.to}
                      to={n.to}
                      end={n.end}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600/25 via-blue-500/15 to-transparent text-white font-semibold border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                            : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active blue left rail indicator */}
                          {isActive && (
                            <span className="absolute -left-4 top-1.5 bottom-1.5 w-[3.5px] rounded-r bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
                          )}
                          <n.icon
                            size={15}
                            className={`shrink-0 transition-colors ${
                              isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                            }`}
                          />
                          <span className="truncate">{n.label}</span>
                        </>
                      )}
                    </NavLink>
                  )
                )}
              </div>
            </div>
          ))}
        </nav>


        {/* Compact User / Status Terminal Area */}
        <div className="mt-auto pt-3 border-t border-white/[0.08]">
          {user ? (
            <div className="terminal-subpanel p-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="min-w-0 pr-1">
                  <div className="truncate text-xs font-bold text-slate-100">
                    {user.name || user.email.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-medium">Retail Investor</div>
                </div>
                <Link
                  to="/settings"
                  className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white transition"
                  title="Settings"
                >
                  <Settings2 size={14} />
                </Link>
              </div>
              <div className="mt-1.5 flex items-center justify-between border-t border-white/[0.06] pt-1.5 text-[10px]">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connected
                </span>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-red-400 transition font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="terminal-subpanel p-2.5 shadow-md">
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <div className="text-xs font-bold text-slate-200">Terminal Guest</div>
                  <div className="text-[10px] text-slate-400">Local Session</div>
                </div>
                <Link to="/settings" className="p-1 text-slate-400 hover:text-white">
                  <Settings2 size={14} />
                </Link>
              </div>
              <button
                onClick={() => setAuthOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 rounded-md bg-blue-600/25 border border-blue-500/40 py-1.5 text-center text-xs font-semibold text-blue-200 hover:bg-blue-600/40 transition shadow-[0_0_12px_rgba(59,130,246,0.3)]"
              >
                <LogIn size={12} /> Sign In
              </button>
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
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/[0.08] bg-[#090D17]/95 px-2 py-1.5 backdrop-blur md:hidden safe-area-pb">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] min-w-[50px] transition ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Radio size={18} />
          <span>Live IPOs</span>
        </NavLink>

        <NavLink
          to="/ipos"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] min-w-[50px] transition ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <BriefcaseBusiness size={18} />
          <span>IPO Book</span>
        </NavLink>

        <NavLink
          to="/gmp"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] min-w-[50px] transition ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <TrendingUp size={18} />
          <span>Pulse</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] min-w-[50px] transition ${
              isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <CalendarDays size={18} />
          <span>Calendar</span>
        </NavLink>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] min-w-[50px] transition ${
            mobileMenuOpen ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu size={18} />
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
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="GMPX"
                  className="h-7 w-7 object-contain drop-shadow-[0_2px_8px_rgba(234,179,8,0.35)]"
                />
                <div>
                  <div className="font-bold text-white tracking-tight text-sm">GMPX</div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">IPO Terminal</div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="mt-4 flex-1 space-y-3.5 overflow-y-auto no-scrollbar">
              {NAV_SECTIONS.map((section) => (
                <div key={section.title}>
                  <div className="px-2 pb-1 text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                    {section.title}
                  </div>
                  <div className="space-y-0.5">
                    {section.items.map((n) =>
                      n.isExternal ? (
                        <a
                          key={n.to}
                          href={n.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-cyan-300 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            <n.icon size={15} className="text-amber-400" />
                            <span>{n.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {n.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                                {n.badge}
                              </span>
                            )}
                            <ExternalLink size={12} className="text-slate-500" />
                          </div>
                        </a>
                      ) : (
                        <NavLink
                          key={n.to}
                          to={n.to}
                          end={n.end}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
                              isActive
                                ? 'bg-blue-500/20 text-blue-300 font-semibold border-l-2 border-blue-500'
                                : 'text-slate-300 hover:bg-white/5'
                            }`
                          }
                        >
                          <n.icon size={15} />
                          <span>{n.label}</span>
                        </NavLink>
                      )
                    )}
                  </div>

                </div>
              ))}
            </nav>

            <div className="mt-auto border-t border-white/[0.08] pt-3">
              {user ? (
                <div className="rounded-lg bg-[#101521] border border-white/[0.08] p-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[130px] uppercase">
                        {user.name || user.email.split('@')[0]}
                      </div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">● Connected</div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 p-1"
                    >
                      <LogOut size={12} /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600/30 border border-blue-500/40 py-2 text-xs font-semibold text-blue-200 hover:bg-blue-600/40 transition"
                >
                  <LogIn size={13} /> Sign In
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
