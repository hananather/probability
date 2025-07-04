"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { VisualizationSection } from '../ui/VisualizationContainer';
import { ChevronDown, ChevronUp, Calculator, TrendingUp, BarChart3 } from 'lucide-react';

// Chapter 7 color schemes from the actual codebase
const chapter7Colors = {
  // From 7-5 Analysis of Variance (the palette you love)
  anova: {
    total: '#9ca3af',      // Lighter gray for total
    regression: '#60a5fa', // Vibrant blue for explained
    error: '#f87171',      // Softer red for unexplained
    fStat: '#fbbf24'       // Bright yellow/orange for F-statistic
  },
  // Purple gradient pattern (used extensively in 7-1)
  purple: {
    gradient: 'bg-gradient-to-br from-purple-900/20 to-purple-800/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400'
  },
  // Green interpretation boxes
  interpretation: {
    gradient: 'bg-gradient-to-br from-green-900/20 to-green-800/20',
    border: 'border-green-500/30',
    text: 'text-green-400'
  }
};

// MathJax processing helper
const useMathJax = (dependencies = []) => {
  const ref = useRef(null);
  
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && ref.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([ref.current]);
        }
        window.MathJax.typesetPromise([ref.current]).catch(console.error);
      }
    };
    
    processMathJax();
    const timeoutId = setTimeout(processMathJax, 100);
    return () => clearTimeout(timeoutId);
  }, dependencies);
  
  return ref;
};

// Pattern 1: Purple Gradient Container (from 7-1 Multiple Formula Representation)
function PurpleContainerPattern() {
  const [showDetails, setShowDetails] = useState(false);
  const mathRef = useMathJax([showDetails]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">🟣 Purple Gradient Container Pattern</h3>
      <p className="text-sm text-neutral-400">From Chapter 7.1 - Multiple Formula Representation</p>
      
      {/* The actual pattern */}
      <div className={`${chapter7Colors.purple.gradient} border ${chapter7Colors.purple.border} rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className={`text-lg font-semibold ${chapter7Colors.purple.text}`}>
            Multiple Formula Representations
          </h4>
          <Button
            variant="neutral"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2"
          >
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
        </div>
        
        {showDetails && (
          <div ref={mathRef} className="space-y-4 text-neutral-200">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h5 className="font-semibold text-white mb-2">Conceptual Formula</h5>
                <div className="text-center">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[r = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i - \\bar{x})^2 \\sum(y_i - \\bar{y})^2}}\\]` 
                  }} />
                </div>
              </div>
              <div className="bg-neutral-900/50 rounded-lg p-4">
                <h5 className="font-semibold text-white mb-2">Computational Formula</h5>
                <div className="text-center">
                  <span dangerouslySetInnerHTML={{ 
                    __html: `\\[r = \\frac{S_{xy}}{\\sqrt{S_{xx} \\cdot S_{yy}}}\\]` 
                  }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Code snippet */}
      <div className="bg-neutral-950 rounded-lg p-4 text-xs text-neutral-300 font-mono">
        <div className="text-green-400 mb-2">// The exact CSS classes used:</div>
        <div>className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-6"</div>
      </div>
    </div>
  );
}

// Pattern 2: Green Interpretation Box (from worked examples)
function GreenInterpretationPattern() {
  const mathRef = useMathJax();
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">🟢 Green Interpretation Box Pattern</h3>
      <p className="text-sm text-neutral-400">From Step-by-Step Calculations</p>
      
      {/* The actual pattern */}
      <div className="space-y-3">
        {/* Calculation steps */}
        <div className="bg-neutral-900/50 rounded-lg p-4">
          <h4 className="font-bold text-white mb-3">Step 3: Calculate Correlation</h4>
          <div ref={mathRef} className="text-neutral-300">
            <div className="text-center">
              <span dangerouslySetInnerHTML={{ 
                __html: `\\[r = \\frac{12.47}{\\sqrt{0.389 \\times 168.2}} = \\frac{12.47}{8.07} = 0.846\\]` 
              }} />
            </div>
          </div>
        </div>
        
        {/* Green interpretation box */}
        <div className={`${chapter7Colors.interpretation.gradient} border ${chapter7Colors.interpretation.border} rounded-lg p-4`}>
          <h5 className={`font-semibold ${chapter7Colors.interpretation.text} mb-2 flex items-center gap-2`}>
            <TrendingUp className="w-5 h-5" />
            Interpretation
          </h5>
          <p className="text-neutral-200 text-sm">
            r = 0.846 indicates a <strong>strong positive linear relationship</strong> between specific gravity and heating value. 
            This means that as specific gravity increases, heating value tends to increase as well.
          </p>
        </div>
      </div>
      
      {/* Code snippet */}
      <div className="bg-neutral-950 rounded-lg p-4 text-xs text-neutral-300 font-mono">
        <div className="text-green-400 mb-2">// Green interpretation pattern:</div>
        <div>className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 rounded-lg p-4"</div>
      </div>
    </div>
  );
}

// Pattern 3: ANOVA Color Palette (the one you love)
function ANOVAColorPattern() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">🎨 ANOVA Color Palette Pattern</h3>
      <p className="text-sm text-neutral-400">From Chapter 7.5 - Analysis of Variance</p>
      
      {/* Color swatches */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center">
          <div 
            className="w-full h-16 rounded-lg mb-2 border border-neutral-600"
            style={{ backgroundColor: chapter7Colors.anova.total }}
          ></div>
          <p className="text-xs text-neutral-300 font-mono">{chapter7Colors.anova.total}</p>
          <p className="text-xs text-neutral-400">Total Variation</p>
        </div>
        <div className="text-center">
          <div 
            className="w-full h-16 rounded-lg mb-2 border border-neutral-600"
            style={{ backgroundColor: chapter7Colors.anova.regression }}
          ></div>
          <p className="text-xs text-neutral-300 font-mono">{chapter7Colors.anova.regression}</p>
          <p className="text-xs text-neutral-400">Explained (SSR)</p>
        </div>
        <div className="text-center">
          <div 
            className="w-full h-16 rounded-lg mb-2 border border-neutral-600"
            style={{ backgroundColor: chapter7Colors.anova.error }}
          ></div>
          <p className="text-xs text-neutral-300 font-mono">{chapter7Colors.anova.error}</p>
          <p className="text-xs text-neutral-400">Error (SSE)</p>
        </div>
        <div className="text-center">
          <div 
            className="w-full h-16 rounded-lg mb-2 border border-neutral-600"
            style={{ backgroundColor: chapter7Colors.anova.fStat }}
          ></div>
          <p className="text-xs text-neutral-300 font-mono">{chapter7Colors.anova.fStat}</p>
          <p className="text-xs text-neutral-400">F-Statistic</p>
        </div>
      </div>
      
      {/* Example usage */}
      <div className="bg-neutral-900/50 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          ANOVA Table Example
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: chapter7Colors.anova.regression + '20' }}>
            <span className="text-neutral-200">Regression (SSR)</span>
            <span className="font-mono" style={{ color: chapter7Colors.anova.regression }}>1,247.8</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: chapter7Colors.anova.error + '20' }}>
            <span className="text-neutral-200">Error (SSE)</span>
            <span className="font-mono" style={{ color: chapter7Colors.anova.error }}>89.2</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: chapter7Colors.anova.total + '20' }}>
            <span className="text-neutral-200">Total (SST)</span>
            <span className="font-mono" style={{ color: chapter7Colors.anova.total }}>1,337.0</span>
          </div>
        </div>
      </div>
      
      {/* Code snippet */}
      <div className="bg-neutral-950 rounded-lg p-4 text-xs text-neutral-300 font-mono">
        <div className="text-green-400 mb-2">// Semantic color mapping:</div>
        <div className="space-y-1">
          <div>const anovaColors = {`{`}</div>
          <div className="ml-4">total: '#9ca3af',</div>
          <div className="ml-4">regression: '#60a5fa',</div>
          <div className="ml-4">error: '#f87171',</div>
          <div className="ml-4">fStat: '#fbbf24'</div>
          <div>{`}`};</div>
        </div>
      </div>
    </div>
  );
}

// Pattern 4: Toggle Show/Hide Pattern
function TogglePattern() {
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">🔄 Toggle Show/Hide Pattern</h3>
      <p className="text-sm text-neutral-400">Progressive disclosure pattern used throughout Chapter 7</p>
      
      <div className="space-y-3">
        {/* Example toggles */}
        <div className="flex gap-3">
          <Button
            variant="neutral"
            size="sm"
            onClick={() => setShowWorkedExample(!showWorkedExample)}
            className="flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            {showWorkedExample ? "Hide" : "Show"} Worked Example
          </Button>
          <Button
            variant="neutral"
            size="sm"
            onClick={() => setShowFormulas(!showFormulas)}
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            {showFormulas ? "Hide" : "Show"} Multiple Formulas
          </Button>
        </div>
        
        {/* Conditional content */}
        {showWorkedExample && (
          <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-700">
            <h4 className="font-semibold text-white mb-2">Fuel Quality Analysis</h4>
            <p className="text-neutral-300 text-sm">
              This worked example would show step-by-step calculations with real data...
            </p>
          </div>
        )}
        
        {showFormulas && (
          <div className={`${chapter7Colors.purple.gradient} border ${chapter7Colors.purple.border} rounded-lg p-4`}>
            <h4 className={`font-semibold ${chapter7Colors.purple.text} mb-2`}>Alternative Formulations</h4>
            <p className="text-neutral-300 text-sm">
              Multiple ways to express the same mathematical concept...
            </p>
          </div>
        )}
      </div>
      
      {/* Code snippet */}
      <div className="bg-neutral-950 rounded-lg p-4 text-xs text-neutral-300 font-mono">
        <div className="text-green-400 mb-2">// Progressive disclosure pattern:</div>
        <div className="space-y-1">
          <div>const [showContent, setShowContent] = useState(false);</div>
          <div>// Button with icon and toggle text</div>
          <div>{`{showContent ? "Hide" : "Show"} Content`}</div>
          <div>// Conditional rendering</div>
          <div>{`{showContent && <ContentComponent />}`}</div>
        </div>
      </div>
    </div>
  );
}

// Main showcase component
export function Chapter7Showcase() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Chapter 7 Design Patterns</h1>
        <p className="text-neutral-400">
          The successful patterns from your favorite components - all in one place so we can stop reinventing the wheel
        </p>
      </div>
      
      <div className="space-y-12">
        <PurpleContainerPattern />
        <GreenInterpretationPattern />
        <ANOVAColorPattern />
        <TogglePattern />
      </div>
      
      <div className="mt-12 p-6 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-400 mb-3">🎯 Next Steps</h3>
        <ul className="space-y-2 text-sm text-neutral-300">
          <li>• <strong>Collect more patterns:</strong> Add other successful components to this showcase</li>
          <li>• <strong>Extract abstractions:</strong> Once you see all patterns together, identify the common elements</li>
          <li>• <strong>Create reusable components:</strong> Build standardized versions based on what actually works</li>
          <li>• <strong>Document guidelines:</strong> Turn successful patterns into easy-to-follow rules</li>
        </ul>
      </div>
    </div>
  );
}