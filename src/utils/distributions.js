/**
 * Discrete distribution utilities
 * Provides PMF, CDF, statistics, and support range calculations for common discrete distributions
 */

// Helper function for binomial coefficient
export function binomialCoefficient(n, k) {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  
  k = Math.min(k, n - k);
  let c = 1;
  for (let i = 0; i < k; i++) {
    c = c * (n - i) / (i + 1);
  }
  return c;
}

// Helper function for factorial
export function factorial(n) {
  if (n < 0) return 0;
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Binomial Distribution
export function binomialPMF(k, n, p) {
  if (k > n || k < 0 || !Number.isInteger(k)) return 0;
  return binomialCoefficient(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

export function binomialCDF(k, n, p) {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += binomialPMF(i, n, p);
  }
  return sum;
}

export function binomialStats(n, p) {
  return {
    mean: n * p,
    variance: n * p * (1 - p),
    mode: Math.floor((n + 1) * p)
  };
}

// Geometric Distribution
export function geometricPMF(k, p) {
  if (k < 1 || !Number.isInteger(k)) return 0;
  return Math.pow(1 - p, k - 1) * p;
}

export function geometricCDF(k, p) {
  if (k < 1) return 0;
  return 1 - Math.pow(1 - p, k);
}

export function geometricStats(p) {
  return {
    mean: 1 / p,
    variance: (1 - p) / (p * p),
    mode: 1
  };
}

// Negative Binomial Distribution
export function negativeBinomialPMF(k, r, p) {
  if (k < r || !Number.isInteger(k)) return 0;
  return binomialCoefficient(k - 1, r - 1) * Math.pow(p, r) * Math.pow(1 - p, k - r);
}

export function negativeBinomialCDF(k, r, p) {
  let sum = 0;
  for (let i = r; i <= k; i++) {
    sum += negativeBinomialPMF(i, r, p);
  }
  return sum;
}

export function negativeBinomialStats(r, p) {
  return {
    mean: r / p,
    variance: (r * (1 - p)) / (p * p),
    mode: r > 1 ? Math.floor((r - 1) / p) + 1 : 1
  };
}

// Poisson Distribution
export function poissonPMF(k, lambda) {
  if (k < 0 || !Number.isInteger(k)) return 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

export function poissonCDF(k, lambda) {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += poissonPMF(i, lambda);
  }
  return sum;
}

export function poissonStats(lambda) {
  return {
    mean: lambda,
    variance: lambda,
    mode: Math.floor(lambda)
  };
}

// Hypergeometric Distribution
export function hypergeometricPMF(k, N, K, n) {
  if (k < Math.max(0, n - N + K) || k > Math.min(n, K)) return 0;
  return (binomialCoefficient(K, k) * binomialCoefficient(N - K, n - k)) / binomialCoefficient(N, n);
}

export function hypergeometricCDF(k, N, K, n) {
  let sum = 0;
  const minK = Math.max(0, n - N + K);
  for (let i = minK; i <= k; i++) {
    sum += hypergeometricPMF(i, N, K, n);
  }
  return sum;
}

export function hypergeometricStats(N, K, n) {
  const p = K / N;
  return {
    mean: n * p,
    variance: n * p * (1 - p) * ((N - n) / (N - 1)),
    mode: Math.floor(((n + 1) * (K + 1)) / (N + 2))
  };
}

// Support range calculation with cumulative probability threshold
export function getSupportRange(type, params, threshold = 0.999) {
  let min, max;
  
  switch (type) {
    case 'binomial':
      min = 0;
      max = params.n;
      break;
      
    case 'geometric':
      min = 1;
      // Find max where CDF >= threshold
      max = Math.ceil(-Math.log(1 - threshold) / Math.log(1 - params.p));
      break;
      
    case 'negativeBinomial':
      min = params.r;
      // Approximate using mean + k*std
      const nbMean = params.r / params.p;
      const nbStd = Math.sqrt((params.r * (1 - params.p)) / (params.p * params.p));
      max = Math.ceil(nbMean + 4 * nbStd);
      break;
      
    case 'poisson':
      min = 0;
      // Use quantile approximation
      const poissonMean = params.lambda;
      const poissonStd = Math.sqrt(params.lambda);
      max = Math.ceil(poissonMean + 4 * poissonStd);
      // Ensure we capture enough of the distribution
      if (params.lambda < 5) {
        max = Math.max(max, 15);
      }
      break;
      
    case 'hypergeometric':
      min = Math.max(0, params.n - params.N + params.K);
      max = Math.min(params.n, params.K);
      break;
      
    default:
      min = 0;
      max = 20;
  }
  
  return { min, max };
}

// Configuration object for easy access to all distribution functions
export const distributionConfig = {
  binomial: {
    pmf: binomialPMF,
    cdf: binomialCDF,
    stats: binomialStats,
    paramNames: ['n', 'p'],
    paramLabels: { n: 'Number of trials', p: 'Success probability' }
  },
  geometric: {
    pmf: geometricPMF,
    cdf: geometricCDF,
    stats: geometricStats,
    paramNames: ['p'],
    paramLabels: { p: 'Success probability' }
  },
  negativeBinomial: {
    pmf: negativeBinomialPMF,
    cdf: negativeBinomialCDF,
    stats: negativeBinomialStats,
    paramNames: ['r', 'p'],
    paramLabels: { r: 'Number of successes', p: 'Success probability' }
  },
  poisson: {
    pmf: poissonPMF,
    cdf: poissonCDF,
    stats: poissonStats,
    paramNames: ['lambda'],
    paramLabels: { lambda: 'Rate parameter' }
  },
  hypergeometric: {
    pmf: hypergeometricPMF,
    cdf: hypergeometricCDF,
    stats: hypergeometricStats,
    paramNames: ['N', 'K', 'n'],
    paramLabels: { N: 'Population size', K: 'Success states', n: 'Sample size' }
  }
};

// Calculate PMF data for a given distribution
export function calculatePMFData(type, params, range = null) {
  const config = distributionConfig[type];
  if (!config) throw new Error(`Unknown distribution type: ${type}`);
  
  const { min, max } = range || getSupportRange(type, params);
  const data = [];
  
  for (let k = min; k <= max; k++) {
    const pmfArgs = [k, ...config.paramNames.map(p => params[p])];
    const probability = config.pmf(...pmfArgs);
    if (probability > 0) {
      data.push({ k, probability });
    }
  }
  
  return data;
}

// Calculate CDF data for a given distribution
export function calculateCDFData(type, params, range = null) {
  const config = distributionConfig[type];
  if (!config) throw new Error(`Unknown distribution type: ${type}`);
  
  const { min, max } = range || getSupportRange(type, params);
  const data = [];
  
  for (let k = min; k <= max; k++) {
    const cdfArgs = [k, ...config.paramNames.map(p => params[p])];
    const cumulative = config.cdf(...cdfArgs);
    data.push({ k, cumulative });
  }
  
  return data;
}

// Calculate probability for a range P(a <= X <= b)
export function calculateRangeProbability(type, params, a, b) {
  const config = distributionConfig[type];
  if (!config) throw new Error(`Unknown distribution type: ${type}`);
  
  let sum = 0;
  for (let k = a; k <= b; k++) {
    const pmfArgs = [k, ...config.paramNames.map(p => params[p])];
    sum += config.pmf(...pmfArgs);
  }
  
  return sum;
}

// Validation functions
export function validateBinomialParams(n, p) {
  return n > 0 && Number.isInteger(n) && p >= 0 && p <= 1;
}

// Generate binomial PMF data for visualization
export function generateBinomialPMFData(n, p) {
  const data = [];
  for (let k = 0; k <= n; k++) {
    data.push({
      x: k,
      y: binomialPMF(k, n, p),
      cumulative: binomialCDF(k, n, p)
    });
  }
  return data;
}

// Cache management
export function clearBinomialCache() {
  // Placeholder for cache clearing if needed
}

// Poisson process generation
export function generatePoissonProcess(lambda, duration) {
  const events = [];
  let currentTime = 0;
  
  while (currentTime < duration) {
    // Generate exponential random variable for inter-arrival time
    const u = Math.random();
    const interArrivalTime = -Math.log(1 - u) / lambda;
    currentTime += interArrivalTime;
    
    if (currentTime < duration) {
      events.push(currentTime);
    }
  }
  
  return events;
}

// Export distributions object for compatibility
export const distributions = {
  binomial: {
    mean: (params) => params.n * params.p,
    variance: (params) => params.n * params.p * (1 - params.p),
    mode: (params) => Math.floor((params.n + 1) * params.p)
  },
  geometric: {
    mean: (params) => 1 / params.p,
    variance: (params) => (1 - params.p) / (params.p * params.p),
    mode: (params) => 1
  },
  negativeBinomial: {
    mean: (params) => params.r / params.p,
    variance: (params) => (params.r * (1 - params.p)) / (params.p * params.p),
    mode: (params) => params.r > 1 ? Math.floor((params.r - 1) / params.p) + 1 : 1
  },
  poisson: {
    mean: (params) => params.lambda,
    variance: (params) => params.lambda,
    mode: (params) => Math.floor(params.lambda)
  }
};