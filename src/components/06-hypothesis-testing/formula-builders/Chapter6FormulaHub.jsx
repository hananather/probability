"use client";
import React, { useState } from 'react';
import TTestStatisticBuilder from './TTestStatisticBuilder';
import ZTestStatisticBuilder from './ZTestStatisticBuilder';
import ProportionTestBuilder from './ProportionTestBuilder';
import TwoSampleTTestBuilder from './TwoSampleTTestBuilder';
import PooledStandardDeviationBuilder from './PooledStandardDeviationBuilder';
import PairedTTestBuilder from './PairedTTestBuilder';
import EffectSizeBuilder from './EffectSizeBuilder';
import { TestTube, ChevronDown, ChevronUp, Sparkles, Target, Percent, Users, Calculator, Link, Zap } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const Chapter6FormulaHub = () => {
  const [expandedSections, setExpandedSections] = useState({
    tTestStatistic: true,
    zTestStatistic: false,
    proportionTest: false,
    twoSampleTTest: false,
    pooledStandardDeviation: false,
    pairedTTest: false,
    effectSize: false
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
              Chapter 6: Interactive Formula Builder
            </h1>
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-pink-400" />
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl mx-auto px-2 sm:px-0">
            Master the fundamental formulas of hypothesis testing by building them step-by-step.
          </p>
        </div>

        {/* Formula Sections */}
        <div className="space-y-6">
          {/* T-Test Statistic Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('tTestStatistic')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-900/30 rounded-lg">
                  <TestTube className="w-6 h-6 text-red-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">T-Test Statistic</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Learn the foundation of hypothesis testing with unknown σ
                  </p>
                </div>
              </div>
              {expandedSections.tTestStatistic ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.tTestStatistic && (
              <div className="p-4 sm:p-6 pt-0">
                <TTestStatisticBuilder />
              </div>
            )}
          </div>

          {/* Z-Test Statistic Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('zTestStatistic')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900/30 rounded-lg">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Z-Test Statistic</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Hypothesis testing when population standard deviation is known
                  </p>
                </div>
              </div>
              {expandedSections.zTestStatistic ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.zTestStatistic && (
              <div className="p-4 sm:p-6 pt-0">
                <ZTestStatisticBuilder />
              </div>
            )}
          </div>

          {/* Proportion Test Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('proportionTest')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-900/30 rounded-lg">
                  <Percent className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Proportion Test Statistic</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Testing hypotheses about population proportions
                  </p>
                </div>
              </div>
              {expandedSections.proportionTest ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.proportionTest && (
              <div className="p-4 sm:p-6 pt-0">
                <ProportionTestBuilder />
              </div>
            )}
          </div>

          {/* Two-Sample T-Test Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('twoSampleTTest')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Two-Sample T-Test</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Comparing means between two independent groups
                  </p>
                </div>
              </div>
              {expandedSections.twoSampleTTest ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.twoSampleTTest && (
              <div className="p-4 sm:p-6 pt-0">
                <TwoSampleTTestBuilder />
              </div>
            )}
          </div>

          {/* Pooled Standard Deviation Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('pooledStandardDeviation')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-900/30 rounded-lg">
                  <Calculator className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Pooled Standard Deviation</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Combining variance estimates from two samples
                  </p>
                </div>
              </div>
              {expandedSections.pooledStandardDeviation ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.pooledStandardDeviation && (
              <div className="p-4 sm:p-6 pt-0">
                <PooledStandardDeviationBuilder />
              </div>
            )}
          </div>

          {/* Paired T-Test Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('pairedTTest')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-900/30 rounded-lg">
                  <Link className="w-6 h-6 text-rose-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Paired T-Test</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Testing differences within paired observations
                  </p>
                </div>
              </div>
              {expandedSections.pairedTTest ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.pairedTTest && (
              <div className="p-4 sm:p-6 pt-0">
                <PairedTTestBuilder />
              </div>
            )}
          </div>

          {/* Effect Size (Cohen's d) Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('effectSize')}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-900/30 rounded-lg">
                  <Zap className="w-6 h-6 text-violet-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Effect Size (Cohen's d)</h2>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    Measuring practical significance of differences
                  </p>
                </div>
              </div>
              {expandedSections.effectSize ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.effectSize && (
              <div className="p-4 sm:p-6 pt-0">
                <EffectSizeBuilder />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chapter6FormulaHub;