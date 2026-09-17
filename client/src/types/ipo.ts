export interface SubscriptionBreakdown {
  retail?: number | null;
  nii?: number | null;
  qib?: number | null;
  employee?: number | null;
  total?: number | null;
}

export interface Ipo {
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
  subscription?: SubscriptionBreakdown;
  actualListingPrice?: number | null;
  notes?: string;
  // derived (server or client computed)
  quantity?: number;
  investment?: number;
  gmpPct?: number | null;
  estListing?: number | null;
  estProfit?: number | null;
  lotProfit?: number | null;
}

export interface GmpPoint { gmp: number; timestamp: string; source: string }
export interface GmpStats { current: number; open: number; high: number; low: number; change: number }

export interface Summary {
  active: number;
  capital: number;
  estProfit: number;
  estValue: number;
  avgGmp: number | null;
  lastUpdate: string | null;
  nextUpdate: string | null;
  refreshIntervalSec: number;
  demoMode: boolean;
  today: { tracked: number; closingToday: number; awaitingAllotment: number };
  perIpo: { id: string; name: string; invested: number; estProfit: number | null }[];
}
