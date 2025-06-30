"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '@/lib/design-system';
import { ProgressBar } from '../../ui/ProgressBar';
import { Button } from '../../ui/button';
import { tutorial_5_2_1 } from '@/tutorials/chapter5';
// Temporarily comment out shared imports to debug
// import { 
//   ConfidenceIntervalVisualizer,
//   StageProgressionWrapper,
//   FormulaHighlighter,
//   DiscoveryBadge,
//   useStageProgression,
//   useDiscoveryTracking
// } from '../shared';

// Use inference color scheme
const colorScheme = createColorScheme('inference');

// Learning stages for 68-95-99.7 rule
const LEARNING_STAGES = [
  {
    id: 'explore-68',
    title: '68% Confidence',
    description: 'Most values fall within 1 standard deviation',
    confidenceLevel: 0.68,
    zScore: 1,
    unlocks: ['basic-controls']
  },
  {
    id: 'discover-95',
    title: '95% Confidence',
    description: 'The standard choice for research',
    confidenceLevel: 0.95,
    zScore: 1.96,
    unlocks: ['sample-size-control']
  },
  {
    id: 'master-997',
    title: '99.7% Confidence',
    description: 'Nearly all values within 3 standard deviations',
    confidenceLevel: 0.997,
    zScore: 2.576,
    unlocks: ['animation-controls', 'discoveries']
  }
];

// Focused visualization component
const EmpiricalRuleVisualization = memo(function EmpiricalRuleVisualization({ 
  mean, std, selectedLevel, showAnimation, sampleSize 
}) {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([mean - 4 * std, mean + 4 * std])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 0.03])
      .range([innerHeight, 0]);
    
    // Generate normal curve data
    const xValues = d3.range(mean - 4 * std, mean + 4 * std, std / 10);
    const normalData = xValues.map(x => ({
      x: x,
      y: jStat.normal.pdf(x, mean, std)
    }));
    
    // Draw the normal curve
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    
    g.append("path")
      .datum(normalData)
      .attr("fill", "none")
      .attr("stroke", colorScheme.chart.secondary)
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Calculate interval bounds
    const { zScore, confidenceLevel } = selectedLevel;
    const standardError = std / Math.sqrt(sampleSize);
    const marginOfError = zScore * standardError;
    const lowerBound = mean - zScore * std;
    const upperBound = mean + zScore * std;
    
    // Shade the confidence interval region
    const areaData = normalData.filter(d => d.x >= lowerBound && d.x <= upperBound);
    
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(innerHeight)
      .y1(d => yScale(d.y))
      .curve(d3.curveMonotoneX);
    
    const shadedArea = g.append("path")
      .datum(areaData)
      .attr("fill", colorScheme.chart.primary)
      .attr("opacity", 0)
      .attr("d", area);
    
    if (showAnimation) {
      shadedArea.transition()
        .duration(800)
        .attr("opacity", 0.3);
    } else {
      shadedArea.attr("opacity", 0.3);
    }
    
    // Draw vertical lines at bounds
    [lowerBound, upperBound].forEach((bound, i) => {
      const line = g.append("line")
        .attr("x1", xScale(bound))
        .attr("x2", xScale(bound))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colorScheme.chart.accent)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0);
      
      if (showAnimation) {
        line.transition()
          .delay(400 + i * 200)
          .duration(500)
          .attr("opacity", 1);
      } else {
        line.attr("opacity", 1);
      }
    });
    
    // Add mean line
    g.append("line")
      .attr("x1", xScale(mean))
      .attr("x2", xScale(mean))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", colorScheme.chart.tertiary)
      .attr("stroke-width", 2);
    
    // Add labels
    const labels = [
      { x: lowerBound, text: `-${zScore}σ`, color: colorScheme.chart.accent },
      { x: mean, text: 'μ', color: colorScheme.chart.tertiary },
      { x: upperBound, text: `+${zScore}σ`, color: colorScheme.chart.accent }
    ];
    
    labels.forEach((label, i) => {
      const text = g.append("text")
        .attr("x", xScale(label.x))
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", label.color)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .text(label.text)
        .attr("opacity", 0);
      
      if (showAnimation) {
        text.transition()
          .delay(600 + i * 100)
          .duration(300)
          .attr("opacity", 1);
      } else {
        text.attr("opacity", 1);
      }
    });
    
    // Add percentage label
    const percentageLabel = g.append("text")
      .attr("x", xScale(mean))
      .attr("y", innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", colors.chart.text)
      .style("font-size", "24px")
      .style("font-weight", "700")
      .text(`${(confidenceLevel * 100).toFixed(0)}%`)
      .attr("opacity", 0);
    
    if (showAnimation) {
      percentageLabel.transition()
        .delay(1000)
        .duration(500)
        .attr("opacity", 0.8);
    } else {
      percentageLabel.attr("opacity", 0.8);
    }
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(7));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .style("font-size", "11px")
      .attr("fill", colors.chart.text);
    
  }, [mean, std, selectedLevel, showAnimation, sampleSize]);
  
  return <svg ref={svgRef} style={{ width: "100%", height: 300 }} />;
});

function ConfidenceIntervalBuilder() {
  // Use course example values: IQ scores with μ=100, σ=15
  const populationMean = 100;
  const populationStd = 15;
  
  // Simplified state management for debugging
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState([]);
  const [discoveries, setDiscoveries] = useState([]);
  
  const isStageUnlocked = (stageId) => {
    const index = LEARNING_STAGES.findIndex(s => s.id === stageId);
    return index === 0 || completedStages.includes(LEARNING_STAGES[index - 1].id);
  };
  
  const trackDiscovery = (discoveryId) => {
    if (!discoveries.includes(discoveryId)) {
      setDiscoveries(prev => [...prev, discoveryId]);
    }
  };
  
  // Simplified state
  const [sampleSize, setSampleSize] = useState(25);
  const [selectedLevel, setSelectedLevel] = useState(LEARNING_STAGES[0]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [interactions, setInteractions] = useState(0);
  
  // Handle confidence level selection
  const selectConfidenceLevel = useCallback((stage) => {
    if (!isStageUnlocked(stage.id)) return;
    
    setSelectedLevel(stage);
    setShowAnimation(true);
    setInteractions(prev => prev + 1);
    
    // Complete current stage when moving to next
    if (stage.id === 'discover-95' && !completedStages.includes('explore-68')) {
      setCompletedStages(prev => [...prev, 'explore-68']);
      setCurrentStage(1);
    } else if (stage.id === 'master-997' && !completedStages.includes('discover-95')) {
      setCompletedStages(prev => [...prev, 'discover-95']);
      setCurrentStage(2);
    }
    
    // Track discoveries
    if (interactions === 0) {
      trackDiscovery('empirical-rule');
    }
    if (interactions === 2) {
      trackDiscovery('z-scores');
    }
    if (stage.id === 'master-997' && !discoveries.includes('interval-width')) {
      trackDiscovery('interval-width');
    }
    
    setTimeout(() => setShowAnimation(false), 1500);
  }, [interactions, isStageUnlocked, trackDiscovery, currentStage, discoveries, completedStages]);
  
  // Handle sample size change
  const handleSampleSizeChange = useCallback((newSize) => {
    setSampleSize(newSize);
    if (newSize >= 50 && !discoveries.includes('sample-size-effect')) {
      trackDiscovery('sample-size-effect');
    }
  }, [discoveries, trackDiscovery]);
  
  // Initialize first time
  useEffect(() => {
    if (interactions === 0) {
      const timer = setTimeout(() => {
        setInteractions(1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [interactions]);
  
  return (
    <VisualizationContainer 
      title="The 68-95-99.7 Rule"
      tutorialSteps={tutorial_5_2_1}
      tutorialKey="ci-68-95-997-rule"
    >
      {/* Temporarily remove wrapper for debugging */}
      <div>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Panel - Focused Controls */}
          <div className="lg:w-1/4 space-y-3">
            <VisualizationSection className="p-3">
              <h4 className="text-base font-bold text-white mb-3">Select Confidence Level</h4>
              
              <div className="space-y-2">
                {LEARNING_STAGES.map((stage, index) => {
                  const isUnlocked = isStageUnlocked(stage.id);
                  const isSelected = selectedLevel.id === stage.id;
                  
                  return (
                    <button
                      key={stage.id}
                      onClick={() => selectConfidenceLevel(stage)}
                      disabled={!isUnlocked}
                      className={cn(
                        "w-full p-3 rounded-lg transition-all duration-300 text-left",
                        isUnlocked ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                        isSelected 
                          ? "bg-purple-600 text-white shadow-lg" 
                          : isUnlocked
                            ? "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                            : "bg-neutral-800 text-neutral-500"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{stage.title}</div>
                          <div className="text-xs opacity-80 mt-1">{stage.description}</div>
                        </div>
                        <div className="text-2xl font-mono">
                          {isUnlocked ? `±${stage.zScore}σ` : '🔒'}
                        </div>
                      </div>
                      {!isUnlocked && index > 0 && (
                        <div className="text-xs text-yellow-400 mt-2">
                          Complete previous level to unlock
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </VisualizationSection>
            
            {/* Sample Size Control - Unlocked after 95% */}
            {isStageUnlocked('discover-95') && (
              <VisualizationSection className="p-3">
                <h4 className="text-sm font-semibold text-white mb-2">Sample Size Effect</h4>
                <div>
                  <label className="text-xs text-neutral-300 mb-1 block">
                    n = {sampleSize} {sampleSize >= 50 && '✨'}
                  </label>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={sampleSize}
                    onChange={(e) => handleSampleSizeChange(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-neutral-500 mt-1">
                    <span>5</span>
                    <span>100</span>
                  </div>
                </div>
              </VisualizationSection>
            )}
            
            {/* Discovery Badges - simplified */}
            {discoveries.length > 0 && (
              <VisualizationSection className="p-3">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Discoveries</h4>
                <div className="text-xs text-neutral-300">
                  {discoveries.length} concepts unlocked
                </div>
              </VisualizationSection>
            )}
          </div>
          
          {/* Right Panel - Visualization */}
          <div className="lg:w-3/4 space-y-4">
            <GraphContainer>
              <EmpiricalRuleVisualization 
                mean={populationMean}
                std={populationStd}
                selectedLevel={selectedLevel}
                showAnimation={showAnimation}
                sampleSize={sampleSize}
              />
            </GraphContainer>
            
            {/* Formula Display */}
            <VisualizationSection className="p-4">
              <div className="bg-neutral-800/50 rounded-lg p-6 border border-neutral-700">
                <div className="text-xl text-center text-white mb-4">
                  CI = x̄ ± {selectedLevel.zScore} × (σ/√n)
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center">
                    <div className="text-green-400 font-mono">z = {selectedLevel.zScore}</div>
                    <div className="text-xs text-neutral-400">Critical value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-mono">σ = {populationStd}</div>
                    <div className="text-xs text-neutral-400">Population SD</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 font-mono">n = {sampleSize}</div>
                    <div className="text-xs text-neutral-400">Sample size</div>
                  </div>
                </div>
              </div>
              
              {/* Quick calculation */}
              <div className="mt-4 bg-neutral-800 p-3 rounded">
                <div className="text-sm text-neutral-300">
                  <div>Standard Error = {populationStd}/√{sampleSize} = {(populationStd / Math.sqrt(sampleSize)).toFixed(2)}</div>
                  <div>Margin of Error = {selectedLevel.zScore} × {(populationStd / Math.sqrt(sampleSize)).toFixed(2)} = {(selectedLevel.zScore * populationStd / Math.sqrt(sampleSize)).toFixed(2)}</div>
                  <div className="font-semibold text-purple-400 mt-2">
                    {(selectedLevel.confidenceLevel * 100).toFixed(0)}% CI: [{(populationMean - selectedLevel.zScore * populationStd / Math.sqrt(sampleSize)).toFixed(2)}, {(populationMean + selectedLevel.zScore * populationStd / Math.sqrt(sampleSize)).toFixed(2)}]
                  </div>
                </div>
              </div>
            </VisualizationSection>
            
            {/* Learning Insights */}
            <VisualizationSection className="p-4">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">What You've Learned</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className={cn(
                  "p-2 rounded border",
                  discoveries.includes('empirical-rule') 
                    ? "bg-green-900/20 border-green-600/30 text-green-400"
                    : "bg-neutral-800 border-neutral-700 text-neutral-500"
                )}>
                  <div className="font-semibold">68-95-99.7 Rule</div>
                  <div className="text-xs opacity-80">The three key percentages</div>
                </div>
                <div className={cn(
                  "p-2 rounded border",
                  discoveries.includes('z-scores') 
                    ? "bg-green-900/20 border-green-600/30 text-green-400"
                    : "bg-neutral-800 border-neutral-700 text-neutral-500"
                )}>
                  <div className="font-semibold">Critical Values</div>
                  <div className="text-xs opacity-80">z = 1, 1.96, 2.576</div>
                </div>
                <div className={cn(
                  "p-2 rounded border",
                  discoveries.includes('interval-width') 
                    ? "bg-green-900/20 border-green-600/30 text-green-400"
                    : "bg-neutral-800 border-neutral-700 text-neutral-500"
                )}>
                  <div className="font-semibold">Width Pattern</div>
                  <div className="text-xs opacity-80">Higher confidence = wider</div>
                </div>
                <div className={cn(
                  "p-2 rounded border",
                  discoveries.includes('sample-size-effect') 
                    ? "bg-green-900/20 border-green-600/30 text-green-400"
                    : "bg-neutral-800 border-neutral-700 text-neutral-500"
                )}>
                  <div className="font-semibold">Sample Size</div>
                  <div className="text-xs opacity-80">Larger n = narrower CI</div>
                </div>
              </div>
            </VisualizationSection>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default ConfidenceIntervalBuilder;