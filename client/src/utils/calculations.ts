// Mirrors server/src/utils/calculations.ts — keep formulas identical.
export function calculateQuantity(lotSize: number, lots: number): number {
  if (!Number.isFinite(lotSize) || !Number.isFinite(lots)) return 0;
  if (lotSize <= 0 || lots <= 0) return 0;
  return Math.floor(lotSize) * Math.floor(lots);
}
export function calculateInvestment(issuePrice: number, lotSize: number, lots: number): number {
  if (!Number.isFinite(issuePrice) || issuePrice < 0) return 0;
  return Math.round(issuePrice * calculateQuantity(lotSize, lots));
}
export function calculateGmpPercentage(issuePrice: number, gmp: number | null | undefined): number | null {
  if (gmp === null || gmp === undefined || !Number.isFinite(gmp)) return null;
  if (!Number.isFinite(issuePrice) || issuePrice <= 0) return null;
  return Math.round((gmp / issuePrice) * 100 * 100) / 100;
}
export function calculateEstimatedListingPrice(issuePrice: number, gmp: number | null | undefined): number | null {
  if (gmp === null || gmp === undefined || !Number.isFinite(gmp)) return null;
  if (!Number.isFinite(issuePrice) || issuePrice <= 0) return null;
  return Math.round((issuePrice + gmp) * 100) / 100;
}
export function calculateEstimatedProfit(gmp: number | null | undefined, lotSize: number, lots: number): number | null {
  if (gmp === null || gmp === undefined || !Number.isFinite(gmp)) return null;
  const qty = calculateQuantity(lotSize, lots);
  if (qty <= 0) return 0;
  return Math.round(gmp * qty * 100) / 100;
}

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
};

export function determineMarketStatus(
  dates?: string | null,
  notes?: string | null,
  currentStatus?: string | null,
): 'Open' | 'Closed' | 'Upcoming' {
  const text = (dates || notes || '').replace(/^Bidding:\s*/i, '').trim();
  if (!text) {
    if (currentStatus === 'Open' || currentStatus === 'Closed' || currentStatus === 'Upcoming') {
      return currentStatus;
    }
    return 'Upcoming';
  }

  const now = new Date();
  const year = now.getFullYear();

  // Pattern 1: '16 Sep - 18 Sep' or '16 Sep to 18 Sep'
  const m1 = text.match(/(\d{1,2})\s+([A-Za-z]+)\s*(?:-|to)\s*(\d{1,2})\s+([A-Za-z]+)/i);
  if (m1 && m1[1] && m1[2] && m1[3] && m1[4]) {
    const startM = MONTH_MAP[m1[2].toLowerCase().slice(0, 3)];
    const endM = MONTH_MAP[m1[4].toLowerCase().slice(0, 3)];
    if (startM !== undefined && endM !== undefined) {
      const start = new Date(year, startM, parseInt(m1[1], 10), 0, 0, 0);
      const end = new Date(year, endM, parseInt(m1[3], 10), 23, 59, 59, 999);
      if (now > end) return 'Closed';
      if (now >= start && now <= end) return 'Open';
      if (now < start) return 'Upcoming';
    }
  }

  // Pattern 2: '9-11 Sept' or '9 - 11 Sep' or '23-25 Sept'
  const m2 = text.match(/(\d{1,2})\s*(?:-|to)\s*(\d{1,2})\s+([A-Za-z]+)/i);
  if (m2 && m2[1] && m2[2] && m2[3]) {
    const m = MONTH_MAP[m2[3].toLowerCase().slice(0, 3)];
    if (m !== undefined) {
      const start = new Date(year, m, parseInt(m2[1], 10), 0, 0, 0);
      const end = new Date(year, m, parseInt(m2[2], 10), 23, 59, 59, 999);
      if (now > end) return 'Closed';
      if (now >= start && now <= end) return 'Open';
      if (now < start) return 'Upcoming';
    }
  }

  if (currentStatus === 'Open' || currentStatus === 'Closed' || currentStatus === 'Upcoming') {
    return currentStatus;
  }
  return 'Upcoming';
}

