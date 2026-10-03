import { describe, expect, it } from 'vitest';
import {
  binomialPMF,
  binomialCDF,
  binomialStats,
  calculatePMFData,
  calculateRangeProbability,
  geometricCDF,
  getSupportRange,
  hypergeometricPMF,
  hypergeometricStats,
  negativeBinomialPMF,
  negativeBinomialCDF,
  poissonPMF,
  poissonCDF,
} from '@/utils/distributions';

function moments(pmf, min, max) {
  let mass = 0;
  let mean = 0;
  let secondMoment = 0;
  for (let k = min; k <= max; k++) {
    const probability = pmf(k);
    expect(Number.isFinite(probability)).toBe(true);
    expect(probability).toBeGreaterThanOrEqual(0);
    mass += probability;
    mean += k * probability;
    secondMoment += k * k * probability;
  }
  return { mass, mean, variance: secondMoment - mean * mean };
}

describe('discrete probability laws', () => {
  it.each([0, 0.01, 0.3, 0.5, 0.99, 1])('normalizes binomial mass and reproduces its moments at p=%s', (p) => {
    for (const n of [1, 10, 50]) {
      const result = moments(k => binomialPMF(k, n, p), 0, n);
      expect(result.mass).toBeCloseTo(1, 12);
      expect(result.mean).toBeCloseTo(n * p, 11);
      expect(result.variance).toBeCloseTo(n * p * (1 - p), 9);

      const { mode } = binomialStats(n, p);
      const largestMass = Math.max(...Array.from({ length: n + 1 }, (_, k) => binomialPMF(k, n, p)));
      expect(binomialPMF(mode, n, p)).toBeCloseTo(largestMass, 12);
    }
  });

  it.each([0.01, 0.1, 0.3, 0.5, 0.99, 1])('finds the smallest geometric support reaching the threshold at p=%s', (p) => {
    const threshold = 0.999;
    const { min, max } = getSupportRange('geometric', { p }, threshold);
    expect(min).toBe(1);
    expect(Number.isInteger(max)).toBe(true);
    expect(max).toBeGreaterThanOrEqual(min);
    expect(geometricCDF(max, p)).toBeGreaterThanOrEqual(threshold);
    expect(geometricCDF(max - 1, p)).toBeLessThan(threshold);
    const data = calculatePMFData('geometric', { p });
    expect(data.length).toBeGreaterThan(0);
    expect(data.reduce((sum, point) => sum + point.probability, 0)).toBeGreaterThanOrEqual(threshold - 1e-12);
  });

  it('keeps the geometric CDF constant between integer support points', () => {
    expect(geometricCDF(0.99, 0.5)).toBe(0);
    expect(geometricCDF(1, 0.5)).toBe(0.5);
    expect(geometricCDF(1.5, 0.5)).toBe(0.5);
    expect(geometricCDF(1.99, 0.5)).toBe(0.5);
    expect(geometricCDF(2, 0.5)).toBe(0.75);
  });

  it('gives bounded, monotone binomial CDFs on and between support points', () => {
    let previous = 0;
    for (let x = -1; x <= 11; x += 0.25) {
      const current = binomialCDF(x, 10, 0.3);
      expect(current).toBeGreaterThanOrEqual(previous - 1e-12);
      expect(current).toBeGreaterThanOrEqual(0);
      expect(current).toBeLessThanOrEqual(1 + 1e-12);
      previous = current;
    }
    expect(binomialCDF(-Infinity, 10, 0.3)).toBe(0);
    expect(binomialCDF(Infinity, 10, 0.3)).toBe(1);
  });

  it('matches independently calculated Poisson and negative binomial examples', () => {
    expect(poissonPMF(4, 4)).toBeCloseTo(0.19536681481316456, 12);
    expect(negativeBinomialPMF(10, 4, 0.3)).toBeCloseTo(0.0800483796, 12);
    const poisson = moments(k => poissonPMF(k, 3), 0, 40);
    expect(poisson.mass).toBeCloseTo(1, 12);
    expect(poisson.mean).toBeCloseTo(3, 11);
    expect(poisson.variance).toBeCloseTo(3, 10);
  });

  it('normalizes hypergeometric mass and assigns zero mass to noninteger counts', () => {
    const result = moments(k => hypergeometricPMF(k, 20, 7, 5), 0, 5);
    expect(result.mass).toBeCloseTo(1, 12);
    expect(result.mean).toBeCloseTo(1.75, 12);
    expect(result.variance).toBeCloseTo(5 * 0.35 * 0.65 * 15 / 19, 12);
    expect(hypergeometricPMF(1.5, 20, 7, 5)).toBe(0);
    expect(hypergeometricStats(1, 1, 1).variance).toBe(0);
  });

  it('includes the integer counts inside real-valued range bounds', () => {
    expect(calculateRangeProbability('binomial', { n: 5, p: 0.5 }, 0.5, 2.5)).toBe(15 / 32);
    expect(calculateRangeProbability('binomial', { n: 5, p: 0.5 }, 2.5, 0.5)).toBe(0);
    expect(calculateRangeProbability('geometric', { p: 0.5 }, 2, Infinity)).toBe(0.5);
    expect(calculateRangeProbability('poisson', { lambda: 3 }, -Infinity, Infinity)).toBe(1);
    expect(calculateRangeProbability('negativeBinomial', { r: 3, p: 0.3 }, -Infinity, Infinity)).toBe(1);
  });

  it('rejects geometric parameters that cannot define finite plotting support', () => {
    for (const p of [0, -0.1, 1.1, NaN, Infinity]) {
      expect(() => getSupportRange('geometric', { p })).toThrow(RangeError);
    }
    expect(() => getSupportRange('geometric', { p: 0.5 }, 1)).toThrow(RangeError);
  });

  it.each([
    ['negativeBinomial', { r: 1, p: 0.01 }, k => negativeBinomialCDF(k, 1, 0.01)],
    ['negativeBinomial', { r: 3, p: 0.3 }, k => negativeBinomialCDF(k, 3, 0.3)],
    ['negativeBinomial', { r: 10, p: 0.8 }, k => negativeBinomialCDF(k, 10, 0.8)],
    ['negativeBinomial', { r: 3, p: 1 }, k => negativeBinomialCDF(k, 3, 1)],
    ['poisson', { lambda: 0 }, k => poissonCDF(k, 0)],
    ['poisson', { lambda: 0.1 }, k => poissonCDF(k, 0.1)],
    ['poisson', { lambda: 3 }, k => poissonCDF(k, 3)],
    ['poisson', { lambda: 10 }, k => poissonCDF(k, 10)],
  ])('honors requested support coverage for %s %j', (type, params, cdf) => {
    for (const threshold of [0.99, 0.999, 0.99999]) {
      const { min, max } = getSupportRange(type, params, threshold);
      expect(max).toBeGreaterThanOrEqual(min);
      expect(cdf(max)).toBeGreaterThanOrEqual(threshold);
      expect(cdf(max - 1)).toBeLessThan(threshold);
    }
  });
});
