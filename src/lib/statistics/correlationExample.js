// The 20 fuel samples used in Chapter 7.1's worked example.
export const CORRELATION_EXAMPLE_DATA = [
  { x: 0.99, y: 90.01 },
  { x: 1.02, y: 89.05 },
  { x: 1.15, y: 91.43 },
  { x: 1.29, y: 93.74 },
  { x: 1.46, y: 96.73 },
  { x: 1.36, y: 94.45 },
  { x: 0.87, y: 87.59 },
  { x: 1.23, y: 91.77 },
  { x: 1.55, y: 99.42 },
  { x: 1.40, y: 93.65 },
  { x: 1.19, y: 93.54 },
  { x: 1.15, y: 92.52 },
  { x: 0.98, y: 90.56 },
  { x: 1.01, y: 89.54 },
  { x: 1.11, y: 89.85 },
  { x: 1.20, y: 90.39 },
  { x: 1.26, y: 93.25 },
  { x: 1.32, y: 93.41 },
  { x: 1.43, y: 94.98 },
  { x: 0.95, y: 87.33 }
];

export function calculateCorrelationStatistics(data) {
  const n = data.length;
  const sumX = data.reduce((sum, d) => sum + d.x, 0);
  const sumY = data.reduce((sum, d) => sum + d.y, 0);
  const sumX2 = data.reduce((sum, d) => sum + d.x * d.x, 0);
  const sumY2 = data.reduce((sum, d) => sum + d.y * d.y, 0);
  const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  const Sxx = data.reduce((sum, d) => sum + Math.pow(d.x - meanX, 2), 0);
  const Syy = data.reduce((sum, d) => sum + Math.pow(d.y - meanY, 2), 0);
  const Sxy = data.reduce((sum, d) => sum + (d.x - meanX) * (d.y - meanY), 0);

  // Alternative computational formula values
  const SxxAlt = sumX2 - (sumX * sumX) / n;
  const SyyAlt = sumY2 - (sumY * sumY) / n;
  const SxyAlt = sumXY - (sumX * sumY) / n;

  const r = Sxy / Math.sqrt(Sxx * Syy);

  // Standard deviations
  const sx = Math.sqrt(Sxx / (n - 1));
  const sy = Math.sqrt(Syy / (n - 1));

  return { n, sumX, sumY, sumX2, sumY2, sumXY, meanX, meanY, Sxx, Syy, Sxy, SxxAlt, SyyAlt, SxyAlt, r, sx, sy };
}

export const CORRELATION_EXAMPLE_STATISTICS = calculateCorrelationStatistics(CORRELATION_EXAMPLE_DATA);
