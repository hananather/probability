"use client";
import React, { useState } from 'react';
import { Chapter5ReferenceSheet, EstimationFormulasOnly, ConfidenceIntervalsReference } from './Chapter5ReferenceSheet';
import { BookOpen, Calculator, FileText, Layers } from 'lucide-react';

/**
 * Showcase component to demonstrate the Chapter 5 Reference Sheet
 * Shows different display modes and variations
 */
export function ReferenceSheetShowcase() {
  const [activeMode, setActiveMode] = useState('embedded');

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Chapter 5: Estimation Reference Sheet
          </h1>
          <p className="text-lg text-neutral-400 max-w-3xl mx-auto">
            A comprehensive quick reference containing all formulas, procedures, critical values, 
            and key concepts from Chapter 5. Perfect for studying, homework, and exam preparation.
          </p>
        </div>

        {/* Display Mode Selector */}
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
          <h2 className="text-xl font-semibold text-white mb-4">Display Mode Options</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveMode('embedded')}
              className={`p-4 rounded-lg border transition-all ${
                activeMode === 'embedded'
                  ? 'bg-blue-900/30 border-blue-500 text-blue-400'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <FileText className="w-6 h-6 mb-2 mx-auto" />
              <div className="font-semibold">Embedded Mode</div>
              <p className="text-sm mt-1">Always visible on page</p>
            </button>

            <button
              onClick={() => setActiveMode('inline')}
              className={`p-4 rounded-lg border transition-all ${
                activeMode === 'inline'
                  ? 'bg-blue-900/30 border-blue-500 text-blue-400'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <Layers className="w-6 h-6 mb-2 mx-auto" />
              <div className="font-semibold">Inline Mode</div>
              <p className="text-sm mt-1">Collapsible accordion</p>
            </button>

            <button
              onClick={() => setActiveMode('floating')}
              className={`p-4 rounded-lg border transition-all ${
                activeMode === 'floating'
                  ? 'bg-blue-900/30 border-blue-500 text-blue-400'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <BookOpen className="w-6 h-6 mb-2 mx-auto" />
              <div className="font-semibold">Floating Mode</div>
              <p className="text-sm mt-1">Fixed button (bottom-right)</p>
            </button>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/30">
            <h3 className="font-semibold text-emerald-400 mb-2">12 Sections</h3>
            <p className="text-sm text-neutral-300">
              Complete coverage of all Chapter 5 topics
            </p>
          </div>
          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
            <h3 className="font-semibold text-purple-400 mb-2">All Formulas</h3>
            <p className="text-sm text-neutral-300">
              Every formula with LaTeX rendering
            </p>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
            <h3 className="font-semibold text-yellow-400 mb-2">Critical Values</h3>
            <p className="text-sm text-neutral-300">
              z and t values for common confidence levels
            </p>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <h3 className="font-semibold text-blue-400 mb-2">Step-by-Step</h3>
            <p className="text-sm text-neutral-300">
              Clear procedures for every method
            </p>
          </div>
        </div>

        {/* Main Display */}
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
          <h2 className="text-xl font-semibold text-white mb-4">
            {activeMode === 'embedded' && 'Full Reference Sheet (Always Visible)'}
            {activeMode === 'inline' && 'Collapsible Reference Sheet'}
            {activeMode === 'floating' && 'Floating Reference (Look for button in bottom-right)'}
          </h2>

          {/* Render based on selected mode */}
          {activeMode === 'embedded' && (
            <Chapter5ReferenceSheet mode="embedded" />
          )}

          {activeMode === 'inline' && (
            <div className="space-y-4">
              <Chapter5ReferenceSheet mode="inline" />
            </div>
          )}

          {activeMode === 'floating' && (
            <>
              <Chapter5ReferenceSheet mode="floating" />
              <div className="p-8 bg-neutral-800/50 rounded-lg text-center">
                <p className="text-neutral-400">
                  The floating reference sheet appears as a fixed button in the bottom-right corner.
                </p>
                <p className="text-neutral-400 mt-2">
                  Click the purple sticky note button to open it!
                </p>
              </div>
            </>
          )}
        </div>

        {/* Alternative Versions */}
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
          <h2 className="text-xl font-semibold text-white mb-4">Alternative Versions</h2>
          <p className="text-neutral-400 mb-6">
            Specialized reference sheets for specific topics within Chapter 5:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-3">
                Formulas Only Version
              </h3>
              <EstimationFormulasOnly mode="inline" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-3">
                Confidence Intervals Focus
              </h3>
              <ConfidenceIntervalsReference mode="inline" />
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-6 border border-blue-500/30">
          <h2 className="text-xl font-semibold text-blue-400 mb-4">
            How to Use in Your Components
          </h2>
          <div className="bg-neutral-900 rounded p-4 font-mono text-sm text-green-400 overflow-x-auto">
            <pre>{`// Import the reference sheet
import { Chapter5ReferenceSheet } from '@/components/reference-sheets/Chapter5ReferenceSheet';

// Add to any Chapter 5 page
function YourComponent() {
  return (
    <>
      {/* Floating button in corner */}
      <Chapter5ReferenceSheet mode="floating" />
      
      {/* Your component content */}
      <YourContent />
    </>
  );
}`}</pre>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
          <h2 className="text-xl font-semibold text-white mb-4">Benefits for Students</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-emerald-400">Quick Access</h4>
                  <p className="text-sm text-neutral-400">
                    All formulas and procedures in one place
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-purple-400">Study Aid</h4>
                  <p className="text-sm text-neutral-400">
                    Perfect companion while doing homework
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-blue-400">Exam Prep</h4>
                  <p className="text-sm text-neutral-400">
                    Everything you need to memorize
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-yellow-400">Decision Guide</h4>
                  <p className="text-sm text-neutral-400">
                    Clear guidance on which method to use
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-red-400">Avoid Mistakes</h4>
                  <p className="text-sm text-neutral-400">
                    Common errors clearly highlighted
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-green-400">Proper Interpretation</h4>
                  <p className="text-sm text-neutral-400">
                    Correct vs wrong interpretations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReferenceSheetShowcase;