"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { Brain, Target, Activity, BarChart, Sparkles, RefreshCw, Zap } from 'lucide-react';

// Get Chapter 5 color scheme
const chapterColors = createColorScheme('estimation');

// Introduction Component
const InferenceIntroduction = React.memo(function InferenceIntroduction() {
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
    <div ref={contentRef} className="bg-neutral-800 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="text-sm text-neutral-300 space-y-2">
        <p className="text-lg font-semibold text-white mb-3">
          From Sample to Population: The Art of Statistical Inference
        </p>
        <p>
          Statistical inference allows us to draw conclusions about an entire <strong className="text-emerald-400">population</strong> based on a <strong className="text-blue-400">sample</strong>. 
          The key challenge is quantifying the uncertainty in our conclusions.
        </p>
        
        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="bg-neutral-700/50 rounded-lg p-3">
            <h4 className="font-semibold text-emerald-400 mb-1">Population Parameters</h4>
            <p className="text-xs">Fixed but unknown values we want to learn about</p>
            <div className="mt-2 text-center">
              <span dangerouslySetInnerHTML={{ __html: `\\(\\mu, \\sigma, p\\)` }} />
            </div>
          </div>
          <div className="bg-neutral-700/50 rounded-lg p-3">
            <h4 className="font-semibold text-blue-400 mb-1">Sample Statistics</h4>
            <p className="text-xs">Calculated from data to estimate parameters</p>
            <div className="mt-2 text-center">
              <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{x}, s, \\hat{p}\\)` }} />
            </div>
          </div>
        </div>
        
        <p className="text-xs text-neutral-400">
          This section explores how sample statistics converge to population parameters, the role of sample size, and both frequentist and Bayesian approaches to inference.
        </p>
      </div>
    </div>
  );
});

// Population to Sample Overview (based on 5-1-2)
const PopulationSampleOverview = () => {
  const [sampleSize, setSampleSize] = useState(30);
  const [samples, setSamples] = useState([]);
  const [showPopulation, setShowPopulation] = useState(true);
  const [showSample, setShowSample] = useState(true);
  const [samplingHistory, setSamplingHistory] = useState([]);
  const svgRef = useRef(null);
  
  const populationMean = 100;
  const populationSD = 15;
  
  const takeSample = useCallback(() => {
    const newSample = Array.from({ length: sampleSize }, () => 
      d3.randomNormal(populationMean, populationSD)()
    );
    setSamples(newSample);
    
    const sampleMean = d3.mean(newSample);
    const sampleSD = d3.deviation(newSample);
    
    setSamplingHistory(prev => [...prev.slice(-9), { 
      mean: sampleMean, 
      sd: sampleSD,
      size: sampleSize,
      se: populationSD / Math.sqrt(sampleSize)
    }]);
  }, [sampleSize]);
  
  useEffect(() => {
    takeSample();
  }, []);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    
    const xScale = d3.scaleLinear()
      .domain([40, 160])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.03])
      .range([height - margin.bottom, margin.top]);
    
    // Draw axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5));
    
    // Draw population curve
    if (showPopulation) {
      const normalPdf = (x, mean, sd) => {
        const variance = sd * sd;
        return (1 / Math.sqrt(2 * Math.PI * variance)) * 
               Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
      };
      
      const lineData = d3.range(40, 161, 1).map(x => ({
        x: x,
        y: normalPdf(x, populationMean, populationSD)
      }));
      
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveBasis);
      
      svg.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", chapterColors.primary)
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .attr("opacity", 0.8);
    }
    
    // Draw sample histogram
    if (showSample && samples.length > 0) {
      const bins = d3.histogram()
        .domain(xScale.domain())
        .thresholds(20)(samples);
      
      const maxBinHeight = d3.max(bins, d => d.length / samples.length / (bins[0].x1 - bins[0].x0));
      yScale.domain([0, Math.max(0.03, maxBinHeight * 1.1)]);
      
      svg.selectAll(".bar")
        .data(bins)
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.x0))
        .attr("y", height - margin.bottom)
        .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
        .attr("height", 0)
        .attr("fill", chapterColors.secondary)
        .attr("opacity", 0.7)
        .transition()
        .duration(800)
        .delay((d, i) => i * 20)
        .attr("y", d => yScale(d.length / samples.length / (d.x1 - d.x0)))
        .attr("height", d => height - margin.bottom - yScale(d.length / samples.length / (d.x1 - d.x0)));
      
      // Add sample mean line
      const sampleMean = d3.mean(samples);
      svg.append("line")
        .attr("x1", xScale(sampleMean))
        .attr("x2", xScale(sampleMean))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", chapterColors.secondary)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .attr("opacity", 0.8);
    }
  }, [samples, showPopulation, showSample]);
  
  const sampleMean = samples.length > 0 ? d3.mean(samples) : 0;
  const sampleSD = samples.length > 0 ? d3.deviation(samples) : 0;
  const standardError = populationSD / Math.sqrt(sampleSize);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">Population vs Sample</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50">
          <h4 className="font-semibold text-emerald-400 mb-2">Population Parameters</h4>
          <div className="space-y-1 text-sm">
            <p>μ = {populationMean}</p>
            <p>σ = {populationSD}</p>
          </div>
        </div>
        
        <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
          <h4 className="font-semibold text-blue-400 mb-2">Sample Statistics</h4>
          <div className="space-y-1 text-sm">
            <p>x̄ = {sampleMean.toFixed(2)}</p>
            <p>s = {sampleSD.toFixed(2)}</p>
            <p>n = {sampleSize}</p>
          </div>
        </div>
        
        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/50">
          <h4 className="font-semibold text-purple-400 mb-2">Standard Error</h4>
          <div className="space-y-1 text-sm">
            <p>SE = σ/√n</p>
            <p>SE = {standardError.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <GraphContainer>
        <svg ref={svgRef} width="100%" height="300" viewBox="0 0 600 300" />
      </GraphContainer>
      
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
            />
          </div>
          
          <button
            onClick={takeSample}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            New Sample
          </button>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPopulation}
              onChange={(e) => setShowPopulation(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Show Population</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSample}
              onChange={(e) => setShowSample(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Show Sample</span>
          </label>
        </div>
      </ControlGroup>
      
      {samplingHistory.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-300 mb-2">Sampling History</h4>
          <div className="flex gap-2 overflow-x-auto">
            {samplingHistory.map((sample, i) => (
              <div key={i} className="bg-neutral-700/50 rounded p-2 text-xs min-w-[80px]">
                <p>x̄ = {sample.mean.toFixed(1)}</p>
                <p className={sample.mean > populationMean ? "text-green-400" : "text-red-400"}>
                  {sample.mean > populationMean ? "+" : ""}{(sample.mean - populationMean).toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </VisualizationSection>
  );
};

// Central Limit Theorem Demo (based on 5-1-3)
const CentralLimitTheoremDemo = () => {
  const [popMean, setPopMean] = useState(50);
  const [popSD, setPopSD] = useState(10);
  const [sampleSize, setSampleSize] = useState(30);
  const [sampleMeans, setSampleMeans] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [insights, setInsights] = useState([]);
  const svgRef = useRef(null);
  const intervalRef = useRef(null);
  
  const theoreticalSE = popSD / Math.sqrt(sampleSize);
  
  const takeSample = useCallback(() => {
    const sample = Array.from({ length: sampleSize }, () => 
      d3.randomNormal(popMean, popSD)()
    );
    const mean = d3.mean(sample);
    setSampleMeans(prev => [...prev, mean]);
    
    // Add insights at milestones
    const count = sampleMeans.length + 1;
    if (count === 10) {
      setInsights(prev => [...prev, "After 10 samples, the pattern begins to emerge..."]);
    } else if (count === 50) {
      setInsights(prev => [...prev, "With 50 samples, the normal shape becomes clearer!"]);
    } else if (count === 100) {
      setInsights(prev => [...prev, "At 100 samples, the Central Limit Theorem is in full effect!"]);
    }
  }, [popMean, popSD, sampleSize, sampleMeans.length]);
  
  const startContinuousSampling = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(takeSample, 100);
  };
  
  const stopContinuousSampling = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  const reset = () => {
    stopContinuousSampling();
    setSampleMeans([]);
    setInsights([]);
  };
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    if (sampleMeans.length === 0) return;
    
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    
    const xScale = d3.scaleLinear()
      .domain([popMean - 4 * theoreticalSE, popMean + 4 * theoreticalSE])
      .range([margin.left, width - margin.right]);
    
    const bins = d3.histogram()
      .domain(xScale.domain())
      .thresholds(30)(sampleMeans);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
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
      .attr("y", d => yScale(d.length))
      .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
      .attr("height", d => height - margin.bottom - yScale(d.length))
      .attr("fill", chapterColors.primary)
      .attr("opacity", 0.7);
    
    // Draw theoretical normal curve
    if (sampleMeans.length > 20) {
      const normalPdf = (x, mean, sd) => {
        const variance = sd * sd;
        return (1 / Math.sqrt(2 * Math.PI * variance)) * 
               Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
      };
      
      const lineData = d3.range(xScale.domain()[0], xScale.domain()[1], 0.5).map(x => ({
        x: x,
        y: normalPdf(x, popMean, theoreticalSE) * sampleMeans.length * (bins[0].x1 - bins[0].x0)
      }));
      
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveBasis);
      
      svg.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", chapterColors.secondary)
        .attr("stroke-width", 2)
        .attr("d", line)
        .attr("opacity", 0.8);
    }
    
    // Add mean line
    svg.append("line")
      .attr("x1", xScale(popMean))
      .attr("x2", xScale(popMean))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("opacity", 0.5);
  }, [sampleMeans, popMean, theoreticalSE]);
  
  const empiricalMean = sampleMeans.length > 0 ? d3.mean(sampleMeans) : 0;
  const empiricalSE = sampleMeans.length > 0 ? d3.deviation(sampleMeans) : 0;
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">Central Limit Theorem in Action</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <GraphContainer>
          <svg ref={svgRef} width="100%" height="300" viewBox="0 0 600 300" />
        </GraphContainer>
        
        <div className="space-y-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-300 mb-2">Sampling Distribution Properties</h4>
            <div className="space-y-2 text-sm">
              <p>Samples taken: {sampleMeans.length}</p>
              <p>Mean of sample means: {empiricalMean.toFixed(2)}</p>
              <p>SD of sample means: {empiricalSE.toFixed(2)}</p>
              <p>Theoretical SE: {theoreticalSE.toFixed(2)}</p>
              {sampleMeans.length > 20 && (
                <p className="text-emerald-400">
                  Error: {Math.abs(empiricalSE - theoreticalSE).toFixed(3)}
                </p>
              )}
            </div>
          </div>
          
          {insights.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-300">Insights</h4>
              <AnimatePresence>
                {insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-900/20 rounded p-2 text-sm border border-emerald-700/50"
                  >
                    <Sparkles className="inline w-4 h-4 mr-1 text-emerald-400" />
                    {insight}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      
      <ControlGroup>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Population Mean: {popMean}
            </label>
            <input
              type="range"
              min="20"
              max="80"
              value={popMean}
              onChange={(e) => setPopMean(Number(e.target.value))}
              className="w-full"
              disabled={isRunning}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Population SD: {popSD}
            </label>
            <input
              type="range"
              min="5"
              max="20"
              value={popSD}
              onChange={(e) => setPopSD(Number(e.target.value))}
              className="w-full"
              disabled={isRunning}
            />
          </div>
          
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
              disabled={isRunning}
            />
          </div>
        </div>
        
        <div className="flex gap-4 mt-4">
          <button
            onClick={takeSample}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Take One Sample
          </button>
          
          {!isRunning ? (
            <button
              onClick={startContinuousSampling}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Zap size={16} />
              Start Sampling
            </button>
          ) : (
            <button
              onClick={stopContinuousSampling}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop Sampling
            </button>
          )}
          
          <button
            onClick={reset}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>
      </ControlGroup>
    </VisualizationSection>
  );
};

// Point Estimation with Monte Carlo (based on 5-1-4)
const PointEstimationMonteCarlo = () => {
  const canvasRef = useRef(null);
  const [inside, setInside] = useState(0);
  const [total, setTotal] = useState(0);
  const [isDropping, setIsDropping] = useState(false);
  const animationRef = useRef(null);
  
  const piEstimate = total > 0 ? (4 * inside / total) : 0;
  const error = Math.abs(Math.PI - piEstimate);
  
  const dropSamples = useCallback((count) => {
    if (isDropping) return;
    
    setIsDropping(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 300;
    const radius = size / 2;
    
    let dropped = 0;
    let insideCount = 0;
    
    const dropOne = () => {
      if (dropped >= count) {
        setIsDropping(false);
        setInside(prev => prev + insideCount);
        setTotal(prev => prev + count);
        return;
      }
      
      const x = Math.random() * size;
      const y = Math.random() * size;
      const distance = Math.sqrt(Math.pow(x - radius, 2) + Math.pow(y - radius, 2));
      const isInside = distance <= radius;
      
      if (isInside) {
        insideCount++;
        ctx.fillStyle = chapterColors.primary;
      } else {
        ctx.fillStyle = chapterColors.secondary;
      }
      
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
      
      dropped++;
      animationRef.current = requestAnimationFrame(dropOne);
    };
    
    dropOne();
  }, [isDropping, inside, total]);
  
  const reset = () => {
    setInside(0);
    setTotal(0);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawBase(ctx);
  };
  
  const drawBase = (ctx) => {
    const size = 300;
    const radius = size / 2;
    
    ctx.clearRect(0, 0, size, size);
    
    // Draw square
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, size, size);
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.stroke();
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawBase(ctx);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">Point Estimation: Estimating π</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GraphContainer>
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={300} 
            className="mx-auto border border-gray-700 rounded"
          />
        </GraphContainer>
        
        <div className="space-y-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-300 mb-2">Monte Carlo Method</h4>
            <div className="space-y-2 text-sm">
              <p>Points inside circle: {inside}</p>
              <p>Total points: {total}</p>
              <p className="text-lg font-semibold">
                π̂ = {piEstimate.toFixed(6)}
              </p>
              <p className="text-emerald-400">
                Actual π = {Math.PI.toFixed(6)}
              </p>
              <p className="text-red-400">
                Error = {error.toFixed(6)}
              </p>
            </div>
          </div>
          
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-300 mb-2">The Mathematics</h4>
            <div className="text-sm space-y-1">
              <p>Area of circle = πr²</p>
              <p>Area of square = 4r²</p>
              <p>Ratio = π/4</p>
              <p className="text-emerald-400 mt-2">π = 4 × (points inside) / (total points)</p>
            </div>
          </div>
        </div>
      </div>
      
      <ControlGroup>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => dropSamples(100)}
            disabled={isDropping}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Drop 100 Points
          </button>
          
          <button
            onClick={() => dropSamples(1000)}
            disabled={isDropping}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            Drop 1000 Points
          </button>
          
          <button
            onClick={reset}
            disabled={isDropping}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Reset
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          <p>This demonstrates how random sampling can estimate unknown parameters. As we increase the sample size, our estimate becomes more accurate - a key principle in statistical inference.</p>
        </div>
      </ControlGroup>
    </VisualizationSection>
  );
};

// Bayesian Inference Demo (simplified from 5-1-1)
const BayesianInferenceDemo = () => {
  const [prior, setPrior] = useState(0.01);
  const [sensitivity, setSensitivity] = useState(0.95);
  const [specificity, setSpecificity] = useState(0.90);
  const contentRef = useRef(null);
  
  // Calculate posterior probabilities
  const falsePositiveRate = 1 - specificity;
  const probPositive = prior * sensitivity + (1 - prior) * falsePositiveRate;
  const posterior = probPositive > 0 ? (prior * sensitivity) / probPositive : 0;
  
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
  }, [prior, sensitivity, specificity]);
  
  return (
    <VisualizationSection>
      <h3 className="text-xl font-bold text-white mb-4">Bayesian Inference: Medical Testing</h3>
      
      <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-300 mb-2">Bayes' Theorem</h4>
            <div className="text-center my-4">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[P(D|+) = \\frac{P(+|D) \\cdot P(D)}{P(+)}\\]` 
              }} />
            </div>
            <p className="text-xs text-gray-400">
              Posterior = (Likelihood × Prior) / Evidence
            </p>
          </div>
          
          <ControlGroup>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Prior Probability P(Disease): {(prior * 100).toFixed(1)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.1"
                  step="0.001"
                  value={prior}
                  onChange={(e) => setPrior(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Sensitivity P(+|Disease): {(sensitivity * 100).toFixed(1)}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.01"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Specificity P(-|Healthy): {(specificity * 100).toFixed(1)}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.01"
                  value={specificity}
                  onChange={(e) => setSpecificity(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </ControlGroup>
        </div>
        
        <div className="space-y-4">
          <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50">
            <h4 className="font-semibold text-emerald-400 mb-2">Results</h4>
            <div className="space-y-2 text-sm">
              <p>P(+) = {(probPositive * 100).toFixed(2)}%</p>
              <p className="text-lg font-semibold">
                P(Disease|+) = {(posterior * 100).toFixed(2)}%
              </p>
            </div>
          </div>
          
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-300 mb-2">Interpretation</h4>
            <p className="text-sm">
              Out of 100 people who test positive, approximately{' '}
              <span className="text-emerald-400 font-semibold">
                {Math.round(posterior * 100)}
              </span>{' '}
              actually have the disease.
            </p>
            {posterior < 0.5 && (
              <p className="text-sm text-yellow-400 mt-2">
                Note: Even with a positive test, the probability of having the disease is less than 50%!
              </p>
            )}
          </div>
          
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-300 mb-2">Key Insight</h4>
            <p className="text-sm text-gray-400">
              The posterior probability depends heavily on the prior probability. 
              For rare diseases, even accurate tests can produce many false positives.
            </p>
          </div>
        </div>
      </div>
    </VisualizationSection>
  );
};

// Main Component
export default function StatisticalInference() {
  return (
    <VisualizationContainer
      title="5.1 Statistical Inference"
      description="Master the art of drawing conclusions about populations from sample data"
    >
      <BackToHub chapter={5} />
      
      <InferenceIntroduction />
      
      <PopulationSampleOverview />
      
      <CentralLimitTheoremDemo />
      
      <PointEstimationMonteCarlo />
      
      <BayesianInferenceDemo />
      
      <VisualizationSection>
        <h3 className="text-xl font-bold text-white mb-4">Key Takeaways</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-400 mb-2">Frequentist Approach</h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Sample statistics estimate population parameters</li>
              <li>• Larger samples provide more precise estimates</li>
              <li>• The CLT guarantees normality of sample means</li>
              <li>• Standard error quantifies estimation uncertainty</li>
            </ul>
          </div>
          
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">Bayesian Approach</h4>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Combines prior knowledge with new data</li>
              <li>• Updates beliefs based on evidence</li>
              <li>• Provides intuitive probability statements</li>
              <li>• Essential for rare event analysis</li>
            </ul>
          </div>
        </div>
      </VisualizationSection>
    </VisualizationContainer>
  );
}