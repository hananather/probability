import { describe, expect, it } from 'vitest';
import { normalMeanCriticalValue, planNormalMeanSampleSize } from '@/lib/statistics/sampleSizePlanning';

// Independent references from Python statistics.NormalDist.inv_cdf.
const references = [
  { confidence: 90, sigma: 1.7, E: 0.1, n: 782, z: 1.6448536269514722 },
  { confidence: 95, sigma: 2.5, E: 0.7, n: 49, z: 1.9599639845400538 },
  { confidence: 98, sigma: 1.7, E: 0.1, n: 1565, z: 2.3263478740408408 },
  { confidence: 99, sigma: 1.5, E: 0.1, n: 1493, z: 2.5758293035489 },
  { confidence: 95, sigma: 55, E: 0.1, n: 1162042, z: 1.9599639845400538 },
];

describe('normal mean sample-size planning', () => {
  it.each(references)('keeps the $confidence% quantile before rounding the count', input => {
    const result = planNormalMeanSampleSize(input);
    expect(result.status).toBe('feasible');
    expect(result.n).toBe(input.n);
    expect(result.criticalValue).toBeCloseTo(input.z, 13);
    expect(input.z * input.sigma / Math.sqrt(result.n)).toBeLessThanOrEqual(input.E);
    expect(input.z * input.sigma / Math.sqrt(result.n - 1)).toBeGreaterThan(input.E);
  });

  it.each([0.1, 1, 10, 1000])('preserves a count when response units scale by %s', scale => {
    expect(planNormalMeanSampleSize({ sigma: 1.7 * scale, E: 0.1 * scale, confidence: 98 }).n).toBe(1565);
  });

  it.each([
    { sigma: 15, E: 2, confidence: 90, n: 153 },
    { sigma: 15, E: 2, confidence: 95, n: 217 },
    { sigma: 15, E: 2, confidence: 98, n: 305 },
    { sigma: 15, E: 2, confidence: 99, n: 374 },
    { sigma: 3, E: 0.5, confidence: 95, n: 139 },
    { sigma: 15, E: 1, confidence: 95, n: 865 },
    { sigma: 2.3, E: 0.5, confidence: 95, n: 82 },
    { sigma: 8, E: 2, confidence: 99, n: 107 },
  ])('preserves the existing worked count $n', input => {
    expect(planNormalMeanSampleSize(input).n).toBe(input.n);
  });

  it.each([Number.MIN_VALUE, 1e-308, 1e308, Number.MAX_VALUE])('avoids intermediate overflow or underflow for matching units %s', magnitude => {
    const result = planNormalMeanSampleSize({ sigma: magnitude, E: magnitude, confidence: 95 });
    expect(result.status).toBe('feasible');
    expect(result.n).toBe(4);
    expect(result.unroundedN).toBeCloseTo(3.841458820694124, 12);
  });

  it('retains the positive integer count when only the display value underflows', () => {
    const result = planNormalMeanSampleSize({ sigma: Number.MIN_VALUE, E: Number.MAX_VALUE, confidence: 95 });
    expect(result.status).toBe('feasible');
    expect(result.n).toBe(1);
    expect(result.unroundedN).toBeNull();
  });

  it('keeps a representable upper-tail quantile close to 100%', () => {
    const result = planNormalMeanSampleSize({ sigma: 1, E: 1, confidence: 99.99999999999999 });
    expect(result.status).toBe('feasible');
    expect(result.criticalValue).toBeGreaterThan(8);
    expect(result.n).toBeGreaterThan(64);
  });

  it('rejects a count beyond the safe integer range', () => {
    expect(planNormalMeanSampleSize({ sigma: Number.MAX_VALUE, E: Number.MIN_VALUE, confidence: 95 })).toMatchObject({ status: 'invalid', n: null });
  });

  it.each([0, -1, NaN, Infinity, '15', null])('rejects an invalid standard deviation %s', sigma => {
    expect(planNormalMeanSampleSize({ sigma, E: 1, confidence: 95 })).toMatchObject({ status: 'invalid', n: null });
  });

  it.each([0, -1, NaN, Infinity, '2', null])('rejects an invalid half-width %s', E => {
    expect(planNormalMeanSampleSize({ sigma: 1, E, confidence: 95 })).toMatchObject({ status: 'invalid', n: null });
  });

  it.each([0, -1, 100, 101, NaN, Infinity, '95', null, Number.MIN_VALUE])('rejects an invalid or unrepresentable confidence %s', confidence => {
    expect(normalMeanCriticalValue(confidence)).toBeNull();
    expect(planNormalMeanSampleSize({ sigma: 1, E: 1, confidence })).toMatchObject({ status: 'invalid', n: null });
  });
});
