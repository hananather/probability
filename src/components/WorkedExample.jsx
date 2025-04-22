"use client";

import React, { useEffect } from "react";
import Script from "next/script";

const WorkedExample = React.memo(function WorkedExample({ probs }) {
  // compute true stats
  const trueExpectation = probs.reduce((sum, p, i) => sum + p * (i + 1), 0);
  const trueE2 = probs.reduce((sum, p, i) => sum + p * Math.pow(i + 1, 2), 0);
  const trueVariance = probs.reduce((sum, p, i) => {
    const x = i + 1;
    return sum + p * Math.pow(x - trueExpectation, 2);
  }, 0);

  // format values
  const e1 = trueExpectation.toFixed(1);
  const e2 = trueE2.toFixed(1);
  const varVal = trueVariance.toFixed(1);

  // build LaTeX terms
  const terms = probs.map((p, i) => `${i + 1}\\\cdot${p.toFixed(2)}`).join(" + ");
  const squaredTerms = probs.map((p, i) => `${(i + 1) * (i + 1)}\\\cdot${p.toFixed(2)}`).join(" + ");

  const meanLatex = `\\mu = \\mathbb{E}[X] = \\sum_{i=1}^{6} ${terms} = ${e1}`;
  const ex2Latex = `\\mathbb{E}[X^2] = \\sum_{i=1}^{6} ${squaredTerms} = ${e2}`;
  const varLatex = `\\operatorname{Var}(X) = ${e2} - (${e1})^2 = ${varVal}`;
  const finalLatex = `\\mu = ${e1}, \\quad \\sigma^2 = ${varVal}`;

  // re-typeset on bar probability changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }, [probs]);

  return (
    <>
      <Script
        id="mathjax-script"
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
        strategy="afterInteractive"
        onLoad={() => window.MathJax?.typesetPromise()}
      />
      <div
        style={{
          backgroundColor: '#2d3748',
          padding: '1rem',
          borderRadius: '8px',
          color: '#fff',
          width: '665px',
          marginTop: '1rem',
          overflowX: 'auto',
          wordBreak: 'break-word',
        }}
      >
        <h3 style={{ margin: '0 0 0.5rem' }}>Worked Example</h3>
        <div style={{ margin: '0.5rem 0' }} dangerouslySetInnerHTML={{ __html: `\\[${meanLatex}\\]` }} />
        <div style={{ margin: '0.5rem 0' }} dangerouslySetInnerHTML={{ __html: `\\[${ex2Latex}\\]` }} />
        <div style={{ margin: '0.5rem 0' }} dangerouslySetInnerHTML={{ __html: `\\[${varLatex}\\]` }} />
        <div style={{ margin: '0.5rem 0' }} dangerouslySetInnerHTML={{ __html: `\\[${finalLatex}\\]` }} />
      </div>
    </>
  );
});

export default WorkedExample;
