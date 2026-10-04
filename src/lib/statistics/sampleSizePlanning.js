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
