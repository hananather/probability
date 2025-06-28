"use client";
import React, { useState, useRef, useEffect } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '@/components/ui/VisualizationContainer';
import { colors, formatNumber } from '@/lib/design-system';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import CentralTendencyJourney from './4-1-central-tendency/4-1-1-CentralTendencyJourney';

// Custom color scheme for central tendency
const tendencyColors = {
  mean: '#3b82f6',      // Blue - fluid, affected by all values
  median: '#10b981',    // Green - stable, robust
  mode: '#f59e0b',      // Amber - peak, most frequent
  outlier: '#ef4444',   // Red - extreme values
  data: '#6b7280',      // Gray - neutral data points
  interactive: '#8b5cf6' // Purple - user interactions
};

// Learning stages with Brilliant.org-inspired progression
const LEARNING_STAGES = [
  {
    id: 'intro',
    title: 'The Story of the Typical',
    subtitle: 'What makes a value "typical"?',
    description: 'Imagine you\'re analyzing test scores for your class. Which single number best represents how the class performed?',
    unlockCondition: null,
    milestone: null
  },
  {
    id: 'mean',
    title: 'The Democratic Average',
    subtitle: 'Every value gets a vote',
    description: 'The mean gives equal weight to every data point. It\'s like letting everyone vote on where to meet - the final spot balances everyone\'s preferences.',
    unlockCondition: 'Add 5 data points',
    milestone: { icon: '🗳️', text: 'Democracy Discovered!' }
  },
  {
    id: 'median',
    title: 'The Stable Middle',
    subtitle: 'Finding the center that doesn\'t budge',
    description: 'The median is the middle value when sorted. It\'s like standing in the middle of a line - half the people are ahead, half behind.',
    unlockCondition: 'Add an outlier (>80)',
    milestone: { icon: '🎯', text: 'Stability Achieved!' }
  },
  {
    id: 'mode',
    title: 'The Popular Choice',
    subtitle: 'What\'s most common?',
    description: 'The mode is simply the most frequent value. It\'s like finding the most popular pizza topping - pure democracy of occurrence.',
    unlockCondition: 'Create duplicate values',
    milestone: { icon: '👥', text: 'Popularity Found!' }
  },
  {
    id: 'comparison',
    title: 'When They Disagree',
    subtitle: 'Understanding skewness',
    description: 'In symmetric data, all three measures cluster together. But in skewed data, they spread apart, each telling a different part of the story.',
    unlockCondition: 'Create a skewed distribution',
    milestone: { icon: '📊', text: 'Skewness Mastered!' }
  },
  {
    id: 'advanced',
    title: 'Advanced Models',
    subtitle: 'Physical analogies and deeper understanding',
    description: 'Ready to explore physical models? See how the mean acts as a balance point in our interactive seesaw simulation.',
    unlockCondition: 'Complete all previous stages',
    milestone: { icon: '🎓', text: 'Expert Level Unlocked!' }
  }
];

// Interactive challenges
const CHALLENGES = [
  { id: 'symmetric', text: 'Create a perfectly symmetric distribution', reward: '🎯' },
  { id: 'outlier', text: 'Add an outlier and watch the mean chase it', reward: '🏃' },
  { id: 'bimodal', text: 'Create a distribution with two modes', reward: '👥' },
  { id: 'skewed', text: 'Make mean > median by exactly 5 points', reward: '📐' },
  { id: 'stable', text: 'Keep median at 50 while adding values > 80', reward: '⚖️' }
];

function CentralTendencyMasterclass() {
  const [currentStage, setCurrentStage] = useState(0);
  const [dataPoints, setDataPoints] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [unlockedStages, setUnlockedStages] = useState(['intro']);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hoveredMeasure, setHoveredMeasure] = useState(null);
  const [animatingPoint, setAnimatingPoint] = useState(null);
  
  const mainVizRef = useRef(null);
  const d3Initialized = useRef(false);
  const elementsRef = useRef({
    svg: null,
    chartGroup: null,
    dotsGroup: null,
    measuresGroup: null,
    distributionGroup: null,
    xScale: null,
    yScale: null
  });
  
  // Calculate statistics
  const calculateStats = (data) => {
    if (data.length === 0) return { mean: 0, median: 0, modes: [], frequency: {} };
    
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
    
    const frequency = {};
    data.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    
    const freqValues = Object.values(frequency);
    const maxFreq = freqValues.length > 0 ? Math.max(...freqValues) : 0;
    const modes = Object.keys(frequency)
      .filter(key => frequency[key] === maxFreq && frequency[key] > 1)
      .map(Number);
    
    return { mean, median, modes, frequency };
  };
  
  const stats = calculateStats(dataPoints);
  const stage = LEARNING_STAGES[currentStage];
  
  // Check unlock conditions
  useEffect(() => {
    const checkUnlocks = () => {
      // Mean stage - need 5 points
      if (dataPoints.length >= 5 && !unlockedStages.includes('mean')) {
        setUnlockedStages([...unlockedStages, 'mean']);
        if (currentStage === 0) setCurrentStage(1);
      }
      
      // Median stage - need an outlier
      if (dataPoints.some(d => d > 80) && !unlockedStages.includes('median')) {
        setUnlockedStages([...unlockedStages, 'median']);
      }
      
      // Mode stage - need duplicates
      const hasDuplicates = Object.values(stats.frequency).some(f => f > 1);
      if (hasDuplicates && !unlockedStages.includes('mode')) {
        setUnlockedStages([...unlockedStages, 'mode']);
      }
      
      // Comparison stage - need skewed distribution
      const isSkewed = Math.abs(stats.mean - stats.median) > 3;
      if (isSkewed && !unlockedStages.includes('comparison')) {
        setUnlockedStages([...unlockedStages, 'comparison']);
      }
      
      // Advanced stage - complete all previous
      if (unlockedStages.length >= 5 && !unlockedStages.includes('advanced')) {
        setUnlockedStages([...unlockedStages, 'advanced']);
      }
    };
    
    checkUnlocks();
  }, [dataPoints, stats, unlockedStages, currentStage]);
  
  // Check challenges
  useEffect(() => {
    const checkChallenges = () => {
      // Symmetric distribution
      if (Math.abs(stats.mean - stats.median) < 0.5 && dataPoints.length > 5) {
        if (!completedChallenges.includes('symmetric')) {
          setCompletedChallenges([...completedChallenges, 'symmetric']);
        }
      }
      
      // Outlier challenge
      if (dataPoints.some(d => d > 80) && !completedChallenges.includes('outlier')) {
        setCompletedChallenges([...completedChallenges, 'outlier']);
      }
      
      // Bimodal
      if (stats.modes.length === 2 && !completedChallenges.includes('bimodal')) {
        setCompletedChallenges([...completedChallenges, 'bimodal']);
      }
      
      // Skewed
      if (Math.abs(stats.mean - stats.median - 5) < 0.2 && !completedChallenges.includes('skewed')) {
        setCompletedChallenges([...completedChallenges, 'skewed']);
      }
      
      // Stable median
      const hasHighValues = dataPoints.filter(d => d > 80).length >= 3;
      if (hasHighValues && Math.abs(stats.median - 50) < 0.5 && !completedChallenges.includes('stable')) {
        setCompletedChallenges([...completedChallenges, 'stable']);
      }
    };
    
    checkChallenges();
  }, [dataPoints, stats, completedChallenges]);
  
  // Initialize D3 visualization
  useEffect(() => {
    if (!mainVizRef.current || d3Initialized.current) return;
    
    const svg = d3.select(mainVizRef.current);
    const { width } = mainVizRef.current.getBoundingClientRect();
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Main group
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 10])
      .range([innerHeight, 0]);
    
    // Grid
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.1);
    
    // Groups for different elements
    const distributionGroup = g.append("g").attr("class", "distribution");
    const measuresGroup = g.append("g").attr("class", "measures");
    const dotsGroup = g.append("g").attr("class", "dots");
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-family", "monospace");
    
    // Store references
    elementsRef.current = {
      svg,
      chartGroup: g,
      dotsGroup,
      measuresGroup,
      distributionGroup,
      xScale,
      yScale
    };
    
    d3Initialized.current = true;
  }, []);
  
  // Update visualization
  useEffect(() => {
    if (!d3Initialized.current) return;
    
    const { dotsGroup, measuresGroup, xScale, yScale } = elementsRef.current;
    
    // Calculate stacking for dots
    const stackedData = [];
    const positions = {};
    
    dataPoints.forEach((value, idx) => {
      const key = Math.round(value);
      if (!positions[key]) positions[key] = 0;
      stackedData.push({
        value,
        originalIndex: idx,
        stackY: positions[key]++
      });
    });
    
    // Update y scale domain
    const maxStack = Math.max(5, ...Object.values(positions));
    yScale.domain([0, maxStack + 1]);
    
    // Data dots
    const dots = dotsGroup.selectAll(".data-dot")
      .data(stackedData, d => d.originalIndex);
    
    dots.enter()
      .append("circle")
      .attr("class", "data-dot")
      .attr("r", 0)
      .attr("cx", d => xScale(d.value))
      .attr("cy", yScale(0))
      .attr("fill", tendencyColors.data)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", function(event, d) {
        const newData = dataPoints.filter((_, i) => i !== d.originalIndex);
        setDataPoints(newData);
      })
      .transition()
      .duration(500)
      .attr("r", 6)
      .attr("cy", d => yScale(d.stackY + 0.5));
    
    dots.transition()
      .duration(500)
      .attr("cx", d => xScale(d.value))
      .attr("cy", d => yScale(d.stackY + 0.5));
    
    dots.exit()
      .transition()
      .duration(300)
      .attr("r", 0)
      .remove();
    
    // Measure lines
    const measures = [];
    if (dataPoints.length > 0) {
      if (currentStage >= 1) measures.push({ type: 'mean', value: stats.mean, color: tendencyColors.mean });
      if (currentStage >= 2) measures.push({ type: 'median', value: stats.median, color: tendencyColors.median });
      if (currentStage >= 3 && stats.modes.length > 0) {
        stats.modes.forEach(mode => measures.push({ type: 'mode', value: mode, color: tendencyColors.mode }));
      }
    }
    
    const measureLines = measuresGroup.selectAll(".measure-line")
      .data(measures, d => `${d.type}-${d.value}`);
    
    const measureEnter = measureLines.enter()
      .append("g")
      .attr("class", "measure-line");
    
    measureEnter.append("line")
      .attr("y1", 0)
      .attr("y2", yScale(0))
      .attr("stroke-width", 3)
      .attr("opacity", 0);
    
    measureEnter.append("rect")
      .attr("class", "measure-label-bg")
      .attr("y", -30)
      .attr("height", 25)
      .attr("rx", 4)
      .attr("fill", "#1a1a1a")
      .attr("stroke", d => d.color)
      .attr("stroke-width", 1)
      .attr("opacity", 0);
    
    measureEnter.append("text")
      .attr("class", "measure-label")
      .attr("y", -12)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("font-family", "monospace");
    
    // Update all measures
    measureLines.merge(measureEnter).each(function(d) {
      const g = d3.select(this);
      const x = xScale(d.value);
      
      g.select("line")
        .transition()
        .duration(500)
        .attr("x1", x)
        .attr("x2", x)
        .attr("stroke", d.color)
        .attr("opacity", hoveredMeasure === d.type ? 1 : 0.7);
      
      const label = `${d.type}: ${d.value.toFixed(1)}`;
      const labelWidth = label.length * 8 + 16;
      
      g.select(".measure-label-bg")
        .attr("x", x - labelWidth/2)
        .attr("width", labelWidth)
        .transition()
        .duration(500)
        .attr("opacity", hoveredMeasure === d.type ? 1 : 0.8);
      
      g.select(".measure-label")
        .attr("x", x)
        .attr("fill", d.color)
        .text(label)
        .transition()
        .duration(500)
        .attr("opacity", 1);
    });
    
    measureLines.exit()
      .transition()
      .duration(300)
      .style("opacity", 0)
      .remove();
      
  }, [dataPoints, stats, currentStage, hoveredMeasure]);
  
  // Add data point with animation
  const addDataPoint = (value) => {
    setAnimatingPoint(value);
    setTimeout(() => {
      setDataPoints([...dataPoints, value]);
      setAnimatingPoint(null);
    }, 300);
  };
  
  if (showAdvanced) {
    return (
      <VisualizationContainer title="4.1 Central Tendency - Advanced Physics Model">
        <div className="mb-4">
          <Button variant="secondary" size="sm" onClick={() => setShowAdvanced(false)}>
            ← Back to Main Lesson
          </Button>
        </div>
        <CentralTendencyJourney />
      </VisualizationContainer>
    );
  }
  
  return (
    <VisualizationContainer title="4.1 Central Tendency Masterclass">
      <div className="flex flex-col gap-6">
        {/* Progress Header */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-600/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-white">{stage.title}</h3>
            <div className="flex gap-2">
              {LEARNING_STAGES.map((s, idx) => (
                <div
                  key={s.id}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                    unlockedStages.includes(s.id) 
                      ? idx === currentStage ? 'w-8 bg-blue-500' : 'bg-blue-600' 
                      : 'bg-neutral-700'
                  }`}
                  onClick={() => {
                    if (unlockedStages.includes(s.id)) {
                      setCurrentStage(idx);
                    }
                  }}
                />
              ))}
            </div>
          </div>
          <p className="text-neutral-300 text-sm">{stage.subtitle}</p>
          <p className="text-neutral-400 text-sm mt-2">{stage.description}</p>
        </div>
        
        {/* Main Visualization */}
        <GraphContainer height="400px">
          <svg ref={mainVizRef} style={{ width: "100%", height: "100%" }} />
          
          {/* Click hint for empty state */}
          {dataPoints.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-neutral-500 text-lg animate-pulse">
                Click anywhere on the chart to add data points
              </div>
            </div>
          )}
          
          {/* Animating point */}
          {animatingPoint !== null && (
            <div 
              className="absolute w-3 h-3 bg-purple-500 rounded-full animate-ping"
              style={{
                left: `${60 + (animatingPoint / 100) * (100 - 100)}%`,
                top: '50%'
              }}
            />
          )}
        </GraphContainer>
        
        {/* Interactive Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quick Add Buttons */}
          <VisualizationSection>
            <ControlGroup>
              <label className="text-sm text-neutral-400">Quick Add Values:</label>
              <div className="grid grid-cols-5 gap-2">
                {[10, 30, 50, 70, 90].map(val => (
                  <Button
                    key={val}
                    variant={val > 80 ? "danger" : "secondary"}
                    size="sm"
                    onClick={() => addDataPoint(val)}
                  >
                    {val}
                  </Button>
                ))}
              </div>
            </ControlGroup>
          </VisualizationSection>
          
          {/* Current Statistics */}
          <VisualizationSection>
            <div className="p-3">
              <h4 className="text-sm font-semibold text-neutral-400 mb-2">Current Measures:</h4>
              <div className="space-y-1">
                {currentStage >= 1 && (
                  <div 
                    className="flex justify-between items-center cursor-pointer hover:bg-neutral-800/50 p-1 rounded"
                    onMouseEnter={() => setHoveredMeasure('mean')}
                    onMouseLeave={() => setHoveredMeasure(null)}
                  >
                    <span style={{ color: tendencyColors.mean }}>Mean</span>
                    <span className="font-mono">{dataPoints.length > 0 ? stats.mean.toFixed(1) : '—'}</span>
                  </div>
                )}
                {currentStage >= 2 && (
                  <div 
                    className="flex justify-between items-center cursor-pointer hover:bg-neutral-800/50 p-1 rounded"
                    onMouseEnter={() => setHoveredMeasure('median')}
                    onMouseLeave={() => setHoveredMeasure(null)}
                  >
                    <span style={{ color: tendencyColors.median }}>Median</span>
                    <span className="font-mono">{dataPoints.length > 0 ? stats.median.toFixed(1) : '—'}</span>
                  </div>
                )}
                {currentStage >= 3 && (
                  <div 
                    className="flex justify-between items-center cursor-pointer hover:bg-neutral-800/50 p-1 rounded"
                    onMouseEnter={() => setHoveredMeasure('mode')}
                    onMouseLeave={() => setHoveredMeasure(null)}
                  >
                    <span style={{ color: tendencyColors.mode }}>Mode</span>
                    <span className="font-mono">
                      {stats.modes.length > 0 ? stats.modes.join(', ') : '—'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </VisualizationSection>
          
          {/* Actions */}
          <VisualizationSection>
            <div className="p-3 space-y-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full"
                onClick={() => setDataPoints([])}
              >
                Clear All
              </Button>
              {currentStage === 5 && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="w-full animate-pulse"
                  onClick={() => setShowAdvanced(true)}
                >
                  Try Physics Model →
                </Button>
              )}
            </div>
          </VisualizationSection>
        </div>
        
        {/* Challenges Section */}
        <VisualizationSection>
          <div className="p-4">
            <h4 className="text-lg font-semibold text-white mb-3">Challenges</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {CHALLENGES.map(challenge => {
                const completed = completedChallenges.includes(challenge.id);
                return (
                  <div
                    key={challenge.id}
                    className={`p-3 rounded-lg border transition-all ${
                      completed 
                        ? 'bg-green-900/20 border-green-600/50' 
                        : 'bg-neutral-800/50 border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${completed ? 'text-green-400' : 'text-neutral-300'}`}>
                        {challenge.text}
                      </span>
                      <span className="text-xl">{completed ? challenge.reward : '🔒'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </VisualizationSection>
        
        {/* Milestones */}
        <AnimatePresence>
          {stage.milestone && unlockedStages.includes(stage.id) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-600/30">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{stage.milestone.icon}</span>
                  <div>
                    <h4 className="text-lg font-bold text-yellow-400">Milestone Achieved!</h4>
                    <p className="text-yellow-300">{stage.milestone.text}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Progress Summary */}
        <div className="flex items-center justify-between text-sm text-neutral-400">
          <span>Data Points: {dataPoints.length}</span>
          <ProgressBar 
            current={unlockedStages.length} 
            total={LEARNING_STAGES.length} 
            label="Concepts Unlocked" 
            variant="purple"
            className="w-64"
          />
          <span>Challenges: {completedChallenges.length}/{CHALLENGES.length}</span>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default CentralTendencyMasterclass;