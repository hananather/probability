import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import * as d3 from 'd3';
import { ArrowRight, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/button';

const CLTGateway = () => {
  const [showTeaser, setShowTeaser] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => {
    if (showTeaser && svgRef.current) {
      animateTransformation();
    }
  }, [showTeaser]);

  const animateTransformation = () => {
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
      .text('Original Distribution');

    leftPlot.selectAll('.bar')
      .data(leftBins)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => xLeft(d.x0))
      .attr('y', d => yLeft(d.length))
      .attr('width', d => xLeft(d.x1) - xLeft(d.x0) - 1)
      .attr('height', d => plotHeight - yLeft(d.length))
      .attr('fill', '#EF4444')
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
        .attr('stroke', '#6B7280')
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
        .attr('fill', '#6B7280');
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
        .text('Sampling Distribution (n=30)');

      rightPlot.selectAll('.bar')
        .data(rightBins)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xRight(d.x0))
        .attr('y', plotHeight)
        .attr('width', d => xRight(d.x1) - xRight(d.x0) - 1)
        .attr('height', 0)
        .attr('fill', '#10B981')
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
          .attr('stroke', '#1E40AF')
          .attr('stroke-width', 3)
          .attr('d', line)
          .attr('opacity', 0)
          .transition()
          .duration(1000)
          .attr('opacity', 1);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Central Limit Theorem Gateway</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          How does any distribution become normal?
        </p>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <Sparkles className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold mb-3">The Magic of the Central Limit Theorem</h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              One of the most remarkable results in statistics: no matter what shape your original 
              distribution has, the distribution of sample means approaches a normal distribution 
              as sample size increases.
            </p>
          </div>
        </div>

        {!showTeaser ? (
          <Button
            onClick={() => setShowTeaser(true)}
            size="lg"
            className="w-full sm:w-auto"
          >
            <Zap className="w-5 h-5 mr-2" />
            See the Transformation
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
          >
            <svg ref={svgRef} width="600" height="300" className="w-full" />
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Watch how an exponential distribution transforms into a normal distribution!
            </p>
          </motion.div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Formal Statement</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-sm">
              <p className="mb-2">If X₁, X₂, ..., Xₙ are i.i.d. with:</p>
              <p className="ml-4">• E[Xᵢ] = μ</p>
              <p className="ml-4">• Var(Xᵢ) = σ² &lt; ∞</p>
              <p className="mt-2">Then as n → ∞:</p>
              <p className="ml-4 text-green-600 dark:text-green-400 font-semibold">
                √n(X̄ₙ - μ)/σ → N(0, 1)
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              In practice, n ≥ 30 often gives a good approximation.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Key Conditions</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <div>
                <p className="font-medium">Independence</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Observations must be independent
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <div>
                <p className="font-medium">Identical Distribution</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  All observations from same distribution
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">3</span>
              </div>
              <div>
                <p className="font-medium">Finite Variance</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The variance must exist and be finite
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-8">
        <div className="text-center space-y-4">
          <TrendingUp className="w-12 h-12 text-green-600 mx-auto" />
          <h3 className="text-2xl font-bold">Ready to Explore the Full Power of CLT?</h3>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h4 className="font-semibold mb-2">Beyond Sample Means</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            CLT applies to other statistics too: sample variance follows χ² distribution, 
            differences of means, and more.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h4 className="font-semibold mb-2">Convergence Rates</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Berry-Esseen theorem gives bounds on how fast the convergence happens based on 
            the third moment.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h4 className="font-semibold mb-2">Practical Impact</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            CLT justifies using normal-based inference methods even when data isn't normally 
            distributed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CLTGateway;