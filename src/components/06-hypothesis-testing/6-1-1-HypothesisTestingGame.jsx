"use client";
import React, { useState, useEffect, useRef } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';

// Use hypothesis color scheme
const colorScheme = createColorScheme('hypothesis');

export default function HypothesisTestingGame() {
  // Core game state
  const [flips, setFlips] = useState([]);
  const [actualBias, setActualBias] = useState(null);
  const [gamePhase, setGamePhase] = useState('playing'); // 'playing', 'decided', 'revealed'
  const [userDecision, setUserDecision] = useState(null); // 'fair', 'biased'
  
  // UI state
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentFlip, setCurrentFlip] = useState(null);
  const [currentInsight, setCurrentInsight] = useState({
    title: "Ready to investigate?",
    content: "This coin claims to be fair (50% heads). Start flipping to gather evidence!",
    visual: null,
    teaching: null
  });
  
  // Refs for D3 visualizations
  const meterRef = useRef(null);
  const historyRef = useRef(null);
  
  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, []);
  
  // Initialize or reset game
  const initializeGame = () => {
    // 50% chance of fair coin, 50% chance of biased
    const isFair = Math.random() < 0.5;
    if (isFair) {
      setActualBias(0.5);
    } else {
      // Biased coin: 30% or 70% heads
      setActualBias(Math.random() < 0.5 ? 0.3 : 0.7);
    }
    
    // Reset all state
    setFlips([]);
    setGamePhase('playing');
    setUserDecision(null);
    setCurrentFlip(null);
    setIsFlipping(false);
    setCurrentInsight({
      title: "Ready to investigate?",
      content: "This coin claims to be fair (50% heads). Start flipping to gather evidence!",
      visual: null,
      teaching: null
    });
  };
  
  // Flip the coin once
  const flipOnce = async () => {
    if (isFlipping || gamePhase !== 'playing') return;
    
    setIsFlipping(true);
    
    // Generate result based on hidden bias
    const result = Math.random() < actualBias ? 1 : 0;
    
    // Show animation
    setCurrentFlip('flipping');
    await new Promise(resolve => setTimeout(resolve, 300));
    setCurrentFlip(result);
    
    // Add to flips
    const newFlips = [...flips, result];
    setFlips(newFlips);
    
    // Update insight
    updateInsight(newFlips);
    
    // Update visualizations
    updateEvidenceMeter(newFlips);
    updateFlipHistory(newFlips);
    
    setIsFlipping(false);
  };
  
  // Flip multiple times
  const flipMultiple = async () => {
    if (isFlipping || gamePhase !== 'playing') return;
    
    setIsFlipping(true);
    
    // Generate 10 flips
    const newResults = [];
    for (let i = 0; i < 10; i++) {
      newResults.push(Math.random() < actualBias ? 1 : 0);
    }
    
    // Animate each flip quickly
    for (let i = 0; i < newResults.length; i++) {
      setCurrentFlip('flipping');
      await new Promise(resolve => setTimeout(resolve, 100));
      setCurrentFlip(newResults[i]);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Add all to flips
    const newFlips = [...flips, ...newResults];
    setFlips(newFlips);
    
    // Update everything
    updateInsight(newFlips);
    updateEvidenceMeter(newFlips);
    updateFlipHistory(newFlips);
    
    setIsFlipping(false);
  };
  
  // Calculate statistics
  const calculateStats = (flipArray) => {
    const n = flipArray.length;
    if (n === 0) return { heads: 0, tails: 0, proportion: 0.5, zScore: 0, pValue: 1 };
    
    const heads = flipArray.filter(f => f === 1).length;
    const tails = n - heads;
    const proportion = heads / n;
    
    // Calculate z-score (with continuity correction for small samples)
    let zScore = 0;
    if (n >= 5) {
      const se = Math.sqrt(0.25 / n); // Standard error under null hypothesis
      zScore = (proportion - 0.5) / se;
    }
    
    // Two-tailed p-value
    const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
    
    return { heads, tails, proportion, zScore, pValue, n };
  };
  
  // Normal CDF approximation
  const normalCDF = (z) => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = z >= 0 ? 1 : -1;
    z = Math.abs(z);
    
    const t = 1.0 / (1.0 + p * z);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
    
    return 0.5 * (1.0 + sign * y);
  };
  
  // Update evidence meter visualization
  const updateEvidenceMeter = (flipArray) => {
    const stats = calculateStats(flipArray);
    const svg = d3.select(meterRef.current);
    
    // Clear previous
    svg.selectAll("*").remove();
    
    const width = 400;
    const height = 60;
    const margin = { top: 15, right: 40, bottom: 20, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "evidence-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#10b981")
      .attr("stop-opacity", 0.8);
    
    gradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#6b7280")
      .attr("stop-opacity", 0.5);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ef4444")
      .attr("stop-opacity", 0.8);
    
    // Background track
    g.append("rect")
      .attr("x", 0)
      .attr("y", 8)
      .attr("width", innerWidth)
      .attr("height", 8)
      .attr("fill", "url(#evidence-gradient)")
      .attr("rx", 4);
    
    // Scale for z-score (-3 to 3)
    const zScale = d3.scaleLinear()
      .domain([-3, 3])
      .range([0, innerWidth])
      .clamp(true);
    
    // Add threshold markers
    [-1.96, 1.96].forEach(threshold => {
      g.append("line")
        .attr("x1", zScale(threshold))
        .attr("x2", zScale(threshold))
        .attr("y1", 4)
        .attr("y2", 20)
        .attr("stroke", "#fbbf24")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "2,2");
    });
    
    // Current evidence marker
    if (stats.n > 0) {
      const markerG = g.append("g")
        .attr("transform", `translate(${zScale(stats.zScore)}, 12)`);
      
      markerG.append("circle")
        .attr("r", 6)
        .attr("fill", "#1e40af")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);
      
      // Animate the marker
      markerG
        .attr("transform", `translate(${zScale(0)}, 12)`)
        .transition()
        .duration(500)
        .attr("transform", `translate(${zScale(stats.zScore)}, 12)`);
    }
    
    // Labels
    g.append("text")
      .attr("x", 0)
      .attr("y", 30)
      .attr("text-anchor", "start")
      .attr("fill", "#10b981")
      .attr("font-size", "10px")
      .text("Fair");
    
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .attr("font-size", "10px")
      .text("Uncertain");
    
    g.append("text")
      .attr("x", innerWidth)
      .attr("y", 30)
      .attr("text-anchor", "end")
      .attr("fill", "#ef4444")
      .attr("font-size", "10px")
      .text("Biased");
  };
  
  // Update flip history visualization
  const updateFlipHistory = (flipArray) => {
    const recentFlips = flipArray.slice(-20);
    const svg = d3.select(historyRef.current);
    
    svg.selectAll("*").remove();
    
    const width = 400;
    const height = 70;
    const coinSize = 14;
    const spacing = 18;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const g = svg.append("g")
      .attr("transform", `translate(${width/2 - (recentFlips.length * spacing)/2}, 35)`);
    
    // Draw coins
    recentFlips.forEach((flip, i) => {
      const coinG = g.append("g")
        .attr("transform", `translate(${i * spacing}, 0)`)
        .attr("opacity", 0);
      
      coinG.append("circle")
        .attr("r", coinSize/2)
        .attr("fill", flip === 1 ? "#06b6d4" : "#ec4899")
        .attr("stroke", "#1f2937")
        .attr("stroke-width", 0.5);
      
      coinG.append("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "white")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text(flip === 1 ? "H" : "T");
      
      // Fade in animation
      coinG.transition()
        .delay(i * 30)
        .duration(200)
        .attr("opacity", 1 - (i / recentFlips.length) * 0.5);
    });
  };
  
  // Update insight based on game state
  const updateInsight = (flipArray) => {
    const stats = calculateStats(flipArray);
    const insight = generateInsight(stats, flipArray);
    setCurrentInsight(insight);
  };
  
  // Generate contextual insights
  const generateInsight = (stats, flipArray) => {
    const n = stats.n;
    
    // First flip
    if (n === 1) {
      const result = flipArray[0] === 1 ? 'heads' : 'tails';
      return {
        title: "One flip tells us nothing!",
        content: `You got ${result}. But even a completely biased coin sometimes shows ${result}. We need more data to see patterns.`,
        visual: "Notice how the evidence meter barely moved.",
        teaching: "Single events can't distinguish random variation from systematic bias."
      };
    }
    
    // Early flips (2-5)
    if (n >= 2 && n <= 5) {
      if (Math.abs(stats.proportion - 0.5) > 0.3) {
        return {
          title: "Unusual start, but...",
          content: `You're seeing ${(stats.proportion * 100).toFixed(0)}% heads. This seems extreme, but with only ${n} flips, it could easily be chance.`,
          visual: "The evidence meter shows uncertainty - we need more data.",
          teaching: "Small samples often show extreme results purely by chance."
        };
      }
      return {
        title: "Building evidence",
        content: `${n} flips down. Patterns will emerge as we collect more data.`,
        visual: "Watch how the evidence meter stabilizes with more flips."
      };
    }
    
    // Enough for decision (6-15)
    if (n >= 6 && n <= 15) {
      if (stats.pValue > 0.2) {
        return {
          title: "Looking fair so far",
          content: `With ${stats.heads} heads in ${n} flips (${(stats.proportion * 100).toFixed(0)}%), the coin appears fair. But we can't be certain yet.`,
          teaching: "Absence of evidence isn't evidence of absence - a biased coin can still produce fair-looking results."
        };
      } else if (stats.pValue < 0.1) {
        return {
          title: "Something seems off!",
          content: `${(stats.proportion * 100).toFixed(0)}% heads is unusual for a fair coin. The evidence is building against the claim.`,
          visual: "See the evidence meter moving toward 'Biased'",
          teaching: "As evidence accumulates, patterns become clearer."
        };
      }
    }
    
    // Decision zone (16-30)
    if (n >= 16 && n <= 30) {
      if (stats.pValue < 0.05) {
        return {
          title: "Strong evidence of bias!",
          content: `With a p-value of ${(stats.pValue * 100).toFixed(1)}%, this result would be very unlikely if the coin were fair.`,
          visual: "The evidence meter has crossed the significance threshold.",
          teaching: "P < 0.05 is a common threshold, but it's just a convention - not a magic boundary."
        };
      }
      return {
        title: "Time to decide?",
        content: `You have ${n} flips. The evidence suggests the coin ${stats.pValue > 0.1 ? 'is likely fair' : 'might be biased'}.`,
        teaching: "In real decisions, we must act despite remaining uncertainty."
      };
    }
    
    // Many flips (31+)
    if (n > 30) {
      return {
        title: "Diminishing returns",
        content: `With ${n} flips, your decision is unlikely to change. More data refines the estimate but rarely reverses the conclusion.`,
        teaching: "There's a trade-off between certainty and efficiency. Perfect certainty is impossible."
      };
    }
  };
  
  // Make decision
  const makeDecision = (decision) => {
    if (gamePhase !== 'playing' || flips.length < 5) return;
    
    setUserDecision(decision);
    setGamePhase('decided');
    
    // Show decision confirmation
    setCurrentInsight({
      title: "Decision made!",
      content: `You decided the coin is ${decision}. Click 'Reveal Truth' to see if you're right!`,
      visual: null,
      teaching: null
    });
  };
  
  // Reveal the truth
  const revealTruth = () => {
    if (gamePhase !== 'decided') return;
    setGamePhase('revealed');
    
    const stats = calculateStats(flips);
    const actuallyFair = actualBias === 0.5;
    const decidedFair = userDecision === 'fair';
    const correct = actuallyFair === decidedFair;
    
    let errorType = null;
    if (!correct) {
      errorType = decidedFair ? 'Type II Error' : 'Type I Error';
    }
    
    setCurrentInsight({
      title: correct ? "🎉 Correct!" : "❌ Wrong!",
      content: `The coin was actually ${actuallyFair ? 'fair' : `biased (${(actualBias * 100).toFixed(0)}% heads)`}.`,
      visual: correct ? null : `You made a ${errorType}.`,
      teaching: errorType === 'Type I Error' 
        ? "Type I Error: Rejected a true claim (false positive). This happens ~5% of the time even with good evidence."
        : errorType === 'Type II Error'
        ? "Type II Error: Failed to detect real bias (false negative). Sometimes biased coins produce fair-looking results."
        : "Well done! You correctly interpreted the evidence."
    });
  };
  
  // Check if decision was correct
  const isDecisionCorrect = () => {
    const actuallyFair = actualBias === 0.5;
    const decidedFair = userDecision === 'fair';
    return actuallyFair === decidedFair;
  };
  
  // Stats display
  const stats = calculateStats(flips);
  
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-2">Is This Coin Fair?</h2>
      <p className="text-gray-400 text-sm mb-4">Test your hypothesis testing skills! Gather evidence and decide if the coin is fair or biased.</p>
      
      <div className="flex flex-col lg:flex-row gap-3 bg-gray-900 rounded-lg p-4">
        {/* Left Panel - Controls */}
        <div className="lg:w-1/3 space-y-3">
          {/* Game Controls */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-sm font-semibold text-gray-300 mb-2">Game Controls</div>
            <div className="space-y-2">
              <div className="text-xs text-gray-400">
                Flips: <span className="font-mono text-white">{flips.length}</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={flipOnce}
                  disabled={isFlipping || gamePhase !== 'playing'}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded text-sm font-medium transition-all",
                    "bg-blue-600 hover:bg-blue-700 disabled:opacity-50",
                    "disabled:cursor-not-allowed text-white"
                  )}
                >
                  Flip Once
                </button>
                
                <button
                  onClick={flipMultiple}
                  disabled={isFlipping || gamePhase !== 'playing'}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded text-sm font-medium transition-all",
                    "bg-blue-600 hover:bg-blue-700 disabled:opacity-50",
                    "disabled:cursor-not-allowed text-white"
                  )}
                >
                  Flip 10x
                </button>
              </div>
              
              <div className="pt-2 border-t border-gray-700 flex justify-between text-xs">
                <span className="text-gray-400">Heads: <span className="font-mono text-blue-400">{stats.heads} ({(stats.proportion * 100).toFixed(0)}%)</span></span>
                <span className="text-gray-400">Tails: <span className="font-mono text-red-400">{stats.tails} ({((1 - stats.proportion) * 100).toFixed(0)}%)</span></span>
              </div>
            </div>
          </div>
          
          {/* Decision Panel */}
          <div className={cn(
            "bg-gray-800 rounded-lg p-3",
            gamePhase === 'playing' && flips.length >= 5 ? 'ring-2 ring-yellow-500' : ''
          )}>
            <div className="text-sm font-semibold text-gray-300 mb-2">Ready to Decide?</div>
            {gamePhase === 'playing' ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => makeDecision('fair')}
                    disabled={flips.length < 5}
                    className={cn(
                      "flex-1 py-2 px-3 rounded text-sm font-medium transition-all",
                      "bg-green-600 hover:bg-green-700 disabled:opacity-50",
                      "disabled:cursor-not-allowed text-white"
                    )}
                  >
                    It's FAIR ✓
                  </button>
                  
                  <button
                    onClick={() => makeDecision('biased')}
                    disabled={flips.length < 5}
                    className={cn(
                      "flex-1 py-2 px-3 rounded text-sm font-medium transition-all",
                      "bg-red-600 hover:bg-red-700 disabled:opacity-50",
                      "disabled:cursor-not-allowed text-white"
                    )}
                  >
                    It's BIASED ✗
                  </button>
                </div>
                
                {flips.length < 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    Need at least 5 flips
                  </p>
                )}
              </div>
            ) : gamePhase === 'decided' ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-300">
                  You decided: <span className="font-bold text-white">{userDecision?.toUpperCase()}</span>
                </p>
                <button
                  onClick={revealTruth}
                  className={cn(
                    "w-full py-2 px-3 rounded text-sm font-medium transition-all",
                    "bg-yellow-600 hover:bg-yellow-700 text-white",
                    "animate-pulse"
                  )}
                >
                  Reveal Truth!
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-gray-300">
                  Truth: <span className="font-bold text-white">
                    {actualBias === 0.5 ? 'FAIR' : `BIASED (${(actualBias * 100).toFixed(0)}%)`}
                  </span>
                </p>
                <p className="text-xs text-gray-300">
                  Your decision: <span className="font-bold">
                    {userDecision?.toUpperCase()}
                  </span>
                </p>
                <button
                  onClick={initializeGame}
                  className={cn(
                    "w-full py-2 px-3 rounded text-sm font-medium transition-all",
                    "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - Visualizations */}
        <div className="lg:w-2/3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Coin Animation Area */}
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-700/30 rounded-lg p-3">
              <div className="text-sm font-semibold text-purple-300 mb-2">Coin Flip</div>
              <div className="h-20 flex items-center justify-center">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  "text-2xl font-bold transition-all duration-300 shadow-lg",
                  currentFlip === 'flipping' && "animate-spin",
                  currentFlip === 1 ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/50" : 
                  currentFlip === 0 ? "bg-gradient-to-br from-pink-500 to-red-600 text-white shadow-pink-500/50" : 
                  "bg-gray-700 text-gray-400"
                )}>
                  {currentFlip === 'flipping' ? '?' : 
                   currentFlip === 1 ? 'H' : 
                   currentFlip === 0 ? 'T' : '?'}
                </div>
              </div>
            </div>
            
            {/* Flip History */}
            <div className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/20 border border-indigo-700/30 rounded-lg p-3">
              <div className="text-sm font-semibold text-indigo-300 mb-1">Flip History</div>
              <svg ref={historyRef} className="w-full" style={{ height: '70px' }} />
              <div className="text-xs text-center text-indigo-400 mt-1">
                Last {Math.min(flips.length, 20)} flips
              </div>
            </div>
          </div>
          
          {/* Evidence Meter */}
          <div className="bg-gradient-to-br from-emerald-900/20 to-teal-800/20 border border-emerald-700/30 rounded-lg p-3">
            <div className="text-sm font-semibold text-emerald-300 mb-1">Evidence Meter</div>
            <svg ref={meterRef} className="w-full" style={{ height: '60px' }} />
            {stats.n >= 5 && (
              <div className="text-center text-xs text-emerald-400">
                p-value: <span className="font-mono text-white font-bold">
                  {(stats.pValue * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Full Width Insight Section */}
      <div className={cn(
        "bg-gradient-to-br rounded-lg p-4 mt-3 transition-all duration-300",
        gamePhase === 'revealed' && !isDecisionCorrect() ? "from-red-900/20 to-red-800/20 border border-red-700/30" :
        gamePhase === 'revealed' && isDecisionCorrect() ? "from-green-900/20 to-green-800/20 border border-green-700/30" :
        stats.pValue < 0.05 ? "from-orange-900/20 to-amber-800/20 border border-orange-700/30" :
        "from-yellow-900/20 to-amber-800/20 border border-yellow-700/30"
      )}>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className={cn(
              "text-lg font-bold mb-2",
              gamePhase === 'revealed' && !isDecisionCorrect() ? "text-red-400" :
              gamePhase === 'revealed' && isDecisionCorrect() ? "text-green-400" :
              stats.pValue < 0.05 ? "text-orange-400" :
              "text-yellow-400"
            )}>
              {currentInsight.title}
            </h3>
            <p className="text-sm text-gray-300 mb-3">
              {currentInsight.content}
            </p>
            {currentInsight.visual && (
              <p className="text-xs text-gray-400 italic mb-3">
                👁️ {currentInsight.visual}
              </p>
            )}
          </div>
          
          {/* Visual Statistics Display */}
          {stats.n > 0 && gamePhase === 'playing' && (
            <div className="bg-black/30 rounded-lg p-3 min-w-[200px]">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Evidence Strength:</span>
                  <span className={cn(
                    "text-sm font-bold",
                    stats.pValue < 0.01 ? "text-red-400" :
                    stats.pValue < 0.05 ? "text-orange-400" :
                    stats.pValue < 0.1 ? "text-yellow-400" :
                    "text-gray-400"
                  )}>
                    {stats.pValue < 0.01 ? "Very Strong" :
                     stats.pValue < 0.05 ? "Strong" :
                     stats.pValue < 0.1 ? "Moderate" :
                     "Weak"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Samples Collected:</span>
                  <span className="text-sm font-mono text-white">{stats.n}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Current Proportion:</span>
                  <span className={cn(
                    "text-sm font-mono font-bold",
                    Math.abs(stats.proportion - 0.5) > 0.1 ? "text-orange-400" : "text-gray-300"
                  )}>
                    {(stats.proportion * 100).toFixed(1)}% H
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {currentInsight.teaching && (
          <div className={cn(
            "mt-3 p-3 rounded border",
            "bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-blue-700/50"
          )}>
            <p className="text-sm text-blue-300">
              💡 <span className="font-semibold">Key concept:</span> {currentInsight.teaching}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}