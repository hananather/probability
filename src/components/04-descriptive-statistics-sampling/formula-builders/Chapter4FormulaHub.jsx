"use client";
import React, { useState } from 'react';
import CentralLimitTheoremBuilder from './CentralLimitTheoremBuilder';
import SampleMeanBuilder from './SampleMeanBuilder';
import SampleVarianceBuilder from './SampleVarianceBuilder';
import StandardErrorBuilder from './StandardErrorBuilder';
import TDistributionBuilder from './TDistributionBuilder';
import { BarChart, ChevronDown, ChevronUp, Sparkles, Target, Activity, TrendingUp, Calculator } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const Chapter4FormulaHub = () => {
  const [expandedSections, setExpandedSections] = useState({
    sampleMean: true,
    sampleVariance: false,
    standardError: false,
    tDistribution: false,
    centralLimitTheorem: false
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
              Chapter 4: Interactive Formula Builder
            </h1>
            <Sparkles className="w-8 h-8 text-pink-400" />
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto px-2 sm:px-0">
            Master the fundamental formulas of sampling and data analysis by building them step-by-step. Learn sample statistics, variability measures, and the t-distribution.
          </p>
        </div>

        {/* Formula Sections */}
        <div className="space-y-6">
          {/* Sample Mean Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('sampleMean')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-900/30 rounded-lg">
                  <Target className="w-6 h-6 text-teal-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Sample Mean</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Build the foundation: x̄ = (1/n) Σ xi
                  </p>
                </div>
              </div>
              {expandedSections.sampleMean ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.sampleMean && (
              <div className="p-4 sm:p-6 pt-0">
                <SampleMeanBuilder />
              </div>
            )}
          </div>

          {/* Sample Variance Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('sampleVariance')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Sample Variance</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Learn Bessel's correction: s² = (1/(n-1)) Σ (xi - x̄)²
                  </p>
                </div>
              </div>
              {expandedSections.sampleVariance ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.sampleVariance && (
              <div className="p-4 sm:p-6 pt-0">
                <SampleVarianceBuilder />
              </div>
            )}
          </div>

          {/* Standard Error Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('standardError')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-900/30 rounded-lg">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Standard Error</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Understand precision: SE(X̄) = σ/√n
                  </p>
                </div>
              </div>
              {expandedSections.standardError ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.standardError && (
              <div className="p-4 sm:p-6 pt-0">
                <StandardErrorBuilder />
              </div>
            )}
          </div>

          {/* t-Distribution Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('tDistribution')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-900/30 rounded-lg">
                  <Calculator className="w-6 h-6 text-rose-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">t-Distribution</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    When σ is unknown: t = (x̄ - μ)/(s/√n)
                  </p>
                </div>
              </div>
              {expandedSections.tDistribution ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.tDistribution && (
              <div className="p-4 sm:p-6 pt-0">
                <TDistributionBuilder />
              </div>
            )}
          </div>

          {/* Central Limit Theorem Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('centralLimitTheorem')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-900/30 rounded-lg">
                  <BarChart className="w-6 h-6 text-violet-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Central Limit Theorem</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    The foundation of sampling distributions
                  </p>
                </div>
              </div>
              {expandedSections.centralLimitTheorem ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.centralLimitTheorem && (
              <div className="p-4 sm:p-6 pt-0">
                <CentralLimitTheoremBuilder />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chapter4FormulaHub;