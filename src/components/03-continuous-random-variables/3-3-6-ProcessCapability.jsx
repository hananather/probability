"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import * as d3 from "d3";
import {
  VisualizationContainer,
  VisualizationSection,
  GraphContainer,
  ControlGroup,
  StatsDisplay,
} from "../ui/VisualizationContainer";
import { createColorScheme, formatNumber, cn } from "../../lib/design-system";
import { RangeSlider } from "../ui/RangeSlider";
import {
  Info,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Factory,
  Plane,
  Car,
} from "lucide-react";
import * as jStat from "jstat";
import { Button } from "../ui/button";
import { ProgressTracker } from "../ui/ProgressTracker";

const ProcessCapability = () => {
  const colorScheme = createColorScheme("hypothesis");
  const svgRef = useRef(null);
  const animationRef = useRef(null);

  // Process parameters
  const [processParams, setProcessParams] = useState({
    mean: 100,
    stdDev: 2,
    lsl: 94, // Lower Specification Limit
    usl: 106, // Upper Specification Limit
  });
  
  // Constants
  const MAX_SAMPLE_COUNT = 1000; // Prevent excessive sample generation

  // Progressive disclosure states
  const [showCpk, setShowCpk] = useState(false);
  const [showPPM, setShowPPM] = useState(false);
  const [showCostImpact, setShowCostImpact] = useState(false);
  const [animateSamples, setAnimateSamples] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const [defectCount, setDefectCount] = useState(0);

  // Business context
  const [costPerDefect] = useState(2500); // Average cost per defect
  const [productionVolume] = useState(100000); // Annual production

  // Calculate process capabilities
  const capabilities = useMemo(() => {
    const { mean, stdDev, lsl, usl } = processParams;
    
    // Validate LSL < USL
    if (lsl >= usl) {
      // Silent warning: Invalid specification limits: LSL >= USL
      return {
        cp: 0,
        cpk: 0,
        cpu: 0,
        cpl: 0,
        ppm: 1000000,
        yield: 0,
        sigma: 0,
        annualDefects: productionVolume,
        annualCost: productionVolume * costPerDefect,
      };
    }

    // Cp: Process capability (potential)
    const cp = (usl - lsl) / (6 * stdDev);

    // Cpu: Upper capability index
    const cpu = (usl - mean) / (3 * stdDev);

    // Cpl: Lower capability index
    const cpl = (mean - lsl) / (3 * stdDev);

    // Cpk: Process capability index (actual)
    const cpk = Math.min(cpu, cpl);

    // Calculate defects per million
    const zLower = (lsl - mean) / stdDev;
    const zUpper = (usl - mean) / stdDev;
    const pLower = jStat.normal.cdf(zLower, 0, 1);
    const pUpper = 1 - jStat.normal.cdf(zUpper, 0, 1);
    const pDefect = pLower + pUpper;
    const ppm = pDefect * 1000000;
    const processYield = (1 - pDefect) * 100;

    // Calculate sigma level
    const sigmaLevel = 3 * cpk;

    // Calculate annual cost impact with bounds checking
    const annualDefects = Math.min((ppm / 1000000) * productionVolume, productionVolume);
    const annualCost = Math.min(annualDefects * costPerDefect, productionVolume * costPerDefect);

    return {
      cp: Math.max(0, cp),
      cpk: Math.max(0, cpk),
      cpu: Math.max(0, cpu),
      cpl: Math.max(0, cpl),
      ppm: Math.max(0, Math.min(1000000, ppm)),
      yield: Math.max(0, Math.min(100, processYield)),
      sigma: Math.max(0, sigmaLevel),
      annualDefects: Math.max(0, annualDefects),
      annualCost: Math.max(0, annualCost),
    };
  }, [processParams, productionVolume, costPerDefect]);

  // Progressive disclosure based on interactions
  useEffect(() => {
    if (sampleCount >= 10 && !showCpk) setShowCpk(true);
    if (sampleCount >= 25 && !showPPM) setShowPPM(true);
    if (sampleCount >= 50 && !showCostImpact) setShowCostImpact(true);
  }, [sampleCount, showCpk, showPPM, showCostImpact]);

  // Animated sample generation
  useEffect(() => {
    if (!animateSamples) return;

    const interval = setInterval(() => {
      setSampleCount((prev) => {
        const newCount = prev + 1;
        // Stop at max sample count
        if (newCount >= MAX_SAMPLE_COUNT) {
          setAnimateSamples(false);
          return prev;
        }
        return newCount;
      });

      // Generate random sample
      const sample = jStat.normal.sample(
        processParams.mean,
        processParams.stdDev,
      );
      if (sample < processParams.lsl || sample > processParams.usl) {
        setDefectCount((prev) => prev + 1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [animateSamples, processParams]);

  // Get capability interpretation
  const getCapabilityInterpretation = useCallback((cpk) => {
    if (cpk < 0.67)
      return {
        status: "Poor",
        color: "#ef4444",
        icon: AlertTriangle,
        message: "Process cannot reliably meet specifications",
        action: "Immediate improvement required",
      };
    if (cpk < 1.0)
      return {
        status: "Marginal",
        color: "#f97316",
        icon: AlertTriangle,
        message: "Process barely meets specifications",
        action: "Significant improvement needed",
      };
    if (cpk < 1.33)
      return {
        status: "Capable",
        color: "#eab308",
        icon: Info,
        message: "Process meets specifications with some margin",
        action: "Continue monitoring and improving",
      };
    if (cpk < 1.67)
      return {
        status: "Good",
        color: "#22c55e",
        icon: CheckCircle,
        message: "Process reliably meets specifications",
        action: "Maintain current performance",
      };
    return {
      status: "World-Class",
      color: "#3b82f6",
      icon: TrendingUp,
      message: "Process exceeds Six Sigma standards",
      action: "Industry benchmark - share best practices",
    };
  }, []);

  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current || typeof window === "undefined") return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = Math.min(width * 0.6, 500);
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g");

    const { mean, stdDev, lsl, usl } = processParams;

    // Scales with fixed domain for stability
    const xExtent = 20; // Fixed extent for better visual stability
    const xScale = d3
      .scaleLinear()
      .domain([mean - xExtent, mean + xExtent])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 0.25])
      .range([height - margin.bottom, margin.top]);

    // Normal PDF
    const normalPDF = (x) => {
      const exp = -0.5 * Math.pow((x - mean) / stdDev, 2);
      return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exp);
    };

    // Generate curve data
    const curveData = d3
      .range(mean - xExtent, mean + xExtent, 0.1)
      .map((x) => ({ x, y: normalPDF(x) }));

    // Create gradient for the curve
    const defs = svg.append("defs");

    // Gradient for good parts (green)
    const goodGradient = defs
      .append("linearGradient")
      .attr("id", "goodGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    goodGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScheme.primary)
      .attr("stop-opacity", 0.8);

    goodGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScheme.primary)
      .attr("stop-opacity", 0.2);

    // Gradient for defect parts (red)
    const defectGradient = defs
      .append("linearGradient")
      .attr("id", "defectGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    defectGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ef4444")
      .attr("stop-opacity", 0.8);

    defectGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ef4444")
      .attr("stop-opacity", 0.2);

    // Specification limits region (subtle background)
    g.append("rect")
      .attr("x", xScale(lsl))
      .attr("y", margin.top)
      .attr("width", xScale(usl) - xScale(lsl))
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", colorScheme.primary)
      .attr("opacity", 0.05)
      .attr("stroke", colorScheme.primary)
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Area generator
    const areaGen = d3
      .area()
      .x((d) => xScale(d.x))
      .y0(height - margin.bottom)
      .y1((d) => yScale(d.y))
      .curve(d3.curveBasis);

    // Draw areas with proper clipping
    const clipPath = defs.append("clipPath").attr("id", "curveClip");

    clipPath.append("path").datum(curveData).attr("d", areaGen);

    // Lower out-of-spec region
    if (lsl > mean - xExtent) {
      g.append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("width", Math.max(0, xScale(lsl) - margin.left))
        .attr("height", height - margin.top - margin.bottom)
        .attr("fill", "url(#defectGradient)")
        .attr("clip-path", "url(#curveClip)");
    }

    // Upper out-of-spec region
    if (usl < mean + xExtent) {
      g.append("rect")
        .attr("x", xScale(usl))
        .attr("y", margin.top)
        .attr("width", Math.max(0, width - margin.right - xScale(usl)))
        .attr("height", height - margin.top - margin.bottom)
        .attr("fill", "url(#defectGradient)")
        .attr("clip-path", "url(#curveClip)");
    }

    // Within-spec area
    g.append("rect")
      .attr("x", xScale(lsl))
      .attr("y", margin.top)
      .attr("width", Math.max(0, xScale(usl) - xScale(lsl)))
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "url(#goodGradient)")
      .attr("clip-path", "url(#curveClip)");

    // Draw PDF curve
    const line = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveBasis);

    g.append("path")
      .datum(curveData)
      .attr("d", line)
      .attr("stroke", colorScheme.text)
      .attr("stroke-width", 3)
      .attr("fill", "none")
      .attr("filter", "drop-shadow(0 0 4px rgba(0,0,0,0.3))");

    // Specification limit lines with better styling
    const limitsData = [
      { x: lsl, label: "LSL", color: "#ef4444", style: "spec" },
      { x: usl, label: "USL", color: "#ef4444", style: "spec" },
      { x: mean, label: "μ", color: colorScheme.primary, style: "mean" },
    ];

    limitsData.forEach((spec) => {
      const lineGroup = g.append("g");

      // Vertical line
      lineGroup
        .append("line")
        .attr("x1", xScale(spec.x))
        .attr("y1", margin.top)
        .attr("x2", xScale(spec.x))
        .attr("y2", height - margin.bottom)
        .attr("stroke", spec.color)
        .attr("stroke-width", spec.style === "mean" ? 2 : 3)
        .attr("stroke-dasharray", spec.style === "spec" ? "8,4" : "none")
        .attr("opacity", spec.style === "mean" ? 0.8 : 1);

      // Label with background
      const labelGroup = lineGroup
        .append("g")
        .attr("transform", `translate(${xScale(spec.x)}, ${margin.top - 10})`);

      const labelText =
        spec.label + (spec.style !== "mean" ? `: ${spec.x}` : ` = ${spec.x}`);

      const textElem = labelGroup
        .append("text")
        .attr("text-anchor", "middle")
        .attr("class", "font-mono text-sm font-semibold")
        .attr("fill", spec.color)
        .text(labelText);

      // Add background to label
      const bbox = textElem.node().getBBox();
      labelGroup
        .insert("rect", "text")
        .attr("x", bbox.x - 4)
        .attr("y", bbox.y - 2)
        .attr("width", bbox.width + 8)
        .attr("height", bbox.height + 4)
        .attr("fill", "#0f172a")
        .attr("rx", 2)
        .attr("opacity", 0.9);
    });

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(10)
      .tickFormat((d) => d.toFixed(0));

    g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .attr("class", "text-xs")
      .style("color", colorScheme.secondary);

    // X-axis label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("class", "text-xs font-medium")
      .attr("fill", colorScheme.secondary)
      .text("Measurement Value");

    // Animated samples
    if (animateSamples && animationRef.current?.samples) {
      animationRef.current.samples.forEach((sample, i) => {
        const isDefect = sample < lsl || sample > usl;

        g.append("circle")
          .attr("cx", xScale(sample))
          .attr("cy", height - margin.bottom - 10)
          .attr("r", 4)
          .attr("fill", isDefect ? "#ef4444" : colorScheme.primary)
          .attr("opacity", 0)
          .transition()
          .delay(i * 50)
          .duration(500)
          .attr("opacity", 0.8)
          .attr("cy", yScale(normalPDF(sample)))
          .transition()
          .duration(1000)
          .attr("opacity", 0)
          .remove();
      });
    }
  }, [processParams, animateSamples, colorScheme, productionVolume]);

  // Sample animation management
  useEffect(() => {
    if (animateSamples) {
      // Generate samples with error handling
      try {
        const samples = [];
        for (let i = 0; i < 10; i++) {
          const sample = jStat.normal.sample(processParams.mean, processParams.stdDev);
          if (isFinite(sample)) {
            samples.push(sample);
          }
        }
        animationRef.current = { samples };
      } catch (error) {
        // Silent error: Error generating samples
        animationRef.current = { samples: [] };
      }
    } else {
      animationRef.current = null;
    }
  }, [animateSamples, processParams]);

  const interpretation = getCapabilityInterpretation(capabilities.cpk);
  const InterpretationIcon = interpretation.icon;

  // Business examples data
  const businessExamples = [
    {
      icon: Plane,
      company: "Boeing",
      improvement: "0.1 Cpk",
      savings: "$2.3M/year",
      detail: "787 assembly",
    },
    {
      icon: Car,
      company: "Toyota",
      improvement: "0.15 Cpk",
      savings: "$5.1M/year",
      detail: "Engine blocks",
    },
    {
      icon: Factory,
      company: "Intel",
      improvement: "0.08 Cpk",
      savings: "$8.7M/year",
      detail: "Chip yields",
    },
  ];

  return (
    <VisualizationContainer
      title="Process Capability (Cp/Cpk)"
      description="Learn how normal distributions are used in quality control through process capability indices Cp and Cpk"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Visualization (80% width) */}
        <div className="flex-1">
          <GraphContainer>
            <svg ref={svgRef} className="w-full" />
          </GraphContainer>

          {/* Controls below visualization */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <ControlGroup>
              <label className="text-xs font-medium mb-1">
                Process Mean (μ)
              </label>
              <RangeSlider
                value={processParams.mean}
                onChange={(value) =>
                  setProcessParams((prev) => ({ ...prev, mean: value }))
                }
                min={85}
                max={115}
                step={0.1}
                showValue
                formatValue={(v) => v.toFixed(1)}
              />
            </ControlGroup>

            <ControlGroup>
              <label className="text-xs font-medium mb-1">Std Dev (σ)</label>
              <RangeSlider
                value={processParams.stdDev}
                onChange={(value) =>
                  setProcessParams((prev) => ({ ...prev, stdDev: value }))
                }
                min={0.5}
                max={5}
                step={0.1}
                showValue
                formatValue={(v) => v.toFixed(1)}
              />
            </ControlGroup>

            <ControlGroup>
              <label className="text-xs font-medium mb-1">LSL</label>
              <RangeSlider
                value={processParams.lsl}
                onChange={(value) =>
                  setProcessParams((prev) => ({ 
                    ...prev, 
                    lsl: Math.min(value, prev.usl - 0.1) 
                  }))
                }
                min={85}
                max={99}
                step={0.5}
                showValue
                formatValue={(v) => v.toFixed(1)}
              />
            </ControlGroup>

            <ControlGroup>
              <label className="text-xs font-medium mb-1">USL</label>
              <RangeSlider
                value={processParams.usl}
                onChange={(value) =>
                  setProcessParams((prev) => ({ 
                    ...prev, 
                    usl: Math.max(value, prev.lsl + 0.1) 
                  }))
                }
                min={101}
                max={115}
                step={0.5}
                showValue
                formatValue={(v) => v.toFixed(1)}
              />
            </ControlGroup>
          </div>

          {/* Interactive button */}
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => {
                setAnimateSamples(!animateSamples);
                if (!animateSamples) {
                  setSampleCount(0);
                  setDefectCount(0);
                }
              }}
              variant={animateSamples ? "secondary" : "default"}
              className="text-sm"
            >
              {animateSamples
                ? "Stop Production"
                : "Start Production Simulation"}
            </Button>
          </div>
        </div>

        {/* Metrics Sidebar (20% width) */}
        <div className="w-full lg:w-64 space-y-4">
          {/* Progressive Metrics Display */}
          <div className="space-y-3">
            {/* Basic Metric - Always shown */}
            <StatsDisplay
              title="Process Capability (Cp)"
              value={capabilities.cp.toFixed(2)}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50"
            >
              <div className="text-xs text-gray-400 mt-1">
                Potential capability if centered
              </div>
            </StatsDisplay>

            {/* Cpk - Show after 10 samples */}
            {showCpk && (
              <StatsDisplay
                title="Actual Capability (Cpk)"
                value={capabilities.cpk.toFixed(2)}
                className={cn(
                  "bg-gradient-to-br transition-all duration-500",
                  capabilities.cpk >= 1.33
                    ? "from-green-800/50 to-green-900/50"
                    : capabilities.cpk >= 1.0
                      ? "from-yellow-800/50 to-yellow-900/50"
                      : "from-red-800/50 to-red-900/50",
                )}
              >
                <div className="flex items-center gap-2 mt-2">
                  <InterpretationIcon
                    className="w-4 h-4"
                    style={{ color: interpretation.color }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: interpretation.color }}
                  >
                    {interpretation.status}
                  </span>
                </div>
              </StatsDisplay>
            )}

            {/* PPM - Show after 25 samples */}
            {showPPM && (
              <StatsDisplay
                title="Defects Per Million"
                value={formatNumber(Math.round(capabilities.ppm))}
                className="bg-gradient-to-br from-purple-800/50 to-purple-900/50"
              >
                <div className="text-xs text-gray-400 mt-1">
                  {capabilities.yield.toFixed(1)}% yield rate
                </div>
                {animateSamples && (
                  <div className="text-xs text-gray-300 mt-2">
                    Live: {defectCount}/{sampleCount} defects
                  </div>
                )}
              </StatsDisplay>
            )}

            {/* Cost Impact - Show after 50 samples */}
            {showCostImpact && (
              <StatsDisplay
                title="Annual Cost Impact"
                value={`$${formatNumber(Math.round(capabilities.annualCost))}`}
                className="bg-gradient-to-br from-amber-800/50 to-amber-900/50"
              >
                <div className="text-xs text-gray-400 mt-1">
                  {formatNumber(Math.round(capabilities.annualDefects))}{" "}
                  defects/year
                </div>
                <div className="text-xs text-green-400 mt-2">
                  Save $
                  {formatNumber(Math.round(capabilities.annualCost * 0.1))}
                  with 0.1 Cpk gain
                </div>
              </StatsDisplay>
            )}
          </div>

          {/* Process Insight */}
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">
              Process Insight
            </h4>
            <p className="text-xs text-gray-300">{interpretation.message}</p>
            <p className="text-xs text-blue-400 font-semibold mt-2">
              {interpretation.action}
            </p>
          </div>

          {/* Industry Benchmarks */}
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">
              Industry Standards
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Car className="w-3 h-3 text-blue-400" />
                  Automotive
                </span>
                <span className="font-mono font-semibold">Cpk ≥ 1.33</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Factory className="w-3 h-3 text-green-400" />
                  Medical
                </span>
                <span className="font-mono font-semibold">Cpk ≥ 1.67</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Plane className="w-3 h-3 text-purple-400" />
                  Aerospace
                </span>
                <span className="font-mono font-semibold">Cpk ≥ 2.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Business Impact Examples */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {businessExamples.map((example, index) => {
          const ExampleIcon = example.icon;
          return (
            <div 
              key={index}
              className="p-3 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-slate-700/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">{example.company}</h4>
                  <p className="text-xs text-gray-400">{example.detail}</p>
                </div>
                <ExampleIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-300">
                  Improved Cpk by <span className="font-semibold text-blue-400">{example.improvement}</span>
                </p>
                <p className="text-sm font-bold text-green-400">
                  {example.savings} saved
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progress Tracker */}
      {animateSamples && (
        <ProgressTracker
          current={sampleCount}
          goal={50}
          label="Production Samples"
          className="mt-4"
        />
      )}
    </VisualizationContainer>
  );
};

export default ProcessCapability;
