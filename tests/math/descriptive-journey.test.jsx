import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateDescriptiveStatistics, StatisticalAnalysis } from '@/components/04-descriptive-statistics-sampling/4-2-central-tendency/4-2-2-DescriptiveStatsJourney';

beforeEach(() => { delete window.MathJax; vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('descriptive journey numerical summaries', () => {
  // Hand-calculated reference values. The quartiles use the documented inverse
  // empirical-CDF convention with averaging at jumps (R quantile type 2).
  it.each([
    [[7], 7, 7, 7, 7, 0, 1],
    [[0, 2], 1, 1, 0, 2, 1, 2],
    [[1, 2, 3], 2, 2, 1, 3, 2 / 3, 1],
    [[1, 2, 3, 4], 2.5, 2.5, 1.5, 3.5, 1.25, 2],
    [[1, 2, 3, 4, 5], 3, 3, 2, 4, 2, 3],
    [[1, 2, 3, 4, 5, 6], 3.5, 3.5, 2, 5, 35 / 12, 4],
    [[1, 2, 3, 4, 5, 6, 7], 4, 4, 2, 6, 4, 5],
    [[1, 2, 3, 4, 5, 6, 7, 8], 4.5, 4.5, 2.5, 6.5, 5.25, 4],
    [[1, 2, 3, 4, 5, 6, 7, 8, 9], 5, 5, 3, 7, 20 / 3, 5],
  ])('matches reference summaries for %j', (data, mean, median, q1, q3, variance, count) => {
    const original = [...data];
    const result = calculateDescriptiveStatistics(data);
    expect(result.mean).toBe(mean);
    expect(result.median).toBe(median);
    expect(result.q1).toBe(q1);
    expect(result.q3).toBe(q3);
    expect(result.variance).toBeCloseTo(variance, 12);
    expect(result.stdDev).toBeCloseTo(Math.sqrt(variance), 12);
    expect(result.withinOneStdDev).toBe(count);
    expect(result.withinOneStdDevFraction).toBe(count / data.length);
    expect(data).toEqual(original);
  });

  it('computes the observed 80% fraction for an extreme-value dataset independently of the normal-model rule', () => {
    const result = calculateDescriptiveStatistics([0, 0, 0, 0, 100]);
    expect(result).toMatchObject({ mean: 20, median: 0, variance: 1600, stdDev: 40, withinOneStdDev: 4, withinOneStdDevFraction: 0.8, outliers: [100] });
  });

  it.each([[[-1, -1, 1, 1]], [[0.1, 0.3]]])('includes observations on both one-SD endpoints, including decimal rounding (%j)', data => {
    const result = calculateDescriptiveStatistics(data);
    expect(result.withinOneStdDev).toBe(data.length);
    expect(result.withinOneStdDevFraction).toBe(1);
  });

  it('retains the observed fraction under shifting/scaling the values and permutation', () => {
    const baseline = [-2, -1, 0, 1, 2];
    const transformed = [2, 0, -2, 1, -1].map(value => 10 + 3 * value);
    const reference = calculateDescriptiveStatistics(baseline);
    const shifted = calculateDescriptiveStatistics(transformed);
    expect(reference.withinOneStdDev).toBe(3);
    expect(shifted.withinOneStdDevFraction).toBe(reference.withinOneStdDevFraction);
    expect(shifted.variance).toBeCloseTo(9 * reference.variance, 12);
  });

  it('does not add an absolute tolerance that swallows the spread of tiny-scale observations', () => {
    const result = calculateDescriptiveStatistics([0, 0, 0, 0, 1e-18]);
    expect(result.withinOneStdDevFraction).toBe(0.8);
  });

  it('does not inflate one-SD coverage when a large offset leaves the spread unchanged', () => {
    const data = [0, 1, 2, 3, 4].map(value => 1e15 + value);
    const result = calculateDescriptiveStatistics(data);
    expect(result.mean).toBe(1e15 + 2);
    expect(result.variance).toBe(2);
    expect(result.withinOneStdDev).toBe(3);
    expect(result.withinOneStdDevFraction).toBe(0.6);
  });

  it('handles tied/constant and empty values without claiming a normal shape', () => {
    const result = calculateDescriptiveStatistics([7, 7, 7]);
    expect(result).toMatchObject({ mean: 7, median: 7, mode: [7], q1: 7, q3: 7, iqr: 0, stdDev: 0, withinOneStdDevFraction: 1, outliers: [] });
    expect(calculateDescriptiveStatistics([])).toBeNull();
  });

  it('keeps exact IQR-fence equality inside and flags a value just beyond the fence', () => {
    const boundary = calculateDescriptiveStatistics([-2, 1, 2, 3, 6]);
    expect(boundary).toMatchObject({ q1: 1, q3: 3, lowerBound: -2, upperBound: 6, outliers: [] });
    expect(calculateDescriptiveStatistics([-2, 1, 2, 3, 6.001]).outliers).toEqual([6.001]);
  });
});

describe('rendered descriptive-statistics teaching', () => {
  it('separates a current observed fraction from the population normal-model rule and updates with data', () => {
    const { rerender } = render(<StatisticalAnalysis data={[0, 0, 0, 0, 100]} activeStage={1} />);
    expect(screen.getByText(/4 of 5 displayed values/)).toHaveTextContent('80.0%');
    expect(screen.getByText(/Under a normal population model/)).toHaveTextContent('68.27% of the population');
    expect(screen.getByText(/These summaries describe/)).toHaveTextContent('divisor n');
    expect(screen.getByText(/These summaries describe/)).toHaveTextContent('n − 1');
    expect(screen.queryByText(/About 68% of your data/)).toBeNull();
    rerender(<StatisticalAnalysis data={[-2, -1, 0, 1, 2]} activeStage={1} />);
    expect(screen.getByText(/3 of 5 displayed values/)).toHaveTextContent('60.0%');
    rerender(<StatisticalAnalysis data={[7, 7, 7]} activeStage={1} />);
    expect(screen.getByText(/3 of 3 displayed values/)).toHaveTextContent('100.0%');
  });

  it('describes the mean/median comparison without diagnosing symmetry or normality', () => {
    // Mean and median are both zero, while reflected frequencies are unequal.
    const { container, rerender } = render(<StatisticalAnalysis data={[-3, -1, 0, 0, 0, 2, 2]} activeStage={0} />);
    expect(screen.getByText(/match at the displayed precision/)).toBeInTheDocument();
    expect(screen.getByText(/two summaries alone/)).toHaveTextContent('cannot establish symmetry or a normal model');
    expect(container).not.toHaveTextContent('Your data is roughly symmetric');
    rerender(<StatisticalAnalysis data={[0, 0, 0, 0, 100]} activeStage={0} />);
    expect(screen.getByText(/mean is greater than the median/)).toBeInTheDocument();
    expect(container).not.toHaveTextContent('Your data is right-skewed');
    rerender(<StatisticalAnalysis data={[7, 7, 7]} activeStage={0} />);
    expect(screen.getByText(/match at the displayed precision/)).toBeInTheDocument();
    expect(container).not.toHaveTextContent('left-skewed');
  });

  it('states the retained quartile convention and avoids an exact 50% sample-count promise', () => {
    render(<StatisticalAnalysis data={[7, 7, 7]} activeStage={2} />);
    expect(screen.getByText(/Quartile convention/)).toHaveTextContent('ranks n/4 and 3n/4');
    expect(screen.getByText(/Quartile convention/)).toHaveTextContent('counting from 1');
    expect(screen.getByText(/With ties or small datasets/)).toHaveTextContent('need not be exactly 50%');
    expect(screen.getByText(/span between the 25th and 75th/)).toHaveTextContent('0.00 units');
  });

  it('treats IQR flags as prompts to investigate and gives qualified robustness explanations', () => {
    const { container } = render(<StatisticalAnalysis data={[0, 0, 0, 0, 100]} activeStage={3} />);
    expect(screen.getByText(/Potential outliers beyond the fences/)).toHaveTextContent('100.00');
    expect(screen.getByText(/Investigate a flagged value/)).toBeInTheDocument();
    expect(screen.getByText(/IQR uses quartile ranks/)).toHaveTextContent('often leave it unchanged');
    expect(container).not.toHaveTextContent('IQR is unaffected');
    expect(container).not.toHaveTextContent('significantly affected');
  });
});
