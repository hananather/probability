'use client';

import React, { useState, useRef } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { VisualizationContainer } from '../../ui/VisualizationContainer';
import { useMathJax } from '@/hooks/useMathJax';

// LaTeX formula component
const LaTeXFormula = React.memo(function LaTeXFormula({ formula, isBlock = false }) {
  const contentRef = useMathJax([formula]);
  
  if (isBlock) {
    return (
      <div ref={contentRef} className="text-center my-2">
        <div dangerouslySetInnerHTML={{ __html: `\\[${formula}\\]` }} />
      </div>
    );
  }
  
  return (
    <span ref={contentRef}>
      <span dangerouslySetInnerHTML={{ __html: `\\(${formula}\\)` }} />
    </span>
  );
});

const JointDistributions = () => {
  const [distribution, setDistribution] = useState('bivariate-normal');
  
  // Use safe MathJax processing
  const contentRef = useMathJax([distribution]);


  return (
    <div ref={contentRef}>
      <div className="space-y-6">
        {/* Distribution selector */}
        <div className="flex flex-wrap gap-3 justify-center">
            <Button
              onClick={() => setDistribution('bivariate-normal')}
              variant={distribution === 'bivariate-normal' ? "default" : "outline"}
              size="sm"
            >
              Bivariate Normal
            </Button>
            <Button
              onClick={() => setDistribution('uniform')}
              variant={distribution === 'uniform' ? "default" : "outline"}
              size="sm"
            >
              Uniform
            </Button>
            <Button
              onClick={() => setDistribution('exponential')}
              variant={distribution === 'exponential' ? "default" : "outline"}
              size="sm"
            >
              Exponential
            </Button>
          </div>

          {/* Joint Distribution Formula */}
          <Card className="p-4 bg-neutral-900 border-neutral-700">
            <h4 className="text-sm font-semibold mb-3 text-blue-400">
              {distribution === 'bivariate-normal' && 'Bivariate Normal Distribution'}
              {distribution === 'uniform' && 'Joint Uniform Distribution'}
              {distribution === 'exponential' && 'Joint Exponential Distribution'}
            </h4>
            
            {distribution === 'bivariate-normal' && (
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-semibold text-neutral-400 mb-2">Joint PDF:</h5>
                  <LaTeXFormula 
                    formula={`f_{X,Y}(x,y) = \\frac{1}{2\\pi\\sqrt{1-\\rho^2}} \\exp\\left(-\\frac{1}{2(1-\\rho^2)}[x^2 - 2\\rho xy + y^2]\\right)`}
                    isBlock={true}
                  />
                  <div className="mt-2 text-xs text-neutral-400">
                    Standard bivariate normal with correlation coefficient ρ
                  </div>
                </div>
                
                <div className="border-t border-neutral-700 pt-3">
                  <h5 className="text-xs font-semibold text-neutral-400 mb-2">Marginal Distributions:</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <LaTeXFormula formula={`f_X(x) = \\frac{1}{\\sqrt{2\\pi}} e^{-x^2/2}`} isBlock={true} />
                      <p className="text-xs text-neutral-500 mt-1">X ~ N(0,1)</p>
                    </div>
                    <div>
                      <LaTeXFormula formula={`f_Y(y) = \\frac{1}{\\sqrt{2\\pi}} e^{-y^2/2}`} isBlock={true} />
                      <p className="text-xs text-neutral-500 mt-1">Y ~ N(0,1)</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-neutral-700 pt-3">
                  <h5 className="text-xs font-semibold text-neutral-400 mb-2">Conditional Distribution:</h5>
                  <LaTeXFormula 
                    formula={`f_{Y|X}(y|x) = \\frac{1}{\\sqrt{2\\pi(1-\\rho^2)}} \\exp\\left(-\\frac{(y-\\rho x)^2}{2(1-\\rho^2)}\\right)`}
                    isBlock={true}
                  />
                  <p className="text-xs text-neutral-500 mt-1">Y|X=x ~ N(ρx, 1-ρ²)</p>
                </div>
              </div>
            )}
            
            {distribution === 'uniform' && (
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-semibold text-neutral-400 mb-2">Joint PDF:</h5>
                  <LaTeXFormula 
                    formula={`f_{X,Y}(x,y) = \\begin{cases} \\frac{1}{4} & \\text{if } 0 \\leq x \\leq 2, 0 \\leq y \\leq 2 \\\\ 0 & \\text{otherwise} \\end{cases}`}
                    isBlock={true}
                  />
                  <div className="mt-2 text-xs text-neutral-400">
                    Independent uniform random variables on [0,2] × [0,2]
                  </div>
                </div>
                
                <div className="border-t border-neutral-700 pt-3">
                  <h5 className="text-xs font-semibold text-neutral-400 mb-2">Marginal Distributions:</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <LaTeXFormula formula={`f_X(x) = \\begin{cases} \\frac{1}{2} & 0 \\leq x \\leq 2 \\\\ 0 & \\text{otherwise} \\end{cases}`} isBlock={true} />
                      <p className="text-xs text-neutral-500 mt-1">X ~ Uniform(0,2)</p>
                    </div>
                    <div>
                      <LaTeXFormula formula={`f_Y(y) = \\begin{cases} \\frac{1}{2} & 0 \\leq y \\leq 2 \\\\ 0 & \\text{otherwise} \\end{cases}`} isBlock={true} />
                      <p className="text-xs text-neutral-500 mt-1">Y ~ Uniform(0,2)</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-neutral-700 pt-3">
                  <h5 className="text-xs font-semibold text-neutral-400 mb-2">Independence Property:</h5>
                  <LaTeXFormula 
                    formula={`f_{X,Y}(x,y) = f_X(x) \\cdot f_Y(y) = \\frac{1}{2} \\cdot \\frac{1}{2} = \\frac{1}{4}`}
                    isBlock={true}
                  />
                  <p className="text-xs text-neutral-500 mt-1">X and Y are independent</p>
                </div>
              </div>
            )}
            
            {distribution === 'exponential' && (
              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-semibold text-neutral-400 mb-2">Joint PDF:</h5>
                  <LaTeXFormula 
                    formula={`f_{X,Y}(x,y) = \\lambda_1 \\lambda_2 e^{-\\lambda_1 x - \\lambda_2 y}, \\quad x \\geq 0, y \\geq 0`}
                    isBlock={true}
                  />
                  <div className="mt-2 text-xs text-neutral-400">
                    Independent exponential random variables with rates λ₁ and λ₂
                  </div>
                </div>
                
                <div className="border-t border-neutral-700 pt-3">
                  <h5 className="text-xs font-semibold text-neutral-400 mb-2">Marginal Distributions:</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <LaTeXFormula formula={`f_X(x) = \\lambda_1 e^{-\\lambda_1 x}, \\quad x \\geq 0`} isBlock={true} />
                      <p className="text-xs text-neutral-500 mt-1">X ~ Exp(λ₁)</p>
                    </div>
                    <div>
                      <LaTeXFormula formula={`f_Y(y) = \\lambda_2 e^{-\\lambda_2 y}, \\quad y \\geq 0`} isBlock={true} />
                      <p className="text-xs text-neutral-500 mt-1">Y ~ Exp(λ₂)</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-neutral-700 pt-3">
                  <h5 className="text-xs font-semibold text-neutral-400 mb-2">Independence Property:</h5>
                  <LaTeXFormula 
                    formula={`f_{X,Y}(x,y) = f_X(x) \\cdot f_Y(y) = \\lambda_1 e^{-\\lambda_1 x} \\cdot \\lambda_2 e^{-\\lambda_2 y}`}
                    isBlock={true}
                  />
                  <p className="text-xs text-neutral-500 mt-1">X and Y are independent</p>
                </div>
              </div>
            )}
          </Card>

          {/* Key concepts */}
          <Card className="p-4 bg-neutral-900 border-neutral-700">
            <h4 className="text-sm font-semibold mb-2">Key Concepts</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-blue-400">Marginal distributions:</span> 
                <LaTeXFormula formula={`f_X(x) = \\int_{-\\infty}^{\\infty} f_{X,Y}(x,y) dy`} />
              </div>
              <div>
                <span className="text-green-400">Conditional distribution:</span> 
                <LaTeXFormula formula={`f_{Y|X}(y|x) = \\frac{f_{X,Y}(x,y)}{f_X(x)}`} />
              </div>
              <div>
                <span className="text-purple-400">Independence:</span> 
                <LaTeXFormula formula={`f_{X,Y}(x,y) = f_X(x)f_Y(y)`} /> when X and Y are independent
              </div>
              <div>
                <span className="text-yellow-400">Correlation:</span> 
                For bivariate normal, ρ = 0 implies independence
              </div>
            </div>
          </Card>
      </div>
    </div>
  );
};

export default JointDistributions;