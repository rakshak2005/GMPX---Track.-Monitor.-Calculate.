import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useGmpHistory, useIpo, useIpoMutations, useSubHistory } from '../hooks/useIpos.js';
import { api } from '../services/api.js';
import { GmpChart } from '../components/GmpChart.js';
import { SubscriptionCard, SubscriptionChart } from '../components/SubscriptionChart.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { Countdown } from '../components/Countdown.js';
import { DeleteConfirmation, EditIpoModal } from '../components/IpoModals.js';
import { Tooltip } from '../components/Tooltip.js';
import { fmtDate, fmtTime, inr, money, pct, timeAgo } from '../utils/format.js';
import { calculateEstimatedProfit, determineMarketStatus } from '../utils/calculations.js';
import type { Ipo } from '../types/ipo.js';

const STATUSES = ['Applied', 'Allotment Pending', 'Allotted', 'Not Allotted', 'Refund Pending', 'Listed', 'Sold'];

function GmpHero({ ipo }: { ipo: Ipo }) {
  const g = ipo.currentGmp;
  return (
    <div className="glass grid gap-4 p-5 md:grid-cols-3">
      <div>
        <div className="card-label"><Tooltip label="Grey Market Premium. An unofficial indicator of potential listing sentiment.">CURRENT GMP</Tooltip></div>
        {g == null ? (
          <div className="mt-1 text-sm text-slate-400">GMP unavailable<div className="text-xs">Unable to fetch latest GMP data.</div></div>
        ) : (
          <div className={`num mt-1 text-3xl font-black ${g >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{money(g)}</div>
        )}
        <div className={`num text-sm ${g != null && g >= 0 ? 'text-emerald-300/80' : 'text-red-300/80'}`}>{pct(ipo.gmpPct)}</div>
        <div className="mt-2 text-xs text-slate-500">Source: {ipo.gmpSource ?? '—'} · Last updated: {fmtTime(ipo.lastGmpAt)} ({timeAgo(ipo.lastGmpAt)})</div>
      </div>
      <div>
        <div className="card-label"><Tooltip label="Issue Price + Current GMP. This is an estimate and is not guaranteed.">ESTIMATED LISTING PRICE</Tooltip></div>
        <div className="num mt-1 text-3xl font-black">{ipo.estListing != null ? inr(ipo.estListing) : '₹---'}</div>
        <div className="mt-2 text-xs text-slate-500">Issue price {inr(ipo.issuePrice)}</div>
      </div>
      <div>
        <div className="card-label"><Tooltip label="Estimated gross profit based on the current GMP and your expected allotted quantity.">ESTIMATED PROFIT</Tooltip></div>
        <div className={`num mt-1 text-3xl font-black ${(ipo.estProfit ?? 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
          {ipo.estProfit != null ? money(ipo.estProfit) : '₹---'}
        </div>
        <div className="mt-2 text-xs text-slate-500">Potential listing gain {pct(ipo.gmpPct)} · estimate, not guaranteed</div>
      </div>
    </div>
  );
}

function ListingDay({ ipo, onSave, saving }: { ipo: Ipo; onSave: (p: unknown) => void; saving: boolean }) {
  const [price, setPrice] = useState(ipo.actualListingPrice ? String(ipo.actualListingPrice) : '');
  const isListingDay = ipo.listingDate ? new Date(ipo.listingDate).toISOString().slice(0, 10) <= new Date().toISOString().slice(0, 10) : false;
  if (!isListingDay && ipo.status !== 'Listed' && !ipo.actualListingPrice) return null;
  const qty = (ipo.allottedLots ?? ipo.lotsApplied) * ipo.lotSize;
  const actual = price ? Number(price) : null;
  const gainPct = actual != null ? Math.round(((actual - ipo.issuePrice) / ipo.issuePrice) * 100 * 100) / 100 : null;
  const actualProfit = actual != null ? (actual - ipo.issuePrice) * qty : null;
  return (
    <div className="glass border !border-violet-400/30 p-5">
      <div className="text-sm font-black tracking-widest text-violet-300">LISTING DAY</div>
      <div className="mt-3 grid gap-4 sm:grid-cols-4">
        <div><div className="card-label">ISSUE PRICE</div><div className="num text-xl font-bold">{inr(ipo.issuePrice)}</div></div>
        <div>
          <div className="card-label">CURRENT MARKET PRICE</div>
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter actual…" type="number" className="!w-36" />
        </div>
        <div><div className="card-label">LISTING GAIN</div><div className="num text-xl font-bold text-emerald-300">{pct(gainPct)}</div></div>
        <div><div className="card-label">ACTUAL PROFIT</div><div className="num text-xl font-bold text-emerald-300">{actualProfit != null ? money(actualProfit) : '---'}</div></div>
      </div>
      <button disabled={saving || !price} onClick={() => onSave({ actualListingPrice: Number(price) })} className="mt-3 rounded-lg bg-violet-500 px-4 py-2 text-sm font-semibold disabled:opacity-50">
        Save listing price
      </button>
      <p className="mt-2 text-[11px] text-slate-500">Enter the actual listing price manually — never fabricated by the app.</p>
    </div>
  );
}

export function IpoDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: ipo, isLoading, refetch } = useIpo(id);
  const [range, setRange] = useState('ALL');
  const history = useGmpHistory(id, range);
  const subHist = useSubHistory(id);
  const { update, remove, setStatus } = useIpoMutations();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [allotted, setAllotted] = useState('');

  if (isLoading) return <div className="glass p-6"><div className="skeleton h-64 w-full" /></div>;
  if (!ipo) return <div className="glass p-8 text-center text-sm text-slate-400">IPO not found.</div>;

  const qty = ipo.lotSize * ipo.lotsApplied;
  const invested = ipo.issuePrice * qty;
  const profitOnAllotted = ipo.status === 'Allotted' && ipo.allottedLots
    ? calculateEstimatedProfit(ipo.currentGmp, ipo.lotSize, ipo.allottedLots)
    : null;

  return (
    <div className="space-y-5">
      <button onClick={() => nav(-1)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"><ArrowLeft size={14} /> Back</button>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">{ipo.name}</h1>
          <div className="mt-1 text-sm text-slate-400">{ipo.companyName || 'IPO Tracking'} · Listing {fmtDate(ipo.listingDate)}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={ipo.status} />
            {(() => {
              const mStatus = determineMarketStatus(null, ipo.notes, ipo.marketStatus);
              return (
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    mStatus === 'Open'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : mStatus === 'Closed'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-slate-700/50 text-slate-300 border-white/10'
                  }`}
                >
                  {mStatus}
                </span>
              );
            })()}
            <Countdown target={ipo.closeDate} prefix="closes in" />
            <Countdown target={ipo.listingDate} prefix="listing in" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs"><Pencil size={13} /> Edit</button>
          <button onClick={() => setDeleting(true)} className="flex items-center gap-1 rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-300"><Trash2 size={13} /> Delete</button>
        </div>
      </div>

      {ipo.gmpStale && (
        <div className="glass border !border-amber-400/30 p-4 text-sm text-amber-200">
          Data temporarily unavailable — last successful update {fmtTime(ipo.lastGmpAt)}. Last known GMP: {ipo.currentGmp != null ? `₹${ipo.currentGmp}` : '—'}.
          <button onClick={() => api.gmpHistory(ipo.id).then(() => refetch())} className="ml-3 underline">Retry</button>
        </div>
      )}

      <GmpHero ipo={ipo} />
      <ListingDay ipo={ipo} saving={update.isPending} onSave={(p) => update.mutate({ id: ipo.id, payload: p })} />

      <div className="glass p-5">
        <div className="card-label">APPLICATION</div>
        <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
          <div><div className="text-slate-500">Price</div><div className="num font-semibold">{inr(ipo.issuePrice)}</div></div>
          <div><div className="text-slate-500">Lot size</div><div className="num font-semibold">{ipo.lotSize}</div></div>
          <div><div className="text-slate-500">Lots applied</div><div className="num font-semibold">{ipo.lotsApplied}</div></div>
          <div><div className="text-slate-500">Quantity</div><div className="num font-semibold">{qty}</div></div>
          <div><div className="text-slate-500">Invested</div><div className="num font-semibold">{inr(invested)}</div></div>
        </div>
        <div className="mt-4 grid gap-3 border-t border-white/5 pt-4 sm:grid-cols-3">
          <label className="block text-xs">Allotment status
            <select value={ipo.status} onChange={(e) => setStatus.mutate({ id: ipo.id, status: e.target.value })} className="mt-1">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block text-xs">Allotted lots (actual)
            <span className="flex gap-2">
              <input value={allotted} onChange={(e) => setAllotted(e.target.value)} type="number" min={0} placeholder={String(ipo.allottedLots ?? '')} className="mt-1" />
              <button onClick={() => update.mutate({ id: ipo.id, payload: { allottedLots: allotted === '' ? null : Number(allotted) } })} className="mt-1 rounded-lg bg-white/10 px-3 text-xs">Save</button>
            </span>
          </label>
          <div className="text-xs text-slate-400">Applied <strong className="text-white num">{ipo.lotsApplied} lot{ipo.lotsApplied > 1 ? 's' : ''}</strong> · Allotted <strong className="text-white num">{ipo.allottedLots ?? '—'} lot{(ipo.allottedLots ?? 0) === 1 ? '' : 's'}</strong>
            {profitOnAllotted != null && <div className="mt-1">Est. profit on allotted: <strong className="text-emerald-300 num">{money(profitOnAllotted)}</strong></div>}
          </div>
        </div>
      </div>

      <GmpChart data={history.data?.data ?? []} stats={history.data?.stats ?? null} range={range} onRange={setRange} loading={history.isLoading} />

      <div className="grid gap-5 md:grid-cols-2">
        <SubscriptionCard ipo={ipo} />
        <div className="glass p-5">
          <div className="card-label">UPDATE SUBSCRIPTION</div>
          <SubForm ipoId={ipo.id} current={ipo.subscription ?? {}} />
        </div>
      </div>
      <SubscriptionChart history={subHist.data ?? []} />

      <div className="glass p-5">
        <div className="card-label">MY NOTES</div>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{ipo.notes || 'No notes yet.'}</p>
      </div>

      <EditIpoModal ipo={editing ? ipo : null} onClose={() => setEditing(false)} saving={update.isPending}
        onSave={(p) => update.mutate({ id: ipo.id, payload: p }, { onSuccess: () => setEditing(false) })} />
      {deleting && <DeleteConfirmation name={ipo.name} onClose={() => setDeleting(false)} deleting={remove.isPending}
        onConfirm={() => remove.mutate(ipo.id, { onSuccess: () => nav('/') })} />}
    </div>
  );
}

function SubForm({ ipoId, current }: { ipoId: string; current: NonNullable<Ipo['subscription']> }) {
  const [f, setF] = useState({ retail: current.retail ?? '', nii: current.nii ?? '', qib: current.qib ?? '', employee: current.employee ?? '', total: current.total ?? '', label: '' });
  const [msg, setMsg] = useState('');
  const num = (v: string) => (v === '' ? null : Number(v));
  return (
    <div className="mt-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {(['retail', 'nii', 'qib', 'employee', 'total'] as const).map((k) => (
          <label key={k} className="block text-xs capitalize text-slate-400">{k}
            <input type="number" min={0} step="0.01" value={String(f[k])} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="mt-1" />
          </label>
        ))}
      </div>
      <input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder="Label (Day 1, Day 2, Final…)" />
      <button
        onClick={() => api.setSubscription(ipoId, { retail: num(String(f.retail)), nii: num(String(f.nii)), qib: num(String(f.qib)), employee: num(String(f.employee)), total: num(String(f.total)), label: f.label }).then(() => setMsg('Saved.')).catch((e) => setMsg(e.message))}
        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold"
      >
        Save snapshot
      </button>
      {msg && <div className="text-xs text-slate-400">{msg}</div>}
    </div>
  );
}
