"use client";
import React, { useEffect, useRef } from "react";
import { cn } from '../../lib/utils';

const ExponentialDistributionWorkedExample = React.memo(function ExponentialDistributionWorkedExample({
  lambda = 1,
  t = 1,
  className = ""
}) {
  const contentRef = useRef(null);
  
  // Calculate values
  const pdfValue = lambda * Math.exp(-lambda * t);
  const cdfValue = 1 - Math.exp(-lambda * t);
  const mean = 1 / lambda;
  const variance = 1 / (lambda * lambda);
  const stdDev = Math.sqrt(variance);
  const survivalProb = Math.exp(-lambda * t);
  
  // Use the standard MathJax processing pattern with multiple retries
  useEffect(() => {
    const processMathJax = () => {
      if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
        if (window.MathJax.typesetClear) {
          window.MathJax.typesetClear([contentRef.current]);
        }
        window.MathJax.typesetPromise([contentRef.current]).catch(console.error);
      }
    };
    
    processMathJax(); // Try immediately
    const timeoutId1 = setTimeout(processMathJax, 100); // Retry after 100ms
    const timeoutId2 = setTimeout(processMathJax, 500); // Additional retry after 500ms
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [lambda, t]);
  
  return (
    <div
      ref={contentRef}
      className={cn(
        "bg-gray-800/50 p-6 rounded-xl border border-gray-700",
        "text-sm text-gray-300",
        className
      )}
    >
      <h4 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-3 mb-4">
        Exponential Distribution Calculations
      </h4>
      
      <div className="space-y-4">
        {/* Distribution */}
        <div>
          <p className="font-medium text-gray-200 mb-1">
            1. Distribution: <span dangerouslySetInnerHTML={{ __html: `\\(X \\sim \\text{Exp}(\\lambda = ${lambda})\\)` }} />
          </p>
          <p className="text-xs text-gray-400 ml-4">
            The exponential distribution models waiting times with constant hazard rate λ.
          </p>
        </div>
        
        {/* PDF */}
        <div>
          <p className="font-medium text-gray-200 mb-1">
            2. Probability Density Function (PDF):
          </p>
          <div className="ml-4 my-2" dangerouslySetInnerHTML={{ 
            __html: `$$f(t) = \\lambda e^{-\\lambda t} = ${lambda} e^{-${lambda} \\cdot ${t}} = ${pdfValue.toFixed(4)}$$` 
          }} />
          <p className="text-xs text-gray-400 ml-4">
            for <span dangerouslySetInnerHTML={{ __html: `\\(t \\ge 0\\)` }} />, and <span dangerouslySetInnerHTML={{ __html: `\\(f(t) = 0\\)` }} /> for <span dangerouslySetInnerHTML={{ __html: `\\(t < 0\\)` }} />
          </p>
        </div>
        
        {/* CDF */}
        <div>
          <p className="font-medium text-gray-200 mb-1">
            3. Cumulative Distribution Function (CDF):
          </p>
          <div className="ml-4 my-2" dangerouslySetInnerHTML={{ 
            __html: `$$F(t) = P(T \\le ${t}) = 1 - e^{-\\lambda t} = 1 - e^{-${lambda} \\cdot ${t}} = ${cdfValue.toFixed(4)}$$` 
          }} />
        </div>
        
        {/* Statistics */}
        <div>
          <p className="font-medium text-gray-200 mb-1">
            4. Key Statistics:
          </p>
          <div className="ml-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs text-gray-400">Mean (E[X])</p>
              <p className="font-mono text-emerald-400">1/λ = {mean.toFixed(3)}</p>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs text-gray-400">Variance (Var[X])</p>
              <p className="font-mono text-amber-400">1/λ² = {variance.toFixed(3)}</p>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs text-gray-400">Std Dev (σ)</p>
              <p className="font-mono text-blue-400">1/λ = {stdDev.toFixed(3)}</p>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <p className="text-xs text-gray-400">P(T &gt; {t})</p>
              <p className="font-mono text-purple-400">{survivalProb.toFixed(4)}</p>
            </div>
          </div>
        </div>
        
        {/* Memoryless Property */}
        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/30">
          <p className="font-medium text-blue-300 mb-2 flex items-center gap-2">
            <span className="text-lg">💡</span> Memoryless Property
          </p>
          <p className="text-sm text-blue-200">
            For any <span dangerouslySetInnerHTML={{ __html: `\\(s, t > 0\\)` }} />: 
            <span className="ml-2" dangerouslySetInnerHTML={{ __html: `\\(P(T > s + t | T > s) = P(T > t) = e^{-\\lambda t}\\)` }} />
          </p>
          <p className="text-xs text-blue-200/80 mt-2">
            The probability of waiting an additional time t doesn't depend on how long you've already waited!
          </p>
        </div>
        
        {/* Applications */}
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <p className="font-medium text-gray-200 mb-2 flex items-center gap-2">
            <span className="text-lg">📊</span> Common Applications
          </p>
          <ul className="text-sm text-gray-400 space-y-1 ml-6">
            <li className="list-disc">Time between arrivals at a service center</li>
            <li className="list-disc">Lifetime of electronic components</li>
            <li className="list-disc">Time between radioactive decay events</li>
            <li className="list-disc">Inter-arrival times in a Poisson process</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

export { ExponentialDistributionWorkedExample };
export default ExponentialDistributionWorkedExample;