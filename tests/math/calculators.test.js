import { describe, expect, it } from 'vitest';
import { calculateJointIntegral, createJointPDF, validateRectangle } from '@/components/03-continuous-random-variables/3-6-joint-distributions/calculatorMath';

const parameters = { correlation: 0, a: 2, b: 3, lambda1: 1.2, lambda2: 1.5 };
const region = { x1: 0, x2: 1, y1: 0, y2: 2 };
const integrate = overrides => calculateJointIntegral({ distribution: 'exponential', parameters, region, ...overrides });

describe('joint-density rectangle integration', () => {
  it('clips uniform support and factors the exact area probability', () => {
    const result = integrate({ distribution: 'uniform', region: { x1: -1, x2: 1, y1: 1, y2: 4 }, subdivisions: 60 });
    // Intersection [0,1] × [1,3] has area 2, out of support area 6.
    expect(result.exactProbability).toBeCloseTo(1 / 3, 14);
    expect(result.estimate).toBeCloseTo(1 / 3, 12);
    expect(integrate({ distribution: 'uniform', region: { x1: 3, x2: 4, y1: 0, y2: 2 } }).exactProbability).toBe(0);
    expect(integrate({ distribution: 'uniform', region: { x1: -10, x2: 10, y1: -10, y2: 10 } }).exactProbability).toBe(1);
  });

  it('uses independent exponential interval masses as a reference', () => {
    // Integral on [0,1] × [0,2] is (1−e^-1.2)(1−e^-3).
    expect(integrate().exactProbability).toBeCloseTo(0.6640142965404116, 13);
    const clipped = integrate({ region: { x1: -3, x2: 1, y1: -4, y2: 2 } });
    expect(clipped.exactProbability).toBeCloseTo(0.6640142965404116, 13);
    expect(integrate({ region: { x1: -2, x2: -1, y1: 0, y2: 1 } }).exactProbability).toBe(0);
  });

  it('preserves small nonzero exponential masses without subtractive cancellation', () => {
    const result = integrate({ parameters: { ...parameters, lambda1: 1, lambda2: 1 }, region: { x1: 0, x2: 1e-10, y1: 0, y2: 1e-10 } });
    expect(result.exactProbability).toBeGreaterThan(0);
    expect(result.exactProbability / 1e-20).toBeCloseTo(1, 9);
  });

  it('converges to independent normal rectangle mass when correlation is zero', () => {
    const result = integrate({ distribution: 'bivariate-normal', region: { x1: -1, x2: 1, y1: -1, y2: 1 }, subdivisions: 150 });
    // Each marginal has P(-1 ≤ Z ≤ 1) = 0.6826894921370859.
    expect(result.estimate).toBeCloseTo(0.4660649426743922, 5);
    expect(result.exactProbability).toBeNull();
    expect(createJointPDF('bivariate-normal', parameters)(0, 0)).toBeCloseTo(1 / (2 * Math.PI), 14);
  });

  it('brackets and converges on a smooth decreasing density', () => {
    const reference = integrate().exactProbability;
    const left = integrate({ method: 'left', subdivisions: 5 });
    const right = integrate({ method: 'right', subdivisions: 5 });
    expect(left.estimate).toBeGreaterThan(reference);
    expect(right.estimate).toBeLessThan(reference);
    for (const method of ['left', 'right', 'midpoint']) {
      const coarse = integrate({ method, subdivisions: 5 });
      const fine = integrate({ method, subdivisions: 100 });
      expect(Math.abs(fine.estimate - reference)).toBeLessThan(Math.abs(coarse.estimate - reference));
    }
  });

  it('keeps coarse overestimates visible instead of clamping them into probabilities', () => {
    const result = integrate({ method: 'left', subdivisions: 5, parameters: { ...parameters, lambda1: 3, lambda2: 3 }, region: { x1: 0, x2: 4, y1: 0, y2: 4 } });
    expect(result.estimate).toBeGreaterThan(1);
    expect(result.outsideProbabilityRange).toBe(true);
    expect(result.exactProbability).toBeCloseTo(0.99998771161304, 12);
  });

  it.each([
    { x1: 1, x2: 1, y1: -1, y2: 2 },
    { x1: -1, x2: 2, y1: 1, y2: 1 },
    { x1: 0, x2: 0, y1: 0, y2: 0 },
  ])('assigns zero probability and no animation steps to zero-area rectangles: %o', selected => {
    const result = integrate({ region: selected });
    expect(result.estimate).toBe(0);
    expect(result.exactProbability).toBe(0);
    expect(result.rectangles).toEqual([]);
    expect(result.partialSums).toEqual([]);
    expect(result.subdivisions.total).toBe(0);
  });

  it('ends the animation partial sums at the same estimate', () => {
    const result = integrate({ subdivisions: 5 });
    expect(result.rectangles).toHaveLength(25);
    expect(result.partialSums).toHaveLength(25);
    expect(result.partialSums.at(-1)).toBe(result.estimate);
    expect(result.partialSums.every((value, index, values) => index === 0 || value >= values[index - 1])).toBe(true);
  });
});

describe('joint-calculator validation', () => {
  it.each([
    { x1: 2, x2: 1, y1: 0, y2: 1 },
    { x1: 0, x2: 1, y1: 2, y2: 1 },
    { x1: 2, x2: 1, y1: 2, y2: 1 },
  ])('rejects reversed bounds instead of generating signed probability: %o', selected => {
    expect(() => integrate({ region: selected })).toThrow(/Lower bounds/);
  });

  it.each([NaN, Infinity, -Infinity, '', undefined])('rejects nonfinite or missing bounds: %s', value => {
    expect(() => validateRectangle({ ...region, x1: value })).toThrow(/finite number/);
  });

  it.each([-1, 1, NaN, Infinity])('rejects invalid bivariate correlation: %s', correlation => {
    expect(() => integrate({ distribution: 'bivariate-normal', parameters: { ...parameters, correlation } })).toThrow(/Correlation/);
  });

  it.each(['a', 'b', 'lambda1', 'lambda2'])('requires positive finite %s', key => {
    const distribution = key.startsWith('lambda') ? 'exponential' : 'uniform';
    for (const value of [0, -1, Infinity, NaN]) {
      expect(() => integrate({ distribution, parameters: { ...parameters, [key]: value } })).toThrow(/positive finite/);
    }
  });

  it.each([0, -1, 1.5, 501, Infinity, NaN])('rejects unsupported subdivision counts: %s', subdivisions => {
    expect(() => integrate({ subdivisions })).toThrow(/subdivisions/);
  });

  it('rejects unsupported methods and models', () => {
    expect(() => integrate({ method: 'trapezoid' })).toThrow(/method/);
    expect(() => integrate({ distribution: 'unknown' })).toThrow(/distribution/);
  });

  it('rejects numerical overflow and underflow rather than producing invalid estimates', () => {
    expect(() => integrate({ region: { x1: -Number.MAX_VALUE, x2: Number.MAX_VALUE, y1: 0, y2: 1 } })).toThrow(/numerical range/);
    expect(() => integrate({ region: { x1: 0, x2: 1e-200, y1: 0, y2: 1e-200 } })).toThrow(/too small/);
    expect(() => integrate({ region: { x1: 0, x2: Number.MIN_VALUE, y1: 0, y2: 1 } })).toThrow(/too small/);
  });
});
