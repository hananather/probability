import { jStat } from 'jstat';

const invalidBudget = () => ({
  status: 'invalid',
  n: null,
  E: null,
  cost: null,
  message: 'Enter finite positive subject cost and standard deviation, with nonnegative fixed costs and budget.',
});

// Align the decimal representations before integer division so binary
// rounding cannot change an affordable count or an enrollment ceiling.
function decimalParts(value) {
  const [mantissa, exponent = '0'] = value.toString().split('e');
  const [whole, fraction = ''] = mantissa.split('.');
  let coefficient = BigInt(whole + fraction);
  let scale = fraction.length - Number(exponent);
  if (scale < 0) { coefficient *= 10n ** BigInt(-scale); scale = 0; }
  return { coefficient, scale };
}
const atScale = (value, scale) => value.coefficient * 10n ** BigInt(scale - value.scale);
const asNumber = (coefficient, scale) => Number(`${coefficient}e-${scale}`);
const maximumSafeInteger = BigInt(Number.MAX_SAFE_INTEGER);

export function normalMeanCriticalValue(confidence) {
  if (!Number.isFinite(confidence) || confidence <= 0 || confidence >= 100) return null;
  const lowerTail = (100 - confidence) / 200;
  if (lowerTail <= 0 || lowerTail >= 0.5) return null;
  const criticalValue = -jStat.normal.inv(lowerTail, 0, 1);
  return Number.isFinite(criticalValue) && criticalValue > 0 ? criticalValue : null;
}

const invalidNormalPlan = message => ({
  status: 'invalid', n: null, criticalValue: null, unroundedN: null, message,
});

/** Normal mean interval planning; keep the computed quantile until integer rounding. */
export function planNormalMeanSampleSize(input = {}) {
  if (!input || typeof input !== 'object') return invalidNormalPlan('Enter valid sample-size planning inputs.');
  const { sigma, E, confidence } = input;
  if (!Number.isFinite(sigma) || sigma <= 0) return invalidNormalPlan('Enter a positive, finite population standard deviation (σ).');
  if (!Number.isFinite(E) || E <= 0) return invalidNormalPlan('Enter a positive, finite margin of error (E).');
  if (!Number.isFinite(confidence) || confidence <= 0 || confidence >= 100) return invalidNormalPlan('Choose a confidence level greater than 0% and less than 100%.');
  const criticalValue = normalMeanCriticalValue(confidence);
  if (criticalValue === null) return invalidNormalPlan('The critical value cannot be represented safely at this confidence level.');

  // The count uses decimal input values and the computed quantile's decimal
  // representation. This avoids product overflow and binary ceiling overshoot;
  // it does not turn a numerical quantile into an exact mathematical constant.
  const [z, deviation, margin] = [criticalValue, sigma, E].map(decimalParts);
  let numerator = (z.coefficient * deviation.coefficient) ** 2n;
  let denominator = margin.coefficient ** 2n;
  const exponent = 2 * (margin.scale - z.scale - deviation.scale);
  if (exponent >= 0) numerator *= 10n ** BigInt(exponent);
  else denominator *= 10n ** BigInt(-exponent);
  const integerCount = (numerator + denominator - 1n) / denominator;
  if (integerCount > maximumSafeInteger) return invalidNormalPlan('The sample size cannot be represented safely for these inputs. Use less extreme values.');
  const unroundedN = (criticalValue * (sigma / E)) ** 2;
  return {
    status: 'feasible', n: Number(integerCount), criticalValue,
    unroundedN: unroundedN > 0 && Number.isFinite(unroundedN) ? unroundedN : null,
    message: null,
  };
}

export function solveBudgetSampleSize(input = {}) {
  if (!input || typeof input !== 'object') return invalidBudget();
  const { costPerSubject, fixedCosts, budgetLimit, sigma, z = 1.96 } = input;
  if (![costPerSubject, fixedCosts, budgetLimit, sigma, z].every(Number.isFinite)
    || costPerSubject <= 0 || sigma <= 0 || z <= 0 || fixedCosts < 0 || budgetLimit < 0) return invalidBudget();

  const [subject, fixed, budget] = [costPerSubject, fixedCosts, budgetLimit].map(decimalParts);
  const scale = Math.max(subject.scale, fixed.scale, budget.scale);
  const subjectUnits = atScale(subject, scale);
  const fixedUnits = atScale(fixed, scale);
  const availableUnits = atScale(budget, scale) - fixedUnits;
  if (availableUnits < subjectUnits) return {
    status: 'infeasible', n: 0, E: null, cost: null,
    message: 'The budget does not cover one observation after fixed costs.',
  };
  const integerCount = availableUnits / subjectUnits;
  if (integerCount > maximumSafeInteger) return invalidBudget();
  const n = Number(integerCount);
  const scaledSigma = z * sigma;
  const E = Number.isFinite(scaledSigma) ? scaledSigma / Math.sqrt(n) : z * (sigma / Math.sqrt(n));
  const cost = asNumber(fixedUnits + subjectUnits * integerCount, scale);
  if (!Number.isFinite(E) || E <= 0 || !Number.isFinite(cost) || cost <= 0) return invalidBudget();
  return { status: 'feasible', n, E, cost, message: null };
}

export function planEnrollmentForExpectedLoss(required, lossRate = 0.15) {
  if (!Number.isSafeInteger(required) || required < 1 || !Number.isFinite(lossRate) || lossRate < 0 || lossRate >= 1) {
    return { status: 'invalid', enrollment: null, expectedRetained: null };
  }
  const loss = decimalParts(lossRate);
  const denominator = 10n ** BigInt(loss.scale);
  const retention = denominator - loss.coefficient;
  const target = BigInt(required) * denominator;
  const integerEnrollment = (target + retention - 1n) / retention;
  if (integerEnrollment > maximumSafeInteger) return { status: 'invalid', enrollment: null, expectedRetained: null };
  const enrollment = Number(integerEnrollment);
  const expectedRetained = asNumber(integerEnrollment * retention, loss.scale);
  return { status: 'feasible', enrollment, expectedRetained };
}
