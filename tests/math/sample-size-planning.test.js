import { describe, expect, it } from 'vitest';
import { planEnrollmentForExpectedLoss, solveBudgetSampleSize } from '@/lib/statistics/sampleSizePlanning';

const defaults = { costPerSubject: 100, fixedCosts: 5000, budgetLimit: 55000, sigma: 15 };

describe('integer sample-size budget planning', () => {
  // References independently evaluated from integer affordability and the
  // normal-model half-width, including both sides of the plotting window.
  it.each([
    [defaults, 500, 1.3148079707698763, 55000],
    [{ ...defaults, costPerSubject: 70 }, 714, 1.100267347190726, 54980],
    [{ costPerSubject: 500, fixedCosts: 5000, budgetLimit: 10000, sigma: 30 }, 10, 18.59419264179007, 10000],
    [{ costPerSubject: 10, fixedCosts: 0, budgetLimit: 200000, sigma: 5 }, 20000, 0.06929646455628166, 200000],
    [{ costPerSubject: 500, fixedCosts: 9500, budgetLimit: 10000, sigma: 5 }, 1, 9.8, 10000],
    [{ costPerSubject: 12.5, fixedCosts: 6.25, budgetLimit: 50, sigma: 2 }, 3, 2.263213055223333, 43.75],
  ])('matches the independent integer and half-width reference %#', (input, n, E, cost) => {
    const result = solveBudgetSampleSize(input);
    expect(result.status).toBe('feasible');
    expect(result.n).toBe(n);
    expect(result.E).toBeCloseTo(E, 12);
    expect(result.cost).toBe(cost);
    expect(input.fixedCosts + n * input.costPerSubject).toBeLessThanOrEqual(input.budgetLimit);
    expect(input.fixedCosts + (n + 1) * input.costPerSubject).toBeGreaterThan(input.budgetLimit);
  });

  it('uses exact decimal money at and just below integer affordability boundaries', () => {
    for (const [costPerSubject, budgetLimit, n] of [[.01, .29, 29], [.01, .35, 35], [.1, .3, 3], [.1, .29999999999999993, 2]]) {
      const result = solveBudgetSampleSize({ costPerSubject, fixedCosts: 0, budgetLimit, sigma: 1 });
      expect(result).toMatchObject({ status: 'feasible', n });
      expect(result.cost).toBeLessThanOrEqual(budgetLimit);
    }
    expect(solveBudgetSampleSize({ costPerSubject: .01, fixedCosts: .06, budgetLimit: .35, sigma: 1 }).n).toBe(29);
  });

  it.each([
    { ...defaults, fixedCosts: 10000, budgetLimit: 10000 },
    { ...defaults, fixedCosts: 20000, budgetLimit: 10000 },
    { ...defaults, fixedCosts: 9950, budgetLimit: 10000 },
  ])('has no positive affordable sample for %#', input => {
    expect(solveBudgetSampleSize(input)).toMatchObject({ status: 'infeasible', n: 0, E: null, cost: null });
  });

  it('agrees with an independent enumeration and is monotone in the available budget', () => {
    let previous = null;
    for (const budgetLimit of [5000, 5099, 5100, 5200, 55000, 55099, 55100, 100000]) {
      const input = { ...defaults, budgetLimit };
      const result = solveBudgetSampleSize(input);
      const feasible = Array.from({ length: 1001 }, (_, index) => index + 1)
        .filter(n => 5000 + 100 * n <= budgetLimit);
      expect(result.n).toBe(feasible.at(-1) || 0);
      if (result.status !== 'feasible') continue;
      if (previous) { expect(result.n).toBeGreaterThanOrEqual(previous.n); expect(result.E).toBeLessThanOrEqual(previous.E); }
      previous = result;
    }
    expect(Number.isFinite(solveBudgetSampleSize({ ...defaults, sigma: Number.MAX_VALUE }).E)).toBe(true);
    const base = solveBudgetSampleSize(defaults);
    expect(solveBudgetSampleSize({ ...defaults, sigma: 30 }).E).toBeCloseTo(2 * base.E, 12);
    expect(solveBudgetSampleSize({ ...defaults, z: 2.576 }).n).toBe(base.n);
  });

  it('rejects invalid, nonfinite and unrepresentable plans without numeric placeholders', () => {
    const inputs = [null, undefined, 3, [], {},
      ...['costPerSubject', 'fixedCosts', 'budgetLimit', 'sigma', 'z'].flatMap(key =>
        [NaN, Infinity, -Infinity, '15'].map(value => ({ ...defaults, [key]: value }))),
      { ...defaults, costPerSubject: 0 }, { ...defaults, costPerSubject: -1 },
      { ...defaults, sigma: 0 }, { ...defaults, fixedCosts: -1 },
      { ...defaults, budgetLimit: -1 }, { ...defaults, z: 0 },
      { ...defaults, costPerSubject: Number.MIN_VALUE },
      { ...defaults, sigma: Number.MAX_VALUE, z: Number.MAX_VALUE },
    ];
    for (const input of inputs) expect(solveBudgetSampleSize(input)).toMatchObject({ status: 'invalid', n: null, E: null, cost: null });
  });
});

describe('enrollment for an illustrative expected loss rate', () => {
  it.each([[139, 164, 139.4], [166, 196, 166.6], [390, 459, 390.15]])('plans target %i with fifteen-percent expected loss', (target, enrollment, expectedRetained) => {
    const result = planEnrollmentForExpectedLoss(target, 0.15);
    expect(result).toMatchObject({ status: 'feasible', enrollment });
    expect(result.expectedRetained).toBeCloseTo(expectedRetained, 10);
    expect(result.expectedRetained).toBeGreaterThanOrEqual(target);
    expect((enrollment - 1) * 0.85).toBeLessThan(target);
    expect(Math.ceil(target * 1.15) * 0.85).toBeLessThan(target);
  });

  it('does not add an extra person at an exact decimal retention boundary', () => {
    expect(planEnrollmentForExpectedLoss(21, .3)).toEqual({ status: 'feasible', enrollment: 30, expectedRetained: 21 });
    expect(planEnrollmentForExpectedLoss(21, .30000000000000004).enrollment).toBe(31);
    expect(planEnrollmentForExpectedLoss(21, .29999999999999993).enrollment).toBe(30);
  });

  it('needs no additional enrollment when the expected loss rate is zero', () => {
    expect(planEnrollmentForExpectedLoss(139, 0)).toEqual({ status: 'feasible', enrollment: 139, expectedRetained: 139 });
  });

  it('rejects invalid targets and rates or an unsafe integer enrollment', () => {
    for (const target of [0, -1, 1.5, NaN, Infinity, '139', Number.MAX_SAFE_INTEGER + 1]) {
      expect(planEnrollmentForExpectedLoss(target)).toMatchObject({ status: 'invalid', enrollment: null, expectedRetained: null });
    }
    for (const loss of [-1, 1, 1.5, NaN, Infinity, '0.15']) {
      expect(planEnrollmentForExpectedLoss(139, loss)).toMatchObject({ status: 'invalid', enrollment: null, expectedRetained: null });
    }
    expect(planEnrollmentForExpectedLoss(Number.MAX_SAFE_INTEGER, .5).status).toBe('invalid');
  });
});
