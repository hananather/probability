"use client";

import React, { useState } from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import IntroductionToDescriptiveStats from "./4-1-1-IntroductionToDescriptiveStats";
import TypesOfData from "./4-1-2-TypesOfData";
import WhySummarizeData from "./4-1-3-WhySummarizeData";
import OverviewOfMeasures from "./4-1-4-OverviewOfMeasures";
import { BookOpen, Database, Target, Layers, ChevronLeft } from "lucide-react";

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
      {/* Introduction */}
      <div className="mb-8 p-6 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-lg border border-emerald-600/30">
        <h2 className="text-xl font-semibold mb-3 text-emerald-400">Welcome to Descriptive Statistics!</h2>
        <p className="text-gray-300 mb-4">
          Before diving into calculations and formulas, let's understand the fundamental concepts. 
          Descriptive statistics are the foundation of all data analysis - they help us transform 
          raw data into meaningful insights. This introduction will prepare you for the journey ahead.
        </p>
        
        {/* Key concepts preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">📊</span>
            <div>
              <strong className="text-emerald-300">Foundation:</strong> What and why
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-teal-400">📈</span>
            <div>
              <strong className="text-teal-300">Data Types:</strong> Know your data
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400">🎯</span>
            <div>
              <strong className="text-cyan-300">Overview:</strong> The big picture
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