"use client";

import React, { useState } from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import RangeAndIQR from "./4-3-1-RangeAndIQR";
import VarianceIntroduction from "./4-3-2-VarianceIntroduction";
import StandardDeviation from "./4-3-3-StandardDeviation";
import CoefficientOfVariation from "./4-3-4-CoefficientOfVariation";
import { Activity, TrendingUp, Sigma, Percent, ChevronLeft } from "lucide-react";

// Learning paths configuration for Measures of Variability
const learningPaths = [
  {
    id: 'range-iqr',
    title: '1. Range and Interquartile Range',
    description: 'Start here! Learn the simplest measures of spread in your data.',
    icon: Activity,
    color: 'from-orange-500 to-amber-500',
    component: RangeAndIQR,
    difficulty: 'Beginner',
    duration: '10 min',
    concepts: ['Range calculation', 'Quartiles', 'IQR', 'Outlier detection']
  },
  {
    id: 'variance',
    title: '2. Understanding Variance',
    description: 'Discover how variance measures the average squared deviation from the mean.',
    icon: TrendingUp,
    color: 'from-amber-500 to-yellow-500',
    component: VarianceIntroduction,
    difficulty: 'Intermediate',
    duration: '12 min',
    concepts: ['Deviations from mean', 'Squared differences', 'Population vs sample variance']
  },
  {
    id: 'std-dev',
    title: '3. Standard Deviation',
    description: 'Master the most commonly used measure of variability.',
    icon: Sigma,
    color: 'from-yellow-500 to-lime-500',
    component: StandardDeviation,
    difficulty: 'Intermediate',
    duration: '15 min',
    concepts: ['Square root of variance', 'Empirical rule', 'Interpretation', 'Applications']
  },
  {
    id: 'cv',
    title: '4. Coefficient of Variation',
    description: 'Learn to compare variability across different datasets and scales.',
    icon: Percent,
    color: 'from-lime-500 to-green-500',
    component: CoefficientOfVariation,
    difficulty: 'Advanced',
    duration: '10 min',
    concepts: ['Relative variability', 'Scale-independent comparison', 'When to use CV']
  }
];

const VariabilityHub = () => {
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
      title="4.3 Measures of Variability"
      description="Understanding spread and dispersion in your data"
    >
      {/* Introduction */}
      <div className="mb-8 p-6 bg-gradient-to-r from-orange-900/20 to-amber-900/20 rounded-lg border border-orange-600/30">
        <h2 className="text-xl font-semibold mb-3 text-orange-400">Understanding Data Spread</h2>
        <p className="text-gray-300 mb-4">
          While measures of central tendency tell us where the center of our data lies, measures of 
          variability reveal how spread out the data points are. Two datasets can have the same mean 
          but very different spreads - understanding variability is crucial for complete data analysis.
        </p>
        
        {/* Key concepts preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-orange-400">📏</span>
            <div>
              <strong className="text-orange-300">Simple Measures:</strong> Range & IQR
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400">📊</span>
            <div>
              <strong className="text-amber-300">Core Measures:</strong> Variance & Std Dev
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400">⚖️</span>
            <div>
              <strong className="text-yellow-300">Comparison:</strong> Coefficient of Variation
            </div>
          </div>
        </div>
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
            <h4 className="font-medium text-orange-400">Core Concepts</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Calculate and interpret range and IQR</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Understand variance as average squared deviation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Master standard deviation interpretation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Apply the empirical rule (68-95-99.7)</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-amber-400">Practical Skills</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>Choose appropriate variability measures</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>Compare spreads across different datasets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>Detect outliers using IQR method</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>Interpret variability in context</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Important note */}
      <div className="mt-6 p-4 bg-orange-900/20 border border-orange-600/30 rounded-lg">
        <p className="text-sm text-orange-300">
          <strong className="text-orange-400">Key Insight:</strong> Variability measures are essential 
          partners to central tendency. The mean tells you where your data centers, but standard deviation 
          tells you how reliable that center is. Always report both!
        </p>
      </div>
    </VisualizationContainer>
  );
};

export default VariabilityHub;