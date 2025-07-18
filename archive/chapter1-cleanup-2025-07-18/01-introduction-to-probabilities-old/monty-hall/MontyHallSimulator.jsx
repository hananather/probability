"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as d3 from "@/utils/d3-utils";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer
} from '../../ui/VisualizationContainer';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/design-system';
import MontyDoor from './MontyDoor';
import MontyControls from './MontyControls';

const MontyHallSimulator = () => {
  // Simulation state
  const [simulations, setSimulations] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [currentSimulation, setCurrentSimulation] = useState(null);
  const [targetSimulations, setTargetSimulations] = useState(100);
  
  // Chart refs
  const chartRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Calculate statistics
  const stats = useCallback(() => {
    const total = simulations.length;
    if (total === 0) return { switchWins: 0, stayWins: 0, switchRate: 0, stayRate: 0 };
    
    const switchSims = simulations.filter(s => s.strategy === 'switch');
    const staySims = simulations.filter(s => s.strategy === 'stay');
    
    const switchWins = switchSims.filter(s => s.won).length;
    const stayWins = staySims.filter(s => s.won).length;
    
    return {
      switchWins,
      stayWins,
      switchRate: switchSims.length > 0 ? switchWins / switchSims.length : 0,
      stayRate: staySims.length > 0 ? stayWins / staySims.length : 0,
      totalSwitch: switchSims.length,
      totalStay: staySims.length
    };
  }, [simulations]);

  // Run single simulation
  const runSingleSimulation = useCallback(() => {
    const carPosition = Math.floor(Math.random() * 3);
    const initialChoice = Math.floor(Math.random() * 3);
    
    // Host reveals a goat door
    const goatDoors = [0, 1, 2].filter(i => i !== initialChoice && i !== carPosition);
    const hostReveal = goatDoors[Math.floor(Math.random() * goatDoors.length)];
    
    // Randomly choose strategy
    const strategy = Math.random() < 0.5 ? 'switch' : 'stay';
    
    let finalChoice;
    if (strategy === 'switch') {
      finalChoice = [0, 1, 2].find(i => i !== initialChoice && i !== hostReveal);
    } else {
      finalChoice = initialChoice;
    }
    
    const won = finalChoice === carPosition;
    
    const simulation = {
      id: Date.now() + Math.random(),
      carPosition,
      initialChoice,
      hostReveal,
      finalChoice,
      strategy,
      won
    };
    
    setCurrentSimulation(simulation);
    setSimulations(prev => [...prev.slice(-999), simulation]); // Keep last 1000
    
    return simulation;
  }, []);

  // Start/stop simulation
  const toggleSimulation = useCallback(() => {
    if (isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);
    } else {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        runSingleSimulation();
      }, speed);
    }
  }, [isRunning, speed, runSingleSimulation]);

  // Update speed
  useEffect(() => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        runSingleSimulation();
      }, speed);
    }
  }, [speed, isRunning, runSingleSimulation]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Run batch simulations
  const runBatch = useCallback((count) => {
    const newSimulations = [];
    for (let i = 0; i < count; i++) {
      const carPosition = Math.floor(Math.random() * 3);
      const initialChoice = Math.floor(Math.random() * 3);
      
      const goatDoors = [0, 1, 2].filter(j => j !== initialChoice && j !== carPosition);
      const hostReveal = goatDoors[Math.floor(Math.random() * goatDoors.length)];
      
      // Half switch, half stay
      const strategy = i % 2 === 0 ? 'switch' : 'stay';
      
      let finalChoice;
      if (strategy === 'switch') {
        finalChoice = [0, 1, 2].find(j => j !== initialChoice && j !== hostReveal);
      } else {
        finalChoice = initialChoice;
      }
      
      newSimulations.push({
        id: Date.now() + i,
        carPosition,
        initialChoice,
        hostReveal,
        finalChoice,
        strategy,
        won: finalChoice === carPosition
      });
    }
    
    setSimulations(prev => [...prev, ...newSimulations].slice(-1000));
  }, []);

  // D3 Chart
  useEffect(() => {
    if (!chartRef.current) return;
    
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();
    
    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Calculate running averages
    const runningData = [];
    let switchTotal = 0, switchWins = 0, stayTotal = 0, stayWins = 0;
    
    simulations.forEach((sim, i) => {
      if (sim.strategy === 'switch') {
        switchTotal++;
        if (sim.won) switchWins++;
      } else {
        stayTotal++;
        if (sim.won) stayWins++;
      }
      
      runningData.push({
        index: i,
        switchRate: switchTotal > 0 ? switchWins / switchTotal : 0,
        stayRate: stayTotal > 0 ? stayWins / stayTotal : 0
      });
    });
    
    // Scales
    const x = d3.scaleLinear()
      .domain([0, Math.max(runningData.length - 1, 1)])
      .range([0, width]);
    
    const y = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);
    
    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);
    
    // Theoretical lines
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(2/3))
      .attr("y2", y(2/3))
      .style("stroke", "#10b981")
      .style("stroke-width", 1)
      .style("stroke-dasharray", "5,5")
      .style("opacity", 0.5);
    
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(1/3))
      .attr("y2", y(1/3))
      .style("stroke", "#ef4444")
      .style("stroke-width", 1)
      .style("stroke-dasharray", "5,5")
      .style("opacity", 0.5);
    
    // Line generators
    const switchLine = d3.line()
      .x(d => x(d.index))
      .y(d => y(d.switchRate))
      .curve(d3.curveMonotoneX);
    
    const stayLine = d3.line()
      .x(d => x(d.index))
      .y(d => y(d.stayRate))
      .curve(d3.curveMonotoneX);
    
    // Draw lines
    if (runningData.length > 0) {
      g.append("path")
        .datum(runningData)
        .attr("fill", "none")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 2)
        .attr("d", switchLine);
      
      g.append("path")
        .datum(runningData)
        .attr("fill", "none")
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("d", stayLine);
    }
    
    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "#fff")
      .style("text-anchor", "middle")
      .text("Simulations");
    
    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".0%")))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("fill", "#fff")
      .style("text-anchor", "middle")
      .text("Win Rate");
    
    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${width - 100}, 10)`);
    
    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .style("stroke", "#10b981")
      .style("stroke-width", 2);
    
    legend.append("text")
      .attr("x", 25)
      .attr("y", 4)
      .style("fill", "#10b981")
      .style("font-size", "12px")
      .text("Switch");
    
    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 20)
      .attr("y2", 20)
      .style("stroke", "#ef4444")
      .style("stroke-width", 2);
    
    legend.append("text")
      .attr("x", 25)
      .attr("y", 24)
      .style("fill", "#ef4444")
      .style("font-size", "12px")
      .text("Stay");
    
  }, [simulations]);

  const currentStats = stats();

  return (
    <VisualizationContainer 
      title="Monty Hall Problem - Statistical Simulator"
      className="max-w-6xl mx-auto"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls and Current Simulation */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <VisualizationSection className="p-4 bg-neutral-800 rounded-lg">
            <h4 className="text-base font-semibold text-white mb-3">Quick Simulations</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => runBatch(10)}
                variant="primary"
                size="sm"
                disabled={isRunning}
              >
                Run 10
              </Button>
              <Button
                onClick={() => runBatch(100)}
                variant="primary"
                size="sm"
                disabled={isRunning}
              >
                Run 100
              </Button>
              <Button
                onClick={() => runBatch(500)}
                variant="primary"
                size="sm"
                disabled={isRunning}
              >
                Run 500
              </Button>
              <Button
                onClick={() => runBatch(1000)}
                variant="primary"
                size="sm"
                disabled={isRunning}
              >
                Run 1000
              </Button>
            </div>
          </VisualizationSection>

          {/* Controls */}
          <MontyControls
            onAutoPlay={toggleSimulation}
            onReset={() => setSimulations([])}
            onSpeedChange={setSpeed}
            isAutoPlaying={isRunning}
            speed={speed}
          />

          {/* Current Simulation */}
          {currentSimulation && (
            <VisualizationSection className="p-4 bg-neutral-800 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-3">Last Simulation</h4>
              <div className="flex justify-center gap-2 mb-3">
                {[0, 1, 2].map((i) => (
                  <MontyDoor
                    key={i}
                    doorNumber={i + 1}
                    state={
                      i === currentSimulation.hostReveal ? 'revealed' :
                      i === currentSimulation.finalChoice ? 'selected' : 'closed'
                    }
                    prize={i === currentSimulation.carPosition ? 'car' : 'goat'}
                    size="small"
                    showNumber={false}
                  />
                ))}
              </div>
              <div className="text-xs space-y-1">
                <p>Strategy: <span className={cn(
                  "font-bold",
                  currentSimulation.strategy === 'switch' ? 'text-green-400' : 'text-red-400'
                )}>{currentSimulation.strategy}</span></p>
                <p>Result: <span className={cn(
                  "font-bold",
                  currentSimulation.won ? 'text-yellow-400' : 'text-neutral-400'
                )}>{currentSimulation.won ? 'Won!' : 'Lost'}</span></p>
              </div>
            </VisualizationSection>
          )}
        </div>

        {/* Chart and Statistics */}
        <div className="lg:col-span-2 space-y-4">
          {/* Convergence Chart */}
          <GraphContainer height="300px">
            <svg ref={chartRef} className="w-full h-full" />
          </GraphContainer>

          {/* Statistics Summary */}
          <div className="grid grid-cols-2 gap-4">
            <VisualizationSection className="p-4 bg-neutral-800 rounded-lg">
              <h4 className="text-base font-semibold text-green-400 mb-2">Switch Strategy</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Games:</span>
                  <span className="font-mono">{currentStats.totalSwitch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Wins:</span>
                  <span className="font-mono">{currentStats.switchWins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Win Rate:</span>
                  <span className="font-mono text-green-400 font-bold">
                    {(currentStats.switchRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-700">
                  <div className="flex justify-between">
                    <span className="text-xs text-neutral-500">Theoretical:</span>
                    <span className="font-mono text-xs">66.7%</span>
                  </div>
                </div>
              </div>
            </VisualizationSection>

            <VisualizationSection className="p-4 bg-neutral-800 rounded-lg">
              <h4 className="text-base font-semibold text-red-400 mb-2">Stay Strategy</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Games:</span>
                  <span className="font-mono">{currentStats.totalStay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Wins:</span>
                  <span className="font-mono">{currentStats.stayWins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-400">Win Rate:</span>
                  <span className="font-mono text-red-400 font-bold">
                    {(currentStats.stayRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-700">
                  <div className="flex justify-between">
                    <span className="text-xs text-neutral-500">Theoretical:</span>
                    <span className="font-mono text-xs">33.3%</span>
                  </div>
                </div>
              </div>
            </VisualizationSection>
          </div>

          {/* Convergence Message */}
          {simulations.length > 100 && (
            <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
              <p className="text-sm text-blue-300">
                <span className="font-semibold">Law of Large Numbers:</span> Notice how the win rates 
                converge to their theoretical values (66.7% for switching, 33.3% for staying) as we 
                run more simulations. This demonstrates that switching really is the better strategy!
              </p>
            </div>
          )}
        </div>
      </div>
    </VisualizationContainer>
  );
};

export default MontyHallSimulator;