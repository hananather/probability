/**
 * Test file demonstrating usage of distribution utilities
 * This shows how components can import and use the distribution functions
 */

import {
  // PMF functions
  binomialPMF,
  geometricPMF,
  negativeBinomialPMF,
  poissonPMF,
  
  // Helper functions
  binomialCoefficient,
  logBinomialCoefficient,
  factorial,
  logFactorial,
  
  // Statistical properties
  binomialProperties,
  geometricProperties,
  negativeBinomialProperties,
  poissonProperties,
  
  // Utility functions
  generatePMFData,
  findEffectiveSupport,
  discreteQuantile
} from './distributions.js';

// Example 1: Using binomial PMF in a component
function exampleBinomialUsage() {
  const n = 10;
  const p = 0.5;
  
  // Calculate individual probabilities
  for (let k = 0; k <= n; k++) {
    const prob = binomialPMF(k, n, p);
    console.log(`P(X = ${k}) = ${prob.toFixed(4)}`);
  }
  
  // Get statistical properties
  const mean = binomialProperties.mean(n, p);
  const variance = binomialProperties.variance(n, p);
  const stdDev = binomialProperties.stdDev(n, p);
  
  console.log(`Mean: ${mean}, Variance: ${variance}, Std Dev: ${stdDev}`);
}

// Example 2: Generate data for plotting
function examplePlottingData() {
  // Binomial distribution data
  const binomialData = generatePMFData(binomialPMF, [20, 0.3], 20);
  console.log('Binomial PMF data:', binomialData);
  
  // Poisson distribution data
  const poissonData = generatePMFData(poissonPMF, [5], 20);
  console.log('Poisson PMF data:', poissonData);
}

// Example 3: Edge case handling
function exampleEdgeCases() {
  // Edge cases are handled gracefully
  console.log('Binomial p=0:', binomialPMF(0, 10, 0)); // Should be 1
  console.log('Binomial p=0, k>0:', binomialPMF(1, 10, 0)); // Should be 0
  console.log('Binomial p=1:', binomialPMF(10, 10, 1)); // Should be 1
  console.log('Binomial p=1, k<n:', binomialPMF(9, 10, 1)); // Should be 0
  
  console.log('Poisson λ=0:', poissonPMF(0, 0)); // Should be 1
  console.log('Poisson λ=0, k>0:', poissonPMF(1, 0)); // Should be 0
}

// Example 4: Large number handling with log space
function exampleLargeNumbers() {
  // Large binomial coefficient
  const largeCoeff = binomialCoefficient(100, 50);
  console.log('C(100, 50):', largeCoeff);
  
  // Large factorial using log space
  const logFact = logFactorial(100);
  console.log('log(100!):', logFact);
  
  // Large binomial PMF (uses log space internally)
  const largePMF = binomialPMF(50, 100, 0.5);
  console.log('P(X=50) for Binomial(100, 0.5):', largePMF);
}

// Example 5: Finding effective support and quantiles
function exampleSupportAndQuantiles() {
  // Find range containing 99.9% of probability mass
  const poissonSupport = findEffectiveSupport(poissonPMF, [10], 0.999);
  console.log('Poisson(10) 99.9% support:', poissonSupport);
  
  // Find median (50th percentile)
  const median = discreteQuantile(binomialPMF, [20, 0.5], 0.5);
  console.log('Binomial(20, 0.5) median:', median);
  
  // Find 95th percentile
  const p95 = discreteQuantile(poissonPMF, [5], 0.95);
  console.log('Poisson(5) 95th percentile:', p95);
}

// Example 6: Component integration pattern
export function ExampleDistributionComponent({ distribution, params }) {
  // Generate PMF data for visualization
  const pmfData = generatePMFData(
    distribution === 'binomial' ? binomialPMF :
    distribution === 'geometric' ? geometricPMF :
    distribution === 'negativeBinomial' ? negativeBinomialPMF :
    poissonPMF,
    params
  );
  
  // Get properties based on distribution type
  const properties = 
    distribution === 'binomial' ? binomialProperties :
    distribution === 'geometric' ? geometricProperties :
    distribution === 'negativeBinomial' ? negativeBinomialProperties :
    poissonProperties;
  
  const mean = properties.mean(...params);
  const variance = properties.variance(...params);
  
  return {
    pmfData,
    mean,
    variance,
    // ... rest of component logic
  };
}

// Run examples if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  console.log('=== Binomial Usage Example ===');
  exampleBinomialUsage();
  
  console.log('\n=== Plotting Data Example ===');
  examplePlottingData();
  
  console.log('\n=== Edge Cases Example ===');
  exampleEdgeCases();
  
  console.log('\n=== Large Numbers Example ===');
  exampleLargeNumbers();
  
  console.log('\n=== Support and Quantiles Example ===');
  exampleSupportAndQuantiles();
}