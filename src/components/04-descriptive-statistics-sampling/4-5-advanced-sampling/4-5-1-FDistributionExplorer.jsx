"use client";

import React, { useState } from "react";
import { VisualizationContainer } from '@/components/ui/VisualizationContainer';
import { cn } from '@/lib/design-system';
import { Button } from '@/components/ui/button';
import FDistributionIntuitiveIntro from "./4-5-1-FDistributionIntuitiveIntro";
import FDistributionInteractiveJourney from "./4-5-2-FDistributionInteractiveJourney";
import FDistributionMastery from "./4-5-3-FDistributionMastery";
import { BookOpen, Compass, Trophy } from "lucide-react";

// Learning paths
const learningPaths = [
  {
    id: 'intro',
    title: 'Intuitive Introduction',
    description: 'Start here! Build intuition about comparing variances through interactive factory scenarios.',
    icon: BookOpen,
    color: 'from-cyan-500 to-blue-500',
    component: FDistributionIntuitiveIntro,
    difficulty: 'Beginner',
    duration: '5-10 min'
  },
  {
    id: 'journey',
    title: 'Interactive Journey',
    description: 'Guided exploration with step-by-step tutorials, achievements, and visual feedback.',
    icon: Compass,
    color: 'from-violet-500 to-purple-500', 
    component: FDistributionInteractiveJourney,
    difficulty: 'Intermediate',
    duration: '10-15 min'
  },
  {
    id: 'mastery',
    title: 'Real-World Mastery',
    description: 'Apply F-distributions to ANOVA, regression diagnostics, and quality control scenarios.',
    icon: Trophy,
    color: 'from-emerald-500 to-teal-500',
    component: FDistributionMastery,
    difficulty: 'Advanced',
    duration: '15-20 min'
  }
];

const FDistributionExplorer = () => {
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
            ← Back to Learning Paths
          </Button>
        </div>
        <SelectedComponent />
      </div>
    );
  }
  
  // Otherwise show the path selector
  return (
    <VisualizationContainer
      title="4.5 F-Distribution Explorer"
      description="Master variance comparison through progressive, interactive learning"
    >
      <div className="mb-8 p-6 bg-gradient-to-r from-violet-900/20 to-purple-900/20 rounded-lg border border-violet-600/30">
        <h2 className="text-xl font-semibold mb-3 text-violet-400">Welcome to F-Distribution Mastery!</h2>
        <p className="text-gray-300 mb-4">
          The F-distribution is essential for comparing variances between groups. It's used in ANOVA, 
          regression analysis, and quality control. Choose your learning path below based on your 
          experience level.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400"></span>
            <div>
              <strong>Beginners:</strong> Start with the Intuitive Introduction
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-violet-400">🚀</span>
            <div>
              <strong>Intermediate:</strong> Try the Interactive Journey
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">🏆</span>
            <div>
              <strong>Advanced:</strong> Explore Real-World Mastery
            </div>
          </div>
        </div>
      </div>
      
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
                {/* Icon and title */}
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
                
                {/* Duration */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>⏱ {path.duration}</span>
                </div>
                
                {/* Action button */}
                <Button
                  onClick={() => setSelectedPath(path)}
                  className="w-full"
                  variant="default"
                >
                  Start Learning
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Learning objectives */}
      <div className="mt-8 p-6 bg-gray-800/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">What You'll Learn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-cyan-400">Core Concepts</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• What variance comparison means</li>
              <li>• How F-statistics are calculated</li>
              <li>• Understanding degrees of freedom</li>
              <li>• Interpreting F-distribution shapes</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-violet-400">Practical Applications</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• ANOVA for comparing groups</li>
              <li>• Testing regression assumptions</li>
              <li>• Quality control in manufacturing</li>
              <li>• Hypothesis testing with F-tests</li>
            </ul>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
};

export default FDistributionExplorer;