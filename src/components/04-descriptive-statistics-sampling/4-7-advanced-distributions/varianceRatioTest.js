import jStat from 'jstat';

// Equal-tail test with the first sample kept in the numerator. Reference:
// https://itl.nist.gov/div898/handbook/eda/section3/eda359.htm
export function calculateVarianceRatioTest({ n1, n2, s1_squared, s2_squared, alpha }) {
  if (![n1, n2].every(value => Number.isInteger(value) && value >= 2)) {
    return { valid: false, error: 'Each sample needs an integer size of at least 2.' };
  }
  if (![s1_squared, s2_squared].every(value => Number.isFinite(value) && value > 0)) {
    return { valid: false, error: 'Both sample variances must be finite and positive.' };
  }
  if (!Number.isFinite(alpha) || alpha <= 0 || alpha >= 1) {
    return { valid: false, error: 'The significance level must be strictly between 0 and 1.' };
  }
  const df1 = n1 - 1;
  const df2 = n2 - 1;
  const fStatistic = s1_squared / s2_squared;
  const lowerCriticalValue = jStat.centralF.inv(alpha / 2, df1, df2);
  const upperCriticalValue = jStat.centralF.inv(1 - alpha / 2, df1, df2);
  if (![fStatistic, lowerCriticalValue, upperCriticalValue].every(value => Number.isFinite(value) && value > 0)
    || lowerCriticalValue >= upperCriticalValue) {
    return { valid: false, error: 'These inputs exceed the numerical range of this calculation. Choose less extreme values.' };
  }
  return { valid: true, df1, df2, fStatistic, lowerCriticalValue, upperCriticalValue,
    rejectNull: fStatistic < lowerCriticalValue || fStatistic > upperCriticalValue };
}
