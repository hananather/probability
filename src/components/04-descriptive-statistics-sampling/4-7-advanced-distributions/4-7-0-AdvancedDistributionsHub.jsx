"use client";

import React, { useState } from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import FDistributionIntro from "./4-7-1-FDistributionIntro";
import FDistributionExplorer from "./4-7-2-FDistributionExplorer";
import FDistributionJourney from "./4-7-3-FDistributionJourney";
import FDistributionWorkedExample from "./4-7-4-FDistributionWorkedExample";
import FDistributionAdvanced from "./4-7-5-FDistributionMasterclass";
import { GitBranch, FlaskConical, BookOpen, Calculator, GraduationCap, ChevronLeft } from "lucide-react";

// Learning paths configuration
const learningPaths = [
  {
    id: 'intro',
    title: '1. F-Distribution Introduction',
    description: 'Start here! Understand when and why we need the F-distribution.',
    icon: GitBranch,
    color: 'from-red-500 to-orange-500',
    component: FDistributionIntro,
    difficulty: 'Intermediate',
    duration: '10 min',
    concepts: ['What is F-distribution', 'Variance ratios', 'Degrees of freedom', 'Applications']
  },
  {
    id: 'explorer',
    title: '2. F-Distribution Explorer',
    description: 'Interactively explore how the F-distribution changes with different parameters.',
    icon: FlaskConical,
    color: 'from-orange-500 to-amber-500',
    component: FDistributionExplorer,
    difficulty: 'Intermediate',
    duration: '12 min',
    concepts: ['Shape changes', 'Parameter effects', 'Visual patterns', 'Critical values']
  },
  {
    id: 'journey',
    title: '3. Interactive Journey',
    description: 'Take a guided journey through F-distribution applications.',
    icon: BookOpen,
    color: 'from-amber-500 to-yellow-500',
    component: FDistributionJourney,
    difficulty: 'Intermediate',
    duration: '15 min',
    concepts: ['ANOVA basics', 'Variance testing', 'Model comparison', 'Practical uses']
  },
  {
    id: 'worked',
    title: '4. Worked Examples',
    description: 'Step-by-step solutions to real F-distribution problems.',
    icon: Calculator,
    color: 'from-yellow-500 to-lime-500',
    component: FDistributionWorkedExample,
    difficulty: 'Advanced',
    duration: '20 min',
    concepts: ['Problem solving', 'Calculations', 'Interpretation', 'Real scenarios']
  },
  {
    id: 'masterclass',
    title: '5. F-Distribution Advanced Topics',
    description: 'Advanced topics and deep insights into the F-distribution.',
    icon: GraduationCap,
    color: 'from-lime-500 to-green-500',
    component: FDistributionAdvanced,
    difficulty: 'Advanced',
    duration: '25 min',
    concepts: ['Theoretical depth', 'Connections to chi-square', 'Advanced applications', 'Research uses']
  }
];

const AdvancedDistributionsHub = () => {
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
      title="4.7 Advanced Distributions"
      description="t, F, and chi-square distributions for real-world inference"
    >
      <div className="mb-8 p-6 bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg border border-red-600/30">
        <h2 className="text-xl font-semibold mb-3 text-red-400">Beyond the Normal Distribution</h2>
        <p className="text-gray-300 mb-4">
          When population parameters are unknown, we need specialized distributions. The t-distribution 
          handles small samples, the F-distribution compares variances, and the chi-square tests 
          categorical data. These distributions are essential for real-world statistical inference.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
          <div className="p-3 bg-red-900/30 rounded-lg border border-red-600/30">
            <strong className="text-red-400">t-Distribution:</strong>
            <p className="text-gray-400 text-xs mt-1">Small samples, unknown σ</p>
          </div>
          <div className="p-3 bg-orange-900/30 rounded-lg border border-orange-600/30">
            <strong className="text-orange-400">F-Distribution:</strong>
            <p className="text-gray-400 text-xs mt-1">Variance ratios, ANOVA</p>
          </div>
          <div className="p-3 bg-amber-900/30 rounded-lg border border-amber-600/30">
            <strong className="text-amber-400">Chi-Square:</strong>
            <p className="text-gray-400 text-xs mt-1">Categorical data, goodness-of-fit</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    path.difficulty === 'Intermediate' && "bg-blue-900/50 text-blue-400",
                    path.difficulty === 'Advanced' && "bg-purple-900/50 text-purple-400"
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
      
      <div className="mt-6 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
        <p className="text-sm text-red-300">
          <strong className="text-red-400">Note:</strong> These distributions form the backbone of 
          hypothesis testing and ANOVA. Master them to unlock advanced statistical analysis!
        </p>
      </div>
    </VisualizationContainer>
  );
};

export default AdvancedDistributionsHub;