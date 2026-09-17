import type { Request, Response, NextFunction } from 'express';
import { listIpos } from '../services/ipoStore.js';
import { calculateEstimatedProfit, calculateGmpPercentage, calculateInvestment } from '../utils/calculations.js';
import { env } from '../config/env.js';

const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

export const summaryHandler = wrap(async (req: any, res) => {
  const userId = req.userId;
  const allIpos = await listIpos(userId);
  const appliedIpos = allIpos.filter((i) => i.isApplied === true || (i.status !== 'Available' && (i.lotsApplied ?? 0) > 0));
  let capital = 0;
  let estProfit = 0;
  const pcts: number[] = [];
  let lastUpdate: string | null = null;
  for (const i of allIpos) {
    const p = calculateGmpPercentage(i.issuePrice, i.currentGmp ?? null);
    if (p !== null) pcts.push(p);
    if (i.lastGmpAt && (!lastUpdate || i.lastGmpAt > lastUpdate)) lastUpdate = i.lastGmpAt;
  }
  for (const i of appliedIpos) {
    capital += calculateInvestment(i.issuePrice, i.lotSize, i.lotsApplied);
    // Use allotted quantity when available for a truer estimate.
    const lots = i.status === 'Allotted' && i.allottedLots ? i.allottedLots : i.lotsApplied;
    estProfit += calculateEstimatedProfit(i.currentGmp ?? null, i.lotSize, lots) ?? 0;
  }
  const avgGmp = pcts.length ? Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 100) / 100 : null;
  const nextUpdate = lastUpdate
    ? new Date(new Date(lastUpdate).getTime() + env.GMP_REFRESH_INTERVAL * 1000).toISOString()
    : null;
  const today = new Date().toISOString().slice(0, 10);
  const closingToday = allIpos.filter((i) => i.closeDate?.slice(0, 10) === today).length;
  const awaitingAllotment = appliedIpos.filter((i) => ['Applied', 'Allotment Pending'].includes(i.status)).length;
  res.json({
    data: {
      active: appliedIpos.length,
      totalTracked: allIpos.length,
      capital,
      estProfit,
      estValue: capital + estProfit,
      avgGmp,
      lastUpdate,
      nextUpdate,
      refreshIntervalSec: env.GMP_REFRESH_INTERVAL,
      demoMode: env.isMock,
      today: { tracked: appliedIpos.length, closingToday, awaitingAllotment },
      perIpo: appliedIpos.map((i) => ({
        id: i.id, name: i.name,
        invested: calculateInvestment(i.issuePrice, i.lotSize, i.lotsApplied),
        estProfit: calculateEstimatedProfit(i.currentGmp ?? null, i.lotSize, i.lotsApplied),
      })),
    },
  });
});

export const calendarHandler = wrap(async (req, res) => {
  const ipos = await listIpos();
  const month = String(req.query.month ?? new Date().toISOString().slice(0, 7));
  const events: { ipoId: string; ipoName: string; type: string; date: string }[] = [];
  for (const i of ipos) {
    const push = (type: string, date: string | null | undefined) => {
      if (!date) return;
      if (!String(date).startsWith(month)) return;
      events.push({ ipoId: i.id, ipoName: i.name, type, date });
    };
    push('IPO Opens', i.openDate);
    push('IPO Closes', i.closeDate);
    push('Allotment', i.allotmentDate);
    push('Listing', i.listingDate);
  }
  events.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  res.json({ data: events });
});

export const exportHandler = wrap(async (req, res) => {
  const format = String(req.query.format ?? 'json');
  const ipos = await listIpos();
  if (format === 'csv') {
    const header = 'name,companyName,issuePrice,lotSize,lotsApplied,invested,currentGmp,status,listingDate,notes';
    const rows = ipos.map((i) =>
      [i.name, i.companyName ?? '', i.issuePrice, i.lotSize, i.lotsApplied,
        calculateInvestment(i.issuePrice, i.lotSize, i.lotsApplied),
        i.currentGmp ?? '', i.status, i.listingDate ?? '', `"${String(i.notes ?? '').replace(/"/g, '""')}"`].join(','),
    );
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="gmpulse-export.csv"');
    return res.send([header, ...rows].join('\n'));
  }
  res.header('Content-Disposition', 'attachment; filename="gmpulse-backup.json"');
  res.json({ data: ipos, exportedAt: new Date().toISOString() });
});

export const importHandler = wrap(async (req, res) => {
  const items = (req.body as { data?: unknown[] }).data ?? req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected { data: [...] } or an array.' });
  const { createIpo } = await import('../services/ipoStore.js');
  let imported = 0;
  const errors: string[] = [];
  for (const [idx, raw] of items.entries()) {
    const r = raw as Record<string, unknown>;
    if (!r.name || !(Number(r.issuePrice) > 0) || !(Number(r.lotSize) > 0) || !(Number(r.lotsApplied) > 0)) {
      errors.push(`row ${idx}: missing name/issuePrice/lotSize/lotsApplied`); continue;
    }
    try { await createIpo(r); imported++; }
    catch (e) { errors.push(`row ${idx}: ${(e as Error).message}`); }
  }
  res.json({ imported, errors });
});
