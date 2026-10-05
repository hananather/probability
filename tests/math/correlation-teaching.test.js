import { describe, expect, it } from 'vitest';
import { calculateCorrelationStatistics } from '@/lib/statistics/correlationExample';

describe('the correlation lesson’s nonlinear examples', () => {
  it('distinguishes a population correlation from the covariance-normalized statistic of one sample', () => {
    const population = [{ x: -1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: 1, y: 1 }];
    const populationCovariance = population.reduce((total, pair) => total + pair.x * pair.y, 0) / 4;
    expect(populationCovariance).toBe(0); // Both population variances are one.
    const sample = [population[0], population[1], population[3]];
    const result = calculateCorrelationStatistics(sample);
    expect(result.r).toBeCloseTo(0.5, 14);
    const sampleCovariance = result.Sxy / (result.n - 1);
    expect(sampleCovariance / (result.sx * result.sy)).toBeCloseTo(result.r, 14);
    expect(result.r).not.toBe(populationCovariance);
  });

  it('has zero correlation for the displayed five symmetric quadratic pairs', () => {
    const pairs = [-2, -1, 0, 1, 2].map(x => ({ x, y: x * x }));
    const result = calculateCorrelationStatistics(pairs);
    expect(result.n).toBe(5);
    expect(result.meanX).toBe(0);
    expect(result.Sxy).toBe(0);
    expect(result.r).toBe(0);
    expect(result.sx).toBeGreaterThan(0);
    expect(result.sy).toBeGreaterThan(0);
  });

  it('can have strong quadratic correlation arbitrarily near the origin when x is one-sided', () => {
    const pairs = Array.from({ length: 11 }, (_, index) => {
      const x = index / 1000;
      return { x, y: x * x };
    });
    // Independent Fraction/50-digit Decimal evaluation of these eleven pairs.
    const result = calculateCorrelationStatistics(pairs);
    expect(result.r).toBeCloseTo(0.9631426606617744, 12);
    expect(result.r).toBeGreaterThan(0.96);
  });

  it.each([
    [0, -1], [-Math.PI, 1],
  ])('has nonzero full-period sine correlation when the interval starts at %s', (start, covariance) => {
    const pairs = Array.from({ length: 10001 }, (_, index) => {
      const x = start + 2 * Math.PI * index / 10000;
      return { x, y: Math.sin(x) };
    });
    // For uniform x on either interval: Var(x)=pi²/3 and Var(sin(x))=1/2.
    // Direct integration gives Cov=-1 on [0,2pi], +1 on [-pi,pi].
    const populationCorrelation = covariance / Math.sqrt((Math.PI ** 2 / 3) * 0.5);
    const result = calculateCorrelationStatistics(pairs);
    expect(result.r).toBeCloseTo(populationCorrelation, 3);
    expect(Math.abs(result.r)).toBeGreaterThan(0.77);
    // Independent Python statistics.correlation evaluation of the same grid.
    expect(result.r).toBeCloseTo(covariance * 0.7795798395810709, 10);
  });
});
