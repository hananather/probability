"use client";
import React from "react";
import { WorkedExampleContainer, WorkedExampleStep, LaTeXEquation } from "./ui/WorkedExampleContainerV2";

const WorkedExampleV2Test = React.memo(function WorkedExampleV2Test({ probs }) {
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
  const terms = probs.map((p, i) => `${i + 1}\\cdot${p.toFixed(2)}`).join(" + ");
  const squaredTerms = probs.map((p, i) => `${(i + 1) * (i + 1)}\\cdot${p.toFixed(2)}`).join(" + ");

  return (
    <WorkedExampleContainer title="Expected Value and Variance Calculation">
      <WorkedExampleStep stepNumber={1} label="Calculate Expected Value (Mean)">
        <LaTeXEquation 
          equation={`\\mu = \\mathbb{E}[X] = \\sum_{i=1}^{6} ${terms} = ${e1}`} 
        />
      </WorkedExampleStep>

      <WorkedExampleStep stepNumber={2} label="Calculate E[X²]">
        <LaTeXEquation 
          equation={`\\mathbb{E}[X^2] = \\sum_{i=1}^{6} ${squaredTerms} = ${e2}`} 
        />
      </WorkedExampleStep>

      <WorkedExampleStep stepNumber={3} label="Calculate Variance">
        <LaTeXEquation 
          equation={`\\operatorname{Var}(X) = \\mathbb{E}[X^2] - (\\mathbb{E}[X])^2 = ${e2} - (${e1})^2 = ${varVal}`} 
        />
      </WorkedExampleStep>

      <WorkedExampleStep stepNumber={4} label="Final Result">
        <LaTeXEquation 
          equation={`\\mu = ${e1}, \\quad \\sigma^2 = ${varVal}`} 
        />
      </WorkedExampleStep>
    </WorkedExampleContainer>
  );
});

export default WorkedExampleV2Test;