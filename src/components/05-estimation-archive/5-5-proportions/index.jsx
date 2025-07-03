'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  Vote, 
  FlaskConical, 
  BarChart3, 
  Calculator,
  Users,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowRight
} from 'lucide-react';

// Pink gradient theme
const theme = {
  gradient: 'from-pink-500 to-rose-500',
  primaryGradient: 'bg-gradient-to-r from-pink-500 to-rose-500',
  subtleGradient: 'bg-gradient-to-br from-pink-900/20 to-rose-900/20',
  borderColor: 'border-pink-500/30',
  textAccent: 'text-pink-400',
  hoverBorder: 'hover:border-pink-500/50'
};

const ProportionConfidenceIntervalsHub = () => {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className={theme.primaryGradient + ' bg-clip-text text-transparent'}>
              Proportion Confidence Intervals
            </span>
          </h1>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            Yes/No Questions, Precise Answers
          </p>
        </div>

        {/* Welcome Section */}
        <div className={cn(
          "rounded-2xl p-8 mb-12",
          theme.subtleGradient,
          "border",
          theme.borderColor
        )}>
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-lg",
              theme.primaryGradient
            )}>
              <Vote className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-3">Master Proportion Estimation</h2>
              <p className="text-neutral-300 mb-4">
                From election polls to quality control, proportion confidence intervals help us estimate 
                population percentages from sample data. Learn when margins of error matter most and 
                how to choose the right method for your data.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <Vote className="w-5 h-5 text-pink-400" />
                  <span className="text-sm text-neutral-300">Election Polling</span>
                </div>
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-5 h-5 text-pink-400" />
                  <span className="text-sm text-neutral-300">A/B Testing</span>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-pink-400" />
                  <span className="text-sm text-neutral-300">Quality Control</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Path Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Proportion CI Fundamentals */}
          <Link 
            href="/chapter5/proportions/1-ProportionConfidenceIntervals"
            className={cn(
              "group rounded-xl p-6 transition-all duration-300",
              "bg-neutral-800 hover:bg-neutral-750",
              "border-2 border-transparent",
              theme.hoverBorder,
              "transform hover:scale-[1.02]"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-lg",
                theme.subtleGradient,
                "border",
                theme.borderColor,
                "group-hover:scale-110 transition-transform"
              )}>
                <BarChart3 className="w-6 h-6 text-pink-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-pink-400 transition-colors">
                  Proportion Confidence Intervals
                </h3>
                <p className="text-neutral-400 text-sm mb-4">
                  Build confidence intervals for proportions using the normal approximation. 
                  Explore how sample size affects margin of error and when the approximation is valid.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Interactive polling simulation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Step-by-step calculations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Normal approximation conditions</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-pink-400 font-medium">
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Proportion Estimation Studio */}
          <Link 
            href="/chapter5/proportions/2-ProportionEstimationStudio"
            className={cn(
              "group rounded-xl p-6 transition-all duration-300",
              "bg-neutral-800 hover:bg-neutral-750",
              "border-2 border-transparent",
              theme.hoverBorder,
              "transform hover:scale-[1.02]"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-lg",
                theme.subtleGradient,
                "border",
                theme.borderColor,
                "group-hover:scale-110 transition-transform"
              )}>
                <Calculator className="w-6 h-6 text-pink-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2 group-hover:text-pink-400 transition-colors">
                  Proportion Estimation Studio
                </h3>
                <p className="text-neutral-400 text-sm mb-4">
                  Apply proportion CIs to real-world scenarios. Compare different methods 
                  (Wald, Wilson, Agresti-Coull) and see when each performs best.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Three real-world scenarios</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Method comparison visualization</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Sample size calculator</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-pink-400 font-medium">
                  Explore Studio
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Method Comparison Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            CI Method Comparison
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Wald Method */}
            <div className={cn(
              "rounded-xl p-6",
              "bg-neutral-800",
              "border",
              "border-neutral-700"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <h3 className="text-lg font-bold">Wald Method</h3>
              </div>
              <p className="text-sm text-neutral-400 mb-4">
                The simplest and most commonly taught method. Uses the normal approximation directly.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span className="text-neutral-300">Simple to calculate</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span className="text-neutral-300">Good for p near 0.5</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span className="text-neutral-300">Can give impossible values near 0 or 1</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-neutral-900 rounded-lg">
                <code className="text-xs text-pink-400">
                  p̂ ± z√(p̂(1-p̂)/n)
                </code>
              </div>
            </div>

            {/* Wilson Method */}
            <div className={cn(
              "rounded-xl p-6",
              theme.subtleGradient,
              "border-2",
              theme.borderColor,
              "relative"
            )}>
              <div className="absolute -top-3 -right-3 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                Recommended
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <h3 className="text-lg font-bold">Wilson Method</h3>
              </div>
              <p className="text-sm text-neutral-400 mb-4">
                Score interval method with better coverage properties, especially for extreme proportions.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span className="text-neutral-300">Always gives valid intervals</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span className="text-neutral-300">Good for all p values</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span className="text-neutral-300">Better coverage than Wald</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-neutral-900/50 rounded-lg">
                <code className="text-xs text-pink-400">
                  Score-based interval
                </code>
              </div>
            </div>

            {/* Agresti-Coull Method */}
            <div className={cn(
              "rounded-xl p-6",
              "bg-neutral-800",
              "border",
              "border-neutral-700"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <h3 className="text-lg font-bold">Agresti-Coull</h3>
              </div>
              <p className="text-sm text-neutral-400 mb-4">
                Adds 2 successes and 2 failures before calculating. Simple and effective.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span className="text-neutral-300">Easy to implement</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span className="text-neutral-300">Good alternative to Wilson</span>
                </div>
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                  <span className="text-neutral-300">Uses adjusted counts</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-neutral-900 rounded-lg">
                <code className="text-xs text-pink-400">
                  p̃ ± z√(p̃(1-p̃)/ñ)
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Election Polling Example */}
        <div className={cn(
          "rounded-2xl p-8 mb-12",
          "bg-gradient-to-br from-blue-900/20 to-red-900/20",
          "border border-purple-500/30"
        )}>
          <div className="flex items-start gap-4">
            <Vote className="w-10 h-10 text-purple-400 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-4">Election Polling in Action</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">Understanding Polls</h3>
                  <ul className="space-y-2 text-sm text-neutral-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>A poll showing 52% ± 3% means the 95% CI is [49%, 55%]</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Margin of error typically assumes 95% confidence level</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>Sample size of ~1,000 gives ±3% margin for most polls</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-400">Common Misconceptions</h3>
                  <ul className="space-y-2 text-sm text-neutral-300">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✗</span>
                      <span>Margin of error is NOT the maximum possible error</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✗</span>
                      <span>Polls don't account for systematic biases</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-1">✗</span>
                      <span>Overlapping CIs don't mean "statistical tie"</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-World Applications */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Real-World Applications</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
              <Users className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="font-semibold mb-2">Market Research</h3>
              <p className="text-sm text-neutral-400">
                Estimate brand awareness, customer satisfaction rates
              </p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
              <Package className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="font-semibold mb-2">Manufacturing</h3>
              <p className="text-sm text-neutral-400">
                Monitor defect rates, acceptance sampling
              </p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
              <FlaskConical className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="font-semibold mb-2">Medicine</h3>
              <p className="text-sm text-neutral-400">
                Clinical trial success rates, disease prevalence
              </p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
              <TrendingUp className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="font-semibold mb-2">Digital Marketing</h3>
              <p className="text-sm text-neutral-400">
                Click-through rates, conversion optimization
              </p>
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className={cn(
          "rounded-xl p-6 mb-12",
          "bg-gradient-to-r from-pink-900/20 to-purple-900/20",
          "border border-pink-500/30"
        )}>
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-pink-400 mt-1" />
            <div>
              <h3 className="text-lg font-bold mb-2">Pro Tip: Sample Size for Proportions</h3>
              <p className="text-neutral-300 mb-3">
                When planning a study for proportions, remember the "worst case" scenario for sample size 
                occurs when p = 0.5. This gives the maximum variance and requires the largest sample.
              </p>
              <div className="bg-neutral-800/50 rounded-lg p-4 mt-3">
                <p className="text-sm font-mono text-pink-400">
                  For 95% CI with ±3% margin: n = (1.96²)(0.5)(0.5) / 0.03² ≈ 1,067
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Common Pitfalls */}
        <div className="bg-red-900/20 rounded-xl p-6 border border-red-500/30">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            Common Pitfalls in Proportion CIs
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-red-400">Technical Issues</h4>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li>• Using Wald method for small samples or extreme proportions</li>
                <li>• Ignoring finite population correction for small populations</li>
                <li>• Not checking normal approximation conditions</li>
                <li>• Confusing standard error with margin of error</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-red-400">Interpretation Errors</h4>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li>• Treating CI as probability for the parameter</li>
                <li>• Ignoring non-sampling errors (bias, non-response)</li>
                <li>• Over-interpreting small differences</li>
                <li>• Assuming CI captures all uncertainty</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProportionConfidenceIntervalsHub;