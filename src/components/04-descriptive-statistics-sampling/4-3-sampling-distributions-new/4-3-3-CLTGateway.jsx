import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import * as d3 from 'd3';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { VisualizationSection } from '@/components/ui/VisualizationContainer';
import { useSafeMathJax } from '../../../utils/mathJaxFix';

const CLTGateway = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const svgRef = useRef(null);
  const contentRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  useSafeMathJax(contentRef);

  useEffect(() => {
    // Start animation immediately when component mounts
    if (svgRef.current) {
      animateTransformation();
    }
    
    // Cleanup on unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const animateTransformation = () => {
    if (!svgRef.current) return;
    
    setIsAnimating(true);
    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 20 };

    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const plotWidth = (width - margin.left - margin.right) / 2 - 30;
    const plotHeight = height - margin.top - margin.bottom;

    const leftPlot = g.append('g');
    const rightPlot = g.append('g')
      .attr('transform', `translate(${plotWidth + 60}, 0)`);

    const exponentialData = Array(1000).fill(0).map(() => -Math.log(1 - Math.random()) * 50);
    
    const leftBins = d3.bin()
      .domain([0, 200])
      .thresholds(20)(exponentialData);

    const xLeft = d3.scaleLinear()
      .domain([0, 200])
      .range([0, plotWidth]);

    const yLeft = d3.scaleLinear()
      .domain([0, d3.max(leftBins, d => d.length)])
      .range([plotHeight, 0]);

    leftPlot.append('text')
      .attr('x', plotWidth / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('fill', '#94A3B8')
      .text('Original Distribution');

    leftPlot.selectAll('.bar')
      .data(leftBins)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xLeft(d.x0))
      .attr('y', d => yLeft(d.length))
      .attr('width', d => xLeft(d.x1) - xLeft(d.x0) - 1)
      .attr('height', d => plotHeight - yLeft(d.length))
      .attr('fill', '#F87171')
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .attr('opacity', 0.7);

    const sampleMeans = [];
    for (let i = 0; i < 500; i++) {
      const sample = Array(30).fill(0).map(() => exponentialData[Math.floor(Math.random() * exponentialData.length)]);
      sampleMeans.push(d3.mean(sample));
    }

    setTimeout(() => {
      const arrow = g.append('g')
        .attr('transform', `translate(${plotWidth + 10}, ${plotHeight / 2})`);

      arrow.append('path')
        .attr('d', 'M 0,0 L 40,0')
        .attr('stroke', '#94A3B8')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)')
        .attr('stroke-dasharray', '40')
        .attr('stroke-dashoffset', '40')
        .transition()
        .duration(500)
        .attr('stroke-dashoffset', '0');

      svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('refX', 10)
        .attr('refY', 5)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0,0 10,5 0,10')
        .attr('fill', '#94A3B8');
    }, 700);

    setTimeout(() => {
      const rightBins = d3.bin()
        .domain([d3.min(sampleMeans) - 5, d3.max(sampleMeans) + 5])
        .thresholds(20)(sampleMeans);

      const xRight = d3.scaleLinear()
        .domain([rightBins[0].x0, rightBins[rightBins.length - 1].x1])
        .range([0, plotWidth]);

      const yRight = d3.scaleLinear()
        .domain([0, d3.max(rightBins, d => d.length)])
        .range([plotHeight, 0]);

      rightPlot.append('text')
        .attr('x', plotWidth / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .style('fill', '#94A3B8')
        .text('Sampling Distribution (n=30)');

      rightPlot.selectAll('.bar')
        .data(rightBins)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xRight(d.x0))
        .attr('y', plotHeight)
        .attr('width', d => xRight(d.x1) - xRight(d.x0) - 1)
        .attr('height', 0)
        .attr('fill', '#34D399')
        .attr('opacity', 0.7)
        .transition()
        .duration(800)
        .delay((d, i) => i * 20)
        .attr('y', d => yRight(d.length))
        .attr('height', d => plotHeight - yRight(d.length));

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
        rightPlot.append('path')
          .datum(xValues)
          .attr('fill', 'none')
          .attr('stroke', '#60A5FA')
          .attr('stroke-width', 3)
          .attr('d', line)
          .attr('opacity', 0)
          .transition()
          .duration(1000)
          .attr('opacity', 1)
          .on('end', () => {
            // After animation completes, wait 3 seconds then restart
            setIsAnimating(false);
            animationTimeoutRef.current = setTimeout(() => {
              animateTransformation();
            }, 3000);
          });
      }, 1000);
    }, 1200);
  };

  return (
    <VisualizationSection>
      <div className="space-y-8" ref={contentRef}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-400 mb-4">Central Limit Theorem Gateway</h1>
        <p className="text-lg text-neutral-300">
          How does any distribution become normal?
        </p>
      </div>

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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-neutral-800 rounded-lg p-6 border border-blue-600/30"
        >
          <svg ref={svgRef} width="600" height="300" className="w-full" />
          <p className="text-center text-sm text-neutral-400 mt-4">
            Watch how an exponential distribution transforms into a normal distribution!
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-neutral-800 rounded-xl p-6 border border-blue-600/30">
          <h3 className="text-xl font-semibold text-teal-400 mb-4">Formal Statement</h3>
          <div className="space-y-4">
            <div 
              className="p-4 bg-neutral-900 rounded-lg font-mono text-sm border border-blue-600/20"
              dangerouslySetInnerHTML={{
                __html: `
                  <p class="mb-2">If \\(X_1, X_2, ..., X_n\\) are i.i.d. with:</p>
                  <p class="ml-4">• \\(E[X_i] = \\mu\\)</p>
                  <p class="ml-4">• \\(\\text{Var}(X_i) = \\sigma^2 < \\infty\\)</p>
                  <p class="mt-2">Then as \\(n \\to \\infty\\):</p>
                  <p class="ml-4 text-green-400 font-semibold">
                    \\(\\frac{\\sqrt{n}(\\bar{X}_n - \\mu)}{\\sigma} \\to N(0, 1)\\)
                  </p>
                `
              }}
            />
            <p className="text-neutral-400">
              In practice, n ≥ 30 often gives a good approximation.
            </p>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-xl p-6 border border-blue-600/30">
          <h3 className="text-xl font-semibold text-teal-400 mb-4">Key Conditions</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-600/30">
                <span className="text-xs font-bold text-blue-400">1</span>
              </div>
              <div>
                <p className="font-medium">Independence</p>
                <p className="text-sm text-neutral-400">
                  Observations must be independent
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-600/30">
                <span className="text-xs font-bold text-blue-400">2</span>
              </div>
              <div>
                <p className="font-medium">Identical Distribution</p>
                <p className="text-sm text-neutral-400">
                  All observations from same distribution
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-600/30">
                <span className="text-xs font-bold text-blue-400">3</span>
              </div>
              <div>
                <p className="font-medium">Finite Variance</p>
                <p className="text-sm text-neutral-400">
                  The variance must exist and be finite
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-xl p-8 border border-blue-600/30">
        <div className="text-center space-y-4">
          <TrendingUp className="w-12 h-12 text-green-400 mx-auto" />
          <h3 className="text-2xl font-bold text-blue-400">Ready to Explore the Full Power of CLT?</h3>
          <p className="text-neutral-300 max-w-2xl mx-auto">
            Dive into our interactive CLT simulation where you can experiment with different 
            distributions, sample sizes, and see the theorem in action!
          </p>
          <Link
            href="/chapter4?section=central-limit-theorem"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-colors"
          >
            Explore the Full CLT Simulation
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-neutral-800 rounded-lg p-4 border border-blue-600/30">
          <h4 className="font-semibold text-yellow-400 mb-2">Beyond Sample Means</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            CLT applies to other statistics too: sample variance follows χ² distribution, 
            differences of means, and more.
          </p>
        </div>
        <div className="bg-neutral-800 rounded-lg p-4 border border-blue-600/30">
          <h4 className="font-semibold text-yellow-400 mb-2">Convergence Rates</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Berry-Esseen theorem gives bounds on how fast the convergence happens based on 
            the third moment.
          </p>
        </div>
        <div className="bg-neutral-800 rounded-lg p-4 border border-blue-600/30">
          <h4 className="font-semibold text-yellow-400 mb-2">Practical Impact</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            CLT justifies using normal-based inference methods even when data isn't normally 
            distributed.
          </p>
        </div>
      </div>
      </div>
    </VisualizationSection>
  );
};

export default CLTGateway;