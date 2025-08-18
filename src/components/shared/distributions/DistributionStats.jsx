import React from 'react';
import { distributionThemes, typography } from '@/utils/distribution-theme';
import { distributions } from '@/utils/distributions';

/**
 * Enhanced statistics display component for distributions
 * Shows theoretical values, observed values, and formulas
 * 
 * @param {Object} props
 * @param {String} props.distributionType - Type of distribution (binomial, geometric, etc.)
 * @param {Object} props.parameters - Distribution parameters
 * @param {Object} props.observedStats - Optional observed statistics to compare
 * @param {Boolean} props.showFormulas - Whether to show mathematical formulas
 * @param {Boolean} props.showComparison - Whether to show theoretical vs observed
 * @param {String} props.layout - 'horizontal' or 'vertical' layout
 * @param {Object} props.theme - Optional theme override
 */
const DistributionStats = ({
  distributionType,
  parameters,
  observedStats = null,
  showFormulas = true,
  showComparison = false,
  layout = 'horizontal',
  theme = null
}) => {
  // Get theme
  const distTheme = theme || distributionThemes[distributionType] || distributionThemes.binomial;
  
  // Calculate theoretical statistics
  const theoreticalStats = React.useMemo(() => {
    const dist = distributions[distributionType];
    if (!dist || !parameters) return null;
    
    try {
      const mean = dist.mean(parameters);
      const variance = dist.variance(parameters);
      const stdDev = Math.sqrt(variance);
      
      return {
        mean,
        variance,
        stdDev,
        mode: dist.mode ? dist.mode(parameters) : null
      };
    } catch (error) {
      return null;
    }
  }, [distributionType, parameters]);
  
  if (!theoreticalStats) return null;
  
  // Get distribution-specific formulas
  const getFormulas = () => {
    switch (distributionType) {
      case 'binomial':
        return {
          mean: 'μ = np',
          variance: 'σ² = np(1-p)',
          pmf: 'P(X=k) = C(n,k)p^k(1-p)^(n-k)'
        };
      case 'geometric':
        return {
          mean: 'μ = 1/p',
          variance: 'σ² = (1-p)/p²',
          pmf: 'P(X=k) = (1-p)^(k-1)p'
        };
      case 'negativeBinomial':
        return {
          mean: 'μ = r/p',
          variance: 'σ² = r(1-p)/p²',
          pmf: 'P(X=k) = C(k-1,r-1)p^r(1-p)^(k-r)'
        };
      case 'poisson':
        return {
          mean: 'μ = λ',
          variance: 'σ² = λ',
          pmf: 'P(X=k) = (λ^k e^(-λ))/k!'
        };
      default:
        return {};
    }
  };
  
  const formulas = getFormulas();
  
  // Stat card component
  const StatCard = ({ label, value, formula, observed, icon }) => (
    <div className={`
      bg-neutral-800/50 rounded-lg p-4
      border border-neutral-700
      hover:bg-neutral-800/70 transition-all duration-300
      ${showComparison && observed !== null ? 'space-y-2' : ''}
    `}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`${typography.label} flex items-center gap-2 text-white`}>
          {icon && <span className="text-lg">{icon}</span>}
          {label}
        </h4>
        {showFormulas && formula && (
          <span className={`${typography.tiny} ${typography.math} text-neutral-400`}>
            {formula}
          </span>
        )}
      </div>
      
      <div className={showComparison && observed !== null ? 'space-y-1' : ''}>
        <div className="flex items-baseline gap-2">
          <span className={`${typography.value} text-teal-400`}>
            {typeof value === 'number' ? value.toFixed(4) : value}
          </span>
          {showComparison && observed !== null && (
            <span className={`${typography.small} text-neutral-500`}>
              (theoretical)
            </span>
          )}
        </div>
        
        {showComparison && observed !== null && (
          <div className="flex items-baseline gap-2">
            <span className={`${typography.value} text-neutral-300`}>
              {typeof observed === 'number' ? observed.toFixed(4) : observed}
            </span>
            <span className={`${typography.small} text-neutral-500`}>
              (observed)
            </span>
          </div>
        )}
      </div>
      
      {showComparison && observed !== null && (
        <div className="mt-2 pt-2 border-t border-neutral-700">
          <div className="flex items-center gap-2">
            <span className={`${typography.tiny} text-neutral-500`}>
              Difference:
            </span>
            <span className={`
              ${typography.small} ${typography.mono}
              ${Math.abs(value - observed) < 0.01 ? 'text-green-600' : 'text-orange-600'}
            `}>
              {(Math.abs(value - observed)).toFixed(4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
  
  const stats = [
    {
      label: 'Mean',
      value: theoreticalStats.mean,
      formula: formulas.mean,
      observed: observedStats?.mean,
      icon: '𝜇'
    },
    {
      label: 'Variance',
      value: theoreticalStats.variance,
      formula: formulas.variance,
      observed: observedStats?.variance,
      icon: '𝜎²'
    },
    {
      label: 'Std Dev',
      value: theoreticalStats.stdDev,
      formula: formulas.variance ? '𝜎 = √(𝜎²)' : null,
      observed: observedStats?.stdDev,
      icon: '𝜎'
    }
  ];
  
  if (theoreticalStats.mode !== null) {
    stats.push({
      label: 'Mode',
      value: theoreticalStats.mode,
      formula: null,
      observed: observedStats?.mode,
      icon: 'Mo'
    });
  }
  
  return (
    <div className="distribution-stats">
      {showFormulas && formulas.pmf && (
        <div className="mb-4 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
          <h4 className={`${typography.label} text-teal-400 mb-1`}>
            Probability Mass Function
          </h4>
          <p className={`${typography.mono} text-neutral-300`}>
            {formulas.pmf}
          </p>
        </div>
      )}
      
      <div className={`
        ${layout === 'horizontal' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
          : 'space-y-4'}
      `}>
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      
      {/* Parameters display */}
      <div className="mt-4 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
        <h4 className={`${typography.label} text-white mb-2`}>
          Current Parameters
        </h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(parameters).map(([key, value]) => (
            <div key={key} className="flex items-center gap-1">
              <span className={`${typography.small} text-neutral-400`}>
                {key}:
              </span>
              <span className={`${typography.mono} ${typography.small} text-teal-400`}>
                {typeof value === 'number' ? value.toFixed(3) : value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DistributionStats;