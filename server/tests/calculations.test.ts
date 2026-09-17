import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEstimatedListingPrice,
  calculateEstimatedListingValue,
  calculateEstimatedProfit,
  calculateGmpPercentage,
  calculateInvestment,
  calculateQuantity,
  validateGmpValue,
  validateIpoInput,
} from '../src/utils/calculations.js';

// Spec §59: P=742, G=135, lot=20, lots=1 →
// listing 877, qty 20, investment 14840, profit 2700, gmp% ≈ 18.19%
describe('calculation engine (spec example)', () => {
  it('computes the worked example', () => {
    assert.equal(calculateQuantity(20, 1), 20);
    assert.equal(calculateInvestment(742, 20, 1), 14840);
    assert.equal(calculateEstimatedListingPrice(742, 135), 877);
    assert.equal(calculateEstimatedProfit(135, 20, 1), 2700);
    const pct = calculateGmpPercentage(742, 135);
    assert.ok(pct !== null && Math.abs(pct - 18.19) < 0.01, `gmp% ≈ 18.19, got ${pct}`);
  });

  it('handles GMP = 0', () => {
    assert.equal(calculateEstimatedListingPrice(742, 0), 742);
    assert.equal(calculateEstimatedProfit(0, 20, 1), 0);
    assert.equal(calculateGmpPercentage(742, 0), 0);
  });

  it('handles negative GMP', () => {
    assert.equal(calculateEstimatedListingPrice(742, -50), 692);
    assert.equal(calculateEstimatedProfit(-50, 20, 1), -1000);
    assert.ok((calculateGmpPercentage(742, -50) ?? 0) < 0);
  });

  it('handles multiple lots and allotted lots', () => {
    assert.equal(calculateQuantity(20, 5), 100);
    assert.equal(calculateInvestment(742, 20, 5), 74200);
    assert.equal(calculateEstimatedProfit(135, 20, 5), 13500);
    // Allotted 1 of 5 applied → profit on allotted quantity only
    assert.equal(calculateEstimatedProfit(135, 20, 1), 2700);
    assert.equal(calculateEstimatedListingValue(742, 135, 20, 1), 17540);
  });

  it('handles missing GMP', () => {
    assert.equal(calculateEstimatedListingPrice(742, null), null);
    assert.equal(calculateEstimatedProfit(null, 20, 1), null);
    assert.equal(calculateGmpPercentage(742, undefined), null);
  });

  it('rejects invalid input safely', () => {
    assert.equal(calculateQuantity(0, 1), 0);
    assert.equal(calculateQuantity(-5, 1), 0);
    assert.equal(calculateInvestment(-1, 20, 1), 0);
    assert.equal(calculateGmpPercentage(0, 135), null);
    assert.equal(validateGmpValue(NaN), false);
    assert.equal(validateGmpValue('135' as unknown as number), false);
    assert.equal(validateGmpValue(2_000_000), false);
    assert.equal(validateGmpValue(135), true);
    assert.ok(validateIpoInput({ name: '', issuePrice: 10, lotSize: 1, lotsApplied: 1 }) !== null);
    assert.equal(validateIpoInput({ name: 'X', issuePrice: 10, lotSize: 1, lotsApplied: 1 }), null);
  });
});
