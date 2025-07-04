"use client";
import React, { useState } from 'react';
import { SizingPatterns } from '../../components/learn/SizingPatterns';
import { Chapter7Showcase } from '../../components/learn/Chapter7Showcase';
import { ComponentLibrary } from '../../components/learn/ComponentLibrary';
import { GoldStandardShowcase } from '../../components/learn/GoldStandardShowcase';
import { ComponentUsageTest } from '../../components/learn/ComponentUsageTest';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import { cn } from '../../lib/design-system';

export default function LearnPage() {
  const [activeComponent, setActiveComponent] = useState('goldstandard');
  
  const components = [
    { id: 'goldstandard', name: '🏆 Gold Standard Components', component: GoldStandardShowcase },
    { id: 'usagetest', name: '🧪 Usage Test', component: ComponentUsageTest },
    { id: 'components', name: 'Component Library', component: ComponentLibrary },
    { id: 'chapter7', name: 'Chapter 7 Design Patterns', component: Chapter7Showcase },
    { id: 'sizing', name: 'SVG & Container Sizing', component: SizingPatterns },
    // Add more learning components here as you create them
  ];
  
  const ActiveComponent = components.find(c => c.id === activeComponent)?.component;
  
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">React Learning Sandbox</h1>
            <Link href="/">
              <Button variant="neutral" size="sm">
                Back to App
              </Button>
            </Link>
          </div>
          <p className="text-neutral-400">
            A safe space to experiment with React patterns from your codebase. 
            Nothing here affects your real app!
          </p>
        </div>
        
        {/* Component Selector */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Choose a Topic:</h2>
          <div className="flex gap-2 flex-wrap">
            {components.map(comp => (
              <Button
                key={comp.id}
                variant={activeComponent === comp.id ? "primary" : "neutral"}
                size="sm"
                onClick={() => setActiveComponent(comp.id)}
                className={cn(
                  "transition-all",
                  activeComponent === comp.id && "ring-2 ring-teal-400"
                )}
              >
                {comp.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Active Component */}
        <div className="bg-neutral-800 rounded-lg p-6">
          {ActiveComponent && <ActiveComponent />}
        </div>
        
        {/* Tips Section */}
        <div className="mt-8 p-6 bg-blue-900/20 border border-blue-600/30 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">💡 Learning Tips</h3>
          <ul className="space-y-2 text-sm text-neutral-300">
            <li>• Open DevTools and inspect the elements to see how they&apos;re structured</li>
            <li>• Try modifying the code in the component files and see what happens</li>
            <li>• Use React DevTools to examine props and state</li>
            <li>• Compare these patterns with components in your main app</li>
          </ul>
        </div>
      </div>
    </div>
  );
}