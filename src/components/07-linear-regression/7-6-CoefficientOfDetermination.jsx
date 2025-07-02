'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from '@/utils/d3-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { VisualizationContainer, VisualizationSection, GraphContainer, ControlGroup } from '../ui/VisualizationContainer';
import BackToHub from '../ui/BackToHub';
import { colors as designColors, createColorScheme } from '../../lib/design-system';

// Get Chapter 7 color scheme - using hypothesis testing colors for regression
const chapterColors = createColorScheme('hypothesis');

// Reuse the fuel data from section 7.1
const fuelData = [
  { x: 0.99, y: 90.01 },
  { x: 1.02, y: 89.05 },
  { x: 1.15, y: 91.43 },
  { x: 1.29, y: 93.74 },
  { x: 1.46, y: 96.73 },
  { x: 1.36, y: 94.45 },
  { x: 0.87, y: 87.59 },
  { x: 1.23, y: 91.77 },
  { x: 1.55, y: 99.42 },
  { x: 1.40, y: 93.65 },
  { x: 1.19, y: 93.54 },
  { x: 1.15, y: 92.52 },
  { x: 0.98, y: 90.56 },
  { x: 1.01, y: 89.54 },
  { x: 1.11, y: 89.85 },
  { x: 1.20, y: 90.39 },
  { x: 1.26, y: 93.25 },
  { x: 1.32, y: 93.41 },
  { x: 1.43, y: 94.98 },
  { x: 0.95, y: 87.33 }
];

// Calculate regression statistics
const calculateRegressionStats = (data) => {
  const n = data.length;
  const sumX = data.reduce((sum, d) => sum + d.x, 0);
  const sumY = data.reduce((sum, d) => sum + d.y, 0);
  const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
  const sumX2 = data.reduce((sum, d) => sum + d.x * d.x, 0);
  const sumY2 = data.reduce((sum, d) => sum + d.y * d.y, 0);
  
  const meanX = sumX / n;
  const meanY = sumY / n;
  
  // Calculate slope and intercept
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate SST, SSR, SSE
  const sst = data.reduce((sum, d) => sum + Math.pow(d.y - meanY, 2), 0);
  
  const predictions = data.map(d => ({ 
    x: d.x, 
    y: d.y, 
    yPred: slope * d.x + intercept 
  }));
  
  const ssr = predictions.reduce((sum, d) => sum + Math.pow(d.yPred - meanY, 2), 0);
  const sse = predictions.reduce((sum, d) => sum + Math.pow(d.y - d.yPred, 2), 0);
  
  // Calculate correlation coefficient
  const r = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  // Calculate R²
  const rSquared = Math.pow(r, 2);
  
  return {
    n,
    meanX,
    meanY,
    slope,
    intercept,
    sst,
    ssr,
    sse,
    r,
    rSquared,
    predictions
  };
};

// Introduction section with core question
const RSquaredIntroduction = React.memo(function RSquaredIntroduction() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <VisualizationSection>
      <div ref={contentRef} className="prose prose-sm max-w-4xl mx-auto text-neutral-300">
        <p className="font-medium mb-4">
          After fitting a regression line, a natural question arises: <em>How well does our model explain the data?</em>
        </p>
        
        <p className="mb-4">
          The <strong>coefficient of determination</strong>, denoted as <span dangerouslySetInnerHTML={{ __html: `\\(R^2\\)` }} />, 
          measures the proportion of variation in the response variable that is explained by the regression model.
        </p>
        
        <div className="bg-neutral-900/50 border-l-4 border-teal-500 p-4 my-4 rounded">
          <p className="font-medium">Key Insight:</p>
          <p>
            <span dangerouslySetInnerHTML={{ __html: `\\(R^2\\)` }} /> tells us what percentage of the total variability 
            in <span dangerouslySetInnerHTML={{ __html: `\\(Y\\)` }} /> is accounted for by its linear relationship 
            with <span dangerouslySetInnerHTML={{ __html: `\\(X\\)` }} />.
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Mathematical framework with key formulas
const MathematicalFramework = React.memo(function MathematicalFramework() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <VisualizationSection>
      <h3 className="text-lg font-semibold mb-4">Mathematical Framework</h3>
      <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: R² as explained/total */}
        <div className="bg-neutral-900/50 rounded-lg border border-neutral-700 p-4">
          <h4 className="font-medium text-teal-400 mb-2">Definition 1: Explained Variation</h4>
          <div className="text-center my-3">
            <div dangerouslySetInnerHTML={{ __html: `\\[R^2 = \\frac{\\text{SSR}}{\\text{SST}} = \\frac{\\text{Explained Variation}}{\\text{Total Variation}}\\]` }} />
          </div>
          <p className="text-sm text-neutral-400">
            The ratio of variation explained by the regression line to the total variation in the data.
          </p>
        </div>
        
        {/* Card 2: R² as complement */}
        <div className="bg-neutral-900/50 rounded-lg border border-neutral-700 p-4">
          <h4 className="font-medium text-teal-400 mb-2">Definition 2: Complement Form</h4>
          <div className="text-center my-3">
            <div dangerouslySetInnerHTML={{ __html: `\\[R^2 = 1 - \\frac{\\text{SSE}}{\\text{SST}} = 1 - \\frac{\\text{Unexplained Variation}}{\\text{Total Variation}}\\]` }} />
          </div>
          <p className="text-sm text-neutral-400">
            One minus the proportion of unexplained variation.
          </p>
        </div>
        
        {/* Card 3: R² = r² */}
        <div className="bg-neutral-900/50 rounded-lg border border-neutral-700 p-4">
          <h4 className="font-medium text-teal-400 mb-2">Definition 3: Correlation Squared</h4>
          <div className="text-center my-3">
            <div dangerouslySetInnerHTML={{ __html: `\\[R^2 = r^2\\]` }} />
          </div>
          <p className="text-sm text-neutral-400">
            For simple linear regression, <span dangerouslySetInnerHTML={{ __html: `\\(R^2\\)` }} /> equals 
            the square of the correlation coefficient.
          </p>
        </div>
        
        {/* Card 4: Interpretation */}
        <div className="bg-neutral-900/50 rounded-lg border border-neutral-700 p-4">
          <h4 className="font-medium text-teal-400 mb-2">Interpretation</h4>
          <div className="text-center my-3">
            <div dangerouslySetInnerHTML={{ __html: `\\[0 \\leq R^2 \\leq 1\\]` }} />
          </div>
          <ul className="text-sm text-neutral-400 space-y-1">
            <li>• <span dangerouslySetInnerHTML={{ __html: `\\(R^2 = 0\\)` }} />: No linear relationship</li>
            <li>• <span dangerouslySetInnerHTML={{ __html: `\\(R^2 = 1\\)` }} />: Perfect linear relationship</li>
            <li>• Higher values indicate better fit</li>
          </ul>
        </div>
      </div>
    </VisualizationSection>
  );
});

// Main R² visualization component
const RSquaredVisualization = ({ stats }) => {
  const [displayType, setDisplayType] = useState('pie');
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const containerRef = useRef(null);
  const colors = chapterColors;
  
  useEffect(() => {
    // Animate on mount
    const timer = setTimeout(() => {
      setAnimationProgress(1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  const rSquaredPercent = (stats.rSquared * 100).toFixed(1);
  const unexplainedPercent = ((1 - stats.rSquared) * 100).toFixed(1);
  
  // Pie chart visualization
  const PieChartViz = () => {
    useEffect(() => {
      if (!containerRef.current) return;
      
      const width = 300;
      const height = 300;
      const radius = Math.min(width, height) / 2 - 20;
      
      d3.select(containerRef.current).selectAll("*").remove();
      
      const svg = d3.select(containerRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
      
      const g = svg.append("g")
        .attr("transform", `translate(${width/2}, ${height/2})`);
      
      const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
      
      const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);
      
      const data = [
        { label: "Explained", value: stats.rSquared * animationProgress, color: colors.chart.primary },
        { label: "Unexplained", value: (1 - stats.rSquared) * animationProgress, color: '#6b7280' }
      ];
      
      // If animation hasn't started, show full gray circle
      if (animationProgress === 0) {
        data[1].value = 1;
      }
      
      const arcs = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");
      
      arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => d.data.color)
        .attr("stroke", "white")
        .attr("stroke-width", 2);
      
      // Add percentage labels
      if (animationProgress > 0) {
        arcs.append("text")
          .attr("transform", d => `translate(${arc.centroid(d)})`)
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .attr("font-weight", "bold")
          .attr("font-size", "18px")
          .text(d => {
            const percent = (d.data.value * 100).toFixed(1);
            return percent > 5 ? `${percent}%` : '';
          });
      }
      
      // Add center label
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "-0.5em")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .attr("fill", colors.chart.primary)
        .text("R²");
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.5em")
        .attr("font-size", "20px")
        .attr("fill", colors.chart.primary)
        .text(`${rSquaredPercent}%`);
      
    }, [animationProgress]);
    
    return <div ref={containerRef} className="flex justify-center" />;
  };
  
  // Bar chart visualization
  const BarChartViz = () => {
    useEffect(() => {
      if (!containerRef.current) return;
      
      const width = 400;
      const height = 200;
      const margin = { top: 20, right: 20, bottom: 40, left: 60 };
      
      d3.select(containerRef.current).selectAll("*").remove();
      
      const svg = d3.select(containerRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      // Create stacked bar
      const data = [
        { type: "Explained", value: stats.rSquared * animationProgress },
        { type: "Unexplained", value: (1 - stats.rSquared) * animationProgress }
      ];
      
      const stack = d3.stack()
        .keys(["value"])
        .value((d, key) => d[key]);
      
      const xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, innerWidth]);
      
      // Draw bars
      g.append("rect")
        .attr("x", 0)
        .attr("y", innerHeight / 3)
        .attr("width", xScale(stats.rSquared * animationProgress))
        .attr("height", innerHeight / 3)
        .attr("fill", colors.chart.primary);
      
      g.append("rect")
        .attr("x", xScale(stats.rSquared * animationProgress))
        .attr("y", innerHeight / 3)
        .attr("width", xScale((1 - stats.rSquared) * animationProgress))
        .attr("height", innerHeight / 3)
        .attr("fill", '#6b7280');
      
      // Add axis
      const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => `${(d * 100).toFixed(0)}%`);
      
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis);
      
      // Add labels
      if (animationProgress > 0) {
        g.append("text")
          .attr("x", xScale(stats.rSquared / 2))
          .attr("y", innerHeight / 2)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .attr("font-weight", "bold")
          .text(`${rSquaredPercent}%`);
        
        if (1 - stats.rSquared > 0.1) {
          g.append("text")
            .attr("x", xScale(stats.rSquared + (1 - stats.rSquared) / 2))
            .attr("y", innerHeight / 2)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .attr("font-weight", "bold")
            .text(`${unexplainedPercent}%`);
        }
      }
      
    }, [animationProgress]);
    
    return <div ref={containerRef} className="flex justify-center" />;
  };
  
  // Area chart visualization
  const AreaChartViz = () => {
    useEffect(() => {
      if (!containerRef.current) return;
      
      const width = 400;
      const height = 300;
      const margin = { top: 20, right: 20, bottom: 40, left: 60 };
      
      d3.select(containerRef.current).selectAll("*").remove();
      
      const svg = d3.select(containerRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
      
      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      // Create scales
      const xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, innerWidth]);
      
      const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);
      
      // Create area generator
      const area = d3.area()
        .x(d => xScale(d.x))
        .y0(innerHeight)
        .y1(d => yScale(d.y))
        .curve(d3.curveMonotoneX);
      
      // Generate data for smooth transition
      const explainedData = d3.range(0, 101).map(x => ({
        x,
        y: x <= rSquaredPercent * animationProgress ? stats.rSquared : 0
      }));
      
      const totalData = d3.range(0, 101).map(x => ({
        x,
        y: 1
      }));
      
      // Draw total area (gray)
      g.append("path")
        .datum(totalData)
        .attr("fill", '#6b7280')
        .attr("opacity", 0.3)
        .attr("d", area);
      
      // Draw explained area (blue)
      g.append("path")
        .datum(explainedData)
        .attr("fill", colors.chart.primary)
        .attr("opacity", 0.8)
        .attr("d", area);
      
      // Add axes
      const xAxis = d3.axisBottom(xScale)
        .tickValues([0, parseFloat(rSquaredPercent), 100])
        .tickFormat(d => `${d}%`);
      
      const yAxis = d3.axisLeft(yScale)
        .tickValues([0, stats.rSquared, 1])
        .tickFormat(d => d.toFixed(2));
      
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis);
      
      g.append("g")
        .call(yAxis);
      
      // Add R² line
      if (animationProgress > 0) {
        g.append("line")
          .attr("x1", 0)
          .attr("x2", innerWidth)
          .attr("y1", yScale(stats.rSquared))
          .attr("y2", yScale(stats.rSquared))
          .attr("stroke", colors.primary)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5");
        
        g.append("text")
          .attr("x", innerWidth / 2)
          .attr("y", yScale(stats.rSquared) - 10)
          .attr("text-anchor", "middle")
          .attr("fill", colors.primary)
          .attr("font-weight", "bold")
          .text(`R² = ${stats.rSquared.toFixed(3)}`);
      }
      
    }, [animationProgress]);
    
    return <div ref={containerRef} className="flex justify-center" />;
  };
  
  return (
    <VisualizationSection>
      <h3 className="text-lg font-semibold mb-4">Visualizing R²</h3>
      
      <ControlGroup>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setDisplayType('pie')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              displayType === 'pie' 
                ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                : 'bg-neutral-700 hover:bg-neutral-600 text-white'
            }`}
          >
            Pie Chart
          </button>
          <button
            onClick={() => setDisplayType('bar')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              displayType === 'bar' 
                ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                : 'bg-neutral-700 hover:bg-neutral-600 text-white'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setDisplayType('area')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              displayType === 'area' 
                ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                : 'bg-neutral-700 hover:bg-neutral-600 text-white'
            }`}
          >
            Area Chart
          </button>
        </div>
      </ControlGroup>
      
      <GraphContainer>
        <AnimatePresence mode="wait">
          <motion.div
            key={displayType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {displayType === 'pie' && <PieChartViz />}
            {displayType === 'bar' && <BarChartViz />}
            {displayType === 'area' && <AreaChartViz />}
          </motion.div>
        </AnimatePresence>
      </GraphContainer>
      
      <div className="mt-4 p-4 bg-neutral-900/50 border border-neutral-700 rounded-lg">
        <p className="text-sm text-neutral-300">
          <strong>{rSquaredPercent}%</strong> of the variation in fuel quality (octane rating) 
          is explained by the linear relationship with specific gravity.
        </p>
        <p className="text-sm mt-2 text-neutral-300">
          <strong>{unexplainedPercent}%</strong> of the variation remains unexplained by our linear model.
        </p>
      </div>
    </VisualizationSection>
  );
};

// Worked example showing three calculation methods
const WorkedExample = React.memo(function WorkedExample({ stats }) {
  const contentRef = useRef(null);
  const [showMethod, setShowMethod] = useState(1);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, [showMethod]);
  
  return (
    <VisualizationSection>
      <h3 className="text-lg font-semibold mb-4">Calculating R²: Three Equivalent Methods</h3>
      
      <ControlGroup>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowMethod(1)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showMethod === 1 
                ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                : 'bg-neutral-700 hover:bg-neutral-600 text-white'
            }`}
          >
            Method 1: SSR/SST
          </button>
          <button
            onClick={() => setShowMethod(2)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showMethod === 2 
                ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                : 'bg-neutral-700 hover:bg-neutral-600 text-white'
            }`}
          >
            Method 2: 1 - SSE/SST
          </button>
          <button
            onClick={() => setShowMethod(3)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showMethod === 3 
                ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                : 'bg-neutral-700 hover:bg-neutral-600 text-white'
            }`}
          >
            Method 3: r²
          </button>
        </div>
      </ControlGroup>
      
      <div ref={contentRef} className="mt-4 bg-neutral-900/50 rounded-lg border border-neutral-700 p-6">
        {showMethod === 1 && (
          <div>
            <h4 className="font-medium text-teal-400 mb-3">Method 1: Explained Variation / Total Variation</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-400 mb-1">Step 1: Calculate SSR (Sum of Squares Regression)</p>
                <div className="bg-neutral-800 p-3 rounded font-mono text-sm">
                  <div dangerouslySetInnerHTML={{ __html: `\\[\\text{SSR} = \\sum(\\hat{y}_i - \\bar{y})^2 = ${stats.ssr.toFixed(2)}\\]` }} />
                </div>
              </div>
              
              <div>
                <p className="text-sm text-neutral-400 mb-1">Step 2: Calculate SST (Sum of Squares Total)</p>
                <div className="bg-neutral-800 p-3 rounded font-mono text-sm">
                  <div dangerouslySetInnerHTML={{ __html: `\\[\\text{SST} = \\sum(y_i - \\bar{y})^2 = ${stats.sst.toFixed(2)}\\]` }} />
                </div>
              </div>
              
              <div>
                <p className="text-sm text-neutral-400 mb-1">Step 3: Calculate R²</p>
                <div className="bg-neutral-800 p-3 rounded font-mono text-sm">
                  <div dangerouslySetInnerHTML={{ __html: `\\[R^2 = \\frac{\\text{SSR}}{\\text{SST}} = \\frac{${stats.ssr.toFixed(2)}}{${stats.sst.toFixed(2)}} = ${stats.rSquared.toFixed(3)}\\]` }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showMethod === 2 && (
          <div>
            <h4 className="font-medium text-teal-400 mb-3">Method 2: 1 - (Unexplained Variation / Total Variation)</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-400 mb-1">Step 1: Calculate SSE (Sum of Squares Error)</p>
                <div className="bg-neutral-800 p-3 rounded font-mono text-sm">
                  <div dangerouslySetInnerHTML={{ __html: `\\[\\text{SSE} = \\sum(y_i - \\hat{y}_i)^2 = ${stats.sse.toFixed(2)}\\]` }} />
                </div>
              </div>
              
              <div>
                <p className="text-sm text-neutral-400 mb-1">Step 2: We already have SST</p>
                <div className="bg-neutral-800 p-3 rounded font-mono text-sm">
                  <div dangerouslySetInnerHTML={{ __html: `\\[\\text{SST} = ${stats.sst.toFixed(2)}\\]` }} />
                </div>
              </div>
              
              <div>
                <p className="text-sm text-neutral-400 mb-1">Step 3: Calculate R²</p>
                <div className="bg-neutral-800 p-3 rounded font-mono text-sm">
                  <div dangerouslySetInnerHTML={{ __html: `\\[R^2 = 1 - \\frac{\\text{SSE}}{\\text{SST}} = 1 - \\frac{${stats.sse.toFixed(2)}}{${stats.sst.toFixed(2)}} = ${stats.rSquared.toFixed(3)}\\]` }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {showMethod === 3 && (
          <div>
            <h4 className="font-medium text-teal-400 mb-3">Method 3: Square of Correlation Coefficient</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-400 mb-1">Step 1: We have the correlation coefficient</p>
                <div className="bg-neutral-800 p-3 rounded font-mono text-sm">
                  <div dangerouslySetInnerHTML={{ __html: `\\[r = ${stats.r.toFixed(4)}\\]` }} />
                </div>
              </div>
              
              <div>
                <p className="text-sm text-neutral-400 mb-1">Step 2: Square the correlation coefficient</p>
                <div className="bg-neutral-800 p-3 rounded font-mono text-sm">
                  <div dangerouslySetInnerHTML={{ __html: `\\[R^2 = r^2 = (${stats.r.toFixed(4)})^2 = ${stats.rSquared.toFixed(3)}\\]` }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded">
          <p className="text-sm text-green-400">
            <strong>All three methods give the same result:</strong> R² = {stats.rSquared.toFixed(3)} = {(stats.rSquared * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </VisualizationSection>
  );
});

// R² vs Correlation comparison
const RSquaredVsCorrelation = React.memo(function RSquaredVsCorrelation({ stats }) {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <VisualizationSection>
      <h3 className="text-lg font-semibold mb-4">R² vs Correlation Coefficient</h3>
      
      <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-900/50 rounded-lg border border-neutral-700 p-4">
          <h4 className="font-medium text-teal-400 mb-3">Key Relationship</h4>
          <div className="text-center my-4">
            <div dangerouslySetInnerHTML={{ __html: `\\[R^2 = r^2\\]` }} />
          </div>
          <p className="text-sm text-neutral-400">
            For simple linear regression, R² equals the square of the correlation coefficient.
          </p>
        </div>
        
        <div className="bg-neutral-900/50 rounded-lg border border-neutral-700 p-4">
          <h4 className="font-medium text-teal-400 mb-3">Our Data</h4>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span>r =</span>
              <span>{stats.r.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>r² =</span>
              <span>{stats.rSquared.toFixed(4)}</span>
            </div>
            <div className="flex justify-between font-bold text-teal-400">
              <span>R² =</span>
              <span>{stats.rSquared.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
        <h4 className="font-medium text-yellow-400 mb-2">Important Distinction</h4>
        <ul className="text-sm text-yellow-300 space-y-1">
          <li>• <strong>r</strong> has a sign (+ or -) indicating direction of relationship</li>
          <li>• <strong>R²</strong> is always positive (0 to 1) and indicates strength only</li>
          <li>• <strong>R²</strong> directly tells us the percentage of variation explained</li>
        </ul>
      </div>
    </VisualizationSection>
  );
});

// Model comparison visualization
const ModelComparison = () => {
  const [selectedModel, setSelectedModel] = useState('good');
  const containerRef = useRef(null);
  const colors = createColorScheme('regression');
  
  const models = {
    poor: { rSquared: 0.15, label: "Poor Fit", description: "R² < 0.3" },
    moderate: { rSquared: 0.55, label: "Moderate Fit", description: "0.3 < R² < 0.7" },
    good: { rSquared: 0.877, label: "Good Fit", description: "R² > 0.7" }
  };
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const width = 400;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    
    d3.select(containerRef.current).selectAll("*").remove();
    
    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 15])
      .range([innerHeight, 0]);
    
    // Background gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "r-squared-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ef4444");
    
    gradient.append("stop")
      .attr("offset", "30%")
      .attr("stop-color", "#f59e0b");
    
    gradient.append("stop")
      .attr("offset", "70%")
      .attr("stop-color", "#3b82f6");
    
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#10b981");
    
    // Draw gradient bar
    g.append("rect")
      .attr("x", 0)
      .attr("y", innerHeight - 30)
      .attr("width", innerWidth)
      .attr("height", 20)
      .attr("fill", "url(#r-squared-gradient)")
      .attr("rx", 10);
    
    // Add model markers
    Object.entries(models).forEach(([key, model]) => {
      const x = xScale(model.rSquared);
      
      // Marker line
      g.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", innerHeight - 40)
        .attr("y2", innerHeight - 10)
        .attr("stroke", key === selectedModel ? "#1f2937" : "#9ca3af")
        .attr("stroke-width", key === selectedModel ? 3 : 2)
        .style("cursor", "pointer")
        .on("click", () => setSelectedModel(key));
      
      // Label
      g.append("text")
        .attr("x", x)
        .attr("y", innerHeight - 45)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", key === selectedModel ? "bold" : "normal")
        .attr("fill", key === selectedModel ? "#1f2937" : "#6b7280")
        .style("cursor", "pointer")
        .text(`R² = ${model.rSquared}`)
        .on("click", () => setSelectedModel(key));
    });
    
    // Add axis
    const xAxis = d3.axisBottom(xScale)
      .tickValues([0, 0.3, 0.7, 1])
      .tickFormat(d => d.toFixed(1));
    
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis);
    
    // Add labels
    g.append("text")
      .attr("x", xScale(0.15))
      .attr("y", innerHeight + 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("fill", "#6b7280")
      .text("Poor");
    
    g.append("text")
      .attr("x", xScale(0.5))
      .attr("y", innerHeight + 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("fill", "#6b7280")
      .text("Moderate");
    
    g.append("text")
      .attr("x", xScale(0.85))
      .attr("y", innerHeight + 35)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("fill", "#6b7280")
      .text("Good");
    
  }, [selectedModel]);
  
  return (
    <VisualizationSection>
      <h3 className="text-lg font-semibold mb-4">Interpreting R² Values</h3>
      
      <GraphContainer>
        <div ref={containerRef} className="flex justify-center" />
      </GraphContainer>
      
      <div className="mt-4 p-4 bg-neutral-900/50 rounded-lg border border-neutral-700">
        <h4 className="font-medium text-teal-400 mb-2">
          {models[selectedModel].label}: {models[selectedModel].description}
        </h4>
        
        {selectedModel === 'poor' && (
          <div className="text-sm text-neutral-300 space-y-2">
            <p>• The model explains very little of the variation in Y</p>
            <p>• Linear relationship is weak or non-existent</p>
            <p>• Consider alternative models or additional variables</p>
          </div>
        )}
        
        {selectedModel === 'moderate' && (
          <div className="text-sm text-neutral-300 space-y-2">
            <p>• The model explains a moderate amount of variation</p>
            <p>• Common in social sciences and complex systems</p>
            <p>• May be acceptable depending on context</p>
          </div>
        )}
        
        {selectedModel === 'good' && (
          <div className="text-sm text-neutral-300 space-y-2">
            <p>• The model explains most of the variation in Y</p>
            <p>• Strong linear relationship exists</p>
            <p>• Our fuel data example falls in this range</p>
          </div>
        )}
      </div>
    </VisualizationSection>
  );
};

// Interpretation guide
const InterpretationGuide = React.memo(function InterpretationGuide() {
  const contentRef = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, []);
  
  return (
    <VisualizationSection>
      <h3 className="text-lg font-semibold mb-4">Understanding R² in Context</h3>
      
      <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-900/20 rounded-lg border border-green-500/30 p-4">
          <h4 className="font-medium text-green-400 mb-2">What R² Tells Us</h4>
          <ul className="text-sm text-green-300 space-y-1">
            <li>✓ Proportion of variance explained</li>
            <li>✓ Goodness of fit for the linear model</li>
            <li>✓ Strength of linear relationship</li>
            <li>✓ Predictive power within data range</li>
          </ul>
        </div>
        
        <div className="bg-red-900/20 rounded-lg border border-red-500/30 p-4">
          <h4 className="font-medium text-red-400 mb-2">What R² Doesn't Tell Us</h4>
          <ul className="text-sm text-red-300 space-y-1">
            <li>✗ Whether the relationship is causal</li>
            <li>✗ If the model is appropriate</li>
            <li>✗ Quality of predictions outside data range</li>
            <li>✗ Presence of outliers or influential points</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-4 bg-blue-900/20 rounded-lg border border-blue-500/30 p-4">
        <h4 className="font-medium text-blue-400 mb-2">Context Matters</h4>
        <div className="text-sm text-blue-300 space-y-2">
          <p>
            <strong>Physical Sciences:</strong> Often expect R² &gt; 0.9 due to controlled conditions
          </p>
          <p>
            <strong>Social Sciences:</strong> R² of 0.3-0.5 may be considered good due to human variability
          </p>
          <p>
            <strong>Financial Markets:</strong> Even R² &lt; 0.1 can be valuable for predictions
          </p>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
        <h4 className="font-medium text-yellow-400 mb-2">Important Reminder</h4>
        <p className="text-sm text-yellow-300">
          A high R² doesn't guarantee a good model. Always check residual plots, 
          consider the context, and validate assumptions before drawing conclusions.
        </p>
      </div>
    </VisualizationSection>
  );
});

// Main component
export default function CoefficientOfDetermination() {
  const stats = useMemo(() => calculateRegressionStats(fuelData), []);
  
  return (
    <VisualizationContainer
      title="7.6 Coefficient of Determination (R²)"
      introduction="The coefficient of determination measures how well our regression model explains the variation in the data."
    >
      <BackToHub chapter="7" />
      
      <RSquaredIntroduction />
      <MathematicalFramework />
      <RSquaredVisualization stats={stats} />
      <WorkedExample stats={stats} />
      <RSquaredVsCorrelation stats={stats} />
      <ModelComparison />
      <InterpretationGuide />
    </VisualizationContainer>
  );
}