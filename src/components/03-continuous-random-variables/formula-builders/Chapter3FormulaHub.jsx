"use client";
import React, { useState } from 'react';
import NormalDistributionBuilder from './NormalDistributionBuilder';
import { Bell, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const Chapter3FormulaHub = () => {
  const [expandedSections, setExpandedSections] = useState({
    normalDistribution: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useMathJax();

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Chapter 3: Interactive Formula Builder
            </h1>
            <Sparkles className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Master the fundamental formulas of continuous random variables by building them step-by-step.
          </p>
        </div>

        {/* Formula Sections */}
        <div className="space-y-6">
          {/* Normal Distribution Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('normalDistribution')}
              className="w-full p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-900/30 rounded-lg">
                  <Bell className="w-6 h-6 text-teal-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-white">Normal Distribution</h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    Learn the foundation of continuous probability distributions
                  </p>
                </div>
              </div>
              {expandedSections.normalDistribution ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.normalDistribution && (
              <div className="p-6 pt-0">
                <NormalDistributionBuilder />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chapter3FormulaHub;