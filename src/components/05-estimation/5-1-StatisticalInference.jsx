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

// Use Chapter 7 color scheme for consistency
const chapterColors = createColorScheme('regression');

// Introduction Component
const StatisticalInferenceIntroduction = React.memo(function StatisticalInferenceIntroduction() {
  const contentRef = useRef(null);
  const [selectedExample, setSelectedExample] = useState(null);
  
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
    <motion.div
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected 
          ? 'bg-teal-900/30 border-teal-500/50 shadow-lg shadow-teal-500/20' 
          : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
      }`}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${isSelected ? 'text-teal-400' : 'text-neutral-400'}`} />
        <div className="flex-1">
          <h4 className="font-semibold text-teal-400 mb-1">{title}</h4>
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
        className="bg-teal-900/20 rounded-xl p-6 border border-teal-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <h3 className="text-xl font-bold text-teal-400 mb-4">
          The Fundamental Goal
        </h3>
        <p className="text-base text-neutral-200 leading-relaxed">
          One of the goals of statistical inference is to draw conclusions about a
          <span className="mx-1 px-2 py-1 bg-teal-500/20 text-teal-400 rounded">
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
              <h4 className="font-semibold text-teal-400">Mathematical Framework</h4>
              <span className="text-xs text-teal-400">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Mathematical Foundations Component
const MathematicalFoundations = React.memo(function MathematicalFoundations() {
  const contentRef = useRef(null);
  const [selectedTopic, setSelectedTopic] = useState('point-estimate');
  
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
  }, [selectedTopic]);
  
  const topics = {
    'point-estimate': {
      title: 'Point Estimation',
      content: (
        <div className="space-y-4">
          <div className="bg-neutral-900/50 rounded-lg p-4">
            <h5 className="font-semibold text-teal-400 mb-2">Definition</h5>
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
      )
    },
    'sampling-dist': {
      title: 'Sampling Distribution',
      content: (
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
      )
    },
    'standard-error': {
      title: 'Standard Error',
      content: (
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
      )
    }
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5" />
        Mathematical Foundations
      </h3>
      
      <div className="flex gap-2 mb-4">
        {Object.entries(topics).map(([key, topic]) => (
          <button
            key={key}
            onClick={() => setSelectedTopic(key)}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedTopic === key
                ? 'bg-teal-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            {topic.title}
          </button>
        ))}
      </div>
      
      <div ref={contentRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTopic}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {topics[selectedTopic].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </VisualizationSection>
  );
});

// Interactive Insights Cards
const InteractiveInsights = React.memo(() => {
  const [revealedInsights, setRevealedInsights] = useState(new Set());
  
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
              insight.color === 'teal' 
                ? 'border-neutral-700 hover:border-teal-500/60' 
                : insight.color === 'blue'
                  ? 'border-neutral-700 hover:border-blue-500/60'
                  : 'border-neutral-700 hover:border-purple-500/60'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`inline-flex p-2 rounded-lg mb-3 ${
              insight.color === 'teal' 
                ? 'bg-teal-500/20' 
                : insight.color === 'blue'
                  ? 'bg-blue-500/20'
                  : 'bg-purple-500/20'
            }`}>
              <insight.icon className={`w-5 h-5 ${
                insight.color === 'teal' 
                  ? 'text-teal-400' 
                  : insight.color === 'blue'
                    ? 'text-blue-400'
                    : 'text-purple-400'
              }`} />
            </div>
            
            <h4 className={`font-bold mb-2 ${
              insight.color === 'teal' 
                ? 'text-teal-400' 
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
                    insight.color === 'teal' 
                      ? 'text-teal-400' 
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
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");
      
      svg.append("text")
        .attr("x", xScale(TRUE_MU) + 5)
        .attr("y", margin.top + 20)
        .attr("fill", "#ef4444")
        .text("True mean = 50g");
    }
  }, [allSampleMeans]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-teal-400" />
        The Gear Wheel Factory
      </h3>
      <p className="text-sm text-neutral-400 mb-4">
        Explore how sample statistics estimate population parameters
      </p>
      
      <div className="flex justify-between items-start mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-neutral-800/50 rounded-lg p-3">
            <p className="text-xs text-neutral-400">Samples Taken</p>
            <p className="text-2xl font-mono text-teal-400">{allSampleMeans.length}</p>
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
            <motion.button
              onClick={performSampling}
              disabled={isSampling}
              className={`px-6 py-3 rounded-lg font-medium transition-all
                         ${isSampling 
                           ? 'bg-neutral-600 cursor-not-allowed' 
                           : 'bg-teal-600 hover:bg-teal-700'
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
            className="mt-4 p-3 bg-teal-900/20 border border-teal-500/30 rounded-lg"
          >
            <p className="text-sm text-teal-400">
              🎯 Notice how the sample means cluster around the true population mean!
            </p>
          </motion.div>
        )}
      </ControlGroup>
    </VisualizationSection>
  );
});

// CLT Visualization
const CLTVisualization = React.memo(() => {
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
        <Activity className="w-5 h-5 text-teal-400" />
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
                ? 'bg-teal-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            } disabled:opacity-50`}
          >
            {dist.name}
          </button>
        ))}
      </div>
      
      <GraphContainer title={<>Sampling Distribution of <span dangerouslySetInnerHTML={{ __html: '\\(\\bar{X}\\)' }} /> (n={sampleSize})</>}>
        <svg ref={svgRef} width="100%" height="300" viewBox="0 0 700 300" />
      </GraphContainer>
      
      {/* Progress Indicators */}
      <div className="bg-neutral-800/50 rounded-lg p-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">Samples Generated</span>
          <span className="font-mono text-teal-400">{numSamples}</span>
        </div>
        <div className="w-full bg-neutral-700 rounded-full h-2">
          <motion.div
            className="bg-teal-600 h-full rounded-full"
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
            <p className="text-sm text-teal-400 text-center">
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
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
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
});

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
    const bgClass = color === 'blue' ? 'bg-blue-900/20' : color === 'purple' ? 'bg-purple-900/20' : 'bg-teal-900/20';
    const borderClass = color === 'blue' ? 'border-blue-700/50' : color === 'purple' ? 'border-purple-700/50' : 'border-teal-700/50';
    const textClass = color === 'blue' ? 'text-blue-400' : color === 'purple' ? 'text-purple-400' : 'text-teal-400';
    
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
          <BarChart className="w-5 h-5 text-teal-400" />
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
        
        <motion.div
          className="bg-teal-900/20 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <button
            onClick={() => setShowCalculation(!showCalculation)}
            className="flex items-center gap-2 text-teal-400 hover:text-teal-300"
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
                    __html: '\\(\\bar{X} = \\frac{1452}{20} = 72.6\\)' 
                  }} /></p>
                  <p>2. Calculate variance: <span dangerouslySetInnerHTML={{ 
                    __html: '\\(S^2 = \\frac{106.8}{19} = 5.6211\\)' 
                  }} /></p>
                  <p>3. Calculate SE: <span dangerouslySetInnerHTML={{ 
                    __html: '\\(SE = \\frac{\\sqrt{5.6211}}{\\sqrt{20}} = 0.5301\\)' 
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
        <h5 className="font-medium text-teal-400">Formula Helper</h5>
        {currentStep !== 'start' && (
          <button
            onClick={() => setCurrentStep('start')}
            className="text-sm text-neutral-400 hover:text-neutral-300 transition-colors"
          >
            ← Start Over
          </button>
        )}
      </div>
      <p className="text-sm text-neutral-300 mb-3">{steps[currentStep].question}</p>
      {steps[currentStep].options && (
        <div className="space-y-2">
          {steps[currentStep].options.map((option) => (
            <motion.button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className="w-full text-left p-3 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg transition-all duration-200 text-sm text-neutral-300 hover:text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {option.label}
            </motion.button>
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
      bgGradient: 'from-blue-900/20 to-cyan-900/20',
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
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="flex items-start gap-2 text-sm"
            >
              <span className="text-teal-400 font-mono">{idx + 1}.</span>
              <div className="flex-1">
                <span className="text-neutral-300">{step.label}:</span>
                <span className="ml-2 font-mono text-neutral-400">{step.calc}</span>
              </div>
            </motion.div>
          ))}
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-3 p-2 bg-gradient-to-br from-red-900/20 to-red-800/20 rounded border border-red-700/50"
          >
            <p className="text-xs font-medium text-red-400 mb-1">⚠️ Common Mistakes:</p>
            <ul className="text-xs text-neutral-300">
              {current.commonMistakes.map((mistake, idx) => (
                <li key={idx}>• {mistake}</li>
              ))}
            </ul>
          </motion.div>
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
  const [showSteps, setShowSteps] = useState(false);
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
  }, [mode, showSteps]);
  
  const calculateSE = () => {
    if (mode === 'ci-known-sigma') {
      return values.sigma / Math.sqrt(values.n);
    } else if (mode === 'ci-unknown-sigma') {
      return values.s / Math.sqrt(values.n);
    }
    return 0;
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5" />
        Step-by-Step Confidence Interval Calculator
      </h3>
      
      <div ref={contentRef}>
        {/* Decision Tree Toggle */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-neutral-400">
            Not sure which formula to use? Let me help you decide!
          </p>
          <button
            onClick={() => setShowDecisionTree(!showDecisionTree)}
            className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
          >
            {showDecisionTree ? 'Hide' : 'Show'} Helper
          </button>
        </div>
        
        {/* Decision Tree */}
        <AnimatePresence>
          {showDecisionTree && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DecisionTreeHelper 
                onSelect={(formula) => {
                  setMode(formula);
                  setShowDecisionTree(false);
                  setShowSteps(true);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Quick Mode Selection */}
        {!showDecisionTree && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setMode('ci-known-sigma');
                setShowSteps(false);
              }}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                mode === 'ci-known-sigma' 
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500/50' 
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
              }`}
            >
              σ Known
            </button>
            <button
              onClick={() => {
                setMode('ci-unknown-sigma');
                setShowSteps(false);
              }}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                mode === 'ci-unknown-sigma' 
                  ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-500/50' 
                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
              }`}
            >
              σ Unknown
            </button>
          </div>
        )}
        
        {/* Input Controls */}
        {mode && (
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
            
            {mode === 'ci-known-sigma' ? (
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
        )}
        
        {/* Visual Formula Card */}
        {mode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            <VisualFormulaCard 
              type={mode} 
              values={values} 
              showSteps={showSteps}
            />
          </motion.div>
        )}
        
        {/* Results Display */}
        {mode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-teal-900/20 to-cyan-900/20 rounded-lg p-6 mt-4 border border-teal-700/50"
          >
            <div className="text-center">
              <p className="text-sm text-neutral-400 mb-2">Standard Error of X̄</p>
              <p className="text-3xl font-mono text-teal-400">
                {calculateSE().toFixed(4)}
              </p>
              
              {/* Confidence Interval Result */}
              <div className="mt-4 p-4 bg-neutral-900/50 rounded-lg">
                <p className="text-sm text-neutral-400 mb-2">95% Confidence Interval:</p>
                <p className="text-xl font-mono text-blue-400">
                  ({(values.xBar - 1.96 * calculateSE()).toFixed(2)}, {(values.xBar + 1.96 * calculateSE()).toFixed(2)})
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  We are 95% confident that the true population mean lies within this interval
                </p>
              </div>
              
              {/* Show/Hide Steps Button */}
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="mt-4 text-sm text-teal-400 hover:text-teal-300 transition-colors"
              >
                {showSteps ? 'Hide' : 'Show'} Calculation Steps
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </VisualizationSection>
  );
};

// Field-Specific Examples Component
const FieldSpecificExamples = React.memo(function FieldSpecificExamples() {
  const contentRef = useRef(null);
  const [selectedField, setSelectedField] = useState('medicine');
  
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
  }, [selectedField]);
  
  const fields = {
    medicine: {
      title: 'Medicine & Healthcare',
      icon: '🏥',
      gradient: 'from-red-900/20 to-pink-900/20',
      borderColor: 'border-red-700/50',
      textColor: 'text-red-400',
      example: {
        context: 'A new drug is tested on 64 patients to reduce blood pressure',
        data: 'Mean reduction: 12.5 mmHg, σ = 8 mmHg',
        question: 'Is the drug effective? Build a 95% CI.',
        relevance: 'Determines if drug trials show significant improvement',
        calculation: 'CI = 12.5 ± 1.96(8/√64) = 12.5 ± 1.96 = (10.54, 14.46)',
        interpretation: 'Since the entire CI is positive, the drug shows significant reduction'
      }
    },
    business: {
      title: 'Business & Economics',
      icon: '💼',
      gradient: 'from-green-900/20 to-teal-900/20',
      borderColor: 'border-green-700/50',
      textColor: 'text-green-400',
      example: {
        context: 'An e-commerce site tests a new checkout design with 100 users',
        data: 'Conversion rate: 18%, previous rate: 15%',
        question: 'Did the new design improve conversions?',
        relevance: 'Helps make data-driven business decisions',
        calculation: 'CI = 0.18 ± 1.96√(0.18×0.82/100) = 0.18 ± 0.075 = (0.105, 0.255)',
        interpretation: 'Since 15% is within the CI, improvement is not statistically significant'
      }
    },
    engineering: {
      title: 'Engineering',
      icon: '⚙️',
      gradient: 'from-blue-900/20 to-cyan-900/20',
      borderColor: 'border-blue-700/50',
      textColor: 'text-blue-400',
      example: {
        context: 'Testing tensile strength of 25 steel samples',
        data: 'Mean: 520 MPa, s = 15 MPa',
        question: 'Does the steel meet the 515 MPa specification?',
        relevance: 'Ensures safety and quality standards in construction',
        calculation: 'CI = 520 ± 2.064(15/√25) = 520 ± 6.19 = (513.81, 526.19)',
        interpretation: 'Lower bound < 515 MPa, so we cannot guarantee all steel meets spec'
      }
    },
    psychology: {
      title: 'Psychology & Social Sciences',
      icon: '🧠',
      gradient: 'from-purple-900/20 to-purple-800/20',
      borderColor: 'border-purple-700/50',
      textColor: 'text-purple-400',
      example: {
        context: 'Study on meditation reducing anxiety scores',
        data: '36 participants, mean reduction: 8.2 points, σ = 6',
        question: 'Is meditation effective for anxiety?',
        relevance: 'Validates therapeutic interventions',
        calculation: 'CI = 8.2 ± 1.96(6/√36) = 8.2 ± 1.96 = (6.24, 10.16)',
        interpretation: 'Entire CI shows reduction, supporting meditation effectiveness'
      }
    }
  };
  
  const currentField = fields[selectedField];
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-teal-400 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        See It In Your Field
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {Object.entries(fields).map(([key, field]) => (
          <motion.button
            key={key}
            onClick={() => setSelectedField(key)}
            className={`p-3 rounded-lg transition-all duration-200 ${
              selectedField === key
                ? `bg-gradient-to-br ${field.gradient} text-white border ${field.borderColor}` 
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl mb-1">{field.icon}</div>
            <div className="text-xs">{field.title}</div>
          </motion.button>
        ))}
      </div>
      
      <motion.div 
        key={selectedField}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        ref={contentRef} 
        className={`bg-gradient-to-br ${currentField.gradient} rounded-lg p-6 border ${currentField.borderColor}`}
      >
        <h4 className={`font-semibold ${currentField.textColor} mb-3`}>
          Real-World Application: {currentField.title}
        </h4>
        
        <div className="space-y-4">
          <div className="bg-neutral-900/50 rounded-lg p-4">
            <p className="text-sm font-medium text-neutral-300 mb-1">Scenario:</p>
            <p className="text-sm text-neutral-400">{currentField.example.context}</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-neutral-800/50 rounded p-3">
              <p className="text-xs text-neutral-400 mb-1">Given Data:</p>
              <p className="text-sm font-mono">{currentField.example.data}</p>
            </div>
            <div className="bg-neutral-800/50 rounded p-3">
              <p className="text-xs text-neutral-400 mb-1">Research Question:</p>
              <p className="text-sm">{currentField.example.question}</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 rounded-lg p-4 border border-yellow-700/50">
            <p className="text-sm font-medium text-yellow-400 mb-2">Why This Matters:</p>
            <p className="text-sm text-neutral-300">{currentField.example.relevance}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-300">Calculation:</p>
            <div className="bg-neutral-900/50 rounded p-3 font-mono text-sm">
              {currentField.example.calculation}
            </div>
          </div>
          
          <div className="bg-neutral-900/50 rounded-lg p-4">
            <p className={`text-sm font-medium ${currentField.textColor} mb-1`}>Interpretation:</p>
            <p className="text-sm text-neutral-300">{currentField.example.interpretation}</p>
          </div>
        </div>
      </motion.div>
    </VisualizationSection>
  );
});

// Concept Connections Component
const ConceptConnections = () => {
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5" />
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
          className="bg-teal-900/20 rounded-lg p-4 border border-teal-700/50 md:col-span-2"
        >
          <h4 className="font-semibold text-teal-400 mb-2">Central Limit Theorem</h4>
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


// Practice Problems Component
const PracticeProblems = React.memo(function PracticeProblems() {
  const contentRef = useRef(null);
  const [selectedProblem, setSelectedProblem] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  
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
      id: 1,
      type: 'confidence-interval',
      difficulty: 'Easy',
      question: 'A random sample of 36 observations from a normal population with σ = 12 yields x̄ = 85. Calculate a 95% confidence interval for μ.',
      answer: '(81.08, 88.92)',
      solution: (
        <div className="space-y-3">
          <p className="text-sm">Given: n = 36, σ = 12, x̄ = 85, α = 0.05</p>
          <p className="text-sm">For 95% CI: <span dangerouslySetInnerHTML={{ __html: '\\(z_{\\alpha/2} = z_{0.025} = 1.96\\)' }} /></p>
          <div className="bg-neutral-800 rounded p-3 text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[CI = \\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` 
            }} />
          </div>
          <p className="text-sm">Calculation:</p>
          <div className="bg-neutral-800 rounded p-3">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[CI = 85 \\pm 1.96 \\cdot \\frac{12}{\\sqrt{36}} = 85 \\pm 1.96 \\cdot 2 = 85 \\pm 3.92\\]` 
            }} />
          </div>
          <p className="text-sm font-semibold text-teal-400">Therefore: CI = (81.08, 88.92)</p>
        </div>
      )
    },
    {
      id: 2,
      type: 'sample-size',
      difficulty: 'Medium',
      question: 'A population has σ = 25. What sample size is needed to estimate μ within ±3 units with 99% confidence?',
      answer: 'n = 462',
      solution: (
        <div className="space-y-3">
          <p className="text-sm">Given: σ = 25, E = 3, α = 0.01</p>
          <p className="text-sm">For 99% CI: <span dangerouslySetInnerHTML={{ __html: '\\(z_{\\alpha/2} = z_{0.005} = 2.576\\)' }} /></p>
          <div className="bg-neutral-800 rounded p-3 text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[n = \\left(\\frac{z_{\\alpha/2} \\cdot \\sigma}{E}\\right)^2\\]` 
            }} />
          </div>
          <p className="text-sm">Calculation:</p>
          <div className="bg-neutral-800 rounded p-3">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[n = \\left(\\frac{2.576 \\times 25}{3}\\right)^2 = \\left(\\frac{64.4}{3}\\right)^2 = (21.47)^2 = 461.01\\]` 
            }} />
          </div>
          <p className="text-sm font-semibold text-teal-400">Round up: n = 462</p>
        </div>
      )
    },
    {
      id: 3,
      type: 'proportion',
      difficulty: 'Medium',
      question: 'In a poll of 800 voters, 440 support candidate A. Find a 95% confidence interval for the true proportion of support.',
      answer: '(0.517, 0.583)',
      solution: (
        <div className="space-y-3">
          <p className="text-sm">Given: n = 800, X = 440, α = 0.05</p>
          <p className="text-sm">Sample proportion: <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p} = \\frac{440}{800} = 0.55\\)` }} /></p>
          <div className="bg-neutral-800 rounded p-3 text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[CI = \\hat{p} \\pm z_{\\alpha/2} \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}\\]` 
            }} />
          </div>
          <p className="text-sm">Standard error:</p>
          <div className="bg-neutral-800 rounded p-3">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[SE = \\sqrt{\\frac{0.55 \\times 0.45}{800}} = \\sqrt{\\frac{0.2475}{800}} = 0.0176\\]` 
            }} />
          </div>
          <p className="text-sm">Margin of error: 1.96 × 0.0176 = 0.0345</p>
          <p className="text-sm font-semibold text-teal-400">CI = 0.55 ± 0.0345 = (0.517, 0.583)</p>
        </div>
      )
    },
    {
      id: 4,
      type: 'unknown-sigma',
      difficulty: 'Hard',
      question: 'A sample of 16 observations yields x̄ = 23.5 and s = 4.2. Construct a 90% confidence interval for μ.',
      answer: '(21.65, 25.35)',
      solution: (
        <div className="space-y-3">
          <p className="text-sm">Given: n = 16, x̄ = 23.5, s = 4.2, α = 0.10</p>
          <p className="text-sm">Since σ is unknown, use t-distribution with df = 15</p>
          <p className="text-sm">t<sub>0.05,15</sub> = 1.753</p>
          <div className="bg-neutral-800 rounded p-3 text-center">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[CI = \\bar{x} \\pm t_{\\alpha/2,n-1} \\cdot \\frac{s}{\\sqrt{n}}\\]` 
            }} />
          </div>
          <div className="bg-neutral-800 rounded p-3">
            <span dangerouslySetInnerHTML={{ 
              __html: `\\[CI = 23.5 \\pm 1.753 \\cdot \\frac{4.2}{\\sqrt{16}} = 23.5 \\pm 1.753 \\cdot 1.05 = 23.5 \\pm 1.84\\]` 
            }} />
          </div>
          <p className="text-sm font-semibold text-teal-400">CI = (21.66, 25.34)</p>
        </div>
      )
    }
  ];
  
  const checkAnswer = () => {
    const problem = problems[selectedProblem];
    const correctAnswer = problem.answer.toLowerCase().replace(/\s/g, '');
    const userAnswerClean = userAnswer.toLowerCase().replace(/\s/g, '');
    
    if (userAnswerClean === correctAnswer) {
      setFeedback({ type: 'correct', message: 'Correct! Well done!' });
    } else {
      setFeedback({ type: 'incorrect', message: 'Not quite. Try again or view the solution.' });
    }
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-400" />
        Practice Problems
      </h3>
      
      <div className="grid md:grid-cols-4 gap-2 mb-4">
        {problems.map((problem, idx) => (
          <button
            key={problem.id}
            onClick={() => {
              setSelectedProblem(idx);
              setShowSolution(false);
              setUserAnswer('');
              setFeedback(null);
            }}
            className={`p-3 rounded-lg transition-all ${
              selectedProblem === idx
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            <div className="text-sm font-semibold">Problem {problem.id}</div>
            <div className="text-xs opacity-75">{problem.difficulty}</div>
          </button>
        ))}
      </div>
      
      <div ref={contentRef} className="bg-neutral-800 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <span className={`text-xs px-2 py-1 rounded ${
              problems[selectedProblem].difficulty === 'Easy' ? 'bg-green-600' :
              problems[selectedProblem].difficulty === 'Medium' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}>
              {problems[selectedProblem].difficulty}
            </span>
            <p className="mt-3 text-neutral-200">
              {problems[selectedProblem].question}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className="flex-1 px-4 py-2 bg-neutral-700 rounded-lg text-white placeholder-neutral-400"
                onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
              />
              <button
                onClick={checkAnswer}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Check
              </button>
            </div>
            
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg ${
                  feedback.type === 'correct'
                    ? 'bg-green-900/50 border border-green-500/50 text-green-400'
                    : 'bg-red-900/50 border border-red-500/50 text-red-400'
                }`}
              >
                {feedback.message}
              </motion.div>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-neutral-700">
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="text-teal-400 hover:text-teal-300 transition-colors"
            >
              {showSolution ? 'Hide Solution' : 'Show Solution'}
            </button>
            <span className="text-sm text-neutral-400">
              Expected format: {problems[selectedProblem].answer}
            </span>
          </div>
          
          <AnimatePresence>
            {showSolution && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-neutral-900/50 rounded-lg p-4 mt-4"
              >
                <h5 className="font-semibold text-teal-400 mb-3">Solution:</h5>
                {problems[selectedProblem].solution}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Exam Preparation Component
const ExamPreparation = React.memo(function ExamPreparation() {
  const contentRef = useRef(null);
  const [showFormulas, setShowFormulas] = useState(false);
  
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
  }, [showFormulas]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <BarChart className="w-5 h-5 text-purple-400" />
        Exam Preparation Guide
      </h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Common Exam Questions */}
        <div className="bg-neutral-800 rounded-lg p-6">
          <h4 className="font-semibold text-teal-400 mb-4">Common Exam Question Types</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-neutral-900/50 rounded-lg p-4">
              <h5 className="font-medium text-blue-400 mb-2">Type 1: CI with Known σ</h5>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Given: n, x̄, σ, confidence level</li>
                <li>• Find: Confidence interval for μ</li>
                <li>• Key: Use z-distribution</li>
              </ul>
            </div>
            <div className="bg-neutral-900/50 rounded-lg p-4">
              <h5 className="font-medium text-purple-400 mb-2">Type 2: CI with Unknown σ</h5>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Given: n, x̄, s, confidence level</li>
                <li>• Find: Confidence interval for μ</li>
                <li>• Key: Use t-distribution</li>
              </ul>
            </div>
            <div className="bg-neutral-900/50 rounded-lg p-4">
              <h5 className="font-medium text-green-400 mb-2">Type 3: Sample Size</h5>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Given: σ, E, confidence level</li>
                <li>• Find: Required sample size n</li>
                <li>• Key: Round up always</li>
              </ul>
            </div>
            <div className="bg-neutral-900/50 rounded-lg p-4">
              <h5 className="font-medium text-yellow-400 mb-2">Type 4: Proportions</h5>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• Given: n, x (or p̂), confidence level</li>
                <li>• Find: CI for population proportion</li>
                <li>• Key: Check np ≥ 5 and n(1-p) ≥ 5</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Formula Sheet */}
        <div className="bg-teal-900/20 rounded-lg p-6 border border-teal-700/50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-teal-400">Quick Formula Reference</h4>
            <button
              onClick={() => setShowFormulas(!showFormulas)}
              className="text-sm text-teal-400 hover:text-teal-300"
            >
              {showFormulas ? 'Hide' : 'Show'} All
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="bg-neutral-800 rounded p-3">
                <p className="text-xs text-neutral-400 mb-1">CI for μ (σ known)</p>
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\bar{X} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]` 
                }} />
              </div>
              <div className="bg-neutral-800 rounded p-3">
                <p className="text-xs text-neutral-400 mb-1">CI for μ (σ unknown)</p>
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\bar{X} \\pm t_{\\alpha/2,n-1} \\cdot \\frac{S}{\\sqrt{n}}\\]` 
                }} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-neutral-800 rounded p-3">
                <p className="text-xs text-neutral-400 mb-1">Sample Size</p>
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[n = \\left(\\frac{z_{\\alpha/2} \\cdot \\sigma}{E}\\right)^2\\]` 
                }} />
              </div>
              <div className="bg-neutral-800 rounded p-3">
                <p className="text-xs text-neutral-400 mb-1">CI for Proportion</p>
                <span dangerouslySetInnerHTML={{ 
                  __html: `\\[\\hat{p} \\pm z_{\\alpha/2} \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}\\]` 
                }} />
              </div>
            </div>
          </div>
          
          <AnimatePresence>
            {showFormulas && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-neutral-700"
              >
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-neutral-800 rounded p-3">
                    <p className="font-medium text-blue-400 mb-1">Common z-values</p>
                    <p>90%: z = 1.645</p>
                    <p>95%: z = 1.96</p>
                    <p>99%: z = 2.576</p>
                  </div>
                  <div className="bg-neutral-800 rounded p-3">
                    <p className="font-medium text-purple-400 mb-1">t-distribution</p>
                    <p>df = n - 1</p>
                    <p>As df → ∞, t → z</p>
                    <p>Always t {'>'} z for same α</p>
                  </div>
                  <div className="bg-neutral-800 rounded p-3">
                    <p className="font-medium text-green-400 mb-1">Remember</p>
                    <p className="text-neutral-300">• <span dangerouslySetInnerHTML={{ __html: `SE \\propto \\frac{1}{\\sqrt{n}}` }} /></p>
                    <p className="text-neutral-300">• Wider CI <span className="text-green-300">→</span> More confidence</p>
                    <p className="text-neutral-300">• Round <span className="font-mono text-green-300">n</span> up always</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Study Tips */}
        <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-700/50">
          <h4 className="font-semibold text-purple-400 mb-3">Exam Success Tips</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-neutral-300">
            <div>
              <p className="font-medium text-purple-300 mb-1">Before Starting:</p>
              <ul className="space-y-1">
                <li>• Identify what type of problem it is</li>
                <li>• Check if σ is known or unknown</li>
                <li>• Verify assumptions (normality, sample size)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-purple-300 mb-1">Common Mistakes:</p>
              <ul className="space-y-1">
                <li>• Using z when should use t</li>
                <li>• Forgetting to divide σ by √n</li>
                <li>• Not rounding sample size up</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Key Takeaways Component
const KeyTakeaways = () => {
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-yellow-400" />
        Key Takeaways
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-teal-900/20 rounded-lg p-4 border border-teal-700/50"
        >
          <h4 className="font-semibold text-teal-400 mb-2">Sample Statistics</h4>
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
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <StatisticalInferenceIntroduction />
          <InteractiveInsights />
        </motion.div>
        
        {/* Mathematical Foundations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.1, ease: "easeOut" }}
        >
          <MathematicalFoundations />
        </motion.div>
        
        {/* Exploration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.15, ease: "easeOut" }}
        >
          <GearWheelFactory />
        </motion.div>
        
        {/* Discovery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
        >
          <CLTVisualization />
          <BaseballHeights />
        </motion.div>
        
        {/* Practice Problems */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.25, ease: "easeOut" }}
        >
          <PracticeProblems />
        </motion.div>
        
        {/* Application */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        >
          <InteractiveCalculator />
          <FieldSpecificExamples />
          <ConceptConnections />
        </motion.div>
        
        {/* Exam Preparation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.35, ease: "easeOut" }}
        >
          <ExamPreparation />
        </motion.div>
        
        {/* Key Takeaways */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
        >
          <KeyTakeaways />
        </motion.div>
        
        {/* Section Complete - Standardized Component */}
        <SectionComplete chapter={5} />
      </div>
    </VisualizationContainer>
  );
}