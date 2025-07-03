'use client';
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { jStat } from 'jstat';
import { ArrowRight, Sparkles, TrendingUp, Zap, Activity, TrendingDown, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { VisualizationContainer, GraphContainer } from '@/components/ui/VisualizationContainer';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { cn } from '../../../lib/utils';
import { VisualizationSection } from '@/components/ui/VisualizationContainer';

const CLTPropertiesMerged = () => {
  const [showTransformation, setShowTransformation] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);
  const [sampleSize, setSampleSize] = useState(5);
  const [isAnimating, setIsAnimating] = useState(false);
  const transformationRef = useRef(null);
  const sizeComparisonRef = useRef(null);
  const animationFrameRef = useRef(null);
  const contentRef = useRef(null);

  // MathJax processing
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== 'undefined' && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [showTransformation, animationStage]);

  // Animation for CLT transformation
  useEffect(() => {
    if (showTransformation && transformationRef.current) {
      animateCLTTransformation();
    }
  }, [showTransformation]);

  // Animation for sample size comparison
  useEffect(() => {
    if (animationStage === 1 && sizeComparisonRef.current) {
      animateSizeComparison();
    }
  }, [animationStage, sampleSize]);

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const animateCLTTransformation = () => {
    const svg = d3.select(transformationRef.current);
    const width = 700;
    const height = 350;
    const margin = { top: 30, right: 30, bottom: 50, left: 30 };

    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Dark background with subtle gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'bg-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0f172a');
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#1e293b');

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#bg-gradient)');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const plotWidth = (width - margin.left - margin.right) / 2 - 40;
    const plotHeight = height - margin.top - margin.bottom;

    const leftPlot = g.append('g');
    const rightPlot = g.append('g')
      .attr('transform', `translate(${plotWidth + 80}, 0)`);

    // Generate exponential data
    const exponentialData = Array(1000).fill(0).map(() => -Math.log(1 - Math.random()) * 50);
    
    const leftBins = d3.bin()
      .domain([0, 200])
      .thresholds(25)(exponentialData);

    const xLeft = d3.scaleLinear()
      .domain([0, 200])
      .range([0, plotWidth]);

    const yLeft = d3.scaleLinear()
      .domain([0, d3.max(leftBins, d => d.length)])
      .range([plotHeight, 0]);

    // Left plot title
    leftPlot.append('text')
      .attr('x', plotWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '16px')
      .style('fill', '#facc15')
      .text('Original Distribution')
      .style('opacity', 0)
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Animated bars for original distribution
    leftPlot.selectAll('.bar')
      .data(leftBins)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xLeft(d.x0))
      .attr('y', plotHeight)
      .attr('width', d => xLeft(d.x1) - xLeft(d.x0) - 1)
      .attr('height', 0)
      .attr('fill', '#fbbf24')
      .attr('opacity', 0.8)
      .transition()
      .duration(800)
      .delay((d, i) => i * 20)
      .attr('y', d => yLeft(d.length))
      .attr('height', d => plotHeight - yLeft(d.length));

    // Generate sample means
    const sampleMeans = [];
    for (let i = 0; i < 500; i++) {
      const sample = Array(30).fill(0).map(() => exponentialData[Math.floor(Math.random() * exponentialData.length)]);
      sampleMeans.push(d3.mean(sample));
    }

    // Animated arrow
    setTimeout(() => {
      const arrow = g.append('g')
        .attr('transform', `translate(${plotWidth + 20}, ${plotHeight / 2})`);

      // Glowing arrow effect
      const arrowGlow = arrow.append('path')
        .attr('d', 'M 0,0 L 40,0')
        .attr('stroke', '#60a5fa')
        .attr('stroke-width', 4)
        .attr('opacity', 0.3)
        .attr('filter', 'blur(4px)');

      arrow.append('path')
        .attr('d', 'M 0,0 L 40,0')
        .attr('stroke', '#60a5fa')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)')
        .attr('stroke-dasharray', '40')
        .attr('stroke-dashoffset', '40')
        .transition()
        .duration(600)
        .attr('stroke-dashoffset', '0');

      // Pulse animation for arrow
      arrowGlow.transition()
        .duration(1000)
        .attr('opacity', 0.6)
        .transition()
        .duration(1000)
        .attr('opacity', 0.3)
        .on('end', function repeat() {
          d3.select(this)
            .transition()
            .duration(1000)
            .attr('opacity', 0.6)
            .transition()
            .duration(1000)
            .attr('opacity', 0.3)
            .on('end', repeat);
        });

      svg.select('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('refX', 10)
        .attr('refY', 5)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0,0 10,5 0,10')
        .attr('fill', '#60a5fa');

      // "CLT Magic" text
      arrow.append('text')
        .attr('x', 20)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#60a5fa')
        .style('font-weight', 'bold')
        .text('CLT')
        .style('opacity', 0)
        .transition()
        .delay(300)
        .duration(300)
        .style('opacity', 1);
    }, 1000);

    // Right plot - sampling distribution
    setTimeout(() => {
      const rightBins = d3.bin()
        .domain([d3.min(sampleMeans) - 5, d3.max(sampleMeans) + 5])
        .thresholds(25)(sampleMeans);

      const xRight = d3.scaleLinear()
        .domain([rightBins[0].x0, rightBins[rightBins.length - 1].x1])
        .range([0, plotWidth]);

      const yRight = d3.scaleLinear()
        .domain([0, d3.max(rightBins, d => d.length)])
        .range([plotHeight, 0]);

      // Right plot title
      rightPlot.append('text')
        .attr('x', plotWidth / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .style('font-size', '16px')
        .style('fill', '#34d399')
        .text('Sampling Distribution (n=30)')
        .style('opacity', 0)
        .transition()
        .duration(500)
        .style('opacity', 1);

      // Animated bars for sampling distribution
      rightPlot.selectAll('.bar')
        .data(rightBins)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xRight(d.x0))
        .attr('y', plotHeight)
        .attr('width', d => xRight(d.x1) - xRight(d.x0) - 1)
        .attr('height', 0)
        .attr('fill', '#34d399')
        .attr('opacity', 0.8)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 30)
        .attr('y', d => yRight(d.length))
        .attr('height', d => plotHeight - yRight(d.length));

      // Normal curve overlay
      const mean = d3.mean(sampleMeans);
      const std = d3.deviation(sampleMeans);
      const xValues = d3.range(xRight.domain()[0], xRight.domain()[1], 0.1);
      
      const line = d3.line()
        .x(d => xRight(d))
        .y(d => {
          const density = (1 / (std * Math.sqrt(2 * Math.PI))) * 
            Math.exp(-0.5 * Math.pow((d - mean) / std, 2));
          return yRight(density * sampleMeans.length * (rightBins[0].x1 - rightBins[0].x0));
        })
        .curve(d3.curveBasis);

      setTimeout(() => {
        const path = rightPlot.append('path')
          .datum(xValues)
          .attr('fill', 'none')
          .attr('stroke', '#fff')
          .attr('stroke-width', 3)
          .attr('d', line)
          .attr('opacity', 0);

        const totalLength = path.node().getTotalLength();
        
        path
          .attr('stroke-dasharray', totalLength + ' ' + totalLength)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(1500)
          .attr('opacity', 1)
          .attr('stroke-dashoffset', 0)
          .on('end', () => {
            // Glow effect on completion
            path.transition()
              .duration(500)
              .attr('filter', 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))')
              .transition()
              .duration(500)
              .attr('filter', 'none');
          });

        // "Normal!" label
        rightPlot.append('text')
          .attr('x', xRight(mean))
          .attr('y', yRight.range()[0] / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('fill', '#fff')
          .style('font-weight', 'bold')
          .text('Normal!')
          .style('opacity', 0)
          .transition()
          .delay(1500)
          .duration(500)
          .style('opacity', 1);
      }, 1500);

      // Trigger next animation stage
      setTimeout(() => setAnimationStage(1), 3500);
    }, 1800);
  };

  const animateSampleSizeTransition = () => {
    let currentSize = sampleSize;
    const targetSize = 100;
    const duration = 4000; // 4 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const easedProgress = easeInOutCubic(progress);
      
      currentSize = 5 + (targetSize - 5) * easedProgress;
      setSampleSize(Math.round(currentSize));
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        // Reset after completion
        setTimeout(() => {
          setSampleSize(5);
        }, 2000);
      }
    };
    
    setIsAnimating(true);
    animate();
  };

  const animateSizeComparison = () => {
    const svg = d3.select(sizeComparisonRef.current);
    const width = 700;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 40 };

    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Gradient background
    const defs = svg.append('defs');
    const bgGradient = defs.append('linearGradient')
      .attr('id', 'size-bg-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    
    bgGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0f172a');
    
    bgGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#1e293b');

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#size-bg-gradient)');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Generate sampling distribution data
    const populationMean = 50;
    const populationSD = 15;
    const means = [];
    
    for (let i = 0; i < 1000; i++) {
      let sum = 0;
      for (let j = 0; j < sampleSize; j++) {
        sum += jStat.normal.sample(populationMean, populationSD);
      }
      means.push(sum / sampleSize);
    }

    // Scales
    const extent = [populationMean - 4 * populationSD, populationMean + 4 * populationSD];
    const x = d3.scaleLinear()
      .domain(extent)
      .range([0, innerWidth]);

    const histogram = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(40));

    const bins = histogram(means);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([innerHeight, 0]);

    // Color gradient for bars
    const barGradient = defs.append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    
    const color = d3.scaleSequential(d3.interpolateViridis)
      .domain([5, 100]);
    
    barGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color(sampleSize))
      .attr('stop-opacity', 1);
    
    barGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d3.color(color(sampleSize)).darker(1))
      .attr('stop-opacity', 0.8);

    // Title with sample size
    const title = g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .style('fill', '#fff');
    
    // Animated title update
    title.append('tspan')
      .text('n = ');
    
    const sizeText = title.append('tspan')
      .attr('fill', color(sampleSize))
      .style('font-size', '28px')
      .text(sampleSize);

    // Histogram bars with smooth transitions
    const barGroup = g.append('g');
    
    const bars = barGroup.selectAll('.bar')
      .data(bins)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.x0) + 1)
      .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 2))
      .attr('y', innerHeight)
      .attr('height', 0)
      .attr('fill', 'url(#bar-gradient)')
      .attr('opacity', 0.9);
    
    bars.transition()
      .duration(300)
      .attr('y', d => y(d.length))
      .attr('height', d => innerHeight - y(d.length));

    // Normal curve overlay
    const se = populationSD / Math.sqrt(sampleSize);
    const normalData = d3.range(extent[0], extent[1], 0.5).map(xVal => ({
      x: xVal,
      y: jStat.normal.pdf(xVal, populationMean, se) * means.length * (bins[0].x1 - bins[0].x0)
    }));
    
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    const curvePath = g.append('path')
      .datum(normalData)
      .attr('fill', 'none')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('d', line)
      .attr('opacity', 0);
    
    curvePath.transition()
      .delay(300)
      .duration(500)
      .attr('opacity', 1);

    // Standard error visualization
    const seGroup = g.append('g')
      .attr('opacity', 0);
    
    const seLeft = x(populationMean - se);
    const seRight = x(populationMean + se);
    
    // SE shaded area
    seGroup.append('rect')
      .attr('x', seLeft)
      .attr('width', seRight - seLeft)
      .attr('y', 0)
      .attr('height', innerHeight)
      .attr('fill', color(sampleSize))
      .attr('opacity', 0.1);
    
    // SE bracket
    const bracketY = innerHeight + 25;
    seGroup.append('line')
      .attr('x1', seLeft)
      .attr('x2', seRight)
      .attr('y1', bracketY)
      .attr('y2', bracketY)
      .attr('stroke', color(sampleSize))
      .attr('stroke-width', 2);
    
    seGroup.append('text')
      .attr('x', (seLeft + seRight) / 2)
      .attr('y', bracketY + 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', color(sampleSize))
      .text(`SE = ${se.toFixed(2)}`);
    
    seGroup.transition()
      .delay(500)
      .duration(500)
      .attr('opacity', 1);

    // Mean line
    g.append('line')
      .attr('x1', x(populationMean))
      .attr('x2', x(populationMean))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#fbbf24')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0)
      .transition()
      .delay(300)
      .duration(500)
      .attr('opacity', 0.8);

    // X-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(8))
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .attr('opacity', 0.5)
      .selectAll('text')
      .style('fill', '#94a3b8');
  };

  return (
    <VisualizationSection>
      <div ref={contentRef} className="space-y-8">
        <h2 className="text-3xl font-bold text-blue-400 mb-4">Central Limit Theorem & Sampling Distribution Properties</h2>
        {/* CLT Introduction */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-8 border border-blue-600/30">
          <div className="flex items-start gap-4 mb-6">
            <Sparkles className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-blue-400 mb-3">The Magic of the Central Limit Theorem</h2>
              <p className="text-neutral-300 leading-relaxed">
                One of the most remarkable results in statistics: no matter what shape your original 
                distribution has, the distribution of sample means approaches a normal distribution 
                as sample size increases.
              </p>
            </div>
          </div>

          <AnimatePresence>
            {!showTransformation ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Button
                  onClick={() => setShowTransformation(true)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  See the Transformation
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <GraphContainer height="350px" className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg border border-blue-600/30">
                  <svg ref={transformationRef} style={{ width: '100%', height: 350 }} />
                </GraphContainer>
                
                {animationStage >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-semibold text-teal-400 text-center">
                      How Sample Size Affects the Distribution
                    </h3>
                    
                    <div className="flex flex-col items-center space-y-4">
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={animateSampleSizeTransition}
                          disabled={isAnimating}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-2"
                        >
                          {isAnimating ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              Animating...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Animate Transition
                            </>
                          )}
                        </Button>
                        
                        <div className="text-sm text-neutral-400">
                          Or adjust manually:
                        </div>
                        
                        <RangeSlider
                          value={sampleSize}
                          onChange={setSampleSize}
                          min={5}
                          max={100}
                          step={1}
                          disabled={isAnimating}
                          className="w-48"
                        />
                      </div>
                      
                      <GraphContainer height="400px" className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg border border-blue-600/30 w-full">
                        <svg ref={sizeComparisonRef} style={{ width: '100%', height: 400 }} />
                      </GraphContainer>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-neutral-900/50 rounded-lg border border-blue-600/20">
                          <div className="text-sm text-neutral-400">Sample Size</div>
                          <div className="text-2xl font-bold text-white">n = {sampleSize}</div>
                        </div>
                        <div className="p-4 bg-neutral-900/50 rounded-lg border border-blue-600/20">
                          <div className="text-sm text-neutral-400">Standard Error</div>
                          <div className="text-2xl font-bold text-blue-400">SE = {(15 / Math.sqrt(sampleSize)).toFixed(2)}</div>
                        </div>
                        <div className="p-4 bg-neutral-900/50 rounded-lg border border-blue-600/20">
                          <div className="text-sm text-neutral-400">Shape</div>
                          <div className="text-xl font-bold text-green-400">
                            {sampleSize < 30 ? 'Approaching' : 'Normal'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Key Properties */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-600/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-green-400" />
                <h4 className="text-lg font-bold text-green-400">Shape Normalization</h4>
              </div>
              <p className="text-sm text-neutral-300 mb-4">
                As n increases, the sampling distribution becomes increasingly normal, 
                even if the population is skewed.
              </p>
              <div className="p-4 bg-neutral-900 rounded-lg border border-green-600/20">
                <div className="text-xs font-mono text-neutral-400 mb-2">Rule of Thumb:</div>
                <div className="text-lg font-bold text-white">n ≥ 30 → Normal</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-600/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingDown className="w-6 h-6 text-purple-400" />
                <h4 className="text-lg font-bold text-purple-400">Variance Reduction</h4>
              </div>
              <p className="text-sm text-neutral-300 mb-4">
                The spread decreases with the square root of sample size. Larger samples 
                give more precise estimates.
              </p>
              <div className="p-4 bg-neutral-900 rounded-lg border border-purple-600/20">
                <div className="text-xs font-mono text-neutral-400 mb-2">Standard Error:</div>
                <div className="text-lg font-bold text-white">
                  <span dangerouslySetInnerHTML={{ __html: `\\(\\text{SE} = \\sigma/\\sqrt{n}\\)` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-600/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
                <h4 className="text-lg font-bold text-blue-400">√n Relationship</h4>
              </div>
              <p className="text-sm text-neutral-300 mb-4">
                To cut the standard error in half, you need 4× the sample size. 
                This is the law of diminishing returns.
              </p>
              <div className="p-4 bg-neutral-900 rounded-lg border border-blue-600/20">
                <div className="text-xs font-mono text-neutral-400 mb-2">Example:</div>
                <div className="text-lg font-bold text-white">n: 25→100, SE: ÷2</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mathematical Foundation */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-neutral-800 border-blue-600/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-teal-400 mb-4">Formal Statement</h3>
              <div className="space-y-4">
                <div className="p-4 bg-neutral-900 rounded-lg font-mono text-sm border border-blue-600/20">
                  <p className="mb-2">If <span dangerouslySetInnerHTML={{ __html: `\\(X_1, X_2, ..., X_n\\)` }} /> are i.i.d. with:</p>
                  <p className="ml-4 text-neutral-300">• <span dangerouslySetInnerHTML={{ __html: `\\(E[X_i] = \\mu\\)` }} /></p>
                  <p className="ml-4 text-neutral-300">• <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X_i) = \\sigma^2 < \\infty\\)` }} /></p>
                  <p className="mt-3">Then as <span dangerouslySetInnerHTML={{ __html: `\\(n \\to \\infty\\)` }} />:</p>
                  <p className="ml-4 text-green-400 font-semibold text-base">
                    <span dangerouslySetInnerHTML={{ __html: `\\(\\sqrt{n}(\\bar{X}_n - \\mu)/\\sigma \\to N(0, 1)\\)` }} />
                  </p>
                </div>
                <p className="text-neutral-400 text-sm">
                  In practice, n ≥ 30 often gives a good approximation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-800 border-blue-600/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-teal-400 mb-4">Key Formulas</h3>
              <div className="space-y-3">
                <div className="p-3 bg-neutral-900 rounded-lg border border-blue-600/20">
                  <div className="text-neutral-400 text-sm mb-1">Mean of sampling distribution:</div>
                  <div className="font-mono text-white text-lg">
                    <span dangerouslySetInnerHTML={{ __html: `\\(\\mu_{\\bar{x}} = \\mu\\)` }} />
                  </div>
                </div>
                <div className="p-3 bg-neutral-900 rounded-lg border border-blue-600/20">
                  <div className="text-neutral-400 text-sm mb-1">Standard error of the mean:</div>
                  <div className="font-mono text-white text-lg">
                    <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma_{\\bar{x}} = \\sigma/\\sqrt{n}\\)` }} />
                  </div>
                </div>
                <div className="p-3 bg-neutral-900 rounded-lg border border-blue-600/20">
                  <div className="text-neutral-400 text-sm mb-1">Distribution shape (CLT):</div>
                  <div className="font-mono text-white text-lg">
                    <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{X} \\sim N(\\mu, \\sigma^2/n)\\)` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Conditions */}
        <Card className="bg-neutral-800 border-blue-600/30">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-teal-400 mb-6">CLT Conditions</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0 border border-blue-600/30">
                  <span className="text-sm font-bold text-blue-400">1</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Independence</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    Observations must be independent
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0 border border-blue-600/30">
                  <span className="text-sm font-bold text-blue-400">2</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Identical Distribution</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    All observations from same distribution
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0 border border-blue-600/30">
                  <span className="text-sm font-bold text-blue-400">3</span>
                </div>
                <div>
                  <p className="font-semibold text-white">Finite Variance</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    The variance must exist and be finite
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Practical Implications */}
        <Card className="bg-gradient-to-r from-neutral-900 to-neutral-800 border-blue-600/30">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">What This Means for You</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Precision vs Cost</p>
                    <p className="text-sm text-neutral-400">
                      Quadrupling sample size only doubles precision - balance your needs
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Universal Application</p>
                    <p className="text-sm text-neutral-400">
                      CLT justifies using normal-based methods even for non-normal data
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Faster for Symmetric Data</p>
                    <p className="text-sm text-neutral-400">
                      CLT works faster when the population is already symmetric
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Foundation of Inference</p>
                    <p className="text-sm text-neutral-400">
                      This theorem underpins confidence intervals and hypothesis testing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizationSection>
  );
};

export default CLTPropertiesMerged;