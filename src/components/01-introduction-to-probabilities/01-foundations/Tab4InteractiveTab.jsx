"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { VisualizationContainer } from '@/components/ui/VisualizationContainer';
import { Sparkles, Calculator, Layers } from 'lucide-react';

// Dynamically import all implementations
const StaticVisual = dynamic(() => import('./Tab4InteractiveTab-StaticVisual'), { 
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading Static Visual implementation...</div>
});

const VennDiagram = dynamic(() => import('./Tab4InteractiveTab-VennDiagram'), { 
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading Venn Diagram implementation...</div>
});

const StepByStep = dynamic(() => import('./Tab4InteractiveTab-StepByStep'), { 
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading Step-by-Step implementation...</div>
});


const IMPLEMENTATIONS = [
  {
    id: 'static',
    name: 'Visual Experiments',
    icon: Sparkles,
    component: StaticVisual,
    description: 'Explore probability through interactive pebble experiments',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    id: 'venn',
    name: 'Set Operations',
    icon: Layers,
    component: VennDiagram,
    description: 'Visualize probability events using interactive Venn diagrams',
    color: 'from-purple-600 to-pink-600'
  },
  {
    id: 'stepbystep',
    name: 'Mathematical Analysis',
    icon: Calculator,
    component: StepByStep,
    description: 'Work through probability calculations step-by-step',
    color: 'from-green-600 to-teal-600'
  }
];

export default function Tab4InteractiveTab({ onComplete }) {
  const [selectedImplementation, setSelectedImplementation] = useState('static');
  
  const selected = IMPLEMENTATIONS.find(impl => impl.id === selectedImplementation);
  const SelectedComponent = selected?.component;

  return (
    <div className="space-y-6">
      {/* Learning Approach Selector */}
      <VisualizationContainer title="Choose Your Learning Approach" className="p-6">
        <p className="text-neutral-300 mb-6">
          Select the approach that works best for your learning style:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {IMPLEMENTATIONS.map((impl) => {
            const Icon = impl.icon;
            const isSelected = impl.id === selectedImplementation;
            
            return (
              <button
                key={impl.id}
                onClick={() => setSelectedImplementation(impl.id)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all duration-300
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-900/30' 
                    : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600 hover:bg-neutral-800'
                  }
                `}
              >
                <div className={`
                  absolute inset-0 rounded-lg bg-gradient-to-br ${impl.color} opacity-10
                  ${isSelected ? 'opacity-20' : ''}
                `} />
                
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-neutral-400'}`} />
                    <h3 className={`font-semibold ${isSelected ? 'text-blue-300' : 'text-neutral-200'}`}>
                      {impl.name}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400 text-left">
                    {impl.description}
                  </p>
                </div>
                
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
          <p className="text-sm text-blue-300">
            <strong>Learning Tip:</strong> Start with Visual Experiments to build intuition, 
            then use Set Operations to understand events, and finally work through the Mathematical Analysis.
          </p>
        </div>
      </VisualizationContainer>

      {/* Selected Learning Approach */}
      {SelectedComponent && (
        <div className="animate-fade-in">
          <SelectedComponent onComplete={onComplete} />
        </div>
      )}
    </div>
  );
}