"use client";
import React, { useEffect, useRef } from "react";
import { useSafeMathJax } from '../../../utils/mathJaxFix';

const NormalZScoreWorkedExample = React.memo(function NormalZScoreWorkedExample({ 
  mu = 100, 
  sigma = 15, 
  xValue = 115, 
  zScore = 1, 
  probability = 0.8413 
}) {
  const contentRef = useRef(null);
  
  // Use safe MathJax processing with error handling
  useSafeMathJax(contentRef, [mu, sigma, xValue, zScore, probability]);
  
  return (
    <div ref={contentRef} style={{
      backgroundColor: '#2A303C',
      padding: '1.5rem',
      borderRadius: '8px',
      color: '#e0e0e0',
      fontSize: '0.875rem',
      marginTop: '1.5rem'
    }}>
      <h4 style={{ 
        fontSize: '1.125rem', 
        fontWeight: '600', 
        borderBottom: '1px solid #4A5568', 
        paddingBottom: '0.5rem', 
        marginBottom: '1rem' 
      }}>
        Standardizing X to Z & Finding Probability
      </h4>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          1. Given:
        </p>
        <p style={{ marginLeft: '1rem' }}>
          We have <span dangerouslySetInnerHTML={{ __html: `\\(X \\sim N(\\mu=${mu}, \\sigma=${sigma})\\)` }} />. 
          We want to find <span dangerouslySetInnerHTML={{ __html: `\\(P(X \\leq ${xValue.toFixed(1)})\\)` }} />.
        </p>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          2. Z-Score Formula:
        </p>
        <div dangerouslySetInnerHTML={{ __html: `\\[Z = \\frac{X - \\mu}{\\sigma}\\]` }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          3. Calculate Z-Score for <span dangerouslySetInnerHTML={{ __html: `\\(x = ${xValue.toFixed(1)}\\)` }} />:
        </p>
        <div dangerouslySetInnerHTML={{ 
          __html: `\\[z = \\frac{${xValue.toFixed(1)} - ${mu}}{${sigma}} = \\frac{${(xValue - mu).toFixed(1)}}{${sigma}} = ${zScore.toFixed(4)}\\]` 
        }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          4. Probability Equivalence:
        </p>
        <div dangerouslySetInnerHTML={{ 
          __html: `\\[P(X \\leq ${xValue.toFixed(1)}) = P(Z \\leq ${zScore.toFixed(4)})\\]` 
        }} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          5. Using Standard Normal CDF <span dangerouslySetInnerHTML={{ __html: `\\(\\Phi(z)\\)` }} />:
        </p>
        <div dangerouslySetInnerHTML={{ 
          __html: `\\[= \\Phi(${zScore.toFixed(4)}) = ${probability.toFixed(4)}\\]` 
        }} />
      </div>
      
      <div style={{ 
        marginTop: '1rem', 
        padding: '0.75rem', 
        backgroundColor: '#1F2937', 
        borderRadius: '4px',
        borderLeft: '3px solid #6366F1'
      }}>
        <p style={{ fontSize: '0.8125rem', fontStyle: 'italic' }}>
          Interpretation: The value <span dangerouslySetInnerHTML={{ __html: `\\(x = ${xValue.toFixed(1)}\\)` }} /> is {Math.abs(zScore).toFixed(2)} standard deviations 
          {zScore >= 0 ? ' above' : ' below'} the mean. 
          {probability < 0.5 
            ? ` Only ${(probability * 100).toFixed(1)}% of values fall below this point.`
            : ` ${(probability * 100).toFixed(1)}% of values fall below this point.`
          }
        </p>
      </div>
    </div>
  );
});

export default NormalZScoreWorkedExample;