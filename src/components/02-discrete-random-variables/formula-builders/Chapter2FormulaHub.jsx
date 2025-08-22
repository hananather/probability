"use client";
import React, { useState } from 'react';
import BinomialDistributionBuilder from './BinomialDistributionBuilder';
import PoissonDistributionBuilder from './PoissonDistributionBuilder';
import GeometricDistributionBuilder from './GeometricDistributionBuilder';
import ExpectedValueBuilder from './ExpectedValueBuilder';
import VarianceBuilder from './VarianceBuilder';
import { Calculator, ChevronDown, ChevronUp, Sparkles, Clock, Repeat, BarChart3, TrendingUp } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const Chapter2FormulaHub = () => {
  const [expandedSections, setExpandedSections] = useState({
    binomialDistribution: true,
    poissonDistribution: false,
    geometricDistribution: false,
    expectedValue: false,
    variance: false
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
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Chapter 2: Interactive Formula Builder
            </h1>
            <Sparkles className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto px-2 sm:px-0">
            Master the fundamental formulas of discrete random variables by building them step-by-step.
          </p>
        </div>

        {/* Formula Sections */}
        <div className="space-y-6">
          {/* Binomial Distribution Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('binomialDistribution')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-900/30 rounded-lg">
                  <Calculator className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Binomial Distribution</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Master counting successes in fixed number of trials
                  </p>
                </div>
              </div>
              {expandedSections.binomialDistribution ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.binomialDistribution && (
              <div className="p-4 sm:p-6 pt-0">
                <BinomialDistributionBuilder />
              </div>
            )}
          </div>

          {/* Poisson Distribution Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('poissonDistribution')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Poisson Distribution</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Model rare events occurring over time or space
                  </p>
                </div>
              </div>
              {expandedSections.poissonDistribution ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.poissonDistribution && (
              <div className="p-4 sm:p-6 pt-0">
                <PoissonDistributionBuilder />
              </div>
            )}
          </div>

          {/* Geometric Distribution Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('geometricDistribution')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-900/30 rounded-lg">
                  <Repeat className="w-6 h-6 text-rose-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Geometric Distribution</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Calculate waiting time until first success
                  </p>
                </div>
              </div>
              {expandedSections.geometricDistribution ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.geometricDistribution && (
              <div className="p-4 sm:p-6 pt-0">
                <GeometricDistributionBuilder />
              </div>
            )}
          </div>

          {/* Expected Value Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('expectedValue')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900/30 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Expected Value</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Understand the theoretical average of a random variable
                  </p>
                </div>
              </div>
              {expandedSections.expectedValue ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.expectedValue && (
              <div className="p-4 sm:p-6 pt-0">
                <ExpectedValueBuilder />
              </div>
            )}
          </div>

          {/* Variance Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('variance')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Variance</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Learn how to measure the spread around the mean
                  </p>
                </div>
              </div>
              {expandedSections.variance ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.variance && (
              <div className="p-4 sm:p-6 pt-0">
                <VarianceBuilder />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chapter2FormulaHub;