"use client";
import React, { useState, useEffect, useRef, useContext } from "react";
import { useMathJax } from '@/hooks/useMathJax';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { InteractiveJourneyNavigation } from '@/components/ui/InteractiveJourneyNavigation';
import BackToHub from '@/components/ui/BackToHub';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import * as d3 from 'd3';
import { LEGACY_SOURCE_BY_KEY } from '@/lib/curriculum/manifest';
import { LearningActivityContext, useLearningActivity } from '@/hooks/useLearningActivity';

const STAGES = [
  {
    id: 'central-tendency',
    title: 'Central Tendency Analysis',
    icon: '📊',
    description: 'Master mean, median, and mode with interactive calculations',
    examWeight: '25%',
    timeEstimate: '5 min',
    keySkills: ['Calculate mean', 'Find median', 'Identify mode', 'Choose appropriate measure']
  },
  {
    id: 'dispersion',
    title: 'Measuring Spread',
    icon: '📐',
    description: 'Understand variance, standard deviation, and range',
    examWeight: '20%',
    timeEstimate: '5 min',
    keySkills: ['Calculate variance', 'Find standard deviation', 'Interpret spread']
  },
  {
    id: 'quartiles',
    title: 'Quartiles & IQR',
    icon: '📦',
    description: 'Explore the five-number summary and boxplots',
    examWeight: '15%',
    timeEstimate: '5 min',
    keySkills: ['Find quartiles', 'Calculate IQR', 'Create boxplots']
  },
  {
    id: 'outliers',
    title: 'Outlier Detection',
    icon: '🔍',
    description: 'Learn to identify and analyze outliers',
    examWeight: '10%',
    timeEstimate: '3 min',
    keySkills: ['1.5×IQR rule', 'Impact on measures', 'When to exclude']
  }
];

// Knowledge Check Component
const KnowledgeCheck = React.memo(function KnowledgeCheck({ stage, onComplete }) {
  const [answer, setAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  
  const questions = {
    'central-tendency': {
      question: 'Which measure is most affected by outliers?',
      options: ['Mean', 'Median', 'Mode'],
      correct: 'Mean',
      explanation: 'The mean uses all values in its calculation, so extreme values pull it toward them.'
    },
    'dispersion': {
      question: 'What does a large standard deviation indicate?',
      options: ['Data is spread out', 'Data is clustered', 'Data has outliers'],
      correct: 'Data is spread out',
      explanation: 'Large standard deviation means values are far from the mean on average.'
    },
    'quartiles': {
      question: 'What percentage of data is between Q1 and Q3?',
      options: ['25%', '50%', '75%'],
      correct: '50%',
      explanation: 'The IQR (Q3 - Q1) contains the middle 50% of the data.'
    },
    'outliers': {
      question: 'Using the 1.5×IQR rule, an outlier is a value that is:',
      options: ['More than 1.5×IQR from mean', 'More than 1.5×IQR from Q1 or Q3', 'More than 1.5 standard deviations from mean'],
      correct: 'More than 1.5×IQR from Q1 or Q3',
      explanation: 'Outliers are below Q1 - 1.5×IQR or above Q3 + 1.5×IQR.'
    }
  };
  
  const currentQ = questions[stage];
  if (!currentQ || !currentQ.options) return null;
  
  return (
    <div className="bg-purple-900/20 border border-purple-600/30 p-4 rounded-lg mt-4">
      <p className="text-sm font-semibold text-purple-400 mb-2">Quick Check:</p>
      <p className="text-sm text-neutral-300 mb-3">{currentQ.question}</p>
      <div className="flex gap-2 mb-3">
        {currentQ.options.map(opt => (
          <button
            key={opt}
            onClick={() => {
              setAnswer(opt);
              setShowFeedback(true);
              if (opt === currentQ.correct) {
                setTimeout(() => onComplete(), 1500);
              }
            }}
            className={cn(
              "px-3 py-1 rounded text-sm",
              answer === opt
                ? opt === currentQ.correct
                  ? "bg-green-600 text-white"
                  : "bg-red-500 text-white"
                : "bg-neutral-700 text-white hover:bg-neutral-600"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
      {showFeedback && (
        <p className="text-xs text-neutral-300">
          {answer === currentQ.correct ? '• ' : '• '}
          {currentQ.explanation}
        </p>
      )}
    </div>
  );
});

export function calculateDescriptiveStatistics(data, outlierMultiplier = 1.5) {
  if (data.length === 0) return null;

  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;

  // Mean
  const mean = data.reduce((sum, val) => sum + val, 0) / n;

  // Median
  const mid = Math.floor(n / 2);
  const median = n % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];

  // Mode
  const frequency = {};
  data.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
  });
  const maxFreq = Math.max(...Object.values(frequency));
  const mode = maxFreq > 1
    ? Object.keys(frequency)
        .filter(key => frequency[key] === maxFreq)
        .map(Number)
    : [];

  // Inverse empirical CDF, averaging at discontinuities (quantile type 2).
  const q1Index = Math.floor(n / 4);
  const q3Index = Math.floor(3 * n / 4);
  const q1 = n % 4 === 0
    ? (sorted[q1Index - 1] + sorted[q1Index]) / 2
    : sorted[q1Index];
  const q3 = n % 4 === 0
    ? (sorted[q3Index - 1] + sorted[q3Index]) / 2
    : sorted[q3Index];
  const iqr = q3 - q1;

  // Standard deviation
  const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  // Keep numerically equal decimal endpoints inside the inclusive interval.
  const endpointTolerance = 8 * Number.EPSILON * stdDev;
  const withinOneStdDev = data.filter(value => Math.abs(value - mean) <= stdDev + endpointTolerance).length;

  // Outliers
  const lowerBound = q1 - outlierMultiplier * iqr;
  const upperBound = q3 + outlierMultiplier * iqr;
  const outliers = data.filter(x => x < lowerBound || x > upperBound);

  return {
    mean, median, mode, q1, q3, iqr, stdDev, variance,
    count: n, withinOneStdDev, withinOneStdDevFraction: withinOneStdDev / n,
    min: sorted[0], max: sorted[n - 1],
    lowerBound, upperBound, outliers
  };
}

export const StatisticalAnalysis = React.memo(function StatisticalAnalysis({
  data, activeStage, outlierMultiplier = 1.5
}) {
  const contentRef = useMathJax([data, activeStage, outlierMultiplier]);
  const stats = React.useMemo(() => calculateDescriptiveStatistics(data, outlierMultiplier), [data, outlierMultiplier]);
  
  if (!stats) return null;
  
  const renderStageContent = () => {
    switch (activeStage) {
      case 0: // Central Tendency
        return (
          <div className="space-y-4">
            <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-700">
              <h5 className="text-sm font-semibold text-purple-300 mb-3">
                Calculating Central Tendency
              </h5>
              
              <div className="space-y-3">
                <div className="bg-black/30 p-3 rounded border border-purple-600/30">
                  <div className="text-center">
                    <div className="text-sm text-purple-200 mb-1">Mean (Average)</div>
                    <div className="font-mono text-base">
                      x̄ = Σxᵢ/n = {data.reduce((sum, val) => sum + val, 0).toFixed(1)}/{data.length} = {stats.mean.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-purple-300">
                    Sum all values and divide by count
                  </div>
                </div>
                
                <div className="bg-black/30 p-3 rounded border border-violet-600/30">
                  <div className="text-center">
                    <div className="text-sm text-violet-200 mb-1">Median (Middle Value)</div>
                    <div className="font-mono text-base">
                      {stats.median.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-violet-300">
                    The value that splits the data in half
                  </div>
                </div>
                
                <div className="bg-black/30 p-3 rounded border border-purple-600/30">
                  <div className="text-center">
                    <div className="text-sm text-purple-200 mb-1">Mode (Most Frequent)</div>
                    <div className="font-mono text-base">
                      {stats.mode.length === 0 ? 'No mode' : stats.mode.join(', ')}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-purple-300">
                    The value(s) that appear most often
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-purple-900/20 p-3 rounded-lg border border-purple-600/30">
                <strong className="text-indigo-300 text-sm">Key Insight:</strong>
                <div className="mt-1 text-xs text-indigo-200">
                  {stats.mean.toFixed(2) === stats.median.toFixed(2)
                    ? 'Mean and median match at the displayed precision.'
                    : stats.mean > stats.median
                      ? 'The mean is greater than the median for these values.'
                      : 'The mean is less than the median for these values.'}
                  <p className="mt-2">The mean–median gap can suggest asymmetry. Inspect the plot as well; these two summaries alone cannot establish symmetry or a normal model.</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 1: // Dispersion
        return (
          <div className="space-y-4">
            <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-700">
              <h5 className="text-sm font-semibold text-blue-300 mb-3">
                Measuring Data Spread
              </h5>
              
              <div className="space-y-3">
                <div className="bg-black/30 p-3 rounded border border-blue-600/30">
                  <div className="text-center">
                    <div className="text-sm text-blue-200 mb-1">Range</div>
                    <div className="font-mono text-base">
                      xₘₐₓ - xₘᵢₙ = {stats.max.toFixed(2)} - {stats.min.toFixed(2)} = {(stats.max - stats.min).toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-300">
                    Total spread from minimum to maximum
                  </div>
                </div>
                
                <div className="bg-black/30 p-3 rounded border border-cyan-600/30">
                  <div className="text-center">
                    <div className="text-sm text-cyan-200 mb-1">Variance</div>
                    <div className="font-mono text-base">
                      σ² = Σ(xᵢ - x̄)²/n = {stats.variance.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-cyan-300">
                    Average squared deviation from mean
                  </div>
                </div>
                
                <div className="bg-black/30 p-3 rounded border border-blue-600/30">
                  <div className="text-center">
                    <div className="text-sm text-blue-200 mb-1">Standard Deviation</div>
                    <div className="font-mono text-base">
                      σ = √σ² = √{stats.variance.toFixed(2)} = {stats.stdDev.toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-blue-300">
                    Root mean square distance from the mean, in the original units
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-blue-900/20 p-3 rounded-lg border border-blue-600/30">
                <strong className="text-teal-300 text-sm">Interpretation:</strong>
                <div className="mt-1 text-xs text-teal-200">
                  <p>{stats.withinOneStdDev} of {stats.count} displayed values ({(100 * stats.withinOneStdDevFraction).toFixed(1)}%) fall within the mean ± one descriptive standard deviation,
                    {' '}[{(stats.mean - stats.stdDev).toFixed(1)}, {(stats.mean + stats.stdDev).toFixed(1)}], including the endpoints.</p>
                  <p className="mt-2">Under a normal population model, about 68.27% of the population lies within its mean ± one population standard deviation. A finite dataset can have a different observed fraction.</p>
                  <p className="mt-2">These summaries describe the displayed values using divisor n. Estimating a population variance from a sample commonly uses n − 1 instead.</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2: // Quartiles
        return (
          <div className="space-y-4">
            <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-700">
              <h5 className="text-sm font-semibold text-emerald-300 mb-3">
                Five-Number Summary & IQR
              </h5>
              
              <div className="bg-black/30 p-3 rounded border border-emerald-600/30">
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div>
                    <div className="text-xs text-emerald-300">Min</div>
                    <div className="font-mono text-sm">{stats.min.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-emerald-300">Q₁</div>
                    <div className="font-mono text-sm">{stats.q1.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-emerald-300">Median</div>
                    <div className="font-mono text-sm">{stats.median.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-emerald-300">Q₃</div>
                    <div className="font-mono text-sm">{stats.q3.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-emerald-300">Max</div>
                    <div className="font-mono text-sm">{stats.max.toFixed(1)}</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/30 p-3 rounded border border-teal-600/30">
                <div className="text-center">
                  <div className="text-sm text-teal-200 mb-1">Interquartile Range (IQR)</div>
                  <div className="font-mono text-base">
                    IQR = Q₃ - Q₁ = {stats.q3.toFixed(2)} - {stats.q1.toFixed(2)} = {stats.iqr.toFixed(2)}
                  </div>
                </div>
                <div className="mt-2 text-xs text-teal-300">
                  The span between the 25th and 75th percentile cut points is {stats.iqr.toFixed(2)} units
                </div>
              </div>
              
              <div className="mt-4 bg-green-900/20 p-3 rounded-lg border border-green-600/30">
                <strong className="text-green-300 text-sm">Why IQR Matters:</strong>
                <div className="mt-1 text-xs text-green-200">
                  IQR summarizes the central spread and is less sensitive to extreme values than the full range.
                  <p className="mt-2">Quartile convention: use ranks n/4 and 3n/4 in the sorted data, counting from 1. Round a non-integer rank up; for an integer rank, average that value and the next. Other conventions may give different quartiles.</p>
                  <p className="mt-2">With ties or small datasets, the fraction of observations between these cut points need not be exactly 50%.</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3: // Outliers
        return (
          <div className="space-y-4">
            <div className="bg-neutral-900 p-4 rounded-lg border border-amber-700/50">
              <h5 className="text-sm font-semibold text-amber-300 mb-3">
                Outlier Detection ({outlierMultiplier}×IQR Rule)
              </h5>
              
              <div className="space-y-3">
                <div className="bg-black/30 p-3 rounded border border-amber-600/30">
                  <div className="text-center">
                    <div className="text-sm text-amber-200 mb-1">Lower Fence</div>
                    <div className="font-mono text-base">
                      Q₁ - {outlierMultiplier} × IQR = {stats.q1.toFixed(2)} - {outlierMultiplier} × {stats.iqr.toFixed(2)} = {stats.lowerBound.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/30 p-3 rounded border border-amber-600/30">
                  <div className="text-center">
                    <div className="text-sm text-red-200 mb-1">Upper Fence</div>
                    <div className="font-mono text-base">
                      Q₃ + {outlierMultiplier} × IQR = {stats.q3.toFixed(2)} + {outlierMultiplier} × {stats.iqr.toFixed(2)} = {stats.upperBound.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/30 p-3 rounded border border-amber-600/30">
                  <div className={cn("text-center text-sm", 
                    stats.outliers.length > 0 ? "text-amber-300" : "text-emerald-300"
                  )}>
                    {stats.outliers.length > 0 
                      ? `Potential outliers beyond the fences: ${stats.outliers.map(x => x.toFixed(2)).join(', ')}`
                      : 'No values beyond these IQR fences'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-amber-900/20 p-3 rounded-lg border border-amber-600/30">
                <strong className="text-rose-300 text-sm">Robustness Analysis:</strong>
                <div className="mt-1 space-y-1 text-xs text-rose-200">
                  <div>• The mean uses every value, so moving an extreme value changes it.</div>
                  <div>• The median depends on the middle ranks and is less sensitive to extreme values.</div>
                  <div>• IQR uses quartile ranks, so extreme changes beyond those ranks often leave it unchanged.</div>
                  <div>• Investigate a flagged value before deciding whether to remove it.</div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div ref={contentRef} className="bg-neutral-950 p-6 rounded-xl border border-neutral-700">
      {renderStageContent()}
    </div>
  );
});

function InteractiveDataViz({ data, onDataChange, activeStage }) {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 600;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Calculate statistics for visualization
    const sorted = [...data].sort((a, b) => a - b);
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, 30])
      .range([0, innerWidth]);
    
    // Add axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "#f3f4f6");
    
    // Create drag behavior
    const drag = d3.drag()
      .on("drag", function(event, d) {
        const newX = Math.max(0, Math.min(innerWidth, event.x));
        const newValue = xScale.invert(newX);
        
        d3.select(this)
          .attr("cx", newX)
          .select("title")
          .text(newValue.toFixed(1));
        
        const index = data.indexOf(d);
        const newData = [...data];
        newData[index] = newValue;
        onDataChange(newData);
      });
    
    // Add points
    const points = g.selectAll(".point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", d => xScale(d))
      .attr("cy", innerHeight / 2)
      .attr("r", 6)
      .attr("fill", "#8b5cf6")
      .attr("stroke", "#a78bfa")
      .attr("stroke-width", 2)
      .attr("cursor", "grab")
      .call(drag);
    
    points.append("title")
      .text(d => d.toFixed(1));
    
    // Add mean line if on central tendency stage
    if (activeStage === 0) {
      g.append("line")
        .attr("x1", xScale(mean))
        .attr("x2", xScale(mean))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#f59e0b")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4");
      
      g.append("text")
        .attr("x", xScale(mean))
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", "#f59e0b")
        .attr("font-size", "12px")
        .text(`Mean: ${mean.toFixed(1)}`);
    }
    
    // Add median line if on central tendency stage
    if (activeStage === 0) {
      g.append("line")
        .attr("x1", xScale(median))
        .attr("x2", xScale(median))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "#10b981")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4");
      
      g.append("text")
        .attr("x", xScale(median))
        .attr("y", innerHeight + 35)
        .attr("text-anchor", "middle")
        .attr("fill", "#10b981")
        .attr("font-size", "12px")
        .text(`Median: ${median.toFixed(1)}`);
    }
    
  }, [data, onDataChange, activeStage]);
  
  return (
    <div className="bg-black/30 p-4 rounded-lg border border-neutral-700/50">
      <h4 className="text-sm font-semibold text-neutral-300 mb-3">
        Interactive Data Points (drag to modify)
      </h4>
      <svg ref={svgRef}></svg>
      <div className="mt-2 text-xs text-neutral-400">
        Current values: {data.map(d => d.toFixed(1)).join(', ')}
      </div>
    </div>
  );
}

const SOURCE = LEGACY_SOURCE_BY_KEY['descriptive-stats-journey-progress'];

function JourneyContent({ learning, onComplete }) {
  const restored = SOURCE.targetIds.indexOf(learning.resume?.activityId);
  const currentStage = restored >= 0 ? restored : 0;
  const completedStages = STAGES.map((_, index) => index).filter(index => learning.isCompleted(SOURCE.targetIds[index]));
  const [showStageSelect, setShowStageSelect] = useState(false);
  const [data, setData] = useState([5, 7, 8, 9, 10, 11, 12, 14, 15, 18]);
  const interactionRef = useRef(0);
  useEffect(() => { interactionRef.current = 0; }, [currentStage]);
  const contexts = useRef({});
  const notification = useRef(null);
  const stageGeneration = learning.getResetGeneration(SOURCE.targetIds[currentStage], learning.writeCheckpoint);
  const contextKey = `${currentStage}:${stageGeneration}`;
  if (!contexts.current[contextKey]) contexts.current[contextKey] = learning.captureWriteContext(SOURCE.containerId);
  const context = contexts.current[contextKey];
  const currentContext = (index, captured) => learning.getResetGeneration(SOURCE.targetIds[index], learning.captureWriteContext(SOURCE.targetIds[index])) === learning.getResetGeneration(SOURCE.targetIds[index], captured);
  const completeStage = (index = currentStage, captured = context) => {
    if (!currentContext(index, captured)) return;
    notification.current = captured;
    void learning.completeActivity(SOURCE.targetIds[index], { sourceKey: 'descriptive-journey-stage-study', context: captured });
  };
  useEffect(() => {
    if (completedStages.length === STAGES.length && notification.current) {
      notification.current = null;
      onComplete?.();
    }
  }, [completedStages.length, onComplete]);

  const handleDataChange = newData => {
    if (!currentContext(currentStage, context)) return;
    setData(newData);
    interactionRef.current += 1;
    if (interactionRef.current >= 4 && !completedStages.includes(currentStage)) completeStage();
  };
  const handleStageComplete = () => completeStage();
  const handleStageSelect = index => {
    if (!Number.isInteger(index) || index < 0 || index >= STAGES.length) return;
    void learning.setResume(SOURCE.containerId, { activityId: SOURCE.targetIds[index], kind: 'stage' }, { context: learning.writeContext });
    setShowStageSelect(false);
    interactionRef.current = 0;
  };

  const addOutlier = () => {
    const outlierValue = Math.random() > 0.5 ? 25 + Math.random() * 5 : Math.random() * 3;
    setData([...data, outlierValue]);
    interactionRef.current += 1;
  };
  
  const resetData = () => {
    setData([5, 7, 8, 9, 10, 11, 12, 14, 15, 18]);
    interactionRef.current = 0;
  };
  
  return (
    <div className="space-y-6">
      {completedStages.length === STAGES.length && <p role="status" className="text-green-300">All four journey stages are studied.</p>}
      {/* Journey Header */}
      <div className="bg-neutral-900 border border-purple-600/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Data Descriptions Journey
            </h2>
            <p className="text-neutral-300">
              Master numerical summaries through interactive exploration of central tendency, dispersion, quartiles, and outlier detection
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowStageSelect(!showStageSelect)}
          >
            {showStageSelect ? 'Hide Stages' : 'View All Stages'}
          </Button>
        </div>
        
      </div>
      
      {/* Stage Selection Panel */}
      <AnimatePresence>
        {showStageSelect && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-900/50 rounded-lg border border-neutral-700/50">
              {STAGES.map((stage, index) => (
                <button
                  key={stage.id}
                  aria-pressed={currentStage === index}
                  aria-label={`${STAGES[index].title}${completedStages.includes(index) ? ": Studied" : ""}`}
                  onClick={() => handleStageSelect(index)}
                  className={cn(
                    "p-4 rounded-lg border transition-all text-left",
                    currentStage === index 
                      ? "border-purple-600 bg-purple-900/30" 
                      : "border-neutral-700 hover:border-neutral-600 bg-neutral-800/50",
                    completedStages.includes(index) && "border-green-600/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{stage.icon}</span>
                    {completedStages.includes(index) && (
                      <span className="text-green-500">✓</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{stage.title}</h3>
                  <p className="text-xs text-neutral-400">{stage.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Current Stage Header */}
      <div className="flex items-center justify-between bg-neutral-900/50 p-4 rounded-lg border border-neutral-700/50">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{STAGES[currentStage].icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Stage {currentStage + 1}: {STAGES[currentStage].title}
            </h3>
            <p className="text-sm text-neutral-400">
              {STAGES[currentStage].description}
            </p>
          </div>
        </div>
      </div>
      
      {/* Interactive Visualization */}
      <InteractiveDataViz 
        data={data} 
        onDataChange={handleDataChange}
        activeStage={currentStage}
      />
      
      {/* Control Panel */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={addOutlier}
        >
          Add Outlier
        </Button>
        <Button onClick={handleStageComplete} disabled={completedStages.includes(currentStage)}>
          {completedStages.includes(currentStage) ? '✓ Stage studied' : 'Mark stage as studied'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetData}
        >
          Reset Data
        </Button>
      </div>
      
      {/* Statistical Analysis */}
      <AnimatePresence mode="wait">
        <motion.div
          key={contextKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <StatisticalAnalysis 
            data={data} 
            activeStage={currentStage}
            outlierMultiplier={1.5}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation at the Bottom */}
      <InteractiveJourneyNavigation
        currentSection={currentStage}
        totalSections={STAGES.length}
        onNavigate={handleStageSelect}
        onComplete={handleStageComplete}
        sectionTitles={STAGES.map(s => s.title)}
        showProgress={true}
        progressVariant="purple"
        isCompleted={completedStages.includes(currentStage)}
        allowKeyboardNav={true}
        className="mt-8"
      />
      
      {/* Back to Hub Button */}
      <BackToHub chapter={4} bottom />
    </div>
  );
}

function journeyGeneration(learning) {
  return JSON.stringify([learning.getResetGeneration(SOURCE.containerId, learning.writeCheckpoint),
    ...SOURCE.targetIds.map(id => learning.getResetGeneration(id, learning.writeCheckpoint))]);
}

function StandaloneJourney({ onComplete }) {
  const learning = useLearningActivity(SOURCE.containerId);
  if (learning.loading) return <p role="status">Loading your journey progress…</p>;
  return <>
    {learning.persistenceStatus === 'session-only' && <div role="status" className="mb-4 text-sm text-amber-200">
      <p>Your recent changes are only kept for this visit. Export a backup from Your progress before closing this page.</p>
      <button className="min-h-11 underline" onClick={() => learning.retryLocalPersistence()}>Try saving again</button>
    </div>}
    <JourneyContent key={journeyGeneration(learning)} learning={learning} onComplete={onComplete} />
  </>;
}

export default function DescriptiveStatsJourney({ onComplete }) {
  const parent = useContext(LearningActivityContext);
  if (parent?.containerId === SOURCE.containerId) return <JourneyContent key={journeyGeneration(parent)} learning={parent} onComplete={onComplete} />;
  return <StandaloneJourney onComplete={onComplete} />;
}
