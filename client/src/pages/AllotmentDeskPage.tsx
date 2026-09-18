import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Clock, RefreshCw, CheckCircle2, XCircle, Search, AlertCircle, ExternalLink, Copy, Check, MessageSquare, Send, Mail } from 'lucide-react';

import { useIpos } from '../hooks/useIpos.js';
import { useAuth } from '../hooks/useAuth.js';
import { api } from '../services/api.js';
import { inr, fmtDate } from '../utils/format.js';
import type { Ipo } from '../types/ipo.js';

interface CheckResultModal {
  ipoName: string;
  found: boolean;
  status: string;
  registrar: string;
  pan: string;
  applicantName?: string;
  appliedShares?: number;
  allottedShares?: number;
  message?: string;
  appNo?: string;
  dpClid?: string;
}

function getRegistrarPortal(registrarName?: string | null): { name: string; url: string } {
  const r = (registrarName || '').toLowerCase();
  if (r.includes('kfin')) {
    return { name: 'KFin Technologies', url: 'https://ipostatus.kfintech.com/' };
  }
  if (r.includes('bigshare')) {
    return { name: 'Bigshare Services', url: 'https://ipo.bigshareonline.com/IPO_Status.html' };
  }
  if (r.includes('mufg') || r.includes('link intime') || r.includes('linkintime')) {
    return { name: 'MUFG Intime India', url: 'https://in.mpms.mufg.com/Initial_Offer/public-issues.html' };
  }
  return { name: registrarName || 'Registrar Portal', url: 'https://in.mpms.mufg.com/Initial_Offer/public-issues.html' };
}

function normalizeIpoName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/\s*-\s*(ipo|sme|mainboard)\b/gi, '')
    .replace(/\s+(public\s+issue|initial\s+public\s+offering|ipo|sme)\b/gi, '')
    .replace(/\s+(india|private|pvt|limited|ltd|corp|corporation|industries|holdings|enterprises)\b/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isNameMatch(siteName: string, registrarName: string): boolean {
  const a = normalizeIpoName(siteName);
  const b = normalizeIpoName(registrarName);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  const aTokens = a.split(' ').filter((w) => w.length > 2);
  const bTokens = b.split(' ').filter((w) => w.length > 2);
  if (aTokens.length === 0 || bTokens.length === 0) return false;
  const matchCount = aTokens.filter((token) => bTokens.some((bt) => bt.includes(token) || token.includes(bt))).length;
  return matchCount / aTokens.length >= 0.6 || matchCount / bTokens.length >= 0.6;
}

export function AllotmentDeskPage() {
  const { user, updatePreferences } = useAuth();
  const qc = useQueryClient();
  const { data: ipos, isLoading } = useIpos('?appliedOnly=true');

  const [pan, setPan] = useState(() => user?.preferences?.pan || localStorage.getItem('gmpx_investor_pan') || '');
  const [copiedPan, setCopiedPan] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [modalResult, setModalResult] = useState<CheckResultModal | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');

  // Alerts State (Gmail)
  const [gmailAddress, setGmailAddress] = useState(() => localStorage.getItem('gmpx_gmail_address') || '');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [alertStatus, setAlertStatus] = useState<string | null>(null);
  const [showAlertSetup, setShowAlertSetup] = useState(false);

  // Periodically query active registrar dropdowns
  const { data: regIssues } = useQuery({
    queryKey: ['registrar-issues'],
    queryFn: () => api.getRegistrarIssues(),
    refetchInterval: 30000,
    staleTime: 20000,
  });


  const handleTestEmail = async () => {
    if (!gmailAddress.trim() || !gmailAddress.includes('@')) {
      setAlertStatus('❌ Please enter a valid Gmail address.');
      return;
    }
    setIsSendingEmail(true);
    setAlertStatus(null);
    try {
      localStorage.setItem('gmpx_gmail_address', gmailAddress.trim());
      if (user) {
        await updatePreferences({ alertEmail: gmailAddress.trim() });
      }
      const res = await api.testEmail(gmailAddress.trim());
      if (res.success) {
        setAlertStatus('✅ Gmail Connected! Test alert email sent successfully to ' + gmailAddress.trim());
      } else {
        setAlertStatus(`⚠️ ${res.message}`);
      }
    } catch (e) {
      setAlertStatus(`❌ ${(e as Error).message}`);
    } finally {
      setIsSendingEmail(false);
    }

  };


  const handleCopyPan = (textToCopy?: string) => {
    const val = textToCopy || pan.trim().toUpperCase();
    if (val) {
      navigator.clipboard.writeText(val);
      setCopiedPan(true);
      setTimeout(() => setCopiedPan(false), 2500);
    }
  };

  const handleSavePan = async () => {
    const p = pan.trim().toUpperCase();
    localStorage.setItem('gmpx_investor_pan', p);
    if (user) {
      await updatePreferences({ pan: p });
    }
  };

  const handleCheckAllotment = async (ipo: Ipo) => {
    const cleanPan = pan.trim().toUpperCase();
    if (!cleanPan || cleanPan.length < 10) {
      setErrorMsg('Please enter a valid 10-character PAN to query registrar allotment.');
      return;
    }
    setErrorMsg('');
    setCheckingId(ipo.id);

    try {
      // Save PAN if not saved
      handleSavePan();

      const res = await api.checkAllotment(ipo.id, cleanPan);
      setModalResult({
        ipoName: ipo.name,
        found: res.found,
        status: res.status,
        registrar: res.registrar,
        pan: res.pan || cleanPan,
        applicantName: res.applicantName,
        appliedShares: res.appliedShares,
        allottedShares: res.allottedShares,
        message: res.message,
        appNo: res.appNo,
        dpClid: res.dpClid,
      });

      // Invalidate queries so status changes reflect immediately
      await qc.invalidateQueries({ queryKey: ['ipos'] });
      await qc.invalidateQueries({ queryKey: ['summary'] });
    } catch (e) {
      setErrorMsg((e as Error).message || 'Failed to check registrar allotment.');
    } finally {
      setCheckingId(null);
    }
  };

  const appliedList = (ipos || []).filter((i) => i.isApplied || (i.lotsApplied ?? 0) > 0);
  const filtered = appliedList.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) || (i.companyName ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="border-b border-white/[0.07] pb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">ALLOTMENT DESK</h1>
          <span className="rounded bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
            AUTO REGISTRAR PIPELINE
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Automated registrar checking (KFintech, Link Intime, Bigshare) • Polls every 1 min from 7:00 PM on allotment dates
        </p>
      </div>

      {/* PAN Credential & Auto-Poller Status Strip */}
      <div className="terminal-panel p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>INVESTOR PAN FOR ALLOTMENT</span>
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                  ACTIVE
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Used to verify allotment against registrar databases
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={10}
              placeholder="ENTER PAN"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              onBlur={handleSavePan}
              className="w-36 text-xs uppercase font-mono tracking-wider bg-[#080D1A] border border-cyan-500/30 text-cyan-300 font-bold px-2.5 py-1.5 rounded-md"
            />
            <button
              onClick={handleSavePan}
              className="rounded-md bg-blue-600/25 border border-blue-500/40 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-600/40 transition active:scale-95"
            >
              Update
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-2 border-t border-white/[0.06] text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              7:00 PM Auto-Poller: Ready
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-slate-400" />
              Check Frequency: Every 1 min on allotment date
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">
              Supported: KFintech, Link Intime, Bigshare
            </span>
          </div>

          <button
            onClick={() => setShowAlertSetup(!showAlertSetup)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition text-xs font-semibold"
          >
            <Mail size={13} className="text-amber-400" />
            <span>{gmailAddress ? '✉️ Gmail Alerts: Configured' : '✉️ Configure Gmail Allotment Alerts'}</span>
          </button>
        </div>

        {/* Expandable Gmail Setup Drawer */}
        {showAlertSetup && (
          <div className="mt-3 p-4 rounded-lg bg-[#0c1220] border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-bold text-xs text-white">Automated Gmail Allotment Alerts</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  100% FREE • OFFICIAL SMTP
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Receive real-time allotment alerts directly to your inbox the moment registrars (KFintech, Link Intime, Bigshare) declare your allotment results.
            </p>

            {/* Gmail Card */}
            <div className="bg-[#080D1A] p-3.5 rounded-lg border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-amber-400" />
                <span className="font-semibold text-xs text-white">Instant Email Delivery</span>
                <span className="text-[10px] text-emerald-400 ml-auto font-mono">Real-Time Delivery</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Detailed allotment reports including shares allotted, registrar status, and UPI mandate lien release details.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-slate-400 block mb-1">YOUR EMAIL ADDRESS</label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@gmail.com"
                    value={gmailAddress}
                    onChange={(e) => setGmailAddress(e.target.value)}
                    className="w-full text-xs font-mono bg-[#0c1220] border border-amber-500/30 text-white px-2.5 py-1.5 rounded-md focus:border-amber-400 outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleTestEmail}
                    disabled={isSendingEmail}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow transition disabled:opacity-50"
                  >
                    <Mail size={12} className={isSendingEmail ? 'animate-spin' : ''} />
                    <span>{isSendingEmail ? 'Sending Email...' : 'Save & Send Test Email'}</span>
                  </button>
                </div>
              </div>
            </div>

            {alertStatus && (
              <div className={`p-2.5 rounded text-xs border ${alertStatus.startsWith('✅') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                {alertStatus}
              </div>
            )}
          </div>
        )}



        {errorMsg && (
          <div className="flex items-center gap-2 rounded-md bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Applied IPO Allotment Feed */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="card-label">APPLICATIONS IN ALLOTMENT QUEUE ({filtered.length})</div>
          <div className="relative max-w-xs w-full">
            <input
              placeholder="Search active issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 text-xs bg-[#101521] border border-white/[0.08]"
            />
            <Search size={13} className="absolute left-2.5 top-3 text-slate-500" />
          </div>
        </div>

        {isLoading ? (
          <div className="terminal-panel p-6"><div className="skeleton h-36 w-full" /></div>
        ) : filtered.length === 0 ? (
          <div className="terminal-panel p-8 text-center text-xs text-slate-400 space-y-2">
            <div className="font-bold text-slate-200 text-sm">No Active Applications to Verify</div>
            <p className="max-w-md mx-auto text-slate-400">
              Apply for IPOs from the Live Market to automatically verify allotment status and monitor registrar drops.
            </p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1 rounded-md bg-blue-600/20 border border-blue-500/30 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-600/30 transition"
              >
                Browse Live IPO Market →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((ipo) => {
              const isAllotted = ipo.status === 'Allotted';
              const isNotAllotted = ipo.status === 'Not Allotted';
              const isChecking = checkingId === ipo.id;

              return (
                <div
                  key={ipo.id}
                  className="terminal-panel p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-cyan-500/30 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/ipo/${ipo.id}`} className="font-bold text-white text-base hover:text-cyan-300 transition">
                        {ipo.name}
                      </Link>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border ${
                          isAllotted
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                            : isNotAllotted
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        {ipo.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span>Applied: <strong className="text-slate-200 num">{ipo.lotsApplied} Lots ({ipo.lotsApplied * (ipo.lotSize || 15)} sh)</strong></span>
                      <span className="text-slate-600">•</span>
                      <span>Capital Blocked: <strong className="text-slate-200 num">{inr((ipo.lotsApplied || 1) * (ipo.lotSize || 15) * (ipo.issuePrice || 0))}</strong></span>
                      <span className="text-slate-600">•</span>
                      <span>Allotment Date: <strong className="text-slate-200">{fmtDate(ipo.allotmentDate)}</strong></span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-slate-400">Registrar:</span>
                      {(() => {
                        const portal = getRegistrarPortal(ipo.registrar);
                        const isBigshareReleased = Boolean(
                          regIssues?.bigshare?.some((b) => isNameMatch(ipo.companyName || ipo.name, b.name))
                        );

                        return (
                          <div className="flex items-center gap-2">
                            <a
                              href={portal.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 hover:border-cyan-400/60 hover:text-cyan-200 px-2 py-0.5 rounded text-[11px] transition shadow-sm"
                              title={`Open official ${portal.name} allotment portal`}
                            >
                              <span>🏛️ {ipo.registrar || portal.name}</span>
                              <ExternalLink size={10} className="opacity-70" />
                            </a>

                            {isBigshareReleased && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)] animate-pulse">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                ALLOTMENT RELEASED ON BIGSHARE
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {(() => {
                      const portal = getRegistrarPortal(ipo.registrar);
                      const isBigshareOnly = portal.name.includes('Bigshare');
                      const isBigshareReleased = Boolean(
                        regIssues?.bigshare?.some((b) => isNameMatch(ipo.companyName || ipo.name, b.name))
                      );

                      if (isBigshareOnly) {
                        return (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <a
                              href={portal.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => handleCopyPan()}
                              className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold text-white shadow-md transition active:scale-95 ${
                                isBigshareReleased
                                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:brightness-110 shadow-[0_0_15px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400'
                                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500'
                              }`}
                              title="Copies your PAN to clipboard and opens official verification server"
                            >
                              <ExternalLink size={13} />
                              <span>
                                {isBigshareReleased ? '⚡ Allotment Released! Query on Bigshare' : 'Query on Bigshare (Auto-Copies PAN)'}
                              </span>
                            </a>
                            <button
                              onClick={() => handleCopyPan()}
                              className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 bg-white/5 border border-white/10 px-2 py-2 rounded-md transition"
                              title="Copy PAN to clipboard"
                            >
                              {copiedPan ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                              <span>{copiedPan ? 'Copied' : 'Copy PAN'}</span>
                            </button>
                          </div>
                        );
                      }

                      return (
                        <button
                          onClick={() => handleCheckAllotment(ipo)}
                          disabled={isChecking}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-blue-600 to-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition disabled:opacity-50"
                        >
                          <RefreshCw size={13} className={isChecking ? 'animate-spin' : ''} />
                          {isChecking ? 'Checking Registrar...' : 'Check Allotment Now'}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Check Result Modal */}
      {modalResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setModalResult(null)}
        >
          <div
            className="terminal-panel max-w-md w-full p-6 shadow-2xl space-y-4 border-cyan-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                {modalResult.status === 'ALLOTTED' ? (
                  <CheckCircle2 size={22} className="text-emerald-400" />
                ) : modalResult.status === 'NOT_ALLOTTED' ? (
                  <XCircle size={22} className="text-rose-400" />
                ) : (
                  <Clock size={22} className="text-amber-400" />
                )}
                <div>
                  <h3 className="font-black text-white text-base">{modalResult.ipoName}</h3>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Registrar: {modalResult.registrar}
                  </div>
                </div>
              </div>
              <span
                className={`rounded px-2.5 py-1 text-xs font-extrabold border ${
                  modalResult.status === 'ALLOTTED'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : modalResult.status === 'NOT_ALLOTTED'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                }`}
              >
                {modalResult.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {modalResult.applicantName && (
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Applicant:</span>
                  <span className="font-semibold text-white">{modalResult.applicantName}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">PAN Queried:</span>
                <span className="font-mono font-semibold text-cyan-300">{modalResult.pan}</span>
              </div>
              {modalResult.appNo && (
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Application No:</span>
                  <span className="font-mono text-slate-200">{modalResult.appNo}</span>
                </div>
              )}
              {modalResult.appliedShares !== undefined && (
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Shares Applied:</span>
                  <span className="font-semibold text-slate-200 num">{modalResult.appliedShares}</span>
                </div>
              )}
              {modalResult.allottedShares !== undefined && (
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Shares Allotted:</span>
                  <span
                    className={`font-black text-sm num ${
                      modalResult.allottedShares > 0 ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {modalResult.allottedShares}
                  </span>
                </div>
              )}
              {modalResult.message && (
                <div className="rounded-lg bg-black/40 border border-white/[0.06] p-3 text-xs text-slate-300 mt-2">
                  {modalResult.message}
                </div>
              )}
            </div>

            <button
              onClick={() => setModalResult(null)}
              className="w-full rounded-md bg-white/[0.08] hover:bg-white/[0.14] py-2 text-xs font-bold text-white transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
