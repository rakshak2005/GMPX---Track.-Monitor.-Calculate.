// Storage abstraction backed by Neon PostgreSQL with automatic past-listing cleanup.
import crypto from 'node:crypto';
import { query, isNeonConnected } from '../config/db.js';
import { determineMarketStatus, isClosedExpired, parseBiddingDates } from '../utils/calculations.js';

export interface IpoLean {
  id: string;
  name: string;
  companyName?: string;
  symbol?: string;
  logoUrl?: string;
  issuePrice: number;
  lotSize: number;
  lotsApplied: number;
  allottedLots?: number | null;
  openDate?: string | null;
  closeDate?: string | null;
  allotmentDate?: string | null;
  listingDate?: string | null;
  status: string;
  isApplied?: boolean;
  category?: string;
  marketStatus?: string;
  currentGmp?: number | null;
  prevGmp?: number | null;
  gmpTrend?: 'up' | 'down' | 'neutral' | null;
  lastGmpAt?: string | null;
  gmpSource?: string | null;
  gmpStale?: boolean;
  lastGmpFetchAt?: string | null;
  subscription?: { retail?: number | null; nii?: number | null; qib?: number | null; employee?: number | null; total?: number | null };
  actualListingPrice?: number | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GmpPoint { gmp: number; timestamp: string; source: string }
export interface SubPoint {
  retail?: number | null; nii?: number | null; qib?: number | null;
  employee?: number | null; total?: number | null; label?: string; timestamp: string;
}

const mem = {
  ipos: new Map<string, IpoLean>(),
  userIpos: new Map<string, Map<string, { lotsApplied: number; status: string; issuePrice?: number }>>(),
  gmp: new Map<string, GmpPoint[]>(),
  sub: new Map<string, SubPoint[]>(),
};

/**
 * Automatically delete IPOs:
 * 1. Whose bidding close date + 4 days has passed (from close_date or parsed notes)
 * 2. Or whose listing date has passed.
 */
export async function cleanupExpiredIpos(): Promise<number> {
  let deletedCount = 0;
  if (isNeonConnected()) {
    // 1. Direct SQL deletion where close_date or listing_date is known in Postgres
    const res = await query(
      `DELETE FROM ipos 
       WHERE (close_date IS NOT NULL AND close_date < CURRENT_DATE - INTERVAL '4 days')
          OR (listing_date IS NOT NULL AND listing_date < CURRENT_DATE - INTERVAL '1 day')`
    );
    deletedCount = res.rowCount || 0;

    // 2. Also check rows where close_date is NULL in DB but notes contains Bidding dates that have passed 4 days
    const remaining = await query(
      `SELECT id, name, close_date, notes FROM ipos WHERE close_date IS NULL AND notes IS NOT NULL`
    );
    const expiredIds: string[] = [];
    for (const row of remaining.rows) {
      if (isClosedExpired(null, row.notes, 4)) {
        expiredIds.push(row.id);
      }
    }
    if (expiredIds.length > 0) {
      const delNotesRes = await query(
        `DELETE FROM ipos WHERE id = ANY($1::uuid[])`,
        [expiredIds]
      );
      deletedCount += delNotesRes.rowCount || 0;
    }
  } else {
    const today = new Date().toISOString().slice(0, 10);
    for (const [id, ipo] of mem.ipos.entries()) {
      const expiredByClose = isClosedExpired(ipo.closeDate, ipo.notes, 4);
      const expiredByListing = Boolean(ipo.listingDate && ipo.listingDate.slice(0, 10) < today);
      if (expiredByClose || expiredByListing) {
        mem.ipos.delete(id);
        deletedCount++;
      }
    }
  }
  if (deletedCount > 0) {
    console.log(`[cleanup] Automatically deleted ${deletedCount} IPOs (closed date + 4 days passed or listing date passed).`);
  }
  return deletedCount;
}

export async function listIpos(userId?: string): Promise<IpoLean[]> {
  await cleanupExpiredIpos();

  if (isNeonConnected()) {
    let sql = `
      SELECT 
        i.id, i.name, i.company_name as "companyName", i.symbol, i.logo_url as "logoUrl",
        i.issue_price as "issuePrice", i.lot_size as "lotSize",
        i.open_date as "openDate", i.close_date as "closeDate",
        i.allotment_date as "allotmentDate", i.listing_date as "listingDate",
        i.market_status as "marketStatus", i.category,
        i.current_gmp as "currentGmp", i.prev_gmp as "prevGmp", i.gmp_trend as "gmpTrend",
        i.last_gmp_at as "lastGmpAt",
        i.gmp_source as "gmpSource", i.gmp_stale as "gmpStale",
        i.subscription,
        i.notes, i.created_at as "createdAt", i.updated_at as "updatedAt",
        COALESCE(ui.lots_applied, 0) as "lotsApplied",
        COALESCE(ui.status, 'Available') as status,
        CASE WHEN ui.id IS NOT NULL THEN true ELSE false END as "isApplied",
        ui.allotted_lots as "allottedLots",
        ui.actual_listing_price as "actualListingPrice"
      FROM ipos i
      LEFT JOIN user_ipos ui ON i.id = ui.ipo_id AND ui.user_id = $1
      ORDER BY i.created_at DESC
    `;
    const res = await query(sql, [userId || '00000000-0000-0000-0000-000000000000']);
    return res.rows.map((r) => {
      const resolvedMarketStatus = determineMarketStatus(null, r.notes, r.marketStatus || 'Upcoming');
      return {
        id: r.id,
        name: r.name,
        companyName: r.companyName || '',
        symbol: r.symbol || '',
        logoUrl: r.logoUrl || '',
        issuePrice: Number(r.issuePrice || 0),
        lotSize: Number(r.lotSize || 15),
        lotsApplied: Number(r.lotsApplied || 0),
        allottedLots: r.allottedLots ? Number(r.allottedLots) : null,
        openDate: r.openDate ? new Date(r.openDate).toISOString() : null,
        closeDate: r.closeDate ? new Date(r.closeDate).toISOString() : null,
        allotmentDate: r.allotmentDate ? new Date(r.allotmentDate).toISOString() : null,
        listingDate: r.listingDate ? new Date(r.listingDate).toISOString() : null,
        status: r.status || 'Available',
        isApplied: Boolean(r.isApplied),
        category: r.category || 'Mainboard',
        marketStatus: resolvedMarketStatus,
        currentGmp: r.currentGmp !== null ? Number(r.currentGmp) : null,
        prevGmp: r.prevGmp !== null ? Number(r.prevGmp) : null,
        gmpTrend: r.gmpTrend || (r.prevGmp !== null && r.currentGmp !== null ? (Number(r.currentGmp) > Number(r.prevGmp) ? 'up' : Number(r.currentGmp) < Number(r.prevGmp) ? 'down' : 'neutral') : null),
        lastGmpAt: r.lastGmpAt ? new Date(r.lastGmpAt).toISOString() : null,
        gmpSource: r.gmpSource || 'IPOWatch Live',
        gmpStale: Boolean(r.gmpStale),
        subscription: r.subscription || null,
        actualListingPrice: r.actualListingPrice ? Number(r.actualListingPrice) : null,
        notes: r.notes || '',
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
        updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined,
      };
    });

  }

  const list: IpoLean[] = [];
  const userMap = userId ? mem.userIpos.get(userId) : null;
  for (const i of mem.ipos.values()) {
    const userBid = userMap?.get(i.id);
    list.push({
      ...i,
      marketStatus: determineMarketStatus(null, i.notes, i.marketStatus || 'Upcoming'),
      lotsApplied: userBid ? userBid.lotsApplied : 0,
      status: userBid ? userBid.status : 'Available',
      isApplied: Boolean(userBid),
    });
  }
  return list.sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')));
}

export async function getIpo(id: string, userId?: string): Promise<IpoLean | null> {
  const all = await listIpos(userId);
  return all.find((x) => x.id === id) ?? null;
}

export async function findIpoByName(name: string): Promise<IpoLean | null> {
  const norm = name.trim().toLowerCase();
  const simplified = norm.replace(/\s*\([^)]*\)/g, '').replace(/\s*(india|ltd|limited)$/g, '').trim();

  if (isNeonConnected()) {
    // Try exact match first
    let res = await query(
      `SELECT id, name, issue_price as "issuePrice", lot_size as "lotSize", 
              current_gmp as "currentGmp", market_status as "marketStatus", notes
       FROM ipos WHERE LOWER(name) = $1`,
      [norm]
    );

    // If not found, try fuzzy match on simplified name or common aliases
    if (res.rows.length === 0 && simplified.length >= 3) {
      res = await query(
        `SELECT id, name, issue_price as "issuePrice", lot_size as "lotSize", 
                current_gmp as "currentGmp", market_status as "marketStatus", notes
         FROM ipos 
         WHERE LOWER(name) = $1 
            OR LOWER(name) LIKE $2
            OR (LOWER(name) = 'nse' AND $1 = 'national stock exchange of india')
            OR ($1 = 'nse' AND LOWER(name) = 'national stock exchange of india')
         LIMIT 1`,
        [simplified, `%${simplified}%`]
      );
    }

    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      issuePrice: Number(r.issuePrice || 0),
      lotSize: Number(r.lotSize || 15),
      lotsApplied: 0,
      status: 'Available',
      currentGmp: r.currentGmp !== null ? Number(r.currentGmp) : null,
      notes: r.notes || '',
    };
  }

  for (const v of mem.ipos.values()) {
    const vNorm = v.name.trim().toLowerCase();
    if (vNorm === norm || vNorm.includes(simplified) || simplified.includes(vNorm)) return v;
  }
  return null;
}

export async function createIpo(data: Record<string, unknown>): Promise<IpoLean> {
  const name = String(data.name ?? '').trim();
  const companyName = String(data.companyName ?? '');
  const symbol = String(data.symbol ?? '');
  const logoUrl = String(data.logoUrl ?? '');
  const issuePrice = Number(data.issuePrice || 0);
  const lotSize = Number(data.lotSize || 15);
  const marketStatus = String(data.marketStatus ?? 'Upcoming');
  const category = String(data.category ?? 'Mainboard');
  const openDate = data.openDate ? new Date(data.openDate as string).toISOString() : null;
  const closeDate = data.closeDate ? new Date(data.closeDate as string).toISOString() : null;
  const allotmentDate = data.allotmentDate ? new Date(data.allotmentDate as string).toISOString() : null;
  const listingDate = data.listingDate ? new Date(data.listingDate as string).toISOString() : null;
  const notes = String(data.notes ?? '');

  if (isNeonConnected()) {
    const res = await query(
      `INSERT INTO ipos 
        (name, company_name, symbol, logo_url, issue_price, lot_size, open_date, close_date, allotment_date, listing_date, market_status, category, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (name) DO UPDATE SET
        issue_price = EXCLUDED.issue_price,
        lot_size = EXCLUDED.lot_size,
        notes = EXCLUDED.notes,
        market_status = EXCLUDED.market_status,
        updated_at = NOW()
       RETURNING id, name, company_name as "companyName", issue_price as "issuePrice", lot_size as "lotSize"`,
      [name, companyName, symbol, logoUrl, issuePrice, lotSize, openDate, closeDate, allotmentDate, listingDate, marketStatus, category, notes]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      companyName: r.companyName,
      issuePrice: Number(r.issuePrice),
      lotSize: Number(r.lotSize),
      lotsApplied: 0,
      status: 'Available',
      isApplied: false,
    };
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const lean: IpoLean = {
    id,
    name,
    companyName,
    symbol,
    logoUrl,
    issuePrice,
    lotSize,
    lotsApplied: 0,
    openDate,
    closeDate,
    allotmentDate,
    listingDate,
    status: 'Available',
    isApplied: false,
    category,
    marketStatus,
    currentGmp: null,
    lastGmpAt: null,
    gmpSource: 'IPOWatch Live',
    gmpStale: false,
    notes,
    createdAt: now,
    updatedAt: now,
  };
  mem.ipos.set(id, lean);
  return lean;
}

export async function updateIpo(id: string, data: Record<string, unknown>): Promise<IpoLean | null> {
  if (isNeonConnected()) {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.currentGmp !== undefined) {
      fields.push(`current_gmp = $${idx++}`);
      values.push(data.currentGmp);
    }
    if (data.prevGmp !== undefined) {
      fields.push(`prev_gmp = $${idx++}`);
      values.push(data.prevGmp);
    }
    if (data.gmpTrend !== undefined) {
      fields.push(`gmp_trend = $${idx++}`);
      values.push(data.gmpTrend);
    }
    if (data.lastGmpAt !== undefined) {
      fields.push(`last_gmp_at = $${idx++}`);
      values.push(data.lastGmpAt);
    }
    if (data.gmpSource !== undefined) {
      fields.push(`gmp_source = $${idx++}`);
      values.push(data.gmpSource);
    }
    if (data.issuePrice !== undefined) {
      fields.push(`issue_price = $${idx++}`);
      values.push(data.issuePrice);
    }
    if (data.lotSize !== undefined) {
      fields.push(`lot_size = $${idx++}`);
      values.push(data.lotSize);
    }
    if (data.marketStatus !== undefined) {
      fields.push(`market_status = $${idx++}`);
      values.push(data.marketStatus);
    }
    if (data.notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      values.push(data.notes);
    }

    if (data.listingDate !== undefined) {
      fields.push(`listing_date = $${idx++}`);
      values.push(data.listingDate);
    }
    if (data.openDate !== undefined) {
      fields.push(`open_date = $${idx++}`);
      values.push(data.openDate);
    }
    if (data.closeDate !== undefined) {
      fields.push(`close_date = $${idx++}`);
      values.push(data.closeDate);
    }
    if (data.allotmentDate !== undefined) {
      fields.push(`allotment_date = $${idx++}`);
      values.push(data.allotmentDate);
    }
    if (data.subscription !== undefined) {
      fields.push(`subscription = $${idx++}`);
      values.push(data.subscription ? JSON.stringify(data.subscription) : null);
    }

    if (fields.length > 0) {


      fields.push(`updated_at = NOW()`);
      values.push(id);
      const sql = `UPDATE ipos SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
      const res = await query(sql, values);
      if (res.rows.length === 0) return null;
      return getIpo(id);
    }
    return getIpo(id);
  }

  const existing = mem.ipos.get(id);
  if (!existing) return null;
  const updated: IpoLean = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  mem.ipos.set(id, updated);
  return updated;
}

export async function setUserIpoApplication(
  userId: string,
  ipoId: string,
  applied: boolean,
  lotsApplied: number = 1,
  issuePrice: number = 0
): Promise<void> {
  if (isNeonConnected()) {
    if (applied) {
      await query(
        `INSERT INTO user_ipos (user_id, ipo_id, lots_applied, issue_price, status, updated_at)
         VALUES ($1, $2, $3, $4, 'Applied', NOW())
         ON CONFLICT (user_id, ipo_id)
         DO UPDATE SET lots_applied = EXCLUDED.lots_applied, issue_price = EXCLUDED.issue_price, status = 'Applied', updated_at = NOW()`,
        [userId, ipoId, lotsApplied, issuePrice]
      );
    } else {
      await query(`DELETE FROM user_ipos WHERE user_id = $1 AND ipo_id = $2`, [userId, ipoId]);
    }
    return;
  }

  let userMap = mem.userIpos.get(userId);
  if (!userMap) {
    userMap = new Map();
    mem.userIpos.set(userId, userMap);
  }
  if (applied) {
    userMap.set(ipoId, { lotsApplied, status: 'Applied', issuePrice });
  } else {
    userMap.delete(ipoId);
  }
}

export async function updateIpoStatus(
  ipoId: string,
  status: string,
  userId?: string | null,
  allottedLots: number = 0
): Promise<void> {
  if (isNeonConnected()) {
    if (userId) {
      await query(
        `UPDATE user_ipos 
         SET status = $1, allotted_lots = $2, updated_at = NOW() 
         WHERE user_id = $3 AND ipo_id = $4`,
        [status, allottedLots, userId, ipoId]
      );
    } else {
      // If no specific userId, update all active applications for this IPO
      await query(
        `UPDATE user_ipos 
         SET status = $1, allotted_lots = $2, updated_at = NOW() 
         WHERE ipo_id = $3`,
        [status, allottedLots, ipoId]
      );
    }
    return;
  }

  if (userId) {
    const userMap = mem.userIpos.get(userId);
    const existing = userMap?.get(ipoId);
    if (existing) {
      userMap?.set(ipoId, { ...existing, status });
    }
  }

  const existingIpo = mem.ipos.get(ipoId);
  if (existingIpo) {
    existingIpo.status = status;
    existingIpo.allottedLots = allottedLots;
    existingIpo.updatedAt = new Date().toISOString();
  }
}

export async function deleteIpo(id: string): Promise<boolean> {
  if (isNeonConnected()) {
    const res = await query(`DELETE FROM ipos WHERE id = $1`, [id]);
    return (res.rowCount || 0) > 0;
  }
  return mem.ipos.delete(id);
}


export async function appendGmpHistory(ipoId: string, gmp: number, source: string, timestamp?: Date): Promise<GmpPoint> {
  const pt: GmpPoint = { gmp, timestamp: (timestamp ?? new Date()).toISOString(), source };
  if (isNeonConnected()) {
    await query(
      `INSERT INTO gmp_history (ipo_id, gmp, source, created_at) VALUES ($1, $2, $3, $4)`,
      [ipoId, gmp, source, timestamp ?? new Date()]
    );
    return pt;
  }
  const arr = mem.gmp.get(ipoId) ?? [];
  arr.push(pt);
  mem.gmp.set(ipoId, arr);
  return pt;
}

export async function getGmpHistory(ipoId: string, since?: Date): Promise<GmpPoint[]> {
  if (isNeonConnected()) {
    let sql = `SELECT gmp, source, created_at as timestamp FROM gmp_history WHERE ipo_id = $1`;
    const params: unknown[] = [ipoId];
    if (since) {
      sql += ` AND created_at >= $2`;
      params.push(since);
    }
    sql += ` ORDER BY created_at ASC LIMIT 1000`;
    const res = await query(sql, params);
    return res.rows.map((r) => ({
      gmp: Number(r.gmp),
      source: r.source,
      timestamp: new Date(r.timestamp).toISOString(),
    }));
  }
  const arr = mem.gmp.get(ipoId) ?? [];
  return since ? arr.filter((p) => new Date(p.timestamp) >= since) : arr;
}

export async function appendSubHistory(ipoId: string, p: SubPoint): Promise<SubPoint> {
  const arr = mem.sub.get(ipoId) ?? [];
  arr.push(p);
  mem.sub.set(ipoId, arr);
  return p;
}

export async function getSubHistory(ipoId: string): Promise<SubPoint[]> {
  return mem.sub.get(ipoId) ?? [];
}

