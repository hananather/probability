"use client";
import React, { useState } from 'react';
import BinomialDistributionBuilder from './BinomialDistributionBuilder';
import { Calculator, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const Chapter2FormulaHub = () => {
  const [expandedSections, setExpandedSections] = useState({
    binomialDistribution: true
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
              Chapter 2: Interactive Formula Builder
            </h1>
            <Sparkles className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Master the fundamental formulas of discrete random variables by building them step-by-step.
          </p>
        </div>

        {/* Formula Sections */}
        <div className="space-y-6">
          {/* Binomial Distribution Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('binomialDistribution')}
              className="w-full p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-900/30 rounded-lg">
                  <Calculator className="w-6 h-6 text-teal-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-white">Binomial Distribution</h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    Learn the foundation of discrete probability distributions
                  </p>
                </div>
              </div>
              {expandedSections.binomialDistribution ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.binomialDistribution && (
              <div className="p-6 pt-0">
                <BinomialDistributionBuilder />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chapter2FormulaHub;