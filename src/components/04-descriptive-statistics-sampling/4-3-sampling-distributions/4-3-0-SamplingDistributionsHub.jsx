"use client";

import React, { useState } from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import WhatAreSamplingDistributions from "./4-3-1-WhatAreSamplingDistributions";
import BuildingIntuition from "./4-3-2-BuildingIntuition";
import CentralLimitTheoremJourney from "./4-3-3-CentralLimitTheoremJourney";
import StandardErrorExplorer from "./4-3-4-StandardErrorExplorer";
import RealWorldApplications from "./4-3-5-RealWorldApplications";
import { Sparkles, Coins, TrendingUp, Calculator, Globe, ChevronLeft } from "lucide-react";

// Learning paths configuration
const learningPaths = [
  {
    id: 'what-are',
    title: 'What Are Sampling Distributions?',
    description: 'Start here! Discover why averages are magical and predictable.',
    icon: Sparkles,
    color: 'from-cyan-500 to-blue-500',
    component: WhatAreSamplingDistributions,
    difficulty: 'Beginner',
    duration: '5 min',
    concepts: ['Population vs Sample', 'Sample means', 'Why they matter']
  },
  {
    id: 'building-intuition',
    title: 'Building Intuition with Coins',
    description: 'Flip coins and watch the pattern emerge - it\'s not magic, it\'s math!',
    icon: Coins,
    color: 'from-yellow-500 to-amber-500',
    component: BuildingIntuition,
    difficulty: 'Beginner',
    duration: '10 min',
    concepts: ['Coin flips', 'Averages of averages', 'Pattern recognition']
  },
  {
    id: 'clt-journey',
    title: 'Central Limit Theorem Journey',
    description: 'Experience the most important theorem in statistics through interactive exploration.',
    icon: TrendingUp,
    color: 'from-violet-500 to-purple-500',
    component: CentralLimitTheoremJourney,
    difficulty: 'Intermediate',
    duration: '15 min',
    concepts: ['CLT visualization', 'Sample size effects', 'Normal distribution emergence']
  },
  {
    id: 'standard-error',
    title: 'Mastering Standard Error',
    description: 'Learn how sample size affects precision with interactive formulas.',
    icon: Calculator,
    color: 'from-emerald-500 to-teal-500',
    component: StandardErrorExplorer,
    difficulty: 'Intermediate',
    duration: '12 min',
    concepts: ['SE formula', 'n vs precision', 'Confidence intervals preview']
  },
  {
    id: 'real-world',
    title: 'Real-World Applications',
    description: 'Apply your knowledge to polling, quality control, and A/B testing.',
    icon: Globe,
    color: 'from-rose-500 to-pink-500',
    component: RealWorldApplications,
    difficulty: 'Advanced',
    duration: '20 min',
    concepts: ['Opinion polls', 'Quality control', 'A/B testing']
  }
];

const SamplingDistributionsHub = () => {
  const [selectedPath, setSelectedPath] = useState(null);
  
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
      title="4.3 Sampling Distributions Hub"
      description="Discover the magic of averages and the Central Limit Theorem"
    >
      {/* Introduction */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-600/30">
        <h2 className="text-xl font-semibold mb-3 text-blue-400">Welcome to Sampling Distributions!</h2>
        <p className="text-gray-300 mb-4">
          Sampling distributions are one of the most powerful concepts in statistics. They explain why we can 
          make predictions about entire populations just by looking at samples, and why averages behave so 
          predictably. This journey will transform how you think about data and uncertainty.
        </p>
        
        {/* Key concepts preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">🎯</span>
            <div>
              <strong className="text-cyan-300">Start Simple:</strong> Understand what sampling distributions are
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-violet-400">🪙</span>
            <div>
              <strong className="text-violet-300">Build Intuition:</strong> See patterns emerge from randomness
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">📊</span>
            <div>
              <strong className="text-emerald-300">Master CLT:</strong> The theorem that powers all statistics
            </div>
          </div>
        </div>
      </div>
      
      {/* Learning path cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      path.difficulty === 'Beginner' && "bg-green-900/50 text-green-400",
                      path.difficulty === 'Intermediate' && "bg-blue-900/50 text-blue-400",
                      path.difficulty === 'Advanced' && "bg-purple-900/50 text-purple-400"
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
                    Start Learning
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
            <h4 className="font-medium text-cyan-400">Core Concepts</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>Why sample means cluster around the population mean</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>The Central Limit Theorem and its universal power</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>Standard error formula: SE = σ/√n and its implications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>When and why sample means become normally distributed</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-violet-400">Practical Skills</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Calculating standard errors for real-world problems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Determining required sample sizes for desired precision</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Understanding polling margins of error</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Applying CLT to quality control and A/B testing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Quick tip */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong className="text-blue-400">💡 Pro Tip:</strong> The magic number 30 is often cited as when 
          the CLT "kicks in," but this depends on how skewed your population is. For symmetric distributions, 
          even n=10 can be enough. For highly skewed distributions, you might need n=100 or more!
        </p>
      </div>
    </VisualizationContainer>
  );
};

export default SamplingDistributionsHub;