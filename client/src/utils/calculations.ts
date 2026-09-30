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

export function parseBiddingDates(
  dates?: string | null,
  notes?: string | null,
): { openDate: Date | null; closeDate: Date | null } {
  const text = (dates || notes || '').replace(/^Bidding:\s*/i, '').trim();
  if (!text) return { openDate: null, closeDate: null };
  const now = new Date();
  const year = now.getFullYear();

  // Pattern 1: '16 Sep - 18 Sep' or '16 Sep to 18 Sep'
  const m1 = text.match(/(\d{1,2})\s+([A-Za-z]+)\s*(?:-|to)\s*(\d{1,2})\s+([A-Za-z]+)/i);
  if (m1 && m1[1] && m1[2] && m1[3] && m1[4]) {
    const startM = MONTH_MAP[m1[2].toLowerCase().slice(0, 3)];
    const endM = MONTH_MAP[m1[4].toLowerCase().slice(0, 3)];
    if (startM !== undefined && endM !== undefined) {
      return {
        openDate: new Date(year, startM, parseInt(m1[1], 10), 0, 0, 0),
        closeDate: new Date(year, endM, parseInt(m1[3], 10), 23, 59, 59, 999),
      };
    }
  }

  // Pattern 2: '9-11 Sept' or '9 - 11 Sep' or '23-25 Sept'
  const m2 = text.match(/(\d{1,2})\s*(?:-|to)\s*(\d{1,2})\s+([A-Za-z]+)/i);
  if (m2 && m2[1] && m2[2] && m2[3]) {
    const m = MONTH_MAP[m2[3].toLowerCase().slice(0, 3)];
    if (m !== undefined) {
      return {
        openDate: new Date(year, m, parseInt(m2[1], 10), 0, 0, 0),
        closeDate: new Date(year, m, parseInt(m2[2], 10), 23, 59, 59, 999),
      };
    }
  }

  return { openDate: null, closeDate: null };
}

export function isClosedExpired(
  closeDate?: string | Date | null,
  notes?: string | null,
  days: number = 4,
): boolean {
  let cDate = closeDate ? new Date(closeDate) : null;
  if (!cDate || isNaN(cDate.getTime())) {
    cDate = parseBiddingDates(null, notes).closeDate;
  }
  if (!cDate || isNaN(cDate.getTime())) return false;

  const now = new Date();
  const expiryTime = cDate.getTime() + days * 24 * 60 * 60 * 1000;
  return now.getTime() > expiryTime;
}

export function determineMarketStatus(
  dates?: string | null,
  notes?: string | null,
  currentStatus?: string | null,
): 'Open' | 'Closed' | 'Upcoming' {
  const parsed = parseBiddingDates(dates, notes);
  if (parsed.openDate && parsed.closeDate) {
    const now = new Date();
    if (now > parsed.closeDate) return 'Closed';
    if (now >= parsed.openDate && now <= parsed.closeDate) return 'Open';
    if (now < parsed.openDate) return 'Upcoming';
  }

  if (currentStatus === 'Open' || currentStatus === 'Closed' || currentStatus === 'Upcoming') {
    return currentStatus;
  }
  return 'Upcoming';
}

export interface RetailAllotmentOdds {
  probPct: number;
  oneInX: number;
  perThousand: number;
  isLottery: boolean;
  statusText: string;
}

export function calculateRetailAllotmentProbability(
  retailSub: number | null | undefined
): RetailAllotmentOdds {
  if (retailSub === null || retailSub === undefined || retailSub <= 0) {
    return {
      probPct: 100,
      oneInX: 1,
      perThousand: 1000,
      isLottery: false,
      statusText: 'Awaiting Bids / 100% Firm Allotment',
    };
  }

  if (retailSub <= 1.0) {
    return {
      probPct: 100,
      oneInX: 1,
      perThousand: 1000,
      isLottery: false,
      statusText: '100% Firm Allotment (All valid applicants get at least 1 lot)',
    };
  }

  // Oversubscribed: SEBI proportionate lottery allotment (max 1 lot per applicant)
  const prob = (1 / retailSub) * 100;
  const probPct = Math.round(prob * 100) / 100;
  const oneInX = Math.max(1, Math.round(retailSub));
  const perThousand = Math.min(1000, Math.round((1 / retailSub) * 1000));

  return {
    probPct,
    oneInX,
    perThousand,
    isLottery: true,
    statusText: `Lottery Draw: 1 in ${oneInX} applicants gets 1 lot (${probPct}%)`,
  };
}

export function calculateMultiAccountProbability(
  probPct: number,
  panCount: number
): number {
  if (panCount <= 0) return 0;
  if (probPct >= 100) return 100;
  const p = Math.max(0, Math.min(1, probPct / 100));
  // Probability of at least 1 allotment: 1 - (1 - p)^n
  const overallP = 1 - Math.pow(1 - p, panCount);
  return Math.round(overallP * 100 * 100) / 100;
}

export function calculateMaxRetailLots(
  issuePrice: number,
  lotSize: number,
  sebiLimit: number = 200000
): { maxLots: number; maxShares: number; maxInvestment: number } {
  if (!issuePrice || issuePrice <= 0 || !lotSize || lotSize <= 0) {
    return { maxLots: 1, maxShares: lotSize || 1, maxInvestment: (issuePrice || 0) * (lotSize || 1) };
  }
  const lotCost = issuePrice * lotSize;
  const maxLots = Math.max(1, Math.floor(sebiLimit / lotCost));
  return {
    maxLots,
    maxShares: maxLots * lotSize,
    maxInvestment: maxLots * lotCost,
  };
}


