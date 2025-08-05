"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, createColorScheme } from '../../lib/design-system';
import BackToHub from '@/components/ui/BackToHub';
import SectionComplete from '@/components/ui/SectionComplete';
import { 
  FlaskConical, TrendingUp, AlertTriangle, Lightbulb, 
  ChevronRight, RefreshCw, Activity, HelpCircle, BarChart,
  Check, X, Calculator, BookOpen, GraduationCap, StickyNote
} from 'lucide-react';

// Get Chapter 5 color scheme
const chapterColors = createColorScheme('estimation');

// Plain English Explanation Component
const PlainEnglishCard = ({ title, explanation, example }) => {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div 
      ref={contentRef}
      className="bg-neutral-900/50 rounded-lg p-4 mb-4 border border-neutral-700"
    >
      <div className="flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-400 mb-2">In Plain English</h4>
          <p className="text-white text-sm mb-2">{explanation}</p>
          {example && (
            <p className="text-neutral-300 text-sm italic">
              {example}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Exam Tip Component
const ExamTip = ({ tip, points, warning }) => {
  return (
    <div 
      className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-4 mb-4 border border-yellow-700/50"
    >
      <div className="flex items-start gap-3">
        <GraduationCap className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-yellow-400 mb-1">Exam Tip</h4>
          <p className="text-white text-sm">{tip}</p>
          {points && (
            <p className="text-yellow-300 text-xs mt-1">
              Typically worth: {points} points
            </p>
          )}
          {warning && (
            <p className="text-orange-400 text-xs mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {warning}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Floating Formula Card Component
const FloatingFormulaCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    if (isOpen) {
      processMathJax();
      const timeoutId = setTimeout(processMathJax, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);
  
  return (
    <div
      className="fixed z-50 right-6 bottom-24"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute bottom-0 right-0 w-12 h-12 rounded-full shadow-lg flex items-center justify-center cursor-pointer ${
          isOpen ? 'bg-purple-600' : 'bg-purple-500'
        } hover:bg-purple-600 transition-colors`}
      >
        <StickyNote className="w-6 h-6 text-white" />
      </button>
      
      {/* Formula Card */}
      {isOpen && (
        <div
          ref={contentRef}
          className="absolute bottom-16 right-0 w-80 bg-neutral-900 rounded-lg shadow-2xl border border-purple-500/50 overflow-hidden"
          >
            <div 
              className="bg-purple-900/30 p-3 flex items-center justify-between"
            >
              <h3 className="font-semibold text-purple-400 text-sm">Quick Formula Reference</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {/* Known σ */}
              <div className="bg-neutral-800/50 rounded p-3">
                <h4 className="text-blue-400 text-sm font-semibold mb-1">Known σ (Z-interval)</h4>
                <div className="text-center">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[\\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` 
                  }} />
                </div>
                <p className="text-xs text-neutral-400 mt-1">Use when σ is given</p>
              </div>
              
              {/* Unknown σ */}
              <div className="bg-neutral-800/50 rounded p-3">
                <h4 className="text-purple-400 text-sm font-semibold mb-1">Unknown σ (t-interval)</h4>
                <div className="text-center">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[\\bar{x} \\pm t_{\\alpha/2,df} \\cdot \\frac{s}{\\sqrt{n}}\\]` 
                  }} />
                </div>
                <p className="text-xs text-neutral-400 mt-1">df = n - 1</p>
              </div>
              
              {/* Quick Reference */}
              <div className="bg-neutral-800/50 rounded p-3 text-sm">
                <h4 className="text-emerald-400 font-semibold mb-2">Quick Steps:</h4>
                <ol className="text-xs text-neutral-300 space-y-1">
                  <li>1. Calculate <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x}\\)` }} /> and s</li>
                  <li>2. Find df = n - 1</li>
                  <li>3. Look up t-critical value</li>
                  <li>4. Calculate SE = s/√n</li>
                  <li>5. Find margin = t × SE</li>
                  <li>6. CI = <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x}\\)` }} /> ± margin</li>
                </ol>
              </div>
              
              {/* Common Values */}
              <div className="bg-neutral-800/50 rounded p-3 text-xs">
                <h4 className="text-yellow-400 font-semibold mb-1">Common Critical Values:</h4>
                <div className="grid grid-cols-2 gap-2 text-neutral-300">
                  <div>95% CI: z = 1.96</div>
                  <div>99% CI: z = 2.576</div>
                  <div>90% CI: z = 1.645</div>
                  <div>t varies with df</div>
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

// Journey Navigator Component
const JourneyNavigator = ({ journey, currentSection, userInsights, onNavigate }) => {
  const sections = Object.values(journey);
  
  const getColorClasses = (section, isActive, isCompleted) => {
    if (isActive) {
      switch(section.color) {
        case 'yellow': return 'bg-yellow-900/30 border-yellow-500';
        case 'blue': return 'bg-blue-900/30 border-blue-500';
        case 'purple': return 'bg-purple-900/30 border-purple-500';
        case 'emerald': return 'bg-emerald-900/30 border-emerald-500';
        case 'pink': return 'bg-pink-900/30 border-pink-500';
        default: return 'bg-neutral-800 border-neutral-600';
      }
    }
    if (isCompleted) return 'bg-neutral-800 border-emerald-500/50';
    return 'bg-neutral-900 border-neutral-700 hover:border-neutral-600';
  };
  
  const getIconColor = (color) => {
    switch(color) {
      case 'yellow': return 'text-yellow-400';
      case 'blue': return 'text-blue-400';
      case 'purple': return 'text-purple-400';
      case 'emerald': return 'text-emerald-400';
      case 'pink': return 'text-pink-400';
      default: return 'text-neutral-400';
    }
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-4">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          const isActive = currentSection === section.id;
          const isCompleted = userInsights[`${section.id}Completed`];
          
          return (
            <button
              key={section.id}
              onClick={() => onNavigate(section.id)}
              className={`flex-1 p-4 rounded-lg border-2 transition-all duration-300 ${
                getColorClasses(section, isActive, isCompleted)
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={20} className={getIconColor(section.color)} />
                {isCompleted && (
                  <div>
                    <Check size={16} className="text-emerald-400" />
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-white text-sm">{section.title}</h4>
              <p className="text-xs text-neutral-400 mt-1">{section.subtitle}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Problem Section: Why We Can't Just Use Z
const ProblemStatement = ({ onInsight }) => {
  const [showNaiveApproach, setShowNaiveApproach] = useState(false);
  const [showWhyItFails, setShowWhyItFails] = useState(false);
  
  return (
    <div className="space-y-6">
      <PlainEnglishCard
        explanation="In real life, we almost never know the true spread (σ) of our population. We only have our sample's spread (s). This creates extra uncertainty that we need to account for. Using s instead of σ introduces additional variability - we're estimating the mean AND the spread from the same limited data."
        example="Think of it like estimating a city's average income using only 10 households - you're guessing both the average AND the spread based on the same limited data. This double uncertainty needs special handling."
      />
      
      <ExamTip
        tip="Questions about 'when to use t vs z' appear on EVERY exam. Remember: Unknown σ → Use t-distribution!"
        points="5-10"
        warning="Most students lose points by using z when they should use t"
      />
      
      <div
        className="bg-gradient-to-br from-yellow-900/20 to-neutral-800 
                   rounded-xl p-6 border border-yellow-500/30"
      >
        <h3 className="text-xl font-bold text-yellow-400 mb-6">
          The Reality of Data Analysis
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm">In practice, we rarely know <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} />. We only have:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Sample data: x₁, x₂, ..., xₙ</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Sample mean: <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x}\\)` }} /></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span>Sample standard deviation: s</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-4 h-4 text-red-400" />
                <span className="text-neutral-500">Population <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} />: Unknown!</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <p className="text-sm text-neutral-400 mb-2">The Question:</p>
            <p className="text-lg text-yellow-400">
              Can we just replace <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} /> with s in our confidence interval formula?
            </p>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => {
          setShowNaiveApproach(!showNaiveApproach);
          if (!showNaiveApproach) onInsight('understoodProblem');
        }}
        className="w-full py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg
                   text-white font-medium transition-colors"
      >
        {showNaiveApproach ? 'Hide' : 'Explore'} the Naive Approach
      </button>
      
      {showNaiveApproach && (
        <div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-neutral-800/50 rounded-lg p-4"
          >
            <h4 className="font-semibold text-neutral-300 mb-3">
              The Naive Approach: Just Use s Instead of <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} />
            </h4>
            <div className="space-y-3 text-sm">
              <p>Let's see what happens if we just substitute s for <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} />:</p>
              <div className="bg-neutral-800/50 rounded p-3 font-mono text-center">
                CI = <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x} \\pm z_{0.025} \\times \\frac{s}{\\sqrt{n}}\\)` }} />
              </div>
              <p className="text-neutral-400">
                This seems reasonable, but there's a hidden problem: s is itself a random variable that varies from sample to sample!
              </p>
              <button
                onClick={() => setShowWhyItFails(true)}
                className="text-yellow-400 hover:text-yellow-300 underline"
              >
                See why this fails →
              </button>
            </div>
        </div>
      )}
      
      {showWhyItFails && (
        <div
          className="bg-red-900/20 rounded-xl p-6 border border-red-500/30"
        >
          <h4 className="font-semibold text-red-400 mb-3">
            Why the Naive Approach Fails
          </h4>
            <div className="space-y-3 text-sm">
              <p>Using s instead of <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} /> introduces additional uncertainty:</p>
              <ul className="space-y-2 ml-4">
                <li>• s is just an estimate of <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma\\)` }} /></li>
                <li>• s varies from sample to sample</li>
                <li>• Small samples → s is less reliable</li>
                <li>• Result: Coverage probability &lt; claimed confidence level!</li>
              </ul>
              <p
                className="mt-4 text-red-400 font-semibold text-center"
              >
                We need a distribution that accounts for this extra uncertainty!
              </p>
            </div>
        </div>
      )}
    </div>
  );
};

// Ozone Example Component
const OzoneExample = React.memo(function OzoneExample({ onInsight }) {
  const contentRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCalculation, setShowCalculation] = useState(false);
  
  // Course data from pages 32-33
  const data = [5.4, 4.7, 4.7, 4.5, 4.5, 4.9];
  const n = 6;
  const xBar = 4.783333; // Exact calculation
  const s = 0.370;
  const df = n - 1;
  const tCrit = 2.571; // t_{0.025,5}
  const se = s / Math.sqrt(n);
  const margin = tCrit * se;
  const ciLower = xBar - margin;
  const ciUpper = xBar + margin;
  
  const steps = [
    {
      title: "1. Collect Data",
      content: "Ozone concentrations (ppm) from 6 measurements",
      detail: "Environmental scientists measure ozone levels to assess air quality"
    },
    {
      title: "2. Calculate Statistics",
      content: "Find x̄ and s from the sample",
      detail: `x̄ = ${xBar.toFixed(3)} ppm, s = ${s} ppm`
    },
    {
      title: "3. Find Critical Value",
      content: `For 95% CI with df = ${df}, t₀.₀₂₅,₅ = ${tCrit}`,
      detail: "Note: This is larger than z₀.₀₂₅ = 1.96"
    },
    {
      title: "4. Build Interval",
      content: `CI = x̄ ± t × (s/√n)`,
      detail: `[${ciLower.toFixed(2)}, ${ciUpper.toFixed(2)}] ppm`
    }
  ];
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [currentStep]);
  
  // Visual component for data points
  const DataPointsVisualization = () => {
    const svgRef = useRef(null);
    
    useEffect(() => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      
      const width = 400;
      const height = 100;
      const margin = { top: 20, right: 20, bottom: 20, left: 20 };
      
      const xScale = d3.scaleLinear()
        .domain([4.3, 5.6])
        .range([margin.left, width - margin.right]);
      
      // Draw points
      svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => xScale(d))
        .attr("cy", height / 2)
        .attr("r", 6)
        .attr("fill", chapterColors.primary)
        .attr("opacity", 0)
        .transition()
        .delay((d, i) => i * 100)
        .duration(500)
        .attr("opacity", 0.8);
      
      // Draw mean line
      const meanLine = svg.append("line")
        .attr("x1", xScale(xBar))
        .attr("x2", xScale(xBar))
        .attr("y1", 10)
        .attr("y2", height - 10)
        .attr("stroke", chapterColors.secondary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0);
      
      meanLine.transition()
        .delay(600)
        .duration(500)
        .attr("opacity", 1);
      
      // X-axis
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(5));
        
    }, []);
    
    return <svg ref={svgRef} width="100%" height="100" viewBox="0 0 400 100" />;
  };
  
  return (
    <div ref={contentRef} className="space-y-6">
      <div
        className="bg-gradient-to-br from-emerald-900/20 to-neutral-800 
                   rounded-xl p-6 border border-emerald-500/30"
      >
        <h3 className="text-xl font-bold text-emerald-400 mb-4">
          Real Example: Ozone Concentrations
        </h3>
        
        <p className="text-sm text-neutral-300 mb-4">
          Environmental scientists measure ozone levels to assess air quality.
          With only 6 measurements, can we estimate the true mean concentration?
        </p>
        
        {/* Step Navigator */}
        <div className="flex gap-2 mb-6">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                if (idx === steps.length - 1) onInsight('completedExample');
              }}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
                currentStep === idx
                  ? 'bg-emerald-600 text-white'
                  : currentStep > idx
                  ? 'bg-emerald-900/30 text-emerald-400'
                  : 'bg-neutral-700 text-neutral-400'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        
        {/* Current Step Content */}
        <div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h4 className="font-semibold text-white">
              {steps[currentStep].title}
            </h4>
            <p className="text-sm text-neutral-300">
              {steps[currentStep].content}
            </p>
            
            {/* Step-specific visualizations */}
            {currentStep === 0 && (
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <DataPointsVisualization />
                <p className="text-xs text-neutral-400 mt-2 text-center">
                  Data: {data.join(', ')} ppm
                </p>
              </div>
            )}
            
            {currentStep === 1 && (
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-neutral-400">Sample Mean</p>
                    <p className="text-2xl font-mono text-emerald-400">
                      {xBar.toFixed(3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">Sample SD</p>
                    <p className="text-2xl font-mono text-blue-400">{s}</p>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="bg-neutral-800/50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-neutral-400 mb-2">
                    t-critical value (df = {df})
                  </p>
                  <p className="text-3xl font-mono text-purple-400">{tCrit}</p>
                  <p className="text-xs text-neutral-500 mt-2">
                    Compare to z₀.₀₂₅ = 1.96
                  </p>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-500/50">
                <p className="text-sm text-neutral-400 mb-2">95% Confidence Interval:</p>
                <p className="text-2xl font-mono text-emerald-400 text-center">
                  [{ciLower.toFixed(2)}, {ciUpper.toFixed(2)}] ppm
                </p>
                <p className="text-sm text-neutral-300 mt-3 text-center">
                  We are 95% confident the true mean ozone concentration 
                  is between {ciLower.toFixed(2)} and {ciUpper.toFixed(2)} ppm.
                </p>
              </div>
            )}
            
            <p className="text-sm text-neutral-400">{steps[currentStep].detail}</p>
        </div>
        
        {/* Detailed Calculation */}
        <button
          onClick={() => setShowCalculation(!showCalculation)}
          className="mt-4 text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          <Calculator size={16} />
          {showCalculation ? 'Hide' : 'Show'} Detailed Calculation
        </button>
        
        {showCalculation && (
          <div
            className="mt-4 space-y-2 text-sm font-mono bg-neutral-800/50 rounded p-3"
          >
              <p>Data: {data.join(', ')}</p>
              <p>n = {n}, df = {df}</p>
              <p>x̄ = {xBar.toFixed(3)}</p>
              <p>s = {s}</p>
              <p>SE = s/√n = {s}/√{n} = {se.toFixed(3)}</p>
              <p>t₀.₀₂₅,₅ = {tCrit}</p>
              <p>Margin = {tCrit} × {se.toFixed(3)} = {margin.toFixed(3)}</p>
              <p>CI = {xBar.toFixed(3)} ± {margin.toFixed(3)}</p>
              <p>CI = [{ciLower.toFixed(3)}, {ciUpper.toFixed(3)}]</p>
          </div>
        )}
      </div>
    </div>
  );
});

// Section Content Component
const SectionContent = ({ section, onInsight }) => {
  switch (section.id) {
    case 'problem':
      return <ProblemStatement onInsight={onInsight} />;
    case 'solution':
      return (
        <>
          <TDistributionExplorer onInsight={onInsight} />
          <TvsZComparison />
        </>
      );
    case 'foundation':
      return (
        <>
          <MathematicalFoundation onInsight={onInsight} />
          <StepByStepGuide onInsight={onInsight} />
        </>
      );
    case 'application':
      return (
        <>
          <OzoneExample onInsight={onInsight} />
          <InteractiveCIBuilder />
        </>
      );
    case 'practice':
      return (
        <>
          <PracticeProblems onInsight={onInsight} />
        </>
      );
    default:
      return null;
  }
};

// Interactive CI Builder
const InteractiveCIBuilder = () => {
  const [params, setParams] = useState({
    n: 10,
    xBar: 50,
    s: 10,
    confidence: 95,
    sigmaKnown: false,
    sigma: 10
  });
  
  const [showBoth, setShowBoth] = useState(true);
  
  const calculateCI = (useT) => {
    const alpha = 1 - params.confidence / 100;
    const df = params.n - 1;
    
    if (useT) {
      const t = jStat.studentt.inv(1 - alpha/2, df);
      const se = params.s / Math.sqrt(params.n);
      const margin = t * se;
      return {
        lower: params.xBar - margin,
        upper: params.xBar + margin,
        critical: t,
        se,
        margin,
        type: 't'
      };
    } else {
      const z = jStat.normal.inv(1 - alpha/2, 0, 1);
      const se = params.sigma / Math.sqrt(params.n);
      const margin = z * se;
      return {
        lower: params.xBar - margin,
        upper: params.xBar + margin,
        critical: z,
        se,
        margin,
        type: 'z'
      };
    }
  };
  
  const tCI = calculateCI(true);
  const zCI = calculateCI(false);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-6">
        Build and Compare Confidence Intervals
      </h3>
      
      {/* Controls */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-emerald-400">Sample Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Size (n): {params.n}
            </label>
            <input
              type="range"
              min="3"
              max="50"
              value={params.n}
              onChange={(e) => setParams({...params, n: Number(e.target.value)})}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample Mean (x̄): {params.xBar}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={params.xBar}
              onChange={(e) => setParams({...params, xBar: Number(e.target.value)})}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample SD (s): {params.s}
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={params.s}
              onChange={(e) => setParams({...params, s: Number(e.target.value)})}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-blue-400">Comparison Settings</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confidence Level: {params.confidence}%
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[90, 95, 98, 99].map(level => (
                <button
                  key={level}
                  onClick={() => setParams({...params, confidence: level})}
                  className={`py-1 rounded text-sm ${
                    params.confidence === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-700 text-neutral-300'
                  }`}
                >
                  {level}%
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showBoth"
              checked={showBoth}
              onChange={(e) => setShowBoth(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="showBoth" className="text-sm">
              Compare with known σ case (σ = {params.sigma})
            </label>
          </div>
        </div>
      </div>
      
      {/* Results Comparison */}
      <div className={`grid ${showBoth ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
        {/* t-based CI */}
        <div
          className="bg-gradient-to-br from-emerald-900/20 to-neutral-800 
                     rounded-xl p-6 border border-emerald-500/30"
        >
          <h5 className="font-semibold text-emerald-400 mb-4">
            σ Unknown (t-distribution)
          </h5>
          
          <div className="space-y-3">
            <div className="text-center p-4 bg-neutral-900/50 rounded-lg">
              <p className="text-sm text-neutral-400 mb-1">
                {params.confidence}% Confidence Interval
              </p>
              <p className="text-2xl font-mono text-emerald-400">
                [{tCI.lower.toFixed(2)}, {tCI.upper.toFixed(2)}]
              </p>
              <p className="text-sm text-neutral-500 mt-2">
                Width: {(tCI.upper - tCI.lower).toFixed(2)}
              </p>
            </div>
            
            <div className="text-sm space-y-1">
              <p>Critical value: t₀.₀₂₅,{params.n-1} = {tCI.critical.toFixed(3)}</p>
              <p>Standard error: {tCI.se.toFixed(3)}</p>
              <p>Margin of error: {tCI.margin.toFixed(3)}</p>
            </div>
          </div>
        </div>
        
        {/* z-based CI for comparison */}
        {showBoth && (
          <div
            className="bg-gradient-to-br from-blue-900/20 to-neutral-800 
                       rounded-xl p-6 border border-blue-500/30"
          >
            <h5 className="font-semibold text-blue-400 mb-4">
              σ Known (z-distribution)
            </h5>
            
            <div className="space-y-3">
              <div className="text-center p-4 bg-neutral-800/50 rounded-lg">
                <p className="text-sm text-neutral-400 mb-1">
                  {params.confidence}% Confidence Interval
                </p>
                <p className="text-2xl font-mono text-blue-400">
                  [{zCI.lower.toFixed(2)}, {zCI.upper.toFixed(2)}]
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Width: {(zCI.upper - zCI.lower).toFixed(2)}
                </p>
              </div>
              
              <div className="text-sm space-y-1">
                <p>Critical value: z₀.₀₂₅ = {zCI.critical.toFixed(3)}</p>
                <p>Standard error: {zCI.se.toFixed(3)}</p>
                <p>Margin of error: {zCI.margin.toFixed(3)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Key Insight */}
      <div
        className="mt-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30"
      >
        <p className="text-sm text-yellow-400">
          <strong>Key Insight:</strong> The t-based interval is always wider than 
          the z-based interval because it accounts for the additional uncertainty 
          of estimating σ with s. This difference is most pronounced for small samples 
          (n &lt; 30).
        </p>
      </div>
    </VisualizationSection>
  );
};

// T-Distribution Explorer
const TDistributionExplorer = ({ onInsight }) => {
  const [df, setDf] = useState(5);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationDf, setAnimationDf] = useState(1);
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationRef = useRef(null);
  const svgRef = useRef(null);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 350;
    const margin = { top: 20, right: 120, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleLinear()
      .domain([-5, 5])
      .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
      .domain([0, 0.45])
      .range([innerHeight, 0]);
    
    // Generate data
    const xValues = d3.range(-5, 5.01, 0.01);
    const currentDf = showAnimation ? animationDf : df;
    
    const normalData = xValues.map(val => ({
      x: val,
      y: jStat.normal.pdf(val, 0, 1)
    }));
    
    const tData = xValues.map(val => ({
      x: val,
      y: jStat.studentt.pdf(val, currentDf)
    }));
    
    // Line generator
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    // Grid
    const gridLines = g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(-innerHeight).tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    gridLines.selectAll("line")
      .style("stroke", "#6b7280"); // Lighter gray for visibility
    
    gridLines.select(".domain").remove();
    
    // Y-axis grid
    const yGridLines = g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat("").ticks(5))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    yGridLines.selectAll("line")
      .style("stroke", "#6b7280");
    
    yGridLines.select(".domain").remove();
    
    // Axes
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x));
    
    xAxis.selectAll("line").style("stroke", "#9ca3af");
    xAxis.selectAll("path").style("stroke", "#9ca3af");
    xAxis.selectAll("text").style("fill", "#e5e7eb").style("font-size", "12px");
    
    const yAxis = g.append("g")
      .call(d3.axisLeft(y).ticks(5));
    
    yAxis.selectAll("line").style("stroke", "#9ca3af");
    yAxis.selectAll("path").style("stroke", "#9ca3af");
    yAxis.selectAll("text").style("fill", "#e5e7eb").style("font-size", "12px");
    
    // Axis labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .text("Standardized Value");
    
    // Normal curve
    g.append("path")
      .datum(normalData)
      .attr("fill", "none")
      .attr("stroke", chapterColors.secondary)
      .attr("stroke-width", 2)
      .attr("d", line)
      .style("opacity", 0.8);
    
    // T curve
    g.append("path")
      .datum(tData)
      .attr("fill", "none")
      .attr("stroke", chapterColors.primary)
      .attr("stroke-width", 2.5)
      .attr("d", line);
    
    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 100}, 20)`);
    
    // Normal legend
    legend.append("line")
      .attr("x1", 0).attr("x2", 20)
      .attr("y1", 0).attr("y2", 0)
      .attr("stroke", chapterColors.secondary)
      .attr("stroke-width", 2);
    legend.append("text")
      .attr("x", 25).attr("y", 4)
      .attr("fill", "#e5e7eb")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text("Normal(0,1)");
    
    // T legend
    legend.append("line")
      .attr("x1", 0).attr("x2", 20)
      .attr("y1", 20).attr("y2", 20)
      .attr("stroke", chapterColors.primary)
      .attr("stroke-width", 2);
    legend.append("text")
      .attr("x", 25).attr("y", 24)
      .attr("fill", "#e5e7eb")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text(`t(${currentDf})`);
    
    // Annotation for heavier tails
    if (currentDf <= 5) {
      const annotation = g.append("g")
        .attr("transform", `translate(${x(2.5)}, ${y(0.05)})`);
      
      annotation.append("path")
        .attr("d", "M0,0 L-30,-30")
        .attr("stroke", chapterColors.warning)
        .attr("stroke-width", 1)
        .attr("marker-end", "url(#arrow)");
      
      annotation.append("text")
        .attr("x", -35)
        .attr("y", -35)
        .attr("fill", "#fbbf24")  // Bright yellow for visibility
        .style("font-size", "12px")
        .style("font-weight", "500")
        .text("Heavier tails");
      
      // Arrow marker
      const defs = svg.append("defs");
      const marker = defs.append("marker")
        .attr("id", "arrow")
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("refX", 8)
        .attr("refY", 4)
        .attr("orient", "auto");
      
      marker.append("path")
        .attr("d", "M0,0 L8,4 L0,8")
        .attr("fill", chapterColors.warning);
    }
    
  }, [df, showAnimation, animationDf]);
  
  // Animation effect
  useEffect(() => {
    if (showAnimation) {
      let currentDf = 1;
      const maxDf = 100;
      const animate = () => {
        setAnimationDf(currentDf);
        setAnimationProgress((currentDf / maxDf) * 100);
        currentDf += 0.5;
        
        if (currentDf <= maxDf && showAnimation) {
          animationRef.current = setTimeout(animate, 50);
        } else {
          setTimeout(() => {
            setAnimationDf(Infinity);
            onInsight('sawTConvergence');
            setTimeout(() => {
              setShowAnimation(false);
              setAnimationDf(df);
              setAnimationProgress(0);
            }, 1000);
          }, 500);
        }
      };
      
      animate();
      
      return () => {
        if (animationRef.current) {
          clearTimeout(animationRef.current);
        }
      };
    } else {
      setAnimationProgress(0);
    }
  }, [showAnimation, df, onInsight]);
  
  const stopAnimation = () => {
    setShowAnimation(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setAnimationDf(df);
    setAnimationProgress(0);
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-6">The t-Distribution</h3>
      
      <GraphContainer>
        <svg ref={svgRef} width="100%" height="350" viewBox="0 0 600 350" />
      </GraphContainer>
      
      <ControlGroup>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Degrees of Freedom: {df}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={df}
              onChange={(e) => setDf(Number(e.target.value))}
              className="w-full"
              disabled={showAnimation}
            />
          </div>
          
          {!showAnimation ? (
            <button
              onClick={() => setShowAnimation(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <TrendingUp size={16} />
              Animate df → ∞
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={stopAnimation}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Stop
              </button>
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <div className="w-32 bg-neutral-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${animationProgress}%` }}
                  />
                </div>
                <span className="text-xs">{animationProgress.toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
          <h4 className="text-sm font-semibold text-purple-400 mb-2">Key Insight</h4>
          <p className="text-sm text-neutral-300">
            As degrees of freedom increase, the t-distribution approaches the normal distribution. 
            By df ≈ 30, they're nearly identical. This is why we use z for large samples!
          </p>
        </div>
      </ControlGroup>
    </VisualizationSection>
  );
};

// T vs Z Interval Comparison
const TvsZComparison = () => {
  const [sampleSize, setSampleSize] = useState(10);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const svgRef = useRef(null);
  
  // Sample parameters
  const xbar = 100;
  const s = 15;
  const sigma = 15; // True σ for comparison
  
  // Calculate critical values and intervals
  const calculations = useMemo(() => {
    const df = sampleSize - 1;
    const alpha = 1 - confidenceLevel;
    const tCritical = jStat.studentt.inv(1 - alpha/2, df);
    const zCritical = jStat.normal.inv(1 - alpha/2, 0, 1);
    
    const tSE = s / Math.sqrt(sampleSize);
    const tMOE = tCritical * tSE;
    const tLower = xbar - tMOE;
    const tUpper = xbar + tMOE;
    
    const zSE = sigma / Math.sqrt(sampleSize);
    const zMOE = zCritical * zSE;
    const zLower = xbar - zMOE;
    const zUpper = xbar + zMOE;
    
    const widthRatio = tMOE / zMOE;
    const percentWider = ((widthRatio - 1) * 100).toFixed(1);
    
    return {
      tCritical,
      zCritical,
      tInterval: { lower: tLower, upper: tUpper, moe: tMOE },
      zInterval: { lower: zLower, upper: zUpper, moe: zMOE },
      percentWider,
      df
    };
  }, [sampleSize, confidenceLevel]);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 60, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scale
    const extent = Math.max(calculations.tInterval.moe, calculations.zInterval.moe) * 1.5;
    const xScale = d3.scaleLinear()
      .domain([xbar - extent, xbar + extent])
      .range([0, innerWidth]);
    
    // Title
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", "#e5e7eb")
      .text(`${confidenceLevel * 100}% Confidence Intervals (n = ${sampleSize})`);
    
    // Center line (sample mean)
    g.append("line")
      .attr("x1", xScale(xbar))
      .attr("x2", xScale(xbar))
      .attr("y1", 20)
      .attr("y2", innerHeight - 20)
      .attr("stroke", chapterColors.secondary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");
    
    g.append("text")
      .attr("x", xScale(xbar))
      .attr("y", 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(`x̄ = ${xbar}`);
    
    // Interval positions
    const tY = innerHeight * 0.35;
    const zY = innerHeight * 0.65;
    const barHeight = 12;
    const bracketHeight = 20;
    
    // T-interval visualization
    const tInterval = g.append("g");
    
    // T-interval bar
    tInterval.append("rect")
      .attr("x", xScale(calculations.tInterval.lower))
      .attr("y", tY - barHeight/2)
      .attr("width", xScale(calculations.tInterval.upper) - xScale(calculations.tInterval.lower))
      .attr("height", barHeight)
      .attr("fill", chapterColors.primary)
      .attr("rx", 2)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .attr("opacity", 1);
    
    // T-interval brackets
    [calculations.tInterval.lower, calculations.tInterval.upper].forEach(x => {
      tInterval.append("line")
        .attr("x1", xScale(x))
        .attr("x2", xScale(x))
        .attr("y1", tY - bracketHeight/2)
        .attr("y2", tY + bracketHeight/2)
        .attr("stroke", chapterColors.primary)
        .attr("stroke-width", 3);
    });
    
    // T-interval labels
    tInterval.append("text")
      .attr("x", xScale(xbar))
      .attr("y", tY - 25)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("t-interval (σ unknown, use s)");
    
    // Z-interval visualization
    const zInterval = g.append("g");
    
    // Z-interval bar
    zInterval.append("rect")
      .attr("x", xScale(calculations.zInterval.lower))
      .attr("y", zY - barHeight/2)
      .attr("width", xScale(calculations.zInterval.upper) - xScale(calculations.zInterval.lower))
      .attr("height", barHeight)
      .attr("fill", chapterColors.secondary)
      .attr("rx", 2)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay(400)
      .attr("opacity", 1);
    
    // Z-interval brackets
    [calculations.zInterval.lower, calculations.zInterval.upper].forEach(x => {
      zInterval.append("line")
        .attr("x1", xScale(x))
        .attr("x2", xScale(x))
        .attr("y1", zY - bracketHeight/2)
        .attr("y2", zY + bracketHeight/2)
        .attr("stroke", chapterColors.secondary)
        .attr("stroke-width", 3);
    });
    
    // Z-interval labels
    zInterval.append("text")
      .attr("x", xScale(xbar))
      .attr("y", zY - 25)
      .attr("text-anchor", "middle")
      .attr("fill", "#e5e7eb")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("z-interval (σ known)");
    
    // Width difference annotation
    if (calculations.percentWider !== "0.0") {
      const diffY = innerHeight - 10;
      
      g.append("text")
        .attr("x", xScale(xbar))
        .attr("y", diffY)
        .attr("text-anchor", "middle")
        .attr("fill", chapterColors.warning)
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`t-interval is ${calculations.percentWider}% wider`);
    }
    
    // Grid lines
    const xGrid = g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(-innerHeight).tickFormat("").ticks(7))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    xGrid.selectAll("line").style("stroke", "#6b7280");
    xGrid.select(".domain").remove();
    
    // X-axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(7));
    
    xAxis.selectAll("path, line").attr("stroke", "#9ca3af");
    xAxis.selectAll("text")
      .style("font-size", "12px")
      .attr("fill", "#e5e7eb");
    
  }, [sampleSize, confidenceLevel, calculations]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-6">t-Interval vs z-Interval Comparison</h3>
      
      <GraphContainer>
        <svg ref={svgRef} width="100%" height="300" viewBox="0 0 600 300" />
      </GraphContainer>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-neutral-800/50 rounded-lg p-3">
          <h5 className="text-xs font-semibold text-blue-400 mb-1">z-critical</h5>
          <p className="font-mono text-lg">{calculations.zCritical.toFixed(3)}</p>
          <p className="text-xs text-neutral-500">σ known</p>
        </div>
        <div className="bg-neutral-800/50 rounded-lg p-3">
          <h5 className="text-xs font-semibold text-purple-400 mb-1">t-critical</h5>
          <p className="font-mono text-lg">{calculations.tCritical.toFixed(3)}</p>
          <p className="text-xs text-neutral-500">df = {calculations.df}</p>
        </div>
        <div className="col-span-2 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
          <p className="text-sm text-center">
            t-critical is <span className="font-mono text-yellow-400">{((calculations.tCritical - calculations.zCritical) / calculations.zCritical * 100).toFixed(1)}%</span> larger
          </p>
        </div>
      </div>
      
      <ControlGroup>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Sample Size: {sampleSize}
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confidence Level
            </label>
            <select
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(Number(e.target.value))}
              className="w-full bg-neutral-700 rounded px-3 py-2 text-white"
            >
              <option value={0.90}>90%</option>
              <option value={0.95}>95%</option>
              <option value={0.99}>99%</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          <p>As sample size increases, the t-distribution approaches the normal distribution. 
          By n ≈ 30, the difference is usually negligible in practice.</p>
        </div>
      </ControlGroup>
    </VisualizationSection>
  );
};

// Mathematical Foundation Component
const MathematicalFoundation = React.memo(function MathematicalFoundation({ onInsight }) {
  const contentRef = useRef(null);
  const [showDerivation, setShowDerivation] = useState(false);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [showDerivation]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-6">Mathematical Foundation</h3>
      
      <PlainEnglishCard
        explanation="The t-distribution is like the normal distribution's cautious cousin. It has fatter tails because we're less certain about our estimates when using s instead of σ."
        example="If the normal distribution is like driving with GPS, the t-distribution is like driving with directions from a friend - you need extra margin for error!"
      />
      
      <ExamTip
        tip="You DON'T need to derive the t-distribution on exams. Focus on: 1) When to use it (σ unknown), 2) How to find critical values, 3) Calculating df = n-1"
        points="15-20"
      />
      
      <div ref={contentRef} className="space-y-4">
        <div className="bg-gradient-to-br from-purple-900/20 to-neutral-800 rounded-xl p-6 border border-purple-500/30">
          <h4 className="font-semibold text-purple-400 mb-3">Why the t-Distribution?</h4>
          
          <div className="space-y-3 text-sm">
            <p>When σ is known, we use:</p>
            <div className="bg-neutral-800/50 rounded p-3 text-center">
              <span dangerouslySetInnerHTML={{ __html: `\\[Z = \\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}} \\sim N(0,1)\\]` }} />
            </div>
            
            <p>When σ is unknown and we use s instead:</p>
            <div className="bg-neutral-800/50 rounded p-3 text-center">
              <span dangerouslySetInnerHTML={{ __html: `\\[T = \\frac{\\bar{X} - \\mu}{S/\\sqrt{n}} \\sim t(n-1)\\]` }} />
            </div>
            
            <div
              className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/50"
            >
              <p className="text-purple-300">
                <strong>Key Insight:</strong> The extra uncertainty from estimating σ with s 
                changes the distribution from normal to t with n-1 degrees of freedom. The t-distribution 
                has heavier tails (more extreme values) to account for this additional uncertainty.
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/50">
              <h5 className="font-semibold text-blue-400 mb-2">Understanding Degrees of Freedom</h5>
              <p className="text-neutral-300 mb-2">
                Why n-1? When calculating s, we use x̄ in the formula. Once we know x̄ and n-1 data points, 
                the last point is determined. We "lose" one degree of freedom to estimate the mean.
              </p>
              <p className="text-xs text-neutral-400 italic">
                Think of it as: "How many values are free to vary?" With n data points and one constraint (they must average to x̄), 
                only n-1 can vary freely.
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => {
            setShowDerivation(!showDerivation);
            if (!showDerivation) onInsight('exploredMath');
          }}
          className="text-purple-400 hover:text-purple-300 underline text-sm"
        >
          {showDerivation ? 'Hide' : 'Show'} Mathematical Derivation →
        </button>
        
        {showDerivation && (
          <div
            className="bg-neutral-800/50 rounded-lg p-4 space-y-3"
          >
              <h5 className="font-semibold text-neutral-300">The Student's t-Distribution Derivation</h5>
              
              <div className="space-y-2 text-sm">
                <p>1. Start with the standardized sample mean:</p>
                <div className="bg-neutral-800/50 rounded p-2 text-center">
                  <span dangerouslySetInnerHTML={{ __html: `\\[Z = \\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}} \\sim N(0,1)\\]` }} />
                </div>
                
                <p>2. The sample variance is:</p>
                <div className="bg-neutral-800/50 rounded p-2 text-center">
                  <span dangerouslySetInnerHTML={{ __html: `\\[\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2_{n-1}\\]` }} />
                </div>
                
                <p>3. These are independent, so:</p>
                <div className="bg-neutral-800/50 rounded p-2 text-center">
                  <span dangerouslySetInnerHTML={{ __html: `\\[T = \\frac{Z}{\\sqrt{\\chi^2_{n-1}/(n-1)}} = \\frac{\\bar{X} - \\mu}{S/\\sqrt{n}} \\sim t(n-1)\\]` }} />
                </div>
                
                <p className="text-yellow-400 mt-3">
                  This ratio of a standard normal to the square root of a chi-squared divided by its degrees of freedom 
                  defines the t-distribution!
                </p>
              </div>
          </div>
        )}
      </div>
    </VisualizationSection>
  );
});

// Step-by-Step Calculation Guide
const StepByStepGuide = React.memo(function StepByStepGuide({ onInsight }) {
  const contentRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Example problem
  const problem = {
    data: [23.5, 24.1, 22.8, 23.9, 24.3, 23.2],
    confidence: 0.95,
    description: "A quality control engineer measures the diameter (mm) of 6 randomly selected ball bearings."
  };
  
  const n = problem.data.length;
  const mean = problem.data.reduce((a, b) => a + b) / n;
  const variance = problem.data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
  const sd = Math.sqrt(variance);
  const df = n - 1;
  const tCrit = 2.571; // t_{0.025, 5}
  const se = sd / Math.sqrt(n);
  const margin = tCrit * se;
  const ciLower = mean - margin;
  const ciUpper = mean + margin;
  
  const steps = [
    {
      title: "Step 1: Calculate Sample Statistics",
      content: "Find the sample mean and standard deviation",
      calculation: `x̄ = ${mean.toFixed(3)} mm, s = ${sd.toFixed(3)} mm`,
      question: "What is the sample mean (to 3 decimal places)?",
      answer: mean.toFixed(3)
    },
    {
      title: "Step 2: Determine Degrees of Freedom",
      content: "df = n - 1 where n is the sample size. We lose one degree of freedom because we used the sample to estimate the mean.",
      calculation: `df = ${n} - 1 = ${df}`,
      question: "What are the degrees of freedom?",
      answer: df.toString()
    },
    {
      title: "Step 3: Find Critical t-value",
      content: `For ${(problem.confidence * 100)}% confidence and df = ${df}`,
      calculation: `t_{${(1 - problem.confidence)/2}, ${df}} = ${tCrit}`,
      question: "What is the critical t-value? (Use t-table)",
      answer: tCrit.toString()
    },
    {
      title: "Step 4: Calculate Standard Error",
      content: "SE = s / √n",
      calculation: `SE = ${sd.toFixed(3)} / √${n} = ${se.toFixed(3)}`,
      question: "What is the standard error (to 3 decimal places)?",
      answer: se.toFixed(3)
    },
    {
      title: "Step 5: Calculate Margin of Error",
      content: "Margin = t × SE",
      calculation: `Margin = ${tCrit} × ${se.toFixed(3)} = ${margin.toFixed(3)}`,
      question: "What is the margin of error (to 3 decimal places)?",
      answer: margin.toFixed(3)
    },
    {
      title: "Step 6: Construct Confidence Interval",
      content: "CI = x̄ ± margin",
      calculation: `[${ciLower.toFixed(3)}, ${ciUpper.toFixed(3)}] mm`,
      question: "What is the lower bound of the CI (to 3 decimal places)?",
      answer: ciLower.toFixed(3)
    }
  ];
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [currentStep]);
  
  const checkAnswer = () => {
    if (userAnswer === steps[currentStep].answer) {
      setShowFeedback(true);
      setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
          setUserAnswer('');
          setShowFeedback(false);
        } else {
          onInsight('completedGuide');
        }
      }, 1500);
    } else {
      setShowFeedback(true);
    }
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-6">Step-by-Step Calculation Guide</h3>
      
      <PlainEnglishCard
        explanation="Follow these exact steps on your exam. Most professors give partial credit for each correct step, even if your final answer is wrong!"
        example="Think of it like a recipe - follow each step in order and you'll get the right result."
      />
      
      <ExamTip
        tip="ALWAYS show ALL steps on exams! Even if you make a calculation error, you'll get partial credit for correct methodology."
        points="20-25"
        warning="Skipping steps is the #1 reason students lose points"
      />
      
      <div ref={contentRef} className="space-y-4">
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <h4 className="font-semibold text-blue-400 mb-2">Practice Problem</h4>
          <p className="text-sm text-neutral-300">{problem.description}</p>
          <p className="text-sm font-mono text-neutral-400 mt-2">
            Data: {problem.data.join(', ')} mm
          </p>
          <p className="text-sm text-neutral-300 mt-1">
            Construct a {problem.confidence * 100}% confidence interval for the mean diameter.
          </p>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex gap-2 mb-4">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-2 rounded-full transition-all ${
                idx < currentStep ? 'bg-emerald-500' :
                idx === currentStep ? 'bg-blue-500' :
                'bg-neutral-700'
              }`}
            />
          ))}
        </div>
        
        {/* Current Step */}
        <div
          key={currentStep}
          className="bg-neutral-800 rounded-lg p-6"
        >
          <h4 className="font-semibold text-white mb-3">{steps[currentStep].title}</h4>
          <p className="text-neutral-300 mb-3">{steps[currentStep].content}</p>
          
          <div className="bg-neutral-900 rounded p-3 mb-4 font-mono text-center">
            {steps[currentStep].calculation}
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-neutral-400">{steps[currentStep].question}</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                className="flex-1 bg-neutral-700 rounded px-3 py-2 text-white"
                placeholder="Enter your answer..."
              />
              <button
                onClick={checkAnswer}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
              >
                Check
              </button>
            </div>
            
            {showFeedback && (
              <div
                className={`p-3 rounded ${
                  userAnswer === steps[currentStep].answer
                    ? 'bg-emerald-900/30 border border-emerald-500/50'
                    : 'bg-red-900/30 border border-red-500/50'
                }`}
              >
                {userAnswer === steps[currentStep].answer ? (
                  <p className="text-emerald-400">✓ Correct! Moving to next step...</p>
                ) : (
                  <p className="text-red-400">✗ Not quite. Try again!</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {currentStep === steps.length - 1 && userAnswer === steps[currentStep].answer && (
          <div
            className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/50"
          >
            <p className="text-emerald-400 font-semibold">
              Excellent! You've constructed the confidence interval correctly.
            </p>
            <p className="text-sm text-neutral-300 mt-2">
              We are 95% confident that the true mean diameter is between {ciLower.toFixed(3)} mm 
              and {ciUpper.toFixed(3)} mm.
            </p>
          </div>
        )}
      </div>
    </VisualizationSection>
  );
});

// Practice Problems Component
const PracticeProblems = React.memo(function PracticeProblems({ onInsight }) {
  const contentRef = useRef(null);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  
  const problems = [
    {
      title: "Medical Research",
      description: "A researcher measures the reaction time (ms) of 8 patients after taking a new medication:",
      data: "245, 238, 251, 247, 242, 249, 243, 246",
      question: "Construct a 99% confidence interval for the mean reaction time.",
      solution: {
        n: 8,
        mean: 245.125,
        s: 4.155,
        df: 7,
        tCrit: 3.499,
        ci: "[240.98, 249.27]",
        interpretation: "We are 99% confident that the true mean reaction time is between 240.98 ms and 249.27 ms."
      }
    },
    {
      title: "Manufacturing Quality",
      description: "The tensile strength (MPa) of 5 steel samples:",
      data: "515, 520, 512, 518, 525",
      question: "Find a 90% confidence interval for the mean tensile strength.",
      solution: {
        n: 5,
        mean: 518,
        s: 5.148,
        df: 4,
        tCrit: 2.132,
        ci: "[513.09, 522.91]",
        interpretation: "We are 90% confident that the true mean tensile strength is between 513.09 MPa and 522.91 MPa."
      }
    },
    {
      title: "Environmental Science",
      description: "pH measurements from 10 water samples:",
      data: "6.8, 7.2, 6.9, 7.1, 6.7, 7.0, 6.8, 7.3, 6.9, 7.1",
      question: "Calculate a 95% confidence interval for the mean pH level.",
      solution: {
        n: 10,
        mean: 6.98,
        s: 0.189,
        df: 9,
        tCrit: 2.262,
        ci: "[6.85, 7.11]",
        interpretation: "We are 95% confident that the true mean pH level is between 6.85 and 7.11."
      }
    }
  ];
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [currentProblem, showSolution]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-6">Practice Problems</h3>
      
      <PlainEnglishCard
        explanation="These problems are exactly like what you'll see on exams. Practice these until you can solve them in under 5 minutes each!"
      />
      
      <ExamTip
        tip="On exams, always state your interpretation in context. Don't just write the numbers - explain what they mean for the specific scenario."
        points="5"
        warning="Forgetting interpretation costs easy points!"
      />
      
      <div ref={contentRef} className="space-y-4">
        {/* Problem Navigation */}
        <div className="flex gap-2 mb-4">
          {problems.map((problem, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentProblem(idx);
                setShowSolution(false);
              }}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${
                currentProblem === idx
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
              }`}
            >
              {problem.title}
            </button>
          ))}
        </div>
        
        {/* Current Problem */}
        <div
          key={currentProblem}
          className="bg-gradient-to-br from-blue-900/20 to-neutral-800 rounded-xl p-6 border border-blue-500/30"
        >
          <h4 className="font-semibold text-blue-400 mb-3">{problems[currentProblem].title}</h4>
          <p className="text-neutral-300 mb-2">{problems[currentProblem].description}</p>
          <p className="font-mono text-sm bg-neutral-800/50 rounded p-2 mb-3">
            {problems[currentProblem].data}
          </p>
          <p className="text-white font-medium">{problems[currentProblem].question}</p>
          
          <button
            onClick={() => {
              setShowSolution(!showSolution);
              if (!showSolution) onInsight('viewedSolution');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
          >
            {showSolution ? 'Hide' : 'Show'} Solution
          </button>
        </div>
        
        {/* Solution */}
        {showSolution && (
          <div
            className="bg-neutral-800/50 rounded-lg p-6 space-y-3"
          >
              <h5 className="font-semibold text-emerald-400">Solution:</h5>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-400">Sample size (n):</p>
                  <p className="font-mono text-white">{problems[currentProblem].solution.n}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Sample mean (<span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x}\\)` }} />):</p>
                  <p className="font-mono text-white">{problems[currentProblem].solution.mean}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Sample SD (s):</p>
                  <p className="font-mono text-white">{problems[currentProblem].solution.s}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Degrees of freedom:</p>
                  <p className="font-mono text-white">{problems[currentProblem].solution.df}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Critical t-value:</p>
                  <p className="font-mono text-white">{problems[currentProblem].solution.tCrit}</p>
                </div>
                <div>
                  <p className="text-neutral-400">Confidence interval:</p>
                  <p className="font-mono text-white">{problems[currentProblem].solution.ci}</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-emerald-900/20 rounded border border-emerald-500/50">
                <p className="text-sm text-emerald-400">
                  <strong>Interpretation:</strong> {problems[currentProblem].solution.interpretation}
                </p>
              </div>
          </div>
        )}
      </div>
    </VisualizationSection>
  );
});

// Common Mistakes Component
const CommonMistakes = () => {
  const contentRef = useRef(null);
  const [expandedMistake, setExpandedMistake] = useState(null);
  
  const mistakes = [
    {
      title: "Using z instead of t for small samples",
      problem: "Using z-critical values when n < 30 and σ is unknown",
      solution: "Always use t-distribution when σ is unknown, regardless of sample size",
      example: "With n = 15, use t₀.₀₂₅,₁₄ = 2.145, not z₀.₀₂₅ = 1.96"
    },
    {
      title: "Wrong degrees of freedom",
      problem: "Using n instead of n-1 for degrees of freedom",
      solution: "For a single sample, df = n - 1",
      example: "Sample size = 20 → df = 19, not 20"
    },
    {
      title: "Forgetting square root in SE formula",
      problem: "Calculating SE as s/n instead of s/√n",
      solution: "Standard error = s/√n, not s/n",
      example: "If s = 10 and n = 25, SE = 10/√25 = 2, not 10/25 = 0.4"
    },
    {
      title: "Misinterpreting confidence level",
      problem: "Saying '95% of data falls in the CI'",
      solution: "The CI contains the parameter with 95% confidence, not the data",
      example: "Correct: 'We are 95% confident μ is in [45, 55]'"
    }
  ];
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-6">Common Mistakes to Avoid</h3>
      
      <div ref={contentRef} className="space-y-3">
        {mistakes.map((mistake, idx) => (
          <div
            key={idx}
            className="bg-neutral-800 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedMistake(expandedMistake === idx ? null : idx)}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center">
                  <X className="w-4 h-4 text-red-400" />
                </div>
                <span className="font-medium text-white">{mistake.title}</span>
              </div>
              <ChevronRight 
                className={`w-5 h-5 text-neutral-400 transition-transform ${
                  expandedMistake === idx ? 'rotate-90' : ''
                }`}
              />
            </button>
            
            {expandedMistake === idx && (
              <div
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-yellow-400 font-medium">Problem:</p>
                        <p className="text-neutral-300">{mistake.problem}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5" />
                      <div>
                        <p className="text-emerald-400 font-medium">Solution:</p>
                        <p className="text-neutral-300">{mistake.solution}</p>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-900 rounded p-3 font-mono text-xs">
                      {mistake.example}
                    </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </VisualizationSection>
  );
};

// Summary Comparison
const SummaryComparison = () => {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-6">When to Use Each Method</h3>
      
      <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
          <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
            <ChevronRight size={16} />
            Z-Interval
          </h4>
          <ul className="space-y-1 text-sm text-neutral-300">
            <li>• σ is known</li>
            <li>• Large sample (n ≥ 30)</li>
            <li>• Population is normal</li>
          </ul>
          <div className="mt-3 text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` 
            }} />
          </div>
        </div>
        
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/50">
          <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
            <ChevronRight size={16} />
            t-Interval
          </h4>
          <ul className="space-y-1 text-sm text-neutral-300">
            <li>• σ is unknown (use s)</li>
            <li>• Small sample (n &lt; 30)</li>
            <li>• Population approximately normal</li>
          </ul>
          <div className="mt-3 text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[\\bar{x} \\pm t_{\\alpha/2,df} \\cdot \\frac{s}{\\sqrt{n}}\\]` 
            }} />
          </div>
        </div>
        
        <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50">
          <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
            <ChevronRight size={16} />
            Bootstrap
          </h4>
          <ul className="space-y-1 text-sm text-neutral-300">
            <li>• No distribution assumptions</li>
            <li>• Complex statistics</li>
            <li>• Non-normal data</li>
          </ul>
          <div className="mt-3 text-center text-sm">
            <p>Resample data with replacement</p>
            <p>Use percentile method</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-yellow-900/20 rounded-lg p-4 border border-yellow-700/50">
        <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
          <AlertTriangle size={16} />
          Important Notes
        </h4>
        <ul className="space-y-1 text-sm text-neutral-300">
          <li>• t-intervals are always wider than z-intervals for the same data</li>
          <li>• The difference is most dramatic for small samples</li>
          <li>• Bootstrap requires many resamples (typically 1000+) for accuracy</li>
          <li>• When in doubt, use t-intervals (more conservative)</li>
        </ul>
      </div>
    </VisualizationSection>
  );
};

// Main Component with Journey Framework
export default function ConfidenceIntervalUnknownVariance() {
  const [currentSection, setCurrentSection] = useState('problem');
  const [userInsights, setUserInsights] = useState({
    understoodProblem: false,
    sawTConvergence: false,
    completedExample: false,
    exploredMath: false,
    completedGuide: false,
    viewedSolution: false,
    problemCompleted: false,
    solutionCompleted: false,
    applicationCompleted: false,
    foundationCompleted: false,
    practiceCompleted: false
  });
  
  // Journey definition
  const TDistributionJourney = {
    problem: {
      id: 'problem',
      title: 'The Unknown σ Problem',
      subtitle: 'Why we need a new approach',
      icon: HelpCircle,
      color: 'yellow',
      sections: ['ProblemStatement', 'NaiveApproach', 'WhyItFails']
    },
    solution: {
      id: 'solution',
      title: 'Enter the t-Distribution',
      subtitle: 'A distribution that accounts for uncertainty',
      icon: Lightbulb,
      color: 'blue',
      sections: ['TDistributionIntro', 'DegreesOfFreedom', 'TvsNormal']
    },
    foundation: {
      id: 'foundation',
      title: 'Mathematical Foundation',
      subtitle: 'Understanding the theory',
      icon: Calculator,
      color: 'purple',
      sections: ['MathematicalDerivation', 'StepByStep']
    },
    application: {
      id: 'application',
      title: 'Apply to Real Data',
      subtitle: 'Build confidence intervals with t',
      icon: BarChart,
      color: 'emerald',
      sections: ['OzoneExample', 'InteractiveBuilder', 'Comparison']
    },
    practice: {
      id: 'practice',
      title: 'Practice & Master',
      subtitle: 'Exam preparation & common mistakes',
      icon: Activity,
      color: 'pink',
      sections: ['PracticeProblems', 'CommonMistakes']
    }
  };
  
  const handleInsight = (insight) => {
    setUserInsights(prev => ({
      ...prev,
      [insight]: true
    }));
    
    // Check for section completion
    if (insight === 'understoodProblem') {
      setUserInsights(prev => ({ ...prev, problemCompleted: true }));
    } else if (insight === 'sawTConvergence') {
      setUserInsights(prev => ({ ...prev, solutionCompleted: true }));
    } else if (insight === 'exploredMath' || insight === 'completedGuide') {
      setUserInsights(prev => ({ ...prev, foundationCompleted: true }));
    } else if (insight === 'completedExample') {
      setUserInsights(prev => ({ ...prev, applicationCompleted: true }));
    } else if (insight === 'viewedSolution') {
      setUserInsights(prev => ({ ...prev, practiceCompleted: true }));
    }
  };
  
  return (
    <VisualizationContainer
      title="5.4 Confidence Intervals: Unknown Variance"
      description="When uncertainty has uncertainty - mastering the t-distribution"
    >
      <BackToHub chapter={5} />
      
      <FloatingFormulaCard />
      
      <JourneyNavigator
        journey={TDistributionJourney}
        currentSection={currentSection}
        userInsights={userInsights}
        onNavigate={setCurrentSection}
      />
      
      <div
        key={currentSection}
      >
        <SectionContent
          section={TDistributionJourney[currentSection]}
          onInsight={handleInsight}
        />
      </div>
      
      <SummaryComparison />
      <CommonMistakes />
      
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-6">Key Takeaways</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
              <Lightbulb size={16} />
              Conceptual Understanding
            </h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Using s instead of σ adds uncertainty</li>
              <li>• t-distribution accounts for this extra variability</li>
              <li>• Degrees of freedom measure available information</li>
              <li>• Bootstrap provides distribution-free alternative</li>
            </ul>
          </div>
          
          <div className="bg-neutral-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <Activity size={16} />
              Practical Guidelines
            </h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Always use t for small samples (n &lt; 30)</li>
              <li>• Check normality assumption for small n</li>
              <li>• Bootstrap for non-normal or complex cases</li>
              <li>• Report method and assumptions clearly</li>
            </ul>
          </div>
        </div>
      </VisualizationSection>
      
      {/* Section Complete - Standardized Component */}
      <SectionComplete chapter={5} />
    </VisualizationContainer>
  );
}