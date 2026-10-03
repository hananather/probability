import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FDistributionWorkedExample from '@/components/04-descriptive-statistics-sampling/4-7-advanced-distributions/4-7-4-FDistributionWorkedExample';
import { calculateVarianceRatioTest } from '@/components/04-descriptive-statistics-sampling/4-7-advanced-distributions/varianceRatioTest';

vi.mock('@/hooks/useMathJax', () => ({ useMathJax: () => React.useRef(null) }));

describe('two-sided variance-ratio worked example', () => {
  it('uses both numerical critical values for the displayed default degrees of freedom', () => {
    render(<FDistributionWorkedExample />);
    expect(screen.getByText(/Lower cutoff/)).toHaveTextContent('0.350');
    expect(screen.getByText(/Upper cutoff/)).toHaveTextContent('2.647');
    expect(screen.getByText(/we fail to reject/i)).toBeInTheDocument();
  });

  it('rejects a sufficiently small variance ratio in the lower tail', () => {
    render(<FDistributionWorkedExample s1_squared={0.1} s2_squared={1} />);
    expect(screen.getByText(/we reject/i)).toBeInTheDocument();
  });

  it('does not falsely reject a ratio between the old fixed cutoff and the true upper cutoff', () => {
    render(<FDistributionWorkedExample s1_squared={2.5} s2_squared={1} />);
    expect(screen.getByText(/we fail to reject/i)).toBeInTheDocument();
  });

  // Independent scipy.stats.f.ppf references, evaluated 2026-10-03. Values
  // use CDF quantiles, rather than F-table upper-tail probability notation.
  it.each([
    [15, 20, 0.05, 0.34956216025110753, 2.64692794884402],
    [10, 10, 0.1, 0.31457490615130795, 3.178893104458269],
    [5, 30, 0.01, 0.05022430261190037, 4.659077349901707],
  ])('matches independently computed tails for n=(%s,%s), alpha=%s', (n1, n2, alpha, lower, upper) => {
    const result = calculateVarianceRatioTest({ n1, n2, alpha, s1_squared: 2.5, s2_squared: 1.8 });
    expect(result.valid).toBe(true);
    expect(result.lowerCriticalValue).toBeCloseTo(lower, 7);
    expect(result.upperCriticalValue).toBeCloseTo(upper, 7);
    expect(result.fStatistic).toBeCloseTo(25 / 18, 12);
  });

  it('keeps a two-sided conclusion under swapping sample order and variances', () => {
    const original = calculateVarianceRatioTest({ n1: 5, n2: 30, alpha: 0.01, s1_squared: 10, s2_squared: 1 });
    const reversed = calculateVarianceRatioTest({ n1: 30, n2: 5, alpha: 0.01, s1_squared: 1, s2_squared: 10 });
    expect(original.rejectNull).toBe(true);
    expect(reversed.rejectNull).toBe(true);
    expect(reversed.lowerCriticalValue).toBeCloseTo(1 / original.upperCriticalValue, 7);
    expect(reversed.upperCriticalValue).toBeCloseTo(1 / original.lowerCriticalValue, 7);
  });

  it.each([
    { n1: 1 }, { n2: 2.5 }, { n1: Infinity }, { s1_squared: 0 }, { s2_squared: -1 },
    { s1_squared: NaN }, { alpha: 0 }, { alpha: 1 }, { alpha: Infinity }, { alpha: 1e-300 },
    { s1_squared: 1e308, s2_squared: 1e-308 },
  ])('declines invalid or numerically unsupported inputs %j', patch => {
    const result = calculateVarianceRatioTest({ n1: 15, n2: 20, s1_squared: 2.5, s2_squared: 1.8, alpha: 0.05, ...patch });
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('shows an input explanation instead of a numerical conclusion for invalid inputs', () => {
    render(<FDistributionWorkedExample n1={1} />);
    expect(screen.getByRole('status')).toHaveTextContent('at least 2');
    expect(screen.queryByText(/we .*reject/i)).not.toBeInTheDocument();
  });
});
