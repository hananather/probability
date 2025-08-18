'use client'

import React, { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { Button } from '../ui/button'
import BackToHub from '../ui/BackToHub'
import ProgressBar from '../ui/ProgressBar'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'


// Memoized formula sections to prevent re-renders
const ObservedProportionFormula = React.memo(function ObservedProportionFormula({ observedCount, sampleSize, observedProportion }) {
  const ref = useRef(null)
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && ref.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([ref.current])
        }
        window.MathJax.typesetPromise([ref.current]).catch(console.error)
      }
    }
    processMathJax()
    const timeoutId = setTimeout(processMathJax, 100)
    return () => clearTimeout(timeoutId)
  }, [observedCount, sampleSize, observedProportion])
  
  return (
    <div ref={ref} className="text-center">
      <div dangerouslySetInnerHTML={{ 
        __html: `\\[\\hat{p} = \\frac{X}{n} = \\frac{${observedCount}}{${sampleSize}} = ${observedProportion.toFixed(3)}\\]` 
      }} />
    </div>
  )
})

const ContinuityCorrectionFormula = React.memo(function ContinuityCorrectionFormula() {
  const ref = useRef(null)
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && ref.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([ref.current])
        }
        window.MathJax.typesetPromise([ref.current]).catch(console.error)
      }
    }
    processMathJax()
    const timeoutId = setTimeout(processMathJax, 100)
    return () => clearTimeout(timeoutId)
  }, [])
  
  return (
    <div ref={ref}>
      <div dangerouslySetInnerHTML={{ 
        __html: `\\[P(X = k) \\approx P(k - 0.5 &lt; X &lt; k + 0.5)\\]` 
      }} />
    </div>
  )
})

const TestStatisticFormulas = React.memo(function TestStatisticFormulas({ zStatistic, showContinuity, observedProportion, nullProportion, sampleSize, standardError }) {
  const ref = useRef(null)
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && ref.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([ref.current])
        }
        window.MathJax.typesetPromise([ref.current]).catch(console.error)
      }
    }
    processMathJax()
    const timeoutId = setTimeout(processMathJax, 100)
    return () => clearTimeout(timeoutId)
  }, [zStatistic, showContinuity, observedProportion, nullProportion, sampleSize, standardError])
  
  return (
    <div ref={ref} className="text-sm">
      <p className="mb-2">Without correction:</p>
      <div dangerouslySetInnerHTML={{ 
        __html: `\\[z = \\frac{\\hat{p} - p_0}{\\sqrt{\\frac{p_0(1-p_0)}{n}}} = ${zStatistic.toFixed(3)}\\]` 
      }} />
      {showContinuity && (
        <>
          <p className="mb-2 mt-3">With correction:</p>
          <div dangerouslySetInnerHTML={{ 
            __html: `\\[z = \\frac{\\hat{p} - p_0 - \\frac{0.5}{n}}{\\sqrt{\\frac{p_0(1-p_0)}{n}}} = ${((observedProportion - nullProportion - 0.5/sampleSize) / standardError).toFixed(3)}\\]` 
          }} />
        </>
      )}
    </div>
  )
})

const HypothesesFormula = React.memo(function HypothesesFormula({ nullProportion, testType }) {
  const ref = useRef(null)
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && ref.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([ref.current])
        }
        window.MathJax.typesetPromise([ref.current]).catch(console.error)
      }
    }
    processMathJax()
    const timeoutId = setTimeout(processMathJax, 100)
    return () => clearTimeout(timeoutId)
  }, [nullProportion, testType])
  
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

// Worked Example Component
const WorkedExample = React.memo(function WorkedExample() {
  const contentRef = useRef(null)
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current])
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error)
      }
    }
    
    processMathJax()
    const timeoutId = setTimeout(processMathJax, 100)
    return () => clearTimeout(timeoutId)
  }, [])
  
  return (
    <div className="bg-neutral-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-purple-400 mb-6">
        Step-by-Step Test for Proportion
      </h3>
      
      <div ref={contentRef} className="space-y-6">
        {/* Setup */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Example: Quality Control Testing</h4>
          <p className="text-sm text-neutral-300 mb-3">
            A manufacturing process should produce 90% defect-free items. We test 200 items and find 170 are defect-free.
            Is there evidence the process is not meeting specifications?
          </p>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li>• Sample size: <span dangerouslySetInnerHTML={{ __html: `\\(n = 200\\)` }} /></li>
            <li>• Observed successes: <span dangerouslySetInnerHTML={{ __html: `\\(X = 170\\)` }} /></li>
            <li>• Null hypothesis: <span dangerouslySetInnerHTML={{ __html: `\\(H_0: p = 0.9\\)` }} /></li>
            <li>• Alternative hypothesis: <span dangerouslySetInnerHTML={{ __html: `\\(H_1: p \\neq 0.9\\)` }} /> (two-sided)</li>
          </ul>
        </div>

        {/* Step 1: Check Conditions */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 1: Verify Large Counts Condition</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>For the normal approximation to be valid, we need:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[np_0 \\geq 10 \\text{ and } n(1-p_0) \\geq 10\\]` }} />
            </div>
            <p>Checking:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[np_0 = 200 \\times 0.9 = 180 \\geq 10 \\checkmark\\]` }} />
              <span dangerouslySetInnerHTML={{ __html: `\\[n(1-p_0) = 200 \\times 0.1 = 20 \\geq 10 \\checkmark\\]` }} />
            </div>
            <p className="text-green-400">✓ Normal approximation is valid!</p>
          </div>
        </div>

        {/* Step 2: Calculate Sample Proportion */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 2: Calculate Sample Proportion</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\hat{p} = \\frac{X}{n} = \\frac{170}{200} = 0.85\\]` }} />
            </div>
            <p>The observed proportion is 0.85, which is 0.05 below the hypothesized value of 0.9.</p>
          </div>
        </div>

        {/* Step 3: Calculate Test Statistic */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 3: Calculate Test Statistic</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>First, find the standard error under <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[SE = \\sqrt{\\frac{p_0(1-p_0)}{n}} = \\sqrt{\\frac{0.9 \\times 0.1}{200}} = \\sqrt{\\frac{0.09}{200}} = 0.0212\\]` }} />
            </div>
            <p>Then calculate the z-statistic:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[z = \\frac{\\hat{p} - p_0}{SE} = \\frac{0.85 - 0.9}{0.0212} = \\frac{-0.05}{0.0212} = -2.36\\]` }} />
            </div>
          </div>
        </div>

        {/* Step 4: Find P-value */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 4: Calculate P-value</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>For a two-sided test:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[\\text{P-value} = 2 \\times P(Z &lt; -2.36) = 2 \\times 0.0091 = 0.0182\\]` }} />
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-red-400 mb-3">Conclusion</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>At significance level α = 0.05:</p>
            <p className="text-red-400 font-bold">P-value = 0.0182 &lt; 0.05</p>
            <p>
              <strong>Decision:</strong> Reject <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />
            </p>
            <p className="mt-3">
              <strong>Interpretation:</strong> There is significant evidence that the process is not producing 
              90% defect-free items. The observed rate of 85% is statistically significantly different from 
              the target of 90%.
            </p>
          </div>
        </div>

        {/* With Continuity Correction */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-teal-400 mb-3">Alternative: With Continuity Correction</h4>
          <div className="text-sm text-neutral-300 space-y-2">
            <p>For improved accuracy with discrete data:</p>
            <div className="text-center my-3">
              <span dangerouslySetInnerHTML={{ __html: `\\[z_{corrected} = \\frac{|\\hat{p} - p_0| - \\frac{0.5}{n}}{SE} = \\frac{0.05 - \\frac{0.5}{200}}{0.0212} = \\frac{0.0475}{0.0212} = 2.24\\]` }} />
            </div>
            <p>P-value = 2 × P(Z &gt; 2.24) = 2 × 0.0125 = 0.025</p>
            <p className="text-teal-400">Still significant at α = 0.05</p>
          </div>
        </div>
      </div>
    </div>
  )
})

// Section Completion Components
const BinomialFoundationCompletion = React.memo(function BinomialFoundationCompletion() {
  const contentRef = useRef(null)
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current])
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error)
      }
    }
    processMathJax()
    const timeoutId = setTimeout(processMathJax, 100)
    return () => clearTimeout(timeoutId)
  }, [])
  
  return (
    <div
      ref={contentRef}
      className="mt-8 bg-neutral-900/50 rounded-lg p-6"
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">✅</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-green-400 mb-3">
            Section Complete: Binomial Foundation
          </h3>
          <div className="bg-neutral-800/50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-white mb-2">Key Concept Mastered</h4>
            <p className="text-sm text-green-200 mb-3">
              The binomial distribution approaches a normal distribution as n increases:
            </p>
            <div className="text-center text-green-400">
              <span dangerouslySetInnerHTML={{ __html: `\\[X \\sim B(n,p) \\approx N(np, np(1-p))\\]` }} />
            </div>
          </div>
          <p className="text-sm text-neutral-300">
            <strong className="text-green-400">What you've learned:</strong> You now understand how the central limit theorem 
            applies to proportions, enabling the use of z-scores and normal tables for hypothesis testing.
          </p>
        </div>
      </div>
    </div>
  )
})

const ContinuityCorrectionCompletion = React.memo(function ContinuityCorrectionCompletion() {
  const contentRef = useRef(null)
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current])
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error)
      }
    }
    processMathJax()
    const timeoutId = setTimeout(processMathJax, 100)
    return () => clearTimeout(timeoutId)
  }, [])
  
  return (
    <div
      ref={contentRef}
      className="mt-8 bg-neutral-900/50 rounded-lg p-6"
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">🎯</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-teal-400 mb-3">
            Section Complete: Continuity Correction
          </h3>
          <div className="bg-teal-900/30 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-white mb-2">Key Technique Mastered</h4>
            <p className="text-sm text-teal-200 mb-3">
              Improve discrete-to-continuous approximation:
            </p>
            <div className="text-center text-teal-400">
              <span dangerouslySetInnerHTML={{ __html: `\\[P(X = k) \\approx P(k - 0.5 < X < k + 0.5)\\]` }} />
            </div>
          </div>
          <p className="text-sm text-neutral-300">
            <strong className="text-teal-400">What you've learned:</strong> You can now apply continuity correction 
            to improve the accuracy of normal approximations, especially important for smaller sample sizes.
          </p>
        </div>
      </div>
    </div>
  )
})

const LargeCountsConditionCompletion = React.memo(function LargeCountsConditionCompletion() {
  const contentRef = useRef(null)
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current])
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error)
      }
    }
    processMathJax()
    const timeoutId = setTimeout(processMathJax, 100)
    return () => clearTimeout(timeoutId)
  }, [])
  
  return (
    <div
      ref={contentRef}
      className="mt-8 bg-neutral-900/50 rounded-lg p-6"
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">🔬</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-purple-400 mb-3">
            Section Complete: Large Counts Condition
          </h3>
          <div className="bg-neutral-800/50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-white mb-2">Key Validation Rule</h4>
            <p className="text-sm text-purple-200 mb-3">
              Normal approximation requires sufficient expected counts:
            </p>
            <div className="text-center text-purple-400">
              <span dangerouslySetInnerHTML={{ __html: `\\[np_0 \\geq 10 \\text{ and } n(1-p_0) \\geq 10\\]` }} />
            </div>
          </div>
          <p className="text-sm text-neutral-300">
            <strong className="text-purple-400">What you've learned:</strong> You can now verify when the normal 
            approximation is valid and choose appropriate alternative methods when conditions aren't met.
          </p>
        </div>
      </div>
    </div>
  )
})

const SampleSizeEffectsCompletion = React.memo(function SampleSizeEffectsCompletion() {
  const contentRef = useRef(null)
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current])
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error)
      }
    }
    processMathJax()
    const timeoutId = setTimeout(processMathJax, 100)
    return () => clearTimeout(timeoutId)
  }, [])
  
  return (
    <div
      ref={contentRef}
      className="mt-8 bg-neutral-900/50 rounded-lg p-6"
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl">📊</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-blue-400 mb-3">
            Section Complete: Sample Size Effects
          </h3>
          <div className="bg-neutral-800/50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-white mb-2">Key Insight Gained</h4>
            <p className="text-sm text-blue-200 mb-3">
              Larger samples can detect smaller differences from the null hypothesis:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-blue-800/30 rounded p-2">
                <div className="text-blue-400 font-mono">n = 20</div>
                <div className="text-neutral-400">Large effects only</div>
              </div>
              <div className="bg-blue-800/30 rounded p-2">
                <div className="text-blue-400 font-mono">n = 100</div>
                <div className="text-neutral-400">Medium effects</div>
              </div>
              <div className="bg-blue-800/30 rounded p-2">
                <div className="text-blue-400 font-mono">n = 500</div>
                <div className="text-neutral-400">Small effects</div>
              </div>
            </div>
          </div>
          <p className="text-sm text-neutral-300">
            <strong className="text-blue-400">What you've learned:</strong> You understand the relationship between 
            sample size and statistical power, enabling better study design and result interpretation.
          </p>
        </div>
      </div>
    </div>
  )
})

// Define sections outside component for SSR compatibility
const sections = [
  {
    title: 'Binomial Foundation',
    description: 'See how proportion testing connects to the binomial distribution',
    icon: '📊'
  },
  {
    title: 'Continuity Correction',
    description: 'Understand why we adjust for discrete-to-continuous approximation',
    icon: '🔄'
  },
  {
    title: 'Large Counts Condition',
    description: 'Check when the normal approximation is valid',
    icon: '✓'
  },
  {
    title: 'Sample Size Effects',
    description: 'Explore how sample size affects significance',
    icon: '📈'
  }
]

export default function TestForProportion() {
  // Component definitions will be added later
  
  // State management
  const [activeSection, setActiveSection] = useState(0)
  const [sampleSize, setSampleSize] = useState(100)
  const [nullProportion, setNullProportion] = useState(0.5)
  const [observedCount, setObservedCount] = useState(60)
  const [showContinuityCorrection, setShowContinuityCorrection] = useState(false)
  const [testType, setTestType] = useState('two-sided')
  
  // No longer need visualization refs since we've removed the D3 visualizations
  
  // Calculations
  const observedProportion = observedCount / sampleSize
  const standardError = Math.sqrt(nullProportion * (1 - nullProportion) / sampleSize)
  const correctionValue = showContinuityCorrection ? 0.5 / sampleSize : 0
  const zStatistic = (observedProportion - nullProportion - correctionValue) / standardError
  const pValue = calculatePValue()
  
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
  
  // Large counts condition check
  const largeCountsCondition = {
    np0: sampleSize * nullProportion,
    n1p0: sampleSize * (1 - nullProportion),
    satisfied: sampleSize * nullProportion >= 10 && sampleSize * (1 - nullProportion) >= 10
  }
  

  // Visualization refs
  const proportionVizRef = useRef(null)
  const distributionVizRef = useRef(null)
  
  // Removed discovery tracking logic
  
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
      .style('fill', pValue < 0.05 ? '#ef4444' : '#22c55e')
      .style('font-weight', 'bold')
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
  
  // Clean up animations on unmount
  useEffect(() => {
    return () => {
      // Cleanup if needed
    }
  }, [])
  
  
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
      <div className="bg-purple-600 text-white p-8 rounded-xl mb-8">
        <h1 className="text-3xl font-bold mb-4">Test for Proportion</h1>
        <p className="text-lg opacity-90">
          Master hypothesis testing for proportions using the normal approximation to the binomial distribution
        </p>
        <ProgressBar 
          current={activeSection + 1} 
          total={sections.length} 
          className="mt-4"
        />
      </div>
      
      {/* Back to Hub Button */}
      <BackToHub chapter={6} />
      
      {/* Section Navigation with smooth transitions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {sections && sections.map((section, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveSection(idx)
            }}
            className={`p-4 rounded-lg transition-all duration-200 ${
              activeSection === idx
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
            }`}
          >
            <div className="text-2xl mb-2">{section?.icon || '📊'}</div>
            <div className="font-semibold">{section.title}</div>
            <div className="text-sm mt-1 opacity-80">{section.description}</div>
          </button>
        ))}
      </div>
      
      
      {/* Section 0: Binomial Foundation */}
      {activeSection === 0 && (
        <div className="bg-neutral-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-white">
            Binomial Distribution and Normal Approximation
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="bg-neutral-900/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4 text-gray-200 text-lg">Interactive Parameters</h3>
                <div className="space-y-5">
                  <div>
                    <label className="text-gray-300 block mb-2">
                      Sample Size (n): <span className="font-mono text-purple-400 font-bold text-lg">{sampleSize}</span>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      value={sampleSize}
                      onChange={(e) => setSampleSize(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-300 block mb-2">
                      Null Proportion (p₀): <span className="font-mono text-purple-400 font-bold text-lg">{nullProportion.toFixed(2)}</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.05"
                      value={nullProportion}
                      onChange={(e) => setNullProportion(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-300 block mb-2">
                      Observed Count (X): <span className="font-mono text-purple-400 font-bold text-lg">{observedCount}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={sampleSize}
                      value={observedCount}
                      onChange={(e) => setObservedCount(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-600">
                  <div className="bg-neutral-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-yellow-300">Observed Proportion</h4>
                    <ObservedProportionFormula 
                      observedCount={observedCount}
                      sampleSize={sampleSize}
                      observedProportion={observedProportion}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-neutral-900/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3 text-blue-300 text-lg">Normal Approximation Principle</h3>
                <p className="text-blue-200 mb-4">
                  When <span dangerouslySetInnerHTML={{ __html: `\\(n\\)` }} /> is large, the binomial distribution 
                  <span dangerouslySetInnerHTML={{ __html: ` \\(B(n, p)\\)` }} /> approximates a normal distribution:
                </p>
                <div className="bg-neutral-800/50 p-4 rounded-lg text-center">
                  <p className="text-blue-100">
                    Mean: <span dangerouslySetInnerHTML={{ __html: `\\(\\mu = np = ${sampleSize} \\times ${nullProportion.toFixed(2)} = ${(sampleSize * nullProportion).toFixed(1)}\\)` }} />
                  </p>
                  <p className="text-blue-100 mt-2">
                    Variance: <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma^2 = np(1-p) = ${(sampleSize * nullProportion * (1 - nullProportion)).toFixed(1)}\\)` }} />
                  </p>
                  <p className="text-blue-100 mt-2">
                    Std Dev: <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma = ${Math.sqrt(sampleSize * nullProportion * (1 - nullProportion)).toFixed(2)}\\)` }} />
                  </p>
                </div>
              </div>
              
              <div className="bg-neutral-900/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3 text-purple-300 text-lg">Why This Matters</h3>
                <ul className="space-y-3 text-purple-200">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">→</span>
                    <span>The normal approximation allows us to use z-scores and standard normal tables</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">→</span>
                    <span>Calculations become much simpler than using exact binomial probabilities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">→</span>
                    <span>Works well when both <span dangerouslySetInnerHTML={{ __html: `\(np \geq 10\)` }} /> and <span dangerouslySetInnerHTML={{ __html: `\(n(1-p) \geq 10\)` }} /></span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-neutral-900/50 p-4 rounded-lg">
                <h4 className="font-semibold text-neutral-200 mb-2">Current Conditions Check</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">np₀ = {(sampleSize * nullProportion).toFixed(1)}</span>
                    <span className={`font-mono font-bold ${
                      sampleSize * nullProportion >= 10 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {sampleSize * nullProportion >= 10 ? '✓ ≥ 10' : '✗ < 10'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">n(1-p₀) = {(sampleSize * (1 - nullProportion)).toFixed(1)}</span>
                    <span className={`font-mono font-bold ${
                      sampleSize * (1 - nullProportion) >= 10 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {sampleSize * (1 - nullProportion) >= 10 ? '✓ ≥ 10' : '✗ < 10'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section Completion */}
          <BinomialFoundationCompletion />
        </div>
      )}
      
      {/* Section 1: Continuity Correction */}
      {activeSection === 1 && (
        <div className="bg-neutral-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-white">Continuity Correction</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="bg-neutral-800/50 border border-neutral-700/50 p-6 rounded-lg mb-4">
                <h3 className="font-semibold mb-3 text-neutral-200 text-lg">Why Continuity Correction?</h3>
                <p className="text-neutral-300 mb-4">
                  The binomial distribution is discrete, but the normal distribution is continuous.
                  To improve the approximation when converting discrete to continuous, we adjust:
                </p>
                <div className="bg-neutral-900/50 p-4 rounded-lg">
                  <ContinuityCorrectionFormula />
                </div>
                <p className="text-sm text-neutral-400 mt-4">
                  This adjustment accounts for the "width" of each discrete value when approximating with a continuous curve.
                </p>
              </div>
              
              <div className="bg-neutral-900/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3 text-yellow-300 text-lg">Practical Example</h3>
                <p className="text-yellow-200">
                  In quality control, if 60 out of 100 products pass inspection,
                  we test whether the true pass rate differs from the standard 50%.
                </p>
                <ul className="mt-3 space-y-2 text-sm text-yellow-100">
                  <li>• Without correction: P(X = 60)</li>
                  <li>• With correction: P(59.5 &lt; X &lt; 60.5)</li>
                  <li>• More accurate for finite samples</li>
                </ul>
              </div>
            </div>
            
            <div>
              <div className="bg-neutral-900/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4 text-blue-300 text-lg">Test Statistic Comparison</h3>
                <div className="mb-4">
                  <button
                    onClick={() => setShowContinuityCorrection(!showContinuityCorrection)}
                    className={`w-full px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                      showContinuityCorrection 
                        ? 'bg-teal-600 text-white' 
                        : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    {showContinuityCorrection ? 'Hide' : 'Show'} Continuity Correction
                  </button>
                </div>
                <TestStatisticFormulas 
                  zStatistic={zStatistic}
                  showContinuity={showContinuityCorrection}
                  observedProportion={observedProportion}
                  nullProportion={nullProportion}
                  sampleSize={sampleSize}
                  standardError={standardError}
                />
              </div>
              
              <div className="bg-neutral-800/50 border border-neutral-700/50 p-4 rounded-lg mt-4">
                <h4 className="font-semibold text-neutral-200 mb-2">When to Use</h4>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li>✓ Small to moderate sample sizes (n &lt; 200)</li>
                  <li>✓ When precision is important</li>
                  <li>✓ For two-sided tests</li>
                  <li>✗ Less important for very large samples</li>
                  <li>✗ Can be skipped for rough estimates</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Section Completion */}
          <ContinuityCorrectionCompletion />
        </div>
      )}
      
      {/* Section 2: Large Counts Condition */}
      {activeSection === 2 && (
        <div className="bg-neutral-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-white">Large Counts Condition</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="bg-neutral-900/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4 text-gray-200 text-lg">Interactive Condition Check</h3>
                
                <div className="space-y-6">
                  <div className="bg-neutral-900/50 p-5 rounded-lg">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-300">
                          np₀ = {sampleSize} × {nullProportion.toFixed(2)}
                        </span>
                        <span className={`font-mono text-2xl font-bold ${
                          largeCountsCondition.np0 >= 10 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {largeCountsCondition.np0.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            largeCountsCondition.np0 >= 10 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, (largeCountsCondition.np0 / 20) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-neutral-400 text-center">
                        {largeCountsCondition.np0 >= 10 ? '✓ Condition satisfied' : `Need ${(10 - largeCountsCondition.np0).toFixed(1)} more`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-900/50 p-5 rounded-lg">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-300">
                          n(1-p₀) = {sampleSize} × {(1 - nullProportion).toFixed(2)}
                        </span>
                        <span className={`font-mono text-2xl font-bold ${
                          largeCountsCondition.n1p0 >= 10 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {largeCountsCondition.n1p0.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-neutral-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            largeCountsCondition.n1p0 >= 10 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, (largeCountsCondition.n1p0 / 20) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-neutral-400 text-center">
                        {largeCountsCondition.n1p0 >= 10 ? '✓ Condition satisfied' : `Need ${(10 - largeCountsCondition.n1p0).toFixed(1)} more`}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 rounded-lg bg-neutral-900/50">
                  <p className={`text-center font-semibold ${
                    largeCountsCondition.satisfied ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {largeCountsCondition.satisfied 
                      ? '✓ Normal approximation is valid!' 
                      : '✗ Normal approximation may not be accurate'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 bg-neutral-900/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3 text-yellow-300 text-lg">Common Scenarios</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-700/50">
                    <div className="font-mono text-sm text-neutral-300">n=30, p=0.5</div>
                    <div className="text-green-400 font-semibold mt-1">✓ Valid</div>
                    <div className="text-xs text-neutral-400">15 & 15</div>
                  </div>
                  <div className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-700/50">
                    <div className="font-mono text-sm text-neutral-300">n=20, p=0.1</div>
                    <div className="text-red-400 font-semibold mt-1">✗ Too small</div>
                    <div className="text-xs text-neutral-400">2 & 18</div>
                  </div>
                  <div className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-700/50">
                    <div className="font-mono text-sm text-neutral-300">n=100, p=0.05</div>
                    <div className="text-yellow-400 font-semibold mt-1">⚠ Borderline</div>
                    <div className="text-xs text-neutral-400">5 & 95</div>
                  </div>
                  <div className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-700/50">
                    <div className="font-mono text-sm text-neutral-300">n=200, p=0.3</div>
                    <div className="text-green-400 font-semibold mt-1">✓ Valid</div>
                    <div className="text-xs text-neutral-400">60 & 140</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-neutral-900/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3 text-purple-300 text-lg">The Rule of Thumb</h3>
                <p className="text-purple-200 mb-4">
                  For the normal approximation to be valid, both conditions must be satisfied:
                </p>
                <div className="bg-neutral-800/50 p-4 rounded-lg text-center">
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[np_0 \\geq 10 \\text{ and } n(1-p_0) \\geq 10\\]` 
                  }} />
                </div>
                <p className="text-sm mt-4 text-purple-200">
                  This ensures the distribution isn't too skewed and has enough data in both tails for the normal curve to be a good approximation.
                </p>
              </div>
              
              <div className="bg-neutral-900/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3 text-blue-300 text-lg">Why 10?</h3>
                <ul className="space-y-2 text-blue-200">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>Below 10, the binomial distribution can be noticeably skewed</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>The normal approximation error becomes significant</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>Type I error rates may deviate from the nominal α level</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-neutral-900/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-200 text-lg">Alternative Methods</h3>
                <p className="text-gray-300 mb-3">
                  When the large counts condition fails:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-2">→</span>
                    <span><strong>Exact binomial test:</strong> Uses the actual binomial distribution</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-2">→</span>
                    <span><strong>Wilson score interval:</strong> Better for small samples</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-2">→</span>
                    <span><strong>Bootstrap methods:</strong> Resampling approach</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Section Completion */}
          <LargeCountsConditionCompletion />
        </div>
      )}
      
      {/* Section 3: Sample Size Effects */}
      {activeSection === 3 && (
        <div className="bg-neutral-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-white">Sample Size and Statistical Power</h2>
          
          <div className="mb-4">
            <p className="text-gray-400">
              Testing <span dangerouslySetInnerHTML={{ __html: `\\(H_0: p = 0.5\\)` }} /> vs <span dangerouslySetInnerHTML={{ __html: `\\(H_1: p \\neq 0.5\\)` }} /> with observed proportion <span dangerouslySetInnerHTML={{ __html: `\\(\\hat{p} = 0.6\\)` }} />
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                {/* Proportion Visualization */}
                <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 text-gray-200">Proportion Comparison</h3>
                  <div ref={proportionVizRef} className="w-full h-64 mb-4"></div>
                </div>
              
              <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-200">Current Test</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sample size:</span>
                    <span className="font-mono text-purple-600">{sampleSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Test statistic:</span>
                    <span className="font-mono text-purple-600">{zStatistic.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>P-value:</span>
                    <span className={`font-mono font-bold ${
                      pValue < 0.05 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {pValue.toFixed(4)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="text-sm text-gray-400 block mb-1">
                    Adjust Sample Size: <span className="font-mono text-purple-400">{sampleSize}</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={sampleSize}
                    onChange={(e) => setSampleSize(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>
              
              <div className="bg-neutral-900/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-300">Key Insight</h3>
                <p className="text-sm text-blue-200">
                  The same observed proportion (60%) can be:
                </p>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-purple-200">
                  <li>Not significant with n = 20</li>
                  <li>Marginally significant with n = 100</li>
                  <li>Highly significant with n = 500</li>
                </ul>
                <p className="text-sm mt-2 text-purple-200 font-semibold">
                  Larger samples detect smaller effects!
                </p>
              </div>
              
              <div className="bg-neutral-900/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-yellow-300">Test Type</h3>
                <div className="space-y-2">
                  {[
                    { value: 'two-sided', label: 'Two-sided', icon: TrendingUp },
                    { value: 'greater', label: 'Greater than', icon: TrendingUp },
                    { value: 'less', label: 'Less than', icon: TrendingDown }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTestType(value)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
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
              <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-200">Test Statistic Distribution</h3>
                <div ref={distributionVizRef} className="w-full h-64"></div>
              </div>
            </div>
          </div>
          
          {/* Complete Test Summary */}
          <div className="mt-6 bg-neutral-900/50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-4 text-white">Complete Hypothesis Test</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-blue-300">Hypotheses</h4>
                <HypothesesFormula 
                  nullProportion={nullProportion}
                  testType={testType}
                />
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-blue-300">Test Results</h4>
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
            
            <div className={`mt-4 p-3 rounded transition-all duration-300 ${
              pValue < 0.05 
                ? 'bg-neutral-900/50' 
                : 'bg-neutral-900/50'
            }`}>
              <p className={`font-semibold ${pValue < 0.05 ? 'text-red-400' : 'text-neutral-300'}`}>
                Decision at <span dangerouslySetInnerHTML={{ __html: `\\\\(\\\\alpha = 0.05\\\\)` }} />: {pValue < 0.05 ? <>Reject <span dangerouslySetInnerHTML={{ __html: `\\\\(H_0\\\\)` }} /></> : <>Fail to reject <span dangerouslySetInnerHTML={{ __html: `\\\\(H_0\\\\)` }} /></>}
              </p>
              <p className={`text-sm mt-1 ${pValue < 0.05 ? 'text-red-300' : 'text-neutral-400'}`}>
                {pValue < 0.05 
                  ? `There is significant evidence that the proportion differs from ${nullProportion}`
                  : `There is insufficient evidence that the proportion differs from ${nullProportion}`}
              </p>
            </div>
          </div>
          
          {/* Section Completion */}
          <SampleSizeEffectsCompletion />
        </div>
      )}

      {/* Worked Example Section */}
      <WorkedExample />

      {/* Key Insights */}
      <div className="bg-neutral-800/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-teal-400 mb-4">Key Insights</h3>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-neutral-800/50 rounded p-4">
            <h4 className="font-bold text-white mb-2">Normal Approximation</h4>
            <p className="text-neutral-300">
              Valid when both <span dangerouslySetInnerHTML={{ __html: `\\(np_0 \\geq 10\\)` }} /> and <span dangerouslySetInnerHTML={{ __html: `\\(n(1-p_0) \\geq 10\\)` }} />. For smaller samples,
              use exact binomial test or Wilson score interval.
            </p>
          </div>
          
          <div className="bg-neutral-800/50 rounded p-4">
            <h4 className="font-bold text-white mb-2">Continuity Correction</h4>
            <p className="text-neutral-300">
              Adjusts for discrete-to-continuous approximation. More important for
              smaller samples, negligible effect as n increases.
            </p>
          </div>
          
          <div className="bg-neutral-800/50 rounded p-4">
            <h4 className="font-bold text-white mb-2">Sample Size Planning</h4>
            <p className="text-neutral-300">
              To detect difference δ with power 1-β:
              <span dangerouslySetInnerHTML={{ __html: `\\(n \\approx p(1-p)(z_\\alpha + z_\\beta)^2/\\delta^2\\)` }} />
            </p>
          </div>
          
          <div className="bg-neutral-800/50 rounded p-4">
            <h4 className="font-bold text-white mb-2">Effect of Sample Size</h4>
            <p className="text-neutral-300">
              Larger samples can detect smaller deviations from <span dangerouslySetInnerHTML={{ __html: `\\(H_0\\)` }} />. With <span dangerouslySetInnerHTML={{ __html: `\\(n=500\\)` }} />,
              even a 3% difference from <span dangerouslySetInnerHTML={{ __html: `\\(p_0\\)` }} /> may be statistically significant.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}