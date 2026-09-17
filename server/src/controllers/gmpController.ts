import type { Request, Response, NextFunction } from 'express';
import { getIpo, getGmpHistory } from '../services/ipoStore.js';
import { refreshGmpForIpo } from '../services/gmpService.js';
import { calculateGmpPercentage, calculateEstimatedListingPrice, calculateEstimatedProfit } from '../utils/calculations.js';

const wrap = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

function rangeSince(range: string): Date | undefined {
  const now = Date.now();
  const h = 3600_000;
  switch (range) {
    case '6H': return new Date(now - 6 * h);
    case '12H': return new Date(now - 12 * h);
    case '1D': return new Date(now - 24 * h);
    case '3D': return new Date(now - 72 * h);
    default: return undefined;
  }
}

export const getGmpHandler = wrap(async (req, res) => {
  const ipo = await getIpo(req.params.id);
  if (!ipo) return res.status(404).json({ error: 'IPO not found.' });
  const history = await getGmpHistory(req.params.id);
  const prev = history.length >= 2 ? history[history.length - 2].gmp : null;
  const dayAgo = new Date(Date.now() - 24 * 3600_000);
  const last24 = history.filter((p) => new Date(p.timestamp) >= dayAgo);
  res.json({
    data: {
      gmp: ipo.currentGmp ?? null,
      gmpPct: calculateGmpPercentage(ipo.issuePrice, ipo.currentGmp ?? null),
      estListing: calculateEstimatedListingPrice(ipo.issuePrice, ipo.currentGmp ?? null),
      estProfit: calculateEstimatedProfit(ipo.currentGmp ?? null, ipo.lotSize, ipo.lotsApplied),
      previousGmp: prev,
      change: ipo.currentGmp != null && prev != null ? ipo.currentGmp - prev : null,
      change24h: ipo.currentGmp != null && last24.length > 0 ? ipo.currentGmp - last24[0].gmp : null,
      source: ipo.gmpSource ?? null,
      lastUpdated: ipo.lastGmpAt ?? null,
      stale: Boolean(ipo.gmpStale) || ipo.currentGmp == null,
    },
  });
});

export const refreshGmpHandler = wrap(async (req, res) => {
  try {
    const r = await refreshGmpForIpo(req.params.id, true);
    const ipo = await getIpo(req.params.id);
    res.json({ data: ipo, refreshed: r.updated, reason: r.reason });
  } catch (err) {
    const status = (err as { status?: number }).status ?? 502;
    const ipo = await getIpo(req.params.id).catch(() => null);
    res.status(status).json({
      error: 'Unable to update GMP. The data provider is currently unavailable.',
      lastKnownGmp: ipo?.currentGmp ?? null,
      lastUpdated: ipo?.lastGmpAt ?? null,
    });
  }
});

export const gmpHistoryHandler = wrap(async (req, res) => {
  const ipo = await getIpo(req.params.id);
  if (!ipo) return res.status(404).json({ error: 'IPO not found.' });
  const range = String(req.query.range ?? 'ALL');
  const history = await getGmpHistory(req.params.id, rangeSince(range));
  const gmps = history.map((h) => h.gmp);
  res.json({
    data: history,
    stats: history.length
      ? {
          current: gmps[gmps.length - 1],
          open: gmps[0],
          high: Math.max(...gmps),
          low: Math.min(...gmps),
          change: gmps.length > 1 ? gmps[gmps.length - 1] - gmps[gmps.length - 2] : 0,
        }
      : null,
  });
});
