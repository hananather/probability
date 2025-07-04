"use client";
import React, { useState, useEffect, useRef, memo } from "react";
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
import BackToHub from '../ui/BackToHub';

// Use probability color scheme
const colorScheme = createColorScheme('probability');

// Bayes formula component
const BayesFormula = memo(function BayesFormula({ values, highlight }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
      window.MathJax.typesetPromise([contentRef.current]).catch(() => {});
    }
  }, [values]);

  const getHighlightClass = (part) => {
    if (!highlight) return "";
    return highlight === part ? "text-blue-600 font-bold" : "text-gray-400";
  };

  return (
    <div className={cn(components.card, "p-6")}>
      <h3 className={cn(typography.h3, "mb-4 text-center")}>Bayes' Theorem</h3>
      
      <div ref={contentRef} className="text-center">
        <div className={cn(typography.body, "text-lg mb-4")}>
          <span className={getHighlightClass('posterior')}>P(H|D)</span> = 
          <span className="mx-2">
            <span className={getHighlightClass('likelihood')}>P(D|H)</span> × 
            <span className={getHighlightClass('prior')}> P(H)</span>
          </span>
          / <span className={getHighlightClass('evidence')}>P(D)</span>
        </div>

        <div className="text-sm space-y-2 text-left max-w-md mx-auto">
          <div className={cn("flex items-center gap-2", getHighlightClass('posterior'))}>
            <div className="w-4 h-4 rounded" style={{ backgroundColor: colorScheme.primary }} />
            <span>Posterior: P(H|D) = {formatNumber(values.posterior * 100, 1)}%</span>
          </div>
          <div className={cn("flex items-center gap-2", getHighlightClass('prior'))}>
            <div className="w-4 h-4 rounded" style={{ backgroundColor: colorScheme.secondary }} />
            <span>Prior: P(H) = {formatNumber(values.prior * 100, 1)}%</span>
          </div>
          <div className={cn("flex items-center gap-2", getHighlightClass('likelihood'))}>
            <div className="w-4 h-4 rounded" style={{ backgroundColor: colorScheme.accent }} />
            <span>Likelihood: P(D|H) = {formatNumber(values.likelihood * 100, 1)}%</span>
          </div>
          <div className={cn("flex items-center gap-2", getHighlightClass('evidence'))}>
            <div className="w-4 h-4 rounded" style={{ backgroundColor: colorScheme.warning }} />
            <span>Evidence: P(D) = {formatNumber(values.evidence * 100, 1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
});

// Visual representation of Bayes theorem
const BayesVisualization = memo(function BayesVisualization({ values, scenario }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create visual representation based on scenario
    if (scenario === 'disease') {
      // Population squares visualization
      const squareSize = 15;
      const spacing = 2;
      const totalPopulation = 100;
      const cols = 10;
      
      // Calculate positions
      const getPosition = (i) => ({
        x: (i % cols) * (squareSize + spacing),
        y: Math.floor(i / cols) * (squareSize + spacing)
      });

      // Create population grid
      const population = g.append("g")
        .attr("transform", `translate(${innerWidth / 2 - (cols * (squareSize + spacing)) / 2}, 50)`);

      // Draw all squares
      population.selectAll("rect")
        .data(d3.range(totalPopulation))
        .enter()
        .append("rect")
        .attr("x", d => getPosition(d).x)
        .attr("y", d => getPosition(d).y)
        .attr("width", squareSize)
        .attr("height", squareSize)
        .attr("rx", 2)
        .attr("fill", (d, i) => {
          const hasDisease = i < Math.round(values.prior * totalPopulation);
          const testsPositive = hasDisease 
            ? Math.random() < values.likelihood
            : Math.random() < (1 - values.specificity);
          
          if (hasDisease && testsPositive) return colorScheme.danger; // True positive
          if (hasDisease && !testsPositive) return colorScheme.secondary; // False negative
          if (!hasDisease && testsPositive) return colorScheme.warning; // False positive
          return colorScheme.neutral; // True negative
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);

      // Add legend
      const legend = g.append("g")
        .attr("transform", `translate(${innerWidth / 2 - 200}, ${innerHeight - 50})`);

      const legendItems = [
        { color: colorScheme.danger, label: "True Positive" },
        { color: colorScheme.warning, label: "False Positive" },
        { color: colorScheme.secondary, label: "False Negative" },
        { color: colorScheme.neutral, label: "True Negative" }
      ];

      legendItems.forEach((item, i) => {
        const itemG = legend.append("g")
          .attr("transform", `translate(${i * 100}, 0)`);

        itemG.append("rect")
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", item.color)
          .attr("rx", 2);

        itemG.append("text")
          .attr("x", 16)
          .attr("y", 9)
          .attr("font-size", "11px")
          .attr("fill", colors.text.primary)
          .text(item.label);
      });

    } else if (scenario === 'quality') {
      // Factory production visualization
      const barWidth = 60;
      const barSpacing = 20;
      
      // Data for factories
      const factories = [
        { name: "Factory A", production: values.factoryA, defectRate: values.defectA },
        { name: "Factory B", production: values.factoryB, defectRate: values.defectB },
        { name: "Factory C", production: values.factoryC, defectRate: values.defectC }
      ];

      const xScale = d3.scaleBand()
        .domain(factories.map(d => d.name))
        .range([0, innerWidth])
        .padding(0.3);

      const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([innerHeight, 0]);

      // Draw production bars
      factories.forEach((factory, i) => {
        const x = xScale(factory.name);
        const barHeight = yScale(0) - yScale(factory.production);
        
        // Total production bar
        g.append("rect")
          .attr("x", x)
          .attr("y", yScale(factory.production))
          .attr("width", xScale.bandwidth())
          .attr("height", barHeight)
          .attr("fill", colorScheme.primary)
          .attr("opacity", 0.3)
          .style("transition", "all 1.5s ease");

        // Defective portion
        const defectHeight = barHeight * factory.defectRate;
        g.append("rect")
          .attr("x", x)
          .attr("y", yScale(factory.production))
          .attr("width", xScale.bandwidth())
          .attr("height", defectHeight)
          .attr("fill", colorScheme.danger);

        // Labels
        g.append("text")
          .attr("x", x + xScale.bandwidth() / 2)
          .attr("y", yScale(0) + 20)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", colors.text.primary)
          .text(factory.name);

        // Production percentage
        g.append("text")
          .attr("x", x + xScale.bandwidth() / 2)
          .attr("y", yScale(factory.production) - 5)
          .attr("text-anchor", "middle")
          .attr("font-size", "11px")
          .attr("fill", colors.text.secondary)
          .text(`${Math.round(factory.production * 100)}%`);
      });

      // Y-axis
      g.append("g")
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d * 100}%`))
        .attr("font-size", "11px");

      // Title
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", colors.text.primary)
        .text("Production Distribution & Defect Rates");
    }

  }, [values, scenario]);

  return (
    <GraphContainer title="Visual Representation">
      <svg ref={svgRef} className="w-full" />
    </GraphContainer>
  );
});

// Scenario selector and controls
const ScenarioControls = memo(function ScenarioControls({ scenario, onScenarioChange, values, onValueChange }) {
  const scenarios = {
    disease: {
      name: "Medical Testing",
      description: "A test for a rare disease with known accuracy",
      controls: [
        { key: 'prior', label: 'Disease Prevalence', min: 0.001, max: 0.1, step: 0.001 },
        { key: 'likelihood', label: 'Test Sensitivity (True Positive Rate)', min: 0.5, max: 1, step: 0.01 },
        { key: 'specificity', label: 'Test Specificity (True Negative Rate)', min: 0.5, max: 1, step: 0.01 }
      ]
    },
    quality: {
      name: "Quality Control",
      description: "Finding which factory produced a defective item",
      controls: [
        { key: 'factoryA', label: 'Factory A Production Share', min: 0, max: 1, step: 0.05 },
        { key: 'factoryB', label: 'Factory B Production Share', min: 0, max: 1, step: 0.05 },
        { key: 'defectA', label: 'Factory A Defect Rate', min: 0, max: 0.2, step: 0.01 },
        { key: 'defectB', label: 'Factory B Defect Rate', min: 0, max: 0.2, step: 0.01 },
        { key: 'defectC', label: 'Factory C Defect Rate', min: 0, max: 0.2, step: 0.01 }
      ]
    },
    spam: {
      name: "Spam Detection",
      description: "Determining if an email is spam based on keywords",
      controls: [
        { key: 'prior', label: 'Overall Spam Rate', min: 0, max: 0.5, step: 0.01 },
        { key: 'wordInSpam', label: 'P(word|spam)', min: 0, max: 1, step: 0.01 },
        { key: 'wordInHam', label: 'P(word|not spam)', min: 0, max: 0.5, step: 0.01 }
      ]
    }
  };

  const currentScenario = scenarios[scenario];

  return (
    <div className="space-y-4">
      {/* Scenario selector */}
      <ControlGroup>
        <label className={typography.label}>Scenario</label>
        <select
          value={scenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
        >
          {Object.entries(scenarios).map(([key, config]) => (
            <option key={key} value={key}>{config.name}</option>
          ))}
        </select>
        <p className={cn(typography.body, "text-sm text-gray-600 mt-1")}>
          {currentScenario.description}
        </p>
      </ControlGroup>

      {/* Controls for current scenario */}
      {currentScenario.controls.map(control => (
        <ControlGroup key={control.key}>
          <label className={typography.label}>{control.label}</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={values[control.key] || 0}
              onChange={(e) => onValueChange(control.key, parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className={cn(typography.body, "font-mono text-sm w-16 text-right")}>
              {formatNumber((values[control.key] || 0) * 100, 1)}%
            </span>
          </div>
        </ControlGroup>
      ))}
    </div>
  );
});

// Results display
const ResultsDisplay = memo(function ResultsDisplay({ scenario, values, bayesResult }) {
  const getInterpretation = () => {
    if (scenario === 'disease') {
      return {
        question: "If someone tests positive, what's the probability they have the disease?",
        answer: `${formatNumber(bayesResult.posterior * 100, 1)}%`,
        explanation: `Despite the test being ${formatNumber(values.likelihood * 100, 0)}% accurate, 
          the low disease prevalence (${formatNumber(values.prior * 100, 1)}%) means most positive tests are false positives.`
      };
    } else if (scenario === 'quality') {
      return {
        question: "If we find a defective item, which factory most likely produced it?",
        answer: `Factory ${bayesResult.mostLikely} with ${formatNumber(bayesResult.posterior * 100, 1)}% probability`,
        explanation: `This considers both production volume and defect rates of each factory.`
      };
    } else if (scenario === 'spam') {
      return {
        question: "If an email contains this word, what's the probability it's spam?",
        answer: `${formatNumber(bayesResult.posterior * 100, 1)}%`,
        explanation: `The word appears in ${formatNumber(values.wordInSpam * 100, 0)}% of spam and 
          ${formatNumber(values.wordInHam * 100, 0)}% of legitimate emails.`
      };
    }
  };

  const { question, answer, explanation } = getInterpretation();

  return (
    <div className={cn(components.card, "p-4")}>
      <h3 className={cn(typography.h3, "mb-3")}>Results</h3>
      
      <div className="space-y-3">
        <div>
          <p className={cn(typography.label, "mb-1")}>{question}</p>
          <p className={cn(typography.h2, "text-blue-600")}>{answer}</p>
        </div>
        
        <p className={cn(typography.body, "text-sm text-gray-600")}>
          {explanation}
        </p>

        <div className="pt-3 border-t border-gray-200">
          <p className={cn(typography.label, "text-xs mb-2")}>Calculation Breakdown:</p>
          <div className="space-y-1 text-xs font-mono">
            <div>Prior: {formatNumber(values.prior * 100, 2)}%</div>
            <div>Likelihood: {formatNumber(values.likelihood * 100, 2)}%</div>
            <div>Evidence: {formatNumber(bayesResult.evidence * 100, 2)}%</div>
            <div className="font-bold">Posterior: {formatNumber(bayesResult.posterior * 100, 2)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function BayesTheoremVisualizer() {
  const [scenario, setScenario] = useState('disease');
  const [highlightedPart, setHighlightedPart] = useState(null);
  
  // Values for different scenarios
  const [values, setValues] = useState({
    // Disease testing
    prior: 0.01,
    likelihood: 0.99,
    specificity: 0.95,
    
    // Quality control
    factoryA: 0.5,
    factoryB: 0.3,
    factoryC: 0.2,
    defectA: 0.02,
    defectB: 0.05,
    defectC: 0.01,
    
    // Spam detection
    wordInSpam: 0.8,
    wordInHam: 0.1
  });

  // Calculate Bayes result based on scenario
  const calculateBayesResult = () => {
    if (scenario === 'disease') {
      // P(D) = P(D|H)P(H) + P(D|~H)P(~H)
      const evidence = values.likelihood * values.prior + (1 - values.specificity) * (1 - values.prior);
      const posterior = (values.likelihood * values.prior) / evidence;
      
      return {
        prior: values.prior,
        likelihood: values.likelihood,
        evidence,
        posterior
      };
    } else if (scenario === 'quality') {
      // Normalize factory productions
      const totalProduction = values.factoryA + values.factoryB + values.factoryC;
      const normA = values.factoryA / totalProduction;
      const normB = values.factoryB / totalProduction;
      const normC = 1 - normA - normB;
      
      // Calculate P(defect)
      const evidence = normA * values.defectA + normB * values.defectB + normC * values.defectC;
      
      // Calculate posterior for each factory
      const postA = (values.defectA * normA) / evidence;
      const postB = (values.defectB * normB) / evidence;
      const postC = (values.defectC * normC) / evidence;
      
      const mostLikely = postA > postB ? (postA > postC ? 'A' : 'C') : (postB > postC ? 'B' : 'C');
      const posterior = Math.max(postA, postB, postC);
      
      return {
        prior: values[`factory${mostLikely}`],
        likelihood: values[`defect${mostLikely}`],
        evidence,
        posterior,
        mostLikely
      };
    } else if (scenario === 'spam') {
      // P(word) = P(word|spam)P(spam) + P(word|ham)P(ham)
      const evidence = values.wordInSpam * values.prior + values.wordInHam * (1 - values.prior);
      const posterior = (values.wordInSpam * values.prior) / evidence;
      
      return {
        prior: values.prior,
        likelihood: values.wordInSpam,
        evidence,
        posterior
      };
    }
  };

  const bayesResult = calculateBayesResult();

  const handleValueChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleScenarioChange = (newScenario) => {
    setScenario(newScenario);
    setHighlightedPart(null);
  };

  return (
    <div>
      <BackToHub chapter={1} />
      <VisualizationContainer
        title="Bayes' Theorem Visualizer"
        description="Explore how prior beliefs are updated with new evidence to form posterior probabilities"
      >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main visualization area */}
        <div className="lg:col-span-2 space-y-6">
          <BayesFormula 
            values={bayesResult} 
            highlight={highlightedPart}
          />
          
          <BayesVisualization 
            values={values} 
            scenario={scenario}
          />

          {/* Formula parts buttons */}
          <div className={cn(components.card, "p-4")}>
            <h4 className={cn(typography.label, "mb-3")}>Explore Formula Parts</h4>
            <div className="flex flex-wrap gap-2">
              {['prior', 'likelihood', 'evidence', 'posterior'].map(part => (
                <Button
                  key={part}
                  variant={highlightedPart === part ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setHighlightedPart(highlightedPart === part ? null : part)}
                >
                  {part.charAt(0).toUpperCase() + part.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls and results */}
        <div className="space-y-6">
          <ScenarioControls
            scenario={scenario}
            onScenarioChange={handleScenarioChange}
            values={values}
            onValueChange={handleValueChange}
          />
          
          <ResultsDisplay
            scenario={scenario}
            values={values}
            bayesResult={bayesResult}
          />
        </div>
      </div>
      </VisualizationContainer>
    </div>
  );
}