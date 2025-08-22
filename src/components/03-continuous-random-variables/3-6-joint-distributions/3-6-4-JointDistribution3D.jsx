'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { VisualizationContainer } from '../../ui/VisualizationContainer';
import { useMathJax } from '@/hooks/useMathJax';
import BackToHub from '../../ui/BackToHub';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => <div className="w-full h-96 bg-neutral-800 rounded-lg animate-pulse" />
});

// LaTeX formula component following existing patterns
const LaTeXFormula = React.memo(function LaTeXFormula({ formula, isBlock = false }) {
  const contentRef = useMathJax([formula]);
  
  if (isBlock) {
    return (
      <div ref={contentRef} className="text-center my-2">
        <div dangerouslySetInnerHTML={{ __html: `\\[${formula}\\]` }} />
      </div>
    );
  }
  
  return (
    <span ref={contentRef}>
      <span dangerouslySetInnerHTML={{ __html: `\\(${formula}\\)` }} />
    </span>
  );
});

const JointDistribution3D = () => {
  const [distribution, setDistribution] = useState('bivariate-normal');
  const [correlation, setCorrelation] = useState(0.5);
  const [showIntegrationRegion, setShowIntegrationRegion] = useState(false);
  const [integrationRegion, setIntegrationRegion] = useState('rectangle');
  const [lambda1, setLambda1] = useState(1);
  const [lambda2, setLambda2] = useState(1.5);
  const [selectedRegion, setSelectedRegion] = useState({
    xMin: -1, xMax: 1, yMin: -1, yMax: 1
  });
  
  // Use safe MathJax processing
  const contentRef = useMathJax([distribution, correlation, lambda1, lambda2]);

  // Handle keyboard navigation for region adjustment
  const handleKeyDown = useCallback((e) => {
    if (!showIntegrationRegion) return;
    
    const step = 0.1;
    const { xMin, xMax, yMin, yMax } = selectedRegion;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedRegion(prev => ({ ...prev, yMax: prev.yMax + step, yMin: prev.yMin + step }));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedRegion(prev => ({ ...prev, yMax: prev.yMax - step, yMin: prev.yMin - step }));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedRegion(prev => ({ ...prev, xMax: prev.xMax - step, xMin: prev.xMin - step }));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setSelectedRegion(prev => ({ ...prev, xMax: prev.xMax + step, xMin: prev.xMin + step }));
        break;
    }
  }, [selectedRegion, showIntegrationRegion]);

  useEffect(() => {
    if (showIntegrationRegion) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, showIntegrationRegion]);

  // PDF calculation functions
  const bivariateNormalPDF = (x, y, rho) => {
    const factor = 1 / (2 * Math.PI * Math.sqrt(1 - rho * rho));
    const exponent = -1 / (2 * (1 - rho * rho)) * (x * x - 2 * rho * x * y + y * y);
    return factor * Math.exp(exponent);
  };

  const uniformPDF = (x, y) => {
    if (x >= 0 && x <= 2 && y >= 0 && y <= 2) {
      return 0.25; // 1/(2*2)
    }
    return 0;
  };

  const exponentialPDF = (x, y, lambda1, lambda2) => {
    if (x >= 0 && y >= 0) {
      return lambda1 * lambda2 * Math.exp(-lambda1 * x - lambda2 * y);
    }
    return 0;
  };

  // Get the appropriate PDF based on distribution type
  const getJointPDF = useCallback((x, y) => {
    switch (distribution) {
      case 'bivariate-normal':
        return bivariateNormalPDF(x, y, correlation);
      case 'uniform':
        return uniformPDF(x, y);
      case 'exponential':
        return exponentialPDF(x, y, lambda1, lambda2);
      default:
        return 0;
    }
  }, [distribution, correlation, lambda1, lambda2]);

  // Generate 3D surface data
  const surfaceData = useMemo(() => {
    let xMin, xMax, yMin, yMax;
    let resolution;
    
    // Set bounds and resolution based on distribution
    if (distribution === 'uniform') {
      xMin = -0.5; xMax = 2.5; yMin = -0.5; yMax = 2.5;
      resolution = 50;
    } else if (distribution === 'exponential') {
      xMin = 0; xMax = 4; yMin = 0; yMax = 4;
      resolution = 50;
    } else {
      xMin = -3; xMax = 3; yMin = -3; yMax = 3;
      resolution = 60;
    }
    
    const x = [];
    const y = [];
    const z = [];
    
    // Generate mesh grid
    for (let i = 0; i <= resolution; i++) {
      const xVal = xMin + (xMax - xMin) * i / resolution;
      x.push(xVal);
      
      const zRow = [];
      for (let j = 0; j <= resolution; j++) {
        const yVal = yMin + (yMax - yMin) * j / resolution;
        if (i === 0) y.push(yVal);
        zRow.push(getJointPDF(xVal, yVal));
      }
      z.push(zRow);
    }
    
    return { x, y, z, bounds: { xMin, xMax, yMin, yMax } };
  }, [distribution, correlation, lambda1, lambda2, getJointPDF]);

  // Generate integration region data
  const integrationData = useMemo(() => {
    if (!showIntegrationRegion) return null;
    
    const { xMin, xMax, yMin, yMax } = selectedRegion;
    const resolution = 20;
    
    const x = [];
    const y = [];
    const z = [];
    
    // Generate mesh for integration region
    for (let i = 0; i <= resolution; i++) {
      const xVal = xMin + (xMax - xMin) * i / resolution;
      x.push(xVal);
      
      const zRow = [];
      for (let j = 0; j <= resolution; j++) {
        const yVal = yMin + (yMax - yMin) * j / resolution;
        if (i === 0) y.push(yVal);
        zRow.push(getJointPDF(xVal, yVal));
      }
      z.push(zRow);
    }
    
    return { x, y, z };
  }, [showIntegrationRegion, selectedRegion, getJointPDF]);

  // Calculate integration result
  const integrationResult = useMemo(() => {
    if (!showIntegrationRegion) return null;
    
    const { xMin, xMax, yMin, yMax } = selectedRegion;
    const resolution = 50;
    let sum = 0;
    
    // Numerical integration using Riemann sum
    const dx = (xMax - xMin) / resolution;
    const dy = (yMax - yMin) / resolution;
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = xMin + (i + 0.5) * dx;
        const y = yMin + (j + 0.5) * dy;
        sum += getJointPDF(x, y) * dx * dy;
      }
    }
    
    return sum;
  }, [showIntegrationRegion, selectedRegion, getJointPDF]);

  // Plotly configuration
  const plotData = useMemo(() => {
    const traces = [
      {
        type: 'surface',
        x: surfaceData.x,
        y: surfaceData.y,
        z: surfaceData.z,
        colorscale: 'Viridis',
        opacity: showIntegrationRegion ? 0.7 : 1,
        name: 'Joint PDF',
        hovertemplate: 'X: %{x:.2f}<br>Y: %{y:.2f}<br>PDF: %{z:.4f}<extra></extra>',
        showscale: true,
        colorbar: {
          title: 'PDF Value',
          titleside: 'right',
          thickness: 15,
          len: 0.7
        }
      }
    ];

    // Add integration region surface if enabled
    if (showIntegrationRegion && integrationData) {
      traces.push({
        type: 'surface',
        x: integrationData.x,
        y: integrationData.y,
        z: integrationData.z,
        colorscale: [[0, 'rgba(255,100,100,0.8)'], [1, 'rgba(255,50,50,0.9)']],
        showscale: false,
        name: 'Integration Region',
        hovertemplate: 'X: %{x:.2f}<br>Y: %{y:.2f}<br>PDF: %{z:.4f}<extra>Integration Region</extra>',
      });
    }

    return traces;
  }, [surfaceData, showIntegrationRegion, integrationData]);

  const plotLayout = {
    title: {
      text: `3D Joint ${distribution === 'bivariate-normal' ? 'Bivariate Normal' : 
                       distribution === 'uniform' ? 'Uniform' : 'Exponential'} Distribution`,
      font: { color: '#e5e7eb', size: 16 }
    },
    scene: {
      xaxis: { 
        title: 'X', 
        titlefont: { color: '#e5e7eb' },
        tickfont: { color: '#e5e7eb' },
        gridcolor: '#374151'
      },
      yaxis: { 
        title: 'Y',
        titlefont: { color: '#e5e7eb' },
        tickfont: { color: '#e5e7eb' },
        gridcolor: '#374151'
      },
      zaxis: { 
        title: 'PDF',
        titlefont: { color: '#e5e7eb' },
        tickfont: { color: '#e5e7eb' },
        gridcolor: '#374151'
      },
      bgcolor: '#f3f4f6',
      camera: {
        eye: { x: 1.2, y: 1.2, z: 0.6 }
      }
    },
    paper_bgcolor: '#f3f4f6',
    plot_bgcolor: '#f3f4f6',
    font: { color: '#e5e7eb' },
    margin: { l: 0, r: 0, t: 40, b: 0 },
    height: 600
  };

  const plotConfig = {
    displayModeBar: true,
    modeBarButtonsToRemove: ['pan2d', 'select2d', 'lasso2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: 'joint_distribution_3d',
      height: 600,
      width: 800,
      scale: 1
    }
  };

  return (
    <div className="space-y-4" ref={contentRef}>
      <VisualizationContainer
        title="3D Joint Probability Distributions"
        description="Explore joint probability distributions in three dimensions with interactive integration regions"
      >
        <BackToHub />
        
        <div className="space-y-6">
          {/* Distribution Controls */}
          <Card className="p-4 bg-neutral-900 border-neutral-700">
            <div className="space-y-4">
              {/* Distribution selector */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => setDistribution('bivariate-normal')}
                  variant={distribution === 'bivariate-normal' ? "default" : "outline"}
                  size="sm"
                >
                  Bivariate Normal
                </Button>
                <Button
                  onClick={() => setDistribution('uniform')}
                  variant={distribution === 'uniform' ? "default" : "outline"}
                  size="sm"
                >
                  Uniform
                </Button>
                <Button
                  onClick={() => setDistribution('exponential')}
                  variant={distribution === 'exponential' ? "default" : "outline"}
                  size="sm"
                >
                  Exponential
                </Button>
              </div>
              
              {/* Distribution-specific parameters */}
              <div className="flex flex-wrap gap-4 justify-center">
                {distribution === 'bivariate-normal' && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Correlation (ρ):</label>
                    <input
                      type="range"
                      min="-0.9"
                      max="0.9"
                      step="0.1"
                      value={correlation}
                      onChange={(e) => setCorrelation(parseFloat(e.target.value))}
                      className="w-32"
                    />
                    <span className="text-sm font-mono w-12">{correlation.toFixed(1)}</span>
                  </div>
                )}
                
                {distribution === 'exponential' && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">λ₁:</label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={lambda1}
                        onChange={(e) => setLambda1(parseFloat(e.target.value))}
                        className="w-32"
                      />
                      <span className="text-sm font-mono w-12">{lambda1.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">λ₂:</label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={lambda2}
                        onChange={(e) => setLambda2(parseFloat(e.target.value))}
                        className="w-32"
                      />
                      <span className="text-sm font-mono w-12">{lambda2.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Integration Controls */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => setShowIntegrationRegion(!showIntegrationRegion)}
                  variant={showIntegrationRegion ? "default" : "outline"}
                  size="sm"
                >
                  {showIntegrationRegion ? "Hide" : "Show"} Integration Region
                </Button>
              </div>

              {/* Region adjustment controls */}
              {showIntegrationRegion && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div>
                      <label className="block text-sm font-medium mb-1">X Range</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={selectedRegion.xMin}
                          onChange={(e) => setSelectedRegion(prev => ({ ...prev, xMin: parseFloat(e.target.value) }))}
                          className="w-20 px-2 py-1 text-sm bg-neutral-800 border border-neutral-600 rounded"
                          placeholder="min"
                        />
                        <input
                          type="number"
                          step="0.1"
                          value={selectedRegion.xMax}
                          onChange={(e) => setSelectedRegion(prev => ({ ...prev, xMax: parseFloat(e.target.value) }))}
                          className="w-20 px-2 py-1 text-sm bg-neutral-800 border border-neutral-600 rounded"
                          placeholder="max"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Y Range</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={selectedRegion.yMin}
                          onChange={(e) => setSelectedRegion(prev => ({ ...prev, yMin: parseFloat(e.target.value) }))}
                          className="w-20 px-2 py-1 text-sm bg-neutral-800 border border-neutral-600 rounded"
                          placeholder="min"
                        />
                        <input
                          type="number"
                          step="0.1"
                          value={selectedRegion.yMax}
                          onChange={(e) => setSelectedRegion(prev => ({ ...prev, yMax: parseFloat(e.target.value) }))}
                          className="w-20 px-2 py-1 text-sm bg-neutral-800 border border-neutral-600 rounded"
                          placeholder="max"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {integrationResult !== null && (
                    <div className="text-center p-3 bg-neutral-800 rounded-lg">
                      <div className="text-sm font-medium">Integration Result:</div>
                      <div className="text-lg font-mono text-blue-400">
                        P({selectedRegion.xMin.toFixed(1)} ≤ X ≤ {selectedRegion.xMax.toFixed(1)}, {selectedRegion.yMin.toFixed(1)} ≤ Y ≤ {selectedRegion.yMax.toFixed(1)}) ≈ {integrationResult.toFixed(4)}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center text-xs text-neutral-500">
                    Use arrow keys to move the integration region
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 3D Visualization */}
          <div className="bg-neutral-900 rounded-lg p-4">
            <Plot
              data={plotData}
              layout={plotLayout}
              config={plotConfig}
              style={{ width: '100%', height: '600px' }}
            />
          </div>

          {/* Mathematical formulas */}
          <Card className="p-4 bg-neutral-900 border-neutral-700">
            <h4 className="text-sm font-semibold mb-2">
              {distribution === 'bivariate-normal' && 'Bivariate Normal Distribution'}
              {distribution === 'uniform' && 'Joint Uniform Distribution'}
              {distribution === 'exponential' && 'Joint Exponential Distribution'}
            </h4>
            
            {distribution === 'bivariate-normal' && (
              <>
                <LaTeXFormula 
                  formula={`f_{X,Y}(x,y) = \\frac{1}{2\\pi\\sqrt{1-\\rho^2}} \\exp\\left(-\\frac{1}{2(1-\\rho^2)}[x^2 - 2\\rho xy + y^2]\\right)`}
                  isBlock={true}
                />
                <div className="mt-2 text-sm text-neutral-400">
                  Standard bivariate normal with correlation ρ = {correlation.toFixed(1)}
                </div>
              </>
            )}
            
            {distribution === 'uniform' && (
              <>
                <LaTeXFormula 
                  formula={`f_{X,Y}(x,y) = \\begin{cases} \\frac{1}{4} & \\text{if } 0 \\leq x \\leq 2, 0 \\leq y \\leq 2 \\\\ 0 & \\text{otherwise} \\end{cases}`}
                  isBlock={true}
                />
                <div className="mt-2 text-sm text-neutral-400">
                  Independent uniform random variables on [0,2] × [0,2]
                </div>
              </>
            )}
            
            {distribution === 'exponential' && (
              <>
                <LaTeXFormula 
                  formula={`f_{X,Y}(x,y) = \\lambda_1 \\lambda_2 e^{-\\lambda_1 x - \\lambda_2 y}, \\quad x \\geq 0, y \\geq 0`}
                  isBlock={true}
                />
                <div className="mt-2 text-sm text-neutral-400">
                  Independent exponential with λ₁ = {lambda1.toFixed(1)} and λ₂ = {lambda2.toFixed(1)}
                </div>
              </>
            )}

            {showIntegrationRegion && (
              <div className="mt-4 pt-3 border-t border-neutral-700">
                <h5 className="text-sm font-semibold mb-2">Double Integration</h5>
                <LaTeXFormula 
                  formula={`P(${selectedRegion.xMin.toFixed(1)} \\leq X \\leq ${selectedRegion.xMax.toFixed(1)}, ${selectedRegion.yMin.toFixed(1)} \\leq Y \\leq ${selectedRegion.yMax.toFixed(1)}) = \\int_{${selectedRegion.yMin.toFixed(1)}}^{${selectedRegion.yMax.toFixed(1)}} \\int_{${selectedRegion.xMin.toFixed(1)}}^{${selectedRegion.xMax.toFixed(1)}} f_{X,Y}(x,y) \\, dx \\, dy`}
                  isBlock={true}
                />
              </div>
            )}
          </Card>

          {/* Educational Notes */}
          <Card className="p-4 bg-neutral-900 border-neutral-700">
            <h4 className="text-sm font-semibold mb-2">Understanding 3D Joint Distributions</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-blue-400">Surface Height:</span> The height at any point (x,y) represents the joint probability density f(x,y)
              </div>
              <div>
                <span className="text-green-400">Volume Under Surface:</span> The total volume under the entire surface equals 1
              </div>
              <div>
                <span className="text-purple-400">Integration Region:</span> The volume under the surface within the red region gives P(a ≤ X ≤ b, c ≤ Y ≤ d)
              </div>
              <div>
                <span className="text-yellow-400">Interactive Features:</span> Rotate, zoom, and hover over the surface to explore the distribution
              </div>
            </div>
          </Card>
        </div>
      </VisualizationContainer>
    </div>
  );
};

export default JointDistribution3D;