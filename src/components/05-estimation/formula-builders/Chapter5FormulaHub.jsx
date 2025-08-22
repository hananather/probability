"use client";
import React, { useState } from 'react';
import ConfidenceIntervalBuilder from './ConfidenceIntervalBuilder';
import MarginOfErrorBuilder from './MarginOfErrorBuilder';
import ZIntervalBuilder from './ZIntervalBuilder';
import ProportionCIBuilder from './ProportionCIBuilder';
import SampleSizeMeanBuilder from './SampleSizeMeanBuilder';
import SampleSizeProportionBuilder from './SampleSizeProportionBuilder';
import { Target, ChevronDown, ChevronUp, Sparkles, Calculator, Zap, Percent, BarChart3, TrendingUp } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const Chapter5FormulaHub = () => {
  const [expandedSections, setExpandedSections] = useState({
    marginOfError: false,
    zInterval: false,
    confidenceInterval: true,
    proportionCI: false,
    sampleSizeMean: false,
    sampleSizeProportion: false
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
              Chapter 5: Interactive Formula Builder
            </h1>
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-pink-400" />
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto px-2 sm:px-0">
            Master the fundamental formulas of estimation by building them step-by-step.
          </p>
        </div>

        {/* Formula Sections */}
        <div className="space-y-6">
          {/* Margin of Error Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('marginOfError')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-900/30 rounded-lg">
                  <Calculator className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Margin of Error</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Understanding uncertainty in statistical estimates
                  </p>
                </div>
              </div>
              {expandedSections.marginOfError ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.marginOfError && (
              <div className="p-4 sm:p-6 pt-0">
                <MarginOfErrorBuilder />
              </div>
            )}
          </div>

          {/* Z-Interval Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('zInterval')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900/30 rounded-lg">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Z-Interval (Known σ)</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Confidence intervals when population standard deviation is known
                  </p>
                </div>
              </div>
              {expandedSections.zInterval ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.zInterval && (
              <div className="p-4 sm:p-6 pt-0">
                <ZIntervalBuilder />
              </div>
            )}
          </div>

          {/* Confidence Interval Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('confidenceInterval')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-900/30 rounded-lg">
                  <Target className="w-6 h-6 text-teal-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">T-Interval (Unknown σ)</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Learn the foundation of statistical estimation
                  </p>
                </div>
              </div>
              {expandedSections.confidenceInterval ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.confidenceInterval && (
              <div className="p-4 sm:p-6 pt-0">
                <ConfidenceIntervalBuilder />
              </div>
            )}
          </div>

          {/* Proportion Confidence Interval Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('proportionCI')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-900/30 rounded-lg">
                  <Percent className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Proportion Confidence Interval</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Estimating population proportions and percentages
                  </p>
                </div>
              </div>
              {expandedSections.proportionCI ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.proportionCI && (
              <div className="p-4 sm:p-6 pt-0">
                <ProportionCIBuilder />
              </div>
            )}
          </div>

          {/* Sample Size for Means Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('sampleSizeMean')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-900/30 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-violet-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Sample Size for Means</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Calculate required sample size to estimate population means
                  </p>
                </div>
              </div>
              {expandedSections.sampleSizeMean ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.sampleSizeMean && (
              <div className="p-4 sm:p-6 pt-0">
                <SampleSizeMeanBuilder />
              </div>
            )}
          </div>

          {/* Sample Size for Proportions Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('sampleSizeProportion')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Sample Size for Proportions</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Calculate required sample size to estimate population proportions
                  </p>
                </div>
              </div>
              {expandedSections.sampleSizeProportion ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.sampleSizeProportion && (
              <div className="p-4 sm:p-6 pt-0">
                <SampleSizeProportionBuilder />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chapter5FormulaHub;