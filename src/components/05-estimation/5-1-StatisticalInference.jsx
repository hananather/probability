"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
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
  Brain, Target, Activity, BarChart, RefreshCw, 
  TrendingUp, Users, Dice6, Package, Vote, ChevronRight,
  Play, Pause, RotateCcw
} from 'lucide-react';

// Use probability color scheme for consistency with Chapter 2
const chapterColors = createColorScheme('probability');

// Introduction Component
const StatisticalInferenceIntroduction = React.memo(function StatisticalInferenceIntroduction() {
  const contentRef = useRef(null);
  const [selectedExample, setSelectedExample] = useState('manufacturing');
  
  // Example details from course material
  const manufacturingDetails = {
    parameter: 'Mean defect rate',
    notation: <span dangerouslySetInnerHTML={{ __html: '\\(\\mu\\)' }} />,
    sample: 'n = 100 products',
    estimate: <><span dangerouslySetInnerHTML={{ __html: '\\(\\bar{x}\\)' }} /> = sample mean</>,
    question: 'Is the production process meeting quality standards?'
  };
  
  const electionDetails = {
    parameter: 'True proportion of support',
    notation: 'p',
    sample: 'n = 1000 voters',
    estimate: 'p̂ = sample proportion',
    question: 'What percentage of the population supports each candidate?'
  };
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedExample]);
  
  const ExampleCard = ({ icon: Icon, title, description, details, isSelected, onSelect }) => (
    <div
      className={`p-4 rounded-lg border cursor-pointer ${
        isSelected 
          ? 'bg-blue-900/30 border-blue-500/50 shadow-lg shadow-blue-500/20' 
          : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-neutral-400'}`} />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-400 mb-1">{title}</h4>
          <p className="text-sm text-neutral-300">{description}</p>
        </div>
      </div>
    </div>
  );
  
  return (
    <div ref={contentRef} className="space-y-6">
      {/* Primary Definition */}
      <div 
        className="bg-blue-900/20 rounded-xl p-6 border border-blue-500/20"
      >
        <h3 className="text-xl font-bold text-blue-400 mb-4">
          The Fundamental Goal
        </h3>
        <p className="text-base text-neutral-200 leading-relaxed">
          One of the goals of statistical inference is to draw conclusions about a
          <span className="mx-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
            population
          </span>
          based on a
          <span className="mx-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
            random sample
          </span>
          from the population.
        </p>
      </div>
      
      {/* Course Examples Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <ExampleCard
          icon={Package}
          title="Manufacturing Reliability"
          description="Can we assess the reliability of a product's manufacturing process by randomly selecting a sample?"
          details={manufacturingDetails}
          isSelected={selectedExample === 'manufacturing'}
          onSelect={() => setSelectedExample(selectedExample === 'manufacturing' ? null : 'manufacturing')}
        />
        <ExampleCard
          icon={Vote}
          title="Election Polling"
          description="Can we determine who will win an election by polling a small sample of respondents?"
          details={electionDetails}
          isSelected={selectedExample === 'election'}
          onSelect={() => setSelectedExample(selectedExample === 'election' ? null : 'election')}
        />
      </div>
      
      {/* Mathematical Framework */}
        {selectedExample && (
          <div
            className="bg-neutral-800/50 rounded-lg p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-blue-400">Mathematical Framework</h4>
              <span className="text-xs text-blue-400">
                {selectedExample === 'manufacturing' ? 'Manufacturing Example' : 'Election Example'}
              </span>
            </div>
            
            {/* Example-specific details */}
            <div className="bg-neutral-900/30 rounded-lg p-3 space-y-2">
              <p className="text-sm text-neutral-300">
                <span className="text-neutral-400">Research Question:</span> 
                <span className="ml-2">
                  {selectedExample === 'manufacturing' 
                    ? manufacturingDetails.question 
                    : electionDetails.question}
                </span>
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-400">Parameter:</span>
                  <span className="ml-2 text-neutral-200">
                    {selectedExample === 'manufacturing' 
                      ? manufacturingDetails.parameter 
                      : electionDetails.parameter}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400">Sample Size:</span>
                  <span className="ml-2 text-neutral-200">
                    {selectedExample === 'manufacturing' 
                      ? manufacturingDetails.sample 
                      : electionDetails.sample}
                  </span>
                </div>
              </div>
            </div>
            
            {/* General framework */}
            <div className="grid md:grid-cols-3 gap-3">
              <div className="text-center p-3 bg-neutral-900/50 rounded">
                <p className="text-xs text-neutral-400 mb-1">Population Parameter</p>
                <span className="text-lg" dangerouslySetInnerHTML={{ 
                  __html: selectedExample === 'manufacturing' 
                    ? '\\(\\mu\\)' 
                    : '\\(p\\)' 
                }} />
                <p className="text-xs mt-1">Unknown true value</p>
              </div>
              <div className="text-center p-3 bg-neutral-900/50 rounded">
                <p className="text-xs text-neutral-400 mb-1">Point Estimate</p>
                <span className="text-lg" dangerouslySetInnerHTML={{ 
                  __html: selectedExample === 'manufacturing' 
                    ? '\\(\\bar{X}\\)' 
                    : '\\(\\hat{p}\\)' 
                }} />
                <p className="text-xs mt-1">Sample statistic</p>
              </div>
              <div className="text-center p-3 bg-neutral-900/50 rounded">
                <p className="text-xs text-neutral-400 mb-1">Standard Error</p>
                <span className="text-lg" dangerouslySetInnerHTML={{ 
                  __html: selectedExample === 'manufacturing' 
                    ? '\\(SE(\\bar{X})\\)' 
                    : '\\(SE(\\hat{p})\\)' 
                }} />
                <p className="text-xs mt-1">Uncertainty measure</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-neutral-400">
                Statistical inference allows us to make probabilistic statements about the 
                {selectedExample === 'manufacturing' ? ' true mean defect rate' : ' true proportion'} 
                based on our sample data.
              </p>
            </div>
          </div>
        )}
    </div>
  );
});

// Mathematical Foundations Component
const MathematicalFoundations = React.memo(function MathematicalFoundations() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5" />
        Mathematical Foundations
      </h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Point Estimation */}
        <div>
          <h4 className="text-lg font-semibold text-blue-400 mb-3">Point Estimation</h4>
          <div className="space-y-4">
            <div className="bg-neutral-900/50 rounded-lg p-4">
              <h5 className="font-semibold text-blue-400 mb-2">Definition</h5>
              <p className="text-sm text-neutral-300 mb-3">
                A point estimate <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{\\theta}\\)` }} /> 
                is a single value used to estimate an unknown population parameter 
                <span dangerouslySetInnerHTML={{ __html: ` \\(\\theta\\)` }} />.
              </p>
              <div className="text-center p-3 bg-neutral-800 rounded">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\hat{\\theta} = g(X_1, X_2, ..., X_n)\\]` 
                }} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700/50">
                <p className="text-sm font-semibold text-blue-400 mb-1">Population Mean</p>
                <span dangerouslySetInnerHTML={{ __html: `\\(\\mu = E[X]\\)` }} />
              </div>
              <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-700/50">
                <p className="text-sm font-semibold text-purple-400 mb-1">Sample Mean</p>
                <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{X} = \\frac{1}{n}\\sum_{i=1}^{n} X_i\\)` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Sampling Distribution */}
        <div>
          <h4 className="text-lg font-semibold text-blue-400 mb-3">Sampling Distribution</h4>
          <div className="space-y-4">
            <div className="bg-neutral-900/50 rounded-lg p-4">
              <h5 className="font-semibold text-blue-400 mb-2">Definition</h5>
              <p className="text-sm text-neutral-300 mb-3">
                The sampling distribution is the probability distribution of a statistic 
                over all possible samples of size n from the population.
              </p>
              <div className="text-center p-3 bg-neutral-800 rounded">
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\bar{X} \\sim N\\left(\\mu, \\frac{\\sigma^2}{n}\\right)\\]` 
                }} />
              </div>
            </div>
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
              <p className="text-sm font-semibold text-blue-400 mb-2">Key Properties:</p>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• <span dangerouslySetInnerHTML={{ __html: `\\(E[\\bar{X}] = \\mu\\)` }} /> (unbiased)</li>
                <li>• <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(\\bar{X}) = \\frac{\\sigma^2}{n}\\)` }} /></li>
                <li>• As n increases, variance decreases</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Standard Error */}
        <div>
          <h4 className="text-lg font-semibold text-purple-400 mb-3">Standard Error</h4>
          <div className="space-y-4">
            <div className="bg-neutral-900/50 rounded-lg p-4">
              <h5 className="font-semibold text-purple-400 mb-2">Definition</h5>
              <p className="text-sm text-neutral-300 mb-3">
                The standard error (SE) is the standard deviation of the sampling distribution 
                of a statistic.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="text-center p-3 bg-neutral-800 rounded">
                  <p className="text-xs text-neutral-400 mb-1">σ known</p>
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[SE(\\bar{X}) = \\frac{\\sigma}{\\sqrt{n}}\\]` 
                  }} />
                </div>
                <div className="text-center p-3 bg-neutral-800 rounded">
                  <p className="text-xs text-neutral-400 mb-1">σ unknown</p>
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[SE(\\bar{X}) = \\frac{S}{\\sqrt{n}}\\]` 
                  }} />
                </div>
              </div>
            </div>
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/50">
              <p className="text-sm font-semibold text-purple-400 mb-2">Interpretation:</p>
              <p className="text-sm text-neutral-300">
                SE measures the average distance between the sample statistic and the 
                population parameter across all possible samples.
              </p>
            </div>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Interactive Insights Cards
const InteractiveInsights = React.memo(() => {
  const insights = [
    {
      id: 'population',
      title: 'Population',
      icon: Users,
      color: 'teal',
      shortDesc: 'The entire group we want to study',
      fullDesc: 'A population includes all members of a defined group. In practice, it\'s often impossible or impractical to study everyone.',
      example: 'All voters in a country, all products from a factory',
      formula: 'Population parameter: θ (theta)'
    },
    {
      id: 'sample',
      title: 'Random Sample',
      icon: Dice6,
      color: 'blue',
      shortDesc: 'A subset selected from the population',
      fullDesc: 'A random sample ensures each member of the population has an equal chance of being selected, reducing bias.',
      example: '1000 randomly selected voters, 50 randomly tested products',
      formula: 'Sample statistic: θ̂ (theta hat)'
    },
    {
      id: 'inference',
      title: 'Inference',
      icon: TrendingUp,
      color: 'purple',
      shortDesc: 'Drawing conclusions about the population',
      fullDesc: 'Statistical inference uses sample data to make probabilistic statements about population parameters.',
      example: 'Estimating election outcome, determining product quality',
      formula: 'P(θ̂ - θ < ε) = confidence level'
    }
  ];
  
  return (
    <div className="grid md:grid-cols-3 gap-4 my-6">
      {insights.map((insight, idx) => (
        <div
          key={insight.id}
          className="relative group"
        >
          <div
            className={`relative bg-neutral-800 rounded-xl p-4 border ${
              insight.color === 'teal' 
                ? 'border-neutral-700 hover:border-blue-500/60' 
                : insight.color === 'blue'
                  ? 'border-neutral-700 hover:border-blue-500/60'
                  : 'border-neutral-700 hover:border-purple-500/60'
            }`}
          >
            <div className={`inline-flex p-2 rounded-lg mb-3 ${
              insight.color === 'teal' 
                ? 'bg-blue-500/20' 
                : insight.color === 'blue'
                  ? 'bg-blue-500/20'
                  : 'bg-purple-500/20'
            }`}>
              <insight.icon className={`w-5 h-5 ${
                insight.color === 'teal' 
                  ? 'text-blue-400' 
                  : insight.color === 'blue'
                    ? 'text-blue-400'
                    : 'text-purple-400'
              }`} />
            </div>
            
            <h4 className={`font-bold mb-2 ${
              insight.color === 'teal' 
                ? 'text-blue-400' 
                : insight.color === 'blue'
                  ? 'text-blue-400'
                  : 'text-purple-400'
            }`}>
              {insight.title}
            </h4>
            
            <div className="space-y-2">
              <p className="text-sm text-neutral-300">{insight.fullDesc}</p>
              <p className="text-xs text-neutral-400 italic">Example: {insight.example}</p>
              <div className="mt-2 p-2 bg-neutral-900/50 rounded text-center">
                <span className={`text-xs font-mono ${
                  insight.color === 'teal' 
                    ? 'text-blue-400' 
                    : insight.color === 'blue'
                      ? 'text-blue-400'
                      : 'text-purple-400'
                }`}>
                  {insight.formula}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

// Gear Wheel Factory Visualization
const GearWheelFactory = React.memo(() => {
  const svgRef = useRef(null);
  const [sampleSize, setSampleSize] = useState(30);
  const [isSampling, setIsSampling] = useState(false);
  const [samples, setSamples] = useState([]);
  const [allSampleMeans, setAllSampleMeans] = useState([]);
  const [currentMean, setCurrentMean] = useState(null);
  
  // True population parameters (hidden from user)
  const TRUE_MU = 50;
  const TRUE_SIGMA = 2;
  
  const performSampling = async () => {
    if (isSampling) return;
    
    setIsSampling(true);
    const newSamples = [];
    
    // Generate samples
    for (let i = 0; i < sampleSize; i++) {
      const value = d3.randomNormal(TRUE_MU, TRUE_SIGMA)();
      newSamples.push(value);
    }
    
    const mean = d3.mean(newSamples);
    setCurrentMean(mean);
    setAllSampleMeans(prev => [...prev, mean]);
    setSamples(newSamples);
    setIsSampling(false);
  };
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 700;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent");
    
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("class", "text-lg font-bold fill-white")
      .text("Gear Wheel Manufacturing Process");
    
    if (allSampleMeans.length > 0) {
      const xScale = d3.scaleLinear()
        .domain([45, 55])
        .range([margin.left, width - margin.right]);
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(d3.histogram()
          .domain(xScale.domain())
          .thresholds(20)(allSampleMeans), d => d.length) || 1])
        .range([height - margin.bottom, margin.top]);
      
      // Draw axes
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 40)
        .attr("fill", "white")
        .style("text-anchor", "middle")
        .text("Sample Mean Weight (grams)");
      
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
      
      // Histogram of sample means
      const bins = d3.histogram()
        .domain(xScale.domain())
        .thresholds(20)(allSampleMeans);
      
      svg.selectAll(".bar")
        .data(bins)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
        .attr("height", d => height - margin.bottom - yScale(d.length))
        .attr("fill", chapterColors.primary)
        .attr("opacity", 0.7);
      
      // True mean line
      svg.append("line")
        .attr("x1", xScale(TRUE_MU))
        .attr("x2", xScale(TRUE_MU))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", chapterColors.chart.secondary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      svg.append("text")
        .attr("x", xScale(TRUE_MU) + 5)
        .attr("y", margin.top + 20)
        .attr("fill", chapterColors.chart.secondary)
        .text("True mean = 50g");
    }
  }, [allSampleMeans]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-blue-400" />
        The Gear Wheel Factory
      </h3>
      <p className="text-sm text-neutral-400 mb-4">
        Explore how sample statistics estimate population parameters
      </p>
      
      <div className="flex justify-between items-start mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <p className="text-xs text-neutral-400">Samples Taken</p>
            <p className="text-2xl font-mono text-blue-400">{allSampleMeans.length}</p>
          </div>
          {currentMean && (
            <>
              <div className="bg-neutral-800/50 rounded-lg p-3">
                <p className="text-xs text-neutral-400">Last Sample Mean</p>
                <p className="text-xl font-mono text-blue-400">{currentMean.toFixed(3)}g</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-3">
                <p className="text-xs text-neutral-400">Error from True <span dangerouslySetInnerHTML={{ __html: '\\(\\mu\\)' }} /></p>
                <p className="text-xl font-mono text-yellow-400">
                  {Math.abs(currentMean - TRUE_MU).toFixed(3)}g
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      <GraphContainer height="400px">
        <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 700 400" />
      </GraphContainer>
      
      <ControlGroup>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Sample Size (n): {sampleSize}
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              className="w-full"
              disabled={isSampling}
            />
            <p className="text-xs text-neutral-500">
              SE ∝ 1/√n (larger samples → smaller error)
            </p>
          </div>
          
          <div className="flex items-center justify-center">
            <button
              onClick={performSampling}
              disabled={isSampling}
              className={`px-6 py-3 rounded-lg font-medium
                         ${isSampling 
                           ? 'bg-neutral-600 cursor-not-allowed' 
                           : 'bg-blue-600 hover:bg-blue-700'
                         } text-white shadow-lg`}
            >
              {isSampling ? 'Sampling...' : 'Draw New Sample'}
            </button>
          </div>
          
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <p className="text-xs text-neutral-400 mb-1">Sampling Distribution</p>
            {allSampleMeans.length > 1 && (
              <>
                <p className="text-sm">
                  Mean of means: <span className="font-mono text-blue-400">
                    {d3.mean(allSampleMeans).toFixed(3)}
                  </span>
                </p>
                <p className="text-sm">
                  SE of means: <span className="font-mono text-purple-400">
                    {d3.deviation(allSampleMeans).toFixed(3)}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
        
        {allSampleMeans.length >= 10 && (
          <div
            className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg"
          >
            <p className="text-sm text-blue-400">
              🎯 Notice how the sample means cluster around the true population mean!
            </p>
          </div>
        )}
      </ControlGroup>
    </VisualizationSection>
  );
});

// Sampling Distribution & Point Estimation Visualization
const SamplingAndEstimation = React.memo(() => {
  const [currentSample, setCurrentSample] = useState([]);
  const [sampleStats, setSampleStats] = useState({ mean: null, median: null, std: null });
  const [allEstimates, setAllEstimates] = useState([]);
  const [showExplanation, setShowExplanation] = useState(true);
  const svgRef = useRef(null);
  const contentRef = useRef(null);
  
  // Population parameters (known)
  const populationMean = 50;
  const populationStd = 10;
  const sampleSize = 25;
  
  // Generate a new sample from the population
  const drawNewSample = () => {
    const newSample = Array.from({ length: sampleSize }, () => 
      d3.randomNormal(populationMean, populationStd)()
    );
    
    const mean = d3.mean(newSample);
    const median = d3.median(newSample);
    const std = d3.deviation(newSample);
    
    setCurrentSample(newSample);
    setSampleStats({ mean, median, std });
    
    // Add to history of estimates
    if (mean !== null) {
      setAllEstimates(prev => [...prev, { mean, median, std }]);
    }
  };
  
  // Visualization of current sample and estimate history
  useEffect(() => {
    if (!svgRef.current || allEstimates.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 700;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    
    // Create two panels - one for current sample, one for sampling distribution
    const panelHeight = (height - margin.top - margin.bottom) / 2 - 10;
    
    // Panel 1: Current Sample Distribution
    if (currentSample.length > 0) {
      const g1 = svg.append("g")
        .attr("transform", `translate(0, ${margin.top})`);
        
      const xScale = d3.scaleLinear()
        .domain([populationMean - 3 * populationStd, populationMean + 3 * populationStd])
        .range([margin.left, width - margin.right]);
        
      const bins = d3.histogram()
        .domain(xScale.domain())
        .thresholds(15)(currentSample);
        
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([panelHeight, 0]);
        
      // Draw histogram
      g1.selectAll(".bar")
        .data(bins)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length))
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("height", d => panelHeight - yScale(d.length))
        .attr("fill", chapterColors.primary)
        .attr("opacity", 0.7);
        
      // Add sample mean line
      g1.append("line")
        .attr("x1", xScale(sampleStats.mean))
        .attr("x2", xScale(sampleStats.mean))
        .attr("y1", 0)
        .attr("y2", panelHeight)
        .attr("stroke", chapterColors.chart.secondary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,2");
        
      // Add population mean line for reference
      g1.append("line")
        .attr("x1", xScale(populationMean))
        .attr("x2", xScale(populationMean))
        .attr("y1", 0)
        .attr("y2", panelHeight)
        .attr("stroke", chapterColors.chart.primary)
        .attr("stroke-width", 2);
        
      // Labels
      g1.append("text")
        .attr("x", xScale(sampleStats.mean))
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", chapterColors.chart.secondary)
        .attr("font-size", "12px")
        .text(`x̄ = ${sampleStats.mean.toFixed(2)}`);
        
      g1.append("text")
        .attr("x", xScale(populationMean))
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", chapterColors.chart.primary)
        .attr("font-size", "12px")
        .text(`μ = ${populationMean}`);
        
      // X axis
      g1.append("g")
        .attr("transform", `translate(0,${panelHeight})`)
        .call(d3.axisBottom(xScale));
    }
    
    // Panel 2: Sampling Distribution of Sample Means
    if (allEstimates.length > 1) {
      const g2 = svg.append("g")
        .attr("transform", `translate(0, ${margin.top + panelHeight + 20})`);
        
      const means = allEstimates.map(d => d.mean);
      const theoreticalSE = populationStd / Math.sqrt(sampleSize);
      
      const xScale2 = d3.scaleLinear()
        .domain([populationMean - 3 * theoreticalSE, populationMean + 3 * theoreticalSE])
        .range([margin.left, width - margin.right]);
        
      const bins2 = d3.histogram()
        .domain(xScale2.domain())
        .thresholds(20)(means);
        
      const yScale2 = d3.scaleLinear()
        .domain([0, d3.max(bins2, d => d.length)])
        .range([panelHeight, 0]);
        
      // Draw histogram of sample means
      g2.selectAll(".bar")
        .data(bins2)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xScale2(d.x0))
        .attr("y", d => yScale2(d.length))
        .attr("width", d => Math.max(0, xScale2(d.x1) - xScale2(d.x0) - 1))
        .attr("height", d => panelHeight - yScale2(d.length))
        .attr("fill", chapterColors.secondary)
        .attr("opacity", 0.7);
        
      // Add theoretical center line
      g2.append("line")
        .attr("x1", xScale2(populationMean))
        .attr("x2", xScale2(populationMean))
        .attr("y1", 0)
        .attr("y2", panelHeight)
        .attr("stroke", chapterColors.chart.primary)
        .attr("stroke-width", 2);
        
      // Add current estimate
      if (sampleStats.mean !== null) {
        g2.append("circle")
          .attr("cx", xScale2(sampleStats.mean))
          .attr("cy", panelHeight / 2)
          .attr("r", 4)
          .attr("fill", chapterColors.chart.secondary);
      }
        
      // X axis
      g2.append("g")
        .attr("transform", `translate(0,${panelHeight})`)
        .call(d3.axisBottom(xScale2));
        
      // Title
      g2.append("text")
        .attr("x", width / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "white")
        .text(`Sampling Distribution of x̄ (n = ${allEstimates.length} samples)`);
    }
  }, [currentSample, sampleStats, allEstimates]);
  
  useEffect(() => {
    // Generate initial sample
    drawNewSample();
  }, []);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-400" />
        Sampling Distribution & Point Estimation
      </h3>
      
      {showExplanation && (
        <div className="bg-neutral-800/50 rounded-lg p-4 mb-4 border border-neutral-700">
          <h4 className="font-semibold text-white mb-2">Understanding Point Estimation</h4>
          <p className="text-sm text-neutral-300 mb-3">
            When we take a sample from a population, we calculate statistics (like the sample mean) 
            to estimate unknown population parameters. Each sample gives us a different estimate.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="bg-neutral-900/50 rounded p-3">
              <p className="text-xs text-neutral-400 mb-1">Population (usually unknown)</p>
              <p className="text-sm">μ = {populationMean}, σ = {populationStd}</p>
            </div>
            <div className="bg-neutral-900/50 rounded p-3">
              <p className="text-xs text-neutral-400 mb-1">What we're exploring</p>
              <p className="text-sm">How sample estimates vary</p>
            </div>
          </div>
          <button
            onClick={() => setShowExplanation(false)}
            className="text-xs text-neutral-400 hover:text-neutral-300"
          >
            Hide explanation
          </button>
        </div>
      )}
      
      <div ref={contentRef}>
        <GraphContainer title="Visualizing Sampling & Estimation">
          <svg ref={svgRef} width="100%" height="400" viewBox="0 0 700 400" />
        </GraphContainer>
        
        {/* Current Sample Statistics */}
        {sampleStats.mean !== null && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700/50">
              <p className="text-xs text-blue-400 mb-1">Sample Mean (x̄)</p>
              <p className="text-xl font-mono">{sampleStats.mean.toFixed(3)}</p>
              <p className="text-xs text-neutral-400 mt-1">
                Error: {(sampleStats.mean - populationMean).toFixed(3)}
              </p>
            </div>
            <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-700/50">
              <p className="text-xs text-purple-400 mb-1">Sample Median</p>
              <p className="text-xl font-mono">{sampleStats.median.toFixed(3)}</p>
            </div>
            <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700/50">
              <p className="text-xs text-blue-400 mb-1">Sample Std Dev (s)</p>
              <p className="text-xl font-mono">{sampleStats.std.toFixed(3)}</p>
            </div>
          </div>
        )}
        
        {/* Summary Statistics */}
        {allEstimates.length > 1 && (
          <div className="bg-neutral-800/50 rounded-lg p-4 mt-4">
            <h4 className="font-semibold mb-2">Sampling Distribution Properties</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-400">Mean of sample means:</p>
                <p className="font-mono">
                  {d3.mean(allEstimates.map(d => d.mean)).toFixed(3)}
                  <span className="text-xs text-neutral-400 ml-2">
                    (should approach μ = {populationMean})
                  </span>
                </p>
              </div>
              <div>
                <p className="text-neutral-400">SE of sample means:</p>
                <p className="font-mono">
                  {d3.deviation(allEstimates.map(d => d.mean)).toFixed(3)}
                  <span className="text-xs text-neutral-400 ml-2">
                    (theoretical: {(populationStd / Math.sqrt(sampleSize)).toFixed(3)})
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
        
        <ControlGroup>
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={drawNewSample}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Draw New Sample
              </button>
              <p className="text-xs text-neutral-400 mt-1">
                Samples drawn: {allEstimates.length}
              </p>
            </div>
            
            {allEstimates.length > 1 && (
              <button
                onClick={() => {
                  setAllEstimates([]);
                  setCurrentSample([]);
                  setSampleStats({ mean: null, median: null, std: null });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Reset All
              </button>
            )}
          </div>
        </ControlGroup>
      </div>
    </VisualizationSection>
  );
});

// Baseball Heights Example
const BaseballHeights = React.memo(function BaseballHeights() {
  const contentRef = useRef(null);
  const [showCalculation, setShowCalculation] = useState(true);
  
  // Exact data from course
  const heights = [74,74,72,72,73,69,69,71,76,71,73,73,74,74,69,70,72,73,75,78];
  const n = 20;
  const xBar = 72.6;
  const s2 = 5.6211;
  const s = Math.sqrt(s2);
  const se = s / Math.sqrt(n);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [showCalculation]);
  
  const StatCard = ({ label, value, formula, color }) => {
    const bgClass = color === 'blue' ? 'bg-blue-900/20' : color === 'purple' ? 'bg-purple-900/20' : 'bg-blue-900/20';
    const borderClass = color === 'blue' ? 'border-blue-700/50' : color === 'purple' ? 'border-purple-700/50' : 'border-blue-700/50';
    const textClass = color === 'blue' ? 'text-blue-400' : color === 'purple' ? 'text-purple-400' : 'text-blue-400';
    
    return (
      <div className={`${bgClass} rounded-lg p-4 border ${borderClass}`}>
        <h5 className={`font-semibold ${textClass} mb-1`}>{label}</h5>
        <p className="text-2xl font-mono mb-2">{value}</p>
        <div className="text-xs text-neutral-400">
          <span dangerouslySetInnerHTML={{ __html: formula }} />
        </div>
      </div>
    );
  };
  
  return (
    <VisualizationSection>
      <div ref={contentRef} className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart className="w-5 h-5 text-blue-400" />
          Example: Baseball Player Heights
        </h3>
        
        <div className="bg-neutral-800 rounded-lg p-4">
          <p className="text-sm text-neutral-300 mb-3">
            Heights (in inches) of 20 randomly selected baseball players:
          </p>
          <div className="flex flex-wrap gap-2">
            {heights.map((h, i) => (
              <span key={i} className="px-2 py-1 bg-neutral-700 rounded font-mono text-sm">
                {h}
              </span>
            ))}
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard
            label="Sample Mean"
            value={`${xBar}"`}
            formula={`\\bar{X} = \\frac{1}{n}\\sum X_i`}
            color="blue"
          />
          <StatCard
            label="Sample Variance"
            value={s2.toFixed(4)}
            formula={`S^2 = \\frac{1}{n-1}\\sum(X_i - \\bar{X})^2`}
            color="purple"
          />
          <StatCard
            label="Standard Error"
            value={se.toFixed(4)}
            formula={`SE(\\bar{X}) = \\frac{S}{\\sqrt{n}}`}
            color="teal"
          />
        </div>
        
        <div
          className="bg-blue-900/20 rounded-lg p-4"
        >
          <button
            onClick={() => setShowCalculation(!showCalculation)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <ChevronRight className={`w-4 h-4 transform ${
              showCalculation ? 'rotate-90' : ''
            }`} />
            Show Calculation Steps
          </button>
          
            {showCalculation && (
              <div
                className="mt-4 space-y-2 text-sm"
              >
                <div className="pl-6">
                  <p>1. Calculate mean: <span dangerouslySetInnerHTML={{ 
                    __html: '\\(\\bar{X} = \\frac{1452}{20} = 72.6\\)' 
                  }} /></p>
                  <p>2. Calculate variance: <span dangerouslySetInnerHTML={{ 
                    __html: '\\(S^2 = \\frac{106.8}{19} = 5.6211\\)' 
                  }} /></p>
                  <p>3. Calculate SE: <span dangerouslySetInnerHTML={{ 
                    __html: '\\(SE = \\frac{\\sqrt{5.6211}}{\\sqrt{20}} = 0.5301\\)' 
                  }} /></p>
                </div>
              </div>
            )}
        </div>
      </div>
    </VisualizationSection>
  );
});

// Decision Tree Helper Component
const DecisionTreeHelper = React.memo(function DecisionTreeHelper({ onSelect }) {
  const [currentStep, setCurrentStep] = useState('start');
  
  const steps = {
    start: {
      question: "What are you trying to find?",
      options: [
        { id: 'ci', label: 'Confidence Interval for μ', next: 'sigma-known' },
        { id: 'n', label: 'Sample Size needed', next: 'sample-size' },
        { id: 'prop', label: 'Confidence Interval for proportion', next: 'proportion' }
      ]
    },
    'sigma-known': {
      question: "Is the population standard deviation (σ) known?",
      options: [
        { id: 'yes', label: 'Yes, σ is given', formula: 'ci-known-sigma' },
        { id: 'no', label: 'No, only sample s is given', formula: 'ci-unknown-sigma' }
      ]
    },
    'sample-size': {
      question: "Sample size calculation selected",
      formula: 'sample-size'
    },
    'proportion': {
      question: "Proportion calculation selected",
      formula: 'proportion'
    }
  };
  
  const handleOptionClick = (option) => {
    if (option.formula) {
      onSelect(option.formula);
      setCurrentStep('start');
    } else if (option.next) {
      setCurrentStep(option.next);
    }
  };
  
  return (
    <div className="bg-neutral-900/50 rounded-lg p-4 mb-4 border border-neutral-700/50">
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-blue-400">Formula Helper</h5>
        {currentStep !== 'start' && (
          <button
            onClick={() => setCurrentStep('start')}
            className="text-sm text-neutral-400 hover:text-neutral-300"
          >
            ← Start Over
          </button>
        )}
      </div>
      <p className="text-sm text-neutral-300 mb-3">{steps[currentStep].question}</p>
      {steps[currentStep].options && (
        <div className="space-y-2">
          {steps[currentStep].options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className="w-full text-left p-3 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg text-sm text-neutral-300 hover:text-white"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// Visual Formula Card Component
const VisualFormulaCard = React.memo(function VisualFormulaCard({ type, values, showSteps = false }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [type, values, showSteps]);
  
  const formulas = {
    'ci-known-sigma': {
      title: 'CI when σ is known',
      color: 'blue',
      bgGradient: 'from-blue-900/20 to-blue-900/20',
      borderColor: 'border-blue-700/50',
      textColor: 'text-blue-400',
      icon: '📊',
      formula: `\\[\\bar{X} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]`,
      steps: [
        { label: 'Find z-value', calc: 'For 95% CI: z = 1.96' },
        { label: 'Calculate SE', calc: `SE = ${values.sigma}/${Math.sqrt(values.n).toFixed(2)} = ${(values.sigma/Math.sqrt(values.n)).toFixed(3)}` },
        { label: 'Find margin', calc: `E = 1.96 × ${(values.sigma/Math.sqrt(values.n)).toFixed(3)} = ${(1.96 * values.sigma/Math.sqrt(values.n)).toFixed(3)}` },
        { label: 'Build CI', calc: `${values.xBar} ± ${(1.96 * values.sigma/Math.sqrt(values.n)).toFixed(3)}` }
      ],
      commonMistakes: ['Forgetting to divide σ by √n', 'Using t instead of z']
    },
    'ci-unknown-sigma': {
      title: 'CI when σ is unknown',
      color: 'purple',
      bgGradient: 'from-purple-900/20 to-purple-800/20',
      borderColor: 'border-purple-700/50',
      textColor: 'text-purple-400',
      icon: '🎯',
      formula: `\\[\\bar{X} \\pm t_{\\alpha/2,n-1} \\cdot \\frac{S}{\\sqrt{n}}\\]`,
      steps: [
        { label: 'Find df', calc: `df = n - 1 = ${values.n - 1}` },
        { label: 'Find t-value', calc: 'Look up in t-table' },
        { label: 'Calculate SE', calc: `SE = ${values.s}/${Math.sqrt(values.n).toFixed(2)} = ${(values.s/Math.sqrt(values.n)).toFixed(3)}` },
        { label: 'Build CI', calc: 'Apply formula with t-value' }
      ],
      commonMistakes: ['Using z instead of t', 'Wrong degrees of freedom']
    }
  };
  
  const current = formulas[type];
  if (!current) return null;
  
  return (
    <div ref={contentRef} className={`bg-gradient-to-br ${current.bgGradient} rounded-lg p-4 border ${current.borderColor}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{current.icon}</span>
        <h5 className={`font-semibold ${current.textColor}`}>{current.title}</h5>
      </div>
      
      <div className="bg-neutral-900/50 rounded p-3 mb-3 text-center">
        <span dangerouslySetInnerHTML={{ __html: current.formula }} />
      </div>
      
      {showSteps && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-300 mb-2">Step-by-Step:</p>
          {current.steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-sm"
            >
              <span className="text-blue-400 font-mono">{idx + 1}.</span>
              <div className="flex-1">
                <span className="text-neutral-300">{step.label}:</span>
                <span className="ml-2 font-mono text-neutral-400">{step.calc}</span>
              </div>
            </div>
          ))}
          
          <div 
            className="mt-3 p-2 bg-gradient-to-br from-red-900/20 to-red-800/20 rounded border border-red-700/50"
          >
            <p className="text-xs font-medium text-red-400 mb-1">⚠️ Common Mistakes:</p>
            <ul className="text-xs text-neutral-300">
              {current.commonMistakes.map((mistake, idx) => (
                <li key={idx}>• {mistake}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});

// Interactive Calculator Component
const InteractiveCalculator = () => {
  const contentRef = useRef(null);
  const [mode, setMode] = useState(null);
  const [values, setValues] = useState({
    n: 30,
    xBar: 100,
    sigma: 15,
    s: 14.5,
    confidenceLevel: 0.95
  });
  const [showSteps, setShowSteps] = useState(true);
  const [showDecisionTree, setShowDecisionTree] = useState(true);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [mode, values, showSteps]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5" />
        Interactive Formula Calculator
      </h3>
      
      <div ref={contentRef}>
        {showDecisionTree && (
            <div
              className="bg-gradient-to-br from-blue-900/20 to-blue-900/20 rounded-lg p-4 mb-4 border border-blue-700/50"
            >
              <p className="text-sm text-blue-400 mb-2">
                🎯 Use the decision tree below to find the right formula for your problem!
              </p>
              <DecisionTreeHelper onSelect={setMode} />
            </div>
        )}
        
        {/* Input Controls */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sample Size (n)</label>
            <input
              type="number"
              value={values.n}
              onChange={(e) => setValues({...values, n: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-neutral-800 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sample Mean (x̄)</label>
            <input
              type="number"
              value={values.xBar}
              onChange={(e) => setValues({...values, xBar: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-neutral-800 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Pop. Std Dev (σ)</label>
            <input
              type="number"
              value={values.sigma}
              onChange={(e) => setValues({...values, sigma: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-neutral-800 rounded-lg text-white"
              placeholder="If known"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sample Std Dev (s)</label>
            <input
              type="number"
              value={values.s}
              onChange={(e) => setValues({...values, s: Number(e.target.value)})}
              className="w-full px-3 py-2 bg-neutral-800 rounded-lg text-white"
              placeholder="If σ unknown"
            />
          </div>
        </div>
        
        {/* Formula Selection */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('ci-known-sigma')}
            className={`px-4 py-2 rounded-lg ${
              mode === 'ci-known-sigma'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            CI (σ known)
          </button>
          <button
            onClick={() => setMode('ci-unknown-sigma')}
            className={`px-4 py-2 rounded-lg ${
              mode === 'ci-unknown-sigma'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            CI (σ unknown)
          </button>
        </div>
        
        {/* Formula Display */}
        {mode && (
          <div
            className="space-y-4"
          >
            <VisualFormulaCard type={mode} values={values} showSteps={showSteps} />
            
            {/* Toggle Steps */}
            <div 
              className="bg-neutral-800/50 rounded-lg p-3 flex items-center justify-between"
            >
              <label className="text-sm text-neutral-300">Show calculation steps</label>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className={`w-12 h-6 rounded-full p-1 ${
                  showSteps ? 'bg-blue-600' : 'bg-neutral-600'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transform ${
                  showSteps ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        )}
      </div>
    </VisualizationSection>
  );
};

// Field-Specific Examples Component
const FieldSpecificExamples = React.memo(function FieldSpecificExamples() {
  const [selectedField, setSelectedField] = useState('engineering');
  
  const fields = {
    engineering: {
      title: 'Engineering Applications',
      icon: '⚙️',
      examples: [
        {
          scenario: 'Quality Control',
          question: 'Are manufactured parts within tolerance?',
          approach: 'Sample measurements → CI for mean dimension'
        },
        {
          scenario: 'Reliability Testing',
          question: 'What is the failure rate?',
          approach: 'Test sample → CI for failure proportion'
        }
      ]
    },
    medical: {
      title: 'Medical Research',
      icon: '🏥',
      examples: [
        {
          scenario: 'Drug Efficacy',
          question: 'Does the treatment work?',
          approach: 'Clinical trial → CI for effect size'
        },
        {
          scenario: 'Disease Prevalence',
          question: 'What percentage have the condition?',
          approach: 'Random screening → CI for proportion'
        }
      ]
    },
    business: {
      title: 'Business Analytics',
      icon: '📊',
      examples: [
        {
          scenario: 'Customer Satisfaction',
          question: 'How satisfied are customers?',
          approach: 'Survey sample → CI for mean rating'
        },
        {
          scenario: 'Market Share',
          question: 'What is our market penetration?',
          approach: 'Sales data → CI for proportion'
        }
      ]
    }
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4">Real-World Applications</h3>
      
      <div className="flex gap-2 mb-4">
        {Object.entries(fields).map(([key, field]) => (
          <button
            key={key}
            onClick={() => setSelectedField(key)}
            className={`p-3 rounded-lg ${
              selectedField === key
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            <span className="text-2xl mr-2">{field.icon}</span>
            {field.title}
          </button>
        ))}
      </div>
      
      <div 
        className="grid gap-4"
      >
        {fields[selectedField].examples.map((example, idx) => (
          <div
            key={idx}
            className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50"
          >
            <h4 className="font-semibold text-blue-400 mb-2">{example.scenario}</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-400">Research Question:</p>
                <p className="text-neutral-200">{example.question}</p>
              </div>
              <div>
                <p className="text-neutral-400">Statistical Approach:</p>
                <p className="text-neutral-200">{example.approach}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </VisualizationSection>
  );
});

// Concept Connections Component
const ConceptConnections = () => {
  const connections = [
    {
      from: 'Sampling Distribution',
      to: 'Standard Error',
      relationship: 'SE is the standard deviation of the sampling distribution'
    },
    {
      from: 'Standard Error',
      to: 'Confidence Intervals',
      relationship: 'CI width is determined by SE × critical value'
    },
    {
      from: 'Sample Size',
      to: 'Standard Error',
      relationship: 'SE decreases as √n increases'
    }
  ];
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4">Concept Connections</h3>
      
      <div className="space-y-4">
        {connections.map((conn, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4"
          >
            <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-700/50 flex-1 text-center">
              <p className="text-sm font-semibold text-blue-400">{conn.from}</p>
            </div>
            <div className="text-2xl text-neutral-400">→</div>
            <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-700/50 flex-1 text-center">
              <p className="text-sm font-semibold text-purple-400">{conn.to}</p>
            </div>
          </div>
        ))}
        
        <div className="bg-neutral-800/50 rounded-lg p-4 mt-4">
          <p className="text-sm text-neutral-300">
            These connections form the foundation of statistical inference, 
            allowing us to quantify uncertainty and make data-driven decisions.
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
};

// Practice Problems Component
const PracticeProblems = React.memo(function PracticeProblems() {
  const [selectedProblem, setSelectedProblem] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedProblem, showSolution]);
  
  const problems = [
    {
      title: "Manufacturing Quality",
      difficulty: "Medium",
      problem: "A factory produces bolts with a target diameter of 10mm. A sample of 25 bolts has mean diameter 10.2mm and standard deviation 0.5mm. Calculate a 95% CI for the true mean diameter.",
      hints: [
        "σ is unknown, so use t-distribution",
        "df = n - 1 = 24",
        "For 95% CI with df=24, t ≈ 2.064"
      ],
      solution: {
        steps: [
          { text: "Identify: n = 25, x̄ = 10.2, s = 0.5", math: null },
          { text: "Calculate SE:", math: "SE = \\frac{s}{\\sqrt{n}} = \\frac{0.5}{\\sqrt{25}} = 0.1" },
          { text: "Find t-value: df = 24, α = 0.05, t = 2.064", math: null },
          { text: "Calculate CI:", math: "10.2 \\pm 2.064 \\times 0.1 = 10.2 \\pm 0.206" },
          { text: "Result: [9.994, 10.406]", math: null }
        ],
        interpretation: "We are 95% confident the true mean diameter is between 9.994mm and 10.406mm. The bolts may be slightly oversized."
      }
    },
    {
      title: "Election Polling",
      difficulty: "Easy",
      problem: "A poll of 1000 voters shows 520 support candidate A. Calculate a 95% CI for the true proportion of support.",
      hints: [
        "This is a proportion problem",
        "p̂ = 520/1000 = 0.52",
        "Use z-distribution for large samples"
      ],
      solution: {
        steps: [
          { text: "Calculate sample proportion:", math: "\\hat{p} = \\frac{520}{1000} = 0.52" },
          { text: "Calculate SE:", math: "SE = \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}} = \\sqrt{\\frac{0.52 \\times 0.48}{1000}} = 0.0158" },
          { text: "For 95% CI, z = 1.96", math: null },
          { text: "Calculate CI:", math: "0.52 \\pm 1.96 \\times 0.0158 = 0.52 \\pm 0.031" },
          { text: "Result: [0.489, 0.551]", math: null }
        ],
        interpretation: "We are 95% confident that between 48.9% and 55.1% of voters support candidate A."
      }
    }
  ];
  
  const currentProblem = problems[selectedProblem];
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4">Practice Problems</h3>
      
      <div className="flex gap-2 mb-4">
        {problems.map((prob, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedProblem(idx);
              setShowSolution(false);
            }}
            className={`px-4 py-2 rounded-lg ${
              selectedProblem === idx
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Problem {idx + 1}
          </button>
        ))}
      </div>
      
      <div ref={contentRef} className="space-y-4">
        {/* Problem Statement */}
        <div className="bg-neutral-800 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-blue-400">{currentProblem.title}</h4>
            <span className={`px-2 py-1 rounded text-xs ${
              currentProblem.difficulty === 'Easy' 
                ? 'bg-green-900/50 text-green-400'
                : 'bg-yellow-900/50 text-yellow-400'
            }`}>
              {currentProblem.difficulty}
            </span>
          </div>
          <p className="text-neutral-300">{currentProblem.problem}</p>
        </div>
        
        {/* Hints */}
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
          <h5 className="font-semibold text-blue-400 mb-2">Hints:</h5>
          <ul className="text-sm text-neutral-300 space-y-1">
            {currentProblem.hints.map((hint, idx) => (
              <li key={idx}>• {hint}</li>
            ))}
          </ul>
        </div>
        
        {/* Solution Toggle */}
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="w-full p-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white"
        >
          {showSolution ? 'Hide Solution' : 'Show Solution'}
        </button>
        
        {/* Solution */}
          {showSolution && (
            <div
              className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50 space-y-3"
            >
              <h5 className="font-semibold text-blue-400">Step-by-Step Solution:</h5>
              {currentProblem.solution.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2"
                >
                  <span className="text-blue-400 font-mono">{idx + 1}.</span>
                  <div>
                    <p className="text-sm text-neutral-300">{step.text}</p>
                    {step.math && (
                      <div className="mt-1 p-2 bg-neutral-800 rounded">
                        <span dangerouslySetInnerHTML={{ __html: `\\[${step.math}\\]` }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-neutral-800/50 rounded">
                <p className="text-sm font-semibold text-blue-400 mb-1">Interpretation:</p>
                <p className="text-sm text-neutral-300">{currentProblem.solution.interpretation}</p>
              </div>
            </div>
          )}
      </div>
    </VisualizationSection>
  );
});

// Exam Preparation Component
const ExamPreparation = React.memo(function ExamPreparation() {
  const [expandedSection, setExpandedSection] = useState(null);
  
  const examTopics = [
    {
      id: 'concepts',
      title: 'Key Concepts to Master',
      items: [
        'Difference between population parameter and sample statistic',
        'Sampling distribution and its properties',
        'Standard error calculation and interpretation',
        'Central Limit Theorem applications'
      ]
    },
    {
      id: 'formulas',
      title: 'Essential Formulas',
      items: [
        'Standard Error: SE = σ/√n or s/√n',
        'CI (σ known): x̄ ± z·σ/√n',
        'CI (σ unknown): x̄ ± t·s/√n',
        'Sample size: n = (z·σ/E)²'
      ]
    },
    {
      id: 'mistakes',
      title: 'Common Mistakes to Avoid',
      items: [
        'Using z when σ is unknown (use t instead)',
        'Forgetting to divide by √n for SE',
        'Wrong degrees of freedom for t-distribution',
        'Misinterpreting confidence level'
      ]
    }
  ];
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4">Exam Preparation Guide</h3>
      
      <div className="space-y-3">
        {examTopics.map((topic) => (
          <div
            key={topic.id}
            className="bg-neutral-800 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedSection(
                expandedSection === topic.id ? null : topic.id
              )}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-neutral-700"
            >
              <h4 className="font-semibold text-blue-400">{topic.title}</h4>
              <ChevronRight className={`w-5 h-5 text-neutral-400 transform ${
                expandedSection === topic.id ? 'rotate-90' : ''
              }`} />
            </button>
            
              {expandedSection === topic.id && (
                <div
                  className="px-4 pb-4"
                >
                  <ul className="space-y-2">
                    {topic.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span className="text-sm text-neutral-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        ))}
      </div>
      
      {/* Quick Reference Card */}
      <div className="mt-6 bg-gradient-to-br from-blue-900/20 to-blue-900/20 rounded-lg p-4 border border-blue-700/50">
        <h5 className="font-semibold text-blue-400 mb-3">Quick Decision Guide</h5>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-neutral-400 mb-1">If σ is known:</p>
            <p className="text-neutral-200">→ Use z-distribution</p>
          </div>
          <div>
            <p className="text-neutral-400 mb-1">If σ is unknown:</p>
            <p className="text-neutral-200">→ Use t-distribution with df = n-1</p>
          </div>
          <div>
            <p className="text-neutral-400 mb-1">For proportions:</p>
            <p className="text-neutral-200">→ SE = √[p̂(1-p̂)/n]</p>
          </div>
          <div>
            <p className="text-neutral-400 mb-1">For means:</p>
            <p className="text-neutral-200">→ SE = σ/√n or s/√n</p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Key Takeaways Component
const KeyTakeaways = () => {
  const takeaways = [
    {
      icon: '🎯',
      title: 'Core Principle',
      content: 'Statistical inference allows us to make probabilistic statements about populations based on sample data.'
    },
    {
      icon: '📊',
      title: 'Sampling Distribution',
      content: 'The distribution of sample statistics follows predictable patterns, enabling confidence intervals and hypothesis tests.'
    },
    {
      icon: '📏',
      title: 'Standard Error',
      content: 'SE quantifies the variability of sample statistics and decreases with larger sample sizes (√n relationship).'
    },
    {
      icon: '🔄',
      title: 'Central Limit Theorem',
      content: 'Sample means approach normality for large n, regardless of the population distribution shape.'
    }
  ];
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-blue-400 mb-4">Key Takeaways</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {takeaways.map((takeaway, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-neutral-800/50 to-neutral-700/50 rounded-lg p-4 border border-neutral-600/50"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{takeaway.icon}</span>
              <div>
                <h4 className="font-semibold text-blue-400 mb-1">{takeaway.title}</h4>
                <p className="text-sm text-neutral-300">{takeaway.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div 
        className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30"
      >
        <p className="text-sm text-blue-400 text-center">
          🎓 Remember: The goal is not just to calculate, but to understand what the results mean for decision-making!
        </p>
      </div>
    </VisualizationSection>
  );
};

// Main Component - Simplified
export default function StatisticalInference() {
  return (
    <VisualizationContainer
      title="5.1 Statistical Inference"
      description="From Data to Decisions"
    >
      <BackToHub chapter={5} />
      
      {/* All content in single scrollable view */}
      <div className="space-y-8">
        {/* Introduction */}
        <div>
          <StatisticalInferenceIntroduction />
          <InteractiveInsights />
        </div>
        
        {/* Mathematical Foundations */}
        <div>
          <MathematicalFoundations />
        </div>
        
        {/* Exploration */}
        <div>
          <GearWheelFactory />
        </div>
        
        {/* Discovery */}
        <div>
          <SamplingAndEstimation />
          <BaseballHeights />
        </div>
        
        {/* Practice Problems */}
        <div>
          <PracticeProblems />
        </div>
        
        {/* Application */}
        <div>
          <InteractiveCalculator />
          <FieldSpecificExamples />
          <ConceptConnections />
        </div>
        
        {/* Exam Preparation */}
        <div>
          <ExamPreparation />
        </div>
        
        {/* Key Takeaways */}
        <div>
          <KeyTakeaways />
        </div>
        
        {/* Section Complete - Standardized Component */}
        <SectionComplete chapter={5} />
      </div>
    </VisualizationContainer>
  );
}