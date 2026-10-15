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

/**
 * Extracts explicit retail reserved shares if specified in notes, DRHP text, or custom fields.
 * Supports patterns like "Retail: 1,10,00,000 shares", "Retail shares: 4256016", "Retail Quota: 42,56,016 shares", etc.
 */
export function parseRetailReservedShares(notes?: string | null): number | null {
  if (!notes) return null;
  // Match direct shares: e.g. "Retail: 9174677 shares", "Retail: 2429066"
  const match = notes.match(/Retail(?:\s+Reserved|\s+Shares)?\s*:\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:Cr|Crore|Lakh|Shares)?/i);
  if (match) {
    const rawNumStr = match[1].replace(/,/g, '');
    const num = parseFloat(rawNumStr);
    if (Number.isFinite(num) && num > 0) {
      const fullText = match[0].toLowerCase();
      if (fullText.includes('cr') || fullText.includes('crore')) {
        return Math.round(num * 10000000);
      }
      if (fullText.includes('lakh')) {
        return Math.round(num * 100000);
      }
      return Math.round(num);
    }
  }

  // Derive from Issue Size and Retail Quota percentage if present in notes
  const isizeMatch = notes.match(/Issue\s+Size\s*:\s*₹?\s*([0-9,.]+)\s*Cr/i);
  const quotaMatch = notes.match(/Retail\s+Quota\s*:\s*([0-9.]+)%/i);
  if (isizeMatch) {
    const isizeCr = parseFloat(isizeMatch[1].replace(/,/g, ''));
    const quotaPct = quotaMatch ? parseFloat(quotaMatch[1]) : 35;
    // Value in rupees
    const retailRupees = isizeCr * 10000000 * (quotaPct / 100);
    return Math.round(retailRupees); // Returns retail quota value in rupees if shares not explicit
  }

  return null;
}

export function parseIpoNotesMetadata(notes?: string | null): {
  issueSizeCr: number | null;
  retailQuotaPct: number | null;
  retailShares: number | null;
} {
  if (!notes) return { issueSizeCr: null, retailQuotaPct: null, retailShares: null };
  
  const isizeMatch = notes.match(/Issue\s+Size\s*:\s*₹?\s*([0-9,.]+)\s*Cr/i);
  const issueSizeCr = isizeMatch ? parseFloat(isizeMatch[1].replace(/,/g, '')) : null;

  const quotaMatch = notes.match(/Retail\s+Quota\s*:\s*([0-9.]+)%/i);
  const retailQuotaPct = quotaMatch ? parseFloat(quotaMatch[1]) : null;

  const sharesMatch = notes.match(/Retail(?:\s+Reserved|\s+Shares)?\s*:\s*([0-9,]+)\s*shares/i);
  const retailShares = sharesMatch ? parseInt(sharesMatch[1].replace(/,/g, ''), 10) : null;

  return { issueSizeCr, retailQuotaPct, retailShares };
}

export interface RetailCapacityTier {
  multiple: number;
  estimatedApplicants: number;
  availableLots: number;
  chancePct: number;
}

export interface RetailCapacityResult {
  retailReservedShares: number | null;
  lotSize: number;
  retailLotCapacity: number;
  currentMultiple: number | null;
  currentEstimatedApplicants: number | null;
  currentEstimatedChance: number | null;
  tiers: RetailCapacityTier[];
}

export function calculateRetailAllotmentCapacity(
  retailReservedShares: number | null | undefined,
  lotSize: number,
  currentRetailMultiple?: number | null
): RetailCapacityResult {
  const safeLotSize = Math.max(1, lotSize || 1);
  const safeReserved = retailReservedShares && retailReservedShares > 0 ? retailReservedShares : null;
  
  // CORE CALCULATION: Retail Allotment Capacity (1-lot equivalents) = FLOOR(Retail Reserved Shares / Retail Lot Size)
  const retailLotCapacity = safeReserved ? Math.floor(safeReserved / safeLotSize) : 0;

  const multipliers = [1, 2, 3, 5, 10, 20];
  const tiers: RetailCapacityTier[] = multipliers.map((m) => {
    const estApplicants = retailLotCapacity > 0 ? Math.round(retailLotCapacity * m) : 0;
    const chancePct = m <= 1 ? 100 : Math.round((1 / m) * 100 * 100) / 100;
    return {
      multiple: m,
      estimatedApplicants: estApplicants,
      availableLots: retailLotCapacity,
      chancePct,
    };
  });

  let currentEstimatedApplicants: number | null = null;
  let currentEstimatedChance: number | null = null;

  if (currentRetailMultiple != null && currentRetailMultiple > 0) {
    if (retailLotCapacity > 0) {
      currentEstimatedApplicants = Math.round(retailLotCapacity * currentRetailMultiple);
      // Estimated 1-Lot Probability = MIN(1, Retail Allotment Capacity / Estimated Applicants) * 100
      currentEstimatedChance = Math.min(100, Math.round((retailLotCapacity / currentEstimatedApplicants) * 100 * 100) / 100);
    } else {
      currentEstimatedChance = currentRetailMultiple <= 1 ? 100 : Math.round((1 / currentRetailMultiple) * 100 * 100) / 100;
    }
  }

  return {
    retailReservedShares: safeReserved,
    lotSize: safeLotSize,
    retailLotCapacity,
    currentMultiple: currentRetailMultiple ?? null,
    currentEstimatedApplicants,
    currentEstimatedChance,
    tiers,
  };
}


