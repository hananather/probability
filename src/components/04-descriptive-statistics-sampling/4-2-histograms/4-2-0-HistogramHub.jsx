"use client";

import React, { useState } from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import HistogramIntuitiveIntro from "./4-2-1-HistogramIntuitiveIntro";
import HistogramInteractiveJourney from "./4-2-2-HistogramInteractiveJourney";
import HistogramShapeAnalysis from "./4-2-3-HistogramShapeAnalysis";
import { Sparkles, Calculator, BarChart3, ChevronLeft } from "lucide-react";

// Learning paths configuration
const learningPaths = [
  {
    id: 'intro',
    title: 'Intuitive Introduction',
    description: 'Start here! See why we need histograms through animated examples.',
    icon: Sparkles,
    color: 'from-cyan-500 to-blue-500',
    component: HistogramIntuitiveIntro,
    difficulty: 'Beginner',
    duration: '5 min',
    concepts: ['What are bins?', 'Why group data?', 'Visual patterns']
  },
  {
    id: 'journey',
    title: 'Finding Optimal Bins',
    description: 'Learn the square root rule for choosing the perfect number of bins.',
    icon: Calculator,
    color: 'from-violet-500 to-purple-500', 
    component: HistogramInteractiveJourney,
    difficulty: 'Intermediate',
    duration: '10 min',
    concepts: ['Square root rule', 'k = √n formula', 'Bin optimization']
  },
  {
    id: 'shapes',
    title: 'Shape Recognition',
    description: 'Master different distribution shapes and their real-world meanings.',
    icon: BarChart3,
    color: 'from-emerald-500 to-teal-500',
    component: HistogramShapeAnalysis,
    difficulty: 'Advanced',
    duration: '15 min',
    concepts: ['Normal distribution', 'Skewness', 'Real-world patterns']
  }
];

const HistogramHub = () => {
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
      title="4.2 Visual Summaries Hub"
      description="Learn about histograms, shapes of datasets, skewness, and dispersion measures"
    >
      {/* Introduction */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-600/30">
        <h2 className="text-xl font-semibold mb-3 text-blue-400">Welcome to Visual Summaries!</h2>
        <p className="text-gray-300 mb-4">
          Visual summaries are essential tools for understanding data distributions. Learn how histograms 
          help us see patterns, identify skewness, and understand the shape of datasets. This journey covers 
          visualization techniques and dispersion measures.
        </p>
        
        {/* Key concepts preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">📊</span>
            <div>
              <strong className="text-cyan-300">Beginners:</strong> Start with the Intuitive Introduction
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-violet-400">📐</span>
            <div>
              <strong className="text-violet-300">Learn the Rule:</strong> Discover the √n formula
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400"></span>
            <div>
              <strong className="text-emerald-300">Master Shapes:</strong> Identify real-world patterns
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
                <span>Understanding what histograms are and why we use them</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>The square root rule: k = √n for optimal bin count</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>How bin width relates to range and number of bins</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>Reading and interpreting histogram shapes</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-violet-400">Practical Skills</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Choosing appropriate bin counts for your data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Identifying normal, skewed, and bimodal distributions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Connecting histogram patterns to real-world phenomena</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500 mt-1">•</span>
                <span>Avoiding common pitfalls in histogram creation</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Quick tip */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong className="text-blue-400">Pro Tip:</strong> The square root rule (k = √n) is a great 
          starting point, but always look at your histogram and adjust if needed. The goal is to reveal 
          the underlying pattern without creating too much noise or losing important details.
        </p>
      </div>
    </VisualizationContainer>
  );
};

export default HistogramHub;