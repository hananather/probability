"use client";
import React, { useEffect } from "react";
import Script from "next/script";

const ExpectationWorkedExample = React.memo(function ExpectationWorkedExample({
  distName,
  distLabel,
  params,
  pdfFormula,
  meanValue
}) {
  const paramSymbols = {
    normal: ["\\mu", "\\sigma"],
    exponential: ["\\lambda"],
    gamma: ["k", "\\theta"],
    uniform: ["a_0", "b_0"],
    beta: ["\\alpha", "\\beta"]
  };

  const currentParamSymbols = paramSymbols[distName] || [];
  const paramsString = currentParamSymbols.map((sym, i) => `${sym}=${params[i]?.toFixed(2)}`).join(", ");

  let specificPdfFormula = pdfFormula;
  if (pdfFormula) {
    currentParamSymbols.forEach((sym, i) => {
      const regex = new RegExp(`\\\\${sym.replace('\\', '')}(?!\\w)`, "g");
      specificPdfFormula = specificPdfFormula.replace(regex, params[i]?.toFixed(2));
    });
  }

  const integralSetup = `\\mu = \\mathbb{E}[X] = \\int_{-\\infty}^{\\infty} x f(x; ${paramsString}) \\; dx`;
  const resultLatex = `${distLabel ? distLabel + ' ' : ''}\\text{mean} = ${meanValue?.toFixed(4)}`;

  useEffect(() => {
    if (typeof window !== "undefined" && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [distName, params, meanValue, pdfFormula]);

  return (
    <>
      <Script
        id="mathjax-script-expect"
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== "undefined" && window.MathJax) {
            window.MathJax.typesetPromise();
          }
        }}
      />
      <div
        style={{
          backgroundColor: '#2A303C',
          padding: '1.5rem',
          borderRadius: '8px',
          color: '#e0e0e0',
          width: '100%',
          maxWidth: '768px',
          marginTop: '1.5rem',
          overflowX: 'auto',
          fontFamily: 'var(--font-sans)',
        }}
        className="text-sm"
      >
        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', borderBottom: '1px solid #4A5568', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Expectation Calculation Steps
        </h4>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>1. Definition:</p>
          <div dangerouslySetInnerHTML={{ __html: `\\[${integralSetup}\\]` }} />
        </div>
        {specificPdfFormula && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>2. Probability Density Function \(f(x)\):</p>
            <div dangerouslySetInnerHTML={{ __html: `\\[f(x; ${paramsString}) = ${specificPdfFormula}\\]` }} />
          </div>
        )}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>3. Result:</p>
          <div dangerouslySetInnerHTML={{ __html: `\\[${resultLatex}\\]` }} />
        </div>
      </div>
    </>
  );
});

export default ExpectationWorkedExample;
