import React, { useRef, useState } from 'react';
import { Sparkles, Calculator, Check, X, ChevronRight } from 'lucide-react';
import { VisualizationSection } from '@/components/ui/VisualizationContainer';
import { useSafeMathJax } from '../../../utils/mathJaxFix';
import { StepByStepCalculation, CalculationStep, NestedCalculation, FormulaDisplay } from '../../ui/patterns/StepByStepCalculation';
import { InterpretationBox, StepInterpretation } from '../../ui/patterns/InterpretationBox';
import { QuizBreak } from '../../mdx/QuizBreak';
import { ComparisonTable, SimpleComparisonTable } from '../../ui/patterns/ComparisonTable';

const CLTGateway = () => {
  const contentRef = useRef(null);
  useSafeMathJax(contentRef);

  return (
    <VisualizationSection>
      <div className="space-y-8" ref={contentRef}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-400 mb-4">Central Limit Theorem Gateway</h1>
        <p className="text-lg text-neutral-300">
          How does any distribution become normal?
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-8 border border-blue-600/30">
        <div className="flex items-start gap-4">
          <Sparkles className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-blue-400 mb-3">The Magic of the Central Limit Theorem</h2>
            <p className="text-neutral-300 leading-relaxed">
              One of the most remarkable results in statistics: no matter what shape your original 
              distribution has, the distribution of sample means approaches a normal distribution 
              as sample size increases.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-neutral-800 rounded-xl p-6 border border-blue-600/30">
          <h3 className="text-xl font-semibold text-teal-400 mb-4">Formal Statement</h3>
          <div className="space-y-4">
            <div 
              className="p-4 bg-neutral-900 rounded-lg font-mono text-sm border border-blue-600/20"
              dangerouslySetInnerHTML={{
                __html: `
                  <p class="mb-2">If \\(X_1, X_2, ..., X_n\\) are i.i.d. with:</p>
                  <p class="ml-4">• \\(E[X_i] = \\mu\\)</p>
                  <p class="ml-4">• \\(\\text{Var}(X_i) = \\sigma^2 < \\infty\\)</p>
                  <p class="mt-2">Then as \\(n \\to \\infty\\):</p>
                  <p class="ml-4 text-green-400 font-semibold">
                    \\(\\frac{\\sqrt{n}(\\bar{X}_n - \\mu)}{\\sigma} \\to N(0, 1)\\)
                  </p>
                `
              }}
            />
            <p className="text-neutral-400">
              In practice, n ≥ 30 often gives a good approximation.
            </p>
          </div>
        </div>

        <div className="bg-neutral-800 rounded-xl p-6 border border-blue-600/30">
          <h3 className="text-xl font-semibold text-teal-400 mb-4">Key Conditions</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-600/30">
                <span className="text-xs font-bold text-blue-400">1</span>
              </div>
              <div>
                <p className="font-medium">Independence</p>
                <p className="text-sm text-neutral-400">
                  Observations must be independent
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-600/30">
                <span className="text-xs font-bold text-blue-400">2</span>
              </div>
              <div>
                <p className="font-medium">Identical Distribution</p>
                <p className="text-sm text-neutral-400">
                  All observations from same distribution
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-600/30">
                <span className="text-xs font-bold text-blue-400">3</span>
              </div>
              <div>
                <p className="font-medium">Finite Variance</p>
                <p className="text-sm text-neutral-400">
                  The variance must exist and be finite
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Classical Examples from Course Materials */}
      <div className="bg-gradient-to-r from-indigo-900/20 to-blue-900/20 rounded-xl p-8 border border-indigo-600/30">
        <h2 className="text-2xl font-bold text-indigo-400 mb-6">Worked Examples</h2>
        
        {/* Example 1: Exam Scores */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-teal-400 mb-4">Example 1: University Exam Scores</h3>
          <div className="bg-neutral-900 rounded-lg p-6 mb-4">
            <p className="text-neutral-300 mb-4">
              Examination scores in a university course have mean 56 and standard deviation 11. 
              In a class of 49 students:
            </p>
            <ul className="list-disc list-inside text-neutral-400 space-y-2 mb-4">
              <li>What is the probability that the average mark is below 50?</li>
              <li>What is the probability that the average mark lies between 50 and 60?</li>
            </ul>
          </div>
          
          <StepByStepCalculation>
            <CalculationStep
              stepNumber={1}
              title="Identify the Distribution"
              description="By CLT, the sample mean follows a normal distribution"
              formula={`\\bar{X} \\sim N\\left(56, \\frac{11^2}{49}\\right)`}
              explanation="With n = 49 students, mean μ = 56, and σ = 11"
            />
            <CalculationStep
              stepNumber={2}
              title="Standardize for P(X̄ < 50)"
              description="Convert to standard normal"
              formula={`Z = \\frac{\\bar{X} - 56}{11/7} = \\frac{50 - 56}{11/7} = -3.82`}
              explanation="The standard error is σ/√n = 11/√49 = 11/7"
            />
            <CalculationStep
              stepNumber={3}
              title="Find Probability"
              description="Look up in standard normal table"
              formula={`P(\\bar{X} < 50) = P(Z < -3.82) = 0.0001`}
              explanation="Extremely unlikely to have an average below 50"
            />
            <CalculationStep
              stepNumber={4}
              title="Calculate P(50 < X̄ < 60)"
              description="Find the probability for the range"
              formula={`P(-3.82 < Z < 2.55) = \\Phi(2.55) - \\Phi(-3.82) = 0.9945`}
              explanation="Very likely (99.45%) the average is between 50 and 60"
            />
          </StepByStepCalculation>
        </div>

        {/* Example 2: Blood Pressure */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-teal-400 mb-4">Example 2: Blood Pressure Study</h3>
          <div className="bg-neutral-900 rounded-lg p-6 mb-4">
            <p className="text-neutral-300 mb-4">
              Systolic blood pressure readings for women aged 35-40 have mean 122.6 mm Hg and 
              standard deviation 11 mm Hg. For a sample of 25 women, what is the probability 
              that the average blood pressure is greater than 125 mm Hg?
            </p>
          </div>
          
          <StepByStepCalculation>
            <CalculationStep
              stepNumber={1}
              title="Apply CLT"
              description="Sample mean distribution"
              formula={`\\bar{X} \\sim N\\left(122.6, \\frac{121}{25}\\right)`}
              explanation="n = 25, μ = 122.6, σ² = 121"
            />
            <CalculationStep
              stepNumber={2}
              title="Standardize"
              description="Convert to Z-score"
              formula={`Z = \\frac{125 - 122.6}{11/\\sqrt{25}} = \\frac{2.4}{2.2} = 1.09`}
              explanation="Standard error = 11/5 = 2.2"
            />
            <CalculationStep
              stepNumber={3}
              title="Find Probability"
              description="Use standard normal table"
              formula={`P(\\bar{X} > 125) = P(Z > 1.09) = 0.1378`}
              explanation="About 13.78% chance the average exceeds 125 mm Hg"
            />
          </StepByStepCalculation>
        </div>
      </div>

      {/* Multiple Choice Questions */}
      <QuizBreak 
        questions={[
          {
            question: "As the sample size increases, what happens to the sampling distribution of the mean?",
            options: [
              "The distribution becomes more skewed",
              "The variance increases",
              "The distribution approaches normal with smaller variance",
              "The mean changes"
            ],
            correctIndex: 2,
            explanation: "As sample size increases, the CLT tells us the sampling distribution approaches normal with variance σ²/n, which decreases as n increases."
          },
          {
            question: "The CLT states that the sampling distribution of the mean approaches normal when:",
            options: [
              "The population is normal",
              "The sample size is large (typically n ≥ 30)",
              "The population variance is known",
              "The data is discrete"
            ],
            correctIndex: 1,
            explanation: "The CLT requires a sufficiently large sample size (typically n ≥ 30) for the sampling distribution to approximate normal, regardless of the population distribution."
          },
          {
            question: "If a population has standard deviation σ = 12 and we take samples of size n = 36, what is the standard error of the mean?",
            options: [
              "12",
              "6",
              "2",
              "0.33"
            ],
            correctIndex: 2,
            explanation: "Standard Error = σ/√n = 12/√36 = 12/6 = 2"
          }
        ]}
      />

      {/* Key Insights and Interpretations */}
      <InterpretationBox title="Understanding CLT in Practice">
        <StepInterpretation
          step="Why n ≥ 30?"
          interpretation="The rule of thumb n ≥ 30 comes from empirical observation that for most distributions, this sample size provides a good normal approximation. However, for highly skewed distributions, you may need larger samples."
        />
        <StepInterpretation
          step="Effect on Variance"
          interpretation="The variance of the sample mean is σ²/n, which decreases as n increases. This means larger samples give more precise estimates of the population mean."
        />
        <StepInterpretation
          step="Real-world Impact"
          interpretation="CLT justifies using normal-based methods (like t-tests and confidence intervals) even when the underlying data isn't normally distributed, which is why it's so fundamental to statistics."
        />
      </InterpretationBox>

      {/* Comparison Table */}
      <SimpleComparisonTable
        title="CLT Requirements vs Applications"
        data={[
          {
            aspect: "Sample Size",
            requirement: "n ≥ 30 (general rule)",
            application: "Quality control with 50 measurements per batch"
          },
          {
            aspect: "Independence",
            requirement: "Observations must be independent",
            application: "Random sampling without replacement (< 10% of population)"
          },
          {
            aspect: "Finite Variance",
            requirement: "Population variance must be finite",
            application: "Most real-world measurements (excludes Cauchy distribution)"
          },
          {
            aspect: "Distribution Shape",
            requirement: "Any distribution (with finite variance)",
            application: "Works for exponential, uniform, binomial, etc."
          }
        ]}
      />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-neutral-800 rounded-lg p-4 border border-blue-600/30">
          <h4 className="font-semibold text-yellow-400 mb-2">Beyond Sample Means</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            CLT applies to other statistics too: sample variance follows χ² distribution, 
            differences of means, and more.
          </p>
        </div>
        <div className="bg-neutral-800 rounded-lg p-4 border border-blue-600/30">
          <h4 className="font-semibold text-yellow-400 mb-2">Convergence Rates</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Berry-Esseen theorem gives bounds on how fast the convergence happens based on 
            the third moment.
          </p>
        </div>
        <div className="bg-neutral-800 rounded-lg p-4 border border-blue-600/30">
          <h4 className="font-semibold text-yellow-400 mb-2">Practical Impact</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            CLT justifies using normal-based inference methods even when data isn't normally 
            distributed.
          </p>
        </div>
      </div>
      </div>
    </VisualizationSection>
  );
};

export default CLTGateway;