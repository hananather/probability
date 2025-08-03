"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../../lib/design-system';
import { Button } from '../../ui/button';
import { ProgressBar } from '../../ui/ProgressBar';
import { Car, DoorOpen, X, RotateCcw, Play, Pause } from 'lucide-react';
import { useSafeMathJax } from '../../../utils/mathJaxFix';
import { tutorial_1_7_1 } from '@/tutorials/chapter1';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

// Animation timing constants
const ANIMATION_CONSTANTS = {
  DOOR_REVEAL_TIMEOUT: 600, // Timeout for door reveal animation
};

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
  stage,
  isFocused,
  onFocus
}) {
  const doorRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Generate descriptive ARIA label based on door state
  const getAriaLabel = () => {
    let label = `Door ${index + 1}`;
    
    if (isRevealed) {
      label += `, revealed, contains ${hasCar ? 'the car' : 'a goat'}`;
    } else if (isSelected && stage === 'initial') {
      label += ', your initial choice';
    } else if (isSelected && stage === 'revealed') {
      label += ', your current choice';
    }
    
    if (stage === 'final') {
      if (isWinner) {
        label += ', you won!';
      } else if (isLoser) {
        label += ', you lost';
      }
    }
    
    if (disabled) {
      label += ', not selectable';
    } else {
      label += ', click to select';
    }
    
    return label;
  };
  
  // Generate live region announcement for state changes
  const getStatusAnnouncement = () => {
    if (stage === 'final') {
      if (isWinner) return `Door ${index + 1} had the car! You won!`;
      if (isLoser) return `Door ${index + 1} had a goat. You lost.`;
    }
    if (isRevealed && !hasCar) {
      return `Door ${index + 1} revealed to contain a goat`;
    }
    return '';
  };
  
  // Animate door reveal
  useEffect(() => {
    if (isRevealed && doorRef.current) {
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), ANIMATION_CONSTANTS.DOOR_REVEAL_TIMEOUT);
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
        "relative transition-all duration-300 focus-within:outline-none",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        isAnimating && "animate-pulse",
        isFocused && !disabled && "ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-900"
      )}
      style={{ filter: getDoorGlow() }}
    >
      {/* Accessible button overlay */}
      <button
        className="absolute inset-0 w-full h-full bg-transparent border-none outline-none z-10"
        onClick={() => !disabled && onClick(index)}
        onFocus={() => onFocus && onFocus(index)}
        disabled={disabled}
        aria-label={getAriaLabel()}
        aria-pressed={isSelected}
        aria-describedby={isRevealed ? `door-${index}-status` : undefined}
        tabIndex={disabled ? -1 : 0}
      />
      
      {/* Hidden status announcements for screen readers */}
      {getStatusAnnouncement() && (
        <div 
          id={`door-${index}-status`}
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {getStatusAnnouncement()}
        </div>
      )}
      {/* Door Frame */}
      <svg width="120" height="160" viewBox="0 0 120 160">
        {/* Door Background */}
        <rect
          x="10"
          y="10"
          width="100"
          height="140"
          fill={getDoorColor()}
          stroke="#1f2937"
          strokeWidth="2"
          rx="4"
          className="transition-all duration-300"
        />
        
        {/* Door Handle */}
        <circle
          cx="95"
          cy="80"
          r="6"
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth="1.5"
        />
        
        {/* Door Number */}
        <text
          x="60"
          y="45"
          textAnchor="middle"
          fontSize="28"
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
              width="100"
              height="140"
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
            <Car className="w-16 h-16 text-yellow-400" />
          ) : (
            <div className="text-4xl">🐐</div>
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
    
    // Clear existing elements with proper selection
    svg.select("g.chart-container").remove();
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append("g")
      .attr("class", "chart-container")
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
      
    // Cleanup function for D3 transitions
    // Cleanup function
    return () => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").interrupt();
        svg.select("g.chart-container").remove();
      }
    };
  }, [probabilities, currentStrategy, animateChange]);
  
  return <svg ref={svgRef} style={{ width: "100%", height: "200px" }} />;
});

// Game History Component
const GameHistory = memo(function GameHistory({ history, showRecent = 10 }) {
  if (!history || history.length === 0) return null;
  
  const displayHistory = showRecent ? (history || []).slice(-showRecent) : (history || []);
  const wins = (history || []).filter(g => g.won).length;
  const winRate = history && history.length > 0 ? (wins / history.length * 100).toFixed(1) : 0;
  
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
const MontyHallInteractive = memo(function MontyHallInteractive({ embedded = false, onGameComplete, onStageComplete }) {
  // Game state
  const [stage, setStage] = useState('initial'); // initial, revealed, final
  const [carPosition, setCarPosition] = useState(Math.floor(Math.random() * 3));
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [revealedDoor, setRevealedDoor] = useState(null);
  const [finalChoice, setFinalChoice] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoStrategy, setAutoStrategy] = useState('switch'); // switch, stay, random
  const [gameSpeed, setGameSpeed] = useState(1000);
  
  // Accessibility state
  const [focusedDoor, setFocusedDoor] = useState(0);
  const [gameStateAnnouncement, setGameStateAnnouncement] = useState('');
  
  // Statistics
  const [gameHistory, setGameHistory] = useState([]);
  const [interactionCount, setInteractionCount] = useState(0);
  
  // Refs
  const autoPlayInterval = useRef(null);
  const gameResetTimeout = useRef(null);
  const doorRevealTimeout = useRef(null);
  const stageCompleteTimeout = useRef(null);
  const gameContainerRef = useRef(null);
  
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
      setGameStateAnnouncement(`You selected door ${doorIndex + 1}. Monty is revealing a door with a goat.`);
      
      // Clear any existing door reveal timeout
      if (doorRevealTimeout.current) {
        clearTimeout(doorRevealTimeout.current);
      }
      
      // Monty reveals a door after selection
      doorRevealTimeout.current = setTimeout(() => {
        const availableDoors = [0, 1, 2].filter(d => d !== doorIndex && d !== carPosition);
        const doorToReveal = availableDoors[Math.floor(Math.random() * availableDoors.length)];
        setRevealedDoor(doorToReveal);
        setStage('revealed');
        setGameStateAnnouncement(`Monty revealed door ${doorToReveal + 1} with a goat. You can stay with door ${doorIndex + 1} or switch to the remaining door.`);
        doorRevealTimeout.current = null;
      }, 500);
    } else if (stage === 'revealed' && doorIndex !== revealedDoor) {
      // Make final choice
      setFinalChoice(doorIndex);
      setStage('final');
      
      // Record game result
      const strategy = doorIndex === selectedDoor ? 'stay' : 'switch';
      const won = doorIndex === carPosition;
      setGameHistory(prev => [...prev, { strategy, won }]);
      
      // Announce result
      const resultText = won ? `Congratulations! You won! Door ${doorIndex + 1} had the car.` : `Sorry! You lost. Door ${doorIndex + 1} had a goat. The car was behind door ${carPosition + 1}.`;
      setGameStateAnnouncement(resultText);
      
      // Call onGameComplete callback if provided
      if (onGameComplete) {
        onGameComplete({ strategy, won });
      }
      
      // Check if stage is complete (after playing enough games)
      if (onStageComplete) {
        const newHistory = [...gameHistory, { strategy, won }];
        if (newHistory.length === 3 || newHistory.length === 5) {
          // Clear any existing stage complete timeout
          if (stageCompleteTimeout.current) {
            clearTimeout(stageCompleteTimeout.current);
          }
          
          // Trigger completion after 3 or 5 games
          stageCompleteTimeout.current = setTimeout(() => {
            onStageComplete(newHistory.length);
            stageCompleteTimeout.current = null;
          }, 1500); // Give time to see the result
        }
      }
    }
  }, [stage, selectedDoor, carPosition, revealedDoor, onGameComplete, gameHistory]);
  
  // Reset game
  const resetGame = useCallback(() => {
    // Clear any pending timeouts
    if (doorRevealTimeout.current) {
      clearTimeout(doorRevealTimeout.current);
      doorRevealTimeout.current = null;
    }
    if (stageCompleteTimeout.current) {
      clearTimeout(stageCompleteTimeout.current);
      stageCompleteTimeout.current = null;
    }
    
    setStage('initial');
    setCarPosition(Math.floor(Math.random() * 3));
    setSelectedDoor(null);
    setRevealedDoor(null);
    setFinalChoice(null);
    setFocusedDoor(0);
    setGameStateAnnouncement('New game started. Choose a door to begin.');
  }, []);
  
  // Keyboard navigation handlers
  const handleKeyDown = useCallback((e) => {
    if (autoPlay || stage === 'final') return;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedDoor(prev => (prev - 1 + 3) % 3);
        break;
      case 'ArrowRight':
        e.preventDefault();
        setFocusedDoor(prev => (prev + 1) % 3);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (stage === 'revealed' && focusedDoor === revealedDoor) {
          // Can't select revealed door
          setGameStateAnnouncement(`Door ${focusedDoor + 1} is already revealed and cannot be selected.`);
          return;
        }
        if (stage === 'initial' && selectedDoor !== null) {
          // Already selected a door in initial stage
          return;
        }
        selectDoor(focusedDoor);
        break;
      case 'Escape':
        e.preventDefault();
        if (stage !== 'initial' || selectedDoor !== null) {
          resetGame();
        }
        break;
      default:
        break;
    }
  }, [autoPlay, stage, focusedDoor, revealedDoor, selectedDoor, selectDoor, resetGame]);
  
  // Focus management
  useEffect(() => {
    if (gameContainerRef.current) {
      gameContainerRef.current.addEventListener('keydown', handleKeyDown);
      return () => {
        if (gameContainerRef.current) {
          gameContainerRef.current.removeEventListener('keydown', handleKeyDown);
        }
      };
    }
  }, [handleKeyDown]);
  
  // Auto-focus game container on mount and stage changes
  useEffect(() => {
    if (gameContainerRef.current && !autoPlay) {
      gameContainerRef.current.focus();
    }
  }, [stage, autoPlay]);
  
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
          gameResetTimeout.current = setTimeout(resetGame, gameSpeed / 2);
        }
      }, gameSpeed);
      
      return () => {
        if (autoPlayInterval.current) {
          clearInterval(autoPlayInterval.current);
          autoPlayInterval.current = null;
        }
        if (gameResetTimeout.current) {
          clearTimeout(gameResetTimeout.current);
          gameResetTimeout.current = null;
        }
      };
    }
  }, [autoPlay, stage, autoStrategy, gameSpeed, selectDoor, resetGame, selectedDoor, revealedDoor]);
  
  // Cleanup effect on component unmount
  useEffect(() => {
    return () => {
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current);
      }
      if (gameResetTimeout.current) {
        clearTimeout(gameResetTimeout.current);
      }
      if (doorRevealTimeout.current) {
        clearTimeout(doorRevealTimeout.current);
      }
      if (stageCompleteTimeout.current) {
        clearTimeout(stageCompleteTimeout.current);
      }
    };
  }, []);
  
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
  
  const content = (
      <div className={cn(
        "flex flex-col gap-4",
        !embedded && "lg:flex-row",
        embedded && "w-full"
      )}>
        {/* Left Panel - Controls and Learning */}
        {!embedded && (
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
        )}
        
        {/* Right Panel - Game Visualization */}
        <div className={cn(
          "space-y-3",
          !embedded && "lg:w-2/3",
          embedded && "w-full"
        )}>
          {/* Main Game Area */}
          <GraphContainer className={cn(
            "flex items-center justify-center",
            embedded ? "min-h-[400px] h-[60vh] max-h-[600px]" : "min-h-[300px] h-[50vh] max-h-[500px]"
          )}>
            <div className={cn(
              "space-y-4",
              embedded && "space-y-6"
            )}>
              {/* Stage Indicator */}
              <div className="text-center">
                <h3 className={cn(
                  "font-semibold text-white mb-2",
                  embedded ? "text-xl" : "text-lg"
                )}>
                  {stage === 'initial' && 'Choose a Door'}
                  {stage === 'revealed' && 'Monty Reveals a Goat - Stay or Switch?'}
                  {stage === 'final' && (finalChoice === carPosition ? '🎉 You Won!' : '😔 You Lost')}
                </h3>
                {stage === 'revealed' && (
                  <p className={cn(
                    "text-neutral-400",
                    embedded ? "text-base" : "text-sm"
                  )}>
                    Door {revealedDoor + 1} has a goat. Will you stay with door {selectedDoor + 1} or switch?
                  </p>
                )}
              </div>
              
              {/* Doors */}
              <div 
                className={cn(
                  "flex justify-center",
                  embedded ? "gap-6" : "gap-4"
                )}
                role="group"
                aria-label="Three doors - choose one to find the car"
                ref={gameContainerRef}
                tabIndex={-1}
                style={{ outline: 'none' }}
              >
                {[0, 1, 2].map(i => (
                  <div key={i} className={embedded ? "scale-110" : ""}>
                    <Door
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
                      isFocused={focusedDoor === i}
                      onFocus={setFocusedDoor}
                    />
                  </div>
                ))}
              </div>
              
              {/* Screen reader live region for game state announcements */}
              <div 
                className="sr-only" 
                aria-live="assertive" 
                aria-atomic="true"
                role="status"
              >
                {gameStateAnnouncement}
              </div>
              
              {/* Keyboard instructions */}
              <div className="text-center mt-4">
                <p className="text-xs text-neutral-500">
                  Use arrow keys to navigate, Enter/Space to select, Escape to reset
                </p>
              </div>
              
              {/* Decision Buttons for Revealed Stage */}
              {stage === 'revealed' && !autoPlay && (
                <div 
                  className={cn(
                    "flex justify-center gap-4",
                    embedded && "mt-8"
                  )}
                  role="group"
                  aria-label="Choose your final decision: stay or switch"
                >
                  <Button
                    onClick={() => handleManualAction(() => selectDoor(selectedDoor))}
                    variant="secondary"
                    size={embedded ? "xl" : "lg"}
                    className={embedded ? "px-6 py-3" : ""}
                    aria-describedby="stay-description"
                  >
                    Stay with Door {selectedDoor + 1}
                  </Button>
                  <Button
                    onClick={() => {
                      const otherDoor = [0, 1, 2].find(d => d !== selectedDoor && d !== revealedDoor);
                      handleManualAction(() => selectDoor(otherDoor));
                    }}
                    variant="primary"
                    size={embedded ? "xl" : "lg"}
                    className={embedded ? "px-6 py-3" : ""}
                    aria-describedby="switch-description"
                  >
                    Switch to Door {[0, 1, 2].find(d => d !== selectedDoor && d !== revealedDoor) + 1}
                  </Button>
                  
                  {/* Hidden descriptions for screen readers */}
                  <div id="stay-description" className="sr-only">
                    Keep your original choice of door {selectedDoor + 1}. Probability of winning: 33.3%
                  </div>
                  <div id="switch-description" className="sr-only">
                    Switch to the other remaining door. Probability of winning: 66.7%
                  </div>
                </div>
              )}
              
              {/* Play Again Button for Final Stage */}
              {stage === 'final' && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={resetGame}
                    variant="primary"
                    size="lg"
                    className="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    aria-label="Start a new game"
                    autoFocus
                  >
                    <RotateCcw className="w-5 h-5 mr-2" aria-hidden="true" />
                    Play Again
                  </Button>
                </div>
              )}
              
              {/* Embedded mode statistics */}
              {embedded && gameHistory.length > 0 && (
                <div className="mt-8 p-4 bg-neutral-900/50 rounded-lg border border-neutral-700">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-neutral-300">Your Statistics</span>
                    <span className="text-xs text-neutral-500">
                      {gameHistory.length} game{gameHistory.length !== 1 ? 's' : ''} played
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-800/50 rounded p-3">
                      <div className="text-xs text-amber-400 mb-1">Stay Strategy</div>
                      <div className="text-xl font-mono text-white">
                        {stats.counts.stay.total > 0 
                          ? `${(stats.observed.stay * 100).toFixed(0)}%`
                          : '—'}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {stats.counts.stay.wins}/{stats.counts.stay.total} wins
                      </div>
                    </div>
                    
                    <div className="bg-neutral-800/50 rounded p-3">
                      <div className="text-xs text-emerald-400 mb-1">Switch Strategy</div>
                      <div className="text-xl font-mono text-white">
                        {stats.counts.switch.total > 0 
                          ? `${(stats.observed.switch * 100).toFixed(0)}%`
                          : '—'}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {stats.counts.switch.wins}/{stats.counts.switch.total} wins
                      </div>
                    </div>
                  </div>
                  
                  {gameHistory.length >= 3 && (
                    <div className="mt-3 text-center">
                      <p className="text-xs text-emerald-400">
                        {gameHistory.length >= 5 
                          ? "Great job! You're seeing the pattern emerge."
                          : "Keep playing to see the surprising pattern!"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </GraphContainer>
          
          {/* Probability Visualization - Only show when not embedded */}
          {!embedded && (
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
          )}
        </div>
      </div>
  );
  
  // If embedded, return content without VisualizationContainer
  if (embedded) {
    return content;
  }
  
  // Otherwise, wrap in VisualizationContainer
  return (
    <VisualizationContainer
      title="The Monty Hall Problem"
      tutorialSteps={tutorial_1_7_1}
      tutorialKey="monty-hall-interactive"
    >
      {content}
    </VisualizationContainer>
  );
});

export default MontyHallInteractive;