import { describe, expect, it } from 'vitest';
import { calculateJointIntegral, formatCalculationNumber, formatProbabilityResult } from '@/components/03-continuous-random-variables/3-6-joint-distributions/calculatorMath';

const parameters = { correlation: 0.5, lambda1: 1.2, lambda2: 1.5, a: 2, b: 3 };

describe('calculation display precision', () => {
  it.each([0.001, 0.002, 1e-12, -1e-12, 100000000, 100000001])('preserves the input bound %s', value => {
    expect(Number(formatCalculationNumber(value))).toBe(value);
  });
  it('does not display a positive tiny probability as zero or confuse scientific notation with e', () => {
    expect(Number(formatProbabilityResult(1e-12))).toBe(1e-12);
    expect(formatCalculationNumber(1e-12, true)).toBe('1\\times 10^{-12}');
    expect(formatProbabilityResult(0.5)).toBe('0.500000');
  });
});

describe('independent conditional-normal integration references', () => {
  // References use one-dimensional Simpson quadrature of the normal conditional CDF.
  it.each([
    [0.5, [-1, 1, -1, 1], 0.4979717778392062],
    [-0.9, [-2, 0.5, 0.1, 2], 0.420625398918525],
    [0.9, [-2, 0.5, 0.1, 2], 0.1691784269653263],
  ])('converges toward the independent reference with correlation %s', (correlation, bounds, reference) => {
    const [x1, x2, y1, y2] = bounds;
    const input = { distribution: 'bivariate-normal', parameters: { ...parameters, correlation }, region: { x1, x2, y1, y2 } };
    const fine = calculateJointIntegral({ ...input, subdivisions: 150 }).estimate;
    const coarse = calculateJointIntegral({ ...input, subdivisions: 15 }).estimate;
    expect(Math.abs(fine - reference)).toBeLessThan(1e-5);
    expect(Math.abs(fine - reference)).toBeLessThan(Math.abs(coarse - reference));
  });
});
