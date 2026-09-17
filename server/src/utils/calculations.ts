// Centralized financial calculations. Single source of truth — do not
// duplicate these formulas in controllers or components.

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

export function calculateEstimatedListingPrice(
  issuePrice: number,
  gmp: number | null | undefined,
): number | null {
  if (gmp === null || gmp === undefined || !Number.isFinite(gmp)) return null;
  if (!Number.isFinite(issuePrice) || issuePrice <= 0) return null;
  return Math.round((issuePrice + gmp) * 100) / 100;
}

export function calculateEstimatedProfit(
  gmp: number | null | undefined,
  lotSize: number,
  lots: number,
): number | null {
  if (gmp === null || gmp === undefined || !Number.isFinite(gmp)) return null;
  const qty = calculateQuantity(lotSize, lots);
  if (qty <= 0) return 0;
  return Math.round(gmp * qty * 100) / 100;
}

export function calculateEstimatedListingValue(
  issuePrice: number,
  gmp: number | null | undefined,
  lotSize: number,
  lots: number,
): number | null {
  const listing = calculateEstimatedListingPrice(issuePrice, gmp);
  if (listing === null) return null;
  const qty = calculateQuantity(lotSize, lots);
  return Math.round(listing * qty * 100) / 100;
}

export function validateGmpValue(gmp: unknown): gmp is number {
  if (typeof gmp !== 'number' || !Number.isFinite(gmp)) return false;
  // Reasonable guard: GMP beyond ±10x issue norms is rejected downstream
  // with issue-price context; here just reject absurd magnitudes.
  return Math.abs(gmp) <= 1_000_000;
}

export function validateIpoInput(input: {
  name?: unknown;
  issuePrice?: unknown;
  lotSize?: unknown;
  lotsApplied?: unknown;
}): string | null {
  if (!input.name || typeof input.name !== 'string' || !input.name.trim())
    return 'IPO name is required.';
  if (typeof input.issuePrice !== 'number' || !(input.issuePrice > 0))
    return 'Issue price must be a positive number.';
  if (typeof input.lotSize !== 'number' || !(input.lotSize > 0) || !Number.isInteger(input.lotSize))
    return 'Lot size must be a positive integer.';
  if (
    typeof input.lotsApplied !== 'number' ||
    !(input.lotsApplied > 0) ||
    !Number.isInteger(input.lotsApplied)
  )
    return 'Number of lots must be a positive integer.';
  return null;
}
