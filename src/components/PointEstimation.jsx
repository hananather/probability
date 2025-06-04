"use client";
import React, { useRef, useState } from 'react';
import { 
  VisualizationContainer, 
  VisualizationSection,
  GraphContainer,
  StatsDisplay,
  ControlGroup 
} from './ui/VisualizationContainer';
import { colors, typography, components, formatNumber, cn } from '../lib/design-system';

const CANVAS_SIZE = 500;

function PointEstimation() {
  const canvasRef = useRef(null);
  const [m, setM] = useState(0);
  const [n, setN] = useState(0);

  // Draw initial square and circle
  const drawBase = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Fill background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw border
    ctx.strokeStyle = colors.chart.grid;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw circle with teal color
    ctx.beginPath();
    ctx.fillStyle = colors.chart.primaryArea;
    ctx.arc(CANVAS_SIZE/2, CANVAS_SIZE/2, CANVAS_SIZE/2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  };

  // Draw a single random dot
  const drawDot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const x = Math.random() * CANVAS_SIZE;
    const y = Math.random() * CANVAS_SIZE;
    
    // Check if inside circle
    const xCircle = CANVAS_SIZE / 2;
    const yCircle = CANVAS_SIZE / 2;
    const rCircle = CANVAS_SIZE / 2;
    const inside = Math.pow(x - xCircle, 2) + Math.pow(y - yCircle, 2) <= Math.pow(rCircle, 2);
    
    // Draw dot with appropriate color
    ctx.beginPath();
    ctx.fillStyle = inside ? colors.chart.primary : colors.chart.secondary;
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    
    // Update counts
    setN(prevN => prevN + 1);
    if (inside) setM(prevM => prevM + 1);
  };

  // Drop N dots with animation
  const dropDots = (count, delay) => {
    let dropped = 0;
    function drop() {
      drawDot();
      dropped++;
      if (dropped < count) {
        setTimeout(drop, delay);
      }
    }
    drop();
  };

  // Reset everything
  const handleReset = () => {
    setM(0);
    setN(0);
    drawBase();
  };

  // Draw base when component mounts
  React.useEffect(() => {
    drawBase();
  }, []);

  // compute π̂ for display
  const piEstimate = n === 0 ? '—' : formatNumber(4 * m / n, 4);

  return (
    <VisualizationContainer title="Point Estimation">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Text and formulas */}
        <VisualizationSection>
          <div className="space-y-4">
            <p className={typography.description}>
              One of the main goals of statistics is to estimate unknown parameters. 
              To approximate these parameters, we choose an estimator, which is simply 
              any function of randomly sampled observations.
            </p>
            
            <p className={typography.description}>
              To illustrate this idea, we will estimate the value of <span className={cn(typography.value, "inline")}>π</span> by 
              uniformly dropping samples on a square containing an inscribed circle. 
              Notice that the value of <span className={cn(typography.value, "inline")}>π</span> can be expressed as a ratio of areas.
            </p>
            
            <div className="bg-neutral-900 rounded-md p-4 space-y-2">
              <div className={cn(typography.value, "text-lg")}>
                S<sub>circle</sub> = πr²
              </div>
              <div className={cn(typography.value, "text-lg")}>
                S<sub>square</sub> = 4r²
              </div>
              <div className={cn(typography.valueAlt, "text-lg")}>
                ⇒ π = 4 S<sub>circle</sub> / S<sub>square</sub>
              </div>
            </div>
            
            <p className={typography.description}>
              We can estimate this ratio with our samples. Let <span className={cn(typography.value, "inline")}>m</span> be 
              the number of samples within our circle and <span className={cn(typography.value, "inline")}>n</span> the 
              total number of samples dropped. We define our estimator <span className={cn(typography.value, "inline")}>π̂</span> as:
            </p>
            
            <div className="bg-neutral-900 rounded-md p-4">
              <div className={cn(typography.valueAlt, "text-xl text-center")}>
                π̂ = 4m/n
              </div>
            </div>
            
            <p className={typography.description}>
              It can be shown that this estimator has the desirable properties of being 
              <span className="italic text-teal-400"> unbiased</span> and 
              <span className="italic text-teal-400"> consistent</span>.
            </p>
            
            {/* Statistics Display */}
            <StatsDisplay 
              stats={[
                { label: 'm (inside circle)', value: m },
                { label: 'n (total samples)', value: n },
                { label: 'π̂ (estimate)', value: piEstimate, highlight: true },
                { label: 'π (actual)', value: '3.1416', highlight: true }
              ]}
            />
            
            {/* Control Buttons */}
            <ControlGroup>
              <div className="flex flex-wrap gap-3">
                <button
                  className={cn(components.button.base, components.button.primary)}
                  onClick={() => dropDots(100, 10)}
                >
                  Drop 100 Samples
                </button>
                <button
                  className={cn(components.button.base, components.button.primary)}
                  onClick={() => dropDots(1000, 1)}
                >
                  Drop 1000 Samples
                </button>
                <button
                  className={cn(components.button.base, components.button.secondary)}
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </ControlGroup>
          </div>
        </VisualizationSection>
        
        {/* Right: Canvas */}
        <VisualizationSection>
          <GraphContainer height={`${CANVAS_SIZE}px`}>
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="w-full h-full rounded"
              style={{ maxWidth: `${CANVAS_SIZE}px`, maxHeight: `${CANVAS_SIZE}px` }}
              aria-label="Drop samples visualization"
            />
          </GraphContainer>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.chart.primary }}></div>
              <span className={typography.label}>Points inside circle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.chart.secondary }}></div>
              <span className={typography.label}>Points outside circle</span>
            </div>
          </div>
        </VisualizationSection>
      </div>
    </VisualizationContainer>
  );
}

export default PointEstimation;