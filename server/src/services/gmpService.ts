// Backend GMP refresh: caching + validation. Only refetches when the
// cached value is older than GMP_REFRESH_INTERVAL.
import { env } from '../config/env.js';
import { getProviderChain } from './gmpProviders.js';
import { appendGmpHistory, getIpo, listIpos, updateIpo } from './ipoStore.js';
import { validateGmpValue } from '../utils/calculations.js';

const TERMINAL = new Set(['Sold']);

function needsRefresh(lastFetchIso: string | null | undefined): boolean {
  if (!lastFetchIso) return true;
  const age = (Date.now() - new Date(lastFetchIso).getTime()) / 1000;
  return age >= env.GMP_REFRESH_INTERVAL;
}

function saneAgainstIssue(gmp: number, issuePrice: number): boolean {
  if (!validateGmpValue(gmp)) return false;
  if (issuePrice > 0 && Math.abs(gmp) > issuePrice * 10) return false;
  return true;
}

export async function refreshGmpForIpo(id: string, force = false): Promise<{ updated: boolean; reason: string }> {
  const ipo = await getIpo(id);
  if (!ipo) throw Object.assign(new Error('IPO not found.'), { status: 404 });
  if (!force && TERMINAL.has(ipo.status)) return { updated: false, reason: 'terminal-status' };
  if (!force && !needsRefresh(ipo.lastGmpFetchAt)) return { updated: false, reason: 'cached' };

  const chain = getProviderChain();
  let lastError: unknown = null;
  for (const provider of chain) {
    try {
      const data = await provider.getGmp({ id: ipo.id, name: ipo.name, symbol: ipo.symbol, issuePrice: ipo.issuePrice });
      if (!saneAgainstIssue(data.gmp, ipo.issuePrice)) throw new Error('Provider GMP failed sanity check.');
      const now = new Date();
      await updateIpo(id, {
        currentGmp: data.gmp,
        lastGmpAt: now.toISOString(),
        lastGmpFetchAt: now.toISOString(),
        gmpSource: data.source,
        gmpStale: false,
        ...(data.subscription ? { subscription: { ...(ipo.subscription ?? {}), ...data.subscription } } : {}),
      });
      await appendGmpHistory(id, data.gmp, data.source, now);
      return { updated: true, reason: provider.name };
    } catch (err) {
      lastError = err;
    }
  }
  await updateIpo(id, { lastGmpFetchAt: new Date().toISOString(), gmpStale: true });
  throw Object.assign(
    new Error(`GMP providers unavailable: ${lastError instanceof Error ? lastError.message : 'unknown error'}`),
    { status: 502 },
  );
}

export async function refreshAllActive(): Promise<{ checked: number; updated: number; errors: string[] }> {
  const ipos = await listIpos();
  let updated = 0;
  const errors: string[] = [];
  for (const ipo of ipos) {
    if (TERMINAL.has(ipo.status)) continue;
    try {
      const r = await refreshGmpForIpo(ipo.id);
      if (r.updated) updated++;
    } catch (err) {
      errors.push(`${ipo.name}: ${err instanceof Error ? err.message : 'error'}`);
    }
  }
  return { checked: ipos.length, updated, errors };
}
