"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "../ui/card";
import { 
  VisualizationContainer, 
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, cn, createColorScheme, formatNumber } from '../../lib/design-system';
import { Button } from '../ui/button';
import { RangeSlider } from '../ui/RangeSlider';
import { Play, Pause, Timer, Calculator, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
// Gold Standard imports
import { SemanticGradientCard, SemanticGradientGrid } from '../ui/patterns/SemanticGradientCard';
import { InterpretationBox } from '../ui/patterns/InterpretationBox';
import { ComparisonTable } from '../ui/patterns/ComparisonTable';
import { StepByStepCalculation, CalculationStep } from '../ui/patterns/StepByStepCalculation';

// Import separated components
import { PoissonTimeline } from './components/PoissonTimeline';
import { PoissonPMF } from './components/PoissonPMF';
import { BinomialApproximation } from './components/BinomialApproximation';

// Enhanced color scheme for Poisson distribution
const poissonColors = {
  primary: '#60A5FA', // bright blue-400
  primaryLight: '#93c5fd', // blue-300
  primaryDark: '#3b82f6', // blue-600
  secondary: '#facc15', // bright yellow
  tertiary: '#10b981', // bright emerald-500
  accent: '#f59e0b', // amber-500
  area: 'rgba(96, 165, 250, 0.4)', // blue with higher opacity
  grid: '#6b7280', // brighter gray-500 for better visibility
  gradients: {
    primary: 'linear-gradient(135deg, #60A5FA 0%, #3b82f6 100%)',
    secondary: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
    event: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  }
};

// Tab configuration
const TABS = [
  { id: 'timeline', label: 'Timeline View', icon: <Timer className="w-3 h-3" /> },
  { id: 'approximation', label: 'Binomial Approximation', icon: <Calculator className="w-3 h-3" /> },
  { id: 'realworld', label: 'Real-World Examples', icon: <AlertCircle className="w-3 h-3" /> }
];

// Enhanced Introduction with Gold Standard Components
const PoissonIntroduction = React.memo(() => {
  return (
    <div className="space-y-6 mb-8">
      {/* Intuitive Understanding */}
      <InterpretationBox title="Poisson Distribution: Modeling Rare Events" theme="blue">
        <p>
          The Poisson distribution answers: <strong className="text-blue-400">"How many rare events occur in a fixed interval?"</strong>
        </p>
        <p className="mt-2">
          Perfect for events that are: <strong>rare</strong> (low probability), <strong>independent</strong> (one doesn't affect another), 
          and occur at a <strong>constant average rate</strong> over time or space.
        </p>
        <p className="text-yellow-400 mt-3">
          <strong>Key property:</strong> Mean equals variance (λ) - the only distribution with this unique feature!
        </p>
        <p className="text-emerald-400 mt-2">
          <strong>Connection to exponential:</strong> Time between events follows Exponential(λ) distribution
        </p>
      </InterpretationBox>

      {/* When to Use Poisson */}
      <ComparisonTable 
        title="When to Use (and Not Use) Poisson Distribution"
        columns={[
          { key: 'appropriate', title: '✅ Use Poisson When', color: 'text-green-400' },
          { key: 'inappropriate', title: '❌ Don\'t Use When', color: 'text-red-400' }
        ]}
        rows={[
          { 
            aspect: 'Event Nature', 
            appropriate: 'Events are rare and random', 
            inappropriate: 'Events are common or predictable' 
          },
          { 
            aspect: 'Independence', 
            appropriate: 'Events occur independently', 
            inappropriate: 'Events cluster or influence each other' 
          },
          { 
            aspect: 'Rate', 
            appropriate: 'Constant average rate λ', 
            inappropriate: 'Rate varies over time (rush hours, seasons)' 
          },
          { 
            aspect: 'Simultaneity', 
            appropriate: 'One event at a time', 
            inappropriate: 'Multiple simultaneous events possible' 
          },
          { 
            aspect: 'Examples', 
            appropriate: 'Radioactive decay, server crashes', 
            inappropriate: 'Website visits (not rare), disease spread (not independent)' 
          }
        ]}
      />

      {/* Mathematical Properties with Exponential Connection */}
      <SemanticGradientGrid title="Poisson Distribution Properties" theme="blue">
        <SemanticGradientCard
          title="Rate Parameter"
          description="Average events per interval:"
          formula={`\\[X \\sim \\text{Poisson}(\\lambda)\\]`}
          note="λ represents both mean and variance"
          theme="blue"
        />
        <SemanticGradientCard
          title="Probability Mass Function"
          description="Probability of exactly k events:"
          formula={`\\[P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}\\]`}
          note="e^(-λ) ensures probabilities sum to 1"
          theme="cyan"
        />
        <SemanticGradientCard
          title="Exponential Connection"
          description="Time between events:"
          formula={`\\[T \\sim \\text{Exponential}(\\lambda)\\]`}
          note="Inter-arrival times are memoryless"
          theme="purple"
        />
        <SemanticGradientCard
          title="Additivity Property"
          description="Sum of independent Poisson:"
          formula={`\\[X_1 + X_2 \\sim \\text{Poisson}(\\lambda_1 + \\lambda_2)\\]`}
          note="Rates add when combining intervals"
          theme="green"
        />
      </SemanticGradientGrid>

      {/* Real-World Examples Grid */}
      <SemanticGradientGrid title="Real-World Applications" theme="teal">
        <SemanticGradientCard
          title="Healthcare"
          description="Emergency arrivals per hour:"
          formula={`\\[\\lambda = 2.5 \\text{ patients/hour}\\]`}
          note="Night shift ICU admissions"
          theme="red"
        />
        <SemanticGradientCard
          title="Natural Disasters"
          description="Major earthquakes per year:"
          formula={`\\[\\lambda = 0.3 \\text{ quakes/year}\\]`}
          note="Magnitude 7+ in California"
          theme="orange"
        />
        <SemanticGradientCard
          title="Technology"
          description="Database corruptions per month:"
          formula={`\\[\\lambda = 0.1 \\text{ failures/month}\\]`}
          note="Critical system failures"
          theme="blue"
        />
        <SemanticGradientCard
          title="Manufacturing"
          description="Defects per 1000 units:"
          formula={`\\[\\lambda = 1.2 \\text{ defects/1000}\\]`}
          note="Quality control monitoring"
          theme="green"
        />
      </SemanticGradientGrid>
    </div>
  );
});

// Real-World Examples Component
const RealWorldExamples = React.memo(({ lambda }) => {
  const [selectedExample, setSelectedExample] = useState('hospital');
  
  const examples = {
    hospital: {
      title: "Hospital Emergency Room",
      rate: 3.2,
      unit: "patients/hour",
      scenario: "Night shift (11 PM - 7 AM) emergency arrivals",
      questions: [
        { q: "Probability of exactly 2 arrivals in next hour?", k: 2 },
        { q: "Probability of no arrivals in next 30 minutes?", k: 0, adjustedLambda: 1.6 },
        { q: "Probability of more than 5 arrivals in next hour?", k: 5, cumulative: true }
      ]
    },
    earthquake: {
      title: "Seismic Activity",
      rate: 0.4,
      unit: "major quakes/year",
      scenario: "Magnitude 6+ earthquakes in Pacific Ring of Fire",
      questions: [
        { q: "Probability of no major quakes this year?", k: 0 },
        { q: "Probability of exactly 1 quake in 2 years?", k: 1, adjustedLambda: 0.8 },
        { q: "Probability of 2+ quakes this year?", k: 1, cumulative: true }
      ]
    },
    manufacturing: {
      title: "Manufacturing Defects",
      rate: 2.1,
      unit: "defects/batch",
      scenario: "Circuit board manufacturing line",
      questions: [
        { q: "Probability of zero-defect batch?", k: 0 },
        { q: "Probability of exactly 3 defects?", k: 3 },
        { q: "Probability of more than 4 defects?", k: 4, cumulative: true }
      ]
    }
  };
  
  const currentExample = examples[selectedExample];
  
  // Calculate probability
  const poissonPMF = (k, lambdaVal) => {
    return Math.exp(-lambdaVal) * Math.pow(lambdaVal, k) / factorial(k);
  };
  
  const poissonCDF = (k, lambdaVal) => {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
      sum += poissonPMF(i, lambdaVal);
    }
    return sum;
  };
  
  const factorial = (n) => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  };
  
  return (
    <div className="space-y-6">
      {/* Example Selector */}
      <div className="flex gap-2 mb-4">
        {Object.entries(examples).map(([key, ex]) => (
          <button
            key={key}
            onClick={() => setSelectedExample(key)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              selectedExample === key
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            )}
          >
            {ex.title}
          </button>
        ))}
      </div>
      
      {/* Current Example */}
      <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-2">{currentExample.title}</h3>
        <p className="text-gray-400 mb-4">{currentExample.scenario}</p>
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <div className="text-sm text-gray-400">Average rate (λ)</div>
          <div className="text-2xl font-mono text-blue-400">
            {currentExample.rate} {currentExample.unit}
          </div>
        </div>
        
        {/* Step-by-Step Calculations */}
        <div className="space-y-4">
          {currentExample.questions.map((question, idx) => {
            const lambdaToUse = question.adjustedLambda || currentExample.rate;
            const prob = question.cumulative
              ? 1 - poissonCDF(question.k, lambdaToUse)
              : poissonPMF(question.k, lambdaToUse);
            
            return (
              <StepByStepCalculation 
                key={idx}
                title={question.q}
                theme="purple"
              >
                <CalculationStep
                  step={1}
                  description="Identify parameters"
                  formula={`\\lambda = ${lambdaToUse}, \\quad k = ${question.k}`}
                />
                <CalculationStep
                  step={2}
                  description="Apply Poisson PMF"
                  formula={`P(X = ${question.k}) = \\frac{${lambdaToUse}^{${question.k}} e^{-${lambdaToUse}}}{${question.k}!}`}
                />
                <CalculationStep
                  step={3}
                  description="Calculate result"
                  formula={`P(X ${question.cumulative ? '>' : '='} ${question.k}) = ${formatNumber(prob, 4)}`}
                  isResult
                />
              </StepByStepCalculation>
            );
          })}
        </div>
      </Card>
      
      {/* Common Misconceptions */}
      <InterpretationBox title="Common Misconceptions" theme="red">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-red-400">Misconception:</strong> Poisson works for any count data
              <p className="text-gray-300 text-sm mt-1">
                Reality: Only for RARE events with constant rate and independence
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-red-400">Misconception:</strong> Higher λ always means Poisson fits better
              <p className="text-gray-300 text-sm mt-1">
                Reality: As λ increases, events become less "rare" - consider Normal approximation for λ {'>'}20
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-green-400">Remember:</strong> Check independence assumption!
              <p className="text-gray-300 text-sm mt-1">
                Disease outbreaks, social media posts often violate independence
              </p>
            </div>
          </div>
        </div>
      </InterpretationBox>
    </div>
  );
});

// Main Component
const PoissonDistribution = React.memo(function PoissonDistribution() {
  const [lambda, setLambda] = useState(3);
  const [windowSize, setWindowSize] = useState(2);
  const [activeTab, setActiveTab] = useState('timeline');
  const [isAnimating, setIsAnimating] = useState(false);
  const [singleEventMode, setSingleEventMode] = useState(false);
  const [eventAnimation, setEventAnimation] = useState(null);
  
  // Calculate statistics
  const mean = lambda;
  const variance = lambda;
  const stdDev = Math.sqrt(variance);
  
  // Handle edge cases for performance
  const effectiveLambda = lambda > 5 ? 5 : lambda; // Limit visual elements for performance

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Poisson Distribution Explorer
          </h1>
          <p className="text-xl text-gray-400">
            Model rare events occurring at a constant average rate
          </p>
        </motion.div>

        {/* Enhanced Introduction with Gold Standard */}
        <PoissonIntroduction />

        {/* Interactive Component */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700/50">
      
      {/* Parameter Controls */}
      <ControlGroup>
        <RangeSlider
          label="Rate parameter (λ)"
          value={lambda}
          onChange={setLambda}
          min={0}
          max={10}
          step={0.1}
          formatValue={v => formatNumber(v, 1)}
          className="flex-1"
        />
        
        {activeTab === 'timeline' && (
          <>
            <RangeSlider
              label="Window size"
              value={windowSize}
              onChange={setWindowSize}
              min={0.5}
              max={5}
              step={0.5}
              formatValue={v => `${v} units`}
              className="flex-1"
            />
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsAnimating(!isAnimating)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform flex items-center gap-2",
                  "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                  "text-white shadow-md hover:shadow-lg hover:scale-[1.02]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                )}
                disabled={lambda <= 0}
              >
                {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isAnimating ? 'Pause' : 'Animate'}
              </button>
              
              <button
                onClick={() => setSingleEventMode(!singleEventMode)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  singleEventMode
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                    : "bg-gradient-to-r from-neutral-600 to-neutral-700 text-white",
                  "shadow-md hover:shadow-lg",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                disabled={lambda <= 0}
              >
                {singleEventMode ? 'Batch Mode' : 'Single Event'}
              </button>
            </div>
          </>
        )}
      </ControlGroup>
      
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800/50 rounded-lg p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-200",
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            )}
          >
            {tab.icon}
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Main Content Area */}
      <div className="grid gap-6">
        {/* Timeline View */}
        {activeTab === 'timeline' && (
          <>
            <PoissonTimeline
              lambda={effectiveLambda}
              windowSize={windowSize}
              isAnimating={isAnimating}
            />
            
            <PoissonPMF lambda={lambda} />
          </>
        )}
        
        {/* Binomial Approximation View */}
        {activeTab === 'approximation' && (
          <BinomialApproximation lambda={lambda} />
        )}
        
        {/* Real-World Examples View */}
        {activeTab === 'realworld' && (
          <RealWorldExamples lambda={lambda} />
        )}
      </div>
      
      {/* Statistics Summary */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Mean (E[X])</div>
          <div className="text-2xl font-mono text-blue-400">{formatNumber(mean, 2)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Variance (Var[X])</div>
          <div className="text-2xl font-mono text-blue-400">{formatNumber(variance, 2)}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Std Dev (σ)</div>
          <div className="text-2xl font-mono text-gray-300">{formatNumber(stdDev, 2)}</div>
        </div>
      </div>
        </Card>
        
        {/* Connection to Exponential */}
        <Card className="mt-6 p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/50">
          <h3 className="text-lg font-bold text-purple-400 mb-3">
            Connection to Exponential Distribution
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-300 mb-2">
                If events follow Poisson(λ), then time between events follows Exponential(λ):
              </p>
              <div className="bg-gray-900/50 rounded p-3 font-mono text-sm">
                <div className="text-purple-400">T ~ Exponential(λ)</div>
                <div className="text-gray-400 mt-1">E[T] = 1/λ time units</div>
              </div>
            </div>
            <div>
              <p className="text-gray-300 mb-2">
                This gives us the memoryless property:
              </p>
              <div className="bg-gray-900/50 rounded p-3 text-sm">
                <p className="text-purple-300">
                  P(T {'>'} s + t | T {'>'} s) = P(T {'>'} t)
                </p>
                <p className="text-gray-400 mt-1">
                  "The past doesn't affect the future"
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
});

export default PoissonDistribution;