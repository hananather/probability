"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { motion, AnimatePresence } from "framer-motion";
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

// Get Chapter 5 color scheme
const chapterColors = createColorScheme('estimation');

// Introduction Component
const StatisticalInferenceIntroduction = React.memo(function StatisticalInferenceIntroduction() {
  const contentRef = useRef(null);
  const [selectedExample, setSelectedExample] = useState(null);
  
  // Example details from course material
  const manufacturingDetails = {
    parameter: 'Mean defect rate',
    notation: 'μ',
    sample: 'n = 100 products',
    estimate: 'x̄ = sample mean',
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
    <motion.div
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? 'bg-emerald-900/30 border-emerald-500/50 shadow-lg shadow-emerald-500/20' 
          : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
      }`}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${isSelected ? 'text-emerald-400' : 'text-neutral-400'}`} />
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">{title}</h4>
          <p className="text-sm text-neutral-300">{description}</p>
          {!isSelected && (
            <p className="text-xs text-neutral-500 mt-2 italic">Click to explore →</p>
          )}
        </div>
      </div>
    </motion.div>
  );
  
  return (
    <div ref={contentRef} className="space-y-6">
      {/* Primary Definition */}
      <motion.div 
        className="bg-emerald-900/20 rounded-xl p-6 border border-emerald-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-xl font-bold text-emerald-400 mb-4">
          The Fundamental Goal
        </h3>
        <p className="text-base text-neutral-200 leading-relaxed">
          One of the goals of statistical inference is to draw conclusions about a
          <span className="mx-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
            population
          </span>
          based on a
          <span className="mx-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
            random sample
          </span>
          from the population.
        </p>
      </motion.div>
      
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
      <AnimatePresence>
        {selectedExample && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-neutral-800/50 rounded-lg p-4 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-white">Mathematical Framework</h4>
              <span className="text-xs text-emerald-400">
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
                    ? `\\(\\mu\\)` 
                    : `\\(p\\)` 
                }} />
                <p className="text-xs mt-1">Unknown true value</p>
              </div>
              <div className="text-center p-3 bg-neutral-900/50 rounded">
                <p className="text-xs text-neutral-400 mb-1">Point Estimate</p>
                <span className="text-lg" dangerouslySetInnerHTML={{ 
                  __html: selectedExample === 'manufacturing' 
                    ? `\\(\\bar{X}\\)` 
                    : `\\(\\hat{p}\\)` 
                }} />
                <p className="text-xs mt-1">Sample statistic</p>
              </div>
              <div className="text-center p-3 bg-neutral-900/50 rounded">
                <p className="text-xs text-neutral-400 mb-1">Standard Error</p>
                <span className="text-lg" dangerouslySetInnerHTML={{ 
                  __html: selectedExample === 'manufacturing' 
                    ? `\\(SE(\\bar{X})\\)` 
                    : `\\(SE(\\hat{p})\\)` 
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Interactive Insights Cards
const InteractiveInsights = () => {
  const [revealedInsights, setRevealedInsights] = useState(new Set());
  
  const insights = [
    {
      id: 'population',
      title: 'Population',
      icon: Users,
      color: 'emerald',
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
        <motion.div
          key={insight.id}
          className="relative group cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          onHoverStart={() => setRevealedInsights(prev => new Set([...prev, insight.id]))}
        >
          <motion.div
            className={`relative bg-neutral-800 rounded-xl p-4 border transition-all duration-300 ${
              insight.color === 'emerald' 
                ? 'border-neutral-700 hover:border-emerald-500/60' 
                : insight.color === 'blue'
                  ? 'border-neutral-700 hover:border-blue-500/60'
                  : 'border-neutral-700 hover:border-purple-500/60'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`inline-flex p-2 rounded-lg mb-3 ${
              insight.color === 'emerald' 
                ? 'bg-emerald-500/20' 
                : insight.color === 'blue'
                  ? 'bg-blue-500/20'
                  : 'bg-purple-500/20'
            }`}>
              <insight.icon className={`w-6 h-6 ${
                insight.color === 'emerald' 
                  ? 'text-emerald-400' 
                  : insight.color === 'blue'
                    ? 'text-blue-400'
                    : 'text-purple-400'
              }`} />
            </div>
            
            <h4 className={`font-bold mb-2 ${
              insight.color === 'emerald' 
                ? 'text-emerald-400' 
                : insight.color === 'blue'
                  ? 'text-blue-400'
                  : 'text-purple-400'
            }`}>
              {insight.title}
            </h4>
            
            {!revealedInsights.has(insight.id) ? (
              <div className="space-y-2">
                <p className="text-sm text-neutral-300">{insight.shortDesc}</p>
                <p className="text-xs text-neutral-500 italic">Hover to explore →</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <p className="text-sm text-neutral-300">{insight.fullDesc}</p>
                <p className="text-xs text-neutral-400 italic">Example: {insight.example}</p>
                <div className="mt-2 p-2 bg-neutral-900/50 rounded text-center">
                  <span className={`text-xs font-mono ${
                    insight.color === 'emerald' 
                      ? 'text-emerald-400' 
                      : insight.color === 'blue'
                        ? 'text-blue-400'
                        : 'text-purple-400'
                  }`}>
                    {insight.formula}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

// Gear Wheel Factory Visualization
const GearWheelFactory = () => {
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
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      svg.append("text")
        .attr("x", xScale(TRUE_MU) + 5)
        .attr("y", margin.top + 20)
        .attr("fill", "#ef4444")
        .text("True μ = 50g");
    }
  }, [allSampleMeans]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Package className="w-6 h-6 text-emerald-400" />
        The Gear Wheel Factory
      </h3>
      <p className="text-sm text-neutral-400 mb-4">
        Explore how sample statistics estimate population parameters
      </p>
      
      <div className="flex justify-between items-start mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <p className="text-xs text-neutral-400">Samples Taken</p>
            <p className="text-2xl font-mono text-emerald-400">{allSampleMeans.length}</p>
          </div>
          {currentMean && (
            <>
              <div className="bg-neutral-800/50 rounded-lg p-3">
                <p className="text-xs text-neutral-400">Last Sample Mean</p>
                <p className="text-xl font-mono text-blue-400">{currentMean.toFixed(3)}g</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-3">
                <p className="text-xs text-neutral-400">Error from True μ</p>
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
            <motion.button
              onClick={performSampling}
              disabled={isSampling}
              className={`px-6 py-3 rounded-lg font-medium transition-all
                         ${isSampling 
                           ? 'bg-neutral-600 cursor-not-allowed' 
                           : 'bg-emerald-600 hover:bg-emerald-700'
                         } text-white shadow-lg`}
              whileHover={{ scale: isSampling ? 1 : 1.05 }}
              whileTap={{ scale: isSampling ? 1 : 0.95 }}
            >
              {isSampling ? 'Sampling...' : 'Draw New Sample'}
            </motion.button>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg"
          >
            <p className="text-sm text-emerald-400">
              🎯 Notice how the sample means cluster around the true population mean!
            </p>
          </motion.div>
        )}
      </ControlGroup>
    </VisualizationSection>
  );
};

// CLT Visualization
const CLTVisualization = () => {
  const [distributionType, setDistributionType] = useState('uniform');
  const [sampleSize, setSampleSize] = useState(30);
  const [numSamples, setNumSamples] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showTheory, setShowTheory] = useState(false);
  const [sampleMeans, setSampleMeans] = useState([]);
  const svgRef = useRef(null);
  const intervalRef = useRef(null);
  
  const distributions = {
    uniform: {
      name: 'Uniform',
      generator: () => Math.random() * 10,
      theoretical: { mean: 5, variance: 100/12 }
    },
    exponential: {
      name: 'Exponential',
      generator: () => -Math.log(1 - Math.random()) * 3,
      theoretical: { mean: 3, variance: 9 }
    },
    bimodal: {
      name: 'Bimodal',
      generator: () => Math.random() < 0.5 
        ? d3.randomNormal(2, 0.5)() 
        : d3.randomNormal(8, 0.5)(),
      theoretical: { mean: 5, variance: 10 }
    }
  };
  
  const runSimulation = useCallback(() => {
    const dist = distributions[distributionType];
    const sample = Array.from({ length: sampleSize }, dist.generator);
    const mean = d3.mean(sample);
    
    setSampleMeans(prev => [...prev, mean]);
    setNumSamples(prev => prev + 1);
  }, [distributionType, sampleSize]);
  
  const startSimulation = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(runSimulation, 50);
  };
  
  const stopSimulation = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  const reset = () => {
    stopSimulation();
    setSampleMeans([]);
    setNumSamples(0);
  };
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // D3 Visualization
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 700;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    
    if (sampleMeans.length > 0) {
      const dist = distributions[distributionType];
      const theoreticalMean = dist.theoretical.mean;
      const theoreticalSD = Math.sqrt(dist.theoretical.variance / sampleSize);
      
      const xScale = d3.scaleLinear()
        .domain([theoreticalMean - 4 * theoreticalSD, theoreticalMean + 4 * theoreticalSD])
        .range([margin.left, width - margin.right]);
      
      const bins = d3.histogram()
        .domain(xScale.domain())
        .thresholds(30)(sampleMeans);
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length / sampleMeans.length / (bins[0].x1 - bins[0].x0))])
        .range([height - margin.bottom, margin.top]);
      
      // Draw axes
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));
      
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
      
      // Draw histogram
      svg.selectAll(".bar")
        .data(bins)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yScale(d.length / sampleMeans.length / (d.x1 - d.x0)))
        .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
        .attr("height", d => height - margin.bottom - yScale(d.length / sampleMeans.length / (d.x1 - d.x0)))
        .attr("fill", chapterColors.secondary)
        .attr("opacity", 0.7);
      
      // Draw theoretical normal curve when enough samples
      if (sampleMeans.length >= 100) {
        const normalPdf = (x, mean, sd) => {
          const variance = sd * sd;
          return (1 / Math.sqrt(2 * Math.PI * variance)) * 
                 Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
        };
        
        const lineData = d3.range(xScale.domain()[0], xScale.domain()[1], 0.1).map(x => ({
          x: x,
          y: normalPdf(x, theoreticalMean, theoreticalSD)
        }));
        
        const line = d3.line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y))
          .curve(d3.curveBasis);
        
        svg.append("path")
          .datum(lineData)
          .attr("fill", "none")
          .attr("stroke", "#ef4444")
          .attr("stroke-width", 2)
          .attr("d", line)
          .attr("opacity", 0.8);
      }
    }
  }, [sampleMeans, distributionType, sampleSize]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Activity className="w-6 h-6 text-emerald-400" />
        Central Limit Theorem in Action
      </h3>
      
      {/* Theory Panel */}
      <AnimatePresence>
        {showTheory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-neutral-800/50 rounded-lg p-4 mb-4"
          >
            <p className="text-sm text-neutral-300 mb-3">
              The Central Limit Theorem states that for large n:
            </p>
            <div className="text-center p-3 bg-neutral-900/50 rounded">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[\\bar{X} \\sim N\\left(\\mu, \\frac{\\sigma^2}{n}\\right)\\]` 
              }} />
            </div>
            <p className="text-xs text-neutral-400 mt-3">
              Regardless of the population distribution shape!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Distribution Selector */}
      <div className="flex gap-2 mb-4">
        {Object.entries(distributions).map(([key, dist]) => (
          <button
            key={key}
            onClick={() => setDistributionType(key)}
            disabled={isRunning}
            className={`px-4 py-2 rounded transition-all ${
              distributionType === key
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            } disabled:opacity-50`}
          >
            {dist.name}
          </button>
        ))}
      </div>
      
      <GraphContainer title={`Sampling Distribution of X̄ (n=${sampleSize})`}>
        <svg ref={svgRef} width="100%" height="300" viewBox="0 0 700 300" />
      </GraphContainer>
      
      {/* Progress Indicators */}
      <div className="bg-neutral-800/50 rounded-lg p-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">Samples Generated</span>
          <span className="font-mono text-emerald-400">{numSamples}</span>
        </div>
        <div className="w-full bg-neutral-700 rounded-full h-2">
          <motion.div
            className="bg-emerald-600 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(numSamples / 500 * 100, 100)}%` }}
          />
        </div>
        {numSamples >= 500 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3"
          >
            <p className="text-sm text-emerald-400 text-center">
              ✨ The normal pattern emerges! The CLT works its magic.
            </p>
          </motion.div>
        )}
      </div>
      
      <ControlGroup>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
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
              disabled={isRunning}
            />
          </div>
          
          <div className="flex gap-2">
            {!isRunning ? (
              <button
                onClick={startSimulation}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <Play size={16} />
                Start
              </button>
            ) : (
              <button
                onClick={stopSimulation}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Pause size={16} />
                Stop
              </button>
            )}
            
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Reset
            </button>
            
            <button
              onClick={() => setShowTheory(!showTheory)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {showTheory ? 'Hide' : 'Show'} Theory
            </button>
          </div>
        </div>
      </ControlGroup>
    </VisualizationSection>
  );
};

// Baseball Heights Example
const BaseballHeights = React.memo(function BaseballHeights() {
  const contentRef = useRef(null);
  const [showCalculation, setShowCalculation] = useState(false);
  
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
    const bgClass = color === 'blue' ? 'bg-blue-900/20' : color === 'purple' ? 'bg-purple-900/20' : 'bg-emerald-900/20';
    const borderClass = color === 'blue' ? 'border-blue-700/50' : color === 'purple' ? 'border-purple-700/50' : 'border-emerald-700/50';
    const textClass = color === 'blue' ? 'text-blue-400' : color === 'purple' ? 'text-purple-400' : 'text-emerald-400';
    
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
          <BarChart className="w-6 h-6 text-emerald-400" />
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
            formula="\\bar{X} = \\frac{1}{n}\\sum X_i"
            color="blue"
          />
          <StatCard
            label="Sample Variance"
            value={s2.toFixed(4)}
            formula="S^2 = \\frac{1}{n-1}\\sum(X_i - \\bar{X})^2"
            color="purple"
          />
          <StatCard
            label="Standard Error"
            value={se.toFixed(4)}
            formula="SE(\\bar{X}) = \\frac{S}{\\sqrt{n}}"
            color="emerald"
          />
        </div>
        
        <motion.div
          className="bg-emerald-900/20 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <button
            onClick={() => setShowCalculation(!showCalculation)}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
          >
            <ChevronRight className={`w-4 h-4 transform transition-transform ${
              showCalculation ? 'rotate-90' : ''
            }`} />
            Show Calculation Steps
          </button>
          
          <AnimatePresence>
            {showCalculation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-2 text-sm"
              >
                <div className="pl-6">
                  <p>1. Calculate mean: <span dangerouslySetInnerHTML={{ 
                    __html: `\\(\\bar{X} = \\frac{1452}{20} = 72.6\\)` 
                  }} /></p>
                  <p>2. Calculate variance: <span dangerouslySetInnerHTML={{ 
                    __html: `\\(S^2 = \\frac{106.8}{19} = 5.6211\\)` 
                  }} /></p>
                  <p>3. Calculate SE: <span dangerouslySetInnerHTML={{ 
                    __html: `\\(SE = \\frac{\\sqrt{5.6211}}{\\sqrt{20}} = 0.5301\\)` 
                  }} /></p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </VisualizationSection>
  );
});

// Interactive Calculator Component
const InteractiveCalculator = () => {
  const [mode, setMode] = useState('known-sigma');
  const [values, setValues] = useState({
    n: 30,
    xBar: 100,
    sigma: 15,
    s: 14.5
  });
  
  const calculateSE = () => {
    if (mode === 'known-sigma') {
      return values.sigma / Math.sqrt(values.n);
    } else {
      return values.s / Math.sqrt(values.n);
    }
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Target className="w-6 h-6 text-emerald-400" />
        Standard Error Calculator
      </h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('known-sigma')}
          className={`px-4 py-2 rounded ${
            mode === 'known-sigma' 
              ? 'bg-blue-600 text-white' 
              : 'bg-neutral-700 text-neutral-300'
          }`}
        >
          σ Known
        </button>
        <button
          onClick={() => setMode('unknown-sigma')}
          className={`px-4 py-2 rounded ${
            mode === 'unknown-sigma' 
              ? 'bg-purple-600 text-white' 
              : 'bg-neutral-700 text-neutral-300'
          }`}
        >
          σ Unknown
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sample Size (n): {values.n}
          </label>
          <input
            type="range"
            min="5"
            max="200"
            value={values.n}
            onChange={(e) => setValues({...values, n: Number(e.target.value)})}
            className="w-full"
          />
        </div>
        
        {mode === 'known-sigma' ? (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Population SD (σ): {values.sigma}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={values.sigma}
              onChange={(e) => setValues({...values, sigma: Number(e.target.value)})}
              className="w-full"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sample SD (s): {values.s}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={values.s}
              onChange={(e) => setValues({...values, s: Number(e.target.value)})}
              className="w-full"
            />
          </div>
        )}
      </div>
      
      <div className="bg-emerald-900/20 rounded-lg p-6">
        <div className="text-center">
          <p className="text-sm text-neutral-400 mb-2">Standard Error of X̄</p>
          <p className="text-3xl font-mono text-emerald-400">
            {calculateSE().toFixed(4)}
          </p>
          <div className="mt-4 p-3 bg-neutral-900/50 rounded">
            {mode === 'known-sigma' ? (
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[SE(\\bar{X}) = \\frac{${values.sigma}}{\\sqrt{${values.n}}} = ${calculateSE().toFixed(4)}\\]` 
              }} />
            ) : (
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[SE(\\bar{X}) = \\frac{${values.s}}{\\sqrt{${values.n}}} = ${calculateSE().toFixed(4)}\\]` 
              }} />
            )}
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
};

// Concept Connections Component
const ConceptConnections = () => {
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Brain className="w-6 h-6 text-purple-400" />
        Connecting the Concepts
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50"
        >
          <h4 className="font-semibold text-blue-400 mb-2">Sample Statistics</h4>
          <ul className="text-sm text-neutral-300 space-y-1">
            <li>• Computed from observed data</li>
            <li>• Estimates of population parameters</li>
            <li>• Have sampling distributions</li>
            <li>• Vary from sample to sample</li>
          </ul>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/50"
        >
          <h4 className="font-semibold text-purple-400 mb-2">Standard Error</h4>
          <ul className="text-sm text-neutral-300 space-y-1">
            <li>• Measures variability of sample statistic</li>
            <li>• Decreases with larger sample size</li>
            <li>• Key to confidence intervals</li>
            <li>• Foundation for hypothesis testing</li>
          </ul>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50 md:col-span-2"
        >
          <h4 className="font-semibold text-emerald-400 mb-2">Central Limit Theorem</h4>
          <p className="text-sm text-neutral-300">
            The bridge between sample statistics and probability theory. It guarantees that 
            sample means follow a normal distribution for large samples, enabling us to make 
            probabilistic statements about population parameters.
          </p>
        </motion.div>
      </div>
    </VisualizationSection>
  );
};


// Key Takeaways Component
const KeyTakeaways = () => {
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Brain className="w-6 h-6 text-yellow-400" />
        Key Takeaways
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50"
        >
          <h4 className="font-semibold text-emerald-400 mb-2">Sample Statistics</h4>
          <p className="text-sm text-gray-300">
            Sample statistics estimate population parameters. Their accuracy improves with larger sample sizes.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50"
        >
          <h4 className="font-semibold text-blue-400 mb-2">Central Limit Theorem</h4>
          <p className="text-sm text-gray-300">
            Sample means follow a normal distribution for large samples, regardless of the population distribution.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/50"
        >
          <h4 className="font-semibold text-purple-400 mb-2">Standard Error</h4>
          <p className="text-sm text-gray-300">
            The standard error measures the variability of a sample statistic and decreases as √n.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-pink-900/20 rounded-lg p-4 border border-pink-700/50"
        >
          <h4 className="font-semibold text-pink-400 mb-2">Practical Applications</h4>
          <p className="text-sm text-gray-300">
            From quality control to election polling, statistical inference powers data-driven decisions.
          </p>
        </motion.div>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatisticalInferenceIntroduction />
          <InteractiveInsights />
        </motion.div>
        
        {/* Exploration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GearWheelFactory />
        </motion.div>
        
        {/* Discovery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CLTVisualization />
          <BaseballHeights />
        </motion.div>
        
        {/* Application */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <InteractiveCalculator />
          <ConceptConnections />
        </motion.div>
        
        {/* Key Takeaways */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <KeyTakeaways />
        </motion.div>
        
        {/* Section Complete - Standardized Component */}
        <SectionComplete chapter={5} />
      </div>
    </VisualizationContainer>
  );
}