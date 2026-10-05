export function validateRectangle(region) {
  if (!region || !['x1', 'x2', 'y1', 'y2'].every(key => Number.isFinite(region[key]))) {
    throw new RangeError('Enter a finite number for each of the four bounds.');
  }
  if (region.x1 > region.x2 || region.y1 > region.y2) {
    throw new RangeError('Lower bounds must be less than or equal to upper bounds.');
  }
  return region;
}

export function createJointPDF(distribution, parameters) {
  switch (distribution) {
    case 'bivariate-normal': {
      const rho = parameters.correlation;
      if (!Number.isFinite(rho) || Math.abs(rho) >= 1) {
        throw new RangeError('Correlation must be between -1 and 1, excluding the endpoints.');
      }
      const varianceFactor = 1 - rho * rho;
      const normalization = 1 / (2 * Math.PI * Math.sqrt(varianceFactor));
      return (x, y) => normalization * Math.exp(-(x * x - 2 * rho * x * y + y * y) / (2 * varianceFactor));
    }
    case 'uniform': {
      const { a, b } = parameters;
      if (![a, b].every(value => Number.isFinite(value) && value > 0)) {
        throw new RangeError('Uniform support widths a and b must be positive finite numbers.');
      }
      return (x, y) => x >= 0 && x <= a && y >= 0 && y <= b ? 1 / a / b : 0;
    }
    case 'exponential': {
      const { lambda1, lambda2 } = parameters;
      if (![lambda1, lambda2].every(value => Number.isFinite(value) && value > 0)) {
        throw new RangeError('Exponential rates must be positive finite numbers.');
      }
      const logRates = Math.log(lambda1) + Math.log(lambda2);
      return (x, y) => x >= 0 && y >= 0 ? Math.exp(logRates - lambda1 * x - lambda2 * y) : 0;
    }
    default:
      throw new RangeError('Choose a supported joint distribution.');
  }
}

// Both of these models have independent coordinates, so rectangle mass factors.
function closedFormRectangleProbability(distribution, parameters, region) {
  const { x1, x2, y1, y2 } = region;
  if (distribution === 'uniform') {
    const xWidth = Math.max(0, Math.min(x2, parameters.a) - Math.max(x1, 0));
    const yWidth = Math.max(0, Math.min(y2, parameters.b) - Math.max(y1, 0));
    return xWidth / parameters.a * (yWidth / parameters.b);
  }
  if (distribution === 'exponential') {
    const mass = (lower, upper, rate) => {
      if (upper <= 0) return 0;
      const start = Math.max(lower, 0);
      return Math.exp(-rate * start) * -Math.expm1(-rate * (upper - start));
    };
    return mass(x1, x2, parameters.lambda1) * mass(y1, y2, parameters.lambda2);
  }
  return null;
}

export function calculateJointIntegral({ distribution, parameters, region, method = 'midpoint', subdivisions = 20 }) {
  validateRectangle(region);
  const pdf = createJointPDF(distribution, parameters);
  if (!Number.isInteger(subdivisions) || subdivisions < 1 || subdivisions > 500) {
    throw new RangeError('Choose an integer number of subdivisions between 1 and 500.');
  }
  if (!['left', 'right', 'midpoint'].includes(method)) {
    throw new RangeError('Choose the left, right, or midpoint integration method.');
  }

  const { x1, x2, y1, y2 } = region;
  const dx = (x2 - x1) / subdivisions;
  const dy = (y2 - y1) / subdivisions;
  const area = dx * dy;
  if (![dx, dy, area].every(Number.isFinite)) {
    throw new RangeError('The selected rectangle exceeds the supported numerical range.');
  }
  if ((x2 > x1 && dx === 0) || (y2 > y1 && dy === 0) || (dx > 0 && dy > 0 && area === 0)) {
    throw new RangeError('The selected rectangle is too small to evaluate at this numerical scale.');
  }
  const exactProbability = closedFormRectangleProbability(distribution, parameters, region);
  const rectangles = [];
  const partialSums = [];
  let estimate = 0;

  if (area > 0) {
    const offset = method === 'left' ? 0 : method === 'right' ? 1 : 0.5;
    for (let i = 0; i < subdivisions; i++) {
      for (let j = 0; j < subdivisions; j++) {
        const x = x1 + (i + offset) * dx;
        const y = y1 + (j + offset) * dy;
        const value = pdf(x, y);
        if (!Number.isFinite(value) || value < 0) {
          throw new RangeError('The density cannot be evaluated at this numerical scale.');
        }
        estimate += value * area;
        if (!Number.isFinite(estimate)) {
          throw new RangeError('The integral exceeds the supported numerical range.');
        }
        rectangles.push({ x: x1 + i * dx, y: y1 + j * dy, width: dx, height: dy, value, samplePoint: { x, y }, step: i * subdivisions + j });
        partialSums.push(estimate);
      }
    }
  }

  return {
    estimate,
    exactProbability,
    outsideProbabilityRange: estimate > 1,
    rectangles,
    partialSums,
    method,
    subdivisions: { nx: subdivisions, ny: subdivisions, total: rectangles.length },
    stepSize: { dx, dy, area },
  };
}

// Preserve finite input values; scientific notation uses base 10 in TeX.
export function formatCalculationNumber(value, latex = false) {
  if (!Number.isFinite(value)) throw new RangeError('Cannot display a non-finite calculation value.');
  const text = String(value);
  if (!latex || !text.includes('e')) return text;
  const [mantissa, exponent] = text.split('e');
  return `${mantissa}\\times 10^{${Number(exponent)}}`;
}

export function formatProbabilityResult(value, latex = false, decimalPlaces = 6) {
  const rounded = value.toFixed(decimalPlaces);
  return value !== 0 && Number(rounded) === 0
    ? formatCalculationNumber(value, latex)
    : rounded;
}
