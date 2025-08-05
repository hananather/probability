"use client";
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { SemanticGradientCard, SemanticGradientGrid } from '../ui/patterns/SemanticGradientCard';
import { InterpretationBox, StepInterpretation } from '../ui/patterns/InterpretationBox';
import { StepByStepCalculation, CalculationStep, NestedCalculation, FormulaDisplay } from '../ui/patterns/StepByStepCalculation';
import { StatisticalTestCard, HypothesisSetup, TestStatistic, SignificanceResults } from '../ui/patterns/StatisticalTestCard';
import { MultiFormulaDisplay, createCorrelationFormulas, SimpleFormulaSelector } from '../ui/patterns/MultiFormulaDisplay';
import { ComparisonTable, createCIPIComparison, SimpleComparisonTable } from '../ui/patterns/ComparisonTable';
import { SideBySideFormulas, createCorrelationSideBySide, createRegressionSideBySide, StaticFormulaGrid } from '../ui/patterns/SideBySideFormulas';
import { ChevronDown, ChevronUp, Star, Palette, Calculator, TestTube, BarChart3, Table, Grid3X3, HelpCircle, StickyNote } from 'lucide-react';
import { QuizBreak } from '../mdx/QuizBreak';
import { QuickReferenceCard, ConfidenceIntervalReference, HypothesisTestingReference, DistributionsReference } from '../ui/patterns/QuickReferenceCard';

// Component showcases
const componentShowcases = {
  semanticCards: {
    name: 'Semantic Gradient Cards',
    icon: Palette,
    color: 'text-teal-400',
    description: 'Mathematical framework cards with semantic colors',
    component: React.memo(() => (
      <SemanticGradientGrid title="Mathematical Properties of Correlation" theme="teal">
        <SemanticGradientCard
          title="1. Symmetry Property"
          description="Correlation is symmetric:"
          formula={`\\[\\rho_{\\text{XY}} = \\rho_{\\text{YX}}\\]`}
          note="The correlation between X and Y equals the correlation between Y and X"
          theme="teal"
        />
        <SemanticGradientCard
          title="2. Bounded Values"
          description="Correlation is always bounded:"
          formula={`\\[-1 \\leq \\rho \\leq 1\\]`}
          note={`By Cauchy-Schwarz inequality: \\(|\\text{Cov}(X,Y)| \\leq \\sigma_X \\sigma_Y\\)`}
          theme="blue"
        />
        <SemanticGradientCard
          title="3. Scale Invariance"
          description="Linear transformations preserve correlation:"
          formula={`\\[\\rho(aX+b, cY+d) = \\text{sign}(ac) \\cdot \\rho(X,Y)\\]`}
          note={`for constants \\(a, b, c, d\\) where \\(a \\neq 0, c \\neq 0\\)`}
          theme="yellow"
        />
        <SemanticGradientCard
          title="4. Perfect Correlation"
          description="When \\(|\\rho| = 1\\):"
          formula={`\\[Y = aX + b\\]`}
          note={`Perfect linear relationship: \\(\\rho = 1\\) if \\(a > 0\\), \\(\\rho = -1\\) if \\(a < 0\\)`}
          theme="green"
        />
      </SemanticGradientGrid>
    ))
  },
  
  interpretationBoxes: {
    name: 'Interpretation Boxes',
    icon: Star,
    color: 'text-green-400',
    description: 'Beautiful gradient boxes for insights and conclusions',
    component: React.memo(() => (
      <div className="space-y-4">
        <InterpretationBox title="Teal Interpretation" theme="teal">
          <p>
            With <span dangerouslySetInnerHTML={{ __html: `\\(r = 0.846\\)` }} />, we have a{' '}
            <strong className="text-teal-400">very strong positive</strong> linear relationship.
          </p>
          <p className="mt-2">
            This means: As specific gravity increases, heating value tends to increase as well.
          </p>
          <p className="text-yellow-400 mt-3">
            <strong>Note:</strong> This strong correlation does not imply causation!
          </p>
        </InterpretationBox>

        <InterpretationBox title="Blue Information" theme="blue">
          <p>This is a blue-themed interpretation box, perfect for informational content.</p>
        </InterpretationBox>

        <InterpretationBox title="Green Success" theme="green">
          <p>Green theme works great for positive results and successful outcomes.</p>
        </InterpretationBox>

        <StepInterpretation 
          result="0.846"
          strength="very strong positive"
          meaning="As specific gravity increases, heating value tends to increase as well."
          note="This strong correlation does not imply causation!"
          theme="teal"
        />
      </div>
    ))
  },

  stepByStepCalculations: {
    name: 'Step-by-Step Calculations',
    icon: Calculator,
    color: 'text-purple-400',
    description: 'Purple gradient containers for complex calculations',
    component: React.memo(() => (
      <StepByStepCalculation title="Step-by-Step Calculation: Fuel Quality Example" theme="purple">
        {/* Given Information */}
        <CalculationStep title="Given Information">
          <ul className="space-y-2">
            <li>• Sample size: <span dangerouslySetInnerHTML={{ __html: `\\(n = 20\\)` }} /> fuel samples</li>
            <li>• X = Specific gravity of fuel</li>
            <li>• Y = Heating value (Btu)</li>
            <li>• Question: Is there a linear relationship between specific gravity and heating value?</li>
          </ul>
        </CalculationStep>

        {/* Step 1 */}
        <CalculationStep title="Step 1: Calculate Basic Sums">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="mb-2">Sum of X values:</p>
              <FormulaDisplay formula={`\\sum x_i = 15.94`} />
            </div>
            <div>
              <p className="mb-2">Sum of Y values:</p>
              <FormulaDisplay formula={`\\sum y_i = 3563.2`} />
            </div>
          </div>
        </CalculationStep>

        {/* Step 2 with nested calculations */}
        <CalculationStep title="Step 2: Calculate Sums of Squares">
          <p className="mb-3">Using the computational formula:</p>
          
          <NestedCalculation label="For X:">
            <FormulaDisplay formula={`S_{\\text{xx}} = \\sum x_i^2 - \\frac{(\\sum x_i)^2}{n} = 12.74 - \\frac{(15.94)^2}{20} = 0.389`} />
          </NestedCalculation>
          
          <NestedCalculation label="For Y:">
            <FormulaDisplay formula={`S_{\\text{yy}} = \\sum y_i^2 - \\frac{(\\sum y_i)^2}{n} = 635042 - \\frac{(3563.2)^2}{20} = 168.2`} />
          </NestedCalculation>
        </CalculationStep>

        {/* Final Step */}
        <CalculationStep title="Step 3: Calculate Correlation">
          <p>Apply the formula:</p>
          <FormulaDisplay formula={`r = \\frac{S_{\\text{xy}}}{\\sqrt{S_{\\text{xx}} \\cdot S_{\\text{yy}}}} = \\frac{12.47}{\\sqrt{0.389 \\times 168.2}} = 0.846`} />
        </CalculationStep>
      </StepByStepCalculation>
    ))
  },

  statisticalTests: {
    name: 'Statistical Test Cards',
    icon: TestTube,
    color: 'text-blue-400',
    description: 'Blue gradient containers for hypothesis testing',
    component: React.memo(() => (
      <StatisticalTestCard title="Testing Statistical Significance" theme="blue">
        <HypothesisSetup
          description="Testing whether the population correlation is significantly different from zero:"
          nullHypothesis="H_0: \\rho = 0"
          alternativeHypothesis="H_1: \\rho \\neq 0"
          theme="blue"
        />

        <TestStatistic
          description="Under H₀, the test statistic follows a t-distribution:"
          formula={`t = \\frac{r\\sqrt{n-2}}{\\sqrt{1-r^2}} \\sim t(n-2)`}
          calculation="t = \\frac{0.846\\sqrt{18}}{\\sqrt{1-0.846^2}} = 6.82"
          note="with df = n - 2 = 18 degrees of freedom"
          theme="blue"
        />

        <SignificanceResults
          levels={[
            { alpha: '0.10', isSignificant: true },
            { alpha: '0.05', isSignificant: true },
            { alpha: '0.01', isSignificant: true }
          ]}
          conclusion="There is strong evidence of a linear relationship between specific gravity and heating value (p < 0.01)."
          theme="blue"
        />
      </StatisticalTestCard>
    ))
  },

  multiFormula: {
    name: 'Multiple Formula Display',
    icon: BarChart3,
    color: 'text-purple-400',
    description: 'Interactive formula selector with multiple representations',
    component: React.memo(() => (
      <MultiFormulaDisplay
        title="Multiple Formula Representations"
        formulas={createCorrelationFormulas()}
        defaultFormula="definition"
        note="All these formulas are mathematically equivalent and will give the same result. Choose based on your computational needs or conceptual understanding."
        theme="purple"
      />
    ))
  },

  sideBySideFormulas: {
    name: 'Side-by-Side Formulas',
    icon: Grid3X3,
    color: 'text-indigo-400',
    description: 'Beautiful formula comparisons with toggle functionality',
    component: React.memo(() => {
      const correlationData = createCorrelationSideBySide();
      const regressionData = createRegressionSideBySide();
      
      return (
        <div className="space-y-6">
          <SideBySideFormulas
            title={correlationData.title}
            formulas={correlationData.formulas}
            defaultExpanded={true}
            theme="purple"
          />
          
          <SideBySideFormulas
            title={regressionData.title}
            formulas={regressionData.formulas}
            defaultExpanded={false}
            theme="blue"
          />
          
          <StaticFormulaGrid
            title="Always Visible Grid"
            formulas={[
              {
                title: "Mean",
                latex: `\\[\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i\\]`,
                description: "Sample average"
              },
              {
                title: "Standard Deviation", 
                latex: `\\[s = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n-1}}\\]`,
                description: "Sample standard deviation"
              }
            ]}
            theme="teal"
          />
        </div>
      );
    })
  },

  comparisonTables: {
    name: 'Comparison Tables',
    icon: Table,
    color: 'text-orange-400',
    description: 'Beautiful comparison tables with LaTeX support',
    component: React.memo(() => {
      const cipiData = createCIPIComparison();
      return (
        <div className="space-y-6">
          <ComparisonTable 
            title={cipiData.title}
            columns={cipiData.columns}
            rows={cipiData.rows}
            showAspectColumn={true}
          />
          
          <SimpleComparisonTable
            title="Simple Comparison Example"
            headers={{ left: "Method A", right: "Method B" }}
            colors={{ left: "text-blue-400", right: "text-green-400" }}
            data={[
              { aspect: "Complexity", left: "Simple", right: "Complex" },
              { aspect: "Formula", left: "\\(y = mx + b\\)", right: "\\(y = ax^2 + bx + c\\)" },
              { aspect: "Use Case", left: "Linear relationships", right: "Curved relationships" }
            ]}
            showAspectColumn={true}
          />
        </div>
      );
    })
  },

  quizComponent: {
    name: 'Interactive Quiz Component',
    icon: HelpCircle,
    color: 'text-pink-400',
    description: 'Interactive quizzes with single/multiple questions, progress tracking, and explanations',
    component: React.memo(() => {
      const [singleQuizComplete, setSingleQuizComplete] = useState(false);
      const [multiQuizComplete, setMultiQuizComplete] = useState(false);
      
      return (
        <div className="space-y-8">
          {/* Single Question Example */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-pink-400">Single Question Quiz</h4>
            <QuizBreak
              question="What is the correlation coefficient when there's a perfect positive linear relationship?"
              options={["0", "0.5", "1", "-1"]}
              correct={2}
              onComplete={() => setSingleQuizComplete(true)}
            />
            {singleQuizComplete && (
              <p className="text-green-400 text-sm">✓ Great job! You completed the single question quiz.</p>
            )}
          </div>

          {/* Multiple Questions Example */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-pink-400">Multiple Question Quiz with Explanations</h4>
            <QuizBreak
              questions={[
                {
                  question: "What does \\(r = 0\\) indicate?",
                  options: [
                    "Perfect positive correlation",
                    "Perfect negative correlation", 
                    "No linear correlation",
                    "Strong correlation"
                  ],
                  correctIndex: 2,
                  explanation: "When r = 0, there is no linear relationship between the variables. Note that this doesn't mean there's no relationship at all - there could still be a non-linear relationship."
                },
                {
                  question: "If \\(r^2 = 0.64\\), what is the correlation coefficient?",
                  options: ["0.64", "0.8", "±0.8", "0.32"],
                  correctIndex: 2,
                  explanation: "Since \\(r^2 = 0.64\\), we have \\(r = ±\\sqrt{0.64} = ±0.8\\). The sign depends on the direction of the relationship."
                },
                {
                  question: "Which correlation value indicates the strongest relationship?",
                  options: ["0.3", "-0.9", "0.7", "-0.5"],
                  correctIndex: 1,
                  explanation: "The strength of correlation is determined by the absolute value. |-0.9| = 0.9 is the largest, indicating the strongest relationship (negative in this case)."
                }
              ]}
              onComplete={() => setMultiQuizComplete(true)}
            />
            {multiQuizComplete && (
              <p className="text-green-400 text-sm">✓ Excellent! You've mastered correlation concepts.</p>
            )}
          </div>

          {/* Usage Example */}
          <div className="mt-8 p-4 bg-neutral-800 rounded-lg">
            <h5 className="text-sm font-semibold text-neutral-400 mb-2">Basic Usage:</h5>
            <pre className="text-xs text-green-400 overflow-x-auto">
{`// Single question
<QuizBreak
  question="Your question here"
  options={["A", "B", "C", "D"]}
  correct={1}  // 0-indexed
/>

// Multiple questions with explanations
<QuizBreak
  questions={[
    {
      question: "Question 1",
      options: ["A", "B", "C"],
      correctIndex: 0,
      explanation: "Why A is correct..."
    }
  ]}
/>`}
            </pre>
          </div>
        </div>
      );
    })
  },

  quickReference: {
    name: 'Quick Reference Cards',
    icon: StickyNote,
    color: 'text-purple-400',
    description: 'Beautiful floating or inline formula reference cards',
    component: React.memo(() => {
      const [floatingOpen, setFloatingOpen] = useState(false);
      
      return (
        <div className="space-y-6">
          {/* Showcase header */}
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold text-purple-400 mb-2">
              Quick Reference Formula Sheets
            </h4>
            <p className="text-sm text-neutral-400">
              Three display modes: Floating, Inline (collapsible), and Embedded (always visible)
            </p>
          </div>

          {/* Mode 1: Embedded (Always Visible) */}
          <div>
            <h5 className="text-sm font-semibold text-neutral-400 mb-3">Embedded Mode (Always Visible):</h5>
            <QuickReferenceCard
              sections={[
                {
                  title: "Known σ (Z-interval)",
                  color: "blue",
                  formula: `\\[\\bar{x} \\pm z_{\\alpha/2} \\cdot \\frac{\\sigma}{\\sqrt{n}}\\]`,
                  description: "Use when σ is given"
                },
                {
                  title: "Unknown σ (t-interval)",
                  color: "purple",
                  formula: `\\[\\bar{x} \\pm t_{\\alpha/2,df} \\cdot \\frac{s}{\\sqrt{n}}\\]`,
                  description: "df = n - 1"
                },
                {
                  title: "Quick Steps",
                  color: "emerald",
                  steps: [
                    `Calculate \\(\\bar{x}\\) and s`,
                    "Find df = n - 1",
                    "Look up t-critical value",
                    "Calculate SE = s/√n",
                    "Find margin = t × SE",
                    `CI = \\(\\bar{x}\\) ± margin`
                  ]
                },
                {
                  title: "Common Critical Values",
                  color: "yellow",
                  values: [
                    { label: "95% CI", value: "z = 1.96" },
                    { label: "99% CI", value: "z = 2.576" },
                    { label: "90% CI", value: "z = 1.645" },
                    { label: "t-value", value: "varies with df" }
                  ]
                }
              ]}
              title="Confidence Intervals Reference"
              mode="embedded"
              colorScheme={{
                primary: 'purple',
                secondary: 'emerald',
                accent: 'blue',
                warning: 'yellow'
              }}
            />
          </div>

          {/* Mode 2: Inline (Collapsible) */}
          <div>
            <h5 className="text-sm font-semibold text-neutral-400 mb-3">Inline Mode (Collapsible):</h5>
            <HypothesisTestingReference mode="inline" />
          </div>

          {/* Mode 3: Pre-configured Examples */}
          <div>
            <h5 className="text-sm font-semibold text-neutral-400 mb-3">Pre-configured Examples:</h5>
            <div className="grid md:grid-cols-2 gap-4">
              <ConfidenceIntervalReference mode="inline" />
              <DistributionsReference mode="inline" />
            </div>
          </div>

          {/* Usage Example */}
          <div className="mt-8 p-4 bg-neutral-800 rounded-lg">
            <h5 className="text-sm font-semibold text-neutral-400 mb-2">Usage Example:</h5>
            <pre className="text-xs text-green-400 overflow-x-auto">
{`// Import the component
import { QuickReferenceCard } from '@/components/ui/patterns/QuickReferenceCard';

// Define your sections
const sections = [
  {
    title: "Formula Name",
    color: "blue",
    formula: \`\\[your \\LaTeX\\]\`,
    description: "When to use"
  },
  {
    title: "Steps",
    color: "emerald",
    steps: ["Step 1", "Step 2", "Step 3"]
  }
];

// Use in three modes
<QuickReferenceCard
  sections={sections}
  title="My Reference"
  mode="floating"  // or "inline" or "embedded"
/>`}
            </pre>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
              <h5 className="font-semibold text-purple-400 mb-2">✨ Key Features</h5>
              <ul className="space-y-1 text-neutral-300">
                <li>• Three display modes</li>
                <li>• MathJax auto-processing</li>
                <li>• Semantic color coding</li>
                <li>• Responsive design</li>
              </ul>
            </div>
            <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
              <h5 className="font-semibold text-emerald-400 mb-2">🎯 Perfect For</h5>
              <ul className="space-y-1 text-neutral-300">
                <li>• Formula sheets</li>
                <li>• Quick references</li>
                <li>• Step-by-step guides</li>
                <li>• Key values lookup</li>
              </ul>
            </div>
          </div>

          {/* Note about floating mode */}
          <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
            <p className="text-sm text-yellow-400">
              <strong>Note:</strong> Floating mode creates a fixed button in the bottom-right corner. 
              It's best used as a page-level component, not inside other containers.
            </p>
          </div>
        </div>
      );
    })
  }
};

export function GoldStandardShowcase() {
  const [expandedComponents, setExpandedComponents] = useState({
    semanticCards: true,
    interpretationBoxes: false,
    stepByStepCalculations: false,
    statisticalTests: false,
    multiFormula: false,
    sideBySideFormulas: false,
    comparisonTables: false,
    quizComponent: false,
    quickReference: false
  });

  const toggleComponent = (component) => {
    setExpandedComponents(prev => ({
      ...prev,
      [component]: !prev[component]
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">🏆 Gold Standard Components</h1>
        <p className="text-neutral-400 max-w-3xl mx-auto">
          Extracted patterns from Chapter 7.1 Correlation Coefficient - your favorite designs 
          now available as reusable components with exact colors, gradients, and interactions.
        </p>
      </div>

      {/* Component Categories */}
      <div className="space-y-6">
        {Object.entries(componentShowcases).map(([key, data]) => {
          const IconComponent = data.icon;
          const isExpanded = expandedComponents[key];
          
          return (
            <div key={key} className="space-y-4">
              {/* Category Header */}
              <button
                onClick={() => toggleComponent(key)}
                className="w-full flex items-center justify-between p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-5 h-5 ${data.color}`} />
                  <h3 className="text-lg font-semibold text-white">{data.name}</h3>
                  <span className="text-sm text-neutral-400">({data.description})</span>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-neutral-400" /> : <ChevronDown className="w-5 h-5 text-neutral-400" />}
              </button>

              {/* Component Display */}
              {isExpanded && (
                <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-700">
                  <data.component />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Usage Guide */}
      <div className="mt-12 p-6 bg-gradient-to-br from-yellow-900/20 to-orange-800/20 border border-yellow-600/30 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">🚀 How to Use These Components</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-neutral-300">
          <div>
            <h4 className="font-semibold text-white mb-2">Import:</h4>
            <div className="bg-neutral-900 rounded p-3 font-mono text-xs text-green-400">
              {`import { SemanticGradientCard } from '@/components/ui/patterns/SemanticGradientCard';`}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Use:</h4>
            <div className="bg-neutral-900 rounded p-3 font-mono text-xs text-blue-400">
              {`<SemanticGradientCard title="..." formula="..." theme="teal" />`}
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <p>• <strong>Semantic colors:</strong> teal, blue, yellow, green, purple match mathematical concepts</p>
          <p>• <strong>Exact gradients:</strong> Same beautiful gradients from Chapter 7.1</p>
          <p>• <strong>MathJax ready:</strong> All components handle LaTeX formulas automatically</p>
          <p>• <strong>Side-by-side formulas:</strong> Beautiful toggle-able formula comparisons from your favorite pattern</p>
          <p>• <strong>Systematic:</strong> Use these as your gold standard for future components</p>
        </div>
      </div>
    </div>
  );
}