"use client";
import React, { useState } from "react";
import { cn } from '../../lib/design-system';
import { ChevronRight, Sparkles, Calculator, Triangle, Shapes, Globe } from 'lucide-react';

// Import sub-components (we'll create these next)
import LotteryVisualization from './1-4-1-LotteryVisualization';
import FormulaDerivation from './1-4-2-FormulaDerivation';
import PascalsTriangle from './1-4-3-PascalsTriangle';
import CombinationBuilder from './1-4-1-CombinationBuilder';
import RealWorldApplications from './1-4-5-RealWorldApplications';

const sections = [
  {
    id: 'lottery',
    title: 'Interactive Lottery',
    subtitle: 'Explore combinations through lottery selection',
    icon: Sparkles,
    component: LotteryVisualization,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'formula',
    title: 'Formula Derivation',
    subtitle: 'Understand how C(n,r) is calculated',
    icon: Calculator,
    component: FormulaDerivation,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'pascal',
    title: "Pascal's Triangle",
    subtitle: 'Discover patterns in combinations',
    icon: Triangle,
    component: PascalsTriangle,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'builder',
    title: 'Combination Builder',
    subtitle: 'Build combinations interactively',
    icon: Shapes,
    component: CombinationBuilder,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'applications',
    title: 'Real-World Applications',
    subtitle: 'See combinations in practice',
    icon: Globe,
    component: RealWorldApplications,
    color: 'from-indigo-500 to-purple-500'
  }
];

function UnorderedSamplesHub() {
  const [activeSection, setActiveSection] = useState('lottery');
  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || LotteryVisualization;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black">
      {/* Header */}
      <div className="bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white mb-2">
            Unordered Samples (Combinations)
          </h1>
          
          {/* Section Navigation */}
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                    "border text-sm font-medium transform",
                    "hover:scale-105",
                    isActive ? [
                      "bg-gradient-to-r text-white shadow-lg transform scale-105",
                      "border-transparent",
                      section.color
                    ] : [
                      "bg-neutral-800/50 text-neutral-300 hover:text-white",
                      "border-neutral-700 hover:border-neutral-600",
                      "hover:bg-neutral-800"
                    ]
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{section.title}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-1" />}
                </button>
              );
            })}
          </div>
          
          {/* Active Section Description */}
          <p className="text-sm text-neutral-400 mt-3">
            {sections.find(s => s.id === activeSection)?.subtitle}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative">
          {sections.map((section) => {
            const SectionComponent = section.component;
            return (
              <div
                key={section.id}
                className={cn(
                  "absolute inset-0 transition-all duration-300",
                  activeSection === section.id
                    ? "opacity-100 transform translate-x-0 z-10"
                    : "opacity-0 transform -translate-x-4 pointer-events-none z-0"
                )}
              >
                <SectionComponent />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default UnorderedSamplesHub;