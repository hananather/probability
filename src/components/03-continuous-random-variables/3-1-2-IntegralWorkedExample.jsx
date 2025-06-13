"use client";
import React, { useEffect, useRef } from "react";

const IntegralWorkedExample = React.memo(function IntegralWorkedExample({
  distName = "Normal",
  params = [0, 1],
  intervalA = -1,
  intervalB = 1,
  probValue = 0.6827,
  pdfFormula = "\\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}",
  cdfAValue = 0.1587,
  cdfBValue = 0.8413
}) {
  const paramSymbols = {
    normal: ["\\mu", "\\sigma"],
    exponential: ["\\lambda"],
    gamma: ["k", "\\theta"],
    uniform: ["a_0", "b_0"], // Using a_0, b_0 to avoid clash with integral limits a, b
    beta: ["\\alpha", "\\beta"]
  };

  const currentParamSymbols = paramSymbols[distName] || [];
  const paramsString = currentParamSymbols.map((sym, i) => `${sym}=${params[i]?.toFixed(2)}`).join(", ");

  const integralSetup = `P(${intervalA?.toFixed(2)} \\le X \\le ${intervalB?.toFixed(2)}) = \\int_{${intervalA?.toFixed(2)}}^{${intervalB?.toFixed(2)}} f(x; ${paramsString}) dx`;
  
  let specificPdfFormula = pdfFormula;
  // Substitute actual parameter values into the formula if placeholders are used
  // Example for normal: f(x; \\mu, \\sigma) = ...
  if (pdfFormula) {
    currentParamSymbols.forEach((sym, i) => {
      // Regex to replace symbol, ensuring it's not part of a longer word
      const regex = new RegExp(`\\\\${sym.replace('\\', '')}(?!\\w)`, "g");
      specificPdfFormula = specificPdfFormula.replace(regex, params[i]?.toFixed(2));
    });
  }
  
  const cdfCalc = `P(${intervalA?.toFixed(2)} \\le X \\le ${intervalB?.toFixed(2)}) = CDF(${intervalB?.toFixed(2)}) - CDF(${intervalA?.toFixed(2)})`;
  const cdfResult = `= ${cdfBValue?.toFixed(4)} - ${cdfAValue?.toFixed(4)} = ${probValue?.toFixed(4)}`;
  
  const contentRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.MathJax?.typesetPromise && contentRef.current) {
      // Clear and re-process MathJax
      if (window.MathJax.typesetClear) {
        window.MathJax.typesetClear([contentRef.current]);
      }
      window.MathJax.typesetPromise([contentRef.current]).catch((err) => {
        // Silent error: MathJax error in IntegralWorkedExample
      });
    }
  }, [distName, params, intervalA, intervalB, probValue, pdfFormula, cdfAValue, cdfBValue]); // Retypeset when any relevant prop changes

  return (
    <div
      ref={contentRef}
        style={{
          backgroundColor: '#2A303C', // Darker gray, adjust as needed
          padding: '1.5rem',
          borderRadius: '8px',
          color: '#e0e0e0', // Lighter text color
          width: '100%',
          maxWidth: '768px', // md:max-w-3xl
          marginTop: '1.5rem', // space-y-6
          overflowX: 'auto',
          fontFamily: 'var(--font-sans)',
        }}
        className="text-sm"
      >
        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', borderBottom: '1px solid #4A5568', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Integral Calculation Steps
        </h4>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>1. Probability as an Integral:</p>
          <div dangerouslySetInnerHTML={{ __html: `\\[${integralSetup}\\]` }} />
        </div>
        {specificPdfFormula && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>2. Probability Density Function \(f(x)\) for {distName} distribution:</p>
            <div dangerouslySetInnerHTML={{ __html: `\\[f(x; ${paramsString}) = ${specificPdfFormula}\\]` }} />
          </div>
        )}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>3. Using the Cumulative Distribution Function (CDF):</p>
          <div dangerouslySetInnerHTML={{ __html: `\\[${cdfCalc}\\]` }} />
          <div dangerouslySetInnerHTML={{ __html: `\\[${cdfResult}\\]` }} />
        </div>
      </div>
  );
});

export { IntegralWorkedExample }; // Exporting for use