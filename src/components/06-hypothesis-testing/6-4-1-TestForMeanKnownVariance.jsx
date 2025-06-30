"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';
import { useDiscoveries } from '@/hooks/useDiscoveries';
import { MathematicalDiscoveries } from '@/components/ui/MathematicalDiscoveries';
// import { tutorial_6_4_1 } from '@/tutorials/chapter6';

const colorScheme = createColorScheme('hypothesis');

// Sample data from manufacturing process
const SAMPLE_DATA = [
  42.5, 39.8, 40.3, 43.1, 39.6, 41.0,
  39.9, 42.1, 40.7, 41.6, 42.1, 40.8
];

// Learning stages for progressive disclosure
const LEARNING_STAGES = [
  {
    id: 'setup-hypothesis',
    title: 'Part A: Set Up Hypothesis Test',
    description: 'Learn to formulate null and alternative hypotheses',
    unlocks: ['hypothesis-toggle', 'significance-level']
  },
  {
    id: 'test-statistic', 
    title: 'Part A: Calculate Test Statistic',
    description: 'Compute the standardized test statistic',
    unlocks: ['test-statistic-formula', 'sample-mean-display']
  },
  {
    id: 'critical-value',
    title: 'Part B: Critical Value Method',
    description: 'Use critical values to make decisions',
    unlocks: ['critical-value-viz', 'rejection-region']
  },
  {
    id: 'p-value',
    title: 'Part B: P-Value Method', 
    description: 'Calculate p-value and compare to α',
    unlocks: ['p-value-viz', 'p-value-calculation']
  },
  {
    id: 'confidence-interval',
    title: 'Part C: Connection to Confidence Intervals',
    description: 'See how hypothesis tests relate to confidence intervals',
    unlocks: ['confidence-interval-viz', 'ci-hypothesis-connection']
  }
];

// Discovery definitions
const discoveryDefinitions = [
  {
    id: 'null-hypothesis',
    title: 'Null Hypothesis',
    description: 'The claim we assume true until evidence suggests otherwise',
    formula: 'H_0: \\mu = \\mu_0',
    category: 'concept'
  },
  {
    id: 'alternative-hypothesis',
    title: 'Alternative Hypothesis',
    description: 'The claim we want to test for',
    formula: 'H_a: \\mu > \\mu_0 \\text{ (or } \\mu < \\mu_0 \\text{ or } \\mu \\neq \\mu_0\\text{)}',
    category: 'concept'
  },
  {
    id: 'test-statistic-formula',
    title: 'Test Statistic Formula',
    description: 'Standardizes the sample mean for hypothesis testing',
    formula: 'Z = \\frac{\\bar{X} - \\mu_0}{\\sigma/\\sqrt{n}}',
    category: 'formula'
  },
  {
    id: 'critical-value-decision',
    title: 'Critical Value Decision Rule',
    description: 'Reject H₀ if test statistic falls in rejection region',
    category: 'pattern'
  },
  {
    id: 'p-value-decision',
    title: 'P-Value Decision Rule',
    description: 'Reject H₀ if p-value < α',
    category: 'pattern'
  },
  {
    id: 'ci-hypothesis-equivalence',
    title: 'CI-Hypothesis Test Equivalence',
    description: 'Two-tailed tests are equivalent to checking if μ₀ is in the CI',
    category: 'pattern'
  }
];

export default function TestForMeanKnownVariance() {
  // State management
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);
  const [hypothesisType, setHypothesisType] = useState('right'); // 'left', 'right', 'two'
  const [significanceLevel, setSignificanceLevel] = useState(0.05);
  const [showAnimation, setShowAnimation] = useState(false);
  const [explorationMode, setExplorationMode] = useState(false);
  const [sampleMean, setSampleMean] = useState(null);
  const [explorationMean, setExplorationMean] = useState(41.125);
  const [explorationN, setExplorationN] = useState(12);

  // Known parameters
  const mu0 = 40; // null hypothesis mean
  const sigma = 1.2; // known population standard deviation
  const n = SAMPLE_DATA.length;

  // Discovery tracking
  const { discoveries, markDiscovered } = useDiscoveries(discoveryDefinitions);

  // Calculate sample statistics
  useEffect(() => {
    const mean = SAMPLE_DATA.reduce((sum, x) => sum + x, 0) / n;
    setSampleMean(mean);
  }, []);

  // Check if stage is unlocked
  const isStageUnlocked = (stageId) => {
    const index = LEARNING_STAGES.findIndex(s => s.id === stageId);
    return index === 0 || completedStages.includes(LEARNING_STAGES[index - 1].id);
  };

  // Check if feature is unlocked
  const isFeatureUnlocked = (featureId) => {
    return LEARNING_STAGES.some(stage => 
      completedStages.includes(stage.id) && stage.unlocks.includes(featureId)
    );
  };

  // Complete current stage
  const completeStage = () => {
    const stage = LEARNING_STAGES[currentStage];
    if (!completedStages.includes(stage.id)) {
      setCompletedStages([...completedStages, stage.id]);
      
      // Advance to next stage if available
      if (currentStage < LEARNING_STAGES.length - 1) {
        setCurrentStage(currentStage + 1);
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 1500);
      }
    }
  };

  // Calculate test statistic
  const calculateTestStatistic = (mean = sampleMean) => {
    if (!mean) return 0;
    return (mean - mu0) / (sigma / Math.sqrt(explorationMode ? explorationN : n));
  };

  // Get critical value(s)
  const getCriticalValues = () => {
    const z = jStat.normal.inv(1 - significanceLevel, 0, 1);
    
    switch (hypothesisType) {
      case 'left':
        return { lower: -z, upper: null };
      case 'right':
        return { lower: null, upper: z };
      case 'two':
        const z2 = jStat.normal.inv(1 - significanceLevel/2, 0, 1);
        return { lower: -z2, upper: z2 };
    }
  };

  // Calculate p-value
  const calculatePValue = (z) => {
    switch (hypothesisType) {
      case 'left':
        return jStat.normal.cdf(z, 0, 1);
      case 'right':
        return 1 - jStat.normal.cdf(z, 0, 1);
      case 'two':
        return 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1));
    }
  };

  // Progress calculation
  const totalDiscoveries = discoveryDefinitions.length;
  const discoveredCount = discoveries.length;
  const progress = (discoveredCount / totalDiscoveries) * 100;

  if (!sampleMean) return null;

  const testStatistic = calculateTestStatistic(explorationMode ? explorationMean : sampleMean);
  const criticalValues = getCriticalValues();
  const pValue = calculatePValue(testStatistic);

  return (
    <VisualizationContainer
      title="Test for Mean with Known Variance"
      description="Learn how to test hypotheses about population means when variance is known"
      // tutorial={tutorial_6_4_1}
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <ProgressBar 
          value={progress} 
          max={100}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-neutral-400">
          <span>{discoveredCount} / {totalDiscoveries} concepts discovered</span>
          <span>{completedStages.length} / {LEARNING_STAGES.length} stages completed</span>
        </div>
      </div>

      {/* Manufacturing Context */}
      <VisualizationSection className="mb-6 p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-700/30">
        <h3 className="text-lg font-semibold text-white mb-3">Manufacturing Quality Testing</h3>
        <p className="text-neutral-300 mb-3">
          Components are manufactured to have strength μ = 40 units with known σ = 1.2 units. 
          After modifying the production process, we collected a sample of n = 12 components
          to test if the mean strength has increased.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-neutral-800/50 rounded p-3">
            <div className="text-xs text-neutral-400">Null Mean (μ₀)</div>
            <div className="text-xl font-mono text-white">{mu0}</div>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <div className="text-xs text-neutral-400">Known σ</div>
            <div className="text-xl font-mono text-white">{sigma}</div>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <div className="text-xs text-neutral-400">Sample Size</div>
            <div className="text-xl font-mono text-white">{n}</div>
          </div>
          <div className="bg-neutral-800/50 rounded p-3">
            <div className="text-xs text-neutral-400">Sample Mean</div>
            <div className="text-xl font-mono text-green-400">{sampleMean.toFixed(3)}</div>
          </div>
        </div>
      </VisualizationSection>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Learning Stages Column */}
        <div className={cn(
          "space-y-6",
          completedStages.length >= 2 ? "lg:w-3/4" : "w-full"
        )}>
          {LEARNING_STAGES.map((stage, index) => {
          const isUnlocked = isStageUnlocked(stage.id);
          const isActive = index === currentStage;
          const isCompleted = completedStages.includes(stage.id);

          return (
            <VisualizationSection
              key={stage.id}
              className={cn(
                "transition-all duration-500",
                !isUnlocked && "opacity-50",
                isActive && showAnimation && "ring-2 ring-purple-500 ring-opacity-50"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                    isCompleted ? "bg-green-600 text-white" :
                    isActive ? "bg-purple-600 text-white" :
                    isUnlocked ? "bg-neutral-700 text-neutral-300" :
                    "bg-neutral-800 text-neutral-500"
                  )}>
                    {isCompleted ? "✓" : index + 1}
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-lg font-semibold",
                      isUnlocked ? "text-white" : "text-neutral-500"
                    )}>
                      {stage.title}
                    </h3>
                    <p className="text-sm text-neutral-400">{stage.description}</p>
                  </div>
                </div>
                {isActive && !isCompleted && (
                  <Button
                    onClick={completeStage}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Complete Stage
                  </Button>
                )}
              </div>

              {isUnlocked && (
                <div className="mt-4">
                  {stage.id === 'setup-hypothesis' && <PartASetup />}
                  {stage.id === 'test-statistic' && <PartATestStatistic />}
                  {stage.id === 'critical-value' && <PartBCriticalValue />}
                  {stage.id === 'p-value' && <PartBPValue />}
                  {stage.id === 'confidence-interval' && <PartCConfidenceInterval />}
                </div>
              )}
            </VisualizationSection>
          );
          })}
        </div>

        {/* Interactive Exploration Panel */}
        {completedStages.length >= 2 && (
          <div className="lg:w-1/4">
            <VisualizationSection className="sticky top-4 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Exploration Mode
              </h3>
              
              <div className="space-y-4">
                {/* Toggle Exploration Mode */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-300">Enable Exploration</span>
                  <button
                    onClick={() => setExplorationMode(!explorationMode)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      explorationMode ? "bg-purple-600" : "bg-neutral-600"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        explorationMode ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
                
                {explorationMode && (
                  <>
                    {/* Sample Mean Slider */}
                    <div>
                      <label className="text-sm text-neutral-400 mb-2 block">
                        Sample Mean: {explorationMean.toFixed(3)}
                      </label>
                      <input
                        type="range"
                        min="38"
                        max="44"
                        step="0.1"
                        value={explorationMean}
                        onChange={(e) => setExplorationMean(parseFloat(e.target.value))}
                        className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-neutral-500 mt-1">
                        <span>38</span>
                        <span>41 (actual)</span>
                        <span>44</span>
                      </div>
                    </div>
                    
                    {/* Sample Size Slider */}
                    <div>
                      <label className="text-sm text-neutral-400 mb-2 block">
                        Sample Size: {explorationN}
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        step="1"
                        value={explorationN}
                        onChange={(e) => setExplorationN(parseInt(e.target.value))}
                        className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-neutral-500 mt-1">
                        <span>5</span>
                        <span>12 (actual)</span>
                        <span>100</span>
                      </div>
                    </div>
                    
                    {/* Current Test Statistics */}
                    <div className="bg-neutral-800/50 rounded-lg p-3 space-y-2">
                      <div className="text-xs text-neutral-400">Current Values:</div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Z-score:</span>
                          <span className="font-mono text-purple-400">
                            {calculateTestStatistic(explorationMean).toFixed(3)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">P-value:</span>
                          <span className="font-mono text-purple-400">
                            {calculatePValue(calculateTestStatistic(explorationMean)).toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Decision:</span>
                          <span className={cn(
                            "font-semibold",
                            calculatePValue(calculateTestStatistic(explorationMean)) < significanceLevel
                              ? "text-red-400" : "text-green-400"
                          )}>
                            {calculatePValue(calculateTestStatistic(explorationMean)) < significanceLevel
                              ? "Reject H₀" : "Fail to Reject"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Reset Button */}
                    <Button
                      onClick={() => {
                        setExplorationMean(sampleMean);
                        setExplorationN(n);
                      }}
                      className="w-full bg-neutral-700 hover:bg-neutral-600"
                      size="sm"
                    >
                      Reset to Actual Values
                    </Button>
                  </>
                )}
              </div>
            </VisualizationSection>
          </div>
        )}
      </div>

      {/* Mathematical Discoveries */}
      {discoveries.length > 0 && (
        <MathematicalDiscoveries 
          discoveries={discoveries}
          title="Hypothesis Testing Concepts"
          className="mt-6 text-xs"
        />
      )}
      
      {/* Decision Rules Summary Table */}
      {completedStages.length === LEARNING_STAGES.length && (
        <VisualizationSection className="mt-6 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Decision Rules Summary
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left p-3 text-neutral-400">Test Type</th>
                  <th className="text-left p-3 text-neutral-400">Alternative Hypothesis</th>
                  <th className="text-left p-3 text-neutral-400">Critical Value Method</th>
                  <th className="text-left p-3 text-neutral-400">P-Value Method</th>
                  <th className="text-left p-3 text-neutral-400">CI Method (α = 0.05)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-800">
                  <td className="p-3 text-white font-semibold">Left-tailed</td>
                  <td className="p-3 font-mono text-purple-300">H₁: μ &lt; μ₀</td>
                  <td className="p-3 text-neutral-300">Reject if Z &lt; -z<sub>α</sub></td>
                  <td className="p-3 text-neutral-300">Reject if p-value &lt; α</td>
                  <td className="p-3 text-neutral-300">Reject if μ₀ &gt; CI upper</td>
                </tr>
                <tr className="border-b border-neutral-800">
                  <td className="p-3 text-white font-semibold">Right-tailed</td>
                  <td className="p-3 font-mono text-purple-300">H₁: μ &gt; μ₀</td>
                  <td className="p-3 text-neutral-300">Reject if Z &gt; z<sub>α</sub></td>
                  <td className="p-3 text-neutral-300">Reject if p-value &lt; α</td>
                  <td className="p-3 text-neutral-300">Reject if μ₀ &lt; CI lower</td>
                </tr>
                <tr>
                  <td className="p-3 text-white font-semibold">Two-tailed</td>
                  <td className="p-3 font-mono text-purple-300">H₁: μ ≠ μ₀</td>
                  <td className="p-3 text-neutral-300">Reject if |Z| &gt; z<sub>α/2</sub></td>
                  <td className="p-3 text-neutral-300">Reject if p-value &lt; α</td>
                  <td className="p-3 text-neutral-300">Reject if μ₀ ∉ CI</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
            <h4 className="font-semibold text-purple-300 mb-2">Key Takeaways</h4>
            <ul className="text-sm text-neutral-300 space-y-1 list-disc list-inside">
              <li>All three methods (Critical Value, P-Value, CI) lead to the same decision</li>
              <li>The P-Value method is most commonly used in practice</li>
              <li>CI method only works directly for two-tailed tests at the same α level</li>
              <li>Always state your decision in context of the original problem</li>
            </ul>
          </div>
        </VisualizationSection>
      )}
    </VisualizationContainer>
  );

  // Part A: Hypothesis Setup Component
  function PartASetup() {
    return (
      <div className="space-y-4">
        <div className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700">
          <h4 className="text-base font-semibold text-white mb-4">Step 1: State the Hypotheses</h4>
          
          {/* Hypothesis Type Toggle */}
          <div className="mb-6">
            <label className="text-sm text-neutral-300 mb-2 block">Select Test Type:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'left', label: 'Left-tailed', symbol: '<' },
                { value: 'right', label: 'Right-tailed', symbol: '>' },
                { value: 'two', label: 'Two-tailed', symbol: '≠' }
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => {
                    setHypothesisType(type.value);
                    if (!discoveries.includes('alternative-hypothesis')) {
                      markDiscovered('alternative-hypothesis');
                    }
                  }}
                  className={cn(
                    "p-3 rounded-lg transition-all duration-300",
                    hypothesisType === type.value
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                  )}
                >
                  <div className="font-semibold">{type.label}</div>
                  <div className="text-xs mt-1">H₁: μ {type.symbol} {mu0}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Display Current Hypotheses */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-900/50 rounded p-4">
              <div className="text-sm text-neutral-400 mb-2">Null Hypothesis</div>
              <div className="text-lg font-mono text-white">H₀: μ = {mu0}</div>
              <div className="text-xs text-neutral-500 mt-2">
                Claim that process hasn't changed
              </div>
            </div>
            <div className="bg-purple-900/20 rounded p-4 border border-purple-700/30">
              <div className="text-sm text-purple-400 mb-2">Alternative Hypothesis</div>
              <div className="text-lg font-mono text-purple-300">
                H₁: μ {hypothesisType === 'left' ? '<' : hypothesisType === 'right' ? '>' : '≠'} {mu0}
              </div>
              <div className="text-xs text-purple-400/80 mt-2">
                {hypothesisType === 'right' ? 'Process improved' :
                 hypothesisType === 'left' ? 'Process degraded' :
                 'Process changed'}
              </div>
            </div>
          </div>
        </div>

        {/* Significance Level Selection */}
        <div className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700">
          <h4 className="text-base font-semibold text-white mb-4">Step 2: Set Significance Level (α)</h4>
          
          <div className="space-y-3">
            {[0.01, 0.05, 0.10].map(alpha => (
              <button
                key={alpha}
                onClick={() => {
                  setSignificanceLevel(alpha);
                  if (!discoveries.includes('null-hypothesis')) {
                    markDiscovered('null-hypothesis');
                  }
                }}
                className={cn(
                  "w-full p-3 rounded-lg transition-all duration-300 text-left",
                  significanceLevel === alpha
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                )}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-mono text-lg">α = {alpha}</div>
                    <div className="text-xs opacity-80">
                      {alpha === 0.01 ? 'Very strict (1% chance of Type I error)' :
                       alpha === 0.05 ? 'Standard (5% chance of Type I error)' :
                       'Lenient (10% chance of Type I error)'}
                    </div>
                  </div>
                  {significanceLevel === alpha && (
                    <div className="text-2xl">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Part A: Test Statistic Component
  function PartATestStatistic() {
    useEffect(() => {
      if (!discoveries.includes('test-statistic-formula')) {
        markDiscovered('test-statistic-formula');
      }
    }, [discoveries, markDiscovered]);
    
    return (
      <div className="space-y-4">
        <div className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700">
          <h4 className="text-base font-semibold text-white mb-4">Step 3: Calculate Test Statistic</h4>
          
          {/* Formula Display */}
          <div className="bg-neutral-900/50 rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-2xl text-white mb-4">
                Z = <span className="text-green-400">(X̄ - μ₀)</span> / <span className="text-blue-400">(σ/√n)</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mt-6">
                <div>
                  <div className="text-green-400 font-mono text-lg">{sampleMean.toFixed(3)} - {mu0}</div>
                  <div className="text-xs text-neutral-400">Difference from null</div>
                </div>
                <div>
                  <div className="text-blue-400 font-mono text-lg">{sigma} / √{n}</div>
                  <div className="text-xs text-neutral-400">Standard error</div>
                </div>
                <div>
                  <div className="text-purple-400 font-mono text-2xl font-bold">
                    Z = {testStatistic.toFixed(3)}
                  </div>
                  <div className="text-xs text-neutral-400">Test statistic</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className={cn(
            "rounded-lg p-4",
            testStatistic > 0 ? "bg-green-900/20 border border-green-700/30" : "bg-red-900/20 border border-red-700/30"
          )}>
            <div className="text-sm">
              The sample mean is <span className="font-bold">{Math.abs(testStatistic).toFixed(2)} standard errors</span>
              {testStatistic > 0 ? ' above' : ' below'} the null hypothesis mean.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Part B: Critical Value Method Component
  function PartBCriticalValue() {
    const criticalRef = useRef(null);
    
    useEffect(() => {
      if (!discoveries.includes('critical-value-decision')) {
        markDiscovered('critical-value-decision');
      }
    }, [discoveries, markDiscovered]);
    
    useEffect(() => {
      if (!criticalRef.current) return;
      
      const svg = d3.select(criticalRef.current);
      const { width } = criticalRef.current.getBoundingClientRect();
      const height = 300;
      const margin = { top: 20, right: 20, bottom: 60, left: 40 };
      
      svg.selectAll("*").remove();
      svg.attr("viewBox", `0 0 ${width} ${height}`);
      
      // Create scales
      const xScale = d3.scaleLinear()
        .domain([-4, 4])
        .range([margin.left, width - margin.right]);
        
      const yScale = d3.scaleLinear()
        .domain([0, 0.45])
        .range([height - margin.bottom, margin.top]);
      
      // Create normal distribution curve
      const normalCurve = d3.range(-4, 4.01, 0.01).map(z => ({
        x: z,
        y: jStat.normal.pdf(z, 0, 1)
      }));
      
      // Create line generator
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveNatural);
      
      // Draw axes
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(9))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .text("Z-score");
        
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5));
      
      // Draw normal curve
      svg.append("path")
        .datum(normalCurve)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2)
        .attr("d", line);
      
      // Draw critical regions
      const drawCriticalRegion = (start, end, isRejection) => {
        const regionData = normalCurve.filter(d => d.x >= start && d.x <= end);
        
        svg.append("path")
          .datum(regionData)
          .attr("fill", isRejection ? "red" : "green")
          .attr("fill-opacity", 0.3)
          .attr("stroke", "none")
          .attr("d", d3.area()
            .x(d => xScale(d.x))
            .y0(yScale(0))
            .y1(d => yScale(d.y))
            .curve(d3.curveNatural)
          );
      };
      
      // Draw regions based on hypothesis type
      if (hypothesisType === 'left') {
        drawCriticalRegion(-4, criticalValues.lower, true);
        drawCriticalRegion(criticalValues.lower, 4, false);
        
        // Draw critical value line
        svg.append("line")
          .attr("x1", xScale(criticalValues.lower))
          .attr("x2", xScale(criticalValues.lower))
          .attr("y1", yScale(0))
          .attr("y2", yScale(0.45))
          .attr("stroke", "red")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
          
        // Label
        svg.append("text")
          .attr("x", xScale(criticalValues.lower))
          .attr("y", margin.top)
          .attr("text-anchor", "middle")
          .attr("fill", "red")
          .text(`z = ${criticalValues.lower.toFixed(3)}`);
      } else if (hypothesisType === 'right') {
        drawCriticalRegion(-4, criticalValues.upper, false);
        drawCriticalRegion(criticalValues.upper, 4, true);
        
        svg.append("line")
          .attr("x1", xScale(criticalValues.upper))
          .attr("x2", xScale(criticalValues.upper))
          .attr("y1", yScale(0))
          .attr("y2", yScale(0.45))
          .attr("stroke", "red")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
          
        svg.append("text")
          .attr("x", xScale(criticalValues.upper))
          .attr("y", margin.top)
          .attr("text-anchor", "middle")
          .attr("fill", "red")
          .text(`z = ${criticalValues.upper.toFixed(3)}`);
      } else {
        drawCriticalRegion(-4, criticalValues.lower, true);
        drawCriticalRegion(criticalValues.lower, criticalValues.upper, false);
        drawCriticalRegion(criticalValues.upper, 4, true);
        
        [criticalValues.lower, criticalValues.upper].forEach(cv => {
          svg.append("line")
            .attr("x1", xScale(cv))
            .attr("x2", xScale(cv))
            .attr("y1", yScale(0))
            .attr("y2", yScale(0.45))
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");
            
          svg.append("text")
            .attr("x", xScale(cv))
            .attr("y", margin.top)
            .attr("text-anchor", "middle")
            .attr("fill", "red")
            .text(`z = ${cv.toFixed(3)}`);
        });
      }
      
      // Draw test statistic
      svg.append("line")
        .attr("x1", xScale(testStatistic))
        .attr("x2", xScale(testStatistic))
        .attr("y1", yScale(0))
        .attr("y2", yScale(0.35))
        .attr("stroke", "purple")
        .attr("stroke-width", 3)
        .style("filter", "drop-shadow(0 0 6px purple)");
        
      svg.append("circle")
        .attr("cx", xScale(testStatistic))
        .attr("cy", yScale(0))
        .attr("r", 6)
        .attr("fill", "purple")
        .style("filter", "drop-shadow(0 0 6px purple)");
        
      svg.append("text")
        .attr("x", xScale(testStatistic))
        .attr("y", yScale(0.42))
        .attr("text-anchor", "middle")
        .attr("fill", "purple")
        .attr("font-weight", "bold")
        .text(`Z = ${testStatistic.toFixed(3)}`);
        
      // Region labels
      if (hypothesisType === 'two') {
        svg.append("text")
          .attr("x", xScale(0))
          .attr("y", height - 10)
          .attr("text-anchor", "middle")
          .attr("fill", "green")
          .text("Accept H₀");
          
        svg.append("text")
          .attr("x", xScale(-3))
          .attr("y", height - 10)
          .attr("text-anchor", "middle")
          .attr("fill", "red")
          .text("Reject H₀");
          
        svg.append("text")
          .attr("x", xScale(3))
          .attr("y", height - 10)
          .attr("text-anchor", "middle")
          .attr("fill", "red")
          .text("Reject H₀");
      }
      
    }, [hypothesisType, significanceLevel, testStatistic]);
    
    // Determine decision
    const isRejected = (() => {
      switch (hypothesisType) {
        case 'left':
          return testStatistic < criticalValues.lower;
        case 'right':
          return testStatistic > criticalValues.upper;
        case 'two':
          return Math.abs(testStatistic) > criticalValues.upper;
      }
    })();
    
    return (
      <div className="space-y-4">
        <GraphContainer>
          <h4 className="text-base font-semibold text-white mb-4">Critical Value Method</h4>
          <svg ref={criticalRef} style={{ width: "100%", height: 300 }} />
        </GraphContainer>
        
        <div className={cn(
          "rounded-lg p-4",
          isRejected ? "bg-red-900/20 border border-red-700/30" : "bg-green-900/20 border border-green-700/30"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">
                Decision: {isRejected ? "Reject H₀" : "Fail to Reject H₀"}
              </div>
              <div className="text-sm text-neutral-400 mt-1">
                Test statistic {isRejected ? "falls in" : "does not fall in"} the rejection region
              </div>
            </div>
            <div className="text-3xl">
              {isRejected ? "❌" : "✅"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Part B: P-Value Method Component
  function PartBPValue() {
    const pValueRef = useRef(null);
    
    useEffect(() => {
      if (!discoveries.includes('p-value-decision')) {
        markDiscovered('p-value-decision');
      }
    }, [discoveries, markDiscovered]);
    
    useEffect(() => {
      if (!pValueRef.current) return;
      
      const svg = d3.select(pValueRef.current);
      const { width } = pValueRef.current.getBoundingClientRect();
      const height = 300;
      const margin = { top: 20, right: 20, bottom: 60, left: 40 };
      
      svg.selectAll("*").remove();
      svg.attr("viewBox", `0 0 ${width} ${height}`);
      
      // Create scales
      const xScale = d3.scaleLinear()
        .domain([-4, 4])
        .range([margin.left, width - margin.right]);
        
      const yScale = d3.scaleLinear()
        .domain([0, 0.45])
        .range([height - margin.bottom, margin.top]);
      
      // Create normal distribution curve
      const normalCurve = d3.range(-4, 4.01, 0.01).map(z => ({
        x: z,
        y: jStat.normal.pdf(z, 0, 1)
      }));
      
      // Create line generator
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveNatural);
      
      // Draw axes
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(9))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .text("Z-score");
        
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5));
      
      // Draw normal curve
      svg.append("path")
        .datum(normalCurve)
        .attr("fill", "none")
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 2)
        .attr("d", line);
      
      // Draw p-value region
      const drawPValueRegion = () => {
        let regionData;
        
        if (hypothesisType === 'left') {
          regionData = normalCurve.filter(d => d.x <= testStatistic);
        } else if (hypothesisType === 'right') {
          regionData = normalCurve.filter(d => d.x >= testStatistic);
        } else {
          // Two-tailed: both extremes
          const absZ = Math.abs(testStatistic);
          regionData = normalCurve.filter(d => Math.abs(d.x) >= absZ);
        }
        
        svg.append("path")
          .datum(regionData)
          .attr("fill", colorScheme.chart.accent)
          .attr("fill-opacity", 0.4)
          .attr("stroke", "none")
          .attr("d", d3.area()
            .x(d => xScale(d.x))
            .y0(yScale(0))
            .y1(d => yScale(d.y))
            .curve(d3.curveNatural)
          );
      };
      
      drawPValueRegion();
      
      // Draw test statistic
      svg.append("line")
        .attr("x1", xScale(testStatistic))
        .attr("x2", xScale(testStatistic))
        .attr("y1", yScale(0))
        .attr("y2", yScale(0.35))
        .attr("stroke", "purple")
        .attr("stroke-width", 3)
        .style("filter", "drop-shadow(0 0 6px purple)");
        
      svg.append("circle")
        .attr("cx", xScale(testStatistic))
        .attr("cy", yScale(0))
        .attr("r", 6)
        .attr("fill", "purple")
        .style("filter", "drop-shadow(0 0 6px purple)");
        
      svg.append("text")
        .attr("x", xScale(testStatistic))
        .attr("y", yScale(0.42))
        .attr("text-anchor", "middle")
        .attr("fill", "purple")
        .attr("font-weight", "bold")
        .text(`Z = ${testStatistic.toFixed(3)}`);
      
      // P-value label
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.accent)
        .attr("font-size", "14")
        .text(`p-value = ${pValue.toFixed(4)}`);
        
      // Draw significance level line
      const alphaY = height / 2;
      svg.append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", alphaY)
        .attr("y2", alphaY)
        .attr("stroke", "yellow")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "10,5")
        .attr("opacity", 0.7);
        
      svg.append("text")
        .attr("x", width - margin.right - 10)
        .attr("y", alphaY - 5)
        .attr("text-anchor", "end")
        .attr("fill", "yellow")
        .text(`α = ${significanceLevel}`);
        
    }, [hypothesisType, significanceLevel, testStatistic, pValue]);
    
    const isRejected = pValue < significanceLevel;
    
    return (
      <div className="space-y-4">
        <GraphContainer>
          <h4 className="text-base font-semibold text-white mb-4">P-Value Method</h4>
          <svg ref={pValueRef} style={{ width: "100%", height: 300 }} />
        </GraphContainer>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <div className="text-sm text-neutral-400">P-Value</div>
            <div className="text-2xl font-mono text-purple-400">{pValue.toFixed(4)}</div>
            <div className="text-xs text-neutral-500 mt-1">
              Probability of getting this result if H₀ is true
            </div>
          </div>
          
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <div className="text-sm text-neutral-400">Significance Level (α)</div>
            <div className="text-2xl font-mono text-yellow-400">{significanceLevel}</div>
            <div className="text-xs text-neutral-500 mt-1">
              Maximum acceptable probability of Type I error
            </div>
          </div>
        </div>
        
        <div className={cn(
          "rounded-lg p-4",
          isRejected ? "bg-red-900/20 border border-red-700/30" : "bg-green-900/20 border border-green-700/30"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">
                Decision: {isRejected ? "Reject H₀" : "Fail to Reject H₀"}
              </div>
              <div className="text-sm text-neutral-400 mt-1">
                p-value ({pValue.toFixed(4)}) is {isRejected ? "<" : "≥"} α ({significanceLevel})
              </div>
            </div>
            <div className="text-3xl">
              {isRejected ? "❌" : "✅"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Part C: Confidence Interval Connection Component
  function PartCConfidenceInterval() {
    const ciRef = useRef(null);
    const confidenceLevel = 1 - significanceLevel;
    
    useEffect(() => {
      if (!discoveries.includes('ci-hypothesis-equivalence')) {
        markDiscovered('ci-hypothesis-equivalence');
      }
    }, [discoveries, markDiscovered]);
    const zScore = jStat.normal.inv(1 - significanceLevel/2, 0, 1);
    const standardError = sigma / Math.sqrt(n);
    const marginOfError = zScore * standardError;
    const ciLower = sampleMean - marginOfError;
    const ciUpper = sampleMean + marginOfError;
    
    useEffect(() => {
      if (!ciRef.current) return;
      
      const svg = d3.select(ciRef.current);
      const { width } = ciRef.current.getBoundingClientRect();
      const height = 200;
      const margin = { top: 40, right: 40, bottom: 40, left: 40 };
      
      svg.selectAll("*").remove();
      svg.attr("viewBox", `0 0 ${width} ${height}`);
      
      // Create scale
      const xScale = d3.scaleLinear()
        .domain([38, 44])
        .range([margin.left, width - margin.right]);
      
      // Draw axis
      svg.append("g")
        .attr("transform", `translate(0,${height / 2})`)
        .call(d3.axisBottom(xScale).ticks(7))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 35)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .text("Population Mean (μ)");
      
      // Draw confidence interval
      const ciY = height / 2 - 20;
      
      svg.append("line")
        .attr("x1", xScale(ciLower))
        .attr("x2", xScale(ciUpper))
        .attr("y1", ciY)
        .attr("y2", ciY)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 4);
      
      // CI endpoints
      [ciLower, ciUpper].forEach(endpoint => {
        svg.append("line")
          .attr("x1", xScale(endpoint))
          .attr("x2", xScale(endpoint))
          .attr("y1", ciY - 10)
          .attr("y2", ciY + 10)
          .attr("stroke", colorScheme.chart.primary)
          .attr("stroke-width", 3);
      });
      
      // Sample mean
      svg.append("circle")
        .attr("cx", xScale(sampleMean))
        .attr("cy", ciY)
        .attr("r", 8)
        .attr("fill", "green")
        .style("filter", "drop-shadow(0 0 6px green)");
      
      // Null hypothesis value
      svg.append("line")
        .attr("x1", xScale(mu0))
        .attr("x2", xScale(mu0))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
        
      svg.append("text")
        .attr("x", xScale(mu0))
        .attr("y", margin.top - 10)
        .attr("text-anchor", "middle")
        .attr("fill", "red")
        .text(`μ₀ = ${mu0}`);
      
      // Labels
      svg.append("text")
        .attr("x", xScale(sampleMean))
        .attr("y", ciY - 20)
        .attr("text-anchor", "middle")
        .attr("fill", "green")
        .text(`x̄ = ${sampleMean.toFixed(3)}`);
        
      svg.append("text")
        .attr("x", xScale((ciLower + ciUpper) / 2))
        .attr("y", ciY + 30)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.primary)
        .text(`${(confidenceLevel * 100).toFixed(0)}% CI: [${ciLower.toFixed(3)}, ${ciUpper.toFixed(3)}]`);
        
    }, [significanceLevel, sampleMean]);
    
    const mu0InCI = mu0 >= ciLower && mu0 <= ciUpper;
    const decision = hypothesisType === 'two' ? !mu0InCI : 
                    hypothesisType === 'right' ? mu0 < ciLower :
                    mu0 > ciUpper;
    
    return (
      <div className="space-y-4">
        <div className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700">
          <h4 className="text-base font-semibold text-white mb-4">
            Confidence Interval Approach
          </h4>
          
          <div className="mb-4">
            <svg ref={ciRef} style={{ width: "100%", height: 200 }} />
          </div>
          
          <div className="bg-neutral-900/50 rounded-lg p-4 mb-4">
            <div className="text-center">
              <div className="text-xl text-white mb-2">
                {(confidenceLevel * 100).toFixed(0)}% Confidence Interval
              </div>
              <div className="text-2xl font-mono text-purple-400">
                [{ciLower.toFixed(3)}, {ciUpper.toFixed(3)}]
              </div>
              <div className="text-sm text-neutral-400 mt-2">
                x̄ ± z<sub>{(significanceLevel/2).toFixed(3)}</sub> × (σ/√n) = {sampleMean.toFixed(3)} ± {marginOfError.toFixed(3)}
              </div>
            </div>
          </div>
          
          <div className={cn(
            "rounded-lg p-4",
            decision ? "bg-red-900/20 border border-red-700/30" : "bg-green-900/20 border border-green-700/30"
          )}>
            <div className="text-lg font-semibold mb-2">
              {hypothesisType === 'two' ? 'Two-Tailed Test Decision' : 
               hypothesisType === 'right' ? 'Right-Tailed Test Decision' :
               'Left-Tailed Test Decision'}
            </div>
            <div className="text-sm text-neutral-300">
              {hypothesisType === 'two' ? (
                <>
                  μ₀ = {mu0} is {mu0InCI ? 'inside' : 'outside'} the CI → 
                  {decision ? ' Reject H₀' : ' Fail to Reject H₀'}
                </>
              ) : (
                <>
                  For {hypothesisType}-tailed test at α = {significanceLevel}: 
                  {decision ? ' Reject H₀' : ' Fail to Reject H₀'}
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
          <h5 className="font-semibold text-purple-300 mb-2">Key Insight</h5>
          <p className="text-sm text-neutral-300">
            For two-tailed tests, the hypothesis test and confidence interval are equivalent:
            If μ₀ is outside the {(confidenceLevel * 100).toFixed(0)}% CI, we reject H₀ at α = {significanceLevel}.
          </p>
        </div>
      </div>
    );
  }
}