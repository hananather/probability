"use client";

import React, { useState } from "react";
import { VisualizationContainer } from "@/components/ui/VisualizationContainer";
import { cn } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import CLTGateway from "./4-6-1-CLTGateway";
import CLTProperties from "./4-6-2-CLTProperties";
import CLTSimulation from "./4-6-3-CLTSimulation";
import { Activity, Sparkles, FlaskConical, ChevronLeft } from "lucide-react";

// Learning paths configuration
const learningPaths = [
  {
    id: 'gateway',
    title: '1. CLT Gateway',
    description: 'Start here! Discover why the Central Limit Theorem is called the cornerstone of statistics.',
    icon: Activity,
    color: 'from-cyan-500 to-blue-500',
    component: CLTGateway,
    difficulty: 'Beginner',
    duration: '10 min',
    concepts: ['CLT statement', 'Why it matters', 'Basic intuition', 'Real applications']
  },
  {
    id: 'properties',
    title: '2. CLT Properties',
    description: 'Explore the mathematical properties and conditions of the Central Limit Theorem.',
    icon: Sparkles,
    color: 'from-blue-500 to-indigo-500',
    component: CLTProperties,
    difficulty: 'Intermediate',
    duration: '12 min',
    concepts: ['Mathematical conditions', 'Sample size requirements', 'Rate of convergence', 'Edge cases']
  },
  {
    id: 'simulation',
    title: '3. CLT Simulation Lab',
    description: 'See the CLT in action! Experiment with different populations and watch the magic happen.',
    icon: FlaskConical,
    color: 'from-indigo-500 to-purple-500',
    component: CLTSimulation,
    difficulty: 'Intermediate',
    duration: '15 min',
    concepts: ['Interactive simulation', 'Different distributions', 'Sample size effects', 'Visual proof']
  }
];

const CLTHub = () => {
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
      title="4.6 Central Limit Theorem"
      description="Statistics' most important and magical result"
    >
      <div className="mb-8 p-6 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-lg border border-cyan-600/30">
        <h2 className="text-xl font-semibold mb-3 text-cyan-400">The Magic of Statistics</h2>
        <p className="text-gray-300 mb-4">
          The Central Limit Theorem (CLT) is arguably the most important theorem in statistics. 
          It tells us that sample means follow a normal distribution, regardless of the shape of the 
          original population. This remarkable property enables almost all of statistical inference.
        </p>
        
        <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-600/30">
          <p className="text-sm text-blue-300">
            <strong className="text-blue-400">The Theorem:</strong> For a population with mean μ and 
            finite variance σ², the distribution of sample means approaches a normal distribution 
            with mean μ and variance σ²/n as the sample size n increases.
          </p>
        </div>
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
      
      <div className="mt-8 p-6 bg-gray-800/50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Why CLT Matters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-cyan-400">Practical Impact</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>Enables confidence intervals and hypothesis testing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>Works for any population distribution (with finite variance)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-500 mt-1">•</span>
                <span>Justifies using normal distribution in many applications</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-blue-400">Key Insights</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Sample size matters: n ≥ 30 is often sufficient</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Standard error decreases with √n</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Foundation for all parametric statistics</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </VisualizationContainer>
  );
};

export default CLTHub;