'use client';
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { jStat } from 'jstat';
import { ArrowRight, TrendingUp, Activity, TrendingDown, Calculator, BarChart3, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { VisualizationContainer, GraphContainer, VisualizationSection } from '@/components/ui/VisualizationContainer';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { cn } from '../../../lib/utils';
import { QuizBreak } from '../../mdx/QuizBreak';
import { InterpretationBox, StepInterpretation } from '../../ui/patterns/InterpretationBox';
import { StepByStepCalculation, CalculationStep, FormulaDisplay } from '../../ui/patterns/StepByStepCalculation';
import { ComparisonTable, SimpleComparisonTable } from '../../ui/patterns/ComparisonTable';
import { useMathJax } from '../../../hooks/useMathJax';

const CLTPropertiesMerged = () => {
  const [sampleSize, setSampleSize] = useState(30);
  const [showDistribution, setShowDistribution] = useState(false);
  const sizeComparisonRef = useRef(null);
  const contentRef = useMathJax([sampleSize, showDistribution]);

  // Visualization for sample size effect
  useEffect(() => {
    if (showDistribution && sizeComparisonRef.current) {
      visualizeSampleSizeEffect();
    }
  }, [showDistribution, sampleSize]);

  const visualizeSampleSizeEffect = () => {
    const svg = d3.select(sizeComparisonRef.current);
    const width = 700;
    const height = 400;
    const margin = { top: 40, right: 30, bottom: 50, left: 60 };

    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    // Background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#0f172a');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Generate sampling distribution data
    const xExtent = [-4, 4];
    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 0.5])
      .range([innerHeight, 0]);

    // X and Y axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .style('color', '#94a3b8')
      .selectAll('text')
      .attr('fill', '#f3f4f6');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .style('color', '#94a3b8')
      .selectAll('text')
      .attr('fill', '#f3f4f6');

    // Labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('fill', '#60a5fa')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`Sampling Distribution (n = ${sampleSize})`);

    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .style('fill', '#94a3b8')
      .style('font-size', '14px')
      .text('Standardized Sample Mean');

    // Generate normal curve based on sample size
    const standardError = 1 / Math.sqrt(sampleSize);
    const points = d3.range(-4, 4.1, 0.1).map(x => {
      const y = jStat.normal.pdf(x, 0, standardError);
      return { x, y };
    });

    // Draw the curve
    const line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveBasis);

    g.append('path')
      .datum(points)
      .attr('fill', 'none')
      .attr('stroke', '#60a5fa')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Fill under curve
    const area = d3.area()
      .x(d => xScale(d.x))
      .y0(innerHeight)
      .y1(d => yScale(d.y))
      .curve(d3.curveBasis);

    g.append('path')
      .datum(points)
      .attr('fill', 'url(#gradient)')
      .attr('opacity', 0.3)
      .attr('d', area);

    // Gradient definition
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#60a5fa')
      .attr('stop-opacity', 0.8);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#60a5fa')
      .attr('stop-opacity', 0.1);

    // Add standard error annotation
    g.append('text')
      .attr('x', innerWidth - 10)
      .attr('y', 20)
      .attr('text-anchor', 'end')
      .style('fill', '#a78bfa')
      .style('font-size', '14px')
      .text(`SE = ${standardError.toFixed(3)}`);
  };

  // Quiz questions
  const cltQuizQuestions = [
    {
      question: "According to the Central Limit Theorem, what happens to the sampling distribution of the mean as sample size increases?",
      options: [
        "It becomes more skewed",
        "It approaches a normal distribution",
        "It becomes uniform",
        "It remains unchanged"
      ],
      correctIndex: 1,
      explanation: "The CLT states that regardless of the population distribution shape, the sampling distribution of the mean approaches a normal distribution as n increases."
    },
    {
      question: "A professor's exam grades have μ = 56 and σ = 11. For a class of 49 students, what is the standard error of the mean?",
      options: [
        "11",
        "1.57",
        "2.24",
        "0.22"
      ],
      correctIndex: 1,
      explanation: "SE = σ/√n = 11/√49 = 11/7 = 1.57"
    },
    {
      question: "What is the general rule of thumb for when the CLT provides a good approximation?",
      options: [
        "n ≥ 10",
        "n ≥ 20",
        "n ≥ 30",
        "n ≥ 50"
      ],
      correctIndex: 2,
      explanation: "While the CLT works for any n as n→∞, the rule of thumb is n ≥ 30 for a good practical approximation."
    }
  ];

  return (
    <VisualizationSection>
      <div ref={contentRef} className="space-y-8">
        <h2 className="text-3xl font-bold text-blue-400 mb-4">Central Limit Theorem & Sampling Distribution Properties</h2>
        
        {/* Core CLT Concepts */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-8 border border-blue-600/30">
          <div className="flex items-start gap-4 mb-6">
            <Calculator className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-blue-400 mb-3">Understanding the Central Limit Theorem</h2>
              <p className="text-neutral-300 leading-relaxed">
                The Central Limit Theorem is one of the most important results in statistics. It tells us that 
                the distribution of sample means will be approximately normal, regardless of the population distribution, 
                when the sample size is sufficiently large.
              </p>
            </div>
          </div>

          {/* Interactive Visualization */}
          <div className="space-y-4">
            <Button
              onClick={() => setShowDistribution(true)}
              disabled={showDistribution}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Visualize Sample Size Effect
            </Button>

            {showDistribution && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-neutral-300">Sample Size (n):</span>
                  <RangeSlider
                    value={sampleSize}
                    onChange={setSampleSize}
                    min={5}
                    max={100}
                    step={1}
                    className="w-64"
                  />
                  <span className="text-blue-400 font-mono font-bold">{sampleSize}</span>
                </div>
                
                <GraphContainer height="400px" className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-lg border border-blue-600/30">
                  <svg ref={sizeComparisonRef} style={{ width: '100%', height: 400 }} />
                </GraphContainer>
              </div>
            )}
          </div>
        </div>

        {/* Worked Example 1: Professor's Class */}
        <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Worked Example 1: Exam Scores
            </h3>
            <p className="text-neutral-300 mb-4">
              A professor has been teaching a course for 20 years. The mid-term exam grades have E[X] = 56 and SD[X] = 11. 
              This year there are 49 students. What is the probability the class average will be less than 50?
            </p>
            
            <StepByStepCalculation>
              <CalculationStep
                label="Step 1: Identify Parameters"
                formula={`n = 49, \\mu = 56, \\sigma = 11`}
                explanation="Given information from the problem"
              />
              <CalculationStep
                label="Step 2: Calculate Standard Error"
                formula={`SE = \\frac{\\sigma}{\\sqrt{n}} = \\frac{11}{\\sqrt{49}} = \\frac{11}{7} = 1.57`}
                explanation="The standard error tells us the spread of the sampling distribution"
              />
              <CalculationStep
                label="Step 3: Standardize"
                formula={`Z = \\frac{\\bar{X} - \\mu}{SE} = \\frac{50 - 56}{1.57} = \\frac{-6}{1.57} = -3.82`}
                explanation="Convert to standard normal distribution"
              />
              <CalculationStep
                label="Step 4: Find Probability"
                formula={`P(\\bar{X} < 50) = P(Z < -3.82) = 0.0001`}
                explanation="Using standard normal table, this is extremely unlikely!"
              />
            </StepByStepCalculation>
          </CardContent>
        </Card>

        {/* Worked Example 2: Blood Pressure Study */}
        <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-500/30">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Worked Example 2: Blood Pressure Study
            </h3>
            <p className="text-neutral-300 mb-4">
              Systolic blood pressure for women aged 18-24 is normally distributed with μ = 122.6 and σ = 11. 
              For a sample of 25 women, what is the probability their average blood pressure exceeds 125?
            </p>
            
            <StepByStepCalculation>
              <CalculationStep
                label="Step 1: Given Information"
                formula={`n = 25, \\mu = 122.6, \\sigma = 11`}
                explanation="Population parameters and sample size"
              />
              <CalculationStep
                label="Step 2: Standard Error"
                formula={`SE = \\frac{11}{\\sqrt{25}} = \\frac{11}{5} = 2.2`}
                explanation="Standard error of the sample mean"
              />
              <CalculationStep
                label="Step 3: Z-Score"
                formula={`Z = \\frac{125 - 122.6}{2.2} = \\frac{2.4}{2.2} = 1.09`}
                explanation="Standardize the sample mean"
              />
              <CalculationStep
                label="Step 4: Probability"
                formula={`P(\\bar{X} > 125) = P(Z > 1.09) = 1 - 0.8621 = 0.1379`}
                explanation="About 13.79% chance the average exceeds 125"
              />
            </StepByStepCalculation>
          </CardContent>
        </Card>

        {/* Key Properties Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-600/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-green-400" />
                <h4 className="text-lg font-bold text-green-400">Shape Normalization</h4>
              </div>
              <p className="text-sm text-neutral-300 mb-4">
                As n increases, the sampling distribution becomes increasingly normal, 
                even if the population is skewed.
              </p>
              <div className="p-4 bg-neutral-900 rounded-lg border border-green-600/20">
                <div className="text-xs font-mono text-neutral-400 mb-2">Rule of Thumb:</div>
                <div className="text-lg font-bold text-white">n ≥ 30 → Normal</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-600/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingDown className="w-6 h-6 text-purple-400" />
                <h4 className="text-lg font-bold text-purple-400">Variance Reduction</h4>
              </div>
              <p className="text-sm text-neutral-300 mb-4">
                The spread decreases with the square root of sample size. Larger samples 
                give more precise estimates.
              </p>
              <div className="p-4 bg-neutral-900 rounded-lg border border-purple-600/20">
                <div className="text-xs font-mono text-neutral-400 mb-2">Standard Error:</div>
                <div className="text-lg font-bold text-white">
                  <span dangerouslySetInnerHTML={{ __html: `\\(\\text{SE} = \\sigma/\\sqrt{n}\\)` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-600/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <h4 className="text-lg font-bold text-blue-400">√n Relationship</h4>
              </div>
              <p className="text-sm text-neutral-300 mb-4">
                To cut the standard error in half, you need 4× the sample size. 
                This is the law of diminishing returns.
              </p>
              <div className="p-4 bg-neutral-900 rounded-lg border border-blue-600/20">
                <div className="text-xs font-mono text-neutral-400 mb-2">Example:</div>
                <div className="text-lg font-bold text-white">n: 25→100, SE: ÷2</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Section */}
        <QuizBreak
          questions={cltQuizQuestions}
        />

        {/* Interpretation Box */}
        <InterpretationBox title="Why n ≥ 30?">
          <StepInterpretation
            step="Mathematical Foundation"
            interpretation="The CLT technically requires n → ∞, but in practice we need a finite cutoff."
          />
          <StepInterpretation
            step="Empirical Evidence"
            interpretation="For most real-world distributions, n = 30 provides a good normal approximation."
          />
          <StepInterpretation
            step="Effect on Variance"
            interpretation="At n = 30, the standard error is already reduced by a factor of √30 ≈ 5.5."
          />
          <StepInterpretation
            step="Real-World Impact"
            interpretation="This means our estimates are 5.5 times more precise than individual observations!"
          />
        </InterpretationBox>

        {/* Comparison Table */}
        <SimpleComparisonTable
          title="CLT Requirements vs Reality"
          headers={["Requirement", "Theory", "Practice"]}
          rows={[
            ["Sample Size", "n → ∞", "n ≥ 30 usually sufficient"],
            ["Independence", "Strictly required", "Random sampling ensures this"],
            ["Finite Variance", "σ² < ∞", "True for most real data"],
            ["Distribution Shape", "Any distribution", "Works even for highly skewed data"]
          ]}
          className="mt-6"
        />

        {/* Mathematical Foundation */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-neutral-800 border-blue-600/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-teal-400 mb-4">Formal Statement</h3>
              <div className="space-y-4">
                <div className="p-4 bg-neutral-900 rounded-lg font-mono text-sm border border-blue-600/20">
                  <p className="mb-2">If <span dangerouslySetInnerHTML={{ __html: `\\(X_1, X_2, ..., X_n\\)` }} /> are i.i.d. with:</p>
                  <p className="ml-4 text-neutral-300">• <span dangerouslySetInnerHTML={{ __html: `\\(E[X_i] = \\mu\\)` }} /></p>
                  <p className="ml-4 text-neutral-300">• <span dangerouslySetInnerHTML={{ __html: `\\(\\text{Var}(X_i) = \\sigma^2 < \\infty\\)` }} /></p>
                  <p className="mt-3">Then as <span dangerouslySetInnerHTML={{ __html: `\\(n \\to \\infty\\)` }} />:</p>
                  <p className="ml-4 text-green-400 font-semibold text-base">
                    <span dangerouslySetInnerHTML={{ __html: `\\(\\sqrt{n}(\\bar{X}_n - \\mu)/\\sigma \\to N(0, 1)\\)` }} />
                  </p>
                </div>
                <p className="text-neutral-400 text-sm">
                  In practice, n ≥ 30 often gives a good approximation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-800 border-blue-600/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-teal-400 mb-4">Key Formulas</h3>
              <div className="space-y-3">
                <div className="p-3 bg-neutral-900 rounded-lg border border-blue-600/20">
                  <div className="text-neutral-400 text-sm mb-1">Mean of sampling distribution:</div>
                  <div className="font-mono text-white text-lg">
                    <span dangerouslySetInnerHTML={{ __html: `\\(\\mu_{\\bar{x}} = \\mu\\)` }} />
                  </div>
                </div>
                <div className="p-3 bg-neutral-900 rounded-lg border border-blue-600/20">
                  <div className="text-neutral-400 text-sm mb-1">Standard error of the mean:</div>
                  <div className="font-mono text-white text-lg">
                    <span dangerouslySetInnerHTML={{ __html: `\\(\\sigma_{\\bar{x}} = \\sigma/\\sqrt{n}\\)` }} />
                  </div>
                </div>
                <div className="p-3 bg-neutral-900 rounded-lg border border-blue-600/20">
                  <div className="text-neutral-400 text-sm mb-1">Distribution shape (CLT):</div>
                  <div className="font-mono text-white text-lg">
                    <span dangerouslySetInnerHTML={{ __html: `\\(\\bar{X} \\sim N(\\mu, \\sigma^2/n)\\)` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Conditions */}
        <Card className="bg-gradient-to-r from-teal-900/20 to-cyan-900/20 border-teal-600/30">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-teal-400 mb-4">When Does the CLT Apply?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-green-400 font-semibold mb-2">✓ CLT Works When:</h4>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li>• Random sampling from any distribution</li>
                  <li>• Sample size is sufficiently large (n ≥ 30)</li>
                  <li>• Population has finite variance</li>
                  <li>• Observations are independent</li>
                </ul>
              </div>
              <div>
                <h4 className="text-red-400 font-semibold mb-2">✗ CLT Doesn't Apply When:</h4>
                <ul className="space-y-2 text-sm text-neutral-300">
                  <li>• Sample size is too small (n &lt; 30 for skewed distributions)</li>
                  <li>• Data has infinite variance (e.g., Cauchy distribution)</li>
                  <li>• Strong dependence between observations</li>
                  <li>• Non-random sampling methods</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications */}
        <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-600/30">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-indigo-400 mb-4">Real-World Applications</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-neutral-800/50 p-4 rounded-lg border border-indigo-600/20">
                <h4 className="text-indigo-300 font-semibold mb-2">Quality Control</h4>
                <p className="text-sm text-neutral-400">
                  Monitor manufacturing processes by sampling product measurements
                </p>
              </div>
              <div className="bg-neutral-800/50 p-4 rounded-lg border border-indigo-600/20">
                <h4 className="text-indigo-300 font-semibold mb-2">Medical Research</h4>
                <p className="text-sm text-neutral-400">
                  Estimate population health parameters from sample studies
                </p>
              </div>
              <div className="bg-neutral-800/50 p-4 rounded-lg border border-indigo-600/20">
                <h4 className="text-indigo-300 font-semibold mb-2">Financial Analysis</h4>
                <p className="text-sm text-neutral-400">
                  Assess portfolio risk using sampling distributions of returns
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VisualizationSection>
  );
};

export default CLTPropertiesMerged;