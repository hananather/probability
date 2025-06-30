"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { motion } from "framer-motion";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { ChevronRight, Info, AlertCircle, BookOpen, Lightbulb } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const colorScheme = createColorScheme('hypothesis');

// Concept explanation card
const ConceptCard = ({ title, children, icon: Icon = Info, variant = "default" }) => {
  const variants = {
    default: "bg-neutral-900/50 border-neutral-700",
    primary: "bg-purple-900/20 border-purple-700/50",
    warning: "bg-yellow-900/20 border-yellow-700/50",
    success: "bg-green-900/20 border-green-700/50"
  };
  
  return (
    <div className={cn("rounded-lg p-4 border", variants[variant])}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
        <div className="space-y-2">
          {title && <h3 className="text-base font-semibold text-white">{title}</h3>}
          <div className="text-neutral-300 text-sm space-y-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mathematical definition section
const MathDefinition = ({ title, children }) => (
  <div className="bg-neutral-900/80 rounded-lg p-4 border border-neutral-700">
    <h4 className="text-purple-400 font-semibold text-sm mb-3">{title}</h4>
    <div className="space-y-2 text-neutral-200 text-sm">
      {children}
    </div>
  </div>
);

// Distribution visualization with annotations
const AnnotatedDistribution = ({ testType, alpha = 0.05, showValues = true, testStatistic = null }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 500; // Fixed height to match SVG
    const margin = { top: 100, right: 120, bottom: 140, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    
    // Set explicit dimensions on SVG
    svg.attr("width", width)
       .attr("height", height);
    
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.5])  // Slightly increased to give more headroom
      .range([innerHeight, 0]);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Generate normal distribution data
    const xValues = d3.range(-4, 4.1, 0.1);
    const data = xValues.map(x => ({
      x: x,
      y: (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x)
    }));
    
    // Create area generator
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(innerHeight)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    // Draw the distribution
    g.append("path")
      .datum(data)
      .attr("fill", "#374151")
      .attr("opacity", 0.3)
      .attr("d", area);
    
    // Draw the curve
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#9333ea")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Critical values based on test type
    let criticalValues = [];
    if (testType === 'two-tailed') {
      const z = jStat.normal.inv(1 - alpha/2, 0, 1);
      criticalValues = [-z, z];
    } else if (testType === 'left-tailed') {
      criticalValues = [jStat.normal.inv(alpha, 0, 1)];
    } else if (testType === 'right-tailed') {
      criticalValues = [jStat.normal.inv(1 - alpha, 0, 1)];
    }
    
    // Shade rejection regions
    criticalValues.forEach((cv, i) => {
      let rejectionData;
      if (testType === 'two-tailed') {
        rejectionData = data.filter(d => i === 0 ? d.x <= cv : d.x >= cv);
      } else if (testType === 'left-tailed') {
        rejectionData = data.filter(d => d.x <= cv);
      } else {
        rejectionData = data.filter(d => d.x >= cv);
      }
      
      g.append("path")
        .datum(rejectionData)
        .attr("fill", "#ef4444")
        .attr("opacity", 0.3)
        .attr("d", area);
    });
    
    // Draw critical value lines
    criticalValues.forEach(cv => {
      g.append("line")
        .attr("x1", xScale(cv))
        .attr("x2", xScale(cv))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      if (showValues) {
        g.append("text")
          .attr("x", xScale(cv))
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .style("fill", "#ef4444")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .text(cv.toFixed(2));
      }
    });
    
    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(9))
      .style("color", "#9ca3af")
      .style("font-size", "12px");
    
    // Y-axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5))
      .style("color", "#9ca3af")
      .style("font-size", "12px");
    
    // Labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 50)
      .attr("text-anchor", "middle")
      .style("fill", "#e5e7eb")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("z-score");
    
    // Add annotations
    if (testType === 'two-tailed') {
      // Left rejection region
      g.append("text")
        .attr("x", xScale(-2.5))
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#ef4444")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(`α/2 = ${(alpha/2).toFixed(3)}`);
      
      // Right rejection region
      g.append("text")
        .attr("x", xScale(2.5))
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#ef4444")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(`α/2 = ${(alpha/2).toFixed(3)}`);
      
      // Non-rejection region
      g.append("text")
        .attr("x", xScale(0))
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#10b981")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(`1 - α = ${(1 - alpha).toFixed(2)}`);
    } else if (testType === 'left-tailed') {
      g.append("text")
        .attr("x", xScale(-2.5))
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#ef4444")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(`α = ${alpha.toFixed(3)}`);
    } else {
      g.append("text")
        .attr("x", xScale(2.5))
        .attr("y", innerHeight / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#ef4444")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(`α = ${alpha.toFixed(3)}`);
    }
    
    // Draw test statistic if provided
    if (testStatistic !== null && !isNaN(testStatistic)) {
      const testX = xScale(testStatistic);
      const testY = yScale((1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * testStatistic * testStatistic));
      
      // Drop line
      g.append("line")
        .attr("x1", testX)
        .attr("x2", testX)
        .attr("y1", testY)
        .attr("y2", innerHeight)
        .attr("stroke", "#fbbf24")
        .attr("stroke-width", 2);
      
      // Point
      g.append("circle")
        .attr("cx", testX)
        .attr("cy", testY)
        .attr("r", 6)
        .attr("fill", "#fbbf24")
        .attr("stroke", "#171717")
        .attr("stroke-width", 2);
      
      g.append("text")
        .attr("x", xScale(testStatistic))
        .attr("y", testY - 15)
        .attr("text-anchor", "middle")
        .style("fill", "#fbbf24")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(`z = ${testStatistic.toFixed(2)}`);
    }
    
  }, [testType, alpha, showValues, testStatistic]);
  
  return <svg ref={svgRef} className="w-full" style={{ height: '500px' }} />;
};

// Example calculation component with proper LaTeX handling
const ExampleCalculation = ({ testType, example }) => {
  const [step, setStep] = useState(0);
  const maxSteps = 5;
  const contentRef = useMathJax([step, testType]);
  
  return (
    <div className="bg-neutral-900/50 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-bold text-purple-400">Worked Example: {example.title}</h3>
      
      <div ref={contentRef} className="space-y-4">
        {step >= 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-neutral-800/50 rounded-lg p-4"
          >
            <h4 className="text-base font-semibold text-white mb-2">Scenario</h4>
            <p className="text-neutral-300 text-sm">{example.scenario}</p>
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-neutral-400">Null Mean</p>
                <p className="text-base font-mono text-white">μ₀ = {example.mu0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-neutral-400">Std Dev</p>
                <p className="text-base font-mono text-white">σ = {example.sigma}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-neutral-400">Sample Size</p>
                <p className="text-base font-mono text-white">n = {example.n}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-neutral-400">Sample Mean</p>
                <p className="text-base font-mono text-white">x̄ = {example.xbar}</p>
              </div>
            </div>
          </motion.div>
        )}
        
        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MathDefinition title="Step 1: State the Hypotheses">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <p className="text-sm text-neutral-400 mb-2">Null Hypothesis</p>
                  <p className="text-base">H₀: μ = {example.mu0}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-neutral-400 mb-2">Alternative Hypothesis</p>
                  <p className="text-base">H₁: μ {testType === 'two-tailed' ? '≠' : testType === 'left-tailed' ? '<' : '>'} {example.mu0}</p>
                </div>
              </div>
              <p className="text-neutral-400 mt-4 text-center italic">{example.interpretation}</p>
            </MathDefinition>
          </motion.div>
        )}
        
        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MathDefinition title="Step 2: Calculate Test Statistic">
              <div className="space-y-4">
                <p className="text-base text-center">
                  <span dangerouslySetInnerHTML={{ __html: `\\(z = \\frac{\\bar{x} - \\mu_0}{\\sigma/\\sqrt{n}}\\)` }} />
                </p>
                <p className="text-base text-center">
                  <span dangerouslySetInnerHTML={{ __html: `\\(z = \\frac{${example.xbar} - ${example.mu0}}{${example.sigma}/\\sqrt{${example.n}}}\\)` }} />
                </p>
                <p className="text-base text-center">
                  <span dangerouslySetInnerHTML={{ __html: `\\(z = \\frac{${example.xbar - example.mu0}}{${(example.sigma/Math.sqrt(example.n)).toFixed(3)}} = ${example.z.toFixed(3)}\\)` }} />
                </p>
              </div>
            </MathDefinition>
          </motion.div>
        )}
        
        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MathDefinition title="Step 3: Find Critical Value(s)">
              <p className="text-center text-sm mb-2">For α = {example.alpha}:</p>
              <div className="text-center text-base font-mono">
                {testType === 'two-tailed' && (
                  <p>Critical values: z = ±{example.criticalValue.toFixed(3)}</p>
                )}
                {testType === 'left-tailed' && (
                  <p>Critical value: z = -{example.criticalValue.toFixed(3)}</p>
                )}
                {testType === 'right-tailed' && (
                  <p>Critical value: z = {example.criticalValue.toFixed(3)}</p>
                )}
              </div>
            </MathDefinition>
          </motion.div>
        )}
        
        {step >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MathDefinition title="Step 4: Calculate p-value">
              <div className="text-center text-base space-y-2">
                {testType === 'two-tailed' && (
                  <p>p-value = 2 × P(Z {'>'} |{example.z.toFixed(3)}|) = {example.pValue.toFixed(4)}</p>
                )}
                {testType === 'left-tailed' && (
                  <p>p-value = P(Z {'<'} {example.z.toFixed(3)}) = {example.pValue.toFixed(4)}</p>
                )}
                {testType === 'right-tailed' && (
                  <p>p-value = P(Z {'>'} {example.z.toFixed(3)}) = {example.pValue.toFixed(4)}</p>
                )}
              </div>
            </MathDefinition>
          </motion.div>
        )}
        
        {step >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MathDefinition title="Step 5: Decision">
              <div className="text-center space-y-4">
                <p className="text-base">
                  Since p-value = {example.pValue.toFixed(4)} {example.pValue < example.alpha ? '<' : '>'} α = {example.alpha}
                </p>
                <p className="text-base font-bold">
                  {example.pValue < example.alpha ? 
                    <span className="text-red-400">Reject H₀</span> : 
                    <span className="text-green-400">Fail to reject H₀</span>
                  }
                </p>
                <p className="text-sm text-neutral-400 mt-2">{example.conclusion}</p>
              </div>
            </MathDefinition>
          </motion.div>
        )}
      </div>
      
      <div className="flex justify-between items-center pt-4">
        <Button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          size="sm"
          variant="outline"
        >
          Previous Step
        </Button>
        <span className="text-sm text-neutral-400">
          Step {Math.min(step + 1, maxSteps + 1)} of {maxSteps + 1}
        </span>
        <Button
          onClick={() => setStep(Math.min(maxSteps, step + 1))}
          disabled={step === maxSteps}
          size="sm"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

// Memoized Test Information Section to prevent LaTeX re-rendering
const TestInformationSection = React.memo(({ currentTest, activeTest }) => {
  const sectionRef = useMathJax([activeTest]);
  
  return (
    <section ref={sectionRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ConceptCard title={currentTest.name} variant="primary">
        <p className="text-lg">{currentTest.description}</p>
        <div className="bg-neutral-800/50 rounded-lg p-4 space-y-2">
          <p className="text-lg"><span dangerouslySetInnerHTML={{ __html: `\\(${currentTest.hypothesis.null}\\)` }} /></p>
          <p className="text-lg"><span dangerouslySetInnerHTML={{ __html: `\\(${currentTest.hypothesis.alternative}\\)` }} /></p>
        </div>
        <p><strong>When to use:</strong> {currentTest.when}</p>
        <p><strong>Rejection region:</strong> {currentTest.criticalRegions}</p>
      </ConceptCard>
      
      <ConceptCard title="Quick Reference" icon={Info}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Type</span>
            <span className="font-mono">{activeTest}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Symbol</span>
            <span className="text-2xl font-mono">{currentTest.symbol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Alpha splits</span>
            <span className="font-mono">
              {activeTest === 'two-tailed' ? 'α/2 each tail' : 'α in one tail'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">More conservative?</span>
            <span className="font-mono">
              {activeTest === 'two-tailed' ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </ConceptCard>
    </section>
  );
});

TestInformationSection.displayName = 'TestInformationSection';

export default function TypesOfHypotheses({ onSwitchToInteractive }) {
  const [activeTest, setActiveTest] = useState('two-tailed');
  const [showExample, setShowExample] = useState(false);
  const mainContentRef = useMathJax([activeTest]);
  
  const testTypes = {
    'two-tailed': {
      name: 'Two-Tailed Test',
      symbol: '≠',
      description: 'Tests for any difference from the null hypothesis value',
      hypothesis: {
        null: 'H₀: μ = μ₀',
        alternative: 'H₁: μ ≠ μ₀'
      },
      when: 'Use when you want to detect any change, regardless of direction',
      criticalRegions: 'Both tails of the distribution',
      example: {
        title: 'Quality Control',
        scenario: 'A machine is supposed to fill bottles with 500ml. We test if the machine is working correctly.',
        mu0: 500,
        sigma: 10,
        n: 36,
        xbar: 495,
        z: -3.0,
        alpha: 0.05,
        criticalValue: 1.96,
        pValue: 0.0027,
        interpretation: 'We want to detect if the machine fills either too much OR too little',
        conclusion: 'Strong evidence that the machine is not filling bottles correctly'
      }
    },
    'left-tailed': {
      name: 'Left-Tailed Test',
      symbol: '<',
      description: 'Tests if the parameter is less than the null hypothesis value',
      hypothesis: {
        null: 'H₀: μ = μ₀',
        alternative: 'H₁: μ < μ₀'
      },
      when: 'Use when you specifically want to test for a decrease',
      criticalRegions: 'Left tail of the distribution',
      example: {
        title: 'Drug Effectiveness',
        scenario: 'A drug claims to reduce blood pressure. Normal BP is 120. We test if it actually reduces BP.',
        mu0: 120,
        sigma: 15,
        n: 25,
        xbar: 115,
        z: -1.67,
        alpha: 0.05,
        criticalValue: 1.645,
        pValue: 0.0475,
        interpretation: 'We only care if the drug reduces BP, not if it increases it',
        conclusion: 'Moderate evidence that the drug reduces blood pressure'
      }
    },
    'right-tailed': {
      name: 'Right-Tailed Test',
      symbol: '>',
      description: 'Tests if the parameter is greater than the null hypothesis value',
      hypothesis: {
        null: 'H₀: μ = μ₀',
        alternative: 'H₁: μ > μ₀'
      },
      when: 'Use when you specifically want to test for an increase',
      criticalRegions: 'Right tail of the distribution',
      example: {
        title: 'New Teaching Method',
        scenario: 'A new teaching method claims to improve test scores. Current average is 75. We test if it increases scores.',
        mu0: 75,
        sigma: 12,
        n: 30,
        xbar: 78,
        z: 1.37,
        alpha: 0.05,
        criticalValue: 1.645,
        pValue: 0.0853,
        interpretation: 'We only care if the method improves scores, not if it worsens them',
        conclusion: 'Insufficient evidence that the new method improves scores'
      }
    }
  };
  
  const currentTest = testTypes[activeTest];
  
  return (
    <VisualizationContainer 
      title="Types of Hypothesis Tests"
      subtitle="Understanding one-tailed and two-tailed tests"
    >
      <div className="space-y-10">
        {/* Introduction Section - MOVED TO TOP */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">Understanding Hypothesis Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ConceptCard title="The Logic" icon={BookOpen}>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Assume the null hypothesis (H₀) is true</li>
                <li>Calculate how likely our sample data would be if H₀ were true</li>
                <li>If the data is very unlikely under H₀, we reject it</li>
              </ol>
            </ConceptCard>
            
            <ConceptCard title="Choosing Your Test" icon={AlertCircle}>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Two-tailed:</strong> When direction doesn't matter (≠)</li>
                <li><strong>Left-tailed:</strong> When testing for decrease ({'<'})</li>
                <li><strong>Right-tailed:</strong> When testing for increase ({'>'})</li>
              </ul>
            </ConceptCard>
            
            <ConceptCard title="Key Principle" icon={Lightbulb} variant="warning">
              <p className="text-sm">Your research question should determine the test type, not the data. Choose your test before looking at results!</p>
            </ConceptCard>
          </div>
        </section>
        
        {/* Main Visualization Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Distribution Visualization</h2>
            <div className="flex gap-2">
              {Object.entries(testTypes).map(([key, test]) => (
                <Button
                  key={key}
                  onClick={() => setActiveTest(key)}
                  variant={activeTest === key ? 'default' : 'outline'}
                  size="sm"
                >
                  {test.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Large Distribution Graph */}
          <GraphContainer height="h-[500px]">
            <AnnotatedDistribution 
              testType={activeTest} 
              alpha={0.05}
              showValues={true}
              testStatistic={showExample ? currentTest.example.z : null}
            />
          </GraphContainer>
        </section>
        
        {/* Test Information Section - Memoized to prevent LaTeX re-rendering */}
        <TestInformationSection currentTest={currentTest} activeTest={activeTest} />
        
        {/* Worked Example Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Worked Example</h2>
            <Button
              onClick={() => setShowExample(!showExample)}
              size="sm"
              variant={showExample ? 'default' : 'outline'}
            >
              {showExample ? 'Hide' : 'Show'} Example
            </Button>
          </div>
          
          {showExample && (
            <ExampleCalculation 
              testType={activeTest} 
              example={currentTest.example}
            />
          )}
        </section>
        
        {/* Key Insights Section */}
        <section>
          <ConceptCard title="Key Insights" icon={Lightbulb} variant="success">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Important Points</h4>
                <ul className="space-y-2">
                  <li>• The choice of test affects your critical values and rejection regions</li>
                  <li>• Two-tailed tests are more conservative (harder to reject H₀)</li>
                  <li>• One-tailed tests have more power in the specified direction</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Common Mistakes</h4>
                <ul className="space-y-2">
                  <li>• Choosing test type after seeing the data</li>
                  <li>• Using one-tailed test just to get significance</li>
                  <li>• Forgetting to split α in two-tailed tests</li>
                </ul>
              </div>
            </div>
          </ConceptCard>
        </section>
        
        {/* Navigation Button */}
        {onSwitchToInteractive && (
          <section className="mt-8 text-center">
            <div className="bg-neutral-900/50 rounded-lg p-6 border border-neutral-700">
              <h3 className="text-lg font-semibold text-white mb-3">Ready for Hands-On Practice?</h3>
              <p className="text-neutral-300 mb-4">
                Explore an interactive visualization where you can manipulate test statistics in real-time 
                and see how different hypothesis types lead to different conclusions.
              </p>
              <Button
                onClick={onSwitchToInteractive}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <ChevronRight className="w-5 h-5 mr-2" />
                Try Interactive Version
              </Button>
            </div>
          </section>
        )}
      </div>
    </VisualizationContainer>
  );
}