import type { Request, Response, NextFunction } from 'express';
import { validateIpoInput } from '../utils/calculations.js';
import {
  appendSubHistory,
  createIpo, deleteIpo, getIpo, getSubHistory, listIpos, updateIpo,
} from '../services/ipoStore.js';
import { refreshGmpForIpo } from '../services/gmpService.js';

const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

const ALLOWED_SORT = new Set(['gmp', 'gmpPct', 'profit', 'subscription', 'listingDate', 'investment', 'createdAt', 'name']);

function derived(ipo: Record<string, unknown>) {
  const issuePrice = Number(ipo.issuePrice ?? 0);
  const lotSize = Number(ipo.lotSize ?? 0);
  const lotsApplied = Number(ipo.lotsApplied ?? 0);
  const gmp = (ipo.currentGmp as number | null) ?? null;
  const qty = lotSize > 0 && lotsApplied > 0 ? lotSize * lotsApplied : 0;
  const investment = qty > 0 ? issuePrice * qty : 0;
  const gmpPct = gmp !== null && issuePrice > 0 ? Math.round((gmp / issuePrice) * 100 * 100) / 100 : null;
  const estListing = gmp !== null ? issuePrice + gmp : null;
  const estProfit = gmp !== null && qty > 0 ? gmp * qty : gmp !== null ? 0 : null;
  const lotProfit = gmp !== null && lotSize > 0 ? gmp * lotSize : null;
  return { quantity: qty, investment, gmpPct, estListing, estProfit, lotProfit };
}

export const listIposHandler = wrap(async (req: any, res) => {
  const { search = '', status = 'All', sort = '', order = 'desc', appliedOnly } = req.query as Record<string, string>;
  const userId = req.userId;
  let ipos = await listIpos(userId);
  if (appliedOnly === 'true') {
    ipos = ipos.filter((i) => i.isApplied === true || (i.status !== 'Available' && (i.lotsApplied ?? 0) > 0));
  }
  if (search) {
    const s = String(search).toLowerCase();
    ipos = ipos.filter((i) => i.name.toLowerCase().includes(s) || String(i.companyName ?? '').toLowerCase().includes(s));
  }
  if (status && status !== 'All') ipos = ipos.filter((i) => i.status === status);
  const withDerived = ipos.map((i) => ({ ...i, ...derived(i as unknown as Record<string, unknown>) }));
  if (sort && ALLOWED_SORT.has(sort)) {
    const dir = order === 'asc' ? 1 : -1;
    const val = (r: Record<string, unknown>) => {
      switch (sort) {
        case 'gmp': return (r.currentGmp as number | null) ?? -Infinity;
        case 'gmpPct': return (r.gmpPct as number | null) ?? -Infinity;
        case 'profit': return (r.estProfit as number | null) ?? -Infinity;
        case 'subscription': return Number((r.subscription as { total?: number | null } | undefined)?.total ?? -Infinity);
        case 'listingDate': return r.listingDate ? +new Date(r.listingDate as string) : Infinity;
        case 'investment': return Number(r.investment ?? 0);
        case 'name': return String(r.name);
        default: return String(r.createdAt ?? '');
      }
    };
    withDerived.sort((a, b) => {
      const va = val(a as unknown as Record<string, unknown>);
      const vb = val(b as unknown as Record<string, unknown>);
      if (typeof va === 'string') return va.localeCompare(String(vb)) * dir;
      return (Number(va) - Number(vb)) * dir;
    });
  }
  res.json({ data: withDerived });
});

export const applyIpoHandler = wrap(async (req: any, res) => {
  const { applied = true, lotsApplied = 1, issuePrice } = req.body ?? {};
  const ipo = await getIpo(req.params.id, req.userId);
  if (!ipo) return res.status(404).json({ error: 'IPO not found.' });

  const userId = req.userId || '00000000-0000-0000-0000-000000000000';
  const { setUserIpoApplication } = await import('../services/ipoStore.js');
  await setUserIpoApplication(userId, req.params.id, Boolean(applied), Number(lotsApplied) || 1, issuePrice ? Number(issuePrice) : undefined);

  const updated = await getIpo(req.params.id, req.userId);
  res.json({ data: { ...updated!, ...derived(updated as unknown as Record<string, unknown>) } });
});

export const syncLiveHandler = wrap(async (_req, res) => {
  const { syncLiveIpos } = await import('../services/scraperService.js');
  const result = await syncLiveIpos();
  res.json({ data: result });
});

export const createIpoHandler = wrap(async (req, res) => {
  const err = validateIpoInput(req.body ?? {});
  if (err) return res.status(400).json({ error: err });
  const created = await createIpo(req.body ?? {});
  // Best-effort initial GMP fetch (non-blocking for response correctness).
  refreshGmpForIpo(created.id, true).catch(() => undefined);
  const fresh = (await getIpo(created.id)) ?? created;
  res.status(201).json({ data: { ...fresh, ...derived(fresh as unknown as Record<string, unknown>) } });
});

export const getIpoHandler = wrap(async (req, res) => {
  const ipo = await getIpo(req.params.id);
  if (!ipo) return res.status(404).json({ error: 'IPO not found.' });
  res.json({ data: { ...ipo, ...derived(ipo as unknown as Record<string, unknown>) } });
});

export const updateIpoHandler = wrap(async (req, res) => {
  const body = req.body ?? {};
  if (body.issuePrice !== undefined && !(Number(body.issuePrice) > 0))
    return res.status(400).json({ error: 'Issue price must be positive.' });
  const updated = await updateIpo(req.params.id, body);
  if (!updated) return res.status(404).json({ error: 'IPO not found.' });
  res.json({ data: { ...updated, ...derived(updated as unknown as Record<string, unknown>) } });
});

export const deleteIpoHandler = wrap(async (req, res) => {
  const ok = await deleteIpo(req.params.id);
  if (!ok) return res.status(404).json({ error: 'IPO not found.' });
  res.json({ ok: true });
});

export const updateStatusHandler = wrap(async (req, res) => {
  const { status } = req.body ?? {};
  const allowed = ['Applied', 'Allotment Pending', 'Allotted', 'Not Allotted', 'Refund Pending', 'Listed', 'Sold'];
  if (!allowed.includes(status)) return res.status(400).json({ error: `Status must be one of: ${allowed.join(', ')}` });
  const updated = await updateIpo(req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'IPO not found.' });
  res.json({ data: { ...updated, ...derived(updated as unknown as Record<string, unknown>) } });
});

export const updateSubscriptionHandler = wrap(async (req, res) => {
  const ipo = await getIpo(req.params.id);
  if (!ipo) return res.status(404).json({ error: 'IPO not found.' });
  const { retail = null, nii = null, qib = null, employee = null, total = null, label = '' } = req.body ?? {};
  const sub = { retail, nii, qib, employee, total };
  for (const [k, v] of Object.entries(sub)) {
    if (v !== null && v !== undefined && (!(typeof v === 'number') || !(v >= 0)))
      return res.status(400).json({ error: `Subscription field "${k}" must be a non-negative number or null.` });
  }
  const updated = await updateIpo(req.params.id, { subscription: { ...(ipo.subscription ?? {}), ...sub } });
  await appendSubHistory(req.params.id, { ...sub, label: String(label ?? ''), timestamp: new Date().toISOString() });
  res.json({ data: { ...updated!, ...derived(updated as unknown as Record<string, unknown>) } });
});

export const subHistoryHandler = wrap(async (req, res) => {
  const ipo = await getIpo(req.params.id);
  if (!ipo) return res.status(404).json({ error: 'IPO not found.' });
  res.json({ data: await getSubHistory(req.params.id) });
});
