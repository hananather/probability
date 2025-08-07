"use client";
import React, { useState } from 'react';
import LinearRegressionBuilder from './LinearRegressionBuilder';
import { Calculator, ChevronDown, ChevronUp, Sparkles, TrendingUp } from 'lucide-react';
import { useMathJax } from '@/hooks/useMathJax';

const Chapter7FormulaHub = () => {
  const [expandedSections, setExpandedSections] = useState({
    linearRegression: true
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
            <Sparkles className="w-8 h-8 text-indigo-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Chapter 7: Interactive Formula Builder
            </h1>
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Master the fundamental formulas of regression and correlation by building them step-by-step. 
            Click on each part to understand why it's there and how it works.
          </p>
        </div>

        {/* Formula Sections */}
        <div className="space-y-6">
          {/* Linear Regression Slope Formula */}
          <div className="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <button
              onClick={() => toggleSection('linearRegression')}
              className="w-full p-6 flex items-center justify-between hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-white">Linear Regression Slope Formula</h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    Learn how correlation becomes slope: b₁ = r × (sᵧ/sₓ)
                  </p>
                </div>
              </div>
              {expandedSections.linearRegression ? 
                <ChevronUp className="w-5 h-5 text-neutral-400" /> : 
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              }
            </button>
            
            {expandedSections.linearRegression && (
              <div className="p-6 pt-0">
                <LinearRegressionBuilder />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chapter7FormulaHub;