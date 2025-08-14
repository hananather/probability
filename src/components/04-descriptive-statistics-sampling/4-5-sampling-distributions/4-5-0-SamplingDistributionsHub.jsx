"use client";

import React, { useState } from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import SamplingDistributionsInteractive from "./4-5-1-SamplingDistributionsInteractive";
import SamplingDistributionsTheory from "./4-5-2-SamplingDistributionsTheory";
import SamplingDistributionsVisual from "./4-5-3-SamplingDistributionsVisual";
import { TrendingUp, BookOpen, Eye, ChevronLeft } from "lucide-react";

// Learning paths configuration
const learningPaths = [
  {
    id: 'interactive',
    title: '1. Interactive Sampling Explorer',
    description: 'Start here! Build intuition by taking samples from populations and watching distributions emerge.',
    icon: TrendingUp,
    color: 'from-blue-500 to-indigo-500',
    component: SamplingDistributionsInteractive,
    difficulty: 'Beginner',
    duration: '15 min',
    concepts: ['Population vs sample', 'Sample means', 'Sampling variability', 'Distribution shape']
  },
  {
    id: 'theory',
    title: '2. Theoretical Foundations',
    description: 'Understand the mathematics behind sampling distributions and standard error.',
    icon: BookOpen,
    color: 'from-indigo-500 to-purple-500',
    component: SamplingDistributionsTheory,
    difficulty: 'Intermediate',
    duration: '12 min',
    concepts: ['Expected value', 'Standard error', 'Sample size effects', 'Mathematical properties']
  },
  {
    id: 'visual',
    title: '3. Visual Exploration',
    description: 'See sampling distributions come to life through dynamic visualizations.',
    icon: Eye,
    color: 'from-purple-500 to-pink-500',
    component: SamplingDistributionsVisual,
    difficulty: 'Intermediate',
    duration: '10 min',
    concepts: ['Distribution patterns', 'Sample size impact', 'Convergence behavior', 'Visual insights']
  }
];

const SamplingDistributionsHub = () => {
  const [selectedPath, setSelectedPath] = useState(null);
  
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
  
  return (
    <VisualizationContainer
      title="4.5 Introduction to Sampling Distributions"
      description="Bridge the gap between samples and populations"
    >
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg border border-blue-600/30">
        <h2 className="text-xl font-semibold mb-3 text-blue-400">From Samples to Populations</h2>
        <p className="text-gray-300 mb-4">
          Sampling distributions are the bridge between descriptive and inferential statistics. 
          Learn how sample statistics behave when we repeatedly sample from a population, 
          and discover why this concept is fundamental to all statistical inference.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
        {learningPaths.map((path) => {
          const Icon = path.icon;
          return (
            <div
              key={path.id}
              className="group relative overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50 transition-all hover:border-gray-600 hover:bg-gray-800/70"
            >
              <div className={cn(
                "absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br",
                path.color
              )} />
              
              <div className="relative p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center",
                    path.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    path.difficulty === 'Beginner' && "bg-green-900/50 text-green-400",
                    path.difficulty === 'Intermediate' && "bg-blue-900/50 text-blue-400"
                  )}>
                    {path.difficulty}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">{path.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{path.description}</p>
                </div>
                
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
    </VisualizationContainer>
  );
};

export default SamplingDistributionsHub;