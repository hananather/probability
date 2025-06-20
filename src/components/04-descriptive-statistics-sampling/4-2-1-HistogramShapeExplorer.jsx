"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "@/utils/d3-utils";
import { jStat } from "jstat";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/button';
import { RangeSlider } from "../ui/RangeSlider";

// Use sampling color scheme
const colorScheme = createColorScheme('sampling');

// Achievement definitions
const achievements = [
  { id: 'first_shape', name: '👀 Shape Spotter', description: 'Identified your first distribution shape', unlocked: false },
  { id: 'streak_3', name: '🔥 On Fire!', description: 'Got 3 shape identifications in a row', unlocked: false },
  { id: 'streak_5', name: '⚡ Lightning Fast', description: 'Got 5 shape identifications in a row', unlocked: false },
  { id: 'bin_master', name: '📊 Bin Master', description: 'Found the optimal bin count 3 times', unlocked: false },
  { id: 'explorer', name: '🗺️ Data Explorer', description: 'Tried all distribution types', unlocked: false },
  { id: 'perfect_score', name: '🌟 Perfect Score', description: 'Completed 10 challenges without mistakes', unlocked: false },
  { id: 'shape_expert', name: '🎓 Shape Expert', description: 'Correctly identified 20 shapes', unlocked: false },
  { id: 'speed_demon', name: '⚡ Speed Demon', description: 'Identified a shape in under 3 seconds', unlocked: false }
];

// Fun real-world scenarios
const scenarios = [
  {
    title: "🎮 Gaming Session Lengths",
    story: "You're analyzing how long players stay in your new game. Most quit early, but some play for hours!",
    type: "exponential",
    params: { rate: 2 },
    expectedShape: "right-skewed"
  },
  {
    title: "🎯 Test Scores",
    story: "Final exam results are in! Most students did well, with scores clustered around 75%.",
    type: "normal",
    params: { mean: 0.75, std: 0.15 },
    expectedShape: "symmetric"
  },
  {
    title: "💰 Income Distribution",
    story: "City income data shows most people earn moderate amounts, but a few earn much more.",
    type: "exponential",
    params: { rate: 1.5 },
    expectedShape: "right-skewed"
  },
  {
    title: "📱 App Response Times",
    story: "Your app is fast! Response times center around 100ms with little variation.",
    type: "normal",
    params: { mean: 0, std: 0.5 },
    expectedShape: "symmetric"
  },
  {
    title: "🏃 Marathon Times",
    story: "Race results show most runners finish around 4 hours, with elite runners creating a left tail.",
    type: "normal",
    params: { mean: -0.5, std: 1.2 },
    expectedShape: "left-skewed"
  }
];

// Helper function to validate and clean data
const cleanData = (data) => {
  return data
    .filter(x => !isNaN(x) && isFinite(x))
    .map(x => Math.max(-10, Math.min(10, x))); // Bound data to reasonable range
};

// Confetti animation helper
const createConfetti = (svg, x, y) => {
  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
  const confettiCount = 20;
  
  for (let i = 0; i < confettiCount; i++) {
    const angle = (Math.PI * 2 * i) / confettiCount;
    const velocity = 5 + Math.random() * 5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const confetti = svg.append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', 8)
      .attr('height', 8)
      .attr('fill', color)
      .attr('opacity', 1)
      .style('transform-origin', 'center');
    
    confetti
      .transition()
      .duration(1000)
      .ease(d3.easeQuadOut)
      .attr('x', x + Math.cos(angle) * velocity * 30)
      .attr('y', y + Math.sin(angle) * velocity * 30 + 50)
      .attr('opacity', 0)
      .style('transform', `rotate(${Math.random() * 720}deg)`)
      .remove();
  }
};

function HistogramShapeExplorer() {
  const [gameMode, setGameMode] = useState('explore'); // 'explore', 'challenge', 'bin-optimizer'
  const [distributionType, setDistributionType] = useState('normal');
  const [numBins, setNumBins] = useState(20);
  const [data, setData] = useState([]);
  const [stage, setStage] = useState(1);
  const [totalInteractions, setTotalInteractions] = useState(0);
  
  // Game state
  const [currentScenario, setCurrentScenario] = useState(null);
  const [challengeActive, setChallengeActive] = useState(false);
  const [userGuess, setUserGuess] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(0);
  const [userAchievements, setUserAchievements] = useState(achievements);
  const [showAchievement, setShowAchievement] = useState(null);
  const [challengeStartTime, setChallengeStartTime] = useState(null);
  
  // Bin optimizer game state
  const [binScore, setBinScore] = useState(0);
  const [optimalBinFinds, setOptimalBinFinds] = useState(0);
  const [binHint, setBinHint] = useState('');
  
  // Distribution parameters
  const [normalParams, setNormalParams] = useState({ mean: 0, std: 1 });
  const [exponentialParams, setExponentialParams] = useState({ rate: 1 });
  
  const svgRef = useRef(null);
  const celebrationTimeoutRef = useRef(null);
  
  // Check and unlock achievements
  const checkAchievements = useCallback(() => {
    const newAchievements = [...userAchievements];
    let newUnlock = null;
    
    // First shape identification
    if (correctAnswers === 1 && !newAchievements.find(a => a.id === 'first_shape').unlocked) {
      const achievement = newAchievements.find(a => a.id === 'first_shape');
      achievement.unlocked = true;
      newUnlock = achievement;
    }
    
    // Streak achievements
    if (streak >= 3 && !newAchievements.find(a => a.id === 'streak_3').unlocked) {
      const achievement = newAchievements.find(a => a.id === 'streak_3');
      achievement.unlocked = true;
      newUnlock = achievement;
    }
    
    if (streak >= 5 && !newAchievements.find(a => a.id === 'streak_5').unlocked) {
      const achievement = newAchievements.find(a => a.id === 'streak_5');
      achievement.unlocked = true;
      newUnlock = achievement;
    }
    
    // Bin master
    if (optimalBinFinds >= 3 && !newAchievements.find(a => a.id === 'bin_master').unlocked) {
      const achievement = newAchievements.find(a => a.id === 'bin_master');
      achievement.unlocked = true;
      newUnlock = achievement;
    }
    
    // Shape expert
    if (correctAnswers >= 20 && !newAchievements.find(a => a.id === 'shape_expert').unlocked) {
      const achievement = newAchievements.find(a => a.id === 'shape_expert');
      achievement.unlocked = true;
      newUnlock = achievement;
    }
    
    // Perfect score
    if (correctAnswers >= 10 && correctAnswers === totalChallenges && !newAchievements.find(a => a.id === 'perfect_score').unlocked) {
      const achievement = newAchievements.find(a => a.id === 'perfect_score');
      achievement.unlocked = true;
      newUnlock = achievement;
    }
    
    // Speed demon
    if (challengeStartTime && Date.now() - challengeStartTime < 3000 && userGuess && !newAchievements.find(a => a.id === 'speed_demon').unlocked) {
      const achievement = newAchievements.find(a => a.id === 'speed_demon');
      achievement.unlocked = true;
      newUnlock = achievement;
    }
    
    setUserAchievements(newAchievements);
    
    if (newUnlock) {
      setShowAchievement(newUnlock);
      if (celebrationTimeoutRef.current) clearTimeout(celebrationTimeoutRef.current);
      celebrationTimeoutRef.current = setTimeout(() => setShowAchievement(null), 3000);
    }
  }, [correctAnswers, streak, optimalBinFinds, totalChallenges, userAchievements, challengeStartTime, userGuess]);
  
  // Generate data based on distribution type
  const generateData = useCallback(() => {
    let newData = [];
    const sampleSize = 300;
    
    try {
      switch (distributionType) {
        case 'normal':
          for (let i = 0; i < sampleSize; i++) {
            const value = jStat.normal.sample(normalParams.mean, normalParams.std);
            newData.push(value);
          }
          break;
          
        case 'exponential':
          for (let i = 0; i < sampleSize; i++) {
            const value = jStat.exponential.sample(exponentialParams.rate);
            newData.push(Math.min(value - 1, 8));
          }
          break;
          
        case 'left-skewed':
          // Generate left-skewed by negating right-skewed
          for (let i = 0; i < sampleSize; i++) {
            const value = jStat.exponential.sample(1.5);
            newData.push(-Math.min(value - 1, 8));
          }
          break;
      }
      
      const cleanedData = cleanData(newData);
      setData(cleanedData);
      setTotalInteractions(prev => prev + 1);
      
    } catch (error) {
      console.error('Error generating distribution:', error);
      const fallbackData = Array.from({ length: sampleSize }, () => 
        jStat.normal.sample(0, 1)
      );
      setData(cleanData(fallbackData));
    }
  }, [distributionType, normalParams, exponentialParams]);
  
  // Start a new challenge
  const startChallenge = () => {
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setCurrentScenario(scenario);
    setChallengeActive(true);
    setUserGuess(null);
    setChallengeStartTime(Date.now());
    
    // Generate data for the scenario
    let newData = [];
    const sampleSize = 300;
    
    if (scenario.type === 'normal') {
      for (let i = 0; i < sampleSize; i++) {
        const value = jStat.normal.sample(scenario.params.mean || 0, scenario.params.std || 1);
        newData.push(value);
      }
    } else if (scenario.type === 'exponential') {
      for (let i = 0; i < sampleSize; i++) {
        const value = jStat.exponential.sample(scenario.params.rate || 1);
        newData.push(Math.min(value - 1, 8));
      }
    }
    
    setData(cleanData(newData));
  };
  
  // Handle shape guess
  const handleShapeGuess = (shape) => {
    if (!challengeActive || userGuess) return;
    
    setUserGuess(shape);
    setTotalChallenges(prev => prev + 1);
    
    const isCorrect = shape === currentScenario.expectedShape;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
      if (streak + 1 > bestStreak) {
        setBestStreak(streak + 1);
      }
      
      // Trigger celebration
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        const { width, height } = svgRef.current.getBoundingClientRect();
        createConfetti(svg, width / 2, height / 2);
      }
    } else {
      setStreak(0);
    }
    
    checkAchievements();
    
    setTimeout(() => {
      setChallengeActive(false);
      setUserGuess(null);
    }, 2000);
  };
  
  // Calculate bin optimization score
  const calculateBinScore = useCallback(() => {
    if (data.length === 0) return 0;
    
    // Score based on how well the histogram reveals the distribution pattern
    // Optimal bins typically follow Sturges' rule or similar
    const n = data.length;
    const optimalBins = Math.ceil(Math.log2(n) + 1);
    const binDifference = Math.abs(numBins - optimalBins);
    
    let score = Math.max(0, 100 - binDifference * 10);
    
    // Bonus for being exactly optimal
    if (binDifference === 0) {
      score = 100;
      setOptimalBinFinds(prev => prev + 1);
      setBinHint('🎯 Perfect! This is the optimal bin count!');
    } else if (binDifference <= 2) {
      setBinHint('🔥 Very close! You\'re almost at the optimal bin count.');
    } else if (numBins < optimalBins - 5) {
      setBinHint('📊 Too few bins - you\'re losing important details!');
    } else if (numBins > optimalBins + 5) {
      setBinHint('🔍 Too many bins - creating visual noise!');
    } else {
      setBinHint('👍 Getting warmer...');
    }
    
    setBinScore(score);
    return score;
  }, [data, numBins]);
  
  // Initialize with data
  useEffect(() => {
    generateData();
  }, []);
  
  // Update stage based on interactions
  useEffect(() => {
    if (totalInteractions >= 15) setStage(4);
    else if (totalInteractions >= 10) setStage(3);
    else if (totalInteractions >= 5) setStage(2);
  }, [totalInteractions]);
  
  // Update bin score when bins change
  useEffect(() => {
    if (gameMode === 'bin-optimizer') {
      calculateBinScore();
    }
  }, [numBins, gameMode, calculateBinScore]);
  
  // Calculate statistics
  const calculateStats = (data) => {
    if (data.length === 0) return { mean: 0, median: 0, std: 0, skewness: 0 };
    
    const cleanedData = cleanData(data);
    if (cleanedData.length === 0) return { mean: 0, median: 0, std: 0, skewness: 0 };
    
    const mean = jStat.mean(cleanedData);
    const median = jStat.median(cleanedData);
    const std = jStat.stdev(cleanedData);
    
    // Calculate skewness
    const n = cleanedData.length;
    let skewness = 0;
    
    if (n >= 3 && std > 0) {
      const m3 = cleanedData.reduce((sum, x) => sum + Math.pow(x - mean, 3), 0) / n;
      const m2 = cleanedData.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / n;
      
      if (m2 > 0) {
        const g1 = m3 / Math.pow(m2, 1.5);
        skewness = Math.sqrt(n * (n - 1)) / (n - 2) * g1;
      }
    }
    
    return { mean, median, std, skewness };
  };
  
  const stats = calculateStats(data);
  
  // Main histogram visualization
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 600;
    const margin = { top: 60, right: 40, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Fun gradient background
    const bgGradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "histogram-bg-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    
    bgGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", gameMode === 'challenge' ? "#1a0a2e" : "#0a0a1a");
    
    bgGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", gameMode === 'challenge' ? "#2d1b69" : "#1a0a2e");
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#histogram-bg-gradient)");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xExtent = d3.extent(data);
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1;
    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, innerWidth]);
    
    // Create histogram
    const histogram = d3.histogram()
      .domain(xScale.domain())
      .thresholds(xScale.ticks(numBins));
    
    const bins = histogram(data);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([innerHeight, 0]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickFormat(""))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .selectAll("line")
      .style("stroke", colors.chart.grid);
    
    // Draw histogram bars with fun animations
    const barGroup = g.append("g");
    
    const bars = barGroup.selectAll("rect")
      .data(bins)
      .enter().append("rect")
      .attr("x", d => xScale(d.x0))
      .attr("y", innerHeight)
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr("height", 0)
      .attr("fill", gameMode === 'challenge' ? '#8B5CF6' : colorScheme.chart.primary)
      .attr("opacity", 0.8)
      .attr("rx", 4)
      .style("cursor", "pointer");
    
    // Animate bars with bounce effect
    bars.transition()
      .duration(500)
      .delay((d, i) => i * 20)
      .ease(d3.easeBounceOut)
      .attr("y", d => yScale(d.length))
      .attr("height", d => innerHeight - yScale(d.length));
    
    // Enhanced hover effects
    barGroup.selectAll("rect")
      .on("mouseover", function(event, d) { 
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 1)
          .attr("fill", gameMode === 'challenge' ? '#A78BFA' : colorScheme.chart.primaryLight)
          .attr("transform", "scale(1.05)")
          .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.3))");
          
        // Tooltip
        const tooltip = g.append("g")
          .attr("class", "tooltip");
          
        const x = xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2;
        const y = yScale(d.length) - 10;
        
        const rect = tooltip.append("rect")
          .attr("x", x - 40)
          .attr("y", y - 25)
          .attr("width", 80)
          .attr("height", 25)
          .attr("fill", "#1a1a1a")
          .attr("stroke", colors.chart.grid)
          .attr("rx", 3);
          
        tooltip.append("text")
          .attr("x", x)
          .attr("y", y - 8)
          .attr("text-anchor", "middle")
          .attr("fill", colors.chart.text)
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(`Count: ${d.length}`);
      })
      .on("mouseout", function(event, d) { 
        d3.select(this)
          .transition()
          .duration(150)
          .attr("opacity", 0.8)
          .attr("fill", gameMode === 'challenge' ? '#8B5CF6' : colorScheme.chart.primary)
          .attr("transform", "scale(1)")
          .style("filter", "none");
          
        g.selectAll(".tooltip").remove();
      });
    
    // Add title
    const titleText = gameMode === 'challenge' && currentScenario 
      ? currentScenario.title 
      : distributionType === 'normal' ? '📊 Normal Distribution' 
      : distributionType === 'exponential' ? '📈 Exponential Distribution' 
      : '📉 Left-Skewed Distribution';
    
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text(titleText);
    
    // Story text for challenge mode
    if (gameMode === 'challenge' && currentScenario && challengeActive) {
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .attr("fill", colors.chart.text)
        .attr("opacity", 0.8)
        .text(currentScenario.story);
    }
    
    // Mean and median lines with enhanced visibility
    if (!challengeActive || userGuess) {
      const meanLine = g.append("line")
        .attr("x1", xScale(stats.mean))
        .attr("x2", xScale(stats.mean))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colorScheme.chart.primary)
        .attr("stroke-width", 4)
        .attr("opacity", 0)
        .style("filter", "drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))")
        .transition()
        .duration(500)
        .attr("opacity", 0.9);
      
      const medianLine = g.append("line")
        .attr("x1", xScale(stats.median))
        .attr("x2", xScale(stats.median))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", colorScheme.chart.secondary)
        .attr("stroke-width", 4)
        .attr("opacity", 0)
        .style("filter", "drop-shadow(0 0 4px rgba(251, 146, 60, 0.5))")
        .transition()
        .duration(500)
        .attr("opacity", 0.9);
      
      // Labels
      const meanX = xScale(stats.mean);
      const medianX = xScale(stats.median);
      
      g.append("text")
        .attr("x", meanX)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.primary)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(`Mean: ${stats.mean.toFixed(2)}`);
      
      g.append("text")
        .attr("x", medianX)
        .attr("y", medianX === meanX ? 10 : -10)
        .attr("text-anchor", "middle")
        .attr("fill", colorScheme.chart.secondary)
        .style("font-size", "14px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .text(`Median: ${stats.median.toFixed(2)}`);
    }
    
    // Shape indicator (always visible in explore mode)
    if (gameMode === 'explore' || (gameMode === 'challenge' && userGuess)) {
      const skewText = g.append("text")
        .attr("x", innerWidth - 10)
        .attr("y", 30)
        .attr("text-anchor", "end")
        .style("font-size", "18px")
        .style("font-weight", "600")
        .style("font-family", "monospace")
        .attr("fill", Math.abs(stats.skewness) < 0.5 ? '#10B981' : 
                     stats.skewness > 0 ? '#F97316' : '#3B82F6')
        .text(`Skewness: ${stats.skewness.toFixed(2)}`);
      
      g.append("text")
        .attr("x", innerWidth - 10)
        .attr("y", 55)
        .attr("text-anchor", "end")
        .style("font-size", "16px")
        .attr("fill", colors.chart.text)
        .text(Math.abs(stats.skewness) < 0.5 ? "✨ Symmetric" :
              stats.skewness > 0 ? "➡️ Right-Skewed" : "⬅️ Left-Skewed");
    }
    
    // Bin score indicator for bin optimizer mode
    if (gameMode === 'bin-optimizer') {
      const scoreColor = binScore === 100 ? '#10B981' : binScore >= 80 ? '#F59E0B' : '#EF4444';
      
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 60)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("font-weight", "bold")
        .attr("fill", scoreColor)
        .text(`Score: ${binScore}/100`);
    }
    
    // X axis
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(10));
    
    xAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    xAxis.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px");
    
    // Y axis
    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).ticks(5));
    
    yAxis.selectAll("path, line").attr("stroke", colors.chart.grid);
    yAxis.selectAll("text")
      .attr("fill", colors.chart.text)
      .style("font-size", "12px");
    
    // Axis labels
    g.append("text")
      .attr("transform", `translate(${innerWidth / 2}, ${innerHeight + 45})`)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Value");
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (innerHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .attr("fill", colors.chart.text)
      .text("Frequency");
    
  }, [data, numBins, distributionType, normalParams, exponentialParams, stats, gameMode, currentScenario, challengeActive, userGuess, binScore]);
  
  return (
    <VisualizationContainer title="🎮 Histogram Shape Adventure!">
      <div className="flex flex-col gap-6">
        {/* Achievement notification */}
        {showAchievement && (
          <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-lg shadow-2xl animate-bounce">
            <div className="text-lg font-bold mb-1">🎉 Achievement Unlocked!</div>
            <div className="text-2xl font-bold mb-1">{showAchievement.name}</div>
            <div className="text-sm opacity-90">{showAchievement.description}</div>
          </div>
        )}
        
        {/* Game Mode Selector */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={gameMode === 'explore' ? "primary" : "neutral"}
            size="sm"
            onClick={() => setGameMode('explore')}
          >
            🔍 Explore Mode
          </Button>
          <Button
            variant={gameMode === 'challenge' ? "primary" : "neutral"}
            size="sm"
            onClick={() => setGameMode('challenge')}
          >
            🎯 Shape Challenge
          </Button>
          <Button
            variant={gameMode === 'bin-optimizer' ? "primary" : "neutral"}
            size="sm"
            onClick={() => setGameMode('bin-optimizer')}
          >
            📊 Bin Optimizer
          </Button>
        </div>
        
        {/* Main Visualization */}
        <GraphContainer height="600px">
          <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        </GraphContainer>
        
        {/* Game Controls */}
        {gameMode === 'challenge' && (
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4">
            {challengeActive ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white text-center">
                  What shape is this distribution?
                </h3>
                <div className="flex justify-center gap-4">
                  <Button
                    variant={userGuess === 'symmetric' ? 
                      (currentScenario.expectedShape === 'symmetric' ? 'success' : 'danger') : 
                      'neutral'}
                    onClick={() => handleShapeGuess('symmetric')}
                    disabled={userGuess !== null}
                  >
                    ⚖️ Symmetric
                  </Button>
                  <Button
                    variant={userGuess === 'right-skewed' ? 
                      (currentScenario.expectedShape === 'right-skewed' ? 'success' : 'danger') : 
                      'neutral'}
                    onClick={() => handleShapeGuess('right-skewed')}
                    disabled={userGuess !== null}
                  >
                    ➡️ Right-Skewed
                  </Button>
                  <Button
                    variant={userGuess === 'left-skewed' ? 
                      (currentScenario.expectedShape === 'left-skewed' ? 'success' : 'danger') : 
                      'neutral'}
                    onClick={() => handleShapeGuess('left-skewed')}
                    disabled={userGuess !== null}
                  >
                    ⬅️ Left-Skewed
                  </Button>
                </div>
                {userGuess && (
                  <div className="text-center text-lg font-bold">
                    {userGuess === currentScenario.expectedShape ? 
                      <span className="text-green-400">✅ Correct! Well done!</span> : 
                      <span className="text-red-400">❌ Not quite. It's {currentScenario.expectedShape}.</span>
                    }
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center gap-8 text-white">
                  <div>
                    <div className="text-3xl font-bold">{correctAnswers}/{totalChallenges}</div>
                    <div className="text-sm opacity-80">Score</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">🔥 {streak}</div>
                    <div className="text-sm opacity-80">Current Streak</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">⚡ {bestStreak}</div>
                    <div className="text-sm opacity-80">Best Streak</div>
                  </div>
                </div>
                <Button
                  variant="success"
                  size="lg"
                  onClick={startChallenge}
                >
                  🎮 Start New Challenge
                </Button>
              </div>
            )}
          </div>
        )}
        
        {gameMode === 'bin-optimizer' && (
          <div className="bg-gradient-to-r from-green-900/30 to-cyan-900/30 rounded-lg p-4">
            <h3 className="text-xl font-bold text-white text-center mb-4">
              Find the Optimal Bin Count!
            </h3>
            <div className="text-center text-lg text-white mb-2">{binHint}</div>
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-neutral-400">Bins:</span>
              <input
                type="range"
                min="5"
                max="50"
                value={numBins}
                onChange={(e) => {
                  setNumBins(Number(e.target.value));
                  setTotalInteractions(prev => prev + 1);
                }}
                className="w-64"
              />
              <span className="font-mono text-lg text-white w-12">{numBins}</span>
            </div>
            <div className="text-center mt-4">
              <div className="text-sm text-neutral-400">Optimal Bins Found</div>
              <div className="text-2xl font-bold text-white">🏆 {optimalBinFinds}</div>
            </div>
          </div>
        )}
        
        {gameMode === 'explore' && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                {/* Distribution Type Selector */}
                <div className="flex gap-2">
                  <Button
                    variant={distributionType === 'normal' ? "primary" : "neutral"}
                    size="sm"
                    onClick={() => {
                      setDistributionType('normal');
                      generateData();
                    }}
                  >
                    📊 Normal
                  </Button>
                  <Button
                    variant={distributionType === 'exponential' ? "primary" : "neutral"}
                    size="sm"
                    onClick={() => {
                      setDistributionType('exponential');
                      generateData();
                    }}
                  >
                    📈 Right-Skewed
                  </Button>
                  <Button
                    variant={distributionType === 'left-skewed' ? "primary" : "neutral"}
                    size="sm"
                    onClick={() => {
                      setDistributionType('left-skewed');
                      generateData();
                    }}
                  >
                    📉 Left-Skewed
                  </Button>
                </div>
                
                {/* Bin Control */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">Bins:</span>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={numBins}
                    onChange={(e) => {
                      setNumBins(Number(e.target.value));
                      setTotalInteractions(prev => prev + 1);
                    }}
                    className="w-32"
                  />
                  <span className="font-mono text-sm text-white w-8">{numBins}</span>
                </div>
                
                <Button
                  variant="success"
                  size="sm"
                  onClick={generateData}
                >
                  🎲 New Data
                </Button>
              </div>
            </div>
            
            {/* Statistics Display */}
            <div className="flex gap-6 items-center">
              <div>
                <span className="text-sm text-neutral-400">Shape</span>
                <div className="text-lg font-semibold text-white">
                  {Math.abs(stats.mean - stats.median) < 0.1 ? "✨ Symmetric" :
                   stats.mean > stats.median ? "➡️ Right-Skewed" : "⬅️ Left-Skewed"}
                </div>
              </div>
              <div>
                <span className="text-sm text-neutral-400">Mean vs Median</span>
                <div className="font-mono text-lg text-white">
                  {stats.mean > stats.median + 0.1 ? "Mean > Median" :
                   stats.mean < stats.median - 0.1 ? "Mean < Median" : "Mean ≈ Median"}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Achievements Section */}
        <div className="bg-neutral-800/50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">🏆 Achievements</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {userAchievements.map(achievement => (
              <div
                key={achievement.id}
                className={cn(
                  "p-3 rounded-lg text-center transition-all",
                  achievement.unlocked 
                    ? "bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/50" 
                    : "bg-neutral-900/50 opacity-50"
                )}
              >
                <div className="text-2xl mb-1">{achievement.name.split(' ')[0]}</div>
                <div className="text-xs text-neutral-300">{achievement.name.split(' ').slice(1).join(' ')}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Progress and Tips */}
        <div className="bg-neutral-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-white">📈 Learning Progress</h4>
            <ProgressBar 
              current={stage} 
              total={4} 
              label="Level" 
              variant="purple"
            />
          </div>
          
          <div className="text-white">
            <div className="text-sm text-neutral-300">
              {gameMode === 'explore' && "Try different distributions and bin counts to see how they affect the shape!"}
              {gameMode === 'challenge' && "Test your shape recognition skills with real-world data scenarios!"}
              {gameMode === 'bin-optimizer' && "Find the perfect number of bins to reveal the true pattern in the data!"}
            </div>
          </div>
        </div>
        
      </div>
    </VisualizationContainer>
  );
}

export default HistogramShapeExplorer;