import jStat from 'jstat';

export const distributions = {
  Normal: {
    pdf: (x) => jStat.normal.pdf(x, 0, 1),
    sample: () => jStat.normal.sample(0, 1),
    trueMean: 0,
    trueVar: 1,
  },
  Uniform: {
    pdf: (x) => (x < -Math.sqrt(3) || x > Math.sqrt(3) ? 0 : 0.5 / Math.sqrt(3)),
    sample: () => jStat.uniform.sample(-Math.sqrt(3), Math.sqrt(3)),
    trueMean: 0,
    trueVar: 1,
  },
  Exponential: {
    pdf: (x) => (x < 0 ? 0 : Math.exp(-x)),
    sample: () => jStat.exponential.sample(1),
    trueMean: 1,
    trueVar: 1,
  },
};

/**
 * Two-sided one-sample t-test, also used for paired differences.
 * Exact t inference assumes independent normal observations (or differences).
 */
export function twoSidedTTest(sample, nullMean = 0, alpha = 0.05) {
  if (!Array.isArray(sample) || sample.length < 2 || !sample.every(Number.isFinite)) {
    throw new RangeError('A t-test requires at least two finite observations');
  }
  if (!Number.isFinite(nullMean) || !Number.isFinite(alpha) || alpha <= 0 || alpha >= 1) {
    throw new RangeError('The null mean must be finite and alpha must be between 0 and 1');
  }

  const n = sample.length;
  const mean = sample.reduce((sum, value) => sum + value, 0) / n;
  const variance = sample.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1);
  if (!Number.isFinite(variance) || variance === 0) {
    throw new RangeError('A t-test requires finite, nonzero sample variance');
  }

  const standardDeviation = Math.sqrt(variance);
  const standardError = standardDeviation / Math.sqrt(n);
  const statistic = (mean - nullMean) / standardError;
  const degreesOfFreedom = n - 1;
  const criticalValue = jStat.studentt.inv(1 - alpha / 2, degreesOfFreedom);
  const pValue = Math.min(1, 2 * jStat.studentt.cdf(-Math.abs(statistic), degreesOfFreedom));

  return {
    n,
    mean,
    variance,
    standardDeviation,
    standardError,
    statistic,
    degreesOfFreedom,
    criticalValue,
    pValue,
    rejectNull: pValue < alpha
  };
}
