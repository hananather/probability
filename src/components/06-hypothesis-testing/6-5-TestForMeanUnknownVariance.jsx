"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { motion, AnimatePresence } from "framer-motion";
import { cn, typography } from "@/lib/design-system";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer
} from '@/components/ui/VisualizationContainer';
import { RangeSlider } from "@/components/ui/RangeSlider";
import BackToHub from '@/components/ui/BackToHub';
import { useMathJax } from '@/hooks/useMathJax';
import { ChevronRight, AlertCircle, CheckCircle, Play, BarChart } from 'lucide-react';

// Professional color palette (no pink)
const colors = {
  primary: '#3b82f6',      // Blue
  primaryLight: '#60a5fa',
  secondary: '#8b5cf6',    // Purple
  secondaryLight: '#a78bfa',
  accent: '#14b8a6',       // Teal
  accentLight: '#2dd4bf',
  warning: '#f59e0b',      // Amber
  warningLight: '#fbbf24',
  success: '#10b981',      // Emerald
  successLight: '#34d399',
  info: '#06b6d4',         // Cyan
  infoLight: '#22d3ee',
};

// Sample data
const sampleData = [
  18.0, 17.4, 15.5, 16.8, 19.0, 17.8, 17.4, 15.8,
  17.9, 16.3, 16.9, 18.6, 17.7, 16.4, 18.2, 18.7
];

const calculateStats = (data) => {
  const n = data.length;
  const mean = data.reduce((sum, x) => sum + x, 0) / n;
  const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / (n - 1);
  const sd = Math.sqrt(variance);
  return { n, mean, sd, variance };
};

const { n, mean: sampleMean, sd: sampleSD } = calculateStats(sampleData);

// Clean button component
const ActionButton = ({ children, onClick, variant = "primary", disabled = false, className = "", icon: Icon }) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-neutral-700 hover:bg-neutral-600 text-neutral-300",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
        variants[variant],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </div>
    </button>
  );
};

// Info card component
const InfoCard = ({ title, value, subtitle, color = "primary", icon: Icon }) => (
  <div className="relative group">
    <div 
      className="absolute inset-0 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"
      style={{ backgroundColor: colors[color] }}
    />
    <div className="relative bg-gray-900/80 backdrop-blur-md rounded-xl p-6 border border-gray-700">
      {Icon && <Icon className="w-6 h-6 mb-3" style={{ color: colors[color] }} />}
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
    </div>
  </div>
);

// Main component
export function TestForMeanUnknownVariance() {
  const [currentSection, setCurrentSection] = useState(0);
  const [selectedDf, setSelectedDf] = useState(15);
  const [showDistribution, setShowDistribution] = useState(false);
  
  const problemRef = useMathJax([currentSection]);
  const comparisonRef = useMathJax([currentSection]);
  const distributionRef = useRef(null);
  const testingRef = useMathJax([currentSection]);

  // Section 1: Problem Introduction
  const renderProblemSection = () => (
    <motion.div
      ref={problemRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Testing Reaction Times
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          A psychologist claims the mean reaction time is 16.6 seconds. 
          We collected data to test this claim, but there's a catch...
        </p>
      </div>

      {/* Data visualization */}
      <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6">Our Sample Data</h3>
        
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-8">
          {sampleData.map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.02 }}
              className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700"
            >
              <span className="text-sm font-mono text-white">
                {value.toFixed(1)}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoCard 
            title="Sample Size" 
            value={`n = ${n}`}
            color="info"
          />
          <InfoCard 
            title="Sample Mean" 
            value={
              <span dangerouslySetInnerHTML={{ 
                __html: `\\(\\bar{x} = ${sampleMean.toFixed(1)}\\)` 
              }} />
            }
            subtitle={
              <span dangerouslySetInnerHTML={{ 
                __html: `vs claimed \\(\\mu_0 = 16.6\\)` 
              }} />
            }
            color="primary"
          />
          <InfoCard 
            title="Sample SD" 
            value={`s = ${sampleSD.toFixed(3)}`}
            subtitle="Unknown σ!"
            color="warning"
            icon={AlertCircle}
          />
        </div>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-900/30 rounded-full border border-amber-600">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <p className="text-amber-300 font-semibold">
              We don't know the population variance σ!
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <ActionButton onClick={() => setCurrentSection(1)} variant="primary" icon={ChevronRight}>
          See the Solution
        </ActionButton>
      </div>
    </motion.div>
  );

  // Section 2: Z vs T Comparison
  const renderComparisonSection = () => (
    <motion.div
      ref={comparisonRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h3 className="text-3xl font-bold text-center text-white">
        Why We Need the t-Distribution
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Z-test card */}
        <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl p-6 border border-blue-700/50">
          <h4 className="text-xl font-bold text-blue-400 mb-4">If σ known (Z-test)</h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Test Statistic</p>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[Z = \\frac{\\bar{X} - \\mu_0}{\\sigma/\\sqrt{n}}\\]` 
                }} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Distribution</p>
              <p className="text-white font-mono">Z ~ N(0,1)</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Uses</p>
              <p className="text-amber-400 font-semibold">σ (parameter)</p>
            </div>
          </div>
        </div>

        {/* T-test card */}
        <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl p-6 border border-purple-700/50">
          <h4 className="text-xl font-bold text-purple-400 mb-4">σ unknown (t-test)</h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Test Statistic</p>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[T = \\frac{\\bar{X} - \\mu_0}{S/\\sqrt{n}}\\]` 
                }} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Distribution</p>
              <p className="text-white font-mono">T ~ t(n-1)</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Uses</p>
              <p className="text-amber-400 font-semibold">S (statistic)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-xl p-6 border border-amber-700/50">
        <p className="text-center text-amber-300 font-semibold text-lg">
          S varies sample to sample → Extra uncertainty!
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <ActionButton onClick={() => setCurrentSection(0)} variant="secondary">
          Back
        </ActionButton>
        <ActionButton onClick={() => setCurrentSection(2)} variant="primary" icon={ChevronRight}>
          Explore T-Distribution
        </ActionButton>
      </div>
    </motion.div>
  );

  // T-distribution visualization
  useEffect(() => {
    if (!distributionRef.current || currentSection !== 2 || !showDistribution) return;

    const container = distributionRef.current;
    const { width: containerWidth } = container.getBoundingClientRect();
    
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = Math.min(containerWidth, 700);
    const height = 400;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous
    d3.select(container).selectAll("*").remove();

    const svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 0.45])
      .range([innerHeight, 0]);

    // Axes
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 45)
      .attr("fill", "#9ca3af")
      .style("text-anchor", "middle")
      .text("Standard Deviations");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "#9ca3af")
      .style("text-anchor", "middle")
      .text("Probability Density");

    // Generate data
    const xValues = d3.range(-4, 4.1, 0.05);
    const tData = xValues.map(x => ({
      x,
      y: jStat.studentt.pdf(x, selectedDf)
    }));
    const normalData = xValues.map(x => ({
      x,
      y: jStat.normal.pdf(x, 0, 1)
    }));

    // Line generator
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Draw distributions
    g.append("path")
      .datum(normalData)
      .attr("fill", "none")
      .attr("stroke", colors.primaryLight)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,3")
      .attr("d", line)
      .style("opacity", 0.7);

    g.append("path")
      .datum(tData)
      .attr("fill", "none")
      .attr("stroke", colors.secondary)
      .attr("stroke-width", 3)
      .attr("d", line);

    // Critical values
    const criticalValue = jStat.studentt.inv(0.975, selectedDf);
    
    [-criticalValue, criticalValue].forEach(cv => {
      g.append("line")
        .attr("x1", xScale(cv))
        .attr("x2", xScale(cv))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colors.warning)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,3");

      g.append("text")
        .attr("x", xScale(cv))
        .attr("y", innerHeight + 20)
        .attr("text-anchor", "middle")
        .attr("fill", colors.warning)
        .style("font-size", "12px")
        .text(cv.toFixed(3));
    });

    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth - 150}, 20)`);

    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", colors.secondary)
      .attr("stroke-width", 3);
    
    legend.append("text")
      .attr("x", 25)
      .attr("y", 4)
      .attr("fill", "#e5e7eb")
      .style("font-size", "12px")
      .text(`t(${selectedDf})`);

    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 20)
      .attr("y2", 20)
      .attr("stroke", colors.primaryLight)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,3");
    
    legend.append("text")
      .attr("x", 25)
      .attr("y", 24)
      .attr("fill", "#e5e7eb")
      .style("font-size", "12px")
      .text("N(0,1)");

  }, [currentSection, selectedDf, showDistribution]);

  // Section 3: T-Distribution Insight
  const renderDistributionSection = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h3 className="text-3xl font-bold text-center text-white">
        The t-Distribution Family
      </h3>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1">
          <VisualizationSection className="p-6 bg-gray-900/50 border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">Controls</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 flex justify-between mb-2">
                  <span>Degrees of Freedom</span>
                  <span className="text-purple-400 font-bold">{selectedDf}</span>
                </label>
                <RangeSlider
                  value={selectedDf}
                  onChange={setSelectedDf}
                  min={1}
                  max={30}
                  step={1}
                />
                <p className="text-xs text-gray-500 mt-2">
                  n = {selectedDf + 1} observations
                </p>
              </div>
              {!showDistribution && (
                <ActionButton 
                  onClick={() => setShowDistribution(true)} 
                  variant="primary"
                  className="w-full"
                  icon={Play}
                >
                  Show Distribution
                </ActionButton>
              )}
            </div>
          </VisualizationSection>

          {/* Key Insight */}
          <VisualizationSection className="mt-4 p-6 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-700/50">
            <h4 className="text-lg font-bold text-white mb-3">Key Insight</h4>
            <p className="text-sm text-gray-300">
              The t-distribution has <span className="text-amber-400 font-semibold">heavier tails</span> than 
              the normal distribution, accounting for the extra uncertainty when we estimate σ with s.
            </p>
            <p className="text-sm text-gray-300 mt-3">
              As df increases (n gets larger), the t-distribution approaches the normal distribution.
            </p>
          </VisualizationSection>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-2">
          <GraphContainer height="400px" className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
            <div ref={distributionRef} className="w-full h-full" />
          </GraphContainer>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <ActionButton onClick={() => setCurrentSection(1)} variant="secondary">
          Back
        </ActionButton>
        <ActionButton onClick={() => setCurrentSection(3)} variant="primary" icon={CheckCircle}>
          Perform the Test
        </ActionButton>
      </div>
    </motion.div>
  );

  // Section 4: Testing
  const renderTestingSection = () => {
    const tStatistic = (sampleMean - 16.6) / (sampleSD / Math.sqrt(n));
    const df = n - 1;
    const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStatistic), df));
    const criticalValue = jStat.studentt.inv(0.975, df);
    
    return (
      <motion.div
        ref={testingRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <h3 className="text-3xl font-bold text-center text-white">
          Performing the t-Test
        </h3>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Step 1: Calculate t-statistic */}
          <VisualizationSection className="p-6 bg-gray-900/50 border-gray-700">
            <h4 className="text-lg font-bold text-blue-400 mb-4">Step 1: Calculate Test Statistic</h4>
            <div className="bg-gray-950/50 rounded-lg p-4 mb-4">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[t = \\frac{\\bar{x} - \\mu_0}{s/\\sqrt{n}} = \\frac{${sampleMean.toFixed(2)} - 16.6}{${sampleSD.toFixed(3)}/\\sqrt{${n}}} = ${tStatistic.toFixed(3)}\\]` 
              }} />
            </div>
            <p className="text-sm text-gray-300">
              This measures how many standard errors our sample mean is from the claimed value.
            </p>
          </VisualizationSection>

          {/* Step 2: Degrees of freedom */}
          <VisualizationSection className="p-6 bg-gray-900/50 border-gray-700">
            <h4 className="text-lg font-bold text-purple-400 mb-4">Step 2: Degrees of Freedom</h4>
            <div className="bg-gray-950/50 rounded-lg p-4 mb-4">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[df = n - 1 = ${n} - 1 = ${df}\\]` 
              }} />
            </div>
            <p className="text-sm text-gray-300">
              We lose one degree of freedom because we estimated μ with the sample mean.
            </p>
          </VisualizationSection>

          {/* Step 3: P-value */}
          <VisualizationSection className="p-6 bg-gray-900/50 border-gray-700">
            <h4 className="text-lg font-bold text-teal-400 mb-4">Step 3: Calculate p-value</h4>
            <div className="bg-gray-950/50 rounded-lg p-4 mb-4">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[p\\text{-value} = 2 \\times P(T_{${df}} > |${tStatistic.toFixed(3)}|) = ${pValue.toFixed(4)}\\]` 
              }} />
            </div>
            <p className="text-sm text-gray-300">
              The probability of seeing data this extreme if H₀ is true (two-tailed test).
            </p>
          </VisualizationSection>

          {/* Step 4: Decision */}
          <VisualizationSection className="p-6 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-700/50">
            <h4 className="text-lg font-bold text-emerald-400 mb-4">Step 4: Make Decision</h4>
            <div className="bg-gray-950/50 rounded-lg p-4 mb-4">
              <p className="text-white">
                p-value = {pValue.toFixed(4)} {pValue < 0.05 ? '<' : '>'} α = 0.05
              </p>
            </div>
            <div className="text-center text-2xl font-bold text-emerald-400 mb-4">
              {pValue < 0.05 ? 'Reject H₀' : 'Fail to Reject H₀'}
            </div>
            <p className="text-sm text-gray-300">
              {pValue < 0.05 
                ? "Strong evidence that the true mean reaction time differs from 16.6 seconds."
                : "Insufficient evidence to conclude the mean differs from 16.6 seconds."}
            </p>
          </VisualizationSection>

          {/* Additional info */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-gray-700">
            <h4 className="text-lg font-bold text-white mb-4">Summary Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">t-statistic:</span>
                <span className="text-white font-mono ml-2">{tStatistic.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-gray-400">Critical value (α=0.05):</span>
                <span className="text-white font-mono ml-2">±{criticalValue.toFixed(3)}</span>
              </div>
              <div>
                <span className="text-gray-400">p-value:</span>
                <span className="text-white font-mono ml-2">{pValue.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-gray-400">Degrees of freedom:</span>
                <span className="text-white font-mono ml-2">{df}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <ActionButton onClick={() => setCurrentSection(2)} variant="secondary">
            Back
          </ActionButton>
          <ActionButton onClick={() => setCurrentSection(0)} variant="success">
            Start Over
          </ActionButton>
        </div>
      </motion.div>
    );
  };

  // Section navigation
  const sections = [
    { title: 'Problem', icon: AlertCircle },
    { title: 'Comparison', icon: BarChart },
    { title: 'T-Distribution', icon: BarChart },
    { title: 'Testing', icon: CheckCircle }
  ];

  // Navigation bar
  const renderNavigation = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center gap-2 p-1 bg-gray-900/50 backdrop-blur rounded-full">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          const isActive = idx === currentSection;
          
          return (
            <button
              key={idx}
              onClick={() => setCurrentSection(idx)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{section.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <VisualizationContainer
      title="6.5 Test for a Mean (Unknown Variance)"
      description={
        <>
          <p className={typography.description}>
            <strong>The Reality:</strong> In practice, we rarely know the population variance σ. 
            This creates a fundamental challenge in hypothesis testing.
          </p>
          <p className={cn(typography.description, "mt-2")}>
            Discover how Student's t-distribution elegantly solves this problem by accounting 
            for the extra uncertainty when estimating σ from our sample.
          </p>
        </>
      }
    >
      <BackToHub chapter={6} />
      
      <div className="space-y-8">
        {renderNavigation()}
        <AnimatePresence mode="wait">
          {currentSection === 0 && renderProblemSection()}
          {currentSection === 1 && renderComparisonSection()}
          {currentSection === 2 && renderDistributionSection()}
          {currentSection === 3 && renderTestingSection()}
        </AnimatePresence>
      </div>
    </VisualizationContainer>
  );
}

export default TestForMeanUnknownVariance;