import { describe, expect, it } from 'vitest';
import { engineersData } from '@/components/06-hypothesis-testing/6-7-1-PairedTwoSampleTest';
import { distributions, twoSidedTTest } from '@/utils/stats';

describe('the paired training example', () => {
  const differences = engineersData.map(({ before, after }) => before - after);

  it('uses the displayed pairs and agrees with an independently integrated two-sided t reference', () => {
    const result = twoSidedTTest(differences);
    expect(result.n).toBe(10);
    expect(result.mean).toBeCloseTo(-3.9, 12);
    expect(result.standardDeviation).toBeCloseTo(5.586690532964137, 12);
    expect(result.statistic).toBeCloseTo(-2.207547169811321, 12);
    expect(result.degreesOfFreedom).toBe(9);
    // Reference: numerical integration of the Student-t PDF, independent of jStat.
    expect(result.pValue).toBeCloseTo(0.054663533897984506, 9);
    expect(result.criticalValue).toBeCloseTo(2.2621571628540993, 7);
    expect(result.rejectNull).toBe(false);
  });

  it('uses both tails and preserves the decision when the difference sign is reversed', () => {
    const forward = twoSidedTTest(differences);
    const reversed = twoSidedTTest(differences.map(value => -value));
    expect(reversed.statistic).toBeCloseTo(-forward.statistic, 12);
    expect(reversed.pValue).toBeCloseTo(forward.pValue, 12);
    expect(reversed.rejectNull).toBe(forward.rejectNull);
  });

  it('changes the decision and quantile consistently when alpha changes', () => {
    const result = twoSidedTTest(differences, 0, 0.1);
    expect(result.pValue).toBeCloseTo(0.054663533897984506, 9);
    expect(result.criticalValue).toBeCloseTo(1.8331129326536335, 7);
    expect(result.rejectNull).toBe(true);
  });

  it('rejects samples for which the t statistic is undefined', () => {
    for (const sample of [[], [1], [1, 1], [1, NaN], [1, Infinity], [Number.MAX_VALUE, Number.MAX_VALUE / 2]]) {
      expect(() => twoSidedTTest(sample)).toThrow(RangeError);
    }
    expect(() => twoSidedTTest([1, 2], 0, 1)).toThrow(RangeError);
  });
});

describe('overview probability densities', () => {
  it('exposes the standard normal density through the jStat default export', () => {
    expect(distributions.Normal.pdf(0)).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 12);
    expect(distributions.Normal.pdf(-1)).toBeCloseTo(distributions.Normal.pdf(1), 12);
    expect(distributions.Uniform.pdf(2)).toBe(0);
    expect(distributions.Exponential.pdf(-1)).toBe(0);
  });
});
