"use client";
import React, { useState, useEffect, useRef, memo } from "react";
import * as d3 from "d3";
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  ControlGroup
} from '../ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn, createColorScheme } from '../../lib/design-system';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

// Worked Example Component for Dice
const DiceWorkedExample = memo(function DiceWorkedExample({ event }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    // MathJax timeout pattern
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          console.error('MathJax error:', err);
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [event]);
  
  const examples = {
    even: {
      title: "Rolling an Even Number",
      event: "A = {2, 4, 6}",
      favorable: 3,
      calculation: "3/6 = 1/2"
    },
    prime: {
      title: "Rolling a Prime Number",
      event: "B = {2, 3, 5}",
      favorable: 3,
      calculation: "3/6 = 1/2"
    },
    greater: {
      title: "Rolling Greater Than 4",
      event: "C = {5, 6}",
      favorable: 2,
      calculation: "2/6 = 1/3"
    },
    multiple3: {
      title: "Rolling a Multiple of 3",
      event: "D = {3, 6}",
      favorable: 2,
      calculation: "2/6 = 1/3"
    }
  };
  
  const example = examples[event] || examples.even;
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#2A303C',
      padding: '1.5rem',
      borderRadius: '8px',
      color: '#e0e0e0',
      marginTop: '1rem'
    }}>
      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', borderBottom: '1px solid #4A5568', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        Example: {example.title}
      </h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>Sample Space:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[
          S = \\{1, 2, 3, 4, 5, 6\\}
        \\]` }} />
        <p style={{ fontSize: '0.875rem', color: '#cbd5e0' }}>All possible outcomes when rolling a fair die.</p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>Event:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[
          ${example.event}
        \\]` }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>Probability Calculation:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[
          P(\\text{Event}) = \\frac{\\text{Number of favorable outcomes}}{\\text{Total number of outcomes}} = \\frac{${example.favorable}}{6} = ${example.calculation}
        \\]` }} />
      </div>
      
      <div style={{ backgroundColor: '#1A202C', padding: '1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
        <strong>Key Principle:</strong> For equally likely outcomes, probability equals the ratio of 
        favorable outcomes to total outcomes.
      </div>
    </div>
  );
});

// Blood Pressure Example
const BloodPressureExample = memo(function BloodPressureExample() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    // MathJax timeout pattern
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
          console.error('MathJax error:', err);
        });
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#2A303C',
      padding: '1.5rem',
      borderRadius: '8px',
      color: '#e0e0e0',
      marginTop: '1rem'
    }}>
      <h4 style={{ fontSize: '1.125rem', fontWeight: '600', borderBottom: '1px solid #4A5568', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        Example: Frequentist Probability
      </h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Problem:</p>
        <p style={{ fontSize: '0.875rem' }}>
          In a group of 1000 people, 545 have high blood pressure. If one person is selected randomly, 
          what is the probability that this person has high blood pressure?
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>Solution:</p>
        <div dangerouslySetInnerHTML={{ __html: `\\[
          P(\\text{High BP}) = \\frac{545}{1000} = 0.545 = 54.5\\%
        \\]` }} />
      </div>
      
      <div style={{ backgroundColor: '#1A202C', padding: '1rem', borderRadius: '4px', fontSize: '0.875rem' }}>
        <strong>Frequentist Interpretation:</strong> The relative frequency of people with high blood 
        pressure (545/1000) gives us the probability. As sample size increases, relative frequency 
        approaches true probability.
      </div>
    </div>
  );
});

function ProbabilityEvent() {
  const [experiment, setExperiment] = useState('dice'); // 'dice', 'coin', 'cards'
  const [eventType, setEventType] = useState('even'); // for dice
  const [trials, setTrials] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [history, setHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDiceExample, setShowDiceExample] = useState(true);
  const [showFreqExample, setShowFreqExample] = useState(false);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [targetTrials, setTargetTrials] = useState(1000);
  
  const svgRef = useRef(null);
  const intervalRef = useRef(null);
  const autoRunRef = useRef(null);
  
  // Define events for different experiments
  const diceEvents = {
    even: { name: "Even", check: (n) => n % 2 === 0, theoretical: 1/2, values: [2, 4, 6] },
    prime: { name: "Prime", check: (n) => [2, 3, 5].includes(n), theoretical: 1/2, values: [2, 3, 5] },
    greater: { name: "> 4", check: (n) => n > 4, theoretical: 1/3, values: [5, 6] },
    multiple3: { name: "Multiple of 3", check: (n) => n % 3 === 0, theoretical: 1/3, values: [3, 6] }
  };
  
  const coinEvents = {
    heads: { name: "Heads", check: (n) => n === 1, theoretical: 1/2 },
    tails: { name: "Tails", check: (n) => n === 0, theoretical: 1/2 }
  };
  
  const cardEvents = {
    ace: { name: "Ace", check: (n) => n % 13 === 0, theoretical: 4/52 },
    heart: { name: "Heart", check: (n) => n < 13, theoretical: 13/52 },
    face: { name: "Face Card", check: (n) => [10, 11, 12].includes(n % 13), theoretical: 12/52 },
    red: { name: "Red Card", check: (n) => n < 26, theoretical: 26/52 }
  };
  
  // Get current event configuration
  function getCurrentEvent() {
    if (experiment === 'dice') return diceEvents[eventType];
    if (experiment === 'coin') return coinEvents.heads;
    if (experiment === 'cards') return cardEvents.heart;
    return diceEvents.even;
  }
  
  // Run single trial
  function runTrial() {
    let outcome;
    if (experiment === 'dice') {
      outcome = Math.floor(Math.random() * 6) + 1;
    } else if (experiment === 'coin') {
      outcome = Math.random() < 0.5 ? 0 : 1;
    } else if (experiment === 'cards') {
      outcome = Math.floor(Math.random() * 52);
    }
    
    const event = getCurrentEvent();
    const success = event.check(outcome);
    
    setTrials(prev => prev + 1);
    if (success) setSuccesses(prev => prev + 1);
    
    setHistory(prev => [...prev.slice(-99), { outcome, success }]);
    
    return { outcome, success };
  }
  
  // Main visualization
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const { width } = svgRef.current.getBoundingClientRect();
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a0a");
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    if (experiment === 'dice') {
      // Create probability bar chart instead of just dice faces
      const event = getCurrentEvent();
      const theoretical = event.theoretical;
      const experimental = trials > 0 ? successes / trials : 0;
      
      // Scales for bar chart
      const xScale = d3.scaleBand()
        .domain(['Theoretical', 'Experimental'])
        .range([0, innerWidth])
        .padding(0.4);
      
      const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);
      
      // Draw bars
      const data = [
        { label: 'Theoretical', value: theoretical, color: colorScheme.chart.secondary },
        { label: 'Experimental', value: experimental, color: colorScheme.chart.primary }
      ];
      
      g.selectAll('.bar')
        .data(data)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.label))
        .attr('y', d => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d.value))
        .attr('fill', d => d.color)
        .attr('opacity', 0.8);
      
      // Add value labels
      g.selectAll('.label')
        .data(data)
        .join('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.chart.text)
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text(d => d.value.toFixed(3));
      
      // Add axes
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('fill', colors.chart.text)
        .style('font-size', '14px');
      
      // Add y-axis
      g.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format('.0%')))
        .selectAll('text')
        .attr('fill', colors.chart.text)
        .style('font-size', '12px');
      
      // Add y-axis label
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (innerHeight / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .attr('fill', colors.chart.text)
        .text('Probability');
      
      // Add small dice icons above bars to show which outcomes are favorable
      const dieSize = 30;
      const diceY = -50;
      
      event.values.forEach((value, i) => {
        const x = innerWidth / 2 + (i - event.values.length / 2) * (dieSize + 5);
        
        // Mini die
        g.append('rect')
          .attr('x', x)
          .attr('y', diceY)
          .attr('width', dieSize)
          .attr('height', dieSize)
          .attr('fill', colorScheme.chart.primary)
          .attr('stroke', 'white')
          .attr('stroke-width', 1)
          .attr('rx', 4);
        
        // Number label
        g.append('text')
          .attr('x', x + dieSize / 2)
          .attr('y', diceY + dieSize / 2)
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', 'white')
          .style('font-size', '16px')
          .style('font-weight', 'bold')
          .text(value);
      });
      
      // Add event description
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', diceY - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.chart.text)
        .style('font-size', '14px')
        .text(`Event: ${event.name} = {${event.values.join(', ')}}`);
    }
    
    // Frequency chart - removed, now integrated into main visualization above
    
  }, [experiment, eventType, trials, successes]);
  
  // Run multiple trials
  function runMultipleTrials(count) {
    setIsRunning(true);
    let completed = 0;
    
    intervalRef.current = setInterval(() => {
      runTrial();
      completed++;
      
      if (completed >= count) {
        clearInterval(intervalRef.current);
        setIsRunning(false);
      }
    }, 50);
  }
  
  // Stop running
  function stop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    }
  }
  
  // Reset
  function reset() {
    stop();
    stopAutoRun();
    setTrials(0);
    setSuccesses(0);
    setHistory([]);
  }
  
  // Auto-run functions
  function startAutoRun() {
    if (autoRunRef.current) return;
    
    setIsAutoRunning(true);
    const runSpeed = 50; // ms between trials
    
    autoRunRef.current = setInterval(() => {
      setTrials(currentTrials => {
        if (currentTrials >= targetTrials) {
          stopAutoRun();
          return currentTrials;
        }
        runTrial();
        return currentTrials;
      });
    }, runSpeed);
  }
  
  function stopAutoRun() {
    if (autoRunRef.current) {
      clearInterval(autoRunRef.current);
      autoRunRef.current = null;
    }
    setIsAutoRunning(false);
  }
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (autoRunRef.current) {
        clearInterval(autoRunRef.current);
      }
    };
  }, []);

  return (
    <VisualizationContainer title="Probability of an Event" className="p-2">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Panel */}
        <div className="lg:w-1/3 space-y-3">
          <VisualizationSection className="p-3">
            <p className={cn(typography.description, "text-sm leading-relaxed")}>
              For equally likely outcomes, the probability of an event A is:
            </p>
            <div className="mt-2 p-2 bg-neutral-800 rounded text-center">
              <div className="text-sm text-neutral-300">P(A) = |A| / |S|</div>
              <div className="text-xs text-neutral-400 mt-1">
                (favorable outcomes) / (total outcomes)
              </div>
            </div>
          </VisualizationSection>

          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Experiment Setup</h4>
            
            {/* Experiment type */}
            <div className="mb-3">
              <label className="text-sm text-neutral-300 mb-2 block">Experiment Type</label>
              <select
                value={experiment}
                onChange={(e) => {
                  setExperiment(e.target.value);
                  reset();
                }}
                className={cn(components.select, "w-full")}
              >
                <option value="dice">Roll a Die</option>
                <option value="coin">Flip a Coin</option>
                <option value="cards">Draw a Card</option>
              </select>
            </div>
            
            {/* Event selection for dice */}
            {experiment === 'dice' && (
              <div className="mb-3">
                <label className="text-sm text-neutral-300 mb-2 block">Event</label>
                <select
                  value={eventType}
                  onChange={(e) => {
                    setEventType(e.target.value);
                    reset();
                  }}
                  className={cn(components.select, "w-full")}
                >
                  <option value="even">Even Number</option>
                  <option value="prime">Prime Number</option>
                  <option value="greater">Greater than 4</option>
                  <option value="multiple3">Multiple of 3</option>
                </select>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={() => runTrial()}
                disabled={isRunning}
                className={cn(
                  "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                  isRunning
                    ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                Run Single Trial
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => runMultipleTrials(10)}
                  disabled={isRunning}
                  className={cn(
                    "px-3 py-2 rounded text-sm font-medium transition-colors",
                    isRunning
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  )}
                >
                  Run 10
                </button>
                <button
                  onClick={() => runMultipleTrials(100)}
                  disabled={isRunning}
                  className={cn(
                    "px-3 py-2 rounded text-sm font-medium transition-colors",
                    isRunning
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  )}
                >
                  Run 100
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={stop}
                  disabled={!isRunning}
                  className={cn(
                    "flex-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                    !isRunning
                      ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  )}
                >
                  Stop
                </button>
                <button
                  onClick={reset}
                  className={cn(
                    "flex-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                    "bg-neutral-700 hover:bg-neutral-600 text-white"
                  )}
                >
                  Reset
                </button>
              </div>
            </div>
            
            {/* Show examples */}
            <div className="space-y-2 mt-3">
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={showDiceExample} 
                  onChange={e => setShowDiceExample(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-neutral-300">Show dice example</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={showFreqExample} 
                  onChange={e => setShowFreqExample(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-neutral-300">Show frequentist example</span>
              </label>
            </div>
          </VisualizationSection>

          {/* Results */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Results</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-300">Total Trials:</span>
                <span className="font-mono text-white">{trials}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Successes:</span>
                <span className="font-mono text-green-400">{successes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Experimental P:</span>
                <span className="font-mono text-yellow-400">
                  {trials > 0 ? (successes / trials).toFixed(4) : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Theoretical P:</span>
                <span className="font-mono text-blue-400">
                  {getCurrentEvent().theoretical.toFixed(4)}
                </span>
              </div>
              {trials > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-300">Difference:</span>
                  <span className="font-mono text-red-400">
                    {Math.abs(successes / trials - getCurrentEvent().theoretical).toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </VisualizationSection>

          {/* Auto-Run Section */}
          <VisualizationSection className="p-3">
            <h4 className="text-base font-bold text-white mb-3">Auto-Run Experiment</h4>
            
            <div className="mb-3">
              <label className="text-sm text-neutral-300 mb-1 block">Target Trials</label>
              <select
                value={targetTrials}
                onChange={(e) => setTargetTrials(Number(e.target.value))}
                className={cn(components.select, "w-full")}
              >
                <option value={100}>100 trials</option>
                <option value={500}>500 trials</option>
                <option value={1000}>1,000 trials</option>
                <option value={5000}>5,000 trials</option>
              </select>
            </div>
            
            <button
              onClick={isAutoRunning ? stopAutoRun : startAutoRun}
              disabled={isRunning}
              className={cn(
                "w-full px-3 py-2 rounded text-sm font-medium transition-colors",
                isAutoRunning
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : isRunning
                  ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              {isAutoRunning ? "Stop" : "Start"} Auto-Run
            </button>
            
            {isAutoRunning && (
              <div className="mt-3">
                <div className="text-xs text-neutral-300 mb-1">
                  Progress: {trials} / {targetTrials}
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((trials / targetTrials) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </VisualizationSection>

          {/* Learning Progress */}
          <VisualizationSection className="p-3">
            <h4 className="text-sm font-semibold text-purple-400 mb-2">Probability Insights</h4>
            <div className="space-y-2 text-xs text-neutral-300">
              {trials === 0 && (
                <div>
                  <p>🎯 Ready to explore probability?</p>
                  <p className="text-purple-300 mt-1">
                    Run trials to see how experimental probability converges to theoretical!
                  </p>
                </div>
              )}
              {trials > 0 && trials < 30 && (
                <div>
                  <p>📊 Early results can vary widely from theory.</p>
                  <p className="mt-1">Keep running trials to see the Law of Large Numbers in action!</p>
                </div>
              )}
              {trials >= 30 && trials < 100 && (
                <div>
                  <p>🎓 Notice the convergence:</p>
                  <p className="mt-1">
                    As trials increase, experimental probability approaches {getCurrentEvent().theoretical.toFixed(3)}
                  </p>
                </div>
              )}
              {trials >= 100 && (
                <div>
                  <p className="text-green-400 font-semibold mb-1">
                    ✨ Law of Large Numbers confirmed! {trials} trials completed.
                  </p>
                  <p>The difference is now just {Math.abs(successes / trials - getCurrentEvent().theoretical).toFixed(4)}!</p>
                </div>
              )}
            </div>
          </VisualizationSection>
        </div>

        {/* Right Panel */}
        <div className="lg:w-2/3 space-y-4">
          <GraphContainer height="450px">
            <svg ref={svgRef} style={{ width: "100%", height: 450 }} />
          </GraphContainer>
          
          {showDiceExample && experiment === 'dice' && (
            <DiceWorkedExample event={eventType} />
          )}
          
          {showFreqExample && <BloodPressureExample />}
        </div>
      </div>
    </VisualizationContainer>
  );
}

export default ProbabilityEvent;