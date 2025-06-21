"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';
import { Button } from '../ui/button';
import { ProgressBar } from '../ui/ProgressBar';
import { Car, DoorOpen, X, RotateCcw, Play, Pause } from 'lucide-react';
import { useSafeMathJax } from '../../utils/mathJaxFix';
import { tutorial_1_7_1 } from '@/tutorials/chapter1';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

// LaTeX content wrapper
const LatexContent = memo(function LatexContent({ children }) {
  const contentRef = useRef(null);
  useSafeMathJax(contentRef, [children]);
  return <span ref={contentRef}>{children}</span>;
});

// Door Component with animations
const Door = memo(function Door({ 
  index, 
  isSelected, 
  isRevealed, 
  hasCar, 
  isWinner,
  isLoser,
  onClick, 
  disabled,
  stage
}) {
  const doorRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Animate door reveal
  useEffect(() => {
    if (isRevealed && doorRef.current) {
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [isRevealed]);
  
  const getDoorColor = () => {
    if (isWinner) return '#10b981'; // Green for win
    if (isLoser) return '#ef4444'; // Red for loss
    if (isSelected && !isRevealed) return '#3b82f6'; // Blue for selected
    if (isRevealed) return '#6b7280'; // Gray for revealed
    return '#374151'; // Default dark gray
  };
  
  const getDoorGlow = () => {
    if (isWinner) return 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.6))';
    if (isLoser) return 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))';
    if (isSelected && !isRevealed) return 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.5))';
    return 'none';
  };
  
  return (
    <div 
      ref={doorRef}
      className={cn(
        "relative cursor-pointer transition-all duration-300",
        disabled && "cursor-not-allowed opacity-60",
        isAnimating && "animate-pulse"
      )}
      onClick={() => !disabled && onClick(index)}
      style={{ filter: getDoorGlow() }}
    >
      {/* Door Frame */}
      <svg width="180" height="240" viewBox="0 0 180 240">
        {/* Door Background */}
        <rect
          x="10"
          y="10"
          width="160"
          height="220"
          fill={getDoorColor()}
          stroke="#1f2937"
          strokeWidth="3"
          rx="4"
          className="transition-all duration-300"
        />
        
        {/* Door Handle */}
        <circle
          cx="145"
          cy="120"
          r="8"
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth="2"
        />
        
        {/* Door Number */}
        <text
          x="90"
          y="60"
          textAnchor="middle"
          fontSize="36"
          fontWeight="bold"
          fill="white"
          className="select-none"
        >
          {index + 1}
        </text>
        
        {/* Open door effect */}
        {isRevealed && (
          <g className="door-open-effect">
            <rect
              x="10"
              y="10"
              width="160"
              height="220"
              fill="black"
              opacity="0.3"
              className="animate-fade-in"
            />
          </g>
        )}
      </svg>
      
      {/* Behind the door */}
      {isRevealed && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          "animate-fade-in-scale"
        )}>
          {hasCar ? (
            <Car className="w-24 h-24 text-yellow-400" />
          ) : (
            <div className="text-6xl">🐐</div>
          )}
        </div>
      )}
      
      {/* Labels */}
      {isSelected && !isRevealed && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
            Your Choice
          </span>
        </div>
      )}
      
      {stage === 'final' && (isWinner || isLoser) && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <span className={cn(
            "text-sm font-bold px-3 py-1 rounded",
            isWinner ? "bg-green-600 text-white" : "bg-red-600 text-white"
          )}>
            {isWinner ? "WIN!" : "LOSE"}
          </span>
        </div>
      )}
    </div>
  );
});

// Probability Bar Chart Component
const ProbabilityChart = memo(function ProbabilityChart({ 
  probabilities, 
  currentStrategy,
  animateChange = false 
}) {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = 300;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleBand()
      .domain(['Stay', 'Switch'])
      .range([0, innerWidth])
      .padding(0.3);
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-innerWidth)
        .tickFormat("")
        .ticks(5)
      )
      .style("stroke-dasharray", "2,2")
      .style("opacity", 0.3);
    
    // Bars
    const bars = g.selectAll(".bar")
      .data([
        { strategy: 'Stay', probability: probabilities.stay },
        { strategy: 'Switch', probability: probabilities.switch }
      ])
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.strategy))
      .attr("width", x.bandwidth())
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("fill", d => d.strategy === currentStrategy ? colorScheme.chart.primary : colorScheme.chart.secondary)
      .attr("opacity", 0.8);
    
    // Animate bars
    bars.transition()
      .duration(animateChange ? 800 : 400)
      .attr("y", d => y(d.probability))
      .attr("height", d => innerHeight - y(d.probability));
    
    // Value labels
    g.selectAll(".value-label")
      .data([
        { strategy: 'Stay', probability: probabilities.stay },
        { strategy: 'Switch', probability: probabilities.switch }
      ])
      .enter().append("text")
      .attr("class", "value-label")
      .attr("x", d => x(d.strategy) + x.bandwidth() / 2)
      .attr("y", d => y(d.probability) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text(d => `${(d.probability * 100).toFixed(1)}%`)
      .attr("opacity", 0)
      .transition()
      .delay(animateChange ? 600 : 200)
      .attr("opacity", 1);
    
    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "12px");
    
    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${d * 100}%`))
      .selectAll("text")
      .style("font-size", "11px");
    
    // Axis styling
    g.selectAll(".domain, .tick line")
      .attr("stroke", "#6b7280");
    g.selectAll(".tick text")
      .attr("fill", "#e5e7eb");
      
  }, [probabilities, currentStrategy, animateChange]);
  
  return <svg ref={svgRef} style={{ width: "100%", height: "200px" }} />;
});

// Game History Component
const GameHistory = memo(function GameHistory({ history, showRecent = 10 }) {
  if (history.length === 0) return null;
  
  const displayHistory = showRecent ? history.slice(-showRecent) : history;
  const wins = history.filter(g => g.won).length;
  const winRate = history.length > 0 ? (wins / history.length * 100).toFixed(1) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-neutral-400">Recent Games</span>
        <span className="text-sm font-mono text-teal-400">
          Win Rate: {winRate}% ({wins}/{history.length})
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {displayHistory.map((game, i) => (
          <div
            key={i}
            className={cn(
              "w-8 h-8 rounded flex items-center justify-center text-xs font-bold",
              game.won ? "bg-green-600/20 text-green-400 border border-green-600/50" : 
                        "bg-red-600/20 text-red-400 border border-red-600/50"
            )}
            title={`Game ${history.indexOf(game) + 1}: ${game.strategy} - ${game.won ? 'Won' : 'Lost'}`}
          >
            {game.strategy[0]}
          </div>
        ))}
      </div>
    </div>
  );
});

// Main Monty Hall Component
function MontyHallInteractive() {
  // Game state
  const [stage, setStage] = useState('initial'); // initial, revealed, final
  const [carPosition, setCarPosition] = useState(Math.floor(Math.random() * 3));
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [revealedDoor, setRevealedDoor] = useState(null);
  const [finalChoice, setFinalChoice] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoStrategy, setAutoStrategy] = useState('switch'); // switch, stay, random
  const [gameSpeed, setGameSpeed] = useState(1000);
  
  // Statistics
  const [gameHistory, setGameHistory] = useState([]);
  const [interactionCount, setInteractionCount] = useState(0);
  
  // Refs
  const autoPlayInterval = useRef(null);
  
  // Calculate probabilities
  const calculateStats = useCallback(() => {
    const switchGames = gameHistory.filter(g => g.strategy === 'switch');
    const stayGames = gameHistory.filter(g => g.strategy === 'stay');
    
    return {
      theoretical: { stay: 1/3, switch: 2/3 },
      observed: {
        stay: stayGames.length > 0 ? stayGames.filter(g => g.won).length / stayGames.length : 0,
        switch: switchGames.length > 0 ? switchGames.filter(g => g.won).length / switchGames.length : 0
      },
      counts: {
        stay: { wins: stayGames.filter(g => g.won).length, total: stayGames.length },
        switch: { wins: switchGames.filter(g => g.won).length, total: switchGames.length }
      }
    };
  }, [gameHistory]);
  
  const stats = calculateStats();
  
  // Handle door selection
  const selectDoor = useCallback((doorIndex) => {
    if (stage === 'initial' && selectedDoor === null) {
      setSelectedDoor(doorIndex);
      setInteractionCount(prev => prev + 1);
      
      // Monty reveals a door after selection
      setTimeout(() => {
        const availableDoors = [0, 1, 2].filter(d => d !== doorIndex && d !== carPosition);
        const doorToReveal = availableDoors[Math.floor(Math.random() * availableDoors.length)];
        setRevealedDoor(doorToReveal);
        setStage('revealed');
      }, 500);
    } else if (stage === 'revealed' && doorIndex !== revealedDoor) {
      // Make final choice
      setFinalChoice(doorIndex);
      setStage('final');
      
      // Record game result
      const strategy = doorIndex === selectedDoor ? 'stay' : 'switch';
      const won = doorIndex === carPosition;
      setGameHistory(prev => [...prev, { strategy, won }]);
    }
  }, [stage, selectedDoor, carPosition, revealedDoor]);
  
  // Reset game
  const resetGame = useCallback(() => {
    setStage('initial');
    setCarPosition(Math.floor(Math.random() * 3));
    setSelectedDoor(null);
    setRevealedDoor(null);
    setFinalChoice(null);
  }, []);
  
  // Auto play logic
  useEffect(() => {
    if (autoPlay) {
      autoPlayInterval.current = setInterval(() => {
        if (stage === 'initial') {
          // Random initial selection
          selectDoor(Math.floor(Math.random() * 3));
        } else if (stage === 'revealed') {
          // Apply strategy
          const remainingDoors = [0, 1, 2].filter(d => d !== revealedDoor);
          let finalDoor;
          
          if (autoStrategy === 'stay') {
            finalDoor = selectedDoor;
          } else if (autoStrategy === 'switch') {
            finalDoor = remainingDoors.find(d => d !== selectedDoor);
          } else { // random
            finalDoor = remainingDoors[Math.floor(Math.random() * remainingDoors.length)];
          }
          
          selectDoor(finalDoor);
        } else if (stage === 'final') {
          // Reset for next game
          setTimeout(resetGame, gameSpeed / 2);
        }
      }, gameSpeed);
      
      return () => {
        if (autoPlayInterval.current) {
          clearInterval(autoPlayInterval.current);
        }
      };
    }
  }, [autoPlay, stage, autoStrategy, gameSpeed, selectDoor, resetGame, selectedDoor, revealedDoor]);
  
  // Stop auto play on manual interaction
  const handleManualAction = useCallback((action) => {
    if (autoPlay) {
      setAutoPlay(false);
    }
    action();
  }, [autoPlay]);
  
  // Learning insights based on interaction count
  const getInsight = () => {
    if (interactionCount === 0) {
      return {
        message: "Welcome to the Monty Hall Problem! Pick a door to start. One has a car, two have goats.",
        stage: 0
      };
    } else if (interactionCount <= 3) {
      return {
        message: "After you pick, Monty (who knows where the car is) opens a door with a goat. Should you switch to the other closed door or stay?",
        stage: 1
      };
    } else if (gameHistory.length >= 5 && gameHistory.length < 20) {
      const switchWins = stats.counts.switch.wins;
      const switchTotal = stats.counts.switch.total;
      return {
        message: `You've played ${gameHistory.length} games. Switching has won ${switchWins}/${switchTotal} times. Starting to see a pattern?`,
        stage: 2
      };
    } else if (gameHistory.length >= 20) {
      return {
        message: `With ${gameHistory.length} games played, you're approaching the theoretical probabilities: Stay wins 33.3%, Switch wins 66.7%!`,
        stage: 3,
        showFormula: true
      };
    }
    return { message: "Keep playing to discover the surprising truth!", stage: 1 };
  };
  
  const insight = getInsight();
  const progressPercent = Math.min((gameHistory.length / 30) * 100, 100);
  
  return (
    <VisualizationContainer
      title="The Monty Hall Problem"
      tutorialSteps={tutorial_1_7_1}
      tutorialKey="monty-hall-interactive"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Controls and Learning */}
        <div className="lg:w-1/3 space-y-4">
          {/* Game Controls */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Game Controls</h4>
            
            <div className="space-y-3">
              {/* Auto Play Controls */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Auto Play Strategy</label>
                <div className="grid grid-cols-3 gap-2">
                  {['stay', 'switch', 'random'].map(strategy => (
                    <button
                      key={strategy}
                      onClick={() => setAutoStrategy(strategy)}
                      className={cn(
                        "px-3 py-2 rounded text-sm font-medium capitalize transition-colors",
                        autoStrategy === strategy
                          ? "bg-blue-600 text-white"
                          : "bg-neutral-700 hover:bg-neutral-600 text-white"
                      )}
                    >
                      {strategy}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Speed Control */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300">
                  Game Speed: {gameSpeed}ms
                </label>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="100"
                  value={gameSpeed}
                  onChange={(e) => setGameSpeed(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setAutoPlay(!autoPlay)}
                  variant={autoPlay ? "danger" : "primary"}
                  className="flex-1"
                >
                  {autoPlay ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Auto Play
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => handleManualAction(resetGame)}
                  variant="secondary"
                  disabled={stage === 'initial' && !selectedDoor}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Game
                </Button>
              </div>
              
              {/* Clear History */}
              <Button
                onClick={() => {
                  setGameHistory([]);
                  setInteractionCount(0);
                }}
                variant="neutral"
                className="w-full"
                disabled={gameHistory.length === 0}
              >
                Clear History
              </Button>
            </div>
          </VisualizationSection>
          
          {/* Learning Insights */}
          <VisualizationSection className="p-4 bg-gradient-to-br from-blue-900/20 to-emerald-900/20 border-blue-600/30">
            <h4 className="text-base font-bold text-blue-300 mb-3">Learning Insights</h4>
            
            <div className="space-y-3">
              <p className="text-sm text-blue-200">
                {insight.message}
              </p>
              
              {insight.showFormula && (
                <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-600/30">
                  <LatexContent>
                    <div className="text-xs text-blue-300">
                      <p className="mb-2">The mathematics:</p>
                      <p><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Win}|\\text{Stay}) = \\frac{1}{3}\\)` }} /></p>
                      <p><span dangerouslySetInnerHTML={{ __html: `\\(P(\\text{Win}|\\text{Switch}) = \\frac{2}{3}\\)` }} /></p>
                      <p className="mt-2 text-emerald-300">
                        Switching doubles your chances!
                      </p>
                    </div>
                  </LatexContent>
                </div>
              )}
              
              {/* Progress Bar */}
              {gameHistory.length > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Learning Progress</span>
                    <span>{gameHistory.length}/30 games</span>
                  </div>
                  <ProgressBar
                    current={gameHistory.length}
                    total={30}
                    variant="teal"
                  />
                </div>
              )}
            </div>
          </VisualizationSection>
          
          {/* Statistics */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Statistics</h4>
            
            <div className="space-y-3">
              {/* Win Rates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-700">
                  <div className="text-xs text-neutral-400 mb-1">Stay Strategy</div>
                  <div className="text-lg font-mono text-amber-400">
                    {stats.counts.stay.total > 0 
                      ? `${(stats.observed.stay * 100).toFixed(1)}%`
                      : '—'}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {stats.counts.stay.wins}/{stats.counts.stay.total} wins
                  </div>
                </div>
                
                <div className="bg-neutral-900 rounded-lg p-3 border border-neutral-700">
                  <div className="text-xs text-neutral-400 mb-1">Switch Strategy</div>
                  <div className="text-lg font-mono text-emerald-400">
                    {stats.counts.switch.total > 0 
                      ? `${(stats.observed.switch * 100).toFixed(1)}%`
                      : '—'}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {stats.counts.switch.wins}/{stats.counts.switch.total} wins
                  </div>
                </div>
              </div>
              
              {/* Game History */}
              <GameHistory history={gameHistory} showRecent={15} />
            </div>
          </VisualizationSection>
        </div>
        
        {/* Right Panel - Game Visualization */}
        <div className="lg:w-2/3 space-y-4">
          {/* Main Game Area */}
          <GraphContainer height="400px" className="flex items-center justify-center">
            <div className="space-y-8">
              {/* Stage Indicator */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {stage === 'initial' && 'Choose a Door'}
                  {stage === 'revealed' && 'Monty Reveals a Goat - Stay or Switch?'}
                  {stage === 'final' && (finalChoice === carPosition ? '🎉 You Won!' : '😔 You Lost')}
                </h3>
                {stage === 'revealed' && (
                  <p className="text-sm text-neutral-400">
                    Door {revealedDoor + 1} has a goat. Will you stay with door {selectedDoor + 1} or switch?
                  </p>
                )}
              </div>
              
              {/* Doors */}
              <div className="flex justify-center gap-6">
                {[0, 1, 2].map(i => (
                  <Door
                    key={i}
                    index={i}
                    isSelected={selectedDoor === i}
                    isRevealed={revealedDoor === i || (stage === 'final')}
                    hasCar={carPosition === i}
                    isWinner={stage === 'final' && finalChoice === i && carPosition === i}
                    isLoser={stage === 'final' && finalChoice === i && carPosition !== i}
                    onClick={(doorIndex) => handleManualAction(() => selectDoor(doorIndex))}
                    disabled={
                      (stage === 'initial' && selectedDoor !== null) ||
                      (stage === 'revealed' && revealedDoor === i) ||
                      stage === 'final'
                    }
                    stage={stage}
                  />
                ))}
              </div>
              
              {/* Decision Buttons for Revealed Stage */}
              {stage === 'revealed' && !autoPlay && (
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => handleManualAction(() => selectDoor(selectedDoor))}
                    variant="secondary"
                    size="lg"
                  >
                    Stay with Door {selectedDoor + 1}
                  </Button>
                  <Button
                    onClick={() => {
                      const otherDoor = [0, 1, 2].find(d => d !== selectedDoor && d !== revealedDoor);
                      handleManualAction(() => selectDoor(otherDoor));
                    }}
                    variant="primary"
                    size="lg"
                  >
                    Switch to Door {[0, 1, 2].find(d => d !== selectedDoor && d !== revealedDoor) + 1}
                  </Button>
                </div>
              )}
            </div>
          </GraphContainer>
          
          {/* Probability Visualization */}
          <VisualizationSection className="p-4">
            <h4 className="text-base font-bold text-white mb-3">Probability Comparison</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Theoretical Probabilities */}
              <div>
                <h5 className="text-sm text-neutral-400 mb-2">Theoretical Probabilities</h5>
                <ProbabilityChart 
                  probabilities={stats.theoretical}
                  currentStrategy={stage === 'final' ? (finalChoice === selectedDoor ? 'Stay' : 'Switch') : null}
                  animateChange={false}
                />
              </div>
              
              {/* Observed Probabilities */}
              <div>
                <h5 className="text-sm text-neutral-400 mb-2">
                  Your Results ({gameHistory.length} games)
                </h5>
                <ProbabilityChart 
                  probabilities={stats.observed}
                  currentStrategy={stage === 'final' ? (finalChoice === selectedDoor ? 'Stay' : 'Switch') : null}
                  animateChange={true}
                />
              </div>
            </div>
          </VisualizationSection>
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default MontyHallInteractive;