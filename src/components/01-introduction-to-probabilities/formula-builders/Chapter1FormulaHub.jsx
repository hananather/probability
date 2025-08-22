"use client";
import React, { useState } from 'react';
import BasicProbabilityBuilder from './BasicProbabilityBuilder';
import BayesTheoremBuilder from './BayesTheoremBuilder';
import ConditionalProbabilityBuilder from './ConditionalProbabilityBuilder';
import PermutationsBuilder from './PermutationsBuilder';
import CombinationsBuilder from './CombinationsBuilder';
import { Calculator, Brain, ChevronDown, ChevronUp, Sparkles, Filter, ArrowRightLeft, Package } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const Chapter1FormulaHub = () => {
  const [expandedSections, setExpandedSections] = useState({
    basicProbability: true,
    conditionalProbability: false,
    bayesTheorem: false,
    permutations: false,
    combinations: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-3 sm:p-4 lg:p-6">
      <div className="max-w-full lg:max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-400" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Chapter 1: Interactive Formula Builder
            </h1>
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-pink-400" />
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto px-2 sm:px-0">
            Master the fundamental formulas of probability by building them step-by-step. 
            Click on each part to understand why it's there and how it works.
          </p>
        </div>

        {/* Formula Sections */}
        <div className="space-y-6">
          {/* Basic Probability Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('basicProbability')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-900/30 rounded-lg">
                  <Calculator className="w-6 h-6 text-teal-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Basic Probability Formula</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Learn the foundation: P(A) = favorable/total
                  </p>
                </div>
              </div>
              {expandedSections.basicProbability ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.basicProbability && (
              <div className="p-4 sm:p-6 pt-0">
                <BasicProbabilityBuilder />
              </div>
            )}
          </div>

          {/* Conditional Probability */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('conditionalProbability')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-900/30 rounded-lg">
                  <Filter className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Conditional Probability</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Understand probability given that something has occurred
                  </p>
                </div>
              </div>
              {expandedSections.conditionalProbability ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.conditionalProbability && (
              <div className="p-4 sm:p-6 pt-0">
                <ConditionalProbabilityBuilder />
              </div>
            )}
          </div>

          {/* Bayes' Theorem */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('bayesTheorem')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Bayes' Theorem</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Master the art of updating beliefs with evidence
                  </p>
                </div>
              </div>
              {expandedSections.bayesTheorem ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.bayesTheorem && (
              <div className="p-4 sm:p-6 pt-0">
                <BayesTheoremBuilder />
              </div>
            )}
          </div>

          {/* Permutations */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('permutations')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-900/30 rounded-lg">
                  <ArrowRightLeft className="w-6 h-6 text-violet-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Permutations</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Count arrangements when order matters
                  </p>
                </div>
              </div>
              {expandedSections.permutations ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.permutations && (
              <div className="p-4 sm:p-6 pt-0">
                <PermutationsBuilder />
              </div>
            )}
          </div>

          {/* Combinations */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('combinations')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-900/30 rounded-lg">
                  <Package className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Combinations</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Count selections when order doesn't matter
                  </p>
                </div>
              </div>
              {expandedSections.combinations ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.combinations && (
              <div className="p-4 sm:p-6 pt-0">
                <CombinationsBuilder />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chapter1FormulaHub;