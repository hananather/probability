"use client";
import React, { useState } from 'react';
import NormalDistributionBuilder from './NormalDistributionBuilder';
import ZScoreBuilder from './ZScoreBuilder';
import ExponentialDistributionBuilder from './ExponentialDistributionBuilder';
import UniformDistributionBuilder from './UniformDistributionBuilder';
import NormalApproximationBuilder from './NormalApproximationBuilder';
import { Bell, Target, Clock, BarChart3, ArrowRightLeft, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const Chapter3FormulaHub = () => {
  const [expandedSections, setExpandedSections] = useState({
    normalDistribution: true,
    zScore: false,
    exponentialDistribution: false,
    uniformDistribution: false,
    normalApproximation: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useMathJax();

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-3 sm:p-4 lg:p-6">
      <div className="max-w-full lg:max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Chapter 3: Interactive Formula Builder
            </h1>
            <Sparkles className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto px-2 sm:px-0">
            Master the fundamental formulas of continuous random variables by building them step-by-step.
            Click on each part to understand why it's there and how it works.
          </p>
        </div>

        {/* Formula Sections */}
        <div className="space-y-6">
          {/* Normal Distribution Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('normalDistribution')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900/30 rounded-lg">
                  <Bell className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Normal Distribution</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
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
              <div className="p-4 sm:p-6 pt-0">
                <NormalDistributionBuilder />
              </div>
            )}
          </div>

          {/* Z-Score Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('zScore')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-900/30 rounded-lg">
                  <Target className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Z-Score Formula</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Master standardization: convert any value to standard units
                  </p>
                </div>
              </div>
              {expandedSections.zScore ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.zScore && (
              <div className="p-4 sm:p-6 pt-0">
                <ZScoreBuilder />
              </div>
            )}
          </div>

          {/* Exponential Distribution */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('exponentialDistribution')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-900/30 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Exponential Distribution</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Understand waiting times and the memoryless property
                  </p>
                </div>
              </div>
              {expandedSections.exponentialDistribution ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.exponentialDistribution && (
              <div className="p-4 sm:p-6 pt-0">
                <ExponentialDistributionBuilder />
              </div>
            )}
          </div>

          {/* Uniform Distribution */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('uniformDistribution')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-900/30 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-violet-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Uniform Distribution</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Master the flat distribution where all outcomes are equally likely
                  </p>
                </div>
              </div>
              {expandedSections.uniformDistribution ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.uniformDistribution && (
              <div className="p-4 sm:p-6 pt-0">
                <UniformDistributionBuilder />
              </div>
            )}
          </div>

          {/* Normal Approximation to Binomial */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('normalApproximation')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-900/30 rounded-lg">
                  <ArrowRightLeft className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Normal Approximation to Binomial</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Learn when and how discrete binomial becomes continuous normal
                  </p>
                </div>
              </div>
              {expandedSections.normalApproximation ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.normalApproximation && (
              <div className="p-4 sm:p-6 pt-0">
                <NormalApproximationBuilder />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chapter3FormulaHub;