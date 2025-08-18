'use client'

import React, { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { TrendingUp, TrendingDown } from 'lucide-react'
import BackToHub from '../ui/BackToHub'
import { useSafeMathJax } from '../../utils/mathJaxFix'

// Memoized formula component
const HypothesesFormula = React.memo(function HypothesesFormula({ nullProportion, testType }) {
  const ref = useRef(null)
  useSafeMathJax(ref, [nullProportion, testType])
  
  return (
    <div ref={ref}>
      <div dangerouslySetInnerHTML={{ 
        __html: `\\[\\begin{align}
          H_0: p &= ${nullProportion} \\\\
          H_1: p &${testType === 'two-sided' ? '\\neq' : testType === 'greater' ? '>' : '<'} ${nullProportion}
        \\end{align}\\]` 
      }} />
    </div>
  )
})

export default function SampleSizeEffects() {
  // State management
  const [sampleSize, setSampleSize] = useState(100)
  const [nullProportion, setNullProportion] = useState(0.5)
  const [observedCount, setObservedCount] = useState(60)
  const [testType, setTestType] = useState('two-sided')
  
  // Visualization refs
  const proportionVizRef = useRef(null)
  const distributionVizRef = useRef(null)
  
  // Calculations
  const observedProportion = observedCount / sampleSize
  const standardError = Math.sqrt(nullProportion * (1 - nullProportion) / sampleSize)
  const zStatistic = (observedProportion - nullProportion) / standardError
  
  // Helper functions
  function erf(x) {
    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911
    const sign = x >= 0 ? 1 : -1
    x = Math.abs(x)
    const t = 1.0 / (1.0 + p * x)
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
    return sign * y
  }
  
  function normalCDF(z) {
    return 0.5 * (1 + erf(z / Math.sqrt(2)))
  }
  
  function calculatePValue() {
    const absZ = Math.abs(zStatistic)
    const cdf = normalCDF(absZ)
    const oneSidedP = 1 - cdf
    
    if (testType === 'two-sided') return 2 * oneSidedP
    if (testType === 'greater') return zStatistic > 0 ? oneSidedP : 1 - oneSidedP
    return zStatistic < 0 ? oneSidedP : 1 - oneSidedP
  }
  
  const pValue = calculatePValue()
  
  // Proportion Visualization
  useEffect(() => {
    if (!proportionVizRef.current) return;
    
    d3.select(proportionVizRef.current).selectAll("*").remove();
    
    const svg = d3.select(proportionVizRef.current)
      .append("svg");
    
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = proportionVizRef.current.clientWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;
    
    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create data for proportion bars
    const data = [
      { label: 'Observed', value: observedProportion, color: '#3b82f6' },
      { label: 'Null Hypothesis', value: nullProportion, color: '#14b8a6' }
    ];
    
    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, width])
      .padding(0.3);
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);
    
    // Add bars with animation
    const bars = g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label))
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', d => d.color)
      .attr('opacity', 0.8);
    
    bars.transition()
      .duration(1200)
      .delay((_, i) => i * 200)
      .ease(d3.easeCubicOut)
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value));
    
    // Add value labels
    g.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', d => x(d.label) + x.bandwidth() / 2)
      .attr('y', d => y(d.value) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#e5e7eb')
      .style('opacity', 0)
      .text(d => d.value.toFixed(3))
      .transition()
      .duration(1200)
      .delay((_, i) => i * 200 + 800)
      .style('opacity', 1);
    
    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .style('font-size', '12px')
      .style('color', '#9ca3af')
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d3.format('.1%')))
      .style('font-size', '12px')
      .style('color', '#9ca3af')
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Add axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#e5e7eb')
      .style('font-size', '12px')
      .text('Proportion');
    
  }, [observedProportion, nullProportion]);
  
  // Distribution Visualization
  useEffect(() => {
    if (!distributionVizRef.current) return;
    
    d3.select(distributionVizRef.current).selectAll("*").remove();
    
    const svg = d3.select(distributionVizRef.current)
      .append("svg");
    
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = distributionVizRef.current.clientWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;
    
    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Generate normal distribution curve
    const xMin = -4;
    const xMax = 4;
    const xValues = d3.range(xMin, xMax, 0.1);
    const normalData = xValues.map(x => ({
      x: x,
      y: (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x)
    }));
    
    const x = d3.scaleLinear()
      .domain([xMin, xMax])
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(normalData, d => d.y)])
      .range([height, 0]);
    
    // Add normal curve
    const line = d3.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .curve(d3.curveBasis);
    
    g.append('path')
      .datum(normalData)
      .attr('fill', 'none')
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 2)
      .attr('d', line)
      .style('opacity', 0)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .style('opacity', 1);
    
    // Add critical regions
    const criticalValue = 1.96; // For two-sided test
    
    if (testType === 'two-sided') {
      // Left tail
      const leftTailData = normalData.filter(d => d.x <= -criticalValue);
      if (leftTailData.length > 0) {
        g.append('path')
          .datum(leftTailData.concat([{x: -criticalValue, y: 0}, {x: leftTailData[0].x, y: 0}]))
          .attr('fill', '#ef4444')
          .attr('fill-opacity', 0.3)
          .attr('d', line)
          .style('opacity', 0)
          .transition()
          .duration(1200)
          .delay(400)
          .style('opacity', 1);
      }
      
      // Right tail
      const rightTailData = normalData.filter(d => d.x >= criticalValue);
      if (rightTailData.length > 0) {
        g.append('path')
          .datum(rightTailData.concat([{x: criticalValue, y: 0}, {x: rightTailData[rightTailData.length-1].x, y: 0}]))
          .attr('fill', '#ef4444')
          .attr('fill-opacity', 0.3)
          .attr('d', line)
          .style('opacity', 0)
          .transition()
          .duration(1200)
          .delay(400)
          .style('opacity', 1);
      }
    }
    
    // Add test statistic line
    g.append('line')
      .attr('x1', x(zStatistic))
      .attr('x2', x(zStatistic))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', pValue < 0.05 ? '#ef4444' : '#22c55e')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '5,5')
      .style('opacity', 0)
      .transition()
      .duration(1200)
      .delay(800)
      .style('opacity', 1);
    
    // Add test statistic label
    g.append('text')
      .attr('x', x(zStatistic))
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', pValue < 0.05 ? '#ef4444' : '#22c55e')
      .text(`z = ${zStatistic.toFixed(2)}`)
      .style('opacity', 0)
      .transition()
      .duration(1200)
      .delay(800)
      .style('opacity', 1);
    
    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .style('font-size', '12px')
      .style('color', '#9ca3af')
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d3.format('.2f')))
      .style('font-size', '12px')
      .style('color', '#9ca3af')
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Add axis labels
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 10)
      .attr('text-anchor', 'middle')
      .style('fill', '#e5e7eb')
      .style('font-size', '12px')
      .text('z-score');
    
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#e5e7eb')
      .style('font-size', '12px')
      .text('Density');
      
  }, [zStatistic, pValue, testType]);
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <style jsx>{`
        svg .axis text {
          fill: #e5e7eb;
          font-size: 12px;
        }
        svg .axis line,
        svg .axis path {
          stroke: #6b7280;
        }
        svg .tick text {
          fill: #9ca3af;
          font-size: 12px;
        }
        svg .domain {
          stroke: #6b7280;
        }
      `}</style>
      
      <div className="bg-neutral-800 text-white p-8 rounded-xl mb-8">
        <h1 className="text-3xl font-bold mb-4">Sample Size Effects</h1>
        <p className="text-lg opacity-90">
          Explore how sample size affects the power and significance of hypothesis tests
        </p>
      </div>
      
      <BackToHub chapter={6} />
      
      <div className="bg-neutral-800 rounded-xl p-6 mt-6">
        <h2 className="text-2xl font-bold mb-6 text-white">Sample Size and Statistical Power</h2>
        
        <div className="mb-4">
          <p className="text-gray-400 text-sm">
            Testing H₀: p = 0.5 vs H₁: p ≠ 0.5 with observed proportion p̂ = 0.6
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              {/* Proportion Visualization */}
              <div className="bg-neutral-900/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-200 text-sm">Proportion Comparison</h3>
                <div ref={proportionVizRef} className="w-full h-64 mb-4"></div>
              </div>
            
              <div className="bg-neutral-900/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-200 text-sm">Current Test</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Sample size:</span>
                    <span className="font-mono text-blue-400">{sampleSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Test statistic:</span>
                    <span className="font-mono text-blue-400">{zStatistic.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">P-value:</span>
                    <span className={`font-mono font-bold ${
                      pValue < 0.05 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {pValue.toFixed(4)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="text-sm text-gray-400 block mb-1">
                    Adjust Sample Size: <span className="font-mono text-blue-400">{sampleSize}</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={sampleSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      setSampleSize(newSize);
                      // Keep the proportion constant when adjusting sample size
                      setObservedCount(Math.round(newSize * 0.6));
                    }}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
              
              <div className="bg-neutral-900/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-300 text-sm">Key Insight</h3>
                <p className="text-sm text-neutral-300">
                  The same observed proportion (60%) can be:
                </p>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-neutral-300">
                  <li>Not significant with n = 20</li>
                  <li>Marginally significant with n = 100</li>
                  <li>Highly significant with n = 500</li>
                </ul>
                <p className="text-sm mt-2 text-blue-400 font-semibold">
                  Larger samples detect smaller effects!
                </p>
              </div>
              
              <div className="bg-neutral-900/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-200 text-sm">Test Type</h3>
                <div className="space-y-2">
                  {[
                    { value: 'two-sided', label: 'Two-sided', icon: TrendingUp },
                    { value: 'greater', label: 'Greater than', icon: TrendingUp },
                    { value: 'less', label: 'Less than', icon: TrendingDown }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTestType(value)}
                      className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                        testType === value
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Second column - Distribution Visualization */}
          <div>
            <div className="bg-neutral-900/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-200 text-sm">Test Statistic Distribution</h3>
              <div ref={distributionVizRef} className="w-full h-64"></div>
            </div>
            
            {/* Complete Test Summary */}
            <div className="mt-6 bg-neutral-900/50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4 text-white">Complete Hypothesis Test</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-blue-300 text-sm">Hypotheses</h4>
                  <HypothesesFormula 
                    nullProportion={nullProportion}
                    testType={testType}
                  />
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-blue-300 text-sm">Test Results</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-neutral-300">Sample proportion: <span className="font-mono text-blue-400">{observedProportion.toFixed(3)}</span></p>
                    <p className="text-neutral-300">Standard error: <span className="font-mono text-blue-400">{standardError.toFixed(4)}</span></p>
                    <p className="text-neutral-300">Test statistic: <span className="font-mono text-blue-400">z = {zStatistic.toFixed(3)}</span></p>
                    <p className="text-neutral-300">P-value: <span className={`font-mono font-bold ${
                      pValue < 0.05 ? 'text-red-400' : 'text-neutral-400'
                    }`}>{pValue.toFixed(4)}</span></p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 rounded bg-neutral-800/50">
                <p className={`font-semibold text-sm ${pValue < 0.05 ? 'text-red-400' : 'text-neutral-300'}`}>
                  Decision at α = 0.05: {pValue < 0.05 ? 'Reject H₀' : 'Fail to reject H₀'}
                </p>
                <p className={`text-sm mt-1 ${pValue < 0.05 ? 'text-red-300' : 'text-neutral-400'}`}>
                  {pValue < 0.05 
                    ? `There is significant evidence that the proportion differs from ${nullProportion}`
                    : `There is insufficient evidence that the proportion differs from ${nullProportion}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}