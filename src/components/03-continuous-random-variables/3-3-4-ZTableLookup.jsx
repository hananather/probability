"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSafeMathJax } from '../../utils/mathJaxFix';
import * as d3 from "d3";
import { createColorScheme, typography } from "../../lib/design-system";
import { 
  ArrowRight, Search, Calculator, BarChart3, BookOpen, 
  Info, TrendingUp, Target, Award, ChevronLeft, ChevronRight,
  Lightbulb, CheckCircle, AlertCircle
} from "lucide-react";
import * as jStat from "jstat";
import { cn } from "../../lib/utils";
import { 
  VisualizationContainer, 
  VisualizationSection
} from "../ui/VisualizationContainer";
import { RangeSlider } from "../ui/RangeSlider";
import { Button } from "../ui/button";
import { ProgressBar, ProgressNavigation } from "../ui/ProgressBar";
import { Tutorial } from "../ui/Tutorial";

const ZTableLookup = () => {
  const colors = createColorScheme('inference');
  const svgRef = useRef(null);
  const contentRef = useRef(null);
  
  // Core state
  const [zValue, setZValue] = useState(1.96);
  const [probability, setProbability] = useState(0.975);
  const [lookupMode, setLookupMode] = useState('z-to-p');
  const [targetProbability, setTargetProbability] = useState(0.95);
  
  // Learning flow state
  const [learningStage, setLearningStage] = useState(1);
  const totalStages = 5;
  
  // Table view state  
  const [tableView, setTableView] = useState('positive'); // 'positive', 'negative', 'full'
  const [tablePage, setTablePage] = useState(0);
  const rowsPerPage = 10;
  
  // UI state
  const [highlightedRow, setHighlightedRow] = useState(null);
  const [highlightedCol, setHighlightedCol] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(contentRef, [learningStage]);
  
  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to Z-Table Lookup!",
      content: (
        <div className="space-y-2">
          <p>This tool helps you master the standard normal distribution table.</p>
          <p className="text-blue-300">You'll learn to:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Convert z-scores to probabilities</li>
            <li>Find critical values for confidence intervals</li>
            <li>Understand real-world applications</li>
          </ul>
        </div>
      )
    },
    {
      target: '.z-visualization',
      title: "Interactive Visualization",
      content: "This graph shows the standard normal distribution. The shaded area represents the cumulative probability Φ(z).",
      position: 'bottom'
    },
    {
      target: '.z-controls',
      title: "Controls",
      content: "Use the slider or search box to explore different z-values. Try common values like 1.96 for 95% confidence.",
      position: 'top'
    },
    {
      target: '.z-table-section',
      title: "Z-Table Reference",
      content: "The table shows cumulative probabilities. Find your z-value by row (tenths) and column (hundredths).",
      position: 'left'
    }
  ];
  
  // Critical values for quick reference
  const criticalValues = [
    { z: 1.282, confidence: "80%", alpha: "0.20", use: "Basic confidence" },
    { z: 1.645, confidence: "90%", alpha: "0.10", use: "Standard testing" },
    { z: 1.96, confidence: "95%", alpha: "0.05", use: "Most common" },
    { z: 2.326, confidence: "98%", alpha: "0.02", use: "Higher confidence" },
    { z: 2.576, confidence: "99%", alpha: "0.01", use: "High precision" },
    { z: 3.090, confidence: "99.8%", alpha: "0.002", use: "Very high confidence" }
  ];
  
  // Real-world examples
  const practicalExamples = [
    {
      title: "Quality Control",
      icon: <Target className="w-5 h-5" />,
      description: "A factory produces batteries with mean life 500 hours, σ = 50 hours.",
      question: "What percentage last more than 580 hours?",
      solution: "z = (580-500)/50 = 1.6, P(Z > 1.6) = 1 - 0.9452 = 5.48%",
      zValue: 1.6
    },
    {
      title: "Medical Testing",
      icon: <AlertCircle className="w-5 h-5" />,
      description: "Blood pressure readings: mean 120 mmHg, σ = 15 mmHg.",
      question: "What z-score defines the top 5% (hypertension)?",
      solution: "Need P(Z > z) = 0.05, so Φ(z) = 0.95, z ≈ 1.645",
      zValue: 1.645
    },
    {
      title: "Six Sigma",
      icon: <Award className="w-5 h-5" />,
      description: "Process capability for near-zero defects.",
      question: "What's the defect rate at 6σ quality?",
      solution: "P(|Z| > 6) ≈ 2 × 10⁻⁹ or 2 defects per billion",
      zValue: 6
    }
  ];
  
  // Update probability when z changes
  useEffect(() => {
    const p = jStat.normal.cdf(zValue, 0, 1);
    setProbability(p);
    
    // Update table highlighting
    if (zValue >= 0 && zValue <= 3.09) {
      const row = Math.floor(zValue * 10) / 10;
      const col = Math.round((zValue - row) * 100);
      setHighlightedRow(row);
      setHighlightedCol(col);
    } else if (zValue < 0 && zValue >= -3.09) {
      const absZ = Math.abs(zValue);
      const row = Math.floor(absZ * 10) / 10;
      const col = Math.round((absZ - row) * 100);
      setHighlightedRow(row);
      setHighlightedCol(col);
    } else {
      setHighlightedRow(null);
      setHighlightedCol(null);
    }
  }, [zValue]);
  
  // Update z when target probability changes (in p-to-z mode)
  useEffect(() => {
    if (lookupMode === 'p-to-z') {
      const z = jStat.normal.inv(targetProbability, 0, 1);
      setZValue(z);
    }
  }, [targetProbability, lookupMode]);
  
  // Enhanced D3 Visualization
  useEffect(() => {
    if (!svgRef.current || typeof window === 'undefined') return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 40, right: 60, bottom: 60, left: 60 };
    
    svg.attr("width", width).attr("height", height);
    
    const g = svg.append("g");
    
    // Create gradient defs
    const defs = svg.append("defs");
    
    // Area gradient - using color scheme
    const areaGradient = defs.append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0);
      
    areaGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colors.primary)
      .attr("stop-opacity", 0.1);
      
    areaGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colors.primary)
      .attr("stop-opacity", 0.3);
    
    // Scales
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([margin.left, width - margin.right]);
      
    const yScale = d3.scaleLinear()
      .domain([0, 0.45])
      .range([height - margin.bottom, margin.top]);
    
    // Normal PDF
    const normalPDF = (x) => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
    
    // Generate curve data
    const curveData = d3.range(-4, 4.01, 0.01).map(x => ({ x, y: normalPDF(x) }));
    
    // Grid lines
    const xGridlines = d3.axisBottom(xScale)
      .tickSize(-height + margin.top + margin.bottom)
      .tickValues([-3, -2, -1, 0, 1, 2, 3])
      .tickFormat("");
      
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xGridlines)
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.1)
      .selectAll("line")
      .style("stroke", "#6B7280");
    
    // Area under curve
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);
      
    const areaData = curveData.filter(d => d.x <= zValue);
    
    g.append("path")
      .datum(areaData)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .style("opacity", 1);
    
    // Draw PDF curve
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);
    
    g.append("path")
      .datum(curveData)
      .attr("d", line)
      .attr("stroke", colors.primary)
      .attr("stroke-width", 3)
      .attr("fill", "none");
    
    // Axes
    const xAxis = d3.axisBottom(xScale)
      .tickValues([-4, -3, -2, -1, 0, 1, 2, 3, 4])
      .tickFormat(d => d === 0 ? "0" : d.toString());
      
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d3.format(".2f"));
    
    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .style("font-size", "14px")
      .selectAll("text")
      .style("font-family", "monospace")
      .style("fill", "#D1D5DB");
      
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .style("font-size", "14px")
      .selectAll("text")
      .style("font-family", "monospace")
      .style("fill", "#D1D5DB");
    
    // Style axis lines
    g.selectAll(".domain")
      .style("stroke", "#6B7280");
    g.selectAll(".tick line")
      .style("stroke", "#6B7280");
    
    // Axis labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", "#E5E7EB")
      .text("z-score");
      
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .style("fill", "#E5E7EB")
      .text("Probability Density");
    
    // Z-value indicator
    if (zValue >= -4 && zValue <= 4) {
      // Vertical line
      const zLine = g.append("line")
        .attr("x1", xScale(zValue))
        .attr("y1", height - margin.bottom)
        .attr("x2", xScale(zValue))
        .attr("y2", yScale(normalPDF(zValue)))
        .attr("stroke", colors.accent)
        .attr("stroke-width", 2.5)
        .attr("stroke-dasharray", "6,3")
        .style("opacity", 0);
        
      zLine.transition()
        .duration(300)
        .style("opacity", 1);
      
      // Point on curve
      g.append("circle")
        .attr("cx", xScale(zValue))
        .attr("cy", yScale(normalPDF(zValue)))
        .attr("r", 6)
        .attr("fill", colors.accent)
        .attr("stroke", "#FFFFFF")
        .attr("stroke-width", 2);
    }
    
    // Stats display card
    const statsGroup = g.append("g")
      .attr("transform", `translate(${width - margin.right - 200}, ${margin.top})`);
      
    // Stats background
    statsGroup.append("rect")
      .attr("x", -20)
      .attr("y", -20)
      .attr("width", 200)
      .attr("height", 110)
      .attr("rx", 12)
      .attr("fill", "#F9FAFB")
      .attr("stroke", "#E5E7EB")
      .attr("stroke-width", 1);
    
    // Z-value display
    statsGroup.append("text")
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .attr("x", 80)
      .style("font-family", "monospace")
      .style("font-size", "22px")
      .style("font-weight", "700")
      .attr("fill", colors.primary)
      .text(`z = ${zValue.toFixed(3)}`);
    
    // Probability display
    statsGroup.append("text")
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .attr("x", 80)
      .style("font-family", "monospace")
      .style("font-size", "18px")
      .style("font-weight", "500")
      .attr("fill", colors.secondary)
      .text(`Φ(z) = ${probability.toFixed(4)}`);
    
    // Percentile display
    statsGroup.append("text")
      .attr("y", 60)
      .attr("text-anchor", "middle")
      .attr("x", 80)
      .style("font-size", "14px")
      .attr("fill", "#6B7280")
      .text(`${(probability * 100).toFixed(1)}th percentile`);
    
    // Right tail probability
    statsGroup.append("text")
      .attr("y", 80)
      .attr("text-anchor", "middle")
      .attr("x", 80)
      .style("font-size", "13px")
      .attr("fill", "#9CA3AF")
      .text(`P(Z > z) = ${(1 - probability).toFixed(4)}`);
    
  }, [zValue, probability, colors]);
  
  // Generate Z-table data
  const zTable = useMemo(() => {
    const table = [];
    for (let row = 0; row <= 30; row++) {
      const zRow = row / 10;
      const rowData = { z: zRow.toFixed(1), values: [] };
      for (let col = 0; col <= 9; col++) {
        const z = zRow + col / 100;
        const p = jStat.normal.cdf(z, 0, 1);
        rowData.values.push({ col, p: p.toFixed(4), zExact: z });
      }
      table.push(rowData);
    }
    return table;
  }, []);
  
  // Paginated table data
  const paginatedTable = useMemo(() => {
    const startIdx = tablePage * rowsPerPage;
    return zTable.slice(startIdx, startIdx + rowsPerPage);
  }, [zTable, tablePage, rowsPerPage]);
  
  // Search functionality
  const handleSearch = (value) => {
    const val = parseFloat(value);
    if (!isNaN(val) && val >= -3.5 && val <= 3.5) {
      setZValue(val);
      setSearchValue(value);
    }
  };
  
  // Learning content for each stage
  const renderLearningContent = () => {
    switch (learningStage) {
      case 1: // Introduction - What is a Z-Table?
        return (
          <div className="space-y-6">
            <VisualizationSection className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Info className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">What is a Z-Table?</h3>
                    <p className="text-gray-600 mt-1">A lookup table for cumulative probabilities of the standard normal distribution</p>
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  {/* What it represents */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-blue-600" />
                      What a Z-Table Actually Represents
                    </h4>
                    <p className="text-gray-600 leading-relaxed mb-3">
                      A Z-table contains pre-calculated values of the cumulative distribution function (CDF) for the standard normal distribution:
                    </p>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-center font-mono text-lg text-gray-800" dangerouslySetInnerHTML={{ __html: `\\(\\Phi(z) = P(Z \\leq z) = \\int_{-\\infty}^{z} \\frac{1}{\\sqrt{2\\pi}} e^{-t^2/2} dt\\)` }} />
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      Each entry tells you what percentage of the data falls below a given z-score. It's the area under the curve from negative infinity to z.
                    </p>
                  </div>
                  
                  {/* Historical context */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Historical Necessity
                      </h4>
                      <p className="text-amber-800 text-sm leading-relaxed">
                        Before computers, calculating <span className="inline-block mx-1" dangerouslySetInnerHTML={{ __html: `\\(\\Phi(z)\\)` }} /> required complex numerical integration. 
                        Tables were essential tools that saved hours of computation. Statisticians would carry these tables everywhere!
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Modern Relevance
                      </h4>
                      <p className="text-green-800 text-sm leading-relaxed">
                        Today, computers can calculate these instantly. So why still learn tables? 
                        Because understanding them builds deep intuition about probability distributions!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </VisualizationSection>
          </div>
        );
        
      case 2: // Why Z-tables STILL matter
        return (
          <div className="space-y-6">
            <VisualizationSection>
              <h3 className="text-lg font-semibold mb-4">Why Understanding Z-Tables Still Matters in the Modern Era</h3>
              
              <div className="space-y-4">
                {/* Main argument */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                  <p className="text-indigo-900 font-medium mb-2">
                    We're NOT promoting memorization — we're building intuition!
                  </p>
                  <p className="text-indigo-800 text-sm">
                    While computers can instantly calculate any probability, understanding Z-tables helps you develop a "feel" for the normal distribution that no calculator can provide.
                  </p>
                </div>
                
                {/* Four key reasons */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      1. Builds Intuition
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      Z-tables show how probability accumulates as you move along the distribution. You can literally see:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600 ml-4">
                      <li>• How quickly probability grows near the mean</li>
                      <li>• How slowly it changes in the tails</li>
                      <li>• Why extreme events are so rare</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      2. Quick Mental Estimates
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      Knowing key values helps you make rapid assessments:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600 ml-4">
                      <li>• "That's about 2 standard deviations" → ~95%</li>
                      <li>• "z = 1.65" → roughly 90th percentile</li>
                      <li>• Instant sanity checks on calculations</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-green-600" />
                      3. Understanding Reports
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      Statistical reports often reference z-scores:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600 ml-4">
                      <li>• "Significant at z = 2.5" → What does this mean?</li>
                      <li>• Medical test results in standard deviations</li>
                      <li>• Quality control limits (e.g., Six Sigma)</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      4. Connection to CDF
                    </h4>
                    <p className="text-gray-600 text-sm mb-2">
                      Tables reveal the CDF's behavior:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600 ml-4">
                      <li>• Why <span dangerouslySetInnerHTML={{ __html: `\\(\\Phi(0) = 0.5\\)` }} /></li>
                      <li>• How symmetry works: <span dangerouslySetInnerHTML={{ __html: `\\(\\Phi(-z) = 1 - \\Phi(z)\\)` }} /></li>
                      <li>• The S-shaped cumulative curve</li>
                    </ul>
                  </div>
                </div>
                
                {/* Key insight */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-900 mb-1">The Real Goal</p>
                      <p className="text-emerald-800 text-sm">
                        After working with Z-tables, you'll have an intuitive sense for probabilities. 
                        When someone says "that's a 3-sigma event," you'll instantly know it's extraordinarily rare (0.3%). 
                        This intuition is invaluable in data science, quality control, and research.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </VisualizationSection>
          </div>
        );
        
      case 3: // How to read the table (step by step)
        return (
          <div className="space-y-6">
            <VisualizationSection>
              <h3 className="text-lg font-semibold mb-4">How to Read a Z-Table: Step-by-Step Guide</h3>
              
              <div className="space-y-4">
                {/* Visual guide */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                  <h4 className="font-medium text-indigo-900 mb-3">The Three-Step Process</h4>
                  <div className="space-y-3">
                    {[
                      { 
                        step: 1, 
                        title: "Split your z-value",
                        desc: "Separate the tenths from hundredths. For z = 1.96: tenths = 1.9, hundredths = 0.06",
                        example: "z = 1.96 → Row: 1.9, Column: 0.06"
                      },
                      { 
                        step: 2, 
                        title: "Navigate the table",
                        desc: "Find the row labeled with your tenths value, then move to the column for hundredths",
                        example: "Go to row 1.9, then move right to column 0.06"
                      },
                      { 
                        step: 3, 
                        title: "Read the probability",
                        desc: "The value at the intersection is Φ(z) — the cumulative probability up to that z-score",
                        example: "The cell shows 0.9750, meaning 97.5% of data falls below z = 1.96"
                      }
                    ].map((item) => (
                      <div key={item.step} className="flex gap-3">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.title}</p>
                          <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
                          <p className="text-indigo-700 text-sm font-mono mt-1 bg-indigo-50 px-2 py-1 rounded inline-block">
                            {item.example}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Examples grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-3">✓ Worked Example: Φ(2.33)</h5>
                    <ol className="space-y-2 text-sm text-green-800">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">1.</span>
                        <span>Split: 2.33 → Row 2.3, Column 0.03</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">2.</span>
                        <span>Find row 2.3 in the table</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">3.</span>
                        <span>Move to column 0.03</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">4.</span>
                        <span>Read: <span className="font-mono font-bold">0.9901</span></span>
                      </li>
                    </ol>
                    <p className="text-green-700 text-sm mt-3 font-medium">
                      Interpretation: 99.01% of values are below z = 2.33
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h5 className="font-medium text-purple-900 mb-3">🔄 The Symmetry Property</h5>
                    <p className="text-sm text-purple-800 mb-3">
                      For negative z-values, use the symmetry of the normal distribution:
                    </p>
                    <div className="p-3 bg-purple-100 rounded text-center">
                      <span className="font-mono text-purple-900" dangerouslySetInnerHTML={{ __html: `\\(\\Phi(-z) = 1 - \\Phi(z)\\)` }} />
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-purple-700">
                      <p><strong>Example:</strong> Find Φ(-1.50)</p>
                      <p>1. Look up Φ(1.50) = 0.9332</p>
                      <p>2. Apply symmetry: Φ(-1.50) = 1 - 0.9332 = <span className="font-mono font-bold">0.0668</span></p>
                    </div>
                  </div>
                </div>
                
                {/* Common errors */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Common Errors to Avoid
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      {
                        error: "Confusing rows and columns",
                        fix: "Remember: First two digits → row, last digit → column"
                      },
                      {
                        error: "Forgetting what the table shows",
                        fix: "Z-table gives LEFT tail area (cumulative probability)"
                      },
                      {
                        error: "Wrong calculation for P(Z > z)",
                        fix: "Use P(Z > z) = 1 - Φ(z), not just Φ(z)"
                      },
                      {
                        error: "Mishandling negative z-values",
                        fix: "Always use symmetry: Φ(-z) = 1 - Φ(z)"
                      }
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-sm font-medium text-red-800">❌ {item.error}</p>
                        <p className="text-xs text-red-700">✓ {item.fix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </VisualizationSection>
          </div>
        );
        
      case 4: // Connection to CDF and practical use
        return (
          <div className="space-y-6">
            <VisualizationSection>
              <h3 className="text-lg font-semibold mb-4">The Deep Connection: Z-Table and the CDF</h3>
              
              <div className="space-y-4">
                {/* CDF explanation */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">Understanding What You're Really Looking At</h4>
                  <p className="text-blue-800 mb-3">
                    Every Z-table entry is a point on the cumulative distribution function (CDF) curve:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded border border-blue-200">
                      <p className="font-medium text-gray-800 mb-2">The Mathematical Truth</p>
                      <p className="text-sm text-gray-600">
                        Each table value represents the integral of the probability density function from -∞ to z.
                        This is why values start near 0 and approach 1.
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded border border-blue-200">
                      <p className="font-medium text-gray-800 mb-2">The Visual Insight</p>
                      <p className="text-sm text-gray-600">
                        As you move right in the table (increasing z), you're accumulating more area under the bell curve.
                        The S-shaped pattern shows how probability accumulates.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Key insights */}
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <h5 className="font-medium text-amber-900 mb-2">Why Φ(0) = 0.5?</h5>
                    <p className="text-sm text-amber-800">
                      The standard normal is symmetric around 0. 
                      Half the data lies below the mean, half above.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <h5 className="font-medium text-green-900 mb-2">Why values near 0 and 1?</h5>
                    <p className="text-sm text-green-800">
                      CDF ranges from 0 to 1 because it represents probability. 
                      You'll never see values outside this range.
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <h5 className="font-medium text-purple-900 mb-2">The tail behavior</h5>
                    <p className="text-sm text-purple-800">
                      Notice how slowly values change for |z| {'>'} 3. 
                      This shows why extreme events are so rare.
                    </p>
                  </div>
                </div>
                
                {/* Practical examples with deeper explanation */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">See It In Action: Real-World Applications</h4>
                  <div className="space-y-3">
                    {practicalExamples.map((example, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            {example.icon}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-800">{example.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                            <p className="text-sm font-medium text-blue-700 mt-2">{example.question}</p>
                            
                            <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                              <p className="text-sm text-gray-700 font-mono">{example.solution}</p>
                              <p className="text-xs text-gray-600 mt-2">
                                <strong>Why this matters:</strong> Understanding z-tables helps you quickly assess 
                                {idx === 0 ? " quality control limits" : idx === 1 ? " medical test significance" : " process capabilities"}.
                              </p>
                            </div>
                            
                            <Button
                              variant="info"
                              size="sm"
                              className="mt-3"
                              onClick={() => setZValue(example.zValue)}
                            >
                              Visualize this z-value
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Mental math tips */}
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <h4 className="font-medium text-indigo-900 mb-3 flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Quick Mental Estimates Using Z-Tables
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="font-medium text-indigo-800 mb-2">For positive z:</p>
                      <ul className="space-y-1 text-indigo-700 ml-4">
                        <li>• z ≈ 0 → Φ(z) ≈ 0.5 (50%)</li>
                        <li>• z ≈ 1 → Φ(z) ≈ 0.84 (84%)</li>
                        <li>• z ≈ 2 → Φ(z) ≈ 0.98 (98%)</li>
                        <li>• z ≈ 3 → Φ(z) ≈ 0.999 (99.9%)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-indigo-800 mb-2">For finding percentiles:</p>
                      <ul className="space-y-1 text-indigo-700 ml-4">
                        <li>• 90th percentile → z ≈ 1.28</li>
                        <li>• 95th percentile → z ≈ 1.65</li>
                        <li>• 97.5th percentile → z ≈ 1.96</li>
                        <li>• 99th percentile → z ≈ 2.33</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </VisualizationSection>
          </div>
        );
        
      case 5: // Full exploration
        return (
          <div className="space-y-6">
            <VisualizationSection className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">You're Ready to Explore!</h3>
                </div>
                <p className="text-gray-700">
                  Now you can use the full Z-table lookup tool. Try different values, switch between modes, and master probability calculations.
                </p>
                <div className="grid md:grid-cols-3 gap-3 mt-4">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 text-sm">Z → P Mode</h4>
                    <p className="text-xs text-gray-600 mt-1">Enter z-score, get probability</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 text-sm">P → Z Mode</h4>
                    <p className="text-xs text-gray-600 mt-1">Enter probability, get z-score</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 text-sm">Reference Table</h4>
                    <p className="text-xs text-gray-600 mt-1">Browse the full Z-table</p>
                  </div>
                </div>
              </div>
            </VisualizationSection>
          </div>
        );
    }
  };
  
  return (
    <VisualizationContainer 
      title="Z-Table Lookup: Master the Standard Normal Distribution"
      className="max-w-full"
    >
      <div ref={contentRef} className="space-y-6">
        {/* Tutorial Component */}
        {showTutorial && (
          <Tutorial
            steps={tutorialSteps}
            onComplete={() => setShowTutorial(false)}
            onSkip={() => setShowTutorial(false)}
            persistKey="z-table-lookup"
            mode="tooltip"
          />
        )}
        
        {/* Progress Bar */}
        <ProgressBar
          current={learningStage}
          total={totalStages}
          label="Learning Progress"
          variant="blue"
        />
        
        {/* Navigation Buttons */}
        <ProgressNavigation
          current={learningStage}
          total={totalStages}
          onPrevious={() => setLearningStage(Math.max(1, learningStage - 1))}
          onNext={() => setLearningStage(Math.min(totalStages, learningStage + 1))}
          variant="blue"
          nextLabel={learningStage === 4 ? "Start Exploring" : "Next"}
          completeLabel="Explore Tool"
        />
        
        {/* Learning Content Section */}
        {learningStage < 5 && (
          <div className="mb-6">
            {renderLearningContent()}
          </div>
        )}
        
        {/* Main Tool (Stage 5) */}
        {learningStage === 5 && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Visualization and Controls - 2/3 width */}
            <div className="xl:col-span-2 space-y-4">
              {/* Visualization */}
              <VisualizationSection className="p-0 overflow-hidden z-visualization">
                <div 
                  className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl"
                  style={{ height: '400px' }}
                >
                  <svg ref={svgRef} className="w-full h-full" />
                </div>
              </VisualizationSection>
              
              {/* Controls */}
              <VisualizationSection className="z-controls">
                <div className="space-y-4">
                  {/* Mode Switcher */}
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setLookupMode('z-to-p')}
                      className={cn(
                        "flex-1 px-4 py-2.5 rounded-md transition-all duration-200 font-medium",
                        lookupMode === 'z-to-p' 
                          ? "bg-blue-600 text-white shadow-sm" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                      )}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono">Z → P</span>
                        <span className="text-sm opacity-80">Find Probability</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setLookupMode('p-to-z')}
                      className={cn(
                        "flex-1 px-4 py-2.5 rounded-md transition-all duration-200 font-medium",
                        lookupMode === 'p-to-z' 
                          ? "bg-blue-600 text-white shadow-sm" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                      )}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono">P → Z</span>
                        <span className="text-sm opacity-80">Find Z-Score</span>
                      </div>
                    </button>
                  </div>
                  
                  {/* Input Controls */}
                  <div className="space-y-3">
                    {lookupMode === 'z-to-p' ? (
                      <>
                        <div className="flex items-center gap-3">
                          <Search className="w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Enter z-value (e.g., 1.96)"
                            value={searchValue}
                            onChange={(e) => {
                              setSearchValue(e.target.value);
                              handleSearch(e.target.value);
                            }}
                            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg 
                              focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                              transition-all duration-200 font-mono text-sm"
                          />
                        </div>
                        <RangeSlider
                          label="Z-Score"
                          value={zValue}
                          onChange={setZValue}
                          min={-3.5}
                          max={3.5}
                          step={0.01}
                          formatValue={(v) => v.toFixed(2)}
                        />
                      </>
                    ) : (
                      <RangeSlider
                        label="Target Probability"
                        value={targetProbability}
                        onChange={setTargetProbability}
                        min={0.001}
                        max={0.999}
                        step={0.001}
                        formatValue={(v) => `${(v * 100).toFixed(1)}%`}
                      />
                    )}
                  </div>
                  
                  {/* Quick Access Critical Values */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Common Critical Values</p>
                    <div className="grid grid-cols-3 gap-2">
                      {criticalValues.map((cv) => (
                        <button
                          key={cv.z}
                          onClick={() => {
                            setZValue(cv.z);
                            setSearchValue(cv.z.toString());
                          }}
                          className={cn(
                            "p-3 rounded-lg border-2 transition-all duration-200",
                            Math.abs(zValue - cv.z) < 0.01
                              ? "bg-blue-50 border-blue-400 text-blue-700"
                              : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700"
                          )}
                        >
                          <div className="text-base font-semibold">{cv.confidence}</div>
                          <div className="font-mono text-sm mt-0.5">z = ±{cv.z}</div>
                          <div className="text-xs text-gray-500 mt-1">{cv.use}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </VisualizationSection>
            </div>
            
            {/* Reference Table - 1/3 width */}
            <div className="xl:col-span-1 z-table-section">
              <VisualizationSection className="h-full">
                <h3 className="text-lg font-semibold mb-4">Z-Table Reference</h3>
                
                {/* Table View Toggle */}
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4">
                  {[
                    { id: 'positive', label: 'Positive Z' },
                    { id: 'negative', label: 'Negative Z' }
                  ].map(view => (
                    <button
                      key={view.id}
                      onClick={() => {
                        setTableView(view.id);
                        setTablePage(0);
                      }}
                      className={cn(
                        "flex-1 px-3 py-1.5 rounded text-sm font-medium transition-all duration-200",
                        tableView === view.id
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      {view.label}
                    </button>
                  ))}
                </div>
                
                {/* Table Instructions */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>How to use:</strong> Find row (tenths), then column (hundredths). 
                    {highlightedRow !== null && (
                      <span className="block mt-1 font-mono">
                        Currently: z = {highlightedRow.toFixed(1)}{highlightedCol}
                      </span>
                    )}
                  </p>
                </div>
                
                {/* Z-Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="overflow-auto max-h-[400px]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-100 z-10">
                        <tr>
                          <th className="p-2 border-b border-r border-gray-300 font-semibold bg-gray-200">
                            z
                          </th>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(col => (
                            <th key={col} className="p-2 border-b border-gray-300 font-mono text-xs">
                              .0{col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTable.map((row) => {
                          const isRowHighlighted = highlightedRow === parseFloat(row.z);
                          const displayZ = tableView === 'negative' ? `-${row.z}` : row.z;
                          
                          return (
                            <tr 
                              key={row.z} 
                              className={cn(
                                "transition-all duration-200",
                                isRowHighlighted ? "bg-blue-50" : "hover:bg-gray-50"
                              )}
                            >
                              <td className="p-2 border-r border-gray-300 font-mono text-sm bg-gray-50 font-semibold">
                                {displayZ}
                              </td>
                              {row.values.map(({ col, p, zExact }) => {
                                const isCellHighlighted = isRowHighlighted && highlightedCol === col;
                                const displayP = tableView === 'negative' ? (1 - parseFloat(p)).toFixed(4) : p;
                                
                                return (
                                  <td 
                                    key={col} 
                                    className={cn(
                                      "p-2 font-mono text-center text-xs transition-all duration-200 cursor-pointer",
                                      isCellHighlighted
                                        ? "bg-blue-500 text-white font-bold"
                                        : "hover:bg-blue-100"
                                    )}
                                    onMouseEnter={() => setHoveredCell({ 
                                      z: tableView === 'negative' ? `-${zExact.toFixed(2)}` : zExact.toFixed(2), 
                                      p: displayP 
                                    })}
                                    onMouseLeave={() => setHoveredCell(null)}
                                    onClick={() => setZValue(tableView === 'negative' ? -zExact : zExact)}
                                  >
                                    {displayP}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => setTablePage(Math.max(0, tablePage - 1))}
                    disabled={tablePage === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Page {tablePage + 1} of {Math.ceil(zTable.length / rowsPerPage)}
                  </span>
                  
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => setTablePage(Math.min(Math.ceil(zTable.length / rowsPerPage) - 1, tablePage + 1))}
                    disabled={tablePage >= Math.ceil(zTable.length / rowsPerPage) - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Hover info */}
                {hoveredCell && (
                  <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                    <p className="font-mono text-sm">
                      z = {hoveredCell.z}, Φ(z) = {hoveredCell.p}
                    </p>
                  </div>
                )}
              </VisualizationSection>
            </div>
          </div>
        )}
        
        {/* Help Button */}
        <div className="fixed bottom-6 right-6">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowTutorial(true)}
            className="shadow-lg"
          >
            <Info className="w-4 h-4" />
            Help
          </Button>
        </div>
      </div>
    </VisualizationContainer>
  );
};

export default ZTableLookup;