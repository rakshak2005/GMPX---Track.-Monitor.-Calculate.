// GMP provider abstraction. Frontend never talks to providers directly.
// Backend fetches, validates, caches, and stores history.

import { env } from '../config/env.js';
import { validateGmpValue } from '../utils/calculations.js';

export interface IpoRef {
  _id?: unknown;
  id?: string;
  name: string;
  symbol?: string | null;
  issuePrice: number;
}

export interface SubscriptionPayload {
  retail?: number | null;
  nii?: number | null;
  qib?: number | null;
  employee?: number | null;
  total?: number | null;
}

export interface GmpData {
  gmp: number;
  source: string;
  subscription?: SubscriptionPayload | null;
}

export interface GmpProvider {
  name: string;
  getGmp(ipo: IpoRef): Promise<GmpData>;
}

function idOf(ipo: IpoRef): string {
  return String((ipo as { id?: unknown }).id ?? (ipo as { _id?: unknown })._id ?? ipo.name);
}

async function fetchJson(url: string, apiKey: string, ipo: IpoRef): Promise<GmpData | null> {
  const u = new URL(url);
  if (ipo.symbol) u.searchParams.set('symbol', String(ipo.symbol));
  u.searchParams.set('name', ipo.name);
  const res = await fetch(u.toString(), {
    headers: apiKey ? { 'x-api-key': apiKey } : {},
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Provider HTTP ${res.status}`);
  const body = (await res.json()) as Record<string, unknown>;
  // Accept several shapes: { gmp } | { data: { gmp } } | { premium }
  const raw =
    (body as { gmp?: unknown }).gmp ??
    (body as { premium?: unknown }).premium ??
    (body as { data?: { gmp?: unknown } }).data?.gmp;
  const gmp = typeof raw === 'string' ? Number(raw) : (raw as number);
  if (!validateGmpValue(gmp)) throw new Error('Malformed provider response (gmp).');
  const sub = ((body as { subscription?: SubscriptionPayload }).subscription ??
    (body as { data?: { subscription?: SubscriptionPayload } }).data?.subscription ??
    null) as SubscriptionPayload | null;
  return { gmp, source: u.host || 'primary', subscription: sub };
}

export class PrimaryGmpProvider implements GmpProvider {
  name = 'primary';
  async getGmp(ipo: IpoRef): Promise<GmpData> {
    if (!env.GMP_API_URL) throw new Error('GMP_API_URL not configured.');
    const data = await fetchJson(env.GMP_API_URL, env.GMP_API_KEY, ipo);
    if (!data) throw new Error('Empty provider response.');
    return { ...data, source: 'primary' };
  }
}

export class FallbackGmpProvider implements GmpProvider {
  name = 'fallback';
  async getGmp(ipo: IpoRef): Promise<GmpData> {
    if (!env.GMP_FALLBACK_URL) throw new Error('GMP_FALLBACK_URL not configured.');
    const data = await fetchJson(env.GMP_FALLBACK_URL, '', ipo);
    if (!data) throw new Error('Empty fallback response.');
    return { ...data, source: 'fallback' };
  }
}

// Deterministic pseudo-live walk for development only. Clearly labelled.
export class MockGmpProvider implements GmpProvider {
  name = 'mock-demo';
  async getGmp(ipo: IpoRef): Promise<GmpData> {
    const seed = [...idOf(ipo)].reduce((a, c) => a + c.charCodeAt(0), 0);
    const base = 60 + (seed % 160);
    const wave = Math.round(Math.sin(Date.now() / 1000 / 600 + seed) * 18);
    const gmp = Math.max(0, base + wave);
    return { gmp, source: 'mock-demo' };
  }
}

export function getConfiguredProvider(): GmpProvider {
  if (env.GMP_PROVIDER === 'primary') return new PrimaryGmpProvider();
  if (env.GMP_PROVIDER === 'fallback') return new FallbackGmpProvider();
  return new MockGmpProvider();
}

export function getProviderChain(): GmpProvider[] {
  if (env.GMP_PROVIDER === 'primary') {
    const chain: GmpProvider[] = [new PrimaryGmpProvider()];
    if (env.GMP_FALLBACK_URL) chain.push(new FallbackGmpProvider());
    return chain;
  }
  if (env.GMP_PROVIDER === 'fallback') return [new FallbackGmpProvider()];
  return [new MockGmpProvider()];
}
