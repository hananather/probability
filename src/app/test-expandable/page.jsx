'use client';

import React from 'react';
import { 
  ExpandableVisual, 
  ExpandableVisualInline, 
  ExpandButton 
} from '../../components/ui/patterns/ExpandableVisual';

export default function TestExpandable() {
  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">Expandable Visual Component Examples</h1>

        {/* Example 1: Basic ExpandableVisual */}
        <div className="border border-neutral-800 rounded-lg p-6 bg-neutral-900/50">
          <h2 className="text-xl font-semibold text-white mb-4">Example 1: Basic Expandable Visual</h2>
          <ExpandableVisual
            title="Expanded Chart View"
            buttonText="View Larger"
            buttonVariant="primary"
          >
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 rounded-lg border border-blue-500/30">
              <div className="h-64 flex items-center justify-center">
                <p className="text-2xl text-blue-300">
                  This content can be expanded! 
                  <br />
                  (Imagine a chart or visualization here)
                </p>
              </div>
            </div>
          </ExpandableVisual>
        </div>

        {/* Example 2: Inline Expand Button */}
        <div className="border border-neutral-800 rounded-lg p-6 bg-neutral-900/50">
          <h2 className="text-xl font-semibold text-white mb-4">Example 2: Inline Expand Button (hover to see)</h2>
          <ExpandableVisualInline buttonPosition="top-right">
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-8 rounded-lg border border-green-500/30">
              <div className="h-64 flex items-center justify-center">
                <p className="text-2xl text-green-300">
                  Hover to see expand button in corner!
                  <br />
                  (Perfect for charts and graphs)
                </p>
              </div>
            </div>
          </ExpandableVisualInline>
        </div>

        {/* Example 3: Custom Expanded Content */}
        <div className="border border-neutral-800 rounded-lg p-6 bg-neutral-900/50">
          <h2 className="text-xl font-semibold text-white mb-4">Example 3: Different Content When Expanded</h2>
          <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 p-8 rounded-lg border border-orange-500/30">
            <p className="text-lg text-orange-300 mb-4">Small preview version</p>
            <ExpandButton
              buttonText="See Detailed Analysis"
              title="Detailed Statistical Analysis"
              expandedContent={
                <div className="space-y-4">
                  <p className="text-lg text-white">This is completely different expanded content!</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-neutral-800 rounded">
                      <p className="text-sm text-neutral-400">Mean</p>
                      <p className="text-2xl text-blue-400">42.5</p>
                    </div>
                    <div className="p-4 bg-neutral-800 rounded">
                      <p className="text-sm text-neutral-400">Std Dev</p>
                      <p className="text-2xl text-green-400">8.3</p>
                    </div>
                    <div className="p-4 bg-neutral-800 rounded">
                      <p className="text-sm text-neutral-400">Sample Size</p>
                      <p className="text-2xl text-purple-400">1000</p>
                    </div>
                  </div>
                  <div className="h-64 bg-neutral-800 rounded flex items-center justify-center">
                    <p className="text-xl text-neutral-400">Detailed Chart Would Go Here</p>
                  </div>
                </div>
              }
            />
          </div>
        </div>

        {/* Example 4: Using with actual NormalApproxBinomial pattern */}
        <div className="border border-neutral-800 rounded-lg p-6 bg-neutral-900/50">
          <h2 className="text-xl font-semibold text-white mb-4">Example 4: Worked Example Pattern</h2>
          <p className="text-neutral-400 mb-4">This mimics the pattern from NormalApproxBinomial</p>
          
          <div className="bg-gradient-to-br from-teal-900/20 to-cyan-900/20 p-4 rounded-lg border border-teal-500/30">
            <p className="text-sm text-teal-300 font-semibold mb-2">Statistical Problem:</p>
            <p className="text-sm text-teal-200">
              A factory produces 1000 items daily with a 2% defect rate.
            </p>
            
            <ExpandButton
              buttonText="Try Example"
              variant="primary"
              size="sm"
              className="w-full mt-3"
              title="Interactive Worked Example"
              expandedContent={
                <div className="p-6">
                  <h3 className="text-2xl text-emerald-400 mb-4">Interactive Normal Approximation to Binomial</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-neutral-800/50 rounded">
                        <p className="text-sm text-neutral-400 mb-2">Parameters</p>
                        <p className="text-white">n = 1000, p = 0.02</p>
                      </div>
                      <div className="p-4 bg-neutral-800/50 rounded">
                        <p className="text-sm text-neutral-400 mb-2">Step 1: Calculate mean</p>
                        <p className="text-white">μ = np = 1000 × 0.02 = 20</p>
                      </div>
                      <div className="p-4 bg-neutral-800/50 rounded">
                        <p className="text-sm text-neutral-400 mb-2">Step 2: Calculate standard deviation</p>
                        <p className="text-white">σ = √(np(1-p)) = √(20 × 0.98) = 4.43</p>
                      </div>
                    </div>
                    <div className="h-80 bg-neutral-800/30 rounded flex items-center justify-center">
                      <p className="text-neutral-500">Distribution visualization would go here</p>
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        </div>

      </div>
    </div>
  );
}