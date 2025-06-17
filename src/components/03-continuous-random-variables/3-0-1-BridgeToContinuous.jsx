'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { VisualizationContainer } from '../ui/VisualizationContainer';
import { ProgressTracker } from '../ui/ProgressTracker';
import * as d3 from 'd3';
import { ProgressBar, ProgressNavigation } from '@/components/ui/ProgressBar';
import { cn } from '../../lib/utils';
import { useSafeMathJax } from '../../utils/mathJaxFix';
import { tutorial_3_0_1 } from '@/tutorials/chapter3';

// Memoized LaTeX component to prevent re-rendering
const LaTeXFormula = React.memo(function LaTeXFormula({ formula, isBlock = false }) {
  const contentRef = useRef(null);
  
  // Use safe MathJax hook with error handling
  useSafeMathJax(contentRef, [formula]);
  
  if (isBlock) {
    return (
      <div ref={contentRef} className="text-center my-2">
        <div dangerouslySetInnerHTML={{ __html: `\\[${formula}\\]` }} />
      </div>
    );
  }
  
  return (
    <span ref={contentRef}>
      <span dangerouslySetInnerHTML={{ __html: `\\(${formula}\\)` }} />
    </span>
  );
});

const BridgeToContinuous = () => {
  // Constants
  const MIN_BINS = 5;
  const MAX_BINS = 50;
  const DEFAULT_BINS = 10;
  const SAMPLES_COUNT = 1000;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [binCount, setBinCount] = useState(DEFAULT_BINS);
  const [showCurve, setShowCurve] = useState(false);
  const [selectedRange, setSelectedRange] = useState({ start: -1, end: 1 });
  
  // Refs
  const contentRef = useRef(null);
  const sliderRef = useRef(null);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(contentRef, [currentStep]);

  // Generate sample data once on mount
  const data = useMemo(() => {
    // Generate normally distributed data
    const samples = [];
    for (let i = 0; i < SAMPLES_COUNT; i++) {
      // Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      samples.push(z0 * 0.5 + 0); // mean=0, std=0.5
    }
    return samples;
  }, []); // Empty dependency array - generate only once

  // Create histogram bins
  const bins = d3.histogram()
    .domain([-2, 2])
    .thresholds(binCount);
  const histogram = bins(data);

  // Calculate probabilities
  const discreteProb = useMemo(() => {
    const totalCount = data.length;
    const inRange = histogram.filter(bin => 
      bin.x0 >= selectedRange.start && bin.x1 <= selectedRange.end
    ).reduce((sum, bin) => sum + bin.length, 0);
    return inRange / totalCount;
  }, [histogram, selectedRange, data.length]);

  const continuousProb = useMemo(() => {
    // Standard normal CDF approximation
    const phi = (x) => {
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p = 0.3275911;
      const sign = x < 0 ? -1 : 1;
      x = Math.abs(x) / Math.sqrt(2);
      const t = 1.0 / (1.0 + p * x);
      const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
      return 0.5 * (1.0 + sign * y);
    };
    
    // Scale for our distribution (mean=0, std=0.5)
    return phi(selectedRange.end / 0.5) - phi(selectedRange.start / 0.5);
  }, [selectedRange]);

  const steps = [
    {
      title: "Why can't we count heights?",
      description: "Explore why exact values are impossible with continuous data"
    },
    {
      title: "From bars to bins",
      description: "See how histograms approximate continuous distributions"
    },
    {
      title: "The density concept",
      description: "Understand how area represents probability"
    },
    {
      title: "Compare calculations",
      description: "See the difference between summing and integrating"
    }
  ];

  const DiscreteVisualization = () => (
    <svg width="100%" height="300" viewBox="0 0 400 300">
      <g transform="translate(40, 20)">
        {/* Axes */}
        <line x1="0" y1="250" x2="320" y2="250" stroke="currentColor" strokeWidth="2"/>
        <line x1="0" y1="0" x2="0" y2="250" stroke="currentColor" strokeWidth="2"/>
        
        {/* Discrete bars */}
        {currentStep === 0 && (
          <>
            <rect x="40" y="150" width="40" height="100" fill="#3b82f6" opacity="0.8"/>
            <rect x="100" y="100" width="40" height="150" fill="#3b82f6" opacity="0.8"/>
            <rect x="160" y="120" width="40" height="130" fill="#3b82f6" opacity="0.8"/>
            <rect x="220" y="170" width="40" height="80" fill="#3b82f6" opacity="0.8"/>
            
            <text x="60" y="270" textAnchor="middle" className="text-xs" style={{ fontFamily: 'monospace' }}>1</text>
            <text x="120" y="270" textAnchor="middle" className="text-xs" style={{ fontFamily: 'monospace' }}>2</text>
            <text x="180" y="270" textAnchor="middle" className="text-xs" style={{ fontFamily: 'monospace' }}>3</text>
            <text x="240" y="270" textAnchor="middle" className="text-xs" style={{ fontFamily: 'monospace' }}>4</text>
            
            <text x="160" y="290" textAnchor="middle" className="text-sm font-medium">
              Discrete: Countable outcomes
            </text>
          </>
        )}
        
        {currentStep >= 1 && (
          <>
            {/* Histogram */}
            {histogram.map((bin, i) => {
              const barHeight = (bin.length / data.length) * 1000;
              const barWidth = 320 / binCount;
              const isSelected = bin.x0 >= selectedRange.start && bin.x1 <= selectedRange.end;
              
              return (
                <rect
                  key={i}
                  x={i * barWidth}
                  y={250 - barHeight}
                  width={barWidth - 1}
                  height={barHeight}
                  fill={isSelected ? "#10b981" : "#3b82f6"}
                  opacity="0.8"
                />
              );
            })}
            
            <text x="160" y="290" textAnchor="middle" className="text-sm font-medium">
              Histogram: {binCount} bins
            </text>
          </>
        )}
      </g>
    </svg>
  );

  const ContinuousVisualization = () => {
    const xScale = d3.scaleLinear().domain([-2, 2]).range([0, 320]);
    const yScale = d3.scaleLinear().domain([0, 0.8]).range([250, 0]);
    
    // Normal distribution PDF
    const pdf = (x) => {
      const sigma = 0.5;
      return (1 / (sigma * Math.sqrt(2 * Math.PI))) * 
        Math.exp(-0.5 * Math.pow(x / sigma, 2));
    };
    
    // Generate curve points
    const curvePoints = d3.range(-2, 2.01, 0.01).map(x => ({
      x: xScale(x),
      y: yScale(pdf(x))
    }));
    
    const lineGenerator = d3.line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveNatural);
    
    // Area under curve for selected range
    const areaPoints = d3.range(selectedRange.start, selectedRange.end + 0.01, 0.01)
      .filter(x => x >= -2 && x <= 2)
      .map(x => ({
        x: xScale(x),
        y: yScale(pdf(x))
      }));
    
    const areaPath = d3.area()
      .x(d => d.x)
      .y0(yScale(0))
      .y1(d => d.y)
      .curve(d3.curveNatural);
    
    return (
      <svg width="100%" height="300" viewBox="0 0 400 300">
        <g transform="translate(40, 20)">
          {/* Axes */}
          <line x1="0" y1="250" x2="320" y2="250" stroke="currentColor" strokeWidth="2"/>
          <line x1="0" y1="0" x2="0" y2="250" stroke="currentColor" strokeWidth="2"/>
          
          {/* Show continuous curve at all steps */}
          {currentStep === 0 ? (
            <>
              {/* Step 0: Show smooth curve with explanation */}
              <path
                d={lineGenerator(curvePoints)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                opacity="0.6"
                style={{ transition: 'all 0.5s ease' }}
              />
              <text x="160" y="100" textAnchor="middle" className="text-sm text-gray-400">
                Smooth curve represents
              </text>
              <text x="160" y="120" textAnchor="middle" className="text-sm text-gray-400">
                infinite possible values
              </text>
            </>
          ) : (
            <>
              {/* Steps 1+: Show interactive curve */}
              {/* Area under curve for steps 2+ */}
              {currentStep >= 2 && (
                <path
                  d={areaPath(areaPoints)}
                  fill="#10b981"
                  opacity="0.3"
                />
              )}
              
              {/* Always show the normal curve for steps 1+ */}
              <path
                d={lineGenerator(curvePoints)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                style={{ transition: 'all 0.5s ease' }}
              />
              
              {/* Labels for advanced steps */}
              {currentStep >= 2 && (
                <>
                  <text x="-10" y="10" textAnchor="end" className="text-xs" style={{ fontStyle: 'italic' }}>f(x)</text>
                  <text x="320" y="265" className="text-xs" style={{ fontStyle: 'italic' }}>x</text>
                </>
              )}
            </>
          )}
          
          <text x="160" y="290" textAnchor="middle" className="text-sm font-medium">
            Continuous: Infinite possibilities
          </text>
        </g>
      </svg>
    );
  };


  const StepContent = () => {
    switch(currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="bg-blue-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">The Measurement Problem</h3>
              <p className="text-sm">
                What's the probability that someone is exactly <span className="font-mono">170.000000…</span> cm tall? 
                With infinite decimal places, the probability of any exact value is effectively zero!
              </p>
            </div>
            <div className="text-sm space-y-2">
              <p>• Discrete: "How many heads in <span className="font-mono">10</span> flips?"</p>
              <p>• Continuous: "What's your exact height?"</p>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-4">
            <div className="bg-blue-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Grouping into Bins</h3>
              <p className="text-sm">
                We can approximate continuous data by grouping it into bins. 
                Drag the slider to see how bin count affects the shape!
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label htmlFor="bin-slider" className="text-sm font-medium whitespace-nowrap">
                  Number of bins:
                </label>
                <input
                  id="bin-slider"
                  type="range"
                  min={MIN_BINS}
                  max={MAX_BINS}
                  step={1}
                  value={binCount}
                  onInput={(e) => setBinCount(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-mono min-w-[2rem] text-right">{binCount}</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Notice how more bins make the histogram approach a smooth curve!
            </p>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="bg-blue-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Probability = Area</h3>
              <p className="text-sm">
                With continuous distributions, we find probability by calculating 
                the area under the curve for a range of values.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Select range:</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    value={selectedRange.start}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value < selectedRange.end) {
                        setSelectedRange(prev => ({
                          ...prev,
                          start: Math.max(-2, Math.min(2, value))
                        }));
                      }
                    }}
                    className="w-20 px-2 py-1 rounded bg-gray-800 text-sm"
                    step="0.1"
                    min="-2"
                    max="2"
                  />
                  <span className="self-center">to</span>
                  <input
                    type="number"
                    value={selectedRange.end}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value > selectedRange.start) {
                        setSelectedRange(prev => ({
                          ...prev,
                          end: Math.max(-2, Math.min(2, value))
                        }));
                      }
                    }}
                    className="w-20 px-2 py-1 rounded bg-gray-800 text-sm"
                    step="0.1"
                    min="-2"
                    max="2"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-blue-900 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Sum vs Integral</h3>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs font-medium mb-1">Discrete (Sum):</p>
                  <LaTeXFormula key="discrete-sum" formula="P = \\sum_{x \\in S} p(x)" isBlock={true} />
                </div>
                <div>
                  <p className="text-xs font-medium mb-1">Continuous (Integral):</p>
                  <LaTeXFormula key="continuous-integral" formula="P = \\int_a^b f(x)dx" isBlock={true} />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Histogram approximation:</span>
                <span className="font-mono">{(discreteProb * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>True probability:</span>
                <span className="font-mono">{(continuousProb * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Difference:</span>
                <span className="font-mono">
                  {Math.abs(discreteProb - continuousProb).toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <VisualizationContainer
      title="Bridge to Continuous Random Variables"
      description="Understanding the transition from discrete to continuous distributions"
      tutorialSteps={tutorial_3_0_1}
      tutorialKey="bridge-to-continuous-3-0-1"
    >
      <div ref={contentRef} className="space-y-6">
        {/* Progress Bar */}
        <ProgressBar 
          current={currentStep + 1}
          total={steps.length}
          label="Learning Progress"
          variant="purple"
        />
        
        {/* Navigation Buttons */}
        <ProgressNavigation
          current={currentStep + 1}
          total={steps.length}
          onPrevious={() => setCurrentStep(Math.max(0, currentStep - 1))}
          onNext={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          variant="purple"
        />
        
        {/* Step info */}
        <div className="text-center mb-4">
          <h3 className="text-sm font-semibold">{steps[currentStep].title}</h3>
          <p className="text-xs text-gray-400">{steps[currentStep].description}</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Discrete Side */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-center">
              Discrete Approach
            </h3>
            <DiscreteVisualization />
          </Card>
          
          {/* Continuous Side */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-center">
              Continuous Approach
            </h3>
            <ContinuousVisualization />
          </Card>
        </div>
        
        {/* Step Content */}
        <Card className="p-4">
          <StepContent />
        </Card>
      </div>
    </VisualizationContainer>
  );
};

export default BridgeToContinuous;