"use client";

import React, { useState } from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { BayesianInference } from "./5-1-1-BayesianInference";
import StatisticalInferenceOverview from "./5-1-2-StatisticalInferenceOverview";
import InteractiveInferenceJourney from "./5-1-3-InteractiveInferenceJourney";
import PointEstimation from "./5-1-4-PointEstimation";
import { Brain, Activity, Target, Sparkles, ChevronLeft } from "lucide-react";

// Learning paths configuration with emerald/green theme
const learningPaths = [
  {
    id: 'overview',
    title: 'Population to Sample',
    description: 'Start here! Understand how we make inferences from samples to populations.',
    icon: Sparkles,
    color: 'from-emerald-500 to-green-500',
    component: StatisticalInferenceOverview,
    difficulty: 'Beginner',
    duration: '5-10 min',
    concepts: ['Population vs Sample', 'Parameters vs Statistics', 'Sampling variability']
  },
  {
    id: 'journey',
    title: 'Interactive Journey',
    description: 'Watch the Central Limit Theorem come to life through animated sampling.',
    icon: Activity,
    color: 'from-green-500 to-teal-500', 
    component: InteractiveInferenceJourney,
    difficulty: 'Intermediate',
    duration: '10-15 min',
    concepts: ['Sampling distribution', 'Standard error', 'Central Limit Theorem']
  },
  {
    id: 'bayesian',
    title: 'Bayesian Inference',
    description: 'Apply Bayes\' theorem to medical testing and see how beliefs update.',
    icon: Brain,
    color: 'from-teal-500 to-cyan-500',
    component: BayesianInference,
    difficulty: 'Advanced',
    duration: '15-20 min',
    concepts: ['Prior probabilities', 'Likelihood', 'Posterior updates', 'Medical testing']
  },
  {
    id: 'point',
    title: 'Point Estimation',
    description: 'Learn estimation through a fun Monte Carlo simulation of π.',
    icon: Target,
    color: 'from-cyan-500 to-emerald-500',
    component: PointEstimation,
    difficulty: 'Intermediate',
    duration: '10 min',
    concepts: ['Estimators', 'Monte Carlo methods', 'Unbiased estimation']
  }
];

const StatisticalInferenceHub = () => {
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
      title="5.1 Statistical Inference Hub"
      description="From Data to Decisions: Master the foundations of statistical inference"
    >
      {/* Introduction with emerald theme */}
      <div className="mb-8 p-6 bg-gradient-to-r from-emerald-900/20 to-green-900/20 rounded-lg border border-emerald-600/30">
        <h2 className="text-xl font-semibold mb-3 text-emerald-400">Welcome to Statistical Inference!</h2>
        <p className="text-gray-300 mb-4">
          Statistical inference is the cornerstone of data-driven decision making. It allows us to draw 
          conclusions about entire populations based on sample data. From medical testing to quality control, 
          these techniques power critical decisions every day.
        </p>
        
        {/* Why it matters - real world examples */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">🏥</span>
            <div>
              <strong className="text-emerald-300">Medical Testing:</strong> How accurate is that COVID test?
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400">📊</span>
            <div>
              <strong className="text-green-300">Quality Control:</strong> Are products meeting standards?
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-teal-400">🗳️</span>
            <div>
              <strong className="text-teal-300">Polling:</strong> What can 1,000 people tell us about millions?
            </div>
          </div>
        </div>
      </div>
      
      {/* Learning path cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <h4 className="font-medium text-emerald-400">Core Concepts</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>The fundamental difference between populations and samples</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>How sample statistics estimate population parameters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>The Central Limit Theorem and its magical properties</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Bayesian vs Frequentist approaches to inference</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-green-400">Practical Skills</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Calculate and interpret standard errors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Update beliefs using Bayes' theorem</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Design effective sampling strategies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>Choose appropriate estimators for your data</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Decision framework */}
      <div className="mt-6 p-6 bg-gradient-to-r from-green-900/20 to-teal-900/20 rounded-lg border border-green-600/30">
        <h3 className="text-lg font-semibold mb-3 text-green-400">Decision-Making Framework</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-gray-800/50 rounded">
            <h4 className="font-medium text-emerald-400 mb-2">1. Define Your Question</h4>
            <p className="text-gray-300">What parameter are you trying to estimate? What decision needs to be made?</p>
          </div>
          <div className="p-3 bg-gray-800/50 rounded">
            <h4 className="font-medium text-green-400 mb-2">2. Choose Your Method</h4>
            <p className="text-gray-300">Frequentist for repeated sampling, Bayesian for incorporating prior knowledge.</p>
          </div>
          <div className="p-3 bg-gray-800/50 rounded">
            <h4 className="font-medium text-teal-400 mb-2">3. Quantify Uncertainty</h4>
            <p className="text-gray-300">Always report confidence intervals or credible regions with your estimates.</p>
          </div>
        </div>
      </div>
      
      {/* Pro tip */}
      <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-600/30 rounded-lg">
        <p className="text-sm text-emerald-300">
          <strong className="text-emerald-400">💡 Pro Tip:</strong> The choice between Bayesian and Frequentist 
          methods often depends on your context. Use Bayesian when you have strong prior information (like in 
          medical diagnosis), and Frequentist when you want to let the data speak for itself. Both are powerful 
          tools in your statistical toolkit!
        </p>
      </div>
    </VisualizationContainer>
  );
};

export default StatisticalInferenceHub;