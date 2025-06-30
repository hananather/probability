'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import * as d3 from 'd3'
import { Button } from '../ui/button'
import ProgressBar from '../ui/ProgressBar'
import { MathematicalDiscoveries, useDiscoveries } from '../ui/MathematicalDiscoveries'
import { createColorScheme } from '../../lib/design-system'

// Create hypothesis testing color scheme
const colorScheme = createColorScheme('hypothesis')

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
        __html: `\\[P(X = k) \\approx P(k - 0.5 < X < k + 0.5)\\]` 
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
  // Define discoveries with useMemo to prevent recreation
  const discoveryDefinitions = useMemo(() => [
    {
      id: 'binomial-normal-approximation',
      title: 'Normal Approximation',
      description: 'The binomial distribution approaches a normal distribution as n increases',
      formula: '\\[X \\sim B(n,p) \\approx N(np, np(1-p))\\]',
      discovered: false,
      category: 'concept'
    },
    {
      id: 'continuity-correction',
      title: 'Continuity Correction',
      description: 'Improves approximation when converting discrete to continuous',
      formula: '\\[P(X = k) \\approx P(k - 0.5 < X < k + 0.5)\\]',
      discovered: false,
      category: 'formula'
    },
    {
      id: 'large-counts-condition',
      title: 'Validity Conditions',
      description: 'Normal approximation requires sufficient expected counts',
      formula: '\\[np_0 \\geq 10 \\text{ and } n(1-p_0) \\geq 10\\]',
      discovered: false,
      category: 'pattern'
    },
    {
      id: 'sample-size-effect',
      title: 'Power and Sample Size',
      description: 'Larger samples can detect smaller differences from the null hypothesis',
      discovered: false,
      category: 'relationship'
    }
  ], [])
  
  const { discoveries, markDiscovered } = useDiscoveries(discoveryDefinitions)
  
  // State management
  const [activeSection, setActiveSection] = useState(0)
  const [sampleSize, setSampleSize] = useState(100)
  const [nullProportion, setNullProportion] = useState(0.5)
  const [observedCount, setObservedCount] = useState(60)
  const [showContinuityCorrection, setShowContinuityCorrection] = useState(false)
  const [testType, setTestType] = useState('two-sided')
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Refs for D3 visualizations
  const binomialNormalRef = useRef(null)
  const continuityRef = useRef(null)
  const conditionRef = useRef(null)
  const sampleSizeRef = useRef(null)
  const animationFrameRef = useRef(null)
  const svgInitialized = useRef({})
  
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
  
  // Memoized binomial probabilities
  const binomialProbabilities = useMemo(() => {
    const probs = []
    const maxK = Math.min(sampleSize, 40) // Limit for performance
    
    // Pre-calculate factorials
    const factorials = [1]
    for (let i = 1; i <= maxK; i++) {
      factorials[i] = factorials[i - 1] * i
    }
    
    const binomialCoeff = (n, k) => {
      if (k > n) return 0
      if (k === 0 || k === n) return 1
      if (k > maxK || n - k > maxK) {
        // Stirling's approximation for large values
        return Math.exp(
          n * Math.log(n) - k * Math.log(k) - (n - k) * Math.log(n - k) -
          0.5 * Math.log(2 * Math.PI * n) + 0.5 * Math.log(2 * Math.PI * k) + 
          0.5 * Math.log(2 * Math.PI * (n - k))
        )
      }
      return factorials[n] / (factorials[k] * factorials[n - k])
    }
    
    for (let k = 0; k <= maxK; k++) {
      const coeff = binomialCoeff(sampleSize, k)
      const prob = coeff * Math.pow(nullProportion, k) * Math.pow(1 - nullProportion, sampleSize - k)
      probs.push({ x: k, p: prob })
    }
    return probs
  }, [sampleSize, nullProportion])
  
  // Binomial vs Normal Approximation Visualization
  useEffect(() => {
    if (!binomialNormalRef.current || activeSection !== 0) return
    
    const svg = d3.select(binomialNormalRef.current)
    const margin = { top: 20, right: 30, bottom: 50, left: 60 }
    const width = 800 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom
    
    // Initialize only once
    if (!svgInitialized.current.binomial) {
      svg.selectAll('*').remove()
      svg
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      
      // Add dark background
      svg.append('rect')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('fill', '#0f172a')
        .attr('rx', 8)
      
      // Create gradient
      const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'binomial-gradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', height)
        .attr('x2', 0).attr('y2', 0)
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScheme.chart.primary)
        .attr('stop-opacity', 0.1)
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScheme.chart.primary)
        .attr('stop-opacity', 0.8)
      
      svg.append('g')
        .attr('class', 'main-group')
        .attr('transform', `translate(${margin.left},${margin.top})`)
      
      svgInitialized.current.binomial = true
    }
    
    const g = svg.select('.main-group')
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, Math.min(sampleSize, 40)])
      .range([0, width])
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(binomialProbabilities, d => d.p) * 1.1])
      .range([height, 0])
    
    // Update axes
    g.selectAll('.axis').remove()
    
    g.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('fill', 'currentColor')
      .style('text-anchor', 'middle')
      .text('Number of Successes')
    
    g.append('g')
      .attr('class', 'axis y-axis')
      .call(d3.axisLeft(yScale).tickFormat(d3.format('.4f')))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('fill', 'currentColor')
      .style('text-anchor', 'middle')
      .text('Probability')
    
    // Update bars with smooth transition
    const bars = g.selectAll('.bar')
      .data(binomialProbabilities)
    
    bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.x) - 8)
      .attr('y', height)
      .attr('width', 16)
      .attr('height', 0)
      .attr('fill', 'url(#binomial-gradient)')
      .merge(bars)
      .transition()
      .duration(300)
      .attr('x', d => xScale(d.x) - 8)
      .attr('y', d => yScale(d.p))
      .attr('height', d => height - yScale(d.p))
    
    bars.exit().remove()
    
    // Normal curve overlay with animation
    if (!isAnimating) {
      setIsAnimating(true)
      
      const mean = sampleSize * nullProportion
      const stdDev = Math.sqrt(sampleSize * nullProportion * (1 - nullProportion))
      
      const normalData = []
      for (let x = 0; x <= Math.min(sampleSize, 40); x += 0.5) {
        const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * 
                  Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2))
        normalData.push({ x, y })
      }
      
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveBasis)
      
      // Remove old curve
      g.selectAll('.normal-curve').remove()
      
      // Animate curve drawing
      const path = g.append('path')
        .datum(normalData)
        .attr('class', 'normal-curve')
        .attr('fill', 'none')
        .attr('stroke', colorScheme.chart.secondary)
        .attr('stroke-width', 3)
        .attr('d', line)
      
      const totalLength = path.node().getTotalLength()
      
      path
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeQuadInOut)
        .attr('stroke-dashoffset', 0)
        .on('end', () => setIsAnimating(false))
    }
    
    // Highlight observed value
    g.selectAll('.observed-highlight').remove()
    
    if (observedCount <= Math.min(sampleSize, 40)) {
      const highlightGroup = g.append('g')
        .attr('class', 'observed-highlight')
        .style('opacity', 0)
      
      highlightGroup.append('rect')
        .attr('x', xScale(observedCount) - 10)
        .attr('y', 0)
        .attr('width', 20)
        .attr('height', height)
        .attr('fill', colorScheme.chart.tertiary)
        .attr('opacity', 0.2)
      
      highlightGroup.append('line')
        .attr('x1', xScale(observedCount))
        .attr('x2', xScale(observedCount))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', colorScheme.chart.tertiary)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
      
      highlightGroup.transition()
        .delay(800)
        .duration(500)
        .style('opacity', 1)
    }
    
    // Mark discovery with a slight delay for visual effect
    const timer = setTimeout(() => {
      markDiscovered('binomial-normal-approximation')
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [activeSection, sampleSize, nullProportion, observedCount, binomialProbabilities, isAnimating, markDiscovered])
  
  // Continuity Correction Visualization
  useEffect(() => {
    if (!continuityRef.current || activeSection !== 1) return
    
    const svg = d3.select(continuityRef.current)
    const margin = { top: 20, right: 30, bottom: 60, left: 60 }
    const width = 800 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom
    
    // Initialize
    if (!svgInitialized.current.continuity) {
      svg.selectAll('*').remove()
      svg
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      
      // Add dark background
      svg.append('rect')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('fill', '#0f172a')
        .attr('rx', 8)
      
      svg.append('g')
        .attr('class', 'main-group')
        .attr('transform', `translate(${margin.left},${margin.top})`)
      
      svgInitialized.current.continuity = true
    }
    
    const g = svg.select('.main-group')
    
    // Focus on area around observed value
    const focusRange = 3
    const xMin = Math.max(0, observedCount - focusRange)
    const xMax = Math.min(sampleSize, observedCount + focusRange)
    
    const xScale = d3.scaleLinear()
      .domain([xMin - 0.5, xMax + 0.5])
      .range([0, width])
    
    const relevantProbs = binomialProbabilities.filter(d => d.x >= xMin && d.x <= xMax)
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(relevantProbs, d => d.p) * 1.2])
      .range([height, 0])
    
    // Clear and redraw
    g.selectAll('*').remove()
    
    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(xMax - xMin + 1))
    
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d3.format('.4f')))
    
    // Bars with animation
    const barWidth = width / (xMax - xMin + 2) * 0.8
    
    relevantProbs.forEach((d, i) => {
      const bar = g.append('rect')
        .attr('x', xScale(d.x) - barWidth / 2)
        .attr('y', height)
        .attr('width', barWidth)
        .attr('height', 0)
        .attr('fill', d.x === observedCount ? colorScheme.chart.tertiary : colorScheme.chart.primary)
        .attr('opacity', 0.7)
      
      bar.transition()
        .delay(i * 100)
        .duration(500)
        .attr('y', yScale(d.p))
        .attr('height', height - yScale(d.p))
    })
    
    // Continuity correction visualization
    if (showContinuityCorrection) {
      const correctionGroup = g.append('g')
        .attr('class', 'correction-group')
        .style('opacity', 0)
      
      // Correction interval
      correctionGroup.append('rect')
        .attr('x', xScale(observedCount - 0.5))
        .attr('y', 0)
        .attr('width', xScale(observedCount + 0.5) - xScale(observedCount - 0.5))
        .attr('height', height)
        .attr('fill', colorScheme.chart.success)
        .attr('opacity', 0.2)
      
      // Labels
      correctionGroup.append('text')
        .attr('x', xScale(observedCount - 0.5))
        .attr('y', height + 35)
        .attr('text-anchor', 'middle')
        .attr('fill', colorScheme.chart.success)
        .style('font-size', '12px')
        .text(`${observedCount - 0.5}`)
      
      correctionGroup.append('text')
        .attr('x', xScale(observedCount + 0.5))
        .attr('y', height + 35)
        .attr('text-anchor', 'middle')
        .attr('fill', colorScheme.chart.success)
        .style('font-size', '12px')
        .text(`${observedCount + 0.5}`)
      
      // Animate in
      correctionGroup.transition()
        .delay(relevantProbs.length * 100)
        .duration(500)
        .style('opacity', 1)
    }
    
    // Mark discovery with visual delay
    if (showContinuityCorrection) {
      const timer = setTimeout(() => {
        markDiscovered('continuity-correction')
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [activeSection, observedCount, sampleSize, showContinuityCorrection, binomialProbabilities, markDiscovered])
  
  // Large Counts Condition Visualization
  useEffect(() => {
    if (!conditionRef.current || activeSection !== 2) return
    
    const svg = d3.select(conditionRef.current)
    const width = 400
    const height = 200
    
    svg.selectAll('*').remove()
    svg
      .attr('width', width)
      .attr('height', height)
    
    // Add dark background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#0f172a')
      .attr('rx', 8)
    
    const createGauge = (value, threshold, label, xPos, delay) => {
      const gaugeG = svg.append('g')
        .attr('transform', `translate(${xPos}, ${height / 2})`)
        .style('opacity', 0)
      
      // Progress animation
      let progress = 0
      const maxProgress = Math.min(value / (threshold * 2), 1)
      
      const animateGauge = () => {
        progress = Math.min(progress + 0.02, maxProgress)
        
        // Clear previous arc
        gaugeG.selectAll('.value-arc').remove()
        
        // Value arc
        const valueAngle = progress * Math.PI - Math.PI / 2
        const valueArc = d3.arc()
          .innerRadius(40)
          .outerRadius(60)
          .startAngle(-Math.PI / 2)
          .endAngle(valueAngle)
        
        const color = value >= threshold ? colorScheme.chart.success : 
                     value >= threshold * 0.8 ? colorScheme.chart.tertiary : 
                     colorScheme.chart.error
        
        gaugeG.append('path')
          .attr('class', 'value-arc')
          .attr('d', valueArc)
          .attr('fill', color)
        
        if (progress < maxProgress) {
          animationFrameRef.current = requestAnimationFrame(animateGauge)
        } else {
          // Add final elements
          gaugeG.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 5)
            .style('font-size', '18px')
            .style('font-weight', 'bold')
            .style('fill', color)
            .text(value.toFixed(1))
          
          gaugeG.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 80)
            .style('font-size', '14px')
            .style('fill', '#e5e7eb')
            .text(label)
        }
      }
      
      // Background arc
      const arcGenerator = d3.arc()
        .innerRadius(40)
        .outerRadius(60)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2)
      
      gaugeG.append('path')
        .attr('d', arcGenerator)
        .attr('fill', '#374151')
        .attr('opacity', 0.5)
      
      // Threshold marker
      const thresholdAngle = 0
      gaugeG.append('line')
        .attr('x1', 35 * Math.cos(thresholdAngle))
        .attr('y1', 35 * Math.sin(thresholdAngle))
        .attr('x2', 65 * Math.cos(thresholdAngle))
        .attr('y2', 65 * Math.sin(thresholdAngle))
        .attr('stroke', '#6b7280')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '3,3')
      
      // Animate in
      gaugeG.transition()
        .delay(delay)
        .duration(300)
        .style('opacity', 1)
        .on('end', () => {
          animationFrameRef.current = requestAnimationFrame(animateGauge)
        })
    }
    
    createGauge(largeCountsCondition.np0, 10, 'np₀', 100, 0)
    createGauge(largeCountsCondition.n1p0, 10, 'n(1-p₀)', 300, 200)
    
    // Mark discovery when condition is satisfied
    if (largeCountsCondition.satisfied) {
      const timer = setTimeout(() => {
        markDiscovered('large-counts-condition')
      }, 1500)
      return () => {
        clearTimeout(timer)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [activeSection, largeCountsCondition, markDiscovered])
  
  // Sample Size Effect Visualization
  useEffect(() => {
    if (!sampleSizeRef.current || activeSection !== 3) return
    
    const svg = d3.select(sampleSizeRef.current)
    const margin = { top: 20, right: 30, bottom: 50, left: 60 }
    const width = 800 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom
    
    // Initialize
    if (!svgInitialized.current.sampleSize) {
      svg.selectAll('*').remove()
      svg
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      
      // Add dark background
      svg.append('rect')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('fill', '#0f172a')
        .attr('rx', 8)
      
      // Create gradient for curve
      const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'pvalue-gradient')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '100%').attr('y2', '0%')
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScheme.chart.primary)
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScheme.chart.secondary)
      
      svg.append('g')
        .attr('class', 'main-group')
        .attr('transform', `translate(${margin.left},${margin.top})`)
      
      svgInitialized.current.sampleSize = true
    }
    
    const g = svg.select('.main-group')
    g.selectAll('*').remove()
    
    // Generate data
    const sampleSizes = []
    for (let n = 10; n <= 500; n += 5) {
      const se = Math.sqrt(0.5 * 0.5 / n)
      const z = (0.6 - 0.5) / se
      const pVal = 2 * (1 - normalCDF(Math.abs(z)))
      sampleSizes.push({ n, pValue: pVal })
    }
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([10, 500])
      .range([0, width])
    
    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0])
    
    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('fill', '#e5e7eb')
      .style('text-anchor', 'middle')
      .text('Sample Size (n)')
    
    g.append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('fill', '#e5e7eb')
      .style('text-anchor', 'middle')
      .text('P-value')
    
    // Significance levels with animation
    const alphaLevels = [0.01, 0.05, 0.1]
    alphaLevels.forEach((alpha, i) => {
      const alphaLine = g.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', yScale(alpha))
        .attr('y2', yScale(alpha))
        .attr('stroke', colorScheme.chart.error)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.5)
      
      alphaLine.transition()
        .delay(i * 200)
        .duration(800)
        .attr('x2', width)
      
      g.append('text')
        .attr('x', width - 5)
        .attr('y', yScale(alpha) - 5)
        .attr('text-anchor', 'end')
        .attr('fill', colorScheme.chart.error)
        .style('font-size', '12px')
        .text(`α = ${alpha}`)
        .style('opacity', 0)
        .transition()
        .delay(i * 200 + 800)
        .duration(300)
        .style('opacity', 1)
    })
    
    // P-value curve with progressive drawing
    const line = d3.line()
      .x(d => xScale(d.n))
      .y(d => yScale(d.pValue))
      .curve(d3.curveBasis)
    
    const path = g.append('path')
      .datum(sampleSizes)
      .attr('fill', 'none')
      .attr('stroke', 'url(#pvalue-gradient)')
      .attr('stroke-width', 3)
      .attr('d', line)
    
    const totalLength = path.node().getTotalLength()
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .delay(600)
      .duration(2000)
      .ease(d3.easeQuadInOut)
      .attr('stroke-dashoffset', 0)
    
    // Current sample size indicator
    const currentData = sampleSizes.find(d => Math.abs(d.n - sampleSize) < 3)
    if (currentData) {
      const indicator = g.append('g')
        .attr('class', 'current-indicator')
        .style('opacity', 0)
      
      indicator.append('circle')
        .attr('cx', xScale(sampleSize))
        .attr('cy', yScale(currentData.pValue))
        .attr('r', 8)
        .attr('fill', colorScheme.chart.tertiary)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
      
      indicator.append('line')
        .attr('x1', xScale(sampleSize))
        .attr('x2', xScale(sampleSize))
        .attr('y1', height)
        .attr('y2', yScale(currentData.pValue))
        .attr('stroke', colorScheme.chart.tertiary)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0.5)
      
      indicator.transition()
        .delay(2600)
        .duration(500)
        .style('opacity', 1)
    }
    
    // Mark discovery after animation completes
    const timer = setTimeout(() => {
      markDiscovered('sample-size-effect')
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [activeSection, sampleSize, markDiscovered])
  
  // Clean up animations on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])
  
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <style jsx>{`
        svg .axis text {
          fill: #e5e7eb;
        }
        svg .axis line,
        svg .axis path {
          stroke: #374151;
        }
        svg .tick text {
          fill: #9ca3af;
        }
      `}</style>
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-xl mb-8 shadow-2xl">
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
      
      {/* Section Navigation with smooth transitions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {sections && sections.map((section, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveSection(idx)
              setIsAnimating(false)
              svgInitialized.current = {} // Reset animations on section change
            }}
            className={`p-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${
              activeSection === idx
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                : 'bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:border-purple-500/50 hover:bg-gray-800/70'
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
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-white">
            Binomial Distribution and Normal Approximation
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <svg ref={binomialNormalRef} className="w-full"></svg>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-200">Parameters</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">
                      Sample Size (n): <span className="font-mono text-purple-400">{sampleSize}</span>
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
                    <label className="text-sm text-gray-400 block mb-1">
                      Null Proportion (p₀): <span className="font-mono text-purple-400">{nullProportion.toFixed(2)}</span>
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
                    <label className="text-sm text-gray-400 block mb-1">
                      Observed Count (X): <span className="font-mono text-purple-400">{observedCount}</span>
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
              </div>
              
              <div className="bg-purple-900/20 border border-purple-700/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-purple-300">Key Insight</h3>
                <p className="text-sm text-purple-200">
                  When <span dangerouslySetInnerHTML={{ __html: `\\(n\\)` }} /> is large, the binomial distribution 
                  <span dangerouslySetInnerHTML={{ __html: ` \\(B(n, p)\\)` }} /> approximates a normal distribution 
                  with mean <span dangerouslySetInnerHTML={{ __html: `\\(\\mu = np\\)` }} /> and 
                  variance <span dangerouslySetInnerHTML={{ __html: ` \\(\\sigma^2 = np(1-p)\\)` }} />
                </p>
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-700/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-yellow-300">Observed Proportion</h3>
                <ObservedProportionFormula 
                  observedCount={observedCount}
                  sampleSize={sampleSize}
                  observedProportion={observedProportion}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Section 1: Continuity Correction */}
      {activeSection === 1 && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-white">Continuity Correction</h2>
          
          <div className="mb-4">
            <Button
              onClick={() => setShowContinuityCorrection(!showContinuityCorrection)}
              className={`transition-all duration-300 ${
                showContinuityCorrection 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' 
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
              }`}
            >
              {showContinuityCorrection ? 'Hide' : 'Show'} Continuity Correction
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <svg ref={continuityRef} className="w-full"></svg>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-gray-200">Why Continuity Correction?</h3>
                <p className="text-sm mb-3 text-gray-400">
                  The binomial distribution is discrete, but the normal distribution is continuous.
                  To improve the approximation, we adjust:
                </p>
                <ContinuityCorrectionFormula />
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg shadow-inner">
                <h3 className="font-semibold mb-2 text-purple-800">Test Statistic</h3>
                <TestStatisticFormulas 
                  zStatistic={zStatistic}
                  showContinuity={showContinuityCorrection}
                  observedProportion={observedProportion}
                  nullProportion={nullProportion}
                  sampleSize={sampleSize}
                  standardError={standardError}
                />
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-700/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-yellow-300">Engineering Example</h3>
                <p className="text-sm text-yellow-200">
                  In quality control, if 60 out of 100 products pass inspection,
                  we test whether the true pass rate differs from the standard 50%.
                  The continuity correction improves accuracy for finite samples.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Section 2: Large Counts Condition */}
      {activeSection === 2 && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-white">Large Counts Condition</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <svg ref={conditionRef} className="w-full"></svg>
              
              <div className="mt-6 bg-gray-800/50 border border-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-gray-200">Condition Check</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">np₀ = {sampleSize} × {nullProportion}</span>
                    <span className={`font-mono font-bold ${
                      largeCountsCondition.np0 >= 10 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {largeCountsCondition.np0.toFixed(1)} {largeCountsCondition.np0 >= 10 ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">n(1-p₀) = {sampleSize} × {(1 - nullProportion).toFixed(2)}</span>
                    <span className={`font-mono font-bold ${
                      largeCountsCondition.n1p0 >= 10 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {largeCountsCondition.n1p0.toFixed(1)} {largeCountsCondition.n1p0 >= 10 ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
                
                <div className={`mt-3 p-3 rounded transition-all duration-300 ${
                  largeCountsCondition.satisfied 
                    ? 'bg-green-900/20 border border-green-700/30' 
                    : 'bg-red-900/20 border border-red-700/30'
                }`}>
                  <p className={`text-sm font-semibold ${
                    largeCountsCondition.satisfied ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {largeCountsCondition.satisfied 
                      ? 'Normal approximation is valid! ✨' 
                      : 'Normal approximation may not be accurate ⚠️'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-purple-900/20 border border-purple-700/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-purple-300">Rule of Thumb</h3>
                <p className="text-sm mb-3 text-purple-200">
                  For the normal approximation to be valid, both:
                </p>
                <div className="bg-gray-800/50 p-3 rounded border border-gray-700/50">
                  <div dangerouslySetInnerHTML={{ 
                    __html: `\\[np_0 \\geq 10 \\text{ and } n(1-p_0) \\geq 10\\]` 
                  }} />
                </div>
                <p className="text-sm mt-3 text-purple-200">
                  This ensures the distribution isn't too skewed and has enough data in both tails.
                </p>
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-700/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-yellow-300">Common Scenarios</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-800/50 p-2 rounded border border-gray-700/50">
                    <div className="font-mono text-xs text-gray-300">n=30, p=0.5</div>
                    <div className="text-green-400 font-semibold">✓ Valid</div>
                  </div>
                  <div className="bg-gray-800/50 p-2 rounded border border-gray-700/50">
                    <div className="font-mono text-xs text-gray-300">n=20, p=0.1</div>
                    <div className="text-red-400 font-semibold">✗ Too small</div>
                  </div>
                  <div className="bg-gray-800/50 p-2 rounded border border-gray-700/50">
                    <div className="font-mono text-xs text-gray-300">n=100, p=0.05</div>
                    <div className="text-yellow-400 font-semibold">⚠ Borderline</div>
                  </div>
                  <div className="bg-gray-800/50 p-2 rounded border border-gray-700/50">
                    <div className="font-mono text-xs text-gray-300">n=200, p=0.3</div>
                    <div className="text-green-400 font-semibold">✓ Valid</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-gray-200">Alternative Methods</h3>
                <p className="text-sm text-gray-400">
                  When the large counts condition fails:
                </p>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-gray-400">
                  <li>Use exact binomial test</li>
                  <li>Apply Wilson score interval</li>
                  <li>Consider bootstrap methods</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Section 3: Sample Size Effects */}
      {activeSection === 3 && (
        <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-white">Sample Size and Statistical Power</h2>
          
          <div className="mb-4">
            <p className="text-gray-400">
              Testing H₀: p = 0.5 vs H₁: p ≠ 0.5 with observed proportion p̂ = 0.6
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <svg ref={sampleSizeRef} className="w-full"></svg>
            </div>
            
            <div className="space-y-4">
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
              
              <div className="bg-purple-900/20 border border-purple-700/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-purple-300">Key Insight</h3>
                <p className="text-sm text-purple-200">
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
              
              <div className="bg-yellow-900/20 border border-yellow-700/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-yellow-300">Test Type</h3>
                <div className="space-y-2">
                  {['two-sided', 'greater', 'less'].map(type => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value={type}
                        checked={testType === type}
                        onChange={(e) => setTestType(e.target.value)}
                        className="mr-2 accent-purple-600"
                      />
                      <span className="text-sm capitalize text-gray-300">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Complete Test Summary */}
          <div className="mt-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700/30 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-4 text-white">Complete Hypothesis Test</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-purple-300">Hypotheses</h4>
                <HypothesesFormula 
                  nullProportion={nullProportion}
                  testType={testType}
                />
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-purple-300">Test Results</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">Sample proportion: <span className="font-mono text-purple-400">{observedProportion.toFixed(3)}</span></p>
                  <p className="text-gray-300">Standard error: <span className="font-mono text-purple-400">{standardError.toFixed(4)}</span></p>
                  <p className="text-gray-300">Test statistic: <span className="font-mono text-purple-400">z = {zStatistic.toFixed(3)}</span></p>
                  <p className="text-gray-300">P-value: <span className={`font-mono font-bold ${
                    pValue < 0.05 ? 'text-red-400' : 'text-gray-400'
                  }`}>{pValue.toFixed(4)}</span></p>
                </div>
              </div>
            </div>
            
            <div className={`mt-4 p-3 rounded transition-all duration-300 border ${
              pValue < 0.05 
                ? 'bg-red-900/20 border-red-700/30' 
                : 'bg-gray-800/50 border-gray-700/50'
            }`}>
              <p className={`font-semibold ${pValue < 0.05 ? 'text-red-400' : 'text-gray-300'}`}>
                Decision at α = 0.05: {pValue < 0.05 ? 'Reject H₀' : 'Fail to reject H₀'}
              </p>
              <p className={`text-sm mt-1 ${pValue < 0.05 ? 'text-red-300' : 'text-gray-400'}`}>
                {pValue < 0.05 
                  ? `There is significant evidence that the proportion differs from ${nullProportion}`
                  : `There is insufficient evidence that the proportion differs from ${nullProportion}`}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Mathematical Discoveries */}
      <MathematicalDiscoveries 
        discoveries={discoveries}
        className="mt-8"
      />
    </div>
  )
}