"use client";

import React, { useState } from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import IntroductionToDescriptiveStats from "./4-1-1-IntroductionToDescriptiveStats";
import TypesOfData from "./4-1-2-TypesOfData";
import WhySummarizeData from "./4-1-3-WhySummarizeData";
import OverviewOfMeasures from "./4-1-4-OverviewOfMeasures";
import { BookOpen, Database, Target, Layers, ChevronLeft, Link, TrendingUp, AlertTriangle, Lightbulb, Calculator, History, Users, Brain, X } from "lucide-react";
import { Card } from "@/components/ui/card";

// Learning paths configuration for Introduction to Descriptive Statistics
const learningPaths = [
  {
    id: 'intro',
    title: '1. What Are Descriptive Statistics?',
    description: 'Start here! Understand what descriptive statistics are and their role in data analysis.',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-500',
    component: IntroductionToDescriptiveStats,
    difficulty: 'Beginner',
    duration: '5 min',
    concepts: ['Definition', 'Purpose', 'Real-world applications']
  },
  {
    id: 'types',
    title: '2. Types of Data',
    description: 'Learn to distinguish between categorical and numerical data, and why it matters.',
    icon: Database,
    color: 'from-blue-500 to-indigo-500',
    component: TypesOfData,
    difficulty: 'Beginner',
    duration: '8 min',
    concepts: ['Categorical data', 'Numerical data', 'Discrete vs continuous']
  },
  {
    id: 'why',
    title: '3. Why Summarize Data?',
    description: 'Discover why we need to summarize data and the insights it provides.',
    icon: Target,
    color: 'from-violet-500 to-purple-500',
    component: WhySummarizeData,
    difficulty: 'Beginner',
    duration: '7 min',
    concepts: ['Data reduction', 'Pattern recognition', 'Decision making']
  },
  {
    id: 'overview',
    title: '4. Overview of Statistical Measures',
    description: 'Get a birds-eye view of all the measures we\'ll learn in this chapter.',
    icon: Layers,
    color: 'from-orange-500 to-red-500',
    component: OverviewOfMeasures,
    difficulty: 'Beginner',
    duration: '10 min',
    concepts: ['Central tendency', 'Variability', 'Shape', 'Position']
  }
];

const IntroductionHub = () => {
  const [selectedPath, setSelectedPath] = useState(null);
  const [showPrerequisites, setShowPrerequisites] = useState(false);
  const [showCaseStudies, setShowCaseStudies] = useState(false);
  
  // If a path is selected, show that component
  if (selectedPath) {
    const SelectedComponent = selectedPath.component;
    return (
      <div>
        <div className="mb-4">
          <Button
            onClick={() => setSelectedPath(null)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Learning Paths
          </Button>
        </div>
        <SelectedComponent />
      </div>
    );
  }
  
  // Otherwise show the path selector
  return (
    <VisualizationContainer
      title="4.1 Introduction to Descriptive Statistics"
      description="Your journey into understanding and summarizing data begins here"
    >
      {/* Enhanced Introduction with Prerequisites Bridge */}
      <div className="mb-8 p-6 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-lg border border-emerald-600/30">
        <h2 className="text-xl font-semibold mb-3 text-emerald-400">Welcome to Descriptive Statistics!</h2>
        <p className="text-gray-300 mb-4">
          <strong>The Journey So Far:</strong> In Chapters 1-3, you mastered probability theory, random variables, 
          and theoretical distributions. Now we shift from theory to practice - from probability to data. 
          While probability asks "What might happen?", statistics asks "What did happen?"
        </p>
        <p className="text-gray-300 mb-4">
          <strong>The Big Picture:</strong> Descriptive statistics are the foundation of all data analysis. 
          They transform overwhelming raw data into digestible insights. Every data scientist, researcher, 
          and analyst begins here - learning to summarize, visualize, and understand data before making 
          inferences or predictions.
        </p>
        <p className="text-gray-400 text-sm">
          <strong>What You'll Master:</strong> By the end of this chapter, you'll confidently analyze real 
          datasets, choose appropriate statistical measures, and extract meaningful patterns from chaos. 
          These skills form the bedrock of data science, research, and evidence-based decision making.
        </p>
        
        {/* Key concepts preview - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">📊</span>
            <div>
              <strong className="text-emerald-300">Foundation:</strong> Population vs Sample
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-teal-400">📈</span>
            <div>
              <strong className="text-teal-300">Data Types:</strong> Categorical vs Numerical
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">🎯</span>
            <div>
              <strong className="text-cyan-300">Measures:</strong> Center, Spread, Position
            </div>
          </div>
        </div>
      </div>
      
      {/* New: Prerequisites Bridge Section */}
      <div className="mb-8">
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Link className="w-5 h-5 text-blue-400" />
            Prerequisites Bridge: Connecting to Previous Chapters
          </h3>
          
          <Button
            onClick={() => setShowPrerequisites(!showPrerequisites)}
            variant="outline"
            className="mb-4"
          >
            {showPrerequisites ? "Hide" : "Show"} Prerequisites Review
          </Button>
          
          {showPrerequisites && (
            <div className="space-y-4">
              {/* From Chapter 2 */}
              <div className="p-4 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg border border-blue-600/30">
                <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  From Chapter 2: Random Variables to Data
                </h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>
                    <strong>Then:</strong> You learned E[X] = Σ x·P(X=x) for theoretical expected value.
                  </p>
                  <p>
                    <strong>Now:</strong> Sample mean x̄ = (1/n)Σxᵢ estimates E[X] from actual data.
                  </p>
                  <p>
                    <strong>Connection:</strong> As n→∞, x̄ → E[X] by the Law of Large Numbers.
                  </p>
                  <div className="mt-2 p-2 bg-blue-900/10 rounded text-xs">
                    <strong>Key Insight:</strong> Sample statistics (x̄, s²) estimate population parameters (μ, σ²)
                  </div>
                </div>
              </div>
              
              {/* From Chapter 3 */}
              <div className="p-4 bg-gradient-to-r from-violet-900/20 to-purple-900/20 rounded-lg border border-violet-600/30">
                <h4 className="font-medium text-violet-400 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  From Chapter 3: Distributions to Real Data
                </h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>
                    <strong>Then:</strong> Normal distribution N(μ, σ²) as theoretical model.
                  </p>
                  <p>
                    <strong>Now:</strong> Check if real data follows normal distribution.
                  </p>
                  <p>
                    <strong>Tools:</strong> Histograms reveal distribution shape, Q-Q plots test normality.
                  </p>
                  <div className="mt-2 p-2 bg-violet-900/10 rounded text-xs">
                    <strong>Key Insight:</strong> Real data often approximates theoretical distributions
                  </div>
                </div>
              </div>
              
              {/* Mathematical Notation Review */}
              <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-lg border border-emerald-600/30">
                <h4 className="font-medium text-emerald-400 mb-2">Essential Notation Review</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-2 bg-gray-900/50 rounded">
                    <span className="font-mono text-emerald-300">Σ</span>
                    <p className="text-gray-400 mt-1">Summation: add all values</p>
                  </div>
                  <div className="p-2 bg-gray-900/50 rounded">
                    <span className="font-mono text-emerald-300">μ, σ²</span>
                    <p className="text-gray-400 mt-1">Population mean, variance</p>
                  </div>
                  <div className="p-2 bg-gray-900/50 rounded">
                    <span className="font-mono text-emerald-300">x̄, s²</span>
                    <p className="text-gray-400 mt-1">Sample mean, variance</p>
                  </div>
                  <div className="p-2 bg-gray-900/50 rounded">
                    <span className="font-mono text-emerald-300">n, N</span>
                    <p className="text-gray-400 mt-1">Sample size, population size</p>
                  </div>
                  <div className="p-2 bg-gray-900/50 rounded">
                    <span className="font-mono text-emerald-300">xᵢ</span>
                    <p className="text-gray-400 mt-1">i-th observation</p>
                  </div>
                  <div className="p-2 bg-gray-900/50 rounded">
                    <span className="font-mono text-emerald-300">∈, ℝ, ℤ</span>
                    <p className="text-gray-400 mt-1">Element of, reals, integers</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
      
      {/* New: Why Statistics Matter - Real Case Studies */}
      <div className="mb-8">
        <Card className="p-6 bg-gray-800/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Why Statistics Matter: Real-World Impact
          </h3>
          
          <Button
            onClick={() => setShowCaseStudies(!showCaseStudies)}
            variant="outline"
            className="mb-4"
          >
            {showCaseStudies ? "Hide" : "Show"} Case Studies
          </Button>
          
          {showCaseStudies && (
            <div className="space-y-4">
              {/* Case Study 1 */}
              <div className="p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg">
                <h4 className="font-medium text-orange-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  The Challenger Disaster (1986)
                </h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <p><strong>The Data:</strong> O-ring failures at different temperatures</p>
                  <p><strong>The Statistics:</strong> Engineers had data showing increased failure rates below 65°F</p>
                  <p><strong>The Tragedy:</strong> Launch at 36°F ignored statistical evidence</p>
                  <p className="text-red-300"><strong>Lesson:</strong> Proper statistical analysis could have prevented disaster</p>
                </div>
              </div>
              
              {/* Case Study 2 */}
              <div className="p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg">
                <h4 className="font-medium text-emerald-400 mb-2 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Florence Nightingale's Polar Charts (1858)
                </h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <p><strong>The Data:</strong> Soldier mortality causes in Crimean War</p>
                  <p><strong>The Statistics:</strong> Deaths from disease: 16,000 vs combat: 4,000</p>
                  <p><strong>The Impact:</strong> Statistical visualization revolutionized military hospitals</p>
                  <p className="text-emerald-300"><strong>Lesson:</strong> Statistics drive evidence-based reform</p>
                </div>
              </div>
              
              {/* Case Study 3 */}
              <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-lg">
                <h4 className="font-medium text-cyan-400 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  COVID-19 Vaccine Efficacy (2020)
                </h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <p><strong>The Data:</strong> 43,548 participants in Pfizer trial</p>
                  <p><strong>The Statistics:</strong> 95% efficacy (170 cases: 162 placebo vs 8 vaccine)</p>
                  <p><strong>The Impact:</strong> Statistical evidence enabled emergency approval</p>
                  <p className="text-cyan-300"><strong>Lesson:</strong> Statistics validate medical breakthroughs</p>
                </div>
              </div>
              
              {/* Common Misconceptions */}
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <h4 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Common Statistical Misconceptions
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-400 mt-0.5" />
                    <div>
                      <strong>"Average" always means typical:</strong> Bill Gates walks into a bar - 
                      everyone's now a millionaire on average!
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-400 mt-0.5" />
                    <div>
                      <strong>Correlation implies causation:</strong> Ice cream sales correlate with 
                      drownings (hidden variable: summer!)
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-400 mt-0.5" />
                    <div>
                      <strong>Sample size doesn't matter:</strong> Survey of 10 friends ≠ national opinion
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>
      
      {/* Learning path cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {learningPaths.map((path) => {
          const Icon = path.icon;
          return (
            <div
              key={path.id}
              className="group relative overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50 transition-all hover:border-gray-600 hover:bg-gray-800/70"
            >
              {/* Card gradient background */}
              <div className={cn(
                "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br",
                path.color
              )} />
              
              {/* Content */}
              <div className="relative p-6 space-y-4">
                {/* Icon and difficulty */}
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center",
                    path.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      path.difficulty === 'Beginner' && "bg-green-900/50 text-green-400"
                    )}>
                      {path.difficulty}
                    </span>
                  </div>
                </div>
                
                {/* Title and description */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{path.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{path.description}</p>
                </div>
                
                {/* Concepts covered */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">You'll Learn:</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {path.concepts.map((concept, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-500" />
                        {concept}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Duration and action */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500">⏱ {path.duration}</span>
                  <Button
                    onClick={() => setSelectedPath(path)}
                    size="sm"
                    className="px-4"
                  >
                    Begin
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Learning objectives summary */}
      <div className="mt-8 p-6 bg-gray-800/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Complete Learning Objectives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-emerald-400">Foundational Concepts</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Define descriptive statistics and their purpose</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Distinguish between populations and samples</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Identify different types of data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Understand when to use different measures</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-teal-400">Practical Understanding</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-1">•</span>
                <span>Recognize the need for data summarization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-1">•</span>
                <span>Connect concepts to real-world applications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-1">•</span>
                <span>Prepare for deeper statistical learning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-500 mt-1">•</span>
                <span>Build intuition for data analysis</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Quick tip */}
      <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-600/30 rounded-lg">
        <p className="text-sm text-emerald-300">
          <strong className="text-emerald-400">Learning Path:</strong> This introduction sets the stage 
          for everything that follows. Take your time to understand these concepts - they're the foundation 
          for all of descriptive statistics!
        </p>
      </div>
    </VisualizationContainer>
  );
};

export default IntroductionHub;