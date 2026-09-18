import { listIpos, createIpo, updateIpo, findIpoByName, appendGmpHistory } from './ipoStore.js';
import { determineMarketStatus, parseBiddingDates } from '../utils/calculations.js';

export interface ScrapedIpo {
  name: string;
  category: 'Mainboard' | 'SME';
  url: string | null;
  gmp: number;
  rawGmp: string;
  issuePrice: number;
  priceBand: string;
  estListingPrice: number;
  dates: string;
  marketStatus: string;
  lastUpdated: string;
  lotSize?: number | null;
  listingDate?: string | null;
}

function cleanNum(val: string | undefined | null): number {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

export interface SubscriptionData {
  retail: number | null;
  nii: number | null;
  qib: number | null;
  employee: number | null;
  total: number | null;
}

async function fetchSubscriptionData(slug: string): Promise<SubscriptionData | null> {
  if (!slug) return null;
  try {
    const subUrl = `https://www.ipoguru.in/ipo-subscription/${slug}`;
    const res = await fetch(subUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const trs = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];

    const sub: SubscriptionData = { retail: null, nii: null, qib: null, employee: null, total: null };
    for (const tr of trs) {
      const text = tr.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const timesMatch = text.match(/([0-9.]+)\s*x\b/i);
      if (!timesMatch) continue;
      const timesVal = parseFloat(timesMatch[1]);
      if (!Number.isFinite(timesVal)) continue;

      if (/retail/i.test(text) && !/max|date|shni/i.test(text) && sub.retail === null) {
        sub.retail = timesVal;
      } else if (/\bqib\b/i.test(text) && !/date/i.test(text) && sub.qib === null) {
        sub.qib = timesVal;
      } else if (/\bnii\b/i.test(text) && !/big|small|snii|bnii|date/i.test(text) && sub.nii === null) {
        sub.nii = timesVal;
      } else if (/employee/i.test(text) && sub.employee === null) {
        sub.employee = timesVal;
      } else if (/\btotal\b/i.test(text) && !/est/i.test(text) && sub.total === null) {
        sub.total = timesVal;
      }
    }

    if (sub.total !== null || sub.retail !== null || sub.qib !== null || sub.nii !== null) {
      return sub;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchIpoGuruDetail(url: string | null): Promise<{
  lotSize: number | null;
  listingDate: string | null;
  allotmentDate: string | null;
  subscription: SubscriptionData | null;
}> {
  if (!url) return { lotSize: null, listingDate: null, allotmentDate: null, subscription: null };
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return { lotSize: null, listingDate: null, allotmentDate: null, subscription: null };
    const html = await res.text();

    // 1. Lot size from table or text
    let lotSize: number | null = null;
    const lotMatch = html.match(/Lot\s+Size\s*<\/td>\s*<td[^>]*>\s*(\d+)\s*Shares/i) ||
      html.match(/Retail\s*\(min\)[^<]*<\/td>\s*<td[^>]*>[^<]*<\/td>\s*<td[^>]*>\s*(\d+)/i) ||
      html.match(/(\d+)\s*Shares/i);
    if (lotMatch) {
      const parsed = parseInt(lotMatch[1], 10);
      if (Number.isFinite(parsed) && parsed > 0) lotSize = parsed;
    }

    // 2. Listing date from JSON-LD schema
    let listingDate: string | null = null;
    const listingPropMatch = html.match(/"name":\s*"Listing Date",\s*"value":\s*"([^"]+)"/i);
    if (listingPropMatch) {
      listingDate = listingPropMatch[1];
    }

    // 3. Allotment date
    let allotmentDate: string | null = null;
    const allotmentPropMatch = html.match(/"name":\s*"Basis of Allotment",\s*"value":\s*"([^"]+)"/i) ||
      html.match(/Basis\s+of\s+Allotment\s*<\/td>\s*<td[^>]*>([^<]+)<\/td>/i);
    if (allotmentPropMatch) {
      allotmentDate = allotmentPropMatch[1].trim();
    }

    // 4. Extract slug and fetch live subscription breakdown
    let subscription: SubscriptionData | null = null;
    const slugMatch = url.match(/\/ipo\/([a-z0-9-]+)/i);
    if (slugMatch && slugMatch[1]) {
      subscription = await fetchSubscriptionData(slugMatch[1]);
    }

    return { lotSize, listingDate, allotmentDate, subscription };
  } catch {
    return { lotSize: null, listingDate: null, allotmentDate: null, subscription: null };
  }
}


export async function fetchLiveMarketIpos(): Promise<ScrapedIpo[]> {
  const res = await fetch('https://www.ipoguru.in/live-ipo-gmp', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`IPOGuru HTTP ${res.status}`);
  const html = await res.text();
  const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
  if (tables.length < 1 || !tables[0]) {
    throw new Error('Could not find standard IPO table on IPOGuru.');
  }

  const rows = tables[0].match(/<tr[\s\S]*?<\/tr>/gi) || [];
  const result: ScrapedIpo[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i].match(/<td[\s\S]*?<\/td>/gi) || [];
    if (cols.length < 4 || !cols[0] || !cols[1] || !cols[2]) continue;
    const rawCol0 = cols[0];

    // Filter strictly for Mainboard IPOs (exclude SME)
    const isSme = rawCol0.includes('SME');
    if (isSme) continue;

    // Extract IPO Name and detail URL
    const linkMatch = rawCol0.match(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    const rawName = linkMatch ? linkMatch[2].replace(/<[^>]+>/g, '').trim() : '';
    const cleanName = rawName.replace(/\s+IPO$/i, '').trim();
    if (!cleanName) continue;
    const url = linkMatch ? linkMatch[1] : null;

    // Extract Bidding Dates
    const dateMatch = rawCol0.match(/<div[^>]*class="[^"]*text-gray-500[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const dates = dateMatch ? dateMatch[1].replace(/<[^>]+>/g, '').trim() : '';

    // Issue Price
    const cleanPrice = cols[1].replace(/<[^>]+>/g, '').replace(/[^0-9.]/g, '');
    const issuePrice = parseFloat(cleanPrice) || 0;

    // Live GMP
    const cleanGmp = cols[2].replace(/<[^>]+>/g, '').replace(/[^0-9.-]/g, '');
    const gmp = parseFloat(cleanGmp) || 0;

    // Market status based on dates
    const marketStatus = determineMarketStatus(dates, null, 'Upcoming');

    result.push({
      name: cleanName,
      category: 'Mainboard',
      url,
      gmp,
      rawGmp: `₹ ${gmp}`,
      issuePrice: issuePrice > 0 ? issuePrice : 100,
      priceBand: `₹${issuePrice}`,
      estListingPrice: issuePrice + gmp,
      dates,
      marketStatus,
      lastUpdated: new Date().toISOString(),
    });
  }

  return result;
}

export async function syncLiveIpos(): Promise<{ totalScraped: number; created: number; updated: number; errors: string[] }> {
  const errors: string[] = [];
  let totalScraped = 0;
  let created = 0;
  let updated = 0;

  // Clean up any unapplied SME IPOs from previous runs and expired IPOs whose listing date passed
  try {
    const { cleanupExpiredIpos } = await import('./ipoStore.js');
    await cleanupExpiredIpos();

    const all = await listIpos();
    for (const item of all) {
      if (item.category === 'SME' && !item.isApplied) {
        const { deleteIpo } = await import('./ipoStore.js');
        await deleteIpo(item.id);
      }
    }
  } catch (err) {
    console.error('[scraper] Error cleaning SME / expired IPOs:', err);
  }

  let scraped: ScrapedIpo[] = [];
  try {
    scraped = await fetchLiveMarketIpos();
    totalScraped = scraped.length;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[scraper] Fetch error:', msg);
    errors.push(msg);
    return { totalScraped: 0, created: 0, updated: 0, errors };
  }

  const now = new Date();
  for (const item of scraped) {
    let detailLot: number | null = null;
    let detailListingDate: string | null = null;
    let detailAllotmentDate: string | null = null;
    let detailSubscription: SubscriptionData | null = null;
    if (item.url) {
      const details = await fetchIpoGuruDetail(item.url);
      detailLot = details.lotSize;
      detailListingDate = details.listingDate;
      detailAllotmentDate = details.allotmentDate;
      detailSubscription = details.subscription;
    }
    if (!detailLot && item.issuePrice > 0) {
      detailLot = Math.max(1, Math.round(14500 / item.issuePrice));
    }
    const targetLotSize = detailLot || 15;

    try {
      const parsedDates = parseBiddingDates(item.dates);
      const parsedCloseDate = parsedDates.closeDate ? parsedDates.closeDate.toISOString() : undefined;
      const parsedOpenDate = parsedDates.openDate ? parsedDates.openDate.toISOString() : undefined;

      const existing = await findIpoByName(item.name);
      if (existing) {
        let trend: 'up' | 'down' | 'neutral' = 'neutral';
        const prevGmpValue = existing.currentGmp !== null && existing.currentGmp !== undefined ? Number(existing.currentGmp) : null;
        if (prevGmpValue !== null && item.gmp !== prevGmpValue) {
          trend = item.gmp > prevGmpValue ? 'up' : 'down';
        } else if (existing.gmpTrend) {
          trend = existing.gmpTrend;
        }

        // Update live data while preserving user applied state & lots
        const patch: Record<string, unknown> = {
          currentGmp: item.gmp,
          lastGmpAt: now.toISOString(),
          lastGmpFetchAt: now.toISOString(),
          gmpSource: 'IPOGuru Live',
          gmpStale: false,
          category: 'Mainboard',
          marketStatus: item.marketStatus,
          notes: item.dates ? `Bidding: ${item.dates}` : existing.notes,
          lotSize: targetLotSize,
        };
        if (parsedCloseDate) patch.closeDate = parsedCloseDate;
        if (parsedOpenDate) patch.openDate = parsedOpenDate;

        if (prevGmpValue !== null && item.gmp !== prevGmpValue) {
          patch.prevGmp = prevGmpValue;
          patch.gmpTrend = trend;
        }
        if (detailListingDate) {
          patch.listingDate = detailListingDate;
        }
        if (detailAllotmentDate) {
          patch.allotmentDate = detailAllotmentDate;
        }
        if (detailSubscription) {
          patch.subscription = detailSubscription;
        }
        if (item.issuePrice > 0) {
          patch.issuePrice = item.issuePrice;
        }
        await updateIpo(existing.id, patch);
        await appendGmpHistory(existing.id, item.gmp, 'IPOGuru Live', now);
        updated++;
      } else {
        // Create new available Mainboard IPO
        const newIpo = await createIpo({
          name: item.name,
          companyName: `${item.name} Ltd`,
          symbol: item.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase(),
          issuePrice: item.issuePrice || 100,
          lotSize: targetLotSize,
          lotsApplied: 0,
          status: 'Available',
          isApplied: false,
          category: 'Mainboard',
          marketStatus: item.marketStatus,
          notes: item.dates ? `Bidding: ${item.dates}` : '',
          openDate: parsedOpenDate,
          closeDate: parsedCloseDate,
          listingDate: detailListingDate || undefined,
          allotmentDate: detailAllotmentDate || undefined,
        });
        await updateIpo(newIpo.id, {
          currentGmp: item.gmp,
          lastGmpAt: now.toISOString(),
          lastGmpFetchAt: now.toISOString(),
          gmpSource: 'IPOGuru Live',
          gmpStale: false,
          lotSize: targetLotSize,
          openDate: parsedOpenDate,
          closeDate: parsedCloseDate,
          listingDate: detailListingDate || undefined,
          allotmentDate: detailAllotmentDate || undefined,
          subscription: detailSubscription || undefined,
        });
        await appendGmpHistory(newIpo.id, item.gmp, 'IPOGuru Live', now);
        created++;
      }

    } catch (e) {
      errors.push(`${item.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  console.log(`[scraper] Live Mainboard IPO sync complete: ${totalScraped} scraped, ${created} created, ${updated} updated.`);
  if (created > 0 || updated > 0) {
    try {
      const { broadcastUpdate } = await import('./sseService.js');
      broadcastUpdate('all');
    } catch {
      // ignore
    }
  }
  return { totalScraped, created, updated, errors };
}
